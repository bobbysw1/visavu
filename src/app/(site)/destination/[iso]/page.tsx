import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { VisaCategoryNav } from "@/components/VisaCategoryNav";
import { CoverageStats } from "@/components/CoverageStats";
import { DestinationDifficultyBucketGrid } from "@/components/DifficultyBucketGrid";
import { CountryMetricsDashboard } from "@/components/CountryMetricsDashboard";
import { ContinentResultsGrid } from "@/components/ContinentResultsGrid";
import { NationalityHero } from "@/components/NationalityHero";
import { CountryFactsBox } from "@/components/CountryFactsBox";
import { COUNTRY_LIST, PASSPORT_COUNTRIES, TOP_ORIGINS, issuesPassport, nameFor } from "@/lib/countries";
import { SITE, absoluteUrl } from "@/lib/site";
import { coverageForDestination, originSummariesForDestination } from "@/lib/coverage";
import { scoreOriginsForDestination } from "@/lib/scoring";
import { getCountryPhoto } from "@/lib/pexels";
import { factsFor } from "@/content/countryFacts";
import { destinationIntroFor } from "@/content/destinationIntros";
import { destinationPurposeIntro } from "@/content/destinationPurposeIntros";
import { occupationListFor } from "@/content/skilledOccupations";
import { generateIntro as generateDestinationIntro } from "@/content/destinationIntroGenerator";
import { buildDestinationFaqs } from "@/content/destinationFaqGenerator";
import { OBSTACLES } from "@/content/obstacles";
import { CountrySilhouette } from "@/components/CountrySilhouette";

// Cost optimisation: SSG every destination profile at build time, ISR-revalidate
// once a day. Same rationale as /passport/[iso] — Googlebot crawls these
// heavily, and visitors land on them from the homepage popular-destinations
// chips, so caching them at the edge eliminates the bulk of per-request CPU.
export const revalidate = 86_400;
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRY_LIST.map((c) => ({ iso: c.iso2.toLowerCase() }));
}

type Params = { iso: string };

function isValid(iso: string) {
  return COUNTRY_LIST.some((c) => c.iso2 === iso.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { iso } = await params;
  if (!isValid(iso)) return { title: "Not found" };
  const upper = iso.toUpperCase();
  const name = nameFor(upper);
  const facts = factsFor(upper);
  const title = `${name} visa & travel — tourism, work, study, family`;
  return {
    title,
    description: facts
      ? `${name} (pop. ${(facts.population / 1_000_000).toFixed(1)}M, capital ${facts.capital}). Visa rules for every passport, plus government portal links, embassy directory and travel advisories.`
      : `Visa requirements for ${name} — by passport, by purpose, with government-source links and embassy details.`,
    alternates: { canonical: absoluteUrl(`/destination/${upper.toLowerCase()}`) },
    openGraph: {
      title,
      description: `Travel to ${name}: visa types, passport requirements, government portal, travel advisories.`,
      url: absoluteUrl(`/destination/${upper.toLowerCase()}`),
      images: [
        {
          url: absoluteUrl(`/og?destination=${upper}`),
          width: 1200,
          height: 630,
          alt: `Visa requirements for visiting ${name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `Travel to ${name}: visa types, passport requirements, government portal, travel advisories.`,
      images: [absoluteUrl(`/og?destination=${upper}`)],
    },
  };
}

export default async function DestinationIndex({ params }: { params: Promise<Params> }) {
  const { iso } = await params;
  if (!isValid(iso)) notFound();
  const upper = iso.toUpperCase();
  const name = nameFor(upper);

  let coverage = null;
  let summaries: Awaited<ReturnType<typeof originSummariesForDestination>> = [];
  try {
    coverage = await coverageForDestination(upper);
    summaries = await originSummariesForDestination(upper);
  } catch {
    // DB unavailable — render zero state.
  }

  const photo = await getCountryPhoto(upper);
  const facts = factsFor(upper);
  // Destination-scoped obstacles surface inline in the editorial intro and
  // in the FAQ JSON-LD, so two destinations never share boilerplate prose.
  const destinationObstacles = OBSTACLES.filter(
    (o) => o.appliesTo.kind === "destination" && o.appliesTo.iso === upper,
  );
  // Curated intros (50 today) win; otherwise generated from live coverage.
  const curatedIntro = destinationIntroFor(upper);
  const intro = curatedIntro
    ?? generateDestinationIntro({ iso2: upper, name, coverage, summaries, obstacles: destinationObstacles });

  const crumbs = [
    { href: "/", label: "Home" },
    { href: `/destination/${upper.toLowerCase()}`, label: `Travel to ${name}` },
  ];

  // CollectionPage schema — the destination page IS a collection of
  // origin-passport visa requirements for visiting this country. This
  // gives Google a richer structural signal than the generic FAQPage we
  // used to emit (which Google has been deprioritising — three identical
  // boilerplate questions per destination wasn't earning rich results).
  //
  // Per-pair specifics still surface on /[passport]/[destination] where
  // we know the user's exact route and can answer real questions about
  // it.
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Visa requirements for visiting ${name}`,
    description: facts
      ? `Entry rules for travel to ${name} (capital: ${facts.capital}). Visa policy by passport, government portal links, embassy directory.`
      : `Entry rules for travel to ${name}. Visa policy by passport, government portal links, embassy directory.`,
    url: absoluteUrl(`/destination/${upper.toLowerCase()}`),
    about: {
      "@type": "Country",
      name,
      identifier: upper,
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
    },
    inLanguage: "en",
  };

  // FAQ JSON-LD is data-driven — conditional questions per the destination's
  // actual profile (Schengen / ETIAS / UK ETA / K-ETA / GCC / Mercosur,
  // plus any current advisory).
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: buildDestinationFaqs({
      iso2: upper,
      name,
      coverage,
      summaries,
      obstacles: destinationObstacles,
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs crumbs={crumbs} />

        <NationalityHero
          iso2={upper}
          mode="destination"
          photo={photo}
          visaFreeCount={coverage ? coverage.byStatus.visa_free + coverage.byStatus.visa_free_with_eta : undefined}
          totalDestinations={coverage?.totalDestinationsCovered}
        />

        <CountryFactsBox iso2={upper} mode="destination" />

        {/* OPENING NARRATIVE — curated where available, generated otherwise.
            SEO-critical unique content per destination, mirrors the passport-page
            pattern. Sits between facts and the metrics dashboard so the prose
            grounds the numbers that follow. */}
        <section className="editorial-body relative mt-8">
          <div className="absolute top-0 right-0 -translate-y-2 pointer-events-none opacity-[0.10] dark:opacity-[0.18]">
            <CountrySilhouette iso2={upper} size={180} tone="default" />
          </div>
          <h2 className="section-h2 mb-4">Travel to {name}: the picture in 2026</h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            {intro}
          </p>
        </section>

        {/* Investment-dashboard-style 9-tile country summary — relocation
            stats answered in <5 seconds before scrolling into the visa lists. */}
        <div className="mt-8">
          <CountryMetricsDashboard destinationIso2={upper} />
        </div>

        {coverage && <CoverageStats snapshot={coverage} context="destination" />}

        {summaries.length > 0 && (
          <DestinationDifficultyBucketGrid
            destinationIso2={upper}
            scored={scoreOriginsForDestination(upper, summaries)}
          />
        )}

        {/* CONTINENT TABS — seven-tab geographic browse of origin
            passports, with sort by difficulty / cost / processing / visa
            type / name. */}
        {summaries.length > 0 && (
          <ContinentResultsGrid
            mode="destination"
            anchorIso2={upper}
            scored={scoreOriginsForDestination(upper, summaries)}
            heading="Origins by continent"
            subheading={`Tabbed by region. Switch the sort to find the easiest, cheapest, or fastest passports for entry to ${nameFor(upper)}.`}
          />
        )}

        <section className="mt-12">
          <p className="kicker mb-2">By purpose</p>
          <h2 className="section-h2 mb-4">Browse by visa type.</h2>
          <VisaCategoryNav iso={upper} mode="destination" />
        </section>

        {/* Per-purpose editorial — surfaces curated content for tourism /
            work / study / family on the destination page itself, even
            before the user picks a specific origin passport. Renders only
            for destinations with curated entries (top 20 today). */}
        {(() => {
          const purposeBlocks = (["tourism", "work", "study", "family"] as const)
            .map((purpose) => ({
              purpose,
              content: destinationPurposeIntro(upper, purpose),
            }))
            .filter((b) => b.content);
          if (purposeBlocks.length === 0) return null;
          const purposeLabels: Record<"tourism"|"work"|"study"|"family", string> = {
            tourism: "Visiting as a tourist",
            work: "Working in",
            study: "Studying in",
            family: "Family / partner routes for",
          };
          return (
            <section className="mt-10 space-y-6">
              <h2 className="section-h2">Visa routes by purpose</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {purposeBlocks.map(({ purpose, content }) => (
                  <article
                    key={purpose}
                    className="ink-card p-5 space-y-2"
                  >
                    <h3 className="kicker text-xs uppercase tracking-wider">
                      {purposeLabels[purpose as "tourism"|"work"|"study"|"family"]} {name}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--color-ink)]">{content}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Skilled-occupation list — renders for AU, GB, CA, NZ. Surfaces
            the curated subset of in-demand occupations + the official
            source URL so users can verify the current list state. Same
            data the chatbot grounds on when answering "what jobs are on
            the list?" questions. */}
        {(() => {
          const list = occupationListFor(upper);
          if (!list) return null;
          // Group by first-listed visa programme — broadly maps to the
          // category headings users expect (e.g. "Skilled Worker" in UK,
          // "Express Entry" in Canada).
          return (
            <section className="mt-12 space-y-5">
              <div>
                <p className="kicker mb-2">Skilled migration</p>
                <h2 className="section-h2 mb-2">{list.systemName}</h2>
                <p className="text-sm text-[var(--color-ink-muted)] max-w-3xl leading-relaxed">
                  {list.description}
                </p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-2">
                  As of {list.asOf} ·{" "}
                  <a href={list.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    official source ↗
                  </a>
                </p>
              </div>

              <div className="ink-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--color-rule)] text-left">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Occupation</th>
                      <th className="px-4 py-2.5 font-semibold">Code</th>
                      <th className="px-4 py-2.5 font-semibold">Visa pathways</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.occupations.slice(0, 30).map((occ) => (
                      <tr key={occ.code} className="border-b border-[var(--color-rule)]/40 last:border-0">
                        <td className="px-4 py-2 align-top">
                          <p className="font-medium">{occ.title}</p>
                          {occ.salaryNote && (
                            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{occ.salaryNote}</p>
                          )}
                        </td>
                        <td className="px-4 py-2 align-top font-mono text-xs">{occ.code}</td>
                        <td className="px-4 py-2 align-top text-xs text-[var(--color-ink-muted)]">
                          {occ.visas.join(" · ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {list.occupations.length > 30 && (
                  <p className="px-4 py-3 text-xs text-[var(--color-ink-muted)] border-t border-[var(--color-rule)]/40">
                    Showing top 30 of {list.occupations.length} curated occupations. See the{" "}
                    <a href={list.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      official list
                    </a>{" "}
                    for the full set (~{list.iso2 === "AU" ? "456" : list.iso2 === "GB" ? "150" : list.iso2 === "CA" ? "500+" : "100+"} occupations).
                  </p>
                )}
              </div>
            </section>
          );
        })()}

        <section className="mt-12">
          <p className="kicker mb-2">Popular origins</p>
          <h2 className="section-h2 mb-2">From popular origin countries.</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-5">
            Pick your passport to see the exact rules for travel to {name}.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {TOP_ORIGINS.filter((p) => p !== upper && issuesPassport(p)).map((origin) => {
              const country = COUNTRY_LIST.find((c) => c.iso2 === origin);
              return (
                <Link
                  key={origin}
                  href={`/${origin.toLowerCase()}/${upper.toLowerCase()}`}
                  prefetch={false}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-elev)] hover:border-[var(--color-ink)] transition text-sm"
                >
                  <span className="text-lg" aria-hidden>{country?.flag ?? "🏳️"}</span>
                  <span className="truncate">{nameFor(origin)}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <p className="kicker mb-2">All passports</p>
          <h2 className="section-h2 mb-4">From any passport (A–Z).</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
            {PASSPORT_COUNTRIES.filter((c) => c.iso2 !== upper).map((c) => (
              <Link
                key={c.iso2}
                href={`/${c.iso2.toLowerCase()}/${upper.toLowerCase()}`}
                prefetch={false}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-[var(--color-muted)]/60 transition"
              >
                <span className="text-base" aria-hidden>{c.flag}</span>
                <span className="truncate">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
