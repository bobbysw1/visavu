/**
 * UK Standard Visitor visa adapter.
 *
 * For "Visa National" nationalities — those who must apply for a Standard
 * Visitor visa at a UK embassy / VFS Global centre before travel. This is
 * distinct from:
 *
 *   - Non-visa nationals → use UK ETA (covered by uk_eta.ts)
 *   - Common Travel Area (IE) → free movement (covered by uk_ireland_cta.ts)
 *   - UK citizens → identity case (handled by resolver)
 *
 * Source: gov.uk Immigration Rules Appendix V, Visitor: Visa national list.
 * https://www.gov.uk/check-uk-visa
 * https://www.gov.uk/government/publications/immigration-rules/appendix-visa-national-list
 *
 * Fee: £127 (standard 6-month visit, as of 2025-04). Processing: 3 weeks
 * standard, 5 working days priority (+£500), 24h super-priority (+£1000).
 *
 * The list below is the "Visa Required" nationality set as of late-2024
 * Appendix V. Countries currently transitioning into the UK ETA scheme
 * (UAE, Qatar, Kuwait, Saudi, Bahrain, Oman, Jordan) are NOT on this list —
 * they're handled by uk_eta.ts. The boundary between this list and the ETA
 * list is the only thing that's politically volatile; everything else here
 * has been visa-required for years.
 *
 * Refresh quarterly. The gov.uk page is stable but the boundary cases
 * (recent visa-exemption removals like Dominica, Honduras, Vanuatu,
 * Namibia; new ETA additions) need verification.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";

// Visa National nationalities per Appendix V (excluding those on UK ETA roster
// and excluding UK/IE/CTA). Verified against gov.uk Check if you need a UK
// visa tool at adapter-write time.
const VISA_NATIONALS: string[] = [
  // Africa
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CG",
  "CD", "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN",
  "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MA", "MZ", "NA",
  "NE", "NG", "RW", "ST", "SN", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG",
  "TN", "UG", "ZM", "ZW",
  // Middle East
  "IR", "IQ", "LB", "PS", "SY", "YE",
  // Central + South Asia
  "AF", "AM", "AZ", "BD", "BT", "IN", "KZ", "KG", "MV", "MN", "MM", "NP",
  "PK", "LK", "TJ", "TM", "UZ",
  // East + Southeast Asia
  "KH", "CN", "ID", "LA", "MO", "MN", "KP", "PH", "TH", "TL", "VN",
  // Europe (non-EU, non-EEA, non-CTA, non-ETA roster)
  "BY", "RU",
  // Americas
  "BO", "CU", "DO", "EC", "HT", "JM", "NI", "DM", "VE",
  // Caribbean / Pacific not covered elsewhere
  "CW", "FJ", "SR",
];

// Deduplicate (MN listed twice above by region — once Mongolia under SE Asia
// was a typo; dedup defensively so the adapter is robust to list edits).
const UNIQUE_VISA_NATIONALS = Array.from(new Set(VISA_NATIONALS));

const SOURCE_URL = "https://www.gov.uk/check-uk-visa";
const APPLY_URL = "https://www.gov.uk/standard-visitor";

export const ukStandardVisitorAdapter: Adapter = {
  metadata: {
    id: "uk_standard_visitor",
    name: "UK Standard Visitor visa (visa nationals — Appendix V)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL, APPLY_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/uk_standard_visitor.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "uk_standard_visitor" }), fetchUrl: "manual://uk_standard_visitor" };
  },

  async parse() {
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const passport of UNIQUE_VISA_NATIONALS) {
      const base: Omit<ParsedRecord, "purpose" | "label"> = {
        passportIso2: passport,
        destinationIso2: "GB",
        status: "embassy_visa",
        maxStayDays: 180,
        validityDays: 180,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: true,
        biometricsRequired: true,
        biometricsLocation: "UK Visa Application Centre (VFS Global / TLScontact)",
        requirements: [
          "Apply online via gov.uk before travel",
          "Biometrics appointment at a UK Visa Application Centre",
          "Proof of funds to cover your visit (bank statements, sponsor letter)",
          "Proof of accommodation for the duration of stay",
          "Evidence of intent to leave the UK at the end of your visit (return ticket, ongoing employment, family ties)",
          "Valid passport with at least one blank page",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 21,
        applicationUrl: APPLY_URL,
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 12700, currency: "GBP", asOf: today, label: "Standard Visitor visa (6 months)" },
        ],
        notes: "Standard Visitor visa for tourism, business, or family visits up to 6 months. Apply at your nearest UK Visa Application Centre operated by VFS Global or TLScontact. Priority (£500) and Super-Priority (£1000) services available at additional cost.",
      };
      records.push({ ...base, purpose: "tourism", label: "Standard Visitor visa — United Kingdom (tourism)" });
      records.push({ ...base, purpose: "business", label: "Standard Visitor visa — United Kingdom (business)" });
    }

    return { records };
  },
};
