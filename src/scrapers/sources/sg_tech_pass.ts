/**
 * Singapore Tech.Pass adapter.
 *
 * Source: https://www.edb.gov.sg/en/how-we-help/incentives-and-schemes/
 *   tech-pass.html
 *
 * Tech.Pass is Singapore's premium residence for established tech founders
 * / leaders. 2-year initial validity, renewable to 3-year extensions. Open
 * to non-Singaporean tech professionals meeting 2 of 3 criteria: last drawn
 * salary ≥ SGD 22,500/mo, 5+ years lead role at ≥ SGD 500M valuation tech
 * company, OR 5+ years lead role on a tech product with ≥ 100k MAU /
 * ≥ SGD 100M revenue.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://www.edb.gov.sg/en/how-we-help/incentives-and-schemes/tech-pass.html";

export const singaporeTechPassAdapter: Adapter = {
  metadata: {
    id: "sg_tech_pass",
    name: "Singapore Tech.Pass — EDB",
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
    if (!/Tech\.Pass|Tech Pass|Singapore|EDB/i.test(raw.rawText)) {
      return { records: [], parseError: "Singapore EDB Tech.Pass page did not match expected wording." };
    }
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];
    for (const country of COUNTRY_LIST) {
      if (country.iso2 === "SG") continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "SG",
        purpose: "work",
        status: "embassy_visa",
        label: "Singapore Tech.Pass (established tech founders / senior leaders)",
        maxStayDays: 2 * 365,
        validityDays: 2 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        requirements: [
          "Meet 2 of 3 criteria: (a) last drawn salary ≥ SGD 22,500/mo, (b) 5+ years lead role at tech company with ≥ SGD 500M valuation or ≥ SGD 50M funding, (c) 5+ years lead role on a tech product with ≥ 100k MAU OR ≥ SGD 100M revenue",
          "Cap of 500 Tech.Pass-holders globally in the inaugural cohort (renewable)",
          "Apostilled credentials + employment / equity history",
        ],
        processingTimeDaysMin: 21,
        processingTimeDaysMax: 60,
        applicationUrl: "https://www.mom.gov.sg/passes-and-permits/tech-pass",
        primarySourceUrl: SOURCE_URL,
        fees: [{ kind: "base", amountMinor: 22_500, currency: "SGD", asOf: today, optional: false }],
        notes:
          "Tech.Pass is more flexible than the Employment Pass — holders can start a company, work for multiple Singapore-based employers, serve on boards, mentor, lecture. Spouse Letter of Consent allows the spouse to work without a separate pass. The premium-tier Overseas Networks & Expertise (ONE) Pass — separate adapter — sits above Tech.Pass for SGD 30,000+/mo earners.",
      });
    }
    return { records };
  },
};
