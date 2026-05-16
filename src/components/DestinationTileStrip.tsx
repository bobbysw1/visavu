import Link from "next/link";
import { getCountryPhotoSync } from "@/lib/pexels";
import { nameFor } from "@/lib/countries";

/**
 * Photo strip of popular destinations shown directly under the homepage
 * hero search. Each tile is a 4:3 photo with the country name overlaid —
 * gives the hero immediate visual weight without committing to a single
 * banner image, and gives crawlers + visitors a fast path into the
 * highest-traffic destination pages.
 *
 * Photos come from the existing public/heroes/ manifest — no extra
 * sourcing pipeline needed.
 */
const FEATURED_DESTINATIONS: string[] = [
  "JP", "PT", "TH", "MX", "IT", "AU", "ES", "GR",
];

export function DestinationTileStrip() {
  return (
    <div className="mt-12">
      <p className="kicker mb-3 text-left">Popular destinations</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {FEATURED_DESTINATIONS.map((iso) => {
          const photo = getCountryPhotoSync(iso);
          return (
            <Link
              key={iso}
              href={`/destination/${iso.toLowerCase()}`}
              prefetch={false}
              className="group relative aspect-[3/4] sm:aspect-[4/5] rounded-lg overflow-hidden ring-1 ring-black/10 dark:ring-white/10 hover:ring-2 hover:ring-[var(--color-ink)] transition"
            >
              {photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photo.url}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-sky-200 dark:from-emerald-900/60 dark:to-sky-900/60" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-semibold leading-tight drop-shadow truncate">
                {nameFor(iso)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
