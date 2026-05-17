/**
 * Hand-written US visa reciprocity notes for the top 25 US-bound origin
 * countries. The State Department's reciprocity schedule is currently not
 * a Visavu adapter (P36 covers building one); until that lands, this
 * module captures the practical reality per nationality.
 *
 * Each note covers:
 *   - B-1/B-2 visa fee, validity, number of entries
 *   - What surprises applicants from that country specifically
 *   - The reciprocal MRV / issuance fees that catch people out
 *
 * Source: travel.state.gov/.../reciprocity/{country}.html as of 2026-05.
 * When the State Department updates the schedule we refresh this file.
 */
export type UsReciprocity = {
  iso2: string;
  /** Headline B-1/B-2 fee snapshot (visa-issuance fee, distinct from MRV $185). */
  issuanceFeeSummary: string;
  /** Standard validity period for B1/B2 from this nationality. */
  validity: string;
  /** Number of entries permitted. */
  entries: string;
  /** Narrative: what's specific to this nationality applying for US visas. */
  body: string;
  /** Primary source URL on travel.state.gov. */
  sourceUrl: string;
};

export const US_RECIPROCITY: Record<string, UsReciprocity> = {
  PH: {
    iso2: "PH",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Filipino B-1/B-2 visas are issued for 10 years multiple-entry — among the most generous reciprocity terms globally. The Manila and Cebu embassies handle the heaviest Filipino case load; interview waits historically run 6-12 months. Common surprise: each entry's allowed period of stay is set by CBP at the port (not by the visa) — typically 6 months under the B-1/B-2 limit, sometimes shorter. Carry strong documentation of return ties to the Philippines for each entry.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Philippines.html",
  },
  IN: {
    iso2: "IN",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Indian B-1/B-2 visas are issued for 10 years multiple-entry. Recent processing has stabilised after the post-pandemic backlog — Mumbai, Delhi, Chennai, Hyderabad, Kolkata interview waits have come down from 600+ days to roughly 60-120 days for first-time applicants in 2024-2025. Common surprise: H-1B and L-1 visa holders extending or transferring inside the US still need to attend an in-person interview if their visa stamp has expired and they want to travel abroad — interview-waiver expansion in 2024 helps but doesn't cover every case.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/India.html",
  },
  CN: {
    iso2: "CN",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Chinese B-1/B-2 visas are issued for 10 years multiple-entry. Recent geopolitical tensions have led to Section 221(g) administrative processing for many Chinese applicants in STEM and security-sensitive sectors — typical hold 60-180 days, sometimes longer. Common surprise: Presidential Proclamation 10043 restricts F-1/J-1 visa issuance for Chinese nationals affiliated with PLA-linked institutions. Tourist B-1/B-2 cases are processed routinely but interview-waiver eligibility is limited; most Chinese applicants attend in-person.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/China.html",
  },
  MX: {
    iso2: "MX",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Mexican B-1/B-2 (commonly issued as the BCC — Border Crossing Card — for land travel) is valid 10 years multiple-entry. Many Mexican nationals use the BCC for routine border crossings; full B-visa is required for air entry beyond 25 miles inland. Common surprise: Mexican applicants residing in the US illegally face a 3-year (180+ days unlawful presence) or 10-year (1+ year unlawful presence) bar on re-entry — consult an immigration lawyer before voluntary departure if either applies.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Mexico.html",
  },
  VN: {
    iso2: "VN",
    issuanceFeeSummary: "$155 issuance fee for B1/B2 (per visa, in addition to $185 MRV)",
    validity: "1 year",
    entries: "Multiple",
    body:
      "Vietnamese B-1/B-2 reciprocity is more restrictive than the regional norm — only 1 year validity vs the 10 years offered to Thai, Filipino, Indian nationals. Issuance fee adds $155 per visa on top of the $185 MRV. Ho Chi Minh City and Hanoi process the bulk of cases; interview waits run 3-6 months. Common surprise: the 1-year validity means frequent travellers reapply often; plan around this for parent / family-visit patterns.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Vietnam.html",
  },
  BR: {
    iso2: "BR",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Brazilian B-1/B-2 visas are issued for 10 years multiple-entry. Brazil was in the Visa Waiver Program briefly (1991-2002) but is not currently. US embassy operations in São Paulo, Rio, Brasília, Recife, and Porto Alegre handle the case load; interview waits typically 2-8 weeks. Common surprise: Brazilian B-visa holders entering the US for medical treatment need to demonstrate ability to pay — bring documentation of insurance or hospital pre-payment to avoid B-2-purpose questions at the port.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Brazil.html",
  },
  NG: {
    iso2: "NG",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "2 years",
    entries: "Multiple",
    body:
      "Nigerian B-1/B-2 reciprocity is 2 years multiple-entry — a significant tightening from the prior 5-year norm. Lagos and Abuja embassies process the bulk of cases; interview waits historically run 8-18 months for first-time applicants. Refusal rates under Section 214(b) are 30-55% (above OECD baseline). Common surprise: third-country interview is allowed (most commonly Accra, Johannesburg, London) with shorter waits, but you must justify the third-country venue at the interview.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Nigeria.html",
  },
  ZA: {
    iso2: "ZA",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "South African B-1/B-2 visas are issued for 10 years multiple-entry. Johannesburg and Cape Town embassies process the case load; interview waits typically 4-12 weeks. Common surprise: South African passport holders are NOT in the US Visa Waiver Program despite low refusal rates — repeated diplomatic attempts to join the VWP have stalled on the Adult Refusal Rate threshold (3% for VWP eligibility; South Africa hovers above).",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/SouthAfrica.html",
  },
  EG: {
    iso2: "EG",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "5 years",
    entries: "Multiple",
    body:
      "Egyptian B-1/B-2 visas are issued for 5 years multiple-entry. Cairo embassy processes the bulk of cases; interview waits typically 6-16 months for first-time applicants. Common surprise: Egyptian applicants with extensive prior travel to the US (i.e., not first-time visitors) may qualify for interview-waiver renewal — saves the long interview wait. Allow 4-8 weeks for waiver processing.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Egypt.html",
  },
  PK: {
    iso2: "PK",
    issuanceFeeSummary: "$32 issuance fee for B1/B2 (per visa, in addition to $185 MRV)",
    validity: "5 years",
    entries: "Multiple",
    body:
      "Pakistani B-1/B-2 reciprocity is 5 years multiple-entry with a $32 issuance fee on top of the $185 MRV. Islamabad embassy interview waits historically 8-14 months. Extended security review (SAO) is common for Pakistani applicants, adding 60-180 days. Common surprise: 214(b) refusal rates for Pakistani first-time applicants are 30-50%; strong documentation of ties (employer letter showing salary, prior international travel including Schengen/UK/UAE, family commitments) materially improves outcomes.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Pakistan.html",
  },
  RU: {
    iso2: "RU",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "3 years",
    entries: "Multiple",
    body:
      "Russian B-1/B-2 reciprocity is 3 years multiple-entry. Current operational reality: the US embassy in Moscow has been operating with skeleton staff since 2021 — most Russian applicants must apply via a third-country US embassy (Warsaw, Belgrade, Astana, Yerevan, Tbilisi most common). Common surprise: third-country US embassies have varying willingness to process Russian applicants; check current operational status before booking travel to apply. Refusal rates have risen since 2022.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Russia.html",
  },
  IR: {
    iso2: "IR",
    issuanceFeeSummary: "$45 issuance fee for B1/B2 (per visa, in addition to $185 MRV)",
    validity: "3 months",
    entries: "Single (B-1/B-2 standard)",
    body:
      "Iranian B-1/B-2 reciprocity is 3 months single-entry — the most restrictive among major US-bound nationalities. No US embassy in Iran since 1979; Iranian applicants apply via a third country (typically Dubai, Abu Dhabi, Frankfurt, Vienna). Extended security review (SAO) is universal — allow 60-180 days. Common surprise: under Presidential Proclamation 9645 and successor frameworks, most Iranian B/F/J/H visa categories face additional restrictions. Consult an immigration lawyer before applying.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Iran.html",
  },
  TR: {
    iso2: "TR",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Turkish B-1/B-2 visas are issued for 10 years multiple-entry. Istanbul and Ankara embassies process the bulk of cases; interview waits typically 1-4 months. Common surprise: Turkish applicants enjoy interview-waiver eligibility for renewals within 48 months of prior issuance — saves the interview wait entirely. The post-2018 chill in US-Turkey relations briefly disrupted issuance; routine processing resumed in 2019.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Turkey.html",
  },
  BD: {
    iso2: "BD",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "5 years",
    entries: "Multiple",
    body:
      "Bangladeshi B-1/B-2 reciprocity is 5 years multiple-entry. Dhaka embassy interview waits have historically been 6-12 months. Refusal rates under 214(b) for first-time applicants run 20-35%. Common surprise: many Bangladeshi applicants travel to India or Sri Lanka for shorter waits at third-country US embassies — same documentation, faster timeline, but flight cost adds.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Bangladesh.html",
  },
  LK: {
    iso2: "LK",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Sri Lankan B-1/B-2 visas are issued for 10 years multiple-entry. Colombo embassy interview waits typically 3-6 months. Common surprise: Sri Lankan applicants attempting to extend stay or change status inside the US face heightened scrutiny — better to depart and reapply abroad than try to convert from B-2 to F-1 or H-1B in-country.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/SriLanka.html",
  },
  NP: {
    iso2: "NP",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "5 years",
    entries: "Multiple",
    body:
      "Nepalese B-1/B-2 visas are issued for 5 years multiple-entry. Kathmandu embassy interview waits 4-10 months. Common surprise: Nepali applicants under TPS (Temporary Protected Status) post-2015 earthquake had separate immigration pathways; check TPS status implications before applying for B-visa renewal.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Nepal.html",
  },
  ID: {
    iso2: "ID",
    issuanceFeeSummary: "$24 issuance fee for B1/B2 (in addition to $185 MRV)",
    validity: "5 years",
    entries: "Multiple",
    body:
      "Indonesian B-1/B-2 reciprocity is 5 years multiple-entry with a $24 issuance fee on top of the $185 MRV. Jakarta and Surabaya embassies process cases; interview waits 2-4 months. Common surprise: Indonesian applicants enjoy interview-waiver eligibility for renewals within 48 months — saves the embassy interview entirely when previously issued.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Indonesia.html",
  },
  TH: {
    iso2: "TH",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Thai B-1/B-2 visas are issued for 10 years multiple-entry. Bangkok and Chiang Mai embassies process cases; interview waits typically 1-4 months. Common surprise: Thai applicants enjoy interview-waiver eligibility for renewals within 48 months. The Bangkok embassy expanded interview-waiver processing in 2024.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Thailand.html",
  },
  MY: {
    iso2: "MY",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Malaysian B-1/B-2 visas are issued for 10 years multiple-entry. Kuala Lumpur embassy processes cases; interview waits typically 2-6 weeks — among the shortest in the region. Common surprise: Malaysia is NOT in the Visa Waiver Program despite low refusal rates; repeated lobbying has stalled on biometric data-sharing requirements. Standard B-visa is the route.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Malaysia.html",
  },
  KR: {
    iso2: "KR",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "Not applicable — Visa Waiver Program (ESTA)",
    entries: "Multiple (ESTA, 90-day stay)",
    body:
      "South Korea is in the US Visa Waiver Program — Korean nationals travel with ESTA, no B-visa required for short business / tourism stays. ESTA $21, 2-year validity, multiple-entry, max 90 days per stay. Common surprise: ESTA-only entry doesn't allow status change or employment authorisation inside the US — Korean nationals on ESTA cannot apply for OPT, change to H-1B, etc. without departing and re-entering on the appropriate visa.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/RepublicofKorea.html",
  },
  HK: {
    iso2: "HK",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Hong Kong SAR passport holders apply for standard US B-1/B-2 visa (Hong Kong is NOT in the Visa Waiver Program). 10 years multiple-entry. US Consulate General Hong Kong processes cases; interview waits typically 2-8 weeks. Common surprise: Hong Kong residents who hold a BN(O) British passport apply under UK reciprocity not HK — pick whichever offers the longer validity / interview-waiver eligibility.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/HongKong.html",
  },
  TW: {
    iso2: "TW",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "Not applicable — Visa Waiver Program (ESTA)",
    entries: "Multiple (ESTA, 90-day stay)",
    body:
      "Taiwan is in the US Visa Waiver Program (granted 2012) — Taiwanese nationals travel with ESTA, no B-visa required for short business / tourism stays. ESTA $21, 2-year validity, multiple-entry, max 90 days per stay. AIT-Taipei consular processing handles standard B-visa cases for travellers who don't qualify for ESTA (rare).",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Taiwan.html",
  },
  AR: {
    iso2: "AR",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Argentine B-1/B-2 visas are issued for 10 years multiple-entry. Argentina was in the US Visa Waiver Program briefly (1996-2002) but is no longer. Buenos Aires embassy interview waits typically 2-8 weeks. Common surprise: Argentine applicants enjoy interview-waiver eligibility for renewals within 48 months — saves the interview wait entirely.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Argentina.html",
  },
  CO: {
    iso2: "CO",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "10 years",
    entries: "Multiple",
    body:
      "Colombian B-1/B-2 visas are issued for 10 years multiple-entry. Bogotá embassy processes cases; interview waits typically 2-6 months. Common surprise: Colombian applicants with extensive prior US travel qualify for interview-waiver renewal. Refusal rates are below the regional baseline — Colombia is among the more compliant Latin American applicant pools.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Colombia.html",
  },
  CL: {
    iso2: "CL",
    issuanceFeeSummary: "No issuance fee (in addition to $185 MRV)",
    validity: "Not applicable — Visa Waiver Program (ESTA)",
    entries: "Multiple (ESTA, 90-day stay)",
    body:
      "Chile is in the US Visa Waiver Program (granted 2014) — the only South American Visa Waiver Program member. Chilean nationals travel with ESTA, no B-visa required. ESTA $21, 2-year validity, 90 days per stay. Common surprise: Chilean nationals are also eligible for the US H-1B1 specialty-occupation visa under the US-Chile FTA — separate from H-1B and not subject to the same cap lottery. Underused but useful for tech professionals.",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country/Chile.html",
  },
};

export function usReciprocityFor(passportIso2: string): UsReciprocity | null {
  return US_RECIPROCITY[passportIso2.toUpperCase()] ?? null;
}
