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
