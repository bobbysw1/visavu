/**
 * Route-specific visa-application advice.
 *
 * Each (passport, destination, purpose) cell that's high-traffic gets a
 * fully hand-written advice block — concrete visa names, real money
 * figures, real timelines, bilateral quirks (treaty visas, free-trade
 * exemptions, language-test waivers, ancestry shortcuts).
 *
 * Lookups go: route-specific (this file) → fall back to the generic
 * per-purpose block in visaApplicationAdvice.ts.
 *
 * KEY FORMAT: `${PASSPORT}:${DESTINATION}:${purpose}` — all uppercase
 * ISO 3166-1 alpha-2 for the countries, purpose in lower-case as in
 * the Purpose enum.
 *
 * Coverage strategy: start with the top-50 globally-searched routes
 * (US/GB/CA/AU/NZ/IN/CN/PH/BR/MX heading to the major work, study, and
 * family destinations). Expand as new routes hit volume.
 *
 * Each block is a FULL replacement for the generic block — when present,
 * the advice component renders this in its entirety; the route-specific
 * level of detail (real visa class names, real fees, real bilateral
 * shortcuts) is far more useful than the generic fallback.
 */
import type { Purpose } from "@/lib/types";
import type { AdviceBlock } from "@/content/visaApplicationAdvice";

type RouteKey = `${string}:${string}:${Purpose}`;

export const ROUTE_ADVICE: Partial<Record<RouteKey, AdviceBlock>> = {
  // ════════════════════════════════════════════════════════════════════
  // CANADIAN → AUSTRALIA — work, study, family
  // ════════════════════════════════════════════════════════════════════

  "CA:AU:work": {
    whatCarriesWeight: [
      {
        label: "A specific Australian sponsor + nominated occupation",
        why: "The Subclass 482 (Temporary Skill Shortage) needs an Australian-business sponsor whose nomination is approved for a specific occupation on the Skilled Occupation List. The TSMIT (Temporary Skilled Migration Income Threshold) was raised to AUD$73,150 from 1 July 2024 — your salary must clear it after super, and benchmark against the Australian Annual Market Salary Rate for your role.",
      },
      {
        label: "Skills assessment for trades / regulated occupations",
        why: "Canadian engineers go through Engineers Australia, accountants through CPA Australia / IPA / CAANZ, IT roles through ACS. The assessment is pre-application and can take 4-12 weeks — start it before the visa.",
      },
      {
        label: "Health-insurance OR Reciprocal Health Care Agreement",
        why: "Canada has NO RHCA with Australia — you must hold private health insurance (OVHC) for the full visa duration. Budget AUD$2-5k/year per adult.",
      },
      {
        label: "RCMP Criminal Record Check + character declaration",
        why: "Australia requires police checks from every country lived in 12+ months in the past 10 years. For Canadians, that's the RCMP Criminal Record Check via an accredited fingerprinting company (typically 3-15 days). If you've lived elsewhere — add those police checks early.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Your nominated role + Australian sponsor", prompt: "Name the company, role title, and ANZSCO occupation code. Reference the LMT (Labour Market Testing) the sponsor completed if applicable. 'Software Engineer (ANZSCO 261313) with [Company X], based in Sydney, with offer dated [date]' beats vague descriptions every time." },
      { heading: "2. Your skills assessment", prompt: "If your occupation requires assessment, cite the assessing authority and reference number. Canadian credentials usually map cleanly — flag any gap or supplementary education that earned the assessment." },
      { heading: "3. Why Australia specifically", prompt: "Be specific. Climate / lifestyle is fine but pair it with industry-specific reasons. Sydney's tech sector, Perth's mining, Melbourne's pharma, Adelaide's defence — name the city ecosystem you're entering." },
      { heading: "4. Family + dependents", prompt: "Are you bringing your spouse / partner / kids? Note that Australia's Subclass 482 lets spouses work without restriction (unlike some routes). Mention school-age children and whether you've researched schooling." },
      { heading: "5. Long-term intent + pathway to PR", prompt: "The Subclass 482 leads to Subclass 186 (Employer Nomination Scheme) after 2-3 years for permanent residence. Mention the pathway honestly — Australia rewards genuine long-term intent." },
    ],
    moneySavingTips: [
      "Canadians get an exemption from the English-language test (no IELTS needed) — passport-and-citizenship status is sufficient. Don't pay for IELTS unless your job needs registration with a regulated authority that requires it separately.",
      "Don't accept a salary just over TSMIT — aim well above. Salary 30% over the threshold significantly improves your nomination's chance of approval and accelerates the PR pathway via the Direct Entry stream.",
      "Skip the 'medical insurance bundle' your sponsor might offer — compare against Bupa OVHC, Allianz Care, NIB Working Visa Plan directly. Sponsor markups on OVHC can be 30-50%.",
      "Pay for priority processing (~AUD$1,200) only if your start date is fixed — standard 482 grant is 1-3 months when sponsor + skills assessment + biometrics + medical are in good order.",
      "Apply for the Australian Tax File Number (TFN) on arrival day. Without it, your first paycheck is taxed at 47%.",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Subclass 482 with a recognised sponsor (Big 4, FAANG, ASX-listed company), salary cleanly above TSMIT, single applicant or simple family unit, occupation clearly on the Skilled Occupation List",
        "Switching from Subclass 482 to 186 (Direct Entry) where you've met the 2-3 year threshold cleanly",
        "Subclass 462 Work and Holiday (under-31, eligible nationality — Canada IS eligible)",
      ],
      getALawyer: [
        "Sponsor's first-time 482 nomination (Labour Market Testing scrutiny is intense; getting it wrong costs the sponsor 12 months)",
        "Self-employed / consulting move where you're nominated by your OWN Australian company — the genuineness test is rigorous",
        "Subclass 189 / 190 points-based migration where every point matters (an immigration adviser's experience optimising the points test is worth the fee)",
        "Prior visa refusal anywhere globally (UK, US, NZ refusals show up on shared character databases)",
        "Health condition that may trigger a 4007 waiver request (HIV, hepatitis, kidney disease, etc.)",
      ],
    },
  },

  "CA:AU:study": {
    whatCarriesWeight: [
      {
        label: "Genuine Temporary Entrant (GTE) — now Genuine Student (GS) test",
        why: "Since 23 March 2024 Australia replaced GTE with the Genuine Student (GS) requirement. You must answer specific questions about your circumstances, ties to Canada, course choice, post-study intent. Canadian applicants typically pass cleanly given consistently high return rates — but vague answers still get refused.",
      },
      {
        label: "CoE (Confirmation of Enrolment) from a CRICOS-registered institution",
        why: "You need a CoE before applying — not just an offer letter. Top Australian universities (Group of Eight) issue CoEs within days of accepting your tuition deposit. The Subclass 500 fee is AUD$1,600 (from July 2024, up from AUD$710 — a 125% increase).",
      },
      {
        label: "Financial capacity evidence",
        why: "Single students: AUD$29,710/year for living costs (raised in 2024) + tuition + return travel. Funds must be held for 3+ months OR you can show a relative who's prepared to be your financial sponsor with their own income evidence.",
      },
      {
        label: "OSHC (Overseas Student Health Cover)",
        why: "Mandatory for the entire visa duration. Bupa, Medibank, Allianz, NIB, AHM are the approved providers. Canadians: there's no reciprocal health agreement — budget AUD$600-900/year single coverage.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Course choice (GS question 1)", prompt: "Why THIS specific course at THIS institution? Cite faculty, programme structure, employer outcomes. Match course level to your prior education — moving down a level (e.g. Master's grad applying for Bachelor's) triggers immediate scrutiny." },
      { heading: "2. Why Australia (GS question 2)", prompt: "Specific reasons — not generic 'good education quality'. Cite English-language post-study work permit, specific industry strengths in your field, climate/lifestyle pairing with academic reasons." },
      { heading: "3. Ties to Canada (GS question 3)", prompt: "Family, property, ongoing study commitments, employer relationships. Be explicit — caseworkers want to see you'll return after studies (even though many ultimately convert to work / PR via legitimate pathways)." },
      { heading: "4. Post-study plans", prompt: "Honesty wins. Subclass 485 Temporary Graduate Visa offers 2-6 years post-study. State whether you'll use it or return — both are valid answers." },
      { heading: "5. Funding source", prompt: "Own savings (TFSA / RRSP withdrawals / line of credit), parental support (with their tax records attached), scholarship. Document each source rigorously — caseworkers compare your stated funds against the bank statements you provide." },
    ],
    moneySavingTips: [
      "Canadian high-school graduates and most university grads are EXEMPT from English-language test requirements — you went to school in English. Don't pay for IELTS unless your institution mandates one.",
      "Avoid 'priority processing' (extra AUD$870) unless your semester start is within 6 weeks — standard processing on student visas is 4-6 weeks for CRICOS-registered Australian unis.",
      "Many Australian universities offer reduced first-instalment tuition (~50%) sufficient to trigger CoE. Pay only the minimum required; the rest can be financed via Australian student loans (you're eligible for HELP-eligible courses) or scholarships.",
      "OSHC: budget shoppers go with Bupa Single or AHM — both ~AUD$600/year. Skip the 'student plus' upgrades unless you have a pre-existing condition.",
      "Subclass 485 Temporary Graduate visa fee is AUD$2,235 + IELTS evidence — budget for this from your second year of study so it's not a surprise post-graduation.",
    ],
    lawyerTriggers: {
      diy: [
        "Direct progression from Canadian high school / undergrad / Master's to comparable-level Australian programme",
        "Group of Eight or Russell-Group-equivalent institution",
        "Clean Genuine Student responses, no prior visa refusals globally",
      ],
      getALawyer: [
        "Moving down a course level (Master's grad applying for new Bachelor's) — flags GS suspicion",
        "Prior refusal of a student / visitor visa to AU, US, UK, or NZ — character database exchange",
        "Long employment gap between studies, mid-life return to study, or significant career pivot",
        "Pathway colleges / vocational training applications (different scrutiny standards)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → UK study / work / family
  // ════════════════════════════════════════════════════════════════════

  "IN:GB:study": {
    whatCarriesWeight: [
      {
        label: "Confirmation of Acceptance for Studies (CAS) from a Student-route sponsor",
        why: "Your UK university issues the CAS via the Home Office's sponsor management system after you've accepted the offer and paid the required deposit. CAS has a 14-digit reference number — without it, no application. Imperial / UCL / Cambridge / Oxford routinely issue within 3 working days of deposit; smaller institutions can take 2 weeks.",
      },
      {
        label: "Maintenance funds (£1,334/month London / £1,023 elsewhere × 9 months)",
        why: "For Indian applicants this is the single most-failed requirement. Funds must be held in your own / your parents' name continuously for 28 days, ending NO MORE than 31 days before applying. Indian banks' FD statements work, NRO/NRE accounts work, fixed deposits work — but a Demand Draft on the day you apply does NOT.",
      },
      {
        label: "ATAS clearance for STEM doctoral candidates",
        why: "Indian applicants in physics, engineering, materials, computer science PhDs typically need an Academic Technology Approval Scheme (ATAS) certificate before the visa application. Free, but 4-6 week processing — start early.",
      },
      {
        label: "TB test from an IOM-approved clinic in India",
        why: "Mandatory for Indian applicants for stays over 6 months. Approved clinics in Delhi (IOM Migration Health Assessment Centre, Lodhi Estate), Mumbai (Mumbai Migration Health Centre), Chennai. Costs ~INR 5,000 — book before booking the VFS appointment.",
      },
      {
        label: "ATAS Free Movement-style 'genuine student' answers",
        why: "UKVI Credibility Interview: 5-15% of Indian student applicants get called for an interview. Prepare to articulate: why this course, why this institution, why the UK, your funding, your post-study plans. Read your own personal statement before going — caseworkers grill candidates on what they wrote.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Why this specific course at this specific UK institution", prompt: "Don't say 'Imperial is top-ranked'. Say 'Imperial's MSc Advanced Computing offers the only UK programme with a specific specialisation in [your field], with [Professor X] whose work on [Y] aligns with my prior research on [Z].' Lift wording from the institution's own course page." },
      { heading: "2. Why the UK vs studying in India / US / Australia / Canada", prompt: "Honest comparative answer. UK graduate-route (2 years post-study work, unrestricted) is the strongest pull right now. English-medium environment + 1-year Master's structure + global brand recognition + ILR-to-citizenship pathway. Don't oversell — caseworkers see thousands of identical 'I love British education' answers." },
      { heading: "3. Your prior education and credentials gap (if any)", prompt: "Indian B.Tech / B.Sc → UK MSc is the most common path. If you have a 3-year UGC degree, MSc admission is feasible but the visa caseworker may probe. If there's a gap year, explain it concretely — work experience, NEET preparation, family circumstances." },
      { heading: "4. Funding source — every figure should match a document", prompt: "If parents fund: their last 6 months' bank statements + occupation evidence + ITR (Income Tax Return). If self-funded: your own salary slips + FDs. If loan: sanction letter from SBI / HDFC / Axis. Mismatched numbers between the statement and the application = automatic refusal." },
      { heading: "5. Post-study intent", prompt: "Honest. UK Graduate Route gives 2 years post-study (3 for PhD). Many Indian students use this to secure Skilled Worker sponsorship and pursue ILR. Saying 'I'll definitely return to India' rings false when the route is built for the opposite — say 'I'll explore Graduate Route to secure UK industry experience, with the option of returning to India if a senior role opens up.'" },
    ],
    moneySavingTips: [
      "Apply for the visa AS SOON as your CAS arrives and 28-day funds-holding period completes — UK visa processing for India is currently 3 weeks standard, but September peak (July-August applications) stretches to 6-8 weeks. Apply early to avoid 'priority' fee.",
      "IHS (Immigration Health Surcharge) for students: £776/year × course length, paid upfront with the visa. There's no way to avoid this; budget for it from the start. A 1-year Master's = £776 IHS.",
      "Avoid 'priority service' (£500 extra) unless your university start is within 5 weeks. Standard student-visa processing for India is reliable.",
      "Don't use IELTS for English proof if your prior education was English-medium — MOI letter from your previous institution often suffices. Save £200+ on test fees.",
      "Open a UK bank account on arrival via Monzo / Starling / Revolut — they accept your BRP within 24 hours. High-street banks (HSBC, Barclays) demand 3 months of UK address proof first.",
      "Graduate Route is FREE (no application fee beyond a £30 admin) — apply during your final term, not after. Last-day-of-course applications get lost in the post-graduation rush.",
    ],
    lawyerTriggers: {
      diy: [
        "Direct progression UG → PG at a Russell Group university, complete documentation, clean immigration history, parents' / your own funds with clean provenance",
        "Standard MSc / MA / LLM applications with clean credit history and standard funding sources",
      ],
      getALawyer: [
        "Prior UK / Schengen / US / AU / NZ visa refusal — any country's refusal must be declared, and the consequences vary",
        "Funding from non-immediate-family (uncle, cousin, family friend) — provenance scrutiny is intense for Indian applications",
        "Stepped-down course (e.g. Master's holder applying for a UK Master's in a different field) — Credibility Interview odds rise sharply",
        "Self-employed parents whose ITR is complex or whose business legitimacy is hard to evidence",
        "PhD applications with ATAS implications — the academic supervisor and lawyer can manage this jointly",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AMERICAN → CANADA — work (Express Entry / TN / PNP)
  // ════════════════════════════════════════════════════════════════════
  "US:CA:work": {
    whatCarriesWeight: [
      {
        label: "TN visa under USMCA (the unsung shortcut)",
        why: "Americans are eligible for the TN visa under USMCA Chapter 16 — 60+ specific professions (engineers, accountants, lawyers, computer-systems analysts, scientists, teachers, registered nurses) get expedited 3-year status with no labour-market test. Apply at any port of entry with a job offer, the TN-allowed-occupation match, and US$56 — no lottery, no quota, decision in hours. Most Americans overlook this entirely and grind through Express Entry.",
      },
      {
        label: "CRS score in Express Entry (565+ is competitive in 2026)",
        why: "Federal Skilled Worker stream uses the Comprehensive Ranking System — age, education, language (CLB 9+ in English/French is huge), Canadian work experience, sibling-in-Canada bonus. Recent draws have cleared at CRS 524-565. American applicants average 470 without optimisation — language test (IELTS General 8/7/7/7) often adds 30-50 points and is the single highest-ROI investment.",
      },
      {
        label: "Provincial Nominee Programs (PNPs) — easier than federal",
        why: "Each province has its own stream targeting their labour-market needs. Ontario OINP (tech, health care), BC PNP (tech, healthcare), Alberta AAIP (oil/gas, tech), Atlantic Immigration (Nova Scotia, NB, NL, PEI — relaxed CRS). Nomination = +600 CRS = guaranteed ITA. Many Americans apply directly to the PNP without realising it's the faster path.",
      },
      {
        label: "FBI Identity History Summary — your slowest document",
        why: "Canada requires police certificates from every country lived in 6+ months since age 18 — for Americans that's the FBI Identity History via an approved Channeler (5-7 business days, ~US$50) plus any state-repository check if requested. Don't use the FBI mail-in route (8-12 weeks) unless you're way ahead of schedule.",
      },
      {
        label: "Healthcare gap on arrival",
        why: "Provincial OHIP / MSP / RAMQ has a 3-month waiting period from arrival in most provinces (Ontario, BC, Quebec). Budget for private interim cover (Manulife, Sun Life, Cigna) — ~C$60-100/month single adult. Don't assume Canadian healthcare kicks in day one.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Visa class chosen + why", prompt: "If TN: 'I'm applying for TN status as a [occupation] under USMCA, with offer from [Company] dated [date]. My role and credentials match the TN occupational classification [Computer Systems Analyst / Engineer / etc.]'. If Express Entry: 'I'm applying via Express Entry Federal Skilled Worker stream, CRS score [X], occupation NOC [Y].'" },
      { heading: "2. Why Canada specifically", prompt: "Most Americans move for: lower healthcare costs, quality-of-life, climate (yes — many move TO winter), gun-control comfort, dual-citizenship pathway (4 years residence → citizenship), or being closer to a Canadian partner / family. Be honest and specific." },
      { heading: "3. Canadian language abilities", prompt: "If applying via Express Entry, your IELTS / CELPIP results determine your CRS. Americans assume English is automatic but you need the OFFICIAL test — there's no exemption. Quebec applicants: TEF Canada in French boosts CRS significantly." },
      { heading: "4. Where in Canada you'll settle", prompt: "Vancouver, Toronto, Montreal each have distinct industry concentrations. Specify the city + employer. For PNP applicants, name the nominating province and your post-arrival plan." },
      { heading: "5. Citizenship plan", prompt: "Dual US-Canadian citizenship is permitted. Americans typically naturalise after 4 years of physical presence — note your intent honestly. (US tax-filing obligations continue regardless.)" },
    ],
    moneySavingTips: [
      "If you qualify for TN: skip Express Entry entirely. TN at the border is US$56 + 30 minutes vs $1500+ and 6-12 months for Express Entry. After 5 years of TN experience you can apply for PR via Canadian Experience Class with strong CRS.",
      "FBI Channeler costs ~US$50 with 5-7 day turnaround. The free FBI mail-in costs nothing but takes 8-12 weeks — false economy if you're optimising for speed.",
      "IELTS General Training: book early, retake if you score below 8/7/7/7 — every band point unlocks more CRS. The C$340 retake fee pays back many times over.",
      "Most Americans don't realise the Canadian Experience Class (CEC) stream is OPEN to anyone with 1+ year of skilled Canadian work — TN holders qualify directly. Use TN as a 1-year stepping stone, then CEC for permanent residence.",
      "US tax: Canada-US Tax Treaty + Form 8833 + foreign-earned-income exclusion (~US$126,500 for 2025) means most middle-class moves have minimal US tax exposure. Consult a cross-border accountant ($300-500/year, far cheaper than getting it wrong).",
      "Express Entry's age tax: -5 points per year after 30. If you're 32 with a US job offer, don't delay — every year shaves CRS materially.",
    ],
    lawyerTriggers: {
      diy: [
        "Standard TN application at a major border crossing with a clean US-issued job offer in a TN-listed occupation",
        "Express Entry profile with clean immigration history and CRS 520+",
        "Direct PNP application via a province you have a job offer in",
      ],
      getALawyer: [
        "Prior US visa overstay, criminal record (any), or immigration violation — Canadian admissibility scrutiny is rigorous",
        "Cannabis-related conviction in any US state (Canada views any past conviction under its federal-drug-classification lens; you may need rehabilitation)",
        "DUI conviction in any US state — Canada has historically refused DUI-convicted applicants; rehabilitation paperwork is specialist work",
        "Self-employed / consultant TN application (genuineness scrutiny intensified post-2024)",
        "Quebec-specific routes (CSQ + federal application has two separate processes)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AMERICAN → AUSTRALIA — work (E-3 treaty + Subclass 482)
  // ════════════════════════════════════════════════════════════════════
  "US:AU:work": {
    whatCarriesWeight: [
      {
        label: "The E-3 specialty-occupation visa — USA-only secret",
        why: "Americans get a unique 'professional speciality' visa under the Australian-American Free Trade Agreement: the E-3. Numbered cap of 10,500/year, almost NEVER hit. AUD$925 application fee, 2-year stay renewable indefinitely, spouse can work without restriction. Most American applicants don't know it exists and apply for the much harder Subclass 482.",
      },
      {
        label: "Subclass 482 TSMIT thresholds (the harder route)",
        why: "If you're not eligible for E-3 (e.g. role not classified as specialty-occupation), Subclass 482 needs a sponsor's nomination, TSMIT AUD$73,150 minimum from July 2024, skills assessment for trades/regulated occupations. AUD$3,210 base + AUD$1,455 levy fee — significantly more expensive than E-3.",
      },
      {
        label: "Australian super and tax — the income shock",
        why: "Australian super is 11.5% (rising to 12% from July 2025) on top of stated salary. Income tax is steeper than US federal for middle earners — AUD$80k salary nets ~AUD$60k after tax+super. Americans often misread AUD salaries vs USD and arrive financially shocked. Also: US-Australia Tax Treaty caps double-taxation but the FEIE doesn't fully cover Australian super.",
      },
      {
        label: "FBI Identity History Summary — same speed as TN/Canada",
        why: "Australia requires police checks from every country lived 12+ months past 10 years. For Americans: FBI Channeler (5-7 days, ~US$50) is the fast lane. State-level checks may be requested if you've moved between states.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. E-3 vs Subclass 482 reasoning", prompt: "If E-3: 'My role qualifies as a specialty occupation under the AUSFTA E-3 visa, with university degree in [field] required. The Australian employer's letter classifies the role as [ANZSCO code].' Most Americans should start here." },
      { heading: "2. Why Australia (specific city + industry)", prompt: "Sydney's tech / finance, Melbourne's pharma / fintech, Perth's mining, Brisbane's biotech, Adelaide's defence. Pair lifestyle with industry specifics. Australian timezone overlaps with both APAC and West Coast US — note if your role requires this." },
      { heading: "3. Family + dependents", prompt: "E-3 spouses get an Activated Spouse Subclass 482 work permission with unrestricted work — much better than Subclass 482 dependents. School-age kids: Australian public-school enrolment is straightforward for visa holders." },
      { heading: "4. Long-term plans", prompt: "E-3 doesn't have a direct PR pathway — but you can transition to Subclass 186 ENS or 189 General Skilled Migration after building skilled work experience. Australian citizenship via naturalisation requires 4 years residence including 1 year as PR." },
    ],
    moneySavingTips: [
      "Apply for E-3 BEFORE Subclass 482 — the E-3 saves you AUD$3,000+ vs 482, and spouses can work full-time on E-3 dependent (a benefit 482 dependents lost in 2023).",
      "Don't pay for priority Subclass 482 (~AUD$1,200 extra). E-3 isn't eligible for priority anyway and processes in 1-3 months reliably.",
      "Open an Australian bank account BEFORE arrival via Westpac / NAB / Commonwealth Bank international onboarding. Some employers will withhold tax at 47% until your TFN arrives — Australian onshore accounts speed this.",
      "US citizens are exempt from Australia's Working Holiday Subclass 462 cap... wait, no — they're NOT eligible for 462. (Australia's WH agreements with USA are under negotiation as of 2026.) Don't waste time on this until it lands.",
      "Australian super (11.5%+) is YOUR money — you keep it in a fund + can withdraw it on permanent departure (subject to ~38% withholding). Choose a low-fee fund (Australian Retirement Trust, Hostplus, AustralianSuper) early.",
    ],
    lawyerTriggers: {
      diy: [
        "E-3 visa application with a Fortune-500-style US employer's Australian subsidiary",
        "Standard Subclass 482 with a recognised Australian sponsor and salary cleanly above TSMIT",
      ],
      getALawyer: [
        "Sponsor's first-time E-3 / 482 nomination (specialty-occupation classification has nuance)",
        "Switching from E-3 to Subclass 186 ENS — the experience-time + DAMA pathways are specialist work",
        "US-side compliance (cancelling H-1B / OPT before moving to AU) — US immigration lawyer + AU immigration lawyer should coordinate",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AMERICAN → UK — work (Skilled Worker / Global Talent / Innovator)
  // ════════════════════════════════════════════════════════════════════
  "US:GB:work": {
    whatCarriesWeight: [
      {
        label: "UK Skilled Worker salary thresholds — the £38,700 floor",
        why: "From April 2024 the Skilled Worker general threshold rose to £38,700 (or the going rate for your occupation if higher). Health & Care occupations stay at £29,000. Below threshold = automatic refusal. For US software engineers, lawyers, finance professionals: well above. For nurses, social-care workers: Health & Care route is the lifeline.",
      },
      {
        label: "Global Talent visa — for Americans with credentials",
        why: "If you're a published scientist, engineer, or tech founder, Global Talent (administered via DSIT for tech / Royal Society / RAEng / British Academy for academia / Arts Council for creative) gives 5-year stay, no employer sponsorship, full work flexibility. Endorsement fee £766 + visa £204. Pure speed-route for Americans with portfolio evidence.",
      },
      {
        label: "Immigration Health Surcharge — £1,035/year shock",
        why: "Americans budget for the visa fee, then discover IHS at £1,035/year × visa length charged upfront. Skilled Worker 5-year = £5,175 IHS. Settlement (ILR) eligibility at year 5 — many Americans aim for this for NHS access + pathway to British citizenship after year 6.",
      },
      {
        label: "ACRO / state criminal records",
        why: "UK requires police certificates from every country lived 12+ months in past 10 years. For Americans: FBI Identity History plus relevant state criminal-record checks if state policy requires. Some US states (California, NY) don't issue state-level individual certificates — FBI suffices.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. UK visa route chosen + why this over US options", prompt: "Skilled Worker (sponsored, fastest), Global Talent (high-potential), Innovator Founder (entrepreneurs with £50k+ investment + endorsement). State which route, why this not Subclass 482 / Express Entry / E-3 — show you researched comparatively." },
      { heading: "2. Why the UK", prompt: "London's financial sector, NHS recruitment, tech ecosystem at Imperial / UCL / Cambridge spin-outs, English-speaking environment, EU-adjacent timezone, dual-citizenship pathway. Americans often move for partner visa or work; both routes have unique calculus." },
      { heading: "3. UK ties + integration plan", prompt: "Existing UK contacts, prior visits, family ties, employer relationships. Skilled Worker doesn't require ties as much as Global Talent or Family routes do, but specifics strengthen any application." },
      { heading: "4. Post-Skilled Worker plan", prompt: "ILR after 5 years on Skilled Worker (Indefinite Leave to Remain — like a green card). British citizenship after year 6 (5 years ILR + 1 year wait). Both routes are open to Americans — dual citizenship permitted on both sides." },
    ],
    moneySavingTips: [
      "Global Talent is significantly cheaper over 5 years than Skilled Worker: £766 endorsement + £204 visa × 1 = ~£1k upfront, vs Skilled Worker £719/year fee + IHS £1,035/year (~£8,800 over 5 years).",
      "Pay for priority processing (5 working days, +£500) for Skilled Worker only if your start date is < 4 weeks out. Standard is 3 weeks for online applications, reliable.",
      "US-UK tax treaty: file Form 1116 (foreign tax credit) — your UK income tax (typically higher than US) offsets US federal tax, leaving you with minimal additional US liability. State tax (CA, NY) still applies — get a cross-border accountant.",
      "BRP cards have been phased out — UK is moving to eVisas. Don't pay for BRP delivery services if your application is post-2025.",
      "ILR application fee is £2,885 — but unlocks NHS without IHS, eligibility for state pension contributions, no time-limit on stays. Worth budgeting from year 1.",
    ],
    lawyerTriggers: {
      diy: [
        "Skilled Worker visa via a major US-headquartered employer's UK office (Goldman Sachs, Google London, etc.)",
        "Global Talent in tech with clear portfolio evidence (founder, paper-publication record, senior-role history)",
      ],
      getALawyer: [
        "Innovator Founder route (£50k investment + endorsement — substantial money at risk, specialist help worth it)",
        "Cannabis-related US conviction (UK admissibility is moderate but specific routes have stricter character thresholds)",
        "Pension / 401(k) transfer planning — cross-border tax + pension specialist required",
        "US-Italy / US-UK / US-Ireland dual citizenship via ancestry as a parallel route — different ballgame",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → US — study (F-1)
  // ════════════════════════════════════════════════════════════════════
  "IN:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified institution",
        why: "Your I-20 (Form I-20 issued by the US institution) is THE document for F-1 — not just an offer letter. It carries a unique SEVIS ID, lists your programme, projected completion date, and certified financial figure. Indian institutions sometimes issue 'admission letters' that aren't valid for visa application — only the I-20 is.",
      },
      {
        label: "Financial documentation matching the I-20 figure",
        why: "Your I-20 states a financial-resources figure (e.g. US$72,000/year for an Ivy League Master's). You must show LIQUID FUNDS matching this for Year 1 + 'sufficient resources' for remaining years. Indian banks' FDR statements work, but caseworkers cross-check against your ITRs (Income Tax Returns) — your stated sponsor's income should plausibly support the bank balance.",
      },
      {
        label: "DS-160 + visa interview at US Embassy / Consulate",
        why: "Mumbai, New Delhi, Chennai, Kolkata, Hyderabad embassies. Wait times for Indian F-1 appointments stretch 4-8 weeks in peak season (April-July). Apply EARLY. The interview is 3-5 minutes — the officer assesses your genuine-student credibility based on your DS-160 and interview composure.",
      },
      {
        label: "SEVIS I-901 fee — US$350 paid before interview",
        why: "Often forgotten. SEVIS I-901 must be paid 3+ business days before the visa interview, payable at fmjfee.com. Bring the printed receipt to the interview — no receipt = no interview.",
      },
      {
        label: "Visa fee MRV — US$185 + biometrics",
        why: "MRV (Machine Readable Visa) fee paid before the interview. Plus VAC biometrics fee. Total: ~US$350 + visa fee. Some Indian agents take 'service fees' on top — book directly through the US Embassy India site (ustraveldocs.com) to avoid markup.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Genuine student intent (the F-1 interview's central question)", prompt: "Why this specific course? What did you study before? Why the USA and not the UK / Canada / Australia? The DS-160 + interview both probe genuine-student intent. Concrete answers: 'My undergraduate was in computer engineering at NIT Trichy with a focus on machine learning. The MS at Carnegie Mellon's School of Computer Science has a specific track in AI Safety taught by [Professor X], whose work on [Y] aligns with my undergraduate thesis on [Z].'" },
      { heading: "2. Funding source explained line by line", prompt: "Parents fund: 'My father is a [profession] earning ₹[X] per year (verifiable via ITR for FY 2024-25), my mother is [Y]. They have committed [bank account number] holding ₹[Z] for my education.' Self-fund: salary slips + savings + FDs. Loan: SBI / Axis / HDFC sanction letter." },
      { heading: "3. Ties to India (the 'return home' test)", prompt: "Family, property, ongoing business interests, job offers, ancestral land. Caseworkers ask: 'What stops you from staying in the US after graduation?' Honest answer: 'I plan to use OPT (Optional Practical Training) for 1-3 years industry experience, then either pursue H-1B sponsorship or return to India to apply skills.' Both intents are valid — vagueness is fatal." },
      { heading: "4. Post-study plan honestly", prompt: "STEM degrees get 36-month OPT (3 years). Non-STEM get 12 months. H-1B lottery has ~20% odds in 2026. State your intent: 'I plan to use OPT for industry experience, apply for H-1B in cycles 2027-2030, with the option of returning to India to apply learned skills if H-1B isn't successful.'" },
      { heading: "5. Why your prior education prepares you", prompt: "Connect undergrad GPA, projects, publications, work experience to the chosen Master's. Indian engineering graduates from IIT / NIT / BITS clear visa interviews more reliably — the credentials are well-recognised. Tier-2 Indian colleges need stronger justification of upward fit." },
    ],
    moneySavingTips: [
      "Apply for the visa appointment as soon as your I-20 arrives. April-July is peak Indian student-visa season — December-March applications get appointments faster.",
      "Don't use 'visa-counsellor' services for ₹50,000-100,000. The DS-160 and visa interview prep are well-documented on official US Embassy India pages. The fee adds zero value for clean applications.",
      "STEM OPT extension (24 additional months beyond the standard 12) is FREE — applies automatically to designated STEM CIP codes. Verify your programme's CIP code is on the STEM list BEFORE accepting the offer.",
      "Many Indian banks offer 'education loans for US studies' at preferential rates (SBI Global Edvantage, HDFC Credila, Axis Bank Education Loan). Compare against ICICI Bank Education Loan + EMI Moratorium — terms vary by ~2-3% interest, materially impacting total cost.",
      "Don't apply for ED visa (vocational training) when you mean F-1 (academic). They're different categories — Indian agents sometimes route applications wrongly. F-1 is what 95%+ of Indian students need.",
      "Health insurance: most US universities mandate Aetna / Cigna student plans (~US$2,500/year). Compare against ISO Student Health Insurance — often cheaper if the university allows external plans.",
    ],
    lawyerTriggers: {
      diy: [
        "Direct undergrad-to-graduate progression at a US Top-100 institution (IIT graduate → Stanford MS, etc.)",
        "Clean documentation, parents' / self-funded, no prior US visa refusal",
      ],
      getALawyer: [
        "Prior F-1 / B1-B2 refusal at any US Embassy — the 214(b) refusal stays on your record",
        "Funding via crypto, family business income, or non-standard sources — provenance scrutiny is intense for Indian applications",
        "Older 'mature' student or career-changer applicant (>30 years old applying for first Master's)",
        "F-2 dependent application for spouse + children — F-2 has limited work rights, complexity in interview",
        "Background includes any criminal record, immigration violation in any country, or visa overstay anywhere",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → US — work (H-1B, L-1, EB-2/EB-3)
  // ════════════════════════════════════════════════════════════════════
  "IN:US:work": {
    whatCarriesWeight: [
      {
        label: "H-1B lottery odds (~20% in 2026) + cap-exempt employers",
        why: "USCIS receives ~400k H-1B registrations annually for 85,000 slots. Indian applicants make up ~75% of the H-1B pool. The lottery is RANDOM — your credentials don't help your lottery odds. But cap-exempt employers (universities, hospital systems, research institutions) are EXCLUDED from the lottery — these jobs let Indian applicants skip the lottery entirely.",
      },
      {
        label: "L-1A vs L-1B intracompany transfer",
        why: "If your Indian employer has a US office, L-1A (manager/executive — 7-year max) or L-1B (specialised knowledge — 5-year max) bypasses the H-1B lottery entirely. Requires 1 year of qualifying employment with the Indian entity in the previous 3 years. L-1A leads directly to EB-1C green card (no labour cert needed, ~2-3 year priority date for India).",
      },
      {
        label: "EB-2/EB-3 green card backlog reality (15-20 years for India)",
        why: "Employment-based green cards have per-country caps. Indian-born applicants face the world's longest backlog — EB-2 priority dates are stuck at 2012-2013, EB-3 worse. Most Indians get H-1B for the legal-stay framework while waiting in the green-card line. EB-1 is the only category with manageable Indian backlogs (~2-3 years).",
      },
      {
        label: "Form I-129 + Labor Condition Application (LCA)",
        why: "Your sponsoring employer files Form I-129 + DOL LCA. LCA proves the employer pays prevailing wage and that hiring a foreign worker doesn't disadvantage US workers. For Indian applicants this gets scrutinised harder than for European applicants — 'specialty occupation' challenges trigger RFEs (Request for Evidence) at ~30% of Indian H-1B petitions.",
      },
      {
        label: "FBI Identity History (post-arrival contexts)",
        why: "H-1B doesn't require police certificates for the initial petition. But green-card conversion (Adjustment of Status) requires FBI clearance and biometrics. Indian applicants with prior US travel: every entry stamp is in their record — clean is essential.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Visa pathway chosen + why", prompt: "H-1B (sponsored, lottery), L-1A/B (intracompany), O-1 (extraordinary ability, no cap), EB-2 NIW (self-petition with substantial merit). Indian applicants disproportionately use H-1B, but L-1 and O-1 routes have far better odds for senior professionals." },
      { heading: "2. Specialty occupation justification", prompt: "Why does this role require a Bachelor's degree minimum? RFEs on Indian H-1B petitions frequently challenge specialty-occupation status. Be explicit: 'The role of [Senior Software Engineer] requires a Bachelor's in [Computer Science or related field] as evidenced by the employer's job description and BLS occupational data.'" },
      { heading: "3. Wage above prevailing", prompt: "DOL prevailing wage data sets the floor. If your offered salary is at Level 1 (entry-level prevailing wage), that's a refusal signal for senior roles — should be Level 3-4 (experienced/fully competent). Indian applicants often accept Level 2 offers expecting fast approval; Level 3+ has higher approval rates." },
      { heading: "4. Long-term immigration plan", prompt: "H-1B is non-immigrant on paper but EVERYONE knows the green-card destination. State your I-140 (immigrant petition) timing — your employer will file alongside H-1B. The 15-20-year Indian backlog means H-1B renewals every 3 years for 15+ years before green card." },
      { heading: "5. Family planning", prompt: "Spouse on H-4. H-4 EAD eligibility (work authorisation) requires the H-1B holder to have an approved I-140 (green-card petition) and be in 6th year or beyond on H-1B. Most Indian H-1B families wait 6-10+ years before H-4 spouses can legally work in the US." },
    ],
    moneySavingTips: [
      "Apply for the H-1B lottery via multiple SAFE channels — single employer registration only; submitting via multiple unrelated employers when you have a single job offer = DOL fraud. Don't fall for this scheme.",
      "Premium processing for H-1B is US$2,805 — buy it. 15-day decision vs 4-6 months standard. Critical for July-September lottery starts.",
      "EB-2 NIW (National Interest Waiver) lets Indian researchers / advanced-degree professionals self-petition without an employer sponsor. Same Indian backlog (~10-15 years current) but you control your own filing. Total cost: ~US$5,000 for legal + filing.",
      "STEM OPT students should file H-1B in their first year of OPT — gives 3 lottery cycles before OPT expires. Missing the first cycle costs a year.",
      "Texas / Florida / Washington have NO state income tax — Indian H-1B holders often move there post-H-1B start. Save $5-15k/year vs California / NY for same nominal salary.",
      "401(k) contributions are pre-tax even on H-1B. Max it out — when you eventually leave (or get permanent residence), the balance is yours to keep, draw down, or roll over.",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B with a major US employer (Google, Microsoft, JP Morgan, Goldman, Deloitte, Capgemini, TCS, Infosys) — they have in-house immigration teams who handle this routinely",
        "L-1A / L-1B transfer from an established Indian-headquartered employer to its US subsidiary",
      ],
      getALawyer: [
        "EB-2 NIW self-petition — substantial petition document, complex evidence requirements",
        "Switch from H-1B to O-1 (extraordinary ability) — high-bar evidence requirements",
        "Cap-exempt employer applications (university research positions) — different filing process",
        "Prior US visa refusal, overstay, or immigration violation in your or any family member's history",
        "Adjustment of Status (I-485) for green card conversion — multi-year process with critical timing windows",
        "Concurrent filing strategies (I-129 + I-140 + I-485 timing) — specialist optimisation worth $3-5k legal",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → GREAT BRITAIN — work (Skilled Worker)
  // ════════════════════════════════════════════════════════════════════
  "IN:GB:work": {
    whatCarriesWeight: [
      {
        label: "Skilled Worker £38,700 threshold (or your occupation's going rate)",
        why: "From 4 April 2024 the Skilled Worker general threshold rose to £38,700. Indian software engineers at FAANG-tier London offices clear this easily; mid-market consultancies may not. Health & Care visa stays at £29,000 — covers NHS doctors / nurses / care workers and remains the #1 route for Indian healthcare professionals.",
      },
      {
        label: "Certificate of Sponsorship (CoS) from a UK Visas-and-Immigration licensed sponsor",
        why: "Your CoS has a unique reference number — without it, no application. Indian-heritage employers (TCS UK, Infosys UK, Wipro London, HCL UK, Tech Mahindra UK) have established sponsorship pipelines. UK employer licence checks on Indian applicants are routine but rigorous; verify your sponsor's status at gov.uk.",
      },
      {
        label: "Immigration Health Surcharge — £1,035/year × visa length",
        why: "Skilled Worker 5-year visa = £5,175 IHS upfront. Family members each pay separately. Indian applicants often underestimate IHS — budget £20k+ for a family of 4 over 5 years. Health & Care Worker route is IHS-exempt (the only major route with this benefit).",
      },
      {
        label: "ACRO Police Certificate (or country-of-residence equivalent)",
        why: "UK requires police certificates from every country lived 12+ months in past 10 years. For Indians, that's typically the Indian PCC + ACRO if you've been in the UK before. Indian PCC via PSK (Passport Seva Kendra) takes 1-3 weeks; rural address renewals delay further.",
      },
      {
        label: "English at IELTS B1+ for most Skilled Worker roles",
        why: "Indian applicants from English-medium higher education (most engineering / tech / commerce graduates) qualify for MOI (Medium of Instruction) waiver — institution letter substitutes for IELTS. Save £200+ on the test. Health & Care route requires IELTS or OET at B1+ minimum.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. UK route chosen + employer", prompt: "Skilled Worker most common. Specify sponsoring employer + role title + start date + salary. Indian applicants increasingly use the new Global Talent route for senior researchers / tech leaders — eligibility tied to track record, not employer." },
      { heading: "2. Why the UK over US / Canada / Australia", prompt: "UK Graduate Route → Skilled Worker → ILR after 5 years = 6 years to permanent settlement (no per-country green-card backlog like the US). Universally English-speaking + accessible EU travel + Commonwealth connection. Be specific about which factors apply to you." },
      { heading: "3. Family arrangements", prompt: "Spouse on dependent visa with full work rights (unlike US H-4 which is restricted). School-age children: UK state schools admit visa-holders' kids directly. Mention if you're bringing dependents." },
      { heading: "4. Long-term plan + ILR pathway", prompt: "ILR (Indefinite Leave to Remain) at year 5 unlocks NHS without IHS, state pension, no work restrictions. British citizenship at year 6 (5 years ILR + 1-year wait). Indian dual citizenship: India does NOT permit dual citizenship — you'd surrender Indian citizenship to take British, but can apply for OCI (Overseas Citizen of India) which gives lifelong return rights." },
      { heading: "5. Why this employer specifically", prompt: "How did you find them? Recruiter, direct application, referral. The 'genuine vacancy' test is the most-failed Skilled Worker requirement. A clear recruiter trail or competitive-application story signals legitimacy." },
    ],
    moneySavingTips: [
      "Health & Care Worker route is IHS-exempt + reduced visa fee (£284 for 3 years). Indian doctors / nurses / care workers should ALWAYS check this route before Skilled Worker — saves £4-5k.",
      "MOI letter (Medium of Instruction) from your Indian university bypasses IELTS for English proof. Save £210 — most Indian institutions issue MOI letters within 1-2 weeks.",
      "Priority processing for Skilled Worker (£500) is worth it if your start date is < 4 weeks out. Standard online processing for India is 3-5 weeks reliably.",
      "Open a UK bank account with Monzo / Starling / Revolut on arrival — accept BRP / eVisa within 24 hours. High-street banks (HSBC, Barclays) demand 3 months of UK address proof first.",
      "ILR application is £2,885 — start saving from year 1 of your visa. After ILR, citizenship is another £1,500 + Life-in-the-UK Test (£50).",
      "Indian Provident Fund (EPF) can be partially withdrawn on overseas departure. Coordinate with your Indian employer's HR before leaving — failure to claim within 36 months loses the balance.",
    ],
    lawyerTriggers: {
      diy: [
        "Skilled Worker via major sponsor (Big 4, FAANG, NHS Trust, Goldman, JP Morgan London) — these employers have established immigration processes",
        "Health & Care visa for NHS-employed nurses / doctors / midwives / paramedics / social-care workers",
        "Global Talent endorsement via DSIT for senior tech roles with publication record / unicorn-startup history",
      ],
      getALawyer: [
        "Innovator Founder route (£50k+ investment) — substantial money at risk, endorsement complexity",
        "Skilled Worker switch from inside the UK (e.g. Student → Skilled Worker) — timing is critical",
        "Adult Dependent Relative Visa for elderly parents — one of the most-refused UK routes",
        "Prior UK visa refusal, overstay, or removal in your or family member's history",
        "Indian-OCI conversion (some routes affected by surrender of Indian citizenship for British)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → CANADA — study (Study Permit + SDS)
  // ════════════════════════════════════════════════════════════════════
  "IN:CA:study": {
    whatCarriesWeight: [
      {
        label: "Letter of Acceptance from a Designated Learning Institution (DLI)",
        why: "Canada only issues study permits for DLI-listed institutions. Most public universities, colleges, and some private institutions are DLIs. Verify your institution's DLI number at the Canada.ca DLI list. Without it, no study permit possible.",
      },
      {
        label: "Provincial Attestation Letter (PAL) — the 2024 cap layer",
        why: "Since 22 January 2024, most Canadian study permit applicants need a Provincial Attestation Letter from the province where they'll study. PALs are capped per province per year. Indian applicants to Ontario universities should secure PAL early — Ontario's annual cap of ~141,000 PALs is filled by mid-year.",
      },
      {
        label: "Student Direct Stream (SDS) for Indians",
        why: "Available exclusively to applicants from India, China, Philippines, Vietnam, and ~10 other countries. SDS processing target: 20 calendar days vs 8-16 weeks for regular Study Permit. Requires: IELTS 6.0+ overall, GIC (Guaranteed Investment Certificate) CAD$20,635, full tuition paid for Year 1, upfront medical exam.",
      },
      {
        label: "Proof of funds: CAD$22,895/year + tuition + return travel",
        why: "From 1 January 2024, IRCC raised the cost-of-living threshold significantly. Indian applicants must show: CAD$22,895/year living costs (single, outside Quebec; CAD$25,150 in Quebec) + first-year tuition payment + CAD$1,500 return travel. Funds must be held continuously for 6+ months OR via SDS GIC.",
      },
      {
        label: "Medical exam from IRCC-approved panel physician",
        why: "Indian applicants must complete the medical exam BEFORE applying via SDS (within 12 months of application). Panel physicians in Delhi, Mumbai, Chennai, Kolkata, Bangalore, Hyderabad, Chandigarh, Ahmedabad. ~INR 3,500-5,500 per applicant. Upfront medical = 2-3 week saving vs post-application.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. SDS or regular Study Permit + why this institution", prompt: "If SDS: 'I'm applying via the Student Direct Stream as an Indian national, with GIC certificate from Scotiabank for CAD$20,635, IELTS overall 6.5, full first-year tuition paid.' Name the institution + programme + start date." },
      { heading: "2. Why Canada vs US / UK / Australia", prompt: "Post-Graduation Work Permit (PGWP) up to 3 years; Express Entry Federal Skilled Worker stream rewarding Canadian study; bilingualism opportunity; cost-of-living lower than UK; safer immigration policy than recent US." },
      { heading: "3. Why this specific programme", prompt: "Concrete reasons: faculty research, industry placement record, location's industry ecosystem (Waterloo for tech, Vancouver for film, Toronto for finance). Indian applicants often cite 'reputed Canadian education' — too generic. Specifics: 'McMaster's Master of Engineering in Software Engineering has a 90% employment rate within 6 months of graduation, and the Hamilton tech corridor has Communitech-style support specifically for international graduates.'" },
      { heading: "4. Financial source + sponsor", prompt: "GIC + tuition + parent ITR + bank statements for any non-GIC supplementary funds. Each rupee in the application should match a document — caseworkers cross-reference relentlessly." },
      { heading: "5. Post-study intent + Express Entry pathway", prompt: "Canada PGWP (1-3 years post-graduation, unrestricted work) → Express Entry Canadian Experience Class with bonus points for Canadian study + work. Honest answer: 'I plan to use PGWP for 1-2 years industry experience, then apply for permanent residence via Canadian Experience Class.'" },
    ],
    moneySavingTips: [
      "SDS GIC fee at Scotiabank: CAD$200 setup + CAD$20,635 deposit. Alternative banks (CIBC, RBC, TD, BMO) offer comparable GICs at slightly different fees — compare current rates.",
      "SDS skips the typical 8-16 week processing for ~20 days. Use it if you meet eligibility — saves weeks of pre-arrival waiting.",
      "IELTS One Skill Retake: if you score 6.0/6.0/6.0/5.5, retake JUST the speaking module (CAD$200) rather than the full test. Most Indian universities + IRCC accept the One Skill Retake.",
      "Provincial Attestation Letter is FREE — request from the province as soon as the LoA arrives. Some Indian agents charge for this; don't pay.",
      "Spousal Open Work Permit (SOWP) was tightened in 2024 — only spouses of graduate-level / select professional programmes qualify. Verify before quitting your spouse's Indian job.",
      "Open a Canadian bank account remotely via Scotiabank (StartRight Programme) or RBC NewClient — saves the 'no SIN, no account' loop on arrival.",
      "Don't pay 'study consultants' for visa filing. The IRCC online application is straightforward; consultants charge ₹30k-100k for what an Indian English-speaking applicant can do in 4-6 hours.",
    ],
    lawyerTriggers: {
      diy: [
        "SDS application with clean documentation + DLI institution + IELTS 6.5+ + GIC",
        "Direct undergrad → graduate progression at a major Canadian university (U of T, McGill, UBC, McMaster, Waterloo, Queen's)",
      ],
      getALawyer: [
        "Refused prior Canadian / US / UK / AU study or visitor visa",
        "Funding via non-immediate family or business income — provenance challenges common",
        "Pathway college applications (different scrutiny than university)",
        "Multi-cycle re-applications after refusal",
        "Quebec study permit (separate CAQ + federal permit process)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRITISH → USA — work (E-2 / L-1 / O-1 / H-1B)
  // ════════════════════════════════════════════════════════════════════
  "GB:US:work": {
    whatCarriesWeight: [
      {
        label: "E-2 Treaty Investor — UK's secret advantage",
        why: "The UK is on the US E-2 Treaty list — eligible British nationals can invest US$150-250k (no statutory minimum) in a US business and run it under E-2 status for 2-5 years, renewable indefinitely. Spouse can apply for EAD (work authorisation). Most other commonwealth countries DON'T have E-2 access — this is a unique British advantage.",
      },
      {
        label: "L-1A / L-1B intracompany transfer",
        why: "If your UK employer has a US office (most UK PLCs do), L-1A (manager/executive — 7-year max) or L-1B (specialised knowledge — 5-year max) bypasses the H-1B lottery. Requires 1 year of qualifying employment in UK in past 3 years. L-1A leads directly to EB-1C green card (no labour cert).",
      },
      {
        label: "H-1B lottery and the 'British advantage'",
        why: "British applicants have ~20% lottery odds (same as everyone). But: UK applicants benefit from MUCH faster green-card priority dates — UK-born EB-2 currently 'Current' (no backlog) vs 15+ years for India. If you're British and your employer files I-140 (green-card petition) concurrent with H-1B, your green card can arrive in 1-3 years.",
      },
      {
        label: "ACRO Police Certificate for non-US police history",
        why: "USCIS requests police certificates from every country lived 12+ months in past 10 years. For Brits living in UK: ACRO Police Certificate (~£105, 10 working days). If you've lived in third countries (post-Brexit EU stints, etc.), add those.",
      },
      {
        label: "Cross-border tax — pension / ISA complications",
        why: "UK ISAs are NOT tax-advantaged in the US — Americans treat ISAs as standard taxable accounts. UK pensions (workplace + personal) have complex US tax treatment under the UK-US tax treaty. Get a cross-border tax adviser BEFORE moving (~£300-500), not after.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. US visa pathway chosen + why", prompt: "E-2 (investor), L-1 (transfer), O-1 (extraordinary ability), H-1B (lottery). Most British professionals overlook E-2 — it's the fastest, most flexible route for those with US$150k+ to invest. State which route + reasoning." },
      { heading: "2. UK ties + reason for US move", prompt: "London → New York / SF migration is a well-trodden path. Mention concrete US-side circumstances: employer offer + relocation package, US-based partner, family already in US, specific industry concentration. Avoid 'love the American way of life' — it rings hollow." },
      { heading: "3. UK exit logistics", prompt: "ISA / pension treatment, NHS deregistration, UK employment notice, tenancy unwind. UK tax-residency clean break is critical — HMRC will keep you on the rolls if not formally exited." },
      { heading: "4. US state choice + tax implications", prompt: "Texas / Florida / Tennessee / Washington have NO state income tax — material vs California / New York. British professionals often start in NY / SF / Boston for the industry concentration, then relocate to no-tax states after stabilising." },
      { heading: "5. Green-card pathway + long-term plan", prompt: "EB-1 / EB-2 priority dates for UK-born applicants are typically current or near-current. State your green-card timeline: 'L-1A → I-140 EB-1C → AOS within 18 months' OR 'H-1B + I-140 EB-2 + AOS within 2-3 years'. The British advantage on backlogs makes the US a faster permanent move than India / China nationals experience." },
    ],
    moneySavingTips: [
      "E-2 investment doesn't need to be liquid cash — leased equipment, signed contracts, hired employees all count toward 'substantial investment'. A well-structured E-2 application can show $75-100k actual cash with $150-200k total committed.",
      "Don't repatriate your UK pension on departure — UK pensions have favourable US tax treatment IF structured correctly. The £1,073,100 LTA cap (now £268,275 LSA cap from 2024) interacts with US contributions complex; specialist advice essential.",
      "Premium processing on H-1B (US$2,805) is mandatory in 2026 — buy it. 15-day decision vs 4-6 months standard.",
      "British driving licence converts to US state licence WITHOUT a written test in: Florida, Texas, California, Washington, Massachusetts. Practical test only. Saves 2-4 weeks.",
      "Open a US bank account remotely via HSBC US (if you bank with HSBC UK) or Wise (Wise USD account works as a US bank for direct-deposit purposes). Avoid the 'no SSN, no account' loop on arrival.",
      "Healthcare: enrol in your employer's plan immediately. Don't try to time the open-enrolment period — qualifying-life-event coverage on arrival is automatic if your employer is set up correctly.",
    ],
    lawyerTriggers: {
      diy: [
        "L-1 transfer from a major UK-headquartered employer with established US subsidiary (Barclays, HSBC, BP, Diageo, AstraZeneca, etc.)",
        "Standard H-1B via a major US employer's London-recruited offer",
      ],
      getALawyer: [
        "E-2 Treaty Investor — investment structure + 'substantial investment' demonstration + active management evidence all need specialist optimisation",
        "Pension transfer / 401(k) coordination — cross-border pension lawyer + tax accountant essential",
        "EB-1 / EB-2 NIW self-petition with UK academic / executive record — substantial petition document",
        "UK-Italy / UK-Ireland dual citizenship as parallel route via ancestry — different ballgame",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // CHINESE → USA — study (F-1)
  // ════════════════════════════════════════════════════════════════════
  "CN:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US institution",
        why: "Same I-20 process as other nationalities. Chinese applicants face additional scrutiny on programmes in STEM fields touching sensitive technologies — semiconductor, aerospace, AI/ML, quantum, biotech. Some programmes require the Visa Mantis security advisory opinion (additional 2-8 week processing).",
      },
      {
        label: "DS-160 + 5-year visa interview (extended scrutiny for Chinese applicants)",
        why: "Chinese F-1 applicants face longer interview times (5-15 min vs 3-5 for most), more probing questions on intent + funding + family ties + post-study plans, and higher refusal rates (~10-15% historical baseline, rising in 2024-2025).",
      },
      {
        label: "Section 212(a)(3)(C) — Proclamation 10043 restrictions",
        why: "Active since 2020. Chinese graduate students/researchers in fields linked to PLA-affiliated universities (7 Sons of National Defence + Beijing Aeronautics + other specified entities) face visa restrictions. Verify your undergraduate institution's status BEFORE choosing your US programme — refusal under PP10043 is essentially permanent.",
      },
      {
        label: "Funding documentation — bank statements + sponsor letters",
        why: "Chinese applicants must show: full first-year tuition + living costs documented. Common sponsors: parents' income / business + 6-month bank statements + property valuations. Cash flow above US$15-20k/month in family business raises 'genuine' questions — work with a CPA-equivalent to validate transfers.",
      },
      {
        label: "SEVIS I-901 fee + Visa Fee MRV",
        why: "US$350 + US$185. Pay BEFORE interview. Most Chinese applicants use China Citic Bank / Bank of China for international payment — confirm SEVIS fee receipt in the system before booking interview.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Course choice + why this US institution", prompt: "Chinese applicants face 'genuine student' scrutiny. Concrete answer: 'MIT's MEng in Computer Science with research track aligns with my undergraduate thesis at Tsinghua on [topic]. Professor [X]'s work in [Y] specifically extends my prior research.'" },
      { heading: "2. Why the US over UK / Canada / Australia / Singapore", prompt: "Common honest reasons: top-ranked institutions in your specific field, larger research budgets, OPT 3-year STEM extension for industry exposure. Avoid 'better quality' — too vague." },
      { heading: "3. Ties to China + post-study plans", prompt: "Family business, parents' health, property holdings, ongoing Chinese commitments. Honest post-study answer: 'OPT for industry experience, then evaluate H-1B + return-to-China options based on US market conditions.' Saying 'I will absolutely return to China' rings false if you're pursuing a STEM Master's; saying 'I want to stay in the US permanently' triggers immigrant-intent refusal." },
      { heading: "4. Funding source explained", prompt: "Each source documented: parents' company revenue (with corporate tax filings translated + notarised), real-estate sale proceeds, family savings + property + income. Chinese applicants face higher 'unverified provenance' scrutiny — overdocument." },
      { heading: "5. Why your prior education prepares you", prompt: "Connect undergraduate research, projects, prior employment to chosen Master's. Tsinghua / Peking / Fudan / SJTU / ZJU credentials are well-respected; Tier-2 universities need stronger justification of upward fit. International publications + competition results help." },
    ],
    moneySavingTips: [
      "Apply EARLY — Chinese student visa appointments at US consulates in Beijing / Shanghai / Guangzhou stretch 6-12 weeks during May-August peak.",
      "If your undergraduate institution is on the 7 Sons of National Defence list, evaluate the UK / Canada / Australia / Singapore paths as primary — US is institutionally restricted regardless of personal merit.",
      "STEM OPT extension (36 months total) requires your CIP code to be on the STEM-OPT list. Verify BEFORE accepting the offer — some 'Computer Science' programmes are coded as Information Systems (NOT STEM) at certain institutions.",
      "Don't use 'visa-counsellor' services charging RMB 50,000-300,000. The DS-160 + interview prep is well-documented; the fee adds zero value for clean applications.",
      "Health insurance: most US institutions mandate Aetna / Cigna / UnitedHealthcare student plans (~US$2,500-3,500/year). External plans (PSI, ISO) often cheaper if institution allows.",
      "International Wire Transfer: WeChat Pay / Alipay don't work for US tuition. Use Bank of China / ICBC / China Citic — Chinese students often run into US$50k/year cross-border transfer caps; plan multi-step transfers.",
    ],
    lawyerTriggers: {
      diy: [
        "Direct undergrad → graduate progression at non-restricted institution → US Top-50 institution",
        "Clean immigration history, parents'/self-funded with clean provenance, no PLA-affiliated undergrad institution",
      ],
      getALawyer: [
        "Prior F-1 refusal or 214(b) decision at any US Embassy in any country",
        "Undergrad from 7 Sons of National Defence / Beijing Aeronautics / restricted-entity list",
        "STEM programme in semiconductor / aerospace / AI/ML / quantum / biotech fields (Visa Mantis processing common)",
        "Hong Kong / Macau passport (different visa procedures and bilateral context)",
        "Family ties to Chinese government, military, or PLA-affiliated entities (additional vetting)",
        "Spouse + children dependents (F-2 has limited work + study rights)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRITISH → AUSTRALIA — work (Subclass 482 / 189 / 482→186)
  // ════════════════════════════════════════════════════════════════════
  "GB:AU:work": {
    whatCarriesWeight: [
      {
        label: "Subclass 482 with sponsor nomination + TSMIT AUD$73,150",
        why: "UK applicants are the second-largest 482 cohort after Indians. From 1 July 2024 the Temporary Skilled Migration Income Threshold rose to AUD$73,150; below it, refusal. Most British professionals in tech / finance / engineering / health clear it easily but mid-market consultancy salaries can fall short.",
      },
      {
        label: "Subclass 189 General Skilled Migration (points test)",
        why: "189 gives permanent residence on grant — no employer sponsorship needed. Minimum 65 points; competitive scores 85-100+. UK applicants get age (max points 25-32), Skills Assessment via Engineers Australia / VETASSESS / CPA / ACS, English-language test (Proficient at IELTS 7+ adds 10 points, Superior at 8+ adds 20). Subclass 190 (state-nominated) and 491 (regional) add 5/15 points respectively.",
      },
      {
        label: "Working Holiday Subclass 417 — UK-only +35-year extension",
        why: "Under-31 (under-36 from 2024 for UK passport holders specifically — bilateral arrangement extended) British nationals get a 12-month Working Holiday Visa, extendable to 2nd and 3rd year by completing specified regional work. Different from US, Indian, Chinese applicants who have no equivalent. Saves the Subclass 482 path entirely for adventurous mid-career professionals.",
      },
      {
        label: "Skills Assessment via Engineers Australia / ACS / CPA / VETASSESS",
        why: "Assessment is pre-application and 4-12 weeks. UK engineering credentials (CEng MIET, CEng MIMechE) map cleanly. ACS for IT: UK Bachelor's + relevant work history is standard pathway. CPA Australia: ICAEW / ACCA / ACA UK chartership recognised but requires conversion exam in some cases. Start it 6 months before the visa application.",
      },
      {
        label: "Reciprocal Health Care Agreement — UK has one with AU",
        why: "Unique British advantage: the UK-Australia RHCA gives British visitors (including 482 holders) access to Medicare-equivalent emergency care during their first 6 months. After that, Medicare or OVHC kicks in based on visa class. Subclass 482 typically requires OVHC (private health insurance) — but the RHCA buffer eases the first months.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Visa class chosen + why this not Subclass 189", prompt: "If 482: 'My sponsoring employer [X] in Sydney has nominated me for [role] under ANZSCO [code], with offered salary AUD$[Y] above TSMIT.' If 189: 'I'm applying via Skilled Independent permanent visa with CRS [points], occupation [Z] on the Medium-Long Term Strategic Skills List, and a positive Skills Assessment from [authority].'" },
      { heading: "2. Why Australia over Canada / NZ / Singapore", prompt: "Common British reasons: better weather + outdoor lifestyle vs UK, stronger labour market for engineers / health / finance, family ties (Commonwealth migration history), partner already migrated. Be specific — the 482 caseworker reviews thousands of these monthly." },
      { heading: "3. UK exit logistics", prompt: "HMRC tax-residency clean break via P85 form. NHS dental records, council-tax exit, ISA / pension treatment. UK pensions can be transferred via QROPS to an Australian-resident scheme — but post-2024 LTA changes complicate this; specialist advice essential." },
      { heading: "4. Australian city + employer fit", prompt: "Sydney finance / Melbourne pharma / Perth mining / Brisbane biotech / Adelaide defence. Each city has distinct industry concentrations. UK applicants often default to Sydney / Melbourne by name recognition — research the regional alternatives." },
      { heading: "5. Long-term plan + permanent residence pathway", prompt: "482 → 186 (Employer Nomination Scheme) after 2-3 years for permanent residence. Or 189 leading directly to PR. State your honest timeline — UK applicants are reliably approved for PR transitions thanks to clean immigration history and Commonwealth context." },
    ],
    moneySavingTips: [
      "Check Subclass 417 Working Holiday eligibility BEFORE applying for 482 — the bilateral UK-AU agreement gives Brits age 18-35 (extended from 30 in 2024) a 1-year visa, extendable to 3 with regional work. AUD$650 vs AUD$3,210 for 482, and no employer sponsorship required.",
      "UK is on the AUSFTA-equivalent list for SOME visa classes — RHCA covers emergency healthcare for the first 6 months without OVHC, saving ~AUD$300 for short-stay paperwork.",
      "Skills Assessment via VETASSESS: Standard track is AUD$1,200, Priority track is AUD$2,100 (3 weeks vs 6 weeks). For July starts, pay priority.",
      "Don't pay for 482 priority processing (~AUD$1,200) unless your start date is < 6 weeks out. Standard is 1-3 months reliably for UK applicants.",
      "Australian super (11.5% from July 2024) is YOUR money — choose a low-fee fund (Hostplus, Australian Retirement Trust, AustralianSuper) on arrival. UK pension can be transferred to a QROPS-listed super fund tax-free below LSA threshold; above it, complex.",
      "Open an Australian bank account remotely via Commonwealth Bank / NAB / Westpac international onboarding 4-6 weeks before arrival. Wise multi-currency account works for the first paychecks.",
      "British driving licence converts to Australian state licence without practical test in most states (NSW, VIC, QLD, WA). Save 2-3 weeks of L-plate / P-plate process.",
    ],
    lawyerTriggers: {
      diy: [
        "Subclass 417 / 462 Working Holiday application as under-35 British national",
        "Subclass 482 via a major Australian employer (Big 4, ASX-50, FAANG Sydney offices) with clean credentials",
        "Subclass 189 with skilled-occupation Engineering / IT / Accounting + strong CRS score",
      ],
      getALawyer: [
        "Subclass 188 Business Innovation & Investment route (substantial investment + complex evaluation)",
        "QROPS pension transfer — specialist cross-border pension lawyer + tax accountant essential",
        "Prior visa refusal in any country (Commonwealth member-state refusals are weighted heavier in Australia)",
        "Self-employed / consulting Subclass 482 nomination by your own AU company — genuineness scrutiny intense",
        "Same-sex relationship dependent application — Australian recognition is solid but documentation needs care",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // NEW ZEALAND → AUSTRALIA — work (Special Category 444)
  // ════════════════════════════════════════════════════════════════════
  "NZ:AU:work": {
    whatCarriesWeight: [
      {
        label: "Special Category Visa 444 — automatic on arrival",
        why: "NZ citizens with valid NZ passports get the Special Category Visa 444 automatically on arrival in Australia. No application, no fee, no time limit, no employer sponsorship needed. Granted at the Australian border, in your e-passport. This is the closest thing to free-movement between two countries anywhere in the world.",
      },
      {
        label: "What 444 allows + what it doesn't",
        why: "Live and work indefinitely in Australia. BUT: NOT a path to Australian citizenship automatically — until 2023's policy change, 444 holders couldn't naturalise without first getting permanent residence. Since 1 July 2023, NZ citizens resident 4+ years can apply for Australian citizenship directly. Game-changing.",
      },
      {
        label: "Direct citizenship pathway since July 2023",
        why: "NZ citizens with 4+ years' lawful residence in Australia (continuous, with absences ≤90 days/year) can now apply for Australian citizenship without first becoming permanent residents. ~AUD$540 application fee + character test. Far cheaper and faster than the standard PR-then-citizenship route. Australia / NZ dual citizenship is permitted.",
      },
      {
        label: "Tax + Medicare access",
        why: "444 holders are Australian tax residents from day one — file tax with the ATO from your first paycheck. Medicare eligibility under the AU-NZ Reciprocal Health Care Agreement provides basic public-health access for short stays; resident 444 holders get full Medicare from day one of residence.",
      },
      {
        label: "Superannuation rules — NZ-AU portability",
        why: "Australian super contributions from your Australian employer go to a regulated Australian super fund. NZ KiwiSaver balances can be transferred to AU super under the Trans-Tasman Portability Scheme (since 2013). Bidirectional — Australians moving to NZ can transfer in the other direction.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Visa pathway — 444 vs anything else", prompt: "For NZ citizens to AU, the 444 SCV is automatic on arrival. No personal statement needed for entry. Personal statements only apply when you're: (a) applying for Australian citizenship after 4 years, (b) seeking a different visa class for some reason, or (c) a non-citizen NZ resident not eligible for SCV." },
      { heading: "2. Why Australia (for the citizenship application after 4 years)", prompt: "When applying for citizenship: 'I've lived in Australia for [X years] continuously, working as [role] at [company]. My family is here, my career has been built here, and I want to formalise my permanent commitment to Australia.'" },
      { heading: "3. Continuous-residence calculation", prompt: "The 4-year requirement allows ≤90 days absence per year + ≤365 days total absence across the 4 years. Document every overseas trip with passport stamps + boarding-pass records. Caseworkers verify this rigorously." },
      { heading: "4. Australian ties + integration", prompt: "Employment continuity, property purchase, children's schooling, community involvement, Australian partner. Show actual roots — not just years on the calendar." },
      { heading: "5. Character + clean record", prompt: "Australian Federal Police clearance + NZ Police clearance. Any criminal record (even minor traffic offences) needs explanation. The character test is non-trivial for citizenship applications." },
    ],
    moneySavingTips: [
      "Don't apply for ANY Australian visa as an NZ passport holder — the SCV 444 is automatic and FREE on arrival. Some agents charge for 'application services' that don't exist.",
      "KiwiSaver to AU super transfer: do it via your AU super fund (most major funds — Australian Retirement Trust, Hostplus, AustralianSuper — handle this). Free transfer, no tax penalty.",
      "Australian Medicare card application on arrival: take your NZ passport + AU address proof to a Medicare office or apply via myGov. Free.",
      "Australian Tax File Number (TFN) on arrival day: apply online at ato.gov.au. Free. Without it, your first paycheck is taxed at 47%.",
      "Australian citizenship application: AUD$540 + AUD$25 (citizenship test, which you'll likely pass first try with prior AU residence). Compare to standard PR + citizenship cost of AUD$10k+ — significant saving.",
      "Don't transfer your NZ driver's licence — your NZ licence is valid in Australia indefinitely under the Trans-Tasman arrangement. Apply for an AU licence only if you want voting / ID purposes.",
    ],
    lawyerTriggers: {
      diy: [
        "Standard arrival on NZ passport — no application needed, 444 granted automatically",
        "Citizenship application after 4+ years residence with clean records",
      ],
      getALawyer: [
        "Criminal record (even minor) — character test for citizenship is non-trivial",
        "Children born in Australia to NZ-citizen parents (specific birth-status complexity)",
        "Dual citizenship to a country that doesn't permit it (Indonesia, China, etc.) — must surrender one",
        "Application after extensive overseas absences (>365 days total across the 4 years)",
        "Health conditions triggering character / public-interest review",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // NEW ZEALAND → USA — work (E-3 NZ since 2023!)
  // ════════════════════════════════════════════════════════════════════
  "NZ:US:work": {
    whatCarriesWeight: [
      {
        label: "E-3 'NZ' visa — exclusive Kiwi route since 2023",
        why: "Until 2023 only Australians had access to the US E-3 visa under AUSFTA. In December 2022 the US-NZ Tradition of Friendship Act extended E-3 status to New Zealanders specifically — 1,200/year reserved for NZ citizens. NZ$385 USCIS petition fee + US$315 visa fee = far cheaper than H-1B + L-1 routes. 2-year stay, renewable indefinitely, spouse can work without restriction. Most NZ professionals don't know it exists.",
      },
      {
        label: "Specialty Occupation classification",
        why: "E-3 requires the role to be a 'specialty occupation' — typically requiring a Bachelor's degree in a specific field. NZ engineers, accountants, lawyers, computer professionals, scientists clear this. Trades and unskilled workers don't qualify for E-3 — use H-2B or family-sponsorship routes.",
      },
      {
        label: "L-1A / L-1B intracompany transfer (still available)",
        why: "If your NZ employer has a US office (most NZ-listed companies do), L-1A (manager/exec, 7-year max) or L-1B (specialised knowledge, 5-year max) bypasses the lottery. L-1A → EB-1C green card with manageable backlog.",
      },
      {
        label: "Visa interview at the US Consulate in Auckland or Sydney",
        why: "US Consulate Auckland processes most NZ visa applications — manageable wait times (1-3 weeks) compared to Asia / Latin America consulates. Sydney is the alternate for some categories.",
      },
      {
        label: "FBI clearance — pre-arrival document",
        why: "USCIS may request police clearances from countries you've lived in for 12+ months. NZ Police certificate via the NZ Ministry of Justice (~NZ$30, 20 working days). Add Australian Federal Police if you've spent time there via SCV 444.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. E-3 NZ vs other US visa options", prompt: "If E-3: 'My role qualifies as a specialty occupation under the US-NZ Tradition of Friendship Act. The sponsoring US employer [X] has filed Labor Condition Application certifying the role and salary.' Be explicit you're using the NZ-specific E-3 quota, not generic H-1B." },
      { heading: "2. Why the US (specific city + industry)", prompt: "Common Kiwi reasons: tech industry concentration (SF / NYC / Boston), startup ecosystem, larger market size, family already in US. Pair lifestyle with industry specifics. Avoid 'the American dream' framing — it rings hollow." },
      { heading: "3. NZ ties + return option", prompt: "Family in NZ, property, ongoing business interests, employment relationships. The US-NZ relationship is informal — most Kiwi E-3 holders move between the two over their careers. State honest intent: 'I plan to use E-3 for 2-4 years US industry experience, with option to return to NZ or transition to green card.'" },
      { heading: "4. Family arrangements", prompt: "E-3 spouse can apply for EAD (work authorisation) — uniquely flexible vs Australian E-3 dependents. School-age kids: standard US public-school enrolment. Mention family if accompanying." },
      { heading: "5. Long-term plan", prompt: "E-3 isn't a direct green-card route, but you can transition to EB-2 / EB-3 with your US employer's I-140 petition. NZ-born applicants have CURRENT priority dates for EB-2 (no backlog) — green card achievable in 2-4 years from filing." },
    ],
    moneySavingTips: [
      "E-3 NZ saves ~US$2,000 vs H-1B (no premium processing needed, no DOL LCA prevailing-wage scrutiny equivalent). Use it.",
      "1,200 annual E-3 NZ quota is rarely hit — apply any time of year. Compare to H-1B's 85,000 cap reached within days each April.",
      "Skip the H-1B lottery entirely if you qualify for E-3. Saves both money and the 1-in-5 lottery roulette.",
      "Open a US bank account remotely via Chase / Citi / HSBC US international onboarding 4-6 weeks before arrival. NZ-issued international cards (Westpac, ANZ, ASB) work for US transactions but with international fees.",
      "NZ Police certificate via NZ Ministry of Justice — NZ$30 vs commercial 'fast-track' services charging NZ$200+.",
      "Don't repatriate KiwiSaver on departure — leave it invested. Withdrawal pre-65 is tax-disadvantaged and the savings keep compounding. Coordinate with your NZ provider for cross-border options.",
    ],
    lawyerTriggers: {
      diy: [
        "Standard E-3 NZ via a major US employer (FAANG, Big 4, finance) with established immigration support",
        "L-1A / L-1B transfer from a major NZ employer with US office",
      ],
      getALawyer: [
        "Specialty-occupation classification challenges (some roles get questioned)",
        "EB-1A / EB-1B self-petition with NZ academic / executive record",
        "Pension transfer planning — KiwiSaver + US retirement-account interaction is specialist",
        "Spouse / dependent applications with non-US-NZ-passport family members",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRAZILIAN → PORTUGAL — family (citizenship via CPLP)
  // ════════════════════════════════════════════════════════════════════
  "BR:PT:family": {
    whatCarriesWeight: [
      {
        label: "Brazilian citizenship by descent for Portuguese-heritage applicants",
        why: "Brazilians with a Portuguese-born parent (or for some routes grandparent) qualify for Portuguese citizenship via direct attribution. Easier than naturalisation — apply at a Portuguese consulate in Brazil OR at an AIMA office in Portugal. Free of charge for direct-line descent under jus sanguinis.",
      },
      {
        label: "CPLP free-movement agreement (Lusophone fast-track)",
        why: "The Community of Portuguese Language Countries (CPLP) gives Brazilian nationals significant procedural shortcuts at AIMA: simplified residence permit applications, reduced documentation requirements, lower fees, and faster processing than non-CPLP nationals. Portuguese language proof not required (it's your native language).",
      },
      {
        label: "Reagrupamento Familiar (Family Reunification) for spouses",
        why: "Brazilian spouses of Portuguese citizens / EU citizens / Portuguese residents apply via Reagrupamento Familiar. Requires marriage certificate apostilled (Hague Convention — Brazil signed), proof of cohabitation, sponsor's income evidence. AIMA processing typically 4-9 months in 2024-2025 (massive backlogs reduced from 2022-2023 peak).",
      },
      {
        label: "Brazilian Civil Registry + Portuguese citizenship attribution",
        why: "If your Portuguese parent registered your birth at the Portuguese consulate in Brazil within the validity window, you may already BE Portuguese (just need passport issuance). Many Brazilians of Portuguese descent don't know this. Check your birth registration before pursuing naturalisation routes.",
      },
      {
        label: "Sephardic Jewish heritage closed 2022",
        why: "Decree-Law 30-A/2022 closed the Sephardic Jewish descent pathway in March 2022. Applications submitted before that date are still being processed but no new submissions accepted. If you're descended from Portuguese Sephardic Jews (heritage from pre-1497 expulsion), check whether your application was filed in time.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Pathway chosen", prompt: "Direct attribution via Portuguese parent (atribuição), grandparent route (with effective-ties demonstration), spouse via Reagrupamento Familiar, or naturalisation after 5 years residence. Each has different evidence requirements." },
      { heading: "2. Your Portuguese descent chain", prompt: "For attribution: 'My [parent / grandparent] [Maria Silva] born [date] in [Coimbra / Porto / Lisboa / Açores / Madeira / etc.] emigrated to Brazil in [year]. Their Portuguese birth certificate, marriage certificate to my Brazilian-born [other parent], and Brazilian-side documentation of my birth establish the descent.'" },
      { heading: "3. Effective ties (for grandparent route)", prompt: "Demonstrate Portuguese cultural / linguistic / community ties — visits to Portugal, family contacts maintained, Portuguese-language usage, participation in Portuguese cultural events in Brazil. Required only for grandparent route." },
      { heading: "4. Spouse-route family evidence", prompt: "For Reagrupamento Familiar: marriage certificate apostilled, joint financial accounts, cohabitation evidence, Portuguese spouse's tax records + income evidence. Submit at the Portuguese consulate in your Brazilian city of residence." },
      { heading: "5. Long-term plan", prompt: "Portuguese citizenship = EU citizenship = freedom of movement across 27 EU states + Schengen + EEA. Brazilians dual-nationally permitted. After Portuguese citizenship issuance, you can move to any EU member state under Article 21 TFEU." },
    ],
    moneySavingTips: [
      "Brazilians have the cheapest EU-citizenship-by-descent route — no application fee for direct attribution, only document apostille + sworn translation costs (~R$500-1,500 total).",
      "Hire a Portuguese lawyer (advogado) in Lisbon or Porto only if you're going the grandparent or naturalisation route. Direct-attribution applications can be filed by the applicant themselves at the consulate (~R$1,000 saving).",
      "Brazilian Apostille via competent Brazilian Cartório (notary) — typically R$50-200 per document, 1-3 days. Don't pay 'fast-track' services 5x more.",
      "Portuguese sworn translation (tradução juramentada) — required for Brazilian documents in Portugal. Hire a Portuguese-certified translator (Tradutor Ajuramentado registered with the Ordem dos Advogados de Portugal) — R$50-150/page in Brazil vs €30-50/page in Portugal.",
      "Once Portuguese citizenship is granted, transfer your Brazilian INSS contributions to Portuguese Segurança Social via the Brazil-Portugal Bilateral Agreement. Reduces double-contribution loss.",
      "Open an EU bank account remotely via N26 / Revolut / Wise — much faster than waiting for Portuguese citizenship to open a high-street account.",
    ],
    lawyerTriggers: {
      diy: [
        "Direct attribution with a Portuguese-born parent — well-documented chain",
        "Reagrupamento Familiar with clean spousal evidence and Portuguese spouse with stable employment",
      ],
      getALawyer: [
        "Grandparent route requiring 'effective ties' demonstration",
        "Sephardic Jewish heritage (closed route) — appeals or pending applications",
        "Naturalisation after 5 years residence with documentation gaps",
        "Brazilian Civil Registry / Portuguese Civil Registry conflict on your birth registration",
        "Prior Portuguese visa refusal or AIMA / SEF history",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // MEXICAN → USA — family (IR-1 / CR-1)
  // ════════════════════════════════════════════════════════════════════
  "MX:US:family": {
    whatCarriesWeight: [
      {
        label: "IR-1 vs CR-1 — when the 2-year marriage matters",
        why: "If you've been married 2+ years at the time of I-130 approval: IR-1 (10-year unrestricted green card on arrival). If less than 2 years: CR-1 (2-year conditional green card, requires I-751 Removal of Conditions filed 90 days before expiry). Mexican applicants have the third-largest IR-1/CR-1 cohort after the Philippines and India.",
      },
      {
        label: "I-130 + Mexican consular processing wait times",
        why: "Form I-130 is the petition US citizen / LPR spouse files. After I-130 approval (currently 7-15 months), the case transfers to NVC then to US Consulate Ciudad Juárez (USCJ) — which handles 100% of Mexican IR-1/CR-1 immigrant visa interviews. Total timeline: 12-24 months from I-130 filing to visa issuance. Mexican applicants face the longest consular wait in the world (Juárez handles ~25% of all US family-immigration interviews globally).",
      },
      {
        label: "Form I-864 Affidavit of Support — the income test",
        why: "US citizen spouse must show income at 125% of the Federal Poverty Guidelines (or 100% for active military). For 2026: ~US$25,000/year for a 2-person household, ~US$32,000 for 3-person, etc. If income falls short, joint sponsor permitted (any US-citizen or LPR adult earning enough). Most-failed step for Mexican applications when sponsor is mid-income earner.",
      },
      {
        label: "Mexican Constancia de Antecedentes Penales",
        why: "Mexican PCC issued by the State Procuraduría where you've lived 6+ months. Some states (Jalisco, Nuevo León) have rapid online systems (~7 days); others (rural states) take 2-4 weeks. Apostille via SEGOB for US use — adds 1-2 weeks. Start this 6 months before USCJ interview.",
      },
      {
        label: "Medical exam at USCJ-designated panel physician in Ciudad Juárez",
        why: "Mexican applicants typically travel to Juárez for medical + interview combined. Designated panel physicians publish their list at travel.state.gov. Vaccination records required + chest X-ray + serology. Costs ~US$300-400. Book 4-6 weeks before interview to allow result processing.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Marriage history + sponsor relationship", prompt: "How and when you met your US-citizen spouse. Marriage location, date, witnesses, family attendance. Mexican-US marriages are routinely scrutinised for genuineness — concrete dates + detailed narrative beat generic 'we fell in love' framing." },
      { heading: "2. Relationship evidence across categories", prompt: "Financial (joint accounts, shared bills), household (lease / mortgage in both names), social (photos across the relationship, family attendance at events), communication (WhatsApp / iMessage logs during separations). Spread matters more than volume in any one category." },
      { heading: "3. US spouse's income + Affidavit of Support", prompt: "Sponsor's last 3 years of tax returns, employer letter, current pay stubs (last 3 months). If income at 125% FPG: standalone affidavit. If below: joint sponsor required + their full I-864 + income documentation. Mexican applicants frequently use multi-sponsor structures when household income is borderline." },
      { heading: "4. Why the US (post-arrival plans)", prompt: "Where you'll live, what your work plans are, kids' schooling. Caseworkers want to see settled-life intent — vague 'we'll figure it out' rings false. State the city, the Mexican spouse's intended work path (eligible for EAD on arrival), kids' school district." },
      { heading: "5. Travel history + intent honesty", prompt: "Mexican applicants with B1/B2 visa overstays face complex unlawful-presence consequences. Caseworkers verify entry / exit dates via CBP records. Be honest about any overstay — fixable via I-601A provisional waiver in some cases, but lying is automatic refusal." },
    ],
    moneySavingTips: [
      "Don't pay 'notario' / 'consultor de inmigración' for I-130 filing. The USCIS form is well-documented; the typical fee of MXN 30,000-80,000 adds zero value for clean cases. Use a licensed US-side immigration attorney (US$1,500-3,500) only if you have complications.",
      "Mexican Constancia de Antecedentes Penales: apply at the state Procuraduría online portal (Jalisco, CDMX) — MXN 100-300 vs commercial 'gestor' fees of MXN 1,500+.",
      "Apostille via SEGOB (Mexico City) takes 1-3 days at the SEGOB Apostille office. Don't pay for express services unless your timeline is < 2 weeks to USCJ interview.",
      "Medical exam at USCJ-designated panel physician: shop the published list. Costs vary US$280-500 — some panel physicians markup significantly.",
      "Plan USCJ travel: stay at El Paso (US side, safer + cheaper hotels) vs Juárez side. Cross at Stanton St / Bridge of the Americas for the consulate interview.",
      "USCIS Immigrant Fee (US$220) — payable after visa issuance, before entering US. Don't forget this — without payment, your green card won't be mailed.",
      "I-864 joint sponsor: ANY US-citizen / LPR adult can be joint sponsor (parent, sibling, friend), not just family. Don't pay a 'sponsorship service' — friends qualify if their tax returns are clean.",
    ],
    lawyerTriggers: {
      diy: [
        "Clean marriage 2+ years, US-citizen spouse with W-2 income at 200%+ FPG, no prior US visa history",
        "Recent marriage (CR-1) with strong relationship evidence + clean records",
      ],
      getALawyer: [
        "Prior US visa overstay, refusal, or removal in your or your spouse's history",
        "Conviction (any) — Mexican applicants with even minor convictions need careful waiver work",
        "Self-employed US spouse with complex tax returns / business income",
        "Same-sex marriage in a US state that recognises it (federal recognition is automatic but border-state interview comfort varies)",
        "I-601A provisional waiver for prior unlawful presence — specialist work that's worth the US$3-5k legal fee",
        "Children from prior relationships requiring K-2 / step-relationship petitions",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // NIGERIAN → UK — work (Skilled Worker / Health & Care)
  // ════════════════════════════════════════════════════════════════════
  "NG:GB:work": {
    whatCarriesWeight: [
      {
        label: "Health & Care Worker visa — the Nigerian NHS pipeline",
        why: "Nigerian doctors, nurses, midwives, paramedics, social-care workers fast-track to the UK via Health & Care Worker visa. Salary threshold £29,000 (vs £38,700 general Skilled Worker), IHS-EXEMPT (£5,175 saving over 5 years), reduced visa fees. NHS Trusts and major care providers actively recruit Nigerian healthcare professionals.",
      },
      {
        label: "General Skilled Worker £38,700 threshold",
        why: "Nigerian applicants in finance, tech, engineering, consultancy go via standard Skilled Worker. £38,700 minimum (or going rate, whichever higher). Below threshold = refusal. Nigerian Tier 2 banks' London offices (FBN UK, Zenith UK) and Big 4 advisory firms have established sponsorship pipelines.",
      },
      {
        label: "Nigerian PCC + UK background scrutiny",
        why: "Nigerian Police Character Certificate via Nigerian Police Force (~4-8 weeks). Apply at NPF state command or via online services. UKVI cross-references against international warrant databases. Nigerian applicants with clean records get standard processing; any flag triggers extensive background review.",
      },
      {
        label: "TB test mandatory for stays > 6 months",
        why: "Nigeria is on the UK TB-test country list. Indo-Trust Lagos and IOM Migration Health Centres in Lagos / Abuja are approved. Costs ~NGN 90,000 (~US$60). Book BEFORE the visa appointment — results need 5-10 days processing.",
      },
      {
        label: "Funds threshold £1,270 maintenance",
        why: "Skilled Worker requires £1,270 in your own account for 28 consecutive days (or sponsor certification waiving this). Each dependent adds £285 (£855 family of 4). Nigerian banks' GBP-denominated accounts work — UK consulate accepts NGN-equivalent statements with sworn exchange-rate translations.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Visa route + employer", prompt: "Health & Care Worker for healthcare professionals (much faster, IHS-free) or Skilled Worker for everything else. State sponsoring employer + role + start date + salary + occupation SOC code." },
      { heading: "2. Why the UK", prompt: "Nigerian applicants' reasons: English-language work environment, established Nigerian diaspora (~500k in UK), NHS recruitment for healthcare professionals, post-Brexit relaxation of skilled-worker rules, family ties to UK-based Nigerian community." },
      { heading: "3. Your qualifications + UK recognition", prompt: "Nigerian MBBS recognised by GMC (after PLAB exam or accepted equivalent). UK Pharmacist requires GPhC registration. Engineers benefit from MICE / ICE chartership. Be explicit about which UK professional-body registration you've completed or are pursuing." },
      { heading: "4. Financial source + sponsor", prompt: "If self-funded: Nigerian bank statements + employment evidence. If family-sponsored: full family financial documentation. Nigerian Naira → GBP conversion clearly documented with bank stamps." },
      { heading: "5. Long-term intent", prompt: "Skilled Worker → ILR (Indefinite Leave to Remain) at year 5 → British citizenship at year 6. Nigerian dual citizenship is permitted by both countries. State your honest pathway intent." },
    ],
    moneySavingTips: [
      "Health & Care Worker visa: IHS-EXEMPT saves £5,175 over 5 years vs Skilled Worker. ALWAYS check this route first if you're in nursing / care / paramedical.",
      "Nigerian Police Character Certificate via NPF Lagos online portal: ~NGN 10,000 vs commercial 'gestors' charging NGN 50,000+.",
      "TB test at Indo-Trust Lagos: NGN 85,000-95,000 standard. Don't pay 'express' premiums unless your appointment is in < 2 weeks.",
      "MOI (Medium of Instruction) letter from your Nigerian university bypasses IELTS for English proof. Save NGN 80,000+ on the IELTS fee. Most Nigerian institutions issue MOI letters within 1-2 weeks.",
      "Priority processing UK Skilled Worker (£500) — worth it if your start date is < 4 weeks out. Standard processing for Nigeria is 3-5 weeks reliably.",
      "Open a UK bank account before arrival via Monzo / Starling / Revolut — they accept BRP within 24 hours. High-street banks demand 3 months of UK address proof first.",
      "Nigerian Pension Fund: leave it invested in Nigeria for compound returns. Cross-border pension transfers are complex and often tax-disadvantageous; specialist advice from a Nigerian PFA is essential.",
    ],
    lawyerTriggers: {
      diy: [
        "Health & Care Worker visa via NHS Trust with recruiter pipeline (e.g. NHS Professionals)",
        "Standard Skilled Worker via major employer (Big 4, FAANG, FBN UK, GTB UK) with clean credentials",
      ],
      getALawyer: [
        "Prior UK visa refusal in your or family member's history",
        "Self-employed / business-owner applicant where sponsor compliance is uncertain",
        "Innovator Founder route (£50k+ investment requirement)",
        "Adult Dependent Relative visa for elderly parents — extremely high refusal rate",
        "Funding from non-immediate-family sources — provenance scrutiny intense for Nigerian applications",
        "Conviction (any) or immigration violation in your history — Nigerian applications get rigorous review",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // PAKISTANI → UK — family (Spouse / Family Reunion)
  // ════════════════════════════════════════════════════════════════════
  "PK:GB:family": {
    whatCarriesWeight: [
      {
        label: "Spouse visa minimum-income requirement: £29,000",
        why: "From 11 April 2024 the UK Spouse visa minimum income for the UK-based sponsor is £29,000 (rising to £38,700 in 2027). Below threshold = automatic refusal. Most-failed test for Pakistani spouse applications. Sponsor's last 6 months of payslips + employer letter + bank statements must demonstrate this — savings substitution permitted at £88,500+ in cash held 6+ months.",
      },
      {
        label: "Genuineness test — Pakistani applications get the deepest scrutiny",
        why: "Pakistani spouse visa applications face the most intensive caseworker scrutiny worldwide due to historical arranged-marriage / forced-marriage concerns. Caseworkers cross-check: shared accommodation history, family member statements, telephone records, photographs at culturally-significant events (Eid, Nikkah, family gatherings), and prior visits. Generic photo bundles get refused; spread + specificity wins.",
      },
      {
        label: "Pakistani PCC (Police Character Certificate)",
        why: "PCC from Pakistani Special Branch (each provincial Police HQ). Lahore, Karachi, Islamabad police HQs process applications. ~2-4 weeks typical; sometimes 6-8. MOFA attestation often required for international use. Some applicants additionally need a Federal Investigation Agency (FIA) clearance — verify before submission.",
      },
      {
        label: "TB test mandatory at IOM-approved clinic",
        why: "Pakistan on UK TB-test country list. IOM Islamabad / Karachi / Lahore are approved. ~PKR 12,000 (~US$45). Book BEFORE the visa appointment — results need 5-10 days.",
      },
      {
        label: "English language at A1 minimum + relationship evidence",
        why: "Spouse visa applicant needs CEFR A1 English (basic conversation). IELTS for UKVI or approved equivalent. Some applicants exempt (UK degree, English-medium country citizen, age 65+). Pakistani applicants from English-medium school backgrounds may have MOI letters but should verify acceptance.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Marriage circumstances", prompt: "Date, place, religious + civil ceremony, witnesses, family present. Pakistani marriages often have multiple ceremonies (Nikkah, Walima, etc.) — document each with dates + photos. For arranged marriages: explicitly state how the introduction happened (family, matchmaker, prior acquaintance), and the development from introduction to marriage." },
      { heading: "2. Relationship history + visits", prompt: "Pre-marriage acquaintance period — phone calls, video chats, family visits. Post-marriage visits by the UK-based spouse to Pakistan, and (where possible) Pakistani spouse's visits to UK via Visitor visa. Document EACH visit with passport stamps + boarding passes + dated photos." },
      { heading: "3. Sponsor income + Affidavit-of-Support equivalent", prompt: "UK sponsor's last 6 months payslips + P60 + employer letter + bank statements. If self-employed: full SA302 / Tax Calculations + business accounts. Cross-reference each figure against tax records." },
      { heading: "4. Plans for the UK", prompt: "Where you'll live (joint tenancy / sponsor-owned property / family home), employment plans for the applicant (spouse can work full-time on Spouse visa from day one), children if any, integration plans." },
      { heading: "5. Long-term intent", prompt: "Spouse visa 2.5-year initial + 2.5-year extension → ILR at year 5 → British citizenship at year 6. Pakistan permits dual citizenship via NICOP / POC. State your honest long-term plan." },
    ],
    moneySavingTips: [
      "Pakistani Special Branch PCC: apply directly at provincial police HQ (~PKR 500). Don't pay 'agents' charging PKR 15,000+.",
      "MOFA attestation: only needed if requested by UK Home Office or for certain documents. Verify before paying for it — some Pakistani agents over-attest unnecessarily.",
      "TB test at IOM Karachi / Islamabad: PKR 11,000-13,000 standard. Don't pay 'express' premiums unless under 2 weeks to appointment.",
      "MOI (Medium of Instruction) letter from your Pakistani institution waives IELTS if your education was English-medium. Save PKR 30,000+ on test fees.",
      "Don't use 'visa consultant' agencies charging PKR 200,000+ for what an English-speaking applicant can do directly. UKVCAS application portal is well-documented at gov.uk.",
      "Priority processing UK Spouse visa (£500) — generally NOT worth it for spouse applications (multi-year process anyway). Standard 12-week processing is the norm.",
      "ILR (Indefinite Leave to Remain) at year 5: £2,885 + Life-in-the-UK Test (£50). Start saving from year 1.",
    ],
    lawyerTriggers: {
      diy: [
        "Clean spouse application with UK sponsor at salary £35k+ above threshold and strong relationship evidence",
        "Second visit visa application after clean prior visit history",
      ],
      getALawyer: [
        "Spouse income at or below threshold with savings-substitution strategy",
        "Prior UK visa refusal in your or sponsor's history",
        "Sponsor self-employed or business-owner with complex tax filings",
        "Adult Dependent Relative application for elderly Pakistani parents — UK's hardest family route",
        "Conviction (any) in your or family member's history",
        "Allegations of arranged-marriage / forced-marriage concerns or prior fraud findings",
        "British dependent children from prior relationships — Best Interests of the Child considerations",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → USA — family (IR-1 / CR-1)
  // ════════════════════════════════════════════════════════════════════
  "IN:US:family": {
    whatCarriesWeight: [
      {
        label: "I-130 + Mumbai consular processing",
        why: "Indian applicants' I-130 (petition by US-citizen / LPR spouse) processing: 7-15 months at USCIS. After approval, consular processing transfers to US Consulate Mumbai (handles most Indian IR-1/CR-1) or US Embassy New Delhi. Mumbai is the world's third-busiest immigrant visa consulate. Total timeline: 12-24 months from I-130 filing.",
      },
      {
        label: "F-2A (LPR spouse) vs IR-1 (US-citizen spouse) wait times",
        why: "If your US-based spouse is a US citizen: IR-1/CR-1, no visa backlog, current priority dates. If your spouse is an LPR (green card holder): F-2A category with longer waits (currently 2-3 years for India). Many Indian families wait to file F-2A until the US-based spouse naturalises.",
      },
      {
        label: "I-864 Affidavit of Support — Indian-sponsor income",
        why: "US sponsor income at 125% Federal Poverty Guidelines (~US$25k for 2-person, $32k for 3, $39k for 4). For Indian-American sponsors in California / NY / NJ, this is easily cleared. Mid-income sponsors in lower-cost states may need joint sponsors. Indian applications routinely use joint sponsors from extended family.",
      },
      {
        label: "Indian PCC via passportindia.gov.in",
        why: "PCC issued by your regional passport office (RPO). Apply online at passportindia.gov.in — appointment-based. ~INR 500 + INR 50 SMS fee. Standard processing 7-21 days; longer if you've moved addresses in the past 5 years (each prior address may require police verification).",
      },
      {
        label: "Medical exam at Mumbai panel physician + COVID-19 + vaccinations",
        why: "Mumbai consulate has its panel-physician list. Most Indian applicants travel to Mumbai for combined medical + interview. ~INR 5,000-12,000. Schedule 4-6 weeks before interview. Updated vaccinations required (annual flu, COVID-19, MMR, etc.).",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Marriage history + family circumstances", prompt: "Where + when + religious + civil ceremonies. Indian families often have multiple ceremonies (engagement, mehndi, wedding, reception) — document each with dates + photos + attendees. For arranged marriages: explicitly state the matchmaking history — relatives, marriage bureau, online matrimonial site, mutual contacts. Caseworkers expect this for Indian applications and a clear narrative beats vague references." },
      { heading: "2. Relationship evidence across categories", prompt: "Joint bank accounts (NRO/NRE in India), shared lease/property in India, joint mobile-phone contracts, joint utility bills, family photos at major events (festivals, weddings, birthdays), WhatsApp / iMessage logs during separations. Spread matters — Indian caseworkers want to see normal-married-life evidence, not just one type." },
      { heading: "3. US sponsor's financial setup", prompt: "Sponsor's W-2 + tax returns last 3 years, current pay stubs, employer letter, bank statements. If sponsor is Indian-American business owner: full Schedule C + business income documentation. Joint sponsors (extended family, friends) common in Indian applications — full I-864 for each." },
      { heading: "4. Why the US (post-arrival plans)", prompt: "Where you'll live, applicant's employment plans (eligible for EAD on arrival), kids' schooling. Most Indian IR-1 applicants land in California / Texas / NJ / Chicago / Atlanta — concentrated Indian-American communities. State the specific city + neighbourhood." },
      { heading: "5. Long-term intent", prompt: "Green card on arrival → 5-year citizenship pathway (with continuous physical presence). India does NOT permit dual citizenship — Indian citizens who naturalise as Americans must surrender Indian passport, but can apply for OCI (Overseas Citizen of India) which gives lifelong return rights. State your plan." },
    ],
    moneySavingTips: [
      "Don't pay 'visa consultancy' agencies. The I-130 + DS-260 process is well-documented at travel.state.gov + USCIS. Indian English-speaking applicants can handle 95% of the paperwork directly.",
      "Indian PCC via passportindia.gov.in: INR 500 vs commercial 'gestor' fees INR 5,000+.",
      "Mumbai panel physician: shop the published list. Costs vary INR 5,000-12,000 — some panel physicians markup significantly for foreign-currency-earning applicants.",
      "Apostille via MEA (Ministry of External Affairs) New Delhi: INR 50-100 per document, 3-5 days. Don't pay 'fast-track' services 10x more unless under critical timeline.",
      "USCIS Immigrant Fee (US$220): payable after visa issuance, before entering US. Easy to forget — green card won't be mailed without it.",
      "I-864 joint sponsor: ANY US citizen / LPR adult with sufficient income qualifies. Indian applicants often use US-citizen friends or extended family — perfectly legitimate.",
      "OCI (Overseas Citizen of India) application: file AFTER getting US citizenship via the OCI online portal at ociservices.gov.in. ~US$275 fee + Indian consulate processing.",
    ],
    lawyerTriggers: {
      diy: [
        "Clean marriage 2+ years with W-2-earning US-citizen sponsor, clean documentation",
        "Recent marriage (CR-1) with strong relationship evidence + steady employment",
      ],
      getALawyer: [
        "Prior US visa refusal, overstay, or removal in your or sponsor's history",
        "Self-employed Indian-American sponsor with complex business income",
        "F-2A (LPR spouse) with priority-date timing strategy",
        "Conviction (any) on your or sponsor's record",
        "Same-sex marriage where you / sponsor face complications in home jurisdiction recognition",
        "Multi-step strategy: K-1 fiancé + adjustment of status, or B1-B2 → adjustment (specialist domain)",
        "Children from prior relationships requiring step-relationship petitions",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // CHINESE → CANADA — study (Study Permit + SDS)
  // ════════════════════════════════════════════════════════════════════
  "CN:CA:study": {
    whatCarriesWeight: [
      {
        label: "Student Direct Stream (SDS) for Chinese applicants",
        why: "China is on the SDS country list (since 2024). 20-day processing target vs 8-16 weeks regular. Requires: IELTS 6.0+ overall, GIC (Guaranteed Investment Certificate) CAD$20,635 from Scotiabank / RBC / CIBC / TD / BMO, full first-year tuition paid, upfront medical exam.",
      },
      {
        label: "Provincial Attestation Letter (PAL) + provincial caps",
        why: "Since 22 January 2024 most applicants need a PAL from the province where they'll study. Ontario, BC, Quebec issue PALs — caps fill by mid-year. Chinese applicants to Ontario universities should secure PAL immediately upon admission. Without PAL, no study permit possible.",
      },
      {
        label: "Letter of Acceptance from DLI",
        why: "Canada only issues study permits for DLI-listed institutions. Most public universities (U of T, McGill, UBC, McMaster, Waterloo, Western, Queen's) are DLIs. Some private colleges aren't — verify before paying deposit. SDS applications additionally require the institution to be on the Designated Learning Institution list with current good standing.",
      },
      {
        label: "Financial documentation matching the LoA figure",
        why: "Chinese applicants face additional scrutiny on funding provenance. Bank statements 6+ months, parents' / sponsor's employment evidence + tax records, real-estate holdings + property documentation. Each rupee or yuan should match an underlying source — caseworkers cross-check rigorously.",
      },
      {
        label: "Upfront medical exam (SDS requirement)",
        why: "Medical at IRCC-approved panel physician BEFORE applying. Beijing, Shanghai, Guangzhou panel physicians published at canada.ca. ~RMB 1,500-2,500. Required for SDS — speeds the overall process by 2-3 weeks.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. SDS / regular Study Permit + why this institution", prompt: "If SDS: 'I'm applying via the Student Direct Stream as a Chinese national, with GIC certificate from Scotiabank for CAD$20,635, IELTS overall 6.5, full first-year tuition paid.' Name the institution + programme + start date." },
      { heading: "2. Why Canada vs US / UK / Australia / Singapore", prompt: "Common Chinese reasons: more stable immigration policy than recent US, lower tuition than UK / Australia, English-language environment, Post-Graduation Work Permit (PGWP) up to 3 years, Express Entry Canadian Experience Class pathway for permanent residence." },
      { heading: "3. Why this specific programme + course fit", prompt: "Faculty research, industry placement record, location's industry ecosystem (Waterloo for tech, Vancouver for film, Toronto for finance, Montreal for AI/ML). Specifics: 'Waterloo's Master of Engineering with specific industry placement program in [field] aligns with my undergraduate research at Tsinghua on [topic]'." },
      { heading: "4. Funding source — provenance documented", prompt: "Each yuan source explained. Parents' employment + ITR-equivalent, real-estate sale proceeds (with property documentation + sale contracts), inheritance, family business revenue. Chinese applications face higher provenance scrutiny — overdocument." },
      { heading: "5. Post-study intent + Express Entry pathway", prompt: "PGWP (1-3 years post-graduation, unrestricted work) → Canadian Experience Class for permanent residence. Honest answer: 'I plan to use PGWP for 1-2 years industry experience, then apply for permanent residence via Express Entry CEC stream.' Saying 'I'll definitely return to China' rings false when the route is built for the opposite — state honest dual-track intent." },
    ],
    moneySavingTips: [
      "SDS GIC at Scotiabank: CAD$200 setup + CAD$20,635 deposit. Compare against RBC ($150 setup + same deposit) and BMO. The deposit IS refunded upon arrival in Canada — only the setup fee is a real cost.",
      "Skip 'study consultants' charging RMB 100,000-500,000. The IRCC online application is straightforward for English-speaking Chinese applicants; total DIY cost is CAD$150 fee + GIC + medical + biometrics.",
      "Provincial Attestation Letter is FREE — request from the province as soon as the LoA arrives. Some Chinese agents charge for this; don't pay.",
      "Canadian universities offer tiered tuition deposits — pay only the minimum required to trigger your LoA (~CAD$3,000-8,000) rather than full first-year tuition. Save cash flow.",
      "IELTS One Skill Retake: if you score 6.0/6.0/6.0/5.5, retake JUST the speaking module (CAD$200) rather than the full test. Most Canadian universities + IRCC accept the One Skill Retake.",
      "Spousal Open Work Permit (SOWP) was tightened in 2024 — only spouses of graduate-level / select professional programmes qualify. Verify before quitting your spouse's Chinese job.",
      "Open a Canadian bank account remotely via Scotiabank StartRight Programme or RBC NewClient — saves the 'no SIN, no account' loop on arrival.",
      "International Wire Transfer: standard Chinese bank wire (Bank of China / ICBC / China Citic) — Chinese applicants face USD/CNY transfer caps (US$50k/year individual). Plan multi-step transfers via family members if needed.",
    ],
    lawyerTriggers: {
      diy: [
        "SDS application with clean documentation + DLI institution + IELTS 6.5+ + GIC + clean immigration history",
        "Direct undergrad → graduate progression at major Canadian university",
      ],
      getALawyer: [
        "Prior visa refusal (Canadian / US / UK / Australian) — refusal history shared across Five Eyes databases",
        "Funding via family-business income or non-immediate-family sources",
        "Undergrad from PLA-affiliated Chinese institution — Canada doesn't have an equivalent to US PP10043 but security screening exists",
        "Pathway college applications (different scrutiny than universities)",
        "Quebec study permit (separate CAQ + federal permit process)",
        "Hong Kong / Macau passport-holders (different visa procedures)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → UK — family (Spouse / Family Reunion)
  // ════════════════════════════════════════════════════════════════════
  "IN:GB:family": {
    whatCarriesWeight: [
      {
        label: "Spouse visa minimum-income requirement: £29,000",
        why: "From 11 April 2024 the UK Spouse visa minimum income for the UK-based sponsor is £29,000 (rising to £38,700 in 2027). Below threshold = automatic refusal. Indian applications: sponsor's last 6 months payslips + employer letter + bank statements. Savings substitution permitted at £88,500+ cash held 6+ months.",
      },
      {
        label: "Genuineness test for arranged-marriage context",
        why: "UK caseworkers don't penalise arranged marriages but DO scrutinise relationship evidence. Document: introduction context (family, matchmaker, mutual contacts), pre-marriage communication, wedding events (multiple ceremonies common), post-marriage cohabitation periods (UK visits by sponsor + Indian-side family visits)." },
      {
        label: "Indian PCC via passportindia.gov.in",
        why: "PCC issued by your regional passport office (RPO). Apply online — appointment-based. ~INR 500. Standard 7-21 days; longer if you've moved addresses in past 5 years.",
      },
      {
        label: "TB test mandatory at IOM-approved clinic",
        why: "India is on UK TB-test country list. IOM clinics in Delhi (Lodhi Estate), Mumbai (Mumbai Migration Health Centre), Chennai approved. ~INR 5,000. Book BEFORE appointment.",
      },
      {
        label: "English at A1 minimum + MOI alternative",
        why: "Spouse applicant needs CEFR A1 English. MOI letter from your Indian institution (most engineering / commerce / professional grads) substitutes for IELTS. Save INR 17,000+ on test fees.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Marriage circumstances + family context", prompt: "Date, place, religious + civil ceremonies (Indian marriages often have multiple — engagement, mehndi, wedding, reception). For arranged marriages: explicitly state introduction history. Caseworkers expect this context — be specific rather than vague." },
      { heading: "2. Relationship evidence", prompt: "Joint bank accounts (NRO/NRE), shared property / lease in India, joint utility bills, family photos at major events, WhatsApp / iMessage logs during separations. Spread matters more than volume in any single category." },
      { heading: "3. Sponsor income + Affidavit-of-Support equivalent", prompt: "UK sponsor's last 6 months payslips + P60 + employer letter + bank statements. If self-employed: full SA302 + business accounts. Cross-reference each figure against tax records." },
      { heading: "4. UK arrangements", prompt: "Where you'll live (joint tenancy, sponsor-owned property, parents' home), employment plans (spouse can work full-time from day one), children if any, integration plans." },
      { heading: "5. Long-term intent", prompt: "Spouse visa 2.5-year initial + 2.5-year extension → ILR year 5 → British citizenship year 6. India doesn't permit dual citizenship — Indian citizens taking British citizenship must surrender Indian passport but can apply for OCI for lifelong return rights." },
    ],
    moneySavingTips: [
      "MOI letter from Indian institution waives IELTS for English proof. Save INR 17,000+. Most institutions issue within 1-2 weeks.",
      "Indian PCC via passportindia.gov.in: INR 500 vs commercial 'gestors' charging INR 5,000+.",
      "TB test at IOM Delhi / Mumbai: INR 5,000 standard. Don't pay 'express' premiums.",
      "Priority processing UK Spouse visa (£500) — generally NOT worth it for spouse applications (multi-year process anyway). Standard 12-week processing is the norm.",
      "ILR at year 5: £2,885 + Life-in-the-UK Test (£50). Start saving from year 1.",
      "Indian National Pension Scheme: leave it invested for compound returns. Cross-border pension transfers are complex and often tax-disadvantageous.",
    ],
    lawyerTriggers: {
      diy: [
        "Clean spouse application with UK sponsor at salary £40k+ above threshold and strong relationship evidence",
      ],
      getALawyer: [
        "Sponsor income at or below threshold with savings-substitution strategy",
        "Prior UK visa refusal in your or sponsor's history",
        "Sponsor self-employed with complex tax filings",
        "Adult Dependent Relative application for elderly Indian parents — UK's hardest family route",
        "Conviction or immigration violation in either party's history",
        "British dependent children from prior relationships — Best Interests of the Child considerations",
      ],
    },
  },
  // ════════════════════════════════════════════════════════════════════
  "PH:US:work": {
    whatCarriesWeight: [
      {
        label: "H-1B lottery + Philippines-specific patterns",
        why: "Filipino H-1B applicants disproportionately work in IT, nursing, accountancy, BPO management. Lottery odds ~20% — same as everyone. BUT: cap-exempt employers (universities, NIH research hospitals, state-affiliated health systems) are LOTTERY-EXEMPT — many Filipino healthcare professionals access US work via cap-exempt nursing positions.",
      },
      {
        label: "EB-3 'Other Workers' category — the slow but accessible route",
        why: "EB-3 covers professionals (Bachelor's required), skilled workers (2+ years training/experience), AND 'other workers' (less-than-2-years training). The 'other workers' subcategory has the lowest entry bar but the longest backlog (~7-10 years for Philippines as of 2026). Common for caregivers, hospitality, agriculture jobs.",
      },
      {
        label: "EB-2 'Schedule A' for registered nurses + PT/OT",
        why: "Schedule A Group 1 includes registered nurses + physical therapists — these have NO labour-certification requirement (the typical 9-18 month bottleneck). Filipino nursing applicants can fast-track green-card filing in months, not years. CGFNS / NCLEX-RN + state license required.",
      },
      {
        label: "NBI Clearance for police certificate",
        why: "Philippines National Bureau of Investigation (NBI) clearance is your police certificate. Apply at clearance.nbi.gov.ph — instant approval if your name has no 'hit'; 5-15 days if a name match needs adjudication. Cheap (~PHP 130 / US$2.30) and fast.",
      },
      {
        label: "Form I-129 + LCA + state nursing license",
        why: "Sponsoring US employer files I-129. For nurses specifically: state Board of Nursing licensure + NCLEX-RN passing score required pre-application. Some states (California, Texas, Florida) have Compact licence eligibility — Philippine nurses can practice in 41 NLC (Nurse Licensure Compact) states with one license.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. US visa pathway chosen", prompt: "H-1B (lottery, employer-sponsored), H-2B (temporary non-agricultural — landscape, hospitality, fish processing), EB-3 (professional / skilled / other-workers green-card track), or Schedule A EB-2 (nurses + therapists). State which route + why." },
      { heading: "2. Employment offer + sponsor", prompt: "Sponsoring US employer + offered role + start date + offered salary. For Filipino healthcare professionals: hospital system + state + specific clinical area. For tech / professional: company + role + base salary." },
      { heading: "3. Philippines ties + family", prompt: "Family in Philippines (parents, siblings, extended family), property holdings, ongoing business interests, OFW (Overseas Filipino Worker) history. Filipinos with strong family ties and clear repatriation intent (or honest 'I plan to stay long-term in US') get cleaner approvals than ambivalent responses." },
      { heading: "4. Why the US over Saudi / UAE / UK / Australia / Canada", prompt: "Filipino applicants often have multiple international work options. Concrete reasons: family in US, existing community, English-language workplace, specific industry concentration. The US has a unique advantage for Filipino healthcare professionals — NCLEX-RN + Schedule A green-card track is faster than Australia / Canada equivalents." },
      { heading: "5. Long-term plan + green-card pathway", prompt: "EB-3 / Schedule A EB-2 → I-140 → AOS for permanent residence. Filipino EB-3 priority dates currently sit at ~2015 (~10-year backlog). Filipino EB-2 Schedule A is more accessible. State your honest pathway timeline." },
    ],
    moneySavingTips: [
      "Filipino healthcare professionals: NCLEX-RN passing score + state nursing license + Schedule A petition = FAR faster green-card route than H-1B lottery. Bypass H-1B entirely.",
      "NCLEX-RN can be taken in the Philippines (NCSBN test centres in Manila, Cebu). Save the cost of travel for the test.",
      "USCIS fees are non-trivial: I-129 (~US$460), Premium Processing (US$2,805), I-485 AOS (US$1,440). Total US$5-7k for a full skilled-worker conversion. Most employers cover I-129 + I-140; many require employee to pay AOS-related fees.",
      "H-2B 'returning worker' status: if you've been on H-2B before with the same employer, recent legislation re-opened multi-year returning-worker exemptions. Saves the lottery entirely.",
      "Apostille for diploma + transcripts is mandatory for nursing licensure. Philippine DFA Apostille window in Manila — appointment-only via dfa.gov.ph; ~PHP 100 per document.",
      "Filipino tax: while on US H-1B, Philippine BIR doesn't tax your US income (territorial taxation principle). But file annually with BIR using the right form — no-tax-due returns avoid future complications.",
      "Wire transfers home: Wise / Remitly / Western Union — compare current rates. Most Filipinos use Wise for the best peso conversion rates vs PNB / BPI / Metrobank international transfers.",
    ],
    lawyerTriggers: {
      diy: [
        "Schedule A EB-2 application as a registered nurse with state license + NCLEX passing + sponsoring US hospital",
        "Standard H-1B via a US-employer's recruiter pipeline (FAANG, Big 4, major banks)",
      ],
      getALawyer: [
        "EB-3 'Other Workers' application (longest backlog, multiple petition variants)",
        "Adjustment of Status (I-485) timing — Filipino priority dates are volatile",
        "Family reunification linked applications (sibling-petitioned green cards have 15+ year backlogs)",
        "Prior US visa overstay or B1-B2 refusal at any consulate",
        "Schedule A petition where your prior nursing experience is abroad (verification challenges)",
        "K-3 / IR-1 spousal pathway combined with employment-based pending (concurrent filing complex)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AUSTRALIAN → NEW ZEALAND — work
  // ════════════════════════════════════════════════════════════════════

  "AU:NZ:work": {
    whatCarriesWeight: [
      {
        label: "Trans-Tasman Travel Arrangement — no work visa required",
        why: "Under the 1973 Trans-Tasman Travel Arrangement, Australian citizens are issued a Resident Visa (Class TT) on arrival in New Zealand with full work rights. You don't apply for a work visa — you just turn up with a valid Australian passport. The 'visa' is a single-entry stamp granted at the border, but legally you are a resident from day one.",
      },
      {
        label: "Permanent residency unlocks after time, not application",
        why: "After holding Resident Visa status for 24 months continuously in NZ (not just visits — actual residency), you qualify for Permanent Resident Visa. From PRV you can apply for NZ citizenship after 5 years' residence including 240 days/year physical presence.",
      },
      {
        label: "IRD number + KiwiSaver enrolment on arrival",
        why: "Apply for an Inland Revenue Department (IRD) tax number within the first week — your NZ employer can't run payroll without it. KiwiSaver auto-enrols you (3% min contribution); you can opt out within 56 days if you want to keep contributing to Australian super instead. The 2013 Trans-Tasman portability arrangement lets you transfer retirement balances both ways (Australian super ↔ KiwiSaver) without tax penalty.",
      },
      {
        label: "Medicare reciprocity vs ACC",
        why: "Australia-NZ has Reciprocal Health Agreement — emergency public care is free, but it doesn't cover long-stay primary care or prescriptions. Most working Australians enrol with a Primary Health Organisation (PHO) for subsidised GP visits. ACC (Accident Compensation Corporation) is the NZ equivalent of workers' comp — covers all injuries regardless of fault, funded by levies on your salary.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Resident Visa is automatic — no personal statement needed at the border",
        prompt: "Unlike most visa applications, Trans-Tasman entry requires no narrative or documentation beyond your passport. However, if you're applying for PRV after 24 months you'll need to show genuine residence (not visits) — keep utility bills, employment records, IRD records, lease/mortgage from day one to evidence continuous presence.",
      },
      {
        heading: "Future PRV application — your residence story",
        prompt: "Outline why you settled in NZ (job, partner, lifestyle), how you maintained continuous residence (with documented absences — Australia trips are fine but must be temporary), and your intention to remain. PRV requires you to be 'commitment to New Zealand' — show ties: NZ employer, NZ home address, NZ tax filings, community/family ties.",
      },
      {
        heading: "Citizenship application — what 'good character' means in NZ",
        prompt: "For citizenship after 5 years, write a brief covering letter explaining your residence history, employment, community ties (volunteering, sports clubs, neighbours), and any time outside NZ. Disclose every traffic infringement, every Australian conviction (however minor) — NZ Internal Affairs cross-checks with Australian federal police data and undisclosed records sink applications.",
      },
      {
        heading: "Super / KiwiSaver portability — what you're transferring",
        prompt: "If you want to consolidate retirement savings, list every Australian super fund you hold, contact details, current balances, and your intention (transfer to KiwiSaver, or leave in Australia). Note: the transfer is one-way once executed within a given fund, and Australian super preservation rules still apply to the transferred amount.",
      },
    ],
    moneySavingTips: [
      "There is no visa fee — Resident Visa is granted free at the border on arrival",
      "Don't pay for an 'immigration lawyer' for Trans-Tasman entry — there is no application to make",
      "Open an NZ bank account before arriving if possible (ANZ, ASB, Westpac NZ, BNZ all have Australian-resident pre-arrival account opening) — saves a week of cashflow gymnastics",
      "Don't transfer all your super to KiwiSaver immediately — keep some in Australia for currency/tax flexibility; the transfer can be done partially and at any time",
      "Get your NZ driver's licence within 12 months — Australian licence is accepted for short visits but for residence you swap (no test required, just paperwork — NZD$48 fee)",
      "Apply for an IRD number through the IR742 form online — free, takes 8-10 working days; without it your employer applies emergency tax of 45%+",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Trans-Tasman entry — just travel with passport",
        "Routine IRD / KiwiSaver enrolment",
        "PRV application after 24 months continuous residence (Immigration NZ has a clear online form)",
        "Australian super → KiwiSaver transfer (use the receiving fund's standard form)",
      ],
      getALawyer: [
        "Any Australian criminal conviction (even spent / suspended) — NZ Immigration character requirements can refuse entry",
        "Prior NZ visa overstay or removal (Trans-Tasman doesn't override exclusion periods)",
        "Bankruptcy or unresolved Australian tax debt over AUD$10,000",
        "Bringing non-Australian-citizen partner or dependants (they need separate visas — Partner of NZ Resident or Dependent Child)",
        "Complex super arrangements (SMSF transfer to KiwiSaver has specific compliance steps)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // ITALIAN → US — study
  // ════════════════════════════════════════════════════════════════════

  "IT:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 fee paid",
        why: "Your US institution issues Form I-20 (or DS-2019 for J-1 exchange) once admitted and proof-of-funds confirmed. Pay the SEVIS I-901 fee (US$350 for F-1 / US$220 for J-1) before booking your DS-160 interview — without the SEVIS receipt the consulate will reject the appointment. Roman / Milanese applicants book through the US Embassy Rome or US Consulate General Milan/Naples/Florence depending on residence.",
      },
      {
        label: "Proof of funds in EUR with US dollar equivalent",
        why: "Show 1st-year tuition + living costs (typically US$40-80k depending on school). Italian bank statements are accepted but the consular officer at the DS-160 interview wants to see the equivalent in USD at the day's BCE/Federal Reserve rate. A family member's bank statement counts if accompanied by Form I-134 Affidavit of Support (notarised + apostilled per the Hague Convention — Italy is signatory).",
      },
      {
        label: "Strong ties to Italy — the 214(b) presumption",
        why: "F-1 is a non-immigrant visa with the 214(b) presumption: the officer assumes you intend to immigrate unless you prove otherwise. Italian applicants do well by showing: family in Italy (parents, siblings), property or rental in Italy, military service obligation if applicable, expected return job (employment letter committing to rehire post-graduation), Italian fiancé(e)/partner. Speak Italian during the interview if more comfortable — many SF-Rome consular officers are fluent.",
      },
      {
        label: "Schengen / Italian academic transcripts — apostilled and translated",
        why: "Italian high-school maturità diploma, university transcripts, and any degree certificates need Italian-state apostille (Procura della Repubblica) plus certified translation into English. WES, Educational Perspectives, or SpanTran do credential evaluations US schools want — order at the same time as your DS-160.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Italian or other EU options",
        prompt: "Italy has free or low-cost public universities (Bologna, La Sapienza, Politecnico di Milano). Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS, Wall Street for finance, Hollywood for film). Reference concrete elements: a publication by the faculty, a specific course not offered in Europe, an internship pipeline. Vague 'American education is the best' is a 214(b) refusal trigger.",
      },
      {
        heading: "Funding — the BCE rate and your family's situation",
        prompt: "Quantify: tuition $X, living $Y, total Year 1 $Z. Then show coverage: family contribution €X (with bank statement and Affidavit of Support), scholarship $Y, savings $Z. Italian family members are eligible sponsors — explain the relationship clearly, since US officers may not assume family financial support like Italian universities do.",
      },
      {
        heading: "Post-graduation plan — your return to Italy",
        prompt: "F-1 visas explicitly require intent to return to Italy. State which Italian sector you'll return to (research, family business, banking, design), name potential employers if possible (Italian multinationals like Pirelli, Ferrari, Generali, Intesa Sanpaolo, Luxottica do hire US-educated graduates). If you want OPT (Optional Practical Training) after graduation, mention it briefly — it's allowed — but emphasise return.",
      },
      {
        heading: "Family ties remaining in Italy",
        prompt: "List parents (occupation, location), siblings, grandparents, partner. Mention property (family home, ownership share), Italian military service if applicable (leva is suspended but reservist obligations may exist), Italian bank accounts you're maintaining. These are the 'binding ties' that satisfy 214(b).",
      },
    ],
    moneySavingTips: [
      "Apply through US Embassy Rome OR US Consulate General Milan — Milan often has faster appointment slots than Rome",
      "F-1 visa fee is US$185 (was $160 pre-2023); pay via Italian bank deposit at UniCredit or Intesa Sanpaolo — quicker than wire transfer",
      "Don't pay for visa-prep consultancies — the DS-160 is online and the questions are straightforward. The interview is the bottleneck, not the form",
      "Get your CIE (Carta d'Identità Elettronica) before applying — US officers accept it as a secondary ID and it speeds appointment booking",
      "Apply for the Erasmus+ Worldwide grants (now Erasmus Mundus Joint Masters) — funds Italian students for US degrees with €25,000+ stipend",
      "Italian-American Studies Foundation, NIAF (National Italian American Foundation), and the Sons of Italy Foundation offer Italian-heritage scholarships of $2,000-25,000",
      "Use FORLE / DIRE / Italian state low-cost tuition loans (Cassa Depositi e Prestiti backs them) — interest 0.5-2% vs US 6-8% private loans",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 application with clean record and standard funding",
        "Standard exchange-programme J-1 through Fulbright Italy or accredited Italian university partnership",
        "Renewal of existing F-1 (re-issuance in Italy during winter / summer breaks)",
        "OPT or STEM OPT application during or after the programme",
      ],
      getALawyer: [
        "Prior US visa refusal (any category — B1/B2 tourist refusal is a red flag for F-1)",
        "Schengen / Italian criminal record (even minor — DUI from Erasmus year, drug possession in NL/DE)",
        "Italian conscientious-objector status flagged in passport (clears up easily but with right advice)",
        "Dual Italian-other citizenship and you're applying with the non-EU passport (consular jurisdiction issues)",
        "Funding from a sponsor outside Italy / EU (Russian, Chinese, MENA sponsors face additional scrutiny)",
        "Transfer from another country's F-1 status (SEVIS transfer within US is fine, country-to-country needs care)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // FILIPINO → CANADA — work
  // ════════════════════════════════════════════════════════════════════

  "PH:CA:work": {
    whatCarriesWeight: [
      {
        label: "LMIA-backed job offer in a high-wage stream OR LMIA-exempt category",
        why: "Most Filipino workers enter through the Temporary Foreign Worker Program: your Canadian employer obtains a Labour Market Impact Assessment (LMIA, CAD$1,000 fee paid by employer) proving no Canadian could fill the role. Healthcare and caregiving roles route through the Home Care Worker Immigration Pilots launched 2024 (replaced the closed Home Child Care Provider / Home Support Worker pilots). High-wage LMIAs over the provincial median attract priority processing — typically 8-12 weeks vs 4+ months for low-wage.",
      },
      {
        label: "WES Educational Credential Assessment + IELTS General CLB 5+",
        why: "Canadian employers and Express Entry assessments demand WES (World Education Services), ICAS, or IQAS evaluation of your Philippine degree — Filipino BS Nursing maps to Canadian Bachelor; TESDA NC-II maps to Canadian college diploma. IELTS General (not Academic) with CLB 5 minimum (Reading 4.0, Writing 5.0, Listening 5.0, Speaking 5.0) is the bare floor; CLB 7+ unlocks Express Entry CRS points and the new category-based draws for healthcare and skilled trades.",
      },
      {
        label: "NBI Clearance + provincial police checks from anywhere you've lived 6+ months",
        why: "Philippines National Bureau of Investigation clearance is mandatory and must be obtained within 6 months of submission. If you worked in KSA, UAE, HK, or Singapore for 6+ months, you also need that country's police certificate. IRCC frequently refuses applications where Filipino OFWs forget to disclose a Gulf-state work stint — disclose every country, even if 'just visiting family'.",
      },
      {
        label: "Filipino-specific medical exam through IOM Manila / Cebu",
        why: "IRCC requires the Immigration Medical Exam through a designated panel physician — in PH that's IOM Manila (St. Luke's BGC, Makati Medical) or IOM Cebu. Cost ~PHP 8,000-12,000. Active TB screening is the most common failure point — even latent TB requires preventive treatment before visa issuance. The medical is valid 12 months from exam date — time your application accordingly.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why Canada specifically — and which province",
        prompt: "Canadian provinces have wildly different nominee programs. Saskatchewan, Manitoba, Alberta, and the Atlantic provinces actively recruit Filipino nurses, caregivers, and trades. Mention your target province by name and why (existing Filipino community in Winnipeg/Calgary/Saskatoon, lower cost of living than Toronto/Vancouver, specific employer). Show you've researched the Provincial Nominee Program route, not just generic 'Canada'.",
      },
      {
        heading: "Your work history — Philippine + overseas",
        prompt: "List every employer chronologically with month-precision dates, role, supervisor name, supervisor contact. If you worked overseas (KSA, UAE, HK, SG, JP), note the contract length, sponsor employer, and whether you returned to PH between contracts. IRCC cross-checks POEA records — undeclared OFW deployments will surface.",
      },
      {
        heading: "Settlement plan + funds — proof of CAD$13,757 (1 adult) or more",
        prompt: "Even with a Canadian job offer, IRCC wants to see proof you can survive landing — minimum CAD$13,757 for 1 person, CAD$17,127 for 2, scaling up. Document Philippine bank statements (BPI, BDO, Metrobank, Landbank, RCBC), property in PH, and remittance plans. Many Filipino workers also note family in Canada who'll provide initial accommodation — include their letter of invitation.",
      },
      {
        heading: "Permanent-residence intent vs temporary work permit",
        prompt: "If applying for an LMIA-backed work permit, you can express intent to apply for PR through Express Entry or PNP — Canadian work permits are 'dual intent' permitted. State your target program (Canadian Experience Class after 12 months CRS-eligible work, Provincial Nominee Program, Home Care Worker Pilot direct-PR pathway). This actually strengthens the application — Canada actively wants long-term immigrants.",
      },
    ],
    moneySavingTips: [
      "Use the POEA-licensed agency only for the contract verification step — DON'T pay them for 'visa processing'; you apply to IRCC directly online for CAD$155 work-permit fee",
      "NBI Clearance: PHP 130 if you have a renewable previous clearance, PHP 155 for first-time — pay through GCash/Maya at NBI portal",
      "IELTS General: book through British Council or IDP — PHP 12,650 (cheaper than re-taking; aim for CLB 7+ first attempt to avoid retake costs and Express Entry score jump)",
      "WES costs CAD$237 (basic) or CAD$329 (course-by-course needed for nursing); pay in CAD via international card not via remittance to avoid double FX",
      "Avoid 'visa consultants' charging PHP 50,000+ — ICCRC-licensed representatives are the only legally recognised paid representatives in Canada (verify at college-ic.ca)",
      "Use the Canadian Employer's RCIC if they have one — under PH POEA rules they can't charge you (employer pays), and they're CICC-regulated",
      "Get your degree apostilled at DFA-OCA Aseana while still in PH (PHP 200/document, same-day) — once you leave PH the Philippine consulate route is slower and costs more",
    ],
    lawyerTriggers: {
      diy: [
        "Standard LMIA-backed work permit with clean record and clear credentials",
        "Home Care Worker Pilot direct application with HCSA-recognised caregiving experience",
        "Express Entry profile creation and CRS optimisation (online tool is straightforward)",
        "Family reunification once you have PR — sponsor parent/spouse via straightforward IRCC application",
      ],
      getALawyer: [
        "Previous Canadian visa refusal (visitor, study, or work) — refusal grounds carry forward",
        "Past US B1-B2 refusal or overstay (IRCC shares data with USCIS)",
        "Unresolved OFW labour cases / blacklist from a Gulf employer",
        "Philippine criminal conviction (even if dismissed under probation or RA 9344 juvenile)",
        "Family member with TB / hepatitis history in last 5 years (medical admissibility nuance)",
        "Job offer in a regulated profession (nursing — NNAS / provincial licensing is separate from IRCC and the order matters)",
        "Self-employed or business-owner applicant claiming experience without traditional payslips (proving genuine self-employment to IRCC needs strategic documentation)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AMERICAN → GERMANY — work
  // ════════════════════════════════════════════════════════════════════

  "US:DE:work": {
    whatCarriesWeight: [
      {
        label: "EU Blue Card OR Skilled Worker Aufenthaltserlaubnis — both pay-threshold driven",
        why: "The German EU Blue Card (Blaue Karte EU) requires a German employment contract and salary at or above €48,300 (2024 general threshold) or €43,759 in shortage occupations (IT, STEM, medicine, math). The non-Blue-Card Skilled Worker Residence Permit (§18a/b AufenthG) accepts any salary meeting the position's market rate but processing is slower (12+ weeks vs Blue Card's 4-6 weeks at German consulates Boston/NYC/SF/LA/Chicago/Houston/Miami).",
      },
      {
        label: "Anerkennung — recognition of your US qualification",
        why: "Germany requires formal recognition (Anerkennung) of your degree through the Anabin database. Most US Bachelor's from regionally-accredited universities map as H+ (recognised); some flagship state universities are H+, while others require ZAB (Zentralstelle für ausländisches Bildungswesen) individual assessment at €200. Without H+ status the Blue Card threshold is harder to defend. For regulated professions (medicine, law, engineering, teaching) the Anerkennung is granted by the relevant Länder Anerkennungsstelle.",
      },
      {
        label: "German health insurance + pension portability under the Totalization Agreement",
        why: "From day one you need German health insurance — public (gesetzliche Krankenversicherung — TK, AOK, Barmer) costs ~14.6% of gross salary split with employer; private (PKV) is only available above €69,300 salary threshold (Versicherungspflichtgrenze 2024). The US-Germany Totalization Agreement (1979) means you can stay on US Social Security for up to 5 years on a certificate of coverage (CoC) from SSA — avoiding the 9.3% German Rentenversicherung contribution, useful for short assignments.",
      },
      {
        label: "Anmeldung within 14 days + Steuer-ID + bank account opening race",
        why: "After arrival you have 14 days to register your address (Anmeldung) at the local Bürgeramt — without this you can't get a Steueridentifikationsnummer (tax ID), without which payroll can't be set up. Bürgeramt slots in Berlin / Munich / Hamburg are notoriously hard to book — start the search before you fly. Mietvertrag (rental contract) is required; AirBnB doesn't count for Anmeldung. Banks like N26, Commerzbank, and DKB will open accounts with just your passport but full IBAN-with-Schufa needs Anmeldung.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why Germany — not Netherlands, Ireland, or remote",
        prompt: "Germany has specific differentiators: Mittelstand engineering depth, Berlin/Munich/Hamburg startup ecosystems, automotive R&D (Stuttgart for Mercedes/Porsche, Munich for BMW, Wolfsburg for VW), pharma in Frankfurt/Rhein-Main. Tie your career trajectory to a specific region or industry cluster. American applicants who can name their target company (Siemens, SAP, BioNTech, Rocket Internet, Helsing) and explain why score higher than 'I want to live in Europe'.",
      },
      {
        heading: "Your German language status — be honest",
        prompt: "Blue Card doesn't require German (your role is English-conducted), but settlement permit (Niederlassungserlaubnis after 21 months on Blue Card with A1 German, or 33 months without German) does. State your current level (A1/A2/B1) or your plan (Volkshochschule courses, Goethe-Institut, Babbel). Don't oversell — German officers can switch to German mid-interview if you claim B2.",
      },
      {
        heading: "US tax filing while German tax-resident",
        prompt: "Mention you understand US citizens are taxed worldwide regardless of residence. State your plan: file US 1040 + Form 2555 (Foreign Earned Income Exclusion) or Form 1116 (Foreign Tax Credit), plus FBAR / FinCEN 114 for German accounts over $10k. Germany taxes worldwide income too once you're resident, but the US-Germany tax treaty prevents double-tax on most income.",
      },
      {
        heading: "Family / settlement plan",
        prompt: "If bringing spouse — they get a derived residence permit with full work rights (one of Germany's best perks for trailing spouses). If single — explain your community integration plan (language courses, Vereine, neighbourhood). German caseworkers reward integration commitment heavily for later Niederlassungserlaubnis and Einbürgerung (citizenship after 5 years per the 2024 reform, 3 years with C1 German + civic integration).",
      },
    ],
    moneySavingTips: [
      "Blue Card visa fee at German consulates is €75 — pay in USD cash or card; don't use a third-party 'visa service' charging $300+",
      "Use Schufa-Auskunft (online €29.95) before any rental application — landlords demand it and it's the bottleneck on Anmeldung",
      "Open N26 or Commerzbank account before flying (online with US passport accepted) — you'll need an IBAN for the employment contract finalisation",
      "Don't break your US 401(k) early — Germany doesn't tax US-sourced retirement accounts under the treaty; rolling over to a German Riester or Rürup is rarely worth the tax friction",
      "Get a Wohnberechtigungsschein if your income is below ~€14k single / €21k couple (after Werbungskosten) — entitles to affordable housing waiting lists",
      "Use the Berlin Welcome Center, Munich International Office, or Frankfurt Mainova Welcome Service — free Anmeldung assistance and translator help",
      "Health insurance: public TK costs the same regardless of provider for the same income — don't pay for 'health insurance brokers'; sign up direct at tk.de",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Blue Card with German employment contract above the salary threshold",
        "Skilled Worker Residence Permit with H+ rated Bachelor's and clean record",
        "Spouse / dependent applications via family reunification (Familiennachzug) when primary is approved",
        "Permanent residence (Niederlassungserlaubnis) after qualifying period with documented A1/B1 German",
      ],
      getALawyer: [
        "Schufa issues from prior US debt or unpaid German invoices from a previous stay",
        "Regulated profession recognition (medicine, dentistry, pharmacy, teaching, lawyer) — Anerkennung process is Länder-specific and easy to misroute",
        "US tax compliance gaps (unfiled returns, missing FBARs) — comes up during Niederlassungserlaubnis financial check",
        "Cannabis-related US conviction (legal in many US states but still admissibility concern under German §54 AufenthG depending on quantity)",
        "Switch from Blue Card to self-employment / Freiberufler — different residence-permit category with its own evidentiary requirements",
        "Niederlassungserlaubnis with extended absences from Germany (US business travel can break the residence chain)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // GERMAN → US — work
  // ════════════════════════════════════════════════════════════════════

  "DE:US:work": {
    whatCarriesWeight: [
      {
        label: "Visa class fit — H-1B vs L-1 vs O-1 vs E-2",
        why: "Germans use multiple US work routes. H-1B (cap-subject lottery in March, 85k slots, $215 registration + $780+ filing) requires a US employer petition and Bachelor's-degree-equivalent role. L-1A/B (intracompany transfer) bypasses the lottery — useful if you've worked 1+ years at a German parent company with a US subsidiary. E-2 Treaty Investor (under the 1954 US-Germany Treaty of Friendship) needs a substantial German investment in a US business (~$100k+ typical, no statutory minimum). O-1 (extraordinary ability) is for senior scientists/executives — Max Planck, Fraunhofer, or DAX board members are typical fits.",
      },
      {
        label: "PERM Labor Certification for green card sponsorship",
        why: "Most Germans aim for EB-2 or EB-3 green cards through PERM — the US employer recruits the role for 30 days proving no qualified US worker. PERM processing currently 6-12 months (PERM Online filing FY2024). Germans are 'current' in EB categories with no per-country backlog — unlike Indian or Chinese applicants, you can adjust status as soon as PERM and I-140 are approved.",
      },
      {
        label: "DS-160 + German Apostille + ZAB-equivalence for US credential",
        why: "DS-160 online application, then book DS-160 interview at US Consulate General Frankfurt (largest in Europe), Munich, or Berlin. German degree certificates need Apostille from the issuing state's Bezirksregierung (Hague Convention). For US licensure (medicine, nursing, teaching) use WES, ECE, or AICE foreign credential evaluations; ZAB-equivalence is German-side, not accepted by US licensing boards.",
      },
      {
        label: "US-Germany Totalization & tax treaty — keep Rentenversicherung clean",
        why: "Under the 1979 Totalization Agreement get a Bescheinigung von der Deutschen Rentenversicherung (CoC) before assignment if temporary (<5 years) — keeps you on Rentenversicherung, exempt from US Social Security. Beyond 5 years you flip to US Social Security with German-paid contributions counted toward eventual US benefits. Tax treaty (1989, protocol 2007) prevents double-tax on salary; file Form 8833 to claim treaty benefits and Form 8938 for German account reporting once a US tax resident.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why the US over remaining in EU / DACH region",
        prompt: "Concrete reasons US officers reward: specific industry depth (Silicon Valley for AI/biotech, NYC for finance, Boston for pharma, LA for entertainment, Houston for energy), specific employer (FAANG, named startup, named research institution), specific funding (named US VC, named angel for E-2). Germans applying with 'better salary' as the only reason get scrutinised — talk about market access, US capital markets, or specific projects.",
      },
      {
        heading: "Your German employer / project history",
        prompt: "List your German employer chronologically, role, salary band (in EUR with USD equivalent at filing date), German social insurance number (Sozialversicherungsnummer) — needed for some petition supporting documents. If transferring within a company (L-1) document the German parent-US subsidiary relationship (Qualifying Organization).",
      },
      {
        heading: "US-tied funding (E-2) or US-tied sponsor (H-1B/L-1)",
        prompt: "For E-2: source-of-funds trail in EUR converted to USD — German salary savings, family gifts (with notarised Schenkungsvertrag), business sale proceeds. For H-1B/L-1: US employer is the petitioner; describe the role, the team, the specific reason your German background is essential vs hiring a US worker.",
      },
      {
        heading: "Family + dependants",
        prompt: "Spouse on L-2 gets automatic work authorisation (no EAD wait since 2023 rule change). H-4 spouse needs EAD; H-4 children under 21 are dependent only. State whether spouse is EU citizen (faster paperwork) or third-country national (separate H-4/L-2 derivative). For E-2, dependants get E-2D with similar work rights for spouse.",
      },
    ],
    moneySavingTips: [
      "Apply at US Consulate Frankfurt — slot availability is usually faster than Munich or Berlin; you can apply at any of the 4 German consulates regardless of residence",
      "DS-160 fee is $185 (H-1B/L-1) or $315 (E-2 treaty); reciprocity fee is $0 for Germans (treaty country) — don't fall for 'visa expediters' charging $500",
      "Use the WES iGPA Calculator (free) to estimate US-equivalent grades before paying for the full evaluation; some US employers accept self-attested transcripts at offer stage",
      "Don't break out of Rentenversicherung when leaving DE — under the Totalization Agreement you can reactivate it later, and the contribution years count toward German Altersrente even if you naturalise as American",
      "Open a US-domiciled bank account with Wise USD or Mercury before relocation — avoids SWIFT remittance fees on your first US payroll",
      "Use the German Embassy's free notary service in DC, SF, NYC, Boston, Houston, Atlanta, Chicago, LA, Miami for any German power-of-attorney needed for German banking / property — saves $200+ at US public notaries",
      "Defer German pension partial-withdrawal until you confirm US tax residency — early withdrawal triggers DE Vorruhestand penalty and US ordinary income tax",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B with named US employer, clean record, clear Bachelor's",
        "L-1 intracompany transfer with documented 12-month qualifying employment at the German parent",
        "DS-160 interview prep and document gathering",
        "Spouse / dependent derivative applications (H-4, L-2, E-2D)",
        "Renewal of existing H-1B / L-1 at any of the 4 German consulates during home leave",
      ],
      getALawyer: [
        "E-2 Treaty Investor — substantiality, source-of-funds, and 'real and operating' enterprise tests are highly evidentiary",
        "EB-1A / EB-1B / O-1 — 'extraordinary ability' criteria need strategic petition drafting",
        "PERM with prevailing wage challenges or recruitment results showing qualified US workers",
        "Prior US visa refusal (any type) or US overstay (even <180 days carries 3-year bar implications)",
        "German criminal record — Führungszeugnis disclosure to USCIS / DOS, even if minor, needs framing",
        "Concurrent EU and US tax residency (Wegzugsbesteuerung exit tax implications if leaving DE with substantial holdings)",
        "Spouse from a third country (not US or EU) — derivative visa coordination across jurisdictions",
        "Active asylum / refugee status in Germany — disclose to US consulate carefully",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AMERICAN → JAPAN — work
  // ════════════════════════════════════════════════════════════════════

  "US:JP:work": {
    whatCarriesWeight: [
      {
        label: "Status of Residence (在留資格) + Certificate of Eligibility (在留資格認定証明書)",
        why: "Japan's work visas are status-based: Engineer/Specialist in Humanities/International Services (技術・人文知識・国際業務 — by far the most common for Americans), Highly Skilled Professional (高度専門職), Intra-company Transferee, Skilled Labour, Business Manager, Instructor (for ALTs), Specified Skilled Worker (新在留資格). Your Japanese employer applies to the regional Immigration Bureau for a Certificate of Eligibility (COE) BEFORE you apply for the visa at a US consulate. No COE = no visa.",
      },
      {
        label: "Bachelor's degree (or 10+ years relevant experience) and role-degree match",
        why: "Engineer/Specialist requires a Bachelor's where the major is relevant to the role — Computer Science degree for software roles, Liberal Arts for translation/marketing, etc. If you have no degree, 10+ years of documented experience in the field (with reference letters) is acceptable. The role-degree fit is rigid — a Music BA applying for engineering roles will be refused.",
      },
      {
        label: "Salary at 'same as Japanese national' level + market rate",
        why: "Immigration checks your contracted salary against the prevailing wage for the role in the region (Tokyo 23 wards vs prefectural average). For Engineer/Specialist roles in Tokyo this typically means JPY 4,000,000+/year minimum. Highly Skilled Professional uses a points table: salary, age, education, Japanese language ability (N1/N2 JLPT adds points) — 70+ points qualifies for HSP-i (1-year fast-track to PR), 80+ for HSP-ii (immediate PR pathway).",
      },
      {
        label: "Apostilled background check + degree certificate translated into Japanese",
        why: "FBI Identity History Summary Check (Channeler-processed in 1-3 business days, $50-$70) is required. Apostille via US State Department or the relevant US state authority. Translate certificates into Japanese — most employers handle this via their immigration lawyer, but you can do it yourself or use a sworn translator (gyoseishoshi) in Japan.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why Japan specifically and your role-employer match",
        prompt: "Japan immigration officers want to see clear fit between your education, your previous experience, and the role offered. Reference specific Japanese industry strengths: automotive (Toyota, Honda, Nissan), gaming (Nintendo, Sony, Square Enix), trading houses (Mitsubishi, Mitsui, Sumitomo), pharma (Takeda, Astellas, Daiichi-Sankyo), tech (Rakuten, LINE Yahoo, Mercari). For ALT/Eikaiwa roles, name the specific Board of Education or company (JET Programme, Interac, AEON, ECC, Berlitz).",
      },
      {
        heading: "Japanese language level — honest assessment",
        prompt: "If you have JLPT certification (N5 to N1), state it. If you don't have JLPT but can self-assess (Genki I/II completed, 1 year of study, AnkiWeb daily, etc.), describe honestly. For Engineer/Specialist visa the language requirement is officially 'sufficient' which is not tested — but Highly Skilled Professional awards 10 points for N2, 15 for N1, making language a real PR accelerator.",
      },
      {
        heading: "Long-term plan — temporary or settlement",
        prompt: "Japan doesn't require non-immigrant intent like the US does, but officers like to see realistic plans. Either: clear settlement intent (Japanese spouse, family ties, learning Japanese seriously, will apply for PR after 10 years / HSP fast-track) or clear temporary intent (specific project, secondment, will return to US). Be consistent — don't claim 'lifelong commitment' if your CV shows 1-2 year job hops.",
      },
      {
        heading: "Funding + housing on arrival",
        prompt: "Cite your savings (yen-equivalent), the Japanese employer's relocation package (most cover first month's rent + key money + agent fees + flight), and your housing plan (company dorm, gaijin house, leopalace, Suumo search). Tokyo / Osaka rentals require guarantor companies (hoshōnin gaisha) and 4-6 months upfront — budget JPY 800k-1.2M for initial setup.",
      },
    ],
    moneySavingTips: [
      "COE application has no fee; visa-issuance fee is JPY 3,000 (single-entry) / JPY 6,000 (multiple) at the Japanese consulate — paid in USD equivalent in cash",
      "Apply at the Japanese consulate covering your US state of residence — LA, NY, SF, Chicago, Houston, Atlanta, Boston, Denver, Honolulu, Detroit, Miami, Seattle, Anchorage, Hagåtña, Portland (OR) all have jurisdictions",
      "Don't pay for FBI background check 'expedited services' — channeler companies (Accurate Biometrics, Fieldprint, Identogo) deliver in 1-3 days for $25-$60",
      "Use the Highly Skilled Professional points calculator (Japan Immigration Bureau website) before applying — re-roll your timing if you're 1-2 points short of a threshold (waiting for JLPT result, finishing a degree, etc.)",
      "Get the My Number Card immediately after arrival — replaces Residence Card photocopy for many services and is free",
      "Open Japan Post Bank (yucho) account first — no minimum balance, accepts foreigners with valid Residence Card, then graduate to a city bank (MUFG, SMBC, Mizuho) when you need international transfers",
      "JET Programme participants get a sweet deal — Board of Education pays apartment key money, ALT salary is JPY 3.36M Year 1 (HSP-points qualifying), pension lump-sum withdrawal on departure",
      "Skip the 'visa consultants' — Japanese employers' in-house gyoseishoshi (administrative scrivener) handles immigration paperwork at no cost to you",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Engineer/Specialist visa with degree-matched role and clean record",
        "JET Programme application (USJ Embassy and Board of Education handle most paperwork)",
        "Status of Residence renewal at regional Immigration Bureau (Shinagawa, Yokohama, Nagoya, Osaka, Fukuoka)",
        "Change of Status (e.g., Student to Engineer) when you have a clear Japanese employer offer",
        "Permanent Residence application via HSP fast-track (1-3 years) with documented points",
      ],
      getALawyer: [
        "Business Manager visa (経営・管理) — substantial-investment threshold (JPY 5M+ in actual operations), office space, two employees, real business plan",
        "Spouse of Japanese National visa (日本人の配偶者等) — genuineness of marriage scrutinised, especially if recent marriage / age gap / international meeting circumstance",
        "Past entry refusal, deportation, or overstay in Japan",
        "US criminal record (DUI, drug, theft, anything beyond minor traffic) — Japan immigration is strict; even old/sealed records discovered through FBI check matter",
        "Self-employment via Specified Activities or freelance through Business Manager — needs strategic visa-class selection",
        "Bringing a same-sex partner — Japan doesn't recognise same-sex marriage federally so dependent visa is unavailable; alternative routes through Designated Activities require lawyer",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BANGLADESHI → UK — work
  // ════════════════════════════════════════════════════════════════════

  "BD:GB:work": {
    whatCarriesWeight: [
      {
        label: "Certificate of Sponsorship from a UK Home Office licensed sponsor",
        why: "Bangladeshi workers come predominantly through the Health & Care Worker visa (immigration-health-surcharge-exempt, fee £304-£551) or the standard Skilled Worker visa (IHS £1,035/year). Your UK employer must hold a sponsor licence (verify on gov.uk register) and issue a defined CoS with role SOC code, salary, and Certificate of Sponsorship Number. NHS Trusts, care homes (CQC-registered for care visas only), and Tier 1 tech employers (Revolut, Wise, Deliveroo, ARM) are the main Bangladeshi-friendly licensees.",
      },
      {
        label: "Salary thresholds — £38,700 general, £29,000 healthcare, £23,200 transitional",
        why: "From April 2024 the Skilled Worker general threshold rose to £38,700/year. Health & Care Worker remains at £29,000 (or 70th-percentile rate for the SOC code). New Entrants (under 26 / recent graduates / shortage occupation) qualify at £30,960. The actual minimum is whichever is higher: threshold OR the going rate for your specific SOC code. Bangladesh-origin nurses, doctors, software engineers, finance, and academic posts most often qualify.",
      },
      {
        label: "IELTS UKVI Academic / OET + ECCTIS/NARIC degree assessment",
        why: "Bangladeshi degrees are recognised by UK ECCTIS (formerly UK NARIC) — get a Statement of Comparability for your BSc/MBBS/BBA before applying (~£140, 15 working days). English: IELTS UKVI Academic 4.0+ minimum (B1 CEFR) for Skilled Worker, 7.0 for nursing/midwifery NMC registration. Schedule IELTS at British Council Dhaka, Chittagong, or Sylhet centres.",
      },
      {
        label: "Bangladesh Police Clearance + UK TB test + medical exam",
        why: "Bangladesh Police Clearance from Dhaka Metropolitan Police HQ or Special Branch (BDT 500, 7-15 days). UK TB clearance certificate from IOM Dhaka, IOM Sylhet, or IOM Chittagong (BDT 8,500-12,500, valid 6 months). For care workers, additional DBS check via your UK employer (Disclosure & Barring Service equivalent for the Bangladesh period — comes via Bangladesh Police).",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role and why this UK employer chose you",
        prompt: "UK caseworkers scrutinise Bangladeshi applications more closely after a 2024 spike in care-visa fraud — be specific about how you found the role (recruitment agency, family connection, NHS Trust direct), what made you the right fit, and your salary level vs the going rate. Name the UK employer, the team, the line manager. Vague 'general nursing in the UK' gets refused; 'Band 5 staff nurse, oncology ward, [named NHS Trust]' gets approved.",
      },
      {
        heading: "Your Bangladeshi work history — exact and verifiable",
        prompt: "List every employer in Bangladesh (Sadar Hospital, Square Hospital, BRAC Bank, Grameenphone, Robi Axiata, ICDDR,B, named pharma) with exact dates, role, salary in BDT, supervisor name + WhatsApp/email contact. UK Home Office cross-checks with named referees. Avoid 'private practice' or 'self-employed' without strong documentary support (trade licence, tax return TIN/BIN, NBR e-payment records).",
      },
      {
        heading: "Funds and dependent plan",
        prompt: "Skilled Worker requires £1,270 maintenance (28-day consecutive bank balance in personal name) OR employer A-rated certification of cover. For Health & Care Worker the £1,270 is waived if employer certifies cover. Document Bangladesh source-of-funds: salary slips, BRAC/Eastern/Standard Chartered bank statements, family gift Affidavit (notarised). Dependent visa for spouse + each child <18 requires additional £285/£315 maintenance per dependent.",
      },
      {
        heading: "Future plan — ILR or return",
        prompt: "Skilled Worker visa is a 5-year route to Indefinite Leave to Remain (ILR) — you can state your settlement intent, including Life in the UK test prep, English level (B1+ for ILR, C1 for Citizenship). For Health & Care Worker, the ILR route is identical but the IHS-exemption makes the 5-year cost dramatically lower. If you want to return to Bangladesh after a fixed period, state that — Skilled Worker doesn't require settlement intent.",
      },
    ],
    moneySavingTips: [
      "Health & Care Worker visa avoids the IHS (£1,035/year x 5 years = £5,175 saved per applicant)",
      "Bangladesh-origin care workers can claim £25k flat NHS recruitment bonus from many Trusts — negotiate at offer stage",
      "Use the British Council Dhaka or Mirpur centres for IELTS UKVI (BDT 25,500) — IDP charges slightly more; book multi-attempt packages if uncertain on first sitting",
      "ECCTIS Statement of Comparability is £140 (standard) or £210 (urgent 5-day) — order well in advance to avoid the £400 'rush' price",
      "Bangladesh Police Clearance via online application at dmp.gov.bd or sb.police.gov.bd — BDT 500, don't pay BDT 5,000 to dalals (touts) outside the Special Branch office",
      "IOM Dhaka medical: book early — the slot availability is the bottleneck on full applications, not the visa fee itself",
      "Avoid Bangladeshi 'visa consultants' charging BDT 200,000+ for nothing — UK Home Office is the only fee-charging party; your UK employer's HR handles CoS",
      "Family in the UK can act as your sponsor for £1,270 maintenance via an Undertaking (signed letter from named UK citizen / settled person)",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Skilled Worker or Health & Care Worker visa with NHS Trust CoS, clean record",
        "Dependent applications (spouse + children) submitted concurrently with main applicant",
        "ILR application after 5 years continuous qualifying residence with B1 English and Life in the UK",
        "Switching between sponsors within UK (within 60 days of leaving previous sponsored role)",
      ],
      getALawyer: [
        "Prior UK visa refusal (study, visit, work) — refusal reasons carry forward and need addressing in fresh application",
        "Care-sector role with a sponsor under CQC investigation or recent licence revocation (2024 saw mass revocations affecting Bangladeshi care workers)",
        "Past UK overstay (even <30 days) or prior removal",
        "Bangladesh criminal conviction (even minor, even dismissed under 1898 CRPC) — disclosure to Home Office is mandatory",
        "Bringing 18+ dependent child (adult dependent relative is one of UK's hardest visa categories)",
        "Religious/political asylum concern from Bangladesh (BNP / Awami League / Jamaat affiliation history scrutinised case-by-case)",
        "Re-entering UK after prior Tier 2 / Tier 4 transition without smooth visa history",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // FRENCH → US — work
  // ════════════════════════════════════════════════════════════════════

  "FR:US:work": {
    whatCarriesWeight: [
      {
        label: "E-1 / E-2 Treaty Trader / Investor via the France-US 1853 Treaty",
        why: "France's treaty relationship with the US (Treaty of Commerce 1853, plus 1959 Convention) makes E-1 (substantial trade between US and France) and E-2 (substantial investment in a US business) routes especially attractive. E-2 has no statutory minimum but $100k+ in a real US enterprise is the practical floor; many French entrepreneurs use it to launch US subsidiaries of French startups (Veepee, Doctolib, Mirakl pattern). No PERM, renewable indefinitely while the business operates.",
      },
      {
        label: "H-1B Specialty Occupation OR L-1 intracompany via French parent",
        why: "H-1B is cap-subject (March lottery, 85k slots — French success rate similar to other Western Europeans at ~30%). L-1A (executive/manager) and L-1B (specialised knowledge) bypass the lottery if you've worked 1+ year at a French parent company (BNP Paribas, AXA, Sanofi, Capgemini, Atos, Dassault, Airbus, LVMH, Hermès have well-trodden L-1 paths to US subs). DS-160 interview at US Embassy Paris or US Consulate Strasbourg.",
      },
      {
        label: "Apostilled French diplomas + ECE/WES credential evaluation",
        why: "French degrees (Licence, Master, Doctorat, Grandes Écoles diplomas like ENA, HEC, Polytechnique, Centrale, Sciences Po) need Apostille from the local Cour d'Appel or Ministère des Affaires Étrangères. WES, ECE, or AICE foreign credential evaluation maps to US bachelor's/master's equivalency. Master 2 typically maps to US Master's; Licence 3 maps to US Bachelor's; Grande École engineering diploma maps to US Master's of Engineering.",
      },
      {
        label: "France-US Totalization Agreement (1987) + tax treaty considerations",
        why: "Get a Certificat d'Affiliation from CLEISS before leaving — keeps you on French Sécurité Sociale for up to 5 years, exempt from US Social Security/Medicare. Beyond 5 years you switch to US system with French quarters counted toward eventual French Retraite. France-US tax treaty (1994, protocols 2009) prevents double-taxation on salary; CSG/CRDS contributions are NOT US-foreign-tax-creditable (French Bank case — only impôt sur le revenu qualifies). File Form 8833 to claim treaty benefits.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why the US for your career — and which sector",
        prompt: "French applicants benefit from specificity. Tech (SF Bay, NYC, Boston, Austin), finance (NYC, Chicago), pharma (Boston, NJ, Bay Area), fashion (NYC, LA), wine/spirits (NY, Miami, Houston), aerospace (Seattle, LA, Wichita), luxury hospitality (Las Vegas, Miami, NYC). Name your target US employer or sector — French expat business networks (French-American Chamber, La French Tech NYC/Boston/SF) are legitimate ties to mention.",
      },
      {
        heading: "Your French employer / Grande École network",
        prompt: "List your French employer (with French SIRET if mentioning a small company), your role, your degree-issuing institution (Grandes Écoles are well-known to US Embassy Paris — name them clearly). For L-1, document the qualifying employment year-by-year with role progression. For E-2, document your French source-of-funds (PEA, livret, family gift via Don manuel notarié, business sale via SCI / SASU).",
      },
      {
        heading: "Settlement vs return-to-France intent",
        prompt: "H-1B and L-1 allow dual intent — you can openly state PR plans (EB-1/EB-2/EB-3 green card via PERM or self-petition). E-2 is non-immigrant; if you have PR intent state it through a different route (parallel EB-1A or marriage). French applicants who openly plan to keep French citizenship plus apply for US naturalisation are welcome — dual nationality is fully recognised by both countries.",
      },
      {
        heading: "Family + dependants",
        prompt: "Spouse on L-2 has automatic work authorisation since 2023; H-4 spouse needs EAD (limited categories). E-2 spouse gets E-2D with full work rights. Children under 21 are derivative. State whether spouse is French (faster paperwork), EU citizen (still derivative), or third-country (separate considerations). Mention if any child is in CP/CE1/CE2 — US school placement around the French academic year matters.",
      },
    ],
    moneySavingTips: [
      "DS-160 fee $185 (H-1B/L-1) or $315 (E-2); pay in EUR cash/card at US Embassy Paris — no reciprocity fee for French citizens",
      "Use WES iGPA Calculator (free online) before paying for the full evaluation; many US employers accept self-attested transcripts at offer stage and only require WES for petition filing",
      "Don't withdraw your PEA early — France-US tax treaty preserves PEA tax advantages while you're US-resident if you don't make taxable events",
      "Open a US-domiciled bank account with Wise USD or Mercury Business before relocation — avoids SEPA→SWIFT remittance fees on your first US payroll",
      "French Embassy Washington DC + Consulates (Atlanta, Boston, Chicago, Houston, LA, Miami, New Orleans, NYC, SF) offer free apostille and notarisation for French citizens — saves $200+ vs US public notaries",
      "Use La French Tech NYC / Boston / SF community discounts on relocation services — typically 15-30% off otherwise list-price quotes",
      "Avoid French 'avocat américain' charging €5,000+ for an H-1B — US-based immigration attorneys at major firms (Fragomen, Berry Appleman, Erickson) often have flat-fee French desks at €2,500-3,500",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B / L-1 with named US employer, clean record, clear French degree mapping",
        "DS-160 interview prep and document gathering at US Embassy Paris",
        "Spouse / dependent derivative applications (H-4, L-2, E-2D)",
        "Renewal of existing H-1B / L-1 at the US Embassy in Paris during home leave",
        "PERM-based EB-2 / EB-3 green card with cooperating US employer (Frenchies are current — no per-country backlog)",
      ],
      getALawyer: [
        "E-2 Treaty Investor — France's investment threshold scrutiny is rigorous; source-of-funds, 'substantiality', and 'real and operating' tests benefit from specialist drafting",
        "EB-1A / EB-1B / O-1 — extraordinary ability petitions for French researchers / executives",
        "Concurrent French Wegzugsbesteuerung-equivalent (Exit Tax under Article 167 bis CGI) when leaving France with substantial holdings >€800k",
        "Prior US visa refusal or US overstay (even <180 days has 3-year bar implications)",
        "French criminal record (peines / TIG) — disclosure to USCIS / DOS even if amnistied requires careful framing",
        "DALF C1/C2 not held by spouse + spouse from non-EU third country — derivative coordination",
        "PACS partner accompanying — not US-recognised for visa purposes; need plan (convert to marriage, separate visa)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // KENYAN → UK — work
  // ════════════════════════════════════════════════════════════════════

  "KE:GB:work": {
    whatCarriesWeight: [
      {
        label: "Certificate of Sponsorship + sponsor on the Home Office register",
        why: "Kenyans predominantly enter through the Health & Care Worker visa (IHS-exempt, fee £304-£551) or the standard Skilled Worker route (IHS £1,035/year, fees £719-£1,500). Your UK sponsor must hold a valid sponsor licence (check on gov.uk register). NHS Trusts, CQC-registered care providers, and select tech employers actively recruit Kenyan applicants. The April 2024 care-sector rule tightening means individual care providers can no longer sponsor — only larger CQC-registered groups can.",
      },
      {
        label: "Salary thresholds — £38,700 general / £29,000 healthcare / £23,200 transitional",
        why: "From 4 April 2024 Skilled Worker general threshold is £38,700/year (was £26,200). Health & Care Worker remains £29,000 or the SOC code going rate. New Entrants (under 26, recent graduate, PhD STEM, shortage occupation list) qualify at £30,960. Kenyan nurses, doctors, IT engineers, finance professionals, and academics most often hit healthcare/shortage rates.",
      },
      {
        label: "KCSE / KNEC verification + ECCTIS Statement of Comparability",
        why: "Kenya National Examinations Council certificate (KCSE) and KNEC degree certificates need verification via KNEC's portal. ECCTIS (formerly UK NARIC) Statement of Comparability maps Kenyan Bachelor's (4-year, KCSE-entry) to UK Level 6 (~£140, 15 days). For nursing, NMC OSCE/CBT registration is the gating step — book at Mater Misericordiae or Aga Khan Hospital Nairobi for CBT.",
      },
      {
        label: "Kenya Police Clearance + IOM TB test (Nairobi or Mombasa)",
        why: "Certificate of Good Conduct from DCI Nairobi (KES 1,050, online via eCitizen, 7-14 days). UK TB clearance from IOM Nairobi (Westlands) or IOM Mombasa — KES 6,500-9,500, valid 6 months. Provide every country you've spent 6+ months in for the last 10 years — common Kenyan applicant oversight is forgetting a stint in Tanzania, Uganda, Rwanda, or the Gulf.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role + why this UK employer chose you",
        prompt: "UK Home Office tightened scrutiny on East African applications after 2024 care-visa abuses. Be specific: how you found the role (UK-Kenya recruitment partnership, NHS Trust direct, family network, online job board), what makes you the right fit, your salary level vs the going rate for the SOC code. Name the Trust, the team, the line manager. 'General nursing in the UK' fails; 'Band 5 staff nurse, paediatric ward, [named NHS Trust]' passes.",
      },
      {
        heading: "Kenyan work history — exact, verifiable, ICPAK/NCK/EBK numbers",
        prompt: "List every Kenyan employer (Kenyatta National Hospital, Aga Khan, Nairobi Hospital, MP Shah, Mater, Coptic, Avenue, KCB Group, Safaricom, named NGO, named pharma) with month-precision dates, role, salary in KES, supervisor name + WhatsApp/email. Include professional body registrations: NCK (Nursing Council of Kenya), KMPDC (Kenya Medical Practitioners), ICPAK (accountants), EBK (engineers). UK cross-checks these registers.",
      },
      {
        heading: "Maintenance funds + family plan",
        prompt: "Skilled Worker requires £1,270 maintenance held 28 consecutive days OR employer A-rated cover certificate. For Health & Care Worker the £1,270 is usually waived if employer certifies cover. Document KES source-of-funds: Equity Bank, KCB, Standard Chartered Kenya, NCBA bank statements with NSSF deductions visible. Dependent visa for spouse + each child <18 adds £285/£315 maintenance per dependent.",
      },
      {
        heading: "Future plan — ILR settlement or temporary",
        prompt: "Skilled Worker is a 5-year route to ILR. State your settlement plan including Life in the UK test prep and B1 English (already at B2/C1 for most Kenyan professionals — Kenya's medium of instruction is English). If you want to return to Kenya after a fixed period, state that openly — Skilled Worker doesn't require settlement intent. Mention any UK family (Kenyan diaspora is large in London, Birmingham, Reading) but note: they are not 'maintenance providers' unless legally sponsoring.",
      },
    ],
    moneySavingTips: [
      "Health & Care Worker is IHS-exempt (saves £5,175 over 5 years per applicant) — choose this route over standard Skilled Worker whenever role qualifies",
      "Kenyan-trained nurses can negotiate £2,000-£5,000 relocation packages from NHS Trusts — ask at offer stage, especially in critical-care, theatre, and ICU specialties",
      "Use British Council Nairobi for IELTS UKVI (KES 28,500) — book multi-sitting packages if uncertain on first attempt",
      "ECCTIS Statement of Comparability £140 standard / £210 urgent (5-day) — order early to avoid the rush price",
      "Apply for Certificate of Good Conduct online at eCitizen.go.ke — KES 1,050; in-person fingerprinting at Huduma Centre (Embakasi, Kiambu, Nakuru, Mombasa, Eldoret); don't pay touts at DCI HQ KES 5,000+",
      "IOM Nairobi TB test: book early — slot availability is the bottleneck, not the visa fee. Some UK NHS Trusts pre-pay IOM fees as part of relocation",
      "Avoid 'visa agents' charging KES 200,000+ — UK Home Office is the only fee-charging party; UK employer's HR handles CoS at no cost to you",
      "Family-in-UK can act as your sponsor for £1,270 maintenance via a signed Undertaking from a named UK citizen / settled person",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Skilled Worker / Health & Care Worker visa with NHS Trust CoS, clean record, NCK/KMPDC registered",
        "Dependent applications (spouse + children) submitted with main applicant",
        "ILR after 5 years continuous qualifying residence",
        "Switching between sponsored employers within UK (within 60 days of leaving previous role)",
      ],
      getALawyer: [
        "Prior UK visa refusal (study, visit, work) — refusal grounds carry forward",
        "Care sector role with sponsor under CQC investigation / recent licence revocation (2024 saw mass revocations affecting Kenyans)",
        "Past UK overstay or removal",
        "Kenyan criminal record (even if dismissed under Probation of Offenders Act) — disclosure to Home Office is mandatory",
        "Bringing 18+ dependent (adult dependent relative is one of UK's hardest visa categories)",
        "FGM / protection-claim history — disclose carefully; can affect both spouse application and asylum coordination",
        "Past Gulf state work history (KSA, UAE, Qatar, Kuwait) with kafala-system disputes / overstay flags",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // SOUTH AFRICAN → UK — work
  // ════════════════════════════════════════════════════════════════════

  "ZA:GB:work": {
    whatCarriesWeight: [
      {
        label: "Certificate of Sponsorship + Skilled Worker vs Health & Care Worker routing",
        why: "South Africans split between standard Skilled Worker (general roles £38,700, IHS £1,035/yr) and Health & Care Worker (£29,000, IHS-exempt). Beyond these, two SA-specific options: Youth Mobility Scheme (18-30, 2-year, ballot system replaced by direct grant for SA from 2024 — 2,000 visas/year), and UK Ancestry Visa (UK-born grandparent — common for white South Africans; 5-year visa, full work rights, no sponsor needed, route to ILR).",
      },
      {
        label: "SAQA evaluation + HPCSA/SANC/SACAA professional verification",
        why: "South African qualifications need ECCTIS Statement of Comparability (~£140). For regulated professions: SANC (nurses) maps to NMC, HPCSA (doctors, allied health) maps to GMC + role council, SACAA (pilots) to UK CAA, ECSA (engineers) to ICE/IET, SAICA (chartered accountants) to ICAEW. Cross-recognition is much smoother than for non-Commonwealth applicants — Commonwealth heritage and English-medium education work in your favour.",
      },
      {
        label: "SAPS Police Clearance + UK TB test (IOM Pretoria/Cape Town/Durban)",
        why: "SAPS Police Clearance from local SAPS station or eHome Affairs (R150-R200, 6-12 weeks turnaround — start EARLY, this is the most common bottleneck for SA applicants). UK TB clearance from IOM Pretoria, IOM Cape Town, or IOM Durban (R2,500-R3,500, valid 6 months). For every country you've spent 6+ months in (including UK if previous Tier 4 / Youth Mobility) you also need that country's police certificate.",
      },
      {
        label: "Maintenance funds in ZAR converted to GBP — beware of exchange rate timing",
        why: "Skilled Worker requires £1,270 (~R29,000) held in personal name for 28 consecutive days. Health & Care Worker the £1,270 is waived if employer certifies cover. Document via FNB, Standard Bank, Absa, Nedbank, Capitec statements. The ZAR/GBP rate has swung 20%+ in recent years — convert your buffer to GBP early or hold the equivalent of £1,500-£2,000 to avoid edge-case refusals. Each dependent adds £285/£315 maintenance.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route choice — and why",
        prompt: "South Africans have unusually many routes. State explicitly which you're applying for: Skilled Worker, Health & Care Worker, Youth Mobility Scheme (if under 31), UK Ancestry (if grandparent UK-born), or HPI (High Potential Individual visa if you have a degree from one of the world's top 50 universities — UCT, Wits, Stellenbosch made the list previously but check current ranking). Show research — picking the right route is half the application.",
      },
      {
        heading: "Your South African work history — verifiable, professional body numbers included",
        prompt: "List every SA employer (Discovery Health, MediClinic, Netcare, Life Healthcare, Standard Bank, FirstRand, Sasol, Anglo American, MTN, Vodacom, Naspers, named NGO) with exact dates, role, salary in ZAR, supervisor + email. Include professional body numbers: SANC PIN (nurses), HPCSA MP/SP/PSY number, ECSA PrEng/CandEng, SAICA membership. UK Home Office cross-checks these registers directly with SA bodies.",
      },
      {
        heading: "Family + 'plan' — including the Commonwealth/Ancestry angle",
        prompt: "If you have UK-born ancestry, mention it even if you're not applying via the Ancestry route — it strengthens settlement intent for Skilled Worker. Document family already in UK (SA expat community in London, Bristol, Reading, Manchester is large). Show genuine integration plan: housing, schools (state school catchment areas, fees if independent), community ties. Avoid 'I want to leave SA' framing — focus on positive UK pull factors.",
      },
      {
        heading: "Future plan — ILR, dual citizenship, or temporary",
        prompt: "Skilled Worker, Health & Care Worker, and UK Ancestry are all 5-year routes to ILR. SA citizenship can be retained alongside British (SA permits dual citizenship with prior application via Section 26B — file before naturalising UK to avoid loss of SA passport). Mention this if asked — it shows settlement seriousness. Life in the UK test + B1 English (most South Africans are at C1/native English from school) is straightforward.",
      },
    ],
    moneySavingTips: [
      "UK Ancestry Visa has NO sponsor requirement (saves the SOC-code wage scrutiny entirely) — if you have a UK-born grandparent, this is almost always the best route",
      "Youth Mobility Scheme is a ballot system replaced by direct grant for South Africans from 2024 — 2,000 visas/year; £298 fee + IHS, NO sponsor needed, 2-year stay, route to switch into Skilled Worker after building UK experience",
      "Health & Care Worker is IHS-exempt — saves £5,175 over 5 years per applicant",
      "SAPS PCC: apply EARLY (12 weeks turnaround) at your local SAPS station or via eHome Affairs — R150-R200, don't use 'expediting services' charging R5,000+",
      "Use ECCTIS Statement of Comparability (£140 standard) ONLY if your profession is regulated — for unregulated tech/finance roles UK employers accept SA degree certificates directly",
      "SA Reserve Bank approval (Exchange Control SARB) for any GBP transfer above R1m — apply via your SA bank's FX desk free of charge; allow 7-14 days",
      "Negotiate UK-paid relocation package from NHS Trust / UK tech employer — typically £3,000-£8,000 for SA hires given the higher logistics cost",
      "Skip 'visa consultants' charging R30,000+ — Home Office fees + ECCTIS + SAPS + IOM total ~£3,000 for primary applicant; everything else is your time",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Skilled Worker / Health & Care Worker with NHS Trust CoS or named UK employer",
        "UK Ancestry Visa with UK-born grandparent (clear documentary chain)",
        "Youth Mobility Scheme (now direct-grant for SA citizens 18-30)",
        "Dependent visa applications (spouse + children) concurrent with main applicant",
        "ILR after 5 years continuous qualifying residence",
        "Switching from Tier 4 Student to Skilled Worker within UK",
      ],
      getALawyer: [
        "Past UK visa refusal (including a 2020+ Tier 4 student refusal)",
        "Past UK overstay or removal (SAPS Police Clearance shows port-of-departure history if relevant)",
        "SA criminal record (even minor, even diversion programme outcomes — disclosure to Home Office is mandatory)",
        "UK Ancestry application where the grandparent's birth was in pre-independence Commonwealth countries (Northern Ireland 1921+ counts; Republic of Ireland post-1922 does NOT)",
        "Bringing 18+ dependent or adult dependent relative (one of UK's hardest visa categories)",
        "Dual SA / other non-Commonwealth passport (visa application from the wrong passport)",
        "HPI (High Potential Individual) visa where your university's ranking dropped off the eligible list since you graduated — eligibility uses the ranking from the year of your graduation, so document this carefully",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // THAI → US — study
  // ════════════════════════════════════════════════════════════════════

  "TH:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 paid",
        why: "Your US institution issues Form I-20 (F-1) or DS-2019 (J-1 exchange) once admitted and proof-of-funds verified. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) before booking DS-160 interview — without the SEVIS receipt the consulate will reject the appointment. Thai applicants book at US Embassy Bangkok (Wireless Road) or US Consulate General Chiang Mai. Bangkok slots typically open Mondays 7am ICT and fill within minutes during peak season.",
      },
      {
        label: "Proof of funds in THB with USD equivalent + 214(b) ties to Thailand",
        why: "Show 1st-year tuition + living costs (typically $40-80k). Thai bank statements (SCB, Kasikorn, Bangkok Bank, Krungthai, Krungsri) are accepted but the DS-160 interviewer wants USD equivalent at the BOT rate. Strong 214(b) ties for Thai applicants: family in Thailand (parents' tha-bian-baan / house registration), property in Thailand (land deed chanote), Thai military service (DAFM exemption certificate or completed conscription documentation), expected return job (Thai employer letter), Thai fiancé(e).",
      },
      {
        label: "Strong English score + Thai academic transcripts apostilled",
        why: "TOEFL iBT 80+ or IELTS Academic 6.5+ is typical for US undergrad/grad admission. For visa purposes, the DS-160 interview will be in English — practice with native speakers or AUA Thailand-language teachers (reverse). Thai high-school M.6 transcript and any university transcripts need Ministry of Foreign Affairs Thailand legalisation (Department of Consular Affairs, Chaeng Wattana) — about THB 200/document, 2 working days regular or same-day rush.",
      },
      {
        label: "Visa interview narrative — clear, short, no overselling",
        why: "Thai applicants face a relatively friendly US consulate (refusal rate historically below 20% for first-time F-1), but interviews are short (1-3 minutes). The officer wants: which school + programme, who pays, why this programme, what you'll do after graduation. Long answers and over-rehearsed scripts hurt; clear short answers and confidence help. Bring all documents in an organised folder but expect the officer to ask for only 2-3.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Thai or AEC alternatives",
        prompt: "Thailand has strong universities (Chulalongkorn, Mahidol, Thammasat, Chiang Mai). Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS, NYC for finance, Hollywood for film, Boston for biotech). Reference concrete elements: a specific course not offered at Chula, an internship pipeline, faculty publication you've read. Vague 'American education is the best' is a 214(b) refusal trigger.",
      },
      {
        heading: "Funding — Thai family / scholarship structure",
        prompt: "Quantify: tuition $X, living $Y, total Year 1 $Z. Then show coverage: family contribution THB X (with bank statement and notarised Affidavit of Support), scholarship $Y, savings $Z. Common Thai funding sources: family-owned business profits, parent salary (especially government officers — explain rank and ministry), real estate rental income, family land sale proceeds. Document each clearly with chanote (land deed) or business registration.",
      },
      {
        heading: "Post-graduation plan — your return to Thailand",
        prompt: "F-1 visas explicitly require intent to return. State which Thai sector you'll return to (Thai banking — Bangkok Bank, SCB, KBank; Thai telecoms — AIS, True, dtac; Thai retail — Central, CP, BJC; Thai hospitality — Minor, Centara, Dusit; Thai pharma; or family business). If your family owns a business, mention it explicitly — succession plan is strong 214(b) evidence. If you want OPT (Optional Practical Training) after graduation, briefly mention but emphasise return.",
      },
      {
        heading: "Family ties remaining in Thailand",
        prompt: "List parents (occupation, location), siblings, grandparents, partner. Mention property — family home (with tha-bian-baan registration showing your name), land owned by parents that you're heir to, Thai bank accounts you'll maintain (with Thai mobile number for SMS-OTP). Thai military status (sor-dor for completed service, or DAFM exemption) is important to mention — males 21+ must show resolved military obligation.",
      },
    ],
    moneySavingTips: [
      "Apply through US Embassy Bangkok — Wireless Road; Chiang Mai consulate has shorter wait times if you're from the North",
      "F-1 visa fee is $185 (was $160 pre-2023); pay via Krungthai Bank deposit slip — fastest and the bank prints the official MRV receipt",
      "Don't pay for visa-prep agencies — DS-160 is online, free, and questions are straightforward. The interview is the bottleneck, not the form",
      "Thai applicants are eligible for Fulbright Thailand (~$30,000 stipend + tuition), Anandamahidol Foundation (Royal scholarship for top students), Asian Cultural Council fellowships, AIT-Thailand graduate scholarships",
      "Some US universities offer 'Thai Heritage Scholarships' — Cornell, Stanford, MIT, USC, Texas A&M have named Thai-origin endowments; ask the international student office",
      "OneStudent visa application centre (third-party) is not required for Thailand — apply direct to US Embassy Bangkok",
      "Use Krungthai or SCB student remittance accounts for tuition transfers — lower FX fees than retail remittance, regulated under BOT educational outflow allowance (no annual limit for tuition)",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding, strong programme fit",
        "Standard exchange-programme J-1 through AFS, EF, AYUSA, Fulbright, or accredited Thai university partnership",
        "Renewal of existing F-1 (re-issuance in Thailand during winter / summer breaks)",
        "OPT or STEM OPT application during or after the programme",
      ],
      getALawyer: [
        "Prior US visa refusal (any category — B1/B2 tourist refusal is a red flag for F-1)",
        "Thai criminal record (even minor — drug possession, DUI, bar-related charges)",
        "Lèse-majesté (Section 112) related case history — disclose carefully; framing matters for US disclosure",
        "Funding from a sponsor outside Thailand (Chinese, Indian, Cambodian, Laotian sponsors face additional scrutiny)",
        "Past US overstay (even 30 days) or B1/B2 visa flag in your travel history",
        "Transfer from another country's F-1 status (SEVIS transfer within US is fine, country-to-country needs care)",
        "Same-sex partner accompanying — Thailand recognised same-sex civil partnerships from January 2025 (Marriage Equality Act); F-2 dependent for same-sex spouse needs careful documentation",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // EGYPTIAN → UAE — work
  // ════════════════════════════════════════════════════════════════════

  "EG:AE:work": {
    whatCarriesWeight: [
      {
        label: "Employer Work Permit + Entry Permit (تأشيرة دخول العمل) issued by MOHRE",
        why: "Egyptians are the second-largest expat population in UAE (~900,000+). Your UAE employer applies to the Ministry of Human Resources & Emiratisation (MOHRE) for a Work Permit, and to GDRFA (Dubai) / ICA (Abu Dhabi / other emirates) for the Entry Permit. The 60-day Entry Permit lets you fly in; on arrival you do medical fitness test, Emirates ID biometric, and visa stamping in your passport (now mostly digital). Total employer cost AED 3,000-7,000 — should be paid by employer per UAE Labour Law.",
      },
      {
        label: "Egyptian educational certificates attested through MOFA + UAE Embassy Cairo",
        why: "All Egyptian degree certificates need attestation: 1) issuing Egyptian university stamp, 2) Ministry of Higher Education Egypt, 3) Egyptian MOFA (Tahrir or Cairo airport), 4) UAE Embassy in Cairo (currently in Garden City), 5) UAE MOFA on arrival. Total cost EGP 1,500-3,500 + AED 150-300. Attestation typically takes 3-6 weeks — start before applying for the job offer if possible. For salary above AED 12,000/month, the role/degree match matters less; for under that level, MOHRE checks degree-occupation fit more rigorously.",
      },
      {
        label: "Salary tier determines visa category + Golden Visa potential",
        why: "UAE work visa is now tiered: Standard (most workers, 2-year visa renewable), Professional (AED 25,000+/month, simpler renewal), Golden Visa (5 or 10 years, no sponsor, family included). Egyptian professionals earning AED 30,000+/month (engineers, doctors, senior managers) qualify for Golden Visa directly. Investors with AED 2M property or AED 2M public investment also qualify regardless of nationality.",
      },
      {
        label: "Medical fitness test + tuberculosis / HIV screening on arrival",
        why: "Within 60 days of Entry Permit issuance you must complete medical fitness at DHA-approved centres (Dubai), SEHA (Abu Dhabi), or MOHAP (other emirates). TB, HIV, and Hepatitis B/C screening — positive results lead to immediate non-issuance of residence visa and deportation. Costs AED 320-750. Egyptian applicants with prior Gulf experience should pre-test in Egypt at an authorised lab (Al Borg, AlfaLab) — saves the AED airfare-loss if results would disqualify.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role, your UAE employer, and salary tier",
        prompt: "UAE doesn't ask for personal statements at the consular interview stage (most processing is employer-led + MOHRE-portal), but during medical fitness and emirates ID interview officers may ask. Be ready: which UAE company, which emirate, salary band, role responsibilities, and specifically why the UAE labour market needs an Egyptian rather than Emirati or other GCC national. Egyptian Arabic and educational background in Egypt (Cairo University, Ain Shams, Alexandria, AUC) are recognised positives.",
      },
      {
        heading: "Your Egyptian work history — TIN, social insurance number, exact dates",
        prompt: "List every Egyptian employer with month-precision dates, role, salary in EGP, supervisor name + contact. Include TIN (Tax ID Number) from Egyptian Tax Authority and Social Insurance Number from National Organisation for Social Insurance — UAE attestation occasionally requires these. Past Gulf experience (KSA, Qatar, Kuwait, Oman, Bahrain) strengthens applications — document each Gulf contract by employer name, dates, and reason for leaving.",
      },
      {
        heading: "Family + sponsorship plan",
        prompt: "If bringing dependants (spouse, children, parents) — they need separate Dependent Residence visas tied to your sponsorship. Salary threshold AED 4,000/month + accommodation for sponsoring spouse/children; AED 6,000-12,000/month for sponsoring parents (varies by emirate). Egyptian spouse / children carry Egyptian passports — separate attestation chain (Egyptian marriage cert + birth certs) and UAE Embassy Cairo legalisation needed.",
      },
      {
        heading: "Long-term plan — Golden Visa or rotation back to Egypt",
        prompt: "UAE work visas are not a path to citizenship (UAE doesn't naturalise foreign workers in practice). State either: Golden Visa target (if income/investment qualifying) for 5-10 year stability, or temporary contract (2-3 years) with planned return to Egypt. Some Egyptian professionals split residence — UAE Golden Visa + Egyptian property maintenance + family rotation. Tax: Egypt taxes worldwide income for tax-resident Egyptians (>183 days/year in Egypt); UAE has no personal income tax.",
      },
    ],
    moneySavingTips: [
      "Employer must pay all work visa costs per UAE Labour Law (MOHRE Resolution 30 of 2013) — refuse any 'visa fee deduction' from your first salary; report to MOHRE if pressured",
      "Egyptian degree attestation: do all 5 steps yourself (~EGP 1,500 + AED 250) instead of via agency charging EGP 8,000-15,000",
      "Medical fitness centres: DHA-approved centres in Dubai (Al Maktoum, Karama) are cheaper (AED 320 standard) than SEHA premium services (AED 750)",
      "Open ENBD, FAB, or ADCB salary account — corporate sponsor often gets fee waivers; ask about salary-transfer-based account opening before paying account opening fees",
      "Don't use 'free zone PRO services' charging AED 5,000+ for what your employer's PRO does free — clarify at offer stage who handles your Emirates ID processing",
      "Apply for Egyptian Tax Residency Certificate if you'll be UAE-resident >183 days/year — exempts you from Egyptian worldwide-income tax for that period",
      "Egyptian Mogamma in Cairo can certify documents faster than waiting for embassy queues in Dubai/Abu Dhabi — do all attestation before leaving Egypt",
      "Use the UAE Visa Insurance product for the 60-day Entry Permit window (covers if work-visa stamping is delayed) — AED 250-400 vs cancellation rebooking cost",
    ],
    lawyerTriggers: {
      diy: [
        "Standard employer-led work permit + entry permit + residence visa with attested certificates",
        "Medical fitness, Emirates ID biometric, and visa stamping (all employer-facilitated)",
        "Dependent visa for spouse + children once you have residence visa and qualifying salary",
        "Golden Visa application via salary or property route (online via ICA / GDRFA portal)",
      ],
      getALawyer: [
        "Past UAE labour ban (1-year, 6-month, or lifetime — issued for absconding, breach of contract, or criminal case)",
        "Egyptian criminal record (military case, drugs, debt — UAE rigorously checks)",
        "Previous Gulf labour dispute (kafala-system unpaid wages, employer-side passport-holding case)",
        "Switching from one UAE sponsor to another mid-contract without sponsor NOC (now easier under 2022 Labour Law, but edge cases benefit from a PRO/lawyer)",
        "Free zone visa vs mainland visa selection (DMCC, JAFZA, ADGM, DIFC have different rules; investment thresholds vary)",
        "Real estate Golden Visa application (AED 2M property qualifier — title deed must be in your sole name, not shared)",
        "Family member with prior UAE conviction or labour ban (affects your sponsorship eligibility)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // VIETNAMESE → US — study
  // ════════════════════════════════════════════════════════════════════

  "VN:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 paid",
        why: "Vietnamese students are the 5th-largest international cohort in the US (~30,000 annually). Your US institution issues Form I-20 (F-1) or DS-2019 (J-1 exchange) once admitted and proof-of-funds verified. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) BEFORE booking DS-160 — without the SEVIS receipt the consulate rejects the appointment. Vietnamese applicants book at US Consulate General Ho Chi Minh City (Le Duan, District 1) or US Embassy Hanoi (Lang Ha) depending on residence.",
      },
      {
        label: "Strong source-of-funds documentation in VND — the biggest refusal driver",
        why: "Vietnam has high F-1 refusal rates (~30-40%) primarily due to funding concerns. Show 1st-year tuition + living costs ($40-80k typical). Document Vietnamese bank balance (Vietcombank, BIDV, VietinBank, ACB, Techcombank, MB Bank) with USD-equivalent at SBV rate. Family business funding requires Business Registration Certificate (Giấy phép kinh doanh), tax declarations for last 3 years, and bank statements showing genuine cashflow — not just lump sums dropped in 1 week before interview. Sudden deposits trigger 214(b) refusal.",
      },
      {
        label: "Vietnamese academic transcripts apostilled + notarised translation",
        why: "Vietnam high-school certificate (Bằng Tốt nghiệp THPT) and university transcripts need Vietnamese Ministry of Foreign Affairs legalisation (Department of Consular Affairs, Hanoi or HCMC sub-office). Apostille is NOT available — Vietnam isn't a Hague Convention signatory for apostille. Instead: notarise the Vietnamese original at Phòng Công chứng, then certified translation at a sworn translator, then consular legalisation by US Embassy/Consulate or by Vietnamese MOFA for incoming use. Cost VND 200,000-500,000 per document.",
      },
      {
        label: "214(b) ties to Vietnam — family, property, return job, post-graduation plan",
        why: "F-1 is non-immigrant — officer assumes you intend to overstay unless you prove otherwise. Strong Vietnamese ties: family home with Sổ Đỏ (red book / land title) in parents' name, parents' Vietnamese employment (especially government / military / SOE), Vietnamese property (apartment, land), Vietnamese business succession (family company shares allocated to you), expected return job (Vietnamese employer Memorandum of Understanding for post-graduation hire). Officers ask 'what will you do after graduation' — answer should be Vietnam-specific, not 'maybe stay in the US'.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Vietnamese universities",
        prompt: "Vietnam has good universities (VNU Hanoi, HCMUS, FTU, NEU, RMIT Vietnam, BUV British University Vietnam). Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS, NYC for finance, Boston for biotech), specialised programme not available in Vietnam. Reference concrete elements: a faculty publication, a specific course, a lab. Vague 'American education is the best' is a 214(b) refusal trigger.",
      },
      {
        heading: "Funding — Vietnamese family / business structure",
        prompt: "Quantify: tuition $X, living $Y, total Year 1 $Z. Then show coverage: family contribution VND X (with bank statement and Giấy ủy quyền — power of attorney / sponsorship affidavit), scholarship $Y, savings $Z. If parents own a business, name it, attach Business Registration, tax declarations (Tờ khai thuế), and bank statements showing 12+ months of revenue. Vietnamese consular officers know which industries throw off real cashflow vs which are paper-only — be transparent.",
      },
      {
        heading: "Post-graduation plan — your return to Vietnam",
        prompt: "F-1 visas explicitly require intent to return. State which Vietnamese sector you'll return to: Vietnamese banks (Vietcombank, BIDV, Techcombank, VPBank), Vietnamese tech (VinAI, Viettel, FPT, VNG), foreign multinational Vietnam offices (Samsung Vietnam, Intel Vietnam, Unilever, Nestlé), or family business succession. If you want OPT (Optional Practical Training) after graduation, briefly mention it but emphasise return.",
      },
      {
        heading: "Family ties remaining in Vietnam",
        prompt: "List parents (occupation, location — Hanoi / HCMC / Da Nang district level), siblings, grandparents, partner. Mention Vietnamese property — family home Sổ Đỏ in parents' name with you as heir, land in original province (quê), Vietnamese bank accounts you'll maintain. For Vietnamese males 18-25, military service status (Nghĩa vụ Quân sự) is important — show exemption certificate, deferral document, or completed service paper. Undisclosed military deferral can affect future Vietnamese re-entry.",
      },
    ],
    moneySavingTips: [
      "Apply through US Consulate Ho Chi Minh City — generally faster slot turnover than Hanoi; both consulates can serve any Vietnamese resident",
      "F-1 visa fee is $185; pay via Citibank Vietnam deposit slip with the MRV barcode — fastest receipting",
      "Don't pay 'visa consultancy' agencies VND 50-150M for what is a free DS-160 form + interview — they don't influence consular decisions; the interview is the bottleneck",
      "Vietnamese applicants are eligible for Fulbright Vietnam (~$30,000 + tuition for grad students), USAID-funded scholarships, VEF (Vietnam Education Foundation) for STEM PhDs, Atlantic Philanthropies (legacy), Ford Foundation IFP alumni network",
      "Many US universities have 'Vietnamese Heritage Scholarships' — Cornell, Stanford, MIT, USC, Texas A&M, Boston College have named Vietnamese-origin endowments; ask the international student office at admission time",
      "Use VietinBank or BIDV student remittance accounts for tuition transfers — lower FX fees than retail; regulated under SBV educational outflow allowance (no annual cap for tuition with proof of admission)",
      "Get all transcripts MOFA-legalised in Vietnam before applying — legalisation from outside is 5-10x more expensive and slower",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding, strong programme fit",
        "Standard exchange-programme J-1 through Fulbright Vietnam, AFS, EF, AYUSA, or accredited Vietnamese university partnership",
        "Renewal of existing F-1 (re-issuance in Vietnam during winter / summer breaks)",
        "OPT or STEM OPT application during or after the programme",
      ],
      getALawyer: [
        "Prior US visa refusal (any category — B1/B2 tourist refusal is a major red flag for F-1)",
        "Vietnamese criminal record (even minor — drug, theft, fraud)",
        "Funding from a sponsor outside Vietnam / family (third-country sponsors face heavy scrutiny)",
        "Past US overstay or visa flag in your travel history (even old)",
        "Transfer from another country's F-1 status (SEVIS transfer within US is fine, country-to-country needs care)",
        "Unresolved Vietnamese military obligation status (males 18-25)",
        "Family member with prior US asylum claim — even successful claim can affect your non-immigrant intent showing",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // NIGERIAN → US — study
  // ════════════════════════════════════════════════════════════════════

  "NG:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 paid",
        why: "Nigeria sends ~17,000 students to the US annually — the highest in Sub-Saharan Africa. Your US institution issues Form I-20 (F-1) or DS-2019 (J-1) once admitted and proof-of-funds verified. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) before booking DS-160. Nigerian applicants book at US Embassy Abuja (Diplomatic Drive) or US Consulate General Lagos (Walter Carrington Crescent, Victoria Island). Lagos handles higher F-1 volume; Abuja often has shorter wait times.",
      },
      {
        label: "Source-of-funds + WAEC/NECO certificate authenticity",
        why: "Nigerian F-1 refusals (~50%+ historically — among the world's highest) cluster around (1) funding gaps and (2) document authenticity concerns. Show 1st-year tuition + living costs ($40-80k). Document Nigerian bank statements (Zenith, GTBank, First Bank, Access, UBA, Stanbic IBTC) with USD-equivalent at CBN I&E window rate. WAEC and NECO certificates need verification — US schools now require scratch-card online verification at waecdirect.org and neco-ng.org. Forged WAEC results are a known refusal trigger; never use a 'verifier service' that promises pass results.",
      },
      {
        label: "Strong 214(b) ties to Nigeria — family, property, return plan",
        why: "F-1 is non-immigrant. Strong Nigerian ties: family home with Certificate of Occupancy / Governor's Consent, parents' Nigerian employment (especially government, military, oil & gas, banking, big professional services), Nigerian property (Lagos, Abuja, Port Harcourt — with C of O), expected return job (Nigerian employer letter), family business succession. Officers ask 'what will you do after graduation' — answer Nigeria-specific: 'return to family business / Nigerian banking sector / Nigerian university teaching role' beats 'I'll see what opportunities arise'.",
      },
      {
        label: "DS-160 form accuracy + interview confidence",
        why: "Nigerian applicants face particularly close DS-160 scrutiny on travel history, family ties, and prior visa applications. Be completely truthful — disclose every prior US visa application (even refusals 10 years ago), every prior travel (Ghana, UK, UAE, South Africa visits), and every family member who has emigrated. Hide nothing. Practice interview answers in clear English (Nigerian applicants are at a strong advantage with native English) but avoid memorised scripts.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Nigerian or UK alternatives",
        prompt: "Nigeria has strong universities (Covenant University, University of Ibadan, OAU, UI, UNN, UNILAG, ABU Zaria) and many Nigerians study in UK (LSE, UCL, Manchester) or Ghana (UG, KNUST). Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS, NYC for finance, Houston for energy, Boston for biotech), specialised programme. Reference concrete elements: faculty publication, specific course, lab.",
      },
      {
        heading: "Funding — Nigerian family / business / sponsor structure",
        prompt: "Quantify: tuition $X, living $Y, total Year 1 $Z. Then show coverage: family contribution NGN X (with bank statement, sponsor's CAC business registration if business-owner, tax clearance, oil & gas / banking / professional services employment letter). Document at least 12 months of consistent income — F-1 officers know which industries throw off real cashflow vs paper-only. Avoid lump-sum deposits in the 30 days before interview; that's the #1 refusal trigger.",
      },
      {
        heading: "Post-graduation plan — your return to Nigeria",
        prompt: "F-1 visas explicitly require intent to return. State which Nigerian sector: Nigerian banks (GTBank, Zenith, Access, UBA, FBN), oil & gas (NNPC, Shell, Chevron, Mobil, Total, Seplat), Nigerian tech (Andela, Flutterwave, Paystack, Interswitch, Konga), telecoms (MTN, Glo, Airtel, 9mobile), professional services (PWC, KPMG, Deloitte, EY Nigeria), or family business succession. If you want OPT (Optional Practical Training) briefly mention it but emphasise return to Nigeria.",
      },
      {
        heading: "Family ties remaining in Nigeria",
        prompt: "List parents (occupation, location — Lagos / Abuja / state level), siblings, partner. Mention Nigerian property — family home with C of O / Governor's Consent in parents' name with you as heir, land in your village/state of origin, Nigerian bank accounts you'll maintain (with Nigerian mobile number for OTP/USSD banking). Mention any obligation in Nigeria — family business board membership, NYSC service deferral (post-graduation 1-year mandatory service is a clear return trigger).",
      },
    ],
    moneySavingTips: [
      "Apply at US Consulate Lagos OR Embassy Abuja — Abuja often has faster appointment slots than Lagos during peak student-visa season (May-August)",
      "F-1 visa fee is $185; pay via GTBank or Zenith Bank counter with MRV barcode — both accept USD cash or Naira at CBN rate",
      "Don't pay 'visa consultancy' agencies ₦500,000-2,000,000 — DS-160 is free online, interview is the bottleneck, and these agencies don't influence consular decisions",
      "Nigerian applicants are eligible for Fulbright Nigeria (~$30,000 + tuition for grad students), MasterCard Foundation Scholars Program (UC Berkeley, Michigan, McGill, Stanford, etc.), Aliko Dangote Foundation scholarships, MTN Foundation Scholarships, Shell LiveWIRE entrepreneurial scholarships, Tony Elumelu Foundation",
      "Many US universities have Nigerian-origin scholarship endowments — Harvard, Yale, Stanford, MIT, Cornell, Columbia all have named Nigerian-heritage funds; ask the international student office",
      "Use online I&E window banks (Stanbic IBTC, Zenith) for tuition transfers — lower FX fees than retail BDC; CBN PTA student allowance is $20,000/quarter with proof of admission",
      "WAEC/NECO scratch card verification ($30-100) is paid by US school — don't pay any 'verification expediter' a separate fee",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding, verifiable WAEC/NECO, and strong programme fit",
        "Standard Fulbright, MasterCard Foundation, or named-scholarship J-1 / F-1 application",
        "Renewal of existing F-1 (re-issuance in Nigeria during winter / summer breaks)",
        "OPT or STEM OPT application during or after the programme",
      ],
      getALawyer: [
        "Prior US visa refusal (any category — B1/B2 tourist refusal is a major red flag for F-1)",
        "Nigerian criminal record OR pending EFCC / ICPC case (even minor — disclose to consulate)",
        "Funding from a sponsor outside Nigeria / immediate family (third-country sponsors trigger fraud scrutiny)",
        "Past US overstay or visa flag in your travel history",
        "WAEC/NECO certificate authenticity dispute (re-take or appeal pending)",
        "Family member with prior US asylum claim from Nigeria — affects 214(b) showing",
        "Transfer from UK/Canadian student visa to US F-1 — country-to-country SEVIS transfer needs careful handling",
        "Past Ghana / South Africa / UAE / UK travel with visa overstay flag",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDONESIAN → AUSTRALIA — study
  // ════════════════════════════════════════════════════════════════════

  "ID:AU:study": {
    whatCarriesWeight: [
      {
        label: "Subclass 500 Student Visa + Confirmation of Enrolment (CoE) from a CRICOS provider",
        why: "Indonesia is Australia's 3rd-largest source of international students (~22,000 enrolments). Your Australian institution issues CoE once you accept the offer and pay initial fees. Apply for Subclass 500 online (AUD$1,600 fee from 1 July 2024, raised from $710 — one of the world's most expensive student visa fees). Indonesian applicants are 'Assessment Level 1' under SSVF since 2023 — the lowest scrutiny tier, no financial bond required if institution is also Streamlined-eligible.",
      },
      {
        label: "Genuine Student (GS) requirement — replaced GTE in March 2024",
        why: "From 23 March 2024, the Genuine Temporary Entrant (GTE) test is replaced by the Genuine Student (GS) test plus separate immigration-pathway questions. Your statement must address: previous study + work + travel history, course-career link, Australian study benefits vs Indonesian options, and post-graduation plan. Indonesian applicants previously cited GTE high-success route — GS is similar but with explicit acknowledgement of pathway intent: you CAN say you intend to apply for post-study work visa (Subclass 485) and even PR, as long as you genuinely intend the study.",
      },
      {
        label: "OSHC + financial capacity declaration",
        why: "Overseas Student Health Cover is mandatory for the full visa duration — providers Bupa, Medibank, Allianz, NIB, AHM. Single AUD$650-850/year; family AUD$3,500-5,000/year. Financial capacity from 10 May 2024: AUD$29,710/year living costs (raised from $24,505) + tuition + travel. Indonesian rupiah bank statements (BCA, Mandiri, BNI, BRI, CIMB Niaga, Permata) acceptable; large family-business sponsors should attach NPWP, SIUP, TDP, and 2 years of tax filings.",
      },
      {
        label: "Indonesian academic certificates + notarised translation",
        why: "Indonesian SMA/SMK diploma (Ijazah) and university transcripts (Daftar Nilai) need notarised translation by a sworn translator (Penerjemah Tersumpah) at the Ministry of Law (Kemenkumham) registry. Apostille via Kemenkumham (Indonesia joined Hague Apostille Convention on 4 June 2022) — replaced the older multi-stage legalisation. Cost IDR 75,000 per document, 3-5 working days at Kemenkumham Jakarta / Surabaya / Medan / Makassar / Denpasar.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why Australia, why this course, why this institution",
        prompt: "Indonesia has good universities (UI, UGM, ITB, ITS, UNAIR, BINUS, UPH). Explain why your Australian programme offers something unique — Group of Eight research depth, ANU policy network, Melbourne biotech, UQ tropical medicine, USyd business case studies, UTS engineering practice. Reference specific elements: faculty publication, course coursework, industry partnership. Vague 'Australian education is high quality' is a GS refusal trigger.",
      },
      {
        heading: "Course-career link",
        prompt: "Map your Indonesian background to the Australian course to your post-graduation career. Be specific: 'Bachelor of Accounting from UPH → Master of Professional Accounting at UNSW → return to Indonesia as Big Four senior associate / CFO track at family business / Indonesian government Ministry of Finance.' If you intend to use the Temporary Graduate Visa (485) for post-study Australian work first, state that openly — GS doesn't penalise stated pathway intent.",
      },
      {
        heading: "Funding — Indonesian family / business / scholarship",
        prompt: "Quantify: tuition AUD$X, living AUD$29,710, total Year 1 AUD$Z. Then show coverage: family contribution IDR X (with bank statement, NPWP tax record, SIUP/TDP business registration if business-owner). LPDP (Lembaga Pengelola Dana Pendidikan) scholarship recipients should attach LPDP letter — it's gold-standard funding evidence. Australia Awards Indonesia scholarship recipients have separate application path.",
      },
      {
        heading: "Your immigration pathway — be honest",
        prompt: "Indonesian students often pursue Subclass 485 Temporary Graduate Visa (2-5 years post-study work right) and some target PR via Subclass 189/190/491. State this honestly — GS allows expression of pathway intent. Document strong Indonesian ties anyway (family home with sertifikat hak milik, family business succession, returning-job offer) since visa officers still weigh likelihood of return after the temporary work visa expires.",
      },
    ],
    moneySavingTips: [
      "Subclass 500 visa fee is AUD$1,600 (from 1 July 2024) — no discount available; this fee covers main applicant only, each dependent adds $440 (under 18) or $1,190 (over 18)",
      "Don't pay Indonesian education agents commission you can avoid — many CRICOS providers (Monash, UNSW, Melbourne, Sydney, ANU, UQ, UTS, Macquarie, RMIT) accept direct applications saving agent fees of AUD$2,000-5,000",
      "LPDP (government scholarship) covers tuition + living + return flights + visa fee + insurance — apply early in the year (intake closes around July/September); selection is highly competitive",
      "Australia Awards Indonesia: ~250 scholarships/year for Indonesians, fully funded; priority sectors are health, education, governance, economic recovery",
      "Bidik Misi continuation programmes can extend to Australian master's via memorandum institutions",
      "OSHC: don't bundle through agent — compare directly at private health.gov.au site; Bupa and Medibank are typically cheapest single student cover",
      "PTE Academic test is AUD$355 in Jakarta vs IELTS at AUD$385; Australian universities accept PTE equally — book at British Council / IDP centres",
      "Use BCA, Mandiri, or BNI student remittance for tuition — lower FX fees than retail money changers; Bank Indonesia educational outflow has no annual cap with admission proof",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Subclass 500 with clean record, clear LPDP / Australia Awards / family funding, strong GS statement",
        "Dependent visa applications (spouse + children) concurrent with main applicant",
        "Subclass 485 Temporary Graduate Visa application after completing 2+ years study",
        "Course change or institution change within the same visa (notify provider; usually no new visa needed)",
        "OSHC switch / renewal during visa term",
      ],
      getALawyer: [
        "Prior Australian visa refusal (visitor, study, or work) — refusal grounds carry forward to GS assessment",
        "Past Australian student visa cancellation (attendance below 80%, course non-progression)",
        "Indonesian criminal record (even minor — narkotika cases are deal-breakers regardless of disposition)",
        "Funding from a sponsor outside Indonesia / immediate family",
        "Past US / UK / Canada visa refusal flagged on DS-160 / IRCC / Home Office records (Australia checks Five Eyes data)",
        "Family member with prior Australian asylum claim",
        "Switching from non-CRICOS course to a CRICOS course mid-stream",
        "Bringing dependants when funding is borderline ($29,710 + dependent additions tightens scrutiny)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // MALAYSIAN → UK — study
  // ════════════════════════════════════════════════════════════════════

  "MY:GB:study": {
    whatCarriesWeight: [
      {
        label: "Confirmation of Acceptance for Studies (CAS) + UK Student Visa application",
        why: "Malaysia is the UK's 7th-largest source of international students (~17,000 enrolments). Your UK institution issues CAS once admitted and deposit paid. Apply for the UK Student visa (formerly Tier 4) online — £490 outside UK / £490 IHS at £776/year for students (reduced from £1,035 standard IHS in 2024). Malaysian applicants are 'low-risk nationals' — minimal Genuine Student narrative needed; document collection is lighter than for some other origins.",
      },
      {
        label: "Financial capacity — £1,334/month London or £1,023/month outside London, held 28 consecutive days",
        why: "From January 2024 living costs raised to £1,334/month for courses in London (£12,006 for 9 months) and £1,023/month outside London (£9,207 for 9 months). Must be held 28 consecutive days in your or parents' personal name (not company account). Document via Malaysian banks: Maybank, CIMB, Public Bank, RHB, Hong Leong, AmBank. PTPTN, MARA, JPA, Khazanah, Yayasan Khazanah, Yayasan Sime Darby scholarship awards count as financial sponsor letters — attach the offer letter and signed agreement.",
      },
      {
        label: "Academic transcripts (SPM/STPM/A-Level/Matrikulasi) + ECCTIS verification",
        why: "Malaysian SPM, STPM, A-Level (Cambridge), Matrikulasi, and undergraduate degrees are well-known to UK admissions. For visa purposes, your UK school determines whether ECCTIS Statement of Comparability is needed — for SPM/STPM going to UK undergrad, usually not; for international postgrad it's sometimes requested. Cost £140 standard / £210 urgent (5-day). Twinning programmes (e.g., Sunway-Lancaster, KDU-Northumbria) make UK degree completion easier.",
      },
      {
        label: "TB clearance from IOM Malaysia Kuala Lumpur",
        why: "All Malaysian students applying for UK Student visa for 6+ months need TB clearance from IOM-approved provider in Malaysia: IOM Kuala Lumpur, KPJ Hospital, Subang Jaya Medical Centre, or Sunway Medical Centre. Cost MYR 400-700, valid 6 months. Standard chest X-ray + sputum if indicated; rarely a barrier for Malaysian applicants but always check IOM panel list at gov.uk before booking elsewhere.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why UK over Malaysian, Australian, or US alternatives",
        prompt: "Malaysia has good universities (UM, USM, UPM, UKM, UTM, Sunway, Taylor's, Monash Malaysia) and many Malaysians study in Australia (Monash, Melbourne) or Singapore (NUS, NTU). Explain why your UK programme offers something unique — Russell Group prestige, specific specialism (LSE economics, UCL biomed, Oxbridge tutorial), professional accreditation (LPC for law, ACA/CIMA for accounting), industry placement.",
      },
      {
        heading: "Course-career link",
        prompt: "Map your Malaysian background to the UK course to your post-graduation career. Be specific: 'STPM Science → Imperial Mechanical Engineering → Petronas / Shell Malaysia / family engineering business.' For Bumiputera applicants on JPA / Khazanah / Yayasan funding, the bond structure (typically return to Malaysia, work in named sector for 5-10 years) is itself the strongest 'genuine student' evidence — attach the funding agreement.",
      },
      {
        heading: "Funding — Malaysian family / scholarship / PTPTN structure",
        prompt: "Quantify: tuition £X, living £12,006/£9,207, total Year 1 £Z. Then show coverage: family contribution MYR X (with bank statement, business registration if Bumi business), MARA/JPA/PTPTN/Khazanah/Sime Darby/Petronas/Maybank scholarship documentation. Most Malaysian students combine partial scholarship + parental top-up — show both clearly with 28-consecutive-day bank balance in the appropriate party's name.",
      },
      {
        heading: "Post-graduation plan",
        prompt: "Most Malaysian scholarship holders are bonded to return to Malaysia — state the bond structure explicitly. If self-funded, you can mention the UK Graduate Route (2-year post-study work right, no sponsor needed) but also document Malaysian ties: family home with grant title (Geran Mukim), parents' Malaysian employment, Malaysian property (KL, Penang, JB), Malaysian business succession.",
      },
    ],
    moneySavingTips: [
      "UK Student visa fee is £490 + IHS £776/year (student rate, reduced from £1,035 standard) — paid in MYR equivalent at the UKVI portal",
      "Don't pay 'visa agents' MYR 5,000-15,000 for what's a free UKVI online form + biometric appointment — VFS Global handles biometrics at MYR 300 (KL or Penang centres)",
      "PTPTN, MARA, JPA, Khazanah, Yayasan Khazanah, Yayasan Sime Darby, Petronas, Bank Negara, Maybank Scholar all fund Malaysian students for UK study — apply through respective portals well before UK application deadline",
      "Russell Group fee waivers for top SPM/STPM/A-Level scorers — Oxbridge, LSE, UCL, KCL offer Malaysian-eligible scholarships at admission stage (£3,000-10,000/year)",
      "Use Wise, Maybank2u, or CIMB Clicks for tuition transfers — lower FX fees than retail money changers; Bank Negara has no annual cap on educational outflow with admission proof",
      "Twinning programmes (Sunway-Lancaster, INTI-Hertfordshire, KDU-Northumbria, HELP-Liverpool) cut UK costs in half — complete first 2 years in Malaysia, last year in UK, save MYR 50,000-150,000",
      "Apply for the GREAT Scholarship Malaysia (UK Government + UK university partnership, ~£10,000) — separate from institutional scholarships; gov.uk lists eligible universities",
      "TB clearance: IOM KL is the gold standard but Sunway Medical and Subang Jaya Medical Centre are cheaper (MYR 400-500 vs MYR 700+) and equally accepted",
    ],
    lawyerTriggers: {
      diy: [
        "Standard UK Student visa with CAS from Russell Group / top-tier institution, clear funding, clean record",
        "Dependent visa applications (spouse + children if postgrad on 9+ month course)",
        "Graduate Route post-study work visa application after course completion",
        "Switching course or institution within UK during study (notify provider; new CAS may be needed)",
        "Renewal of Student visa for further study in UK (e.g., undergrad → postgrad transition)",
      ],
      getALawyer: [
        "Prior UK visa refusal (study, visit, work) — refusal grounds carry forward",
        "Past UK overstay or removal (rare for Malaysians, but discovery sinks applications)",
        "Malaysian criminal record (even minor — drugs is absolute disqualifier under Malaysian and UK frameworks)",
        "Funding from a sponsor outside Malaysia / immediate family",
        "Bumiputera JPA scholarship recipient considering breaking the bond (financial + legal implications in Malaysia, separate from UK visa)",
        "Past Five Eyes visa refusal (US, Canada, Australia, NZ flagged on UKVI database)",
        "Family member with prior UK asylum claim",
        "Switching from non-CAS-eligible course mid-stream (e.g., language school to degree)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // KOREAN → US — work
  // ════════════════════════════════════════════════════════════════════

  "KR:US:work": {
    whatCarriesWeight: [
      {
        label: "E-3 isn't available — H-1B lottery, L-1, O-1, or KORUS-FTA E-2 as primary routes",
        why: "Korea doesn't have the E-3 treaty visa (Australia exclusive) or the H-1B1 (Chile / Singapore). Korean applicants compete in the standard H-1B cap (March lottery, 85k slots — Korean win rate ~35-40%) or use L-1 intracompany transfer from Korean parent (Samsung, LG, Hyundai, SK, Kia, Naver, Kakao, Coupang) to US sub. KORUS Free Trade Agreement (2012) makes E-2 Treaty Investor accessible — substantial Korean investment in US business, no statutory minimum but $100k+ typical.",
      },
      {
        label: "DS-160 + Apostilled Korean degree + Korean Notary-Office translation",
        why: "DS-160 online application, then book interview at US Embassy Seoul (Sejong-daero, Jongno-gu — Gwanghwamun area). Korean degrees (학사, 석사, 박사) need Apostille from Korean MOFA (Ministry of Foreign Affairs) at Anguk-dong centre or local provincial Education Office. Cost KRW 1,000-2,000 per document, 2-3 working days. For US licensure (medicine, dentistry, accounting) WES, ECE, or AICE credential evaluation; Korean Saneobjo (industrial-engineering school) often needs course-by-course evaluation.",
      },
      {
        label: "Korean military service status (males 18-35) — Byeong-mu-cheong documentation",
        why: "All Korean males 18-35 must show resolved military obligation. Hyeong-yeok (completed active duty), Bo-chung-yeok (supplementary service), Yegun (reserves), Myeon-yeok (exempt with documented reason), or Yeon-gi (deferral with valid ground — study abroad, graduate school, athletic / arts achievement). Korean Military Manpower Administration (Byeong-mu-cheong) certificate must be attached to DS-160. Undisclosed military deferral risk: future Korean re-entry restrictions, not US visa, but officers ask.",
      },
      {
        label: "US-Korea Totalization Agreement (2001) + tax treaty",
        why: "Get a Certificate of Coverage (CoC) from Korean National Pension Service (NPS) — keeps you on Korean Gukmin-Yeongeum for up to 5 years on temporary US assignment, exempt from US Social Security/Medicare. Beyond 5 years switch to US system; Korean quarters count toward future Korean pension via Totalization. Tax treaty (1979, protocol 2006) prevents double-taxation; CSAT / professional certifications and Bachelor's degrees from KAIST, POSTECH, SNU, Yonsei, Korea University, Sungkyunkwan, Hanyang are well-recognised by US employers and consular officers.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why the US — sector and employer",
        prompt: "Korean applicants do well with specificity: tech (Silicon Valley FAANG, AI roles, semiconductor — Intel, TSMC Phoenix, Samsung Austin), finance (NYC banks, fintech), automotive (Detroit, Hyundai Alabama, Kia Georgia), entertainment (LA Korean wave / K-pop crossover), biotech (Boston, NJ, Bay Area). Name your US employer and explain why your Korean background (chaebol experience, KAIST/Seoul Nat'l/POSTECH degree, specific industry exposure) is uniquely valuable.",
      },
      {
        heading: "Your Korean employer / academic credentials",
        prompt: "List your Korean employer chronologically, role, salary in KRW with USD equivalent, supervisor name + contact. For L-1, document the 12+ month qualifying employment at the Korean parent with role progression — Samsung Electronics → Samsung Semiconductor US, LG Display → LG Innotek Detroit, Hyundai Motor → Hyundai America are common L-1 paths. KAIST / Seoul National / POSTECH / Yonsei / Korea University degrees are well-known to US Embassy Seoul; secondary universities benefit from explicit explanation of programme strength.",
      },
      {
        heading: "Long-term plan — dual citizenship considerations",
        prompt: "Korea doesn't permit dual nationality for adult naturalisation (with some exceptions for Korean-overseas adoptees and senior professionals over 65 under amended Nationality Act). State your plan: temporary US assignment (return after 3-5 years, retain Korean citizenship), long-term US PR (will need to choose between Korean and US citizenship at naturalisation stage, expect tough decision), or dual-track (Korean-American spouse providing US citizenship for children via jus soli while maintaining Korean parent's citizenship).",
      },
      {
        heading: "Family + dependants",
        prompt: "Spouse on L-2 has automatic work authorisation since 2023; H-4 spouse needs EAD (limited categories). E-2 spouse gets E-2D with full work rights. Korean spouse + Korean children under 21 are derivative. Mention Korean school year (March-February) when timing relocation — children in elementary / middle / high school in Korea benefit from arrival before September US school start. Korean military deferral for sons in Korea pre-conscription age (under 18) needs careful planning.",
      },
    ],
    moneySavingTips: [
      "DS-160 fee $185 (H-1B/L-1) or $315 (E-2); pay in KRW at Citibank Korea or Standard Chartered Korea — no reciprocity fee for Korean citizens",
      "Use WES iGPA Calculator (free online) before paying for full evaluation; many US employers accept Korean-certified transcripts at offer stage",
      "Open a US-domiciled bank account with Wise USD, Mercury Business, or KEB Hana NY Branch (Korean diaspora-friendly) before relocation",
      "Korean Embassy DC + Consulates (LA, NYC, SF, Chicago, Houston, Atlanta, Seattle, Boston, Honolulu) offer free notarisation and apostille for Korean citizens — saves $200+ vs US public notaries",
      "Don't break out of Korean National Pension Service when leaving — under Totalization Agreement you can reactivate later, and contribution years count toward future Gukmin-Yeongeum",
      "K-ETA reciprocity: now suspended through 2024 for US citizens; if you're a returning Korean with US PR, you may need to use I-551 for Korea re-entry",
      "Avoid Korean 'visa consultancy' charging KRW 3-5M for H-1B/L-1 — US-based immigration attorneys with Korean desks at Fragomen, Berry Appleman, Tahirih often offer flat-fee Korean services at $2,500-3,500",
      "Defer Korean Yeon-gum (retirement allowance) partial withdrawal until you confirm US tax residency — early withdrawal triggers Korean ordinary income tax",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B / L-1 with named US employer, clean record, clear Korean degree mapping",
        "DS-160 interview prep and document gathering at US Embassy Seoul",
        "Spouse / dependent derivative applications (H-4, L-2, E-2D)",
        "Renewal of existing H-1B / L-1 at US Embassy Seoul during home leave",
        "PERM-based EB-2 / EB-3 green card with cooperating US employer (Koreans are current — no per-country backlog)",
      ],
      getALawyer: [
        "E-2 Treaty Investor — substantiality, source-of-funds, and 'real and operating' enterprise tests are highly evidentiary; Korean chaebol-linked investments need careful structuring",
        "EB-1A / EB-1B / O-1 — extraordinary ability for Korean researchers / executives / K-pop / entertainment figures",
        "Concurrent Korean exit tax considerations when leaving with substantial holdings",
        "Prior US visa refusal or US overstay (even minor)",
        "Korean criminal record (DUI, drug, theft, anything beyond minor traffic) — disclosure to USCIS / DOS mandatory",
        "Unresolved Korean military obligation (males 18-35 with active deferral approaching expiry)",
        "Dual Korean-other passport (e.g., Korean-American adoptee with US citizenship, applying via the wrong passport)",
        "Same-sex spouse — Korea doesn't recognise same-sex marriage; US recognises it (H-4 / L-2 derivative is fine, but Korean documentation chain may not exist)",
      ],
    },
  },
};

export function routeAdviceFor(
  passportIso2: string,
  destinationIso2: string,
  purpose: Purpose,
): AdviceBlock | null {
  const key = `${passportIso2.toUpperCase()}:${destinationIso2.toUpperCase()}:${purpose}` as RouteKey;
  return ROUTE_ADVICE[key] ?? null;
}
