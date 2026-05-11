/**
 * Australia eVisitor (Subclass 651) adapter.
 *
 * Source: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651
 *
 * eVisitor is the free online authorisation for EU/EEA passport holders
 * visiting Australia. Other visa-exempt nationalities use the ETA (Subclass
 * 601), which carries an AUD 20 service fee. We model both: this adapter
 * for eVisitor, and a sibling could be added for Subclass 601 if needed.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651";

// eVisitor (Subclass 651) eligible nationalities — EU + EEA + a few others.
const EVISITOR_NATIONALITIES: string[] = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "MC", "NL", "NO",
  "PL", "PT", "RO", "SM", "SK", "SI", "ES", "SE", "CH", "VA", "AD",
];

export const australiaEvisitorAdapter: Adapter = {
  metadata: {
    id: "au_evisitor_651",
    name: "Australia eVisitor (Subclass 651)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/au_evisitor.html",
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

    if (!/(evisitor|subclass\s+651)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected eVisitor / Subclass 651 wording." };
    }

    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const requirements = [
      "Hold an eligible passport (EU / EEA + a few others)",
      "Apply online via ImmiAccount before booking",
      "Health and character requirements (declared on application)",
      "No tuberculosis or criminal record exclusions",
    ];

    const records: ParsedRecord[] = [];
    for (const passport of EVISITOR_NATIONALITIES) {
      if (!validIso.has(passport) || passport === "AU") continue;
      for (const purpose of ["tourism", "business"] as const) {
        records.push({
          passportIso2: passport,
          destinationIso2: "AU",
          purpose,
          status: "visa_free_with_eta",
          label: "Australia eVisitor (Subclass 651)",
          maxStayDays: 90,
          validityDays: 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 0,
          requirements,
          processingTimeDaysMin: 0,
          processingTimeDaysMax: 1,
          applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651/apply",
          primarySourceUrl: SOURCE_URL,
          fees: [], // eVisitor is free
          notes:
            "eVisitor is free and grants stays of up to 3 months per visit, with multiple entries allowed during the 12-month visa validity. It cannot be extended in Australia. Non-EU/EEA visa-exempt travellers use the ETA (Subclass 601) which has a service fee.",
        });
      }
    }

    if (records.length < 30) {
      return { records, parseError: `Only ${records.length} eVisitor records (expected 60+).` };
    }
    return { records };
  },
};
