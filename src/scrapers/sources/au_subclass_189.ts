/**
 * Australia Subclass 189 (Skilled Independent) visa adapter.
 *
 * Source: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/
 *   skilled-independent-189
 *
 * Subclass 189 is the points-based independent-skilled-migration route —
 * NO employer sponsor required, NO state/territory nomination. Grants
 * permanent residence direct. Requires positive Skills Assessment + 65+
 * points + occupation on the relevant Skilled Occupation List + invitation
 * to apply via SkillSelect.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189";

export const auSubclass189Adapter: Adapter = {
  metadata: {
    id: "au_subclass_189",
    name: "Australia Subclass 189 Skilled Independent — Home Affairs",
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
    if (!/Subclass 189|Skilled Independent|SkillSelect|Australia/i.test(raw.rawText)) {
      return { records: [], parseError: "Subclass 189 page did not match expected wording." };
    }
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];
    for (const country of COUNTRY_LIST) {
      if (country.iso2 === "AU") continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "AU",
        purpose: "work",
        status: "embassy_visa",
        label: "Australia Subclass 189 Skilled Independent (permanent direct)",
        maxStayDays: null,
        validityDays: null,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 12,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        requirements: [
          "Positive Skills Assessment from the relevant ANZSCO assessing authority",
          "Points test score ≥ 65 (invitation cutoffs typically 90+)",
          "Occupation on the Medium and Long-term Strategic Skills List",
          "Competent English (IELTS 6.0 across each band OR equivalent)",
          "Under 45 years at invitation",
          "Health + character + police certificates from every country lived 12+ months in 10 years",
        ],
        processingTimeDaysMin: 240,
        processingTimeDaysMax: 540,
        applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
        primarySourceUrl: SOURCE_URL,
        fees: [{ kind: "base", amountMinor: 488_500, currency: "AUD", asOf: today, optional: false }],
        notes:
          "Subclass 189 grants permanent residence on a single application — no employer dependency, no state nomination. Invitation cutoffs vary by occupation; competitive STEM and healthcare cohorts typically score 95-105 points. Australian citizenship after 4 years residence including 12 months as PR.",
      });
    }
    return { records };
  },
};
