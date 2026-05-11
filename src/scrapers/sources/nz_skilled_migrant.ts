/**
 * New Zealand Skilled Migrant Category (SMC) adapter.
 *
 * Source: https://www.immigration.govt.nz/new-zealand-visas/options/work/work-and-residence/skilled-migrant
 *
 * SMC is NZ's points-based residency route for skilled workers. The 2023
 * "6-point system" rewards specific skill, qualification, income, work
 * experience, and occupational-registration combinations. Applicants who
 * meet the threshold may receive an Invitation to Apply (ITA) for residence.
 *
 * Status: e_visa (online application, no embassy interview for most).
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { WorkVisaMetadata } from "@/lib/types";

const SOURCE_URL =
  "https://www.immigration.govt.nz/visas/skilled-migrant-category-resident-visa/";

export const newZealandSkilledMigrantAdapter: Adapter = {
  metadata: {
    id: "nz_skilled_migrant",
    name: "New Zealand Skilled Migrant Category (immigration.govt.nz)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/nz_skilled_migrant.html",
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

    if (!/(skilled\s+migrant|smc|6-point\s+system)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected SMC wording." };
    }

    // 2024–2025 thresholds: requires 6 points across qualification + income +
    // occupational registration. Median wage threshold ≈ NZD 31.61/hour
    // (NZD 65,750/year on 40-hr week).
    const purposeMetadata: WorkVisaMetadata = {
      sponsorshipRequired: false, // not always — points come from skill / qualifications too
      sponsorType: "self",
      jobOfferRequired: false, // optional but adds points
      salaryThresholdMinor: 65_750_00,
      salaryCurrency: "NZD",
      // permanent residence — workPermitDays is omitted intentionally
      routeToSettlement: true, // SMC grants residence directly
      eligibleOccupations: [
        "Software developer / IT specialist",
        "Construction project manager",
        "Civil / mechanical / electrical engineer",
        "Registered nurse / midwife",
        "Doctor / surgeon (with NZ Medical Council registration)",
        "Secondary school teacher",
        "ICT business analyst",
        "Quantity surveyor",
        "Architect (with NZ registration)",
        "Veterinarian",
      ],
    };

    const requirements = [
      "Score at least 6 points under the SMC point system (one of: 6 points qualification, 6 points NZ-registered occupation + 3 yrs experience, OR equivalent income)",
      "Be aged under 56",
      "Meet acceptable standard of health and character",
      "Meet English-language requirements (IELTS 6.5 or equivalent — many waivers)",
      "Where claiming income points: paid at or above the median wage by an accredited employer",
      "Submit an Expression of Interest (EOI) and receive an Invitation to Apply",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "NZ")
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "NZ",
        purpose: "work" as const,
        status: "e_visa" as const,
        label: "Skilled Migrant Category — Resident visa",
        maxStayDays: null, // permanent residence
        validityDays: null,
        entriesAllowed: "permanent",
        passportValidityMonthsRequired: 6,
        biometricsRequired: false,
        proofOfFundsRequired: false,
        requirements,
        processingTimeDaysMin: 90,
        processingTimeDaysMax: 240,
        applicationUrl:
          "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/skilled-migrant-category-resident-visa",
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 5810_00, currency: "NZD", asOf: today, label: "Application fee (offshore)" },
          { kind: "service" as const, amountMinor: 480_00, currency: "NZD", asOf: today, label: "Immigration Levy" },
        ],
        notes:
          "SMC grants Resident visa status — effectively permanent residence. After 2 years on a Resident visa, holders may apply for the Permanent Resident visa (no travel-back conditions). Spouse and dependent children are included in the application. Job offer and accreditation by an NZ-licensed employer are not strictly required if points come from qualification + occupation registration.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} SMC records (expected ~249).` };
    }
    return { records };
  },
};
