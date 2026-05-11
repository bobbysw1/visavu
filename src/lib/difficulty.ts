/**
 * Visa difficulty scoring.
 *
 *   Green / Easy   : 8–10
 *   Amber / Medium : 4–7
 *   Red / Hard     : 1–3
 *
 * The score is derived deterministically from the resolved option's
 * structured fields — never from a free-form opinion. That makes it
 * defensible to users and consistent across pages: same data → same score.
 *
 * Modifiers also produce a `reasons` list that the UI renders as a
 * "Why this score?" tooltip, so users understand what's driving the bucket.
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
// visa: the British applicant has a clean Schengen-tourism baseline (no prior
// embassy hurdle, lower base scrutiny), while the Afghan applicant has to
// navigate the embassy from scratch under heightened review.
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
        delta: 1,
        text: "Strong baseline access — visa-free tourism eases the application footprint",
      };
    case "e_visa":
      return { delta: 0.5, text: "Mid-strength baseline — e-Visa eligibility on tourism" };
    case "embassy_visa":
      return { delta: 0, text: null };
    case "restricted":
      return {
        delta: -1.5,
        text: "Restricted tourism baseline — case-by-case review across all routes",
      };
    case "refused":
      return {
        delta: -2.5,
        text: "Entry generally refused at baseline — long-stay routes correspondingly harder",
      };
  }
}

export type DifficultyAssessment = {
  score: number; // integer 1..10
  bucket: DifficultyBucket;
  reasons: Array<{ delta: number; text: string }>;
};

const STATUS_BASE: Record<ResolvedVisaOption["status"], number> = {
  visa_free: 10,
  visa_free_with_eta: 9,
  visa_on_arrival: 8,
  e_visa: 7,
  embassy_visa: 5,
  restricted: 2,
  refused: 1,
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
      score -= 2;
      reasons.push({ delta: -2, text: `Long processing time (up to ${procMax} days)` });
    } else if (procMax >= 30) {
      score -= 1;
      reasons.push({ delta: -1, text: `Multi-week processing time (up to ${procMax} days)` });
    } else if (procMax > 0 && procMax < 7) {
      score += 0.5;
      reasons.push({ delta: 0.5, text: `Fast processing (under a week)` });
    }
  }

  // Document burden — each "yes" requirement adds friction.
  const docPenalties: Array<[boolean | null, string, number]> = [
    [option.onwardTicketRequired, "Onward / return ticket required", -0.25],
    [option.proofOfFundsRequired, "Proof of funds required", -0.5],
    [option.proofOfAccommodationRequired, "Proof of accommodation required", -0.5],
    [option.biometricsRequired, "Biometrics appointment required", -0.5],
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
    score -= 1;
    reasons.push({ delta: -1, text: `Long documentation list (${reqs} items)` });
  } else if (reqs >= 5) {
    score -= 0.5;
    reasons.push({ delta: -0.5, text: `Moderate documentation list (${reqs} items)` });
  }

  // Purpose-specific difficulty modifiers.
  if (option.purpose === "work" && option.purposeMetadata) {
    const m = option.purposeMetadata as unknown as WorkVisaMetadata;
    if (m.sponsorshipRequired) {
      score -= 1.5;
      reasons.push({ delta: -1.5, text: "Sponsor licence required" });
    }
    if (m.jobOfferRequired) {
      score -= 1;
      reasons.push({ delta: -1, text: "Confirmed job offer required" });
    }
    if (m.salaryThresholdMinor && m.salaryThresholdMinor >= 35_000_00) {
      score -= 1;
      reasons.push({
        delta: -1,
        text: `High salary threshold (${formatSalary(m.salaryThresholdMinor, m.salaryCurrency)})`,
      });
    }
    if (m.routeToSettlement) {
      score += 0.5;
      reasons.push({ delta: 0.5, text: "Provides route to permanent residence" });
    }
  }

  if (option.purpose === "family" && option.purposeMetadata) {
    const m = option.purposeMetadata as unknown as FamilyVisaMetadata;
    if (m.sponsorIncomeThresholdMinor && m.sponsorIncomeThresholdMinor >= 25_000_00) {
      score -= 1;
      reasons.push({
        delta: -1,
        text: `Sponsor income threshold (${formatSalary(m.sponsorIncomeThresholdMinor, m.sponsorIncomeCurrency)})`,
      });
    }
    if (m.cohabitationProofRequired) {
      score -= 0.5;
      reasons.push({ delta: -0.5, text: "Cohabitation evidence required" });
    }
  }

  if (option.purpose === "study" && option.purposeMetadata) {
    const m = option.purposeMetadata as unknown as StudyVisaMetadata;
    if (m.financialProofMonthlyMinor && m.financialProofMonthlyMinor >= 1000_00) {
      score -= 0.5;
      reasons.push({ delta: -0.5, text: "Significant monthly financial proof required" });
    }
    if (m.englishRequirement) {
      score -= 0.5;
      reasons.push({ delta: -0.5, text: `Language requirement (${m.englishRequirement})` });
    }
  }

  // High passport-validity demand is a small friction signal.
  if (
    option.passportValidityMonthsRequired &&
    option.passportValidityMonthsRequired >= 12
  ) {
    score -= 0.5;
    reasons.push({
      delta: -0.5,
      text: `12+ month passport validity required`,
    });
  }

  // Additional eTA on top is always a small friction even for visa-free.
  if (option.eta && option.status !== "visa_free_with_eta") {
    score -= 0.5;
    reasons.push({ delta: -0.5, text: `Companion ${option.eta.name} also required` });
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
  if (score >= 8) return "easy";
  if (score >= 4) return "medium";
  return "hard";
}

export const BUCKET_LABEL: Record<DifficultyBucket, string> = {
  easy: "Quick paperwork",
  medium: "Moderate paperwork",
  hard: "Heavy paperwork",
};

export const BUCKET_BLURB: Record<DifficultyBucket, string> = {
  easy: "Quick to obtain, light documentation, fast turnaround.",
  medium: "Some paperwork and processing time. Start a few weeks ahead.",
  hard: "Lots of documentation, eligibility thresholds, or a sponsor required. Start months ahead and consider professional advice.",
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
