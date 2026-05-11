/**
 * Builds the long-tail Wikipedia fixture consumed by wikipedia_long_tail.ts.
 *
 *   npx tsx src/scripts/buildWikipediaFixture.ts             # all 250 passports
 *   npx tsx src/scripts/buildWikipediaFixture.ts ZW MN BO    # subset
 *
 * Fetches each "Visa requirements for <demonym> citizens" page, parses the
 * primary wikitable, and writes the normalised JSON to
 * src/scrapers/sources/__fixtures__/wikipedia_long_tail.json. After running,
 * `npm run bootstrap` will pick the new data up automatically.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { politeFetch } from "@/scrapers/base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import type { VisaStatus } from "@/lib/types";

const FIXTURE_PATH = path.resolve(process.cwd(), "src/scrapers/sources/__fixtures__/wikipedia_long_tail.json");

// Aliases for country names that don't match COUNTRY_LIST exactly. Wikipedia
// uses common names that diverge from the ISO short list in obvious ways.
const NAME_ALIASES: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  "Czech Republic": "CZ",
  Czechia: "CZ",
  "Russian Federation": "RU",
  Russia: "RU",
  "South Korea": "KR",
  "Korea, South": "KR",
  "North Korea": "KP",
  "Korea, North": "KP",
  "Vatican City": "VA",
  "Holy See": "VA",
  "East Timor": "TL",
  "Timor-Leste": "TL",
  Eswatini: "SZ",
  Swaziland: "SZ",
  "Cape Verde": "CV",
  "Cabo Verde": "CV",
  Burma: "MM",
  Myanmar: "MM",
  "Ivory Coast": "CI",
  "Côte d'Ivoire": "CI",
  "Cote d'Ivoire": "CI",
  Macao: "MO",
  Macau: "MO",
  Türkiye: "TR",
  Turkey: "TR",
  Palestine: "PS",
  "Palestinian territories": "PS",
  "Republic of the Congo": "CG",
  "Congo, Republic of the": "CG",
  "Democratic Republic of the Congo": "CD",
  "Congo, Democratic Republic of the": "CD",
  "DR Congo": "CD",
  Kosovo: "XK",
  Taiwan: "TW",
  "Hong Kong": "HK",
  Macedonia: "MK",
  "North Macedonia": "MK",
  "Saint Vincent and the Grenadines": "VC",
  "Saint Kitts and Nevis": "KN",
  "Antigua and Barbuda": "AG",
  "São Tomé and Príncipe": "ST",
  "Sao Tome and Principe": "ST",
  "Trinidad and Tobago": "TT",
  Brunei: "BN",
  Laos: "LA",
  Syria: "SY",
  "Syrian Arab Republic": "SY",
  "South Sudan": "SS",
  Sudan: "SD",
  "United Arab Emirates": "AE",
  Vietnam: "VN",
  Iran: "IR",
  Tanzania: "TZ",
  Bolivia: "BO",
  Moldova: "MD",
  "Federated States of Micronesia": "FM",
  Micronesia: "FM",
  "Marshall Islands": "MH",
  "Solomon Islands": "SB",
  "Papua New Guinea": "PG",
  "New Zealand": "NZ",
  "Saudi Arabia": "SA",
  "Sri Lanka": "LK",
  "South Africa": "ZA",
  "Sierra Leone": "SL",
  "Equatorial Guinea": "GQ",
  "Costa Rica": "CR",
  "Dominican Republic": "DO",
  "El Salvador": "SV",
  Liechtenstein: "LI",
};

function buildNameToIso(): Record<string, string> {
  const m: Record<string, string> = {};
  for (const c of COUNTRY_LIST) m[c.name] = c.iso2;
  for (const [name, iso] of Object.entries(NAME_ALIASES)) m[name] = iso;
  return m;
}

const NAME_TO_ISO = buildNameToIso();

function lookupIso(name: string): string | null {
  // First strip footnote markers and parenthetical phrases.
  const cleaned = name.replace(/\[[^\]]*\]/g, "").replace(/\(.+?\)/g, "").trim();
  return NAME_TO_ISO[cleaned] ?? NAME_TO_ISO[cleaned.replace(/^The\s+/i, "")] ?? null;
}

function classifyStatus(req: string): VisaStatus | null {
  const r = req.toLowerCase();
  // Order matters — "visa free with eta" must beat "visa free".
  if (/\beta\b|electronic travel/i.test(req) && /not required|free|exempt/i.test(req)) return "visa_free_with_eta";
  if (/visa not required|visa-?free|no visa|free of visa/i.test(req)) return "visa_free";
  if (/visa on arrival|on arrival/i.test(req)) return "visa_on_arrival";
  if (/e-?visa|electronic visa|evisitor|nzeta|esta|eta\b/i.test(req)) return "e_visa";
  if (/admission refused|entry refused|banned/i.test(req)) return "refused";
  if (/freedom of movement|free movement/i.test(req)) return "visa_free";
  if (/visa required/i.test(req)) return "embassy_visa";
  return null;
}

function parseStayDays(stay: string): number | null {
  const s = stay.toLowerCase();
  if (!s) return null;
  // "30 days", "90 days", "3 months", "1 year", "unlimited"
  if (/unlimited|indefinite/.test(s)) return null;
  let m = s.match(/(\d+)\s*day/);
  if (m) return parseInt(m[1], 10);
  m = s.match(/(\d+)\s*month/);
  if (m) return parseInt(m[1], 10) * 30;
  m = s.match(/(\d+)\s*year/);
  if (m) return parseInt(m[1], 10) * 365;
  m = s.match(/(\d+)\s*week/);
  if (m) return parseInt(m[1], 10) * 7;
  return null;
}

function cleanText(s: string): string {
  return s.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Search Wikipedia for the "Visa requirements for X" page when our demonym
 * URL guess doesn't resolve. Returns the absolute URL of the best match, or
 * null if no plausible candidate exists.
 */
async function searchVisaRequirementsPage(passportIso: string): Promise<string | null> {
  const demonym = nationalityFor(passportIso);
  const passportName = nameFor(passportIso);
  const queries = [
    `Visa requirements for ${demonym} citizens`,
    `Visa requirements for ${passportName} citizens`,
    `Visa requirements for citizens of ${passportName}`,
    `Visa requirements for ${demonym} passport holders`,
  ];
  for (const q of queries) {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&srlimit=5`;
    let res;
    try {
      res = await politeFetch(apiUrl, { maxRetries: 1, timeoutMs: 15_000 });
    } catch {
      continue;
    }
    if (!res.ok) continue;
    const json = (await res.json()) as { query?: { search?: { title: string }[] } };
    const hits = json.query?.search ?? [];
    const match = hits.find((h) => /^visa requirements for /i.test(h.title));
    if (match) {
      return `https://en.wikipedia.org/wiki/${encodeURIComponent(match.title.replace(/\s+/g, "_"))}`;
    }
  }
  return null;
}

function nameFor(iso: string): string {
  const c = COUNTRY_LIST.find((x) => x.iso2 === iso);
  return c?.name ?? iso;
}

async function fetchPassport(iso: string): Promise<{
  iso2: string;
  wikipediaUrl: string;
  fetchedAt: string;
  rows: Array<{ destinationIso2: string; status: VisaStatus; maxStayDays: number | null; notes: string | null; rawRequirement: string }>;
} | null> {
  const demonym = nationalityFor(iso);
  const guessSlug = `Visa_requirements_for_${encodeURIComponent(demonym.replace(/\s+/g, "_"))}_citizens`;
  let url = `https://en.wikipedia.org/wiki/${guessSlug}`;
  let res;
  try {
    res = await politeFetch(url, { maxRetries: 1, timeoutMs: 20_000 });
  } catch {
    process.stderr.write(`  ${iso}: fetch failed (direct URL)\n`);
    res = null;
  }
  // Fall back to the MediaWiki search API if the demonym-guess URL didn't
  // return a usable page. Many passports failed because the demonym is
  // multi-word ("Trinidadian and Tobagonian", "Saint Kitts and Nevis citizens")
  // and doesn't slot into the simple URL template.
  if (!res || !res.ok) {
    process.stderr.write(`  ${iso}: direct URL ${res?.status ?? "fetch-failed"}, trying search API\n`);
    const found = await searchVisaRequirementsPage(iso);
    if (!found) {
      process.stderr.write(`  ${iso}: search API found no plausible page\n`);
      return null;
    }
    url = found;
    try {
      res = await politeFetch(url, { maxRetries: 1, timeoutMs: 20_000 });
    } catch {
      process.stderr.write(`  ${iso}: fetch failed (via search)\n`);
      return null;
    }
    if (!res.ok) {
      process.stderr.write(`  ${iso}: ${res.status} via search (${url})\n`);
      return null;
    }
  }
  const html = await res.text();
  const $ = cheerio.load(html);
  const tables = $("table.wikitable").toArray();
  // Find the FIRST table whose header row mentions "Country" + "Visa".
  const mainTable = tables.find((t) => {
    const headers = $(t).find("tr").first().find("th").map((_, th) => $(th).text().toLowerCase()).get().join(" ");
    return /country/.test(headers) && /visa/.test(headers);
  });
  if (!mainTable) {
    process.stderr.write(`  ${iso}: no recognisable wikitable\n`);
    return null;
  }

  const rows: Array<{ destinationIso2: string; status: VisaStatus; maxStayDays: number | null; notes: string | null; rawRequirement: string }> = [];
  $(mainTable).find("tr").slice(1).each((_, tr) => {
    const cells = $(tr).find("td");
    if (cells.length < 2) return;
    const country = cleanText(cells.eq(0).text());
    const requirement = cleanText(cells.eq(1).text());
    const stay = cells.length > 2 ? cleanText(cells.eq(2).text()) : "";
    const notes = cells.length > 3 ? cleanText(cells.eq(3).text()) : "";
    const destIso = lookupIso(country);
    if (!destIso) return;
    const status = classifyStatus(requirement);
    if (!status) return;
    rows.push({
      destinationIso2: destIso,
      status,
      maxStayDays: parseStayDays(stay),
      notes: notes || null,
      rawRequirement: requirement,
    });
  });

  process.stderr.write(`  ${iso}: ${rows.length} rows\n`);
  return { iso2: iso, wikipediaUrl: url, fetchedAt: new Date().toISOString(), rows };
}

async function main() {
  const args = process.argv.slice(2).map((s) => s.toUpperCase());
  const passports = args.length > 0 ? args : COUNTRY_LIST.map((c) => c.iso2);
  const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
  const targets = passports.filter((p) => validIso.has(p));

  // Merge with existing fixture so partial runs (e.g. retrying just the
  // failed passports) don't wipe data we already have.
  const existing: Map<string, NonNullable<Awaited<ReturnType<typeof fetchPassport>>>> = new Map();
  if (args.length > 0 && existsSync(FIXTURE_PATH)) {
    try {
      const prior = JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as {
        passports: NonNullable<Awaited<ReturnType<typeof fetchPassport>>>[];
      };
      for (const p of prior.passports) existing.set(p.iso2, p);
      console.log(`Merging into existing fixture (${existing.size} passports already present).`);
    } catch {
      console.log("Existing fixture unreadable — starting fresh.");
    }
  }

  console.log(`Fetching ${targets.length} Wikipedia passport pages...`);

  for (const iso of targets) {
    const r = await fetchPassport(iso);
    if (r) existing.set(iso, r);
  }

  const fixture = {
    generatedAt: new Date().toISOString(),
    passports: [...existing.values()].sort((a, b) => a.iso2.localeCompare(b.iso2)),
  };

  mkdirSync(path.dirname(FIXTURE_PATH), { recursive: true });
  writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 2));

  const totalRows = fixture.passports.reduce((n, p) => n + p.rows.length, 0);
  console.log(`\n✓ Wrote ${fixture.passports.length} passports total (this run: ${targets.length} requested), ${totalRows} rows → ${FIXTURE_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
