/**
 * Rasterise SVG-content files masquerading as .jpg in public/passports/.
 *
 * Bug: 13 passport files (ae/az/in/lt/mg/mn/mx/ph/sa/si/sy/tr/us .jpg)
 * had .jpg extensions but their actual contents were SVG XML (likely
 * downloaded from Wikimedia Commons where the source was vector, just
 * named with the wrong extension). Browsers can't decode SVG-as-JPEG
 * (the response says Content-Type: image/jpeg but the bytes start
 * with `<?xml`), so the passport-rankings + collage grids rendered
 * those as broken-image placeholders.
 *
 * Fix: read every passport .jpg, detect SVG by leading bytes, rasterise
 * to a real JPEG via sharp at the same 600px / quality 80 budget the
 * main optimizer uses. Idempotent — only touches files that are
 * actually SVGs.
 *
 *   npx tsx src/scripts/rasteriseSvgPassports.ts
 */
import { readFileSync, writeFileSync, renameSync, statSync } from "node:fs";
import { readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve(process.cwd(), "public/passports");
const MAX_LONG_EDGE = 600;
const JPEG_QUALITY = 80;

function isSvg(buf: Buffer): boolean {
  // Check the first few bytes after stripping BOM + whitespace.
  const head = buf.slice(0, 200).toString("utf8").trimStart().toLowerCase();
  return head.startsWith("<?xml") || head.startsWith("<svg");
}

async function main() {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".jpg"));
  let fixed = 0;
  let skipped = 0;

  for (const file of files) {
    const full = path.join(DIR, file);
    const buf = readFileSync(full);
    if (!isSvg(buf)) {
      skipped += 1;
      continue;
    }
    const beforeSize = statSync(full).size;
    try {
      // Sharp can read SVG directly. Render at a reasonable density so
      // the rasterised JPEG isn't pixelated (default 72 dpi gives a
      // small bitmap that scales poorly for the 600px target).
      const out = await sharp(buf, { density: 300 })
        .resize(MAX_LONG_EDGE, MAX_LONG_EDGE, { fit: "inside", withoutEnlargement: false })
        // White background — passport SVGs often have transparent
        // backgrounds that would composite as black under .jpeg().
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
        .toBuffer();
      writeFileSync(full + ".tmp", out);
      renameSync(full + ".tmp", full);
      const afterSize = statSync(full).size;
      console.log(`  ✓ ${file}  ${beforeSize}B SVG → ${(afterSize / 1024).toFixed(0)}KB JPEG`);
      fixed += 1;
    } catch (err) {
      console.error(`  ✗ ${file}  failed:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`\nFixed: ${fixed}, skipped (already JPEG): ${skipped}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
