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
  // without any external infra (PGlite supplies an in-process Postgres). Real
  // deployments are expected to set DATABASE_URL at runtime; if they don't,
  // the app still serves with empty data rather than crashing on boot.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
  const { mkdirSync } = await import("node:fs");
  const path = await import("node:path");
  const dataDir = process.env.PGLITE_DIR ?? "./.pglite/data";
  // PGlite creates the leaf dir but not parents; pre-create the chain so a
  // fresh checkout's first run succeeds without manual setup.
  mkdirSync(path.dirname(dataDir), { recursive: true });
  const pg = new PGlite(dataDir);
  return drizzlePglite(pg, { schema }) as unknown as DrizzleDb;
}

// Top-level await: resolved before any consumer can import `db`.
export const db: DrizzleDb = await buildDb();
export { schema };
