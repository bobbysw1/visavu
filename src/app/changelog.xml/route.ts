import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Row = {
  id: number;
  source_id: string;
  source_name: string;
  fetched_at: string;
  record_count: string;
  parse_error: string | null;
  prev_record_count: string | null;
};

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

function describe(row: Row): string {
  if (row.parse_error) return `Parse error: ${row.parse_error}`;
  const count = Number(row.record_count) || 0;
  const prev = row.prev_record_count != null ? Number(row.prev_record_count) : null;
  if (prev == null) return `First snapshot: ${count.toLocaleString("en")} records.`;
  const delta = count - prev;
  if (delta === 0) return `Re-fetch, no record-count change (${count.toLocaleString("en")} records).`;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toLocaleString("en")} records · ${prev.toLocaleString("en")} → ${count.toLocaleString("en")}`;
}

export async function GET() {
  let rows: Row[] = [];
  try {
    const result = await db.execute<Row>(sql`
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
        )::text) OVER (PARTITION BY sr.source_id ORDER BY sr.fetched_at) AS prev_record_count
      FROM source_records sr
      JOIN sources s ON s.id = sr.source_id
      WHERE sr.fetched_at > NOW() - INTERVAL '90 days'
      ORDER BY sr.fetched_at DESC
      LIMIT 100
    `);
    rows = (result as unknown as { rows?: Row[] }).rows ?? (result as unknown as Row[]) ?? [];
  } catch {
    rows = [];
  }

  const items = rows
    .map((r) => {
      const url = `${SITE.url}/changelog#event-${r.id}`;
      const pub = new Date(r.fetched_at).toUTCString();
      const title = `${r.source_name} · ${describe(r)}`;
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="false">visavu-changelog-${r.id}</guid>
      <pubDate>${pub}</pubDate>
      <description>${escapeXml(describe(r))}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} — Changelog</title>
    <link>${SITE.url}/changelog</link>
    <atom:link href="${SITE.url}/changelog.xml" rel="self" type="application/rss+xml" />
    <description>Detected changes to ${escapeXml(SITE.name)}'s visa-data sources, in reverse chronological order.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
