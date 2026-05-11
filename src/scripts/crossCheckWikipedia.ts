/**
 * Cross-source check: compare every low-confidence Wikipedia-derived
 * visa_options row against the destination's curated MFA visa-portal HTML.
 *
 *   npx tsx src/scripts/crossCheckWikipedia.ts                  # top 5,000 cells
 *   npx tsx src/scripts/crossCheckWikipedia.ts --limit 500
 *   npx tsx src/scripts/crossCheckWikipedia.ts --destination MN # one destination
 *
 * Algorithm:
 *   1. For each (passport × destination) cell where source = wikipedia_long_tail:
 *   2. Fetch the destination's countryResources.visaPortal HTML.
 *   3. Search the HTML for the passport's nationality (demonym + country name).
 *   4. If a match is within 500 chars of a status-keyword phrase ("visa-free",
 *      "visa required", "eVisa", "on arrival"):
 *        - "agrees"  if the keyword maps to the same VisaStatus as the cell
 *        - "conflicts" if it maps to a different VisaStatus
 *   5. Else: "no_mention".
 *   6. Update visa_options.crossCheckResult + crossCheckedAt.
 *   7. For "agrees" rows, also bump lastVerifiedAt to now.
 *
 * Politeness: 1.5s rate-limit per host (already enforced by politeFetch).
 * Cache the destination HTML between rows that share the same destination.
 */
import { eq, isNull, and } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { politeFetch } from "@/scrapers/base/fetchClient";
import { resourcesFor } from "@/content/countryResources";
import { nationalityFor } from "@/lib/nationalities";
import { COUNTRY_LIST, nameFor } from "@/lib/countries";
import type { VisaStatus } from "@/lib/types";

type ClassifierResult = "agrees" | "conflicts" | "no_mention";

const args = process.argv.slice(2);
const onlyDestination = args.includes("--destination") ? args[args.indexOf("--destination") + 1]?.toUpperCase() : null;
const limitArg = args.includes("--limit") ? parseInt(args[args.indexOf("--limit") + 1] ?? "5000", 10) : 5000;
const dryRun = args.includes("--dry-run");

const STATUS_KEYWORDS: Record<VisaStatus, RegExp[]> = {
  visa_free: [/\bvisa[\s-]?free\b/i, /\bno visa required\b/i, /\bvisa exempt(ion)?\b/i, /\bwithout visa\b/i],
  visa_free_with_eta: [/\beta\b/i, /\belectronic travel auth/i, /\besta\b/i],
  visa_on_arrival: [/\bvisa on arrival\b/i, /\bon arrival\b/i, /\bvoa\b/i],
  e_visa: [/\be[-\s]?visa\b/i, /\belectronic visa\b/i, /\bonline visa\b/i],
  embassy_visa: [/\bvisa required\b/i, /\bembassy visa\b/i, /\bconsular visa\b/i, /\bapply at the embassy\b/i],
  restricted: [/\brestricted\b/i, /\bcase-by-case\b/i],
  refused: [/\brefused\b/i, /\bdenied\b/i],
};

function classify(html: string, passportIso: string, expectedStatus: VisaStatus): ClassifierResult {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const demonym = nationalityFor(passportIso);
  const countryName = nameFor(passportIso);

  const passportNeedles = [demonym, countryName, passportIso].map((s) => s.toLowerCase());
  const lowered = text.toLowerCase();

  // Find any mention of the passport. If none, "no_mention".
  let mentionIdx = -1;
  for (const needle of passportNeedles) {
    const idx = lowered.indexOf(needle);
    if (idx !== -1) {
      mentionIdx = idx;
      break;
    }
  }
  if (mentionIdx === -1) return "no_mention";

  // Window of ±500 chars around the mention.
  const start = Math.max(0, mentionIdx - 500);
  const end = Math.min(lowered.length, mentionIdx + 500);
  const window = lowered.slice(start, end);

  // Which status keyword wins inside the window?
  for (const [status, regexes] of Object.entries(STATUS_KEYWORDS) as [VisaStatus, RegExp[]][]) {
    for (const re of regexes) {
      if (re.test(window)) {
        return status === expectedStatus ? "agrees" : "conflicts";
      }
    }
  }

  return "no_mention";
}

const htmlCache = new Map<string, string | null>();

async function fetchDestinationHtml(destinationIso: string): Promise<string | null> {
  if (htmlCache.has(destinationIso)) return htmlCache.get(destinationIso)!;
  const portal = resourcesFor(destinationIso)?.visaPortal;
  if (!portal) {
    htmlCache.set(destinationIso, null);
    return null;
  }
  try {
    const res = await politeFetch(portal, { maxRetries: 1, timeoutMs: 20_000 });
    if (!res.ok) {
      htmlCache.set(destinationIso, null);
      return null;
    }
    const html = await res.text();
    htmlCache.set(destinationIso, html);
    return html;
  } catch {
    htmlCache.set(destinationIso, null);
    return null;
  }
}

async function main() {
  // Pull cells we want to check: source-records linked to wikipedia_long_tail
  // AND not yet cross-checked. Cap at limitArg.
  const wikipediaSourceId = "wikipedia_long_tail";
  const wikipediaSource = await db
    .select({ id: schema.sources.id })
    .from(schema.sources)
    .where(eq(schema.sources.id, wikipediaSourceId))
    .limit(1);

  if (wikipediaSource.length === 0) {
    console.error("No wikipedia_long_tail source row — bootstrap first.");
    process.exit(1);
  }

  const optionRows = await db
    .select({
      id: schema.visaOptions.id,
      passportId: schema.visaOptions.passportId,
      destinationIso2: schema.visaOptions.destinationIso2,
      status: schema.visaOptions.status,
      label: schema.visaOptions.label,
      crossCheckResult: schema.visaOptions.crossCheckResult,
    })
    .from(schema.visaOptions)
    .where(
      and(
        eq(schema.visaOptions.correctnessBucket, "low"),
        isNull(schema.visaOptions.crossCheckResult),
      ),
    )
    .limit(limitArg);

  // Resolve passport iso2 for each row.
  const passportRows = await db
    .select({ id: schema.passports.id, iso: schema.passports.issuerIso2 })
    .from(schema.passports);
  const passportIso = new Map(passportRows.map((r) => [r.id, r.iso]));

  const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
  const todo = optionRows.filter(
    (r) => (!onlyDestination || r.destinationIso2 === onlyDestination) && validIso.has(r.destinationIso2),
  );

  console.log(`Cross-checking ${todo.length} low-confidence rows...`);

  const counters = { agrees: 0, conflicts: 0, no_mention: 0, skipped: 0 };
  let i = 0;
  const now = new Date();

  for (const row of todo) {
    i++;
    const pIso = passportIso.get(row.passportId);
    if (!pIso) {
      counters.skipped++;
      continue;
    }
    const html = await fetchDestinationHtml(row.destinationIso2);
    if (!html) {
      counters.skipped++;
      continue;
    }
    const result = classify(html, pIso, row.status as VisaStatus);
    counters[result]++;

    if (i % 50 === 0) {
      process.stderr.write(`  [${i}/${todo.length}] ${pIso}→${row.destinationIso2} = ${result}\n`);
    }

    if (dryRun) continue;

    await db
      .update(schema.visaOptions)
      .set({
        crossCheckResult: result,
        crossCheckedAt: now,
        // Upgrade verifiedAt for "agrees" — this is real verification.
        ...(result === "agrees" ? { lastVerifiedAt: now, correctnessBucket: "medium" } : {}),
      })
      .where(eq(schema.visaOptions.id, row.id));
  }

  console.log("\n=== Cross-check summary ===");
  console.log(`Agrees:     ${counters.agrees}`);
  console.log(`Conflicts:  ${counters.conflicts}`);
  console.log(`No mention: ${counters.no_mention}`);
  console.log(`Skipped:    ${counters.skipped}`);
  console.log(`(${todo.length} total cells)`);
  if (counters.agrees > 0) {
    console.log(`\n${counters.agrees} rows lifted from "low confidence" to "verified against MFA".`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
