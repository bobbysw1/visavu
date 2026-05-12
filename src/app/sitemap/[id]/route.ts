import { COUNTRY_LIST } from "@/lib/countries";
import { SITE } from "@/lib/site";
import { HAND_WRITTEN_ROUTES } from "@/content/routeAdvice";

// Per-origin sitemap chunk: /sitemap/[id].xml — one chunk per origin passport.
// Each chunk emits ~1,400 URLs (273 pairs × 4 indexed purposes + 1 bare pair +
// 2 index pages), well under Google's 50,000-URL-per-sitemap limit.
//
// We use an explicit route handler (rather than Next's sitemap.ts convention)
// to fully control the response and avoid collision with the sitemap index at
// /sitemap.xml.

// High-search purpose URLs that every (passport, destination) pair gets in
// the sitemap. Tourism is INTENTIONALLY OMITTED here — it canonicalises to
// the bare pair URL (/ca/au, not /ca/au/tourism) so the sitemap would
// otherwise contain ~75k non-canonical URLs that Google would consolidate
// and flag as "Alternate page with proper canonical tag." The bare pair URL
// already covers the tourism case.
const INDEXED_PURPOSES = ["work", "study", "business"] as const;

// Hand-written purpose URLs additionally get sitemap inclusion for ALL 7
// purposes (transit / family / diplomatic) because their content is
// genuinely route-specific. Indexed by passport-lowercase for fast lookup
// per chunk.
const HAND_WRITTEN_BY_ORIGIN: Map<string, Array<{ destination: string; purpose: string }>> = (() => {
  const map = new Map<string, Array<{ destination: string; purpose: string }>>();
  for (const r of HAND_WRITTEN_ROUTES) {
    // Skip if already covered by INDEXED_PURPOSES — those are emitted anyway.
    if ((INDEXED_PURPOSES as readonly string[]).includes(r.purpose)) continue;
    const list = map.get(r.passport) ?? [];
    list.push({ destination: r.destination, purpose: r.purpose });
    map.set(r.passport, list);
  }
  return map;
})();

export const dynamic = "force-static";
export const revalidate = 86400;

export async function generateStaticParams() {
  return COUNTRY_LIST.map((_, i) => ({ id: `${i}.xml` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const idStr = idParam.replace(/\.xml$/, "");
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
      ["/find-my-visa", "weekly", "0.7"],
      ["/services", "weekly", "0.6"],
      ["/services/travel-insurance", "weekly", "0.5"],
      ["/services/health-insurance", "weekly", "0.5"],
      ["/services/vaccinations", "weekly", "0.5"],
      ["/services/biometrics", "weekly", "0.5"],
      ["/services/medical-checks", "weekly", "0.5"],
      ["/services/passport-photos", "weekly", "0.5"],
      ["/services/legal-services", "weekly", "0.5"],
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

  // Hand-written non-indexed-purpose URLs from this origin (transit / family /
  // diplomatic only — work/study/tourism/business already emitted above).
  // Higher priority because the content is genuinely route-specific.
  const handWritten = HAND_WRITTEN_BY_ORIGIN.get(lowerOrigin) ?? [];
  for (const { destination, purpose } of handWritten) {
    urls.push(
      urlEntry(
        `${SITE.url}/${lowerOrigin}/${destination}/${purpose}`,
        lastmod,
        "monthly",
        "0.6",
      ),
    );
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
