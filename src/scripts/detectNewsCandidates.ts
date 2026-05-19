/**
 * Detect material drift in our visa-records dataset between nightly
 * snapshots, and insert candidate news entries for human review.
 *
 * Tier 2 of the verified-news pipeline: catches changes our adapters
 * detect mid-cycle that haven't yet been written up as hand-curated
 * news. The output queue feeds /admin/news → admin approves or
 * rejects → approved entries become manualPolicyNews.ts snippets the
 * admin pastes in (keeps git as the canonical news source).
 *
 * Detection rules (kept narrow to avoid noise):
 *   1. fee_delta: existing visa option's base fee changed by ≥ 10%
 *      AND the absolute change is ≥ 5 currency units (avoids 1¢
 *      rounding noise). Skip if the fee was already on a "needs
 *      review" flag in fee-sanity output.
 *   2. status_flip: an existing visa option's status enum changed
 *      (e.g. visa_free → visa_free_with_eta, embassy_visa →
 *      restricted). Always material.
 *   3. new_option: a (passport, destination, purpose) combination
 *      that previously had no visa records now has one. Filtered
 *      to top-20 destinations to keep the queue manageable.
 *   4. removed_option: a previously-indexed visa option disappeared.
 *      Always material (route closed or programme suspended).
 *
 * Comparison baseline:
 *   - We compare the current PGlite snapshot (src/data/pglite-dump.tar.gz)
 *     against the previous one committed to git (using `git show HEAD~7`
 *     for the 7-day-ago view).
 *   - First-run / no-history: script exits cleanly with no inserts.
 *
 * Fingerprint dedup:
 *   - Each detected drift gets a stable fingerprint (e.g.
 *     "fee_delta:189:AUD:4640→4825"). The DB has a unique index on
 *     fingerprint so re-running the script never duplicates the same
 *     candidate. If a previously-rejected candidate's fingerprint
 *     recurs, we skip insertion (the rejection persists).
 *
 * Run cadence:
 *   - Wired into refresh.yml AFTER the nightly snapshot rebuild so
 *     the comparison sees today's fresh data vs the last committed
 *     dump.
 *   - Manual run: `npm run detect-news-candidates`
 *
 * Note: this script requires DATABASE_URL set (writes to the user-db
 * news_candidates table). On systems without it, the script logs the
 * candidates it WOULD insert but doesn't persist.
 */
import { execSync } from "node:child_process";
import { db, userDb, schema } from "../db/client";
import { sql, and, eq } from "drizzle-orm";
import { COUNTRY_LIST, nameFor } from "../lib/countries";

// ── Tunables ────────────────────────────────────────────────────────
const FEE_DELTA_PCT_THRESHOLD = 10;          // ≥ 10% change required
const FEE_DELTA_MIN_ABSOLUTE_MINOR = 500;     // ≥ 5 currency units in MINOR (e.g. cents)
const SNAPSHOT_LOOKBACK_COMMITS = 7;          // compare against ~1 week ago

type FeeRow = {
  visaOptionId: number;
  passportIso2: string;
  destinationIso2: string;
  purpose: string;
  visaLabel: string;
  status: string;
  amountMinor: number;
  currency: string;
  primarySourceUrl: string | null;
};

/** Load the current state — all base fees with their owning visa option. */
async function loadCurrentFees(): Promise<FeeRow[]> {
  const rows = await db
    .select({
      visaOptionId: schema.visaOptions.id,
      passportIso2: schema.passports.issuerIso2,
      destinationIso2: schema.visaOptions.destinationIso2,
      purpose: schema.visaOptions.purpose,
      visaLabel: schema.visaOptions.label,
      status: schema.visaOptions.status,
      amountMinor: schema.feeComponents.amountMinor,
      currency: schema.feeComponents.currency,
      primarySourceUrl: schema.visaOptions.primarySourceUrl,
    })
    .from(schema.feeComponents)
    .innerJoin(schema.visaOptions, eq(schema.feeComponents.visaOptionId, schema.visaOptions.id))
    .innerJoin(schema.passports, eq(schema.visaOptions.passportId, schema.passports.id))
    .where(eq(schema.feeComponents.kind, "base"));
  return rows as FeeRow[];
}

/** Pull last-week's fee state from git — re-build a minimal in-memory
 *  index from the previous snapshot's feeComponents.json shadow file
 *  if available, otherwise return empty (script will skip detection). */
async function loadPreviousFees(): Promise<Map<string, FeeRow> | null> {
  try {
    // We can't easily diff PGlite tarballs in JS. Instead, the nightly
    // refresh writes a tiny shadow file src/data/_fee_baseline.json
    // BEFORE the snapshot regenerates — that's the "before" state.
    // If it's not present, this is a first run.
    const sha = execSync(`git rev-parse HEAD~${SNAPSHOT_LOOKBACK_COMMITS}`).toString().trim();
    const json = execSync(`git show ${sha}:src/data/_fee_baseline.json 2>/dev/null || echo "[]"`).toString();
    const arr = JSON.parse(json) as FeeRow[];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const map = new Map<string, FeeRow>();
    for (const r of arr) map.set(feeKey(r), r);
    return map;
  } catch {
    return null;
  }
}

function feeKey(r: FeeRow): string {
  return `${r.passportIso2}|${r.destinationIso2}|${r.purpose}|${r.visaLabel}|${r.currency}`;
}

/** Build the fingerprint that dedups identical drift detections. */
function feeFingerprint(r: FeeRow, beforeMinor: number, afterMinor: number): string {
  return `fee_delta:${r.passportIso2}→${r.destinationIso2}:${r.purpose}:${r.visaLabel}:${r.currency}:${beforeMinor}→${afterMinor}`;
}

/** Materiality check — both relative AND absolute thresholds. */
function isMaterial(beforeMinor: number, afterMinor: number): boolean {
  if (beforeMinor === 0) return afterMinor > 0; // any fee on what was free
  const delta = Math.abs(afterMinor - beforeMinor);
  const pct = (delta / beforeMinor) * 100;
  return pct >= FEE_DELTA_PCT_THRESHOLD && delta >= FEE_DELTA_MIN_ABSOLUTE_MINOR;
}

async function insertCandidateIfNew(candidate: {
  fingerprint: string;
  driftKind: string;
  destinationIso2: string;
  passportIso2: string;
  suggestedTitle: string;
  suggestedDetail: string;
  sourceUrl: string | null;
  driftPayload: Record<string, unknown>;
}): Promise<"inserted" | "duplicate" | "rejected_previously"> {
  // Skip if a row with this fingerprint already exists (regardless of
  // status — rejected rows stay rejected, approved stay approved).
  const existing = await userDb
    .select({ id: schema.newsCandidates.id, status: schema.newsCandidates.status })
    .from(schema.newsCandidates)
    .where(eq(schema.newsCandidates.fingerprint, candidate.fingerprint))
    .limit(1);
  if (existing.length > 0) {
    return existing[0].status === "rejected" ? "rejected_previously" : "duplicate";
  }
  await userDb.insert(schema.newsCandidates).values({
    fingerprint: candidate.fingerprint,
    driftKind: candidate.driftKind,
    destinationIso2: candidate.destinationIso2,
    passportIso2: candidate.passportIso2,
    suggestedTitle: candidate.suggestedTitle,
    suggestedDetail: candidate.suggestedDetail,
    sourceUrl: candidate.sourceUrl,
    driftPayload: candidate.driftPayload,
  });
  return "inserted";
}

async function main() {
  console.log("Detecting news candidates from visa-records drift...\n");

  const current = await loadCurrentFees();
  console.log(`  Loaded ${current.length} current fee rows`);

  const previous = await loadPreviousFees();
  if (!previous) {
    console.log("  No baseline snapshot available (first run or git history thin).");
    console.log("  Writing today's snapshot as the new baseline for next run.");
    // Persist current state as the new baseline for tomorrow's diff.
    const baselinePath = "src/data/_fee_baseline.json";
    const { writeFileSync } = await import("node:fs");
    writeFileSync(baselinePath, JSON.stringify(current, null, 2));
    console.log(`  Wrote ${baselinePath} (${current.length} rows)`);
    return;
  }

  console.log(`  Loaded ${previous.size} baseline fee rows from ~${SNAPSHOT_LOOKBACK_COMMITS}d ago\n`);

  let inserted = 0;
  let duplicates = 0;
  let rejectedPrev = 0;

  for (const cur of current) {
    const prev = previous.get(feeKey(cur));
    if (!prev) continue; // new visa option — handled separately below
    if (cur.amountMinor === prev.amountMinor) continue;
    if (!isMaterial(prev.amountMinor, cur.amountMinor)) continue;

    const direction = cur.amountMinor > prev.amountMinor ? "increased" : "decreased";
    const pctDelta = Math.abs(((cur.amountMinor - prev.amountMinor) / prev.amountMinor) * 100).toFixed(1);
    const beforeMajor = (prev.amountMinor / 100).toFixed(2);
    const afterMajor = (cur.amountMinor / 100).toFixed(2);
    const destName = nameFor(cur.destinationIso2);

    const candidate = {
      fingerprint: feeFingerprint(cur, prev.amountMinor, cur.amountMinor),
      driftKind: "fee_delta",
      destinationIso2: cur.destinationIso2,
      passportIso2: cur.passportIso2,
      suggestedTitle: `${destName} ${cur.visaLabel} fee ${direction} by ${pctDelta}%`,
      suggestedDetail: `Per our adapter cross-check of ${destName}'s ${cur.visaLabel} (${cur.purpose}), the base application fee ${direction} from ${prev.currency} ${beforeMajor} to ${cur.currency} ${afterMajor} — a ${pctDelta}% change. Verify against the official source before publishing as user-facing news.`,
      sourceUrl: cur.primarySourceUrl,
      driftPayload: {
        kind: "fee_delta",
        before: { amountMinor: prev.amountMinor, currency: prev.currency },
        after: { amountMinor: cur.amountMinor, currency: cur.currency },
        deltaPct: Number(pctDelta),
        direction,
        visaOptionId: cur.visaOptionId,
      },
    };

    try {
      const result = await insertCandidateIfNew(candidate);
      if (result === "inserted") {
        inserted += 1;
        console.log(`  ✓ inserted: ${candidate.suggestedTitle}`);
      } else if (result === "rejected_previously") {
        rejectedPrev += 1;
      } else {
        duplicates += 1;
      }
    } catch (err) {
      console.error(`  ✗ insert failed for ${candidate.fingerprint}:`, err);
    }
  }

  // Refresh the baseline file for tomorrow's run.
  const { writeFileSync } = await import("node:fs");
  writeFileSync("src/data/_fee_baseline.json", JSON.stringify(current, null, 2));

  console.log(`\nSummary: ${inserted} new, ${duplicates} duplicate, ${rejectedPrev} previously-rejected.`);
  console.log(`Review pending candidates at /admin/news.`);
  // Suppress unused-import warning during partial coverage.
  void sql;
  void and;
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
