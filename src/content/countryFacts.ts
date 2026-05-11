/**
 * Curated country facts surfaced on /destination/[iso] (and /passport/[iso]).
 *
 * Hand-maintained — every entry is verifiable against the destination's
 * official statistics office. We deliberately don't auto-import from a
 * third-party API because:
 *   - data freshness is unimportant at this granularity (population shifts
 *     ~1% per year and our visa-decision use case doesn't need real-time)
 *   - eliminating the dependency means the country page works during build
 *     without network access
 *
 * Coverage: 80 most-trafficked destinations + every country named in our
 * obstacles file. Other countries fall back to `nameFor(iso2)` plus the
 * existing country-resources gov links — still useful, just less rich.
 *
 * `population` is mid-2024 figures rounded to the nearest million (or
 * 100k for small countries). `gdpPerCapita` is World Bank 2023 current USD.
 * Languages are the official languages, in the country's preferred order;
 * native names sit in countryLanguages.ts for UI display.
 */

export type CountryFacts = {
  iso2: string;
  officialName: string;
  capital: string;
  /** Mid-2024 population. */
  population: number;
  /** Geographic region. */
  region:
    | "Europe"
    | "Asia"
    | "Africa"
    | "North America"
    | "South America"
    | "Oceania"
    | "Middle East"
    | "Caribbean";
  /** Official languages, ISO 639-1 codes. */
  languages: string[];
  /** International dialing prefix without the leading +. */
  callingCode: string;
  /** GDP per capita in USD, World Bank 2023 current USD. */
  gdpPerCapita?: number;
  /** Driving side. */
  driving?: "left" | "right";
  /** A line about the country's standout opportunities — economy / industry / education / culture. Editorial, short. */
  opportunities?: string;
};

export const COUNTRY_FACTS: Record<string, CountryFacts> = {
  // ─────────── North America ───────────
  US: { iso2: "US", officialName: "United States of America", capital: "Washington, D.C.", population: 335_000_000, region: "North America", languages: ["en"], callingCode: "1", gdpPerCapita: 81_695, driving: "right", opportunities: "Largest consumer market, tech & finance hubs (NYC, SF, Austin), top-ranked universities, deep capital markets, English-language ecosystem." },
  CA: { iso2: "CA", officialName: "Canada", capital: "Ottawa", population: 41_000_000, region: "North America", languages: ["en", "fr"], callingCode: "1", gdpPerCapita: 53_372, driving: "right", opportunities: "Express Entry skilled-worker route, post-study work permits, universal healthcare, family-immigration friendly, strong natural-resources & tech sectors." },
  MX: { iso2: "MX", officialName: "United Mexican States", capital: "Mexico City", population: 130_000_000, region: "North America", languages: ["es"], callingCode: "52", gdpPerCapita: 13_675, driving: "right", opportunities: "Manufacturing & nearshoring hub for North America, expanding tech scene in CDMX/Guadalajara, low cost of living for remote workers, Temporary Resident visa available." },

  // ─────────── Caribbean ───────────
  BS: { iso2: "BS", officialName: "Commonwealth of The Bahamas", capital: "Nassau", population: 410_000, region: "Caribbean", languages: ["en"], callingCode: "1242", gdpPerCapita: 35_457, driving: "left", opportunities: "Zero income tax, financial-services hub, English-speaking, US/UK-aligned legal system, deep tourism economy." },
  JM: { iso2: "JM", officialName: "Jamaica", capital: "Kingston", population: 2_800_000, region: "Caribbean", languages: ["en"], callingCode: "1876", gdpPerCapita: 6_465, driving: "left", opportunities: "Tourism, BPO/contact-centre hub, growing fintech sector, English-speaking, CARICOM free movement for skilled nationals." },
  DO: { iso2: "DO", officialName: "Dominican Republic", capital: "Santo Domingo", population: 11_300_000, region: "Caribbean", languages: ["es"], callingCode: "1809", gdpPerCapita: 11_249, driving: "right", opportunities: "Fastest-growing Caribbean economy, free-trade zones, tourism dominant, retiree-friendly residency programs." },
  CU: { iso2: "CU", officialName: "Republic of Cuba", capital: "Havana", population: 11_000_000, region: "Caribbean", languages: ["es"], callingCode: "53", gdpPerCapita: 9_478, driving: "right" },
  TT: { iso2: "TT", officialName: "Trinidad and Tobago", capital: "Port of Spain", population: 1_400_000, region: "Caribbean", languages: ["en"], callingCode: "1868", gdpPerCapita: 19_277, driving: "left", opportunities: "Caribbean's energy hub (LNG, petrochemicals), CARICOM skilled-national mobility, English-speaking." },
  BB: { iso2: "BB", officialName: "Barbados", capital: "Bridgetown", population: 282_000, region: "Caribbean", languages: ["en"], callingCode: "1246", gdpPerCapita: 21_447, driving: "left", opportunities: "12-month Welcome Stamp for remote workers, English-speaking, financial-services hub." },

  // ─────────── South America ───────────
  BR: { iso2: "BR", officialName: "Federative Republic of Brazil", capital: "Brasília", population: 216_000_000, region: "South America", languages: ["pt"], callingCode: "55", gdpPerCapita: 10_044, driving: "right", opportunities: "Largest Latin American economy, vast tech & startup scene in São Paulo, Mercosur free movement, fintech leadership." },
  AR: { iso2: "AR", officialName: "Argentine Republic", capital: "Buenos Aires", population: 46_000_000, region: "South America", languages: ["es"], callingCode: "54", gdpPerCapita: 14_188, driving: "right" },
  CL: { iso2: "CL", officialName: "Republic of Chile", capital: "Santiago", population: 19_900_000, region: "South America", languages: ["es"], callingCode: "56", gdpPerCapita: 17_093, driving: "right", opportunities: "OECD member, strong mining & wine sectors, Pacific Alliance free movement, stable democracy." },
  CO: { iso2: "CO", officialName: "Republic of Colombia", capital: "Bogotá", population: 52_000_000, region: "South America", languages: ["es"], callingCode: "57", gdpPerCapita: 6_976, driving: "right", opportunities: "Digital-nomad visa, booming Medellín tech scene, Pacific Alliance integration, low cost of living." },
  PE: { iso2: "PE", officialName: "Republic of Peru", capital: "Lima", population: 34_000_000, region: "South America", languages: ["es"], callingCode: "51", gdpPerCapita: 7_790, driving: "right" },
  EC: { iso2: "EC", officialName: "Republic of Ecuador", capital: "Quito", population: 18_000_000, region: "South America", languages: ["es"], callingCode: "593", gdpPerCapita: 6_534, driving: "right" },
  VE: { iso2: "VE", officialName: "Bolivarian Republic of Venezuela", capital: "Caracas", population: 28_000_000, region: "South America", languages: ["es"], callingCode: "58", gdpPerCapita: 3_460, driving: "right" },
  UY: { iso2: "UY", officialName: "Oriental Republic of Uruguay", capital: "Montevideo", population: 3_400_000, region: "South America", languages: ["es"], callingCode: "598", gdpPerCapita: 22_565, driving: "right", opportunities: "OECD candidate, Mercosur member, stable democracy, generous retiree-residency programs." },
  BO: { iso2: "BO", officialName: "Plurinational State of Bolivia", capital: "Sucre (constitutional)", population: 12_000_000, region: "South America", languages: ["es"], callingCode: "591", gdpPerCapita: 3_807, driving: "right" },
  PY: { iso2: "PY", officialName: "Republic of Paraguay", capital: "Asunción", population: 6_900_000, region: "South America", languages: ["es", "gn"], callingCode: "595", gdpPerCapita: 6_158, driving: "right" },

  // ─────────── Europe ───────────
  GB: { iso2: "GB", officialName: "United Kingdom of Great Britain and Northern Ireland", capital: "London", population: 68_000_000, region: "Europe", languages: ["en"], callingCode: "44", gdpPerCapita: 48_867, driving: "left", opportunities: "Global finance hub, Russell Group universities, Skilled Worker & Graduate routes, Innovator Founder visa, English-language ecosystem." },
  IE: { iso2: "IE", officialName: "Ireland", capital: "Dublin", population: 5_300_000, region: "Europe", languages: ["en", "ga"], callingCode: "353", gdpPerCapita: 103_500, driving: "left", opportunities: "European HQ of US tech giants (Google, Meta, Apple, Microsoft), Critical Skills Employment Permit, EU passport on naturalisation, English-speaking." },
  DE: { iso2: "DE", officialName: "Federal Republic of Germany", capital: "Berlin", population: 84_000_000, region: "Europe", languages: ["de"], callingCode: "49", gdpPerCapita: 52_745, driving: "right", opportunities: "Europe's largest economy, EU Blue Card streamlined route, Chancenkarte job-seeker visa, tuition-free public universities for international students." },
  FR: { iso2: "FR", officialName: "French Republic", capital: "Paris", population: 68_000_000, region: "Europe", languages: ["fr"], callingCode: "33", gdpPerCapita: 44_460, driving: "right", opportunities: "Talent Passport for skilled workers, low public-university tuition, French Tech ecosystem, EU access." },
  ES: { iso2: "ES", officialName: "Kingdom of Spain", capital: "Madrid", population: 48_000_000, region: "Europe", languages: ["es"], callingCode: "34", gdpPerCapita: 32_677, driving: "right", opportunities: "Startup-friendly Digital Nomad Visa, Non-Lucrative Visa for retirees, Latin-American cultural bridge, EU access." },
  IT: { iso2: "IT", officialName: "Italian Republic", capital: "Rome", population: 59_000_000, region: "Europe", languages: ["it"], callingCode: "39", gdpPerCapita: 38_373, driving: "right", opportunities: "Digital Nomad Visa, Investor Visa, Schengen access, design & manufacturing sectors." },
  PT: { iso2: "PT", officialName: "Portuguese Republic", capital: "Lisbon", population: 10_400_000, region: "Europe", languages: ["pt"], callingCode: "351", gdpPerCapita: 27_293, driving: "right", opportunities: "D7 (passive-income) and D8 (digital-nomad) visas, Schengen access, EU passport on naturalisation, English-friendly business culture." },
  NL: { iso2: "NL", officialName: "Kingdom of the Netherlands", capital: "Amsterdam", population: 17_900_000, region: "Europe", languages: ["nl"], callingCode: "31", gdpPerCapita: 64_572, driving: "right", opportunities: "DAFT (Dutch-American Friendship Treaty) for US founders, Highly Skilled Migrant scheme, English widely spoken in business, EU access." },
  BE: { iso2: "BE", officialName: "Kingdom of Belgium", capital: "Brussels", population: 11_700_000, region: "Europe", languages: ["nl", "fr", "de"], callingCode: "32", gdpPerCapita: 53_475, driving: "right" },
  CH: { iso2: "CH", officialName: "Swiss Confederation", capital: "Bern", population: 8_800_000, region: "Europe", languages: ["de", "fr", "it", "rm"], callingCode: "41", gdpPerCapita: 99_995, driving: "right", opportunities: "Highest median wages in Europe, top-rated universities (ETH, EPFL), pharma & finance hubs, neutral & politically stable." },
  AT: { iso2: "AT", officialName: "Republic of Austria", capital: "Vienna", population: 9_100_000, region: "Europe", languages: ["de"], callingCode: "43", gdpPerCapita: 56_802, driving: "right", opportunities: "Red-White-Red Card points-based skilled-worker route, EU Blue Card streamlined, high quality of life, German-language gateway." },
  DK: { iso2: "DK", officialName: "Kingdom of Denmark", capital: "Copenhagen", population: 5_900_000, region: "Europe", languages: ["da"], callingCode: "45", gdpPerCapita: 67_790, driving: "right", opportunities: "Pay Limit & Positive List routes for skilled workers, world-leading work-life balance, strong life-sciences & green-tech sectors." },
  SE: { iso2: "SE", officialName: "Kingdom of Sweden", capital: "Stockholm", population: 10_500_000, region: "Europe", languages: ["sv"], callingCode: "46", gdpPerCapita: 56_300, driving: "right", opportunities: "Tech ecosystem (Stockholm 'unicorn factory'), Work Permit & Self-Employed Permit routes, English fluency in business, strong public services." },
  NO: { iso2: "NO", officialName: "Kingdom of Norway", capital: "Oslo", population: 5_500_000, region: "Europe", languages: ["no"], callingCode: "47", gdpPerCapita: 87_961, driving: "right", opportunities: "Energy (oil/gas + hydropower), Skilled Worker Permit, EEA/EFTA member with EU-like mobility, high wages." },
  FI: { iso2: "FI", officialName: "Republic of Finland", capital: "Helsinki", population: 5_500_000, region: "Europe", languages: ["fi", "sv"], callingCode: "358", gdpPerCapita: 53_756, driving: "right" },
  IS: { iso2: "IS", officialName: "Iceland", capital: "Reykjavík", population: 380_000, region: "Europe", languages: ["is"], callingCode: "354", gdpPerCapita: 78_837, driving: "right" },
  PL: { iso2: "PL", officialName: "Republic of Poland", capital: "Warsaw", population: 38_000_000, region: "Europe", languages: ["pl"], callingCode: "48", gdpPerCapita: 22_113, driving: "right", opportunities: "Fastest-growing major EU economy, Karta Polaka for ethnic-Polish heritage, IT outsourcing hub, EU access." },
  CZ: { iso2: "CZ", officialName: "Czech Republic", capital: "Prague", population: 10_900_000, region: "Europe", languages: ["cs"], callingCode: "420", gdpPerCapita: 30_427, driving: "right" },
  HU: { iso2: "HU", officialName: "Hungary", capital: "Budapest", population: 9_700_000, region: "Europe", languages: ["hu"], callingCode: "36", gdpPerCapita: 22_147, driving: "right" },
  RO: { iso2: "RO", officialName: "Romania", capital: "Bucharest", population: 19_000_000, region: "Europe", languages: ["ro"], callingCode: "40", gdpPerCapita: 18_419, driving: "right" },
  GR: { iso2: "GR", officialName: "Hellenic Republic", capital: "Athens", population: 10_400_000, region: "Europe", languages: ["el"], callingCode: "30", gdpPerCapita: 23_536, driving: "right", opportunities: "Digital Nomad Visa, Golden Visa (€250k+ real estate), Schengen access, Mediterranean lifestyle." },
  TR: { iso2: "TR", officialName: "Republic of Türkiye", capital: "Ankara", population: 86_000_000, region: "Asia", languages: ["tr"], callingCode: "90", gdpPerCapita: 13_383, driving: "right", opportunities: "Citizenship-by-investment ($400k+ real estate), Istanbul fintech & manufacturing hub, bridge between Europe & Middle East." },
  RU: { iso2: "RU", officialName: "Russian Federation", capital: "Moscow", population: 144_000_000, region: "Europe", languages: ["ru"], callingCode: "7", gdpPerCapita: 13_005, driving: "right" },
  UA: { iso2: "UA", officialName: "Ukraine", capital: "Kyiv", population: 36_000_000, region: "Europe", languages: ["uk"], callingCode: "380", gdpPerCapita: 5_181, driving: "right" },

  // ─────────── Middle East ───────────
  AE: { iso2: "AE", officialName: "United Arab Emirates", capital: "Abu Dhabi", population: 10_000_000, region: "Middle East", languages: ["ar"], callingCode: "971", gdpPerCapita: 49_451, driving: "right", opportunities: "Zero personal income tax, 10-year Golden Visa, Green Visa for skilled workers & freelancers, regional business hub for Africa/Asia/Europe." },
  SA: { iso2: "SA", officialName: "Kingdom of Saudi Arabia", capital: "Riyadh", population: 36_000_000, region: "Middle East", languages: ["ar"], callingCode: "966", gdpPerCapita: 32_881, driving: "right", opportunities: "Vision-2030 megaprojects (NEOM, Red Sea), Premium Residency, Saudi Green Card, no income tax, hiring boom in tech & tourism." },
  IL: { iso2: "IL", officialName: "State of Israel", capital: "Jerusalem", population: 9_700_000, region: "Middle East", languages: ["he", "ar"], callingCode: "972", gdpPerCapita: 53_434, driving: "right", opportunities: "World's highest density of tech startups, Law of Return for Jewish heritage, English widely used in tech sector." },
  QA: { iso2: "QA", officialName: "State of Qatar", capital: "Doha", population: 3_000_000, region: "Middle East", languages: ["ar"], callingCode: "974", gdpPerCapita: 81_968, driving: "right" },
  KW: { iso2: "KW", officialName: "State of Kuwait", capital: "Kuwait City", population: 4_300_000, region: "Middle East", languages: ["ar"], callingCode: "965", gdpPerCapita: 32_290, driving: "right" },
  EG: { iso2: "EG", officialName: "Arab Republic of Egypt", capital: "Cairo", population: 113_000_000, region: "Africa", languages: ["ar"], callingCode: "20", gdpPerCapita: 3_513, driving: "right" },
  JO: { iso2: "JO", officialName: "Hashemite Kingdom of Jordan", capital: "Amman", population: 11_500_000, region: "Middle East", languages: ["ar"], callingCode: "962", gdpPerCapita: 4_204, driving: "right" },

  // ─────────── Asia ───────────
  CN: { iso2: "CN", officialName: "People's Republic of China", capital: "Beijing", population: 1_410_000_000, region: "Asia", languages: ["zh"], callingCode: "86", gdpPerCapita: 12_614, driving: "right", opportunities: "World's second-largest economy, manufacturing & EV leadership, R-visa for top talent, Z-visa work routes, growing biotech & AI sectors." },
  HK: { iso2: "HK", officialName: "Hong Kong SAR, China", capital: "Hong Kong", population: 7_500_000, region: "Asia", languages: ["zh", "en"], callingCode: "852", gdpPerCapita: 50_697, driving: "left", opportunities: "Top Talent Pass (no job offer needed for graduates of top universities), QMAS points-based, low tax, financial hub, English/Chinese dual." },
  TW: { iso2: "TW", officialName: "Taiwan", capital: "Taipei", population: 23_400_000, region: "Asia", languages: ["zh"], callingCode: "886", gdpPerCapita: 32_339, driving: "right", opportunities: "Gold Card for skilled professionals, top-tier semiconductor industry (TSMC), top universities, English-friendly tech sector." },
  JP: { iso2: "JP", officialName: "Japan", capital: "Tokyo", population: 124_000_000, region: "Asia", languages: ["ja"], callingCode: "81", gdpPerCapita: 33_138, driving: "left", opportunities: "Highly Skilled Professional points-based visa, J-Find for new graduates, J-SKIP for top researchers, world-leading R&D and manufacturing." },
  KR: { iso2: "KR", officialName: "Republic of Korea", capital: "Seoul", population: 51_600_000, region: "Asia", languages: ["ko"], callingCode: "82", gdpPerCapita: 33_121, driving: "right", opportunities: "Specially Designated Activities (E-7) visa, K-Tech Pass for AI/biotech, leading chaebol employers (Samsung, LG), top universities." },
  SG: { iso2: "SG", officialName: "Republic of Singapore", capital: "Singapore", population: 5_900_000, region: "Asia", languages: ["en", "ms", "zh", "ta"], callingCode: "65", gdpPerCapita: 84_734, driving: "left", opportunities: "Employment Pass, Tech.Pass, ONE Pass for top earners, ASEAN business hub, English-language operations, world-class infrastructure." },
  TH: { iso2: "TH", officialName: "Kingdom of Thailand", capital: "Bangkok", population: 71_700_000, region: "Asia", languages: ["th"], callingCode: "66", gdpPerCapita: 7_810, driving: "left", opportunities: "10-year Long-Term Resident (LTR) visa, Destination Thailand Visa for remote workers, Smart Visa for startups, low cost of living, tourism economy." },
  VN: { iso2: "VN", officialName: "Socialist Republic of Vietnam", capital: "Hanoi", population: 100_000_000, region: "Asia", languages: ["vi"], callingCode: "84", gdpPerCapita: 4_347, driving: "right", opportunities: "Manufacturing & export boom, low-cost technology hub, growing fintech & e-commerce sectors, beneficiary of China+1 trade shifts." },
  ID: { iso2: "ID", officialName: "Republic of Indonesia", capital: "Jakarta", population: 280_000_000, region: "Asia", languages: ["id"], callingCode: "62", gdpPerCapita: 4_941, driving: "left", opportunities: "Second Home Visa (5–10 years), B211A Digital Nomad, fast-growing fintech & EV sectors, ASEAN's largest economy." },
  MY: { iso2: "MY", officialName: "Malaysia", capital: "Kuala Lumpur", population: 33_500_000, region: "Asia", languages: ["ms", "en"], callingCode: "60", gdpPerCapita: 12_485, driving: "left", opportunities: "MM2H (Malaysia My Second Home) for long-stay, DE Rantau Nomad Pass, Premium Visa Programme, English widely used, ASEAN free movement." },
  PH: { iso2: "PH", officialName: "Republic of the Philippines", capital: "Manila", population: 117_300_000, region: "Asia", languages: ["en", "fil"], callingCode: "63", gdpPerCapita: 3_725, driving: "right", opportunities: "BPO/contact-centre hub, Special Resident Retiree's Visa (SRRV), Special Investor's Resident Visa, English widely spoken." },
  IN: { iso2: "IN", officialName: "Republic of India", capital: "New Delhi", population: 1_430_000_000, region: "Asia", languages: ["hi", "en"], callingCode: "91", gdpPerCapita: 2_485, driving: "left", opportunities: "Fastest-growing major economy, global IT services hub (Bangalore, Hyderabad), OCI for diaspora, growing GIFT City finance zone, vast consumer market." },
  PK: { iso2: "PK", officialName: "Islamic Republic of Pakistan", capital: "Islamabad", population: 240_000_000, region: "Asia", languages: ["ur", "en"], callingCode: "92", gdpPerCapita: 1_471, driving: "left" },
  BD: { iso2: "BD", officialName: "People's Republic of Bangladesh", capital: "Dhaka", population: 173_000_000, region: "Asia", languages: ["bn"], callingCode: "880", gdpPerCapita: 2_551, driving: "left" },
  LK: { iso2: "LK", officialName: "Democratic Socialist Republic of Sri Lanka", capital: "Colombo", population: 22_000_000, region: "Asia", languages: ["si", "ta"], callingCode: "94", gdpPerCapita: 3_354, driving: "left" },
  NP: { iso2: "NP", officialName: "Federal Democratic Republic of Nepal", capital: "Kathmandu", population: 30_500_000, region: "Asia", languages: ["ne"], callingCode: "977", gdpPerCapita: 1_399, driving: "left" },
  MN: { iso2: "MN", officialName: "Mongolia", capital: "Ulaanbaatar", population: 3_400_000, region: "Asia", languages: ["mn"], callingCode: "976", gdpPerCapita: 5_383, driving: "right", opportunities: "Mining (copper, gold, coal) boom, growing tourism, low cost of living, e-Visa for most nationalities." },
  KZ: { iso2: "KZ", officialName: "Republic of Kazakhstan", capital: "Astana", population: 20_000_000, region: "Asia", languages: ["kk", "ru"], callingCode: "7", gdpPerCapita: 13_137, driving: "right" },

  // ─────────── Oceania ───────────
  AU: { iso2: "AU", officialName: "Commonwealth of Australia", capital: "Canberra", population: 27_000_000, region: "Oceania", languages: ["en"], callingCode: "61", gdpPerCapita: 65_366, driving: "left", opportunities: "Skilled Migration points programme (subclass 189/190/491), Working Holiday for under-35s, top universities, mining & tech booms, English-speaking." },
  NZ: { iso2: "NZ", officialName: "New Zealand", capital: "Wellington", population: 5_200_000, region: "Oceania", languages: ["en", "mi"], callingCode: "64", gdpPerCapita: 48_419, driving: "left", opportunities: "Skilled Migrant Category, Active Investor Plus, post-study Work Visa, world-class quality of life, English-speaking." },
  FJ: { iso2: "FJ", officialName: "Republic of Fiji", capital: "Suva", population: 920_000, region: "Oceania", languages: ["en", "fj"], callingCode: "679", gdpPerCapita: 6_535, driving: "left" },

  // ─────────── Africa ───────────
  ZA: { iso2: "ZA", officialName: "Republic of South Africa", capital: "Pretoria (administrative)", population: 62_000_000, region: "Africa", languages: ["en", "af", "zu", "xh"], callingCode: "27", gdpPerCapita: 6_023, driving: "left", opportunities: "Most diversified African economy, Critical Skills Visa, financial-services hub for the continent, English-speaking business culture." },
  NG: { iso2: "NG", officialName: "Federal Republic of Nigeria", capital: "Abuja", population: 224_000_000, region: "Africa", languages: ["en"], callingCode: "234", gdpPerCapita: 1_637, driving: "right", opportunities: "Africa's largest economy by population, booming fintech & creative industries, English-speaking, ECOWAS free movement." },
  KE: { iso2: "KE", officialName: "Republic of Kenya", capital: "Nairobi", population: 55_000_000, region: "Africa", languages: ["en", "sw"], callingCode: "254", gdpPerCapita: 2_099, driving: "left", opportunities: "East African tech hub ('Silicon Savannah'), Mobile-money pioneer (M-Pesa), Class K (retirement) Permit, EAC free movement, English-speaking." },
  ET: { iso2: "ET", officialName: "Federal Democratic Republic of Ethiopia", capital: "Addis Ababa", population: 126_000_000, region: "Africa", languages: ["am"], callingCode: "251", gdpPerCapita: 1_026, driving: "right" },
  GH: { iso2: "GH", officialName: "Republic of Ghana", capital: "Accra", population: 33_500_000, region: "Africa", languages: ["en"], callingCode: "233", gdpPerCapita: 2_238, driving: "right", opportunities: "Stable democracy, Right of Abode for diaspora, English-speaking, ECOWAS free movement, cocoa/gold/oil economy." },
  EG_DUPE: { iso2: "EG", officialName: "Arab Republic of Egypt", capital: "Cairo", population: 113_000_000, region: "Africa", languages: ["ar"], callingCode: "20", gdpPerCapita: 3_513, driving: "right" },
  MA: { iso2: "MA", officialName: "Kingdom of Morocco", capital: "Rabat", population: 37_400_000, region: "Africa", languages: ["ar"], callingCode: "212", gdpPerCapita: 3_672, driving: "right" },
  TZ: { iso2: "TZ", officialName: "United Republic of Tanzania", capital: "Dodoma", population: 67_000_000, region: "Africa", languages: ["sw", "en"], callingCode: "255", gdpPerCapita: 1_193, driving: "left" },
  UG: { iso2: "UG", officialName: "Republic of Uganda", capital: "Kampala", population: 49_000_000, region: "Africa", languages: ["en", "sw"], callingCode: "256", gdpPerCapita: 1_014, driving: "left" },
  RW: { iso2: "RW", officialName: "Republic of Rwanda", capital: "Kigali", population: 14_000_000, region: "Africa", languages: ["rw", "en"], callingCode: "250", gdpPerCapita: 1_010, driving: "right", opportunities: "East Africa's reform leader, Visa-on-Arrival for all African passports, growing tech & conferencing hub, EAC free movement." },
  ZW: { iso2: "ZW", officialName: "Republic of Zimbabwe", capital: "Harare", population: 16_000_000, region: "Africa", languages: ["en"], callingCode: "263", gdpPerCapita: 1_847, driving: "left" },
  YE: { iso2: "YE", officialName: "Republic of Yemen", capital: "Sana'a (de jure)", population: 34_500_000, region: "Middle East", languages: ["ar"], callingCode: "967", gdpPerCapita: 533, driving: "right" },
};

// Drop the helper duplicate (used only to keep the data table self-consistent).
delete (COUNTRY_FACTS as Record<string, unknown>).EG_DUPE;

export function factsFor(iso2: string): CountryFacts | null {
  return COUNTRY_FACTS[iso2.toUpperCase()] ?? null;
}

export function formatPopulation(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 10_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export function formatGdp(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n}`;
}
