/**
 * Total-coverage adapter — Wave 3 — Japan, Thailand, Malaysia, Singapore.
 *
 * Programs covered (13):
 *   JP Engineer / Specialist in Humanities / International Services
 *   JP Business Manager
 *   JP Spouse of Japanese National / Long-Term Resident
 *   TH Long-Term Resident Visa (LTR) — 4 categories
 *   TH Destination Thailand Visa (DTV) — 5-year multi-entry remote-work
 *   TH Non-Immigrant O — Retirement (50+)
 *   MY MM2H — Malaysia My Second Home
 *   MY DE Rantau Nomad Pass
 *   MY Employment Pass
 *   SG ONE Pass — Overseas Networks & Expertise Pass
 *   SG EntrePass
 *   SG Tech.Pass
 *   SG S Pass
 *
 * Hand-encoded from immi.go.jp / mfa.go.th / imi.gov.my / mom.gov.sg.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const ALL = COUNTRY_LIST.map((c) => c.iso2);

export const totalCoverageAsiaAdapter: Adapter = {
  metadata: {
    id: "total_coverage_asia",
    name: "Total coverage — JP / TH / MY / SG (Engineer/Specialist / Business Manager / Spouse / LTR / DTV / Retirement / MM2H / DE Rantau / EP / ONE Pass / EntrePass / Tech.Pass / S Pass)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [
      "https://www.moj.go.jp/isa/applications/procedures/16-2.html",
      "https://www.moj.go.jp/isa/applications/procedures/16-3.html",
      "https://www.mfa.go.th/",
      "https://www.ltr.boi.go.th/",
      "https://www.thaievisa.go.th/dtv",
      "https://www.imi.gov.my/portal2017/index.php/en/main-services/mm2h",
      "https://mdec.my/derantau",
      "https://www.mom.gov.sg/passes-and-permits/one-pass",
      "https://www.mom.gov.sg/passes-and-permits/entrepass",
      "https://www.mom.gov.sg/passes-and-permits/tech-pass",
      "https://www.mom.gov.sg/passes-and-permits/s-pass",
    ],
    fixturePath: "src/scrapers/sources/__fixtures__/total_coverage_asia.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "total_coverage_asia" }), fetchUrl: "manual://total_coverage_asia" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      // ============================================================
      // JAPAN
      // ============================================================

      // ---------- JP Engineer / Specialist in Humanities / International Services ----------
      if (passport !== "JP") {
        records.push({
          passportIso2: passport,
          destinationIso2: "JP",
          purpose: "work",
          status: "embassy_visa",
          label: "Engineer / Specialist in Humanities / International Services — Japan",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Job offer from a Japanese employer in a qualifying role: engineering, IT, science, accountancy, law, translation, marketing, design, education",
            "Bachelor's degree OR 10 years relevant work experience (3 years for translation/interpretation/design)",
            "Salary comparable to a Japanese national in the same role",
            "Certificate of Eligibility (COE) issued by Japanese immigration — employer typically sponsors",
            "Apply at the Japanese embassy / consulate in your home country once COE issued",
            "Periods of stay: 3 months, 1, 3, or 5 years (5 years for senior / experienced applicants)",
            "Spouse + children eligible for Dependent visa",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 90,
          applicationUrl: "https://www.moj.go.jp/isa/applications/procedures/16-2.html",
          primarySourceUrl: "https://www.moj.go.jp/isa/applications/procedures/16-2.html",
          fees: [
            // JPY has no subunit (minorFactor=1). Japanese long-stay visa
            // multi-entry stamp = ¥6,000 per MOFA schedule. COE itself is
            // free; consular stamping is the only out-of-pocket cost.
            { kind: "base", amountMinor: 6000, currency: "JPY", asOf: "2026-05-11", label: "Visa issuance fee (multi-entry)", optional: false },
          ],
          notes: "Japan's most common skilled-worker visa. Distinct from Highly Skilled Professional (which uses a points test and gives 5-year stays from day one). COE is the slow step — visa stamping is quick once COE arrives.",
        });
      }

      // ---------- JP Business Manager ----------
      if (passport !== "JP") {
        records.push({
          passportIso2: passport,
          destinationIso2: "JP",
          purpose: "work",
          status: "embassy_visa",
          label: "Business Manager Visa — Japan",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: true,
          biometricsRequired: false,
          requirements: [
            "Establish a business in Japan with ¥5 million+ paid-in capital OR 2+ full-time employees who are Japanese / PR holders",
            "Physical office space in Japan (not a virtual / co-working address for first-time applicants)",
            "Detailed business plan demonstrating viability",
            "Manage or operate the business in Japan as Director / Executive",
            "Certificate of Eligibility issued, then visa stamp at Japanese embassy",
            "5-year stay possible for senior / well-established managers",
          ],
          processingTimeDaysMin: 60,
          processingTimeDaysMax: 180,
          applicationUrl: "https://www.moj.go.jp/isa/applications/procedures/16-3.html",
          primarySourceUrl: "https://www.moj.go.jp/isa/applications/procedures/16-3.html",
          fees: [
            // JPY has no subunit (minorFactor=1). Japanese long-stay visa
            // multi-entry stamp = ¥6,000 per MOFA schedule. COE itself is
            // free; consular stamping is the only out-of-pocket cost.
            { kind: "base", amountMinor: 6000, currency: "JPY", asOf: "2026-05-11", label: "Visa issuance fee (multi-entry)", optional: false },
          ],
          notes: "Common route for founders and SME importers. The ¥5M capital can come from personal funds. First renewal scrutinises whether the business is actually operating — pre-revenue plans face tougher review.",
        });
      }

      // ---------- JP Spouse of Japanese / Long-Term Resident ----------
      if (passport !== "JP") {
        records.push({
          passportIso2: passport,
          destinationIso2: "JP",
          purpose: "family",
          status: "embassy_visa",
          label: "Spouse of Japanese National / Long-Term Resident — Japan",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Married to a Japanese national OR a child / step-child of one",
            "Marriage registered in Japan and in your home country",
            "Certificate of Eligibility filed at regional immigration bureau in Japan (Japanese spouse usually files on your behalf)",
            "Relationship evidence: marriage certificate, photos, communication, joint finances",
            "Tax records of the Japanese spouse (proof of ability to support)",
            "Stay lengths: 1 / 3 / 5 years (renewable); 5-year stay typical after a few years",
            "Eligible for Permanent Residence after 3 years of marriage + 1 year living in Japan",
            "Full work rights — no employer restriction",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 90,
          applicationUrl: "https://www.moj.go.jp/isa/applications/procedures/16-9-2.html",
          primarySourceUrl: "https://www.moj.go.jp/isa/applications/procedures/16-9-2.html",
          fees: [
            // JPY has no subunit (minorFactor=1). Japanese long-stay visa
            // multi-entry stamp = ¥6,000 per MOFA schedule. COE itself is
            // free; consular stamping is the only out-of-pocket cost.
            { kind: "base", amountMinor: 6000, currency: "JPY", asOf: "2026-05-11", label: "Visa issuance fee (multi-entry)", optional: false },
          ],
          notes: "Fastest route to Permanent Residence in Japan — 3 years vs the standard 10. Full work rights from day one, no employer / role restriction. Marriage must be genuine; immigration interviews are common at renewal for short-marriage cases.",
        });
      }

      // ============================================================
      // THAILAND
      // ============================================================

      // ---------- TH Long-Term Resident Visa (LTR) ----------
      if (passport !== "TH") {
        records.push({
          passportIso2: passport,
          destinationIso2: "TH",
          purpose: "work",
          status: "embassy_visa",
          label: "Long-Term Resident Visa (LTR) — Thailand",
          maxStayDays: 3650,
          validityDays: 3650,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Choose one of four categories: Wealthy Global Citizen / Wealthy Pensioner / Work-from-Thailand Professional / Highly Skilled Professional",
            "Wealthy Global Citizen: US$1M+ assets, US$80k/year income, US$500k Thai investment",
            "Wealthy Pensioner: 50+, US$80k/year income (or US$40-80k + US$250k Thai investment)",
            "Work-from-Thailand Professional: US$80k/year income, employed by a foreign company with US$150M+ revenue, 5+ years experience",
            "Highly Skilled Professional: US$80k+ in target industries (also viable at US$40k + Master's), Thai government / regulated employer",
            "10-year visa (renewable), 5-year work permit, tax benefits, fast-track at airports, 17% flat tax for HSP",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 60,
          applicationUrl: "https://www.ltr.boi.go.th/",
          primarySourceUrl: "https://www.boi.go.th/en/ltr",
          fees: [
            { kind: "base", amountMinor: 5000000, currency: "THB", asOf: "2026-05-11", label: "LTR Visa government fee", optional: false },
          ],
          notes: "Thailand's flagship long-term residence programme launched 2022. The 17% flat-tax rate for Highly Skilled Professionals beats most other Asian alternatives. Includes dependants (spouse + up to 4 children).",
        });
      }

      // ---------- TH Destination Thailand Visa (DTV) ----------
      if (passport !== "TH") {
        records.push({
          passportIso2: passport,
          destinationIso2: "TH",
          purpose: "work",
          status: "e_visa",
          label: "Destination Thailand Visa (DTV) — 5-year remote work",
          maxStayDays: 180,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Remote worker / digital nomad with overseas employer or freelance income — OR — soft-power activity (Muay Thai, Thai cuisine, traditional Thai medicine, language learning, etc.)",
            "Minimum 500,000 THB (~US$14,000) in bank for 6+ months",
            "Proof of remote employment or freelance work",
            "Health insurance for the stay",
            "180-day stays per entry, renewable in-country for another 180 days (max 360 days/year)",
            "5-year multi-entry validity — can come and go",
          ],
          processingTimeDaysMin: 7,
          processingTimeDaysMax: 21,
          applicationUrl: "https://www.thaievisa.go.th/",
          primarySourceUrl: "https://www.thaievisa.go.th/",
          fees: [
            { kind: "base", amountMinor: 1000000, currency: "THB", asOf: "2026-05-11", label: "DTV fee", optional: false },
          ],
          notes: "Launched July 2024. Game-changing for digital nomads — much simpler than the Smart Visa, much cheaper than the LTR. Includes a 'Thai soft-power' category for people learning Muay Thai / Thai cooking / Thai language.",
        });
      }

      // ---------- TH Non-Immigrant O — Retirement ----------
      if (passport !== "TH") {
        records.push({
          passportIso2: passport,
          destinationIso2: "TH",
          purpose: "work",
          status: "embassy_visa",
          label: "Non-Immigrant O Retirement Visa — Thailand (50+)",
          maxStayDays: 365,
          validityDays: 365,
          entriesAllowed: "single",
          passportValidityMonthsRequired: 18,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Aged 50 or older",
            "EITHER: 800,000 THB in a Thai bank account (held for 2 months before applying), OR: 65,000 THB/month in income (verified by your home country embassy), OR: a combination totalling 800,000 THB/year",
            "Apply for Non-Immigrant O at a Thai embassy or after arrival on a tourist visa (90-day O-A or 1-year O-X variants available for some nationalities)",
            "Health insurance with minimum coverage (40,000 THB outpatient, 400,000 THB inpatient)",
            "No work permitted on this visa",
            "Annual renewal — keep the bank balance OR income for the year",
          ],
          processingTimeDaysMin: 7,
          processingTimeDaysMax: 30,
          applicationUrl: "https://www.thaievisa.go.th/",
          primarySourceUrl: "https://www.immigration.go.th/",
          fees: [
            { kind: "base", amountMinor: 200000, currency: "THB", asOf: "2026-05-11", label: "Visa application fee", optional: false },
          ],
          notes: "Most popular retirement-residency programme in Asia. O-A and O-X variants (issued in your home country) give longer terms but require health insurance bought from a Thai insurer. 90-day reporting at immigration office mandatory.",
        });
      }

      // ============================================================
      // MALAYSIA
      // ============================================================

      // ---------- MY MM2H — Malaysia My Second Home ----------
      if (passport !== "MY") {
        records.push({
          passportIso2: passport,
          destinationIso2: "MY",
          purpose: "work",
          status: "embassy_visa",
          label: "Malaysia My Second Home (MM2H) — Silver / Gold / Platinum",
          maxStayDays: 3650,
          validityDays: 3650,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 18,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Malaysian embassy / Immigration Office on arrival",
          requirements: [
            "Three tiers: Silver (5-year, RM500k fixed deposit + RM50k income), Gold (15-year, RM2M deposit), Platinum (20-year, RM5M deposit + property purchase RM1M+)",
            "Aged 21+ (50+ for the Sabah Special MM2H variant — relaxed criteria)",
            "Clean criminal record from home country (police certificate)",
            "Health insurance covering Malaysia",
            "Medical exam at an approved panel clinic",
            "Cannot work in Malaysia on standard MM2H — Platinum tier permits investments / a part-time directorship",
            "Spouse + unmarried children under 21 + parents 60+ can be dependants",
          ],
          processingTimeDaysMin: 90,
          processingTimeDaysMax: 365,
          applicationUrl: "https://www.imi.gov.my/portal2017/index.php/en/main-services/mm2h",
          primarySourceUrl: "https://www.imi.gov.my/portal2017/index.php/en/main-services/mm2h",
          fees: [
            { kind: "base", amountMinor: 300000, currency: "MYR", asOf: "2026-05-11", label: "MM2H application fee (Silver)", optional: false },
          ],
          notes: "Programme rebooted 2024 with tiered system replacing the earlier single category. Sabah Special MM2H run by the Sabah state government has substantially relaxed criteria (RM150k deposit, 50+).",
        });
      }

      // ---------- MY DE Rantau Nomad Pass ----------
      if (passport !== "MY") {
        records.push({
          passportIso2: passport,
          destinationIso2: "MY",
          purpose: "work",
          status: "e_visa",
          label: "DE Rantau Nomad Pass — Malaysia",
          maxStayDays: 365,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 14,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: false,
          requirements: [
            "Digital freelancer or remote worker for a foreign employer in IT / digital roles (developer, designer, content, marketing, consulting)",
            "Annual income US$24,000+",
            "Employment contract / freelance contracts showing 3+ months of ongoing work",
            "Health insurance covering Malaysia",
            "12-month pass renewable for a further 12 months",
            "Cannot accept Malaysian employment on this pass",
            "Spouse + children eligible as dependants",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 60,
          applicationUrl: "https://mdec.my/derantau",
          primarySourceUrl: "https://mdec.my/derantau",
          fees: [
            { kind: "base", amountMinor: 100000, currency: "MYR", asOf: "2026-05-11", label: "DE Rantau Nomad Pass fee", optional: false },
            { kind: "service", amountMinor: 50000, currency: "MYR", asOf: "2026-05-11", label: "Dependant fee", optional: true },
          ],
          notes: "MDEC (Malaysia Digital Economy Corporation) runs this; not Immigration directly. Income threshold (US$24k) is the lowest among Asian digital-nomad visas, making it accessible to mid-career remote workers.",
        });
      }

      // ---------- MY Employment Pass ----------
      if (passport !== "MY") {
        records.push({
          passportIso2: passport,
          destinationIso2: "MY",
          purpose: "work",
          status: "embassy_visa",
          label: "Employment Pass (Category I / II / III) — Malaysia",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 18,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "Immigration Department of Malaysia",
          requirements: [
            "Employer applies through Expatriate Services Division (ESD) portal",
            "Category I: RM10,000+ monthly salary, up to 5 years",
            "Category II: RM5,000-9,999, up to 2 years",
            "Category III: RM3,000-4,999, up to 12 months (limited renewals)",
            "Relevant degree or 3+ years experience for Cat I/II",
            "Sponsoring company must hold a valid Expatriate Project Approval",
            "Spouse + children eligible for Dependent's Pass (Cat I & II only)",
          ],
          processingTimeDaysMin: 30,
          processingTimeDaysMax: 90,
          applicationUrl: "https://esd.imi.gov.my/",
          primarySourceUrl: "https://www.imi.gov.my/",
          fees: [
            { kind: "base", amountMinor: 120000, currency: "MYR", asOf: "2026-05-11", label: "Employment Pass fee (annual)", optional: false },
          ],
          notes: "Most common Malaysian work visa for foreign professionals. Cat I gives the most flexibility (longest term, dependants, easier renewal). Salary thresholds revised periodically.",
        });
      }

      // ============================================================
      // SINGAPORE
      // ============================================================

      // ---------- SG ONE Pass — Overseas Networks & Expertise Pass ----------
      if (passport !== "SG") {
        records.push({
          passportIso2: passport,
          destinationIso2: "SG",
          purpose: "work",
          status: "embassy_visa",
          label: "Overseas Networks & Expertise (ONE) Pass — Singapore",
          maxStayDays: 1825,
          validityDays: 1825,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "MOM Services Centre on arrival",
          requirements: [
            "EITHER fixed monthly salary of SG$30,000+ in your last year (or to be received in Singapore)",
            "OR achievements in arts, sports, science / academia, research (no salary threshold)",
            "OR currently leading a company in Singapore with valuation US$500M+ / market cap US$500M+ / SG$200M revenue",
            "5-year stay; renewable",
            "Hold concurrent jobs without separate work permits (start a business, freelance, consult)",
            "Spouse can work in Singapore on the LOC (Letter of Consent)",
          ],
          processingTimeDaysMin: 14,
          processingTimeDaysMax: 56,
          applicationUrl: "https://www.mom.gov.sg/passes-and-permits/one-pass",
          primarySourceUrl: "https://www.mom.gov.sg/passes-and-permits/one-pass",
          fees: [
            { kind: "base", amountMinor: 13000, currency: "SGD", asOf: "2026-05-11", label: "ONE Pass application + issuance", optional: false },
          ],
          notes: "Singapore's flagship top-talent visa launched Jan 2023. Far more flexible than the Employment Pass — no employer sponsorship needed, and you can hold multiple concurrent jobs / found a company.",
        });
      }

      // ---------- SG EntrePass ----------
      if (passport !== "SG") {
        records.push({
          passportIso2: passport,
          destinationIso2: "SG",
          purpose: "work",
          status: "embassy_visa",
          label: "EntrePass — Singapore (founder route)",
          maxStayDays: 730,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "MOM Services Centre on arrival",
          requirements: [
            "Found or intend to found a private limited company in Singapore",
            "Meet 1 of 3 profiles: Entrepreneur (funding from accredited VC, accelerator graduate, IP, or research collaboration), Innovator (IP / strong research record), Investor (VC fund manager track record)",
            "Renewal at year 2 requires: SG$100k+ business spend + 3 local hires (1 SC/PR for first renewal, 6 for subsequent)",
            "Spouse + children under 21 eligible for Dependant's Pass at year-2 renewal",
            "Path to PR after extended track record",
          ],
          processingTimeDaysMin: 56,
          processingTimeDaysMax: 84,
          applicationUrl: "https://www.mom.gov.sg/passes-and-permits/entrepass",
          primarySourceUrl: "https://www.mom.gov.sg/passes-and-permits/entrepass",
          fees: [
            { kind: "base", amountMinor: 22500, currency: "SGD", asOf: "2026-05-11", label: "EntrePass application + issuance", optional: false },
          ],
          notes: "Singapore's founder visa — stricter than ONE Pass on what 'real business' means but doesn't require salary history. Renewal at year 2 has aggressive hiring milestones; many founders graduate to EP at that point.",
        });
      }

      // ---------- SG Tech.Pass ----------
      if (passport !== "SG") {
        records.push({
          passportIso2: passport,
          destinationIso2: "SG",
          purpose: "work",
          status: "embassy_visa",
          label: "Tech.Pass — Singapore",
          maxStayDays: 730,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "MOM Services Centre on arrival",
          requirements: [
            "Meet 2 of 3 criteria: (a) last drawn fixed monthly salary SG$22,500+ in the past year, (b) 5+ years experience leading a tech product / function in a company with US$330M+ valuation or US$33M+ funding, (c) led a tech product with 100k+ MAUs or US$100M+ ARR",
            "Hold multiple concurrent jobs without separate passes",
            "Start a business, consult, lecture, invest, sit on boards",
            "Spouse + children eligible for Dependant's Pass",
            "Renewable for 2 more years if you've met two of: assessed income SG$240k+ / spent SG$100k+ on local operations / employed 3+ locals / served as director or trainer",
          ],
          processingTimeDaysMin: 28,
          processingTimeDaysMax: 56,
          applicationUrl: "https://www.mom.gov.sg/passes-and-permits/tech-pass",
          primarySourceUrl: "https://www.mom.gov.sg/passes-and-permits/tech-pass",
          fees: [
            { kind: "base", amountMinor: 27500, currency: "SGD", asOf: "2026-05-11", label: "Tech.Pass application + issuance", optional: false },
          ],
          notes: "Run by EDB (not MOM directly). Designed for senior tech operators who'll bring expertise + ecosystem benefit. The renewal milestones are aggressive — many holders move to ONE Pass at renewal.",
        });
      }

      // ---------- SG S Pass ----------
      if (passport !== "SG") {
        records.push({
          passportIso2: passport,
          destinationIso2: "SG",
          purpose: "work",
          status: "embassy_visa",
          label: "S Pass — Singapore (mid-skilled foreign worker)",
          maxStayDays: 730,
          validityDays: 730,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: false,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "MOM Services Centre on arrival",
          requirements: [
            "Fixed monthly salary of at least SG$3,150 (SG$3,650 for financial services from 2025)",
            "Employer applies — sponsored route, tied to the company",
            "Diploma, degree, or technical certificate; relevant work experience",
            "Subject to a Dependency Ratio Ceiling — companies face a quota on S Pass + Work Permit holders relative to local staff",
            "Employer pays a monthly levy (SG$330-650 depending on tier)",
            "Dependants eligible only if monthly salary ≥ SG$6,000",
          ],
          processingTimeDaysMin: 7,
          processingTimeDaysMax: 21,
          applicationUrl: "https://www.mom.gov.sg/passes-and-permits/s-pass",
          primarySourceUrl: "https://www.mom.gov.sg/passes-and-permits/s-pass",
          fees: [
            { kind: "base", amountMinor: 10500, currency: "SGD", asOf: "2026-05-11", label: "S Pass application + issuance", optional: false },
          ],
          notes: "Designed for mid-skilled foreign workers — pays a monthly levy, counts against company's foreign-worker quota. Less flexible than EP (lower salary band, levy, quotas) but easier to qualify for.",
        });
      }
    }

    return { records };
  },
};
