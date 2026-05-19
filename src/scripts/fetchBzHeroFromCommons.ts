/**
 * One-off: refresh the BZ (Belize) hero image from Wikimedia Commons.
 *
 * The Pexels fetcher returned a generic ship's-porthole for "Great Blue
 * Hole Belize" because "hole" is a strong keyword. We added a defensive
 * blocklist so the broken entry falls back to the gradient hero, but
 * we'd rather have an actual Caribbean photo.
 *
 * Wikimedia Commons API requires no key and reliably returns large
 * freely-licensed photos for landmark queries. This script fetches
 * the Belize Wikipedia page's lead image (typically a curated Caribbean
 * scene) and writes it to public/heroes/bz.jpg + updates the manifest.
 *
 *   npx tsx src/scripts/fetchBzHeroFromCommons.ts
 */
import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";

const HEROES_DIR = path.resolve(process.cwd(), "public/heroes");
const MANIFEST_PATH = path.resolve(HEROES_DIR, "manifest.json");

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Visavu visa-lookup hero-fetch (contact@visavu.com)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Visavu visa-lookup hero-fetch (contact@visavu.com)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  // Use the Wikipedia "Great Blue Hole" article — its lead image is a known
  // Caribbean aerial photo (not the country flag). That's the canonical
  // Belize landmark.
  const summaryUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/Great_Blue_Hole";
  const summary = await fetchJson(summaryUrl) as {
    originalimage?: { source: string };
    thumbnail?: { source: string };
    description?: string;
  };
  const imageUrl = summary.originalimage?.source ?? summary.thumbnail?.source ?? null;
  if (!imageUrl) {
    console.error("Wikipedia 'Great Blue Hole' article has no lead image — abort.");
    process.exit(1);
  }
  const filename = decodeURIComponent(imageUrl.split("/").pop()!).replace(/^(\d+px-)?/, "");
  console.log(`Belize hero — Great Blue Hole lead image: ${imageUrl}`);
  console.log(`  Resolved filename: ${filename}`);
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url|user|extmetadata&origin=*`;
  const meta = await fetchJson(apiUrl) as {
    query?: { pages?: Record<string, { imageinfo?: Array<{ user?: string; descriptionurl?: string; extmetadata?: Record<string, { value?: string }> }> }> };
  };
  const pages = meta.query?.pages ?? {};
  const firstKey = Object.keys(pages)[0];
  const info = pages[firstKey]?.imageinfo?.[0];
  const photographer = info?.user ?? "Wikimedia Commons contributor";
  const sourceUrl = info?.descriptionurl ?? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`;
  const license = info?.extmetadata?.LicenseShortName?.value ?? "Free licence";

  // Download the image.
  const buf = await fetchBuffer(imageUrl);
  const destPath = path.resolve(HEROES_DIR, "bz.jpg");
  writeFileSync(destPath, buf);
  console.log(`✓ Wrote ${destPath} (${buf.length} bytes)`);

  // Update manifest.
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  manifest.BZ = {
    file: "/heroes/bz.jpg",
    pexelsId: 0, // not from Pexels
    photographer,
    photographerUrl: sourceUrl,
    pexelsUrl: sourceUrl,
    alt: `${summary.description ?? "Belize"} — ${filename.replace(/_/g, " ").replace(/\.\w+$/, "")} (${license}, via Wikimedia Commons)`,
    fetchedAt: new Date().toISOString(),
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`✓ Updated manifest entry for BZ`);
  console.log(`  Photographer: ${photographer}`);
  console.log(`  Source: ${sourceUrl}`);
  console.log(`  Licence: ${license}`);
  console.log(`  Alt: ${manifest.BZ.alt}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
