/**
 * Compact the local PGlite data directory before snapshotting:
 *   - CHECKPOINT  (flush all in-memory changes to disk)
 *   - VACUUM FULL (reclaim dead tuples + rewrite tables compactly)
 *   - Truncate WAL files via a clean shutdown
 *
 * Run with:  npx tsx src/scripts/compactSnapshot.ts
 *
 * Then run `npm run db:snapshot` to produce the new (smaller) tar.gz.
 */
import { db } from "../db/client";
import { sql } from "drizzle-orm";

async function main() {
  console.log("CHECKPOINT…");
  await db.execute(sql`CHECKPOINT`);

  console.log("VACUUM FULL ANALYZE (this can take 30-60s)…");
  // VACUUM FULL rewrites tables to reclaim space from dead tuples.
  // It locks each table briefly, but the database is single-user here
  // so that's fine.
  await db.execute(sql`VACUUM FULL ANALYZE`);

  console.log("Final CHECKPOINT…");
  await db.execute(sql`CHECKPOINT`);

  console.log("✓ Compacted. Now run: npm run db:snapshot");
  // Clean shutdown via process exit will close PGlite's file handles
  // and let pg_wal truncate.
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
