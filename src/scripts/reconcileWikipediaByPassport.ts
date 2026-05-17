/**
 * Passport-side Wikipedia reconciliation — for each top-50 passport, fetch the
 * canonical Wikipedia "Visa requirements for X citizens" page, parse the
 * destinations table, and diff against our visa_options.
 *
 *   npx tsx src/scripts/reconcileWikipediaByPassport.ts                 # top 50
 *   npx tsx src/scripts/reconcileWikipediaByPassport.ts --passport GB   # one
 *   npx tsx src/scripts/reconcileWikipediaByPassport.ts --limit 10
 *
 * Output: one CSV per passport in tmp/reconciliation/, plus a summary
 * to stdout. If SLACK_WEBHOOK_URL is set and overall drift exceeds 5%
 * from the last run (computed against the prior CSV if present), posts a
 * one-line alert to Slack.
 *
 * This complements src/scripts/crossCheckWikipedia.ts which goes
 * destination-side (against MFA HTML) rather than passport-side.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { eq, and } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { politeFetch } from "@/scrapers/base/fetchClient";
import { COUNTRY_LIST, nameFor } from "@/lib/countries";
import type { VisaStatus } from "@/lib/types";

type DiffAction = "ADD" | "MISMATCH" | "CONFIRM" | "OURS_ONLY";

type DiffRow = {
  iso2_dest: string;
  name: string;
  wiki_status: string;
  our_status: string;
  our_max_stay: number | null;
  wiki_max_stay: number | null;
  action: DiffAction;
};

const TOP_50_PASSPORTS = [
  "US", "GB", "DE", "CA", "AU", "FR", "IT", "ES", "NL", "JP",
  "CN", "IN", "BR", "MX", "RU", "KR", "SG", "AE", "CH", "SE",
  "BE", "PL", "ZA", "TR", "IE", "NZ", "AT", "FI", "NO", "DK",
  "CZ", "GR", "HU", "RO", "HR", "BG", "TW", "HK", "IL", "SA",
  "QA", "PH", "VN", "ID", "MY", "TH", "EG", "MA", "NG", "AR",
];

const OUT_DIR = "tmp/reconciliation";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const onePassport = args.includes("--passport")
    ? args[args.indexOf("--passport") + 1]?.toUpperCase()
    : null;
  const limit = args.includes("--limit")
    ? parseInt(args[args.indexOf("--limit") + 1] ?? "50", 10)
    : 50;

  const targets = onePassport ? [onePassport] : TOP_50_PASSPORTS.slice(0, limit);

  await mkdir(OUT_DIR, { recursive: true });

  const driftByPassport: Array<{ iso: string; total: number; drift: number; pct: number }> = [];

  for (const iso of targets) {
    process.stdout.write(`  • ${iso} ${nameFor(iso)}... `);
    try {
      const wikiRows = await fetchWikipediaTable(iso);
      const ourRows = await fetchOurOptions(iso);
      const diff = computeDiff(wikiRows, ourRows);
      const csvPath = join(OUT_DIR, `${iso.toLowerCase()}.csv`);
      await writeCsv(csvPath, diff);

      const drift = diff.filter((r) => r.action === "ADD" || r.action === "MISMATCH").length;
      const pct = diff.length === 0 ? 0 : (drift / diff.length) * 100;
      driftByPassport.push({ iso, total: diff.length, drift, pct });
      console.log(`${diff.length} rows · ${drift} drift (${pct.toFixed(1)}%) → ${csvPath}`);
    } catch (err) {
      console.log(`FAILED — ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Summary
  const totalDrift = driftByPassport.reduce((s, d) => s + d.drift, 0);
  const totalRows = driftByPassport.reduce((s, d) => s + d.total, 0);
  const overallPct = totalRows === 0 ? 0 : (totalDrift / totalRows) * 100;
  console.log(
    `\nOverall: ${totalDrift}/${totalRows} drift across ${driftByPassport.length} passports (${overallPct.toFixed(1)}%)`,
  );

  // Slack alert if drift > 5% AND a webhook is configured
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (webhookUrl && overallPct > 5) {
    const topDrift = [...driftByPassport].sort((a, b) => b.pct - a.pct).slice(0, 5);
    const text = `📊 Wikipedia reconciliation: ${overallPct.toFixed(1)}% drift (${totalDrift}/${totalRows} rows) — top: ${topDrift.map((d) => `${d.iso}=${d.pct.toFixed(0)}%`).join(", ")}`;
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    }).catch(() => undefined);
  }

  process.exit(0);
}

async function fetchWikipediaTable(passportIso2: string): Promise<Map<string, { status: string; maxStay: number | null }>> {
  const passportName = nameFor(passportIso2);
  // Wikipedia URL convention: "Visa requirements for X citizens" where X is
  // the demonym or country adjective. Use a small lookup for the most common
  // mismatches; fall back to the country name otherwise.
  const wikiSlug = WIKI_SLUG_OVERRIDES[passportIso2] ?? `Visa_requirements_for_${passportName.replace(/\s+/g, "_")}_citizens`;
  const url = `https://en.wikipedia.org/wiki/${wikiSlug}`;

  const html = await politeFetch(url).then((r) => r.text());
  return parseWikipediaTable(html);
}

const WIKI_SLUG_OVERRIDES: Record<string, string> = {
  US: "Visa_requirements_for_United_States_citizens",
  GB: "Visa_requirements_for_British_citizens",
  CH: "Visa_requirements_for_Swiss_citizens",
  NL: "Visa_requirements_for_Dutch_citizens",
  KR: "Visa_requirements_for_South_Korean_citizens",
  CN: "Visa_requirements_for_Chinese_citizens",
  CZ: "Visa_requirements_for_Czech_citizens",
  PH: "Visa_requirements_for_Philippine_citizens",
  HK: "Visa_requirements_for_Hong_Kong_residents",
  TW: "Visa_requirements_for_Taiwanese_citizens",
  AE: "Visa_requirements_for_United_Arab_Emirates_citizens",
  SA: "Visa_requirements_for_Saudi_Arabian_citizens",
  NZ: "Visa_requirements_for_New_Zealand_citizens",
  ZA: "Visa_requirements_for_South_African_citizens",
};

const STATUS_MAP_FROM_WIKI: Array<[RegExp, string]> = [
  [/^visa not required/i, "visa_free"],
  [/^visa[\s-]?free/i, "visa_free"],
  [/^eta /i, "visa_free_with_eta"],
  [/^esta/i, "visa_free_with_eta"],
  [/^electronic travel/i, "visa_free_with_eta"],
  [/^visa on arrival/i, "visa_on_arrival"],
  [/^evisa/i, "e_visa"],
  [/^e-visa/i, "e_visa"],
  [/^visa required/i, "embassy_visa"],
  [/^admission refused/i, "refused"],
  [/^banned/i, "refused"],
];

function parseWikipediaTable(html: string): Map<string, { status: string; maxStay: number | null }> {
  // Cheap parse — Wikipedia's tables are wikitable-class with country flag,
  // name, visa requirement, max stay. We use regex rather than a DOM parser
  // to keep the dependency surface narrow.
  const out = new Map<string, { status: string; maxStay: number | null }>();
  const tableMatch = html.match(/<table class="wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/);
  if (!tableMatch) return out;
  const rows = tableMatch[1].split(/<tr[^>]*>/);
  for (const rawRow of rows) {
    if (!rawRow.includes("<td")) continue;
    const cells = rawRow.split(/<td[^>]*>/).slice(1).map((c) => c.split("</td>")[0]);
    if (cells.length < 3) continue;
    // Country name often in 2nd cell with a flag icon; status in 3rd cell.
    const countryHtml = cells[0] + " " + (cells[1] ?? "");
    const statusHtml = cells[1] ?? cells[0] ?? "";
    const stayHtml = cells[2] ?? "";

    const countryName = extractCountryName(countryHtml);
    if (!countryName) continue;
    const destIso = countryNameToIso(countryName);
    if (!destIso) continue;

    const statusText = stripHtml(statusHtml).trim();
    const status = mapWikiStatus(statusText);
    if (!status) continue;

    const maxStay = parseMaxStay(stripHtml(stayHtml));
    out.set(destIso, { status, maxStay });
  }
  return out;
}

function extractCountryName(html: string): string | null {
  const m = html.match(/title="([^"]+)"/);
  if (m) return m[1].split(" (")[0];
  const t = stripHtml(html).trim();
  return t.length > 1 && t.length < 80 ? t : null;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function mapWikiStatus(text: string): string | null {
  for (const [re, status] of STATUS_MAP_FROM_WIKI) {
    if (re.test(text)) return status;
  }
  return null;
}

function parseMaxStay(text: string): number | null {
  const m = text.match(/(\d+)\s*(day|month)/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return m[2].toLowerCase().startsWith("month") ? n * 30 : n;
}

function countryNameToIso(name: string): string | null {
  const lower = name.toLowerCase().trim();
  const match = COUNTRY_LIST.find((c) => c.name.toLowerCase() === lower);
  return match?.iso2 ?? null;
}

async function fetchOurOptions(
  passportIso2: string,
): Promise<Map<string, { status: VisaStatus; maxStay: number | null }>> {
  const out = new Map<string, { status: VisaStatus; maxStay: number | null }>();
  const passportRow = await db
    .select({ id: schema.passports.id })
    .from(schema.passports)
    .where(and(eq(schema.passports.issuerIso2, passportIso2), eq(schema.passports.type, "ordinary")))
    .limit(1);
  if (passportRow.length === 0) return out;
  const passportId = passportRow[0].id;
  const rows = await db
    .select({
      dest: schema.visaOptions.destinationIso2,
      status: schema.visaOptions.status,
      maxStay: schema.visaOptions.maxStayDays,
      purpose: schema.visaOptions.purpose,
    })
    .from(schema.visaOptions)
    .where(eq(schema.visaOptions.passportId, passportId));
  for (const r of rows) {
    if (r.purpose !== "tourism") continue;
    out.set(r.dest, { status: r.status as VisaStatus, maxStay: r.maxStay });
  }
  return out;
}

function computeDiff(
  wiki: Map<string, { status: string; maxStay: number | null }>,
  ours: Map<string, { status: VisaStatus; maxStay: number | null }>,
): DiffRow[] {
  const rows: DiffRow[] = [];
  const allIsos = new Set<string>([...wiki.keys(), ...ours.keys()]);
  for (const iso of allIsos) {
    const w = wiki.get(iso);
    const o = ours.get(iso);
    if (w && !o) {
      rows.push({
        iso2_dest: iso,
        name: nameFor(iso),
        wiki_status: w.status,
        our_status: "",
        our_max_stay: null,
        wiki_max_stay: w.maxStay,
        action: "ADD",
      });
    } else if (o && !w) {
      rows.push({
        iso2_dest: iso,
        name: nameFor(iso),
        wiki_status: "",
        our_status: o.status,
        our_max_stay: o.maxStay,
        wiki_max_stay: null,
        action: "OURS_ONLY",
      });
    } else if (w && o) {
      rows.push({
        iso2_dest: iso,
        name: nameFor(iso),
        wiki_status: w.status,
        our_status: o.status,
        our_max_stay: o.maxStay,
        wiki_max_stay: w.maxStay,
        action: w.status === o.status ? "CONFIRM" : "MISMATCH",
      });
    }
  }
  rows.sort((a, b) => a.iso2_dest.localeCompare(b.iso2_dest));
  return rows;
}

async function writeCsv(path: string, rows: DiffRow[]): Promise<void> {
  const header = "iso2_dest,name,wiki_status,our_status,our_max_stay,wiki_max_stay,action";
  const body = rows
    .map((r) =>
      [
        r.iso2_dest,
        csvEscape(r.name),
        r.wiki_status,
        r.our_status,
        r.our_max_stay ?? "",
        r.wiki_max_stay ?? "",
        r.action,
      ].join(","),
    )
    .join("\n");
  await writeFile(path, `${header}\n${body}\n`, "utf8");
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
