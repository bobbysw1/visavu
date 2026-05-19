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

// TN (USMCA Professional): only Canadians + Mexicans are eligible.
// Source: https://travel.state.gov/content/travel/en/us-visas/employment/visas-canadian-mexican-nafta-professional-workers.html
const TN_NATIONALITIES = new Set(["CA", "MX"]);

// H-1B1 (US-Chile + US-Singapore FTA set-asides). 1,400 visas/year for CL,
// 5,400/year for SG, separate from the H-1B 65k cap. No lottery.
// Source: https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html
const H1B1_NATIONALITIES = new Set(["CL", "SG"]);

// UK Ancestry visa: Commonwealth citizens (plus British Overseas Citizens
// and British subjects) with a UK-born grandparent qualify. 5-year work
// visa leading to ILR. £637 fee, no employer sponsorship needed.
// Source: https://www.gov.uk/ancestry-visa
const UK_ANCESTRY_NATIONALITIES = new Set([
  "AG", "AU", "BS", "BD", "BB", "BZ", "BW", "BN", "CA", "CY", "DM", "FJ",
  "GD", "GY", "IN", "JM", "KE", "KI", "LS", "MW", "MY", "MV", "MT", "MU",
  "MZ", "NA", "NR", "NZ", "NG", "PK", "PG", "RW", "WS", "SC", "SL", "SG",
  "SB", "ZA", "LK", "KN", "LC", "VC", "SZ", "TZ", "TO", "TT", "TV", "UG",
  "VU", "ZM",
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
    staticData: true,
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
            // EB-5 Reform Act 2022: rural / TEA minimum is $800,000 (was
            // $500,000 pre-Mar 2022). Standard minimum is $1,050,000. The
            // prior value (4,750,000 minor = $47,500) was off by ~17x.
            { kind: "service", amountMinor: 80_000_000, currency: "USD", asOf: "2026-05-19", label: "Investment (rural / TEA minimum, $800k)", optional: false },
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
            // UK Home Office visa fees (Apr 2024 schedule):
            //   - GBT endorsement: £561 (raised from £524)
            //   - GBT visa application (outside UK, main): £716
            //   - Immigration Health Surcharge: £1,035 / year (Feb 2024)
            // Prior values (£766 / £194 / £1,035) had endorsement + visa
            // figures swapped and wrong vs the current schedule.
            { kind: "base", amountMinor: 56100, currency: "GBP", asOf: "2026-05-19", label: "Endorsement fee" },
            { kind: "base", amountMinor: 71600, currency: "GBP", asOf: "2026-05-19", label: "Visa application fee (outside UK)" },
            { kind: "service", amountMinor: 103500, currency: "GBP", asOf: "2026-05-19", label: "Immigration Health Surcharge (per year)" },
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

      // ---------- US E-3 Specialty Occupation (AU only — AUSFTA) ----------
      if (passport === "AU") {
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "work",
          status: "embassy_visa",
          label: "E-3 Specialty Occupation — United States (Australians only)",
          maxStayDays: 730,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "US embassy / consulate (Sydney, Melbourne, Perth, Canberra)",
          requirements: [
            "Australian citizen at the time of application (dual citizens must apply on the AU passport)",
            "Job offer in a 'specialty occupation' — minimum bachelor's degree (or equivalent experience: 3 years = 1 year of education under the 'three-for-one' rule) directly relevant to the role",
            "Employer files a Labor Condition Application (LCA / ETA-9035) with the US Department of Labor (~7 days)",
            "Bring LCA, employer letter, degree + transcripts, and CV to the consulate interview",
            "No annual cap pressure — 10,500 visas reserved per year, almost never fully used",
            "Renewable indefinitely in 2-year increments",
            "Spouse (E-3D) gets unrestricted EAD on arrival — files I-765 to USCIS",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 30,
          applicationUrl: "https://travel.state.gov/content/travel/en/us-visas/employment/specialty-occupations-e3.html",
          primarySourceUrl: "https://travel.state.gov/content/travel/en/us-visas/employment/specialty-occupations-e3.html",
          fees: [
            { kind: "base", amountMinor: 31500, currency: "USD", asOf: "2026-05-11", label: "DS-160 + MRV fee", optional: false },
          ],
          notes:
            "AUSTRALIAN-ONLY VISA under the Australia-US Free Trade Agreement (in force 2005). Dramatically easier than H-1B (no lottery, no cap pressure, no employer petition required — just LCA + consulate interview) and better dependent terms than TN. Most Australians moving to the US for work should default to E-3, not H-1B.",
        });
      }

      // ---------- US TN — USMCA Professional (CA + MX only) ----------
      if (TN_NATIONALITIES.has(passport)) {
        const isCanadian = passport === "CA";
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "work",
          status: "embassy_visa",
          label: isCanadian
            ? "TN visa — United States (Canadian USMCA Professional)"
            : "TN visa — United States (Mexican USMCA Professional)",
          maxStayDays: 1095,
          validityDays: 1095,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: !isCanadian,
          biometricsLocation: isCanadian ? null : "US embassy / consulate in Mexico",
          requirements: [
            isCanadian
              ? "Canadian citizen at the time of application"
              : "Mexican citizen at the time of application",
            "Job offer in one of the ~60 USMCA Appendix 2 occupations (engineer, scientist, accountant, lawyer, teacher, IT specialist, etc.)",
            "Bachelor's degree or equivalent professional credential matching the occupation",
            "Employer letter confirming role, salary, length of employment, and TN occupation classification",
            isCanadian
              ? "Apply at US port-of-entry (Pearson, YVR, land border) or via I-129 in advance — no petition required for first-time TN at the border"
              : "Apply at US embassy / consulate in Mexico for TN visa stamp before travel",
            "Renewable indefinitely in 3-year increments — no statutory limit",
            "Spouse (TD) CAN attend US public schools but CANNOT work — major dealbreaker for dual-career couples (use L-1 or H-1B if spouse work required)",
          ],
          processingTimeDaysMin: isCanadian ? 0 : 14,
          processingTimeDaysMax: isCanadian ? 1 : 30,
          applicationUrl: "https://travel.state.gov/content/travel/en/us-visas/employment/visas-canadian-mexican-nafta-professional-workers.html",
          primarySourceUrl: "https://travel.state.gov/content/travel/en/us-visas/employment/visas-canadian-mexican-nafta-professional-workers.html",
          fees: isCanadian
            ? [
                { kind: "base", amountMinor: 5600, currency: "USD", asOf: "2026-05-11", label: "CBP port-of-entry filing fee", optional: false },
              ]
            : [
                { kind: "base", amountMinor: 18500, currency: "USD", asOf: "2026-05-11", label: "DS-160 + MRV fee", optional: false },
              ],
          notes:
            "USMCA (NAFTA's successor) TN category. Canadians: apply at the US port of entry, no I-129 petition needed, decision in minutes. Mexicans: must apply at a US consulate in Mexico for the TN visa stamp first. No annual cap, no lottery. Dual-intent is technically NOT permitted (unlike H-1B) but pursuing PERM-based green card from TN is common.",
        });
      }

      // ---------- US H-1B1 — FTA set-aside (Chile + Singapore only) ----------
      if (H1B1_NATIONALITIES.has(passport)) {
        const annualCap = passport === "CL" ? "1,400" : "5,400";
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "work",
          status: "embassy_visa",
          label:
            passport === "CL"
              ? "H-1B1 — United States (Chilean FTA set-aside, 1,400/year)"
              : "H-1B1 — United States (Singaporean FTA set-aside, 5,400/year)",
          maxStayDays: 540,
          validityDays: 540,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "US embassy / consulate",
          requirements: [
            passport === "CL"
              ? "Chilean citizen at the time of application"
              : "Singaporean citizen at the time of application",
            "Job offer in a US 'specialty occupation' — minimum bachelor's degree or equivalent in a field directly related to the role",
            "Employer files a Labor Condition Application (LCA / ETA-9035) — same as regular H-1B",
            `Annual cap of ${annualCap} visas set aside under the US-${passport === "CL" ? "Chile" : "Singapore"} Free Trade Agreement — separate from the H-1B 65,000 cap`,
            "No lottery — first-come, first-served against the FTA quota (which is rarely filled)",
            "18-month grants, renewable indefinitely",
            "Spouse and children get H-4 status (H-4 EAD available if principal has approved I-140)",
          ],
          processingTimeDaysMin: 21,
          processingTimeDaysMax: 60,
          applicationUrl: "https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html",
          primarySourceUrl: "https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html",
          fees: [
            { kind: "base", amountMinor: 19000, currency: "USD", asOf: "2026-05-11", label: "DS-160 + MRV fee", optional: false },
          ],
          notes:
            passport === "CL"
              ? "CHILEAN-ONLY VISA under the US-Chile FTA (in force 2004). Bypasses the H-1B 65k lottery entirely — 1,400 visas/year set aside, rarely filled. Apply directly at the consulate."
              : "SINGAPOREAN-ONLY VISA under the US-Singapore FTA (in force 2004). Bypasses the H-1B 65k lottery — 5,400 visas/year set aside, rarely filled. Apply directly at the consulate.",
        });
      }

      // ---------- UK Ancestry visa (Commonwealth + UK-born grandparent) ----------
      if (UK_ANCESTRY_NATIONALITIES.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "GB",
          purpose: "work",
          status: "embassy_visa",
          label: "UK Ancestry visa (Commonwealth + UK-born grandparent)",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "UK Visa Application Centre (TLScontact / VFS) in country of residence",
          requirements: [
            "Commonwealth citizen at the time of application (also open to British Overseas Citizens and British subjects)",
            "At least one grandparent born in the UK, Channel Islands, or Isle of Man — OR before 1922 anywhere in the Republic of Ireland",
            "Aged 17 or over",
            "Able and intending to work in the UK (no minimum salary, no employer sponsorship, any job)",
            "Original grandparent birth certificate(s) showing UK birthplace",
            "Your own birth certificate, your parent's birth certificate, marriage certificates linking the line",
            "Proof you can support yourself and any dependants without UK public funds",
            "Tuberculosis test if you're applying from a listed country",
            "Sufficient funds for the application + IHS up-front (~£3,500 over 5 years)",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 21,
          applicationUrl: "https://www.gov.uk/ancestry-visa",
          primarySourceUrl: "https://www.gov.uk/ancestry-visa",
          fees: [
            { kind: "base", amountMinor: 63700, currency: "GBP", asOf: "2026-05-11", label: "Ancestry visa application fee", optional: false },
            { kind: "service", amountMinor: 517500, currency: "GBP", asOf: "2026-05-11", label: "Immigration Health Surcharge (£1,035/year × 5)", optional: false },
          ],
          notes:
            "COMMONWEALTH GRANDPARENT ROUTE. 5-year unrestricted work in the UK leading to Indefinite Leave to Remain at year 5. Vastly cheaper and more flexible than Skilled Worker — no employer sponsorship, no salary floor, you can switch jobs / freelance / be self-employed. Many Australians, Canadians, New Zealanders, South Africans, Indians and Nigerians with a UK-born grandparent miss this entirely and pay 4× more for Skilled Worker. Check the line carefully — adopted grandparents qualify if the adoption was UK-legal; step-grandparents do NOT.",
        });
      }
    }

    return { records };
  },
};
