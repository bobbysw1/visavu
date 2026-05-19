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
  const upper = iso2.toUpperCase();
  // Blocklisted entries return null so any consumer (collage, rankings,
  // sidebar, pair-page hero) falls back to the styled flag tile rather
  // than rendering a non-passport-cover photo. See COLLAGE_BLOCKED_ISOS.
  if (COLLAGE_BLOCKED_ISOS.has(upper)) return null;
  const entry = loadManifest()[upper];
  return entry ? toCover(entry) : null;
}

/** Same as getPassportCover but bypasses the blocklist — used by the
 *  /admin/* surfaces that want to see the manifest as-is for audit
 *  purposes. Public-facing renders should always use getPassportCover. */
export function getPassportCoverRaw(iso2: string): PassportCover | null {
  const entry = loadManifest()[iso2.toUpperCase()];
  return entry ? toCover(entry) : null;
}

/** All ISO2 codes that currently have a passport cover photo on disk.
 *  Useful for the homepage collage so we render real photos only, in a
 *  predictable order. */
export function passportCoverIsos(): string[] {
  return Object.keys(loadManifest()).sort();
}

/**
 * Manifest entries whose underlying image was confirmed to NOT be a
 * passport cover — entry/exit stamps, peacekeeper photos, ceremony
 * shots, random tourist photos that were uploaded to Wikimedia under
 * a country-name file. Mali was "British Peacekeepers in Mali"; Bhutan
 * was "Lhotshampa refugees"; Lesotho/Mayotte/Niue/Solomon Is/etc
 * were entry stamps; Palau was a Royal Navy ship.
 *
 * These files still exist (the country page still links to them as a
 * placeholder hero) but the collage grid filters them out — better to
 * show fewer real passport covers than a grid where 12% of tiles are
 * unrelated photos. To restore an iso, replace its file in
 * public/passports/ with an actual passport cover (rasterised JPEG)
 * then remove the iso from this set.
 *
 * Audited 2026-05-20 by inspecting commonsFile filenames for known
 * non-passport keywords (stamp / entry / exit / peacekeepers /
 * refugees / ceremony / kazungula / zanzibar / etc).
 */
const COLLAGE_BLOCKED_ISOS: ReadonlySet<string> = new Set([
  // Definitely-not-passport photos
  "BT", "BW", "ML", "NR", "PW", "VI", "ZM",
  // Entry / exit / arrival stamp scans (not the cover)
  "AW", "BL", "BS", "CW", "FJ", "GF", "GM", "GP", "GQ", "HT", "LS",
  "MQ", "NC", "NU", "PF", "PM", "RE", "SB", "SR", "TO", "YT",
  // Non-issuing territories that share their parent's image (Australian
  // R-series cover reused for Cocos / Christmas / Norfolk; NZ ceremony
  // photo reused for Cook Islands / Tokelau). Grid should show the
  // parent (AU/NZ) once, not the dependent territories.
  "CC", "CX", "NF", "CK", "TK",
  // Other low-confidence (filename suggests not a real cover)
  "BZ", // Belize — only a generic "Belize.webp" stub
]);

/**
 * ISO2s that show a real passport cover in the homepage / rankings
 * collage. = (manifest entries) − (blocklist above) − (non-issuing
 * territories per PARENT_PASSPORT). Used by PassportCollage +
 * passport-rankings grid; per-passport hero photos elsewhere on the
 * site still pull from the full manifest (the country page's existing
 * fallback rendering handles missing/wrong images gracefully).
 */
export function verifiedPassportCoverIsos(): string[] {
  // Inline the non-issuing-territory set to avoid a circular import
  // through lib/countries. Matches PARENT_PASSPORT keys in countries.ts.
  const NON_ISSUING = new Set([
    "AW", "CW", "SX", "BQ", "GP", "MQ", "GF", "RE", "YT", "PM", "WF",
    "NC", "PF", "BL", "MF", "FO", "GL", "AX", "CC", "CX", "NF", "SJ",
    "AS", "GU", "MP", "PR", "VI", "CK", "NU", "TK", "PN", "AI", "BM",
    "KY", "VG", "MS", "TC", "FK", "SH", "JE", "GG", "IM",
  ]);
  return Object.keys(loadManifest())
    .filter((iso) => !COLLAGE_BLOCKED_ISOS.has(iso) && !NON_ISSUING.has(iso))
    .sort();
}
