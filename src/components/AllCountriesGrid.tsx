"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COUNTRY_LIST } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";

type Mode = "passport" | "destination";

export function AllCountriesGrid({ mode }: { mode: Mode }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return COUNTRY_LIST;
    return COUNTRY_LIST.filter((c) => {
      const nat = mode === "passport" ? nationalityFor(c.iso2).toLowerCase() : "";
      return (
        c.name.toLowerCase().includes(needle) ||
        c.iso2.toLowerCase().includes(needle) ||
        nat.includes(needle)
      );
    });
  }, [q, mode]);

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
    </div>
  );
}
