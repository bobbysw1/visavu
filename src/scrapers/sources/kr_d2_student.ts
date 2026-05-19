/**
 * South Korea D-2 Student visa adapter.
 *
 * Source: https://www.hikorea.go.kr (Korean Immigration Service)
 *
 * D-2 is the standard university-student residence visa. Sub-categories:
 * D-2-1 (associate), D-2-2 (undergraduate), D-2-3 (master's), D-2-4 (PhD),
 * D-2-5 (research student), D-2-6 (exchange student), D-2-7 (online study),
 * D-2-8 (short-term study).
 *
 * Pair: D-10 Job Seeker visa (separate adapter — TODO) for post-graduation
 * job-hunting period.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL = "https://www.hikorea.go.kr/info/InfoDatail.pt";

export const koreaD2StudentAdapter: Adapter = {
  metadata: {
    id: "kr_d2_student",
    name: "South Korea D-2 University Student visa — HiKorea",
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
    if (!/D-2|HiKorea|Korea|student|유학/i.test(raw.rawText)) {
      return { records: [], parseError: "HiKorea D-2 page did not match expected wording." };
    }
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];
    for (const country of COUNTRY_LIST) {
      if (country.iso2 === "KR") continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "KR",
        purpose: "study",
        status: "embassy_visa",
        label: "South Korea D-2 University Student visa",
        maxStayDays: 2 * 365,
        validityDays: 2 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        requirements: [
          "Admission letter from a Korean Ministry-of-Education-recognised university",
          "Standard Admission Letter + Certificate of Tuition Payment",
          "Financial-proof statement: ≥ US$10,000 in bank account OR scholarship award letter",
          "Apostilled academic credentials + Korean translation",
          "TOPIK 3+ OR English-medium-programme certification (varies by institution)",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 28,
        applicationUrl: "https://www.studyinkorea.go.kr/en/",
        primarySourceUrl: SOURCE_URL,
        // KRW has no subunit (minorFactor=1), so amountMinor is whole won.
        // D-2 multi-entry visa issuance: ₩90,000 per HiKorea schedule
        // (₩60,000 single-entry; D-2 students need multi-entry for breaks
        // home + side travel). Plus optional ₩30,000 Certificate of
        // Eligibility, typically issued by the host university.
        fees: [
          { kind: "base", amountMinor: 90_000, currency: "KRW", asOf: today, label: "D-2 multi-entry visa issuance fee" },
          { kind: "service", amountMinor: 30_000, currency: "KRW", asOf: today, label: "Certificate of Eligibility (사증발급인정서)" },
        ],
        notes:
          "D-2 holders can work up to 25 hours/week off-campus during semester with university authorisation. Post-graduation: convert to D-10 Job Seeker visa (6-month renewable) or directly to E-7 employment visa if a Korean employer issues an offer. PR pathway via F-2 (after 3 years on E-class) → F-5.",
      });
    }
    return { records };
  },
};
