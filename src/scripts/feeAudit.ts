/**
 * Visa fee audit — extracts every distinct (destination, visa label, fee)
 * from the database and writes a sorted markdown table to audit/FEES_<date>.md
 * so a human can sanity-check fees against current government sources.
 *
 *   npx tsx src/scripts/feeAudit.ts
 *
 * Output: a sortable per-destination + per-fee report. Useful for spotting
 * stale fees (e.g. AU 482 was AUD $1,495 pre-July 2024 → $3,210 after; the
 * audit will surface the recorded value so a human can compare against the
 * current immi.homeaffairs.gov.au fee schedule).
 *
 * Refresh cadence: run quarterly after the nightly adapter refresh — most
 * government fee schedules revise annually (typically July or January).
 */
import { db, schema } from "@/db/client";
import { sql } from "drizzle-orm";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { nameFor } from "@/lib/countries";

type Row = {
  destinationIso2: string;
  label: string;
  amountMinor: number;
  currency: string;
  feeLabel: string | null;
  kind: string | null;
};

async function main() {
  const rows = await db
    .selectDistinct({
      destinationIso2: schema.visaOptions.destinationIso2,
      label: schema.visaOptions.label,
      amountMinor: schema.feeComponents.amountMinor,
      currency: schema.feeComponents.currency,
      feeLabel: schema.feeComponents.label,
      kind: schema.feeComponents.kind,
    })
    .from(schema.feeComponents)
    .innerJoin(
      schema.visaOptions,
      sql`${schema.feeComponents.visaOptionId} = ${schema.visaOptions.id}`,
    );

  // Group: destination → label → fees[]
  const grouped: Record<string, Record<string, Row[]>> = {};
  for (const r of rows as Row[]) {
    const dest = r.destinationIso2;
    grouped[dest] ??= {};
    grouped[dest][r.label] ??= [];
    grouped[dest][r.label].push(r);
  }

  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Visa fee audit — ${date}`,
    ``,
    `Total distinct destinations: ${Object.keys(grouped).length}`,
    ``,
    `Verify each fee against the destination's official immigration site (linked from each route page on visavu.com). Mark fees that look stale (typically annual increases each July or January) and update the relevant adapter in src/scrapers/sources/.`,
    ``,
  ];

  const sortedDests = Object.keys(grouped).sort();
  for (const dest of sortedDests) {
    lines.push(`## ${dest} ${nameFor(dest)}\n`);
    lines.push(`| Visa | Fee kind | Amount | Currency | Fee label |`);
    lines.push(`|---|---|---:|---|---|`);
    const labels = Object.keys(grouped[dest]).sort();
    for (const label of labels) {
      // Deduplicate fees within a label — different passports often have
      // the same fee, so the SELECT DISTINCT may still return duplicates.
      const seen = new Set<string>();
      for (const f of grouped[dest][label]) {
        const key = `${f.kind}-${f.amountMinor}-${f.currency}-${f.feeLabel}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const amount = (f.amountMinor / 100).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        lines.push(
          `| ${label} | ${f.kind ?? "base"} | ${amount} | ${f.currency} | ${(f.feeLabel ?? "").replace(/\|/g, "/")} |`,
        );
      }
    }
    lines.push("");
  }

  mkdirSync(path.resolve(process.cwd(), "audit"), { recursive: true });
  const outPath = path.resolve(process.cwd(), `audit/FEES_${date}.md`);
  writeFileSync(outPath, lines.join("\n"));
  console.log(`✓ Fee audit written: ${outPath}`);
  console.log(`  ${Object.keys(grouped).length} destinations covered`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
