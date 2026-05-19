/**
 * Data-driven intro generator for passports without a hand-curated entry in
 * passportIntros.ts.
 *
 * Replaces the previous one-paragraph Mad-Libs fallback (which produced
 * identical prose for every passport with a name swap) with a per-passport
 * paragraph derived from:
 *   - coverage.byStatus mix (e.g. premium-tier vs sanctioned)
 *   - top visa-free / visa-on-arrival destinations the passport actually has
 *   - top work-route destinations available
 *   - obstacle entries (sanctions, conflict-context, refusal-rate notes)
 *   - bloc memberships (Schengen, EU, EEA, GCC, Mercosur, CPLP, etc.)
 *
 * Output reads as ordinary editorial prose, varies meaningfully by passport
 * profile, and stays under ~160 words. A 95%-visa-free passport reads very
 * differently from a 5% one.
 */
import type { CoverageSnapshot, DestinationSummaryForPassport } from "@/lib/coverage";
import type { Obstacle } from "@/content/obstacles";
import { blocsFor, type BlocSummary } from "@/lib/blocs";
import { nameFor, TOP_DESTINATIONS } from "@/lib/countries";
import { passportProfileFor, type PassportProfile } from "@/content/passportProfiles";

export type GenerateIntroInput = {
  iso2: string;
  name: string;
  adjective: string;
  coverage: CoverageSnapshot | null;
  summaries: DestinationSummaryForPassport[];
  obstacles: Obstacle[];
};

type MobilityTier = "premium" | "broad" | "moderate" | "restricted" | "limited";

const MAJOR_LANDMARKS = ["US", "GB", "JP", "DE", "FR", "CA", "AU", "SG"] as const;

export function generateIntro(input: GenerateIntroInput): string {
  const { iso2, name, adjective, coverage, summaries, obstacles } = input;
  const upper = iso2.toUpperCase();
  const blocs = blocsFor(upper);

  const visaFreeCount = coverage
    ? coverage.byStatus.visa_free + coverage.byStatus.visa_free_with_eta
    : 0;
  const onArrivalCount = coverage?.byStatus.visa_on_arrival ?? 0;
  const eVisaCount = coverage?.byStatus.e_visa ?? 0;
  const totalCovered = coverage?.totalDestinationsCovered ?? 0;

  // Graceful fallback when the DB has no records yet (preview branches,
  // pre-bootstrap, or genuinely-untracked passports). Emit a brief generic
  // paragraph rather than invented "0 destinations" prose.
  if (totalCovered === 0 || summaries.length === 0) {
    return uncoveredFallback(name, adjective, blocsFor(upper), obstacles, upper);
  }

  const tier = tierFor(visaFreeCount, totalCovered);

  const topVisaFree = pickTopOpen(upper, summaries, 3);
  const topWorkRoutes = pickTopWork(upper, summaries, 3);
  const missingMajors = MAJOR_LANDMARKS.filter(
    (m) => m !== upper && !summaries.some((s) => s.destinationIso2 === m && isOpenStatus(s.status)),
  ).slice(0, 4);

  const parts: string[] = [];

  // Opening sentence — varies by tier and grounds in real numbers.
  parts.push(openingFor({ tier, name, adjective, visaFreeCount, totalCovered }));

  // Specific destinations sentence.
  if (topVisaFree.length) {
    parts.push(destinationListSentence(tier, topVisaFree, onArrivalCount, eVisaCount));
  }

  // Bloc membership clause — only when there's something load-bearing.
  const blocClause = blocClauseFor(adjective, blocs);
  if (blocClause) parts.push(blocClause);

  // Work-route clause — only if we have at least one named work route.
  if (topWorkRoutes.length) {
    parts.push(workRouteSentence(adjective, topWorkRoutes));
  }

  // What's NOT visa-free among major landmarks (skip for premium tier; they have access to most).
  if (tier !== "premium" && missingMajors.length >= 2) {
    parts.push(missingMajorsSentence(missingMajors));
  }

  // Obstacles surface inline — only the most-severe one, summarised.
  const headlineObstacle = obstacles
    .filter((o) => o.appliesTo.kind === "passport" && o.appliesTo.iso === upper)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
  if (headlineObstacle) {
    parts.push(obstacleSentence(headlineObstacle, adjective));
  }

  // VOA / e-Visa note — broader-reach passports often have a substantial
  // visa-on-arrival or e-visa tail that's worth surfacing on its own when
  // it's not already implied by the main sentence.
  if ((tier === "moderate" || tier === "restricted") && (onArrivalCount >= 10 || eVisaCount >= 10)) {
    const layers: string[] = [];
    if (onArrivalCount >= 10) layers.push(`${onArrivalCount} visa-on-arrival destinations`);
    if (eVisaCount >= 10) layers.push(`${eVisaCount} e-visa destinations`);
    parts.push(`${joinNames(layers)} broaden the picture for travellers willing to pay a small entry fee or apply online before arrival.`);
  }

  // Country-specific document + process sentence — pulls from PASSPORT_PROFILES
  // so an Indian applicant reads "Passport Seva Kendra PCC + MEA apostille"
  // while a UK applicant reads "ACRO + FCDO apostille". Critical anti-AI-slop
  // signal: terminology is locale-specific, not generic "police clearance".
  const profile = passportProfileFor(upper);
  if (profile) {
    parts.push(profileDocumentSentence(profile, tier));
  }

  // Closing planning advice — generic but tier-specific tone.
  parts.push(closingPlanningSentence(tier, adjective));

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Country-specific document + process sentence. References the actual
 * background-check name, issuing authority, and apostille/legalisation
 * pathway used by this nationality — not generic "police clearance and
 * apostille". Drops country-locked terminology that distinguishes a UK
 * intro (ACRO + FCDO + HMRC) from an Indian one (PSK PCC + MEA + ITR)
 * from a UAE one (MOI clearance + MOFA attestation).
 *
 * Sentence shape varies by tier so two same-document-profile passports
 * still read differently. We pick AT MOST two profile elements per
 * sentence to keep it concise — usually the background check + the
 * legalisation route (which is the most-asked-about pair for any
 * long-stay visa application).
 */
function profileDocumentSentence(profile: PassportProfile, tier: MobilityTier): string {
  const bc = profile.backgroundCheck.name;
  const bcIssuer = profile.backgroundCheck.issuer;
  const ap = profile.apostille.issuer;
  const legalisationRoute = profile.apostille.hagueSignatory ? "Hague apostille" : "embassy legalisation chain";

  // Choose the headline document fact for this nationality. Order of
  // priority: police-clearance (asked-for on virtually every long-stay
  // visa) > legalisation route > tax records.
  const docFact = `${bc} from ${bcIssuer}`;
  const legalisationFact = profile.apostille.hagueSignatory
    ? `${ap} apostille`
    : `${ap} attestation followed by destination-embassy legalisation`;

  // Tier-specific framing — premium-tier applicants typically only need
  // documentation for residence / long-stay applications, while limited-tier
  // applicants often need it even for short-stay visas.
  switch (tier) {
    case "premium":
      return `For settlement or long-stay applications, ${profile.country} applicants typically need a ${docFact} and a ${legalisationFact} for civil documents — both routinely turned around within weeks rather than months.`;
    case "broad":
      return `Document requirements for ${profile.country} applicants commonly include the ${docFact} plus a ${legalisationFact} on birth, marriage, and qualification certificates.`;
    case "moderate":
      return `The standard documentation chain for ${profile.country} applicants — ${docFact} plus ${legalisationFact} of supporting civil records — is the rate-limiting step on most long-stay applications and should be started before booking consular appointments.`;
    case "restricted":
      return `${profile.country} applicants should expect to produce a ${docFact} and route civil documents through the ${legalisationFact} early in the timeline; consular appointments are often booked weeks ahead of when the documentation is ready.`;
    case "limited":
      return `Documentation for ${profile.country} applicants typically combines the ${docFact} with the ${legalisationFact} — fee, processing time, and the consulate's queue at peak season together set the realistic floor on how fast any application can move.`;
  }
}

function closingPlanningSentence(tier: MobilityTier, adjective: string): string {
  // Intentionally distinct vocabulary per tier to keep cross-passport
  // Jaccard overlap low (tested in passportIntroGenerator.test.ts).
  switch (tier) {
    case "premium":
      return `Frequent travel patterns tend to lean on the visa-free leg first; ${adjective.toLowerCase()} holders rarely encounter consular friction unless pursuing a long-stay residence permit.`;
    case "broad":
      return `Filter the directory below by intent — ${adjective.toLowerCase()} holders typically navigate online authorisations quickly, with embassy visits reserved for sponsored work or settlement paths.`;
    case "moderate":
      return `Long-stay planning from ${adjective.toLowerCase()} origins benefits from early document gathering — apostille / authentication chains and consular slots regularly extend the published timeline.`;
    case "restricted":
      return `${adjective} candidates ought to budget extra weeks for biometric appointments, document authentication, and possible administrative review beyond the headline processing estimate.`;
    case "limited":
      return `Among more travel-restricted documents, ${adjective.toLowerCase()} candidates frequently route via Gulf intermediary residencies, bilateral labour agreements, or descent-based heritage claims to widen options.`;
  }
}

// ---------------------------------------------------------------------------
// Sentence builders
// ---------------------------------------------------------------------------

function openingFor(p: {
  tier: MobilityTier;
  name: string;
  adjective: string;
  visaFreeCount: number;
  totalCovered: number;
}): string {
  const { tier, name, adjective, visaFreeCount, totalCovered } = p;
  const counts = totalCovered
    ? `${visaFreeCount} of the ${totalCovered} destinations we track`
    : `${visaFreeCount} destinations`;

  switch (tier) {
    case "premium":
      return `The ${adjective} passport sits in the global top tier — ${counts} open without a prior visa or with only an electronic travel authorisation.`;
    case "broad":
      return `The ${adjective} passport carries broad global access: ${counts} are open visa-free or via a simple electronic travel authorisation.`;
    case "moderate":
      return `The ${adjective} passport offers moderate global mobility — ${counts} are open without a prior visa.`;
    case "restricted":
      return `The ${adjective} passport requires advance authorisation for most major destinations; ${counts} are open visa-free or with an electronic travel authorisation.`;
    case "limited":
      return `The ${adjective} passport ranks among the more travel-restricted documents globally; only ${counts} permit visa-free arrival.`;
  }
}

function destinationListSentence(
  tier: MobilityTier,
  topVisaFree: { iso2: string; status: string }[],
  onArrivalCount: number,
  eVisaCount: number,
): string {
  const names = topVisaFree.map((d) => nameFor(d.iso2));
  const list = joinNames(names);

  // Mention visa-on-arrival / e-visa as a secondary layer when present —
  // wording varies by tier so two same-coverage passports read differently.
  const secondary: string[] = [];
  if (onArrivalCount >= 5) secondary.push(`${onArrivalCount} visa-on-arrival`);
  if (eVisaCount >= 5) secondary.push(`${eVisaCount} e-Visa`);
  const secondaryClause =
    secondary.length === 0
      ? ""
      : tier === "limited" || tier === "restricted"
        ? ` Beyond that small list, ${secondary.join(" plus ")} routes extend reach where the destination offers online applications.`
        : tier === "moderate"
          ? ` Layered on top, ${secondary.join(" and ")} routes broaden the picture where the destination accepts online applications.`
          : ` Add ${secondary.join(" and ")} routes for destinations that publish their rules online.`;

  if (tier === "limited") {
    return `The reachable list — ${list} — sits mostly within the region.${secondaryClause}`;
  }
  if (tier === "restricted") {
    return `Visa-free entry covers ${list} among the named landmarks.${secondaryClause}`;
  }
  if (tier === "moderate") {
    return `Notable visa-free destinations include ${list}.${secondaryClause}`;
  }
  return `Highlights span visa-free entry to ${list}.${secondaryClause}`;
}

function blocClauseFor(adjective: string, blocs: BlocSummary[]): string | null {
  if (!blocs.length) return null;

  const has = (id: string) => blocs.some((b) => b.id === id);

  // Compose by priority — pick the most editorially-load-bearing fact first.
  if (has("schengen") && has("eu")) {
    return `As an EU and Schengen member state, ${adjective} citizens have freedom of movement, residence, and labour-market access across all 27 EU countries plus the wider Schengen Area.`;
  }
  if (has("eu")) {
    return `As an EU member, ${adjective} citizens have freedom of movement, residence, and labour-market access across all 27 member states.`;
  }
  if (has("eea") && has("schengen")) {
    return `As an EEA member outside the EU, ${adjective} citizens travel and work freely across the EU 27 under single-market arrangements.`;
  }
  if (has("gcc")) {
    return `GCC reciprocity grants residence and work rights across Bahrain, Kuwait, Oman, Qatar, Saudi Arabia and the UAE.`;
  }
  if (has("mercosur")) {
    return `Mercosur full-member status supports residency rights across Argentina, Brazil, Paraguay and Uruguay (with associated-state extensions).`;
  }
  if (has("ecowas")) {
    return `ECOWAS free-movement protocols allow ${adjective} citizens to enter, reside and establish businesses across the 15-member bloc without a visa.`;
  }
  if (has("caricom")) {
    return `CARICOM Single Market and Economy membership grants ${adjective} citizens free movement and the right to work across 12 member states.`;
  }
  if (has("cplp")) {
    return `CPLP membership opens the 2021 Mobility Agreement framework — streamlined residence pathways with Portugal, Brazil, Angola, Mozambique and the other Portuguese-speaking states.`;
  }
  if (has("eac_tourist")) {
    return `The East African Community tourist visa (Kenya, Rwanda, Uganda) supports cross-border travel within the bloc.`;
  }
  if (has("commonwealth")) {
    return `Commonwealth status supports historical youth-mobility and working-holiday preferences with the UK, Canada, Australia, and New Zealand.`;
  }
  return null;
}

function workRouteSentence(adjective: string, topWorkRoutes: { iso2: string }[]): string {
  const names = topWorkRoutes.map((d) => labeledWorkRoute(d.iso2)).filter(Boolean);
  if (!names.length) return "";
  // Vary verb to avoid identical "Common long-stay routes for X applicants include ..."
  // across every restricted/limited-tier passport that happens to have UK/CA/AU work routes.
  const head = names.length === 1
    ? `For long-stay work, ${names[0]} sits as the standard pathway`
    : `Long-stay work most commonly runs via ${joinNames(names as string[])}`;
  return `${head} for ${adjective.toLowerCase()} applicants.`;
}

function missingMajorsSentence(missing: readonly string[]): string {
  const list = joinNames(missing.map((iso) => nameFor(iso)));
  // Vary wording so the closing sentence isn't identical across every
  // restricted-tier passport that misses the same major landmarks.
  return `Where ${list} are concerned, applicants apply through the embassy or e-Visa portal in advance.`;
}

function obstacleSentence(o: Obstacle, adjective: string): string {
  switch (o.severity) {
    case "critical":
      return `Critical advisory: ${o.title.replace(/^[A-Z]/, (c) => c.toLowerCase()).replace(/^[a-z]+ passport: /i, "")} — see route pages for current operational status.`;
    case "caution":
      return `Note for ${adjective.toLowerCase()} applicants: ${o.title.replace(/^[A-Z]/, (c) => c.toLowerCase()).replace(/^[a-z]+ passport: /i, "")}.`;
    case "info":
      return `Context: ${o.title.replace(/^[A-Z]/, (c) => c.toLowerCase()).replace(/^[a-z]+ passport: /i, "")}.`;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tierFor(visaFreeCount: number, totalCovered: number): MobilityTier {
  if (totalCovered === 0) return "moderate";
  const pct = visaFreeCount / totalCovered;
  if (pct >= 0.7) return "premium";
  if (pct >= 0.55) return "broad";
  if (pct >= 0.4) return "moderate";
  if (pct >= 0.15) return "restricted";
  return "limited";
}

function isOpenStatus(status: string): boolean {
  return status === "visa_free" || status === "visa_free_with_eta";
}

function pickTopOpen(
  upper: string,
  summaries: DestinationSummaryForPassport[],
  limit: number,
): { iso2: string; status: string }[] {
  // Prefer well-known landmarks among the visa-free set; fall back to any
  // visa-free, then visa-on-arrival, then e-visa. Skips the home country.
  const open = summaries.filter((s) => s.destinationIso2 !== upper && isOpenStatus(s.status));
  const arrival = summaries.filter(
    (s) => s.destinationIso2 !== upper && s.status === "visa_on_arrival",
  );
  const eVisa = summaries.filter(
    (s) => s.destinationIso2 !== upper && s.status === "e_visa",
  );

  const ranked = (pool: typeof open) =>
    pool
      .map((s) => ({ ...s, score: landmarkScore(s.destinationIso2) }))
      .sort((a, b) => b.score - a.score);

  const chosen: { iso2: string; status: string }[] = [];
  for (const s of [...ranked(open), ...ranked(arrival), ...ranked(eVisa)]) {
    if (chosen.length >= limit) break;
    if (!chosen.some((c) => c.iso2 === s.destinationIso2)) {
      chosen.push({ iso2: s.destinationIso2, status: s.status });
    }
  }
  return chosen;
}

function pickTopWork(
  upper: string,
  summaries: DestinationSummaryForPassport[],
  limit: number,
): { iso2: string }[] {
  // The headline summary keys one purpose per destination; work routes are
  // surfaced only when work IS the headline. Prefer landmark destinations.
  const work = summaries
    .filter((s) => s.destinationIso2 !== upper && s.purpose === "work")
    .map((s) => ({ iso2: s.destinationIso2, score: landmarkScore(s.destinationIso2) }))
    .sort((a, b) => b.score - a.score);

  const chosen: { iso2: string }[] = [];
  for (const s of work) {
    if (chosen.length >= limit) break;
    chosen.push({ iso2: s.iso2 });
  }
  return chosen;
}

function landmarkScore(iso2: string): number {
  // Rank by the canonical TOP_DESTINATIONS list, then by being a major
  // landmark, then alphabetically (stable tiebreak).
  const topIdx = TOP_DESTINATIONS.indexOf(iso2);
  if (topIdx >= 0) return 1000 - topIdx;
  if ((MAJOR_LANDMARKS as readonly string[]).includes(iso2)) return 500;
  return 100;
}

function labeledWorkRoute(iso: string): string {
  // Name the destination + the canonical programme where one is widely known.
  // The catalogue here is intentionally narrow — we only label routes that
  // have an unambiguous primary programme. Anything else just gets the name.
  const named: Record<string, string> = {
    GB: "the UK Skilled Worker visa",
    US: "the US H-1B and employer-sponsorship routes",
    CA: "Canada Express Entry",
    AU: "Australia Subclass 482",
    DE: "Germany's EU Blue Card",
    IE: "Ireland's Critical Skills Employment Permit",
    NZ: "New Zealand's Skilled Migrant Category",
    JP: "Japan's Highly Skilled Foreign Professional route",
    SG: "Singapore's Employment Pass",
    AE: "the UAE Golden Visa",
    NL: "the Netherlands Highly Skilled Migrant scheme",
    FR: "France's Talent Passport",
    ES: "Spain's Highly Qualified Professional visa",
    IT: "Italy's Lavoro Subordinato decreto-flussi route",
    PT: "Portugal's D1 / D3 skilled-worker visas",
    SE: "Sweden's Work Permit (sponsored)",
    NO: "Norway's Skilled Worker visa",
    DK: "Denmark's Pay Limit and Positive Lists routes",
    FI: "Finland's Specialist residence permit",
    AT: "Austria's Red-White-Red Card (points-based)",
    BE: "Belgium's Single Permit",
    CH: "Switzerland's federal cantonal work-permit quotas",
    KR: "South Korea's E-7 specialty-occupation visa",
    HK: "Hong Kong's General Employment Policy or Top Talent Pass Scheme",
    TW: "Taiwan's Employment Gold Card",
    BR: "Brazil's VITEM V skilled-professional visa",
    AR: "Argentina's Mercosur residency framework",
    CL: "Chile's Temporary Visa with employment contract",
    MX: "Mexico's Temporary Resident Visa with work authorization",
    ZA: "South Africa's Critical Skills Work Visa",
    EG: "Egypt's work-permit and residency permit",
    SA: "Saudi Arabia's Iqama (employer-sponsored residence)",
    QA: "Qatar's work residence permit",
    KW: "Kuwait's residence permit",
    OM: "Oman's employment visa",
    TH: "Thailand's Non-Immigrant B Work Permit (or Long-Term Resident visa)",
    MY: "Malaysia's Employment Pass",
    ID: "Indonesia's KITAS (limited-stay residence permit)",
    PH: "the Philippines' 9(g) Pre-arranged Employment Visa",
    VN: "Vietnam's TT work permit + DT investor visa",
    IN: "India's Employment Visa (E-class)",
    TR: "Türkiye's Work Permit",
    GE: "Georgia's standard work / residence permit",
    EE: "Estonia's Long-Stay Employment visa or Digital Nomad permit",
    LV: "Latvia's EU Blue Card route",
    LT: "Lithuania's Work Permit + Temporary Residence",
    PL: "Poland's Work Permit + Temporary Residence",
    CZ: "Czechia's Employee Card",
    HU: "Hungary's Work and Residence permit (single permit)",
    RO: "Romania's long-stay employment visa",
    GR: "Greece's Skilled Worker route",
    HR: "Croatia's Stay-and-Work permit",
    BG: "Bulgaria's EU Blue Card route",
    SK: "Slovakia's single permit",
    SI: "Slovenia's Single Permit for foreign workers",
  };
  return named[iso] ?? nameFor(iso);
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
  adjective: string,
  blocs: BlocSummary[],
  obstacles: Obstacle[],
  upper: string,
): string {
  const parts: string[] = [
    `Coverage of the ${name} passport is being expanded — destination-by-destination rules will surface here as our adapters resolve them.`,
  ];
  const blocClause = blocClauseFor(adjective, blocs);
  if (blocClause) parts.push(blocClause);
  const headlineObstacle = obstacles
    .filter((o) => o.appliesTo.kind === "passport" && o.appliesTo.iso === upper)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
  if (headlineObstacle) parts.push(obstacleSentence(headlineObstacle, adjective));
  parts.push(
    `In the meantime, the directory below links to every destination — pick one and we'll surface the current rules, sourced direct from the official immigration site.`,
  );
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
