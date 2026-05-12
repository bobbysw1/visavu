import { COUNTRY_LIST } from "@/lib/countries";
import { SITE } from "@/lib/site";

// Sitemap *index* at /sitemap.xml. Next 15's generateSitemaps() emits chunk
// files at /sitemap/[id].xml but does NOT auto-emit an index that ties them
// together. Google needs a single discoverable sitemap URL referenced from
// robots.txt — that's this file.
//
// Each <sitemap> entry points at one chunk (one per origin country). When the
// chunk count changes, this file picks it up automatically because it reads
// from COUNTRY_LIST.

export const dynamic = "force-static";
export const revalidate = 86400; // 1 day

export function GET() {
  const lastmod = new Date().toISOString();
  const sitemaps = COUNTRY_LIST.map(
    (_, i) =>
      `<sitemap><loc>${SITE.url}/sitemap/${i}.xml</loc><lastmod>${lastmod}</lastmod></sitemap>`,
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
