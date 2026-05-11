/**
 * UK Electronic Travel Authorisation (ETA) adapter.
 *
 * Source: https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta
 *
 * Phased rollout from late 2023; expanded to cover most non-visa nationals
 * during 2024–2025. ETA is a £10 online authorization that pre-clears
 * visa-free nationalities for short visits (up to 6 months).
 *
 * Emits one `visa_free_with_eta` record per ETA-required nationality, for
 * tourism + business + transit purposes.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta";
const APPLY_URL = SOURCE_URL;

// Nationalities currently rolled-out for the UK ETA scheme (2024–2025 phasing).
// Source: gov.uk staged rollout schedule. Excludes: visa-required nationals
// (a UK visit visa applies, not an ETA), British/Irish citizens (free entry).
const ETA_NATIONALITIES: string[] = [
  // Phase 1 (Nov 2023): Qatar
  "QA",
  // Phase 2 (Feb 2024): Bahrain, Jordan, Kuwait, Oman, Saudi Arabia, UAE
  "BH", "JO", "KW", "OM", "SA", "AE",
  // Phase 3 (Jan 2025): non-EU visa-exempt — US, Canada, Australia, NZ, etc.
  "US", "CA", "AU", "NZ", "JP", "KR", "SG", "TW", "HK", "MO", "MY", "BN",
  "AR", "BR", "CL", "CO", "CR", "GT", "MX", "PA", "PY", "PE", "UY", "VE",
  "AD", "MC", "SM", "VA", "AG", "BS", "BB", "BZ", "DM", "GD", "GY", "JM",
  "KN", "LC", "VC", "TT", "MV", "MU", "SC", "BW", "NA", "ZA", "FJ", "KI",
  "MH", "FM", "NR", "PW", "PG", "WS", "SB", "TO", "TV", "VU", "IL", "AL",
  "BA", "ME", "MK", "MD", "RS", "GE", "UA",
  // Phase 4 (Apr 2025): EU/EEA + Switzerland — same ETA scheme.
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT",
  "RO", "SK", "SI", "ES", "SE", "CH",
];

export const ukEtaAdapter: Adapter = {
  metadata: {
    id: "uk_eta",
    name: "UK Electronic Travel Authorisation (ETA)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/uk_eta.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const today = new Date().toISOString().slice(0, 10);
    const main = $("main, #content, body").text().replace(/\s+/g, " ");

    if (!/(electronic\s+travel\s+authorisation|\beta\b)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected UK ETA wording." };
    }

    // ETA fee — currently £16 (raised from £10 in April 2025).
    const feeMatches = [...main.matchAll(/£\s?(\d{1,3})/g)]
      .map((m) => parseInt(m[1], 10))
      .filter((n) => n >= 5 && n <= 50);
    const fee = feeMatches.length > 0 ? Math.max(...feeMatches) : 16;

    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const requirements = [
      "Valid passport (no separate ID accepted)",
      "Apply online via the UK ETA app or gov.uk before travel",
      "Approved ETA links to your passport for 2 years (multi-entry)",
      "Travel for tourism, business meetings, or transit only — not work or study",
    ];

    const records: ParsedRecord[] = [];
    for (const passport of ETA_NATIONALITIES) {
      if (!validIso.has(passport) || passport === "GB") continue;
      // Tourism + business + transit all use the same ETA.
      for (const purpose of ["tourism", "business", "transit"] as const) {
        records.push({
          passportIso2: passport,
          destinationIso2: "GB",
          purpose,
          status: "visa_free_with_eta",
          label: "UK Electronic Travel Authorisation (ETA)",
          maxStayDays: 6 * 30, // up to 6 months per visit
          validityDays: 2 * 365, // ETA valid 2 years
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 0,
          onwardTicketRequired: true,
          requirements,
          processingTimeDaysMin: 0,
          processingTimeDaysMax: 3,
          applicationUrl: APPLY_URL,
          primarySourceUrl: SOURCE_URL,
          fees: [
            { kind: "base", amountMinor: fee * 100, currency: "GBP", asOf: today, label: "UK ETA fee" },
          ],
          notes:
            "The UK ETA is a digital pre-travel authorization for non-visa-national visitors. It permits stays up to 6 months and is valid for 2 years or until your passport expires (whichever is sooner). Most decisions return within minutes; allow up to 3 working days during peak.",
        });
      }
    }

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} ETA records (expected hundreds).` };
    }
    return { records };
  },
};
