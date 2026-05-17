/**
 * UAE Golden Visa adapter.
 *
 * Source: https://u.ae/en/information-and-services/visa-and-emirates-id/
 *   residence-visas/long-term-residence-visa-golden-visa
 *
 * UAE Golden Visa: 5- or 10-year renewable residence for investors,
 * specialists, exceptional talents, entrepreneurs, retirees, and exceptional
 * students. Multiple eligibility categories with different thresholds —
 * AED 2M+ property/investment is the investor route.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/long-term-residence-visa-golden-visa";

export const uaeGoldenVisaAdapter: Adapter = {
  metadata: {
    id: "ae_golden_visa",
    name: "UAE Golden Visa (long-term residence — Federal Authority for Identity)",
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
    if (!/Golden Visa|long-term residence|UAE/i.test(raw.rawText)) {
      return { records: [], parseError: "UAE Golden Visa page did not match expected wording." };
    }

    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const country of COUNTRY_LIST) {
      if (country.iso2 === "AE") continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "AE",
        purpose: "work",
        status: "embassy_visa",
        label: "UAE Golden Visa (10-year renewable; investor / specialist / talent)",
        maxStayDays: 10 * 365,
        validityDays: 10 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        requirements: [
          "AED 2,000,000+ investment in property OR UAE-licensed enterprise (Investor route), OR",
          "PhD / specialised expertise + UAE-employer sponsorship at AED 30,000+/mo (Specialist route), OR",
          "AED 1,000,000 deposit + 55+ years for retirees, OR",
          "Federal/Emirate-level approval as Exceptional Talent (arts, sports, science, business)",
          "Clean police certificate from country of residence",
          "Medical fitness test + Emirates ID enrolment after arrival",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 90,
        applicationUrl: "https://icp.gov.ae/",
        primarySourceUrl: SOURCE_URL,
        fees: [{ kind: "base", amountMinor: 280_000, currency: "AED", asOf: today, optional: false }],
        notes: `Golden Visa is the UAE's premium long-stay residence — 10-year renewable, sponsor-independent, family inclusion. No personal income tax in the UAE. Holder can sponsor immediate family and up to 1 domestic worker. Doesn't lead to UAE citizenship in the traditional sense — citizenship is rarely granted to non-Emiratis.`,
      });
    }
    return { records };
  },
};
