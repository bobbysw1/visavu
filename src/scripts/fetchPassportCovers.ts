/**
 * Fetch a passport-book cover photo for every country in COUNTRY_LIST from
 * Wikimedia Commons via the Wikipedia REST API and save it server-side to
 * public/passports/{ISO2}.jpg, with a manifest at
 * public/passports/manifest.json recording the licence + attribution that
 * Commons requires us to surface on every render.
 *
 *   npx tsx src/scripts/fetchPassportCovers.ts          # incremental
 *   npx tsx src/scripts/fetchPassportCovers.ts --force  # re-fetch all
 *   npx tsx src/scripts/fetchPassportCovers.ts --only=US,GB,JP
 *
 * Source: Wikipedia article "X passport" / "Passport of X" / "Passport of
 * the X". Most articles have a lead image (the passport-cover photograph)
 * that comes from Wikimedia Commons under a Creative Commons or public
 * domain licence. We pull:
 *   - the original-resolution URL via the page summary endpoint
 *   - the Commons file metadata (licence short-name, artist, file page URL)
 * and store both so the UI can attribute the photographer / illustrator.
 *
 * No API key required. Wikimedia asks for a descriptive User-Agent so they
 * can contact us if a script misbehaves.
 *
 * Failure modes are deliberately soft: missing images fall back to a
 * country-flag tile in the UI. A failure on one ISO never blocks the rest.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { COUNTRY_LIST, nameFor } from "../lib/countries";
import { nationalityFor } from "../lib/nationalities";

const DIR = path.resolve(process.cwd(), "public/passports");
const MANIFEST_PATH = path.resolve(DIR, "manifest.json");
const FORCE = process.argv.includes("--force");
const ONLY = (() => {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return null;
  return new Set(arg.slice("--only=".length).split(",").map((s) => s.trim().toUpperCase()));
})();

const USER_AGENT =
  "VisavuBot/1.0 (+https://visavu.com; contact@visavu.com) passport-cover fetcher";

type ManifestEntry = {
  file: string; // path relative to /public, e.g. "/passports/jp.jpg"
  source: string; // Wikipedia article URL
  commonsFile: string; // Commons file-page URL
  artist: string; // attribution string (may include HTML — strip for display)
  licence: string; // licence short name (e.g. "CC BY-SA 4.0", "PD")
  licenceUrl: string | null;
  width: number;
  height: number;
  fetchedAt: string;
};
type Manifest = Record<string, ManifestEntry>;

function loadManifest(): Manifest {
  if (!existsSync(MANIFEST_PATH)) return {};
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
  } catch {
    return {};
  }
}

function saveManifest(m: Manifest) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2));
}

/** Article titles to try in order. Most reliable forms first. */
function candidateTitles(iso2: string): string[] {
  const country = nameFor(iso2);
  const nat = nationalityFor(iso2);
  const titles = new Set<string>();
  if (nat) titles.add(`${nat} passport`);
  titles.add(`Passport of ${country}`);
  titles.add(`Passport of the ${country}`);
  return Array.from(titles);
}

type WikiSummary = {
  title: string;
  content_urls?: { desktop?: { page?: string } };
  originalimage?: { source: string; width: number; height: number };
  thumbnail?: { source: string; width: number; height: number };
};

async function fetchSummary(title: string): Promise<WikiSummary | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!res.ok) return null;
  return (await res.json()) as WikiSummary;
}

/** Extract the Commons filename ("File:Foo.jpg") from a thumbnail or
 *  original URL. Returns null if the URL isn't a Commons upload. */
function commonsFilename(url: string): string | null {
  // Examples:
  //   https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Foo.jpg/640px-Foo.jpg
  //   https://upload.wikimedia.org/wikipedia/commons/3/3a/Foo.jpg
  //   https://upload.wikimedia.org/wikipedia/en/3/3a/Foo.jpg  ← NOT commons
  const m = url.match(/\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+?\.(?:jpg|jpeg|png|svg|webp))(?:\/|$)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

type CommonsImageInfo = {
  url: string;
  width: number;
  height: number;
  extmetadata?: {
    LicenseShortName?: { value: string };
    LicenseUrl?: { value: string };
    Artist?: { value: string };
    AttributionRequired?: { value: string };
    Restrictions?: { value: string };
  };
  descriptionurl: string;
};

async function fetchImageInfo(filename: string): Promise<CommonsImageInfo | null> {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo" +
    "&iiprop=url|size|extmetadata&iiurlwidth=1024&origin=*" +
    `&titles=${encodeURIComponent("File:" + filename)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    query?: { pages?: Record<string, { imageinfo?: CommonsImageInfo[] }> };
  };
  const pages = data.query?.pages;
  if (!pages) return null;
  const first = Object.values(pages)[0];
  return first?.imageinfo?.[0] ?? null;
}

async function downloadImage(imageUrl: string, dest: string): Promise<void> {
  const res = await fetch(imageUrl, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

/** Wikimedia returns Artist as HTML — strip tags + collapse whitespace
 *  so the UI can render it as plain text. Keep <a href> targets via a
 *  simple text extraction; UI links separately via the commonsFile URL. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Restrict to Creative Commons / public domain. Anything else we
 *  explicitly skip so we never ship copyrighted material. */
function isFreeLicence(licence: string): boolean {
  return /^(cc[\s-]|public domain|cc0|pdm|attribution)/i.test(licence) || /pd-/i.test(licence);
}

/** Search Commons category "Passports of {Country}" for any CC-licensed
 *  file. The lead image of the Wikipedia article is often fair-use only
 *  (hosted on en.wikipedia, not Commons) — but the category itself
 *  usually has freely-licensed alternates. This is what rescues the
 *  countries the page-summary path missed (GB, CA, NZ, GR, KR, CH, FI). */
type CategoryMember = { title: string };

/**
 * Smart ranker for Commons filenames. Prefers explicit passport-cover
 * photos over stamps, coats of arms, inner-page scans, visas, etc. The
 * page-summary strategy regularly picks the lead image which is often
 * a stamp or emblem; this ranker rescues the category fallback by
 * sorting candidates intelligently before picking.
 */
function rankCommonsFile(filename: string): number {
  const lower = filename.toLowerCase();
  let score = 0;

  // Strong positive — explicit cover / front-of-passport indicators
  if (/\bcover\b/.test(lower)) score += 120;
  if (/\bfront\b/.test(lower)) score += 90;
  if (/\bpassport_?cover\b/.test(lower)) score += 150;
  if (/\bbiometric\b/.test(lower)) score += 60;
  if (/\bnew_?passport\b/.test(lower)) score += 80;
  if (/^passport_/.test(lower) || / passport\.(jpe?g|png|webp)$/.test(lower)) score += 50;

  // Generic positive
  if (/passport/.test(lower)) score += 30;

  // Negative — things that aren't a passport cover photo
  if (/\bpage\b/.test(lower)) score -= 100;
  if (/\bstamp\b/.test(lower) || /\bvisa\b/.test(lower)) score -= 100;
  if (/coat[_-]?of[_-]?arms|emblem|seal|crest|logo|map\b/.test(lower)) score -= 150;
  if (/\binside\b|\bbio[_-]?page\b|\bdata[_-]?page\b/.test(lower)) score -= 80;
  if (/\bspecimen\b|\bblank\b/.test(lower)) score -= 30;
  if (/\bdiplomatic\b|\bofficial\b|\bservice\b/.test(lower)) score -= 40;
  if (/\bvintage\b|\bhistoric|\b19\d\d\b|\b18\d\d\b|\b20[01]\d\b/.test(lower)) score -= 30;

  // Format preferences — actual photos win over SVG icons
  if (/\.svg$/i.test(filename)) score -= 60;
  if (/\.jpe?g$/i.test(filename)) score += 15;
  if (/\.png$/i.test(filename)) score += 5;

  return score;
}

async function commonsCategoryFiles(country: string): Promise<string[]> {
  const variants = [
    `Category:Passports of ${country}`,
    `Category:Passports of the ${country}`,
    `Category:${country} passports`,
  ];
  for (const cat of variants) {
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
      "&list=categorymembers&cmtype=file&cmlimit=50" +
      `&cmtitle=${encodeURIComponent(cat)}`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) continue;
    const data = (await res.json()) as { query?: { categorymembers?: CategoryMember[] } };
    const members = data.query?.categorymembers ?? [];
    if (members.length === 0) continue;
    const files = members
      .map((m) => m.title.replace(/^File:/, ""))
      .filter((f) => /\.(jpe?g|png|webp|svg)$/i.test(f))
      .sort((a, b) => rankCommonsFile(b) - rankCommonsFile(a));
    if (files.length > 0) return files;
  }
  return [];
}

/**
 * Strategy 3 — broad Commons file-namespace search.
 * Rescues passports whose category is empty or mis-named (Equatorial
 * Guinea, Kiribati, etc.). The smart ranker keeps stamp/page hits
 * down-weighted vs actual cover photos.
 */
async function commonsSearchFiles(country: string): Promise<string[]> {
  const queries = [
    `${country} passport cover`,
    `Passport of ${country}`,
    `${country} biometric passport`,
  ];
  const seen = new Set<string>();
  const collected: string[] = [];
  for (const q of queries) {
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
      "&list=search&srnamespace=6&srlimit=20" +
      `&srsearch=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) continue;
    const data = (await res.json()) as { query?: { search?: { title: string }[] } };
    for (const hit of data.query?.search ?? []) {
      const filename = hit.title.replace(/^File:/, "");
      if (!/\.(jpe?g|png|webp)$/i.test(filename)) continue;
      // Defensive — require the country name to appear in the filename
      // so we don't pull a UK passport cover when querying for Kiribati.
      const cleanCountry = country.toLowerCase().replace(/[^a-z]+/g, "_");
      if (!filename.toLowerCase().replace(/[^a-z]+/g, "_").includes(cleanCountry.split("_")[0])) {
        continue;
      }
      if (seen.has(filename)) continue;
      seen.add(filename);
      collected.push(filename);
    }
  }
  return collected.sort((a, b) => rankCommonsFile(b) - rankCommonsFile(a));
}

async function fetchOne(iso2: string): Promise<ManifestEntry | null> {
  // Strategy 1: page-summary lead image (works when it's Commons-hosted).
  const titles = candidateTitles(iso2);
  for (const title of titles) {
    const summary = await fetchSummary(title);
    if (!summary) continue;
    const imgUrl = summary.originalimage?.source ?? summary.thumbnail?.source;
    if (!imgUrl) continue;
    const filename = commonsFilename(imgUrl);
    if (!filename) continue;

    const info = await fetchImageInfo(filename);
    if (!info) continue;

    const licence = info.extmetadata?.LicenseShortName?.value ?? "Unknown";
    const licenceUrl = info.extmetadata?.LicenseUrl?.value ?? null;
    const artistHtml = info.extmetadata?.Artist?.value ?? "";
    const artist = plainText(artistHtml) || "Unknown";

    if (!isFreeLicence(licence)) {
      console.log(`  - ${iso2} lead-image non-free (${licence}), trying category fallback`);
      break; // fall through to category search
    }

    const dest = path.resolve(DIR, `${iso2.toLowerCase()}.jpg`);
    // Use the resized 1024px-wide thumb URL where available (info.url is
    // resized when iiurlwidth is set); otherwise fall back to original.
    await downloadImage(info.url, dest);

    return {
      file: `/passports/${iso2.toLowerCase()}.jpg`,
      source: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      commonsFile: info.descriptionurl,
      artist,
      licence,
      licenceUrl,
      width: info.width,
      height: info.height,
      fetchedAt: new Date().toISOString(),
    };
  }

  // Strategy 2: Commons category fallback (smart-ranked).
  const country = nameFor(iso2);
  const files = await commonsCategoryFiles(country);
  for (const filename of files) {
    const info = await fetchImageInfo(filename);
    if (!info) continue;
    const licence = info.extmetadata?.LicenseShortName?.value ?? "Unknown";
    if (!isFreeLicence(licence)) continue;
    const licenceUrl = info.extmetadata?.LicenseUrl?.value ?? null;
    const artistHtml = info.extmetadata?.Artist?.value ?? "";
    const artist = plainText(artistHtml) || "Unknown";

    const dest = path.resolve(DIR, `${iso2.toLowerCase()}.jpg`);
    await downloadImage(info.url, dest);

    return {
      file: `/passports/${iso2.toLowerCase()}.jpg`,
      source: `https://commons.wikimedia.org/wiki/Category:Passports_of_${encodeURIComponent(country)}`,
      commonsFile: info.descriptionurl,
      artist,
      licence,
      licenceUrl,
      width: info.width,
      height: info.height,
      fetchedAt: new Date().toISOString(),
    };
  }

  // Strategy 3: broad Commons search — catches passports whose category
  // is empty or mis-named (Equatorial Guinea, Kiribati, etc.).
  const searchFiles = await commonsSearchFiles(country);
  for (const filename of searchFiles) {
    const info = await fetchImageInfo(filename);
    if (!info) continue;
    const licence = info.extmetadata?.LicenseShortName?.value ?? "Unknown";
    if (!isFreeLicence(licence)) continue;
    const licenceUrl = info.extmetadata?.LicenseUrl?.value ?? null;
    const artistHtml = info.extmetadata?.Artist?.value ?? "";
    const artist = plainText(artistHtml) || "Unknown";

    const dest = path.resolve(DIR, `${iso2.toLowerCase()}.jpg`);
    await downloadImage(info.url, dest);

    return {
      file: `/passports/${iso2.toLowerCase()}.jpg`,
      source: `https://commons.wikimedia.org/wiki/Special:Search?search=${encodeURIComponent(country + " passport cover")}`,
      commonsFile: info.descriptionurl,
      artist,
      licence,
      licenceUrl,
      width: info.width,
      height: info.height,
      fetchedAt: new Date().toISOString(),
    };
  }

  return null;
}

async function main() {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
  const manifest = loadManifest();

  // Wikipedia / Commons are public; no API key required. Their etiquette
  // doc asks for sub-200req/sec from one client — we pace at 300ms which
  // is well under the cap and keeps us a polite citizen for the long tail
  // of 250 countries (~75s of API calls plus image-download time).
  const PACE_MS = 300;
  const all = COUNTRY_LIST.map((c) => c.iso2);
  const todo = (FORCE ? all : all.filter((iso) => !manifest[iso])).filter(
    (iso) => !ONLY || ONLY.has(iso),
  );

  console.log(
    `Fetching ${todo.length} passport covers (${Object.keys(manifest).length} already cached)…`,
  );

  let ok = 0;
  let skipped = 0;
  for (const iso2 of todo) {
    try {
      const entry = await fetchOne(iso2);
      if (!entry) {
        skipped++;
        console.log(`  - ${iso2} no usable image`);
        await new Promise((r) => setTimeout(r, PACE_MS));
        continue;
      }
      manifest[iso2] = entry;
      ok++;
      if (ok % 20 === 0) saveManifest(manifest);
      console.log(`  ✓ ${iso2}  ${entry.licence}  ${entry.artist.slice(0, 40)}`);
    } catch (err) {
      skipped++;
      console.warn(`  ✗ ${iso2}  ${(err as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, PACE_MS));
  }

  saveManifest(manifest);
  console.log(`\nDone. ${ok} fetched, ${skipped} skipped. Manifest at ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
