/**
 * Refresh runner — finds adapters whose last fetch is older than their
 * `defaultIntervalMs` and runs them.
 *
 *   npm run refresh                   — only refresh adapters that are due
 *   npm run refresh -- --all          — force-refresh every adapter
 *   npm run refresh -- --fixture      — use bundled fixtures (offline)
 *   npm run refresh -- --id ca_eta    — refresh a single adapter
 *
 * Designed to be cron-friendly: deterministic exit codes, structured stdout.
 * Pair with the existing `npm run check-sources` for parser-failure alerting.
 */
import { adaptersDueForRefresh, sourceHealthSnapshot } from "@/lib/sourceHealth";
import { adapterById, ADAPTERS } from "@/scrapers/sources";
import { runAdapter } from "@/scrapers/base/runAdapter";

async function main() {
  const argv = process.argv.slice(2);
  const all = argv.includes("--all");
  const useFixture = argv.includes("--fixture");
  const idIdx = argv.indexOf("--id");
  const targetId = idIdx >= 0 ? argv[idIdx + 1] : null;

  let toRun: string[];
  if (targetId) {
    if (!adapterById(targetId)) {
      console.error(`Unknown adapter: ${targetId}`);
      process.exit(1);
    }
    toRun = [targetId];
  } else if (all) {
    toRun = ADAPTERS.map((a) => a.metadata.id);
  } else {
    toRun = await adaptersDueForRefresh();
    if (toRun.length === 0) {
      const snapshot = await sourceHealthSnapshot();
      console.log(`No adapters due. ${snapshot.length} healthy.`);
      process.exit(0);
    }
  }

  console.log(`→ Refreshing ${toRun.length} adapter${toRun.length === 1 ? "" : "s"}${useFixture ? " (fixture mode)" : " (live)"}...`);
  const results: Array<{ id: string; ok: boolean; recordCount: number; reason?: string }> = [];

  for (const id of toRun) {
    const adapter = adapterById(id);
    if (!adapter) continue;
    process.stdout.write(`  • ${id}... `);
    try {
      const r = await runAdapter(adapter, { useFixture });
      const ok = !r.parseError;
      results.push({ id, ok, recordCount: r.recordsCount, reason: r.parseError });
      console.log(
        `${ok ? "ok" : "PARSE ERROR"} (${r.recordsCount} records${r.merge ? `, ${r.merge.inserted} new / ${r.merge.updated} upd` : ""})${r.parseError ? ` — ${r.parseError}` : ""}`,
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      results.push({ id, ok: false, recordCount: 0, reason });
      console.log(`FAILED — ${reason}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log(
    failed.length === 0
      ? `\n✓ ${results.length} adapter${results.length === 1 ? "" : "s"} refreshed cleanly.`
      : `\n✗ ${failed.length}/${results.length} failed: ${failed.map((f) => f.id).join(", ")}`,
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
