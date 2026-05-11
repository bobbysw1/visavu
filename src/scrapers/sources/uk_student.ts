/**
 * UK Student visa adapter.
 *
 * Source: https://www.gov.uk/student-visa
 *
 * Produces an `embassy_visa` VisaOption per non-GB passport for purpose=study,
 * with structured StudyVisaMetadata (institution accreditation, financial
 * proof per month — a Tier 4 hallmark — English requirement, term-time work
 * limit).
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { StudyVisaMetadata } from "@/lib/types";

const SOURCE_URL = "https://www.gov.uk/student-visa";
const APPLY_URL = "https://www.gov.uk/student-visa/apply";

export const ukStudentAdapter: Adapter = {
  metadata: {
    id: "uk_student",
    name: "UK Student visa (gov.uk)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/uk_student.html",
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

    if (!/student\s+visa/i.test(main)) {
      return { records: [], parseError: "Page text does not match expected 'Student visa' header." };
    }

    // London financial proof: £1,483/month for up to 9 months (£13,347).
    // Outside London: £1,136/month. We surface the London figure as the
    // worst case; the prose lists both.
    const londonMonthly = matchPounds(main, /£\s?(\d{2,4}(?:,\d{3})*)/g, [1000, 2500])
      .find((n) => n >= 1300 && n <= 1700) ?? 1483;

    const purposeMetadata: StudyVisaMetadata = {
      institutionAccreditationRequired: true,
      financialProofMonthlyMinor: londonMonthly * 100,
      financialProofCurrency: "GBP",
      partTimeWorkAllowedHours: 20, // term-time
      englishRequirement: "Secure English Language Test (SELT) at CEFR B2 for degree-level",
    };

    const requirements = [
      "Confirmation of Acceptance for Studies (CAS) from a licensed student sponsor",
      "Sufficient funds for course fees + monthly maintenance",
      "Approved English language ability (CEFR B2 for degree, B1 for below-degree)",
      "Tuberculosis test result (some nationalities)",
      "Parental consent if under 18",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "GB")
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "GB",
        purpose: "study" as const,
        status: "embassy_visa" as const,
        label: "Student visa",
        maxStayDays: 5 * 365, // 5 years for degree-level
        validityDays: 5 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "UKVCAS / Visa Application Centre in your country",
        requirements,
        processingTimeDaysMin: 21,
        processingTimeDaysMax: 56,
        applicationUrl: APPLY_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 49000, currency: "GBP", asOf: today, label: "Application fee (outside UK)" },
          { kind: "service" as const, amountMinor: 77600, currency: "GBP", asOf: today, label: "Immigration Health Surcharge (per year)" },
        ],
        notes:
          "Tier 4 / Student route. Sponsored by an institution holding a student sponsor licence. Permits limited part-time work during term and full-time during vacations. Switch to Graduate route possible after course completion.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Generated only ${records.length} records (expected ~250).` };
    }
    return { records };
  },
};

function matchPounds(text: string, regex: RegExp, range: [number, number]): number[] {
  return [...text.matchAll(regex)]
    .map((m) => parseInt(m[1].replace(/,/g, ""), 10))
    .filter((n) => n >= range[0] && n <= range[1]);
}
