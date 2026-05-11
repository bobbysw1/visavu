/**
 * France Talent Passport (Passeport Talent) adapter.
 *
 * Source: https://france-visas.gouv.fr/en/talent-passport
 *
 * Multi-year residence permit (1–4 years) for high-skill workers and their
 * families. Replaced multiple individual sponsored-work permits with a
 * single unified scheme. Excludes EU/EEA + Switzerland (free movement).
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { WorkVisaMetadata } from "@/lib/types";

const SOURCE_URL = "https://france-visas.gouv.fr/en/talent-passport";

const EU_EEA_SWISS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
  "PT", "RO", "SK", "SI", "ES", "SE", "CH",
]);

export const franceTalentPassportAdapter: Adapter = {
  metadata: {
    id: "fr_talent_passport",
    name: "France Talent Passport (Passeport Talent)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/fr_talent_passport.html",
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

    if (!/(talent\s+passport|passeport\s+talent)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected Talent Passport / Passeport Talent wording." };
    }

    // Salary threshold (highly-qualified worker stream, "EU Blue Card-equivalent"):
    // 1.5× SMIC minimum gross annual = ~€41,933 in 2024–2025.
    const purposeMetadata: WorkVisaMetadata = {
      sponsorshipRequired: true,
      sponsorType: "employer",
      salaryThresholdMinor: 41_933_00,
      salaryCurrency: "EUR",
      jobOfferRequired: true,
      workPermitDays: 4 * 365, // up to 4 years
      routeToSettlement: true,
      eligibleOccupations: [
        "Highly-qualified employee (Master's degree or equiv. + qualifying salary)",
        "Salaried employee of a French innovative company",
        "Researcher (with hosting agreement from approved institution)",
        "Investor (≥ €300,000 in tangible French assets, creating ≥3 jobs)",
        "Innovative-company founder",
        "Recognized artist / performer",
        "Athlete or coach of international standing",
      ],
    };

    const requirements = [
      "Job offer from a French employer (or research / artistic / business activity)",
      "Master's-level qualification or 5+ years of equivalent experience (highly-qualified stream)",
      "Salary at or above the threshold for your stream",
      "Proof of accommodation in France",
      "Health insurance",
      "Clean criminal record",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "FR" && !EU_EEA_SWISS.has(c.iso2))
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "FR",
        purpose: "work" as const,
        status: "embassy_visa" as const,
        label: "France Talent Passport (Passeport Talent)",
        maxStayDays: 4 * 365,
        validityDays: 4 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "French consulate / VFS / TLS centre in your country",
        requirements,
        processingTimeDaysMin: 21,
        processingTimeDaysMax: 60,
        applicationUrl: "https://france-visas.gouv.fr/",
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 99_00, currency: "EUR", asOf: today, label: "Long-stay visa application fee" },
          { kind: "service" as const, amountMinor: 200_00, currency: "EUR", asOf: today, label: "Residence permit issuance (titre de séjour)" },
        ],
        notes:
          "Multi-year permit (up to 4 years initially) with a fast track to family reunification — spouse and minor children are eligible for the 'Talent (family)' permit which permits work. After 5 years of residence, eligible for a 10-year resident card or French citizenship.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} Talent Passport records (expected ~220).` };
    }
    return { records };
  },
};
