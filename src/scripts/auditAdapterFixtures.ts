/**
 * Adapter fixture audit — reports which adapters have offline fixtures
 * (used in preview / fixture-mode bootstrap) versus those that depend
 * on live HTTP for every refresh.
 *
 *   npm run audit-fixtures
 *
 * Used by the P28 live-fetch migration to track per-adapter readiness
 * for VISAVU_FIXTURE_MODE=false production rollout.
 */
import { ADAPTERS } from "@/scrapers/sources";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

async function main(): Promise<void> {
  const withFixture: string[] = [];
  const inlineOnly: string[] = [];
  const missingFixturePath: string[] = [];

  for (const adapter of ADAPTERS) {
    const path = adapter.metadata.fixturePath;
    if (!path) {
      inlineOnly.push(adapter.metadata.id);
    } else if (existsSync(resolve(process.cwd(), path))) {
      withFixture.push(adapter.metadata.id);
    } else {
      missingFixturePath.push(`${adapter.metadata.id} (declared: ${path})`);
    }
  }

  console.log(`Total adapters: ${ADAPTERS.length}`);
  console.log();
  console.log(`✓ With offline fixture (${withFixture.length}):`);
  for (const id of withFixture.sort()) console.log(`  · ${id}`);
  console.log();
  console.log(`◐ Inline data / live-only (${inlineOnly.length}):`);
  console.log(`  These adapters embed their data directly in the source file`);
  console.log(`  and use politeFetch for liveness check. They are LIVE in`);
  console.log(`  production but won't fetch under VISAVU_FIXTURE_MODE=true.`);
  for (const id of inlineOnly.sort()) console.log(`  · ${id}`);

  if (missingFixturePath.length > 0) {
    console.log();
    console.log(`✗ Missing declared fixture (${missingFixturePath.length}):`);
    for (const m of missingFixturePath.sort()) console.log(`  · ${m}`);
  }

  console.log();
  const coverage = ((withFixture.length / ADAPTERS.length) * 100).toFixed(0);
  console.log(`Fixture coverage: ${withFixture.length}/${ADAPTERS.length} (${coverage}%)`);
  console.log(
    `Live-fetch ready: ${ADAPTERS.length - missingFixturePath.length}/${ADAPTERS.length}`,
  );

  process.exit(missingFixturePath.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
