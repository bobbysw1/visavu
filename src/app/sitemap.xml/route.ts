import { SITE, SITEMAP_LASTMOD } from "@/lib/site";
import { getSitemapChunkCount } from "@/lib/sitemapUrls";

// Sitemap *index* at /sitemap.xml. The chunk handler at /sitemap/[id].xml
// serves the actual URL lists; this file just references them.
//
// Chunk count is derived from the total URL count divided by
// MAX_URLS_PER_CHUNK (~48k). We aim for 5-6 large chunks rather than
// hundreds of small ones — Google handles fewer-but-bigger sitemaps
// more efficiently and discovery completes faster.

export const dynamic = "force-static";
export const revalidate = 86400; // 1 day

export function GET() {
  const count = getSitemapChunkCount();
  // Stable build-time lastmod — see SITEMAP_LASTMOD doc in lib/site.ts.
  // Per-request `new Date()` made Google re-check every chunk daily,
  // burning crawl budget on revisits instead of new discoveries.
  const sitemaps = Array.from({ length: count }, (_, i) =>
    `<sitemap><loc>${SITE.url}/sitemap/${i}.xml</loc><lastmod>${SITEMAP_LASTMOD}</lastmod></sitemap>`,
  ).join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}</sitemapindex>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
