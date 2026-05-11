/**
 * Total-coverage adapter — Wave 2 — Canada + Australia + New Zealand.
 *
 * Programs covered (11):
 *   CA Study Permit
 *   CA Start-up Visa (PR via founder route)
 *   CA Spousal Sponsorship (in-Canada + outland)
 *   CA Open Work Permit (spouse / common-law of student or worker)
 *   AU Subclass 189 — Skilled Independent (PR)
 *   AU Subclass 190 — Skilled Nominated (PR)
 *   AU Subclass 491 — Skilled Regional (Provisional)
 *   AU Subclass 100 — Partner (Permanent)
 *   AU Subclass 462 — Work and Holiday
 *   NZ Accredited Employer Work Visa (AEWV)
 *   NZ Partner of a New Zealander Resident Visa
 *
 * Hand-encoded from canada.ca / immi.homeaffairs.gov.au / immigration.govt.nz.
 * Refresh quarterly.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const ALL = COUNTRY_LIST.map((c) => c.iso2);

// AU Subclass 462 (Work and Holiday) is tied to bilateral agreements —
// open to a fixed list of nationalities. Source: immi.homeaffairs.gov.au.
const AU_WH_462_COUNTRIES = new Set([
  "AR", "AT", "BE", "BR", "CL", "CN", "CZ", "EC", "FR", "GR", "HU", "ID",
  "IL", "LU", "MY", "MN", "PE", "PH", "PL", "PT", "SM", "SG", "SK", "SI",
  "ES", "CH", "TH", "TR", "US", "UY", "VN",
]);

export const totalCoverageCaAuNzAdapter: Adapter = {
  metadata: {
    id: "total_coverage_ca_au_nz",
    name: "Total coverage — Canada / Australia / New Zealand (Study Permit / Start-up / Spousal / OWP / 189 / 190 / 491 / 100 / 462 / AEWV / Partner Resident)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [
      "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
      "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html",
      "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-spouse.html",
      "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/open-work-permit.html",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/partner-onshore/permanent-100",
      "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462",
      "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/accredited-employer-work-visa",
      "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/partner-of-a-new-zealander-resident-visa",
    ],
    fixturePath: "src/scrapers/sources/__fixtures__/total_coverage_ca_au_nz.json",
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "total_coverage_ca_au_nz" }), fetchUrl: "manual://total_coverage_ca_au_nz" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      // ============================================================
      // CANADA
      // ============================================================

      // ---------- CA Study Permit ----------
      if (passport !== "CA") {
        records.push({
          passportIso2: passport,
          destinationIso2: "CA",
          purpose: "study",
          status: "embassy_visa",
          label: "Study Permit — Canada",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 1,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Visa Application Centre",
          requirements: [
            "Letter of acceptance from a Designated Learning Institution (DLI)",
            "Provincial Attestation Letter (PAL) from the province — required since 2024 cap",
            "Proof of funds — CAD$22,895/year (single applicant, outside Quebec) or CAD$25,150 (Quebec) + tuition",
            "Police certificates if required by the visa office",
            "Medical exam if you've lived 6+ months in a designated country in the past year",
            "Spouse may apply for Open Work Permit (since 2024, restricted to graduate-level + select professional programs)",
            "Post-Graduation Work Permit eligible on completion",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 120,
          applicationUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
          primarySourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
          fees: [
            { kind: "base", amountMinor: 15000, currency: "CAD", asOf: "2026-05-11", label: "Study Permit application fee", optional: false },
            { kind: "biometrics", amountMinor: 8500, currency: "CAD", asOf: "2026-05-11", label: "Biometrics fee", optional: false },
          ],
          notes: "IRCC introduced a 2-year cap on study permits in 2024 — provinces issue PALs allocating their share. Spousal OWP rules tightened 2024 — only graduate-level / select professional programs qualify.",
        });
      }

      // ---------- CA Start-up Visa ----------
      if (passport !== "CA") {
        records.push({
          passportIso2: passport,
          destinationIso2: "CA",
          purpose: "work",
          status: "embassy_visa",
          label: "Start-up Visa — Canada",
          maxStayDays: 9999,
          validityDays: 1095,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Visa Application Centre",
          requirements: [
            "Letter of Support from a designated organisation: Venture Capital fund (CAD$200k commitment) / Angel Investor group (CAD$75k) / Business Incubator (acceptance, no funding required)",
            "Qualifying business: each applicant holds 10%+, applicants and designated org together hold >50%",
            "Up to 5 co-founders per business",
            "CLB 5 in English or French (IELTS 5.0 in all bands, or TEF equivalent)",
            "Proof of settlement funds (~CAD$13,757 for single applicant, scaling by family size)",
            "Permanent Resident status granted at approval — no provincial nomination needed",
            "Open Work Permit available while waiting for PR",
          ],
          processingTimeDaysMin: 365,
          processingTimeDaysMax: 1095,
          applicationUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html",
          primarySourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html",
          fees: [
            { kind: "base", amountMinor: 173075, currency: "CAD", asOf: "2026-05-11", label: "Application fee (principal)", optional: false },
            { kind: "service", amountMinor: 57500, currency: "CAD", asOf: "2026-05-11", label: "Right of Permanent Residence Fee", optional: false },
          ],
          notes: "Caps introduced 2024: max 10 applications per designated organisation per year. Processing extended significantly — most cases now 2–3 years. The Open Work Permit while waiting keeps founders legally building in Canada.",
        });
      }

      // ---------- CA Spousal Sponsorship ----------
      if (passport !== "CA") {
        records.push({
          passportIso2: passport,
          destinationIso2: "CA",
          purpose: "family",
          status: "embassy_visa",
          label: "Spousal Sponsorship (Outland / Inland) — Canada",
          maxStayDays: 9999,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Visa Application Centre",
          requirements: [
            "Canadian citizen or permanent resident sponsor, aged 18+, undertaking 3-year financial commitment",
            "Bona-fide relationship evidence (marriage certificate, common-law cohabitation 12+ months, conjugal evidence)",
            "Sponsor not on social assistance (unless disability)",
            "Police certificate from every country lived in 6+ months since age 18",
            "Medical exam at panel physician",
            "Outland (applying from abroad): processing ~12-18 months, faster overall",
            "Inland (applying from within Canada on visitor status): same processing, but you can request an Open Work Permit while waiting",
            "PR granted on approval; conditional status removed since 2017",
          ],
          processingTimeDaysMin: 240,
          processingTimeDaysMax: 540,
          applicationUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-spouse.html",
          primarySourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-spouse.html",
          fees: [
            { kind: "base", amountMinor: 169250, currency: "CAD", asOf: "2026-05-11", label: "Sponsorship + processing + RPRF (couple)", optional: false },
            { kind: "biometrics", amountMinor: 8500, currency: "CAD", asOf: "2026-05-11", label: "Biometrics fee", optional: false },
          ],
          notes: "Canada is among the most spouse-immigration-friendly countries — no minimum income requirement for the sponsor, no language test for the foreign spouse. Same-sex partnerships fully recognised.",
        });
      }

      // ---------- CA Open Work Permit (spousal accompaniment) ----------
      if (passport !== "CA") {
        records.push({
          passportIso2: passport,
          destinationIso2: "CA",
          purpose: "work",
          status: "embassy_visa",
          label: "Open Work Permit (Spouse / Common-Law) — Canada",
          maxStayDays: 1095,
          validityDays: 1095,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 1,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Visa Application Centre",
          requirements: [
            "Principal spouse/partner holds a valid work permit (TEER 0/1, or select TEER 2/3 trades) OR study permit at a graduate-level / select professional programme",
            "Marriage certificate or 12+ months common-law cohabitation evidence",
            "No LMIA needed; you can work for any employer in any role",
            "Tied to the principal's permit duration",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 120,
          applicationUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/open-work-permit.html",
          primarySourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/open-work-permit.html",
          fees: [
            { kind: "base", amountMinor: 15500, currency: "CAD", asOf: "2026-05-11", label: "Open Work Permit fee", optional: false },
            { kind: "biometrics", amountMinor: 8500, currency: "CAD", asOf: "2026-05-11", label: "Biometrics fee", optional: false },
          ],
          notes: "Rules tightened in 2024: spousal OWP for international students is now restricted to those whose principal is in a graduate-level / select professional programme. Worker spousal OWP narrowed to TEER 0/1 + select TEER 2/3.",
        });
      }

      // ============================================================
      // AUSTRALIA
      // ============================================================

      // ---------- AU Subclass 189 — Skilled Independent ----------
      if (passport !== "AU") {
        records.push({
          passportIso2: passport,
          destinationIso2: "AU",
          purpose: "work",
          status: "embassy_visa",
          label: "Subclass 189 — Skilled Independent (Permanent)",
          maxStayDays: 9999,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "ImmiAccount / Australian Visa Application Centre",
          requirements: [
            "Occupation on the Medium and Long-term Strategic Skills List (MLTSSL)",
            "Skills Assessment from the relevant assessing authority (Engineers Australia, ACS for IT, CPA, VETASSESS, etc.)",
            "Minimum 65 points in the points test — competitive scores typically 85-100+",
            "Under 45 at time of invitation",
            "Competent English (IELTS 6.0 in all bands, or equivalent PTE/TOEFL/OET)",
            "Submit Expression of Interest in SkillSelect; wait for invitation to apply",
            "Permanent Resident status from grant — no employer sponsorship needed",
          ],
          processingTimeDaysMin: 240,
          processingTimeDaysMax: 730,
          applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
          primarySourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
          fees: [
            { kind: "base", amountMinor: 489500, currency: "AUD", asOf: "2026-05-11", label: "Visa application charge (main applicant)", optional: false },
          ],
          notes: "The most desirable Australian skilled visa — full PR from grant, no employer or state tie. Cap is small (~16,500/year); invitation rounds heavily favour 85-95+ point profiles in high-demand fields.",
        });
      }

      // ---------- AU Subclass 190 — Skilled Nominated ----------
      if (passport !== "AU") {
        records.push({
          passportIso2: passport,
          destinationIso2: "AU",
          purpose: "work",
          status: "embassy_visa",
          label: "Subclass 190 — Skilled Nominated (Permanent)",
          maxStayDays: 9999,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "ImmiAccount / Australian Visa Application Centre",
          requirements: [
            "Occupation on the Short-term, Medium-term or Regional Occupation List",
            "Nomination from a state or territory government (each has its own occupation list and criteria)",
            "Skills assessment from the relevant authority",
            "65 points minimum (state nomination contributes +5 to your score)",
            "Under 45 at time of invitation",
            "Competent English",
            "Commitment to live and work in the nominating state for 2 years (moral obligation)",
            "PR from grant",
          ],
          processingTimeDaysMin: 240,
          processingTimeDaysMax: 730,
          applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190",
          primarySourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190",
          fees: [
            { kind: "base", amountMinor: 489500, currency: "AUD", asOf: "2026-05-11", label: "Visa application charge (main applicant)", optional: false },
          ],
          notes: "State nomination is hyper-competitive — most states publish their criteria quarterly and prioritise critical-skill shortages. Each state's process is separate (NSW, VIC, QLD all run their own ROIs/EOIs).",
        });
      }

      // ---------- AU Subclass 491 — Skilled Regional Provisional ----------
      if (passport !== "AU") {
        records.push({
          passportIso2: passport,
          destinationIso2: "AU",
          purpose: "work",
          status: "embassy_visa",
          label: "Subclass 491 — Skilled Work Regional (Provisional)",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "ImmiAccount / Australian Visa Application Centre",
          requirements: [
            "State or territory nomination, OR sponsorship by an eligible family member living in regional Australia",
            "Occupation on the regional occupation list for the nominating state",
            "Skills assessment + 65 points (state nomination contributes +15 in the regional category)",
            "Live, work and study in a designated regional area for 3 years",
            "Eligible to apply for the Subclass 191 (Permanent) after 3 years if you've earned AUD$53,900+ annually and met conditions",
          ],
          processingTimeDaysMin: 180,
          processingTimeDaysMax: 540,
          applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491",
          primarySourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491",
          fees: [
            { kind: "base", amountMinor: 489500, currency: "AUD", asOf: "2026-05-11", label: "Visa application charge (main applicant)", optional: false },
          ],
          notes: "Pathway to PR via Subclass 191 after 3 years. 'Regional' = everywhere except Sydney, Melbourne and Brisbane — Adelaide, Perth, Hobart and Canberra all count as regional.",
        });
      }

      // ---------- AU Subclass 100 — Partner (Permanent) ----------
      if (passport !== "AU") {
        records.push({
          passportIso2: passport,
          destinationIso2: "AU",
          purpose: "family",
          status: "embassy_visa",
          label: "Subclass 100 / 309 — Partner (Permanent / Provisional)",
          maxStayDays: 9999,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "ImmiAccount / Australian Visa Application Centre",
          requirements: [
            "Married to, in a de facto relationship with, or engaged to an Australian citizen / PR / eligible NZ citizen",
            "De facto: at least 12 months cohabitation (registered relationships waive this)",
            "Strong relationship evidence across financial, household, social, and commitment dimensions",
            "Sponsor must be 18+, have no character / sponsorship limitations, undertake financial commitment",
            "Two-stage processing: Subclass 309 provisional first, then 100 permanent after 2 years (or sometimes concurrently if the relationship is established)",
            "Police certificates from every country lived in 12+ months in the past 10 years",
            "Medical exam",
          ],
          processingTimeDaysMin: 365,
          processingTimeDaysMax: 1095,
          applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/partner-onshore/permanent-100",
          primarySourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/partner-onshore/permanent-100",
          fees: [
            { kind: "base", amountMinor: 935500, currency: "AUD", asOf: "2026-05-11", label: "Combined application charge (one applicant)", optional: false },
          ],
          notes: "Australia's partner visa is one of the most expensive in the world (~AUD$9k+ for couples, more for dependants). Processing has stretched significantly — 12-36 months is typical even for straightforward cases.",
        });
      }

      // ---------- AU Subclass 462 — Work and Holiday ----------
      if (AU_WH_462_COUNTRIES.has(passport)) {
        records.push({
          passportIso2: passport,
          destinationIso2: "AU",
          purpose: "work",
          status: "embassy_visa",
          label: "Subclass 462 — Work and Holiday",
          maxStayDays: 365,
          validityDays: 365,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Aged 18-30 at time of application (35 for some bilateral agreements)",
            "Hold a passport from a 462 partner country",
            "Tertiary qualification OR 2+ years of post-secondary study (some countries exempt)",
            "Sufficient funds (AUD$5,000+ recommended) + return ticket",
            "Letter of Government Support for some nationalities (China, Vietnam, Spain, Singapore, etc.)",
            "Renewable twice (2nd and 3rd year) by completing 3 / 6 months of specified work (agriculture, tourism, hospitality in northern Australia)",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 60,
          applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462",
          primarySourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462",
          fees: [
            { kind: "base", amountMinor: 65000, currency: "AUD", asOf: "2026-05-11", label: "Visa application charge", optional: false },
          ],
          notes: "Distinct from 417 (Working Holiday — different country list, mostly Commonwealth + W Europe). 462 has tertiary-study and language requirements 417 doesn't. Both extend to 2nd/3rd year via specified rural work.",
        });
      }

      // ============================================================
      // NEW ZEALAND
      // ============================================================

      // ---------- NZ AEWV — Accredited Employer Work Visa ----------
      if (passport !== "NZ") {
        records.push({
          passportIso2: passport,
          destinationIso2: "NZ",
          purpose: "work",
          status: "embassy_visa",
          label: "Accredited Employer Work Visa (AEWV)",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 3,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Job offer from an INZ-accredited employer (employer must hold valid accreditation)",
            "Role passes the Job Check — wage at or above the NZ median wage (NZ$31.61/hr 2024) OR on the Green List",
            "Skill / experience matching the role (3 years experience OR a relevant qualification for ANZSCO 4-5 roles)",
            "English at IELTS 4.0+ for ANZSCO 1-3 roles, no English requirement for higher-skill roles",
            "Police certificates from each country lived in 5+ years",
            "X-ray + medical exam for stays over 12 months",
            "Path to Resident Visa via Skilled Migrant if you accumulate sufficient points",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 90,
          applicationUrl: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/accredited-employer-work-visa",
          primarySourceUrl: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/accredited-employer-work-visa",
          fees: [
            { kind: "base", amountMinor: 75000, currency: "NZD", asOf: "2026-05-11", label: "AEWV application fee", optional: false },
            { kind: "service", amountMinor: 49500, currency: "NZD", asOf: "2026-05-11", label: "Immigration Levy", optional: false },
          ],
          notes: "Replaced the Essential Skills Work Visa in mid-2022. 3-stage employer process: Accreditation → Job Check → Worker hires. Green List occupations get faster pathways and Tier 1 / Tier 2 lead directly to PR.",
        });
      }

      // ---------- NZ Partner of a New Zealander Resident Visa ----------
      if (passport !== "NZ") {
        records.push({
          passportIso2: passport,
          destinationIso2: "NZ",
          purpose: "family",
          status: "embassy_visa",
          label: "Partner of a New Zealander Resident Visa",
          maxStayDays: 9999,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Partner is a New Zealand citizen or resident",
            "Live together in a genuine and stable relationship for 12+ months",
            "Relationship evidence: joint bank accounts, tenancy, shared bills, communication during separations, statements from family/friends",
            "Partner meets eligibility (no recent supporter of more than one previous partner, no character issues)",
            "Police certificates + medical exam",
            "Resident status granted on approval (path to PR after 24 months + good character)",
          ],
          processingTimeDaysMin: 90,
          processingTimeDaysMax: 365,
          applicationUrl: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/partner-of-a-new-zealander-resident-visa",
          primarySourceUrl: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/partner-of-a-new-zealander-resident-visa",
          fees: [
            { kind: "base", amountMinor: 230000, currency: "NZD", asOf: "2026-05-11", label: "Resident Visa application fee", optional: false },
          ],
          notes: "If your relationship is under 12 months you'd apply for a Partner of a New Zealander Work Visa first, then transition to the Resident Visa at 12 months. Same-sex and de facto partners fully recognised.",
        });
      }
    }

    return { records };
  },
};
