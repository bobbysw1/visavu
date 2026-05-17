/**
 * Ireland Critical Skills Employment Permit (CSEP) adapter.
 *
 * Source: https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/
 *   employment-permits/permit-types/critical-skills-employment-permit/
 *
 * CSEP is Ireland's premium work-permit route: occupations on the Critical
 * Skills Occupations List with salary ≥ €38,000 (or ≥ €64,000 for non-shortage
 * occupations). 2-year initial validity, leads to Stamp 4 after 2 years +
 * Irish citizenship 5 years total residence.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/";

// EU/EEA + UK + Swiss exempt — they have right to work in Ireland without
// a permit under EU treaties + the Common Travel Area (UK).
const EXEMPT: ReadonlySet<string> = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT",
  "RO", "SK", "SI", "ES", "SE", "CH", "GB",
]);

export const irelandCriticalSkillsAdapter: Adapter = {
  metadata: {
    id: "ie_critical_skills",
    name: "Ireland Critical Skills Employment Permit (CSEP) — DETE",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    if (!/Critical Skills|CSEP|enterprise\.gov\.ie|employment permit/i.test(raw.rawText)) {
      return { records: [], parseError: "DETE CSEP page did not match expected wording." };
    }
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];
    for (const country of COUNTRY_LIST) {
      if (country.iso2 === "IE" || EXEMPT.has(country.iso2)) continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "IE",
        purpose: "work",
        status: "embassy_visa",
        label: "Ireland Critical Skills Employment Permit (CSEP)",
        maxStayDays: 2 * 365,
        validityDays: 2 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 12,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        requirements: [
          "Confirmed Irish employer offer on the Critical Skills Occupations List",
          "Salary ≥ €38,000 (shortage occupations) OR ≥ €64,000 (non-shortage)",
          "University degree relevant to the role (or equivalent technical experience)",
          "Apostilled academic credentials",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 28,
        applicationUrl: "https://services.enterprise.gov.ie/eapp/",
        primarySourceUrl: SOURCE_URL,
        fees: [{ kind: "base", amountMinor: 100_00, currency: "EUR", asOf: today, optional: false }],
        notes:
          "CSEP is Ireland's premium work permit. Path: 2-year CSEP → Stamp 4 long-term residence (no work-permit dependence) → Irish citizenship after 5 years total residence. Spouse / partner gets Spouse of CSEP Holder Permit with work rights.",
      });
    }
    return { records };
  },
};
