/**
 * Australia Subclass 500 (Student visa) adapter.
 *
 * Source: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500
 *
 * Status: e_visa — applications are entirely online via ImmiAccount; no
 * embassy appointment required for most cases. Surfaces StudyVisaMetadata.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { StudyVisaMetadata } from "@/lib/types";

const SOURCE_URL =
  "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500";

export const auSubclass500Adapter: Adapter = {
  metadata: {
    id: "au_subclass_500",
    name: "Australia Student visa (Subclass 500)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/au_subclass_500.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const today = new Date().toISOString().slice(0, 10);
    const main = $("main, #content, body").text().replace(/\s+/g, " ");

    if (!/(student\s+visa|subclass\s+500)/i.test(main)) {
      return { records: [], parseError: "Page text does not match expected Subclass 500 / Student visa wording." };
    }

    // Application charge — typically AUD 1,600 (rising). Pull the largest
    // 4-figure dollar amount that looks like a fee.
    const feeMatches = [...main.matchAll(/AUD?\s?\$?(\d{1,3}(?:,\d{3})*)/gi)]
      .map((m) => parseInt(m[1].replace(/,/g, ""), 10))
      .filter((n) => n >= 1000 && n <= 5000);
    const baseFee = feeMatches.length > 0 ? Math.max(...feeMatches) : 1600;

    const purposeMetadata: StudyVisaMetadata = {
      institutionAccreditationRequired: true,
      financialProofMonthlyMinor: 0, // total annual figure used instead — see notes
      financialProofCurrency: "AUD",
      partTimeWorkAllowedHours: 48, // 48 hours per fortnight (~24/wk) during study
      englishRequirement: "IELTS / TOEFL / PTE / OET / Cambridge — varies by provider",
    };

    const requirements = [
      "Confirmation of Enrolment (CoE) from a CRICOS-registered provider",
      "Genuine Student (GS) requirement — replaces the former Genuine Temporary Entrant",
      "Overseas Student Health Cover (OSHC) for the visa duration",
      "Sufficient funds: tuition + AUD 24,505 living costs per 12 months (single)",
      "English language proficiency at the level required by your provider",
      "Health and character requirements",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "AU")
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "AU",
        purpose: "study" as const,
        status: "e_visa" as const,
        label: "Student visa (Subclass 500)",
        maxStayDays: 5 * 365,
        validityDays: 5 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        biometricsRequired: false,
        proofOfFundsRequired: true,
        requirements,
        processingTimeDaysMin: 21,
        processingTimeDaysMax: 84,
        applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/apply",
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: baseFee * 100, currency: "AUD", asOf: today, label: "Application charge (primary applicant)" },
        ],
        notes:
          "Subclass 500 covers all education sectors — primary, secondary, vocational, higher education, postgraduate research, ELICOS. Permits work up to 48 hours per fortnight while studying.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Generated only ${records.length} records (expected ~250).` };
    }
    return { records };
  },
};
