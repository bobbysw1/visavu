import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { VisaCategoryNav } from "@/components/VisaCategoryNav";
import { CoverageStats } from "@/components/CoverageStats";
import { DifficultyBucketGrid } from "@/components/DifficultyBucketGrid";
import { DifficultyHeatMap } from "@/components/DifficultyHeatMap";
import { NationalityHero } from "@/components/NationalityHero";
import { COUNTRY_LIST, TOP_DESTINATIONS, flagEmoji, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { SITE, absoluteUrl } from "@/lib/site";
import { coverageForPassport, destinationSummariesForPassport } from "@/lib/coverage";
import { scoreDestinationsForPassport } from "@/lib/scoring";
import { passportIntroFor } from "@/content/passportIntros";
import { getCountryPhoto } from "@/lib/pexels";

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
  const adjective = nationalityFor(upper);
  const title = `${adjective} passport: visa requirements for tourist, work, study & family travel`;
  return {
    title,
    description: `Visa requirements for ${adjective} passport holders. Tourist, business, transit, work, study, partner and diplomatic visa rules — sourced from official government data with primary-source links.`,
    alternates: { canonical: absoluteUrl(`/passport/${upper.toLowerCase()}`) },
    openGraph: {
      title,
      description: `Where ${adjective} passport holders can travel — visa-free countries, eTA destinations, work visa eligibility, and study & family routes.`,
      url: absoluteUrl(`/passport/${upper.toLowerCase()}`),
    },
  };
}

export default async function PassportIndex({ params }: { params: Promise<Params> }) {
  const { iso } = await params;
  if (!isValid(iso)) notFound();
  const upper = iso.toUpperCase();
  const name = nameFor(upper);

  let coverage = null;
  let summaries: Awaited<ReturnType<typeof destinationSummariesForPassport>> = [];
  try {
    coverage = await coverageForPassport(upper);
    summaries = await destinationSummariesForPassport(upper);
  } catch {
    // DB unavailable (no DATABASE_URL or PGlite not bootstrapped) — render zero state.
  }

  // Hero photo via Pexels. Returns null when PEXELS_API_KEY isn't set or
  // the API can't be reached — NationalityHero falls back to the gradient.
  const photo = await getCountryPhoto(upper);

  const crumbs = [
    { href: "/", label: "Home" },
    { href: `/passport/${upper.toLowerCase()}`, label: `${name} passport` },
  ];

  const intro = passportIntroFor(upper);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How many countries can ${name} passport holders visit visa-free?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Visa-free access depends on bilateral agreements and policy changes. Use our ${name} passport directory to see current requirements for each destination, with the date we last verified each entry.`,
        },
      },
      {
        "@type": "Question",
        name: `Can ${name} passport holders work abroad?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${name} passport holders can apply for work visas in many countries. Eligibility typically depends on having a confirmed job offer from a licensed sponsor and meeting salary or skill thresholds. Pick a destination and select &ldquo;Work&rdquo; to see the specific requirements.`,
        },
      },
      {
        "@type": "Question",
        name: `What's the difference between visa-free and visa-free with an eTA?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `&ldquo;Visa-free&rdquo; means no advance authorisation is required before boarding. &ldquo;Visa-free with eTA&rdquo; means you don't need a visa, but you must obtain an electronic travel authorisation (e.g. ESTA, Canada eTA, UK ETA) before travelling. Airlines will deny boarding without it.`,
        },
      },
      {
        "@type": "Question",
        name: `Where can ${name} passport holders study or join a partner abroad?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Most countries offer student and partner/family visa routes. Pick a destination and select &ldquo;Study&rdquo; or &ldquo;Partner / Family&rdquo; to see the specific eligibility, financial requirements, and processing times.`,
        },
      },
    ],
  };

  // ItemList of popular destinations — gives Google a structured signal of
  // the top routes from this passport. Helps surface site links in SERPs.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Popular destinations for ${name} passport holders`,
    itemListElement: TOP_DESTINATIONS.filter((d) => d !== upper).slice(0, 12).map((dest, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${nameFor(dest)} visa requirements for ${name} citizens`,
      url: absoluteUrl(`/${upper.toLowerCase()}/${dest.toLowerCase()}`),
    })),
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${nationalityFor(upper)} passport — visa requirements directory`,
    url: absoluteUrl(`/passport/${upper.toLowerCase()}`),
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    about: { "@type": "Country", name },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs crumbs={crumbs} />

        <NationalityHero
          iso2={upper}
          visaFreeCount={
            coverage
              ? coverage.byStatus.visa_free + coverage.byStatus.visa_free_with_eta
              : undefined
          }
          totalDestinations={coverage?.totalDestinationsCovered}
          photo={photo}
        />

        {coverage && <CoverageStats snapshot={coverage} context="passport" />}

        {summaries.length > 0 && <DifficultyHeatMap passportIso2={upper} summaries={summaries} />}

        {summaries.length > 0 && (
          <DifficultyBucketGrid
            passportIso2={upper}
            scored={scoreDestinationsForPassport(upper, summaries)}
          />
        )}

        {intro && (
          <section className="mt-8 prose prose-sm dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
              {intro}
            </p>
          </section>
        )}

        <section className="mt-8 mb-2">
          <h2 className="text-base font-semibold mb-3">Browse by visa type</h2>
          <VisaCategoryNav iso={upper} mode="passport" />
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Popular destinations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {TOP_DESTINATIONS.filter((d) => d !== upper).map((dest) => (
              <Link
                key={dest}
                href={`/${upper.toLowerCase()}/${dest.toLowerCase()}`}
                prefetch={false}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-sm"
              >
                <span className="text-lg" aria-hidden>{flagEmoji(dest)}</span>
                <span className="truncate">{nameFor(dest)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-4">All destinations (A–Z)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
            {COUNTRY_LIST.filter((c) => c.iso2 !== upper).map((c) => (
              <Link
                key={c.iso2}
                href={`/${upper.toLowerCase()}/${c.iso2.toLowerCase()}`}
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
          <h2>About travel from {name}</h2>
          <p>
            Visa requirements for {name} passport holders vary by destination, purpose, and
            policies that change without notice. We pull from official government sources where
            possible — embassy and ministry-of-foreign-affairs pages — and surface the date we
            last verified each requirement, plus a direct link to the primary source on every
            answer.
          </p>
          <p>
            For each destination, you&apos;ll find tourist, business, transit, work, study,
            partner/family and diplomatic visa routes (where applicable). Each shows the visa
            type, maximum stay, typical cost, processing time, and the official application URL.
          </p>
          <p>
            <strong>Important:</strong> a valid visa permits entry subject to officer discretion
            at the border. Always verify with the destination&apos;s embassy or consulate before
            booking travel, accepting employment, or making relocation plans — particularly for
            long-stay routes (work, study, family) where the consequences of incorrect information
            are severe.
          </p>
        </section>
      </main>
    </>
  );
}
