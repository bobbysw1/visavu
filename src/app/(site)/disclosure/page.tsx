import Link from "next/link";
import { Banknote, Briefcase, Sparkles, ShieldX, ShieldCheck } from "lucide-react";
import { absoluteUrl } from "@/lib/site";

export const metadata = {
  title: "Commercial disclosure",
  description: "How we make money, and what we will never sell.",
  alternates: { canonical: absoluteUrl("/disclosure") },
};

type RevenueSource = {
  n: number;
  icon: typeof Banknote;
  title: string;
  summary: string;
  detail: React.ReactNode;
};

const REVENUE_SOURCES: RevenueSource[] = [
  {
    n: 1,
    icon: Banknote,
    title: "Travel-adjacent affiliate commissions (paused)",
    summary: "Currently no commercial provider listings. Returns once partner agreements are in place.",
    detail: (
      <>
        <p>
          We used to list a small set of travel-adjacent partners (insurance, eSIM, flights)
          below the visa answer. As of May 2026 we&apos;ve removed every commercial provider
          listing — we don&apos;t link to private companies for free, and we don&apos;t put a
          provider in front of users until a disclosed referral relationship is in place.
        </p>
        <p className="mt-3">
          The categories most likely to return once partner registrations complete:
        </p>
        <ul className="mt-2 space-y-1 list-disc pl-5">
          <li>Travel insurance (short-trip + nomad cover, Schengen-compliant policies)</li>
          <li>International health insurance (long-stay visa-mandated cover)</li>
          <li>Passport photo services (destination-specific spec guarantees)</li>
          <li>Pre-paid eSIM data for arrival</li>
          <li>Flexible flight comparison</li>
        </ul>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          When listings return they&apos;ll be clearly labelled <em>Sponsored</em>. Government,
          embassy, and authoritative links (CDC, NHS, VFS appointment centres, panel-physician
          lists) carry on as before — those are genuine user benefit, not commercial.
        </p>
      </>
    ),
  },
  {
    n: 2,
    icon: Briefcase,
    title: "API subscriptions",
    summary: "Paid product for immigration lawyers, relocation firms, HR teams.",
    detail: (
      <p>
        Our visa data API is a paid product for businesses. $499/month starter, $1,999/month
        agency. <Link href="/api" className="underline hover:no-underline">See API docs →</Link>
      </p>
    ),
  },
  {
    n: 3,
    icon: Sparkles,
    title: "Premium individual tier (planned)",
    summary: "£4/month for power-user extras. The core visa lookup stays free, forever.",
    detail: (
      <p>
        Additional features under consideration: PDF checklist export, priority email support,
        weekly policy briefings. Always optional. The free tier will always include the visa
        lookup, the application checklist, and the change-alert email opt-in.
      </p>
    ),
  },
];

const NEVER: string[] = [
  "Earn affiliate revenue from visa application services.",
  "Paywall the visa data.",
  "Sell or share user data.",
  "Show advertising inside result content.",
  "Let a partner influence the difficulty, realism, or confidence scores.",
];

export default function DisclosurePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      {/* Editorial hero — the core promise stated up front, no preamble. */}
      <header className="mb-10 sm:mb-12">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-700 dark:text-emerald-300 mb-3">
          Commercial disclosure
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] mb-5">
          How we make money — and what we will never do
        </h1>
        <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 leading-snug">
          Every other &ldquo;visa&rdquo; site on Google charges a service fee on top of the
          government&apos;s own fee. £30 here, $80 there, $150 for an &ldquo;expedite&rdquo;. We
          don&apos;t. Every Apply button here points straight at the destination&apos;s official
          government portal. That&apos;s the whole product.
        </p>
      </header>

      {/* Pull-quote: the contract with the reader. Echoes the methodology page
          but with a sharper, more personal voice. */}
      <aside className="mb-12 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 sm:p-6 flex gap-4">
        <ShieldCheck
          size={28}
          aria-hidden="true"
          className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5"
        />
        <div>
          <p className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-100 leading-snug">
            We still need to keep the lights on.
          </p>
          <p className="text-sm sm:text-base text-emerald-900/80 dark:text-emerald-100/80 mt-1 leading-snug">
            Here is exactly how, in order from biggest to smallest. We&apos;d rather you trust the
            data because you can see where the money comes from, not because we hide it.
          </p>
        </div>
      </aside>

      {/* Revenue sources — bordered cards, numbered, with an icon. Scannable
          at a glance, expandable when the reader wants detail. */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400 mb-4">
          How we keep the lights on
        </h2>
        <ol className="space-y-4">
          {REVENUE_SOURCES.map((src) => {
            const Icon = src.icon;
            return (
              <li
                key={src.n}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200/60 dark:ring-emerald-900/60">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400 mb-0.5">
                      Source {src.n}
                    </p>
                    <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-1">
                      {src.title}
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-3">
                      {src.summary}
                    </p>
                    <div className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {src.detail}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* What we will never do — the most important content on the page. Red
          framing makes it visually distinct from the revenue cards above so a
          skim-reader can find it immediately. */}
      <section className="mb-12">
        <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/70 bg-red-50/60 dark:bg-red-950/20 p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <ShieldX
              size={28}
              aria-hidden="true"
              className="shrink-0 text-red-600 dark:text-red-400 mt-0.5"
            />
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-red-700 dark:text-red-300 mb-1">
                Hard lines
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-red-950 dark:text-red-50 leading-tight">
                What we will never do
              </h2>
            </div>
          </div>
          <ul className="space-y-2.5">
            {NEVER.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-base text-red-950 dark:text-red-50 leading-snug"
              >
                <span
                  aria-hidden="true"
                  className="shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        See also:{" "}
        <Link href="/methodology" className="underline hover:no-underline">
          methodology
        </Link>{" "}
        ·{" "}
        <Link href="/about" className="underline hover:no-underline">
          about
        </Link>{" "}
        ·{" "}
        <Link href="/disclaimer" className="underline hover:no-underline">
          legal disclaimer
        </Link>
        .
      </p>
    </main>
  );
}
