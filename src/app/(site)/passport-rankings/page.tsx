import type { Metadata } from "next";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { RankingsTable } from "@/components/RankingsTable";
import { PassportCollage, passportCollageCount } from "@/components/PassportCollage";
import { passportRankings } from "@/lib/coverage";
import { nameFor } from "@/lib/countries";
import { getPassportCover, type PassportCover } from "@/lib/passportCovers";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Passport rankings — visa-free access by country",
  description:
    "Sortable directory of every passport on file, ranked by tourism visa-free access. Built from official government sources with primary-source links on every record.",
  alternates: { canonical: absoluteUrl("/passport-rankings") },
  openGraph: {
    title: "Passport rankings — visa-free access by country",
    description: "Tourism visa-free access by passport, sourced and dated.",
    url: absoluteUrl("/passport-rankings"),
    images: [
      {
        url: absoluteUrl("/og?title=Passport+rankings&kicker=Visa-free+access"),
        width: 1200,
        height: 630,
        alt: "Visavu — Passport rankings",
      },
    ],
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
    // DB unavailable — fall through to an empty-state notice below.
  }

  // Aggregate stats for the scoreboard strip (mirrors what passportindex.org
  // shows at the bottom of their leaderboard — gives the data product some
  // global context). Computed once from the same ranking set.
  const stats =
    rankings.length === 0
      ? null
      : (() => {
          const visaFrees = rankings.map((r) => r.visaFreeAccess).sort((a, b) => a - b);
          const sum = visaFrees.reduce((a, b) => a + b, 0);
          const avg = Math.round(sum / visaFrees.length);
          const median = visaFrees[Math.floor(visaFrees.length / 2)];
          const totalRoutes = rankings.reduce((s, r) => s + r.totalOptions, 0);
          return { avg, median, totalRoutes, passports: rankings.length };
        })();

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

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <Breadcrumbs crumbs={crumbs} />

        <header className="mb-8 sm:mb-10">
          <p className="kicker mb-3">Leaderboard</p>
          <h1 className="billboard mb-5 max-w-3xl">
            Passport power rankings<span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-ink)]/85 leading-relaxed max-w-2xl">
            Every passport on file, ranked by the number of destinations its
            holders can enter visa-free or via eTA. Built from official
            government sources — every count traces back to a verified record.
          </p>
        </header>

        {/* Passport-cover collage — the signature visual borrowed from
            passportindex.org. Sits above the leaderboard as a teaser; the
            full collage view is duplicated at the bottom for browse-by-photo
            users. */}
        <section className="mb-12">
          <p className="kicker mb-3">{passportCollageCount()} passports we cover</p>
          <PassportCollage />
        </section>

        {/* Scoreboard strip — bottom-of-page-style aggregate stats moved
            to a prominent position to anchor the page in real numbers. */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)] rounded-2xl overflow-hidden mb-10">
            <Stat n={stats.avg} label="avg visa-free" />
            <Stat n={stats.median} label="median visa-free" />
            <Stat n={stats.passports} label="passports ranked" />
            <Stat n={stats.totalRoutes} label="verified routes" />
          </div>
        )}

        {rankings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-rule)] p-6 text-sm text-[var(--color-ink-muted)]">
            <p className="font-medium mb-1">No ranking data yet.</p>
            <p>
              Run{" "}
              <code className="px-1.5 py-0.5 rounded bg-[var(--color-muted)] font-mono text-xs">
                npm run bootstrap
              </code>{" "}
              to seed visa data, then revisit this page.
            </p>
          </div>
        ) : (
          <RankingsTable
            rankings={rankings}
            covers={Object.fromEntries(
              // Pre-resolve every ranking's cover server-side so the
              // client bundle stays free of node:fs.
              rankings.map((r) => [r.iso2, getPassportCover(r.iso2) as PassportCover | null]),
            )}
          />
        )}

        <p className="mt-8 text-xs text-[var(--color-ink-muted)] italic max-w-2xl">
          Visa-free count includes both visa-free and visa-free-with-eTA tourism
          routes, deduplicated per destination. Numbers are derived from the
          visa records in our database — countries with low counts may simply
          not yet be fully covered by our scraping pipeline. Coverage is
          continuously expanding.
        </p>
      </main>
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="bg-[var(--color-paper-elev)] p-4 sm:p-5 text-center sm:text-left">
      <p className="serif-display text-3xl sm:text-4xl font-medium tabular text-[var(--color-ink)]">
        {new Intl.NumberFormat("en").format(n)}
      </p>
      <p className="kicker mt-1">{label}</p>
    </div>
  );
}
