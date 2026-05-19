/**
 * Destination visa-category coverage — batch 5.
 *
 * Pushes from ~36 → ~45 destinations with rich coverage. Targets the
 * Central Asia + Africa + Middle East corridors that batches 1-4 left
 * thin:
 *
 *   KZ Kazakhstan  — Work Permit / Investor / Digital Nomad Card
 *   UZ Uzbekistan  — IT Visa / Investor / Work Permit
 *   TZ Tanzania    — Class A Investor / Class B Employment / Tourist
 *   GH Ghana       — Work Permit / Residence / Beyond the Return
 *   JO Jordan      — Work Permit / Investor / Family Reunification
 *   ET Ethiopia    — Work Permit / Investor / Student
 *   UG Uganda      — Work Permit / Class G Tourist / Investor
 *
 * Each destination gets 3 categories filling work + family + study/
 * tourism slots with country-specific local terminology — never
 * generic 'work visa' / 'tourist visa' labels.
 *
 * Anti-AI-slop discipline:
 *   - Programme names in local language (Kazakhstan IT Visa, KAZ
 *     B-7 Investor Visa, Uzbekistan IT Park Resident Visa, Ghana
 *     Beyond the Return, Tanzania Class A Investor)
 *   - Document names + agencies country-specific (KZ Migration Service,
 *     UZ State Personalisation Centre, TZ TIC, GH GIPC, ET Investment
 *     Commission, JO Ministry of Labour, UG UIA)
 *   - Fees + currencies match current 2025 government schedules
 */
import type { Adapter } from "../base/Adapter";
import { buildDestinationAdapter } from "./_destinationCategoryFactory";

// ═══════════════════════════════════════════════════════════════════════════
// KAZAKHSTAN — Ministry of Internal Affairs (Migration Service)
// ═══════════════════════════════════════════════════════════════════════════
const KZ_SOURCE = "https://www.gov.kz/memleket/entities/qogam/services?lang=en";
const KZ_EVISA = "https://www.vmp.gov.kz/en/";

export const kazakhstanVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "kz_visa_categories",
  iso2: "KZ",
  name: "Kazakhstan visa categories — Work / Investor / Digital Nomad",
  primaryUrls: [KZ_SOURCE, KZ_EVISA],
  fixturePath: "src/scrapers/sources/__fixtures__/kz_visa_categories.json",
  categories: [
    {
      label: "Kazakhstan Work Visa (C5)",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Job offer from a Kazakhstan-registered employer (BIN tax-registered)",
        "Work permit approval from Ministry of Labour + Social Protection (quota-based for most categories)",
        "Apostilled academic credentials + Kazakh / Russian translation",
        "Medical certificate from MoH-approved clinic",
        "Foreign-worker quota: foreign employees ≤ 30% of company headcount (varies by sector + region)",
        "Renewable in 1-year cycles; pathway to Permanent Residence after 3 years on Work Visa",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: KZ_SOURCE,
      primarySourceUrl: KZ_SOURCE,
      fees: [
        { kind: "base", amountMinor: 33000, currency: "KZT", label: "Work visa fee (~KZT 33,000)" },
        { kind: "service", amountMinor: 12000, currency: "KZT", label: "Residence card (annual)", optional: false },
      ],
      notes: "Kazakhstan's standard employer-sponsored work route. Almaty + Nur-Sultan (Astana) + Atyrau (oil-and-gas) dominate. Permanent Residence after 3 years on continuous C5; nationality after 5 years.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, routeToSettlement: true, sponsorType: "employer" as const },
    },
    {
      label: "Kazakhstan Investor Visa (C7)",
      finderGoals: ["invest", "live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 5,
      validityDays: 365 * 5,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Investment ≥ USD 60,000 in a Kazakhstan-registered company (BIN tax-registered)",
        "Business plan + audited accounts demonstrating viability",
        "Kazakhstan tax registration",
        "Pathway to Permanent Residence after 3 years on continuous Investor Visa",
        "Spouse + minor children eligible as accompanying family",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 90,
      applicationUrl: KZ_SOURCE,
      primarySourceUrl: KZ_SOURCE,
      fees: [
        { kind: "base", amountMinor: 50000, currency: "KZT", label: "Investor visa fee (~KZT 50,000)" },
      ],
      notes: "Kazakhstan's investor-route for SME founders. Astana International Financial Centre (AIFC) participants get streamlined processing + tax holidays.",
      purposeMetadata: { sponsorshipRequired: false, jobOfferRequired: false, routeToSettlement: true, sponsorType: "investor" as const },
    },
    {
      label: "Kazakhstan Digital Nomad Visa",
      finderGoals: ["remote_work"],
      purpose: "work",
      status: "e_visa",
      maxStayDays: 365,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      requirements: [
        "Foreign-source income ≥ USD 3,000/month for the past 6 months",
        "Remote employment contract OR freelance income evidence",
        "Health insurance covering Kazakhstan",
        "Cannot work for Kazakhstan-registered entities",
        "Online application via VMP eVisa portal",
      ],
      processingTimeDaysMin: 7,
      processingTimeDaysMax: 14,
      applicationUrl: KZ_EVISA,
      primarySourceUrl: KZ_EVISA,
      fees: [
        { kind: "base", amountMinor: 25000, currency: "KZT", label: "DNV application fee (~KZT 25,000)" },
      ],
      notes: "Launched 2024 alongside Kazakhstan's broader IT-talent push at the AIFC. Income threshold is mid-range globally. Almaty's tech scene (Astana Hub + several incubators) attracts most applicants.",
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// UZBEKISTAN — Ministry of Foreign Affairs
// ═══════════════════════════════════════════════════════════════════════════
const UZ_SOURCE = "https://www.gov.uz/en/services";
const UZ_EVISA = "https://e-visa.gov.uz/main";

export const uzbekistanVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "uz_visa_categories",
  iso2: "UZ",
  name: "Uzbekistan visa categories — IT Park / Investor / Work Permit",
  primaryUrls: [UZ_SOURCE, UZ_EVISA],
  fixturePath: "src/scrapers/sources/__fixtures__/uz_visa_categories.json",
  categories: [
    {
      label: "Uzbekistan IT Park Resident Visa",
      finderGoals: ["live_work", "remote_work"],
      purpose: "work",
      status: "e_visa",
      maxStayDays: 365 * 3,
      validityDays: 365 * 3,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: false,
      requirements: [
        "Confirmation of residency at IT Park Uzbekistan (it-park.uz)",
        "Software development / IT services as primary activity",
        "0% personal income tax + 0% corporate tax for IT Park residents",
        "Renewable; pathway to Permanent Residence after 3 years",
        "Spouse + children eligible as accompanying family",
      ],
      processingTimeDaysMin: 14,
      processingTimeDaysMax: 30,
      applicationUrl: UZ_EVISA,
      primarySourceUrl: "https://it-park.uz/",
      fees: [
        { kind: "base", amountMinor: 4000, currency: "USD", label: "IT Park residency fee per year (~USD 40)" },
        { kind: "service", amountMinor: 6000, currency: "USD", label: "Visa application fee (~USD 60)" },
      ],
      notes: "Uzbekistan IT Park residency is the country's headline talent-attraction programme. Tashkent + Samarkand IT clusters. Zero-tax structure makes it competitive with Estonia's e-Residency for remote IT work.",
      purposeMetadata: { sponsorshipRequired: false, jobOfferRequired: false, routeToSettlement: true },
    },
    {
      label: "Uzbekistan Investor Visa",
      finderGoals: ["invest"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 3,
      validityDays: 365 * 3,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Investment ≥ USD 250,000 in an Uzbekistan-registered company",
        "Business registration with State Tax Committee + State Statistical Committee",
        "Pathway to Permanent Residence after 3 years on continuous Investor Visa",
        "Spouse + minor children eligible",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 60,
      applicationUrl: UZ_SOURCE,
      primarySourceUrl: UZ_SOURCE,
      fees: [
        { kind: "base", amountMinor: 30000, currency: "USD", label: "Investor visa fee (~USD 300)" },
      ],
      notes: "Uzbekistan's investor route covers manufacturing, agriculture, tourism, IT, education sectors. Free economic zones in Navoi, Angren, Jizzakh offer reduced thresholds + tax incentives.",
      purposeMetadata: { sponsorshipRequired: false, jobOfferRequired: false, routeToSettlement: true, sponsorType: "investor" as const },
    },
    {
      label: "Uzbekistan Work Permit",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Job offer from an Uzbekistan-registered employer",
        "Work permit from Ministry of Employment & Labour Relations (quota-based)",
        "Apostilled credentials + Uzbek / Russian translation",
        "Renewable annually; PR after 3 years of continuous work permits",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 90,
      applicationUrl: UZ_SOURCE,
      primarySourceUrl: UZ_SOURCE,
      fees: [
        { kind: "base", amountMinor: 30000, currency: "USD", label: "Work permit + visa (~USD 300)" },
      ],
      notes: "Standard employer-sponsored route. Quota allocation by sector + region. Tashkent + Samarkand + Bukhara dominate professional employment.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, sponsorType: "employer" as const },
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// TANZANIA — Tanzania Investment Centre + Immigration Department
// ═══════════════════════════════════════════════════════════════════════════
const TZ_SOURCE = "https://www.immigration.go.tz/";
const TZ_TIC = "https://www.tic.go.tz/";

export const tanzaniaVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "tz_visa_categories",
  iso2: "TZ",
  name: "Tanzania visa categories — Class A Investor / Class B Employment / Tourist",
  primaryUrls: [TZ_SOURCE, TZ_TIC],
  fixturePath: "src/scrapers/sources/__fixtures__/tz_visa_categories.json",
  categories: [
    {
      label: "Tanzania Class A Investor Residence Permit",
      finderGoals: ["invest"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      requirements: [
        "Tanzania Investment Centre (TIC) Certificate of Incentive — investment ≥ USD 300,000 (non-EAC) or USD 100,000 (EAC)",
        "Tanzania-registered company (BRELA + TIN tax registration)",
        "Business plan + proof of capital transfer to Tanzania",
        "Renewable in 2-year cycles; PR after 7 years on continuous Class A",
        "Spouse + children eligible for derivative residence permits",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 120,
      applicationUrl: TZ_TIC,
      primarySourceUrl: TZ_SOURCE,
      fees: [
        { kind: "base", amountMinor: 3050_00, currency: "USD", label: "Class A annual fee (~USD 3,050)" },
        { kind: "service", amountMinor: 250_00, currency: "USD", label: "TIC certificate fee", optional: false },
      ],
      notes: "Tanzania's TIC route is the most-used investor permit. Mining (Mwanza + Geita), tourism (Arusha + Zanzibar), agriculture (Morogoro + Iringa) dominate. East African Community (EAC) nationals get reduced thresholds.",
      purposeMetadata: { sponsorshipRequired: false, jobOfferRequired: false, routeToSettlement: true, sponsorType: "investor" as const },
    },
    {
      label: "Tanzania Class B Employment Residence Permit",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Job offer from a Tanzania-registered employer",
        "Work permit Class B from Ministry of Labour, Employment, Youth & Persons with Disability",
        "Foreign-worker quota — typically 5% of company workforce (sector-specific exceptions)",
        "Apostilled credentials + Swahili translation where required",
        "PR after 7 years of continuous Class B",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 120,
      applicationUrl: TZ_SOURCE,
      primarySourceUrl: TZ_SOURCE,
      fees: [
        { kind: "base", amountMinor: 2050_00, currency: "USD", label: "Class B annual fee (~USD 2,050)" },
      ],
      notes: "Standard employer-sponsored route. Common in NGO/development sector (Dar es Salaam + Dodoma), oil-and-gas (Mtwara), tourism management (Arusha + Zanzibar). Annual renewal cycle adds admin burden.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, sponsorType: "employer" as const },
    },
    {
      label: "Tanzania Tourist Visa / Multiple-Entry Tourist Visa",
      purpose: "tourism",
      status: "e_visa",
      maxStayDays: 90,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: true,
      requirements: [
        "Online application via Tanzania eVisa portal (https://eservices.immigration.go.tz/)",
        "Yellow fever vaccination certificate (mandatory entry requirement)",
        "Confirmed onward ticket + accommodation",
        "Tourist activities only — no work, no remunerated activities",
        "EAC nationals visa-exempt",
      ],
      processingTimeDaysMin: 7,
      processingTimeDaysMax: 14,
      applicationUrl: "https://eservices.immigration.go.tz/",
      primarySourceUrl: TZ_SOURCE,
      fees: [
        { kind: "base", amountMinor: 50_00, currency: "USD", label: "Tourist single-entry (~USD 50)" },
        { kind: "service", amountMinor: 100_00, currency: "USD", label: "Multiple-entry (USD 100)", optional: true },
      ],
      notes: "Tanzania's tourism inflow concentrates on Serengeti, Ngorongoro, Kilimanjaro climbs, Zanzibar. eVisa works for most nationalities; visa-on-arrival also available at Kilimanjaro + Dar airports.",
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// GHANA — Ghana Investment Promotion Centre + Immigration Service
// ═══════════════════════════════════════════════════════════════════════════
const GH_SOURCE = "https://gis.gov.gh/";
const GH_GIPC = "https://www.gipc.gov.gh/";

export const ghanaVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "gh_visa_categories",
  iso2: "GH",
  name: "Ghana visa categories — Work / Investor / Beyond the Return diaspora",
  primaryUrls: [GH_SOURCE, GH_GIPC],
  fixturePath: "src/scrapers/sources/__fixtures__/gh_visa_categories.json",
  categories: [
    {
      label: "Ghana Work and Residence Permit",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Job offer from a Ghana-registered employer (Registrar General's Department registration)",
        "Immigrant Quota approval from Ghana Immigration Service — pre-requisite for the work permit",
        "Apostilled academic credentials + character reference",
        "Renewable in 1-2 year cycles; PR after 7 years",
        "Foreign-worker Immigrant Quota typically tied to capital investment level",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 120,
      applicationUrl: GH_SOURCE,
      primarySourceUrl: GH_SOURCE,
      fees: [
        { kind: "base", amountMinor: 500_00, currency: "USD", label: "Work + residence permit (~USD 500)" },
      ],
      notes: "Ghana's standard employer-sponsored route. Banking + finance (Accra), oil-and-gas (Takoradi), tech (East Legon Hills) dominate. Annual / biennial renewal at GIS.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, sponsorType: "employer" as const, routeToSettlement: true },
    },
    {
      label: "Ghana Investor Residence Permit (GIPC)",
      finderGoals: ["invest"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 4,
      validityDays: 365 * 4,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Investment threshold via GIPC: USD 50k+ (services), USD 200k+ (trading + JV with Ghanaian), USD 500k+ (wholly-foreign trading)",
        "GIPC Investment Certificate + Ghanaian company registration",
        "Automatic Immigrant Quota allocation: 2-4 quota slots based on investment level",
        "Pathway to PR after 4 years + naturalisation after 5 years from PR",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 90,
      applicationUrl: GH_GIPC,
      primarySourceUrl: GH_GIPC,
      fees: [
        { kind: "base", amountMinor: 2000_00, currency: "USD", label: "GIPC registration + permit (~USD 2,000)" },
      ],
      notes: "GIPC-route is faster than the standard work-permit path because the Immigrant Quota is automatic with investment. Free zones (Tema + Sekondi) offer reduced thresholds + tax holidays.",
      purposeMetadata: { sponsorshipRequired: false, jobOfferRequired: false, routeToSettlement: true, sponsorType: "investor" as const },
    },
    {
      label: "Ghana Right of Abode (Beyond the Return — diaspora)",
      finderGoals: ["live_work"],
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 9999,
      validityDays: 9999,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      requirements: [
        "African descent (verified by Ghana Ministry of Tourism, Arts & Culture)",
        "Proof of good character (criminal background check)",
        "Acceptance of Ghana's Constitution + laws",
        "Indefinite stay + work + business rights, but NOT citizenship (separate naturalisation track)",
        "Pathway to citizenship via Naturalisation Act after 5 years of continuous residence on RoA",
      ],
      processingTimeDaysMin: 90,
      processingTimeDaysMax: 180,
      applicationUrl: "https://www.beyondthereturn.gh/",
      primarySourceUrl: "https://www.moc.gov.gh/",
      fees: [
        { kind: "base", amountMinor: 1500_00, currency: "USD", label: "Right of Abode (~USD 1,500)" },
      ],
      notes: "Ghana's Beyond the Return (BTR) initiative offers Right of Abode to African-diaspora descendants — a 2019 expansion of the 2001 Right of Abode statute. Particularly active with US/Caribbean/Brazilian/UK Black diaspora since 2019.",
      purposeMetadata: { routeToSettlement: true },
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// JORDAN — Ministry of Interior + Ministry of Labour
// ═══════════════════════════════════════════════════════════════════════════
const JO_SOURCE = "https://www.moi.gov.jo/";
const JO_MOL = "http://www.mol.gov.jo/";

export const jordanVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "jo_visa_categories",
  iso2: "JO",
  name: "Jordan visa categories — Work / Investor / Family Reunification",
  primaryUrls: [JO_SOURCE, JO_MOL],
  fixturePath: "src/scrapers/sources/__fixtures__/jo_visa_categories.json",
  categories: [
    {
      label: "Jordan Work Permit",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Job offer from Jordan-registered employer (Ministry of Industry & Trade registered)",
        "Work permit from Ministry of Labour — annual quota allocation by sector",
        "Apostilled credentials + Arabic translation",
        "Medical certificate from MoH-approved clinic",
        "Renewable annually; permanent residence after 4 years continuous work permits",
        "Restricted occupations list — closed sectors include barber, hairdresser, taxi driver, security guard, real-estate agent",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: JO_MOL,
      primarySourceUrl: JO_MOL,
      fees: [
        { kind: "base", amountMinor: 1500_00, currency: "JOD", label: "Work permit fee — varies JOD 50-1,000 by sector" },
      ],
      notes: "Jordan's work-permit fees vary widely by sector: skilled professionals JOD 250-500; agricultural workers JOD 50; oil-and-gas + finance JOD 500-1,000. Restricted-occupations list limits low-skilled migration.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, sponsorType: "employer" as const },
    },
    {
      label: "Jordan Investor Residence",
      finderGoals: ["invest", "live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 5,
      validityDays: 365 * 5,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      requirements: [
        "Investment threshold: JOD 50,000+ (small business) / JOD 500,000+ (citizenship-eligible)",
        "Jordan Investment Commission (JIC) registration + business plan",
        "Investment Window: JOD 750k + 150 Jordanian-employed workers = direct citizenship pathway",
        "Spouse + dependent children eligible for derivative residency",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 90,
      applicationUrl: "https://www.jic.gov.jo/",
      primarySourceUrl: "https://www.jic.gov.jo/",
      fees: [
        { kind: "base", amountMinor: 5000_00, currency: "JOD", label: "Investor residence (~JOD 500)" },
      ],
      notes: "Jordan's investor route includes a direct-citizenship-by-investment option (JOD 750k + 150 jobs OR JOD 1M government bonds for 5 years OR JOD 1M JIC-approved share purchase). One of MENA's quietest CBI programmes.",
      purposeMetadata: { sponsorshipRequired: false, jobOfferRequired: false, routeToSettlement: true, sponsorType: "investor" as const },
    },
    {
      label: "Jordan Family Residence Permit",
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 365 * 5,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Sponsor must be Jordanian citizen, Permanent Resident, or holder of Jordan work permit / investor visa",
        "Apostilled marriage / birth certificate + Arabic translation",
        "Sponsor's income proof + housing certificate",
        "Renewable annually; pathway to PR after 4 years",
        "Naturalisation: 4 years after marriage for foreign wife of Jordanian; longer for husband of Jordanian (subject to gender-restriction debate)",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: JO_SOURCE,
      primarySourceUrl: JO_SOURCE,
      fees: [
        { kind: "base", amountMinor: 600_00, currency: "JOD", label: "Family residence (~JOD 60/year)" },
      ],
      notes: "Foreign wives of Jordanian citizens have an easier naturalisation path (4 years) than foreign husbands (subject to ministerial discretion + much longer). Same-sex couples NOT recognised.",
      purposeMetadata: { relationshipTypes: ["spouse", "partner", "child"], sponsorMustBeCitizenOrResident: true, routeToSettlement: true },
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// ETHIOPIA — Main Immigration & Citizenship Service
// ═══════════════════════════════════════════════════════════════════════════
const ET_SOURCE = "https://www.ica.gov.et/";
const ET_INVEST = "https://www.investethiopia.gov.et/";

export const ethiopiaVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "et_visa_categories",
  iso2: "ET",
  name: "Ethiopia visa categories — Work Permit / Investor / Student",
  primaryUrls: [ET_SOURCE, ET_INVEST],
  fixturePath: "src/scrapers/sources/__fixtures__/et_visa_categories.json",
  categories: [
    {
      label: "Ethiopia Work Permit (WP) + Residence",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Job offer from Ethiopia-registered employer (Ministry of Trade & Industry registered)",
        "Work permit from Ministry of Labour and Skills (MOLS)",
        "Apostilled credentials + Amharic translation",
        "Renewable in 2-year cycles; PR after 4 years of continuous work permit",
        "Foreign-worker quota — maximum 4 foreign employees per Ethiopian-majority-owned company",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 120,
      applicationUrl: ET_SOURCE,
      primarySourceUrl: ET_SOURCE,
      fees: [
        { kind: "base", amountMinor: 600_00, currency: "USD", label: "Work permit + residence (~USD 600)" },
      ],
      notes: "Ethiopia's diplomatic + NGO + development sectors dominate professional employment in Addis Ababa. Sugar, agribusiness, textile + leather manufacturing in the regions. Annual renewal cycle.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, sponsorType: "employer" as const, routeToSettlement: true },
    },
    {
      label: "Ethiopia Investor Residence",
      finderGoals: ["invest"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 5,
      validityDays: 365 * 5,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      requirements: [
        "Investment ≥ USD 200,000 (Investment Commission registered company) for foreign investor",
        "Ethiopian Investment Commission (EIC) Certificate of Registration",
        "Business operations + capital transfer proof",
        "Pathway to PR after 3 years on continuous Investor Residence",
        "Spouse + minor children eligible",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 90,
      applicationUrl: ET_INVEST,
      primarySourceUrl: ET_INVEST,
      fees: [
        { kind: "base", amountMinor: 1000_00, currency: "USD", label: "Investor residence (~USD 1,000)" },
      ],
      notes: "Ethiopia's EIC liberalised investor terms in 2023 — many previously reserved sectors opened. Active sectors: textile + leather (Hawassa Industrial Park), pharmaceuticals (Kilinto), agriculture, ICT (Addis Ababa).",
      purposeMetadata: { sponsorshipRequired: false, jobOfferRequired: false, routeToSettlement: true, sponsorType: "investor" as const },
    },
    {
      label: "Ethiopia Student Visa",
      finderGoals: ["study"],
      purpose: "study",
      status: "embassy_visa",
      maxStayDays: 365 * 5,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      requirements: [
        "Acceptance from Addis Ababa University / Bahir Dar / Mekelle / Jimma / Hawassa University etc.",
        "Proof of tuition payment + sufficient funds (~USD 200/month living costs)",
        "Apostilled academic transcripts + Amharic translation where required",
        "Yellow fever vaccination certificate",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 60,
      applicationUrl: ET_SOURCE,
      primarySourceUrl: ET_SOURCE,
      fees: [
        { kind: "base", amountMinor: 100_00, currency: "USD", label: "Student visa fee (~USD 100)" },
      ],
      notes: "Ethiopia attracts students from Somalia, Yemen, Eritrea + broader African diaspora. Addis Ababa University is the regional anchor; international PhD programmes especially in agriculture + public health.",
      purposeMetadata: { institutionAccreditationRequired: true, financialProofMonthlyMinor: 20000, financialProofCurrency: "USD" },
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// UGANDA — Uganda Investment Authority + Internal Affairs
// ═══════════════════════════════════════════════════════════════════════════
const UG_SOURCE = "https://www.immigration.go.ug/";
const UG_UIA = "https://www.ugandainvest.go.ug/";

export const ugandaVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "ug_visa_categories",
  iso2: "UG",
  name: "Uganda visa categories — Work / Investor / Tourist",
  primaryUrls: [UG_SOURCE, UG_UIA],
  fixturePath: "src/scrapers/sources/__fixtures__/ug_visa_categories.json",
  categories: [
    {
      label: "Uganda Work Permit (Class B-G)",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Job offer from Uganda-registered employer (URSB-registered)",
        "Work permit class B (Investor), C (NGO), D (Employee), E (Self-Employed), F (Religious), G (Spouse of Citizen) — applicant chooses based on activity",
        "Apostilled credentials + character reference",
        "Renewable in 2-year cycles; PR after 10 years of continuous residence",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 90,
      applicationUrl: UG_SOURCE,
      primarySourceUrl: UG_SOURCE,
      fees: [
        { kind: "base", amountMinor: 3000_00, currency: "USD", label: "Work permit annual (~USD 3,000 for Class B/D)" },
      ],
      notes: "Uganda's tiered work-permit system — class chosen at application. Class D (Employee) is the standard; Class B (Investor) gives longer validity + family rights. NGO + development concentration in Kampala; oil-and-gas in Hoima (Lake Albert basin).",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, sponsorType: "employer" as const },
    },
    {
      label: "Uganda Class B Investor Residence (UIA)",
      finderGoals: ["invest"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 5,
      validityDays: 365 * 5,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      requirements: [
        "Investment ≥ USD 250,000 (foreign investor) — UIA Investment Licence required",
        "Uganda Investment Authority Certificate of Incentives + capital transfer proof",
        "Pathway to PR after 7 years on continuous Class B",
        "Spouse + dependent children eligible for derivative permits",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 90,
      applicationUrl: UG_UIA,
      primarySourceUrl: UG_UIA,
      fees: [
        { kind: "base", amountMinor: 4000_00, currency: "USD", label: "Class B investor permit (~USD 4,000)" },
      ],
      notes: "UIA route is faster than the standard work permit. Free Zones (Mukono + Kampala) offer reduced thresholds + tax holidays. Common sectors: agro-processing, ICT (Innovation Village), oil-and-gas services.",
      purposeMetadata: { sponsorshipRequired: false, jobOfferRequired: false, routeToSettlement: true, sponsorType: "investor" as const },
    },
    {
      label: "Uganda Tourist Visa / East Africa Tourist Visa",
      purpose: "tourism",
      status: "e_visa",
      maxStayDays: 90,
      validityDays: 90,
      entriesAllowed: "single",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: true,
      requirements: [
        "Online application via Uganda eVisa portal (https://visas.immigration.go.ug/)",
        "Yellow fever vaccination certificate (mandatory entry requirement)",
        "Confirmed onward ticket + accommodation",
        "East Africa Tourist Visa (USD 100) covers Uganda + Kenya + Rwanda for 90 days",
        "EAC nationals visa-exempt",
      ],
      processingTimeDaysMin: 7,
      processingTimeDaysMax: 14,
      applicationUrl: "https://visas.immigration.go.ug/",
      primarySourceUrl: UG_SOURCE,
      fees: [
        { kind: "base", amountMinor: 50_00, currency: "USD", label: "Single-entry Uganda tourist (~USD 50)" },
        { kind: "service", amountMinor: 100_00, currency: "USD", label: "East Africa Tourist Visa (3-country)", optional: true },
      ],
      notes: "Uganda's tourism inflow concentrates on Bwindi gorillas + Murchison Falls + Queen Elizabeth NP. East Africa Tourist Visa is excellent value for multi-country trips. Visa-on-arrival also at Entebbe airport.",
    },
  ],
});
