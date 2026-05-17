/**
 * Data-driven FAQ JSON-LD generator for destination pages.
 *
 * Symmetric to passportFaqGenerator but answers "who can enter this
 * destination" questions instead of "where can this passport go". Adds
 * conditional questions for ETIAS / EES (Schengen members), UK ETA (GB),
 * K-ETA (KR), GCC unified visa (GCC members), CARICOM/Mercosur, and a
 * destination-specific advisory question when an obstacle is flagged.
 */
import type { CoverageSnapshot, OriginSummaryForDestination } from "@/lib/coverage";
import type { Obstacle } from "@/content/obstacles";
import { blocsFor } from "@/lib/blocs";
import { nameFor, TOP_ORIGINS } from "@/lib/countries";

export type DestinationFaqInput = {
  iso2: string;
  name: string;
  coverage: CoverageSnapshot | null;
  summaries: OriginSummaryForDestination[];
  obstacles: Obstacle[];
};

export type FaqEntry = {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
};

export function buildDestinationFaqs(input: DestinationFaqInput): FaqEntry[] {
  const { iso2, name, coverage, summaries, obstacles } = input;
  const upper = iso2.toUpperCase();
  const blocs = blocsFor(upper).map((b) => b.id);

  const openCount = coverage
    ? coverage.byStatus.visa_free + coverage.byStatus.visa_free_with_eta
    : null;
  const totalCovered = coverage?.totalDestinationsCovered ?? 0;

  const destObstacle = obstacles.find(
    (o) => o.appliesTo.kind === "destination" && o.appliesTo.iso === upper,
  );

  const faqs: FaqEntry[] = [];

  // 1. Always — openness count.
  faqs.push({
    "@type": "Question",
    name: `How many nationalities can visit ${name} visa-free?`,
    acceptedAnswer: {
      "@type": "Answer",
      text:
        openCount !== null && totalCovered > 0
          ? `Approximately ${openCount} of the ${totalCovered} passports we track enter ${name} visa-free or with only an electronic travel authorisation (eTA). The remaining nationalities apply through an embassy or e-Visa portal in advance — the directory on this page lists current rules for every passport.`
          : `Visa policy is bilateral and changes regularly. The directory on this page lists current requirements for every passport.`,
    },
  });

  // 2. Always (where data exists) — name a specific major origin's status.
  const namedOriginQ = specificOriginQuestion(upper, name, summaries);
  if (namedOriginQ) faqs.push(namedOriginQ);

  // 3. Conditional — Schengen / ETIAS / EES.
  if (blocs.includes("schengen")) {
    faqs.push({
      "@type": "Question",
      name: `Do I need an ETIAS authorisation to visit ${name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `From late 2026, visa-exempt nationals (US, UK, Canada, Australia, Japan, etc.) need an ETIAS authorisation before travel to ${name} and other Schengen Area states. €7 fee, valid 3 years or until passport expiry, multiple-entry. The EU Entry/Exit System (EES) records every Schengen entry biometrically from late 2025 and enforces the 90-in-180-day rule automatically.`,
      },
    });
  }

  // 4. Conditional — UK ETA (only for GB).
  if (upper === "GB") {
    faqs.push({
      "@type": "Question",
      name: `Do I need a UK ETA to visit the United Kingdom?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes — most visa-exempt nationalities (US, EU members, Canada, Australia, NZ, Japan, South Korea, Singapore, GCC nationals) require the UK Electronic Travel Authorisation (ETA) before boarding. £10, 2-year validity, multiple-entry. Apply at gov.uk; airlines deny boarding without it.`,
      },
    });
  }

  // 5. Conditional — K-ETA (only for KR).
  if (upper === "KR") {
    faqs.push({
      "@type": "Question",
      name: `Do I need a K-ETA to visit South Korea?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes — most visa-exempt nationalities require the K-ETA (Korea Electronic Travel Authorisation) before boarding. KRW 10,000, 3-year validity, multiple-entry. Apply at k-eta.go.kr at least 72 hours before travel; airlines deny boarding without it.`,
      },
    });
  }

  // 6. Conditional — GCC unified visa & reciprocity (for GCC members).
  if (blocs.includes("gcc")) {
    faqs.push({
      "@type": "Question",
      name: `Do GCC nationals need a visa to visit ${name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `No. Under GCC reciprocity, nationals of Bahrain, Kuwait, Oman, Qatar, Saudi Arabia and the UAE enter ${name} without a visa and may reside and work as nationals. The rolling-out unified GCC tourist visa additionally streamlines inbound tourism from Tier-1 nationalities across 2024–2026.`,
      },
    });
  }

  // 7. Conditional — Mercosur (for Mercosur full members).
  if (blocs.includes("mercosur")) {
    faqs.push({
      "@type": "Question",
      name: `Can nationals of other Mercosur countries live in ${name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. Under the Mercosur Residency Agreement, nationals of Argentina, Brazil, Paraguay and Uruguay (plus associated states) can apply for temporary and permanent residency in ${name} with simplified documentation.`,
      },
    });
  }

  // 8. Conditional — CARICOM (for CSME members).
  if (blocs.includes("caricom")) {
    faqs.push({
      "@type": "Question",
      name: `Can CARICOM nationals live and work in ${name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. Under the CARICOM Single Market and Economy, nationals of the 12 CSME member states have free movement and the right to work in ${name}. A CARICOM Skills Certificate may be required for certain occupational categories.`,
      },
    });
  }

  // 9. Conditional — destination-level advisory.
  if (destObstacle) {
    faqs.push({
      "@type": "Question",
      name: `Are there current advisories for travel to ${name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${truncate(destObstacle.body, 280)} Always check current FCDO / US State Department advisories before booking.`,
      },
    });
  }

  return faqs.slice(0, 6);
}

// ---------------------------------------------------------------------------

function specificOriginQuestion(
  upper: string,
  name: string,
  summaries: OriginSummaryForDestination[],
): FaqEntry | null {
  // Pick a top-major origin and answer "does {origin} need a visa for {name}?".
  const candidate = summaries
    .filter((s) => s.passportIso2 !== upper)
    .map((s) => ({ ...s, score: originScore(s.passportIso2) }))
    .sort((a, b) => b.score - a.score)[0];
  if (!candidate) return null;

  const originName = nameFor(candidate.passportIso2);
  const stay = candidate.maxStayDays ? ` for stays up to ${candidate.maxStayDays} days` : "";

  if (candidate.status === "visa_free" || candidate.status === "visa_free_with_eta") {
    const etaSuffix = candidate.status === "visa_free_with_eta"
      ? ` An electronic travel authorisation is required before boarding.`
      : "";
    return {
      "@type": "Question",
      name: `Do ${originName} citizens need a visa for ${name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `No. ${originName} passport holders enter ${name} without a prior visa${stay}.${etaSuffix}`,
      },
    };
  }
  if (candidate.status === "visa_on_arrival") {
    return {
      "@type": "Question",
      name: `Can ${originName} citizens get a visa on arrival in ${name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. ${originName} passport holders may obtain a visa on arrival in ${name}${stay}. See the route page for the current fee and accepted payment methods.`,
      },
    };
  }
  return {
    "@type": "Question",
    name: `Do ${originName} citizens need a visa for ${name}?`,
    acceptedAnswer: {
      "@type": "Answer",
      text: `Yes. ${originName} passport holders require a visa for travel to ${name}. The route page for this nationality lists the current category, fee, processing time and application portal.`,
    },
  };
}

function originScore(iso2: string): number {
  const topIdx = TOP_ORIGINS.indexOf(iso2);
  if (topIdx >= 0) return 1000 - topIdx;
  return 100;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const lastPeriod = cut.lastIndexOf(". ");
  return lastPeriod > 100 ? cut.slice(0, lastPeriod + 1) : cut.replace(/[,;:\s]+$/, "") + "…";
}
