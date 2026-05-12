/**
 * Fetch a hero photo for every country in COUNTRY_LIST from Pexels and save
 * it server-side to public/heroes/{ISO2}.jpg, with a manifest file
 * (public/heroes/manifest.json) recording the photographer and source URL
 * per country.
 *
 *   PEXELS_API_KEY=... npx tsx src/scripts/fetchCountryHeroes.ts
 *
 * Why save them locally?
 *  - No runtime API hit. Image renders immediately, even if Pexels is down.
 *  - No 200 req/hr rate limit at request time (only at fetch time).
 *  - We control caching headers and can serve from the CDN edge.
 *  - Image survives if a photographer takes down their photo.
 *
 * Failure modes are deliberately soft. If a single country errors, the
 * script logs and continues. Re-running is idempotent: existing entries
 * in the manifest are skipped unless --force is passed.
 *
 * Cadence: run on initial setup, then once a quarter to refresh.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { COUNTRY_LIST, nameFor } from "../lib/countries";

const HEROES_DIR = path.resolve(process.cwd(), "public/heroes");
const MANIFEST_PATH = path.resolve(HEROES_DIR, "manifest.json");
const FORCE = process.argv.includes("--force");

// Same overrides as src/lib/pexels.ts, kept here so the script doesn't
// depend on the runtime module. Plain country-name searches are noisy;
// these hand-picked phrases surface the most recognisable visual.
const QUERY_OVERRIDES: Record<string, string> = {
  US: "new york skyline blue sky",
  GB: "london sunny day tower bridge",
  FR: "paris eiffel tower sunny",
  IT: "rome colosseum sunny day",
  ES: "barcelona park guell sunny",
  DE: "berlin brandenburg gate sunny",
  JP: "tokyo cherry blossom skyline",
  CN: "great wall of china sunny",
  IN: "taj mahal blue sky",
  AU: "sydney opera house harbour sunny",
  CA: "vancouver mountains sunny",
  BR: "rio de janeiro christ redeemer sunny",
  AE: "dubai skyline",
  TH: "thailand temple",
  SG: "singapore skyline",
  KR: "seoul cityscape",
  RU: "moscow red square",
  MX: "mexico city architecture",
  AR: "patagonia landscape",
  ZA: "cape town table mountain",
  EG: "pyramids of giza",
  GR: "santorini greece",
  TR: "istanbul",
  NL: "amsterdam canals",
  CH: "swiss alps",
  NO: "norwegian fjord",
  IS: "iceland landscape",
  NZ: "new zealand landscape",
  PT: "portugal coast",
  IE: "ireland coast",
  MA: "morocco marrakech",
  PE: "machu picchu",
  KE: "kenya safari",
  TZ: "serengeti",
  ID: "bali landscape",
  VN: "vietnam landscape",
  MY: "kuala lumpur skyline",
  PH: "philippines beach",
  CU: "havana cuba",
  CO: "colombia mountains",
  CL: "chile patagonia",
  CR: "costa rica jungle",
  EC: "ecuador andes",
  BO: "bolivia salt flats",
  UY: "uruguay coast",
  VE: "venezuela mountains",
  PA: "panama city",
  GT: "guatemala temple",
  DO: "dominican republic beach",
  JM: "jamaica beach",
  TT: "trinidad caribbean",
  BS: "bahamas beach",
  HT: "haiti landscape",
  NG: "lagos nigeria",
  GH: "ghana coast",
  SN: "senegal landscape",
  CI: "ivory coast landscape",
  ET: "ethiopia mountains",
  UG: "uganda landscape",
  RW: "rwanda landscape",
  ZW: "zimbabwe victoria falls",
  ZM: "zambia victoria falls",
  BW: "botswana savanna",
  NA: "namibia desert",
  MG: "madagascar landscape",
  MU: "mauritius beach",
  SC: "seychelles beach",
  IL: "jerusalem",
  JO: "petra jordan",
  LB: "beirut lebanon",
  SY: "damascus syria",
  IQ: "iraq landscape",
  IR: "iran isfahan",
  SA: "saudi arabia desert",
  QA: "doha qatar",
  KW: "kuwait city",
  OM: "oman mountains",
  YE: "yemen architecture",
  AF: "afghanistan mountains",
  PK: "pakistan mountains",
  BD: "bangladesh river",
  NP: "nepal himalaya",
  BT: "bhutan monastery",
  MV: "maldives beach",
  LK: "sri lanka beach",
  MM: "myanmar temple",
  KH: "cambodia angkor wat",
  LA: "laos temple",
  MN: "mongolia steppe",
  KZ: "kazakhstan steppe",
  UZ: "uzbekistan samarkand",
  KG: "kyrgyzstan mountains",
  TJ: "tajikistan mountains",
  TM: "turkmenistan desert",
  AZ: "baku azerbaijan",
  GE: "tbilisi georgia",
  AM: "armenia mountains",
  UA: "kyiv ukraine",
  BY: "minsk belarus",
  MD: "moldova landscape",
  PL: "krakow poland",
  CZ: "prague czech",
  SK: "slovakia mountains",
  HU: "budapest hungary",
  RO: "romania transylvania",
  BG: "sofia bulgaria",
  RS: "belgrade serbia",
  HR: "croatia coast",
  SI: "slovenia lake",
  BA: "sarajevo bosnia",
  ME: "montenegro coast",
  AL: "albania coast",
  MK: "macedonia lake",
  XK: "kosovo landscape",
  CY: "cyprus coast",
  MT: "malta coast",
  AT: "vienna austria",
  BE: "brussels belgium",
  LU: "luxembourg castle",
  DK: "copenhagen denmark",
  SE: "stockholm sweden",
  FI: "finland lake",
  EE: "tallinn estonia",
  LV: "riga latvia",
  LT: "vilnius lithuania",
  MZ: "mozambique beach",
  AO: "angola landscape",
  TD: "chad landscape",
  ML: "mali landscape",
  NE: "niger landscape",
  BF: "burkina faso landscape",
  SD: "sudan landscape",
  SS: "south sudan landscape",
  ER: "eritrea landscape",
  SO: "somalia coast",
  DJ: "djibouti landscape",
  LR: "liberia coast",
  SL: "sierra leone coast",
  GN: "guinea landscape",
  GM: "gambia coast",
  GW: "guinea bissau landscape",
  CV: "cape verde beach",
  ST: "sao tome beach",
  GQ: "equatorial guinea jungle",
  GA: "gabon jungle",
  CG: "congo river",
  CD: "drc jungle",
  CM: "cameroon landscape",
  CF: "central african republic landscape",
  BJ: "benin landscape",
  TG: "togo landscape",
  LY: "libya desert",
  TN: "tunisia coast",
  DZ: "algeria desert",
  EH: "western sahara desert",
  KM: "comoros beach",
  SZ: "eswatini landscape",
  LS: "lesotho mountains",
  MW: "malawi lake",
  BI: "burundi lake",
  PG: "papua new guinea jungle",
  FJ: "fiji beach",
  SB: "solomon islands beach",
  VU: "vanuatu beach",
  WS: "samoa beach",
  TO: "tonga beach",
  KI: "kiribati beach",
  TV: "tuvalu beach",
  NR: "nauru beach",
  MH: "marshall islands beach",
  FM: "micronesia beach",
  PW: "palau beach",
  CK: "cook islands beach",
  NU: "niue beach",
  // catch-alls for the remaining countries are handled by the default
  // "<name> landscape" search at runtime.
};

type PexelsPhoto = {
  id: number;
  url: string;
  alt: string | null;
  photographer: string;
  photographer_url: string;
  src: { landscape: string; large: string; large2x: string; medium: string; original: string };
};

type Manifest = Record<
  string,
  {
    file: string; // path relative to /public, e.g. "/heroes/jp.jpg"
    pexelsId: number;
    photographer: string;
    photographerUrl: string;
    pexelsUrl: string;
    alt: string;
    fetchedAt: string;
  }
>;

function queryFor(iso2: string): string {
  return QUERY_OVERRIDES[iso2] ?? `${nameFor(iso2)} landscape`;
}

function loadManifest(): Manifest {
  if (!existsSync(MANIFEST_PATH)) return {};
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
  } catch {
    return {};
  }
}

function saveManifest(m: Manifest) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2));
}

async function fetchOne(iso2: string, apiKey: string): Promise<PexelsPhoto | null> {
  const query = queryFor(iso2);
  // Pulls the first 15 landscape "large" Pexels matches and picks the one
  // with the highest "brightness" — Pexels exposes `avg_color` per photo,
  // a 6-digit hex of the average pixel. We compute its perceived luma and
  // skip results that are too dark / too monochrome.
  // Bias: prefers vibrant well-lit travel shots over moody silhouettes,
  // which was the GB/AU complaint.
  const url =
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
    `&per_page=15&orientation=landscape&size=large`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) {
    console.warn(`  Pexels ${res.status} for ${iso2} (${query})`);
    return null;
  }
  const data = (await res.json()) as { photos: (PexelsPhoto & { avg_color?: string })[] };
  if (data.photos.length === 0) return null;

  // Perceived luma (Rec. 709): 0.2126*R + 0.7152*G + 0.0722*B. Scale 0–255.
  // Anything below 90 reads as "dark / depressing" in this UI; anything
  // very-low-saturation hex (#xxxxxx with low colour spread) is bleak.
  function luma(hex: string | undefined): number {
    if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return 128; // unknown → neutral
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function saturation(hex: string | undefined): number {
    if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return 0.5;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max === 0 ? 0 : (max - min) / max;
  }

  // Score = luma + 30·saturation. Reward brightness AND colour spread.
  const scored = data.photos
    .map((p) => ({
      photo: p,
      score: luma(p.avg_color) + 30 * saturation(p.avg_color),
    }))
    .sort((a, b) => b.score - a.score);

  // Drop pitch-black results entirely (luma < 60). If all are dark, fall
  // back to the highest-scoring one anyway so we don't return null.
  const bright = scored.filter((s) => luma(s.photo.avg_color) >= 90);
  return (bright[0] ?? scored[0]).photo;
}

async function downloadImage(imageUrl: string, dest: string): Promise<void> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

async function main() {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.error("PEXELS_API_KEY is required");
    process.exit(1);
  }

  if (!existsSync(HEROES_DIR)) mkdirSync(HEROES_DIR, { recursive: true });
  const manifest = loadManifest();

  // Pexels free tier: 200 req/hr. We pace at one request per 220ms (~16
  // requests per second is well within the per-second limit; the hourly
  // cap is the constraint). For 250 countries that's ~55s of API calls
  // plus image-download time.
  const PACE_MS = 220;
  const all = COUNTRY_LIST.map((c) => c.iso2);
  const todo = FORCE ? all : all.filter((iso) => !manifest[iso]);

  console.log(`Fetching ${todo.length} country heroes (${manifest && Object.keys(manifest).length} already cached)…`);

  let ok = 0;
  let skipped = 0;
  for (const iso2 of todo) {
    try {
      const photo = await fetchOne(iso2, apiKey);
      if (!photo) {
        skipped++;
        console.log(`  - ${iso2} no results`);
        await new Promise((r) => setTimeout(r, PACE_MS));
        continue;
      }
      const imageUrl = photo.src.landscape ?? photo.src.large;
      const dest = path.resolve(HEROES_DIR, `${iso2.toLowerCase()}.jpg`);
      await downloadImage(imageUrl, dest);

      manifest[iso2] = {
        file: `/heroes/${iso2.toLowerCase()}.jpg`,
        pexelsId: photo.id,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        pexelsUrl: photo.url,
        alt: photo.alt ?? `${nameFor(iso2)} — photo by ${photo.photographer} on Pexels`,
        fetchedAt: new Date().toISOString(),
      };
      ok++;
      if (ok % 20 === 0) saveManifest(manifest);
      console.log(`  ✓ ${iso2}  ${photo.photographer}`);
    } catch (err) {
      skipped++;
      console.warn(`  ✗ ${iso2}  ${(err as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, PACE_MS));
  }

  saveManifest(manifest);
  console.log(`\nDone. ${ok} fetched, ${skipped} skipped. Manifest at ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
