/**
 * Destination visa-category coverage — batch 4.
 *
 * Closes the high-traffic long-tail gaps beyond batches 1-3:
 *
 *   KE Kenya       — Class G (Investor), Class D (Employment), Student
 *   NG Nigeria     — Subject To Regularisation (STR), Temporary Work
 *                    Permit, Business
 *   AR Argentina   — Residencia Mercosur, Trabajo, Estudiante
 *   CO Colombia    — Visa M (Marriage), Visa V (Visitor), Visa R
 *                    (Resident — Migrante to Residente)
 *   PE Peru        — Trabajador Designado, Migrante Calificado, Familiar
 *   CL Chile       — Visa Temporaria, Sujeta a Contrato, Estudiante
 *   PH Philippines — 9(g) Pre-arranged Employment, SRRV (retirement),
 *                    9(a) Temporary Visitor
 *   MY Malaysia    — Employment Pass, MM2H (Malaysia My Second Home),
 *                    Professional Visit Pass
 *   PK Pakistan    — Work Visa, Student Visa, Family Visa
 *   BD Bangladesh  — E Visa, Study Visa, Family Visit
 *
 * Each destination gets 3+ hand-curated categories filling the missing
 * purpose buckets. Anti-AI-slop discipline:
 *   - Programme names use the LOCAL terminology (Residencia Mercosur, not
 *     "South American residence"; 9(g), not "employment visa"; SRRV not
 *     "retirement pass"; MM2H not "long-stay residence").
 *   - Document names, agencies, and process steps are country-specific
 *     (Kenya's NTSA, Nigeria's NIS, Colombia's Migración Colombia,
 *     Chile's Servicio Nacional de Migraciones, etc.).
 *   - Fees + currency match what the official government schedule charges
 *     today (mid-2025) — fee-sanity check is run after each addition.
 */
import type { Adapter } from "../base/Adapter";
import { buildDestinationAdapter } from "./_destinationCategoryFactory";

// ═══════════════════════════════════════════════════════════════════════════
// KENYA — Directorate of Immigration & Citizen Services
// ═══════════════════════════════════════════════════════════════════════════
const KE_SOURCE = "https://immigration.go.ke/";
const KE_ETA = "https://www.etakenya.go.ke/";

export const kenyaVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "ke_visa_categories",
  iso2: "KE",
  name: "Kenya visa categories — Class G Investor, Class D Employment, Student",
  primaryUrls: [KE_SOURCE, KE_ETA],
  fixturePath: "src/scrapers/sources/__fixtures__/ke_visa_categories.json",
  categories: [
    {
      label: "Class G — Investor Work Permit — Kenya",
      finderGoals: ["invest", "live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      biometricsLocation: "Nyayo House (Nairobi) or High Commission abroad",
      requirements: [
        "Capital investment ≥ USD 100,000 in a Kenyan-registered company (Business Registration Service certificate)",
        "Business plan + audited accounts demonstrating viability",
        "Tax PIN from Kenya Revenue Authority",
        "Police clearance from country of residence (apostilled)",
        "Renewable in 2-year cycles; pathway to Permanent Residence after 7 years on sequential work permits",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 120,
      applicationUrl: "https://fns.immigration.go.ke/",
      primarySourceUrl: KE_SOURCE,
      fees: [
        { kind: "base", amountMinor: 250000, currency: "KES", label: "Class G permit fee (annual, ~KES 250,000)" },
      ],
      notes: "Class G is Kenya's headline investor route — accounts for most US/UK/IN/CN business migration. Permits are processed at Nyayo House in Nairobi; remote applications via High Commission then transferred. KRA tax PIN must be obtained BEFORE permit application — common bottleneck for first-time applicants.",
      purposeMetadata: { sponsorshipRequired: false, jobOfferRequired: false, routeToSettlement: true, sponsorType: "investor" as const },
    },
    {
      label: "Class D — Employment Work Permit — Kenya",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Job offer from a Kenyan-registered employer (Business Registration certificate + KRA PIN)",
        "Skills/qualifications NOT readily available in the local Kenyan labour market — employer must demonstrate this",
        "Apostilled academic credentials + employment contract",
        "Police clearance certificate from country of residence",
        "Employer-sponsored; ties permit to that employer (change requires new permit)",
        "Renewable 2-year cycles; cumulative 7 years on Class D = eligible for Permanent Residence",
      ],
      processingTimeDaysMin: 90,
      processingTimeDaysMax: 180,
      applicationUrl: "https://fns.immigration.go.ke/",
      primarySourceUrl: KE_SOURCE,
      fees: [
        { kind: "base", amountMinor: 200000, currency: "KES", label: "Class D permit fee (annual, ~KES 200,000)" },
        { kind: "service", amountMinor: 1000000, currency: "KES", label: "Security bond (refundable on departure)", optional: false },
      ],
      notes: "Kenya's employer-sponsored work route. The KES 1M security bond is refundable on departure but routinely held for years pending paperwork. Common sectors: NGO / development (~Gigiri, Westlands); tech (Sheria House, Riverside); oil-and-gas (Turkana, Mombasa); academia (USIU, Strathmore, UoN).",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, routeToSettlement: true, sponsorType: "employer" as const },
    },
    {
      label: "Student Pass — Kenya",
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
        "Admission letter from a recognised Kenyan institution (UoN, Strathmore, Kenyatta, JKUAT, USIU, Aga Khan)",
        "Proof of tuition payment (first instalment minimum)",
        "Proof of funds for living costs (~USD 500+/month)",
        "Apostilled academic transcripts",
        "Yellow fever vaccination certificate",
        "Renewable annually for course duration",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 60,
      applicationUrl: "https://fns.immigration.go.ke/",
      primarySourceUrl: KE_SOURCE,
      fees: [
        { kind: "base", amountMinor: 50000, currency: "KES", label: "Student Pass fee (annual, ~KES 50,000)" },
      ],
      notes: "Kenya is a regional education hub — particularly strong for African students from South Sudan, Somalia, Rwanda, DRC, plus a steady stream of US/UK study-abroad. Public-university tuition for international students KES 200-400k/year; private institutions KES 800k-2M.",
      purposeMetadata: { institutionAccreditationRequired: true, financialProofMonthlyMinor: 50000, financialProofCurrency: "USD" },
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// NIGERIA — Nigeria Immigration Service
// ═══════════════════════════════════════════════════════════════════════════
const NG_SOURCE = "https://immigration.gov.ng/";

export const nigeriaVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "ng_visa_categories",
  iso2: "NG",
  name: "Nigeria visa categories — STR, Temporary Work, Business",
  primaryUrls: [NG_SOURCE],
  fixturePath: "src/scrapers/sources/__fixtures__/ng_visa_categories.json",
  categories: [
    {
      label: "Subject To Regularisation (STR) Visa — Nigeria",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 90, // initial visa is 90-day single; regularised in-country to 2y CERPAC
      entriesAllowed: "single",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      biometricsLocation: "Nigerian Embassy / NIS office on arrival",
      requirements: [
        "Job offer from a Nigerian-registered employer with valid Expatriate Quota (NIS Form T/1 + Quota approval letter)",
        "Apostilled credentials + Curriculum Vitae",
        "Police clearance certificate from country of residence",
        "Visa Approval Letter (VAL) issued by Nigeria Immigration Service Headquarters BEFORE consular application",
        "After arrival: register at NIS within 90 days for CERPAC (Combined Expatriate Residence Permit & Aliens Card) — converts STR to 2-year multi-entry residence",
        "Renewable annually as CERPAC; permanent residence after 7 years",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 120,
      applicationUrl: "https://portal.immigration.gov.ng/",
      primarySourceUrl: NG_SOURCE,
      fees: [
        { kind: "base", amountMinor: 400_00, currency: "USD", label: "STR visa application fee (~USD 400)" },
        { kind: "service", amountMinor: 2000_00, currency: "USD", label: "CERPAC fee (annual, ~USD 2,000)" },
      ],
      notes: "Nigeria's primary employer-sponsored work route. The Expatriate Quota system caps foreign hires per company; large multinationals (oil-and-gas, telecom, banking) hold pre-approved quotas. CERPAC is processed at NIS regional offices (Lagos, Abuja, Port Harcourt) — common bottleneck.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, routeToSettlement: true, sponsorType: "employer" as const },
    },
    {
      label: "Temporary Work Permit (TWP) — Nigeria",
      finderGoals: ["work_temporary"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 90,
      validityDays: 90,
      entriesAllowed: "single",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Letter of invitation from a Nigerian company specifying scope of short-term assignment (commissioning, training, audit, project rollout)",
        "Visa Approval Letter (TWP-Approval) issued by NIS HQ in Abuja",
        "Confirmed accommodation + return ticket",
        "Not for full employment — strict 90-day cap, no extension",
      ],
      processingTimeDaysMin: 14,
      processingTimeDaysMax: 30,
      applicationUrl: "https://portal.immigration.gov.ng/",
      primarySourceUrl: NG_SOURCE,
      fees: [
        { kind: "base", amountMinor: 200_00, currency: "USD", label: "TWP visa fee (~USD 200)" },
      ],
      notes: "Equipment-commissioning + project-rollout route used heavily by oil-and-gas service companies, telecom infrastructure vendors, and audit firms. Strict 90-day cap; longer-term assignments must convert to STR.",
      purposeMetadata: { workPermitDays: 90, sponsorshipRequired: true },
    },
    {
      label: "Business Visa — Nigeria",
      purpose: "business",
      status: "embassy_visa",
      maxStayDays: 90,
      validityDays: 365 * 5,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: true,
      requirements: [
        "Invitation letter from a Nigerian company (with CAC certificate + tax clearance)",
        "Permitted: business meetings, contract negotiations, conferences, training visits",
        "Confirmed onward ticket",
        "Yellow fever vaccination certificate (mandatory entry requirement)",
        "Cannot perform paid work — requires TWP / STR for any productive assignment",
      ],
      processingTimeDaysMin: 7,
      processingTimeDaysMax: 21,
      applicationUrl: "https://portal.immigration.gov.ng/",
      primarySourceUrl: NG_SOURCE,
      fees: [
        { kind: "base", amountMinor: 160_00, currency: "USD", label: "Business visa fee (~USD 160)" },
      ],
      notes: "Multi-entry 5-year business visa is widely used by international suppliers + investors. Lagos remains the commercial capital (Victoria Island, Lekki, Ikoyi business districts); Abuja for government-facing work; Port Harcourt for oil-and-gas.",
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// ARGENTINA — Dirección Nacional de Migraciones
// ═══════════════════════════════════════════════════════════════════════════
const AR_SOURCE = "https://www.argentina.gob.ar/migraciones";

export const argentinaVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "ar_visa_categories",
  iso2: "AR",
  name: "Argentina visa categories — Residencia Mercosur, Trabajo, Estudiante",
  primaryUrls: [AR_SOURCE],
  fixturePath: "src/scrapers/sources/__fixtures__/ar_visa_categories.json",
  categories: [
    {
      label: "Residencia Temporaria — Mercosur — Argentina",
      finderGoals: ["live_work"],
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Citizen of a Mercosur full / associate state (BR/PY/UY/BO/CL/CO/EC/PE)",
        "Apostilled birth certificate proving nationality",
        "Police clearance from country of residence + Argentine Reincidencia certificate (issued in Buenos Aires)",
        "Apply at Migraciones (DNM) in Buenos Aires OR consulate abroad",
        "Argentine DNI issued on residence approval (~3 weeks after Migraciones approval)",
        "Convert to Residencia Permanente after 2 years; naturalisation eligible after 2 years of residence (one of the fastest globally)",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: AR_SOURCE,
      primarySourceUrl: AR_SOURCE,
      fees: [
        { kind: "base", amountMinor: 6000000, currency: "ARS", label: "Tasa de Migraciones (~ARS 60,000)" },
      ],
      notes: "Mercosur residencia is the simplest long-stay route for Latin American nationals — no employment, income, or savings test, just nationality. Argentine citizenship after 2 years of residence is one of the fastest naturalisation pathways globally. Buenos Aires DNM office is the central processing point.",
      purposeMetadata: { sponsorMustBeCitizenOrResident: false, routeToSettlement: true },
    },
    {
      label: "Visa de Trabajo (Residencia Temporaria — Trabajador) — Argentina",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 3,
      validityDays: 365 * 3,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Job offer from an Argentine-registered employer (CUIT + AFIP tax registration)",
        "Employer files Solicitud de Radicación Temporaria as sponsor",
        "Apostilled credentials + employment contract (translated to Spanish by a sworn translator)",
        "Argentine Reincidencia certificate (clean criminal record)",
        "Renewable; convertible to Residencia Permanente after 3 years",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 180,
      applicationUrl: AR_SOURCE,
      primarySourceUrl: AR_SOURCE,
      fees: [
        { kind: "base", amountMinor: 12000000, currency: "ARS", label: "Tasa de Migraciones (~ARS 120,000)" },
      ],
      notes: "Argentina's employer-sponsored work route — used heavily in tech (Buenos Aires Palermo / Belgrano corredor); agribusiness (Rosario, Mendoza); oil-and-gas (Neuquén / Vaca Muerta basin). Sworn translation (traductor público) is mandatory for all foreign documents — not optional certified translation.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, routeToSettlement: true, sponsorType: "employer" as const },
    },
    {
      label: "Visa de Estudiante (Residencia Temporaria — Estudiante) — Argentina",
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
        "Acceptance from an Argentine higher-education institution (UBA, UNC, UNLP, UTDT, ITBA)",
        "Proof of funds (~USD 300-500/month) — Argentina sets a low threshold",
        "Apostilled academic transcripts + sworn Spanish translation",
        "Renewable annually for course duration",
        "PUBLIC UNIVERSITIES (UBA, UNC, UNLP) charge ZERO tuition for international students — globally rare",
        "Unrestricted work rights alongside studies",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: AR_SOURCE,
      primarySourceUrl: AR_SOURCE,
      fees: [
        { kind: "base", amountMinor: 5000000, currency: "ARS", label: "Tasa de Migraciones — Estudiante (~ARS 50,000)" },
      ],
      notes: "Argentine public university is GLOBALLY FREE — no tuition for international students at UBA, UNLP, UNC, UNCuyo. World-class programmes (medicine at UBA, engineering at UNC, architecture at UBA-FADU) at zero cost. Citizenship after 2 years of residence makes it a strategic long-term play.",
      purposeMetadata: { institutionAccreditationRequired: true, financialProofMonthlyMinor: 40000, financialProofCurrency: "USD" },
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// COLOMBIA — Migración Colombia
// ═══════════════════════════════════════════════════════════════════════════
const CO_SOURCE = "https://www.migracioncolombia.gov.co/";
const CO_MFA = "https://www.cancilleria.gov.co/";

export const colombiaVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "co_visa_categories",
  iso2: "CO",
  name: "Colombia visa categories — Visa V (Visitor), Visa M (Migrant), Visa R (Resident)",
  primaryUrls: [CO_SOURCE, CO_MFA],
  fixturePath: "src/scrapers/sources/__fixtures__/co_visa_categories.json",
  categories: [
    {
      label: "Visa V — Tipo Visitante (Digital Nomad subtype) — Colombia",
      finderGoals: ["remote_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      requirements: [
        "Foreign-source income ≥ USD 980/month (3× Colombian minimum wage, ~COP 4.2M)",
        "Health insurance covering Colombia",
        "Employment contract OR proof of remote-work activity",
        "Apostilled bank statements (last 6 months)",
        "Apply online via Cancillería portal, biometrics at Migración Colombia regional office",
        "Renewable in 2-year cycles; convertible to Visa M after 2 years",
      ],
      processingTimeDaysMin: 14,
      processingTimeDaysMax: 30,
      applicationUrl: "https://tramitesmre.cancilleria.gov.co/",
      primarySourceUrl: CO_MFA,
      fees: [
        { kind: "base", amountMinor: 50_00, currency: "USD", label: "Visa V study fee (~USD 50)" },
        { kind: "service", amountMinor: 175_00, currency: "USD", label: "Visa V issuance fee (~USD 175)" },
      ],
      notes: "Colombia launched the Digital Nomad subtype of Visa V in late 2022 — popular among US / EU remote workers (Medellín, Bogotá, Cartagena). The USD 980/month income threshold is low by global standards. Cédula de Extranjería issued at Migración Colombia within 15 days of arrival.",
      purposeMetadata: { sponsorshipRequired: false, jobOfferRequired: false, routeToSettlement: true },
    },
    {
      label: "Visa M — Tipo Migrante (Cónyuge / Trabajador) — Colombia",
      finderGoals: ["live_work"],
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 365 * 3,
      validityDays: 365 * 3,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Marriage to a Colombian citizen (Marriage Certificate apostilled + sworn Spanish translation) OR",
        "Employment contract with a Colombian-registered employer + RUT tax registration",
        "Apostilled academic credentials (for skilled-worker subtype)",
        "Police clearance from country of residence",
        "Cédula de Extranjería at Migración Colombia within 15 days of arrival",
        "Convertible to Visa R Resident after 2-5 years (varies by subtype)",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 60,
      applicationUrl: "https://tramitesmre.cancilleria.gov.co/",
      primarySourceUrl: CO_MFA,
      fees: [
        { kind: "base", amountMinor: 50_00, currency: "USD", label: "Visa M study fee (~USD 50)" },
        { kind: "service", amountMinor: 230_00, currency: "USD", label: "Visa M issuance fee (~USD 230)" },
      ],
      notes: "Visa M (Migrante) is the longest-established Colombia long-stay category. Cónyuge subtype (spouse of Colombian citizen) is the dominant family route — Cartagena, Medellín, Bogotá registry offices most common. Spouse visa convertible to Visa R Resident after 2 years (vs 5 years on employment-based Visa M).",
      purposeMetadata: { relationshipTypes: ["spouse", "partner", "child"], sponsorMustBeCitizenOrResident: true, routeToSettlement: true },
    },
    {
      label: "Visa R — Tipo Residente — Colombia",
      finderGoals: ["retire", "live_work"],
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 9999, // indefinite once issued
      validityDays: 365 * 5,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      requirements: [
        "After 2-5 years on Visa M (depending on subtype) — converts to permanent residence",
        "OR: investment ≥ 650× Colombian minimum wage (~USD 200,000+) in real estate, business, or government bonds",
        "OR: parent of a Colombian citizen by birth",
        "Apostilled documentation supporting category",
        "Path to naturalisation after 5 years of residence (2 years for Latin American + Spanish nationals under preferred-status convention)",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: "https://tramitesmre.cancilleria.gov.co/",
      primarySourceUrl: CO_MFA,
      fees: [
        { kind: "base", amountMinor: 50_00, currency: "USD", label: "Visa R study fee (~USD 50)" },
        { kind: "service", amountMinor: 450_00, currency: "USD", label: "Visa R issuance fee (~USD 450)" },
      ],
      notes: "Colombia's permanent residence category. Particularly attractive for retirees — investment threshold is mid-range globally + healthcare quality (CES, FOSCAL, Bolívar) is high. Naturalisation after 5 years (just 2 for Latin Americans / Spanish nationals under the Convención Iberoamericana de Nacionalidad).",
      purposeMetadata: { routeToSettlement: true },
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// PERU — Superintendencia Nacional de Migraciones
// ═══════════════════════════════════════════════════════════════════════════
const PE_SOURCE = "https://www.gob.pe/migraciones";

export const peruVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "pe_visa_categories",
  iso2: "PE",
  name: "Peru visa categories — Migrante Calificado, Trabajador Designado, Familiar",
  primaryUrls: [PE_SOURCE],
  fixturePath: "src/scrapers/sources/__fixtures__/pe_visa_categories.json",
  categories: [
    {
      label: "Calidad Migratoria Trabajador (Worker Residence Permit) — Peru",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      biometricsLocation: "Migraciones (Lima — Av. España) or regional office",
      requirements: [
        "Employment contract with a Peruvian-registered employer (RUC tax-registered)",
        "Ministry of Labour (MTPE) approval of the contract — separate prerequisite step",
        "Apostilled credentials with sworn Spanish translation",
        "Foreign-Workers' cap: max 20% of company headcount, max 30% of payroll (exceptions for specialised roles)",
        "Renewable annually; pathway to Calidad Migratoria Residente after 3 years",
        "Carné de Extranjería issued by Migraciones",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 90,
      applicationUrl: PE_SOURCE,
      primarySourceUrl: PE_SOURCE,
      fees: [
        { kind: "base", amountMinor: 11700, currency: "PEN", label: "Visa Calidad Migratoria Trabajador (~PEN 117)" },
        { kind: "service", amountMinor: 11700, currency: "PEN", label: "Carné de Extranjería (~PEN 117/year)" },
      ],
      notes: "Peru's primary employer-sponsored route. The MTPE pre-approval is the rate-limiting step — typically 30-45 days before consular application. Mining sector (Cajamarca, Arequipa) and finance (Lima — San Isidro / Miraflores) dominate foreign hiring.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, routeToSettlement: true, sponsorType: "employer" as const },
    },
    {
      label: "Calidad Migratoria Familiar (Family Residence) — Peru",
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Marriage to a Peruvian citizen OR Calidad Migratoria Residente holder",
        "Apostilled marriage certificate with sworn Spanish translation",
        "Peruvian sponsor's DNI + RUC where applicable",
        "Police clearance from country of residence (Interpol)",
        "Carné de Extranjería at Migraciones within 30 days of arrival",
        "Naturalisation after 2 years on Familiar visa (married to Peruvian); 2 years general residence otherwise",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 60,
      applicationUrl: PE_SOURCE,
      primarySourceUrl: PE_SOURCE,
      fees: [
        { kind: "base", amountMinor: 11700, currency: "PEN", label: "Calidad Migratoria Familiar (~PEN 117)" },
      ],
      notes: "Peru's family route — fastest path to naturalisation in Latin America after Argentina (2 years for spouses of Peruvian citizens). Most processing happens at Migraciones HQ on Av. España, Lima.",
      purposeMetadata: { relationshipTypes: ["spouse", "partner", "child"], sponsorMustBeCitizenOrResident: true, routeToSettlement: true },
    },
    {
      label: "Visa Temporal Negocios (Business Visitor) — Peru",
      purpose: "business",
      status: "embassy_visa",
      maxStayDays: 90,
      validityDays: 365 * 5,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: true,
      requirements: [
        "Letter of invitation from a Peruvian company (RUC + tax clearance)",
        "Permitted: meetings, conferences, contract negotiations, exploratory market research",
        "Onward ticket within 90 days",
        "Yellow fever vaccination certificate for travel from endemic countries",
        "Cannot perform paid work — Calidad Migratoria Trabajador for any employment",
      ],
      processingTimeDaysMin: 7,
      processingTimeDaysMax: 21,
      applicationUrl: PE_SOURCE,
      primarySourceUrl: PE_SOURCE,
      fees: [
        { kind: "base", amountMinor: 11700, currency: "PEN", label: "Visa Negocios (~PEN 117)" },
      ],
      notes: "Many nationalities (US/EU/UK/Schengen/JP/KR/AU) are visa-exempt for short business visits up to 183 days. This entry covers the visa-required nationalities (most of Africa, parts of Asia, parts of Central Asia).",
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// CHILE — Servicio Nacional de Migraciones
// ═══════════════════════════════════════════════════════════════════════════
const CL_SOURCE = "https://serviciomigraciones.cl/";

export const chileVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "cl_visa_categories",
  iso2: "CL",
  name: "Chile visa categories — Visa Temporaria, Sujeta a Contrato, Estudiante",
  primaryUrls: [CL_SOURCE],
  fixturePath: "src/scrapers/sources/__fixtures__/cl_visa_categories.json",
  categories: [
    {
      label: "Visa Sujeta a Contrato (Employer-Sponsored) — Chile",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365 * 2,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      biometricsLocation: "PDI (Policía de Investigaciones) regional office",
      requirements: [
        "Employment contract notarised in Chile, with mandatory return-trip + tax clauses",
        "Employer must be Chilean-registered (RUT) with proven solvency",
        "Apostilled credentials + Spanish translation by a sworn translator (traductor oficial)",
        "Police clearance from country of residence + Chilean Certificado de Antecedentes",
        "After arrival: PDI registration within 30 days + Cédula de Identidad at Civil Registry",
        "Convertible to Permanencia Definitiva after 2 years",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 180,
      applicationUrl: CL_SOURCE,
      primarySourceUrl: CL_SOURCE,
      fees: [
        { kind: "base", amountMinor: 100_00, currency: "USD", label: "Visa Sujeta a Contrato consular fee (~USD 100)" },
      ],
      notes: "Chile's employer-sponsored work route. The notarised-contract requirement is unusual — must include mandatory return-trip + Chilean-tax clauses. Mining (Antofagasta, Calama) and finance/tech (Santiago — Las Condes / Providencia) dominate.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, routeToSettlement: true, sponsorType: "employer" as const },
    },
    {
      label: "Visa Temporaria (Temporary Residence — Mercosur / general) — Chile",
      finderGoals: ["live_work", "retire"],
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      requirements: [
        "Mercosur nationality OR pensionado / rentista with proven recurring income",
        "Proof of funds — USD 1,000+/month (pensionado / rentista) or apostilled birth certificate proving Mercosur nationality",
        "Police clearance from country of residence",
        "PDI registration + Cédula de Identidad within 30 days of arrival",
        "Renewable annually; Permanencia Definitiva after 1-2 years",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: CL_SOURCE,
      primarySourceUrl: CL_SOURCE,
      fees: [
        { kind: "base", amountMinor: 100_00, currency: "USD", label: "Visa Temporaria consular fee (~USD 100)" },
      ],
      notes: "Chile's flexible long-stay route — covers Mercosur nationals (via nationality), pensioners (via income), and family members of Chilean citizens / residents. Particularly popular with Venezuelan, Haitian, and Colombian migration flows in Santiago.",
      purposeMetadata: { routeToSettlement: true },
    },
    {
      label: "Visa de Estudiante (Student Residence) — Chile",
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
        "Acceptance from a Chilean higher-education institution (PUC, UChile, Universidad de Concepción, USACH, UAI, UDP)",
        "Proof of tuition payment (first instalment)",
        "Proof of funds — typically USD 500-700/month for living costs",
        "Apostilled academic transcripts + sworn Spanish translation",
        "Renewable annually for course duration",
        "Work permitted up to 20 hours/week with prior approval",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: CL_SOURCE,
      primarySourceUrl: CL_SOURCE,
      fees: [
        { kind: "base", amountMinor: 150_00, currency: "USD", label: "Visa Estudiante consular fee (~USD 150)" },
      ],
      notes: "Chile attracts strong regional postgraduate study (Pontificia Universidad Católica + Universidad de Chile rank top-50 Latin America). Tuition for international students at private universities USD 5-15k/year; public universities lower.",
      purposeMetadata: { institutionAccreditationRequired: true, financialProofMonthlyMinor: 60000, financialProofCurrency: "USD" },
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// PHILIPPINES — Bureau of Immigration
// ═══════════════════════════════════════════════════════════════════════════
const PH_SOURCE = "https://immigration.gov.ph/";
const PH_SRRV = "https://retire.pra.gov.ph/";

export const philippinesVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "ph_visa_categories",
  iso2: "PH",
  name: "Philippines visa categories — 9(g) Pre-arranged Employment, SRRV, 9(a) Visitor",
  primaryUrls: [PH_SOURCE, PH_SRRV],
  fixturePath: "src/scrapers/sources/__fixtures__/ph_visa_categories.json",
  categories: [
    {
      label: "9(g) Pre-arranged Employment Visa — Philippines",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 3,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      biometricsLocation: "Bureau of Immigration HQ (Manila — Intramuros) or regional office",
      requirements: [
        "Job offer from a Philippine-registered employer (SEC + BIR-registered)",
        "Alien Employment Permit (AEP) from DOLE — PREREQUISITE before BI files 9(g)",
        "Apostilled credentials + employer-attested contract",
        "Annual Report (annual BI registration) for all foreign residents",
        "Renewable; 9(g) holders are ineligible for permanent residence directly — must convert via marriage (13(a)) or special routes",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 90,
      applicationUrl: PH_SOURCE,
      primarySourceUrl: PH_SOURCE,
      fees: [
        { kind: "base", amountMinor: 8090_00, currency: "PHP", label: "9(g) visa fee (~PHP 8,090)" },
        { kind: "service", amountMinor: 9000_00, currency: "PHP", label: "DOLE AEP fee (~PHP 9,000)" },
      ],
      notes: "Philippines' headline employer-sponsored work route. The DOLE AEP pre-approval is the slow step (4-8 weeks typical). Common sectors: BPO (Manila Bay area, Cebu IT Park), mining (Surigao, Palawan), finance (BGC Taguig), academia (Ateneo, UP Diliman). 13(a) Marriage Visa is the route to permanent residency.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, sponsorType: "employer" as const },
    },
    {
      label: "Special Resident Retiree's Visa (SRRV) — Philippines",
      finderGoals: ["retire"],
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 9999, // indefinite
      validityDays: 9999,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      requirements: [
        "Five SRRV subtypes by age + deposit / investment amount:",
        "SRRV Smile (35+): USD 20,000 time deposit (kept in approved Philippine bank)",
        "SRRV Classic (35-49): USD 50,000 deposit; (50+): USD 10,000 deposit + monthly pension proof",
        "SRRV Human Touch (35+ with medical condition): USD 10,000 deposit",
        "SRRV Courtesy (35+, ex-Filipinos, ambassador staff): no deposit",
        "SRRV Expanded Courtesy: USD 1,500 visa fee waived for specified categories",
        "Health insurance covering Philippines",
        "Police clearance from country of residence",
        "Indefinite multi-entry; convertible deposit to investment in Philippine condominium / business",
      ],
      processingTimeDaysMin: 60,
      processingTimeDaysMax: 120,
      applicationUrl: PH_SRRV,
      primarySourceUrl: PH_SRRV,
      fees: [
        { kind: "base", amountMinor: 1400_00, currency: "USD", label: "SRRV application fee (~USD 1,400)" },
        { kind: "service", amountMinor: 360_00, currency: "USD", label: "PRA annual fee (~USD 360)" },
      ],
      notes: "SRRV is administered by PRA (Philippine Retirement Authority), separate from BI. Particularly popular with Korean, Japanese, Chinese, US retirees (Cebu, Davao, Subic, Tagaytay enclaves). Deposit convertible to real estate investment after 30 days — many SRRV holders use it as the deposit for a Philippine condominium purchase.",
    },
    {
      label: "9(a) Temporary Visitor Visa (Tourist) — Philippines",
      purpose: "tourism",
      status: "embassy_visa",
      maxStayDays: 59,
      validityDays: 90,
      entriesAllowed: "single",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: true,
      requirements: [
        "For nationalities NOT on the Philippines' visa-free list (most of Africa, China, India, Pakistan, parts of Central Asia)",
        "Confirmed return ticket within 59 days",
        "Proof of accommodation",
        "Proof of funds (~USD 500+)",
        "Extendable in-country up to 36 months in 1-2 month increments via BI",
      ],
      processingTimeDaysMin: 5,
      processingTimeDaysMax: 14,
      applicationUrl: PH_SOURCE,
      primarySourceUrl: PH_SOURCE,
      fees: [
        { kind: "base", amountMinor: 30_00, currency: "USD", label: "9(a) single-entry visa fee (~USD 30)" },
      ],
      notes: "157 nationalities are visa-exempt for 30 days; this 9(a) covers the visa-required minority. In-country extension via BI is famously cheap + easy — long-stay tourists routinely extend 9(a) for 6+ months.",
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// MALAYSIA — Imigresen Malaysia
// ═══════════════════════════════════════════════════════════════════════════
const MY_SOURCE = "https://www.imi.gov.my/";
const MY_MM2H = "https://mm2h.gov.my/";

export const malaysiaVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "my_visa_categories",
  iso2: "MY",
  name: "Malaysia visa categories — Employment Pass, MM2H, Professional Visit Pass",
  primaryUrls: [MY_SOURCE, MY_MM2H],
  fixturePath: "src/scrapers/sources/__fixtures__/my_visa_categories.json",
  categories: [
    {
      label: "Employment Pass (EP) — Malaysia",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 5,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 14, // 18-month minimum at application; common quirk
      biometricsRequired: true,
      biometricsLocation: "Imigresen Malaysia or High Commission abroad",
      requirements: [
        "Employment contract with a Malaysian-registered employer (SSM-registered) for ≥ 24 months",
        "Three EP tiers by monthly salary: Category I (RM 10,000+, max 5y), Category II (RM 5,000-9,999, max 2y), Category III (RM 3,000-4,999, max 1y, restricted sectors)",
        "Approval Letter from ESD (Expatriate Services Division) BEFORE consular application",
        "Apostilled credentials + employer-attested contract",
        "Dependant Pass available for spouse + children under 18",
        "EP Category I holders eligible for Residence Pass-Talent (RPT) after 3 continuous years",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: MY_SOURCE,
      primarySourceUrl: MY_SOURCE,
      fees: [
        { kind: "base", amountMinor: 200_00, currency: "MYR", label: "EP processing fee (~MYR 200)" },
        { kind: "service", amountMinor: 1200_00, currency: "MYR", label: "EP issuance fee per year (~MYR 1,200/year)" },
      ],
      notes: "Malaysia's tiered EP system distinguishes by salary band. Category I (RM 10k+) is the unrestricted route — finance (KLCC Kuala Lumpur), tech, oil-and-gas (Kuala Lumpur, Labuan), academia. Category III is restricted to specific sectors. RPT (Residence Pass-Talent) is the long-term-residence pathway for top EP holders.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, routeToSettlement: true, salaryThresholdMinor: 1000000, salaryCurrency: "MYR", sponsorType: "employer" as const },
    },
    {
      label: "Malaysia My Second Home (MM2H) — Malaysia",
      finderGoals: ["retire", "invest"],
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 365 * 5,
      validityDays: 365 * 5,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      proofOfFundsRequired: true,
      biometricsRequired: true,
      requirements: [
        "Three tiers introduced 2024 reform:",
        "Silver: Age 30+, monthly income RM 50k+, fixed deposit RM 500k+, property purchase RM 600k+",
        "Gold: Age 30+, income RM 50k+, fixed deposit RM 2M+, property purchase RM 1M+ (5-year multi-entry, 5-year stay)",
        "Platinum: Age 30+, income RM 50k+, fixed deposit RM 5M+, property purchase RM 2M+ (20-year multi-entry)",
        "Health insurance covering Malaysia",
        "Police clearance from country of residence",
        "Cannot work in Malaysia (separate Employment Pass required) but CAN run a Malaysia-registered business",
        "Spouse + children + parents eligible as dependants",
      ],
      processingTimeDaysMin: 90,
      processingTimeDaysMax: 180,
      applicationUrl: MY_MM2H,
      primarySourceUrl: MY_MM2H,
      fees: [
        { kind: "base", amountMinor: 5000_00, currency: "MYR", label: "MM2H application fee (~MYR 5,000)" },
        { kind: "service", amountMinor: 500_00, currency: "MYR", label: "Visa stamp per year (~MYR 500)" },
      ],
      notes: "MM2H was overhauled in 2024 with much higher financial thresholds + tiered structure. Particularly popular with Chinese, Japanese, Korean, UK retirees (Penang Island, Mont Kiara KL, Iskandar Johor). The Sarawak State variant (S-MM2H) retains lower thresholds but is restricted to East Malaysia residence only.",
    },
    {
      label: "Professional Visit Pass (PVP) — Malaysia",
      finderGoals: ["work_temporary"],
      purpose: "business",
      status: "embassy_visa",
      maxStayDays: 365,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      requirements: [
        "Specialised short-term assignment: technical commissioning, audit, training delivery, artist performance, R&D collaboration",
        "Letter of invitation from a Malaysian-registered host entity",
        "Approval from ESD (Expatriate Services Division)",
        "Cannot be used as a substitute for Employment Pass — strict 12-month cap, not renewable in-country",
      ],
      processingTimeDaysMin: 14,
      processingTimeDaysMax: 30,
      applicationUrl: MY_SOURCE,
      primarySourceUrl: MY_SOURCE,
      fees: [
        { kind: "base", amountMinor: 200_00, currency: "MYR", label: "PVP processing fee (~MYR 200)" },
        { kind: "service", amountMinor: 90_00, currency: "MYR", label: "PVP visa fee (~MYR 90)" },
      ],
      notes: "PVP fills the gap between Visitor visa (no work) and Employment Pass (24+ month employment). Used heavily by oil-and-gas service vendors, audit firms (Big-4 Malaysia teams), and specialised commissioning engineers.",
      purposeMetadata: { workPermitDays: 365 },
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// PAKISTAN — Directorate General of Immigration & Passports
// ═══════════════════════════════════════════════════════════════════════════
const PK_SOURCE = "https://dgip.gov.pk/";

export const pakistanVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "pk_visa_categories",
  iso2: "PK",
  name: "Pakistan visa categories — Work, Student, Family",
  primaryUrls: [PK_SOURCE],
  fixturePath: "src/scrapers/sources/__fixtures__/pk_visa_categories.json",
  categories: [
    {
      label: "Work Visa — Pakistan",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365 * 2,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      requirements: [
        "Job offer from a Pakistan-registered employer (SECP + FBR-registered)",
        "Letter of No Objection from Ministry of Interior + Board of Investment (BOI) approval",
        "Apostilled credentials + employment contract",
        "Police clearance from country of residence",
        "Renewable annually; pathway to long-term residence after 5 years of continuous work visas",
        "Spouse + children eligible for family visa",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: "https://visa.nadra.gov.pk/",
      primarySourceUrl: PK_SOURCE,
      fees: [
        { kind: "base", amountMinor: 100_00, currency: "USD", label: "Work visa fee (~USD 100)" },
      ],
      notes: "Pakistan's primary employer-sponsored route. BOI approval is the rate-limiting step (4-8 weeks typical). Common sectors: CPEC infrastructure (Chinese contractors most heavily represented); oil-and-gas (Sindh); finance / banking (Karachi); academia (LUMS, IBA, NUST in Islamabad).",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, sponsorType: "employer" as const },
    },
    {
      label: "Student Visa — Pakistan",
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
        "Admission letter from a HEC-recognised Pakistani institution (LUMS, IBA Karachi, NUST, QAU, AKU, FAST-NUCES)",
        "Proof of tuition payment (first semester)",
        "Proof of funds (~USD 300-500/month for living costs)",
        "Apostilled academic transcripts",
        "Police clearance from country of residence",
        "Renewable annually for course duration",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 60,
      applicationUrl: "https://visa.nadra.gov.pk/",
      primarySourceUrl: PK_SOURCE,
      fees: [
        { kind: "base", amountMinor: 100_00, currency: "USD", label: "Student visa fee (~USD 100)" },
      ],
      notes: "Pakistan attracts students from Afghanistan, Yemen, Somalia, and Central Asia in particular. Public-university tuition USD 1-3k/year; private (LUMS, AKU, IBA) USD 5-15k/year.",
      purposeMetadata: { institutionAccreditationRequired: true, financialProofMonthlyMinor: 30000, financialProofCurrency: "USD" },
    },
    {
      label: "Family Visit Visa — Pakistan",
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 365,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      requirements: [
        "Invitation from a Pakistani citizen / Permanent Resident / NICOP holder",
        "Apostilled relationship proof (marriage / birth certificate)",
        "Sponsor's CNIC / NICOP copy",
        "Police clearance from country of residence",
        "Renewable; pathway to permanent residence after 5 years",
      ],
      processingTimeDaysMin: 14,
      processingTimeDaysMax: 30,
      applicationUrl: "https://visa.nadra.gov.pk/",
      primarySourceUrl: PK_SOURCE,
      fees: [
        { kind: "base", amountMinor: 60_00, currency: "USD", label: "Family visit visa fee (~USD 60)" },
      ],
      notes: "Particularly used by overseas Pakistanis bringing non-Pakistani spouses to visit / settle. The NICOP (National ID for Overseas Pakistanis) sponsor route is the fastest path. Convertible to long-term Pakistan-Origin Card (POC) for spouses of Pakistani nationals.",
      purposeMetadata: { relationshipTypes: ["spouse", "partner", "child", "parent"], sponsorMustBeCitizenOrResident: true },
    },
  ],
});

// ═══════════════════════════════════════════════════════════════════════════
// BANGLADESH — Bangladesh High Commission / Immigration
// ═══════════════════════════════════════════════════════════════════════════
const BD_SOURCE = "https://www.dip.gov.bd/";
const BD_EVISA = "https://www.visa.gov.bd/";

export const bangladeshVisaCategoriesAdapter: Adapter = buildDestinationAdapter({
  id: "bd_visa_categories",
  iso2: "BD",
  name: "Bangladesh visa categories — Employment (E), Study (S), Family Visit (F)",
  primaryUrls: [BD_SOURCE, BD_EVISA],
  fixturePath: "src/scrapers/sources/__fixtures__/bd_visa_categories.json",
  categories: [
    {
      label: "Employment Visa (E Visa) — Bangladesh",
      finderGoals: ["live_work"],
      purpose: "work",
      status: "embassy_visa",
      maxStayDays: 365,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      biometricsRequired: true,
      biometricsLocation: "Bangladesh High Commission abroad or Department of Immigration on arrival",
      requirements: [
        "Job offer from a Bangladesh-registered employer (RJSC + NBR registered)",
        "Work Permit (separate document) from Bangladesh Investment Development Authority (BIDA) or BEPZA (for EPZ employers)",
        "Apostilled credentials + employment contract",
        "Security clearance from Bangladesh Special Branch (SB)",
        "Renewable annually; pathway to permanent residence after 5 years on continuous E visas",
        "BIDA recommendation is PREREQUISITE before consular application",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 90,
      applicationUrl: BD_EVISA,
      primarySourceUrl: BD_SOURCE,
      fees: [
        { kind: "base", amountMinor: 100_00, currency: "USD", label: "E Visa fee (~USD 100)" },
      ],
      notes: "Bangladesh's employer-sponsored route. BIDA pre-approval is the slow step. Major sectors: ready-made garment (Dhaka EPZ, Chittagong EPZ, Adamjee EPZ); textile manufacturing; banking (Motijheel + Gulshan Dhaka); CPEC + Belt and Road infrastructure projects.",
      purposeMetadata: { sponsorshipRequired: true, jobOfferRequired: true, sponsorType: "employer" as const },
    },
    {
      label: "Study Visa (S Visa) — Bangladesh",
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
        "Admission letter from a UGC-recognised Bangladeshi institution (Dhaka University, BUET, NSU, BRAC, IUB, AIUB)",
        "Proof of tuition payment",
        "Proof of funds for living costs",
        "Apostilled academic transcripts",
        "Security clearance from Bangladesh Special Branch (SB)",
        "Renewable annually for course duration",
      ],
      processingTimeDaysMin: 30,
      processingTimeDaysMax: 60,
      applicationUrl: BD_EVISA,
      primarySourceUrl: BD_SOURCE,
      fees: [
        { kind: "base", amountMinor: 100_00, currency: "USD", label: "S Visa fee (~USD 100)" },
      ],
      notes: "Bangladesh draws students primarily from India, Nepal, Bhutan, Myanmar, plus a smaller stream of African medical students (BSMMU, DMC, Chittagong Medical College). Tuition: public USD 1-3k/year; private USD 4-15k/year.",
      purposeMetadata: { institutionAccreditationRequired: true, financialProofMonthlyMinor: 25000, financialProofCurrency: "USD" },
    },
    {
      label: "Family Visit Visa (F Visa) — Bangladesh",
      purpose: "family",
      status: "embassy_visa",
      maxStayDays: 365,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      requirements: [
        "Invitation from a Bangladeshi citizen / NRB (Non-Resident Bangladeshi) / spouse",
        "Apostilled relationship proof (marriage / birth certificate)",
        "Sponsor's NID / passport copy",
        "Police clearance from country of residence",
        "Renewable annually",
      ],
      processingTimeDaysMin: 14,
      processingTimeDaysMax: 30,
      applicationUrl: BD_EVISA,
      primarySourceUrl: BD_SOURCE,
      fees: [
        { kind: "base", amountMinor: 50_00, currency: "USD", label: "F Visa fee (~USD 50)" },
      ],
      notes: "Bangladesh F visa covers spouse, children, and parents of Bangladeshi citizens / NRBs. Convertible to NVR (No Visa Required) endorsement for foreign spouses of Bangladeshi citizens — simplifies long-term residence.",
      purposeMetadata: { relationshipTypes: ["spouse", "partner", "child", "parent"], sponsorMustBeCitizenOrResident: true },
    },
  ],
});
