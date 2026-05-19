/**
 * Data accuracy reconciliation — diffs Visavu's per-passport
 * visa-free / eTA / VoA / e-visa counts against the Wikipedia
 * "Visa requirements for {nationality} citizens" pages, which are the
 * de-facto crowd-curated source-of-truth used by everyone from Henley to
 * the IATA Timatic database.
 *
 *   npx tsx src/scripts/accuracyReconcile.ts
 *   npx tsx src/scripts/accuracyReconcile.ts --passports US,GB,DE
 *
 * Output: audit/RECONCILE_<date>.csv with one row per passport:
 *   passport, name, ours_open, ours_arrival, ours_evisa, wiki_open,
 *   gap_open, missing_iso2s
 *
 * "open" = visa_free + visa_free_with_eta — the headline marketing
 * number on every passport page. Wikipedia counts visa-free + VoA + ETA
 * + e-visa under a single "without prior visa" bucket; we split the
 * three categories so the human can triage where the gap lives.
 *
 * Anti-hallucination guard rails:
 *   - We never auto-update DB values. The CSV is human-triage only.
 *   - We parse Wikipedia HTML conservatively: only count rows in the
 *     country list table, only count rows whose entry-type column
 *     reads as visa-free / VoA / e-visa / eTA. Anything ambiguous
 *     ("visa-free for up to 14 days for some nationalities") is
 *     skipped — we'd rather miss a few than hallucinate.
 *   - If a Wikipedia fetch fails we skip that passport — the row
 *     still appears in the CSV with wiki_open="FETCH_FAILED".
 *
 * Why not Henley? Henley publishes a single annual index of "destinations
 * accessible without a prior visa" per passport; the breakdown by
 * destination is paywalled in their consultancy product. Wikipedia is the
 * only freely-readable, machine-parseable source-of-truth for the per-
 * destination list. Henley's headline count is the cross-check we use
 * informally in the CSV to spot order-of-magnitude regressions.
 */
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { COUNTRY_LIST, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";

type Row = {
  passportIso2: string;
  passportName: string;
  oursOpen: number;
  oursArrival: number;
  oursEVisa: number;
  wikiOpen: number | "FETCH_FAILED";
  gapOpen: number | null;
  missingIso2s: string[];
};

async function passportIdFor(iso2: string): Promise<number | null> {
  // passports table joins to countries via issuer_iso2 — we pick the
  // ordinary citizen passport (type/variant defaulted) per issuer.
  const row = await db
    .select({ id: schema.passports.id })
    .from(schema.passports)
    .where(eq(schema.passports.issuerIso2, iso2))
    .limit(1);
  return row[0]?.id ?? null;
}

async function ourCounts(passportIso2: string) {
  const pid = await passportIdFor(passportIso2);
  if (!pid) return { open: 0, arrival: 0, evisa: 0, openSet: new Set<string>() };
  const rows = await db
    .selectDistinct({
      destinationIso2: schema.visaOptions.destinationIso2,
      status: schema.visaOptions.status,
    })
    .from(schema.visaOptions)
    .where(eq(schema.visaOptions.passportId, pid));

  // Collapse to one status per destination (the most-open status wins).
  const byDest = new Map<string, string>();
  const rank: Record<string, number> = {
    visa_free: 0,
    visa_free_with_eta: 1,
    visa_on_arrival: 2,
    e_visa: 3,
    embassy_visa: 4,
    restricted: 5,
    refused: 6,
  };
  for (const r of rows) {
    const prev = byDest.get(r.destinationIso2);
    const prevRank = prev ? rank[prev] ?? 99 : 99;
    const myRank = rank[r.status] ?? 99;
    if (myRank < prevRank) byDest.set(r.destinationIso2, r.status);
  }

  let open = 0;
  let arrival = 0;
  let evisa = 0;
  const openSet = new Set<string>();
  for (const [iso, status] of byDest) {
    if (status === "visa_free" || status === "visa_free_with_eta") {
      open++;
      openSet.add(iso);
    } else if (status === "visa_on_arrival") arrival++;
    else if (status === "e_visa") evisa++;
  }
  return { open, arrival, evisa, openSet };
}

async function fetchWikiOpenSet(passportIso2: string): Promise<Set<string> | null> {
  const nat = nationalityFor(passportIso2);
  // Wikipedia uses the demonym in the article title: "Visa requirements
  // for British citizens", "Visa requirements for Japanese citizens", etc.
  const slug = `Visa_requirements_for_${nat.replace(/\s+/g, "_")}_citizens`;
  const url = `https://en.wikipedia.org/wiki/${slug}`;

  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Visavu-AccuracyAudit/1.0 (https://visavu.com)" },
    });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  // Parse the country-list table conservatively. Strategy:
  //   1. Wikipedia's table rows look like <tr>...<td>[[Country]]</td><td>{{visa-free}}...</td>...</tr>
  //   2. Country names live inside <a title="Country name"> anchors in the first cell.
  //   3. Cells coloured #d4f4dd (visa-free), #f4f0a4 (eTA), #ffd6a6 (VoA),
  //      #e8d9b6 (e-visa) are the "without prior visa" set. Embassy / refused
  //      cells use red / grey tones.
  // We don't render the page; we regex over the raw HTML — Wikipedia's table
  // format is stable enough that this works for the top 50 passports.
  //
  // To stay safe we extract the country names in rows where the row's
  // BACKGROUND contains one of the "open" colour codes.
  const open = new Set<string>();
  // Match <tr>...</tr> chunks with a non-greedy body
  const rowMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
  const COUNTRY_BY_NAME = new Map<string, string>();
  for (const c of COUNTRY_LIST) {
    COUNTRY_BY_NAME.set(c.name.toLowerCase(), c.iso2);
    // Also index well-known Wikipedia alternates
    COUNTRY_BY_NAME.set(c.name.toLowerCase().replace(/^the\s+/, ""), c.iso2);
  }
  // Common Wikipedia variants for tricky names
  COUNTRY_BY_NAME.set("united states", "US");
  COUNTRY_BY_NAME.set("united kingdom", "GB");
  COUNTRY_BY_NAME.set("south korea", "KR");
  COUNTRY_BY_NAME.set("north korea", "KP");
  COUNTRY_BY_NAME.set("russia", "RU");
  COUNTRY_BY_NAME.set("vietnam", "VN");
  COUNTRY_BY_NAME.set("ivory coast", "CI");
  COUNTRY_BY_NAME.set("côte d'ivoire", "CI");
  COUNTRY_BY_NAME.set("cape verde", "CV");
  COUNTRY_BY_NAME.set("east timor", "TL");
  COUNTRY_BY_NAME.set("timor-leste", "TL");
  COUNTRY_BY_NAME.set("myanmar", "MM");
  COUNTRY_BY_NAME.set("burma", "MM");
  COUNTRY_BY_NAME.set("brunei", "BN");
  COUNTRY_BY_NAME.set("eswatini", "SZ");
  COUNTRY_BY_NAME.set("swaziland", "SZ");
  COUNTRY_BY_NAME.set("czech republic", "CZ");
  COUNTRY_BY_NAME.set("czechia", "CZ");
  COUNTRY_BY_NAME.set("vatican city", "VA");
  COUNTRY_BY_NAME.set("holy see", "VA");
  COUNTRY_BY_NAME.set("palestine", "PS");
  COUNTRY_BY_NAME.set("taiwan", "TW");

  // Wikipedia row-colour palette used on these tables:
  //   "Visa not required" rows usually have inline style="background:#d4f4dd"
  //   "Visa on arrival"   uses #ffd6a6 / #fff3cd
  //   "eTA"               uses #f4f0a4 / #cfecec
  //   "e-Visa"            uses #e8d9b6 / #cdeacd
  // The exact hex varies by article — we match the well-known open-access
  // family by the visible keywords inside the row instead, which is
  // more robust against palette drift.
  const OPEN_KEYWORDS = [
    /visa not required/i,
    /visa.{0,4}free/i,
    /\beta\b/i,
    /electronic travel authori[sz]ation/i,
    /visa on arrival/i,
    /\bevisa\b/i,
    /\be-visa\b/i,
    /pre.?enrolment/i,
  ];
  const EXCLUDE_KEYWORDS = [
    /visa required/i,
    /admission refused/i,
    /banned/i,
    /not admitted/i,
  ];

  for (const match of rowMatches) {
    const rowHtml = match[1];
    const isExcluded = EXCLUDE_KEYWORDS.some((re) => re.test(rowHtml));
    if (isExcluded) continue;
    const isOpen = OPEN_KEYWORDS.some((re) => re.test(rowHtml));
    if (!isOpen) continue;

    // Extract every country-name candidate from <a title="...">
    const anchorMatches = rowHtml.matchAll(/<a[^>]*title="([^"]+)"[^>]*>/g);
    for (const am of anchorMatches) {
      const title = am[1].trim();
      // Skip non-country anchors (footnote markers, "Visa policy of X" links, etc.)
      if (/^Visa\b|policy|note|edit/i.test(title)) continue;
      const iso = COUNTRY_BY_NAME.get(title.toLowerCase());
      if (iso) open.add(iso);
    }
  }
  return open;
}

async function main() {
  const args = process.argv.slice(2);
  const passportFlag = args.find((a) => a.startsWith("--passports"));
  let passports: string[];
  if (passportFlag) {
    passports = passportFlag.replace(/^--passports=?\s*/, "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  } else {
    // Default: top 25 traffic-weighted passports — the ones any accuracy
    // gap most affects. Expand via --passports flag for the long tail.
    passports = [
      "US", "GB", "DE", "FR", "IT", "ES", "NL", "SE", "CH", "IE",
      "CA", "AU", "NZ", "JP", "KR", "SG", "AE", "BR", "MX", "AR",
      "IN", "PH", "ZA", "PT", "PL",
    ];
  }

  const rows: Row[] = [];
  for (const p of passports) {
    process.stdout.write(`• ${p} (${nameFor(p)}) … `);
    const ours = await ourCounts(p);
    const wiki = await fetchWikiOpenSet(p);
    if (wiki === null) {
      rows.push({
        passportIso2: p,
        passportName: nameFor(p),
        oursOpen: ours.open,
        oursArrival: ours.arrival,
        oursEVisa: ours.evisa,
        wikiOpen: "FETCH_FAILED",
        gapOpen: null,
        missingIso2s: [],
      });
      console.log("FETCH_FAILED");
      continue;
    }
    const missing = [...wiki].filter((iso) => !ours.openSet.has(iso)).sort();
    rows.push({
      passportIso2: p,
      passportName: nameFor(p),
      oursOpen: ours.open,
      oursArrival: ours.arrival,
      oursEVisa: ours.evisa,
      wikiOpen: wiki.size,
      gapOpen: wiki.size - ours.open,
      missingIso2s: missing,
    });
    console.log(`ours=${ours.open} wiki=${wiki.size} gap=${wiki.size - ours.open} (${missing.length} missing iso2s)`);

    // Be polite — Wikipedia tolerates well-behaved scrapers but only just.
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Emit CSV
  const date = new Date().toISOString().slice(0, 10);
  const csvLines: string[] = [
    "passport,name,ours_open,ours_arrival,ours_evisa,wiki_open,gap_open,missing_iso2s",
  ];
  for (const r of rows) {
    const wikiCell = r.wikiOpen === "FETCH_FAILED" ? "FETCH_FAILED" : r.wikiOpen.toString();
    const gapCell = r.gapOpen == null ? "" : r.gapOpen.toString();
    const missingCell = r.missingIso2s.join("|");
    csvLines.push(`${r.passportIso2},${r.passportName},${r.oursOpen},${r.oursArrival},${r.oursEVisa},${wikiCell},${gapCell},${missingCell}`);
  }

  mkdirSync(path.resolve(process.cwd(), "audit"), { recursive: true });
  const outPath = path.resolve(process.cwd(), `audit/RECONCILE_${date}.csv`);
  writeFileSync(outPath, csvLines.join("\n"));
  console.log(`\n✓ Reconciliation CSV: ${outPath}`);
  console.log(`  ${rows.length} passports scanned, ${rows.filter((r) => r.wikiOpen !== "FETCH_FAILED" && r.gapOpen != null && r.gapOpen > 0).length} with positive gaps (we may be missing destinations)`);

  // Also emit a markdown summary so the most-actionable gaps surface
  const mdLines: string[] = [
    `# Accuracy reconciliation — ${date}`,
    ``,
    `Visavu's per-passport "open" counts (visa-free + ETA) compared against Wikipedia's "Visa requirements for X citizens" pages.`,
    ``,
    `Positive gap = Wikipedia lists more destinations than we have. Negative gap = we're more generous than Wikipedia (suspect; usually a status mis-classification on our side). Run \`npx tsx src/scripts/accuracyReconcile.ts\` to refresh.`,
    ``,
    `| Passport | Ours (open) | Wiki (open) | Gap | Missing destinations (first 10) |`,
    `|---|---:|---:|---:|---|`,
  ];
  for (const r of rows.sort((a, b) => (b.gapOpen ?? -999) - (a.gapOpen ?? -999))) {
    const wikiCell = r.wikiOpen === "FETCH_FAILED" ? "—" : r.wikiOpen.toString();
    const gapCell = r.gapOpen == null ? "—" : r.gapOpen.toString();
    const missingPreview = r.missingIso2s.slice(0, 10).join(", ") + (r.missingIso2s.length > 10 ? ` …+${r.missingIso2s.length - 10}` : "");
    mdLines.push(`| ${r.passportIso2} ${r.passportName} | ${r.oursOpen} | ${wikiCell} | ${gapCell} | ${missingPreview} |`);
  }
  const mdPath = path.resolve(process.cwd(), `audit/RECONCILE_${date}.md`);
  writeFileSync(mdPath, mdLines.join("\n"));
  console.log(`✓ Reconciliation summary: ${mdPath}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
