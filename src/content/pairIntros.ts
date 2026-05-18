/**
 * Per-(passport, destination) editorial framing paragraphs.
 *
 * These are the 80-100 word narrative blocks that sit at the top of
 * /[passport]/[destination] result pages. They contextualise the route
 * BEFORE the user dives into the structured visa cards — naming the
 * specific bilateral relationship (Common Travel Area, WHTI, Trans-
 * Tasman, ASEAN, Mercosur, etc.), the headline visa-free status, and
 * the typical long-stay routes that bring people from this passport
 * to this destination.
 *
 * This is the LAST mile of editorial — passport intros + destination
 * intros + per-purpose intros are general; this is "what's the story
 * of UK to Spain specifically?" Each pair has its own facts: bilateral
 * agreements, diaspora communities, professional pipelines, tax
 * treaties, common refusal patterns.
 *
 * Coverage target: top 40 highest-traffic pairs. Generator-fallback for
 * the long tail. Expand by appending.
 */

export type PairKey = `${string}:${string}`;

export const PAIR_INTROS: Partial<Record<PairKey, string>> = {
  // ════════════════════════════════════════════════════════════════
  // United Kingdom & Ireland axis
  // ════════════════════════════════════════════════════════════════

  "GB:US": `British citizens travel to the US under the Visa Waiver Program — apply for ESTA online (USD $21, valid 2 years, 90-day stays), no embassy interview required. For longer stays or work, the UK-US relationship runs through specific visa programmes: E-2 Treaty Investor (UK is a treaty country, $100k+ business investment), L-1 for intracompany transfers, the highly-competitive H-1B lottery, O-1 for extraordinary ability, and EB-5 ($800k+) for green-card-by-investment. The UK is one of the largest source countries for US student visas (F-1) and a major recipient of US-to-UK tech / finance / academic relocations under reciprocal programmes.`,

  "US:GB": `US citizens travel to the UK under the new Electronic Travel Authorisation (ETA, £16, valid 2 years for multiple 6-month stays) from 2025. For longer stays, the Skilled Worker visa requires employer sponsorship + £38,700 baseline salary (lower for shortage occupations). The US-UK Mobility Partnership simplifies professional secondments. Other routes: Global Talent (no sponsor required for endorsed academics, tech, arts), High Potential Individual (graduates of ~50 top US universities get 2-3 years of unsponsored work), Innovator Founder for startup founders. Tens of thousands of Americans live in the UK on these routes; London + Edinburgh + Manchester are the main destinations.`,

  "IN:US": `Indian nationals are the largest US visa applicant nationality. The standard pipeline: F-1 (study) → OPT (12 months unsponsored work, +24 months for STEM) → H-1B sponsorship lottery. H-1B has a 65,000 cap + 20,000 advanced-degree exemption, with India taking ~70% of selections. EB-2 / EB-3 green-card backlogs for Indian-born applicants currently exceed a decade due to per-country caps. L-1 intracompany transferees from Indian tech / finance multinationals (TCS, Infosys, Wipro, Deutsche Bank India) bypass the H-1B lottery. Indian tourists need a B-1/B-2 visa — Mumbai / Delhi consulate interview backlogs improved in 2024 but remain weeks.`,

  "IN:GB": `Indian nationals are the largest source of UK Skilled Worker visa applicants, particularly in healthcare (Health and Care Worker visa — discounted fee, reduced Immigration Health Surcharge, lower salary floor for the NHS), technology, and finance. Standard route: bachelor's degree + sponsored job offer (£38,700+ salary, £23,200 for shortage occupations) → Skilled Worker visa → ILR after 5 years → British citizenship after 12 months. UK Student visa applicants from India increased substantially post-2020 with the Graduate Route (2-3 years post-study unsponsored work). Tourist visa: Standard Visitor — Delhi / Mumbai / Chennai application centres; refusal rate has improved to ~13% historically.`,

  "IN:CA": `India is the largest source of new Canadian permanent residents (over 27% of total in 2024). Express Entry via the Federal Skilled Worker / Canadian Experience Class programmes — points-based, CRS scores for Indian applicants typically need to clear 470-500 for invitations. Provincial Nominee Programs (Ontario, BC, Saskatchewan especially) are heavily used by Indian applicants. Study Permits from India spiked but tightened in 2024 with the Provincial Attestation Letter (PAL) requirement and CA$20,635 GIC threshold. Post-Graduation Work Permit + Canadian Experience Class is the dominant student-to-PR path. Canadian-Indian diaspora ~1.8 million.`,

  "IN:AU": `Indian nationals are the largest source country for Australian Subclass 482 (Temporary Skill Shortage) visas and Subclass 500 (Student) applications. Standard work pipeline: bachelor's + sponsored offer + occupation on Skilled Occupation List + meeting TSMIT (AU$73,150 from July 2024) → 482 → Employer Nomination Scheme (subclass 186) → PR. Skilled Independent (189) and Skilled Nominated (190) routes are heavily competed for by Indian applicants in tech / engineering / accounting. Bilateral mobility under the Australia-India Migration and Mobility Partnership Arrangement (MMPA, 2023) includes the MATES programme — early-career Indian graduates of recognised universities get a fast 2-year mobility pathway.`,

  "CN:US": `Chinese nationals require a B-1/B-2 visitor visa for tourism — applied at the US consulate in Beijing / Shanghai / Guangzhou / Shenyang / Chengdu / Wuhan. F-1 student visas to the US have declined post-2018 trade-tensions and the Presidential Proclamation 10043 restricting STEM students from China's "MCF-linked" universities. H-1B sponsorship is common but EB-2/EB-3 backlogs for China-born applicants run several years. EB-5 ($800k+) is heavily used by Chinese investors. Long-stay reversed flow: US citizens to China require a Chinese L visa (no visa-free for US passport, unlike the recent expansion for EU). Hong Kong + Macau have separate visa regimes.`,

  "CN:GB": `Chinese nationals need a Standard Visitor visa for UK tourism — Beijing / Shanghai / Guangzhou / Chongqing visa centres. Refusal rate higher than for visa-exempt nationalities (~12% historically). UK Student visa applications from China remain the second-largest source nationality after India. Skilled Worker route via Chinese-owned UK businesses (HNA, Geely, Tencent UK) or international firms. Investor Tier 1 visa was closed in 2022, leaving Global Talent + Innovator Founder + Skilled Worker as the main long-stay routes. UK-China Mobility Partnership not formalised; routes remain employer-sponsored and points-based. BNO (British National Overseas) holders from Hong Kong have separate, very generous settlement route.`,

  "NG:US": `Nigerian nationals require a B-1/B-2 visa for the US — applied at the Lagos consulate or Abuja embassy. Refusal rates for B-1/B-2 from Nigeria are among the highest globally (40-60% historically) — applicants must demonstrate exceptionally strong home-country ties. Diversity Visa lottery (DV-2025) Nigeria typically caps Nigerian winners at ~50,000 per year due to high participation. F-1 student visas to the US are heavily applied for; many Nigerian students transition via OPT and H-1B (where sponsorship can be found). EB-2 / EB-3 employment-based green-card routes are accessible to Nigerian applicants without the multi-decade backlog India / China face.`,

  "NG:GB": `Nigerian nationals are heavily represented in the UK Skilled Worker pipeline (healthcare via the Health and Care Worker visa, NHS / care-home sponsorship is dominant) and in Student visa applications. Standard tourist route requires a Standard Visitor visa at the Lagos / Abuja visa application centre — refusal rates historically 30-40%, requires substantial documentation of intent to return. UK Ancestry visa available to Nigerians of UK-born grandparent descent (Commonwealth route). The 2024 Skilled Worker reforms — particularly the dependents ban for care workers — affected Nigerian healthcare recruitment substantially.`,

  // ════════════════════════════════════════════════════════════════
  // Anglosphere mobility (AU / NZ / CA / UK / US axis)
  // ════════════════════════════════════════════════════════════════

  "AU:GB": `Australian citizens travel to the UK under the new Electronic Travel Authorisation (ETA, £16, valid 2 years for multiple 6-month stays). For longer stays, Australians have multiple bilateral routes: Youth Mobility Scheme (Tier 5 — under-35s, 3 years, no sponsor needed), UK Ancestry visa (5 years on a sponsor-free work-permitting visa for Commonwealth citizens with a UK-born grandparent — extraordinarily popular with Australian-born descendants of British emigrants), High Potential Individual (graduates of ~50 top universities), Global Talent for endorsed sectors. Skilled Worker requires employer sponsorship + £38,700+ salary. Substantial Australian diaspora in London.`,

  "AU:US": `Australians travel to the US under the Visa Waiver Program (ESTA, USD$21, valid 2 years, 90-day stays). The unique Australian E-3 visa — 10,500 per year, requires bachelor's + speciality occupation + US employer sponsorship — is functionally an Australia-only fast-track H-1B equivalent with no lottery and faster processing. Spouses get full work rights. L-1 intracompany transferees common via Australian multinationals (BHP, CBA, Macquarie, Atlassian). EB-1A / EB-1B for extraordinary ability / outstanding researchers are accessible — Australian academics often qualify. Sydney + Melbourne consulates process the visa interviews.`,

  "AU:NZ": `Australians and New Zealanders move freely between the two countries under the Trans-Tasman Travel Arrangement (1973). Australians entering NZ are automatically granted a Resident visa on arrival — full work, study, and access to NZ healthcare (subject to 2-year residency for public-funded healthcare). NZ Special Category Visa (SCV-444) similarly grants New Zealanders the right to live and work in Australia indefinitely. The arrangement does not include automatic citizenship — Australians naturalise in NZ after 5 years; NZ citizens of 4-year+ continuous Australian residence post-2017 became eligible for an Australian citizenship pathway under the 2023 reforms.`,

  "CA:US": `Canadians enter the US visa-free for tourism / business — neither ESTA nor visa required, just present a Canadian passport (land entry: WHTI-compliant document). I-94 stays for up to 6 months. For work, the USMCA TN visa (formerly NAFTA Professional) covers ~60 listed occupations — degree + job offer = approved at the border, renewable indefinitely, spouses get TD work-eligible. L-1 intracompany transfers, H-1B, E-1/E-2 also available. Canadian-born have no per-country green-card backlog. ~1 million Canadians live in the US; reverse flow ~1 million Americans live in Canada.`,

  "CA:GB": `Canadian citizens travel to the UK under the new Electronic Travel Authorisation (ETA, £16, 2-year multi-entry, 6-month stays). Long-stay routes via Skilled Worker (£38,700 salary threshold, employer sponsorship), High Potential Individual (graduates of ~50 top universities including U Toronto, McGill, UBC, Waterloo), Youth Mobility Scheme (under-35s, 3-year visa via the IEC quota), Global Talent for endorsed sectors. UK Ancestry visa for Canadian-born descendants of UK-born grandparents (Commonwealth route — 5 years work-permitting then ILR). UK-Canada Mobility Partnership simplifies professional secondments.`,

  "NZ:AU": `New Zealanders enter Australia under the Special Category Visa (SCV-444) granted automatically on arrival — unlimited work, study, residence, but historically with limited access to social security and a non-automatic pathway to citizenship. The 2023 Albanese-Hipkins reforms simplified the Citizenship Pathway: NZ citizens continuously resident in Australia for 4+ years post-2017 became eligible to apply directly for Australian citizenship without the intermediate PR step (subclass 189 / 190). Estimated 700k+ New Zealanders live in Australia under this arrangement. Working conditions and tax treatment now substantially harmonised. Healthcare: SCV holders get Medicare access.`,

  "NZ:GB": `New Zealanders travel to the UK under the Electronic Travel Authorisation (ETA, £16, valid 2 years for multiple 6-month stays). For long stays: Youth Mobility Scheme (Tier 5 — under-35s from NZ, 3-year visa, no sponsor required), UK Ancestry (5-year work-permitting for descendants of UK-born grandparents — heavily used by NZ-born Brits), High Potential Individual for graduates of top global universities (Auckland qualifies), Global Talent, Skilled Worker. NZ-UK Free Trade Agreement (in force 2023) deepened mobility for short-term business travel and select professional categories.`,

  // ════════════════════════════════════════════════════════════════
  // Schengen & EU internal — top intra-EU pairs
  // ════════════════════════════════════════════════════════════════

  "DE:US": `Germans travel to the US under the Visa Waiver Program (ESTA, USD$21, 90-day stays). Long-stay routes typically via E-2 Treaty Investor (Germany is a treaty country, $100k+ business investment — popular with German Mittelstand expansion), L-1 intracompany transferees (Daimler, BMW, BASF, SAP), H-1B, O-1 for academics / scientists, EB-2 / EB-3 employment-based green cards. German-American Chamber of Commerce supports many bilateral programmes. ~50,000 German citizens live in the US.`,

  "DE:GB": `German citizens travel to the UK under the new ETA (£16, valid 2 years for 6-month stays). For long stays, Germans lost EU free movement post-Brexit and now need a Skilled Worker visa (employer sponsorship + £38,700+ salary), Global Talent, or other points-based route. EU Settlement Scheme remains open via "reasonable grounds" late applications for pre-2021 UK residents. UK-Germany science cooperation supports Horizon Europe partnerships. Substantial German-British professional community in London + Cambridge + Oxford.`,

  "FR:GB": `French citizens travel to the UK under the new ETA (£16, valid 2 years for 6-month stays). Post-Brexit French migration to the UK requires a Skilled Worker visa or other long-stay route. The traditional French community in London + Kent + South East shrunk substantially post-2020 — many returned to France. Cross-Channel commerce continues via business travel under ETA. UK-France science partnerships under the post-Brexit Horizon Europe association. Eurostar passport-control reciprocity at St Pancras / Gare du Nord operates as before.`,

  "FR:US": `French nationals travel to the US under the Visa Waiver Program (ESTA, USD$21, 90-day stays). Long-stay routes via E-2 Treaty Investor (France is a treaty country), L-1 intracompany transferees (Sanofi, LVMH, BNP Paribas, AXA), H-1B for tech, O-1 for academics, EB-5 for investment-based green cards. France-US Friendship, Commerce, and Navigation Treaty supports the E-1 trader category as well. ~200,000 French citizens live in the US; New York, San Francisco, Miami concentrations.`,

  // ════════════════════════════════════════════════════════════════
  // Latin America → Iberia
  // ════════════════════════════════════════════════════════════════

  "BR:PT": `Brazilians benefit from the deepest bilateral mobility relationship in the Lusophone world. Schengen 90/180 visa-free entry, ETIAS from late 2026. For long stays: D7 (passive income, popular Brazilian retiree route), D8 (digital nomad), Authorisation of Residence for Investment (Golden Visa post-2023 reform — venture capital / arts donation / heritage), CPLP Mobility Agreement (2022) provides streamlined residence for Brazilians beyond standard D-class visas. Naturalisation as Portuguese citizen accelerated to 3 years (was 6) for Brazilians (under the CPLP framework). Substantial Brazilian community in Lisbon + Porto + Algarve, particularly post-2020 tech / freelancer relocations.`,

  "BR:ES": `Brazilians travel to Spain visa-free for short stays under Schengen (90/180), ETIAS from late 2026. Long-stay routes: Non-Lucrative Visa (passive income from foreign sources), Digital Nomad Visa (€2,762/month proven income, 2023 launch), Highly Qualified Worker (€40,000+ salary), Spanish Iberoamerican naturalisation framework — Brazilian citizens become eligible for Spanish citizenship after just 2 years of legal residence (the shortest accelerated path in Europe). Spanish-Portuguese bilateral arrangements simplify recognition of qualifications. Substantial Brazilian community in Madrid + Barcelona + Valencia.`,

  "BR:US": `Brazilians need a B-1/B-2 visitor visa for the US since the 2025 Brazil-US reciprocal visa reintroduction (Brazil had been on the visa-waiver list temporarily 2019-2024). Apply at São Paulo / Rio / Brasília / Recife consulates. Long-stay routes: E-2 Treaty Investor (Brazil is a treaty country), L-1 intracompany transferees (Itaú, Vale, Petrobras, Embraer), H-1B for tech, EB-5 for investment. Substantial Brazilian-American community in Florida + Massachusetts + New Jersey. Brazil-US bilateral relationship remains strong despite visa-waiver lapse.`,

  "MX:US": `Mexicans need a B-1/B-2 visa for US tourism — applied at the Ciudad Juárez / Tijuana / Guadalajara / Hermosillo / Monterrey / Nogales consulates. Border-crossing card (BCC) provides 30-day proximity-zone access (75 miles into US, 30-day stays) for frequent border travellers. USMCA TN visa for Mexican professionals in 60+ listed occupations (degree + job offer = same-day approval at border). H-1B + H-2A (agricultural) + H-2B (seasonal non-agricultural) heavily applied for by Mexicans. The Mexican diaspora in the US is the largest single national-origin community in any country globally (~37 million Mexican-Americans).`,

  // ════════════════════════════════════════════════════════════════
  // Asia → EU / Anglosphere
  // ════════════════════════════════════════════════════════════════

  "PH:US": `Filipinos require a B-1/B-2 visa for US tourism — applied at the Manila or Cebu embassy. Long-stay routes dominated by family reunification (Family Preference categories — IR for spouses of US citizens, F-2A for spouses of green-card holders, F-3 for married children of citizens — Philippines has substantial multi-year wait times due to per-country caps) and Employer-Sponsored work (especially healthcare — H-1B for registered nurses / professionals, EB-3 for skilled workers). Philippine-American community ~4.5 million.`,

  "PH:GB": `Filipino nationals need a Standard Visitor visa for UK tourism (refusal rates ~10-15% historically). UK Skilled Worker visa is heavily used by Filipinos — particularly in healthcare (Health and Care Worker visa for nurses, care workers), hospitality, and shipping (PH is among the world's largest sources of merchant marine officers). UK student visa applications from PH grew substantially post-2020. PH has no Commonwealth ancestry route to UK (was a US territory, not UK). UK-PH Skilled Migration agreement supports targeted recruitment.`,

  "JP:US": `Japanese nationals travel to the US under the Visa Waiver Program (ESTA, USD$21, 90-day stays). Long-stay routes via E-1/E-2 Treaty Trader / Investor (Japan is a treaty country, $100k+ — popular with Japanese SME expansion), L-1 intracompany transferees (Toyota, Sony, SoftBank, Mitsubishi), H-1B for tech, O-1 for arts / sports / academia. Japan-US Status of Forces Agreement covers US military personnel and dependents in Japan; Japanese-American community ~1.5 million. New York + Los Angeles + San Francisco hubs.`,

  "KR:US": `South Koreans travel to the US under the Visa Waiver Program (ESTA, USD$21, 90-day stays). For long stays: E-1/E-2 Treaty Trader/Investor (South Korea is a treaty country, $100k+ — common SME expansion route), L-1 intracompany transferees (Samsung, LG, Hyundai, SK Group), H-1B for tech, O-1 for arts (K-Pop crossover) / academics, EB-5 for investment. Korean-American community ~1.9 million. Bilateral mobility under the KORUS FTA supports specific professional categories. New York + Los Angeles + Chicago Korean concentrations.`,

  // ════════════════════════════════════════════════════════════════
  // Common Travel Area
  // ════════════════════════════════════════════════════════════════

  "GB:IE": `UK and Ireland operate the Common Travel Area (CTA), in primary legislation on both sides — British citizens have full unrestricted rights to enter, live, work, and access social security in Ireland (and vice versa) without any immigration formality, regardless of Brexit. No visa, no ETA, no work permit — just present a UK passport. Family routes, education, healthcare (with reciprocal arrangements), social welfare access. Children born to British / Irish parents in either jurisdiction generally acquire both citizenships.`,

  "IE:GB": `Irish citizens have full unrestricted rights to enter, live, work, and access social security in the UK under the Common Travel Area (CTA, in primary legislation on both sides). No visa, no ETA, no Settled Status registration required (Irish citizens were explicitly excluded from the EU Settlement Scheme post-Brexit because their rights are independent of EU law). Irish nationals in the UK benefit from voting rights in local + parliamentary elections, free secondary education, and full NHS access from day one. Substantial Irish-British community (~600k Irish-born in the UK).`,

  // ════════════════════════════════════════════════════════════════
  // Selected high-traffic family / heritage routes
  // ════════════════════════════════════════════════════════════════

  "IN:NP": `Indians and Nepalis move freely between the two countries under the 1950 Indo-Nepal Treaty of Peace and Friendship. No visa, no work permit, no formal immigration process for either nationality entering the other — just present national ID or passport. Indian nationals work and reside indefinitely in Nepal; Nepalis work and reside indefinitely in India (with the right to own property, run businesses, and access most social services on near-equal footing with citizens). The arrangement is the oldest and deepest bilateral mobility relationship in South Asia.`,

  "BD:GB": `Bangladeshi nationals need a Standard Visitor visa for UK tourism — Dhaka visa application centre, refusal rates 25-40% historically. UK Skilled Worker visa heavily applied for in healthcare / hospitality / IT. The British Bangladeshi community (~600k) is the third-largest South Asian community in the UK after Indians and Pakistanis. Family-reunification routes from Bangladesh to the UK have historically been among the largest immigration categories. Health and Care Worker visa for NHS recruitment remains an active route; the 2024 dependants-ban for care workers affected this materially.`,

  "PK:GB": `Pakistani nationals need a Standard Visitor visa for UK tourism — Islamabad / Karachi / Lahore visa application centres, refusal rates 25-40% historically. UK Skilled Worker visa heavily used in healthcare (Health and Care Worker programme for nurses, doctors, care workers), tech, and hospitality. The British Pakistani community (~1.6 million) is the second-largest South Asian community in the UK after Indians. Family-reunification routes (Partner / Spouse visa under Appendix FM) historically among the largest UK immigration categories.`,

  // ════════════════════════════════════════════════════════════════
  // Tax & residence havens
  // ════════════════════════════════════════════════════════════════

  "GB:PT": `British citizens travel visa-free to Portugal under Schengen 90/180 (ETIAS from late 2026). Long-stay routes among Europe's most accessible: D7 (passive income from UK pensions / dividends / rentals — popular UK-retiree route), D8 Digital Nomad Visa (€3,480+/month income from UK remote employer or self-employment), D2 Entrepreneur (UK-based business expansion), D3 Highly Qualified (£10,800+ annual contract salary). Substantial British community in the Algarve + Lisbon + Madeira. Naturalisation as Portuguese citizen after 5 years of legal residence — among Europe's fastest. Brexit-driven relocation accelerated post-2020.`,

  "GB:ES": `British citizens travel visa-free to Spain under Schengen 90/180 (ETIAS from late 2026, EES biometric tracking from late 2025). Long-stay routes: Non-Lucrative Visa (UK pensioner-favourite, €2,400+/month proven passive income, no work), Digital Nomad Visa (€2,762/month proven income from UK remote employer — 2023 launch), Highly Qualified Worker (€40,000+ salary). Spain's post-Brexit handling of British residents was generous — those resident on 31 December 2020 retained rights under the Withdrawal Agreement. ~300,000 British citizens live in Spain (Costa del Sol, Costa Blanca, Mallorca, Madrid).`,

  "GB:FR": `British citizens travel visa-free to France under Schengen 90/180 (ETIAS from late 2026). Post-Brexit long-stay requires a French national long-stay D-class visa: Long-Stay Visitor (no work, evidence of resources €1,500/month+ or savings equivalent — popular UK-retiree route), Talent Passport for skilled professionals / founders / artists, Long-Stay Salarié for sponsored employment. British residents resident on 31 December 2020 retained rights under the Withdrawal Agreement (TUE — titre de séjour spécifique). ~150,000 British citizens live in France (Dordogne, Brittany, Paris, Provence).`,

  "GB:IT": `British citizens travel visa-free to Italy under Schengen 90/180 (ETIAS from late 2026). Long-stay routes: Elective Residence (passive-income retirees, €31,000+/year proven income, no work permitted — popular UK retiree route), Lavoro Autonomo (self-employment / freelancers), Lavoro Subordinato (employer-sponsored, governed by annual decreto-flussi quotas), Investor Visa Italy (€500k+ startup / €2M+ bonds), Digital Nomad Visa (2024 launch, €28k+/year + remote employer). Substantial British community in Tuscany, Umbria, Le Marche. Italian descent (jure sanguinis) — UK applicants with Italian-born ancestors and unbroken citizenship line can claim Italian citizenship by descent (a major UK route to EU citizenship).`,
};

/** Lookup helper — returns the curated intro for this pair, or undefined
 *  if no entry exists (page falls back to the data-driven DirectAnswerCard). */
export function pairIntroFor(passport: string, destination: string): string | undefined {
  return PAIR_INTROS[`${passport.toUpperCase()}:${destination.toUpperCase()}` as PairKey];
}
