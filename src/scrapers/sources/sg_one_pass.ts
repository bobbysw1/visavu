/**
 * Singapore ONE Pass (Overseas Networks & Expertise Pass) adapter.
 *
 * Source: https://www.mom.gov.sg/passes-and-permits/overseas-networks-expertise-pass
 *
 * ONE Pass is Singapore's premium long-stay route for top global earners and
 * specialists — S$30,000+ monthly fixed salary OR exceptional achievement
 * across business, arts, science, sports, academia. 5-year renewable;
 * spouse can also work without restriction.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://www.mom.gov.sg/passes-and-permits/overseas-networks-expertise-pass";

export const singaporeOnePassAdapter: Adapter = {
  metadata: {
    id: "sg_one_pass",
    name: "Singapore Overseas Networks & Expertise (ONE) Pass",
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
    if (!/ONE Pass|Overseas Networks|Expertise/i.test(raw.rawText)) {
      return { records: [], parseError: "Singapore MOM ONE Pass page did not match expected wording." };
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
        label: "Singapore ONE Pass (Overseas Networks & Expertise)",
        maxStayDays: 5 * 365,
        validityDays: 5 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        requirements: [
          "Monthly fixed salary ≥ SGD 30,000 from the past 12 months OR offered by a Singapore-based employer at that level",
          "OR exceptional achievement in arts/culture, sports, science/technology, or academia/research",
          "Apostilled credentials + employment evidence + tax returns where applicable",
          "Application via MyMOM Portal",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 60,
        applicationUrl: SOURCE_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base", amountMinor: 22_500, currency: "SGD", asOf: today, optional: false },
        ],
        notes: `ONE Pass is the premium of Singapore's three top-talent passes (Employment Pass, Tech.Pass, ONE Pass). 5-year renewable, multi-employer (you can work for several Singapore companies on the same pass). Spouse Letter of Consent allows the spouse to work without a separate work pass.`,
      });
    }
    return { records };
  },
};
