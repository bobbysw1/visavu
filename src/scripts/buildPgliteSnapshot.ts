/**
 * Build a memory-mode-safe PGlite snapshot using PGlite's NATIVE
 * `dumpDataDir(compression)` method.
 *
 * Why this and not a manual `tar -czf`?
 *
 *   Plain tar of the .pglite/data directory captures transient runtime
 *   files (postmaster.pid, .s.PGSQL.5432.lock.out, WAL segments) and
 *   may produce a layout incompatible with what `loadDataDir` expects
 *   to mount into the WASM virtual filesystem. Result: ErrnoError 20
 *   (ENOTDIR) on first query in memory mode.
 *
 *   PGlite's native dumpDataDir() returns a Blob in exactly the format
 *   loadDataDir reads — guaranteed-portable across runtimes (Vercel
 *   functions, Lambda, local Node, browser).
 *
 * Output: src/data/pglite-dump.tar.gz (auto-gzipped by PGlite)
 */
import { writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve(process.cwd(), ".pglite/data");
const OUT = path.resolve(process.cwd(), "src/data/pglite-dump.tar.gz");

async function main() {
  if (!existsSync(SRC)) {
    console.error(`✗ ${SRC} not found. Run \`npm run bootstrap\` first.`);
    process.exit(1);
  }

  console.log("Opening local PGlite at .pglite/data …");
  const { PGlite } = await import("@electric-sql/pglite");

  const pg = new PGlite(SRC);
  await pg.waitReady;
  console.log("Dumping data dir (gzip compression) …");

  const blob = await pg.dumpDataDir("gzip");
  const buf = Buffer.from(await blob.arrayBuffer());
  writeFileSync(OUT, buf);
  await pg.close();

  const sizeMb = (buf.length / 1024 / 1024).toFixed(1);
  console.log(`✓ Snapshot built: ${OUT} (${sizeMb} MB)`);
}

main().catch((e) => {
  console.error("✗ snapshot failed", e);
  process.exit(1);
});
