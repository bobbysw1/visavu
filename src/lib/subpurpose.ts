/**
 * Sub-purpose taxonomy. Each top-level Purpose breaks down further into the
 * concrete visa categories travelers actually distinguish — e.g. Family
 * splits into Spouse / Partner / Child / Parent / Adult dependent.
 *
 * The picker on the lookup form uses these to narrow the user's intent
 * before searching. The "not_sure" entry on each list opens the wizard.
 */
import type { Purpose } from "./types";

export type SubPurposeId = string;

export type SubPurpose = {
  id: SubPurposeId;
  label: string;
  description: string;
  // The keyword(s) we'd match against `visa_options.label` to filter to this
  // sub-purpose. "*" means "match any" — used for short-stay buckets where
  // the bigger visa_option label already encodes the sub-distinction.
  matchLabels: string[];
};

const SHORT_STAY_TOURISM: SubPurpose[] = [
  { id: "leisure", label: "Leisure travel", description: "Vacation, sightseeing, resorts.", matchLabels: ["*"] },
  { id: "visiting_family", label: "Visiting family or friends", description: "Short personal visits, no employment.", matchLabels: ["*"] },
  { id: "medical_tourism", label: "Medical treatment", description: "Short-stay treatment at a recognised facility.", matchLabels: ["medical"] },
  { id: "pilgrimage", label: "Religious pilgrimage", description: "Hajj, Umrah, or other religious travel.", matchLabels: ["pilgrimage", "hajj", "umrah"] },
];

const SHORT_STAY_BUSINESS: SubPurpose[] = [
  { id: "meetings", label: "Meetings & conferences", description: "Short attendance, no paid local work.", matchLabels: ["*"] },
  { id: "negotiations", label: "Contract negotiations", description: "Discussions and signings, no employment.", matchLabels: ["*"] },
  { id: "trade_fair", label: "Trade fair / exhibition", description: "Attending or exhibiting.", matchLabels: ["*"] },
];

const SHORT_STAY_TRANSIT: SubPurpose[] = [
  { id: "airside", label: "Airside transit", description: "Stay in international zone — no entry stamp.", matchLabels: ["airside", "transit"] },
  { id: "transit_visa", label: "Short transit visa", description: "Brief entry to connect onward.", matchLabels: ["transit"] },
];

const LONG_STAY_WORK: SubPurpose[] = [
  { id: "skilled_sponsored", label: "Skilled worker (sponsored)", description: "Job offer + licensed sponsor — UK Skilled Worker, AU 482, US H-1B.", matchLabels: ["Skilled Worker", "Skills in Demand", "H-1B", "Employment Pass"] },
  { id: "intra_company", label: "Intra-company transfer", description: "Move within a multinational employer.", matchLabels: ["intra-company", "intra company"] },
  { id: "investor", label: "Investor / Startup founder", description: "Self-sponsored with capital or innovative-business backing.", matchLabels: ["investor", "founder", "startup"] },
  { id: "digital_nomad", label: "Digital nomad / Remote worker", description: "Work remotely for foreign employer or clients.", matchLabels: ["Digital Nomad", "Talent Passport"] },
  { id: "working_holiday", label: "Working holiday", description: "Bilateral 12–24 month travel-and-work agreement (typically under 35).", matchLabels: ["working holiday"] },
  { id: "health_care", label: "Health & care worker", description: "Specialised tracks for nurses, carers, doctors.", matchLabels: ["health", "care"] },
  { id: "express_entry", label: "Points-based / Express Entry", description: "Self-assessed points routes — Canada Express Entry, NZ SMC.", matchLabels: ["Express Entry", "Skilled Migrant"] },
  { id: "highly_qualified", label: "Highly-qualified / EU Blue Card", description: "Master's-level and equivalent qualification routes.", matchLabels: ["Blue Card"] },
];

const LONG_STAY_STUDY: SubPurpose[] = [
  { id: "degree", label: "University degree (BA / MA / PhD)", description: "Full-time enrollment at an accredited institution.", matchLabels: ["Student", "Subclass 500"] },
  { id: "language", label: "Language course", description: "Short or long-stay language programme.", matchLabels: ["language"] },
  { id: "exchange", label: "Exchange / short course", description: "Semester abroad or short academic stay.", matchLabels: ["exchange"] },
  { id: "graduate_route", label: "Post-study work / Graduate route", description: "Stay-back permit after qualifying study.", matchLabels: ["Graduate"] },
];

const LONG_STAY_FAMILY: SubPurpose[] = [
  { id: "spouse_partner", label: "Spouse or civil partner", description: "Married or in a registered civil partnership with citizen / settled resident.", matchLabels: ["Spouse", "partner"] },
  { id: "unmarried_partner", label: "Unmarried partner", description: "Long-term durable relationship, typically 2+ years cohabiting.", matchLabels: ["partner", "Spouse / partner"] },
  { id: "fiance", label: "Fiancé(e)", description: "Travel to marry within 6 months — UK Fiancé visa, US K-1.", matchLabels: ["Fiancé", "K-1"] },
  { id: "child_dep", label: "Dependent child", description: "Child of citizen / settled resident, typically under 18.", matchLabels: ["child", "dependent"] },
  { id: "adult_dep", label: "Adult dependent relative", description: "Elderly parent or adult relative requiring care.", matchLabels: ["dependent"] },
  { id: "passive_income", label: "Passive income / Retirement", description: "Self-supporting via pension, rental, dividends — Portugal D7, Spain Non-Lucrative.", matchLabels: ["D7", "Passive"] },
];

const OFFICIAL_DIPLOMATIC: SubPurpose[] = [
  { id: "diplomatic_passport", label: "Diplomatic passport", description: "Accredited mission travel.", matchLabels: ["diplomatic"] },
  { id: "service_passport", label: "Service / Official passport", description: "Government employees on official business.", matchLabels: ["service", "official"] },
  { id: "international_org", label: "International organisation staff", description: "UN, WHO, OECD, regional bodies.", matchLabels: ["international", "organisation"] },
];

export const SUBPURPOSES_BY_PURPOSE: Record<Purpose, SubPurpose[]> = {
  tourism: SHORT_STAY_TOURISM,
  business: SHORT_STAY_BUSINESS,
  transit: SHORT_STAY_TRANSIT,
  work: LONG_STAY_WORK,
  study: LONG_STAY_STUDY,
  family: LONG_STAY_FAMILY,
  diplomatic: OFFICIAL_DIPLOMATIC,
};

export function subpurposesFor(purpose: Purpose): SubPurpose[] {
  return SUBPURPOSES_BY_PURPOSE[purpose] ?? [];
}

export function subpurposeById(purpose: Purpose, id: SubPurposeId): SubPurpose | undefined {
  return subpurposesFor(purpose).find((s) => s.id === id);
}
