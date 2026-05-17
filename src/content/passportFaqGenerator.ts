/**
 * Data-driven FAQ JSON-LD generator for passport pages.
 *
 * Replaces the previous Mad-Libs FAQ (every passport rendered the same 4 Qs
 * with only the country name swapped) with a conditional set of 4–6 questions
 * whose subject and content reflect the passport's actual profile:
 *
 *   - eTA distinction question only when the passport has eTA-required routes
 *   - EU / Schengen / GCC / Mercosur / CPLP / Commonwealth questions only for
 *     member states
 *   - Sanctioned-passport advisory question only when an obstacle entry exists
 *   - At least one Q names a real top destination this passport reaches
 *     visa-free (or, for restricted passports, a real top destination it
 *     can't reach without a visa)
 */
import type { CoverageSnapshot, DestinationSummaryForPassport } from "@/lib/coverage";
import type { Obstacle } from "@/content/obstacles";
import { blocsFor } from "@/lib/blocs";
import { nameFor, TOP_DESTINATIONS } from "@/lib/countries";

export type PassportFaqInput = {
  iso2: string;
  name: string;
  adjective: string;
  coverage: CoverageSnapshot | null;
  summaries: DestinationSummaryForPassport[];
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

export function buildPassportFaqs(input: PassportFaqInput): FaqEntry[] {
  const { iso2, name, adjective, coverage, summaries, obstacles } = input;
  const upper = iso2.toUpperCase();
  const blocs = blocsFor(upper).map((b) => b.id);

  const visaFreeCount = coverage
    ? coverage.byStatus.visa_free + coverage.byStatus.visa_free_with_eta
    : null;
  const totalCovered = coverage?.totalDestinationsCovered ?? 0;
  const hasEtaRoutes = coverage ? coverage.byStatus.visa_free_with_eta > 0 : false;

  const passportObstacle = obstacles.find(
    (o) => o.appliesTo.kind === "passport" && o.appliesTo.iso === upper,
  );

  const faqs: FaqEntry[] = [];

  // 1. Always — the core mobility count.
  faqs.push({
    "@type": "Question",
    name: `How many countries can ${name} passport holders visit visa-free?`,
    acceptedAnswer: {
      "@type": "Answer",
      text:
        visaFreeCount !== null && totalCovered > 0
          ? `${name} passport holders can enter approximately ${visaFreeCount} of the ${totalCovered} destinations we currently track without a prior visa or with only an electronic travel authorisation (eTA). The remaining destinations require an embassy-issued visa or e-Visa applied for in advance — figures update as our sources publish changes.`
          : `Visa-free access depends on bilateral agreements and policy changes. The ${adjective} passport directory on this page lists current requirements for every destination we cover.`,
    },
  });

  // 2. Always — name a specific reachable top destination (or, for restricted
  // passports, a top destination they can't reach without a visa).
  const namedDestQ = specificDestinationQuestion(upper, name, adjective, summaries);
  if (namedDestQ) faqs.push(namedDestQ);

  // 3. Conditional — eTA distinction, only when this passport has eTA routes.
  if (hasEtaRoutes) {
    faqs.push({
      "@type": "Question",
      name: `What's the difference between visa-free and visa-free with an eTA for ${adjective} citizens?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Visa-free means no advance authorisation is required before boarding. Visa-free with an eTA means you don't need a traditional visa, but you must obtain an electronic travel authorisation — examples relevant to ${adjective} travellers include ESTA (United States), eTA (Canada), ETA (United Kingdom / Australia), and K-ETA (South Korea). Airlines will deny boarding without it; apply 72 hours ahead at minimum.`,
      },
    });
  }

  // 4. Conditional — EU / EEA / Schengen membership.
  if (blocs.includes("eu") && blocs.includes("schengen")) {
    faqs.push({
      "@type": "Question",
      name: `Can ${name} citizens live and work anywhere in the European Union?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. As ${name} is an EU and Schengen member state, ${adjective} citizens have full freedom of movement, residence, and labour-market access across all 27 EU member states plus the wider Schengen Area. No work permit is required to take a job in any EU member state.`,
      },
    });
  } else if (blocs.includes("eea")) {
    faqs.push({
      "@type": "Question",
      name: `Can ${name} citizens live and work in the European Union?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. ${name} is an EEA member outside the EU, which grants ${adjective} citizens single-market labour and residence rights across all 27 EU member states under the EEA Agreement.`,
      },
    });
  } else if (blocs.includes("eu")) {
    faqs.push({
      "@type": "Question",
      name: `Can ${name} citizens live and work in the European Union?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. As an EU member state national, ${adjective} citizens have full freedom of movement, residence, and labour-market access across all 27 member states.`,
      },
    });
  }

  // 5. Conditional — GCC bloc.
  if (blocs.includes("gcc")) {
    faqs.push({
      "@type": "Question",
      name: `Do ${name} citizens need visas to work in other GCC countries?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `No. GCC reciprocity grants ${adjective} nationals the right to enter, reside, and work across Bahrain, Kuwait, Oman, Qatar, Saudi Arabia, and the United Arab Emirates without a work permit. The rolling-out unified GCC tourist visa additionally streamlines inbound tourism from Tier-1 nationalities across 2024–2026.`,
      },
    });
  }

  // 6. Conditional — Mercosur.
  if (blocs.includes("mercosur")) {
    faqs.push({
      "@type": "Question",
      name: `Can ${name} citizens live and work in other Mercosur countries?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. The Mercosur Residency Agreement grants ${adjective} nationals streamlined temporary and permanent residence rights across Argentina, Brazil, Paraguay, and Uruguay, with associated-state extensions to Bolivia, Chile, Colombia, Ecuador, and Peru. Documentation and proof of clean criminal record are typically all that's required.`,
      },
    });
  }

  // 7. Conditional — CPLP (Portuguese-speaking framework).
  if (blocs.includes("cplp")) {
    faqs.push({
      "@type": "Question",
      name: `Do ${name} citizens get preferential rights to live in Portugal?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. As a CPLP member, ${name} nationals can use the 2021 CPLP Mobility Agreement framework for streamlined residence in Portugal, including the CPLP residence permit and simplified citizenship pathways. Portuguese-language proficiency requirements are reduced for CPLP applicants.`,
      },
    });
  }

  // 8. Conditional — ECOWAS.
  if (blocs.includes("ecowas")) {
    faqs.push({
      "@type": "Question",
      name: `Can ${name} citizens live and work across West Africa under ECOWAS?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. The ECOWAS Protocol on Free Movement allows ${adjective} citizens to enter, reside, and establish businesses across all 15 ECOWAS member states without a visa. Identification is typically by national ID card or ECOWAS passport.`,
      },
    });
  }

  // 9. Conditional — CARICOM.
  if (blocs.includes("caricom")) {
    faqs.push({
      "@type": "Question",
      name: `Can ${name} citizens live and work across CARICOM countries?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. The CARICOM Single Market and Economy grants ${adjective} citizens free movement and the right to work across the 12 CSME member states (most CARICOM members; Bahamas and Haiti are CARICOM but outside CSME). A skills certificate may be required for certain occupational categories.`,
      },
    });
  }

  // 10. Conditional — sanctioned / advisory-flagged passports.
  if (passportObstacle) {
    faqs.push({
      "@type": "Question",
      name: `What current advisories affect ${adjective} passport applications?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${truncate(passportObstacle.body, 280)} Always check the current advisory on the destination's official immigration site before applying.`,
      },
    });
  }

  // Cap at 6 FAQs total — JSON-LD past that becomes noise and Google
  // truncates the rich-result eligibility window.
  return faqs.slice(0, 6);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function specificDestinationQuestion(
  upper: string,
  name: string,
  adjective: string,
  summaries: DestinationSummaryForPassport[],
): FaqEntry | null {
  // Pick a top destination this passport reaches visa-free. Skip the home
  // country. Prefer well-known landmarks. Falls back to a "can {name} citizens
  // travel to Japan visa-free?" framing in either direction.
  const openSummary = summaries
    .filter((s) => s.destinationIso2 !== upper && (s.status === "visa_free" || s.status === "visa_free_with_eta"))
    .map((s) => ({ ...s, score: landmarkScore(s.destinationIso2) }))
    .sort((a, b) => b.score - a.score)[0];

  if (openSummary) {
    const destName = nameFor(openSummary.destinationIso2);
    const stay = openSummary.maxStayDays ? ` for stays up to ${openSummary.maxStayDays} days` : "";
    const etaSuffix = openSummary.status === "visa_free_with_eta"
      ? ` Note that an electronic travel authorisation must be obtained before boarding.`
      : "";
    return {
      "@type": "Question",
      name: `Can ${name} citizens enter ${destName} visa-free?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. ${adjective} passport holders enter ${destName} without a prior visa${stay}.${etaSuffix}`,
      },
    };
  }

  // No visa-free landmarks — pick a top embassy-required destination instead
  // and explain what applies.
  const embassySummary = summaries
    .filter((s) => s.destinationIso2 !== upper && s.status === "embassy_visa")
    .map((s) => ({ ...s, score: landmarkScore(s.destinationIso2) }))
    .sort((a, b) => b.score - a.score)[0];
  if (embassySummary) {
    const destName = nameFor(embassySummary.destinationIso2);
    return {
      "@type": "Question",
      name: `Do ${name} citizens need a visa for ${destName}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. ${adjective} passport holders require an embassy-issued visa for travel to ${destName}. The route page for ${destName} lists current fees, processing times, and the application portal.`,
      },
    };
  }
  return null;
}

function landmarkScore(iso2: string): number {
  const topIdx = TOP_DESTINATIONS.indexOf(iso2);
  if (topIdx >= 0) return 1000 - topIdx;
  return 100;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const lastPeriod = cut.lastIndexOf(". ");
  return lastPeriod > 100 ? cut.slice(0, lastPeriod + 1) : cut.replace(/[,;:\s]+$/, "") + "…";
}
