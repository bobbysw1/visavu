/**
 * CountryMetricsDashboard — investment-dashboard-style 9-tile summary of
 * what living in a destination is actually like. Designed for the
 * "5-second comprehension" requirement: tiles, icons, headline value,
 * colour-coded rating chip, source on hover.
 *
 * Three tiles are route-aware (difficulty / processing time / PR pathway
 * context). The other six are destination-only stats from the curated
 * `countryMetrics` table.
 *
 * Renders client-side ONLY for the popover use-case on the world map.
 * On result + destination pages it ships as a server-rendered grid (no
 * "use client") so the HTML payload is light.
 */
import {
  Banknote,
  ShoppingCart,
  Receipt,
  HeartPulse,
  ShieldCheck,
  Languages,
  Home,
  TimerReset,
  Gauge,
} from "lucide-react";
import {
  metricsFor,
  ratingForSalary,
  ratingForCostOfLiving,
  ratingForTax,
  ratingForHealthcare,
  ratingForSafety,
  ratingForEnglish,
  ratingForPrYears,
  ratingForDifficulty,
  ratingForProcessingDays,
  ENGLISH_BAND_LABEL,
  SOURCES,
  type MetricRating,
  type CountryMetrics,
} from "@/lib/countryMetrics";
import type { DifficultyAssessment } from "@/lib/difficulty";
import { nameFor } from "@/lib/countries";

const RATING_TONE: Record<MetricRating, { dot: string; chip: string; label: string }> = {
  very_good: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
    label: "Strong",
  },
  good: {
    dot: "bg-emerald-400",
    chip: "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200",
    label: "Good",
  },
  average: {
    dot: "bg-orange-400",
    chip: "bg-orange-50 text-orange-900 dark:bg-orange-950/60 dark:text-orange-200",
    label: "Mid",
  },
  poor: {
    dot: "bg-orange-500",
    chip: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200",
    label: "Weak",
  },
  very_poor: {
    dot: "bg-red-500",
    chip: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
    label: "Tough",
  },
};

const UNKNOWN_TONE = {
  dot: "bg-neutral-300 dark:bg-neutral-700",
  chip: "bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-500",
  label: "No data",
};

function formatSalary(usd: number | null): string {
  if (usd == null) return "—";
  if (usd >= 1000) return `$${Math.round(usd / 1000)}k`;
  return `$${usd}`;
}

function formatPr(years: number | null): string {
  if (years == null) return "Limited";
  return `${years} yr${years === 1 ? "" : "s"}`;
}

function formatProcessing(min: number | null, max: number | null): string {
  if (max == null) return "—";
  if (max === 0) return "Instant";
  if (min != null && min !== max) return `${min}–${max}d`;
  return `~${max}d`;
}

export type DashboardProps = {
  destinationIso2: string;
  difficulty?: DifficultyAssessment | null;
  processingDaysMin?: number | null;
  processingDaysMax?: number | null;
  /** Render mode: "full" = 3x3 grid, "compact" = 2-col for map popover. */
  layout?: "full" | "compact";
};

export function CountryMetricsDashboard({
  destinationIso2,
  difficulty = null,
  processingDaysMin = null,
  processingDaysMax = null,
  layout = "full",
}: DashboardProps) {
  const m = metricsFor(destinationIso2);

  const tiles = buildTiles(m, difficulty, processingDaysMin, processingDaysMax);

  const gridClass =
    layout === "compact"
      ? "grid grid-cols-2 gap-2"
      : "grid grid-cols-2 sm:grid-cols-3 gap-2.5";

  return (
    <section
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 sm:p-5"
      aria-label={`Living-in-${nameFor(destinationIso2)} dashboard`}
    >
      {layout === "full" && (
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="font-semibold text-sm sm:text-base">
            What it&apos;s like in {nameFor(destinationIso2)}
          </h3>
          <span className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {m?.asOf ? `as of ${m.asOf}` : "approximate"}
          </span>
        </header>
      )}

      <div className={gridClass}>
        {tiles.map((t) => {
          const { key, ...rest } = t;
          return <Tile key={key} {...rest} compact={layout === "compact"} />;
        })}
      </div>

      {layout === "full" && !m && (
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 italic">
          Some indicators for {nameFor(destinationIso2)} haven&apos;t been curated yet — we&apos;ll
          fill them in as we expand coverage.
        </p>
      )}
    </section>
  );
}

type TileSpec = {
  key: string;
  icon: typeof Banknote;
  label: string;
  value: string;
  sub?: string | null;
  rating: MetricRating | null;
  source?: { label: string; url: string | null };
};

type TileProps = Omit<TileSpec, "key">;

function Tile({
  icon: Icon,
  label,
  value,
  sub,
  rating,
  source,
  compact,
}: TileProps & { compact: boolean }) {
  const tone = rating ? RATING_TONE[rating] : UNKNOWN_TONE;
  const title = source ? `${label} — ${value}${sub ? ` (${sub})` : ""} · Source: ${source.label}` : `${label} — ${value}`;
  return (
    <div
      title={title}
      className={`rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 ${
        compact ? "p-2" : "p-3"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} className="text-neutral-500 dark:text-neutral-400" aria-hidden />
        <p className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400 truncate">
          {label}
        </p>
      </div>
      <p className={`font-bold text-neutral-900 dark:text-neutral-50 leading-tight ${compact ? "text-base" : "text-lg"}`}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">{sub}</p>
      )}
      <span className={`mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${tone.chip}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} aria-hidden />
        {tone.label}
      </span>
    </div>
  );
}

function buildTiles(
  m: CountryMetrics | null,
  difficulty: DifficultyAssessment | null,
  procMin: number | null,
  procMax: number | null,
): TileSpec[] {
  // Route-aware tiles first — what a relocation user wants to know about
  // the application step, in front of the destination's living conditions.
  const tiles: TileSpec[] = [
    {
      key: "difficulty",
      icon: Gauge,
      label: "Difficulty",
      value: difficulty ? `${difficulty.score}/10` : "—",
      sub: difficulty
        ? difficulty.bucket === "easy"
          ? "Quick paperwork"
          : difficulty.bucket === "medium"
          ? "Some paperwork"
          : "Heavy paperwork"
        : null,
      rating: difficulty ? ratingForDifficulty(difficulty.bucket) : null,
    },
    {
      key: "processing",
      icon: TimerReset,
      label: "Processing",
      value: formatProcessing(procMin, procMax),
      sub: procMax ? "from application to decision" : null,
      rating: ratingForProcessingDays(procMax),
    },
    {
      key: "pr",
      icon: Home,
      label: "PR pathway",
      value: formatPr(m?.permanentResidencyYears ?? null),
      sub: m?.permanentResidencyNote ?? null,
      rating: ratingForPrYears(m?.permanentResidencyYears ?? null),
      source: SOURCES.pr,
    },
    {
      key: "salary",
      icon: Banknote,
      label: "Avg salary",
      value: m ? formatSalary(m.avgSalaryUsd) : "—",
      sub: "OECD-style average wages, USD",
      rating: ratingForSalary(m?.avgSalaryUsd ?? null),
      source: SOURCES.salary,
    },
    {
      key: "col",
      icon: ShoppingCart,
      label: "Cost of living",
      value: m?.costOfLivingIndex != null ? `${Math.round(m.costOfLivingIndex)}` : "—",
      sub: m?.costOfLivingIndex != null ? "Numbeo COL (NYC = 100)" : null,
      rating: ratingForCostOfLiving(m?.costOfLivingIndex ?? null),
      source: SOURCES.cost,
    },
    {
      key: "tax",
      icon: Receipt,
      label: "Top tax rate",
      value: m?.topTaxRatePct != null ? `${m.topTaxRatePct}%` : "—",
      sub: m?.topTaxRatePct != null ? "Personal income top marginal" : null,
      rating: ratingForTax(m?.topTaxRatePct ?? null),
      source: SOURCES.tax,
    },
    {
      key: "healthcare",
      icon: HeartPulse,
      label: "Healthcare",
      value: m?.healthcareIndex != null ? `${Math.round(m.healthcareIndex)}/100` : "—",
      sub: m?.healthcareIndex != null ? "Numbeo Healthcare Index" : null,
      rating: ratingForHealthcare(m?.healthcareIndex ?? null),
      source: SOURCES.healthcare,
    },
    {
      key: "safety",
      icon: ShieldCheck,
      label: "Safety",
      value: m?.safetyGpiRank != null ? `#${m.safetyGpiRank}` : "—",
      sub: m?.safetyGpiRank != null ? "Global Peace Index rank (lower = safer)" : null,
      rating: ratingForSafety(m?.safetyGpiRank ?? null),
      source: SOURCES.safety,
    },
    {
      key: "english",
      icon: Languages,
      label: "English proficiency",
      value: m?.englishBand ? ENGLISH_BAND_LABEL[m.englishBand] : "—",
      sub: m?.englishBand ? "EF EPI band" : null,
      rating: ratingForEnglish(m?.englishBand ?? null),
      source: SOURCES.english,
    },
  ];
  return tiles;
}
