/**
 * Apply Drizzle migrations to the active DB. Used by the bootstrap script
 * (PGlite) and by deploy scripts (postgres-js).
 *
 * Drizzle's migration runners differ per driver, so this dispatches based on
 * whether DATABASE_URL is set.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { db } from "./client";
import { sql } from "drizzle-orm";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "drizzle");

export async function migrate() {
  // Ensure a __drizzle_migrations table exists for idempotent reruns.
  await db.execute(
    sql`CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const hash = file;
    const existing = await db.execute(
      sql`SELECT 1 FROM __drizzle_migrations WHERE hash = ${hash} LIMIT 1`,
    );
    // Drizzle's execute returns slightly different shapes per driver; both
    // expose a `rows` property. Treat empty as "not applied".
    const rows = (existing as unknown as { rows?: unknown[] }).rows ?? (existing as unknown as unknown[]);
    if (Array.isArray(rows) && rows.length > 0) continue;

    const fullPath = path.join(MIGRATIONS_DIR, file);
    const ddl = readFileSync(fullPath, "utf8");
    // Drizzle generates one statement per `--> statement-breakpoint` chunk.
    const statements = ddl
      .split(/-->\s*statement-breakpoint/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await db.execute(sql.raw(stmt));
    }

    await db.execute(
      sql`INSERT INTO __drizzle_migrations (hash) VALUES (${hash})`,
    );
    // eslint-disable-next-line no-console
    console.log(`Applied migration: ${file}`);
  }
}
