"use client";

/**
 * Client renderer for the difficulty heat map. Receives precomputed tiles
 * (one per destination iso2) and a list of "no-data" iso2 codes from the
 * server component, then renders the regional flag-tile grid + interactive
 * legend filter.
 *
 * Filtering dims (not hides) tiles outside the selected bucket(s) so the
 * world-view layout stays intact.
 */
import { useState } from "react";
import Link from "next/link";
import {
  type DifficultyBucket,
  BUCKET_PALETTE,
  BUCKET_LABEL,
  BUCKET_BLURB,
  BUCKET_RANGE,
} from "@/lib/difficulty";
import { flagEmoji, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";

export type HeatMapTile = {
  iso2: string;
  score: number;
  bucket: DifficultyBucket;
  purpose: string;
};

export type HeatMapRegion = { name: string; codes: string[] };

const ORDER: DifficultyBucket[] = ["easy", "medium", "hard"];

const NO_DATA_TILE =
  "bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700 ring-neutral-200 dark:ring-neutral-800";

export function DifficultyHeatMapView({
  passportIso2,
  tiles,
  regions,
  noDataCount,
}: {
  passportIso2: string;
  tiles: HeatMapTile[];
  regions: HeatMapRegion[];
  noDataCount: number;
}) {
  const [active, setActive] = useState<Set<DifficultyBucket>>(() => new Set(ORDER));

  const byIso = new Map<string, HeatMapTile>();
  for (const t of tiles) byIso.set(t.iso2, t);

  const totals = { easy: 0, medium: 0, hard: 0 };
  for (const t of tiles) totals[t.bucket] += 1;

  function toggle(bucket: DifficultyBucket) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(bucket)) {
        next.delete(bucket);
        if (next.size === 0) return new Set(ORDER);
      } else {
        next.add(bucket);
      }
      return next;
    });
  }

  const allOn = active.size === ORDER.length;

  return (
    <section className="mt-10">
      <header className="mb-3">
        <h2 className="text-lg font-semibold mb-1">
          Where can {nationalityFor(passportIso2)} passport holders go?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tile colour reflects the headline tourism difficulty for each destination. Click any tile
          for the full breakdown. Use the legend buttons to filter.
        </p>
      </header>

      <div
        className="flex flex-wrap items-center gap-2 mb-5 text-xs"
        role="group"
        aria-label="Filter heat map by difficulty"
      >
        <button
          type="button"
          onClick={() => setActive(new Set(ORDER))}
          className={`px-2.5 py-1 rounded-full border font-semibold transition ${
            allOn
              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100"
              : "bg-transparent text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          }`}
          aria-pressed={allOn}
        >
          All
        </button>
        {ORDER.map((bucket) => {
          const on = active.has(bucket);
          const tone = BUCKET_PALETTE[bucket];
          return (
            <button
              key={bucket}
              type="button"
              onClick={() => toggle(bucket)}
              title={`${BUCKET_LABEL[bucket]} — difficulty ${BUCKET_RANGE[bucket]}. ${BUCKET_BLURB[bucket]}`}
              className={`px-2.5 py-1 rounded-full border font-semibold transition ${
                on ? tone.pillOn : tone.pillOff
              }`}
              aria-pressed={on}
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-sm ${on ? "bg-white/80" : tone.dot}`}
                  aria-hidden
                />
                {BUCKET_LABEL[bucket]} ({totals[bucket]})
              </span>
            </button>
          );
        })}
        <span className="inline-flex items-center gap-1.5 text-neutral-500 ml-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-neutral-100 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800" />
          No data ({noDataCount})
        </span>
      </div>

      <div className="space-y-5">
        {regions.map((region) => (
          <div key={region.name}>
            <h3 className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              {region.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {region.codes
                .filter((c) => c !== passportIso2)
                .map((code) => {
                  const data = byIso.get(code);
                  const tone = data
                    ? active.has(data.bucket)
                      ? BUCKET_PALETTE[data.bucket].tile
                      : BUCKET_PALETTE[data.bucket].tileDim
                    : NO_DATA_TILE;
                  const score = data?.score;
                  const purpose = data?.purpose ?? "tourism";
                  return (
                    <Link
                      key={code}
                      href={`/${passportIso2.toLowerCase()}/${code.toLowerCase()}?purpose=${purpose}`}
                      prefetch={false}
                      title={
                        data
                          ? `${nameFor(code)} — ${BUCKET_LABEL[data.bucket]} (${score}/10, difficulty ${BUCKET_RANGE[data.bucket]})`
                          : `${nameFor(code)} — no data yet`
                      }
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md ring-1 transition text-xs ${tone}`}
                    >
                      <span className="text-base leading-none shrink-0" aria-hidden>{flagEmoji(code)}</span>
                      <span className="flex-1 min-w-0 truncate font-medium">{nameFor(code)}</span>
                      {score != null && (
                        <span className="shrink-0 font-mono text-[10px] opacity-70">{score}</span>
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
