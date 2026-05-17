/**
 * Adapter runner. Stage between Adapter.fetch/parse and the consolidated
 * visa_options that the resolver reads.
 *
 * Pipeline:
 *   fetch (or load fixture) → parse → record SourceRecord (always, on changes
 *   or parse errors) → merge into visa_options + fees + verification_events.
 *
 * The merge step is what transforms scraper output into renderable data.
 * It's centralized in /scrapers/base/merge.ts.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import type { Adapter, FetchContext, ParsedRecord } from "./Adapter";
import { hashRecords } from "./Adapter";
import { mergeRecords, type MergeResult } from "./merge";

export type RunResult = {
  sourceId: string;
  fetched: boolean;
  recordsCount: number;
  changed: boolean;
  parseError?: string;
  merge?: MergeResult;
};

async function loadFixture(adapter: Adapter): Promise<{ rawText: string; fetchUrl: string } | null> {
  if (!adapter.metadata.fixturePath) return null;
  const fullPath = path.resolve(process.cwd(), adapter.metadata.fixturePath);
  const rawText = await readFile(fullPath, "utf8");
  return { rawText, fetchUrl: `fixture://${adapter.metadata.fixturePath}` };
}

export async function runAdapter(adapter: Adapter, ctx: FetchContext = {}): Promise<RunResult> {
  // P28 — VISAVU_FIXTURE_MODE global override. When set, every adapter
  // call uses bundled fixtures regardless of the caller's `useFixture`.
  // Used by preview branches and CI smoke tests that don't have outbound
  // network access. Production sets this to "false" (or leaves unset) so
  // refreshes hit the real source.
  const fixtureModeOverride = process.env.VISAVU_FIXTURE_MODE === "true";
  const wantFixture = ctx.useFixture || fixtureModeOverride;

  // First try fixture (if requested OR if VISAVU_FIXTURE_MODE forces it).
  // Fall through to live fetch if the adapter has no fixturePath — many
  // newer adapters inline their data and skip the fixture entirely.
  let fetched = wantFixture ? await loadFixture(adapter) : null;
  if (!fetched && !fixtureModeOverride) {
    fetched = await adapter.fetch(ctx);
  }

  if (!fetched) {
    return { sourceId: adapter.metadata.id, fetched: false, recordsCount: 0, changed: false };
  }

  const parsed = await adapter.parse(fetched);
  const hash = hashRecords(parsed.records);

  const last = await db
    .select({ hash: schema.sourceRecords.rawHash })
    .from(schema.sourceRecords)
    .where(eq(schema.sourceRecords.sourceId, adapter.metadata.id))
    .orderBy(desc(schema.sourceRecords.fetchedAt))
    .limit(1);

  const changed = last.length === 0 || last[0].hash !== hash;

  // Always log on parse error or change. Always-log lets the alerting layer
  // detect "fetched fine, parser broke" — the highest-value alert.
  if (changed || parsed.parseError) {
    await db.insert(schema.sources).values({
      id: adapter.metadata.id,
      kind: adapter.metadata.kind,
      name: adapter.metadata.name,
      url: adapter.metadata.primaryUrls[0] ?? null,
    }).onConflictDoNothing();

    // Cap the JSONB payload size — large fixtures (Wikipedia, ~33k rows ~7MB)
    // overflow PGlite's WASM heap when stored in a single row. The hash above
    // is computed from the full record set, so diff-detection still works;
    // here we just persist a sampled snapshot for audit/debugging.
    const PAYLOAD_SAMPLE_LIMIT = 2000;
    const payloadRecords =
      parsed.records.length > PAYLOAD_SAMPLE_LIMIT
        ? parsed.records.slice(0, PAYLOAD_SAMPLE_LIMIT)
        : parsed.records;

    await db.insert(schema.sourceRecords).values({
      sourceId: adapter.metadata.id,
      parserVersion: adapter.metadata.parserVersion,
      payload: {
        sample: payloadRecords,
        totalRecords: parsed.records.length,
        sampled: parsed.records.length > PAYLOAD_SAMPLE_LIMIT,
      } as unknown as Record<string, unknown>,
      rawHash: hash,
      fetchedAt: new Date(),
      fetchUrl: fetched.fetchUrl,
      parseError: parsed.parseError ?? null,
    });
  }

  // Merge into visa_options whenever we have records, even if the hash didn't
  // change — this is what lets us re-bootstrap the DB from fixtures at any
  // time. For incremental production runs, callers can short-circuit on
  // `changed === false` themselves.
  let merge: MergeResult | undefined;
  if (parsed.records.length > 0) {
    merge = await mergeRecords(parsed.records as ParsedRecord[], {
      sourceId: adapter.metadata.id,
      sourceKind: adapter.metadata.kind,
      parserVersion: adapter.metadata.parserVersion,
    });
  }

  return {
    sourceId: adapter.metadata.id,
    fetched: true,
    recordsCount: parsed.records.length,
    changed,
    parseError: parsed.parseError,
    merge,
  };
}
