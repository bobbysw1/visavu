/**
 * UK Spouse / partner visa adapter.
 *
 * Source: https://www.gov.uk/uk-family-visa/partner-spouse
 *
 * Produces an `embassy_visa` VisaOption per non-GB passport for purpose=family,
 * with FamilyVisaMetadata (sponsor income threshold, eligible relationship
 * types, cohabitation evidence requirement, route to settlement after 5
 * years).
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { FamilyVisaMetadata } from "@/lib/types";

const SOURCE_URL = "https://www.gov.uk/uk-family-visa/partner-spouse";
const APPLY_URL = "https://www.gov.uk/uk-family-visa/apply-partner";

export const ukSpouseAdapter: Adapter = {
  metadata: {
    id: "uk_spouse",
    name: "UK Spouse / partner visa (gov.uk)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/uk_spouse.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const today = new Date().toISOString().slice(0, 10);
    const main = $("main, #content").text().replace(/\s+/g, " ");

    if (!/(spouse|partner|family\s+visa)/i.test(main)) {
      return { records: [], parseError: "Page text does not match expected partner/spouse/family visa wording." };
    }

    // Sponsor minimum income (2024–2025 phased increase: £29,000 → £38,700).
    // Pull the largest plausible threshold value from the page.
    const incomeCandidates = [...main.matchAll(/£\s?(2\d{1,2}(?:,\d{3})*|3\d{1,2}(?:,\d{3})*)/g)]
      .map((m) => parseInt(m[1].replace(/,/g, ""), 10))
      .filter((n) => n >= 25_000 && n <= 60_000);
    const sponsorIncome = incomeCandidates.length > 0 ? Math.max(...incomeCandidates) : 29_000;

    const purposeMetadata: FamilyVisaMetadata = {
      relationshipTypes: ["spouse", "partner"],
      sponsorIncomeThresholdMinor: sponsorIncome * 100,
      sponsorIncomeCurrency: "GBP",
      sponsorMustBeCitizenOrResident: true,
      cohabitationProofRequired: true,
      routeToSettlement: true,
    };

    const requirements = [
      "Both 18 or over",
      "Genuine and subsisting relationship with a UK partner",
      "If unmarried, lived together in a relationship like marriage for at least 2 years",
      "Sponsor is a British citizen or settled in the UK",
      "Sponsor meets the minimum income requirement",
      "Adequate accommodation without recourse to public funds",
      "Knowledge of English (CEFR A1) on initial application",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "GB")
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "GB",
        purpose: "family" as const,
        status: "embassy_visa" as const,
        label: "Spouse / partner visa",
        maxStayDays: 33 * 30, // ~33 months (2.5 yrs first grant)
        validityDays: 33 * 30,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "UKVCAS / Visa Application Centre",
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: true,
        requirements,
        processingTimeDaysMin: 56,
        processingTimeDaysMax: 168, // up to 24 weeks
        applicationUrl: APPLY_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 1_938_00, currency: "GBP", asOf: today, label: "Application fee (outside UK)" },
          { kind: "service" as const, amountMinor: 1_035_00, currency: "GBP", asOf: today, label: "Immigration Health Surcharge (per year)" },
        ],
        notes:
          "Initial grant 33 months, extension 30 months, then ILR after 5 years. Spouse and unmarried-partner routes are unified. Higher knowledge-of-English level required at extension and ILR stages.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Generated only ${records.length} records (expected ~250).` };
    }
    return { records };
  },
};
