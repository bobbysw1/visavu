"use client";

/**
 * Recommendation dashboard rendered by QuestionnaireWizard once the
 * server-action returns. Five card sections (Best pathways / Easiest /
 * Fastest / Cheapest / PR) with one country card per row, each linking
 * to the full route page so the user can drill in.
 *
 * Premium look: card grid, flag, badge chip, single-line headline metric.
 * No paragraphs — everything is scannable.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { Compass, Sparkles, Timer, PiggyBank, Home, ArrowRight, CheckCircle2, Scale, Info, ExternalLink, Plane } from "lucide-react";
import type { Recommendations, RecommendationItem, AdviceTier } from "@/lib/findMyVisa";
import { Flag } from "./Flag";
import { PROFILE_META } from "@/lib/profiles";
import { GOAL_LABEL } from "@/lib/questionnaire";
import { routeHref } from "@/lib/routeHref";
import { formatFeeLocalised } from "@/lib/exchange";

/** Read the user's preferred currency from the vl_currency cookie set by
 *  CurrencySwitcher. Returns null on the server (pre-hydration) so SSR +
 *  first-paint render the native currency only — preventing hydration
 *  mismatch. The bracketed local conversion populates after mount. */
function useUserCurrency(): string | null {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const m = document.cookie.match(/(?:^|;\s*)vl_currency=([A-Z]{3})/);
    setCode(m ? m[1] : null);
  }, []);
  return code;
}

export function RecommendationResults({
  results,
  passportIso2,
  onRestart,
}: {
  results: Recommendations;
  passportIso2: string;
  onRestart: () => void;
}) {
  const { profile, bestPathways, easiestRoutes, workingHolidayRoutes, fastestRoutes, cheapestRoutes, prOpportunities } = results;
  const profileMeta = PROFILE_META[profile];
  const userCurrency = useUserCurrency();

  if (results.emptyReason) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">No recommendations yet</h2>
        <p className="text-neutral-700 dark:text-neutral-300 mb-6">{results.emptyReason}</p>
        <button onClick={onRestart} className="text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
          Start over
        </button>
      </main>
    );
  }

  const lower = passportIso2.toLowerCase();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-start gap-4 justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300 font-semibold mb-2">
            Saved · tailoring every result on the site
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Visa matches tuned for you
          </h1>
          <p className="text-neutral-700 dark:text-neutral-300 max-w-2xl">
            Sorted for <strong>{profileMeta.emoji} {profileMeta.label}</strong> seeking{" "}
            <strong>{GOAL_LABEL[goalToQuestionnaireGoal(results.goal)].label.toLowerCase()}</strong>{" "}
            — pulled from every visa rule in our database, ranked by fit. We remember your
            profile locally so the filter pre-applies on every direct route lookup too;
            <em> clear or update any time</em>.
          </p>
        </div>
        <button
          onClick={onRestart}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          Clear &amp; start over
        </button>
      </header>

      {/* Overall DIY-vs-lawyer verdict — replaces the simpler legal-advice
          callout. Tier-coloured band with a concrete next step. */}
      {results.advice && <AdviceBand advice={results.advice} />}

      <Section
        id="best-overall"
        title="Best overall pathways"
        subtitle="Top fits for your profile + goal, weighted by route quality and processing window."
        icon={Sparkles}
        accent="emerald"
        items={bestPathways}
        passportLower={lower}
        metric={(r) => formatMetric("score", r, userCurrency)}
      />

      <Section
        title="Easiest countries"
        subtitle="Lowest paperwork barrier — visa-free, eTA, visa-on-arrival, and online e-Visa routes."
        icon={Compass}
        accent="sky"
        items={easiestRoutes}
        passportLower={lower}
        metric={(r) => formatMetric("status", r, userCurrency)}
      />

      <Section
        title="Working Holiday & Youth Mobility"
        subtitle="Age-gated treaty programmes (typically 18–30 or 18–35). 1–3 years of open work authorisation, change jobs freely — the classic 'try a country before committing' route."
        icon={Plane}
        accent="amber"
        items={workingHolidayRoutes}
        passportLower={lower}
        metric={(r) => formatMetric("stay", r, userCurrency)}
      />

      <Section
        title="Fastest approvals"
        subtitle="Routes with the shortest known processing time."
        icon={Timer}
        accent="blue"
        items={fastestRoutes}
        passportLower={lower}
        metric={(r) => formatMetric("processing", r, userCurrency)}
      />

      <Section
        title="Cheapest routes"
        subtitle="Smallest mandatory fees. Excludes optional add-ons; doesn't reflect cost-of-living."
        icon={PiggyBank}
        accent="violet"
        items={cheapestRoutes}
        passportLower={lower}
        metric={(r) => formatMetric("fee", r, userCurrency)}
      />

      <Section
        title="PR / citizenship opportunities"
        subtitle="Destinations whose permanent-residency pathway is shortest. Citizenship typically follows PR by 1–10 yrs."
        icon={Home}
        accent="rose"
        items={prOpportunities}
        passportLower={lower}
        metric={(r) => formatMetric("pr", r, userCurrency)}
      />

      <p className="mt-10 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
        These recommendations are computed from our visa-rules database + country metrics and
        rank routes by fit. They are not personalised legal advice. Always verify with the
        destination&apos;s embassy or a licensed immigration adviser before applying. Read our{" "}
        <Link href="/disclaimer" className="underline">disclaimer</Link>.
      </p>
    </main>
  );
}

function Section({
  id,
  title,
  subtitle,
  icon: Icon,
  accent,
  items,
  passportLower,
  metric,
}: {
  id?: string;
  title: string;
  subtitle: string;
  icon: typeof Compass;
  accent: "emerald" | "sky" | "blue" | "violet" | "rose" | "amber";
  items: RecommendationItem[];
  passportLower: string;
  metric: (r: RecommendationItem) => string;
}) {
  if (items.length === 0) {
    return (
      <section id={id} className="mb-8 scroll-mt-20">
        <Header title={title} subtitle={subtitle} icon={Icon} accent={accent} />
        <p className="mt-3 text-sm text-neutral-500 italic">No matching routes — try adjusting your timeline or goal.</p>
      </section>
    );
  }
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <Header title={title} subtitle={subtitle} icon={Icon} accent={accent} />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((r) => (
          <CountryCard key={r.destinationIso2 + ":" + r.optionId} item={r} passportLower={passportLower} metric={metric(r)} accent={accent} />
        ))}
      </div>
    </section>
  );
}

const ACCENT: Record<string, { chip: string; ring: string; icon: string }> = {
  emerald: { chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200", ring: "ring-emerald-300 dark:ring-emerald-700", icon: "text-emerald-700 dark:text-emerald-300" },
  sky: { chip: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200", ring: "ring-sky-300 dark:ring-sky-700", icon: "text-sky-700 dark:text-sky-300" },
  blue: { chip: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200", ring: "ring-blue-300 dark:ring-blue-700", icon: "text-blue-700 dark:text-blue-300" },
  violet: { chip: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200", ring: "ring-violet-300 dark:ring-violet-700", icon: "text-violet-700 dark:text-violet-300" },
  rose: { chip: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200", ring: "ring-rose-300 dark:ring-rose-700", icon: "text-rose-700 dark:text-rose-300" },
  amber: { chip: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200", ring: "ring-amber-300 dark:ring-amber-700", icon: "text-amber-700 dark:text-amber-300" },
};

function Header({
  title,
  subtitle,
  icon: Icon,
  accent,
}: {
  title: string;
  subtitle: string;
  icon: typeof Compass;
  accent: keyof typeof ACCENT;
}) {
  const tone = ACCENT[accent];
  return (
    <header>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={tone.icon} aria-hidden />
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-snug">{subtitle}</p>
    </header>
  );
}

/**
 * Card layout: two distinct CTAs per route.
 *
 *   1. "View details" → internal Visavu route page (prep checklist,
 *      lawyer-vs-DIY triage, personal-statement skeleton, etc.)
 *   2. "Official portal" → external link straight to the destination
 *      government's application page (or primary-source info page as a
 *      fallback). Opens in a new tab.
 *
 * Previously the entire card was a single <Link> to the route details
 * page and the per-route applicationUrl was only used by the top
 * AdviceBand — meaning users saw one "Apply on the official portal"
 * CTA at the top of the page, which read as if it applied to every
 * result. Splitting the CTAs per card fixes that perception AND surfaces
 * the gov-portal link for every recommended route (not just #1).
 */
function CountryCard({
  item,
  passportLower,
  metric,
  accent,
}: {
  item: RecommendationItem;
  passportLower: string;
  metric: string;
  accent: keyof typeof ACCENT;
}) {
  const tone = ACCENT[accent];
  const detailsHref = routeHref(passportLower, item.destinationIso2, item.purpose);
  // Prefer the dedicated application URL; fall back to the primary
  // government source page if the adapter didn't surface a separate
  // application link. Either is gov-domain and trustworthy.
  const officialHref = item.applicationUrl ?? item.primarySourceUrl;
  const officialLabel = item.applicationUrl ? "Official portal" : "Official source";

  return (
    <article className="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-blue-400 dark:hover:border-blue-600 transition p-4">
      {/* Header — flag + country + visa label. Clickable as the
          primary "view details" affordance for users who expect the
          whole card to be clickable. */}
      <Link
        href={detailsHref}
        prefetch={false}
        className="flex items-start gap-3 mb-2.5 group"
      >
        <span className="rounded-sm overflow-hidden ring-1 ring-black/10 shrink-0">
          <Flag iso2={item.destinationIso2} size={26} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate group-hover:text-blue-700 dark:group-hover:text-blue-300">
            {item.destinationName}
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{item.label}</p>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${tone.chip}`}>
          {item.badge}
        </span>
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">{metric}</span>
      </div>

      {/* Profile fit note — short, positive — explains why this route
          matches based on the user's answers. */}
      {item.fitNote && (
        <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-300 leading-snug flex items-start gap-1">
          <CheckCircle2 size={11} aria-hidden className="shrink-0 mt-0.5" />
          {item.fitNote}
        </p>
      )}

      {/* Caveats — amber, surfaced from the user's answers (criminal
          record, education gap, capital gap). Honest signals; not blockers. */}
      {item.caveats && item.caveats.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {item.caveats.map((c, i) => (
            <li
              key={i}
              className="text-[11px] text-amber-700 dark:text-amber-300 leading-snug flex items-start gap-1"
            >
              <Info size={11} aria-hidden className="shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      )}

      {/* Footer — two distinct CTAs. "View details" is the canonical
          internal action; "Official portal" is the gov-direct external
          link surfaced from this route's own applicationUrl (not the
          generic top-of-page one). The mt-auto on the wrapper keeps
          the footer pinned to the bottom even when fitNote/caveats
          make some cards taller than others — keeps the grid aligned. */}
      <div className="mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between gap-2">
        <Link
          href={detailsHref}
          prefetch={false}
          className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          View details <ArrowRight size={11} />
        </Link>
        {officialHref ? (
          <a
            href={officialHref}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline inline-flex items-center gap-1"
            title={officialHref}
          >
            {officialLabel} <ExternalLink size={10} />
          </a>
        ) : (
          <span className="text-[11px] text-neutral-400 italic">No direct portal yet</span>
        )}
      </div>
    </article>
  );
}

const ADVICE_TONE: Record<AdviceTier, {
  wrap: string;
  bar: string;
  head: string;
  body: string;
  icon: typeof CheckCircle2;
  iconColor: string;
  ctaClass: string;
}> = {
  ideal: {
    wrap: "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30",
    bar: "bg-emerald-500",
    head: "text-emerald-900 dark:text-emerald-200",
    body: "text-emerald-900/80 dark:text-emerald-200/80",
    icon: CheckCircle2,
    iconColor: "text-emerald-700 dark:text-emerald-300",
    ctaClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  viable: {
    wrap: "border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30",
    bar: "bg-blue-500",
    head: "text-blue-900 dark:text-blue-200",
    body: "text-blue-900/80 dark:text-blue-200/80",
    icon: Info,
    iconColor: "text-blue-700 dark:text-blue-300",
    ctaClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  complicated: {
    wrap: "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40",
    bar: "bg-amber-500",
    head: "text-amber-900 dark:text-amber-200",
    body: "text-amber-900/80 dark:text-amber-200/80",
    icon: Scale,
    iconColor: "text-amber-700 dark:text-amber-300",
    ctaClass: "bg-amber-600 hover:bg-amber-700 text-white",
  },
};

function AdviceBand({ advice }: { advice: NonNullable<Recommendations["advice"]> }) {
  const tone = ADVICE_TONE[advice.tier];
  const Icon = tone.icon;
  const external = advice.ctaHref.startsWith("http");
  return (
    <aside className={`mb-6 rounded-2xl border ${tone.wrap} overflow-hidden`}>
      <div className="flex items-stretch">
        <div className={`w-1.5 ${tone.bar}`} aria-hidden />
        <div className="flex-1 p-4 sm:p-5 min-w-0">
          <div className="flex items-start gap-3">
            <Icon size={20} aria-hidden className={`shrink-0 mt-0.5 ${tone.iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm sm:text-base mb-1 ${tone.head}`}>{advice.headline}</p>
              <p className={`text-xs sm:text-sm leading-relaxed ${tone.body}`}>{advice.body}</p>

              {advice.reasons.length > 0 && (
                <details className="mt-2 group">
                  <summary className={`cursor-pointer text-[11px] font-medium underline underline-offset-2 ${tone.body}`}>
                    Why we say this
                  </summary>
                  <ul className={`mt-1.5 space-y-0.5 text-[11px] ${tone.body} pl-4`}>
                    {advice.reasons.map((r, i) => (
                      <li key={i} className="list-disc">{r}</li>
                    ))}
                  </ul>
                </details>
              )}

              <div className="mt-3">
                {external ? (
                  <a
                    href={advice.ctaHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md ${tone.ctaClass}`}
                  >
                    {advice.ctaLabel}
                  </a>
                ) : (
                  <Link
                    href={advice.ctaHref}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md ${tone.ctaClass}`}
                  >
                    {advice.ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function formatMetric(
  kind: "score" | "status" | "processing" | "fee" | "pr" | "stay",
  r: RecommendationItem,
  userCurrency: string | null,
): string {
  switch (kind) {
    case "score":
      return `Fit ${Math.round(r.score)}/100`;
    case "status":
      return r.badge;
    case "processing":
      if (r.processingTimeDaysMax == null) return "—";
      if (r.processingTimeDaysMax === 0) return "Instant";
      return `≤ ${r.processingTimeDaysMax}d`;
    case "stay": {
      // For WHV cards the most-useful single metric is the max stay
      // duration — UK→AU gets 3 years, most others 1 year. Surface
      // the longest stay length first.
      const days = r.maxStayDays;
      if (days == null) return "—";
      if (days >= 365) {
        const years = Math.round((days / 365) * 10) / 10;
        return `${years}y stay`;
      }
      if (days >= 30 && days % 30 === 0) return `${days / 30}mo stay`;
      return `${days}d stay`;
    }
    case "fee": {
      if (r.feeAmountMinor == null) return "Fee-free";
      const sourceCurrency = r.feeCurrency ?? "USD";
      const localised = formatFeeLocalised(r.feeAmountMinor, sourceCurrency, userCurrency);
      // Strip the leading "≈ " (formatFeeLocalised prefixes the converted
      // value with an approximation sign — fine on result-page tables, too
      // chatty in a compact tile metric).
      const localTight = localised.local ? localised.local.replace(/^≈\s*/, "") : null;
      if (localTight && localTight !== localised.native) {
        return `${localised.native} (${localTight})`;
      }
      return localised.native;
    }
    case "pr":
      return r.prYears != null ? `${r.prYears} yr${r.prYears === 1 ? "" : "s"} to PR` : "—";
  }
}

type FinderGoalNarrow =
  | "visit"
  | "work_temporary"
  | "live_work"
  | "study"
  | "retire"
  | "invest"
  | "remote_work";

// `inferGoal` returns FinderGoal; map back to QuestionnaireGoal for label
// rendering. Lossy for permanent_move vs live_a_few_years (both → live_work)
// but adequate for the header sentence.
function goalToQuestionnaireGoal(g: FinderGoalNarrow): keyof typeof GOAL_LABEL {
  switch (g) {
    case "visit":
      return "visit";
    case "remote_work":
      return "digital_nomad";
    case "study":
      return "study";
    case "retire":
      return "retire";
    case "invest":
      return "invest";
    case "live_work":
    case "work_temporary":
    default:
      return "live_a_few_years";
  }
}
