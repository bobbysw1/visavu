/**
 * Global Talent / Investor / Special-Skills visa programs.
 *
 * High-skilled and high-net-worth-friendly long-stay programs from across
 * the world. Each has its own quirk — Singapore Tech.Pass for tech leaders,
 * Hong Kong Top Talent for university grads, Korea D-10 for job-seekers,
 * Thailand LTR for retirees and high-earners, Taiwan Gold Card, UAE 10-year
 * Golden Visa, etc.
 *
 * Most are open to any nationality with the qualifying credential or income.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

type TalentProgram = {
  destinationIso2: string;
  id: string;
  label: string;
  /** Income or investment threshold (display only). */
  thresholdSummary: string;
  feeAmountMinor: number;
  feeCurrency: string;
  stayDays: number;
  applicationUrl: string;
  primarySourceUrl: string;
  excluded?: string[];
  requirements: string[];
  processingTimeDaysMin: number;
  processingTimeDaysMax: number;
  notes: string;
};

const VALID_ISO = new Set(COUNTRY_LIST.map((c) => c.iso2));

const PROGRAMS: TalentProgram[] = [
  {
    destinationIso2: "SG",
    id: "sg_tech_pass",
    label: "Tech.Pass — Singapore",
    thresholdSummary:
      "Two of: (a) S$22,500+ monthly fixed salary, (b) led a tech company of US$500m+ valuation or US$30m+ funding, (c) led a tech product with 100k+ MAU or US$100m+ revenue.",
    feeAmountMinor: 0,
    feeCurrency: "SGD",
    stayDays: 730,
    applicationUrl: "https://www.mom.gov.sg/passes-and-permits/tech-pass",
    primarySourceUrl: "https://www.mom.gov.sg/passes-and-permits/tech-pass",
    requirements: [
      "Two of three qualifying tech-leadership criteria",
      "Hold a position of regional or global responsibility",
      "Work permit attached on issuance",
    ],
    processingTimeDaysMin: 14,
    processingTimeDaysMax: 60,
    notes: "2-year work pass for tech leaders to start companies, mentor, and consult. Renewable.",
  },
  {
    destinationIso2: "SG",
    id: "sg_one_pass",
    label: "Overseas Networks & Expertise (ONE) Pass — Singapore",
    thresholdSummary:
      "Monthly salary S$30,000+ in last year OR demonstrated outstanding achievement (arts, sport, science, academia).",
    feeAmountMinor: 22500, // S$225 admin
    feeCurrency: "SGD",
    stayDays: 1825,
    applicationUrl:
      "https://www.mom.gov.sg/passes-and-permits/overseas-networks-expertise-pass",
    primarySourceUrl:
      "https://www.mom.gov.sg/passes-and-permits/overseas-networks-expertise-pass",
    requirements: [
      "Monthly fixed salary at least S$30,000 (US$22k+) in past year",
      "Letter from employer / past employer confirming role and salary",
      "Holders can concurrently work for multiple Singapore employers and start a business",
    ],
    processingTimeDaysMin: 30,
    processingTimeDaysMax: 60,
    notes:
      "Singapore's most prestigious work pass — 5-year validity, multiple-employer permission, family included.",
  },
  {
    destinationIso2: "HK",
    id: "hk_top_talent",
    label: "Top Talent Pass Scheme — Hong Kong",
    thresholdSummary:
      "Annual income HK$2.5m+ in past year OR degree from a top-100 global university (within / over 5 years).",
    feeAmountMinor: 23000, // HK$230
    feeCurrency: "HKD",
    stayDays: 730,
    applicationUrl: "https://www.immd.gov.hk/eng/services/visas/TTPS.html",
    primarySourceUrl: "https://www.immd.gov.hk/eng/services/visas/TTPS.html",
    excluded: ["AF", "AL", "CU", "KP", "LA", "MD", "NP", "VU"],
    requirements: [
      "Category A: HK$2.5m+ annual income in past 12 months",
      "Category B: top-100 university bachelor's + 3+ years' experience (within 5y of grad)",
      "Category C: top-100 university bachelor's, < 5y since grad, no experience required",
      "Hold a passport NOT on the excluded list (currently AF, AL, CU, KP, LA, MD, NP, VU)",
    ],
    processingTimeDaysMin: 14,
    processingTimeDaysMax: 30,
    notes:
      "Launched December 2022 to attract talent. 2-year initial stay; renewable upon securing a Hong Kong job.",
  },
  {
    destinationIso2: "KR",
    id: "kr_d10",
    label: "D-10 Job Search Visa — Republic of Korea",
    thresholdSummary:
      "Bachelor's+ degree, ≥ 60 points in MOEL job-seeker scoring (factors: education, age, Korean language ability, work experience).",
    feeAmountMinor: 6000, // US$60
    feeCurrency: "USD",
    stayDays: 180,
    applicationUrl: "https://www.visa.go.kr/openPage.do?MENU_ID=10301",
    primarySourceUrl: "https://www.visa.go.kr/openPage.do?MENU_ID=10301",
    requirements: [
      "Bachelor's degree or higher",
      "Score ≥ 60 on the MOEL job-seeker point scheme",
      "Sufficient funds (~US$3,000+) to support yourself during job search",
      "Renewable up to 2 years total",
    ],
    processingTimeDaysMin: 14,
    processingTimeDaysMax: 30,
    notes: "Korea's equivalent of Japan's J-Find. Lets degree-holders job-hunt from inside Korea for up to 6 months at a time.",
  },
  {
    destinationIso2: "TH",
    id: "th_ltr",
    label: "Long-Term Resident (LTR) Visa — Thailand",
    thresholdSummary:
      "Four streams: Wealthy Global Citizen (US$1m+ assets), Wealthy Pensioner (US$80k income), Work-from-Thailand Pro (US$80k income from foreign company), Highly-Skilled Professional (US$80k+ in target sectors).",
    feeAmountMinor: 5000000, // ฿50,000
    feeCurrency: "THB",
    stayDays: 3650,
    applicationUrl: "https://ltr.boi.go.th/",
    primarySourceUrl: "https://ltr.boi.go.th/",
    requirements: [
      "Income / assets meeting one of the four streams (see threshold summary)",
      "Minimum US$50k health insurance for the duration of stay",
      "Spouse and up to 4 dependent children can accompany",
      "Reduced personal income tax (17%) on foreign income for the Highly-Skilled Professional stream",
    ],
    processingTimeDaysMin: 25,
    processingTimeDaysMax: 60,
    notes:
      "10-year stay (5+5 renewable). Tax incentives, work permit included, no 90-day reporting. Launched September 2022.",
  },
  {
    destinationIso2: "TW",
    id: "tw_gold_card",
    label: "Taiwan Employment Gold Card",
    thresholdSummary:
      "Recognised expertise in one of 8 fields (science/tech, economics, education, culture/arts, sport, finance, law, architecture) — typical: 3-year monthly salary NT$160k+ (US$5k+).",
    feeAmountMinor: 380000, // NT$3,800
    feeCurrency: "TWD",
    stayDays: 1095,
    applicationUrl: "https://goldcard.nat.gov.tw/en/",
    primarySourceUrl: "https://goldcard.nat.gov.tw/en/",
    requirements: [
      "Demonstrated expertise in one of the 8 designated fields",
      "Open work permit on issuance — work for any employer or freelance",
      "Tax break: 50% deduction on income > NT$3m for first 3 years (high-income foreign professionals)",
      "Renewable; path to permanent residency after 5 years",
    ],
    processingTimeDaysMin: 30,
    processingTimeDaysMax: 60,
    notes:
      "1-3 year multi-purpose visa, work permit, residence permit, and re-entry permit in one card. Most popular among tech / academic professionals.",
  },
  {
    destinationIso2: "AE",
    id: "ae_golden_10yr",
    label: "Golden Visa (10-year residence) — United Arab Emirates",
    thresholdSummary:
      "Categories: AED 2m+ property investment, AED 2m+ public-investment-fund deposit, founding a startup with AED 500k+ valuation, top-of-class students, doctorate-level researchers, professionals earning AED 30k+/month.",
    feeAmountMinor: 2_800_000, // AED 28,000
    feeCurrency: "AED",
    stayDays: 3650,
    applicationUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa",
    primarySourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa",
    requirements: [
      "Qualifying investment / employment / academic / professional achievement (see threshold summary)",
      "No sponsor required — self-sponsorship is the main feature",
      "Family inclusion: spouse, all children, parents (no age limit for boys / age limit removed for daughters in 2022)",
      "100% business ownership permitted on the mainland",
    ],
    processingTimeDaysMin: 30,
    processingTimeDaysMax: 90,
    notes:
      "Renewable indefinitely. Holders may stay outside UAE for any length of time without losing residency — uniquely flexible among golden-visa programs.",
  },
  {
    destinationIso2: "PT",
    id: "pt_golden_visa",
    label: "Golden Residence Permit (D-Series) — Portugal",
    thresholdSummary:
      "Investment options: €500k research / cultural fund / venture capital, €350k+ business creating 5+ jobs, €1.5m+ capital transfer. Real-estate option REMOVED October 2023.",
    feeAmountMinor: 770000, // €7,700
    feeCurrency: "EUR",
    stayDays: 730,
    applicationUrl: "https://www.aima.gov.pt/",
    primarySourceUrl: "https://www.aima.gov.pt/",
    requirements: [
      "Qualifying non-real-estate investment (real-estate route closed Oct 2023)",
      "Maintain investment for 5+ years",
      "Minimum 7 days/year physical presence in Portugal",
      "Path to permanent residency after 5 years; citizenship after 5 years total",
    ],
    processingTimeDaysMin: 180,
    processingTimeDaysMax: 540,
    notes:
      "Once the most popular EU golden visa. Real-estate route closed October 2023 amid housing-affordability concerns. Investment-fund route is now the main path.",
  },
  {
    destinationIso2: "GR",
    id: "gr_golden_visa",
    label: "Golden Visa — Greece",
    thresholdSummary:
      "€250k+ real-estate purchase (Athens / Thessaloniki / Mykonos / Santorini increased to €500k–€800k in 2024).",
    feeAmountMinor: 200000,
    feeCurrency: "EUR",
    stayDays: 1825,
    applicationUrl: "https://www.enterprisegreece.gov.gr/en/golden-visa-program",
    primarySourceUrl: "https://www.enterprisegreece.gov.gr/en/golden-visa-program",
    requirements: [
      "€250k–€800k real-estate investment depending on region (raised 2024)",
      "Minimum 7 days/year presence — among the most flexible golden visas",
      "5-year renewable residency",
      "Path to citizenship after 7 years (with language requirement)",
    ],
    processingTimeDaysMin: 60,
    processingTimeDaysMax: 90,
    notes:
      "Among the cheapest EU golden visas at €250k. Greece raised thresholds for prime areas in 2024 to address housing pressure.",
  },
  {
    destinationIso2: "DE",
    id: "de_chancenkarte",
    label: "Chancenkarte — Germany Opportunity Card",
    thresholdSummary:
      "Points-based job-seeker visa: ≥ 6 points across qualification, work experience, language skills, age, prior connection to Germany.",
    feeAmountMinor: 7500, // €75
    feeCurrency: "EUR",
    stayDays: 365,
    applicationUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/chancenkarte",
    primarySourceUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/chancenkarte",
    requirements: [
      "Recognised university / vocational qualification",
      "≥ 6 points on the Opportunity Card scoring (qualification, experience, language, age, ties)",
      "Proof of funds (~€11,200 for the year, or part-time work contract)",
      "Up to 20 hrs/week of permitted work + trial employment of up to 2 weeks per employer",
    ],
    processingTimeDaysMin: 30,
    processingTimeDaysMax: 90,
    notes:
      "Launched June 2024. 1-year visa to job-hunt inside Germany. Replaces / sits alongside the older job-seeker visa.",
  },
];

export const globalTalentVisasAdapter: Adapter = {
  metadata: {
    id: "global_talent_visas",
    name: "Global Talent / Investor / Special-Skills visa programs",
    kind: "manual",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: PROGRAMS.map((p) => p.primarySourceUrl),
    fixturePath: "src/scrapers/sources/__fixtures__/global_talent_visas.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return {
      rawText: JSON.stringify({ programs: PROGRAMS.map((p) => p.id) }),
      fetchUrl: "manual://global_talent_visas",
    };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const program of PROGRAMS) {
      if (!VALID_ISO.has(program.destinationIso2)) continue;
      const excludedSet = new Set(program.excluded ?? []);

      for (const c of COUNTRY_LIST) {
        if (c.iso2 === program.destinationIso2) continue;
        if (excludedSet.has(c.iso2)) continue;

        records.push({
          passportIso2: c.iso2,
          destinationIso2: program.destinationIso2,
          purpose: "work",
          status: "embassy_visa",
          label: program.label,
          maxStayDays: program.stayDays,
          validityDays: program.stayDays,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: false,
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: true,
          biometricsLocation: "embassy / consulate / VFS centre",
          requirements: [
            `Threshold: ${program.thresholdSummary}`,
            ...program.requirements,
          ],
          processingTimeDaysMin: program.processingTimeDaysMin,
          processingTimeDaysMax: program.processingTimeDaysMax,
          applicationUrl: program.applicationUrl,
          primarySourceUrl: program.primarySourceUrl,
          fees:
            program.feeAmountMinor > 0
              ? [
                  {
                    kind: "base",
                    amountMinor: program.feeAmountMinor,
                    currency: program.feeCurrency,
                    asOf: "2026-05-10",
                    label: "Government / processing fee (typical)",
                    optional: false,
                  },
                ]
              : [],
          notes: program.notes,
        });
      }
    }
    return { records };
  },
};
