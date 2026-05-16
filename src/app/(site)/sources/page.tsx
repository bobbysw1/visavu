import type { Metadata } from "next";
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

      <p className="mt-10 text-sm text-neutral-600 dark:text-neutral-400">
        Source coverage is continuously expanding. Wikipedia attribution is honoured under
        CC-BY-SA where Wikipedia is the source of record for a given record. The dates above are
        live — pulled directly from the database on every page load.
      </p>
    </main>
  );
}
