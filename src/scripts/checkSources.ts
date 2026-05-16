/**
 * Source health check.
 *
 *   npm run check-sources           — live-fetch every adapter, report results
 *   npm run check-sources -- --fixture  — use fixtures (offline smoke test)
 *
 * Detects:
 *   - Network errors (DNS, timeout, TLS)
 *   - HTTP 4xx / 5xx
 *   - Parse errors (page structure changed)
 *   - Record-count drift (parser passes but emits suspiciously few records)
 *
 * Output:
 *   - Always: structured JSON to stdout
 *   - Always: one-line summary to stderr (CI-friendly)
 *   - If SLACK_WEBHOOK_URL set: failure summary POST'd to Slack
 *   - If REPORT_DIR set: full JSON report archived to {REPORT_DIR}/{date}.json
 *
 * Exits non-zero if any adapter failed — usable from cron / GitHub Actions.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { ADAPTERS } from "@/scrapers/sources";
import type { Adapter } from "@/scrapers/base/Adapter";
import { hashRecords } from "@/scrapers/base/Adapter";
import { politeFetch } from "@/scrapers/base/fetchClient";

type SourceResult = {
  id: string;
  name: string;
  status: "ok" | "drift" | "parse_error" | "http_error" | "network_error" | "skipped";
  recordCount: number;
  baseline: number | null;
  driftPct: number | null;
  parseError?: string;
  httpStatus?: number;
  networkError?: string;
  durationMs: number;
  hash: string | null;
};

const useFixture = process.argv.includes("--fixture");
const reportDir = process.env.REPORT_DIR ?? ".scrape-reports";
const slackWebhook = process.env.SLACK_WEBHOOK_URL;

// Drift threshold: warn if record count moves by more than this fraction
// vs. the previous run's baseline.
const DRIFT_PCT = 0.2;

async function loadFixture(adapter: Adapter): Promise<{ rawText: string; fetchUrl: string } | null> {
  if (!adapter.metadata.fixturePath) return null;
  const full = path.resolve(process.cwd(), adapter.metadata.fixturePath);
  if (!existsSync(full)) return null; // missing fixture → caller treats as "skipped"
  return { rawText: readFileSync(full, "utf8"), fetchUrl: `fixture://${adapter.metadata.fixturePath}` };
}

async function runOne(adapter: Adapter, baseline: number | null): Promise<SourceResult> {
  const started = Date.now();
  const base: Omit<SourceResult, "status" | "recordCount" | "hash"> = {
    id: adapter.metadata.id,
    name: adapter.metadata.name,
    baseline,
    driftPct: null,
    durationMs: 0,
  };

  // 1. Fetch
  let raw: { rawText: string; fetchUrl: string } | null = null;
  try {
    // Static-data adapters ship hand-curated records; their primaryUrls
    // are reference pages for users, not pages we actually scrape. Don't
    // probe those URLs — instead, parse the fixture to confirm the
    // adapter still emits records, which is the real health signal.
    if (useFixture || adapter.metadata.staticData) {
      raw = await loadFixture(adapter);
      if (!raw) {
        return { ...base, status: "skipped", recordCount: 0, hash: null, durationMs: Date.now() - started };
      }
    } else {
      const url = adapter.metadata.primaryUrls[0];
      if (!url) {
        return {
          ...base,
          status: "skipped",
          recordCount: 0,
          hash: null,
          durationMs: Date.now() - started,
          networkError: "No primaryUrls configured",
        };
      }
      const res = await politeFetch(url);
      if (!res.ok) {
        return {
          ...base,
          status: "http_error",
          recordCount: 0,
          hash: null,
          httpStatus: res.status,
          durationMs: Date.now() - started,
        };
      }
      raw = { rawText: await res.text(), fetchUrl: url };
    }
  } catch (err) {
    return {
      ...base,
      status: "network_error",
      recordCount: 0,
      hash: null,
      networkError: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - started,
    };
  }

  // 2. Parse
  const parsed = await adapter.parse(raw);
  const hash = hashRecords(parsed.records);
  const driftPct =
    baseline != null && baseline > 0
      ? Math.abs(parsed.records.length - baseline) / baseline
      : null;

  if (parsed.parseError) {
    return {
      ...base,
      status: "parse_error",
      recordCount: parsed.records.length,
      hash,
      parseError: parsed.parseError,
      driftPct,
      durationMs: Date.now() - started,
    };
  }

  if (driftPct != null && driftPct >= DRIFT_PCT) {
    return {
      ...base,
      status: "drift",
      recordCount: parsed.records.length,
      hash,
      driftPct,
      durationMs: Date.now() - started,
    };
  }

  return {
    ...base,
    status: "ok",
    recordCount: parsed.records.length,
    hash,
    driftPct,
    durationMs: Date.now() - started,
  };
}

function loadBaselines(): Record<string, number> {
  const file = path.resolve(reportDir, "baselines.json");
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function saveBaselines(results: SourceResult[]) {
  const file = path.resolve(reportDir, "baselines.json");
  mkdirSync(reportDir, { recursive: true });
  const data: Record<string, number> = {};
  for (const r of results) {
    if (r.status === "ok") data[r.id] = r.recordCount;
  }
  writeFileSync(file, JSON.stringify(data, null, 2));
}

// Slack severity mapping. We split adapter results into red (parse / http /
// network failures), amber (record-count drift), green (ok). Always send a
// daily digest — silence is worse than noise when everything's healthy.
const SEVERITY_EMOJI: Record<SourceResult["status"], string> = {
  ok: ":large_green_circle:",
  drift: ":warning:",
  parse_error: ":rotating_light:",
  http_error: ":rotating_light:",
  network_error: ":rotating_light:",
  skipped: ":white_circle:",
};

async function notifySlack(results: SourceResult[]) {
  if (!slackWebhook) return;
  if (process.env.SCHEDULER_DRY_RUN === "true") {
    console.error("[slack] dry-run mode, skipping notification");
    return;
  }

  const failures = results.filter((r) => r.status === "parse_error" || r.status === "http_error" || r.status === "network_error");
  const drifts = results.filter((r) => r.status === "drift");
  const ok = results.filter((r) => r.status === "ok").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  // Block-formatted message — Slack renders better than plain text.
  const blocks: unknown[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text:
          failures.length > 0
            ? `🚨 visa-lookup: ${failures.length} adapter${failures.length === 1 ? "" : "s"} need attention`
            : drifts.length > 0
            ? `⚠️ visa-lookup: ${drifts.length} adapter${drifts.length === 1 ? "" : "s"} drifting`
            : `✅ visa-lookup: all ${ok} adapters healthy`,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Healthy:*\n${ok}` },
        { type: "mrkdwn", text: `*Drifting:*\n${drifts.length}` },
        { type: "mrkdwn", text: `*Failing:*\n${failures.length}` },
        { type: "mrkdwn", text: `*Skipped:*\n${skipped}` },
      ],
    },
  ];

  if (failures.length > 0 || drifts.length > 0) {
    const detail = [...failures, ...drifts].map(
      (r) =>
        `${SEVERITY_EMOJI[r.status]} *${r.name}* (\`${r.id}\`) — ${r.status}` +
        `${r.parseError ? `\n   _parseError:_ ${r.parseError}` : ""}` +
        `${r.httpStatus ? `\n   _HTTP_ ${r.httpStatus}` : ""}` +
        `${r.networkError ? `\n   _network:_ ${r.networkError}` : ""}` +
        `${r.driftPct != null ? `\n   _drift:_ ${(r.driftPct * 100).toFixed(0)}% (was ${r.baseline}, now ${r.recordCount})` : ""}`,
    );
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: detail.join("\n\n"),
      },
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Source: \`npm run check-sources\` · See <${process.env.GITHUB_RUN_URL ?? "https://example.com/admin/sources"}|admin dashboard>`,
      },
    ],
  });

  try {
    await fetch(slackWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
  } catch (err) {
    console.error("Slack notification failed:", err);
  }
}

async function main() {
  const baselines = loadBaselines();
  const results: SourceResult[] = [];

  for (const adapter of ADAPTERS) {
    const baseline = baselines[adapter.metadata.id] ?? null;
    process.stderr.write(`Checking ${adapter.metadata.id}... `);
    const result = await runOne(adapter, baseline);
    results.push(result);
    process.stderr.write(`${result.status} (${result.recordCount} records, ${result.durationMs}ms)\n`);
  }

  // Persist a dated report and update baselines.
  mkdirSync(reportDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  writeFileSync(
    path.resolve(reportDir, `${date}.json`),
    JSON.stringify({ ranAt: new Date().toISOString(), useFixture, results }, null, 2),
  );
  saveBaselines(results);

  await notifySlack(results);

  // Stdout JSON for CI consumers.
  console.log(JSON.stringify({ ranAt: new Date().toISOString(), useFixture, results }, null, 2));

  const failed = results.filter((r) => r.status !== "ok" && r.status !== "skipped");
  process.stderr.write(
    failed.length === 0
      ? `\n✓ All ${results.length} sources healthy.\n`
      : `\n✗ ${failed.length}/${results.length} sources failing: ${failed.map((f) => f.id).join(", ")}\n`,
  );

  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
