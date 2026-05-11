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

  // No DATABASE_URL → PGlite fallback. This keeps `next build` succeeding
  // without any external infra and lets the site boot on Vercel even when
  // the DB env hasn't been wired up yet (visa lookups just return empty
  // until DATABASE_URL is set).
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
  const { mkdirSync } = await import("node:fs");
  const path = await import("node:path");
  const os = await import("node:os");

  // On serverless platforms (Vercel / Lambda) the working dir is read-only;
  // only /tmp is writable. Use the OS temp dir there. Local dev keeps the
  // project-relative path so the data persists across `npm run dev` restarts.
  const isServerless =
    !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const dataDir =
    process.env.PGLITE_DIR ??
    (isServerless ? path.join(os.tmpdir(), "visavu-pglite/data") : "./.pglite/data");

  try {
    // PGlite creates the leaf dir but not parents; pre-create the chain.
    mkdirSync(path.dirname(dataDir), { recursive: true });
  } catch {
    // Even /tmp can fail in exotic sandboxes — fall through and let PGlite
    // surface its own error if it can't initialise.
  }
  const pg = new PGlite(dataDir);
  return drizzlePglite(pg, { schema }) as unknown as DrizzleDb;
}

// Top-level await: resolved before any consumer can import `db`.
export const db: DrizzleDb = await buildDb();
export { schema };
