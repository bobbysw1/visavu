import { SITEMAP_LASTMOD } from "@/lib/site";
import {
  getSitemapChunk,
  getSitemapChunkCount,
} from "@/lib/sitemapUrls";

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

  const lastmod = SITEMAP_LASTMOD;
  const urls = slice
    .map(
      (u) =>
        `<url><loc>${u.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    )
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
