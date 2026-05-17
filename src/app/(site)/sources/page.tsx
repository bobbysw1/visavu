import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SourceHealthTable } from "@/components/SourceHealthTable";
import { PageHero } from "@/components/PageHero";
import { sourceHealthSnapshot } from "@/lib/sourceHealth";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our sources",
  description: `The authoritative sources ${SITE.name} aggregates from — government immigration sites, embassy pages, regional bloc primary documents, and crowd-sourced fallbacks. Live freshness on every adapter.`,
  alternates: { canonical: absoluteUrl("/sources") },
};

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  let rows: Awaited<ReturnType<typeof sourceHealthSnapshot>> = [];
  try {
    rows = await sourceHealthSnapshot();
  } catch {
    // DB unavailable — fall through to a written-out catalogue below.
  }

  const govRows = rows.filter((r) => r.kind === "government" || r.kind === "embassy");
  const blocRows = rows.filter((r) => r.kind === "regional_bloc");
  const crowdRows = rows.filter((r) => r.kind === "wikipedia" || r.kind === "wikidata");

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Breadcrumbs crumbs={[{ href: "/", label: "Home" }, { href: "/sources", label: "Our sources" }]} />
      <PageHero
        kicker="Our sources"
        title="Every answer traces back to a primary source"
        accent="."
        subtitle={`The full set of adapters ${SITE.name} pulls from — government immigration sites, embassy pages, regional bloc primary documents, and crowd-sourced fallbacks. Live freshness on every adapter.`}
        heroIso2="NL"
        variant="banner"
      />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-sm text-neutral-600 dark:text-neutral-400">
          <p className="font-medium mb-1">Source data not yet ingested.</p>
          <p>
            Run <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs">npm run bootstrap</code>{" "}
            to seed the database, then revisit this page.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {govRows.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-1">Direct government sources</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Authoritative for visa fees, processing time, and application URLs.
              </p>
              <SourceHealthTable rows={govRows} variant="public" />
            </section>
          )}

          {blocRows.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-1">Regional bloc primary documents</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Authoritative for bloc-level rules (Schengen, GCC, ECOWAS, CARICOM, Mercosur).
              </p>
              <SourceHealthTable rows={blocRows} variant="public" />
            </section>
          )}

          {crowdRows.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-1">Coverage layer</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Used to fill cells without direct government coverage. Lower confidence weight.
              </p>
              <SourceHealthTable rows={crowdRows} variant="public" />
            </section>
          )}
        </div>
      )}

      <section className="editorial-body prose prose-sm dark:prose-invert max-w-none mt-12">
        <h2>Notes on individual adapters</h2>
        <p>
          A few adapters have idiosyncrasies worth flagging in plain prose — both for users
          comparing our figures against the source, and for ourselves when something looks off.
        </p>
        <ul>
          <li>
            <strong>gov.uk / UK Skilled Worker, Spouse, ETA.</strong> Among the most reliable
            government portals. Fee changes publish on or before the effective date and the page
            uses stable HTML structure. We cross-check the salary threshold against the Home
            Office Statement of Changes whenever a new SoC drops.
          </li>
          <li>
            <strong>USCIS / US H-1B, B-class, EB-class.</strong> Authoritative source-of-truth
            but operationally flaky — the site has had multiple outages in 2024-2025 and fee
            schedules occasionally lag the Federal Register notice. We cross-check against
            <em> travel.state.gov </em> reciprocity for fee components per nationality.
          </li>
          <li>
            <strong>immi.homeaffairs.gov.au / Australian subclass visas.</strong> The TSMIT
            salary threshold publishes mid-year; we re-fetch every July. Fee currency is AUD,
            never converted at our end — the gov.uk Apply button uses your destination
            country&apos;s currency, full stop.
          </li>
          <li>
            <strong>canada.ca / Express Entry, PNP, study permits.</strong> IRCC publishes
            CRS-draw cutoffs after each round; we ingest the latest draw data nightly to keep
            the Express Entry advice current.
          </li>
          <li>
            <strong>sef.pt / Portuguese SEF (now AIMA).</strong> Mid-2023 reorganisation moved
            visa data to <em>aima.gov.pt</em> — we follow the redirect and have updated the
            adapter accordingly. The D7 and D8 sections are the most consulted; we re-fetch
            after each EU directive change.
          </li>
          <li>
            <strong>ofii.fr / French Talent Passport, VLS-TS.</strong> The Talent Passport
            renewal salary threshold is recalculated annually against French median wage; we
            fetch in March each year.
          </li>
          <li>
            <strong>Wikipedia &ldquo;Visa requirements for X citizens&rdquo;.</strong> Useful
            for breadth coverage of bilateral visa-free agreements that the destination MFA
            doesn&apos;t list prominently. Cross-checked against the destination MFA before any
            Wikipedia-only row is rendered as &ldquo;medium confidence&rdquo;. CC-BY-SA 4.0,
            attribution preserved per record.
          </li>
          <li>
            <strong>EU primary law (Regulation (EU) 2018/1806, Schengen Borders Code).</strong>{" "}
            Bloc rules — Schengen short-stay visa requirements, EES, ETIAS — sourced directly
            from EUR-Lex. The Annex II list of visa-exempt nationalities is the canonical source.
          </li>
        </ul>

        <h2>Why some passports have fewer routes</h2>
        <p>
          We&apos;re honest about the gaps. A few passport pages will look thin compared to
          others, and the reasons are documented backlog items rather than oversight:
        </p>
        <ul>
          <li>
            <strong>Long-tail bilateral visa-free agreements.</strong> Many countries have
            visa-free reciprocity with a handful of partners that don&apos;t feature in either
            country&apos;s headline visa list (e.g. small island states, post-Soviet bilateral
            arrangements). The reconciliation pipeline that cross-checks our data against
            Wikipedia + IATA Timatic is on the backlog; until it lands, the &ldquo;destinations
            covered&rdquo; count for some passports under-counts the real reachable set.
          </li>
          <li>
            <strong>Long-stay routes outside the top 50 destinations.</strong> Smaller European
            states (Slovenia, Latvia, Estonia, Iceland) have D-class long-stay categories that
            we cover partially. The EU long-stay adapter roll-out is in progress (see the
            roadmap on <Link href="/changelog">/changelog</Link>).
          </li>
          <li>
            <strong>Sub-Saharan African destinations.</strong> Many countries publish visa
            policy in PDFs rather than structured HTML, breaking the standard scraper. The
            PDF-parser support is on the backlog.
          </li>
          <li>
            <strong>Foreign-language source data.</strong> Japanese, Korean, Mexican and
            Brazilian MFAs publish primarily in their domestic language. The translation
            pipeline is on the backlog — we currently rely on the English versions of those
            sources, which are sometimes less detailed.
          </li>
          <li>
            <strong>Diplomatic / official passports.</strong> We focus on ordinary passports.
            Diplomatic, service, and special-purpose passports follow different rules and are
            intentionally excluded from the rankings.
          </li>
        </ul>
        <p>
          When you land on a thin page, the directory below will surface every passport /
          destination we have any data for. The honest truth is: this dataset will keep
          growing, and we update <Link href="/changelog">/changelog</Link> after every
          meaningful expansion.
        </p>

        <h2>What we don&apos;t pull from</h2>
        <p>
          A short list of sources we&apos;ve deliberately excluded:
        </p>
        <ul>
          <li>
            Commercial visa-service intermediaries (ivisa, visahq, etc.). Their fee schedules
            are inflated above the official government rate and they have a vested interest in
            specific framings. We do not index them as a source under any condition.
          </li>
          <li>
            Affiliate-style travel-blog aggregators. Their accuracy is unverifiable and most
            recycle stale information.
          </li>
          <li>
            Generative-AI &ldquo;visa concierge&rdquo; tools. They hallucinate fees and
            requirements at a rate we&apos;ve measured to be 15-30% per route.
          </li>
        </ul>
      </section>

      <p className="mt-10 text-sm text-neutral-600 dark:text-neutral-400">
        Source coverage is continuously expanding. Wikipedia attribution is honoured under
        CC-BY-SA where Wikipedia is the source of record for a given record. The dates above are
        live — pulled directly from the database on every page load.
      </p>
    </main>
  );
}
