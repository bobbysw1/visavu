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

// Popular subset rendered by default — keeps the homepage link-budget
// tight so PageRank concentrates on the top-traffic country pages
// instead of being diluted across ~250 links per grid. Users typing a
// query in the search box reveal the full list (client-only, so
// crawlers still only see the popular subset).
const COMPACT_LIMIT = 25;

export function AllCountriesGrid({
  mode,
  compact = false,
}: {
  mode: Mode;
  /** When true, render only the COMPACT_LIMIT most popular countries
   *  on first paint. The search box still filters across the full list
   *  on user input. Use on link-budget-sensitive surfaces (homepage). */
  compact?: boolean;
}) {
  const [q, setQ] = useState("");

  // SSR-stable subset for compact mode. PASSPORT_COUNTRIES already
  // excludes uninhabited/no-passport codes, so it's the right base for
  // passport mode; destination mode uses the full list so visitors can
  // still pick anywhere.
  const baseList = useMemo(() => {
    if (!compact) return mode === "passport" ? PASSPORT_COUNTRIES : COUNTRY_LIST;
    const popular = mode === "passport" ? TOP_ORIGINS : TOP_DESTINATIONS;
    const set = new Set(popular);
    const top = popular
      .slice(0, COMPACT_LIMIT)
      .map((iso) => COUNTRY_LIST.find((c) => c.iso2 === iso))
      .filter((c): c is (typeof COUNTRY_LIST)[number] => Boolean(c));
    // Backfill from the alphabetical list if TOP_* is shorter than the
    // limit (shouldn't happen with current data, but keeps the grid
    // visually full if someone trims TOP_DESTINATIONS).
    for (const c of COUNTRY_LIST) {
      if (top.length >= COMPACT_LIMIT) break;
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
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            mode === "passport"
              ? "Search nationality (e.g. British, Indian, Brazilian)"
              : "Search destination (e.g. Spain, Japan, Brazil)"
          }
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
          {filtered.length}/{COUNTRY_LIST.length}
        </span>
      </div>

      <div className="max-h-[480px] overflow-y-auto pr-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-3">
          {filtered.map((c) => (
            <Link
              key={c.iso2}
              href={`${linkBase}/${c.iso2.toLowerCase()}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm transition text-sm"
            >
              <span className="text-lg shrink-0" aria-hidden>
                {c.flag}
              </span>
              <span className="truncate">
                {mode === "passport" ? nationalityFor(c.iso2) : c.name}
              </span>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-slate-500 py-6 text-center">
              No countries match &ldquo;{q}&rdquo;.
            </p>
          )}
        </div>
      </div>
      {compact && !q.trim() && (
        // Browse-all escape hatch when the visible grid is a popular
        // subset. The /passport-rankings page is the comprehensive
        // browse — sending users there is also the SEO-friendly move
        // (concentrates PageRank on one canonical index).
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
          Showing the {COMPACT_LIMIT} most-searched —{" "}
          <Link
            href={mode === "passport" ? "/passport-rankings" : "/passport-rankings"}
            className="text-[var(--color-ink)] underline underline-offset-4 hover:no-underline"
          >
            browse all {mode === "passport" ? PASSPORT_COUNTRIES.length : COUNTRY_LIST.length} →
          </Link>
          {" "}or type any country above.
        </p>
      )}
    </div>
  );
}
