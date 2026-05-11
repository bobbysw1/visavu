/**
 * Australia ETA (Subclass 601) adapter.
 *
 * Source: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601
 *
 * The ETA (Subclass 601) is the visa-free-with-eTA route for non-EU/EEA
 * visa-exempt nationalities — US, Canada, Japan, Korea, Singapore, etc.
 * AUD 20 service fee paid on application via the Australia ETA app.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601";

// ETA-eligible nationalities (Subclass 601) — non-eVisitor visa-exempt
// passport holders. The eVisitor (Subclass 651) covers EU/EEA + a few others;
// these countries use the ETA instead.
const ETA_NATIONALITIES: string[] = [
  "BN", "CA", "HK", "JP", "MY", "SG", "KR", "TW", "US",
];

export const auSubclass601Adapter: Adapter = {
  metadata: {
    id: "au_eta_601",
    name: "Australia ETA (Subclass 601)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/au_subclass_601.html",
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

    if (!/(electronic\s+travel\s+authority|subclass\s+601)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected ETA / Subclass 601 wording." };
    }

    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const requirements = [
      "Hold an eligible passport (Subclass 601 ETA-eligible nationality)",
      "Apply via the Australia ETA app (smartphone required)",
      "Health and character requirements",
      "Travel for tourism or short-term business — no work or study",
    ];

    const records: ParsedRecord[] = [];
    for (const passport of ETA_NATIONALITIES) {
      if (!validIso.has(passport) || passport === "AU") continue;
      for (const purpose of ["tourism", "business"] as const) {
        records.push({
          passportIso2: passport,
          destinationIso2: "AU",
          purpose,
          status: "visa_free_with_eta",
          label: "Australia ETA (Subclass 601)",
          maxStayDays: 90, // 3 months per visit
          validityDays: 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 0,
          requirements,
          processingTimeDaysMin: 0,
          processingTimeDaysMax: 1,
          applicationUrl:
            "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601/apply",
          primarySourceUrl: SOURCE_URL,
          fees: [
            { kind: "service", amountMinor: 2000, currency: "AUD", asOf: today, label: "ETA service charge" },
          ],
          notes:
            "The ETA is granted for 3-month stays during a 12-month visa validity. Apply via the Australia ETA app — most decisions are returned within minutes. The eVisitor (Subclass 651) is the equivalent free visa for EU/EEA nationals.",
        });
      }
    }

    if (records.length < 10) {
      return { records, parseError: `Only ${records.length} ETA-601 records (expected ~18+).` };
    }
    return { records };
  },
};
