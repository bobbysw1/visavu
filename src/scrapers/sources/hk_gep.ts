/**
 * Hong Kong General Employment Policy (GEP) adapter.
 *
 * Source: https://www.immd.gov.hk/eng/services/visas/employment-non-local.html
 *
 * GEP is HK's standard employer-sponsored work residence. Open to most
 * nationalities; HK ImmD assesses the candidate's specialised skills vs the
 * availability of HK residents to do the job. 12-24 month initial validity,
 * renewable. Right of Abode after 7 years continuous ordinary residence.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.immd.gov.hk/eng/services/visas/employment-non-local.html";

// Mainland Chinese passport holders use a separate ImmD pathway (Admission
// Scheme for Mainland Talents and Professionals — ASMTP), not GEP. Exclude.
const GEP_EXCLUDED: ReadonlySet<string> = new Set(["CN", "HK", "MO"]);

export const hkGepAdapter: Adapter = {
  metadata: {
    id: "hk_gep",
    name: "Hong Kong General Employment Policy (GEP) — ImmD",
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
    if (!/General Employment|GEP|employment|Hong Kong/i.test(raw.rawText)) {
      return { records: [], parseError: "HK ImmD GEP page did not match expected wording." };
    }
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const country of COUNTRY_LIST) {
      if (GEP_EXCLUDED.has(country.iso2)) continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "HK",
        purpose: "work",
        status: "embassy_visa",
        label: "Hong Kong General Employment Policy (GEP)",
        maxStayDays: 2 * 365,
        validityDays: 2 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        requirements: [
          "Confirmed Hong Kong employment offer at prevailing market salary",
          "Specialised skills or qualifications not readily available in the HK labour market",
          "Bachelor's degree or higher (or substantial relevant experience)",
          "Sponsoring HK employer provides Form ID 990A and supporting documentation",
          "Clean criminal record from country of residence",
        ],
        processingTimeDaysMin: 28,
        processingTimeDaysMax: 56,
        applicationUrl: SOURCE_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [{ kind: "base", amountMinor: 23_000, currency: "HKD", asOf: today, optional: false }],
        notes: `GEP is HK's standard employer-sponsored work visa. 12-24 month initial validity; subsequent extensions 2-3-3 years pattern. Right of Abode (effectively HK citizenship) after 7 years continuous ordinary residence. Mainland Chinese applicants use ASMTP — a separate parallel scheme — not GEP.`,
      });
    }
    return { records };
  },
};
