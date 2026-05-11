/**
 * Singapore Employment Pass adapter.
 *
 * Source: https://www.mom.gov.sg/passes-and-permits/employment-pass
 *
 * The Employment Pass (EP) is Singapore's standard sponsored-work route for
 * professionals, managers and executives. Salary thresholds are tiered by
 * age (younger applicants face a lower floor) and stricter for the financial
 * services sector. Applicants must also pass the COMPASS points-based
 * framework (introduced 2023) on top of the salary requirement.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { WorkVisaMetadata } from "@/lib/types";

const SOURCE_URL = "https://www.mom.gov.sg/passes-and-permits/employment-pass";

export const singaporeEmploymentPassAdapter: Adapter = {
  metadata: {
    id: "sg_employment_pass",
    name: "Singapore Employment Pass (mom.gov.sg)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/sg_employment_pass.html",
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

    if (!/(employment\s+pass|EP\b|qualifying\s+salary)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected Employment Pass wording." };
    }

    // 2024–2025 minimum qualifying monthly salary: SGD 5,600 for the general
    // sector; SGD 6,200 for financial services. Surface the higher (more
    // conservative) figure as the headline annual minimum: 6,200 × 12 ≈ 74,400.
    const incomeCandidates = [...main.matchAll(/\$?\s?(\d{1,2}(?:,\d{3})+|\d{4,6})/g)]
      .map((m) => parseInt(m[1].replace(/,/g, ""), 10))
      .filter((n) => n >= 4000 && n <= 20_000);
    const monthly = incomeCandidates.length > 0 ? Math.max(...incomeCandidates) : 6_200;
    const annual = monthly * 12;

    const purposeMetadata: WorkVisaMetadata = {
      sponsorshipRequired: true,
      sponsorType: "employer",
      salaryThresholdMinor: annual * 100,
      salaryCurrency: "SGD",
      jobOfferRequired: true,
      workPermitDays: 2 * 365, // first issuance up to 2 years
      routeToSettlement: true, // Permanent Residence after 2+ years on EP is a documented path
      eligibleOccupations: [
        "Software engineer / developer",
        "Data scientist / analyst",
        "Financial / investment professional",
        "Consultant",
        "Engineer (civil, mechanical, electrical, chemical)",
        "Marketing / brand professional",
        "Senior manager / executive",
        "Researcher",
      ],
    };

    const requirements = [
      "Job offer from a Singapore-registered employer",
      "Monthly salary at or above the qualifying threshold (varies by sector and age)",
      "Pass the COMPASS points-based framework (≥40 points)",
      "Acceptable academic and professional qualifications",
      "Employer-submitted application via MyMOM portal",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "SG")
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "SG",
        purpose: "work" as const,
        status: "embassy_visa" as const,
        label: "Singapore Employment Pass",
        maxStayDays: 2 * 365,
        validityDays: 2 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        biometricsRequired: false,
        proofOfFundsRequired: false,
        requirements,
        processingTimeDaysMin: 7,
        processingTimeDaysMax: 56,
        applicationUrl:
          "https://www.mom.gov.sg/passes-and-permits/employment-pass/apply-for-a-pass",
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 105_00, currency: "SGD", asOf: today, label: "Application fee" },
          { kind: "service" as const, amountMinor: 225_00, currency: "SGD", asOf: today, label: "Issuance fee" },
        ],
        notes:
          "First issuance is for up to 2 years and can be renewed for up to 3. EP holders may bring family on a Dependant's Pass (DP). After 2+ years on EP, holders are eligible to apply for Permanent Residence. Employers must satisfy the Fair Consideration Framework (advertise locally for 28 days first).",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} EP records (expected ~249).` };
    }
    return { records };
  },
};
