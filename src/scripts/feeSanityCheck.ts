/**
 * Fee sanity checker — walks every fee_components row in the DB snapshot,
 * converts each to USD via the live exchange table, and flags anything
 * that looks suspect against a small set of heuristics. The output is a
 * markdown report sorted by severity so the human (or this agent) can
 * triage the worst bugs first.
 *
 *   npx tsx src/scripts/feeSanityCheck.ts
 *
 * Heuristics applied to every (visa label, fee kind, amount, currency):
 *
 *   1. HIGH:  USD-equivalent > $20,000 unless the visa label matches an
 *      investor-visa allowlist (Golden / Citizenship-by-Investment /
 *      EB-5 / Investor / Tier 1). Most legitimate visa fees worldwide
 *      are between $50 and $2,500.
 *
 *   2. HIGH:  USD-equivalent < $1 for a non-free fee. Almost always a
 *      minor-unit confusion (e.g. VND TT visa stored at 145,000 = ~$6
 *      was actually meant to be 1,455,000 = ~$58).
 *
 *   3. MEDIUM: JPY/KRW/VND/IDR amount where amountMinor % 1000 == 0 AND
 *      USD-equivalent > $1,000. These currencies have minorFactor=1
 *      (no subunit), so a 3-zero-tail value that converts to a huge
 *      USD figure suggests the author multiplied by 100 thinking the
 *      currency had cents.
 *
 *   4. MEDIUM: amountMinor that ends in an isolated `_0` digit-group
 *      typo (e.g. `20000_0` instead of `200_00`) — detected by checking
 *      whether amountMinor / 10 is also a "cleaner" round number AND
 *      both values are plausible visa fees.
 *
 *   5. LOW:   asOf date older than 12 months (fee schedules typically
 *      revise annually — anything older than a year is worth checking
 *      against the government source).
 *
 * Output: audit/FEE_SUSPECTS_<date>.md with one section per severity,
 * sorted by USD-equivalent (descending in HIGH, ascending in LOW).
 */
import { db, schema } from "@/db/client";
import { sql } from "drizzle-orm";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { convertMinor, formatMoney } from "@/lib/exchange";
import { nameFor } from "@/lib/countries";

type FeeRow = {
  destinationIso2: string;
  visaLabel: string;
  feeLabel: string | null;
  kind: string | null;
  amountMinor: number;
  currency: string;
  asOf: string | null;
};

type Severity = "HIGH" | "MEDIUM" | "LOW";

type Suspect = {
  severity: Severity;
  reason: string;
  usdEquivalent: number | null;
  row: FeeRow;
};

// Visa types where a high fee is actually expected (donation / capital
// requirement of an investor scheme rather than an application fee). The
// matcher is case-insensitive substring on the visa label or fee label.
const INVESTOR_ALLOWLIST = [
  "golden",
  "investor",
  "investment",
  "citizenship",
  "eb-5",
  "eb5",
  "tier 1",
  "innovator",
  "high-value",
  "high net worth",
  "citizenship by investment",
  "cbi",
  "passport",
  "second home",
  "smart visa",
  "lukoil",
  "donation",
  "contribution",
  "real-estate",
  "real estate",
  "talent passport",
  "premium",
  "wealthy",
  "ltr ",
  "ltr-",
  "ths ", // Thailand Smart
];

function looksLikeInvestorRoute(row: FeeRow): boolean {
  const haystack = `${row.visaLabel ?? ""} ${row.feeLabel ?? ""}`.toLowerCase();
  return INVESTOR_ALLOWLIST.some((needle) => haystack.includes(needle));
}

function toUsd(amountMinor: number, currency: string): number | null {
  const converted = convertMinor(amountMinor, currency, "USD");
  if (converted == null) return null;
  return converted / 100; // USD has minorFactor=100, returning major-unit USD
}

async function main() {
  const rows = (await db
    .selectDistinct({
      destinationIso2: schema.visaOptions.destinationIso2,
      visaLabel: schema.visaOptions.label,
      feeLabel: schema.feeComponents.label,
      kind: schema.feeComponents.kind,
      amountMinor: schema.feeComponents.amountMinor,
      currency: schema.feeComponents.currency,
      asOf: schema.feeComponents.asOf,
    })
    .from(schema.feeComponents)
    .innerJoin(
      schema.visaOptions,
      sql`${schema.feeComponents.visaOptionId} = ${schema.visaOptions.id}`,
    )) as FeeRow[];

  const suspects: Suspect[] = [];
  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  for (const row of rows) {
    if (row.amountMinor === 0) continue; // free routes — never suspect
    const usd = toUsd(row.amountMinor, row.currency);

    // Heuristic 1 — implausibly high USD-equivalent
    if (usd != null && usd > 20_000 && !looksLikeInvestorRoute(row)) {
      suspects.push({
        severity: "HIGH",
        reason: `USD-equivalent $${usd.toFixed(0)} > $20,000 on a non-investor visa. Likely minor-unit confusion.`,
        usdEquivalent: usd,
        row,
      });
      continue;
    }

    // Heuristic 2 — implausibly low USD-equivalent
    if (usd != null && usd > 0 && usd < 1 && row.kind !== "optional") {
      suspects.push({
        severity: "HIGH",
        reason: `USD-equivalent $${usd.toFixed(2)} < $1 on a non-free fee. Probably labelled in major units, stored as minor.`,
        usdEquivalent: usd,
        row,
      });
      continue;
    }

    // Heuristic 3 — JPY/KRW/VND/IDR with suspect zero-tail
    const noSubunitCurrencies = ["JPY", "KRW", "VND", "IDR", "ISK"];
    if (
      noSubunitCurrencies.includes(row.currency) &&
      row.amountMinor % 1000 === 0 &&
      usd != null &&
      usd > 1000 &&
      !looksLikeInvestorRoute(row)
    ) {
      suspects.push({
        severity: "MEDIUM",
        reason: `${row.currency} has no subunit (minorFactor=1) and amountMinor=${row.amountMinor} converts to ~$${usd.toFixed(0)} — suspicious for a routine visa fee.`,
        usdEquivalent: usd,
        row,
      });
      continue;
    }

    // Heuristic 4 — `_0` typo pattern: amountMinor that's 10x the
    // "labelled" amount inferred from the fee label. Looks for a $/£/¥/€
    // pattern in the fee label and compares.
    const inferred = inferLabelledAmount(row.feeLabel, row.currency);
    if (
      inferred != null &&
      usd != null &&
      Math.abs(usd - inferred * 10) < 5 &&
      Math.abs(usd - inferred) > 5
    ) {
      suspects.push({
        severity: "HIGH",
        reason: `Stored value $${usd.toFixed(0)} is ~10x the label's "$${inferred.toFixed(0)}" — classic 20000_0 vs 200_00 typo.`,
        usdEquivalent: usd,
        row,
      });
      continue;
    }
    if (
      inferred != null &&
      usd != null &&
      Math.abs(usd - inferred / 10) < 5 &&
      Math.abs(usd - inferred) > 5 &&
      inferred > 50
    ) {
      suspects.push({
        severity: "MEDIUM",
        reason: `Stored value $${usd.toFixed(0)} is ~1/10 of label's "$${inferred.toFixed(0)}". Possible missing zero.`,
        usdEquivalent: usd,
        row,
      });
      continue;
    }

    // Heuristic 5 — stale asOf
    if (row.asOf) {
      const asOfDate = new Date(row.asOf);
      if (asOfDate < twelveMonthsAgo) {
        suspects.push({
          severity: "LOW",
          reason: `asOf ${row.asOf} is over 12 months old. Most government fee schedules revise annually — verify against the source.`,
          usdEquivalent: usd,
          row,
        });
      }
    }
  }

  // Group by severity
  const bySeverity: Record<Severity, Suspect[]> = { HIGH: [], MEDIUM: [], LOW: [] };
  for (const s of suspects) bySeverity[s.severity].push(s);
  bySeverity.HIGH.sort((a, b) => (b.usdEquivalent ?? 0) - (a.usdEquivalent ?? 0));
  bySeverity.MEDIUM.sort((a, b) => (b.usdEquivalent ?? 0) - (a.usdEquivalent ?? 0));
  bySeverity.LOW.sort((a, b) => (a.row.asOf ?? "").localeCompare(b.row.asOf ?? ""));

  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Fee sanity audit — ${date}`,
    ``,
    `Total fee rows scanned: ${rows.length}`,
    `Suspect: ${suspects.length} (HIGH: ${bySeverity.HIGH.length}, MEDIUM: ${bySeverity.MEDIUM.length}, LOW: ${bySeverity.LOW.length})`,
    ``,
    `Run: \`npx tsx src/scripts/feeSanityCheck.ts\` — re-run after editing adapters + bootstrapping to refresh.`,
    ``,
  ];

  for (const sev of ["HIGH", "MEDIUM", "LOW"] as Severity[]) {
    const items = bySeverity[sev];
    if (items.length === 0) continue;
    lines.push(`## ${sev} — ${items.length} issue${items.length === 1 ? "" : "s"}\n`);
    lines.push(`| Destination | Visa | Fee kind | Stored amount | USD | Issue |`);
    lines.push(`|---|---|---|---:|---:|---|`);
    for (const s of items.slice(0, 200)) {
      const native = formatMoney(s.row.amountMinor, s.row.currency);
      const usd = s.usdEquivalent != null ? `$${s.usdEquivalent.toFixed(0)}` : "—";
      const visaLabelClean = (s.row.visaLabel ?? "").replace(/\|/g, "/").slice(0, 60);
      const feeLabelClean = (s.row.feeLabel ?? s.row.kind ?? "").replace(/\|/g, "/").slice(0, 50);
      const reason = s.reason.replace(/\|/g, "/").replace(/\n/g, " ");
      lines.push(
        `| ${s.row.destinationIso2} ${nameFor(s.row.destinationIso2).slice(0, 12)} | ${visaLabelClean} | ${feeLabelClean} | ${native} | ${usd} | ${reason} |`,
      );
    }
    if (items.length > 200) lines.push(`\n_…and ${items.length - 200} more — adjust the script to widen the cut._\n`);
    lines.push("");
  }

  mkdirSync(path.resolve(process.cwd(), "audit"), { recursive: true });
  const outPath = path.resolve(process.cwd(), `audit/FEE_SUSPECTS_${date}.md`);
  writeFileSync(outPath, lines.join("\n"));
  console.log(`✓ Sanity audit written: ${outPath}`);
  console.log(`  ${rows.length} rows scanned, ${suspects.length} suspects flagged`);
  console.log(`  HIGH: ${bySeverity.HIGH.length}, MEDIUM: ${bySeverity.MEDIUM.length}, LOW: ${bySeverity.LOW.length}`);
  process.exit(0);
}

/**
 * Try to read a "$ amount" or "£ amount" or "USD amount" hint out of the
 * fee label so we can compare it against the stored amountMinor.
 * Returns the labelled USD-equivalent (a rough approximation that
 * assumes 1:1 for £/€/$ which is wrong but good enough for the 10x typo
 * detection — we're checking for orders of magnitude, not exchange rate
 * accuracy).
 */
function inferLabelledAmount(label: string | null, currency: string): number | null {
  if (!label) return null;
  // Patterns like "(USD 100)", "$190", "£1,615", "AUD $200", "₩60,000",
  // "EUR 99". Permissive — we only want the numeric magnitude.
  const re = /(?:USD|EUR|GBP|AUD|CAD|NZD|SGD|HKD|JPY|THB|MYR|PHP|KRW|VND|IDR|INR|MXN|BRL|ZAR|AED|SAR|CHF|SEK|NOK|DKK|PLN|RUB|TRY|CZK|HUF|RON|ILS|EGP|MAD|NGN|KES|TZS|GHS|XOF|XAF|\$|£|€|¥|₩|₱|₫|₹|₪|₺|₽|د\.إ)\s*([0-9][0-9,.]*)/i;
  const m = label.match(re);
  if (!m) return null;
  const num = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(num) || num <= 0) return null;
  // Apply rough major-currency normalisation to USD so the comparison
  // makes sense in heuristic 4 above.
  const roughRates: Record<string, number> = {
    GBP: 1.27, EUR: 1.08, AUD: 0.66, CAD: 0.73, NZD: 0.62, SGD: 0.74,
    HKD: 0.13, JPY: 0.0067, THB: 0.029, MYR: 0.22, PHP: 0.018,
    KRW: 0.00075, VND: 0.00004, IDR: 0.000063, INR: 0.012, MXN: 0.058,
    BRL: 0.20, ZAR: 0.054, AED: 0.27, SAR: 0.27, CHF: 1.14, SEK: 0.095,
    NOK: 0.094, DKK: 0.145, PLN: 0.25, RUB: 0.011, TRY: 0.031,
    CZK: 0.043, HUF: 0.0028, RON: 0.22, ILS: 0.27, EGP: 0.021,
    MAD: 0.10, NGN: 0.00065, KES: 0.0077,
  };
  const rate = roughRates[currency] ?? 1;
  return num * rate;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
