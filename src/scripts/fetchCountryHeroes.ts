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
// --iso=BZ or --iso=BZ,GT,HN  → only fetch listed countries (re-runs the
// curated query, useful when a single result was wrong).
const ISO_FILTER: Set<string> | null = (() => {
  const arg = process.argv.find((a) => a.startsWith("--iso="));
  if (!arg) return null;
  const list = arg.slice("--iso=".length).split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  return list.length > 0 ? new Set(list) : null;
})();

/**
 * Curated landmark queries — each country mapped to its single most-iconic
 * visual landmark per the editorial brief. These take precedence over the
 * generic "landmark <Country>" fallback in queryFor() below. Each entry
 * was hand-picked to feel like a postcard, not a random Google Image result.
 *
 * Format: short query (2-4 words) that returns a recognisable, well-shot
 * Pexels result. Avoid full sentences — Pexels indexes keywords.
 *
 * Re-run `PEXELS_API_KEY=... npm run fetch:heroes -- --force` after editing
 * this map to regenerate the matching JPEGs in public/heroes/.
 */
const QUERY_OVERRIDES: Record<string, string> = {
  // A
  AF: "Bamiyan Buddha Afghanistan",
  AL: "Berat castle Albania",
  DZ: "Casbah Algiers Algeria",
  AD: "Casa de la Vall Andorra",
  AO: "Fortress São Miguel Luanda",
  AG: "Nelson's Dockyard Antigua",
  AR: "Iguazu Falls Argentina",
  AM: "Mount Ararat Armenia",
  AU: "Sydney Opera House",
  AT: "Schönbrunn Palace Vienna",
  AZ: "Flame Towers Baku",

  // B
  BS: "Pink Sands Bahamas beach",
  BH: "Bahrain Fort Qal'at al-Bahrain",
  BD: "Ahsan Manzil Dhaka",
  BB: "Bridgetown Garrison Barbados",
  BY: "Mir Castle Belarus",
  BE: "Grand Place Brussels",
  // Pexels' "Great Blue Hole" was returning a generic ship's-porthole photo
  // because "hole" is a strong keyword. Anchor on Caribbean reef + Belize-
  // specific terms instead.
  BZ: "Caye Caulker Belize Caribbean beach",
  BJ: "Royal Palaces Abomey Benin",
  BT: "Tiger's Nest Monastery Bhutan",
  BO: "Salar de Uyuni Bolivia",
  BA: "Stari Most Mostar bridge",
  BW: "Okavango Delta Botswana",
  BR: "Christ the Redeemer Rio",
  BN: "Sultan Omar Ali Saifuddien Mosque",
  BG: "Rila Monastery Bulgaria",
  BF: "Ruins of Loropéni",
  BI: "Lake Tanganyika shore",

  // C
  CV: "Cidade Velha Cape Verde",
  KH: "Angkor Wat Cambodia",
  CM: "Mount Cameroon",
  CA: "CN Tower Toronto",
  CF: "Manovo Gounda St Floris",
  TD: "Zakouma National Park Chad",
  CL: "Easter Island Moai",
  CN: "Great Wall of China",
  CO: "Salt Cathedral Zipaquirá Colombia",
  KM: "Mount Karthala Comoros",
  CG: "Odzala Kokoua National Park",
  CD: "Virunga National Park gorillas",
  CR: "Arenal Volcano Costa Rica",
  HR: "Dubrovnik old town Croatia",
  CU: "Old Havana Habana Vieja",
  CY: "Tombs of the Kings Paphos",
  CZ: "Charles Bridge Prague",

  // D
  DK: "Little Mermaid Copenhagen",
  DJ: "Lake Assal Djibouti",
  DM: "Boiling Lake Dominica",
  DO: "Colonial Zone Santo Domingo",

  // E
  EC: "Galápagos Islands Ecuador",
  EG: "Pyramids of Giza Sphinx",
  SV: "Santa Ana Volcano El Salvador",
  GQ: "Pico Basilé Equatorial Guinea",
  ER: "Asmara Eritrea Art Deco",
  EE: "Tallinn old town Estonia",
  SZ: "Mlilwane Eswatini wildlife",
  ET: "Rock Hewn Churches Lalibela",

  // F
  FJ: "Sigatoka sand dunes Fiji",
  FI: "Suomenlinna Fortress Helsinki",
  FR: "Eiffel Tower Paris",

  // G
  GA: "Loango National Park Gabon",
  GM: "Senegambia stone circles",
  GE: "Gergeti Trinity Church Georgia",
  DE: "Brandenburg Gate Berlin",
  GH: "Cape Coast Castle Ghana",
  GR: "Acropolis Parthenon Athens",
  GD: "Underwater sculpture park Grenada",
  GT: "Tikal Mayan ruins Guatemala",
  GN: "Mount Nimba Guinea",
  GW: "Bijagós Archipelago Guinea Bissau",
  GY: "Kaieteur Falls Guyana",

  // H
  HT: "Citadelle Laferrière Haiti",
  HN: "Copán ruins Honduras",
  HU: "Parliament Building Budapest",

  // I
  IS: "Blue Lagoon Iceland",
  IN: "Taj Mahal Agra",
  ID: "Borobudur Temple Indonesia",
  IR: "Persepolis Iran ruins",
  IQ: "Ziggurat of Ur Iraq",
  IE: "Cliffs of Moher Ireland",
  IL: "Western Wall Jerusalem",
  IT: "Colosseum Rome",
  CI: "Basilica Yamoussoukro Ivory Coast",

  // J
  JM: "Dunn's River Falls Jamaica",
  JP: "Mount Fuji Japan",
  JO: "Petra Jordan",

  // K
  KZ: "Bayterek Tower Astana",
  KE: "Maasai Mara Kenya",
  KI: "Phoenix Islands Kiribati",
  XK: "Visoki Dečani Monastery Kosovo",
  KW: "Kuwait Towers",
  KG: "Issyk Kul Lake Kyrgyzstan",

  // L
  LA: "Luang Prabang Wat Xieng Thong",
  LV: "Riga old town Latvia",
  LB: "Baalbek ruins Lebanon",
  LS: "Maletsunyane Falls Lesotho",
  LR: "Sapo National Park Liberia",
  LY: "Leptis Magna Roman ruins",
  LI: "Vaduz Castle Liechtenstein",
  LT: "Hill of Crosses Lithuania",
  LU: "Luxembourg City fortifications",

  // M
  MG: "Avenue of the Baobabs Madagascar",
  MW: "Lake Malawi",
  MY: "Petronas Twin Towers Kuala Lumpur",
  MV: "Maldives coral atoll beach",
  ML: "Great Mosque of Djenné",
  MT: "Valletta Malta",
  MH: "Bikini Atoll Marshall Islands",
  MR: "Banc d'Arguin Mauritania",
  MU: "Le Morne Brabant Mauritius",
  MX: "Chichen Itza Mexico pyramid",
  FM: "Nan Madol Micronesia",
  MD: "Cricova Winery Moldova",
  MC: "Monte Carlo Casino Monaco",
  MN: "Genghis Khan statue Mongolia",
  ME: "Bay of Kotor Montenegro",
  MA: "Medina of Marrakech Morocco",
  MZ: "Island of Mozambique",
  MM: "Shwedagon Pagoda Myanmar",

  // N
  NA: "Sossusvlei dunes Namibia",
  NR: "Anibare Bay Nauru",
  NP: "Mount Everest Nepal",
  NL: "Amsterdam canal ring",
  NZ: "Milford Sound Fiordland New Zealand",
  NI: "Granada colonial city Nicaragua",
  NE: "Aïr and Ténéré Niger",
  NG: "Zuma Rock Nigeria",
  KP: "Juche Tower Pyongyang",
  MK: "Ohrid Lake North Macedonia",
  NO: "Geiranger Fjord Norway",

  // O
  OM: "Sultan Qaboos Grand Mosque Oman",

  // P
  PK: "Badshahi Mosque Lahore",
  PW: "Rock Islands Palau",
  PS: "Dome of the Rock Jerusalem",
  PA: "Panama Canal",
  PG: "Kokoda Track Papua New Guinea",
  PY: "Itaipu Dam Paraguay",
  PE: "Machu Picchu Peru",
  PH: "Chocolate Hills Bohol Philippines",
  PL: "Wawel Castle Krakow",
  PT: "Belém Tower Lisbon",

  // Q
  QA: "Museum of Islamic Art Doha",

  // R
  RO: "Bran Castle Romania Dracula",
  RU: "Red Square St Basil's Moscow",
  RW: "Volcanoes National Park gorillas Rwanda",

  // S
  KN: "Brimstone Hill Fortress Saint Kitts",
  LC: "Pitons Saint Lucia",
  VC: "La Soufrière volcano Saint Vincent",
  WS: "To Sua Ocean Trench Samoa",
  SM: "Guaita Tower Mount Titano San Marino",
  ST: "Pico Cão Grande São Tomé",
  SA: "Great Mosque Mecca Kaaba",
  SN: "Lac Rose Pink Lake Senegal",
  RS: "Belgrade Fortress Serbia",
  SC: "Anse Source d'Argent Seychelles",
  SL: "Tacugama Chimpanzee Sanctuary",
  SG: "Marina Bay Sands Singapore",
  SK: "Bratislava Castle Slovakia",
  SI: "Lake Bled Slovenia",
  SB: "Marovo Lagoon Solomon Islands",
  SO: "Laas Geel cave paintings Somalia",
  ZA: "Table Mountain Cape Town",
  KR: "Gyeongbokgung Palace Seoul",
  SS: "Boma National Park South Sudan",
  ES: "Sagrada Família Barcelona",
  LK: "Sigiriya rock fortress Sri Lanka",
  SD: "Pyramids of Meroë Sudan",
  SR: "Central Suriname Nature Reserve",
  SE: "Gamla Stan Stockholm",
  CH: "Matterhorn Switzerland",
  SY: "Krak des Chevaliers Syria",

  // T
  TW: "Taipei 101 Taiwan",
  TJ: "Pamir Mountains Tajikistan",
  TZ: "Mount Kilimanjaro Tanzania",
  TH: "Grand Palace Wat Arun Bangkok",
  TL: "Cristo Rei Dili Timor Leste",
  TG: "Koutammakou landscape Togo",
  TO: "Haʻamonga a Maui trilithon Tonga",
  TT: "Pitch Lake Trinidad",
  TN: "El Djem Amphitheatre Tunisia",
  TR: "Hagia Sophia Istanbul",
  TM: "Darvaza gas crater Turkmenistan",
  TV: "Funafuti Atoll Tuvalu",

  // U
  UG: "Bwindi Impenetrable Forest gorillas Uganda",
  UA: "St Sophia's Cathedral Kyiv",
  AE: "Burj Khalifa Dubai",
  GB: "Big Ben London",
  US: "Statue of Liberty New York",
  UY: "Colonia del Sacramento Uruguay",
  UZ: "Registan Square Samarkand",

  // V
  VU: "Mount Yasur volcano Vanuatu",
  VA: "St Peter's Basilica Vatican",
  VE: "Angel Falls Venezuela",
  VN: "Ha Long Bay Vietnam",

  // Y
  YE: "Old Sana'a Yemen",

  // Z
  ZM: "Victoria Falls Zambia",
  ZW: "Great Zimbabwe Ruins",
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
  // Curated landmark query takes precedence — the QUERY_OVERRIDES map is
  // the editorial source of truth ("Sydney Opera House" for AU, "Petra
  // Jordan" for JO, etc.). Falls back to "landmark <Country>" for any
  // ISO2 not in the curated list (small territories, micro-states).
  const override = QUERY_OVERRIDES[iso2.toUpperCase()];
  if (override) return override;
  const name = nameFor(iso2);
  return `landmark ${name}`;
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
  let todo = FORCE ? all : all.filter((iso) => !manifest[iso]);
  if (ISO_FILTER) {
    todo = all.filter((iso) => ISO_FILTER.has(iso));
    console.log(`--iso filter active: refetching ${todo.join(", ")}`);
  }

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
