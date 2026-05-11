/**
 * Total-coverage adapter — Wave 1 — United Kingdom + United States.
 *
 * Programs covered (8):
 *   US J-1 Exchange Visitor
 *   US O-1 Extraordinary Ability
 *   US E-2 Treaty Investor             (nationality-restricted)
 *   US IR-1 / CR-1 Spouse of US Citizen (green card)
 *   US EB-5 Immigrant Investor          (green card)
 *   UK Global Talent
 *   UK Health and Care Worker
 *   UK Marriage / Civil Partnership Visitor
 *
 * Each record is hand-encoded from the destination government's own
 * application page (gov.uk, travel.state.gov, USCIS). Lead times, fees,
 * and document requirements reflect the published programme rules as of
 * 2026-05-11. Refresh quarterly.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const ALL = COUNTRY_LIST.map((c) => c.iso2);

// E-2 Treaty Investor: only nationals of treaty countries are eligible.
// Source: https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/treaty.html
const E2_TREATY_COUNTRIES = new Set([
  "AL", "AR", "AM", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BE", "BO",
  "BA", "BG", "CM", "CA", "CL", "CN", "CG", "CR", "HR", "CZ", "DK", "EC",
  "EG", "EE", "ET", "FI", "FR", "GE", "DE", "GR", "GD", "HN", "IS", "IR",
  "IE", "IL", "IT", "JM", "JP", "JO", "KZ", "KR", "KG", "LV", "LR", "LT",
  "LU", "MK", "MX", "MD", "MN", "ME", "MA", "NL", "NZ", "NO", "OM", "PK",
  "PA", "PY", "PH", "PL", "PT", "RO", "SN", "RS", "SG", "SK", "SI", "ES",
  "LK", "SR", "SE", "CH", "TH", "TG", "TT", "TN", "TR", "UA", "GB", "UY",
  "YE",
]);

export const totalCoverageUkUsAdapter: Adapter = {
  metadata: {
    id: "total_coverage_uk_us",
    name: "Total coverage — UK & US (J-1 / O-1 / E-2 / IR-1 / EB-5 / Global Talent / H&C / Marriage Visitor)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [
      "https://travel.state.gov/content/travel/en/us-visas/study/exchange.html",
      "https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement",
      "https://travel.state.gov/content/travel/en/us-visas/employment/treaty-trader-investor-visa-e.html",
      "https://travel.state.gov/content/travel/en/us-visas/immigrate/family-immigration/family-of-us-citizens.html",
      "https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program",
      "https://www.gov.uk/global-talent",
      "https://www.gov.uk/health-care-worker-visa",
      "https://www.gov.uk/marriage-visa",
    ],
    fixturePath: "src/scrapers/sources/__fixtures__/total_coverage_uk_us.json",
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "total_coverage_uk_us" }), fetchUrl: "manual://total_coverage_uk_us" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      // ============================================================
      // UNITED STATES
      // ============================================================

      // ---------- US J-1 Exchange Visitor ----------
      if (passport !== "US") {
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "study",
          status: "embassy_visa",
          label: "J-1 Exchange Visitor — United States",
          maxStayDays: 365,
          validityDays: 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "US embassy / consulate",
          requirements: [
            "Form DS-2019 issued by a US Department of State–designated sponsor",
            "SEVIS I-901 fee paid (US$220 for most categories, $35 au-pair)",
            "Acceptance into one of 14 J-1 programme categories (research scholar, student intern, au pair, camp counsellor, summer work travel, etc.)",
            "Proof of funds to cover the programme",
            "Strong ties to home country (no immigrant intent)",
            "Health insurance meeting J-1 minimums for the duration of the programme",
            "212(e) two-year home-residency requirement may apply",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 60,
          applicationUrl: "https://travel.state.gov/content/travel/en/us-visas/study/exchange.html",
          primarySourceUrl: "https://j1visa.state.gov/",
          fees: [
            { kind: "base", amountMinor: 18500, currency: "USD", asOf: "2026-05-11", label: "DS-160 application fee", optional: false },
            { kind: "service", amountMinor: 22000, currency: "USD", asOf: "2026-05-11", label: "SEVIS I-901 fee", optional: false },
          ],
          notes: "14 sub-categories from camp counsellor (1 summer) to research scholar (5 years). The 212(e) two-year rule can force you to return home for 2 years before applying for H-1B / green card — check whether it applies to your category and funding source.",
        });
      }

      // ---------- US O-1 Extraordinary Ability ----------
      if (passport !== "US") {
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "work",
          status: "embassy_visa",
          label: "O-1 Extraordinary Ability — United States",
          maxStayDays: 1095,
          validityDays: 1095,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "US embassy / consulate",
          requirements: [
            "Evidence of extraordinary ability — major award (Nobel, Olympic gold, Oscar) OR 3 of 8 criteria (national prize, press coverage, judging others' work, original contributions, scholarly articles, high salary, lead/critical role, commercial success)",
            "Sponsoring US employer or agent files Form I-129",
            "Consultation letter from a peer / labor union in your field",
            "Itinerary of work or events",
            "Renewable indefinitely in 1-year increments — no annual cap, no lottery",
            "Spouse + children eligible for O-3 dependents",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 90,
          applicationUrl: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement",
          primarySourceUrl: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement",
          fees: [
            { kind: "base", amountMinor: 46000, currency: "USD", asOf: "2026-05-11", label: "Form I-129 filing fee (small employer)", optional: false },
            { kind: "service", amountMinor: 28050, currency: "USD", asOf: "2026-05-11", label: "Premium Processing (15-day decision)", optional: true },
          ],
          notes: "No annual cap and no lottery — unlike H-1B. The bar is genuinely high (sustained national/international acclaim), but a well-prepared petition with strong evidence is routinely approved.",
        });
      }

      // ---------- US E-2 Treaty Investor (nationality-restricted) ----------
      if (E2_TREATY_COUNTRIES.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "work",
          status: "embassy_visa",
          label: "E-2 Treaty Investor — United States",
          maxStayDays: 730,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "US embassy / consulate",
          requirements: [
            "National of a country with a qualifying treaty of commerce and navigation with the US",
            "Substantial investment in a real, operating US enterprise (typically $100k+, but no statutory minimum)",
            "Investor must own 50%+ of the business or have operational control",
            "Business must generate more than minimal income (not 'marginal') — usually employing US workers",
            "Funds at risk and committed (in escrow doesn't count; must be already invested)",
            "Source-of-funds documentation traceable back to lawful origin",
            "Renewable indefinitely in 2-year increments as long as the business stays operational",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 120,
          applicationUrl: "https://travel.state.gov/content/travel/en/us-visas/employment/treaty-trader-investor-visa-e.html",
          primarySourceUrl: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/treaty.html",
          fees: [
            { kind: "base", amountMinor: 31500, currency: "USD", asOf: "2026-05-11", label: "DS-160 + E-2 issuance fee", optional: false },
          ],
          notes: "Open only to nationals of E-2 treaty countries (the US has bilateral commerce treaties with ~80 countries — most notable exceptions: India, China, Russia, Brazil, Vietnam, South Africa). Spouse can apply for an EAD (work permit) once admitted.",
        });
      }

      // ---------- US IR-1 / CR-1 Spouse Green Card ----------
      if (passport !== "US") {
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "family",
          status: "embassy_visa",
          label: "IR-1 / CR-1 Spouse of US Citizen — Immigrant Visa",
          maxStayDays: 9999,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "US embassy / consulate + USCIS Application Support Center on arrival",
          requirements: [
            "US-citizen spouse files Form I-130 Petition for Alien Relative",
            "Bona-fide marriage evidence (joint accounts, lease, photos, communication, statements from family/friends)",
            "US-citizen spouse meets income threshold (125% of Federal Poverty Guidelines) or has a co-sponsor",
            "Form I-864 Affidavit of Support from the sponsor",
            "Police certificate from every country lived in 6+ months since age 16",
            "Medical examination by a panel physician at the consulate",
            "DS-260 Immigrant Visa Application after I-130 approval",
            "IR-1 if married 2+ years (10-year green card); CR-1 if married <2 years (2-year conditional card, file I-751 to remove conditions)",
          ],
          processingTimeDaysMin: 300,
          processingTimeDaysMax: 540,
          applicationUrl: "https://travel.state.gov/content/travel/en/us-visas/immigrate/family-immigration/family-of-us-citizens.html",
          primarySourceUrl: "https://www.uscis.gov/family/family-of-us-citizens",
          fees: [
            { kind: "base", amountMinor: 67500, currency: "USD", asOf: "2026-05-11", label: "Form I-130 filing fee", optional: false },
            { kind: "service", amountMinor: 34500, currency: "USD", asOf: "2026-05-11", label: "DS-260 + immigrant visa fee", optional: false },
            { kind: "biometrics", amountMinor: 22000, currency: "USD", asOf: "2026-05-11", label: "USCIS Immigrant Fee", optional: false },
          ],
          notes: "Processing has stretched to 10-18 months in 2024-2026 due to consular backlogs. K-3 was historically a faster non-immigrant route while waiting on the I-130 but is rarely issued now — most spouses just wait for IR-1/CR-1.",
        });
      }

      // ---------- US EB-5 Immigrant Investor ----------
      if (passport !== "US") {
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "work",
          status: "embassy_visa",
          label: "EB-5 Immigrant Investor — United States",
          maxStayDays: 9999,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "US embassy / consulate",
          requirements: [
            "Invest $800k (Targeted Employment Area / rural) or $1,050k (standard) in a new US commercial enterprise",
            "Investment must create or preserve 10 full-time US jobs within 2 years",
            "Source-of-funds documentation traceable back to lawful origin (tax returns, bank records, gift letters)",
            "Form I-526E petition filed (Reform Act 2022 enables concurrent filing of I-526E and I-485 if in the US)",
            "Conditional 2-year green card issued; file I-829 in months 21-24 to remove conditions",
            "Investment must remain 'at risk' for the conditional period",
            "Spouse + unmarried children under 21 derive status",
          ],
          processingTimeDaysMin: 365,
          processingTimeDaysMax: 1095,
          applicationUrl: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program",
          primarySourceUrl: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program",
          fees: [
            { kind: "base", amountMinor: 1117500, currency: "USD", asOf: "2026-05-11", label: "Form I-526E filing fee", optional: false },
            { kind: "service", amountMinor: 32500, currency: "USD", asOf: "2026-05-11", label: "EB-5 Integrity Fund fee", optional: false },
            { kind: "service", amountMinor: 4750000, currency: "USD", asOf: "2026-05-11", label: "Investment (rural / TEA minimum)", optional: false },
          ],
          notes: "Reform & Integrity Act 2022 reserved 20% of annual visas for rural projects, 10% for high-unemployment TEAs, 2% for infrastructure. China + India are heavily backlogged for non-reserved categories; reserved categories had current priority dates as of 2026.",
        });
      }

      // ============================================================
      // UNITED KINGDOM
      // ============================================================

      // ---------- UK Global Talent ----------
      if (passport !== "GB") {
        records.push({
          passportIso2: passport,
          destinationIso2: "GB",
          purpose: "work",
          status: "embassy_visa",
          label: "Global Talent Visa — United Kingdom",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "UK Visa Application Centre",
          requirements: [
            "Endorsement from an approved body (Royal Society / Royal Academy of Engineering / British Academy / UKRI for academia & research; Tech Nation closed 2024, replaced by Department for Science, Innovation & Technology for digital tech; Arts Council England for arts & culture)",
            "Two-stage application: endorsement first (8 weeks), then visa application (3 weeks)",
            "OR direct route: senior individuals with a Prestigious Prize (Nobel, Turing, Fields, Oscar, Grammy, Booker) qualify without endorsement",
            "No employer sponsorship required — can switch employers / freelance freely",
            "No English requirement at application; required at settlement (ILR after 3 years for some endorsement routes, 5 years for others)",
            "Spouse + children eligible as dependants",
          ],
          processingTimeDaysMin: 21,
          processingTimeDaysMax: 84,
          applicationUrl: "https://www.gov.uk/global-talent",
          primarySourceUrl: "https://www.gov.uk/global-talent",
          fees: [
            { kind: "base", amountMinor: 76600, currency: "GBP", asOf: "2026-05-11", label: "Endorsement fee", optional: false },
            { kind: "base", amountMinor: 19400, currency: "GBP", asOf: "2026-05-11", label: "Visa application fee", optional: false },
            { kind: "service", amountMinor: 103500, currency: "GBP", asOf: "2026-05-11", label: "Immigration Health Surcharge (per year)", optional: false },
          ],
          notes: "Faster route to settlement than Skilled Worker (3 years vs 5 for Exceptional Talent endorsement). No salary threshold. Tech Nation was decommissioned in 2024 — the digital-tech route is now run by DSIT.",
        });
      }

      // ---------- UK Health and Care Worker ----------
      if (passport !== "GB") {
        records.push({
          passportIso2: passport,
          destinationIso2: "GB",
          purpose: "work",
          status: "embassy_visa",
          label: "Health and Care Worker Visa — United Kingdom",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "UK Visa Application Centre",
          requirements: [
            "Confirmed job offer from a Home Office-licensed sponsor in an eligible health or social-care role (SOC codes for doctors, nurses, paramedics, social workers, senior care workers, etc.)",
            "Certificate of Sponsorship (CoS) from the employer",
            "Salary at least £29,000 OR the going rate for the role (whichever is higher) — discounted from the Skilled Worker £38,700 threshold",
            "English at CEFR B1 (IELTS for UKVI Life Skills, or degree taught in English)",
            "Maintenance funds (£1,270 unless sponsor covers)",
            "TB test for nationals of countries on the TB-test list",
            "No IHS payable (waived for this route)",
            "Reduced visa fees (~£304 for 3 years, ~£590 for 5 years)",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 56,
          applicationUrl: "https://www.gov.uk/health-care-worker-visa",
          primarySourceUrl: "https://www.gov.uk/health-care-worker-visa",
          fees: [
            { kind: "base", amountMinor: 30400, currency: "GBP", asOf: "2026-05-11", label: "Visa application fee (up to 3 years)", optional: false },
          ],
          notes: "IHS waived + reduced fees + lower salary threshold than standard Skilled Worker — the UK's primary lever for NHS recruitment. ILR after 5 years. As of 2024, senior care worker (SOC 6135) is closed to in-country switching from other routes.",
        });
      }

      // ---------- UK Marriage / Civil Partnership Visitor ----------
      if (passport !== "GB") {
        records.push({
          passportIso2: passport,
          destinationIso2: "GB",
          purpose: "family",
          status: "embassy_visa",
          label: "Marriage / Civil Partnership Visitor — United Kingdom",
          maxStayDays: 180,
          validityDays: 180,
          entriesAllowed: "single",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: true,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: true,
          biometricsRequired: true,
          biometricsLocation: "UK Visa Application Centre",
          requirements: [
            "Both parties aged 18+ and free to marry / form a civil partnership in the UK",
            "Notice given at a register office for marriage / civil partnership within 6 months of arrival",
            "Evidence of relationship genuineness (correspondence, photos, prior visits)",
            "Proof of funds for the visit + accommodation arrangements",
            "Return ticket / onward travel proof",
            "You CANNOT stay in the UK after the marriage on this visa — you must leave and apply for a Spouse Visa from outside the UK",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 42,
          applicationUrl: "https://www.gov.uk/marriage-visa",
          primarySourceUrl: "https://www.gov.uk/marriage-visa",
          fees: [
            { kind: "base", amountMinor: 13800, currency: "GBP", asOf: "2026-05-11", label: "Marriage Visitor visa fee", optional: false },
          ],
          notes: "Strictly for getting married / forming a civil partnership in the UK and then LEAVING. Cannot be switched to Spouse Visa from inside the UK — you must depart and apply via the Spouse route from your home country.",
        });
      }
    }

    return { records };
  },
};
