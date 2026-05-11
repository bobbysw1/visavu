/**
 * One-shot bootstrap: get a working dev DB with real-shaped data in seconds.
 *
 *   1. Migrate the schema (creates tables, enums, indexes).
 *   2. Seed reference data (countries, blocs, eTA systems, ordinary passports).
 *   3. Run every adapter in fixture mode (no network) → merge into visa_options.
 *   4. Print a summary.
 *
 * Run: `npm run bootstrap`
 *
 * After this, `npm run dev` shows real visa data on result pages with no
 * external Postgres. Later, set DATABASE_URL to a Neon URL and re-run to
 * populate the production DB the same way.
 */
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { migrate } from "@/db/migrate";
import { seedReferenceData } from "@/seed/run";
import { ADAPTERS } from "@/scrapers/sources";
import { runAdapter } from "@/scrapers/base/runAdapter";

const WIKIPEDIA_FIXTURE = path.resolve(
  process.cwd(),
  "src/scrapers/sources/__fixtures__/wikipedia_long_tail.json",
);

async function ensureWikipediaFixture(): Promise<void> {
  if (existsSync(WIKIPEDIA_FIXTURE) && statSync(WIKIPEDIA_FIXTURE).size > 1000) return;

  console.log("→ Wikipedia fixture missing or truncated. Fetching from Wikipedia...");
  console.log("  (This is a one-time cost — ~7 minutes — and only happens on first bootstrap.)");
  const result = spawnSync(
    "npx",
    ["tsx", "src/scripts/buildWikipediaFixture.ts"],
    { stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) {
    console.error("Wikipedia fixture build failed. Bootstrap will continue without it.");
  }
}

async function main() {
  await ensureWikipediaFixture();

  console.log("→ Migrating schema...");
  await migrate();

  console.log("→ Seeding reference data (countries, blocs, eTA systems)...");
  await seedReferenceData();

  console.log(`→ Running ${ADAPTERS.length} adapters in fixture mode...`);
  for (const adapter of ADAPTERS) {
    process.stdout.write(`  • ${adapter.metadata.id}... `);
    try {
      const result = await runAdapter(adapter, { useFixture: true });
      const merge = result.merge;
      console.log(
        `parsed ${result.recordsCount}, ` +
          (merge ? `inserted ${merge.inserted}, updated ${merge.updated}` : "skipped merge") +
          (result.parseError ? `  (parseError: ${result.parseError})` : ""),
      );
    } catch (err) {
      console.log(`FAILED — ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log("\n✓ Bootstrap complete. Run `npm run dev` to see real data.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
