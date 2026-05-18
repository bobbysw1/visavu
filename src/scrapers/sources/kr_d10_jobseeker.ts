/**
 * South Korea D-10 (Job Seeker) visa adapter.
 *
 * Source: https://www.visa.go.kr/openPage.do?MENU_ID=10101 and the
 * Hi Korea online portal. The D-10 is South Korea's job-seeker
 * residence permit — issued to qualified foreign nationals to enter
 * Korea and search for skilled employment / entrepreneurship that
 * would lead to an E-7 (specialty occupation), D-8 (corporate
 * investor), or D-9 (trade management) status.
 *
 * Two sub-categories:
 *   D-10-1 — General Job Seeker — for graduates of recognised foreign
 *            or Korean universities pursuing E-7-eligible occupations.
 *   D-10-2 — Technology Startup — for D-8 startup preparation.
 *
 * Initial 6-month stay, extendable to 2 years cumulative (typical).
 * Eligible nationalities: broadly all non-restricted; the application
 * is by qualification (education / experience) rather than nationality.
 *
 * Refresh quarterly. The visa policy is stable but income thresholds
 * and qualifying-occupation lists are revised annually by the Ministry
 * of Justice.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.visa.go.kr/openPage.do?MENU_ID=10101";
const APPLY_URL = "https://www.hikorea.go.kr/";

// Per the backlog the D-10 is for graduates of recognised universities
// and high-skill professionals. Eligibility is by qualification rather
// than nationality, but holders of restricted-status passports (NK,
// certain others) cannot apply. Limit to passport-issuing countries.
const ALL = COUNTRY_LIST.map((c) => c.iso2);
const EXCLUDED = new Set(["KR", "KP"]); // own country + DPRK

export const koreaD10JobseekerAdapter: Adapter = {
  metadata: {
    id: "kr_d10_jobseeker",
    name: "South Korea D-10 (Job Seeker) visa",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL, APPLY_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/kr_d10_jobseeker.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "kr_d10_jobseeker" }), fetchUrl: "manual://kr_d10_jobseeker" };
  },

  async parse() {
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      if (EXCLUDED.has(passport)) continue;
      records.push({
        passportIso2: passport,
        destinationIso2: "KR",
        purpose: "work",
        status: "embassy_visa",
        label: "D-10 Job Seeker visa — South Korea",
        maxStayDays: 730, // 2-year cumulative max
        validityDays: 180, // 6-month initial issue
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Korean consulate / Hi Korea office",
        requirements: [
          "Bachelor's degree or higher from a recognised foreign or Korean institution (D-10-1)",
          "OR: business plan and technical / managerial skills sufficient for a D-8 startup (D-10-2)",
          "Proof of funds for cost of living during the job-search period (typically KRW 20M / ~USD 15k)",
          "Korean-language proficiency (TOPIK Level 3+ recommended; not strictly required)",
          "Police clearance certificate",
          "Health check on entry for stays over 90 days",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 30,
        applicationUrl: APPLY_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 8000_00, currency: "KRW", asOf: today, label: "D-10 single-entry visa fee" },
          { kind: "service" as const, amountMinor: 3000_00, currency: "KRW", asOf: today, label: "Alien Registration Card on arrival", optional: false },
        ],
        notes: "D-10 is a residence permit, not a tourist or work permit in itself. The holder may not work for an employer until they secure a job and switch to the appropriate visa category (E-7 specialty occupation, D-8 corporate investor, D-9 trade management). Cumulative D-10 stays may not exceed 2 years. Extensions are at the discretion of the Korean Immigration Service.",
      });
    }

    return { records };
  },
};
