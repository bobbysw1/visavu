import Link from "next/link";
import { db, schema } from "@/db/client";
import { sql } from "drizzle-orm";
import { ADAPTERS } from "@/scrapers/sources";
import { CORRECTNESS_WEIGHTS } from "@/lib/confidence";
import { absoluteUrl, SITE } from "@/lib/site";

export const metadata = {
  title: `Methodology — how we verify visa data · ${SITE.name}`,
  description:
    "Every data source we use, how often it's refreshed, how confidence is calculated, and how to challenge a record. Read this before you trust us with a travel decision.",
  alternates: { canonical: absoluteUrl("/methodology") },
};

type SourceRow = {
  id: string;
  kind: string;
  name: string;
  url: string | null;
  recordCount: number;
  lastFetchedAt: Date | null;
};

type RawSourceRow = {
  id: string;
  kind: string;
  name: string;
  url: string | null;
  record_count: string;
  last_fetched_at: string | null;
};

async function loadSources(): Promise<SourceRow[]> {
  try {
    const result = await db.execute<RawSourceRow>(sql`
      SELECT
        s.id,
        s.kind::text AS kind,
        s.name,
        s.url,
        COALESCE((SELECT COUNT(DISTINCT v.id)::int FROM verification_events e
                  JOIN visa_options v ON v.id = e.visa_option_id
                  WHERE e.actor = s.id), 0) AS record_count,
        (SELECT MAX(sr.fetched_at) FROM source_records sr WHERE sr.source_id = s.id) AS last_fetched_at
      FROM sources s
      ORDER BY s.kind, s.id
    `);
    const rows = (result as unknown as { rows?: RawSourceRow[] }).rows ?? (result as unknown as RawSourceRow[]);
    return (rows as RawSourceRow[]).map((r) => ({
      id: r.id,
      kind: r.kind,
      name: r.name,
      url: r.url,
      recordCount: Number(r.record_count) || 0,
      lastFetchedAt: r.last_fetched_at ? new Date(r.last_fetched_at) : null,
    }));
  } catch {
    // DB unavailable — fall back to adapter metadata only.
    return ADAPTERS.map((a) => ({
      id: a.metadata.id,
      kind: a.metadata.kind,
      name: a.metadata.name,
      url: a.metadata.primaryUrls[0] ?? null,
      recordCount: 0,
      lastFetchedAt: null,
    }));
  }
}

const KIND_LABEL: Record<string, string> = {
  government: "Government / official",
  embassy: "Embassy",
  wikipedia: "Wikipedia (community-curated)",
  wikidata: "Wikidata",
  regional_bloc: "Regional bloc treaty",
  manual: "Curated (hand-maintained by us)",
};

const KIND_BLURB: Record<string, string> = {
  government: "Direct from the destination country's official government portal. Highest authority.",
  embassy: "From an embassy or consulate in the originating country.",
  wikipedia: "Wikipedia's community-edited 'Visa requirements for X citizens' pages. Useful for breadth, not authoritative on details. Licensed CC-BY-SA 4.0.",
  wikidata: "Wikidata structured data. Same caveats as Wikipedia.",
  regional_bloc: "Derived from regional treaty (Schengen Reg. 2018/1806, ECOWAS Free Movement Protocol, CARICOM CSME, etc.).",
  manual: "Hand-encoded from official program documentation. Updated when programs launch or change.",
};

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}

export default async function MethodologyPage() {
  const sources = await loadSources();

  // Group by kind for the table layout.
  const grouped = new Map<string, SourceRow[]>();
  for (const s of sources) {
    if (!grouped.has(s.kind)) grouped.set(s.kind, []);
    grouped.get(s.kind)!.push(s);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Methodology</h1>
        <p className="text-slate-600 dark:text-slate-400">
          How we collect visa data, how confidence is scored, and how to challenge a record.
        </p>
      </header>

      <section className="editorial-body prose prose-sm dark:prose-invert max-w-none mb-10">
        <h2>Where the data comes from</h2>
        <p>
          We pull from <strong>{sources.length} distinct sources</strong> across six categories.
          Government and treaty sources are authoritative; Wikipedia provides breadth for the long
          tail; manually curated content covers programs whose authority publishes only in PDF or
          press releases.
        </p>
        <p>
          Every record on this site is tagged with the source it came from. On the result page
          you&apos;ll see the source as a chip beside the answer. The &ldquo;Apply on official
          site&rdquo; button always points at the destination&apos;s government portal — never an
          affiliate, never a paid intermediary.
        </p>

        <h2>One promise: no visa middlemen</h2>
        <p>
          Every Apply link on this site sends you directly to the destination&apos;s official
          government portal. We never link to commercial visa-service intermediaries (ivisa,
          iVisa.com, visafornora, visahq, etc.), and we never charge a service fee on top of the
          government&apos;s own fee. A handful of governments outsource the operational intake to
          VFS or a similar contractor — when that&apos;s the only official channel, we link
          there and label it plainly (e.g. &ldquo;Operated by VFS on behalf of the Surinamese
          government&rdquo;). You should never reach a payment page that isn&apos;t the
          government&apos;s.
        </p>
        <p>
          If you ever spot us linking to a commercial visa-service middleman, that&apos;s a bug.{" "}
          <a href="/api/report" className="underline">Tell us</a> and we&apos;ll fix it.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Sources by category</h2>
        {[...grouped.entries()].map(([kind, list]) => (
          <div key={kind} className="mb-6 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="font-semibold mb-1">{KIND_LABEL[kind] ?? kind}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              {KIND_BLURB[kind] ?? ""}
            </p>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="text-left py-1.5 pr-3">Source</th>
                  <th className="text-right py-1.5 pr-3">Records</th>
                  <th className="text-right py-1.5">Last fetched</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-100 dark:border-neutral-900 last:border-0">
                    <td className="py-1.5 pr-3">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer noopener" className="hover:underline">
                          {s.name}
                        </a>
                      ) : (
                        s.name
                      )}
                    </td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">
                      {s.recordCount.toLocaleString("en")}
                    </td>
                    <td className="py-1.5 text-right text-neutral-500">{fmtDate(s.lastFetchedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <section className="editorial-body prose prose-sm dark:prose-invert max-w-none mb-10">
        <h2>Refresh cadence</h2>
        <p>
          Government scrapers refresh nightly via a hosted GitHub Actions cron (04:00 UTC).
          Wikipedia long-tail is refreshed on demand; it changes slowly. Manual / curated programs
          are reviewed when policy news breaks.
        </p>
        <p>
          Every record carries two timestamps: <strong>last fetched</strong> (when our scraper last
          pulled the page) and <strong>last verified</strong> (when a primary source confirmed the
          fact, or the cross-source check agreed with the destination&apos;s ministry of foreign
          affairs). The two are deliberately distinct.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Confidence scoring</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Per-field authority weights (1.0 = full confidence). Each record&apos;s overall bucket is
          the lowest field weight, scaled by freshness decay (records older than 180 days drop a
          bucket).
        </p>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-neutral-500 bg-neutral-50 dark:bg-neutral-900/60">
              <tr>
                <th className="text-left p-2.5">Source kind</th>
                <th className="text-right p-2.5">status</th>
                <th className="text-right p-2.5">cost</th>
                <th className="text-right p-2.5">processing</th>
                <th className="text-right p-2.5">app URL</th>
                <th className="text-right p-2.5">max stay</th>
                <th className="text-right p-2.5">requirements</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(CORRECTNESS_WEIGHTS) as Array<
                [keyof typeof CORRECTNESS_WEIGHTS, Record<string, number>]
              >).map(([kind, weights]) => (
                <tr key={kind} className="border-t border-neutral-100 dark:border-neutral-900">
                  <td className="p-2.5">{KIND_LABEL[kind] ?? kind}</td>
                  <td className="p-2.5 text-right tabular-nums">{weights.status?.toFixed(2) ?? "—"}</td>
                  <td className="p-2.5 text-right tabular-nums">{weights.cost?.toFixed(2) ?? "—"}</td>
                  <td className="p-2.5 text-right tabular-nums">
                    {weights.processing_time?.toFixed(2) ?? "—"}
                  </td>
                  <td className="p-2.5 text-right tabular-nums">
                    {weights.application_url?.toFixed(2) ?? "—"}
                  </td>
                  <td className="p-2.5 text-right tabular-nums">
                    {weights.max_stay_days?.toFixed(2) ?? "—"}
                  </td>
                  <td className="p-2.5 text-right tabular-nums">
                    {weights.requirements?.toFixed(2) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="editorial-body prose prose-sm dark:prose-invert max-w-none mb-10">
        <h2>Cross-source check</h2>
        <p>
          Wikipedia long-tail rows start at low confidence. A nightly job (
          <code>npm run cross-check</code>) compares each row against the destination&apos;s
          curated MFA visa-portal HTML. If the MFA explicitly mentions the passport&apos;s
          nationality with a consistent status, the row is upgraded to <strong>medium</strong>{" "}
          confidence and shown a green &ldquo;Confirmed against [destination] MFA&rdquo; badge. If
          the MFA explicitly contradicts, the row gets a red banner telling users to verify
          before booking.
        </p>

        <h2>How to challenge a record</h2>
        <p>
          If you spot something wrong, click <strong>Report incorrect info</strong> on the result
          card. Reports go to a moderation queue at <code>/admin/review-queue</code>. We respond
          within a week.
        </p>

        <h2>Licensing</h2>
        <p>
          Wikipedia-derived rows are licensed{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer noopener">
            CC-BY-SA 4.0
          </a>{" "}
          — attribution preserved per row in the result card footer. Government-source content is
          reproduced under fair-use / public-domain provisions; we link back to the original on
          every record. Code is MIT.
        </p>

        <h2>What we don&apos;t do</h2>
        <ul>
          <li>We don&apos;t process visa applications.</li>
          <li>We don&apos;t take affiliate revenue from visa-application services.</li>
          <li>We don&apos;t give legal immigration advice.</li>
          <li>We don&apos;t sell user data.</li>
        </ul>

        <p>
          See also: <Link href="/changelog">live changelog</Link> · <Link href="/about">about</Link>{" "}
          · <Link href="/sources">source-health dashboard</Link>.
        </p>
      </section>
    </main>
  );
}
