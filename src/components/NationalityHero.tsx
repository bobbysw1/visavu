/**
 * Hero block for nationality landing pages (/passport/[iso]).
 *
 * No photographs (no licensing risk, no bytes shipped). The "image" feel is
 * built from: a big Twemoji flag SVG, an animated gradient backdrop tinted
 * by a deterministic hash of the country code, and a stamped-passport SVG
 * pattern in the corner. Per-page colour without per-country curation.
 */
import { Flag } from "./Flag";
import { HeroLanguageToggle } from "./HeroLanguageToggle";
import { nationalityFor } from "@/lib/nationalities";
import { nameFor } from "@/lib/countries";
import { absoluteUrl } from "@/lib/site";
import type { CountryPhoto } from "@/lib/pexels";

/** Twelve curated gradient pairs. Pick one per passport via hash so the
 *  same country always renders the same colourway. All pairs are tuned for
 *  legibility against dark text. */
const PALETTES: Array<[string, string]> = [
  ["#fef3c7", "#fde68a"], // amber sand
  ["#fee2e2", "#fecaca"], // rose blush
  ["#dbeafe", "#bfdbfe"], // sky
  ["#dcfce7", "#bbf7d0"], // mint
  ["#ede9fe", "#ddd6fe"], // lavender
  ["#cffafe", "#a5f3fc"], // aqua
  ["#fce7f3", "#fbcfe8"], // peony
  ["#fef9c3", "#fef08a"], // citron
  ["#ffedd5", "#fed7aa"], // peach
  ["#f3e8ff", "#e9d5ff"], // orchid
  ["#e0f2fe", "#bae6fd"], // ice
  ["#fee4e2", "#fecdd3"], // coral
];

function paletteFor(iso2: string): [string, string] {
  let h = 0;
  for (let i = 0; i < iso2.length; i++) h = (h * 31 + iso2.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

export function NationalityHero({
  iso2,
  visaFreeCount,
  totalDestinations,
  photo,
}: {
  iso2: string;
  visaFreeCount?: number;
  totalDestinations?: number;
  /** Optional Pexels-sourced hero photo. When present, the hero renders a
   *  side-by-side photo panel; when null, falls back to the gradient. */
  photo?: CountryPhoto | null;
}) {
  const upper = iso2.toUpperCase();
  const [c1, c2] = paletteFor(upper);
  const name = nameFor(upper);
  const adjective = nationalityFor(upper);

  const pageUrl = absoluteUrl(`/passport/${upper.toLowerCase()}`);

  if (photo) {
    // Photographic hero — two-column on desktop (content + photo), stacked
    // on mobile (photo above content for visual hook).
    return (
      <section className="relative overflow-hidden rounded-2xl mb-6 sm:mb-8 border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        {/* Language toggle floats above both columns in the top-right of the
            hero (over the photo). */}
        <div className="absolute top-3 right-3 z-10">
          <HeroLanguageToggle iso2={upper} pageUrl={pageUrl} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-48 sm:h-64 md:h-auto md:min-h-[320px] order-1 md:order-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.alt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
            {/* Subtle overlay so text below stays legible if it wraps under
                the image on mobile, and adds an editorial finish. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <a
              href={photo.pexelsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="absolute bottom-2 right-2 text-[10px] uppercase tracking-wider font-semibold text-white/90 bg-black/35 backdrop-blur px-2 py-0.5 rounded hover:bg-black/55 transition"
            >
              Photo: {photo.photographer} · Pexels
            </a>
          </div>

          <div
            className="relative p-6 sm:p-8 lg:p-10 order-2 md:order-1 flex flex-col justify-center"
            style={{
              backgroundImage: `radial-gradient(70% 70% at 0% 100%, ${c1} 0%, transparent 60%), radial-gradient(60% 80% at 100% 0%, ${c2} 0%, transparent 55%)`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-md overflow-hidden shadow-sm ring-1 ring-black/5">
                <Flag iso2={upper} size={36} />
              </div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-700 dark:text-emerald-300">
                {adjective} passport
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-slate-900 dark:text-slate-50 mb-3">
              Where can you go on a {name} passport?
            </h1>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-snug">
              Visa rules, fees, and stay limits for every destination — sourced from official
              government data, with a direct link to each country&apos;s portal.
            </p>
            {(typeof visaFreeCount === "number" || typeof totalDestinations === "number") && (
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {typeof visaFreeCount === "number" && (
                  <div className="inline-flex items-baseline gap-1.5">
                    <dt className="text-slate-600 dark:text-slate-400">Visa-free or eTA:</dt>
                    <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                      {visaFreeCount}
                    </dd>
                  </div>
                )}
                {typeof totalDestinations === "number" && (
                  <div className="inline-flex items-baseline gap-1.5">
                    <dt className="text-slate-600 dark:text-slate-400">Destinations covered:</dt>
                    <dd className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {totalDestinations}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Fallback: gradient-and-flag hero (when Pexels is unavailable / no key /
  // a particular country returns no result).
  return (
    <section
      className="relative overflow-hidden rounded-2xl mb-6 sm:mb-8 border border-neutral-200/60 dark:border-neutral-800"
      style={{
        backgroundImage: `radial-gradient(70% 70% at 0% 0%, ${c1} 0%, transparent 55%), radial-gradient(60% 80% at 100% 0%, ${c2} 0%, transparent 55%), linear-gradient(180deg, #ffffff 0%, #ffffff 100%)`,
      }}
    >
      <div className="absolute top-3 right-3 z-10">
        <HeroLanguageToggle iso2={upper} pageUrl={pageUrl} /></div>
      <svg
        className="absolute -top-6 -right-6 opacity-[0.07] dark:opacity-[0.05] pointer-events-none"
        width="220"
        height="220"
        viewBox="0 0 220 220"
        aria-hidden="true"
      >
        <defs>
          <pattern id={`stamp-${upper}`} x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="24" cy="24" r="18" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="2 2" />
            <path d="M16 24 L22 30 L34 18" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </pattern>
        </defs>
        <rect width="220" height="220" fill={`url(#stamp-${upper})`} />
      </svg>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7 p-6 sm:p-8 lg:p-10">
        <div className="shrink-0 rounded-xl overflow-hidden shadow-md ring-1 ring-black/5">
          <Flag iso2={upper} size={88} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-700 dark:text-emerald-300 mb-1.5">
            {adjective} passport
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-slate-900 dark:text-slate-50 mb-3">
            Where can you go on a {name} passport?
          </h1>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-snug max-w-2xl">
            Visa rules, fees, and stay limits for every destination — sourced from official
            government data, with a direct link to each country&apos;s portal.
          </p>
          {(typeof visaFreeCount === "number" || typeof totalDestinations === "number") && (
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {typeof visaFreeCount === "number" && (
                <div className="inline-flex items-baseline gap-1.5">
                  <dt className="text-slate-600 dark:text-slate-400">Visa-free or eTA:</dt>
                  <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                    {visaFreeCount}
                  </dd>
                </div>
              )}
              {typeof totalDestinations === "number" && (
                <div className="inline-flex items-baseline gap-1.5">
                  <dt className="text-slate-600 dark:text-slate-400">Destinations covered:</dt>
                  <dd className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {totalDestinations}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
