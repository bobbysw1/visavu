import type { Metadata } from "next";
import { db, schema } from "@/db/client";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DB status — Visavu admin",
  robots: { index: false, follow: false },
};

type TableCount = { table: string; rows: number | null; error?: string };

async function countTable(name: string, query: () => Promise<unknown[]>): Promise<TableCount> {
  try {
    const rows = await query();
    return { table: name, rows: Array.isArray(rows) ? rows.length : null };
  } catch (err) {
    return { table: name, rows: null, error: err instanceof Error ? err.message : String(err) };
  }
}

async function tryReadWrite(): Promise<{ writable: boolean; message: string }> {
  try {
    // Try a no-commit read against a known table.
    await db.execute(sql`SELECT 1`);

    // Try a write to verify_health (creates the table if missing — pure
    // diagnostic, no production data).
    await db.execute(sql`CREATE TABLE IF NOT EXISTS _health (id serial primary key, checked_at timestamptz default now())`);
    await db.execute(sql`INSERT INTO _health (checked_at) VALUES (NOW())`);
    await db.execute(sql`DELETE FROM _health WHERE checked_at < NOW() - INTERVAL '1 hour'`);
    return { writable: true, message: "Read and write OK." };
  } catch (err) {
    return { writable: false, message: err instanceof Error ? err.message : String(err) };
  }
}

function detectDriver(): { driver: string; persistent: boolean; description: string } {
  const url = process.env.DATABASE_URL;
  if (url) {
    return {
      driver: "postgres-js → managed Postgres",
      persistent: true,
      description: `DATABASE_URL is set. User writes persist across function invocations and cold starts. Connection: ${url.replace(/:[^@]+@/, ":***@")}`,
    };
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return {
      driver: "PGlite (memory mode, snapshot-loaded)",
      persistent: false,
      description: "Running on serverless. Reads from src/data/pglite-dump.tar.gz on cold start. WRITES DO NOT PERSIST — they're lost when the function instance recycles. User accounts will appear to work mid-session but reset randomly. See docs/POSTGRES_SETUP.md to fix.",
    };
  }
  return {
    driver: "PGlite (filesystem mode, ./.pglite/data)",
    persistent: true,
    description: "Local development. Writes persist to ./.pglite/data on disk.",
  };
}

export default async function DbStatusPage() {
  const driver = detectDriver();

  // Counts for the main tables (best-effort; some may be empty on local).
  const counts = await Promise.all([
    countTable("countries", () => db.select().from(schema.countries).limit(500)),
    countTable("passports", () => db.select().from(schema.passports).limit(500)),
    countTable("visa_options", async () => {
      const r = await db.execute<{ count: number }>(sql`SELECT COUNT(*)::int AS count FROM visa_options`);
      // Normalise — postgres-js returns { rows } shape; pglite returns array.
      const rows = (r as unknown as { rows?: Array<{ count: number }> }).rows ?? (r as unknown as Array<{ count: number }>);
      return [{ table: "visa_options", rows: rows[0]?.count ?? 0 }];
    }),
    countTable("users", () => db.select().from(schema.users).limit(500)),
    countTable("watchlist_subscriptions", () => db.select().from(schema.watchlistSubscriptions).limit(500)),
    countTable("auth_tokens", () => db.select().from(schema.authTokens).limit(500)),
    countTable("notification_events", () => db.select().from(schema.notificationEvents).limit(500)),
  ]);

  const readWrite = await tryReadWrite();

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="kicker text-xs uppercase tracking-wider text-neutral-500">Visavu admin</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Database status</h1>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Diagnostic view of the active database driver and whether writes persist.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Active driver</h2>
        <div className={`rounded-lg border p-4 space-y-2 ${
          driver.persistent
            ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30"
            : "border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30"
        }`}>
          <p className="font-mono text-sm font-semibold">{driver.driver}</p>
          <p className="text-xs">{driver.persistent ? "✓ Writes persist" : "⚠ Writes are ephemeral"}</p>
          <p className="text-xs text-neutral-700 dark:text-neutral-300">{driver.description}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Read/write health check</h2>
        <div className={`rounded-lg border p-4 ${
          readWrite.writable
            ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30"
            : "border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30"
        }`}>
          <p className="text-sm font-medium">{readWrite.writable ? "Healthy ✓" : "Failing ✗"}</p>
          <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 font-mono break-words">{readWrite.message}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Table counts</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-left">
              <th className="py-2">Table</th>
              <th className="py-2 text-right">Rows</th>
              <th className="py-2 text-left pl-4">Notes</th>
            </tr>
          </thead>
          <tbody>
            {counts.map((c) => (
              <tr key={c.table} className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="py-2 font-mono">{c.table}</td>
                <td className="py-2 text-right tabular-nums">{c.rows ?? "—"}</td>
                <td className="py-2 pl-4 text-xs text-neutral-600 dark:text-neutral-400">{c.error ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-4">
        <p>
          See <code className="text-xs">docs/POSTGRES_SETUP.md</code> in the repo for wiring a managed Postgres.
        </p>
      </footer>
    </main>
  );
}
