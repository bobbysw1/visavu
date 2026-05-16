/**
 * Vietnam visa suite: e-Visa, Work Permit / TT, Investor / DT, Marriage / TT.
 *
 * Vietnam expanded its e-Visa programme in August 2023 to ALL nationalities,
 * extended validity to 90 days, and allowed multiple entries — a major
 * liberalisation we want to surface clearly.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const VALID_ISO = new Set(COUNTRY_LIST.map((c) => c.iso2));
const ALL = COUNTRY_LIST.map((c) => c.iso2).filter((iso) => iso !== "VN");

const EVISA_URL = "https://evisa.xuatnhapcanh.gov.vn/";
const POLICE_URL = "https://www.xuatnhapcanh.gov.vn/";

export const vietnamSuiteAdapter: Adapter = {
  metadata: {
    id: "vietnam_suite",
    name: "Vietnam visa suite (e-Visa, Work Permit, Investor, Marriage)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [EVISA_URL, POLICE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/vietnam_suite.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "vietnam" }), fetchUrl: "manual://vietnam_suite" };
  },

  async parse() {
    const records: ParsedRecord[] = [];
    for (const passport of ALL) {
      if (!VALID_ISO.has(passport)) continue;

      // ---------- Vietnam e-Visa (expanded to all nationalities Aug 2023) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "VN",
        purpose: "tourism",
        status: "e_visa",
        label: "Vietnam e-Visa (expanded 2023)",
        maxStayDays: 90,
        validityDays: 90,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        proofOfAccommodationRequired: false,
        biometricsRequired: false,
        biometricsLocation: null,
        requirements: [
          "Online application with passport bio-page scan + recent photo",
          "Single or multiple entry up to 90 days",
          "US$25 single-entry / US$50 multiple-entry processing fee",
          "Valid for tourism, business, or visiting friends/family",
        ],
        processingTimeDaysMin: 3,
        processingTimeDaysMax: 5,
        applicationUrl: EVISA_URL,
        primarySourceUrl: EVISA_URL,
        fees: [
          { kind: "base", amountMinor: 5000, currency: "USD", asOf: "2026-05-10", label: "Multiple-entry e-Visa", optional: false },
        ],
        notes:
          "August 2023 reform: Vietnam expanded e-Visa eligibility to ALL nationalities, extended validity from 30 to 90 days, " +
          "and allowed multiple entries. One of the most generous tourism reforms in Southeast Asia.",
      });

      // ---------- Work Permit + Temporary Residence Card (TT) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "VN",
        purpose: "work",
        status: "embassy_visa",
        label: "Work Permit + Temporary Residence Card — Vietnam",
        maxStayDays: 730,
        validityDays: 730,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 12,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        proofOfAccommodationRequired: true,
        biometricsRequired: true,
        biometricsLocation: "Vietnam Immigration Department / embassy",
        requirements: [
          "Work-permit pre-approval from Vietnamese employer (filed via DOLISA)",
          "University degree + 3+ years' relevant experience OR specialised qualification",
          "Health certificate from a hospital approved by Vietnam's Ministry of Health",
          "Police clearance from country of residence (apostilled, translated)",
          "Work-permit valid 2 years; renewable up to 4 more years",
          "Temporary Residence Card (TRC / TT) issued for the same duration",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 60,
        applicationUrl: POLICE_URL,
        primarySourceUrl: POLICE_URL,
        fees: [
          { kind: "base", amountMinor: 1_000_000, currency: "VND", asOf: "2026-05-10", label: "Work permit issuance fee", optional: false },
          { kind: "service", amountMinor: 14_500_000, currency: "VND", asOf: "2026-05-10", label: "TRC issuance fee (typical)", optional: true },
        ],
        notes:
          "Employer-sponsored. Path to permanent residency after 3 years on TRC. Most foreign workers come on this route — Vietnam has no points-based immigration system.",
      });

      // ---------- Investor Visa (DT) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "VN",
        purpose: "work",
        status: "embassy_visa",
        label: "Investor Visa (DT) — Vietnam",
        maxStayDays: 1825,
        validityDays: 1825,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 12,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: true,
        biometricsLocation: "Vietnam embassy / Immigration Department",
        requirements: [
          "DT1: Investment ≥ VND 100 billion (~US$4M) — 5-year visa, 10-year TRC",
          "DT2: Investment VND 50–100 billion — 5-year visa, 5-year TRC",
          "DT3: Investment VND 3–50 billion — 3-year visa, 3-year TRC",
          "DT4: Investment < VND 3 billion — 1-year visa",
          "Vietnam-registered company with valid Investment Registration Certificate",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 60,
        applicationUrl: POLICE_URL,
        primarySourceUrl: POLICE_URL,
        fees: [
          { kind: "base", amountMinor: 5_000_000, currency: "VND", asOf: "2026-05-10", label: "DT visa issuance fee (typical)", optional: false },
        ],
        notes:
          "Four-tier investor visa system reflecting investment size. Spouse and children can accompany. Path to permanent residency after meeting investment commitments.",
      });

      // ---------- Marriage Visa (TT — accompanying close relative) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "VN",
        purpose: "family",
        status: "embassy_visa",
        label: "Marriage / Family Visa (TT) — Vietnam",
        maxStayDays: 1095,
        validityDays: 1095,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 12,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        proofOfAccommodationRequired: true,
        biometricsRequired: false,
        biometricsLocation: null,
        requirements: [
          "Marriage to a Vietnamese citizen registered with Vietnamese authorities",
          "OR: parent / child of a Vietnamese citizen",
          "Sponsor's Vietnamese household registration (Sổ Hộ Khẩu) or ID card",
          "Marriage certificate apostilled and translated into Vietnamese",
          "Renewable; path to permanent residency after 3 years",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 30,
        applicationUrl: POLICE_URL,
        primarySourceUrl: POLICE_URL,
        fees: [
          { kind: "base", amountMinor: 145_000, currency: "VND", asOf: "2026-05-10", label: "TT visa issuance", optional: false },
        ],
        notes:
          "TT category covers spouse, parent, and child of Vietnamese citizens or permanent residents. Up to 3 years per issuance.",
      });
    }
    return { records };
  },
};
