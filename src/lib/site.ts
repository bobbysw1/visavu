// Site-wide constants. Centralized so SEO routes (sitemap, OG, JSON-LD) and
// the layout pull from one source of truth.

export const SITE = {
  name: "Visavu",
  tagline: "Visa requirements between every passport and every country",
  description:
    "Check what visa you need to travel anywhere. Sourced from official government data, dated, with primary-source links and an honest confidence indicator. No upsell, no middleman.",
  // Override at deploy time via NEXT_PUBLIC_SITE_URL.
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://visavu.com",
  twitter: "@visavu", // placeholder until the handle is registered
  defaultLocale: "en",
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Stable `lastmod` timestamp emitted in sitemap entries.
 *
 * IMPORTANT: must NOT call `new Date()` per-request — Google reads the
 * sitemap on every crawl and a fresh "modified now" stamp on ~330k URLs
 * makes the bot think the entire site churns daily, which wastes the
 * crawl budget on re-checks and starves the discovery queue.
 *
 * Source-of-truth order:
 *   1. SITEMAP_LASTMOD env var (set by the nightly refresh workflow so
 *      lastmod bumps once a day when data genuinely refreshed)
 *   2. VERCEL_GIT_COMMIT_SHA presence → use build time (changes on deploy)
 *   3. Hardcoded fallback for local dev
 *
 * Bump the hardcoded fallback when you want a manual signal to crawlers.
 */
const FALLBACK_LASTMOD = "2026-05-17T00:00:00.000Z";

export const SITEMAP_LASTMOD: string =
  process.env.SITEMAP_LASTMOD ??
  (process.env.VERCEL_GIT_COMMIT_SHA ? new Date().toISOString() : FALLBACK_LASTMOD);
