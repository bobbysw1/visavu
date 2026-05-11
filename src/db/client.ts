/**
 * Drizzle DB client. Dual-mode by design:
 *
 *   1. Production / staging — postgres-js connecting to a managed Postgres
 *      (Neon / Supabase / Railway). Activated when DATABASE_URL is set.
 *
 *   2. Local dev + tests — PGlite (an in-process Postgres compiled to WASM).
 *      Zero external dependencies; data persists to ./.pglite/data.
 *      Activated when DATABASE_URL is unset.
 *
 * Both paths register the SAME Drizzle relational schema, so callers use one
 * `db` and Drizzle queries work identically — including nested `db.query.*`
 * relational queries.
 *
 * Initialization is async (PGlite imports a WASM module), so this file uses
 * top-level await. That's safe in Next.js 15 server code and in our scripts;
 * client components never import this file (server-only by convention).
 */
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzlePg<typeof schema>>;

async function buildDb(): Promise<DrizzleDb> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const client = postgres(url, { prepare: false });
    return drizzlePg(client, { schema }) as DrizzleDb;
  }

  // No DATABASE_URL → PGlite fallback.
  //
  // Two modes:
  //
  //  - **Local dev** (no Vercel env): persistent filesystem PGlite at
  //    ./.pglite/data. Data survives `npm run dev` restarts. Bootstrap is a
  //    one-time `npm run bootstrap`.
  //
  //  - **Vercel / serverless** (VERCEL=1 env): memory-mode PGlite, seeded
  //    on cold start from the bundled snapshot at src/data/pglite-dump.tar.gz
  //    (~24 MB compressed, ~96 MB live). This lets the entire site run with
  //    no external database — all data is committed into the repo via the
  //    snapshot, generated locally by `npm run bootstrap && npm run db:snapshot`.
  //
  //    The snapshot path is referenced via require.resolve so Next.js's file
  //    tracer includes it in the function bundle.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");

  const isServerless =
    !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    const { readFileSync } = await import("node:fs");
    const path = await import("node:path");
    // The dump path is resolved relative to the running file. Next.js's file
    // tracer reads `process.cwd()/src/data/...` paths reliably in App-Router
    // server modules.
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

// Top-level await: resolved before any consumer can import `db`.
export const db: DrizzleDb = await buildDb();
export { schema };
