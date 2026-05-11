import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { passportRankings } from "@/lib/coverage";
import { flagEmoji, nameFor } from "@/lib/countries";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Passport rankings — visa-free access by country",
  description:
    "Sortable directory of every passport on file, ranked by tourism visa-free access. Built from official government sources with primary-source links on every record.",
  alternates: { canonical: absoluteUrl("/passport-rankings") },
  openGraph: {
    title: `Passport rankings — ${SITE.name}`,
    description: "Tourism visa-free access by passport, sourced and dated.",
    url: absoluteUrl("/passport-rankings"),
  },
};

const crumbs = [
  { href: "/", label: "Home" },
  { href: "/passport-rankings", label: "Passport rankings" },
];

export default async function PassportRankingsPage() {
  let rankings: Awaited<ReturnType<typeof passportRankings>> = [];
  try {
    rankings = await passportRankings();
  } catch {
    // DB unavailable — empty state.
  }

  // ItemList JSON-LD aids rich-result rendering for ranked content.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: rankings.length,
    itemListElement: rankings.slice(0, 25).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/passport/${r.iso2.toLowerCase()}`,
      name: nameFor(r.iso2),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs crumbs={crumbs} />

        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Passport rankings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sortable directory of {rankings.length || "every"} passport with verified data on
            file, ranked by tourism visa-free access. Coverage reflects only routes we&apos;ve
            verified — this isn&apos;t a complete passport-strength index.
          </p>
        </header>

        {rankings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-sm text-neutral-600 dark:text-neutral-400">
            <p className="font-medium mb-1">No ranking data yet.</p>
            <p>
              Run <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs">npm run bootstrap</code>{" "}
              to seed visa data, then revisit this page.
            </p>
          </div>
        ) : (
          <section>
            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-900 text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3 px-4 w-14">#</th>
                    <th className="py-3 px-4">Passport</th>
                    <th className="py-3 px-4 text-right">Visa-free destinations (tourism)</th>
                    <th className="py-3 px-4 text-right">Total destinations</th>
                    <th className="py-3 px-4 text-right">Total verified routes</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((r, i) => (
                    <tr
                      key={r.iso2}
                      className="border-b border-neutral-100 dark:border-neutral-900 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                    >
                      <td className="py-2.5 px-4 font-mono text-neutral-500 dark:text-neutral-400">
                        {i + 1}
                      </td>
                      <td className="py-2.5 px-4">
                        <Link
                          href={`/passport/${r.iso2.toLowerCase()}`}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <span className="text-lg" aria-hidden>{flagEmoji(r.iso2)}</span>
                          <span className="font-medium">{nameFor(r.iso2)}</span>
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                        {r.visaFreeAccess}
                      </td>
                      <td className="py-2.5 px-4 text-right">{r.totalDestinations}</td>
                      <td className="py-2.5 px-4 text-right text-neutral-500">
                        {r.totalOptions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-neutral-500 italic">
              Visa-free count includes both visa-free and visa-free-with-eTA tourism routes.
              Numbers are derived from the visa records in our database — countries with low
              counts may simply not yet be covered by our scraping pipeline. Source coverage is
              continuously expanding.
            </p>
          </section>
        )}
      </main>
    </>
  );
}
