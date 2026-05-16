"use client";

/**
 * Interactive world map — minimal silhouette + green-highlighted eligible
 * countries + hover popover with key visa + living metrics.
 *
 * Designed to feel "premium travel platform" rather than "government data
 * site": neutral background, soft fills, single-colour highlight for
 * eligible destinations, animated stroke on hover.
 *
 * Geometry is precomputed server-side (see lib/worldMap.ts) so the client
 * just receives `{ iso2, pathD }[]` and the eligibility map. No d3-geo or
 * topojson bundle ships to the browser.
 *
 * The popover is route-aware: pass `passportIso2` and we render the visa
 * status + difficulty for that origin → that destination. Without a
 * passport we render destination-only metrics (treat as a "where do my
 * metrics live?" world view).
 */
import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { WorldMapData, WorldMapCountry } from "@/lib/worldMap";
import type { DifficultyBucket } from "@/lib/difficulty";
import { BUCKET_PALETTE, BUCKET_LABEL } from "@/lib/difficulty";
import { metricsFor, ENGLISH_BAND_LABEL } from "@/lib/countryMetrics";
import { Flag } from "./Flag";
import { nameFor } from "@/lib/countries";
import { routeHref } from "@/lib/routeHref";

export type EligibilityEntry = {
  /** Visa-status string from the resolver, kept loosely typed since not
   *  every consumer has the strict union to hand. */
  status?: string;
  /** Resolved option label, e.g. "Schengen short-stay visa". */
  label?: string;
  /** 1–10 difficulty score (low=easy / high=hard under the new scale). */
  difficultyScore?: number | null;
  difficultyBucket?: DifficultyBucket | null;
  /** Visa processing time, from the resolved primary option. */
  processingDaysMax?: number | null;
  /** Headline purpose for the resolver answer ("tourism", "work" etc). */
  purpose?: string;
};

const STATUS_TONE: Record<string, { fill: string; stroke: string; chip: string; label: string }> = {
  visa_free: {
    fill: "fill-emerald-400/80 hover:fill-emerald-400 dark:fill-emerald-500/70 dark:hover:fill-emerald-500",
    stroke: "stroke-emerald-600",
    chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
    label: "Visa-free",
  },
  visa_free_with_eta: {
    fill: "fill-emerald-300/80 hover:fill-emerald-300 dark:fill-emerald-600/60 dark:hover:fill-emerald-600",
    stroke: "stroke-emerald-600",
    chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
    label: "Visa-free + eTA",
  },
  visa_on_arrival: {
    fill: "fill-sky-300/80 hover:fill-sky-300 dark:fill-sky-600/60 dark:hover:fill-sky-600",
    stroke: "stroke-sky-600",
    chip: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
    label: "Visa on arrival",
  },
  e_visa: {
    fill: "fill-violet-300/70 hover:fill-violet-300 dark:fill-violet-600/60 dark:hover:fill-violet-600",
    stroke: "stroke-violet-600",
    chip: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200",
    label: "e-Visa",
  },
  embassy_visa: {
    fill: "fill-orange-200/70 hover:fill-orange-300 dark:fill-orange-700/40 dark:hover:fill-orange-700",
    stroke: "stroke-orange-600",
    chip: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200",
    label: "Embassy visa",
  },
  restricted: {
    fill: "fill-red-300/70 hover:fill-red-300 dark:fill-red-700/50 dark:hover:fill-red-700",
    stroke: "stroke-red-600",
    chip: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
    label: "Restricted",
  },
  refused: {
    fill: "fill-red-500/80 hover:fill-red-500 dark:fill-red-800/70 dark:hover:fill-red-800",
    stroke: "stroke-red-700",
    chip: "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-100",
    label: "Refused",
  },
};

const NEUTRAL_TONE = {
  fill: "fill-neutral-200 hover:fill-neutral-300 dark:fill-neutral-800 dark:hover:fill-neutral-700",
  stroke: "stroke-neutral-300 dark:stroke-neutral-700",
};

export type WorldMapProps = {
  data: WorldMapData;
  passportIso2?: string;
  eligibility?: Record<string, EligibilityEntry>;
  /** Optional callback (defaults to <Link> to /[passport]/[dest]). */
  onCountryClick?: (iso2: string) => void;
  /** Optional title above the map. */
  title?: string;
  /** Optional subtitle. */
  subtitle?: string;
};

export function WorldMap({
  data,
  passportIso2,
  eligibility = {},
  title,
  subtitle,
}: WorldMapProps) {
  const [hovered, setHovered] = useState<WorldMapCountry | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Tally legend counts so the user can see "47 visa-free, 12 eTA, …"
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const [, entry] of Object.entries(eligibility)) {
      const s = entry.status ?? "unknown";
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [eligibility]);

  const handleMove = useCallback((evt: React.MouseEvent) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setCursor({ x: evt.clientX - rect.left, y: evt.clientY - rect.top });
  }, []);

  return (
    <section className="relative">
      {(title || subtitle) && (
        <header className="mb-3">
          {title && <h2 className="text-lg font-semibold mb-0.5">{title}</h2>}
          {subtitle && <p className="text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
        </header>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-3 text-[11px]">
        {(["visa_free", "visa_free_with_eta", "visa_on_arrival", "e_visa", "embassy_visa", "restricted", "refused"] as const).map((s) => {
          const tone = STATUS_TONE[s];
          if (!counts[s]) return null;
          return (
            <span
              key={s}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${tone.chip}`}
              title={tone.label}
            >
              <span className={`w-2 h-2 rounded-sm ${tone.fill.split(" ")[0].replace("fill-", "bg-")}`} />
              {tone.label} ({counts[s]})
            </span>
          );
        })}
      </div>

      <div
        ref={wrapRef}
        className="relative w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-sky-50/30 via-white to-emerald-50/20 dark:from-sky-950/30 dark:via-neutral-950 dark:to-emerald-950/20"
        onMouseLeave={() => setHovered(null)}
        onMouseMove={handleMove}
      >
        <svg
          viewBox={`0 0 ${data.width} ${data.height}`}
          className="w-full h-auto block"
          role="img"
          aria-label="World map of visa eligibility"
        >
          <defs>
            <filter id="map-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>
          <g>
            {data.countries.map((c) => {
              const entry = eligibility[c.iso2];
              const tone = entry ? (STATUS_TONE[entry.status ?? ""] ?? NEUTRAL_TONE) : NEUTRAL_TONE;
              const isHovered = hovered?.iso2 === c.iso2;
              const isSelf = passportIso2 && c.iso2 === passportIso2.toUpperCase();
              const link = passportIso2
                ? routeHref(passportIso2, c.iso2, entry?.purpose)
                : `/destination/${c.iso2.toLowerCase()}`;
              return (
                <Link key={c.iso2} href={link} prefetch={false} aria-label={c.name}>
                  <path
                    d={c.pathD}
                    className={`${tone.fill} ${tone.stroke} stroke-[0.4] cursor-pointer transition-all duration-150 ${
                      isHovered ? "drop-shadow-md" : ""
                    } ${isSelf ? "stroke-blue-600 stroke-[1.2]" : ""}`}
                    onMouseEnter={() => setHovered(c)}
                  />
                </Link>
              );
            })}
          </g>
        </svg>

        {hovered && cursor && (
          <Popover
            country={hovered}
            entry={eligibility[hovered.iso2]}
            passportIso2={passportIso2}
            x={cursor.x}
            y={cursor.y}
          />
        )}
      </div>

      <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
        Map: Natural Earth 110m via{" "}
        <a
          href="https://github.com/topojson/world-atlas"
          target="_blank"
          rel="noreferrer noopener"
          className="underline hover:no-underline"
        >
          world-atlas
        </a>
        . Equal Earth projection. Hover a country for visa + living details; click to open the full
        route.
      </p>
    </section>
  );
}

function Popover({
  country,
  entry,
  passportIso2,
  x,
  y,
}: {
  country: WorldMapCountry;
  entry: EligibilityEntry | undefined;
  passportIso2: string | undefined;
  x: number;
  y: number;
}) {
  const m = metricsFor(country.iso2);
  const tone = entry?.status ? STATUS_TONE[entry.status] : null;
  const bucketTone = entry?.difficultyBucket ? BUCKET_PALETTE[entry.difficultyBucket] : null;

  // Position popover near cursor but keep inside container bounds.
  const style: React.CSSProperties = {
    left: Math.min(Math.max(x + 14, 8), 720),
    top: Math.min(y + 14, 380),
  };

  const link = passportIso2
    ? routeHref(passportIso2, country.iso2, entry?.purpose)
    : `/destination/${country.iso2.toLowerCase()}`;

  return (
    <div
      className="absolute z-20 w-72 max-w-[90vw] pointer-events-none rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-xl backdrop-blur p-3 text-sm"
      style={style}
      role="tooltip"
    >
      <div className="flex items-center gap-2 mb-2">
        <Flag iso2={country.iso2} size={20} />
        <p className="font-semibold flex-1 truncate">{nameFor(country.iso2)}</p>
        <span className="font-mono text-[10px] text-neutral-500">{country.iso2}</span>
      </div>

      {tone && (
        <div className="flex items-center justify-between mb-2.5">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${tone.chip}`}
          >
            {tone.label}
          </span>
          {entry?.label && (
            <span className="text-[10px] text-neutral-500 truncate ml-2">{entry.label}</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        {entry?.difficultyScore != null && bucketTone && (
          <Tile
            label="Difficulty"
            value={`${entry.difficultyScore}/10`}
            sub={BUCKET_LABEL[entry.difficultyBucket!]}
            toneClass={bucketTone.chip}
          />
        )}
        {entry?.processingDaysMax != null && (
          <Tile
            label="Processing"
            value={entry.processingDaysMax === 0 ? "Instant" : `~${entry.processingDaysMax}d`}
          />
        )}
        {m?.avgSalaryUsd != null && (
          <Tile label="Avg salary" value={`$${Math.round(m.avgSalaryUsd / 1000)}k`} />
        )}
        {m?.topTaxRatePct != null && (
          <Tile label="Top tax" value={`${m.topTaxRatePct}%`} />
        )}
        {m?.safetyGpiRank != null && (
          <Tile label="Safety" value={`#${m.safetyGpiRank}`} />
        )}
        {m?.englishBand && (
          <Tile label="English" value={ENGLISH_BAND_LABEL[m.englishBand]} />
        )}
        {m?.permanentResidencyYears != null && (
          <Tile label="PR pathway" value={`${m.permanentResidencyYears} yrs`} />
        )}
      </div>

      <p className="mt-2.5 text-[11px] text-blue-700 dark:text-blue-400 font-medium">
        Click to open <span className="underline">{link}</span>
      </p>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  toneClass,
}: {
  label: string;
  value: string;
  sub?: string;
  toneClass?: string;
}) {
  return (
    <div className={`rounded-md px-2 py-1.5 ${toneClass ?? "bg-neutral-50 dark:bg-neutral-900/60"}`}>
      <p className="text-[9px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-xs font-bold leading-tight">{value}</p>
      {sub && <p className="text-[9px] text-neutral-500 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}
