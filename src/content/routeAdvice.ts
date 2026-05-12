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
  // FILIPINO → USA — work (H-1B / H-2B / EB-3)
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
};

export function routeAdviceFor(
  passportIso2: string,
  destinationIso2: string,
  purpose: Purpose,
): AdviceBlock | null {
  const key = `${passportIso2.toUpperCase()}:${destinationIso2.toUpperCase()}:${purpose}` as RouteKey;
  return ROUTE_ADVICE[key] ?? null;
}
