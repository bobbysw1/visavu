import { Suspense } from "react";
import Link from "next/link";
import { Landmark, UserX, Ban } from "lucide-react";
import { LookupForm } from "@/components/LookupForm";
import { RouteCard } from "@/components/RouteCard";
import { AllCountriesGrid } from "@/components/AllCountriesGrid";
import { COUNTRY_LIST } from "@/lib/countries";
import { NATIONALITY } from "@/lib/nationalities";
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

      {/* Hero — wizard-led. The most aspirational moment on the site is
          picking your dream destination, not retrieving a known answer. */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="hero-globe" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="text-center mb-10">
            <p className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-200/60 dark:ring-emerald-900/60 mb-6">
              Every passport · Every destination · No middleman
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-slate-900 dark:text-slate-50">
              Where can you go
              <span className="bg-gradient-to-br from-blue-600 to-emerald-600 bg-clip-text text-transparent">?</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Pick your nationality and what you want to do. We&apos;ll show every country open to
              you, ranked easiest first — sourced from each destination&apos;s government portal.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 card-elev p-6 sm:p-8">
            <form method="GET" action="/finder" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hero-passport" className="block text-sm font-semibold mb-2">
                  Your nationality
                </label>
                <select
                  id="hero-passport"
                  name="passport"
                  required
                  defaultValue=""
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm"
                >
                  <option value="" disabled>Select a nationality…</option>
                  {COUNTRY_LIST.map((c) => (
                    <option key={c.iso2} value={c.iso2}>
                      {c.flag} {NATIONALITY[c.iso2] ?? c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="hero-goal" className="block text-sm font-semibold mb-2">
                  What do you want to do?
                </label>
                <select
                  id="hero-goal"
                  name="goal"
                  required
                  defaultValue=""
                  className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2.5 text-sm"
                >
                  <option value="" disabled>Pick a goal…</option>
                  <option value="visit">Visit short-term (tourism)</option>
                  <option value="remote_work">Work remotely (digital nomad)</option>
                  <option value="work_temporary">Work and travel for a year (Working Holiday)</option>
                  <option value="live_work">Move there to live and work</option>
                  <option value="study">Study at a foreign university</option>
                  <option value="retire">Retire abroad</option>
                  <option value="invest">Invest for residency / citizenship</option>
                </select>
              </div>
              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="plausible-event-name=HeroFinderSubmitted px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                >
                  Show me where I can go →
                </button>
                <span className="text-xs text-neutral-500">
                  Or already know the destination?{" "}
                  <Link href="#direct" className="underline hover:no-underline">
                    Direct lookup ↓
                  </Link>
                </span>
              </div>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <Landmark size={14} aria-hidden="true" className="text-emerald-600 dark:text-emerald-400" />
              Every link goes to the government, not a middleman
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserX size={14} aria-hidden="true" className="text-emerald-600 dark:text-emerald-400" />
              No account needed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Ban size={14} aria-hidden="true" className="text-emerald-600 dark:text-emerald-400" />
              We never sell visa services
            </span>
          </div>

          {stats && stats.totalRecords > 0 && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-center">
              <Stat n={stats.totalRecords} label="verified visa records" />
              <Stat n={stats.distinctPassports} label="passports covered" />
              <Stat n={stats.distinctDestinations} label="destinations covered" />
              <Stat n={stats.distinctSources} label="primary sources" />
            </div>
          )}
        </div>
      </section>

      {/* Transparency positioning — the angle that separates us from the
          dozen content farms and visa-service middlemen above us in search. */}
      <section className="mx-auto max-w-4xl px-4 py-14">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-700 dark:text-emerald-300 mb-3">
          Why we exist
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Transparency over profit.
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
          Every other &ldquo;visa&rdquo; result you&apos;ll find on Google charges a service
          fee — typically £30–£100 — to fill in the same form you can fill in yourself, for
          free, on the government&apos;s own website. We don&apos;t do that. Every Apply
          button on this site points straight at the destination&apos;s official government
          portal. No markup, no service fee, no middleman.
        </p>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mt-3">
          We make money from other things — and we&apos;re transparent about those too. See{" "}
          <Link href="/disclosure" className="underline hover:no-underline text-blue-700 dark:text-blue-400">
            how we keep the lights on
          </Link>.
        </p>
      </section>

      {/* Direct lookup — secondary path for users who already know the destination. */}
      <section id="direct" className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="text-lg font-semibold mb-1">Already know where you&apos;re going?</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          Pick your passport and the destination directly.
        </p>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
          <Suspense fallback={null}>
            <LookupForm />
          </Suspense>
        </div>
      </section>

      {/* Visa types we cover */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-xl font-semibold mb-1">Every visa type you need</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          One place for short-stay, long-stay and official visas — with primary-source links.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <VisaTypeCard title="Tourist" body="Visa-free, eTA, visa on arrival, e-Visa or embassy visa for short visits." />
          <VisaTypeCard title="Business" body="Meetings, conferences, negotiations and short-term business travel." />
          <VisaTypeCard title="Work" body="Skilled worker, intra-company transfer, investor and entrepreneur routes." />
          <VisaTypeCard title="Study" body="Student visas, language courses and degree programs across the globe." />
          <VisaTypeCard title="Partner / family" body="Spouse, partner, dependent and family reunification routes." />
          <VisaTypeCard title="Transit" body="Airside transit, transit visas and TWOV programs." />
          <VisaTypeCard title="Diplomatic" body="Diplomatic and service passport visa rules and exemptions." />
          <VisaTypeCard title="Sourced" body="Every answer carries a direct link to the official government page." />
        </div>
      </section>

      {/* Popular routes */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-xl font-semibold">Popular routes</h2>
          <Link
            href="/passport/us"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Browse by passport
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

      {/* Value props */}
      <section className="mx-auto max-w-5xl px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold mb-2">Every answer is linked</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            We show the primary government URL on every result. If our answer disagrees with the
            source, the source wins. We&apos;re an aggregator, not an oracle.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold mb-2">Last verified, not last fetched</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Most sites tell you they updated 2 days ago when they mean &ldquo;crawled.&rdquo; We
            distinguish between fetching and verifying — and decay confidence on stale records.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold mb-2">No application services</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            We will never sell you a visa, a service fee, or a &ldquo;rush.&rdquo; Apply directly
            with the government. Our incentive is being right, not collecting commissions.
          </p>
        </div>
      </section>

      {/* Browse by passport — every nationality, scrollable + searchable */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-xl font-semibold mb-1">Browse by nationality</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
          Every passport in the world. Pick yours to see where you can go and what&apos;s required.
        </p>
        <AllCountriesGrid mode="passport" />
      </section>

      {/* Browse by destination — every country, scrollable + searchable */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-xl font-semibold mb-1">Browse by destination</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
          Every country. Pick a destination to see who can travel and on what terms.
        </p>
        <AllCountriesGrid mode="destination" />
      </section>
    </>
  );
}

function VisaTypeCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <p className="font-semibold text-sm mb-1">{title}</p>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">{body}</p>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/60 dark:bg-neutral-900/40 backdrop-blur border border-neutral-200/60 dark:border-neutral-800">
      <p className="text-2xl sm:text-3xl font-bold tabular-nums text-blue-700 dark:text-blue-300">
        {new Intl.NumberFormat("en").format(n)}
      </p>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">{label}</p>
    </div>
  );
}

export const metadata = {
  alternates: { canonical: absoluteUrl("/") },
};
