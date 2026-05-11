/**
 * Manual scraper trigger. Run with:
 *
 *   npm run scrape -- us_visa_waiver_program
 *
 * Useful for development, smoke-testing a new adapter, and as a stepping stone
 * to scheduled execution (BullMQ + worker, Phase 3).
 */
import { adapterById, ADAPTERS } from "./sources";
import { runAdapter } from "./base/runAdapter";

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error("Usage: npm run scrape -- <adapter-id>");
    console.error("\nAvailable adapters:");
    for (const a of ADAPTERS) console.error(`  ${a.metadata.id} — ${a.metadata.name}`);
    process.exit(1);
  }

  const adapter = adapterById(id);
  if (!adapter) {
    console.error(`Unknown adapter: ${id}`);
    process.exit(1);
  }

  console.log(`Running adapter ${adapter.metadata.id}...`);
  const result = await runAdapter(adapter);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.parseError ? 2 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
