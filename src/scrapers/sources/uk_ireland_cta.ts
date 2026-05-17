/**
 * Common Travel Area (CTA) — UK / Ireland / Crown Dependencies bilateral.
 *
 * Source: https://www.gov.uk/government/publications/common-travel-area-guidance
 *
 * Irish citizens enter, live, work, study, and vote in the UK without any
 * visa or immigration permission — and vice versa. The Common Travel Area
 * is older than the EU and survives Brexit. The same rights extend to
 * residents of Guernsey, Jersey, and the Isle of Man (Crown Dependencies)
 * for travel within the CTA.
 *
 * Before this adapter existed, IE→GB and GB→IE were treated through the
 * generic visa adapters (incorrectly classifying these as visa-required
 * for work / family). The CTA gives Irish/British citizens a special
 * residence right that's distinct from EU freedom of movement (which the
 * UK left in 2020).
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";

const SOURCE_URL =
  "https://www.gov.uk/government/publications/common-travel-area-guidance";

// CTA bilateral pairs — visa-free with full residence/work/study rights.
const CTA_PAIRS: Array<[string, string]> = [
  ["IE", "GB"],
  ["GB", "IE"],
  ["GG", "GB"], ["GG", "IE"],
  ["JE", "GB"], ["JE", "IE"],
  ["IM", "GB"], ["IM", "IE"],
];

export const ukIrelandCtaAdapter: Adapter = {
  metadata: {
    id: "uk_ireland_cta",
    name: "Common Travel Area (UK / Ireland / Crown Dependencies)",
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
    if (!/Common Travel Area|CTA|Ireland|Irish citizen/i.test(raw.rawText)) {
      return { records: [], parseError: "gov.uk CTA page did not match expected wording." };
    }

    const records: ParsedRecord[] = [];
    for (const purpose of ["tourism", "business", "work", "study", "family"] as const) {
      for (const [origin, dest] of CTA_PAIRS) {
        records.push({
          passportIso2: origin,
          destinationIso2: dest,
          purpose,
          status: "visa_free",
          label: "Common Travel Area — no visa, no permission required",
          maxStayDays: null,
          validityDays: null,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 0,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          biometricsRequired: false,
          proofOfAccommodationRequired: false,
          requirements: [
            "Valid passport (or other approved CTA identity document)",
            "No immigration permission required",
          ],
          processingTimeDaysMin: null,
          processingTimeDaysMax: null,
          applicationUrl: null,
          primarySourceUrl: SOURCE_URL,
          fees: [],
          notes:
            origin === "IE" || dest === "IE"
              ? "Irish and British citizens enter, live, work, and vote in each other's countries without immigration permission under the Common Travel Area. The arrangement predates the EU and survived Brexit. No visa, no permit, no time limit."
              : "Crown Dependency residents (Guernsey, Jersey, Isle of Man) travel within the CTA freely on their local passport.",
        });
      }
    }
    return { records };
  },
};
