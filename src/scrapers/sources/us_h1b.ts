/**
 * US H-1B Specialty Occupations adapter.
 *
 * Source: https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations
 *
 * H-1B is the US's flagship sponsored-work visa for specialty occupations.
 * Subject to an annual cap (65k regular + 20k US-master's exemption) with
 * a March lottery for selection. Initial grant 3 years, extendable to 6,
 * with longer extensions possible during a green-card process.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { WorkVisaMetadata } from "@/lib/types";

const SOURCE_URL =
  "https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations";
const APPLY_URL = "https://www.uscis.gov/i-129";

export const usH1bAdapter: Adapter = {
  metadata: {
    id: "us_h1b",
    name: "US H-1B Specialty Occupations (uscis.gov)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/us_h1b.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const today = new Date().toISOString().slice(0, 10);
    const main = $("body").text().replace(/\s+/g, " ");

    if (!/(h-1b|h-1\s*b|specialty\s+occupation)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected H-1B wording." };
    }

    const purposeMetadata: WorkVisaMetadata = {
      sponsorshipRequired: true,
      sponsorType: "employer",
      jobOfferRequired: true,
      // No statutory salary floor for H-1B itself; prevailing-wage requirement
      // applies through the LCA process. We surface the H-1B fee structure
      // and the cap as notes rather than salary.
      workPermitDays: 3 * 365, // initial; extendable to 6
      routeToSettlement: false, // dual-intent but not direct-PR like Express Entry
      eligibleOccupations: [
        "Software developer / engineer",
        "Data scientist / analyst",
        "Computer systems analyst",
        "Financial analyst",
        "Accountant / auditor",
        "Mechanical / electrical / civil engineer",
        "Architect",
        "Doctor / surgeon (with state license)",
        "University professor",
        "Mathematician / statistician",
      ],
    };

    const requirements = [
      "Bachelor's degree (or equivalent) in a specialty occupation",
      "Specialty-occupation job offer from a US employer",
      "Approved Labor Condition Application (LCA) at the prevailing wage",
      "Employer files Form I-129 petition with USCIS",
      "Selection via the H-1B cap lottery (regular and master's exemption pools)",
      "If outside US, consular processing at a US embassy after I-129 approval",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "US")
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "US",
        purpose: "work" as const,
        status: "embassy_visa" as const,
        label: "H-1B Specialty Occupation",
        maxStayDays: 3 * 365,
        validityDays: 3 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "US embassy / consulate (interview + fingerprints)",
        requirements,
        processingTimeDaysMin: 60,
        processingTimeDaysMax: 240, // can be much longer; premium processing reduces to 15 days
        applicationUrl: APPLY_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 460_00, currency: "USD", asOf: today, label: "Form I-129 base filing fee" },
          { kind: "service" as const, amountMinor: 215_00, currency: "USD", asOf: today, label: "MRV consular fee (visa stamping)" },
          { kind: "rush" as const, amountMinor: 2805_00, currency: "USD", asOf: today, label: "Premium Processing (optional, 15-day adjudication)", optional: true },
        ],
        notes:
          "H-1B is subject to an annual cap (65,000 regular + 20,000 US master's exemption). Initial grant 3 years, extendable to 6 (longer possible during green-card adjustment). Dual-intent visa — you may pursue permanent residence concurrently. Spouse / minor children are eligible for H-4 derivative status; H-4 EAD work authorization available in limited cases.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} H-1B records (expected ~249).` };
    }
    return { records };
  },
};
