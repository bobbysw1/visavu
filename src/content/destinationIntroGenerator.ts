/**
 * Data-driven destination intro generator — fallback for destinations
 * without a curated entry in destinationIntros.ts.
 *
 * Symmetric to passportIntroGenerator.ts but flipped: instead of "where
 * can this passport go", it answers "who can enter this destination, and
 * how". Reads:
 *   - coverage.byStatus mix (how open is this destination overall)
 *   - top easy-access origins (named major passports that get visa-free)
 *   - top embassy-required origins (named majors that need a visa)
 *   - bloc membership (Schengen / GCC / Mercosur / etc.) of the destination
 *   - obstacles flagged for the destination (conflict, advisory, ETIAS, EES)
 *
 * Output: a single paragraph, ~90–180 words, that varies meaningfully by
 * destination profile. An open visa-free hub reads very differently from
 * a heavily-restricted state.
 */
import type { CoverageSnapshot, OriginSummaryForDestination } from "@/lib/coverage";
import type { Obstacle } from "@/content/obstacles";
import { blocsFor, type BlocSummary } from "@/lib/blocs";
import { nameFor, TOP_ORIGINS } from "@/lib/countries";

export type GenerateDestinationIntroInput = {
  iso2: string;
  name: string;
  coverage: CoverageSnapshot | null;
  summaries: OriginSummaryForDestination[];
  obstacles: Obstacle[];
};

type OpennessTier = "very_open" | "open" | "moderate" | "selective" | "closed";

const MAJOR_ORIGINS = ["US", "GB", "DE", "FR", "JP", "CA", "AU", "IN", "CN", "BR"] as const;

export function generateIntro(input: GenerateDestinationIntroInput): string {
  const { iso2, name, coverage, summaries, obstacles } = input;
  const upper = iso2.toUpperCase();
  const blocs = blocsFor(upper);

  const openCount = coverage
    ? coverage.byStatus.visa_free + coverage.byStatus.visa_free_with_eta + coverage.byStatus.visa_on_arrival
    : 0;
  const totalCovered = coverage?.totalDestinationsCovered ?? 0;

  // Graceful fallback when DB has no records yet.
  if (totalCovered === 0 || summaries.length === 0) {
    return uncoveredFallback(name, blocs, obstacles, upper);
  }

  const tier = opennessTierFor(openCount, totalCovered);
  const topOpen = pickTopOriginsByStatus(upper, summaries, ["visa_free", "visa_free_with_eta", "visa_on_arrival"], 3);
  const topEmbassy = pickTopOriginsByStatus(upper, summaries, ["embassy_visa"], 3);

  const parts: string[] = [];
  parts.push(openingFor({ tier, name, openCount, totalCovered }));
  if (topOpen.length) parts.push(openOriginsSentence(tier, topOpen));
  if (topEmbassy.length && tier !== "very_open") parts.push(embassyOriginsSentence(topEmbassy));

  const blocClause = blocClauseFor(name, blocs);
  if (blocClause) parts.push(blocClause);

  const destObstacle = obstacles
    .filter((o) => o.appliesTo.kind === "destination" && o.appliesTo.iso === upper)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
  if (destObstacle) parts.push(obstacleSentence(destObstacle));

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Sentence builders
// ---------------------------------------------------------------------------

function openingFor(p: {
  tier: OpennessTier;
  name: string;
  openCount: number;
  totalCovered: number;
}): string {
  const { tier, name, openCount, totalCovered } = p;
  const ratio = totalCovered ? `${openCount} of the ${totalCovered} passports we currently track` : `${openCount} passports`;
  switch (tier) {
    case "very_open":
      return `${name} runs one of the most open short-stay regimes globally — ${ratio} enter visa-free, with an eTA, or visa-on-arrival.`;
    case "open":
      return `${name} maintains broadly open short-stay access: ${ratio} are admitted without a prior consular visa.`;
    case "moderate":
      return `${name} operates a mixed short-stay regime — ${ratio} are visa-exempt or get visa-on-arrival; the rest apply at a consulate.`;
    case "selective":
      return `${name} runs a selective entry regime — ${ratio} enter without a prior visa; most other nationalities apply through an embassy or e-Visa portal.`;
    case "closed":
      return `${name} maintains a restrictive short-stay regime; only ${ratio} are admitted without an advance visa application.`;
  }
}

function openOriginsSentence(tier: OpennessTier, origins: { iso2: string; status: string }[]): string {
  const named = origins.map((o) => nameFor(o.iso2));
  const list = joinNames(named);
  if (tier === "very_open" || tier === "open") {
    return `Headline visa-free passports include ${list}, alongside most other major passports.`;
  }
  if (tier === "moderate") {
    return `Visa-exempt nationalities include ${list}, with the broader list documented on each route page.`;
  }
  return `The narrower visa-free list includes ${list} among the named major passports.`;
}

function embassyOriginsSentence(origins: { iso2: string }[]): string {
  const named = origins.map((o) => nameFor(o.iso2));
  return `Notable nationalities that still apply through an embassy or e-Visa portal include ${joinNames(named)}.`;
}

function blocClauseFor(name: string, blocs: BlocSummary[]): string | null {
  if (!blocs.length) return null;
  const has = (id: string) => blocs.some((b) => b.id === id);
  if (has("schengen") && has("eu")) {
    return `As an EU and Schengen member, ${name} applies the common 90-in-180-day short-stay rule and rolls out ETIAS authorisation for visa-exempt nationalities from late 2026.`;
  }
  if (has("eu")) {
    return `As an EU member outside the Schengen Area, ${name} operates its own short-stay border controls but admits EU citizens under freedom of movement.`;
  }
  if (has("schengen")) {
    return `As a Schengen member, ${name} applies the common 90-in-180-day rule with ETIAS coming for visa-exempt nationalities from late 2026.`;
  }
  if (has("gcc")) {
    return `GCC reciprocity allows nationals of Bahrain, Kuwait, Oman, Qatar, Saudi Arabia and the UAE to enter, reside and work in ${name} without a separate visa.`;
  }
  if (has("mercosur")) {
    return `Mercosur full-member status grants nationals of Argentina, Brazil, Paraguay and Uruguay streamlined residency rights in ${name}.`;
  }
  if (has("ecowas")) {
    return `ECOWAS free-movement protocols admit nationals of all 15 member states to ${name} without visa for travel, residence and establishment.`;
  }
  if (has("caricom")) {
    return `CARICOM Single Market and Economy membership grants nationals of CSME member states the right to enter and work in ${name}.`;
  }
  if (has("eac_tourist")) {
    return `${name} participates in the East African Community Tourist Visa (Kenya, Rwanda, Uganda) — a single permit covers all three.`;
  }
  return null;
}

function obstacleSentence(o: Obstacle): string {
  switch (o.severity) {
    case "critical":
      return `Critical advisory: ${o.title.replace(/^[A-Z][a-zA-Z\s]+:\s*/i, "")} — check current FCDO/State Department guidance.`;
    case "caution":
      return `Note for travellers: ${o.title.replace(/^[A-Z][a-zA-Z\s]+:\s*/i, "")}.`;
    case "info":
      return `Context: ${o.title.replace(/^[A-Z][a-zA-Z\s]+:\s*/i, "")}.`;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function opennessTierFor(openCount: number, totalCovered: number): OpennessTier {
  if (totalCovered === 0) return "moderate";
  const pct = openCount / totalCovered;
  if (pct >= 0.7) return "very_open";
  if (pct >= 0.5) return "open";
  if (pct >= 0.3) return "moderate";
  if (pct >= 0.1) return "selective";
  return "closed";
}

function pickTopOriginsByStatus(
  upper: string,
  summaries: OriginSummaryForDestination[],
  statuses: string[],
  limit: number,
): { iso2: string; status: string }[] {
  const pool = summaries
    .filter((s) => s.passportIso2 !== upper && statuses.includes(s.status))
    .map((s) => ({ ...s, score: originScore(s.passportIso2) }))
    .sort((a, b) => b.score - a.score);

  const chosen: { iso2: string; status: string }[] = [];
  for (const s of pool) {
    if (chosen.length >= limit) break;
    if (!chosen.some((c) => c.iso2 === s.passportIso2)) {
      chosen.push({ iso2: s.passportIso2, status: s.status });
    }
  }
  return chosen;
}

function originScore(iso2: string): number {
  const topIdx = TOP_ORIGINS.indexOf(iso2);
  if (topIdx >= 0) return 1000 - topIdx;
  if ((MAJOR_ORIGINS as readonly string[]).includes(iso2)) return 500;
  return 100;
}

function joinNames(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function severityRank(s: Obstacle["severity"]): number {
  return s === "critical" ? 3 : s === "caution" ? 2 : 1;
}

function uncoveredFallback(
  name: string,
  blocs: BlocSummary[],
  obstacles: Obstacle[],
  upper: string,
): string {
  const parts: string[] = [
    `Coverage for travel to ${name} is being expanded — entry rules will surface here as our adapters resolve them.`,
  ];
  const blocClause = blocClauseFor(name, blocs);
  if (blocClause) parts.push(blocClause);
  const destObstacle = obstacles
    .filter((o) => o.appliesTo.kind === "destination" && o.appliesTo.iso === upper)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
  if (destObstacle) parts.push(obstacleSentence(destObstacle));
  parts.push(`Browse below for any passport — we'll surface the current rules and link straight at the official immigration site.`);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
