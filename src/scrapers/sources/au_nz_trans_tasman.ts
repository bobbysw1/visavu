/**
 * Trans-Tasman Travel Arrangement — Australia / New Zealand bilateral.
 *
 * Source: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/
 *   special-category-444 (and NZ Immigration equivalent)
 *
 * Australian citizens enter NZ visa-free with indefinite right to live, work
 * and study; New Zealand citizens enter Australia visa-free on a Subclass
 * 444 Special Category Visa granted automatically at the port. Both
 * directions confer effectively-permanent residence rights without an
 * application.
 *
 * The generic visitor adapters previously treated AU↔NZ as standard
 * short-stay; this adapter sets it right for work/family/study purposes
 * where the Trans-Tasman arrangement actually matters.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";

const SOURCE_URL =
  "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/special-category-444";

const PAIRS: Array<[string, string]> = [
  ["AU", "NZ"],
  ["NZ", "AU"],
];

export const auNzTransTasmanAdapter: Adapter = {
  metadata: {
    id: "au_nz_trans_tasman",
    name: "Trans-Tasman Travel Arrangement (AU / NZ)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    if (!/Special Category|444|New Zealand|Trans-Tasman/i.test(raw.rawText)) {
      return { records: [], parseError: "Subclass 444 page did not match expected wording." };
    }
    const records: ParsedRecord[] = [];
    for (const purpose of ["tourism", "business", "work", "study", "family"] as const) {
      for (const [origin, dest] of PAIRS) {
        records.push({
          passportIso2: origin,
          destinationIso2: dest,
          purpose,
          status: "visa_free",
          label:
            origin === "NZ"
              ? "Australia Subclass 444 Special Category Visa (auto-granted on arrival)"
              : "New Zealand visa-free entry under Trans-Tasman Travel Arrangement",
          maxStayDays: null,
          validityDays: null,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 0,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          biometricsRequired: false,
          proofOfAccommodationRequired: false,
          requirements: [
            origin === "NZ" ? "Valid New Zealand passport" : "Valid Australian passport",
            "Subclass 444 (NZ→AU) is auto-granted at the port — no application",
          ],
          processingTimeDaysMin: null,
          processingTimeDaysMax: null,
          applicationUrl: null,
          primarySourceUrl: SOURCE_URL,
          fees: [],
          notes:
            origin === "NZ"
              ? "Australia auto-grants Subclass 444 to New Zealand citizens on arrival. Indefinite right to live and work in Australia; pathway to Australian citizenship under the Direct Citizenship Stream introduced 2023."
              : "New Zealand admits Australian citizens with indefinite right to live, work, and study. Australian citizens do not require a visa or permit; pathway to NZ Permanent Resident status via the Resident Visa.",
        });
      }
    }
    return { records };
  },
};
