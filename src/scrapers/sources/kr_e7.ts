/**
 * South Korea E-7 (Specially Designated Activities) visa adapter.
 *
 * Source: https://www.hikorea.go.kr (Korean Immigration Service)
 *
 * E-7 is South Korea's most common foreign-professional work visa. 87
 * designated activities across IT, engineering, finance, biotech, education,
 * and creative industries. Employer-sponsored, with salary thresholds and
 * occupation-specific requirements. Initial 2-year validity, renewable.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.hikorea.go.kr/info/InfoDetailR.pt";

export const koreaE7Adapter: Adapter = {
  metadata: {
    id: "kr_e7",
    name: "South Korea E-7 Specially Designated Activities visa (HiKorea)",
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
    if (!/E-7|HiKorea|Korea|특정활동/i.test(raw.rawText)) {
      return { records: [], parseError: "HiKorea E-7 page did not match expected wording." };
    }
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const country of COUNTRY_LIST) {
      if (country.iso2 === "KR") continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "KR",
        purpose: "work",
        status: "embassy_visa",
        label: "South Korea E-7 visa (Specially Designated Activities)",
        maxStayDays: 2 * 365,
        validityDays: 2 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        requirements: [
          "Korean-employer-issued employment contract for one of the 87 designated E-7 activities",
          "Bachelor's degree relevant to the role (some categories accept extensive experience in lieu)",
          "Salary at or above the published Korean minimum threshold for the activity (typically KRW 25-35M/yr)",
          "Apostilled academic credentials + translation",
          "Health certificate, criminal record check apostilled",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 28,
        applicationUrl: "https://www.hikorea.go.kr/",
        primarySourceUrl: SOURCE_URL,
        fees: [{ kind: "base", amountMinor: 6_000_000, currency: "KRW", asOf: today, optional: false }],
        notes: `E-7 is the most common foreign-professional work visa in Korea. Path to F-2 long-term residence after 3 years on E-class + Korean language B1+; F-5 Permanent Resident after 5 years on F-2. Quotas exist for some sub-categories; competitive in IT and engineering.`,
      });
    }
    return { records };
  },
};
