/**
 * Daily exchange-rates refresh. Pulls latest mid-market rates from
 * Frankfurter (frankfurter.app), a free, no-key, ECB-data wrapper.
 *
 *   npx tsx src/scripts/refreshExchangeRates.ts
 *
 * Frankfurter covers ~30 major currencies (the ECB list). For currencies
 * outside that list (most African / island state currencies, plus pegged
 * dollar currencies like XCD / AWG), we preserve the existing static
 * values from src/data/exchange_rates.json so they don't get blown away
 * on every refresh.
 *
 * Wired into .github/workflows/refresh.yml — runs nightly at 04:00 UTC.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const RATES_PATH = path.resolve(process.cwd(), "src/data/exchange_rates.json");
const FRANKFURTER_URL = "https://api.frankfurter.app/latest?from=USD";

type RatesFile = {
  base: string;
  asOf: string;
  source: string;
  rates: Record<string, number>;
};

async function main() {
  const existing: RatesFile = existsSync(RATES_PATH)
    ? JSON.parse(readFileSync(RATES_PATH, "utf8"))
    : { base: "USD", asOf: "", source: "fallback", rates: { USD: 1 } };

  process.stderr.write(`Fetching latest USD-base rates from Frankfurter…\n`);
  const res = await fetch(FRANKFURTER_URL);
  if (!res.ok) {
    process.stderr.write(`Frankfurter returned HTTP ${res.status}. Keeping existing rates.\n`);
    process.exit(1);
  }
  const json = (await res.json()) as { date: string; rates: Record<string, number> };

  // Merge: Frankfurter overrides where present; static fallbacks survive.
  const merged: Record<string, number> = { ...existing.rates, ...json.rates };
  merged.USD = 1;

  const out: RatesFile = {
    base: "USD",
    asOf: json.date,
    source: "frankfurter",
    rates: Object.fromEntries(
      Object.entries(merged)
        .filter(([code, value]) => /^[A-Z]{3}$/.test(code) && value > 0)
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  };

  writeFileSync(RATES_PATH, JSON.stringify(out, null, 2) + "\n");
  process.stderr.write(
    `✓ Wrote ${Object.keys(out.rates).length} rates as of ${out.asOf} → ${RATES_PATH}\n`,
  );
  process.stderr.write(
    `  Frankfurter provided ${Object.keys(json.rates).length} live rates; ` +
    `${Object.keys(out.rates).length - Object.keys(json.rates).length - 1} preserved from fallback.\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
