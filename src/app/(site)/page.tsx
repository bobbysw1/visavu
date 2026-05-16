import { Suspense } from "react";
import Link from "next/link";
import { HeroDestinationSearch } from "@/components/HeroDestinationSearch";
import { LookupForm } from "@/components/LookupForm";
import { RouteCard } from "@/components/RouteCard";
import { AllCountriesGrid } from "@/components/AllCountriesGrid";
import { ClaudeTipCallout } from "@/components/ClaudeTipCallout";
import { DestinationTileStrip } from "@/components/DestinationTileStrip";
import { PassportCollage } from "@/components/PassportCollage";
import { SITE, absoluteUrl } from "@/lib/site";
import { siteStats } from "@/lib/coverage";

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
          Paper-backed billboard with the brand mark + benefit-led H1.
          Single search input dominates; destination tile strip below it
          gives the hero its visual weight without committing to a single
          banner image. Soft gradient blob in the background prevents the
          paper field from feeling flat. */}
      <section className="relative overflow-hidden border-b border-[var(--color-rule)]">
        {/* Decorative gradient blobs — purely visual, behind everything. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 20%, rgba(16, 185, 129, 0.10) 0%, transparent 70%), radial-gradient(50% 50% at 85% 30%, rgba(59, 130, 246, 0.10) 0%, transparent 70%), radial-gradient(70% 60% at 50% 100%, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
          <p className="kicker mb-6">
            Every passport · Every destination · No middleman
          </p>
          <h1 className="billboard max-w-4xl mx-auto">
            Find the right visa for your move abroad
            <span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[var(--color-ink-muted)] max-w-2xl mx-auto leading-relaxed">
            Visa requirements and relocation roadmaps for every passport — answered
            in minutes, sourced from official government portals, never a content farm.
          </p>

          <div className="mt-10">
            <HeroDestinationSearch />
          </div>

          <DestinationTileStrip />

          {stats && stats.totalRecords > 0 && (
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)] rounded-2xl overflow-hidden max-w-3xl mx-auto">
              <Stat n={stats.totalRecords} label="verified records" />
              <Stat n={stats.distinctPassports} label="passports covered" />
              <Stat n={stats.distinctDestinations} label="destinations covered" />
              <Stat n={stats.distinctSources} label="primary sources" />
            </div>
          )}
        </div>
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
          Dense grid of real passport-cover photos — the signature visual
          we owe the brand. Every passport in our index, on one screen,
          each clickable into its dedicated page. Caption explains the
          Wikimedia Commons source so the CC attribution is visible. */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <p className="kicker mb-3">By passport</p>
            <h2 className="section-h2">Every passport in the world.</h2>
          </div>
          <Link
            href="/passport-rankings"
            className="text-sm underline underline-offset-4 hover:no-underline"
          >
            See the full rankings →
          </Link>
        </div>
        <PassportCollage caption />
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
          Every passport in the world. Pick yours to see where you can go and what&apos;s required.
        </p>
        <AllCountriesGrid mode="passport" />
      </section>

      {/* ─── BROWSE BY DESTINATION ─── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <p className="kicker mb-3">By destination</p>
        <h2 className="section-h2 mb-2">Browse by destination.</h2>
        <p className="text-[var(--color-ink-muted)] mb-6 max-w-xl">
          Every country. Pick a destination to see who can travel and on what terms.
        </p>
        <AllCountriesGrid mode="destination" />
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

function Stat({ n, label }: { n: number; label: string }) {
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
