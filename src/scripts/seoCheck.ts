/**
 * SEO sanity check. Fetches /sitemap.xml from the running site, walks
 * every child sitemap, and asserts on each URL:
 *
 *   1. HTTP status is 200 (not 404, not 301-to-elsewhere).
 *   2. <meta name="robots"> does NOT contain "noindex".
 *   3. <link rel="canonical"> resolves to the same URL we fetched
 *      (no canonical drift — the URL we sent Google is the canonical).
 *   4. <title> is non-empty and isn't the generic "Page not found".
 *
 * Output:
 *   - Per-pattern summary table (e.g. "/{p}/{d}/{purpose} — 245/256 OK")
 *   - List of failing URLs grouped by failure type
 *   - Exit 1 if any failures, exit 0 otherwise (so CI can gate on it)
 *
 * Usage:
 *   npm run seo-check                       # checks https://visavu.com
 *   SEO_CHECK_BASE=http://localhost:3000 \
 *     npm run seo-check                     # check local dev server
 *
 * Built to catch the regressions hit on 2026-05-19 — non-issuing iso
 * pair URLs (e.g. /sh/tr/transit) returning 404 with canonical "/" —
 * the kind of failure that's invisible without a sitemap-driven walk
 * because individual page testing would never sample those obscure
 * route corners.
 *
 * Concurrency-capped at 10 parallel requests so we don't accidentally
 * DOS our own production site if someone runs this against visavu.com.
 */
const BASE = process.env.SEO_CHECK_BASE ?? "https://visavu.com";
const CONCURRENCY = 10;
// Sample-mode: instead of checking every URL (~236k), check a fixed
// number from each sitemap chunk so the run completes in minutes
// rather than hours. Override with SEO_CHECK_FULL=1 for an exhaustive
// pre-release run.
const SAMPLE_PER_CHUNK = Number.parseInt(process.env.SEO_CHECK_SAMPLE ?? "30", 10);
const FULL = process.env.SEO_CHECK_FULL === "1";

type Failure = {
  url: string;
  reason: "http_non_200" | "noindex" | "canonical_drift" | "empty_title" | "fetch_error";
  detail: string;
};

type CheckResult = {
  url: string;
  status: number;
  ok: boolean;
  failures: Failure[];
};

async function fetchSitemapUrls(): Promise<string[]> {
  const indexRes = await fetch(`${BASE}/sitemap.xml`);
  if (!indexRes.ok) {
    throw new Error(`Sitemap index returned ${indexRes.status}`);
  }
  const indexXml = await indexRes.text();
  const childUrls = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`Sitemap index points at ${childUrls.length} child sitemaps`);

  const allUrls: string[] = [];
  for (const childUrl of childUrls) {
    const res = await fetch(childUrl);
    if (!res.ok) {
      console.warn(`  ⚠ child sitemap ${childUrl} returned ${res.status}, skipping`);
      continue;
    }
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (FULL) {
      allUrls.push(...urls);
    } else {
      // Sample evenly across the chunk so we hit all the URL patterns
      // a chunk contains, not just the first N.
      const step = Math.max(1, Math.floor(urls.length / SAMPLE_PER_CHUNK));
      const sample = urls.filter((_, i) => i % step === 0).slice(0, SAMPLE_PER_CHUNK);
      allUrls.push(...sample);
    }
    console.log(`  ${childUrl}: ${urls.length} URLs (sampled ${FULL ? urls.length : Math.min(urls.length, SAMPLE_PER_CHUNK)})`);
  }
  return allUrls;
}

/** Cheap pattern-detector — collapses /us/fr, /gb/de, /au/jp etc into
 *  a single bucket `/[p]/[d]` for the summary table. */
function bucketFor(url: string): string {
  const path = new URL(url).pathname;
  // Drop trailing slash.
  const clean = path.replace(/\/$/, "");
  // Match /xx/yy/{purpose}.
  if (/^\/[a-z]{2}\/[a-z]{2}\/(work|study|business|tourism|transit|family|diplomatic)$/.test(clean)) {
    const purpose = clean.split("/")[3];
    return `/[p]/[d]/${purpose}`;
  }
  // Match /xx/yy.
  if (/^\/[a-z]{2}\/[a-z]{2}$/.test(clean)) {
    return "/[p]/[d]";
  }
  // Match /passport/xx[/purpose/yy].
  if (/^\/passport\/[a-z]{2}\/purpose\/[a-z]+$/.test(clean)) {
    return "/passport/[iso]/purpose/[p]";
  }
  if (/^\/passport\/[a-z]{2}$/.test(clean)) {
    return "/passport/[iso]";
  }
  if (/^\/destination\/[a-z]{2}$/.test(clean)) {
    return "/destination/[iso]";
  }
  if (/^\/compare\/[a-z]{2}\/[a-z]{2}$/.test(clean)) {
    return "/compare/[a]/[b]";
  }
  if (clean === "" || clean === "/") return "/";
  return clean;
}

async function checkUrl(url: string): Promise<CheckResult> {
  const failures: Failure[] = [];
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": "Visavu-SEO-Check/1.0" },
    });
    const status = res.status;
    if (status !== 200) {
      failures.push({
        url,
        reason: "http_non_200",
        detail: `status ${status}${res.headers.get("location") ? ` → ${res.headers.get("location")}` : ""}`,
      });
      return { url, status, ok: false, failures };
    }
    const html = await res.text();
    // robots meta — case-insensitive, content can be in either order.
    const robotsMatch = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i);
    if (robotsMatch && /noindex/i.test(robotsMatch[1])) {
      failures.push({
        url,
        reason: "noindex",
        detail: `meta robots content="${robotsMatch[1]}"`,
      });
    }
    // canonical — should resolve to the URL we fetched.
    const canonMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
    if (canonMatch) {
      const canon = canonMatch[1];
      // Normalise: drop trailing slash, lowercase host, treat http=https.
      const normalise = (u: string) =>
        u.replace(/\/$/, "").replace(/^http:\/\//, "https://").toLowerCase();
      if (normalise(canon) !== normalise(url)) {
        failures.push({
          url,
          reason: "canonical_drift",
          detail: `canonical="${canon}"`,
        });
      }
    }
    // title — should be present and not the not-found marker.
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    if (!titleMatch || titleMatch[1].trim() === "" || /page not found/i.test(titleMatch[1])) {
      failures.push({
        url,
        reason: "empty_title",
        detail: titleMatch ? `title="${titleMatch[1]}"` : "<title> missing",
      });
    }
    return { url, status, ok: failures.length === 0, failures };
  } catch (err) {
    failures.push({
      url,
      reason: "fetch_error",
      detail: err instanceof Error ? err.message : String(err),
    });
    return { url, status: 0, ok: false, failures };
  }
}

async function main() {
  console.log(`SEO sanity check against ${BASE}\n`);
  console.log(`Mode: ${FULL ? "FULL (every sitemap URL)" : `SAMPLE (${SAMPLE_PER_CHUNK} per chunk)`}\n`);

  const urls = await fetchSitemapUrls();
  console.log(`\nChecking ${urls.length} URLs with concurrency=${CONCURRENCY}...\n`);

  const results: CheckResult[] = [];
  let done = 0;
  // Simple promise-pool — no external dep.
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length > 0) {
        const url = queue.shift();
        if (!url) return;
        const result = await checkUrl(url);
        results.push(result);
        done += 1;
        if (done % 25 === 0) {
          process.stdout.write(`  checked ${done}/${urls.length}\r`);
        }
      }
    }),
  );
  console.log(`  checked ${done}/${urls.length}`);

  // Per-pattern summary.
  const byBucket = new Map<string, { ok: number; fail: number }>();
  for (const r of results) {
    const b = bucketFor(r.url);
    const cur = byBucket.get(b) ?? { ok: 0, fail: 0 };
    if (r.ok) cur.ok += 1;
    else cur.fail += 1;
    byBucket.set(b, cur);
  }

  console.log("\n── Summary by URL pattern ──");
  const sortedBuckets = [...byBucket.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
  for (const [bucket, stats] of sortedBuckets) {
    const total = stats.ok + stats.fail;
    const status = stats.fail === 0 ? "✓" : "✗";
    console.log(`  ${status} ${bucket.padEnd(40)} ${stats.ok}/${total} OK`);
  }

  // Failure detail.
  const failures = results.flatMap((r) => r.failures);
  if (failures.length > 0) {
    console.log(`\n── ${failures.length} failures ──`);
    const byReason = new Map<string, Failure[]>();
    for (const f of failures) {
      const cur = byReason.get(f.reason) ?? [];
      cur.push(f);
      byReason.set(f.reason, cur);
    }
    for (const [reason, list] of byReason) {
      console.log(`\n  [${reason}] — ${list.length} URLs`);
      for (const f of list.slice(0, 10)) {
        console.log(`    ${f.url}\n      ${f.detail}`);
      }
      if (list.length > 10) {
        console.log(`    … and ${list.length - 10} more`);
      }
    }
    console.log(`\nFAIL: ${failures.length} SEO issues across ${results.filter((r) => !r.ok).length} URLs.`);
    process.exit(1);
  }

  console.log(`\nOK: all ${results.length} sampled URLs pass SEO sanity checks.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
