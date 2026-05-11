/**
 * New Zealand Electronic Travel Authority (NZeTA) adapter.
 *
 * Source: https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/nzeta
 *
 * NZeTA is required for visa-waiver passport holders flying to or transiting
 * through NZ. NZD 17–23 (depending on application channel) plus NZD 100
 * International Visitor Conservation and Tourism Levy. Valid 2 years, allows
 * stays up to 90 days (or 180 for British citizens).
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/nzeta";

// NZeTA-eligible nationalities — visa-waiver passport holders flying to NZ.
// Australian citizens don't need an NZeTA (free entry under SCV).
const NZ_VISA_WAIVER_NATIONALITIES: string[] = [
  "AT", "BH", "BE", "BG", "CA", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IS", "IE", "IL", "IT", "JP", "KR", "KW", "LV", "LI",
  "LT", "LU", "MY", "MT", "MX", "MC", "NL", "NO", "OM", "PL", "PT", "QA",
  "RO", "SM", "SA", "SG", "SK", "SI", "ES", "SE", "CH", "TW", "AE", "GB",
  "US", "UY", "VA", "AR", "BR", "CL",
  "HK", // Hong Kong special administrative region
];

// British citizens get 180 days; everyone else 90.
const STAY_DAYS = (iso: string) => (iso === "GB" ? 180 : 90);

export const newZealandNzetaAdapter: Adapter = {
  metadata: {
    id: "nz_nzeta",
    name: "New Zealand NZeTA (immigration.govt.nz)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/nz_nzeta.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const today = new Date().toISOString().slice(0, 10);
    const main = $("main, body").text().replace(/\s+/g, " ");

    if (!/(nzeta|electronic\s+travel\s+authority)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected NZeTA wording." };
    }

    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];

    for (const passport of NZ_VISA_WAIVER_NATIONALITIES) {
      if (!validIso.has(passport) || passport === "NZ") continue;
      const stay = STAY_DAYS(passport);
      for (const purpose of ["tourism", "business"] as const) {
        records.push({
          passportIso2: passport,
          destinationIso2: "NZ",
          purpose,
          status: "visa_free_with_eta",
          label: "NZeTA — Electronic Travel Authority",
          maxStayDays: stay,
          validityDays: 2 * 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 3,
          onwardTicketRequired: true,
          requirements: [
            "Hold a passport from a visa-waiver country",
            "Apply via the NZeTA app or immigration.govt.nz before travel",
            "Pay the International Visitor Conservation and Tourism Levy (IVL)",
            "Travel for tourism, short-term business, or transit only",
          ],
          processingTimeDaysMin: 0,
          processingTimeDaysMax: 3,
          applicationUrl:
            "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/nzeta-request",
          primarySourceUrl: SOURCE_URL,
          fees: [
            { kind: "base", amountMinor: 23_00, currency: "NZD", asOf: today, label: "NZeTA fee (web channel)" },
            { kind: "service", amountMinor: 100_00, currency: "NZD", asOf: today, label: "International Visitor Conservation and Tourism Levy" },
          ],
          notes:
            `British citizens may stay up to 6 months on each visit; all other visa-waiver nationals up to 3 months. The NZeTA is valid for 2 years or until your passport expires. Most decisions return within 72 hours; many approve in minutes.`,
        });
      }
    }

    if (records.length < 50) {
      return { records, parseError: `Only ${records.length} NZeTA records (expected 100+).` };
    }
    return { records };
  },
};
