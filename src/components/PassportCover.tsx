/**
 * Render a passport-book cover photo with the attribution Wikimedia
 * Commons requires. Falls back to a flag tile when no cover is supplied
 * for the country (fresh checkout, or the script couldn't find a
 * CC-licensed photo for that ISO).
 *
 * Two render sizes:
 *   - "thumb"   ~64×88, used in /passport-rankings rows
 *   - "collage" ~110×150, used in the passport collage hero
 *
 * Attribution: by default the artist + licence shows on hover via the
 * native `title` attribute (every CC image we ship is licensed for use
 * with attribution; the Commons URL satisfies the "must link" clause).
 * Set `showCaption` to render a small visible caption underneath.
 *
 * IMPORTANT: this is a client-safe component — it does NOT read the
 * passport-cover manifest from disk. Server components resolve the cover
 * via `lib/passportCovers.ts` and pass `cover` in as a prop. That keeps
 * `node:fs` out of the client bundle.
 */
import Link from "next/link";
import type { PassportCover as PassportCoverData } from "@/lib/passportCoverTypes";
import { flagEmoji, nameFor } from "@/lib/countries";

const SIZE_CLASSES = {
  thumb: "w-12 h-[68px] sm:w-14 sm:h-[80px]",
  collage: "w-full aspect-[3/4]",
} as const;

export function PassportCover({
  iso2,
  cover,
  size = "thumb",
  showCaption = false,
  linkToPassport = false,
  className = "",
}: {
  iso2: string;
  /** Pre-resolved cover data from `getPassportCover(iso2)` in a server
   *  component. When omitted the component renders the flag fallback. */
  cover?: PassportCoverData | null;
  size?: "thumb" | "collage";
  showCaption?: boolean;
  linkToPassport?: boolean;
  className?: string;
}) {
  const upper = iso2.toUpperCase();
  const name = nameFor(upper);

  // Wrap in a <Link> when the caller wants this card to navigate. Avoids
  // doing the wrap-or-not branching at every call site.
  const body = cover ? (
    <CoverImage cover={cover} iso2={upper} size={size} />
  ) : (
    <FallbackTile iso2={upper} size={size} />
  );

  const wrapperClass = `relative ${SIZE_CLASSES[size]} ${className}`;

  // Backplate ensures dark covers (most passports are deep blue or
  // burgundy) don't dissolve into the page bg. Intentionally LIGHT in
  // both themes — a cream-to-stone tone — so any cover photo has
  // something to read against. Drop shadow adds elevation so each book
  // reads as a discrete object, like a passport on a desk.
  const baseClass =
    "block rounded-sm overflow-hidden bg-stone-100 dark:bg-stone-300 " +
    "ring-1 ring-black/20 dark:ring-black/40 shadow-md " +
    "hover:ring-2 hover:ring-[var(--color-ink)] transition-shadow";

  if (linkToPassport) {
    return (
      <Link
        href={`/passport/${upper.toLowerCase()}`}
        prefetch={false}
        className={`${wrapperClass} ${baseClass}`}
        aria-label={`${name} passport`}
        title={cover ? `${name} passport — photo by ${cover.artist} · ${cover.licence}` : `${name} passport`}
      >
        {body}
        {showCaption && (
          <span className="absolute inset-x-0 bottom-0 px-1.5 py-1 text-[10px] uppercase tracking-wide font-semibold text-white bg-gradient-to-t from-black/80 to-transparent truncate">
            {name}
          </span>
        )}
      </Link>
    );
  }

  return (
    <span
      className={`${wrapperClass} inline-block ${baseClass}`}
      title={cover ? `${name} passport — photo by ${cover.artist} · ${cover.licence}` : `${name} passport`}
    >
      {body}
      {showCaption && (
        <span className="absolute inset-x-0 bottom-0 px-1.5 py-1 text-[10px] uppercase tracking-wide font-semibold text-white bg-gradient-to-t from-black/80 to-transparent truncate">
          {name}
        </span>
      )}
    </span>
  );
}

function CoverImage({
  cover,
  iso2,
  size,
}: {
  cover: PassportCoverData;
  iso2: string;
  size: "thumb" | "collage";
}) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={cover.url}
      alt={`${nameFor(iso2)} passport cover`}
      width={cover.width}
      height={cover.height}
      loading={size === "thumb" ? "lazy" : "eager"}
      decoding="async"
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

function FallbackTile({ iso2, size }: { iso2: string; size: "thumb" | "collage" }) {
  return (
    <span
      aria-hidden
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-slate-950"
    >
      <span className={size === "thumb" ? "text-2xl" : "text-5xl"}>{flagEmoji(iso2)}</span>
    </span>
  );
}

/**
 * Standalone attribution caption — render once per page when many
 * PassportCover thumbs appear together, to avoid repeating the artist
 * credit on every tile. CC-BY-SA wants attribution + a link to the
 * source/licence; this satisfies it in one line.
 */
export function PassportCoverCredit({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-[var(--color-ink-muted)] ${className}`}>
      Passport-cover photos sourced from{" "}
      <a
        href="https://commons.wikimedia.org/wiki/Category:Passports_by_country"
        target="_blank"
        rel="noreferrer noopener"
        className="underline underline-offset-2 hover:no-underline"
      >
        Wikimedia Commons
      </a>{" "}
      under Creative Commons / public-domain licences. Hover any cover to see
      its photographer and licence; click through to the Wikipedia page for full
      details.
    </p>
  );
}
