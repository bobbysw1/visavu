/**
 * Germany national Skilled Worker visa adapter (Skilled Workers Act 2.0).
 *
 * Source: https://www.make-it-in-germany.com/en/visa-residence/types
 *
 * This is the D-class national long-stay visa for skilled workers outside
 * the EU Blue Card. Covers vocationally trained workers, university
 * graduates, and the Chancenkarte (Opportunity Card) job-seeker pathway
 * launched in 2024.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.make-it-in-germany.com/en/visa-residence/types";

export const germanySkilledWorkerAdapter: Adapter = {
  metadata: {
    id: "de_skilled_worker",
    name: "Germany Skilled Worker visa (D-class, Skilled Workers Act 2.0)",
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
    if (!/skilled worker|Fachkräfte|Germany|visa/i.test(raw.rawText)) {
      return { records: [], parseError: "Make-it-in-Germany page did not match expected wording." };
    }
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const country of COUNTRY_LIST) {
      if (country.iso2 === "DE") continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "DE",
        purpose: "work",
        status: "embassy_visa",
        label: "Germany Skilled Worker visa (Fachkräfteeinwanderungsgesetz)",
        maxStayDays: 4 * 365,
        validityDays: 4 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 12,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        requirements: [
          "Recognised vocational qualification OR university degree (ANABIN evaluation if foreign)",
          "Confirmed German employer offer in a qualifying occupation",
          "Salary at the German market rate for the role (typically €40,000+)",
          "German A1+ language for most non-shortage occupations (B1 for some regulated roles)",
          "Apostilled credentials + sworn German translation",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 90,
        applicationUrl: "https://www.make-it-in-germany.com/en/visa-residence",
        primarySourceUrl: SOURCE_URL,
        fees: [{ kind: "base", amountMinor: 7_500, currency: "EUR", asOf: today, optional: false }],
        notes: `Skilled Worker visa is the D-class national alternative to the EU Blue Card. Path to Niederlassungserlaubnis (settlement permit) after 4 years on Skilled Worker; German citizenship 5 years post-2024 reform with B1 German + integration. The 2024 Skilled Workers Act 2.0 also introduced the Chancenkarte (Opportunity Card) — a points-based job-seeker visa for skilled workers without an offer in hand.`,
      });
    }
    return { records };
  },
};
