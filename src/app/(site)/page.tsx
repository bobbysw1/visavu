import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { HeroDestinationSearch } from "@/components/HeroDestinationSearch";
import { LookupForm } from "@/components/LookupForm";
import { RouteCard } from "@/components/RouteCard";
import { AllCountriesGrid } from "@/components/AllCountriesGrid";
import { ClaudeTipCallout } from "@/components/ClaudeTipCallout";
import { DestinationTileStrip } from "@/components/DestinationTileStrip";
import { PassportCollage, passportCollageCount } from "@/components/PassportCollage";
import { SITE, absoluteUrl } from "@/lib/site";
import { siteStats } from "@/lib/coverage";
import { getCountryPhotoSync } from "@/lib/pexels";
import { PASSPORT_COUNTRIES } from "@/lib/countries";

// Single editorial hero image — Switzerland's Matterhorn. Picked for the
// clean snow/sky palette (works well with white overlay text), and so it
// doesn't clash with the country photos used on /about (Acropolis) or
// /methodology (Colosseum).
const HERO_ISO = "CH";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}/{passport}/{destination}`,
    },
    "query-input": "required name=passport required name=destination",
  },
};

// Mix of short-stay and long-stay routes — signals the broader scope to crawlers
// and gives users a quick path into work/study/family-visa pages too.
const POPULAR_ROUTES: { from: string; to: string; purpose?: string; hint: string }[] = [
  { from: "US", to: "JP", hint: "Tourism · Visa-free 90 days" },
  { from: "GB", to: "US", hint: "Tourism · ESTA required" },
  { from: "IN", to: "GB", purpose: "work", hint: "Work · Skilled Worker visa" },
  { from: "IN", to: "AU", purpose: "study", hint: "Study · Subclass 500" },
  { from: "PH", to: "GB", purpose: "family", hint: "Family · Spouse visa" },
  { from: "DE", to: "US", hint: "Tourism · ESTA required" },
  { from: "BR", to: "PT", hint: "Tourism · Visa-free 90 days" },
  { from: "CN", to: "TH", hint: "Tourism · Visa-free agreement" },
];

export default async function HomePage() {
  let stats: Awaited<ReturnType<typeof siteStats>> | null = null;
  try {
    stats = await siteStats();
  } catch {
    // DB unavailable — render hero without the stats row.
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ─── EDITORIAL HERO ───
          Full-bleed Matterhorn backdrop with the brand mark + benefit-led
          H1 overlaid. Dark gradient keeps the white headline readable
          against any part of the photo. The search input + stats remain
          inside the hero on a white card so the form keeps its weight.
          Destination tile strip sits on the paper field below the hero. */}
      {(() => {
        const heroPhoto = getCountryPhotoSync(HERO_ISO);
        return (
          <section className="relative overflow-hidden border-b border-[var(--color-rule)]">
            {/* Backdrop photo — full-bleed, eager-loaded for LCP. */}
            {heroPhoto ? (
              <>
                {/* next/image with `priority` emits its own preload + WebP
                    srcset for the LCP image. `sizes="100vw"` because the
                    backdrop fills the whole viewport edge-to-edge. */}
                <Image
                  src={heroPhoto.url}
                  alt={heroPhoto.alt}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                {/* Dark gradient — heavier at the top so the kicker /
                    headline / lead stay legible against any photo, lighter
                    at the bottom so the search card and stats sit on a
                    softer field. */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/40" />
                <a
                  href={heroPhoto.pexelsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="absolute top-3 right-3 z-10 text-[10px] uppercase tracking-wider font-semibold text-white bg-black/70 backdrop-blur px-2 py-1 rounded shadow hover:bg-black/85 transition"
                >
                  Photo: {heroPhoto.photographer} · Pexels
                </a>
              </>
            ) : (
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(60% 50% at 15% 20%, rgba(16, 185, 129, 0.30) 0%, transparent 70%), radial-gradient(50% 50% at 85% 30%, rgba(59, 130, 246, 0.30) 0%, transparent 70%), linear-gradient(180deg, #0f172a, #1e293b)",
                }}
              />
            )}
            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-14 sm:pt-28 sm:pb-20 text-center">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold text-white/85 mb-6 drop-shadow-sm">
                Every passport · Every destination · No middleman
              </p>
              <h1 className="serif-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.05] tracking-tight max-w-4xl mx-auto text-white drop-shadow-sm">
                Find the right visa for your move abroad
                <span className="text-[var(--color-accent)]">.</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
                Visa requirements and relocation roadmaps for every passport —
                answered in minutes, sourced from official government portals,
                never a content farm.
              </p>

              <div className="mt-10">
                <HeroDestinationSearch />
              </div>

              {stats && stats.totalRecords > 0 && (
                <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/20 backdrop-blur ring-1 ring-white/20 rounded-2xl overflow-hidden max-w-3xl mx-auto">
                  <Stat n={stats.totalRecords} label="verified records" tone="dark" />
                  <Stat n={stats.distinctPassports} label="passports covered" tone="dark" />
                  <Stat n={stats.distinctDestinations} label="destinations covered" tone="dark" />
                  <Stat n={stats.distinctSources} label="primary sources" tone="dark" />
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* ─── POPULAR DESTINATIONS STRIP ───
          Sits on the paper field below the hero so the photo tiles read
          as discrete browsable shortcuts rather than competing with the
          backdrop. */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-10 sm:pt-12">
        <DestinationTileStrip />
      </section>

      {/* ─── WHY WE EXIST ───
          Cleaner two-column editorial — a confident H2 on the left,
          structured prose on the right. No drop-cap (too newspaper-y).
          Positions the product as "we cut the noise". */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24 border-t border-[var(--color-rule)]">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
          <div>
            <p className="kicker mb-4">Why Visavu</p>
            <h2 className="section-h2 leading-[1.1]">
              We make visa applications simple<span className="text-[var(--color-accent)]">.</span>
            </h2>
          </div>
          <div className="space-y-5 text-base sm:text-lg text-[var(--color-ink)]/85 leading-relaxed max-w-2xl">
            <p>
              Visa applications are noisy. Government portals bury the answer in ten layers of
              menus. Consultants charge £500 to read the same page back to you. Every forum has
              a different opinion on what &ldquo;genuine and subsisting relationship&rdquo;
              actually means.
            </p>
            <p>
              We&apos;ve cut the noise. Every visa route — from a weekend in Albania to a
              five-year work permit in Zimbabwe — researched, structured, and presented the
              same way. The fee, the timeline, the document checklist, the personal-statement
              skeleton, and the lawyer-vs-DIY triage all sit on one page. No middleman, no
              markup, every Apply button pointed straight at the official source.
            </p>
            <p className="serif-display text-xl sm:text-2xl text-[var(--color-ink)] pt-3 border-t border-[var(--color-rule)]">
              Whichever passport you carry, wherever you&apos;re going — we&apos;ve got you.
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] pt-2">
              <Link
                href="/disclosure"
                className="underline underline-offset-4 hover:no-underline text-[var(--color-ink)]"
              >
                How we keep the lights on →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── PROFILE ENRICHMENT CTA ───
          Subtle editorial callout — optional profile that sharpens results. */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 mb-16">
        <div className="ink-card p-6 sm:p-8 flex flex-wrap items-center gap-6 justify-between border-l-4 border-l-[var(--color-accent)]">
          <div className="flex-1 min-w-[260px]">
            <p className="kicker text-[var(--color-accent)] mb-2">
              Optional · sharpens every result
            </p>
            <h2 className="serif-display text-2xl sm:text-3xl font-medium mb-2">
              Tell us a bit about you.
            </h2>
            <p className="text-[var(--color-ink)]/85 max-w-xl leading-relaxed">
              Your occupation, capital, family, timeline, and long-term goals all change which
              visas you actually qualify for. Fill in what you&apos;re comfortable sharing — we
              remember it locally and use it to prioritise routes everywhere on the site.
            </p>
          </div>
          <Link
            href="/find-my-visa"
            className="plausible-event-name=FindMyVisaClicked inline-flex items-center px-5 py-3 rounded-full bg-[var(--color-ink)] hover:opacity-90 text-[var(--color-paper)] text-sm font-semibold whitespace-nowrap"
          >
            Add your details →
          </Link>
        </div>
      </section>

      {/* ─── DIRECT LOOKUP ───
          For users who already know the destination. */}
      <section id="direct" className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <p className="kicker mb-3">Already know where you&apos;re going?</p>
        <h2 className="section-h2 mb-2">Look up a specific route.</h2>
        <p className="text-[var(--color-ink-muted)] mb-6 max-w-xl">
          Pick your passport and the destination directly.
        </p>
        <div className="ink-card p-5 sm:p-6">
          <Suspense fallback={null}>
            <LookupForm />
          </Suspense>
        </div>
      </section>

      {/* ─── VISA TYPES ─── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <p className="kicker mb-3">Coverage</p>
        <h2 className="section-h2 mb-2">Every visa type you might need.</h2>
        <p className="text-[var(--color-ink-muted)] mb-8 max-w-xl">
          One place for short-stay, long-stay and official visas — with primary-source links.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <VisaTypeCard title="Tourist" body="Visa-free, eTA, visa on arrival, e-Visa or embassy visa." />
          <VisaTypeCard title="Business" body="Meetings, conferences, negotiations and short-term business travel." />
          <VisaTypeCard title="Work" body="Skilled worker, intra-company transfer, investor and entrepreneur routes." />
          <VisaTypeCard title="Study" body="Student visas, language courses and degree programs across the globe." />
          <VisaTypeCard title="Partner / family" body="Spouse, partner, dependent and family reunification routes." />
          <VisaTypeCard title="Transit" body="Airside transit, transit visas and TWOV programs." />
          <VisaTypeCard title="Diplomatic" body="Diplomatic and service passport visa rules and exemptions." />
          <VisaTypeCard title="Sourced" body="Every answer carries a direct link to the official government page." />
        </div>
      </section>

      {/* ─── POPULAR ROUTES ─── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <p className="kicker mb-3">Popular routes</p>
            <h2 className="section-h2">High-traffic corridors.</h2>
          </div>
          <Link
            href="/passport/us"
            className="text-sm underline underline-offset-4 hover:no-underline"
          >
            Browse by passport →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {POPULAR_ROUTES.map((r) => (
            <RouteCard
              key={`${r.from}-${r.to}-${r.purpose ?? "tourism"}`}
              passport={r.from}
              destination={r.to}
              purpose={r.purpose}
              hint={r.hint}
            />
          ))}
        </div>
      </section>

      {/* ─── PASSPORT COLLAGE ───
          Dense grid of real passport-cover photos. The headline talks
          about VISA coverage (every passport-issuing country) so users
          don't mistake the photo grid count for our product coverage.
          The collage shows what we have photographed so far; the
          underlying visa data covers all 237 passport-issuing nations. */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <p className="kicker mb-3">By passport</p>
            <h2 className="section-h2">
              Visa data for every passport<span className="text-[var(--color-accent)]">.</span>
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)] mt-2 max-w-xl">
              All {PASSPORT_COUNTRIES.length} passport-issuing countries are in our
              index. {passportCollageCount()} have photographed covers so far — more
              landing each week. Pick yours to see where you can go and what&apos;s
              required.
            </p>
          </div>
          <Link
            href="/passport-rankings"
            className="text-sm underline underline-offset-4 hover:no-underline"
          >
            See the full rankings →
          </Link>
        </div>
        <PassportCollage />
      </section>

      {/* ─── VALUE PROPS ───
          Editorial three-column quote-style block. */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        <div className="border-l-2 border-[var(--color-ink)] pl-5">
          <h3 className="serif-display text-xl font-medium mb-2">Every answer is linked.</h3>
          <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed">
            We show the primary government URL on every result. If our answer disagrees with the
            source, the source wins. We&apos;re an aggregator, not an oracle.
          </p>
        </div>
        <div className="border-l-2 border-[var(--color-ink)] pl-5">
          <h3 className="serif-display text-xl font-medium mb-2">Last verified, not last fetched.</h3>
          <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed">
            Most sites tell you they updated 2 days ago when they mean &ldquo;crawled.&rdquo; We
            distinguish between fetching and verifying — and decay confidence on stale records.
          </p>
        </div>
        <div className="border-l-2 border-[var(--color-ink)] pl-5">
          <h3 className="serif-display text-xl font-medium mb-2">No application services.</h3>
          <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed">
            We will never sell you a visa, a service fee, or a &ldquo;rush.&rdquo; Apply directly
            with the government. Our incentive is being right, not collecting commissions.
          </p>
        </div>
      </section>

      {/* ─── CLAUDE TIP — founder story ─── */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <ClaudeTipCallout />
      </section>

      {/* ─── BROWSE BY NATIONALITY ─── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <p className="kicker mb-3">By passport</p>
        <h2 className="section-h2 mb-2">Browse by nationality.</h2>
        <p className="text-[var(--color-ink-muted)] mb-6 max-w-xl">
          Pick your passport to see where you can go and what&apos;s required —
          coverage expands as we add more passports each week.
        </p>
        <AllCountriesGrid mode="passport" compact />
      </section>

      {/* ─── BROWSE BY DESTINATION ─── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <p className="kicker mb-3">By destination</p>
        <h2 className="section-h2 mb-2">Browse by destination.</h2>
        <p className="text-[var(--color-ink-muted)] mb-6 max-w-xl">
          Every country. Pick a destination to see who can travel and on what terms.
        </p>
        <AllCountriesGrid mode="destination" compact />
      </section>
    </>
  );
}

function VisaTypeCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="ink-card p-4">
      <p className="serif-display text-base font-medium mb-1">{title}</p>
      <p className="text-xs text-[var(--color-ink-muted)] leading-snug">{body}</p>
    </div>
  );
}

function Stat({
  n,
  label,
  tone = "paper",
}: {
  n: number;
  label: string;
  /** "paper" renders dark text on the elevated paper surface (default).
   *  "dark" renders white text on a translucent dark surface — used in
   *  the photo-backdrop hero where the stats sit over a dark gradient. */
  tone?: "paper" | "dark";
}) {
  if (tone === "dark") {
    return (
      <div className="bg-black/30 backdrop-blur p-4 sm:p-5">
        <p className="serif-display text-3xl sm:text-4xl font-medium tabular text-white drop-shadow-sm">
          {new Intl.NumberFormat("en").format(n)}
        </p>
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/85 mt-1">
          {label}
        </p>
      </div>
    );
  }
  return (
    <div className="bg-[var(--color-paper-elev)] p-4 sm:p-5">
      <p className="serif-display text-3xl sm:text-4xl font-medium tabular text-[var(--color-ink)]">
        {new Intl.NumberFormat("en").format(n)}
      </p>
      <p className="kicker mt-1">{label}</p>
    </div>
  );
}

export const metadata = {
  alternates: { canonical: absoluteUrl("/") },
};
