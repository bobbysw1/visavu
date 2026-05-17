import { SITEMAP_LASTMOD } from "@/lib/site";
import {
  getSitemapChunk,
  getSitemapChunkCount,
} from "@/lib/sitemapUrls";
import {
  getLastmodByPassport,
  getLastmodByDestination,
} from "@/lib/sitemapLastmod";

// Per-chunk sitemap at /sitemap/[id].xml. Each chunk is a flat slice of
// the full URL list (see lib/sitemapUrls.ts). With ~236k total URLs and
// MAX_URLS_PER_CHUNK = 48k, that's typically 5 chunks.
//
// Switched from "one chunk per origin passport (236 tiny chunks)" to
// "MAX-sized flat slices (5 big chunks)" on 2026-05-17 — Google reads
// fewer, larger sitemaps faster and discovery improved.

export const dynamic = "force-static";
export const revalidate = 86400;

export async function generateStaticParams() {
  // Static-generate every chunk index at build time. Count is derived
  // from total URLs / MAX_URLS_PER_CHUNK so the number of chunks tracks
  // content growth automatically.
  const count = getSitemapChunkCount();
  return Array.from({ length: count }, (_, i) => ({ id: `${i}.xml` }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const idStr = idParam.replace(/\.xml$/, "");
  const id = Number.parseInt(idStr, 10);
  if (!Number.isFinite(id)) {
    return new Response("Not found", { status: 404 });
  }
  const slice = getSitemapChunk(id);
  if (!slice) {
    return new Response("Not found", { status: 404 });
  }

  // DB-derived per-bucket lastmods. Each helper returns an empty map on
  // DB failure (fresh checkout, PGlite not bootstrapped) and the URL
  // falls back to SITEMAP_LASTMOD — safe degraded behaviour.
  const [byPassport, byDestination] = await Promise.all([
    getLastmodByPassport(),
    getLastmodByDestination(),
  ]);

  // Inner XML escaper for the user-facing strings we inject into
  // <image:title> / <image:caption>. Photographer names sometimes
  // contain `&` and Wikimedia alt text occasionally has `<` characters
  // from broken markdown — both would invalidate the XML.
  const xmlEscape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const urls = slice
    .map((u) => {
      let lastmod = SITEMAP_LASTMOD;
      if (u.lastmodKey.startsWith("passport:")) {
        const iso = u.lastmodKey.slice("passport:".length);
        lastmod = byPassport[iso] ?? SITEMAP_LASTMOD;
      } else if (u.lastmodKey.startsWith("destination:")) {
        const iso = u.lastmodKey.slice("destination:".length);
        lastmod = byDestination[iso] ?? SITEMAP_LASTMOD;
      }
      const imageXml = (u.images ?? [])
        .map((img) => {
          const parts = [`<image:loc>${img.loc}</image:loc>`];
          if (img.title) parts.push(`<image:title>${xmlEscape(img.title)}</image:title>`);
          if (img.caption) parts.push(`<image:caption>${xmlEscape(img.caption)}</image:caption>`);
          return `<image:image>${parts.join("")}</image:image>`;
        })
        .join("");
      return `<url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority>${imageXml}</url>`;
    })
    .join("");

  // xmlns:image declares the Image Sitemap extension. Required to
  // surface the <image:*> elements above to Google's image index.
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
