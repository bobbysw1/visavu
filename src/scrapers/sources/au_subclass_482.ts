/**
 * Australia Skills in Demand visa (Subclass 482) adapter.
 *
 * Source: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-482
 *
 * Replaced the Subclass 457 / TSS in late 2024. Sponsor-based work visa with
 * three streams (Specialist Skills / Core Skills / Essential Skills). For MVP
 * we emit the Core Skills stream as the primary record — it covers the bulk
 * of applications.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { WorkVisaMetadata } from "@/lib/types";

const SOURCE_URL =
  "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482";

export const auSubclass482Adapter: Adapter = {
  metadata: {
    id: "au_subclass_482",
    name: "Australia Skills in Demand visa (Subclass 482)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/au_subclass_482.html",
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

    if (!/(skills\s+in\s+demand|subclass\s+482)/i.test(main)) {
      return { records: [], parseError: "Page text does not match expected Subclass 482 / Skills in Demand wording." };
    }

    // Core Skills Income Threshold (CSIT) — AUD 73,150 in 2024–2025.
    const incomeMatches = [...main.matchAll(/AUD?\s?\$?(\d{2,3}(?:,\d{3})*)/gi)]
      .map((m) => parseInt(m[1].replace(/,/g, ""), 10))
      .filter((n) => n >= 60_000 && n <= 200_000);
    const csit = incomeMatches.length > 0 ? Math.max(...incomeMatches) : 73_150;

    const purposeMetadata: WorkVisaMetadata = {
      sponsorshipRequired: true,
      sponsorType: "employer",
      salaryThresholdMinor: csit * 100,
      salaryCurrency: "AUD",
      jobOfferRequired: true,
      workPermitDays: 4 * 365,
      routeToSettlement: true,
      eligibleOccupations: [
        "Software engineer",
        "Registered nurse",
        "Civil engineer",
        "Mechanical engineer",
        "Electrician",
        "Chef",
        "ICT business analyst",
        "Project manager",
        "Secondary school teacher",
        "Accountant",
      ],
    };

    const requirements = [
      "Nominated by an approved Australian sponsor",
      "Skills assessment for the nominated occupation",
      "Annual market salary rate at or above the Core Skills Income Threshold",
      "At least 1 year of relevant work experience",
      "Competent English (IELTS 5.0 in each component or equivalent)",
      "Health and character requirements",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "AU")
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "AU",
        purpose: "work" as const,
        status: "embassy_visa" as const,
        label: "Skills in Demand visa (Subclass 482) — Core Skills stream",
        maxStayDays: 4 * 365,
        validityDays: 4 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        biometricsRequired: true,
        biometricsLocation: "AVAC / online for some nationalities",
        requirements,
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 120,
        applicationUrl:
          "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-482/apply",
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 3210_00, currency: "AUD", asOf: today, label: "Application charge (Core Skills, primary applicant)" },
        ],
        notes:
          "Replaced the Subclass 457 / TSS visa in late 2024. Three streams — Specialist Skills (high earners), Core Skills (most occupations), Essential Skills (forthcoming). Core Skills is the default for general skilled employment.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Generated only ${records.length} records (expected ~250).` };
    }
    return { records };
  },
};
