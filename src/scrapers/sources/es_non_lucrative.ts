/**
 * Spain Non-Lucrative Visa (NLV) adapter.
 *
 * Source: https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Servicios-Consulares/Visados.aspx
 *
 * NLV is Spain's primary passive-income / retirement residence path. ~€2,400/mo
 * income required (400% IPREM for primary applicant + 100% per dependent).
 * 1-year initial visa; renewable to 2-year residence card; permanent
 * residence after 5 years. Explicitly prohibits work in Spain.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Servicios-Consulares/Visados.aspx";

// EU/EEA + Schengen nationals don't need this visa — they have freedom of
// movement. Exclude from emission.
const EU_EEA_EXEMPT: ReadonlySet<string> = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
  "PT", "RO", "SK", "SI", "SE", "CH",
]);

export const spainNonLucrativeAdapter: Adapter = {
  metadata: {
    id: "es_non_lucrative",
    name: "Spain Non-Lucrative Visa (NLV)",
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
    if (!/visado|Spain|residencia|exteriores/i.test(raw.rawText)) {
      return { records: [], parseError: "Exteriores page did not match expected wording." };
    }
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const country of COUNTRY_LIST) {
      if (country.iso2 === "ES" || EU_EEA_EXEMPT.has(country.iso2)) continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "ES",
        purpose: "family",
        status: "embassy_visa",
        label: "Spain Non-Lucrative Visa (residencia no lucrativa)",
        maxStayDays: 365,
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        requirements: [
          "Passive income ≥ 400% IPREM for primary applicant (~€2,400/mo in 2024) + 100% per dependent",
          "Comprehensive private health insurance covering Spain (no copays, full coverage)",
          "Apostilled criminal record from country of residence + Spanish translation",
          "Health certificate from authorised medical clinic",
          "Cannot engage in any economic activity / work in Spain",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 90,
        applicationUrl: SOURCE_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base", amountMinor: 8_000, currency: "EUR", asOf: today, optional: false },
        ],
        notes: `NLV is for passive-income holders only — no work permitted. 1-year initial visa, renewable to 2-year residence card; permanent residence after 5 years; Spanish citizenship after 10 years (2 years for Iberoamerican/Spanish-speaking applicants). Beckham Law flat-tax election is NOT available for NLV — only for employment-based residence (DNV, Highly Qualified Professional).`,
      });
    }
    return { records };
  },
};
