/**
 * Visa difficulty scoring.
 *
 * The score reads as a true *difficulty* index — low = easy, high = hard.
 *
 *   Green / Easy      : 1–4
 *   Orange / Medium   : 5–6
 *   Red   / Difficult : 7–10
 *
 * Derived deterministically from the resolved option's structured fields —
 * never a free-form opinion. Same data → same score, defensible to users.
 *
 * Modifiers also produce a `reasons` list that the UI renders as a
 * "Why this score?" tooltip. Positive `delta` means the modifier ADDED
 * difficulty (e.g. sponsor required); negative `delta` means it SUBTRACTED
 * difficulty (e.g. strong baseline access).
 */
import type {
  ResolvedVisaOption,
  WorkVisaMetadata,
  FamilyVisaMetadata,
  StudyVisaMetadata,
  VisaStatus,
} from "./types";

export type DifficultyBucket = "easy" | "medium" | "hard";

// Passport-baseline modifier. Captures the meaningful difference between a
// British applicant and an Afghan applicant for the same Spain Digital Nomad
// visa: the British applicant has a clean Schengen-tourism baseline (less
// added difficulty), while the Afghan applicant has to navigate the embassy
// from scratch under heightened review (more difficulty).
//
// `baseline` is the applicant passport's TOURISM access to the destination.
function baselineDifficultyModifier(baseline: VisaStatus | null): {
  delta: number;
  text: string | null;
} {
  if (!baseline) return { delta: 0, text: null };
  switch (baseline) {
    case "visa_free":
    case "visa_free_with_eta":
    case "visa_on_arrival":
      return {
        delta: -1,
        text: "Strong baseline access — visa-free tourism eases the application footprint",
      };
    case "e_visa":
      return { delta: -0.5, text: "Mid-strength baseline — e-Visa eligibility on tourism" };
    case "embassy_visa":
      return { delta: 0, text: null };
    case "restricted":
      return {
        delta: 1.5,
        text: "Restricted tourism baseline — case-by-case review across all routes",
      };
    case "refused":
      return {
        delta: 2.5,
        text: "Entry generally refused at baseline — long-stay routes correspondingly harder",
      };
  }
}

export type DifficultyAssessment = {
  score: number; // integer 1..10 — 1 easiest, 10 hardest
  bucket: DifficultyBucket;
  reasons: Array<{ delta: number; text: string }>;
};

// Anchored so 1 = effortless visa-free entry, 10 = entry generally refused.
const STATUS_BASE: Record<ResolvedVisaOption["status"], number> = {
  visa_free: 1,
  visa_free_with_eta: 2,
  visa_on_arrival: 3,
  e_visa: 4,
  embassy_visa: 6,
  restricted: 9,
  refused: 10,
};

const STATUS_REASON: Record<ResolvedVisaOption["status"], string> = {
  visa_free: "Visa-free entry — no advance authorisation needed",
  visa_free_with_eta: "Visa-free with eTA — quick online authorisation",
  visa_on_arrival: "Visa on arrival — granted at the border",
  e_visa: "Online e-Visa — no embassy appointment",
  embassy_visa: "Embassy/consulate visa application",
  restricted: "Restricted entry — case-by-case approval",
  refused: "Entry generally refused",
};

export function assessDifficulty(
  option: ResolvedVisaOption,
  /** Tourism baseline access for the applicant's passport at this destination.
   *  Pass null when unknown — the score then ignores nationality context. */
  baselineTourismStatus: VisaStatus | null = null,
): DifficultyAssessment {
  const reasons: DifficultyAssessment["reasons"] = [];
  let score = STATUS_BASE[option.status];
  reasons.push({ delta: 0, text: STATUS_REASON[option.status] });

  // Passport-baseline modifier — only meaningful for non-tourism cells.
  // (For tourism we already use the matching status as the base; layering the
  // baseline on top would double-count.)
  if (option.purpose !== "tourism") {
    const mod = baselineDifficultyModifier(baselineTourismStatus);
    if (mod.delta !== 0 && mod.text) {
      score += mod.delta;
      reasons.push({ delta: mod.delta, text: mod.text });
    }
  }

  // Processing time penalty (only applies for non-instant statuses).
  const procMax = option.processingTimeDaysMax;
  if (procMax != null) {
    if (procMax >= 60) {
      score += 2;
      reasons.push({ delta: 2, text: `Long processing time (up to ${procMax} days)` });
    } else if (procMax >= 30) {
      score += 1;
      reasons.push({ delta: 1, text: `Multi-week processing time (up to ${procMax} days)` });
    } else if (procMax > 0 && procMax < 7) {
      score -= 0.5;
      reasons.push({ delta: -0.5, text: `Fast processing (under a week)` });
    }
  }

  // Document burden — each "yes" requirement adds friction.
  const docPenalties: Array<[boolean | null, string, number]> = [
    [option.onwardTicketRequired, "Onward / return ticket required", 0.25],
    [option.proofOfFundsRequired, "Proof of funds required", 0.5],
    [option.proofOfAccommodationRequired, "Proof of accommodation required", 0.5],
    [option.biometricsRequired, "Biometrics appointment required", 0.5],
  ];
  for (const [flag, label, delta] of docPenalties) {
    if (flag) {
      score += delta;
      reasons.push({ delta, text: label });
    }
  }

  // Long requirement lists raise complexity.
  const reqs = option.requirements?.length ?? 0;
  if (reqs >= 7) {
    score += 1;
    reasons.push({ delta: 1, text: `Long documentation list (${reqs} items)` });
  } else if (reqs >= 5) {
    score += 0.5;
    reasons.push({ delta: 0.5, text: `Moderate documentation list (${reqs} items)` });
  }

  // Purpose-specific difficulty modifiers.
  if (option.purpose === "work" && option.purposeMetadata) {
    const m = option.purposeMetadata as unknown as WorkVisaMetadata;
    if (m.sponsorshipRequired) {
      score += 1.5;
      reasons.push({ delta: 1.5, text: "Sponsor licence required" });
    }
    if (m.jobOfferRequired) {
      score += 1;
      reasons.push({ delta: 1, text: "Confirmed job offer required" });
    }
    if (m.salaryThresholdMinor && m.salaryThresholdMinor >= 35_000_00) {
      score += 1;
      reasons.push({
        delta: 1,
        text: `High salary threshold (${formatSalary(m.salaryThresholdMinor, m.salaryCurrency)})`,
      });
    }
    if (m.routeToSettlement) {
      score -= 0.5;
      reasons.push({ delta: -0.5, text: "Provides route to permanent residence" });
    }
  }

  if (option.purpose === "family" && option.purposeMetadata) {
    const m = option.purposeMetadata as unknown as FamilyVisaMetadata;
    if (m.sponsorIncomeThresholdMinor && m.sponsorIncomeThresholdMinor >= 25_000_00) {
      score += 1;
      reasons.push({
        delta: 1,
        text: `Sponsor income threshold (${formatSalary(m.sponsorIncomeThresholdMinor, m.sponsorIncomeCurrency)})`,
      });
    }
    if (m.cohabitationProofRequired) {
      score += 0.5;
      reasons.push({ delta: 0.5, text: "Cohabitation evidence required" });
    }
  }

  if (option.purpose === "study" && option.purposeMetadata) {
    const m = option.purposeMetadata as unknown as StudyVisaMetadata;
    if (m.financialProofMonthlyMinor && m.financialProofMonthlyMinor >= 1000_00) {
      score += 0.5;
      reasons.push({ delta: 0.5, text: "Significant monthly financial proof required" });
    }
    if (m.englishRequirement) {
      score += 0.5;
      reasons.push({ delta: 0.5, text: `Language requirement (${m.englishRequirement})` });
    }
  }

  // High passport-validity demand is a small friction signal.
  if (
    option.passportValidityMonthsRequired &&
    option.passportValidityMonthsRequired >= 12
  ) {
    score += 0.5;
    reasons.push({
      delta: 0.5,
      text: `12+ month passport validity required`,
    });
  }

  // Additional eTA on top is always a small friction even for visa-free.
  if (option.eta && option.status !== "visa_free_with_eta") {
    score += 0.5;
    reasons.push({ delta: 0.5, text: `Companion ${option.eta.name} also required` });
  }

  // Clamp to 1..10 integer.
  const final = Math.max(1, Math.min(10, Math.round(score)));
  return {
    score: final,
    bucket: bucketFor(final),
    reasons,
  };
}

export function bucketFor(score: number): DifficultyBucket {
  if (score >= 7) return "hard";
  if (score >= 5) return "medium";
  return "easy";
}

export const BUCKET_LABEL: Record<DifficultyBucket, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Difficult",
};

export const BUCKET_BLURB: Record<DifficultyBucket, string> = {
  easy: "Quick to obtain, light documentation, fast turnaround. Difficulty 1–4.",
  medium: "Some paperwork and processing time. Start a few weeks ahead. Difficulty 5–6.",
  hard: "Lots of documentation, eligibility thresholds, or a sponsor required. Start months ahead and consider professional advice. Difficulty 7–10.",
};

export const BUCKET_RANGE: Record<DifficultyBucket, string> = {
  easy: "1–4",
  medium: "5–6",
  hard: "7–10",
};

/**
 * Single source of truth for the difficulty colour palette. Every component
 * that surfaces a difficulty bucket imports from here so colours stay aligned
 * across DifficultyMeter, DifficultyBucketGrid, DifficultyHeatMap, filter
 * pills, the heatmap legend, and the DirectAnswerCard tone band.
 */
export const BUCKET_PALETTE: Record<DifficultyBucket, {
  dot: string;
  chip: string;
  bar: string;
  tile: string;
  tileDim: string;
  border: string;
  ring: string;
  pillOn: string;
  pillOff: string;
  label: string;
}> = {
  easy: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
    bar: "bg-emerald-500",
    tile: "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 ring-emerald-300 dark:ring-emerald-700 text-emerald-950 dark:text-emerald-50",
    tileDim: "bg-emerald-50/40 dark:bg-emerald-950/20 ring-emerald-200/40 dark:ring-emerald-900/40 text-emerald-900/50 dark:text-emerald-200/40",
    border: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20",
    ring: "ring-emerald-300 dark:ring-emerald-700",
    pillOn: "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600",
    pillOff: "bg-transparent text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
    label: "Easy",
  },
  medium: {
    dot: "bg-orange-500",
    chip: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200",
    bar: "bg-orange-500",
    tile: "bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/40 dark:hover:bg-orange-900/60 ring-orange-300 dark:ring-orange-700 text-orange-950 dark:text-orange-50",
    tileDim: "bg-orange-50/40 dark:bg-orange-950/20 ring-orange-200/40 dark:ring-orange-900/40 text-orange-900/50 dark:text-orange-200/40",
    border: "border-orange-200 dark:border-orange-900 bg-orange-50/40 dark:bg-orange-950/20",
    ring: "ring-orange-300 dark:ring-orange-700",
    pillOn: "bg-orange-500 text-white border-orange-500 hover:bg-orange-600",
    pillOff: "bg-transparent text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30",
    label: "Medium",
  },
  hard: {
    dot: "bg-red-500",
    chip: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
    bar: "bg-red-500",
    tile: "bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 ring-red-300 dark:ring-red-700 text-red-950 dark:text-red-50",
    tileDim: "bg-red-50/40 dark:bg-red-950/20 ring-red-200/40 dark:ring-red-900/40 text-red-900/50 dark:text-red-200/40",
    border: "border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20",
    ring: "ring-red-300 dark:ring-red-700",
    pillOn: "bg-red-500 text-white border-red-500 hover:bg-red-600",
    pillOff: "bg-transparent text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/30",
    label: "Difficult",
  },
};

function formatSalary(minor: number, currency: string | undefined): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency ?? "USD",
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(0)} ${currency ?? ""}`.trim();
  }
}
