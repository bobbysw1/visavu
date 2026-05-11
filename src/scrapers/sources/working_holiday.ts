/**
 * Working Holiday Visa adapter — bilateral matrix.
 *
 * The Working Holiday scheme is one of the most searched visa categories on
 * Earth: 18-30/35 year olds funding short stints abroad with casual work. It
 * runs entirely on bilateral agreements between specific country pairs, so
 * the right shape is a hand-curated lookup table per destination program.
 *
 * Destinations covered here: Australia (subclass 417 + 462), New Zealand,
 * United Kingdom (Youth Mobility Scheme), Canada (International Experience
 * Canada), Japan, Republic of Korea, Republic of Ireland.
 *
 * Emitted as purpose="work" because the whole point of a WHV is that it lets
 * you work — but the discriminating label "Working Holiday — ..." surfaces
 * the special nature on result cards.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

type WhProgram = {
  /** Destination ISO2 code. */
  destinationIso2: string;
  /** Internal program identifier. */
  id: string;
  /** Human-facing label, e.g. "Working Holiday — Australia (Subclass 417)". */
  label: string;
  /** Default age range — passport-specific overrides come from `eligible`. */
  defaultAgeMin: number;
  defaultAgeMax: number;
  /** Default stay duration in days. */
  defaultStayDays: number;
  /** Fee. amountMinor is in the lowest unit of the currency. */
  feeAmountMinor: number;
  feeCurrency: string;
  applicationUrl: string;
  primarySourceUrl: string;
  /** Per-passport overrides + ISO2 list of eligible passports. */
  eligible: Record<string, { ageMax?: number; stayDays?: number; notes?: string }>;
};

const COMMON_REQUIREMENTS = [
  "Sufficient funds for the duration of stay (typically AU$5,000–NZ$4,200 / £2,530 / CA$2,500 equivalent)",
  "Outbound or return ticket OR sufficient funds to purchase one",
  "Health & character requirements (clean criminal record)",
  "Travel insurance for the full duration",
  "Single application — most programs are once-in-a-lifetime per country",
];

const PROGRAMS: WhProgram[] = [
  // ---------- Australia: Subclass 417 (First Working Holiday Visa) ----------
  {
    destinationIso2: "AU",
    id: "au_wh_417",
    label: "Working Holiday — Australia (Subclass 417)",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 65000,
    feeCurrency: "AUD",
    applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417",
    primarySourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417",
    eligible: {
      BE: {}, CA: { ageMax: 35 }, CY: {}, DK: {}, EE: {}, FI: {}, FR: { ageMax: 35 },
      DE: {}, HK: {}, IE: { ageMax: 35 }, IT: { ageMax: 35 }, JP: {}, KR: {}, MT: {},
      NL: {}, NO: {}, SE: {}, TW: {}, GB: { ageMax: 35 },
    },
  },
  // ---------- Australia: Subclass 462 (Work and Holiday Visa) ----------
  {
    destinationIso2: "AU",
    id: "au_wh_462",
    label: "Work and Holiday — Australia (Subclass 462)",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 65000,
    feeCurrency: "AUD",
    applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462",
    primarySourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462",
    eligible: {
      AR: {}, AT: {}, BR: {}, CL: {}, CN: { notes: "Annual cap; tertiary qualification required." },
      CZ: {}, EC: {}, GR: {}, HU: {}, ID: {}, IL: {}, LU: {}, MY: {}, MN: {}, PG: {},
      PE: {}, PL: {}, PT: {}, SM: {}, SG: {}, SK: {}, SI: {}, ES: { ageMax: 35 },
      CH: {}, TH: {}, TR: {}, US: {}, UY: {}, VN: {},
    },
  },
  // ---------- New Zealand WHV ----------
  {
    destinationIso2: "NZ",
    id: "nz_wh",
    label: "Working Holiday — New Zealand",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 42000,
    feeCurrency: "NZD",
    applicationUrl: "https://www.immigration.govt.nz/new-zealand-visas/options/work/thinking-about-coming-to-new-zealand-to-work/working-holiday-visa",
    primarySourceUrl: "https://www.immigration.govt.nz/new-zealand-visas/options/work/thinking-about-coming-to-new-zealand-to-work/working-holiday-visa",
    eligible: {
      AR: {}, BE: {}, BR: {}, CA: { ageMax: 35 }, CL: {}, HR: {}, CZ: { ageMax: 35 }, DK: {},
      EE: {}, FI: { ageMax: 35 }, FR: {}, DE: {}, HK: {}, HU: { ageMax: 35 }, IE: {}, IL: {},
      IT: {}, JP: {}, KR: {}, LV: {}, MY: {}, MT: {}, MX: {}, NL: {}, NO: {}, PE: {},
      PH: {}, PL: {}, PT: {}, SG: {}, SK: { ageMax: 35 }, SI: {}, ES: {}, SE: {}, CH: {},
      TW: {}, TH: {}, TR: {}, GB: { ageMax: 35, stayDays: 690, notes: "UK passport holders get 23-month stay (extended from 12) since 2023." },
      UY: {}, US: {}, VN: {},
    },
  },
  // ---------- United Kingdom: Youth Mobility Scheme (Tier 5) ----------
  {
    destinationIso2: "GB",
    id: "gb_yms",
    label: "Youth Mobility Scheme — United Kingdom",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 730,
    feeAmountMinor: 29800,
    feeCurrency: "GBP",
    applicationUrl: "https://www.gov.uk/youth-mobility",
    primarySourceUrl: "https://www.gov.uk/youth-mobility",
    eligible: {
      AU: { ageMax: 35, stayDays: 1095, notes: "Australian, Canadian, New Zealander applicants get 36-month stay (vs. 24)." },
      CA: { ageMax: 35, stayDays: 1095 },
      NZ: { ageMax: 35, stayDays: 1095 },
      IS: {},
      JP: {},
      MC: {},
      SM: {},
      HK: {},
      KR: {},
      TW: {},
      AD: {},
      UY: {},
      IN: { notes: "India scheme uses an annual ballot — apply when allocations open." },
    },
  },
  // ---------- Canada: International Experience Canada (IEC) ----------
  {
    destinationIso2: "CA",
    id: "ca_iec",
    label: "International Experience Canada (Working Holiday)",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 27200,
    feeCurrency: "CAD",
    applicationUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html",
    primarySourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html",
    eligible: {
      AU: { ageMax: 35, stayDays: 730 }, AT: { ageMax: 35 }, BE: { ageMax: 30 },
      CL: { ageMax: 35 }, CR: { ageMax: 35 }, HR: { ageMax: 35 }, CZ: { ageMax: 35 },
      DK: {}, EE: { ageMax: 35 }, FR: { ageMax: 35, stayDays: 730 }, DE: { ageMax: 35, stayDays: 730 },
      GR: { ageMax: 35 }, HK: { ageMax: 30 }, HU: { ageMax: 35 }, IS: { ageMax: 35 },
      IE: { ageMax: 35, stayDays: 730 }, IT: { ageMax: 35 }, JP: { ageMax: 30, stayDays: 365 },
      KR: { ageMax: 30 }, LV: { ageMax: 35 }, LT: { ageMax: 35 }, LU: { ageMax: 30 },
      MX: { ageMax: 29 }, NL: { ageMax: 30 }, NZ: { ageMax: 35 }, NO: { ageMax: 35 },
      PL: { ageMax: 35 }, PT: { ageMax: 35 }, SM: { ageMax: 35 }, SK: { ageMax: 35 },
      SI: { ageMax: 35 }, ES: { ageMax: 35, stayDays: 365 }, SE: { ageMax: 30 },
      CH: { ageMax: 35 }, TW: { ageMax: 35 }, GB: { ageMax: 35, stayDays: 730 },
    },
  },
  // ---------- Japan WHV (FREE — one of the few free WHV programs) ----------
  {
    destinationIso2: "JP",
    id: "jp_wh",
    label: "Working Holiday — Japan",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 0,
    feeCurrency: "JPY",
    applicationUrl: "https://www.mofa.go.jp/j_info/visit/w_holiday/index.html",
    primarySourceUrl: "https://www.mofa.go.jp/j_info/visit/w_holiday/index.html",
    eligible: {
      AR: {}, AU: {}, AT: {}, CA: {}, CL: {}, CZ: {}, DK: {}, EE: {}, FI: {},
      FR: {}, DE: {}, HK: {}, HU: {}, IS: {}, IE: {}, IT: {}, KR: {}, LV: {},
      LT: {}, LU: {}, MT: {}, NL: {}, NZ: {}, NO: {}, PL: {}, PT: {}, SM: {},
      SK: {}, ES: {}, SE: {}, TW: {}, GB: {}, UY: {},
    },
  },
  // ---------- South Korea WHV ----------
  {
    destinationIso2: "KR",
    id: "kr_wh",
    label: "Working Holiday — Republic of Korea (H-1)",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 6000,
    feeCurrency: "USD",
    applicationUrl: "https://www.visa.go.kr/openPage.do?MENU_ID=10301",
    primarySourceUrl: "https://www.visa.go.kr/openPage.do?MENU_ID=10301",
    eligible: {
      AR: {}, AU: {}, AT: {}, BE: {}, CA: { ageMax: 35 }, CL: {}, CZ: {}, DK: {},
      FI: {}, FR: {}, DE: {}, HK: {}, HU: {}, IL: {}, IE: {}, IT: {}, JP: {},
      NL: {}, NZ: {}, PL: {}, PT: {}, ES: { ageMax: 35 }, SE: {}, TW: {}, GB: {},
    },
  },
  // ---------- Ireland WHV ----------
  {
    destinationIso2: "IE",
    id: "ie_wh",
    label: "Working Holiday — Ireland",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 30000,
    feeCurrency: "EUR",
    applicationUrl: "https://www.dfa.ie/travel/visas/visa-information/working-holiday-authorisation/",
    primarySourceUrl: "https://www.dfa.ie/travel/visas/visa-information/working-holiday-authorisation/",
    eligible: {
      AR: {}, AU: { ageMax: 35 }, CA: { ageMax: 35, stayDays: 730 },
      CL: {}, HK: {}, JP: {}, NZ: {}, KR: {}, TW: {}, US: {},
    },
  },
  // ---------- France WHV ----------
  {
    destinationIso2: "FR",
    id: "fr_wh",
    label: "Vacances-Travail — France",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 9900,
    feeCurrency: "EUR",
    applicationUrl: "https://france-visas.gouv.fr/web/france-visas/working-holidays-program",
    primarySourceUrl: "https://france-visas.gouv.fr/web/france-visas/working-holidays-program",
    eligible: {
      AR: {}, AU: { ageMax: 35 }, BR: {}, CA: { ageMax: 35, stayDays: 730 }, CL: {},
      CO: {}, EC: {}, HK: {}, JP: {}, KR: {}, MX: {}, NZ: {}, PE: {}, TW: {}, UY: {},
    },
  },
  // ---------- Germany WHV ----------
  {
    destinationIso2: "DE",
    id: "de_wh",
    label: "Jugendmobilitätsabkommen — Germany",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 7500,
    feeCurrency: "EUR",
    applicationUrl:
      "https://www.auswaertiges-amt.de/en/visa-service/-/231148",
    primarySourceUrl:
      "https://www.auswaertiges-amt.de/en/visa-service/-/231148",
    eligible: {
      AR: {}, AU: {}, BR: {}, CA: { ageMax: 35 }, CL: {}, HK: {}, IL: {}, JP: {},
      KR: {}, NZ: {}, TW: {}, UY: {},
    },
  },
  // ---------- Spain WHV ----------
  {
    destinationIso2: "ES",
    id: "es_wh",
    label: "Visado de Trabajo y Vacaciones — Spain",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 6000,
    feeCurrency: "EUR",
    applicationUrl:
      "https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Working-Holiday-Visa.aspx",
    primarySourceUrl: "https://www.exteriores.gob.es/Embajadas/",
    eligible: {
      AR: {}, AU: { ageMax: 35 }, CA: { ageMax: 35 }, CL: {}, HK: {}, JP: {}, NZ: {},
      KR: {}, TW: {}, UY: {},
    },
  },
  // ---------- Italy WHV ----------
  {
    destinationIso2: "IT",
    id: "it_wh",
    label: "Vacanze-Lavoro — Italy",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 11600,
    feeCurrency: "EUR",
    applicationUrl: "https://vistoperitalia.esteri.it/",
    primarySourceUrl: "https://vistoperitalia.esteri.it/",
    eligible: {
      AR: {}, AU: { ageMax: 35 }, CA: { ageMax: 35 }, CL: {}, HK: {}, JP: {}, NZ: {},
      KR: {}, TW: {}, UY: {},
    },
  },
  // ---------- Portugal WHV ----------
  {
    destinationIso2: "PT",
    id: "pt_wh",
    label: "Visto Férias-Trabalho — Portugal",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 9000,
    feeCurrency: "EUR",
    applicationUrl: "https://vistos.mne.gov.pt/en/national-visas/general-information",
    primarySourceUrl: "https://vistos.mne.gov.pt/en/national-visas/general-information",
    eligible: {
      AR: {}, AU: { ageMax: 35 }, CA: { ageMax: 35 }, CL: {}, HK: {}, JP: {}, NZ: {},
      KR: {}, TW: {}, UY: {},
    },
  },
  // ---------- Netherlands WHV ----------
  {
    destinationIso2: "NL",
    id: "nl_wh",
    label: "Working Holiday Programme / Working Holiday Scheme — Netherlands",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 24300,
    feeCurrency: "EUR",
    applicationUrl: "https://ind.nl/en/working-holiday-scheme",
    primarySourceUrl: "https://ind.nl/en/working-holiday-scheme",
    eligible: {
      AR: {}, AU: {}, CA: { ageMax: 35 }, HK: {}, JP: {}, NZ: {}, KR: {}, TW: {}, UY: {},
    },
  },
  // ---------- Belgium WHV ----------
  {
    destinationIso2: "BE",
    id: "be_wh",
    label: "Working Holiday Programme — Belgium",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 18000,
    feeCurrency: "EUR",
    applicationUrl: "https://dofi.ibz.be/en/themes/short-stay/working-holiday",
    primarySourceUrl: "https://dofi.ibz.be/en/themes/short-stay/working-holiday",
    eligible: {
      AU: {}, CA: { ageMax: 35 }, CL: {}, JP: {}, NZ: {}, KR: {}, TW: {},
    },
  },
  // ---------- Sweden WHV ----------
  {
    destinationIso2: "SE",
    id: "se_wh",
    label: "Working Holiday Visa — Sweden",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 150000, // SEK 1,500
    feeCurrency: "SEK",
    applicationUrl:
      "https://www.migrationsverket.se/English/Private-individuals/Working-in-Sweden/Working-holiday-visa.html",
    primarySourceUrl:
      "https://www.migrationsverket.se/English/Private-individuals/Working-in-Sweden/Working-holiday-visa.html",
    eligible: {
      AR: {}, AU: {}, CA: { ageMax: 35 }, CL: {}, HK: {}, JP: {}, NZ: {}, KR: {}, TW: {}, UY: {},
    },
  },
  // ---------- Denmark WHV ----------
  {
    destinationIso2: "DK",
    id: "dk_wh",
    label: "Working Holiday Visa — Denmark",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 0,
    feeCurrency: "DKK",
    applicationUrl: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Working-holiday",
    primarySourceUrl: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Working-holiday",
    eligible: {
      AR: {}, AU: {}, CA: { ageMax: 35 }, CL: {}, JP: {}, NZ: {}, KR: {},
    },
  },
  // ---------- Norway WHV ----------
  {
    destinationIso2: "NO",
    id: "no_wh",
    label: "Working Holiday Permit — Norway",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 730,
    feeAmountMinor: 600000, // NOK 6,000
    feeCurrency: "NOK",
    applicationUrl:
      "https://www.udi.no/en/word-definitions/working-holiday-scheme-for-young-people/",
    primarySourceUrl:
      "https://www.udi.no/en/want-to-apply/work-immigration/working-holiday-scheme-for-young-people/",
    eligible: {
      AR: {}, AU: {}, CA: { ageMax: 35 }, JP: {}, NZ: {}, KR: {},
    },
  },
  // ---------- Finland WHV ----------
  {
    destinationIso2: "FI",
    id: "fi_wh",
    label: "Working Holiday Permit — Finland",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 30000,
    feeCurrency: "EUR",
    applicationUrl:
      "https://migri.fi/en/working-holiday",
    primarySourceUrl: "https://migri.fi/en/working-holiday",
    eligible: {
      AR: {}, AU: {}, CA: { ageMax: 35 }, CL: {}, JP: {}, NZ: {}, KR: {}, TW: {}, UY: {},
    },
  },
  // ---------- Switzerland WHV ----------
  {
    destinationIso2: "CH",
    id: "ch_wh",
    label: "Stagiaires Programme / Working Holiday — Switzerland",
    defaultAgeMin: 18,
    defaultAgeMax: 35,
    defaultStayDays: 540,
    feeAmountMinor: 9500,
    feeCurrency: "CHF",
    applicationUrl: "https://www.sem.admin.ch/sem/en/home/themen/arbeit/stagiaires.html",
    primarySourceUrl: "https://www.sem.admin.ch/sem/en/home/themen/arbeit/stagiaires.html",
    eligible: {
      AR: {}, AU: {}, CA: {}, CL: {}, JP: {}, NZ: {}, KR: {}, ZA: {}, TN: {}, UA: {},
    },
  },
  // ---------- Austria WHV ----------
  {
    destinationIso2: "AT",
    id: "at_wh",
    label: "Working Holiday — Austria",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 180,
    feeAmountMinor: 14500,
    feeCurrency: "EUR",
    applicationUrl: "https://www.bmeia.gv.at/en/travel-stay/entrance-and-residence-in-austria/visa",
    primarySourceUrl: "https://www.bmeia.gv.at/en/travel-stay/entrance-and-residence-in-austria/visa",
    eligible: {
      AR: {}, AU: {}, CL: {}, HK: {}, IL: {}, JP: {}, NZ: {}, KR: {}, TW: {},
    },
  },
  // ---------- Iceland WHV ----------
  {
    destinationIso2: "IS",
    id: "is_wh",
    label: "Working Holiday Permit — Iceland",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 1500000, // ISK 15,000
    feeCurrency: "ISK",
    applicationUrl: "https://island.is/en/working-holiday",
    primarySourceUrl: "https://island.is/en/working-holiday",
    eligible: {
      AR: {}, AU: {}, CA: { ageMax: 35 }, CL: {}, JP: {}, NZ: {}, KR: {}, UY: {},
    },
  },
  // ---------- Czech Republic WHV ----------
  {
    destinationIso2: "CZ",
    id: "cz_wh",
    label: "Working Holiday — Czech Republic",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 250000, // CZK 2,500
    feeCurrency: "CZK",
    applicationUrl: "https://www.mzv.gov.cz/jnp/en/information_for_aliens/general_information/working_holiday/",
    primarySourceUrl: "https://www.mzv.gov.cz/jnp/en/information_for_aliens/general_information/working_holiday/",
    eligible: {
      AR: {}, AU: {}, CA: { ageMax: 35 }, CL: {}, IL: {}, JP: {}, NZ: {}, KR: {}, TW: {},
    },
  },
  // ---------- Hungary WHV ----------
  {
    destinationIso2: "HU",
    id: "hu_wh",
    label: "Working Holiday Visa — Hungary",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 11000,
    feeCurrency: "EUR",
    applicationUrl: "https://konzuliszolgalat.kormany.hu/visa-information",
    primarySourceUrl: "https://konzuliszolgalat.kormany.hu/visa-information",
    eligible: {
      AR: {}, AU: {}, CA: { ageMax: 35 }, CL: {}, HK: {}, IL: {}, JP: {}, NZ: {}, KR: {}, TW: {},
    },
  },
  // ---------- Poland WHV ----------
  {
    destinationIso2: "PL",
    id: "pl_wh",
    label: "Working Holiday Visa — Poland",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 6000,
    feeCurrency: "EUR",
    applicationUrl: "https://www.gov.pl/web/diplomacy/visas-and-passports",
    primarySourceUrl: "https://www.gov.pl/web/diplomacy/visas-and-passports",
    eligible: {
      AR: {}, AU: {}, CA: { ageMax: 35 }, CL: {}, IL: {}, JP: {}, NZ: {}, KR: {}, TW: {},
    },
  },
  // ---------- Slovakia WHV ----------
  {
    destinationIso2: "SK",
    id: "sk_wh",
    label: "Working Holiday Visa — Slovakia",
    defaultAgeMin: 18,
    defaultAgeMax: 35,
    defaultStayDays: 365,
    feeAmountMinor: 6000,
    feeCurrency: "EUR",
    applicationUrl: "https://www.mzv.sk/en/web/en/services/visa-information",
    primarySourceUrl: "https://www.mzv.sk/en/web/en/services/visa-information",
    eligible: {
      AR: {}, AU: {}, CA: {}, CL: {}, IL: {}, JP: {}, NZ: {}, KR: {}, TW: {},
    },
  },
  // ---------- Estonia WHV ----------
  {
    destinationIso2: "EE",
    id: "ee_wh",
    label: "Working Holiday Visa — Estonia",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 8000,
    feeCurrency: "EUR",
    applicationUrl: "https://www.politsei.ee/en/instructions/visa-and-extending-period-of-stay/long-term-visa",
    primarySourceUrl: "https://www.politsei.ee/en/instructions/visa-and-extending-period-of-stay/long-term-visa",
    eligible: {
      AR: {}, AU: {}, CA: { ageMax: 35 }, CL: {}, JP: {}, NZ: {}, KR: {},
    },
  },
  // ---------- Singapore Work Holiday Programme ----------
  {
    destinationIso2: "SG",
    id: "sg_wh",
    label: "Work Holiday Programme — Singapore",
    defaultAgeMin: 18,
    defaultAgeMax: 25,
    defaultStayDays: 180,
    feeAmountMinor: 19000, // S$190
    feeCurrency: "SGD",
    applicationUrl:
      "https://www.mom.gov.sg/passes-and-permits/work-holiday-programme",
    primarySourceUrl:
      "https://www.mom.gov.sg/passes-and-permits/work-holiday-programme",
    eligible: {
      AU: { ageMax: 25 }, FR: {}, DE: {}, HK: {}, JP: {}, NZ: {}, KR: {},
      CH: {}, GB: {}, US: {},
    },
  },
  // ---------- Taiwan WHV (incoming) ----------
  {
    destinationIso2: "TW",
    id: "tw_wh",
    label: "Working Holiday Visa — Taiwan",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 6000,
    feeCurrency: "USD",
    applicationUrl: "https://www.boca.gov.tw/np-1-2.html",
    primarySourceUrl: "https://www.boca.gov.tw/np-1-2.html",
    eligible: {
      AU: {}, BE: {}, CA: { ageMax: 35 }, CZ: {}, DE: {}, HU: {}, IE: {},
      JP: {}, NZ: {}, PL: {}, SK: {}, KR: {}, GB: { ageMax: 35 },
    },
  },
  // ---------- Hong Kong WHV (incoming) ----------
  {
    destinationIso2: "HK",
    id: "hk_wh",
    label: "Working Holiday Scheme — Hong Kong",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 23000, // HK$230
    feeCurrency: "HKD",
    applicationUrl: "https://www.immd.gov.hk/eng/services/visas/working_holiday.html",
    primarySourceUrl: "https://www.immd.gov.hk/eng/services/visas/working_holiday.html",
    eligible: {
      AT: {}, AU: {}, CA: { ageMax: 30 }, FR: {}, DE: {}, HU: {}, IE: {}, JP: {},
      NZ: {}, KR: {}, NL: {}, NO: {}, SE: {}, GB: {},
    },
  },
  // ---------- Israel WHV ----------
  {
    destinationIso2: "IL",
    id: "il_wh",
    label: "Working Holiday Visa — Israel",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 17000, // ₪170
    feeCurrency: "ILS",
    applicationUrl:
      "https://www.gov.il/en/departments/general/visa",
    primarySourceUrl:
      "https://www.gov.il/en/departments/general/visa",
    eligible: {
      AR: {}, AU: {}, CZ: {}, DE: {}, HU: {}, NZ: {}, PL: {}, SK: {}, KR: {},
      SE: {}, TW: {}, UY: {},
    },
  },
  // ---------- Argentina WHV ----------
  {
    destinationIso2: "AR",
    id: "ar_wh",
    label: "Visa de Vacaciones y Trabajo — Argentina",
    defaultAgeMin: 18,
    defaultAgeMax: 35,
    defaultStayDays: 365,
    feeAmountMinor: 4500,
    feeCurrency: "USD",
    applicationUrl: "https://www.argentina.gob.ar/interior/migraciones",
    primarySourceUrl: "https://www.argentina.gob.ar/interior/migraciones",
    eligible: {
      AU: {}, AT: {}, CA: {}, CL: {}, CZ: {}, DK: {}, FI: {}, FR: {}, DE: {}, HU: {},
      IS: {}, IL: {}, IT: {}, JP: {}, KR: {}, NL: {}, NZ: {}, NO: {}, PL: {}, PT: {},
      SK: {}, ES: {}, SE: {}, CH: {}, TW: {}, UY: {},
    },
  },
  // ---------- Chile WHV ----------
  {
    destinationIso2: "CL",
    id: "cl_wh",
    label: "Visa Vacaciones y Trabajo — Chile",
    defaultAgeMin: 18,
    defaultAgeMax: 35,
    defaultStayDays: 365,
    feeAmountMinor: 9500,
    feeCurrency: "USD",
    applicationUrl: "https://serviciomigraciones.cl/",
    primarySourceUrl: "https://serviciomigraciones.cl/",
    eligible: {
      AR: {}, AU: {}, AT: {}, BE: {}, CA: {}, CZ: {}, DK: {}, FI: {}, FR: {}, DE: {},
      HU: {}, IS: {}, IT: {}, JP: {}, KR: {}, NL: {}, NZ: {}, NO: {}, PL: {}, PT: {},
      SK: {}, ES: {}, SE: {}, UY: {},
    },
  },
  // ---------- Uruguay WHV ----------
  {
    destinationIso2: "UY",
    id: "uy_wh",
    label: "Visa de Vacaciones y Trabajo — Uruguay",
    defaultAgeMin: 18,
    defaultAgeMax: 30,
    defaultStayDays: 365,
    feeAmountMinor: 4200,
    feeCurrency: "USD",
    applicationUrl: "https://www.gub.uy/ministerio-relaciones-exteriores/",
    primarySourceUrl: "https://www.gub.uy/ministerio-relaciones-exteriores/",
    eligible: {
      AR: {}, AU: {}, CL: {}, FR: {}, DE: {}, HU: {}, IS: {}, IT: {}, JP: {}, KR: {},
      LU: {}, NL: {}, NZ: {}, PT: {}, ES: {}, CH: {}, TW: {},
    },
  },
];

export const workingHolidayAdapter: Adapter = {
  metadata: {
    id: "working_holiday",
    name: "Working Holiday Visa bilateral matrix",
    kind: "manual",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: PROGRAMS.map((p) => p.primarySourceUrl),
    fixturePath: "src/scrapers/sources/__fixtures__/working_holiday.json",
  },

  async fetch(_ctx: FetchContext) {
    // Curated table — the data is hand-encoded above. Returning the fixture
    // shape lets runAdapter persist a SourceRecord for audit purposes.
    return {
      rawText: JSON.stringify({ programs: PROGRAMS.map((p) => p.id), generatedAt: new Date().toISOString() }),
      fetchUrl: "manual://working_holiday",
    };
  },

  async parse() {
    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];

    for (const program of PROGRAMS) {
      if (!validIso.has(program.destinationIso2)) continue;
      for (const [passportIso, override] of Object.entries(program.eligible)) {
        if (!validIso.has(passportIso)) continue;
        if (passportIso === program.destinationIso2) continue;

        const ageMax = override.ageMax ?? program.defaultAgeMax;
        const stayDays = override.stayDays ?? program.defaultStayDays;
        const ageNote = `Eligibility limited to applicants aged ${program.defaultAgeMin}–${ageMax} at the time of application.`;
        const notes = [
          ageNote,
          override.notes,
          "Most working-holiday programs are once-per-lifetime — used carefully.",
        ]
          .filter(Boolean)
          .join(" ");

        records.push({
          passportIso2: passportIso,
          destinationIso2: program.destinationIso2,
          purpose: "work",
          status: "e_visa",
          label: program.label,
          maxStayDays: stayDays,
          validityDays: stayDays,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: true,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          biometricsLocation: null,
          requirements: [
            `Age ${program.defaultAgeMin}–${ageMax} at the time of application`,
            ...COMMON_REQUIREMENTS,
          ],
          processingTimeDaysMin: 7,
          processingTimeDaysMax: 30,
          applicationUrl: program.applicationUrl,
          primarySourceUrl: program.primarySourceUrl,
          fees:
            program.feeAmountMinor > 0
              ? [
                  {
                    kind: "base",
                    amountMinor: program.feeAmountMinor,
                    currency: program.feeCurrency,
                    asOf: "2026-05-10",
                    label: `${program.label} application fee`,
                    optional: false,
                  },
                ]
              : [],
          notes,
        });
      }
    }

    if (records.length < 100) {
      return {
        records,
        parseError: `Only ${records.length} working-holiday records emitted (expected ≥ 200).`,
      };
    }
    return { records };
  },
};
