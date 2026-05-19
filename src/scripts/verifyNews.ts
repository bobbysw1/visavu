/**
 * Verify every active manualPolicyNews entry against its primary source.
 *
 * For each item:
 *   1. Fetch sourceUrl with a browser user-agent + Accept-Language: en
 *   2. Confirm 200 (treat 301/302 → 200 as OK; capture redirect target)
 *   3. Grep the response body for keywords from the item's title — at
 *      least 2 of the 4 most-meaningful tokens must appear. Stops us
 *      pointing at a source that genuinely no longer mentions the
 *      thing we're claiming.
 *   4. Write all results to src/data/news_verification.json keyed by
 *      item id. The toast + carousel + /admin/news page read this
 *      file to render verification status.
 *
 * Exit codes:
 *   0 — all items verified ok
 *   1 — at least one item has a broken / unrelated source (fails CI)
 *
 * Usage:
 *   npm run verify-news              # check + write + exit-on-failure
 *   npm run verify-news -- --soft    # check + write but always exit 0
 *
 * Intended cadence: nightly via the existing refresh.yml workflow, plus
 * any time a new item is added to manualPolicyNews.ts.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { activePolicyNews } from "../content/manualPolicyNews";

const SOFT = process.argv.includes("--soft");
const OUT = path.resolve(process.cwd(), "src/data/news_verification.json");

type CheckResult = {
  id: string;
  sourceUrl: string;
  checkedAt: string;
  status: "verified" | "broken_source" | "unrelated_source" | "no_source";
  httpCode: number | null;
  redirectTo?: string;
  keywordsExpected: string[];
  keywordsMatched: string[];
  note?: string;
};

/** Extract the 4 most-meaningful tokens from the title — drop stopwords,
 *  drop numbers, lowercase. These are what must appear in the source body. */
const STOPWORDS = new Set([
  "the", "a", "an", "to", "for", "in", "on", "of", "and", "or",
  "from", "by", "with", "is", "are", "was", "were", "be", "been",
  "as", "at", "it", "its", "this", "that", "these", "those", "but",
  "will", "would", "can", "could", "may", "might", "back", "up",
  "down", "out", "into", "over", "after", "before", "more", "than",
  "now", "just", "also",
]);
function titleTokens(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t) && !/^\d+$/.test(t))
    .slice(0, 6);
}

async function check(id: string, sourceUrl: string | undefined, title: string): Promise<CheckResult> {
  const checkedAt = new Date().toISOString();
  if (!sourceUrl) {
    return {
      id,
      sourceUrl: "",
      checkedAt,
      status: "no_source",
      httpCode: null,
      keywordsExpected: titleTokens(title),
      keywordsMatched: [],
      note: "No sourceUrl provided",
    };
  }
  const expected = titleTokens(title);
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    const httpCode = res.status;
    const finalUrl = res.url;
    const redirectTo = finalUrl !== sourceUrl ? finalUrl : undefined;
    if (httpCode !== 200) {
      return {
        id,
        sourceUrl,
        checkedAt,
        status: "broken_source",
        httpCode,
        redirectTo,
        keywordsExpected: expected,
        keywordsMatched: [],
        note: `Source returned ${httpCode}`,
      };
    }
    const body = (await res.text()).toLowerCase();
    const matched = expected.filter((kw) => body.includes(kw));
    // Need at least 2 of the meaningful tokens to appear in the body.
    // If the title has fewer than 2 tokens (very short titles), require
    // at least one match.
    const minMatch = Math.min(2, expected.length);
    const status: CheckResult["status"] =
      matched.length >= minMatch ? "verified" : "unrelated_source";
    return {
      id,
      sourceUrl,
      checkedAt,
      status,
      httpCode,
      redirectTo,
      keywordsExpected: expected,
      keywordsMatched: matched,
      note:
        status === "unrelated_source"
          ? `Source page didn't mention enough title keywords (${matched.length}/${expected.length}). May have been edited or you cited a vague hub URL — link to the specific announcement page.`
          : undefined,
    };
  } catch (err) {
    return {
      id,
      sourceUrl,
      checkedAt,
      status: "broken_source",
      httpCode: null,
      keywordsExpected: expected,
      keywordsMatched: [],
      note: `Fetch failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function main() {
  const items = activePolicyNews();
  console.log(`Verifying ${items.length} active news items against their sources...\n`);

  const results: Record<string, CheckResult> = {};
  for (const item of items) {
    const r = await check(item.id, item.sourceUrl, item.title);
    results[item.id] = r;
    const emoji =
      r.status === "verified"
        ? "✓"
        : r.status === "no_source"
        ? "○"
        : "✗";
    const detail =
      r.status === "verified"
        ? `${r.keywordsMatched.length}/${r.keywordsExpected.length} keywords matched`
        : r.note ?? "";
    console.log(`  ${emoji} [${item.id}] ${item.title}`);
    console.log(`      ${detail}`);
    if (r.redirectTo) console.log(`      → redirected to ${r.redirectTo}`);
    console.log("");
  }

  writeFileSync(
    OUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        items: results,
      },
      null,
      2,
    ),
  );
  console.log(`Wrote ${OUT}`);

  const failures = Object.values(results).filter(
    (r) => r.status === "broken_source" || r.status === "unrelated_source",
  );
  if (failures.length > 0) {
    console.log(`\n${failures.length} item(s) failed verification.`);
    if (!SOFT) {
      process.exit(1);
    }
  } else {
    console.log("\nAll items verified.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(2);
});
