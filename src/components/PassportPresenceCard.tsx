/**
 * PassportPresenceCard — replaces the previous PassportCover.
 *
 * The old component rendered a stylised SVG "passport book" with gold
 * filigree, a fake biometric chip glyph, and the word "PASSPORT" in block
 * letters. That looked generic and untrustworthy — it shouted "stock
 * mockup" rather than "Visavu knows this country".
 *
 * The replacement uses the country's real Pexels-sourced travel photograph
 * (the same one that powers the route hero) behind a clean editorial
 * overlay: country name set in tight tracked uppercase, ISO code in a
 * monospace badge, the flag in a small ring, and a sub-label that reads
 * "Mobility identity" rather than mimicking embassy iconography.
 *
 * If the manifest is missing the country's photo we degrade to a neutral
 * gradient card with the same overlay — no broken UI, no placeholder
 * passport-book illustration.
 */
import { Flag } from "./Flag";
import { CountrySilhouette } from "./CountrySilhouette";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { getCountryPhotoSync } from "@/lib/pexels";

export function PassportPresenceCard({
  iso2,
  className = "",
  /** Aspect ratio of the card. Defaults to a portrait travel-card shape
   *  (similar to a boarding pass / identity card without mimicking a
   *  passport book). */
  aspectRatio = "3 / 4",
}: {
  iso2: string;
  className?: string;
  aspectRatio?: string;
}) {
  const upper = iso2.toUpperCase();
  const photo = getCountryPhotoSync(upper);
  const name = nameFor(upper);
  const adjective = nationalityFor(upper);

  return (
    <figure
      className={`relative overflow-hidden rounded-2xl ring-1 ring-black/10 dark:ring-white/10 shadow-xl bg-neutral-900 w-full ${className}`}
      style={{ aspectRatio }}
      aria-label={`${name} passport identity card`}
    >
      {/* Backdrop: real travel photograph if we have one, neutral gradient
          otherwise. The photo is darkened so foreground text always reads. */}
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt={photo.alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950" />
      )}

      {/* Three-stop overlay: subtle dim across the whole image, dense
          dark band at the bottom for the text block. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/85" />

      {/* Top row: ISO code badge (top-right), Visavu wordmark (top-left).
          Treats this like the corner of a boarding pass / travel card. */}
      <div className="absolute top-4 inset-x-4 flex items-start justify-between">
        <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-white/80">
          Mobility identity
        </span>
        <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-1 rounded bg-white/15 text-white backdrop-blur-sm ring-1 ring-white/20">
          {upper}
        </span>
      </div>

      {/* Country silhouette watermark — large, low-opacity, sits behind the
          text block. Authentic country shape rather than fake passport art.
          Sized with vw + max-width so it scales with the card. */}
      <div
        className="absolute right-[-8%] top-[8%] opacity-15 mix-blend-screen pointer-events-none"
        style={{ width: "75%", aspectRatio: "1 / 1" }}
      >
        <CountrySilhouette iso2={upper} size={400} tone="default" className="w-full h-full" />
      </div>

      {/* Editorial text block: bottom-anchored, generous tracking. */}
      <div className="absolute bottom-0 inset-x-0 p-5">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="rounded-sm overflow-hidden ring-1 ring-white/30 shadow">
            <Flag iso2={upper} size={22} />
          </span>
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/70">
            {adjective} passport
          </span>
        </div>
        <p className="font-bold text-white leading-[1.05] tracking-tight text-2xl sm:text-3xl">
          {name}
        </p>
        <p className="mt-2 text-[11px] text-white/60 leading-snug">
          Visa rules &amp; mobility profile sourced from official government data.
        </p>
      </div>

      {/* Photographer attribution — tiny, top-right edge of the photo region.
          Pexels licence doesn't require attribution but we credit anyway. */}
      {photo && (
        <p className="absolute top-12 right-4 text-[9px] tracking-wider uppercase text-white/50">
          Photo: {photo.photographer} · Pexels
        </p>
      )}
    </figure>
  );
}
