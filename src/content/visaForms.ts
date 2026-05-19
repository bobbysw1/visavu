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
// AUSTRALIA — extra programmes
// ─────────────────────────────────────────────────────────────────────────
const AU_STUDENT_500: FormsEntry = {
  destinationIso2: "AU",
  programmeLabel: "Australia — Student visa (Subclass 500)",
  programmeSlug: "/destination/au",
  applicationPortal: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
  applicableTo: { purposes: ["study"], labelKeywords: ["student", "subclass 500"] },
  forms: [
    { code: "Form 157A", name: "Application for a student (Temporary) visa (paper)", description: "Paper-form alternative — most apply online via ImmiAccount. Used for stream/country combinations that don't support online.", downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/157a.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "Confirmation of Enrolment (CoE)", name: "CRICOS-registered provider's CoE", description: "Generated by the CRICOS-registered education provider on receipt of tuition deposit. Required BEFORE the visa application can be lodged.", downloadUrl: "https://cricos.education.gov.au/", filedBy: "applicant", stage: "before_applying", notes: "The CoE is the rate-limiting step — provider takes 2-6 weeks to issue after tuition payment received." },
    { code: "Form 1257", name: "Undertaking declaration (Genuine Student)", description: "GS requirement replaces the former GTE — written undertaking to comply with visa conditions including study + departure on completion.", downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/1257.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "Form 956", name: "Appointment of a registered migration agent / legal practitioner / exempt person", description: "Only required if a registered agent is acting on your behalf.", downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/956.pdf", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "Subclass 500 covers every education sector (primary / secondary / VET / higher ed / postgrad / ELICOS). Permits 48 hours/fortnight work during study, unrestricted during breaks. OSHC health cover mandatory.",
};

const AU_SKILLED_189: FormsEntry = {
  destinationIso2: "AU",
  programmeLabel: "Australia — Skilled Independent visa (Subclass 189)",
  programmeSlug: "/destination/au",
  applicationPortal: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
  applicableTo: { purposes: ["work"], labelKeywords: ["subclass 189", "skilled independent", "points-tested"] },
  forms: [
    { code: "SkillSelect EOI", name: "Expression of Interest (online, no PDF)", description: "Prerequisite — must be invited via SkillSelect before applying. Points-tested at 65+ minimum; invitation rounds run monthly.", downloadUrl: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect", filedBy: "applicant", stage: "before_applying", notes: "Occupation must be on the Skilled Occupation List (MLTSSL or STSOL). Points: age (max 30), English (max 20), skilled employment (max 20), education (max 20), Australian study (max 5)." },
    { code: "Form 80", name: "Personal particulars for character assessment", description: "10-year address / employment / travel history. Standard for all skilled-migration applicants.", downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/80.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "Form 1221", name: "Additional personal particulars", description: "Asked for some nationalities + when the case officer requires extended background context.", downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/1221.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "Skills assessment", name: "Authority-issued positive skills assessment", description: "Issued by the assessing authority for your nominated occupation (ACS for IT, EA for engineering, VETASSESS for managers + analysts, CPA Australia for accounting, etc.). Required BEFORE EOI submission.", downloadUrl: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list", filedBy: "applicant", stage: "before_applying" },
  ],
  notes: "189 is the most desirable skilled visa — no employer sponsor needed, immediate PR. Invitation-only via SkillSelect; current minimum score in most occupations is well above the 65 baseline (often 85+ for IT, 75+ for engineering).",
};

const AU_WHV_417: FormsEntry = {
  destinationIso2: "AU",
  programmeLabel: "Australia — Working Holiday visa (Subclass 417 / 462)",
  programmeSlug: "/destination/au",
  applicationPortal: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417",
  applicableTo: { purposes: ["work", "tourism"], labelKeywords: ["working holiday", "subclass 417", "subclass 462", "whv"] },
  forms: [
    { code: "Online application", name: "Working Holiday visa application (ImmiAccount)", description: "Fully online — no PDF. UK applicants get 3 years cumulatively (no 88-day regional-work requirement). Most other nationalities get 1 year + 2 extensions for regional work.", downloadUrl: "https://online.immi.gov.au/lusc/login", filedBy: "applicant", stage: "with_application" },
    { code: "Form 1209", name: "Confirmation of specified subclass 417 work (regional)", description: "For year-2 / year-3 extension — proves the 88 days (1st extension) / 6 months (2nd extension) of specified regional work. Not needed by UK applicants under the FTA exemption.", downloadUrl: "https://immi.homeaffairs.gov.au/form-listing/forms/1209.pdf", filedBy: "employer", stage: "after_decision", notes: "Employer signs to confirm dates + role. Only specified industries count (agriculture, fishing, forestry, mining, construction, bushfire recovery)." },
  ],
  notes: "WHV is the fastest live-and-work-in-Australia pathway. Subclass 417 covers UK / EU / KR / TW / JP / HK; Subclass 462 is the work-and-holiday variant for US / CN / IN / TH / etc with stricter education + English requirements.",
};

// ─────────────────────────────────────────────────────────────────────────
// UNITED STATES — extra programmes
// ─────────────────────────────────────────────────────────────────────────
const US_F1_STUDENT: FormsEntry = {
  destinationIso2: "US",
  programmeLabel: "United States — F-1 Student visa",
  programmeSlug: "/destination/us",
  applicationPortal: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
  applicableTo: { purposes: ["study"], labelKeywords: ["f-1", "student visa", "f1"] },
  forms: [
    { code: "Form I-20", name: "Certificate of Eligibility for Nonimmigrant Student Status", description: "Issued by the SEVP-certified school once you've been admitted + paid the SEVIS fee. Required to apply for the F-1 visa.", downloadUrl: "https://studyinthestates.dhs.gov/students/get-started/your-i-20", filedBy: "applicant", stage: "before_applying", notes: "Wet-signed by both the school's DSO and the student. Multiple I-20s if attending different schools." },
    { code: "Form I-901 (SEVIS Fee)", name: "SEVIS I-901 Fee Payment", description: "$350 fee paid online at fmjfee.com BEFORE the consular interview. Receipt printed + brought to the visa appointment.", downloadUrl: "https://www.fmjfee.com/", filedBy: "applicant", stage: "before_applying" },
    { code: "DS-160", name: "Online Nonimmigrant Visa Application", description: "Submit at ceac.state.gov/genniv. Save the confirmation barcode + bring to the interview.", downloadUrl: "https://ceac.state.gov/genniv/", filedBy: "applicant", stage: "with_application" },
    { code: "Form I-94", name: "Arrival/Departure Record (auto on entry)", description: "Generated automatically at CBP entry. Print from i94.cbp.dhs.gov post-arrival; required for SSN application + on-campus work.", downloadUrl: "https://i94.cbp.dhs.gov/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "F-1 is the workhorse US study visa. Issued for 'duration of status' (DS) — covers the entire program length + 60-day grace period. On-campus 20 hrs/week permitted; OPT (Optional Practical Training) after graduation: 12 months + 24 STEM extension.",
};

const US_B1B2_VISITOR: FormsEntry = {
  destinationIso2: "US",
  programmeLabel: "United States — B-1 / B-2 Visitor visa",
  programmeSlug: "/destination/us",
  applicationPortal: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html",
  applicableTo: { purposes: ["tourism", "business"], labelKeywords: ["b-1", "b-2", "b1/b2", "visitor"] },
  forms: [
    { code: "DS-160", name: "Online Nonimmigrant Visa Application", description: "Fully online. The 'visa application' itself — no PDF. Submit at ceac.state.gov/genniv, print the barcoded confirmation page for the interview.", downloadUrl: "https://ceac.state.gov/genniv/", filedBy: "applicant", stage: "with_application", notes: "Single most-completed US visa form globally. Save your application ID to retrieve a partial draft later." },
    { code: "Form DS-156", name: "Nonimmigrant Visa Application (paper, legacy)", description: "Largely retired — kept here for the small set of consulates that still accept paper applications for B1/B2 in addition to DS-160.", downloadUrl: "https://travel.state.gov/content/dam/visas/DS_156.pdf", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "B-1 covers business meetings + conferences; B-2 covers tourism + family visits + medical treatment. Almost always issued as a combined B-1/B-2. Validity + entries per applicant nationality follows the State Dept reciprocity schedule.",
};

const US_L1_INTRACOMPANY: FormsEntry = {
  destinationIso2: "US",
  programmeLabel: "United States — L-1 Intracompany Transferee (L-1A / L-1B)",
  programmeSlug: "/destination/us",
  applicationPortal: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/l-1a-intracompany-transferee-executive-or-manager",
  applicableTo: { purposes: ["work"], labelKeywords: ["l-1", "l-1a", "l-1b", "intracompany"] },
  forms: [
    { code: "Form I-129", name: "Petition for a Nonimmigrant Worker", description: "Filed by the US employer (parent / subsidiary / affiliate of the foreign company). Same form used for H-1B; L-1 supplement attached.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-129.pdf", filedBy: "employer", stage: "before_applying" },
    { code: "L Classification Supplement (I-129L)", name: "L Supplement to Form I-129", description: "Specifies the L-1A (executive/manager) vs L-1B (specialised-knowledge) classification, qualifying employment abroad (1+ continuous year in past 3 years), and US role.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-129.pdf", filedBy: "employer", stage: "with_application", notes: "L-1A maximum stay is 7 years; L-1B is 5 years. L-1A is the EB-1C green-card precursor for executives." },
    { code: "Form I-907", name: "Request for Premium Processing", description: "Optional $2,805 add-on — 15-business-day USCIS adjudication guarantee.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-907.pdf", filedBy: "employer", stage: "with_application" },
    { code: "DS-160", name: "Online Nonimmigrant Visa Application", description: "Worker files at the consular stage post-I-129 approval.", downloadUrl: "https://ceac.state.gov/genniv/", filedBy: "applicant", stage: "with_application" },
  ],
};

const US_EB5_INVESTOR: FormsEntry = {
  destinationIso2: "US",
  programmeLabel: "United States — EB-5 Investor (Immigrant Investor Program)",
  programmeSlug: "/destination/us",
  applicationPortal: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program",
  applicableTo: { purposes: ["work"], labelKeywords: ["eb-5", "investor", "immigrant investor"] },
  forms: [
    { code: "Form I-526E", name: "Immigrant Petition by Regional Center Investor", description: "Filed by the foreign investor — proves the $800k (TEA/rural) or $1.05M (standard) investment is at risk + creating 10+ jobs.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-526e.pdf", filedBy: "applicant", stage: "before_applying", notes: "Reform & Integrity Act 2022 raised minimums + introduced reserved visas (20% rural, 10% TEA, 2% infrastructure)." },
    { code: "Form I-485", name: "Application to Register Permanent Residence (Adjustment of Status)", description: "Filed concurrently with I-526E if the investor is already in the US on another status. Otherwise consular processing via DS-260.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-485.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "Form I-829", name: "Petition to Remove Conditions on Permanent Resident Status", description: "Filed in months 21-24 of the conditional 2-year green card. Proves the investment remained at risk + the 10 jobs were created.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-829.pdf", filedBy: "applicant", stage: "after_decision" },
  ],
};

const US_I485_AOS: FormsEntry = {
  destinationIso2: "US",
  programmeLabel: "United States — Adjustment of Status to Permanent Resident (I-485)",
  programmeSlug: "/destination/us",
  applicationPortal: "https://www.uscis.gov/i-485",
  applicableTo: { purposes: ["family", "work"], labelKeywords: ["i-485", "adjustment of status", "green card", "permanent resident"] },
  forms: [
    { code: "Form I-485", name: "Application to Register Permanent Residence", description: "The headline AOS form — filed in the US to convert from temporary status (H-1B, K-1 post-marriage, L-1, F-1+OPT, etc.) to LPR.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-485.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "Form I-693", name: "Report of Medical Examination and Vaccination Record", description: "Sealed envelope from a USCIS-designated civil surgeon. Required for almost every AOS case.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-693.pdf", filedBy: "applicant", stage: "with_application", notes: "Valid for 2 years from civil surgeon's signature. Bundling with I-485 filing avoids RFE." },
    { code: "Form I-864", name: "Affidavit of Support", description: "Sponsor's binding financial undertaking — household-income proof, tax returns last 3 years. Required for family-based AOS.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-864.pdf", filedBy: "sponsor", stage: "with_application" },
    { code: "Form I-765", name: "Application for Employment Authorization (EAD)", description: "Optional concurrent filing — gets the applicant a work permit while the AOS pends. Typically issued in 3-6 months.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-765.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "Form I-131", name: "Application for Travel Document (Advance Parole)", description: "Optional concurrent filing — allows the applicant to travel internationally during the AOS pendency without abandoning the application.", downloadUrl: "https://www.uscis.gov/sites/default/files/document/forms/i-131.pdf", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "I-485 + I-693 + I-864 + I-765 + I-131 is the 'concurrent filing' bundle — typical for marriage-based AOS. Filing all together speeds the case + gets work + travel authorisation during the wait.",
};

// ─────────────────────────────────────────────────────────────────────────
// UK — extra programmes
// ─────────────────────────────────────────────────────────────────────────
const UK_STUDENT: FormsEntry = {
  destinationIso2: "GB",
  programmeLabel: "United Kingdom — Student visa (formerly Tier 4)",
  programmeSlug: "/destination/gb",
  applicationPortal: "https://www.gov.uk/student-visa",
  applicableTo: { purposes: ["study"], labelKeywords: ["student visa", "tier 4"] },
  forms: [
    { code: "Online application", name: "Student visa application (gov.uk)", description: "Fully-online wizard at gov.uk. Pay, book biometrics at a VFS centre.", downloadUrl: "https://www.gov.uk/student-visa/apply", filedBy: "applicant", stage: "with_application" },
    { code: "CAS (Confirmation of Acceptance for Studies)", name: "CAS reference number from sponsor", description: "Issued by the UK Higher Education Provider after acceptance + tuition deposit. The CAS number is entered into the online application; no separate PDF.", downloadUrl: "https://www.gov.uk/government/publications/student-route-sponsor-guidance-document-2", filedBy: "applicant", stage: "before_applying", notes: "CAS is unique to each applicant + valid 6 months. Without it, the visa application cannot be submitted." },
    { code: "Appendix Student", name: "Immigration Rules — Appendix Student", description: "The Home Office rule-book the caseworker adjudicates against. Specifies financial requirements, evidence formats, dependant rules.", downloadUrl: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-student", filedBy: "applicant", stage: "before_applying" },
  ],
  notes: "Student visa allows work up to 20 hrs/week during term, full-time during breaks. Graduate visa (separate application post-graduation) gives 2 years (3 for PhD) open work without sponsor.",
};

const UK_GRADUATE: FormsEntry = {
  destinationIso2: "GB",
  programmeLabel: "United Kingdom — Graduate visa (post-study work)",
  programmeSlug: "/destination/gb",
  applicationPortal: "https://www.gov.uk/graduate-visa",
  applicableTo: { purposes: ["work"], labelKeywords: ["graduate visa", "post-study"] },
  forms: [
    { code: "Online application", name: "Graduate visa application (gov.uk)", description: "Online wizard — apply from inside the UK on the existing Student visa. £880 fee + £776/year IHS.", downloadUrl: "https://www.gov.uk/graduate-visa/apply", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "2-year open work permit (3 years for PhD). NO sponsor needed, work for any employer, change jobs freely. Cannot be extended — must switch to Skilled Worker before expiry to stay long-term. Time on Graduate visa does NOT count towards ILR.",
};

const UK_INNOVATOR_FOUNDER: FormsEntry = {
  destinationIso2: "GB",
  programmeLabel: "United Kingdom — Innovator Founder visa",
  programmeSlug: "/destination/gb",
  applicationPortal: "https://www.gov.uk/innovator-founder-visa",
  applicableTo: { purposes: ["work"], labelKeywords: ["innovator", "founder", "startup"] },
  forms: [
    { code: "Endorsement letter", name: "Endorsement from an approved Endorsing Body", description: "Issued by an approved Endorsing Body (Innovator Founder list on gov.uk) after assessing the business idea as innovative + viable + scalable. PREREQUISITE for the visa application.", downloadUrl: "https://www.gov.uk/government/publications/endorsing-bodies-innovator-founder-and-scaleup", filedBy: "applicant", stage: "before_applying", notes: "The £50k personal investment requirement was REMOVED in April 2023. Endorsement now hinges on the idea, not capital." },
    { code: "Online application", name: "Innovator Founder visa application (gov.uk)", description: "Online wizard at gov.uk. Pay £1,191 (outside UK) / £1,486 (inside UK extension) + £1,035/year IHS.", downloadUrl: "https://www.gov.uk/innovator-founder-visa/apply-outside-uk", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "Replaces the older Start-up + Innovator visas (closed Apr 2023). 3-year visa, path to ILR after 3 years (vs 5 for Skilled Worker). Spouse + children eligible as dependants.",
};

const UK_GLOBAL_TALENT: FormsEntry = {
  destinationIso2: "GB",
  programmeLabel: "United Kingdom — Global Talent visa",
  programmeSlug: "/destination/gb",
  applicationPortal: "https://www.gov.uk/global-talent",
  applicableTo: { purposes: ["work"], labelKeywords: ["global talent"] },
  forms: [
    { code: "Endorsement application", name: "Endorsement application via an approved body", description: "Apply to one of the endorsing bodies based on field: Royal Society / Royal Academy of Engineering / British Academy / UKRI for academia + research; Department for Science, Innovation & Technology (DSIT) for digital tech (replaced Tech Nation 2024); Arts Council England for arts + culture.", downloadUrl: "https://www.gov.uk/global-talent/endorsing-bodies", filedBy: "applicant", stage: "before_applying", notes: "Endorsement fee £561, takes ~8 weeks. Direct route available without endorsement for holders of Prestigious Prizes (Nobel, Turing, Fields, Oscar, Grammy, Booker)." },
    { code: "Online application", name: "Global Talent visa application (gov.uk)", description: "Online wizard. £716 (outside UK) + £1,035/year IHS.", downloadUrl: "https://www.gov.uk/global-talent/apply-uk", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "Faster route to settlement (ILR after 3 years for Exceptional Talent endorsement; 5 years for Exceptional Promise). No salary threshold, no sponsor needed, can switch employers / freelance freely. Top route for tech founders + senior researchers.",
};

// ─────────────────────────────────────────────────────────────────────────
// CANADA — extra programmes
// ─────────────────────────────────────────────────────────────────────────
const CA_VISITOR: FormsEntry = {
  destinationIso2: "CA",
  programmeLabel: "Canada — Visitor visa (Temporary Resident Visa, TRV)",
  programmeSlug: "/destination/ca",
  applicationPortal: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/apply-visitor-visa.html",
  applicableTo: { purposes: ["tourism", "business", "family"], labelKeywords: ["visitor", "trv", "tourist"] },
  forms: [
    { code: "IMM 5257", name: "Application for Temporary Resident Visa", description: "Standalone TRV application form for visa-required nationals. Online via IRCC portal preferred; paper form for in-person submission.", downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-5257.html", filedBy: "applicant", stage: "with_application" },
    { code: "IMM 5645", name: "Family Information Form", description: "Lists every family member (spouse, parents, siblings, children) with addresses + occupations.", downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-5645.html", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "TRV is for visa-required nationalities. Visa-exempt + eTA-eligible countries (UK, EU, AU, US, JP, KR, etc.) use the eTA instead — see eta.cic.gc.ca.",
};

const CA_STUDY_PERMIT: FormsEntry = {
  destinationIso2: "CA",
  programmeLabel: "Canada — Study Permit",
  programmeSlug: "/destination/ca",
  applicationPortal: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
  applicableTo: { purposes: ["study"], labelKeywords: ["study permit", "student"] },
  forms: [
    { code: "Letter of Acceptance (LOA)", name: "From a Designated Learning Institution (DLI)", description: "Issued by the DLI on acceptance. The DLI number is required for the study-permit application — verify your school is on the DLI list at ircc.canada.ca.", downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html", filedBy: "applicant", stage: "before_applying" },
    { code: "Provincial Attestation Letter (PAL)", name: "From the province/territory of study", description: "Required since January 2024 for most undergraduate + college applications. Provinces have annual caps; PAL is the proof you're within quota.", downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/provincial-attestation-letter.html", filedBy: "applicant", stage: "before_applying", notes: "PhD + Master's by research applicants exempt. Cap allocation between provinces shifts annually." },
    { code: "IMM 1294", name: "Application for Study Permit", description: "Main form — biographic + study + funding + family details. Online via IRCC portal preferred.", downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-1294.html", filedBy: "applicant", stage: "with_application" },
    { code: "IMM 5483", name: "Document checklist — Study Permit", description: "IRCC's official checklist for study-permit applications. Print + tick off before submitting.", downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-5483.html", filedBy: "applicant", stage: "before_applying" },
  ],
  notes: "Doubled financial requirement effective Jan 2024 — $20,635 (was $10,000) for the first year. PGWP (Post-Graduation Work Permit) eligibility changed Nov 2024 — only graduates of programmes linked to in-demand occupations qualify automatically.",
};

const CA_WORK_PERMIT: FormsEntry = {
  destinationIso2: "CA",
  programmeLabel: "Canada — Work Permit (Open + Employer-Specific)",
  programmeSlug: "/destination/ca",
  applicationPortal: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit.html",
  applicableTo: { purposes: ["work"], labelKeywords: ["work permit", "open work permit", "lmia", "owp"] },
  forms: [
    { code: "IMM 1295", name: "Application for Work Permit", description: "Main work-permit form — covers both employer-specific (LMIA-based or LMIA-exempt) and open work permits.", downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-1295.html", filedBy: "applicant", stage: "with_application" },
    { code: "LMIA", name: "Labour Market Impact Assessment (employer-issued)", description: "Filed by the Canadian employer with Employment and Social Development Canada (ESDC). Required before the worker can apply unless LMIA-exempt (intra-company transferee, IEC, CUSMA professional, spousal OWP).", downloadUrl: "https://www.canada.ca/en/employment-social-development/services/foreign-workers.html", filedBy: "employer", stage: "before_applying", notes: "Standard LMIA fee CAD $1,000. Processing 4-8 weeks typical. High-Wage stream + Global Talent stream offer faster processing." },
    { code: "IMM 5645", name: "Family Information Form", description: "Required for all work-permit applications including OWP.", downloadUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/imm-5645.html", filedBy: "applicant", stage: "with_application" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// GERMANY
// ─────────────────────────────────────────────────────────────────────────
const DE_CHANCENKARTE: FormsEntry = {
  destinationIso2: "DE",
  programmeLabel: "Germany — Chancenkarte (Opportunity Card — points-based job-seeker visa)",
  programmeSlug: "/destination/de",
  applicationPortal: "https://www.make-it-in-germany.com/en/visa-residence/opportunity-card",
  applicableTo: { purposes: ["work"], labelKeywords: ["chancenkarte", "opportunity card", "job seeker"] },
  forms: [
    { code: "Antrag auf Erteilung eines Aufenthaltstitels", name: "Application for issue of a residence title (national visa)", description: "Filed at the German embassy / consulate in your country of residence. Specific consulate's form preferred; the federal template is the fallback.", downloadUrl: "https://www.auswaertiges-amt.de/blob/207816/c8f1fbaef7ea99dd29e9da93b7f30bfd/visumantragnationald-data.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "Points calculator", name: "Chancenkarte points self-assessment", description: "Online tool — calculate whether you meet the 6+ points minimum. Points awarded for: qualification recognition, occupation in shortage list, work experience, German A1+, English B2+, age (under 35).", downloadUrl: "https://www.make-it-in-germany.com/en/visa-residence/opportunity-card/the-chancenkarte-points-system", filedBy: "applicant", stage: "before_applying" },
  ],
  notes: "Chancenkarte launched June 2024. 1-year job-seeker visa with permission to take up to 20 hrs/week of trial employment. After finding a qualifying job, convert in-country to a regular work residence permit. Open to non-EU nationals with recognised qualifications + 6+ points.",
};

const DE_BLUE_CARD: FormsEntry = {
  destinationIso2: "DE",
  programmeLabel: "Germany — EU Blue Card",
  programmeSlug: "/destination/de",
  applicationPortal: "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card",
  applicableTo: { purposes: ["work"], labelKeywords: ["blue card", "blaue karte"] },
  forms: [
    { code: "Antrag (national visa)", name: "Application for national visa (Beschäftigung)", description: "Filed at German embassy abroad — same federal form as Chancenkarte but with employment-contract evidence attached.", downloadUrl: "https://www.auswaertiges-amt.de/blob/207816/c8f1fbaef7ea99dd29e9da93b7f30bfd/visumantragnationald-data.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "Erklärung zum Beschäftigungsverhältnis", name: "Declaration of employment relationship", description: "Filled by the German employer — confirms job title, salary, duration. Required for ALL employment-based national visas + residence permits.", downloadUrl: "https://www.arbeitsagentur.de/datei/erklaerung-zum-beschaeftigungsverhaeltnis_ba013434.pdf", filedBy: "employer", stage: "with_application" },
  ],
  notes: "Blue Card salary threshold: €48,300 (2024, general); €43,759.80 (shortage occupations — IT, science, medicine, engineering, mathematics). Permanent residence (Niederlassungserlaubnis) after 33 months (or 21 months with B1 German).",
};

// ─────────────────────────────────────────────────────────────────────────
// FRANCE
// ─────────────────────────────────────────────────────────────────────────
const FR_TALENT: FormsEntry = {
  destinationIso2: "FR",
  programmeLabel: "France — Talent Passport (Passeport Talent — Salarié Qualifié / Chercheur / etc.)",
  programmeSlug: "/destination/fr",
  applicationPortal: "https://france-visas.gouv.fr/en/web/france-visas/long-stay-visa",
  applicableTo: { purposes: ["work"], labelKeywords: ["talent passport", "passeport talent", "vls-ts"] },
  forms: [
    { code: "Long-stay visa application (online)", name: "France-Visas online wizard", description: "Single online application at france-visas.gouv.fr — covers all VLS-TS subtypes (Salarié, Salarié Qualifié, Chercheur, Profession Libérale, Visiteur, Conjoint).", downloadUrl: "https://france-visas.gouv.fr/en/web/france-visas/", filedBy: "applicant", stage: "with_application" },
    { code: "OFII validation", name: "Office français de l'immigration et de l'intégration validation", description: "Online validation of the VLS-TS within 3 months of arrival in France. Replaces the old physical OFII stamp; €200 timbre fee.", downloadUrl: "https://administration-etrangers-en-france.interieur.gouv.fr/particuliers/", filedBy: "applicant", stage: "after_decision", notes: "Without OFII validation the visa loses validity at month 4 — common mistake." },
  ],
  notes: "Passeport Talent variants: Salarié Qualifié (Master's + €43,243+ salary); Chercheur (research convention); Profession Artistique (€18,500+); Investisseur (€300k+ + 10 jobs). 4-year multi-year residence permit on first issue.",
};

// ─────────────────────────────────────────────────────────────────────────
// SPAIN — Digital Nomad + Non-Lucrative
// ─────────────────────────────────────────────────────────────────────────
const ES_DIGITAL_NOMAD: FormsEntry = {
  destinationIso2: "ES",
  programmeLabel: "Spain — Digital Nomad visa (Teletrabajo Internacional)",
  programmeSlug: "/destination/es",
  applicationPortal: "https://www.exteriores.gob.es/Consulados/",
  applicableTo: { purposes: ["work"], labelKeywords: ["digital nomad", "teletrabajo", "remote worker"] },
  forms: [
    { code: "EX-25", name: "Solicitud de autorización de residencia para teletrabajo internacional", description: "Application form for the Digital Nomad residence authorisation. Submit via the UGE-CE national portal — most processing happens electronically.", downloadUrl: "https://extranjeros.inclusion.gob.es/ficheros/Modelos_solicitudes/mod_solicitudes2/25-Telerabajo.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "TIE application", name: "Tarjeta de Identidad de Extranjero", description: "Spanish residence card — obtain at a Spanish police-station Foreigner's Office within 30 days of arrival.", downloadUrl: "https://sede.policia.gob.es/portalCiudadano/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "DNV launched Jan 2023 under the Startup Law. Income requirement €2,520/month (3× SMI). Tax advantage: opt into the Beckham Law non-resident regime — flat 24% on first €600k of Spanish income for up to 5 years.",
};

const ES_NLV: FormsEntry = {
  destinationIso2: "ES",
  programmeLabel: "Spain — Non-Lucrative visa (NLV / Visado de Residencia No Lucrativa)",
  programmeSlug: "/destination/es",
  applicationPortal: "https://www.exteriores.gob.es/Consulados/",
  applicableTo: { purposes: ["family"], labelKeywords: ["non-lucrative", "nlv", "residencia no lucrativa"] },
  forms: [
    { code: "EX-01", name: "Solicitud de visado nacional de residencia no lucrativa", description: "Application form filed at the Spanish consulate in your country of residence. Wet-signed paper submission required.", downloadUrl: "https://extranjeros.inclusion.gob.es/ficheros/Modelos_solicitudes/mod_solicitudes2/01-Modelo_solicitud_visado_nacional.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "Modelo 790 código 052", name: "Visa application fee receipt", description: "Tax form for the consular fee payment (€80 + reciprocity for some nationalities — US applicants pay $140 reciprocity surcharge).", downloadUrl: "https://www.exteriores.gob.es/Consulados/", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "NLV requires €28,800/year passive income (400% IPREM) + €7,200/year per dependant. Cannot work. Renewable 2y then 2y, full PR after 5 years. Health insurance from a Spanish-licensed insurer mandatory.",
};

// ─────────────────────────────────────────────────────────────────────────
// PORTUGAL — D7 + D8 + Job Seeker
// ─────────────────────────────────────────────────────────────────────────
const PT_D7: FormsEntry = {
  destinationIso2: "PT",
  programmeLabel: "Portugal — D7 (Passive Income / Retirement) visa",
  programmeSlug: "/destination/pt",
  applicationPortal: "https://www.portaldascomunidades.mne.gov.pt/",
  applicableTo: { purposes: ["family"], labelKeywords: ["d7", "passive income", "retirement"] },
  forms: [
    { code: "Visa application form", name: "Portuguese National Visa Application (long-stay)", description: "Filed at the Portuguese consulate in your country of residence. Specific consulate's form preferred.", downloadUrl: "https://www.portaldascomunidades.mne.gov.pt/images/GADG/SitiosUteis_PDF/Form_VistoNacional_PT_EN.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "AIMA residence application", name: "Autorização de Residência at AIMA", description: "Filed at AIMA (formerly SEF) within the visa's 4-month validity. €170 residence permit issuance fee.", downloadUrl: "https://www.aima.gov.pt/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "D7 income threshold: €870/month (Portuguese minimum wage) + 50% per adult dependant + 30% per child. Permanent residence after 5 years. Citizenship after 5 years total residence + A2 Portuguese. NHR tax regime closed to new entrants 2024.",
};

const PT_D8_NOMAD: FormsEntry = {
  destinationIso2: "PT",
  programmeLabel: "Portugal — D8 Digital Nomad visa",
  programmeSlug: "/destination/pt",
  applicationPortal: "https://www.portaldascomunidades.mne.gov.pt/",
  applicableTo: { purposes: ["work"], labelKeywords: ["d8", "digital nomad", "remote worker"] },
  forms: [
    { code: "Visa application form", name: "D8 long-stay visa application", description: "Same Portuguese National Visa form as D7, marked for D8 category. Submit at consulate with proof of remote employment + income.", downloadUrl: "https://www.portaldascomunidades.mne.gov.pt/images/GADG/SitiosUteis_PDF/Form_VistoNacional_PT_EN.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "AIMA residence application", name: "Autorização de Residência at AIMA", description: "Filed at AIMA within visa validity to convert D8 entry visa to 2-year residence permit.", downloadUrl: "https://www.aima.gov.pt/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "D8 income threshold: €3,480/month (4× Portuguese minimum wage). Two variants: temporary 1-year + permanent 2-year. Same 5-year route to PR + citizenship as D7.",
};

// ─────────────────────────────────────────────────────────────────────────
// NETHERLANDS
// ─────────────────────────────────────────────────────────────────────────
const NL_HSM: FormsEntry = {
  destinationIso2: "NL",
  programmeLabel: "Netherlands — Highly Skilled Migrant (Kennismigrant)",
  programmeSlug: "/destination/nl",
  applicationPortal: "https://ind.nl/en/residence-permits/work/highly-skilled-migrant",
  applicableTo: { purposes: ["work"], labelKeywords: ["highly skilled migrant", "kennismigrant", "hsm"] },
  forms: [
    { code: "TEV application", name: "Toegang en Verblijf (Entry & Residence) combined application", description: "Filed by the recognised sponsor (the Dutch employer) at IND on behalf of the worker. Combined MVV + residence permit.", downloadUrl: "https://ind.nl/en/forms/7517.pdf", filedBy: "employer", stage: "with_application" },
    { code: "Recognised sponsor employer", name: "Employer must be on IND's recognised-sponsor register", description: "Verify the Dutch employer on the IND recognised sponsors list BEFORE accepting the job offer — if they're not registered, the HSM route isn't available.", downloadUrl: "https://ind.nl/en/public-register-recognised-sponsors", filedBy: "employer", stage: "before_applying" },
  ],
  notes: "HSM salary thresholds (2024): €5,331/month (30+); €3,909/month (under 30); €2,801/month (recent grad). Renewable 5y; PR after 5 years. 30% ruling tax advantage available for first 5 years.",
};

const NL_DAFT: FormsEntry = {
  destinationIso2: "NL",
  programmeLabel: "Netherlands — DAFT (Dutch-American Friendship Treaty)",
  programmeSlug: "/destination/nl",
  applicationPortal: "https://ind.nl/en/residence-permits/work/self-employed-person",
  applicableTo: { purposes: ["work"], labelKeywords: ["daft", "dutch-american friendship treaty", "self-employed"] },
  forms: [
    { code: "Verblijfsvergunning regulier — onderzoeker / arbeid als zelfstandige", name: "Residence permit application — self-employed", description: "Filed at IND for US nationals invoking the DAFT bilateral treaty. €1,500-€2,000 fee.", downloadUrl: "https://ind.nl/en/forms/7517.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "KvK registration", name: "Dutch Chamber of Commerce business registration", description: "Required BEFORE the IND application — register your Dutch business + obtain BTW (VAT) number. €80 KvK fee.", downloadUrl: "https://www.kvk.nl/english/", filedBy: "applicant", stage: "before_applying" },
  ],
  notes: "DAFT is US-exclusive — €4,500 minimum investment (vs €100k+ for the regular self-employed route). 2-year permit, renewable indefinitely. Path to PR after 5 years. Unique among EU self-employed visas for its low threshold.",
};

// ─────────────────────────────────────────────────────────────────────────
// JAPAN — Work, COE, Student
// ─────────────────────────────────────────────────────────────────────────
const JP_COE_WORK: FormsEntry = {
  destinationIso2: "JP",
  programmeLabel: "Japan — Certificate of Eligibility + Work Visa (Engineer / Specialist in Humanities)",
  programmeSlug: "/destination/jp",
  applicationPortal: "https://www.moj.go.jp/isa/applications/procedures/16-2.html",
  applicableTo: { purposes: ["work"], labelKeywords: ["engineer", "specialist", "humanities", "coe"] },
  forms: [
    { code: "COE application", name: "Application for Certificate of Eligibility", description: "Filed by the Japanese employer or sponsor at the regional Immigration Bureau. COE itself is free; the slow step (1-3 months).", downloadUrl: "https://www.moj.go.jp/isa/applications/procedures/16-2.html", filedBy: "employer", stage: "before_applying" },
    { code: "Visa application form", name: "Visa application at Japanese embassy/consulate", description: "Filed at the Japanese embassy in your country of residence ONCE the COE has been issued. ¥6,000 multi-entry visa stamp fee.", downloadUrl: "https://www.mofa.go.jp/files/000124525.pdf", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "Engineer / Specialist visa covers most skilled-worker categories — IT engineers, designers, translators, business consultants. 1, 3, or 5-year stays. Family visa (Dependent) available for spouse + children. Permanent Residence after 10 years (1 for HSP).",
};

const JP_STUDENT: FormsEntry = {
  destinationIso2: "JP",
  programmeLabel: "Japan — Student Visa (留学 Ryūgaku)",
  programmeSlug: "/destination/jp",
  applicationPortal: "https://www.moj.go.jp/isa/applications/procedures/16-7.html",
  applicableTo: { purposes: ["study"], labelKeywords: ["student visa", "ryūgaku", "ryugaku"] },
  forms: [
    { code: "COE application", name: "Application for Certificate of Eligibility (Student)", description: "Filed by the Japanese institution on the student's behalf. The school handles the COE filing; student provides supporting documents.", downloadUrl: "https://www.moj.go.jp/isa/applications/procedures/16-7.html", filedBy: "employer", stage: "before_applying" },
    { code: "Visa application form", name: "Student visa at Japanese embassy/consulate", description: "Filed at the Japanese embassy abroad once COE is issued.", downloadUrl: "https://www.mofa.go.jp/files/000124525.pdf", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "Permits 28 hours/week of part-time work with shikaku-gai application. Post-graduation: Designated Activities visa (1 year) to find graduate work.",
};

// ─────────────────────────────────────────────────────────────────────────
// SOUTH KOREA — D-2, E-7, F-5
// ─────────────────────────────────────────────────────────────────────────
const KR_D2_STUDENT: FormsEntry = {
  destinationIso2: "KR",
  programmeLabel: "South Korea — D-2 Student Visa",
  programmeSlug: "/destination/kr",
  applicationPortal: "https://www.studyinkorea.go.kr/en/",
  applicableTo: { purposes: ["study"], labelKeywords: ["d-2", "student visa", "d2"] },
  forms: [
    { code: "Standard Admission Letter", name: "Issued by the Korean university", description: "Standard Admission Letter (SAL) + Certificate of Tuition Payment from the Ministry-of-Education-recognised institution.", downloadUrl: "https://www.studyinkorea.go.kr/en/", filedBy: "applicant", stage: "before_applying" },
    { code: "Visa application form", name: "Korean visa application", description: "Filed at the Korean embassy in your country of residence with SAL + financial proof.", downloadUrl: "https://overseas.mofa.go.kr/eng/wpge/m_5675/contents.do", filedBy: "applicant", stage: "with_application" },
    { code: "ARC application", name: "Alien Registration Card at Immigration Office", description: "Apply within 90 days of arrival at the local Hi Korea immigration office. ARC is essential for banking + phone + healthcare.", downloadUrl: "https://www.hikorea.go.kr/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Financial proof: ≥ US$10,000 in bank account OR scholarship award letter. Can work 25 hrs/week off-campus with university authorisation. Convert post-graduation to D-10 Job Seeker visa (6-month renewable) or D-8 / E-7.",
};

const KR_E7: FormsEntry = {
  destinationIso2: "KR",
  programmeLabel: "South Korea — E-7 Specialty Occupation Visa",
  programmeSlug: "/destination/kr",
  applicationPortal: "https://www.hikorea.go.kr/",
  applicableTo: { purposes: ["work"], labelKeywords: ["e-7", "specialty occupation", "e7"] },
  forms: [
    { code: "사증발급인정서 (Certificate of Eligibility)", name: "COE application via Hi Korea", description: "Filed by the Korean employer at the local Hi Korea immigration office. Required before the consular visa application.", downloadUrl: "https://www.hikorea.go.kr/", filedBy: "employer", stage: "before_applying", notes: "Salary threshold ~KRW 30M/year for most E-7 sub-categories." },
    { code: "Visa application form", name: "E-7 visa application at Korean embassy", description: "Filed at Korean embassy abroad with COE + apostilled academic credentials.", downloadUrl: "https://overseas.mofa.go.kr/eng/wpge/m_5675/contents.do", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "E-7 covers 87 specialty-occupation activities. Path to F-2 long-term residence after 3 years on E-class + TOPIK Level 3+; F-5 PR after 5 years on F-2.",
};

// ─────────────────────────────────────────────────────────────────────────
// SINGAPORE — Employment Pass + ONE Pass
// ─────────────────────────────────────────────────────────────────────────
const SG_EMPLOYMENT_PASS: FormsEntry = {
  destinationIso2: "SG",
  programmeLabel: "Singapore — Employment Pass (EP)",
  programmeSlug: "/destination/sg",
  applicationPortal: "https://www.mom.gov.sg/passes-and-permits/employment-pass",
  applicableTo: { purposes: ["work"], labelKeywords: ["employment pass", "ep"] },
  forms: [
    { code: "EP Online application", name: "EP Online (MOM portal — submitted by employer)", description: "Sponsoring employer files via the MOM EP Online portal. No paper PDF — fully online.", downloadUrl: "https://www.mom.gov.sg/eservices/services/ep-online", filedBy: "employer", stage: "with_application" },
    { code: "COMPASS scorecard", name: "Complementarity Assessment Framework", description: "EP scoring framework — minimum 40 points across salary, qualifications, diversity, and skills-shortage criteria. Employer self-assesses before filing.", downloadUrl: "https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility", filedBy: "employer", stage: "before_applying", notes: "COMPASS effective Sep 2023 for new EPs; Sep 2024 for renewals." },
    { code: "Issuance letter + medical check", name: "Post-IPA medical examination", description: "Once in-principle approved (IPA), worker completes a Singapore medical check at a registered clinic before EP card collection.", downloadUrl: "https://www.mom.gov.sg/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "EP minimum salary $5,000/month (general), $5,500 (financial services), increases with age. 1-2 year initial, renewable up to 3 years. Path to PR via the Professionals/Technical Personnel & Skilled Workers (PTS) scheme after 6 months on EP.",
};

const SG_ONE_PASS: FormsEntry = {
  destinationIso2: "SG",
  programmeLabel: "Singapore — Overseas Networks & Expertise (ONE) Pass",
  programmeSlug: "/destination/sg",
  applicationPortal: "https://www.mom.gov.sg/passes-and-permits/overseas-networks-expertise-pass",
  applicableTo: { purposes: ["work"], labelKeywords: ["one pass", "overseas networks", "expertise pass"] },
  forms: [
    { code: "ONE Pass application", name: "Submitted via MOM portal by individual", description: "Self-filed (not employer-filed) — qualifying salary route OR outstanding-achievement route. $225 application fee.", downloadUrl: "https://www.mom.gov.sg/passes-and-permits/overseas-networks-expertise-pass/eligibility", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "ONE Pass: 5-year personalised work pass — no employer-sponsor needed, can start/operate multiple companies, spouse can work. Eligibility: S$30,000/month fixed salary OR outstanding achievement in arts/culture/sports/science/academia/research.",
};

// ─────────────────────────────────────────────────────────────────────────
// UAE — Golden + Green
// ─────────────────────────────────────────────────────────────────────────
const AE_GOLDEN: FormsEntry = {
  destinationIso2: "AE",
  programmeLabel: "United Arab Emirates — Golden Visa (10-year residence)",
  programmeSlug: "/destination/ae",
  applicationPortal: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa",
  applicableTo: { purposes: ["work", "family"], labelKeywords: ["golden visa", "10-year"] },
  forms: [
    { code: "ICP online application", name: "Federal Authority for Identity, Citizenship, Customs & Port Security", description: "Online application via ICP smart services for Abu Dhabi + most emirates. Dubai uses GDRFA's portal instead.", downloadUrl: "https://icp.gov.ae/en/", filedBy: "applicant", stage: "with_application" },
    { code: "GDRFA Dubai application", name: "General Directorate of Residency & Foreigners Affairs — Dubai", description: "Dubai-specific Golden Visa portal — used when residence will be in Dubai emirate.", downloadUrl: "https://www.gdrfad.gov.ae/en/", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "Golden Visa categories: investors (AED 2M+ real estate or business), entrepreneurs, specialised talents (PhDs, senior executives, doctors), outstanding students. 10-year multi-entry, no sponsor needed, sponsor own family. Renewable indefinitely.",
};

// ─────────────────────────────────────────────────────────────────────────
// NEW ZEALAND — AEWV + SMC
// ─────────────────────────────────────────────────────────────────────────
const NZ_AEWV: FormsEntry = {
  destinationIso2: "NZ",
  programmeLabel: "New Zealand — Accredited Employer Work Visa (AEWV)",
  programmeSlug: "/destination/nz",
  applicationPortal: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/accredited-employer-work-visa",
  applicableTo: { purposes: ["work"], labelKeywords: ["aewv", "accredited employer work visa"] },
  forms: [
    { code: "Online application", name: "AEWV application via INZ portal", description: "Online wizard at immigration.govt.nz. Pre-requisite: employer must be on the Accredited Employer register + have an accepted Job Check.", downloadUrl: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/accredited-employer-work-visa", filedBy: "applicant", stage: "with_application" },
    { code: "Accreditation + Job Check (employer)", name: "Accredited Employer status + Job Check approval", description: "Employer-side prerequisite. Without an accepted Job Check the worker can't apply.", downloadUrl: "https://www.immigration.govt.nz/employ-migrants/", filedBy: "employer", stage: "before_applying" },
  ],
  notes: "AEWV three-step process: Employer Accreditation → Job Check → Worker visa. Salary threshold NZD $31.61/hour median wage (2024). Up to 5 years on AEWV with renewals; conversion to Skilled Migrant Resident Visa possible after 2 years.",
};

const NZ_SMC: FormsEntry = {
  destinationIso2: "NZ",
  programmeLabel: "New Zealand — Skilled Migrant Category Resident Visa (SMC)",
  programmeSlug: "/destination/nz",
  applicationPortal: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/skilled-migrant-category-resident-visa",
  applicableTo: { purposes: ["work"], labelKeywords: ["skilled migrant", "smc"] },
  forms: [
    { code: "Online application", name: "SMC residence application via INZ portal", description: "Online wizard — points-tested at 6+ points minimum since Oct 2023 reform (was 180 points pre-reform). Direct PR grant on approval.", downloadUrl: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/skilled-migrant-category-resident-visa", filedBy: "applicant", stage: "with_application", notes: "Points: occupation registration (3-6 points), qualification (3-5), NZ work experience (1-3), full-time job (2-6). NZD $4,640 application fee." },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// IRELAND — Critical Skills Employment Permit
// ─────────────────────────────────────────────────────────────────────────
const IE_CRITICAL_SKILLS: FormsEntry = {
  destinationIso2: "IE",
  programmeLabel: "Ireland — Critical Skills Employment Permit",
  programmeSlug: "/destination/ie",
  applicationPortal: "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/",
  applicableTo: { purposes: ["work"], labelKeywords: ["critical skills", "employment permit"] },
  forms: [
    { code: "Online application — EPOS", name: "Employment Permits Online System", description: "Online application at epos.djei.ie. Employer or worker may file. €1,000 fee for 2-year permit.", downloadUrl: "https://epos.djei.ie/", filedBy: "employer", stage: "with_application", notes: "Salary threshold €38,000 (for occupations on the Critical Skills Occupations List) or €64,000+ (any role). Master's degree required for non-CSOL roles." },
    { code: "Stamp 4 application", name: "Stamp 4 Long-Term Residence after 2 years", description: "After 2 years on Critical Skills permit, apply for Stamp 4 — unrestricted right to work for any employer. Doesn't require employer sponsorship.", downloadUrl: "https://www.irishimmigration.ie/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Critical Skills permit is faster + has better terms than General Employment Permit: spouse-work permission, no Labour Market Needs Test, family reunification rights. Path to PR via Stamp 4 + Long-Term Residence + citizenship after 5 years.",
};

// ─────────────────────────────────────────────────────────────────────────
// THAILAND — O-A retirement + ED + DTV
// ─────────────────────────────────────────────────────────────────────────
const TH_O_A_RETIREMENT: FormsEntry = {
  destinationIso2: "TH",
  programmeLabel: "Thailand — Non-Immigrant O-A (Retirement Visa, age 50+)",
  programmeSlug: "/destination/th",
  applicationPortal: "https://www.thaievisa.go.th/",
  applicableTo: { purposes: ["family"], labelKeywords: ["o-a", "retirement", "long stay"] },
  forms: [
    { code: "Application form for Non-Immigrant O-A", name: "Visa application — Thai Royal Embassy", description: "Submit at Thai embassy in your country of residence. Cannot apply in-country.", downloadUrl: "https://www.thaiembassy.com/", filedBy: "applicant", stage: "with_application" },
    { code: "Verification of no criminal record", name: "Police clearance from country of residence", description: "Apostilled. Required by every Thai embassy for O-A applications.", downloadUrl: "https://www.thaiembassy.com/", filedBy: "applicant", stage: "before_applying" },
    { code: "Medical certificate", name: "Medical certificate (no prohibited diseases)", description: "Issued within 3 months of application. Confirms no leprosy, TB, drug addiction, elephantiasis, or 3rd-stage syphilis.", downloadUrl: "https://www.thaiembassy.com/", filedBy: "applicant", stage: "with_application" },
    { code: "Health insurance certificate", name: "Health insurance — ฿100k outpatient + ฿400k inpatient", description: "Mandatory since 2019. Must be from a Thai-licensed insurer OR foreign insurer with the FFW form completed by them.", downloadUrl: "https://longstay.tgia.org/", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "O-A is the 1-year retirement visa for age 50+. Financial requirement: ฿800,000 in Thai bank 2+ months OR ฿65,000/month income OR combo totalling ฿800k/year. Renewable in-country annually via Immigration. Long-Term Resident (LTR) Wealthy Pensioner is the 10-year alternative.",
};

const TH_ED_STUDENT: FormsEntry = {
  destinationIso2: "TH",
  programmeLabel: "Thailand — Non-Immigrant ED (Education) Visa",
  programmeSlug: "/destination/th",
  applicationPortal: "https://www.thaievisa.go.th/",
  applicableTo: { purposes: ["study"], labelKeywords: ["ed visa", "education", "student"] },
  forms: [
    { code: "Application form", name: "Non-Immigrant ED visa application", description: "Submit at Thai embassy. ฿2,000 single-entry / ฿5,000 multi-entry fee.", downloadUrl: "https://www.thaiembassy.com/", filedBy: "applicant", stage: "with_application" },
    { code: "Acceptance letter", name: "From Ministry-of-Education-accredited institution", description: "Issued by the Thai university / language school / dharma school after enrolment + tuition deposit.", downloadUrl: "https://www.thaiembassy.com/", filedBy: "applicant", stage: "before_applying" },
  ],
  notes: "ED covers Thai language schools, universities, dharma study, cooking schools. 90-day initial entry, renewable in-country every 90 days at Immigration Bureau throughout course duration.",
};

const TH_DTV: FormsEntry = {
  destinationIso2: "TH",
  programmeLabel: "Thailand — Destination Thailand Visa (DTV — Digital Nomad / Soft Power)",
  programmeSlug: "/destination/th",
  applicationPortal: "https://www.thaievisa.go.th/",
  applicableTo: { purposes: ["work", "tourism"], labelKeywords: ["dtv", "destination thailand", "digital nomad", "soft power"] },
  forms: [
    { code: "DTV online application", name: "Thai eVisa portal — Destination Thailand Visa", description: "Online at thaievisa.go.th. ฿10,000 fee.", downloadUrl: "https://www.thaievisa.go.th/", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "DTV launched July 2024. 5-year multi-entry visa with 180-day stays per entry (extendable +180). Open to: remote workers / digital nomads / freelancers (USD 14k+ savings); soft-power activity participants (Muay Thai / Thai cooking / Thai language); dependants of DTV holders. Replaces multiple older long-stay tourist tracks.",
};

// ─────────────────────────────────────────────────────────────────────────
// INDIA — Employment, Business, Student, OCI
// ─────────────────────────────────────────────────────────────────────────
const IN_EMPLOYMENT: FormsEntry = {
  destinationIso2: "IN",
  programmeLabel: "India — Employment Visa (E-class)",
  programmeSlug: "/destination/in",
  applicationPortal: "https://indianvisaonline.gov.in/visa/",
  applicableTo: { purposes: ["work"], labelKeywords: ["employment visa", "e visa", "e-class"] },
  forms: [
    { code: "Online application", name: "Indian Visa Online application", description: "Fill at indianvisaonline.gov.in. Print + submit at the Indian Visa Application Centre operated by VFS Global / Cox & Kings.", downloadUrl: "https://indianvisaonline.gov.in/visa/", filedBy: "applicant", stage: "with_application" },
    { code: "FRRO registration", name: "Foreigners Regional Registration Office", description: "Required within 14 days of arrival for stays > 180 days. Online via e-FRRO portal. ~₹1,900 fee.", downloadUrl: "https://indianfrro.gov.in/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Salary threshold US$25,000/year filters out lower-skilled employment. Renewable annually in-country via FRRO; cumulative stays up to 5 years. Spouse + children under 18 → X-Misc accompanying-family visa.",
};

const IN_OCI: FormsEntry = {
  destinationIso2: "IN",
  programmeLabel: "India — OCI (Overseas Citizen of India) Card",
  programmeSlug: "/destination/in",
  applicationPortal: "https://ociservices.gov.in/",
  applicableTo: { purposes: ["family"], labelKeywords: ["oci", "overseas citizen"] },
  forms: [
    { code: "OCI application", name: "OCI card application — Ministry of Home Affairs portal", description: "Online at ociservices.gov.in. Submit at Indian Mission abroad with apostilled documents + biometric appointment.", downloadUrl: "https://ociservices.gov.in/", filedBy: "applicant", stage: "with_application" },
    { code: "Renunciation certificate", name: "Indian passport surrender / renunciation", description: "If the applicant previously held an Indian passport, must surrender it + obtain a renunciation certificate from the Indian Mission BEFORE OCI application.", downloadUrl: "https://passportindia.gov.in/", filedBy: "applicant", stage: "before_applying" },
  ],
  notes: "OCI = lifetime multi-entry visa-free travel + work + study + property ownership rights in India (NOT for agricultural land or political offices). Eligible: foreign nationals who were Indian citizens / their descendants up to 4 generations. NOT eligible: Pakistan / Bangladesh nationals.",
};

// ─────────────────────────────────────────────────────────────────────────
// VIETNAM — Work Permit + TRC
// ─────────────────────────────────────────────────────────────────────────
const VN_WORK_PERMIT: FormsEntry = {
  destinationIso2: "VN",
  programmeLabel: "Vietnam — Work Permit + Temporary Residence Card (TRC)",
  programmeSlug: "/destination/vn",
  applicationPortal: "https://www.molisa.gov.vn/",
  applicableTo: { purposes: ["work"], labelKeywords: ["work permit", "trc", "lao động"] },
  forms: [
    { code: "Work Permit application (employer-filed)", name: "Vietnamese Ministry of Labour (MOLISA) application", description: "Filed by the Vietnamese employer at the provincial Department of Labour. Required BEFORE entering Vietnam on a work visa.", downloadUrl: "https://www.molisa.gov.vn/", filedBy: "employer", stage: "before_applying" },
    { code: "TRC application", name: "Temporary Residence Card — Vietnamese Immigration", description: "Filed at the local Immigration Department within 30 days of arrival. 2-year card typical, renewable.", downloadUrl: "https://xuatnhapcanh.gov.vn/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Work Permit + TRC is the standard Vietnamese employer-sponsored route. Path to permanent residency after 3 years on TRC. Key sectors: tech (Hanoi + HCMC), garment manufacturing (Bình Dương), oil-and-gas (Vũng Tàu).",
};

// ─────────────────────────────────────────────────────────────────────────
// MEXICO — Resident visas
// ─────────────────────────────────────────────────────────────────────────
const MX_TEMPORAL: FormsEntry = {
  destinationIso2: "MX",
  programmeLabel: "Mexico — Residente Temporal Visa (1-4 years)",
  programmeSlug: "/destination/mx",
  applicationPortal: "https://www.gob.mx/inm",
  applicableTo: { purposes: ["work", "family"], labelKeywords: ["residente temporal", "temporary resident"] },
  forms: [
    { code: "Consular visa application", name: "Solicitud de Visa Mexicana", description: "Submit at Mexican consulate in your country of residence — Mexico requires CONSULAR application first, then convert to residency in-country at INM within 30 days.", downloadUrl: "https://consulmex.sre.gob.mx/", filedBy: "applicant", stage: "with_application" },
    { code: "Canje de visa", name: "INM in-country conversion to Residente Temporal card", description: "Within 30 days of arrival, file at INM Mexico office. Pay MX$7,400 for the 1-year RT card.", downloadUrl: "https://www.gob.mx/inm/acciones-y-programas/tramites-migratorios", filedBy: "applicant", stage: "after_decision", notes: "30-day window is strict — miss it and you lose the visa." },
  ],
  notes: "Residente Temporal: 1-year initial, renewable up to 4 years total, then must convert to Residente Permanente. Financial requirement: ~US$4,300/month income for 6 months OR US$72,000 savings for 12 months (varies by consulate). Work authorisation: opt-in for Trabajador subtype.",
};

// ─────────────────────────────────────────────────────────────────────────
// PHILIPPINES — SRRV + 9(g) + 13(a)
// ─────────────────────────────────────────────────────────────────────────
const PH_SRRV: FormsEntry = {
  destinationIso2: "PH",
  programmeLabel: "Philippines — Special Resident Retiree's Visa (SRRV)",
  programmeSlug: "/destination/ph",
  applicationPortal: "https://retire.pra.gov.ph/",
  applicableTo: { purposes: ["family"], labelKeywords: ["srrv", "retirement", "special resident"] },
  forms: [
    { code: "SRRV application", name: "Philippine Retirement Authority application", description: "Filed at PRA Manila or via authorised PRA marketing agents abroad. Multiple subtypes: Smile / Classic / Human Touch / Courtesy / Expanded Courtesy.", downloadUrl: "https://retire.pra.gov.ph/", filedBy: "applicant", stage: "with_application" },
    { code: "PRA Time Deposit", name: "USD time deposit at PRA-approved bank", description: "Deposit amount varies by SRRV subtype: USD 10,000 (Human Touch, 35+); USD 20,000 (Smile, 35+); USD 50,000 (Classic, 35-49); USD 10,000 (Classic, 50+ with pension proof).", downloadUrl: "https://retire.pra.gov.ph/", filedBy: "applicant", stage: "before_applying", notes: "Deposit is convertible to a real-estate investment in PH after 30 days — many SRRV holders use it as the down-payment for a Philippine condo." },
  ],
  notes: "SRRV is PRA-administered (NOT Bureau of Immigration). Indefinite multi-entry residency. Particularly popular with Korean, Japanese, Chinese, US retirees (Cebu, Davao, Tagaytay, Subic). USD 1,400 application fee + USD 360 annual PRA fee.",
};

const PH_13A_MARRIAGE: FormsEntry = {
  destinationIso2: "PH",
  programmeLabel: "Philippines — 13(a) Permanent Resident Visa (Marriage)",
  programmeSlug: "/destination/ph",
  applicationPortal: "https://immigration.gov.ph/",
  applicableTo: { purposes: ["family"], labelKeywords: ["13(a)", "marriage visa", "spouse"] },
  forms: [
    { code: "13(a) application", name: "Bureau of Immigration permanent residence application", description: "Filed at BI Manila with marriage certificate, Filipino spouse's NSO birth certificate + supporting evidence.", downloadUrl: "https://immigration.gov.ph/", filedBy: "applicant", stage: "with_application", notes: "Probationary 1-year status first, then convert to permanent after 1 year of cohabitation in PH." },
    { code: "Annual Report", name: "Annual BI registration (all foreign residents)", description: "Required of EVERY foreign resident in the Philippines by 1 March each year. Fail to file = fines + visa cancellation.", downloadUrl: "https://immigration.gov.ph/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "13(a) is the marriage-to-Filipino route to permanent residency. Indefinite multi-entry once permanent status granted. Work authorisation: separate Alien Employment Permit (AEP) from DOLE still required for paid employment.",
};

// ─────────────────────────────────────────────────────────────────────────
// MALAYSIA — Employment Pass + MM2H
// ─────────────────────────────────────────────────────────────────────────
const MY_EP: FormsEntry = {
  destinationIso2: "MY",
  programmeLabel: "Malaysia — Employment Pass (EP I / II / III)",
  programmeSlug: "/destination/my",
  applicationPortal: "https://esd.imi.gov.my/portal/",
  applicableTo: { purposes: ["work"], labelKeywords: ["employment pass", "ep", "ep i", "ep ii", "ep iii"] },
  forms: [
    { code: "ESD online application", name: "Expatriate Services Division portal", description: "Employer files via ESD portal. Required: ESD-approved company registration + EP application + medical screening.", downloadUrl: "https://esd.imi.gov.my/portal/", filedBy: "employer", stage: "with_application" },
    { code: "Endorsement at Imigresen", name: "Visa endorsement on arrival at Immigration", description: "Worker collects EP card at the local Imigresen office within 30 days of arrival.", downloadUrl: "https://www.imi.gov.my/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Tiered by salary: EP I (RM 10,000+/month, max 5y); EP II (RM 5,000-9,999, max 2y); EP III (RM 3,000-4,999, max 1y, restricted sectors). Category I holders eligible for Residence Pass-Talent (RPT) after 3 continuous years.",
};

const MY_MM2H: FormsEntry = {
  destinationIso2: "MY",
  programmeLabel: "Malaysia — Malaysia My Second Home (MM2H, 2024 tiers)",
  programmeSlug: "/destination/my",
  applicationPortal: "https://mm2h.gov.my/",
  applicableTo: { purposes: ["family"], labelKeywords: ["mm2h", "second home"] },
  forms: [
    { code: "MM2H application — Silver/Gold/Platinum", name: "Ministry of Tourism, Arts & Culture portal", description: "Three tiers under the 2024 reform. Silver: age 30+, monthly income RM 50k+, fixed deposit RM 500k+, property RM 600k+. Gold: deposit RM 2M+, property RM 1M+. Platinum: deposit RM 5M+, property RM 2M+.", downloadUrl: "https://mm2h.gov.my/", filedBy: "applicant", stage: "with_application" },
    { code: "Sarawak State variant (S-MM2H)", name: "Sarawak-specific MM2H — lower thresholds", description: "Alternative to federal MM2H. Lower financial thresholds (RM 150k deposit) but restricted to East Malaysia residence only.", downloadUrl: "https://mm2h.sarawak.gov.my/", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "Federal MM2H reformed Dec 2023 with much higher thresholds + tiered structure. Spouse + children + parents eligible as dependants. Cannot work as employee (separate EP required) but CAN operate a Malaysia-registered business.",
};

// ─────────────────────────────────────────────────────────────────────────
// ARGENTINA — Mercosur
// ─────────────────────────────────────────────────────────────────────────
const AR_MERCOSUR: FormsEntry = {
  destinationIso2: "AR",
  programmeLabel: "Argentina — Residencia Temporaria Mercosur",
  programmeSlug: "/destination/ar",
  applicationPortal: "https://www.argentina.gob.ar/migraciones",
  applicableTo: { purposes: ["family", "work"], labelKeywords: ["mercosur", "residencia temporaria"] },
  forms: [
    { code: "RaDeX online application", name: "Radicación a Distancia de Extranjeros", description: "DNM's online residency portal. Mercosur subtype requires apostilled birth certificate proving nationality of a Mercosur full/associate state (BR / PY / UY / BO / CL / CO / EC / PE).", downloadUrl: "https://www.argentina.gob.ar/interior/migraciones/radex", filedBy: "applicant", stage: "with_application" },
    { code: "Reincidencia certificate", name: "Argentine criminal-record certificate", description: "Issued at the Registro Nacional de Reincidencia in Buenos Aires (or via consulate abroad). Required for every residence application.", downloadUrl: "https://www.argentina.gob.ar/justicia/reincidencia", filedBy: "applicant", stage: "with_application" },
    { code: "DNI Extranjeros", name: "Argentine national ID for foreigners", description: "Issued by RENAPER after residency approval — ~3 weeks after Migraciones decision. Essential for banking + healthcare.", downloadUrl: "https://www.argentina.gob.ar/interior/renaper", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Mercosur Residencia = simplest LatAm long-stay route — no employment / income / savings test, just nationality. Argentine citizenship after just 2 years of residence (one of the fastest globally).",
};

// ─────────────────────────────────────────────────────────────────────────
// SOUTH AFRICA — Critical Skills + Spousal
// ─────────────────────────────────────────────────────────────────────────
const ZA_CRITICAL_SKILLS: FormsEntry = {
  destinationIso2: "ZA",
  programmeLabel: "South Africa — Critical Skills Work Visa",
  programmeSlug: "/destination/za",
  applicationPortal: "http://www.dha.gov.za/",
  applicableTo: { purposes: ["work"], labelKeywords: ["critical skills", "work visa"] },
  forms: [
    { code: "Form BI-1738", name: "Application for temporary residence visa", description: "Main visa-application form. Submit at VFS South Africa application centre.", downloadUrl: "http://www.dha.gov.za/files/Forms/BI-1738.pdf", filedBy: "applicant", stage: "with_application" },
    { code: "SAQA evaluation", name: "South African Qualifications Authority foreign-qualification evaluation", description: "Required for every Critical Skills application. SAQA confirms the foreign qualification meets the SA equivalent for the listed critical-skills occupation.", downloadUrl: "https://www.saqa.org.za/", filedBy: "applicant", stage: "before_applying" },
    { code: "SAPS clearance certificate", name: "South African Police Service clearance", description: "If you've lived in SA before, you need a SAPS criminal-record clearance in addition to your home-country police certificate.", downloadUrl: "https://www.saps.gov.za/", filedBy: "applicant", stage: "before_applying" },
  ],
  notes: "Critical Skills List restructured 2023 — IT, engineering, healthcare, education, agriculture dominant. 5-year visa, no job offer required at application (1-year window to find employment after entry). Pathway to PR after 5 years.",
};

// ─────────────────────────────────────────────────────────────────────────
// TÜRKİYE — Çalışma İzni (Work Permit)
// ─────────────────────────────────────────────────────────────────────────
const TR_CALISMA_IZNI: FormsEntry = {
  destinationIso2: "TR",
  programmeLabel: "Türkiye — Çalışma İzni (Work Permit)",
  programmeSlug: "/destination/tr",
  applicationPortal: "https://www.csgb.gov.tr/",
  applicableTo: { purposes: ["work"], labelKeywords: ["work permit", "çalışma izni", "calisma izni"] },
  forms: [
    { code: "e-Devlet online application", name: "Ministry of Family, Labour & Social Services portal", description: "Employer files via ecalisma.csgb.gov.tr. Worker simultaneously submits at Turkish consulate abroad — two-step process.", downloadUrl: "https://ecalisma.csgb.gov.tr/", filedBy: "employer", stage: "with_application" },
    { code: "Consular work visa", name: "Çalışma Vizesi at Turkish consulate", description: "Worker collects the work visa at the Turkish consulate in their country of residence after the Ministry approves the employer's application.", downloadUrl: "https://www.konsolosluk.gov.tr/", filedBy: "applicant", stage: "with_application" },
    { code: "İkamet Tezkeresi", name: "Residence permit at Göç İdaresi", description: "Within 30 days of arrival, register at the local Göç İdaresi office for the work-permit-linked residence permit.", downloadUrl: "https://www.goc.gov.tr/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Foreign-worker quota — typically 1 foreign per 5 Turkish employees (some sectors exempted). Annual salary thresholds vary by occupation: 1.5×-6.5× Turkish minimum wage. Renewable in 2-year cycles; long-term work permit after 8 years of continuous work permits.",
};

// ─────────────────────────────────────────────────────────────────────────
// ITALY — Lavoro Subordinato + Study + DNV + Family Reunification
// ─────────────────────────────────────────────────────────────────────────
const IT_LAVORO_SUBORDINATO: FormsEntry = {
  destinationIso2: "IT",
  programmeLabel: "Italy — Lavoro Subordinato (Decreto Flussi employer-sponsored work)",
  programmeSlug: "/destination/it",
  applicationPortal: "https://www.esteri.it/en/servizi-consolari-e-visti/",
  applicableTo: { purposes: ["work"], labelKeywords: ["lavoro subordinato", "decreto flussi", "subordinato"] },
  forms: [
    { code: "Nulla Osta", name: "Nulla Osta al Lavoro (work-permit authorisation)", description: "Filed by the Italian employer at the Sportello Unico per l'Immigrazione (SUI) at the Prefettura. Issued only during Decreto Flussi quota windows.", downloadUrl: "https://www.libertaciviliimmigrazione.dlci.interno.gov.it/", filedBy: "employer", stage: "before_applying", notes: "Decreto Flussi quotas open annually; allocation typically exhausted within hours. Employer must pre-register on the ALI portal." },
    { code: "Visa application form", name: "Italian National Visa Application", description: "Filed at Italian consulate in your country of residence once Nulla Osta is issued. €116 fee.", downloadUrl: "https://www.esteri.it/en/servizi-consolari-e-visti/", filedBy: "applicant", stage: "with_application" },
    { code: "Permesso di Soggiorno application", name: "Residence permit at Questura within 8 days of arrival", description: "Pick up the application kit at Italian Post Office, return at Questura with photo + tax stamp + medical insurance.", downloadUrl: "https://questure.poliziadistato.it/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Decreto Flussi work-permit quota is Italy's main employer-sponsored route — heavily oversubscribed. EU Blue Card alternative available for high-skilled roles without the quota system.",
};

const IT_STUDY: FormsEntry = {
  destinationIso2: "IT",
  programmeLabel: "Italy — Visto Studio (Student Visa)",
  programmeSlug: "/destination/it",
  applicationPortal: "https://www.esteri.it/en/servizi-consolari-e-visti/",
  applicableTo: { purposes: ["study"], labelKeywords: ["visto studio", "student visa", "studio"] },
  forms: [
    { code: "Pre-iscrizione (Universitaly)", name: "Pre-enrolment at Universitaly portal", description: "Required BEFORE the visa application. Apply via universitaly.it linking your accepted Italian university programme.", downloadUrl: "https://www.universitaly.it/", filedBy: "applicant", stage: "before_applying" },
    { code: "Visa application form", name: "Italian Student Visa application", description: "Filed at Italian consulate with Universitaly confirmation + proof of funds (€467/month minimum) + accommodation + health insurance. €50 fee.", downloadUrl: "https://www.esteri.it/en/servizi-consolari-e-visti/", filedBy: "applicant", stage: "with_application" },
    { code: "Permesso di Soggiorno per Studio", name: "Residence permit at Questura within 8 days of arrival", description: "Convert the entry visa to a 1-year residence permit at the local Questura. Renewable annually for course duration.", downloadUrl: "https://questure.poliziadistato.it/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Italian public universities charge €0-€4,000/year for international students based on family income (ISEE Universitario). Private universities (Bocconi, LUISS, IULM) charge €10-25k/year. Work permitted 20 hrs/week during study.",
};

const IT_DIGITAL_NOMAD: FormsEntry = {
  destinationIso2: "IT",
  programmeLabel: "Italy — Digital Nomad Visa (Visto Nomade Digitale)",
  programmeSlug: "/destination/it",
  applicationPortal: "https://www.esteri.it/en/servizi-consolari-e-visti/",
  applicableTo: { purposes: ["work"], labelKeywords: ["digital nomad", "nomade digitale", "remote worker"] },
  forms: [
    { code: "Visa application form", name: "Italian National Visa — Lavoro Autonomo / Nomade Digitale", description: "Filed at Italian consulate. Proof of remote employment / freelance + €28k+ annual income + health insurance. €116 fee.", downloadUrl: "https://www.esteri.it/en/servizi-consolari-e-visti/", filedBy: "applicant", stage: "with_application" },
    { code: "Permesso di Soggiorno DNV", name: "Residence permit at Questura within 8 days of arrival", description: "Convert visa to 1-year residence permit, renewable annually.", downloadUrl: "https://questure.poliziadistato.it/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Italian DNV launched April 2024. Income threshold €28,000/year (~3× Italian minimum income). Cannot work for Italian companies, only foreign clients. Tax: opt into the 7% flat-tax regime for new residents in southern Italian municipalities < 20k population (10-year benefit).",
};

const IT_FAMILY: FormsEntry = {
  destinationIso2: "IT",
  programmeLabel: "Italy — Ricongiungimento Familiare (Family Reunification)",
  programmeSlug: "/destination/it",
  applicationPortal: "https://www.esteri.it/en/servizi-consolari-e-visti/",
  applicableTo: { purposes: ["family"], labelKeywords: ["ricongiungimento", "family reunification", "coesione familiare", "spouse"] },
  forms: [
    { code: "Nulla Osta al Ricongiungimento", name: "Authorisation for family reunification", description: "Filed by the Italian-resident sponsor at the Sportello Unico per l'Immigrazione (SUI) at the Prefettura. Required BEFORE the foreign family member can apply for a visa.", downloadUrl: "https://www.libertaciviliimmigrazione.dlci.interno.gov.it/", filedBy: "sponsor", stage: "before_applying" },
    { code: "Visto Ricongiungimento", name: "Family reunification visa at Italian consulate", description: "Foreign family member files at Italian consulate with Nulla Osta + apostilled relationship proofs + sworn Italian translations.", downloadUrl: "https://www.esteri.it/en/servizi-consolari-e-visti/", filedBy: "applicant", stage: "with_application" },
    { code: "Permesso di Soggiorno Coesione Familiare", name: "Family residence permit at Questura", description: "Within 8 days of arrival, apply at Questura for the 2-year family residence permit.", downloadUrl: "https://questure.poliziadistato.it/", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Italian family reunification is among the EU's most generous — covers spouse, minor children, dependent adult children, dependent parents. Sponsor must show income ≥ Italian social-assistance threshold × family size + adequate housing certified by ASL.",
};

// ─────────────────────────────────────────────────────────────────────────
// BRAZIL — VITEM V employment / II business / XI family
// ─────────────────────────────────────────────────────────────────────────
const BR_VITEM_V_EMPLOYMENT: FormsEntry = {
  destinationIso2: "BR",
  programmeLabel: "Brazil — VITEM V Employment Visa",
  programmeSlug: "/destination/br",
  applicationPortal: "https://www.gov.br/mre/en/consular-portal/visas",
  applicableTo: { purposes: ["work"], labelKeywords: ["vitem v", "employment visa", "trabalho"] },
  forms: [
    { code: "Online application (e-Consular)", name: "Brazilian e-Consular system", description: "Online via the e-Consular platform. Filed at the Brazilian consulate AFTER the Ministry of Justice (CONIG) approves the employer's residence-authorisation request.", downloadUrl: "https://www.gov.br/mre/en/consular-portal/visas/work-and-residence-visa-vitem-v", filedBy: "applicant", stage: "with_application" },
    { code: "Autorização de Residência (CONIG)", name: "Pre-approved residence authorisation", description: "Brazilian employer files at the Ministry of Justice's National Immigration Coordination. Required BEFORE the worker can apply for the consular visa.", downloadUrl: "https://www.gov.br/mj/pt-br/assuntos/seus-direitos/migracoes/autorizacao-de-residencia", filedBy: "employer", stage: "before_applying" },
    { code: "CRNM application", name: "Carteira de Registro Nacional Migratório (Federal Police)", description: "Foreign-resident ID card. Apply within 90 days of arrival at the local Polícia Federal office. Replaces the older RNE.", downloadUrl: "https://www.gov.br/pf/pt-br/assuntos/imigracao", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "VITEM V covers employer-sponsored work. Brazil reformed visa categories in 2017 (Lei de Migração) — simplified from 11 to 8. Mercosur nationals get a separate, simpler residency route.",
};

const BR_VITEM_II_BUSINESS: FormsEntry = {
  destinationIso2: "BR",
  programmeLabel: "Brazil — VITEM II Business Visa",
  programmeSlug: "/destination/br",
  applicationPortal: "https://www.gov.br/mre/en/consular-portal/visas",
  applicableTo: { purposes: ["business"], labelKeywords: ["vitem ii", "business visa"] },
  forms: [
    { code: "Online application (e-Consular)", name: "Brazilian e-Consular system", description: "Filed online. Brazil reintroduced visa requirements for US/CA/AU in April 2025. Most other major nationalities (EU, UK, JP, KR, AR, CL) remain visa-exempt for business + tourism.", downloadUrl: "https://www.gov.br/mre/en/consular-portal/visas/business-visa-vitem-ii", filedBy: "applicant", stage: "with_application" },
  ],
  notes: "Multi-entry 5-year business visa for visa-required nationalities. Up to 90 days per entry, extendable +90 in-country (max 180/year). Cannot work — VITEM V required for paid employment.",
};

const BR_VITEM_XI_FAMILY: FormsEntry = {
  destinationIso2: "BR",
  programmeLabel: "Brazil — VITEM XI Family Reunification",
  programmeSlug: "/destination/br",
  applicationPortal: "https://www.gov.br/mre/en/consular-portal/visas",
  applicableTo: { purposes: ["family"], labelKeywords: ["vitem xi", "family reunification", "reunião familiar"] },
  forms: [
    { code: "Autorização de Residência (Family)", name: "Pre-approved family residence authorisation", description: "Filed by the Brazilian-resident sponsor at the Federal Police for the foreign family member. Categories: spouse / stable union (união estável), parent, child, sibling.", downloadUrl: "https://www.gov.br/mj/pt-br/assuntos/seus-direitos/migracoes/autorizacao-de-residencia", filedBy: "sponsor", stage: "before_applying" },
    { code: "VITEM XI consular application", name: "Family reunification visa", description: "Foreign family member files at Brazilian consulate after CONIG approval with apostilled relationship documents + Portuguese translations.", downloadUrl: "https://www.gov.br/mre/en/consular-portal/visas/family-reunification-visa-vitem-xi", filedBy: "applicant", stage: "with_application" },
    { code: "CRNM application", name: "Carteira de Registro Nacional Migratório", description: "Within 90 days of arrival, register at Polícia Federal for the foreign-resident ID card.", downloadUrl: "https://www.gov.br/pf/pt-br/assuntos/imigracao", filedBy: "applicant", stage: "after_decision" },
  ],
  notes: "Brazilian family reunification is generous — includes stable unions (uniões estáveis) recognised regardless of formal marriage. Permanent residence after 2 years on VITEM XI for spouses of Brazilians; naturalisation after 1 year of permanent residence + Portuguese A2.",
};

// ─────────────────────────────────────────────────────────────────────────
// Registry export
// ─────────────────────────────────────────────────────────────────────────
export const VISA_FORMS: FormsEntry[] = [
  // Original 12
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
  // Batch 2 — 28 new programmes
  AU_STUDENT_500,
  AU_SKILLED_189,
  AU_WHV_417,
  US_F1_STUDENT,
  US_B1B2_VISITOR,
  US_L1_INTRACOMPANY,
  US_EB5_INVESTOR,
  US_I485_AOS,
  UK_STUDENT,
  UK_GRADUATE,
  UK_INNOVATOR_FOUNDER,
  UK_GLOBAL_TALENT,
  CA_VISITOR,
  CA_STUDY_PERMIT,
  CA_WORK_PERMIT,
  DE_CHANCENKARTE,
  DE_BLUE_CARD,
  FR_TALENT,
  ES_DIGITAL_NOMAD,
  ES_NLV,
  PT_D7,
  PT_D8_NOMAD,
  NL_HSM,
  NL_DAFT,
  JP_COE_WORK,
  JP_STUDENT,
  KR_D2_STUDENT,
  KR_E7,
  SG_EMPLOYMENT_PASS,
  SG_ONE_PASS,
  AE_GOLDEN,
  NZ_AEWV,
  NZ_SMC,
  IE_CRITICAL_SKILLS,
  TH_O_A_RETIREMENT,
  TH_ED_STUDENT,
  TH_DTV,
  IN_EMPLOYMENT,
  IN_OCI,
  VN_WORK_PERMIT,
  MX_TEMPORAL,
  PH_SRRV,
  PH_13A_MARRIAGE,
  MY_EP,
  MY_MM2H,
  AR_MERCOSUR,
  ZA_CRITICAL_SKILLS,
  TR_CALISMA_IZNI,
  // Batch 3 — round out top-20: Italy + Brazil
  IT_LAVORO_SUBORDINATO,
  IT_STUDY,
  IT_DIGITAL_NOMAD,
  IT_FAMILY,
  BR_VITEM_V_EMPLOYMENT,
  BR_VITEM_II_BUSINESS,
  BR_VITEM_XI_FAMILY,
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
