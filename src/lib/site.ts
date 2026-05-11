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
