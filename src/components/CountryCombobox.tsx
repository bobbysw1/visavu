"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { COUNTRY_LIST, type CountryRef } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";

type Mode = "country" | "nationality";

// Surfaced at the top of the dropdown when the input is empty. The
// "Popular" section gives users a one-tap path to the most-searched
// countries without scrolling the full alphabetical list.
const POPULAR_DESTINATIONS = ["US", "GB", "CA", "AU", "NZ", "DE", "FR", "ES", "PT", "JP", "AE", "SG"];
const POPULAR_NATIONALITIES = ["US", "GB", "CA", "AU", "IN", "DE", "FR", "ES", "BR", "PH", "IT", "MX"];

type Props = {
  label: string;
  value: string;
  onChange: (iso2: string) => void;
  placeholder?: string;
  required?: boolean;
  // "country" → "United Kingdom", "China", "India" (default)
  // "nationality" → "British", "Chinese", "Indian" (used for the passport
  // input, where the user thinks of themselves by demonym, not country name)
  mode?: Mode;
};

type DisplayRef = CountryRef & { displayName: string };

// Lightweight typeahead. No external lib. Filters in-memory across ~250 entries
// — fast enough for instant feedback. Keyboard navigable (↑/↓/Enter/Escape).
export function CountryCombobox({
  label,
  value,
  onChange,
  placeholder,
  required,
  mode = "country",
}: Props) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build the list once per mode. In nationality mode entries are sorted by
  // demonym so "Algerian" sits between "Albanian" and "American".
  const list = useMemo<DisplayRef[]>(() => {
    const enriched = COUNTRY_LIST.map((c) => ({
      ...c,
      displayName: mode === "nationality" ? nationalityFor(c.iso2) : c.name,
    }));
    return enriched.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [mode]);

  // Sync internal query when value changes externally.
  useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }
    const c = list.find((x) => x.iso2 === value.toUpperCase());
    if (c) setQuery(c.displayName);
  }, [value, list]);

  // Click-outside closes the popover.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const matches = useMemo(() => filter(list, query, mode), [list, query, mode]);

  // Empty-input state: build a "Popular" section followed by the full
  // alphabetical list. With a query typed in, the popular section is
  // hidden — users typing have specific intent already.
  const popular = useMemo<DisplayRef[]>(() => {
    if (query.trim()) return [];
    const codes = mode === "nationality" ? POPULAR_NATIONALITIES : POPULAR_DESTINATIONS;
    return codes
      .map((iso) => list.find((c) => c.iso2 === iso))
      .filter((c): c is DisplayRef => Boolean(c));
  }, [list, mode, query]);

  // Skip popular entries inside the alphabetical list to avoid duplicates.
  const matchesMinusPopular = useMemo<DisplayRef[]>(() => {
    if (!popular.length) return matches;
    const skip = new Set(popular.map((p) => p.iso2));
    return matches.filter((m) => !skip.has(m.iso2));
  }, [matches, popular]);

  function commit(c: DisplayRef) {
    onChange(c.iso2);
    setQuery(c.displayName);
    setOpen(false);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (open && matches[highlight]) {
        e.preventDefault();
        commit(matches[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={wrapRef}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={query}
          required={required}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder ?? (mode === "nationality" ? "e.g. British" : "Type a country…")}
          onFocus={() => {
            setOpen(true);
            setHighlight(0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
            // Clear iso when query no longer matches an exact entry.
            const exact = list.find(
              (c) => c.displayName.toLowerCase() === e.target.value.toLowerCase(),
            );
            if (exact) onChange(exact.iso2);
            else if (value) onChange("");
          }}
          onKeyDown={onKey}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-11 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {value && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" aria-hidden>
            {list.find((c) => c.iso2 === value)?.flag ?? ""}
          </span>
        )}
        {open && matches.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg"
          >
            {/* Popular section (empty-input only). Renders above the
                alphabetical list with a small label header so users see
                the high-traffic options first. */}
            {popular.length > 0 && (
              <>
                <li
                  aria-hidden
                  className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-900/60"
                >
                  Popular
                </li>
                {popular.map((c, i) => (
                  <li
                    role="option"
                    aria-selected={i === highlight}
                    key={`pop-${c.iso2}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commit(c);
                    }}
                    onMouseEnter={() => setHighlight(i)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer ${
                      i === highlight ? "bg-blue-50 dark:bg-blue-950/40" : ""
                    }`}
                  >
                    <span className="text-lg" aria-hidden>{c.flag}</span>
                    <span className="flex-1">{c.displayName}</span>
                    <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wide">
                      Popular
                    </span>
                  </li>
                ))}
                <li
                  aria-hidden
                  className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60"
                >
                  All countries (A–Z)
                </li>
              </>
            )}
            {/* Full alphabetical list — was capped at 20 entries which
                cut off everywhere past "Barbados" / "Bangladesh". Now
                renders every match, scrollable inside max-h-80. */}
            {matchesMinusPopular.map((c, idx) => {
              const i = idx + popular.length;
              return (
                <li
                  role="option"
                  aria-selected={i === highlight}
                  key={c.iso2}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(c);
                  }}
                  onMouseEnter={() => setHighlight(i)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer ${
                    i === highlight ? "bg-blue-50 dark:bg-blue-950/40" : ""
                  }`}
                >
                  <span className="text-lg" aria-hidden>{c.flag}</span>
                  <span className="flex-1">{c.displayName}</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {mode === "nationality" ? c.name : c.iso2}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function filter(list: DisplayRef[], q: string, mode: Mode): DisplayRef[] {
  if (!q.trim()) return list;
  const lower = q.trim().toLowerCase();
  // Match against both the displayName AND the country name in nationality
  // mode, so a user typing "United Kingdom" still finds British, and a user
  // typing "British" still finds GB. Prefix wins, then substring, then ISO.
  const prefix: DisplayRef[] = [];
  const substring: DisplayRef[] = [];
  const iso: DisplayRef[] = [];
  for (const c of list) {
    const display = c.displayName.toLowerCase();
    const country = c.name.toLowerCase();
    if (display.startsWith(lower) || country.startsWith(lower)) prefix.push(c);
    else if (display.includes(lower) || country.includes(lower)) substring.push(c);
    else if (c.iso2.toLowerCase().startsWith(lower)) iso.push(c);
  }
  // Don't surface dual matches twice.
  void mode;
  return [...prefix, ...substring, ...iso];
}
