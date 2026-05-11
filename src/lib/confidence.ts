import type { ConfidenceBucket } from "./types";

// Two scalars: correctness (cross-source agreement weighted by field) and
// freshness (decay from `last_verified_at`, not `last_fetched_at`).
//
// We expose both as buckets, never as percentages — "94% confident" implies
// precision the data does not have, and is a worse liability posture.

export type SourceAssertion = {
  sourceId: string;
  sourceKind:
    | "government"
    | "embassy"
    | "wikipedia"
    | "wikidata"
    | "regional_bloc"
    | "manual";
  // Field-level weight (0..1). Government wins on cost/processing_time.
  // Wikipedia wins on coverage. Defaults are in `defaultFieldWeight`.
  fieldWeights?: Record<string, number>;
  // The asserted values for each tracked field.
  values: Record<string, unknown>;
  fetchedAt: Date;
};

/** Per-source-kind authority weights for each field. Surfaced on /methodology. */
export const CORRECTNESS_WEIGHTS: Record<
  SourceAssertion["sourceKind"],
  Record<string, number>
> = {
  // Government sites ARE the source for these facts. Treat them as authoritative.
  government: { status: 1.0, cost: 1.0, processing_time: 1.0, application_url: 1.0, max_stay_days: 1.0, requirements: 0.9 },
  embassy: { status: 0.95, cost: 0.95, processing_time: 0.9, application_url: 0.95, max_stay_days: 0.9, requirements: 0.85 },
  regional_bloc: { status: 0.9, max_stay_days: 0.9, requirements: 0.7, cost: 0.5, processing_time: 0.5 },
  wikipedia: { status: 0.6, max_stay_days: 0.6, requirements: 0.4, cost: 0.3, processing_time: 0.2, application_url: 0.2, coverage: 1.0 },
  wikidata: { status: 0.65, max_stay_days: 0.6, coverage: 0.9 },
  manual: { status: 0.85, cost: 0.8, processing_time: 0.7, application_url: 0.85, max_stay_days: 0.85, requirements: 0.8 },
};

export function fieldWeight(
  source: SourceAssertion,
  field: string,
): number {
  return (
    source.fieldWeights?.[field] ??
    CORRECTNESS_WEIGHTS[source.sourceKind]?.[field] ??
    0.5
  );
}

// Correctness for a single field: agreement-weighted average of source weights.
// If the highest-weight source has no agreeing peer, we still trust it but
// cap correctness at "medium" until corroborated.
export function fieldCorrectness(
  field: string,
  sources: SourceAssertion[],
): ConfidenceBucket {
  if (sources.length === 0) return "unverified";

  const weighted = sources.map((s) => ({
    value: JSON.stringify(s.values[field] ?? null),
    weight: fieldWeight(s, field),
  }));

  // Group by value, sum weights.
  const groups = new Map<string, number>();
  for (const w of weighted) {
    groups.set(w.value, (groups.get(w.value) ?? 0) + w.weight);
  }

  const sorted = [...groups.entries()].sort((a, b) => b[1] - a[1]);
  const topWeight = sorted[0][1];
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  const agreementRatio = topWeight / totalWeight;

  // No corroboration (single source covering this field): cap at medium.
  const corroboratingSources = sources.filter(
    (s) => fieldWeight(s, field) > 0 && JSON.stringify(s.values[field] ?? null) === sorted[0][0],
  ).length;

  const hasDisagreement = groups.size > 1;

  // High confidence:
  //   - 2+ sources agree with combined weight >= 1.5, OR
  //   - a single primary-authoritative source (weight >= 1.0) AND no other
  //     source is contradicting it. For facts where there is literally one
  //     canonical source (e.g. US VWP membership lives only on state.gov),
  //     forcing corroboration would permanently cap confidence at medium —
  //     that's a misleading signal. But active disagreement always blocks high.
  if (corroboratingSources >= 2 && agreementRatio >= 0.85 && topWeight >= 1.5) return "high";
  if (topWeight >= 1.0 && !hasDisagreement) return "high";
  if (corroboratingSources >= 2 && agreementRatio >= 0.7) return "medium";
  if (topWeight >= 0.85) return "medium"; // single near-authority source, or disputed primary
  if (topWeight >= 0.5) return "low";
  return "low";
}

// Record-level correctness: minimum across the load-bearing fields.
// Load-bearing = the fields a user actually decides on (status, cost, max_stay).
const LOAD_BEARING = ["status", "cost", "max_stay_days"];

export function recordCorrectness(sources: SourceAssertion[]): ConfidenceBucket {
  if (sources.length === 0) return "unverified";
  const buckets = LOAD_BEARING.map((f) => fieldCorrectness(f, sources));
  if (buckets.includes("unverified")) return "unverified";
  if (buckets.includes("low")) return "low";
  if (buckets.includes("medium")) return "medium";
  return "high";
}

// Freshness decay. `lastVerifiedAt` is the timestamp of last cross-source
// agreement OR human review — NOT last fetch.
export function freshnessBucket(
  lastVerifiedAt: Date | null,
  now: Date = new Date(),
): ConfidenceBucket {
  if (!lastVerifiedAt) return "unverified";
  const days = (now.getTime() - lastVerifiedAt.getTime()) / 86_400_000;
  if (days <= 30) return "high";
  if (days <= 90) return "medium";
  if (days <= 180) return "low";
  return "unverified";
}

// Combined confidence: the WORSE of correctness and freshness. A correct-but-
// stale record is downgraded; a fresh-but-uncorroborated record is downgraded.
export function combinedBucket(
  correctness: ConfidenceBucket,
  freshness: ConfidenceBucket,
): ConfidenceBucket {
  const order: ConfidenceBucket[] = ["unverified", "low", "medium", "high"];
  const ci = order.indexOf(correctness);
  const fi = order.indexOf(freshness);
  return order[Math.min(ci, fi)];
}
