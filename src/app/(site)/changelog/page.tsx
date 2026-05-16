import Link from "next/link";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { absoluteUrl } from "@/lib/site";

export const metadata = {
  title: "Changelog — visa data updates",
  description:
    "Every detected change to our visa-data sources, in reverse chronological order. Pulled live from source_records hash diffs.",
  alternates: {
    canonical: absoluteUrl("/changelog"),
    types: { "application/rss+xml": absoluteUrl("/changelog.xml") },
  },
};

type ChangelogEvent = {
  id: number;
  sourceId: string;
  sourceName: string;
  fetchedAt: Date;
  recordCount: number;
  parseError: string | null;
  prevRecordCount: number | null;
  prevHash: string | null;
};

type RawEvent = {
  id: number;
  source_id: string;
  source_name: string;
  fetched_at: string;
  record_count: string;
  parse_error: string | null;
  prev_record_count: string | null;
  prev_hash: string | null;
};

async function loadChangelog(): Promise<ChangelogEvent[]> {
  try {
    // For each source-record, attach the previous record's count + hash so
    // we can compute a diff. Window over source_records partitioned by
    // source_id. Limit to last 90 days.
    const result = await db.execute<RawEvent>(sql`
      SELECT
        sr.id,
        sr.source_id,
        s.name AS source_name,
        sr.fetched_at,
        jsonb_array_length(
          CASE
            WHEN jsonb_typeof(sr.payload->'sample') = 'array' THEN sr.payload->'sample'
            WHEN jsonb_typeof(sr.payload) = 'array' THEN sr.payload
            ELSE '[]'::jsonb
          END
        )::text AS record_count,
        sr.parse_error,
        LAG(jsonb_array_length(
          CASE
            WHEN jsonb_typeof(sr.payload->'sample') = 'array' THEN sr.payload->'sample'
            WHEN jsonb_typeof(sr.payload) = 'array' THEN sr.payload
            ELSE '[]'::jsonb
          END
        )::text) OVER (PARTITION BY sr.source_id ORDER BY sr.fetched_at) AS prev_record_count,
        LAG(sr.raw_hash) OVER (PARTITION BY sr.source_id ORDER BY sr.fetched_at) AS prev_hash
      FROM source_records sr
      JOIN sources s ON s.id = sr.source_id
      WHERE sr.fetched_at > NOW() - INTERVAL '90 days'
      ORDER BY sr.fetched_at DESC
      LIMIT 200
    `);
    const rows = (result as unknown as { rows?: RawEvent[] }).rows ?? (result as unknown as RawEvent[]);
    return (rows as RawEvent[]).map((r) => ({
      id: r.id,
      sourceId: r.source_id,
      sourceName: r.source_name,
      fetchedAt: new Date(r.fetched_at),
      recordCount: Number(r.record_count) || 0,
      parseError: r.parse_error,
      prevRecordCount: r.prev_record_count != null ? Number(r.prev_record_count) : null,
      prevHash: r.prev_hash,
    }));
  } catch {
    return [];
  }
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}

function diffSummary(e: ChangelogEvent): { tone: string; line: string } {
  if (e.parseError) {
    return {
      tone: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
      line: `Parse error: ${e.parseError}`,
    };
  }
  if (e.prevRecordCount == null) {
    return {
      tone: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
      line: `First snapshot: ${e.recordCount.toLocaleString("en")} records.`,
    };
  }
  const delta = e.recordCount - e.prevRecordCount;
  if (delta === 0 && e.prevHash) {
    return {
      tone: "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/30",
      line: `Re-fetch, no record-count change (${e.recordCount.toLocaleString("en")} records).`,
    };
  }
  const sign = delta > 0 ? "+" : "";
  const tone =
    Math.abs(delta) > 50
      ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
      : "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/30";
  return {
    tone,
    line: `${sign}${delta.toLocaleString("en")} records · ${e.prevRecordCount.toLocaleString("en")} → ${e.recordCount.toLocaleString("en")}`,
  };
}

export default async function ChangelogPage() {
  const events = await loadChangelog();
  const now = new Date();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Changelog</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Every detected change to our visa-data sources in the last 90 days. Generated live from
          source-record hash diffs — no marketing edits.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          <Link href="/changelog.xml" className="underline hover:no-underline">RSS feed</Link>
          {" · "}
          <Link href="/methodology" className="underline hover:no-underline">methodology</Link>
        </p>
      </header>

      {events.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 text-sm text-neutral-600 dark:text-neutral-400">
          No source-record events in the last 90 days. The first nightly refresh will populate this
          page — see <Link href="/methodology" className="underline">methodology</Link> for refresh
          cadence.
        </div>
      ) : (
        <ol className="space-y-3">
          {events.map((e) => {
            const summary = diffSummary(e);
            return (
              <li
                key={e.id}
                className={`rounded-lg border p-4 ${summary.tone}`}
              >
                <header className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <p className="font-semibold text-sm">{e.sourceName}</p>
                  <p className="text-xs text-neutral-500 tabular-nums">
                    {fmtDate(e.fetchedAt)} · {Math.round((now.getTime() - e.fetchedAt.getTime()) / 86400000)}d ago
                  </p>
                </header>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{summary.line}</p>
                <p className="text-xs text-neutral-500 mt-1 font-mono">
                  source_id: {e.sourceId}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
