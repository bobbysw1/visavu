import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { VisaCategoryNav } from "@/components/VisaCategoryNav";
import { WorldMap, type EligibilityEntry } from "@/components/WorldMap";
import { getWorldMapData } from "@/lib/worldMap";
import { assessDifficulty } from "@/lib/difficulty";
import { ContinentResultsGrid } from "@/components/ContinentResultsGrid";
import { scoreDestinationsForPassport } from "@/lib/scoring";
import { NationalityHero } from "@/components/NationalityHero";
import { PassportSidebar } from "@/components/PassportSidebar";
import { CountrySilhouette } from "@/components/CountrySilhouette";
import { COUNTRY_LIST, PASSPORT_COUNTRIES, TOP_DESTINATIONS, issuesPassport, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { SITE, absoluteUrl } from "@/lib/site";
import { coverageForPassport, destinationSummariesForPassport } from "@/lib/coverage";
import { passportIntroFor } from "@/content/passportIntros";
import { factsFor } from "@/content/countryFacts";
import { getCountryPhoto } from "@/lib/pexels";

export const maxDuration = 60;
export const runtime = "nodejs";
// Cost optimisation: SSG every passport profile at build time, ISR-revalidate
// once a day. 250 countries × ~1s build cost = ~4 min added to build; in
// return every visitor + every Googlebot crawl is served from the edge
// cache with zero Fluid Active CPU.
export const revalidate = 86_400;
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return PASSPORT_COUNTRIES.map((c) => ({ iso: c.iso2.toLowerCase() }));
}

type Params = { iso: string };

function isValid(iso: string) {
  const upper = iso.toUpperCase();
  return COUNTRY_LIST.some((c) => c.iso2 === upper) && issuesPassport(upper);
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
  const name = nameFor(upper);
  const facts = factsFor(upper);
  const title = `${adjective} passport — visa requirements, mobility, country guide`;
  const desc = facts
    ? `Where can ${adjective} citizens travel? ${name} (pop. ${(facts.population / 1_000_000).toFixed(1)}M, ${facts.region}). Visa rules for every destination, mobility ranking, embassy directory, and a one-stop ${adjective.toLowerCase()} travel guide.`
    : `Where can ${adjective} citizens travel? Visa rules for every destination — tourism, work, study, family — with primary government sources, mobility ranking, and embassy details.`;
  return {
    title,
    description: desc,
    alternates: { canonical: absoluteUrl(`/passport/${upper.toLowerCase()}`) },
    openGraph: {
      title,
      description: `Visa requirements and travel guide for ${adjective} passport holders.`,
      url: absoluteUrl(`/passport/${upper.toLowerCase()}`),
      images: [
        {
          url: absoluteUrl(`/og?passport=${upper}`),
          width: 1200,
          height: 630,
          alt: `${adjective} passport — visa requirements & travel guide`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `Visa requirements and travel guide for ${adjective} passport holders.`,
      images: [absoluteUrl(`/og?passport=${upper}`)],
    },
  };
}

export default async function PassportIndex({ params }: { params: Promise<Params> }) {
  const { iso } = await params;
  if (!isValid(iso)) notFound();
  const upper = iso.toUpperCase();
  const name = nameFor(upper);
  const adjective = nationalityFor(upper);

  let coverage = null;
  let summaries: Awaited<ReturnType<typeof destinationSummariesForPassport>> = [];
  try {
    coverage = await coverageForPassport(upper);
    summaries = await destinationSummariesForPassport(upper);
  } catch {
    // DB unavailable — render zero state.
  }

  const photo = await getCountryPhoto(upper);
  const intro = passportIntroFor(upper);
  const facts = factsFor(upper);

  const crumbs = [
    { href: "/", label: "Home" },
    { href: `/passport/${upper.toLowerCase()}`, label: `${name} passport` },
  ];

  // Top visa types used from this passport — aggregate the most-common
  // statuses across destinations for the editorial section.
  const mobilityScore = coverage
    ? coverage.byStatus.visa_free + coverage.byStatus.visa_free_with_eta
    : null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How many countries can ${name} passport holders visit visa-free?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            mobilityScore !== null
              ? `${name} passport holders can enter approximately ${mobilityScore} countries visa-free or with a simple electronic travel authorisation (eTA). The remaining countries require an embassy-issued visa or e-Visa applied for in advance.`
              : `Visa-free access depends on bilateral agreements and policy changes. Use our ${name} passport directory to see current requirements for each destination.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the strongest passport in the world?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `As of 2026 the most powerful passports are Japan, Singapore, South Korea and Germany — each offering visa-free or eTA access to ~190 destinations. The ${adjective} passport ranks separately depending on bilateral agreements and EU/Schengen membership.`,
        },
      },
      {
        "@type": "Question",
        name: `Can ${name} passport holders work abroad?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${name} passport holders can apply for work visas in many countries — typically requiring a sponsoring employer and skills assessment. Long-stay routes include the UK Skilled Worker, Australia Subclass 482, Canada Express Entry, and Germany's EU Blue Card. Pick a destination and select 'Work' for the specific rules.`,
        },
      },
      {
        "@type": "Question",
        name: `What's the difference between visa-free and visa-free with an eTA?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Visa-free means no advance authorisation is required before boarding. Visa-free with eTA means you don't need a visa, but you must obtain an electronic travel authorisation (e.g. ESTA, Canada eTA, UK ETA) before travelling. Airlines will deny boarding without it.`,
        },
      },
    ],
  };

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
    name: `${adjective} passport — visa requirements directory`,
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

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs crumbs={crumbs} />

        <NationalityHero
          iso2={upper}
          visaFreeCount={mobilityScore ?? undefined}
          totalDestinations={coverage?.totalDestinationsCovered}
          photo={photo}
        />

        {/* 12-column split: editorial main + slender info rail.
            Stacks on mobile (sidebar moves below content). */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* MAIN COLUMN */}
          <article className="lg:col-span-8 space-y-10">
            {/* OPENING NARRATIVE — curated where available, generated otherwise.
                This is the SEO-critical unique content per country. */}
            <section className="editorial-body relative">
              {/* Country silhouette as a decorative anchor — sourced from
                  the open-source djaiss/mapsicon library (CC-BY 4.0). */}
              <div className="absolute top-0 right-0 -translate-y-2 pointer-events-none opacity-[0.10] dark:opacity-[0.18]">
                <CountrySilhouette iso2={upper} size={180} tone="default" />
              </div>
              <h2 className="section-h2 mb-4">
                Travel from {name}: the picture in 2026
              </h2>
              {intro ? (
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  {intro}
                </p>
              ) : (
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  The {adjective.toLowerCase()} passport opens approximately{" "}
                  <strong>{mobilityScore ?? "—"}</strong> destinations
                  {coverage?.totalDestinationsCovered
                    ? ` of the ${coverage.totalDestinationsCovered} we cover`
                    : ""}{" "}
                  visa-free or with an electronic travel authorisation. For everything else, an
                  embassy visa, e-Visa, or sponsored long-stay permit applies — costs, processing
                  times, and the actual government link sit on every destination page below. The
                  highest-traffic routes for {adjective.toLowerCase()} travellers tend to be
                  tourism within the region, study at universities in the US, UK, Canada, Australia
                  and the EU, and work routes via employer-sponsored skilled-worker programmes.
                </p>
              )}
            </section>

            {/* WORLD MAP — premium interactive geography. Eligible
                destinations shaded by visa status; hover reveals difficulty,
                processing time, salary, tax, safety, PR pathway in a
                popover; click jumps to the full route. */}
            {summaries.length > 0 && (() => {
              const worldData = getWorldMapData();
              const eligibility: Record<string, EligibilityEntry> = {};
              for (const s of summaries) {
                const a = assessDifficulty({
                  id: -1,
                  passportIso2: upper,
                  destinationIso2: s.destinationIso2,
                  purpose: s.purpose,
                  status: s.status,
                  label: s.label,
                  maxStayDays: s.maxStayDays,
                  validityDays: null,
                  entriesAllowed: null,
                  passportValidityMonthsRequired: s.passportValidityMonthsRequired,
                  blankPagesRequired: null,
                  onwardTicketRequired: s.onwardTicketRequired,
                  proofOfFundsRequired: s.proofOfFundsRequired,
                  proofOfAccommodationRequired: s.proofOfAccommodationRequired,
                  biometricsRequired: s.biometricsRequired,
                  biometricsLocation: null,
                  requirements: new Array(s.requirementsCount).fill(""),
                  vaccinationRequirements: [],
                  processingTimeDaysMin: null,
                  processingTimeDaysMax: s.processingTimeDaysMax,
                  applicationUrl: null,
                  primarySourceUrl: null,
                  fees: s.fees.map((f) => ({
                    kind: f.kind as "base" | "service" | "biometrics" | "courier" | "vac" | "rush" | "other",
                    amountMinor: f.amountMinor,
                    currency: f.currency,
                    asOf: "",
                    optional: f.optional,
                  })),
                  blocDerivedFrom: null,
                  eta: null,
                  purposeMetadata: null,
                  correctnessBucket: "high",
                  lastFetchedAt: null,
                  lastVerifiedAt: null,
                  notes: null,
                });
                eligibility[s.destinationIso2] = {
                  status: s.status,
                  label: s.label,
                  difficultyScore: a.score,
                  difficultyBucket: a.bucket,
                  processingDaysMax: s.processingTimeDaysMax,
                  purpose: s.purpose,
                };
              }
              return (
                <section>
                  <WorldMap
                    data={worldData}
                    passportIso2={upper}
                    eligibility={eligibility}
                    title={`Where ${name} passport holders can go`}
                    subtitle="Hover any country for visa rules + living-conditions snapshot. Click to open the full route."
                  />
                </section>
              );
            })()}

            {/* CONTINENT TABS — seven-tab geographic browse with sort
                axes (difficulty / cost / processing / visa type / name).
                Cards stay visual + tile-based. */}
            {summaries.length > 0 && (
              <ContinentResultsGrid
                mode="passport"
                anchorIso2={upper}
                scored={scoreDestinationsForPassport(upper, summaries)}
                heading="Where you can go, by continent"
                subheading={`Tabbed by region. Switch the sort to find the easiest, cheapest, or fastest options from ${name}.`}
              />
            )}

            {/* VISA TYPE BROWSE */}
            <section>
              <p className="kicker mb-2">By purpose</p>
              <h2 className="section-h2 mb-2">Browse by what you want to do.</h2>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                Pick a purpose to see the {adjective.toLowerCase()}-specific rules.
              </p>
              <VisaCategoryNav iso={upper} mode="passport" />
            </section>

            {/* POPULAR DESTINATIONS */}
            <section>
              <p className="kicker mb-2">Popular routes</p>
              <h2 className="section-h2 mb-2">Most-searched routes from {name}.</h2>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                Each link opens a step-by-step prep checklist tailored to{" "}
                {adjective.toLowerCase()} applicants.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TOP_DESTINATIONS.filter((d) => d !== upper).map((dest) => {
                  const country = COUNTRY_LIST.find((c) => c.iso2 === dest);
                  return (
                    <Link
                      key={dest}
                      href={`/${upper.toLowerCase()}/${dest.toLowerCase()}`}
                      prefetch={false}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-elev)] hover:border-[var(--color-ink)] transition text-sm"
                    >
                      <span className="text-base" aria-hidden>{country?.flag ?? "🏳️"}</span>
                      <span className="truncate">{nameFor(dest)}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* FULL A-Z LIST (collapsed) */}
            <details className="group ink-card overflow-hidden">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-5 py-4 hover:bg-[var(--color-muted)]/40 transition">
                <h2 className="serif-display text-lg font-medium">Every destination, A → Z</h2>
                <span className="chev text-[var(--color-ink-muted)]">▾</span>
              </summary>
              <div className="px-5 pb-5 border-t border-[var(--color-rule)] pt-4 grid grid-cols-2 sm:grid-cols-3 gap-1">
                {COUNTRY_LIST.filter((c) => c.iso2 !== upper).map((c) => (
                  <Link
                    key={c.iso2}
                    href={`/${upper.toLowerCase()}/${c.iso2.toLowerCase()}`}
                    prefetch={false}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded text-sm hover:bg-[var(--color-muted)]/60 transition"
                  >
                    <span className="text-sm" aria-hidden>{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </Link>
                ))}
              </div>
            </details>

            {/* HONEST CAVEAT — editorial pull-quote style */}
            <section className="border-l-2 border-[var(--color-accent)] pl-5 py-1">
              <p className="serif-display text-lg font-medium mb-1">Before you book</p>
              <p className="text-sm text-[var(--color-ink)]/85 leading-relaxed max-w-2xl">
                A valid visa lets you travel — entry is still at the immigration officer&apos;s
                discretion. For work, study and family routes especially, double-check the
                destination&apos;s embassy guidance before signing leases or quitting jobs. Every
                page on Visavu links straight at the government source so you can verify in two
                clicks.
              </p>
            </section>
          </article>

          {/* SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="sticky top-20">
              <PassportSidebar iso2={upper} coverage={coverage} summaries={summaries} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
