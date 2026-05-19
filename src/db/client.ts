/**
 * Drizzle DB client. Now SPLIT into two routes by data-access pattern:
 *
 *   • `db`     → visa catalogue (read-heavy, ships in snapshot). ALWAYS
 *                PGlite. Vercel cold-start seeds from the 40 MB tarball
 *                at src/data/pglite-dump.tar.gz; local dev uses the
 *                filesystem-mode PGlite at ./.pglite/data. No external
 *                database, instant cold-start, the visa data ships with
 *                the code so there is no "DB is down" failure mode.
 *
 *   • `userDb` → user accounts + watchlists + alerts + reports (write-
 *                heavy, must persist across serverless instance recycles).
 *                Routes to managed Postgres via DATABASE_URL when set;
 *                falls back to the same PGlite as `db` when unset (so
 *                local dev + the public preview still work without
 *                external services).
 *
 * THE PROBLEM THIS SPLIT FIXES
 * ────────────────────────────
 * Before: a single `db` export. Visa data was always served from the
 * PGlite snapshot, but user writes (watchlists, accounts) also went
 * into PGlite — which is in-memory in serverless mode, so writes
 * disappeared whenever Vercel recycled the function instance. The
 * /admin/db-status page even acknowledged this: "WRITES DO NOT
 * PERSIST … User accounts will appear to work mid-session but reset
 * randomly." That kills user trust on the first encounter.
 *
 * After: setting `DATABASE_URL` in Vercel routes the 4 user-touching
 * tables to a real Postgres while keeping the entire visa catalogue
 * on the zero-config PGlite snapshot path. No DATABASE_URL = current
 * behaviour for backwards compatibility; preview deploys + local dev
 * keep working unchanged.
 *
 * TO ACTIVATE
 * ───────────
 * 1. Sign up for Neon (https://neon.tech) / Supabase / Vercel Postgres.
 * 2. Copy the connection string.
 * 3. Vercel → Project Settings → Environment Variables → add
 *    `DATABASE_URL` = the connection string. Apply to Production +
 *    Preview if you want writes to persist on preview branches.
 * 4. First deploy will auto-run the Drizzle migrations against the new
 *    DB (see migrate.ts) and create the 4 user tables.
 * 5. Watchlists + accounts now persist.
 *
 * No code changes needed; this file already detects DATABASE_URL.
 */
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzlePg<typeof schema>>;

/** True when a managed Postgres is configured for user-data writes. */
export const hasManagedUserPostgres = !!process.env.DATABASE_URL;

async function buildVisaDb(): Promise<DrizzleDb> {
  // Visa data ALWAYS comes from PGlite — even when DATABASE_URL is set,
  // we keep visa lookups on the zero-cost snapshot path. The managed
  // Postgres is reserved for write-heavy user tables only.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");

  const isServerless =
    !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    const { readFileSync } = await import("node:fs");
    const path = await import("node:path");
    const dumpPath = path.join(process.cwd(), "src/data/pglite-dump.tar.gz");
    try {
      const buf = readFileSync(dumpPath);
      const blob = new Blob([new Uint8Array(buf)]);
      // In-memory PGlite seeded from the bundled snapshot. Each cold start
      // reloads the snapshot — fast (~1s for 96 MB) and stateless.
      const pg = new PGlite({ dataDir: "memory://", loadDataDir: blob });
      return drizzlePglite(pg, { schema }) as unknown as DrizzleDb;
    } catch {
      // No snapshot bundled — fall through to an empty in-memory DB so the
      // site at least boots. Visa lookups will return empty until a snapshot
      // is committed, but the page itself won't 500.
      const pg = new PGlite({ dataDir: "memory://" });
      return drizzlePglite(pg, { schema }) as unknown as DrizzleDb;
    }
  }

  // Local dev: filesystem mode, persistent.
  const { mkdirSync } = await import("node:fs");
  const path = await import("node:path");
  const dataDir = process.env.PGLITE_DIR ?? "./.pglite/data";
  try {
    mkdirSync(path.dirname(dataDir), { recursive: true });
  } catch {
    // Already exists — fine.
  }
  const pg = new PGlite(dataDir);
  return drizzlePglite(pg, { schema }) as unknown as DrizzleDb;
}

async function buildUserDb(visaDbFallback: DrizzleDb): Promise<DrizzleDb> {
  // When a managed Postgres is configured (DATABASE_URL), use it for the
  // 4 user-touching tables. Writes persist across serverless instance
  // recycles, which is the core point of this split.
  const url = process.env.DATABASE_URL;
  if (url) {
    const client = postgres(url, { prepare: false });
    return drizzlePg(client, { schema }) as DrizzleDb;
  }
  // No DATABASE_URL → fall back to the same PGlite the visa data uses.
  // This keeps local dev + preview branches working without forcing
  // every contributor to provision Postgres credentials. The known
  // limitation (writes lost on serverless instance recycle) re-applies
  // here — but that's the existing behaviour, not a regression.
  return visaDbFallback;
}

// Top-level await: resolved before any consumer can import these exports.
export const db: DrizzleDb = await buildVisaDb();
export const userDb: DrizzleDb = await buildUserDb(db);
export { schema };
