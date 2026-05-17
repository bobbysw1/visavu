/**
 * Vercel Cron endpoint — runs the same refresh worker as `npm run refresh`
 * but invoked by Vercel Cron (configured in vercel.json) once a day.
 *
 * Auth: requires `Authorization: Bearer <CRON_SECRET>` header on every call.
 * Vercel Cron automatically injects this when calling registered cron URLs.
 * Manual invocation from a developer machine must supply the same header.
 *
 * Behaviour:
 *   - Finds adapters whose lastFetchedAt is older than their default interval
 *   - Runs each, persists source_records + visa_options diffs
 *   - On parse_error, logs but continues — never fails the whole run
 *   - Returns JSON summary { ran, ok, failed, ids }
 *
 * Slack alerting (optional): if SLACK_WEBHOOK_URL is set, posts a one-line
 * summary after each run. Same hook the existing checkSources script uses.
 */
import type { NextRequest } from "next/server";
import { adaptersDueForRefresh, sourceHealthSnapshot } from "@/lib/sourceHealth";
import { adapterById, ADAPTERS } from "@/scrapers/sources";
import { runAdapter } from "@/scrapers/base/runAdapter";

// Cron jobs can run for up to ~5 minutes on Vercel's hobby tier; pro allows
// more. Set explicit max duration to surface a clean timeout rather than
// silent termination.
export const maxDuration = 300;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RunResult = {
  id: string;
  ok: boolean;
  recordCount: number;
  reason?: string;
};

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return Response.json(
      { error: "CRON_SECRET not configured on server" },
      { status: 500 },
    );
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional ?all=1 forces every adapter (useful for first deploy or after
  // an outage). Default is "due" only.
  const force = request.nextUrl.searchParams.get("all") === "1";

  let toRun: string[];
  if (force) {
    toRun = ADAPTERS.map((a) => a.metadata.id);
  } else {
    try {
      toRun = await adaptersDueForRefresh();
    } catch (err) {
      return Response.json(
        {
          error: "Failed to compute due adapters",
          reason: err instanceof Error ? err.message : String(err),
        },
        { status: 500 },
      );
    }
  }

  if (toRun.length === 0) {
    const snapshot = await sourceHealthSnapshot();
    return Response.json({
      ran: 0,
      ok: 0,
      failed: 0,
      message: `No adapters due. ${snapshot.length} healthy.`,
    });
  }

  const startedAt = new Date().toISOString();
  const results: RunResult[] = [];

  for (const id of toRun) {
    const adapter = adapterById(id);
    if (!adapter) continue;
    try {
      const r = await runAdapter(adapter, { useFixture: false });
      const ok = !r.parseError;
      results.push({ id, ok, recordCount: r.recordsCount, reason: r.parseError ?? undefined });
    } catch (err) {
      results.push({
        id,
        ok: false,
        recordCount: 0,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const failedResults = results.filter((r) => !r.ok);
  const summary = {
    ran: results.length,
    ok: results.length - failedResults.length,
    failed: failedResults.length,
    startedAt,
    finishedAt: new Date().toISOString(),
    failedIds: failedResults.map((r) => r.id),
  };

  // Optional Slack alerting — fire-and-forget so cron return time isn't
  // blocked on Slack latency.
  await postSlackSummary(summary).catch(() => undefined);

  return Response.json(summary);
}

async function postSlackSummary(summary: {
  ran: number;
  ok: number;
  failed: number;
  failedIds: string[];
}): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const status = summary.failed === 0 ? "✓" : "✗";
  const text =
    summary.failed === 0
      ? `${status} Cron refresh: ${summary.ok}/${summary.ran} adapters refreshed cleanly.`
      : `${status} Cron refresh: ${summary.failed}/${summary.ran} adapters failed — ${summary.failedIds.join(", ")}.`;

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
}
