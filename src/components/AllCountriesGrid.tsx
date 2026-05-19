"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  COUNTRY_LIST,
  PASSPORT_COUNTRIES,
  TOP_DESTINATIONS,
  TOP_ORIGINS,
} from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";

type Mode = "passport" | "destination";

// Reveal-step matches "2 rows on widest breakpoint" (lg = 5 cols × 2 rows).
// Mobile gets the equivalent number of items per click. Users wanted a
// shorter initial view with a clear "show more" affordance instead of a
// flat 25-item dump.
const REVEAL_STEP = 10;

export function AllCountriesGrid({
  mode,
  compact = false,
}: {
  mode: Mode;
  /** When true, render only the popular subset on first paint and reveal
   *  more in 2-row batches via a "Show more" button. The search box still
   *  filters across the full list on user input. Use on link-budget-sensitive
   *  surfaces (homepage). */
  compact?: boolean;
}) {
  const [q, setQ] = useState("");
  // Visible count starts at 2-rows-worth and grows by REVEAL_STEP per click.
  // Reset to initial when the search box is cleared.
  const [visibleCount, setVisibleCount] = useState(REVEAL_STEP);

  // SSR-stable subset for compact mode. PASSPORT_COUNTRIES already
  // excludes uninhabited/no-passport codes, so it's the right base for
  // passport mode; destination mode uses the full list so visitors can
  // still pick anywhere.
  const baseList = useMemo(() => {
    if (!compact) return mode === "passport" ? PASSPORT_COUNTRIES : COUNTRY_LIST;
    const popular = mode === "passport" ? TOP_ORIGINS : TOP_DESTINATIONS;
    const set = new Set(popular);
    // Take the full popular list (not capped at 25) — we now paginate it
    // client-side via "Show more". The user wanted to be able to drill
    // deeper without leaving the page.
    const top = popular
      .map((iso) => COUNTRY_LIST.find((c) => c.iso2 === iso))
      .filter((c): c is (typeof COUNTRY_LIST)[number] => Boolean(c));
    // Backfill from the alphabetical full list (excluding ones already in
    // the popular subset) so the user can keep clicking "Show more" beyond
    // the popular cohort, all the way to ~250 entries.
    for (const c of COUNTRY_LIST) {
      if (!set.has(c.iso2)) top.push(c);
    }
    return top;
  }, [compact, mode]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    // Searching always queries the FULL list (250 countries) so users
    // can still find any country via the input. Only the initial paint
    // (q === "") respects the compact subset for SEO link budget.
    const source = needle ? COUNTRY_LIST : baseList;
    if (!needle) return source;
    return source.filter((c) => {
      const nat = mode === "passport" ? nationalityFor(c.iso2).toLowerCase() : "";
      return (
        c.name.toLowerCase().includes(needle) ||
        c.iso2.toLowerCase().includes(needle) ||
        nat.includes(needle)
      );
    });
  }, [q, mode, baseList]);

  const linkBase = mode === "passport" ? "/passport" : "/destination";

  // When searching, show all matches; otherwise paginate compact mode.
  const isSearching = q.trim().length > 0;
  const visible = !compact || isSearching ? filtered : filtered.slice(0, visibleCount);
  const hasMore = compact && !isSearching && visibleCount < filtered.length;

  return (
    <div>
      <label className="sr-only" htmlFor={`q-${mode}`}>
        Search countries
      </label>
      <div className="relative mb-4">
        <input
          id={`q-${mode}`}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            // Reset pagination when search is cleared.
            if (!e.target.value.trim()) setVisibleCount(REVEAL_STEP);
          }}
          placeholder={
            mode === "passport"
              ? "Search nationality (e.g. British, Indian, Brazilian)"
              : "Search destination (e.g. Spain, Japan, Brazil)"
          }
          className="w-full rounded-lg border border-[var(--color-rule-strong)] bg-[var(--color-paper-elev)] text-[var(--color-ink)] px-4 py-2.5 text-sm placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/15 focus:border-[var(--color-ink)]"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-ink-muted)]">
          {visible.length}/{filtered.length}
        </span>
      </div>

      <div className="rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-3">
          {visible.map((c) => (
            <Link
              key={c.iso2}
              href={`${linkBase}/${c.iso2.toLowerCase()}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-elev)] hover:border-[var(--color-ink)] hover:shadow-sm transition text-sm text-[var(--color-ink)]"
            >
              <span className="text-lg shrink-0" aria-hidden>
                {c.flag}
              </span>
              <span className="truncate">
                {mode === "passport" ? nationalityFor(c.iso2) : c.name}
              </span>
            </Link>
          ))}
          {visible.length === 0 && (
            <p className="col-span-full text-sm text-[var(--color-ink-muted)] py-6 text-center">
              No countries match &ldquo;{q}&rdquo;.
            </p>
          )}
        </div>
      </div>
      {hasMore && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setVisibleCount((n) => Math.min(n + REVEAL_STEP, filtered.length))}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink)] bg-[var(--color-paper-elev)] hover:bg-[var(--color-muted)] text-[var(--color-ink)] px-4 py-1.5 text-xs font-semibold transition"
          >
            Show {Math.min(REVEAL_STEP, filtered.length - visibleCount)} more
            <span aria-hidden>↓</span>
          </button>
          <p className="text-xs text-[var(--color-ink-muted)]">
            {visibleCount} of {filtered.length} shown —{" "}
            <Link
              href="/passport-rankings"
              className="text-[var(--color-ink)] underline underline-offset-4 hover:no-underline"
            >
              or browse all {mode === "passport" ? PASSPORT_COUNTRIES.length : COUNTRY_LIST.length} →
            </Link>
          </p>
        </div>
      )}
      {compact && !isSearching && !hasMore && filtered.length > REVEAL_STEP && (
        // All popular + alphabetical results revealed — offer the deep-index link.
        <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
          All {filtered.length} shown —{" "}
          <Link
            href="/passport-rankings"
            className="text-[var(--color-ink)] underline underline-offset-4 hover:no-underline"
          >
            browse the full passport-rankings page →
          </Link>
        </p>
      )}
    </div>
  );
}
