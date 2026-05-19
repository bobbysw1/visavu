/**
 * Re-fetch passport-cover photos for the ISOs currently in
 * COLLAGE_BLOCKED_ISOS — the 34 entries where the previous fetcher
 * picked the wrong image (entry stamps, peacekeeper photos, ceremony
 * shots, ferry pictures etc).
 *
 * Strategy:
 *   1. For each blocked iso, run the same 3 search strategies as the
 *      main fetcher (page summary, Commons category, Commons file
 *      search).
 *   2. Apply a STRICTER ranker that requires the filename to mention
 *      "passport" AND hard-rejects filenames containing peacekeepers /
 *      refugees / ceremony / stamp / border / ferry etc.
 *   3. Adopt the top-scoring candidate ONLY if it clears a confidence
 *      threshold (score >= 100 — i.e. the filename must contain at
 *      least "cover" or "passport_cover" or two strong-positive
 *      indicators).
 *   4. Write the new file alongside the existing one + log to
 *      audit/PASSPORT_REFETCH_REPORT.md so you can spot-check before
 *      removing the iso from COLLAGE_BLOCKED_ISOS.
 *
 *   npx tsx src/scripts/refetchBlockedPassportCovers.ts
 *   npx tsx src/scripts/refetchBlockedPassportCovers.ts --only=ML,BT
 *
 * Output:
 *   - public/passports/{iso}.jpg          replaced if candidate adopted
 *   - public/passports/manifest.json      entry updated with new source
 *   - audit/PASSPORT_REFETCH_REPORT.md    every iso's outcome with link
 *                                          to the Commons file so you
 *                                          can visually verify before
 *                                          delisting from the blocklist.
 *
 * After this runs, manually inspect the report. Items with status
 * "ADOPTED" can be removed from COLLAGE_BLOCKED_ISOS in
 * src/lib/passportCovers.ts. Items with status "NO_SAFE_CANDIDATE"
 * stay blocklisted — Wikimedia genuinely doesn't have a clean cover
 * photo for that passport.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { COUNTRY_LIST, nameFor } from "../lib/countries";
import { nationalityFor } from "../lib/nationalities";

const DIR = path.resolve(process.cwd(), "public/passports");
const MANIFEST_PATH = path.join(DIR, "manifest.json");
const REPORT_PATH = path.resolve(process.cwd(), "audit/PASSPORT_REFETCH_REPORT.md");
const USER_AGENT =
  "VisavuBot/1.0 (+https://visavu.com; contact@visavu.com) passport-cover refetch";

// Score threshold to adopt — equivalent to "filename contains 'cover'
// OR 'passport_cover' OR ('passport' + one other strong positive)".
const MIN_ADOPT_SCORE = 100;

// Re-derive the current blocklist from lib/passportCovers — keep this
// in sync with that file when you update it.
const BLOCKED_ISOS = new Set([
  "BT","BW","ML","NR","PW","VI","ZM",
  "AW","BL","BS","CW","FJ","GF","GM","GP","GQ","HT","LS","MQ","NC","NU",
  "PF","PM","RE","SB","SR","TO","YT","CC","CX","NF","CK","TK","BZ",
]);

const ONLY = (() => {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return null;
  return new Set(arg.slice("--only=".length).split(",").map((s) => s.trim().toUpperCase()));
})();

type ManifestEntry = {
  file: string;
  source: string;
  commonsFile: string;
  artist: string;
  licence: string;
  licenceUrl: string | null;
  width: number;
  height: number;
  fetchedAt: string;
};
type Manifest = Record<string, ManifestEntry>;

function loadManifest(): Manifest {
  if (!existsSync(MANIFEST_PATH)) return {};
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
}

function saveManifest(m: Manifest) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2));
}

/** Does the filename actually contain the country's name (or a recognisable
 *  variant)? Critical safety check — without this, the ranker matches on
 *  "passport_cover" appearing in some other country's filename:
 *  e.g. when looking up Palau it picked up "Somaliland_passport_cover.jpg"
 *  just because "passport_cover" scored 200. The filename MUST also
 *  identify the target country to be considered. */
function filenameMentionsCountry(filename: string, country: string, iso: string): boolean {
  const lower = filename.toLowerCase().replace(/[^a-z]+/g, "_");
  const cleanCountry = country.toLowerCase().replace(/[^a-z]+/g, "_");
  // Try full country name first
  if (lower.includes(cleanCountry)) return true;
  // Then the first significant word ("united_states" → "states" too short, but
  // "saudi_arabia" → "saudi" works; "mali" → "mali" works; "côte_d_ivoire" →
  // "côte" works after normalisation)
  const firstWord = cleanCountry.split("_")[0];
  if (firstWord.length >= 4 && lower.includes(firstWord)) return true;
  // ISO2 as a fallback — e.g. "pw_passport.jpg" or "passport_pw.jpg"
  const isoLower = iso.toLowerCase();
  if (new RegExp(`(^|_)${isoLower}(_|\\.)`).test(lower)) return true;
  return false;
}

/** STRICT ranker — much tighter than the main fetcher's. Requires the
 *  filename to mention "passport" and hard-rejects anything matching
 *  known bad keywords from the original audit. */
function strictRank(filename: string): number {
  const lower = filename.toLowerCase();
  let score = 0;

  // === Strong positive (a real passport cover photo) ===
  if (/passport[_\s-]?cover/.test(lower)) score += 200;
  if (/\bcover[_\s-]?(of[_\s-]?)?passport\b/.test(lower)) score += 200;
  if (/\b(?:front|cover)\b/.test(lower) && /passport/.test(lower)) score += 100;
  if (/biometric[_\s-]?passport/.test(lower)) score += 80;
  if (/new[_\s-]?passport/.test(lower)) score += 60;
  if (/passport\.(?:jpe?g|png)$/i.test(lower)) score += 50;
  if (/^passport[_\s-]/.test(lower)) score += 50;

  // Generic positive — base "passport" mention
  if (/passport|passeport|passaporte|passaport|pasaporte|paspoort|reisepass|paszport|pass\.|护照|pasport|🛂/.test(lower)) {
    score += 30;
  }

  // === Hard reject (status: never adopt these even if other signals positive) ===
  const HARD_REJECT = [
    /peacekeepers?/, /refugees?/, /ceremony/, /ceremonies/, /meets/, /meeting/,
    /^entry/, /\bentry[_\s-]/, /\bexit\b/, /\barrival\b/, /\bdeparture\b/,
    /\bstamp\b/, /stamps?\b/, /\bvisa\b/, /\bimmigration\b/, /\bbordr?\b/, /\bborder\b/,
    /tractor/, /\bship\b/, /\btamar\b/, /\btanker\b/, /\bferry\b/,
    /\bairport\b/, /\bcrossing\b/, /\bgate\b/, /\bhall\b/, /\bdesk\b/,
    /\bcamp\b/, /campsite/, /\brefugee[_\s-]?camp\b/,
    /coat[_\s-]?of[_\s-]?arms/, /\bemblem\b/, /\bcrest\b/, /\bseal\b/, /\blogo\b/, /\bflag\b/,
    /\binside\b/, /\bbio[_\s-]?page\b/, /\bdata[_\s-]?page\b/, /\bpage[_\s-]?[0-9]+\b/,
    /\binner\b/, /\bopen\b/,
    /\bspecimen\b/, /vintage|historic|\b1[89]\d\d\b/,
    /tour[_\s-]?of/, /visit[_\s-]?of/, /assignment[_\s-]/,
    /soldiers?|military|peacekeeping/,
    /\bsecretary\b/, /\bpresident\b/, /\bminister\b/, /\bmod\b/,
    /\bnational[_\s-]?park\b/, /\bbeach\b/, /\bisland\b(?!_passport)/,
    /\bcap[_\s-]?\d/, /soi[_\s-]?k/, /dpla/,
    /\.webp$/, // generic stubs we've previously seen wrong
  ];
  for (const pat of HARD_REJECT) {
    if (pat.test(lower)) return -1000;
  }

  // Soft negatives — knock down but don't reject
  if (/diplomat|service[_\s-]?passport|official[_\s-]?passport/.test(lower)) score -= 50;

  // === Parent-passport contamination — score down hard for dependency names ===
  const DEPENDENCY_PATTERNS = [
    /\bbno\b/, /british[_\s-]?national/, /\bgibraltar\b/, /\bbermuda\b/,
    /\bcayman\b/, /\banguilla\b/, /\bturks\b/, /\bmontserrat\b/,
    /\bvirgin[_\s-]?islands\b/, /\baruba\b/, /\bsint[_\s-]?maarten\b/,
    /\bcuracao\b/, /\bbonaire\b/, /\bcuraçao\b/,
    /\bsaint[_\s-]?pierre\b/, /\bnew[_\s-]?caledonia\b/,
    /\bfrench[_\s-]?polynesia\b/, /\bwallis\b/, /\bmayotte\b/, /\bréunion\b/, /\breunion\b/,
  ];
  for (const pat of DEPENDENCY_PATTERNS) {
    if (pat.test(lower)) score -= 200;
  }

  // Format prefs
  if (/\.svg$/i.test(lower)) score -= 40;
  if (/\.jpe?g$/i.test(lower)) score += 15;
  if (/\.png$/i.test(lower)) score += 5;

  return score;
}

type Candidate = {
  filename: string;
  score: number;
  strategy: "summary" | "category" | "search";
};

type WikiSummary = {
  title: string;
  content_urls?: { desktop?: { page?: string } };
  originalimage?: { source: string; width: number; height: number };
  thumbnail?: { source: string };
};

async function fetchSummary(title: string): Promise<WikiSummary | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  return res.ok ? ((await res.json()) as WikiSummary) : null;
}

function commonsFilename(url: string): string | null {
  const m = url.match(/\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+?\.(?:jpg|jpeg|png|svg|webp))(?:\/|$)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

async function commonsCategoryFiles(country: string): Promise<string[]> {
  const variants = [
    `Category:Passports of ${country}`,
    `Category:Passports of the ${country}`,
    `Category:${country} passports`,
  ];
  for (const cat of variants) {
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
      "&list=categorymembers&cmtype=file&cmlimit=50" +
      `&cmtitle=${encodeURIComponent(cat)}`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) continue;
    const data = (await res.json()) as { query?: { categorymembers?: { title: string }[] } };
    const files = (data.query?.categorymembers ?? [])
      .map((m) => m.title.replace(/^File:/, ""))
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
    if (files.length > 0) return files;
  }
  return [];
}

async function commonsSearchFiles(country: string): Promise<string[]> {
  const queries = [`${country} passport cover`, `Passport of ${country}`, `${country} biometric passport`];
  const seen = new Set<string>();
  const collected: string[] = [];
  for (const q of queries) {
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
      "&list=search&srnamespace=6&srlimit=20" +
      `&srsearch=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) continue;
    const data = (await res.json()) as { query?: { search?: { title: string }[] } };
    for (const hit of data.query?.search ?? []) {
      const filename = hit.title.replace(/^File:/, "");
      if (!/\.(jpe?g|png|webp)$/i.test(filename)) continue;
      if (seen.has(filename)) continue;
      seen.add(filename);
      collected.push(filename);
    }
  }
  return collected;
}

type CommonsImageInfo = {
  url: string;
  width: number;
  height: number;
  extmetadata?: {
    LicenseShortName?: { value: string };
    LicenseUrl?: { value: string };
    Artist?: { value: string };
  };
  descriptionurl: string;
};

async function fetchImageInfo(filename: string): Promise<CommonsImageInfo | null> {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo" +
    "&iiprop=url|size|extmetadata&iiurlwidth=1024&origin=*" +
    `&titles=${encodeURIComponent("File:" + filename)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    query?: { pages?: Record<string, { imageinfo?: CommonsImageInfo[] }> };
  };
  const first = Object.values(data.query?.pages ?? {})[0];
  return first?.imageinfo?.[0] ?? null;
}

function isFreeLicence(licence: string): boolean {
  return /^(cc[\s-]|public domain|cc0|pdm|attribution|ogl)/i.test(licence) || /pd-/i.test(licence);
}

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

async function downloadImage(url: string, dest: string): Promise<void> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

type Outcome = {
  iso: string;
  country: string;
  status: "ADOPTED" | "NO_SAFE_CANDIDATE" | "NO_FREE_LICENCE" | "ERROR";
  best?: Candidate;
  bestUrl?: string;
  bestSource?: string;
  reason?: string;
};

async function processIso(iso: string): Promise<Outcome> {
  const country = nameFor(iso);
  const candidates: Candidate[] = [];

  // Strategy 1 — Wikipedia "X passport" article infobox
  const summary = await fetchSummary(`${country} passport`);
  if (summary?.originalimage?.source) {
    const cf = commonsFilename(summary.originalimage.source);
    // Strategy-1 hit comes from the country's own Wikipedia article —
    // we trust the country identification (no name-in-filename check).
    if (cf) candidates.push({ filename: cf, score: strictRank(cf), strategy: "summary" });
  }

  // Strategy 2 — Commons category. The CATEGORY name identifies the
  // country (e.g. "Passports of Mali"), so any file IN that category
  // is implicitly Mali-related — no filename-name-check needed.
  for (const f of await commonsCategoryFiles(country)) {
    candidates.push({ filename: f, score: strictRank(f), strategy: "category" });
  }

  // Strategy 3 — Commons file search. CRITICAL: this is the strategy
  // that fooled us with "Somaliland_passport_cover.jpg" winning for
  // Palau. Require the filename itself to mention the country here.
  for (const f of await commonsSearchFiles(country)) {
    if (!filenameMentionsCountry(f, country, iso)) continue;
    candidates.push({ filename: f, score: strictRank(f), strategy: "search" });
  }

  // Dedupe + sort by strict score
  const dedupe = new Map<string, Candidate>();
  for (const c of candidates) {
    const existing = dedupe.get(c.filename);
    if (!existing || c.score > existing.score) dedupe.set(c.filename, c);
  }
  const ranked = [...dedupe.values()].sort((a, b) => b.score - a.score);

  if (ranked.length === 0 || ranked[0].score < MIN_ADOPT_SCORE) {
    return {
      iso,
      country,
      status: "NO_SAFE_CANDIDATE",
      best: ranked[0],
      reason: ranked.length === 0
        ? "No candidates returned by any strategy"
        : `Top candidate scored ${ranked[0].score} (need ≥${MIN_ADOPT_SCORE})`,
    };
  }

  const winner = ranked[0];
  const info = await fetchImageInfo(winner.filename);
  if (!info) {
    return { iso, country, status: "ERROR", best: winner, reason: "Could not fetch image info" };
  }
  const licence = info.extmetadata?.LicenseShortName?.value ?? "";
  if (!isFreeLicence(licence)) {
    return {
      iso, country, status: "NO_FREE_LICENCE", best: winner,
      reason: `Licence "${licence}" not in CC / PD / OGL allowlist`,
    };
  }

  const dest = path.join(DIR, `${iso.toLowerCase()}.jpg`);
  try {
    await downloadImage(info.url, dest);
  } catch (err) {
    return {
      iso, country, status: "ERROR", best: winner,
      reason: `Download failed: ${err instanceof Error ? err.message : err}`,
    };
  }

  // Update manifest
  const manifest = loadManifest();
  manifest[iso] = {
    file: `/passports/${iso.toLowerCase()}.jpg`,
    source: `https://en.wikipedia.org/wiki/${encodeURIComponent(`${country} passport`)}`,
    commonsFile: info.descriptionurl,
    artist: plainText(info.extmetadata?.Artist?.value ?? "Wikimedia Commons"),
    licence,
    licenceUrl: info.extmetadata?.LicenseUrl?.value ?? null,
    width: info.width,
    height: info.height,
    fetchedAt: new Date().toISOString(),
  };
  saveManifest(manifest);

  return {
    iso, country, status: "ADOPTED", best: winner,
    bestUrl: info.descriptionurl,
    bestSource: info.url,
  };
}

async function main() {
  const isos = [...BLOCKED_ISOS].filter((iso) => !ONLY || ONLY.has(iso)).sort();
  console.log(`Re-fetching ${isos.length} blocked passport covers with strict ranker (min score ${MIN_ADOPT_SCORE})\n`);
  const outcomes: Outcome[] = [];

  for (const iso of isos) {
    process.stdout.write(`  ${iso} (${nameFor(iso)})... `);
    try {
      const r = await processIso(iso);
      outcomes.push(r);
      const tag =
        r.status === "ADOPTED" ? "✓ adopted" :
        r.status === "NO_SAFE_CANDIDATE" ? "○ no safe candidate" :
        r.status === "NO_FREE_LICENCE" ? "⚠ non-free licence" :
        "✗ error";
      console.log(`${tag}${r.best ? `  [score ${r.best.score}, ${r.best.strategy}]` : ""}`);
    } catch (err) {
      outcomes.push({
        iso, country: nameFor(iso), status: "ERROR",
        reason: err instanceof Error ? err.message : String(err),
      });
      console.log(`✗ error: ${err}`);
    }
    // Polite delay between countries to avoid hammering Wikimedia.
    await new Promise((r) => setTimeout(r, 250));
  }

  // Write the audit report
  if (!existsSync(path.dirname(REPORT_PATH))) mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const lines: string[] = [
    `# Passport cover refetch report — ${new Date().toISOString().slice(0, 10)}`,
    ``,
    `Re-fetched ${isos.length} ISOs from the collage blocklist with the strict ranker (min adopt score ${MIN_ADOPT_SCORE}). Audit what was adopted by clicking the Commons file URL; if the image is genuinely a passport cover, delete that ISO from \`COLLAGE_BLOCKED_ISOS\` in \`src/lib/passportCovers.ts\`.`,
    ``,
    `## Summary`,
    `- Adopted: ${outcomes.filter((o) => o.status === "ADOPTED").length}`,
    `- No safe candidate: ${outcomes.filter((o) => o.status === "NO_SAFE_CANDIDATE").length}`,
    `- Non-free licence: ${outcomes.filter((o) => o.status === "NO_FREE_LICENCE").length}`,
    `- Error: ${outcomes.filter((o) => o.status === "ERROR").length}`,
    ``,
    `## Per-ISO outcomes`,
    ``,
    `| ISO | Country | Status | Top candidate | Score | Strategy | Inspect |`,
    `|---|---|---|---|---|---|---|`,
  ];
  for (const o of outcomes) {
    const inspect = o.bestUrl ? `[Commons](${o.bestUrl})` : "—";
    const fname = o.best?.filename ? `\`${o.best.filename}\`` : "—";
    const score = o.best ? String(o.best.score) : "—";
    const strat = o.best?.strategy ?? "—";
    const status = o.status === "ADOPTED" ? "✓ ADOPTED" : `○ ${o.status}${o.reason ? ` — ${o.reason}` : ""}`;
    lines.push(`| ${o.iso} | ${o.country} | ${status} | ${fname} | ${score} | ${strat} | ${inspect} |`);
  }
  writeFileSync(REPORT_PATH, lines.join("\n") + "\n");
  console.log(`\nReport written to ${REPORT_PATH}`);
  console.log(`\nNext step: open the report, click each ADOPTED row's "Commons" link to verify the image is genuinely a passport cover. Approved isos can then be deleted from COLLAGE_BLOCKED_ISOS in src/lib/passportCovers.ts.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
