/**
 * Canada Provincial Nominee Program (PNP) adapter — meta-programme overview.
 *
 * Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/
 *   immigrate-canada/provincial-nominees.html
 *
 * PNP isn't a single visa — each Canadian province (except Quebec, which
 * runs its own programme; and the territories which use a federal stream)
 * operates its own nomination streams. This adapter emits a meta-record per
 * passport that surfaces the overall PNP route, with notes pointing at the
 * provincial sub-programmes.
 *
 * The actual per-province eligibility lists are too dynamic to inline —
 * Express Entry-linked PNPs draw bi-weekly with shifting CRS cutoffs. This
 * record explains the framework and the headline thresholds.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html";

export const canadaPnpAdapter: Adapter = {
  metadata: {
    id: "ca_pnp",
    name: "Canada Provincial Nominee Programs (PNP) — IRCC",
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
    if (!/Provincial Nominee|PNP|provincial nominees|Canada/i.test(raw.rawText)) {
      return { records: [], parseError: "IRCC PNP page did not match expected wording." };
    }
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];
    for (const country of COUNTRY_LIST) {
      if (country.iso2 === "CA") continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "CA",
        purpose: "work",
        status: "embassy_visa",
        label: "Canada Provincial Nominee Programs (PNP) — per-province nomination",
        maxStayDays: null,
        validityDays: null,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        requirements: [
          "Provincial nomination from one of: Ontario (OINP), BC (BC PNP), Alberta (AAIP), Saskatchewan (SINP), Manitoba (MPNP), Nova Scotia (NSNP), New Brunswick (NB PNP), PEI (PEI PNP), Newfoundland (NLPNP)",
          "Express Entry profile (most provinces use Express Entry-linked streams adding 600 CRS points)",
          "Eligibility varies by province: most demand connections to the province (employment offer, education, family), some have stream-specific lists",
          "Language test (IELTS / CELPIP / TEF / TCF)",
          "ECA for foreign credentials (WES)",
          "Settlement funds varying by family size (~CAD$13,757 single / CAD$17,127 couple in 2024)",
        ],
        processingTimeDaysMin: 90,
        processingTimeDaysMax: 540,
        applicationUrl: SOURCE_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [{ kind: "base", amountMinor: 136_500, currency: "CAD", asOf: today, optional: false }],
        notes:
          "PNP is the second-largest economic-immigration channel after Express Entry FSW. Saskatchewan, Manitoba, Alberta and the Atlantic provinces are typically more accessible than Ontario / BC. Express Entry-linked streams give a 600-point CRS boost — making invitation effectively guaranteed at the next draw. Direct-to-PR.",
      });
    }
    return { records };
  },
};
