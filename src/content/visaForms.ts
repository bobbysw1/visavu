/**
 * Curated visa-forms library — country-specific government PDFs.
 *
 * Different from src/content/visaDocuments.ts: that file is the
 * GENERIC document checklist (passport / police check / medical /
 * apostille — what every long-stay applicant needs). THIS file is the
 * FORM-CODE library — Australia Form 888, US I-130, UK Appendix
 * FM-SE, Canada IMM 5532 — the specific government PDFs an applicant
 * downloads, completes, and submits.
 *
 * Every entry points at a SPECIFIC government download page — NOT the
 * raw PDF filename. Raw filenames change quarterly without redirects;
 * landing pages stay URL-stable for years on Home Office, USCIS,
 * IRCC, Home Affairs (AU). When a form is retired the gov page itself
 * says so — quarterly audit pass catches it.
 *
 * Coverage strategy: top-traffic visa programmes only, hand-curated.
 * Automating scrape of every form across 250 destinations would be
 * brittle (gov sites restructure constantly). The pragmatic approach
 * is to cover the 20-30 visa categories users actually file against
 * (UK Skilled Worker, AU Partner, US K-1, Canada Express Entry,
 * Schengen short-stay, etc) and accept that the long tail falls
 * back to "apply on the official portal" without a pre-cached form
 * library.
 *
 * Schema:
 *   destinationIso2  — keying for surfacing on /[passport]/[destination] pages
 *   applicableTo     — purpose + label-keyword match for route-page surfacing
 *   forms[]          — the actual downloadable list
 *
 * Re-verify quarterly.
 */

import type { Purpose } from "@/lib/types";

export type VisaForm = {
  /** Official form code (e.g. "Form 888", "I-130", "VAF4A"). */
  code: string;
  /** Human-readable form name. */
  name: string;
  /** One-line description of what the form is for. */
  description: string;
  /** Direct URL to the official government download page (NOT the raw
   *  PDF). Stable across quarterly form revisions. */
  downloadUrl: string;
  /** Who must complete it. */
  filedBy: "applicant" | "sponsor" | "witness" | "employer" | "joint";
  /** When in the application flow this form is needed. */
  stage: "before_applying" | "with_application" | "after_decision";
  /** Optional context — what makes this form unusual / commonly mis-filled. */
  notes?: string;
};

export type FormsEntry = {
  destinationIso2: string;
  /** Display name for this group, e.g. "Australia — Partner Visa (Subclass 820/801)". */
  programmeLabel: string;
  /** The visa-route URL slug on Visavu so users can jump to the relevant
   *  rules page from /documents. */
  programmeSlug: string;
  /** Filter for surfacing on /[passport]/[destination] pages — matches
   *  the page's purpose + visa-label keywords. */
  applicableTo: {
    purposes: Purpose[];
    /** Lowercased substring match against visa option labels.
     *  Example: "partner", "subclass 820", "spouse". */
    labelKeywords: string[];
  };
  /** Official application portal URL (the page where the user logs in
   *  to submit the visa, NOT the form-download page). */
  applicationPortal: string;
  /** The forms themselves, in the order the applicant typically encounters them. */
  forms: VisaForm[];
  /** Optional notes block — what to know before downloading anything. */
  notes?: string;
};

// ─────────────────────────────────────────────────────────────────────────
// AUSTRALIA
// ─────────────────────────────────────────────────────────────────────────
const AU_PARTNER: FormsEntry = {
  destinationIso2: "AU",
  programmeLabel: "Australia — Partner Visa (Subclass 820/801 onshore, 309/100 offshore)",
  programmeSlug: "/destination/au",
  applicableTo: {
    purposes: ["family"],
    labelKeywords: ["partner", "subclass 820", "subclass 309", "spouse"],
  },
  applicationPortal: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/partner-onshore",
  forms: [
    {
      code: "Form 47SP",
      name: "Application for migration to Australia by a partner",
      description: "Main 30-page application form — relationship history, employment, addresses for the past 10 years.",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/47sp.pdf",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "Form 40SP",
      name: "Sponsorship for a partner to migrate to Australia",
      description: "Sponsor's commitment form — confirms the Australian partner / PR holder is undertaking to support the applicant for 2 years.",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/40sp.pdf",
      filedBy: "sponsor",
      stage: "with_application",
    },
    {
      code: "Form 888",
      name: "Statutory declaration by a supporting witness",
      description: "Third-party witness declarations — friends/family of the couple swear under oath that the relationship is genuine. Typically 2-4 of these submitted.",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/888.pdf",
      filedBy: "witness",
      stage: "with_application",
      notes: "The single most-asked-about form on partner visas. Must be a Commonwealth statutory-declaration form witnessed by a JP / pharmacist / solicitor. The DHA accepts the Federal stat-dec form OR any State equivalent.",
    },
    {
      code: "Form 1221",
      name: "Additional personal particulars",
      description: "Asked for some nationalities + when the case officer wants extended biographical / address / employment history.",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/1221.pdf",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "Form 80",
      name: "Personal particulars for character assessment",
      description: "Detailed bio + travel history for the past 10 years. Required when the case officer wants to deepen the character / security background check.",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/80.pdf",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "Form 1229",
      name: "Consent form to grant an Australian visa to a minor child",
      description: "Required when applicant is under 18 and travelling with one parent — the non-travelling parent signs consent.",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/1229.pdf",
      filedBy: "joint",
      stage: "with_application",
    },
  ],
  notes:
    "Partner visa is a two-stage process: provisional Subclass 820 (onshore) / 309 (offshore) first, then permanent 801 / 100 after 2 years if the relationship continues. The same forms are re-submitted at stage 2 with updated evidence.",
};

const AU_VISITOR: FormsEntry = {
  destinationIso2: "AU",
  programmeLabel: "Australia — Visitor Visa (Subclass 600)",
  programmeSlug: "/destination/au",
  applicableTo: {
    purposes: ["tourism", "business", "family"],
    labelKeywords: ["visitor", "subclass 600", "tourist"],
  },
  applicationPortal: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600/apply-pacific",
  forms: [
    {
      code: "Form 1419",
      name: "Application for a Visitor visa — Tourist stream",
      description: "Paper form (most apply online via ImmiAccount; paper form is for stream/country combinations that don't support online).",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/1419.pdf",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "Form 1415",
      name: "Application for a Visitor visa — Business Visitor stream",
      description: "Business stream variant — for short business meetings / conferences / contract negotiations.",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/1415.pdf",
      filedBy: "applicant",
      stage: "with_application",
    },
  ],
  notes: "Most applicants use the online ImmiAccount system, not paper forms. The PDFs here are for the small set of stream/country combinations that still file on paper.",
};

const AU_WORK_482: FormsEntry = {
  destinationIso2: "AU",
  programmeLabel: "Australia — Skills in Demand Visa (Subclass 482, ex-TSS)",
  programmeSlug: "/destination/au",
  applicableTo: {
    purposes: ["work"],
    labelKeywords: ["subclass 482", "skills in demand", "tss", "employer-sponsored"],
  },
  applicationPortal: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-482",
  forms: [
    {
      code: "Form 1196i",
      name: "Health Examinations Required for an Australian Visa",
      description: "Lists which health-check categories apply based on visa type + duration + originating country.",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/1196i.pdf",
      filedBy: "applicant",
      stage: "before_applying",
    },
    {
      code: "Form 80",
      name: "Personal particulars for character assessment",
      description: "Bio + travel + employment history. Required for many 482 sponsorship cases.",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/80.pdf",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "Form 1196N",
      name: "Sponsorship guidelines",
      description: "Reference document for the sponsoring employer — explains the Standard Business Sponsorship + nomination obligations.",
      downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/1196n.pdf",
      filedBy: "employer",
      stage: "before_applying",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// UNITED STATES
// ─────────────────────────────────────────────────────────────────────────
const US_FAMILY_IMMIGRATION: FormsEntry = {
  destinationIso2: "US",
  programmeLabel: "United States — Family-based Immigration (Form I-130)",
  programmeSlug: "/destination/us",
  applicationPortal: "https://www.uscis.gov/i-130",
  applicableTo: {
    purposes: ["family"],
    labelKeywords: ["i-130", "spouse", "family-based"],
  },
  forms: [
    {
      code: "Form I-130",
      name: "Petition for Alien Relative",
      description: "The US citizen / LPR sponsor files this to start the family-immigration process. Filed BEFORE the foreign spouse / fiancé can apply.",
      downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-130.pdf",
      filedBy: "sponsor",
      stage: "before_applying",
      notes: "The Genesis form for spousal / parent / sibling immigration. Online filing via myUSCIS is faster + cheaper ($625 vs $675 paper) and provides receipt confirmation immediately.",
    },
    {
      code: "Form I-130A",
      name: "Supplemental Information for Spouse Beneficiary",
      description: "Spouse-specific addendum to I-130 — address history + work history.",
      downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-130a.pdf",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "Form I-864",
      name: "Affidavit of Support",
      description: "The sponsor's binding financial-support undertaking — income proof + tax returns for the last 3 years. Required for almost every family-based immigrant visa.",
      downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-864.pdf",
      filedBy: "sponsor",
      stage: "with_application",
    },
    {
      code: "DS-260",
      name: "Online Immigrant Visa Application",
      description: "Online form filed by the foreign spouse at the consulate stage (after I-130 approval + NVC processing).",
      downloadUrl: "https://travel.state.gov/content/travel/en/us-visas/immigrate/national-visa-center/nvc-contact-information.html",
      filedBy: "applicant",
      stage: "with_application",
      notes: "Submit via CEAC online portal (https://ceac.state.gov/iv), not a paper form.",
    },
  ],
};

const US_K1_FIANCE: FormsEntry = {
  destinationIso2: "US",
  programmeLabel: "United States — Fiancé(e) Visa (Form I-129F / K-1)",
  programmeSlug: "/destination/us",
  applicationPortal: "https://www.uscis.gov/i-129f",
  applicableTo: {
    purposes: ["family"],
    labelKeywords: ["k-1", "i-129f", "fiance", "fiancé"],
  },
  forms: [
    {
      code: "Form I-129F",
      name: "Petition for Alien Fiancé(e)",
      description: "Filed by the US citizen to bring foreign fiancé(e) to the US to marry within 90 days of arrival.",
      downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-129f.pdf",
      filedBy: "sponsor",
      stage: "before_applying",
    },
    {
      code: "DS-160",
      name: "Online Nonimmigrant Visa Application",
      description: "Foreign fiancé(e) submits at consulate stage after I-129F approval.",
      downloadUrl: "https://ceac.state.gov/genniv/",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "Form I-134",
      name: "Affidavit of Support (lighter version for nonimmigrants)",
      description: "US citizen sponsor's financial support for the K-1 stay (different from the heavier I-864 used post-marriage).",
      downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-134.pdf",
      filedBy: "sponsor",
      stage: "with_application",
    },
    {
      code: "Form I-485",
      name: "Application to Register Permanent Residence",
      description: "Filed AFTER marriage (within the 90-day window) to adjust status to LPR. Marks the start of the green-card phase.",
      downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-485.pdf",
      filedBy: "applicant",
      stage: "after_decision",
    },
  ],
};

const US_H1B_WORK: FormsEntry = {
  destinationIso2: "US",
  programmeLabel: "United States — H-1B / L-1 Employer-Sponsored Work",
  programmeSlug: "/destination/us",
  applicationPortal: "https://www.uscis.gov/i-129",
  applicableTo: {
    purposes: ["work"],
    labelKeywords: ["h-1b", "h1b", "l-1", "i-129", "employer-sponsor"],
  },
  forms: [
    {
      code: "Form I-129",
      name: "Petition for a Nonimmigrant Worker",
      description: "Employer files to sponsor a foreign worker on H-1B / L-1 / O-1 / TN. The Genesis form for almost every US work-visa class.",
      downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-129.pdf",
      filedBy: "employer",
      stage: "before_applying",
    },
    {
      code: "ETA-9035",
      name: "Labor Condition Application (H-1B prerequisite)",
      description: "Filed with Dept of Labor (not USCIS) BEFORE the I-129 petition. Certifies the employer is paying the prevailing wage + complying with H-1B rules.",
      downloadUrl: "https://www.dol.gov/agencies/eta/foreign-labor/forms",
      filedBy: "employer",
      stage: "before_applying",
      notes: "LCA must be certified by DOL before USCIS will accept the I-129. This is the slow step for first-time sponsors.",
    },
    {
      code: "Form I-907",
      name: "Request for Premium Processing",
      description: "Optional add-on — guarantees USCIS adjudicates I-129 within 15 calendar days for $2,805 extra fee.",
      downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-907.pdf",
      filedBy: "employer",
      stage: "with_application",
    },
    {
      code: "DS-160",
      name: "Online Nonimmigrant Visa Application",
      description: "Foreign worker files at consulate stage after I-129 approval.",
      downloadUrl: "https://ceac.state.gov/genniv/",
      filedBy: "applicant",
      stage: "with_application",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// UNITED KINGDOM
// ─────────────────────────────────────────────────────────────────────────
const UK_SKILLED_WORKER: FormsEntry = {
  destinationIso2: "GB",
  programmeLabel: "United Kingdom — Skilled Worker Visa",
  programmeSlug: "/destination/gb",
  applicationPortal: "https://www.gov.uk/skilled-worker-visa/apply-from-outside-the-uk",
  applicableTo: {
    purposes: ["work"],
    labelKeywords: ["skilled worker", "tier 2"],
  },
  forms: [
    {
      code: "Online application",
      name: "Skilled Worker visa application (gov.uk)",
      description: "Fully-online application via gov.uk. No PDF form — fill in the wizard, pay, then book biometrics at a VAC.",
      downloadUrl: "https://visas-immigration.service.gov.uk/product/skilled-worker-visa",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "Certificate of Sponsorship",
      name: "CoS — issued by the licensed sponsor",
      description: "The employer's licensed-sponsor portal issues a Certificate of Sponsorship reference number. You enter it in the visa application — no separate PDF.",
      downloadUrl: "https://www.gov.uk/uk-visa-sponsorship-employers",
      filedBy: "employer",
      stage: "before_applying",
    },
    {
      code: "Appendix Skilled Worker",
      name: "Immigration Rules — Appendix Skilled Worker",
      description: "The rule-book the Home Office adjudicates against. Read sections SW 14 (English) + SW 7 (salary) before submitting.",
      downloadUrl: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker",
      filedBy: "applicant",
      stage: "before_applying",
    },
  ],
  notes: "UK Skilled Worker is fully online — there is no PDF application form. The 'forms' here are reference documents you should read before starting the wizard.",
};

const UK_SPOUSE_5YR: FormsEntry = {
  destinationIso2: "GB",
  programmeLabel: "United Kingdom — Spouse / Family Visa (5-year route)",
  programmeSlug: "/destination/gb",
  applicationPortal: "https://www.gov.uk/uk-family-visa/partner-spouse",
  applicableTo: {
    purposes: ["family"],
    labelKeywords: ["spouse", "partner", "family", "su07"],
  },
  forms: [
    {
      code: "Online application",
      name: "Family visa application (gov.uk)",
      description: "Online wizard at gov.uk. The 'application form' is the wizard itself — no PDF.",
      downloadUrl: "https://www.gov.uk/uk-family-visa/partner-spouse",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "Appendix FM-SE",
      name: "Specified Evidence — Financial Requirement",
      description: "The rule-book listing which financial documents prove the £29,000 / £38,700 income requirement. The single most-failed area of UK family visas — read in full.",
      downloadUrl: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-fm-se-family-members-specified-evidence",
      filedBy: "applicant",
      stage: "before_applying",
      notes: "Specifies exact bank-statement / payslip / employer-letter formats. Wrong format = refusal even if you meet the income threshold.",
    },
    {
      code: "Appendix FM",
      name: "Immigration Rules — Family Members",
      description: "The Family-route rule-book. Section R-LTRP covers spouses, R-LTRPT covers parents.",
      downloadUrl: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-fm-family-members",
      filedBy: "applicant",
      stage: "before_applying",
    },
    {
      code: "VAF4A",
      name: "Settlement application — paper form",
      description: "Paper-form alternative for the small set of countries / posts that don't support online. Most applicants use the online wizard instead.",
      downloadUrl: "https://assets.publishing.service.gov.uk/media/5a82be63ed915d74e6232c4d/vaf4a.pdf",
      filedBy: "applicant",
      stage: "with_application",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// CANADA
// ─────────────────────────────────────────────────────────────────────────
const CA_EXPRESS_ENTRY: FormsEntry = {
  destinationIso2: "CA",
  programmeLabel: "Canada — Express Entry (FSW / CEC / FST)",
  programmeSlug: "/destination/ca",
  applicationPortal: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
  applicableTo: {
    purposes: ["work"],
    labelKeywords: ["express entry", "skilled worker", "cec", "fsw"],
  },
  forms: [
    {
      code: "IMM 0008",
      name: "Generic Application Form for Canada",
      description: "Lead form — biographic + family info. Auto-populated from the Express Entry profile when you submit eAPR.",
      downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-0008.html",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "IMM 5669",
      name: "Schedule A — Background / Declaration",
      description: "Full address + employment history for the past 10 years + family details. Most-common reason for IRCC requesting clarification.",
      downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-5669.html",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "IMM 5406",
      name: "Additional Family Information",
      description: "Lists every family member (spouse, parents, siblings, children) with current addresses + occupations. Required even for those not accompanying.",
      downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-5406.html",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "IMM 5645",
      name: "Family Information Form",
      description: "Variant of IMM 5406 — required for some Express Entry sub-streams. Cross-check the document checklist for your stream.",
      downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-5645.html",
      filedBy: "applicant",
      stage: "with_application",
    },
  ],
};

const CA_SPOUSAL: FormsEntry = {
  destinationIso2: "CA",
  programmeLabel: "Canada — Spousal Sponsorship (Outland / Inland)",
  programmeSlug: "/destination/ca",
  applicationPortal: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-spouse.html",
  applicableTo: {
    purposes: ["family"],
    labelKeywords: ["spousal", "spouse", "family sponsorship", "partner"],
  },
  forms: [
    {
      code: "IMM 1344",
      name: "Application to Sponsor, Sponsorship Agreement and Undertaking",
      description: "The Canadian sponsor's binding undertaking — financial support for 3 years post-PR.",
      downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-1344.html",
      filedBy: "sponsor",
      stage: "with_application",
    },
    {
      code: "IMM 5532",
      name: "Relationship Information and Sponsorship Evaluation",
      description: "30-page form — relationship history, cohabitation evidence, contact between partners. The case officer reads this most carefully.",
      downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-5532.html",
      filedBy: "joint",
      stage: "with_application",
      notes: "Common bond among long-distance couples — IRCC wants to see continuous contact (WhatsApp / calls / visit records) throughout the relationship.",
    },
    {
      code: "IMM 5476",
      name: "Use of a Representative",
      description: "Required if a lawyer / consultant / family member is acting on your behalf. Skip if self-filing.",
      downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-5476.html",
      filedBy: "applicant",
      stage: "with_application",
    },
    {
      code: "IMM 5409",
      name: "Statutory Declaration of Common-law Union",
      description: "For common-law (not married) partners — declares 12+ months cohabitation. Notarised.",
      downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-5409.html",
      filedBy: "joint",
      stage: "with_application",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// SCHENGEN
// ─────────────────────────────────────────────────────────────────────────
const SCHENGEN_TYPE_C: FormsEntry = {
  destinationIso2: "DE",
  programmeLabel: "Schengen Area — Short-stay Visa (Type C, 90/180)",
  programmeSlug: "/destination/de",
  applicationPortal: "https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy_en",
  applicableTo: {
    purposes: ["tourism", "business", "family"],
    labelKeywords: ["schengen", "type c", "short-stay", "annex"],
  },
  forms: [
    {
      code: "Schengen application form",
      name: "Harmonised Schengen visa application (Annex I)",
      description: "Single PDF used across all 27 Schengen countries — same form whether applying to FR, DE, ES, IT, NL etc. Each country's embassy publishes the form on its consular site.",
      downloadUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019R1155",
      filedBy: "applicant",
      stage: "with_application",
      notes: "Form is identical EU-wide — the supporting documents (sponsor letter, hotel booking, travel insurance) and consular procedure vary by country.",
    },
    {
      code: "Travel insurance certificate",
      name: "Schengen travel insurance — €30k minimum",
      description: "Must cover medical evacuation + repatriation + €30,000 minimum across the Schengen area. Most major insurers issue a Schengen-compliant certificate as a click-to-print PDF.",
      downloadUrl: "https://ec.europa.eu/home-affairs/what-we-do/policies/borders-and-visas/visa-policy_en",
      filedBy: "applicant",
      stage: "with_application",
    },
  ],
  notes: "Schengen Type C is harmonised — same form, same fee, same 90/180 rule. The CONSULATE to apply at is the one for the country that's the main destination of your trip (most days spent there).",
};

// ─────────────────────────────────────────────────────────────────────────
// NEW ZEALAND
// ─────────────────────────────────────────────────────────────────────────
const NZ_PARTNERSHIP: FormsEntry = {
  destinationIso2: "NZ",
  programmeLabel: "New Zealand — Partnership-based Visa (Work / Resident)",
  programmeSlug: "/destination/nz",
  applicationPortal: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/partner-of-a-new-zealander-resident-visa",
  applicableTo: {
    purposes: ["family"],
    labelKeywords: ["partnership", "partner", "spouse"],
  },
  forms: [
    {
      code: "INZ 1015",
      name: "Family — Partnership Form",
      description: "Combined application form for partners of NZ citizens / residents — covers Partner of a Worker, Partner of a Student, Partner Resident.",
      downloadUrl: "https://www.immigration.govt.nz/documents/forms-and-guides/inz1015.pdf",
      filedBy: "joint",
      stage: "with_application",
    },
    {
      code: "INZ 1146",
      name: "Form for partners supporting partnership-based application",
      description: "NZ partner's evidence form — their address history, support undertaking, relationship evidence.",
      downloadUrl: "https://www.immigration.govt.nz/documents/forms-and-guides/inz1146.pdf",
      filedBy: "sponsor",
      stage: "with_application",
    },
    {
      code: "INZ 1031",
      name: "Visa application form for child of partnership",
      description: "Add-on form for any dependent children of the partner.",
      downloadUrl: "https://www.immigration.govt.nz/documents/forms-and-guides/inz1031.pdf",
      filedBy: "joint",
      stage: "with_application",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// Registry export
// ─────────────────────────────────────────────────────────────────────────
export const VISA_FORMS: FormsEntry[] = [
  AU_PARTNER,
  AU_VISITOR,
  AU_WORK_482,
  US_FAMILY_IMMIGRATION,
  US_K1_FIANCE,
  US_H1B_WORK,
  UK_SKILLED_WORKER,
  UK_SPOUSE_5YR,
  CA_EXPRESS_ENTRY,
  CA_SPOUSAL,
  SCHENGEN_TYPE_C,
  NZ_PARTNERSHIP,
];

/** All distinct destinations that have a forms library. */
export function destinationsWithForms(): string[] {
  return [...new Set(VISA_FORMS.map((d) => d.destinationIso2))].sort();
}

/** Forms for a specific destination. */
export function formsForDestination(iso2: string): FormsEntry[] {
  return VISA_FORMS.filter((d) => d.destinationIso2 === iso2.toUpperCase());
}

/** Forms that match a (destination, purpose, visa-label) tuple — used
 *  by the pair-page surfacing component. Matches on purpose + any keyword. */
export function formsForRoute(
  destinationIso2: string,
  purpose: Purpose,
  visaLabel: string,
): FormsEntry[] {
  const labelLower = visaLabel.toLowerCase();
  return VISA_FORMS.filter(
    (d) =>
      d.destinationIso2 === destinationIso2.toUpperCase() &&
      d.applicableTo.purposes.includes(purpose) &&
      d.applicableTo.labelKeywords.some((kw) => labelLower.includes(kw)),
  );
}
