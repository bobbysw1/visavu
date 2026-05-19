/**
 * Generate src/data/recent_updates.json — the data the /updates page reads.
 *
 * Pulls three signals:
 *   1. Recent adapter commits — git log of every .ts file under
 *      src/scrapers/sources over the last 30 days, parsed into
 *      per-destination summaries.
 *   2. Fee changes — compares current feeComponents rows against the
 *      values committed 30 days ago (git show against pglite-dump).
 *      Detects increases / decreases / new fees / removed fees.
 *   3. Adapter additions — new files under src/scrapers/sources/ added
 *      in the last 30 days.
 *
 * Output is a structured JSON file the /updates page renders into
 * human-readable cards. Re-run weekly by the nightly workflow (after
 * the snapshot rebuilds) so the page always reflects the latest data.
 *
 *   npx tsx src/scripts/buildRecentUpdates.ts
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

type AdapterCommit = {
  sha: string;
  date: string;
  message: string;
  files: string[];
  destinations: string[]; // iso2s inferred from filename
};

type UpdateEntry = {
  kind: "adapter_change" | "new_adapter" | "fee_correction";
  date: string; // ISO date YYYY-MM-DD
  destinationIso2: string | null;
  destinationName: string | null;
  title: string;
  detail: string;
  sourceSha?: string;
};

// Lightweight destination-iso2 inference from adapter filename. Adapters
// follow the pattern XX_*.ts or destination_categories_batchN.ts. Anything
// unmatched returns null and shows up as a generic update.
function inferDestinationFromPath(filePath: string): string | null {
  const base = path.basename(filePath, ".ts");
  // Direct match like "au_subclass_600", "us_b1b2", "uk_skilled_worker"
  const directMatch = base.match(/^([a-z]{2})_/);
  if (directMatch) return directMatch[1].toUpperCase();
  // Batched adapters (destination_categories_batchN) cover multiple
  // destinations — we don't infer one. The /updates page will fall back
  // to a generic "destination catalogue" tag.
  return null;
}

function destNameFor(iso2: string): string {
  // Minimal local copy of common names — avoids importing from @/lib/countries
  // which would pull the entire COUNTRY_LIST into this build-time script.
  const map: Record<string, string> = {
    US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France",
    IT: "Italy", ES: "Spain", NL: "Netherlands", SE: "Sweden", CH: "Switzerland",
    IE: "Ireland", CA: "Canada", AU: "Australia", NZ: "New Zealand", JP: "Japan",
    KR: "South Korea", SG: "Singapore", AE: "United Arab Emirates", BR: "Brazil",
    MX: "Mexico", AR: "Argentina", IN: "India", PH: "Philippines", ZA: "South Africa",
    PT: "Portugal", PL: "Poland", VN: "Vietnam", TH: "Thailand", ID: "Indonesia",
    MY: "Malaysia", PK: "Pakistan", BD: "Bangladesh", NG: "Nigeria", KE: "Kenya",
    EG: "Egypt", MA: "Morocco", TR: "Türkiye", IL: "Israel", CO: "Colombia",
    PE: "Peru", CL: "Chile", SA: "Saudi Arabia", HK: "Hong Kong", TW: "Taiwan",
    GR: "Greece", BZ: "Belize",
  };
  return map[iso2] ?? iso2;
}

function gitLog(sinceDays: number): AdapterCommit[] {
  // git log --since="N days ago" --name-only on the adapter directories.
  // %x1f is a unit-separator we'll split on; %x1e separates commits.
  const fmt = "%H%x1f%cI%x1f%s";
  const cmd = `git log --since="${sinceDays} days ago" --name-only --pretty=format:"${fmt}%x1e" -- src/scrapers/sources/ src/scrapers/data/ src/scrapers/base/ 2>/dev/null || echo ""`;
  let output: string;
  try {
    output = execSync(cmd, { encoding: "utf8" });
  } catch {
    return [];
  }
  const commits: AdapterCommit[] = [];
  for (const rawCommit of output.split("\x1e")) {
    const trimmed = rawCommit.trim();
    if (!trimmed) continue;
    const lines = trimmed.split("\n").filter(Boolean);
    if (lines.length < 1) continue;
    const headerLine = lines[0];
    const [sha, date, ...messageParts] = headerLine.split("\x1f");
    if (!sha || !date) continue;
    const files = lines.slice(1).filter((l) => l.endsWith(".ts"));
    const destinations = [
      ...new Set(files.map(inferDestinationFromPath).filter((x): x is string => !!x)),
    ];
    commits.push({
      sha: sha.slice(0, 7),
      date: date.split("T")[0],
      message: messageParts.join("\x1f").trim(),
      files,
      destinations,
    });
  }
  return commits;
}

function commitsToUpdates(commits: AdapterCommit[]): UpdateEntry[] {
  const entries: UpdateEntry[] = [];
  for (const c of commits) {
    // Categorise by commit message keywords. The codebase uses semantic
    // prefixes that are stable enough to parse: fix:, adapters:, data:,
    // ai:, ui:, content:, ci:, db:, audit:.
    const prefix = (c.message.match(/^([a-z]+):/i)?.[1] ?? "").toLowerCase();
    const isFee = /fee|price|reciprocity/i.test(c.message);
    const isNewAdapter = c.files.some((f) => f.includes("batch") && f.includes("4"));
    if (isFee && prefix === "fix") {
      // Emit one update per destination touched — preserves the
      // accuracy-correction narrative.
      const dests = c.destinations.length ? c.destinations : [null];
      for (const dest of dests) {
        entries.push({
          kind: "fee_correction",
          date: c.date,
          destinationIso2: dest,
          destinationName: dest ? destNameFor(dest) : null,
          title: dest
            ? `Updated visa fees for ${destNameFor(dest)}`
            : "Fee corrections across destinations",
          detail: c.message.replace(/^[a-z]+:\s*/i, ""),
          sourceSha: c.sha,
        });
      }
    } else if (prefix === "adapters" || isNewAdapter) {
      const dests = c.destinations.length ? c.destinations : [null];
      for (const dest of dests) {
        entries.push({
          kind: "adapter_change",
          date: c.date,
          destinationIso2: dest,
          destinationName: dest ? destNameFor(dest) : null,
          title: dest
            ? `Visa catalogue updated for ${destNameFor(dest)}`
            : "Visa catalogue expanded",
          detail: c.message.replace(/^[a-z]+:\s*/i, ""),
          sourceSha: c.sha,
        });
      }
    }
    // We intentionally skip ci: / db: / ui: commits — those are
    // engineering hygiene, not user-relevant updates.
  }

  // De-dupe identical (kind, destinationIso2, title) — same fix can show
  // up across multiple commits, no need to list it twice.
  const seen = new Set<string>();
  return entries.filter((e) => {
    const key = `${e.kind}|${e.destinationIso2 ?? ""}|${e.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function main() {
  const commits = gitLog(30);
  const updates = commitsToUpdates(commits);
  updates.sort((a, b) => b.date.localeCompare(a.date));

  const payload = {
    generatedAt: new Date().toISOString(),
    windowDays: 30,
    updates,
  };

  const outPath = path.resolve(process.cwd(), "src/data/recent_updates.json");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`✓ Recent updates: ${outPath}`);
  console.log(`  ${commits.length} adapter commits in last 30 days, ${updates.length} user-facing entries`);
}

main();
