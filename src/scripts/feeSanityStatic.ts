/**
 * Static source-file fee analyzer — does the same sanity checks as
 * feeSanityCheck.ts but without needing the DB snapshot. Walks every
 * adapter file under src/scrapers/sources/, regex-extracts every
 * { kind, amountMinor, currency, label } / { feeMinor, feeCurrency }
 * declaration, converts each amount to a rough USD-equivalent, and
 * flags suspects.
 *
 *   npx tsx src/scripts/feeSanityStatic.ts
 *
 * Why static-not-DB: the bootstrap is slow + sometimes hangs on
 * polite-fetch sleeps. A static scan finishes in seconds and surfaces
 * the same minor-unit / scale / typo bugs we care about — we can run it
 * on every commit, in CI, and after each adapter edit.
 *
 * Output: audit/FEE_STATIC_<date>.md sorted by severity (HIGH /
 * MEDIUM / LOW). Each row points at the exact file + line so the fix
 * is one click away.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";

// Rough USD conversion rates — good enough for order-of-magnitude
// heuristic checks (we're not pricing transactions). Keep current to
// within a year; refresh from src/data/exchange_rates.json periodically.
const ROUGH_USD: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, AUD: 0.66, CAD: 0.73, NZD: 0.62,
  SGD: 0.74, HKD: 0.13, JPY: 0.0067, THB: 0.029, MYR: 0.22, PHP: 0.018,
  KRW: 0.00075, VND: 0.00004, IDR: 0.000063, INR: 0.012, MXN: 0.058,
  BRL: 0.20, ARS: 0.001, CLP: 0.0011, COP: 0.00025, PEN: 0.27,
  ZAR: 0.054, AED: 0.27, SAR: 0.27, EGP: 0.021, NGN: 0.00065,
  KES: 0.0077, MAD: 0.10, GHS: 0.067, TZS: 0.00037,
  CHF: 1.14, SEK: 0.095, NOK: 0.094, DKK: 0.145, PLN: 0.25, CZK: 0.043,
  HUF: 0.0028, RON: 0.22, BGN: 0.55, HRK: 0.14, ISK: 0.0073,
  RUB: 0.011, TRY: 0.031, UAH: 0.024, ILS: 0.27, JOD: 1.41,
  BHD: 2.65, KWD: 3.24, QAR: 0.27, OMR: 2.60,
  TWD: 0.031, IDR_alt: 0.000063, BDT: 0.0084, PKR: 0.0036, LKR: 0.0033,
  NPR: 0.0075, MMK: 0.00048, KHR: 0.00024, LAK: 0.000045,
  ETB: 0.0079, RWF: 0.00076, UGX: 0.00027, MGA: 0.000218,
  XOF: 0.0016, XAF: 0.0016, XCD: 0.37, JMD: 0.0064,
  BSD: 1.0, BBD: 0.50, BMD: 1.0, KYD: 1.20, BZD: 0.50,
  GTQ: 0.13, HNL: 0.040, NIO: 0.027, CRC: 0.0019, PAB: 1.0,
  CUC: 1.0, DOP: 0.017, BOB: 0.14, PYG: 0.000136, UYU: 0.024,
  MOP: 0.124,
};

// Currencies with no subunit — amountMinor IS the major value.
const NO_SUBUNIT = new Set(["JPY", "KRW", "VND", "IDR", "ISK", "UGX", "CLP", "HUF", "RWF", "MGA", "XOF", "XAF", "XPF", "PYG"]);

// Currencies with 3 subunit digits (1000-factor instead of 100).
const KILO_SUBUNIT = new Set(["BHD", "KWD", "OMR", "JOD", "LYD", "TND"]);

function minorFactor(currency: string): number {
  if (NO_SUBUNIT.has(currency)) return 1;
  if (KILO_SUBUNIT.has(currency)) return 1000;
  return 100;
}

function toUsd(amountMinor: number, currency: string): number | null {
  const rate = ROUGH_USD[currency];
  if (rate == null) return null;
  const major = amountMinor / minorFactor(currency);
  return major * rate;
}

type Hit = {
  file: string;
  line: number;
  raw: string;
  amountMinor: number;
  currency: string;
  label: string | null;
  kind: string | null;
  /** The enclosing visa's `label: "..."` field (lookback up to 30 lines).
   *  Used to suppress investor-route false positives like Malta MPRP
   *  €40k admin or Turkish CBI $75k legal fees, where the parent visa
   *  label flags the legit context. */
  visaLabel?: string | null;
};

type Suspect = {
  severity: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  usd: number | null;
  hit: Hit;
};

const INVESTOR_HINTS = [
  "golden", "investor", "investment", "citizenship", "eb-5", "eb5",
  "tier 1", "innovator", "high-value", "high net worth", "cbi",
  "second home", "smart visa", "donation", "contribution", "real-estate",
  "real estate", "talent passport", "premium", "wealthy", " ltr ",
  "active investor", "significant investor", "tea minimum",
  // Wealth-based residency programmes whose label doesn't contain the
  // word "investor" but where 5-figure admin fees are correct:
  "mprp", "permanent residence programme", "permanent residency programme",
  "naturalisation", "naturalization", "exceptional services",
  "rural / tea", "wealth", "investor plus",
];

function isInvestor(text: string): boolean {
  const h = text.toLowerCase();
  return INVESTOR_HINTS.some((n) => h.includes(n));
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry.startsWith("__") || entry === "node_modules") continue;
      yield* walk(full);
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      yield full;
    }
  }
}

function extractHits(file: string): Hit[] {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const hits: Hit[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern A: ParsedRecord fee — { kind?, amountMinor: X, currency: "ZZZ", ..., label?: "..." }
    const reA = /amountMinor:\s*([0-9_]+)\s*,\s*currency:\s*"([A-Z]{3})"/g;
    let m: RegExpExecArray | null;
    while ((m = reA.exec(line)) !== null) {
      const amount = parseInt(m[1].replace(/_/g, ""), 10);
      if (!Number.isFinite(amount)) continue;
      const labelMatch = line.match(/label:\s*"([^"]*)"/);
      const kindMatch = line.match(/kind:\s*"([^"]*)"/);
      // Look back up to 30 lines for the enclosing visa `label: "..."`
      // so we can suppress investor-route false positives.
      let visaLabel: string | null = null;
      for (let j = i - 1; j >= Math.max(0, i - 30); j--) {
        const vm = lines[j].match(/^\s*label:\s*"([^"]+)"\s*,?\s*$/);
        if (vm) {
          visaLabel = vm[1];
          break;
        }
      }
      hits.push({
        file,
        line: i + 1,
        raw: line.trim().slice(0, 180),
        amountMinor: amount,
        currency: m[2],
        label: labelMatch ? labelMatch[1] : null,
        kind: kindMatch ? kindMatch[1] : null,
        visaLabel,
      });
    }

    // Pattern B: total_coverage_*.ts data entries — feeMinor: X, feeCurrency: "ZZZ" (multi-line)
    if (/feeMinor:\s*[0-9_]+/.test(line)) {
      const mB = line.match(/feeMinor:\s*([0-9_]+)/);
      // Look ahead for feeCurrency
      let currency: string | null = null;
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const cm = lines[j].match(/feeCurrency:\s*"([A-Z]{3})"/);
        if (cm) {
          currency = cm[1];
          break;
        }
      }
      if (mB && currency) {
        const amount = parseInt(mB[1].replace(/_/g, ""), 10);
        if (Number.isFinite(amount)) {
          // Find label / iso2 from nearby lines (10 lines back)
          let label: string | null = null;
          for (let j = Math.max(0, i - 15); j < i; j++) {
            const lm = lines[j].match(/label:\s*"([^"]*)"/);
            if (lm) label = lm[1];
          }
          hits.push({
            file,
            line: i + 1,
            raw: line.trim().slice(0, 180),
            amountMinor: amount,
            currency,
            label,
            kind: null,
            visaLabel: label,
          });
        }
      }
    }
  }
  return hits;
}

function classify(hit: Hit): Suspect | null {
  if (hit.amountMinor === 0) return null; // free routes are fine
  const usd = toUsd(hit.amountMinor, hit.currency);
  // Combine the fee label, the surrounding visa label (looked up via
  // 30-line lookback in extractHits), and the raw line so investor-route
  // false positives like Malta MPRP and Turkish CBI get suppressed.
  const ctxText = `${hit.label ?? ""} ${hit.visaLabel ?? ""} ${hit.raw}`;
  const investor = isInvestor(ctxText);

  // HIGH — implausibly large
  if (usd != null && usd > 20_000 && !investor) {
    return {
      severity: "HIGH",
      reason: `USD-equiv $${usd.toFixed(0)} > $20k on non-investor visa`,
      usd,
      hit,
    };
  }

  // HIGH — implausibly small (non-free)
  if (usd != null && usd > 0 && usd < 1 && hit.kind !== "optional") {
    return {
      severity: "HIGH",
      reason: `USD-equiv $${usd.toFixed(2)} < $1 on non-free fee`,
      usd,
      hit,
    };
  }

  // HIGH — labelled $X but stored as ~10× $X. Detect by parsing the label
  // for a numeric "$N" / "(USD N)" / "(CAD $N)" / "ZZZ N" hint.
  const labelHint = parseLabelHint(hit.label, hit.currency);
  if (labelHint != null && usd != null) {
    const labelInUsd = labelHint * (ROUGH_USD[hit.currency] ?? 1);
    const ratio = usd / labelInUsd;
    if (ratio > 5 && ratio < 15 && labelInUsd > 5) {
      return {
        severity: "HIGH",
        reason: `Stored $${usd.toFixed(0)} is ${ratio.toFixed(1)}× the labelled "${hit.label}" — likely 10× typo`,
        usd,
        hit,
      };
    }
    if (ratio < 0.2 && ratio > 0.05 && labelInUsd > 5) {
      return {
        severity: "MEDIUM",
        reason: `Stored $${usd.toFixed(0)} is ${(1 / ratio).toFixed(1)}× LESS than labelled "${hit.label}" — possible missing zero`,
        usd,
        hit,
      };
    }
  }

  // MEDIUM — no-subunit currency with large USD-equiv
  if (NO_SUBUNIT.has(hit.currency) && usd != null && usd > 2000 && !investor) {
    return {
      severity: "MEDIUM",
      reason: `${hit.currency} has no subunit; ${hit.amountMinor} converts to ~$${usd.toFixed(0)} — suspicious`,
      usd,
      hit,
    };
  }

  return null;
}

function parseLabelHint(label: string | null, currency: string): number | null {
  if (!label) return null;
  // Strip thousands separators, look for a numeric chunk after a currency
  // marker. Permissive — false positives are OK because the ratio check
  // filters them.
  const re = /(?:USD|US\$|EUR|GBP|AUD|CAD|NZD|SGD|HKD|JPY|THB|MYR|KRW|VND|IDR|INR|MXN|BRL|ZAR|AED|SAR|CHF|TRY|EGP|MAD|NGN|\$|£|€|¥|₩|₫|₹|₪|₺)\s*\$?\s*([0-9][0-9,.]*)/i;
  const m = label.match(re);
  if (!m) return null;
  const num = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

function main() {
  const root = path.resolve(process.cwd(), "src/scrapers/sources");
  const files = [...walk(root)];
  const allHits: Hit[] = [];
  for (const f of files) {
    try {
      allHits.push(...extractHits(f));
    } catch {
      /* ignore */
    }
  }

  const suspects = allHits
    .map(classify)
    .filter((s): s is Suspect => s !== null);

  // Group by severity, sort by USD desc within group
  const bySev = { HIGH: [] as Suspect[], MEDIUM: [] as Suspect[], LOW: [] as Suspect[] };
  for (const s of suspects) bySev[s.severity].push(s);
  bySev.HIGH.sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0));
  bySev.MEDIUM.sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0));

  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Fee static-sanity audit — ${date}`,
    ``,
    `Adapters scanned: ${files.length}`,
    `Fee declarations extracted: ${allHits.length}`,
    `Suspects flagged: ${suspects.length} (HIGH ${bySev.HIGH.length}, MEDIUM ${bySev.MEDIUM.length})`,
    ``,
    `Run: \`npx tsx src/scripts/feeSanityStatic.ts\` — no DB required, finishes in seconds.`,
    ``,
  ];

  for (const sev of ["HIGH", "MEDIUM"] as const) {
    const items = bySev[sev];
    if (items.length === 0) continue;
    lines.push(`## ${sev} — ${items.length} suspect${items.length === 1 ? "" : "s"}\n`);
    lines.push(`| File | Line | Stored | Currency | USD | Label / kind | Issue |`);
    lines.push(`|---|---:|---:|---|---:|---|---|`);
    for (const s of items) {
      const fileShort = s.hit.file.replace(process.cwd() + "/", "");
      const labelClean = (s.hit.label ?? s.hit.kind ?? "").replace(/\|/g, "/").slice(0, 60);
      const usdStr = s.usd != null ? `$${s.usd.toFixed(0)}` : "—";
      lines.push(
        `| ${fileShort} | ${s.hit.line} | ${s.hit.amountMinor.toLocaleString()} | ${s.hit.currency} | ${usdStr} | ${labelClean} | ${s.reason.replace(/\|/g, "/")} |`,
      );
    }
    lines.push("");
  }

  mkdirSync(path.resolve(process.cwd(), "audit"), { recursive: true });
  const outPath = path.resolve(process.cwd(), `audit/FEE_STATIC_${date}.md`);
  writeFileSync(outPath, lines.join("\n"));
  console.log(`✓ Static fee audit: ${outPath}`);
  console.log(`  ${files.length} files, ${allHits.length} fee declarations`);
  console.log(`  HIGH: ${bySev.HIGH.length}, MEDIUM: ${bySev.MEDIUM.length}`);
  for (const s of bySev.HIGH.slice(0, 10)) {
    const fileShort = s.hit.file.replace(process.cwd() + "/", "");
    console.log(`  ⚠ ${fileShort}:${s.hit.line} — ${s.reason}`);
  }
}

main();
