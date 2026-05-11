import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { VisaCategoryNav } from "@/components/VisaCategoryNav";
import { CoverageStats } from "@/components/CoverageStats";
import { DestinationDifficultyBucketGrid } from "@/components/DifficultyBucketGrid";
import { COUNTRY_LIST, TOP_ORIGINS, flagEmoji, nameFor } from "@/lib/countries";
import { SITE, absoluteUrl } from "@/lib/site";
import { coverageForDestination, originSummariesForDestination } from "@/lib/coverage";
import { scoreOriginsForDestination } from "@/lib/scoring";

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
  const title = `${name} visa requirements: tourist, work, study, partner & diplomatic`;
  return {
    title,
    description: `Find out who needs a visa to enter ${name} for tourism, work, study, partner/family or diplomatic travel — sourced from official sources with primary-source links.`,
    alternates: { canonical: absoluteUrl(`/destination/${upper.toLowerCase()}`) },
    openGraph: {
      title,
      description: `Visa requirements for travel to ${name}, organised by passport country and purpose.`,
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

  const crumbs = [
    { href: "/", label: "Home" },
    { href: `/destination/${upper.toLowerCase()}`, label: `Travel to ${name}` },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Do I need a visa to enter ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Whether you need a visa to enter ${name} depends on your passport and the purpose of your trip. Pick your passport below and select your purpose (tourism, work, study, family) to see the visa type, cost, and stay length.`,
        },
      },
      {
        "@type": "Question",
        name: `Does ${name} offer work visas?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${name} typically offers work visa routes for skilled workers with a sponsoring employer. Pick your passport and select &ldquo;Work&rdquo; to see eligibility, salary thresholds, and processing details.`,
        },
      },
      {
        "@type": "Question",
        name: `What's ${name}'s student visa policy?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${name} typically issues student visas to applicants with a confirmed acceptance letter from an accredited institution and proof of sufficient funds. Pick your passport and select &ldquo;Study&rdquo; for the specific requirements.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I get a partner or family visa for ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Most countries offer partner or family visa routes for spouses, civil partners, and dependent children of citizens or residents. Pick your passport and select &ldquo;Partner / Family&rdquo; to see ${name}'s relationship eligibility, sponsor requirements, and processing times.`,
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

        <header className="flex items-center gap-4 mb-3">
          <span className="text-5xl" aria-hidden>{flagEmoji(upper)}</span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Travel to {name}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Tourist, work, study, family and diplomatic visa requirements for entering {name}.
            </p>
          </div>
        </header>

        {coverage && <CoverageStats snapshot={coverage} context="destination" />}

        {summaries.length > 0 && (
          <DestinationDifficultyBucketGrid
            destinationIso2={upper}
            scored={scoreOriginsForDestination(upper, summaries)}
          />
        )}

        <section className="mt-8 mb-2">
          <h2 className="text-base font-semibold mb-3">Browse by visa type</h2>
          <VisaCategoryNav iso={upper} mode="destination" />
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-4">From popular origin countries</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {TOP_ORIGINS.filter((p) => p !== upper).map((origin) => (
              <Link
                key={origin}
                href={`/${origin.toLowerCase()}/${upper.toLowerCase()}`}
                prefetch={false}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-sm"
              >
                <span className="text-lg" aria-hidden>{flagEmoji(origin)}</span>
                <span className="truncate">{nameFor(origin)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-4">From any passport (A–Z)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
            {COUNTRY_LIST.filter((c) => c.iso2 !== upper).map((c) => (
              <Link
                key={c.iso2}
                href={`/${c.iso2.toLowerCase()}/${upper.toLowerCase()}`}
                prefetch={false}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
              >
                <span className="text-base" aria-hidden>{c.flag}</span>
                <span className="truncate">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 prose prose-sm dark:prose-invert max-w-none">
          <h2>Visiting or moving to {name}: what to know</h2>
          <p>
            {name}&apos;s visa policy varies by your nationality, your purpose (short visit, work,
            study, family reunification, diplomatic), and sometimes by your point of departure. We
            pull data from {name}&apos;s ministry of foreign affairs and immigration services where
            available, and supplement with embassy guidance and regional bloc primary documents.
          </p>
          <p>
            Pick your passport above and your purpose to see the specific visa type, cost, stay
            length, processing time, and required documents — along with a direct link to the
            official application portal. Every answer carries a confidence indicator and the date
            we last verified it against the source.
          </p>
        </section>
      </main>
    </>
  );
}
