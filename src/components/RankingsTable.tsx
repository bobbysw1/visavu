"use client";

/**
 * Interactive leaderboard for /passport-rankings.
 *
 * Three things that matter visually:
 *   - Rank groupings: passports tied at the same visa-free count share one
 *     rank header row, instead of every row showing a unique 1, 2, 3, …
 *     This is what makes the page read as a leaderboard, not a directory.
 *   - Stacked status bar per row: at-a-glance composition of each passport's
 *     access (visa-free / eTA / VOA / e-visa / embassy / refused).
 *   - Filter input: client-side substring filter over country name + nationality.
 *
 * The passport-cover thumbnail comes from <PassportCover>, which renders
 * the real Wikimedia photo when manifest has one and falls back to a flag
 * tile otherwise.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { PassportCover } from "./PassportCover";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import type { PassportRanking } from "@/lib/coverage";
import type { PassportCover as PassportCoverData } from "@/lib/passportCoverTypes";
import type { VisaStatus } from "@/lib/types";

// Bar segment palette — tuned for readability against both light paper and
// the muted neutrals around it. Visa-free is the brand emerald so the
// strong passports glow green at a glance.
const STATUS_COLOR: Record<VisaStatus, string> = {
  visa_free: "bg-emerald-500",
  visa_free_with_eta: "bg-sky-500",
  visa_on_arrival: "bg-cyan-500",
  e_visa: "bg-violet-500",
  embassy_visa: "bg-amber-500",
  restricted: "bg-orange-500",
  refused: "bg-rose-500",
};

const STATUS_LABEL: Record<VisaStatus, string> = {
  visa_free: "Visa-free",
  visa_free_with_eta: "Visa-free with eTA",
  visa_on_arrival: "Visa on arrival",
  e_visa: "e-Visa",
  embassy_visa: "Embassy visa",
  restricted: "Restricted",
  refused: "Entry refused",
};

// Order segments highest-tier-first so the strongest access reads
// left-to-right (matches how every other passport-strength index renders).
const STATUS_ORDER: VisaStatus[] = [
  "visa_free",
  "visa_free_with_eta",
  "visa_on_arrival",
  "e_visa",
  "embassy_visa",
  "restricted",
  "refused",
];

export function RankingsTable({
  rankings,
  covers,
}: {
  rankings: PassportRanking[];
  /** Pre-resolved passport-cover lookup, keyed by uppercase ISO2. The
   *  parent server component reads the manifest via
   *  `lib/passportCovers.ts` so we don't pull `node:fs` into the client
   *  bundle. Missing entries render the flag fallback. */
  covers: Record<string, PassportCoverData | null>;
}) {
  const [filter, setFilter] = useState("");

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return rankings;
    return rankings.filter((r) => {
      const name = nameFor(r.iso2).toLowerCase();
      const nat = nationalityFor(r.iso2).toLowerCase();
      return (
        r.iso2.toLowerCase().includes(needle) ||
        name.includes(needle) ||
        nat.includes(needle)
      );
    });
  }, [filter, rankings]);

  // Group by rank — passports tied at the same visaFreeAccess share a
  // single rank label. Rank is recomputed from the FULL list (not the
  // filtered view) so that filtering for "Spain" still shows "Rank 2"
  // and not "Rank 1 of 1 visible".
  const fullRankByIso = useMemo(() => {
    const m = new Map<string, number>();
    let lastScore = -1;
    let lastRank = 0;
    rankings.forEach((r, i) => {
      const rank = r.visaFreeAccess === lastScore ? lastRank : i + 1;
      m.set(r.iso2, rank);
      lastScore = r.visaFreeAccess;
      lastRank = rank;
    });
    return m;
  }, [rankings]);

  // Group adjacent visible rows by their rank for the rendered grouping.
  const groups = useMemo(() => {
    const out: { rank: number; rows: PassportRanking[] }[] = [];
    for (const r of visible) {
      const rank = fullRankByIso.get(r.iso2) ?? 0;
      const last = out[out.length - 1];
      if (last && last.rank === rank) last.rows.push(r);
      else out.push({ rank, rows: [r] });
    }
    return out;
  }, [visible, fullRankByIso]);

  return (
    <section>
      {/* Filter input + result count */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by country, nationality, or ISO code…"
            aria-label="Filter passports"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-elev)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/30"
          />
          <svg
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-xs text-[var(--color-ink-muted)] tabular">
          {visible.length} of {rankings.length} passports
        </p>
      </div>

      {/* Legend for the stacked bar — one row, gives the reader the key
          before they need to interpret a bar. */}
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 text-[11px] text-[var(--color-ink-muted)]">
        {STATUS_ORDER.map((s) => (
          <li key={s} className="inline-flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-sm ${STATUS_COLOR[s]}`} aria-hidden />
            <span>{STATUS_LABEL[s]}</span>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--color-ink-muted)] italic">
          No passport matches &ldquo;{filter}&rdquo;.
        </p>
      ) : (
        <ol className="divide-y divide-[var(--color-rule)] border-y border-[var(--color-rule)]">
          {groups.map((group) => (
            <li key={`${group.rank}-${group.rows[0].iso2}`}>
              {/* Rank header — shared across all passports tied at this rank. */}
              <div className="flex items-baseline gap-3 px-2 sm:px-4 py-3 bg-[var(--color-paper-elev)]/50">
                <span className="serif-display text-2xl sm:text-3xl font-medium tabular text-[var(--color-ink)]">
                  {group.rank}
                </span>
                <span className="kicker">
                  Passport power rank
                  {group.rows.length > 1 && (
                    <span className="ml-2 text-[var(--color-ink-muted)] normal-case tracking-normal">
                      · {group.rows.length} tied
                    </span>
                  )}
                </span>
              </div>

              {/* One row per passport at this rank. */}
              <ul>
                {group.rows.map((r) => (
                  <RankRow key={r.iso2} ranking={r} cover={covers[r.iso2] ?? null} />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function RankRow({
  ranking,
  cover,
}: {
  ranking: PassportRanking;
  cover: PassportCoverData | null;
}) {
  const { iso2, visaFreeAccess, totalDestinations, byStatus } = ranking;
  const name = nameFor(iso2);
  const totalForBar = STATUS_ORDER.reduce((sum, s) => sum + byStatus[s], 0);

  return (
    <li className="block">
      <Link
        href={`/passport/${iso2.toLowerCase()}`}
        prefetch={false}
        className="grid grid-cols-[3.5rem_1fr_auto] sm:grid-cols-[4rem_minmax(0,1fr)_minmax(0,2fr)_auto] gap-3 sm:gap-5 items-center px-2 sm:px-4 py-3 hover:bg-[var(--color-paper-elev)] transition group"
      >
        <PassportCover iso2={iso2} cover={cover} size="thumb" />
        <div className="min-w-0">
          <p className="font-semibold text-sm sm:text-base uppercase tracking-wide truncate group-hover:underline underline-offset-4 decoration-1">
            {name}
          </p>
          <p className="kicker mt-0.5 truncate">
            {totalDestinations} destinations covered
          </p>
        </div>

        {/* Stacked status bar — only visible at sm+ to keep mobile light. */}
        <div className="hidden sm:flex items-center gap-3 min-w-0">
          <StatusBar byStatus={byStatus} total={totalForBar} />
        </div>

        <div className="text-right shrink-0">
          <p className="serif-display text-2xl sm:text-3xl font-medium tabular text-emerald-700 dark:text-emerald-400 leading-none">
            {visaFreeAccess}
          </p>
          <p className="kicker mt-1">visa-free</p>
        </div>
      </Link>
    </li>
  );
}

function StatusBar({
  byStatus,
  total,
}: {
  byStatus: Record<VisaStatus, number>;
  total: number;
}) {
  if (total === 0) {
    return (
      <span className="text-[11px] italic text-[var(--color-ink-muted)]">
        no tourism data
      </span>
    );
  }

  // Pre-compute non-zero segments so we can render with sensible flex-grow
  // and skip empty segments entirely (cleaner visual, fewer DOM nodes).
  const segments = STATUS_ORDER
    .map((status) => ({ status, count: byStatus[status] }))
    .filter((s) => s.count > 0);

  return (
    <div className="flex-1 min-w-0">
      <div
        className="flex h-3 rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
        role="img"
        aria-label={
          segments
            .map((s) => `${s.count} ${STATUS_LABEL[s.status].toLowerCase()}`)
            .join(", ")
        }
      >
        {segments.map(({ status, count }) => (
          <span
            key={status}
            className={STATUS_COLOR[status]}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${STATUS_LABEL[status]}: ${count}`}
          />
        ))}
      </div>
      <p className="mt-1 flex gap-2 text-[10px] tabular text-[var(--color-ink-muted)]">
        {segments.map(({ status, count }) => (
          <span key={status} className="inline-flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${STATUS_COLOR[status]}`}
              aria-hidden
            />
            {count}
          </span>
        ))}
      </p>
    </div>
  );
}
