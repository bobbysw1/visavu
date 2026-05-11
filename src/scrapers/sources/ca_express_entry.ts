/**
 * Canada Express Entry — Federal Skilled Worker (FSW) adapter.
 *
 * Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html
 *
 * Express Entry is the points-based path to permanent residence; this
 * adapter covers the Federal Skilled Worker stream as the canonical case.
 * Status is `e_visa` because the entire process (profile + ITA + APR) is
 * online via the IRCC portal — no embassy appointment required.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { WorkVisaMetadata } from "@/lib/types";

const SOURCE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html";

export const caExpressEntryAdapter: Adapter = {
  metadata: {
    id: "ca_express_entry_fsw",
    name: "Canada Express Entry — Federal Skilled Worker (canada.ca)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/ca_express_entry.html",
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

    if (!/express\s+entry/i.test(main)) {
      return { records: [], parseError: "Page text does not match expected Express Entry wording." };
    }

    const purposeMetadata: WorkVisaMetadata = {
      sponsorshipRequired: false, // FSW does not require employer sponsorship
      sponsorType: "self",
      jobOfferRequired: false, // optional, but adds CRS points
      routeToSettlement: true, // Express Entry directly grants permanent residence
      eligibleOccupations: [
        "TEER 0 — Management occupations",
        "TEER 1 — Professional occupations",
        "TEER 2 — Technical & paraprofessional",
        "TEER 3 — Skilled trades",
      ],
    };

    const requirements = [
      "Express Entry profile with valid Canadian Language Benchmark (CLB) language results",
      "ECA (Educational Credential Assessment) for foreign education",
      "Skilled work experience in NOC TEER 0, 1, 2, or 3 occupations (1+ year continuous)",
      "Proof of funds (varies by family size; ~CAD 14,690 for a single applicant in 2024–2025)",
      "Pass minimum points threshold under the FSW grid (67 / 100)",
      "Receive an Invitation to Apply (ITA) based on Comprehensive Ranking System (CRS) score",
      "Police certificates and medical exam",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "CA")
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "CA",
        purpose: "work" as const,
        status: "e_visa" as const, // entirely online via IRCC portal
        label: "Express Entry — Federal Skilled Worker",
        maxStayDays: null, // permanent residence
        validityDays: null,
        entriesAllowed: "permanent",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "Visa Application Centre (VAC)",
        proofOfFundsRequired: true,
        requirements,
        processingTimeDaysMin: 90,
        processingTimeDaysMax: 180,
        applicationUrl:
          "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile.html",
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 950_00, currency: "CAD", asOf: today, label: "Processing fee (principal applicant)" },
          { kind: "base" as const, amountMinor: 575_00, currency: "CAD", asOf: today, label: "Right of Permanent Residence Fee (RPRF)" },
          { kind: "biometrics" as const, amountMinor: 85_00, currency: "CAD", asOf: today, label: "Biometrics fee" },
        ],
        notes:
          "Express Entry is a points-based system that ranks candidates by Comprehensive Ranking System (CRS) score. Receiving an Invitation to Apply (ITA) depends on the cut-off in periodic draws. The FSW stream grants permanent residence directly — not a temporary work permit.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Generated only ${records.length} records (expected ~250).` };
    }
    return { records };
  },
};
