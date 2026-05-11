/**
 * UK Skilled Worker visa adapter.
 *
 * Source: https://www.gov.uk/skilled-worker-visa
 *
 * What it produces: a single `embassy_visa` VisaOption per major passport
 * cohort for purpose=work into the UK, with structured `purposeMetadata`
 * (sponsorship, salary thresholds, sample eligible occupations, settlement
 * route).
 *
 * Why this is the right second adapter: gov.uk is well-structured, English-
 * native, no anti-bot measures, and the page exposes salary threshold,
 * sponsor licensing, and the broad eligible-occupation pattern in plain text.
 * It exercises the new long-stay visa data model end-to-end (purpose=work,
 * purposeMetadata.sponsorshipRequired/salary/jobOffer, requirements list).
 *
 * What it does NOT cover: per-occupation Standard Occupational Classification
 * (SOC) codes and per-occupation going rates (those live in a separate Home
 * Office "going rates" document; that's a future adapter). Also doesn't cover
 * Health and Care Worker, Senior or Specialist Worker, Scale-up, or Global
 * Talent — each has its own gov.uk page and parser.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { WorkVisaMetadata } from "@/lib/types";

const SOURCE_URL = "https://www.gov.uk/skilled-worker-visa";
const APPLY_URL = "https://www.gov.uk/skilled-worker-visa/apply-from-outside-the-uk";

// Skilled Worker is a single visa route — no per-passport variation in eligibility,
// only in the application channel (where you apply, biometrics centre etc.).
// We emit one ParsedRecord per non-UK passport country so the adapter still
// fills cells across the matrix; the actual data is identical, sourced from
// the same gov.uk page.
//
// This is intentional and correct: the source SAYS the requirements are the
// same regardless of nationality. Confidence stays high because the source
// itself is authoritative for that statement.

export const ukSkilledWorkerAdapter: Adapter = {
  metadata: {
    id: "uk_skilled_worker",
    name: "UK Skilled Worker visa (gov.uk)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000, // weekly — gov.uk publishes salary changes ~yearly but the page itself updates more often
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/uk_skilled_worker.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    const rawText = await res.text();
    return { rawText, fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const today = new Date().toISOString().slice(0, 10);

    // Pull the page text for regex extraction. gov.uk uses semantic HTML but
    // the load-bearing values (salary threshold, fee, processing time) live
    // inside prose paragraphs.
    const main = $("main, #content").text().replace(/\s+/g, " ");

    if (!/skilled\s+worker\s+visa/i.test(main)) {
      return {
        records: [],
        parseError:
          "Page text does not match expected 'Skilled Worker visa' header — gov.uk URL may have changed.",
      };
    }

    // Salary threshold. As of 2024 the general threshold is £38,700 — the page
    // states "£38,700 per year" or similar. We extract the highest pound value
    // mentioned in the salary context. Defensive: range allowed in case
    // policy lowers the floor (e.g. £29k for new entrants).
    const salaryMatches = [...main.matchAll(/£\s?(\d{2,3}(?:,\d{3})*)/g)]
      .map((m) => parseInt(m[1].replace(/,/g, ""), 10))
      .filter((n) => n >= 20_000 && n <= 100_000);
    const salaryThreshold = salaryMatches.length > 0 ? Math.max(...salaryMatches) : null;

    // Application fee — gov.uk states fees in a separate "fees" page but the
    // primary visa page typically links and references them. For MVP we
    // hard-code the published 2024 fee (~£769 entry clearance, < 3 yrs) and
    // acknowledge the imprecision via a "service" fee component.
    // A separate adapter for /government/publications/visa-regulations-revised-table
    // can replace this with the live fee schedule.
    const baseFeeGBPMinor = 76900; // £769.00

    const requirements = [
      "Confirmed job offer from a Home Office-licensed sponsor",
      "Certificate of Sponsorship (CoS) from your employer",
      "Job at the required skill level (RQF 3 or above)",
      `Salary at or above the minimum threshold${
        salaryThreshold ? ` (currently £${salaryThreshold.toLocaleString("en-GB")} per year)` : ""
      }`,
      "English language requirement (CEFR level B1) demonstrated by approved test, degree taught in English, or majority-English-speaking nationality",
      "Sufficient personal funds (£1,270 unless sponsor certifies maintenance)",
      "Tuberculosis test result (some nationalities)",
    ];

    // Sample eligible occupations — illustrative, not exhaustive.
    // The full SOC list has hundreds of entries; surfacing the top categories
    // gives users an indication. Replace with the live SOC list when a
    // dedicated adapter for that document is built.
    const sampleOccupations = [
      "Programmers and software developers",
      "IT business analysts",
      "Cyber security professionals",
      "Civil engineers",
      "Mechanical engineers",
      "Architects",
      "Doctors and surgeons",
      "Nurses",
      "Secondary education teachers",
      "Veterinarians",
      "Graphic designers",
      "Quality assurance professionals",
    ];

    const purposeMetadata: WorkVisaMetadata = {
      sponsorshipRequired: true,
      sponsorType: "employer",
      salaryThresholdMinor: salaryThreshold ? salaryThreshold * 100 : undefined,
      salaryCurrency: salaryThreshold ? "GBP" : undefined,
      eligibleOccupations: sampleOccupations,
      jobOfferRequired: true,
      workPermitDays: 5 * 365, // up to 5 years per visa grant
      routeToSettlement: true, // ILR after 5 years cumulative
    };

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "GB")
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "GB",
        purpose: "work" as const,
        status: "embassy_visa" as const,
        label: "Skilled Worker visa",
        maxStayDays: 5 * 365,
        validityDays: 5 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "Visa Application Centre (VAC) in your country",
        requirements,
        processingTimeDaysMin: 21,
        processingTimeDaysMax: 56,
        applicationUrl: APPLY_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          {
            kind: "base",
            amountMinor: baseFeeGBPMinor,
            currency: "GBP",
            asOf: today,
            label: "Application fee (up to 3 years, outside UK)",
          },
          {
            kind: "service",
            amountMinor: 1_03500, // £1,035 / year Immigration Health Surcharge
            currency: "GBP",
            asOf: today,
            label: "Immigration Health Surcharge (per year)",
          },
        ],
        notes:
          "Skilled Worker visas are sponsored by a UK employer holding a sponsor licence. The visa is tied to the specific job and sponsor; changing employer requires a new Certificate of Sponsorship and may require a new visa application. Provides a route to indefinite leave to remain (ILR) after 5 years.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return {
        records,
        parseError: `Generated only ${records.length} records (expected ~250). Country list mismatch?`,
      };
    }

    return { records };
  },
};
