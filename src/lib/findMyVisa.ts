/**
 * Server-side recommendation engine for the smart questionnaire.
 *
 * Given a complete (or partial) set of answers, runs the existing
 * findDestinations() query for the inferred goal, then aggregates the
 * results into five ranked categories:
 *
 *   bestPathways   — top overall fit for the inferred profile + goal
 *   easiestRoutes  — lowest barrier (status + minimal documentation)
 *   fastestRoutes  — shortest processing time
 *   cheapestRoutes — lowest mandatory fees
 *   prOpportunities — destinations with the shortest path to PR
 *
 * Each output entry contains enough metadata for the results dashboard
 * to render a card without a second DB hit.
 */
import { findDestinations, type FinderResult } from "./finder";
import {
  inferGoal,
  inferProfile,
  timelineToDays,
  type QuestionnaireAnswers,
} from "./questionnaire";
import { COUNTRY_METRICS, type CountryMetrics } from "./countryMetrics";
import { PROFILE_PATHWAY_PRIORITY, type Profile } from "./profiles";
import { nameFor } from "./countries";

export type RecommendationItem = FinderResult & {
  destinationName: string;
  /** PR pathway years for this destination (from country metrics). */
  prYears: number | null;
  prNote: string | null;
  /** Reason this destination shows up in the category (1-line). */
  badge: string;
  /** Short note explaining how the user's profile maps to this route
   *  (e.g. "Your master's degree is a strong fit for skilled migration"). */
  fitNote?: string | null;
  /** Caveats the user should be aware of given their answers (e.g.
   *  "Criminal-record disclosure required"). Renders as a small amber
   *  inline note on the card. */
  caveats?: string[];
};

/** Overall application-complexity verdict for the user. Drives the
 *  top-of-page advice band: "DIY with Claude" vs "hire a lawyer". */
export type AdviceTier = "ideal" | "viable" | "complicated";

export type AdviceVerdict = {
  tier: AdviceTier;
  /** Short headline for the advice band. */
  headline: string;
  /** Body copy — actionable next steps. */
  body: string;
  /** Reasons the engine reached this verdict (transparency). */
  reasons: string[];
  /** When the verdict suggests professional help, this is the deep-link
   *  the CTA points at. */
  ctaHref: string;
  ctaLabel: string;
};

export type Recommendations = {
  goal: ReturnType<typeof inferGoal>;
  profile: Profile;
  bestPathways: RecommendationItem[];
  easiestRoutes: RecommendationItem[];
  fastestRoutes: RecommendationItem[];
  cheapestRoutes: RecommendationItem[];
  prOpportunities: RecommendationItem[];
  /** DIY-vs-lawyer recommendation based on the answers + best fit. */
  advice?: AdviceVerdict;
  /** Set when something blocks recommendations entirely (e.g. unknown passport). */
  emptyReason?: string;
  /** True if the user disclosed a serious criminal record — UI shows a
   *  legal-advice callout when set. */
  showLegalAdviceCallout?: boolean;
};

export async function recommendForAnswers(
  a: QuestionnaireAnswers,
): Promise<Recommendations> {
  const goal = inferGoal(a);
  const profile = inferProfile(a);

  if (!a.passportIso2) {
    return emptyResult(goal, profile, "Pick your passport to see recommendations.");
  }

  let raw: FinderResult[] = [];
  try {
    raw = await findDestinations(a.passportIso2, goal, { limit: 60 });
  } catch {
    return emptyResult(goal, profile, "Recommendation engine is temporarily unavailable.");
  }

  // Enrich with country metrics (PR years / note) + computed badges.
  const items: RecommendationItem[] = raw.map((r) => {
    const m: CountryMetrics | null = COUNTRY_METRICS[r.destinationIso2] ?? null;
    return {
      ...r,
      destinationName: nameFor(r.destinationIso2),
      prYears: m?.permanentResidencyYears ?? null,
      prNote: m?.permanentResidencyNote ?? null,
      badge: badgeFor(r),
    };
  });

  // Strict-timeline filter: drop routes whose processing exceeds the
  // user's stated timeline so "0–6 months" doesn't show a 9-month route.
  const timelineDays = timelineToDays(a.timeline);
  const inTimeline = items.filter(
    (r) => r.processingTimeDaysMax == null || r.processingTimeDaysMax <= timelineDays,
  );
  const pool = inTimeline.length > 0 ? inTimeline : items;

  // BEST PATHWAYS — top by score, with desired destination pinned first.
  const bestPathways = [...pool]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  if (a.desiredDestinationIso2) {
    const desired = items.find((r) => r.destinationIso2 === a.desiredDestinationIso2);
    if (desired && !bestPathways.find((r) => r.destinationIso2 === desired.destinationIso2)) {
      bestPathways.unshift({ ...desired, badge: "Your top pick" });
    } else if (desired) {
      // Re-flag the existing entry.
      const idx = bestPathways.findIndex((r) => r.destinationIso2 === desired.destinationIso2);
      bestPathways[idx] = { ...bestPathways[idx], badge: "Your top pick" };
    }
  }

  // EASIEST — visa-free / eTA / VoA first, then processing-time tiebreak.
  const easyOrder = ["visa_free", "visa_free_with_eta", "visa_on_arrival", "e_visa"];
  const easiestRoutes = [...pool]
    .filter((r) => easyOrder.includes(r.status))
    .sort((a, b) => {
      const eA = easyOrder.indexOf(a.status);
      const eB = easyOrder.indexOf(b.status);
      if (eA !== eB) return eA - eB;
      return (a.processingTimeDaysMax ?? 0) - (b.processingTimeDaysMax ?? 0);
    })
    .slice(0, 6);

  // FASTEST — by processingTimeDaysMax ascending (nulls last).
  const fastestRoutes = [...pool]
    .filter((r) => r.processingTimeDaysMax != null && r.processingTimeDaysMax > 0)
    .sort(
      (a, b) => (a.processingTimeDaysMax ?? Infinity) - (b.processingTimeDaysMax ?? Infinity),
    )
    .slice(0, 6);

  // CHEAPEST — by feeAmountMinor ascending (null/0 first treated as "fee-free").
  const cheapestRoutes = [...pool]
    .sort((a, b) => (a.feeAmountMinor ?? 0) - (b.feeAmountMinor ?? 0))
    .slice(0, 6);

  // PR / CITIZENSHIP — destinations with curated PR-year metric, sorted by years asc.
  const prOpportunities = [...pool]
    .filter((r) => {
      const m = COUNTRY_METRICS[r.destinationIso2];
      return m?.permanentResidencyYears != null;
    })
    .sort((a, b) => {
      const ay = COUNTRY_METRICS[a.destinationIso2]?.permanentResidencyYears ?? 99;
      const by = COUNTRY_METRICS[b.destinationIso2]?.permanentResidencyYears ?? 99;
      return ay - by;
    })
    .slice(0, 6);

  // Profile-pathway tie-break for best pathways — promote routes that fit
  // the inferred profile's preferred pathways. We can't know each option's
  // exact pathway without classifying again here, so this stays a soft signal.
  const profilePref = PROFILE_PATHWAY_PRIORITY[profile];
  bestPathways.sort((a, b) => {
    // The desired-destination pin already lives at index 0; keep it there.
    if (a.badge === "Your top pick") return -1;
    if (b.badge === "Your top pick") return 1;
    // Otherwise resort by score (already done) — profilePref is currently
    // informational; we keep the priority list available for future use.
    void profilePref;
    return 0;
  });

  // Annotate every shortlisted item with a profile-aware fit note + any
  // caveats. Each list is a copy of pool, so a single helper mutation
  // would touch all of them — easier to apply per-list.
  const annotate = (list: RecommendationItem[]) =>
    list.map((r) => ({ ...r, fitNote: fitNoteFor(a, r), caveats: caveatsFor(a, r) }));

  const advice = assessAdvice(a, profile, bestPathways[0] ?? null);

  return {
    goal,
    profile,
    bestPathways: annotate(bestPathways),
    easiestRoutes: annotate(easiestRoutes),
    fastestRoutes: annotate(fastestRoutes),
    cheapestRoutes: annotate(cheapestRoutes),
    prOpportunities: annotate(prOpportunities),
    advice,
    showLegalAdviceCallout: a.criminalRecord === "serious",
  };
}

// ----- Smart-routing helpers --------------------------------------------

/** Short, profile-aware note describing why a route fits (or doesn't
 *  quite) given the user's answers. Rendered on each recommendation
 *  card. Returns null when no specific note applies. */
function fitNoteFor(a: QuestionnaireAnswers, r: RecommendationItem): string | null {
  const label = r.label.toLowerCase();

  // Education-driven matches.
  const ed = a.educationLevel;
  if (ed === "doctorate" && /skilled migrant|express entry|talent passport|blue card|h-?1b|tier 2|points/i.test(r.label)) {
    return "Your doctorate maxes out the points score on this route.";
  }
  if ((ed === "masters" || ed === "bachelors") && /skilled migrant|express entry|talent passport|blue card|h-?1b|tier 2|skilled worker|employment pass/i.test(r.label)) {
    return `Your ${ed === "masters" ? "master's" : "bachelor's"} degree is a strong fit for this skilled-migration route.`;
  }
  if (ed === "trade_cert" && /skilled migrant|subclass 482|skilled trade|SSW/i.test(r.label)) {
    return "Your trade certificate fits this skilled-trade route directly.";
  }
  if (ed === "high_school" && /working holiday|subclass 417|subclass 462|youth mobility|whp/i.test(r.label)) {
    return "Working-holiday routes are designed for high-school graduates — no degree needed.";
  }

  // Occupation-driven matches.
  if (a.occupation === "healthcare" && /skilled migrant|express entry|tier 2|nhs/i.test(r.label)) {
    return "Healthcare occupations are on the in-demand list for this route.";
  }
  if (a.occupation === "engineering_tech" && /h-?1b|blue card|skilled migrant|express entry|talent passport|employment pass/i.test(r.label)) {
    return "Engineering / tech is a fast-track on this route — most approvals are routine.";
  }
  if (a.occupation === "trades" && /skilled migrant|subclass 482|specified skilled|trade/i.test(r.label)) {
    return "Trades occupations qualify directly on this route.";
  }

  // Capital-driven matches.
  if ((a.investmentCapital === "500k_2m" || a.investmentCapital === "2m_plus") && /golden|investor|EB-?5|significant investor/i.test(r.label)) {
    return "Your investable capital meets the threshold for this golden / investor route.";
  }

  // Remote-work matches.
  if (a.remoteWork && a.remoteWork !== "no" && /digital nomad|nomad visa|remote/i.test(r.label)) {
    return "Your remote-work setup is exactly what this visa is designed for.";
  }

  // Retirement matches.
  if ((a.occupation === "retired" || a.goal === "retire") && /\bD7\b|passive income|retirement|MM2H|rentista/i.test(r.label)) {
    return "Passive-income / retirement route — your stated goal aligns directly.";
  }

  // Family matches.
  if ((a.familyStatus === "married_no_kids" || a.familyStatus === "married_with_kids") && /spouse|partner|family|reunification/i.test(r.label)) {
    return "Marriage / family routes apply to you given your relationship status.";
  }

  void label;
  return null;
}

/** Caveats based on the user's answers that should be surfaced on the
 *  card for honest decision-making. */
function caveatsFor(a: QuestionnaireAnswers, r: RecommendationItem): string[] | undefined {
  const out: string[] = [];

  if (a.criminalRecord === "serious") {
    out.push("Serious criminal record — disclosure required, may bar this route.");
  } else if (a.criminalRecord === "minor" && r.status === "embassy_visa") {
    out.push("Minor offence — disclose at application; usually not a blocker for short stays.");
  }

  if (
    a.educationLevel === "high_school" &&
    /skilled migrant|express entry|h-?1b|blue card|talent passport|tier 2/i.test(r.label)
  ) {
    out.push("Most skilled-migration routes require a bachelor's degree or higher.");
  }

  if (
    a.investmentCapital === "none" &&
    /golden|investor|significant investor|EB-?5/i.test(r.label)
  ) {
    out.push("This route requires significant investable capital you haven't indicated.");
  }

  return out.length > 0 ? out : undefined;
}

/** Headline DIY-vs-lawyer recommendation for the user's overall case. */
function assessAdvice(
  a: QuestionnaireAnswers,
  profile: Profile,
  top: RecommendationItem | null,
): AdviceVerdict {
  const reasons: string[] = [];

  // ---- Disqualifiers that immediately flag complicated ----
  if (a.criminalRecord === "serious") {
    reasons.push("Serious criminal record disclosed — almost every long-stay visa needs case-by-case legal review.");
    return {
      tier: "complicated",
      headline: "Talk to an immigration lawyer.",
      body: "Your case has factors (criminal record) that affect eligibility on most routes. A regulated immigration lawyer is worth the fee here — they'll know which destinations consider rehabilitation, and they'll prepare the disclosure correctly so a single wrong answer doesn't bar you for life.",
      reasons,
      ctaHref: "/services/legal-services",
      ctaLabel: "Find an immigration lawyer →",
    };
  }
  if (!top) {
    reasons.push("No matching routes inside your timeline.");
    return {
      tier: "complicated",
      headline: "No clean fit yet — try widening your timeline.",
      body: "We couldn't find a visa whose processing time fits your stated timeline. Either extend the timeline, or take this to a consultant who can advise on premium-processing options.",
      reasons,
      ctaHref: "/services/legal-services",
      ctaLabel: "Find an immigration lawyer →",
    };
  }

  // ---- Status-driven assessment of the headline route ----
  const status = top.status;
  const easyStatuses = ["visa_free", "visa_free_with_eta", "visa_on_arrival", "e_visa"];
  const isEasyStatus = easyStatuses.includes(status);
  const isHardStatus = status === "restricted" || status === "refused";

  if (isHardStatus) {
    reasons.push(`Top route status is ${status.replace(/_/g, " ")} — case-by-case approval.`);
    return {
      tier: "complicated",
      headline: "Your case needs professional review.",
      body: "Your best-fit route is reviewed case-by-case, with no automatic answer. A regulated immigration adviser will know the levers (additional documents, second-passport options, alternative routes) far better than a self-filer.",
      reasons,
      ctaHref: "/services/legal-services",
      ctaLabel: "Find an immigration lawyer →",
    };
  }

  // ---- IDEAL: easy status + good profile fit + clean record ----
  if (isEasyStatus && a.criminalRecord !== "minor") {
    reasons.push(`Top route is ${easyStatusLabel(status)} — no embassy queues.`);
    if (a.educationLevel && ["bachelors", "masters", "doctorate"].includes(a.educationLevel)) {
      reasons.push("Your education + occupation match the destination's in-demand profile.");
    }
    return {
      tier: "ideal",
      headline: "You can DIY this — save the lawyer fee.",
      body: "Your top match doesn't need an embassy queue or a sponsor. The destination's official portal is free; fill the form yourself, then paste your personal statement into Claude (or any AI) and ask it to tighten the prose. Typical lawyer fee saved: £500–1,500.",
      reasons,
      ctaHref: top.applicationUrl ?? top.primarySourceUrl ?? "#",
      ctaLabel: top.applicationUrl ? "Apply on the official portal →" : "Open primary source →",
    };
  }

  // ---- Profile-specific signals that nudge complicated ----
  const investorProfile = profile === "hnwi" || profile === "investor";
  const capitalGap = investorProfile && (a.investmentCapital === "none" || a.investmentCapital === "under_100k");
  if (capitalGap) {
    reasons.push("HNWI / investor goal stated but capital below typical thresholds.");
    return {
      tier: "complicated",
      headline: "Capital gap — talk to a specialist.",
      body: "Your stated goal is investor / golden-visa-track but the capital figure you entered is below most programmes' thresholds. A tax + immigration adviser can help you structure the investment to meet the requirement, or point you at lower-threshold alternatives.",
      reasons,
      ctaHref: "/services/legal-services",
      ctaLabel: "Find a relocation specialist →",
    };
  }

  // ---- VIABLE: embassy-required but otherwise clean ----
  reasons.push(`Top route is ${labelForStatus(status)} — heavier paperwork than visa-free.`);
  if (a.criminalRecord === "minor") {
    reasons.push("Minor offence on record — disclose carefully but not a blocker for most routes.");
  }
  return {
    tier: "viable",
    headline: "You're eligible — use the prep checklist before paying for a lawyer.",
    body: "Your case is workable on the official portal. The application has a few heavy sections (financial proof, sponsor letter, prior-visa history) where a lawyer can help but most applicants get through without one. Run the prep checklist below; if any single section still feels unclear after that, a one-hour paid consultation is usually enough.",
    reasons,
    ctaHref: top.applicationUrl ?? "#",
    ctaLabel: top.applicationUrl ? "Start on the official portal →" : "See the prep checklist →",
  };
}

function easyStatusLabel(status: string): string {
  switch (status) {
    case "visa_free":
      return "visa-free entry";
    case "visa_free_with_eta":
      return "visa-free with eTA";
    case "visa_on_arrival":
      return "visa on arrival";
    case "e_visa":
      return "an online e-Visa";
    default:
      return "low-friction";
  }
}

function labelForStatus(status: string): string {
  return status.replace(/_/g, " ");
}

function badgeFor(r: FinderResult): string {
  if (r.status === "visa_free") return "Visa-free entry";
  if (r.status === "visa_free_with_eta") return "Visa-free with eTA";
  if (r.status === "visa_on_arrival") return "Visa on arrival";
  if (r.status === "e_visa") return "Online e-Visa";
  if (r.status === "embassy_visa") return "Embassy visa";
  if (r.status === "restricted") return "Case-by-case review";
  return r.status;
}

function emptyResult(
  goal: ReturnType<typeof inferGoal>,
  profile: Profile,
  reason: string,
): Recommendations {
  return {
    goal,
    profile,
    bestPathways: [],
    easiestRoutes: [],
    fastestRoutes: [],
    cheapestRoutes: [],
    prOpportunities: [],
    emptyReason: reason,
  };
}
