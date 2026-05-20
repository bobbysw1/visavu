/**
 * PassportPresenceCard — sidebar hero on /passport/[iso].
 *
 * Renders the country's actual passport cover as the dominant visual,
 * framed in a card with the global mobility ranking surfaced beneath.
 * Earlier iterations of this component used a Pexels travel photo as the
 * background — pretty but visually arbitrary, didn't convey "what does
 * this passport actually look like." Showing the real cover makes the
 * card feel like a credential, not a travel ad, and the ranking +
 * visa-free count anchor the page's headline mobility story right at
 * the top of the sidebar rather than buried in a separate "Passport
 * Strength" block below.
 *
 * Graceful fallbacks:
 *   - No passport cover in our manifest (blocklisted or non-issuing
 *     territory) → travel-photo fallback with the same chrome, so the
 *     card never breaks.
 *   - No coverage data → ranking row simply doesn't render; the cover
 *     image + identity copy still do.
 */
import { Flag } from "./Flag";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { getPassportCover } from "@/lib/passportCovers";
import { getCountryPhotoSync } from "@/lib/pexels";

export function PassportPresenceCard({
  iso2,
  className = "",
  /** Pre-computed global mobility rank (e.g. 2 = world's 2nd-strongest
   *  passport by visa-free access). null when we don't have ranking
   *  data — the ranking strip simply doesn't render. */
  globalRank = null,
  /** How many passports are ranked in total — used as the denominator
   *  ("#2 of 199"). */
  totalRanked = null,
  /** Visa-free + eTA destination count for this passport. Surfaced as
   *  the secondary metric beneath the rank ordinal. */
  visaFreeCount = null,
}: {
  iso2: string;
  className?: string;
  globalRank?: number | null;
  totalRanked?: number | null;
  visaFreeCount?: number | null;
}) {
  const upper = iso2.toUpperCase();
  const cover = getPassportCover(upper);
  const photoFallback = !cover ? getCountryPhotoSync(upper) : null;
  const name = nameFor(upper);
  const adjective = nationalityFor(upper);

  return (
    <figure
      className={`flex flex-col rounded-2xl ring-1 ring-black/10 dark:ring-white/10 shadow-lg bg-white dark:bg-neutral-950 overflow-hidden ${className}`}
      aria-label={`${name} passport identity card`}
    >
      {/* Header bar — eyebrow label + ISO code, sits ABOVE the cover image
          rather than overlaid so the cover stays clean. */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60">
        <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-neutral-500 dark:text-neutral-400">
          Mobility identity
        </span>
        <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
          {upper}
        </span>
      </header>

      {/* Cover image — the dominant visual. Letterboxed inside a darker
          frame so passport covers of varying aspect ratios all sit
          consistently. object-contain (not cover) so the whole document
          stays visible — passport covers are designed to be seen whole. */}
      <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center p-6" style={{ aspectRatio: "3 / 4" }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={`${name} passport cover`}
            className="max-h-full max-w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.45)]"
            loading="lazy"
            decoding="async"
          />
        ) : photoFallback ? (
          // No passport-cover photo in our manifest (blocklisted iso or
          // non-issuing territory). Fall back to the country's travel
          // photograph so the card never breaks visually.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoFallback.url}
            alt={photoFallback.alt}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/80">
            <Flag iso2={upper} size={40} />
            <span className="text-xs">No cover image available</span>
          </div>
        )}
      </div>

      {/* Identity row — flag + country, sits below the cover. */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded-sm overflow-hidden ring-1 ring-black/10 dark:ring-white/15">
            <Flag iso2={upper} size={18} />
          </span>
          <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400">
            {adjective} passport
          </span>
        </div>
        <p className="font-bold text-[var(--color-ink)] tracking-tight text-xl leading-tight">
          {name}
        </p>
      </div>

      {/* Ranking strip — only when we have a global rank. Big tabular
          numeral for the rank ordinal, visa-free count beneath it. The
          card no longer needs a separate "Passport Strength" block in
          the sidebar; this row is the answer to "how strong is this
          passport". */}
      {globalRank !== null && totalRanked !== null && (
        <div className="mx-4 mb-4 mt-1 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-emerald-800/80 dark:text-emerald-300/80">
              Global rank
            </span>
            <span className="text-[10px] tabular-nums text-emerald-800/70 dark:text-emerald-300/70">
              of {totalRanked}
            </span>
          </div>
          <p className="text-3xl font-bold tabular-nums text-emerald-800 dark:text-emerald-200 leading-none mt-0.5">
            #{globalRank}
          </p>
          {visaFreeCount !== null && (
            <p className="text-[11px] text-emerald-900/70 dark:text-emerald-100/70 mt-1.5 leading-snug">
              <strong className="tabular-nums">{visaFreeCount}</strong> destinations open visa-free or with an eTA
            </p>
          )}
        </div>
      )}

      {/* Cover attribution — tiny line at the bottom, on by default for
          passport covers (Wikimedia/Commons licence terms vary). */}
      {cover && (cover.artist || cover.licence) && (
        <p className="px-4 pb-3 text-[9px] tracking-wider uppercase text-neutral-400 dark:text-neutral-600 leading-snug">
          Cover: {cover.artist ?? "public domain"}
          {cover.licence ? ` · ${cover.licence}` : ""}
        </p>
      )}
    </figure>
  );
}
