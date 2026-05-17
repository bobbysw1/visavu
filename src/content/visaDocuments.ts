/**
 * Visa document taxonomy.
 *
 * Each `VisaDocument` is something an applicant may need to obtain or
 * prepare. We pair every document with:
 *  - a typical procurement-time range (`leadDaysMin` / `leadDaysMax`)
 *  - a `mustOrderFirst` flag for long-lead items (police checks, medicals,
 *    apostilles) so the UI can highlight them
 *  - a short "what this is" description in plain English
 *  - a one-line hint on how to obtain it
 *
 * These are GLOBAL averages — actual times vary by country, channel, and
 * applicant circumstance. The UI is careful to phrase them as estimates,
 * never deadlines.
 *
 * Lead-time sources (cross-referenced):
 *  - FBI Identity History Summary: typical 3–5 business days via Channeler,
 *    8–12 weeks by mail (we use the wider range to be safe).
 *  - UK ACRO Police Certificate: ~10 working days standard.
 *  - WES credential evaluation: 7–35 business days.
 *  - IELTS turnaround: ~3–7 days post-test; booking is the lead time.
 *  - Hague Apostille (US, state level): 1–4 weeks depending on state.
 *  - Panel-physician medical (IRCC, USCIS, Australia DHA): 1–3 weeks to
 *    book + appointment + report.
 */

export type DocumentCategory =
  | "identity"
  | "purpose-evidence"
  | "background-check"
  | "medical"
  | "credentials"
  | "financial"
  | "relationship"
  | "application";

export type VisaDocument = {
  /** Stable key, used as React `key` and for requirement-map references. */
  id: string;
  label: string;
  /** One-sentence description aimed at a first-time applicant. */
  description: string;
  /** One-line action — "where to get this" / "how to obtain". */
  howToObtain: string;
  category: DocumentCategory;
  leadDaysMin: number;
  leadDaysMax: number;
  /** Items that should be ordered first because they're the longest-lead
   *  and gate the rest of the application. */
  mustOrderFirst?: boolean;
};

export const DOCUMENTS: Record<string, VisaDocument> = {
  passport: {
    id: "passport",
    label: "Valid passport",
    description:
      "Most countries require your passport to be valid for at least six months beyond your departure date, with two or more blank pages.",
    howToObtain:
      "Renew via your own country's passport office if expiring within 12 months.",
    category: "identity",
    leadDaysMin: 14,
    leadDaysMax: 56,
    mustOrderFirst: true,
  },
  passport_photo: {
    id: "passport_photo",
    label: "Passport-style photograph",
    description:
      "A recent biometric photo to the destination's specifications. Most consulates require their own dimensions, not your home country's.",
    howToObtain:
      "Any high-street photo studio, or app-based services that meet ICAO 9303 spec.",
    category: "identity",
    leadDaysMin: 1,
    leadDaysMax: 3,
  },
  return_ticket: {
    id: "return_ticket",
    label: "Onward or return ticket",
    description:
      "Proof you intend to leave the country before your permitted stay expires. Most short-stay visas and visa-free entries require this.",
    howToObtain:
      "Book a refundable flight or use a 24-hour hold from an OTA. Border officers can check the booking.",
    category: "purpose-evidence",
    leadDaysMin: 1,
    leadDaysMax: 1,
  },
  accommodation_proof: {
    id: "accommodation_proof",
    label: "Proof of accommodation",
    description:
      "Hotel bookings, an AirBnB reservation, or an invitation letter from a host covering the dates of your stay.",
    howToObtain:
      "Book refundable hotels (Booking.com Free Cancellation), or get a notarised invitation letter from your host.",
    category: "purpose-evidence",
    leadDaysMin: 1,
    leadDaysMax: 3,
  },
  bank_statements: {
    id: "bank_statements",
    label: "Recent bank statements",
    description:
      "Usually 3–6 months of statements showing you can support yourself during the trip. Required for most embassy-issued tourist visas.",
    howToObtain:
      "Download PDFs from your bank's online portal. Some consulates require originals stamped by the bank.",
    category: "financial",
    leadDaysMin: 1,
    leadDaysMax: 5,
  },
  travel_insurance: {
    id: "travel_insurance",
    label: "Travel medical insurance",
    description:
      "Schengen and many other tourist visas require €30,000 / $50,000 minimum medical cover for the duration of your stay.",
    howToObtain:
      "Buy from any insurer that issues a Schengen-compliant certificate (€30,000+ medical coverage, evacuation included, no-deductible). Compare independently — we don't currently link to specific providers.",
    category: "financial",
    leadDaysMin: 1,
    leadDaysMax: 1,
  },

  // Long-stay & employment ────────────────────────────────────────────
  job_offer: {
    id: "job_offer",
    label: "Signed job offer",
    description:
      "A signed contract or offer letter from a sponsoring employer. Required for every work-route visa worldwide.",
    howToObtain: "Issued by the sponsoring employer once you've accepted.",
    category: "purpose-evidence",
    leadDaysMin: 1,
    leadDaysMax: 14,
  },
  employer_sponsorship: {
    id: "employer_sponsorship",
    label: "Employer sponsorship / CoS",
    description:
      "A Certificate of Sponsorship (UK), Labour Market Impact Assessment (Canada), Form I-129 (US H-1B), or equivalent. The sponsor obtains this; you receive a reference number.",
    howToObtain:
      "Your employer applies to the destination's immigration authority. You can't start without their reference number.",
    category: "purpose-evidence",
    leadDaysMin: 14,
    leadDaysMax: 90,
    mustOrderFirst: true,
  },
  invitation_letter: {
    id: "invitation_letter",
    label: "Invitation letter",
    description:
      "From a business contact, host, or sponsor in the destination country. Some embassies require it notarised or authenticated.",
    howToObtain:
      "Issued by the host. Lead time depends on whether authentication is required.",
    category: "purpose-evidence",
    leadDaysMin: 5,
    leadDaysMax: 21,
  },
  admission_letter: {
    id: "admission_letter",
    label: "University admission letter",
    description:
      "An unconditional offer (I-20 for US, CAS for UK, CoE for Australia, CAQ + Letter of Acceptance for Canada).",
    howToObtain:
      "Issued by your university once you've accepted the offer and paid the deposit.",
    category: "purpose-evidence",
    leadDaysMin: 14,
    leadDaysMax: 60,
    mustOrderFirst: true,
  },

  // Background & integrity ────────────────────────────────────────────
  police_certificate: {
    id: "police_certificate",
    label: "Police certificate",
    description:
      "A criminal-record clearance from every country you've lived in for 6+ months in the past 10 years. Universally required for work, study, family and PR routes.",
    howToObtain:
      "FBI Channeler (US), ACRO (UK), AFP National Police Check (AU), state police of each country lived in.",
    category: "background-check",
    leadDaysMin: 14,
    leadDaysMax: 84,
    mustOrderFirst: true,
  },
  medical_exam: {
    id: "medical_exam",
    label: "Medical examination",
    description:
      "Conducted by a panel physician approved by the destination's immigration authority. Includes chest X-ray, blood tests, and an interview.",
    howToObtain:
      "Book directly with a panel physician — find them on the destination's immigration website.",
    category: "medical",
    leadDaysMin: 7,
    leadDaysMax: 28,
    mustOrderFirst: true,
  },
  biometrics: {
    id: "biometrics",
    label: "Biometrics (fingerprints + photo)",
    description:
      "Captured at a Visa Application Centre (VFS, BLS, TLScontact). Walk-in is rarely possible — appointment slots fill up.",
    howToObtain:
      "Book on the VAC website after submitting your online application.",
    category: "background-check",
    leadDaysMin: 7,
    leadDaysMax: 28,
  },
  apostille_certified_copies: {
    id: "apostille_certified_copies",
    label: "Apostille / certified document copies",
    description:
      "Hague Apostille on civil documents (birth, marriage, education certificates) for countries that recognise the convention. Other countries require consular legalisation instead.",
    howToObtain:
      "US: state Secretary of State or US State Dept. UK: FCDO Legalisation Office. Other: ministry of foreign affairs of the issuing country.",
    category: "credentials",
    leadDaysMin: 7,
    leadDaysMax: 28,
    mustOrderFirst: true,
  },
  certified_translation: {
    id: "certified_translation",
    label: "Certified translation of documents",
    description:
      "If your documents are not in the destination's official language, you may need a sworn or certified translator.",
    howToObtain:
      "ATA-certified (US) / ITI-qualified (UK) translators, or a sworn translator registered with the destination's consulate.",
    category: "credentials",
    leadDaysMin: 5,
    leadDaysMax: 14,
  },

  // Credentials ───────────────────────────────────────────────────────
  education_credentials: {
    id: "education_credentials",
    label: "Education credentials evaluation",
    description:
      "WES (Canada/US), ECE, IQAS, UK ENIC, or the destination's local equivalent — converts your foreign degree to the local framework.",
    howToObtain:
      "Order online; allow 4–10 weeks. Request your university to send transcripts directly to the assessor.",
    category: "credentials",
    leadDaysMin: 28,
    leadDaysMax: 84,
    mustOrderFirst: true,
  },
  language_test: {
    id: "language_test",
    label: "English- / language-proficiency test",
    description:
      "IELTS, TOEFL, PTE, DELE, TestDaF, JLPT — depending on the destination. Most have minimum scores per visa class.",
    howToObtain:
      "Book on the test provider's site. Test slots typically 2–4 weeks out; results 5–15 days after the test.",
    category: "credentials",
    leadDaysMin: 21,
    leadDaysMax: 60,
    mustOrderFirst: true,
  },
  cv_resume: {
    id: "cv_resume",
    label: "CV / résumé and work history",
    description:
      "Up-to-date résumé covering at least your last 10 years of employment. Some routes (Canada Express Entry, Australia points) require reference letters with hours per week.",
    howToObtain:
      "Self-prepared. Get reference letters from past employers on letterhead, signed.",
    category: "purpose-evidence",
    leadDaysMin: 7,
    leadDaysMax: 21,
  },

  // Financial ─────────────────────────────────────────────────────────
  financial_proof_longstay: {
    id: "financial_proof_longstay",
    label: "Proof of funds (long-stay)",
    description:
      "Country-specific minimum savings — e.g. ~CAD 14,000 (Canada study/work permits, single applicant), ~£1,334/month + £8,000 reserve (UK family), proof of income for digital-nomad routes.",
    howToObtain:
      "Bank statements going back 3–6 months, sometimes a sworn affidavit of support from a sponsor.",
    category: "financial",
    leadDaysMin: 7,
    leadDaysMax: 14,
  },
  tuition_receipt: {
    id: "tuition_receipt",
    label: "Tuition payment receipt",
    description:
      "Many study visas require a first-semester or full-year tuition payment receipt as proof of funds.",
    howToObtain:
      "Issued by your university after you pay the deposit.",
    category: "financial",
    leadDaysMin: 1,
    leadDaysMax: 7,
  },

  // Relationship evidence ─────────────────────────────────────────────
  marriage_certificate: {
    id: "marriage_certificate",
    label: "Marriage / civil-partnership certificate",
    description:
      "Original or certified copy of the marriage or civil-partnership registration, apostilled if applicable.",
    howToObtain:
      "Issuing registry office of the country where the marriage was registered.",
    category: "relationship",
    leadDaysMin: 7,
    leadDaysMax: 28,
  },
  relationship_evidence: {
    id: "relationship_evidence",
    label: "Evidence of genuine relationship",
    description:
      "Joint financial accounts, lease/mortgage in both names, photos across the relationship, communication logs, statements from family/friends — every modern partner visa requires this.",
    howToObtain:
      "Self-compile over time. Most routes want 12+ months of co-habitation evidence; some accept communication-only for long-distance.",
    category: "relationship",
    leadDaysMin: 14,
    leadDaysMax: 28,
    mustOrderFirst: true,
  },
  birth_certificate: {
    id: "birth_certificate",
    label: "Birth certificate (and children's)",
    description:
      "For family and dependent-child routes. Original or certified copy, apostilled if applicable.",
    howToObtain:
      "Vital records office of the country of birth.",
    category: "relationship",
    leadDaysMin: 7,
    leadDaysMax: 28,
  },
  sponsor_income_proof: {
    id: "sponsor_income_proof",
    label: "Sponsor's income evidence",
    description:
      "Last 6–12 months of payslips, employment letter, or tax returns from the citizen-sponsor in the destination country.",
    howToObtain:
      "Sponsor supplies. Tax returns may need an IRS / HMRC / CRA transcript, which takes a few weeks to order.",
    category: "financial",
    leadDaysMin: 7,
    leadDaysMax: 21,
  },

  // Application step ──────────────────────────────────────────────────
  visa_application: {
    id: "visa_application",
    label: "Online visa application form",
    description:
      "The destination's online form (DS-160 for US, gov.uk for UK, IRCC portal for Canada, ImmiAccount for Australia, e-Visa portal for most others).",
    howToObtain:
      "Apply directly on the destination government website — never via a third-party paid service.",
    category: "application",
    leadDaysMin: 1,
    leadDaysMax: 3,
  },
  application_fee: {
    id: "application_fee",
    label: "Application fee payment",
    description:
      "Payable to the destination government directly. Fees range from ~$25 (e-Visas) to $2,500+ (US EB-1).",
    howToObtain:
      "Card payment on the destination's portal. Receipt required for the application.",
    category: "application",
    leadDaysMin: 1,
    leadDaysMax: 1,
  },
};

export function formatLeadDays(min: number, max: number): string {
  if (min === max) {
    return min === 1 ? "1 day" : `${min} days`;
  }
  if (max <= 7) return `${min}–${max} days`;
  if (max <= 21) return `${Math.round(min / 7)}–${Math.round(max / 7)} weeks`;
  return `${Math.round(min / 7)}–${Math.round(max / 7)} weeks`;
}
