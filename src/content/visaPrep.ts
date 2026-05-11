/**
 * Per-purpose visa preparation requirements.
 *
 * Maps a (purpose, status) pair to the list of `VisaDocument` IDs the
 * applicant is likely to need. This is the GLOBAL baseline — applies to
 * every country. Country-specific add-ons / removals can be layered on
 * top via the `overrides` table.
 *
 * Design notes:
 *  - Visa-free and visa-free-with-eTA routes get a minimal list (passport,
 *    onward ticket, plus the eTA application). Long lead-time docs are
 *    irrelevant — the UI hides the prep timeline for these.
 *  - Short-stay embassy/e-Visa routes (tourism, business, transit) cluster
 *    around the same core docs: passport, photo, application, financial
 *    proof, accommodation, return ticket, insurance.
 *  - Long-stay routes (work, study, family) layer background checks,
 *    medicals, credentials, and relationship/sponsorship evidence on top
 *    of the short-stay base.
 */
import type { Purpose, VisaStatus } from "@/lib/types";

/**
 * Base document IDs per purpose. Sorted intentionally: the UI re-sorts
 * by lead time for display, but maintainers can read this top-down.
 */
export const PREP_BY_PURPOSE: Record<Purpose, string[]> = {
  tourism: [
    "passport",
    "passport_photo",
    "visa_application",
    "application_fee",
    "return_ticket",
    "accommodation_proof",
    "bank_statements",
    "travel_insurance",
  ],
  business: [
    "passport",
    "passport_photo",
    "visa_application",
    "application_fee",
    "invitation_letter",
    "return_ticket",
    "accommodation_proof",
    "bank_statements",
    "travel_insurance",
  ],
  transit: ["passport", "passport_photo", "visa_application", "return_ticket"],
  work: [
    "passport",
    "passport_photo",
    "visa_application",
    "application_fee",
    "job_offer",
    "employer_sponsorship",
    "police_certificate",
    "medical_exam",
    "biometrics",
    "education_credentials",
    "language_test",
    "cv_resume",
    "apostille_certified_copies",
    "certified_translation",
    "financial_proof_longstay",
  ],
  study: [
    "passport",
    "passport_photo",
    "visa_application",
    "application_fee",
    "admission_letter",
    "tuition_receipt",
    "police_certificate",
    "medical_exam",
    "biometrics",
    "education_credentials",
    "language_test",
    "apostille_certified_copies",
    "certified_translation",
    "financial_proof_longstay",
  ],
  family: [
    "passport",
    "passport_photo",
    "visa_application",
    "application_fee",
    "marriage_certificate",
    "birth_certificate",
    "relationship_evidence",
    "sponsor_income_proof",
    "police_certificate",
    "medical_exam",
    "biometrics",
    "apostille_certified_copies",
    "certified_translation",
    "financial_proof_longstay",
  ],
  diplomatic: [
    "passport",
    "passport_photo",
    "visa_application",
  ],
};

/**
 * Country-specific tweaks. Use sparingly — most variation between countries
 * is in fees and processing times (which we surface elsewhere), not in the
 * document list.
 *
 * Examples:
 *  - US tourism (B1/B2) drops 'travel_insurance' as a hard requirement
 *    (the US doesn't mandate it).
 *  - Australia study/work require an English test that's not optional like
 *    in some other routes (no change here — already in the base list).
 *  - Schengen tourism mandates travel insurance (already in the base list).
 */
type OverrideKey = `${string}:${Purpose}`;
export const OVERRIDES: Partial<Record<OverrideKey, { add?: string[]; remove?: string[] }>> = {
  "US:tourism": { remove: ["travel_insurance"] },
  "US:business": { remove: ["travel_insurance"] },
  "US:work": { add: ["application_fee"] },
  "GB:family": { add: ["financial_proof_longstay"] },
  "AU:work": { add: ["language_test"] },
  "CA:work": { add: ["language_test", "education_credentials"] },
  "JP:work": { add: ["language_test"] },
};

export function documentsFor(
  destinationIso2: string,
  purpose: Purpose,
  status: VisaStatus,
): string[] {
  // Visa-free and visa-free-with-eTA: passport + ticket only; the prep
  // timeline isn't useful at that scale, so we return a short list that
  // the caller can use to decide whether to show the section at all.
  if (status === "visa_free") {
    return ["passport", "return_ticket"];
  }
  if (status === "visa_free_with_eta") {
    return ["passport", "return_ticket", "visa_application", "application_fee"];
  }
  if (status === "refused") return [];

  const base = PREP_BY_PURPOSE[purpose] ?? [];
  const upper = destinationIso2.toUpperCase();
  const override = OVERRIDES[`${upper}:${purpose}` as OverrideKey];
  if (!override) return base;

  const set = new Set(base);
  override.remove?.forEach((id) => set.delete(id));
  override.add?.forEach((id) => set.add(id));
  return [...set];
}
