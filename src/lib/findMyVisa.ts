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
};

export type Recommendations = {
  goal: ReturnType<typeof inferGoal>;
  profile: Profile;
  bestPathways: RecommendationItem[];
  easiestRoutes: RecommendationItem[];
  fastestRoutes: RecommendationItem[];
  cheapestRoutes: RecommendationItem[];
  prOpportunities: RecommendationItem[];
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

  return {
    goal,
    profile,
    bestPathways,
    easiestRoutes,
    fastestRoutes,
    cheapestRoutes,
    prOpportunities,
    showLegalAdviceCallout: a.criminalRecord === "serious",
  };
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
