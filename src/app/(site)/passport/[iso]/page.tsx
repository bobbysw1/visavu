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
import { COUNTRY_LIST, TOP_DESTINATIONS, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { SITE, absoluteUrl } from "@/lib/site";
import { coverageForPassport, destinationSummariesForPassport } from "@/lib/coverage";
import { passportIntroFor } from "@/content/passportIntros";
import { factsFor } from "@/content/countryFacts";
import { getCountryPhoto } from "@/lib/pexels";

export const maxDuration = 60;
export const runtime = "nodejs";

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
              <h2 className="text-2xl font-bold tracking-tight mb-4">
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
              <h2 className="text-xl font-bold tracking-tight mb-2">
                Browse by what you want to do
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Pick a purpose to see the {adjective.toLowerCase()}-specific rules.
              </p>
              <VisaCategoryNav iso={upper} mode="passport" />
            </section>

            {/* POPULAR DESTINATIONS */}
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-2">
                Most-searched routes from {name}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Clicking through pulls the {adjective.toLowerCase()}-specific rules, your
                merged-photo route hero, and a step-by-step prep checklist tailored to{" "}
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
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-sm"
                    >
                      <span className="text-base" aria-hidden>{country?.flag ?? "🏳️"}</span>
                      <span className="truncate">{nameFor(dest)}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* FULL A-Z LIST (collapsed feel — secondary content) */}
            <details className="group">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition">
                  <h2 className="text-base font-semibold">
                    Every destination, A → Z
                  </h2>
                  <span className="text-xs text-neutral-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </div>
              </summary>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-1">
                {COUNTRY_LIST.filter((c) => c.iso2 !== upper).map((c) => (
                  <Link
                    key={c.iso2}
                    href={`/${upper.toLowerCase()}/${c.iso2.toLowerCase()}`}
                    prefetch={false}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                  >
                    <span className="text-sm" aria-hidden>{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </Link>
                ))}
              </div>
            </details>

            {/* HONEST CAVEAT */}
            <section className="border-l-4 border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 pl-5 py-4 pr-4 rounded-r-lg text-sm text-amber-900 dark:text-amber-100">
              <p className="font-semibold mb-1">Before you book</p>
              <p>
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
