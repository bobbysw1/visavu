/**
 * Country-and-visa-specific immigration myths.
 *
 * Each entry uses the same Myth schema as src/content/myths/index.ts but
 * is tagged with one or more ISO2 country codes (`countries`) and often a
 * specific `visa` name. This lets us surface them on:
 *   - /myths (grouped by country)
 *   - /destination/[iso] (the country's specific page)
 *   - per-visa pages where the slug matches
 *
 * Editorial bar: same as general myths — government / regulator sources
 * only, verdict + plain-English truth + what-to-do bullets. Never Wikipedia.
 *
 * Coverage target: top 20 destinations × 3-5 myths each, focused on the
 * specific visas they offer.
 */

import type { Myth } from "./index";

const VERIFIED = "2026-05-19";

export const COUNTRY_MYTHS: Myth[] = [
  // ════════════════════════════════════════════════════════════════
  // UNITED STATES
  // ════════════════════════════════════════════════════════════════
  {
    slug: "us-h1b-lottery-buy-a-spot",
    question: "Can you pay extra to skip the US H-1B lottery?",
    metaDescription:
      "No. The US H-1B cap-subject lottery is a random electronic selection run by USCIS. There is no fast-track, premium-fee bypass, or guaranteed-selection product. Anyone offering one is selling a scam.",
    verdict: "false",
    headline:
      "The H-1B lottery is a true random selection — there is no legitimate way to buy your way in. Premium Processing only speeds the petition decision AFTER selection.",
    truth:
      "The H-1B cap-subject lottery (65,000 regular + 20,000 US-master's-degree spots) is run electronically by USCIS each March from the registrations submitted by sponsoring employers. Selection is random. Premium Processing (USD $2,805) ONLY accelerates the petition adjudication after selection — it does not increase the chance of being selected. Submitting multiple registrations for the same beneficiary across different employers used to be a common gaming tactic; USCIS closed this in the FY2024 cycle by switching to a beneficiary-centric selection (one registration per person, regardless of how many employers register them). Any agent, immigration consultancy or 'visa expediting' service offering to guarantee selection, sell extra entries, or promise a 'fast-track outside the lottery' is fraudulent. Genuine routes around the lottery exist but are visa-category alternatives: cap-exempt H-1B (universities, non-profit research, government research orgs), O-1 extraordinary ability, L-1 intracompany transfer, E-2 treaty investor, EB-1/EB-2 NIW direct green card.",
    whyExists:
      "The lottery's stark binary outcome — selected or not, no appeal, with multi-year career implications — creates desperation. Bad actors exploit this with promises of insider routes that don't exist. Combined with WhatsApp and Telegram scam channels targeting Indian and Chinese applicants specifically.",
    whatToDo: [
      "Register only through your sponsoring employer + their immigration counsel — never pay a third party 'agent' for H-1B services",
      "If unselected, explore cap-exempt H-1B (university, non-profit research) — these have no annual cap",
      "Consider O-1 if you have extraordinary-ability evidence (publications, awards, press coverage, salary at top 10% of field)",
      "L-1 transfer requires 1 year of full-time work at the foreign affiliate within the prior 3 years",
      "Treat ANY offer to 'guarantee' H-1B selection as fraud — report to USCIS Tip Form and your state attorney general",
    ],
    sources: [
      { label: "USCIS — H-1B Cap Season", url: "https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations" },
      { label: "USCIS — Premium Processing", url: "https://www.uscis.gov/forms/all-forms/how-do-i-request-premium-processing" },
      { label: "USCIS Tip Form (report fraud)", url: "https://www.uscis.gov/report-fraud" },
    ],
    lastVerified: VERIFIED,
    countries: ["US"],
    visa: "H-1B",
  },
  {
    slug: "us-esta-is-a-visa",
    question: "Is the US ESTA a visa?",
    metaDescription:
      "No. ESTA is a travel authorisation under the Visa Waiver Program, not a visa. It permits short visits only, has stricter conditions than a B-1/B-2, and can be refused or revoked without notice.",
    verdict: "false",
    headline:
      "ESTA is a pre-travel authorisation, not a visa. It only works for 38 designated nationalities, has tighter limits than a B-1/B-2, and gives you no right to appeal a refusal.",
    truth:
      "The US Visa Waiver Program (VWP), administered via ESTA (Electronic System for Travel Authorization, USD $21, valid 2 years), is available to citizens of 38 designated countries (UK, EU members, Japan, South Korea, Singapore, Taiwan, Australia, NZ, Israel, Chile and others). ESTA permits visits of up to 90 days — no extension, no change of status, no work, no study, no adjustment to a green card in most cases. A B-1/B-2 visitor visa (USD $185, in-person interview) is materially different: it permits up to 6 months per entry, can be extended in-country, and gives access to the change-of-status process. ESTA can be denied without explanation; you have no appeal right and must then apply for a B-1/B-2 visa instead. A prior visa refusal (B-1, F-1, etc.) requires you to disclose it on ESTA. Travel to certain countries since 2011 (Iran, Iraq, Libya, Somalia, Sudan, Syria, Yemen, North Korea, Cuba) automatically disqualifies you from ESTA — you need a full visa.",
    whyExists:
      "Marketing language — 'visa-free travel' — and the fact that ESTA holders breeze through border control most of the time makes it feel equivalent to a visa. The legal differences only surface when something goes wrong.",
    whatToDo: [
      "Check VWP eligibility — your nationality must be on the 38-country list AND you must hold an e-passport",
      "If you've been refused a US visa before, disclose it on ESTA — failure to disclose is grounds for permanent inadmissibility",
      "If you've travelled to Iran, Iraq, Libya, Somalia, Sudan, Syria, Yemen, North Korea, or Cuba since 2011 — apply for a B-1/B-2 instead",
      "For stays over 90 days, work, study, or anything beyond brief business / tourism — apply for the correct visa category",
      "Re-apply for ESTA when changing passport, name, address, citizenship, or after any new arrests or criminal charges",
    ],
    sources: [
      { label: "US CBP — ESTA Overview", url: "https://esta.cbp.dhs.gov/about" },
      { label: "US Travel.State.Gov — Visa Waiver Program", url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
      { label: "US Embassy — B-1/B-2 Visitor Visa", url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html" },
    ],
    lastVerified: VERIFIED,
    countries: ["US"],
    visa: "ESTA / VWP",
  },
  {
    slug: "us-green-card-3-years-citizenship",
    question: "Do you get US citizenship 3 years after a green card?",
    metaDescription:
      "Only spouses of US citizens can naturalise after 3 years of permanent residence. Everyone else needs 5 years, plus an English/civics test and good moral character.",
    verdict: "partial",
    headline:
      "3-year naturalisation is only for spouses of US citizens. Other green-card holders must wait 5 years — and there's no automatic conversion; you must apply via Form N-400.",
    truth:
      "US naturalisation runs through Form N-400 ($760 filing fee). Most lawful permanent residents (LPRs) qualify after 5 continuous years of residence with at least half of that time physically in the US, plus 'good moral character' (no serious arrests, no immigration fraud, all tax filings current). LPR spouses of US citizens qualify under a 3-year rule provided the marriage has been continuous and the US-citizen spouse held citizenship for at least 3 years. There is NO automatic conversion from green card to citizenship — you must apply, pass the English speaking/reading/writing test (waived for elderly long-residents), pass the civics test (100-question pool, 10 asked, 6 correct to pass), attend an interview, and take the Oath of Allegiance. Continuous residence is broken by absences of 6+ months unless preserved via Form N-470. Selective Service registration is required for men registered 18-26 while LPRs (failure is a bar). Conditional Permanent Residence (2-year card for new spouses of US citizens) doesn't count toward naturalisation until removed via I-751.",
    whyExists:
      "Cross-pollination between the LPR rule (5 years general) and spousal exception (3 years if married to a USC) confuses applicants. Plus immigration scam operators love to inflate the timeline benefits of services they sell.",
    whatToDo: [
      "Confirm your LPR card start date (the 'Resident Since' date on Form I-551) — your eligibility clock starts then",
      "If married to a USC, check both their citizenship date AND your continuous-marriage status",
      "Track absences — any single trip over 6 months can break continuous residence",
      "If men aged 18-26 when you became LPR, register for Selective Service immediately if you haven't",
      "Use N-400 'early filing' window — 90 days before eligibility — to start the process",
    ],
    sources: [
      { label: "USCIS — Naturalization Information", url: "https://www.uscis.gov/citizenship" },
      { label: "USCIS — N-400 Application", url: "https://www.uscis.gov/n-400" },
      { label: "USCIS — 100 Civics Questions", url: "https://www.uscis.gov/sites/default/files/document/questions-and-answers/100q.pdf" },
    ],
    lastVerified: VERIFIED,
    countries: ["US"],
    visa: "Naturalisation",
  },

  // ════════════════════════════════════════════════════════════════
  // UNITED KINGDOM
  // ════════════════════════════════════════════════════════════════
  {
    slug: "uk-skilled-worker-guaranteed-ilr",
    question: "Does a UK Skilled Worker visa guarantee Indefinite Leave to Remain after 5 years?",
    metaDescription:
      "No. ILR requires meeting Continuous Residence rules, the Life in the UK test, English at B1, and not breaking conditions. Job loss or pay drop can interrupt the clock.",
    verdict: "mostly_false",
    headline:
      "Skilled Worker leads to ILR eligibility AFTER 5 years — provided you've stayed sponsored, met the salary threshold continuously, and pass Life in the UK + English B1. None of that is automatic.",
    truth:
      "Indefinite Leave to Remain (ILR) on the Skilled Worker route requires: (1) 5 years of continuous lawful residence in the UK with no gap over 180 days outside the UK in any rolling 12-month period; (2) continuous Skilled Worker sponsorship (gaps allowed during job-change with sponsorship transfer within 60 days); (3) salary at the going rate for the Standard Occupational Code (SOC) at the time of ILR application — for most roles, currently £38,700 baseline (the threshold raised April 2024 and continues phased increases); (4) Life in the UK test pass; (5) English language qualification at CEFR B1 (or degree taught in English); (6) no breaches of immigration conditions. Application fee £3,029 + Immigration Health Surcharge already paid during visa stages. Job loss with no replacement sponsor within 60 days curtails your visa — you must leave or switch. Pay drop below threshold has triggered ILR refusal in test cases (the rules let Home Office assess your salary at the application moment). The Skilled Worker route is the most common ILR-feeder, but it requires planning, not patience.",
    whyExists:
      "Recruitment marketing — '5 years to settle in the UK!' — over-simplifies a multi-condition process. Many applicants discover the salary-at-ILR requirement only at year 4, when their employer hasn't been raising in line with SOC going-rate changes.",
    whatToDo: [
      "Track your absences — keep a spreadsheet of every trip outside the UK with dates",
      "Book Life in the UK test in year 4 (the booking system is congested)",
      "Confirm your B1 English certification or use your UK-taught degree (NARIC verified)",
      "Check your current salary against the latest SOC going rate annually — request a pay rise if behind",
      "If you lose your job, find a replacement Skilled Worker sponsor within 60 days OR exit the route via switch (Family, Student, etc.)",
      "Apply for ILR on the day you become eligible — every additional month of residence is opportunity cost",
    ],
    sources: [
      { label: "UK gov — Skilled Worker visa", url: "https://www.gov.uk/skilled-worker-visa" },
      { label: "UK gov — Indefinite Leave to Remain", url: "https://www.gov.uk/indefinite-leave-to-remain" },
      { label: "UK gov — Life in the UK Test", url: "https://www.gov.uk/life-in-the-uk-test" },
    ],
    lastVerified: VERIFIED,
    countries: ["GB"],
    visa: "Skilled Worker",
  },
  {
    slug: "uk-eta-is-a-visa",
    question: "Is the UK ETA the same as a visa?",
    metaDescription:
      "No. The UK ETA is a pre-travel digital authorisation, not a visa. It only works for non-visa nationals, only for short visits, and can be refused or revoked.",
    verdict: "false",
    headline:
      "The UK ETA (£16, valid 2 years) is a pre-travel digital authorisation for visitors from non-visa countries — not a visa, not work permission, not a route to longer stays.",
    truth:
      "The UK Electronic Travel Authorisation (ETA, rolled out 2024-2025, £16, valid 2 years for multiple visits up to 6 months each) applies to nationals of countries that were previously visa-free for the UK — US, EU, Canada, Australia, Japan, South Korea, Singapore, GCC, etc. It is functionally similar to ESTA / eTA / ETIAS. ETA permits: tourism, family visits, business meetings, conferences, short-term study (up to 6 months at an accredited institution), permitted paid engagements (specific paid speaking / examining / academic visits up to 1 month). ETA does NOT permit: paid work for a UK employer, taking up residence, marriage in the UK as a Visitor (use Marriage Visitor visa instead), accessing the NHS for non-emergency treatment, switching to a long-stay visa in-country. ETA can be refused (rarely, but possible — typically for prior immigration breaches, criminal records, or border-officer suspicion) and revoked. Border officers retain final discretion at the airport — even with valid ETA, entry can be refused.",
    whyExists:
      "Marketing terminology — 'electronic travel visa' — gets repeated by travel-booking sites, blurring the legal distinction. The genuine difference (visa = full permission to apply for admission at border, ETA = pre-screened approval to seek admission) is technical but consequential.",
    whatToDo: [
      "Check the UK ETA eligibility list — nationality + e-passport required",
      "Apply via gov.uk or the official UK ETA app (NOT third-party sites that mark up the fee)",
      "Keep the receipt — ETA is electronically linked to your passport, but the receipt helps at boarding",
      "For paid work, study over 6 months, family settlement, marriage — apply for the relevant visa category, NOT ETA",
      "Re-apply for ETA when you renew your passport (it's passport-linked, not standalone)",
    ],
    sources: [
      { label: "UK gov — Apply for an Electronic Travel Authorisation", url: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
      { label: "UK gov — Standard Visitor visa", url: "https://www.gov.uk/standard-visitor" },
      { label: "UK gov — Marriage Visitor visa", url: "https://www.gov.uk/marriage-visitor-visa" },
    ],
    lastVerified: VERIFIED,
    countries: ["GB"],
    visa: "ETA",
  },
  {
    slug: "uk-spouse-visa-29k-flexibility",
    question: "Can you work around the UK spouse visa £29,000 income requirement?",
    metaDescription:
      "Limited workarounds exist via cash savings, sponsor's overseas income, or specific exemptions for carers and disability benefits. Most 'creative' approaches get refused.",
    verdict: "partial",
    headline:
      "The £29,000 income threshold has narrow legitimate alternatives (cash savings of £88,500, sponsor overseas income with relocation, disability benefits route) — but most workarounds advertised online lead to refusal.",
    truth:
      "The UK Partner visa (Spouse / Civil Partner / Fiancé / Unmarried Partner) raised its income threshold from £18,600 to £29,000 in April 2024, with further phased rises previously planned but currently deferred. The applicant's combined household income from the UK-based sponsoring partner must reach this threshold — OR meet one of the narrow alternatives: (1) Cash savings of £88,500 held for 6+ months in accessible accounts; (2) Sponsor's existing overseas employment income (Category B) where they're relocating to the UK with a confirmed UK job offer at or above £29,000; (3) Sponsor on specific UK disability benefits (PIP, AA, DLA, Carer's Allowance) — full income requirement waived in favour of 'adequate maintenance' test; (4) Combinations of cash + pension income + non-employment income. Recurring 'workarounds' that DON'T work: counting the applicant's overseas income (only counted if joining the UK on a different visa first), promised gifts from family members, planning to work in the UK after arrival, self-employed income from informal arrangements. Refusal rate on partner-route has historically been 15-25%.",
    whyExists:
      "The 2012 financial requirement (introduced at £18,600) was challenged at Supreme Court (MM and others v SSHD 2017) — court upheld the principle but found Home Office had not properly considered exceptional circumstances. This created the appearance of more flexibility than actually exists in routine decisions.",
    whatToDo: [
      "Calculate which Category (A/B/C/D/E/F) applies to your sponsor's income mix — gov.uk Annex FM-1.7 has the rules",
      "Get 6 months of payslips + bank statements lined up — gaps trigger refusal",
      "For self-employed sponsors, prepare SA302 tax returns + business accounts + bank statements",
      "If using cash savings, account for the 6-month-held rule — last-minute deposits get rejected",
      "Engage an OISC L2 or solicitor for borderline cases — DIY applications on partial evidence almost always refuse",
      "If refused, the appeal route via Human Rights / Article 8 (family life) is the meaningful remedy — administrative review is rarely successful",
    ],
    sources: [
      { label: "UK gov — UK family visa", url: "https://www.gov.uk/uk-family-visa" },
      { label: "UK gov — Family Members under the Immigration Rules (Annex FM 1.7)", url: "https://www.gov.uk/government/publications/chapter-8-appendix-fm-family-members" },
      { label: "UK gov — Partner financial requirement", url: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-fm-family-members" },
    ],
    lastVerified: VERIFIED,
    countries: ["GB"],
    visa: "Spouse / Partner",
  },

  // ════════════════════════════════════════════════════════════════
  // FRANCE
  // ════════════════════════════════════════════════════════════════
  {
    slug: "fr-talent-passport-easy",
    question: "Is the French Talent Passport an easy work-permit shortcut?",
    metaDescription:
      "The Passeport Talent is faster than the standard salaried route, but it has tight category-specific income and credential requirements. It is not a free-for-all professional fast-track.",
    verdict: "mostly_false",
    headline:
      "The Talent Passport is faster + multi-year (vs the 1-year standard route), but every sub-category has tight thresholds — typically €43,000-€59,000 salary or specific endorsement / investment criteria.",
    truth:
      "The Passeport Talent ('Carte de séjour pluriannuelle Passeport talent') is a 4-year residence permit with relaxed sponsorship requirements compared to the standard Carte de séjour Salarié. It has 10+ sub-categories, each with its own eligibility: (1) Talent salarié qualifié — employer offer at €43,243+ for a graduate; (2) Talent salarié entreprise innovante — employer offer at €43,243+ AND the employer must be on the French innovative-companies register; (3) Talent emploi qualifié — salaried role above €58,985.40 (1.8× SMIC); (4) Talent porteur de projet — €30,000+ business investment + business plan; (5) Talent salarié en mission — intracompany transfer, 1.8× SMIC; (6) Talent chercheur — researcher with hosting agreement; (7) Talent professions artistiques et culturelles — proof of cultural activity in the field; (8) Talent renommée internationale — international recognition (publications, awards, press); (9) Talent investisseur économique — €300k+ tangible business investment. Application via the French consulate before arrival OR via the local prefecture for in-country switches from specific other long-stay categories. Family members get a Carte de séjour Famille de Passeport talent (open work rights). Decision time 2-3 months typical. Cost €269 (publication + tax).",
    whyExists:
      "French immigration agencies and Anglo-language press market the Passeport talent as 'France's golden visa' — which exaggerates the ease + understates the category-specific requirements. The reality is closer to a specialist EU Blue Card with bonus categories.",
    whatToDo: [
      "Identify which Passeport talent sub-category fits your profile — the salary + credential thresholds vary widely",
      "Apply at the French consulate in your country of residence before travelling — not at the border",
      "Use france-visas.gouv.fr for the official application portal — bypass third-party agencies that mark up fees",
      "Prepare French + English versions of all supporting documents — apostille or notarisation per the consulate's checklist",
      "If self-employed entrepreneur, prepare a business plan in French (or with certified translation)",
      "Family members can apply concurrently — include all dependents in the initial application for the discounted family-rate processing",
    ],
    sources: [
      { label: "France gov — Carte de séjour Passeport Talent", url: "https://www.service-public.fr/particuliers/vosdroits/F16922" },
      { label: "France-Visas official portal", url: "https://france-visas.gouv.fr/" },
      { label: "France Ministry of the Interior — Étrangers en France", url: "https://www.immigration.interieur.gouv.fr/" },
    ],
    lastVerified: VERIFIED,
    countries: ["FR"],
    visa: "Passeport Talent",
  },
  {
    slug: "fr-90-180-rule-each-country-separate",
    question: "Does the 90/180 Schengen rule apply separately to France from other Schengen countries?",
    metaDescription:
      "No. The 90/180 rule pools all Schengen countries together. Spending 90 days in France leaves you with zero days for Germany, Spain, Italy etc. in the same 180-day window.",
    verdict: "false",
    headline:
      "The 90/180 limit is for the entire Schengen Area combined — not per country. Days spent in France count against days available for every other Schengen member state.",
    truth:
      "The Schengen short-stay rule (Regulation 2018/1806 + Visa Code) is 90 days within any rolling 180-day period across the entire Schengen Area. There are currently 29 Schengen members (27 of 28 EU plus Iceland, Norway, Liechtenstein, Switzerland — Bulgaria + Romania joined the air/sea borders in March 2024, full land borders March 2025; Cyprus + Ireland remain outside Schengen despite EU membership; UK has been outside since Brexit). The 'rolling 180' means at any moment, immigration officers check whether you've been in Schengen for more than 90 cumulative days during the preceding 180 days — not calendar quarters or trip-based counting. Online calculators (ec.europa.eu hosts an official one) are essential for multi-trip travellers. France-specific exceptions are limited: French overseas territories (Martinique, Guadeloupe, Réunion, French Guiana, Mayotte) are NOT in Schengen and have separate stay rules; some non-Schengen UK / Irish / EFTA short-stay arrangements may overlap. For stays beyond 90 days in any one country, you need a national long-stay visa (Type D) — France-specific visa applied for at the French consulate.",
    whyExists:
      "Confusion between Schengen short-stay (Area-wide) and national long-stay visas (country-specific) is rife. Plus pre-Schengen national-level visas (Spain's 90, Germany's 90, etc.) created the historical impression of per-country quotas, which Schengen eliminated.",
    whatToDo: [
      "Use the official Schengen calculator at ec.europa.eu — count from your most recent entry backward",
      "Get all entry/exit stamps in your passport — the new Entry/Exit System (EES, late 2025 rollout) will replace stamps with biometric records",
      "For longer stays in France specifically, apply for a French long-stay visa (Type D) at the French consulate in your country of residence",
      "French overseas departments (Martinique, Guadeloupe, etc.) have separate visa rules — check before assuming Schengen access applies",
      "If you've overstayed, voluntary departure within a Schengen state often results in smaller bans than waiting to be removed",
    ],
    sources: [
      { label: "European Commission — Schengen short-stay calculator", url: "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy/short-stay-visa-calculator_en" },
      { label: "European Commission — Schengen Area", url: "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/schengen-area_en" },
      { label: "France-Visas — Long-stay visa (Type D)", url: "https://france-visas.gouv.fr/web/france-visas/long-stay-visa" },
    ],
    lastVerified: VERIFIED,
    countries: ["FR", "DE", "IT", "ES", "NL", "PT", "GR", "CH"],
    visa: "Schengen short-stay",
  },
  {
    slug: "fr-naturalisation-marriage-instant",
    question: "Does marriage to a French citizen instantly grant French nationality?",
    metaDescription:
      "No. Naturalisation by marriage requires 4-5 years of continuous marriage with shared residence, plus French language at B1, plus the standard interview and integration assessment.",
    verdict: "false",
    headline:
      "Marriage to a French citizen opens a faster naturalisation route (4 years standard, 5 if you've not lived in France) — not instant nationality. The applicant still needs French at B1 + integration interview.",
    truth:
      "French naturalisation by marriage (Article 21-2 of the Civil Code) requires: (1) 4 years of continuous marriage to a French citizen, OR 5 years if the couple has not been continuously resident in France for at least 3 of the 4 years; (2) shared married life (communauté de vie) — verified by joint household documents, shared finances, declarations; (3) French language at B1 level (CEFR), evidenced by an approved test (TCF, TEF) or qualifying French diploma; (4) demonstration of assimilation into the French community — interview at the prefecture; (5) no criminal convictions of 6+ months unsuspended within the past 10 years; (6) regularised residence status throughout the marriage. Application via the prefecture (DRDDI). Decision time 18-24 months typical. Refusal rates 25-35% historically — common refusal grounds: insufficient French language, gaps in shared residence, communauté de vie not convincingly demonstrated, criminal background. Successful applicants take the Oath of French Nationality and become citizens with full rights. Distinct from naturalisation by residence (5-year standard) and naturalisation by descent (jure sanguinis — automatic for children of French parents).",
    whyExists:
      "Marriage-based naturalisation IS faster than the standard 5-year residence route, which gets exaggerated into 'instant' in casual conversation. Plus the older 1-year and 2-year rules from the 1990s-2000s create memory artefacts in family stories.",
    whatToDo: [
      "Wait until 4 years of marriage (or 5 if you haven't been continuously resident in France) before applying",
      "Pass a B1 French test — TCF, TEF, DELF B1 are accepted; some French diplomas waive the test",
      "Collect joint household evidence: rental contract, utility bills in both names, joint bank statements, tax declarations",
      "Prepare for the prefecture interview — questions about your French integration, knowledge of French history, daily life",
      "If you have any criminal record, get specialist immigration advice — minor offences may not bar but disclosure is mandatory",
      "Naturalisation by marriage is by Government discretion — even meeting all conditions, refusal is possible on 'lack of integration' grounds",
    ],
    sources: [
      { label: "France gov — Naturalisation par mariage", url: "https://www.service-public.fr/particuliers/vosdroits/F2726" },
      { label: "France Ministry of the Interior — Acquisition of French nationality", url: "https://www.immigration.interieur.gouv.fr/Accueil-et-accompagnement/Acces-a-la-nationalite-francaise" },
      { label: "France Civil Code — Article 21-2 (nationality by marriage)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038749354/" },
    ],
    lastVerified: VERIFIED,
    countries: ["FR"],
    visa: "Naturalisation",
  },

  // ════════════════════════════════════════════════════════════════
  // GERMANY
  // ════════════════════════════════════════════════════════════════
  {
    slug: "de-blue-card-easy-citizenship",
    question: "Does the EU Blue Card in Germany lead to fast-track citizenship?",
    metaDescription:
      "The EU Blue Card gets you Permanent Residence (Niederlassungserlaubnis) faster (21-33 months) — but German citizenship still requires 5 years' residence (3 if well-integrated) under the 2024 reform.",
    verdict: "true_but",
    headline:
      "The Blue Card accelerates Permanent Residence to 21 months (B1) or 33 months (A1) — NOT citizenship. Citizenship still requires 5 years (3 if exceptionally integrated) under the 2024 reform.",
    truth:
      "The EU Blue Card in Germany requires a job offer at a recognised salary threshold — €45,300/year baseline, or €41,041 in shortage occupations (IT specialists, mathematicians, natural scientists, engineers, doctors). Holders get an accelerated path to Niederlassungserlaubnis (German Permanent Residence): 33 months with A1 German, OR 21 months with B1 German. This is materially faster than the 5-year standard route. HOWEVER, naturalisation as a German citizen is a separate process governed by the Staatsangehörigkeitsgesetz (StAG). Under the June 2024 citizenship reform: standard naturalisation requires 5 years of legal residence + B1 German + civics test + financial self-sufficiency + commitment to free democratic order. Accelerated naturalisation at 3 years for those with 'exceptional integration' (C1 German + special civic / academic / professional achievement). Dual citizenship is now generally permitted (the 2024 reform removed most renunciation requirements). Blue Card residence DOES count toward citizenship clock — but the 21-month Permanent Residence milestone is NOT citizenship; it's just a more secure visa.",
    whyExists:
      "Confusion between Niederlassungserlaubnis (PR) and Einbürgerung (citizenship) — both are 'forever-stay' outcomes but legally very different. Plus pre-2024 media coverage focused heavily on Germany's then-restrictive dual-citizenship rules; the 2024 reform changed this fundamentally.",
    whatToDo: [
      "Confirm your job offer meets the Blue Card salary threshold for your occupation (shortage vs general)",
      "Start German language learning from arrival — B1 unlocks the 21-month PR milestone",
      "Apply for Niederlassungserlaubnis at month 21 (B1) or 33 (A1) — not earlier",
      "Track every absence from Germany — extended trips can break continuous residence",
      "For citizenship, plan for the 5-year (or 3-year accelerated) timeline plus 6-12 month processing",
      "Under 2024 reform, you can keep your original citizenship — no need to renounce for most nationalities",
    ],
    sources: [
      { label: "Germany Make It In Germany — EU Blue Card", url: "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card" },
      { label: "BMI — German Citizenship Act (StAG)", url: "https://www.bmi.bund.de/EN/topics/migration/citizenship/citizenship-node.html" },
      { label: "BAMF — Niederlassungserlaubnis", url: "https://www.bamf.de/EN/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Migrathek/UnbefristeterAufenthaltstitel/unbefristeteraufenthaltstitel-node.html" },
    ],
    lastVerified: VERIFIED,
    countries: ["DE"],
    visa: "EU Blue Card",
  },
  {
    slug: "de-opportunity-card-walk-in-job",
    question: "Does the German Chancenkarte (Opportunity Card) get you a job on arrival?",
    metaDescription:
      "The Chancenkarte is a job-seeker visa — 12 months in Germany to find work. It doesn't include a job, doesn't unlock benefits, and runs out if you don't secure employment.",
    verdict: "mostly_false",
    headline:
      "The Chancenkarte is a 12-month job-seeker visa, not a work visa. You arrive without a job and have 12 months to find one — failure means departure.",
    truth:
      "The Chancenkarte (Opportunity Card, launched 1 June 2024 under the Skilled Immigration Act reform) is Germany's points-based job-seeker visa for skilled professionals. Eligibility: (1) recognised foreign vocational or university qualification (Anabin database verification); (2) basic German (A1) OR English (B2); (3) minimum 6 points across qualifications, work experience, age, language, prior German connection. Successful applicants get a 12-month residence permit to seek work in Germany. During that 12 months: limited part-time work (up to 20 hours/week) is permitted; full-time apprenticeships are permitted; but the Chancenkarte does NOT include a job offer, does NOT unlock unemployment benefits (Arbeitslosengeld), does NOT allow accompanying family members. If you find skilled employment within 12 months, you switch to the standard Skilled Worker visa or EU Blue Card. If you don't, you must leave Germany. Application cost ~€75 + travel + accommodation costs in Germany during the search period (recommend €1,200-1,500/month budget). The Chancenkarte is genuinely useful for professionals with strong skills + financial runway, but the marketing language ('opportunity!') over-promises the certainty of outcome.",
    whyExists:
      "German government communications + integration media positioned the Chancenkarte as a flagship achievement of Skilled Immigration Act 2023 — emphasising opportunity over the time-limited job-search reality.",
    whatToDo: [
      "Check your qualification recognition in the Anabin database BEFORE applying (some degrees need pre-recognition steps)",
      "Score yourself honestly on the 6-point system — qualifications + experience + age + language + prior German connection",
      "Budget €1,200-1,500/month for the 12-month search period — Berlin is cheaper, Munich / Frankfurt are pricier",
      "Use Make It In Germany job-portal + LinkedIn + branchenspezifische German job boards (StepStone, Indeed.de, Xing)",
      "Aim for an offer + Blue Card switch in months 3-9 — the 12-month deadline is hard, no extensions",
      "If you find work, switch immediately to Skilled Worker / Blue Card — don't burn months on Chancenkarte status",
    ],
    sources: [
      { label: "Germany Make It In Germany — Opportunity Card (Chancenkarte)", url: "https://www.make-it-in-germany.com/en/visa-residence/types/opportunity-card" },
      { label: "BMI — Skilled Immigration Act", url: "https://www.bmi.bund.de/EN/topics/migration/skilled-immigration/skilled-immigration-node.html" },
      { label: "Anabin — Qualification database", url: "https://anabin.kmk.org/" },
    ],
    lastVerified: VERIFIED,
    countries: ["DE"],
    visa: "Chancenkarte / Opportunity Card",
  },

  // ════════════════════════════════════════════════════════════════
  // CANADA
  // ════════════════════════════════════════════════════════════════
  {
    slug: "ca-express-entry-guaranteed-pr",
    question: "Does Express Entry guarantee Canadian PR if you meet the points threshold?",
    metaDescription:
      "Express Entry creates a candidate pool. Only Invitation to Apply (ITA) recipients can submit a PR application — and ITAs go to the highest-scoring profiles in each draw, not everyone over a threshold.",
    verdict: "false",
    headline:
      "Express Entry is a candidate pool, not an application. You enter the pool, then wait for an Invitation to Apply (ITA) — only the highest-CRS profiles in each draw get one. Recent rounds cleared 540+ CRS points.",
    truth:
      "Canada's Express Entry system manages three federal economic-class programmes: Federal Skilled Worker (FSW), Federal Skilled Trades (FST), Canadian Experience Class (CEC), plus the Provincial Nominee Program (PNP). Candidates create a profile, are ranked by Comprehensive Ranking System (CRS) score (max 1,200 points: 500 for human capital + 600 for skill transferability + 600 for arranged employment / provincial nomination / sibling-in-Canada). IRCC runs draws roughly every 2 weeks. In each draw, only candidates above the CRS cut-off receive an Invitation to Apply (ITA) for permanent residence. 2024-2025 draws have varied widely — category-based draws (French-language, healthcare, STEM, trades, agriculture) typically clear at lower CRS (380-500) for those categories; general draws often need 530-550+ CRS. Without an ITA you cannot submit a PR application — and profiles expire after 12 months. The system is competitive, not threshold-based.",
    whyExists:
      "Marketing copy from immigration consultants — 'you can qualify for Canada PR' — conflates entering the pool with succeeding in the draw. Plus older versions of Canadian skilled-worker rules (pre-2015) were threshold-based, creating historical confusion.",
    whatToDo: [
      "Calculate your CRS score honestly using the official IRCC calculator BEFORE paying any consultant",
      "If under 470 CRS, focus on boost factors: French (DELF B2 / TCF Canada adds 50-74 points), provincial nomination (+600), arranged employment (+50-200), Canadian study (+30)",
      "Provincial Nominee Programs are often easier — apply via the province (Saskatchewan, Manitoba, BC, Ontario) for nomination then re-enter Express Entry with +600",
      "Healthcare, trades, STEM, agriculture, French-language category draws have lower CRS thresholds — check IRCC for which round types you qualify for",
      "Profiles expire after 12 months — refresh proactively + improve your score (more work experience, language re-test, additional education)",
      "Avoid any 'guaranteed PR' service — there is no such thing; only your CRS score in the pool determines outcomes",
    ],
    sources: [
      { label: "IRCC — Express Entry", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html" },
      { label: "IRCC — CRS Calculator", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/criteria-comprehensive-ranking-system/grid.html" },
      { label: "IRCC — Latest Express Entry draws", url: "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html" },
    ],
    lastVerified: VERIFIED,
    countries: ["CA"],
    visa: "Express Entry",
  },
  {
    slug: "ca-lmia-easy-to-buy",
    question: "Can you buy a Canadian LMIA from an employer?",
    metaDescription:
      "Buying an LMIA is illegal. It's a labour-market test issued by ESDC to an employer who can prove they tried to hire Canadians first. Paying for one is fraud and triggers bans for both parties.",
    verdict: "false",
    headline:
      "Buying an LMIA is criminal fraud. ESDC issues LMIAs to employers based on labour-market evidence — they cannot be sold. Both buyer + seller face permanent bans + criminal charges.",
    truth:
      "A Labour Market Impact Assessment (LMIA) is a document issued by Employment and Social Development Canada (ESDC) to a Canadian employer demonstrating that no qualified Canadian or PR was available to fill a specific job. The employer pays a $1,000 processing fee, advertises the role in Canada for 4+ weeks, documents the recruitment process, and submits the application. An approved LMIA enables a foreign worker to apply for a closed work permit AND adds 50-200 CRS points in Express Entry. Selling LMIAs — i.e. employers extracting payment from foreign workers in exchange for LMIA support — is illegal under the Immigration and Refugee Protection Act + the Criminal Code. Both the employer and the worker face serious consequences: 5-year ban from the Temporary Foreign Worker Program, public posting on the ESDC blacklist, criminal prosecution for misrepresentation, permanent ban on future Canadian immigration applications for the worker. IRCC + ESDC + CBSA actively investigate LMIA fraud. The 'LMIA Mill' scandal of 2023-2024 led to ~150 Canadian employers being suspended and ~3,000+ workers facing PR application refusals.",
    whyExists:
      "Genuine employer-paid LMIAs (the employer pays the $1,000 ESDC fee) are common — predatory consultants and unethical employers exploit this by demanding worker reimbursement or kickbacks under the table.",
    whatToDo: [
      "If an employer or recruiter asks YOU to pay any amount for an LMIA, it's fraud — report to ESDC Tip Line (1-866-602-9448) or CBSA Border Watch Line",
      "Legitimate LMIA: the employer pays the $1,000 fee, advertises the role on Job Bank + 2 other Canadian sites for 4+ weeks, demonstrates genuine recruitment",
      "Verify employer compliance history on the ESDC public list — check whether they've had recent LMIA approvals or violations",
      "Use an RCIC (Regulated Canadian Immigration Consultant) or immigration lawyer — not unregulated 'agents' or 'recruiters'",
      "For pre-paid LMIA scams, you can apply for restoration of immigration status + report the employer — IRCC has provisions for victims of LMIA fraud",
    ],
    sources: [
      { label: "ESDC — Hire a temporary foreign worker through the TFW Program", url: "https://www.canada.ca/en/employment-social-development/services/foreign-workers/hire-temporary-foreign.html" },
      { label: "ESDC — Report wrongdoing in the TFW Program", url: "https://www.canada.ca/en/employment-social-development/services/foreign-workers/report-abuse.html" },
      { label: "IRCC — Choosing a representative", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigration-citizenship-representative.html" },
    ],
    lastVerified: VERIFIED,
    countries: ["CA"],
    visa: "LMIA / Work Permit",
  },

  // ════════════════════════════════════════════════════════════════
  // AUSTRALIA
  // ════════════════════════════════════════════════════════════════
  {
    slug: "au-skilled-points-189-guaranteed",
    question: "If I score 65 points for Australia Subclass 189, am I guaranteed an invitation?",
    metaDescription:
      "No. 65 is the minimum to submit an Expression of Interest. Invitations go to the highest scorers in each round — recent rounds have cleared 90-100+ points for most occupations.",
    verdict: "false",
    headline:
      "65 points is the MINIMUM to enter the EOI pool — not a guarantee of invitation. Recent Subclass 189 rounds have cleared 90-100+ points for most occupations.",
    truth:
      "Australia's Subclass 189 (Skilled Independent visa) is a points-tested visa for skilled workers without employer / state / family sponsorship. The minimum to submit an Expression of Interest (EOI) is 65 points. Department of Home Affairs runs invitation rounds (typically monthly, but volume + cadence vary by year). Invitations are issued to the highest-scoring EOIs within each occupation pro-rata to the annual ceiling. 2024-2025 invitation rounds for Subclass 189 have been very limited — many quarters with zero invitations issued — because the government has prioritised Subclass 190 (state-nominated, +5 points) and Subclass 491 (regional-sponsored, +15 points) over fully unsponsored 189. Where 189 invitations have issued, cut-offs have ranged 90-105 points for most occupations and higher for high-demand fields. The 65-point minimum is essentially a filter to keep the EOI pool manageable; the invitation cut-off is determined by competitive demand. Subclass 190 and 491 cut-offs are typically lower because of state-nomination boost — but require state sponsorship (separate application + state criteria + commitment to live in that state for 2+ years).",
    whyExists:
      "Migration agents marketing the points test as a hurdle to clear ('if you make 65, you qualify') downplays the competitive invitation phase that follows. Plus older versions of the points test (pre-2017) were more linear, creating outdated impressions.",
    whatToDo: [
      "Calculate honest points using the immi.homeaffairs.gov.au points calculator — include age, English (IELTS / PTE), education, skilled work experience, partner skills, professional year",
      "If under 90 points, focus on boost factors: PTE 79+ in all 4 components (+20), professional year program (+5), partner skills (+10), regional study (+5)",
      "Consider Subclass 190 state-nominated (+5) — apply to specific state sponsorship programs (NSW, Victoria, Queensland, WA, SA, Tasmania, NT, ACT)",
      "Consider Subclass 491 regional (+15) — but commit to 3 years living + working in a designated regional area",
      "Skills Assessment by your occupation's assessing authority (e.g. ACS for IT, EA for engineers) is mandatory + takes 6-12 weeks",
      "EOI lasts 2 years — improve your score during that window if not invited",
    ],
    sources: [
      { label: "Australia DHA — Skilled Independent Visa (subclass 189)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189" },
      { label: "Australia DHA — Points table", url: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/points-tables" },
      { label: "Australia DHA — Recent SkillSelect invitation rounds", url: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds" },
    ],
    lastVerified: VERIFIED,
    countries: ["AU"],
    visa: "Subclass 189",
  },
  {
    slug: "au-whv-multiple-times",
    question: "Can I do the Australian Working Holiday Visa multiple times?",
    metaDescription:
      "Yes — up to 3 consecutive years, but each year after the first requires specified regional / agricultural / construction work in the prior year. The age cap is 30 (35 for some nationalities).",
    verdict: "true_but",
    headline:
      "WHV is renewable to 2nd + 3rd year IF you've done 3 + 6 months of specified work (regional / agricultural / construction / tourism / hospitality / fishing). Age cap 30 (35 for UK, CA, FR, IE, IT — under recent expansions).",
    truth:
      "Australia's Working Holiday programme operates through two visas: Subclass 417 (Working Holiday — for ~18 specified countries: UK, Belgium, Canada, Cyprus, Denmark, Estonia, Finland, France, Germany, Hong Kong, Ireland, Italy, Japan, South Korea, Malta, Netherlands, Norway, Sweden, Taiwan) and Subclass 462 (Work and Holiday — for ~40+ other countries with more specific quotas + sometimes English / education requirements: US, China, Vietnam, Indonesia, Argentina, etc.). First-year visa: 12 months, can work for any employer up to 6 months. Second-year visa: must have completed 3 months of specified work (regional agricultural work, mining, construction, tourism / hospitality in remote areas, fishing) during the first year. Third-year visa: must have completed 6 months of specified work during the second year. Age cap is generally 18-30 inclusive (must be under 31 at application) — extended to 18-35 inclusive for UK, Canada, France, Ireland, Italy under recent reciprocal upgrades. Each visa is AUD $670 (FY2024-25). Specified work is verified via the employer using a 1263 form. Recent reforms have tightened verification after 2022-23 fraud cases (fake regional-work certificates).",
    whyExists:
      "WHV is genuinely flexible compared to most countries' equivalents (German WHV is 1 year only, NZ WHV is 12-23 months). The 3-year extension is real but the specified-work requirement gets understated in casual conversation.",
    whatToDo: [
      "Check eligibility against your nationality (417 vs 462 — different rules + quotas)",
      "Apply 12+ months before intended travel — first WHV grants take 1-30 days but quotas can fill",
      "Plan specified work in regional postcodes BEFORE doing it — only work in eligible postcodes counts (immi.homeaffairs.gov.au has the list)",
      "Get employer to complete Form 1263 + sign certifying your specified work — keep payslips + bank statements as backup",
      "If you turn 31 during 1st-year WHV, you can still extend to 2nd / 3rd year (the cap is at first application, not renewal)",
      "After WHV ends, switch options: Subclass 482 (employer-sponsored), Skilled Independent 189, Partner visa 309/820",
    ],
    sources: [
      { label: "Australia DHA — Working Holiday visa (subclass 417)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417" },
      { label: "Australia DHA — Work and Holiday visa (subclass 462)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462" },
      { label: "Australia DHA — Specified work for second and third Working Holiday visa", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417/specified-work-conditions" },
    ],
    lastVerified: VERIFIED,
    countries: ["AU"],
    visa: "Working Holiday (417 / 462)",
  },

  // ════════════════════════════════════════════════════════════════
  // SPAIN — Golden Visa, DNV, NLV
  // ════════════════════════════════════════════════════════════════
  {
    slug: "es-golden-visa-still-open",
    question: "Is the Spanish Golden Visa still available for real-estate investment?",
    metaDescription:
      "No. Spain ended the real-estate route of its Golden Visa on 3 April 2025. Other Golden Visa investment routes (capital, business, public debt) remain active but with stricter checks.",
    verdict: "false",
    headline:
      "Spain ended the real-estate Golden Visa on 3 April 2025. The capital / business / public-debt / share investment routes survive — but with EU-driven anti-money-laundering scrutiny.",
    truth:
      "Spain's Golden Visa (Visado de Residencia para Inversores) was introduced in 2013 to attract foreign investment. The real-estate route — €500k+ property purchase — was the most popular, used heavily by Russian, Chinese, Venezuelan, Iranian, US, and UK investors. Following European Commission pressure on Golden Visa schemes (Malta, Cyprus, Portugal Golden Visa real-estate route similarly closed), Spain passed legislation in April 2024 to terminate the real-estate route, with full effect from 3 April 2025. Surviving Golden Visa investment routes: (1) €1M+ in Spanish company shares; (2) €1M+ in Spanish bank deposits; (3) €2M+ in Spanish government bonds; (4) €1M+ in Spanish investment funds; (5) business project investment of public interest creating employment / generating socio-economic impact / scientific / technological contribution (no fixed amount but typically €1M+). Each route requires applicant to maintain investment for 5 years, plus standard Golden Visa requirements: private health insurance, sufficient income, clean criminal record. Golden Visa provides 3-year initial residence, renewable, leading to permanent residence at 5 years + Spanish citizenship at 10 years (1-2 years for Iberoamerican / Sephardic Jewish / Filipino / Andorran / Equatoguinean applicants).",
    whyExists:
      "Marketing materials produced before April 2024 are still circulating; immigration agencies continued to advertise the real-estate route during the transition. The phased end-date (April 2025) created confusion vs immediate termination.",
    whatToDo: [
      "Check the alternative Golden Visa routes — capital / business investment / public debt remain active",
      "Consider Spain's Non-Lucrative Visa (€2,400/month passive income proof) for those wanting residence without investment",
      "Spain's Digital Nomad Visa (€2,646+/month from foreign remote employer) is the most accessible for working applicants",
      "If you bought Spanish property under the old Golden Visa, your existing residence permit is valid until expiry + renewable under transition rules",
      "Avoid any agency still advertising the real-estate Golden Visa as available — they're operating outdated information",
    ],
    sources: [
      { label: "Spain Investment in Spain — Golden Visa", url: "https://www.investinspain.org/en/invest-spain/work-and-live/golden-visa" },
      { label: "Spain Ministry of Foreign Affairs — Visado para Inversores", url: "https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Visa-Inversor.aspx" },
      { label: "Spain BOE — Real estate Golden Visa termination law", url: "https://www.boe.es/" },
    ],
    lastVerified: VERIFIED,
    countries: ["ES"],
    visa: "Golden Visa",
  },
  {
    slug: "es-dnv-tax-free",
    question: "Does Spain's Digital Nomad Visa exempt you from Spanish taxes?",
    metaDescription:
      "No. DNV holders are Spanish tax residents from day 183. The Beckham Law special regime can reduce tax to a 24% flat rate on Spanish-source income — but it doesn't eliminate Spanish tax.",
    verdict: "mostly_false",
    headline:
      "DNV holders are Spanish tax residents from day 183. You can opt into the Beckham Law special regime — 24% flat rate on Spanish-source income up to €600k — but foreign-source income is also taxable under standard rules.",
    truth:
      "Spain's Digital Nomad Visa (Visado para Teletrabajo Internacional, launched January 2023) permits remote work for foreign employers. Initial 1-year residence, renewable to 5 years, leads to Permanent Residence eligibility. Income requirement: ~€2,646/month gross (200% of Spanish minimum wage SMI) for the principal applicant + 75% SMI per dependent. Source: at least 80% of income must come from companies established outside Spain. Spanish tax treatment: DNV holders become Spanish tax residents from day 183 in any calendar year. Default treatment: standard Spanish progressive income tax (19% to 47%) on worldwide income, plus Spanish wealth tax for high-net-worth, plus Modelo 720 reporting on overseas assets above €50k. Beckham Law (Régimen especial para trabajadores desplazados — Article 93 LIRPF) is a special expat-tax regime that DNV holders can opt into within 6 months of becoming Spanish tax residents. Under Beckham: flat 24% on Spanish-source income up to €600k, 47% above; foreign-source income generally NOT taxed in Spain; no wealth tax on foreign assets. Duration: 6 years (year of move + 5 more). Beckham Law eligibility: not a Spanish tax resident in the 5 prior years, moving to Spain for new employment / DNV / director appointment.",
    whyExists:
      "Marketing for DNV emphasises the 24% Beckham tax rate, often framing it as the standard or default treatment. The reality — opt-in within 6 months, foreign-source still potentially complex, 6-year cap — is technical.",
    whatToDo: [
      "Engage a Spanish tax advisor (asesor fiscal) in the first 3 months of arrival to file your Modelo 030 + Beckham Law election if eligible",
      "Apply for Beckham Law via Modelo 149 within 6 months of becoming a Spanish tax resident — late applications are rejected",
      "Keep records of all foreign-source income separately — even under Beckham, certain foreign income (e.g. Spanish-payroll director fees) can still be Spanish-taxable",
      "Plan exit if you want to avoid Spanish tax in year 7 — Beckham ends after 6 years, then full Spanish progressive tax applies",
      "Note Modelo 720 reporting obligation on foreign assets — penalties for non-disclosure can be punitive",
    ],
    sources: [
      { label: "Spain Inclusión, Seguridad Social y Migraciones — Visado para Teletrabajo Internacional", url: "https://extranjeros.inclusion.gob.es/" },
      { label: "Spain Agencia Tributaria — Régimen especial trabajadores desplazados (Beckham)", url: "https://sede.agenciatributaria.gob.es/" },
      { label: "Spain Investment in Spain — Digital Nomad Visa", url: "https://www.investinspain.org/en/invest-spain/visas/digital-nomad-visa" },
    ],
    lastVerified: VERIFIED,
    countries: ["ES"],
    visa: "Digital Nomad Visa",
  },

  // ════════════════════════════════════════════════════════════════
  // PORTUGAL — D7, D8, Golden Visa
  // ════════════════════════════════════════════════════════════════
  {
    slug: "pt-d7-passive-income-easy",
    question: "Is the Portuguese D7 visa available to anyone with passive income?",
    metaDescription:
      "The D7 requires verifiable passive income (typically €870+/month) plus accommodation in Portugal, private health insurance, clean criminal record, and Portuguese tax-number registration.",
    verdict: "partial",
    headline:
      "The D7 is genuinely accessible vs many EU residence routes — but requires €870+/month minimum passive income (raised to ~€1,100 in 2025), Portuguese accommodation, and a 24/7 Portuguese tax residency commitment for tax purposes.",
    truth:
      "Portugal's D7 visa (Visto Tipo D para Aposentados, Religiosos ou que vivam de Rendimentos próprios — colloquially 'Passive Income visa' or 'Retirement visa') has been Portugal's most-used long-stay residence route for non-EU retirees and passive-income earners. Eligibility: (1) verifiable passive income — pensions, rental income, dividends, royalties, interest — at minimum 100% of Portuguese minimum wage (€870/month for principal applicant in 2024, raised to ~€1,100 in 2025; +50% per adult dependent; +30% per minor dependent); (2) Portuguese accommodation contract (rental or owned); (3) Portuguese tax number (NIF); (4) clean criminal record from country of origin + any country lived in for 1+ years; (5) private health insurance covering Portugal + Schengen; (6) Portuguese bank account with the equivalent of 12 months' minimum-wage deposit recommended. Application initially via the Portuguese consulate in country of residence, then SEF (now AIMA — Agency for Integration, Migrations and Asylum) in Portugal for residence-permit issuance. Initial 2-year permit, renewable for 3 years, then eligible for Permanent Residence at 5 years + Portuguese citizenship at 5 years (Portugal reduced citizenship residency to 5 years in 2024). Portuguese tax residency from day 183 — applicants typically opt into the Non-Habitual Resident (NHR) regime (10% flat tax on Portuguese-source income for 10 years for new arrivals registering by end of 2024; closed to new entrants from 2025).",
    whyExists:
      "Portugal's marketing as 'Europe's most accessible residence' and pre-2024 NHR tax benefits drove D7 popularity. The application bureaucracy + accommodation + tax complexity get understated in lifestyle media.",
    whatToDo: [
      "Confirm your income meets the latest minimum (check AIMA — the threshold updates with Portuguese minimum wage)",
      "Get a Portuguese tax number (NIF) via a Portuguese fiscal representative — this is required BEFORE the visa application",
      "Open a Portuguese bank account + deposit 12 months' minimum-wage equivalent — banks may require physical presence",
      "Secure accommodation — rental contract or property purchase — required for visa stage AND for residence permit stage",
      "Apply at the Portuguese consulate in your country of residence (NOT in Portugal as tourist)",
      "Plan tax residency carefully — D7 + Portuguese tax resident status interacts with home-country tax treaties; consult a Portuguese tax advisor",
    ],
    sources: [
      { label: "Portugal AIMA — Residence permit", url: "https://www.aima.gov.pt/" },
      { label: "Portugal SEF (historical) — Tipo D visa", url: "https://www.sef.pt/" },
      { label: "Portugal Tax Authority — Non-Habitual Resident regime", url: "https://info.portaldasfinancas.gov.pt/" },
    ],
    lastVerified: VERIFIED,
    countries: ["PT"],
    visa: "D7",
  },
  {
    slug: "pt-golden-visa-real-estate-still-open",
    question: "Can you still get a Portuguese Golden Visa through real-estate?",
    metaDescription:
      "No. Portugal closed the real-estate Golden Visa route in October 2023. Investment fund (€500k+), scientific research (€500k+), and cultural / artistic patronage routes remain.",
    verdict: "false",
    headline:
      "The Portugal Golden Visa real-estate route closed in October 2023. Investment fund subscriptions (€500k+ in Portuguese-registered venture capital funds), scientific research donations, and cultural patronage remain active.",
    truth:
      "Portugal's Golden Visa (Autorização de Residência para Atividade de Investimento — ARI) launched in 2012 and was Europe's most popular real-estate-driven Golden Visa. Real-estate routes — €280k-€500k+ depending on property location + age — were used heavily by Chinese, Brazilian, US, South African, Turkish, and Russian investors. Following EU Commission pressure (similar to Spain, Cyprus, Malta), Portugal terminated all real-estate Golden Visa routes via the 'Mais Habitação' law on 7 October 2023. Surviving Golden Visa routes: (1) Investment fund subscription — €500k+ in a Portuguese-registered venture capital / private equity fund with at least 60% of holdings in Portuguese companies; (2) Scientific research donation — €500k+ to public or private research institutions; (3) Cultural or artistic patronage — €250k+ donation to support or restore Portuguese cultural heritage; (4) Job creation — investment creating 10+ permanent jobs (5 jobs in low-density areas) with €500k+ investment; (5) Business activity — €500k+ investment in an existing or new Portuguese business. Golden Visa provides 1-year initial residence renewable to 2-year and 5-year, leading to Permanent Residence + Portuguese citizenship at 5 years. Minimum stay 7 days year 1, 14 days years 2-5.",
    whyExists:
      "Real-estate Golden Visa marketing dominated the 2010s — agencies continue to promote 'Portugal residence by property' even though the route closed in 2023. Plus the broader Golden Visa branding obscures which sub-routes remain.",
    whatToDo: [
      "Confirm any agency offering 'real-estate Golden Visa' is dishonest — this route closed October 2023",
      "Investment fund route (€500k+) is the dominant new path — engage a Portuguese investment advisor + fund manager for due diligence",
      "Cultural patronage route (€250k+) is the lowest-cost surviving option — restricted to qualifying cultural / heritage projects",
      "Existing Golden Visa holders with real-estate are grandfathered — your residence remains valid + renewable under transition rules",
      "Portuguese citizenship clock for Golden Visa is 5 years (Portugal reduced general residence-citizenship from 6 to 5 in 2024) + language A2 + clean criminal record",
    ],
    sources: [
      { label: "Portugal AIMA — Authorisation of Residence for Investment Activity (ARI)", url: "https://www.aima.gov.pt/" },
      { label: "Portugal Mais Habitação law (closure of real-estate Golden Visa)", url: "https://www.portugal.gov.pt/pt/gc23/comunicacao/noticia?i=mais-habitacao-entra-em-vigor" },
      { label: "Portugal Permits and visas", url: "https://eportugal.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal" },
    ],
    lastVerified: VERIFIED,
    countries: ["PT"],
    visa: "Golden Visa",
  },

  // ════════════════════════════════════════════════════════════════
  // UAE
  // ════════════════════════════════════════════════════════════════
  {
    slug: "ae-golden-visa-instant",
    question: "Is the UAE Golden Visa granted instantly to anyone buying a Dubai apartment?",
    metaDescription:
      "The 10-year Golden Visa real-estate route requires AED 2M (~USD $545k) in property, paid in cash or with at least 50% equity. Not instant — application + due diligence take 4-12 weeks.",
    verdict: "mostly_false",
    headline:
      "AED 2M+ real-estate purchase qualifies for a 10-year Golden Visa — but the 2M threshold (raised from AED 1M in 2022), cash + 50%-equity rules, and 4-12 week processing get understated in property marketing.",
    truth:
      "The UAE Golden Visa (10-year renewable residence) was launched in 2019 and substantially reformed in 2022. Real-estate route requirements: (1) Owned UAE property of AED 2,000,000 minimum value (~USD $545k); (2) Purchased outright in cash OR with at least AED 2M paid from own equity (mortgage allowed for the balance from approved UAE banks); (3) The property must be a single unit, not aggregated across multiple smaller properties; (4) Property must be under your name (not a corporate vehicle) for the residence rights to apply. Plus standard requirements: medical fitness test, valid passport, Emirates ID, sponsor (none required — Golden Visa is self-sponsored). Application via Dubai Land Department + GDRFA (Dubai) or ICA (Abu Dhabi) — processing typically 4-12 weeks. Cost ~AED 2,800-4,000 in government fees, plus typical agency fees. Golden Visa real-estate route does NOT confer Emirati citizenship — residence only. Holder + spouse + unmarried adult children + dependent parents + domestic workers can all be sponsored. Investor route (AED 2M+ in approved funds or businesses), Skilled Worker route (specific eligible occupations with salary AED 30,000+/month), Outstanding Talent route (extraordinary achievement) also exist.",
    whyExists:
      "Dubai property developers + brokers market the Golden Visa as a near-automatic perk of property purchase. The AED 2M threshold + cash / equity rules get glossed over in sales pitches focused on entry-level AED 800k-1.5M apartments.",
    whatToDo: [
      "Verify the property's market value via Dubai Land Department (DLD) — purchase price must be at or above AED 2M to qualify",
      "If financing the property, ensure the cash deposit + equity stake reaches AED 2M (not just total mortgage amount)",
      "Engage a typing centre or immigration consultant licensed by GDRFA / ICA — these are the official intermediaries",
      "Plan medical fitness test + Emirates ID issuance — these are required steps after visa approval",
      "Family members do NOT require separate property — sponsor them under your Golden Visa once issued",
      "Note: Golden Visa does NOT mean UAE citizenship — UAE rarely naturalises foreigners + dual citizenship is constrained for Emiratis",
    ],
    sources: [
      { label: "UAE GDRFA Dubai — Golden Visa", url: "https://www.gdrfad.gov.ae/en" },
      { label: "UAE ICA Abu Dhabi — Golden Residence", url: "https://www.icp.gov.ae/en/" },
      { label: "UAE The Official Portal — Golden Visa", url: "https://u.ae/en/information-and-services/visa-and-emirates-id/types-of-visa/golden-visa" },
    ],
    lastVerified: VERIFIED,
    countries: ["AE"],
    visa: "Golden Visa",
  },

  // ════════════════════════════════════════════════════════════════
  // JAPAN
  // ════════════════════════════════════════════════════════════════
  {
    slug: "jp-hsp-points-fast-pr",
    question: "Does the Japanese Highly Skilled Professional visa give Permanent Residence in 1 year?",
    metaDescription:
      "Yes — HSP holders scoring 80+ points can apply for Permanent Residence after 1 year. Holders at 70+ points can apply after 3 years. Otherwise normal PR requires 10 years.",
    verdict: "true_but",
    headline:
      "HSP at 80+ points = PR after 1 year. HSP at 70+ points = PR after 3 years. Standard residence = 10 years to PR. But the points calculation is rigorous and 80+ is competitive.",
    truth:
      "Japan's Highly Skilled Professional (HSP) visa (Subclass i, ii, iii based on activity type — academic, technical, business management) operates on a points-based system. Points are awarded for: educational qualifications (10-30), professional experience (5-25), annual salary (10-40), age (5-15 for younger applicants), Japanese language proficiency (10-15 for N1, 5-10 for N2), bonus for working at startups / SMEs designated as Highly Sophisticated, bonus for working in Specially Designated Strategic Areas. Total minimum 70 points to qualify. HSP holders enjoy: (1) accelerated Permanent Residence — 1 year residence for 80+ points, 3 years for 70+ points (vs 10-year standard); (2) automatic 5-year residence permit; (3) preferential immigration processing; (4) ability to bring spouse for work; (5) ability to bring parents under specific conditions; (6) ability to hire domestic helper. The 80+ score is genuinely challenging — typically requires a graduate degree, 10+ years of experience, salary above JPY 10-15M/year, and N2+ Japanese. Many HSP applicants score 70-79 and get the 3-year PR route. Recent reform: Japan introduced the J-Find (job-seeker for top-university grads) and J-Skip (income-based PR fast-track) visas in 2023 to complement HSP — J-Skip allows JPY 20M+/year earners with research / 10-year experience to apply for PR immediately.",
    whyExists:
      "HSP genuinely IS the fastest PR route in Japan compared to other developed economies — even at 70 points, 3 years to PR is faster than most EU / Anglo countries. The headline 1-year route is real but understates how few candidates hit 80+.",
    whatToDo: [
      "Calculate your HSP points honestly using the Immigration Services Agency (ISA) points table",
      "If you're at 60-70, focus on boosts: JLPT N2 (5-10 points), JLPT N1 (10-15 points), graduate degree (+10), business at SME (+10)",
      "JPY 10M+/year salary unlocks 25-40 points — negotiate aggressively at the offer stage",
      "Apply via ISA — processing 1-3 months for HSP visa, then PR application after 1 or 3 years of HSP status",
      "Consider J-Skip if you earn JPY 20M+/year and have 10+ years experience — this is immediate PR + spouse work rights",
      "Japan permits dual citizenship for the children of mixed marriages up to age 22 — after that one must be chosen",
    ],
    sources: [
      { label: "Japan ISA — Highly Skilled Professional", url: "https://www.isa.go.jp/en/applications/procedures/index.html" },
      { label: "Japan ISA — Points calculation", url: "https://www.moj.go.jp/isa/applications/procedures/i-2-3.html" },
      { label: "Japan ISA — J-Skip and J-Find", url: "https://www.isa.go.jp/en/applications/procedures/jskip.html" },
    ],
    lastVerified: VERIFIED,
    countries: ["JP"],
    visa: "Highly Skilled Professional",
  },

  // ════════════════════════════════════════════════════════════════
  // SOUTH KOREA
  // ════════════════════════════════════════════════════════════════
  {
    slug: "kr-keta-required-everyone",
    question: "Does everyone need K-ETA to enter South Korea?",
    metaDescription:
      "No. K-ETA is required for ~110 visa-free nationalities, but currently waived (through Dec 2025) for ~22 countries including the US, UK, Japan, Germany, France, Australia, NZ, Singapore.",
    verdict: "partial",
    headline:
      "K-ETA was required for all visa-free travellers from 2021 — but currently WAIVED through December 2025 for ~22 high-tourism source countries including the US, UK, EU members, Japan, Australia, NZ, Singapore.",
    truth:
      "K-ETA (Korea Electronic Travel Authorisation, KRW 10,000 / ~USD $7.50, valid 3 years, multiple entries) was introduced September 2021 as a pre-travel screening system for the ~110 nationalities that travel to South Korea visa-free for short stays. Following declining post-COVID tourism, the South Korean Ministry of Justice introduced a K-ETA waiver programme from April 2023, initially through December 2024 and extended through 31 December 2025. The waiver currently applies to ~22 countries: US, UK, Germany, France, Italy, Spain, Netherlands, Sweden, Denmark, Norway, Finland, Australia, NZ, Canada, Japan, Singapore, Taiwan, Hong Kong, Macau, Belgium, Austria, Greece. Visa-free nationals from waiver countries can enter without K-ETA but must complete the K-Travel Card (an arrival declaration) electronically. K-ETA remains required for ~90 other visa-free nationalities (most Latin American, Caribbean, Middle East, ASEAN, Southern European countries). The waiver does NOT apply to visa-required nationalities — they still need a full Korean visa. Confusion: many traveller-information sites + travel-blog content predates the waiver and incorrectly insists K-ETA is universal.",
    whyExists:
      "K-ETA's introduction in 2021 was heavily publicised, while the waiver expansion has been less visible in international media. Korean tourism authorities promoted 'visa-free easy travel' but the K-ETA requirement created friction that wasn't well-explained.",
    whatToDo: [
      "Check your nationality against the K-ETA waiver list before applying (ICAO portal or k-eta.go.kr)",
      "If waived, skip K-ETA — complete the K-Travel Card on arrival or pre-arrival via app",
      "If required (Brazil, Mexico, Argentina, UAE, etc.), apply at k-eta.go.kr at least 72 hours before travel",
      "K-ETA is valid 3 years from issue — re-apply if your passport details change",
      "Travelling for purposes beyond short tourism (business, study, work) requires a different visa class regardless of K-ETA status",
    ],
    sources: [
      { label: "Korea K-ETA official portal", url: "https://www.k-eta.go.kr/" },
      { label: "Korea Ministry of Justice — Immigration policy", url: "https://www.immigration.go.kr/" },
      { label: "Korea Tourism Organization — Entry to Korea", url: "https://english.visitkorea.or.kr/" },
    ],
    lastVerified: VERIFIED,
    countries: ["KR"],
    visa: "K-ETA",
  },

  // ════════════════════════════════════════════════════════════════
  // THAILAND
  // ════════════════════════════════════════════════════════════════
  {
    slug: "th-retirement-visa-anyone-50",
    question: "Can anyone aged 50+ get a Thai Retirement Visa?",
    metaDescription:
      "Thailand's Non-Immigrant O-A Retirement Visa requires age 50+, plus THB 800,000 in a Thai bank for 2+ months OR THB 65,000/month verified income, plus health insurance with USD 100k+ coverage.",
    verdict: "partial",
    headline:
      "Age 50+ is the bare minimum. You also need THB 800,000 in a Thai bank held for 2+ months (or THB 65,000/month income), and mandatory health insurance with USD 100k+ coverage including COVID treatment.",
    truth:
      "Thailand's Non-Immigrant O-A Visa (Retirement) requirements: (1) Aged 50 or older at application; (2) Either THB 800,000 deposited in a Thai bank account for at least 2 months before application (raised to 3 months prior + 5 months after under recent rules — verify with current immigration policy), OR THB 65,000/month verified income (typically pension or annuity), OR a combination totalling THB 800,000/year; (3) Mandatory health insurance — Thai-issued or foreign with Thai-approved equivalent — covering minimum USD 100,000 outpatient + inpatient including COVID-19 treatment; (4) Clean criminal record from country of residence; (5) Medical certificate; (6) Application at Thai consulate in country of residence (NOT in Thailand as tourist). Initial 1-year visa, renewable annually in-country via Immigration Bureau. Cannot work on Retirement Visa. Renewal requires maintenance of financial requirements + 90-day reporting + annual renewal application. Alternative routes for older travellers: Non-Immigrant O Visa (similar but applied for in Thailand by entering on tourist visa first; faster for those already in Thailand), Long-Term Resident (LTR) visa for high-wealth pensioners (USD 80k+/year income or USD 1M+ assets — 10-year visa, more flexible), Elite Visa (premium pay-to-stay programme, 5-20 years, THB 600k-2M cost).",
    whyExists:
      "Thai retirement marketing — 'retire to Thailand for $1,000/month' — gets repeated in lifestyle media without the financial + insurance + 90-day reporting requirements that materially constrain casual retirees.",
    whatToDo: [
      "Confirm you can hold THB 800,000 in a Thai bank for 2-3 months pre-application AND 5 months post-application (or have verifiable THB 65,000/month income)",
      "Get Thai-approved health insurance with USD 100k+ coverage including COVID — list of approved insurers on Thai Health Insurance website",
      "Apply at the Thai embassy in your country of residence, NOT in Thailand on tourist conversion",
      "Plan for annual renewal — Immigration Bureau in Bangkok / Chiang Mai / Pattaya / Phuket handle in-country renewals",
      "Comply with 90-day reporting requirement — failure triggers fines + risks visa cancellation",
      "Consider Long-Term Resident (LTR) Pensioner visa if you have USD 80k+/year income — 10-year visa + work rights + tax benefits + family included",
    ],
    sources: [
      { label: "Thailand Immigration Bureau", url: "https://www.immigration.go.th/" },
      { label: "Thailand BOI — Long-Term Resident Visa", url: "https://ltr.boi.go.th/" },
      { label: "Thailand Ministry of Foreign Affairs — Non-Immigrant Visa", url: "https://www.mfa.go.th/en/home" },
    ],
    lastVerified: VERIFIED,
    countries: ["TH"],
    visa: "Retirement (Non-Imm O-A)",
  },

  // ════════════════════════════════════════════════════════════════
  // INDIA
  // ════════════════════════════════════════════════════════════════
  {
    slug: "in-oci-card-citizenship",
    question: "Is an OCI card the same as Indian citizenship?",
    metaDescription:
      "No. OCI is a lifetime multi-entry visa with most resident rights (except voting + agricultural land + public office) — but not Indian citizenship. India does not permit dual citizenship.",
    verdict: "false",
    headline:
      "OCI is a lifetime multi-entry visa with most resident rights — but NOT Indian citizenship. India does not permit dual citizenship; OCI holders are foreign nationals with permanent visa-like privileges.",
    truth:
      "Overseas Citizen of India (OCI) status was created in 2005 and replaced the earlier Persons of Indian Origin (PIO) scheme in 2015. OCI eligibility: foreign nationals who were Indian citizens at or after 26 January 1950, OR were eligible to become Indian citizens on 26 January 1950, OR who are children / grandchildren / great-grandchildren of such persons, OR who are minor children / spouses of OCI holders / Indian citizens (with at least 2 years of registered marriage). OCI provides: (1) lifetime multi-entry multi-purpose visa to India; (2) no need to register with Foreigner Regional Registration Office (FRRO) for any length of stay; (3) parity with Indian residents for most economic, financial, educational matters; (4) ability to acquire most types of immovable property (except agricultural / plantation / farm land); (5) eligibility for Indian school + university admission as non-NRI category. OCI does NOT provide: (1) Indian citizenship — OCI holders carry the foreign passport they hold; (2) voting rights in Indian elections; (3) eligibility for public office, government jobs, or constitutional posts; (4) right to acquire agricultural land. India does not permit dual citizenship under Constitution Article 9 — accepting OCI does not require renunciation of foreign citizenship, but acquiring Indian citizenship requires renunciation of all other citizenships. Renunciation of Indian citizenship is required if you naturalise as a foreign citizen — the Government of India's Renunciation Certificate (filed via the Indian embassy at USD 175-275) is mandatory before OCI application.",
    whyExists:
      "OCI's lifetime + multi-entry + resident-rights features make it FEEL like citizenship in daily use. Plus government communications promoting 'OCI for the Indian diaspora' sometimes elide the constitutional distinction.",
    whatToDo: [
      "Confirm OCI eligibility via the ancestry / spouse criteria — original birth certificates + Indian passport copies of ancestors required",
      "Renounce Indian citizenship FIRST if you naturalised as a foreign citizen — Renunciation Certificate is required before OCI application",
      "Apply via ociservices.gov.in — processing 6-12 weeks, USD 275 + biometric appointment at Indian consulate",
      "OCI card must be re-issued each time you renew your foreign passport before age 20 + after age 50 — failure can invalidate the OCI",
      "OCI provides most resident rights but you still file as a Non-Resident Indian (NRI) for tax purposes — Indian-source income remains Indian-taxable",
      "OCI cannot be used to vote or contest elections — these remain reserved for Indian citizens",
    ],
    sources: [
      { label: "India Ministry of External Affairs — OCI Services", url: "https://ociservices.gov.in/" },
      { label: "India Ministry of Home Affairs — Citizenship", url: "https://www.mha.gov.in/" },
      { label: "Constitution of India — Article 9", url: "https://www.india.gov.in/" },
    ],
    lastVerified: VERIFIED,
    countries: ["IN"],
    visa: "OCI",
  },

  // ════════════════════════════════════════════════════════════════
  // CHINA
  // ════════════════════════════════════════════════════════════════
  {
    slug: "cn-240-hour-transit-anywhere",
    question: "Can you visit anywhere in China with the 240-hour visa-free transit?",
    metaDescription:
      "No. The 240-hour visa-free transit (10 days) allows visa-free travel only within the province or designated administrative region of entry — not nationwide.",
    verdict: "partial",
    headline:
      "240-hour transit (10 days, December 2024 expansion) allows ~54 nationalities to travel visa-free — but only within the entry province / designated region, not across the entire country.",
    truth:
      "China's 240-hour visa-free transit (the expansion from 144-hour, effective December 2024) applies to citizens of ~54 countries (US, UK, EU members, Japan, South Korea, Australia, NZ, Canada, Singapore, Russia, Brazil, Argentina, Mexico, UAE, and others). Requirements: (1) hold a valid passport from an eligible country; (2) hold a confirmed onward ticket to a THIRD country (not return to country of departure); (3) enter through one of 60 designated entry ports across 24 cities (Beijing PEK + PKX, Shanghai PVG + SHA, Guangzhou CAN, Shenzhen SZX, Chengdu CTU, Xi'an XIY, Kunming KMG, Chongqing CKG, Tianjin TSN, Qingdao TAO, Xiamen XMN, Hangzhou HGH, Nanjing NKG, Dalian DLC, etc.). Critical constraint: the 240-hour transit permits visa-free movement ONLY within the entry province or designated regional zone, not nationwide. Hub provinces (Beijing-Tianjin-Hebei, Yangtze River Delta covering Shanghai-Jiangsu-Zhejiang-Anhui, Pearl River Delta covering Guangzhou-Shenzhen-Macau-Zhuhai-Foshan) allow inter-provincial movement within the cluster. Crossing to a non-included province requires a full Chinese visa. Hong Kong + Macau have separate visa-free entry for most nationalities — practical workaround for short visits, but accessing mainland China via HK still requires a mainland visa or transit eligibility.",
    whyExists:
      "Headlines about '240-hour visa-free China!' don't always explain the province / region restriction. Plus the regional clusters change — Chinese authorities have been expanding eligible zones over 2024-2025.",
    whatToDo: [
      "Confirm your nationality is on the 240-hour eligibility list (54 countries as of December 2024)",
      "Plan onward travel to a THIRD country — round-trip itineraries don't qualify",
      "Check which province / regional cluster your entry city belongs to + plan travel within that zone",
      "For nationwide China travel, apply for an L visa (Tourist) at a Chinese embassy / consulate before travel",
      "Hong Kong + Macau are separate immigration regimes — visiting them doesn't count against the 240-hour clock",
      "Carry printed copies of: passport, return ticket, accommodation booking, and the National Immigration Administration's visa-free transit details",
    ],
    sources: [
      { label: "China NIA — 240-Hour Visa-Free Transit", url: "https://en.nia.gov.cn/" },
      { label: "China Embassy — Visa Information", url: "http://en.nia.gov.cn/" },
      { label: "China Visa Application Service Center", url: "https://www.visaforchina.cn/" },
    ],
    lastVerified: VERIFIED,
    countries: ["CN"],
    visa: "Visa-free transit",
  },

  // ════════════════════════════════════════════════════════════════
  // SINGAPORE
  // ════════════════════════════════════════════════════════════════
  {
    slug: "sg-employment-pass-guaranteed-pr",
    question: "Does an Employment Pass in Singapore lead to PR automatically?",
    metaDescription:
      "No. Singapore PR is at ICA's discretion. Many EP holders never get PR despite multiple applications. Success depends on salary level, family ties, length of residence, education, and demand-supply by sector.",
    verdict: "false",
    headline:
      "Singapore PR is at ICA's discretion — even high-earning EP holders are routinely refused. Success depends on salary tier, sector demand, education, family ties to Singapore, and the year's quota.",
    truth:
      "Singapore Permanent Residence is granted at the Immigration & Checkpoints Authority's (ICA) discretion via the Professional, Technical Personnel, and Skilled Workers (PTS) scheme. Employment Pass (EP) holders are eligible to apply — typically after 6 months of EP residence, but most successful applicants apply after 2-5 years. Application is via the e-PR portal at ica.gov.sg. There is no public scoring rubric; ICA assesses: (1) salary level — EP holders earning SGD $10k+/month at COMPASS or Tech.Pass earn substantially higher PR approval rates; (2) sector — finance, technology, healthcare, biomedical research have priority over generalist roles; (3) education — Singapore degrees + master's / PhD weighted favourably; (4) family ties — Singaporean spouse / children significantly boost; (5) length of EP residence in Singapore; (6) economic + social contribution. Annual PR quota is not published but is implicitly capped — Singapore aims for 30,000 new PR / 22,000 new citizens per year. EP holders applying without family ties or specialist sector backgrounds often receive multiple refusals (3-4 attempts is not uncommon, each with a 6-month minimum waiting period). Refusals do NOT include reasons. Singapore PR provides full residence rights, employment rights, CPF account, eligibility for HDB resale flats, and a path to citizenship after 2 years.",
    whyExists:
      "Recruitment marketing — 'Singapore Employment Pass = step to PR' — over-simplifies. Plus high-profile success stories of fast-tracked tech executives create the impression of an easier path than the median.",
    whatToDo: [
      "Maximise your COMPASS score (introduced 2023) — salary, qualifications, employer profile, sector diversity points",
      "Build documented Singapore ties — long-term lease, local clubs, charitable contributions, children in Singapore schools",
      "Apply for PR after 2-3 years of EP residence + significant salary growth — earlier applications are weaker",
      "Engage a Singapore immigration consultant for application preparation — they understand ICA's unwritten preferences",
      "If refused, you can re-apply after 6 months — strengthen the application with new salary / employer / qualification data",
      "Consider switching to Tech.Pass (1-year self-sponsored, SGD $20k+/month) or Global Investor Programme (high net-worth, SGD $10M+ investment) for stronger PR positioning",
    ],
    sources: [
      { label: "Singapore ICA — Permanent Residence", url: "https://www.ica.gov.sg/reside/PR" },
      { label: "Singapore MOM — Employment Pass + COMPASS", url: "https://www.mom.gov.sg/passes-and-permits/employment-pass" },
      { label: "Singapore EDB — Tech.Pass + Global Investor Programme", url: "https://www.edb.gov.sg/en/how-we-help/incentives-and-schemes.html" },
    ],
    lastVerified: VERIFIED,
    countries: ["SG"],
    visa: "Employment Pass / PR",
  },

  // ════════════════════════════════════════════════════════════════
  // ITALY
  // ════════════════════════════════════════════════════════════════
  {
    slug: "it-jure-sanguinis-unlimited",
    question: "Can anyone with an Italian-born ancestor claim Italian citizenship by descent?",
    metaDescription:
      "Italian jure sanguinis has no generational limit, but is constrained by 1948 rules (female ancestors before 1948), unbroken citizenship chain, and increasing consular processing times.",
    verdict: "partial",
    headline:
      "Italy permits jure sanguinis citizenship through unlimited generations — but the chain must be unbroken (no renunciation), and pre-1948 female-line claims require Italian court action.",
    truth:
      "Italian citizenship by descent (jure sanguinis) operates under Law 91/1992 — citizens are Italian if their parents, grandparents, great-grandparents, etc. were Italian at the time of the descendant's birth AND no ancestor in the line renounced Italian citizenship before the next descendant's birth. There is no generational limit — claimants have successfully traced citizenship through 5+ generations to 19th-century Italian emigrants to Argentina, Brazil, US, Australia. Critical constraints: (1) Italian unification — pre-1861 (Kingdom of Italy founded) emigrants don't qualify because Italy didn't exist as a state; (2) Naturalisation cutoff — if any ancestor in the chain naturalised as a foreign citizen BEFORE the next descendant in the chain was born, the chain breaks (because they were no longer Italian); (3) 1948 rule — under Article 1 of the 1912 Law (in force until 1948), Italian women could not transmit citizenship to children born before 1 January 1948. Claims via the female line for ancestors born before 1948 require Italian court action (sentenza) rather than administrative processing — typically 1-3 years and €5,000-15,000 in legal fees, but high success rate. Consular processing times for direct male-line claims have lengthened to 2-10+ years in Buenos Aires, São Paulo, Rio, NYC due to volume — many applicants relocate to Italy to apply at the local Comune (5-12 months typical).",
    whyExists:
      "Italian jure sanguinis is genuinely uncommonly generous — most countries limit to 1-3 generations or impose residency requirements. The exceptions (1948 rule + unbroken chain) are less well-known.",
    whatToDo: [
      "Trace ancestry: birth + marriage + death certificates for every ancestor in the chain, plus naturalisation records",
      "If the chain runs through a female ancestor born before 1948, consult an Italian lawyer about the 1948 court route",
      "Verify Italian-side records: Comune di nascita of the original Italian ancestor — request integrale (full) birth certificate",
      "Check for ancestor naturalisation: USCIS Genealogy Service, Argentinian / Brazilian / US Census records, ship-manifest archives",
      "Choose application route: consular (slow, free but multi-year wait) OR relocate-to-Italy + apply at Comune (faster but residence cost)",
      "Apostille all foreign documents per the Hague Convention + arrange certified Italian translation",
    ],
    sources: [
      { label: "Italy Ministry of Interior — Cittadinanza", url: "https://www.interno.gov.it/it/temi/cittadinanza-e-altri-diritti-civili/cittadinanza" },
      { label: "Italy Ministry of Foreign Affairs — Citizenship by Descent", url: "https://www.esteri.it/en/servizi-consolari-e-visti/italiani-all-estero/cittadinanza/" },
      { label: "Italy Law 91/1992 — Citizenship Law", url: "https://www.gazzettaufficiale.it/" },
    ],
    lastVerified: VERIFIED,
    countries: ["IT"],
    visa: "Citizenship by Descent",
  },

  // ════════════════════════════════════════════════════════════════
  // NETHERLANDS
  // ════════════════════════════════════════════════════════════════
  {
    slug: "nl-daft-any-american-business",
    question: "Can any American with a small business get the Netherlands DAFT visa?",
    metaDescription:
      "DAFT (Dutch-American Friendship Treaty) is for US citizens only — minimum €4,500 investment in a Dutch business, plus genuine entrepreneurial activity. Hobby businesses and shell companies are refused.",
    verdict: "partial",
    headline:
      "DAFT requires US citizenship + €4,500 deposit in a Dutch business + genuine entrepreneurial activity. Hobby businesses, shell companies, or 'just a remote consultant' applications are routinely refused.",
    truth:
      "The Dutch-American Friendship Treaty (DAFT, 1956) gives US citizens preferential treatment for entrepreneurship-based residence in the Netherlands. Requirements: (1) US citizenship — DAFT is bilateral, no other nationality qualifies; (2) registered Dutch business — typically a BV (Besloten Vennootschap, the Dutch private limited company) OR a sole proprietorship (eenmanszaak) registered with KvK (Chamber of Commerce); (3) Minimum €4,500 deposited as equity into the Dutch business (held continuously); (4) Genuine entrepreneurial activity — IND (Immigratie- en Naturalisatiedienst) reviews business plans, client contracts, invoicing, business model viability; (5) Adequate health insurance + means of subsistence. DAFT is processed faster than other Dutch entrepreneur routes (typically 2-3 months) and is renewable for 5-year periods. After 5 years, holders qualify for Permanent Residence + Dutch citizenship after 5 years total residence (subject to Dutch language B1 + integration test). DAFT-rejected applicants frequently fall under: (a) hobby businesses with no revenue model; (b) shell companies created purely for visa purposes; (c) lifestyle remote workers with no Dutch business presence; (d) businesses lacking the €4,500 equity (loans don't count); (e) businesses already operated profitably in the US with no Dutch-specific business plan. IND's discretion is real — refusals are common for marginal applications.",
    whyExists:
      "DAFT is marketed by relocation agencies as 'the easy Netherlands route for Americans' — true relative to other routes, but the €4,500 + genuine business + IND review get understated.",
    whatToDo: [
      "US citizens only — Canadian, UK, Irish, Australian citizens look at Highly Skilled Migrant, Startup Visa, or EU Blue Card routes",
      "Register the Dutch business (BV or eenmanszaak) at KvK + open a Dutch business bank account",
      "Deposit €4,500 as equity (not loan) into the business account and keep it there continuously",
      "Prepare a detailed Dutch business plan in English or Dutch — IND reviews business viability + entrepreneurship",
      "Engage a Dutch business consultant + tax advisor for proper BV setup, bookkeeping, and IND application",
      "Maintain ongoing business activity throughout your residence — IND can review at renewal + revoke residence for inactive businesses",
    ],
    sources: [
      { label: "Netherlands IND — Dutch-American Friendship Treaty (DAFT)", url: "https://ind.nl/en/residence-permits/work/self-employed-on-the-basis-of-an-international-agreement" },
      { label: "Netherlands KvK — Chamber of Commerce business registration", url: "https://www.kvk.nl/english/" },
      { label: "Netherlands IND — Self-employed person", url: "https://ind.nl/en/residence-permits/work/self-employed-person" },
    ],
    lastVerified: VERIFIED,
    countries: ["NL"],
    visa: "DAFT",
  },

  // ════════════════════════════════════════════════════════════════
  // MEXICO
  // ════════════════════════════════════════════════════════════════
  {
    slug: "mx-permanent-residency-fast",
    question: "Can you get Mexican permanent residency immediately by depositing money?",
    metaDescription:
      "Mexican Permanent Residency by economic solvency requires ~USD $185,000 in monthly bank balances over 12 months OR ~USD $5,400/month verified pension income — substantially more than the Temporary route.",
    verdict: "partial",
    headline:
      "Permanent Residency by economic solvency requires ~MXN 3.5M (USD $185k) in monthly bank balances over 12 months OR USD $5,400/month verified pension income — much higher than Temporary Residency thresholds.",
    truth:
      "Mexico's residence routes (set under the Migration Law / Ley de Migración + INM regulations) offer two main categories: (1) Temporary Residency (Residente Temporal) — 1-year initial, renewable to 4 years total, then must convert to Permanent. Required: ~MXN 70,000/month verified income over 6-12 months OR ~MXN 1.16M (USD $61k) in bank balances over 12 months OR property in Mexico worth at least MXN 4.6M (USD $245k). (2) Permanent Residency (Residente Permanente) — direct application or post-Temporary conversion. Required (direct): ~MXN 175,000/month income over 6-12 months OR ~MXN 3.5M (USD $185k) in bank balances over 12 months. OR conversion route after 4 years of Temporary Residency. OR family-route (Mexican spouse / parent / child) — these have lower thresholds. Application at Mexican consulate in country of residence FIRST, then complete the residence-card issuance at INM in Mexico within 30 days of entry. Cannot apply for Temporary or Permanent from within Mexico on a tourist FMM. Permanent Residency provides indefinite stay + work rights without sponsor + path to citizenship after 5 years (2 years for spouses of Mexican citizens or those with Mexican children). Mexican citizenship requires Spanish language test + Mexican history / culture exam + renunciation of other citizenships (though Mexico permits dual citizenship in practice for many cases).",
    whyExists:
      "Real-estate marketing in San Miguel de Allende / Puerto Vallarta / Tulum often promises 'easy Mexican residency by property' — true at the lower Temporary threshold + much higher at Permanent. Plus the financial thresholds change with peso fluctuations + INM updates.",
    whatToDo: [
      "Apply at the Mexican consulate in your country of residence — NOT after entering Mexico on a tourist FMM",
      "Prepare 6-12 months of bank statements showing the required average balance — single deposits don't count",
      "Verified pension income (Social Security, pension plan) is often easier than bank-balance route for retirees",
      "Property ownership route: title deeds + property value verification — beware: only properties worth MXN 4.6M+ qualify for Temporary",
      "Plan for in-Mexico completion: 30-day window after entry to complete CURP, fingerprints, residence-card issuance at INM",
      "Engage a Mexican immigration consultant or facilitator — INM regional offices vary in procedures + processing times",
    ],
    sources: [
      { label: "Mexico INM — Tipos de Residencia", url: "https://www.inm.gob.mx/" },
      { label: "Mexico SRE (Foreign Ministry) — Consular Visa Information", url: "https://www.gob.mx/sre" },
      { label: "Mexico Migration Law (Ley de Migración)", url: "https://www.diputados.gob.mx/LeyesBiblio/" },
    ],
    lastVerified: VERIFIED,
    countries: ["MX"],
    visa: "Permanent Residence",
  },

  // ════════════════════════════════════════════════════════════════
  // BRAZIL
  // ════════════════════════════════════════════════════════════════
  {
    slug: "br-mercosur-residency-free",
    question: "Is Brazilian residency free for citizens of Mercosur countries?",
    metaDescription:
      "Mercosur Residency Agreement gives nationals of Argentina, Uruguay, Paraguay, Bolivia, Chile, Colombia, Ecuador, Peru streamlined residence — but not free. Application fees, document apostilles, and renewals apply.",
    verdict: "true_but",
    headline:
      "Mercosur Residence Agreement gives streamlined access for nationals of ~10 South American countries — much easier than visa-required routes, but still requires application, fees (~USD $100-300), and documents.",
    truth:
      "The Mercosur Residence Agreement (2002, in force since 2009) allows nationals of Argentina, Uruguay, Paraguay, Brazil, Bolivia, Chile, Colombia, Ecuador, Peru, and Suriname to apply for 2-year temporary residence in any other member state without proving income, employment, or financial means — only requiring (1) valid passport; (2) birth certificate (apostilled / legalised); (3) clean criminal record from country of residence + countries lived in for 5+ years; (4) valid address in destination country; (5) application fee (varies by country, typically USD $100-300). Brazil receives substantial Mercosur applicants — Argentine + Venezuelan + Uruguayan + Bolivian nationals heavily represented. After 2-year temporary residence + maintained residency, applicants can convert to Permanent Residency. Brazilian citizenship after 4 years of residence + Portuguese language + clean criminal record (or 1 year for those married to Brazilian citizens or with Brazilian children). The Agreement does NOT cover automatic right to work for some categories (some labour-market restrictions remain), nor does it provide free emergency healthcare access (private health insurance is recommended). Venezuelan nationals — temporary residence under the Brazilian government's Operação Acolhida humanitarian response — operate under separate humanitarian protection rather than standard Mercosur.",
    whyExists:
      "Mercosur residency is genuinely revolutionary compared to most regional migration regimes (only the EU's Schengen + free movement is more permissive). The minor fees + apostille requirements get understated in casual conversation.",
    whatToDo: [
      "Verify Mercosur eligibility — Argentina, Uruguay, Paraguay, Bolivia, Chile, Colombia, Ecuador, Peru, Suriname are full members for residence purposes",
      "Apostille your birth certificate + criminal-record certificate from country of residence (Hague Apostille if applicable)",
      "Apply via Brazilian Federal Police (Polícia Federal) regional office — São Paulo, Rio, Brasília, Foz do Iguaçu are common entry points",
      "Pay the registration fee (~BRL 800-1500 / USD $150-300) + bring residence certificate (CRNM) issued within 90 days",
      "Plan for 2-year temporary residence → 3-year extension OR direct conversion to Permanent after 2 years",
      "Brazilian citizenship after 4 years (or 1 year for spouses/parents of Brazilians) requires Portuguese language test + integration",
    ],
    sources: [
      { label: "Brazil Federal Police — Migration", url: "https://www.gov.br/pf/pt-br/assuntos/imigracao" },
      { label: "Brazil Ministry of Foreign Affairs — Mercosur", url: "https://www.gov.br/itamaraty/pt-br" },
      { label: "Mercosur Residence Agreement (Spanish)", url: "https://www.mercosur.int/" },
    ],
    lastVerified: VERIFIED,
    countries: ["BR"],
    visa: "Mercosur Residence",
  },

  // ════════════════════════════════════════════════════════════════
  // INDONESIA
  // ════════════════════════════════════════════════════════════════
  {
    slug: "id-second-home-visa-easy",
    question: "Is Indonesia's Second Home Visa an easy backdoor to Bali residence?",
    metaDescription:
      "Indonesia's Second Home Visa (E33F) requires USD $130,000 deposit in an Indonesian state bank, plus accommodation evidence — substantially stricter than tourist or social visit options.",
    verdict: "mostly_false",
    headline:
      "Second Home Visa requires USD $130k deposit in a state-owned Indonesian bank held for the visa duration (5-10 years) — substantially more expensive than alternative routes.",
    truth:
      "Indonesia's Second Home Visa (E33F, launched October 2023) provides 5 or 10-year multi-entry residence for high-wealth foreigners. Requirements: (1) USD $130,000 (or equivalent) deposited in a designated Indonesian state-owned bank (BNI, BRI, Mandiri, BTN) and held throughout the visa duration; (2) proof of accommodation in Indonesia (rental contract or property ownership); (3) clean criminal record from country of residence; (4) health insurance covering Indonesia. Visa fee: ~USD $200 + visa application costs. Holders can: live in Indonesia indefinitely (within visa term), enroll children in Indonesian schools, access private healthcare. Cannot: work for an Indonesian employer (requires separate Working KITAS), own freehold property (foreign ownership of land is restricted under Agrarian Law 5/1960 — leasehold + corporate vehicles only). Alternative routes that may better suit different needs: Investor KITAS (USD $35k+ business investment, work rights included), B211B Social-Cultural Visa (60-day stays, extendable, no large deposit), KITAS Spouse (marrying an Indonesian — substantially easier), Retirement Visa (55+, USD $18k+/year proven income), Remote Worker Visa E33G (launched 2024, 1-year, USD $60k+ annual foreign-employer income). The E33F Second Home Visa is genuinely useful for wealthy retirees / lifestyle migrants but the USD $130k deposit lock-up materially constrains the candidate pool.",
    whyExists:
      "Bali property + relocation marketing aggressively promotes the Second Home Visa as 'the easy way to Bali residence' — true for those who can lock up USD $130k, but most lifestyle migrants don't have that liquidity.",
    whatToDo: [
      "Confirm USD $130k liquidity availability — funds must be deposited in BNI / BRI / Mandiri / BTN for the visa duration",
      "Secure Indonesian accommodation contract before applying — lease minimum 1 year typically required",
      "Apply via Indonesian embassy / consulate in country of residence — processing 4-8 weeks",
      "Consider alternative routes: Remote Worker Visa (USD $60k+/year income) often better fit for digital nomads",
      "Indonesian property ownership is restricted — Hak Pakai (right of use) leasehold + nominee structures common; consult an Indonesian property lawyer",
      "Visa cancellation triggers if deposit withdrawn — plan financial position accordingly",
    ],
    sources: [
      { label: "Indonesia Directorate General of Immigration", url: "https://www.imigrasi.go.id/" },
      { label: "Indonesia eVisa portal", url: "https://evisa.imigrasi.go.id/" },
      { label: "Indonesia Investment Coordinating Board (BKPM)", url: "https://www.bkpm.go.id/" },
    ],
    lastVerified: VERIFIED,
    countries: ["ID"],
    visa: "Second Home Visa",
  },

  // ════════════════════════════════════════════════════════════════
  // SOUTH AFRICA
  // ════════════════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════════════════
  // TÜRKIYE
  // ════════════════════════════════════════════════════════════════
  {
    slug: "tr-citizenship-investment-250k",
    question: "Can you still get Turkish citizenship for USD $250,000 property investment?",
    metaDescription:
      "No. Turkey raised the property-investment threshold for Citizenship by Investment from USD $250k to $400k in June 2022. Plus 3-year hold requirement, due diligence, and processing checks.",
    verdict: "false",
    headline:
      "Turkey raised the CBI property minimum from USD $250k to $400k in June 2022. The $400k applies to new applications + the 3-year hold requirement is strictly enforced.",
    truth:
      "Turkey's Citizenship by Investment (CBI) program — introduced 2017 — became the world's most popular CBI route, attracting Iranian, Iraqi, Afghan, Pakistani, Russian, Chinese and Ukrainian applicants in volume. Original property threshold was USD $1M (2017), reduced to $250k in 2018 (driving a 600% increase in applications), then raised to USD $400k in June 2022 to address overheated property markets in Istanbul + Ankara + Antalya + Bodrum. Current requirements: (1) USD $400k+ property purchase (single property OR multiple totaling $400k+); (2) property valuation by SPK-licensed valuation firms — over-valuation has been a fraud problem and is now strictly checked; (3) 3-year hold commitment (cannot sell within 3 years of citizenship grant — title registration includes an annotation); (4) clean criminal record from country of residence + Interpol check; (5) due diligence by Turkish General Directorate of Land Registry + Census Affairs; (6) Turkish bank account + USD payment in Turkish lira at official central bank rate. Alternative CBI routes: USD $500k+ in Turkish bank deposit (3-year hold), USD $500k+ in capital investment, USD $500k+ in Turkish government bonds, or job creation for 50+ Turkish citizens. Application via local lawyers + Land Registry + General Directorate of Population and Citizenship Affairs (Nüfus). Processing 3-8 months. Citizenship grants full Turkish passport + family members included. Note: Turkish citizenship requires no residence + no language test — uniquely permissive among CBI programs.",
    whyExists:
      "Pre-June 2022 marketing dominated the diaspora press in Iran, Iraq, Afghanistan, Pakistan, Russia, Ukraine — many websites + agencies continue to advertise the $250k threshold despite the increase. Plus aggressive Turkish property developers benefit from the confusion.",
    whatToDo: [
      "Confirm USD $400k threshold (USD valuation at Turkish central bank conversion rate to TRY)",
      "Engage an SPK-licensed property valuation firm + lawyer experienced with CBI — fraud has triggered application refusals",
      "Property must be held 3 years post-citizenship — title-deed annotation prevents sale, ignore agents offering 'sell-after-1-year' workarounds",
      "Due diligence is real — applicants from PEP (Politically Exposed Person) categories or Interpol-listed nationals face refusal",
      "Family members (spouse + minor children) included in primary application — no separate fee",
      "Turkish citizenship permits dual citizenship + no language test + no residence requirement — among the most permissive globally",
    ],
    sources: [
      { label: "Turkey Directorate General of Population and Citizenship Affairs", url: "https://www.nvi.gov.tr/" },
      { label: "Turkey Investment Office — Citizenship by Investment", url: "https://www.invest.gov.tr/" },
      { label: "Turkey Tapu — Land Registry General Directorate", url: "https://www.tkgm.gov.tr/" },
    ],
    lastVerified: VERIFIED,
    countries: ["TR"],
    visa: "Citizenship by Investment",
  },

  // ════════════════════════════════════════════════════════════════
  // GREECE
  // ════════════════════════════════════════════════════════════════
  {
    slug: "gr-golden-visa-250k-still-available",
    question: "Is the Greek Golden Visa still €250,000 for property?",
    metaDescription:
      "No. Greece raised the Golden Visa threshold to €800,000 in Attica (Athens), Thessaloniki + high-demand islands as of August 2024. Lower-tier regions remain at €250,000-€400,000.",
    verdict: "false",
    headline:
      "Greece raised its Golden Visa property threshold from €250k to €800k in Attica (Athens), Thessaloniki + high-tier islands (Mykonos, Santorini) from August 2024. Lower-tier regions remain at €250-400k.",
    truth:
      "Greece's Golden Visa Program (introduced 2013) operates on a tiered system since the August 2024 reform under Law 5100/2024: (1) Tier 1 (€800,000+) — Attica (Athens + surrounding region), Thessaloniki, Mykonos, Santorini, and islands with 3,100+ population; (2) Tier 2 (€400,000+) — all other Greek municipalities not in Tier 1; (3) Tier 3 (€250,000+) — special preserved tier for property conversions from commercial to residential use + restoration of listed historical buildings (the lowest entry into the program). Plus standard requirements: minimum 80m² apartment OR single property purchase, single property (no aggregation of multiple smaller units), no minimum residence requirement, no Greek language test. Initial 5-year residence permit, renewable indefinitely, leads to Permanent Residence after 5 years + Greek citizenship after 7 years (Greek citizenship requires Greek language B1 + integration test + clean criminal record). Family included: spouse + minor children + dependent parents of both spouses (uniquely generous — Greece is the only EU Golden Visa to include parents of both spouses). Application via the Greek consulate in country of residence + Decentralised Administration office in Greece. Processing 4-6 months typically.",
    whyExists:
      "Property marketing in Greece + agency websites continued to advertise €250k after the August 2024 reform took effect. Plus the tiered system creates confusion — the lower tiers do exist, but only for restoration / preservation purchases.",
    whatToDo: [
      "Confirm which tier applies to your target location BEFORE committing — Attica + Thessaloniki + high-tier islands are €800k",
      "Tier 3 (€250k) requires commercial-to-residential conversion or historical-building restoration — verify property eligibility",
      "Single property purchase only — cannot aggregate multiple smaller units to reach the threshold",
      "Engage a Greek lawyer for due diligence on the property + tax compliance",
      "Family members (spouse, minor children, dependent parents of both spouses) included — uniquely generous",
      "Greek citizenship at 7 years requires B1 Greek + integration test — NOT automatic from residence",
    ],
    sources: [
      { label: "Greece Ministry of Foreign Affairs — Golden Visa", url: "https://www.mfa.gr/" },
      { label: "Greece Migration Policy — Permanent Investor", url: "https://migration.gov.gr/" },
      { label: "Greece Law 5100/2024 — Golden Visa reform (Government Gazette)", url: "https://www.et.gr/" },
    ],
    lastVerified: VERIFIED,
    countries: ["GR"],
    visa: "Golden Visa",
  },

  // ════════════════════════════════════════════════════════════════
  // SWITZERLAND
  // ════════════════════════════════════════════════════════════════
  {
    slug: "ch-permit-easy-eu-blue-card",
    question: "Is the EU Blue Card valid in Switzerland?",
    metaDescription:
      "No. Switzerland is not in the EU and does not participate in the EU Blue Card. Swiss work permits operate under federal + cantonal rules (L, B, C permits) with annual quotas.",
    verdict: "false",
    headline:
      "Switzerland is NOT in the EU and does NOT participate in the EU Blue Card. Swiss work runs through the federal L (short-term), B (residence), C (settlement) permit system with quotas + cantonal approval.",
    truth:
      "Switzerland is uniquely positioned in European immigration — Schengen member (open borders) + EFTA member + EEA-Switzerland Bilateral Agreement on Free Movement of Persons (AFMP) for EU/EFTA nationals + bilateral immigration regimes for third-country nationals. The EU Blue Card (Council Directive 2009/50/EC, revised 2021/1883) is an EU-only instrument — Switzerland never opted in. Swiss work permits for third-country nationals (i.e. non-EU/EFTA) operate under: (1) Federal Foreign Nationals Act (FNIA) + Foreign Nationals Ordinance (VZAE); (2) Annual federal quotas (~8,500 L Permits + 4,500 B Permits in 2024, set annually by Federal Council); (3) Cantonal-level pre-approval — each canton has its own labour-market priority test + processing; (4) Employer-sponsored — labour-market check confirming no qualified Swiss/EU candidate available, salary at regional prevailing wage. L Permit (short-term, 1 year + extensions to 24 months max), B Permit (1-year residence, renewable for 5-year ledger), C Permit (permanent settlement, 5 years for US/Canada nationals + select preferred countries, 10 years standard). EU/EFTA nationals work under the AFMP — no quota, simplified registration, full labour-market access. Citizenship requires 10 years of qualifying residence + B1 in canton language (German/French/Italian/Romansh). Application via cantonal migration office.",
    whyExists:
      "EU + Swiss confusion is common — Switzerland uses CHF instead of EUR, isn't in the EU, but is in Schengen + EFTA. Plus the EU Blue Card's brand recognition in immigration marketing materials gets carelessly applied to Switzerland.",
    whatToDo: [
      "For non-EU/EFTA nationals seeking Swiss work, apply for L or B Permit via Swiss employer + cantonal migration office",
      "Annual quotas fill — apply early in the year for best chance",
      "EU/EFTA nationals enjoy AFMP free movement — no permit needed for short stays, simplified registration for long stays",
      "Salary must meet regional prevailing wage — varies by canton + occupation",
      "C Permit (settlement) requires 5 years for US/Canada + Vatican + Andorra + Monaco + San Marino nationals, 10 years for others",
      "Naturalisation at 10 years + B1 canton language + integration test + clean tax / criminal record",
    ],
    sources: [
      { label: "Switzerland State Secretariat for Migration (SEM)", url: "https://www.sem.admin.ch/sem/en/home.html" },
      { label: "Switzerland Federal Council — Foreign Nationals Act", url: "https://www.admin.ch/" },
      { label: "Switzerland Cantonal Migration Authorities (varies)", url: "https://www.ch.ch/en/working-in-switzerland/" },
    ],
    lastVerified: VERIFIED,
    countries: ["CH"],
    visa: "Work Permit (L / B / C)",
  },

  // ════════════════════════════════════════════════════════════════
  // ISRAEL
  // ════════════════════════════════════════════════════════════════
  {
    slug: "il-aliyah-anyone-jewish-heritage",
    question: "Can anyone with Jewish heritage make Aliyah to Israel?",
    metaDescription:
      "Israel's Law of Return covers Jews + their children + grandchildren + spouses — but documentary evidence is strict. The Chief Rabbinate's Orthodox standard governs religious recognition.",
    verdict: "partial",
    headline:
      "Law of Return covers Jews + children + grandchildren + spouses — but requires Orthodox-recognised documentary evidence. Conversion-based Aliyah is contentious + Reform conversions face extra scrutiny.",
    truth:
      "Israel's Law of Return (1950, amended 1970) grants the right to Aliyah (immigration + citizenship) to: (1) any Jew (defined as having a Jewish mother under Orthodox Halacha OR Orthodox-recognised conversion); (2) children + grandchildren of a Jew; (3) spouses of Jews / children of Jews / grandchildren of Jews. Excluded: those who have actively converted to another religion (since the 1989 Brother Daniel case + 1990s rulings). Application via The Jewish Agency for Israel (Sochnut) consultants in country of residence, then submitted to the Israeli Ministry of Interior. Required evidence: (a) for Jews — documentary proof of Jewish maternal lineage (rabbinical letters, synagogue membership records, ketubah of mother's parents) OR Orthodox conversion certificate from a recognised beit din; (b) for spouses + descendants of Jews — proof of relationship + Jewish ancestor's documentation. Reform + Conservative + Reconstructionist conversions: legally accepted under Law of Return (since 1989 Supreme Court rulings) but disputed by the Chief Rabbinate, affecting marriage + burial rights in Israel. After Aliyah: 'Returning Citizen' status with tax benefits (income tax exemption for 10 years on overseas income for new Olim), free Hebrew Ulpan classes, healthcare immediately, IDF service obligations (typically waived for new Olim aged 22+). Citizenship issued automatically upon Aliyah — no naturalisation process. Olim can also choose Permanent Residence (Ezrachut Toshav) initially with delayed citizenship for those wanting to retain another nationality.",
    whyExists:
      "Aliyah promotion materials from Jewish Agency + Nefesh B'Nefesh + Aish HaTorah emphasise accessibility ('anyone Jewish can move to Israel'). The documentary evidence rigour + Reform-Conservative conversion disputes are real constraints.",
    whatToDo: [
      "Engage Jewish Agency / Sochnut early — they help compile documentation + arrange Aliyah flight",
      "Compile maternal Jewish lineage documentation: synagogue records, ketubah, mother's birth certificate, grandparents' documentation",
      "If converted, ensure the conversion is via a recognised beit din — Orthodox conversions are unproblematic; Reform / Conservative are legally accepted but may face additional scrutiny",
      "Spouses + grandchildren of Jews can make Aliyah even without being Jewish themselves — bring relationship + ancestor documentation",
      "Plan for Hebrew language Ulpan + IDF service (mostly waived for adults) + integration",
      "Israel permits dual citizenship for Olim — you retain your original nationality unless you formally renounce",
    ],
    sources: [
      { label: "Israel Ministry of Aliyah and Integration", url: "https://www.gov.il/en/departments/ministry_of_aliyah_and_integration" },
      { label: "Jewish Agency for Israel (Sochnut)", url: "https://www.jewishagency.org/" },
      { label: "Nefesh B'Nefesh — North American + UK Aliyah", url: "https://www.nbn.org.il/" },
    ],
    lastVerified: VERIFIED,
    countries: ["IL"],
    visa: "Aliyah / Law of Return",
  },

  // ════════════════════════════════════════════════════════════════
  // NEW ZEALAND
  // ════════════════════════════════════════════════════════════════
  {
    slug: "nz-skilled-points-180-guaranteed-pr",
    question: "Does 180 points on NZ's Skilled Migrant Category guarantee a Resident Visa?",
    metaDescription:
      "180 points (post-October 2023 reform) is the minimum to express interest. Selection is at the discretion of Immigration NZ, and queue position depends on occupation, job offer, and category demand.",
    verdict: "mostly_false",
    headline:
      "180 points is the minimum — not a guarantee. INZ runs draws periodically + selection prioritises Green List occupations + verified job offers. Many high-point candidates wait months for Invitation to Apply.",
    truth:
      "New Zealand's Skilled Migrant Category (SMC, reformed October 2023) operates as a points-based Expression of Interest (EOI) → Invitation to Apply (ITA) → Resident Visa pipeline. Points awarded for: (1) Skilled Employment in NZ — 3, 6 or 12 points based on job seniority + salary tier; (2) Qualifications — Tier 1 (PhD), Tier 2 (master's / 6+ years bachelor's), Tier 3 (3-year bachelor's), Tier 4 (NZ Diploma 6 / 7), Tier 5 (NZ Diploma 4 / 5); (3) Occupational registration — 3 points if registered with NZ professional body (NZ Medical Council, Engineering NZ etc.); (4) Income at high multiples of median wage — up to 6 points; (5) Age — 30+ years young attracts 10-15 points; (6) Work experience in NZ. Minimum 180 points to submit EOI. INZ runs selection draws monthly typically. Selection prioritises: Green List occupations (high-demand list — engineering, IT, construction, healthcare), Tier 1-2 jobs, candidates with confirmed NZ job offers. Without a NZ job offer, scoring 180 is very competitive — most successful 2024-2025 ITA recipients had a job offer + at least 200 points. SMC eligibility leads to Resident Visa (permanent residence), eligibility to apply for NZ citizenship after 5 years.",
    whyExists:
      "Pre-October 2023 SMC had different scoring (160 points + EOI). The new 180-point threshold gets quoted without explaining the competitive Invitation phase that follows. Immigration agents marketing 'just hit 180!' over-simplifies.",
    whatToDo: [
      "Confirm your occupation is on the Green List or Long Term Skill Shortage List — these have priority + lower thresholds",
      "Secure a NZ job offer BEFORE submitting EOI — substantially increases ITA chances",
      "Calculate points honestly using the INZ points calculator — claim qualifications, age, experience accurately",
      "Boost points: NZ work experience (+3 per year), occupational registration, NZ qualification (NZ degree adds bonus)",
      "Accredited Employer Work Visa (AEWV) provides a NZ job offer route — work for 2 years then transition to SMC",
      "Plan for 6-12 months EOI → ITA wait + 3-6 months further for Resident Visa decision",
    ],
    sources: [
      { label: "Immigration NZ — Skilled Migrant Category Resident Visa", url: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/skilled-migrant-category-resident-visa" },
      { label: "Immigration NZ — Green List occupations", url: "https://www.immigration.govt.nz/new-zealand-visas/preparing-a-visa-application/working-in-nz/qualifications-for-work/work-to-residence" },
      { label: "Immigration NZ — Points Calculator", url: "https://www.immigration.govt.nz/" },
    ],
    lastVerified: VERIFIED,
    countries: ["NZ"],
    visa: "Skilled Migrant Category",
  },

  // ════════════════════════════════════════════════════════════════
  // VIETNAM
  // ════════════════════════════════════════════════════════════════
  {
    slug: "vn-evisa-all-purposes",
    question: "Does Vietnam's e-visa cover all visit purposes including work?",
    metaDescription:
      "No. Vietnam's e-visa (USD $25 single, $50 multiple, 90 days) covers tourism + business meetings, not work. Working without a Work Permit is a deportation offence.",
    verdict: "false",
    headline:
      "Vietnam e-visa is for tourism + permitted business activities only — NOT work. Working requires a Work Permit + Temporary Residence Card; e-visa work attempts trigger deportation + ban.",
    truth:
      "Vietnam's e-visa system (expanded August 2023 to most nationalities — ~80+ countries) provides 90-day single or multiple-entry electronic visas at USD $25 / $50. Eligible purposes: tourism, family visits, business meetings (not productive work), conferences, exploratory market research, intra-company training, attending trade fairs. NOT eligible: paid work for Vietnamese employers, productive employment, delivery of paid services to Vietnamese clients, journalism (separate Press Card required), missionary or religious activity, education / study (separate visa needed). Working in Vietnam requires: (1) Work Permit (Giấy phép lao động) issued by DOLISA (provincial Department of Labour, Invalids and Social Affairs) — employer-sponsored, requires demonstration of need + Vietnamese-citizen recruitment effort; (2) LB visa (Working visa) issued after Work Permit; (3) Temporary Residence Card (Thẻ tạm trú) for stays beyond 90 days, validity 2-5 years. Exemptions from Work Permit: senior managers of companies established in Vietnam, intra-company transfers for 30 days or less, marriage to Vietnamese citizens, owners of Vietnam-registered companies. Working on e-visa is a violation of the Law on Foreigners' Entry, Exit + Transit (2014) — deportation + 3-year re-entry ban + fine ($300-3,500 USD typical).",
    whyExists:
      "Vietnam's e-visa expansion + low cost makes it feel like a general-purpose entry — many travel + remote-work blogs incorrectly advise digital nomads to enter on e-visa + work for foreign employers, which is a grey area at best.",
    whatToDo: [
      "Confirm your nationality is e-visa eligible — list updated periodically by Vietnamese Ministry of Public Security",
      "Use the official e-visa portal evisa.xuatnhapcanh.gov.vn — not third-party agencies that mark up the fee",
      "For paid work for Vietnamese employer, apply for Work Permit + LB visa BEFORE arrival — DOLISA processing 2-3 months",
      "Remote work for FOREIGN employers while on tourist e-visa is in a legal grey area — Vietnam has not formally legalised digital-nomad working",
      "For paid services to Vietnamese clients, register either as a Vietnamese-employed worker or as a Vietnam-registered company",
      "Working without Work Permit triggers deportation + ban — not worth the risk for short-term financial gain",
    ],
    sources: [
      { label: "Vietnam e-visa portal", url: "https://evisa.xuatnhapcanh.gov.vn/" },
      { label: "Vietnam Ministry of Public Security — Immigration Department", url: "https://xuatnhapcanh.gov.vn/" },
      { label: "Vietnam DOLISA — Work Permit application", url: "https://www.dolisa.gov.vn/" },
    ],
    lastVerified: VERIFIED,
    countries: ["VN"],
    visa: "e-Visa",
  },

  // ════════════════════════════════════════════════════════════════
  // MOROCCO
  // ════════════════════════════════════════════════════════════════
  {
    slug: "ma-residence-easy-after-3-months",
    question: "Do you get Moroccan residence automatically after 3 months as a tourist?",
    metaDescription:
      "No. Tourists must leave Morocco at the 90-day mark or apply for a Carte de Séjour BEFORE day 90 with proof of income, accommodation, and reason for stay. Overstays trigger fines + ban.",
    verdict: "false",
    headline:
      "Tourists must leave by day 90 OR apply for Carte de Séjour BEFORE day 90 with proof of income, accommodation + reason for long stay. There is no automatic conversion + overstays trigger fines + ban.",
    truth:
      "Morocco permits visa-free entry up to 90 days for ~60 nationalities (most of Europe, US, Canada, Australia, NZ, Japan, South Korea, Singapore, Brazil, Argentina, etc.). After 90 days, foreign nationals must either: (1) Leave Morocco — many short-stay visitors do a 'visa run' to Ceuta / Melilla (Spanish enclaves on Moroccan coast, technically EU territory) or to Algeciras / Tarifa Spain by ferry; (2) Apply for Carte de Séjour (residence permit) BEFORE day 90 expires, at the Bureau des Étrangers of the local Préfecture de Police. Carte de Séjour categories: Student, Salaried Worker (employer-sponsored), Self-Employed Worker, Spouse/Family of Moroccan, Visitor (retired person with proven income, ~MAD 5,000-15,000/month equivalent), Investor. Application requires: passport, accommodation evidence (rental contract registered with local authorities), proof of income / pension (MAD 5,000+/month minimum for visitor, higher for working categories), bank certification, photographs, application fee MAD 100. Processing 1-3 months typically. Initial card valid 1 year, renewable for 5-year periods, leads to Permanent Residence after 5 years of legal residence. Overstaying tourist period: fines starting MAD 500/day, possible ban from re-entry. Visa-required nationals (most of Africa, Asia, Middle East) must apply at Moroccan consulate before travel.",
    whyExists:
      "Morocco's casual feel + the convenience of visa-runs to Ceuta makes the 90-day limit feel flexible. Plus Morocco's residence-by-property programmes for European retirees (Tangier, Marrakech, Essaouira) create the impression of easier paths than the formal Carte de Séjour requires.",
    whatToDo: [
      "Track your 90-day clock from entry stamp — overstaying triggers MAD 500/day fine + possible ban",
      "If planning to stay longer, apply for Carte de Séjour BEFORE day 90 at the Préfecture de Police (Service des Étrangers)",
      "Get a registered rental contract — informal accommodation arrangements don't satisfy Carte de Séjour requirements",
      "For 'Visitor' category, prove pension / passive income at MAD 5,000+/month",
      "Visa-required nationals: apply for Moroccan visa at consulate before travel + then Carte de Séjour within first 90 days",
      "Visa-runs to Ceuta / Melilla (Spanish enclaves) or back to Europe are tolerated but not infinitely — Moroccan border officers can refuse re-entry",
    ],
    sources: [
      { label: "Morocco Ministry of Interior — Direction Générale de la Sûreté Nationale", url: "https://www.dgsn.gov.ma/" },
      { label: "Morocco Ministry of Foreign Affairs — Consular Affairs", url: "https://www.consulat.ma/" },
      { label: "Morocco Carte de Séjour (Service Public)", url: "https://www.servicepublic.ma/" },
    ],
    lastVerified: VERIFIED,
    countries: ["MA"],
    visa: "Carte de Séjour",
  },

  // ════════════════════════════════════════════════════════════════
  // EGYPT
  // ════════════════════════════════════════════════════════════════
  {
    slug: "eg-visa-on-arrival-all-nationalities",
    question: "Can everyone get an Egyptian visa-on-arrival at Cairo airport?",
    metaDescription:
      "No. Visa-on-arrival (USD $25, 30 days, single-entry) is available to ~80 nationalities. Many African + Asian nationalities require advance e-visa or consular visa.",
    verdict: "partial",
    headline:
      "VOA is available for ~80 nationalities (US, EU, UK, Canada, Australia, NZ, Japan, Korea, GCC, etc.) — but many African, Asian, and Middle Eastern nationalities need advance e-visa or consular visa.",
    truth:
      "Egypt's Visa-on-Arrival (VOA) at airports + Sharm El-Sheikh + Hurghada + Marsa Alam land borders applies to ~80 nationalities: most of Europe (EU + Switzerland + Norway + Iceland + UK), the US, Canada, Australia, NZ, Japan, South Korea, Singapore, Malaysia, GCC states (Saudi Arabia, UAE, Kuwait, Bahrain, Qatar, Oman — visa-free), several Latin American (Brazil, Argentina, Chile, Mexico — VOA). Single-entry VOA: USD $25, 30 days. Multiple-entry VOA: USD $60, 30-90 days depending on origin. Visa-required nationalities: most of Africa (excluding GCC + Maghreb states), most of Asia (Pakistan, Bangladesh, Sri Lanka, Vietnam, Philippines, etc.), most of Eastern Europe + post-Soviet space, all of Caribbean except a few. For visa-required nationals, Egypt offers: e-Visa via visa2egypt.gov.eg (USD $25, applied 7+ days before travel, valid for 90 days from issue) for ~75 nationalities, OR consular visa at Egyptian embassy in country of residence for others. Special arrangements: Sharm El-Sheikh / Red Sea Riviera entry with Sinai-only stamp (free, 14 days, restricted to Sinai resort areas — does not allow travel to Cairo / Luxor / Aswan). For longer stays: Tourist Residence Permit (renewable up to 6 months), Student Visa, Work Permit (employer-sponsored via Ministry of Labour), Investor Visa (USD $1M+ investment), Property-based residence (proven property purchase USD $50k+).",
    whyExists:
      "Travel guides + booking sites often headline 'Egypt visa-on-arrival for $25' without the nationality caveats. Plus Egypt's tourism authority promotes the VOA route to maximise tourist arrivals.",
    whatToDo: [
      "Check eligibility on the Egyptian Ministry of Foreign Affairs site OR via the e-Visa portal visa2egypt.gov.eg",
      "If eligible for VOA, prepare USD $25 cash (USD payment expected at airport) + passport with 6+ months validity",
      "If not eligible for VOA, apply for e-Visa via visa2egypt.gov.eg at least 7 days before travel",
      "For Sinai-only travel (Sharm El-Sheikh, Dahab, Nuweiba), free 14-day Sinai stamp available — but no Cairo / Nile Valley travel",
      "For long-stay or work, apply for the appropriate residence category at the Mogamma El Tahrir or local immigration office in Cairo",
      "VOA visas can be extended 60 days at local immigration office (Mogamma + regional offices) — no overstay charge if extension requested before expiry",
    ],
    sources: [
      { label: "Egypt Ministry of Foreign Affairs — Visa Information", url: "https://www.mfa.gov.eg/" },
      { label: "Egypt e-Visa Portal", url: "https://www.visa2egypt.gov.eg/" },
      { label: "Egypt Ministry of Interior — Immigration", url: "https://www.moiegypt.gov.eg/" },
    ],
    lastVerified: VERIFIED,
    countries: ["EG"],
    visa: "Visa-on-Arrival",
  },

  // ════════════════════════════════════════════════════════════════
  // SECOND BATCH for under-served countries
  // ════════════════════════════════════════════════════════════════

  // ─── US: H-2A / H-2B agricultural & seasonal ───
  {
    slug: "us-tourism-visa-easy-after-refusal",
    question: "Can I easily get a US visitor visa after a previous refusal?",
    metaDescription:
      "Re-applying after a US visa refusal requires demonstrating material change in circumstances since the refusal. Section 214(b) refusals can be appealed by re-application + new evidence — but high success requires substantive change.",
    verdict: "depends",
    headline:
      "You can re-apply, but you must demonstrate material change since the prior Section 214(b) refusal — new job, new ties, new evidence of intent to return. Mere re-application without change usually refuses again.",
    truth:
      "US B-1/B-2 visitor visa refusals are almost always under INA Section 214(b) — failure to demonstrate the applicant has overcome the presumption of immigrant intent (i.e. the consular officer was not convinced you'll return home). 214(b) is not a permanent bar; it just means THIS application was refused. You can re-apply anytime — but each application requires the $185 fee, in-person interview, and most importantly, demonstration of changed circumstances. What constitutes 'material change': (1) new full-time job in home country (the strongest factor); (2) marriage or new child providing ties to home country; (3) new property ownership; (4) new educational enrolment in home country; (5) new evidence of strong family / business / investment connections requiring your return; (6) clarification of trip purpose with detailed itinerary + invitation letters; (7) demonstration of sufficient funds for the trip + clear return ticket. Re-applying within weeks of refusal without material change almost always refuses again. Re-applying 12+ months later with documented changed circumstances has substantially higher success. Other refusal categories require different action: 221(g) (administrative processing) — wait for processing to complete; 212(a) (inadmissibility) requires a waiver application (Form I-601 / I-601A). Always disclose the prior refusal on the new DS-160 — failing to disclose is grounds for permanent misrepresentation finding (212(a)(6)(C)).",
    whyExists:
      "Consulates rarely explain refusals in detail — the standard 214(b) letter is vague, leading applicants to think 're-applying' is the answer. Plus immigration consultants market 're-application packages' that don't address the underlying ties issue.",
    whatToDo: [
      "Wait at least 6-12 months after refusal before re-applying — long enough to establish meaningful change",
      "Build new ties: full-time employment letter, marriage / family changes, property purchase, business establishment, educational enrolment",
      "Prepare a clear trip purpose with detailed itinerary, accommodation bookings, return ticket, and invitation letters if applicable",
      "Disclose the prior refusal on Form DS-160 — non-disclosure is misrepresentation + permanent bar (INA 212(a)(6)(C))",
      "Consider a US-licensed immigration attorney for borderline cases — DIY re-applications after multiple refusals are rarely successful",
      "Do NOT attempt to enter on another nationality's passport (e.g. dual citizens) without disclosing the US refusal — that's misrepresentation",
    ],
    sources: [
      { label: "US Travel.State.Gov — Visitor Visa Refusals", url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html" },
      { label: "US Travel.State.Gov — Section 214(b) Refusals", url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-denials.html" },
      { label: "USCIS — Inadmissibility Waivers", url: "https://www.uscis.gov/i-601a" },
    ],
    lastVerified: VERIFIED,
    countries: ["US"],
    visa: "B-1/B-2",
  },

  // ─── ZA placeholder so previous one isn't last ───
  {
    slug: "za-critical-skills-list-anyone",
    question: "Can anyone with skills on South Africa's Critical Skills List get the work visa?",
    metaDescription:
      "Critical Skills work visa requires a recognised qualification matching the list, SAQA evaluation, SACPCMP / ECSA / HPCSA registration where applicable, and (since 2022) an employer offer.",
    verdict: "partial",
    headline:
      "Critical Skills Visa requires qualifications matching the published list + SAQA evaluation + professional body registration + (since 2022 reforms) a confirmed South African employer offer.",
    truth:
      "South Africa's Critical Skills Work Visa is governed by the Immigration Act 13/2002 and aligned to the Critical Skills List published by the Department of Home Affairs. The list (~140 critical skills as of the 2022 revision) covers: engineering disciplines, medical specialists, IT specialists, agricultural sciences, business specialists in select fields, academics in priority disciplines. Requirements: (1) qualification matching a listed critical skill at the NQF level specified; (2) qualification evaluated by SAQA (South African Qualifications Authority) — even foreign degrees from top universities require this; (3) registration with the relevant professional body (SACPCMP for construction project managers, ECSA for engineers, HPCSA for healthcare professionals, IRBA for accountants, SAPS for nurses, etc.); (4) since the 2022 reforms — a confirmed offer of employment from a South African employer; (5) police clearance certificate from country of residence + every country lived in for 12+ months; (6) medical certificate. Initial 5-year visa, renewable, leads to Permanent Residence eligibility after 5 years. Application at South African embassy in country of residence (NOT in South Africa as visitor). Processing 4-12 weeks (recent backlogs at high-volume consulates Mumbai, Beijing, London, Lagos). Visa is employer-sponsored — if you leave the role, your visa requires 60-day renewal or switch.",
    whyExists:
      "Pre-2022, the Critical Skills Visa was self-sponsored (no employer needed) — the 2022 reform requiring an employer offer significantly tightened the route. Older information still widely circulates.",
    whatToDo: [
      "Check the current Critical Skills List on dha.gov.za — it's revised every 1-3 years + your qualification must match",
      "Submit qualifications to SAQA for evaluation — 4-8 weeks typical processing",
      "Register with the relevant professional body for your field — engineering, medical, accounting all require this",
      "Secure a South African employer offer before applying (since 2022 reform)",
      "Apply at the South African embassy in your country of residence — NOT in South Africa",
      "Plan for 4-12 week consular processing — Mumbai, Beijing, London, Lagos consulates have backlogs",
    ],
    sources: [
      { label: "South Africa Department of Home Affairs — Critical Skills Visa", url: "https://www.dha.gov.za/" },
      { label: "South Africa SAQA — Foreign qualifications evaluation", url: "https://www.saqa.org.za/" },
      { label: "South Africa Critical Skills List (Government Gazette)", url: "https://www.gov.za/documents/all" },
    ],
    lastVerified: VERIFIED,
    countries: ["ZA"],
    visa: "Critical Skills Work Visa",
  },
];

/** Lookup all country myths for a given ISO2 code. */
export function countryMythsFor(iso2: string): Myth[] {
  const upper = iso2.toUpperCase();
  return COUNTRY_MYTHS.filter((m) => m.countries?.includes(upper));
}

/** Lookup a country myth by slug. */
export function countryMythBySlug(slug: string): Myth | undefined {
  return COUNTRY_MYTHS.find((m) => m.slug === slug);
}

/** All country-myth slugs. */
export function allCountryMythSlugs(): string[] {
  return COUNTRY_MYTHS.map((m) => m.slug);
}

/** Unique country codes that have at least one country-specific myth. */
export function allMythCountries(): string[] {
  const set = new Set<string>();
  for (const m of COUNTRY_MYTHS) {
    for (const c of m.countries ?? []) set.add(c);
  }
  return Array.from(set).sort();
}
