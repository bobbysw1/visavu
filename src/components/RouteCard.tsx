import Link from "next/link";
import { flagEmoji, nameFor } from "@/lib/countries";
import { routeHref } from "@/lib/routeHref";
import { getCountryPhotoSync } from "@/lib/pexels";

export function RouteCard({
  passport,
  destination,
  purpose,
  hint,
}: {
  passport: string;
  destination: string;
  purpose?: string;
  hint?: string;
}) {
  const href = routeHref(passport, destination, purpose);
  // Destination photo, lazy-resolved from the same manifest the country
  // pages use. Falls back to a gradient if the country isn't in the
  // manifest (e.g. fresh checkout before `fetch:heroes` has run).
  const photo = getCountryPhotoSync(destination);
  return (
    <Link
      href={href}
      prefetch={false}
      className="group relative block aspect-[5/4] rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 hover:ring-2 hover:ring-[var(--color-ink)] transition"
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-sky-300 dark:from-emerald-900/60 dark:to-sky-900/60" />
      )}
      {/* Bottom-anchored gradient so the text always stays legible no
          matter how bright the photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <div className="flex items-center gap-1.5 text-lg leading-none mb-1.5" aria-hidden>
          <span>{flagEmoji(passport)}</span>
          <span className="text-white/70 text-sm">→</span>
          <span>{flagEmoji(destination)}</span>
        </div>
        <p className="font-semibold text-sm leading-tight drop-shadow-sm truncate">
          {nameFor(passport)} → {nameFor(destination)}
        </p>
        {hint && (
          <p className="text-[11px] text-white/85 truncate mt-0.5">{hint}</p>
        )}
      </div>
    </Link>
  );
}
