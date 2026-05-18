/**
 * Immigration myths & rumours — the things people ask about that are
 * commonly half-true, fully wrong, or politically loaded.
 *
 * Each myth is a structured record so the /myths page template can
 * render consistently AND so we can wire to /[passport]/[destination]
 * pages when a route matches the myth's relevance.
 *
 * Editorial bar: every myth cites at least one authoritative source
 * (gov.uk, travel.state.gov, ec.europa.eu, MFA pages, IAA / MARA / CICC
 * regulator sites) — never Wikipedia. Verified date on each entry so
 * stale claims age out visibly.
 */

export type Verdict =
  | "false"          // outright wrong
  | "mostly_false"   // marketing pitch with a kernel of truth
  | "partial"        // sometimes true, sometimes not — depends on details
  | "true_but"       // technically true but commonly misunderstood
  | "depends";       // entirely jurisdiction-specific, no single answer

export const VERDICT_LABEL: Record<Verdict, string> = {
  false: "False",
  mostly_false: "Mostly false",
  partial: "Partially true",
  true_but: "True, but…",
  depends: "Depends",
};

export const VERDICT_BLURB: Record<Verdict, string> = {
  false: "This is not how immigration law works in any major jurisdiction.",
  mostly_false: "The kernel of truth gets stretched into something it isn't.",
  partial: "Sometimes true, sometimes not — the details matter a lot.",
  true_but: "Technically accurate but usually misunderstood in practice.",
  depends: "There is no single answer — every country's rules differ.",
};

export type Myth = {
  slug: string;
  /** The rumour as people typically ask it. Used as H1 + meta title. */
  question: string;
  /** SEO meta description — 140–160 chars, factually decisive. */
  metaDescription: string;
  verdict: Verdict;
  /** One-sentence headline answer that goes under the verdict badge. */
  headline: string;
  /** Long-form truth, 200–400 words, plain English, no jargon. */
  truth: string;
  /** Why the myth persists — 60–120 words. */
  whyExists: string;
  /** What to actually do — action-oriented bullets. */
  whatToDo: string[];
  /** Country-specific qualifications. Optional. */
  countryNotes?: Array<{ country: string; note: string }>;
  /** Related visa-route URLs the reader might want next (path-form). */
  relatedRoutes?: Array<{ label: string; href: string }>;
  /** Sources — at least 2 government/regulator URLs per myth. */
  sources: Array<{ label: string; url: string }>;
  /** ISO date the underlying sources were last reviewed by a human. */
  lastVerified: string;
};

export const MYTHS: Myth[] = [
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "marriage-to-citizen-automatic-visa",
    question: "Does marriage to a citizen automatically get you a visa?",
    metaDescription:
      "Marrying a citizen does not automatically grant residence in any country. Every spouse visa requires an application, evidence, income tests, and waiting periods. Here's what's actually involved.",
    verdict: "false",
    headline:
      "Marriage opens a route — it does not grant one. Every spouse visa is an application with evidence requirements, income tests, and waiting periods.",
    truth:
      "There is no country in the world where marriage to a citizen instantly confers residence. The marriage qualifies you to APPLY for a spouse-route visa. You then have to prove the relationship is genuine (photos, joint finances, cohabitation evidence, communication history), meet the sponsoring partner's income threshold, pay the application fee, undergo biometric and sometimes medical checks, and wait through processing — typically 6 to 18 months. Refusals are common. The UK refused around 18% of partner-route applications in recent years; the US K-1 fiancé visa has a multi-step interview process and the IR-1/CR-1 immigrant-visa interview at the US embassy is decisive. Then you live as a temporary resident on the partner visa, often for 3-5 years, before you can apply for permanent residence — and that's another application, more fees, more evidence. Permanent residence is not citizenship; that's another application again with its own residency requirement and tests.",
    whyExists:
      "Hollywood, daytime TV, and immigration scam operators all rely on the romantic shorthand of 'marry a citizen and you're in.' It also lets criminals frame fake-marriage schemes as quick fixes. The truth — that even genuine relationships face a multi-year, multi-stage gauntlet — makes for worse storytelling, so the false version persists.",
    whatToDo: [
      "Find your country's published partner-route page (e.g. gov.uk for UK, USCIS for US, immi.homeaffairs.gov.au for Australia)",
      "Read the financial requirement before anything else — it's usually the gating factor",
      "Start collecting relationship evidence from the day you start dating: dated photos, messages, shared bills, travel records",
      "Budget for application fees, immigration-health surcharge (UK), priority service if you need a fast decision",
      "Do NOT apply on a tourist visa expecting to switch — most countries forbid changing from visit to settlement in-country",
    ],
    sources: [
      { label: "UK gov — Family visas", url: "https://www.gov.uk/uk-family-visa" },
      { label: "USCIS — Family of US citizens (I-130/IR-1/CR-1)", url: "https://www.uscis.gov/family/family-of-us-citizens" },
      { label: "Australia DHA — Partner visa (subclass 820/801)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/partner-onshore" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "baby-born-here-gets-citizenship",
    question: "Does having a baby in a country get you citizenship or residence?",
    metaDescription:
      "Birthright citizenship for the child exists in the Americas and a few exceptions; it almost never grants the parents anything. Here's how it actually works by country.",
    verdict: "partial",
    headline:
      "Some countries grant the CHILD citizenship by birthplace (jus soli). Almost nowhere does this give the PARENTS residence or any immigration benefit until the child is an adult.",
    truth:
      "Unconditional birthright citizenship — citizenship just because you were born on the soil — exists in most of the Americas (US, Canada, Mexico, Brazil, Argentina, Chile, and others), in a few African states, and almost nowhere else in the developed world. Most of Europe, Australia, New Zealand and most of Asia require at least one parent to be a citizen or permanent resident (jus sanguinis with conditions). Even where birthright applies to the child, the parents get nothing immediate — they remain on whatever visa they entered on. In the US, parents are bound by their existing immigration status; the child cannot sponsor them for a green card until age 21. In most of Europe, having a child while undocumented does not regularise the parents. There are narrow exceptions — Ireland has had nuanced rules around Irish-born children, France allows some routes after demonstrating long-term residence with French-citizen children — but these are limited and not automatic.",
    whyExists:
      "It's a useful misconception for traffickers selling 'birth tourism' packages, and for political rhetoric on both sides of immigration debates. The genuine birthright systems of the Americas get conflated with completely different jurisdictions where they don't apply.",
    whatToDo: [
      "Check the destination country's nationality law on the MFA / government site (search 'how to acquire nationality' on the .gov domain)",
      "If the country grants jus soli, the child gets the citizenship — the parents do not automatically",
      "If you're considering birth tourism for citizenship purposes, get legal advice first — many countries have tightened rules and US-style birth tourism is increasingly scrutinised",
      "If you're already pregnant and overseas on a visa, your visa terms still apply — most healthcare-tourism cases now require an explicit medical visa, not a tourist visa",
    ],
    sources: [
      { label: "US Citizenship through birth in the US (USCIS)", url: "https://www.uscis.gov/citizenship/learn-about-citizenship/should-i-consider-us-citizenship" },
      { label: "UK gov — British citizenship by birth", url: "https://www.gov.uk/types-of-british-nationality/british-citizenship" },
      { label: "Government of Canada — citizenship by birth", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility.html" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "overstaying-visa-bans-you-forever",
    question: "Does overstaying your visa ban you from coming back forever?",
    metaDescription:
      "Overstays have specific, defined re-entry bans — usually 1, 3, 5 or 10 years depending on length and country. Almost never lifetime. Here's what actually happens.",
    verdict: "mostly_false",
    headline:
      "Overstays trigger defined re-entry bans (typically 1, 3, 5 or 10 years depending on how long you overstayed and where), not lifetime bars. Lifetime bans exist only for very narrow categories (deportation orders, fraud, serious criminality).",
    truth:
      "Every major immigration regime has graduated penalties for overstaying. In the US, an overstay of more than 180 days but less than a year triggers a 3-year bar; more than a year triggers a 10-year bar. The UK's general rule: overstay of 30 days or more and voluntary departure attracts a 12-month re-entry ban; departure at government expense attracts a 5-year ban; deportation attracts a 10-year ban. Schengen overstays create a record in the EES system and can lead to a 1-3 year ban depending on circumstances. Australia's Section 48 bar restricts further onshore applications. None of these are lifetime — that's reserved for deportation following criminal conviction or fraud. Critically, the bar starts when you LEAVE, not when you overstay; if you stay longer, you don't accumulate worse bans, but you do compound risk of detection and removal. Voluntary departure within a grace window is almost always less damaging than being caught.",
    whyExists:
      "Immigration officers and consultants often warn applicants in deliberately stark terms to deter overstaying — 'you'll never come back' is a more memorable line than 'you'll face a re-entry ban of between 12 months and 10 years depending on circumstances.' The fear works at the cost of accuracy.",
    whatToDo: [
      "If you're already overstayed, look up your country's published 're-entry ban' rules on the immigration .gov site",
      "Departing voluntarily before enforcement contact is almost always less damaging than being detained and removed",
      "Some countries allow voluntary self-disclosure with reduced penalty — UK has a 'Voluntary Returns Service'",
      "DO NOT attempt to re-enter on a different passport or assumed identity — that crosses into fraud and triggers permanent bars",
      "Engage an IAA / MARA / CICC-registered immigration adviser before any future application — declaring the prior overstay honestly is mandatory",
    ],
    sources: [
      { label: "USCIS — Unlawful presence and inadmissibility", url: "https://www.uscis.gov/laws-and-policy/policy-manual/volume-9-part-b-table-of-contents" },
      { label: "UK gov — Overstaying your visa", url: "https://www.gov.uk/visas-immigration" },
      { label: "Schengen Entry/Exit System (EES) — European Council", url: "https://www.consilium.europa.eu/en/policies/eu-information-systems/" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "convert-tourist-to-work-visa-in-country",
    question: "Can you convert a tourist visa to a work visa from inside the country?",
    metaDescription:
      "Most countries explicitly forbid switching from visit to work status without leaving and re-applying. A small set of jurisdictions permit certain in-country switches under specific routes.",
    verdict: "false",
    headline:
      "In most major immigration regimes, you must LEAVE the country and apply for the work visa from outside. Switching from a visitor visa is explicitly forbidden under the immigration rules.",
    truth:
      "The UK is explicit: visitors cannot 'switch' to a Skilled Worker visa from within the UK — they must leave and apply from their country of residence. The US is similar: B-1/B-2 visitor status does not permit changing to H-1B or L-1 without leaving. Schengen tourist visas (Type C) cannot be converted to a national long-stay visa (Type D); the applicant must depart and apply at their home consulate. Australia, Canada, and New Zealand have similar separation between visit and work streams. The exceptions are limited: some countries allow specific in-country switches between long-stay categories (e.g. UK Student → Skilled Worker is permitted), some countries allow visitor → specific work permits under shortage occupation pilots (e.g. UAE has a Visit-to-Work conversion service for some nationalities), and digital-nomad-visa countries (Portugal D8, Spain DNV, Estonia DNV) explicitly accept in-country applications. But the general rule remains: visit and work are separate processes, and pretending to be a tourist while job-hunting is grounds for refusal and ban.",
    whyExists:
      "Plenty of YouTube and TikTok content promises easy in-country switching, often funded by visa-fraud operators. The few jurisdictions where it's possible get extrapolated into a general rule that doesn't exist.",
    whatToDo: [
      "Always check the specific country's 'switch' or 'change of status' rules — search 'switch visa' on the .gov immigration site",
      "If your goal is to work, apply for a work visa from outside the country with a job offer in hand",
      "DO NOT job-hunt while on a tourist visa — this is grounds for refusal at the border and at the work-visa application stage",
      "If you're a student already in-country, the Student → Work switching path is often legitimate and is the route to use",
    ],
    countryNotes: [
      { country: "UK", note: "Visitor → Skilled Worker switching is NOT permitted under the Immigration Rules. Student → Skilled Worker IS permitted." },
      { country: "US", note: "Change of status from B-1/B-2 to H-1B/L-1 requires departure. Adjustment of status from H-1B to green card is a separate process and is permitted in-country." },
      { country: "UAE", note: "Status-change service permits visit-to-employment conversion for some nationalities through GDRFA (Dubai) and ICA (Abu Dhabi)." },
    ],
    sources: [
      { label: "UK gov — Standard Visitor visa terms", url: "https://www.gov.uk/standard-visitor" },
      { label: "USCIS — Change of nonimmigrant status", url: "https://www.uscis.gov/visit-the-united-states/change-my-nonimmigrant-status" },
      { label: "Government of Canada — Change conditions of your work permit", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/extend-change-conditions.html" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "asylum-claims-work-like-in-the-movies",
    question: "Do asylum claims really work the way they're shown on TV?",
    metaDescription:
      "Asylum is a defined international-law process with strict criteria, multi-year waits, and very high refusal rates. The TV version is dangerously misleading.",
    verdict: "false",
    headline:
      "Asylum is governed by the 1951 Refugee Convention, requires proof of well-founded fear of persecution on specific grounds, takes years to resolve, and is refused more often than granted.",
    truth:
      "The legal standard for refugee status under the 1951 Convention (and the 1967 Protocol) is narrow: a well-founded fear of persecution on grounds of race, religion, nationality, membership of a particular social group, or political opinion. Economic hardship, generalised violence, climate displacement, and family-reunification needs do not normally qualify. The process: apply at the border or after entry, undergo a screening interview, wait months or years for a substantive interview, present documentary evidence of the persecution claim (often impossible to obtain), receive a decision, then appeal if refused. UK initial-decision refusal rates have varied between 30-60% depending on year and country. US asylum backlogs exceed 1 million cases; processing times can exceed 4 years. Detention while waiting is common in some countries. Successful claimants get refugee status, not citizenship — usually a 5-year leave with a path to settlement and eventually naturalisation. Fraudulent claims are now subject to inadmissibility findings under the Illegal Migration Act (UK) and similar regimes elsewhere.",
    whyExists:
      "Films and TV shows compress months or years of process into a single dramatic interview, and frame asylum as something one 'gets' by asking for it. The reality — bureaucratic, slow, traumatic, often unsuccessful — doesn't fit narrative arcs.",
    whatToDo: [
      "If you genuinely face persecution and need international protection, contact UNHCR (United Nations High Commissioner for Refugees) or a registered legal-aid charity in the country you're seeking protection in",
      "Document the persecution: dated evidence, witness statements, country-condition reports",
      "Apply to the FIRST safe country you reach — applying onwards can be refused under safe-third-country rules",
      "Be aware that economic migration is NOT asylum — pursuing it as asylum will fail and can trigger fraud findings",
      "Engage a registered immigration adviser (UK: IAA/IAS-registered, free legal aid available for asylum cases in some jurisdictions)",
    ],
    sources: [
      { label: "UNHCR — Refugees & asylum-seekers", url: "https://www.unhcr.org/asylum-seekers" },
      { label: "UK gov — Claim asylum in the UK", url: "https://www.gov.uk/claim-asylum" },
      { label: "USCIS — Asylum", url: "https://www.uscis.gov/humanitarian/refugees-and-asylum/asylum" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "money-buys-any-visa",
    question: "Can you just buy any visa if you have enough money?",
    metaDescription:
      "Investor visas and citizenship-by-investment exist but are limited to specific countries, have steep requirements, and are increasingly under EU and US scrutiny.",
    verdict: "mostly_false",
    headline:
      "Investor visas (Golden Visas) and citizenship-by-investment (CBI) programs exist, but they are limited to specific countries, have minimum investments from US$100k to US$5M+, and are under increasing pressure from the EU and US.",
    truth:
      "Citizenship-by-investment (CBI) is offered by a small set of mostly Caribbean states (St Kitts & Nevis, Antigua & Barbuda, Dominica, Grenada, Saint Lucia) and a couple of European states (Malta, until recent EU pressure; Türkiye for naturalisation after 3 years). Threshold: US$100k-$200k+ donation or property purchase. Residence-by-investment (Golden Visas) exist in more countries — Portugal (substantially reformed 2023), Spain (closed for real-estate 2025), Greece, Italy, UAE — usually requiring property purchase or investment from €250k-€2M. The US EB-5 Investor Visa requires US$800k-$1.05M in a targeted-employment area. None of these instantly grant citizenship — they grant residence which then has a multi-year qualifying period. The EU has been actively pressuring member states to wind down golden-passport schemes since 2022 over money-laundering and Russian-sanctions concerns. The US has tightened EB-5 oversight under the EB-5 Reform and Integrity Act 2022.",
    whyExists:
      "Citizenship-by-investment is heavily marketed by intermediaries who earn substantial commissions per applicant. The pitches conflate residence with citizenship, and ignore the due-diligence checks that can refuse applicants for criminal records, sanctioned ties, or tax-haven concerns.",
    whatToDo: [
      "If you have genuine investment capital and want a residence route, work with a licensed immigration lawyer (not a 'consultant') in the destination country",
      "Verify the program is on the official government website — many CBI sites are intermediary marketing pages, not the issuing authority",
      "Budget for full due-diligence costs (US$5k-$25k+) on top of the investment amount",
      "Be aware that some EU/UK banks and visa programs refuse customers who acquired residence/citizenship through CBI",
      "Look at the actual settlement path — most golden visas require physical-presence days, even if they're called 'no-physical-presence' programs",
    ],
    sources: [
      { label: "Portugal SEF — Golden Visa (Autorização de Residência para Investimento)", url: "https://www.sef.pt/en/Pages/conteudo-detalhe.aspx?nID=21" },
      { label: "US EB-5 Reform and Integrity Act 2022", url: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program" },
      { label: "European Commission — Investor citizenship and residence schemes", url: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/eu-citizenship/investor-citizenship-schemes_en" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "student-visa-leads-to-permanent-residence",
    question: "Do student visas always lead to permanent residence?",
    metaDescription:
      "Student visas can lead to permanent residence in some countries via post-study work routes — but it's never automatic and requires sponsorship, points, or further visa applications.",
    verdict: "partial",
    headline:
      "Some countries (UK Graduate Route, Canada PGWP, Australia Subclass 485) make student → work → settlement realistic. Others (US F-1) explicitly do NOT — F-1 students must show 'non-immigrant intent'.",
    truth:
      "Country by country: the UK Graduate Route gives 2-3 years of post-study work (no sponsor needed), and the Skilled Worker route can lead to ILR after 5 years. Canada's PGWP (Post-Graduation Work Permit) gives up to 3 years of open work permit, which builds Canadian Experience Class points for Express Entry PR. Australia's Subclass 485 (Temporary Graduate) gives 2-5 years post-study; combined with state-nomination programs, it's a realistic PR path. New Zealand's Post-Study Work Visa is similar. Germany allows graduates 18 months to find a job and switch to Skilled Worker or Blue Card. France's APS (Autorisation Provisoire de Séjour) gives graduates 12 months to job-hunt. By contrast, the US F-1 visa requires students to demonstrate non-immigrant intent — Section 214(b) makes you 'presumed an intending immigrant' until you prove otherwise. OPT (Optional Practical Training) gives 12 months work post-graduation (+24 months for STEM), but converting to H-1B requires a lottery-based sponsored route that fails most applicants. Permanent residence via student → work is realistic in the UK / Canada / Australia / NZ / Germany; uncertain in the US; difficult in most of Asia.",
    whyExists:
      "Universities market study-abroad packages with implicit promises of post-graduation work and residence. Education agents (especially in South Asia) sometimes overstate the link between studying and emigrating. The truth is highly country-specific and depends on the student's discipline, sponsor, and luck (US H-1B lottery).",
    whatToDo: [
      "Before enrolling abroad, look up the destination country's post-study work scheme — search 'post-study work visa' on the immigration .gov site",
      "Pick programs / institutions that lead to roles on the destination country's Skilled Occupation List",
      "For the US: STEM-extension OPT is the longest runway, but H-1B sponsorship is the bottleneck",
      "For Canada: Express Entry's Canadian Experience Class rewards Canadian work + study points heavily",
      "Avoid education agents who promise 'guaranteed PR' — there is no such thing",
    ],
    relatedRoutes: [
      { label: "UK Student visa", href: "/passport/in/gb?purpose=study" },
      { label: "Australia Subclass 500", href: "/passport/in/au?purpose=study" },
      { label: "Canada Study Permit", href: "/passport/in/ca?purpose=study" },
    ],
    sources: [
      { label: "UK gov — Graduate Route", url: "https://www.gov.uk/graduate-visa" },
      { label: "Canada IRCC — Post-Graduation Work Permit", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation.html" },
      { label: "USCIS — Optional Practical Training (F-1)", url: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "remote-work-tourist-visa",
    question: "Is it fine to work remotely on a tourist visa?",
    metaDescription:
      "Almost every tourist visa explicitly forbids work, including remote work for a foreign employer. Digital-nomad visas exist precisely because the tourist route doesn't cover this.",
    verdict: "false",
    headline:
      "Almost every country's tourist visa explicitly prohibits ALL work, including remote work for an employer outside the country. Digital-nomad visas exist precisely because this distinction matters legally.",
    truth:
      "The plain text of most tourist visa terms forbids 'employment,' 'business activity beyond meetings,' and 'productive work' — without distinguishing remote vs in-country. Tax residency rules add a second layer: most countries treat 183+ days physical presence as triggering local tax residency regardless of where your employer pays you. Border officers are explicitly trained to ask 'are you working here?' and 'who pays you?' — answering yes triggers refusal even if your employer is overseas. The countries that have introduced explicit Digital Nomad Visas (DNVs) — Portugal D8, Spain DNV, Estonia DNV, Croatia DN Permit, Italy DN Visa, Greece DN Visa, Indonesia E33G, Bali Second Home — did so because the legal status of remote workers on tourist visas was unclear AND because they wanted to capture the tax revenue. Enforcement is uneven: many digital nomads do work on tourist visas without consequence, until they trigger a border check, tax investigation, or an angry neighbour reports them. The risk profile escalates the longer you stay.",
    whyExists:
      "Nomad influencers and remote-work content downplay the legal risk because the lifestyle pitch needs to be frictionless. Border officers and tax authorities have been slow to catch up, creating a years-long window of effective non-enforcement that's now closing.",
    whatToDo: [
      "For stays under 30 days, the legal risk is usually low but technically present — keep evidence of foreign employment in case asked",
      "For stays of 90+ days at one destination, apply for the country's digital-nomad visa where one exists",
      "Avoid receiving payments into a local bank account on a tourist visa — that's strong evidence of local work",
      "Avoid invoicing local clients on a tourist visa — that's local economic activity",
      "Check tax residency rules: most countries trigger residency at 183 days, some at fewer, and some look at 'centre of vital interests'",
    ],
    relatedRoutes: [
      { label: "Portugal D8 — Digital Nomad Visa", href: "/passport/gb/pt?purpose=work" },
      { label: "Spain Digital Nomad Visa", href: "/passport/gb/es?purpose=work" },
      { label: "Indonesia E33G Remote Worker KITAS", href: "/passport/gb/id?purpose=work" },
    ],
    sources: [
      { label: "Portugal — D8 Digital Nomad Visa (SEF)", url: "https://www.sef.pt/en/Pages/conteudo-detalhe.aspx" },
      { label: "Spain — Digital Nomad Visa", url: "https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Visados.aspx" },
      { label: "OECD — Tax residency rules summary", url: "https://www.oecd.org/tax/automatic-exchange/crs-implementation-and-assistance/tax-residency/" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "free-immigration-consultations-give-advice",
    question: "Do 'free immigration consultations' actually give you free advice?",
    metaDescription:
      "Most 'free consultations' from immigration law firms are 15-30 minute sales calls designed to quote a price. Genuine advice is almost always paid. Here's how to tell.",
    verdict: "mostly_false",
    headline:
      "Most free consultations are sales calls — the firm assesses whether they can sell you a service, not whether you have a good case. Paid time-boxed sessions are how real advice gets given.",
    truth:
      "The 'free consultation' is an industry-standard lead-generation device. The call is typically 15-30 minutes, structured around three questions: (1) what's your situation? (2) what's your budget? (3) when do you want to start? The firm uses your answers to triage whether you're a viable client and to quote an engagement fee — usually $3,000-$15,000+ for representation through a process. They do NOT review your documents in depth, advise on visa strategy, or warn you about route refusals during the free portion. Real advice — the kind that involves reading your CV, your prior immigration history, your financial position, and recommending a specific application strategy — only starts once you've signed an engagement letter. The exceptions are charitable / pro bono services (Refugee Council UK, Free Movement, AIRA in the US) and platforms that explicitly sell time-boxed paid sessions (Visavu's model). Anyone offering 'unlimited free consultation' is selling something — usually a sponsored visa product or an investment scheme.",
    whyExists:
      "The free-consultation model works as a marketing funnel for law firms and consultancies. It would be uneconomic to give real advice for free at scale. The friction is that applicants think they're getting advice when they're being sold to.",
    whatToDo: [
      "Treat 'free consultation' as a sales meeting — go in with your questions written down, not your hopes",
      "Ask explicitly: 'will you tell me which visa route you'd recommend before I engage?' — most firms will dodge",
      "For genuine paid advice, look at fixed-fee time-boxed sessions (typically £100-300/hr) where you keep the written advice",
      "For asylum / refugee / settled-status work, free legal aid is available in some jurisdictions — UK has IAS / Refugee Council, US has accredited representatives",
      "Verify the adviser's registration: UK = IAA, AU = MARA, CA = CICC, US = state bar + EOIR-accredited",
    ],
    sources: [
      { label: "UK Immigration Advice Authority (IAA) — adviser register", url: "https://www.gov.uk/find-an-immigration-adviser" },
      { label: "Australia MARA — Migration Agent Registration", url: "https://www.mara.gov.au/" },
      { label: "Canada CICC — Find a regulated immigration consultant", url: "https://college-ic.ca/" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "agents-and-lawyers-are-the-same",
    question: "Are immigration agents and immigration lawyers the same thing?",
    metaDescription:
      "No. Lawyers and registered consultants have different scopes, regulators, and what they can do for you. Using the wrong type can void your application.",
    verdict: "false",
    headline:
      "Lawyers (UK solicitors, US attorneys, AU lawyers) and registered consultants (UK IAA-registered, AU MARA, CA CICC) have different scopes, different regulators, and different things they can do. Choosing the wrong type can void your application or trigger fraud findings.",
    truth:
      "In the UK: an Immigration Adviser must be registered with the IAA (formerly OISC) or be supervised by an SRA-regulated solicitor. Solicitors can litigate (appeals at tribunal) and give advice on complex cases; IAA-registered consultants can give advice up to the level they're certified for (Level 1-3). Giving immigration advice for reward without registration is a criminal offence under Section 84 of the Immigration and Asylum Act 1999. In the US: only lawyers admitted to a state bar OR Board of Immigration Appeals (BIA) accredited representatives can practice immigration law for compensation — 'notario' fraud (unlicensed consultants posing as legal professionals) is a felony in most states. In Australia: MARA-registered Migration Agents handle most casework; lawyers handle litigation. Canada has Regulated Canadian Immigration Consultants (RCIC) under CICC, plus lawyers under provincial bars. The implications: using an unregistered 'agent' in any of these jurisdictions can void your application (the visa officer can refuse for misrepresentation), expose you to fraud penalties, and leaves you with no regulatory recourse if you're scammed.",
    whyExists:
      "Immigration is a heavily intermediated industry and 'agent' has become a generic word. In countries where the regulator is well-known (UK, AU, CA), the distinction is clearer; in others it's blurry. Plus, fraudulent operators deliberately blur the line.",
    whatToDo: [
      "UK: search the IAA register at gov.uk/find-an-immigration-adviser, and check solicitors at sra.org.uk",
      "US: verify state-bar admission via the relevant state bar website, and BIA accreditation at justice.gov/eoir",
      "AU: check the MARA register at mara.gov.au",
      "CA: check the CICC register at college-ic.ca",
      "If the person can't give you their registration number on first ask, do not engage them",
      "A fee structure that's vague, asks for cash, or guarantees an outcome are all red flags",
    ],
    sources: [
      { label: "UK — Find an immigration adviser (IAA register)", url: "https://www.gov.uk/find-an-immigration-adviser" },
      { label: "US — Find BIA-accredited representative (EOIR)", url: "https://www.justice.gov/eoir/list-pro-bono-legal-service-providers-map" },
      { label: "Australia — MARA register", url: "https://www.mara.gov.au/onlineverification/Verification.aspx" },
      { label: "Canada — CICC public register", url: "https://college-ic.ca/protecting-the-public/find-an-immigration-consultant" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "golden-visas-skip-residency",
    question: "Do Golden Visas let you skip residency requirements?",
    metaDescription:
      "Most Golden Visas grant residence, but converting that to permanent residence or citizenship still requires physical-presence days. The 'no minimum stay' marketing is misleading.",
    verdict: "true_but",
    headline:
      "Most Golden Visas have a low or zero MINIMUM stay to keep the visa, but to convert to permanent residence or citizenship still requires substantial physical-presence days — usually 5-10 years of residence with annual minimums.",
    truth:
      "The Portuguese Golden Visa (when it was open for real estate, now restricted) famously required only 7 days per year in Portugal to maintain the visa — and that was true. But the path to Portuguese citizenship via that visa still required 5 years of legal residence and demonstration of integration (basic Portuguese language, ties to the country). The Spanish Investor Residence (now closed for real estate) similarly maintained on minimal stays, but PR required 5 years and citizenship 10 years (2 for Iberoamerican nationals). The UAE Golden Visa (5/10 year) requires NO minimum stay — but UAE famously has no path to citizenship for most foreigners. Caribbean CBI programs (St Kitts, Antigua, Dominica) genuinely give citizenship immediately — but only because their starting position is offering citizenship, not residence. The misleading marketing is implying that you can sidestep ALL physical presence to obtain a strong passport — that's only true for the Caribbean CBI / Türkiye CBI / Malta CBI programs (which themselves carry significant scrutiny), not for the standard residency-by-investment programs.",
    whyExists:
      "Golden-visa marketing emphasises 'no minimum stay' to appeal to internationally mobile clients who want optionality without commitment. The deeper truth — that converting golden-visa residence to citizenship requires real physical presence — is mentioned in fine print but not the headline.",
    whatToDo: [
      "Read the program's PR / citizenship qualifying terms separately from the visa-maintenance terms — these are different",
      "Calculate the actual days-in-country required for the path to PR / citizenship — for most EU programs this is 5+ years of substantive presence",
      "Confirm whether the program is currently OPEN — many Golden Visas have been closed (Portugal RE 2023, Spain RE 2025, Ireland 2023, Greece RE tightened 2024)",
      "If you're considering CBI for the passport itself, verify the destination passport's visa-free list AGAINST your current passport's — sometimes the gain is smaller than the marketing suggests",
    ],
    sources: [
      { label: "Portugal SEF — Golden Visa (ARI) program info", url: "https://www.sef.pt/en/Pages/conteudo-detalhe.aspx?nID=21" },
      { label: "Spain — Investor residence (now restricted)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2013-9888" },
      { label: "UAE — Golden Visa program (u.ae)", url: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visa" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "eu-citizens-work-in-uk-after-brexit",
    question: "Can EU citizens still work freely in the UK after Brexit?",
    metaDescription:
      "Free movement ended 31 December 2020. EU citizens not on the EU Settlement Scheme now need a work visa like any non-British national. Here's the new rules.",
    verdict: "false",
    headline:
      "EU free movement to the UK ended 31 December 2020. EU citizens not registered on the EU Settlement Scheme by 30 June 2021 now need a work visa under the points-based system — same as any non-British national.",
    truth:
      "From 1 January 2021, the UK's points-based immigration system applies to EU and non-EU nationals equally. EU citizens who were resident in the UK on or before 31 December 2020 had until 30 June 2021 to apply for Settled Status or Pre-Settled Status under the EU Settlement Scheme — late applications are accepted only with 'reasonable grounds.' EU citizens arriving after that date must apply for a Skilled Worker visa (job offer with a licensed sponsor, salary £38,700 from April 2024 for most occupations), a Graduate visa (after UK study), a Family visa, or one of the other entry routes. Visa-free entry for short stays (up to 6 months) continues for tourism / business meetings — but the UK ETA scheme rolled out to EU nationals through 2025, so a £10 pre-travel authorisation is now required. Irish citizens remain unrestricted under the Common Travel Area — Ireland is the only EU country that retains free movement to/from the UK.",
    whyExists:
      "Brexit was politically and legally complex; the messaging during the transition was deliberately vague to manage stakeholders. Many EU citizens (and UK employers) assumed continued mobility because that's what the news cycle suggested, until the rules sharpened in 2021.",
    whatToDo: [
      "Check your status: if you were UK-resident before 31 Dec 2020 and didn't apply to EUSS, gov.uk has a late-application route",
      "If you're an EU citizen now wanting to work in UK, the Skilled Worker visa is the main route — need employer sponsorship and £38,700 minimum salary (or shortage-occupation reduction)",
      "Irish citizens: no change — full UK / Ireland CTA continues",
      "EU citizens for short visits: UK ETA from 2025 (£10, 2-year validity)",
    ],
    countryNotes: [
      { country: "Ireland", note: "Common Travel Area is in primary legislation on both sides — Irish citizens have unrestricted right to live and work in the UK, and vice versa. Brexit did not affect this." },
      { country: "Germany / France / Spain etc.", note: "Post-Brexit EU nationals need a sponsored work visa, family route, or other long-stay visa to live and work in the UK." },
    ],
    relatedRoutes: [
      { label: "UK Skilled Worker visa (DE → GB)", href: "/passport/de/gb?purpose=work" },
      { label: "UK ETA (DE → GB tourism)", href: "/passport/de/gb?purpose=tourism" },
    ],
    sources: [
      { label: "UK gov — EU Settlement Scheme", url: "https://www.gov.uk/settled-status-eu-citizens-families" },
      { label: "UK gov — Skilled Worker visa", url: "https://www.gov.uk/skilled-worker-visa" },
      { label: "UK / Ireland Common Travel Area", url: "https://www.gov.uk/government/publications/common-travel-area-guidance" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "uk-citizens-live-in-eu-after-brexit",
    question: "Can UK citizens still live freely in any EU country after Brexit?",
    metaDescription:
      "UK citizens lost EU free movement on 31 Dec 2020. To live or work in an EU country, you now need a national long-stay visa or be covered by the Withdrawal Agreement.",
    verdict: "false",
    headline:
      "Free movement ended 31 December 2020. UK citizens not covered by the Withdrawal Agreement now need a national long-stay (Type D) visa from the specific EU member state — and the rules differ in every state.",
    truth:
      "UK citizens who were legally resident in an EU member state on or before 31 December 2020 are covered by the Withdrawal Agreement (Article 50) and can continue to live in that state under the rules they had before — but they had to register for the new residence status by the deadline each state set (typically 30 June 2021 to 31 December 2022). UK citizens NOT covered by WA: short-stay visa-free for tourism / business / family visits up to 90 days in any 180 across the Schengen area (the 90/180 rule), with ETIAS authorisation required from late 2026. Long-stay: each EU country runs its own national long-stay visa for non-EU nationals — Spain's Non-Lucrative Visa, France's Long-Stay Visitor visa, Germany's Skilled Workers / Job Seeker visa, Portugal's D7 / D8, Italy's Lavoro Autonomo, etc. Work: requires a sponsored visa or self-employment visa; some EU states allow EU Blue Card for highly qualified. Citizenship: 5-10 years of legal residence depending on the country.",
    whyExists:
      "Same as the EU-citizens-in-UK myth — Brexit was complex, messaging was vague, and many British citizens assumed continued mobility because that's what they were used to.",
    whatToDo: [
      "If you were EU-resident on 31 Dec 2020 and missed the WA registration deadline, contact the destination country's immigration authority — late applications are sometimes accepted",
      "If you want to relocate now, pick a specific EU country and look at THAT country's long-stay visa options on its consulate / MFA site",
      "For passive income / retirement: Portugal D7, Spain Non-Lucrative, France Long-Stay Visitor, Italy Elective Residence",
      "For work: Germany Skilled Workers / Blue Card, France Talent Passport, Netherlands HSM (Highly Skilled Migrant), Spain Highly Qualified Worker",
      "For digital nomads: Spain DNV, Portugal D8, Croatia DN Permit, Italy DN Visa, Greece DN Visa, Estonia DNV",
      "Track the EU/UK Schengen short-stay limits via the EES biometric system (rolling out 2025) — overstays will be visible automatically",
    ],
    relatedRoutes: [
      { label: "Portugal D7 (UK passport)", href: "/passport/gb/pt?purpose=work" },
      { label: "Spain Digital Nomad Visa", href: "/passport/gb/es?purpose=work" },
      { label: "France Talent Passport", href: "/passport/gb/fr?purpose=work" },
    ],
    sources: [
      { label: "UK gov — Living in Europe after Brexit", url: "https://www.gov.uk/uk-nationals-living-eu" },
      { label: "European Commission — Withdrawal Agreement", url: "https://commission.europa.eu/strategy-and-policy/relations-non-eu-countries/relations-united-kingdom/eu-uk-withdrawal-agreement_en" },
      { label: "Schengen 90/180 rule calculator (ec.europa.eu)", url: "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/schengen-area/short-stay-visas_en" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "sponsor-parents-anywhere",
    question: "Can you sponsor your parents to live with you anywhere?",
    metaDescription:
      "Parent / dependent-relative sponsorship is highly restrictive in most major destinations. Genuine routes exist but with strict criteria, long waits, and high refusal rates.",
    verdict: "mostly_false",
    headline:
      "Parent sponsorship exists in a narrow set of countries with strict criteria — usually requiring the parent be financially dependent, often with a long waiting list. It is NOT a routine consequence of being a citizen or resident.",
    truth:
      "United States: US citizens (not green-card holders) can sponsor parents for immigrant visas via Form I-130 — this is one of the few unlimited Family Preference categories, with no annual cap, processing 12-24 months. United Kingdom: the Adult Dependent Relative (ADR) visa is famously near-impossible — you must prove the parent requires long-term personal care that is unavailable or unaffordable in their country, AND that you can fully support them in the UK; refusal rate is over 80%. Canada: the Parents and Grandparents Program (PGP) operates as a lottery — IRCC randomly selects sponsors from an interest list; even if selected, financial requirements are stringent (Minimum Necessary Income, demonstrated for 3 years). Australia: parent visas exist but have wait times of 10-30 YEARS for the standard non-contributory class; contributory parent visas cost AU$50k+ per applicant for shorter waits (still 4-7 years). New Zealand: Parent Resident Visa reopened 2022 with quota and income thresholds. The pattern: every major Anglosphere destination treats parent sponsorship as exceptional rather than routine.",
    whyExists:
      "Family is universal, so the assumption that families can stay together is intuitive. Immigration policy treats parent sponsorship as a discretionary humanitarian addition rather than a right, which clashes with that intuition.",
    whatToDo: [
      "Check your destination country's specific parent-sponsorship rules before assuming it's possible",
      "US: the I-130 for parents of US citizens is the cleanest route — but parents must be alive, the sponsor must be a US citizen (not green-card holder), and the parent must qualify for adjustment / consular processing",
      "UK: ADR is extraordinarily restrictive — consider whether visitor visa (6 months) with multiple visits is more realistic for your family",
      "Canada: Super Visa (10-year multi-entry visitor for parents/grandparents of citizens/PRs) is an alternative to PGP when you can't get into the lottery",
      "Australia: contributory parent visa is the only realistic route absent a 20+ year wait",
    ],
    countryNotes: [
      { country: "UK", note: "Adult Dependent Relative visa: under 100 grants per year out of thousands of applications. Plan for the visitor-visa alternative." },
      { country: "Canada", note: "Super Visa (multi-entry visitor, 10 years, parents only) is a popular alternative to the PGP sponsorship lottery." },
      { country: "Australia", note: "Subclass 143 (Contributory Parent) charges AU$50k+ per applicant. Subclass 103 (non-contributory) has 20-30 year waits." },
    ],
    sources: [
      { label: "USCIS — Bringing parents to live in the US as permanent residents", url: "https://www.uscis.gov/family/family-of-us-citizens/bringing-parents-to-live-in-the-united-states-as-permanent-residents" },
      { label: "UK gov — Adult Dependent Relative visa", url: "https://www.gov.uk/join-family-in-uk/adult-dependent-relative" },
      { label: "Canada IRCC — Sponsor your parents and grandparents", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-parents-grandparents.html" },
      { label: "Australia DHA — Parent visa", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/parent-103" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "visa-free-means-stay-as-long",
    question: "Does visa-free entry mean you can stay as long as you want?",
    metaDescription:
      "Visa-free entry has a specific maximum stay attached — typically 30, 60, or 90 days. Overstaying triggers re-entry bans even if you entered without a visa.",
    verdict: "false",
    headline:
      "Visa-free entry comes with a specific maximum stay — 30, 60, 90, or 180 days depending on the country pair. Overstaying triggers the same re-entry penalties as overstaying with a visa.",
    truth:
      "'Visa-free' means you don't need to apply for a visa before travel; it does NOT mean unlimited stay. Schengen visa-free is the 90-in-180-day rule — 90 days in any rolling 180-day period across the entire Schengen area. UK visa-free for non-visa-nationals is 6 months. US ESTA is 90 days. Canada eTA is 6 months. Mexico FMM is 180 days. Thailand 2024-extended visa-free is 60 days. Singapore default is 30 days. UAE for many is 30 days, 90 for some. Indonesia VOA is 30 days, extendable once. Every visa-free pair has a maximum stay in the published rules — search 'visa exemption' on the destination MFA / immigration site. Border officers stamp the entry date; the maximum stay runs from that stamp. Overstays trigger penalties: in Schengen, the EES biometric system (rolling out 2025) records every entry / exit and flags overstays automatically; in the US, ESTA overstays end the VWP privilege and force future visa applications; in Thailand the per-day overstay fine accumulates and 90+ day overstays trigger blacklists. Visa-free is a convenience, not a relaxation of the maximum-stay rule.",
    whyExists:
      "The shorthand 'visa-free' sounds like 'free from rules.' Combined with the fact that border officers don't always proactively explain the limits, many travellers don't realise the clock is ticking.",
    whatToDo: [
      "Every time you travel visa-free, look up the SPECIFIC maximum stay for your passport + destination — never assume 90 days",
      "Note the entry-stamp date and calendar the departure deadline",
      "For Schengen, use the EU's 90/180 calculator before each trip if you've been in Schengen recently",
      "If you need longer, apply for a long-stay visa BEFORE you arrive — do not assume you can extend on arrival",
      "Leaving and re-entering does NOT reset Schengen's 90/180 — the rolling window keeps tracking",
    ],
    sources: [
      { label: "European Commission — Schengen short-stay calculator", url: "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/schengen-area/short-stay-visas_en" },
      { label: "ESTA — US Visa Waiver Program terms", url: "https://esta.cbp.dhs.gov/" },
      { label: "Thailand MFA — visa exemption list", url: "https://www.mfa.go.th/en/page/list-of-countries-which-have-concluded-agreements-on-the-exemption-of-visa-requirements" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "schengen-90-180-resets-each-trip",
    question: "Does the Schengen 90/180-day rule reset after each trip?",
    metaDescription:
      "No. The 90/180 rule is a rolling window — your last 180 days are checked every time you enter, not reset on departure. Here's how it actually works.",
    verdict: "false",
    headline:
      "The 90/180 rule is a ROLLING 180-day window. Every time you enter Schengen, the officer counts your prior days in Schengen across the last 180 — leaving and re-entering does NOT reset the count.",
    truth:
      "The Schengen Convention's 90/180 rule is unambiguous: a visa-exempt or short-stay visa holder may stay no more than 90 days in any 180-day period across the Schengen area as a whole. The 180 days are calculated by counting backwards from the day of intended entry — if you've been in Schengen for, say, 88 of the previous 180 days, you have 2 days remaining on this trip. The rolling window means you can never 'use up' your 90 days on one long trip and 'recharge' by leaving for 90 days — you can only re-enter once enough of your prior Schengen days fall outside the rolling 180-day window. The EU's official Schengen calculator (linked below) is the only authoritative tool. Schengen members include 25+ EU countries plus Iceland, Norway, Switzerland, Liechtenstein — Romania and Bulgaria joined the full free-movement area on 31 March 2024 (land border) / 1 January 2025 (sea). Ireland is NOT in Schengen. The Entry/Exit System (EES) launching in October 2025 records every Schengen entry biometrically, so overstays become impossible to hide.",
    whyExists:
      "The rule is counterintuitive — 'rolling 180' is unusual compared to most visa terms. Frequent travellers (digital nomads, business travellers, retirees with seasonal homes) often misunderstand it, and a community of bad advice on Reddit / Facebook reinforces the wrong version.",
    whatToDo: [
      "Bookmark the EU's official Schengen calculator and use it before every trip if you've been in Schengen recently",
      "Keep accurate records of your entry and exit dates with passport stamp photos",
      "If you need to spend more than 90 in 180 in any single Schengen state, apply for a national long-stay (Type D) visa — most member states offer one",
      "If you're a digital nomad cycling between Schengen countries, you cannot use the 90/180 indefinitely — pick a national DN visa instead",
      "Ireland, UK, Romania (until 2024), Cyprus, Croatia (until 2023) provide ways to 'rest' your Schengen clock by spending time outside the area",
    ],
    sources: [
      { label: "European Commission — Schengen short-stay visa calculator", url: "https://ec.europa.eu/home-affairs/content/visa-calculator_en" },
      { label: "Schengen Borders Code (EU Reg 2016/399)", url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0399" },
      { label: "EU Entry/Exit System (EES) — official site", url: "https://travel-europe.europa.eu/ees_en" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "dual-passports-double-rights",
    question: "Does holding dual passports double your rights everywhere?",
    metaDescription:
      "Dual citizenship grants both passports' rights in their respective countries — but third countries usually treat you as one nationality, and some countries don't recognise dual at all.",
    verdict: "partial",
    headline:
      "Dual citizenship grants each passport's rights IN THE ISSUING COUNTRY. In third countries (where you're entering as a foreigner) you choose ONE passport per trip — and some countries don't recognise dual nationality at all.",
    truth:
      "Holding two passports gives you full rights of each citizenship in its own country — you can vote, work, live, claim healthcare, etc. in both. In third countries, immigration treats you as the nationality of the passport you present at the border; you can pick the most favourable for each trip (e.g. a UK / Iranian dual national enters the EU on the UK passport because Iran requires Schengen visas). But several countries do not recognise dual nationality at all — Japan, China, India (which created the OCI 'overseas citizen' status as a workaround), Saudi Arabia, North Korea, Singapore, the Netherlands (with exceptions), Indonesia, Andorra, Argentina (until recently). For these countries: acquiring another citizenship may force you to renounce yours OR mean the dual citizenship isn't legally recognised in either state. Practical implications: tax residency rules apply per-jurisdiction regardless of citizenship; conscription obligations can apply (e.g. some countries require military service from male dual nationals); visa-free lists vary widely between passports of dual nationals (a strong + weak passport combo gives you the union of both visa-free destinations, but only by choosing the right one per trip).",
    whyExists:
      "Dual citizenship is increasingly common and increasingly accepted, but the nuances around third-country treatment and non-recognition jurisdictions get glossed over in marketing material from CBI sellers and immigration consultants.",
    whatToDo: [
      "Before acquiring a second citizenship, check whether your CURRENT country recognises dual citizenship — if not, you may auto-lose the original",
      "Travel with the appropriate passport: enter your home countries on the home passport, enter third countries on the strongest passport",
      "Some countries (US, Eritrea) tax citizens on worldwide income regardless of residence — dual citizenship doesn't escape this",
      "Conscription rules can follow you: some countries (Israel, South Korea, Turkey) impose military service on male citizens regardless of their other nationalities",
      "Renouncing US citizenship: only via the US Embassy + significant exit tax for high-net-worth individuals",
    ],
    countryNotes: [
      { country: "India", note: "Does not recognise dual citizenship. Acquiring foreign citizenship requires surrender of Indian passport. OCI card provides similar (but lesser) rights." },
      { country: "China", note: "Does not recognise dual citizenship. Acquiring foreign citizenship technically renounces Chinese citizenship automatically." },
      { country: "Japan", note: "Requires choice of one nationality by age 22. Enforcement is uneven but the law is clear." },
      { country: "Netherlands", note: "Restricted — exceptions for marriage to a Dutch citizen, certain dual-nationality-at-birth cases." },
    ],
    sources: [
      { label: "US State Dept — Dual Nationality", url: "https://travel.state.gov/content/travel/en/legal/travel-legal-considerations/Advice-about-Possible-Loss-of-US-Nationality-Dual-Nationality.html" },
      { label: "UK gov — Dual nationality", url: "https://www.gov.uk/dual-citizenship" },
      { label: "Government of India — Citizenship policy", url: "https://www.mha.gov.in/en/divisionofmha/foreigners-division" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "tourist-visas-always-90-days",
    question: "Are tourist visas always 90 days?",
    metaDescription:
      "Tourist visa lengths range from 7 days (Bhutan) to 180 days (Mexico FMM) depending on the pair. There is no universal '90 days' standard. Here's the range.",
    verdict: "false",
    headline:
      "Tourist stays range from 7 days (Bhutan tourist visa) to 180 days (Mexico FMM) depending on the passport-destination pair. The 90-day figure is just the most common Schengen and ESTA value.",
    truth:
      "Common tourist-stay lengths: Schengen Type C visa = 90 days in 180 (visa-free or visa-required). US ESTA = 90 days. US B-1/B-2 = up to 180 days at officer discretion. Canada eTA = 6 months. UK visa-free / ETA = 6 months. Mexico FMM = up to 180 days. Singapore = 30 days (default). UAE = 30 days (most) or 90 (some). Indonesia VOA = 30 days, extendable. India e-Tourist 30-day, 1-year, 5-year variants. China = 30 days standard / 60-90 for specific cases or transit. Thailand visa-free = 60 days (extended 2024). Russia tourist visa = up to 30 days. Bhutan tourist permit = 7-14 days standard. Cuba tourist card = 30 days, extendable. New Zealand visa-free / NZeTA = up to 9 months. Japan = 90 days. The 90-day standard reflects Schengen + ESTA dominance in Western travel media. Outside that, the variance is enormous, and getting it wrong is the most common cause of inadvertent overstays.",
    whyExists:
      "Schengen and ESTA together dominate the visa-free travel that Western media covers, both being 90 days. The 90-day figure became shorthand, especially for digital-nomad and travel-blogger content.",
    whatToDo: [
      "Every time you travel visa-free or visa-required tourism, look up the SPECIFIC stay limit for your pair",
      "Visavu's matrix records the maxStayDays for each visa option — check before booking long trips",
      "Border officers can grant less than the maximum — the stay actually granted is the officer's stamp date + max-stay-officer-grants",
      "If you've planned a trip longer than the visa-free max, either get a long-stay visa OR plan to leave and re-enter (where allowed)",
      "Always carry proof of onward travel within the maximum stay — border officers ask for this",
    ],
    sources: [
      { label: "US Visa Waiver Program — ESTA terms", url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html" },
      { label: "UK Standard Visitor visa — terms of stay", url: "https://www.gov.uk/standard-visitor" },
      { label: "Mexico INM — FMM 180-day Tourist Card", url: "https://www.inm.gob.mx/gobmx/word/index.php/forma-migratoria-multiple-fmm/" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "birthright-citizenship-everywhere",
    question: "Does birthright citizenship exist everywhere?",
    metaDescription:
      "Unconditional birthright citizenship (jus soli) exists in most of the Americas and a few African states. Most of the world requires at least one citizen parent.",
    verdict: "false",
    headline:
      "Unconditional jus soli — citizenship purely from being born on the soil — exists in most of the Americas (US, Canada, Mexico, Brazil, Argentina, Chile, etc.), in a few African states, and almost nowhere else in the developed world. Most of Europe and Asia require at least one parent to be a citizen or legal resident.",
    truth:
      "Unconditional jus soli: US, Canada, Mexico, Brazil, Argentina, Chile, Peru, Uruguay, Venezuela, all of Central America, most of the Caribbean — the Americas remain the global outlier. A few African states (Lesotho, Pakistan with restrictions, Tanzania with restrictions). Conditional jus soli (requires at least one parent to be a legal resident / citizen, or born in country to non-citizen parents under specific conditions): UK (since 1983, parent must be citizen or settled), France, Germany (since 2000 for children of long-term resident parents), Ireland (since 2005, parent must be Irish or have lived in Ireland 3+ years), Australia (parent must be Australian citizen or PR), Spain, Portugal, South Africa, Egypt, Greece, India (very restricted since 2003). Pure jus sanguinis (citizenship by descent only — being born on the soil grants NOTHING): Japan, China, South Korea, most of the Middle East, most of Asia, much of Eastern Europe. The trend has been to RESTRICT jus soli over the past 30 years (UK in 1983, India in 2003, Ireland in 2005, Australia in 2007) due to political concerns about 'birth tourism' and citizenship for the children of undocumented residents.",
    whyExists:
      "Americans (and to a lesser extent Brazilians, Canadians) often assume birthright citizenship is universal because it's the cultural default in their country. The history of restricting jus soli in non-American jurisdictions hasn't filtered into popular awareness.",
    whatToDo: [
      "Before planning birth tourism, verify the destination country's nationality law — most countries do NOT grant citizenship to children of foreigners",
      "Even in jus-soli countries, the child gets the citizenship; the parents do not get residence",
      "If you're a child of immigrants and unsure of your citizenship status, you may be eligible by descent (jus sanguinis) through one or both parents — check both",
      "Citizenship by descent often passes through one or two generations and can be reclaimed even decades after the ancestor emigrated (e.g. Italian, Polish, Irish jure sanguinis)",
    ],
    sources: [
      { label: "US Citizenship and Nationality (USCIS)", url: "https://www.uscis.gov/citizenship/learn-about-citizenship/citizenship-and-naturalization/i-am-a-us-citizen" },
      { label: "UK gov — British nationality (immigration and nationality summary)", url: "https://www.gov.uk/types-of-british-nationality" },
      { label: "Government of Ireland — Irish citizenship by birth", url: "https://www.citizensinformation.ie/en/moving-country/irish-citizenship/irish-citizenship-through-birth-or-descent/" },
    ],
    lastVerified: "2026-05-19",
  },
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "visa-valid-until-expiry-no-matter-what",
    question: "Is a visa valid until its expiry date no matter what?",
    metaDescription:
      "Visas can be revoked, invalidated by changes in status, or cancelled at the border. A printed expiry date is not a guarantee. Here's when a visa can lapse early.",
    verdict: "false",
    headline:
      "A visa's expiry date is the LATEST it can be valid — not a guarantee. Visas can be revoked, cancelled at the border, invalidated by changes in your circumstances, or shortened by enforcement actions before that date.",
    truth:
      "Reasons a visa can become invalid before its printed expiry: (1) the underlying basis ends — Skilled Worker visa cancels when employment ends; Student visa lapses when you withdraw or drop below full-time; Partner visa can be revoked on relationship breakdown. (2) New disqualifying information emerges — criminal conviction, immigration breach, false-statement findings. (3) Border-officer discretion at re-entry — a visa is permission to APPLY for admission, not a guarantee of admission. Border officers can refuse entry even on a valid visa if they suspect non-genuine intent. (4) Country-of-origin sanctions — Russian and Iranian visa holders to Schengen / UK / US have seen visas suspended without notice since 2022. (5) Visa-issuing country revocation — the State Department / Home Office can revoke any visa at their discretion. (6) Passport invalidation — if your passport is invalidated (lost, expired, cancelled), the visa printed in it is no longer valid. The practical implication: do not assume an unexpired visa means continued admissibility. Always check the visa terms when your status changes, and never assume past entries guarantee future ones.",
    whyExists:
      "Visas are physical documents with printed expiry dates, which intuitively reads as a contractual term. The legal reality — that visas are conditional grants of permission rather than rights — is technical and not well communicated by issuing authorities.",
    whatToDo: [
      "When your employment / study / relationship status changes, check the visa terms immediately — many visas auto-cancel",
      "Notify the immigration authority of changes within the required window (UK Skilled Worker: 28 days for employer changes)",
      "Get a new visa or in-country switch BEFORE the underlying status ends, where possible",
      "Carry supporting documents on re-entry — employer letter, enrolment letter, relationship evidence — to demonstrate continued eligibility",
      "If your visa is revoked, you typically have a defined period to leave or appeal — engage a registered immigration adviser immediately",
    ],
    sources: [
      { label: "UK gov — Curtail or vary your visa", url: "https://www.gov.uk/government/publications/visas-and-immigration-curtailment-of-leave" },
      { label: "USCIS — Visa cancellation and revocation", url: "https://www.uscis.gov/i-9-central" },
      { label: "Government of Canada — Cancellation of an immigration document", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides.html" },
    ],
    lastVerified: "2026-05-19",
  },
];

/** Lookup by slug. */
export function mythBySlug(slug: string): Myth | undefined {
  return MYTHS.find((m) => m.slug === slug);
}

/** All slugs — used for generateStaticParams. */
export function allMythSlugs(): string[] {
  return MYTHS.map((m) => m.slug);
}
