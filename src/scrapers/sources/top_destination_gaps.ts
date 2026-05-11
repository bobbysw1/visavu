/**
 * Gap-fill adapter for the most-searched destinations: Australia Visitor 600,
 * United States F-1 + L-1 + K-1, United Kingdom Innovator Founder + Graduate +
 * High Potential Individual, Canada Family Sponsorship + Super Visa.
 *
 * These are well-trafficked programs that didn't have their own dedicated
 * adapter yet. Coverage is universal (all passports) except where eligibility
 * is explicitly nationality-restricted (UK High Potential Individual is open
 * only to top-50 university graduates regardless of nationality).
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const VALID_ISO = new Set(COUNTRY_LIST.map((c) => c.iso2));
const ALL = COUNTRY_LIST.map((c) => c.iso2);

export const topDestinationGapsAdapter: Adapter = {
  metadata: {
    id: "top_destination_gaps",
    name: "Top-destination gap fills (AU 600, US F-1/L-1/K-1, UK Innovator/Graduate/HPI, CA Family/Super)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600",
      "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      "https://travel.state.gov/content/travel/en/us-visas/employment/intracompany-transferee-l1.html",
      "https://travel.state.gov/content/travel/en/us-visas/immigrate/family-immigration/nonimmigrant-visa-fiance.html",
      "https://www.gov.uk/innovator-founder-visa",
      "https://www.gov.uk/graduate-visa",
      "https://www.gov.uk/high-potential-individual-visa",
      "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship.html",
      "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html",
    ],
    fixturePath: "src/scrapers/sources/__fixtures__/top_destination_gaps.json",
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "top_gaps" }), fetchUrl: "manual://top_gaps" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      if (!VALID_ISO.has(passport)) continue;

      // ---------- Australia Visitor 600 (Tourist + Business + Family streams) ----------
      if (passport !== "AU") {
        records.push({
          passportIso2: passport,
          destinationIso2: "AU",
          purpose: "tourism",
          status: "embassy_visa",
          label: "Visitor visa (Subclass 600) — Australia",
          maxStayDays: 90,
          validityDays: 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: true,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          biometricsLocation: null,
          requirements: [
            "Streams: Tourist (general visit), Business Visitor, Sponsored Family, Approved Destination Status, Frequent Traveller",
            "Genuine temporary entrant — must intend to leave Australia at end of stay",
            "Health insurance recommended (no public Medicare access)",
            "Adequate funds for the stay",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 60,
          applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600",
          primarySourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600",
          fees: [
            { kind: "base", amountMinor: 19000, currency: "AUD", asOf: "2026-05-10", label: "Tourist stream base fee", optional: false },
          ],
          notes:
            "Used by passport holders not eligible for ETA (Subclass 601) or eVisitor (Subclass 651). Stay typically 3, 6 or 12 months at decision officer's discretion.",
        });
      }

      // ---------- US F-1 Student Visa ----------
      if (passport !== "US") {
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "study",
          status: "embassy_visa",
          label: "F-1 Student Visa — United States",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: true,
          biometricsRequired: true,
          biometricsLocation: "US embassy / consulate",
          requirements: [
            "Acceptance to a SEVP-certified US institution (Form I-20)",
            "Proof of funds covering tuition + living costs for the entire program",
            "Strong ties to home country (no immigrant intent)",
            "SEVIS I-901 fee paid (US$350)",
            "DS-160 online non-immigrant visa application",
            "On-campus work (20 hrs/week) permitted; OPT extension after graduation (12 months, +24 STEM)",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 90,
          applicationUrl: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
          primarySourceUrl: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
          fees: [
            { kind: "base", amountMinor: 18500, currency: "USD", asOf: "2026-05-10", label: "MRV non-immigrant visa fee", optional: false },
            { kind: "service", amountMinor: 35000, currency: "USD", asOf: "2026-05-10", label: "SEVIS I-901 fee", optional: false },
          ],
          notes:
            "Issued for 'duration of status' — covers full program length plus 60-day grace period. Most popular route for international students entering the US.",
        });

        // ---------- US L-1 Intracompany Transferee ----------
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "work",
          status: "embassy_visa",
          label: "L-1 Intracompany Transferee — United States",
          maxStayDays: 2555, // 7 years
          validityDays: 2555,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "US embassy / consulate",
          requirements: [
            "Employed by a multinational company at a foreign branch for 1+ continuous year in past 3 years",
            "Transferring to a US affiliate / subsidiary / parent of the same company",
            "L-1A: executive or manager (up to 7 years)",
            "L-1B: specialised-knowledge employee (up to 5 years)",
            "Spouse on L-2 status with work authorisation",
            "Path to EB-1C green card for L-1A executives",
          ],
          processingTimeDaysMin: 60,
          processingTimeDaysMax: 180,
          applicationUrl:
            "https://travel.state.gov/content/travel/en/us-visas/employment/intracompany-transferee-l1.html",
          primarySourceUrl:
            "https://travel.state.gov/content/travel/en/us-visas/employment/intracompany-transferee-l1.html",
          fees: [
            { kind: "base", amountMinor: 19000, currency: "USD", asOf: "2026-05-10", label: "I-129 petition fee", optional: false },
            { kind: "service", amountMinor: 50000, currency: "USD", asOf: "2026-05-10", label: "Premium processing (15-day)", optional: true },
          ],
          notes:
            "Not subject to the H-1B lottery or annual cap — major advantage for employers expanding to the US. Spouse gets work authorisation automatically.",
        });

        // ---------- US K-1 Fiancé(e) ----------
        records.push({
          passportIso2: passport,
          destinationIso2: "US",
          purpose: "family",
          status: "embassy_visa",
          label: "K-1 Fiancé(e) Visa — United States",
          maxStayDays: 90,
          validityDays: 90,
          entriesAllowed: "single",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "US embassy / consulate",
          requirements: [
            "Fiancé(e) of a US citizen (NOT permanent resident)",
            "Met in person within the past 2 years (limited religious/cultural waivers)",
            "Both parties legally free to marry",
            "Marriage must occur within 90 days of arrival in the US",
            "After marriage, file I-485 Adjustment of Status to become permanent resident",
          ],
          processingTimeDaysMin: 180,
          processingTimeDaysMax: 360,
          applicationUrl:
            "https://travel.state.gov/content/travel/en/us-visas/immigrate/family-immigration/nonimmigrant-visa-fiance.html",
          primarySourceUrl:
            "https://travel.state.gov/content/travel/en/us-visas/immigrate/family-immigration/nonimmigrant-visa-fiance.html",
          fees: [
            { kind: "base", amountMinor: 53500, currency: "USD", asOf: "2026-05-10", label: "I-129F petition fee", optional: false },
            { kind: "service", amountMinor: 26500, currency: "USD", asOf: "2026-05-10", label: "Consular processing fee", optional: false },
          ],
          notes:
            "Bringing a foreign fiancé(e) to the US for marriage. Marriage must happen within 90 days. Then adjust status for green card. K-2 covers minor children of the fiancé(e).",
        });
      }

      // ---------- UK Innovator Founder ----------
      if (passport !== "GB") {
        records.push({
          passportIso2: passport,
          destinationIso2: "GB",
          purpose: "work",
          status: "embassy_visa",
          label: "Innovator Founder Visa — United Kingdom",
          maxStayDays: 1095,
          validityDays: 1095,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "UKVCAS centre / VFS",
          requirements: [
            "Innovative, viable, scalable business idea endorsed by a UK Endorsing Body",
            "No minimum investment requirement (replaced earlier £50k threshold in April 2023)",
            "English language at B2 (CEFR) level",
            "£1,270 in personal savings for 28+ days",
            "Path to settlement (ILR) after 3 years",
          ],
          processingTimeDaysMin: 21,
          processingTimeDaysMax: 60,
          applicationUrl: "https://www.gov.uk/innovator-founder-visa",
          primarySourceUrl: "https://www.gov.uk/innovator-founder-visa",
          fees: [
            { kind: "base", amountMinor: 161500, currency: "GBP", asOf: "2026-05-10", label: "Application fee (out-of-country)", optional: false },
            { kind: "service", amountMinor: 103500, currency: "GBP", asOf: "2026-05-10", label: "Immigration Health Surcharge (3 years)", optional: false },
          ],
          notes:
            "Replaced the older Start-up + Innovator visas in April 2023. The £50k investment requirement was removed — endorsement now hinges on the idea, not capital.",
        });

        // ---------- UK Graduate Visa ----------
        records.push({
          passportIso2: passport,
          destinationIso2: "GB",
          purpose: "work",
          status: "embassy_visa",
          label: "Graduate Visa — United Kingdom",
          maxStayDays: 730,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "UKVCAS / VFS",
          requirements: [
            "Successfully completed a UK degree (Bachelor's, Master's, or PhD) at a Higher Education Provider with track-record of compliance",
            "Currently in the UK on a Student visa",
            "No English language test or savings requirement",
            "Open work permit — work for any employer, any role",
            "2 years (3 years for PhD); cannot be extended; can switch to Skilled Worker",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 60,
          applicationUrl: "https://www.gov.uk/graduate-visa",
          primarySourceUrl: "https://www.gov.uk/graduate-visa",
          fees: [
            { kind: "base", amountMinor: 88000, currency: "GBP", asOf: "2026-05-10", label: "Application fee", optional: false },
            { kind: "service", amountMinor: 155400, currency: "GBP", asOf: "2026-05-10", label: "Immigration Health Surcharge (2 years)", optional: false },
          ],
          notes:
            "Open work-permit issued to UK degree completers. Time on the Graduate visa does NOT count towards settlement — must switch to Skilled Worker for ILR pathway.",
        });

        // ---------- UK High Potential Individual ----------
        records.push({
          passportIso2: passport,
          destinationIso2: "GB",
          purpose: "work",
          status: "embassy_visa",
          label: "High Potential Individual (HPI) Visa — United Kingdom",
          maxStayDays: 730,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "UKVCAS / VFS",
          requirements: [
            "Bachelor's, Master's, or PhD from a top-50 global university (per UK Home Office's annual list)",
            "Degree awarded within the past 5 years",
            "English at B1 (CEFR) level",
            "£1,270 personal savings for 28+ days",
            "2-year visa (3 for PhD); not extendable; can switch to Skilled Worker",
          ],
          processingTimeDaysMin: 21,
          processingTimeDaysMax: 60,
          applicationUrl: "https://www.gov.uk/high-potential-individual-visa",
          primarySourceUrl: "https://www.gov.uk/high-potential-individual-visa",
          fees: [
            { kind: "base", amountMinor: 88000, currency: "GBP", asOf: "2026-05-10", label: "Application fee", optional: false },
            { kind: "service", amountMinor: 207200, currency: "GBP", asOf: "2026-05-10", label: "Immigration Health Surcharge (2 years)", optional: false },
          ],
          notes:
            "Open work-permit for high-flying recent grads from designated top universities — regardless of nationality. Annual top-50 list maintained by the UK Home Office.",
        });
      }

      // ---------- Canada Family Sponsorship (Spouse/Common-law) ----------
      if (passport !== "CA") {
        records.push({
          passportIso2: passport,
          destinationIso2: "CA",
          purpose: "family",
          status: "embassy_visa",
          label: "Family Sponsorship — Spouse or Common-law Partner (Canada)",
          maxStayDays: null, // permanent residency
          validityDays: null,
          entriesAllowed: "permanent",
          passportValidityMonthsRequired: 12,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "VFS / Canadian visa office",
          requirements: [
            "Sponsor must be a Canadian citizen or permanent resident, 18+",
            "Sponsor must commit to financially supporting the partner for 3 years",
            "Genuine relationship: married OR common-law (12+ months cohabitation) OR conjugal (separated by exceptional barriers)",
            "Outland (processed at home country) or Inland (already in Canada) options",
            "Open work permit available during application processing",
          ],
          processingTimeDaysMin: 240,
          processingTimeDaysMax: 365,
          applicationUrl:
            "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-spouse-partner-children.html",
          primarySourceUrl:
            "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship.html",
          fees: [
            { kind: "base", amountMinor: 115000, currency: "CAD", asOf: "2026-05-10", label: "Sponsor + principal applicant fees + RPRF", optional: false },
            { kind: "biometrics", amountMinor: 8500, currency: "CAD", asOf: "2026-05-10", label: "Biometrics fee", optional: false },
          ],
          notes:
            "Permanent residency directly upon approval. After 3 years of physical presence in Canada, eligible for Canadian citizenship. Same-sex partnerships fully recognised.",
        });

        // ---------- Canada Super Visa (parents/grandparents) ----------
        records.push({
          passportIso2: passport,
          destinationIso2: "CA",
          purpose: "family",
          status: "embassy_visa",
          label: "Super Visa (parents & grandparents) — Canada",
          maxStayDays: 1825, // 5-year stays
          validityDays: 3650, // valid 10 years
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 12,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "VFS / Canadian visa office",
          requirements: [
            "Parent or grandparent of a Canadian citizen / permanent resident",
            "Letter of invitation + financial support evidence from the Canadian sponsor",
            "Sponsor's income at or above the Low-Income Cut-Off (LICO)",
            "Private medical insurance from a Canadian insurer for 1+ year, ≥ CAD$100k coverage",
            "Multiple-entry visa valid up to 10 years; each stay up to 5 years (was 2 years pre-2022)",
          ],
          processingTimeDaysMin: 60,
          processingTimeDaysMax: 180,
          applicationUrl:
            "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html",
          primarySourceUrl:
            "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html",
          fees: [
            { kind: "base", amountMinor: 10000, currency: "CAD", asOf: "2026-05-10", label: "Visitor visa fee", optional: false },
            { kind: "biometrics", amountMinor: 8500, currency: "CAD", asOf: "2026-05-10", label: "Biometrics fee", optional: false },
          ],
          notes:
            "Far easier than the Parents and Grandparents (PGP) sponsorship lottery — Super Visa has no annual cap, no lottery, and lets parents stay continuously for up to 5 years per entry.",
        });
      }

      // ---------- Bahamas Student Permit ----------
      // Issued by the Department of Immigration. Required for non-Bahamian
      // students enrolled at recognised Bahamian institutions (University
      // of The Bahamas, BTVI, Eugene Dupuch Law School, etc.). Renewable
      // annually per academic year. Bahamian dollar is pegged 1:1 with USD.
      // Source: https://www.bahamas.gov.bs/wps/portal/public/gov/government/services/immigration
      if (passport !== "BS") {
        records.push({
          passportIso2: passport,
          destinationIso2: "BS",
          purpose: "study",
          status: "embassy_visa",
          label: "Student Permit — The Bahamas",
          maxStayDays: 365,
          validityDays: 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: true,
          biometricsRequired: false,
          requirements: [
            "Letter of acceptance from a recognised Bahamian institution (UB, BTVI, Eugene Dupuch Law School, etc.)",
            "Proof of funds covering tuition + living costs for the academic year",
            "Police clearance (good-conduct certificate) from each country resided in 5+ years",
            "Medical examination certificate (TB clearance) from a registered physician",
            "Two passport-size photographs",
            "Valid passport (6+ months validity beyond expected stay)",
            "Renewable annually for the duration of the programme",
          ],
          processingTimeDaysMin: 28,
          processingTimeDaysMax: 56,
          applicationUrl:
            "https://www.bahamas.gov.bs/wps/portal/public/gov/government/services/immigration/student%20permit",
          primarySourceUrl:
            "https://www.bahamas.gov.bs/wps/portal/public/gov/government/services/immigration",
          fees: [
            { kind: "base", amountMinor: 10000, currency: "BSD", asOf: "2026-05-11", label: "Student Permit application fee", optional: false },
          ],
          notes:
            "The Bahamas operates a Student Permit system rather than a separate Study Visa. CARICOM nationals may instead study under the Skilled National regime; nationals who need a visitor visa must obtain that first and convert on arrival.",
        });
      }
    }
    return { records };
  },
};
