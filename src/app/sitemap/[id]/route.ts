import { COUNTRY_LIST } from "@/lib/countries";
import { SITE } from "@/lib/site";

// Per-origin sitemap chunk: /sitemap/[id].xml — one chunk per origin passport.
// Each chunk emits ~1,400 URLs (273 pairs × 4 indexed purposes + 1 bare pair +
// 2 index pages), well under Google's 50,000-URL-per-sitemap limit.
//
// We use an explicit route handler (rather than Next's sitemap.ts convention)
// to fully control the response and avoid collision with the sitemap index at
// /sitemap.xml.

const INDEXED_PURPOSES = ["tourism", "work", "study", "business"] as const;

export const dynamic = "force-static";
export const revalidate = 86400;

export async function generateStaticParams() {
  return COUNTRY_LIST.map((_, i) => ({ id: `${i}.xml` }));
}

export function GET(_req: Request, { params }: { params: { id: string } }) {
  const idStr = params.id.replace(/\.xml$/, "");
  const id = Number.parseInt(idStr, 10);
  const origin = COUNTRY_LIST[id];
  if (!origin) {
    return new Response("Not found", { status: 404 });
  }

  const lastmod = new Date().toISOString();
  const lowerOrigin = origin.iso2.toLowerCase();
  const urls: string[] = [];

  // Static / home pages only emitted in chunk 0 to avoid duplication.
  if (id === 0) {
    for (const [path, freq, prio] of [
      ["/", "weekly", "1.0"],
      ["/about", "monthly", "0.4"],
      ["/sources", "monthly", "0.4"],
      ["/disclaimer", "monthly", "0.3"],
    ] as const) {
      urls.push(urlEntry(`${SITE.url}${path}`, lastmod, freq, prio));
    }
  }

  // Passport / destination index pages for this country.
  urls.push(
    urlEntry(`${SITE.url}/passport/${lowerOrigin}`, lastmod, "weekly", "0.7"),
    urlEntry(`${SITE.url}/destination/${lowerOrigin}`, lastmod, "weekly", "0.7"),
  );

  // Every passport → destination route, with high-search purpose variants.
  for (const dest of COUNTRY_LIST) {
    if (dest.iso2 === origin.iso2) continue;
    const lowerDest = dest.iso2.toLowerCase();
    urls.push(urlEntry(`${SITE.url}/${lowerOrigin}/${lowerDest}`, lastmod, "weekly", "0.6"));
    for (const purpose of INDEXED_PURPOSES) {
      urls.push(
        urlEntry(`${SITE.url}/${lowerOrigin}/${lowerDest}/${purpose}`, lastmod, "weekly", "0.5"),
      );
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}
