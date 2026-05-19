/**
 * Business-visa total-coverage adapter.
 *
 * Two distinct families:
 *
 *  A. SHORT-TERM BUSINESS VISITS (meetings, negotiations, conferences,
 *     procurement, inspections). Typically 30–180 day stays, no work
 *     permitted in the host country's labour market.
 *
 *  B. BUSINESS ESTABLISHMENT / SELF-EMPLOYED (founders setting up a
 *     company, freelancers servicing local clients, treaty investors).
 *     1–5 year stays with renewal, leading to permanent residence.
 *
 *  Programs covered (24):
 *     SHORT-TERM:
 *       US B-1 Visitor for Business
 *       UK Standard Visitor (Business activities)
 *       Schengen Type-C Business
 *       CN M Business Visa
 *       CN F Exchange / Visit Visa
 *       RU Business Visa
 *       IN e-Business Visa
 *       SA Saudi Business Visit Visa
 *       AE Business Visit / Mission Visa (90 days)
 *       JP Short-term Business Visa (J-tan)
 *       KR C-3 Short-term Business
 *       SG Business Visit eVisa
 *       BR VITEM II Business Visa
 *       MX FMM with business activities
 *
 *     ESTABLISHMENT / SELF-EMPLOYED:
 *       DE \xa721 Self-Employed (Freiberufler / Gewerbe)
 *       FR Passeport Talent Innovative Project
 *       ES Startup Law (Ley de Emprendedores)
 *       IT Self-Employment Visa (Lavoro Autonomo)
 *       PT D2 Startup / Entrepreneur Visa
 *       EE Estonia Startup Visa
 *       NL Self-employed Residence (Entrepreneur Permit)
 *       IL Innovation / Tech Visa
 *       AU Subclass 188 Business Innovation & Investment
 *       AE Investor / Entrepreneur Residence Visa
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { COUNTRY_LIST } from "@/lib/countries";

const ALL = COUNTRY_LIST.map((c) => c.iso2);

type BusinessVisa = {
  iso2: string;
  label: string;
  purpose: "business" | "work";
  status: "embassy_visa" | "e_visa" | "visa_free";
  applicationUrl: string;
  primarySourceUrl: string;
  feeMinor: number;
  feeCurrency: string;
  processingDaysMin: number;
  processingDaysMax: number;
  maxStayDays: number;
  validityDays: number;
  requirements: string[];
  notes: string;
  /** If present, this visa is restricted to these passport ISO codes. */
  restrictedTo?: Set<string>;
};

// ──────────────────────────────────────────────────────────────────────
// SHORT-TERM BUSINESS VISITORS
// ──────────────────────────────────────────────────────────────────────
const SHORT_TERM: BusinessVisa[] = [
  {
    iso2: "US",
    label: "B-1 Visitor for Business — United States",
    purpose: "business",
    status: "embassy_visa",
    applicationUrl: "https://travel.state.gov/content/travel/en/us-visas/business.html",
    primarySourceUrl: "https://travel.state.gov/content/travel/en/us-visas/business.html",
    feeMinor: 18500,
    feeCurrency: "USD",
    processingDaysMin: 14,
    processingDaysMax: 90,
    maxStayDays: 180,
    validityDays: 3650,
    requirements: [
      "Permitted activities: consult with business associates, attend conferences / conventions, settle an estate, negotiate a contract, participate in short-term training (unpaid)",
      "PROHIBITED: gainful employment in the US labour market, performance for paying audiences, paid speaking engagements",
      "Form DS-160 + interview at US embassy / consulate",
      "Strong ties to home country (no immigrant intent)",
      "Sponsoring company letter detailing purpose and duration of visit",
      "Often issued as a combined B-1/B-2 (Business + Tourism) — same fee, broader use",
      "Visa Waiver Program (ESTA) nationals don't need B-1 for short business visits ≤ 90 days",
    ],
    notes: "B-1 holders can NOT receive a US salary. Compensation from your home-country employer is fine; honoraria from US institutions are tightly restricted (academic 9/5/6 rule). Misuse triggers permanent INA 212(a)(6)(C)(i) bars.",
  },
  {
    iso2: "GB",
    label: "Standard Visitor — Business Activities (UK)",
    purpose: "business",
    status: "embassy_visa",
    applicationUrl: "https://www.gov.uk/standard-visitor",
    primarySourceUrl: "https://www.gov.uk/standard-visitor/business-or-academic",
    feeMinor: 12700,
    feeCurrency: "GBP",
    processingDaysMin: 14,
    processingDaysMax: 56,
    maxStayDays: 180,
    validityDays: 3650,
    requirements: [
      "Permitted: attend meetings / interviews / conferences, sign contracts, conduct site visits, attend trade fairs, deliver up to 30 days of work-shadowing or training",
      "PROHIBITED: take employment with a UK company, work for a UK client even remotely, fill a permanent role",
      "Apply online at gov.uk/standard-visitor",
      "Most nationalities now use the UK ETA for short-stay business visits up to 6 months (separate, cheaper £10 process); Standard Visitor remains for nationalities requiring a visa or visits exceeding ETA limits",
      "Sponsorship / invitation letter from UK contact useful but not always required",
      "Permitted Paid Engagement variant allows experts invited by a UK organisation to be paid for specific work up to 1 month",
    ],
    notes: "The 2024 ETA rollout simplifies short business visits for many nationalities — non-visa-required passport holders now get up to 6 months via the £10 ETA instead of the Standard Visitor. Visa-required nationals still go through the full Standard Visitor process.",
  },
  {
    iso2: "FR",
    label: "Schengen Type-C Business Visa (Schengen Area, including France)",
    purpose: "business",
    status: "embassy_visa",
    applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/business",
    primarySourceUrl: "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy_en",
    feeMinor: 9000,
    feeCurrency: "EUR",
    processingDaysMin: 15,
    processingDaysMax: 60,
    maxStayDays: 90,
    validityDays: 180,
    requirements: [
      "90 days within any 180-day period in the Schengen Area",
      "Invitation letter from a host company in the Schengen state of main destination",
      "Hotel bookings or accommodation address",
      "Travel medical insurance with at least €30,000 cover, valid in all Schengen states",
      "Return / onward flight booking",
      "Proof of financial means (~€65/day)",
      "Apply at the consulate of the Schengen state where you'll spend the most days, OR the first one you'll enter if duration is equal",
      "Permitted: meetings, negotiations, exhibitions, conferences. Prohibited: paid local employment",
    ],
    notes: "Same C-visa form for tourism and business across all Schengen states. The actual issuing consulate depends on your main destination. Same 90/180 rule.",
  },
  {
    iso2: "CN",
    label: "M Visa — Commercial / Trade Activities (China)",
    purpose: "business",
    status: "embassy_visa",
    applicationUrl: "https://bio.visaforchina.cn/",
    primarySourceUrl: "https://english.www.gov.cn/services/visasandimmigration/",
    feeMinor: 14000,
    feeCurrency: "USD",
    processingDaysMin: 7,
    processingDaysMax: 30,
    maxStayDays: 60,
    validityDays: 3650,
    requirements: [
      "Invitation letter from a Chinese trade partner OR a Visa Notification Letter from the Chinese Foreign Affairs Office",
      "Permitted: trade fairs, factory visits, supplier negotiations, contract signing, business-related conferences",
      "Multi-entry options issued routinely (30 / 60 / 90 day stays, 6-month to 10-year validity)",
      "China 144-hour Transit Without Visa applies for some short business trips through major hubs (Beijing, Shanghai, Guangzhou)",
      "Apply at the Chinese Visa Application Centre (CVASC) — fingerprints typically required",
      "PROHIBITED: working for a Chinese employer, performing onsite work paid by a Chinese entity",
    ],
    notes: "China resumed broader visa-free transit and increased the visa-free entry list to 38+ countries in 2024-2025 (Switzerland, Ireland, Hungary, Australia, NZ etc. for short visits up to 15-30 days). M Visa remains the standard for visa-required nationalities and longer stays.",
  },
  {
    iso2: "CN",
    label: "F Visa — Exchange, Study Visits, Lectures (China)",
    purpose: "business",
    status: "embassy_visa",
    applicationUrl: "https://bio.visaforchina.cn/",
    primarySourceUrl: "https://english.www.gov.cn/services/visasandimmigration/",
    feeMinor: 14000,
    feeCurrency: "USD",
    processingDaysMin: 7,
    processingDaysMax: 30,
    maxStayDays: 180,
    validityDays: 3650,
    requirements: [
      "For non-commercial visits: academic exchanges, scientific cooperation, cultural exchanges, short-term lectures and seminars",
      "Invitation from a Chinese institution (university, research institute, ministry) authorised to invite F-visa visitors",
      "Often confused with M (commercial) — choose F if your activity is academic / scientific / cultural, M for trade",
      "Stays up to 180 days per entry possible",
      "PROHIBITED: working for a Chinese employer, performing trade activities",
    ],
    notes: "Pre-2013 the F covered both commercial and exchange visits; since then commercial activities moved to M. Researchers and lecturers on short visits use F; salespeople and traders use M.",
  },
  {
    iso2: "RU",
    label: "Business Visa — Russia",
    purpose: "business",
    status: "embassy_visa",
    applicationUrl: "https://visa.kdmid.ru/",
    primarySourceUrl: "https://www.mid.ru/en/",
    feeMinor: 18000,
    feeCurrency: "USD",
    processingDaysMin: 10,
    processingDaysMax: 30,
    maxStayDays: 90,
    validityDays: 1095,
    requirements: [
      "Official Russian invitation (Telex / GUVM) issued by an authorised host organisation in Russia",
      "Process: company applies for the invitation at GUVM (formerly UFMS), receives an official document, then you apply at the Russian consulate using its reference number",
      "Single, double, or multi-entry options",
      "Multi-entry 3-year business visa available for certain nationalities under bilateral agreements",
      "Russian visa application form completed online at visa.kdmid.ru",
      "Migration card on entry; registration at hotel or local FMS within 7 working days",
      "PROHIBITED: paid employment in Russia",
    ],
    notes: "Sanctions-era complications: many Western nationalities face significantly longer processing times (60-90+ days) and tighter scrutiny since 2022. Some Russian consulates in Europe have closed. Check current diplomatic status before applying.",
  },
  {
    iso2: "IN",
    label: "e-Business Visa — India",
    purpose: "business",
    status: "e_visa",
    applicationUrl: "https://indianvisaonline.gov.in/evisa/",
    primarySourceUrl: "https://indianvisaonline.gov.in/",
    feeMinor: 10000,
    feeCurrency: "USD",
    processingDaysMin: 3,
    processingDaysMax: 7,
    maxStayDays: 180,
    validityDays: 365,
    requirements: [
      "Available online to 165+ eligible nationalities at indianvisaonline.gov.in",
      "Permitted: meetings to set up industrial / business venture, sale or purchase, recruiting manpower, attending conferences, joining as employee delegate of foreign enterprise for site visits",
      "Multi-entry, 1-year validity, max 180 days per stay",
      "Apply 4-30 days before travel",
      "Print eVisa approval letter; entry at designated airports/ports (most major)",
      "Biometric capture on arrival at the immigration counter",
      "PROHIBITED: full-time employment in India — that requires an Employment Visa",
    ],
    notes: "India's eVisa system is one of the world's broadest for business — 165 nationalities including all major economies. The 1-year multi-entry option lets sales teams visit India repeatedly without renewing each trip.",
  },
  {
    iso2: "SA",
    label: "Business Visit Visa — Saudi Arabia",
    purpose: "business",
    status: "e_visa",
    applicationUrl: "https://visa.mofa.gov.sa/",
    primarySourceUrl: "https://www.mofa.gov.sa/en/",
    feeMinor: 33000,
    feeCurrency: "USD",
    processingDaysMin: 3,
    processingDaysMax: 14,
    maxStayDays: 180,
    validityDays: 365,
    requirements: [
      "Sponsoring Saudi company invitation — applies through Ministry of Foreign Affairs",
      "Saudi-side invitation generates a Visa Application Reference Number — you then apply at the Saudi embassy / VFS",
      "Multi-entry available with 1-year validity, up to 180 days per stay typical",
      "Permitted: meetings with Saudi business partners, attending conferences, site visits, contract negotiations",
      "Single-entry e-Visa available for tourism but business activities require the business visa",
      "Health insurance recommended; required for tourist e-Visa",
      "Permitted Paid Engagement varies — generally requires separate Iqama (work permit) for paid work",
    ],
    notes: "Saudi Arabia's 2019 tourist eVisa scheme is separate from business — business activities should use the proper Business Visit Visa to avoid violations. Vision 2030 has driven significant streamlining for international business travel.",
  },
  {
    iso2: "AE",
    label: "Business / Mission Visa (90 days) — UAE",
    purpose: "business",
    status: "e_visa",
    applicationUrl: "https://smartservices.icp.gov.ae/",
    primarySourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/business-visa",
    feeMinor: 60000,
    feeCurrency: "AED",
    processingDaysMin: 2,
    processingDaysMax: 7,
    maxStayDays: 90,
    validityDays: 60,
    requirements: [
      "Sponsorship by a UAE-registered company (the sponsoring entity applies through ICP / GDRFA)",
      "Permitted: business meetings, contract negotiations, supplier visits, conferences, site inspections",
      "Mission Visa subtype: 90-day single-entry for project-based short assignments",
      "Multi-entry options available for repeat business visitors",
      "Health insurance with UAE coverage",
      "Cannot work in the UAE labour market — requires Employment Visa for paid local employment",
    ],
    notes: "Most visa-required nationalities (Indians, Pakistanis, Chinese etc.) need the formal Business Visa. Many other nationalities get visa-on-arrival or eVisa that covers business activities, making the formal Business Visa optional.",
  },
  {
    iso2: "JP",
    label: "Short-term Business Visa — Japan",
    purpose: "business",
    status: "embassy_visa",
    applicationUrl: "https://www.mofa.go.jp/j_info/visit/visa/short/business.html",
    primarySourceUrl: "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    // JPY has no subunit (minorFactor=1). Short-term business visa to
    // Japan is ¥3,000 single-entry per MOFA schedule. Prior value
    // 300000 = ¥300,000 (~$2,000 USD) was the same minor-factor confusion
    // that bit jp_ssw / jp_special_visas / total_coverage_asia.
    feeMinor: 3000,
    feeCurrency: "JPY",
    processingDaysMin: 5,
    processingDaysMax: 14,
    maxStayDays: 90,
    validityDays: 90,
    requirements: [
      "Invitation letter from a Japanese host company / institution",
      "Itinerary of activities in Japan (sample meetings, business contacts)",
      "Schedule of stay",
      "Permitted: business meetings, negotiations, market research, contract signing, after-sales service",
      "Japan has 70+ visa-waiver agreements — many nationalities (US, UK, EU, AU, NZ, KR, SG etc.) don't need this for short business visits ≤ 90 days",
      "Multiple-entry 1-3-5 year variants available for repeat visitors",
      "Cannot perform paid work in Japan — requires Engineer / Specialist or other work visa",
    ],
    notes: "For visa-waiver nationalities, business activities are permitted on landing under the same 90-day temporary-visitor framework. The formal business visa is for visa-required nationalities (India, China, Russia, most of Africa & SE Asia).",
  },
  {
    iso2: "KR",
    label: "C-3 Short-term General / Business Visa — South Korea",
    purpose: "business",
    status: "embassy_visa",
    applicationUrl: "https://www.visa.go.kr/",
    primarySourceUrl: "https://overseas.mofa.go.kr/eng/index.do",
    feeMinor: 4000,
    feeCurrency: "USD",
    processingDaysMin: 5,
    processingDaysMax: 14,
    maxStayDays: 90,
    validityDays: 90,
    requirements: [
      "Invitation from a Korean host company (Korean BRN — Business Registration Number — required)",
      "Permitted: market research, business meetings, conferences, training, attending exhibitions",
      "Multiple sub-variants: C-3-1 (general short-term), C-3-4 (general business), C-3-9 (multiple short-term general)",
      "K-ETA (Korea Electronic Travel Authorisation) covers short business visits for most visa-waiver nationalities — much simpler than a formal C-3",
      "Multi-entry 1-3-5 year C-3 issued routinely for repeat business visitors",
      "Cannot perform employment in Korea — requires E-7 Specially Designated Activities or similar",
    ],
    notes: "Korea announced K-ETA exemption (no K-ETA needed) for 22 countries through end-2025 — short business visits from these nationalities just enter directly. Check current K-ETA status before applying for C-3.",
  },
  {
    iso2: "SG",
    label: "Business Visit eVisa — Singapore",
    purpose: "business",
    status: "e_visa",
    applicationUrl: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements",
    primarySourceUrl: "https://www.ica.gov.sg/",
    feeMinor: 3000,
    feeCurrency: "SGD",
    processingDaysMin: 3,
    processingDaysMax: 7,
    maxStayDays: 90,
    validityDays: 90,
    requirements: [
      "Singapore is visa-FREE for most nationalities for short business visits (up to 30-90 days per nationality)",
      "Visa-required nationalities (Assessment Level I + II countries): apply for eVisa through the ICA system",
      "Local sponsor (Singapore citizen, PR, or registered company) required for visa-required nationals",
      "Permitted: meetings, conferences, negotiations, training, attending business events",
      "Multi-entry 1-2 year options for frequent visitors",
      "Singapore Trade & Industry Pass available for senior executives of approved companies",
      "Cannot perform paid work — requires Employment Pass / S Pass / Work Permit",
    ],
    notes: "Singapore's 'business friendly' brand is real — visa-free entry covers most major economies for short business. Only Assessment Level I countries (Afghanistan, Bangladesh, Iran, India, Pakistan, Myanmar, etc.) consistently need formal eVisa for short visits.",
  },
  {
    iso2: "BR",
    label: "VITEM II — Business Visa — Brazil",
    purpose: "business",
    status: "embassy_visa",
    applicationUrl: "https://www.gov.br/mre/en/consular-portal/visas",
    primarySourceUrl: "https://www.gov.br/mre/en/consular-portal/visas/business-visa-vitem-ii",
    feeMinor: 8000,
    feeCurrency: "USD",
    processingDaysMin: 14,
    processingDaysMax: 30,
    maxStayDays: 90,
    validityDays: 1825,
    requirements: [
      "Invitation letter from a Brazilian company (with notarised signature and BR tax ID — CNPJ)",
      "Permitted: business meetings, prospecting, audits, market visits, conferences, training",
      "Multi-entry visa with up to 5-year validity (longer for some nationalities under reciprocity)",
      "Reciprocity-fee dependent — US, Canadian, Australian nationals saw visas reintroduced in 2024-2025",
      "Up to 90 days per entry, extendable inside Brazil for another 90 days (max 180 days/year)",
      "Cannot perform paid work — requires VITEM V Employment Visa for paid local work",
    ],
    notes: "Brazil's visa reciprocity policy is a moving target — US/CA/AU citizens regained visa-required status in 2024-2025 after a brief unilateral waiver. EU citizens remain visa-free for 90 days.",
  },
  {
    iso2: "MX",
    label: "FMM with Business Activities — Mexico",
    purpose: "business",
    status: "visa_free",
    applicationUrl: "https://www.gob.mx/inm",
    primarySourceUrl: "https://www.gob.mx/inm",
    feeMinor: 0,
    feeCurrency: "USD",
    processingDaysMin: 1,
    processingDaysMax: 1,
    maxStayDays: 180,
    validityDays: 180,
    requirements: [
      "Most nationalities enter on the FMM (Forma Migratoria Múltiple) — completed at arrival, formerly a paper card, now digital at SAE.inm.gob.mx",
      "Tick the 'Business / negotiations' box on the FMM",
      "Permitted: meetings, conferences, investment exploration, contract signing, supplier visits, technical assistance not paid by a Mexican entity",
      "Up to 180 days per visit",
      "Visa-required nationalities (India, China, Russia, most of Africa) need Visa Negocios at the Mexican consulate before travel",
      "PROHIBITED: paid work for a Mexican employer — requires Temporary Resident with work authorisation",
    ],
    notes: "Mexico's FMM is the world's simplest business-entry — most major-economy nationalities get 180 days on the same form that tourists use. The digital FMM at SAE has replaced the paper card at airports since 2022.",
  },
];

// ──────────────────────────────────────────────────────────────────────
// BUSINESS ESTABLISHMENT / SELF-EMPLOYED
// ──────────────────────────────────────────────────────────────────────
const ESTABLISHMENT: BusinessVisa[] = [
  {
    iso2: "DE",
    label: "§21 Self-Employed Residence Permit — Germany",
    purpose: "work",
    status: "embassy_visa",
    applicationUrl: "https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Migrationsformen/Selbststaendige/selbststaendige-node.html",
    primarySourceUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/self-employed",
    feeMinor: 11000,
    feeCurrency: "EUR",
    processingDaysMin: 30,
    processingDaysMax: 120,
    maxStayDays: 1095,
    validityDays: 1095,
    requirements: [
      "Two routes: §21(1) Freiberufler (liberal-profession freelancer — doctors, lawyers, journalists, artists, designers, IT consultants) OR §21(5) Selbstständige Gewerbe (commercial / trade business)",
      "Detailed business plan demonstrating economic viability and regional benefit",
      "Proof of personal capital / financing (no fixed minimum but typically €30,000+ recommended)",
      "Endorsement from the regional Chamber of Commerce (IHK) for Gewerbe applicants",
      "Professional qualifications evidence (degree, portfolio, client letters, prior earnings)",
      "Adequate health insurance covering Germany",
      "Apply at the German embassy or consulate in your country of residence first; convert to residence at local Ausländerbehörde",
      "Path to permanent residence (Niederlassungserlaubnis) after 3 years if business is profitable",
    ],
    notes: "Germany's freelancer-friendly Freiberufler route is the easiest path — software developers, designers, journalists, language teachers all qualify. Berlin and Munich have the most freelancer-friendly Ausländerbehörden; smaller cities can be slower.",
  },
  {
    iso2: "FR",
    label: "Passeport Talent — Innovative Project — France",
    purpose: "work",
    status: "embassy_visa",
    applicationUrl: "https://france-visas.gouv.fr/en/web/france-visas/talent-passport",
    primarySourceUrl: "https://france-visas.gouv.fr/en/web/france-visas/talent-passport",
    feeMinor: 26900,
    feeCurrency: "EUR",
    processingDaysMin: 14,
    processingDaysMax: 60,
    maxStayDays: 1460,
    validityDays: 1460,
    requirements: [
      "Innovative project recognised by a French public body (the project must contribute to French economic development)",
      "Endorsement obtained through 'reconnaissance d'innovation' procedure at the Ministry of Economy",
      "Financial means equivalent to 1× minimum wage (~€1,800/month after tax)",
      "Business plan in French",
      "4-year residence permit issued at first grant",
      "French Tech ecosystem partnership routes available (incubator endorsement)",
      "Cannot take general employment outside the project but can hire staff",
      "Path to permanent residence after 5 years of residence; French citizenship after the same",
    ],
    notes: "Part of the broader Passeport Talent family (10+ subcategories). The Innovative Project route is the founder visa. French Tech Visa programme (~150 partner accelerators / incubators) gives a fast-track endorsement.",
  },
  {
    iso2: "ES",
    label: "Startup Law Entrepreneur Visa — Spain",
    purpose: "work",
    status: "embassy_visa",
    applicationUrl: "https://www.exteriores.gob.es/es/Paginas/index.aspx",
    primarySourceUrl: "https://www.empresas.sepe.es/",
    feeMinor: 8000,
    feeCurrency: "EUR",
    processingDaysMin: 20,
    processingDaysMax: 45,
    maxStayDays: 1095,
    validityDays: 1095,
    requirements: [
      "Innovative business project endorsed by ENISA (Spanish public innovation agency)",
      "Project must demonstrate 'innovative entrepreneurial character of special economic interest'",
      "Business plan submitted in Spanish",
      "Proof of personal financial means (~€2,400/month — 200% of IPREM, plus 100% per family member)",
      "Private health insurance covering Spain",
      "3-year residence with 2-year renewal then permanent residence",
      "Beckham-Law-style flat 24% tax option on Spanish-sourced income for first 5 years (Startup Law 2022)",
      "Family included (spouse + minor children) on same application",
    ],
    notes: "Spain's Startup Law 28/2022 modernised the entrepreneur route — ENISA endorsement is the key approval (typically 2-3 weeks). Pairs with the Digital Nomad Visa for founders building remotely while spending time in Spain.",
  },
  {
    iso2: "IT",
    label: "Self-Employment Visa (Lavoro Autonomo) — Italy",
    purpose: "work",
    status: "embassy_visa",
    applicationUrl: "https://vistoperitalia.esteri.it/home/en",
    primarySourceUrl: "https://www.esteri.it/en/servizi-consolari-e-visti/italian-visas/lavoro-autonomo/",
    feeMinor: 11600,
    feeCurrency: "EUR",
    processingDaysMin: 30,
    processingDaysMax: 120,
    maxStayDays: 1825,
    validityDays: 730,
    requirements: [
      "Limited annual quota under the Decreto Flussi (~500 self-employed slots/year)",
      "Three sub-categories: company directors, freelancers in professions on a national list, registered freelance professionals",
      "Nulla Osta (authorisation) from Italian Chamber of Commerce or competent body before visa application",
      "Detailed business plan with viability evidence",
      "Annual income of at least €8,500 (€9,300 / year of stay) provable",
      "Apostilled qualifications with sworn Italian translations",
      "Convert visa to Permesso di Soggiorno at the Questura within 8 days of arrival",
      "Path to Italian permanent residence (Carta di Soggiorno) after 5 years",
    ],
    notes: "Italy's self-employment visa is heavily quota-restricted under the Decreto Flussi system — the limiting factor is the annual cap, not eligibility. The Italy Startup Visa programme (separate from Lavoro Autonomo) is endorsement-driven and outside the cap.",
  },
  {
    iso2: "PT",
    label: "D2 Startup / Entrepreneur Residence Visa — Portugal",
    purpose: "work",
    status: "embassy_visa",
    applicationUrl: "https://vistos.mne.gov.pt/en/",
    primarySourceUrl: "https://www.startupportugal.com/",
    feeMinor: 9000,
    feeCurrency: "EUR",
    processingDaysMin: 60,
    processingDaysMax: 120,
    maxStayDays: 1825,
    validityDays: 365,
    requirements: [
      "Two routes: D2 Entrepreneur (general — existing or planned Portuguese business) OR Startup Visa (endorsed by an IAPMEI-certified incubator)",
      "Proof of capital invested in or available for the business (no statutory minimum but typically €5,000+)",
      "Detailed business plan demonstrating market viability",
      "Portuguese tax number (NIF) and bank account",
      "Health insurance valid in Portugal",
      "Apostilled criminal-record check",
      "Convert visa to Residence Permit at AIMA within 4 months of arrival",
      "Path to permanent residence (5 years) and Portuguese citizenship (also 5 years, A2 Portuguese required)",
    ],
    notes: "Portugal's Startup Visa is the streamlined path — IAPMEI-certified incubators (Beta-i, Portugal Ventures, etc.) endorse innovative projects and dramatically speed processing. D2 covers everyone else, including service businesses and freelance consultants.",
  },
  {
    iso2: "EE",
    label: "Estonia Startup Visa — Estonia",
    purpose: "work",
    status: "embassy_visa",
    applicationUrl: "https://startupestonia.ee/visa",
    primarySourceUrl: "https://startupestonia.ee/visa",
    feeMinor: 16000,
    feeCurrency: "EUR",
    processingDaysMin: 7,
    processingDaysMax: 30,
    maxStayDays: 1825,
    validityDays: 365,
    requirements: [
      "Submit your startup to the Startup Estonia committee for innovation assessment (10 day decision)",
      "Eligibility: business is scalable, innovative, technology-driven, exportable",
      "If approved, apply for the visa at an Estonian embassy or directly for an Estonian residence permit",
      "5-year stay (renewable), full work / business rights",
      "Spouse + children eligible for residence",
      "e-Residency programme is SEPARATE — provides digital business administration only, no physical right to live in Estonia",
      "Path to permanent residence after 5 years; Estonian citizenship after 8",
    ],
    notes: "Estonia is the most digitally-streamlined Schengen entrepreneur route — most of the process is online. The Estonia e-Residency programme (~€100, online) gives digital business administration but NOT residence rights; the Startup Visa is what gets you physically.",
  },
  {
    iso2: "NL",
    label: "Self-Employed Residence Permit — Netherlands",
    purpose: "work",
    status: "embassy_visa",
    applicationUrl: "https://ind.nl/en/residence-permits/work/self-employed",
    primarySourceUrl: "https://ind.nl/en/residence-permits/work/self-employed",
    feeMinor: 138000,
    feeCurrency: "EUR",
    processingDaysMin: 60,
    processingDaysMax: 90,
    maxStayDays: 1825,
    validityDays: 730,
    requirements: [
      "Score at least 90 points across three categories: personal experience (education, work experience, history of entrepreneurship), business plan (organisation, marketing, financing), added value to the Netherlands (innovation, jobs created, investment)",
      "Distinct from DAFT — that's a treaty-based route for US nationals only with no points test",
      "Business registered at the KvK (Chamber of Commerce)",
      "Sufficient financial means (€1,400/month after personal expenses for 12 months typical)",
      "Income from the business or other sources covering living costs",
      "Spouse + children eligible for dependants permit (spouse can work freely)",
    ],
    notes: "The points-based test rewards founders with strong track records — first-time entrepreneurs often struggle to hit 90 points. US nationals should use DAFT instead (much simpler, no points test, €4,500 deposit only).",
  },
  {
    iso2: "IL",
    label: "Innovation Visa / Tech Visa — Israel",
    purpose: "work",
    status: "embassy_visa",
    applicationUrl: "https://www.gov.il/en/departments/topics/innovation-visa/govil-landing-page",
    primarySourceUrl: "https://innovationisrael.org.il/en",
    feeMinor: 23500,
    feeCurrency: "USD",
    processingDaysMin: 14,
    processingDaysMax: 60,
    maxStayDays: 1095,
    validityDays: 1095,
    requirements: [
      "Apply for the Innovation Visa Programme (administered by the Israel Innovation Authority)",
      "Eligibility: technology entrepreneur or specialist looking to establish / scale a tech business in Israel",
      "Sponsorship from an Israel Innovation Authority–approved 'landing pad' incubator (~30 partners across Tel Aviv / Jerusalem / Haifa / Be'er Sheva)",
      "B-5 visa initially (24 months), with option to extend by 12 months while progressing the business",
      "Path to Expert Worker B-1 if hired by an Israeli tech company OR Olim under Law of Return if Jewish",
      "Innovation Authority grants and matching funds available for approved projects",
    ],
    notes: "Israel's Innovation Visa launched 2022 to attract foreign tech founders to scale in the Tel Aviv ecosystem. Easier than going through the regular Expert Worker route. Note: spouses of Israeli citizens have a much faster route under the Citizenship Law.",
  },
  {
    iso2: "AU",
    label: "Subclass 188 — Business Innovation & Investment (Provisional)",
    purpose: "work",
    status: "embassy_visa",
    applicationUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/business-innovation-and-investment-188",
    primarySourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/business-innovation-and-investment-188",
    feeMinor: 947000,
    feeCurrency: "AUD",
    processingDaysMin: 540,
    processingDaysMax: 1095,
    maxStayDays: 1825,
    validityDays: 1825,
    requirements: [
      "State or territory government nomination required FIRST (each state has its own assessment + caps)",
      "Five streams: 188A Business Innovation (own + manage a business with AUD$1.25M+ turnover); 188B Investor (AUD$2.5M+ investment); 188C Significant Investor (AUD$5M); 188D Premium Investor (AUD$15M); 188E Entrepreneur (innovation funding ≥ AUD$200k)",
      "188A: at least AUD$1.25M business + personal assets; min 65 points; under 55",
      "188B: AUD$2.5M in qualifying investments held for 4 years; min 65 points; under 55",
      "188C: AUD$5M Australian-state investment (proportions: 20%+ venture capital, 30%+ emerging companies, balance in 'balancing' assets)",
      "Path to Permanent Residence: Subclass 888 (after 2-4 years on 188 and meeting stream-specific conditions)",
    ],
    notes: "Australia overhauled this programme — closed 188A and 188C streams to new applicants in 2024 pending reform; 188B and 188E remain. State nominations are oversubscribed. Programme is being replaced by a 'Talent and Innovation Visa' announced 2024.",
  },
  {
    iso2: "AE",
    label: "Investor / Entrepreneur Residence Visa — UAE",
    purpose: "work",
    status: "embassy_visa",
    applicationUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas",
    primarySourceUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas",
    feeMinor: 590000,
    feeCurrency: "AED",
    processingDaysMin: 14,
    processingDaysMax: 60,
    maxStayDays: 730,
    validityDays: 730,
    requirements: [
      "Two pathways: Standard Investor Visa (own a UAE LLC / Free Zone company, 2-3 year stay) OR Long-Term Entrepreneur Visa (5-year, with track record of a project valued AED 500k+ or approved by an accredited business incubator)",
      "Free Zone routes (DMCC, DIFC, ADGM, IFZA, etc.) often easiest — set up the company and obtain residence as a shareholder or manager",
      "Capital deposit / share capital requirement varies by Free Zone (typically AED 10,000-300,000)",
      "Medical fitness test + Emirates ID enrolment on arrival",
      "Family-sponsorship rights (spouse + children) once your own visa is issued",
      "Zero personal income tax, zero capital gains tax",
      "Path to UAE Golden Visa for established entrepreneurs (project AED 500k+ approved by Innovation Centres)",
    ],
    notes: "Free Zone routes (DMCC, IFZA, RAK ICC etc.) make UAE one of the world's easiest founder visas — set up the company online in 2-4 weeks, obtain Investor Visa as shareholder. UAE's Golden Visa is the long-term graduation: 10 years for accomplished entrepreneurs.",
  },
];

export const totalCoverageBusinessAdapter: Adapter = {
  metadata: {
    id: "total_coverage_business",
    name: "Total coverage — business visas (24 programmes: 14 short-term visits + 10 establishment / self-employed routes)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [...SHORT_TERM, ...ESTABLISHMENT].map((v) => v.primarySourceUrl),
    fixturePath: "src/scrapers/sources/__fixtures__/total_coverage_business.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "total_coverage_business" }), fetchUrl: "manual://total_coverage_business" };
  },

  async parse() {
    const records: ParsedRecord[] = [];

    for (const passport of ALL) {
      for (const v of [...SHORT_TERM, ...ESTABLISHMENT]) {
        if (passport === v.iso2) continue;
        if (v.restrictedTo && !v.restrictedTo.has(passport)) continue;

        records.push({
          passportIso2: passport,
          destinationIso2: v.iso2,
          purpose: v.purpose,
          status: v.status,
          label: v.label,
          maxStayDays: v.maxStayDays,
          validityDays: v.validityDays,
          entriesAllowed: "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: v.status === "visa_free" || v.purpose === "business",
          proofOfFundsRequired: true,
          proofOfAccommodationRequired: false,
          biometricsRequired: v.status === "embassy_visa",
          biometricsLocation: v.status === "embassy_visa" ? "Destination consulate / Visa Application Centre" : undefined,
          requirements: v.requirements,
          processingTimeDaysMin: v.processingDaysMin,
          processingTimeDaysMax: v.processingDaysMax,
          applicationUrl: v.applicationUrl,
          primarySourceUrl: v.primarySourceUrl,
          fees: v.feeMinor > 0
            ? [{ kind: "base", amountMinor: v.feeMinor, currency: v.feeCurrency, asOf: "2026-05-11", label: "Visa application fee", optional: false }]
            : [],
          notes: v.notes,
        });
      }
    }

    return { records };
  },
};
