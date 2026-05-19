/**
 * Japan's "golden" visa programs introduced 2023–2024:
 *
 *  - J-Skip (Special Highly Skilled Professional, 特別高度人材)
 *      Fast-track 1-year permanent-residency pathway for high earners /
 *      academics. Qualifying salary thresholds: ¥20M+ (research) or
 *      ¥40M+ (employment).
 *
 *  - J-Find (Future Creation Individual, 未来創造人材)
 *      2-year job-search visa for graduates of top-100 universities (QS / THE
 *      / Shanghai rankings) within 5 years of graduation. Lets them job-hunt
 *      from inside Japan.
 *
 *  - Digital Nomad Visa (特定活動 / Specified Activities, designated activity 53)
 *      6-month residence for remote workers earning ≥ ¥10M annually. Launched
 *      April 2024.
 *
 * Records emitted as purpose="work". Note that nationality eligibility for
 * Digital Nomad is a curated list of ~50 visa-waiver countries — the others
 * apply via standard work-visa channels.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const J_SKIP_URL =
  "https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00018.html";
const J_FIND_URL =
  "https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00021.html";
const DIGITAL_NOMAD_URL =
  "https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00027.html";

// Digital Nomad eligibility: visa-waiver countries with a tax-treaty
// relationship with Japan (officially published list as of 2024–2025).
const DIGITAL_NOMAD_ELIGIBLE = new Set([
  "US", "CA", "GB", "AU", "NZ", "SG", "KR", "TW", "HK", "DE", "FR", "IT",
  "NL", "BE", "ES", "PT", "AT", "CH", "DK", "SE", "NO", "FI", "IS", "IE",
  "PL", "CZ", "HU", "GR", "EE", "LV", "LT", "LU", "MT", "CY", "BG", "RO",
  "HR", "SI", "SK", "AR", "CL", "BR", "MX", "UY", "AE", "QA", "IL", "TR",
]);

export const japanSpecialVisasAdapter: Adapter = {
  metadata: {
    id: "jp_special_visas",
    name: "Japan special visas: J-Skip, J-Find, Digital Nomad",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [J_SKIP_URL, J_FIND_URL, DIGITAL_NOMAD_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/jp_special_visas.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return {
      rawText: JSON.stringify({ programs: ["jp_skip", "jp_find", "jp_digital_nomad"] }),
      fetchUrl: "manual://jp_special_visas",
    };
  },

  async parse() {
    const records: ParsedRecord[] = [];
    const all = COUNTRY_LIST.map((c) => c.iso2).filter((iso) => iso !== "JP");

    for (const passport of all) {
      // ---------- J-Skip ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "JP",
        purpose: "work",
        status: "embassy_visa",
        label: "J-Skip — Special Highly Skilled Professional",
        maxStayDays: 1825, // 5-year status; PR pathway after 1 year
        validityDays: 1825,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: false,
        biometricsLocation: null,
        requirements: [
          "EITHER annual salary ≥ ¥20M with a master's degree (research / education / specialized employment)",
          "OR annual salary ≥ ¥40M (regardless of academic qualifications)",
          "Active employment contract or business activity in Japan",
          "Eligible for permanent residency after 1 year of activity (vs. typical 10 years)",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 90,
        applicationUrl: J_SKIP_URL,
        primarySourceUrl: J_SKIP_URL,
        fees: [
          {
            // JPY has no subunit (minorFactor=1). The Certificate of
            // Eligibility itself is FREE in Japan — the only fee is the
            // visa stamp at the consulate, currently ¥6,000 multi-entry
            // per MOFA schedule. Prior value of 400000 implied ¥400,000
            // (~$2,700 USD) which was off by ~70x.
            kind: "base",
            amountMinor: 6000,
            currency: "JPY",
            asOf: "2026-05-19",
            label: "Visa issuance fee (multi-entry) — COE itself is free",
            optional: false,
          },
        ],
        notes:
          "Launched April 2023. The fastest pathway to Japanese permanent residency for high earners. " +
          "Fast-track to PR after 1 year and access to bring household staff (rare in Japan).",
      });

      // ---------- J-Find ----------
      records.push({
        passportIso2: passport,
        destinationIso2: "JP",
        purpose: "work",
        status: "embassy_visa",
        label: "J-Find — Future Creation Individual (job-search visa)",
        maxStayDays: 730,
        validityDays: 730,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: false,
        proofOfFundsRequired: true,
        proofOfAccommodationRequired: false,
        biometricsRequired: false,
        biometricsLocation: null,
        requirements: [
          "Graduated from a top-100-ranked university (QS / THE / Shanghai rankings) within the past 5 years",
          "Sufficient funds to support yourself during the job search (typically ¥200,000+ initial savings)",
          "Travel insurance for the full duration",
          "Free to job-hunt + work part-time while looking for full-time work",
        ],
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 60,
        applicationUrl: J_FIND_URL,
        primarySourceUrl: J_FIND_URL,
        fees: [
          {
            // JPY has no subunit (minorFactor=1). The Certificate of
            // Eligibility itself is FREE in Japan — the only fee is the
            // visa stamp at the consulate, currently ¥6,000 multi-entry
            // per MOFA schedule. Prior value of 400000 implied ¥400,000
            // (~$2,700 USD) which was off by ~70x.
            kind: "base",
            amountMinor: 6000,
            currency: "JPY",
            asOf: "2026-05-19",
            label: "Visa issuance fee (multi-entry) — COE itself is free",
            optional: false,
          },
        ],
        notes:
          "Launched April 2023. Lets recent graduates from top universities live in Japan for up to 2 years " +
          "while job-hunting — a rare opportunity to work the inside track on Japanese employment.",
      });

      // ---------- Digital Nomad (eligibility-restricted) ----------
      if (DIGITAL_NOMAD_ELIGIBLE.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "JP",
          purpose: "work",
          status: "embassy_visa",
          label: "Digital Nomad Visa — Japan",
          maxStayDays: 180,
          validityDays: 180,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          biometricsLocation: null,
          requirements: [
            "Annual income of at least ¥10 million (~US$67,000)",
            "Employed by a non-Japanese employer OR self-employed serving non-Japanese clients",
            "Private health insurance covering the full stay (Japanese national insurance is NOT available)",
            "Cannot be renewed; can only re-apply 6 months after the previous stay ended",
            "Spouse and children may accompany under designated-activities status",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 30,
          applicationUrl: DIGITAL_NOMAD_URL,
          primarySourceUrl: DIGITAL_NOMAD_URL,
          fees: [
            {
              kind: "base",
              amountMinor: 400000,
              currency: "JPY",
              asOf: "2026-05-10",
              label: "Certificate of Eligibility issuance fee",
              optional: false,
            },
          ],
          notes:
            "Launched April 2024. 6-month single stay with a 6-month cool-off before re-application. " +
            "No work for Japanese clients permitted. Eligibility limited to ~50 countries with a tax treaty + visa-waiver agreement with Japan.",
        });
      }
    }

    if (records.length < 200) {
      return {
        records,
        parseError: `Only ${records.length} JP-special-visa records emitted.`,
      };
    }
    return { records };
  },
};
