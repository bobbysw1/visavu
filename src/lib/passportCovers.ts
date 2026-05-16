/**
 * Passport-cover photo resolver.
 *
 * Companion to lib/pexels.ts for the destination/passport country hero
 * photos. Reads public/passports/manifest.json (populated by
 * `npm run fetch:passport-covers`, see src/scripts/fetchPassportCovers.ts)
 * and returns the ready-to-render entry for a given ISO.
 *
 * Source is Wikimedia Commons (CC / public-domain licensed), with the
 * `artist` and `licence` fields preserved so the UI can attribute them —
 * a legal requirement on most CC licences and a trust signal regardless.
 *
 * Failure mode: missing manifest, missing entry, or corrupted file → null.
 * Callers should render a flag-tile fallback rather than crash.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { PassportCover } from "./passportCoverTypes";

export type { PassportCover } from "./passportCoverTypes";

type ManifestEntry = PassportCover & { file: string; fetchedAt: string };
type Manifest = Record<string, ManifestEntry>;

const MANIFEST_PATH = path.resolve(process.cwd(), "public/passports/manifest.json");
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

function toCover(entry: ManifestEntry): PassportCover {
  return {
    url: entry.file,
    source: entry.source,
    commonsFile: entry.commonsFile,
    artist: entry.artist,
    licence: entry.licence,
    licenceUrl: entry.licenceUrl,
    width: entry.width,
    height: entry.height,
  };
}

export function getPassportCover(iso2: string): PassportCover | null {
  const entry = loadManifest()[iso2.toUpperCase()];
  return entry ? toCover(entry) : null;
}

/** All ISO2 codes that currently have a passport cover photo on disk.
 *  Useful for the homepage collage so we render real photos only, in a
 *  predictable order. */
export function passportCoverIsos(): string[] {
  return Object.keys(loadManifest()).sort();
}
