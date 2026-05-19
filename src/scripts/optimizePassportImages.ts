/**
 * Optimize the passport-cover image set in public/passports/.
 *
 * Before this script, the directory was ~125 MB across 239 images
 * — Mali alone was 17 MB, Maldives + Israel + Bosnia all > 1 MB.
 * On the passport-rankings grid + collage surfaces that load every
 * image at once, browsers (especially in incognito with no cache)
 * starved on bandwidth and rendered alt text in place of slow-loading
 * images. The user saw a grid of "Spain passport cover" / "Mexico
 * passport cover" text where the image should have been.
 *
 * What this does:
 *   - For every .jpg in public/passports/ (and the same name in
 *     public/passports/originals/), generate a max-600px-on-the-longest-
 *     edge JPEG at quality 80 (good enough for the grid, ~50-150KB each).
 *   - Originals are moved to public/passports/originals/ first if not
 *     already there, so re-running the script is idempotent.
 *   - Manifest.json untouched — file paths stay the same (/passports/xx.jpg).
 *
 * Result: total directory drops from ~125 MB to ~5-10 MB, ~95% bandwidth
 * reduction for the rankings + collage views.
 *
 * Usage:
 *   npm install --no-save sharp     # one-time
 *   npx tsx src/scripts/optimizePassportImages.ts
 */
import { readdirSync, statSync, mkdirSync, renameSync, existsSync, copyFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve(process.cwd(), "public/passports");
const ORIGINALS = path.join(DIR, "originals");
const MAX_LONG_EDGE = 600;
const JPEG_QUALITY = 80;

function fmtBytes(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}

async function main() {
  if (!existsSync(ORIGINALS)) mkdirSync(ORIGINALS, { recursive: true });

  const files = readdirSync(DIR).filter((f) => f.endsWith(".jpg"));
  console.log(`Processing ${files.length} passport images in ${DIR}`);
  console.log(`Target: max ${MAX_LONG_EDGE}px long edge, JPEG quality ${JPEG_QUALITY}\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let skipped = 0;
  let processed = 0;
  let failed = 0;

  for (const file of files) {
    const src = path.join(DIR, file);
    const orig = path.join(ORIGINALS, file);

    // First run: move original aside so we can reprocess from it.
    // Subsequent runs: skip if optimized version already exists +
    // is smaller than the original (idempotent).
    if (!existsSync(orig)) {
      copyFileSync(src, orig);
    }

    const beforeSize = statSync(src).size;
    totalBefore += beforeSize;

    try {
      // Read from the ORIGINAL (so multiple runs don't re-compress
      // an already-compressed file losing quality each time).
      const meta = await sharp(orig).metadata();
      const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);

      // If the original is already small enough AND below our quality
      // target, just keep it as-is.
      if (longEdge <= MAX_LONG_EDGE && beforeSize < 200_000) {
        skipped += 1;
        totalAfter += beforeSize;
        console.log(`  - ${file}  (already small: ${fmtBytes(beforeSize)})`);
        continue;
      }

      await sharp(orig)
        .resize(MAX_LONG_EDGE, MAX_LONG_EDGE, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
        .toFile(src + ".tmp");

      const afterSize = statSync(src + ".tmp").size;
      // Only swap in the optimized version if it's actually smaller.
      if (afterSize < beforeSize) {
        renameSync(src + ".tmp", src);
        totalAfter += afterSize;
        processed += 1;
        const pct = ((1 - afterSize / beforeSize) * 100).toFixed(0);
        console.log(`  ✓ ${file}  ${fmtBytes(beforeSize)} → ${fmtBytes(afterSize)} (-${pct}%)`);
      } else {
        // Optimizer made it bigger (rare — small source already efficient).
        // Drop the tmp file and keep the original.
        const { unlinkSync } = await import("node:fs");
        unlinkSync(src + ".tmp");
        totalAfter += beforeSize;
        skipped += 1;
        console.log(`  - ${file}  (optimizer didn't help: ${fmtBytes(beforeSize)})`);
      }
    } catch (err) {
      failed += 1;
      totalAfter += beforeSize;
      console.error(`  ✗ ${file}  failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped (already small): ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total before: ${fmtBytes(totalBefore)}`);
  console.log(`  Total after:  ${fmtBytes(totalAfter)}`);
  console.log(`  Saved: ${fmtBytes(totalBefore - totalAfter)} (${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`);
  console.log(`\nOriginals preserved at ${ORIGINALS}/ (excluded from git via .gitignore).`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
