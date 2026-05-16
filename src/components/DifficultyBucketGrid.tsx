"use client";

/**
 * Difficulty grid: groups country pairs into Easy / Medium / Difficult sections
 * so a user can scan "where can I easily go?" or "who finds it easiest to
 * enter X?" — depending on whether the page anchors on passport or destination.
 *
 * Performance: scoring + bucketing are computed SERVER-side in lib/coverage.ts
 * so only the trimmed ScoredItem[] ships to the client. Renders top 25 per
 * bucket on first paint; the rest reveal via a "Show all" button.
 *
 * Filter pills at the top let users narrow to a single bucket — the pill
 * colours echo the section colours so the visual mapping stays obvious.
 */
import { useState } from "react";
import Link from "next/link";
import type { Purpose } from "@/lib/types";
import {
  type DifficultyBucket,
  BUCKET_PALETTE,
  BUCKET_LABEL,
  BUCKET_BLURB,
  BUCKET_RANGE,
} from "@/lib/difficulty";
import { flagEmoji, nameFor } from "@/lib/countries";
import { routeHref } from "@/lib/routeHref";

type Mode = "passport" | "destination";

export type ScoredItem = {
  // The "other" iso — destination iso for passport-mode, origin iso for destination-mode.
  otherIso2: string;
  label: string;
  purpose: Purpose;
  score: number;
  bucket: DifficultyBucket;
  /** Optional fields populated for richer views (continent grid sort axes). */
  status?: string;
  processingTimeDaysMax?: number | null;
  feeAmountMinor?: number | null;
  feeCurrency?: string | null;
};

const ORDER: DifficultyBucket[] = ["easy", "medium", "hard"];

const SECTION_COPY: Record<Mode, Record<DifficultyBucket, { title: string; blurb: string }>> = {
  passport: {
    easy: { title: "Easiest destinations", blurb: "Visa-free, eTA, visa-on-arrival, and other quick-win routes." },
    medium: { title: "Medium destinations", blurb: "Some paperwork or processing time. Plan ahead." },
    hard: { title: "Most difficult destinations", blurb: "Heavy documentation, sponsorship, or restricted entry." },
  },
  destination: {
    easy: { title: "Easiest origins", blurb: "Passports that find this country quick to enter." },
    medium: { title: "Medium origins", blurb: "Some paperwork or processing time, but routine." },
    hard: { title: "Most difficult origins", blurb: "Visa-required with heavy documentation, or restricted entry." },
  },
};

export function DifficultyBucketGrid({
  passportIso2,
  scored,
}: {
  passportIso2: string;
  scored: ScoredItem[];
}) {
  if (scored.length === 0) return null;
  return (
    <BucketGrid
      mode="passport"
      anchorIso2={passportIso2}
      scored={scored}
      heading="Destinations by difficulty"
      subheading="Tourism-first headline scores. Click a destination for the full breakdown across all visa types."
    />
  );
}

export function DestinationDifficultyBucketGrid({
  destinationIso2,
  scored,
}: {
  destinationIso2: string;
  scored: ScoredItem[];
}) {
  if (scored.length === 0) return null;
  return (
    <BucketGrid
      mode="destination"
      anchorIso2={destinationIso2}
      scored={scored}
      heading="Origins by difficulty"
      subheading="Tourism-first headline scores. Click an origin for the full breakdown across all visa types."
    />
  );
}

const TOP_N = 25;

function BucketGrid({
  mode,
  anchorIso2,
  scored,
  heading,
  subheading,
}: {
  mode: Mode;
  anchorIso2: string;
  scored: ScoredItem[];
  heading: string;
  subheading: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const [active, setActive] = useState<Set<DifficultyBucket>>(
    () => new Set(ORDER),
  );

  const grouped = new Map<DifficultyBucket, ScoredItem[]>();
  for (const row of scored) {
    if (!grouped.has(row.bucket)) grouped.set(row.bucket, []);
    grouped.get(row.bucket)!.push(row);
  }
  // Best-in-bucket first: easy ascending (1 first), hard descending (10 first).
  for (const [bucket, list] of grouped) {
    list.sort((a, b) => (bucket === "hard" ? b.score - a.score : a.score - b.score));
  }

  const totalCount = scored.length;
  const truncated = !showAll && totalCount > TOP_N * 3;

  function toggle(bucket: DifficultyBucket) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(bucket)) {
        next.delete(bucket);
        // If the user just turned everything off, treat it as "show all" — a
        // grid with no visible sections is a footgun, not an intent signal.
        if (next.size === 0) return new Set(ORDER);
      } else {
        next.add(bucket);
      }
      return next;
    });
  }

  function setAll() {
    setActive(new Set(ORDER));
  }

  const allOn = active.size === ORDER.length;

  return (
    <section className="mt-10 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{heading}</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{subheading}</p>
      </div>

      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter by difficulty"
      >
        <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mr-1">
          Filter
        </span>
        <button
          type="button"
          onClick={setAll}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
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
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                on ? tone.pillOn : tone.pillOff
              }`}
              aria-pressed={on}
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    on ? "bg-white/80" : tone.dot
                  }`}
                  aria-hidden
                />
                {BUCKET_LABEL[bucket]}
                <span className="font-mono text-[10px] opacity-70">{BUCKET_RANGE[bucket]}</span>
              </span>
            </button>
          );
        })}
      </div>

      {ORDER.map((bucket) => {
        if (!active.has(bucket)) return null;
        const allItems = grouped.get(bucket) ?? [];
        if (allItems.length === 0) return null;
        const tone = BUCKET_PALETTE[bucket];
        const copy = SECTION_COPY[mode][bucket];
        const items = showAll ? allItems : allItems.slice(0, TOP_N);

        return (
          <div key={bucket} className={`rounded-lg border p-4 ${tone.border}`}>
            <header
              className="flex flex-wrap items-center gap-2 mb-1"
              title={copy.blurb}
            >
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${tone.dot}`} aria-hidden />
              <h3 className="text-base font-semibold">
                {copy.title} ({items.length})
              </h3>
              <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${tone.chip}`}>
                {BUCKET_LABEL[bucket]} · {BUCKET_RANGE[bucket]}
              </span>
            </header>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">{copy.blurb}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {items.map((item) => {
                const href =
                  mode === "passport"
                    ? routeHref(anchorIso2, item.otherIso2, item.purpose)
                    : routeHref(item.otherIso2, anchorIso2, item.purpose);
                return (
                  <Link
                    key={item.otherIso2}
                    href={href}
                    prefetch={false}
                    title={`${nameFor(item.otherIso2)} — ${item.score}/10 (${BUCKET_LABEL[item.bucket]})`}
                    className="flex items-center gap-3 px-3 py-2 rounded-md bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition text-sm"
                  >
                    <span className="text-lg shrink-0" aria-hidden>{flagEmoji(item.otherIso2)}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium truncate">{nameFor(item.otherIso2)}</span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {item.label}
                      </span>
                    </span>
                    <span className={`font-mono text-xs shrink-0 px-1.5 py-0.5 rounded ${tone.chip}`}>
                      {item.score}/10
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {truncated && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-sm font-medium"
        >
          Show all {totalCount} {mode === "passport" ? "destinations" : "origins"} →
        </button>
      )}
    </section>
  );
}

// Scoring helpers moved to src/lib/scoring.ts so they can run server-side.
// Pages compute ScoredItem[] there and pass only the trimmed data to this
// "use client" component — keeps /passport/[iso] HTML payloads small.
