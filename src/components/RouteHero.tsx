/**
 * RouteHero — the merged passport×destination hero on the result page.
 *
 * When both passport and destination have a Pexels-sourced hero photo in
 * the manifest, we render them side-by-side with a diagonal seam, the
 * flag chip floating over each panel, and a plane glyph tracking from
 * one to the other. Reads as "this is where you're coming from → this
 * is where you're going."
 *
 * When either photo is missing we degrade to a single-photo hero (or, if
 * both are missing, the existing flag → flag chip).
 */
import { Plane } from "lucide-react";
import { Flag } from "./Flag";
import type { CountryPhoto } from "@/lib/pexels";

export function RouteHero({
  passportIso2,
  destinationIso2,
  passportPhoto,
  destinationPhoto,
  title,
  subtitle,
}: {
  passportIso2: string;
  destinationIso2: string;
  passportPhoto: CountryPhoto | null;
  destinationPhoto: CountryPhoto | null;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  const p = passportIso2.toUpperCase();
  const d = destinationIso2.toUpperCase();

  // No photos at all → caller should render the existing minimal header.
  if (!passportPhoto && !destinationPhoto) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl mb-6 border border-neutral-200/60 dark:border-neutral-800 bg-neutral-900">
      {/* Two-column photo strip. The seam is a soft gradient mask so the
          two countries visually meld at the middle without a hard cut. */}
      <div className="relative grid grid-cols-2 h-56 sm:h-64 md:h-72">
        <div className="relative overflow-hidden">
          {passportPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={passportPhoto.url}
              alt={passportPhoto.alt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
          )}
          {/* Soft fade on the right edge so the seam blends into the
              destination panel. */}
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-black/40" />
        </div>
        <div className="relative overflow-hidden">
          {destinationPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={destinationPhoto.url}
              alt={destinationPhoto.alt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-bl from-slate-700 to-slate-900" />
          )}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-l from-transparent to-black/40" />
        </div>

        {/* Overall darken so the white text is legible on bright Pexels
            photos like Tokyo neon, Patagonia sunset, Santorini noon. */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-black/25 to-black/30" />

        {/* Plane glyph in the middle. Sits on a small white pill so it
            pops against any photo combination. */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/95 dark:bg-white/95 shadow-lg ring-1 ring-black/10 backdrop-blur">
            <Plane
              size={22}
              aria-hidden="true"
              className="text-slate-800 rotate-90"
            />
          </div>
        </div>

        {/* Flag chips overlaid in the lower corners. */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/95 dark:bg-white/95 shadow-md ring-1 ring-black/10 backdrop-blur">
          <div className="rounded-sm overflow-hidden ring-1 ring-black/5">
            <Flag iso2={p} size={18} />
          </div>
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
            {p}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/95 dark:bg-white/95 shadow-md ring-1 ring-black/10 backdrop-blur">
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
            {d}
          </span>
          <div className="rounded-sm overflow-hidden ring-1 ring-black/5">
            <Flag iso2={d} size={18} />
          </div>
        </div>

        {/* Pexels attribution — kept small and unobtrusive. Both
            photographers credited if both photos came from the manifest. */}
        {(passportPhoto || destinationPhoto) && (
          <p className="absolute top-2 right-3 z-10 text-[10px] font-medium uppercase tracking-wider text-white/70">
            {passportPhoto && destinationPhoto ? (
              <>
                Photos: {passportPhoto.photographer}, {destinationPhoto.photographer} · Pexels
              </>
            ) : (
              <>
                Photo: {(passportPhoto ?? destinationPhoto)!.photographer} · Pexels
              </>
            )}
          </p>
        )}
      </div>

      {/* Headline below the photo strip, on a neutral-dark surface so the
          contrast continues from the photo overlay. */}
      <div className="px-5 sm:px-7 py-5 sm:py-6 bg-white dark:bg-neutral-950">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.1] text-slate-900 dark:text-slate-50">
          {title}
        </h1>
        {subtitle && (
          <div className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            {subtitle}
          </div>
        )}
      </div>
    </section>
  );
}
