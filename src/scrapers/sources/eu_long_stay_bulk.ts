/**
 * Bulk EU member-state long-stay D-class adapters.
 *
 * Each entry below is a per-country config — destination, salary threshold,
 * source URL, requirements list, and any country-specific notes. The shared
 * factory (_euLongStayFactory.ts) turns each into a working Adapter that
 * emits embassy-visa records for every non-EU/EEA passport.
 *
 * Covers (P33): NL, IT, SE, AT, BE, FI, NO, DK, CZ, HU, PL, GR, RO, BG, HR,
 * SK, SI, EE, LT, LV — 20 EU member-state long-stay routes that previously
 * weren't indexed. The existing dedicated adapters (de_blue_card,
 * de_skilled_worker, es_digital_nomad, es_non_lucrative, fr_talent_passport,
 * pt_d7, pt_d8) cover DE/ES/FR/PT.
 */
import type { Adapter } from "../base/Adapter";
import { makeEuLongStayAdapter } from "./_euLongStayFactory";

export const EU_LONG_STAY_BULK_ADAPTERS: Adapter[] = [
  // ===== Netherlands — Highly Skilled Migrant =====
  makeEuLongStayAdapter({
    id: "nl_hsm",
    name: "Netherlands Highly Skilled Migrant (HSM) — IND",
    destinationIso2: "NL",
    sourceUrl: "https://ind.nl/en/highly-skilled-migrant",
    liveness: /highly skilled migrant|HSM|kennismigrant/i,
    label: "Netherlands Highly Skilled Migrant residence permit",
    initialValidityDays: 5 * 365,
    salaryMinor: 533_100,
    salaryCurrency: "EUR",
    processingDaysMin: 14,
    processingDaysMax: 90,
    applicationFeeMinor: 38_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Recognised-sponsor Dutch employer (registered in the IND public register)",
      "Monthly salary ≥ €5,331 (30+) or €3,909 (under 30) gross — 2024 thresholds",
      "Apostilled academic credentials + sworn Dutch translation if applicable",
      "Confirmed Dutch tenancy / accommodation",
    ],
    notes:
      "Recognised-sponsor model gives the IND fast-track processing. 30% tax-ruling election available for qualifying recruits (phased reduction 2024). 5-year track to permanent residence; Dutch citizenship typically after 5 years residence (3 for spouses of Dutch citizens), generally renouncing original nationality.",
  }),

  // ===== Italy — Lavoro Subordinato (general work) =====
  makeEuLongStayAdapter({
    id: "it_lavoro_subordinato",
    name: "Italy Lavoro Subordinato (subordinate employment) — Ministero dell'Interno",
    destinationIso2: "IT",
    sourceUrl: "https://www.esteri.it/en/servizi-consolari-e-visti/",
    liveness: /Italy|visto|visa|esteri|employment/i,
    label: "Italy Lavoro Subordinato work visa (annual decreto-flussi quota)",
    initialValidityDays: 365,
    processingDaysMin: 30,
    processingDaysMax: 120,
    applicationFeeMinor: 11_600,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Annual decreto-flussi quota slot via Sportello Unico per l'Immigrazione",
      "Italian employer's nulla osta authorisation (work permit)",
      "Apostilled academic credentials + sworn Italian translation",
      "Italian residence contract or sponsor accommodation",
    ],
    notes:
      "Italy's standard non-seasonal work visa operates under the annual decreto-flussi system — quota slots open per occupation. EU Blue Card (separate route) is available for highly skilled roles. EU long-term resident permit after 5 years; Italian citizenship typically after 10 years (4 for EU nationals; jure sanguinis for Italian-heritage applicants is an alternative).",
  }),

  // ===== Italy — Elective Residence (passive income) =====
  makeEuLongStayAdapter({
    id: "it_residenza_elettiva",
    name: "Italy Elective Residence Visa (residenza elettiva)",
    destinationIso2: "IT",
    sourceUrl: "https://vistoperitalia.esteri.it/home/en",
    liveness: /Italy|elective residence|residenza elettiva|esteri/i,
    label: "Italy Elective Residence Visa (residenza elettiva — passive income)",
    initialValidityDays: 365,
    processingDaysMin: 30,
    processingDaysMax: 90,
    applicationFeeMinor: 11_600,
    applicationFeeCurrency: "EUR",
    purpose: "family",
    requirements: [
      "Passive income ≥ €31,000/yr for primary applicant (+20% spouse; +5% per child)",
      "Italian accommodation (12-month rental contract OR property deed)",
      "Comprehensive private health insurance covering Italy",
      "No employment / economic activity in Italy permitted on this visa",
      "Apostilled criminal record + sworn Italian translation",
    ],
    notes:
      "Elective Residence is Italy's passive-income / retirement route. €100k flat-tax for non-doms (separate election) available to qualifying high-net-worth applicants. EU long-term resident after 5 years.",
  }),

  // ===== Sweden — Work Permit (Arbetstillstånd) =====
  makeEuLongStayAdapter({
    id: "se_arbetstillstand",
    name: "Sweden Work Permit (arbetstillstånd) — Migrationsverket",
    destinationIso2: "SE",
    sourceUrl: "https://www.migrationsverket.se/English/Private-individuals/Working-in-Sweden.html",
    liveness: /work permit|arbetstillstånd|Sweden|Migrationsverket/i,
    label: "Sweden Work Permit (employer-sponsored)",
    initialValidityDays: 2 * 365,
    salaryMinor: 2_736_000,
    salaryCurrency: "SEK",
    processingDaysMin: 30,
    processingDaysMax: 180,
    applicationFeeMinor: 220_000,
    applicationFeeCurrency: "SEK",
    requirements: [
      "Confirmed Swedish employment offer at or above the published threshold (SEK 27,360/mo from Nov 2023; further reform raising it)",
      "Employer's union consultation for the role",
      "Comprehensive insurance covering health, life, employment injury, pension",
      "Apostilled academic credentials",
    ],
    notes:
      "Post-November 2023 salary-threshold reform tightened eligibility for low-wage routes. Permanent residence (PUT) after 4 years on most work routes; Swedish citizenship typically 5 years.",
  }),

  // ===== Austria — Red-White-Red Card =====
  makeEuLongStayAdapter({
    id: "at_rwr_card",
    name: "Austria Red-White-Red Card",
    destinationIso2: "AT",
    sourceUrl: "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/red-white-red-card/",
    liveness: /Red-White-Red|migration\.gv\.at|Austria/i,
    label: "Austria Red-White-Red Card (points-based skilled worker)",
    initialValidityDays: 2 * 365,
    salaryMinor: 332_300,
    salaryCurrency: "EUR",
    processingDaysMin: 30,
    processingDaysMax: 90,
    applicationFeeMinor: 16_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Points-test score ≥ 70 (very highly qualified) or category-specific threshold (skilled worker / shortage / university grad)",
      "Confirmed Austrian employer offer at or above the salary-threshold for the category",
      "Apostilled credentials + sworn German translation",
      "German A1 language for some categories",
    ],
    notes:
      "RWR Card has multiple sub-categories: Very Highly Qualified, Skilled Worker in Shortage Occupations, Skilled Worker (other), Self-Employed Key Worker, Start-Up Founder, Graduates of Austrian Universities. Daueraufenthalt-EU (long-term resident) after 5 years; Austrian citizenship typically after 10 years (6 with exceptional integration), generally renouncing original nationality.",
  }),

  // ===== Belgium — Single Permit =====
  makeEuLongStayAdapter({
    id: "be_single_permit",
    name: "Belgium Single Permit (Combined work + residence)",
    destinationIso2: "BE",
    sourceUrl: "https://dofi.ibz.be/en",
    liveness: /Belgium|combined permit|single permit|dofi/i,
    label: "Belgium Single Permit (combined work + residence)",
    initialValidityDays: 365,
    salaryMinor: 4_800_000,
    salaryCurrency: "EUR",
    processingDaysMin: 30,
    processingDaysMax: 90,
    applicationFeeMinor: 23_500,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Belgian employer offer with regional permit authorisation",
      "Salary at or above the regional threshold (Brussels-Capital, Flemish, Walloon — differs)",
      "Apostilled credentials + sworn French/Dutch/German translation",
    ],
    notes:
      "Belgium operates three regional permit systems (Brussels-Capital, Flemish, Walloon) each with different income thresholds. F+ permit / EU long-term resident after 5 years; Belgian citizenship after 5 years (10 without integration).",
  }),

  // ===== Finland — Specialist Residence Permit =====
  makeEuLongStayAdapter({
    id: "fi_specialist",
    name: "Finland Specialist Residence Permit — Migri",
    destinationIso2: "FI",
    sourceUrl: "https://migri.fi/en/specialist",
    liveness: /Finland|specialist|migri|residence permit/i,
    label: "Finland Specialist Residence Permit",
    initialValidityDays: 2 * 365,
    salaryMinor: 360_000,
    salaryCurrency: "EUR",
    processingDaysMin: 14,
    processingDaysMax: 60,
    applicationFeeMinor: 49_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Finnish employer offer in a specialist role",
      "Monthly salary ≥ 1.5× the Finnish average wage (~€3,600/mo)",
      "Apostilled academic credentials",
    ],
    notes:
      "Finland's Specialist route is fast-track (14-60 days) for qualifying employer-sponsored applicants. Permanent residence (P) after 4 years of continuous legal residence; Finnish citizenship typically after 5 years.",
  }),

  // ===== Norway — Skilled Worker Permit =====
  makeEuLongStayAdapter({
    id: "no_skilled_worker",
    name: "Norway Skilled Worker Permit — UDI",
    destinationIso2: "NO",
    sourceUrl: "https://www.udi.no/en/want-to-apply/work-immigration/skilled-workers/",
    liveness: /Norway|skilled worker|UDI|residence permit/i,
    label: "Norway Skilled Worker Permit",
    initialValidityDays: 365,
    processingDaysMin: 30,
    processingDaysMax: 90,
    applicationFeeMinor: 600_000,
    applicationFeeCurrency: "NOK",
    requirements: [
      "Confirmed Norwegian employment contract in a qualifying role",
      "Salary at or above the Norwegian collective-agreement minimum for the occupation",
      "University degree or vocational qualification",
      "Apostilled credentials",
    ],
    notes:
      "Norway is in EEA — EU/EEA citizens have free movement and don't need this permit. Permanent residence (PUT) after 3 years on most routes; Norwegian citizenship typically 7 years.",
    excludedPassports: new Set([
      // EU/EEA exempt under bilateral agreements; same set as factory default
      // plus Switzerland.
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
      "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "PL",
      "PT", "RO", "SK", "SI", "ES", "SE", "CH",
    ]),
  }),

  // ===== Denmark — Pay Limit Scheme =====
  makeEuLongStayAdapter({
    id: "dk_pay_limit",
    name: "Denmark Pay Limit Scheme — SIRI",
    destinationIso2: "DK",
    sourceUrl: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Work/Pay-limit",
    liveness: /Denmark|pay limit|SIRI|nyidanmark/i,
    label: "Denmark Pay Limit Scheme (DKK 487,000+/yr)",
    initialValidityDays: 4 * 365,
    salaryMinor: 48_700_000,
    salaryCurrency: "DKK",
    processingDaysMin: 14,
    processingDaysMax: 30,
    applicationFeeMinor: 615_000,
    applicationFeeCurrency: "DKK",
    requirements: [
      "Confirmed Danish employment contract with salary ≥ DKK 487,000/yr (2024)",
      "Standard Danish working conditions",
      "Apostilled credentials",
    ],
    notes:
      "Pay Limit Scheme is Denmark's fastest work-residence route — no labour-market test required if salary clears the threshold. Permanent residence after 8 years (4 years fast-track with high score on the integration scheme); Danish citizenship typically after 9 years.",
  }),

  // ===== Czechia — Employee Card =====
  makeEuLongStayAdapter({
    id: "cz_employee_card",
    name: "Czechia Employee Card — Ministry of the Interior",
    destinationIso2: "CZ",
    sourceUrl: "https://www.mvcr.cz/mvcren/article/employee-card.aspx",
    liveness: /Czech|employee card|mvcr|residence/i,
    label: "Czechia Employee Card (combined work + residence)",
    initialValidityDays: 2 * 365,
    processingDaysMin: 30,
    processingDaysMax: 90,
    applicationFeeMinor: 250_000,
    applicationFeeCurrency: "CZK",
    requirements: [
      "Confirmed Czech employment contract registered in the Central Register of Vacancies",
      "Position on the Highly Qualified Employee or Key Personnel programme list (fast-track)",
      "Apostilled credentials + sworn Czech translation",
    ],
    notes:
      "Highly Qualified Employee and Key & Scientific Personnel sub-programmes accelerate processing. EU Blue Card (separate route) is available for highly skilled with salary ≥ CZK 91,225/mo. Permanent residence after 5 years; Czech citizenship after 5 years on PR (10 total), generally renouncing original nationality.",
  }),

  // ===== Hungary — Single Permit + White Card =====
  makeEuLongStayAdapter({
    id: "hu_single_permit",
    name: "Hungary Single Permit + White Card (digital nomad) — OIF",
    destinationIso2: "HU",
    sourceUrl: "https://oif.gov.hu/index.php?lang=en",
    liveness: /Hungary|single permit|White Card|OIF|residence/i,
    label: "Hungary Single Permit (work) or White Card (digital nomad)",
    initialValidityDays: 2 * 365,
    salaryMinor: 300_000,
    salaryCurrency: "EUR",
    processingDaysMin: 30,
    processingDaysMax: 60,
    applicationFeeMinor: 11_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Single Permit: confirmed Hungarian employer offer + central labour-market check",
      "White Card (digital nomad): ≥ €3,000/mo income from outside Hungary",
      "Apostilled credentials + sworn Hungarian translation",
    ],
    notes:
      "White Card (introduced 2022) is Hungary's digital-nomad equivalent. National Settlement Permit after 3 years (faster than EU's 5-year long-term-resident standard); Hungarian citizenship typically 8 years (3 for spouses, simplified naturalisation for ethnic Hungarians under the 2011 law).",
  }),

  // ===== Poland — Type D Work Visa =====
  makeEuLongStayAdapter({
    id: "pl_type_d_work",
    name: "Poland Type D National Work Visa — UDSC",
    destinationIso2: "PL",
    sourceUrl: "https://www.gov.pl/web/udsc-en",
    liveness: /Poland|UDSC|residence|long-stay|national visa/i,
    label: "Poland Type D National Work Visa",
    initialValidityDays: 365,
    processingDaysMin: 14,
    processingDaysMax: 60,
    applicationFeeMinor: 8_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Voivode-issued work permit (Type A, B, C, D, or E depending on role)",
      "Confirmed Polish employer offer at or above the regional minimum wage",
      "Apostilled credentials + sworn Polish translation",
    ],
    notes:
      "Poland.Business Harbour fast-tracks tech professionals from Belarus, Russia, Ukraine, Armenia, Georgia, and Moldova. Permanent residence after 5 years; Polish citizenship after 3 years on PR (5 total).",
  }),

  // ===== Greece — Type D Work Visa =====
  makeEuLongStayAdapter({
    id: "gr_type_d_work",
    name: "Greece Type D National Work Visa — Ministry of Migration",
    destinationIso2: "GR",
    sourceUrl: "https://migration.gov.gr/en/",
    liveness: /Greece|migration|residence|long-stay/i,
    label: "Greece Type D National Work Visa",
    initialValidityDays: 2 * 365,
    processingDaysMin: 30,
    processingDaysMax: 90,
    applicationFeeMinor: 18_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Greek employer offer + work-permit authorisation",
      "Salary at or above the Greek minimum wage for the occupation",
      "Apostilled credentials + sworn Greek translation",
      "Greek health insurance enrolment",
    ],
    notes:
      "Greece offers parallel routes: Golden Visa (real-estate), Financially Independent Person, Digital Nomad. Permanent residence after 5 years; Greek citizenship after 7 years.",
  }),

  // ===== Romania — Long-stay Work Visa =====
  makeEuLongStayAdapter({
    id: "ro_long_stay_work",
    name: "Romania Long-stay Work Visa — IGI",
    destinationIso2: "RO",
    sourceUrl: "https://www.mae.ro/en/node/2059",
    liveness: /Romania|long-stay|mae\.ro|residence/i,
    label: "Romania Long-stay D-class Work Visa",
    initialValidityDays: 365,
    processingDaysMin: 30,
    processingDaysMax: 90,
    applicationFeeMinor: 20_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Romanian employer offer + work-permit authorisation",
      "Salary at or above the Romanian average gross wage for the occupation",
      "Apostilled credentials + sworn Romanian translation",
    ],
    notes:
      "Romania joined Schengen for land borders January 2025. Permanent residence after 5 years (4 years on Blue Card). Romanian citizenship after 8 years residence (5 for spouses, fast-track for ethnic Romanians).",
  }),

  // ===== Bulgaria — Long-stay Work Visa =====
  makeEuLongStayAdapter({
    id: "bg_long_stay_work",
    name: "Bulgaria Long-stay Work Visa — Migration Directorate",
    destinationIso2: "BG",
    sourceUrl: "https://www.mvr.bg/en/migration",
    liveness: /Bulgaria|migration|mvr|residence/i,
    label: "Bulgaria Long-stay D-class Work Visa",
    initialValidityDays: 365,
    processingDaysMin: 30,
    processingDaysMax: 90,
    applicationFeeMinor: 10_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Bulgarian employer offer + work-permit authorisation",
      "Salary at or above the published Bulgarian minimum for the occupation",
      "Apostilled credentials + sworn Bulgarian translation",
    ],
    notes:
      "Bulgaria joined Schengen for land borders January 2025. Permanent residence after 5 years; Bulgarian citizenship after 5 years on PR (10 total).",
  }),

  // ===== Croatia — Stay & Work Permit =====
  makeEuLongStayAdapter({
    id: "hr_stay_work",
    name: "Croatia Stay and Work Permit — MUP",
    destinationIso2: "HR",
    sourceUrl: "https://mup.gov.hr/aliens-281621/281621",
    liveness: /Croatia|temporary stay|MUP|aliens/i,
    label: "Croatia Stay and Work Permit",
    initialValidityDays: 365,
    processingDaysMin: 30,
    processingDaysMax: 90,
    applicationFeeMinor: 7_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Croatian employer offer + work permit",
      "Salary at or above the Croatian average gross wage for the occupation",
      "Apostilled credentials + sworn Croatian translation",
    ],
    notes:
      "Croatia joined Schengen January 2023. Digital Nomad Residence Permit is a separate 1-year non-renewable route. Permanent residence after 5 years; Croatian citizenship typically 8 years (5 for spouses).",
  }),

  // ===== Slovakia — Temporary Residence for Employment =====
  makeEuLongStayAdapter({
    id: "sk_employment_residence",
    name: "Slovakia Temporary Residence for Employment — Foreigners Police",
    destinationIso2: "SK",
    sourceUrl: "https://www.minv.sk/?temporary-residence-for-the-purpose-of-employment",
    liveness: /Slovakia|residence|minv|employment/i,
    label: "Slovakia Temporary Residence for Employment",
    initialValidityDays: 2 * 365,
    processingDaysMin: 30,
    processingDaysMax: 90,
    applicationFeeMinor: 16_500,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Slovak employer offer + work-permit authorisation",
      "Apostilled credentials + sworn Slovak translation",
    ],
    notes:
      "Slovakia E-2 treaty-investor option available to US citizens via the 1992 treaty. Permanent residence after 5 years; Slovak citizenship typically after 8 years.",
  }),

  // ===== Slovenia — Single Residence and Work Permit =====
  makeEuLongStayAdapter({
    id: "si_single_permit",
    name: "Slovenia Single Residence and Work Permit",
    destinationIso2: "SI",
    sourceUrl: "https://www.gov.si/en/topics/single-residence-and-work-permit/",
    liveness: /Slovenia|residence|gov\.si|work permit/i,
    label: "Slovenia Single Residence and Work Permit",
    initialValidityDays: 365,
    processingDaysMin: 30,
    processingDaysMax: 60,
    applicationFeeMinor: 10_200,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Slovenian employer offer + work permit",
      "Apostilled credentials + sworn Slovenian translation",
    ],
    notes:
      "EU long-term resident permit after 5 years; Slovenian citizenship typically after 10 years (5 for spouses).",
  }),

  // ===== Estonia — Long-stay (D) Visa =====
  makeEuLongStayAdapter({
    id: "ee_d_visa",
    name: "Estonia Long-stay (D) Visa — Police and Border Guard Board",
    destinationIso2: "EE",
    sourceUrl: "https://www.politsei.ee/en/instructions/long-stay-d-visa",
    liveness: /Estonia|long-stay|politsei|D-visa|D visa/i,
    label: "Estonia Long-stay D-Visa",
    initialValidityDays: 365,
    processingDaysMin: 14,
    processingDaysMax: 30,
    applicationFeeMinor: 10_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Estonian employer offer OR study admission OR self-employed registration",
      "Apostilled credentials + sworn Estonian translation",
    ],
    notes:
      "Estonia's e-Residency programme is separate (no physical residence). Long-stay D-Visa is the actual residence pathway. Long-term residence permit after 5 years; Estonian citizenship typically after 8 years.",
  }),

  // ===== Lithuania — National D Visa =====
  makeEuLongStayAdapter({
    id: "lt_d_visa",
    name: "Lithuania National D Visa — Migration Department",
    destinationIso2: "LT",
    sourceUrl: "https://migracija.lrv.lt/en/",
    liveness: /Lithuania|migracija|national visa|D-visa/i,
    label: "Lithuania National D Visa",
    initialValidityDays: 365,
    processingDaysMin: 14,
    processingDaysMax: 45,
    applicationFeeMinor: 12_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Lithuanian employer offer + work permit OR study admission",
      "Apostilled credentials + sworn Lithuanian translation",
    ],
    notes:
      "Lithuania US E-2 treaty-investor option available. Permanent residence after 5 years; Lithuanian citizenship typically after 10 years, generally renouncing other nationalities.",
  }),

  // ===== Latvia — National D Visa =====
  makeEuLongStayAdapter({
    id: "lv_d_visa",
    name: "Latvia National D Visa — PMLP",
    destinationIso2: "LV",
    sourceUrl: "https://www.pmlp.gov.lv/en",
    liveness: /Latvia|PMLP|residence|D visa/i,
    label: "Latvia National D Visa",
    initialValidityDays: 365,
    processingDaysMin: 14,
    processingDaysMax: 45,
    applicationFeeMinor: 6_000,
    applicationFeeCurrency: "EUR",
    requirements: [
      "Confirmed Latvian employer offer + work permit OR study admission",
      "Apostilled credentials + sworn Latvian translation",
    ],
    notes:
      "Latvia operates a separate Investor Residence (subordinated capital + state donation) route. Permanent residence after 5 years; Latvian citizenship typically after 10 years with B1 Latvian.",
  }),
];
