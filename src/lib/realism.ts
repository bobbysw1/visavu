/**
 * Realism scoring — "how likely is this visa application to succeed?"
 *
 * Distinct from `difficulty`:
 *   - difficulty asks "how much paperwork / friction / cost?" — procedural.
 *   - realism asks "given everything we know about the route (sanctions,
 *     conflict, refusal-rate context, diplomatic relations), how realistic
 *     is approval?" — operational.
 *
 * The user's question is "what are the obstacles, and how realistic is it?"
 * — that's exactly what this scalar answers. Difficulty alone undersells the
 * practical impact of, e.g., a Russian passport applying for a Schengen visa
 * (procedurally a normal Type C application, operationally extremely hard).
 *
 * Score 1–10:
 *   - 8–10 likely
 *   - 4–7 uncertain
 *   - 1–3 unlikely
 *
 * Inputs combine:
 *   1. base by status (refused → 1; restricted → 2; embassy → 6; on_arrival → 8;
 *      visa_free → 10; etc.)
 *   2. obstacle penalties: critical obstacles deduct heavily, caution moderately,
 *      info lightly.
 *   3. tiny correlation with difficulty for sanity.
 *
 * Defensive: deterministic from inputs, displayed as a bucket plus reasons,
 * never as a percentage. Same liability rationale as the difficulty meter.
 */
import type { ResolvedVisaOption, VisaStatus } from "./types";
import type { Obstacle } from "@/content/obstacles";

// Same passport-baseline idea as in difficulty: a British DN applicant has
// stronger documentation footing than an Afghan one even though the visa
// itself is identical. Realism shifts more sharply than difficulty because
// approval rates correlate strongly with passport strength.
function baselineRealismModifier(baseline: VisaStatus | null): {
  delta: number;
  text: string | null;
} {
  if (!baseline) return { delta: 0, text: null };
  switch (baseline) {
    case "visa_free":
    case "visa_free_with_eta":
    case "visa_on_arrival":
      return {
        delta: 1.5,
        text: "Visa-free baseline access — approval rates are routinely high for this passport",
      };
    case "e_visa":
      return {
        delta: 0.5,
        text: "e-Visa-eligible baseline — moderate approval-rate boost",
      };
    case "embassy_visa":
      return { delta: 0, text: null };
    case "restricted":
      return {
        delta: -2,
        text: "Restricted baseline access lowers approval likelihood across all routes",
      };
    case "refused":
      return {
        delta: -3,
        text: "Refused baseline access — long-stay routes face the same scrutiny",
      };
  }
}

export type RealismBucket = "likely" | "uncertain" | "unlikely";

export type RealismAssessment = {
  score: number; // 1..10
  bucket: RealismBucket;
  reasons: Array<{ delta: number; text: string }>;
};

const STATUS_BASE: Record<ResolvedVisaOption["status"], number> = {
  visa_free: 10,
  visa_free_with_eta: 9,
  visa_on_arrival: 9,
  e_visa: 8,
  embassy_visa: 7, // most people who apply correctly get embassy visas; obstacles can drag this down
  restricted: 3,
  refused: 1,
};

const STATUS_REASON: Record<ResolvedVisaOption["status"], string> = {
  visa_free: "No visa needed — entry is granted at the border given valid documents",
  visa_free_with_eta: "Approval is near-automatic for visa-free-with-eTA routes",
  visa_on_arrival: "Visa-on-arrival is granted at the border to qualifying travellers",
  e_visa: "e-Visa applications are commonly approved when documentation is complete",
  embassy_visa: "Embassy visa applications generally succeed when documentation is complete and ties to home are clear",
  restricted: "Restricted entry — applications reviewed case by case",
  refused: "Entry generally refused for this nationality",
};

export function assessRealism(
  option: ResolvedVisaOption,
  obstacles: Obstacle[],
  /** Tourism baseline access for the applicant's passport at this destination.
   *  British → Spain has visa_free baseline; Afghan → Spain has embassy_visa
   *  or restricted baseline. Drives realism divergence between strong and
   *  weak passports. Pass null if unknown. */
  baselineTourismStatus: VisaStatus | null = null,
): RealismAssessment {
  const reasons: RealismAssessment["reasons"] = [];
  let score = STATUS_BASE[option.status];
  reasons.push({ delta: 0, text: STATUS_REASON[option.status] });

  // Passport-baseline modifier — only applies for non-tourism cells, where
  // tourism status is meaningful "additional" context. For tourism itself the
  // status is already the same as the baseline.
  if (option.purpose !== "tourism") {
    const mod = baselineRealismModifier(baselineTourismStatus);
    if (mod.delta !== 0 && mod.text) {
      score += mod.delta;
      reasons.push({ delta: mod.delta, text: mod.text });
    }
  }

  // Obstacle effects.
  for (const o of obstacles) {
    if (o.severity === "critical") {
      // Critical obstacles wipe out most of the score.
      const delta = -5;
      score += delta;
      reasons.push({ delta, text: `${o.title.split(":")[0]} — ${o.title}` });
    } else if (o.severity === "caution") {
      const delta = -2;
      score += delta;
      reasons.push({ delta, text: `${o.title.split(":")[0]} — ${o.title}` });
    } else if (o.severity === "info") {
      const delta = -1;
      score += delta;
      reasons.push({ delta, text: o.title });
    }
  }

  // High-friction work / family routes also have approval-likelihood implications.
  if (option.purpose === "work" && option.purposeMetadata) {
    const m = option.purposeMetadata as { sponsorshipRequired?: boolean; jobOfferRequired?: boolean };
    if (m.sponsorshipRequired && m.jobOfferRequired) {
      // The hard part is securing the sponsor + offer — once that's done,
      // realism goes UP, not down. Slight bump to acknowledge the gating step
      // sits before the visa application itself.
      score += 0.5;
      reasons.push({
        delta: 0.5,
        text: "Once a sponsor + job offer are secured, visa approval is generally routine",
      });
    }
  }

  // Cap and floor.
  const final = Math.max(1, Math.min(10, Math.round(score)));
  return {
    score: final,
    bucket: bucketFor(final),
    reasons,
  };
}

export function bucketFor(score: number): RealismBucket {
  if (score >= 8) return "likely";
  if (score >= 4) return "uncertain";
  return "unlikely";
}

export const BUCKET_LABEL: Record<RealismBucket, string> = {
  likely: "Approval is likely",
  uncertain: "Approval depends on you",
  unlikely: "Approval is uncertain",
};

export const BUCKET_BLURB: Record<RealismBucket, string> = {
  likely: "Most applicants with the right paperwork get approved.",
  uncertain: "Approval depends heavily on the documents and circumstances you can show. Read the warning above — it points to what tends to move the needle.",
  unlikely: "Real-world approval is the harder hurdle here than the visa rules themselves. Treat with caution and consider alternatives.",
};
