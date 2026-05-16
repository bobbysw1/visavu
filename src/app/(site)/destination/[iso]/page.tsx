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
import { COUNTRY_LIST, TOP_ORIGINS, nameFor } from "@/lib/countries";
import { SITE, absoluteUrl } from "@/lib/site";
import { coverageForDestination, originSummariesForDestination } from "@/lib/coverage";
import { scoreOriginsForDestination } from "@/lib/scoring";
import { getCountryPhoto } from "@/lib/pexels";
import { factsFor } from "@/content/countryFacts";

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

  const crumbs = [
    { href: "/", label: "Home" },
    { href: `/destination/${upper.toLowerCase()}`, label: `Travel to ${name}` },
  ];

  // FAQ schema — written generically because the same FAQ structure holds
  // for every destination. The /[passport]/[destination] route handles the
  // per-pair specifics.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Do I need a visa to enter ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Visa requirements depend on your passport and purpose. Pick your passport on this page and select tourism, work, study, or family to see the exact rules — every answer cites a primary government source.`,
        },
      },
      {
        "@type": "Question",
        name: `Does ${name} have a work visa programme?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Most countries offer skilled-worker visas tied to a sponsoring employer. Pick your passport and choose "Work" to see ${name}'s eligibility criteria and processing times.`,
        },
      },
      {
        "@type": "Question",
        name: `What's ${name}'s student visa policy?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Student visas typically require an acceptance letter from an accredited institution and proof of funds. Select "Study" on this page for the specific requirements.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs crumbs={crumbs} />

        <NationalityHero
          iso2={upper}
          photo={photo}
          visaFreeCount={coverage ? coverage.byStatus.visa_free + coverage.byStatus.visa_free_with_eta : undefined}
          totalDestinations={coverage?.totalDestinationsCovered}
        />

        <CountryFactsBox iso2={upper} mode="destination" />

        {/* Investment-dashboard-style 9-tile country summary — relocation
            stats answered in <5 seconds before scrolling into the visa lists. */}
        <div className="mt-6">
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

        <section className="mt-12">
          <p className="kicker mb-2">Popular origins</p>
          <h2 className="section-h2 mb-2">From popular origin countries.</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-5">
            Pick your passport to see the exact rules for travel to {name}.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {TOP_ORIGINS.filter((p) => p !== upper).map((origin) => {
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
            {COUNTRY_LIST.filter((c) => c.iso2 !== upper).map((c) => (
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
