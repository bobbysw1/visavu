/**
 * Smart-questionnaire flow types + answer-inference functions.
 *
 * The wizard collects 12 fields. Pure functions in this file turn the
 * answers into the inputs we already have engines for:
 *
 *   - `inferGoal()` → FinderGoal (drives the destination search query)
 *   - `inferProfile()` → Profile (drives the visa-option pathway sort)
 *   - `goalScore()` etc. — recommendation ranking weights
 *
 * Keeping inference here (pure, server- and client-safe, fully testable)
 * means the wizard UI and the server action share the same logic.
 *
 * Deliberate non-goal: this module does NOT decide who can/can't apply
 * for a visa. Eligibility is the destination authority's call (see
 * /disclaimer). We rank routes; we never gatekeep them.
 */
import type { FinderGoal } from "./finder";
import type { Profile } from "./profiles";

export type EducationLevel =
  | "high_school"
  | "trade_cert"
  | "associate"
  | "bachelors"
  | "masters"
  | "doctorate";

export type Occupation =
  | "healthcare"
  | "engineering_tech"
  | "trades"
  | "education_research"
  | "finance_legal"
  | "creative_media"
  | "service_hospitality"
  | "agriculture"
  | "executive_management"
  | "self_employed"
  | "student"
  | "retired"
  | "other";

export type IncomeBand =
  | "under_25k"
  | "25_50k"
  | "50_100k"
  | "100_200k"
  | "200k_plus";

export type NetWorthBand =
  | "under_100k"
  | "100k_500k"
  | "500k_2m"
  | "2m_5m"
  | "5m_plus";

export type InvestmentCapital =
  | "none"
  | "under_100k"
  | "100k_500k"
  | "500k_2m"
  | "2m_plus";

export type FamilyStatus =
  | "single"
  | "partner_unmarried"
  | "married_no_kids"
  | "married_with_kids"
  | "single_parent";

export type RemoteWork =
  | "yes_employer"
  | "yes_freelance"
  | "yes_own_business"
  | "no";

export type Timeline =
  | "0_6_months"
  | "6_12_months"
  | "1_2_years"
  | "2_5_years"
  | "no_rush";

export type LongTermGoal =
  | "citizenship"
  | "permanent_residency"
  | "long_stay_no_pr"
  | "short_term_stay";

export type CriminalRecord = "none" | "minor" | "serious";

export type QuestionnaireGoal =
  | "permanent_move"
  | "live_a_few_years"
  | "digital_nomad"
  | "study"
  | "retire"
  | "invest"
  | "visit";

export type QuestionnaireAnswers = {
  passportIso2: string;
  desiredDestinationIso2?: string | null;
  goal: QuestionnaireGoal;
  educationLevel?: EducationLevel | null;
  occupation?: Occupation | null;
  income?: IncomeBand | null;
  netWorth?: NetWorthBand | null;
  investmentCapital?: InvestmentCapital | null;
  familyStatus?: FamilyStatus | null;
  /** ISO 639 language codes the applicant speaks well. */
  languages?: string[];
  remoteWork?: RemoteWork | null;
  timeline?: Timeline | null;
  longTermGoals?: LongTermGoal[];
  criminalRecord?: CriminalRecord | null;
};

// ---- Inference ----

export function inferGoal(a: QuestionnaireAnswers): FinderGoal {
  // Trust the user's stated goal, but with a few overrides for incoherent
  // combinations (e.g. user says "permanent move" but their goal is
  // actually retirement based on age/income — we use the explicit `goal`
  // first; secondary signals only fill in when goal is ambiguous).
  switch (a.goal) {
    case "visit":
      return "visit";
    case "study":
      return "study";
    case "retire":
      return "retire";
    case "invest":
      return "invest";
    case "digital_nomad":
      return "remote_work";
    case "live_a_few_years":
      return "live_work";
    case "permanent_move":
      // Permanent move + capital ≥ $500k → invest pathway wins for older
      // applicants who're effectively buying residency.
      if (
        (a.investmentCapital === "500k_2m" || a.investmentCapital === "2m_plus") &&
        a.occupation === "retired"
      ) {
        return "invest";
      }
      return "live_work";
  }
}

export function inferProfile(a: QuestionnaireAnswers): Profile {
  // Capital first — HNWI signals dwarf everything else for ranking.
  if (a.netWorth === "5m_plus" || a.netWorth === "2m_5m") return "hnwi";
  if (a.investmentCapital === "2m_plus") return "investor";
  if (a.investmentCapital === "500k_2m") return "investor";

  // Occupation-driven mappings.
  switch (a.occupation) {
    case "healthcare":
      return "doctor";
    case "engineering_tech":
      return "engineer";
    case "trades":
      return "trade_worker";
    case "self_employed":
      return "entrepreneur";
    case "retired":
      return "retiree";
    case "student":
      return "student";
    default:
      break;
  }

  // Remote work strongly implies digital-nomad / remote-worker profiles.
  if (a.remoteWork === "yes_employer" || a.remoteWork === "yes_freelance") {
    return "remote_worker";
  }
  if (a.remoteWork === "yes_own_business") return "entrepreneur";

  // Education-only signals.
  if (a.educationLevel === "doctorate" || a.educationLevel === "masters") return "engineer"; // generic high-skill default
  if (a.educationLevel === "high_school" && !a.occupation) return "high_school_graduate";

  // Goal-derived fallbacks.
  if (a.goal === "retire") return "retiree";
  if (a.goal === "digital_nomad") return "digital_nomad";
  if (a.goal === "invest") return "investor";
  if (a.goal === "study") return "student";

  return "engineer"; // most permissive bucket for "skilled worker" fallback
}

/** Heuristic: how many years until the applicant can be in-country? */
export function timelineToDays(t: Timeline | null | undefined): number {
  if (!t) return 365;
  return {
    "0_6_months": 180,
    "6_12_months": 365,
    "1_2_years": 730,
    "2_5_years": 1825,
    no_rush: 3650,
  }[t];
}

/** Total investment capital in USD (point estimate at low end of band). */
export function capitalToUsd(c: InvestmentCapital | null | undefined): number {
  if (!c) return 0;
  return { none: 0, under_100k: 50_000, "100k_500k": 250_000, "500k_2m": 1_000_000, "2m_plus": 2_500_000 }[c];
}

export function annualIncomeToUsd(i: IncomeBand | null | undefined): number {
  if (!i) return 0;
  return { under_25k: 15_000, "25_50k": 37_500, "50_100k": 75_000, "100_200k": 150_000, "200k_plus": 300_000 }[i];
}

// ---- Wizard step model ----
//
// Steps are descriptive metadata so the UI can render a consistent progress
// bar / table of contents. The wizard itself decides which steps to skip
// based on `goal` (e.g. visit-only doesn't need income / family / capital).

export type StepId =
  | "nationality"
  | "destination"
  | "goal"
  | "education_occupation"
  | "income_capital"
  | "family"
  | "language"
  | "remote_work"
  | "timeline"
  | "long_term_goals"
  | "criminal_record"
  | "review";

export const STEP_ORDER: StepId[] = [
  "nationality",
  "goal",
  "destination",
  "education_occupation",
  "income_capital",
  "family",
  "language",
  "remote_work",
  "timeline",
  "long_term_goals",
  "criminal_record",
  "review",
];

/**
 * Visible-step decision for the current answers. Returning a subset of
 * STEP_ORDER lets the UI skip irrelevant questions for a given goal
 * ("visit" doesn't need income / family / capital).
 */
export function visibleSteps(a: Partial<QuestionnaireAnswers>): StepId[] {
  const all = STEP_ORDER;
  if (a.goal === "visit") {
    return all.filter((s) =>
      ["nationality", "goal", "destination", "criminal_record", "review"].includes(s),
    );
  }
  if (a.goal === "retire") {
    return all.filter((s) =>
      [
        "nationality",
        "goal",
        "destination",
        "income_capital",
        "family",
        "language",
        "timeline",
        "long_term_goals",
        "criminal_record",
        "review",
      ].includes(s),
    );
  }
  if (a.goal === "invest") {
    return all.filter((s) =>
      [
        "nationality",
        "goal",
        "destination",
        "income_capital",
        "family",
        "timeline",
        "long_term_goals",
        "criminal_record",
        "review",
      ].includes(s),
    );
  }
  if (a.goal === "digital_nomad") {
    return all.filter((s) =>
      [
        "nationality",
        "goal",
        "destination",
        "occupation_education",
        "education_occupation",
        "income_capital",
        "remote_work",
        "language",
        "timeline",
        "criminal_record",
        "review",
      ].includes(s),
    );
  }
  if (a.goal === "study") {
    return all.filter((s) =>
      [
        "nationality",
        "goal",
        "destination",
        "education_occupation",
        "income_capital",
        "language",
        "timeline",
        "long_term_goals",
        "criminal_record",
        "review",
      ].includes(s),
    );
  }
  return all;
}

export const GOAL_LABEL: Record<QuestionnaireGoal, { label: string; emoji: string; subtitle: string }> = {
  permanent_move: { label: "Move permanently", emoji: "🏡", subtitle: "Settle long-term with a path to PR" },
  live_a_few_years: { label: "Live there a few years", emoji: "✈️", subtitle: "Working visa, expat assignment, or extended stay" },
  digital_nomad: { label: "Work remotely abroad", emoji: "💻", subtitle: "Digital-nomad / remote-worker visas" },
  study: { label: "Study abroad", emoji: "🎓", subtitle: "Undergraduate, postgrad, or research" },
  retire: { label: "Retire abroad", emoji: "🌅", subtitle: "Passive-income / pension routes" },
  invest: { label: "Invest for residency", emoji: "💎", subtitle: "Golden visa / investor routes" },
  visit: { label: "Visit short-term", emoji: "🧳", subtitle: "Tourism, business, or transit" },
};
