/**
 * Passport-cover image audit. Walks COUNTRY_LIST, cross-references
 * against public/passports/manifest.json + the actual files on disk,
 * and emits a markdown report categorising every iso2 as:
 *
 *   REAL_COVER   — has a .jpg cover in the manifest. The passport's
 *                  actual photographed front cover from Wikimedia
 *                  Commons. This is what we want everywhere.
 *
 *   FLAG_ONLY    — only a .svg flag file present in public/passports/,
 *                  no manifest entry. These render the flag-tile
 *                  fallback on UI surfaces — looks fine but isn't a
 *                  passport.
 *
 *   MISSING      — no file at all. UI falls through to a generic
 *                  placeholder. These need attention first.
 *
 * Output: audit/PASSPORT_COVERS_<date>.md sorted by category +
 * passport name. Run before each release of the homepage collage to
 * spot regressions / new gaps.
 *
 *   npx tsx src/scripts/passportCoverAudit.ts
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { writeFileSync, mkdirSync } from "node:fs";
// Walk PASSPORT_COUNTRIES (200 actually-issuing sovereign passports),
// not COUNTRY_LIST (250 — includes uninhabited territories + non-
// issuing dependencies like Curaçao / Aruba / Mayotte that use a
// parent country's passport). Auditor flagging those was just noise.
import { PASSPORT_COUNTRIES } from "@/lib/countries";

type ManifestEntry = {
  file: string;
  source: string;
  commonsFile?: string;
  artist?: string;
  licence?: string;
  width?: number;
  height?: number;
  fetchedAt?: string;
};

type Manifest = Record<string, ManifestEntry>;

type Category = "REAL_COVER" | "FLAG_ONLY" | "MISSING";

type Row = {
  iso2: string;
  name: string;
  category: Category;
  notes: string;
};

const PASSPORT_DIR = path.resolve(process.cwd(), "public/passports");
const MANIFEST_PATH = path.resolve(PASSPORT_DIR, "manifest.json");

function loadManifest(): Manifest {
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
  } catch {
    return {};
  }
}

function categorise(iso2: string, manifest: Manifest): { category: Category; notes: string } {
  const entry = manifest[iso2];
  // Real cover = manifest entry pointing to an existing .jpg on disk.
  if (entry?.file) {
    const onDisk = path.resolve(process.cwd(), "public", entry.file.replace(/^\//, ""));
    if (existsSync(onDisk) && entry.file.endsWith(".jpg")) {
      const sourceShort = entry.source?.replace(/^https?:\/\//, "").slice(0, 40);
      return { category: "REAL_COVER", notes: sourceShort ?? "" };
    }
  }
  // Flag-only fallback = a .svg file in the passport dir but no manifest entry.
  const svgPath = path.join(PASSPORT_DIR, `${iso2.toLowerCase()}.svg`);
  if (existsSync(svgPath)) {
    return { category: "FLAG_ONLY", notes: "flag SVG only — needs real cover" };
  }
  return { category: "MISSING", notes: "no file on disk — flag-tile fallback in UI" };
}

function main() {
  const manifest = loadManifest();
  const rows: Row[] = PASSPORT_COUNTRIES.map((c) => {
    const { category, notes } = categorise(c.iso2, manifest);
    return { iso2: c.iso2, name: c.name, category, notes };
  });

  const stats = {
    REAL_COVER: rows.filter((r) => r.category === "REAL_COVER").length,
    FLAG_ONLY: rows.filter((r) => r.category === "FLAG_ONLY").length,
    MISSING: rows.filter((r) => r.category === "MISSING").length,
  };

  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Passport-cover audit — ${date}`,
    ``,
    `Total countries: ${rows.length}`,
    `  - REAL_COVER:  ${stats.REAL_COVER} (${Math.round((stats.REAL_COVER / rows.length) * 100)}%)`,
    `  - FLAG_ONLY:   ${stats.FLAG_ONLY} (${Math.round((stats.FLAG_ONLY / rows.length) * 100)}%)`,
    `  - MISSING:     ${stats.MISSING} (${Math.round((stats.MISSING / rows.length) * 100)}%)`,
    ``,
    `Refresh covers: \`npm run fetch:passport-covers\` — pulls from Wikimedia Commons.`,
    `For one-off fixes / unusual countries, hand-add to the fetcher script's CURATED_OVERRIDES table with the Commons File: URL.`,
    ``,
  ];

  // MISSING first — highest urgency
  if (stats.MISSING > 0) {
    lines.push(`## MISSING — ${stats.MISSING} countries (no image, generic placeholder rendering)\n`);
    lines.push(`| iso2 | Country | Notes |`);
    lines.push(`|---|---|---|`);
    for (const r of rows.filter((r) => r.category === "MISSING").sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`| ${r.iso2} | ${r.name} | ${r.notes} |`);
    }
    lines.push("");
  }

  // FLAG_ONLY — fix when convenient
  if (stats.FLAG_ONLY > 0) {
    lines.push(`## FLAG_ONLY — ${stats.FLAG_ONLY} countries (flag fallback rendering, no passport photo)\n`);
    lines.push(`| iso2 | Country | Notes |`);
    lines.push(`|---|---|---|`);
    for (const r of rows.filter((r) => r.category === "FLAG_ONLY").sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`| ${r.iso2} | ${r.name} | ${r.notes} |`);
    }
    lines.push("");
  }

  // REAL_COVER — full list at the end for sanity
  lines.push(`## REAL_COVER — ${stats.REAL_COVER} countries (Wikimedia Commons photo)\n`);
  lines.push(`| iso2 | Country | Source |`);
  lines.push(`|---|---|---|`);
  for (const r of rows.filter((r) => r.category === "REAL_COVER").sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push(`| ${r.iso2} | ${r.name} | ${r.notes} |`);
  }

  mkdirSync(path.resolve(process.cwd(), "audit"), { recursive: true });
  const outPath = path.resolve(process.cwd(), `audit/PASSPORT_COVERS_${date}.md`);
  writeFileSync(outPath, lines.join("\n"));
  console.log(`✓ Passport-cover audit: ${outPath}`);
  console.log(`  REAL_COVER ${stats.REAL_COVER} · FLAG_ONLY ${stats.FLAG_ONLY} · MISSING ${stats.MISSING}`);

  // Print the top-20 MISSING + FLAG_ONLY inline so the user can see the immediate gaps
  const needsAttention = rows.filter((r) => r.category !== "REAL_COVER");
  if (needsAttention.length > 0) {
    console.log(`\nFirst 20 needing attention:`);
    for (const r of needsAttention.slice(0, 20)) {
      console.log(`  ${r.category.padEnd(11)} ${r.iso2} ${r.name}`);
    }
  }
}

main();
