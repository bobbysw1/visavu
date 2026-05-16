/**
 * Japan short-stay tourism adapter (visa-exempt nationalities).
 *
 * Source: https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html
 *
 * Japan grants visa-free short-stay entry to ~70 countries. This adapter
 * inlines the published list (slow-moving, treaty-based) and emits one
 * record per (passport × Japan × tourism). Stay length varies by bilateral
 * agreement: most are 90 days, some are 30 (e.g. Indonesia/Thailand under
 * the e-visa-exemption arrangements), 14 (Brunei).
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html";

// Visa-exempt for 90 days unless otherwise marked. Iso2 → max stay days.
// Sourced from MOFA's published short-stay visa-exemption list (2024–2025).
const VISA_EXEMPT_DAYS: Record<string, number> = {
  // 90 days (most of the list)
  AD: 90, AR: 90, AT: 90, AU: 90, BS: 90, BB: 90, BE: 90, BG: 90, CA: 90,
  CL: 90, HR: 90, CY: 90, CZ: 90, DK: 90, DO: 90, SV: 90, EE: 90, FI: 90,
  FR: 90, DE: 90, GR: 90, GT: 90, HN: 90, HK: 90, HU: 90, IS: 90, IE: 90,
  IL: 90, IT: 90, LV: 90, LS: 90, LI: 90, LT: 90, LU: 90, MO: 90, MK: 90,
  MY: 90, MT: 90, MU: 90, MX: 90, MC: 90, NL: 90, NZ: 90, NO: 90, PL: 90,
  PT: 90, KR: 90, RO: 90, SM: 90, RS: 90, SG: 90, SK: 90, SI: 90, ES: 90,
  SR: 90, SE: 90, CH: 90, TW: 90, TR: 90, GB: 90, US: 90, UY: 90, VA: 90,
  // Shorter stays
  ID: 30, // Indonesia (e-visa-exemption registration required)
  TH: 30,
  AE: 30, // UAE — bilateral visa-exemption agreement, in force since 2017
  QA: 30, // Qatar — bilateral visa-exemption agreement, in force since 2022
  BN: 14,
};

export const japanShortStayAdapter: Adapter = {
  metadata: {
    id: "jp_short_stay",
    name: "Japan short-stay visa-exemption (mofa.go.jp)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/jp_short_stay.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const main = $("main, #content, body").text().replace(/\s+/g, " ");

    if (!/(visa\s+exempt|visa\s+free|short[- ]stay|查証免除)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected MOFA short-stay wording." };
    }

    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];

    for (const [passport, days] of Object.entries(VISA_EXEMPT_DAYS)) {
      if (!validIso.has(passport) || passport === "JP") continue;
      records.push({
        passportIso2: passport,
        destinationIso2: "JP",
        purpose: "tourism",
        status: "visa_free",
        label: `Japan short-stay visa-exemption (${days} days)`,
        maxStayDays: days,
        validityDays: null,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 0, // valid for the duration of stay
        onwardTicketRequired: true,
        proofOfFundsRequired: false,
        requirements: [
          "Valid passport",
          "Onward / return ticket",
          "Visit must be tourism, business meetings, or visiting friends/family — no employment",
          ...(passport === "ID" ? ["Pre-register e-visa-exemption with the Japanese embassy before travel"] : []),
        ],
        processingTimeDaysMin: null,
        processingTimeDaysMax: null,
        applicationUrl: null,
        primarySourceUrl: SOURCE_URL,
        fees: [],
        notes: `Stay up to ${days} days for tourism, short-term business, or family visits. Cannot work or earn income in Japan on this exemption. ${
          passport === "ID" ? "Indonesian citizens must register the e-visa-exemption in advance via the Japanese embassy." : ""
        }`.trim(),
      });
    }

    if (records.length < 30) {
      return { records, parseError: `Only ${records.length} JP visa-exempt records (expected 60+).` };
    }
    return { records };
  },
};
