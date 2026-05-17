/**
 * Japan Highly Skilled Foreign Professional (HSP) point-based visa adapter.
 *
 * Source: https://www.moj.go.jp/isa/applications/procedures/16_00025.html
 *
 * HSP is Japan's point-based work residence. 70+ points = 3-year fast-track to
 * permanent residence; 80+ points = 1-year fast-track. Categories: HSP-i
 * (advanced academic research), HSP-ii (specialised technical/humanities),
 * HSP-iii (business management).
 *
 * Open to most nationalities — emits records for every visa-required and
 * visa-exempt nationality that could be sponsored by a Japanese employer.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://www.moj.go.jp/isa/applications/procedures/16_00025.html";

export const japanHspAdapter: Adapter = {
  metadata: {
    id: "jp_hsp",
    name: "Japan Highly Skilled Foreign Professional visa (J-Find / J-Skip)",
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
    if (!/Highly Skilled|高度専門職|HSP|skilled professional/i.test(raw.rawText)) {
      return { records: [], parseError: "Japan ISA HSP page did not match expected wording." };
    }

    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const country of COUNTRY_LIST) {
      if (country.iso2 === "JP") continue;
      records.push({
        passportIso2: country.iso2,
        destinationIso2: "JP",
        purpose: "work",
        status: "embassy_visa",
        label: "Japan Highly Skilled Foreign Professional visa (HSP)",
        maxStayDays: 5 * 365,
        validityDays: 5 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        requirements: [
          "Certificate of Eligibility (CoE) filed by Japanese employer with Immigration Services Agency",
          "HSP point score ≥70 (age + education + Japanese language + research output + employer size + annual income)",
          "University-equivalent or higher qualification (typically Master's+ for HSP-i; Bachelor's+ for HSP-ii)",
          "Confirmed Japanese employment contract or academic position",
          "Apostilled academic credentials + translation",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 90,
        applicationUrl: "https://www.moj.go.jp/isa/applications/procedures/16_00025.html",
        primarySourceUrl: SOURCE_URL,
        fees: [{ kind: "base", amountMinor: 0, currency: "JPY", asOf: today, optional: false }],
        notes: `HSP point system: 70+ points = 3-year fast-track to permanent residence; 80+ points = 1-year. Standard Engineer / Specialist in Humanities visa is the slower 10-year PR alternative. Japanese employer's CoE filing is the operative step — visa stamping at Japanese embassy abroad is the formality.`,
      });
    }

    return { records };
  },
};
