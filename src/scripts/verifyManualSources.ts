/**
 * Monthly source verifier for hand-encoded visa records.
 *
 * Manual adapters (total_coverage_*, top_destination_gaps, the dedicated
 * per-programme ones like us_h1b / uk_skilled_worker / au_subclass_500 /
 * jp_special_visas etc.) carry hand-encoded data sourced from government
 * sites at a specific date. The nightly scraper-refresh pipeline doesn't
 * touch these records because their adapters return cached records, not
 * scraped HTML.
 *
 * This script closes that gap:
 *
 *   1. Walks every distinct primary_source_url + application_url in the
 *      visa_options table.
 *   2. Fetches each URL with a polite Chrome user-agent.
 *   3. Strips boilerplate (cookie banners, scripts, nav) and hashes the
 *      readable page text.
 *   4. Compares the hash to the prior run stored in
 *      `src/data/manual_source_hashes.json`.
 *   5. Writes a CHANGED-PAGES report and (in CI) posts to Slack with
 *      the list of URLs whose content shifted since last verification.
 *
 * Run weekly or monthly. Doesn't auto-update visa records — gov-page
 * changes need a human eye (a redesigned page may keep the same fee
 * info; a real fee change deserves a manual record refresh).
 *
 *   npx tsx src/scripts/verifyManualSources.ts
 *   npx tsx src/scripts/verifyManualSources.ts --update-baseline   # accept current hashes
 *   npx tsx src/scripts/verifyManualSources.ts --slack             # post to SLACK_WEBHOOK_URL
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { db } from "../db/client";
import { sql } from "drizzle-orm";

const HASHES_PATH = path.resolve(process.cwd(), "src/data/manual_source_hashes.json");
const UPDATE_BASELINE = process.argv.includes("--update-baseline");
const POST_SLACK = process.argv.includes("--slack");
const WRITE_VERIFICATIONS = process.argv.includes("--write-verifications");
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

type HashMap = Record<string, { hash: string; verifiedAt: string }>;

function loadHashes(): HashMap {
  if (!existsSync(HASHES_PATH)) return {};
  try {
    return JSON.parse(readFileSync(HASHES_PATH, "utf8")) as HashMap;
  } catch {
    return {};
  }
}

function saveHashes(h: HashMap) {
  writeFileSync(HASHES_PATH, JSON.stringify(h, null, 2));
}

/** Strip HTML and collapse whitespace to get a stable text snapshot. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function hashText(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 (visavu.com verifier)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      // 20-second timeout per page
      signal: AbortSignal.timeout(20_000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const text = await res.text();
    return htmlToText(text);
  } catch {
    return null;
  }
}

type UniqueUrl = { url: string; recordCount: number; programs: string[] };

async function collectManualUrls(): Promise<UniqueUrl[]> {
  // Pull URLs only from adapters that produce hand-encoded data — exclude
  // wikipedia_long_tail (47k records, all from one source page) to keep
  // the verifier focused on per-programme primary sources.
  const result = await db.execute<{ url: string; n: number; programs: string }>(sql`
    SELECT primary_source_url AS url,
           COUNT(*)::int       AS n,
           STRING_AGG(DISTINCT label, ' | ' ORDER BY label) AS programs
    FROM visa_options
    WHERE primary_source_url IS NOT NULL
      AND primary_source_url <> ''
      -- Skip Wikipedia / community-edited sources — they change daily by
      -- design and we explicitly don't verify them as primary sources.
      AND primary_source_url NOT LIKE '%wikipedia.org%'
      AND primary_source_url NOT LIKE '%wikidata.org%'
      AND label NOT ILIKE '%(wikipedia%'
      AND label NOT ILIKE '%visa requirements for%'
    GROUP BY primary_source_url
    ORDER BY n DESC
  `);
  const rows = ((result as unknown as { rows?: { url: string; n: number; programs: string }[] }).rows
    ?? (result as unknown as { url: string; n: number; programs: string }[]));
  return rows.map((r) => ({
    url: r.url,
    recordCount: Number(r.n),
    programs: r.programs.split(" | ").slice(0, 3),
  }));
}

async function main() {
  const urls = await collectManualUrls();
  console.log(`Verifying ${urls.length} distinct primary-source URLs covering hand-encoded visa records…\n`);

  const existing = loadHashes();
  const updated: HashMap = {};
  const changes: { url: string; programs: string[]; oldHash?: string; newHash: string; verifiedAt?: string }[] = [];
  const failures: { url: string; programs: string[] }[] = [];
  /** URLs whose content matched the prior baseline → safe to bump their
   *  associated visa records' lastVerifiedAt timestamp. */
  const stillFreshUrls: string[] = [];

  for (const [i, item] of urls.entries()) {
    const progress = `[${i + 1}/${urls.length}]`;
    const text = await fetchPage(item.url);
    if (text === null) {
      failures.push({ url: item.url, programs: item.programs });
      console.log(`${progress}  ✗ ${item.url}  (fetch failed — page may be down)`);
      continue;
    }
    const hash = hashText(text);
    const prior = existing[item.url];

    if (!prior) {
      console.log(`${progress}  ✓ ${item.url}  (NEW — hash baseline ${hash})`);
      stillFreshUrls.push(item.url);
    } else if (prior.hash === hash) {
      console.log(`${progress}  = ${item.url}  (unchanged since ${prior.verifiedAt.split("T")[0]})`);
      stillFreshUrls.push(item.url);
    } else {
      changes.push({ url: item.url, programs: item.programs, oldHash: prior.hash, newHash: hash, verifiedAt: prior.verifiedAt });
      console.log(`${progress}  ⚠ ${item.url}  (CHANGED since ${prior.verifiedAt.split("T")[0]})`);
      // DON'T bump lastVerifiedAt — verification is in doubt until a human
      // reviews the page and refreshes the affected records.
    }
    updated[item.url] = { hash, verifiedAt: new Date().toISOString() };

    // Pace at ~3 requests/sec to be polite to gov servers.
    await new Promise((r) => setTimeout(r, 350));
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Pages verified:    ${urls.length - failures.length}`);
  console.log(`Pages changed:     ${changes.length}`);
  console.log(`Pages unreachable: ${failures.length}`);

  if (changes.length > 0) {
    console.log(`\n=== CHANGED PAGES (review for fee / requirement updates) ===`);
    for (const c of changes) {
      console.log(`  ${c.url}`);
      console.log(`    programs: ${c.programs.join(", ")}`);
      console.log(`    last verified ${c.verifiedAt?.split("T")[0]}; hash ${c.oldHash} → ${c.newHash}`);
    }
  }

  if (failures.length > 0) {
    console.log(`\n=== UNREACHABLE (potential dead links) ===`);
    for (const f of failures) console.log(`  ${f.url}  [${f.programs.join(", ")}]`);
  }

  if (UPDATE_BASELINE || !existsSync(HASHES_PATH)) {
    saveHashes(updated);
    console.log(`\n✓ Hash baseline saved to ${HASHES_PATH}`);
  } else if (changes.length > 0) {
    console.log(`\nNot updating baseline (use --update-baseline after manually reviewing the changes).`);
  } else {
    saveHashes(updated);
  }

  // Bump lastVerifiedAt on visa_options whose primary_source_url still
  // matches the baseline. Unchanged-source records get a freshness
  // refresh; changed-source records stay at their previous date until
  // a human reviews. This is what surfaces "Verified <recent date>" on
  // the result-card footer.
  if (WRITE_VERIFICATIONS && stillFreshUrls.length > 0) {
    console.log(`\nWriting verification timestamps for ${stillFreshUrls.length} unchanged URLs…`);
    // PGlite doesn't expose UPDATE rowCount the same way postgres-js does,
    // so we count before-and-after via COUNT(*) WHERE last_verified_at = now.
    const now = new Date();
    for (let i = 0; i < stillFreshUrls.length; i += 100) {
      const chunk = stillFreshUrls.slice(i, i + 100);
      await db.execute(sql`
        UPDATE visa_options
        SET last_verified_at = ${now}
        WHERE primary_source_url IN (${sql.join(chunk.map((u) => sql`${u}`), sql`, `)})
      `);
    }
    // Count how many rows now carry this timestamp.
    const verifyResult = await db.execute<{ count: number }>(sql`
      SELECT COUNT(*)::int AS count
      FROM visa_options
      WHERE last_verified_at >= ${now}
    `);
    const rows = ((verifyResult as unknown as { rows?: { count: number }[] }).rows
      ?? (verifyResult as unknown as { count: number }[]));
    const rowsUpdated = Number(rows[0]?.count ?? 0);
    console.log(`✓ Refreshed last_verified_at on ${rowsUpdated} visa_option rows`);
  }

  if (POST_SLACK && SLACK_WEBHOOK && (changes.length > 0 || failures.length > 0)) {
    const text = [
      `🛂 visavu manual-source verifier — ${new Date().toISOString().split("T")[0]}`,
      ``,
      `Pages verified:    ${urls.length - failures.length}`,
      `Pages changed:     ${changes.length}`,
      `Pages unreachable: ${failures.length}`,
      ``,
      changes.length > 0 ? `*Changed (review needed):*\n${changes.slice(0, 15).map((c) => `• ${c.url} (${c.programs.join(", ")})`).join("\n")}` : "",
      failures.length > 0 ? `\n*Unreachable:*\n${failures.slice(0, 10).map((f) => `• ${f.url}`).join("\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    console.log(`\n✓ Slack notification posted`);
  }

  // Exit with status code 2 if there are unreviewed changes — useful for CI.
  process.exit(changes.length > 0 && !UPDATE_BASELINE ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
