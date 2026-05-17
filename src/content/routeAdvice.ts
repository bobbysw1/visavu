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
        label: "Health and Care Worker visa — the Nigerian NHS pipeline",
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
        label: "Certificate of Sponsorship + Skilled Worker vs Health and Care Worker routing",
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

  // ════════════════════════════════════════════════════════════════════
  // CHINESE → UK — study
  // ════════════════════════════════════════════════════════════════════

  "CN:GB:study": {
    whatCarriesWeight: [
      {
        label: "Confirmation of Acceptance for Studies (CAS) from a licensed Student sponsor",
        why: "China sends the UK ~150,000 students annually — the largest single-origin cohort. Your UK institution issues CAS once you accept the offer and pay the deposit (typically £2,000-£5,000). Apply for the UK Student visa online (£490 outside UK + IHS £776/year student rate). The CAS is single-use, tied to a specific course start date; if you defer, the CAS must be re-issued. Russell Group universities (Oxford, Cambridge, Imperial, UCL, LSE, KCL, Edinburgh, Manchester, Bristol) and other top-100 institutions get smoother CAS processing.",
      },
      {
        label: "Financial capacity — £1,334/month London or £1,023/month outside London, held 28 consecutive days",
        why: "From January 2024 living costs raised to £1,334/month for London courses (£12,006 for 9 months) and £1,023/month outside London (£9,207 for 9 months). Must be held 28 consecutive days in YOUR name or your parents' (not company account, not friends, not extended family). Document via Chinese banks (ICBC 工商银行, CCB 建设银行, BOC 中国银行, ABC 农业银行, China Merchants 招商银行, Ping An 平安银行) with English statements stamped and signed. Account opening date must be at least 28 days before application date — visible at top of statement.",
      },
      {
        label: "ATAS clearance for STEM postgrad + 留服 (CSCSE) verification",
        why: "Academic Technology Approval Scheme (ATAS) is mandatory for postgraduate STEM subjects (engineering, physical sciences, advanced computing, materials science, biological sciences with dual-use potential). Apply at gov.uk/atas — free, 4-6 weeks turnaround. Without ATAS your visa is refused regardless of CAS. Chinese高中 / 本科 / 硕士 transcripts need notarisation through a Chinese notary public office (公证处), then if going through CSCSE (中国留学服务中心 中国教育部) for UK admission, plus translation by a sworn translator. WES-style evaluations aren't typically needed for direct UK admission but help with later professional recognition.",
      },
      {
        label: "IELTS UKVI Academic or accepted secure English test",
        why: "UK Student visa for degree-level courses requires Independent IELTS UKVI Academic (NOT regular IELTS — must be 'For UK Visas and Immigration'), or accepted alternatives like Pearson PTE Academic UKVI, Cambridge English Advanced/Proficiency. Below-degree courses (foundation, pre-sessional) require IELTS UKVI for UKVI SELT secure test. Test at British Council Beijing, Shanghai, Guangzhou, Chengdu, or IDP centres; book early — slots fill 6-8 weeks ahead. Minimum varies by course: UG typically 6.0 overall with no skill below 5.5, PG typically 6.5 with no skill below 6.0.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why UK over US, Australia, or Chinese top universities",
        prompt: "China has elite universities (Tsinghua 清华大学, Peking 北京大学, Fudan 复旦大学, Zhejiang 浙江大学, SJTU 上海交通大学, USTC 中国科学技术大学) and many Chinese students consider US (Ivy League, MIT, Stanford) or Hong Kong (HKU, HKUST, CUHK). Explain why your UK programme offers something unique — Russell Group prestige, 1-year UK Master's vs 2-year US Master's (faster, cheaper), specific specialism (LSE economics, UCL computer science, Edinburgh AI, Imperial finance, KCL biomed), Oxford/Cambridge tutorial system.",
      },
      {
        heading: "Course-career link — return to China sector",
        prompt: "Map your Chinese background to the UK course to your post-graduation career. Be specific: '中国本科 Software Engineering at Beihang → UCL MSc AI → return to Beijing/Shanghai tech sector at Baidu / Tencent / Alibaba / ByteDance / Meituan / JD / Xiaomi / Huawei / DiDi.' For finance: '复旦本科 Finance → LSE MSc Finance → return to Shanghai banking sector at CICC / ICBC / Citic Securities / China Securities.' If you intend to use the UK Graduate Route (2-year post-study work right), state it honestly — UK Student visa doesn't require non-immigrant intent like F-1 does.",
      },
      {
        heading: "Funding — Chinese family / scholarship structure",
        prompt: "Quantify: tuition £X (typically £24,000-£38,000 for international PG), living £12,006/£9,207, total Year 1 £Z. Then show coverage: family contribution RMB X (with bank statement, parents' Chinese income certificate, family business 营业执照 if business-owner, 税务登记 tax registration). CSC (China Scholarship Council 国家留学基金管理委员会) scholarship recipients should attach CSC offer letter — gold-standard funding evidence. Chevening UK Government Scholarship (~£25,000 + tuition + flights) is the prestige equivalent.",
      },
      {
        heading: "Post-graduation plan",
        prompt: "UK Graduate Route allows 2 years post-study work without sponsor. State your plan honestly: '12 months Graduate Route to gain UK work experience, then return to China sector X' or 'pursue Skilled Worker visa via UK employer for longer-term UK career, then evaluate ILR/citizenship pathway after 5 years.' UK Student visa officers don't require non-immigrant intent, so honesty about pathway is welcomed.",
      },
    ],
    moneySavingTips: [
      "UK Student visa fee is £490 + IHS £776/year (student rate) — paid in RMB equivalent via UKVI portal; total for 1-year Master's ≈ £1,266 + visa fee",
      "Don't pay '中介' (Chinese education agents) RMB 30,000-100,000 for visa applications you can do yourself — UKVI online form is free and straightforward; agents are only useful for university application stage, not visa stage",
      "CSC (China Scholarship Council) covers tuition + living + return flights + medical insurance + visa fee for selected programmes — apply via your home Chinese university's international office",
      "Chevening Scholarship: ~30 Chinese students/year, fully funded — apply via Chevening.org November-January cycle for following autumn intake",
      "Russell Group / Oxbridge fee waivers and bursaries — Oxford has named China scholarships (Oxford-Wuhan, Oxford-Tsinghua), Cambridge has Cambridge Trust + Gates Cambridge, LSE has 国奖 (国家奖学金) + LSE Master's Awards",
      "Use ICBC Easy Loan or BOC student remittance for tuition — lower FX fees than retail money changers; SAFE (State Administration of Foreign Exchange) educational outflow has no annual cap with admission proof + I-20-equivalent CAS",
      "Tuition deposit: pay via Flywire / TransferMate / Convera (formerly Western Union) — lower margins than direct SWIFT; UK universities partner with one of these",
      "Pre-sessional English course can reduce IELTS requirement — many UK universities accept lower IELTS (e.g. 5.5 instead of 6.5) if you complete their 4/8/12-week pre-sessional, saving the cost of multiple IELTS retakes",
    ],
    lawyerTriggers: {
      diy: [
        "Standard UK Student visa with CAS from Russell Group / top-tier institution, clear funding, clean record",
        "ATAS-cleared STEM postgrad application with research plan in approved area",
        "Dependent visa applications (spouse + children if 9+ month PG course)",
        "Graduate Route post-study work visa application after course completion",
        "Switching from Tier 4 Student (pre-2020 stamping) to current Student route during course transition",
      ],
      getALawyer: [
        "Prior UK visa refusal (study, visit, work) — refusal grounds carry forward",
        "ATAS refusal for STEM postgrad (research area flagged as dual-use / sensitive)",
        "Chinese criminal record (even minor — drugs is absolute disqualifier under Chinese and UK frameworks)",
        "Funding from a sponsor outside immediate family (Chinese friends, distant relatives, business sponsor)",
        "Past UK overstay (rare for Chinese students, but if any 14+ day overstay flagged on UKVI database, addresses)",
        "Family member with prior UK asylum claim from China (Falun Gong, Uyghur, Tibetan, Hong Kong pro-democracy)",
        "Switching from low-tier institution to top-tier mid-course (CAS validity questions)",
        "Hong Kong BNO passport holder applying for UK Student visa (use BNO Hong Kong route instead — different and far better visa pathway)",
        "Research area on UK Academic Technology Approval Scheme sensitive list (nuclear, advanced military tech, dual-use AI) — even ATAS-cleared applicants face slower processing",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // CHINESE → AUSTRALIA — study
  // ════════════════════════════════════════════════════════════════════

  "CN:AU:study": {
    whatCarriesWeight: [
      {
        label: "Subclass 500 Student Visa + Confirmation of Enrolment (CoE)",
        why: "China is Australia's largest international student source (~165,000 enrolments, ~28% of total). Your Australian institution issues CoE via PRISMS (Provider Registration and International Student Management System) once you accept the offer and pay initial fees. Subclass 500 fee raised to AUD$1,600 from 1 July 2024 — one of the world's most expensive student visa fees. Chinese applicants are 'Assessment Level 3' (the higher-scrutiny tier) — more documentation required than for Indonesian or Malaysian applicants at AL1.",
      },
      {
        label: "Genuine Student (GS) requirement — replaced GTE in March 2024",
        why: "From 23 March 2024, the Genuine Temporary Entrant (GTE) test was replaced by the Genuine Student (GS) test with explicit immigration-pathway questions. Your statement must address: previous study + work + travel history, course-career link, Australian study benefits vs Chinese options, post-graduation plan. Chinese applicants under GS face higher refusal rates if statement is generic or formulaic — Department of Home Affairs has flagged 'cookie-cutter' Chinese applications from agents.",
      },
      {
        label: "OSHC + financial capacity declaration AUD$29,710/year",
        why: "Overseas Student Health Cover is mandatory for full visa duration — Bupa, Medibank, Allianz, NIB, AHM. Single AUD$650-850/year; family AUD$3,500-5,000/year. Financial capacity from 10 May 2024: AUD$29,710/year living costs (raised from $24,505) + tuition + travel. Chinese RMB bank statements (ICBC, CCB, BOC, ABC, China Merchants, Ping An, CITIC) acceptable; family-business sponsors should attach 营业执照, 税务登记, 法人证明 (legal representative cert), and 2 years of tax filings.",
      },
      {
        label: "中国 academic certificates + 公证处 notarisation + sworn translation",
        why: "Chinese 高中 diploma (高中毕业证书) and university transcripts (本科毕业证书 + 学位证书 + 成绩单) need 公证处 (notary public office) notarisation — typically 公证 + 翻译公证 (notarised translation). For postgraduate applicants, CSCSE (中国留学服务中心) verification adds credibility. Avoid 'pop-up' agent translations — Australian Department of Home Affairs cross-checks Chinese degree numbers against 学信网 (CHSI — China Higher Education Student Information).",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why Australia, why this institution",
        prompt: "Many Chinese students choose Australia for Group of Eight (Go8) prestige (Melbourne, ANU, Sydney, UNSW, Monash, UQ, UWA, Adelaide) and the lifestyle. Explain specifically why your chosen Australian programme over a Chinese top university or alternative destination. Reference specific elements: faculty research area, course coursework, industry placement, regional advantage (Sydney finance, Melbourne biotech, Brisbane mining, Perth WA resources).",
      },
      {
        heading: "Course-career link — return to China sector OR pathway honesty",
        prompt: "Map your Chinese background to the Australian course to your career. Be specific: '复旦本科 Accounting → UNSW Master of Professional Accounting → return to Shanghai Big Four (Deloitte / PwC / EY / KPMG) or CICC / CITIC Securities.' If you intend to pursue Subclass 485 Temporary Graduate Visa post-study, state this honestly — GS test allows expression of pathway intent. Chinese applicants who pretend they have no Australian work intent get caught and refused.",
      },
      {
        heading: "Funding — Chinese family / business / CSC scholarship",
        prompt: "Quantify: tuition AUD$X, living AUD$29,710, total Year 1 AUD$Z. Then show coverage: family contribution RMB X (with bank statement, family business 营业执照, 税务登记, 法人证明). CSC (China Scholarship Council) recipients attach CSC offer letter. Australian Awards scholarships are not available to Chinese citizens (program is for developing countries — China graduated out).",
      },
      {
        heading: "Your immigration pathway — be honest",
        prompt: "Many Chinese students target Subclass 485 (2-5 years post-study work right) and some target PR via Subclass 189/190/491 or employer-sponsored Subclass 482. State this honestly — GS allows pathway expression. Document Chinese ties (family home with 房产证, family business succession, returning job offer) so the visa officer can weigh genuine intent. Avoid stating 'I will definitely return to China after graduation' if your behaviour suggests otherwise.",
      },
    ],
    moneySavingTips: [
      "Subclass 500 visa fee is AUD$1,600 (from 1 July 2024) — no discount; each dependent adds $440 (under 18) or $1,190 (over 18)",
      "Don't pay '澳洲中介' RMB 30,000-100,000 for visa applications — Department of Home Affairs ImmiAccount portal is free; agents are only useful for university application stage",
      "CSC (China Scholarship Council) covers tuition + living + return flights + insurance for selected programmes via Chinese university's international office",
      "Group of Eight scholarships and bursaries — Melbourne has Melbourne International Scholarship + Indo-Pacific Excellence Scholarship; ANU has ANU-China scholarship; Sydney has Sydney Scholars Awards; UNSW has International Scholarship; UQ has UQ Excellence; all open to high-performing Chinese students",
      "OSHC: don't bundle through agent — compare directly at privatehealth.gov.au; Bupa and Medibank are typically cheapest for single student cover at AUD$650-850/year",
      "PTE Academic test is AUD$355 in mainland China (Beijing, Shanghai, Guangzhou, Shenzhen, Chengdu) vs IELTS at AUD$385; Australian universities accept PTE equally",
      "Use ICBC Easy Loan, BOC, or CCB student remittance for tuition — lower FX fees than retail; SAFE educational outflow has no annual cap with CoE",
      "Tuition deposit: pay via Flywire / TransferMate / Convera — lower margins than direct SWIFT; Australian universities partner with one of these",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Subclass 500 with Go8 / top-50 university CoE, clean record, clear CSC / family funding",
        "Dependent visa applications (spouse + children) concurrent with main applicant",
        "Subclass 485 Temporary Graduate Visa after 2+ years study completion",
        "Course change or institution change within same visa (notify provider; usually no new visa needed)",
        "OSHC switch / renewal during visa term",
      ],
      getALawyer: [
        "Prior Australian visa refusal (visitor, study, or work) — refusal grounds carry forward to GS assessment",
        "Past Australian student visa cancellation (attendance below 80%, course non-progression)",
        "Chinese criminal record (even minor — narcotics is absolute disqualifier)",
        "学信网 (CHSI) verification dispute (degree certificate not registered or registered under different name)",
        "Funding from a sponsor outside immediate family (distant relatives, business sponsor, third-country sponsor)",
        "Past Five Eyes visa refusal (US, UK, Canada, NZ) flagged on Australian database",
        "Family member with prior Australian asylum claim from China (Falun Gong, Uyghur, Tibetan, Hong Kong pro-democracy)",
        "Switching from non-CRICOS course to CRICOS course mid-stream",
        "Bringing dependants when funding is borderline (AUD$29,710 + dependent additions tightens scrutiny)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // TURKISH → GERMANY — work
  // ════════════════════════════════════════════════════════════════════

  "TR:DE:work": {
    whatCarriesWeight: [
      {
        label: "EU Blue Card OR Skilled Worker Aufenthaltserlaubnis — Turkey-Germany has the deepest historical pathway",
        why: "Germany hosts ~3 million Turkish-origin people — Europe's largest single-origin diaspora. EU Blue Card threshold €48,300 (2024 general) or €43,759 in shortage occupations (IT, STEM, medicine, math, engineering). Skilled Worker Residence Permit (§18a/b AufenthG) accepts any salary meeting position market rate. Turkish applicants benefit from the 1963 Ankara Agreement (still partially effective for some categories — see below) and Germany's specific labour-market openness toward Turkish nurses and skilled trades.",
      },
      {
        label: "Ankara Agreement / Association Council Decision 1/80 — narrow but real legacy benefits",
        why: "Despite Turkey not being in the EU, the 1963 EEC-Turkey Ankara Agreement and Decision 1/80 (1980) of the Association Council provide narrow visa-fee, family-reunification, and self-employment benefits for Turkish citizens who established residence in Germany before 2009 (Bundesverwaltungsgericht jurisprudence). For new applicants post-2009 these benefits are limited but family-reunification rules are still more favourable for Turkish-origin already-resident sponsors. A German immigration lawyer (Anwalt für Migrationsrecht) familiar with Ankara cases can identify niche advantages.",
      },
      {
        label: "Anerkennung — recognition of Turkish qualification through Anabin / ZAB",
        why: "Germany requires formal recognition of your Turkish degree through the Anabin database. Most Turkish bachelor's degrees from accredited universities (Boğaziçi, METU, ITU, Hacettepe, Ankara, Bilkent, Sabancı, Koç, Yıldız) map as H+ (recognised). Less-known institutions need ZAB (Zentralstelle für ausländisches Bildungswesen) individual assessment at €200. For regulated professions (medicine, nursing, engineering, teaching, law) the Anerkennung is granted by the relevant Länder Anerkennungsstelle — Turkish nurses are in active recruitment programmes (Triple-Win project run jointly by Goethe-Institut, BA, and Turkish İŞKUR).",
      },
      {
        label: "German A1/A2 language requirement + visa application at German Consulates Istanbul / Ankara / Izmir",
        why: "Skilled Worker visa typically requires A2 German for non-shortage occupations; Blue Card requires no German at application (B1 needed for Niederlassungserlaubnis later). For nursing specifically, B1-B2 German is mandatory (DSH or TestDaF or Goethe certification) — the Anerkennung body and the federal labour office (BA) both check. Apply at German Consulate General Istanbul, Embassy Ankara, or Consulate General Izmir; expect 4-12 weeks processing for Blue Card, longer for general Skilled Worker.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why Germany — specific city, employer, industry cluster",
        prompt: "Germany has specific differentiators: Mittelstand engineering (Stuttgart automotive, Munich BMW + Siemens + Helsing, Hamburg logistics + Airbus, Frankfurt finance + pharma), Berlin startups, Wolfsburg VW, Rhein-Main pharma cluster (BioNTech, Boehringer, Merck KGaA), Stuttgart-Sindelfingen Mercedes-Benz, Munich Allianz. Tie your career trajectory to a specific region. Turkish applicants who can name target employer (Bosch — major Turkish-origin workforce, Daimler, BMW, Siemens) and explain why score higher.",
      },
      {
        heading: "Turkish work history + your qualifications mapping",
        prompt: "List Turkish employer chronologically, role, salary in TRY + EUR equivalent at official TCMB rate, supervisor name + contact. Turkish engineering schools (ITU, METU, Boğaziçi, Bilkent) and Turkish business schools (Koç, Sabancı) are well-known to German consulates. For nursing, document specific clinical experience: ICU, theatre, paediatric, oncology — German hospitals (Charité Berlin, Universitätsklinikum Heidelberg, MHH Hannover) actively recruit Turkish nurses through Triple-Win at €2,500-3,500 net starting salary.",
      },
      {
        heading: "Family + integration plan",
        prompt: "Many Turkish applicants have existing family in Germany (Berlin Kreuzberg, Köln, Hamburg, München, Stuttgart Turkish-origin neighbourhoods). State this honestly — it strengthens integration narrative and provides initial accommodation. German family reunification rules: spouse needs A1 German before visa OR within 3 months of arrival (some exceptions for skilled workers). Children up to 16 automatic; 16-18 with A1 German.",
      },
      {
        heading: "Long-term plan — Niederlassungserlaubnis + citizenship",
        prompt: "Germany's 2024 citizenship reform reduces naturalisation period from 8 to 5 years (3 with C1 + special integration), and allows dual citizenship (huge change — previously Turkish-origin had to renounce). State your plan: Niederlassungserlaubnis (settlement permit) after 21 months Blue Card with A1 German or 33 months without German; citizenship after 5 years. Turkey allows dual citizenship — many Turkish-Germans hold both passports legally now.",
      },
    ],
    moneySavingTips: [
      "Blue Card visa fee at German consulates is €75 — pay in TRY equivalent at official rate; under Ankara Agreement, some Turkish categories have fee reductions",
      "Use the Triple-Win programme for nurses (Goethe-Institut + BA + İŞKUR) — covers German language training (B1-B2) + recognition costs + relocation; net cost to you can be €0",
      "Goethe-Institut Istanbul / Ankara / Izmir offers A1-B2 German courses at €2,500-4,000 total — cheaper and better quality than private TÖMER alternatives",
      "Open N26, Commerzbank, or DKB account before flying (online with Turkish passport accepted) — needed for IBAN on employment contract",
      "Schufa-Auskunft (€29.95 online) before any rental application — landlords demand it",
      "Don't break Turkish SGK (sosyal güvenlik kurumu) early — Turkey-Germany Totalization Agreement (1964, updated 1984) means contribution years count toward future Turkish pension regardless of where you end up",
      "Health insurance: public TK costs the same regardless of provider for the same income — don't pay for 'health insurance brokers'; sign up direct at tk.de or via your employer's Personalabteilung",
      "Avoid private 'visa consultancy' charging TRY 25,000+ — Auslandsvertretungen process Blue Card and Skilled Worker applications directly; only complex cases need licensed Rechtsanwalt",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Blue Card with German employment contract above salary threshold",
        "Skilled Worker Residence Permit with H+ rated Turkish bachelor's and clean record",
        "Triple-Win programme nursing applications (organisation handles paperwork)",
        "Family reunification (Familiennachzug) when primary applicant already approved",
        "Niederlassungserlaubnis after qualifying period with A1/B1 German",
        "Citizenship application after 5 years under 2024 reform with C1 German for fast-track",
      ],
      getALawyer: [
        "Ankara Agreement / Decision 1/80 legacy benefit claims (specialist area; only specific Anwälte für Migrationsrecht handle these)",
        "Regulated profession recognition (medicine, dentistry, pharmacy, teaching, lawyer) — Anerkennung process is Länder-specific",
        "Turkish military service status (males pre-30 with unresolved obligation) affecting visa issuance",
        "Past German visa refusal, Schengen visa overstay, or deportation",
        "Turkish criminal record (DUI, drug, theft, anything beyond minor traffic) — disclosure to German authorities mandatory",
        "Switching from Blue Card to self-employment / Freiberufler (Ankara Agreement legacy can help here for some)",
        "Dual Turkish-other passport (Turkish-German child applying via Turkish passport for visa to Germany — wrong process)",
        "Asylum-related family member (Kurdish, Alevi, Gülen movement connection) — discretionary handling required",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // PAKISTANI → US — study
  // ════════════════════════════════════════════════════════════════════

  "PK:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 paid",
        why: "Pakistan sends ~10,000 students to the US annually. Your US institution issues Form I-20 (F-1) or DS-2019 (J-1) once admitted and proof-of-funds verified. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) before booking DS-160. Pakistani applicants book at US Consulate General Karachi (Mai Kolachi Road), Lahore (Shimla Pahari), Peshawar (Saddar), or US Embassy Islamabad (Diplomatic Enclave) — district-of-residence based. Islamabad and Karachi handle highest F-1 volume.",
      },
      {
        label: "Heightened security clearance / Administrative Processing (221(g))",
        why: "Pakistani applicants in STEM, engineering, and certain dual-use fields face mandatory administrative processing under 221(g) — a 'soft refusal' pending SAO (Security Advisory Opinion) clearance. SAO can take 60 days to 12+ months. Allow buffer time — don't book inflexible flights or housing. Common SAO triggers: nuclear-related research, advanced engineering (aerospace, materials), AI/ML at certain US schools, biotech with dual-use, certain Pakistani universities flagged in DOS sensitive list. The visa is usually approved post-clearance.",
      },
      {
        label: "Source-of-funds + bank statement seasoning + Pakistani Police Character Certificate",
        why: "Pakistan has elevated F-1 refusal rates due to funding concerns. Show 1st-year tuition + living costs ($40-80k). Document Pakistani bank statements (Habib Bank, MCB, UBL, Allied, Bank Alfalah, Standard Chartered Pakistan, Meezan, Faysal) with USD-equivalent at SBP interbank rate. Avoid lump-sum deposits within 90 days of interview — these are the #1 refusal trigger. Pakistani Police Character Certificate from your Tehsil-level Police Station (Rs. 200-500, 14-30 days) — required for SEVP-school admission and for some visa interviews.",
      },
      {
        label: "Strong 214(b) ties to Pakistan — family, property, return plan",
        why: "F-1 is non-immigrant. Strong Pakistani ties: family home with Fard / Intiqal (land record) in parents' name, parents' employment (especially military, civil service, banking, professional services, family business), Pakistani property (Karachi DHA, Lahore Bahria/DHA, Islamabad sectors), expected return job, family business succession. Officers ask 'what will you do after graduation' — answer Pakistan-specific: 'return to Pakistani banking sector / family textile business / NUST or LUMS teaching position' beats 'I'll see what opportunities arise.'",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Pakistani or UK alternatives",
        prompt: "Pakistan has strong universities (LUMS, NUST, IBA Karachi, AKU, FAST, NED, GIKI, COMSATS, UET, QAU) and many Pakistanis study in UK (LSE, UCL, Manchester, Edinburgh) or Australia (Monash, Melbourne) or Canada (UofT, McGill, UBC). Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS, Wall Street for finance, Texas for energy, Boston for biotech), specialised programme. Reference concrete elements: faculty publication, course offering, lab.",
      },
      {
        heading: "Funding — Pakistani family / business / sponsor structure",
        prompt: "Quantify: tuition $X, living $Y, total Year 1 $Z. Then show coverage: family contribution PKR X (with bank statement, NTN tax registration, business income tax returns for last 3 years if business-owner, parent's salary slips if employed). Document AT LEAST 12 months of consistent income/balance — F-1 officers know which Pakistani sectors throw off real cashflow vs paper-only. Avoid lump-sum deposits in the 90 days before interview.",
      },
      {
        heading: "Post-graduation plan — your return to Pakistan",
        prompt: "F-1 visas explicitly require intent to return. State which Pakistani sector you'll return to: Pakistani banks (HBL, MCB, UBL, Bank Alfalah, Meezan, Bank of Khyber), oil & gas (OGDCL, PSO, Mari Petroleum), Pakistani tech (Systems Limited, NetSol, 10Pearls, Khaadi, Daraz), telecoms (Jazz, Telenor, Zong, PTCL, Ufone), professional services (KPMG Taseer Hadi, AF Ferguson, EY Ford Rhodes), academia (LUMS, NUST, AKU faculty), or family business succession. If you want OPT (Optional Practical Training), briefly mention but emphasise return.",
      },
      {
        heading: "Family ties remaining in Pakistan",
        prompt: "List parents (occupation, location — Karachi / Lahore / Islamabad area level), siblings, partner. Mention Pakistani property — family home with Fard / Intiqal in parents' name with you as inheritor, agricultural land in your village/district, Pakistani bank accounts you'll maintain (with Pakistani mobile number for SMS-OTP). Avoid mentioning extensive US-based family — Pakistani-American extended family is a 214(b) concern.",
      },
    ],
    moneySavingTips: [
      "Apply at the US Consulate covering your area — Karachi for Sindh + parts of Balochistan, Lahore for Punjab, Peshawar for KP + AJK, Islamabad for Islamabad + parts of Punjab; you cannot freely choose",
      "F-1 visa fee is $185; pay via Standard Chartered Pakistan or HBL counter with MRV barcode — both accept USD cash or PKR at SBP rate",
      "Don't pay 'visa consultancy' agencies PKR 100,000-500,000 — DS-160 is free online, interview is the bottleneck, agents don't influence consular decisions",
      "Pakistani applicants are eligible for Fulbright Pakistan (~$30,000 + tuition for grad students — USEFP runs application cycle February-May), HEC (Higher Education Commission) overseas scholarships, Aga Khan Foundation International Scholarship Programme, Stamford International Scholarship, Citi Foundation scholarships",
      "Many US universities have Pakistani-origin scholarship endowments — Stanford has Pakistani Heritage Award, MIT has need-based for Pakistanis, Cornell, Columbia, UPenn all have named Pakistani-heritage funds",
      "HBL, MCB, Bank Alfalah student remittance accounts for tuition transfers — lower FX fees than retail; SBP educational outflow has no annual cap with admission proof",
      "Police Character Certificate: Rs. 200-500 at your local Tehsil HQ — don't pay Rs. 5,000+ to dalals (touts) outside police stations",
      "If your STEM application triggers 221(g) administrative processing, don't pay 'expediters' — they have no influence; just wait, the SAO clearance comes when it comes",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding, strong programme fit at non-sensitive school / field",
        "Standard Fulbright, USEFP, or HEC overseas scholarship J-1 / F-1 application",
        "Renewal of existing F-1 (re-issuance in Pakistan during winter / summer breaks)",
        "OPT or STEM OPT application during or after the programme",
      ],
      getALawyer: [
        "Prior US visa refusal (any category — B1/B2 tourist refusal is a major red flag for F-1)",
        "Pakistani criminal record (even minor — anti-terrorism Act / Hudood / drug cases)",
        "STEM field with potential SAO sensitivity (nuclear, aerospace, advanced AI, advanced materials, biotech dual-use)",
        "Family member in Pakistani military / ISI / nuclear establishment (additional security review)",
        "Family member with prior US asylum claim from Pakistan (Ahmadi, Shia, Christian, Hindu minority protection claims)",
        "Past visa overstay in any country (Gulf states common for Pakistanis — addresses)",
        "Sectarian or political affiliation history (PTI / PML-N / PPP / TLP / JI active membership)",
        "Transfer from UK/Canadian/Australian student visa to US F-1 — country-to-country SEVIS transfer needs careful handling",
        "Funding from a sponsor outside Pakistan / immediate family (Gulf relatives, business sponsor)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // JAPANESE → US — work
  // ════════════════════════════════════════════════════════════════════

  "JP:US:work": {
    whatCarriesWeight: [
      {
        label: "E-1 / E-2 Treaty Trader / Investor via the Japan-US 1953 Treaty",
        why: "Japan is the world's largest single source of E-1 Treaty Trader visas — the 1953 Treaty of Friendship, Commerce and Navigation makes E-1 (substantial trade between US and Japan) and E-2 (substantial investment in a US enterprise) flagship visa categories. Japanese trading houses (Mitsubishi 三菱商事, Mitsui 三井物産, Sumitomo 住友商事, Itochu 伊藤忠商事, Marubeni 丸紅, Toyota Tsusho 豊田通商) operate at massive scale under E-1; manufacturing FDI (Toyota, Honda, Subaru, Nissan, Hitachi, Komatsu) under E-2. No PERM, renewable indefinitely while substantial trade/investment continues.",
      },
      {
        label: "H-1B Specialty Occupation OR L-1 intracompany via Japanese parent",
        why: "H-1B is cap-subject (March lottery, 85k slots — Japanese win rate ~30-35%). L-1A (executive/manager) and L-1B (specialised knowledge) bypass the lottery if you've worked 1+ year at a Japanese parent company with a US subsidiary. Common L-1 paths: Sony Japan → Sony Pictures LA / Sony Electronics NYC, Toyota Japan → Toyota North America Texas, Nintendo Japan → Nintendo of America Seattle, Honda Japan → Honda North America Ohio. DS-160 interview at US Embassy Tokyo (Akasaka 1-10-5, Minato-ku) or US Consulate Osaka-Kobe.",
      },
      {
        label: "Apostilled Japanese 卒業証明書 + ECE/WES credential evaluation",
        why: "Japanese university 卒業証明書 (graduation certificate) and 成績証明書 (transcript) need Apostille via Japanese Ministry of Foreign Affairs (外務省) at Kasumigaseki Tokyo or Honmachi Osaka. Cost JPY 400 per Apostille, same-day for in-person submission, 5-7 days by mail. For US licensure (medicine, dentistry, accounting, engineering PE) WES, ECE, or AICE foreign credential evaluation. Japanese 学士 (Bachelor's) maps to US Bachelor's; 修士 (Master's) maps to US Master's; 博士 (Doctorate) maps to US PhD.",
      },
      {
        label: "US-Japan Totalization Agreement (2005) + tax treaty considerations",
        why: "Get a Certificate of Coverage (CoC) from Japan Pension Service (日本年金機構) — keeps you on Japanese Kokumin-Nenkin / Kosei-Nenkin for up to 5 years on temporary US assignment, exempt from US Social Security/Medicare. Beyond 5 years switch to US system; Japanese quarters count toward future Japanese pension via Totalization. Tax treaty (2003, protocol 2013) prevents double-taxation on salary; file Form 8833 to claim treaty benefits. Japanese 年金 partial withdrawal on permanent departure: 一時金 lump-sum (up to 5 years' contributions) available before US arrival.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why the US — specific industry / employer",
        prompt: "Japanese applicants benefit from specificity. Tech (Silicon Valley, NYC, Seattle, Austin), automotive (Detroit, Tennessee, Texas, Ohio for Honda/Toyota/Subaru R&D), entertainment (LA — Sony Pictures, anime distribution), gaming (Seattle Nintendo, San Mateo Sony PlayStation, Tokyo-based publishers' US offices), trading (Houston for energy, Chicago for commodities, NYC for finance), pharma (NJ, Boston, Bay Area for Takeda, Astellas, Daiichi-Sankyo US ops). Name your target US employer.",
      },
      {
        heading: "Your Japanese employer / academic credentials",
        prompt: "List your Japanese employer (full Japanese name 株式会社X + English translation), role 役職, salary in JPY with USD equivalent, supervisor name. For L-1, document the 12+ month qualifying employment at the Japanese parent with role progression — Sony → Sony Pictures, Toyota Motor Corp → TMNA, Honda Motor Co → Honda America, Nintendo Co. Ltd. → Nintendo of America are well-trodden L-1 paths. Japanese university (東京大学, 京都大学, 慶應義塾, 早稲田, 一橋, 東京工業, 大阪大学, 名古屋大学) brand recognition is high at US Embassy Tokyo.",
      },
      {
        heading: "Long-term plan — dual residency considerations",
        prompt: "Japan permits dual nationality only until age 22 (must choose by Article 14 Nationality Act, though enforcement is lax in practice). State your plan: temporary US assignment (return to Japan after 3-5 years, retain Japanese citizenship and Japanese pension), long-term US PR (will need to navigate choice between Japanese and US citizenship at naturalisation), or dual-track (Japanese spouse providing US citizenship for children via jus soli while maintaining Japanese parent's citizenship).",
      },
      {
        heading: "Family + dependants + Japanese school timing",
        prompt: "Spouse on L-2 has automatic work authorisation since 2023; H-4 spouse needs EAD (limited categories). E-1/E-2 spouse gets E-1D/E-2D with full work rights. Japanese spouse + Japanese children under 21 are derivative. Mention Japanese school year (April-March) when timing relocation — children in 小学校 / 中学校 / 高校 in Japan benefit from arrival before US August/September school start.",
      },
    ],
    moneySavingTips: [
      "DS-160 fee $185 (H-1B/L-1) or $315 (E-1/E-2); pay in JPY at Shinsei Bank or SMBC Trust Bank counters — no reciprocity fee for Japanese citizens",
      "Use WES iGPA Calculator (free online) before paying for full evaluation; many US employers accept Japanese-certified transcripts at offer stage",
      "Apostille at Japan MOFA Tokyo (Kasumigaseki) or Osaka (Honmachi) is JPY 400/document — same-day in-person; don't use 'expediter' services charging JPY 10,000+",
      "Open a US-domiciled bank account with Wise USD, Mercury Business, or MUFG Union Bank (rebranded to U.S. Bank in 2022 — Japanese diaspora-friendly branch network) before relocation",
      "Japanese Embassy DC + Consulates (LA, NYC, SF, Chicago, Houston, Atlanta, Seattle, Boston, Honolulu, Detroit, Anchorage, Hagåtña, Portland) offer free notarisation for Japanese citizens",
      "Don't break out of Japanese Kosei-Nenkin (Employees' Pension) when leaving — under Totalization Agreement you can claim 一時金 (lump-sum withdrawal) for up to 5 years' contributions, and beyond that years count toward future Kosei-Nenkin via Totalization",
      "Avoid Japanese 'visa consultancy' charging JPY 500,000-1M for H-1B/L-1 — US-based immigration attorneys at major firms (Fragomen, Berry Appleman, Erickson Immigration) have flat-fee Japanese desks at $2,500-3,500",
      "Japanese 退職金 (severance / retirement allowance) timing: receiving before US tax residency = JPY-only taxation; after = US worldwide income inclusion. Time carefully with your accountant",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B / L-1 with named US employer, clean record, clear Japanese degree mapping",
        "DS-160 interview prep and document gathering at US Embassy Tokyo",
        "Spouse / dependent derivative applications (H-4, L-2, E-1D, E-2D)",
        "Renewal of existing H-1B / L-1 at US Embassy Tokyo or Consulate Osaka-Kobe during home leave",
        "PERM-based EB-2 / EB-3 green card with cooperating US employer (Japanese applicants are current — no per-country backlog)",
      ],
      getALawyer: [
        "E-1 Treaty Trader — substantiality of trade volume (typically 50%+ of total trade must be between US-Japan) needs evidentiary support",
        "E-2 Treaty Investor — substantiality, source-of-funds, 'real and operating' enterprise tests for Japanese FDI; trading house structures need careful drafting",
        "EB-1A / EB-1B / O-1 — extraordinary ability petitions for Japanese researchers / executives / artists / athletes",
        "Concurrent Japanese exit tax (出国税 / 国外転出時課税制度) considerations for substantial holdings >JPY 100M",
        "Prior US visa refusal or US overstay (rare for Japanese, but flagged if any)",
        "Japanese criminal record (DUI, drugs, theft, anything beyond minor traffic) — disclosure to USCIS / DOS mandatory",
        "Same-sex spouse — Japan doesn't recognise same-sex marriage federally (some prefectures do); US recognises it (H-4 / L-2 / E-2D derivative is fine, but Japanese documentation chain may not exist)",
        "Dual Japanese-other passport (Japanese-American with US citizenship applying via Japanese passport — wrong process)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → AUSTRALIA — study
  // ════════════════════════════════════════════════════════════════════

  "IN:AU:study": {
    whatCarriesWeight: [
      {
        label: "Subclass 500 Student Visa + Confirmation of Enrolment (CoE)",
        why: "India is Australia's 2nd-largest international student source (~125,000 enrolments after the 2024 surge). Your Australian institution issues CoE via PRISMS once you accept the offer and pay initial fees. Subclass 500 fee raised to AUD$1,600 from 1 July 2024. Indian applicants are 'Assessment Level 2' under SSVF — middle scrutiny tier, more documentation than Indonesians/Malaysians but less than Pakistanis or Nepalese. Verified-trustworthy institutions (Group of Eight + most large public universities) get smoother CoE processing.",
      },
      {
        label: "Genuine Student (GS) requirement — replaced GTE in March 2024, plus tightened source-of-funds",
        why: "From 23 March 2024 GTE was replaced by Genuine Student test. Indian applications face heightened scrutiny — Department of Home Affairs has flagged 'cookie-cutter' applications from Punjab/Haryana/Telangana agents. In 2024 Australia introduced 'Migration Strategy' caps on dodgy private VET colleges; choose CRICOS-listed institutions with strong reputations. Show 12+ months of consistent family income/assets, not lump-sum 'demonstration deposits' 30 days before application.",
      },
      {
        label: "OSHC + financial capacity AUD$29,710/year + IELTS 6.0+ / PTE 50+",
        why: "Overseas Student Health Cover from Bupa, Medibank, Allianz, NIB, AHM (single ~AUD$700-850/year, family AUD$3,500-5,000/year). Financial capacity from 10 May 2024: AUD$29,710/year living costs + tuition + AUD$2,500 travel. English: IELTS Academic 6.0+ (no band below 5.5) for most UG, 6.5+ for PG; PTE Academic 50+ / 58+ accepted; TOEFL iBT 60+ / 79+ accepted. Universities often have 'English Language Bridge' pathway for marginal scorers.",
      },
      {
        label: "Indian academic documents — apostilled via MEA + WES/credential evaluation",
        why: "Indian 10+2 (CBSE / ICSE / state board), Bachelor's (3-year or 4-year), and Master's transcripts need apostille via MEA (Ministry of External Affairs India) e-Sanad portal — India is a Hague Convention signatory since 2005. Cost INR 50-200 per document, 3-7 working days. Some 3-year Indian Bachelor's may not meet Australian PG entry requirements — universities often require 'bridging' or accept Indian 4-year tech / honours / professional degrees directly. WES is requested for some PG programmes (separate from the visa application).",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why Australia, why this institution",
        prompt: "Many Indian students choose Australia for Group of Eight prestige (Melbourne, ANU, Sydney, UNSW, Monash, UQ, UWA, Adelaide) and the lifestyle, plus the Subclass 485 Temporary Graduate Visa pathway. Explain specifically why your chosen programme over Indian top universities (IIT, IIM, NIT, IISc, IIIT, BITS, NLU) or alternative destinations (US, UK, Canada). Reference specific elements: faculty research area, course coursework, industry placement, regional advantage.",
      },
      {
        heading: "Course-career link — pathway honesty under GS test",
        prompt: "Map your Indian background to the Australian course to your career. Be specific: 'IIT Madras B.Tech Computer Science → UNSW Master of Information Technology → return to Bangalore/Hyderabad tech sector at Microsoft / Google / Amazon / Adobe / Flipkart, OR pursue Subclass 485 for 2-3 years Australian work first.' GS test allows expression of pathway intent — don't pretend you have no Australian work intent if your CV and family conversation suggest otherwise. Indian agents have trained applicants to lie; visa officers cross-check.",
      },
      {
        heading: "Funding — Indian family / education loan / scholarship",
        prompt: "Quantify: tuition AUD$X, living AUD$29,710, total Year 1 AUD$Z. Then show coverage: family contribution INR X (with bank statement, parents' Income Tax Return for last 3 years, family business GST filings if business-owner), education loan from HDFC Credila / Avanse / SBI / Axis Bank / Punjab National Bank (Indian banks accept Australian CoE for INR 40 lakh-1.5 crore education loans at 9-12% interest). Australia Awards scholarships are not available to Indian citizens; Charles Sturt, Deakin, Monash, UTS have institutional scholarships.",
      },
      {
        heading: "Family ties + future plan",
        prompt: "List parents (occupation, location — Mumbai / Delhi / Bangalore / Hyderabad / Chennai / Kolkata / Ahmedabad metro level), siblings, partner. Mention Indian property — family home with Khata / Patta / Bhulekh / 7/12 utara in parents' name, agricultural land, Indian bank accounts, expected return-job opportunity (named Indian employer or family business). For male applicants, post-graduation plan should bridge Australian work intent (485 visa) with eventual Indian return OR PR pathway — don't oversell either direction.",
      },
    ],
    moneySavingTips: [
      "Subclass 500 visa fee is AUD$1,600 — no discount; each dependent adds AUD$440 (under 18) or AUD$1,190 (over 18)",
      "Don't pay 'IDP' or 'Y-Axis' or 'Aussizz' agents INR 2-5 lakh for what's a free DHA ImmiAccount online application — these agencies overcharge for university placement (often free from universities directly)",
      "Group of Eight scholarships — Melbourne International Scholarship, UNSW International Scholarship, USyd India Excellence, UQ India Excellence, ANU India, Monash Indian Excellence; all open to high-performing Indians (15-50% tuition waivers)",
      "HDFC Credila, Avanse, ICICI, SBI Global Ed Vantage offer education loans at 9-12% with Australian CoE as collateral; tax benefits under Section 80E for the interest paid",
      "OSHC: compare directly at privatehealth.gov.au — Bupa and Medibank single student covers at AUD$650-850/year; don't bundle through agent",
      "PTE Academic test in India is INR 17,000 (Pearson Vue centres in Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata) — slightly cheaper than IELTS (INR 17,000-17,800)",
      "Use HDFC Forex, ICICI Forex, or Axis Forex Online for tuition transfers — Forex cards lock in rate; RBI educational outflow under LRS allows USD 250,000/year with admission proof",
      "Apostille via MEA e-Sanad portal directly (INR 50-200/document) — don't use 'apostille agencies' charging INR 1,500-3,000/document",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Subclass 500 with Go8 / top-50 university CoE, clean record, clear funding via education loan or family",
        "Dependent visa applications (spouse + children) concurrent with main applicant",
        "Subclass 485 Temporary Graduate Visa application after 2+ years study completion",
        "Course change or institution change within same visa (notify provider)",
        "OSHC switch / renewal during visa term",
      ],
      getALawyer: [
        "Prior Australian visa refusal (visitor, study, work) — refusal grounds carry forward to GS assessment",
        "Past Australian student visa cancellation (attendance below 80%, course non-progression)",
        "Indian criminal record (even minor — narcotics under NDPS Act is absolute disqualifier)",
        "Funding from a sponsor outside immediate family (distant relatives, business sponsor, third-country sponsor — common Indian application red flag)",
        "Application from Punjab / Haryana / Andhra-Telangana with private VET / private college CoE (DHA has flagged this combination)",
        "Past Five Eyes visa refusal (US, UK, Canada, NZ) flagged on Australian database",
        "Family member with prior Australian asylum claim from India",
        "Switching from non-CRICOS course to CRICOS course mid-stream",
        "Application after Subclass 482 sponsored employer's licence revocation (rare but increasingly common in care sector)",
        "Pre-existing partner / fiancée in Australia (combined Subclass 500 + 309 considerations)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // UKRAINIAN → POLAND — work
  // ════════════════════════════════════════════════════════════════════

  "UA:PL:work": {
    whatCarriesWeight: [
      {
        label: "PESEL UKR Temporary Protection — the dominant Ukrainian pathway since March 2022",
        why: "Following Russia's February 2022 invasion, Poland implemented EU Council Directive 2001/55/EC granting Ukrainians 'Temporary Protection' (Ochrona czasowa). Initially called UKR status, formalised via PESEL UKR registration at any Polish municipal office (urząd gminy). Status currently extended until 4 March 2026 (EU-wide decision). Grants: full work rights without separate work permit, access to public healthcare (NFZ), education, social benefits including 800+ program (child benefit), and free residence card issuance. Apply at any urząd gminy with Ukrainian passport — typically same-day PESEL number issued.",
      },
      {
        label: "Karta Pobytu (Residence Card) for longer-term Ukrainian residents",
        why: "Beyond Temporary Protection, Ukrainians can apply for Karta Pobytu (residence card) on standard grounds: Tymczasowy Karta Pobytu (Temporary Residence — 3 years renewable) tied to work / family / study / Pole's Card (Karta Polaka), or Stała Karta Pobytu (Permanent Residence) after 5+ years legal residence including UKR period (case law evolving — confirm with Polish lawyer). The Tymczasowy Karta is typically tied to a Zezwolenie na pracę (work permit type A) granted on employer application via voivode (wojewoda).",
      },
      {
        label: "Karta Polaka — fastest route to settlement for Polish-heritage Ukrainians",
        why: "Western Ukrainians (Lviv, Ivano-Frankivsk, Ternopil oblasts, Galician roots) often qualify for Karta Polaka under the 2007 Karta Polaka Act — requires documented Polish ancestry (grandparent or great-grandparent), basic Polish language, and connection to Polish culture. Karta Polaka holder gets: free long-term visa, free residence card, full work rights, free education, partial social benefits, and 6-month fast-track to Polish citizenship after Karta Pobytu Stałego (which is itself granted to Karta Polaka holders after 1 year of residence). Apply at Polish consulate Lviv, Lutsk, Kyiv, Kharkiv, Odessa (when consulates are operational).",
      },
      {
        label: "ZUS social-security registration + Ukrainian-Polish credential mapping",
        why: "Once employed, you're registered with ZUS (Zakład Ubezpieczeń Społecznych) social insurance — contributions 9.76% pension + 1.5% invalid pension + various smaller funds (employer pays ~20% additional). NFZ health insurance follows automatically. Ukrainian education credentials: Bachelor's (бакалавр), Specialist (спеціаліст), Master's (магістр) recognised under the 1996 Lisbon Recognition Convention which both countries signed. For regulated professions (medicine — лікар, nursing — медсестра, engineering — інженер), nostrification (nostrifikacja) at Polish ministry — 6-12 months process. Ukrainian medical doctors face Polish Medical Chamber (Naczelna Izba Lekarska) verification + Polish language requirement.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Status choice — Temporary Protection (UKR) vs Karta Pobytu vs Karta Polaka",
        prompt: "Most Ukrainians use UKR Temporary Protection (fastest, easiest, free, until March 2026). Karta Polaka is best if you have Polish ancestry. Karta Pobytu Tymczasowy is best if you have stable long-term employment and want to build toward permanent residence and eventual citizenship. State which route, why, and what evidence supports it (Ukrainian passport for UKR; ancestry documents + Polish language for Karta Polaka; work contract for Karta Pobytu).",
      },
      {
        heading: "Polish work plan — employer / sector / city",
        prompt: "Ukrainian work permits are tied to specific employer and role. Document: Polish employer name + NIP/REGON, role, salary in PLN (Polish living wage 2024: ~PLN 4,300 gross/month for full-time), city (Warsaw / Kraków / Wrocław / Gdańsk / Poznań / Lublin / Rzeszów — last three have largest Ukrainian diaspora). Sectors with strong Ukrainian recruitment: construction, logistics, manufacturing, agriculture, hospitality, IT (in Warsaw / Kraków / Wrocław tech hubs), healthcare (nursing assistants, after Polish nostrification for full nurse role).",
      },
      {
        heading: "Family situation — children's school, ZUS, NFZ",
        prompt: "Many Ukrainian families remain in Poland under UKR status. State: spouse status (also UKR, or working with separate Karta Pobytu), children's age and school enrolment (Polish state schools accept UKR-status children free with ZUS-issued PESEL), elderly dependants if any (parents over 60 are eligible for UKR with full healthcare). For children, mention Polish language acquisition progress and any Ukrainian Saturday school participation.",
      },
      {
        heading: "Long-term plan — return to Ukraine, Polish citizenship, or onward EU",
        prompt: "Polish citizenship after 3 years Karta Pobytu Stałego (which is itself after 5 years tymczasowy) — total ~8 years residence, with B1 Polish language requirement. Karta Polaka holders fast-track to citizenship in ~2 years after Karta Pobytu Stałego. Some Ukrainians intend to return to Ukraine after war ends; others plan onward EU mobility via Polish citizenship. State your honest plan — Polish authorities don't penalise return intent under Temporary Protection.",
      },
    ],
    moneySavingTips: [
      "UKR Temporary Protection registration is FREE at any urząd gminy — bring only your Ukrainian passport; same-day PESEL UKR number, free residence document",
      "Free Polish language courses for UKR-status Ukrainians at municipal language schools (urząd gminy) and at NGOs like Caritas Polska, Polski Czerwony Krzyż, Fundacja Ocalenie, Fundacja Polskie Forum Migracyjne",
      "800+ program (child benefit) is PLN 800/month per child under 18 — apply at ZUS office with Ukrainian birth certificate translated + PESEL UKR",
      "Free public healthcare (NFZ) for UKR-status — including dental for children (very rare in EU); register with any GP (lekarz rodzinny) using your PESEL UKR",
      "Don't pay 'visa agents' PLN 1,500-3,000 for UKR Temporary Protection — it's free at urząd gminy and the registration is straightforward; only Karta Polaka or complex Karta Pobytu cases may benefit from licensed adwokat help",
      "Karta Polaka application is free at Polish consulates in Ukraine (when operational) — don't pay private 'ancestry research' agencies UAH 30,000-100,000 unless your family records are genuinely lost",
      "NFZ-funded medical translation services at many hospitals — Ukrainian-Polish translators available free of charge",
      "ZUS social insurance contributions match other Polish workers (no Ukrainian-specific deductions) — full pension/healthcare/family benefit entitlement applies",
    ],
    lawyerTriggers: {
      diy: [
        "PESEL UKR Temporary Protection registration at any urząd gminy",
        "Standard work-permit-backed Karta Pobytu Tymczasowy via cooperating Polish employer",
        "Karta Polaka application at Polish consulate when ancestry documents are clear (great-grandparent or grandparent Polish birth certificate + Polish-language basics)",
        "Family member family-reunification within Poland (spouse + children of UKR-status primary)",
        "Renewal of UKR status (automatic until 4 March 2026)",
      ],
      getALawyer: [
        "Complex ancestry case for Karta Polaka (lost records, Soviet-era name changes, Polish-Jewish heritage)",
        "Past Polish entry ban or Schengen overstay flagged on Polish border database",
        "Ukrainian criminal record (even minor — Polish authorities are checking)",
        "Karta Pobytu Stała application combining UKR period + tymczasowy + Karta Polaka residence times (case law evolving)",
        "Family member with prior Polish asylum claim or Ukrainian wanted list status",
        "Bringing extended family (parents over 60, adult dependent siblings) — separate analysis for each",
        "Russian-Ukrainian dual citizenship (Russian Federation passport + Ukrainian passport — Russian passport disclosure to Polish authorities affects status)",
        "Polish citizenship application after the qualifying period — language test and ceremony require legal coordination if any documentation is missing",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // TAIWANESE → US — study
  // ════════════════════════════════════════════════════════════════════

  "TW:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 paid + E-1/E-2 future option",
        why: "Taiwan sends ~22,000 students to the US annually. Your US institution issues Form I-20 (F-1) or DS-2019 (J-1) once admitted and proof-of-funds verified. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) before booking DS-160. Apply at American Institute in Taiwan (AIT) Taipei (Xinyi Section 3) or AIT Kaohsiung. AIT functions as the de facto US consulate (no formal diplomatic relations since 1979). Taiwan is on the Visa Waiver Program for tourism (90-day ESTA), but study still requires F-1. Notably: Taiwan is treaty-eligible for E-1/E-2 — a future career consideration.",
      },
      {
        label: "Strong source-of-funds + Taiwan's smooth interview profile",
        why: "Show 1st-year tuition + living costs ($40-80k). Document Taiwanese bank statements (Cathay United, Mega International, CTBC, First Commercial, Bank of Taiwan, ESun, Taishin, Fubon) with USD-equivalent at CBC rate. Taiwan has historically had the lowest F-1 refusal rates among East Asian sources (~5-10%) — applications process smoothly when documentation is complete. Family business funding: attach 統一編號 (Tax ID), 公司登記 (company registration), and 3 years of 報稅 (tax filings).",
      },
      {
        label: "Taiwanese degrees + apostille-equivalent — TECRO/TECO authentication",
        why: "Taiwan isn't a Hague Apostille signatory (and isn't UN-member). Authentication chain: Taiwanese MOFA (外交部) authentication at Taipei or regional offices, then TECRO/TECO (Taipei Economic and Cultural Representative Office) authentication at the nearest US office (TECRO Washington DC, TECO LA/SF/NY/Chicago/Houston/Atlanta/Boston/Honolulu/Miami/Seattle/Denver/Guam) when you arrive in US. Cost NTD 400/document at MOFA, USD 15-50 at TECO. Most US schools accept MOFA-authenticated copies + sworn translation.",
      },
      {
        label: "Taiwanese male military service status (substitute service or completed conscription)",
        why: "All Taiwanese males 18-36 must show resolved military obligation. Taiwan extended conscription from 4 months back to 1 year (Tiao Tsi Yi Chiao 條子役 service) effective 2024 birth cohorts. Show 役男 status: 已服役 (completed), 替代役 (substitute service done), 延期 (deferral with study abroad approval through 教育部 or 內政部 entry/exit permit). Without proper deferral, your future return to Taiwan triggers immediate conscription. Apply for 出境核准 (departure approval) at 內政部移民署 before flying.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Taiwanese or alternative destinations",
        prompt: "Taiwan has elite universities (NTU 台大, NTHU 清華, NCTU 交大 / NYCU after merger, NCKU 成大, NTNU 師大, Yang Ming Chiao Tung 陽明交大). Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS / semiconductor, NYC for finance, Boston for biotech, LA for entertainment), specialised programme. Vague 'American education is high quality' is a 214(b) refusal trigger.",
      },
      {
        heading: "Funding — Taiwanese family / business / scholarship structure",
        prompt: "Quantify: tuition $X, living $Y, total Year 1 $Z. Then show coverage: family contribution NTD X (with bank statement, parents' 報稅資料 last 3 years, family business 公司登記 if business-owner). Taiwan MOE Scholarship (教育部公費留學) is the most prestigious: NTD 2.4-3.2 million/year for selected fields — apply via MOE annual cycle. Foundation scholarships: Lin Tian-Cu Memorial, Frank Hawkins Kenan Institute, Fulbright Taiwan.",
      },
      {
        heading: "Post-graduation plan — your return to Taiwan",
        prompt: "F-1 visas require intent to return. State which Taiwanese sector you'll return to: TSMC, UMC, MediaTek, ASE, AUO, Hon Hai, Quanta, Pegatron, Asus, Acer, Gigabyte (semiconductor + electronics — Taiwan's strongest sectors), Chinatrust, Fubon, Cathay United, Mega Financial (banking), Eva Air / China Airlines / Starlux (aviation), or family business succession. If you want OPT briefly mention but emphasise return.",
      },
      {
        heading: "Family ties remaining in Taiwan + military status",
        prompt: "List parents (occupation, location — Taipei / New Taipei / Taichung / Kaohsiung / Hsinchu / Tainan district level), siblings, partner. Mention Taiwanese property — family home with 房屋登記 in parents' name, expected return-job, Taiwanese bank accounts. For males 18-36, explicitly state military service status with 兵單 (conscription notice) or 退伍令 (discharge order) attached.",
      },
    ],
    moneySavingTips: [
      "Apply at AIT Taipei OR AIT Kaohsiung — Kaohsiung has shorter wait times than Taipei during peak student-visa season (May-August)",
      "F-1 visa fee is $185; pay via NTD-USD bank transfer at CTBC, Cathay United, or Mega International — both AIT offices accept the MRV receipt from any major bank",
      "Don't pay 'visa consultancy' agencies NTD 50,000-150,000 — AIT is straightforward, DS-160 is free, and visa agencies don't influence consular decisions",
      "Taiwan MOE Government Scholarship for Overseas Study (公費留學) covers tuition + living + flights for selected programmes — apply via Ministry of Education annual cycle (deadline typically February)",
      "Fulbright Taiwan (~$30,000 + tuition for grad students) — applications open August-September via Foundation for Scholarly Exchange (FSE) Taipei office",
      "Yushan Scholarship for Younger Scholars / Distinguished Scholars — for academic-track students returning to Taiwanese universities post-PhD",
      "Use Cathay United or Mega International student remittance for tuition — lower FX fees than retail; CBC educational outflow has no annual cap with admission proof",
      "MOFA authentication: NTD 400/document at MOFA Taipei (Section 3 Heping E Road) or regional offices (Taichung, Kaohsiung, Hualien) — don't use 'document services' charging NTD 3,000+",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding, strong programme fit",
        "Standard Fulbright Taiwan or MOE scholarship F-1 application",
        "Renewal of existing F-1 at AIT Taipei / Kaohsiung during winter / summer breaks",
        "OPT or STEM OPT application during or after the programme",
        "Future transition from F-1 to H-1B / O-1 / E-2 (Taiwan's E-2 eligibility is a long-term advantage)",
      ],
      getALawyer: [
        "Prior US visa refusal (any category — B1/B2 tourist refusal is a red flag for F-1)",
        "Taiwanese criminal record (drug under 毒品危害防制條例 is absolute disqualifier)",
        "Unresolved Taiwanese military obligation (males 18-36 with active 兵單 approaching expiry)",
        "Family member with prior US asylum claim (rare for Taiwanese, but Tiananmen / 1989 era applications exist)",
        "Funding from a sponsor in mainland China — extra US scrutiny on Cross-Strait funding sources",
        "Past visa overstay in any country",
        "Dual Taiwan-mainland China passport / household registration (highly unusual but creates complex disclosure issues)",
        "Hong Kong-born Taiwanese or Macau-born Taiwanese — different consular jurisdiction (HKSAR / Macau passport vs Taiwan passport) affects visa filing",
        "Transfer from UK/Canadian/Australian student visa to US F-1",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BANGLADESHI → US — study
  // ════════════════════════════════════════════════════════════════════

  "BD:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 paid",
        why: "Bangladesh sends ~13,500 students to the US annually — growing rapidly. Your US institution issues Form I-20 (F-1) or DS-2019 (J-1) once admitted and proof-of-funds verified. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) before booking DS-160. Bangladeshi applicants book at US Embassy Dhaka (Madani Avenue, Baridhara — relocated from Diplomatic Enclave in 2017). DS-160 interview slots are competitive; book on the official US Visa Information Service Bangladesh portal — slots release Mondays 8am.",
      },
      {
        label: "Source-of-funds — strict scrutiny + bank statement seasoning",
        why: "Bangladesh historically had ~30-45% F-1 refusal rates due to funding documentation issues. Show 1st-year tuition + living costs ($40-80k). Document Bangladeshi bank statements (Eastern Bank, BRAC Bank, Dutch-Bangla Bank, City Bank, Prime Bank, Mutual Trust Bank, Standard Chartered Bangladesh) with USD-equivalent at Bangladesh Bank interbank rate. Avoid lump-sum deposits within 90 days of interview — visa officers question recent deposits. For family business sponsorship: trade licence (Trade Licence), TIN/BIN, IRC (Import Registration Certificate), 3 years of tax returns.",
      },
      {
        label: "Strong 214(b) ties to Bangladesh + clean WAEC-equivalent SSC/HSC certificates",
        why: "F-1 is non-immigrant — officer assumes overstay intent unless you prove otherwise. Strong Bangladeshi ties: family home with 'porcha' (RS / SA / BS record), agricultural land in your village, parents' employment (govt, military, banking, professional services, family business), expected return job, Bangladeshi bank accounts. SSC (10th-grade) and HSC (12th-grade) certificates from Bangladesh Education Boards (Dhaka / Chittagong / Rajshahi / Sylhet / Comilla / Barishal / Jessore / Dinajpur / Madrassah / Technical) need verification through online portals before US school admission.",
      },
      {
        label: "DS-160 form accuracy + interview confidence in English",
        why: "Bangladeshi applicants face close DS-160 scrutiny on travel history, family ties, and prior visa applications. Be completely truthful — disclose every prior US visa application (including refusals), every prior travel (India, Malaysia, Saudi Arabia, UAE, Singapore visits), and every family member who has emigrated. Practice interview answers in English — most Bangladeshi medium-of-instruction is Bangla, so practice the standard F-1 questions ('Why this school?', 'How will you pay?', 'What will you do after graduation?') aloud in clear English.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Bangladeshi or alternative destinations",
        prompt: "Bangladesh has strong universities (BUET, IUT, DU University of Dhaka, BRAC University, NSU North South University, IUB Independent University, AIUB) and many Bangladeshis study in UK (Oxford-Bangladesh scholarships, LSE, UCL), Australia, Canada, or Malaysia. Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS, Wall Street for finance, Texas for energy, Boston for biotech), specialised programme. Reference faculty, coursework, lab.",
      },
      {
        heading: "Funding — Bangladeshi family / business / sponsor structure",
        prompt: "Quantify: tuition $X, living $Y, total Year 1 $Z. Then show coverage: family contribution BDT X (with bank statement, NBR TIN registration, family business Trade Licence + IRC if applicable, parent salary slip if salaried). Document AT LEAST 12 months of consistent income — F-1 officers know which Bangladeshi sectors (RMG / pharma / shipping / banking / telecoms) throw off real cashflow vs paper-only. Avoid lump-sum deposits in the 90 days before interview.",
      },
      {
        heading: "Post-graduation plan — your return to Bangladesh",
        prompt: "F-1 visas explicitly require intent to return. State which Bangladeshi sector you'll return to: Bangladeshi banks (DBBL, BRAC Bank, Eastern, City, Prime, Mutual Trust), RMG (Beximco, Square, DBL Group, Mohammadi, Hameem), pharma (Square Pharma, Beximco Pharma, Incepta, Renata, ACI), telecoms (Grameenphone, Robi Axiata, Banglalink, Teletalk), MNCs in Bangladesh (Unilever Bangladesh, BAT Bangladesh, Standard Chartered Bangladesh, HSBC Bangladesh), or family business succession. If you want OPT briefly mention but emphasise return.",
      },
      {
        heading: "Family ties remaining in Bangladesh",
        prompt: "List parents (occupation, location — Dhaka / Chittagong / Sylhet district / upazila level), siblings, partner. Mention Bangladeshi property — family home with porcha record, agricultural land in original district (gram bari), Bangladeshi bank accounts you'll maintain. Avoid mentioning extensive US-based family — Bangladeshi-American extended family in NYC / Detroit / LA / Houston is a 214(b) concern. If you do have relatives in US, note their legal status (citizen / GC holder / professional visa).",
      },
    ],
    moneySavingTips: [
      "F-1 visa fee is $185; pay via Standard Chartered Bangladesh or Eastern Bank counter with MRV barcode — both accept USD cash or BDT at BB rate",
      "Don't pay 'visa consultancy' agencies BDT 100,000-500,000 — DS-160 is free online, interview is the bottleneck, agents don't influence US consular decisions",
      "Bangladeshi applicants are eligible for Fulbright Bangladesh (~$30,000 + tuition for grad students — USEFB runs application cycle February-May), EMK Center scholarships, US-Bangladesh Education Foundation, Open Society Foundation",
      "Many US universities have Bangladeshi-origin scholarship endowments — Harvard South Asian Studies, Yale, Stanford, MIT, Columbia, UPenn all have need-based aid or named Bangladeshi-heritage funds; ask the international admissions office",
      "Eastern Bank (EBL), BRAC Bank, Dutch-Bangla Bank student remittance for tuition transfers — lower FX fees than retail money changers; Bangladesh Bank educational outflow allowance is USD 30,000/academic year with admission proof, renewable",
      "USEFB EducationUSA Dhaka offers free advising for US admissions and visa preparation — open Sunday-Thursday at Bashundhara R/A; far better than paid consultancies",
      "SSC/HSC certificate verification: free at the respective Education Board's online portal — don't pay 'verification agents' BDT 5,000+",
      "If your STEM application triggers 221(g) administrative processing, don't pay 'expediters' — they have no influence; just wait for SAO clearance",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding, strong programme fit",
        "Standard Fulbright, USEFB, or named-scholarship F-1 / J-1 application",
        "Renewal of existing F-1 at US Embassy Dhaka during winter / summer breaks",
        "OPT or STEM OPT application during or after the programme",
      ],
      getALawyer: [
        "Prior US visa refusal (any category — B1/B2 tourist refusal is a major red flag for F-1)",
        "Bangladeshi criminal record (including Special Powers Act / ATA detention) — even minor, even dismissed",
        "STEM field with potential SAO sensitivity (nuclear, aerospace, advanced AI, advanced materials, biotech dual-use)",
        "Family member in Bangladeshi military / intelligence / nuclear / political opposition (additional security review)",
        "Funding from a sponsor outside Bangladesh / immediate family (Gulf-based relative, business sponsor, third-country sponsor)",
        "Family member with prior US asylum claim from Bangladesh (BNP / Awami League opposition / Hindu minority / Christian minority / religious minority protection)",
        "Past visa overstay in any country (Saudi Arabia, UAE, Malaysia, Singapore common destinations for Bangladeshis)",
        "Transfer from UK/Canadian/Australian student visa to US F-1 — country-to-country SEVIS transfer needs handling",
        "SSC/HSC certificate dispute (re-take or appeal pending, name mismatch on documents)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // COLOMBIAN → US — work
  // ════════════════════════════════════════════════════════════════════

  "CO:US:work": {
    whatCarriesWeight: [
      {
        label: "H-1B Specialty Occupation OR L-1 intracompany OR E-2 (post-2022 Colombia eligibility)",
        why: "Colombia became an E-2 Treaty Investor country in May 2022 (Treaty signed 2006, implementation delayed) — a major route for Colombian entrepreneurs. E-2 requires substantial Colombian investment in a US business (~$100k+ typical, no statutory minimum). H-1B is cap-subject (March lottery, 85k slots — Colombian win rate ~35-40%) requiring a US employer petition for Bachelor's-degree-equivalent role. L-1A/B (intracompany transfer) bypasses the lottery if you've worked 1+ year at a Colombian parent (Bancolombia, Grupo Sura, EPM, Ecopetrol, Avianca, Cencosud Colombia, Almacenes Éxito) with US subsidiary.",
      },
      {
        label: "DS-160 + Apostilled Colombian degrees + WES/ECE/AICE credential evaluation",
        why: "DS-160 online application, then book interview at US Embassy Bogotá (Calle 24 Bis 48-50) — handles all Colombian applicants. Colombian degree certificates (Pregrado / Maestría / Doctorado) need Apostille via Cancillería de Colombia (Ministry of Foreign Affairs) — Colombia is Hague signatory since 2002. Cost COP 35,000-80,000 per document, 5 working days. For US licensure (medicine, accounting, engineering PE) WES, ECE, or AICE foreign credential evaluation. Pregrado typically maps to US Bachelor's; Especialización + Maestría to US Master's.",
      },
      {
        label: "Colombian Pasado Judicial (Procuraduría + Personería certificates)",
        why: "US Embassy Bogotá requires Pasado Judicial (judicial background certificate) for some visa categories — three separate certificates: Procuraduría General de la Nación (administrative/disciplinary), Personería Distrital (criminal), Contraloría General (fiscal). All free at the respective offices' online portals (gov.co system). DAS Migración (immigration record) for some categories. These are not always demanded at DS-160 interview but having them ready accelerates the process.",
      },
      {
        label: "Colombian-US tax treaty implications (no treaty currently)",
        why: "Colombia and the US do not have a bilateral income tax treaty (negotiations ongoing, not yet ratified as of 2025). This means: no Totalization Agreement (you'll potentially pay both Colombian and US Social Security if not careful), no preferential treaty rates on dividends/interest, full US worldwide income taxation once you're tax-resident. Plan with both Colombian and US tax advisers. Foreign Tax Credit (Form 1116) is the primary double-taxation mitigation tool, not treaty articles.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why the US — sector and employer specificity",
        prompt: "Colombian applicants benefit from specificity: tech (Silicon Valley, Austin, Miami — large Colombian-American tech community), finance (Miami especially for Latin American banking, NYC, Chicago), oil & gas (Houston — Ecopetrol US ops, Schlumberger, Halliburton), pharma (NJ, Boston, Bay Area), entertainment (Miami for Latin music — Sony Music Latin, Universal Music Latin, LA for Spanish-language productions). Name your target US employer.",
      },
      {
        heading: "Your Colombian employer / academic credentials",
        prompt: "List your Colombian employer chronologically, role, salary in COP with USD equivalent, supervisor name + contact. Colombian universities are well-known to US Embassy Bogotá: Universidad de los Andes (Uniandes), Universidad Nacional, Universidad Javeriana, Universidad del Rosario, Universidad EAFIT, Universidad de Antioquia, Universidad Externado, ICESI, Universidad de la Sabana. Major Colombian employers (Bancolombia, EPM, Ecopetrol, Grupo Sura, Argos, Avianca, Davivienda, BAVARIA, Postobón) have well-trodden L-1 paths.",
      },
      {
        heading: "Long-term plan — H-1B → green card OR temporary OR E-2 indefinite",
        prompt: "H-1B and L-1 allow dual intent — you can openly state green-card plans (EB-1/EB-2/EB-3 via PERM). E-2 is non-immigrant but renewable indefinitely while the Colombian investment substantially operates. State your honest plan. Colombian applicants who want long-term US residence + maintain Colombian ties (dual citizenship is permitted by Colombia and US) should mention this — Colombian American community is large in Miami, NJ, NYC, Houston.",
      },
      {
        heading: "Family + dependants + Colombian school year",
        prompt: "Spouse on L-2 has automatic work authorisation since 2023; H-4 spouse needs EAD (limited categories). E-2 spouse gets E-2D with full work rights. Colombian spouse + children under 21 are derivative. Mention Colombian school year (February-November) when timing relocation — children in Colombian schools benefit from arrival before US August/September school start. International schools in Bogotá / Medellín / Cali (Colegio Nueva Granada, Colegio Anglo Colombiano) ease US school transition.",
      },
    ],
    moneySavingTips: [
      "DS-160 fee $185 (H-1B/L-1) or $315 (E-2); pay in COP at Citibank Colombia, Bancolombia, or Banco de Bogotá counters with MRV barcode — no reciprocity fee for Colombians",
      "Use WES iGPA Calculator (free online) before paying for full evaluation; many US employers accept Colombian-certified transcripts at offer stage",
      "Apostille at Cancillería de Colombia online portal: COP 35,000-80,000/document — don't use 'apostille agencies' charging COP 200,000+",
      "Open a US-domiciled bank account with Wise USD, Mercury Business, or Bancolombia US (Miami / NYC branches — Colombian diaspora friendly) before relocation",
      "Colombian Embassy DC + Consulates (Atlanta, Boston, Chicago, Houston, LA, Miami, New Orleans, NYC, SF, Newark, Orlando, Washington) offer free notarisation and apostille assistance for Colombian citizens",
      "Avoid Colombian 'asesores migratorios' charging COP 8-25M for H-1B/L-1 — US-based immigration attorneys with Latin American desks at Fragomen, Berry Appleman, BAL, Wilson Elser have flat-fee Spanish-language Colombian services at $2,500-3,500",
      "Plan Colombian tax exit carefully: file final Colombian Declaración de Renta as resident for the year of departure; from following year file as non-resident (only Colombian-source income taxed); no exit tax in Colombia (advantage vs many other LatAm countries)",
      "Use ICETEX Crédito Educativo or family loans rather than US private loans for any pre-arrival capital needs — Colombian student loan rates ~10-15% vs US private 8-12%",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B / L-1 with named US employer, clean record, clear Colombian degree mapping",
        "DS-160 interview prep and document gathering at US Embassy Bogotá",
        "Spouse / dependent derivative applications (H-4, L-2, E-2D)",
        "Renewal of existing H-1B / L-1 at US Embassy Bogotá during home leave",
        "PERM-based EB-2 / EB-3 green card with cooperating US employer (Colombians are current — no per-country backlog)",
      ],
      getALawyer: [
        "E-2 Treaty Investor (post-2022 Colombia eligibility) — substantiality, source-of-funds, and 'real and operating' enterprise tests benefit from specialist drafting; Colombian capital outflow regulations need DIAN/Banco de la República coordination",
        "EB-1A / EB-1B / O-1 — extraordinary ability for Colombian researchers / executives / artists / athletes",
        "Concurrent Colombian capital outflow reporting (registration of foreign investment with Banco de la República for amounts >USD 100,000)",
        "Prior US visa refusal or US overstay",
        "Colombian criminal record (drug-related cases are absolute disqualifier under US INA 212(a)(2); even peace deals / amnesty arrangements need careful framing)",
        "Past FARC / ELN / paramilitary affiliation history (even as victim) requires careful documentation",
        "Asylum-related family member (Venezuelan migrants who acquired Colombian status — separate analysis)",
        "Same-sex spouse — Colombia recognised same-sex marriage 2016; US recognises it; derivative visas straightforward",
        "Dual Colombian-other passport (Colombian-Spanish, Colombian-Italian, Colombian-Lebanese common combinations — apply via Colombian passport)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → UAE — work
  // ════════════════════════════════════════════════════════════════════

  "IN:AE:work": {
    whatCarriesWeight: [
      {
        label: "Employer Work Permit + Entry Permit via MOHRE — Indians are UAE's largest expat group",
        why: "Indians are the largest expat population in UAE (~3.5 million, ~30% of UAE population). Your UAE employer applies to MOHRE for a Work Permit and to GDRFA (Dubai) / ICA (Abu Dhabi / Sharjah / other emirates) for the 60-day Entry Permit. On arrival you complete medical fitness test, Emirates ID biometric, and visa stamping (now mostly digital). Employer pays AED 3,000-7,000 total per UAE Labour Law (Cabinet Resolution 21 of 2020) — refuse any 'visa fee deduction' from your first salary.",
      },
      {
        label: "Indian educational certificates attested via MEA Apostille + UAE Embassy New Delhi",
        why: "All Indian degree certificates need attestation chain: 1) issuing university stamp, 2) State HRD or AICTE if technical, 3) MEA Apostille (India is Hague signatory since 2005) via e-Sanad portal, 4) UAE Embassy New Delhi attestation in Chanakyapuri OR UAE Consulate General Mumbai (BKC) OR Hyderabad / Kerala consulates, 5) UAE MOFA on arrival. Cost INR 1,500-4,000 + AED 150-300 total. Allow 3-6 weeks. For salaries below AED 12,000/month, MOHRE checks degree-occupation fit rigorously.",
      },
      {
        label: "Salary tier determines visa category + Golden Visa potential for senior Indian professionals",
        why: "UAE work visa tiers: Standard (most workers, 2-year visa renewable), Skilled Professional (AED 12,000-25,000/month), Highly Skilled (AED 25,000+/month), Golden Visa (5 or 10 years, no sponsor, family included). Indian professionals earning AED 30,000+/month (CFOs, doctors, senior managers at multinationals, tech leaders) qualify for Golden Visa directly. Investors with AED 2M property in UAE or AED 2M public investment also qualify. Indians dominate Golden Visa issuance — over 100,000 issued to Indian nationals as of 2024.",
      },
      {
        label: "Medical fitness test + tuberculosis / HIV screening — pre-test in India to avoid airfare loss",
        why: "Within 60 days of Entry Permit issuance you must complete medical fitness at DHA-approved centres (Dubai), SEHA (Abu Dhabi), or MOHAP (other emirates). TB, HIV, and Hepatitis B/C screening — positive results lead to immediate non-issuance of residence visa and deportation back to India. Costs AED 320-750. Pre-test in India at authorised IOM labs (IOM Mumbai, IOM Chennai, IOM Kerala) or NABL-accredited labs — saves the airfare loss if results would disqualify.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role, your UAE employer, salary tier, and Golden Visa eligibility",
        prompt: "UAE doesn't ask personal-statement-style narrative at the consular stage (processing is employer-led through MOHRE portal). For Indian applicants, important documentation: UAE employer Trade Licence number, MOHRE establishment registration, role per AED 4,000+/month minimum (for sponsor-eligible salary), specific emirate (Dubai vs Abu Dhabi vs Sharjah have different SEHA/DHA/MOHAP processes). Highlight Indian qualifications and prior Gulf experience — Indian engineers, doctors, nurses, accountants, IT professionals, and finance roles dominate UAE white-collar workforce.",
      },
      {
        heading: "Your Indian work history — PAN, EPF UAN, exact dates",
        prompt: "List every Indian employer with month-precision dates, role, salary in INR, supervisor name + contact. Include PAN number (Permanent Account Number from Income Tax Department) and EPFO UAN (Universal Account Number — Employee Provident Fund) — UAE attestation occasionally requires these. Past Gulf experience (Saudi, Qatar, Kuwait, Oman, Bahrain) strengthens applications — document each Gulf contract by employer, dates, and reason for leaving (including any End of Service Gratuity received).",
      },
      {
        heading: "Family + sponsorship + Indian school year considerations",
        prompt: "If bringing dependants (spouse, children, parents) — they need separate Dependent Residence visas tied to your sponsorship. Threshold: AED 4,000/month + accommodation for spouse/children; AED 6,000-12,000/month for parents (varies by emirate). Indian spouse + children carry Indian passports — separate attestation chain (Indian marriage cert + birth certs via state-level Notary Public + MEA Apostille + UAE Embassy New Delhi) needed. Indian school year (April-March) timing: most expat-Indian schools in UAE (DPS Dubai, GEMS, Delhi Private School, Indian High School) follow Indian curriculum (CBSE/ICSE) for smooth transition.",
      },
      {
        heading: "Long-term plan — Golden Visa or rotation back to India",
        prompt: "UAE work visas aren't a path to UAE citizenship (UAE doesn't naturalise foreign workers in practice). State either: Golden Visa target (if income/investment qualifying — Indians are the largest Golden Visa applicant cohort), or temporary contract (3-5 years) with planned return to India. Indian tax: Indian resident if you spend >182 days/year in India OR 60 days + 365 days in 4 prior years. UAE has no personal income tax. Plan carefully to avoid Indian global-income tax during transition years.",
      },
    ],
    moneySavingTips: [
      "Employer MUST pay all work visa costs per UAE Labour Law (MOHRE Resolution 30 of 2013) — refuse any 'visa fee deduction'; report to MOHRE call centre 800-665 if pressured",
      "Indian degree attestation via MEA e-Sanad portal: INR 50-200/document direct (Hague Apostille route) — don't pay agencies INR 2,000-5,000/document; UAE Embassy New Delhi attestation INR 1,500-3,000",
      "Medical fitness: DHA-approved centres in Dubai (Al Maktoum, Karama, Bur Dubai) are cheaper (AED 320-450) than SEHA premium services (AED 750)",
      "Open ENBD, FAB, ADCB, or HSBC Premier UAE salary account — corporate sponsor often gets fee waivers; ask about salary-transfer-based account opening before paying account opening fees",
      "Don't use 'free zone PRO services' charging AED 5,000+ for what your employer's PRO handles free — clarify at offer stage who processes your Emirates ID",
      "Apply for Indian Tax Residency Certificate at Income Tax Department if you'll be UAE-resident >182 days/year — exempts UAE-source income from Indian global-income tax",
      "Indian apostille via state-level MEA collection centres (CMM Mumbai, ROCC Chennai, OPC Hyderabad, MEA Delhi) — same fee, faster than agency routing",
      "UAE Golden Visa application fee AED 2,800-3,800 (5-year) or AED 4,300-5,300 (10-year) — apply yourself via ICA / GDRFA portal; don't use 'Golden Visa consultancies' charging AED 15,000+",
      "Use Wise USD/INR/AED, Revolut, or LuLu Money for remittance — cheaper than ENBD international transfer; RBI's LRS allows USD 250,000/year outbound from India to UAE",
    ],
    lawyerTriggers: {
      diy: [
        "Standard employer-led work permit + entry permit + residence visa with attested certificates",
        "Medical fitness, Emirates ID biometric, and visa stamping (all employer-facilitated)",
        "Dependent visa for spouse + children once you have residence visa and qualifying salary",
        "Golden Visa application via salary or property route (online via ICA / GDRFA portal)",
        "End of Service Gratuity calculation and Pension Plan registration",
      ],
      getALawyer: [
        "Past UAE labour ban (1-year, 6-month, or lifetime — issued for absconding, breach of contract, or criminal case)",
        "Indian criminal record (NDPS narcotics, dowry, communal cases — UAE rigorously checks)",
        "Previous Gulf labour dispute (kafala-system unpaid wages, employer-side passport-holding case)",
        "Switching from one UAE sponsor to another mid-contract without sponsor NOC (now easier under 2022 Labour Law, but edge cases benefit from PRO/lawyer)",
        "Free zone visa vs mainland visa selection (DMCC, JAFZA, ADGM, DIFC have different rules; investment thresholds vary)",
        "Real estate Golden Visa application (AED 2M property qualifier — title deed in your sole name, not shared)",
        "Family member with prior UAE conviction or labour ban (affects your sponsorship eligibility)",
        "Indian PAN/Aadhaar-Aadhaar based ITR delinquency — UAE residence visa renewal can be affected if Indian tax authorities flag Section 195 TDS issues",
        "Dual Indian-OCI status of spouse complicating dependent visa documentation",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // PAKISTANI → UAE — work
  // ════════════════════════════════════════════════════════════════════

  "PK:AE:work": {
    whatCarriesWeight: [
      {
        label: "Employer Work Permit + Entry Permit via MOHRE — Pakistanis are UAE's 3rd-largest expat group",
        why: "Pakistanis are UAE's 3rd-largest expat community (~1.7 million, after Indians and Bangladeshis). Your UAE employer applies to MOHRE for a Work Permit, and to GDRFA / ICA for the 60-day Entry Permit. On arrival: medical fitness test, Emirates ID biometric, visa stamping. Employer pays AED 3,000-7,000 per UAE Labour Law — refuse any 'visa fee deduction' from first salary; report to MOHRE 800-665. Pakistanis with prior Gulf experience (Saudi, Kuwait) are smoothly processed.",
      },
      {
        label: "Pakistani educational certificates attested via MOFA + UAE Embassy Islamabad",
        why: "Pakistani degree certificates need attestation chain: 1) issuing university stamp, 2) HEC (Higher Education Commission) attestation — required for all degrees, free at HEC offices in Islamabad/Lahore/Karachi/Peshawar/Quetta, 3) Pakistani MOFA (Foreign Office) Islamabad attestation, 4) UAE Embassy Islamabad (Plot 158-159 Diplomatic Enclave I, Sector G-5) attestation, 5) UAE MOFA on arrival. Pakistan IS Hague Apostille signatory since 2023 — simplified process replacing the older multi-step chain, but in practice many UAE entities still require full embassy attestation. Cost PKR 6,000-15,000 + AED 150-300 total. Allow 4-8 weeks.",
      },
      {
        label: "Salary tier determines visa + Pakistani Golden Visa eligibility",
        why: "UAE work visa tiers identical to other nationalities (Standard / Skilled / Highly Skilled / Golden). Pakistani professionals earning AED 25,000+/month qualify for Golden Visa directly. Investors with AED 2M property in UAE also qualify regardless of nationality. Pakistani doctors, IT professionals, engineers, accountants, and finance roles dominate white-collar Pakistani UAE workforce; blue-collar Pakistanis concentrate in construction, security, hospitality, and driving (especially Sharjah, Ajman, Ras Al Khaimah).",
      },
      {
        label: "Medical fitness test + pre-test in Pakistan + Police Character Certificate",
        why: "Within 60 days of Entry Permit: medical fitness at DHA-approved (Dubai), SEHA (Abu Dhabi), or MOHAP (other emirates). TB, HIV, Hepatitis B/C screening — positive results = immediate deportation back to Pakistan. Costs AED 320-750. Pre-test in Pakistan at IOM Islamabad / Karachi / Lahore — saves airfare loss if disqualifying. Pakistani Police Character Certificate from your Tehsil Police Station (PKR 200-500, 14-30 days) — required for some UAE employer onboarding.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role, your UAE employer, salary tier, and Golden Visa eligibility",
        prompt: "UAE doesn't ask personal-statement narrative at consular stage (employer-led via MOHRE portal). For Pakistani applicants, important: UAE employer Trade Licence number, MOHRE establishment registration, role per AED 4,000+/month minimum, specific emirate. Highlight Pakistani qualifications (PEC for engineers, PMDC for doctors, PSC for civil engineers, ICAP for chartered accountants) and prior Gulf experience — Saudi, Kuwait, Qatar contracts are particularly valued by UAE employers because of similar regulatory environment.",
      },
      {
        heading: "Your Pakistani work history — CNIC, NTN, EOBI, exact dates",
        prompt: "List every Pakistani employer with month-precision dates, role, salary in PKR, supervisor name + WhatsApp/email. Include CNIC (Computerized National Identity Card) number, NTN (National Tax Number from FBR), and EOBI (Employees Old-Age Benefits Institution) registration number — UAE attestation occasionally requires these. Past Gulf experience documents: contract copy, Iqama (Saudi residence permit) or QID (Qatari ID) record, End of Service Gratuity receipt.",
      },
      {
        heading: "Family + sponsorship + Pakistani school year considerations",
        prompt: "If bringing dependants — Dependent Residence visas tied to your sponsorship. Threshold: AED 4,000/month + accommodation for spouse/children; AED 6,000-12,000/month for parents (varies by emirate). Pakistani spouse + children carry Pakistani passports — separate attestation chain (Pakistani NADRA marriage cert + birth certs via Provincial Notary + MOFA + UAE Embassy Islamabad) needed. Pakistani school year (March-February for private; August-June for English-medium colonial-pattern schools) timing: Pakistani schools in UAE (Pakistan Education Academy, Pakistan Education Centre, Pakistan Islamia School) follow Federal Board curriculum.",
      },
      {
        heading: "Long-term plan — Golden Visa, return to Pakistan, or onward migration",
        prompt: "UAE work visas don't lead to UAE citizenship. State plan: Golden Visa (if salary/property qualifying — Pakistanis are 4th-largest Golden Visa cohort), temporary contract with planned Pakistan return, or onward migration to Canada / UK / Australia / US (UAE-based Pakistani diaspora often uses UAE residency as intermediate step). Tax: Pakistani resident if you spend >183 days/year in Pakistan; UAE has no personal income tax. Plan to avoid Pakistani global-income tax during transition years.",
      },
    ],
    moneySavingTips: [
      "Employer MUST pay all work visa costs per UAE Labour Law (MOHRE Resolution 30 of 2013) — refuse any 'visa fee deduction'; report to MOHRE 800-665",
      "Pakistani degree attestation: HEC attestation is FREE (just appointment booking at HEC website) — pay agencies only for inter-city transport, not 'attestation expediting'",
      "MOFA Islamabad attestation: PKR 1,000-2,000/document; UAE Embassy Islamabad attestation: PKR 5,000-15,000/document; don't pay 'document services' charging PKR 30,000+",
      "Medical fitness: DHA-approved centres in Dubai (AED 320-450) cheaper than SEHA premium (AED 750)",
      "Open HBL UAE, MCB UAE, Bank Alfalah UAE, or ENBD salary account — Pakistani diaspora-friendly with rupee remittance discounts to Pakistan",
      "Don't pay 'PRO services' or 'free zone consultants' AED 5,000+ for what your employer's PRO handles free",
      "Police Character Certificate: PKR 200-500 at local Tehsil HQ — don't pay dalals (touts) PKR 5,000+",
      "Apply for Pakistani Tax Residency Certificate at FBR if you'll be UAE-resident >183 days/year — exempts UAE income from Pakistani global-income tax",
      "UAE Golden Visa fee AED 2,800-3,800 (5-year) — apply via ICA / GDRFA portal; don't use consultancies charging AED 15,000+",
      "Use Wise PKR/AED, Western Union, or Habib Express for remittance — cheaper than HBL/MCB international transfer",
    ],
    lawyerTriggers: {
      diy: [
        "Standard employer-led work permit + entry permit + residence visa with HEC + MOFA + UAE Embassy attested certificates",
        "Medical fitness, Emirates ID biometric, visa stamping (employer-facilitated)",
        "Dependent visa for spouse + children once residence visa + qualifying salary established",
        "Golden Visa application via salary or property route",
        "End of Service Gratuity calculation",
      ],
      getALawyer: [
        "Past UAE labour ban (1-year, 6-month, or lifetime)",
        "Pakistani criminal record (Anti-Terrorism Act, NDPS narcotics, Hudood Ordinance — UAE rigorously checks)",
        "Previous Gulf labour dispute (Saudi kafala unpaid wages, Qatar QID-related issues, Kuwait sponsor-side passport-holding)",
        "Switching UAE sponsor mid-contract without NOC (now easier under 2022 Labour Law but edge cases benefit from lawyer)",
        "Real estate Golden Visa application (AED 2M property in sole name)",
        "Family member with prior UAE conviction / labour ban",
        "Tax delinquency at FBR Pakistan (UAE residence visa renewal can be affected)",
        "Past Saudi 'huroob' (absconder) status flagged in GCC databases",
        "Pakistani military / ISI background — additional UAE security review",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // FILIPINO → UAE — work
  // ════════════════════════════════════════════════════════════════════

  "PH:AE:work": {
    whatCarriesWeight: [
      {
        label: "POEA / DMW deployment clearance + UAE employer Work Permit via MOHRE",
        why: "Filipinos must go through Department of Migrant Workers (DMW, formerly POEA) for overseas deployment — even private hires require DMW clearance, OEC (Overseas Employment Certificate, valid 60 days), and PDOS (Pre-Departure Orientation Seminar) attendance. Skipping this triggers DMW 'illegal recruitment' charges on return. UAE employer also applies to MOHRE for Work Permit and to GDRFA / ICA for Entry Permit. Two-track compliance: DMW + MOHRE. About 750,000 Filipinos work in UAE (4th-largest expat group).",
      },
      {
        label: "Job role determines visa category + Golden Visa for Filipino professionals",
        why: "UAE work visa tiers: Standard (most Filipino workers — nurses, hospitality, retail, drivers), Skilled Professional (AED 12,000-25,000/month), Highly Skilled (AED 25,000+/month), Golden Visa. Filipino nurses (largest Filipino white-collar cohort in UAE) often hit Highly Skilled at AED 8,000-15,000 with DOH/DHA/MOHRE licensing. Filipino doctors, IT professionals, hotel managers, F&B managers, and finance roles can qualify for Golden Visa at AED 25,000+/month or via Specialised Talent (cultural/arts/sports).",
      },
      {
        label: "PRC (Professional Regulation Commission) Licensure + DOH/DHA/MOHRE conversion",
        why: "For licensed professions, your Philippine licence requires UAE conversion. Nurses: DOH-DHA Dataflow + Prometric exam (DHA / HAAD / MOH) + PRC verification + UAE Ministry of Health approval. Doctors: same process but with longer assessment. Pharmacists: DHA verification + Prometric. Accountants: ICAEW/ACCA conversion via UAE branch. Allow 3-6 months for full licensure conversion — many Filipinos work as 'admin staff' or 'nursing assistant' (lower-tier) while waiting for full conversion.",
      },
      {
        label: "Medical fitness + NBI Clearance + Philippine document attestation",
        why: "Within 60 days of Entry Permit: medical fitness at DHA / SEHA / MOHAP (AED 320-750). NBI Clearance from Philippines (PHP 130-155, valid 6 months) attested via DFA Manila Authentication Office + UAE Embassy Manila. Philippine documents (PSA birth/marriage cert, TOR, diploma) need DFA Apostille (Philippines joined Hague Convention May 2019) + UAE MOFA legalisation on arrival — replacing the older multi-step legalisation chain.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role, UAE employer, salary tier, and DMW clearance status",
        prompt: "UAE doesn't ask personal-statement narrative at consular stage (employer-led + DMW-led). For Filipinos: UAE employer Trade Licence number, MOHRE establishment registration, role + salary band (AED 4,000+/month minimum for sponsor-eligible salary), PRC licence if regulated profession, DMW OEC reference, balikbayan box / luggage allowance noted. Highlight prior Gulf experience (KSA, Qatar, Kuwait) — Filipino nurses, hospitality workers, and domestic workers often have multi-Gulf careers.",
      },
      {
        heading: "Your Philippine work history — TIN, SSS, Pag-IBIG, PhilHealth, PRC numbers",
        prompt: "List every Philippine employer with month-precision dates, role, salary in PHP, supervisor name. Include TIN (BIR Tax Identification Number), SSS (Social Security System), Pag-IBIG (HDMF housing fund), PhilHealth, and PRC licence number — UAE attestation occasionally requires these. Past Gulf experience documents: previous contracts, Iqama/QID records, OEC reference numbers, repatriation history.",
      },
      {
        heading: "Family + dependants + Filipino school year",
        prompt: "Dependent Residence visas tied to your sponsorship. Threshold: AED 4,000/month + accommodation for spouse/children; AED 6,000-12,000/month for parents. Philippine spouse + children carry Philippine passports — separate attestation chain (PSA marriage cert + birth certs via DFA Apostille + UAE Embassy Manila) needed. Philippine school year (June-March) timing: Philippine schools in UAE (PSAS Philippine School in Abu Dhabi, Philippine Cultural Centre) follow K-12 DepEd curriculum.",
      },
      {
        heading: "Long-term plan — Golden Visa, return to Philippines, or onward migration",
        prompt: "UAE work visas don't lead to UAE citizenship. State plan: Golden Visa (for Filipino professionals at AED 25,000+/month), temporary OFW contract with planned Philippine return, or onward migration to Canada / Australia / US (UAE-based Filipinos often use UAE residency as professional springboard). Philippine tax: Filipino tax-resident if you maintain residency / dependants in Philippines + spend >180 days; OFW status exempts certain income types. UAE has no personal income tax.",
      },
    ],
    moneySavingTips: [
      "Employer MUST pay all UAE work visa costs (MOHRE Resolution 30 of 2013) — refuse 'visa fee deduction'; report to MOHRE 800-665. Separately, employer must also pay DMW processing fees per RA 11641 Migrant Workers and Overseas Filipinos Act 1995",
      "POEA / DMW OEC: PHP 100 (online via DMW e-Services portal) — don't pay 'recruiter facilitation' PHP 2,000-5,000",
      "PDOS (Pre-Departure Orientation Seminar): free at DMW-accredited NGOs (typically OWWA, BLAS, NGO partners) — don't pay 'expedited PDOS' charging PHP 1,500+",
      "DFA Apostille at consular offices: PHP 200-400/document — don't use 'apostille services' charging PHP 2,000+",
      "Medical fitness: DHA-approved centres in Dubai (AED 320-450) cheaper than SEHA premium (AED 750)",
      "Open ENBD, FAB, ADCB, or HSBC UAE salary account — Filipino-friendly with PHP remittance discounts; PNB UAE branch services Filipino diaspora",
      "PRC licensure conversion (Dataflow + Prometric + UAE MOH): PHP 30,000-50,000 total — pay direct, don't use 'agency packages' charging PHP 100,000+",
      "Apply for Philippine Tax Residency Certificate at BIR if you'll be UAE-resident as OFW",
      "Use Wise PHP/AED, Western Union, Cebuana Lhuillier, M Lhuillier, BDO Remit, or LBC Express for remittance — vastly cheaper than ENBD international transfer; OFW Pag-IBIG and SSS contributions can continue voluntarily from abroad",
      "Avoid Philippine 'visa consultancies' charging PHP 80,000+ — UAE employer's PRO handles paperwork; DMW clearance is straightforward via Migrant Workers offices in Manila / Cebu / Davao",
    ],
    lawyerTriggers: {
      diy: [
        "Standard employer-led work permit + entry permit + DMW OEC + medical + Emirates ID",
        "Dependent visa for spouse + children once residence visa + qualifying salary established",
        "PRC licence conversion (DHA / HAAD / MOH process)",
        "Golden Visa application via salary or specialised talent route",
        "End of Service Gratuity calculation and SSS/Pag-IBIG continuation",
      ],
      getALawyer: [
        "Past UAE labour ban or 'huroob' (absconder) status",
        "Philippine criminal record (Comprehensive Dangerous Drugs Act, illegal recruitment victim case, family case)",
        "Previous Gulf labour dispute (Saudi kafala unpaid wages, Qatar passport-holding case, Kuwait recruiter-side issues)",
        "Switching UAE sponsor without NOC mid-contract (now easier under 2022 Labour Law)",
        "Domestic worker visa (Tadbeer system) — separate visa category with different protections",
        "Real estate Golden Visa application (AED 2M property in sole name)",
        "Family member with prior UAE conviction or labour ban",
        "Past TESDA / NSTI training certificate dispute",
        "Filipino dual citizenship via marriage to US/Australian/Canadian — apply via Philippine passport (not foreign)",
        "Past Hong Kong / Singapore domestic worker contract complications affecting UAE deployment",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // EGYPTIAN → SAUDI ARABIA — work
  // ════════════════════════════════════════════════════════════════════

  "EG:SA:work": {
    whatCarriesWeight: [
      {
        label: "Kafala (sponsorship) reformed: Saudi Labour Law amendments + iqama system",
        why: "Egyptians are Saudi Arabia's 2nd-largest expat group (~2.9 million), after Indians. The kafala (kafil) sponsorship system was significantly reformed in March 2021 — workers can now change employers more easily and exit the country without sponsor permission, BUT iqama (residence permit) is still tied to employer. Your Saudi employer applies to Ministry of Human Resources & Social Development (HRSD, formerly MOHRSD) for Work Permit, then issues your iqama within 90 days of arrival. Iqama fee SAR 9,600/year (~USD 2,560) — typically paid by employer for skilled workers, by worker for some sectors.",
      },
      {
        label: "Egyptian educational certificates attested through MOFA + Saudi Embassy Cairo + Saudi MOFA",
        why: "Egyptian degree certificates need full attestation chain: 1) issuing Egyptian university stamp, 2) Ministry of Higher Education Egypt (Cairo HQ in Mounira), 3) Egyptian MOFA (Tahrir Square or Mogamma El-Tahrir or 6 October City office), 4) Saudi Embassy Cairo (Garden City, Sharia el-Sad el-Aali), 5) Saudi MOFA Riyadh on arrival. Total cost EGP 2,000-5,000 + SAR 200-400. Attestation typically 3-6 weeks. For salaries above SAR 10,000/month, HRSD checks degree-occupation fit more rigorously. Saudi has Nitaqat (Saudisation) quotas affecting Egyptian applications in certain sectors.",
      },
      {
        label: "Saudi Premium Residency (Iqama Mumayyaza) — newer route for Egyptian professionals",
        why: "Launched 2019 and expanded 2024, Saudi Premium Residency (Iqama Mumayyaza) is the Saudi equivalent of UAE Golden Visa. Permanent option SAR 800,000 (~USD 213,000) or annual option SAR 100,000 (USD 26,700). Grants: no kafil/sponsor needed, can own residential real estate, can sponsor family, full work rights in any sector, exit/re-entry without permit. Egyptian professionals earning SAR 30,000+/month or with substantial investment qualify. Apply via Premium Residency Centre online portal — separate from regular iqama path.",
      },
      {
        label: "Medical fitness test + GAMCA + Saudi-specific clearances",
        why: "Egyptians must complete GAMCA (Gulf Approved Medical Centres Association) medical at an authorised Egyptian centre before flying — chest X-ray, blood tests for HIV/Hep B/C/HIV, urine analysis. Cost EGP 1,200-2,500. On arrival in Saudi, no second medical (unlike UAE). However, Egyptians face specific extra clearances for some roles: Saudi Police Clearance (after iqama), Cultural Attaché clearance for academic/teaching roles, HRSD background check.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role, your Saudi employer, and Saudisation impact",
        prompt: "Saudi doesn't ask personal-statement narrative at consular stage (employer-led + HRSD-led). For Egyptians: Saudi employer CR (Commercial Registration) number, HRSD establishment classification (Platinum / Green / Yellow / Red — Nitaqat tier), role + salary band, specific region (Riyadh / Jeddah / Dammam / Khobar / Makkah / Madinah / Tabuk). Highlight Egyptian qualifications (Cairo University, Ain Shams, Alexandria, AUC, MUST, AAST) and prior Gulf experience.",
      },
      {
        heading: "Your Egyptian work history — TIN, social insurance, exact dates",
        prompt: "List every Egyptian employer with month-precision dates, role, salary in EGP, supervisor name. Include TIN (Egyptian Tax Authority) and Social Insurance Number from National Organisation for Social Insurance — Saudi attestation occasionally requires these. Past Gulf experience (UAE, Qatar, Kuwait, Bahrain, Oman) strengthens applications — document each contract with employer, dates, reason for leaving (including any End of Service Gratuity received).",
      },
      {
        heading: "Family + sponsorship + Egyptian school year",
        prompt: "Dependent iqama tied to your sponsorship. Threshold: SAR 4,000-6,000/month + housing allowance for spouse/children. Egyptian spouse + children carry Egyptian passports — separate attestation chain (Egyptian marriage cert + birth certs via Egyptian MOFA + Saudi Embassy Cairo) needed. Egyptian school year (September-June) timing: Egyptian schools in Saudi (Egyptian Embassy Schools in Riyadh, Jeddah, Dammam) follow Egyptian Thanawiya Amma curriculum.",
      },
      {
        heading: "Long-term plan — Premium Residency, return to Egypt, or rotation",
        prompt: "Saudi naturalisation for Egyptian workers is extremely rare (different from UAE — Saudi has occasionally granted citizenship to long-resident Egyptian professionals under Vision 2030 talent programmes, but it's exceptional). State plan: Premium Residency target (if income/investment qualifying), temporary contract with planned Egyptian return, or onward migration. Tax: Egypt taxes worldwide income for tax-resident Egyptians (>183 days/year); Saudi has no personal income tax. Plan to avoid Egyptian worldwide-income tax during transition years.",
      },
    ],
    moneySavingTips: [
      "Employer typically pays iqama fees for skilled workers — clarify at offer stage; refuse 'iqama deduction' from first salary unless clearly stated in contract",
      "Egyptian degree attestation: do all 5 steps yourself (~EGP 1,500-3,000) instead of agencies charging EGP 8,000-15,000",
      "Saudi Embassy Cairo attestation queue: book online at Saudi MOFA portal — avoids 4-6 hour in-person waits",
      "GAMCA medical at authorised Egyptian centres (e.g., El-Mokattam, Heliopolis, Mohandiseen) — EGP 1,200-2,500; standardised pricing, all centres equally accepted",
      "Open Al Rajhi, NCB-SNB, Riyad Bank, or Alinma salary account in Saudi — sponsor often gets fee waivers; Egyptian-Saudi diaspora-friendly with EGP remittance options",
      "Don't use 'mu'aqib' (chase-up) services charging SAR 1,500+ for iqama renewal — most government services are now digital via Absher app",
      "Apply for Egyptian Tax Residency Certificate if you'll be Saudi-resident >183 days/year — exempts Saudi income from Egyptian tax",
      "Premium Residency fee SAR 100,000 (annual) or SAR 800,000 (permanent) — apply yourself via Premium Residency Centre portal; don't use 'consultancies' charging SAR 30,000+ premium",
      "Use Western Union, MoneyGram, NCB QuickPay, or Tahweel Al Rajhi for remittance to Egypt — competitive rates, especially for EGP",
      "End of Service Gratuity calculation: 0.5 month salary/year for first 5 years, then 1 month/year after — keep records of all monthly basic salary (not total package) — many employers miscalculate",
    ],
    lawyerTriggers: {
      diy: [
        "Standard employer-led Work Permit + iqama + dependent iqama for spouse + children",
        "GAMCA medical, biometric, and iqama issuance (employer-facilitated)",
        "Iqama renewal via Absher app",
        "Premium Residency application via online portal",
        "End of Service Gratuity calculation upon contract end",
      ],
      getALawyer: [
        "Past Saudi 'huroob' (absconder) status — flagged in GCC databases, affects future re-entry",
        "Egyptian criminal record (military case, drugs, debt, currency violation — Saudi rigorously checks)",
        "Previous Gulf labour dispute (UAE labour ban, Qatar passport-holding case, Kuwait sponsor-side issues)",
        "Switching Saudi sponsor mid-contract — easier under 2021 Labour Law reform but edge cases benefit from lawyer (especially for non-Sunni Muslim or Coptic Egyptians where sponsor relationships can be sensitive)",
        "Coptic Christian Egyptians: religious affiliation doesn't bar work visa but documentation chain (church-issued marriage cert) needs separate attestation",
        "Family member with prior Saudi conviction or labour ban",
        "Premium Residency real estate application (residential property in sole name)",
        "Currency-control violations on prior Egyptian salary remittances back to Saudi-resident account",
        "Past Israeli passport stamp or Israeli travel history — Saudi has formalised certain travel relations under Abraham Accords framework but old stamps can complicate",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → SAUDI ARABIA — work
  // ════════════════════════════════════════════════════════════════════

  "IN:SA:work": {
    whatCarriesWeight: [
      {
        label: "Kafala-reformed Work Permit + iqama via HRSD — Indians are Saudi's largest expat group",
        why: "Indians are Saudi Arabia's largest expat community (~2.6 million), slightly ahead of Egyptians. Your Saudi employer applies to Ministry of Human Resources & Social Development (HRSD) for Work Permit, then issues your iqama within 90 days of arrival. Iqama fee SAR 9,600/year — typically paid by employer for skilled workers (white-collar, technical), often partially deducted from blue-collar workers' salaries (legally questionable but common practice). The March 2021 Labour Reform Initiative allows job switching after first contract year without sponsor NOC under most conditions — major improvement for Indians.",
      },
      {
        label: "Indian educational certificates attested via MEA Apostille + Saudi Embassy New Delhi",
        why: "Indian degree certificates need attestation chain: 1) issuing university stamp, 2) State HRD or AICTE if technical, 3) MEA Apostille (India is Hague signatory since 2005) — free or INR 50-200 via e-Sanad portal, 4) Saudi Embassy New Delhi (50-D, Shantipath, Chanakyapuri) OR Saudi Consulate General Mumbai (Hill Road, Bandra West) attestation INR 5,000-8,000, 5) Saudi MOFA on arrival. Allow 4-6 weeks. For salaries above SAR 10,000/month, HRSD checks degree-occupation fit rigorously. Saudi Vision 2030 has expanded Indian professional intake in oil, healthcare, tech, NEOM construction, and Riyadh financial sector.",
      },
      {
        label: "Saudi Nitaqat (Saudisation) classification + Indian recruitment quotas",
        why: "Saudi Nitaqat programme classifies employers by Saudisation percentage (Platinum 24%+, Green 15-23%, Yellow 6-14%, Red <6%). Yellow/Red establishments face restrictions on hiring Indians and other foreigners. Your potential employer's Nitaqat tier affects your work permit approval speed — Platinum employers (Saudi Aramco, SABIC, Maaden, STC, Riyad Bank, NCB, Saudi Telecom, ADNOC subsidiaries) get fastest processing. Indian recruitment via DGE&T-recognised agencies in Mumbai, Delhi, Chennai, Hyderabad, Kerala — POE (Protector of Emigrants) clearance required for blue-collar workers under Indian Emigration Act 1983; white-collar/professional Indian workers are exempt from POE.",
      },
      {
        label: "GAMCA medical + Indian Police Clearance + emigration documentation",
        why: "Indians must complete GAMCA (Gulf Approved Medical Centres Association) medical at authorised Indian centres before flying — chest X-ray, blood tests for HIV/Hep B/C/Syphilis/Malaria, urine analysis. Cost INR 3,500-7,500. Indian Police Clearance Certificate (PCC) from local district SP / online via passport seva portal — INR 500, 7-21 days. For blue-collar workers requiring POE clearance, additional emigration check at Indian airport — white-collar Indians on E-Mig clearance pass through without check.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role, your Saudi employer, and Nitaqat tier impact",
        prompt: "Saudi doesn't ask personal-statement narrative at consular stage (employer-led + HRSD-led). For Indians: Saudi employer CR number, HRSD Nitaqat classification, role + salary band, specific city/region (Riyadh / Jeddah / Dammam / Khobar / Makkah / Madinah / Tabuk / NEOM project area). Highlight Indian qualifications (IIT/NIT/IIIT/IIMs/BITS/NLU recognised brands; PEC/AICTE technical qualifications) and any prior Gulf experience (UAE / Qatar / Kuwait especially valuable).",
      },
      {
        heading: "Your Indian work history — PAN, EPF UAN, Aadhaar, exact dates",
        prompt: "List every Indian employer with month-precision dates, role, salary in INR, supervisor name + contact. Include PAN (Permanent Account Number), EPFO UAN (Employees Provident Fund), Aadhaar (UIDAI), and TIN — Saudi attestation occasionally requires these. Past Gulf experience: previous contracts, iqama / QID / labour-card records, End of Service Gratuity receipts. For technical/professional roles, attach PEC/MCI/PCI/ICAI/ICAEW Indian professional body membership numbers.",
      },
      {
        heading: "Family + sponsorship + Indian school year",
        prompt: "Dependent iqama tied to your sponsorship. Threshold: SAR 4,000-6,000/month + housing allowance for spouse/children. Indian spouse + children carry Indian passports — separate attestation chain (Indian state-level Notary + MEA Apostille + Saudi Embassy New Delhi) needed. Indian school year (April-March) timing: Indian schools in Saudi (International Indian School Riyadh / Jeddah / Dammam, Delhi Public School Jeddah, Embassy of India schools) follow CBSE curriculum.",
      },
      {
        heading: "Long-term plan — Premium Residency, return to India, or onward migration",
        prompt: "Saudi naturalisation for Indian workers is extremely rare (different from UAE Golden Visa — Saudi has Premium Residency Iqama Mumayyaza programme). State plan: Premium Residency target (SAR 100,000/year or SAR 800,000 permanent option), temporary contract with planned India return, or onward migration (Saudi-based Indians often progress to Canada / UK / Australia / US later). Indian tax: tax-resident if you maintain Indian assets / dependants + spend >182 days; Saudi has no personal income tax. Plan to avoid Indian global-income tax during transition years.",
      },
    ],
    moneySavingTips: [
      "Employer typically pays iqama fees for skilled / professional workers — clarify at offer stage; refuse 'iqama deduction' unless clearly stated in contract; for blue-collar, ICAEW labour-rights advice recommended",
      "Indian degree attestation via MEA e-Sanad portal: INR 50-200/document direct (Hague Apostille route)",
      "Saudi Embassy New Delhi attestation: INR 5,000-8,000/document at counter — don't use 'attestation services' charging INR 15,000+",
      "GAMCA medical at authorised Indian centres (Mumbai, Delhi, Chennai, Kolkata, Hyderabad, Bangalore, Kochi): INR 3,500-7,500 — standardised pricing, all GAMCA centres equally accepted",
      "Open Al Rajhi, SNB (Saudi National Bank, formerly NCB+Samba), Riyad Bank, or Alinma salary account in Saudi — Indian diaspora-friendly with INR remittance discounts",
      "Don't use 'mu'aqib' (chase-up agents) for iqama renewal — Absher app handles most government services digitally",
      "Apply for Indian Tax Residency Certificate at Income Tax Department if you'll be Saudi-resident >183 days/year — exempts Saudi income from Indian global-income tax",
      "Premium Residency fee SAR 100,000 (annual) or SAR 800,000 (permanent) — apply via Premium Residency Centre portal direct; consultancies charge SAR 30,000+ premium",
      "Use Western Union, MoneyGram, Al Rajhi Tahweel, NCB QuickPay, or Wise for remittance to India — competitive rates; RBI's LRS allows USD 250,000/year outbound from India",
      "End of Service Gratuity calculation: 0.5 month salary/year for first 5 years, then 1 month/year after — keep records of basic salary (not total package) to dispute miscalculations",
      "Use POE-exempt status: for emigration-check-not-required (ECNR) passport holders (white-collar / professionals), no Indian airport emigration check needed — speeds departure",
    ],
    lawyerTriggers: {
      diy: [
        "Standard employer-led Work Permit + iqama + dependent iqama for spouse + children",
        "GAMCA medical + biometric + iqama issuance (employer-facilitated)",
        "Iqama renewal via Absher app",
        "Premium Residency application via online portal",
        "End of Service Gratuity calculation upon contract end",
        "POE clearance for blue-collar emigration check (Indian side)",
      ],
      getALawyer: [
        "Past Saudi 'huroob' (absconder) status — flagged in GCC databases",
        "Indian criminal record (NDPS narcotics, dowry, dowry death, communal cases, criminal breach of trust — Saudi rigorously checks)",
        "Previous Gulf labour dispute (UAE labour ban, Qatar passport-holding, Kuwait recruiter-side issues)",
        "Switching Saudi sponsor mid-contract — easier under 2021 Labour Reform Initiative but edge cases benefit from lawyer",
        "POE clearance dispute for blue-collar Indian workers (illegal recruitment, fake offer letter cases)",
        "Family member with prior Saudi conviction or labour ban",
        "Premium Residency real estate application (residential property in sole name)",
        "Indian PAN/Aadhaar-based ITR delinquency — Saudi iqama renewal can be affected if Indian tax authorities flag Section 195 TDS issues",
        "Dual Indian-OCI status of spouse complicating dependent iqama documentation",
        "Past Saudi non-Muslim religious activity flag (Christian, Hindu, Sikh — Saudi forbids public non-Muslim worship; some Indian diaspora gatherings have been flagged)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // CANADIAN → UK — work
  // ════════════════════════════════════════════════════════════════════

  "CA:GB:work": {
    whatCarriesWeight: [
      {
        label: "Skilled Worker visa OR Youth Mobility Scheme OR UK Ancestry — Canadians have multiple routes",
        why: "Canadians have unusually rich UK options. Standard Skilled Worker (sponsor licence + £38,700 general threshold from April 2024, £29,000 for Health & Care Worker / shortage). Youth Mobility Scheme — Canadians 18-35 (extended from 30 in 2024), 3-year visa (extended from 2), no sponsor needed, ballot system at the start of each year. UK Ancestry — UK-born grandparent, 5-year visa, full work rights, no sponsor, route to ILR (popular for English / Scottish / Welsh / Northern Irish heritage Canadians).",
      },
      {
        label: "Certificate of Sponsorship + RCIC vs OISC immigration adviser comparison",
        why: "For Skilled Worker visa your UK employer must hold sponsor licence (check on gov.uk register). Tech (Revolut, Wise, DeepMind, ARM, Monzo, Starling, Octopus Energy), finance (HSBC, Barclays, Lloyds, NatWest, Standard Chartered), NHS Trusts, and consultancies (Big Four, MBB, top law firms) actively recruit Canadians. RCIC (Canadian Immigration Consultant) cannot represent on UK matters; you need an OISC-regulated adviser or a solicitor regulated by SRA / Law Society Scotland / Law Society Northern Ireland.",
      },
      {
        label: "WES / ECCTIS Statement of Comparability + Canadian degree mapping",
        why: "Canadian degrees are recognised by UK ECCTIS (formerly UK NARIC) — get a Statement of Comparability for your BSc/BA/professional designation (~£140, 15 working days). Most Canadian Bachelor's (3-year and 4-year) map to UK Level 6; honours mapping varies by institution. For regulated professions: NMC (nurses, OSCE/CBT route), GMC (doctors, PLAB or MTR via College of Physicians Canada), Law Society (solicitor qualifying via SQE — Canadian common-law lawyers have streamlined route under QLTS replaced by SQE since 2021), ICAEW / ACA for accountants.",
      },
      {
        label: "Canadian Police Certificate + UK TB test exemption",
        why: "Canada is on the UK 'no TB test' country list — no TB clearance needed. Canadian Police Certificate from RCMP (Royal Canadian Mounted Police) Civil Fingerprinting Service — CAD$60-100, 60-120 working days. Several Canadian fingerprinting agencies (Commissionaires, Industrial Security Centres) can fingerprint and ship to RCMP — choose accredited only. Provincial criminal record checks insufficient for UK Home Office — must be RCMP federal-level.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route choice — Skilled Worker, YMS, or UK Ancestry",
        prompt: "Canadians have multiple routes — state explicitly which: Skilled Worker (sponsor needed, longer-term, route to ILR after 5 years), Youth Mobility Scheme (no sponsor, 3 years post-2024, ballot January annually), UK Ancestry (UK-born grandparent, 5 years, no sponsor, route to ILR), HPI (High Potential Individual if your degree is from one of top-50 world universities — UofT, McGill, UBC, McMaster, Alberta, Western, Waterloo have qualified previously). Show research — picking right route is half the application.",
      },
      {
        heading: "Your Canadian work history — verifiable",
        prompt: "List every Canadian employer chronologically with month-precision dates, role, salary in CAD, supervisor name + contact. Include any Canadian professional designations: P.Eng (EGBC, PEO, APEGA), CPA, CFA, MD, LLB/JD + bar admission (Ontario, BC, Quebec, etc.), RN. Canadian universities (UofT, UBC, McGill, Waterloo, McMaster, Queen's, Western, Alberta) are well-known to UK Home Office — they don't need much explanation.",
      },
      {
        heading: "Family + 'plan' — including UK Ancestry angle",
        prompt: "If you have UK-born ancestry (grandparent born in England / Scotland / Wales / Northern Ireland — Ireland post-1922 doesn't count, ROI pre-1922 also doesn't count), mention it even if not applying via Ancestry route. Document Canadian residence (provincial driver's licence, lease, mortgage, Canadian property), planned UK housing (London / Manchester / Edinburgh / Bristol / Glasgow), and integration plan. Many Canadians use UK as 2-3 year temporary stay then return — that's fine for Skilled Worker, YMS, and even Ancestry visas.",
      },
      {
        heading: "Long-term plan — ILR, dual citizenship, or temporary",
        prompt: "Skilled Worker / Health & Care Worker / UK Ancestry are 5-year routes to ILR. Canada permits dual citizenship with UK; UK permits dual citizenship. Most Canadians who naturalise British retain Canadian citizenship without issue. Mention Life in the UK test + B1 English (most Canadians are at C1/native English from school).",
      },
    ],
    moneySavingTips: [
      "UK Ancestry Visa has NO sponsor requirement (saves SOC wage scrutiny entirely) — if you have a UK-born grandparent, almost always the best route at £637 + IHS £1,035/year (or £776/year student rate if studying alongside)",
      "Youth Mobility Scheme: Canadians 18-35 qualify post-2024; ballot is competitive (~10,000 places vs ~50,000 applicants); £298 fee + IHS; NO sponsor needed, 3-year stay (post-2024), route to switch into Skilled Worker after gaining UK experience",
      "Health & Care Worker visa is IHS-exempt (saves £5,175 over 5 years per applicant)",
      "RCMP Police Certificate: CAD$60-100 if you go to a fingerprinting agency yourself; consultant agencies charge CAD$300+; allow 60-120 working days",
      "ECCTIS Statement of Comparability £140 standard / £210 urgent (5-day) — order early, avoid rush price",
      "Don't use 'RCIC + UK partner' agencies charging CAD$5,000+ — RCIC have NO authority on UK matters; use OISC-regulated UK adviser directly (around £1,500-3,000 for full Skilled Worker process), or DIY if straightforward",
      "Open Wise GBP, Revolut UK, Monzo, Starling Bank UK accounts before flying — most accept Canadian passport with Canadian address pre-arrival",
      "UK-Canada tax treaty (1978, protocol 2014) preserves RRSP tax deferral while UK-resident; consult both UK and Canadian tax advisers re ISA/TFSA equivalence (TFSA is NOT tax-free in UK; ISA contributions don't get Canadian tax relief)",
      "Negotiate UK relocation package — typically £3,000-£8,000 for Canadian hires given higher logistics + airfare cost vs EU hires",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Skilled Worker / Health & Care Worker visa with NHS Trust / named UK employer CoS",
        "UK Ancestry Visa with UK-born grandparent (clear documentary chain — civil registration birth certificate)",
        "Youth Mobility Scheme ballot win (process is straightforward — IHS + fee + biometric)",
        "Dependent visa applications (spouse + children) concurrent with main applicant",
        "ILR after 5 years continuous qualifying residence",
        "HPI visa from top-50 university Canadian degree",
      ],
      getALawyer: [
        "Past UK visa refusal",
        "Past UK overstay or removal",
        "Canadian criminal record (even minor, even dismissed under Criminal Records Act records suspension)",
        "UK Ancestry application where grandparent's birth was in Republic of Ireland post-1922 (does NOT count; pre-1922 also doesn't count)",
        "Dual Canadian-other non-Commonwealth passport (visa application from wrong passport)",
        "Bringing 18+ dependent or adult dependent relative",
        "HPI visa where university ranking dropped off eligible list since you graduated — eligibility uses ranking from graduation year",
        "Past US visa refusal flagged on Five Eyes database affecting UK application",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AUSTRALIAN → UK — work
  // ════════════════════════════════════════════════════════════════════

  "AU:GB:work": {
    whatCarriesWeight: [
      {
        label: "Skilled Worker / Health and Care Worker visa OR Youth Mobility Scheme OR UK Ancestry",
        why: "Australians have multiple UK routes. Standard Skilled Worker (sponsor licence + £38,700 general / £29,000 Health & Care / £30,960 New Entrant from April 2024). Youth Mobility Scheme — Australians 18-35 (extended from 30 in 2024), 3-year visa (extended from 2), no sponsor needed, ballot replaced by direct grant in 2024 for Australians (35,000 places annually). UK Ancestry — UK-born grandparent, 5-year visa, full work rights, no sponsor, route to ILR (very popular — large Australian populace has British heritage).",
      },
      {
        label: "Certificate of Sponsorship + Australian degree recognition (mostly seamless)",
        why: "For Skilled Worker your UK sponsor must hold a sponsor licence. Australian Big 4 banks (ANZ, NAB, CommBank, Westpac), tech (Atlassian London, Canva London, Afterpay/Block London), NHS Trusts (Australian doctors and nurses on shortage occupation list), and Australian consultancies with UK presence (PwC, Deloitte, KPMG, EY, McKinsey, BCG, Bain) actively transfer Australians. Australian degrees from Group of Eight (Melbourne, ANU, Sydney, UNSW, Monash, UQ, UWA, Adelaide) and most other Australian universities are well-known to UK Home Office — Bachelor (3 or 4-year) maps to UK Level 6; Honours / Masters straightforward.",
      },
      {
        label: "ECCTIS optional for unregulated; required for regulated professions",
        why: "ECCTIS Statement of Comparability (~£140, 15 working days) only needed for regulated professions in UK. For nursing: NMC OSCE/CBT (Australian RNs qualify via direct route in 2024 — APR Code Practice). For doctors: GMC PLAB or MTR via Royal Australian College — Australian medical degrees are well-recognised; specialist registration via CCT-equivalent route. For solicitors: SQE (replaced QLTS in 2021) — Australian lawyers have streamlined route. For chartered accountants: ICAEW / ACCA — Australian CAs have streamlined entry via mutual recognition.",
      },
      {
        label: "Australian Federal Police check + UK TB test exemption",
        why: "Australia is on the UK 'no TB test' country list — no TB clearance needed. Australian Federal Police National Police Check — AUD$42-65 via afp.gov.au online portal, 10-15 working days. Provincial / State Police Check (NSW Police, VicPol, QPS) is insufficient for UK Home Office — must be AFP federal-level (Code: National Police Check Code 33 - Visa Australia for UK).",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route choice — Skilled Worker, YMS, or UK Ancestry",
        prompt: "Australians have multiple routes — state explicitly which: Skilled Worker (sponsor needed, route to ILR after 5 years), Youth Mobility Scheme (no sponsor, 3 years post-2024, direct grant 35,000/year for Australians — no ballot anymore), UK Ancestry (UK-born grandparent, 5 years, route to ILR), HPI (High Potential Individual from top-50 university — Melbourne, ANU, Sydney, UNSW, Monash, UQ have qualified previously). Show research — picking the right route is half the application.",
      },
      {
        heading: "Your Australian work history — verifiable",
        prompt: "List every Australian employer chronologically with month-precision dates, role, salary in AUD, supervisor name + contact. Include any Australian professional designations: CPA (CPA Australia), CA (CAANZ), RN (AHPRA-NMBA), MD (AHPRA-MBA), Lawyer (LPA admission), Engineer (Engineers Australia), Surveyor, Architect. Australian universities are well-known to UK Home Office.",
      },
      {
        heading: "Family + 'plan' — including UK Ancestry angle",
        prompt: "If you have UK-born ancestry (grandparent born in England / Scotland / Wales / Northern Ireland — Ireland post-1922 doesn't count), mention it even if not applying via Ancestry route. Australian-British heritage is common — over 1 million Australians have UK-born grandparent eligible. Document Australian residence (state driver's licence, lease, mortgage, Australian property), planned UK housing, integration plan. Many Australians use UK as 'gap year' / 2-3 year temporary stay then return — fine for Skilled Worker / YMS / Ancestry.",
      },
      {
        heading: "Long-term plan — ILR, dual citizenship, or temporary",
        prompt: "Skilled Worker / Health & Care Worker / UK Ancestry are 5-year routes to ILR. Australia permits dual citizenship with UK; UK permits dual citizenship. Most Australians who naturalise British retain Australian citizenship. Mention Life in the UK test + B1 English (most Australians are at C1/native English).",
      },
    ],
    moneySavingTips: [
      "UK Ancestry Visa has NO sponsor requirement — if you have a UK-born grandparent, almost always best route at £637 + IHS £1,035/year (or £776/year student rate)",
      "Youth Mobility Scheme: Australians 18-35 qualify post-2024; DIRECT GRANT (no ballot) — 35,000 places/year; £298 fee + IHS; NO sponsor needed, 3-year stay (post-2024), route to switch into Skilled Worker after gaining UK experience",
      "Health & Care Worker visa is IHS-exempt (saves £5,175 over 5 years per applicant) — NHS Trusts also offer £25,000 relocation bonus",
      "AFP National Police Check: AUD$42-65 direct via afp.gov.au; consultant agencies charge AUD$200+ for no extra value",
      "ECCTIS Statement of Comparability £140 standard / £210 urgent (5-day) — order early; many unregulated UK roles don't require it at all",
      "Don't use 'MARA + UK partner' agencies charging AUD$5,000+ — MARA agents have NO authority on UK matters; use OISC-regulated UK adviser directly (around £1,500-3,000 for full Skilled Worker process)",
      "Open Wise GBP, Revolut UK, Monzo, Starling Bank UK accounts before flying — most accept Australian passport + Australian address pre-arrival",
      "UK-Australia tax treaty (2003) preserves super tax deferral while UK-resident (with caveats; consult both tax advisers); ISA vs Super are not directly comparable for tax purposes",
      "QROPS pension transfer from UK to Australian super: complex — wait for ILR/UK citizenship before transferring; HMRC has specific overseas pension scheme requirements",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Skilled Worker / Health & Care Worker visa with NHS Trust / named UK employer CoS",
        "UK Ancestry Visa with UK-born grandparent (clear civil registration documents)",
        "Youth Mobility Scheme direct-grant (post-2024 process — no ballot)",
        "Dependent visa applications concurrent with main applicant",
        "ILR after 5 years continuous qualifying residence",
        "HPI visa from Group of Eight or top-50 university degree",
      ],
      getALawyer: [
        "Past UK visa refusal",
        "Past UK overstay or removal",
        "Australian criminal record (even spent / suspended under Spent Convictions Scheme)",
        "UK Ancestry application where grandparent's birth was in Republic of Ireland post-1922",
        "Dual Australian-other non-Commonwealth passport (visa application from wrong passport)",
        "Bringing 18+ dependent or adult dependent relative",
        "HPI visa where university ranking dropped off eligible list since you graduated",
        "Past Five Eyes visa refusal flagged on UKVI database",
        "QROPS-related complex pension transfer needing UK-AU coordination",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // NEPALESE → UK — work
  // ════════════════════════════════════════════════════════════════════

  "NP:GB:work": {
    whatCarriesWeight: [
      {
        label: "Certificate of Sponsorship + Gurkha veteran route OR standard Skilled Worker",
        why: "Nepalese have a unique UK pathway: Gurkha veterans (and their immediate family) who retired from Brigade of Gurkhas after 1 July 1997 qualify under the Tribunal Service of UK Borders Agency Gurkha Settlement scheme — settled status route, with families. For non-Gurkha Nepalese, standard Skilled Worker visa applies: £38,700 general threshold OR £29,000 for Health & Care Worker / shortage list. Nepalese nurses, healthcare workers, hospitality staff, and IT professionals are increasingly recruited; care sector recruitment from Nepal has expanded since 2022.",
      },
      {
        label: "Nepali educational certificates + Tribhuvan University / Kathmandu University verification",
        why: "Nepali SLC / SEE (10-grade), +2 (12-grade), and Bachelor / Master / Doctorate degrees from Tribhuvan University (largest Nepali university), Kathmandu University, Pokhara University, Purbanchal University, Mid-Western University, Far-Western University, Lumbini Buddhist University, Agriculture and Forestry University need: 1) issuing institution certificate, 2) MOE (Ministry of Education) attestation in Kathmandu, 3) Nepali MOFA attestation, 4) UK ECCTIS Statement of Comparability (£140 standard, £210 urgent 5-day). Most Nepali Bachelor's degrees (3 or 4-year) map to UK Level 6.",
      },
      {
        label: "TB clearance at IOM Kathmandu + Nepal Police Clearance",
        why: "All Nepalese applying for UK Student / Skilled Worker / Family visa for 6+ months need TB clearance from IOM Kathmandu (Tahachal Marg, just below Kalimati) — NPR 7,500-9,500, valid 6 months. Nepal Police Clearance from local district police via online portal (NPR 100-300, 7-21 days) — required for UK Home Office. For every country you've spent 6+ months in (including Gulf states, India, Malaysia, Korea for Nepali workers), additional police certificate required.",
      },
      {
        label: "IELTS UKVI / OET + £1,270 maintenance funds",
        why: "UK Skilled Worker visa requires IELTS UKVI Academic 4.0+ minimum (B1 CEFR) OR PTE Academic UKVI / Cambridge English Advanced / IELTS Life Skills B1. For NMC nursing registration: OET / IELTS 7.0 minimum. Test at British Council Kathmandu (Lainchaur), Pokhara, or IDP centres in Kathmandu. £1,270 maintenance must be held 28 consecutive days in your or sponsor's name (or employer A-rated cover). Nepali bank statements (Nepal Bank, Rastriya Banijya Bank, Himalayan Bank, Standard Chartered Nepal, Everest Bank, Nepal Investment Mega Bank).",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route choice — Gurkha, Skilled Worker, or Health & Care Worker",
        prompt: "If you are a Gurkha veteran or family member, state the Gurkha route explicitly — different documentation chain (military service record, discharge certificate from Brigade of Gurkhas, family relationship documents). For non-Gurkha applicants, state Skilled Worker vs Health & Care Worker route based on your role. Highlight specific UK employer, NHS Trust, or care provider, and your specific role + SOC code mapping.",
      },
      {
        heading: "Your Nepali work history — exact, verifiable, professional body numbers",
        prompt: "List every Nepali employer with month-precision dates, role, salary in NPR, supervisor name + contact (mobile + email). Include any Nepali professional body registrations: Nepal Medical Council (doctors), Nepal Nursing Council (nurses), Nepal Engineering Council (engineers), ICAN (chartered accountants). UK cross-checks these registers. Document past Gulf experience: Saudi, Qatar, UAE, Malaysia, Korea contracts are common for Nepali workers — attach Iqama / QID / labour-card records.",
      },
      {
        heading: "Maintenance funds + family plan",
        prompt: "Skilled Worker requires £1,270 maintenance OR employer A-rated cover certificate. For Health & Care Worker the £1,270 is usually waived. Document NPR source-of-funds: Nepal Bank, RBB, NIC Asia, Himalayan Bank, Standard Chartered Nepal, NMB Bank, Everest, Civil Bank. Dependent visa for spouse + each child <18 adds £285/£315 maintenance. For Gurkha-route family reunification, different financial requirements apply — primary residence and pension considerations.",
      },
      {
        heading: "Future plan — ILR settlement or temporary",
        prompt: "Skilled Worker visa is a 5-year route to ILR. State your settlement plan including Life in the UK test prep and B1 English. Gurkha route is direct settlement (ILR from grant) for veteran + immediate family. If you want to return to Nepal after fixed period, state openly — Skilled Worker doesn't require settlement intent. Mention any UK family (Nepali Gurkha diaspora is concentrated in Aldershot / Folkestone / Kent / South London; non-Gurkha Nepali community in Reading / Birmingham / Manchester) but note: family are not 'maintenance providers' unless legally sponsoring.",
      },
    ],
    moneySavingTips: [
      "Health & Care Worker visa is IHS-exempt (saves £5,175 over 5 years) — NHS Trusts also offer £2,000-5,000 relocation bonus for international hires",
      "Gurkha veterans: settlement application is free under Tribunal Service Gurkha settlement scheme — don't pay 'Gurkha advisors' charging NPR 500,000+; Gurkha Welfare Society (gurkha.org.uk) and British Gurkha Welfare Council provide free advice",
      "British Council Kathmandu for IELTS UKVI: NPR 22,000-25,000; multi-attempt packages available",
      "ECCTIS Statement of Comparability £140 standard / £210 urgent (5-day) — order early to avoid rush price",
      "Apply for Police Clearance online at Nepal Police portal — NPR 100-300; don't pay agents NPR 5,000+",
      "IOM Kathmandu TB test: book early — slot availability is the bottleneck; NHS Trusts pre-pay IOM fees for some recruitment programmes",
      "Avoid Nepali 'visa agents' charging NPR 300,000-1,500,000 — UK Home Office is the only fee-charging party; your UK employer's HR handles CoS at no cost to you",
      "Family in UK can act as your sponsor for £1,270 maintenance via signed Undertaking from named UK citizen / settled person — common in Gurkha diaspora communities",
      "Open Wise GBP, Revolut UK, Monzo account before flying — most accept Nepali passport with UK CoS letter pre-arrival",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Skilled Worker / Health & Care Worker visa with NHS Trust / named UK employer CoS",
        "Gurkha veteran settlement application via Tribunal Service Gurkha scheme",
        "Dependent visa applications concurrent with main applicant",
        "ILR after 5 years continuous qualifying residence",
        "Switching between sponsored employers within UK",
      ],
      getALawyer: [
        "Prior UK visa refusal (study, visit, work)",
        "Care sector role with sponsor under CQC investigation / recent licence revocation (2024 affected Nepalese care workers)",
        "Past UK overstay or removal",
        "Nepali criminal record (even minor — disclosure to Home Office mandatory)",
        "Bringing 18+ dependent or adult dependent relative",
        "Maoist insurgency-era political affiliation history (2006-2008 conflict period)",
        "Past Gulf state work history (KSA, UAE, Qatar) with kafala-system disputes / overstay flags",
        "Gurkha veteran with complex family reunification including non-immediate family (siblings, adult children) — Tribunal Service rules need careful navigation",
        "Indian-Nepali border issue affecting documentation (Madhesi community origin documents)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // SRI LANKAN → UK — work
  // ════════════════════════════════════════════════════════════════════

  "LK:GB:work": {
    whatCarriesWeight: [
      {
        label: "Certificate of Sponsorship + Skilled Worker vs Health and Care Worker",
        why: "Sri Lankans enter through Skilled Worker (£38,700 general from April 2024, £29,000 Health & Care Worker / shortage, £30,960 New Entrant). Sri Lankan nurses, doctors, IT engineers, hospitality professionals, and accountants are well-recruited by UK. NHS Trusts, CQC-registered care providers, and tech employers (Revolut, Wise, Monzo, ARM Cambridge) actively hire Sri Lankans. Sri Lanka has strong English-medium education tradition, giving applicants linguistic advantage.",
      },
      {
        label: "University of Colombo / Sri Lankan university transcripts + ECCTIS evaluation",
        why: "Sri Lankan G.C.E. O/L (Ordinary Level), G.C.E. A/L (Advanced Level), and Bachelor / Master / Doctorate degrees from University of Colombo, University of Peradeniya, University of Sri Jayewardenepura, University of Moratuwa (tech), University of Kelaniya, Open University of Sri Lanka, SLIIT, NSBM, IIT, NIBM — need: 1) issuing university stamp, 2) Sri Lankan UGC (University Grants Commission) attestation if local, 3) Sri Lankan MFA attestation, 4) UK ECCTIS Statement of Comparability (£140 standard, £210 urgent). Sri Lankan 3-year Bachelor's typically maps to UK Level 6.",
      },
      {
        label: "Sri Lankan Police Clearance + UK TB test at IOM Colombo",
        why: "Sri Lankan Police Clearance from Police Headquarters Colombo or via online portal (LKR 500-1,000, 14-30 days). UK TB clearance at IOM Colombo (Bauddhaloka Mawatha) — LKR 10,000-15,000, valid 6 months. For every country you've spent 6+ months in (Middle East common for Sri Lankans — Saudi, UAE, Qatar, Kuwait, Oman, Maldives), additional police certificate required.",
      },
      {
        label: "Income proof + £1,270 maintenance + dependent considerations",
        why: "Skilled Worker requires £1,270 maintenance held 28 consecutive days. For Health & Care Worker, £1,270 waived if employer certifies cover. Document via Sri Lankan banks: Bank of Ceylon, People's Bank, Commercial Bank of Ceylon, Hatton National, Sampath Bank, DFCC Bank. The LKR/GBP rate experienced significant volatility during the 2022 economic crisis — show equivalent of £1,500-£2,000 to provide buffer. Each dependent adds £285/£315 maintenance.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role + why UK employer chose you",
        prompt: "UK Home Office scrutinises Sri Lankan applications — be specific: how you found the role (UK-Sri Lanka recruitment partnership, NHS Trust direct, Sri Lankan diaspora referral, online job board), what makes you the right fit. Name the Trust, the team, the line manager. 'General nursing in the UK' fails; 'Band 5 staff nurse, paediatric ward, [named NHS Trust]' passes. Sri Lankan English-medium education gives you advantage — leverage it.",
      },
      {
        heading: "Sri Lankan work history — SLMC/SLNC/CSSL numbers, exact dates",
        prompt: "List every Sri Lankan employer (Asiri Hospital Group, Nawaloka, Lanka Hospitals, Hemas Hospitals, Durdans Hospital, Commercial Bank, NTB, Sampath, DFCC, John Keells, Hayleys, Hatton National, named NGO, named pharma) with month-precision dates, role, salary in LKR, supervisor + contact. Include professional body registrations: SLMC (Sri Lanka Medical Council), Sri Lanka Nursing Council, CSSL (Computer Society of Sri Lanka), CA Sri Lanka (chartered accountants), IESL (Institution of Engineers Sri Lanka). UK cross-checks these registers.",
      },
      {
        heading: "Maintenance funds + family plan",
        prompt: "Skilled Worker £1,270 maintenance OR employer A-rated cover. For Health & Care Worker the £1,270 is typically waived. Document Sri Lankan bank statements (BoC, People's, ComBank, NTB, HNB, Sampath, DFCC) with NIC (National Identity Card) number. Dependent visa for spouse + children <18 adds £285/£315 per dependent. Sri Lanka has large UK diaspora — family in London, Reading, Manchester, Birmingham can support but cannot substitute for required maintenance.",
      },
      {
        heading: "Future plan — ILR or return",
        prompt: "Skilled Worker is 5-year route to ILR. State settlement plan with Life in the UK test prep + B1 English (most Sri Lankan professionals are at C1/native English from medium-of-instruction). If you want to return after fixed period, state openly — Skilled Worker doesn't require settlement intent. UK Sri Lankan diaspora is large; integration story is straightforward.",
      },
    ],
    moneySavingTips: [
      "Health & Care Worker visa is IHS-exempt (saves £5,175 over 5 years) — NHS Trusts also offer £2,000-5,000 relocation bonus",
      "British Council Colombo for IELTS UKVI: LKR 35,000-45,000; multi-attempt packages available",
      "ECCTIS Statement of Comparability £140 standard / £210 urgent (5-day)",
      "Police Clearance via online portal at police.lk: LKR 500-1,000; don't pay agents LKR 5,000+",
      "IOM Colombo TB test: book early; NHS Trusts pre-pay IOM fees for some recruitment programmes",
      "Avoid Sri Lankan 'visa agents' charging LKR 300,000-1,000,000 — UK Home Office is the only fee-charging party",
      "Family in UK can act as your sponsor for £1,270 maintenance via signed Undertaking from named UK citizen / settled person",
      "Open Wise GBP, Revolut UK, Monzo before flying — most accept Sri Lankan passport with UK CoS pre-arrival",
      "Use Wise LKR/GBP, MoneyGram, or LankaPay for remittance back to Sri Lanka — competitive vs ComBank international transfer",
      "Sri Lankan tax: if you're tax-resident (>183 days/year in Sri Lanka), worldwide income taxable; UK earnings exempt under DTAA — file Sri Lankan tax return as non-resident once UK-resident",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Skilled Worker / Health & Care Worker visa with NHS Trust / named UK employer CoS",
        "Dependent visa applications concurrent with main applicant",
        "ILR after 5 years continuous qualifying residence",
        "Switching between sponsored employers within UK",
      ],
      getALawyer: [
        "Prior UK visa refusal (study, visit, work)",
        "Care sector role with sponsor under CQC investigation / recent licence revocation",
        "Past UK overstay or removal",
        "Sri Lankan criminal record (even minor — disclosure to Home Office mandatory)",
        "Bringing 18+ dependent or adult dependent relative",
        "LTTE-era political affiliation history (2009 civil war end period) — even peripheral connection (family member, geographic origin in Jaffna / Vanni / Mullaitivu) can trigger questions",
        "Past Gulf state work history (KSA, UAE, Qatar, Kuwait, Oman) with kafala-system disputes / overstay flags",
        "Tamil-Sinhala communal violence-related family member history",
        "Buddhist monk family member with prior political exposure",
        "Past UK Tier 4 student visa during 2010-2015 era with TOEIC fraud allegation (mass scandal affecting Sri Lankans)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // GHANAIAN → UK — work
  // ════════════════════════════════════════════════════════════════════

  "GH:GB:work": {
    whatCarriesWeight: [
      {
        label: "Certificate of Sponsorship + Skilled Worker vs Health and Care Worker",
        why: "Ghanaians enter through Skilled Worker (£38,700 general from April 2024) or Health & Care Worker (£29,000, IHS-exempt). Ghanaian nurses (NMC OSCE/CBT route), doctors (GMC PLAB), care workers, IT professionals, and finance roles dominate UK Ghanaian recruitment. The 2024 care-sector tightening means individual care providers can no longer sponsor — only larger CQC-registered groups. Ghana has strong English-medium education and Commonwealth heritage, both advantages.",
      },
      {
        label: "WAEC/Ghanaian degree certificates + ECCTIS Statement of Comparability",
        why: "Ghanaian WASSCE (West African Senior School Certificate Examination — successor to WAEC O/L A/L) and Bachelor / Master / Doctorate degrees from University of Ghana (Legon), KNUST (Kumasi), University of Cape Coast, GIMPA, Ashesi, Central University — need: 1) issuing university stamp, 2) NAB (National Accreditation Board) Ghana attestation, 3) Ghanaian MOFA attestation, 4) UK ECCTIS Statement of Comparability (£140 standard, £210 urgent). Ghanaian 4-year Bachelor's typically maps to UK Level 6.",
      },
      {
        label: "Ghana Police Service Certificate + UK TB test at IOM Accra",
        why: "Ghana Police Service Certificate from CID Headquarters Accra or via online portal (GHS 50-200, 14-30 days). UK TB clearance from IOM Accra (Lampten Avenue) — GHS 700-1,200, valid 6 months. For every country you've spent 6+ months in, additional police certificate required.",
      },
      {
        label: "Income proof + £1,270 maintenance",
        why: "Skilled Worker requires £1,270 maintenance held 28 consecutive days. For Health & Care Worker, £1,270 typically waived. Document via Ghanaian banks: Ghana Commercial Bank (GCB), Ecobank Ghana, Stanbic Bank Ghana, Zenith Bank Ghana, Absa Ghana, Standard Chartered Ghana, Fidelity Bank, Republic Bank. GHS/GBP volatility means hold equivalent of £1,500-£2,000 buffer. Each dependent adds £285/£315 maintenance.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role + why UK employer chose you",
        prompt: "UK Home Office scrutinises Ghanaian applications. Be specific: how you found the role, what makes you the right fit, your salary level vs going rate for SOC code. Name the Trust, team, line manager. 'General nursing in the UK' fails; 'Band 5 staff nurse, A&E, [named NHS Trust]' passes. Ghana's English-medium education gives advantage — leverage it.",
      },
      {
        heading: "Ghanaian work history — NMC GH / GMA / GIBA / ICAG / IES numbers, exact dates",
        prompt: "List every Ghanaian employer with month-precision dates, role, salary in GHS, supervisor + contact. Include professional body registrations: Nursing and Midwifery Council Ghana, Ghana Medical Association, GIBA (Ghana Institute of Bankers), ICAG (Institute of Chartered Accountants Ghana), GhIE (Ghana Institution of Engineers). UK cross-checks these registers.",
      },
      {
        heading: "Maintenance funds + family plan",
        prompt: "Skilled Worker £1,270 maintenance OR employer A-rated cover. Document Ghanaian bank statements with Ghana Card (national ID) number. Dependent visa for spouse + children <18 adds £285/£315 per dependent. Ghanaian UK diaspora is large — family in London (Tottenham, Croydon, Stratford, Lewisham), Manchester, Reading can support but cannot substitute required maintenance.",
      },
      {
        heading: "Future plan — ILR or return",
        prompt: "Skilled Worker is 5-year route to ILR. State settlement plan with Life in the UK test + B1 English (most Ghanaian professionals are at C1/native English). If you want to return after fixed period, state openly. UK Ghanaian diaspora is large; integration narrative straightforward.",
      },
    ],
    moneySavingTips: [
      "Health & Care Worker visa is IHS-exempt (saves £5,175 over 5 years)",
      "British Council Accra for IELTS UKVI: GHS 1,950-2,300",
      "ECCTIS Statement of Comparability £140 standard / £210 urgent (5-day)",
      "Police Certificate via online portal: GHS 50-200; don't pay agents GHS 2,000+",
      "IOM Accra TB test: book early; NHS Trusts may pre-pay IOM fees",
      "Avoid Ghanaian 'visa agents' charging GHS 30,000-100,000 — Home Office is the only fee-charging party",
      "Family in UK can act as sponsor for £1,270 maintenance via signed Undertaking",
      "Open Wise GBP, Revolut UK, Monzo before flying",
      "Use Wise GHS/GBP, World Remit, or LemFi for remittance — competitive vs Ecobank international transfer",
      "Ghana tax: if you're tax-resident (>183 days/year), worldwide income taxable; UK earnings exempt under Ghana-UK DTAA",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Skilled Worker / Health & Care Worker visa with NHS Trust / named UK employer CoS",
        "Dependent visa applications concurrent with main applicant",
        "ILR after 5 years continuous qualifying residence",
        "Switching between sponsored employers within UK",
      ],
      getALawyer: [
        "Prior UK visa refusal (study, visit, work)",
        "Care sector role with sponsor under CQC investigation / recent licence revocation",
        "Past UK overstay or removal",
        "Ghanaian criminal record (even minor — disclosure mandatory)",
        "Bringing 18+ dependent or adult dependent relative",
        "Past Gulf state work history (KSA, UAE, Qatar, Lebanon) with kafala-system disputes",
        "Family member with prior UK asylum claim from Ghana",
        "Re-entering UK after prior Tier 2 / Tier 4 transition without smooth visa history",
        "Same-sex partner accompanying — Ghana criminalises same-sex relations; UK recognises same-sex marriage but documentation chain may not exist",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → SINGAPORE — work
  // ════════════════════════════════════════════════════════════════════

  "IN:SG:work": {
    whatCarriesWeight: [
      {
        label: "Employment Pass (EP) — Tier-based qualifying salary + Complementarity Assessment Framework (COMPASS)",
        why: "Singapore's EP for foreign professionals: minimum monthly salary S$5,000 from 2023 (S$5,500 for financial services), rising with age (~S$10,500 for mid-40s). From September 2023, COMPASS (Complementarity Assessment Framework) replaces simple salary cutoff — points-based system rewarding: salary above median (40 pts max), diversity (Indian as nationality contributes positive points in non-Indian-heavy firms), qualifications (Tier-1 universities), strategic-economic-priorities skills shortage. 40 points to pass, 80+ for higher-tier. Indians are Singapore's largest professional expat group (~350,000 Indians on EP / S-Pass / PR).",
      },
      {
        label: "MOM Pass application — employer-sponsored via SingPass Business / EP Online",
        why: "Your Singapore employer applies via Ministry of Manpower (MOM) EP Online portal. Application fee S$105; once approved, you receive In-Principle Approval (IPA) letter to enter Singapore; on arrival you complete biometrics at ICA (Immigration & Checkpoints Authority) and receive your EP card. Processing typically 3 weeks. For senior roles (S$30,000+/month), ONE Pass (Overseas Networks & Expertise) is the elite tier — 5-year duration, multiple concurrent jobs, no employer dependency.",
      },
      {
        label: "Indian educational credentials — MEA Apostille + MOM auto-verification with major Indian universities",
        why: "Indian degree certificates need attestation: 1) issuing university stamp, 2) State HRD or AICTE if technical, 3) MEA Apostille via e-Sanad portal (free or INR 50-200). Singapore MOM auto-verifies degrees from major Indian universities (IITs, IIMs, NITs, IISc, BITS, Anna University, Delhi University, JNU, AIIMS) via direct MOM API integration. For lesser-known institutions, additional Dataflow verification at MOM cost (~S$200-400). For regulated professions: SMC (Singapore Medical Council), SNB (Singapore Nursing Board), PEB (Professional Engineers Board) separate licensure.",
      },
      {
        label: "Permanent Residence (PR) via Singapore PR scheme — Indian applicants face long timelines",
        why: "Singapore PR after EP/S-Pass typically requires 2-3 years of work + Indian applicant must wait for ICA processing (12-18 months typical). PR grants permanent residence, ability to switch jobs freely, CPF contributions (with employer match), eventual eligibility for citizenship after 5+ years PR. Indian applicants face particularly long PR processing relative to other nationalities — Singapore actively manages racial diversity per longstanding 'CMIO' (Chinese-Malay-Indian-Others) demographic balance.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role, your Singapore employer, and COMPASS impact",
        prompt: "Singapore doesn't ask personal-statement narrative at consular stage (employer-led via MOM EP Online). For Indians: Singapore employer UEN (Unique Entity Number), MOM tier classification (Foreign Worker / S-Pass / Employment Pass / ONE Pass), role + salary band, specific sector (financial services have S$5,500 min, tech/manufacturing S$5,000 min). Highlight Indian qualifications and COMPASS-relevant factors: salary above median, diversity contribution, Tier-1 university, skills shortage area (cybersecurity, AI/ML, advanced engineering, green economy).",
      },
      {
        heading: "Your Indian work history — PAN, EPF UAN, Aadhaar, exact dates",
        prompt: "List every Indian employer with month-precision dates, role, salary in INR, supervisor name + contact. Include PAN, EPFO UAN, Aadhaar (sometimes requested for KYC), and any professional body memberships (PEC, ICAI, ICAEW, MCI, PCI). Past Singapore experience strengthens applications. For technical roles, attach LinkedIn profile, GitHub, technical certifications.",
      },
      {
        heading: "Family + dependants + Indian school year",
        prompt: "Dependent Pass (DP) for spouse + children of EP holders earning S$6,000+/month. Long-Term Visit Pass (LTVP) for common-law partners and parents (S$12,000+/month). Indian spouse + children carry Indian passports — separate Dependent Pass attestation chain (Indian state notary + MEA Apostille). Indian school year (April-March) timing: Indian schools in Singapore (Indian Embassy schools, NUS High School, Tanglin Trust School, GIIS Global Indian International School) follow CBSE/ICSE curriculum.",
      },
      {
        heading: "Long-term plan — PR, citizenship, or rotation",
        prompt: "State plan: PR target after 2-3 years EP (Indian PR processing 12-18 months), eventual Singapore citizenship after 5+ years PR (Singapore doesn't permit dual citizenship — naturalisation requires renouncing Indian passport, but you can apply for OCI — Overseas Citizen of India — afterward to maintain ties), or temporary contract with planned India return, or onward migration (Singapore-based Indians often progress to US / UK / Australia / Canada). Tax: Indian tax-resident if you spend >182 days/year in India OR 60+ days + 365+ days in 4 prior years. Singapore has no capital gains tax; income tax progressive 0-22%.",
      },
    ],
    moneySavingTips: [
      "EP application fee S$105 — employer pays; refuse 'fee deduction' from first salary unless contractual",
      "Indian degree attestation via MEA e-Sanad portal: INR 50-200/document direct",
      "Most major Indian universities auto-verified by MOM — saves S$200-400 Dataflow fee",
      "Open DBS, OCBC, UOB, Standard Chartered Singapore, HSBC Singapore salary account — most accept IPA letter + Indian passport pre-arrival",
      "ONE Pass eligibility S$30,000+/month — apply yourself via MOM portal; consultancies charge S$5,000+ for no real value",
      "Apply for Indian Tax Residency Certificate at Income Tax Department if you'll be Singapore-resident >183 days/year — exempts Singapore income from Indian global-income tax under India-Singapore DTAA",
      "Singapore CPF: as EP holder you don't contribute to CPF; as PR/citizen you contribute 20% (employee) + 17% (employer) — significant retirement savings",
      "Use Wise SGD/INR, Western Union, Mahesh Express, or DBS Remit for remittance — competitive vs DBS international transfer; RBI's LRS allows USD 250,000/year outbound from India",
      "Indian rupee-denominated NRI account in India (NRE / NRO) is tax-efficient — interest exempt for NRI",
      "Don't pay 'Singapore immigration consultancy' INR 200,000+ — MOM EP Online is straightforward; employer's HR handles application",
    ],
    lawyerTriggers: {
      diy: [
        "Standard EP / S-Pass / ONE Pass application with employer support, clean record, clear qualifications",
        "Dependent Pass / LTVP for spouse + children",
        "PR application after 2-3 years EP (online ICA process is straightforward)",
        "Renewal of EP at end of 2-year initial / 3-year renewal periods",
        "Singapore tax filing (mandatory for residents)",
      ],
      getALawyer: [
        "Past Singapore visa refusal or PR rejection",
        "Indian criminal record (NDPS narcotics, dowry, criminal breach of trust)",
        "Past Singapore overstay or work-permit-related dispute",
        "COMPASS scoring borderline — strategic optimisation of points (employer can adjust role description, salary band, work-pass type)",
        "Family member with prior Singapore asylum claim (rare for Indians)",
        "Dual Indian-OCI status of spouse complicating Dependent Pass documentation",
        "Singapore PR application after multiple EP renewals without success",
        "Past Singapore detention or deportation flag",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // ARGENTINIAN → SPAIN — family
  // ════════════════════════════════════════════════════════════════════

  "AR:ES:family": {
    whatCarriesWeight: [
      {
        label: "Ley de Memoria Democrática / Ley de Nietos — Argentinian descent of Spanish exiles route",
        why: "October 2022 Spanish 'Ley de Memoria Democrática' (also called 'Ley de Nietos') allows Argentinians descended from Spanish Republican exiles (and broader Spanish emigration) to claim Spanish citizenship through original Spanish ancestry. Window: October 2022 to October 2025 with possible extension. Eligible: descendants of Spaniards who emigrated due to political, ideological, or labour reasons (broadly interpreted), Spanish-born grandparents/great-grandparents who lost Spanish nationality, women who lost Spanish nationality by marrying foreigners pre-1978. No residency required in Spain — apply via Spanish consulate Buenos Aires / Mendoza / Rosario / Bahía Blanca / Córdoba / Mar del Plata. ~700,000+ Argentinians have applied since 2022.",
      },
      {
        label: "Spanish consulate application + Argentine civil registration documentation",
        why: "Apply at Spanish Consulate Buenos Aires (Calle Maipú or Florida) or regional consulates. Documents required: Argentine birth certificate (apostilled per Hague Convention — Argentina is signatory) showing parent/grandparent name, Argentine marriage certificates linking generations, Spanish-born ancestor's birth certificate from Spanish civil registry (Registro Civil — apply to municipality of birth via family historian or Spanish consulate-accredited researcher), Spanish ancestor's emigration records (passenger lists from CEMLA Centro de Estudios Migratorios Latinoamericanos in Buenos Aires can help). NO Spanish language test required for Ley de Nietos applicants.",
      },
      {
        label: "Sephardic route alternative — closed October 2019 but reopened cases continue",
        why: "Argentinian Jews of Sephardic origin had a separate Spanish citizenship route under 2015 Sephardic Law — application window closed October 2019 but cases filed before that date continue to be processed. Required: certification of Sephardic ancestry by Spanish-recognised rabbi or DERSO Federación de Comunidades Judías de España attestation, DELE A2 Spanish exam, basic Spanish history/civics test (CCSE), proof of historical ties to Spain (surname, family records, language). If your Sephardic application was filed pre-October 2019 it remains processing — check with Spanish consulate Buenos Aires.",
      },
      {
        label: "Naturalisation by residence — 2-year fast-track for Argentinians",
        why: "Spain offers Argentinians (and other Latin American + Filipino + Sephardic + Andorran + Equatorial Guinean / Portuguese) a 2-year naturalisation route (vs 10 years for other nationalities) — requires legal residence in Spain for 2 continuous years. The 2-year fast-track is the second-fastest option after Ley de Nietos (which requires no residency). Apply for Spanish 'Tarjeta de Residencia' first, then after 2 years apply for citizenship via Ministerio de Justicia. DELE A2 Spanish exam + CCSE test required (Argentinians are first-language Spanish speakers, exempt from DELE A2 with proof).",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — Ley de Nietos, Sephardic, 2-year residence, or family reunification",
        prompt: "Argentinians have many routes to Spanish nationality. State explicitly: Ley de Nietos (descent from Spanish ancestor with no residency required — window closes October 2025), Sephardic (pre-2019 filed cases only), 2-year residence + naturalisation (requires Spanish job offer or family ties), or family reunification (if you have Spanish parent / spouse / minor child). Each route has different documentation requirements.",
      },
      {
        heading: "Your Spanish ancestry — exact lineage chain",
        prompt: "For Ley de Nietos: document the chain. Spanish-born ancestor's full name, birth date, birth municipality (e.g., 'María García López, born 15 March 1928, Vigo, Galicia'). Emigration date and reason if available (CEMLA records). Each generation linking ancestor to you via Argentine civil registry birth/marriage certificates. Include ancestor's profession, religion (if relevant for Sephardic), and any documents from Spanish or Argentine archives.",
      },
      {
        heading: "Argentine documents + Spanish ancestor's birth certificate",
        prompt: "Argentine documents (birth, marriage, death certificates) need Apostille per Hague Convention. Spanish ancestor's birth certificate requires application to Spanish municipality of birth — many Spanish municipalities digitised civil registry pre-1900 and accessible via family-history researchers or consulate assistance. If birth certificate destroyed (Spanish Civil War 1936-1939, fires, natural disasters), 'Declaración con valor de simple presunción' notarial declaration accepted as substitute.",
      },
      {
        heading: "Future plan — Spanish citizenship benefits + dual nationality",
        prompt: "Spanish citizenship grants EU passport with free movement / residence / work across EU + Schengen. Argentina permits dual citizenship; Spain permits dual citizenship for Latin American nationals + Sephardic Jews + Filipino + Andorran + Equatorial Guinean + Portuguese (under specific treaty). For Argentinian-Spanish dual nationals: maintain Argentine ID + passport while gaining Spanish ID + passport. State plan: settle in Spain (Madrid, Barcelona, Valencia have large Argentinian diaspora), settle elsewhere in EU (Spanish passport = EU citizenship), maintain Argentine residence with Spanish passport for travel.",
      },
    ],
    moneySavingTips: [
      "Ley de Nietos application has NO Spanish residency requirement — saves Spanish housing + tax-residency costs entirely",
      "Application fee at Spanish consulate: ARS 5,000-15,000 (~USD 5-15) — extremely cheap; don't pay 'Spanish citizenship consultancies' charging USD 1,000-5,000",
      "Spanish ancestor's birth certificate via 'familysearch.org' (free) often substitutes for Spanish civil registry trip — many Spanish municipalities cooperate with FamilySearch digitisation",
      "CEMLA (Centro de Estudios Migratorios Latinoamericanos) Buenos Aires has free immigration record search — Av. Independencia 20",
      "Spanish municipality civil registry: free; allow 3-6 months turnaround by mail",
      "Argentine document apostille: free via Ministerio de Relaciones Exteriores (Cancillería) Buenos Aires — same-day in-person; don't pay agencies ARS 30,000+",
      "Argentine notarised translation (traducción pública) into Spanish — wait, your documents are already in Spanish; this saves translation costs entirely",
      "Don't pay 'genealogy services' for Spanish ancestry research — Spanish civil registries are free; FamilySearch is free; many Argentinian historical societies offer free assistance",
      "If applying via Argentine consulate in Spain (i.e., you're already in Spain), the process is reverse — apply at the Madrid Argentine consulate first for Argentine documents, then Spanish municipality for citizenship",
      "Spanish DNI / NIE / passport application fees are nominal (€10-30) — pay direct at Spanish police / Foreign Office; don't use 'Spanish immigration consultancies'",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Ley de Nietos application with clear ancestor documentation chain",
        "2-year residence + naturalisation application via Ministerio de Justicia (after qualifying Spanish residence)",
        "Family reunification (Reagrupamiento Familiar) for Spanish spouse / minor child / parent",
        "Spanish DNI / NIE / passport issuance once citizenship granted",
      ],
      getALawyer: [
        "Spanish ancestor's birth certificate destroyed (Civil War 1936-1939) — Declaración con valor de simple presunción notarial declaration needs specialist drafting",
        "Sephardic route case filed pre-October 2019 with pending decisions — specialist Spanish lawyer with Sephardic-Latino expertise",
        "Multi-generation chain with non-marital births (hijos naturales) or adoption — legal documentation chain needs careful framing",
        "Argentine criminal record",
        "Spanish ancestor was Spanish citizen but lost Spanish nationality before emigration (rare, complicated)",
        "Past Spanish visa refusal (rare for Argentinians, but if any flag)",
        "Multiple-country ancestry chain (e.g., Spanish + Italian + Lebanese great-grandparents) — choose strongest route",
        "Pre-existing Argentine military / political controversial role affecting Spanish good-character assessment",
        "Spanish ancestor's surname is unclear due to historical Hispanic naming conventions (paterno-materno reversal, religious name vs civil name)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // VENEZUELAN → US — family
  // ════════════════════════════════════════════════════════════════════

  "VE:US:family": {
    whatCarriesWeight: [
      {
        label: "TPS (Temporary Protected Status) for Venezuelans + parole programmes",
        why: "Venezuelans in the US have unique status options. TPS (Temporary Protected Status) currently valid until October 2026 (extended February 2025) — grants work authorization + protection from deportation but NOT a path to permanent residence. Cuban-Haitian-Nicaraguan-Venezuelan Parole Program (CHNV) provided 30,000/month admissions under Biden — paused January 2025 by Trump admin pending review. Venezuelan parents in US can file family-based green card petitions (I-130) for Venezuelan children/spouses — IR-1 (immediate relative spouse), CR-1 (conditional 2-year), F-2A/F-2B (siblings/adult children of US citizens / LPRs), F-1 (unmarried adult children).",
      },
      {
        label: "Venezuelan civil documents — Caracas consular processing constraints + apostille via SAREN",
        why: "US has not had a functioning embassy in Caracas since 2019 — Venezuelan family-based visa applicants currently process through US Embassy Bogotá (Colombia), US Embassy Lima (Peru), or US Embassy Quito (Ecuador) depending on US assignment. Venezuelan birth certificates, marriage certificates, and police clearances need apostille via Venezuelan SAREN (Servicio Autónomo de Registros y Notarías). Older records (pre-1990s) often handwritten and may need rectification via Venezuelan notary before apostille. Cost ~USD 100-300 + travel to functional notary; documentation chain is the bottleneck.",
      },
      {
        label: "Affidavit of Support (I-864) + Venezuelan-American sponsor compliance",
        why: "Family-based green card requires US sponsor (citizen or LPR) to file Form I-864 Affidavit of Support — sponsor must show income at 125% of Federal Poverty Guidelines for household size + sponsored beneficiary (~$25k single, $33k for 2-person household, $42k for 3-person). Joint sponsors (additional household member) accepted if primary sponsor income insufficient. Venezuelan-American sponsors should attach: 3 years of US tax returns (Form 1040), W-2s, employer letter, bank statements, asset valuations.",
      },
      {
        label: "Venezuelan Police Clearance + medical exam at Bogotá / Lima / Quito",
        why: "CICPC (Cuerpo de Investigaciones Científicas, Penales y Criminalísticas) Venezuelan police record check — currently obtainable in Venezuela via SAREN or via Venezuelan consulates abroad in Bogotá / Madrid / Buenos Aires / Mexico City. Document the chain. Medical exam at US-designated panel physician — for Bogotá-processed cases, at IOM Bogotá clinics; Lima cases at IOM Lima; Quito cases at IOM Quito. Cost ~USD 200-400. Yellow fever vaccination required for adults born after 1980; COVID-19 vaccination requirements rescinded.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route choice — TPS, CHNV, IR-1/CR-1, F-2A, F-2B, F-1",
        prompt: "State explicit visa category and family relationship. IR-1/CR-1 (spouse of US citizen), IR-2 (unmarried child of US citizen under 21), IR-5 (parent of US citizen 21+), F-1 (unmarried adult child of US citizen), F-2A (spouse/minor children of LPR), F-2B (unmarried adult children of LPR), F-3 (married children of US citizen), F-4 (siblings of US citizen 21+). Each has different priority date wait times (current visa bulletin shows F-4 Venezuela at 7+ years backlog).",
      },
      {
        heading: "Your relationship narrative — bona fide marriage / relationship",
        prompt: "For spousal cases, IR-1/CR-1 requires evidence of bona fide marriage: when/where/how met (Venezuela, US, third country — be specific), wedding details (date, location, witnesses, religious vs civil), photos, joint financial records (if any), joint travel, communication history (WhatsApp, video calls — preserve evidence), family integration. CR-1 is 2-year conditional pending I-751 removal of conditions; IR-1 is 10-year unconditional. Document timeline carefully — Venezuela's economic crisis means many couples have geographically separated periods that need explanation.",
      },
      {
        heading: "Family ties + Venezuelan economic crisis context",
        prompt: "Acknowledge Venezuelan context openly. Document your Venezuelan history: residence (Caracas / Maracaibo / Valencia / Maracay / Barquisimeto / Ciudad Bolivar district level), parents' occupation, siblings, education at Venezuelan universities (UCV, USB, ULA, UCAB, UDO, LUZ). Document your route to current location if outside Venezuela (Colombia, Peru, Ecuador, Brazil, Spain, US under CHNV, asylum claim). US officers understand humanitarian context but require complete documentation.",
      },
      {
        heading: "US sponsor's compliance + future plan",
        prompt: "US sponsor's relationship to you (spouse, parent, child, sibling) + I-864 sponsorship capacity. State your settlement plan: where you'll live (typically with US sponsor or near Venezuelan-American community in Miami / Houston / NYC / Orlando / Atlanta), work plan (Venezuelan professional credentials evaluated via WES/ECE), child education plan (US public school enrolment via local district), eventual naturalisation timeline (3 years for IR spouse with marriage, 5 years otherwise).",
      },
    ],
    moneySavingTips: [
      "TPS application (I-821) fee $50 + biometric $85 (under 14 exempt) — refile every 18 months when DHS designates",
      "Family-based visa (I-130 petition) fee $675 for relative of US citizen, $675 for relative of LPR; consular processing fee $445 per applicant; affidavit of support fee $120; medical $200-400; total per applicant typically $1,400-1,800",
      "Don't pay 'visa consultancy' agencies USD 5,000-15,000 — USCIS forms are free at uscis.gov; immigration attorney costs $1,500-5,000 for full I-130 + consular processing depending on complexity",
      "Venezuelan-American legal aid: Catholic Charities, Hispanic Federation, ASCV (Asociación Suizo-Venezolana), Venezuelan-American Chamber of Commerce — free or low-cost legal consultation",
      "Apostille in Venezuela via SAREN: USD 50-200/document — don't pay 'Caracas document service' charging USD 500+",
      "Translation: certified Spanish-English translation (USCIS requires certified, not necessarily 'sworn') — USD 25-50/page typical; don't pay 'apostilled translation' charging USD 200+",
      "Medical exam at IOM Bogotá / Lima / Quito: USD 200-400 — direct booking via IOM portal saves agency fees",
      "Consular processing centre choice (NVC documentation transfer): work with US sponsor's attorney to choose Bogotá / Lima / Quito based on processing times — currently Bogotá ~12-18 months, Lima ~10-14 months, Quito ~8-12 months",
      "Use Wise USD/VEF or LATAM-friendly remittance (Reserve.com, Servicio Remesas, Western Union Venezuela) — competitive vs traditional bank transfer",
      "Consider expedited processing (USCIS Form I-907 Premium Processing) — $2,500 for some categories; not available for I-130 family-based but available for some adjustment-of-status cases",
    ],
    lawyerTriggers: {
      diy: [
        "Standard TPS application / renewal for already-eligible Venezuelans",
        "I-130 petition for spouse / immediate family member with clean record",
        "I-485 Adjustment of Status (if already in US under valid status — TPS does not authorise adjustment in all cases)",
        "Naturalisation (N-400) after 3 years marriage to US citizen or 5 years LPR",
      ],
      getALawyer: [
        "TPS to LPR pathway (complex — TPS does not directly grant green card; need separate I-130 / employer sponsorship)",
        "CHNV parole status holders facing 2025 administrative changes",
        "Pre-2017 Venezuelan crime / political violence connections (Chavismo-era enforcement officers, anti-Chavismo activists)",
        "Venezuelan military / SEBIN / DGCIM affiliations — even peripheral",
        "Past US visa refusal or US overstay (B1/B2 visa overstay common during 2014-2019 crisis years)",
        "Family member with prior US asylum claim from Venezuela",
        "Adoption-related petition where Venezuelan adoption documentation is incomplete",
        "Past entry through Mexican border (CBP One app appointment vs unauthorised entry — significant legal distinction)",
        "Venezuelan-American sponsor with prior tax delinquency affecting I-864 sponsorship eligibility",
        "Multiple-country Venezuelan migration history (Venezuela → Colombia → Peru → US complicates beneficiary documentation)",
        "Same-sex spouse petition — Venezuela doesn't fully recognise same-sex marriage (2024 partial recognition for prior marriages abroad); US recognises same-sex marriage; documentation chain may need Colombian / Spanish / US marriage certificate substitute",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // CHILEAN → US — work
  // ════════════════════════════════════════════════════════════════════

  "CL:US:work": {
    whatCarriesWeight: [
      {
        label: "H-1B1 — Chile's unique treaty-based work visa (not subject to annual lottery)",
        why: "Chile (and Singapore) have a unique H-1B1 visa under the US-Chile Free Trade Agreement (2004) — 1,400 visas annually for Chileans (separate from the 85k H-1B lottery cap). Specialty Occupation requiring Bachelor's degree, US employer petition, prevailing wage. H-1B1 differs from H-1B in: no lottery, no PERM-based dual intent (officially non-immigrant), 1-year initial duration vs 3-year H-1B, no spouse work authorization automatic. Apply at US Embassy Santiago (Av Andrés Bello 2800) directly with US employer petition documents — bypass US-based premium-processing entirely.",
      },
      {
        label: "H-1B (lottery) OR L-1 (intracompany) OR E-2 (Chile became eligible 2014)",
        why: "Chileans also qualify for standard H-1B (cap-subject lottery), L-1A/B (intracompany transfer from Chilean parent — Empresas Copec, Falabella, LATAM Airlines, Codelco, SQM, CCU, Concha y Toro, ENAP have well-trodden L-1 paths), and E-2 Treaty Investor since 2014 (under US-Chile FTA Investment Chapter — substantial Chilean investment in US business, ~USD 100,000+ typical). E-2 is renewable indefinitely while investment substantially operates.",
      },
      {
        label: "DS-160 + Apostilled Chilean degrees + WES/ECE/AICE credential evaluation",
        why: "DS-160 online application, then book interview at US Embassy Santiago. Chilean degree certificates (Licenciatura, Magister, Doctorado) need Apostille via Chilean MFA — Chile is Hague signatory since 2016. Cost CLP 800-2,500 per document. WES, ECE, or AICE foreign credential evaluation for US employer petition or licensure. Chilean 4-year Licenciatura maps to US Bachelor's; 5-year Ingeniería Civil maps to US Master's of Engineering for some technical roles.",
      },
      {
        label: "Chilean Pasado Judicial + DICREP background check",
        why: "Chilean PSP (Servicio de Registro Civil e Identificación) Certificate of Antecedents — free at Civil Registry offices or online via Registro Civil website. DICREP (Dirección General del Crédito Prendario) and Personería Judicial certificates for some categories. These are not always demanded at DS-160 interview but having them ready accelerates the process. Particularly useful for E-2 source-of-funds documentation.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — H-1B1, H-1B, L-1, or E-2",
        prompt: "Chileans have unusually many routes. State explicitly: H-1B1 (no lottery, 1,400 annual quota, US employer petition), standard H-1B (lottery — Chilean win rate ~35-40%), L-1A/B (intracompany transfer from Chilean parent with 12+ months qualifying employment), E-2 Treaty Investor (substantial Chilean investment in US business). Show research — H-1B1 is the unique advantage for Chileans.",
      },
      {
        heading: "Your Chilean employer / academic credentials",
        prompt: "List Chilean employer chronologically, role, salary in CLP with USD equivalent, supervisor name + contact. Chilean universities (PUC Pontificia Universidad Católica, U de Chile, USACH Universidad de Santiago, U de Concepción, UAI Universidad Adolfo Ibáñez, UTFSM Universidad Técnica Federico Santa María) are well-known to US Embassy Santiago. For L-1, document the 12+ month qualifying employment at Chilean parent.",
      },
      {
        heading: "Long-term plan — H-1B1 vs H-1B + green card",
        prompt: "H-1B1 is officially non-immigrant (no dual intent) — can't openly state green-card plans. H-1B and L-1 allow dual intent. State plan honestly: temporary US contract (1-2 years on H-1B1), longer-term US career (transition from H-1B1 to H-1B → EB-2/EB-3 PERM-based green card), or E-2 indefinite renewal. Chile permits dual citizenship; US permits dual citizenship.",
      },
      {
        heading: "Family + dependants + Chilean school year",
        prompt: "Spouse on H-1B1: H-4 (no work authorization automatic; EAD restrictive). Spouse on H-1B: H-4 with EAD if H-1B principal is in I-140 approved stage. Spouse on L-1: L-2 with automatic work auth since 2023. Spouse on E-2: E-2D with full work rights. Chilean school year (March-December) timing: arrival before US August/September school start. International schools in Santiago (Grange School, Saint George's, Nido de Águilas) ease US school transition.",
      },
    ],
    moneySavingTips: [
      "DS-160 fee $185 (H-1B1/H-1B/L-1) or $315 (E-2); pay in CLP at Banco de Chile, Banco Santander Chile, or BBVA Chile — no reciprocity fee for Chileans",
      "H-1B1 application at US Embassy Santiago is much faster than US-based premium processing — no lottery, no PERM, direct consular path",
      "Use WES iGPA Calculator (free online) before paying for full evaluation",
      "Apostille via Chilean MFA online portal: CLP 800-2,500/document",
      "Open a US-domiciled bank account with Wise USD, Mercury Business, or BCI Miami / Banco Estado Miami (Chilean diaspora-friendly) before relocation",
      "Chilean Embassy DC + Consulates (LA, NYC, SF, Chicago, Houston, Miami, San Juan PR, Boston) offer free notarisation for Chilean citizens",
      "Avoid Chilean 'asesores migratorios' charging CLP 3-8M for H-1B1/H-1B — US-based immigration attorneys with Latin American desks at Fragomen, Berry Appleman, BAL have flat-fee Spanish-language Chilean services at $2,500-3,500",
      "H-1B1 dependent visas (H-4) — children of H-1B1 holders eligible; spouse work auth via H-4 EAD only if on certain US adjustment-of-status track (rare for H-1B1)",
      "Use Banco de Chile, Santander, or BancoEstado for tuition transfers — competitive vs retail FX; Chilean Central Bank educational outflow has no annual cap with admission proof",
      "Plan Chilean tax exit carefully — Chile has 'departure tax' on substantial holdings (unrealised gains on shares/business); file final Chilean tax return as resident in year of departure",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B1 / H-1B / L-1 with named US employer, clean record, clear Chilean degree mapping",
        "DS-160 interview prep and document gathering at US Embassy Santiago",
        "Spouse / dependent derivative applications (H-4, L-2, E-2D)",
        "Renewal of existing H-1B1 / H-1B / L-1 at US Embassy Santiago during home leave",
        "PERM-based EB-2 / EB-3 green card (Chileans are current — no per-country backlog) for H-1B transitioning to immigrant intent",
      ],
      getALawyer: [
        "E-2 Treaty Investor (Chile-US E-2 since 2014) — substantiality, source-of-funds, 'real and operating' enterprise tests benefit from specialist drafting",
        "EB-1A / EB-1B / O-1 — extraordinary ability for Chilean researchers / executives / artists",
        "H-1B1 to H-1B transition (cap-subject lottery in March vs annual H-1B1 quota) — strategic timing",
        "Concurrent Chilean Wegzugsbesteuerung-equivalent considerations on substantial holdings",
        "Prior US visa refusal or US overstay",
        "Chilean criminal record (drug-related cases — disclosure to USCIS / DOS mandatory)",
        "Past Allende-era political family or military junta era controversial role",
        "Same-sex spouse — Chile recognised same-sex civil unions 2015 and same-sex marriage March 2022; US recognises; derivative visas straightforward",
        "Dual Chilean-other passport (Chilean-Spanish, Chilean-Italian, Chilean-German common — apply via Chilean passport)",
        "Pinochet-era military / police background check complications",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // SAUDI → US — study
  // ════════════════════════════════════════════════════════════════════

  "SA:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 paid + Saudi government / Aramco sponsorship",
        why: "Saudi Arabia is one of the largest sources of fully-funded students to the US (~25,000 enrolments). Most are funded under KASP (King Abdullah Scholarship Programme — launched 2005, paused/restarted 2023), Saudi Aramco / SABIC / Saudi Royal Court / Ministry of Higher Education scholarships, or self-funded by wealthy Saudi families. Your US institution issues Form I-20 (F-1) or DS-2019 (J-1) once admitted and proof-of-funds verified. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) before booking DS-160. Apply at US Embassy Riyadh (Diplomatic Quarter) or US Consulate General Jeddah / Dhahran.",
      },
      {
        label: "Saudi educational credentials + Tahseen authentication + Ministry of Higher Education attestation",
        why: "Saudi Thanawiya Amma diploma (12-grade) and Saudi university degrees (Bachelor's, Master's, PhD from KFUPM, KAUST, KSU King Saud, KAU King Abdulaziz, Umm Al-Qura, KFU King Faisal, Imam, Saudi Electronic) — need: 1) issuing institution stamp, 2) Saudi Tahseen (Ministry of Higher Education Equivalency) for non-Saudi-issued portions, 3) Saudi MOFA legalisation, 4) US Embassy Riyadh / Consulate Jeddah / Dhahran legalisation OR Hague Apostille if Saudi joined recently (still being phased in). Saudi 4-year Bachelor's typically maps to US Bachelor's.",
      },
      {
        label: "Mahram (male guardian) requirements for unaccompanied female Saudi students",
        why: "Historically Saudi Arabia required female students under 25 (or unmarried over 25) to have a Mahram (male guardian — father, husband, brother, son) accompanying them or providing written permission for overseas study. Reform: since 2019 women 21+ can travel without Mahram permission for general purposes; for sponsored scholarships (KASP), Mahram requirement was relaxed/abolished; for self-funded study, no Mahram document required at US Embassy. Female Saudi applicants should clarify with their funding source (KASP / private / family) and Saudi cultural attaché in DC about any Mahram-related obligations for travel allowance / housing in US.",
      },
      {
        label: "Cultural Attaché letter + Saudi Police Clearance + DS-160 narrative",
        why: "All Saudi sponsored students require Cultural Attaché letter (from Saudi Cultural Mission in Washington DC, SAMCM) before US visa — confirms scholarship and intended programme. Self-funded students don't need this. Saudi Police Clearance from local Saudi police via Absher app or Ministry of Interior — free, 7-30 days. For every country you've spent 6+ months in (Gulf states, Lebanon, Egypt for many Saudis), additional police certificate required.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your funding source — KASP, Aramco, self-funded, or family",
        prompt: "State explicitly: KASP / SABIC / Saudi Aramco / Royal Court / Ministry of Higher Education scholarship (with letter), or self-funded by family (with bank statements + IBAN). Each funding source has different documentation chain. KASP students have a 'scholarship offer letter' that automatically satisfies funding proof at the DS-160 interview. Self-funded students need to document Saudi family wealth via Saudi bank statements (Al Rajhi, SNB, Riyad Bank, Alinma, Banque Saudi Fransi, Arab National Bank).",
      },
      {
        heading: "Why this specific US programme over Saudi or alternative destinations",
        prompt: "Saudi universities are growing in international rankings (KAUST is well-funded; KFUPM is petroleum-engineering elite). Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS, Wall Street for finance, Houston for energy, Boston for biotech), specialised programme. Saudi government scholarships often direct students toward specific US universities (Stanford for AI, MIT for engineering, Harvard for medicine, USC for business — KASP has list of pre-approved institutions).",
      },
      {
        heading: "Post-graduation plan — your return to Saudi Arabia",
        prompt: "F-1 visas explicitly require intent to return. KASP / Aramco / government-sponsored students have explicit return obligation (bonded — typically work in Saudi sector for 4-7 years post-graduation, in named role at Aramco / SABIC / Saudi Ministry / Saudi university faculty). State this directly — it's actually the strongest 214(b) argument possible. Self-funded students should state intended Saudi sector: Aramco, SABIC, STC, Royal Family enterprises, family business succession, Saudi medical sector, Saudi academia.",
      },
      {
        heading: "Family ties + Saudi cultural context",
        prompt: "List father (occupation, location — Riyadh / Jeddah / Dammam / Madinah / Makkah / Khobar / Tabuk / Abha / Hail district level), mother, siblings, partner (if married — many Saudi students are married before graduate study). Mention Saudi property — family home in compound or villa, family business if applicable. For male applicants, Saudi national military service status: voluntary in Saudi, but reservist obligation may apply for some former military families.",
      },
    ],
    moneySavingTips: [
      "KASP students: ALL costs paid (tuition, living, medical insurance, return flights, dependent allowances) — KASP also typically covers spouse / children",
      "Apply at US Embassy Riyadh OR US Consulate General Jeddah (depending on city of residence)",
      "F-1 visa fee is $185; pay via Saudi bank (Al Rajhi, SNB, Alinma, Riyad Bank) with MRV barcode — both KSA bank deposit and USD cash accepted",
      "Don't pay 'visa consultancy' agencies SAR 5,000-50,000 — DS-160 is free, US Embassy is straightforward, agencies don't influence consular decisions",
      "Cultural Attaché letter is FREE for KASP students at SAMCM (Saudi Arabian Cultural Mission) Washington DC",
      "Saudi Police Clearance via Absher app: FREE — don't pay touts at police stations",
      "Apostille via Saudi MOFA: SAR 200-500/document — direct booking via online portal",
      "Saudi Arabia joined Hague Apostille Convention 2023 — phased implementation; many US institutions still require traditional MOFA + Embassy chain",
      "Use Al Rajhi, SNB, or Riyad Bank for tuition transfers — competitive vs retail; Saudi Central Bank has no annual cap on educational outflow",
      "Saudi-American Chamber of Commerce + Saudi Arabian Cultural Mission (SAMCM) provide free advisory services",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with KASP or self-funded support, clean record, strong programme fit",
        "Standard Cultural Attaché letter + visa interview prep",
        "Renewal of existing F-1 at US Embassy Riyadh / Jeddah during winter / summer breaks",
        "OPT or STEM OPT application during or after the programme (where allowed by KASP terms)",
      ],
      getALawyer: [
        "Prior US visa refusal (any category — rare for sponsored Saudis but if any flag)",
        "Saudi criminal record (alcohol, drug, Hadd offenses — Saudi rigorously checks)",
        "STEM field with potential SAO sensitivity (nuclear, aerospace, advanced AI, advanced materials, dual-use biotech)",
        "Family member in Saudi military / intelligence (Mukhabarat) / royal family (additional security review)",
        "KASP bond / sponsorship cancellation requests (complex Saudi-side legal process)",
        "Past US overstay or visa flag in your travel history (rare for Saudis)",
        "Female applicant with Mahram-related guardian dispute (more relevant for KASP terms than US visa)",
        "Same-sex partner accompanying — Saudi criminalises same-sex relations; US recognises; documentation chain unavailable in Saudi",
        "Past military service in Saudi-led coalition (Yemen war) — sensitive for some US visa categories",
        "Transition from KASP to non-KASP funding mid-programme (KASP terms typically forbid this without permission)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRAZILIAN → US — study
  // ════════════════════════════════════════════════════════════════════

  "BR:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 paid",
        why: "Brazil sends ~16,000 students to the US annually — Latin America's largest cohort. Your US institution issues Form I-20 (F-1) or DS-2019 (J-1) once admitted and proof-of-funds verified. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) before booking DS-160. Brazilian applicants book at US Embassy Brasília, US Consulate General São Paulo (Rua Henri Dunant), Rio de Janeiro (Avenida Presidente Wilson — fast slot turnover), Recife, or Porto Alegre based on jurisdiction. São Paulo handles highest F-1 volume.",
      },
      {
        label: "Strong source-of-funds + Brazilian banking culture",
        why: "Show 1st-year tuition + living costs ($40-80k). Document Brazilian bank statements (Itaú, Bradesco, Banco do Brasil, Santander Brasil, Caixa Econômica Federal, BTG Pactual, Inter) with USD-equivalent at BCB PTAX rate. Brazilian families often demonstrate funds via multiple accounts (current + investment + family business CNPJ) — this is fine if documented coherently. Avoid lump-sum deposits within 90 days of interview. For family business sponsorship: CNPJ (Cadastro Nacional da Pessoa Jurídica), 3 years of Receita Federal tax filings, bank statements showing genuine cashflow.",
      },
      {
        label: "Strong 214(b) ties to Brazil + Apostille via Cartório (Hague Convention since 2016)",
        why: "F-1 is non-immigrant. Strong Brazilian ties: family home with Cartório de Registro de Imóveis title in parents' name, parents' employment, Brazilian property (São Paulo / Rio / Brasília / Belo Horizonte / Porto Alegre / Curitiba / Florianópolis), expected return job, family business succession. Brazilian documents apostilled at Cartório (notary public) — Brazil joined Hague Apostille Convention 2016, simplified process. Cost BRL 30-100/document, same-day at most cartórios.",
      },
      {
        label: "TOEFL / IELTS / Duolingo English Test + portuguese-language interview support",
        why: "TOEFL iBT 80+ or IELTS Academic 6.5+ typical for US undergrad/grad admission. Duolingo English Test (DET) 105+ accepted by 4,000+ US universities — cheaper ($59) and faster (15 min) than TOEFL ($225). Visa interview is in English but consular officers at São Paulo / Rio / Brasília often speak Portuguese — they can switch if needed but practice English answers. Avoid memorised scripts.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Brazilian or alternative destinations",
        prompt: "Brazil has elite universities (USP Universidade de São Paulo, UNICAMP, UFRJ, FGV, INSPER, IBMEC, UFMG, UFRGS, PUC). Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS, Wall Street for finance, Boston for biotech, Miami for Latin business). Reference faculty publications, course offerings, industry pipeline.",
      },
      {
        heading: "Funding — Brazilian family / business / scholarship",
        prompt: "Quantify: tuition $X, living $Y, total Year 1 $Z. Then show coverage: family contribution BRL X (with bank statement, CNPJ if business-owner, 3-year Receita Federal IRPF/IRPJ filings, salary slips), scholarship $Y (CNPq for grad students, CAPES, FAPESP, Lemann Foundation, Fulbright Brazil), savings $Z. Brazilian banks issue 'Comprovação de Renda' (income statement) for visa support — standard documentation.",
      },
      {
        heading: "Post-graduation plan — your return to Brazil",
        prompt: "F-1 requires intent to return. State which Brazilian sector: Itaú / Bradesco / BB / Santander Brasil banking, Petrobras / Vale / Eletrobras energy, JBS / BRF / Marfrig agribusiness, Embraer aerospace, Magazine Luiza / Mercado Livre / iFood / Nubank tech, Globo / Record / SBT media, family business succession. Brazilian return is genuinely common — Brazilian economy is large and absorbs US-educated graduates.",
      },
      {
        heading: "Family ties + future plan",
        prompt: "List parents (occupation, location), siblings, partner. Mention Brazilian property — family apartment / casa with Cartório registration, Brazilian bank accounts, Brazilian CPF (Cadastro de Pessoas Físicas — Brazilian tax ID). For male applicants, military service status (Serviço Militar Obrigatório — 12 months at 18; deferral via Certificado de Dispensa de Incorporação CDI).",
      },
    ],
    moneySavingTips: [
      "F-1 visa fee is $185; pay via Banco do Brasil or Citibank Brasil with MRV barcode — both accept BRL at BCB rate",
      "Apostille via Cartório de Notas: BRL 30-100/document, same-day; don't use 'document services' charging BRL 500+",
      "DET (Duolingo English Test) $59 is cheaper than TOEFL $225 — most US universities accept it; book multi-attempt if first try is borderline",
      "Brazilian applicants are eligible for Fulbright Brazil (~$30,000 + tuition), CAPES PrInt for grad students, CNPq Bolsista, Lemann Foundation Fellowship (50+ Brazilians/year at Stanford / Yale / Harvard / Princeton — fully-funded master's), FAPESP for São Paulo state researchers",
      "Many US universities have Brazilian-origin scholarship endowments — Stanford, MIT, Harvard, Yale, Columbia, USC, Texas, FIU all have named Brazilian-heritage funds",
      "Don't pay 'agência de visto' BRL 5,000-25,000 — DS-160 is free online, US Embassy is straightforward",
      "Use Wise USD/BRL, Western Union, Remessa Online, or BB Cards for tuition transfers — competitive vs BB international transfer; BCB educational outflow has no annual cap with admission proof",
      "Brazilian-American Chamber of Commerce + EducationUSA São Paulo / Rio / Brasília offer free advising",
      "CONFEA-CREA + COREN + CRA Brazilian professional body documents can be apostilled cheaply at state cartório (BRL 30-80) — useful for US licensure later",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding, strong programme fit",
        "Standard Fulbright Brazil / Lemann Foundation / CAPES PrInt application",
        "Renewal of existing F-1 at any of 6 Brazilian consulates / US Embassy during winter / summer breaks",
        "OPT or STEM OPT application during or after the programme",
      ],
      getALawyer: [
        "Prior US visa refusal (B1/B2 refusal is red flag for F-1)",
        "Brazilian criminal record (Lei Antidrogas, fraud — disclosure to USCIS mandatory)",
        "Past US overstay or visa flag",
        "Funding from a sponsor outside Brazil / immediate family",
        "Brazilian asylum-related case (rare; political opposition or environmental defender persecution)",
        "Past Lava Jato / Operation Car Wash investigation connection (family member involved in corruption scandal)",
        "Transfer from UK / Canadian / Australian student visa to US F-1",
        "Same-sex partner accompanying — Brazil recognises same-sex marriage (2011); US recognises; derivative visas straightforward",
        "Unresolved Brazilian military obligation (males 18-45 with CDI deferral approaching expiry)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // MEXICAN → US — work
  // ════════════════════════════════════════════════════════════════════

  "MX:US:work": {
    whatCarriesWeight: [
      {
        label: "TN Visa under USMCA (former NAFTA) — Mexico's unique fast-track work visa",
        why: "Mexicans (and Canadians) qualify for the TN Visa under USMCA (replaced NAFTA in 2020). Available for ~60 specified professional occupations (engineer, scientist, accountant, lawyer, teacher, registered nurse, pharmacist, physical therapist, social worker, computer systems analyst, etc.) requiring Bachelor's degree (state licensure for regulated). TN is faster than H-1B (no lottery, no PERM, processable in days at US border / consulate), renewable in 3-year increments indefinitely. Mexican applicants apply at US Consulate Tijuana / Ciudad Juárez / Monterrey / Guadalajara / Mexico City / Hermosillo / Matamoros / Nogales / Nuevo Laredo via DS-160. Initial entry can also be at land border with proper documents.",
      },
      {
        label: "H-1B Specialty Occupation OR L-1 intracompany OR E-2 Treaty Investor",
        why: "Beyond TN, Mexicans qualify for H-1B (cap-subject lottery, ~35-40% win rate), L-1A/B (intracompany transfer from Mexican parent — Telmex/America Movil, Cemex, Grupo Bimbo, Walmart de México, Banamex/Citibanamex, FEMSA, Liverpool, Soriana have well-trodden L-1 paths), and E-2 Treaty Investor (under 1994 NAFTA, continued under USMCA — substantial Mexican investment in US business, ~$100,000+ typical). Mexico-US treaty relationship is one of the deepest in the world.",
      },
      {
        label: "DS-160 + Apostilled Mexican degrees + WES/ECE/AICE credential evaluation",
        why: "DS-160 online application, then book interview at US Consulate. Mexican degree certificates (Licenciatura, Maestría, Doctorado) need Apostille via Secretaría de Educación Pública (SEP) authentication first (for the university degree validity within Mexico), then apostille via Secretaría de Relaciones Exteriores (SRE — Mexico is Hague signatory since 1995). Cost MXN 600-1,500 per document. WES, ECE, or AICE foreign credential evaluation for US employer petition or licensure. Mexican Licenciatura (4-5 years) typically maps to US Bachelor's; Maestría to US Master's.",
      },
      {
        label: "Mexican Carta de Antecedentes No Penales + medical considerations",
        why: "Mexican Federal Carta de Antecedentes No Penales (criminal record certificate) at INM (Instituto Nacional de Migración) or at Federal Republican Court — free, 7-21 days. State-level antecedentes also available. For visa interview, having this in hand isn't always required but accelerates the process. Mexican medical examinations at US-designated panel physicians in Mexico (most border cities have IOM-equivalent panel physicians) — required for some adjustment-of-status categories but not for TN/H-1B/L-1 at consular stage.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — TN, H-1B, L-1, or E-2",
        prompt: "Mexicans have unusually many routes. State explicitly: TN (USMCA professional list — fast-track, no PERM, renewable indefinitely — Mexico's unique advantage), H-1B (cap-subject lottery — only worthwhile if TN doesn't apply to your role), L-1A/B (intracompany transfer with 12+ months qualifying employment at Mexican parent), E-2 Treaty Investor (substantial Mexican investment). Show research — TN is dramatically easier than H-1B for Mexican applicants whose role qualifies.",
      },
      {
        heading: "Your Mexican employer / academic credentials",
        prompt: "List Mexican employer chronologically, role, salary in MXN with USD equivalent, supervisor name + contact. Mexican universities (UNAM, ITESM Tecnológico de Monterrey, IPN, UAM Universidad Autónoma Metropolitana, UDLAP Universidad de las Américas Puebla, ITAM, UAA Universidad Anáhuac) are well-known to US Consulates Mexico. For L-1, document the 12+ month qualifying employment at Mexican parent.",
      },
      {
        heading: "Long-term plan — TN renewal forever vs H-1B + green card",
        prompt: "TN is non-immigrant (no dual intent officially) — can't openly state green-card plans on TN. However, TN holders can switch to H-1B during cap season for dual-intent. H-1B and L-1 allow dual intent — open green-card plans (EB-1/EB-2/EB-3 via PERM). State honest plan: temporary TN with indefinite renewal, longer-term US career via H-1B transition + PERM, or E-2 indefinite renewal. Mexico permits dual citizenship; US permits dual citizenship.",
      },
      {
        heading: "Family + dependants + Mexican school year",
        prompt: "Spouse on TN: TD (no work authorization). Spouse on H-1B: H-4 with EAD if H-1B principal is in I-140 approved stage. Spouse on L-1: L-2 with automatic work auth since 2023. Spouse on E-2: E-2D with full work rights. Mexican school year (August-July) timing: arrival before US August school start. International schools in Mexico (American School Mexico City, ASF, Greengates) ease US school transition.",
      },
    ],
    moneySavingTips: [
      "TN visa application is dramatically cheaper than H-1B: $185 DS-160 + no employer petition fee (TN is direct consular / port-of-entry process)",
      "TN renewable indefinitely in 3-year increments — no annual lottery, no PERM costs, no green-card-bridging fees",
      "Apply at US Consulate in your Mexican city of residence — Tijuana / Juárez / Monterrey / Guadalajara / Mexico City / Hermosillo are major TN/H-1B processing centres",
      "Use WES iGPA Calculator (free online) before paying for full evaluation",
      "Apostille via SRE: MXN 600-1,500/document, ~5 working days; SEP authentication: MXN 600-1,000",
      "Open a US-domiciled bank account with Wise USD, Mercury Business, or Banamex Miami (Citibanamex US branches), BBVA Compass (Mexico-friendly) before relocation",
      "Mexican Embassy DC + Consulates (Atlanta, Boston, Chicago, Houston, LA, Miami, NY, SF, Albuquerque, Anchorage, Austin, Boise, Dallas, Denver, Detroit, Fresno, Indianapolis, Kansas City, Las Vegas, Little Rock, McAllen, Milwaukee, Minneapolis, Nashville, New Orleans, Oklahoma City, Omaha, Orlando, Philadelphia, Phoenix, Portland, Raleigh, Sacramento, Salt Lake City, San Antonio, San Bernardino, San Diego, San Jose, Seattle, St Paul, Tucson, Yuma) — 50+ Mexican consulates in US, more than any other country",
      "Avoid Mexican 'asesores migratorios' charging MXN 30,000-150,000 for TN — TN is one of the simplest US visas; DIY is realistic for cooperative employers",
      "USMCA-related tax implications: file Form 8854 if expatriating from Mexico; US tax treaty with Mexico (1992) prevents double-taxation; Mexican Resico simplified regime affects post-departure income",
      "Use Banamex, BBVA México, Santander México, or Banorte for tuition / large remittance — competitive vs Wise for high-volume transfers",
    ],
    lawyerTriggers: {
      diy: [
        "Standard TN visa application at US Consulate or land border with cooperating US employer support letter",
        "H-1B / L-1 with named US employer, clean record, clear Mexican degree mapping",
        "DS-160 interview prep at any of 9 Mexican US Consulates",
        "Spouse / dependent derivative applications (TD, H-4, L-2, E-2D)",
        "TN renewal in 3-year increments via consulate or port-of-entry",
        "PERM-based EB-2 / EB-3 green card (Mexicans are CURRENT — no per-country backlog as of 2025)",
      ],
      getALawyer: [
        "TN role outside USMCA's 60-occupation list (some roles are borderline — e.g., 'data scientist' isn't listed but 'computer systems analyst' is)",
        "E-2 Treaty Investor — substantiality, source-of-funds, 'real and operating' enterprise tests",
        "EB-1A / EB-1B / O-1 — extraordinary ability for Mexican researchers / executives / artists / chefs / athletes",
        "Concurrent Mexican exit tax considerations on substantial holdings",
        "Prior US visa refusal or US overstay (B1/B2 overstay common for Mexicans)",
        "Mexican criminal record (drug-related cases — disclosure to USCIS / DOS mandatory; cartel-region cases sensitive)",
        "Past unauthorised US entry / border crossing (significant legal implications for future TN/H-1B eligibility)",
        "Same-sex spouse — Mexico recognises same-sex marriage federally (2022); US recognises; derivative visas straightforward",
        "Dual Mexican-other passport (Mexican-Spanish, Mexican-Italian, Mexican-Lebanese — apply via Mexican passport)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDONESIAN → SAUDI ARABIA — work
  // ════════════════════════════════════════════════════════════════════

  "ID:SA:work": {
    whatCarriesWeight: [
      {
        label: "Kafala-reformed Work Permit via HRSD + Indonesian-Saudi labour migration framework",
        why: "Indonesians are Saudi's 4th-largest expat group (~1.8 million), with strong representation in domestic work, hospitality, construction, and recently growing in professional/technical sectors. Your Saudi employer applies to HRSD for Work Permit, then issues your iqama within 90 days of arrival. The March 2021 Labour Reform Initiative + Indonesia-Saudi MOU on migrant workers (2024 updated) allow easier job switching, fairer recruitment, and protection from passport-holding. Iqama fee SAR 9,600/year — paid by employer for skilled workers.",
      },
      {
        label: "Indonesian educational certificates attested via Kemenkumham + Saudi Embassy Jakarta",
        why: "Indonesian degree certificates need attestation: 1) issuing university stamp, 2) Kemendikbudristek (Ministry of Education) for graduate-level / Kemenag for Islamic studies, 3) Kemenkumham Apostille (Indonesia joined Hague Convention 2022) — IDR 50,000-150,000 per document, 4) Saudi Embassy Jakarta (Jl. M.T. Haryono Kav. 27) attestation IDR 1,000,000-3,000,000, 5) Saudi MOFA on arrival. Allow 4-8 weeks. Indonesian Islamic university degrees (UIN, IAIN — including from Al-Azhar Egyptian campuses, Madinah University Indonesian graduates) are especially valued for religious / educational roles in Saudi.",
      },
      {
        label: "BP2MI overseas worker registration + Saudi recruitment quotas",
        why: "Indonesia's BP2MI (Badan Pelindungan Pekerja Migran Indonesia, formerly BNP2TKI) requires registration for all overseas workers — issues BNP2TKI/BP2MI Certificate and TKI (Tenaga Kerja Indonesia) Pass. Documentation includes pre-departure orientation (Pembekalan Akhir Pemberangkatan PAP) at BLK Luar Negeri training centre, medical clearance, language proficiency (basic Arabic for non-professional roles), and insurance. Saudi imposes quotas on Indonesian domestic workers — only certain agencies are licensed and quotas reset periodically.",
      },
      {
        label: "GAMCA medical + Indonesian Police Clearance + Indonesian passport endorsement",
        why: "Indonesians must complete GAMCA medical at authorised Indonesian centres before flying — Jakarta (RS Medika), Surabaya, Medan, Makassar — IDR 1,500,000-3,500,000. TB, HIV, Hep B/C screening. Indonesian Police Clearance Certificate (SKCK — Surat Keterangan Catatan Kepolisian) from local Polsek/Polres/Polda — IDR 30,000, 7-14 days. Indonesian passport must be endorsed (TKI status stamp) at airport immigration on departure — failure to do so triggers smuggling charges on return.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role, your Saudi employer, BP2MI registration, and Nitaqat tier",
        prompt: "Saudi doesn't ask personal-statement narrative at consular stage. For Indonesians: Saudi employer CR number, HRSD Nitaqat classification, role + salary band (SAR 4,000-25,000/month range for most Indonesians), specific region (Riyadh / Jeddah / Dammam / Khobar / Madinah / Makkah — religious-sector workers concentrate in Madinah/Makkah). Document BP2MI registration with TKI Pass / OEC reference number. Highlight Indonesian Islamic university credentials if applying for religious / educational role.",
      },
      {
        heading: "Your Indonesian work history — NIK, NPWP, BPJS, exact dates",
        prompt: "List every Indonesian employer with month-precision dates, role, salary in IDR, supervisor name + WhatsApp. Include NIK (Nomor Induk Kependudukan — national ID), NPWP (Nomor Pokok Wajib Pajak — tax number), and BPJS Ketenagakerjaan (employment insurance) registration — Saudi attestation occasionally requires these. Past Gulf experience (UAE, Qatar, Kuwait, Malaysia) strengthens applications.",
      },
      {
        heading: "Family + sponsorship + Indonesian school year",
        prompt: "Dependent iqama tied to your sponsorship. Threshold: SAR 4,000-6,000/month + housing allowance for spouse/children. Indonesian spouse + children carry Indonesian passports — separate attestation chain (Indonesian Kemenkumham Apostille + Saudi Embassy Jakarta) needed. Indonesian school year (July-June) timing: Indonesian schools in Saudi (Sekolah Indonesia Riyadh, Sekolah Indonesia Jeddah, Sekolah Indonesia Mekkah) follow Indonesian Kurikulum Merdeka curriculum.",
      },
      {
        heading: "Long-term plan — Premium Residency, return to Indonesia, or rotation",
        prompt: "Saudi naturalisation for Indonesian workers is extremely rare. State plan: Premium Residency target (SAR 100,000/year or SAR 800,000 permanent), temporary contract with planned Indonesia return (most common for Indonesian TKI), or onward migration (rare for Indonesians vs Indian/Pakistani who progress to UK/Canada). Tax: Indonesian tax-resident if you maintain residence ties + spend >183 days; OFW-style exemption for TKI status; Saudi has no personal income tax.",
      },
    ],
    moneySavingTips: [
      "Employer typically pays iqama fees for skilled workers — clarify at offer stage",
      "Indonesian degree attestation via Kemenkumham Apostille portal: IDR 50,000-150,000/document",
      "Saudi Embassy Jakarta attestation: IDR 1,000,000-3,000,000/document",
      "GAMCA medical at authorised Indonesian centres: IDR 1,500,000-3,500,000 — standardised, all GAMCA-accredited equally accepted",
      "BP2MI registration is FREE — don't pay 'agensi TKI' IDR 2,000,000-10,000,000 for registration",
      "Pre-departure orientation (PAP) is FREE at BLK Luar Negeri centres — don't pay for 'expedited PAP'",
      "SKCK (Indonesian Police Clearance): IDR 30,000 at local Polsek — don't pay calo (touts) IDR 200,000+",
      "Open Al Rajhi, SNB, Riyad Bank, or Alinma salary account in Saudi — Indonesian diaspora-friendly with IDR remittance discounts",
      "Apply for Indonesian Tax Residency Certificate at DJP if you'll be Saudi-resident >183 days/year — exempts Saudi income from Indonesian global-income tax",
      "Use Western Union, MoneyGram, Al Rajhi Tahweel, or Wise IDR/SAR for remittance to Indonesia",
      "End of Service Gratuity calculation: 0.5 month salary/year for first 5 years, 1 month/year after — keep records of basic salary",
    ],
    lawyerTriggers: {
      diy: [
        "Standard employer-led Work Permit + iqama + dependent iqama",
        "BP2MI / TKI registration + pre-departure orientation",
        "GAMCA medical, biometric, iqama issuance (employer-facilitated)",
        "Iqama renewal via Absher app",
        "Premium Residency application via online portal",
        "End of Service Gratuity calculation",
      ],
      getALawyer: [
        "Past Saudi 'huroob' (absconder) status",
        "Indonesian criminal record (UU Narkotika narcotics, terrorism-related — Saudi rigorously checks)",
        "Previous Gulf labour dispute (Malaysia, UAE, Qatar passport-holding case, Kuwait sponsor-side issues)",
        "Domestic worker visa (Tadbeer system) — separate visa category with different protections",
        "Switching Saudi sponsor mid-contract — easier under 2021 Labour Reform but edge cases benefit from lawyer",
        "Real estate Premium Residency application",
        "Family member with prior Saudi conviction or labour ban",
        "Past TKI overstay on previous Saudi contract",
        "Indonesian Christian / Buddhist religious affiliation — Saudi forbids non-Muslim worship publicly; some Indonesian gatherings flagged",
        "JI / FPI / extremist political affiliation flag (Indonesian Special Branch / Densus 88 record)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // RUSSIAN → UAE — work
  // ════════════════════════════════════════════════════════════════════

  "RU:AE:work": {
    whatCarriesWeight: [
      {
        label: "MOHRE Work Permit + Russian tech / finance migration surge post-2022",
        why: "Russian migration to UAE accelerated dramatically after February 2022 (Ukraine war) — estimated 100,000+ Russians relocated to UAE 2022-2024, concentrated in Dubai (tech, finance, real estate, crypto). Your UAE employer applies to MOHRE for Work Permit, GDRFA (Dubai) / ICA (Abu Dhabi) for Entry Permit. Russians benefit from UAE's neutrality on Russia sanctions and absence of personal income tax. UAE doesn't recognise OFAC/EU sanctions extraterritorially for individual residency.",
      },
      {
        label: "Russian educational certificates attested via Konsulskaya Legalizatsiya + UAE Embassy Moscow",
        why: "Russian degree certificates (Bakalavr, Magistr, Spetsialist, Kandidat Nauk, Doktor Nauk) need attestation chain: 1) issuing institution stamp + Rosobrnadzor verification, 2) Russian Ministry of Foreign Affairs (Konsulskaya Legalizatsiya — Russia is NOT Hague Apostille signatory for educational documents going to UAE; full legalisation required), 3) UAE Embassy Moscow (Mamonovskiy Pereulok 3 building 1) attestation, 4) UAE MOFA on arrival. Cost RUB 5,000-15,000 + AED 150-300. Allow 4-8 weeks. Russian elite universities (MGU, MFTI, MGIMO, HSE, ITMO, SPbGU) are well-known to UAE employers.",
      },
      {
        label: "Salary tier + Golden Visa potential + Russian Premium Residency popularity",
        why: "UAE work visa tiers: Standard / Skilled / Highly Skilled / Golden Visa. Russian professionals earning AED 30,000+/month (typically tech leads, finance professionals, real estate investors, crypto / fintech operators) qualify for Golden Visa directly. Real estate investors with AED 2M+ Dubai property qualify — Russian investment in Dubai real estate accelerated post-2022 (UAE doesn't apply sanctions on individual property ownership). Russians have become one of the largest Golden Visa cohorts.",
      },
      {
        label: "Medical fitness + Russian sanctions / SWIFT banking considerations",
        why: "Within 60 days of Entry Permit: medical fitness at DHA / SEHA / MOHAP (AED 320-750). TB, HIV, Hep B/C screening. Banking: Russian-issued credit cards (Mir, MTS, etc.) don't work internationally; SWIFT-sanctioned Russian banks (Sberbank, VTB, Alfa-Bank, Gazprombank, Otkritie) cannot transfer to UAE banks under most circumstances. Russians typically open UAE accounts (ENBD, ADCB, FAB, HSBC UAE) with cash deposits or third-country (Kazakhstan, Georgia, Armenia, Türkiye, Serbia) bank transfers as workaround.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role, your UAE employer, sanctions compliance, salary tier",
        prompt: "UAE doesn't ask personal-statement narrative at consular stage (employer-led via MOHRE). For Russians: UAE employer Trade Licence number, MOHRE establishment registration, role + salary band (AED 4,000+/month minimum), specific emirate (Dubai for tech/finance/crypto; Abu Dhabi for energy/oil/gas). Highlight prior international work experience (Russian multinationals like Yandex, VK, Tinkoff, Sberbank — though sanctioned status of some affects employer-side compliance), Russian elite university credentials, and language skills (Russian-Arabic-English combinations are valuable).",
      },
      {
        heading: "Your Russian work history — INN, SNILS, exact dates",
        prompt: "List every Russian employer with month-precision dates, role, salary in RUB, supervisor name + email. Include INN (Individual Tax Number from Federal Tax Service FNS), SNILS (Social Security Insurance Account Number), and any Russian professional body memberships. For Russians who left during 2022 mobilisation wave, document the timeline carefully — UAE doesn't require this but UAE employer may. Past international work (Türkiye / Serbia / Armenia / Georgia / Kazakhstan / UAE-stop-then-continue) needs documentation.",
      },
      {
        heading: "Family + sponsorship + Russian school options in UAE",
        prompt: "Dependent Residence visas tied to your sponsorship. Threshold: AED 4,000/month + accommodation for spouse/children. Russian spouse + children carry Russian passports — separate attestation chain via Konsulskaya Legalizatsiya + UAE Embassy Moscow. Russian schools in UAE (Russian Embassy School Abu Dhabi, Russian School Dubai, Lermontov School Sharjah, RIIS Russian International Innovative School) follow Russian Federation curriculum.",
      },
      {
        heading: "Long-term plan — Golden Visa, return to Russia, or onward migration",
        prompt: "UAE work visas don't lead to UAE citizenship. State plan: Golden Visa (significant Russian cohort using this route), temporary contract with planned Russia return (rare for post-2022 emigres), or onward migration (Russians often progress to Cyprus / Israel / Türkiye / Serbia / Georgia / Armenia, with UAE as professional springboard). Russian tax: tax-resident if you spend >183 days/year in Russia; UAE has no personal income tax; CRS reporting affects future tax compliance.",
      },
    ],
    moneySavingTips: [
      "Employer MUST pay all work visa costs per UAE Labour Law — refuse 'visa fee deduction'",
      "Russian degree attestation via UAE Embassy Moscow: queue manageable — book online via embassy portal",
      "MFA Konsulskaya Legalizatsiya: RUB 5,000-15,000/document",
      "Medical fitness: DHA Dubai centres AED 320-450; cheaper than SEHA premium",
      "Open ENBD, ADCB, FAB, HSBC UAE, or Mashreq salary account — corporate sponsor often gets fee waivers; bring cash deposits (USD/EUR) for initial funding given Russian banking restrictions",
      "Russian payment workaround: open Kazakhstan / Armenia / Georgia / Türkiye / Serbia bank account first, transfer to UAE later — these third countries serve as financial intermediaries given Russia-EU/US banking sanctions",
      "Russian tax residency: if leaving Russia, file Russian tax return for partial year; CRS automatically reports UAE account balances to Russian Federal Tax Service (FNS), affecting eventual return",
      "UAE Golden Visa fee AED 2,800-3,800 (5-year) — apply via ICA / GDRFA portal direct",
      "Use Wise GBP/EUR/USD (with non-Russian sender accounts), Western Union, or LuLu Money for remittance to UAE — direct Russian bank transfer is severely restricted post-2022",
      "Avoid 'Russian-UAE migration consultancies' charging USD 5,000-30,000 — UAE employer's PRO handles MOHRE; Russian-side attestation is largely self-service",
    ],
    lawyerTriggers: {
      diy: [
        "Standard employer-led work permit + entry permit + residence visa with attested certificates",
        "Medical fitness, Emirates ID biometric, visa stamping (employer-facilitated)",
        "Dependent visa for spouse + children once residence visa + qualifying salary established",
        "Golden Visa application via salary or property route",
        "End of Service Gratuity calculation",
      ],
      getALawyer: [
        "Sanctioned-employer history (Sberbank, VTB, Alfa-Bank, Gazprombank, Rosneft, Lukoil — UAE employer may have compliance concerns)",
        "OFAC SDN List individual sanctions (some Russian oligarchs face individual sanctions affecting Golden Visa)",
        "Russian military / FSB / Wagner / mercenary background — UAE employer-side compliance significant",
        "Past UAE labour ban",
        "Russian criminal record (politicheski statia 282-280 'political' charges complicate)",
        "Past Türkiye / Serbia / Cyprus / Israel migration history needing reconciliation",
        "Switching UAE sponsor mid-contract",
        "Real estate Golden Visa with crypto-funded purchase (UAE accepts but documentation chain matters)",
        "Same-sex partner — Russia criminalises 'gay propaganda' (2023 'extremist movement' law); UAE doesn't recognise same-sex marriage; documentation chain doesn't exist",
        "Pending Russian conscription / mobilisation order — affects future Russian re-entry",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // KOREAN → US — study
  // ════════════════════════════════════════════════════════════════════

  "KR:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 paid",
        why: "Korea sends ~43,000 students to the US annually — among the top-5 globally. Your US institution issues Form I-20 (F-1) or DS-2019 (J-1) once admitted and proof-of-funds verified. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) before booking DS-160. Korean applicants book at US Embassy Seoul (Sejong-daero, Jongno-gu — Gwanghwamun) — single consulate handles all of Korea. Slots open daily early morning; book through US Visa Information Service Korea portal.",
      },
      {
        label: "Strong source-of-funds + Korean banking efficiency",
        why: "Show 1st-year tuition + living costs ($40-80k). Document Korean bank statements (KB Kookmin, Shinhan, Woori, Hana, NH NongHyup, KEB Hana, Industrial Bank of Korea) with USD-equivalent at Bank of Korea rate. Korean families typically have multiple bank accounts and investment products (Hong-tong joong-keum CMA, ELS, beneficial ownership of small business) — document each clearly. Avoid lump-sum deposits within 90 days. Korean low refusal rates (~5-10%) mean documentation efficiency matters more than narrative.",
      },
      {
        label: "Korean academic transcripts + Apostille (Korea joined Hague Convention 2007)",
        why: "Korean 학교생활기록부 (high school record), 졸업증명서 (graduation certificate), 성적증명서 (transcript) need: 1) school stamp / certified copy, 2) Apostille via Korean MOFA (외교부) at Anguk-dong Tower Tokyo (Tokyo office serves diaspora) or provincial Education Offices — Korea is Hague Apostille signatory since 2007. Cost KRW 1,000-2,000 per Apostille, 2-3 working days. WES, ECE, or AICE foreign credential evaluation for some US universities.",
      },
      {
        label: "Korean male military service status (males 18-35) — Byeong-mu-cheong + 출국허가",
        why: "All Korean males 18-35 must show resolved military obligation. Hyeong-yeok (completed active duty), Bo-chung-yeok (supplementary service), Yegun (reserves), Myeon-yeok (exempt), or Yeon-gi (deferral with study abroad approval through 교육부 or 내무부 entry-exit permit 출국허가). 兵務廳 (Byeong-mu-cheong / MMA — Military Manpower Administration) certificate attached to DS-160. Recent change: Korea extended conscription period back to longer durations affecting timing of overseas study. Without proper deferral, future return triggers immediate conscription.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Korean SKY universities or alternatives",
        prompt: "Korea has elite universities (SKY = Seoul National 서울대, Korea 고려대, Yonsei 연세대; plus KAIST, POSTECH, Sungkyunkwan 성균관, Hanyang 한양). Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS, Wall Street for finance, Boston for biotech, LA for entertainment / K-pop crossover), specialised programme. Reference faculty publications, course offerings.",
      },
      {
        heading: "Funding — Korean family / chaebol scholarship / Fulbright Korea",
        prompt: "Quantify: tuition $X, living $Y, total Year 1 $Z. Then show coverage: family contribution KRW X (with bank statement, parents' Korean income certificate, family business 사업자등록증 if business-owner), scholarship (Fulbright Korea, KGSP Korean Government Scholarship Program for returning Koreans, Hyundai/Samsung/LG/SK/Lotte Foundation scholarships, Asan Foundation, Posco TJ Park Foundation). Korean banks issue 'Verification of Funds' (잔액증명서) — standard at US consular interviews.",
      },
      {
        heading: "Post-graduation plan — your return to Korea + military service plan",
        prompt: "F-1 requires intent to return. State which Korean sector: Samsung Electronics / Samsung SDS / Samsung Bioepis, LG Electronics / LG Display / LG Energy Solution, SK Hynix / SK Telecom / SK Innovation, Hyundai Motor / Hyundai Mobis / Kia, POSCO, Naver / Kakao / Coupang / Krafton (gaming) — Korea has world-class tech/automotive/entertainment sectors that absorb US-educated graduates. For male applicants, include military service plan: complete service before US study OR defer with 출국허가 and serve after graduation.",
      },
      {
        heading: "Family ties + Korean cultural context",
        prompt: "List parents (occupation, location — Seoul / Busan / Daegu / Incheon / Daejeon / Gwangju / Suwon district level), siblings, partner. Mention Korean property — family apartment with 등기 (registered title), Korean bank accounts, Korean phone number for SMS-OTP. For male applicants, military service status explicitly with 병적증명서 (military record) attached.",
      },
    ],
    moneySavingTips: [
      "F-1 visa fee is $185; pay via Citibank Korea or Standard Chartered Korea — no reciprocity fee for Koreans",
      "Apostille via Korean MOFA: KRW 1,000-2,000/document, 2-3 working days",
      "Don't pay 'visa consultancy' agencies KRW 1-3M — DS-160 is free, US Embassy Seoul is efficient, agencies don't influence consular decisions",
      "Korean applicants are eligible for Fulbright Korea (~$30,000 + tuition for grad students), Korean Government Scholarship Program (KGSP — for returning Koreans), Samsung / LG / SK / Hyundai / Hanwha / Posco Foundation scholarships (chaebol scholarships are highly competitive)",
      "Many US universities have Korean-origin scholarship endowments — Harvard, MIT, Stanford, Yale, Columbia, USC, Texas, NYU all have named Korean-heritage funds",
      "KB Kookmin, Shinhan, Hana, Woori student remittance for tuition transfers — competitive vs retail; BOK educational outflow has no annual cap with admission proof",
      "Use Wise USD/KRW, Western Union, or BOK-approved educational remittance — Korean banks have streamlined educational outflow process",
      "Korean Embassy DC + Consulates (LA, NYC, SF, Chicago, Houston, Atlanta, Boston, Seattle, Honolulu) offer free notarisation for Korean citizens",
      "K-ETA reciprocity: US citizens currently visa-exempt for Korean entry under K-ETA; Korean students don't need US ESTA (have F-1)",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding, strong programme fit",
        "Standard Fulbright Korea or KGSP scholarship F-1 / J-1 application",
        "Renewal of existing F-1 at US Embassy Seoul during winter / summer breaks",
        "OPT or STEM OPT application during or after the programme",
        "Future transition from F-1 to H-1B / O-1",
      ],
      getALawyer: [
        "Prior US visa refusal (any category)",
        "Korean criminal record (DUI, drug under 마약류 관리법 are absolute disqualifier)",
        "Unresolved Korean military obligation (males 18-35 with active 출국허가 approaching expiry)",
        "STEM field with potential SAO sensitivity (nuclear, aerospace, advanced AI, advanced materials, dual-use biotech)",
        "Family member in Korean military / NIS / nuclear establishment",
        "Past US overstay or visa flag",
        "Funding from a sponsor outside Korea / immediate family",
        "Transfer from UK/Canadian/Australian/Japanese student visa to US F-1",
        "Same-sex partner accompanying — Korea doesn't recognise same-sex marriage; US recognises; F-2 derivative for same-sex spouse needs careful documentation",
        "Dual Korean-other passport (Korean-American adoptee with US citizenship — apply via US passport, not Korean)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // JAPANESE → US — study
  // ════════════════════════════════════════════════════════════════════

  "JP:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from a SEVP-certified US school + SEVIS I-901 paid",
        why: "Japan sends ~14,000 students to the US annually — declining from 1990s peak but stable. Your US institution issues Form I-20 (F-1) or DS-2019 (J-1) once admitted and proof-of-funds verified. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) before booking DS-160. Japanese applicants book at US Embassy Tokyo (Akasaka 1-10-5, Minato-ku — near Roppongi) or US Consulate General Osaka-Kobe / Naha. Tokyo and Osaka are most common. Japanese applicants have one of the lowest F-1 refusal rates globally (~3-5%) — documentation efficiency matters more than narrative.",
      },
      {
        label: "Source-of-funds + Japanese family financial culture",
        why: "Show 1st-year tuition + living costs ($40-80k). Document Japanese bank statements (Mizuho 銀行, MUFG 三菱UFJ, SMBC 三井住友, Japan Post Bank ゆうちょ銀行, Resona, Aozora) with USD-equivalent at BOJ rate. Japanese families demonstrate funds via savings accounts (普通預金), time deposits (定期預金), and stock holdings (NISA, 持ち株). Lump-sum deposits are uncommon and don't trigger 214(b) concerns for Japanese applicants as they would for some other origins.",
      },
      {
        label: "Japanese academic transcripts + Apostille via MOFA",
        why: "Japanese 高校卒業証明書 (high school graduation certificate), 大学卒業証明書 (university graduation), 成績証明書 (transcripts) need Apostille via Japan MOFA (外務省) at Kasumigaseki Tokyo or Honmachi Osaka. Cost JPY 400 per Apostille, same-day in-person submission, 5-7 days by mail. WES, ECE, or AICE foreign credential evaluation for some US universities — particularly relevant for transfer students or graduate applicants from non-elite Japanese institutions.",
      },
      {
        label: "Japanese male military service status (NONE — Japan has no conscription)",
        why: "Japan has NO compulsory military service since the post-WWII constitution. Japanese males have no military obligation to document — significant simplification compared to Korean / Taiwanese / Chinese applicants. Self-Defense Forces (Jieitai 自衛隊) are voluntary; if you served in JSDF, document service period and discharge documents (退職証明書), useful for some role-related security clearances at US universities.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Japanese elite universities",
        prompt: "Japan has elite universities (Imperial 7 = Tokyo 東京大学, Kyoto 京都大学, Tohoku 東北, Nagoya 名古屋, Osaka 大阪, Hokkaido 北海道, Kyushu 九州; plus Keio 慶応義塾, Waseda 早稲田, Hitotsubashi 一橋, Tokyo Tech 東京工業大学). Explain why your US programme offers something unique — research lab, specific professor, industry network (Silicon Valley for CS, Wall Street for finance, Boston for biotech, LA for entertainment), specialised programme. Vague 'I want to experience American education' is a weak case — Japanese students are well-served by domestic universities.",
      },
      {
        heading: "Funding — Japanese family / scholarship / Fulbright Japan",
        prompt: "Quantify: tuition $X, living $Y, total Year 1 $Z. Then show coverage: family contribution JPY X (with bank statement, parents' source-of-income certificate 源泉徴収票, salary slip 給与明細書), scholarship (Fulbright Japan, Watanabe Trust UK, Japan Student Services Organization JASSO scholarship, Yoneyama Memorial Foundation, Nakajima Foundation, Tobitate! Young Ambassadors Program). Japanese banks issue 'Certificate of Deposit Balance' (預金残高証明書) — standard at consular interview.",
      },
      {
        heading: "Post-graduation plan — your return to Japan",
        prompt: "F-1 requires intent to return. State which Japanese sector: Sony / Nintendo / Sega / Square Enix / Bandai (gaming + entertainment), Toyota / Honda / Subaru / Nissan / Mazda / Suzuki (automotive), Mitsubishi / Mitsui / Sumitomo / Itochu / Marubeni (trading houses), Takeda / Astellas / Daiichi-Sankyo (pharma), Mizuho / MUFG / SMBC (banking), Hitachi / NEC / Fujitsu / Panasonic / Sharp (industrial), or academic return (Japanese university faculty positions value US-PhDs heavily). If you want OPT briefly mention but emphasise return.",
      },
      {
        heading: "Family ties + Japanese culture context",
        prompt: "List parents (occupation, location — Tokyo / Yokohama / Osaka / Nagoya / Sapporo / Fukuoka / Sendai prefecture level), siblings, partner. Mention Japanese property — family home with 不動産登記 (real estate registration), Japanese bank accounts, Japanese mobile number for SMS-OTP. Japan permits dual nationality only until age 22 (Article 14 Nationality Act — enforcement is lax but state your awareness). For sponsorship at religious or family-business roles, additional context may help.",
      },
    ],
    moneySavingTips: [
      "F-1 visa fee is $185; pay via Shinsei Bank or SMBC Trust Bank counters in JPY — no reciprocity fee for Japanese citizens",
      "Apostille via Japan MOFA Tokyo (Kasumigaseki) or Osaka (Honmachi): JPY 400/document, same-day in-person",
      "Don't pay 'visa consultancy' agencies JPY 200,000-1,000,000 — DS-160 is free, US Embassy is efficient",
      "Japanese applicants are eligible for Fulbright Japan (~$30,000 + tuition for grad students — apply through Japan-US Educational Commission), JASSO (Japan Student Services Organization) Long-term Study Abroad scholarship, Watanabe Trust Scholarship (full-funded master's at top UK/US schools)",
      "Tobitate! Young Ambassadors Program — Japanese government scholarship for undergraduate / high-school students; covers everything for short-term US study abroad",
      "Many US universities have Japanese-origin scholarship endowments — Harvard, MIT, Stanford, Yale, Columbia, USC, Texas all have named Japanese-heritage funds",
      "MUFG, Mizuho, SMBC educational remittance for tuition transfers — competitive vs retail; BOJ has no annual cap on educational outflow with admission proof",
      "Japanese Embassy DC + Consulates (LA, NYC, SF, Chicago, Houston, Atlanta, Boston, Seattle, Honolulu, Detroit, Anchorage, Hagåtña, Portland, Nashville) offer free notarisation for Japanese citizens",
      "ESTA reciprocity: US citizens visa-exempt for Japanese entry under visa waiver; Japanese students don't need ESTA (have F-1)",
      "Use Wise USD/JPY, Western Union, or MoneyGram for low-volume remittance; SMBC / Mizuho / MUFG for large educational transfers",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding, strong programme fit",
        "Standard Fulbright Japan / Tobitate / JASSO scholarship F-1 / J-1 application",
        "Renewal of existing F-1 at US Embassy Tokyo / Consulate Osaka-Kobe / Naha during winter / summer breaks",
        "OPT or STEM OPT application during or after the programme",
      ],
      getALawyer: [
        "Prior US visa refusal (any category — rare for Japanese)",
        "Japanese criminal record (DUI, drug under 麻薬及び向精神薬取締法, organised-crime affiliation — Japan rigorously checks)",
        "STEM field with potential SAO sensitivity (nuclear, aerospace, advanced AI, advanced materials, dual-use biotech)",
        "Family member in Japanese military / JSDF / nuclear establishment",
        "Past US overstay or visa flag",
        "Funding from a sponsor outside Japan / immediate family",
        "Transfer from UK/Canadian/Australian/Korean student visa to US F-1",
        "Same-sex partner accompanying — Japan doesn't recognise same-sex marriage federally (some prefectures do); US recognises; F-2 derivative for same-sex spouse needs careful documentation",
        "Dual Japanese-other passport (Japanese-American with US citizenship — apply via US passport)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // POLISH → DE — work
  // ════════════════════════════════════════════════════════════════════

  "PL:DE:work": {
    whatCarriesWeight: [
      {
        label: "EU freedom of movement — no work permit needed for Polish citizens since 2011",
        why: "Poland joined EU 2004; restrictions on Polish workers in Germany lifted 2011 under transitional provisions. Polish citizens have full freedom of movement under TFEU Article 45 — no work permit, no visa, no residence permit required. Simply move to Germany and register with the local Bürgeramt (Anmeldung) within 14 days of arrival. Polish-German worker migration is one of Europe's largest corridors — ~2 million Poles in Germany (largest non-German EU group).",
      },
      {
        label: "Anmeldung + Steuer-ID + Krankenkasse registration — the practical bottlenecks",
        why: "Within 14 days of arrival, register your address (Anmeldung) at the local Bürgeramt — required for everything else. Anmeldung issues Anmeldebescheinigung (registration certificate). With it, you get Steueridentifikationsnummer (tax ID) automatically by mail in 2-3 weeks. Register with German health insurance (gesetzliche Krankenversicherung — TK, AOK, Barmer, DAK at ~14.6% of salary split with employer; OR private Krankenversicherung above €69,300 salary threshold). Without Krankenkasse, employer can't run payroll.",
      },
      {
        label: "Polish-German social-security coordination + ZUS / Deutsche Rentenversicherung",
        why: "Under EU Regulation 883/2004, Polish and German pension contributions count toward each other (totalization). Polish ZUS contributions made before German move count toward eventual German Rente; German Rentenversicherung contributions count toward eventual Polish ZUS pension. For short-term postings (up to 24 months), Polish workers can stay on ZUS via 'A1 form' (formerly E101) issued by ZUS Polish office — exempting from German Rentenversicherung. Beyond 24 months, switch to German Rentenversicherung; Polish years count toward eventual benefit calculation.",
      },
      {
        label: "Polish qualification recognition — automatic for regulated EU professions",
        why: "EU Mutual Recognition of Professional Qualifications Directive (2005/36/EC, amended 2013/55/EU) gives automatic recognition for certain professions: doctors, dentists, nurses, midwives, pharmacists, veterinary surgeons, architects. Polish lekarz (doctor), pielęgniarka (nurse), pielęgniarz (male nurse) qualifications are automatically valid in Germany after Anerkennung formality. Other regulated professions (lawyer, accountant, teacher, engineer) require Anerkennung process — typically faster for Polish applicants given EU/EEA framework.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "No personal statement needed at the border — Polish citizens travel freely",
        prompt: "Unlike non-EU visa applications, Polish-German movement requires no narrative or documentation at the border. You travel with Polish passport or Polish dowód osobisty (national ID card). However, Anmeldung at Bürgeramt does require: passport/ID, completed Anmeldeformular (registration form), Wohnungsgeberbestätigung (landlord's confirmation of your residence — replaces older Mietvertrag requirement). Bring these to your appointment.",
      },
      {
        heading: "Settlement plan — German employer, city, integration",
        prompt: "While not required by visa officers, you'll need to plan: which German city (Berlin / Hamburg / München / Köln / Frankfurt / Stuttgart / Düsseldorf — large Polish diasporas in NRW Nordrhein-Westfalen and Berlin), which sector (automotive Stuttgart-Wolfsburg, finance Frankfurt, tech Berlin-München, healthcare across Germany), language plan (Polish bilingual schools available in NRW; Berlin Polish School). State your specific German employer name + branch.",
      },
      {
        heading: "Long-term plan — German citizenship, retain Polish, or rotation",
        prompt: "Germany's 2024 citizenship reform allows dual citizenship — Polish-German dual nationality fully permitted now (previously Polish-Germans had to renounce). Naturalisation after 5 years legal residence (3 years with C1 German + special integration including civic engagement); A1/B1 German required + Einbürgerungstest. Many Poles maintain Polish citizenship while gaining German — useful for Polish family ties, Polish property, eventual EU mobility flexibility.",
      },
      {
        heading: "Family + dependants + Polish school year",
        prompt: "EU family members travel freely with you — spouse, registered partner (Lebenspartnerschaft equivalent), minor children, dependent adult children, dependent parents under EU framework. Polish school year (September-June, aligns with German August/September-July) means children can enrol mid-year if arriving outside the standard intake window. Polish schools in Germany (Szkoła Polska im. Adama Mickiewicza, Polish School at Polish Embassy Berlin) supplement German schools for cultural / linguistic continuity.",
      },
    ],
    moneySavingTips: [
      "EU citizens pay NO immigration fees in Germany — Anmeldung is FREE at Bürgeramt",
      "Don't pay 'Polish-German migration consultancies' EUR 1,500-5,000 for what is paperwork-free EU travel + Anmeldung",
      "Free Anmeldung appointment booking at Bürgeramt Berlin / Hamburg / München / Köln etc. websites — book 2-4 weeks ahead",
      "A1 form from ZUS Poland is FREE — exempts German Rentenversicherung for up to 24 months for posted workers; ZUS-side application via PUE ZUS portal",
      "Open N26, Commerzbank, DKB, or Sparkasse account before flying — all accept Polish ID + Polish address",
      "Free German language courses for EU citizens at Volkshochschule (municipal community college) — A1-B2 German courses €100-500 (subsidised)",
      "Integration course (Integrationskurs) for B1 German + civic knowledge is FREE for EU citizens who need it for naturalisation",
      "Polish doctors / nurses in Germany earn €30k-80k+/year — significantly above Polish average; Anerkennung process for medics is fast",
      "Tax treaty Germany-Poland (1972, protocol 2003) prevents double-taxation; CSO Poland and Bundeszentralamt für Steuern coordinate",
      "Free Polish school enrolment in NRW + Berlin — Polish-language education supplements German state schools",
    ],
    lawyerTriggers: {
      diy: [
        "EU freedom of movement entry to Germany (no visa needed)",
        "Standard Anmeldung at Bürgeramt with Polish passport + Wohnungsgeberbestätigung",
        "Polish doctor / nurse / midwife / pharmacist Anerkennung via Bezirksregierung",
        "Naturalisation application after 5 years residence (3 years with C1 + integration)",
        "EU family-member visa for non-EU spouse / children of Polish citizen",
      ],
      getALawyer: [
        "Polish criminal record affecting Anerkennung for regulated profession (German Ärztekammer / Pflegekammer scrutinise)",
        "Past German entry ban / Schengen overstay flagged on Polish-side records",
        "Non-EU spouse needing EU family-member visa (technical, requires care)",
        "Polish pension claim coordination with German Rentenversicherung when retiring",
        "Loss of Polish citizenship (renunciation) for some legal reason — unusual",
        "Complex tax-residency split (working in Germany, Polish family business, dual home country)",
        "Polish-German child custody or family dispute with both countries' courts involved",
        "Polish-German cross-border worker (Grenzgänger) status — different tax / social-security implications",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // ROMANIAN → ITALY — work
  // ════════════════════════════════════════════════════════════════════

  "RO:IT:work": {
    whatCarriesWeight: [
      {
        label: "EU freedom of movement — no work permit needed for Romanian citizens since 2014",
        why: "Romania joined EU 2007; restrictions on Romanian (and Bulgarian) workers in Italy lifted 2014. Romanian citizens have full freedom of movement under TFEU Article 45 — no work permit, no visa. Simply move to Italy and register with the local Comune (anagrafe) within 90 days for residenza. Romanian-Italian worker migration is one of Europe's largest corridors — ~1.1 million Romanians in Italy (largest non-Italian EU group); concentrated in caregiving (badanti), construction, agriculture, hospitality, and increasingly white-collar.",
      },
      {
        label: "Anagrafe registration + Codice Fiscale + Tessera Sanitaria",
        why: "Within 90 days of arrival, register at local Comune anagrafe for Italian residenza. Required documents: Romanian passport/CI, lease (contratto di locazione) or letter from landlord, proof of work / sufficient funds (~€7,500/year per adult + €5,500 per dependent). Once registered, you receive Codice Fiscale (Italian tax ID) — required for everything from employment contract to bank account to SIM card. Register with SSN (Servizio Sanitario Nazionale) for Tessera Sanitaria (health card) — Romania-Italy EU coordination ensures automatic transfer of Romanian CAS contributions.",
      },
      {
        label: "Romanian-Italian social-security coordination + CAS / INPS",
        why: "Under EU Regulation 883/2004, Romanian CAS (Casa Asigurari de Sanatate) contributions and INPS contributions count toward each other. Romanian pensions: Casa Naţională de Pensii Publice (CNPP) Romanian pension contributions coordinated with Italian INPS via A1 form for posted workers (≤24 months) or full INPS transfer for permanent move. Romanian tax: Romania left worldwide-income taxation as of 2018 reform; Italy taxes worldwide income for tax-residents (>183 days/year).",
      },
      {
        label: "Romanian qualification recognition — automatic EU professional recognition",
        why: "EU Mutual Recognition of Professional Qualifications Directive applies to Romanian doctors, dentists, nurses, midwives, pharmacists, veterinary surgeons, architects — automatic recognition in Italy. Other regulated professions (lawyer Avvocato, accountant Dottore Commercialista, engineer Ingegnere) require recognition (riconoscimento) process. For Romanian psihologi (psychologists), psicologi (Italian equivalent) — recognition via Ordine degli Psicologi varies by region. Romanian-Italian linguistic kinship (both Romance languages) makes integration smooth.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "No personal statement needed at the border — Romanian citizens travel freely",
        prompt: "Unlike non-EU visa applications, Romanian-Italian movement requires no narrative at the border. Travel with Romanian passport or Romanian carte de identitate (national ID card). For Comune anagrafe registration you'll need: passport/CI, lease contract or landlord's letter (Italian: dichiarazione di ospitalità), proof of employment or sufficient funds, photo for tessera.",
      },
      {
        heading: "Settlement plan — Italian region, employer, integration",
        prompt: "While not required by visa officers, plan: which Italian region (Veneto and Lombardia have large Romanian populations; Roma and Milano white-collar; Sicily for elderly care). State Italian employer name + branch. Italian regulated professions need riconoscimento with Italian-language proficiency (B2 typical) — for caregivers/badanti the language requirement is lower but still important for cultural integration.",
      },
      {
        heading: "Long-term plan — Italian citizenship, retain Romanian, or rotation",
        prompt: "Italy permits dual citizenship with EU members; Romania permits dual citizenship. Naturalisation in Italy after 10 years legal residence (down from 4 only available under EU treaty interpretation that doesn't apply post-Romania-EU-membership scrutiny). For Romanian-Italian dual nationality: rare to renounce Romanian citizenship; most Italian-naturalised Romanians retain both passports.",
      },
      {
        heading: "Family + dependants + Romanian school year",
        prompt: "EU family members travel freely with you. Romanian spouse, minor children, dependent adult children, dependent parents under EU framework. Romanian-language schools in Italy (Şcoala Românească in Roma, Milano, Torino) supplement Italian state schools. Romanian Orthodox Church communities concentrated in major cities provide cultural / spiritual support.",
      },
    ],
    moneySavingTips: [
      "EU citizens pay NO immigration fees in Italy — Comune anagrafe registration is FREE",
      "Codice Fiscale issuance is FREE at Agenzia delle Entrate (Italian Revenue Agency) — bring Romanian passport/CI",
      "Tessera Sanitaria (health card) is FREE via SSN registration at ASL (Azienda Sanitaria Locale)",
      "Don't pay 'Romanian-Italian migration consultancies' EUR 800-3,000 for paperwork-free EU travel + registration",
      "Comune anagrafe appointment: book online via Comune website (Roma, Milano, Torino, Napoli, Verona, Bologna all have e-services)",
      "A1 form from CNPP / CAS Romania: FREE — exempts INPS Italian social security for up to 24 months for posted workers",
      "Open Intesa Sanpaolo, UniCredit, BNL BNP Paribas, Banca Popolare di Milano, or Mediolanum account — all accept Romanian ID + Italian address",
      "Free Italian language courses at CTP (Centri Territoriali Permanenti) for adult education — A1-B2 Italian courses €100-300 (subsidised)",
      "EU regulated profession recognition is FREE via Ministero della Salute / Ministero della Giustizia — don't pay 'professional recognition agencies' EUR 1,000+",
      "Tax treaty Italy-Romania (1977, protocol 2007) prevents double-taxation; ANAF Romania and Agenzia delle Entrate Italy coordinate automatically",
      "Romanian-Italian remittance: Western Union, Wise, MoneyGram, Sigue, or direct Banca Italo-Romena — competitive rates",
    ],
    lawyerTriggers: {
      diy: [
        "EU freedom of movement entry to Italy (no visa needed)",
        "Standard Comune anagrafe registration with Romanian passport + lease",
        "Romanian doctor / nurse / midwife / pharmacist riconoscimento via Ministero della Salute",
        "Italian naturalisation application after 10 years residence",
        "EU family-member visa for non-EU spouse / children of Romanian citizen",
      ],
      getALawyer: [
        "Romanian criminal record affecting professional recognition (Italian Ordine dei Medici / Ordine degli Avvocati scrutinise)",
        "Past Italian entry ban / Schengen overstay (pre-Romania EU accession)",
        "Non-EU spouse needing EU family-member visa",
        "Romanian pension claim coordination with INPS when retiring in Italy",
        "Complex Romanian-Italian tax residency split (working in Italy, Romanian family business)",
        "Romanian-Italian child custody disputes",
        "Past EU expulsion / public-order ban from another EU state affecting Italian entry",
        "Pre-1990 Romanian Securitate file connection (very rare but historically sensitive)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // VIETNAMESE → JAPAN — work
  // ════════════════════════════════════════════════════════════════════

  "VN:JP:work": {
    whatCarriesWeight: [
      {
        label: "Specified Skilled Worker (Tokutei Ginō) + Technical Intern Training Program (TITP) routes",
        why: "Japan has been Vietnam's largest white-collar / blue-collar work migration destination since 2018. Two main routes: Specified Skilled Worker (Tokutei Ginō i / ii — 特定技能 — covers 12 industries including construction, agriculture, fisheries, food service, hospitality; ~5-year initial duration, family possible after ii promotion), and Technical Intern Training Program (TITP / Ginō Jisshū — gradually being phased into Tokutei Ginō; previous 3-5 year intern program with mixed labour-rights record). 2024-2025: Japan launched 'Ikuseishu Romu' replacement program for TITP, simplifying transition to Tokutei Ginō and granting greater worker mobility.",
      },
      {
        label: "Specialist (Engineer/Specialist in Humanities/International Services) — for university-degree-holding Vietnamese",
        why: "University-educated Vietnamese (often from Bach Khoa Hanoi / HCMUS / FTU / NEU) use the Engineer/Specialist in Humanities/International Services (技術・人文知識・国際業務) visa — degree-required, but no industry restriction beyond degree-role match. Major employers: Honda Vietnam → Honda Japan, Toyota → Toyota R&D, Samsung Vietnam (Korean) → Samsung Japan branches, Vietnamese-tech expats at Rakuten, LINE Yahoo, Mercari, Toshiba. Salary minimum ~JPY 3.5-5M/year for entry-level professional.",
      },
      {
        label: "Japanese language requirement + JLPT N4 minimum (Tokutei Ginō) or N2/N1 (Specialist)",
        why: "Tokutei Ginō i requires JLPT N4 (basic — ~250-300 hours study) + industry skills test. Tokutei Ginō ii requires JLPT N3 + advanced skills test. Engineer/Specialist visa officially has no language requirement but practically N3 or higher needed. For nursing / caregiving (Tokutei Ginō kaigo): JLPT N4 + Kaigo Nihongo (caregiver-specific Japanese test). Vietnamese applicants train at JLPT centres in Hanoi (VJCC, Sakura), HCMC (East-West, Sakura), Da Nang.",
      },
      {
        label: "Vietnamese sending organisation + Japanese receiving organisation registration",
        why: "Vietnamese DOLAB (Department of Overseas Labour, formerly DOLAB-MOLISA) regulates worker dispatch — only licensed sending organisations (송출기관 in Korean equivalent — Việt Nam tổ chức gửi lao động) can recruit. Japanese receiving organisation must be MOJ (Ministry of Justice)-registered as accepting Tokutei Ginō workers. Vietnamese applicants pay sending-organisation fees (capped at VND 33M / ~JPY 200,000 for Tokutei Ginō under 2024 Vietnamese government regulation, lower than previous TITP-era VND 100M+ that frequently caused worker debt bondage). Avoid unlicensed brokers — DOLAB website lists licensed sending organisations.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — Tokutei Ginō i/ii, Engineer/Specialist, or other",
        prompt: "State explicit visa category. Tokutei Ginō i (12 industries, JLPT N4 + skills test, 5-year initial, family not generally allowed during i), Tokutei Ginō ii (after passing N3 + advanced skills test, family possible, longer duration), Engineer/Specialist (degree + degree-role match), TITP transitioning to Ikuseishu Romu (2024+ reform), Special Highly Skilled Professional (high-skill points calculator). Choose based on your education, Japanese language level, and career trajectory.",
      },
      {
        heading: "Your Vietnamese work history + Japanese language journey",
        prompt: "List every Vietnamese employer with month-precision dates, role, salary in VND, supervisor name + Zalo/email. Include Vietnamese tax ID (Mã số thuế cá nhân — MST), social insurance number (Sổ bảo hiểm xã hội), and any Vietnamese professional body memberships. Document Japanese language progression: enrolment date in Japanese course (with study hours), JLPT level achieved + certificate, industry-specific skills test results, internship if any.",
      },
      {
        heading: "Sending organisation + Japanese receiving organisation",
        prompt: "Vietnamese sending organisation (tổ chức đưa người đi lao động ngoài nước) name + DOLAB licence number — verify on DOLAB website. Japanese receiving organisation name + MOJ registration. Many Tokutei Ginō Vietnamese workers come through reputable sending organisations like Bestcom, Esuhai, IZ Group, AHO Group, Hihako, Goh Việt Nam, JCS Việt Nam, Olympia, ISTV. Don't sign with unlicensed brokers.",
      },
      {
        heading: "Long-term plan — Tokutei Ginō ii promotion, return to Vietnam, or settlement",
        prompt: "Tokutei Ginō i is officially temporary (5 years, no family except in rare exceptions); Tokutei Ginō ii after passing N3 + advanced skills test allows family, longer duration, and theoretically path to Permanent Residence (PR) after 10 years total residence. Engineer/Specialist allows family + path to PR (5 years standard, 1-3 years via Highly Skilled Professional). State plan: temporary 5-year Tokutei Ginō i + return to Vietnam with skills and savings (most common), promotion to Tokutei Ginō ii + family settlement, or Engineer/Specialist route to PR.",
      },
    ],
    moneySavingTips: [
      "Tokutei Ginō visa: receiving employer pays initial visa-related fees (Japan-side); Vietnamese sending organisation fees capped at VND 33M (2024 regulation) — refuse any payment beyond this; report to DOLAB if asked for more",
      "Don't use unlicensed Vietnamese brokers (cò lao động) charging VND 100-300M for Tokutei Ginō — illegal under 2020 Vietnamese Worker Going Overseas Law; DOLAB licensed organisations have transparent fee structures",
      "Free Japanese language courses for Tokutei Ginō workers at sending organisation training centres — typically 3-6 months pre-departure",
      "JLPT registration: VND 1,500,000 (N5) to VND 2,500,000 (N1) at official Japanese-Vietnamese centres",
      "Free pre-departure orientation (PDO) at DOLAB and sending organisation — covers Japanese culture, labour law, emergency contacts",
      "Open MUFG, SMBC, Mizuho, or Japan Post Bank account on arrival (with Residence Card + work permit) — Japan Post is most foreigner-friendly with minimal documentation",
      "Use Western Union, Wise VND/JPY, BIDV Remit, or Japan Post Bank international transfer for remittance to Vietnam — competitive rates",
      "End of employment: Tokutei Ginō workers eligible for nenkin (national pension) lump-sum refund — claim within 2 years of leaving Japan via Japan Pension Service",
      "Use Vietnamese Embassy Tokyo / Consulate Osaka services free for document attestation — don't pay 'Vietnamese-Japan migration consultancies'",
      "Tokutei Ginō ii promotion exam: free industry-specific skills test + N3 JLPT — Japanese employer often pays preparation course",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Tokutei Ginō i application via licensed sending organisation + receiving organisation",
        "Engineer/Specialist visa for university-degree-holding Vietnamese with Japanese employer",
        "JLPT N4 + industry skills test preparation and exam",
        "Status of Residence renewal at regional Immigration Bureau",
        "Tokutei Ginō i → ii promotion via N3 + advanced skills test",
        "Nenkin lump-sum refund claim on departure",
      ],
      getALawyer: [
        "Past Vietnamese sending-organisation fraud / overcharging (>VND 33M for Tokutei Ginō)",
        "Past Japan TITP escape / dispute / labour-rights violation case",
        "Vietnamese criminal record (anti-narcotics, smuggling, labour-export-fraud-involvement)",
        "Switching Japanese sponsor within Tokutei Ginō (now easier under 2024 Ikuseishu Romu reform but case-by-case)",
        "Bringing same-sex partner — Vietnam permitted same-sex relations 2000 (without legal recognition); Japan doesn't recognise same-sex marriage; no derivative visa path",
        "Past Japan deportation or overstay",
        "Complex degree-role mismatch for Engineer/Specialist visa",
        "Special-status holder (Mongolian-Vietnamese ethnic minority, Hmong ethnic minority) needing additional documentation",
        "Pregnancy during Tokutei Ginō contract — Japanese labour law protects but practical complications",
        "Past Vietnamese asylum-related family member case in any Asia-Pacific country",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // PORTUGUESE → US — work
  // ════════════════════════════════════════════════════════════════════

  "PT:US:work": {
    whatCarriesWeight: [
      {
        label: "E-1 / E-2 Treaty Trader / Investor via the Portugal-US 1840 Treaty",
        why: "Portugal has the oldest US Treaty of Friendship, Commerce and Navigation (1840) — predates almost every other US-EU treaty relationship. E-1 (substantial trade between Portugal and US) and E-2 (substantial Portuguese investment in US business) are major routes for Portuguese entrepreneurs. E-2 has no statutory minimum but $100k+ in a real US enterprise is the practical floor. Portuguese-American business community is concentrated in Massachusetts (Fall River, New Bedford, Cambridge) and New Jersey (Newark, Elizabeth) — strong existing diaspora networks for E-2 startups.",
      },
      {
        label: "H-1B Specialty Occupation OR L-1 intracompany via Portuguese parent",
        why: "Portuguese applicants compete in standard H-1B (March lottery, 85k slots — win rate ~30-35%). L-1A/B (intracompany transfer) bypasses lottery if you've worked 1+ year at Portuguese parent (Galp Energia, EDP, Jerónimo Martins, Sonae, Mota-Engil, Navigator Company, Pestana Hotels, NOS, Altri, Cofina, GS Yuasa Lithium Energy Portugal). Major US destinations: Boston (tech + biotech, large Portuguese diaspora), NY (finance), Miami (Latin business + Brazilian-Portuguese-American crossover), LA (entertainment, Madeira / Azores diaspora).",
      },
      {
        label: "Apostilled Portuguese degrees + ECE/WES credential evaluation",
        why: "Portuguese degrees (Licenciatura, Mestrado, Doutoramento) need Apostille via Portuguese Procuradoria-Geral da República (PGR — Portugal is Hague signatory since 1968). Cost EUR 10-25/document. For US licensure (medicine, law, accounting, engineering PE) WES, ECE, or AICE foreign credential evaluation. Portuguese 3-year Licenciatura (post-Bologna) typically maps to US Bachelor's; Mestrado to US Master's. Portuguese medical degrees (Licenciatura em Medicina from Universidade de Lisboa / Porto / Coimbra) need separate USMLE pathway for US practice.",
      },
      {
        label: "US-Portugal Totalization Agreement (1989) + tax treaty",
        why: "Get a Certificate of Coverage (CoC) from Portuguese Caixa Geral de Aposentações or Segurança Social — keeps you on Portuguese Segurança Social for up to 5 years on temporary US assignment, exempt from US Social Security/Medicare. Beyond 5 years switch to US system; Portuguese quarters count toward future Portuguese pension via Totalization. Tax treaty Portugal-US (1994) prevents double-taxation on salary; Portuguese exit-tax considerations on substantial holdings (Lei Geral Tributária Articles 167 and 167-A).",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why the US — sector, employer, and Portuguese-American community ties",
        prompt: "Portuguese applicants benefit from specificity. Tech (Silicon Valley, NYC, Boston), finance (NYC, Chicago), biotech (Boston), entertainment (LA — Portuguese-American film, music), hospitality (Florida, NV — Pestana / Vila Galé / Sana Hotels expanding US presence). Mention Portuguese-American business networks (Portuguese-American Chamber of Commerce, Luso-American Foundation, BES USA legacy connections).",
      },
      {
        heading: "Your Portuguese employer / academic credentials",
        prompt: "List Portuguese employer chronologically, role, salary in EUR with USD equivalent, supervisor name. Portuguese universities (Universidade de Lisboa, Universidade do Porto, Universidade Católica Portuguesa, Universidade Nova, ISCTE-IUL, Universidade do Minho, Universidade de Aveiro) are well-known to US Embassy Lisbon. For L-1, document the 12+ month qualifying employment at Portuguese parent.",
      },
      {
        heading: "Long-term plan — H-1B + green card, E-2 indefinite, or temporary",
        prompt: "H-1B and L-1 allow dual intent — green-card plans openly stated (EB-2/EB-3 via PERM). E-2 is non-immigrant but renewable indefinitely. Portugal permits dual citizenship; US permits dual citizenship. State honest plan. Portuguese-American community is concentrated — mention specific city you'll settle if relevant (Fall River MA, Cambridge MA, Newark NJ, Mineola NY, Pawtucket RI all have large Portuguese populations).",
      },
      {
        heading: "Family + dependants + Portuguese school year",
        prompt: "Spouse on L-2: automatic work authorization since 2023; H-4 spouse needs EAD (limited). E-2 spouse gets E-2D with full work rights. Portuguese spouse + children under 21 are derivative. Portuguese school year (mid-September to mid-June) — children can transition to US August/September start with minimal disruption. International schools in Lisbon / Porto (Lisbon American School, Carlucci American International School, Oporto British School) ease US transition.",
      },
    ],
    moneySavingTips: [
      "DS-160 fee $185 (H-1B/L-1) or $315 (E-1/E-2); pay in EUR at Citibank Portugal or Millennium BCP — no reciprocity fee for Portuguese citizens",
      "Use WES iGPA Calculator (free online) before paying for full evaluation",
      "Apostille via Portuguese PGR / Conservatória do Registo Civil: EUR 10-25/document, 5 working days; don't use 'apostille agencies' charging EUR 200+",
      "Open a US-domiciled bank account with Wise USD, Mercury Business, or Millennium BCP US (Newark NJ branch — Portuguese diaspora-friendly) before relocation",
      "Portuguese Embassy DC + Consulates (Boston, Newark, NYC, SF, Providence RI, New Bedford MA, Hartford CT, Pawtucket RI) offer free notarisation for Portuguese citizens",
      "Avoid Portuguese 'consultoria de imigração' charging EUR 3,000-10,000 for H-1B/L-1 — US-based attorneys at Fragomen, Berry Appleman, BAL have flat-fee Portuguese services at $2,500-3,500",
      "Use Caixa Geral de Depósitos, BPI, Santander Totta, or Millennium BCP for tuition / large remittance — competitive vs Wise for high-volume transfers",
      "Plan Portuguese tax exit carefully — Portuguese tax-resident if you spend >183 days/year in Portugal or maintain habitual residence; file final IRS return for year of departure",
      "Portuguese Golden Visa programme was significantly restricted in 2023 — affects E-2 vs Golden Visa choice if you have substantial investment",
      "Use Wise, Western Union, or Revolut for low-volume EUR/USD remittance — competitive vs traditional bank transfer",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B / L-1 with named US employer, clean record, clear Portuguese degree mapping",
        "DS-160 interview prep at US Embassy Lisbon",
        "Spouse / dependent derivative applications (H-4, L-2, E-2D)",
        "Renewal of existing H-1B / L-1 at US Embassy Lisbon during home leave",
        "PERM-based EB-2 / EB-3 green card (Portuguese are current — no per-country backlog)",
      ],
      getALawyer: [
        "E-1 Treaty Trader — substantial trade between Portugal and US needs evidentiary support",
        "E-2 Treaty Investor — substantiality, source-of-funds, 'real and operating' enterprise tests; Portuguese Golden Visa-related capital can complicate E-2 source-of-funds",
        "EB-1A / EB-1B / O-1 — extraordinary ability petitions",
        "Concurrent Portuguese exit-tax considerations on substantial holdings",
        "Prior US visa refusal or US overstay",
        "Portuguese criminal record — disclosure to USCIS / DOS mandatory",
        "Past Portuguese Golden Visa investor status with complex source-of-funds documentation",
        "Same-sex spouse — Portugal recognised same-sex marriage 2010; US recognises; derivative visas straightforward",
        "Dual Portuguese-Brazilian / Portuguese-CPLP-country / Portuguese-other passport — apply via Portuguese passport",
        "Portuguese-Macanese SAR passport holder applying via Portuguese (not Chinese) passport",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // IRANIAN → CANADA — study
  // ════════════════════════════════════════════════════════════════════

  "IR:CA:study": {
    whatCarriesWeight: [
      {
        label: "Study Permit + Canadian Designated Learning Institution (DLI)",
        why: "Iran sends ~17,000 students to Canada annually — the largest Middle Eastern student cohort. Your Canadian institution must be on the IRCC Designated Learning Institutions (DLI) list. Apply for Study Permit online or via VFS Global Tehran / Ankara / Istanbul / Dubai — Canada closed its Tehran embassy in 2012, so Iranian applicants apply through Ankara, Istanbul, Dubai, or Abu Dhabi visa application centres. Processing 12-24 weeks (longer than other origins due to security screening).",
      },
      {
        label: "Heightened security screening (Section 11(1) / Section 34 IRPA)",
        why: "Iranian applicants face mandatory enhanced security screening under IRPA Section 11(1) and Section 34 (admissibility on security grounds — covers concerns about Iranian government, IRGC, terrorism financing, dual-use technology). STEM students (especially in nuclear, aerospace, advanced AI, advanced materials, biotech) face automatic background check with 6-18 month processing delays. CSIS (Canadian Security Intelligence Service) and partner agencies conduct the review. Disclose every Iranian government / military / IRGC affiliation, however peripheral.",
      },
      {
        label: "Proof of funds + GIC alternative + Iranian sanctions banking workarounds",
        why: "Show CAD$20,635 (single, 2024 figure) for living expenses + tuition + return airfare. Iranian banks (Bank Melli, Bank Saderat, Bank Mellat, Bank Pasargad, Bank Sepah) are heavily sanctioned — direct SWIFT transfers to Canada blocked. Iranian students typically use: GIC (Guaranteed Investment Certificate) from Scotiabank Iran-friendly program (CAD$20,635 transfer via third-country bank), bank-statement-via-Türkiye / UAE / Armenia / Georgia third-country relative, family wealth in Iran with Persian-language bank statements + IRR-to-CAD conversion at Tehran Stock Exchange rate.",
      },
      {
        label: "Iranian academic transcripts + translation + apostille-equivalent",
        why: "Iran isn't a Hague Apostille signatory. Iranian high school diploma (Diplom-e Mottavasete) and university transcripts (Madreke Karshenasi Bachelor, Karshenasi Arshad Master, Doctora) need: 1) issuing institution stamp + Iranian MOSRT (Ministry of Science, Research and Technology) verification for accredited universities — Sharif, Tehran, Isfahan University of Technology, Amirkabir, Iran University of Science and Technology, Shahid Beheshti, 2) Iranian MOFA legalisation, 3) Canadian embassy (currently Ankara / Istanbul / Dubai) authentication, 4) Persian-to-English notarised translation by sworn translator (Motarjem Rasmi). Cost IRR 5-15 million + CAD 50-150 + USD 100-300.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why Canada over US, UK, or European alternatives",
        prompt: "Iran has elite universities (Sharif University of Technology, University of Tehran, Amirkabir, Iran University of Science and Technology). Explain why Canada specifically — Canadian welcoming policy toward Iranian students, specific Canadian-Iranian academic links (Toronto, Vancouver, Montreal have large Iranian-Canadian diaspora), specific Canadian institution / professor / research lab, Canadian post-study work permit (PGWP) pathway. Reference Canadian-Iranian academic networks: Iranian Studies departments at UofT, UBC, McGill, Concordia.",
      },
      {
        heading: "Your Iranian academic record + post-graduation plan",
        prompt: "List every Iranian school / university with month-precision dates, GPA, supervisor / advisor name. Include Iranian National Code (Kart-e Melli — national ID), passport number. For PhD applicants, document research publications (Iranian + international), advisor relationship, intended Canadian research area. State post-graduation intent honestly: return to Iran (if Iranian government / university bonded), apply for Canadian Post-Graduation Work Permit (PGWP), eventual Permanent Residence via Express Entry / PNP, or onward migration. Canadian Study Permit doesn't require return intent (dual intent permitted).",
      },
      {
        heading: "Funding — Iranian family / GIC / Canadian-Iranian sponsor",
        prompt: "Quantify: tuition CAD$X, living CAD$20,635, total Year 1 CAD$Z. Then show coverage: family contribution IRR X (with Iranian bank statement, parents' employment in named Iranian sector — government, university, private business), GIC certificate CAD$20,635 from Scotiabank / RBC / TD Iran programs, scholarship (Iran's own Ministry of Science scholarship rare for Western study; Canadian university scholarships more common — see below). Iranian-Canadian relatives can act as financial co-sponsors via I-134-equivalent affidavit.",
      },
      {
        heading: "Family ties + Iranian cultural / political context",
        prompt: "List parents (occupation, location — Tehran / Mashhad / Isfahan / Karaj / Shiraz / Tabriz / Qom district level), siblings, partner. Disclose any Iranian government, IRGC, Basij, military, or political organization affiliation (yours or family's) — even peripheral. Mention Iranian property (with sanad-e malekiyat / title deed in parents' name), Iranian bank accounts. For male applicants, military service status: completed conscription (kart-e payan-e khedmat), exemption (kart-e moafiat), or deferral with study-abroad approval. Without resolution, future Iranian re-entry triggers conscription.",
      },
    ],
    moneySavingTips: [
      "Study Permit application fee CAD$150 + Biometrics CAD$85 — pay online via IRCC portal in CAD (no Canadian-side reciprocity adjustment for Iranians)",
      "GIC alternative: family-member-in-Canada-as-sponsor + bank statement from Iran via third-country (Türkiye / UAE / Armenia) — Scotiabank's IRC GIC program is most Iranian-friendly",
      "Iranian translation services: Tehran-based Motarjem Rasmi (sworn translator) IRR 300,000-800,000/page — significantly cheaper than Canada-based translation (CAD$30-60/page); list of certified translators at Iranian Judiciary website",
      "Many Canadian universities have Iranian-origin scholarship endowments — UofT, McGill, UBC, Waterloo, McMaster, Western, Alberta all have named Iranian-heritage funds or research-area-specific awards",
      "Specific Iranian scholarships: Iran Heritage Foundation Canada (UofT, McGill), Iranian Canadian Congress scholarships, Vahab Foundation, Fereshteh-Yegane Memorial Scholarship — apply via Canadian university international admissions",
      "Pre-departure orientation through Iranian student associations at Canadian universities — UofT Iranian Students Association, UBC Iranian Society, McGill Persian Society offer free pre-arrival info sessions via Zoom",
      "Use third-country remittance (Türkiye İşbank, Habib Bank Pakistan, Dubai-based exchange, Yerevan banks) — direct Iran-Canada banking is sanctioned; not legal advice but reflects actual Iranian student practice",
      "Iranian Embassy Ottawa (when open) free notarisation services — currently closed since 2012; use Iranian Interests Section at Pakistani Embassy in Ottawa or apply via Iranian-Canadian community organisations",
      "Avoid 'Iran-Canada migration consultancies' charging USD 5,000-30,000 — IRCC has its own free advisers; RCIC (Regulated Canadian Immigration Consultants) cost CAD$2,000-5,000 for full Study Permit + extension service",
      "Use Iranian bank statement + sworn translator + Toronto/Vancouver consular interview at VFS Global Dubai or Istanbul — the consular interview is the bottleneck",
    ],
    lawyerTriggers: {
      diy: [
        "First-time Study Permit with clean record, clear funding via GIC + family, top-DLI institution acceptance",
        "Standard PGWP (Post-Graduation Work Permit) application after completing 2+ years study",
        "Study Permit extension during programme",
        "Transfer between Canadian DLIs (notify both institutions; usually no new permit needed)",
      ],
      getALawyer: [
        "Prior Canadian visa refusal (study, work, visit) — refusal grounds carry forward",
        "Past Canadian Study Permit cancellation",
        "Iranian government / military / IRGC / Basij affiliation (yours or family) — even peripheral",
        "STEM field with potential CSIS sensitivity (nuclear, aerospace, advanced AI, advanced materials, biotech dual-use)",
        "Iranian academic / research advisor with potential security concerns",
        "Past Iranian asylum claim flag (yours or family) in another country",
        "Funding from Iranian sponsor outside immediate family or via third-country sanctioned bank",
        "Unresolved Iranian military obligation",
        "Past UK / US / Australia / EU visa refusal with Iran-related security flag (Five Eyes data sharing affects Canadian application)",
        "Bringing dependants — separate Study Permit / Work Permit + Visitor Visa coordination, especially for parents (over 60s face stricter funding requirements)",
        "Same-sex partner accompanying — Iran criminalises same-sex relations; Canada recognises same-sex marriage; documentation chain doesn't exist; refugee claim alternative possible but separate process",
        "Iranian female applicant without male guardian permission (Mahram-equivalent in Iranian context) — Iranian-side practical issue, not Canadian visa issue, but affects family situation",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // TURKISH → US — work
  // ════════════════════════════════════════════════════════════════════

  "TR:US:work": {
    whatCarriesWeight: [
      {
        label: "E-1 / E-2 Treaty Trader / Investor via the Türkiye-US 1985 Treaty",
        why: "Türkiye's E-1 (substantial trade between Türkiye and US) and E-2 (substantial Turkish investment in US business) treaty visas under the 1985 Treaty of Friendship and Commerce. Major Turkish E-1 traders include Yıldız Holding (Pladis-McVitie's, Ülker), Anadolu Group, Eczacıbaşı, Koç Holding, Sabancı Holding. E-2 investors active across US tech (NYC, Bay Area, Boston) and hospitality (NYC, LA, Miami, Houston Turkish-American clusters). No statutory minimum for E-2 but $100k+ practical floor.",
      },
      {
        label: "H-1B Specialty Occupation OR L-1 intracompany via Turkish parent",
        why: "Standard H-1B (March lottery, 85k slots — Turkish win rate ~30-35%). L-1A/B (intracompany transfer) bypasses lottery if you've worked 1+ year at Turkish parent (Türk Hava Yolları THY, Koç Group, Sabancı Group, Doğuş Group, Eczacıbaşı, Yıldız Holding, Anadolu Group, Vestel, Beko, Ülker, Migros). Turkish-American business community in NYC (large Turkish neighborhood in Brooklyn / NJ Paterson), LA (Hollywood), Boston (academia + tech), Houston (energy).",
      },
      {
        label: "DS-160 + Apostilled Turkish degrees + WES/ECE/AICE credential evaluation",
        why: "DS-160 online application, then book interview at US Embassy Ankara (Atatürk Bulvarı), US Consulate General Istanbul (İstinye Sancak Tepesi), or US Consulate Adana. Turkish degree certificates (Lisans, Yüksek Lisans, Doktora) need Apostille via Turkish MFA (Türkiye Cumhuriyeti Dışişleri Bakanlığı) — Türkiye is Hague signatory since 1985. Cost TRY 100-300/document, 3-7 working days. WES, ECE, or AICE foreign credential evaluation for US employer petition or licensure. Turkish Lisans (4-year) maps to US Bachelor's; Yüksek Lisans to US Master's.",
      },
      {
        label: "Turkish Police Record + DS-160 disclosure of Turkish security context",
        why: "Turkish Adli Sicil Kaydı (criminal record certificate) from Türkiye Ministry of Justice — free at Tubitak portal or Türkiye Adalet Bakanlığı online, 1-3 days. For US visa, disclose any: previous arrests / detention (including 2016 post-coup-attempt mass arrest if applicable — many Turkish academics, lawyers, journalists were detained), past military service (mandatory for males), any Gülen / FETÖ allegation history (Turkish government continues investigating), political affiliations (CHP / AKP / MHP / İYİ / DEM / HDP membership), Kurdish or Alevi minority advocacy.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why the US — sector, employer, Turkish-American community",
        prompt: "Turkish applicants benefit from specificity. Tech (Silicon Valley, NYC, Boston, Austin), finance (NYC, Chicago), entertainment (LA — Turkish-American film, Netflix Turkish content distribution), energy (Houston), pharma (NJ, Boston, Bay Area). Mention Turkish-American business networks (American Turkish Society, Turkish American Chamber of Commerce, ATAA Assembly of Turkish American Associations). Name your target US employer.",
      },
      {
        heading: "Your Turkish employer / academic credentials",
        prompt: "List Turkish employer chronologically, role, salary in TRY with USD equivalent at TCMB rate, supervisor name + contact. Turkish universities are well-known to US Embassy Ankara: Boğaziçi, METU, ITU, Bilkent, Sabancı, Koç, Hacettepe, Ankara, Marmara, Yıldız Technical, Gazi. For L-1, document the 12+ month qualifying employment at Turkish parent.",
      },
      {
        heading: "Long-term plan — H-1B + green card, E-2 indefinite, or temporary",
        prompt: "H-1B and L-1 allow dual intent — green-card plans openly stated (EB-2/EB-3 via PERM). E-2 is non-immigrant but renewable indefinitely. Türkiye permits dual citizenship; US permits dual citizenship. State honest plan. Turkish-American community is concentrated in NYC, NJ, Houston, LA — mention specific city if relevant.",
      },
      {
        heading: "Family + dependants + Turkish school year",
        prompt: "Spouse on L-2: automatic work authorization since 2023; H-4 spouse needs EAD (limited). E-2 spouse gets E-2D with full work rights. Turkish spouse + children under 21 are derivative. Turkish school year (September-June) — children can transition to US August/September start with minimal disruption. International schools in Istanbul (Robert College, MEF International, Istanbul International Community School) ease US transition.",
      },
    ],
    moneySavingTips: [
      "DS-160 fee $185 (H-1B/L-1) or $315 (E-1/E-2); pay in TRY at İş Bank, Garanti BBVA, Akbank, or Yapı Kredi — no reciprocity fee for Turkish citizens",
      "Use WES iGPA Calculator (free online) before paying for full evaluation",
      "Apostille via Turkish MFA: TRY 100-300/document, 3-7 days; or at provincial Valilik (governor's office) — same fee, faster turnaround in provinces",
      "Open a US-domiciled bank account with Wise USD, Mercury Business, or Türkiye İş Bankası USA (NYC, Chicago — Turkish diaspora-friendly) before relocation",
      "Turkish Embassy DC + Consulates (Boston, Chicago, Houston, LA, NYC, Miami, San Francisco) offer free notarisation for Turkish citizens",
      "Avoid Turkish 'göç danışmanlığı' charging TRY 50,000-200,000 for H-1B/L-1 — US-based immigration attorneys with Turkish desks at Fragomen, Berry Appleman, BAL have flat-fee Turkish services at $2,500-3,500",
      "Use Yapı Kredi, İş Bankası, Garanti BBVA, or Akbank for tuition / large remittance — competitive vs Wise for high-volume transfers",
      "Plan Turkish tax exit carefully — Türkiye taxes worldwide income for tax-residents (>183 days/year); file final return for year of departure; Türkiye-US Tax Treaty (1996, protocol 2008) prevents double-taxation",
      "Adli Sicil Kaydı (criminal record): FREE via Tubitak portal or Adalet Bakanlığı online — don't pay agents TRY 1,000+",
      "Use Wise, Revolut, or Western Union for low-volume TRY/USD remittance — competitive vs traditional bank transfer",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B / L-1 with named US employer, clean record, clear Turkish degree mapping",
        "DS-160 interview prep at US Embassy Ankara / Consulate Istanbul / Adana",
        "Spouse / dependent derivative applications (H-4, L-2, E-2D)",
        "Renewal of existing H-1B / L-1 at US Embassy Ankara / Consulate Istanbul during home leave",
        "PERM-based EB-2 / EB-3 green card (Turks are current — no per-country backlog)",
      ],
      getALawyer: [
        "E-1 Treaty Trader — substantial trade volume between Türkiye and US needs evidentiary support",
        "E-2 Treaty Investor — substantiality, source-of-funds, 'real and operating' enterprise tests",
        "EB-1A / EB-1B / O-1 — extraordinary ability for Turkish researchers / executives / artists",
        "Concurrent Turkish exit-tax considerations on substantial holdings",
        "Prior US visa refusal or US overstay",
        "Turkish criminal record (military / police case from 2016 post-coup-attempt period, drugs, organised-crime)",
        "Past FETÖ / Gülen movement allegation (Turkish government continues investigating; affects US visa disclosure)",
        "Kurdish or Alevi minority political advocacy history",
        "Past Turkish military service evader or conscientious objector status",
        "Same-sex spouse — Türkiye doesn't recognise same-sex marriage; US recognises; derivative visas via US documentation chain",
        "Dual Turkish-other passport (Turkish-German, Turkish-American adoptee, Turkish-Bulgarian common combinations)",
        "Pre-2016 Turkish military / police background with potential US security concern",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // SOUTH AFRICAN → AUSTRALIA — work
  // ════════════════════════════════════════════════════════════════════

  "ZA:AU:work": {
    whatCarriesWeight: [
      {
        label: "Subclass 482 Temporary Skill Shortage + Subclass 189 Skilled Independent + Subclass 491",
        why: "South Africa is one of Australia's top sources of skilled migration (~25,000 ZA migrants annually). Subclass 482 (sponsored — needs Australian employer, salary above TSMIT AUD$73,150 from 1 July 2024). Subclass 189 (Skilled Independent — points-based, no sponsor needed, on Skilled Occupation List). Subclass 491 (Skilled Work Regional — provincial sponsorship, 5-year pathway to PR). South Africans are well-represented in Australian healthcare (doctors, nurses, dentists, allied health), engineering, IT, finance, and mining.",
      },
      {
        label: "Skills assessment + SAQA / engineering body recognition",
        why: "Australian Skilled Migration requires skills assessment from the relevant assessing authority. Engineers Australia recognises South African engineering degrees from ECSA (Engineering Council of South Africa) accredited institutions. Doctors require AMC (Australian Medical Council) assessment + AHPRA registration. Nurses go through ANMAC + AHPRA-NMBA. Lawyers via state Legal Profession Admission Boards. CAANZ for chartered accountants (Australian-NZ recognition of SAICA). South Africans benefit from English-medium education and Commonwealth heritage.",
      },
      {
        label: "ECCTIS / SAQA degree evaluation + IELTS 7+ for skilled migration",
        why: "South African qualifications need recognition through assessing authority — SAQA verification is South African-side, not Australian; for Australian visa apply through specific Australian body (Engineers Australia, AMC, ANMAC, CAANZ, ACS for IT). English proficiency: IELTS Academic 7.0+ in each band (or equivalent PTE Academic 65+ in each band) for skilled migration full points; 6.0+ minimum for some visa subclasses. South Africans benefit from English-medium education — typically score 7.5-8.5.",
      },
      {
        label: "SAPS Police Clearance + Australian health requirement",
        why: "SAPS Police Clearance from local SAPS station or eHome Affairs (R150-R200, 6-12 weeks turnaround — start EARLY). For every country you've spent 12+ months in (including UK if previous Tier 4 / Youth Mobility) you need that country's police certificate. Australian health requirement: medical at panel physician (most major SA cities have IOM-equivalent panel — Pretoria, Cape Town, Durban) plus chest X-ray for TB. Cost R2,500-R3,500.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your visa route — Subclass 482, 189, 190, 491, or 494",
        prompt: "South Africans have many Australian skilled migration options. State explicitly: 482 (employer sponsored, 2-5 year, route to PR), 189 (Independent — points-based, no sponsor, direct PR), 190 (State Nominated — state list dependent), 491 (Regional Work Provisional — 5-year regional pathway to PR), 494 (Employer Sponsored Regional — 5-year regional route to PR). Each has different EOI (Expression of Interest) and Skill Select scoring.",
      },
      {
        heading: "Your South African work history + professional body numbers",
        prompt: "List every SA employer (Discovery Health, MediClinic, Netcare, Life Healthcare, Standard Bank, FirstRand, Sasol, Anglo American, MTN, Vodacom, Naspers, named NGO) with exact dates, role, salary in ZAR, supervisor + email. Include SANC PIN (nurses), HPCSA MP/SP/PSY number, ECSA PrEng/CandEng, SAICA membership, SACAA pilot licence number. Australian assessing authorities cross-check these registers directly with SA bodies.",
      },
      {
        heading: "Skills assessment + IELTS / PTE score",
        prompt: "Document your skills assessment outcome (positive vs negative, date, assessing authority — Engineers Australia, AMC, ANMAC, etc.). State your English score: IELTS Academic 7.5+ each band typical for SA professionals. SA's English-medium education means most SA applicants reach 'Superior English' tier in Subclass 189 points calculator — significant CRS-equivalent boost.",
      },
      {
        heading: "Family + future plan — ILR / Australian citizenship or temporary",
        prompt: "Most South Africans pursue PR via 189/190/491 (direct PR routes) or 482 (sponsored route to PR after 2-3 years). State whether you intend Australian citizenship (after 4 years total residence with 1 year as PR), retain SA citizenship (dual permitted by both countries), or temporary contract. Mention SA family (often relocating with you) and SA property liquidation plans. Australian school year (February-November) aligns with SA school year (January-December).",
      },
    ],
    moneySavingTips: [
      "Subclass 189 / 190 visa fees: AUD$4,640 main applicant + AUD$2,320 spouse + AUD$1,160/child — significant; budget AUD$8,000-15,000 for family of 4",
      "Subclass 482 visa fees: AUD$3,210 main applicant + dependents; usually employer-paid",
      "Skills assessment fees: Engineers Australia (~AUD$700), AMC for doctors (~AUD$1,500), ANMAC for nurses (~AUD$700), ACS for IT (~AUD$500), CAANZ for accountants (~AUD$1,300)",
      "SAPS PCC: apply EARLY (12 weeks turnaround) at SAPS station or eHome Affairs — R150-R200; don't use 'expediting services' charging R5,000+",
      "Use SAQA Verification (FREE for South African-side recognition) before Australian assessing authority (cheaper to discover credential issues early)",
      "PTE Academic test is faster than IELTS for SA applicants — book at Pearson VUE centres in Johannesburg / Cape Town / Durban / Pretoria",
      "South African Reserve Bank (SARB) exchange control approval for funds transfer over R1m — apply via FX desk at FNB, Standard Bank, Absa, or Nedbank; free service",
      "Australian Department of Home Affairs has a 'Migration Skills Assessment' provider list — use these directly, not 'migration agents' charging R30,000-100,000",
      "Don't pay 'MARA agents' R50,000+ if your case is straightforward — MARA is regulated but expensive; DIY for points-tested visa types is realistic for SA professionals",
      "Open Wise AUD, ANZ Migrant Banking, NAB Skilled Migration, CommBank Newcomer accounts before flying — most accept SA ID + Australian visa grant",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Subclass 189 / 190 / 491 with positive skills assessment, IELTS 7+, clean record",
        "Subclass 482 with employer sponsorship and clean documentation",
        "Dependent visa applications concurrent with main applicant",
        "Permanent Residence transition from 482 → 186 (Employer Nomination Scheme) after qualifying period",
        "Australian citizenship application after 4 years residence (1 year as PR)",
      ],
      getALawyer: [
        "Negative skills assessment outcome from assessing authority",
        "Past Australian visa refusal (visitor, study, work)",
        "South African criminal record (even minor, even diversion programme outcome)",
        "Funding from a sponsor outside South Africa or immediate family",
        "Past Five Eyes visa refusal (US, UK, Canada, NZ) flagged on Australian database",
        "Bringing 18+ dependent or adult dependent relative",
        "HPI (High Potential Individual) visa where university ranking dropped off eligible list",
        "Family member with prior Australian asylum claim",
        "Dual SA / other non-Commonwealth passport (visa application from wrong passport)",
        "Past UK Tier 4 student visa with TOEIC fraud allegation (2010-2015 mass scandal affecting some South Africans)",
        "Apartheid-era political affiliation history (rare but historically sensitive for older applicants)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // GERMAN → UK — work
  // ════════════════════════════════════════════════════════════════════

  "DE:GB:work": {
    whatCarriesWeight: [
      {
        label: "Skilled Worker visa OR Health and Care Worker — Germans need visa post-Brexit",
        why: "Post-Brexit (January 2021), German citizens no longer have EU freedom of movement to UK. Standard Skilled Worker visa: sponsor licence + £38,700 general threshold (April 2024) or £29,000 Health & Care Worker (IHS-exempt). German engineers, doctors, IT professionals, finance, and consulting roles are well-recruited. UK ETA (Electronic Travel Authorization) for short visits — but for work / study / family / settlement you need full visa.",
      },
      {
        label: "Certificate of Sponsorship + ECCTIS verification of German qualification",
        why: "Your UK employer must hold sponsor licence. ECCTIS Statement of Comparability (~£140, 15 working days) for German degrees — Bachelor (3-year) and Bachelor (4-year FH/HS Fachhochschule/Hochschule applied sciences) typically map to UK Level 6; Master (1- or 2-year) to Level 7. For regulated professions: NMC (nurses, OSCE/CBT route), GMC (doctors, PLAB — Germans benefit from Bologna alignment), Law Society (German Volljurist needs SQE), ICAEW / ACCA for accountants.",
      },
      {
        label: "German Police Certificate + UK TB test exemption",
        why: "Germany is on the UK 'no TB test' country list — no TB clearance needed. German Polizeiliches Führungszeugnis (police certificate) from local Bürgeramt or online via BfJ (Bundesamt für Justiz) — EUR 13, ~14 days. International Certificate of Conduct for UK use is FREE and digitally signed. State-level certificate (Landeszentrale) is also valid for UK Home Office.",
      },
      {
        label: "Income proof + £1,270 maintenance",
        why: "Skilled Worker requires £1,270 maintenance held 28 consecutive days. For Health & Care Worker, £1,270 typically waived. Document via German banks: Deutsche Bank, Commerzbank, ING-DiBa, Sparkasse, Volksbank, comdirect, DKB. Dependent visa for spouse + each child <18 adds £285/£315 maintenance. EUR/GBP relatively stable but UK-specific maintenance amount must be visible in EUR equivalent.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role + post-Brexit context",
        prompt: "Since January 2021 German citizens no longer have EU freedom of movement to UK. Be specific: how you found the role (recruitment partnership, NHS Trust direct, EU-UK professional network, online job board), what makes you the right fit, salary level vs going rate. Name the UK employer, team, line manager. German engineers in UK tech (ARM Cambridge, Wise, Revolut), German doctors in NHS, German finance professionals in City of London are common.",
      },
      {
        heading: "German work history + professional credentials",
        prompt: "List every German employer (Daimler, BMW, VW, Siemens, Bosch, Bayer, BASF, Allianz, Munich Re, Deutsche Bank, Commerzbank, SAP, named NGO) with exact dates, role, salary in EUR, supervisor + email. Include professional body registrations: Approbation (for doctors / pharmacists), Eingetragener Wirtschaftsprüfer (Wirtschaftsprüferkammer for auditors), Berufung as Steuerberater (Steuerberaterkammer), Kammer-Mitgliedschaft as Architekt / Ingenieur.",
      },
      {
        heading: "Maintenance funds + family plan",
        prompt: "Skilled Worker £1,270 maintenance OR employer A-rated cover. Document German bank statements (Deutsche Bank, Commerzbank, ING-DiBa, Sparkasse). Dependent visa for spouse + children adds £285/£315 per dependent. German UK diaspora is large in London, Cambridge, Edinburgh, Manchester — family support possible but cannot substitute required maintenance.",
      },
      {
        heading: "Future plan — ILR or return",
        prompt: "Skilled Worker is 5-year route to ILR. State settlement plan with Life in the UK test + B1 English (most Germans are at C1+ from school). Germany permits dual citizenship since 2024 reform; UK permits dual citizenship. Most German-British dual nationals retain both passports. If you intend to return to Germany after a fixed period, state openly — Skilled Worker doesn't require settlement intent.",
      },
    ],
    moneySavingTips: [
      "UK Skilled Worker / Health & Care Worker visa fees: £719-£1,500 + IHS £1,035/year (general) or IHS-exempt (Health & Care Worker)",
      "German police certificate via BfJ online portal: EUR 13 — don't use 'document services' charging EUR 50+",
      "ECCTIS Statement of Comparability £140 standard / £210 urgent",
      "British Council Germany centres (Berlin, München, Hamburg, Köln) accept IELTS UKVI but most Germans are exempt under 'majority English-speaking country' rule — confirm with UKVI portal",
      "Don't use German 'Visa-Berater' charging EUR 2,000-5,000 for what is straightforward UKVI process",
      "Open Wise GBP, Monzo, Revolut UK before flying — most accept German passport + German address",
      "Use Wise EUR/GBP for tuition / large remittance — competitive vs Deutsche Bank international transfer",
      "Negotiate UK relocation package — typically £3,000-£8,000 for German hires given logistics + cross-EU+UK costs",
      "German tax: file Wegzugsmeldung when leaving Germany; UK-Germany tax treaty (1964, protocol 2010) prevents double-taxation; German Auslandsrentenversicherung continues if you're posted (≤24 months) under EU-equivalent A1-style certificate",
      "ICAEW Pathway for German Wirtschaftsprüfer to UK Chartered Accountant: simplified mutual recognition agreement",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Skilled Worker / Health & Care Worker visa with named UK employer CoS",
        "Dependent visa applications concurrent with main applicant",
        "ILR after 5 years continuous qualifying residence",
        "Switching between sponsored employers within UK",
        "Naturalisation after 1 year ILR + 5 years total UK residence",
      ],
      getALawyer: [
        "Past UK visa refusal",
        "Past UK overstay or removal",
        "German criminal record (even spent / suspended under Bundeszentralregister)",
        "Care sector role with sponsor under CQC investigation / recent licence revocation",
        "Pre-Brexit UK residency / EUSS application (EU Settlement Scheme — different track)",
        "Bringing 18+ dependent or adult dependent relative",
        "Dual German-other non-Commonwealth passport (visa application from wrong passport)",
        "HPI (High Potential Individual) visa where your German university dropped off top-50 list",
        "Same-sex spouse — Germany recognises same-sex marriage 2017; UK recognises 2014; derivative visas straightforward",
        "Past EU expulsion / public-order ban affecting UK entry",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // PERUVIAN → US — family
  // ════════════════════════════════════════════════════════════════════

  "PE:US:family": {
    whatCarriesWeight: [
      {
        label: "Family-based green card via IR-1 / CR-1 / F-2A / F-2B / F-1 / F-3 / F-4",
        why: "Peruvians use standard US family-based immigration system. IR-1/CR-1 (spouse of US citizen — IR-1 unconditional 10-year, CR-1 conditional 2-year if marriage <2 years), IR-2 (unmarried child of US citizen under 21), IR-5 (parent of US citizen 21+), F-1 (unmarried adult child of US citizen — current backlog ~7 years), F-2A (spouse/minor children of LPR), F-2B (unmarried adult children of LPR — backlog ~7 years), F-3 (married children of US citizen — backlog ~15 years), F-4 (siblings of US citizen 21+ — backlog ~20+ years for Peru). Current visa bulletin shows F-4 Peru as one of the longest waits globally.",
      },
      {
        label: "Peruvian civil documents + Apostille via Cancillería Lima",
        why: "Peruvian birth certificates, marriage certificates, divorce decrees, death certificates need Apostille via Peruvian Cancillería (Ministerio de Relaciones Exteriores — Peru is Hague signatory since 2010). Apply at Cancillería Lima (Jr. Lampa 545) or regional offices (Arequipa, Cusco, Trujillo, Piura, Iquitos, Pucallpa, Tacna, Tarapoto). Cost PEN 100-200 (~USD 28-56)/document, 3-7 working days. Pre-2007 Peruvian birth records often handwritten and may need rectification via Peruvian notary (Notario Público) before Apostille.",
      },
      {
        label: "Affidavit of Support (I-864) + Peruvian-American sponsor compliance",
        why: "US sponsor (citizen or LPR) files Form I-864 — must show income at 125% of Federal Poverty Guidelines for household size + sponsored beneficiary (~$25k single, $33k for 2-person, $42k for 3-person). Joint sponsors accepted if primary insufficient. Peruvian-American sponsors should attach: 3 years of US tax returns (Form 1040), W-2s, employer letter, bank statements, asset valuations. Peruvian-American community concentrated in Paterson NJ, Miami FL, Houston TX, Washington DC area.",
      },
      {
        label: "Peruvian Police Clearance + medical exam at Lima panel physician",
        why: "Peruvian Certificado de Antecedentes Penales from RENIEC (Registro Nacional de Identificación y Estado Civil) Lima or via online portal — PEN 28 (~USD 8), 1-3 days. INTERPOL clearance also available for some categories. Medical exam at US-designated panel physician in Lima — most common: International Health & Medical (IHM) Lima, MedicalServ. Cost USD 200-400. Yellow fever vaccination required (most Peruvians have it from childhood — bring carnet de vacunación).",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your visa category and relationship",
        prompt: "State explicit visa category and family relationship. IR-1/CR-1 (spouse of US citizen), IR-2 (child under 21), IR-5 (parent), F-1 (unmarried adult child), F-2A (spouse/minor children of LPR), F-2B (unmarried adult children of LPR), F-3 (married children), F-4 (siblings — long backlog for Peru). Document priority date if file is in National Visa Center queue.",
      },
      {
        heading: "Your relationship narrative",
        prompt: "For spousal cases (IR-1/CR-1), document bona fide marriage: when/where/how met (Peru, US, third country), wedding details, photos, joint financial records, joint travel, communication history (WhatsApp, video calls — preserve evidence), family integration. CR-1 is 2-year conditional pending I-751 removal of conditions; IR-1 is 10-year unconditional. Document timeline carefully.",
      },
      {
        heading: "Family ties + Peruvian context",
        prompt: "Document your Peruvian history: residence (Lima / Arequipa / Cusco / Trujillo / Chiclayo / Piura district level), parents' occupation, siblings, education at Peruvian universities (PUCP Pontificia Universidad Católica del Perú, UNMSM, UPC, U de Lima, ESAN, UPC), Peruvian property with Registro de Predios title, Peruvian bank accounts. Peruvians are typically not flagged for special security screening — straightforward documentation.",
      },
      {
        heading: "US sponsor compliance + future plan",
        prompt: "US sponsor relationship + I-864 sponsorship capacity. State settlement plan: where you'll live (typically with US sponsor or near Peruvian-American community in Paterson NJ / Miami FL / DC metro / Houston TX), work plan (Peruvian credentials evaluated via WES/ECE), child education plan (US public school enrolment via local district), eventual naturalisation timeline (3 years for IR spouse with marriage, 5 years otherwise).",
      },
    ],
    moneySavingTips: [
      "Family-based visa total fee per applicant: I-130 petition $675 + NVC processing $445 + medical $200-400 + I-864 affidavit $120 = typically $1,400-1,800",
      "Apostille via Peruvian Cancillería Lima: PEN 100-200/document — don't use 'tramitadores' charging PEN 500+",
      "Don't pay 'asesores migratorios' USD 5,000-15,000 — USCIS forms are free at uscis.gov; immigration attorney costs $1,500-5,000 depending on complexity",
      "Peruvian-American legal aid: Asociación de Peruanos en Maryland, Peruvian Society of New Jersey, Peruvian American Coalition — low-cost consultation",
      "Translation: certified Spanish-English translation USD 25-50/page",
      "Medical exam at IHM Lima / MedicalServ Lima: USD 200-400 — direct booking; don't use agency middlemen",
      "Use Wise USD/PEN, Western Union, Banco Continental, or BCP for remittance — competitive vs traditional bank transfer",
      "Peruvian Certificado de Antecedentes Penales: PEN 28 via online RENIEC portal — don't pay agents PEN 200+",
      "Peruvian Embassy DC + Consulates (Atlanta, Boston, Chicago, Dallas, Denver, Hartford CT, Houston, LA, Miami, NY, Newark NJ, Paterson NJ, Philadelphia, Phoenix, San Diego, SF) offer free notarisation for Peruvian citizens",
      "F-4 sibling petition has 20+ year backlog for Peru — start applications NOW even if relative is years away from coming",
    ],
    lawyerTriggers: {
      diy: [
        "Standard I-130 petition for spouse / immediate family member with clean record",
        "I-485 Adjustment of Status (if already in US under valid status)",
        "Naturalisation (N-400) after 3 years marriage to US citizen or 5 years LPR",
        "F-1 / F-2A / F-2B / F-3 / F-4 priority date tracking and waiting",
      ],
      getALawyer: [
        "Prior US visa refusal or US overstay (B1/B2 overstay common)",
        "Peruvian criminal record (drug-related cases under Ley 23330)",
        "Family member with prior US asylum claim from Peru (Sendero Luminoso era, MRTA, Fujimori-era cases)",
        "Adoption-related petition where Peruvian adoption documentation incomplete",
        "Same-sex spouse — Peru doesn't recognise same-sex marriage federally (some same-sex marriages recognised from abroad under 2024 Inter-American Court ruling); US recognises; documentation chain via third-country marriage cert (Argentina, Spain, US)",
        "Past unauthorised US entry / border crossing",
        "Peruvian-American sponsor with prior tax delinquency affecting I-864 sponsorship",
        "Multi-country Peruvian migration history (Peru → Argentina → Chile → US complicates beneficiary documentation)",
        "Dual Peruvian-other passport (Peruvian-Spanish, Peruvian-Italian common — apply via Peruvian passport)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // CHINESE → SINGAPORE — work
  // ════════════════════════════════════════════════════════════════════

  "CN:SG:work": {
    whatCarriesWeight: [
      {
        label: "Employment Pass (EP) + COMPASS — Chinese applicants compete in highest-volume EP cohort",
        why: "Chinese applicants are Singapore's largest foreign professional cohort (~480,000 Chinese-origin on EP / S-Pass / PR). EP requires minimum monthly salary S$5,000 (S$5,500 financial services) rising with age (~S$10,500 mid-40s). From September 2023, COMPASS replaces simple salary cutoff: salary above median (40 pts max), diversity (Chinese contributes NEGATIVE diversity points in Chinese-heavy firms), qualifications (Tier-1 universities), strategic-economic-priorities skills shortage. Chinese applicants in Chinese-heavy companies (Huawei Singapore, Alibaba Singapore, Tencent Singapore, ByteDance Singapore) face higher COMPASS scrutiny than in diversity-positive firms.",
      },
      {
        label: "MOM Pass application + China university auto-verification",
        why: "Your Singapore employer applies via Ministry of Manpower EP Online portal. Application fee S$105; once approved, IPA letter to enter Singapore; on arrival biometrics at ICA + EP card. Processing typically 3 weeks. Singapore MOM auto-verifies degrees from major Chinese universities (985/211 Project schools: Tsinghua 清华大学, Peking 北京大学, Fudan 复旦大学, Zhejiang 浙江大学, SJTU 上海交通大学, USTC, Renmin, Beihang, Beijing Normal — 39 Project 985 universities all auto-verified). Lesser-known institutions need Dataflow verification (~S$200-400) and CHSI (学信网) cross-check.",
      },
      {
        label: "Chinese educational credentials via MEA / CSCSE + MOM auto-verification",
        why: "Chinese degree certificates: 1) 学位证书 + 毕业证书 + 成绩单 issuance, 2) 学信网 (CHSI — China Higher Education Student Information) verification (free online), 3) 中国留学服务中心 (CSCSE) certification if specifically requested, 4) Apostille via Chinese MFA (China is Hague signatory since November 2023 — recent change, many Singapore employers still accept old multi-step legalisation chain in transition period). Cost RMB 200-1,000/document.",
      },
      {
        label: "Permanent Residence (PR) — Chinese applicants face one of longest PR queues in Singapore",
        why: "Singapore PR after EP/S-Pass typically requires 2-3 years work + ICA processing 12-18 months for non-Chinese, often 18-36 months for Chinese applicants. PR grants permanent residence, job mobility, CPF contributions, eventual citizenship eligibility after 5+ years PR. Singapore actively manages CMIO (Chinese-Malay-Indian-Others) demographic balance — Chinese over-representation in PR queue means longer waits despite high qualifications. National Service obligation: male PR holders (both first-gen and second-gen) must serve 2 years NS at 18+ — major decision factor for Chinese families with sons.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your role + COMPASS strategic factor",
        prompt: "Singapore doesn't ask personal-statement narrative at consular stage (employer-led via MOM). For Chinese applicants, important: Singapore employer UEN (Unique Entity Number), MOM tier classification, role + salary band, sector (financial services have S$5,500 min, tech/manufacturing S$5,000 min). Chinese applicants in diversity-positive (non-Chinese-heavy) employers score higher in COMPASS. Highlight Tier-1 Chinese university (985/211 Project), strategic skills (cybersecurity, AI/ML, green economy, biotech).",
      },
      {
        heading: "Chinese work history — 身份证, 社保, 公积金 numbers",
        prompt: "List every Chinese employer with month-precision dates, role, salary in RMB, supervisor name + WeChat. Include 身份证号 (national ID), 社保编号 (social insurance number), 公积金 (housing fund) number. Past Singapore experience strongly preferred. For technical roles, attach LinkedIn / GitHub / publication record. Document any English certifications (CET-6, BEC Higher, TOEFL, IELTS) — most Chinese professionals are B1+ English.",
      },
      {
        heading: "Family + dependants + son's National Service consideration",
        prompt: "Dependent Pass for spouse + children of EP holders earning S$6,000+/month. Long-Term Visit Pass for partners and parents (S$12,000+/month). Chinese spouse + children carry Chinese passports — separate Dependent Pass attestation (Hague Apostille via Chinese MFA + Singapore MOM acceptance). CRITICAL for sons: if you become PR, male PR sons (born or naturalised) must serve 2 years Singapore National Service at 18 — this is a major family decision Chinese families consider carefully.",
      },
      {
        heading: "Long-term plan — PR, citizenship, or rotation",
        prompt: "State plan: PR target after 2-3 years EP (Chinese PR processing 18-36 months due to CMIO balance), eventual Singapore citizenship after 5+ years PR (Singapore requires renouncing Chinese passport — no dual citizenship; can apply for Returnee Chinese SAR status but limited), or temporary contract with planned China return (most common for Chinese expats), or onward migration (Singapore-based Chinese sometimes progress to Canada / Australia / UK / US).",
      },
    ],
    moneySavingTips: [
      "EP application fee S$105 — employer pays; refuse 'fee deduction' from first salary unless contractual",
      "Most major Chinese universities auto-verified by MOM — saves S$200-400 Dataflow fee",
      "Open DBS, OCBC, UOB, Standard Chartered Singapore, HSBC Singapore, ICBC Singapore (Chinese-friendly) salary account — most accept IPA letter + Chinese passport pre-arrival",
      "ONE Pass eligibility S$30,000+/month — apply via MOM portal",
      "Apply for Chinese Tax Residency Certificate at China Tax Authority if you'll be Singapore-resident >183 days/year — exempts Singapore income from Chinese global-income tax under China-Singapore DTAA",
      "Singapore CPF: as EP holder don't contribute; as PR/citizen contribute 20% (employee) + 17% (employer) — major retirement savings, BUT understand obligation",
      "Use Wise SGD/RMB, Western Union, AliPay International, WeChat Pay, or Bank of China Singapore — competitive rates; SAFE (China State Administration of Foreign Exchange) educational/professional outflow has no annual cap with employment proof",
      "Apostille via Chinese MFA since November 2023: RMB 50-200/document, 5-7 working days — replaces older multi-step legalisation; Singapore-side accepts Hague Apostille",
      "Don't pay Chinese 'singapur移民咨询' RMB 30,000-150,000 — MOM EP Online is straightforward; employer's HR handles application",
      "Plan Chinese tax exit carefully — China taxes worldwide income for tax-residents (>183 days/year); file final return with Tax Authority for year of departure",
    ],
    lawyerTriggers: {
      diy: [
        "Standard EP / S-Pass / ONE Pass with employer support, clean record, clear qualifications",
        "Dependent Pass / LTVP for spouse + children",
        "PR application after 2-3 years EP",
        "Renewal of EP at end of 2-year initial / 3-year renewal periods",
        "Singapore tax filing",
      ],
      getALawyer: [
        "Past Singapore visa refusal or PR rejection (common for Chinese due to CMIO balance)",
        "Chinese criminal record (drugs, corruption — Chinese 反贪 anti-corruption case)",
        "Past Singapore overstay or work-permit-related dispute",
        "COMPASS scoring borderline — strategic optimisation of role description / salary / company tier",
        "Family member with prior asylum claim from China (Tibetan, Uyghur, Falun Gong, Hong Kong pro-democracy)",
        "Male PR son's National Service obligation (Chinese family with son approaching 18 — major decision)",
        "Singapore PR application after multiple EP renewals without success",
        "Past Singapore detention or deportation flag",
        "Hong Kong BNO passport holder (different from mainland Chinese passport for visa purposes)",
        "Same-sex spouse — China doesn't recognise same-sex marriage; Singapore decriminalised same-sex relations 2022 but doesn't recognise marriage; F-2 derivative complicated",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → CANADA — work
  // ════════════════════════════════════════════════════════════════════

  "IN:CA:work": {
    whatCarriesWeight: [
      {
        label: "Express Entry + Provincial Nominee Program — Indians dominate Canadian skilled migration",
        why: "Indians are Canada's #1 source of skilled migrants (~135,000 PR admissions in 2023, ~30% of total). Express Entry pool (Federal Skilled Worker FSW / Federal Skilled Trades FST / Canadian Experience Class CEC) uses CRS (Comprehensive Ranking System) scoring out of 1,200 points. Provincial Nominee Programs (PNP) — particularly Ontario (OINP), British Columbia (BCPNP), Alberta (AAIP), Saskatchewan (SINP), Manitoba (MPNP), Atlantic (AIPP), Nova Scotia, New Brunswick — actively recruit Indian professionals via tech / healthcare / general skilled streams.",
      },
      {
        label: "LMIA-based work permit OR LMIA-exempt categories (intra-company / treaty / IEC)",
        why: "For temporary work permit: most Indians use LMIA-backed Temporary Foreign Worker Program. LMIA-exempt options: Intra-Company Transfer (Indian parent → Canadian subsidiary), GATS (General Agreement on Trade in Services) for some specific categories, NAFTA-equivalent under CUSMA (not available to Indians like Mexicans/Americans), International Mobility Program (IMP). Indian tech workers often enter via LMIA-exempt Global Talent Stream (GTS) — 2-week processing for tech roles like software engineer, machine learning engineer.",
      },
      {
        label: "WES Educational Credential Assessment + IELTS General CLB 5+",
        why: "Express Entry and PNP require WES (World Education Services), ICAS, or IQAS evaluation of your Indian degree — Indian B.Tech / BE / MCA / M.Tech / BBA / MBA all map to Canadian equivalents. IELTS General CLB 5+ minimum (Reading 5.0, Writing 5.0, Listening 5.0, Speaking 5.0) for FSW; CLB 7+ unlocks Express Entry CRS points and category-based draws (healthcare, STEM, transport, trades, French-speakers). PTE Core also now accepted (introduced December 2023). TEF Canada / TCF Canada accepted for French-language draws.",
      },
      {
        label: "Indian Police Clearance + provincial police checks for past residences",
        why: "Indian PCC from passport seva portal (INR 500, 7-21 days) — required for IRCC. If you worked in Gulf states (UAE, Saudi, Qatar, Kuwait), Malaysia, Singapore, US for 6+ months, you also need that country's police certificate. IRCC frequently refuses applications where Indian applicants forget to disclose a Gulf-state work stint. Disclose every country with 6+ months residence.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your visa route — Express Entry, PNP, Work Permit, or sponsored",
        prompt: "Indians have unusually many Canadian routes. State explicitly: Express Entry (federal pool — FSW / FST / CEC), Provincial Nominee Program (named province — OINP / BCPNP / AAIP / SINP / MPNP etc.), LMIA-backed Work Permit (employer sponsored), LMIA-exempt Work Permit (intra-company / GTS), Permanent Residence via Family Sponsorship, Atlantic Immigration Program. Show research — picking the right route significantly affects timeline.",
      },
      {
        heading: "Your Indian work history — verifiable",
        prompt: "List every Indian employer chronologically with month-precision dates, role, salary in INR, supervisor name + email. Include PAN, EPFO UAN, Aadhaar. Any Indian professional designations: PEC PE / CEng (engineers), MCI registration (doctors), PCI (pharmacists), ICAI / ICAEW (accountants), MBBS / MD postgraduate, BCI Bar Council registration (lawyers). Indian universities (IIT, NIT, IIM, IISc, BITS, etc.) are well-known to Canadian assessors.",
      },
      {
        heading: "Settlement plan + funds — proof of CAD$13,757 (1 adult) or scaled up for family",
        prompt: "Even with a Canadian job offer, IRCC wants to see proof you can survive landing — CAD$13,757 (1 person), CAD$17,127 (2), CAD$21,055 (3), CAD$25,564 (4), scaling up. Document Indian bank statements (HDFC, ICICI, SBI, Axis, Kotak Mahindra, IndusInd, IDFC, Yes Bank), Indian property, and remittance plans. Mention Canadian family if applicable — they can co-sponsor maintenance via Section 39 IRPR letters.",
      },
      {
        heading: "Express Entry strategy + long-term plan",
        prompt: "State CRS score (Indian applicants typically need 470-510 for Express Entry under current draws, lower for category-based STEM / healthcare / French / trades draws). Plan: Express Entry → PR → Canadian citizenship after 3 years (4 years if not present 3 cumulative). Document IELTS / PTE / TEF score, WES outcome, work experience NOC (National Occupational Classification) code, Canadian provincial connections. Canada permits dual citizenship; India doesn't (must apply for OCI — Overseas Citizen of India — after Canadian naturalisation).",
      },
    ],
    moneySavingTips: [
      "Express Entry profile creation is FREE — only pay processing fees at ITA (Invitation to Apply) stage: CAD$1,365 main applicant + CAD$1,365 spouse + CAD$230/child",
      "Use the IRCC's free CRS calculator and Express Entry profile tool — don't pay RCIC CAD$2,000-5,000 unless you have unique complications",
      "WES costs CAD$237 (basic) or CAD$329 (course-by-course); ICAS and IQAS are alternatives — choose based on your province (Alberta prefers IQAS; rest accept WES)",
      "IELTS General: book through British Council India or IDP — INR 17,800; PTE Core in India is INR 17,000; book multi-attempt packages if uncertain on first sitting",
      "WES Verification of Educational Credentials (VEC): free for Indian applicants via direct IIT/NIT/state university partnership — avoids document mailing costs",
      "Indian Police Clearance: INR 500 via passport seva portal — don't pay agents INR 5,000+",
      "Use HDFC Forex, SBI Forex, or ICICI Forex Card for tuition / relocation — Forex cards lock in rate; RBI's LRS allows USD 250,000/year outbound",
      "Apply for Indian Tax Residency Certificate at Income Tax Department if you'll be Canadian-resident >183 days/year — exempts Canadian income from Indian global-income tax under India-Canada DTAA",
      "Avoid Indian 'Canada migration agencies' charging INR 200,000-2,000,000 for nothing — IRCC forms are free; RCIC-regulated representatives in Canada cost CAD$2,000-5,000 max for full Express Entry / PNP support",
      "Use Wise INR/CAD, Western Union, MoneyGram, or Remitly for remittance — competitive vs SBI international transfer",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Express Entry profile creation, EOI submission, and ITA response",
        "PNP application via cooperating Canadian employer or provincial stream",
        "LMIA-based work permit with employer support",
        "Family reunification (spouse, child) once you have Canadian PR",
        "Canadian citizenship application after 3 years residence",
      ],
      getALawyer: [
        "Previous Canadian visa refusal (visitor, study, or work)",
        "Past US B1-B2 refusal or overstay (IRCC shares data with USCIS)",
        "Indian criminal record (NDPS narcotics, dowry, criminal breach of trust)",
        "Job offer in a regulated profession (medicine, nursing, law, engineering — provincial licensing is separate from IRCC)",
        "Self-employed or business-owner applicant claiming experience without traditional payslips",
        "Past Gulf state work history with kafala-system disputes or End of Service Gratuity disputes",
        "Express Entry CRS borderline (470-510) — strategic optimisation of NOC code, work experience, English/French test, additional points",
        "Family member with prior Canadian asylum claim from India",
        "Bringing 18+ dependent (adult dependent child rules complicated)",
        "Same-sex spouse — India recognised same-sex relations as legal (2018 Section 377 decriminalised) but doesn't recognise same-sex marriage; Canada recognises; derivative visas straightforward",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // ROMANIAN → US — work
  // ════════════════════════════════════════════════════════════════════

  "RO:US:work": {
    whatCarriesWeight: [
      {
        label: "E-2 Treaty Investor (Romania-US Treaty 1992) + H-1B / L-1 standard routes",
        why: "Romania is an E-2 Treaty Investor country under the 1992 US-Romania Treaty of Commerce. E-2 grants Romanian entrepreneurs the right to substantial investment in US business (~$100k+ practical floor, no statutory minimum). Romanian E-2 applicants are concentrated in tech (NYC, Bay Area, Austin, Boston for Romanian-founded fintech and SaaS), hospitality (NYC, LA, Miami), and IT services (Romanian diaspora is strong in software). H-1B (cap-subject lottery, ~35-40% win rate for Romanians). L-1A/B intracompany transfer from Romanian parent (Romgaz, Petrom, BCR, Banca Transilvania, Hidroelectrica, Dacia/Renault Romania).",
      },
      {
        label: "DS-160 + Apostilled Romanian degrees + WES/ECE credential evaluation",
        why: "DS-160 online application, then book interview at US Embassy Bucharest (Liviu Librescu 4-6 Boulevard) — single consulate handles all of Romania. Romanian degree certificates (Licență, Master, Doctorat) need Apostille via Romanian MFA — Romania is Hague signatory since 1995. Cost RON 50-150/document, 3-7 working days. WES, ECE, or AICE foreign credential evaluation for US employer petition. Romanian Licență (Bologna-compliant 3-year) maps to US Bachelor's; Master to US Master's. Romanian medical degrees (4-6 year) need USMLE pathway separately.",
      },
      {
        label: "Romanian Cazier Judiciar + DS-160 disclosure",
        why: "Romanian Cazier Judiciar (criminal record certificate) from local Police Station or via online portal (free, 1-3 days). Romanian Police Apostille if needed. Disclose any: previous arrests / detention, past military service (compulsory until 2007 — abolished; Romanian males pre-2007 should document service or exemption), political affiliations, past EU sanctioning. Romanian-EU citizens have stronger EU-side rights but US visa is separate from EU framework.",
      },
      {
        label: "US-Romania Totalization Agreement (2010, effective March 2024) + tax treaty",
        why: "The US-Romania Totalization Agreement entered into force March 2024 — Romanians no longer pay BOTH Romanian CAS and US Social Security/Medicare on short-term assignments. Get a Certificate of Coverage from Romanian Casa Naţională de Pensii Publice (CNPP) — keeps you on Romanian CAS for up to 5 years on temporary US assignment, exempt from US Social Security/Medicare. Beyond 5 years switch to US system; Romanian quarters count toward future Romanian pension via Totalization. Tax treaty (1973, protocol 2009) prevents double-taxation.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — H-1B, L-1, or E-2",
        prompt: "Romanians have several routes. State explicitly: H-1B (cap-subject lottery), L-1A/B (intracompany transfer from Romanian parent with 12+ months qualifying employment), E-2 Treaty Investor (substantial Romanian investment, post-1992 treaty). Show research. Romanian tech founders increasingly use E-2 to launch US subsidiaries.",
      },
      {
        heading: "Your Romanian employer / academic credentials",
        prompt: "List Romanian employer chronologically, role, salary in RON with USD equivalent, supervisor name. Romanian universities (Universitatea București / Babeș-Bolyai Cluj / Politehnica București / Politehnica Cluj / Iași Alexandru Ioan Cuza / Transilvania Brașov / SNSPA / ASE Bucharest) are well-known to US Embassy Bucharest.",
      },
      {
        heading: "Long-term plan — H-1B + green card, E-2 indefinite, or temporary",
        prompt: "H-1B and L-1 allow dual intent — green-card plans openly stated (EB-1/EB-2/EB-3 via PERM). E-2 is non-immigrant but renewable indefinitely. Romania permits dual citizenship; US permits dual citizenship. State honest plan. Romanian-American community is concentrated in NYC, Chicago, Detroit, Cleveland, LA — mention specific city if relevant.",
      },
      {
        heading: "Family + dependants",
        prompt: "Spouse on L-2 has automatic work authorization since 2023; H-4 spouse needs EAD (limited). E-2 spouse gets E-2D with full work rights. Romanian spouse + children under 21 are derivative. School year alignment (September-June Romania vs August-June US) typically smooth.",
      },
    ],
    moneySavingTips: [
      "DS-160 fee $185 (H-1B/L-1) or $315 (E-2); pay in RON at Banca Comercială Română or BCR — no reciprocity fee for Romanians",
      "Use WES iGPA Calculator (free online) before paying for full evaluation",
      "Apostille via Romanian MFA: RON 50-150/document, 3-7 days",
      "Open a US-domiciled bank account with Wise USD, Mercury Business, or BCR US (limited US presence) before relocation",
      "Romanian Embassy DC + Consulates (Chicago, LA, NYC, Detroit) offer free notarisation for Romanian citizens",
      "Avoid Romanian 'consultoría imigrare' charging RON 10,000-30,000 for H-1B/L-1 — US-based attorneys with Romanian language services at Fragomen, Berry Appleman, BAL have flat-fee Romanian services at $2,500-3,500",
      "US-Romania Totalization Agreement (effective March 2024) — get CoC from CNPP if posted ≤5 years",
      "Romania-US tax treaty preserves IRA-equivalent tax deferral; CSO Romania and IRS coordinate via tax treaty articles",
      "Don't pay 'EUR-USD remittance' agencies — use Wise, Revolut, Transferwise for low-volume; Banca Transilvania, BCR for high-volume",
      "Cazier Judiciar: FREE via online portal — don't pay agents RON 200+",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B / L-1 with named US employer, clean record, clear Romanian degree mapping",
        "DS-160 interview prep at US Embassy Bucharest",
        "Spouse / dependent derivative applications",
        "Renewal of existing H-1B / L-1 at US Embassy Bucharest during home leave",
        "PERM-based EB-2 / EB-3 green card (Romanians are current — no per-country backlog)",
      ],
      getALawyer: [
        "E-2 Treaty Investor — substantiality, source-of-funds, 'real and operating' enterprise tests",
        "EB-1A / EB-1B / O-1 — extraordinary ability",
        "Prior US visa refusal or US overstay",
        "Romanian criminal record",
        "Pre-1990 Romanian Securitate file connection",
        "Past EU-side public-order ban affecting US application",
        "Same-sex spouse — Romania doesn't recognise same-sex marriage (2024 partial civil-union recognition for some couples); US recognises; documentation chain may need third-country marriage cert",
        "Dual Romanian-other passport — apply via Romanian passport",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // SINGAPOREAN → US — work
  // ════════════════════════════════════════════════════════════════════

  "SG:US:work": {
    whatCarriesWeight: [
      {
        label: "H-1B1 — Singapore's unique treaty-based work visa (not subject to annual lottery)",
        why: "Singapore (and Chile) have a unique H-1B1 visa under the US-Singapore Free Trade Agreement (2004) — 5,400 visas annually for Singaporeans (separate from the 85k H-1B lottery cap). Specialty Occupation requiring Bachelor's degree, US employer petition, prevailing wage. H-1B1 differs from H-1B in: no lottery, no PERM-based dual intent (officially non-immigrant), 1-year initial duration vs 3-year H-1B, no spouse work authorization automatic. Apply at US Embassy Singapore (27 Napier Road) — bypass US-based premium-processing.",
      },
      {
        label: "H-1B (lottery) OR L-1 (intracompany) OR E-2 (Singapore-US 1990 Treaty)",
        why: "Singaporeans qualify for standard H-1B (cap-subject lottery), L-1A/B (intracompany transfer from Singaporean parent — DBS, OCBC, UOB, Singapore Airlines, ST Engineering, SingTel, Keppel, CapitaLand have well-trodden L-1 paths), and E-2 Treaty Investor under the 1990 US-Singapore Treaty (substantial Singaporean investment, ~$100k+ practical floor). Singaporean tech founders use E-2 to launch US subsidiaries — common in SF, NYC, Boston Singapore-origin tech ecosystem.",
      },
      {
        label: "DS-160 + Apostilled Singapore degrees + WES/ECE credential evaluation",
        why: "DS-160 online application, then book interview at US Embassy Singapore. Singaporean degree certificates from NUS / NTU / SMU / SUTD / SUSS / SIT — auto-verified by US universities via SUNI (Singapore University Notary Identification) and direct partnerships. Apostille via Singapore MFA — Singapore joined Hague Apostille Convention January 2021. Cost SGD 10-25 per document, same-day at MFA. NUS / NTU / SMU are top-50 globally — high US Embassy recognition.",
      },
      {
        label: "Singapore Police Certificate + DS-160 disclosure",
        why: "Singapore Certificate of Clearance from Police via online portal (free for citizens, S$50 for non-citizens, 1-3 days). Apostille if needed. Disclose any: previous arrests / detention (Singapore strict on cannabis under MDA, alcohol-related driving, vandalism), National Service status (mandatory for male Singaporean citizens and PRs), Operationally Ready Date (ORD), reservist obligations.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — H-1B1, H-1B, L-1, or E-2",
        prompt: "Singaporeans have unusually many routes. State explicitly: H-1B1 (no lottery, 5,400 annual quota — Singapore's unique advantage), H-1B (cap-subject lottery), L-1A/B (intracompany transfer with 12+ months qualifying employment), E-2 Treaty Investor (substantial Singaporean investment, post-1990 treaty). H-1B1 is dramatically easier than H-1B lottery.",
      },
      {
        heading: "Your Singaporean employer / academic credentials",
        prompt: "List Singapore employer chronologically, role, salary in SGD with USD equivalent at MAS rate, supervisor name. Singapore universities (NUS, NTU, SMU, SUTD, SUSS, SIT) are well-known to US Embassy Singapore. For L-1, document the 12+ month qualifying employment at Singapore parent.",
      },
      {
        heading: "National Service status for male Singapore citizens (mandatory)",
        prompt: "Male Singaporean citizens and PRs must complete 2 years NS at 18+ followed by reservist obligation until ~40. Document: Operationally Ready Date (ORD) certificate, MINDEF reservist obligation status, any deferral for overseas study (Singapore Ministry of Defence approval required). Without proper NS resolution, you cannot leave Singapore without permission and future Singapore re-entry triggers compliance check.",
      },
      {
        heading: "Long-term plan — temporary or US settlement",
        prompt: "H-1B1 is non-immigrant; H-1B and L-1 allow dual intent. State honest plan. Singapore doesn't permit dual citizenship — Singaporean-American naturalisation requires renouncing Singapore. Many Singaporean-Americans retain Singapore citizenship and accept US PR (green card) without naturalising.",
      },
    ],
    moneySavingTips: [
      "DS-160 fee $185 (H-1B1/H-1B/L-1) or $315 (E-2); pay in SGD at Citibank Singapore or HSBC Singapore — no reciprocity fee for Singaporeans",
      "H-1B1 application at US Embassy Singapore is dramatically faster than US-based premium processing — no lottery, no PERM, direct consular path",
      "Use WES iGPA Calculator (free online) before paying for full evaluation",
      "Apostille via Singapore MFA: SGD 10-25/document, same-day in person",
      "Open a US-domiciled bank account with Wise USD, Mercury Business, or DBS USA (Treasury Manhattan branch — Singapore diaspora-friendly) before relocation",
      "Singapore Embassy DC + Consulates (LA, NYC, SF, Chicago, Houston, Atlanta) offer free notarisation for Singapore citizens",
      "Don't pay 'Singapore-US migration consultancies' SGD 5,000-15,000 — US-based attorneys handle H-1B1 / H-1B / L-1 / E-2 at $2,500-3,500 flat fee",
      "H-1B1 dependent visas (H-4) — children of H-1B1 holders eligible; spouse work auth via H-4 EAD only if on certain US adjustment-of-status track (rare for H-1B1)",
      "Singapore-US tax treaty in negotiation but not yet ratified — file US tax return claiming foreign-tax-credit on Singapore-source income; CPF contributions are pre-tax in Singapore but US-taxable when withdrawn unless treaty provisions apply",
      "Use DBS, OCBC, UOB for tuition / large remittance — competitive vs Wise for high-volume transfers",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B1 / H-1B / L-1 with named US employer, clean record, clear Singaporean degree mapping",
        "DS-160 interview prep at US Embassy Singapore",
        "Spouse / dependent derivative applications",
        "Renewal of existing H-1B1 / H-1B / L-1 at US Embassy Singapore during home leave",
        "PERM-based EB-2 / EB-3 green card (Singaporeans are current — no per-country backlog) for H-1B transitioning to immigrant intent",
      ],
      getALawyer: [
        "E-2 Treaty Investor (Singapore-US E-2 since 1990) — substantiality, source-of-funds, 'real and operating' enterprise tests",
        "EB-1A / EB-1B / O-1 — extraordinary ability",
        "H-1B1 to H-1B transition (cap-subject lottery vs annual quota) — strategic timing",
        "Concurrent Singaporean tax planning on substantial holdings",
        "Prior US visa refusal or US overstay",
        "Singaporean criminal record (cannabis, alcohol, vandalism)",
        "Pending Singapore NS obligation (male citizens with active reservist call-up)",
        "Past MINDEF non-compliance flag (failure to register for NS, dodging service)",
        "Same-sex spouse — Singapore decriminalised same-sex relations 2022 but doesn't recognise same-sex marriage; US recognises; F-2 derivative via US documentation chain",
        "Dual Singaporean-other passport (rare — Singapore doesn't permit dual citizenship; check if you've actually retained Singaporean citizenship)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // ALBANIAN → ITALY — work
  // ════════════════════════════════════════════════════════════════════

  "AL:IT:work": {
    whatCarriesWeight: [
      {
        label: "Non-EU work permit (Decreto Flussi) + 2023 Italy-Albania protocol",
        why: "Albania is not in the EU; Albanians need work visa for Italy. Italy publishes annual Decreto Flussi (Flow Decree) setting quotas for non-EU workers — Albanian quota is typically 50,000-80,000/year (largest single-origin quota due to Italy-Albania bilateral relations). 2023 Italy-Albania Migration Protocol established additional cooperation framework. Apply via Sportello Unico Immigrazione (SUI) at Prefettura — employer-driven application; Albanian applicants benefit from large diaspora (~500,000 Albanians in Italy) and Italian-Albanian linguistic kinship (Italian + Albanian Romance/Albanian-language schools widespread in Italian-Albanian community).",
      },
      {
        label: "EU Blue Card (separate from Decreto Flussi for high-skill professionals)",
        why: "For high-skilled Albanian professionals, EU Blue Card is alternative — Italian threshold ~€33,500/year for engineers, IT, tech (lower than Germany's €48,300). Italy-side EU Blue Card processing through Sportello Unico Immigrazione + Italian university degree recognition (Riconoscimento). Faster than Decreto Flussi for tech / finance / engineering roles. Albanian Bachelor's degrees from University of Tirana, Polytechnic University of Tirana, Tirana Economic University recognised under Bologna Process.",
      },
      {
        label: "Italian language proficiency + cultural integration",
        why: "Italy requires A2 Italian for first work permit, B1 for permanent residence (Soggiorno Permanente UE / Lungo Soggiorno). For nursing roles, B1+ Italian. Albanian-Italian linguistic kinship + large Albanian diaspora means most Albanian applicants achieve A2 quickly via Volkshochschule-equivalent (Centri Territoriali Permanenti CTP). Italian Albania-origin community (largest in Milan / Rome / Veneto / Tuscany / Apulia) provides cultural integration support.",
      },
      {
        label: "Albanian Police Clearance + Apostille via Albanian MFA",
        why: "Albanian Vërtetimi i Kontrollit te Gjendjes Gjyqësore (criminal record) from local Police Station or Ministry of Justice (ALL 500-1,500, 7-14 days). Apostille via Albanian MFA (Ministria e Punëve të Jashtme) — Albania is Hague signatory since 2006. Cost ALL 2,000-5,000/document, 5-7 days. Albanian translation to Italian via sworn translator (Përkthyes i Autorizuar) — typically performed via Italian-licensed translators in Albania or in Italy.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — Decreto Flussi, EU Blue Card, or family reunification",
        prompt: "Albanians have several Italian routes. State explicitly: Decreto Flussi (annual quota — most common for blue-collar work), EU Blue Card (high-skilled, faster processing), family reunification (Ricongiungimento Familiare for spouse / minor children / dependent parents of Italian-resident Albanian), Permesso di Soggiorno tied to Italian study programme (alternative pathway).",
      },
      {
        heading: "Your Albanian work history + Italian-language progression",
        prompt: "List every Albanian employer with month-precision dates, role, salary in ALL, supervisor name + email. Document Italian-language progression: enrolment in Italian course (with study hours), CILS / CELI / PLIDA Italian-language certification, work experience with Italian-speaking colleagues if any.",
      },
      {
        heading: "Family + Italian diaspora connections",
        prompt: "Italian Albanian-origin community is one of Italy's largest. Mention any Italian-Albanian relatives or community connections — Milan, Rome, Treviso, Padua, Verona, Florence, Bologna, Bari, Brindisi, Foggia all have large Albanian populations. Document Italian-Albanian linkage for family reunification or work integration.",
      },
      {
        heading: "Long-term plan — Italian PR, citizenship, or rotation",
        prompt: "Albanian-Italian Permesso di Soggiorno UE per Soggiornanti di Lungo Periodo (EU PR) after 5 years legal residence + B1 Italian. Italian citizenship after 10 years residence (down from 4 for EU citizens — not applicable to Albanians as non-EU). Many Albanian-Italians retain Albanian citizenship + apply for Italian citizenship; Albania permits dual citizenship.",
      },
    ],
    moneySavingTips: [
      "Decreto Flussi has annual quota fixed — apply within window (typically January-March); employer pays Prefettura fee ~€100",
      "EU Blue Card application fee ~€100 — significantly cheaper than UK Skilled Worker fees",
      "Albanian Police Clearance: ALL 500-1,500 at local Police Station — don't pay agents ALL 5,000+",
      "Apostille via Albanian MFA: ALL 2,000-5,000/document",
      "Italian-language Albanian-origin community resources: Casa della Memoria Italo-Albanese, Albania House Rome, Centro Culturale Albano-Italiano (free or low-cost Italian language classes for Albanians)",
      "Open Banca Intesa Sanpaolo (largest Albanian Italian-friendly bank), UniCredit, BNL BNP Paribas, Banca Popolare di Milano salary account on arrival",
      "Use Western Union, Wise, RIA Money Transfer for remittance to Albania — competitive rates",
      "Italian Codice Fiscale (tax ID) is FREE at Agenzia delle Entrate — required before employment",
      "Tessera Sanitaria (health card) FREE via SSN registration at ASL",
      "Don't pay Albanian 'agjenci migracioni' EUR 1,000-5,000 — Italy-side employer handles Sportello Unico Immigrazione; Albania-side documents are straightforward DIY",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Decreto Flussi with Italian employer support",
        "EU Blue Card with high-skill Italian employer",
        "Family reunification (Ricongiungimento) for spouse / minor children / dependent parents",
        "Permesso di Soggiorno UE per Soggiornanti di Lungo Periodo after 5 years residence + B1 Italian",
        "Italian citizenship application after 10 years residence",
      ],
      getALawyer: [
        "Past Italian / Schengen entry ban or overstay",
        "Albanian criminal record (Anti-Mafia investigation, smuggling, narcotics — Italy rigorously checks)",
        "Past EU expulsion from another member state affecting Italian entry",
        "Albanian-Italian inheritance or property dispute affecting family reunification",
        "Asylum-related past family member case in Italy or another EU state",
        "Pre-1990 communist-era political affiliation history (rare but historically sensitive)",
        "Multiple-country Albanian migration history (Albania → Greece → Italy → onward)",
        "Bringing 18+ dependent or adult dependent relative",
        "Italian-Albanian language certification (CILS / CELI / PLIDA) dispute on level claimed",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // SPANISH → US — work
  // ════════════════════════════════════════════════════════════════════

  "ES:US:work": {
    whatCarriesWeight: [
      {
        label: "E-1 / E-2 Treaty Trader / Investor via the Spain-US 1903 Treaty",
        why: "Spain has a long-standing US Treaty of Friendship and General Relations (1903) — E-1 (substantial trade between Spain and US) and E-2 (substantial Spanish investment in US business) are major routes. Spanish companies with strong US presence: Inditex (Zara, Massimo Dutti, Bershka), Telefónica, Iberdrola, Banco Santander, BBVA, Repsol, Acerinox, Indra, Ferrovial, ACS. E-2 has no statutory minimum but $100k+ practical floor for tech / hospitality / restaurant ventures.",
      },
      {
        label: "H-1B Specialty Occupation OR L-1 intracompany via Spanish parent",
        why: "Standard H-1B (cap-subject lottery, ~30-35% Spanish win rate). L-1A/B (intracompany transfer) bypasses lottery if you've worked 1+ year at Spanish parent. Major Spanish multinationals (Telefónica USA, Banco Santander US, BBVA Compass, Iberdrola Avangrid, Repsol Houston, Inditex US, Ferrovial Cintra, Ebro Foods, Mango USA, Roca Sanitario) have well-trodden L-1 paths.",
      },
      {
        label: "DS-160 + Apostilled Spanish degrees + WES/ECE/AICE credential evaluation",
        why: "DS-160 online application, then book interview at US Embassy Madrid (Calle Serrano) or US Consulate General Barcelona (Paseo Reina Elisenda). Spanish degree certificates (Grado, Máster, Doctorado) need Apostille via Spanish Ministry of Education or via Spanish MFA — Spain is Hague signatory since 1978. Cost EUR 12-50/document, 5-10 working days. WES, ECE, or AICE foreign credential evaluation for US employer petition or licensure. Spanish Grado (Bologna 4-year) maps to US Bachelor's; Máster to US Master's.",
      },
      {
        label: "US-Spain Totalization Agreement (1988) + tax treaty + Beckham Law return considerations",
        why: "Get a Certificate of Coverage (CoC) from Spanish Seguridad Social — keeps you on Spanish Seguridad Social for up to 5 years on temporary US assignment, exempt from US Social Security/Medicare. Beyond 5 years switch to US system; Spanish quarters count toward future Spanish pension via Totalization. Tax treaty (1990, protocol 2013) prevents double-taxation. Spanish 'Beckham Law' (Ley de Impatriados) provides preferential tax treatment for 6 years to returning Spaniards working in Spain after living abroad — affects timing of US assignment return.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why the US — sector, employer, Spanish-American community",
        prompt: "Spanish applicants benefit from specificity. Tech (Silicon Valley, NYC, Boston, Austin, Miami — large Latin tech community), finance (NYC, Miami for Latin American banking), hospitality (NYC, Miami, LA — Spanish chefs and hoteliers especially), entertainment (LA / Miami — Spanish-language production, Sony Music Latin), energy (Houston, Texas). Name your target US employer and Spanish-American community connections.",
      },
      {
        heading: "Your Spanish employer / academic credentials",
        prompt: "List Spanish employer chronologically, role, salary in EUR with USD equivalent, supervisor name. Spanish universities (Universidad Complutense Madrid, Universidad de Barcelona, Autónoma de Madrid, Pompeu Fabra, Carlos III, ESADE, IESE, IE Business School, Universidad de Navarra, Politécnica de Madrid / Catalunya, ICADE) are well-known to US Embassy Madrid.",
      },
      {
        heading: "Long-term plan — H-1B + green card, E-2 indefinite, or temporary",
        prompt: "H-1B and L-1 allow dual intent — green-card plans openly stated. E-2 is non-immigrant but renewable indefinitely. Spain permits dual citizenship for Latin American + Sephardic + Filipino + Andorran + Equatorial Guinean + Portuguese citizens; for other nationalities (including American), Spain requires renunciation. State honest plan.",
      },
      {
        heading: "Family + dependants + Spanish school year",
        prompt: "Spouse on L-2: automatic work authorization since 2023; H-4 spouse needs EAD (limited). E-2 spouse gets E-2D with full work rights. Spanish spouse + children under 21 are derivative. Spanish school year (mid-September to mid-June) — children can transition to US August/September start with minimal disruption. International schools in Madrid (American School, Runnymede College, ICS Madrid) ease US transition.",
      },
    ],
    moneySavingTips: [
      "DS-160 fee $185 (H-1B/L-1) or $315 (E-1/E-2); pay in EUR at Citibank Spain or Banco Santander — no reciprocity fee for Spanish citizens",
      "Use WES iGPA Calculator (free online) before paying for full evaluation",
      "Apostille via Spanish MFA or Ministry of Education: EUR 12-50/document, 5-10 working days; or at Notaría (notary public) for some documents",
      "Open a US-domiciled bank account with Wise USD, Mercury Business, or Santander US (large Spanish diaspora-friendly branch network in NYC/Miami) before relocation",
      "Spanish Embassy DC + Consulates (Boston, Chicago, Houston, LA, NYC, Miami, San Juan PR, San Francisco) offer free notarisation for Spanish citizens",
      "Avoid Spanish 'asesoría de inmigración' charging EUR 3,000-10,000 for H-1B/L-1 — US-based attorneys at Fragomen, Berry Appleman, BAL have flat-fee Spanish services at $2,500-3,500",
      "Use Wise EUR/USD, Western Union, BBVA, or Santander for remittance — competitive vs traditional bank transfer",
      "Plan Spanish tax exit carefully — Spain taxes worldwide income for tax-residents (>183 days/year); file final IRPF return for year of departure; Beckham Law return option for eventual reverse migration",
      "ICEX (Instituto Español de Comercio Exterior) and Spanish-American Chamber of Commerce offer free networking for Spanish entrepreneurs and professionals in US",
    ],
    lawyerTriggers: {
      diy: [
        "Standard H-1B / L-1 with named US employer, clean record, clear Spanish degree mapping",
        "DS-160 interview prep at US Embassy Madrid / Consulate Barcelona",
        "Spouse / dependent derivative applications (H-4, L-2, E-2D)",
        "Renewal of existing H-1B / L-1 at US Embassy Madrid / Consulate Barcelona during home leave",
        "PERM-based EB-2 / EB-3 green card (Spanish are current — no per-country backlog)",
      ],
      getALawyer: [
        "E-1 Treaty Trader — substantial trade between Spain and US needs evidentiary support",
        "E-2 Treaty Investor — substantiality, source-of-funds, 'real and operating' enterprise tests",
        "EB-1A / EB-1B / O-1 — extraordinary ability",
        "Concurrent Spanish exit-tax considerations on substantial holdings >€4M",
        "Prior US visa refusal or US overstay",
        "Spanish criminal record (drug-related cases — disclosure to USCIS / DOS mandatory)",
        "Past ETA / Basque political affiliation history (1968-2011 era — sensitive)",
        "Past Catalan independence (Procés 2017) political affiliation history",
        "Same-sex spouse — Spain recognised same-sex marriage 2005 (one of earliest); US recognises; derivative visas straightforward",
        "Dual Spanish-Latin American passport (apply via Spanish passport — usually faster processing)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // FRENCH → CANADA — work
  // ════════════════════════════════════════════════════════════════════

  "FR:CA:work": {
    whatCarriesWeight: [
      {
        label: "Mobilité francophone — French-speakers' fast-track to Canadian work permit (LMIA-exempt)",
        why: "Canada strongly recruits French-speaking professionals to support French-language minority communities outside Quebec. 'Mobilité francophone' (formerly French Mobility Worker) is an LMIA-exempt work permit category — Canadian employer simply offers role at NOC TEER 0/1/2/3 with French as the working language. Significantly faster than LMIA-based work permit. French citizens benefit hugely from this — Express Entry French-language draws give 50-extra CRS points + category-based draws since 2023.",
      },
      {
        label: "Express Entry French-language draws + Quebec Skilled Worker Program (PSTQ)",
        why: "Express Entry CRS points: French-language proficiency (Niveau de compétence linguistique canadien NCLC 7+ via TEF Canada / TCF Canada) adds 25-50 points + access to French-speaking-priority category draws (introduced 2023). Quebec has separate immigration program (PSTQ — Programme de sélection des travailleurs qualifiés) — French-speakers fast-track to Quebec; after 6 months of Quebec residence + B2 French + integration courses, Permanent Resident status possible.",
      },
      {
        label: "WES Educational Credential Assessment + French degree recognition",
        why: "WES, ICAS, or IQAS evaluation of your French degree — Licence (3-year Bologna) typically maps to Canadian Bachelor's; Master to Master's; Grandes Écoles degrees (Polytechnique, Centrale, HEC, Sciences Po, ENS) typically map to Master's of Engineering / Business / Public Affairs depending on programme. For regulated professions in Quebec specifically: separate Quebec body (Ordre des ingénieurs du Québec, Collège des médecins du Québec, Ordre des comptables professionnels agréés CPA Québec).",
      },
      {
        label: "French Police Certificate + Casier Judiciaire National",
        why: "French Casier Judiciaire National Bulletin n°3 — free via online service at justice.fr, available within minutes for French residents. For French citizens abroad, slower (1-3 weeks). For every country you've spent 6+ months in (Belgium, Switzerland, Luxembourg, UK, Germany, Spain commonly for French), additional police certificate required.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — Mobilité francophone, Express Entry, PNP, or Quebec",
        prompt: "French citizens have unusually many Canadian routes. State explicitly: Mobilité francophone (LMIA-exempt work permit for French-speakers outside Quebec — fastest), Express Entry with French-language draws priority (50 CRS bonus + French-priority draws), Provincial Nominee Program (provinces like Ontario, Manitoba, New Brunswick, Nova Scotia have French-speaking streams), Quebec PSTQ (separate Quebec-only immigration program), or Quebec Mobility (different from rest of Canada).",
      },
      {
        heading: "Your French work history + Grandes Écoles credentials",
        prompt: "List every French employer with month-precision dates, role, salary in EUR, supervisor name + email. French Grandes Écoles (Polytechnique, Centrale, HEC, ENS, Sciences Po, ENA, Mines, INSA, Télécom Paris, Sorbonne, Paris-Saclay, ENSAE) are well-known to Canadian assessors. Document professional designations: PE / Ingénieur (CTI-accredited engineer), CPA (French Cabinet d'Expertise Comptable), Avocat (Bar admission), Médecin (Conseil de l'Ordre des Médecins).",
      },
      {
        heading: "Settlement plan + Quebec vs rest-of-Canada choice",
        prompt: "Quebec has separate immigration program with stricter French requirements (B2+ French) but faster permanent residence. Rest of Canada has Express Entry French-language priority. State your target province: Quebec (Montréal / Québec City — strongest French-Canadian community), Ontario (Toronto / Ottawa — large bilingual community), New Brunswick (officially bilingual province — strong French-Canadian welcome), British Columbia (Vancouver Acadian / French community), Alberta (Edmonton French community).",
      },
      {
        heading: "Long-term plan — Canadian citizenship + dual nationality",
        prompt: "Express Entry / PSTQ leads to PR after qualifying period; Canadian citizenship after 3 years (1,095 days) presence. France permits dual citizenship; Canada permits dual citizenship. State plan: settle in Quebec / Ontario / NB / BC, maintain French citizenship, eventual Canadian citizenship. Mention specific community connections if applicable (French-Canadian universities, Alliance Française, Lycée Français in target city).",
      },
    ],
    moneySavingTips: [
      "Mobilité francophone work permit fee CAD$155 — employer-side fees minimal compared to LMIA route",
      "Express Entry profile creation FREE — only pay processing fees at ITA stage (CAD$1,365 main + CAD$1,365 spouse + CAD$230/child)",
      "WES costs CAD$237 (basic) — common French universities have streamlined verification chains",
      "TEF Canada or TCF Canada French test: EUR 280-350 in France (Alliance Française centres in Paris, Lyon, Marseille, Bordeaux, Toulouse, Lille, Strasbourg, Nice, Nantes, Rennes, Montpellier, Grenoble)",
      "French Casier Judiciaire National Bulletin n°3: FREE online at justice.fr — don't pay agents EUR 50+",
      "Use HSBC France, BNP Paribas, Société Générale, Crédit Agricole for tuition / large remittance — competitive vs Wise for high-volume",
      "Open Wise CAD, RBC Canada, BMO, Scotiabank, TD Canada Trust account before flying — most accept French passport + Canadian work permit pre-arrival",
      "France-Canada tax treaty (1995, protocol 2013) prevents double-taxation; CSG/CRDS contributions are NOT US-foreign-tax-creditable (different from France-US) but France-Canada treaty has favourable provisions",
      "French Embassy DC + Consulates (Boston, Chicago, Houston, LA, NYC, Miami, San Francisco, New Orleans, Atlanta) offer free notarisation for French citizens",
      "French diaspora in Quebec / Toronto / Vancouver has well-organised support networks: Union des Français du Canada, Conseil Économique et Social Français au Canada, Alliance Française",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Mobilité francophone work permit with cooperating Canadian employer",
        "Express Entry profile creation, EOI submission, and ITA response (French-language priority draw)",
        "PNP application via French-speaking provincial stream",
        "Quebec PSTQ application via MIFI portal",
        "Canadian citizenship application after 3 years residence",
      ],
      getALawyer: [
        "Previous Canadian visa refusal",
        "Past US B1-B2 refusal or overstay (IRCC shares with USCIS)",
        "French criminal record",
        "Past EU expulsion / public-order ban affecting Canadian entry",
        "Concurrent French Wegzugsbesteuerung-equivalent (Exit Tax under Article 167 bis CGI) when leaving France with substantial holdings >€800k",
        "DALF C1/C2 not held by spouse + spouse from non-EU third country",
        "PACS partner accompanying — Canada recognises PACS as common-law partnership, but Quebec has its own civil-union framework",
        "Quebec PSTQ vs federal Express Entry strategic choice — significantly different timelines and requirements",
        "Dual French-other passport (French-Lebanese, French-Algerian, French-Vietnamese common — usually apply via French passport)",
        "Past French military service evader or conscientious objector status",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // GREEK → DE — work
  // ════════════════════════════════════════════════════════════════════

  "GR:DE:work": {
    whatCarriesWeight: [
      {
        label: "EU freedom of movement — no work permit needed for Greek citizens",
        why: "Greece is EU member; Greek citizens have full freedom of movement under TFEU Article 45 — no work permit, no visa, no residence permit required. Simply move to Germany and register with the local Bürgeramt (Anmeldung) within 14 days of arrival. Greek-German worker migration spiked during 2008-2018 Greek crisis (~80,000 Greeks moved to Germany 2010-2015) — significant Greek diaspora in Berlin, München, Hamburg, Stuttgart, Düsseldorf, Frankfurt.",
      },
      {
        label: "Anmeldung + Steuer-ID + Krankenkasse — practical bottlenecks",
        why: "Within 14 days of arrival, register address at local Bürgeramt — required for everything else. Anmeldung issues Anmeldebescheinigung. With it, Steueridentifikationsnummer arrives by mail in 2-3 weeks. Register with German health insurance (gesetzliche Krankenversicherung — TK, AOK, Barmer, DAK at ~14.6% of salary split with employer; OR private Krankenversicherung above €69,300 salary threshold). Without Krankenkasse, employer cannot run payroll.",
      },
      {
        label: "Greek-German social-security coordination + EFKA / Deutsche Rentenversicherung",
        why: "Under EU Regulation 883/2004, Greek EFKA (Ενιαίος Φορέας Κοινωνικής Ασφάλισης) contributions and German Rentenversicherung count toward each other. Greek pension claims coordinated with German Rente via A1 form for posted workers (≤24 months) — exempting from German Rentenversicherung. Beyond 24 months, switch to German system; Greek years count toward eventual pension. Greek-German tax treaty (1966) prevents double-taxation; Greek IFTS digital tax system processes Greek tax obligations.",
      },
      {
        label: "Greek qualification recognition — automatic for regulated EU professions",
        why: "EU Mutual Recognition Directive automatic for: ιατρός (doctor), νοσοκόμα/νοσοκόμος (nurse/midwife), φαρμακοποιός (pharmacist), αρχιτέκτονας (architect), κτηνίατρος (veterinary surgeon). Greek doctor degrees (Πτυχίο Ιατρικής) automatically valid in Germany after Anerkennung formality at Bezirksregierung. Other regulated professions (δικηγόρος lawyer, λογιστής accountant, μηχανικός engineer) require Anerkennung — typically faster for EU/EEA framework.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "No personal statement needed at the border — Greek citizens travel freely",
        prompt: "Greek-German movement requires no narrative at the border. Travel with Greek passport or Greek δελτίο ταυτότητας (national ID card). For Anmeldung at Bürgeramt: passport/ID, completed Anmeldeformular, Wohnungsgeberbestätigung (landlord's confirmation). Bring these to your appointment.",
      },
      {
        heading: "Settlement plan — German employer, city, integration",
        prompt: "Plan: which German city (Berlin / München / Hamburg / Stuttgart / Frankfurt / Düsseldorf — large Greek diasporas in NRW Nordrhein-Westfalen, Bayern, Hessen), which sector (automotive Stuttgart-Wolfsburg, finance Frankfurt, tech Berlin-München, healthcare across Germany, hospitality everywhere given large Greek-restaurant presence). Greek-Bavarian community in München is one of Europe's largest.",
      },
      {
        heading: "Long-term plan — German citizenship + retain Greek",
        prompt: "Germany's 2024 citizenship reform allows dual citizenship — Greek-German dual nationality fully permitted now. Naturalisation after 5 years legal residence (3 years with C1 German + special integration); A1/B1 German required + Einbürgerungstest. Greece permits dual citizenship.",
      },
      {
        heading: "Family + dependants + Greek school options in Germany",
        prompt: "EU family members travel freely. Greek-Bavarian and Greek-NRW schools (Hellenic Saturday Schools, Griechische Gemeinde) supplement German state schools — strong Greek diaspora community education networks in Stuttgart, München, Düsseldorf, Hamburg.",
      },
    ],
    moneySavingTips: [
      "EU citizens pay NO immigration fees in Germany — Anmeldung is FREE",
      "Don't pay 'Greek-German migration consultancies' EUR 1,000-3,000 for paperwork-free EU travel",
      "Free Anmeldung appointment at Bürgeramt websites — book 2-4 weeks ahead",
      "A1 form from EFKA Greece: FREE — exempts German Rentenversicherung for up to 24 months",
      "Open N26, Commerzbank, DKB, Sparkasse account before flying — all accept Greek ID + Greek address",
      "Free German language courses for EU citizens at Volkshochschule (community college) — A1-B2 German €100-500 (subsidised)",
      "Integration course (Integrationskurs) for B1 + civic knowledge is FREE for EU citizens needing it for naturalisation",
      "Greek doctors / nurses in Germany earn EUR 35k-80k+/year — significantly above Greek average; Anerkennung process fast",
      "Tax treaty Germany-Greece (1966) prevents double-taxation; AADE Greek tax authority and BZSt Germany coordinate",
      "Greek Embassy Berlin + Consulates (München, Stuttgart, Hamburg, Frankfurt, Köln, Düsseldorf) offer free Greek notarisation for citizens",
    ],
    lawyerTriggers: {
      diy: [
        "EU freedom of movement entry to Germany",
        "Standard Anmeldung at Bürgeramt with Greek passport",
        "Greek doctor / nurse / midwife / pharmacist Anerkennung",
        "Naturalisation application after 5 years residence",
        "EU family-member visa for non-EU spouse / children of Greek citizen",
      ],
      getALawyer: [
        "Greek criminal record affecting Anerkennung for regulated profession",
        "Past German entry ban / Schengen overstay flagged on Greek-side records (pre-EU)",
        "Non-EU spouse needing EU family-member visa",
        "Greek pension claim coordination with German Rentenversicherung",
        "Cyprus-related family member status (Greek-Cypriot vs Cypriot citizen)",
        "Past EU public-order ban from another member state",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // ETHIOPIAN → US — family
  // ════════════════════════════════════════════════════════════════════

  "ET:US:family": {
    whatCarriesWeight: [
      {
        label: "Family-based green card via IR-1 / CR-1 / F-2A / F-2B / F-1 / F-3 / F-4",
        why: "Ethiopians use standard US family-based immigration system. IR-1/CR-1 (spouse of US citizen), IR-2 (child under 21), IR-5 (parent), F-1 / F-2A / F-2B / F-3 / F-4 categories. Ethiopian-American community is concentrated in Washington DC area (largest Ethiopian-origin US community ~250,000), Minneapolis, Atlanta, Los Angeles, Seattle. F-4 sibling petition has ~15+ year backlog for Ethiopia; F-3 ~12+ year; F-2A 'current' status as of 2025 visa bulletin.",
      },
      {
        label: "Ethiopian civil documents + apostille via Ethiopian MFA / Document Authentication and Registration Agency (DARA)",
        why: "Ethiopia is NOT Hague Apostille signatory. Documents need full legalisation chain: 1) issuing authority (Kebele birth certificate, Wereda marriage certificate, Federal Court divorce decree), 2) Ethiopian Document Authentication and Registration Agency (DARA — formerly Document Authentication), 3) Ethiopian MFA (Foreign Affairs Ministry — Bole), 4) US Embassy Addis Ababa (Entoto Road) verification. Cost ETB 200-1,000/document + USD 25-50. Pre-1991 records often handwritten and may need rectification.",
      },
      {
        label: "Affidavit of Support (I-864) + Ethiopian-American sponsor compliance",
        why: "US sponsor (citizen or LPR) files Form I-864 — must show income at 125% of Federal Poverty Guidelines. Joint sponsors accepted. Ethiopian-American sponsors should attach: 3 years US tax returns (Form 1040), W-2s, employer letter, bank statements, asset valuations. Ethiopian-American community has well-organized mutual aid through Ethiopian Community Development Council (ECDC), Ethiopian Sports Federation in North America, Tsehai Loves Ethiopia organization.",
      },
      {
        label: "Ethiopian Police Clearance + medical exam at Addis Ababa panel physician",
        why: "Ethiopian Police Clearance Certificate from Ethiopian Federal Police via online portal (ETB 100-300, 7-21 days). Medical exam at US-designated panel physician in Addis Ababa — most common: Hayat Medical College, St. Paul's Hospital Millennium Medical College, Yekatit 12 Hospital. Cost USD 200-400. Yellow fever vaccination required (Ethiopian children routinely vaccinated — bring carnet de vacunación). Polio booster sometimes required for adults.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your visa category and relationship",
        prompt: "State explicit visa category and family relationship. IR-1/CR-1 (spouse of US citizen), IR-2 (child under 21), IR-5 (parent), F-1 (unmarried adult child), F-2A (spouse/minor children of LPR), F-2B (unmarried adult children of LPR), F-3 (married children), F-4 (siblings — 15+ year backlog for Ethiopia).",
      },
      {
        heading: "Your relationship narrative",
        prompt: "For spousal cases, IR-1/CR-1 documents bona fide marriage: when/where/how met (Ethiopia, US, third country), wedding details, photos, joint financial records, joint travel, communication history. CR-1 is 2-year conditional pending I-751; IR-1 is 10-year unconditional. Document Ethiopian wedding traditions (Mahabbet, Melse) carefully — US officers understand Ethiopian wedding customs through Ethiopian-American interpretive frameworks.",
      },
      {
        heading: "Family ties + Ethiopian context",
        prompt: "Document Ethiopian residence (Addis Ababa / Mekele / Gondar / Bahir Dar / Hawassa / Dire Dawa region level), parents' occupation, siblings, education at Ethiopian universities (Addis Ababa University, Mekele University, Adama Science and Technology University, Bahir Dar University), Ethiopian property with title (Sira Yegna), Ethiopian bank accounts. Ethiopia has had multiple humanitarian crises (Tigray conflict 2020-2022, drought, Eritrean border tensions) — context may be relevant for related family-protection cases.",
      },
      {
        heading: "US sponsor compliance + future plan",
        prompt: "US sponsor relationship + I-864 capacity. State settlement plan: where you'll live (typically near Ethiopian-American community — DC metro, Minneapolis, Atlanta, Seattle, Los Angeles), work plan (Ethiopian credentials evaluated via WES/ECE), child education plan (US public school enrolment), eventual naturalisation timeline.",
      },
    ],
    moneySavingTips: [
      "Family-based visa total fee per applicant: I-130 petition $675 + NVC processing $445 + medical $200-400 + I-864 affidavit $120 = typically $1,400-1,800",
      "Ethiopian-American legal aid: Ethiopian Community Development Council DC, Tsehai Loves Ethiopia, Ethiopian Sports Federation in North America — free or low-cost consultation",
      "Document legalisation via Ethiopian DARA: ETB 200-1,000/document — don't use 'Addis document service' charging ETB 5,000+",
      "Don't pay 'asesores migratorios' / 'Ethio migration agencies' USD 5,000-15,000 — USCIS forms are free at uscis.gov; immigration attorney costs $1,500-5,000 max for full I-130 + consular processing",
      "Translation: certified Amharic/Tigrinya/Oromo to English translation USD 25-50/page",
      "Medical exam at Hayat Medical, St. Paul's, or Yekatit 12: USD 200-400 — direct booking",
      "Use Wise USD/ETB, Western Union, World Remit, RIA, or Telebirr for remittance — competitive vs traditional bank transfer; Commercial Bank of Ethiopia and Awash Bank have international branches",
      "Ethiopian Embassy DC + Consulates (Atlanta, Houston, LA, NYC, Minneapolis, Seattle) offer free notarisation for Ethiopian citizens",
      "F-4 sibling petition has 15+ year backlog for Ethiopia — start applications NOW if relative may apply later",
      "Use direct flight Ethiopian Airlines Addis Ababa → Washington Dulles (IAD) — non-stop flagship route for Ethiopian-American immigration journey",
    ],
    lawyerTriggers: {
      diy: [
        "Standard I-130 petition for spouse / immediate family member with clean record",
        "I-485 Adjustment of Status (if already in US under valid status)",
        "Naturalisation (N-400) after 3 years marriage to US citizen or 5 years LPR",
        "F-1 / F-2A / F-2B / F-3 / F-4 priority date tracking and waiting",
      ],
      getALawyer: [
        "Prior US visa refusal or US overstay",
        "Ethiopian criminal record (anti-terror Act, drug, fraud)",
        "Family member with prior US asylum claim (Eritrean separation, Tigray conflict, OLA Oromo Liberation Army, political opposition)",
        "Adoption-related petition where Ethiopian adoption documentation incomplete (Ethiopia paused intercountry adoptions 2017-2018)",
        "Same-sex spouse — Ethiopia criminalises same-sex relations under Penal Code; US recognises; documentation chain doesn't exist; refugee claim alternative possible",
        "Past unauthorised US entry / border crossing (rare for Ethiopians)",
        "Ethiopian-American sponsor with prior tax delinquency affecting I-864 sponsorship",
        "Multi-country Ethiopian migration history (Ethiopia → Kenya → Sudan → US complicates beneficiary documentation)",
        "Eritrean-origin family member (Eritrea and Ethiopia have separate immigration histories — Eritrean asylum claims affect Ethiopian relatives)",
        "Bringing 18+ dependent or adult dependent relative",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDIAN → GERMANY — work
  // ════════════════════════════════════════════════════════════════════

  "IN:DE:work": {
    whatCarriesWeight: [
      {
        label: "EU Blue Card — preferred route for Indian IT/engineering professionals",
        why: "Indians are Germany's fastest-growing professional immigrant group (~280,000 Indians in Germany, doubled 2018-2023). EU Blue Card threshold €48,300/year (2024 general) or €43,759 in shortage occupations (IT, STEM, medicine, math, engineering). For IT roles specifically, the threshold is €43,759 even without specific shortage classification — favours Indian software engineers. Processing 4-6 weeks at German Consulate Mumbai (BKC), Chennai (Anna Salai), Bangalore (Lavelle Road), New Delhi (Chanakyapuri), Kolkata (Hastings).",
      },
      {
        label: "Anerkennung — recognition of Indian qualification through Anabin / ZAB",
        why: "Germany requires formal recognition of Indian degrees through Anabin database. Most major Indian university Bachelor's (IIT, NIT, IIIT, BITS, IISc, Delhi, Mumbai, Madras, Calcutta, Bangalore, Hyderabad, Jadavpur, Anna University, Manipal, VIT) map as H+ (recognised). Lesser-known institutions need ZAB (Zentralstelle für ausländisches Bildungswesen) individual assessment at €200. For regulated professions (medicine, nursing, engineering PE) the Anerkennung is granted by the relevant Länder Anerkennungsstelle.",
      },
      {
        label: "Indian Police Clearance + Apostille via MEA",
        why: "Indian PCC from passport seva portal (INR 500, 7-21 days). MEA Apostille via e-Sanad portal (Hague signatory since 2005, free or INR 50-200/document). German Consulate India accepts apostilled Indian documents directly. For employment contracts and birth/marriage certificates, separate apostille chain required.",
      },
      {
        label: "German language A1 vs Blue Card no-language requirement",
        why: "Blue Card doesn't require German at application (B1 needed for Niederlassungserlaubnis after 21 months with A1 or 33 months without). For Skilled Worker route (non-Blue-Card), A2 German typically required. Indian applicants in tech often delay German learning, planning to leave Germany after 3-5 years; those committed to long-term stay should start A1 via Goethe-Institut Mumbai / Bangalore / Chennai / Delhi / Kolkata / Pune / Hyderabad immediately.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why Germany over US, UK, or Canada alternatives",
        prompt: "Indians have many global options. Germany differentiators: EU passport access after naturalisation, lower cost of living than UK/US/Canadian major cities, world-class engineering / automotive / industrial sector, strong R&D culture, 2024 citizenship reform (5 years for naturalisation, dual citizenship permitted). Name specific German employer (Siemens, SAP, Bosch, BMW, Mercedes-Benz, Volkswagen, Continental, Allianz, Munich Re, Deutsche Bank, Bayer, BASF, Helsing, BioNTech, N26, GetYourGuide) and city.",
      },
      {
        heading: "Your Indian work history + IIT/NIT/professional credentials",
        prompt: "List every Indian employer chronologically with month-precision dates, role, salary in INR, supervisor + email. IIT / NIT / IIIT / BITS / IISc degrees auto-recognised by Anabin database. Document any Indian professional designations: PEC PE (engineers), MCI registration (doctors), ICAI (accountants), MBBS / MD postgraduate. For German Blue Card, attach degree certificate + Apostille + Anabin H+ status proof.",
      },
      {
        heading: "Family + Indian school options in Germany",
        prompt: "Spouse on Blue Card derivative has full work rights (one of Germany's best perks for trailing spouses). Children up to 16 automatic; 16-18 with A1 German. Indian schools in Germany: Indian International School Stuttgart, Indian School München (private), Indian Cultural Centres in Berlin / Frankfurt / Hamburg. Many Indian families choose German Realschule / Gymnasium directly for full German curriculum.",
      },
      {
        heading: "Long-term plan — Niederlassungserlaubnis + 2024 citizenship reform",
        prompt: "Germany's 2024 citizenship reform reduces naturalisation period from 8 to 5 years (3 with C1 German + special integration including civic engagement) and allows dual citizenship (major change — Indians previously had to renounce). State plan: Niederlassungserlaubnis after 21 months Blue Card with A1 German or 33 months without; citizenship after 5 years. India doesn't permit dual citizenship — Indian-Germans must renounce Indian passport at German naturalisation, but can apply for OCI (Overseas Citizen of India) afterward for visa-free India access.",
      },
    ],
    moneySavingTips: [
      "Blue Card visa fee at German consulates is €75 — pay in INR equivalent at consular bank counter; significantly cheaper than UK Skilled Worker fees",
      "Goethe-Institut India centres offer A1-B2 German courses at INR 30,000-60,000 total — start before relocation for Niederlassungserlaubnis timeline planning",
      "Open N26 (online digital bank — accepts Indian passport pre-arrival), Commerzbank, DKB, or Deutsche Bank account; Schufa-Auskunft (€29.95 online) before rental application",
      "Use ICICI Forex, HDFC Forex, or SBI Foreign Exchange for tuition / relocation transfers; RBI's LRS allows USD 250,000/year outbound",
      "Don't break Indian EPF (Employees Provident Fund) early — keep contributions; India-Germany Social Security Agreement (effective October 2009) coordinates contributions",
      "Health insurance: public TK costs same as any other insurer at your income level — don't pay 'health insurance brokers'",
      "Indian Embassy Berlin + Consulates (München, Hamburg, Frankfurt) offer free notarisation for Indian citizens; Indian-origin Mietverein lawyers in major German cities offer pro-bono advice for first-time Indians",
      "Avoid Indian 'Germany migration consultancies' charging INR 200,000-1,500,000 for Blue Card — German consulate processes Blue Card directly; only complex cases benefit from German Rechtsanwalt für Migrationsrecht",
      "Apply for Indian Tax Residency Certificate at Income Tax Department if you'll be German-resident >182 days/year — exempts German income from Indian global-income tax under India-Germany DTAA",
      "Use Wise INR/EUR, Western Union, MoneyGram, or Remitly for remittance — competitive vs SBI international transfer",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Blue Card with German employment contract above salary threshold",
        "Skilled Worker Residence Permit with H+ rated Indian Bachelor's and clean record",
        "Spouse / dependent applications via family reunification (Familiennachzug)",
        "Permanent residence (Niederlassungserlaubnis) after qualifying period with documented A1/B1 German",
        "Citizenship application after 5 years under 2024 reform (with C1 German + integration for 3-year fast-track)",
      ],
      getALawyer: [
        "Indian criminal record (NDPS narcotics, dowry, criminal breach of trust)",
        "Regulated profession recognition (medicine, dentistry, pharmacy, teaching) — Anerkennung process is Länder-specific",
        "Indian PAN/Aadhaar-based ITR delinquency affecting future German residency renewal",
        "Switch from Blue Card to self-employment / Freiberufler — different residence-permit category",
        "Niederlassungserlaubnis with extended absences from Germany (Indian business travel can break the residence chain)",
        "Family member with prior US / UK / Canadian asylum claim from India affecting good-character assessment",
        "Dual Indian-OCI status of spouse complicating Familiennachzug documentation",
        "Indian military / IRS Indian Revenue Service background needing additional security review",
        "Past Gulf state work history with kafala-system disputes affecting German employer due-diligence",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // SOUTH AFRICAN → CA — work
  // ════════════════════════════════════════════════════════════════════

  "ZA:CA:work": {
    whatCarriesWeight: [
      {
        label: "Express Entry + Provincial Nominee Program — South Africans benefit from English-medium education",
        why: "South Africa sends ~10,000 PR admissions to Canada annually. Express Entry pool (FSW / FST / CEC) uses CRS scoring. South African Bachelor's (3-year vs 4-year — SAQA verification helps clarify) typically maps to Canadian Bachelor's. South Africans benefit from English-medium education (CLB 9+ achievable on IELTS — full points for Canadian Language Benchmark). Provincial Nominee Programs (Ontario OINP, BC, Alberta AAIP, Saskatchewan SINP, Manitoba MPNP, Atlantic AIPP) actively recruit South Africans via tech / healthcare / general skilled streams.",
      },
      {
        label: "LMIA-based work permit OR LMIA-exempt categories",
        why: "For temporary work permit: most South Africans use LMIA-backed Temporary Foreign Worker Program (employer pays CAD$1,000 LMIA fee). LMIA-exempt options: Intra-Company Transfer (SA parent → Canadian subsidiary — Discovery, MTN, Naspers, Sasol have well-trodden L-1-equivalent paths). South African tech workers often use Global Talent Stream (GTS) for 2-week processing.",
      },
      {
        label: "WES Educational Credential Assessment + IELTS General CLB 9+",
        why: "WES, ICAS, or IQAS evaluation of your SA degree. South African Bachelor's degrees from English-medium universities (UCT, Wits, Stellenbosch, UJ, UP Pretoria, UKZN, Rhodes, NMU) are recognised as Canadian equivalents. IELTS General typically CLB 9+ for South Africans given native English proficiency — significant CRS boost. PTE Core also accepted (introduced December 2023).",
      },
      {
        label: "SAPS Police Clearance + Canadian health requirement",
        why: "SAPS Police Clearance from local SAPS station or eHome Affairs (R150-R200, 6-12 weeks turnaround — START EARLY). For every country you've spent 6+ months in (UK, US, AU common for South Africans), additional police certificate required. Canadian medical exam at panel physician in SA (Pretoria, Cape Town, Durban) plus chest X-ray for TB. Cost R2,500-R3,500.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — Express Entry, PNP, LMIA Work Permit, or Quebec",
        prompt: "South Africans have many Canadian routes. State explicitly: Express Entry (federal pool — FSW / FST / CEC), Provincial Nominee Program (named province), LMIA-backed Work Permit (employer sponsored), LMIA-exempt Work Permit (intra-company / GTS / French Mobility if applicable), Quebec PSTQ (separate Quebec immigration), Atlantic Immigration Program. Choose route based on your CRS, target province, and employer support.",
      },
      {
        heading: "Your South African work history + professional body numbers",
        prompt: "List every SA employer (Discovery, MediClinic, Netcare, Life Healthcare, Standard Bank, FirstRand, Sasol, Anglo American, MTN, Vodacom, Naspers) with exact dates, role, salary in ZAR, supervisor + email. Include professional body registrations: SANC PIN (nurses), HPCSA MP/SP/PSY number, ECSA PrEng/CandEng, SAICA membership, SACAA pilot licence.",
      },
      {
        heading: "Settlement plan + funds — proof of CAD$13,757 (1 adult) or scaled up",
        prompt: "Document SA bank statements (FNB, Standard Bank, Absa, Nedbank, Capitec), SA property liquidation plan, currency conversion considerations (ZAR/CAD volatility means hold equivalent of CAD$15,000+ buffer). Mention Canadian family if applicable.",
      },
      {
        heading: "Long-term plan — Canadian citizenship + retain SA",
        prompt: "Express Entry → PR → Canadian citizenship after 3 years (4 years if not present 3 cumulative). Canada permits dual citizenship; South Africa permits dual citizenship with prior application via Section 26B Citizenship Act (apply before naturalising to avoid loss of SA passport). Most SA-Canadian dual nationals retain both passports legally.",
      },
    ],
    moneySavingTips: [
      "Express Entry profile creation FREE — only pay processing fees at ITA stage (CAD$1,365 main + CAD$1,365 spouse + CAD$230/child)",
      "Use the IRCC's free CRS calculator and Express Entry profile tool — don't pay RCIC CAD$2,000-5,000 unless complex case",
      "WES costs CAD$237 (basic) or CAD$329 (course-by-course); ICAS / IQAS alternatives",
      "IELTS General: book via British Council South Africa or IDP — R2,650-R3,000; PTE Core also accepted",
      "SAPS Police Clearance: apply EARLY (6-12 weeks) — R150-R200; don't pay 'expediting services' R5,000+",
      "Use SAQA verification (free for SA-side recognition) before Canadian assessing authority",
      "South African Reserve Bank approval for transfers >R1m — apply via FX desk at FNB, Standard Bank, Absa, or Nedbank; free",
      "Don't pay 'MARA + Canadian partner' agencies R30,000-100,000 — MARA agents have NO authority on Canadian matters; use Canadian RCIC directly (~CAD$2,000-5,000) or DIY",
      "Open Wise CAD, RBC, TD Canada Trust, BMO, Scotiabank, CIBC newcomer account before flying — most accept SA passport + Canadian visa pre-arrival",
      "Negotiate Canadian relocation package — typically CAD$5,000-10,000 for SA hires given higher logistics + airfare cost",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Express Entry / PNP with WES + IELTS 9+ + clean record",
        "LMIA-backed Work Permit with Canadian employer support",
        "Dependent applications concurrent with main applicant",
        "Permanent Residence transition from work permit → PR",
        "Canadian citizenship application after 3 years residence",
      ],
      getALawyer: [
        "Previous Canadian visa refusal",
        "Past US B1-B2 refusal or overstay",
        "South African criminal record (even diversion programme outcome)",
        "Past UK Tier 4 student visa with TOEIC fraud allegation (2010-2015 mass scandal)",
        "Apartheid-era political affiliation history (rare but historically sensitive for older applicants)",
        "Express Entry CRS borderline — strategic optimisation",
        "Bringing 18+ dependent or adult dependent relative",
        "Dual SA / other non-Commonwealth passport (visa application from wrong passport)",
        "Past Australian visa with section 116 cancellation flag",
        "Past Gulf state work history with kafala-system disputes",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // FILIPINO → JAPAN — work
  // ════════════════════════════════════════════════════════════════════

  "PH:JP:work": {
    whatCarriesWeight: [
      {
        label: "Specified Skilled Worker (Tokutei Ginō) + Engineer/Specialist routes",
        why: "Japan has accelerated Filipino recruitment 2019-2024 under both Tokutei Ginō (Specified Skilled Worker, 12 industries, JLPT N4 + skills test required, 5-year initial) and Engineer/Specialist in Humanities/International Services (技術・人文知識・国際業務 — for university-degree-holding Filipinos). About 250,000 Filipinos in Japan as of 2024 (3rd-largest expat group after Chinese and Korean), with strong growth in caregiving (kaigo), construction, food service, hospitality, and manufacturing.",
      },
      {
        label: "Japanese language requirement + JLPT N4 minimum + caregiver-specific testing",
        why: "Tokutei Ginō i requires JLPT N4 (basic — ~250-300 hours study) + industry skills test. For caregiving (kaigo) role specifically, additional Kaigo Nihongo (caregiver-specific Japanese language test) — addresses Filipino caregivers being a major Japanese policy priority due to aging population. Japan-Philippines Economic Partnership Agreement (JPEPA, 2008) created the caregiver/nurse pathway with subsidised Japanese language training in PH (DMW + JICWELS partnership).",
      },
      {
        label: "POEA / DMW deployment clearance + Japan receiving organization",
        why: "Filipinos must go through Department of Migrant Workers (DMW, formerly POEA) for overseas deployment — includes pre-departure orientation seminar (PDOS), OEC (Overseas Employment Certificate, valid 60 days), and OWWA (Overseas Workers Welfare Administration) membership. Japan-side: receiving organization must be MOJ (Ministry of Justice) registered as accepting Tokutei Ginō workers. Vietnamese sending model applies — Filipino sending organisations (BLAS-licensed) typically pay caregiver candidate's Japanese language training upfront, deducted from first months' salary.",
      },
      {
        label: "Filipino-Japanese cultural integration + family reunification",
        why: "Tokutei Ginō i is 5-year initial without family typically; Tokutei Ginō ii (after JLPT N3 + advanced skills test) allows family + longer duration. Engineer/Specialist allows family + path to Permanent Residence (PR) after 5 years standard, 1-3 years via Highly Skilled Professional. Filipino community in Japan concentrated in Tokyo (Ueno area), Yokohama, Osaka, Nagoya, Fukuoka — Filipino Catholic communities provide cultural / spiritual support.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — Tokutei Ginō, Engineer/Specialist, or other",
        prompt: "State explicit visa category. Tokutei Ginō i (12 industries, JLPT N4 + skills test, 5-year initial, family not generally allowed during i), Tokutei Ginō ii (after JLPT N3 + advanced skills test, family possible, longer duration, path to PR), Engineer/Specialist (degree-required, family allowed from start, path to PR), JPEPA caregiver/nurse pathway (Japan-Philippines specific).",
      },
      {
        heading: "Your Filipino work history + Japanese language journey",
        prompt: "List every Philippine employer with month-precision dates, role, salary in PHP, supervisor + contact. Include TIN, SSS, Pag-IBIG, PhilHealth, PRC licence number. Document Japanese language progression: enrolment date in Japanese course (with study hours), JLPT level achieved + certificate, Kaigo Nihongo if caregiver, industry-specific skills test results.",
      },
      {
        heading: "Sending organisation + Japanese receiving organisation",
        prompt: "Filipino sending organisation (BLAS-licensed agency) name + DMW licence — verify on DMW website. Japanese receiving organisation name + MOJ registration. Reputable Filipino sending agencies: Cuevas International, Bautista International, EDI Staffbuilders International, A1 Healthcare Industry. Don't sign with unlicensed brokers (operating outside DMW oversight).",
      },
      {
        heading: "Long-term plan — Tokutei Ginō ii, return to Philippines, or settlement",
        prompt: "Tokutei Ginō i is officially temporary (5 years); Tokutei Ginō ii allows family + longer duration + path to PR (after 10 years total residence). State plan: temporary 5-year Tokutei Ginō i + return to Philippines with skills + savings (most common for caregivers), promotion to Tokutei Ginō ii + family settlement, or Engineer/Specialist route to PR.",
      },
    ],
    moneySavingTips: [
      "Tokutei Ginō visa: receiving employer pays initial visa-related fees (Japan-side); Filipino sending organisation fees regulated under DMW guidelines",
      "Don't use unlicensed Filipino brokers — illegal under RA 11641 Migrant Workers and Overseas Filipinos Act 1995",
      "Free Japanese language courses for Tokutei Ginō workers at sending organisation training centres",
      "JLPT registration in Philippines: PHP 1,000-2,500 (N5) to PHP 5,000-8,000 (N1) at TESDA / Far Eastern University / De La Salle University JLPT centres",
      "Free pre-departure orientation (PDOS) at OWWA / sending organisation",
      "Open MUFG, SMBC, Mizuho, or Japan Post Bank account on arrival (with Residence Card)",
      "Use Western Union, Wise PHP/JPY, PNB Japan, Cebuana Lhuillier, or M Lhuillier for remittance to Philippines",
      "End of employment: nenkin (national pension) lump-sum refund — claim within 2 years via Japan Pension Service",
      "Use Philippine Embassy Tokyo / Consulate Osaka for free document attestation",
      "Tokutei Ginō ii promotion exam: free industry-specific skills test + JLPT N3",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Tokutei Ginō i application via licensed sending organisation + Japanese receiving organisation",
        "Engineer/Specialist visa for university-degree-holding Filipino",
        "JLPT N4 + industry skills test preparation",
        "Status of Residence renewal at regional Immigration Bureau",
        "Tokutei Ginō i → ii promotion",
        "Nenkin lump-sum refund on departure",
      ],
      getALawyer: [
        "Past Filipino sending-organisation fraud / overcharging",
        "Past Japan-side labour dispute (overtime, harassment, contract breach)",
        "Filipino criminal record (anti-drug, illegal recruitment-victim status)",
        "Switching Japanese sponsor within Tokutei Ginō",
        "Bringing same-sex partner — Philippines doesn't legally recognise same-sex marriage federally; Japan doesn't recognise same-sex marriage; no derivative visa path",
        "Past Japan deportation or overstay",
        "Complex degree-role mismatch for Engineer/Specialist",
        "Pregnancy during Tokutei Ginō contract",
        "Past Saudi / UAE / Qatar work history with kafala disputes affecting Japan receiving organisation due-diligence",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // PORTUGUESE → DE — work
  // ════════════════════════════════════════════════════════════════════

  "PT:DE:work": {
    whatCarriesWeight: [
      {
        label: "EU freedom of movement — no work permit needed for Portuguese citizens",
        why: "Portugal is EU member; Portuguese citizens have full freedom of movement under TFEU Article 45 — no work permit, no visa, no residence permit required. Move to Germany and register with Bürgeramt within 14 days. Portuguese-German migration spiked post-2008 Portuguese crisis (~30,000 Portuguese moved 2010-2015) — significant Portuguese diaspora in Berlin, München, Hamburg, Frankfurt, Stuttgart.",
      },
      {
        label: "Anmeldung + Steuer-ID + Krankenkasse",
        why: "Within 14 days of arrival, register at Bürgeramt. Anmeldebescheinigung + Steueridentifikationsnummer + Krankenkasse registration are practical bottlenecks. Public TK / AOK / Barmer / DAK ~14.6% of salary; private above €69,300 salary threshold.",
      },
      {
        label: "Portuguese-German social-security coordination via EU framework",
        why: "Under EU Regulation 883/2004, Portuguese Segurança Social and German Rentenversicherung count toward each other (totalization). Portuguese A1 form (FREE via Segurança Social) — exempts German Rentenversicherung for up to 24 months for posted workers. Tax treaty Germany-Portugal (1980, protocol 2003) prevents double-taxation.",
      },
      {
        label: "Portuguese qualification recognition — automatic for regulated EU professions",
        why: "EU Mutual Recognition Directive automatic for: médico (doctor), enfermeiro/enfermeira (nurse), farmacêutico (pharmacist), arquitecto (architect), veterinário. Other regulated professions (advogado lawyer, contabilista accountant, engenheiro engineer) require Anerkennung — typically faster for EU/EEA framework.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "No personal statement needed at border — Portuguese citizens travel freely",
        prompt: "Portuguese-German movement requires no narrative. Travel with Portuguese passport or cartão de cidadão (national ID).",
      },
      {
        heading: "Settlement plan — German employer, city, integration",
        prompt: "Plan: which German city (Berlin / München / Hamburg / Frankfurt / Stuttgart). Portuguese-German diaspora in Hamburg / Berlin / Düsseldorf is strong.",
      },
      {
        heading: "Long-term plan — German citizenship + retain Portuguese",
        prompt: "Germany's 2024 citizenship reform allows dual citizenship — Portuguese-German dual nationality fully permitted. Portugal permits dual citizenship.",
      },
      {
        heading: "Family + dependants",
        prompt: "EU family members travel freely. Portuguese schools in Germany supplement German state schools — Hamburg / Berlin Portuguese-Saturday schools exist.",
      },
    ],
    moneySavingTips: [
      "EU citizens pay NO immigration fees — Anmeldung FREE",
      "Don't pay 'Portuguese-German migration consultancies' EUR 1,000-3,000",
      "Free Anmeldung at Bürgeramt websites",
      "A1 form from Segurança Social Portugal: FREE",
      "Open N26, Commerzbank, DKB, Sparkasse — all accept Portuguese ID",
      "Free German language courses at Volkshochschule",
      "Portuguese doctors / nurses earn EUR 35k-80k+ in Germany",
      "Tax treaty Germany-Portugal prevents double-taxation",
      "Portuguese Embassy Berlin + Consulates (Düsseldorf, Hamburg, München, Frankfurt) offer free notarisation",
    ],
    lawyerTriggers: {
      diy: [
        "EU freedom of movement entry to Germany",
        "Standard Anmeldung at Bürgeramt",
        "Portuguese doctor / nurse / midwife / pharmacist Anerkennung",
        "Naturalisation after 5 years residence",
      ],
      getALawyer: [
        "Portuguese criminal record affecting Anerkennung",
        "Past German entry ban / Schengen overstay",
        "Non-EU spouse needing EU family-member visa",
        "Portuguese pension claim coordination with German Rentenversicherung",
        "Brazilian-Portuguese dual nationality complications",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // NIGERIAN → CANADA — work
  // ════════════════════════════════════════════════════════════════════

  "NG:CA:work": {
    whatCarriesWeight: [
      {
        label: "Express Entry + Provincial Nominee Program — Nigerians are Canada's #2 African source",
        why: "Nigeria is Canada's #2 African source of skilled migrants (~17,000 PR admissions in 2023). Express Entry pool (FSW / FST / CEC) uses CRS scoring. Nigerian Bachelor's degrees from accredited universities (Covenant, OAU Obafemi Awolowo, UI Ibadan, Unilag, UNN, ABU Zaria, FUTA) typically map to Canadian Bachelor's via WES. Provincial Nominee Programs (Ontario, Manitoba, Saskatchewan, Atlantic provinces) actively recruit Nigerian healthcare, IT, and engineering professionals.",
      },
      {
        label: "LMIA-based work permit OR LMIA-exempt categories",
        why: "Most Nigerians use LMIA-backed TFW Program. LMIA-exempt: Intra-Company Transfer (Nigerian parent → Canadian subsidiary), Global Talent Stream (GTS) for tech roles — 2-week processing.",
      },
      {
        label: "WES Educational Credential Assessment + IELTS General CLB 7+",
        why: "WES, ICAS, or IQAS evaluation. Nigerian English-medium education means CLB 7-9 achievable. IELTS General typically CLB 7+ for CRS optimisation. PTE Core also accepted.",
      },
      {
        label: "Nigerian Police Clearance + Canadian health requirement",
        why: "Nigerian PCC from local CID HQ or via online passport portal (NGN 5,000-15,000, 14-30 days). For every country you've spent 6+ months in (UK, Ghana, UAE common for Nigerians), additional police certificate. Canadian medical at panel physician in Lagos / Abuja.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — Express Entry, PNP, LMIA Work Permit",
        prompt: "State explicitly: Express Entry, PNP (named province), LMIA Work Permit, or LMIA-exempt route.",
      },
      {
        heading: "Your Nigerian work history + professional credentials",
        prompt: "List every Nigerian employer with exact dates. Include professional body registrations: MCAN (medical), NMC (nursing), COREN (engineers), ICAN (accountants).",
      },
      {
        heading: "Settlement plan + funds CAD$13,757+",
        prompt: "Document Nigerian bank statements (GTBank, Zenith, Access, UBA, First Bank), CBN-approved currency conversion plan.",
      },
      {
        heading: "Long-term plan — Canadian citizenship",
        prompt: "Express Entry → PR → Canadian citizenship after 3 years. Nigeria permits dual citizenship; Canada permits dual citizenship.",
      },
    ],
    moneySavingTips: [
      "Express Entry profile FREE — pay processing fees at ITA stage (CAD$1,365 main + dependents)",
      "WES CAD$237 — Nigerian universities have varied verification chains",
      "IELTS General R12,000-R18,000 NGN at British Council Lagos/Abuja",
      "Nigerian PCC: NGN 5,000-15,000 via online portal — don't pay agents NGN 100,000+",
      "Use Wise NGN/CAD, World Remit, LemFi, or Sendwave for remittance — competitive vs Nigerian bank international transfer",
      "Don't pay 'Canada migration agencies' NGN 500,000-5,000,000 — IRCC forms are free; RCIC costs CAD$2,000-5,000",
      "Open Wise CAD, RBC, BMO, Scotiabank newcomer account before flying",
      "Negotiate Canadian relocation package — typically CAD$5,000-10,000 for Nigerian hires",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Express Entry / PNP with WES + IELTS + clean record",
        "LMIA-backed Work Permit",
        "Dependent applications",
        "Canadian citizenship application after 3 years",
      ],
      getALawyer: [
        "Previous Canadian visa refusal",
        "Past US B1-B2 refusal or overstay (Nigerians face higher scrutiny)",
        "Nigerian criminal record OR pending EFCC / ICPC case",
        "WAEC/NECO certificate authenticity dispute",
        "Funding from sponsor outside Nigeria / immediate family",
        "Family member with prior Canadian / US asylum claim from Nigeria",
        "Past Ghana / South Africa / UAE / UK travel with overstay flag",
        "Bringing 18+ dependent",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // EGYPTIAN → US — study
  // ════════════════════════════════════════════════════════════════════

  "EG:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from SEVP-certified US school + SEVIS I-901 paid",
        why: "Egypt sends ~7,000 students to the US annually. Your US institution issues Form I-20 (F-1) or DS-2019 (J-1) once admitted. Pay SEVIS I-901 fee ($350 F-1 / $220 J-1) before booking DS-160. Apply at US Embassy Cairo (5 Tawfik Diab Street) — single consulate handles all of Egypt.",
      },
      {
        label: "Source-of-funds + Egyptian banking + 214(b) ties",
        why: "Show 1st-year tuition + living costs ($40-80k). Document Egyptian bank statements (CIB Commercial International Bank, NBE National Bank of Egypt, Banque Misr, QNB Al Ahli, AAIB) with USD-equivalent at CBE rate. Strong 214(b) ties: family home with rasid (title deed) in parents' name, Egyptian property, expected return job, family business succession.",
      },
      {
        label: "Egyptian transcripts apostilled (Egypt joined Hague Convention 2024)",
        why: "Egypt joined Hague Apostille Convention in 2024 — simplified document legalisation. Egyptian Thanawiya Amma + university transcripts need: 1) issuing institution + Egyptian MOE for graduate level, 2) Apostille via Egyptian MFA (Tahrir Square). Replaces older multi-step legalisation chain.",
      },
      {
        label: "Egyptian Police Clearance + DS-160 disclosure",
        why: "Egyptian Police Clearance from Ministry of Interior or local police (EGP 100-500, 7-14 days). Disclose past detentions including 2013-2014 era political mass arrests if applicable.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this specific US programme over Egyptian alternatives",
        prompt: "Egypt has strong universities (Cairo, AUC American University in Cairo, Ain Shams, Alexandria, Helwan, Mansoura, MUST, AAST). Explain why US programme offers something unique.",
      },
      {
        heading: "Funding — Egyptian family / business / scholarship",
        prompt: "Document family contribution EGP X (with bank statement, NTN tax ID, business income tax returns). Egyptian scholarships: Fulbright Egypt, USEFP, Aga Khan Foundation, AmidEast.",
      },
      {
        heading: "Post-graduation plan — return to Egypt",
        prompt: "State which Egyptian sector: CIB, NBE, banking; Orange Egypt, Vodafone Egypt, Etisalat telecoms; Sawiris-owned Orascom; family business succession.",
      },
      {
        heading: "Family ties + Egyptian military service status (males 18-30)",
        prompt: "Egyptian compulsory military service for males 18-30. Document service status with kashf el-tagneed (military service certificate).",
      },
    ],
    moneySavingTips: [
      "F-1 visa fee $185; pay via CIB Egypt or Citibank Egypt with MRV barcode",
      "Apostille via Egyptian MFA (post-2024 Hague joining): EGP 200-500/document",
      "Don't pay 'visa consultancy' agencies EGP 5,000-50,000",
      "Fulbright Egypt (USEFP) — annual cycle, fully funded for grad students",
      "AmidEast EducationUSA Egypt offers free advising",
      "Use CIB, NBE, or QNB student remittance — competitive vs retail FX",
      "WAEC equivalent for Egypt: Thanawiya Amma certificate verification at MOE — free",
      "Avoid 'visa expediters' for any 221(g) administrative processing — they have no influence",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding",
        "Standard Fulbright Egypt / AmidEast scholarship application",
        "Renewal of existing F-1 at US Embassy Cairo",
        "OPT / STEM OPT during/after programme",
      ],
      getALawyer: [
        "Prior US visa refusal",
        "Egyptian criminal record (anti-terror Act, drugs, Muslim Brotherhood affiliation)",
        "STEM field with potential SAO sensitivity",
        "Family member in Egyptian military / Mukhabarat (intelligence) — additional security review",
        "Past US overstay",
        "Funding from sponsor outside Egypt / immediate family",
        "Past 2013-2014 era political arrest / detention",
        "Unresolved Egyptian military obligation (males 18-30)",
        "Coptic Christian Egyptian with religious persecution history (sensitive disclosure)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // CHINESE → JAPAN — work
  // ════════════════════════════════════════════════════════════════════

  "CN:JP:work": {
    whatCarriesWeight: [
      {
        label: "Engineer/Specialist + Highly Skilled Professional + Specified Skilled Worker routes",
        why: "China is Japan's largest expat group (~800,000 Chinese, ~25% of all foreign residents in Japan). Engineer/Specialist in Humanities/International Services (技術・人文知識・国際業務) for university-degree-holding Chinese. Highly Skilled Professional (高度専門職) for senior professionals scoring 70+ points (salary, age, education, JLPT level) — 70+ points = HSP-i (1-year fast-track to PR), 80+ = HSP-ii (immediate PR pathway). Tokutei Ginō (Specified Skilled Worker) less common for Chinese than Engineer/Specialist.",
      },
      {
        label: "Chinese educational credentials + Apostille (China joined Hague Convention Nov 2023)",
        why: "China joined Hague Apostille Convention November 2023 — replaced older multi-step legalisation. Chinese 学位证书 + 毕业证书 + 成绩单 need Apostille via Chinese MFA — RMB 50-200/document. Japanese employers accept apostilled Chinese degrees from 985/211 Project universities directly (auto-verified). Tsinghua, Peking, Fudan, Zhejiang, SJTU degrees especially well-recognised.",
      },
      {
        label: "Japanese language requirement varies by visa category",
        why: "Engineer/Specialist visa: officially no language requirement; practically JLPT N3+ needed for most roles. Highly Skilled Professional: language adds points (N1 = 15 pts, N2 = 10 pts). Tokutei Ginō i: JLPT N4 + industry skills test. Chinese applicants benefit from kanji familiarity — JLPT progression often faster than for non-CJK applicants.",
      },
      {
        label: "Chinese-Japanese cultural integration + Tokyo / Osaka / Yokohama concentrations",
        why: "Chinese community in Japan concentrated in Tokyo (Ikebukuro 'New Chinatown', Shinjuku), Yokohama (historic Chinatown), Osaka, Kobe (historic Chinatown), Nagoya. Japan permits dual nationality only until age 22 (Article 14 Nationality Act); enforcement is lax but state your awareness if planning long-term. Chinese-Japanese historical sensitivities exist but rarely affect work visa issuance.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your route — Engineer/Specialist, HSP, or Tokutei Ginō",
        prompt: "State explicit visa category. Engineer/Specialist (degree-required, family allowed from start, path to PR after 5 years), Highly Skilled Professional (70+ points fast-track to PR in 3 years, 80+ points 1 year), Tokutei Ginō i (JLPT N4 + skills test, 5-year initial, family not generally allowed during i), or Special Highly Skilled Professional (J-SKIP visa for elite researchers post-2023).",
      },
      {
        heading: "Your Chinese work history + JLPT progression",
        prompt: "List every Chinese employer with month-precision dates, role, salary in RMB, supervisor + WeChat/email. Include 身份证号, 社保, 公积金 numbers. Document JLPT progression: enrolment, level achieved, exam date.",
      },
      {
        heading: "Long-term plan — HSP fast-track PR, return to China, or settlement",
        prompt: "HSP-i: 3-year fast-track to PR; HSP-ii: 1-year fast-track. Standard Engineer/Specialist: 5-year PR pathway. Many Chinese in Japan pursue PR + retain Chinese citizenship (Japan allows dual until 22 but Chinese law forbids dual after 18; practical resolution is informal).",
      },
      {
        heading: "Family + Chinese school options in Japan",
        prompt: "Engineer/Specialist allows family from start. HSP allows family + parental sponsorship + housekeeper. Chinese schools in Japan: Tokyo Chinese School, Yokohama Chinese School, Osaka Chinese Academy — follow Chinese curriculum + Japanese supplement.",
      },
    ],
    moneySavingTips: [
      "Engineer/Specialist visa fee JPY 4,000 (single-entry) / JPY 6,000 (multiple) at Japanese consulate in China — paid in RMB at consulate bank counter",
      "Apostille via Chinese MFA (post-November 2023 Hague joining): RMB 50-200/document, 5-7 days",
      "JLPT registration in China: RMB 350-450 at certified centres",
      "Don't pay 'Japan migration consultancies' RMB 30,000-200,000",
      "Open MUFG, SMBC, Mizuho, or Japan Post Bank on arrival with Residence Card",
      "Use AliPay International, WeChat Pay, Wise CNY/JPY, or BoC International for remittance",
      "Apply for Chinese Tax Residency Certificate if Japan-resident >183 days/year",
      "Highly Skilled Professional points calculator (Japan Immigration Bureau website) — optimise before applying",
      "Chinese Embassy Tokyo + Consulates (Osaka, Nagoya, Fukuoka, Niigata, Sapporo) offer free notarisation",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Engineer/Specialist visa with cooperating Japanese employer",
        "Highly Skilled Professional application with documented points",
        "Tokutei Ginō i application via licensed sending organisation + Japanese receiving organisation",
        "Status of Residence renewal at regional Immigration Bureau",
        "Path to Permanent Residence via HSP fast-track",
      ],
      getALawyer: [
        "Past Japan deportation or overstay",
        "Chinese criminal record (drugs, corruption — 反贪 anti-corruption case)",
        "Past Tokutei Ginō / TITP escape or labour dispute",
        "Bringing same-sex partner — China doesn't recognise same-sex marriage; Japan doesn't recognise federally; no derivative visa path",
        "Past Taiwan / Hong Kong / Macau passport switching",
        "Complex degree-role mismatch for Engineer/Specialist",
        "Past Japanese asylum-related family member case",
        "Family member with Tibetan / Uyghur / Falun Gong / Hong Kong pro-democracy connection",
        "Past Saudi / UAE / European work history with disputes",
        "Pregnancy during Tokutei Ginō contract",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRITISH → SPAIN — family (retirement)
  // ════════════════════════════════════════════════════════════════════

  "GB:ES:family": {
    whatCarriesWeight: [
      {
        label: "Non-Lucrative Visa (Visado de No Lucrativo) — popular retirement route for Brits post-Brexit",
        why: "Post-Brexit (January 2021), British citizens no longer have EU freedom of movement to Spain. Non-Lucrative Visa is the primary retirement route — for those with passive income (pension, investments, savings) >€28,800/year per applicant + €7,200/year per dependent (~€36,000 total for couple in 2024). Renewable every 2 years. Cannot work in Spain. After 5 years, can apply for permanent residence (Permiso de Residencia de Larga Duración).",
      },
      {
        label: "Digital Nomad Visa (Visado Nómada Digital) — for remote-working Brits",
        why: "Launched January 2023, Spanish Digital Nomad Visa allows remote workers earning >€33,600/year (2024 minimum, 200% of Spanish minimum wage) to live in Spain while working remotely for non-Spanish employers / clients. 12-month initial visa renewable for 5 years total, with 3-year resident card option. Special tax regime (Beckham Law-equivalent) — 24% flat tax on first €600,000 income for 5 years.",
      },
      {
        label: "Golden Visa alternative — restricted from April 2025",
        why: "Spanish Golden Visa (Visado de Residencia para Inversores) was restricted from April 2025 — real estate investment (€500,000) route abolished; only €1M Spanish company investment, €2M government bonds, or €1M Spanish business creating jobs remains. For wealthy British retirees, Non-Lucrative or Digital Nomad routes now preferred.",
      },
      {
        label: "Padron + NIE + Empadronamiento — practical settlement requirements",
        why: "Upon arrival, register at local Padrón (municipal census) — required for everything from NIE (Número de Identidad de Extranjero — foreigner ID) to opening Spanish bank account to driving licence exchange. Empadronamiento certificate from your Spanish Ayuntamiento (town hall) is essential. NIE is your tax + administrative number; obtain from Oficina de Extranjería or Spanish Embassy/Consulate before arrival.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Your visa route — Non-Lucrative, Digital Nomad, or other",
        prompt: "State explicit visa category: Non-Lucrative (passive income >€28,800/year, no work in Spain), Digital Nomad (remote work for non-Spanish employer >€33,600/year), Family Reunification (spouse / child / parent of Spanish-resident British), Golden Visa (post-April 2025 restricted to €1M+ investment routes).",
      },
      {
        heading: "Financial requirements + income source documentation",
        prompt: "Document income: UK State Pension + private pension + investment income + savings. UK pension recipients benefit from UK-Spain Social Security Agreement (1974) — UK pension paid in Spain with UK uprating (post-Brexit retained). Spanish residency tax considerations: tax-resident if >183 days/year in Spain; UK-Spain Double Taxation Convention (2013) prevents double-tax.",
      },
      {
        heading: "Housing + integration plan",
        prompt: "Document Spanish rental contract or property purchase deed (escritura de compraventa). British retirees concentrate in Costa del Sol (Marbella, Estepona, Fuengirola), Costa Blanca (Alicante, Benidorm), Mallorca, Tenerife. Spanish language plan via Cervantes Institute or local academies. Healthcare: private (Sanitas, ASISA, DKV, Asisa, Adeslas) or convenio especial with INSS Spanish public system.",
      },
      {
        heading: "Family + long-term plan — Spanish residency, retain UK citizenship",
        prompt: "Spain permits dual citizenship with Latin American + Sephardic + Filipino + Portuguese; UK citizens must renounce UK citizenship if naturalising Spanish. Most British retirees retain UK citizenship and accept permanent Spanish residency. Family reunification: spouse + dependent children + dependent parents all eligible.",
      },
    ],
    moneySavingTips: [
      "Non-Lucrative Visa fee EUR 60 + Spanish-side card fee EUR 16-22 — apply at Spanish Consulate London / Edinburgh / Manchester",
      "Digital Nomad Visa fee EUR 73-80 + card fee — apply via Spanish Embassy London",
      "Don't pay 'Spanish retirement consultancies' GBP 3,000-10,000 for what is straightforward consular application",
      "UK State Pension upgrading in Spain post-Brexit: confirmed via 2020 UK-Spain bilateral agreement — pension increases annually like in UK",
      "Spanish Empadronamiento at Ayuntamiento: FREE — required for everything",
      "NIE at Spanish Police Office or Oficina de Extranjería: EUR 9.84 — don't pay agents EUR 200+",
      "Spanish-side private healthcare insurance (Sanitas, ASISA, DKV, Adeslas) for visa application: EUR 600-1,500/year per person — significantly cheaper than UK private medical",
      "Convenio Especial with INSS for Spanish public healthcare after 1 year residence: EUR 60-160/month per person — alternative to private",
      "Use Wise GBP/EUR, Revolut, HSBC Expat for currency transfers and ongoing income",
      "Spanish Embassy London / Edinburgh / Manchester consulates process Non-Lucrative + Digital Nomad applications — typically 1-3 months",
    ],
    lawyerTriggers: {
      diy: [
        "Standard Non-Lucrative Visa with documented passive income",
        "Standard Digital Nomad Visa with remote work contract evidence",
        "Family reunification application via Spanish-resident sponsor",
        "Permanent residence application after 5 years legal residence",
        "Annual visa renewal in Spain",
      ],
      getALawyer: [
        "Post-April 2025 Golden Visa with €1M+ investment route",
        "Tax residency split (UK vs Spain >183-day test)",
        "Spanish citizenship application (rare for British given dual-citizenship requirement)",
        "UK criminal record affecting Spanish residency",
        "Complex pension portability scenarios",
        "Spanish property purchase / inheritance affecting visa status",
        "Past Schengen entry ban or Spanish overstay",
        "Family reunification of non-British spouse / step-children",
        "Spanish Golden Visa under previous (pre-April 2025) real estate route — vested rights questions",
        "Pre-Brexit Spanish residency (TIE / Tarjeta de Identidad de Extranjero) — different track under Withdrawal Agreement",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // KENYAN → US — study
  // ════════════════════════════════════════════════════════════════════

  "KE:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from SEVP-certified US school + SEVIS I-901 paid",
        why: "Kenya sends ~4,000 students to the US annually. Apply at US Embassy Nairobi (United Nations Avenue, Gigiri) — single consulate handles all of Kenya.",
      },
      {
        label: "Source-of-funds + Kenyan banking",
        why: "Document Kenyan bank statements (Equity Bank, KCB, Standard Chartered Kenya, NCBA, Cooperative Bank). Family business sponsorship needs Certificate of Incorporation, KRA Pin, audited accounts.",
      },
      {
        label: "Kenyan transcripts + KNEC verification + ECCTIS",
        why: "KCSE certificate verification via KNEC portal. Bachelor's degrees apostilled via Kenyan MOFA. Kenya joined Hague Apostille Convention January 2024 — simplified legalisation.",
      },
      {
        label: "Kenyan Police Clearance + DS-160 disclosure",
        why: "DCI (Directorate of Criminal Investigations) Certificate of Good Conduct via eCitizen.go.ke (KES 1,050, 7-14 days).",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this US programme over Kenyan or African alternatives",
        prompt: "Kenya has strong universities (UoN, Strathmore, USIU, KCA, JKUAT, Kenyatta, Maseno). Explain why US programme.",
      },
      {
        heading: "Funding — Kenyan family / scholarship",
        prompt: "Family contribution KES X with bank statements + KRA Pin. Scholarships: Fulbright Kenya, USAID-funded scholarships, MasterCard Foundation Scholars (Berkeley, Stanford, Michigan etc.).",
      },
      {
        heading: "Post-graduation plan — return to Kenya",
        prompt: "Kenyan banking sector (KCB, Equity, NCBA, Co-op), telecoms (Safaricom, Airtel), tech (Sendy, Kopo Kopo, Twiga, M-Kopa), MNCs (Coca-Cola Africa, Standard Chartered Africa).",
      },
      {
        heading: "Family ties + Kenyan context",
        prompt: "Document Kenyan property with title deed, parents' employment, family in Kenya, expected return job.",
      },
    ],
    moneySavingTips: [
      "F-1 visa fee $185 at US Embassy Nairobi",
      "MasterCard Foundation Scholars Program — full ride for African students at named partner US universities",
      "Fulbright Kenya (USEFK) — annual cycle, fully funded for grad students",
      "EducationUSA Kenya offers free advising at US Embassy Nairobi",
      "DCI Certificate of Good Conduct: KES 1,050 via eCitizen — don't pay agents",
      "Apostille via Kenyan MFA (post-2024 Hague joining): KES 1,000-3,000/document",
      "Use Equity Bank, KCB, or NCBA student remittance — competitive vs retail FX",
      "Don't pay 'visa agents' KES 30,000-500,000",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding",
        "Standard Fulbright Kenya / MasterCard Foundation scholarship application",
        "Renewal of existing F-1 at US Embassy Nairobi",
        "OPT / STEM OPT during/after programme",
      ],
      getALawyer: [
        "Prior US visa refusal",
        "Kenyan criminal record (anti-terror Act, drug, fraud)",
        "Family member with prior US asylum claim",
        "Past US overstay",
        "Funding from sponsor outside Kenya / immediate family",
        "STEM field with potential SAO sensitivity",
        "Past Gulf state work history with disputes",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AUSTRALIAN → US — study
  // ════════════════════════════════════════════════════════════════════

  "AU:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from SEVP-certified US school + SEVIS I-901 paid",
        why: "Australia sends ~13,000 students to the US annually. Apply at US Embassy Canberra (Moonah Place, Yarralumla) or US Consulate Sydney (MLC Centre, 19-29 Martin Place), Melbourne (553 St Kilda Road), Perth (16 St Georges Terrace).",
      },
      {
        label: "Strong source-of-funds + Australian banking efficiency",
        why: "Document Australian bank statements (CommBank, ANZ, NAB, Westpac, Macquarie). Australia historically has one of the lowest F-1 refusal rates globally (~3-5%).",
      },
      {
        label: "Australian academic transcripts + Apostille (Australia is Hague signatory since 1995)",
        why: "Apostille via Australian DFAT (Department of Foreign Affairs and Trade) — cost AUD$98/document, 1-7 days at DFAT Sydney/Melbourne/Brisbane/Adelaide/Perth/Canberra. WES, ECE, or AICE credential evaluation for some US universities.",
      },
      {
        label: "Australian no compulsory military service — simpler than many origins",
        why: "Australia has no compulsory military service. ADF (Australian Defence Force) is voluntary. Simpler than Korean, Taiwanese, Iranian, Egyptian, Singaporean origins which require military service status documentation.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this US programme over Group of Eight Australian universities",
        prompt: "Australia has elite universities (Group of Eight = Melbourne, ANU, Sydney, UNSW, Monash, UQ, UWA, Adelaide). Explain why US programme offers something unique.",
      },
      {
        heading: "Funding — Australian family / scholarship",
        prompt: "Document family contribution AUD X (with bank statement). Australian scholarships: Fulbright Australia, Endeavour Leadership Program, Tuckwell Scholarship (ANU), Westpac Asian Exchange Scholarship.",
      },
      {
        heading: "Post-graduation plan — return to Australia",
        prompt: "Australian banking (CommBank, ANZ, NAB, Westpac, Macquarie), mining (BHP, Rio Tinto, Fortescue), tech (Atlassian, Canva, Afterpay/Block, Wisetech), finance (Macquarie Group), family business succession.",
      },
      {
        heading: "Family ties + future plan",
        prompt: "Document Australian property, parents' employment, expected return job, Australian bank accounts.",
      },
    ],
    moneySavingTips: [
      "F-1 visa fee $185; pay via Citibank Australia or major Australian bank with MRV barcode — no reciprocity fee",
      "Apostille via Australian DFAT: AUD$98/document, 1-7 days",
      "Australian applicants eligible for Fulbright Australia (~$30k + tuition), Endeavour Leadership Program, Westpac Asian Exchange",
      "EducationUSA Australia (administered through Fulbright Commission Australia) offers free advising",
      "Use Wise USD/AUD, Western Union, or CommBank International for tuition transfers",
      "Don't pay 'visa consultancy' agencies AUD 1,000-5,000 — straightforward consular process",
      "Australian Embassy DC + Consulates (LA, NYC, SF, Chicago, Honolulu, Houston) offer free notarisation for Australian citizens",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record",
        "Standard Fulbright Australia / Endeavour scholarship application",
        "Renewal of F-1 at US Embassy/Consulate during home leave",
        "OPT / STEM OPT during/after programme",
        "Future transition F-1 → H-1B / O-1 / E-3 (Australia's unique E-3 visa is a major advantage)",
      ],
      getALawyer: [
        "Prior US visa refusal",
        "Australian criminal record (even spent convictions)",
        "Past US overstay or visa flag",
        "STEM field with SAO sensitivity",
        "Same-sex partner accompanying — Australia recognised same-sex marriage 2017; US recognises; derivative visas straightforward",
        "Funding from sponsor outside Australia / immediate family",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // INDONESIAN → US — study
  // ════════════════════════════════════════════════════════════════════

  "ID:US:study": {
    whatCarriesWeight: [
      {
        label: "I-20 from SEVP-certified US school + SEVIS I-901 paid",
        why: "Indonesia sends ~9,000 students to the US annually. Apply at US Embassy Jakarta (Jl. Medan Merdeka Selatan) or US Consulate General Surabaya (Jl. Citra Raya Niaga).",
      },
      {
        label: "Source-of-funds + Indonesian banking + 214(b) ties",
        why: "Document Indonesian bank statements (BCA, Mandiri, BNI, BRI, CIMB Niaga, Permata). Strong 214(b) ties: family home with sertifikat hak milik, parents' employment, Indonesian property.",
      },
      {
        label: "Indonesian transcripts + Apostille (Indonesia joined Hague Convention 2022)",
        why: "Indonesian SMA/SMK diploma + university degrees apostilled via Kemenkumham — Indonesia is Hague signatory since June 2022. Cost IDR 50,000-150,000/document, 3-5 days.",
      },
      {
        label: "Indonesian Police Clearance + DS-160 disclosure",
        why: "SKCK (Surat Keterangan Catatan Kepolisian) from local Polsek/Polres/Polda — IDR 30,000, 7-14 days.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "Why this US programme over Indonesian alternatives",
        prompt: "Indonesia has strong universities (UI Universitas Indonesia, UGM Gadjah Mada, ITB Bandung Institute of Technology, ITS Surabaya, UNAIR Airlangga, BINUS, UPH). Explain why US programme.",
      },
      {
        heading: "Funding — Indonesian family / LPDP / business",
        prompt: "Family contribution IDR X (with bank statement, family business 营业执照 SIUP/TDP/NIB if business-owner). LPDP (Lembaga Pengelola Dana Pendidikan) — premier Indonesian government scholarship for grad students.",
      },
      {
        heading: "Post-graduation plan — return to Indonesia",
        prompt: "Indonesian banking (BCA, Mandiri, BNI, BRI), telecoms (Telkomsel, Indosat, XL), tech (Gojek, Tokopedia, Bukalapak, Traveloka), pharma (Kalbe Farma), or family business.",
      },
      {
        heading: "Family ties + Indonesian context",
        prompt: "Document Indonesian property, parents' employment, Indonesian bank accounts. Mention Indonesian school year (July-June).",
      },
    ],
    moneySavingTips: [
      "F-1 visa fee $185; pay via BCA or Bank Mandiri with MRV barcode",
      "Apostille via Kemenkumham (post-2022 Hague joining): IDR 50,000-150,000/document",
      "LPDP scholarship: fully funded by Indonesian government for grad students — applications typically open February-September; cover tuition + living + return flights + visa fees",
      "Fulbright Indonesia (AMINEF — American Indonesian Exchange Foundation) — annual cycle, fully funded for grad students",
      "EducationUSA Indonesia offers free advising at US Embassy Jakarta",
      "SKCK: IDR 30,000 at local Polsek — don't pay calo (touts) IDR 200,000+",
      "Use BCA, Mandiri, or BNI student remittance for tuition — competitive vs retail",
      "Don't pay 'visa consultancy' agencies IDR 5,000,000-50,000,000",
    ],
    lawyerTriggers: {
      diy: [
        "First-time F-1 / J-1 with clean record, clear funding via LPDP / family",
        "Standard Fulbright Indonesia / LPDP scholarship application",
        "Renewal of F-1 at US Embassy Jakarta / Consulate Surabaya",
        "OPT / STEM OPT during/after programme",
      ],
      getALawyer: [
        "Prior US visa refusal",
        "Indonesian criminal record (UU Narkotika narcotics, terrorism-related — Indonesia rigorously checks)",
        "Family member with prior US asylum claim",
        "Past US overstay",
        "Funding from sponsor outside Indonesia / immediate family",
        "STEM field with SAO sensitivity",
        "Indonesian-Chinese (Tionghoa) ethnic affiliation history (rare but historically sensitive)",
        "Past Indonesian military / TNI / Densus 88 background",
        "Indonesian Christian / Buddhist / Hindu / Confucian religious affiliation with persecution claims",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRITISH → AUSTRALIA — family / partner
  // ════════════════════════════════════════════════════════════════════

  "GB:AU:family": {
    whatCarriesWeight: [
      {
        label: "Subclass 309 (offshore) or 820 (onshore) — choose the right one",
        why: "If you're applying from outside Australia, lodge Subclass 309 (Partner provisional) which leads to Subclass 100 (permanent) after ~2 years. If you're already onshore on another valid visa (visitor / WHV / student), lodge Subclass 820 which leads to 820 (permanent). Both cost the same AUD$9,365 (Jul 2024–25) for the primary applicant and both have the same evidence requirements. Default is offshore — get this wrong and you re-pay the fee.",
      },
      {
        label: "12-month relationship test — cohabitation, registered relationship, OR marriage",
        why: "Australia requires either (a) marriage, (b) registered relationship (state register: NSW BDM, VIC BDM etc.) at the time of application, OR (c) 12 months of cohabitation immediately before lodging. Long-distance dating doesn't count toward the 12 months even with constant visits. Easiest workaround for shorter-relationship couples: register the relationship at a state Births Deaths Marriages office FIRST (instant), then lodge the partner visa. NSW registration costs AUD$57.",
      },
      {
        label: "Genuine and mutual commitment evidence across four dimensions",
        why: "DHA explicitly assesses: (1) Financial — joint accounts / joint bills / financial pooling; (2) Household — joint tenancy / mortgage / utilities; (3) Social — photos with both families, evidence other people regard you as a couple, joint travel; (4) Nature of commitment — statements from both partners describing the relationship, plans for the future, knowledge of each other's families / history. Form 47SP (applicant) + Form 40SP (sponsor) are the binding declarations.",
      },
      {
        label: "Two Statutory Declarations of Support from Australian citizens / PRs (Form 888)",
        why: "Two Form 888 statutory declarations from friends or family who are Australian citizens or permanent residents, attesting to the genuineness of the relationship. They MUST be Australian — a UK friend can't sign Form 888. Need to be witnessed by a JP / pharmacist / postal manager / police officer in Australia.",
      },
      {
        label: "Police checks from every country lived in 12+ months since age 16",
        why: "UK ACRO Police Certificate (£55 standard, £95 premium 2-day). AFP National Police Check (AUD$43) for any cumulative 12 months living in Australia. Plus equivalent certificates from EVERY country you lived in 12+ months — this is the single most-delayed step. ACRO Premium turnaround is 2 working days; mail-in is 10 working days; start on day one.",
      },
      {
        label: "Health exam — Bupa Medical Visa Services or designated panel physician",
        why: "Compulsory immigration medical with Bupa Medical Visa Services UK (~£300–500 depending on London / Manchester / Glasgow centre) OR a designated overseas panel physician. Includes chest X-ray + medical exam + HIV test (if 15+). HAP ID generated after lodgement triggers the booking. Allow 4–6 weeks from request to receipt.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "1. How we met — date, place, context",
        prompt: "Specific date and place. 'In March 2022, we met through a mutual friend at her birthday in London' beats 'we met through friends a few years ago.' If you met on an app (Hinge / Bumble), say so — DHA doesn't penalise online introductions.",
      },
      {
        heading: "2. Development of the relationship — dated timeline",
        prompt: "First few dates: when, where, what you did. First time meeting each other's families: date, who attended. First long trip together. Moving from 'dating' to 'in a relationship' moment. Annotate every milestone with a specific month + year.",
      },
      {
        heading: "3. Cohabitation — start date, address, joint arrangements",
        prompt: "When did you move in together? What's the address? Whose name is on the tenancy? What bills are joint? Cover any periods apart (visa runs, work trips) and explain how you maintained the relationship. Australia's 12-month rule is interrupted by separations of more than 8 weeks — be honest and explain.",
      },
      {
        heading: "4. Registered relationship OR marriage milestone (if applicable)",
        prompt: "If registered: state register, date, certificate number. If married: date, place, who attended, why you picked that venue. If neither: explain why you're using the 12-month cohabitation route + provide cohabitation start date with corroborating tenancy / utility evidence.",
      },
      {
        heading: "5. Why Australia — concrete future plans",
        prompt: "Job offer? Family in Australia? Existing residency right (citizenship by descent, PR sponsor)? Where will you live? What will you do? Vague 'we want to build our life there' is weaker than 'sponsor's parents are in Brisbane, sponsor returning to her existing accounting role at PwC Brisbane, we've signed a 12-month lease at [address].'",
      },
      {
        heading: "6. Long-term commitment — using DHA's own language",
        prompt: "Close with a line on intent to live together in Australia permanently, share finances, raise a family (if applicable), contribute to Australian life. Use DHA's exact phrase: 'mutual commitment to a shared life together to the exclusion of all others, on a genuine and continuing basis.' Lifting this verbatim shows you've read the rules.",
      },
    ],
    moneySavingTips: [
      "Total partner-visa fee AUD$9,365 (Jul 2024–25) primary + AUD$4,690 each adult dependent. NO discount for combined applications — but you only pay it ONCE because Subclass 100 / 801 (permanent stage) is included.",
      "Use ACRO Premium (£95, 2 days) instead of standard (£55, 10 days) — every week of police-check delay risks losing your medical / form 888 freshness.",
      "Bupa Medical Visa Services UK London (Holborn) tends to have the shortest wait — book the moment your HAP ID is issued.",
      "Don't pay a migration agent AUD$5,000–10,000 for a partner visa application that fits the standard template. DHA's MyImmiAccount + checklist is well-designed for self-filers.",
      "Sponsor's evidence (Form 40SP, payslips, Australian birth certificate or citizenship cert, photo ID) must be CERTIFIED COPIES — Justice of the Peace certifications are free in Australia at most council offices.",
      "Bridging Visa A is automatic onshore: lodge Subclass 820 while on valid visa → BVA kicks in when current visa expires. You can work and stay until decision (~12-30 months).",
      "If sponsor is Australian citizen by descent born in UK, request UK certificate of registration via UK Embassy Canberra to support evidence of identity.",
      "Joint travel evidence: keep boarding passes, hotel bookings in BOTH names, photos with dates / locations EXIF data intact.",
    ],
    lawyerTriggers: {
      diy: [
        "Clean cohabitation history with documented joint tenancy + utilities for 12+ months",
        "Married couples with marriage certificate + a few rich evidence categories",
        "Sponsor has clean financial record and is willing to commit time to Form 40SP",
        "No prior visa refusals or overstays on either side",
      ],
      getALawyer: [
        "Sponsor previously refused to sponsor another partner — DHA scrutiny escalates",
        "Either side has past visa refusal, deportation, or overstay anywhere in the world",
        "Criminal record on the applicant side — Australia's character test (Section 501 Migration Act) is strict",
        "Sponsor's income from complex sources (self-employment, overseas income, recent bankruptcy)",
        "Same-sex relationship where one partner has lived in countries where it was illegal — handle the police-certificate disclosure carefully",
        "Children from previous relationships — international custody / consent orders complicate",
        "Relationship under 12 months AND not registered AND not married — needs specialist framing as 'compelling circumstances'",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRITISH → USA — family / spouse (CR-1, IR-1, K-1)
  // ════════════════════════════════════════════════════════════════════

  "GB:US:family": {
    whatCarriesWeight: [
      {
        label: "CR-1 / IR-1 (spouse) vs K-1 (fiancé) — pick deliberately",
        why: "K-1 (fiancé) gets you to the US in ~12 months but requires marriage within 90 days of entry and a SEPARATE adjustment-of-status filing (~$1,225 extra) for a green card. CR-1 / IR-1 takes ~16-22 months but you arrive WITH a green card and full work + travel rights from day one. For most Brit-American couples already living together, CR-1/IR-1 is the right choice. K-1 makes sense only when sponsor and applicant truly haven't met long enough to marry.",
      },
      {
        label: "I-130 + I-864 — petition and Affidavit of Support",
        why: "US-citizen sponsor files Form I-130 (Petition for Alien Relative) — that establishes the qualifying relationship. Once approved by USCIS (~8-14 months in 2024), case transfers to National Visa Center. Then Form I-864 (Affidavit of Support) — sponsor commits to maintaining applicant at 125% of US Federal Poverty Guidelines ($25,550 for a household of 2 in 2024). If sponsor's income falls short, a joint sponsor (US citizen or LPR) can co-sign, OR a sponsor can use assets at 3x the income shortfall.",
      },
      {
        label: "Bona-fide marriage evidence — the unwritten 90% of the application",
        why: "USCIS is strict on marriage-of-convenience fraud. Document: joint financial accounts (Wise / Revolut / US joint checking), joint tenancy / mortgage, both names on utility bills, photos with both families over time, joint travel (UK <-> US visits documented), communication logs (WhatsApp / iMessage / FaceTime), affidavits from people who know you. CR-1/IR-1 distinction: if married 2+ years at petition approval → IR-1 (10-year unrestricted green card on arrival). Under 2 years → CR-1 (2-year conditional green card, requires Form I-751 Removal of Conditions filed 90 days before expiry).",
      },
      {
        label: "Medical exam at US Embassy London — designated panel physician",
        why: "US Embassy London (UK) lists designated panel physicians — Knightsbridge Doctors, Wimpole Street, Visa Medicals Manchester. Cost £200-£400 plus vaccinations as needed. Includes chest X-ray, blood draw (syphilis, gonorrhea), TB skin test (if applicable), MMR / TdaP / varicella / flu vaccinations to current US standards. Sealed envelope hand-carried to the visa interview (do not open).",
      },
      {
        label: "Police certificates — UK ACRO + every country lived 6+ months since age 16",
        why: "UK ACRO Police Certificate (£55 standard, £95 premium 2-day). PLUS certificates from every country you lived 6+ months as an adult (US lower threshold than AU). Start ACRO + foreign certificates immediately — they're the longest lead time. Issuance dates matter: certificates must be less than 6 months old at interview.",
      },
      {
        label: "DS-260 + interview at US Embassy London (Nine Elms)",
        why: "Once NVC has fees + civil documents + I-864, applicant completes DS-260 online and books visa interview. US Embassy London is at 33 Nine Elms Lane (moved from Grosvenor Square 2018). Interview scheduling backlog has been 6-12 weeks in 2024. Bring originals of every document + 2 passport photos (US specs, 2x2 inches white background) + sealed medical envelope + interview confirmation.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "1. How we met — when, where, context",
        prompt: "Specific date and place: 'In April 2021, we met at a friend's wedding in San Francisco.' Online intros (Hinge, Match, mutual followers on Instagram) are fine — USCIS doesn't penalise them but does want specifics.",
      },
      {
        heading: "2. Pre-marriage relationship — the dated timeline",
        prompt: "First date, first 'official' dating, first visit across the Atlantic, first time meeting each other's families. Annotate dates. If you had long-distance periods, document them with flight bookings + accommodation in both names + messaging logs (WhatsApp / iMessage shows volume + recency).",
      },
      {
        heading: "3. Engagement + wedding — date, place, attendees",
        prompt: "Date and location of proposal. Wedding date and venue — who attended, where they came from, photos. Reception details. If you had two ceremonies (UK + US), explain why. Marriage certificate is the legal anchor but the social context evidences bona fides.",
      },
      {
        heading: "4. Joint life since marriage — financial + household + legal",
        prompt: "When did you start sharing finances? Joint bank accounts (date opened, both names on statement). Joint tenancy / mortgage. Health insurance with both names. Phone plan with both names. Tax-filing strategy (UK side: probably file separately if non-resident in US; US sponsor will need to amend filing status to Married Filing Jointly if applicable). Demonstrate intermingling of lives.",
      },
      {
        heading: "5. Why move to the US — sponsor's situation + applicant's plans",
        prompt: "Sponsor's anchor in the US (family, job, property, citizenship). Where will you both live? Will applicant work — USCIS allows IR-1 / IR-1 spouses to work day one on the green card; CR-1 spouses also (no EAD needed). Concrete next-12-months plan: 'we'll move to [city] where sponsor has a job at [employer]; I'll continue my role at [UK employer] remotely until June then transition to a US-based role.'",
      },
      {
        heading: "6. Closing — using USCIS's own language",
        prompt: "USCIS uses 'bona fide marriage entered into in good faith and not solely for immigration purposes.' Echo that wording verbatim — it's not just a flourish, it's the legal standard you're meeting. Close with both of you committed to building a life together in the US.",
      },
    ],
    moneySavingTips: [
      "Total US-side fees: I-130 $675, USCIS-NVC fees $445 (immigrant visa + AOS), medical £200-400, interview no extra fee. Total ~$1,200 USD + medical. K-1 is similar but you ALSO pay ~$1,225 adjustment of status once married in US — so CR-1/IR-1 is cheaper overall.",
      "US Embassy London is the consulate for ALL UK-resident applicants — there's no Manchester / Edinburgh / Belfast visa consulate. Plan travel to London for the medical + interview.",
      "Don't pay an immigration lawyer the typical $1,500–3,000 retainer for a straightforward CR-1 — USCIS forms are detailed but follow the public instructions cleanly. Boundless.com (we list them in /services/legal-services) offers attorney-reviewed packages from $995 if you want that safety net for less.",
      "Use ACRO Premium (£95, 2 days) for the UK police certificate — standard (£55, 10 days) routinely delays interview scheduling.",
      "Get original (long-form) UK birth certificate, NOT short version. ~£11 from gov.uk's general register office.",
      "Use Wise / Revolut for joint USD-GBP transactions evidencing financial intermingling — both work as 'joint financial' evidence even if the underlying account is in one name.",
      "Submit Form I-130A (Supplemental Information for Spouse Beneficiary) — it's free but easy to forget. Missing I-130A delays processing by months.",
      "TB skin test ineligibility: if you've had BCG vaccination (most UK adults born pre-2005), request IGRA blood test from the panel physician instead. Sponsor physicians know this.",
    ],
    lawyerTriggers: {
      diy: [
        "Standard marriage-based CR-1 / IR-1 for UK applicants with clean criminal history",
        "Sponsor income comfortably above 125% FPG threshold",
        "Document trail from a multi-year relationship including pre-marriage cohabitation in UK or US",
        "K-1 for couples genuinely engaged but not yet married, with prior in-person meetings in last 2 years documented",
      ],
      getALawyer: [
        "Applicant has prior US visa overstay (any duration over 180 days triggers 3/10-year bars)",
        "Applicant has prior US visa refusal under INA 214(b), 221(g), or 212(a) inadmissibility",
        "Criminal record on the applicant side — drink-driving, drug possession, even minor public order, all need review",
        "Sponsor income below threshold AND no eligible joint sponsor available — assets-based path is workable but complex",
        "Prior marriage to a US citizen on either side — fraud-marriage assumptions kick in",
        "Sponsor is a recently naturalised US citizen (5 years or less) — establishing domicile in US for I-864 can be contested",
        "Marriage less than 12 months old at I-130 filing — Section 245(d) restrictions on K-1 entrants",
        "Either party has minor children from previous relationships — derivative beneficiaries + consent orders",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRITISH → CANADA — family / spousal sponsorship
  // ════════════════════════════════════════════════════════════════════

  "GB:CA:family": {
    whatCarriesWeight: [
      {
        label: "Inland (Family Class) vs Outland Spousal Sponsorship — different timelines",
        why: "Outland: spouse stays in UK during processing (~12-18 months), can travel freely, application via Mississauga Case Processing Centre. Inland: spouse already in Canada (visitor / IEC / study / work), gets implied status + can apply for an Open Work Permit while waiting. Outland is faster on average; Inland keeps the couple together during processing. NO income requirement for spousal sponsorship — unlike Parent / Grandparent Programme where MNI applies.",
      },
      {
        label: "Marriage OR common-law (12 months cohab) OR conjugal partnership",
        why: "Three qualifying relationships under IRPA: (a) marriage, legal under the law of the place where it occurred; (b) common-law — 12 continuous months of cohabitation in a marriage-like relationship; (c) conjugal partner — relationship existed for 12+ months and couple were UNABLE to live together due to legal / immigration / persecution barriers. Most UK-Canada couples qualify as married or common-law. Document cohabitation with joint tenancy, joint utilities, joint bank statements.",
      },
      {
        label: "Genuine relationship test — IRCC's specific evidence checklist",
        why: "IRCC explicitly wants: (1) photos showing the relationship over time — events, families, places; (2) communication logs evidencing volume + recency (WhatsApp, Messenger, FaceTime, Zoom); (3) joint travel — boarding passes in both names; (4) financial commingling — joint accounts, joint household bills, money transfers; (5) statements from family + friends attesting to the relationship. The IMM 5532 (Relationship Information and Sponsorship Evaluation) is the binding form.",
      },
      {
        label: "Police certificates — UK ACRO + every country lived 6+ months since age 18",
        why: "Canadian threshold is 6 months (lower than Australia's 12). UK ACRO Police Certificate (£55 standard, £95 premium). Plus equivalent for every country you've lived 6+ months as an adult. Issuance date must be less than 12 months before submission. Start ACRO Premium on day one.",
      },
      {
        label: "Medical exam — IRCC-designated panel physician (eMedical system)",
        why: "Compulsory immigration medical exam. UK panel physicians: Knightsbridge Doctors (London), Visa Medicals Manchester, IRCC-designated panel doctors across major cities (~£200-300). Includes chest X-ray, blood + urine, eye test, GP exam. Results uploaded to IRCC's eMedical system within ~5 business days of exam. Valid 12 months from exam date.",
      },
      {
        label: "Sponsor undertaking — 3-year financial commitment",
        why: "Canadian sponsor signs an IMM 1344 Undertaking committing to financially support the spouse for 3 years from PR landing. Sponsor must be Canadian citizen or PR aged 18+, not currently receiving social assistance (other than disability), not in default on a previous sponsorship undertaking, no recent criminal convictions for offences against family members. The 3-year commitment survives divorce.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "1. How we met — when, where, context",
        prompt: "Specific date and place. If you met online (Hinge, Bumble), state it; IRCC doesn't penalise app-based introductions but does want specifics. 'We met on Hinge in February 2022 and had our first in-person date in London on March 5, 2022' beats 'we met online a couple of years ago.'",
      },
      {
        heading: "2. Relationship development — the dated timeline",
        prompt: "First few dates → moving from 'dating' to 'in a relationship' → first family introductions → first long trip together. Date every major milestone. If you had long-distance periods (UK ↔ Canada), document them: flights both ways, accommodation, video-call logs.",
      },
      {
        heading: "3. Cohabitation OR marriage start point",
        prompt: "If common-law: cohabitation start date + address + joint tenancy / utilities (3+ proofs ideal). If married: marriage date, place, who attended. Cover gaps in cohabitation explicitly — IRCC accepts work trips / family emergencies but expects you to explain.",
      },
      {
        heading: "4. Sponsor's situation — anchor in Canada",
        prompt: "Sponsor's Canadian status (citizen or PR), province of residence, employment / income, family in Canada. Where will you both live? Sponsor's plans for next 12 months. If sponsor is currently outside Canada (allowed for citizens), how / when will they re-establish residence.",
      },
      {
        heading: "5. Why Canada — applicant's plans",
        prompt: "Why move to Canada specifically. Sponsor's family / job there? Applicant's career plan in Canada? Open Work Permit if applying inland — what work will you do? Concrete plans beat vague intent. 'Sponsor's family is in Vancouver; I'll continue freelance editorial work via Canadian Open Work Permit while we settle' is stronger than 'we want to live there.'",
      },
      {
        heading: "6. Long-term commitment — using IRCC's own language",
        prompt: "Close using IRCC's exact phrasing: 'genuine relationship... entered into in good faith and not primarily for the purpose of acquiring permanent resident status.' This is the legal test for genuineness in IRPA Section 4 — quote it verbatim.",
      },
    ],
    moneySavingTips: [
      "Total IRCC fees: $570 sponsorship + $570 PR fee + $635 Right of PR Fee = $1,775 CAD per principal applicant ($1,205 if no kids). Substantially cheaper than US or Australian equivalents.",
      "Use ACRO Premium (£95, 2 days) for UK police certificate.",
      "Don't pay an immigration consultant $3,000-5,000 CAD for a straightforward spousal sponsorship. IRCC's checklist is well-documented for self-filers.",
      "Common-law couples: a Statutory Declaration of Common-Law Union (IMM 5409) signed before a Commissioner of Oaths replaces the marriage certificate; £20 at a UK solicitor.",
      "Use Wise / Revolut for GBP↔CAD joint transactions, evidencing financial commingling.",
      "PR landing fee ($635 ROPRF) can be paid AFTER decision but BEFORE landing — easier cashflow timing.",
      "Bring originals of every civil document (birth certificates, marriage certificate, divorce decrees if applicable) plus 2 sets of certified copies — IRCC may keep originals or return them.",
      "After PR landing: spouse becomes eligible for Open Work Permit immediately + Provincial Health Insurance (BC, Ontario etc. have 3-month wait); ALL FREE — don't pay a relocation consultant for 'PR setup services.'",
    ],
    lawyerTriggers: {
      diy: [
        "Standard common-law or marriage-based spousal sponsorship with clean records on both sides",
        "Couples with documented cohabitation + joint finances + family knowledge",
        "Sponsor is a long-established Canadian citizen or PR (~5+ years) currently resident in Canada",
        "No prior IRCC refusals or visa overstays",
      ],
      getALawyer: [
        "Sponsor previously refused to sponsor another partner — IRCC scrutiny escalates",
        "Sponsor has unpaid social-assistance debt or in default on a previous undertaking",
        "Either side has a Canadian or other-country visa refusal in their immigration history",
        "Criminal record on the applicant side — Canadian inadmissibility for criminality requires Rehabilitation application (separate, 5-year wait for individual rehab)",
        "Sponsor is a recent grant of Canadian citizenship (sponsor must intend to reside in Canada at the time of landing — easy for citizens, complex for naturalised newcomers)",
        "Conjugal partner application — IRCC's bar for 'unable to cohabit' is high and case-by-case",
        "Same-sex couple where one party lived where same-sex unions weren't recognised — complex documentation of prior cohabitation",
        "Dependent children from previous relationships — derivative inadmissibility, custody orders",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AMERICAN → UK — family / spouse
  // ════════════════════════════════════════════════════════════════════

  "US:GB:family": {
    whatCarriesWeight: [
      {
        label: "Spouse / Civil Partner / Unmarried Partner route — choose the right one",
        why: "UK Spouse visa requires marriage or civil partnership. Unmarried Partner visa requires 2 YEARS of continuous cohabitation prior to application — the bar is high and well-documented. Fiancé(e) visa is a 6-month visit-only visa with no work rights that requires marriage in UK within the 6 months, then SWITCH to Spouse visa from inside UK. Most American-British couples either marry first (US or UK ceremony fine) then apply for Spouse, OR cohabit 2+ years then apply for Unmarried Partner.",
      },
      {
        label: "Minimum Income Requirement — £29,000 (raised April 2024)",
        why: "The UK sponsor must earn £29,000+/year in gross income from employment for the 6 months immediately before application. Self-employment income works (P60 + SA302 + business accounts for the last full UK tax year). Savings can substitute at £88,500 held for 6 months. From January 2025 the threshold rises to £38,700 (matching Skilled Worker minimum) under Conservative plans, though Labour may revise. Cash savings + income can be combined for any shortfall.",
      },
      {
        label: "Genuine and subsisting relationship + intent to live together permanently",
        why: "The phrase 'genuine and subsisting' is from Appendix FM Rule E-LTRP.1.7 — quote it in your statement. Document: marriage certificate / civil partnership certificate / 2+ years cohabitation evidence (joint tenancy, utilities, both names on bank statements, council tax). Cohabitation evidence must SPAN the 2-year period with 6+ different proof points across that span.",
      },
      {
        label: "Adequate accommodation in the UK without recourse to public funds",
        why: "Sponsor must show suitable UK accommodation: own property (Land Registry title), or tenancy agreement signed (or being signed shortly) for a property where you'll live together. Spouse cannot access most public funds (Universal Credit, Housing Benefit, child tax credit) for the duration of the 5-year route to ILR. UK Council Tax + utilities must demonstrate the sponsor's existing UK address.",
      },
      {
        label: "English language requirement — A1 CEFR initially, A2 at extension",
        why: "Initial Spouse visa requires English at CEFR A1 level — IELTS Life Skills A1, Trinity GESE Grade 2, or Pearson PTE Home A1. US citizens are EXEMPT from the language test as English is one of the recognised national languages of the US. But you should not assume the exemption — list 'United States' as country of birth on the form to trigger the automatic English-language exemption.",
      },
      {
        label: "TB test — US citizens are EXEMPT (US not on UK TB-test country list)",
        why: "Unlike applicants from TB-prevalent countries, US citizens applying from the US for a UK Spouse visa are exempt from the TB test requirement. This saves $80–250 and 1-2 weeks. Confirm on the gov.uk TB-test country list before booking anyway.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "1. How we met — when, where, context",
        prompt: "Specific date and place. App, mutual friends, work, study abroad — all fine. 'We met at a conference in Boston in October 2021' is better than 'we met through work.'",
      },
      {
        heading: "2. Pre-marriage relationship — dated milestones",
        prompt: "First date, first 'official' couple status, first time meeting each other's families, first trip across the Atlantic. UK Home Office wants a TIMELINE. Document long-distance periods with flight records + accommodation in both names + messaging logs.",
      },
      {
        heading: "3. Marriage / civil partnership OR cohabitation start",
        prompt: "If married: date, place, attendees, why you chose that venue. UK civil partnerships are recognised. If using Unmarried Partner route: cohabitation start date (precise), address, both-names tenancy or mortgage, joint utility bills going back 2+ years. Gaps need explanations.",
      },
      {
        heading: "4. Sponsor's UK anchor — income, accommodation, life",
        prompt: "Sponsor's employment (employer, role, gross annual salary, P60 + 6 months of payslips). Sponsor's UK accommodation (own property or tenancy). How sponsor returned to UK if previously abroad. Family ties in UK.",
      },
      {
        heading: "5. Plans for the UK — concrete next 12 months",
        prompt: "Where you'll live (specific address if known). Applicant's work plan — Spouse visa carries unrestricted work rights, so 'I plan to continue my role at [US employer] remotely for the first 6 months while job-searching in [city]' is realistic and shows you've thought it through. NHS access from day one is one of the benefits — don't pretend you've considered private healthcare.",
      },
      {
        heading: "6. Long-term commitment — using Home Office terminology",
        prompt: "Close with: 'Our relationship is genuine and subsisting, and we intend to live together permanently in the UK' — direct quote from Appendix FM. This is the legal test. Echo it.",
      },
    ],
    moneySavingTips: [
      "Total UKVI fees: £1,938 application + £1,035/year IHS (Immigration Health Surcharge) = £4,047 for a 30-month visa. Premium decision (5 working days) adds £500 but rarely worth it for first application.",
      "ACRO certificate NOT needed for US-citizen applicants applying from the US — UK doesn't ask for police certificates on the partner route (different from Australia / Canada).",
      "Don't pay an immigration solicitor £1,500-3,000 for a standard Spouse visa application — Home Office's Appendix FM checklist is well-documented for self-filers. Sterling Law and similar OISC-regulated firms offer one-hour paid consultations from ~£100 if you want a sanity-check.",
      "Use US 1040 forms + 6-month US bank statement showing salary deposits as primary income evidence; UK Home Office accepts foreign income for the sponsor if returning to UK + a confirmed UK job offer is provided.",
      "If sponsor is UK-resident and you're applying from the US: apply at US side via UKVI commercial partner (TLScontact, formerly VFS) — VAC fees ~$130-200 on top of the £1,938 visa fee.",
      "Apply 3 months before intended travel — UKVI Standard processing is currently 8-12 weeks from the US.",
      "Save on translations: any English-language US document (marriage certificate, birth certificate) needs NO translation. Don't pay a 'document translator' for an English document.",
      "5-year route to ILR (Indefinite Leave to Remain) requires two extensions before settlement — total UK visa cost over 5 years ~£8,000-10,000 inclusive of IHS. Married 2+ years before applying lets you renew at 2.5-year intervals.",
    ],
    lawyerTriggers: {
      diy: [
        "Standard married couple with sponsor earning comfortably above £29,000 and 6 months of payslips",
        "Civil partnership where both names appear on UK tenancy / mortgage",
        "Unmarried Partner route with 2+ years of well-documented UK cohabitation",
        "Clean immigration history on both sides",
      ],
      getALawyer: [
        "Sponsor income just below £29,000 OR mixed self-employment + employment income",
        "Sponsor is not currently UK-resident and needs to evidence intent to relocate (returning resident category complications)",
        "Applicant has prior UK visa refusal, overstay, or Section 320 / 322 general grounds refusal",
        "Criminal record on the applicant side — UK general grounds for refusal (4-year ban for some criminality, lifetime for serious offences)",
        "Dependent children from previous relationships — derivative leave requirements",
        "Applicant is currently in UK on visit visa wanting to switch — switching from visit visa to spouse is NOT permitted; must return to US and apply from there",
        "Sponsor previously had recent ILR / settlement granted to a previous partner",
        "Same-sex couple from US states where civil unions had unclear legal status — document the legal recognition path carefully",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AUSTRALIAN → UK — family / spouse
  // ════════════════════════════════════════════════════════════════════

  "AU:GB:family": {
    whatCarriesWeight: [
      {
        label: "Spouse / Civil Partner / Unmarried Partner — same Appendix FM rules apply",
        why: "Australians apply through the SAME UK Spouse / Civil Partner / Unmarried Partner / Fiancé(e) routes as US applicants. UK doesn't have a Commonwealth-shortcut on the partner route. Choose carefully — Unmarried Partner needs 2 YEARS of continuous documented cohabitation; Spouse needs valid marriage; Fiancé(e) is a 6-month visit visa pending UK marriage.",
      },
      {
        label: "Minimum Income Requirement — £29,000 sponsor income",
        why: "UK sponsor must earn £29,000+/year gross from employment with 6 months of payslips (£18,600 was the previous threshold, raised April 2024). Savings substitute at £88,500 (held 6+ months). Self-employed sponsors use last full UK tax year. From January 2025 the threshold may rise further to match Skilled Worker — verify the current figure at gov.uk before applying.",
      },
      {
        label: "Genuine and subsisting relationship — UK's specific evidence categories",
        why: "Home Office Appendix FM cites: marriage certificate or 2+ years cohabitation evidence; joint financial commitments (joint accounts, mortgage); communication evidence during separations; photos with both families; honeymoon / joint travel; statements from family and friends attesting to the relationship. Spread across categories beats volume in any single one.",
      },
      {
        label: "Tuberculosis testing — Australia is OFF the TB-test list",
        why: "Australians are EXEMPT from UK TB testing (Australia is not on the UK's high-risk TB country list). One less £80-250 expense + week of delay.",
      },
      {
        label: "ACRO / AFP police certificates",
        why: "UK Home Office may request a UK ACRO Police Certificate (Australian sponsor's UK criminal record check, £55 standard) and an AFP National Police Check (Australian applicant's Australian record, AUD$43) — though the UK doesn't always require police certificates on partner applications. Have them ready as supporting evidence.",
      },
      {
        label: "English language — Australians automatically exempt",
        why: "Australia is on the UK Home Office's English-language exemption list. List 'Australia' as country of birth on the form to trigger automatic exemption — no IELTS Life Skills or other test required.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "1. How we met — when, where, context",
        prompt: "Specific date + place. Australians often meet British partners through working-holiday programmes (Subclass 417 in AU, Youth Mobility Scheme in UK) — that's fine; document it. 'In June 2021, I met my partner at a backpacker hostel in Edinburgh during my UK Youth Mobility year' is concrete.",
      },
      {
        heading: "2. Pre-marriage relationship — dated timeline",
        prompt: "First date, official couple, first family introductions, first joint travel between Australia and UK. Document any long-distance periods with flights both ways + accommodation in both names + messaging logs.",
      },
      {
        heading: "3. Marriage / civil partnership OR cohabitation start point",
        prompt: "If married in Australia: marriage certificate from BDM (state register). UK recognises Australian marriages without further legalisation. If Unmarried Partner route: cohabitation start, address, both-names tenancy / utility bills covering 2+ years.",
      },
      {
        heading: "4. Sponsor's UK anchor",
        prompt: "Sponsor's employment, income evidence (P60, 6 months payslips), UK accommodation (mortgage / tenancy), family ties. If sponsor returned recently from Australia after working there: document the return-to-UK arrangements.",
      },
      {
        heading: "5. Plans for UK — work, accommodation, settlement",
        prompt: "Spouse visa carries full work rights — Australian applicants often continue careers in UK seamlessly. State concrete next steps: 'I'll continue freelance work for my Sydney-based employer remotely while job-searching in London' is realistic and demonstrates planning.",
      },
      {
        heading: "6. Closing — Home Office language",
        prompt: "Use the exact Home Office phrase: 'Our relationship is genuine and subsisting and we intend to live together permanently in the United Kingdom.' This is from Appendix FM E-LTRP.1.7 — the legal test for genuineness.",
      },
    ],
    moneySavingTips: [
      "UKVI fees: £1,938 application + £1,035/year IHS = £4,047 total for 30-month visa. Premium decision (£500 extra) rarely worth it for partner applications.",
      "Australians are exempt from the English language test and TB test — list 'Australia' as country of birth + Australian passport on the application to trigger both exemptions automatically.",
      "Apply via TLScontact / VFS Australia — locations in Sydney, Melbourne, Perth, Brisbane, Auckland. VAC fee ~AUD$200 on top of the visa fee.",
      "Don't pay a UK immigration lawyer AUD$3,000-5,000 for a standard Spouse visa. Home Office's checklist is well-documented for self-filers. Sterling Law / OTS Solicitors etc. offer one-hour paid consultations from ~£100 if you want a check.",
      "Use Wise / Revolut to evidence joint financial commitments in GBP — both work fine as evidence even if account is in one name.",
      "Sponsor's UK employer letter should explicitly state gross salary, employment continuation post-application, and contact details for HR verification.",
      "If sponsor is currently in Australia (Subclass 417 / 482 etc.) but plans to return to UK: document the return travel + UK accommodation arranged for return.",
      "5-year route to ILR involves two extensions — budget ~£8,000-10,000 total UK visa cost over 5 years.",
    ],
    lawyerTriggers: {
      diy: [
        "Standard married couple with comfortable sponsor income + UK accommodation arranged",
        "Civil partnership / marriage from Australia, both names on Australian property or financial accounts",
        "Unmarried Partner route with 2+ years of documented Australian or UK cohabitation",
        "Sponsor returning to UK from Australia with re-established UK employment",
      ],
      getALawyer: [
        "Sponsor income just below £29,000 OR mixed UK + Australian income sources",
        "Sponsor not yet returned to UK and needs to evidence intent to settle (Returning Resident grounds)",
        "Applicant has prior UK visa refusal, overstay, or general grounds refusal",
        "Criminal record on the applicant — UK rehabilitation periods (Rehabilitation of Offenders Act 1974) interact with mandatory refusal grounds",
        "Same-sex couple where Australian marriage / civil partnership was recognised but pre-2017 (legal recognition unclear during transition)",
        "Dependent children — Australian custody orders need explicit recognition in UK family courts",
        "Pending Australian immigration application (e.g. Subclass 309 Partner being processed) — withdrawal vs continuation strategic call",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // CANADIAN → USA — work (TN under USMCA + H-1B + L-1 + TN-spousal)
  // ════════════════════════════════════════════════════════════════════
  "CA:US:work": {
    whatCarriesWeight: [
      {
        label: "TN visa under USMCA — Canadians' best-kept secret",
        why: "Canadians (and Mexicans) get the TN professional category under USMCA (NAFTA's successor). NO annual cap — uncapped, year-round, no lottery. Apply at the US port-of-entry or pre-flight inspection with a job offer letter, proof of credentials, US$56 fee. Approved same-day in most cases. Massively easier than H-1B for the ~60 designated TN occupations (engineer, scientist, accountant, lawyer, teacher, IT professional). The TN list is the gatekeeper — if your role isn't on it, you're back to H-1B/L-1.",
      },
      {
        label: "H-1B lottery — only if TN doesn't fit your occupation",
        why: "H-1B has 65,000 annual cap + 20,000 advanced-degree cap. ~470,000 registrations in 2024 lottery = ~14% selection rate. Filing fees: ~US$2,805–$4,055 for employer + $215 USCIS registration. Don't pursue H-1B if your role qualifies for TN — TN is faster, cheaper, no cap, renewable indefinitely in 3-year blocks. H-1B's one advantage: dual-intent (can pursue green card while on H-1B; TN technically does not allow dual intent though USCIS rarely denies on these grounds).",
      },
      {
        label: "L-1 intracompany transfer — if you've worked 1+ year at a Canadian parent/sub",
        why: "L-1A (executive/manager) or L-1B (specialised knowledge) requires 12 consecutive months in past 3 years at a qualifying Canadian entity that has a US affiliate. L-1A allows up to 7 years; L-1B caps at 5 years. L-1 spouses (L-2) get automatic work authorisation in US — better than TN where spouse (TD) cannot work at all. Critical distinction many Canadian families miss.",
      },
      {
        label: "TN spouse work limit — the dealbreaker for dual-career couples",
        why: "TN-dependents (TD status) CANNOT work in the US. Period. No exceptions. Canadian families where both partners need US income must use L-1 (L-2 spouse gets EAD) or H-1B (H-4 spouse with EAD if I-140 approved). This is the single biggest reason Canadian families regret the TN route once they arrive.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Visa class chosen + occupational fit", prompt: "TN: 'My role of [Software Engineer / Civil Engineer / Accountant / etc.] is listed in Appendix 2 to Annex 16-A of USMCA. My degree in [field] from [Canadian university] meets the credential requirement.' L-1: explain the qualifying 12-month Canadian employment + US affiliate relationship. H-1B: justify why TN doesn't apply." },
      { heading: "2. Why this US employer + city", prompt: "Tech roles in SF Bay Area, Seattle, NYC, Austin. Finance in NYC, Chicago. Energy in Houston. Be specific — port-of-entry CBP officers sometimes ask conversational questions to confirm bona fides." },
      { heading: "3. Family + dependents", prompt: "If TN: acknowledge TD work limitation and explain plan (spouse on separate H-1B / E-2 / their own TN). If L-1: highlight L-2 EAD eligibility. Kids: F-2 / TD / L-2 dependents can attend US public schools without separate visa." },
      { heading: "4. Long-term plan", prompt: "TN technically doesn't allow dual-intent — present plan that's consistent with non-immigrant intent at port of entry, but understand that pursuing PERM/EB-2/EB-3 green card from TN is common practice. L-1A to EB-1C is the cleanest path (no PERM required). Canadian citizenship is not lost on US naturalisation — dual is permitted by both countries." },
    ],
    moneySavingTips: [
      "Apply for TN at the US port of entry (Pearson, YVR, land border) — no need to file I-129 in advance for first-time TN. Saves the US$460 I-129 filing fee. Bring originals: degree, transcripts, employer letter, CV, fee receipt.",
      "Don't pay an immigration lawyer to file TN if your case is straightforward — the application is letter + degree + fee at the border. Lawyers charge US$1,500–$3,000 for what is essentially a CBP officer interaction.",
      "L-1 blanket petition: if your Canadian employer files 10+ L-1s a year, they may have a blanket — you skip individual I-129 filing and just present L-1 petition to CBP. Ask HR.",
      "Canada-US tax treaty: tie-breaker rules let you avoid double taxation. File CRA NR73 (Determination of Residency Status) before departure to confirm Canadian non-residency. Avoids paying Canadian tax on US income.",
      "Canadian RRSP can stay invested while you're in the US — Article XVIII of the treaty defers US tax on RRSP earnings. File Form 8891 (now folded into Form 1040 disclosure) annually. Don't withdraw RRSP while in the US — that triggers Canadian withholding tax.",
    ],
    lawyerTriggers: {
      diy: [
        "TN application at the port of entry with a Canadian degree matching a USMCA Appendix occupation",
        "L-1A executive transfer from a known multinational with established US presence (RBC US, TD Bank, Shopify US, etc.)",
      ],
      getALawyer: [
        "TN occupation that's borderline (e.g. 'Management Consultant' — CBP scrutinises heavily, often refused)",
        "Self-employed / consulting structures — TN requires a US employer; B2B contracting can fit but needs careful structuring",
        "Past CBP refusal at the border (TN refusals are not 'visa denials' but expedited removals — lasting 5-year impact)",
        "Switching from TN to H-1B (dual-intent issue) or pursuing green card while on TN",
        "Cannabis industry US employment — federally illegal even where state-legal, can trigger lifetime US ban for Canadians",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // NEW ZEALANDER → UK — work (Skilled Worker + Youth Mobility up to 35)
  // ════════════════════════════════════════════════════════════════════
  "NZ:GB:work": {
    whatCarriesWeight: [
      {
        label: "Youth Mobility Scheme — uniquely raised to age 35 for Kiwis",
        why: "From January 2024, the UK raised the YMS age limit for New Zealand citizens to 35 (up from 30), with a 3-year stay limit (up from 2). NZ is one of only TWO countries (with Australia) to get this. £298 fee + £776 IHS-per-year. No employer sponsorship needed. Unrestricted work. The single best route for any Kiwi under 35 — beats Skilled Worker on cost, flexibility, and stress.",
      },
      {
        label: "Skilled Worker — if you're over 35 or want a settlement path",
        why: "YMS doesn't lead to settlement. Skilled Worker (sponsored, £38,700 minimum salary from April 2024, or £29,000 for Health & Care occupations) does — ILR after 5 years, citizenship year 6. UK skill-shortage list (Immigration Salary List as of April 2024) discounts the threshold by 20% for designated roles (e.g. some healthcare, engineering, fishing-industry roles). Sponsor must hold a Skilled Worker licence.",
      },
      {
        label: "Ancestry visa — the Kiwi cheat code",
        why: "If you have a UK-born grandparent (any line), the UK Ancestry visa gives you 5 years' unrestricted work in the UK, leading to ILR. £637 fee + IHS. No salary threshold, no sponsorship, no skill restriction. Many Kiwis with British grandparents miss this route entirely and pay for Skilled Worker instead — Ancestry is dramatically cheaper and more flexible.",
      },
      {
        label: "NZ Police certificate + 'right to work' checks",
        why: "UK requires NZ Police certificate for all visa categories ≥12 months. ~NZ$55, processed in 10 working days via NZ Police website. UK employers must conduct 'right to work' checks via the eVisa share-code system — Kiwis on YMS / Skilled Worker / Ancestry all get share codes through View and Prove. No more BRPs from 2025.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Visa route + why this not the others", prompt: "YMS for the under-35 unrestricted-work flexibility, Ancestry if eligible (cheapest 5-year route), Skilled Worker if sponsored and over 35. Mention if you've checked grandparent UK-birth eligibility — Ancestry is the obvious choice if you have it." },
      { heading: "2. Why the UK", prompt: "London's finance/tech/biomed sectors, Edinburgh's engineering, the OE tradition (Overseas Experience — kiwis have a cultural expectation of UK working years), proximity to Europe, sterling-vs-NZD currency arbitrage for high-earners. Kiwi-British dual-heritage is common — mention specific family/cultural ties if applicable." },
      { heading: "3. Family + dependents", prompt: "YMS doesn't allow dependents (children/spouse) on your visa — spouse needs their own YMS / visa. Skilled Worker and Ancestry both allow dependents. Note Kiwi-British dual-citizen kids: no visa needed for the child if they have a British parent (descent)." },
      { heading: "4. Long-term plan", prompt: "YMS → switch to Skilled Worker before YMS expires (cannot extend YMS). Ancestry → ILR at year 5. Skilled Worker → ILR at year 5. British citizenship at year 6 (year 5 ILR + 1). NZ permits dual citizenship — no need to renounce." },
    ],
    moneySavingTips: [
      "YMS over Skilled Worker (when under 35): YMS total cost for 3 years = £298 + £2,328 IHS = ~£2,600. Skilled Worker 3 years = £719 × 3 + £3,105 IHS + sponsor fees = ~£8,000+. Save £5,000+ if you qualify by age.",
      "Apply for Ancestry FIRST if you have a UK-born grandparent — don't waste money on YMS or Skilled Worker if you're Ancestry-eligible. Even adopted grandparents qualify if the adoption was UK-legal.",
      "Open a UK bank account before arrival via Monzo / Starling / Revolut — non-resident-friendly. HSBC NZ has an 'expat' service for UK account opening pre-departure if you prefer high-street.",
      "NZ-UK Double Tax Agreement: Article 14 (Employment) makes UK PAYE the primary taxing jurisdiction for UK-earned income. If still in NZ tax-resident status during transition, file IR3 with foreign-income credits. Update IRD records to 'non-resident for tax' once UK residency is established (183-day rule).",
      "KiwiSaver: you cannot continue contributions while UK-resident, but the fund stays invested. Don't cash out for the visa application — it's not required as proof of funds.",
    ],
    lawyerTriggers: {
      diy: [
        "YMS application from an NZ citizen aged 18-35 with no immigration history concerns",
        "Skilled Worker via a CoS from a major UK employer (banks, NHS Trusts, big-tech UK offices)",
        "Ancestry visa with clear UK grandparent birth certificate and unbroken paper trail",
      ],
      getALawyer: [
        "Ancestry visa where the grandparent paper trail has gaps (adopted-in / illegitimacy / records lost in WWII)",
        "Switching from YMS to Skilled Worker mid-stream (CoS timing + IHS reconciliation)",
        "Past UK refusal or overstay (even a missed flight in your early 20s can resurface)",
        "Maori cultural-name documents not matching passport (deed-poll or affidavit may be needed)",
        "Dual NZ-Aus citizenship and the choice of which passport to apply on (Aus YMS terms differ slightly)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // IRISH → UK — work (Common Travel Area — no visa required)
  // ════════════════════════════════════════════════════════════════════
  "IE:GB:work": {
    whatCarriesWeight: [
      {
        label: "Common Travel Area — you do NOT need a UK visa",
        why: "Irish citizens have unrestricted right to live, work, study, vote, and access public services in the UK under the Common Travel Area (CTA), established 1922, reaffirmed post-Brexit via the May 2019 IE-UK Memorandum. You can fly into the UK on your Irish passport, walk through arrivals, take a job the next day. No visa, no sponsorship, no IHS, no fee. Many Irish people waste hundreds of pounds applying for visas they don't need — STOP. You don't need one.",
      },
      {
        label: "Settlement (ILR) is automatic, citizenship is via naturalisation",
        why: "Irish citizens are 'settled' in the UK from day one (you're not 'subject to immigration control'). British citizenship by naturalisation requires 5 years UK residence + 1 year free of immigration restrictions (which Irish are from arrival) + Life in the UK test + £1,580 fee. Many Irish in the UK already qualify on residence — they just haven't applied. Dual IE/UK citizenship is permitted by both states.",
      },
      {
        label: "Right to work checks — share code NOT needed",
        why: "UK employers must conduct 'right to work' checks. For Irish: simply showing your Irish passport (or Irish passport card) satisfies the check. UK employers sometimes wrongly ask for an eVisa share code — they don't need one for Irish citizens. The Home Office Code of Practice explicitly lists IE passport as adequate proof. Push back if HR asks for more.",
      },
      {
        label: "NHS, NI number, voting — all open from day one",
        why: "Irish citizens register for an NI number via the standard process — apply within first weeks of arrival via gov.uk. NHS registration: walk into any GP, fill in GMS1 form, no immigration check. Vote in UK general + local elections — Ireland is one of only TWO countries (with Commonwealth states) whose citizens get UK voting rights. Council tax, child benefit, universal credit (subject to habitual-residence test) — all available.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. (Personal statement is not required for entry)", prompt: "You do NOT need to write a personal statement to move to the UK as an Irish citizen. Skip this entire process. The only paperwork is the standard NI number application + employer's right-to-work check + GP registration." },
      { heading: "2. If applying for naturalisation later", prompt: "When you apply for British citizenship (Form AN), the application is mostly residential evidence (utility bills, P60s, council tax) + Life in the UK test + good-character declaration. No personal statement. Two referees countersign." },
      { heading: "3. Family + dependents", prompt: "Your Irish-citizen spouse and children also have CTA rights — no visa needed. NON-Irish family members (e.g. a US citizen spouse) need a separate UK visa (Family route, Skilled Worker, etc.). This is a common miss — Irish person assumes their American spouse 'gets in too' under CTA. They don't." },
      { heading: "4. Long-term plan", prompt: "Lifetime CTA right means no settlement-clock anxiety. Naturalisation is optional — most Irish in UK never bother because everything (work, NHS, voting, social security) is already accessible. Only naturalise if you want a British passport for non-EU travel convenience or family-line UK citizenship for descendants." },
    ],
    moneySavingTips: [
      "Do not apply for ANY UK visa. £0 immigration cost. The most-undersold migration savings on this site.",
      "Skip immigration lawyers entirely — there is nothing to lawyer. You may want an accountant for the Ireland-UK tax-residency transition (~€500), and a solicitor for property purchase, but no immigration spend.",
      "Ireland-UK Double Tax Agreement + Article 4 tie-breaker: file Form P85 with HMRC to confirm UK tax-resident status after arrival. Revenue (Irish tax authority) accepts UK PAYE evidence to clear your Irish tax obligations.",
      "Bring your Irish PPS number when applying for NI — they speed-issue NI to Irish citizens who can show prior PPS registration. Saves the 4-6 week wait.",
      "Naturalisation is £1,580 + £80 ceremony fee. Only worth it if you specifically want a British passport. Otherwise Irish passport already gives you EU + UK access — a strictly better combo.",
    ],
    lawyerTriggers: {
      diy: [
        "Any Irish citizen moving to the UK to work — this is genuinely a zero-paperwork move",
        "British naturalisation after 5 years (or 3 years if married to a British citizen) — Form AN is self-fileable",
      ],
      getALawyer: [
        "Non-Irish spouse / partner needs their own visa (Family route etc.) — that path IS lawyered",
        "Born in Northern Ireland and uncertain if you're Irish, British, or both (Good Friday Agreement birthright)",
        "Past UK criminal conviction affecting naturalisation good-character test",
        "Lost / unrecognised Irish citizenship through historical 1956 Act issues (rare, but reach a specialist)",
        "Dual-tax cases where you keep Irish employment income while UK-resident (split-year / dual-employment)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // AUSTRALIAN → USA — work (E-3 specialty visa — Aussie-only secret)
  // ════════════════════════════════════════════════════════════════════
  "AU:US:work": {
    whatCarriesWeight: [
      {
        label: "E-3 specialty-occupation visa — ONLY Australians qualify",
        why: "Under AUSFTA (Australia-US Free Trade Agreement, in force 2005), Australians have an exclusive visa class no other nationality can use. E-3 has 10,500 visas per year — has NEVER been fully used. 2-year stay, renewable indefinitely, US$315 fee, spouse (E-3D) gets full US work authorisation via EAD. Approval at US embassy in Sydney/Melbourne/Canberra/Perth ~2-4 weeks. Massively easier than H-1B (which has a 14% lottery selection rate). This is the single best US work visa available to anyone.",
      },
      {
        label: "E-3 specialty-occupation definition — what counts",
        why: "Requires a 'specialty occupation' — meaning at minimum a bachelor's degree (or equivalent experience: 3 years' experience = 1 year of education, per the 'three-for-one' rule) in a field directly related to the role. Tech, engineering, finance, science, medicine, architecture, accounting, law all qualify cleanly. Marketing, sales, general management often face scrutiny. The US Department of Labor Labor Condition Application (LCA) must be filed by employer before the visa interview — ETA-9035 form, ~7 days to certify.",
      },
      {
        label: "E-3 spouse work + kids — best dependent terms in US system",
        why: "E-3D spouse files I-765 for EAD on arrival — work-permitted in any field, any employer, no restriction. Children (E-3D) attend US public schools without separate visa. This is dramatically better than H-1B (where H-4 spouse only gets EAD if I-140 approved) or TN (where TD spouse cannot work at all). Many Australian families specifically choose E-3 over Canadian-style TN because of this dependent advantage.",
      },
      {
        label: "AFP National Police Check — bring originals",
        why: "US embassy interview requires AFP (Australian Federal Police) National Police Check + state police certificates if requested for residence 12+ months. AFP is AU$56 online, 5-10 business days, valid 12 months. Schools, employers, immigration all accept the same AFP — single document covers many purposes.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Why E-3 not H-1B / L-1 / O-1", prompt: "E-3 is your default. State the specialty-occupation classification: 'My role as [Software Engineer / Civil Engineer / Senior Accountant] requires a bachelor's in [field] which I hold from [University of Sydney / Melbourne / UNSW etc.]. The role is classified under [ANZSCO / SOC code] which is a recognised specialty occupation under the AUSFTA E-3 visa.' If you're going down O-1 (extraordinary ability) — explain the publications/awards/critical-role evidence." },
      { heading: "2. Why this US employer + city", prompt: "Mid-Atlantic finance (NYC, Boston), West Coast tech (SF, Seattle), Texas energy (Houston), DC defence/policy. Australian timezone overlaps with US West Coast morning — note if your role requires this overlap." },
      { heading: "3. Family + work-authorisation plan", prompt: "Spouse files I-765 immediately on arrival for EAD (typically 3-5 month wait; can be expedited if employer-sponsored). State spouse's intended field. Kids: register at local public school district, take I-94 + lease as proof of residence. No SEVIS for E-3D kids." },
      { heading: "4. Long-term plan", prompt: "E-3 is renewable indefinitely in 2-year blocks — no upper cap on renewals. Green card pathway: PERM → EB-2 / EB-3, typically employer-sponsored. Australia is a 'no-backlog' country for EB-2/3 (unlike India / China) — PERM-to-green-card cleanly in 2-3 years. Australian citizenship is not lost on US naturalisation." },
    ],
    moneySavingTips: [
      "Apply for E-3 from Australia (US embassy interview at Sydney/Melbourne/Canberra/Perth) — DO NOT pursue H-1B unless your role definitely doesn't fit specialty-occupation. H-1B lottery cost: ~US$5,000-15,000 in employer + lawyer fees with 14% selection rate. E-3: US$315 fee, ~95% approval if specialty-occupation cleanly fits.",
      "Don't pay premium processing for E-3 — there isn't one. Standard processing is already 2-4 weeks from LCA certification to interview slot.",
      "AU-US tax treaty: Article 4 tie-breaker rules + Article 22 (Relief from Double Taxation). File Form 1116 (Foreign Tax Credit) on US return for any Australian tax paid during transition year. Update your ATO record to non-resident on departure — Aussie super stays invested.",
      "Australian super: cannot contribute while in US, but stays invested. If you depart Australia permanently, you can claim DASP (Departing Australia Superannuation Payment) — but it's taxed at 38-65%. Most Australians keep super invested and access at preservation age.",
      "Use a US-Australia cross-border accountant for the first US tax year — ~US$800. They handle the FBAR (foreign bank account report) + Form 8938 (FATCA) for your AU bank/super accounts. Common DIY mistake: missing FBAR triggers up to US$10,000+ civil penalties.",
    ],
    lawyerTriggers: {
      diy: [
        "E-3 application via a US employer with prior E-3 hires (LCA process already familiar)",
        "Standard E-3 renewal at the US embassy (visa renewal interview every 2 years)",
      ],
      getALawyer: [
        "First-time E-3 sponsor — LCA filing has compliance pitfalls (wage-level determination, posting requirements)",
        "Borderline specialty-occupation role (Marketing Manager, Project Manager — Consular Officers scrutinise these heavily)",
        "Switching from E-3 to green card via PERM — employer's PERM advertising compliance is specialist work",
        "Past US visa refusal (B-1/B-2 denial, prior overstay)",
        "Australian conviction record (even spent convictions can be relevant to US admissibility under INA 212)",
        "Dual citizen UK/Australia choosing which passport to apply on — E-3 requires Australian passport at interview",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRIT → NEW ZEALAND — work (Accredited Employer Work Visa + Green List)
  // ════════════════════════════════════════════════════════════════════
  "GB:NZ:work": {
    whatCarriesWeight: [
      {
        label: "Accredited Employer Work Visa (AEWV) — the main route",
        why: "From July 2022 NZ consolidated work visas into the AEWV. Three steps: (1) employer must be accredited (Standard accreditation NZ$740, High-Volume NZ$1,980); (2) Job Check confirms market test passed (NZ$735); (3) you apply for the visa (NZ$750). Minimum salary: NZ$31.61/hour (the NZ median wage) as of February 2025, equivalent to NZ$65,750/year for 40-hour week. Below median = refusal. Skill-shortage list (Green List Tier 1/2) waives some requirements.",
      },
      {
        label: "Green List — Straight to Residence vs Work to Residence",
        why: "If your occupation is on Green List Tier 1 (e.g. registered nurse, civil engineer, medical specialist, software engineer), you get Straight to Residence — apply for permanent residence directly from offshore, no AEWV intermediate step. Tier 2 occupations (e.g. early childhood teachers, registered electricians) get Work to Residence — 2 years on AEWV, then residence. The Green List is the fastest route to NZ permanent residence for Brits in skilled trades and healthcare.",
      },
      {
        label: "Working Holiday Scheme — under-30s alternative",
        why: "Brits aged 18-30 can apply for a Working Holiday Visa (12 months, extendable to 23 months with 3 months horticulture/viticulture work). NZ$420 fee. No employer sponsorship, no occupation restriction. Quota: unlimited for UK citizens (uncapped). Great for testing NZ before committing to AEWV, but does NOT lead to residence on its own.",
      },
      {
        label: "ACRO + UK criminal record — NZ's character requirement",
        why: "Immigration NZ requires ACRO Police Certificate (£55, 10 working days) from UK + any country you've lived 12+ months in past 10 years. NZ has stricter character thresholds than Australia: any conviction in past 10 years carrying ≥12 months potential sentence is an automatic character-bar (requires character waiver from INZ). UK 'spent' convictions ARE disclosable on the NZ application — Rehabilitation of Offenders Act doesn't apply.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Visa class + employer accreditation status", prompt: "AEWV: 'I have a job offer from [Employer], INZ-accredited (Standard / High-Volume) since [date]. Job Check approved [date]. Role is [job title], [ANZSCO code], salary NZ$[amount]/year (above median NZ$65,750).' Green List Tier 1: skip AEWV, apply Straight to Residence. WHV: state age + intent to test NZ before longer-term application." },
      { heading: "2. Why New Zealand", prompt: "Auckland tech/finance, Wellington government/film (Weta), Christchurch engineering/agriculture, Queenstown tourism/hospitality. Note climate / lifestyle factors specifically — INZ wants to see considered choice, not 'NZ seems nice'. Brits often have Commonwealth or family ties (1950s-70s migration generation) — mention if applicable." },
      { heading: "3. Family + dependents", prompt: "AEWV principals can include partner (work-open visa) + children (student visas for school-age). Partner needs to demonstrate genuine and stable relationship 12+ months (cohabitation evidence). Green List Tier 1 Straight to Residence: dependents included on the same application." },
      { heading: "4. Long-term plan", prompt: "AEWV: max 5 years (3+2 renewal), then must switch to Residence Visa or leave. Green List Tier 1: residence on grant. Green List Tier 2: 2 years AEWV → Residence. NZ citizenship by naturalisation: 5 years' residence including substantial physical presence. NZ permits dual citizenship — no need to renounce British." },
    ],
    moneySavingTips: [
      "Check Green List FIRST — if your occupation is Tier 1, apply Straight to Residence offshore (NZ$5,810 fee, single application). Saves the AEWV step (NZ$1,485 in employer + your fees) entirely. Many Brits in healthcare/engineering pay for both before realising.",
      "AEWV employers MUST be accredited before you can apply — confirm employer's INZ accreditation status (Standard vs High-Volume) before signing offer. Non-accredited offer = no visa. Push back firmly.",
      "WHV is the cheapest test-the-water route: NZ$420 + airfare, 1-2 years, no commitment. Some Brits do WHV → AEWV onshore (cheaper than offshore AEWV because you skip airfare costs of re-entry).",
      "UK-NZ Double Tax Agreement: file P85 with HMRC + IR330 with IRD on arrival. NZ tax year is April-March (same as UK). NZ has no capital gains tax on most assets (other than NZ residential property held <10 years) — major lifestyle difference for high-earning Brits with investments.",
      "ACC (NZ's no-fault accident insurance) replaces private medical for accidents — included in your income tax. Don't pay for separate accident-cover insurance.",
    ],
    lawyerTriggers: {
      diy: [
        "Green List Tier 1 Straight to Residence with clean criminal + standard UK degree credentials",
        "AEWV via established NZ employer (Fonterra, Air New Zealand, banks, major hospitals) with accreditation in place",
        "Working Holiday Visa for under-30 Brits with no immigration concerns",
      ],
      getALawyer: [
        "Borderline-skilled occupation needing a specific assessment via NZQA (New Zealand Qualifications Authority)",
        "Health practitioners (doctors, nurses) needing dual INZ + Medical Council NZ / NZNC registration alignment",
        "Past UK conviction (any kind, any age) — NZ character waivers need specialist drafting",
        "Partner-inclusion where relationship duration is <12 months or evidence is thin",
        "Switching from WHV to AEWV onshore (job-offer + accreditation timing is delicate)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRIT → USA — study (F-1 + OPT + STEM-OPT)
  // ════════════════════════════════════════════════════════════════════
  "GB:US:study": {
    whatCarriesWeight: [
      {
        label: "F-1 visa + I-20 + SEVIS — the three documents that matter",
        why: "Three independent items: (1) Form I-20 issued by your SEVP-certified US school after you've been admitted + paid the deposit; (2) SEVIS I-901 fee US$350 paid online before applying; (3) DS-160 + visa interview at US Embassy London (Mayfair) or Belfast. Standard fee US$185. The I-20 contains your SEVIS ID — bring the original (printed, signed) to the interview. UK applicants typically get appointments within 2-6 weeks; priority slots available for £100 extra.",
      },
      {
        label: "Proof of funds — show 1 year minimum, not just tuition",
        why: "I-20 itemises tuition + living expenses for one academic year. UK applicants must show liquid funds covering year 1 — typically US$50k-90k for private universities + US$15k-25k living. Statements: 6 months UK bank statements (Barclays / HSBC / Lloyds international statements work fine), parental sponsorship letter + sponsor's bank statements if parents fund, scholarship letter if applicable. Consular officers refuse F-1s where parental funds aren't well-evidenced.",
      },
      {
        label: "OPT + STEM-OPT — the real reason to study STEM in the US",
        why: "After completing degree, F-1 students get Optional Practical Training (OPT): 12 months of full work authorisation in the US, no employer-sponsorship. STEM-OPT extension: additional 24 months for designated STEM fields (full list at ICE.gov — covers most engineering, CS, hard sciences, applied maths, some business analytics). Total: 36 months post-graduation work. Vast majority of Brits doing US Master's pick STEM-eligible programmes specifically for this. H-1B lottery eligibility starts during OPT.",
      },
      {
        label: "ACRO + no UK criminal records issue",
        why: "F-1 does NOT require ACRO Police Certificate. The DS-160 has a 'have you ever been arrested or convicted?' question which you must answer honestly — UK 'spent' convictions under the Rehabilitation of Offenders Act ARE disclosable to US authorities (US doesn't recognise UK spent-convictions rules). Cannabis-related convictions, even minor, can trigger waiver requirements — speak to a lawyer before declaring.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Programme + school + non-immigrant intent", prompt: "'I have been accepted to [University] [Programme] starting [date], a [length] degree. The programme aligns with my prior UK academic record at [UK university].' Then critically: 'I intend to return to the UK upon completion to [specific career plan]'. F-1 is a non-immigrant visa — you MUST evidence ties to the UK and intent to return. Even with OPT-intent, the visa interview answer is 'return home'." },
      { heading: "2. Why this US programme over UK / other", prompt: "Specific programme strengths, faculty, research focus, industry links. Avoid 'America is more prestigious' — state concrete academic reasons. Compare to UK alternative honestly ('UCL has the closest equivalent but lacks the [specific lab / faculty member / industry partnership]')." },
      { heading: "3. Funding source", prompt: "Personal savings + parental support + scholarship + part-time work (F-1 allows on-campus work 20 hrs/week + CPT during programme). Show I-20-listed costs are fully covered for year 1. Refer to sponsor's letter + bank statements." },
      { heading: "4. Post-graduation plan", prompt: "OPT + STEM-OPT if applicable (state intended industry). Long-term return to UK: 'I plan to use the post-graduation OPT period to gain US industry experience before returning to the UK [specific employer / industry / location].' Be specific — vague answers raise red flags." },
    ],
    moneySavingTips: [
      "Book DS-160 visa interview at the London or Belfast US Embassy DIRECTLY via ustraveldocs.com — do NOT use third-party visa-services. They charge £100-300 for a 'service' that's literally filling in the same form you'd fill out on the official site.",
      "Choose STEM-eligible programmes deliberately if you want a 3-year US-work runway — non-STEM Master's get only 12 months OPT, then immediate departure or H-1B lottery (14% odds).",
      "UK-US tax treaty Article 20A: F-1 students are exempt from US Social Security/Medicare tax (FICA) on on-campus work. Make sure your university payroll office applies the exemption — many don't unless you ask.",
      "Keep parental support flowing via Wise / Revolut multi-currency rather than wire transfers — saves £20-50 per transfer.",
      "F-1 students CANNOT claim US tax refund as 'resident alien' for 5 years — file Form 1040-NR (non-resident return). Common DIY mistake: TurboTax pushes you to 1040, IRS later audits and disqualifies F-1.",
    ],
    lawyerTriggers: {
      diy: [
        "F-1 for an admitted student to a major UK-friendly US university (MIT, Stanford, NYU, Columbia, all Ivies, big state schools)",
        "Standard OPT application (Form I-765, US$520 fee) — university DSO walks you through it",
      ],
      getALawyer: [
        "DS-160 with 'yes' answer to arrest/conviction question — needs proper drafting + supporting evidence",
        "F-1 from a UK applicant with previous US visa refusal or overstay",
        "Cannabis-related UK conviction (US federal-illegal status creates lifetime ban risk)",
        "F-1 to H-1B to green card pathway — start lawyer in OPT year 1, not year 3",
        "F-1 + dependents (F-2 spouse cannot work in US — plan around this)",
        "Programme change mid-stream (e.g. transferring from undergrad to graduate without leaving)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRIT → CANADA — study (Study Permit + PGWP + Quebec specifics)
  // ════════════════════════════════════════════════════════════════════
  "GB:CA:study": {
    whatCarriesWeight: [
      {
        label: "Study Permit + PAL (Provincial Attestation Letter) since 2024",
        why: "Since January 2024, IRCC requires a Provincial Attestation Letter (PAL) from your destination province alongside your Designated Learning Institution (DLI) acceptance letter and Study Permit application. Quebec uses the Certificat d'acceptation du Québec (CAQ) instead. PAL is issued via the school once your acceptance is confirmed — 2-6 weeks. Without PAL/CAQ, your study permit will be rejected at the visa office. UK applicants apply via the IRCC portal, CA$150 fee. Standard processing: 4-12 weeks.",
      },
      {
        label: "Proof of funds — CA$20,635 living + tuition (raised 2024)",
        why: "From January 2024, IRCC raised cost-of-living proof from CA$10,000 to CA$20,635 per year (excluding tuition). UK Brits must show full year-1 tuition (CA$25-55k for international students) + CA$20,635 living + travel cost in a GIC (Guaranteed Investment Certificate) with Scotiabank / RBC / CIBC / TD international stream. The GIC is REQUIRED under the Student Direct Stream (SDS, the fast lane) — pay CA$10,000 upfront, drawn down monthly.",
      },
      {
        label: "PGWP — up to 3 years post-graduation work",
        why: "Post-Graduation Work Permit (PGWP) gives 1, 2, or 3 years of unrestricted work in Canada based on programme length: 8-23 months programme = matching length PGWP; 24+ months = 3 years. Must apply within 180 days of completing programme. From November 2024, PGWP eligibility requires programmes from public DLIs (some private institutions excluded). Critical: PGWP work counts towards Express Entry Canadian Experience Class — primary pathway to Canadian PR for Brits.",
      },
      {
        label: "ACRO + IELTS (sometimes)",
        why: "Standard route: NO ACRO required (Canada uses self-declaration on the form). SDS route: ACRO Police Certificate required + IELTS Academic 6.0 overall, no band below 6.0 (or TEF for French / Quebec). UK applicants almost universally meet IELTS — most universities accept the IELTS-waiver for UK-secondary-school applicants automatically.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Programme + DLI + PAL/CAQ status", prompt: "'I have been admitted to [University] [Programme], a [length-month] [diploma / bachelor / Master / PhD] starting [intake]. The institution is a Designated Learning Institution (DLI #[number]). My Provincial Attestation Letter from [province] was issued [date].' For Quebec: state CAQ instead." },
      { heading: "2. Why Canada + this province", prompt: "Specific reasons: programme strengths, faculty research, industry links. For Brits common reasons: lower-than-US tuition for top universities (UofT, McGill, UBC, Waterloo), shared Commonwealth credentials, English-medium (or French in Quebec), PR pathway via PGWP+Express Entry that's vastly faster than US." },
      { heading: "3. Funding source + financial evidence", prompt: "GIC of CA$10,000+ (SDS route) or full year-1 cost-of-living proof (non-SDS). Tuition paid status. Parental sponsorship letter + sponsor's bank statements if relevant. UK university student finance does NOT cover Canadian tuition — must be self-funded or scholarship." },
      { heading: "4. Ties to UK + post-graduation plan", prompt: "'My intent is to use the PGWP to gain Canadian work experience post-graduation. I plan to [return to UK / apply for Canadian PR / further studies].' Unlike F-1, Study Permit allows dual intent — explicitly stating PR aspiration is FINE and common. Just be honest." },
    ],
    moneySavingTips: [
      "Apply via Student Direct Stream (SDS) if you qualify (residence in UK + GIC + IELTS 6.0 + DLI acceptance + first-year tuition paid). SDS processes in 20 calendar days — 3-4x faster than standard.",
      "GIC: choose Scotiabank Student GIC or RBC International Student GIC — same CA$10,000 deposit, monthly disbursement of CA$833 over 12 months. Avoid private GIC intermediaries that charge 3-5% commission.",
      "UK-Canada tax treaty: international students on Study Permit are typically Canadian tax-resident from arrival. T2202A (tuition tax certificate) generates significant tax credit — carries forward to first working year.",
      "Provincial healthcare: BC's MSP and Ontario's OHIP have wait periods (3 months in BC, no immediate OHIP for students — must buy UHIP at ~CA$70/month). Quebec includes students in RAMQ. Factor by province.",
      "Quebec tuition for international undergrads: significantly higher than other provinces (~CA$30k+/year vs ~CA$15-25k average), but McGill / Concordia worth the premium for global brand. Quebec PR pathway via PEQ is stricter than other provinces.",
    ],
    lawyerTriggers: {
      diy: [
        "SDS Study Permit for an admitted Brit to a major Canadian DLI (UofT, UBC, McGill, Waterloo, McMaster)",
        "PGWP application (online, CA$255 fee) within 180 days of programme completion",
      ],
      getALawyer: [
        "Past Canadian visa refusal — refusal grounds need correction in next application",
        "Programme transfer between DLIs after permit issued (requires IRCC notification + sometimes new permit)",
        "Spouse on Open Work Permit alongside your Study Permit — eligibility narrowed in 2024 to graduate programmes + select undergrad",
        "Dual intent strategy — Study Permit → PGWP → CEC Express Entry is well-trodden but Quebec PEQ path needs Quebec-specialist counsel",
        "Past UK criminal conviction (Canadian admissibility regime differs from UK — even some 'spent' convictions create inadmissibility)",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // BRIT → AUSTRALIA — study (Subclass 500 + post-study work)
  // ════════════════════════════════════════════════════════════════════
  "GB:AU:study": {
    whatCarriesWeight: [
      {
        label: "Subclass 500 Student visa — the only route",
        why: "Subclass 500 covers all Australian study (school, VET, undergraduate, postgraduate, ELICOS, AusAID/Defence). Single visa class regardless of programme. AUD$1,600 application fee (raised from AUD$710 in July 2024 — a 125% hike specifically targeting student visa misuse). Allows part-time work 48 hours/fortnight while course is in session, unlimited during breaks. Visa duration matches course length + ~2 months buffer. Valid via the ImmiAccount online portal.",
      },
      {
        label: "GTE / GS (Genuine Student) — replaced GTE in 2024",
        why: "From March 2024, Australia replaced the long-running 'Genuine Temporary Entrant' (GTE) requirement with the new 'Genuine Student' (GS) requirement. GS still asks: why this course, why this provider, why Australia, ties to home country, intent post-study. Less explicit 'temporary' framing but immigration officers still expect plausible non-PR-fishing intent. UK applicants generally clear GS easily — Brits aren't profiled as 'high-risk' under DHA's 'Evidence Level' framework (UK is Evidence Level 1 = lowest scrutiny).",
      },
      {
        label: "Post-study work — Temporary Graduate visa Subclass 485",
        why: "Subclass 485 post-study work: 2 years (Vocational stream) or 2-4 years (Post-Higher Education Work stream, varies by qualification and regional study location). Open work permission. Cost AUD$2,235. Critical pathway for Brits aiming to use Australian study as PR springboard via Skilled Migration. Regional-Australia graduates get +1 year extra, and additional points for Skilled Migration. Studying in Melbourne / Sydney capped at 2 years; studying in Brisbane / Adelaide / Perth often counts as regional.",
      },
      {
        label: "OSHC + ACRO (not required for Brits)",
        why: "Overseas Student Health Cover (OSHC) is MANDATORY for Subclass 500 — buy from a registered provider (Bupa / Medibank / Allianz Care / nib / ahm) for the visa length. Cost AUD$540/year single. UK has a reciprocal Medicare agreement, but it doesn't replace OSHC for student visa purposes. ACRO Police Certificate is NOT required for Brits at Evidence Level 1 (Australia's risk-tier system) — saves £55 and processing time.",
      },
    ],
    personalStatementTemplate: [
      { heading: "1. Programme + CRICOS code + provider", prompt: "'I have been admitted to [University] [Programme], CRICOS Provider Code [code], CRICOS Course Code [code], commencing [date]. The programme is [length-month] [Bachelor / Master / PhD / VET].' CRICOS codes are mandatory — your CoE (Confirmation of Enrolment) document has them." },
      { heading: "2. Why Australia + this provider (Genuine Student test)", prompt: "Specific programme strengths, faculty, research, industry links. UK applicants common reasons: Group of Eight (Go8) university brand, shorter degrees than UK PhD timelines, lifestyle, Brexit-EU friction made Aus more attractive vs continental Europe. Be specific not generic." },
      { heading: "3. Funding source", prompt: "Australian DHA expects evidence of AUD$24,505/year living costs (raised May 2024) PLUS tuition (typically AUD$30-55k for international undergrads + AUD$30-50k Master's). Bank statements 28 days minimum, parental sponsorship letter + statements, or scholarship offer." },
      { heading: "4. Ties to UK + post-study intent", prompt: "Subclass 500 allows GS-passing answers that include post-study Australian work (485) and even eventual PR aspirations — Australia is much more permissive about expressed PR intent than the US F-1. Honest framing: '2 years post-study via Subclass 485, then assess Skilled Migration eligibility' is FINE." },
    ],
    moneySavingTips: [
      "Australia raised Subclass 500 from AUD$710 to AUD$1,600 in July 2024 (a 125% hike). Budget accordingly. The fee is non-refundable on refusal — get the GS / financial evidence right first time.",
      "Choose 485-eligible programmes deliberately — not all programmes qualify. Bachelor's, Master's (Coursework/Research), Doctorate, and specific VET qualifications listed under CRICOS qualify. Foundation courses + ELICOS DO NOT.",
      "Regional study (Brisbane, Adelaide, Perth, Hobart, Darwin, Canberra, regional NSW/VIC/QLD) earns +1 year Subclass 485 + extra Skilled Migration points. Major financial advantage for PR-aspirers.",
      "UK-Aus reciprocal Medicare: get a Medicare card on arrival (free) — covers emergency hospital + GP visits via UK's reciprocal agreement. OSHC still required for visa compliance but works in parallel.",
      "Tax File Number (TFN): apply via ATO online within first week of arrival (free). Without TFN, employer withholds 47% of casual income. Saves massive cash flow in part-time work earnings.",
    ],
    lawyerTriggers: {
      diy: [
        "Subclass 500 for an admitted Brit to a Go8 university with clean immigration history and standard parental funding",
        "Subclass 485 application post-completion (online via ImmiAccount)",
      ],
      getALawyer: [
        "Past Australian visa refusal (s.97 GS refusals stick — need careful re-framing on retry)",
        "Health condition triggering Health Examination 'significant cost' threshold under PIC 4007 (HIV+, kidney disease, etc. — character/health refusal risk)",
        "Past UK conviction — Australian Character Test under s.501 is harsh, even spent convictions disclosable",
        "Programme change mid-stream (course transfer + provider transfer needs section-19A compliance from current provider)",
        "Dependents (spouse / children under 18) — partner work-rights post-Subclass 500 changed in 2024; needs current-rules check",
      ],
    },
  },

  // ════════════════════════════════════════════════════════════════════
  // P18 EXPANSION — 100 additional high-traffic cells.
  // Each cell follows the same 4-section schema; slightly more focused
  // than the original 113 so the per-route specificity doesn't drown
  // in repeated boilerplate. Real visa names, real fees, real timelines,
  // real bilateral quirks. As always, fall back to the generic block
  // for any cell not present here.
  // ════════════════════════════════════════════════════════════════════

  // ─── Southeast Asia → US (work / tourism / family) ───
  "PH:US:tourism": {
    whatCarriesWeight: [
      { label: "B1/B2 ties-to-Philippines evidence", why: "US presumes immigrant intent under Section 214(b). Manila and Cebu B-visa interview waits run 6–12 months; refusal rates for first-time PH applicants are 25–45%. Strong documentation of employment, property, family, and prior compliant travel is the single biggest lever." },
      { label: "Sponsor invitation + I-134 if visiting family", why: "If a US-based relative is sponsoring the trip, an I-134 Declaration of Financial Support with their tax transcript + W-2 + bank evidence materially shifts the financial-capacity test." },
      { label: "Onward / return ticket + detailed itinerary", why: "Caseworker reads the itinerary as proxy for genuine visitor intent. Hotel bookings, return flight, and a specific schedule beat 'visiting family' alone." },
      { label: "Clean immigration history globally", why: "Prior US overstays, refusals from other countries, or any TNT history in the Philippines will surface — disclose honestly and bring documentation." },
    ],
    personalStatementTemplate: [
      { heading: "Purpose and length of trip", prompt: "State exact dates and the specific purpose (family visit, tourism, conference). Vague answers raise immigrant-intent suspicion." },
      { heading: "Your roots in the Philippines", prompt: "Employer, position, length of service, ownership of property, dependents who remain. Be specific with employer letters and titles." },
      { heading: "How the trip is funded", prompt: "Your own income evidence OR sponsor's I-134 + supporting documents. Don't mix the two casually — pick one and document it fully." },
      { heading: "Prior international travel", prompt: "Any Schengen, UK, AU, JP, KR, SG, HK trips help establish a compliant travel pattern." },
      { heading: "Return plan", prompt: "Specific reason you'll return on schedule — pending work commitment, school year, parental care responsibilities." },
    ],
    moneySavingTips: [
      "Don't use a 'visa fixer' — they cannot influence the consular interview. The US Embassy in Manila explicitly warns against fee scams. Submit DS-160 directly at ceac.state.gov.",
      "If the embassy interview wait is 10+ months in Manila, third-country interview is allowed (most commonly: Singapore, Bangkok, Seoul). Factor in flight cost + 1 week travel.",
      "Pay the MRV fee ($185) only once — refusal under 214(b) is not a permanent bar but the fee is non-refundable on refusal. Reapply only after material change in circumstances.",
      "Interview waiver eligibility expanded in 2024 — if you previously held any US visa (B/F/J/H/L) and it's been less than 48 months since expiry, you may qualify. Saves the interview wait entirely.",
    ],
    lawyerTriggers: {
      diy: ["First-time B1/B2 with strong ties to Philippines and clean immigration history", "Visa renewal under interview-waiver"],
      getALawyer: ["Prior 214(b) refusal — second attempt benefits from professional reframing", "Any prior US overstay, deportation, or removal proceedings", "Recent denial from another country (UK, Canada, Australia) — disclosure obligations are strict"],
    },
  },

  "PH:US:family": {
    whatCarriesWeight: [
      { label: "Petitioning relative's status (US citizen vs LPR)", why: "USC-petitioned spouses and minor children file under Immediate Relative (no annual cap, ~12-18 months). LPR-petitioned spouses/children file under F2A (capped, currently current for most countries). Philippine F-class wait times are among the longest globally — F4 (siblings of USC) is currently 20+ years." },
      { label: "Bona-fide marriage evidence (CR-1 / IR-1)", why: "USCIS scrutinises Filipino-American spousal cases for marriage fraud risk. Strong evidence: cohabitation, joint finances, joint travel, family relationships, child(ren) of the marriage, communication records bridging long-distance courtship." },
      { label: "NSO / PSA original birth and marriage certificates", why: "All civil documents must be PSA-certified (Philippine Statistics Authority). NSO-issued documents from before 2016 may need PSA reissue." },
      { label: "I-864 Affidavit of Support meeting 125% federal poverty threshold", why: "Petitioner must show income ≥125% of poverty threshold for household size (or use a joint sponsor). Self-employment or W-2 evidence over the last 3 tax years." },
    ],
    personalStatementTemplate: [
      { heading: "How you met and the relationship's development", prompt: "Specific timeline — meeting, courtship, engagement, marriage. Mention any long-distance period and how you maintained the relationship." },
      { heading: "Visits and shared experiences", prompt: "Document each in-person visit with passport stamps, flight records, photos. K-1 fiancé(e) requires meeting in person within the prior 2 years." },
      { heading: "Family integration", prompt: "Relationships with each other's families; introductions; weddings; planned future trips." },
      { heading: "Plans in the United States", prompt: "Where will you live, work, settle? Specific city, employer (if known), housing arrangements." },
    ],
    moneySavingTips: [
      "For CR-1 spousal (married outside US): petition from abroad is often faster than K-1 fiancé(e) once you're already married. Skip K-1 if marriage is imminent anyway.",
      "Don't pay for premium courier services for civil documents — USCIS accepts standard PSA-issued documents. The 'expedite' channels for PSA copies in Manila cost 10× and add nothing legally.",
      "K-1 fiancé(e) total cost runs $1,000–$2,500 (I-129F fee + consular fee + medical + AOS later). CR-1 spousal runs ~$1,200–$1,800. Don't believe consultants quoting $5,000+ — that's the fee, not the cost.",
      "Free legal consultations: Catholic Legal Immigration Network (CLINIC), Asian Americans Advancing Justice, Pilipino Workers Center all run pro-bono clinics for Filipino-American families.",
    ],
    lawyerTriggers: {
      diy: ["Standard CR-1 / IR-1 spousal petition with USC sponsor, clean immigration history, and PSA-original documents", "K-1 fiancé(e) with documented in-person meeting and standard timeline"],
      getALawyer: ["Petitioner has prior I-130 filings (especially refused or withdrawn)", "Beneficiary has prior US overstay, deportation, or visa fraud history", "Marriage entered within 90 days of US presence (presumption of fraud risk)", "Same-sex couples whose marriage isn't recognised in Philippine civil registry"],
    },
  },

  "VN:US:work": {
    whatCarriesWeight: [
      { label: "H-1B cap-subject lottery selection", why: "Vietnamese nationals enter the same March lottery as other H-1B applicants (65,000 + 20,000 master's cap). Selection rates have been ~25–30% recently. Master's-degree from US institution doubles your effective odds via the second selection pass." },
      { label: "Employer's H-1B compliance history", why: "Apple, Google, Microsoft, Amazon and most Fortune 500s have clean H-1B records. Smaller employers, especially WITCH (Wipro/Infosys/TCS/Cognizant/HCL) consulting model, face heightened RFEs and audit scrutiny. The petitioner matters." },
      { label: "Specialty occupation + degree match", why: "USCIS scrutinises whether the role requires a bachelor's-or-higher in a specific field, and whether your degree matches. CS degree + software engineer = clean. Generic IT degree + 'analyst' = RFE risk." },
      { label: "Wage level at LCA filing", why: "Level 1 prevailing wage triggers RFEs in 2024–2025 enforcement. Level 2 or higher significantly reduces RFE risk." },
    ],
    personalStatementTemplate: [
      { heading: "Your role and the petitioning employer", prompt: "Specific job title, employer's industry and size, your direct hiring manager. If you've worked for them already (L-1 to H-1B transition), document the existing relationship." },
      { heading: "Educational background", prompt: "Degree, institution, graduation year. If Vietnam-issued, name the WES or similar credential evaluation establishing US equivalency." },
      { heading: "Why this employer and why now", prompt: "Specific project, team, technology. Avoid generic 'better opportunities' framing." },
      { heading: "Long-term plans", prompt: "Many Vietnamese H-1Bs intend EB-2 / EB-3 green-card progression — fine to mention honestly; H-1B is a dual-intent visa." },
    ],
    moneySavingTips: [
      "Employer pays ALL H-1B filing fees by law (I-129 $460 + ACWIA $750-1,500 + Fraud Prevention $500 + premium $2,805 optional). If your employer asks you to reimburse, they're breaking DOL rules — report to WHD.",
      "Vietnamese applicants applying at the Ho Chi Minh City or Hanoi consulate face 1-3 month interview waits — plan US start date with buffer.",
      "Premium processing ($2,805) is now standard for cap-subject H-1B — 15-business-day decision. Worth it for predictable timing.",
      "If your employer is an Approved Employer of Vietnamese workers, they may sponsor your dependents (H-4) faster via concurrent filing.",
    ],
    lawyerTriggers: {
      diy: ["Standard Big-Tech H-1B with strong employer, Level 2+ wage, clean credentials — employer's legal team handles entire petition"],
      getALawyer: ["Self-petitioning H-1B (own consultancy + own LCA + own client) — high RFE risk", "F-1 to H-1B conversion with cap-gap timing issues", "Prior H-1B refusal or RFE", "Vietnamese degree without WES evaluation — risk of 'specialty occupation' RFE", "Spouse / dependent issues (H-4 EAD applicants)"],
    },
  },

  "VN:US:family": {
    whatCarriesWeight: [
      { label: "Petitioner's status and category", why: "USC-petitioned spouse (IR-1/CR-1, ~12-18 months) or minor child (IR-2) clears fastest. Vietnamese F-class siblings (F4) currently waiting 13+ years. F2A (LPR spouses) is current; F1/F3 wait 6-8 years from Vietnam." },
      { label: "Marriage bona-fides for spouse cases", why: "Vietnamese-American marriages get standard scrutiny. Strong evidence: relationship-development timeline, photo evidence across years, joint finances if cohabited, communication records during separation, family integration evidence." },
      { label: "Vietnamese civil document authentication", why: "Marriage and birth certificates from Vietnam need to be issued by competent local authority (UBND) and translated by an authorised translator. Apostille not used — Vietnam joined Hague Apostille only in 2024, transition still rolling out." },
      { label: "I-864 financial sponsorship", why: "Petitioner needs household income ≥125% federal poverty threshold (≥100% for active-duty military petitioners). Joint sponsor allowed where petitioner alone doesn't qualify." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship history and current status", prompt: "When and how you met; marriage date and place; current living arrangements (same household or long-distance)." },
      { heading: "In-person meetings", prompt: "Document each visit with passport stamps and photos. K-1 fiancé(e) requires meeting within prior 2 years." },
      { heading: "Plans for the US", prompt: "Where you'll live, petitioner's employment and housing, plans for the beneficiary's career/study." },
      { heading: "Family situation", prompt: "Children from this or prior relationships, dependent parents, anything affecting the household." },
    ],
    moneySavingTips: [
      "Document translations from Vietnam: use a translator certified by Sở Tư Pháp (Department of Justice) — USCIS accepts these. 'International notarisation' services in Ho Chi Minh charge 5× more for the same outcome.",
      "Form I-130 fee increased to $675 in April 2024 (from $535). DS-260 immigrant visa processing $325. Affidavit of Support $120. Medical at panel physician $250-400. Total: ~$1,500-2,000 official fees.",
      "Avoid 'visa preparation services' in Ho Chi Minh charging $3,000+ for paperwork. The forms are free at uscis.gov and travel.state.gov; legitimate immigration lawyers charge $1,500–3,000 for full representation.",
    ],
    lawyerTriggers: {
      diy: ["Standard USC spouse petition with clear marriage, no immigration complications"],
      getALawyer: ["Petitioner has prior I-130 petitions (refused or withdrawn)", "Beneficiary has prior US overstay or immigration violation", "Marriage entered shortly after a previous beneficiary was denied — fraud presumption risk", "Vietnamese divorce decree from prior marriage — recognition complications"],
    },
  },

  "ID:US:work": {
    whatCarriesWeight: [
      { label: "Employer-sponsored category (H-1B, L-1, O-1, E-2)", why: "Indonesia has no E-3 (Australia/Singapore-only) or H-1B1 (Chile/Singapore) treaty preferences. Standard H-1B cap lottery applies. L-1 intracompany transfer is common for Jakarta/Singapore-based multinationals." },
      { label: "Indonesia-based employer's US footprint (for L-1)", why: "L-1A (executive/manager) and L-1B (specialised knowledge) require 1+ year continuous employment with the Indonesian entity, and a US qualifying organisation (parent/subsidiary/affiliate)." },
      { label: "E-2 treaty investor (limited availability)", why: "Indonesia has an E-2 treaty with the US (1989 Treaty of Amity), making Indonesian nationals eligible for E-2 investor and treaty-employee visas with substantial investment in a US enterprise." },
      { label: "Jakarta consulate processing", why: "B/F/J/H/L processing at the Jakarta embassy runs 6-16 weeks depending on category. Surabaya processes limited categories. Plan US start date with at least 6 weeks of buffer." },
    ],
    personalStatementTemplate: [
      { heading: "Your role and the petitioning employer", prompt: "Title, industry, employer size, your direct hiring chain. For L-1, document 1+ year of employment with the Indonesian qualifying organisation." },
      { heading: "Educational background and credential evaluation", prompt: "Indonesian degrees often need WES or ECE evaluation establishing US equivalency. Cite the evaluation reference number." },
      { heading: "Why the US role and project", prompt: "Specific team, project, technology. For L-1, the role-equivalence test matters — show your Indonesian role and US role are at the same executive/managerial or specialised-knowledge level." },
      { heading: "Long-term intent", prompt: "L-1A holders can pursue EB-1C green card (no per-country quota). L-1B and H-1B holders typically EB-2 / EB-3." },
    ],
    moneySavingTips: [
      "If your employer is Indonesia-based and has a US office, L-1 (no cap, no lottery) is often faster and more reliable than H-1B.",
      "E-2 treaty investor visa requires substantial investment — generally $100k+ in a US enterprise actively operated. Don't pursue unless you have genuine capital and a business plan.",
      "Indonesian nationals are not subject to the country-cap on employment-based green cards — EB-2 / EB-3 timelines are 'current' or near-current, vastly faster than Indian / Chinese applicants.",
    ],
    lawyerTriggers: {
      diy: ["Standard L-1 transfer with a large Indonesian-headquartered MNC sponsor (immigration team handles end-to-end)"],
      getALawyer: ["E-2 treaty investor (legal structure and capital documentation is rigorous)", "Self-petitioning O-1 (extraordinary ability)", "Prior US visa refusal or overstay"],
    },
  },

  "MY:US:work": {
    whatCarriesWeight: [
      { label: "H-1B cap-subject lottery + Malaysian-specific timing", why: "Standard H-1B lottery. Malaysian nationals benefit from no country-cap on EB-2 / EB-3 green-card progression — EB-2 is currently 'current' or near-current for Malaysia, vastly faster than India/China timelines." },
      { label: "L-1 intracompany transfer (common pathway)", why: "Many Malaysia-based multinationals (Petronas, Maybank, Genting, plus US/EU MNCs with KL/Penang ops) use L-1 for US transfers. 1+ year continuous employment with qualifying organisation required." },
      { label: "TN-equivalent absent", why: "Unlike Canadians/Mexicans (TN treaty visa), Malaysian nationals have no expedited treaty work visa. Standard H-1B/L-1/O-1/E-2 paths." },
      { label: "Kuala Lumpur consulate processing", why: "Interview waits at KL run 1-4 weeks for most categories — among the shortest in the region. Penang has no full-service consulate (use KL)." },
    ],
    personalStatementTemplate: [
      { heading: "Your role and US employer", prompt: "Title, industry, employer size, hiring chain. For L-1, document the Malaysian qualifying employer relationship." },
      { heading: "Education and credential evaluation", prompt: "Malaysian degrees (BSc, MSc) typically map cleanly to US equivalents via WES. Cite the evaluation reference." },
      { heading: "Why this opportunity", prompt: "Specific role, project, team — avoid generic 'better career' framing." },
      { heading: "Green-card pathway intent", prompt: "Malaysian nationals enjoy current EB-2 / EB-3 priority dates, so honest mention of long-term immigrant intent doesn't disadvantage you (H-1B and L-1 are dual-intent visas)." },
    ],
    moneySavingTips: [
      "Malaysia's English-language proficiency means no IELTS/TOEFL required for most US employer-sponsored cases — saves $250+ and weeks.",
      "Malaysian nationals enjoy current EB-2 / EB-3 priority dates — file I-140 and adjust status concurrently if eligible (saves 12-24 months over staged filing).",
      "Don't bundle consultant fees — KL has reputable immigration lawyers charging $1,500-3,000 for end-to-end H-1B/L-1 representation. Avoid 'agencies' charging $5,000+.",
    ],
    lawyerTriggers: {
      diy: ["Standard H-1B with large US employer; immigration team manages entire process"],
      getALawyer: ["Self-petitioning O-1 / EB-1A (extraordinary ability claim)", "E-2 investor (Malaysia is an E-2 treaty country — substantial investment route)", "Prior US visa refusal"],
    },
  },

  "MY:US:study": {
    whatCarriesWeight: [
      { label: "I-20 from a SEVP-certified school", why: "F-1 student visa requires I-20 from an accredited US institution. Top-tier universities issue I-20 within days of tuition deposit; community colleges and language schools issue within weeks." },
      { label: "Financial capacity (typically 1 year tuition + living)", why: "Bank statements showing the first year's tuition + ~$20-30k living expenses for non-spouse dependents. Funding from parents or scholarships is fine — document the source." },
      { label: "Genuine non-immigrant intent (Section 214(b))", why: "Malaysian first-time student applicants typically pass the 214(b) test cleanly — strong family/property ties + clear graduation-and-return narrative. Refusal rates are below the regional baseline." },
      { label: "Course alignment with prior study and career intent", why: "DS-160 application asks for major, degree level, intended career. Vague answers ('exploring options') trigger 214(b) refusal." },
    ],
    personalStatementTemplate: [
      { heading: "Your educational background and current status", prompt: "Current institution, GPA, expected graduation. For pre-university applicants, SPM or A-Level results." },
      { heading: "Why this US programme", prompt: "Specific programme, faculty, research opportunity, courses. Show you researched beyond rankings." },
      { heading: "How it fits your career plan", prompt: "Where does this degree fit in your Malaysian career trajectory? Be specific about returning to a specific industry, employer, or family business." },
      { heading: "Financial capacity", prompt: "Source of funding — parents, scholarship, savings. Document with bank statements and parent employment letters." },
    ],
    moneySavingTips: [
      "Top US universities offer need-based aid to international students (Harvard, Princeton, Yale, MIT, Amherst, Wellesley) — apply for aid as part of admissions, not separately.",
      "Scholarship from JPA (Public Service Department), Yayasan Khazanah, MARA, Petronas often covers tuition + living + flights. Bond requirement applies (must return to Malaysia for X years post-graduation).",
      "OPT (Optional Practical Training) gives 12 months post-graduation work eligibility, plus 24 months for STEM degrees (36 months total for STEM grads). Plan around this for graduate employability.",
      "F-1 SEVIS fee ($350) + visa fee ($185) = $535 total US-government fees. Total cost beyond that = embassy interview travel + photos + medical (rarely required). Don't pay 'agencies' more than $200 for application support.",
    ],
    lawyerTriggers: {
      diy: ["First-time F-1 to a SEVP-certified institution with clear financial sponsorship", "F-1 renewal with continued enrolment in good standing"],
      getALawyer: ["Prior F-1 refusal under 214(b) — re-applications need careful reframing", "Status change from F-1 to H-1B / OPT-to-H-1B cap gap timing", "Prior US visa fraud or overstay"],
    },
  },

  "TH:US:work": {
    whatCarriesWeight: [
      { label: "H-1B / L-1 / E-2 standard categories", why: "Thailand-US has an E-2 treaty (1968 Treaty of Amity), making Thai nationals eligible for E-2 investor visas. Standard H-1B/L-1 paths apply otherwise. Thai nationals enjoy current EB-2/EB-3 priority dates — no country-cap backlog." },
      { label: "Bangkok consulate processing", why: "Interview waits at Bangkok are typically 2-8 weeks for B/F/J/H/L categories. Chiang Mai has limited categories; default to Bangkok." },
      { label: "Thai degree credential evaluation", why: "Thai bachelor's and master's typically map cleanly via WES. Some Thai universities (Chulalongkorn, Mahidol, Thammasat) are well-recognised by USCIS." },
      { label: "Employer-sponsorship documentation", why: "Strong employer record matters more than nationality for H-1B/L-1 success. Big Tech, Fortune 500, and large engineering/consulting firms have clean records." },
    ],
    personalStatementTemplate: [
      { heading: "Role, employer, and team", prompt: "Specific title, US office location, hiring manager. For L-1, document Thai qualifying-organisation employment ≥1 year." },
      { heading: "Education and credentials", prompt: "Thai or international degree, WES/ECE evaluation if Thai-issued, professional certifications relevant to role." },
      { heading: "Why this US role specifically", prompt: "Project, technology stack, team — avoid generic career-advancement framing." },
      { heading: "Long-term plans", prompt: "Honest about EB-2 / EB-3 progression if you intend it; both H-1B and L-1 are dual-intent visas." },
    ],
    moneySavingTips: [
      "Thai E-2 treaty visa option for substantial US investment (typically $100k+ in a real business) — no annual cap, renewable indefinitely, spouse can work.",
      "Thai nationals' EB-2 / EB-3 priority dates are current — file I-140 + I-485 concurrently if already in US on H-1B/L-1.",
      "Skip 'visa agencies' in Bangkok charging $3,000+ — reputable US-licensed immigration lawyers in Bangkok cost $1,500-3,000 for end-to-end work-visa representation.",
    ],
    lawyerTriggers: {
      diy: ["Standard L-1 transfer with large Thai-based MNC; in-house immigration handles end-to-end"],
      getALawyer: ["E-2 treaty investor visa (capital structure and business plan documentation rigorous)", "Self-petitioning O-1 / EB-1A", "Prior US refusal"],
    },
  },

  "TH:US:family": {
    whatCarriesWeight: [
      { label: "Petitioner status and category timing", why: "USC-petitioned spouse (IR/CR, 12-18 mo) or minor child (IR-2) clears fastest. F-class wait times for Thailand are typically 2-7 years depending on category. F4 sibling current wait: 15+ years." },
      { label: "Marriage bona-fides for spouse cases", why: "Thai-American spousal petitions get standard USCIS scrutiny. Strong evidence: relationship-development timeline, photos, joint finances, family integration." },
      { label: "Thai marriage registration", why: "Marriages registered at the local Amphoe (district office) are accepted. Religious-only ceremonies without civil registration don't qualify for US immigration. Translate the marriage certificate via a court-approved translator." },
      { label: "I-864 sponsor income ≥125% federal poverty threshold", why: "Petitioner shows income via tax transcripts + W-2. Joint sponsor available where petitioner alone doesn't qualify." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship history", prompt: "How and where you met, courtship, engagement, marriage. Document photos and shared experiences." },
      { heading: "In-person visits", prompt: "Each visit with dates, passport stamps, supporting evidence." },
      { heading: "Living arrangements and plans", prompt: "Where you'll settle in the US — city, employer, housing, schools (if children)." },
    ],
    moneySavingTips: [
      "Document translations via court-approved Thai translators (~THB 500-1,000/page) are USCIS-accepted. 'International certified' services charging 5× more add nothing legally.",
      "Bangkok panel physicians charge ~THB 8,000-12,000 for the immigrant visa medical exam — see the embassy's approved list, not 'recommended' clinics charging double.",
      "K-1 fiancé(e) visa for unmarried couples: $535 I-129F + $265 visa fee + medical + post-arrival AOS $1,440 = ~$2,500 total official cost. Don't pay agencies more than $1,500 in legal fees.",
    ],
    lawyerTriggers: {
      diy: ["Standard USC-spouse petition with clean marriage and immigration history"],
      getALawyer: ["Prior I-130 petitions (refused or withdrawn)", "Beneficiary's prior US overstay or immigration violation", "Polygamous marriage history (Thailand recognises only monogamous marriage for visa purposes)"],
    },
  },

  // ─── South Asia → CA ───
  "PK:CA:work": {
    whatCarriesWeight: [
      { label: "Express Entry CRS score + LMIA-supported job offer", why: "Pakistani nationals with bachelor's + IELTS 7+ + 3+ years skilled experience typically score 400-450 CRS without job offer. LMIA-supported job offer adds 50-200 points depending on occupation TEER level. Recent CRS draws have hovered 480-540 — most Pakistani applicants need an LMIA boost or PNP nomination." },
      { label: "WES Educational Credential Assessment", why: "Pakistani degrees evaluated by WES (Canada-recognised) — submit transcripts via HEC-attested mailing. Processing 4-12 weeks. Higher Education Commission attestation is essential for WES recognition." },
      { label: "IELTS General Training band scores", why: "CLB 9 (IELTS 7.0 listening / 6.0 reading / 7.0 writing / 7.0 speaking on the GT scale) optimises CRS — each band increase translates to substantial CRS gain." },
      { label: "Police certificates from every country lived in 6+ months", why: "Pakistan PCC via NADRA; for any UAE/Saudi/UK/elsewhere residence, separate police clearances. Allow 4-12 weeks for Pakistan PCC." },
    ],
    personalStatementTemplate: [
      { heading: "Your skilled-occupation profile", prompt: "NOC code (TEER 0/1/2/3 eligible for Express Entry FSW), years of experience, professional registration (PEC for engineers, PMDC for doctors)." },
      { heading: "Education and credential assessment", prompt: "Degree, institution, HEC attestation, WES ECA reference number." },
      { heading: "Language test results", prompt: "IELTS General Training band scores per skill. If aiming for French bonus points, TEF/TCF results." },
      { heading: "Settlement plan", prompt: "Province, city, employment search strategy, settlement funds." },
    ],
    moneySavingTips: [
      "Pakistani candidates: maximise CRS via spouse's profile too. Spousal education + language can add 40 points.",
      "Provincial Nominee Programs (Saskatchewan SINP, Alberta AAIP, Manitoba MPNP) often have lower CRS thresholds and dedicated draws for Pakistani-occupation profiles.",
      "Don't pay immigration consultants in Islamabad/Karachi $5,000+ — Express Entry is self-serve via canada.ca. CICC-licensed consultants in Canada charge CAD$2,500-5,000 for full representation if you need it.",
      "Settlement funds: CAD$13,757 (single) or CAD$17,127 (couple) as of 2024. Show liquid funds in your name 6+ months pre-application.",
    ],
    lawyerTriggers: {
      diy: ["Clean Express Entry profile with strong CRS, no immigration history complications"],
      getALawyer: ["Past refusal from Canada, US, UK, AU (shared character data systems)", "Pakistani military service requiring extra documentation", "Inadmissibility concerns (criminal, medical, security)", "LMIA challenges from a small employer"],
    },
  },

  "PK:CA:family": {
    whatCarriesWeight: [
      { label: "Sponsor's status (Canadian citizen vs PR)", why: "PR sponsors must live in Canada when sponsoring; citizens may sponsor from abroad. Sponsor must not have received social assistance (non-disability) in prior 12 months, must not be in default on a previous sponsorship undertaking." },
      { label: "Marriage / common-law genuineness", why: "IRCC scrutinises Pakistani-Canadian marriages for arranged-marriage fraud risk (especially short courtship + immediate sponsorship pattern). Strong evidence: extended courtship, in-person visits, family involvement, photo evidence across time, marriage ceremony evidence." },
      { label: "Pakistan NADRA-issued documents", why: "Computerised National Identity Card (CNIC), Nikahnama (Pakistani marriage certificate), and B-Form (birth certificate) all required. Older Form-B birth certificates must be reissued by NADRA in computerised format." },
      { label: "Sponsor's financial undertaking", why: "Sponsor commits to financial support for 3 years (spouse) / 10 years (parents). No formal income threshold for spousal sponsorship, but income evidence helps establish credible commitment." },
    ],
    personalStatementTemplate: [
      { heading: "How you met and how the relationship developed", prompt: "Timeline: meeting (often via family introduction in Pakistani context — that's fine, document it), courtship (in-person and virtual), engagement, marriage." },
      { heading: "In-person meetings", prompt: "Document each visit with passport stamps and supporting evidence. For arranged marriages, document family meetings, jirga, walima." },
      { heading: "Communication during separation", prompt: "WhatsApp / video call records, photo timelines, gift records." },
      { heading: "Plans for Canada", prompt: "Where you'll settle, sponsor's employment, housing arrangements, beneficiary's career plans." },
    ],
    moneySavingTips: [
      "Document translations via translator certified by ATIO (Ontario), STIBC (BC), or OTTIAQ (Quebec) — IRCC-accepted. Don't pay 'international notarised' services 5× more.",
      "Spousal sponsorship fees: CAD$1,205 (processing) + CAD$85 (biometrics) + CAD$515 (right of permanent residence). Total ~CAD$1,800 per sponsored spouse.",
      "Pakistan PCC via Karachi/Islamabad/Lahore SP Office or via overseas Pakistani consulate — both work; allow 4-12 weeks.",
    ],
    lawyerTriggers: {
      diy: ["Standard spousal sponsorship with extended courtship documentation and clean immigration histories"],
      getALawyer: ["Short courtship + immediate sponsorship (high fraud-presumption risk)", "Sponsor's prior refused sponsorship or default on previous undertaking", "Beneficiary's prior Canadian or other Western refusal", "Polygamous prior marriage in Pakistan — IRCC recognises only one wife"],
    },
  },

  // ─── Australia-bound: PH, NL ───
  "PH:AU:work": {
    whatCarriesWeight: [
      { label: "Subclass 482 (TSS) with Australian-sponsor nomination", why: "Filipino nurses, IT, engineering, accounting and trades are heavily represented in 482. TSMIT ≥ AUD$73,150 from July 2024. Sponsor must be approved Standard Business Sponsor; nomination occupation must be on the Skilled Occupation List with valid skills assessment." },
      { label: "ANMAC / Engineers Australia / Vetassess assessment", why: "Most Filipino-trained professionals (nurses, engineers, allied health) need pre-application skills assessment via the assessing body for their occupation. Allow 4-16 weeks." },
      { label: "AHPRA / state-board registration for healthcare", why: "Filipino-trained nurses go through ANMAC for skills assessment AND NMBA for AHPRA nursing registration. IELTS or OET at the required level (commonly 7.0/350 across skills)." },
      { label: "Police certificates from every country lived 12+ months in past 10 years", why: "Philippine NBI Clearance (NCR or overseas DFA channel) for Philippine residence; PCC from any other country (UAE/Saudi/Singapore common for Filipino diaspora)." },
    ],
    personalStatementTemplate: [
      { heading: "Your nominated role, employer, and ANZSCO occupation", prompt: "Name the Australian business, role, ANZSCO code. Reference the skills assessment outcome if applicable." },
      { heading: "Skills assessment + AHPRA registration (if healthcare)", prompt: "Assessment authority reference number; for healthcare professions, AHPRA progress." },
      { heading: "English-language test results", prompt: "IELTS Academic / OET — required band per occupation (typically 7.0 / 350)." },
      { heading: "Family, dependents, settlement plan", prompt: "Spouse / partner, children, where in Australia (city, school catchment). Subclass 482 dependents may work without restriction." },
    ],
    moneySavingTips: [
      "Filipino-trained nurses: ANMAC + NMBA dual-process can run 8-18 months total. Start both in parallel.",
      "Australia-Philippines reciprocal social security (under SSA) does NOT include Medicare — private health insurance (OVHC) is mandatory.",
      "Skills In Demand (SID) visa replaces TSS in late 2024 with three streams: Specialist Skills (≥AUD$135k), Core Skills (≥AUD$73k), and Essential Skills (regional, lower threshold). Apply under the right stream.",
    ],
    lawyerTriggers: {
      diy: ["Standard Subclass 482 with approved sponsor and clean credentials"],
      getALawyer: ["Sponsor's first-time 482 nomination", "Skills assessment refused or pending appeal", "Prior visa refusal in any country", "Spouse / partner work-rights and dependent-children visa coordination"],
    },
  },

  "NL:AU:work": {
    whatCarriesWeight: [
      { label: "Subclass 482 nomination + Dutch-credential portability", why: "Dutch professional credentials transfer cleanly to Australia in most fields. Engineers via Engineers Australia, accountants via CPA/CAANZ, IT via ACS. TSMIT ≥ AUD$73,150." },
      { label: "Working Holiday Visa for under-31 alternative", why: "Dutch nationals (subclass 462 Work and Holiday) are eligible up to age 30. 12 months work + travel, no specific employer required — useful for testing the market before committing to employer-sponsored route." },
      { label: "Dutch English-language exemption", why: "Dutch nationals from English-medium-degree programmes (Maastricht, Amsterdam, Utrecht) are typically eligible for English-test exemption. Document degree in English." },
      { label: "Health insurance (OVHC required, no Dutch RHCA)", why: "Netherlands does NOT have a Reciprocal Health Care Agreement with Australia — private health insurance (OVHC via Bupa/Medibank/Allianz/NIB/AHM) mandatory for visa compliance." },
    ],
    personalStatementTemplate: [
      { heading: "Nominated role and sponsor", prompt: "Australian employer, ANZSCO occupation, salary level above TSMIT." },
      { heading: "Dutch qualifications and skills assessment", prompt: "Cite Engineers Australia / CPA / CAANZ / ACS / Vetassess outcome and reference number." },
      { heading: "Why Australia", prompt: "Specific industry (resources, agritech, fintech, healthcare). Sydney / Melbourne / Brisbane / Perth — name the city." },
      { heading: "Long-term plans (PR pathway)", prompt: "Subclass 482 to 186 ENS (Employer Nomination Scheme) after 2-3 years for PR — mention honestly." },
    ],
    moneySavingTips: [
      "Dutch nationals: Working Holiday (462) costs AUD$650 and gives 12 months freedom. Use it to test the market before committing to 482.",
      "Dutch English-degree exemption saves IELTS/OET fee (~AUD$400).",
      "Pay for Australia Direct (Telstra/Optus) eSIM pre-arrival — saves the Sydney airport markup.",
    ],
    lawyerTriggers: {
      diy: ["Standard Subclass 482 with approved sponsor and Dutch English-medium degree"],
      getALawyer: ["Self-employed Dutch national setting up Australian operation via own company sponsorship — genuineness test rigorous", "Prior Australian or Dutch immigration refusal"],
    },
  },

  // ─── Iberoamerican framework (Spain via simplified naturalisation route) ───
  "MX:ES:family": {
    whatCarriesWeight: [
      { label: "Spanish residence card via family reunification", why: "Spanish citizen sponsors apply via the EU family member regime (free movement); third-country Mexican spouses of Spanish citizens are entitled to a 5-year EU Family Member residence card." },
      { label: "Iberoamerican simplified naturalisation (2-year rule)", why: "After 2 years of legal residence in Spain, Mexican nationals can apply for Spanish citizenship — vs the standard 10 years for most non-Iberoamerican applicants. This is the single biggest bilateral advantage." },
      { label: "Apostilled Mexican civil documents", why: "Mexican birth, marriage and (if applicable) divorce certificates apostilled per the Hague Apostille Convention. Sworn translation by a traductor jurado registered with the Spanish Ministry of Foreign Affairs." },
      { label: "Background check (Federal + state-level)", why: "Federal Carta de No Antecedentes Penales + state-level antecedentes for each Mexican state where you lived. Apostilled. Issued within the prior 6 months." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship to the Spanish sponsor", prompt: "If marriage: where and when, civil registry reference, prior marriages on either side. If parent/child: blood relationship documentation." },
      { heading: "Living arrangements in Spain", prompt: "Where you'll live (the empadronamiento — local town hall registration — is essential), accommodation evidence, sponsor's income / employment in Spain." },
      { heading: "Mexican legal status of original document set", prompt: "Apostilled civil documents, translation references, originals retained." },
      { heading: "Long-term intent in Spain", prompt: "Honest about pursuing citizenship after 2 years — mention the Iberoamerican framework eligibility." },
    ],
    moneySavingTips: [
      "Mexican apostille issued by SRE (Secretaría de Relaciones Exteriores) for federal documents; state-level by each state's foreign-affairs liaison. ~MXN$300-500 per apostille — don't pay agencies 10× more.",
      "Traductor jurado fees in Madrid run €40-60 per page — cheaper than UK/US-based 'certified translation' services that aren't recognised by Spanish authorities.",
      "Iberoamerican naturalisation requires 2 years of legal residence + DELE A2 Spanish + CCSE constitutional knowledge test (€85). Total citizenship cost: ~€200-400 in tests + legal documents.",
    ],
    lawyerTriggers: {
      diy: ["Standard EU Family Member residence card via Spanish-citizen spouse with apostilled documents"],
      getALawyer: ["Prior Spanish residence-card refusal", "Marriage entered shortly after sponsor obtained Spanish citizenship (fraud-risk presumption)", "Complications with Mexican prior-marriage or divorce documentation"],
    },
  },

  "AR:ES:work": {
    whatCarriesWeight: [
      { label: "Spanish work + residence permit OR digital-nomad visa", why: "Argentine professionals can pursue: (a) Spanish work permit via approved Spanish employer + INSS labour-market test, (b) Highly Qualified Professional visa for senior roles, (c) Digital Nomad Visa for remote workers earning €2,762+/mo from non-Spanish clients. Each has distinct documentation." },
      { label: "Iberoamerican 2-year naturalisation eligibility", why: "Argentine nationals qualify for Spanish citizenship after 2 years of legal residence — vastly faster than the standard 10-year track. Big differentiator vs other Latin American Spanish-speaking applicants." },
      { label: "Argentine apostille (RA Foreign Ministry)", why: "Argentine federal documents apostilled by Ministerio de Relaciones Exteriores. Educational documents need legalisation through the Ministry of Education before apostille." },
      { label: "Spanish criminal record + Argentine antecedentes penales", why: "Both required, both apostilled, both translated by traductor jurado. Antecedentes penales argentinos via Registro Nacional de Reincidencia." },
    ],
    personalStatementTemplate: [
      { heading: "Your professional profile + Spanish employer (if applicable)", prompt: "For employer-sponsored: name the Spanish company, role, salary. For DNV: name your non-Spanish clients/employer and projected income." },
      { heading: "Argentine educational + professional credentials", prompt: "Degree, institution, professional registration if applicable (matrícula). Apostilled diploma + transcripts." },
      { heading: "Why Spain", prompt: "Specific city, sector, network. The DNV is popular for Madrid / Barcelona / Valencia / Málaga remote workers." },
      { heading: "Long-term Iberoamerican citizenship intent", prompt: "Honest about pursuing the 2-year naturalisation route — Argentine eligibility is a feature, not a flag." },
    ],
    moneySavingTips: [
      "Argentine apostille: ARS 2,000-5,000 per document (vastly cheaper than Spain-based 'international apostille services').",
      "DNV avoids Spanish income tax on foreign-sourced income for the first 4 years under the Beckham Law — significant savings for high earners.",
      "Spanish DELE A2 exam (~€85) + CCSE test (~€85) is the full naturalisation language/civics burden. Total citizenship application cost: ~€200-300.",
    ],
    lawyerTriggers: {
      diy: ["DNV with clean income evidence and Argentine apostilled documents", "EU Family Member route via Spanish-citizen spouse"],
      getALawyer: ["Employer-sponsored work permit (INSS labour-market test is rigorous)", "Prior Spanish residence-card refusal", "Complex Argentine corporate ownership structure for entrepreneur/investor route"],
    },
  },

  "BR:ES:work": {
    whatCarriesWeight: [
      { label: "CPLP framework + Iberoamerican 2-year naturalisation", why: "Brazilian nationals enjoy BOTH the Iberoamerican 2-year naturalisation framework (Spain) AND streamlined Portuguese citizenship via CPLP. The Spain route is faster for citizenship; the Portugal route is faster for residence." },
      { label: "Spanish work permit OR Digital Nomad Visa", why: "Same paths as other Latin American applicants — employer-sponsored work, Highly Qualified Professional, or DNV (€2,762+/mo from foreign clients). Brazilian Portuguese-speakers find Madrid / Barcelona / Valencia particularly welcoming." },
      { label: "Brazilian apostille via Itamaraty cartórios", why: "Brazil joined the Hague Apostille Convention in 2016. Apostille via authorised cartórios (notary offices) — much faster than the old consular legalisation route." },
      { label: "Antecedentes criminais (federal + state)", why: "Brazilian federal Polícia Federal background check + state-level estadual checks for each state of residence. Both apostilled and translated by traductor jurado in Spain." },
    ],
    personalStatementTemplate: [
      { heading: "Your professional profile + Spanish employer or DNV income", prompt: "Same as AR:ES:work pattern — Spanish company + salary, OR non-Spanish clients + monthly income." },
      { heading: "Brazilian educational credentials", prompt: "Diploma, institution, professional registration (CREA for engineers, OAB for lawyers, CRM for doctors). Apostilled." },
      { heading: "Why Spain over Portugal", prompt: "If pursuing the Spain route specifically, mention the Iberoamerican 2-year vs CPLP routes. Spanish-language ability is generally easier transfer than Portuguese-from-Brazilian to European Portuguese." },
      { heading: "Long-term Iberoamerican naturalisation intent", prompt: "Brazilian eligibility for 2-year naturalisation is a feature; mention it." },
    ],
    moneySavingTips: [
      "Brazilian apostille via cartórios in São Paulo / Rio costs BRL 50-150 per document — orders of magnitude cheaper than Spain-based apostille intermediaries.",
      "Spanish Beckham Law (DNV-eligible) caps tax at 24% for first 4 years on foreign-sourced income — significant savings for high-earner Brazilian remote workers.",
      "DELE B1 Spanish exam (~€110) + CCSE (~€85) = full naturalisation language/civics requirement. Brazilian Portuguese-speakers typically pass DELE B1 with 3-6 months of focused study.",
    ],
    lawyerTriggers: {
      diy: ["DNV with clean Brazilian apostilled documents", "EU Family Member via Spanish-citizen spouse"],
      getALawyer: ["Employer-sponsored permit with Spanish company (labour-market test scrutiny)", "Complex Brazilian corporate structure (LTDA / SA shareholding) for entrepreneur route", "Prior Spanish residence-card refusal"],
    },
  },

  // ─── CPLP framework (Portugal-bound Lusophone) ───
  "BR:PT:work": {
    whatCarriesWeight: [
      { label: "CPLP Mobility Agreement framework", why: "Brazilian nationals are CPLP citizens — entitled to streamlined Portuguese residence under the 2021 CPLP Mobility Agreement. Application via SEF; no Schengen visa pre-required." },
      { label: "Portuguese employer contract OR business registration", why: "For employer-sponsored work permit: Portuguese employment contract registered with the Tax Authority + Social Security registration. For self-employed: activity registration (CAE code) + business plan." },
      { label: "Brazilian apostilled diploma + Portuguese degree-recognition", why: "Brazilian degrees recognised in Portugal via DGES (Direção-Geral do Ensino Superior). Apostille required. Some professions (medicine, law, engineering) need additional professional-body registration." },
      { label: "Brazilian antecedentes criminais (federal + state) apostilled", why: "Polícia Federal + state-level estadual checks, apostilled, translated by translator registered with Portuguese notary." },
    ],
    personalStatementTemplate: [
      { heading: "Your role and Portuguese employer or business", prompt: "Portuguese employer + role + salary, OR self-employed activity registration + business plan." },
      { heading: "Brazilian credentials + DGES recognition", prompt: "Diploma, institution, DGES recognition reference number if obtained." },
      { heading: "CPLP framework citation", prompt: "Mention CPLP citizenship and the 2021 Mobility Agreement explicitly — Portuguese consular officials are familiar with the framework." },
      { heading: "Long-term intent", prompt: "CPLP citizens qualify for Portuguese citizenship after 5 years of residence (same as standard route, but with language-test exemption — Portuguese-from-Brazil is recognised)." },
    ],
    moneySavingTips: [
      "CPLP-framework residence permit avoids the standard Schengen visa pre-requirement — apply directly at the Portuguese consulate or SEF on arrival under CPLP rules.",
      "Brazilian Portuguese-speakers are exempt from the A2 Portuguese language test for citizenship — significant time/cost saving over 5 years.",
      "Brazilian apostille via cartórios costs BRL 50-150. Avoid 'international document services' charging 10× more.",
    ],
    lawyerTriggers: {
      diy: ["Standard CPLP-framework residence with Portuguese employer and Brazilian apostilled documents"],
      getALawyer: ["Self-employment registration with complex Brazilian-corporate ownership", "Prior Schengen visa refusal in any member state", "Family-reunification cases with complex Brazilian civil-status documents"],
    },
  },

  "AO:PT:work": {
    whatCarriesWeight: [
      { label: "CPLP Mobility Agreement framework", why: "Angolan nationals are CPLP citizens — entitled to streamlined Portuguese residence under the 2021 framework. Same shape as Brazil → Portugal but with less consular routinisation, so documentation rigour matters more." },
      { label: "Angolan apostille OR consular legalisation", why: "Angola joined the Hague Apostille Convention in 2020 — most Angolan civil documents now eligible for apostille via the Ministry of External Relations. Older documents may need consular legalisation." },
      { label: "Portuguese employer contract + Social Security registration", why: "Standard work-permit documentation: Portuguese employer's contract registered with Tax Authority + Social Security. Angolan-Portuguese sectors: oil/gas, construction, healthcare." },
      { label: "Angolan certidão de registo criminal", why: "Issued by the Provincial Office of the Identification Service (Ministério da Justiça e dos Direitos Humanos). Apostilled. Allow 4-12 weeks." },
    ],
    personalStatementTemplate: [
      { heading: "Your professional profile + Portuguese employer", prompt: "Role, Portuguese company, sector, salary." },
      { heading: "Angolan credentials + DGES recognition", prompt: "Diploma, institution, DGES recognition (essential for regulated professions)." },
      { heading: "CPLP framework eligibility", prompt: "Cite CPLP citizenship and 2021 Mobility Agreement explicitly." },
      { heading: "Family ties in Portugal", prompt: "Angolan diaspora in Lisbon / Porto / Setúbal is substantial — mention family or community ties." },
    ],
    moneySavingTips: [
      "CPLP-framework residence avoids the standard Schengen visa pre-requirement.",
      "Angolan Portuguese-speakers exempt from A2 Portuguese language test for citizenship.",
      "Most Lisbon-based immigration lawyers serving the Angolan-Portuguese community charge €500-1,200 for end-to-end residence-permit representation; avoid 'agencies' quoting €3,000+.",
    ],
    lawyerTriggers: {
      diy: ["Standard CPLP-framework residence with Portuguese employer and clean documents"],
      getALawyer: ["Investment / self-employment registration", "Complex Angolan civil-status documents (older marriages without modern registration)", "Prior Schengen refusal"],
    },
  },

  // ─── Outbound US: Portugal, Spain, Mexico, Costa Rica, Panama (DNV / D7 / retirement) ───
  "US:PT:work": {
    whatCarriesWeight: [
      { label: "D8 Digital Nomad Visa OR D7 Passive Income Visa", why: "US remote workers earning ≥ €3,480/mo from non-Portuguese sources qualify for the D8 Digital Nomad Visa (1-year + renewable). Retirees / passive-income earners with ≥ €820/mo (+30% per dependent) qualify for D7. Both lead to Portuguese citizenship after 5 years." },
      { label: "Foreign-source income documentation", why: "12 months of bank statements showing consistent foreign-source income at or above the threshold. For employer remote work: employment contract + paystubs. For freelance / self-employed: invoices + contracts." },
      { label: "Portuguese tax-residence (NIF) + Portuguese bank account", why: "Apply for NIF via a Portuguese tax-representative before the visa application. Open a Portuguese bank account and deposit 12 months' minimum income (~€10-40k depending on visa type)." },
      { label: "Portuguese health insurance + accommodation evidence", why: "Mandatory health insurance covering Portugal (or proof of SNS enrolment eligibility). Accommodation evidence: 12-month rental contract OR property purchase deed OR Airbnb 12-month booking." },
    ],
    personalStatementTemplate: [
      { heading: "Why Portugal specifically", prompt: "City you'll settle in (Lisbon, Porto, Algarve, Madeira), specific reasons (lifestyle, cost, climate, language opportunities, EU access)." },
      { heading: "Your income source and stability", prompt: "Employer or clients, contract duration, income consistency. Show this is genuine remote work, not a Portuguese-employment workaround." },
      { heading: "Your long-term plan", prompt: "5-year path to citizenship via residence + A2 Portuguese + clean record. Mention honestly — Portugal welcomes long-term commitment." },
      { heading: "Family and dependents", prompt: "Spouse / partner / children joining? Document school plans if children." },
    ],
    moneySavingTips: [
      "NHR (Non-Habitual Resident) tax regime was phased out for new applicants in 2024 — replaced by IFICI (limited to specific high-skilled categories). Don't plan around NHR if applying fresh.",
      "Portuguese tax-residence triggers worldwide income reporting — US-Portugal tax treaty avoids double taxation but FATCA and FBAR filings continue. Talk to a US-PT cross-border tax professional.",
      "Don't pay for 'fast-track D7' services charging €5,000-10,000 — application via Portuguese consulate (Boston, NYC, SF, DC) costs €90 + supporting documents. Reputable Lisbon immigration lawyers charge €1,500-3,000 for end-to-end work.",
      "Renew the D8/D7 ON TIME — overstays cost subsequent residence-card processing and reset the 5-year citizenship clock.",
    ],
    lawyerTriggers: {
      diy: ["D8 with clean foreign-source income evidence and NIF / Portuguese bank account set up via remote service"],
      getALawyer: ["D2 entrepreneur visa (business plan and capital documentation rigorous)", "Self-employed structures using US-LLC ownership", "Prior Schengen refusal anywhere", "Complex US tax-residency or expatriation status"],
    },
  },

  "US:ES:work": {
    whatCarriesWeight: [
      { label: "Digital Nomad Visa OR Highly Qualified Professional visa", why: "US remote workers with €2,762+/mo foreign-source income qualify for the Spanish Digital Nomad Visa (1-year renewable to 3-year residence card). Senior professionals with a Spanish employer offer at executive-level salary qualify for the Highly Qualified Professional visa (faster track)." },
      { label: "Beckham Law tax regime eligibility", why: "DNV holders qualify for the Beckham Law regime — 24% flat tax on Spanish-source income up to €600k for the first 4 years (vs the standard progressive rate up to 47%). Significant savings for high earners." },
      { label: "Foreign-source income documentation", why: "12-month income evidence at or above DNV threshold. Employment contract + paystubs (W-2) OR self-employment evidence + bank statements." },
      { label: "Spanish criminal record (Spain itself if previously resident) + US FBI background check", why: "FBI background check via fingerprinting + apostille (US Department of State). Spanish criminal record only if previously Spanish-resident." },
    ],
    personalStatementTemplate: [
      { heading: "Why Spain", prompt: "City (Madrid, Barcelona, Valencia, Málaga, Bilbao), specific reasons. Spanish-language ability if any." },
      { heading: "Your remote-work setup", prompt: "Employer / clients, contract evidence, monthly income above the threshold. Show genuine remote work — Spanish authorities scrutinise DNV for Spanish-employment workarounds." },
      { heading: "Long-term plans (5-year residence)", prompt: "DNV renewals lead to permanent residence after 5 years. Mention long-term commitment." },
      { heading: "Family and dependents", prompt: "Spouse / partner / children — DNV includes dependents." },
    ],
    moneySavingTips: [
      "Beckham Law tax election must be made within 6 months of becoming Spanish tax-resident — don't miss the window.",
      "US-Spain tax treaty avoids double taxation; US FBAR and FATCA filings continue. A US-Spain cross-border CPA is worth €500-1,500 in the first year.",
      "FBI background check + apostille: ~$50 + processing time 8-14 weeks via standard mail (or ~$100 + 1-2 weeks via expedited channeler). Don't pay 'agencies' more than $200 for the support.",
      "Madrid / Barcelona DNV consular processing 1-3 months. Apply from US before relocating to avoid in-Spain processing complexity.",
    ],
    lawyerTriggers: {
      diy: ["DNV with W-2 + paystubs from a stable US employer, clean US background check, no Spanish residency history"],
      getALawyer: ["Self-employment with complex US-LLC ownership or partnerships", "Prior Spanish residency-card refusal", "Family-reunification cases with prior marriages requiring Spanish recognition"],
    },
  },

  "US:MX:work": {
    whatCarriesWeight: [
      { label: "Temporary Resident visa OR Permanent Resident visa", why: "US nationals can apply for: (a) Temporary Resident at a Mexican consulate showing monthly income ~$3,000-4,000 OR savings ~$50-70k (varies by consulate); (b) Permanent Resident with higher financial thresholds. Both grant Mexican residence with work rights." },
      { label: "Mexican consulate selection (varies by income threshold)", why: "Income thresholds and document requirements vary significantly by consulate. Generally: Houston / Dallas / San Diego / LA consulates have higher published thresholds than smaller US consulates. Some applicants travel to favoured consulates." },
      { label: "Bank statements demonstrating consistent income or savings", why: "12 months of bank statements; for income: $3-4k/mo consistent; for savings: $50-70k+ liquid. Quality documentation matters — random one-off deposits flagged." },
      { label: "Mexican residence-card finalisation at INM in Mexico", why: "Initial visa is issued by consulate; once in Mexico (typically within 180 days of issuance), finalise at INM (Instituto Nacional de Migración) within 30 days of entry." },
    ],
    personalStatementTemplate: [
      { heading: "Why Mexico", prompt: "Specific city (Mexico City, Mérida, San Miguel de Allende, Puerto Vallarta, Querétaro), purpose (remote work, retirement, business, family)." },
      { heading: "Your income source", prompt: "Employer, client base, or pension. Document 12-month consistency at or above consulate threshold." },
      { heading: "Mexican ties (if any) — family, property, prior travel", prompt: "Existing Mexican family, property purchases, business interests." },
      { heading: "Long-term plan", prompt: "Temporary Resident → Permanent Resident after 4 years → Mexican citizenship after 5 years total." },
    ],
    moneySavingTips: [
      "Mexican consulate income thresholds are PUBLISHED but enforced inconsistently — check the specific consulate's website AND call ahead. Houston: ~$2,800/mo; LA: ~$3,400/mo; DC: ~$3,000/mo (2024 figures).",
      "Don't show up to consulate without an appointment — many consulates require online MX-Consul appointment booking, sometimes 4-12 weeks ahead.",
      "Total cost: Mexican consulate visa fee ~$48 + Mexican residence card after entry ~MXN $5,000-7,500 ($300-450). Total ~$400-500 in government fees per applicant.",
      "USMCA business travel under the T-classification doesn't require this visa — for short business trips, FMM tourist permit (free) and USMCA business categorisation suffice.",
    ],
    lawyerTriggers: {
      diy: ["Temporary Resident application with clean income evidence and consulate-published threshold met"],
      getALawyer: ["Permanent Resident direct (higher financial thresholds and consulate discretion)", "Investor / entrepreneur route requiring Mexican corporate structure", "Prior Mexican deportation or immigration violations"],
    },
  },

  "US:CR:family": {
    whatCarriesWeight: [
      { label: "Rentista / Pensionado / Inversionista residence categories", why: "US nationals settling in Costa Rica typically pursue: Rentista (US$2,500+/mo passive income for 2 years), Pensionado (US$1,000+/mo lifetime pension), or Inversionista (US$150k+ investment in Costa Rica). Each grants temporary residence renewable to permanent." },
      { label: "Marriage to Costa Rican citizen (Vinculo)", why: "Spouses of Costa Rican citizens apply via Vinculo con Costarricense — fastest residence path (provisional residence immediately, permanent residence after 1 year + Spanish A2 test for citizenship after 2 years)." },
      { label: "Apostilled US documents (FBI background, marriage, birth)", why: "FBI background check + apostille via US Department of State. Marriage / birth certificates apostilled by issuing US state. Spanish translations by Costa Rican-accredited translator." },
      { label: "Caja CCSS (public health insurance) enrolment", why: "Costa Rican residence requires enrolment in the Caja Costarricense de Seguro Social — mandatory monthly contribution based on income tier (~$50-300/mo)." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship to the Costa Rican sponsor (if family route)", prompt: "Marriage details, dates, civil registry reference. For child sponsorship by Costa Rican parent: birth records." },
      { heading: "Settlement plan", prompt: "City (San José, Tamarindo, Atenas, Escazú, Heredia), housing arrangement, healthcare plan." },
      { heading: "Income / pension / investment evidence", prompt: "12-month documentation at or above the category threshold." },
      { heading: "Long-term intent", prompt: "Permanent residence after 3 years (Rentista/Pensionado/Inversionista) or 1 year (Vinculo spouse). Costa Rican citizenship after 7 years (5 for Latin Americans + Spaniards) — Vinculo spouses qualify after 2 years." },
    ],
    moneySavingTips: [
      "Pensionado is the most accessible category — US Social Security recipients with $1,000+/mo qualify cleanly. Document via SSA award letter.",
      "Caja contribution is income-based — declaring lower legitimate income saves substantially on monthly premiums (but verify with Costa Rican accountant on what's legal to optimise).",
      "FBI background check + apostille: ~$50 fee + 8-14 weeks standard processing OR ~$100 via channeler + 1-2 weeks. Plan ahead.",
      "Don't pay Costa Rican 'residencia agencies' $5,000+ — reputable San José immigration lawyers charge $1,500-3,000 for end-to-end Rentista/Pensionado representation.",
    ],
    lawyerTriggers: {
      diy: ["Pensionado with clean SSA / pension award letter and apostilled documents"],
      getALawyer: ["Inversionista with complex US-Costa Rican corporate ownership", "Prior Costa Rican refusal", "Vinculo with complex US-Costa Rican marriage history"],
    },
  },

  "US:PA:work": {
    whatCarriesWeight: [
      { label: "Friendly Nations visa (US is on the list)", why: "Panama's Friendly Nations Visa covers 52 designated nationalities including US. 2-year provisional residence followed by permanent residence. Requires (a) economic ties: employment OR business OR real-estate purchase, AND (b) clean criminal record." },
      { label: "Real-estate purchase OR Panamanian employment OR business setup", why: "Real estate: $200,000+ property purchase. Employment: Panamanian employment contract. Business: registered Panamanian company with operational activity. The 2021 Friendly Nations reform tightened these criteria." },
      { label: "Apostilled US FBI background + birth / marriage certificates", why: "FBI background check + apostille (US Department of State). Birth/marriage certificates apostilled by issuing state." },
      { label: "Health certificate + bank reference letter", why: "Health certificate from a Panamanian or US doctor (translated and authenticated). Bank reference letter showing financial standing." },
    ],
    personalStatementTemplate: [
      { heading: "Your economic tie to Panama", prompt: "Real-estate purchase, employment, or business — name the property/company/employer specifically." },
      { heading: "Why Panama", prompt: "Specific city (Panama City, Boquete, Coronado, Bocas del Toro). Tax (territorial — no tax on foreign-source income) is a legitimate reason." },
      { heading: "Long-term plan", prompt: "Provisional 2 years → Permanent residence. Panamanian citizenship after 5 years for most; territorial tax remains regardless of citizenship." },
    ],
    moneySavingTips: [
      "Panama's territorial tax regime: no Panamanian tax on foreign-source income. US taxation continues (worldwide for US persons), but Panama-source income tax is minimal for residents with foreign income only.",
      "Panama Friendly Nations real-estate threshold: $200k+ property purchase. Coronado, Boquete and Bocas have qualifying properties under $300k.",
      "Don't pay 'visa fixer' services in Panama City charging $10,000+ — reputable Panamanian immigration lawyers charge $3,000-5,000 for end-to-end Friendly Nations representation.",
      "Bank reference letter from Panamanian bank (Banco General, BAC, Banistmo) is straightforward once you've opened an account — US passport + utility bill from anywhere + initial deposit ~$5,000.",
    ],
    lawyerTriggers: {
      diy: ["Standard Friendly Nations with real-estate purchase and apostilled documents — most Panamanian lawyers handle end-to-end"],
      getALawyer: ["Complex business-setup route", "Prior Panamanian refusal or immigration violation", "Family-reunification with prior divorces requiring Panamanian recognition"],
    },
  },

  // ─── Retirement routes (UK / CA → PT, ES, CR, MX, PA) ───
  "GB:PT:family": {
    whatCarriesWeight: [
      { label: "D7 Passive Income Visa for retirees", why: "UK nationals over standard working age with passive income ≥ €820/mo (+30% per dependent) qualify for the D7. Sources: state pension + private pension + investment income + rental income — combine as needed. Brexit removed UK freedom of movement, so D7 is now the standard retirement route." },
      { label: "Pension / passive-income documentation", why: "12 months of bank statements showing income deposits. UK State Pension award letter from HMRC + private pension provider letters + DWP records. Investment income via accountant statement." },
      { label: "Portuguese tax residence (NIF) + bank account + accommodation", why: "NIF via a Portuguese tax representative. Portuguese bank account with 12 months' minimum income deposited. Accommodation: 12-month rental contract OR property purchase deed." },
      { label: "UK ACRO Police Certificate apostilled", why: "ACRO Police Certificate via UK Government's ACRO Criminal Records Office (~£55, 2-week processing) + apostille by FCDO Legalisation Office. Pre-apostille translation by a Portuguese-registered translator." },
    ],
    personalStatementTemplate: [
      { heading: "Why Portugal", prompt: "Specific area (Algarve / Lisbon / Porto / Madeira). Climate, cost, healthcare, lifestyle reasons." },
      { heading: "Your pension / passive-income setup", prompt: "Detailed breakdown: State Pension + private pensions + investment income. Show consistency over 12 months." },
      { heading: "Healthcare arrangements", prompt: "UK-Portugal S1 form post-Brexit changed — UK retirees in Portugal use private insurance until enrolment in SNS. Document health insurance for transition." },
      { heading: "Long-term plan", prompt: "Permanent residence after 5 years on D7; Portuguese citizenship 5 years (with A2 Portuguese)." },
    ],
    moneySavingTips: [
      "UK State Pension is payable from Portugal at full rate (uprated annually as Portugal has bilateral arrangement). Notify International Pension Centre in Newcastle before relocating.",
      "S1 healthcare entitlement for UK retirees in EU is country-specific post-Brexit — check current rules with NHS Overseas Healthcare Team.",
      "UK-Portugal Double Tax Treaty avoids double taxation on pension income. Most UK pensions taxed in Portugal (residence country) under treaty rules — verify with cross-border accountant.",
      "Don't use NHR tax regime planning — phased out for new applicants in 2024. IFICI replacement is limited to high-skilled categories.",
    ],
    lawyerTriggers: {
      diy: ["D7 with clean UK pension/passive income evidence and standard documents"],
      getALawyer: ["Complex UK SIPP or QROPS pension structures", "Prior Schengen refusal", "Family reunification with prior UK divorces requiring Portuguese recognition"],
    },
  },

  "GB:ES:study": {
    whatCarriesWeight: [
      { label: "Non-Lucrative Visa for retirees (the dominant UK-to-Spain pathway)", why: "UK retirees use Spain's Non-Lucrative Visa (NLV) — passive income ~€2,400/mo (current threshold is 400% of IPREM for the primary applicant + 100% per dependent). Renewable to permanent residence after 5 years. Note: this entry covers the practical study/retiree-relocation route; spousal-family cases are documented separately under GB:ES:family." },
      { label: "Pension / passive-income documentation", why: "UK State Pension award + private pensions + investment income totaling threshold. 12 months of bank statements showing deposits." },
      { label: "Private health insurance covering Spain", why: "NLV requires comprehensive private health insurance — no copays, full coverage. UK private insurers (Bupa Global, Aviva, AXA) and Spanish (Sanitas, Adeslas, DKV) all offer compliant products from ~€100-200/mo per person." },
      { label: "UK ACRO Police Certificate apostilled", why: "Same shape as Portugal route — ACRO Criminal Records Office + FCDO apostille + sworn translation by traductor jurado in Spain." },
    ],
    personalStatementTemplate: [
      { heading: "Why Spain", prompt: "Specific area (Costa del Sol, Costa Blanca, Valencia, Mallorca, Madrid). Climate, healthcare, cost, lifestyle." },
      { heading: "Pension and passive-income setup", prompt: "Breakdown by source — show 12-month consistency at or above NLV threshold." },
      { heading: "Healthcare arrangements", prompt: "NLV requires private health insurance — name the insurer and policy. Post-residence, eligible for state healthcare via convenio especial (~€60-150/mo per person)." },
      { heading: "Long-term plan", prompt: "Permanent residence after 5 years on NLV; Spanish citizenship after 10 years (no Iberoamerican shortcut for UK nationals)." },
    ],
    moneySavingTips: [
      "Beckham Law is NOT available for NLV holders — only for employment-based (DNV, Highly Qualified Professional). Plan UK pension taxation under standard Spanish progressive rates.",
      "UK-Spain Double Tax Treaty allocates pension taxation to residence country (Spain) for most pensions; UK Government Service pensions remain UK-taxed. Talk to UK-Spain cross-border accountant.",
      "Madrid / Barcelona / Málaga consulate NLV processing 1-3 months. Apply from UK before relocating.",
      "S1 healthcare entitlement for UK retirees in Spain post-Brexit is more limited than pre-Brexit — most UK retirees use private insurance ongoing.",
    ],
    lawyerTriggers: {
      diy: ["NLV with clean UK pension evidence and standard documents"],
      getALawyer: ["Complex UK SIPP / QROPS pension structures or investment-property income", "Prior Schengen refusal", "Spanish property purchase with UK-based mortgage"],
    },
  },

  "GB:CR:family": {
    whatCarriesWeight: [
      { label: "Pensionado category for UK retirees", why: "UK retirees with ≥ US$1,000/mo lifetime pension (State Pension counts, private pensions count) qualify for Costa Rican Pensionado residence — 2-year provisional, then 1 year + Spanish A2 test for citizenship after 7 years (5 for Iberoamericans; UK is NOT Iberoamerican so 7 years applies)." },
      { label: "UK State Pension paid abroad rules", why: "UK State Pension paid in Costa Rica is NOT uprated annually (Costa Rica is on the 'frozen' list — same as Canada and Australia for UK pensioners). Plan around fixed pension income rather than annual increases." },
      { label: "Caja CCSS health insurance enrolment", why: "Mandatory monthly contribution to public health insurance based on declared income. Typical retiree monthly contribution: $50-200." },
      { label: "Apostilled UK ACRO + birth / marriage certificates", why: "Same shape as Portugal/Spain routes — ACRO + FCDO apostille + sworn translation by Costa Rican-accredited translator." },
    ],
    personalStatementTemplate: [
      { heading: "Why Costa Rica", prompt: "Specific area (San José, Atenas, Escazú, Tamarindo, Nosara). Climate, cost of living, healthcare, English-speaking expat communities." },
      { heading: "Pension evidence", prompt: "UK State Pension award + private pensions documentation. Document 12-month consistency at or above US$1,000/mo." },
      { heading: "Healthcare arrangements", prompt: "Caja enrolment as Costa Rican resident, supplemented by private insurance for English-speaking care if desired." },
      { heading: "Long-term plan", prompt: "Permanent residence after 3 years on Pensionado; Costa Rican citizenship after 7 years (UK is NOT Iberoamerican)." },
    ],
    moneySavingTips: [
      "UK State Pension frozen in Costa Rica — UK retirees lose out on annual upratings. If state pension is the primary income, this matters over a 20-year retirement.",
      "Caja contribution is income-based — declare lower legitimate income reduces premiums substantially.",
      "Don't pay 'residencia agencies' £3,000+ — Costa Rican lawyers in San José charge $1,500-3,000 for end-to-end Pensionado representation.",
    ],
    lawyerTriggers: {
      diy: ["Pensionado with clean UK State Pension + private pension evidence"],
      getALawyer: ["Investor route ($150k+ investment in Costa Rica)", "Prior Costa Rican refusal or immigration violation"],
    },
  },

  "CA:PT:family": {
    whatCarriesWeight: [
      { label: "D7 Passive Income Visa for Canadian retirees", why: "Canadian retirees with passive income ≥ €820/mo (+30% per dependent) qualify for the D7. Sources: CPP / OAS + private pensions + RRIF / RRSP withdrawals + investment income — combine as needed. Same shape as UK route but Canadian-specific documentation." },
      { label: "RCMP Criminal Record Check apostilled", why: "RCMP CRC via accredited fingerprinting company (typically 3-15 days) + apostille via Global Affairs Canada (~6-12 weeks) + Portuguese consular translation." },
      { label: "Pension / passive-income documentation", why: "CPP + OAS + RRIF / RRSP statements + investment income evidence. 12 months of bank statements showing deposits." },
      { label: "Portuguese tax residence (NIF) + bank account + accommodation", why: "Same shape as US/UK retirees — NIF via tax representative, Portuguese bank with 12 months' minimum, accommodation contract or deed." },
    ],
    personalStatementTemplate: [
      { heading: "Why Portugal", prompt: "Specific area, climate, cost, healthcare, lifestyle. Canadian retirees often choose Algarve for climate or Porto for cost." },
      { heading: "Pension and passive-income setup", prompt: "CPP + OAS + private pension + investment breakdown over 12 months." },
      { heading: "Healthcare arrangements", prompt: "Canadian provincial healthcare doesn't follow you to Portugal — private insurance for transition, then SNS enrolment as Portuguese resident." },
      { heading: "Long-term plan", prompt: "Permanent residence after 5 years; Portuguese citizenship after 5 years (A2 Portuguese test)." },
    ],
    moneySavingTips: [
      "CPP and OAS are paid in Portugal at full rate (Canada-Portugal social security agreement) — no reduction for residency abroad. Notify Service Canada before relocating.",
      "Canadian provincial healthcare coverage typically lapses after 7 months out of province. Plan private insurance bridging departure to SNS enrolment.",
      "Canada-Portugal tax treaty avoids double taxation; pension income typically taxable in residence country (Portugal). Talk to Canada-PT cross-border accountant.",
      "NHR tax regime phased out 2024 — IFICI replacement limited. Plan on standard Portuguese progressive rates for retirement income.",
    ],
    lawyerTriggers: {
      diy: ["D7 with clean CPP/OAS + private pension evidence and apostilled documents"],
      getALawyer: ["Complex Canadian RRSP/RRIF/TFSA structures for Portuguese tax planning", "Prior Schengen refusal"],
    },
  },

  "CA:MX:family": {
    whatCarriesWeight: [
      { label: "Temporary Resident OR Permanent Resident at Mexican consulate", why: "Canadian nationals: same shape as US route. Temporary Resident with monthly income ~CAD$3,500-5,000 OR savings ~CAD$70-100k, OR Permanent Resident with higher thresholds. Income threshold varies by consulate (Toronto, Vancouver, Montréal published amounts differ)." },
      { label: "RCMP Criminal Record Check apostilled", why: "Via accredited fingerprinting + Global Affairs Canada apostille (~6-12 weeks) + sworn Spanish translation." },
      { label: "Pension / passive-income evidence", why: "CPP + OAS + private pension + investment income. 12 months of consistent bank statements at or above consulate threshold." },
      { label: "INM finalisation in Mexico within 30 days of entry", why: "Consulate issues initial visa; final residence card via INM (Instituto Nacional de Migración) at your settlement city within 30 days of arrival." },
    ],
    personalStatementTemplate: [
      { heading: "Why Mexico", prompt: "Specific city (Mexico City, Mérida, San Miguel de Allende, Puerto Vallarta, Lake Chapala — large Canadian expat community)." },
      { heading: "Pension / income evidence", prompt: "CPP / OAS / private pension breakdown. Document 12-month consistency." },
      { heading: "Long-term plan", prompt: "Temporary 4 years → Permanent → Mexican citizenship after 5 years total." },
    ],
    moneySavingTips: [
      "CPP and OAS paid in Mexico at full rate — Canada-Mexico social security agreement covers it. Notify Service Canada.",
      "Mexican consulate income thresholds in Toronto / Vancouver / Montréal: Toronto ~CAD$3,800/mo; Vancouver ~CAD$4,200/mo (2024 figures). Verify before booking appointment.",
      "USMCA business travel under T-classification doesn't require this visa for short trips — FMM tourist permit suffices.",
      "Lake Chapala / Ajijic / Chapalas has the largest Canadian retiree community — established services and English-speaking environment.",
    ],
    lawyerTriggers: {
      diy: ["Temporary Resident with clean CPP/OAS evidence at published consulate threshold"],
      getALawyer: ["Permanent Resident direct route", "Investor visa with Canadian corporate ownership structures", "Prior Mexican refusal"],
    },
  },

  // ─── Outbound CN (additional) ───
  "CN:DE:study": {
    whatCarriesWeight: [
      { label: "Letter of admission from German university (Zulassung)", why: "Chinese students need formal Zulassung from a German Hochschule — not just a conditional offer. APS certificate from the Akademische Prüfstelle (Beijing) is pre-required for university applications." },
      { label: "APS certificate (Akademische Prüfstelle)", why: "All Chinese students applying to German universities need APS certificate verifying academic records. Application process via APS Beijing — interview or document-based depending on academic record." },
      { label: "Blocked account (Sperrkonto) with €11,904+ (2024 figure)", why: "German student visa requires proof of financial means — typically a blocked bank account (Deutsche Bank, Fintiba, Expatrio) with ~€11,904 covering 12 months at €992/mo. Alternatives: parental sponsorship + income evidence." },
      { label: "Health insurance compliant with German requirements", why: "Until 30 years old: statutory health insurance (TK, AOK, Barmer ~€110/mo). Over 30: private insurance acceptable. Mandatory from day 1 of enrolment." },
    ],
    personalStatementTemplate: [
      { heading: "Your German programme and university", prompt: "Specific programme, university, why this institution. German Bachelor programmes are 3 years; Master 1-2 years; Promotion (PhD) 3-5 years." },
      { heading: "Your educational background and APS certificate", prompt: "Chinese degree, GPA, APS reference number." },
      { heading: "Why Germany", prompt: "German higher-education quality, specific faculty / research lab, post-study work permit eligibility (18-month Job Search Visa after graduation)." },
      { heading: "Financial sponsorship", prompt: "Blocked account OR parental sponsorship + tax/income evidence." },
    ],
    moneySavingTips: [
      "German public universities charge no tuition for international students (some exceptions in Baden-Württemberg — €1,500/semester for non-EU). Bachelor / Master at TU Munich, Heidelberg, RWTH Aachen, Humboldt all free.",
      "Blocked account providers: Fintiba and Expatrio waive setup fees, charge ~€5/mo. Deutsche Bank charges higher fees but provides physical-branch service.",
      "Statutory health insurance (TK, AOK, Barmer) is the cheapest option — ~€110/mo. Private student insurance via Mawista, Care Concept can be cheaper but not always accepted by all universities.",
      "Post-graduation 18-month Job Search Visa is free for Chinese alumni — generous timeline to find a Blue Card-eligible role. EU Blue Card threshold: €43,800 in 2024 for shortage occupations.",
    ],
    lawyerTriggers: {
      diy: ["Standard student visa with Zulassung + APS + blocked account + statutory health insurance"],
      getALawyer: ["APS interview challenges or rejection (re-application strategy)", "Conversion from student to Job Search → Blue Card / work permit", "Prior Schengen refusal"],
    },
  },

  "CN:FR:work": {
    whatCarriesWeight: [
      { label: "Talent Passport (Passeport Talent) OR standard work permit", why: "Chinese senior professionals qualify for Talent Passport categories: Salarié Qualifié (skilled employee with French employer + ≥ €43,243/yr in 2024), Salarié en Mission (intracompany transfer), Investisseur (business investment), or Talent (researcher/artist/founder). Talent Passport is 4-year residence card, renewable." },
      { label: "French employer's nomination + DREETS approval", why: "Work permits require French employer nomination + DREETS labour-market test for non-Talent Passport categories. Most Chinese-French recruitment is via established multinationals (Airbus, L'Oréal, Total, BNP, Schneider Electric) handling end-to-end." },
      { label: "Chinese degree authentication by China Academic Degrees Centre", why: "Chinese degrees authenticated via CHESICC (China Higher Education Student Information and Career Center) + apostille via the appropriate Chinese authority. France joined Hague Apostille effective 2023 for Chinese documents — much faster than prior consular legalisation." },
      { label: "French Consulate selection (Beijing, Shanghai, Guangzhou, Wuhan, Shenyang)", why: "Long-stay visa applications via consulate based on Chinese province of residence. Visa processing 4-8 weeks for Talent Passport, 8-12 for standard work permit." },
    ],
    personalStatementTemplate: [
      { heading: "Your role and French employer", prompt: "Title, company, location, salary level. For Talent Passport, name the qualifying category explicitly." },
      { heading: "Educational background and CHESICC authentication", prompt: "Chinese degree, institution, CHESICC reference number." },
      { heading: "Why France", prompt: "Specific city (Paris, Lyon, Toulouse, Marseille, Nice), industry, project. Chinese-French research and high-tech sectors are active." },
      { heading: "Long-term plans", prompt: "Carte de résident after 5 years; French citizenship after 5 years (2 for spouses of French citizens, language and integration tests apply)." },
    ],
    moneySavingTips: [
      "Talent Passport (Passeport Talent) Salarié Qualifié threshold (€43,243/yr in 2024) is significantly lower than standard work permit + DREETS process — both faster and more reliable. Negotiate salary at or above threshold.",
      "Chinese-French double tax treaty avoids double taxation on French employment income.",
      "French CPAM (state healthcare) registration from day 1 of residence — cancel Chinese expat private insurance accordingly to avoid double-paying.",
      "Don't pay 'visa agencies' in Beijing / Shanghai €3,000+ — French Embassy Beijing handles applications directly via TLScontact (their authorised visa-processing centre); standard service fees included in the visa fee.",
    ],
    lawyerTriggers: {
      diy: ["Talent Passport with large multinational sponsor handling end-to-end"],
      getALawyer: ["Investor / entrepreneur route with Chinese corporate ownership structures", "Self-employment registration", "Prior Schengen refusal at any member state"],
    },
  },

  "CN:ES:study": {
    whatCarriesWeight: [
      { label: "Spanish university admission (carta de admisión)", why: "Chinese students need formal admission letter from a Spanish university — not just conditional offer. Public universities (Madrid Complutense, Barcelona, Valencia, Salamanca) and private (IE, ESADE, IESE) all eligible. Programmes increasingly offered in English at master / MBA level." },
      { label: "Chinese degree authentication + Spanish university recognition", why: "Chinese degrees via CHESICC authentication + apostille (Spain accepts Hague Apostille effective 2023 for Chinese documents). Spanish university may require pre-application credential evaluation." },
      { label: "Financial capacity (IPREM-based threshold)", why: "Spanish student visa requires proof of financial means ≥ 100% IPREM for student + 75% for first dependent + 50% per additional (2024: ~€600/mo for student, ~€450 dependent). 12 months equivalent in bank statements." },
      { label: "Spanish health insurance covering full visa duration", why: "Either Spanish public university enrolment + Spanish health-insurance bundle OR private health insurance covering Spain. ~€500-1,000/yr for compliant private student insurance." },
    ],
    personalStatementTemplate: [
      { heading: "Your Spanish programme and university", prompt: "Specific programme, institution, Spanish or English-medium." },
      { heading: "Educational background + CHESICC authentication", prompt: "Chinese degree, institution, CHESICC + apostille reference." },
      { heading: "Why Spain", prompt: "Spanish-language acquisition, specific faculty / research / industry exposure. Post-study options: Spain's job-seeker visa (1 year post-graduation) increasingly used by Chinese alumni." },
      { heading: "Financial sponsorship", prompt: "Bank statements + parental income evidence + scholarship if applicable." },
    ],
    moneySavingTips: [
      "Spanish public university tuition for international students €1,000-3,000/yr depending on autonomous community (much cheaper than UK / US / AU). Private universities (IE, IESE) charge €40,000-80,000.",
      "CHESICC authentication for Chinese degrees: ~CNY 200 per document + 2-4 weeks processing. Cheaper than Spain-based 'international authentication services'.",
      "Madrid / Barcelona consulate processing 4-8 weeks for student visa. Apply 3 months before academic year start.",
      "Post-study job-seeker visa: 1-year extension after graduation to find Spanish employer. DNV route also available for Chinese alumni doing remote work for non-Spanish clients post-graduation.",
    ],
    lawyerTriggers: {
      diy: ["Standard student visa with admission letter + apostilled documents + financial evidence"],
      getALawyer: ["Conversion from student to work permit (Spanish employer sponsorship)", "Prior Schengen refusal"],
    },
  },

  // ─── KR / JP / TW → AU, CA ───
  "KR:AU:work": {
    whatCarriesWeight: [
      { label: "Subclass 482 (TSS) + Korean credentials recognition", why: "Korean professionals (IT, engineering, healthcare, education) widely sponsor 482. Standard TSMIT ≥ AUD$73,150. Skills assessment via Vetassess / Engineers Australia / ACS / CPA Australia depending on ANZSCO occupation." },
      { label: "Working Holiday subclass 462 (under-31 alternative)", why: "Korean nationals eligible for subclass 417 Working Holiday Maker visa (Korea is in the 417 list, not 462). 12 months work + travel, no employer sponsor required." },
      { label: "Korean police certificate (범죄경력증명서)", why: "Issued by the Korean National Police Agency — KAC clearance available online via Government24. Apostille via Korean Ministry of Foreign Affairs for Australian use." },
      { label: "English-language testing (IELTS / OET / PTE)", why: "Most Korean applicants need IELTS 6.0+ across skills for 482 (4007 character + 5.5 minimum for most occupations). Healthcare professionals often need 7.0+ via OET." },
    ],
    personalStatementTemplate: [
      { heading: "Your Australian role and sponsor", prompt: "ANZSCO occupation, company, salary." },
      { heading: "Korean credentials + Vetassess outcome", prompt: "Korean degree, employer history, skills assessment reference." },
      { heading: "English-language results", prompt: "IELTS / OET / PTE bands per skill." },
      { heading: "Settlement plan", prompt: "City, school plans if children, partner work plans (Subclass 482 dependents work without restriction)." },
    ],
    moneySavingTips: [
      "Korea-Australia Free Trade Agreement (KAFTA) doesn't create a special visa — standard 482/186 pathway. Don't pay 'KAFTA visa' agencies; the visa is the same.",
      "Korean nationals: subclass 417 Working Holiday (AUD$650) gives 12 months pre-commitment freedom. Useful for market-testing before 482.",
      "Subclass 482 to 186 ENS PR pathway after 2-3 years for direct entry — mention long-term intent honestly.",
    ],
    lawyerTriggers: {
      diy: ["Standard 482 with large employer + Vetassess-cleared credentials"],
      getALawyer: ["Self-employment via Korean company sponsorship", "Prior Korean / Australian immigration refusal"],
    },
  },

  "JP:AU:work": {
    whatCarriesWeight: [
      { label: "Subclass 482 with Australian employer + ANZSCO occupation", why: "Japanese professionals in IT, engineering, automotive, finance widely sponsor 482. TSMIT ≥ AUD$73,150. Skills assessment via the appropriate ANZSCO authority." },
      { label: "Working Holiday subclass 417 (under-31 alternative)", why: "Japan is in the subclass 417 Working Holiday list — 12 months freedom, no employer sponsor required. Used heavily by Japanese language teachers and farm workers." },
      { label: "Japanese police certificate (犯罪証明書)", why: "Issued by Japanese prefectural police HQ — apostille via Japanese Ministry of Foreign Affairs. Allow 4-8 weeks." },
      { label: "English-language testing", why: "Most Japanese applicants benefit from IELTS or OET preparation. Many Japanese professionals score Level 2+ on the GS test, opening top wage levels." },
    ],
    personalStatementTemplate: [
      { heading: "Australian role and sponsor", prompt: "ANZSCO occupation, company, salary." },
      { heading: "Japanese credentials + Vetassess outcome", prompt: "Japanese degree, employer history, skills-assessment reference." },
      { heading: "English-language results", prompt: "IELTS / OET / PTE bands per skill." },
      { heading: "Settlement plan", prompt: "City, partner work plans, school plans if children." },
    ],
    moneySavingTips: [
      "Japan-Australia Reciprocal Health Care Agreement covers emergency hospital care for Japanese visitors in Australia — but OVHC private insurance is STILL required for 482 visa compliance. Both run in parallel.",
      "Subclass 417 Working Holiday is the easiest market-test before 482 commitment.",
      "Japan-Australia Economic Partnership Agreement (JAEPA) doesn't create a special work visa — standard 482 pathway.",
    ],
    lawyerTriggers: {
      diy: ["Standard 482 with large multinational sponsor"],
      getALawyer: ["Self-employment via Japanese company sponsorship", "Prior immigration refusal in any country"],
    },
  },

  "TW:US:work": {
    whatCarriesWeight: [
      { label: "H-1B / L-1 / O-1 / E-1 / E-2 standard categories", why: "Taiwan has US E-1 (Treaty Trader) and E-2 (Treaty Investor) treaty access. Standard H-1B cap lottery applies. L-1 intracompany transfer is common for Taiwanese MNCs (TSMC, Foxconn, Acer, ASUS). Taiwanese nationals enjoy current EB-2/EB-3 priority dates — no country-cap backlog." },
      { label: "Taiwanese university credentials", why: "Taiwanese degrees (National Taiwan University, Tsinghua, Chiao Tung, Yang Ming, Cheng Kung) are well-recognised. WES evaluation typically straightforward." },
      { label: "AIT (American Institute in Taiwan) processing", why: "Taiwan has no formal US embassy; consular services via AIT in Taipei and Kaohsiung. B/F/J/H/L processing 1-4 weeks. Interview waiver expanded post-2023." },
      { label: "Taiwan-US semiconductor visa fast-track", why: "TSMC and related semiconductor workers benefit from US administration's CHIPS Act emphasis — sometimes faster processing for specialised semiconductor roles, especially L-1." },
    ],
    personalStatementTemplate: [
      { heading: "Role and US employer", prompt: "Title, company, location, salary. For L-1, document Taiwanese qualifying-organisation employment ≥1 year." },
      { heading: "Taiwanese credentials + WES evaluation", prompt: "Degree, institution, WES reference." },
      { heading: "Why this US role", prompt: "Specific team, project, technology." },
      { heading: "Long-term plans", prompt: "Current EB-2 / EB-3 priority dates for Taiwan — file I-140 concurrently if eligible." },
    ],
    moneySavingTips: [
      "Taiwanese E-2 treaty investor option: substantial US investment (~$100k+ in an operating business), no annual cap.",
      "TSMC / Foxconn / Acer / large Taiwanese tech employers typically handle full H-1B/L-1 visa support end-to-end at no cost to the worker.",
      "AIT-Taipei expanded interview-waiver eligibility in 2023 — most Taiwanese applicants with recent visa history qualify, saving the interview wait entirely.",
    ],
    lawyerTriggers: {
      diy: ["Standard L-1 transfer with Taiwanese MNC sponsor"],
      getALawyer: ["E-2 treaty investor", "Self-petitioning O-1 / EB-1A", "Prior US visa refusal"],
    },
  },

  // ─── HK / SG outbound ───
  "HK:GB:work": {
    whatCarriesWeight: [
      { label: "BN(O) Visa for Hongkongers (UK's dedicated route)", why: "Hong Kongers with British National (Overseas) status — and their family — qualify for the BN(O) Visa launched January 2021. 5-year residence path to settlement. £180 application + £3,105 IHS over 5 years for adult applicants. No labour-market test, no employer sponsorship." },
      { label: "Skilled Worker visa as alternative", why: "Hong Kong residents without BN(O) status use the standard Skilled Worker visa: UK employer sponsorship under a CoS, salary ≥ £38,700 from April 2024 (or shortage-occupation rate)." },
      { label: "Apostilled HK documents", why: "HK birth / marriage certificates apostilled via HK Apostille Office (Department of Justice). Police certificate via HK Police Force CCB." },
      { label: "English-language exemption", why: "Hong Kong residents from English-medium degree programmes are exempt from IELTS. Document degree certificate in English." },
    ],
    personalStatementTemplate: [
      { heading: "BN(O) status confirmation (if applicable)", prompt: "BN(O) passport details OR confirmation of eligibility (born in HK before 1997 and parent qualified)." },
      { heading: "Settlement plan in UK", prompt: "City (London, Manchester, Birmingham, Bristol all have established HK diasporas), housing, employment plans." },
      { heading: "Family members joining", prompt: "Spouse / partner / children — BN(O) covers immediate family." },
      { heading: "Long-term intent", prompt: "5-year track to ILR (Indefinite Leave to Remain), then British citizenship 12 months later." },
    ],
    moneySavingTips: [
      "BN(O) Visa avoids the standard Skilled Worker £38,700 salary threshold — most Hongkongers under BN(O) work below this without issue.",
      "IHS surcharge (£1,035/yr for adults, £776 for children) over 5 years adds up — pay upfront if cash flow allows; some find paying year-by-year easier via renewals.",
      "Don't pay 'BN(O) agencies' £3,000+ — application is straightforward via gov.uk. Reputable solicitors charge £1,000-2,000 for end-to-end family BN(O) applications.",
    ],
    lawyerTriggers: {
      diy: ["Standard BN(O) Visa application with clean documents"],
      getALawyer: ["Family members without straightforward BN(O) eligibility (extended family, adult dependent children, etc.)", "Prior UK refusal", "Complex Hong Kong civil-status documentation (older marriages, adoptions)"],
    },
  },

  "SG:GB:work": {
    whatCarriesWeight: [
      { label: "Skilled Worker visa with UK employer", why: "Standard UK Skilled Worker visa: employer-sponsored CoS, salary ≥ £38,700 from April 2024 (or shortage-occupation rate). Singapore has no special bilateral immigration arrangement with UK — full standard process applies." },
      { label: "Singapore-UK Double Tax Treaty", why: "Avoids double taxation on UK employment income. Singapore tax residency rules apply to determine where income is taxed primarily." },
      { label: "Singaporean degree recognition", why: "NUS, NTU, SMU degrees are well-recognised by UK universities and employers. NARIC equivalency typically establishes UK degree-level comparability." },
      { label: "Singapore Certificate of Clearance (COC)", why: "Issued by Singapore Police Force — typically 2-4 weeks. Required for UK visa application." },
    ],
    personalStatementTemplate: [
      { heading: "Your role and UK employer", prompt: "CoS number, role, employer, salary. SOC code on CoS." },
      { heading: "Singaporean credentials", prompt: "Degree, institution, professional registration if applicable (e.g. SPC for engineers)." },
      { heading: "Why UK", prompt: "Specific industry, city, project." },
      { heading: "Long-term plans", prompt: "ILR after 5 years on Skilled Worker; British citizenship 12 months later." },
    ],
    moneySavingTips: [
      "Singapore-UK Working Holiday Scheme (YMS Tier 5) — Singapore is one of the YMS-eligible countries. 2-year work + travel for under-31s, no employer sponsorship required. Use this before committing to Skilled Worker.",
      "Singaporean nationals: ETA from January 2025 — £10, 2-year validity. Required for short visits even though no visa needed.",
      "Singapore-UK Double Tax Treaty election can reduce overall taxation depending on individual circumstances.",
    ],
    lawyerTriggers: {
      diy: ["Standard Skilled Worker with reputable UK employer handling sponsorship"],
      getALawyer: ["Self-employment / consulting setup", "Prior UK refusal"],
    },
  },

  // ─── AE-based expat moves (AE → US, GB, CA) ───
  "AE:GB:work": {
    whatCarriesWeight: [
      { label: "Emirati passport: visa-free + Skilled Worker visa", why: "UAE nationals (Emirati passport-holders) enjoy UK visa-free entry for 6 months (with ETA from 2024). For long-stay work: standard Skilled Worker visa with UK employer sponsorship + CoS + salary ≥ £38,700." },
      { label: "Highly Qualified Professional route via UK Global Talent visa", why: "Emirati senior leaders, academics, tech leaders qualify for the UK Global Talent visa — endorsement by Tech Nation (now defunct, transferred to UKVI), Arts Council, Royal Society, etc. No employer sponsorship; 5-year residence track." },
      { label: "UAE-issued documents apostilled", why: "UAE joined the Hague Apostille Convention in 2024 — most UAE documents now eligible for apostille via MoFAIC. Older documents may need consular legalisation via UK Embassy Dubai." },
      { label: "UAE Police Certificate", why: "Issued via the UAE Ministry of Interior or Dubai Police. Allow 1-3 weeks." },
    ],
    personalStatementTemplate: [
      { heading: "Role and UK employer / endorsement", prompt: "Standard Skilled Worker: CoS, employer, role, salary. Global Talent: endorsement body and reference." },
      { heading: "Emirati credentials and prior work history", prompt: "Degree, institution, prior employment in UAE / Saudi / wider GCC." },
      { heading: "Why UK", prompt: "Specific industry, city, project." },
      { heading: "Long-term plans", prompt: "ILR after 5 years on Skilled Worker / Global Talent; British citizenship 12 months later." },
    ],
    moneySavingTips: [
      "UAE-UK bilateral business travel benefits from ETA-only 6-month visa-free entry — useful for pre-relocation site visits.",
      "UAE residents who are NOT Emirati nationals (most UAE expats) need standard visa-required documentation based on their original passport, not UAE residency.",
      "Don't pay 'visa agencies' in Dubai £3,000+ — UK Skilled Worker application via VFS Global Dubai is straightforward; UK solicitors charge £1,500-3,000 for end-to-end work.",
    ],
    lawyerTriggers: {
      diy: ["Standard Skilled Worker with reputable UK employer; immigration team handles end-to-end"],
      getALawyer: ["Global Talent endorsement (strategic endorsement-body selection)", "Investor / Innovator Founder route", "Prior UK refusal"],
    },
  },

  "IN:AU:work": {
    whatCarriesWeight: [
      { label: "Subclass 482 (TSS) or Subclass 189 / 190 points-based", why: "Indian professionals are the largest single nationality cohort in Australia's skilled migration. 482 employer-sponsored OR 189 Skilled Independent / 190 Skilled Nominated point-based. ANZSCO occupation must be on relevant skilled list. TSMIT ≥ AUD$73,150 for 482." },
      { label: "Skills assessment via the appropriate ANZSCO authority", why: "IT via ACS (most common Indian-AU pathway). Engineers via Engineers Australia (CDR or Washington/Sydney/Dublin Accord). Accountants via CPA/CAANZ/IPA. Allow 4-12 weeks. ACS Group ID required for most ANZSCO 261XXX/263XXX codes." },
      { label: "PCC from every country lived 12+ months in past 10 years", why: "Indian PCC via Passport Seva Kendra or VFS abroad — issued in your passport, not separately. UAE/Saudi/Singapore PCC for prior overseas residence." },
      { label: "English-language testing (IELTS / PTE)", why: "PTE Academic increasingly preferred by Indian applicants (faster, more granular scoring). Required band: 65+ for points test or 7.0 IELTS." },
    ],
    personalStatementTemplate: [
      { heading: "Your nominated role and sponsor (482) OR skills profile (189/190)", prompt: "ANZSCO occupation, sponsor / state nomination, salary, prior employer." },
      { heading: "Skills assessment outcome", prompt: "Assessing authority, reference number." },
      { heading: "English-language test results", prompt: "PTE / IELTS bands." },
      { heading: "Settlement and PR plan", prompt: "City, partner work plans (Subclass 482 dependents work without restriction). 482 → 186 ENS PR after 2-3 years." },
    ],
    moneySavingTips: [
      "ACS skills assessment is the dominant Indian-AU pathway: AUD$500-1,200 depending on category. Submit complete documentation first try — re-submission costs add up.",
      "PTE Academic ~AUD$420 vs IELTS ~AUD$435 — similar cost, but PTE results in 48 hours vs IELTS in 13 days. Faster for tight timelines.",
      "189 Skilled Independent points test: target 90+ points (current invitation thresholds 90-100 for most ANZSCO occupations). Spousal credentials add 10 points; functional English exam another 5.",
      "Don't pay agents in India AUD$5,000+ for points-test 'optimisation' — Express Entry Australia and Skilled Migration are self-serve via ImmiAccount.",
    ],
    lawyerTriggers: {
      diy: ["Standard 482 with large IT/consulting employer (Infosys, TCS, Wipro, Cognizant, Tech Mahindra all handle end-to-end)"],
      getALawyer: ["189/190 application where points test is close to threshold", "Subsequent 186 ENS PR conversion", "Prior Australian or other visa refusal", "Complex Indian degree / credential issues"],
    },
  },

  // ─── EU intra-bloc work permits ───
  "FR:DE:work": {
    whatCarriesWeight: [
      { label: "EU freedom of movement (no work permit required)", why: "French citizens have unrestricted right to work in Germany under the EU Treaty. No work permit, no employer sponsorship, no salary threshold required. Register at the local Bürgeramt within 2 weeks of arrival; no visa, no application." },
      { label: "Anmeldung (residence registration) within 14 days", why: "Mandatory within 14 days of moving to a German address. Bring rental contract + landlord's Wohnungsgeberbestätigung + passport. Issued the same day at the Bürgeramt." },
      { label: "Tax registration (Steueridentifikationsnummer)", why: "Tax ID auto-issued by post within 2-3 weeks of Anmeldung. Required before employer can pay you on German payroll." },
      { label: "Health insurance (statutory or private)", why: "Mandatory from day 1 of German employment. Most employees auto-enrol in statutory (TK, AOK, Barmer ~14.6% gross income split with employer). Self-employed and high earners (>€73,800 in 2024) may opt for private." },
    ],
    personalStatementTemplate: [
      { heading: "Where you'll live and work", prompt: "German city + employer. No need to justify the move — EU citizens have full freedom." },
      { heading: "Tax and social security setup", prompt: "Employer's payroll setup will handle most of this — your role is the Anmeldung within 14 days." },
      { heading: "Long-term plans", prompt: "EU citizens retain freedom of movement; no PR application needed. German citizenship via naturalisation after 5 years (post-2024 reform) with German language and integration evidence." },
    ],
    moneySavingTips: [
      "Statutory health insurance is income-based — at €60-90k salary, statutory is often cheaper than private. Switch only if you'll stay high-earner and don't plan to switch back (return to statutory has age and health restrictions).",
      "French CPAM health-insurance card (Carte Vitale) doesn't cover routine German healthcare — switch to German insurance from day 1 of German employment.",
      "France-Germany tax treaty avoids double taxation. Filing in both countries required if dual-residence ambiguity exists in year of move.",
    ],
    lawyerTriggers: {
      diy: ["Standard EU intra-bloc move — no immigration legal work needed"],
      getALawyer: ["Self-employed registration with cross-border invoicing (Steuerberater rather than lawyer)", "Long-term tax-residence determination spanning France and Germany"],
    },
  },

  "DE:FR:work": {
    whatCarriesWeight: [
      { label: "EU freedom of movement (no work permit required)", why: "German citizens enjoy unrestricted right to work in France. No work permit, no employer sponsorship, no salary threshold. Register with the local Mairie if establishing residence." },
      { label: "Carte Vitale (French health insurance) and SS registration", why: "Once on French payroll, employer registers you with URSSAF and you receive a Numéro de Sécurité Sociale. Carte Vitale follows within 3-4 weeks." },
      { label: "French tax residence triggers (183-day rule)", why: "French tax residence triggered by 183+ days in France or your centre of economic interests being France. Tax return filing in May annually." },
      { label: "Mutuelle (supplementary health insurance) and prévoyance", why: "Carte Vitale covers ~70% of healthcare costs. Most employees take out mutuelle via employer for the remaining 30%. Standard French employment package." },
    ],
    personalStatementTemplate: [
      { heading: "Where you'll live and work", prompt: "City + employer. EU citizens — no justification needed." },
      { heading: "Tax and social security setup", prompt: "Employer handles URSSAF / Carte Vitale registration. Your role is providing French address proof." },
      { heading: "Long-term plans", prompt: "EU citizens retain freedom of movement; no PR needed. French citizenship via naturalisation after 5 years with French language (B1) and integration evidence." },
    ],
    moneySavingTips: [
      "French employee social security contributions ~22% gross — high vs Germany — but include comprehensive pension, unemployment, health coverage.",
      "Germany-France tax treaty allocates pension taxation to residence country — plan retirement-account contributions accordingly.",
      "German Steuernummer remains valid for the German side of any cross-border income — no need to cancel.",
    ],
    lawyerTriggers: {
      diy: ["Standard EU intra-bloc move"],
      getALawyer: ["Self-employed registration with cross-border invoicing", "Long-term tax-residence determination"],
    },
  },

  // ─── More tourism / visit cells ───
  "CN:JP:tourism": {
    whatCarriesWeight: [
      { label: "Group tour OR individual visa application", why: "Chinese tourists to Japan have two main pathways: (a) group tour via approved Chinese travel agency (simpler documentation, fixed itinerary), or (b) individual tourist visa with full documentation set. Individual visa is typically issued 5-15 days." },
      { label: "Financial capacity evidence", why: "Bank statements showing 6 months of consistent income (~CNY 10,000+/mo for individual visa) or savings ~CNY 100,000+. Property ownership, employment letter, and tax-deduction certificates strengthen the application." },
      { label: "Detailed itinerary + hotel bookings + return flight", why: "Japanese consulate requires day-by-day itinerary with hotel bookings (refundable booking.com is fine) and confirmed return flights. Vague itineraries trigger refusals." },
      { label: "Prior international travel history", why: "Schengen / US / UK / AU / NZ stamps significantly improve approval likelihood. First-time travellers typically need stronger financial documentation." },
    ],
    personalStatementTemplate: [
      { heading: "Trip purpose and dates", prompt: "Specific tourism plan, dates, length of stay." },
      { heading: "Your ties to China", prompt: "Employer (with letter), property, family. Strong ties reduce immigrant-intent suspicion." },
      { heading: "How the trip is funded", prompt: "Your income evidence OR a Chinese sponsor's I-equivalent + sponsor's income." },
      { heading: "Prior international travel", prompt: "Document any prior Schengen / US / UK / AU / KR / SG trips." },
    ],
    moneySavingTips: [
      "Japan's multiple-entry tourist visa (3-year validity, 30 days per visit) is available for higher-income Chinese applicants and prior compliant Japan visitors — saves repeated visa applications.",
      "Group-tour visa is significantly cheaper and faster — useful for first-time travellers or budget travel.",
      "Avoid 'visa preparation services' charging CNY 1,500+ in Beijing/Shanghai — application via authorised travel agency or directly to consulate is straightforward.",
    ],
    lawyerTriggers: {
      diy: ["First-time tourist visa with strong documentation and prior travel history"],
      getALawyer: ["Prior refusal (typically requires reframing on retry)", "Family member with Japan immigration history"],
    },
  },

  "IN:JP:work": {
    whatCarriesWeight: [
      { label: "Engineer / Specialist in Humanities visa OR HSP (Highly Skilled Professional)", why: "Indian IT professionals are heavily represented in Japan. Engineer visa for tech roles; Specialist in Humanities for non-tech professional roles. HSP (Highly Skilled Professional) point-based for senior roles — PR after 1-3 years instead of standard 10." },
      { label: "Japanese sponsoring employer's Certificate of Eligibility (CoE)", why: "Employer files CoE application with Japanese immigration on your behalf. CoE issuance typically 1-3 months; you then take CoE to Japanese embassy in India for visa stamping (1-2 weeks)." },
      { label: "Indian degree authentication + employer evaluation", why: "Most Japanese employers accept Indian engineering degrees without separate authentication; some require WES-equivalent evaluation. Sponsoring employer guides the process." },
      { label: "Japanese language (variable by role)", why: "IT roles in MNCs (Rakuten, Mercari, Indeed) operate in English — no Japanese needed at hire. Traditional Japanese employers expect JLPT N3+ for white-collar roles." },
    ],
    personalStatementTemplate: [
      { heading: "Role and Japanese employer", prompt: "Title, employer, location, salary. For HSP applicants, point breakdown across age / education / income / experience criteria." },
      { heading: "Indian education and work history", prompt: "Degree, employers, technologies. CoE application is prepared by employer; align your documentation with what they file." },
      { heading: "Why Japan", prompt: "Specific industry, project, team. Japanese tech / engineering / research is common Indian draw." },
      { heading: "Long-term plans", prompt: "HSP path to PR (1-3 years on highest tier); standard Engineer visa path is 10 years for PR." },
    ],
    moneySavingTips: [
      "HSP (Highly Skilled Professional) visa: 70+ points = 3 years to PR; 80+ points = 1 year to PR. Optimise points across age/income/Japanese language/research output for faster track.",
      "Japan-India social security agreement (effective 2016) avoids double-paying pension contributions during initial assignment.",
      "Don't pay 'Japan visa agents' in India INR 50,000+ — the CoE is filed by the Japanese employer, not by an agent. Visa stamping at Japanese embassy is straightforward.",
    ],
    lawyerTriggers: {
      diy: ["Standard Engineer visa with large Japanese MNC sponsor handling CoE"],
      getALawyer: ["HSP application with complex point optimisation", "Self-employment / startup founder route in Japan", "Prior Japanese refusal"],
    },
  },

  // ─── US → IT, GR, FR ───
  "US:IT:family": {
    whatCarriesWeight: [
      { label: "Italian descent (jure sanguinis) — fastest route", why: "Americans with an Italian-born ancestor (and unbroken citizenship line) qualify for Italian citizenship by descent. No residence requirement; recognition via Italian consulate OR via Italian comune (1-2 years to process). Once recognised, you ARE an EU citizen with freedom of movement." },
      { label: "Elective Residence Visa (no work permitted)", why: "Americans with passive income (~€31,000+/yr for primary applicant, +20% for spouse, +5% per child) qualify for the Elective Residence Visa. 1-year renewable to permanent residence after 5 years. Cannot work in Italy on this visa." },
      { label: "Italian apostille / consular legalisation", why: "Italy is in Hague Apostille — US documents apostilled by issuing state's Secretary of State. Italian translation by sworn translator (traduttore giurato) registered with the Italian consulate or comune." },
      { label: "US FBI background check + apostille", why: "FBI Identity History Summary Check + US State Dept apostille. Allow 8-14 weeks via standard mail OR 1-2 weeks via channeler at higher cost." },
    ],
    personalStatementTemplate: [
      { heading: "Italian-descent pathway (if applicable)", prompt: "Document the Italian-born ancestor (birth certificate from comune di nascita), unbroken citizenship line (naturalization records of US ancestor, often pre-1912 birth of next-generation ancestor)." },
      { heading: "Elective Residence pathway (if descent not available)", prompt: "Passive income source(s) — pension, investment, rental. Income documentation over 12 months." },
      { heading: "Settlement plan", prompt: "Italian region (Tuscany, Umbria, Sicily, Le Marche have established American expat communities). Property purchase or 12-month rental contract." },
      { heading: "Long-term plan", prompt: "Italian citizenship after 10 years (4 for EU nationals; jure sanguinis recognition is instant)." },
    ],
    moneySavingTips: [
      "Italian descent recognition via Italian comune is FREE (just document costs + travel) vs €300 consular fee per applicant. Comune route faster if the ancestral town has efficient records.",
      "Italy has no Iberoamerican-style citizenship shortcut for non-EU Americans — standard 10-year naturalisation track (or 4-year for EU citizens).",
      "Italian Elective Residence is heavily oversubscribed — consulate-by-consulate processing varies; some require in-person interview, others document-only.",
    ],
    lawyerTriggers: {
      diy: ["Italian descent application with clean ancestral documents"],
      getALawyer: ["Complex Italian descent (1948 case for maternal line — gendered naturalisation rules), broken citizenship line, naturalisation gaps", "Elective Residence with complex US-source passive income structures"],
    },
  },

  "US:DE:study": {
    whatCarriesWeight: [
      { label: "EU Blue Card or Opportunity Card (Chancenkarte) for grad-route entry", why: "American senior tech / engineering professionals qualify for the EU Blue Card with salary ≥ €48,300 (€43,800 for shortage occupations). The Opportunity Card (Chancenkarte) launched 2024 is a points-based job-seeker visa allowing entry to Germany to find Blue Card-eligible work — a useful study/post-study pathway alternative to standard study visa." },
      { label: "Skilled Workers Act 2.0 categories", why: "Multiple categories for skilled workers: degree-holders with German recognition of credential, vocationally trained workers with employer offer, recognised IT professionals (no degree required for high-experience tech)." },
      { label: "Degree recognition via ANABIN database", why: "American degrees evaluated against ANABIN database — H+ rating (institutions and programs both highly comparable to German equivalents) is the gold standard. Most accredited US universities are H+." },
      { label: "Job-Seeker Visa OR direct work visa application", why: "Job-Seeker Visa (6 months) allows entry without job offer. Once secured, switch to work visa from within Germany — faster than re-entering on full work visa." },
    ],
    personalStatementTemplate: [
      { heading: "Role, employer, and salary", prompt: "German employer, role, salary (above Blue Card threshold). For Chancenkarte: explain your points profile." },
      { heading: "US degree and ANABIN rating", prompt: "Degree, institution, ANABIN rating reference." },
      { heading: "Why Germany", prompt: "Specific industry, city, project." },
      { heading: "Long-term plans", prompt: "Niederlassungserlaubnis after 33 months on Blue Card with B1 German; German citizenship after 5 years (post-2024 reform, 3 with exceptional integration)." },
    ],
    moneySavingTips: [
      "Blue Card 33-month fast-track to PR requires B1 German — invest in language learning from day 1. Goethe-Institut courses ~€700/intensive month.",
      "US-Germany Totalization Agreement avoids double-paying social security on US assignment-based work.",
      "Don't pay 'German visa agencies' in US $3,000+ — application at German consulate (NYC, DC, LA, SF, Houston, Chicago, Atlanta, Miami, Boston) is straightforward. German immigration lawyers (Rechtsanwälte) charge €1,500-3,000 for end-to-end representation.",
    ],
    lawyerTriggers: {
      diy: ["EU Blue Card with strong US degree + German employer above salary threshold"],
      getALawyer: ["Chancenkarte points application", "Self-employment / freelance visa", "Prior Schengen refusal"],
    },
  },

  "US:IE:work": {
    whatCarriesWeight: [
      { label: "Critical Skills Employment Permit OR General Employment Permit", why: "Ireland's CSEP (Critical Skills Employment Permit) is for occupations on the Critical Skills Occupations List with salary ≥ €38,000 (or ≥ €64,000 for non-shortage occupations). GEP (General Employment Permit) is for other roles with Labour Market Needs Test. Both are employer-sponsored." },
      { label: "Employer's existing Employment Permit history", why: "Reputable Irish employers (Google, Meta, Apple, Microsoft, LinkedIn, Stripe, Intel — all major Dublin/Cork/Galway tech hubs) handle CSEP / GEP filings routinely." },
      { label: "US degree recognition", why: "American degrees from accredited institutions are recognised by Irish employers and the Department of Enterprise. NARIC Ireland evaluation if formal recognition is required for regulated profession." },
      { label: "Apostilled US documents", why: "FBI background check + apostille (US State Dept) for visa application. Birth / marriage certificates apostilled by issuing US state." },
    ],
    personalStatementTemplate: [
      { heading: "Role and Irish employer", prompt: "Employer (note: most Big Tech US firms have major Irish operations), CSEP/GEP category, salary." },
      { heading: "US credentials", prompt: "Degree, institution, professional certifications." },
      { heading: "Why Ireland", prompt: "Specific industry, Dublin/Cork/Galway tech ecosystem, project, team." },
      { heading: "Long-term plans", prompt: "Stamp 4 + Long-Term Residence after 5 years; Irish citizenship 5 years (1 yr for spouses)." },
    ],
    moneySavingTips: [
      "US-Ireland Working Holiday Authorisation (12 months for US grads under 35) — pre-job offer entry. Useful for testing Dublin / Cork market.",
      "US-Ireland Tax Treaty avoids double taxation. Irish PAYE captures Irish-source income; US worldwide-income reporting continues.",
      "Ireland NOT in Schengen — keep that in mind for European travel post-relocation.",
      "Big Tech Dublin packages typically include relocation support + immigration team handling end-to-end CSEP. Negotiate this as part of offer.",
    ],
    lawyerTriggers: {
      diy: ["Standard CSEP with major US tech employer with Dublin operations"],
      getALawyer: ["Self-employed / consulting setup", "Prior Irish or EU refusal"],
    },
  },

  // ─── More family routes (high traffic) ───
  "GH:US:family": {
    whatCarriesWeight: [
      { label: "Petitioner's USC status and category", why: "USC-petitioned spouse (IR-1/CR-1, 12-18 mo) or minor child (IR-2) clears fastest. Ghana F-class wait times: F4 sibling currently 15+ years. F2A LPR-spouse current; F3 12+ years." },
      { label: "Ghanaian civil documents (Births and Deaths Registry, marriage registrar)", why: "All civil documents from the Ghana Births and Deaths Registry or relevant marriage registrar. Apostille via Ministry of Foreign Affairs (Ghana joined Hague Apostille effective 2024)." },
      { label: "Marriage bona-fides scrutiny", why: "Ghanaian-American marriages get standard USCIS scrutiny. Strong evidence: relationship-development timeline, photos across years, joint finances if cohabited, family integration, video-call communication records during long-distance periods." },
      { label: "I-864 financial sponsorship", why: "Petitioner shows income ≥125% federal poverty threshold. Joint sponsor available." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship history", prompt: "How and when you met, courtship (including long-distance), marriage, current arrangement." },
      { heading: "In-person visits", prompt: "Document each visit with passport stamps and supporting evidence." },
      { heading: "Plans for the US", prompt: "Settlement city, petitioner's employment, housing, beneficiary's plans." },
    ],
    moneySavingTips: [
      "Ghanaian apostille via MoFA Accra: GHS 200-500 per document (cheaper than 'international notarisation' services).",
      "Ghana-US bilateral relations are stable — DV (Diversity Visa) Lottery participation from Ghana is heavy; ineligibility for F-class doesn't preclude DV.",
      "Avoid 'visa fixers' in Accra charging $3,000+ — USCIS forms are free; reputable Ghanaian-American immigration lawyers charge $1,500-3,000 for end-to-end work.",
    ],
    lawyerTriggers: {
      diy: ["Standard USC spouse petition with clean marriage and Ghanaian apostilled documents"],
      getALawyer: ["Beneficiary's prior US overstay or refusal", "Petitioner's prior I-130 history (refused or withdrawn)", "Polygamous marriage history (USCIS recognises only monogamous)"],
    },
  },

  "ET:CA:work": {
    whatCarriesWeight: [
      { label: "Express Entry CRS profile", why: "Ethiopian professionals: bachelor's + IELTS 7+ + 3+ years skilled experience typically scores 400-450 CRS without job offer. LMIA-supported job offer adds 50-200 points. PNP nomination 600 points." },
      { label: "WES Educational Credential Assessment for Ethiopian degrees", why: "Ethiopian universities (Addis Ababa University, etc.) — degrees evaluated by WES, which is Canada-recognised. Apostille typically required (Ethiopia joined Hague effective 2023)." },
      { label: "IELTS General Training band scores (CLB 9+ optimal)", why: "Bands of 7.0/6.0/7.0/7.0 on the GT scale (CLB 9) optimise CRS. Each band increase = significant CRS gain." },
      { label: "Police certificates from Ethiopia + any other country lived in 6+ months", why: "Ethiopia PCC via Federal Police HQ. For diaspora applicants with UAE / Saudi / Kuwait residence, separate PCC required." },
    ],
    personalStatementTemplate: [
      { heading: "Skilled-occupation profile", prompt: "NOC code (TEER 0/1/2/3 eligible for FSW), years of experience, professional registration." },
      { heading: "Education and ECA", prompt: "Degree, institution, WES reference." },
      { heading: "Language test results", prompt: "IELTS GT band scores per skill." },
      { heading: "Settlement plan", prompt: "Province, city, employment search strategy, settlement funds." },
    ],
    moneySavingTips: [
      "Provincial Nominee Programs (Saskatchewan SINP, Manitoba MPNP, Alberta AAIP) often have lower CRS thresholds for Ethiopian-profile occupations.",
      "Don't pay immigration consultants in Addis $5,000+ — Express Entry is self-serve via canada.ca. CICC-licensed Canadian consultants charge CAD$2,500-5,000 for full representation.",
      "Settlement funds: CAD$13,757 (single) or CAD$17,127 (couple) — show 6+ months of liquid funds in your name.",
    ],
    lawyerTriggers: {
      diy: ["Clean Express Entry profile with strong CRS, no immigration complications"],
      getALawyer: ["Past Canadian or other refusal", "LMIA challenges from small employer", "Ethiopian military service requiring extra documentation"],
    },
  },

  // ─── More tourism / family for high-traffic regions ───
  "MX:CA:tourism": {
    whatCarriesWeight: [
      { label: "Mexican passport — Canada eTA (granted 2016, reimposed conditions)", why: "Most Mexican nationals require an eTA to fly to Canada — CAD$7, 5-year validity, instant approval typically. Some Mexican applicants (depending on travel history and criminal record) still require visitor visa. IRCC checks at boarding." },
      { label: "Mexican visitor visa (if eTA-ineligible)", why: "For Mexican applicants who don't qualify for eTA: standard Temporary Resident Visa (TRV) at Canadian Visa Application Centre (VFS Mexico). Processing 2-6 weeks; CAD$100 fee + biometrics CAD$85." },
      { label: "Strong ties to Mexico", why: "Document employer letter, property ownership, family, prior compliant Canadian / US / Schengen / UK travel. Refusal rates for Mexican visitor visa are 15-30% (above OECD baseline)." },
      { label: "Onward / return ticket + itinerary", why: "Detailed travel plan with hotels and return flight strongly recommended." },
    ],
    personalStatementTemplate: [
      { heading: "Trip purpose and itinerary", prompt: "Specific dates, cities, accommodations, planned activities." },
      { heading: "Your ties to Mexico", prompt: "Employer, property, family." },
      { heading: "How the trip is funded", prompt: "Own income evidence OR sponsor's documentation." },
      { heading: "Prior travel", prompt: "Schengen / US / UK / AU / JP travel history." },
    ],
    moneySavingTips: [
      "eTA application is online and instant for most Mexican applicants — don't pay 'agents' more than the CAD$7 government fee.",
      "If eTA-ineligible (rare) or denied at eTA stage, you'll need standard visitor visa — disclose any prior visa refusal honestly.",
      "Mexican applicants benefit from USMCA business-travel preferences for genuine business activities — separate from tourism visa.",
    ],
    lawyerTriggers: {
      diy: ["eTA application or standard visitor visa with strong ties documentation"],
      getALawyer: ["Prior Canadian / US refusal", "Criminal record / inadmissibility concerns"],
    },
  },

  "BR:ES:family": {
    whatCarriesWeight: [
      { label: "Spanish residence card via family reunification (EU Family Member)", why: "Spanish-citizen sponsors apply via the EU Family Member regime; Brazilian spouses qualify for a 5-year EU Family Member residence card." },
      { label: "Iberoamerican 2-year naturalisation", why: "After 2 years legal residence, Brazilian spouses of Spanish citizens can apply for Spanish citizenship — vs the standard 10 years for non-Iberoamericans." },
      { label: "Brazilian apostilled civil documents + cartório translations", why: "Brazilian civil documents (birth, marriage, divorce if applicable) apostilled via Brazilian cartórios. Spanish sworn translation by traductor jurado." },
      { label: "Brazilian antecedentes criminais (federal + state) apostilled", why: "Federal Polícia Federal + state estadual checks, both apostilled and translated." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship to Spanish sponsor", prompt: "Marriage date and registry reference (Brazilian or Spanish cartório). Prior marriages on either side." },
      { heading: "Living arrangements in Spain", prompt: "Where you'll live (empadronamiento essential), sponsor's income / employment." },
      { heading: "Brazilian original document set", prompt: "Apostilled civil documents + translation references." },
      { heading: "Long-term intent (Iberoamerican naturalisation)", prompt: "Pursuing Spanish citizenship after 2 years legal residence — Brazilian-CPLP framework is the explicit basis." },
    ],
    moneySavingTips: [
      "Brazilian cartório apostille: BRL 50-150 per document (much cheaper than 'international document services').",
      "Spanish DELE A2 + CCSE for citizenship: total ~€200. Plan well ahead — DELE exam dates are limited.",
      "Madrid/Barcelona consulate processing 4-12 weeks. Apply from Brazil before relocating to avoid in-Spain processing complexity.",
    ],
    lawyerTriggers: {
      diy: ["Standard EU Family Member route with apostilled Brazilian documents"],
      getALawyer: ["Prior Spanish residence card refusal", "Marriage entered shortly after sponsor naturalised as Spanish (fraud-risk)", "Complex prior Brazilian marriages requiring Spanish recognition"],
    },
  },

  // ─── More US-bound from Latin America ───
  "CO:US:family": {
    whatCarriesWeight: [
      { label: "Petitioner's USC / LPR status and category", why: "USC-petitioned spouse / minor child clears fastest (12-18 months). Colombia F-class wait times: F2A current; F1 6-8 years; F4 15+ years." },
      { label: "Colombian civil documents from Registraduría Nacional", why: "Civil documents (Registro Civil de Nacimiento / Matrimonio) from Registraduría Nacional del Estado Civil. Apostille via Cancillería (Colombia joined Hague Apostille in 2001)." },
      { label: "Marriage bona-fides for spouse cases", why: "Colombian-American spousal petitions get standard USCIS scrutiny. Strong evidence: relationship-development timeline, photos, joint finances, family integration." },
      { label: "I-864 sponsor income ≥125% federal poverty threshold", why: "Standard requirement. Joint sponsor option if petitioner doesn't qualify alone." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship history", prompt: "Meeting, courtship, marriage. Long-distance courtship is common — document video calls and visit evidence." },
      { heading: "In-person visits", prompt: "Each visit with dates and supporting documentation." },
      { heading: "Plans for US settlement", prompt: "City, petitioner employment, housing." },
    ],
    moneySavingTips: [
      "Cancillería apostille in Bogotá: COP 30,000-50,000 per document. Vastly cheaper than US-based 'international document services'.",
      "Spanish-English translation: most US consulates accept Colombia-based traductores oficiales — verify with embassy before paying for US-side translation.",
      "Bogotá embassy interview wait typically 2-6 months for K-1 / CR-1.",
    ],
    lawyerTriggers: {
      diy: ["Standard USC spouse petition with clean marriage and Colombian documents"],
      getALawyer: ["Beneficiary prior US overstay", "Petitioner prior I-130 history", "Colombian gendered-naturalisation issues for older marriages"],
    },
  },

  // ─── 50-cell completion batch: high-traffic gaps across multiple corridors ───
  "US:FR:work": {
    whatCarriesWeight: [
      { label: "Talent Passport Salarié Qualifié for skilled employees", why: "American senior professionals qualify for the French Talent Passport (Passeport Talent) Salarié Qualifié — French employer + ≥ €43,243/yr salary in 2024. 4-year residence card, renewable. Faster and more reliable than standard work permit + DREETS labour-market test." },
      { label: "Talent Passport Investisseur / Salarié en Mission alternatives", why: "Investisseur for €300k+ investment in French enterprise; Salarié en Mission for intracompany transfer from US parent to French subsidiary. Talent for researchers, artists, founders." },
      { label: "FBI background check + apostille", why: "Same pattern as other US-outbound: FBI Identity History Summary + State Dept apostille + sworn French translation by traducteur assermenté." },
      { label: "French consulate selection", why: "Visa application via French consulate covering your US state of residence (NYC, DC, LA, Chicago, SF, Boston, Houston, Miami, Atlanta, New Orleans). Visa processing 4-8 weeks for Talent Passport." },
    ],
    personalStatementTemplate: [
      { heading: "Role and French employer", prompt: "Company, location, role, salary at or above Talent Passport threshold." },
      { heading: "US credentials", prompt: "Degree, institution, professional certifications relevant to French role." },
      { heading: "Why France", prompt: "Specific city (Paris, Lyon, Toulouse for aerospace, Marseille for tech), project, team." },
      { heading: "Long-term plans", prompt: "Carte de résident after 5 years; French citizenship 5 years (2 for spouses)." },
    ],
    moneySavingTips: [
      "Talent Passport waives the standard DREETS labour-market test — faster, more predictable, no employer hassle.",
      "US-France Tax Treaty avoids double taxation. French CPAM registration from day 1 of French employment.",
      "Don't pay 'French visa agencies' in US $3,000+ — application via VFS or TLScontact (authorised by French consulate) is straightforward."
    ],
    lawyerTriggers: {
      diy: ["Talent Passport with French employer at qualifying salary"],
      getALawyer: ["Investor / entrepreneur route with US-LLC ownership structures", "Self-employment / Freelance Talent Passport", "Prior Schengen refusal"],
    },
  },

  "US:GR:work": {
    whatCarriesWeight: [
      { label: "Greek Golden Visa OR Digital Nomad Visa OR Financially Independent Person Visa", why: "Americans relocating to Greece: (a) Golden Visa via property purchase €250k-€800k (post-2024 reform raised thresholds in Athens / Mykonos / Santorini), (b) Digital Nomad Visa with €3,500+/mo foreign-source income, (c) FIP Visa with €2,000+/mo passive income." },
      { label: "Greek tax-residence (AFM) + Greek bank account", why: "Apply for AFM (Greek tax number) via Greek consulate or in Athens. Open Greek bank account; Golden Visa and DNV require this." },
      { label: "Greek criminal record + US FBI background", why: "Greek criminal record only if previously Greek resident. US FBI background check + State Dept apostille." },
      { label: "Property purchase documentation (for Golden Visa)", why: "Notarised property purchase agreement + property registration certificate (Land Registry). Property purchase via Greek lawyer typically 6-12 weeks end-to-end." },
    ],
    personalStatementTemplate: [
      { heading: "Visa category and qualification basis", prompt: "Golden Visa property + amount, OR DNV income, OR FIP income source." },
      { heading: "Why Greece", prompt: "Specific area (Athens, Thessaloniki, Crete, Cyclades). Climate, cost, lifestyle, Greek-language learning." },
      { heading: "Long-term plans", prompt: "Permanent residence after 5 years; Greek citizenship after 7 years (3 for spouses). Greek descent (jure sanguinis) for Greek-Americans is a faster route." },
    ],
    moneySavingTips: [
      "Greek Golden Visa: €250k threshold remains in many areas outside the post-2024 reform zones — Peloponnese, Crete, Thessaloniki suburbs typically still qualify at the lower threshold.",
      "Greek tax for non-doms: €100,000 flat tax option for new residents with worldwide-income shielding for 15 years (if you qualify).",
      "Don't pay 'Golden Visa agencies' $20,000+ — reputable Greek lawyers handle Golden Visa end-to-end for €5,000-10,000 (still substantial, but realistic).",
    ],
    lawyerTriggers: {
      diy: ["DNV / FIP with clean US income evidence"],
      getALawyer: ["Golden Visa (property purchase has rigorous due diligence and legal complexity)", "Greek descent (jure sanguinis) — civil-status research in Greek registries"],
    },
  },

  "US:NL:work": {
    whatCarriesWeight: [
      { label: "Dutch-American Friendship Treaty (DAFT) for entrepreneurs", why: "DAFT is uniquely available to US nationals: minimum €4,500 invested in a Dutch sole-proprietorship or limited company + business plan + 25% own equity. 2-year initial visa, renewable to 5 years, then permanent residence. No salary threshold, no employer needed." },
      { label: "Highly Skilled Migrant scheme (HSM)", why: "Standard pathway for US employees: Dutch employer with recognised-sponsor status + salary threshold €5,331/mo (30+) or €3,909/mo (under 30). Permit processing typically 2-4 weeks once employer files." },
      { label: "Search Year / Orientation Year (post-study graduates)", why: "American grads of Dutch universities qualify for the 1-year Orientation Year — find work without employer sponsorship. Then transition to HSM if eligible." },
      { label: "US degree recognition", why: "Most accredited US degrees recognised by Dutch universities and employers; Nuffic credential evaluation if formal recognition needed for regulated profession." },
    ],
    personalStatementTemplate: [
      { heading: "Visa category", prompt: "DAFT (entrepreneur), HSM (employee), Orientation Year (graduate), or Search Year." },
      { heading: "US credentials and Dutch sponsor", prompt: "Degree, employer (HSM) or business plan (DAFT)." },
      { heading: "Why the Netherlands", prompt: "Amsterdam tech, Rotterdam logistics, Eindhoven semiconductors. Dutch English-fluency makes integration easy." },
      { heading: "Long-term plans", prompt: "PR after 5 years; Dutch citizenship 5 years (3 for spouses), generally renouncing US nationality." },
    ],
    moneySavingTips: [
      "DAFT is uniquely available to Americans — no other nationality has it. Use this if entrepreneurship is genuine; €4,500 equity is far lower than most investor visa thresholds globally.",
      "HSM salary thresholds are GROSS — total compensation including benefits counts toward the threshold.",
      "30% ruling (Dutch tax incentive for highly skilled migrants): 30% of income tax-free for 5 years. Phased reduction in 2024 — verify current rules with Dutch tax adviser.",
      "Don't pay 'visa agencies' in US $3,000+ — Dutch employer's immigration team handles HSM end-to-end."
    ],
    lawyerTriggers: {
      diy: ["DAFT with clean business plan and €4,500+ equity", "HSM with reputable Dutch employer"],
      getALawyer: ["Complex DAFT business structure", "Prior Schengen refusal"],
    },
  },

  "US:CH:work": {
    whatCarriesWeight: [
      { label: "Permit B work visa (quota-restricted)", why: "Non-EU/EFTA nationals face Swiss work-permit quotas — annual caps by canton. Permit B (1-year renewable) requires Swiss employer + labour-market test (no qualified Swiss/EU candidate) + specialist qualification. Banking, pharma, biotech, watchmaking are common American pathways." },
      { label: "Salary level (significantly above Swiss median)", why: "Swiss authorities require salary at or above the cantonal market rate for the role — typically CHF 90,000+ for entry positions, CHF 150,000+ for senior. Below market rate = refusal." },
      { label: "FBI background check + apostille", why: "US FBI + State Dept apostille. Some cantons require sworn German / French / Italian translation depending on canton language." },
      { label: "Permit C (settlement) after 5 yrs for US nationals", why: "US-Swiss bilateral agreement: Permit C (settlement permit, akin to PR) available after 5 years for US nationals — faster than the standard 10-year track for most non-EU nationalities." },
    ],
    personalStatementTemplate: [
      { heading: "Role and Swiss employer", prompt: "Canton, employer, role, salary. The canton's quota availability matters — Geneva, Zurich most competitive." },
      { heading: "US credentials", prompt: "Degree, professional certifications, specialist expertise justifying labour-market test waiver." },
      { heading: "Why Switzerland", prompt: "Specific industry (banking, pharma, biotech, watchmaking), city, project." },
      { heading: "Long-term plans", prompt: "Permit C after 5 yrs (US-Swiss bilateral); Swiss citizenship typically 10 yrs (years 8-18 count double for the residence calculation)." },
    ],
    moneySavingTips: [
      "Swiss-US bilateral agreement: Permit C in 5 yrs is a major advantage vs standard 10-yr track. Plan around staying with the same canton.",
      "Swiss healthcare insurance is mandatory and PRIVATE — budget CHF 300-500/mo per person. Some employers offer subsidies.",
      "Swiss tax is cantonal — Zug, Schwyz, Nidwalden are low-tax cantons. Zurich and Geneva are higher. Geographic choice has tax implications.",
      "US tax filing (worldwide income) continues — talk to a US-CH cross-border CPA."
    ],
    lawyerTriggers: {
      diy: ["Standard Permit B with reputable Swiss employer in pharma / finance / tech"],
      getALawyer: ["Self-employed / consulting setup in Switzerland", "Quota-driven refusal appeal", "Permit C upgrade complications"],
    },
  },

  "US:JP:study": {
    whatCarriesWeight: [
      { label: "Highly Skilled Foreign Professional (HSP) study-to-work pipeline", why: "Americans pursuing a Japanese postgraduate degree often pursue HSP afterwards — point-based, age + income + education + Japanese language criteria (70+ pts = 3 yrs to PR, 80+ pts = 1 yr to PR). Many top Japanese universities (Tokyo, Kyoto, Waseda, Keio) offer English-medium Master's programmes." },
      { label: "Certificate of Eligibility (CoE) for the student visa", why: "Japanese university files CoE application with Japanese Immigration Bureau. 1-3 months processing; you take CoE to Japanese embassy in US for visa stamping (1-2 weeks)." },
      { label: "MEXT / Japanese government scholarships", why: "MEXT Research / Undergraduate / Special Training scholarships fully cover tuition + monthly stipend + travel. Highly competitive — apply 12-18 months ahead through Japanese embassy in US." },
      { label: "Japanese language (variable by programme)", why: "English-medium programmes don't require Japanese at admission. Traditional programmes require JLPT N2+. EJU (Examination for Japanese University Admission) for undergrad applicants." },
    ],
    personalStatementTemplate: [
      { heading: "Programme and Japanese institution", prompt: "Specific programme, university, faculty / supervisor for research roles." },
      { heading: "US credentials", prompt: "Degree, GPA, prior research / publications." },
      { heading: "Why Japan", prompt: "Specific research focus, faculty, industry exposure post-graduation." },
      { heading: "Long-term plans", prompt: "Post-graduation: Designated Activities (Job-Hunting) extends 6-12 mo to find work; transition to HSP for PR fast-track." },
    ],
    moneySavingTips: [
      "MEXT scholarship fully funds tuition + ~JPY 144,000-148,000/mo stipend + flights. Apply 12-18 mo ahead through Japanese embassy in US.",
      "Japan-US Social Security Totalization Agreement applies once you transition from student to worker.",
      "Don't pay 'Japan visa agencies' in US — CoE filed by Japanese university; visa stamping at embassy is straightforward.",
    ],
    lawyerTriggers: {
      diy: ["Standard MEXT-funded or self-funded study with reputable Japanese institution"],
      getALawyer: ["Conversion from student to HSP", "Self-employed / startup founder post-study", "Prior Japanese refusal"],
    },
  },

  "DE:US:family": {
    whatCarriesWeight: [
      { label: "USC / LPR petitioner and category", why: "USC-petitioned German spouse (CR-1/IR-1, 12-18 mo) or minor child clears fastest. Germany F-class wait times: F2A current; F1 6-8 yrs; F4 15+ yrs." },
      { label: "German civil documents (Standesamt)", why: "Birth, marriage, divorce certificates from the responsible Standesamt (registry office). Apostilled via Bezirksregierung or equivalent state authority. Sworn English translation by court-certified translator." },
      { label: "Marriage bona-fides for spouse cases", why: "German-American spousal petitions get standard USCIS scrutiny. Strong evidence: relationship-development timeline, photos across years, joint finances, family integration, video-call records during long-distance periods." },
      { label: "I-864 financial sponsorship", why: "Standard ≥125% federal poverty threshold via petitioner's tax transcripts + W-2. Joint sponsor option if needed." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship history", prompt: "Meeting, courtship, marriage. Document long-distance pattern with communication evidence if applicable." },
      { heading: "In-person visits", prompt: "Each visit with passport stamps and supporting evidence." },
      { heading: "Plans for US settlement", prompt: "City, petitioner's employment, housing." },
    ],
    moneySavingTips: [
      "German apostille via Bezirksregierung (state authority): typically €10-25 per document. Avoid 'international apostille services' charging 5× more.",
      "Frankfurt embassy interview waits typically 2-6 months for K-1 / CR-1.",
      "K-1 fiancé(e) total cost ~$2,500 in official fees. CR-1 spousal ~$1,500-2,000. Reputable US-DE immigration lawyers charge $1,500-3,000 for end-to-end work.",
    ],
    lawyerTriggers: {
      diy: ["Standard USC spouse petition with clean marriage and German apostilled documents"],
      getALawyer: ["Beneficiary's prior US overstay or refusal", "Petitioner's prior I-130 history", "Complex prior German marriages requiring US recognition"],
    },
  },

  // Family routes for high-traffic origins
  "PH:CA:family": {
    whatCarriesWeight: [
      { label: "Sponsor's Canadian status (citizen vs PR)", why: "Canadian citizens may sponsor from abroad; PRs must live in Canada when sponsoring. Sponsor must not have received social assistance (non-disability) in prior 12 months, not in default on prior sponsorship undertaking." },
      { label: "Marriage / common-law genuineness", why: "Filipino-Canadian marriages get standard IRCC scrutiny. Strong evidence: relationship timeline, in-person visits (despite distance), joint finances if cohabited, family integration, photo evidence across years, video-call communication records." },
      { label: "PSA-certified Philippine civil documents", why: "Birth, marriage, divorce / annulment documents from Philippine Statistics Authority (PSA). Authenticated as needed for Canadian use." },
      { label: "Sponsor's financial undertaking (3-yr spouse; 20-yr parent)", why: "Spousal sponsorship has no formal income threshold but income evidence strengthens commitment. Parental sponsorship has higher income thresholds and 3-yr Low-Income Cut-Off (LICO) requirement." },
    ],
    personalStatementTemplate: [
      { heading: "How you met and how the relationship developed", prompt: "Meeting, courtship (often via family in Filipino context — that's fine, document), engagement, marriage." },
      { heading: "In-person meetings", prompt: "Each visit with passport stamps and supporting evidence." },
      { heading: "Communication during separation", prompt: "WhatsApp / video call records, photo timelines." },
      { heading: "Plans for Canada", prompt: "Where you'll settle, sponsor's employment, housing." },
    ],
    moneySavingTips: [
      "Spousal sponsorship fees: CAD$1,205 (processing) + CAD$85 (biometrics) + CAD$515 (right of permanent residence) = ~CAD$1,800 per applicant.",
      "Philippine PSA-issued documents: PHP 155-365 per document; orders of magnitude cheaper than 'international document authentication' agencies.",
      "Don't pay Manila-based 'visa fixers' $3,000+ — Canadian spousal sponsorship is self-serve via IRCC. CICC-licensed consultants in Canada charge CAD$2,000-4,000 for full representation if needed.",
    ],
    lawyerTriggers: {
      diy: ["Standard spousal sponsorship with extended courtship documentation"],
      getALawyer: ["Short courtship + immediate sponsorship (fraud-presumption risk)", "Sponsor's prior refused sponsorship", "Polygamous prior marriage in Philippines"],
    },
  },

  "IN:DE:family": {
    whatCarriesWeight: [
      { label: "Family reunification under § 28-32 Aufenthaltsgesetz", why: "Indian spouses of German residents / citizens apply via family reunification permit. Sponsor must hold German residence and meet income / housing requirements (Bedarfsdeckung)." },
      { label: "Pre-arrival German A1 language certificate", why: "Indian spouses must pass A1 German (Goethe-Institut A1 or equivalent) BEFORE applying for family-reunification visa. Exception: highly skilled / Blue Card spouses are exempt." },
      { label: "Indian civil documents apostilled", why: "Birth, marriage documents apostilled by Indian state-level Ministry of External Affairs. India joined Hague Apostille effective 2005. Sworn German translation by a German-certified translator." },
      { label: "Sponsor's stable residence and adequate income/housing", why: "Sponsor's German residence permit + employer letter + payslips + rental contract sized for the joining family." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship to German sponsor", prompt: "Marriage details — date, place, registry. Sponsor's German residence status." },
      { heading: "German A1 language certificate", prompt: "Goethe-Institut A1 / TestDaF A1 reference. Spouse of Blue Card / HSP holder is exempt." },
      { heading: "Indian original documents", prompt: "Apostilled birth / marriage with sworn German translation." },
      { heading: "Plans in Germany", prompt: "City, sponsor's employer, schools (if children)." },
    ],
    moneySavingTips: [
      "Goethe-Institut A1 in India: INR 8,000-15,000 + 2-4 months prep. Pass first try — re-takes add up.",
      "Indian apostille: MEA fees ~INR 50-100 per document. Avoid 'agencies' charging INR 2,000+ for the same outcome.",
      "Blue Card / HSP spouse exemption from A1 requirement saves substantial time and cost — verify with German embassy that exemption applies.",
    ],
    lawyerTriggers: {
      diy: ["Standard spouse-of-Blue-Card with A1 exemption + clean Indian documents"],
      getALawyer: ["Sponsor's complex residence status", "Indian gendered-naturalisation prior issues", "Prior Schengen refusal"],
    },
  },

  // ─── Student route additions ───
  "DE:US:study": {
    whatCarriesWeight: [
      { label: "I-20 from a SEVP-certified US institution", why: "German students applying for F-1 need I-20 from accredited US university. German-American institutions (German-American Heritage Foundation scholarships) common. Public Ivies and STEM grad programs most-applied-to." },
      { label: "Financial capacity for 1 year tuition + living", why: "Bank statements showing first-year tuition + ~$20-30k living expenses. German students often documented via parental sponsorship + parent income." },
      { label: "Genuine non-immigrant intent (214(b))", why: "German applicants typically pass 214(b) cleanly — strong home ties + EU citizenship + clear graduation-and-return narrative." },
      { label: "Berlin / Frankfurt / Munich consulate processing", why: "German consulates process student visas typically 1-4 weeks. Interview waiver expanded post-2023 for prior US visa holders." },
    ],
    personalStatementTemplate: [
      { heading: "US programme and university", prompt: "Specific programme, university, faculty / research opportunity." },
      { heading: "German educational background", prompt: "Abitur, prior degrees, GPA equivalent." },
      { heading: "Why US over German programmes", prompt: "Specific research, faculty, industry exposure, network." },
      { heading: "Financial sponsorship", prompt: "Parental income, scholarship, savings." },
    ],
    moneySavingTips: [
      "DAAD scholarships for German students at US institutions: comprehensive funding (tuition + living + flights). Apply 12 months ahead.",
      "F-1 SEVIS fee ($350) + visa fee ($185) = $535 total US-government fees. Don't pay 'agencies' more than $200 for support.",
      "OPT (Optional Practical Training) 12 months post-graduation + 24-month STEM extension — strong post-study employability for German students in US tech.",
    ],
    lawyerTriggers: {
      diy: ["First-time F-1 to reputable US institution"],
      getALawyer: ["Prior F-1 refusal", "F-1 to H-1B conversion with cap-gap timing", "Prior US overstay or fraud"],
    },
  },

  "ZA:US:study": {
    whatCarriesWeight: [
      { label: "I-20 + SEVP-certified institution", why: "South African students typically target US public R1 universities + Ivies. I-20 from accredited institution after tuition deposit." },
      { label: "Financial capacity in ZAR / USD", why: "Bank statements showing 1-year tuition + living. South African currency fluctuation requires conservative documentation — show USD-equivalent value plus the underlying ZAR." },
      { label: "Genuine non-immigrant intent (214(b))", why: "South African first-time student applicants typically pass 214(b) cleanly with strong family / property ties and clear graduation plan." },
      { label: "Johannesburg / Cape Town consulate processing", why: "Visa wait times at Johannesburg / Cape Town typically 4-12 weeks. Plan accordingly." },
    ],
    personalStatementTemplate: [
      { heading: "US programme and university", prompt: "Specific programme, faculty, research." },
      { heading: "South African educational background", prompt: "Matric, prior degrees, achievements." },
      { heading: "Why US over UK / Aus alternatives", prompt: "South African students choose US for STEM research depth, business school networks, athletic scholarships." },
      { heading: "Financial sponsorship", prompt: "Parental income, scholarship (Mandela Rhodes, Fulbright), savings." },
    ],
    moneySavingTips: [
      "Fulbright South Africa, Mandela Rhodes, Rhodes Trust scholarships fund top South African students at US institutions.",
      "F-1 visa total US fees ~$535. Don't pay agencies more than $200.",
      "OPT + STEM extension is a strong differentiator — South African STEM grads in US tech are common.",
    ],
    lawyerTriggers: {
      diy: ["First-time F-1 with clean documentation"],
      getALawyer: ["Prior F-1 refusal", "F-1 to H-1B with cap-gap timing"],
    },
  },

  // ─── Visit visas (high-traffic) ───
  "IN:GB:tourism": {
    whatCarriesWeight: [
      { label: "Standard Visitor visa with strong ties to India", why: "Indian Standard Visitor visa refusal rates run 10-20% for first-time applicants. Strong ties documentation (employer letter, salary, property, family, prior compliant travel) is the single biggest lever." },
      { label: "Six months of bank statements + ITRs", why: "UKVI scrutinises Indian financial documentation carefully. Salaried applicants: 6 months payslips + bank statements + 2 years ITR. Self-employed: business registration + 2 years ITR + bank statements." },
      { label: "Sponsor invitation + sponsor's UK status (if family-sponsored)", why: "If UK-based relative sponsors: invitation letter + sponsor's UK status (BRP / settled status / British passport) + sponsor's bank statements + payslips + accommodation details." },
      { label: "Detailed itinerary + return ticket + travel insurance", why: "Day-by-day itinerary with hotel bookings; refundable bookings via Booking.com are fine. Confirmed return flight. Travel insurance covering medical." },
    ],
    personalStatementTemplate: [
      { heading: "Trip purpose and length", prompt: "Specific purpose (tourism, business meeting, family event), exact dates, length of stay." },
      { heading: "Ties to India", prompt: "Employer / business, property, family." },
      { heading: "Funding", prompt: "Own income evidence OR sponsor's documentation." },
      { heading: "Prior international travel", prompt: "Document any Schengen / US / Canada / Aus / UAE / Singapore travel — establishes compliant pattern." },
    ],
    moneySavingTips: [
      "Standard Visitor visa is £127 (single entry, 6-month validity). Long-term options: 2-year (£475), 5-year (£848), 10-year (£1,059) multi-entry. Cost-per-trip falls sharply with long-term.",
      "VFS Global is the authorised UK visa-application centre in India — straightforward submission. Don't pay 'agents' beyond VFS's own service fees.",
      "UK Settlement Visa is unrelated to Visitor visa — don't confuse forms or fees.",
    ],
    lawyerTriggers: {
      diy: ["Standard Visitor with strong ties and clean documentation"],
      getALawyer: ["Prior UK refusal — appeal or fresh-application strategy", "Complex prior UK overstay or immigration history"],
    },
  },

  "NG:US:tourism": {
    whatCarriesWeight: [
      { label: "B-1/B-2 ties evidence with elevated scrutiny", why: "Nigerian B-visa refusal rates run 30-55% for first-time applicants under 214(b). Strong documentation: long-term employer + salary, fixed assets in Nigeria, family responsibilities, prior international travel history." },
      { label: "Bank statements + tax returns + asset documentation", why: "12 months consistent income evidence + property ownership + business registration if applicable. Random one-off deposits flagged as fraud indicators." },
      { label: "Sponsor's I-134 (if family-sponsored)", why: "US-based relative's I-134 Declaration of Financial Support + tax transcripts + W-2 + bank statements." },
      { label: "Detailed itinerary + hotel + return flight", why: "Specific dates, accommodations, planned activities. Vague itineraries trigger 214(b) refusals." },
    ],
    personalStatementTemplate: [
      { heading: "Trip purpose and dates", prompt: "Specific dates, purpose (family visit, tourism, conference), and length of stay." },
      { heading: "Roots in Nigeria", prompt: "Employer, position, length of service, property, family." },
      { heading: "How funded", prompt: "Own income OR sponsor's I-134 + documentation." },
      { heading: "Prior travel", prompt: "Document Schengen / UK / Canada / UAE / South Africa travel history." },
      { heading: "Return plan", prompt: "Specific reason you'll return on schedule — pending work, school, parental responsibility." },
    ],
    moneySavingTips: [
      "Lagos and Abuja interview waits run 8-18 months — third-country interview available (most commonly: Accra, Johannesburg, London) with shorter waits.",
      "Interview waiver eligibility expanded in 2024 — prior US visa holders within 48 months may qualify. Saves the interview wait entirely.",
      "DV (Diversity Visa) Lottery for Nigerian nationals: ineligibility for some years; check current eligibility list. DV is fee-free at entry stage."
    ],
    lawyerTriggers: {
      diy: ["First-time B-visa with very strong ties to Nigeria and prior compliant international travel"],
      getALawyer: ["Prior 214(b) refusal — strategic reframing", "Prior US overstay / immigration violation"],
    },
  },

  // ─── Investor / business visas ───
  "CN:US:work": {
    whatCarriesWeight: [
      { label: "EB-5 Investor + L-1 Intracompany Transfer + H-1B Cap-Subject", why: "Chinese applicants face the longest EB-2 / EB-3 backlogs (50+ years for priority-date current). EB-5 ($800k-$1.05M investment in TEA-designated US enterprise) remains accessible. L-1 from Chinese MNCs to US subsidiaries is common. H-1B subject to standard lottery." },
      { label: "EB-5 capital sourcing documentation", why: "Chinese EB-5 applicants must document lawful source of investment funds — typically property sales, business income, or inheritance. Documentation rigor is substantial; bank-trail evidence over 5+ years." },
      { label: "Section 221(g) administrative processing risk", why: "Chinese applicants in sensitive STEM categories face 221(g) holds under Presidential Proclamation 10043. Allow 60-180 days; F/J/H visas most affected." },
      { label: "Beijing / Shanghai / Guangzhou consulate processing", why: "Interview waits typically 2-8 weeks for B/F/J/H/L. Interview waiver expanded post-2023 for prior visa holders." },
    ],
    personalStatementTemplate: [
      { heading: "Visa category basis", prompt: "EB-5 investment + amount + TEA designation; L-1 qualifying organisation; H-1B employer + role." },
      { heading: "Chinese credentials + CHESICC authentication", prompt: "Degree, institution, CHESICC reference." },
      { heading: "Why this US role / project", prompt: "Specific industry, project, team. Avoid sensitive STEM industries where 221(g) holds are common." },
      { heading: "Long-term plans", prompt: "EB-5 path to PR is direct; L-1A path to EB-1C green card; H-1B path is via employer-sponsored EB-2 / EB-3 (Chinese backlogs 50+ years)." },
    ],
    moneySavingTips: [
      "EB-5 regional centre vs direct investment: regional centre route is more passive but TEA designation requirements changed post-2022 — verify current rules.",
      "Chinese-US Totalization Agreement does NOT exist — Chinese applicants pay full US Social Security from day 1 of US employment (no exemption).",
      "Don't pay 'EB-5 promoters' beyond their disclosed regional-centre fees — investment-funds documentation is the largest cost. Reputable US immigration lawyers charge $15,000-30,000 for EB-5 representation."
    ],
    lawyerTriggers: {
      diy: ["Almost never DIY for Chinese applicants given complexity and STEM scrutiny"],
      getALawyer: ["EB-5 investment (substantial legal complexity)", "Self-petitioning O-1 / EB-1A", "Any STEM category where 221(g) risk applies", "Prior US visa refusal or 221(g) hold"],
    },
  },

  "RU:GE:work": {
    whatCarriesWeight: [
      { label: "Georgia visa-free for Russian nationals (1-year stay)", why: "Russian nationals enter Georgia visa-free for up to 1 year — among the longest visa-free regimes globally. Major destination for Russian remote workers post-2022. No employer sponsorship needed for visa-free residence." },
      { label: "Georgian tax-residence (183-day rule)", why: "After 183 days in Georgia in a calendar year, you may become Georgian tax-resident. Georgia's Individual Entrepreneur status offers 1% income tax for businesses under GEL 500k/yr — popular with Russian remote workers." },
      { label: "Georgian bank account (post-2022 stricter compliance)", why: "Georgian banks tightened account-opening for Russian nationals post-February 2022. TBC Bank, Bank of Georgia require detailed source-of-funds documentation. Allow 2-4 weeks." },
      { label: "Russian background documents (limited availability post-2022)", why: "Russian background-check documents (справка о судимости) issued by Russian MVD — apostille via Russian MFA. Plan around restricted-document timelines if applying remotely." },
    ],
    personalStatementTemplate: [
      { heading: "Why Georgia", prompt: "Cost, visa-free duration, language access (Russian widely spoken), tech ecosystem in Tbilisi / Batumi." },
      { heading: "Income source", prompt: "Foreign-source clients / employer — common pattern for Russian remote workers." },
      { heading: "Long-term intent", prompt: "Permanent residence after 6 years continuous (10 yrs for non-CIS); Georgian citizenship typically requires Georgian-language proficiency." },
    ],
    moneySavingTips: [
      "Georgian Individual Entrepreneur 1% tax regime is uniquely advantageous — file with Revenue Service Georgia; €50 setup + 1% on revenue under GEL 500k.",
      "Georgian banking for Russian nationals: TBC and Bank of Georgia have published procedures for source-of-funds review. Don't try to circumvent — refusal stuck for 6+ months.",
      "Don't pay 'relocation services' charging $5,000+ — visa-free entry + tax-residence + bank account is self-serve with patience.",
    ],
    lawyerTriggers: {
      diy: ["Visa-free entry + IE tax-status registration"],
      getALawyer: ["Complex source-of-funds documentation for bank account", "Permanent residence application (6 yr CIS / 10 yr non-CIS)"],
    },
  },

  // ─── More tourism + visit cells ───
  "AE:GB:tourism": {
    whatCarriesWeight: [
      { label: "Emirati passport visa-free + UK ETA from 2024", why: "Emirati passport holders enter UK visa-free for 6 months. UK ETA (£10, 2-year validity) required from 2024 — apply at gov.uk before boarding." },
      { label: "UAE-resident expat applicants use original-passport rules", why: "UAE residents who are NOT Emirati nationals (most UAE expats) need visas based on their original passport. UAE residence does not confer UK visa-free entry." },
      { label: "Bank statements + employer letter", why: "Standard tie evidence — employer letter showing salary + UAE residence permit + 6 months bank statements." },
      { label: "Return flight + accommodation evidence", why: "Standard visitor documentation." },
    ],
    personalStatementTemplate: [
      { heading: "Trip purpose and dates", prompt: "Tourism / business / family — specific dates and length." },
      { heading: "UAE ties (for non-Emirati)", prompt: "Employer letter, residence permit, family in UAE." },
      { heading: "Funding", prompt: "Own income or sponsor documentation." },
    ],
    moneySavingTips: [
      "Emirati nationals: ETA £10, 2-year multi-entry validity — apply once, use across many trips.",
      "Non-Emirati UAE expats: apply based on original passport rules, not UAE residence — this is the most-common confusion point."
    ],
    lawyerTriggers: {
      diy: ["Emirati national with ETA OR non-Emirati expat with strong original-passport-country ties"],
      getALawyer: ["Prior UK refusal", "Complex UAE residence + original-passport documentation"],
    },
  },

  // Long-stay across additional EU members
  "PT:NL:work": {
    whatCarriesWeight: [
      { label: "EU freedom of movement (no work permit required)", why: "Portuguese citizens have unrestricted right to work in the Netherlands under EU Treaty. No work permit, no employer sponsorship, no salary threshold required. Register at the local Gemeente within 5 days of arrival." },
      { label: "BSN (Burgerservicenummer) registration", why: "Required for Dutch employment and tax. Issued at Gemeente registration — bring rental contract + passport + landlord consent." },
      { label: "30% ruling eligibility (if highly-skilled recruit)", why: "Highly-skilled migrants relocated to NL may qualify for 30% ruling (30% of salary tax-free for 5 years). Portuguese applicants from non-NL salary baseline qualify subject to recruitment conditions." },
      { label: "Health insurance (Zorgverzekering mandatory)", why: "Mandatory from day 1 of Dutch residence. ~€140-160/mo per adult. Premium subsidies (zorgtoeslag) available for lower earners." },
    ],
    personalStatementTemplate: [
      { heading: "Where you'll live and work", prompt: "Dutch city + employer. EU citizens — no justification needed." },
      { heading: "Tax setup", prompt: "Employer's payroll setup handles most of this — your role is the Gemeente registration." },
      { heading: "Long-term plans", prompt: "PR after 5 yrs; Dutch citizenship 5 yrs (3 for spouses), generally renouncing original nationality." },
    ],
    moneySavingTips: [
      "30% ruling phased down in 2024 — verify current rules with HR. Significant first-5-year tax savings.",
      "Portuguese-Dutch Tax Treaty avoids double taxation.",
      "Statutory NL health insurance ~€140-160/mo — premium subsidies (zorgtoeslag) up to ~€127/mo for lower earners. Apply via Belastingdienst.",
    ],
    lawyerTriggers: {
      diy: ["Standard EU intra-bloc move"],
      getALawyer: ["Self-employed / freelance setup", "30% ruling complications", "Cross-border tax-residence ambiguity"],
    },
  },

  "ES:DE:work": {
    whatCarriesWeight: [
      { label: "EU freedom of movement (no work permit required)", why: "Spanish citizens have full right to work in Germany under the EU Treaty. No work permit, no employer sponsorship, no salary threshold. Anmeldung at local Bürgeramt within 14 days." },
      { label: "Anmeldung + Steueridentifikationsnummer + health insurance", why: "Standard Germany-setup chain: Anmeldung → tax ID by post → employer payroll → statutory or private health insurance." },
      { label: "Spanish-German Tax Treaty + Totalization", why: "Avoids double taxation. Social-security totalization preserves Spanish contributions; pension entitlements port at retirement." },
      { label: "Recognition of Spanish professional qualifications (regulated professions)", why: "EU recognition is generally smooth (doctors, lawyers, engineers under mutual-recognition directives). Some sectoral exams may apply." },
    ],
    personalStatementTemplate: [
      { heading: "City + employer", prompt: "German city + employer. EU citizens — no justification needed." },
      { heading: "Tax + insurance setup", prompt: "Employer handles most; your role is Anmeldung within 14 days." },
      { heading: "Long-term plans", prompt: "EU citizens retain freedom; German citizenship after 5 yrs (post-2024 reform)." },
    ],
    moneySavingTips: [
      "Spanish-German Tax Treaty + Totalization: optimise via cross-border accountant in year of move.",
      "Statutory health insurance ~14.6% income split with employer — typically cheaper than private at €60-90k salary range.",
      "Goethe-Institut B1 German achieves citizenship eligibility (post-2024 reform reduces to 5 yrs with B1)."
    ],
    lawyerTriggers: {
      diy: ["Standard EU intra-bloc move"],
      getALawyer: ["Regulated profession recognition complications", "Self-employed / cross-border invoicing setup"],
    },
  },

  // Filling gaps for remaining high-traffic cells
  "TH:AU:work": {
    whatCarriesWeight: [
      { label: "Subclass 482 with Australian sponsor", why: "Thai professionals in hospitality, healthcare, IT widely sponsor 482. Standard TSMIT ≥ AUD$73,150. Skills assessment via the appropriate ANZSCO authority (Vetassess for most non-trade roles)." },
      { label: "Working Holiday subclass 462 (under-31 alternative)", why: "Thailand is in the subclass 462 Work and Holiday list — 12 months freedom, employer-flexibility. Annual quota; apply early in the visa year." },
      { label: "English-language testing", why: "Most Thai applicants need IELTS 5.5+ for 482 (varies by occupation). Healthcare professionals often need OET 7.0+." },
      { label: "Thai police certificate (ใบรับรองความประพฤติ)", why: "Issued via Royal Thai Police Headquarters; ~2-3 weeks. Authenticated for Australian use." },
    ],
    personalStatementTemplate: [
      { heading: "Australian role and sponsor", prompt: "ANZSCO occupation, company, salary." },
      { heading: "Thai credentials + Vetassess outcome", prompt: "Thai degree, employer history, skills-assessment reference." },
      { heading: "English-language results", prompt: "IELTS / OET / PTE bands per skill." },
      { heading: "Settlement plan", prompt: "City, partner work plans, school plans if children." },
    ],
    moneySavingTips: [
      "Thai 462 Working Holiday: AUD$650 + 12 months freedom. Annual quota — apply early.",
      "Thailand-Australia Free Trade Agreement (TAFTA) doesn't create special visa — standard 482 pathway.",
      "Subclass 482 → 186 ENS PR after 2-3 yrs — honest long-term intent welcomed.",
    ],
    lawyerTriggers: {
      diy: ["Standard 482 with reputable Australian employer"],
      getALawyer: ["Subclass 462 with refusal history", "Self-employed via own Australian-company sponsorship"],
    },
  },

  "PH:AE:family": {
    whatCarriesWeight: [
      { label: "UAE family visa via Emirati or UAE-resident sponsor", why: "Filipino spouses / dependent children of UAE-resident sponsors (Emirati national or UAE-resident expat) can apply for UAE family visa (Iqama). Sponsor's salary determines eligibility — typically AED 4,000+/mo for spouses." },
      { label: "Apostilled Philippine documents", why: "Marriage / birth certificates from PSA; apostille via Philippine Department of Foreign Affairs (DFA). UAE accepts apostille from 2024 (joined Hague). English translation via authorised translator." },
      { label: "UAE medical fitness test + Emirates ID", why: "Mandatory medical fitness test at UAE arrival; Emirates ID issued after. Required for residence-visa stamping." },
      { label: "Sponsor's UAE residence + employer letter", why: "Sponsor's Emirates ID + employer letter confirming salary + tenancy contract sized for family." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship to UAE-resident sponsor", prompt: "Marriage date / civil registry. Spouse's UAE residence status, employer, salary." },
      { heading: "Plans in UAE", prompt: "Which emirate (Dubai / Abu Dhabi / Sharjah most common), housing, school plans for children." },
      { heading: "Long-term plans", prompt: "UAE has no automatic PR — family visa continues alongside sponsor's underlying residence." },
    ],
    moneySavingTips: [
      "PSA-issued documents at Philippine Embassy in UAE: convenient if you're already there; turnaround 1-2 weeks.",
      "DFA apostille fees: PHP 200 + courier. Avoid 'agencies' charging PHP 2,000+.",
      "UAE family visa fee structure changed in 2024 — verify current fees with GDRFA (Dubai) or Federal Authority for Identity (Abu Dhabi)."
    ],
    lawyerTriggers: {
      diy: ["Standard spouse visa with clean sponsor documentation"],
      getALawyer: ["Sponsor's complex residence status (Golden Visa, freelancer, etc.)", "Prior UAE deportation or violation"],
    },
  },

  // ─── More residence-route cells (rounding to 100) ───
  "AE:CA:family": {
    whatCarriesWeight: [
      { label: "Sponsor's Canadian status (citizen vs PR)", why: "Canadian citizens may sponsor from abroad; PRs must reside in Canada. Sponsor must meet financial criteria and prior-sponsorship-history requirements." },
      { label: "Emirati / UAE-resident expat: documentation pathway varies", why: "Emirati passport holders: UAE-issued civil documents apostilled. Non-Emirati UAE residents: original-passport-country civil documents required (UAE residence doesn't replace original-country documentation)." },
      { label: "UAE Police Certificate + original-country PCC", why: "UAE PCC via Ministry of Interior (Dubai Police / Abu Dhabi). Original-country PCC additionally required for the sponsored spouse's nationality." },
      { label: "Marriage bona-fides", why: "Standard IRCC scrutiny applies. Strong evidence: relationship timeline, in-person visits, joint finances, family integration." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship history and current arrangement", prompt: "Marriage details, current living arrangement (UAE-based vs Canada-based)." },
      { heading: "In-person visits", prompt: "Document each visit." },
      { heading: "Plans for Canada", prompt: "Settlement city, sponsor's employment, housing." },
    ],
    moneySavingTips: [
      "UAE apostille (post-2024): efficient and inexpensive via MoFAIC.",
      "Spousal sponsorship total fees ~CAD$1,800.",
      "Canadian visa-application processing for UAE residents typically via VFS Dubai — straightforward.",
    ],
    lawyerTriggers: {
      diy: ["Standard spousal sponsorship with clean UAE / original-country documentation"],
      getALawyer: ["Sponsor's prior refused sponsorship", "Beneficiary's prior Canadian refusal"],
    },
  },

  "TR:NL:work": {
    whatCarriesWeight: [
      { label: "Highly Skilled Migrant scheme OR EU Blue Card", why: "Turkish nationals: standard HSM pathway. Recognised-sponsor employer + salary threshold €5,331/mo (30+) or €3,909/mo (under 30). EU Blue Card at €5,331/mo for shortage occupations." },
      { label: "Turkish degree credential evaluation", why: "Nuffic evaluation for degree recognition. Boğaziçi, METU, Sabancı, Bilkent are well-recognised; provincial universities may need formal Nuffic certification." },
      { label: "Turkish apostille + IND processing", why: "Turkish documents apostilled by Provincial Vali (governor). Dutch IND processing typically 2-4 weeks for HSM with recognised sponsor." },
      { label: "Health insurance from day 1", why: "Zorgverzekering mandatory; ~€140-160/mo per adult. Premium subsidies for lower earners." },
    ],
    personalStatementTemplate: [
      { heading: "Role and Dutch employer", prompt: "Employer (must be recognised IND sponsor), role, salary above HSM threshold." },
      { heading: "Turkish credentials and Nuffic evaluation", prompt: "Degree, institution, Nuffic reference." },
      { heading: "Why the Netherlands", prompt: "Industry, city, project." },
      { heading: "Long-term plans", prompt: "PR after 5 yrs; Dutch citizenship 5 yrs (3 for spouses), generally renouncing original nationality." },
    ],
    moneySavingTips: [
      "30% ruling tax incentive: 30% of salary tax-free for 5 yrs for highly-skilled migrants — phased reduction 2024.",
      "Turkish-Dutch Tax Treaty avoids double taxation.",
      "Don't pay agencies €3,000+ — Dutch employer's immigration team handles HSM end-to-end."
    ],
    lawyerTriggers: {
      diy: ["Standard HSM with recognised Dutch sponsor"],
      getALawyer: ["DAFT-equivalent doesn't exist for Turks; entrepreneur route is more complex", "Prior Schengen refusal"],
    },
  },

  // ─── Additional retirement / passive-income cells ───
  "GB:PA:family": {
    whatCarriesWeight: [
      { label: "Friendly Nations Visa (UK is on the list)", why: "UK nationals qualify for Panama's Friendly Nations Visa — 2-year provisional residence + permanent residence. Requires economic tie: real-estate purchase ($200k+) OR Panamanian employment OR business setup, AND clean criminal record." },
      { label: "Apostilled UK ACRO Police + birth / marriage", why: "ACRO via UK Government's ACRO Criminal Records Office + FCDO apostille. Birth / marriage certificates from GRO + FCDO apostille." },
      { label: "Health certificate + bank reference", why: "Health certificate from authorised Panamanian or UK doctor (translated and authenticated). Panamanian bank reference letter showing financial standing." },
      { label: "Real-estate purchase OR business setup documentation", why: "Property: notarised purchase agreement + property registration. Business: registered Panamanian company with operational activity." },
    ],
    personalStatementTemplate: [
      { heading: "Economic tie", prompt: "Real-estate purchase, employment, or business — name specifically." },
      { heading: "Why Panama", prompt: "Specific area (Panama City, Boquete, Coronado, Bocas del Toro), retirement / lifestyle drivers." },
      { heading: "Long-term plan", prompt: "Provisional 2 yrs → PR. Panamanian citizenship after 5 yrs. Territorial tax means UK pension income is tax-free in Panama." },
    ],
    moneySavingTips: [
      "Panama's territorial tax: no Panamanian tax on UK pension or foreign-source income. UK State Pension paid into Panama (frozen — not uprated annually).",
      "Coronado / Boquete properties under $300k commonly meet Friendly Nations $200k threshold.",
      "Don't pay 'visa fixers' £5,000+ — Panamanian immigration lawyers charge $3,000-5,000 for end-to-end Friendly Nations."
    ],
    lawyerTriggers: {
      diy: ["Standard Friendly Nations with real-estate purchase and apostilled UK documents"],
      getALawyer: ["Complex business-setup route", "Prior Panamanian refusal"],
    },
  },

  "FR:US:study": {
    whatCarriesWeight: [
      { label: "I-20 from SEVP-certified institution", why: "French students applying for F-1 need I-20 from accredited US university. Common French target schools: HEC / ESSEC / ESCP doing dual-degree with US business schools; Sciences Po doing dual with Columbia, etc." },
      { label: "Financial capacity for 1 year of tuition + living", why: "Bank statements showing first-year cost. Parental sponsorship + tax / income evidence common." },
      { label: "Genuine non-immigrant intent (214(b))", why: "French students pass 214(b) cleanly with strong home ties and clear post-graduation plan." },
      { label: "Paris / Marseille / other French consulate processing", why: "Student visa processing typically 1-4 weeks. Interview waiver expanded post-2023." },
    ],
    personalStatementTemplate: [
      { heading: "US programme and university", prompt: "Specific programme, faculty, research depth." },
      { heading: "French educational background", prompt: "Baccalauréat, prior degrees, grandes écoles affiliations." },
      { heading: "Why US", prompt: "Specific research, industry exposure, network." },
      { heading: "Financial sponsorship", prompt: "Parental income, scholarship (Eiffel, Fulbright), savings." },
    ],
    moneySavingTips: [
      "Fulbright France: substantial funding for French grads at US institutions. Apply 12 months ahead.",
      "OPT + STEM extension for French STEM students in US tech — strong differentiator.",
      "F-1 total US fees ~$535. Don't overpay agents."
    ],
    lawyerTriggers: {
      diy: ["First-time F-1 with clean documentation"],
      getALawyer: ["Prior F-1 refusal", "F-1 to H-1B / OPT transitions"],
    },
  },

  // ─── A few more high-traffic family + visit corridors ───
  "NG:US:family": {
    whatCarriesWeight: [
      { label: "USC / LPR petitioner and category timing", why: "USC-petitioned spouse (12-18 mo) or minor child clears fastest. Nigeria F-class wait times: F2A current; F1 6-8 years; F4 15+ years." },
      { label: "Nigerian civil documents from National Population Commission", why: "Birth / marriage / divorce documents from NPC. Authenticated. Apostille via Nigerian MFA (Nigeria joined Hague effective 2024)." },
      { label: "Marriage bona-fides scrutiny", why: "Nigerian-American spousal cases get heightened USCIS scrutiny vs OECD baseline. Strong evidence essential — relationship timeline, communication records, family integration, joint finances if cohabited." },
      { label: "I-864 sponsor financial support", why: "Standard ≥125% federal poverty threshold requirement. Joint sponsor option if petitioner doesn't qualify." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship history", prompt: "Meeting, courtship (often long-distance with documented video communication), marriage." },
      { heading: "In-person visits", prompt: "Each visit with passport stamps and evidence." },
      { heading: "Plans for US settlement", prompt: "City, petitioner employment, housing." },
    ],
    moneySavingTips: [
      "Nigerian apostille (post-2024): MFA Abuja issues; saves prior-method consular legalisation costs.",
      "DV (Diversity Visa) Lottery is ineligible for Nigeria some years — check current rules.",
      "Avoid 'visa fixers' in Lagos / Abuja charging $5,000+ — USCIS forms are free; reputable lawyers charge $2,000-4,000."
    ],
    lawyerTriggers: {
      diy: ["Standard USC spouse petition with clean marriage and Nigerian apostilled documents"],
      getALawyer: ["Beneficiary's prior US overstay or refusal", "Petitioner's prior I-130 history", "Polygamous prior marriage in Nigeria"],
    },
  },

  "IN:CA:family": {
    whatCarriesWeight: [
      { label: "Sponsor's Canadian status and category", why: "Canadian citizen / PR sponsor. Spousal sponsorship has no formal income threshold; parental sponsorship requires meeting MNI (Low-Income Cut-Off + 30%) for 3 years." },
      { label: "Marriage / common-law genuineness", why: "Indian-Canadian arranged-marriage cases get IRCC scrutiny — that's fine, document the family-introduction pattern, jirga / family-meetings, extended courtship." },
      { label: "Indian civil documents apostilled", why: "Birth / marriage / divorce from local Municipal Corporation or relevant Registrar. Apostille via Indian state-level MEA. India is Hague Apostille." },
      { label: "Sponsor's financial undertaking", why: "Spousal: 3-yr undertaking. Parental: 20-yr undertaking + 3-yr LICO+30% income evidence." },
    ],
    personalStatementTemplate: [
      { heading: "How you met and how the relationship developed", prompt: "Family introduction / love marriage — both fine; document the courtship pattern." },
      { heading: "In-person meetings", prompt: "Document each visit." },
      { heading: "Communication during separation", prompt: "WhatsApp / video call evidence." },
      { heading: "Plans for Canada", prompt: "Settlement city (Toronto / Vancouver / Brampton / Surrey have large Indo-Canadian communities), sponsor's employment, housing." },
    ],
    moneySavingTips: [
      "Spousal sponsorship total ~CAD$1,800 in IRCC fees.",
      "Indian apostille via state-level MEA: INR 50-100 per document. Avoid 'agencies' charging INR 2,000+.",
      "CICC-licensed Canadian consultants in Toronto / Vancouver charge CAD$2,000-4,000 for full representation if needed; many Indian-Canadian families self-serve via IRCC."
    ],
    lawyerTriggers: {
      diy: ["Standard spousal sponsorship with documented courtship and clean Indian apostilled documents"],
      getALawyer: ["Short courtship + immediate sponsorship (fraud-presumption risk)", "Sponsor's prior refused sponsorship", "Complex Indian gendered-naturalisation prior issues"],
    },
  },

  // ─── 5 more for buffer ───
  "RU:RS:work": {
    whatCarriesWeight: [
      { label: "Serbian visa-free for Russian nationals", why: "Russian nationals enter Serbia visa-free for 30 days. Long-stay residence (privremeni boravak) via employer sponsorship, real-estate purchase, or business registration." },
      { label: "Serbian work permit (radna dozvola)", why: "Serbian employer files work-permit application; valid 1 year, renewable. Salary at or above the Serbian average wage." },
      { label: "Serbian Individual Entrepreneur (preduzetnik) registration", why: "Russian nationals can register as Serbian preduzetnik — sole-proprietorship status with lump-sum tax option (~RSD 50,000/mo for IT services). Popular with Russian remote workers." },
      { label: "Russian background documents (post-2022 limited)", why: "Russian background check (справка о судимости) — issued by MVD, apostilled. Plan around restricted-timelines if applying remotely." },
    ],
    personalStatementTemplate: [
      { heading: "Why Serbia", prompt: "Russian-language community, Belgrade / Novi Sad tech ecosystem, low cost of living." },
      { heading: "Income source and visa basis", prompt: "Employer-sponsored / preduzetnik / real-estate purchase — name the basis specifically." },
      { heading: "Long-term plans", prompt: "Permanent residence after 5 yrs continuous; Serbian citizenship after 3 yrs on PR." },
    ],
    moneySavingTips: [
      "Serbian preduzetnik lump-sum tax: ~RSD 50,000-100,000/mo total for IT services. Among the lowest formal-business tax burdens in Europe.",
      "Don't pay 'relocation services' $5,000+ — visa-free entry + privremeni boravak + preduzetnik registration is self-serve with patience.",
    ],
    lawyerTriggers: {
      diy: ["Visa-free entry + preduzetnik registration"],
      getALawyer: ["Permanent residence application", "Complex source-of-funds documentation"],
    },
  },

  "TR:US:family": {
    whatCarriesWeight: [
      { label: "USC / LPR petitioner and category timing", why: "USC-petitioned spouse (12-18 mo) or minor child clears fastest. Turkey F-class wait times: F2A current; F1 6-8 years; F4 15+ years." },
      { label: "Turkish civil documents from Nüfus Müdürlüğü", why: "Birth / marriage / divorce from Provincial Population Directorate. Apostille via Vali (governor)." },
      { label: "Marriage bona-fides", why: "Turkish-American spousal petitions get standard scrutiny. Document relationship timeline, photos, family integration." },
      { label: "I-864 financial sponsorship", why: "Standard ≥125% federal poverty threshold." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship history", prompt: "Meeting, courtship, marriage. Document long-distance pattern if applicable." },
      { heading: "In-person visits", prompt: "Each visit with passport stamps." },
      { heading: "Plans for US settlement", prompt: "City, petitioner employment, housing." },
    ],
    moneySavingTips: [
      "Turkish apostille via Vali: ~TRY 100-200 per document. Cheap and quick (typically same-day to 1 week).",
      "US embassy Istanbul / Ankara interview waits 2-6 months for K-1 / CR-1.",
      "Avoid 'visa fixers' in Istanbul charging $5,000+ — USCIS forms free; reputable lawyers $1,500-3,000."
    ],
    lawyerTriggers: {
      diy: ["Standard USC spouse petition with clean marriage and Turkish documents"],
      getALawyer: ["Beneficiary's prior US overstay or refusal", "Petitioner's prior I-130 history"],
    },
  },

  "JP:CA:work": {
    whatCarriesWeight: [
      { label: "Express Entry CRS for Japanese applicants", why: "Japanese professionals with bachelor's + IELTS / CELPIP 7+ + 3+ years experience score 400-500 CRS without job offer. Japan-Canada Free Trade Agreement (CPTPP) facilitates certain professional categories." },
      { label: "WES Educational Credential Assessment", why: "Japanese degrees evaluated by WES — typically clean Bachelor / Master equivalency. Apostille (Japan is Hague Apostille)." },
      { label: "IELTS / CELPIP language test", why: "Most Japanese applicants benefit from intensive English prep — IELTS 7.0+ across skills (CLB 9) optimises CRS." },
      { label: "Japanese police certificate", why: "Issued by Japanese prefectural police HQ + apostille by Ministry of Foreign Affairs. Allow 4-8 weeks." },
    ],
    personalStatementTemplate: [
      { heading: "Skilled-occupation profile", prompt: "NOC code, years of experience, professional registration." },
      { heading: "Education and ECA", prompt: "Japanese degree, institution, WES reference." },
      { heading: "Language test results", prompt: "IELTS / CELPIP bands per skill." },
      { heading: "Settlement plan", prompt: "Province, city, employment search strategy." },
    ],
    moneySavingTips: [
      "Express Entry self-serve via canada.ca — no need for $5,000+ agencies in Tokyo.",
      "Japan-Canada Working Holiday for under-31s — 12 months, no employer sponsorship. Useful for market-testing before Express Entry.",
      "Provincial Nominee Programs often have lower CRS thresholds for Japanese-occupation profiles in Saskatchewan, Manitoba, Atlantic provinces.",
    ],
    lawyerTriggers: {
      diy: ["Clean Express Entry profile with strong CRS"],
      getALawyer: ["Past refusal anywhere", "LMIA challenges from small employer"],
    },
  },

  "KR:CA:work": {
    whatCarriesWeight: [
      { label: "Express Entry CRS for Korean applicants", why: "Korean professionals: bachelor's + IELTS 7+ + 3+ years experience score 400-500 CRS. CPTPP membership facilitates certain professional pathways." },
      { label: "WES ECA + IELTS / CELPIP", why: "Standard pathway. Korean degrees map cleanly via WES." },
      { label: "Korean police certificate (범죄경력증명서)", why: "Issued by Korean National Police Agency via Government24. Apostille via Korean MOFA." },
      { label: "Working Holiday Visa (under-31 alternative)", why: "Korea-Canada Working Holiday: 12 months freedom. Useful for market-testing before Express Entry." },
    ],
    personalStatementTemplate: [
      { heading: "Skilled-occupation profile", prompt: "NOC code, experience, professional registration if applicable." },
      { heading: "Education and ECA", prompt: "Korean degree, institution, WES reference." },
      { heading: "Language test results", prompt: "IELTS / CELPIP bands." },
      { heading: "Settlement plan", prompt: "Province, city. Toronto / Vancouver have large Korean-Canadian communities." },
    ],
    moneySavingTips: [
      "Express Entry self-serve. Avoid Seoul agencies charging KRW 5M+.",
      "Working Holiday CAD$100-150 + 12 months freedom.",
      "PNP Saskatchewan / Manitoba often have lower thresholds for Korean profiles.",
    ],
    lawyerTriggers: {
      diy: ["Clean Express Entry profile"],
      getALawyer: ["Past refusal", "LMIA-supported small-employer route"],
    },
  },

  "PT:US:family": {
    whatCarriesWeight: [
      { label: "USC / LPR petitioner and category timing", why: "USC-petitioned spouse (12-18 mo). Portugal F-class wait times: F2A current; F3 / F4 multi-year backlogs." },
      { label: "Portuguese civil documents (Cidadania Portuguesa)", why: "Birth / marriage from Conservatória do Registo Civil. Apostille via Portuguese authority (Portugal is Hague). Sworn translation for US use." },
      { label: "Marriage bona-fides", why: "Portuguese-American spousal petitions get standard USCIS scrutiny." },
      { label: "I-864 financial sponsorship", why: "Standard ≥125% federal poverty threshold." },
    ],
    personalStatementTemplate: [
      { heading: "Relationship history", prompt: "Meeting, courtship, marriage." },
      { heading: "In-person visits", prompt: "Document each." },
      { heading: "Plans for US settlement", prompt: "City, petitioner employment, housing." },
    ],
    moneySavingTips: [
      "Portuguese apostille via Procuradoria-Geral da República: €15-20 per document.",
      "Lisbon embassy interview waits typically 2-4 months for K-1 / CR-1.",
      "DV Lottery: Portugal historically eligible — check current year's eligibility list."
    ],
    lawyerTriggers: {
      diy: ["Standard USC spouse petition with clean Portuguese documents"],
      getALawyer: ["Beneficiary's prior US overstay", "Petitioner's prior I-130 history"],
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

/**
 * All hand-written route keys parsed into structured form. Used by the
 * sitemap chunk handler to surface high-quality transit/family/diplomatic
 * URLs (which we otherwise exclude from the sitemap to avoid thin-content
 * penalties). Hand-written cells get sitemap inclusion regardless of purpose.
 */
export const HAND_WRITTEN_ROUTES: ReadonlyArray<{
  passport: string;
  destination: string;
  purpose: Purpose;
}> = Object.keys(ROUTE_ADVICE).map((key) => {
  const [passport, destination, purpose] = key.split(":") as [string, string, Purpose];
  return { passport: passport.toLowerCase(), destination: destination.toLowerCase(), purpose };
});
