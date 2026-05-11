/**
 * Per-purpose visa-application advice — the editorial "how to actually win
 * this application" content the user asked for.
 *
 * Inspired by the user's own experience: when applying for a partner visa,
 * a thoughtful AI-drafted personal statement saved them thousands in legal
 * fees. This module surfaces:
 *
 *   - WHAT_CARRIES_WEIGHT: which evidence categories matter most for the
 *     visa type, ranked by typical caseworker scrutiny
 *   - PERSONAL_STATEMENT_TEMPLATE: a prose skeleton that walks through the
 *     points a strong statement should cover, in the right order
 *   - MONEY_SAVING_TIPS: common mistakes that cost real money (rejected
 *     applications, expedited fees that weren't necessary, etc.)
 *   - LAWYER_TRIGGERS: when to spend the money on a real immigration
 *     lawyer (and when you can DIY safely)
 *
 * These render on every result page below the application checklist.
 */

import type { Purpose } from "@/lib/types";

export type AdviceBlock = {
  /** Ranked evidence categories — most-scrutinised first. */
  whatCarriesWeight: { label: string; why: string }[];
  /** Skeleton paragraphs the applicant can fill in to draft their own
   *  personal statement / letter of motivation. */
  personalStatementTemplate: { heading: string; prompt: string }[];
  /** Specific things people get wrong that cost them money or a refusal. */
  moneySavingTips: string[];
  /** When DIY is fine vs. when a qualified immigration lawyer is worth the
   *  £300-£2,000 they'll charge. */
  lawyerTriggers: { diy: string[]; getALawyer: string[] };
};

export const ADVICE_BY_PURPOSE: Record<Purpose, AdviceBlock | null> = {
  tourism: null, // tourist visas rarely need a personal statement
  business: null,
  transit: null,
  diplomatic: null,

  family: {
    whatCarriesWeight: [
      {
        label: "Genuine, subsisting relationship evidence",
        why:
          "The single biggest fraud signal caseworkers watch for is a relationship of convenience. Spread of evidence across financial, household, social and communication dimensions matters more than volume in any one category — 30 photos and nothing else is weaker than 5 photos + joint tenancy + joint bank statements + WhatsApp logs across the entire relationship.",
      },
      {
        label: "Financial-requirement compliance",
        why:
          "The sponsor's income / savings test is binary — you meet it or you don't. Most refused partner-visa applications fail here before the caseworker even reads the relationship evidence. Calculate the threshold for {destination}'s partner / spouse visa precisely (it's in the visa fee + processing details above). Most countries have hard-coded ways of evidencing salary, self-employment, savings, and pension income — they don't substitute freely.",
      },
      {
        label: "Personal statement / letter of intent",
        why:
          "A clear, dated narrative of how you met, when the relationship became serious, the major milestones (moving in together, engagement, marriage), and your plans for the destination is the caseworker's roadmap through the evidence bundle. A confused or contradictory statement does damage that strong evidence can't fully undo.",
      },
      {
        label: "Police certificates from every long-term residence",
        why:
          "Missing one police certificate from a country you lived in 6+ months sets the application back 8–12 weeks. They're the slowest-to-obtain document — start them on day one.",
      },
      {
        label: "Medical exam (when required)",
        why:
          "Many destinations only require a medical for relationships forming in TB-prevalent regions. Check the destination's TB-test country list; if you're on it, book the panel physician early — 4–6-week waits in major cities.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "1. How we met",
        prompt:
          "Date, place, context. Were you introduced by friends / family / app / work / study? Lead with concrete dates. 'In March 2022, we met through a mutual friend at her birthday in London' beats 'we met through friends a few years ago' every time.",
      },
      {
        heading: "2. How the relationship developed",
        prompt:
          "First few months: how often did you meet? What did you do together? When did you decide you were a couple? When did your families first meet? Caseworkers want a TIMELINE, not just a feeling — annotate dates.",
      },
      {
        heading: "3. Cohabitation and shared life",
        prompt:
          "When did you move in together? What's the address? Whose name is on the tenancy / mortgage? What bills are in joint names? Who pays what? Cover ANY long-distance periods explicitly — they're not disqualifying as long as you can show communication and visits.",
      },
      {
        heading: "4. Big milestones — engagement, marriage, kids",
        prompt:
          "Date, location, who attended. If parents / siblings travelled to be there, name them. The detail signals authenticity.",
      },
      {
        heading: "5. Why we want to live in [destination]",
        prompt:
          "Job offer? Family ties? Existing residency right? Education? Be SPECIFIC about what you'll do in the destination — vague 'we want to build our life there' is weaker than 'I have a Skilled Worker job offer from Company X starting June' or 'my partner's parents are in [city] and need care.'",
      },
      {
        heading: "6. Long-term intent",
        prompt:
          "A line on your intent to live together in {destination} long-term, raise a family, contribute economically, etc. Match the wording to {destination}'s own policy language — Anglophone destinations use phrases like 'genuine and subsisting relationship' or 'bona-fide marriage'; lifting that exact phrase signals you've read the rules.",
      },
    ],
    moneySavingTips: [
      "Don't pay for translations of documents already in the destination's official language — many applicants over-translate. Check what's mandatory.",
      "Police certificates: use the FAST channel (FBI Channeler / ACRO Premium / AFP urgent) for ~$20-50 extra rather than the standard mail-in route that can take 8-12 weeks; missing a visa appointment because your police check was delayed costs far more.",
      "If your sponsor's income is just below {destination}'s threshold, savings can usually substitute (the exact ratio varies by country — typically 2-3x the annual income requirement held in cash for 6+ months). Combining sources is permitted in narrow ways — get this right before paying the application fee.",
      "Don't pay for a translation of WhatsApp / iMessage screenshots in English to the destination's English-speaking immigration service. People do this.",
      "Time your application to your visit, not to a deadline — most partner visas are valid 30 days from issue. Apply too early and you'll re-pay if you can't enter in time.",
      "Premium / priority processing is rarely worth it for partner visas (a few extra weeks) but often worth it for student / Skilled Worker visas with semester / contract start dates.",
    ],
    lawyerTriggers: {
      diy: [
        "First-time application, no prior immigration history, English-speaking destination, sponsor meets the income test cleanly, no children from previous relationships, no criminal history on either side",
        "Re-applying after a refusal where the refusal reason was a clearly fixable document gap",
        "Renewal applications where nothing material has changed",
      ],
      getALawyer: [
        "Prior visa refusal or immigration violation on either side (overstays, deportations, false-statement findings)",
        "Criminal record (any) on the applicant's side — destinations interpret rehabilitation periods differently",
        "Complex sponsor finances (mixed self-employment + employment, recent job change, business owner, overseas income)",
        "Same-sex relationship to a destination where local recognition is uncertain (UAE, Saudi Arabia, much of Africa) — a specialist understands the workarounds",
        "Dependent children from a prior relationship, especially across multiple jurisdictions",
        "Adult Dependent Relative (UK), Parent Sponsorship (CA), Caregiver routes — exceptionally complex evidence requirements",
      ],
    },
  },

  work: {
    whatCarriesWeight: [
      {
        label: "Genuine job offer + employer sponsor compliance",
        why:
          "The sponsor's track record matters as much as your CV. Caseworkers cross-check: is the company actually trading? Does the salary match Companies House / equivalent filings? Has the sponsor had prior refusals for similar roles? A blue-chip sponsor letterhead is worth more than a perfect personal statement.",
      },
      {
        label: "Salary at or above the role's threshold",
        why:
          "Like family routes, this is the binary first filter. Every skilled-worker visa publishes a minimum salary (or a 'prevailing wage' for that occupation) — {destination}'s figure is in the visa details above. Genuine offers below threshold get refused before merit review, no matter how strong the rest of the application.",
      },
      {
        label: "Qualifications matching the role",
        why:
          "Caseworkers cross-reference the SOC / ANZSCO / NOC occupation code against your degree + work history. A computer science degree applying for an accountant role triggers genuineness questions. If you're switching fields, evidence the transferable skills carefully.",
      },
      {
        label: "Maintenance funds + dependents",
        why:
          "If the employer doesn't certify your living costs, you need to show {destination}'s required maintenance savings in your own account — typically held for 28+ consecutive days before you apply. The exact amount varies by destination and family size; check the visa details above.",
      },
      {
        label: "Police certificates + medicals (long-stay only)",
        why:
          "Long-lead documents — always start these first. Some destinations (Australia, Canada) require medical from designated physicians, often booked 4-6 weeks out.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "1. Your role in plain English",
        prompt:
          "What is the job? What does the company do? What will YOUR specific responsibilities be? Use everyday language — a caseworker isn't going to know what 'iOS infrastructure engineer' means without context. 'I'll lead the team that maintains the company's iPhone app, used by 12 million customers' lands better.",
      },
      {
        heading: "2. Why YOU specifically",
        prompt:
          "What does your CV say about your fit? Three years of relevant experience + a relevant degree + a recommendation from a prior senior beats five years of unrelated experience. Match your background to the occupation code.",
      },
      {
        heading: "3. Why this employer",
        prompt:
          "How did you find them? Recruiter? Direct application? Were you headhunted? Are they in their industry's top 10? The 'genuine vacancy' test is the single most-failed item — a recruiter trail or competitive-application story signals legitimacy.",
      },
      {
        heading: "4. Your settlement plans",
        prompt:
          "Are you bringing dependents? Where will you live (rented short-term, then own / company-provided)? Brief mention of your destination integration plans (kids' schools, healthcare, etc.) for Skilled Worker visas where settled status is the long-term goal.",
      },
    ],
    moneySavingTips: [
      "Don't pay for priority processing unless you have a contract start date you genuinely can't move. Standard service is usually 2-6 weeks; priority gets you 1-2 weeks for a few hundred extra. Negotiate a flexible start with the employer instead.",
      "Many countries charge a separate health-system levy on work visas (UK Immigration Health Surcharge, AU Health Care Levy, etc.) that compounds annually — long-term planners get out faster by pursuing settlement / naturalisation when eligible rather than visa-stacking.",
      "For sponsor-paid fee schemes (most countries' employer-sponsored routes), the employer should pay all government fees. Accepting any reimbursement clawback is usually a refusal trigger AND a labour-law violation in {destination}.",
      "Sponsorship certificate fees are non-refundable. Get the offer in writing AND check the sponsor's licence is in good standing with {destination}'s immigration authority before paying anything.",
      "If {destination} uses a points-based system, getting language test scores 1 band higher could be worth more than 10 points — IELTS 8.0 vs 7.0 changes invitation rounds materially. Re-take if it's tight.",
    ],
    lawyerTriggers: {
      diy: [
        "Standard skilled-worker route at a major sponsor (FAANG, Big 4, NHS, etc.) with clean immigration history",
        "Salary clearly above threshold, occupation clearly on the shortage / eligible list",
        "Single applicant, no dependents",
      ],
      getALawyer: [
        "Multi-country tax residency or split-payroll arrangements",
        "Sponsor compliance issues — recent license action, recent refusals on related roles",
        "Switching visa categories from inside {destination} (e.g. student → skilled-worker switch-in-country)",
        "Treaty Trader / Investor visas — investment-based routes have layered technicality and {destination}'s rules change often",
        "Recent refusal in your or your sponsor's history",
        "Director / shareholder of the sponsoring company (genuineness test is harder)",
      ],
    },
  },

  study: {
    whatCarriesWeight: [
      {
        label: "Genuine intent + course-of-study choice rationale",
        why:
          "The 'genuine student' test is the #1 reason student visas get refused. Caseworkers ask: does this person plan to actually study? Why this specific course at this specific institution? Why not at home? A 23-year-old with a 6-year work history applying for an entry-level Bachelor's signals a labour-market angle — needs explicit handling.",
      },
      {
        label: "Funds threshold + tuition deposit",
        why:
          "Like family / work, financial requirements are binary. {destination} publishes a per-month or per-year maintenance figure for students (check the visa details above for your exact threshold). Money has to be there for a specified period BEFORE you apply — usually 28 consecutive days held in your own account, with the equivalent of one year's costs visible — not 'about to arrive'.",
      },
      {
        label: "English / language proficiency",
        why:
          "Even for English-taught programmes, most destinations want a UKVI-approved IELTS / TOEFL / Duolingo / PTE result. The score-band thresholds are inflexible — applying with a 6.5 when the visa class needs 7.0 is a hard fail.",
      },
      {
        label: "Acceptance letter + CAS / I-20 / LoA reference number",
        why:
          "Caseworkers verify the reference number with the institution's sponsor licence record. Self-printed letters get refused; you need the official institution-generated PDF with the unique CAS / I-20 / CoE / Letter of Acceptance reference.",
      },
    ],
    personalStatementTemplate: [
      {
        heading: "1. Why this specific course",
        prompt:
          "Don't just say 'I want to study computer science' — say WHY this course at THIS institution. Cite faculty names, research strengths, employer outcomes specific to the programme. 'X University's MSc in [Specialism] is the only programme in {destination} to combine [A] with [B]' beats 'computer science at X is well-known.'",
      },
      {
        heading: "2. Why this country (rather than at home)",
        prompt:
          "Honest answer: better facilities, English-language exposure, post-study work opportunity, scholarship, prestige. Don't lie — most caseworkers will read 'I love your culture' as filler. 'My home country offers the same degree but in [local language]; my career path requires English-language work experience' is more credible.",
      },
      {
        heading: "3. Course fit with your prior education + work",
        prompt:
          "Address any apparent gap. If you've been working for 5 years and going back to a Bachelor's, explain the career pivot. If you have a Master's and applying for another Master's, justify the additional study. Caseworkers see thousands of applications — the unexplained gap is what triggers refusal.",
      },
      {
        heading: "4. Funding plan",
        prompt:
          "Be explicit: scholarship details, family support evidence, tuition prepayment, savings, sponsor's relationship + occupation. The sponsor's tax records / payslips should be referenced inline so the caseworker can see how the funds line up.",
      },
      {
        heading: "5. Post-study plans",
        prompt:
          "Will you use {destination}'s post-study work permit (most countries offer one — UK Graduate Route, Canada PGWP, Australia Subclass 485, US OPT, NZ Post-Study Work Visa, etc.)? Or return home? Both are valid — caseworkers DON'T penalise post-study work intent as long as you're honest about it. The fatal answer is being vague.",
      },
    ],
    moneySavingTips: [
      "If your funds are family-sponsored, get the sponsor letter notarised BEFORE the bank statements — re-doing it adds 2-3 weeks.",
      "Many universities in {destination} accept a tuition deposit (rather than full first year) — pay only the minimum required to trigger your acceptance letter / CoE / CAS / I-20.",
      "Priority student visa: usually worth it if your course start date is within 6 weeks. Standard 8-week processing has missed thousands of September starts.",
      "Skip the agent fee if your home country offers free guidance through the destination's official student-information service (British Council, Campus France, DAAD, Education NZ, EduCanada, etc.).",
      "Some destinations (Germany, France, Italy, Norway, parts of Sweden) have no tuition fees for non-EU students at PUBLIC universities — much cheaper than US/UK/AU/CA. The visa class is the same, the wallet impact is 5-10x.",
    ],
    lawyerTriggers: {
      diy: [
        "Fresh-out-of-school applicant, straight academic progression, full funding evident, no immigration history",
        "Master's after Bachelor's in a related field at the same level destination",
      ],
      getALawyer: [
        "Prior visa refusal (especially Genuine Student / Genuine Temporary Entrant)",
        "Switching course / institution / visa class mid-stream",
        "Self-funded with funds from cryptocurrency, gifts from non-immediate-family, or business income (provenance scrutiny is high)",
        "Older 'mature' student returning to undergraduate study after a long work career",
        "Applying with dependents (spouse + children) for a coursework Master's — most destinations restrict this",
      ],
    },
  },
};
