/**
 * Switzerland Skilled Worker (B Permit / L Permit) adapter.
 *
 * Source: https://www.sem.admin.ch/sem/en/home/themen/arbeit.html
 *
 * Switzerland's work-permit system is uniquely federal-cantonal: each
 * canton issues permits within national annual quotas set by the State
 * Secretariat for Migration (SEM). Two main permit types:
 *
 *   L Permit (short-term) — initial 1-year, extendable to 24 months.
 *   B Permit (residence) — 1-year initial, renewed annually, leads to
 *                          C Permit (permanent) after 5-10 years.
 *
 * Eligibility is bifurcated by nationality:
 *   - EU/EFTA nationals: covered by the AFMP (Agreement on the Free
 *     Movement of Persons) — no permit needed for short stays,
 *     simplified registration for residence. (Handled separately,
 *     not in this adapter.)
 *   - Third-country nationals (US, UK post-Brexit, AU, CA, IN, etc.):
 *     restrictive quota system. Permit only for: managers and specialists
 *     not available in the EU labour market, salary at the regional
 *     prevailing rate, university degree typically required.
 *
 * Annual quotas (2025): ~8,500 L Permits + ~4,500 B Permits across
 * all third-country nationals nationwide — among the most restrictive
 * skilled-migration regimes in Western Europe.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.sem.admin.ch/sem/en/home/themen/arbeit.html";
const APPLY_URL = "https://www.sem.admin.ch/sem/en/home/sem/kontakt/auslaendervertretungen.html";

// EU/EFTA nationals covered under AFMP separately. This adapter handles
// third-country skilled-worker applications.
const EU_EFTA = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  // EFTA
  "IS", "LI", "NO",
]);

const ALL = COUNTRY_LIST.map((c) => c.iso2);

export const switzerlandSkilledWorkerAdapter: Adapter = {
  metadata: {
    id: "ch_skilled_worker",
    name: "Switzerland Skilled Worker (B / L Permit) — third-country nationals",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL, APPLY_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/ch_skilled_worker.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "ch_skilled_worker" }), fetchUrl: "manual://ch_skilled_worker" };
  },

  async parse() {
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      if (passport === "CH") continue;
      if (EU_EFTA.has(passport)) continue; // AFMP coverage

      records.push({
        passportIso2: passport,
        destinationIso2: "CH",
        purpose: "work",
        status: "embassy_visa",
        label: "Swiss B Permit (Residence) — Skilled Worker",
        maxStayDays: 1825, // 5-year initial residence cycle before C Permit eligibility for some
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        proofOfAccommodationRequired: true,
        biometricsRequired: true,
        biometricsLocation: "Swiss embassy / consulate or cantonal migration office",
        requirements: [
          "Job offer from a Swiss employer at the regional prevailing wage",
          "University degree or specialised professional training (10+ years sector experience can substitute)",
          "Employer demonstration that the role cannot be filled by a Swiss or EU/EFTA candidate (labour-market priority test)",
          "Annual federal quota allocation — first-come-first-served via cantonal office",
          "Swiss-recognised health insurance from the date of arrival (mandatory)",
          "Police clearance + apostilled / authenticated diplomas",
        ],
        processingTimeDaysMin: 60,
        processingTimeDaysMax: 120,
        applicationUrl: APPLY_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 18000, currency: "CHF", asOf: today, label: "Federal entry visa fee" },
          { kind: "service" as const, amountMinor: 14000, currency: "CHF", asOf: today, label: "Cantonal residence permit issuance", optional: false },
        ],
        notes: "Switzerland operates a federal annual quota for third-country skilled-worker permits (~8,500 L + 4,500 B Permits in 2025). Employer-sponsored application begins at the cantonal migration office before consular processing. Cantonal authorities have broad discretion; processing times vary substantially by canton (Zurich, Geneva, Vaud faster; smaller cantons slower). C Permit (settlement) typically requires 5 years for nationals of preferred countries (US, Canada, etc.) or 10 years for others, plus B1+ language proficiency in the canton's official language.",
      });

      // Also emit an L Permit (short-term) variant for the same passport.
      records.push({
        passportIso2: passport,
        destinationIso2: "CH",
        purpose: "work",
        status: "embassy_visa",
        label: "Swiss L Permit (Short-term) — Skilled Worker",
        maxStayDays: 365,
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        proofOfAccommodationRequired: true,
        biometricsRequired: true,
        biometricsLocation: "Swiss embassy / consulate or cantonal migration office",
        requirements: [
          "Job offer from a Swiss employer at the regional prevailing wage",
          "Specialised qualifications / experience required for the role",
          "Annual federal L Permit quota allocation",
          "Swiss-recognised health insurance from the date of arrival",
          "Police clearance + apostilled / authenticated diplomas",
        ],
        processingTimeDaysMin: 45,
        processingTimeDaysMax: 90,
        applicationUrl: APPLY_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 18000, currency: "CHF", asOf: today, label: "Federal entry visa fee" },
        ],
        notes: "Short-term L Permit issued for fixed assignments under 24 months. Extendable up to 24 months total. Does NOT lead to B Permit by automatic conversion — employer must apply for a new B Permit allocation under the annual quota.",
      });
    }

    return { records };
  },
};
