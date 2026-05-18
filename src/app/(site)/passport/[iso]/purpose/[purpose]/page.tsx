import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { COUNTRY_LIST, PASSPORT_COUNTRIES, issuesPassport, nameFor, flagEmoji } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { ALL_PURPOSES, PURPOSE_LABEL, PURPOSE_DESCRIPTION, isValidPurpose, type Purpose } from "@/lib/types";
import { SITE, absoluteUrl } from "@/lib/site";
import { destinationsForPassportPurpose } from "@/lib/passportPurpose";
import { destinationPurposeIntro } from "@/content/destinationPurposeIntros";
import { assessDifficulty, BUCKET_PALETTE, type DifficultyBucket } from "@/lib/difficulty";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 86_400;

export function generateStaticParams() {
  const params: Array<{ iso: string; purpose: string }> = [];
  for (const c of PASSPORT_COUNTRIES) {
    for (const p of ALL_PURPOSES) {
      params.push({ iso: c.iso2.toLowerCase(), purpose: p });
    }
  }
  return params;
}

type Params = { iso: string; purpose: string };

function isValid(iso: string): boolean {
  const upper = iso.toUpperCase();
  return COUNTRY_LIST.some((c) => c.iso2 === upper) && issuesPassport(upper);
}

const PURPOSE_HEADLINE: Record<Purpose, (adj: string) => string> = {
  tourism: (adj) => `Where can ${a(adj)} ${adj} traveller visit visa-free?`,
  business: (adj) => `Where can ${a(adj)} ${adj} traveller go for business?`,
  transit: (adj) => `${adj}-passport transit visa rules by destination`,
  work: (adj) => `Where can ${a(adj)} ${adj} traveller work?`,
  study: (adj) => `Where can ${a(adj)} ${adj} traveller study?`,
  family: (adj) => `${adj} family-route visa options worldwide`,
  diplomatic: (adj) => `${adj} diplomatic / service passport access`,
};

function a(word: string): "a" | "an" {
  const first = word.trim().charAt(0).toLowerCase();
  return ["a", "e", "i", "o", "u"].includes(first) ? "an" : "a";
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { iso, purpose } = await params;
  if (!isValid(iso) || !isValidPurpose(purpose)) return { title: "Not found" };
  const upper = iso.toUpperCase();
  const adj = nationalityFor(upper);
  const purposeLabel = PURPOSE_LABEL[purpose];
  const title = `${adj} passport — ${purposeLabel.toLowerCase()} visa requirements by destination`;
  const description = `${PURPOSE_HEADLINE[purpose](adj)} Filtered list of ${purposeLabel.toLowerCase()} visa routes from a ${adj} passport, with status, fees, processing times, and links to the destination's official immigration source.`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/passport/${upper.toLowerCase()}/purpose/${purpose}`) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/passport/${upper.toLowerCase()}/purpose/${purpose}`),
      images: [
        {
          url: absoluteUrl(`/og?passport=${upper}&purpose=${purpose}`),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

function bucketFor(score: number): DifficultyBucket {
  if (score >= 7) return "hard";
  if (score >= 5) return "medium";
  return "easy";
}

export default async function PassportPurposePage({ params }: { params: Promise<Params> }) {
  const { iso, purpose } = await params;
  if (!isValid(iso) || !isValidPurpose(purpose)) notFound();
  const upper = iso.toUpperCase();
  const name = nameFor(upper);
  const adj = nationalityFor(upper);
  const purposeLabel = PURPOSE_LABEL[purpose];

  let destinations: Awaited<ReturnType<typeof destinationsForPassportPurpose>> = [];
  try {
    destinations = await destinationsForPassportPurpose(upper, purpose);
  } catch {
    // DB unavailable — render empty state below.
  }

  // Score each destination and bucket. Pass null baselineTourismStatus —
  // page-level baseline lookup is too expensive for this static route,
  // and the scoring is still defensible without it.
  const scored = destinations.map((d) => {
    const score = assessDifficulty(
      {
        id: -1,
        passportIso2: upper,
        destinationIso2: d.destinationIso2,
        purpose,
        status: d.status,
        label: d.label,
        maxStayDays: d.maxStayDays,
        validityDays: null,
        entriesAllowed: null,
        passportValidityMonthsRequired: d.passportValidityMonthsRequired,
        blankPagesRequired: null,
        onwardTicketRequired: d.onwardTicketRequired,
        proofOfFundsRequired: d.proofOfFundsRequired,
        proofOfAccommodationRequired: d.proofOfAccommodationRequired,
        biometricsRequired: d.biometricsRequired,
        biometricsLocation: null,
        requirements: new Array(d.requirementsCount).fill(""),
        vaccinationRequirements: [],
        processingTimeDaysMin: null,
        processingTimeDaysMax: d.processingTimeDaysMax,
        applicationUrl: null,
        primarySourceUrl: null,
        fees: d.fees as never,
        blocDerivedFrom: null,
        eta: null,
        purposeMetadata: null,
        correctnessBucket: "high",
        lastFetchedAt: null,
        lastVerifiedAt: null,
        crossCheckResult: null,
        notes: null,
      },
      null,
    );
    return { ...d, score: score.score, bucket: bucketFor(score.score), reasons: score.reasons };
  });

  const buckets: Record<DifficultyBucket, typeof scored> = { easy: [], medium: [], hard: [] };
  for (const s of scored) buckets[s.bucket].push(s);
  for (const b of Object.values(buckets)) {
    b.sort((a, b) => a.destinationIso2.localeCompare(b.destinationIso2));
  }

  const crumbs = [
    { href: "/", label: "Home" },
    { href: `/passport/${upper.toLowerCase()}`, label: `${name} passport` },
    {
      href: `/passport/${upper.toLowerCase()}/purpose/${purpose}`,
      label: `${purposeLabel} visa routes`,
    },
  ];

  // ItemList JSON-LD so SERPs surface this as a curated list.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${purposeLabel} visa routes for ${adj} passport holders`,
    itemListElement: scored.slice(0, 50).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${nameFor(s.destinationIso2)} — ${s.label}`,
      url: absoluteUrl(`/${upper.toLowerCase()}/${s.destinationIso2.toLowerCase()}?purpose=${purpose}`),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <Breadcrumbs crumbs={crumbs} />

        <header className="space-y-4">
          <p className="kicker text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
            {name} passport &middot; {purposeLabel}
          </p>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            {PURPOSE_HEADLINE[purpose](adj)}
          </h1>
          <p className="text-lg text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
            {PURPOSE_DESCRIPTION[purpose]}. Filtered to {purposeLabel.toLowerCase()} only —
            {scored.length} destinations covered in Visavu&apos;s verified dataset.
          </p>
        </header>

        <DisclaimerBanner tone="info" compact />

        {/* PURPOSE NAV */}
        <nav aria-label="Switch purpose" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-sm">
          {ALL_PURPOSES.map((p) => {
            const href = `/passport/${upper.toLowerCase()}/purpose/${p}`;
            const isActive = p === purpose;
            return (
              <Link
                key={p}
                href={href}
                className={`block px-3 py-2 rounded-lg border min-w-0 overflow-hidden text-center transition ${
                  isActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600"
                }`}
                title={PURPOSE_DESCRIPTION[p]}
              >
                <span className={`truncate w-full ${isActive ? "font-semibold text-blue-900 dark:text-blue-200" : ""}`}>
                  {PURPOSE_LABEL[p]}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* PURPOSE-SPECIFIC EDITORIAL (when curated) */}
        {(() => {
          // Show curated content for the destination the user is most likely
          // to next-click — top of the easy bucket. Falls back silently.
          const sample = (buckets.easy[0] ?? buckets.medium[0] ?? buckets.hard[0])?.destinationIso2;
          const sampleIntro = sample ? destinationPurposeIntro(sample, purpose) : undefined;
          if (!sampleIntro) return null;
          return (
            <section className="ink-card p-5 sm:p-6 space-y-2 border-l-4 border-l-[var(--color-accent)]">
              <p className="kicker text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
                Featured: {nameFor(sample!)}
              </p>
              <p className="text-base leading-relaxed text-[var(--color-ink)]">{sampleIntro}</p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-2">
                <Link className="underline" href={`/${upper.toLowerCase()}/${sample!.toLowerCase()}?purpose=${purpose}`}>
                  Full {purposeLabel.toLowerCase()} visa details for {nationalityFor(upper)} citizens visiting {nameFor(sample!)} →
                </Link>
              </p>
            </section>
          );
        })()}

        {/* DESTINATIONS BUCKETED */}
        {scored.length === 0 ? (
          <section className="ink-card p-6 text-center">
            <p className="text-base">
              Visavu doesn&apos;t yet have verified {purposeLabel.toLowerCase()}-visa data for the {adj} passport.
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] mt-2">
              Try a different visa type above, or{" "}
              <Link href={`/passport/${upper.toLowerCase()}`} className="underline">
                browse the full {name} passport overview
              </Link>.
            </p>
          </section>
        ) : (
          (["easy", "medium", "hard"] as const).map((b) =>
            buckets[b].length === 0 ? null : (
              <section key={b} className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-3">
                  <span className={`inline-block w-3 h-3 rounded-full ${BUCKET_PALETTE[b].dot}`} />
                  {BUCKET_PALETTE[b].label}{" "}
                  <span className="text-sm font-normal text-[var(--color-ink-muted)]">
                    ({buckets[b].length})
                  </span>
                </h2>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {buckets[b].map((s) => (
                    <li key={s.destinationIso2}>
                      <Link
                        href={`/${upper.toLowerCase()}/${s.destinationIso2.toLowerCase()}?purpose=${purpose}`}
                        className="block rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:border-blue-400 dark:hover:border-blue-600 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-medium truncate">
                              <span className="mr-2">{flagEmoji(s.destinationIso2)}</span>
                              {nameFor(s.destinationIso2)}
                            </p>
                            <p className="text-xs text-[var(--color-ink-muted)] mt-1 line-clamp-2">{s.label}</p>
                          </div>
                          <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded ${BUCKET_PALETTE[b].chip}`}>
                            {s.score}/10
                          </span>
                        </div>
                        {s.maxStayDays != null && (
                          <p className="text-xs text-[var(--color-ink-muted)] mt-2">
                            Max stay {s.maxStayDays} days
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ),
          )
        )}

        <footer className="text-xs text-[var(--color-ink-muted)] border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <p>
            All data sourced from destination-country immigration portals. Difficulty score
            (1=easy, 10=hard) is computed deterministically from visa status, processing time,
            documentation burden, and sponsor requirements.{" "}
            <Link href={`/passport/${upper.toLowerCase()}`} className="underline">
              Full {name} passport overview →
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}
