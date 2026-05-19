/**
 * Country hero photo resolver.
 *
 * The truth source is `public/heroes/manifest.json`, populated by
 * `npm run fetch:heroes` (see src/scripts/fetchCountryHeroes.ts). The
 * manifest maps ISO2 → {file, photographer, photographerUrl, pexelsUrl}.
 *
 * At runtime we read the manifest from disk once at module init and serve
 * the local JPEG from `/heroes/{iso2}.jpg`. No Pexels API hit at request
 * time, no missing-image risk if the photographer takes their photo down.
 *
 * Pexels licence: free for commercial use, no attribution required by
 * their terms. We attribute the photographer anyway (good karma, free
 * trust signal) via the small chip in the bottom-right of the hero.
 *
 * Failure mode: if the manifest is missing (fresh checkout, script not
 * yet run) or a particular country isn't in it, this returns null and
 * NationalityHero falls back to the gradient hero. No broken UI.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

export type CountryPhoto = {
  /** Path served from /public, e.g. "/heroes/jp.jpg". */
  url: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  pexelsUrl: string;
};

type ManifestEntry = {
  file: string;
  pexelsId: number;
  photographer: string;
  photographerUrl: string;
  pexelsUrl: string;
  alt: string;
  fetchedAt: string;
};
type Manifest = Record<string, ManifestEntry>;

// In-process cache with a 60-second TTL. Production: the file is immutable
// for the life of a deploy, so we essentially cache forever. Dev: a freshly
// run `fetch:heroes` is visible within a minute without a server restart.
// Edge cases:
//  - File missing → empty map, all callers get null
//  - File corrupted → empty map (we don't want to crash the entire site)
const MANIFEST_PATH = path.resolve(process.cwd(), "public/heroes/manifest.json");
let cached: { at: number; data: Manifest } | null = null;

function loadManifest(): Manifest {
  const now = Date.now();
  if (cached && now - cached.at < 60_000) return cached.data;
  try {
    const data = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
    cached = { at: now, data };
    return data;
  } catch {
    cached = { at: now, data: {} };
    return {};
  }
}

/** Alt-text patterns that signal Pexels returned a generic / non-landmark
 *  match (e.g. "Great Blue Hole Belize" returning a ship's-porthole photo).
 *  When matched we treat the entry as missing — better to show the gradient
 *  hero than a wrong-country image. The fetcher should be re-run with a
 *  refined query for the affected ISO via `--iso=BZ`. */
const BAD_ALT_PATTERNS = [
  /\bporthole\b/i,
  /\bship'?s?\s+vent\b/i,
  /\bmetal\s+hook\b/i,
  /\bstock\s+image\b/i,
  /\babstract\b/i,
  /\bclose[-\s]?up of (a |an )?(metal|industrial|machine)/i,
];

function isPlausibleLandmark(alt: string): boolean {
  if (!alt || alt.length < 6) return false;
  return !BAD_ALT_PATTERNS.some((re) => re.test(alt));
}

function entryToPhoto(entry: ManifestEntry): CountryPhoto | null {
  if (!isPlausibleLandmark(entry.alt)) return null;
  return {
    url: entry.file,
    alt: entry.alt,
    photographer: entry.photographer,
    photographerUrl: entry.photographerUrl,
    pexelsUrl: entry.pexelsUrl,
  };
}

export async function getCountryPhoto(iso2: string): Promise<CountryPhoto | null> {
  const entry = loadManifest()[iso2.toUpperCase()];
  return entry ? entryToPhoto(entry) : null;
}

/** Synchronous variant for use in metadata generation. */
export function getCountryPhotoSync(iso2: string): CountryPhoto | null {
  const entry = loadManifest()[iso2.toUpperCase()];
  return entry ? entryToPhoto(entry) : null;
}

/** Test-only export so we can regression-test the alt-text gate. */
export const _internal = { isPlausibleLandmark };
