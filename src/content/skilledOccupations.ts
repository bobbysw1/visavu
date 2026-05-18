/**
 * Skilled occupation lists for the major points-based migration regimes.
 *
 * Why this exists: the chatbot kept returning "I don't have data on
 * Australia's skilled occupation list" when users asked about specific
 * jobs. The visa_options table doesn't store this — it's separate
 * reference data each immigration regime publishes. This file structures
 * it so the synthesis prompt can ground answers in actual occupation
 * codes + visa eligibility.
 *
 * Coverage target: the four main points-based skilled-migration regimes
 * — Australia (CSOL), UK (Skilled Worker), Canada (NOC), New Zealand
 * (Green List). Each entry includes the official-source URL so users
 * can verify the current state before they apply.
 *
 * Refresh: lists are revised annually. The CSOL (AU) was a major 2024
 * reform that replaced the previous MLTSSL/STSOL/ROL. The UK Shortage
 * Occupation List was renamed Immigration Salary List in April 2024.
 * Canada introduced NOC 2021 with TEER categorisation. NZ replaced
 * its LTSSL with the Green List in 2022.
 */

export type SkilledOccupation = {
  /** Localised occupation title (matches the official list). */
  title: string;
  /** Occupation code in the country's reference system
   *  (ANZSCO for AU/NZ, SOC for UK, NOC for CA). */
  code: string;
  /** Which visa programmes the occupation qualifies for. Free-form
   *  short labels matching the country's published categories. */
  visas: string[];
  /** Optional minimum-salary note where the occupation has a specific
   *  threshold above the general baseline. */
  salaryNote?: string;
};

export type OccupationListCountry = {
  iso2: string;
  /** Headline name of the system (e.g. "Core Skills Occupation List"). */
  systemName: string;
  /** Effective date of the current list version. */
  asOf: string;
  /** Plain-English explanation of how the list works in 2-4 sentences. */
  description: string;
  /** The authoritative URL where the live list lives. */
  sourceUrl: string;
  /** Curated subset of the most-common occupations (50-100 per country). */
  occupations: SkilledOccupation[];
};

// ─────────────────────────────────────────────────────────────────────
// AUSTRALIA — Core Skills Occupation List (CSOL), effective Dec 2024
// ─────────────────────────────────────────────────────────────────────
const AU: OccupationListCountry = {
  iso2: "AU",
  systemName: "Core Skills Occupation List (CSOL)",
  asOf: "2024-12-07",
  description:
    "Australia replaced the previous Medium and Long-term Strategic Skills List (MLTSSL), Short-term Skilled Occupation List (STSOL), and Regional Occupation List (ROL) with a unified Core Skills Occupation List (CSOL) on 7 December 2024 as part of the Migration Strategy reform. The CSOL contains 456 occupations eligible for the new Skills in Demand (SID) visa (replacing subclass 482), employer-nominated subclass 186, and selected regional programmes. The Specialist Skills Pathway accepts ALL ANZSCO occupations earning above the AUD$135,000 threshold (no list restriction). The Essential Skills Pathway covers care-economy roles below the standard salary threshold.",
  sourceUrl: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list",
  occupations: [
    // ICT — most-applied-for from India + China + UK + Eastern Europe
    { title: "Software Engineer", code: "261313", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Developer Programmer", code: "261312", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Analyst Programmer", code: "261311", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "ICT Business Analyst", code: "261111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Systems Analyst", code: "261112", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "ICT Project Manager", code: "135112", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Cyber Security Analyst", code: "262112", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Computer Network and Systems Engineer", code: "263111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Database Administrator", code: "262111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Software Tester", code: "261314", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    // Healthcare — chronic shortage, Health and Care Worker discount
    { title: "Registered Nurse (Aged Care)", code: "254412", visas: ["SID (Core Skills)", "Essential Skills Pathway", "Subclass 189", "Subclass 190"], salaryNote: "Below AUD$73,150 floor permitted under Essential Skills Pathway for aged care" },
    { title: "Registered Nurse (Critical Care and Emergency)", code: "254415", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Registered Nurse (Mental Health)", code: "254422", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Registered Nurse (Surgical)", code: "254424", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "General Practitioner", code: "253111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"], salaryNote: "DPA (District of Workforce Shortage) regulation also applies to overseas-trained doctors" },
    { title: "Anaesthetist", code: "253211", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Dentist", code: "252312", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Physiotherapist", code: "252511", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Occupational Therapist", code: "252411", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Pharmacist", code: "251513", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    // Engineering — perennial demand
    { title: "Civil Engineer", code: "233211", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Structural Engineer", code: "233214", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Electrical Engineer", code: "233311", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Mechanical Engineer", code: "233512", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Mining Engineer (excl. Petroleum)", code: "233611", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Petroleum Engineer", code: "233612", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Chemical Engineer", code: "233111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Aeronautical Engineer", code: "233911", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Telecommunications Engineer", code: "263311", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    // Trades — federal + state shortages
    { title: "Electrician (General)", code: "341111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
    { title: "Plumber (General)", code: "334111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
    { title: "Carpenter", code: "331212", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
    { title: "Bricklayer", code: "331111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
    { title: "Motor Mechanic (General)", code: "321211", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
    { title: "Diesel Motor Mechanic", code: "321212", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
    { title: "Sheetmetal Trades Worker", code: "322211", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
    { title: "Welder (First Class)", code: "322313", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
    { title: "Refrigeration and Air Conditioning Mechanic", code: "342111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
    // Education
    { title: "Early Childhood (Pre-primary School) Teacher", code: "241111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Primary School Teacher", code: "241213", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Secondary School Teacher", code: "241411", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Special Needs Teacher", code: "241511", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "University Lecturer", code: "242111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    // Finance / Accounting
    { title: "Accountant (General)", code: "221111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Management Accountant", code: "221112", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "External Auditor", code: "221213", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Financial Investment Adviser", code: "222311", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    // Construction management
    { title: "Construction Project Manager", code: "133111", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Quantity Surveyor", code: "233213", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    // Veterinary / Agriculture
    { title: "Veterinarian", code: "234711", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190"] },
    { title: "Farm Manager", code: "121299", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
    // Hospitality / Cooking
    { title: "Chef", code: "351311", visas: ["SID (Core Skills)", "Subclass 189", "Subclass 190", "Subclass 491"] },
  ],
};

// ─────────────────────────────────────────────────────────────────────
// UNITED KINGDOM — Skilled Worker eligibility + Immigration Salary List
// ─────────────────────────────────────────────────────────────────────
const GB: OccupationListCountry = {
  iso2: "GB",
  systemName: "Skilled Worker eligibility list + Immigration Salary List",
  asOf: "2024-04-04",
  description:
    "The UK's Skilled Worker visa requires the job to appear on the eligibility list (~150 occupations published by the Home Office, SOC 2020 codes) AND meet the salary threshold (£38,700 baseline from April 2024, £23,200 for new entrants or shortage roles on the Immigration Salary List). The Health and Care Worker visa is a parallel route for NHS-related occupations with discounted fees, reduced Immigration Health Surcharge, and lower salary floor (£29,000+). The Immigration Salary List (formerly Shortage Occupation List) lets specific occupations qualify at 80% of the going rate. From April 2024 the going-rate increases were substantial across most occupations.",
  sourceUrl: "https://www.gov.uk/skilled-worker-visa/eligibility",
  occupations: [
    // Health and Care
    { title: "Care Workers and Home Carers", code: "6135", visas: ["Health and Care Worker"], salaryNote: "£23,200 floor (Immigration Salary List); 2024 dependants ban applies" },
    { title: "Senior Care Workers", code: "6134", visas: ["Health and Care Worker", "Skilled Worker"], salaryNote: "£23,200 (ISL); £30,000+ ordinarily" },
    { title: "Nurses (Adult)", code: "2231", visas: ["Health and Care Worker", "Skilled Worker"], salaryNote: "£29,000+ baseline; NHS pay scale recognised" },
    { title: "Nurses (Children's)", code: "2231", visas: ["Health and Care Worker", "Skilled Worker"] },
    { title: "Midwives", code: "2232", visas: ["Health and Care Worker", "Skilled Worker"] },
    { title: "Medical Practitioners (Doctors)", code: "2211", visas: ["Health and Care Worker", "Skilled Worker"] },
    { title: "Dental Practitioners", code: "2215", visas: ["Health and Care Worker", "Skilled Worker"] },
    { title: "Pharmacists", code: "2213", visas: ["Health and Care Worker", "Skilled Worker"] },
    { title: "Physiotherapists", code: "2221", visas: ["Health and Care Worker", "Skilled Worker"] },
    { title: "Occupational Therapists", code: "2222", visas: ["Health and Care Worker", "Skilled Worker"] },
    // ICT — major Indian / Chinese / Eastern European pipeline
    { title: "IT Business Analysts, Architects and Systems Designers", code: "2135", visas: ["Skilled Worker"] },
    { title: "Programmers and Software Development Professionals", code: "2136", visas: ["Skilled Worker"] },
    { title: "IT Project and Programme Managers", code: "2133", visas: ["Skilled Worker"] },
    { title: "Cyber Security Specialists", code: "2139", visas: ["Skilled Worker"] },
    { title: "IT Engineers", code: "2137", visas: ["Skilled Worker"] },
    { title: "Data Scientists", code: "2433", visas: ["Skilled Worker"] },
    // Engineering
    { title: "Civil Engineers", code: "2122", visas: ["Skilled Worker"] },
    { title: "Mechanical Engineers", code: "2121", visas: ["Skilled Worker"] },
    { title: "Electrical Engineers", code: "2123", visas: ["Skilled Worker"] },
    { title: "Production and Process Engineers", code: "2127", visas: ["Skilled Worker"] },
    { title: "Civil Engineering Technicians", code: "3113", visas: ["Skilled Worker"], salaryNote: "On Immigration Salary List — 80% going rate" },
    // Education
    { title: "Secondary Education Teaching Professionals", code: "2314", visas: ["Skilled Worker"] },
    { title: "Primary School Teaching Professionals", code: "2315", visas: ["Skilled Worker"] },
    { title: "Higher Education Teaching Professionals", code: "2311", visas: ["Skilled Worker", "Global Talent"] },
    // Finance / Business
    { title: "Chartered and Certified Accountants", code: "2422", visas: ["Skilled Worker"] },
    { title: "Management Consultants and Business Analysts", code: "2423", visas: ["Skilled Worker"] },
    { title: "Solicitors", code: "2412", visas: ["Skilled Worker"] },
    // Trades / Construction
    { title: "Welding Trades", code: "5215", visas: ["Skilled Worker"], salaryNote: "On Immigration Salary List" },
    { title: "Roofers, Roof Tilers and Slaters", code: "5313", visas: ["Skilled Worker"], salaryNote: "On Immigration Salary List" },
    // Hospitality
    { title: "Chefs", code: "5434", visas: ["Skilled Worker"], salaryNote: "Off ISL since April 2024; baseline £38,700 applies" },
    // Veterinary / Agriculture
    { title: "Veterinarians", code: "2216", visas: ["Skilled Worker"] },
    { title: "Agriculturists and Horticulturists", code: "2114", visas: ["Skilled Worker", "Seasonal Worker"] },
  ],
};

// ─────────────────────────────────────────────────────────────────────
// CANADA — NOC 2021 + Express Entry eligibility
// ─────────────────────────────────────────────────────────────────────
const CA: OccupationListCountry = {
  iso2: "CA",
  systemName: "National Occupational Classification (NOC) 2021 — Express Entry eligibility",
  asOf: "2022-11-16",
  description:
    "Canada uses the NOC 2021 classification with five TEER (Training, Education, Experience, Responsibilities) categories: TEER 0 (management), TEER 1 (university degree), TEER 2 (college diploma / 2+ years training), TEER 3 (trades certification / 6mo+ training), and TEER 4-5 (entry level). Express Entry's Federal Skilled Worker, Canadian Experience Class, and Federal Skilled Trades streams accept TEER 0/1/2/3. The Comprehensive Ranking System scores age, education, language, work experience, plus Provincial Nomination (+600), French proficiency (+50), and other factors. Provincial Nominee Programs (each province runs streams) operate against their own occupation lists.",
  sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers.html",
  occupations: [
    // TEER 0 — Management
    { title: "Computer and Information Systems Managers", code: "20012", visas: ["Express Entry", "PNP"] },
    { title: "Construction Managers", code: "70010", visas: ["Express Entry", "PNP"] },
    { title: "Engineering Managers", code: "20010", visas: ["Express Entry", "PNP"] },
    { title: "Health Services Managers", code: "30010", visas: ["Express Entry", "PNP"] },
    // TEER 1 — Professional / Degree
    { title: "Software Engineers and Designers", code: "21231", visas: ["Express Entry", "PNP", "Global Talent Stream"] },
    { title: "Software Developers and Programmers", code: "21232", visas: ["Express Entry", "PNP", "Global Talent Stream"] },
    { title: "Information Systems Analysts and Consultants", code: "21222", visas: ["Express Entry", "PNP"] },
    { title: "Database Analysts and Data Administrators", code: "21223", visas: ["Express Entry", "PNP"] },
    { title: "Cybersecurity Specialists", code: "21220", visas: ["Express Entry", "PNP", "Global Talent Stream"] },
    { title: "Civil Engineers", code: "21300", visas: ["Express Entry", "PNP"] },
    { title: "Mechanical Engineers", code: "21301", visas: ["Express Entry", "PNP"] },
    { title: "Electrical and Electronics Engineers", code: "21310", visas: ["Express Entry", "PNP"] },
    { title: "Chemical Engineers", code: "21320", visas: ["Express Entry", "PNP"] },
    { title: "Petroleum Engineers", code: "21331", visas: ["Express Entry", "PNP"] },
    { title: "Mining Engineers", code: "21330", visas: ["Express Entry", "PNP"] },
    { title: "Specialist Physicians", code: "31100", visas: ["Express Entry", "PNP"] },
    { title: "General Practitioners and Family Physicians", code: "31102", visas: ["Express Entry", "PNP"] },
    { title: "Registered Nurses and Registered Psychiatric Nurses", code: "31301", visas: ["Express Entry", "PNP"] },
    { title: "Pharmacists", code: "31120", visas: ["Express Entry", "PNP"] },
    { title: "Lawyers", code: "41101", visas: ["Express Entry", "PNP"] },
    { title: "Financial Auditors and Accountants", code: "11100", visas: ["Express Entry", "PNP"] },
    { title: "Secondary School Teachers", code: "41220", visas: ["Express Entry", "PNP"] },
    { title: "Elementary School and Kindergarten Teachers", code: "41221", visas: ["Express Entry", "PNP"] },
    { title: "University Professors and Lecturers", code: "41200", visas: ["Express Entry", "PNP"] },
    // TEER 2 — Technical / Skilled
    { title: "Computer Network and Web Technicians", code: "22220", visas: ["Express Entry", "PNP"] },
    { title: "Construction Estimators", code: "22303", visas: ["Express Entry", "PNP"] },
    { title: "Licensed Practical Nurses", code: "32101", visas: ["Express Entry", "PNP"] },
    { title: "Paramedical Occupations", code: "32102", visas: ["Express Entry", "PNP"] },
    { title: "Industrial Electricians", code: "72201", visas: ["Express Entry", "PNP", "Federal Skilled Trades"] },
    { title: "Plumbers", code: "72300", visas: ["Express Entry", "PNP", "Federal Skilled Trades"] },
    { title: "Steamfitters, Pipefitters and Sprinkler System Installers", code: "72301", visas: ["Express Entry", "PNP", "Federal Skilled Trades"] },
    { title: "Welders and Related Machine Operators", code: "72106", visas: ["Express Entry", "PNP", "Federal Skilled Trades"] },
    { title: "Heavy-Duty Equipment Mechanics", code: "72401", visas: ["Express Entry", "PNP", "Federal Skilled Trades"] },
    { title: "Carpenters", code: "72310", visas: ["Express Entry", "PNP", "Federal Skilled Trades"] },
    // TEER 3 — Trades / Skilled support
    { title: "Cooks", code: "63200", visas: ["Express Entry", "PNP"] },
    { title: "Chefs", code: "62200", visas: ["Express Entry", "PNP"] },
    { title: "Truck Drivers", code: "73300", visas: ["Express Entry", "PNP", "Atlantic Immigration Program"] },
  ],
};

// ─────────────────────────────────────────────────────────────────────
// NEW ZEALAND — Green List (Tier 1 and Tier 2)
// ─────────────────────────────────────────────────────────────────────
const NZ: OccupationListCountry = {
  iso2: "NZ",
  systemName: "Green List (Tier 1 + Tier 2) — Skilled Migrant + Accredited Employer Work Visa",
  asOf: "2024-03-01",
  description:
    "New Zealand's Green List, introduced in 2022 replacing the Long-Term Skill Shortage List, identifies occupations the government wants to actively attract. Tier 1 (Straight to Residence): direct PR pathway on arrival with a recognised offer + meeting role-specific requirements (specialist medical, engineering, ICT, trades). Tier 2 (Work to Residence): 24 months on the Accredited Employer Work Visa followed by direct PR application. The Skilled Migrant Category (SMC) operates separately as a points-based PR route for non-Green-List skilled occupations.",
  sourceUrl: "https://www.immigration.govt.nz/new-zealand-visas/preparing-a-visa-application/working-in-nz/work-visa-options/green-list-occupations",
  occupations: [
    // Tier 1 — Straight to Residence
    { title: "Medical Specialists (Anaesthetist, Cardiologist, etc.)", code: "ANZSCO 2531", visas: ["Green List Tier 1 — Straight to Residence"] },
    { title: "General Practitioner", code: "ANZSCO 253111", visas: ["Green List Tier 1 — Straight to Residence"] },
    { title: "Construction Project Manager", code: "ANZSCO 133111", visas: ["Green List Tier 1 — Straight to Residence"] },
    { title: "Civil Engineer", code: "ANZSCO 233211", visas: ["Green List Tier 1 — Straight to Residence"] },
    { title: "Electrical Engineer", code: "ANZSCO 233311", visas: ["Green List Tier 1 — Straight to Residence"] },
    { title: "Mechanical Engineer", code: "ANZSCO 233512", visas: ["Green List Tier 1 — Straight to Residence"] },
    { title: "Software Engineer", code: "ANZSCO 261313", visas: ["Green List Tier 1 — Straight to Residence"] },
    { title: "ICT Security Specialist", code: "ANZSCO 262112", visas: ["Green List Tier 1 — Straight to Residence"] },
    { title: "Secondary School Teacher", code: "ANZSCO 241411", visas: ["Green List Tier 1 — Straight to Residence"] },
    { title: "Surveyor", code: "ANZSCO 232212", visas: ["Green List Tier 1 — Straight to Residence"] },
    // Tier 2 — Work to Residence (24 months)
    { title: "Registered Nurse (multiple specialties)", code: "ANZSCO 254", visas: ["Green List Tier 2 — Work to Residence"] },
    { title: "Midwife", code: "ANZSCO 254111", visas: ["Green List Tier 2 — Work to Residence"] },
    { title: "Carpenter", code: "ANZSCO 331212", visas: ["Green List Tier 2 — Work to Residence"] },
    { title: "Electrician", code: "ANZSCO 341111", visas: ["Green List Tier 2 — Work to Residence"] },
    { title: "Plumber", code: "ANZSCO 334111", visas: ["Green List Tier 2 — Work to Residence"] },
    { title: "Diesel Motor Mechanic", code: "ANZSCO 321212", visas: ["Green List Tier 2 — Work to Residence"] },
    { title: "Welder", code: "ANZSCO 322313", visas: ["Green List Tier 2 — Work to Residence"] },
    { title: "Primary School Teacher", code: "ANZSCO 241213", visas: ["Green List Tier 2 — Work to Residence"] },
    { title: "Early Childhood Teacher", code: "ANZSCO 241111", visas: ["Green List Tier 2 — Work to Residence"] },
    { title: "Aged or Disabled Carer", code: "ANZSCO 423111", visas: ["Green List Tier 2 — Work to Residence"] },
  ],
};

export const OCCUPATION_LISTS: Record<string, OccupationListCountry> = {
  AU,
  GB,
  CA,
  NZ,
};

/** Lookup helper — undefined when the destination doesn't have a curated list. */
export function occupationListFor(iso2: string): OccupationListCountry | undefined {
  return OCCUPATION_LISTS[iso2.toUpperCase()];
}

/**
 * Search an occupation across all lists. Returns matches sorted by
 * relevance (exact title match > partial title > code match). Used by
 * the chat API to surface specific occupation eligibility when the user
 * asks about a job title.
 */
export function searchOccupations(query: string, limit = 8): Array<{
  country: OccupationListCountry;
  occupation: SkilledOccupation;
}> {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return [];
  const results: Array<{ country: OccupationListCountry; occupation: SkilledOccupation; score: number }> = [];
  for (const country of Object.values(OCCUPATION_LISTS)) {
    for (const occ of country.occupations) {
      const titleLower = occ.title.toLowerCase();
      let score = 0;
      if (titleLower === q) score = 100;
      else if (titleLower.startsWith(q)) score = 70;
      else if (titleLower.includes(q)) score = 40;
      else if (occ.code.toLowerCase().includes(q)) score = 20;
      else continue;
      results.push({ country, occupation: occ, score });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Format the country's list as a text block the chat synthesis prompt
 * can ground on. ~500-1000 tokens per country.
 */
export function formatOccupationListForChat(country: OccupationListCountry): string {
  const lines = [
    `${country.systemName} (${country.iso2}) — as of ${country.asOf}`,
    "",
    country.description,
    "",
    `Source: ${country.sourceUrl}`,
    "",
    "Curated occupations:",
  ];
  for (const occ of country.occupations) {
    const salary = occ.salaryNote ? ` — ${occ.salaryNote}` : "";
    lines.push(`  • ${occ.title} (${occ.code}) → ${occ.visas.join(", ")}${salary}`);
  }
  return lines.join("\n");
}
