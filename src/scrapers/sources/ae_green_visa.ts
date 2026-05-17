/**
 * UAE Green Visa adapter.
 *
 * Source: https://u.ae/en/information-and-services/visa-and-emirates-id/
 *   residence-visas/green-residence-visa
 *
 * Green Visa is a 5-year self-sponsored residence introduced 2022 — no UAE
 * employer needed. Three sub-routes: (a) skilled professionals with AED
 * 15,000+/mo income, (b) freelancers and self-employed with proven income,
 * (c) recent graduates of qualifying institutions. Family inclusion +
 * dependent sponsorship up to children aged 25.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/green-residence-visa";

export const uaeGreenVisaAdapter: Adapter = {
  metadata: {
    id: "ae_green_visa",
    name: "UAE Green Visa (5-year self-sponsored residence)",
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
    if (!/Green Visa|Green Residence|UAE|self-sponsored/i.test(raw.rawText)) {
      return { records: [], parseError: "UAE Green Visa page did not match expected wording." };
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
        label: "UAE Green Visa (5-year self-sponsored residence)",
        maxStayDays: 5 * 365,
        validityDays: 5 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        requirements: [
          "Skilled professional: AED 15,000+/mo income + bachelor's degree + employment contract",
          "OR freelancer/self-employed: ≥ AED 360,000/yr proven income over 2 prior tax years + Ministry of Human Resources & Emiratisation freelancer permit",
          "OR investor: AED 1M+ business investment OR AED 500,000+ in a UAE Federal Tax Authority-recognised commercial undertaking",
          "Apostilled credentials + UAE medical fitness test + Emirates ID enrolment",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 60,
        applicationUrl: "https://icp.gov.ae/",
        primarySourceUrl: SOURCE_URL,
        fees: [{ kind: "base", amountMinor: 280_000, currency: "AED", asOf: today, optional: false }],
        notes:
          "Green Visa decouples residence from UAE employer sponsorship — significant freedom vs the traditional kafala-style work visa. Family inclusion: spouse + children to 25. Holders can sponsor parents. No personal income tax. UAE Golden Visa (10-yr) is the longer / higher-threshold alternative.",
      });
    }
    return { records };
  },
};
