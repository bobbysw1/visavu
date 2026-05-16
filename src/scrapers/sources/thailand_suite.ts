/**
 * Thailand visa suite — covers the major long-stay programs beyond tourism:
 *
 *  - Destination Thailand Visa (DTV)            — work, lifestyle, soft-skills
 *  - Education Visa (Non-Immigrant ED)          — language schools / universities
 *  - Retirement Visa (Non-Immigrant O-A / O-X)  — age 50+ savers / pensioners
 *  - Marriage Visa (Non-Immigrant O)            — married to a Thai national
 *  - Business Visa (Non-Immigrant B)            — employer-sponsored work
 *  - Smart Visa (S / T / I / E / O)             — tech talent / startup / investor
 *
 * Sources: Royal Thai MFA (mfa.go.th), Thai Immigration Bureau (immigration.go.th),
 * Smart Visa programme (smart-visa.boi.go.th), DTV portal (thaievisa.go.th).
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const VALID_ISO = new Set(COUNTRY_LIST.map((c) => c.iso2));
const ALL_PASSPORTS = COUNTRY_LIST.map((c) => c.iso2).filter((iso) => iso !== "TH");

const MFA_VISA_PORTAL = "https://www.thaievisa.go.th/";
const IMMIGRATION_BUREAU = "https://www.immigration.go.th/";
const SMART_VISA_URL = "https://smart-visa.boi.go.th/";
const DTV_URL = "https://www.thaievisa.go.th/";

export const thailandSuiteAdapter: Adapter = {
  metadata: {
    id: "thailand_suite",
    name: "Thailand visa suite (DTV, ED, Retirement, Marriage, Business, Smart)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [MFA_VISA_PORTAL, IMMIGRATION_BUREAU, SMART_VISA_URL, DTV_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/thailand_suite.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "thailand_suite" }), fetchUrl: "manual://thailand_suite" };
  },

  async parse() {
    const records: ParsedRecord[] = [];
    for (const passport of ALL_PASSPORTS) {
      if (!VALID_ISO.has(passport)) continue;

      // ---------- DTV (Destination Thailand Visa) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "TH",
        purpose: "work",
        status: "e_visa",
        label: "Destination Thailand Visa (DTV)",
        maxStayDays: 180,
        validityDays: 1825, // 5-year visa, 180-day stays
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: false,
        biometricsLocation: null,
        requirements: [
          "Foreign-source income or evidence of remote work / freelance",
          "Minimum ฿500,000 (~US$14,000) in bank savings",
          "Health insurance covering Thailand",
          "OR: enrolled in a soft-power activity (Muay Thai, Thai cooking, Thai language, etc.)",
          "OR: dependent of a DTV holder (spouse, children under 20)",
        ],
        processingTimeDaysMin: 7,
        processingTimeDaysMax: 21,
        applicationUrl: DTV_URL,
        primarySourceUrl: DTV_URL,
        fees: [
          { kind: "base", amountMinor: 1_000_000, currency: "THB", asOf: "2026-05-10", label: "DTV application fee", optional: false },
        ],
        notes:
          "Launched July 2024. 5-year multi-entry visa with 180-day stays per entry (extendable +180 days). " +
          "Open to remote workers, digital nomads, freelancers, and people pursuing 'soft-power' activities. Family inclusion supported.",
      });

      // ---------- Education Visa (Non-Immigrant ED) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "TH",
        purpose: "study",
        status: "embassy_visa",
        label: "Education Visa (Non-Immigrant ED) — Thailand",
        maxStayDays: 90,
        validityDays: 90,
        entriesAllowed: "single",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: true,
        biometricsRequired: false,
        biometricsLocation: null,
        requirements: [
          "Acceptance letter from a Ministry-of-Education-accredited Thai institution",
          "Tuition payment confirmation (at least the first installment)",
          "Bank statement showing ฿20,000+ available",
          "Police clearance certificate (some embassies)",
          "Renewable in-country every 90 days for the duration of the course",
        ],
        processingTimeDaysMin: 7,
        processingTimeDaysMax: 14,
        applicationUrl: MFA_VISA_PORTAL,
        primarySourceUrl: MFA_VISA_PORTAL,
        fees: [
          { kind: "base", amountMinor: 2_000_000, currency: "THB", asOf: "2026-05-10", label: "ED visa fee (single entry)", optional: false },
        ],
        notes:
          "Used for Thai language schools, universities, dharma study, and cooking schools. 90-day initial entry, " +
          "renewable in-country at Immigration Bureau every 90 days throughout the course duration.",
      });

      // ---------- Retirement Visa (Non-Immigrant O-A) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "TH",
        purpose: "family",
        status: "embassy_visa",
        label: "Retirement Visa (Non-Immigrant O-A) — Thailand",
        maxStayDays: 365,
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 18,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: false,
        biometricsLocation: null,
        requirements: [
          "Applicant aged 50 or older",
          "Either ฿800,000 (~US$22,000) in a Thai bank for 2+ months OR monthly income of ฿65,000+ (~US$1,800)",
          "Health insurance with ≥ ฿100,000 outpatient + ฿400,000 inpatient cover",
          "Police clearance from country of residence (apostilled)",
          "Medical certificate confirming no notifiable diseases",
          "Renewable in-country annually; no work permitted",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 30,
        applicationUrl: MFA_VISA_PORTAL,
        primarySourceUrl: MFA_VISA_PORTAL,
        fees: [
          { kind: "base", amountMinor: 5_000_000, currency: "THB", asOf: "2026-05-10", label: "O-A visa fee (multi-entry)", optional: false },
        ],
        notes:
          "1-year renewable retirement visa. Can be extended indefinitely while financial conditions continue to be met. " +
          "Long-Term Resident (LTR) Wealthy Pensioner is the more powerful 10-year alternative.",
      });

      // ---------- Marriage Visa (Non-Immigrant O — Thai spouse) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "TH",
        purpose: "family",
        status: "embassy_visa",
        label: "Marriage Visa (Non-Immigrant O — Thai Spouse) — Thailand",
        maxStayDays: 90,
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: false,
        biometricsLocation: null,
        requirements: [
          "Marriage certificate registered with the Thai Ministry of Foreign Affairs",
          "Either ฿400,000 in a Thai joint bank account for 2+ months OR monthly income of ฿40,000+",
          "House registration document of Thai spouse (Tabien Baan)",
          "Photographs of the couple at home and at notable Thai locations (yes, this is a real requirement)",
          "Annual extensions in Thailand at Immigration Bureau",
        ],
        processingTimeDaysMin: 7,
        processingTimeDaysMax: 21,
        applicationUrl: MFA_VISA_PORTAL,
        primarySourceUrl: MFA_VISA_PORTAL,
        fees: [
          { kind: "base", amountMinor: 2_000_000, currency: "THB", asOf: "2026-05-10", label: "O visa fee", optional: false },
        ],
        notes:
          "Married to a Thai national. Annual renewals at Immigration Bureau. After 3 years on the marriage visa, eligible to apply for permanent residence. Limited work rights with separate work permit.",
      });

      // ---------- Business Visa (Non-Immigrant B) ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "TH",
        purpose: "work",
        status: "embassy_visa",
        label: "Business Visa (Non-Immigrant B) — Thailand",
        maxStayDays: 90,
        validityDays: 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: false,
        biometricsLocation: null,
        requirements: [
          "Employment offer from a Thai-registered company",
          "Company documents: registration certificate, financial statements, list of employees, salary records",
          "Thai company must employ 4 Thai nationals per foreign worker (with exceptions)",
          "Work permit (separate document) issued by Thai Department of Employment",
          "Renewable in-country annually",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 30,
        applicationUrl: MFA_VISA_PORTAL,
        primarySourceUrl: MFA_VISA_PORTAL,
        fees: [
          { kind: "base", amountMinor: 5_000_000, currency: "THB", asOf: "2026-05-10", label: "Non-Immigrant B fee (multi-entry)", optional: false },
          { kind: "service", amountMinor: 600_000, currency: "THB", asOf: "2026-05-10", label: "Work permit fee (typical)", optional: true },
        ],
        notes:
          "Employer-sponsored. Visa + Work Permit are separate documents — both required. After 3 years, eligible for permanent-residence application.",
      });

      // ---------- Smart Visa ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "TH",
        purpose: "work",
        status: "embassy_visa",
        label: "Smart Visa (S / T / I / E / O) — Thailand",
        maxStayDays: 1460, // 4-year stay
        validityDays: 1460,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: false,
        biometricsLocation: null,
        requirements: [
          "Smart S (Talent): salary ฿100k+/month, employed in S-curve industry",
          "Smart T (Top-Talent): renowned expert with 10+ years' experience, salary ฿200k+/month",
          "Smart I (Investor): direct investment of ฿20M+ in target industries",
          "Smart E (Executive): senior management role, salary ฿200k+/month, 10+ years' experience",
          "Smart O (Other): spouse/dependents of Smart Visa holders",
          "S-curve industries: BCG, automotive, robotics, biotech, etc. — list maintained by BOI",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 90,
        applicationUrl: SMART_VISA_URL,
        primarySourceUrl: SMART_VISA_URL,
        fees: [
          { kind: "base", amountMinor: 1_000_000, currency: "THB", asOf: "2026-05-10", label: "Smart Visa fee per year", optional: false },
        ],
        notes:
          "4-year visa, no work permit needed (visa includes work permission). Spouse and children may accompany. Targets BOI-promoted S-curve industries.",
      });
    }

    return { records };
  },
};
