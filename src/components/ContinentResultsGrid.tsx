"use client";

/**
 * Tabbed continent view of visa results. Sits alongside the difficulty
 * grid and world map on /passport/[iso] and /destination/[iso]:
 *
 *   - Seven continent tabs (Europe / Asia / North America / South
 *     America / Africa / Oceania / Middle East) plus an "All" tab so a
 *     user can still scan the entire set at once.
 *   - A sort dropdown with five axes: continent (default, alphabetical
 *     within each section), visa type (status), difficulty, cost (fees),
 *     processing speed.
 *   - Cards stay visual + tile-based — flag, country name, sublabel, and
 *     a metric chip whose colour reflects the active sort axis.
 *
 * Data comes from the same ScoredItem[] the difficulty grid already
 * uses; the type was extended with `status / processingTimeDaysMax /
 * feeAmountMinor` so the sort axes have something to sort on.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ScoredItem } from "./DifficultyBucketGrid";
import {
  CONTINENT_ORDER,
  CONTINENT_LABEL,
  continentFor,
  type Continent,
} from "@/lib/continents";
import { BUCKET_PALETTE, BUCKET_LABEL } from "@/lib/difficulty";
import { flagEmoji, nameFor } from "@/lib/countries";
import { routeHref } from "@/lib/routeHref";
import { convertMinor } from "@/lib/exchange";

function readCurrencyCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)vl_currency=([A-Z]{3})/);
  return m ? m[1] : null;
}

type Mode = "passport" | "destination";

type SortAxis = "continent" | "visa_type" | "difficulty" | "cost" | "processing" | "stay";

const SORT_LABEL: Record<SortAxis, string> = {
  continent: "Country name",
  visa_type: "Visa type",
  difficulty: "Difficulty (easy first)",
  cost: "Cost (cheapest first)",
  processing: "Processing (fastest first)",
  stay: "Stay length (longest first)",
};

const STATUS_LABEL: Record<string, string> = {
  visa_free: "Visa-free",
  visa_free_with_eta: "Visa-free + eTA",
  visa_on_arrival: "Visa on arrival",
  e_visa: "e-Visa",
  embassy_visa: "Embassy visa",
  restricted: "Restricted",
  refused: "Refused",
};

const STATUS_ORDER = [
  "visa_free",
  "visa_free_with_eta",
  "visa_on_arrival",
  "e_visa",
  "embassy_visa",
  "restricted",
  "refused",
];

const STATUS_CHIP: Record<string, string> = {
  visa_free: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  visa_free_with_eta: "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200",
  visa_on_arrival: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  e_visa: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200",
  embassy_visa: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200",
  restricted: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
  refused: "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-100",
};

/** Left-edge accent stripe per status — gives each card immediate
 *  visual differentiation at a glance, even before the user reads any
 *  text. Strong passports turn into a green wall (good), restricted
 *  destinations pop as red (also good). */
const STATUS_ACCENT: Record<string, string> = {
  visa_free: "border-l-emerald-400 dark:border-l-emerald-500",
  visa_free_with_eta: "border-l-emerald-300 dark:border-l-emerald-600",
  visa_on_arrival: "border-l-sky-400 dark:border-l-sky-500",
  e_visa: "border-l-violet-400 dark:border-l-violet-500",
  embassy_visa: "border-l-orange-400 dark:border-l-orange-500",
  restricted: "border-l-red-400 dark:border-l-red-500",
  refused: "border-l-red-500 dark:border-l-red-400",
};

export type ContinentResultsGridProps = {
  mode: Mode;
  anchorIso2: string;
  scored: ScoredItem[];
  heading?: string;
  subheading?: string;
};

export function ContinentResultsGrid({
  mode,
  anchorIso2,
  scored,
  heading,
  subheading,
}: ContinentResultsGridProps) {
  const [tab, setTab] = useState<Continent | "all">("all");
  const [sort, setSort] = useState<SortAxis>("difficulty");
  // Pre-hydration we don't know the user's currency preference, so the
  // initial server-render renders fees in native currency. After hydration
  // we re-render with the cookie-driven choice.
  const [userCurrency, setUserCurrency] = useState<string | null>(null);
  useEffect(() => {
    setUserCurrency(readCurrencyCookie());
  }, []);

  // Bucket items by continent up-front; counts inform tab badges.
  const byContinent: Record<Continent | "other", ScoredItem[]> = useMemo(() => {
    const init: Record<Continent | "other", ScoredItem[]> = {
      europe: [],
      asia: [],
      north_america: [],
      south_america: [],
      africa: [],
      oceania: [],
      middle_east: [],
      other: [],
    };
    for (const r of scored) {
      const c = continentFor(r.otherIso2);
      if (c) init[c].push(r);
      else init.other.push(r);
    }
    return init;
  }, [scored]);

  const visible = useMemo(() => {
    const base = tab === "all" ? scored : byContinent[tab];
    return [...base].sort(comparator(sort));
  }, [tab, sort, scored, byContinent]);

  if (scored.length === 0) return null;

  return (
    <section className="mt-10 space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold mb-1">
            {heading ?? (mode === "passport" ? "Browse by continent" : "Origins by continent")}
          </h2>
          {subheading && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{subheading}</p>
          )}
        </div>
        <label className="text-xs flex items-center gap-2">
          <span className="uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold">
            Sort by
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortAxis)}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium px-2 py-1.5"
          >
            {(["stay", "difficulty", "cost", "processing", "visa_type", "continent"] as SortAxis[]).map((s) => (
              <option key={s} value={s}>
                {SORT_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </header>

      {/* Continent tabs */}
      <nav className="flex flex-wrap gap-2" role="tablist" aria-label="Continent">
        <Tab label="All" count={scored.length} on={tab === "all"} onClick={() => setTab("all")} />
        {CONTINENT_ORDER.map((c) => (
          <Tab
            key={c}
            label={CONTINENT_LABEL[c]}
            count={byContinent[c].length}
            on={tab === c}
            onClick={() => setTab(c)}
            dim={byContinent[c].length === 0}
          />
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className="text-sm text-neutral-500 italic">No results in this continent for this route.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {visible.map((item) => (
            <Card
              key={item.otherIso2}
              item={item}
              mode={mode}
              anchorIso2={anchorIso2}
              sort={sort}
              userCurrency={userCurrency}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Tab({
  label,
  count,
  on,
  onClick,
  dim,
}: {
  label: string;
  count: number;
  on: boolean;
  onClick: () => void;
  dim?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      disabled={dim && !on}
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition inline-flex items-center gap-1.5 ${
        on
          ? "bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100"
          : dim
          ? "bg-transparent text-neutral-400 dark:text-neutral-600 border-neutral-200 dark:border-neutral-800 cursor-not-allowed"
          : "bg-transparent text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
      }`}
    >
      {label}
      <span className="font-mono text-[10px] opacity-70">{count}</span>
    </button>
  );
}

/**
 * Card layout — compact, information-dense, status-color-coded.
 *
 * Old layout had 4 metric pills (Status / Diff / Time / Fee) per card.
 * For strong passports that's a wall of "Visa-free · 1/10 · Instant ·
 * Free" repeated 150 times — visually heavy, zero signal.
 *
 * New layout shows ONE meaningful sentence per card, picked from the
 * data that actually varies on this route:
 *   - Visa-free / VoA  → max stay length ("90 days", "30 days")
 *   - e-Visa / Embassy → fee (in user's currency)
 *   - Restricted       → just the red label
 *
 * Status is signalled three ways for instant scanability:
 *   1. Left-edge accent stripe (color)
 *   2. Small uppercase status chip (color + label)
 *   3. The fact below it
 *
 * The active sort axis subtly highlights whichever fact is being
 * sorted, so users see the ordering rationale.
 */
function Card({
  item,
  mode,
  anchorIso2,
  sort,
  userCurrency,
}: {
  item: ScoredItem;
  mode: Mode;
  anchorIso2: string;
  sort: SortAxis;
  userCurrency: string | null;
}) {
  const href =
    mode === "passport"
      ? routeHref(anchorIso2, item.otherIso2, item.purpose)
      : routeHref(item.otherIso2, anchorIso2, item.purpose);

  const status = item.status ?? "";
  const statusChip = STATUS_CHIP[status] ?? "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300";
  const accent = STATUS_ACCENT[status] ?? "border-l-neutral-300 dark:border-l-neutral-700";

  // Pick the one piece of information most likely to vary across cards
  // of this status. For visa-free / VoA destinations that's the stay
  // length; for paid visas it's the fee.
  const fact = pickPrimaryFact({
    status,
    maxStayDays: item.maxStayDays ?? null,
    feeAmountMinor: item.feeAmountMinor ?? null,
    feeCurrency: item.feeCurrency ?? null,
    processingTimeDaysMax: item.processingTimeDaysMax ?? null,
    score: item.score,
    bucket: item.bucket,
    sort,
    userCurrency,
  });

  return (
    <Link
      href={href}
      prefetch={false}
      title={`${nameFor(item.otherIso2)} — ${item.label}`}
      className={`group block rounded-lg border border-neutral-200 dark:border-neutral-800 border-l-4 ${accent} bg-white dark:bg-neutral-950 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm transition px-2.5 py-2`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg shrink-0 leading-none" aria-hidden>
          {flagEmoji(item.otherIso2)}
        </span>
        <p className="font-semibold text-[13px] leading-tight truncate flex-1 group-hover:text-blue-700 dark:group-hover:text-blue-300">
          {nameFor(item.otherIso2)}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${statusChip}`}
        >
          {STATUS_LABEL[status] ?? status.replace(/_/g, " ")}
        </span>
        {fact && (
          <span
            className={`text-[11px] font-semibold tabular-nums text-neutral-700 dark:text-neutral-300 ${
              fact.highlighted ? "text-blue-700 dark:text-blue-300" : ""
            }`}
            title={fact.tooltip}
          >
            {fact.value}
          </span>
        )}
      </div>
    </Link>
  );
}

type PrimaryFact = { value: string; tooltip?: string; highlighted: boolean };

function pickPrimaryFact(args: {
  status: string;
  maxStayDays: number | null;
  feeAmountMinor: number | null;
  feeCurrency: string | null;
  processingTimeDaysMax: number | null;
  score: number;
  bucket: string;
  sort: SortAxis;
  userCurrency: string | null;
}): PrimaryFact | null {
  const {
    status,
    maxStayDays,
    feeAmountMinor,
    feeCurrency,
    processingTimeDaysMax,
    score,
    bucket,
    sort,
    userCurrency,
  } = args;

  // 1. If the user is actively sorting on a specific axis, surface that
  //    axis as the primary fact regardless of status — so the sort
  //    rationale is visible on every card.
  if (sort === "cost") {
    return {
      value: formatFee(feeAmountMinor, feeCurrency, userCurrency),
      highlighted: true,
    };
  }
  if (sort === "processing") {
    return {
      value: formatProcessing(processingTimeDaysMax),
      tooltip: "Maximum processing time",
      highlighted: true,
    };
  }
  if (sort === "difficulty") {
    return {
      value: `${score}/10 · ${BUCKET_LABEL[bucket as keyof typeof BUCKET_LABEL] ?? bucket}`,
      highlighted: true,
    };
  }
  if (sort === "stay" && maxStayDays != null) {
    return {
      value: formatStay(maxStayDays),
      tooltip: "Max stay per entry",
      highlighted: true,
    };
  }

  // 2. Default: surface the dimension that varies for this status.
  if (status === "visa_free" || status === "visa_free_with_eta" || status === "visa_on_arrival") {
    if (maxStayDays != null) {
      return { value: formatStay(maxStayDays), tooltip: "Max stay per entry", highlighted: false };
    }
    return null;
  }
  if (status === "e_visa" || status === "embassy_visa") {
    if (feeAmountMinor != null && feeAmountMinor > 0) {
      return {
        value: formatFee(feeAmountMinor, feeCurrency, userCurrency),
        tooltip: "Mandatory fees",
        highlighted: false,
      };
    }
    if (processingTimeDaysMax != null) {
      return { value: formatProcessing(processingTimeDaysMax), highlighted: false };
    }
    return null;
  }
  return null;
}

function formatStay(days: number): string {
  if (days >= 365) {
    const years = Math.round((days / 365) * 10) / 10;
    return `${years}y stay`;
  }
  if (days >= 30 && days % 30 === 0) return `${days / 30}mo stay`;
  return `${days}d stay`;
}

function formatProcessing(max: number | null): string {
  if (max == null) return "—";
  if (max === 0) return "Instant";
  if (max < 7) return `<1wk`;
  return `≤${max}d`;
}

function formatFee(
  amountMinor: number | null,
  currency: string | null,
  userCurrency: string | null,
): string {
  if (amountMinor == null || amountMinor === 0) return "Free";
  // Honour the user's chosen currency when available, otherwise fall back
  // to the native quoted currency so the compact pill still renders pre-
  // hydration and for users who haven't picked a currency.
  let renderAmount = amountMinor;
  let renderCurrency = currency ?? "USD";
  if (userCurrency && currency && userCurrency !== currency) {
    const converted = convertMinor(amountMinor, currency, userCurrency);
    if (converted != null) {
      renderAmount = converted;
      renderCurrency = userCurrency;
    }
  }
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: renderCurrency,
      maximumFractionDigits: 0,
      notation: renderAmount / 100 >= 1_000 ? "compact" : "standard",
    }).format(renderAmount / 100);
  } catch {
    return `~${Math.round(renderAmount / 100)}`;
  }
}

function comparator(axis: SortAxis): (a: ScoredItem, b: ScoredItem) => number {
  switch (axis) {
    case "difficulty":
      return (a, b) => a.score - b.score || nameFor(a.otherIso2).localeCompare(nameFor(b.otherIso2));
    case "cost":
      return (a, b) => (a.feeAmountMinor ?? 0) - (b.feeAmountMinor ?? 0);
    case "processing":
      return (a, b) =>
        (a.processingTimeDaysMax ?? Infinity) - (b.processingTimeDaysMax ?? Infinity);
    case "stay":
      // Longest stays first — useful for digital nomads / retirees /
      // anyone optimising for time-on-ground rather than visa cost.
      return (a, b) => (b.maxStayDays ?? 0) - (a.maxStayDays ?? 0);
    case "visa_type":
      return (a, b) => {
        const ai = STATUS_ORDER.indexOf(a.status ?? "");
        const bi = STATUS_ORDER.indexOf(b.status ?? "");
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      };
    case "continent":
    default:
      return (a, b) => nameFor(a.otherIso2).localeCompare(nameFor(b.otherIso2));
  }
}
