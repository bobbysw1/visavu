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
import { Compass, Sparkles, Timer, PiggyBank, Home, ArrowRight, AlertTriangle } from "lucide-react";
import type { Recommendations, RecommendationItem } from "@/lib/findMyVisa";
import { Flag } from "./Flag";
import { PROFILE_META } from "@/lib/profiles";
import { GOAL_LABEL } from "@/lib/questionnaire";

export function RecommendationResults({
  results,
  passportIso2,
  onRestart,
}: {
  results: Recommendations;
  passportIso2: string;
  onRestart: () => void;
}) {
  const { profile, bestPathways, easiestRoutes, fastestRoutes, cheapestRoutes, prOpportunities } = results;
  const profileMeta = PROFILE_META[profile];

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

      {results.showLegalAdviceCallout && (
        <aside className="mb-6 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="font-semibold text-sm mb-1">Talk to a licensed immigration lawyer.</p>
            <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
              Most visa applications ask about serious criminal convictions and require disclosure.
              A wrong answer is grounds for permanent ban — get advice before applying. See our{" "}
              <Link href="/services/legal-services" className="underline">directory of immigration lawyers</Link>.
            </p>
          </div>
        </aside>
      )}

      <Section
        title="Best overall pathways"
        subtitle="Top fits for your profile + goal, weighted by route quality and processing window."
        icon={Sparkles}
        accent="emerald"
        items={bestPathways}
        passportLower={lower}
        metric={(r) => formatMetric("score", r)}
      />

      <Section
        title="Easiest countries"
        subtitle="Lowest paperwork barrier — visa-free, eTA, visa-on-arrival, and online e-Visa routes."
        icon={Compass}
        accent="sky"
        items={easiestRoutes}
        passportLower={lower}
        metric={(r) => formatMetric("status", r)}
      />

      <Section
        title="Fastest approvals"
        subtitle="Routes with the shortest known processing time."
        icon={Timer}
        accent="blue"
        items={fastestRoutes}
        passportLower={lower}
        metric={(r) => formatMetric("processing", r)}
      />

      <Section
        title="Cheapest routes"
        subtitle="Smallest mandatory fees. Excludes optional add-ons; doesn't reflect cost-of-living."
        icon={PiggyBank}
        accent="violet"
        items={cheapestRoutes}
        passportLower={lower}
        metric={(r) => formatMetric("fee", r)}
      />

      <Section
        title="PR / citizenship opportunities"
        subtitle="Destinations whose permanent-residency pathway is shortest. Citizenship typically follows PR by 1–10 yrs."
        icon={Home}
        accent="rose"
        items={prOpportunities}
        passportLower={lower}
        metric={(r) => formatMetric("pr", r)}
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
  title,
  subtitle,
  icon: Icon,
  accent,
  items,
  passportLower,
  metric,
}: {
  title: string;
  subtitle: string;
  icon: typeof Compass;
  accent: "emerald" | "sky" | "blue" | "violet" | "rose";
  items: RecommendationItem[];
  passportLower: string;
  metric: (r: RecommendationItem) => string;
}) {
  if (items.length === 0) {
    return (
      <section className="mb-8">
        <Header title={title} subtitle={subtitle} icon={Icon} accent={accent} />
        <p className="mt-3 text-sm text-neutral-500 italic">No matching routes — try adjusting your timeline or goal.</p>
      </section>
    );
  }
  return (
    <section className="mb-10">
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
  return (
    <Link
      href={`/${passportLower}/${item.destinationIso2.toLowerCase()}${
        item.purpose ? `?purpose=${item.purpose}` : ""
      }`}
      prefetch={false}
      className="block rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-blue-400 dark:hover:border-blue-600 transition p-4"
    >
      <div className="flex items-start gap-3 mb-2.5">
        <span className="rounded-sm overflow-hidden ring-1 ring-black/10 shrink-0">
          <Flag iso2={item.destinationIso2} size={26} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{item.destinationName}</p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{item.label}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${tone.chip}`}>
          {item.badge}
        </span>
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">{metric}</span>
      </div>
      <p className="mt-2.5 text-xs text-blue-700 dark:text-blue-400 font-medium inline-flex items-center gap-1">
        Open route <ArrowRight size={11} />
      </p>
    </Link>
  );
}

function formatMetric(kind: "score" | "status" | "processing" | "fee" | "pr", r: RecommendationItem): string {
  switch (kind) {
    case "score":
      return `Fit ${Math.round(r.score)}/100`;
    case "status":
      return r.badge;
    case "processing":
      if (r.processingTimeDaysMax == null) return "—";
      if (r.processingTimeDaysMax === 0) return "Instant";
      return `≤ ${r.processingTimeDaysMax}d`;
    case "fee":
      if (r.feeAmountMinor == null) return "Fee-free";
      try {
        return new Intl.NumberFormat("en", {
          style: "currency",
          currency: r.feeCurrency ?? "USD",
          maximumFractionDigits: 0,
        }).format(r.feeAmountMinor / 100);
      } catch {
        return `~${Math.round(r.feeAmountMinor / 100)} ${r.feeCurrency ?? ""}`;
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
