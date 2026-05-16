/**
 * Reusable page hero — the banner block at the top of editorial / utility
 * pages that don't otherwise have a hero of their own (about, methodology,
 * sources, contact, find-my-visa).
 *
 * Two variants:
 *   - "banner" (default): ~280px tall, image on the right, text on the left.
 *     Used on text-led pages so the photo accents without dominating.
 *   - "full":  ~440px tall, image as full-bleed background with text
 *     overlaid. Used when the page wants the photo to lead.
 *
 * Image comes from the existing /heroes/{iso}.jpg manifest — same source
 * the passport / destination pages already use — so we don't duplicate
 * sourcing or attribution work. Pexels licence allows commercial use
 * without attribution; we still credit the photographer in a small chip
 * (matching how NationalityHero handles it).
 */
import Image from "next/image";
import { getCountryPhotoSync } from "@/lib/pexels";

export function PageHero({
  kicker,
  title,
  subtitle,
  heroIso2,
  variant = "banner",
  accent,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  /** ISO2 to pull the backdrop photo from `/public/heroes/`. */
  heroIso2: string;
  variant?: "banner" | "full";
  /** Optional accent character / punctuation appended to the title in
   *  brand-accent colour (e.g. ".", "?"). Matches the homepage hero. */
  accent?: string;
}) {
  const photo = getCountryPhotoSync(heroIso2);

  if (variant === "full") {
    return (
      <section className="relative overflow-hidden rounded-2xl mb-10 sm:mb-12 ring-1 ring-black/5 dark:ring-white/10 min-h-[280px] sm:min-h-[400px] lg:min-h-[440px] flex items-end">
        {photo ? (
          <>
            {/* PageHero is the LCP candidate on /about, /methodology,
                /sources, /contact, /find-my-visa, /finder — give it
                `priority` so Next emits a preload + WebP srcset. */}
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              priority
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
            <a
              href={photo.pexelsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold text-white bg-black/70 backdrop-blur px-2 py-1 rounded shadow hover:bg-black/85 transition"
            >
              Photo: {photo.photographer} · Pexels
            </a>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-sky-700 to-violet-700" />
        )}
        <div className="relative p-6 sm:p-10 lg:p-12 max-w-3xl text-white">
          {kicker && (
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold text-white/80 mb-3">
              {kicker}
            </p>
          )}
          <h1 className="serif-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight mb-3 drop-shadow-sm">
            {title}
            {accent && <span className="text-[var(--color-accent)]">{accent}</span>}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl drop-shadow-sm">
              {subtitle}
            </p>
          )}
        </div>
      </section>
    );
  }

  // Banner variant — split layout, photo accent.
  return (
    <section className="relative overflow-hidden rounded-2xl mb-10 sm:mb-12 ring-1 ring-black/5 dark:ring-white/10 grid grid-cols-1 sm:grid-cols-[1fr_minmax(0,40%)] min-h-[220px]">
      <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-[var(--color-paper-elev)]">
        {kicker && <p className="kicker mb-3">{kicker}</p>}
        <h1 className="serif-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.05] tracking-tight mb-3">
          {title}
          {accent && <span className="text-[var(--color-accent)]">{accent}</span>}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg text-[var(--color-ink)]/85 leading-relaxed max-w-prose">
            {subtitle}
          </p>
        )}
      </div>
      <div className="relative min-h-[160px] sm:min-h-0">
        {photo ? (
          <>
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              priority
              sizes="(min-width: 640px) 40vw, 100vw"
              className="object-cover"
            />
            <a
              href={photo.pexelsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="absolute bottom-2 right-2 text-[10px] uppercase tracking-wider font-semibold text-white bg-black/70 backdrop-blur px-2 py-1 rounded shadow hover:bg-black/85 transition"
            >
              {photo.photographer}
            </a>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 via-sky-200 to-violet-200 dark:from-emerald-900/60 dark:via-sky-900/60 dark:to-violet-900/60" />
        )}
      </div>
    </section>
  );
}
