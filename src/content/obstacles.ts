/**
 * Curated obstacles / advisories knowledge file.
 *
 * Bridges the gap between "the official policy" and "what actually happens".
 * Captures sanctions regimes, reciprocity disputes, active-conflict effects
 * on visa processing, and other real-world frictions that don't fit cleanly
 * into the structured visa_options schema but are crucial for users.
 *
 * Each obstacle is keyed by either:
 *   - a passport ISO2 (applies to all destinations from that origin)
 *   - a destination ISO2 (applies to anyone going there)
 *   - a (passport, destination) pair (applies only to that route)
 *
 * Severity drives the visual weight on the result page:
 *   - "info"     : neutral context (helpful but not a blocker)
 *   - "caution"  : significant friction (longer processing, extra docs, scrutiny)
 *   - "critical" : route is effectively closed or has major risk
 *
 * Edit this file as policy changes. `updatedAt` lets the UI flag advisories
 * older than a year for review.
 */
export type ObstacleSeverity = "info" | "caution" | "critical";

export type Obstacle = {
  id: string;
  severity: ObstacleSeverity;
  title: string;
  body: string;
  appliesTo:
    | { kind: "passport"; iso: string }
    | { kind: "destination"; iso: string }
    | { kind: "pair"; passport: string; destination: string };
  references: { label: string; url: string }[];
  updatedAt: string; // ISO date
};

export const OBSTACLES: Obstacle[] = [
  // -----------------------------------------------------------------------
  // Passport-level (applies to anyone holding this passport)
  // -----------------------------------------------------------------------
  {
    id: "ru-eu-sanctions",
    severity: "caution",
    title: "Russian passport: heightened scrutiny across EU/Schengen and allied states",
    body:
      "Following Russia's invasion of Ukraine, the EU suspended its Visa Facilitation Agreement with Russia in September 2022. Russian Schengen visa applications are subject to longer processing, lower approval rates, additional documentation requirements, and member-state-specific restrictions (Czechia, Poland, the Baltic states, and Finland have largely halted tourist-visa issuance). UK, US, Canada, Australia, Japan, and South Korea apply heightened scrutiny but continue routine processing. Several EU member states have also rejected Russian-issued international passports for entry where another nationality is available.",
    appliesTo: { kind: "passport", iso: "RU" },
    references: [
      { label: "EU Council decision (Sept 2022)", url: "https://www.consilium.europa.eu/en/press/press-releases/2022/09/09/visa-facilitation-with-russia-council-adopts-decision-to-fully-suspend-the-eu-russia-visa-facilitation-agreement/" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "ir-sanctions",
    severity: "critical",
    title: "Iranian passport: most Western and many regional destinations require visas with extensive scrutiny",
    body:
      "US, UK, Canada, Australia, the Schengen Area, Israel, and Saudi Arabia (since 2016) require embassy visas with case-by-case review. The US generally restricts Iranian-passport holders under Executive Order 13769 successor frameworks. Visa rejection rates are higher than baseline; allow 60+ days for processing.",
    appliesTo: { kind: "passport", iso: "IR" },
    references: [
      { label: "US State Department: Iran-specific guidance", url: "https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Iran.html" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "kp-sanctions",
    severity: "critical",
    title: "DPRK / North Korean passport: widely refused entry",
    body:
      "Most countries refuse North Korean passport holders or admit them only on diplomatic / official passports under bilateral arrangements. UN sanctions limit travel for designated individuals. Practical migration outside DPRK is extremely restricted.",
    appliesTo: { kind: "passport", iso: "KP" },
    references: [
      { label: "UN Security Council sanctions on DPRK", url: "https://main.un.org/securitycouncil/en/sanctions/1718" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "sy-passport",
    severity: "caution",
    title: "Syrian passport: visa-required for most destinations, longer processing",
    body:
      "Most countries require embassy-issued visas for Syrian nationals, with longer processing and additional documentation (UNHCR registration where applicable, sponsor letters, additional security review). Several visa-on-arrival schemes that previously included Syria have been suspended.",
    appliesTo: { kind: "passport", iso: "SY" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "by-passport",
    severity: "caution",
    title: "Belarusian passport: heightened scrutiny across EU, UK, US, Canada, Australia",
    body:
      "Following the 2020 election crisis and Belarus's role in Russia's 2022 invasion of Ukraine, EU and allied states apply heightened scrutiny to Belarusian visa applications. Many EU consulates have reduced operations or suspended tourist visa issuance entirely. Lithuania, Latvia and Poland have implemented additional restrictions.",
    appliesTo: { kind: "passport", iso: "BY" },
    references: [
      { label: "EU Council — Belarus measures", url: "https://www.consilium.europa.eu/en/policies/sanctions-against-belarus/" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "mm-passport",
    severity: "caution",
    title: "Myanmar passport: post-coup restrictions on consular services + Western scrutiny",
    body:
      "Following the February 2021 military coup, Myanmar passport renewals have been disrupted; many international missions have raised the bar for visa applications. The US, EU, UK, Canada, and Australia apply targeted sanctions to coup leaders but routine visa processing for ordinary Myanmar nationals continues with longer scrutiny windows.",
    appliesTo: { kind: "passport", iso: "MM" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "ve-passport",
    severity: "caution",
    title: "Venezuelan passport: passport availability + targeted sanctions",
    body:
      "Issuing and renewing Venezuelan passports has been operationally constrained since 2017, with extended waits and high fees. The US, EU, UK and Canada apply targeted sanctions to certain Venezuelan officials but ordinary nationals can apply for routine visas. Spain, Argentina, Mexico, Chile, Uruguay and Colombia operate streamlined regularization programmes for Venezuelan migrants.",
    appliesTo: { kind: "passport", iso: "VE" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "er-passport",
    severity: "caution",
    title: "Eritrean passport: limited consular network + UK/EU scrutiny",
    body:
      "Eritrea's small consular network and the country's diaspora-tax policies create practical hurdles for Eritrean passport renewal. Most Western countries process Eritrean visa applications routinely but require additional documentation around military-service status. Sweden, the UK and Germany have historically been the largest issuers of Eritrean asylum / family-reunification permits.",
    appliesTo: { kind: "passport", iso: "ER" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "sd-passport",
    severity: "caution",
    title: "Sudanese passport: passport renewal disrupted by ongoing conflict",
    body:
      "The April 2023 conflict has disrupted Sudan's passport-issuing infrastructure. Sudanese nationals abroad face long renewal waits; Sudanese embassies in some host states have suspended services. UN agencies offer emergency travel documents in some cases. Most Western foreign-affairs ministries continue routine visa processing but with documentation flexibility for displaced applicants.",
    appliesTo: { kind: "passport", iso: "SD" },
    references: [
      { label: "UNHCR — Sudan emergency", url: "https://www.unhcr.org/emergencies/sudan-emergency" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "af-passport",
    severity: "caution",
    title: "Afghan passport: heightened security review across most Western and many regional destinations",
    body:
      "Following the 2021 Taliban takeover, Afghan-passport holders face heightened scrutiny on most visa applications. Many countries process Afghan applications through extended security review (60–180 days). Several countries operate humanitarian / displacement schemes that bypass the standard visa route. Spain, Germany, Canada, the US and Australia run dedicated post-2021 humanitarian programmes alongside ordinary visas.",
    appliesTo: { kind: "passport", iso: "AF" },
    references: [
      { label: "UNHCR — Afghanistan situation", url: "https://www.unhcr.org/afghanistan-emergency.html" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "pk-passport",
    severity: "caution",
    title: "Pakistani passport: refusal-rate sensitive across Schengen, UK, Canada, Australia",
    body:
      "Pakistani applicants face above-baseline refusal rates for visit visas in most major destinations (typically 30–60%). Robust documentation makes a meaningful difference: bank statements showing 6+ months of consistent income, employer letter, prior international travel, detailed itinerary, hotel bookings, and travel insurance.",
    appliesTo: { kind: "passport", iso: "PK" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "iq-passport",
    severity: "caution",
    title: "Iraqi passport: heightened scrutiny + limited consular network",
    body:
      "Most Western and regional destinations process Iraqi applications through extended security review. Several Iraqi consulates have operational constraints; travelers may need to apply through an Iraqi consulate in a third country. Visa-on-arrival schemes that historically included Iraq have largely been suspended.",
    appliesTo: { kind: "passport", iso: "IQ" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "ye-passport",
    severity: "caution",
    title: "Yemeni passport: passport renewal disrupted; widespread heightened review",
    body:
      "The active conflict in Yemen has disrupted passport-issuance infrastructure. Yemeni nationals abroad face long renewal waits. Most Western destinations process applications through extended security review. UN agencies provide emergency travel documents in some cases.",
    appliesTo: { kind: "passport", iso: "YE" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "so-passport",
    severity: "caution",
    title: "Somali passport: heightened scrutiny + limited international recognition",
    body:
      "Several countries do not officially recognise the Somali passport for visa purposes; UNHCR / Convention Travel Documents are widely used as alternatives. Where the Somali passport is accepted, applications are subject to extended security review.",
    appliesTo: { kind: "passport", iso: "SO" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "ly-passport",
    severity: "caution",
    title: "Libyan passport: limited consular operations + heightened scrutiny",
    body:
      "Ongoing political instability has limited Libyan consular operations abroad. Most Western and regional destinations apply heightened review and longer processing for Libyan applicants.",
    appliesTo: { kind: "passport", iso: "LY" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "cu-passport",
    severity: "caution",
    title: "Cuban passport: dual-system + targeted US sanctions",
    body:
      "Cuban nationals require visas for most destinations except a limited list of bilateral-agreement countries (Russia, Serbia, Belarus, several Latin American states). The US has tightened B-1/B-2 issuance to Cuban nationals since 2019; processing for routine US visa cases now requires consular interview at a third-country post (Guyana). The EU continues routine processing.",
    appliesTo: { kind: "passport", iso: "CU" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "bd-us-bvisa",
    severity: "info",
    title: "Bangladeshi passport → US: B-visa interviews subject to longer waits",
    body:
      "US B-1/B-2 visa interview waits at the Dhaka embassy have historically been 6–12 months. Many applicants travel to a third country (India, Sri Lanka) for shorter waits. Required documentation is the same; refusal rates are higher than baseline OECD origins (typically 20–35% for first-time applicants).",
    appliesTo: { kind: "pair", passport: "BD", destination: "US" },
    references: [],
    updatedAt: "2026-05-10",
  },

  // -----------------------------------------------------------------------
  // Destination-level (applies regardless of passport)
  // -----------------------------------------------------------------------
  {
    id: "sd-conflict",
    severity: "critical",
    title: "Sudan: active armed conflict — most embassies and missions are closed",
    body:
      "Sudan has been in armed conflict since April 2023. Khartoum's airports remain closed; many embassies have suspended visa services or relocated to neighbouring countries. Travel is strongly advised against by most foreign ministries (US, UK, FCDO, Smartraveller AU all at the highest advisory tier). Visa policy on paper may not reflect operational reality.",
    appliesTo: { kind: "destination", iso: "SD" },
    references: [
      { label: "UK FCDO travel advice — Sudan", url: "https://www.gov.uk/foreign-travel-advice/sudan" },
      { label: "US State Department — Sudan", url: "https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Sudan.html" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "af-conflict",
    severity: "critical",
    title: "Afghanistan: visa services widely suspended",
    body:
      "Following the 2021 Taliban takeover, most foreign embassies in Kabul ceased operations. Foreign-affairs ministries advise against all travel. The Taliban-administered immigration authority issues entry permits but few countries officially recognise these documents. Foreign-affairs missions of Afghanistan abroad are largely non-operational.",
    appliesTo: { kind: "destination", iso: "AF" },
    references: [
      { label: "UK FCDO travel advice — Afghanistan", url: "https://www.gov.uk/foreign-travel-advice/afghanistan" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "ye-conflict",
    severity: "critical",
    title: "Yemen: active conflict — visa services largely suspended",
    body:
      "Yemen has been in active conflict since 2015. Most embassies have closed or relocated. Airspace and ports are subject to ongoing disruption. Most foreign-affairs ministries advise against all travel.",
    appliesTo: { kind: "destination", iso: "YE" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "uk-immigration-rules-2024",
    severity: "info",
    title: "UK: tightened salary thresholds and family-visa income rules",
    body:
      "From April 2024, the Skilled Worker general salary threshold rose to £38,700 and the Family visa minimum income requirement is rising in stages towards £38,700. Effective dates and grandfathering rules apply — read the destination's primary source for your specific application year.",
    appliesTo: { kind: "destination", iso: "GB" },
    references: [
      { label: "gov.uk — Statement of Changes in Immigration Rules HC 590 (March 2024)", url: "https://www.gov.uk/government/collections/immigration-rules-statement-of-changes" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "il-route",
    severity: "caution",
    title: "Israel: complex re-entry rules; Israeli stamp may affect onward travel to several countries",
    body:
      "Several countries (notably Iran, Iraq, Lebanon, Syria, Yemen, Libya, Saudi Arabia in some cases) refuse entry to passports showing an Israeli stamp. Travelers commonly request a separate entry slip rather than a stamp. Israeli citizens cannot enter most of the listed countries. Recent regional tensions have changed some rules; check current FCDO/State Department advisories.",
    appliesTo: { kind: "destination", iso: "IL" },
    references: [],
    updatedAt: "2026-05-10",
  },

  // -----------------------------------------------------------------------
  // Specific (passport, destination) pairs
  // -----------------------------------------------------------------------
  {
    id: "in-us-h1b-cap",
    severity: "info",
    title: "Indian passport → US H-1B: cap-subject lottery",
    body:
      "Indian nationals are the largest single recipient cohort of H-1B visas but face the longest green-card backlog (currently 50+ years for EB-2/EB-3 employment-based green-card priority dates). H-1B itself is annually capped (65,000 + 20,000 master's exemption) with a March lottery; selection rates have been around 25–30% in recent years.",
    appliesTo: { kind: "pair", passport: "IN", destination: "US" },
    references: [
      { label: "USCIS visa bulletin", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "cn-us-tightening",
    severity: "caution",
    title: "Chinese passport → US: F-1, J-1 and H-1B in sensitive STEM fields face elevated scrutiny",
    body:
      "Under Presidential Proclamation 10043 and successor frameworks, Chinese nationals applying for F/J/H-1B visas in fields linked to PLA-affiliated 'entities of concern' may be denied or have visas revoked. Tourist (B-1/B-2) processing remains routine but interview waivers are limited.",
    appliesTo: { kind: "pair", passport: "CN", destination: "US" },
    references: [
      { label: "Presidential Proclamation 10043 (May 2020)", url: "https://www.federalregister.gov/documents/2020/06/04/2020-12217/suspension-of-entry-as-nonimmigrants-of-certain-students-and-researchers-from-the-peoples-republic" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "ng-uk-visit",
    severity: "info",
    title: "Nigerian passport → UK Standard Visitor: high refusal rate vs OECD baseline",
    body:
      "UK Visit visa refusal rates for Nigerian applicants have historically been 30–50% (versus 10–20% global OECD baseline). Common refusal grounds: insufficient financial documentation, weak ties to Nigeria, prior travel-history gaps. Detailed sponsorship letters, salary evidence, and prior international travel materially improve outcomes.",
    appliesTo: { kind: "pair", passport: "NG", destination: "GB" },
    references: [
      { label: "UK Home Office: visit visa refusal statistics", url: "https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-december-2023" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "pk-eu-visit",
    severity: "info",
    title: "Pakistani passport → Schengen: refusal rates vary widely by member state",
    body:
      "Schengen visa refusal rates for Pakistani applicants vary by issuing member state — historically 30–60% across France, Germany, Italy, and Spain. Best practice: apply through the embassy of the country you'll spend the most time in; ensure complete documentation including bank statements, employment letter, travel insurance, and detailed itinerary.",
    appliesTo: { kind: "pair", passport: "PK", destination: "DE" }, // sample; applies broadly across Schengen
    references: [
      { label: "EU visa statistics dashboard", url: "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy/short-stay-visas-issued-schengen-countries_en" },
    ],
    updatedAt: "2026-05-10",
  },

  // -----------------------------------------------------------------------
  // Expansion (P23): sanctioned + high-refusal corridors + crackdown
  // jurisdictions + post-2022 effects + US-specific patterns.
  // -----------------------------------------------------------------------

  // --- Additional passport-level entries ---
  {
    id: "ng-us-bvisa",
    severity: "caution",
    title: "Nigerian passport → US: long interview waits, elevated 214(b) refusals",
    body:
      "B-1/B-2 visa interview waits at the Lagos and Abuja US embassies have historically been 6–18 months, with first-time-applicant refusal rates of 30–55% under Section 214(b) (insufficient ties to home country). Best-practice documentation includes long-term employment proof, prior international travel history, fixed-asset evidence, and a detailed travel itinerary with onward bookings.",
    appliesTo: { kind: "pair", passport: "NG", destination: "US" },
    references: [
      { label: "travel.state.gov US visa wait times", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/wait-times.html" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "in-us-221g",
    severity: "info",
    title: "Indian passport → US: H-1B / L-1 administrative processing under 221(g)",
    body:
      "Indian nationals applying for H-1B and L-1 visas at Indian US consulates increasingly face Section 221(g) administrative processing — a non-refusal hold pending additional review. Typical resolution: 30–120 days, sometimes longer for cap-subject H-1B in sensitive industries. Plan international travel timelines with at least 6 weeks of buffer.",
    appliesTo: { kind: "pair", passport: "IN", destination: "US" },
    references: [
      { label: "USCIS H-1B information", url: "https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "bd-schengen",
    severity: "caution",
    title: "Bangladeshi passport → Schengen: above-baseline refusal rates",
    body:
      "Schengen visa refusal rates for Bangladeshi applicants run 35–60% across most member states. Common refusal grounds: insufficient financial documentation, weak ties to Bangladesh, and unclear travel purpose. Detailed sponsorship letters, prior international travel history, and complete hotel/itinerary documentation materially improve outcomes.",
    appliesTo: { kind: "passport", iso: "BD" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "ng-schengen",
    severity: "caution",
    title: "Nigerian passport → Schengen: high refusal corridor",
    body:
      "Schengen visa refusal rates for Nigerian applicants are among the highest globally — typically 45–55% across the most-requested member states (France, Germany, Italy, Spain). Strong documentation (12+ months of consistent bank activity, employer letter, fixed-asset evidence, prior international travel) substantially improves outcomes.",
    appliesTo: { kind: "passport", iso: "NG" },
    references: [
      { label: "EU visa statistics dashboard", url: "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy/short-stay-visas-issued-schengen-countries_en" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "pk-us-bvisa",
    severity: "caution",
    title: "Pakistani passport → US: extended security review",
    body:
      "Pakistani applicants for US visas frequently undergo extended security advisory opinions (SAO) lasting 60–180 days. Routine B-1/B-2 cases are processed but interview waits in Islamabad have historically been 8–14 months. Refusal rates under 214(b) for first-time applicants are typically 30–50%.",
    appliesTo: { kind: "pair", passport: "PK", destination: "US" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "ir-anywhere",
    severity: "critical",
    title: "Iranian passport: most Western and many regional destinations require visas with extensive scrutiny",
    body:
      "Iranian applicants for the US, UK, Canada, Australia, Schengen, Israel, and Saudi Arabia face embassy applications with case-by-case security review. US Executive Order 13769 successor frameworks restrict most Iranian categories. Allow 60–180 days for processing; refusal rates are above the regional baseline.",
    appliesTo: { kind: "passport", iso: "IR" },
    references: [],
    updatedAt: "2026-05-10",
  },

  // --- Additional destination-level entries ---
  {
    id: "ae-journalists",
    severity: "caution",
    title: "UAE: journalists, activists, and security-research professionals face elevated entry scrutiny",
    body:
      "UAE authorities have at various times denied entry, detained, or deported journalists, human-rights workers, and academic researchers studying regional security topics. Public social-media posts critical of the UAE government or rulers can trigger questioning at entry. Travelers in these categories should consult the IPI or CPJ travel advisories before booking.",
    appliesTo: { kind: "destination", iso: "AE" },
    references: [
      { label: "Committee to Protect Journalists — UAE", url: "https://cpj.org/asia/uae/" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "cn-hk-passports",
    severity: "info",
    title: "Mainland China: HK SAR passport holders use Home Return Permit, not the SAR passport",
    body:
      "Hong Kong SAR passport holders cannot enter mainland China on the SAR passport — entry requires a Home Return Permit (Mainland Travel Permit for Hong Kong and Macau Residents) issued by the Chinese authorities. Foreign nationals also holding HK permanent residency travel to the mainland on their foreign passport with the standard China visa.",
    appliesTo: { kind: "destination", iso: "CN" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "ru-allied-passports",
    severity: "critical",
    title: "Russia: most Western foreign-affairs ministries advise against all non-essential travel",
    body:
      "Foreign ministries of the US, UK, Canada, Australia, and most EU states advise against non-essential travel to Russia. Heightened risk of arbitrary detention has been noted by the US State Department and others. Commercial flight options are limited; consular assistance is constrained.",
    appliesTo: { kind: "destination", iso: "RU" },
    references: [
      { label: "US State Department — Russia advisory", url: "https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/RussianFederation.html" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "ua-conflict",
    severity: "critical",
    title: "Ukraine: active armed conflict — most foreign ministries advise against all travel",
    body:
      "Ukraine has been in active armed conflict since the February 2022 Russian invasion. Foreign ministries of the US, UK, EU, Canada, Australia, and most others maintain Level-4 (do not travel) advisories. Airspace is closed; consular services are limited.",
    appliesTo: { kind: "destination", iso: "UA" },
    references: [
      { label: "UK FCDO travel advice — Ukraine", url: "https://www.gov.uk/foreign-travel-advice/ukraine" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "by-conflict-adjacent",
    severity: "critical",
    title: "Belarus: heightened risk of detention; UK, US, EU advise against all travel",
    body:
      "Most Western foreign ministries advise against all travel to Belarus following the 2020 political crisis and its role in Russia's 2022 invasion of Ukraine. Heightened risk of arbitrary detention, especially for dual nationals and individuals with public political views.",
    appliesTo: { kind: "destination", iso: "BY" },
    references: [
      { label: "UK FCDO travel advice — Belarus", url: "https://www.gov.uk/foreign-travel-advice/belarus" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "mm-conflict",
    severity: "critical",
    title: "Myanmar: civil conflict — most foreign ministries advise against all travel",
    body:
      "Myanmar has been in active civil conflict since the February 2021 military coup. Most Western foreign ministries maintain Level-4 advisories. Air access to many regions is restricted; consular services are limited.",
    appliesTo: { kind: "destination", iso: "MM" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "ht-conflict",
    severity: "critical",
    title: "Haiti: gang-related violence — most foreign ministries advise against all travel",
    body:
      "Haiti has experienced sustained gang-related violence; Port-au-Prince airport operations have been disrupted at multiple points in 2024–2025. The US, UK, Canada, and EU advise against all travel. Consular services are constrained.",
    appliesTo: { kind: "destination", iso: "HT" },
    references: [
      { label: "US State Department — Haiti", url: "https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Haiti.html" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "ly-conflict",
    severity: "critical",
    title: "Libya: ongoing political instability and intermittent conflict",
    body:
      "Libya remains politically divided with periodic outbreaks of armed conflict. Most foreign ministries advise against all travel. Visa-on-arrival systems that previously existed are not operational; entry requires advance arrangement with a domestic sponsor.",
    appliesTo: { kind: "destination", iso: "LY" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "ni-conditions",
    severity: "caution",
    title: "Nicaragua: political risk for journalists and opposition-linked travellers",
    body:
      "Nicaraguan authorities have at various times denied entry to journalists, opposition figures, and individuals critical of the Ortega government. Routine tourism continues but travellers with public political profiles should consult current FCDO/State Department advisories.",
    appliesTo: { kind: "destination", iso: "NI" },
    references: [],
    updatedAt: "2026-05-10",
  },

  // --- Additional pair-level entries ---
  {
    id: "uk-eu-citizens-90180",
    severity: "info",
    title: "UK citizens → Schengen: 90-day-in-180 limit + EES biometric checks",
    body:
      "Since Brexit, UK citizens travel to the Schengen Area under the visitor-only 90/180 rule with no automatic right of residence. The EU Entry/Exit System (EES) launches in late 2025, recording every Schengen entry and exit biometrically and automating overstay flagging. ETIAS authorisation rolls out in late 2026 — small fee, three-year validity.",
    appliesTo: { kind: "pair", passport: "GB", destination: "FR" },
    references: [
      { label: "EU EES — official", url: "https://travel-europe.europa.eu/ees_en" },
      { label: "EU ETIAS — official", url: "https://travel-europe.europa.eu/etias_en" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "cn-au-stem",
    severity: "info",
    title: "Chinese passport → Australia: longer security review for STEM postgrad",
    body:
      "Chinese applicants for Australian Subclass 500 student and Subclass 482 work visas in sensitive STEM categories (AI/ML, advanced materials, quantum, aerospace) face longer external-checks processing — typically 4–8 months for postgraduate applications under the Defence Trade Controls regime.",
    appliesTo: { kind: "pair", passport: "CN", destination: "AU" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "ir-anywhere-tourist",
    severity: "caution",
    title: "Iranian passport → most destinations: extended security review",
    body:
      "Iranian applicants for tourist and business visas in most Western destinations face extended security review (Security Advisory Opinion in the US; equivalent processes in UK, Canada, Australia, Schengen). Allow 60–180 days. Refusal rates are above the regional baseline.",
    appliesTo: { kind: "pair", passport: "IR", destination: "US" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "il-icc-states",
    severity: "info",
    title: "Israeli officials → ICC member states: arrest-warrant context",
    body:
      "Following the November 2024 ICC arrest warrants for senior Israeli officials, certain ICC-member-state jurisdictions have publicly stated they would execute the warrants if relevant individuals entered. This applies to specific named individuals only — ordinary Israeli passport holders are unaffected. Check current FCDO/State Department guidance if travelling on a government-related role.",
    appliesTo: { kind: "destination", iso: "IL" },
    references: [
      { label: "ICC — situation in Palestine", url: "https://www.icc-cpi.int/situations/palestine" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "in-canada-bilateral",
    severity: "info",
    title: "Indian passport → Canada: visa processing recovery after 2023–2024 strain",
    body:
      "Canada-India diplomatic relations strained in late 2023, leading to reduced consular staffing at Indian missions. Visa processing recovered through 2024–2025; current Visitor Visa and Study Permit processing times for Indian applicants are roughly in line with pre-2023 baselines (8–16 weeks), but check current IRCC processing-time tools before applying.",
    appliesTo: { kind: "pair", passport: "IN", destination: "CA" },
    references: [
      { label: "IRCC processing times", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-processing-times.html" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "tr-eu-visit",
    severity: "info",
    title: "Turkish passport → Schengen: documentation-heavy applications",
    body:
      "Schengen visa applications from Turkish nationals have historically been documentation-heavy and slow. Approval rates vary by member state (highest at Italy, Spain, Greece; lower at Germany and Belgium). Best practice: apply 6–8 weeks ahead, submit complete employment and financial documentation, and book refundable travel.",
    appliesTo: { kind: "passport", iso: "TR" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "ru-icc-states",
    severity: "caution",
    title: "Russian officials → ICC member states: arrest-warrant context",
    body:
      "Following the March 2023 ICC arrest warrant for President Putin, certain ICC member states have stated they would execute the warrant. Applies to specific named individuals only — ordinary Russian passport holders are unaffected. Government-affiliated travellers should consult current advisories.",
    appliesTo: { kind: "destination", iso: "RU" },
    references: [
      { label: "ICC arrest warrants — Russia situation", url: "https://www.icc-cpi.int/situations/ukraine" },
    ],
    updatedAt: "2026-05-10",
  },

  // --- US-specific patterns surfaced as destination-level context ---
  {
    id: "us-section-214b",
    severity: "info",
    title: "United States: Section 214(b) presumption of immigrant intent for B-class applicants",
    body:
      "All B-1/B-2 visitor visa applicants must overcome the Section 214(b) statutory presumption that they intend to immigrate. Refusal under 214(b) is not a permanent bar — applicants may reapply after material change in circumstances. Documentation of strong ties to home country (employment, property, family, prior compliant travel) materially affects outcomes. Refusal rates vary widely by posting and nationality.",
    appliesTo: { kind: "destination", iso: "US" },
    references: [
      { label: "travel.state.gov — Visa Denials", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-denials.html" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "us-section-221g",
    severity: "info",
    title: "United States: Section 221(g) administrative processing holds",
    body:
      "Section 221(g) is a non-refusal hold pending additional administrative review — common for STEM postgrad, security-sensitive employment, and certain nationalities. Typical resolution: 30–180 days. Applicants are typically advised to wait without further action unless specifically requested for documents.",
    appliesTo: { kind: "destination", iso: "US" },
    references: [],
    updatedAt: "2026-05-10",
  },
  {
    id: "us-grace-periods",
    severity: "info",
    title: "United States: 60-day grace period on most employment-based statuses",
    body:
      "H-1B, L-1, O-1, and most other employment-based nonimmigrant statuses include a 60-day grace period following employment termination, during which the worker can change status, find a new employer, or depart. Plan transitions inside this window to maintain status.",
    appliesTo: { kind: "destination", iso: "US" },
    references: [
      { label: "USCIS — Options for Nonimmigrant Workers Following Termination", url: "https://www.uscis.gov/newsroom/news-releases/uscis-clarifies-options-for-nonimmigrant-workers-following-termination-of-employment" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "schengen-ees-2025",
    severity: "info",
    title: "Schengen Area: Entry/Exit System (EES) launches late 2025",
    body:
      "The EU Entry/Exit System (EES) replaces manual passport stamps with biometric registration at all Schengen external borders from late 2025. Every entry and exit by non-EU short-stay travellers (including UK, US, and visa-required nationalities) is recorded. The 90/180 rule is automatically enforced — overstays generate an automatic flag.",
    appliesTo: { kind: "destination", iso: "FR" },
    references: [
      { label: "EU EES — official", url: "https://travel-europe.europa.eu/ees_en" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "schengen-etias-2026",
    severity: "info",
    title: "Schengen Area: ETIAS authorisation required from late 2026",
    body:
      "From late 2026, visa-exempt nationals (US, UK, Canada, Australia, Japan, etc.) need an ETIAS authorisation before travel to the Schengen Area. €7 fee for ages 18–70, valid 3 years or until passport expiry, multiple-entry. Apply at travel-europe.europa.eu — not a visa, but airlines will deny boarding without it once active.",
    appliesTo: { kind: "destination", iso: "ES" },
    references: [
      { label: "EU ETIAS — official", url: "https://travel-europe.europa.eu/etias_en" },
    ],
    updatedAt: "2026-05-10",
  },
  {
    id: "uk-eta-rollout",
    severity: "info",
    title: "United Kingdom: ETA required for visa-exempt nationalities",
    body:
      "The UK Electronic Travel Authorisation (ETA) is now mandatory for most visa-exempt nationals — Gulf nationals from 2023, US/Canada/Australia/EU/Japan/Korea/Singapore from early 2025. £10 fee, valid 2 years or until passport expiry, multiple-entry. Apply at gov.uk before travel; airlines will deny boarding without it.",
    appliesTo: { kind: "destination", iso: "GB" },
    references: [
      { label: "UK ETA — official", url: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
    ],
    updatedAt: "2026-05-10",
  },
];

export function obstaclesFor(passportIso: string, destinationIso: string): Obstacle[] {
  const p = passportIso.toUpperCase();
  const d = destinationIso.toUpperCase();
  return OBSTACLES.filter((o) => {
    if (o.appliesTo.kind === "passport") return o.appliesTo.iso === p;
    if (o.appliesTo.kind === "destination") return o.appliesTo.iso === d;
    return o.appliesTo.passport === p && o.appliesTo.destination === d;
  });
}
