/**
 * Source-health queries — power the /admin/sources dashboard and
 * the public /sources page with live data instead of hand-written copy.
 *
 * Each registered adapter is joined against:
 *   - its most-recent source_records row (last-fetched timestamp, parser
 *     version, hash, parse_error)
 *   - the count of visa_options whose verification_events reference it
 *
 * Adapters that have never run yet appear with `lastFetchedAt: null` so the
 * dashboard distinguishes "never fetched" from "stale".
 */
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { ADAPTERS } from "@/scrapers/sources";
import type { Adapter } from "@/scrapers/base/Adapter";

export type SourceHealth = {
  id: string;
  name: string;
  kind: Adapter["metadata"]["kind"];
  parserVersion: string;
  primaryUrl: string | null;
  defaultIntervalMs: number;
  lastFetchedAt: string | null;
  lastParserVersion: string | null;
  lastHash: string | null;
  parseError: string | null;
  recordCount: number; // visa_options touched by this adapter (latest verification_event.actor)
  isOverdue: boolean;
  hasFixture: boolean;
};

export async function sourceHealthSnapshot(): Promise<SourceHealth[]> {
  const now = Date.now();

  // Map adapter id → most-recent source_records row.
  const recentBySource = new Map<string, {
    fetchedAt: Date;
    parserVersion: string;
    rawHash: string | null;
    parseError: string | null;
  }>();
  const recentRows = await db
    .select({
      sourceId: schema.sourceRecords.sourceId,
      fetchedAt: schema.sourceRecords.fetchedAt,
      parserVersion: schema.sourceRecords.parserVersion,
      rawHash: schema.sourceRecords.rawHash,
      parseError: schema.sourceRecords.parseError,
    })
    .from(schema.sourceRecords)
    .orderBy(desc(schema.sourceRecords.fetchedAt))
    .limit(500);
  for (const r of recentRows) {
    if (!recentBySource.has(r.sourceId)) recentBySource.set(r.sourceId, r);
  }

  // verification_events are fired with actor=adapterId; grouping gives us a
  // count of distinct visa_options that this adapter populated.
  const ownershipRows = await db
    .select({
      actor: schema.verificationEvents.actor,
      n: sql<number>`COUNT(DISTINCT ${schema.verificationEvents.visaOptionId})::int`,
    })
    .from(schema.verificationEvents)
    .groupBy(schema.verificationEvents.actor);
  const ownershipByActor = new Map<string, number>();
  for (const r of ownershipRows) {
    if (r.actor) ownershipByActor.set(r.actor, r.n);
  }

  return ADAPTERS.map<SourceHealth>((adapter) => {
    const last = recentBySource.get(adapter.metadata.id) ?? null;
    const lastFetchedAt = last ? new Date(last.fetchedAt as Date).toISOString() : null;
    const isOverdue = last
      ? now - new Date(last.fetchedAt as Date).getTime() > adapter.metadata.defaultIntervalMs
      : true;
    return {
      id: adapter.metadata.id,
      name: adapter.metadata.name,
      kind: adapter.metadata.kind,
      parserVersion: adapter.metadata.parserVersion,
      primaryUrl: adapter.metadata.primaryUrls[0] ?? null,
      defaultIntervalMs: adapter.metadata.defaultIntervalMs,
      lastFetchedAt,
      lastParserVersion: last?.parserVersion ?? null,
      lastHash: last?.rawHash ?? null,
      parseError: last?.parseError ?? null,
      recordCount: ownershipByActor.get(adapter.metadata.id) ?? 0,
      isOverdue,
      hasFixture: !!adapter.metadata.fixturePath,
    };
  });
}

// Used by the npm run refresh script — returns adapters whose last fetch is
// older than `defaultIntervalMs`, so a cron caller can target only what's due.
export async function adaptersDueForRefresh(): Promise<string[]> {
  const snapshot = await sourceHealthSnapshot();
  return snapshot.filter((s) => s.isOverdue).map((s) => s.id);
}
