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
import { useMemo, useState } from "react";
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

type Mode = "passport" | "destination";

type SortAxis = "continent" | "visa_type" | "difficulty" | "cost" | "processing";

const SORT_LABEL: Record<SortAxis, string> = {
  continent: "Country name",
  visa_type: "Visa type",
  difficulty: "Difficulty (easy first)",
  cost: "Cost (cheapest first)",
  processing: "Processing (fastest first)",
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
            {(["difficulty", "cost", "processing", "visa_type", "continent"] as SortAxis[]).map((s) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((item) => (
            <Card key={item.otherIso2} item={item} mode={mode} anchorIso2={anchorIso2} sort={sort} />
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

function Card({
  item,
  mode,
  anchorIso2,
  sort,
}: {
  item: ScoredItem;
  mode: Mode;
  anchorIso2: string;
  sort: SortAxis;
}) {
  const href =
    mode === "passport"
      ? `/${anchorIso2.toLowerCase()}/${item.otherIso2.toLowerCase()}?purpose=${item.purpose}`
      : `/${item.otherIso2.toLowerCase()}/${anchorIso2.toLowerCase()}?purpose=${item.purpose}`;

  const diffTone = BUCKET_PALETTE[item.bucket];
  const status = item.status ?? "";
  const statusChip = STATUS_CHIP[status] ?? "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300";

  return (
    <Link
      href={href}
      prefetch={false}
      title={`${nameFor(item.otherIso2)} — ${item.label}`}
      className="block rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-blue-400 dark:hover:border-blue-600 transition p-3.5"
    >
      <div className="flex items-start gap-3 mb-2.5">
        <span className="text-2xl shrink-0 leading-none" aria-hidden>
          {flagEmoji(item.otherIso2)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{nameFor(item.otherIso2)}</p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{item.label}</p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${statusChip} shrink-0`}
        >
          {STATUS_LABEL[status] ?? status.replace(/_/g, " ")}
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <Metric
          label="Diff"
          value={`${item.score}/10`}
          tone={diffTone.chip}
          highlight={sort === "difficulty"}
          sub={BUCKET_LABEL[item.bucket]}
        />
        <Metric
          label="Time"
          value={formatProcessing(item.processingTimeDaysMax ?? null)}
          highlight={sort === "processing"}
        />
        <Metric
          label="Fee"
          value={formatFee(item.feeAmountMinor ?? null, item.feeCurrency ?? null)}
          highlight={sort === "cost"}
        />
      </div>
    </Link>
  );
}

function Metric({
  label,
  value,
  sub,
  tone,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={`flex-1 px-1.5 py-1 rounded ${
        tone ?? "bg-neutral-50 dark:bg-neutral-900/60"
      } ${highlight ? "ring-2 ring-blue-500/40" : ""}`}
      title={sub}
    >
      <span className="block text-[9px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="block font-bold tabular-nums text-neutral-900 dark:text-neutral-100">{value}</span>
    </span>
  );
}

function formatProcessing(max: number | null): string {
  if (max == null) return "—";
  if (max === 0) return "Instant";
  if (max < 7) return `<1wk`;
  return `≤${max}d`;
}

function formatFee(amountMinor: number | null, currency: string | null): string {
  if (amountMinor == null || amountMinor === 0) return "Free";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency ?? "USD",
      maximumFractionDigits: 0,
      notation: amountMinor / 100 >= 1_000 ? "compact" : "standard",
    }).format(amountMinor / 100);
  } catch {
    return `~${Math.round(amountMinor / 100)}`;
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
