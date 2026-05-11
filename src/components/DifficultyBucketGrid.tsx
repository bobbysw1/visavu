"use client";

/**
 * Difficulty grid: groups country pairs into Easy / Moderate / Hard sections
 * so a user can scan "where can I easily go?" or "who finds it easiest to
 * enter X?" — depending on whether the page anchors on passport or destination.
 *
 * Performance: scoring + bucketing are computed SERVER-side in lib/coverage.ts
 * so only the trimmed ScoredItem[] ships to the client. Renders top 25 per
 * bucket on first paint; the rest reveal via a "Show all" button.
 */
import { useState } from "react";
import Link from "next/link";
import type { Purpose } from "@/lib/types";
import type { DifficultyBucket } from "@/lib/difficulty";
import { flagEmoji, nameFor } from "@/lib/countries";

type Mode = "passport" | "destination";

export type ScoredItem = {
  // The "other" iso — destination iso for passport-mode, origin iso for destination-mode.
  otherIso2: string;
  label: string;
  purpose: Purpose;
  score: number;
  bucket: DifficultyBucket;
};

const BUCKET_SECTIONS_PASSPORT: Array<{
  bucket: DifficultyBucket;
  title: string;
  blurb: string;
  tone: { dot: string; border: string };
}> = [
  {
    bucket: "easy",
    title: "Easiest destinations",
    blurb: "Visa-free, eTA, visa-on-arrival, and other quick-win routes.",
    tone: {
      dot: "bg-emerald-500",
      border: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20",
    },
  },
  {
    bucket: "medium",
    title: "Moderate destinations",
    blurb: "Some paperwork or processing time. Plan ahead.",
    tone: {
      dot: "bg-amber-500",
      border: "border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20",
    },
  },
  {
    bucket: "hard",
    title: "Hardest destinations",
    blurb: "Heavy documentation, sponsorship, or restricted entry.",
    tone: {
      dot: "bg-red-500",
      border: "border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20",
    },
  },
];

const BUCKET_SECTIONS_DESTINATION: Array<{
  bucket: DifficultyBucket;
  title: string;
  blurb: string;
  tone: { dot: string; border: string };
}> = [
  {
    bucket: "easy",
    title: "Easiest origins",
    blurb: "Passports that find this country quick to enter.",
    tone: {
      dot: "bg-emerald-500",
      border: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20",
    },
  },
  {
    bucket: "medium",
    title: "Moderate origins",
    blurb: "Some paperwork or processing time, but routine.",
    tone: {
      dot: "bg-amber-500",
      border: "border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20",
    },
  },
  {
    bucket: "hard",
    title: "Hardest origins",
    blurb: "Visa-required with heavy documentation, or restricted entry.",
    tone: {
      dot: "bg-red-500",
      border: "border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20",
    },
  },
];

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
  const sections = mode === "passport" ? BUCKET_SECTIONS_PASSPORT : BUCKET_SECTIONS_DESTINATION;

  const grouped = new Map<DifficultyBucket, ScoredItem[]>();
  for (const row of scored) {
    if (!grouped.has(row.bucket)) grouped.set(row.bucket, []);
    grouped.get(row.bucket)!.push(row);
  }
  for (const [bucket, list] of grouped) {
    list.sort((a, b) => (bucket === "hard" ? a.score - b.score : b.score - a.score));
  }

  const totalCount = scored.length;
  const truncated = !showAll && totalCount > TOP_N * 3;

  return (
    <section className="mt-10 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{heading}</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{subheading}</p>
      </div>

      {sections.map((section) => {
        const allItems = grouped.get(section.bucket) ?? [];
        if (allItems.length === 0) return null;
        const items = showAll ? allItems : allItems.slice(0, TOP_N);

        return (
          <div key={section.bucket} className={`rounded-lg border p-4 ${section.tone.border}`}>
            <header className="flex items-center gap-2 mb-3">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${section.tone.dot}`} aria-hidden />
              <h3 className="text-base font-semibold">
                {section.title} ({items.length})
              </h3>
            </header>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">{section.blurb}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {items.map((item) => {
                const href =
                  mode === "passport"
                    ? `/${anchorIso2.toLowerCase()}/${item.otherIso2.toLowerCase()}?purpose=${item.purpose}`
                    : `/${item.otherIso2.toLowerCase()}/${anchorIso2.toLowerCase()}?purpose=${item.purpose}`;
                return (
                  <Link
                    key={item.otherIso2}
                    href={href}
                    prefetch={false}
                    className="flex items-center gap-3 px-3 py-2 rounded-md bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition text-sm"
                  >
                    <span className="text-lg shrink-0" aria-hidden>{flagEmoji(item.otherIso2)}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium truncate">{nameFor(item.otherIso2)}</span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {item.label}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-neutral-500 shrink-0">{item.score}/10</span>
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
