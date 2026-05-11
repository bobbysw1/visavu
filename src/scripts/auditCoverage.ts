/**
 * One-off audit script — counts how much of the visa database has real
 * primary-source links and which (passport, destination, purpose) cells
 * are missing data.
 *
 *   npx tsx src/scripts/auditCoverage.ts
 */
import { db, schema } from "../db/client";
import { sql } from "drizzle-orm";
import { COUNTRY_LIST } from "../lib/countries";

async function main() {
  const total = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*)::int AS count FROM visa_options
  `);
  const totalRows = Number(((total as unknown as { rows?: { count: number }[] }).rows ?? (total as unknown as { count: number }[]))[0].count);

  const withAppUrl = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*)::int AS count FROM visa_options
    WHERE application_url IS NOT NULL AND application_url <> ''
  `);
  const withAppRows = Number(((withAppUrl as unknown as { rows?: { count: number }[] }).rows ?? (withAppUrl as unknown as { count: number }[]))[0].count);

  const withPrimary = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*)::int AS count FROM visa_options
    WHERE primary_source_url IS NOT NULL AND primary_source_url <> ''
  `);
  const withPrimaryRows = Number(((withPrimary as unknown as { rows?: { count: number }[] }).rows ?? (withPrimary as unknown as { count: number }[]))[0].count);

  const byPurpose = await db.execute<{ purpose: string; count: number }>(sql`
    SELECT purpose::text AS purpose, COUNT(*)::int AS count
    FROM visa_options GROUP BY purpose ORDER BY count DESC
  `);
  const purposeRows = ((byPurpose as unknown as { rows?: { purpose: string; count: number }[] }).rows ?? (byPurpose as unknown as { purpose: string; count: number }[]));

  // Coverage matrix: which (passport, destination) pairs have at least one
  // record for each purpose.
  const matrix = await db.execute<{ destination_iso2: string; n_passports: number; n_records: number }>(sql`
    SELECT destination_iso2,
           COUNT(DISTINCT passport_id)::int AS n_passports,
           COUNT(*)::int AS n_records
    FROM visa_options
    GROUP BY destination_iso2
    ORDER BY n_records DESC
  `);
  const matrixRows = ((matrix as unknown as { rows?: { destination_iso2: string; n_passports: number; n_records: number }[] }).rows ?? (matrix as unknown as { destination_iso2: string; n_passports: number; n_records: number }[]));

  // Which destinations have ZERO records of any kind?
  const covered = new Set(matrixRows.map((r) => r.destination_iso2));
  const uncoveredDest: string[] = [];
  for (const c of COUNTRY_LIST) {
    if (!covered.has(c.iso2)) uncoveredDest.push(c.iso2);
  }

  console.log("=== VISAVU.COM DATA AUDIT ===\n");
  console.log(`Total visa_options records:          ${totalRows.toLocaleString()}`);
  console.log(`  with application_url:              ${withAppRows.toLocaleString()} (${((withAppRows / totalRows) * 100).toFixed(1)}%)`);
  console.log(`  with primary_source_url (gov link): ${withPrimaryRows.toLocaleString()} (${((withPrimaryRows / totalRows) * 100).toFixed(1)}%)`);
  console.log();

  console.log("Records by purpose:");
  for (const r of purposeRows) {
    console.log(`  ${r.purpose.padEnd(15)} ${Number(r.count).toLocaleString().padStart(10)}`);
  }
  console.log();

  console.log("Destinations with NO records (zero-coverage):");
  if (uncoveredDest.length === 0) {
    console.log("  (none — every country has at least one record)");
  } else {
    console.log(`  ${uncoveredDest.length} countries: ${uncoveredDest.join(", ")}`);
  }
  console.log();

  console.log("Top 20 destinations by record count:");
  for (const r of matrixRows.slice(0, 20)) {
    console.log(`  ${r.destination_iso2}  ${String(r.n_records).padStart(6)} records · ${String(r.n_passports).padStart(3)} passports covered`);
  }

  // The user's specific example: Panamanian → New Zealand
  console.log("\n=== Panamanian (PA) → New Zealand (NZ) ===");
  const paNz = await db.execute<{
    purpose: string;
    label: string;
    status: string;
    application_url: string | null;
    primary_source_url: string | null;
  }>(sql`
    SELECT v.purpose::text, v.label, v.status::text, v.application_url, v.primary_source_url
    FROM visa_options v
    JOIN passports p ON p.id = v.passport_id
    WHERE p.issuer_iso2 = 'PA' AND v.destination_iso2 = 'NZ'
    ORDER BY v.purpose, v.label
  `);
  const paNzRows = ((paNz as unknown as { rows?: { purpose: string; label: string; status: string; application_url: string | null; primary_source_url: string | null }[] }).rows ?? (paNz as unknown as { purpose: string; label: string; status: string; application_url: string | null; primary_source_url: string | null }[]));

  if (paNzRows.length === 0) {
    console.log("  NO records — relying on Wikipedia long-tail / empty-state fallback.");
  } else {
    for (const r of paNzRows) {
      const link = r.application_url ?? r.primary_source_url ?? "(no gov link)";
      console.log(`  [${r.purpose.padEnd(8)}] ${r.label}  →  ${link.replace(/^https?:\/\//, "").slice(0, 60)}`);
    }
  }
  console.log();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
