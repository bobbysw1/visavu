/**
 * World-map geometry JSON for the <WorldMap> client component.
 *
 * Returns the precomputed { width, height, countries: { iso2, name, pathD }[] }
 * tuple used by /passport/[iso] (and any future map view). Each pathD is a
 * d3-geo projection of a Natural Earth 110m country boundary — ~750KB of
 * SVG path text in total.
 *
 * Why an endpoint instead of inline:
 *   - Inlining puts the entire 750KB into every passport-page HTML response.
 *     That makes the HTML 1.16MB raw / 192KB gzipped, kills LCP, and wastes
 *     Googlebot's crawl budget on payload that doesn't change.
 *   - Fetching this endpoint client-side after hydration means the HTML
 *     ships at ~30KB and the map appears progressively. Google's bot
 *     doesn't run the map fetch — that's fine, the map is interactive eye
 *     candy and the SEO content is the visa-data text on the same page.
 *
 * Caching:
 *   - The geometry is deterministic — never changes between deploys (it's
 *     vendored Natural Earth). Year-long immutable cache is safe.
 *   - Vercel will cache at edge; the browser will cache in its HTTP cache.
 */
import { getWorldMapData } from "@/lib/worldMap";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  const data = getWorldMapData();
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      // 1 year, immutable — geometry is build-time vendored. Versioning
      // happens implicitly via Vercel's deploy hash; a new deploy gets a
      // new URL via Next.js's static-asset handling, so cache staleness
      // is impossible.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
