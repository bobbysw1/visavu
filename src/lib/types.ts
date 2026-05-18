// Shared types for resolver, confidence, and UI.

export type Purpose =
  | "tourism"
  | "business"
  | "transit"
  | "work"
  | "study"
  | "family"
  | "diplomatic";

export type PurposeCategory = "short_stay" | "long_stay" | "official";

export type VisaStatus =
  | "visa_free"
  | "visa_free_with_eta"
  | "visa_on_arrival"
  | "e_visa"
  | "embassy_visa"
  | "restricted"
  | "refused";

export type ConfidenceBucket = "high" | "medium" | "low" | "unverified";

// ----- Purpose taxonomy & display helpers -----

export const PURPOSE_CATEGORY: Record<Purpose, PurposeCategory> = {
  tourism: "short_stay",
  business: "short_stay",
  transit: "short_stay",
  work: "long_stay",
  study: "long_stay",
  family: "long_stay",
  diplomatic: "official",
};

export const PURPOSE_LABEL: Record<Purpose, string> = {
  tourism: "Tourism",
  business: "Business",
  transit: "Transit",
  work: "Work",
  study: "Study",
  family: "Family",
  diplomatic: "Diplomatic",
};

// Two-letter abbreviations used in compact UI badges (instead of decorative
// emojis). Flag emojis are reserved for country identification.
export const PURPOSE_ABBR: Record<Purpose, string> = {
  tourism: "TR",
  business: "BUS",
  transit: "TRN",
  work: "WRK",
  study: "STD",
  family: "FAM",
  diplomatic: "DIP",
};

export const PURPOSE_DESCRIPTION: Record<Purpose, string> = {
  tourism: "Vacation, sightseeing, visiting friends",
  business: "Meetings, conferences, negotiations (no employment)",
  transit: "Passing through to a third country",
  work: "Employment, skilled worker, intra-company transfer",
  study: "Academic enrolment, degree programs",
  family: "Spouse, partner, dependent, family reunification",
  diplomatic: "Government representatives, accredited missions",
};

export const CATEGORY_LABEL: Record<PurposeCategory, string> = {
  short_stay: "Short visit",
  long_stay: "Live, work, or study",
  official: "Official",
};

export const CATEGORY_DESCRIPTION: Record<PurposeCategory, string> = {
  short_stay: "Up to 90 days. No work, no study, no permanent residence.",
  long_stay: "Settle, work, study, or join family for longer than a tourist stay.",
  official: "State representatives, diplomatic and service passports.",
};

export const PURPOSES_BY_CATEGORY: Record<PurposeCategory, Purpose[]> = {
  short_stay: ["tourism", "business", "transit"],
  long_stay: ["work", "study", "family"],
  official: ["diplomatic"],
};

export const ALL_PURPOSES: Purpose[] = [
  "tourism",
  "business",
  "transit",
  "work",
  "study",
  "family",
  "diplomatic",
];

export function isValidPurpose(p: string): p is Purpose {
  return (ALL_PURPOSES as string[]).includes(p);
}

// ----- Purpose-specific metadata shapes -----

export type WorkVisaMetadata = {
  sponsorshipRequired?: boolean;
  sponsorType?: "employer" | "self" | "investor";
  salaryThresholdMinor?: number;
  salaryCurrency?: string;
  eligibleOccupations?: string[];
  jobOfferRequired?: boolean;
  workPermitDays?: number;
  routeToSettlement?: boolean;
};

export type StudyVisaMetadata = {
  institutionAccreditationRequired?: boolean;
  courseDurationMonths?: number;
  financialProofMonthlyMinor?: number;
  financialProofCurrency?: string;
  partTimeWorkAllowedHours?: number;
  englishRequirement?: string;
};

export type FamilyVisaMetadata = {
  relationshipTypes?: Array<"spouse" | "partner" | "child" | "parent" | "dependent">;
  sponsorIncomeThresholdMinor?: number;
  sponsorIncomeCurrency?: string;
  sponsorMustBeCitizenOrResident?: boolean;
  cohabitationProofRequired?: boolean;
  routeToSettlement?: boolean;
};

export type DiplomaticVisaMetadata = {
  authorizationLetterRequired?: boolean;
  accreditedMissionRequired?: boolean;
  feeWaived?: boolean;
};

export type PurposeMetadataByPurpose = {
  tourism: null;
  business: null;
  transit: null;
  work: WorkVisaMetadata;
  study: StudyVisaMetadata;
  family: FamilyVisaMetadata;
  diplomatic: DiplomaticVisaMetadata;
};

// ----- Money / fees / eTA -----

export type Money = {
  amountMinor: number;
  currency: string;
  asOf: string; // ISO date
};

export type FeeComponent = Money & {
  kind: "base" | "service" | "biometrics" | "courier" | "vac" | "rush" | "other";
  label?: string;
  optional: boolean;
};

export type EtaApplied = {
  id: string;
  name: string;
  applyUrl?: string;
  status: "active" | "rolling_out" | "announced";
  effectiveFrom?: string;
  notes?: string;
};

// ----- Resolver output -----

export type ResolvedVisaOption = {
  id: number;
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
  status: VisaStatus;
  label: string;

  maxStayDays: number | null;
  validityDays: number | null;
  entriesAllowed: string | null;

  passportValidityMonthsRequired: number | null;
  blankPagesRequired: number | null;
  onwardTicketRequired: boolean | null;
  proofOfFundsRequired: boolean | null;
  proofOfAccommodationRequired: boolean | null;
  biometricsRequired: boolean | null;
  biometricsLocation: string | null;

  requirements: string[];
  vaccinationRequirements: string[];

  processingTimeDaysMin: number | null;
  processingTimeDaysMax: number | null;
  applicationUrl: string | null;
  primarySourceUrl: string | null;

  fees: FeeComponent[];

  blocDerivedFrom: string | null;
  eta: EtaApplied | null;

  // Purpose-specific metadata. Resolver hands it through opaquely; the UI
  // narrows by purpose to render the right fields.
  purposeMetadata: Record<string, unknown> | null;

  correctnessBucket: ConfidenceBucket;
  lastFetchedAt: string | null;
  lastVerifiedAt: string | null;

  /** Cross-source check status — see crossCheckWikipedia.ts. Optional so
   *  legacy resolver paths and tests don't have to thread it. */
  crossCheckResult?: "agrees" | "conflicts" | "no_mention" | null;

  /** Programme kill-switch — set via /admin/programmes when a politically
   *  volatile programme pauses or winds down. Optional / nullable. */
  programmeStatus?: "active" | "paused" | "wound_down" | "unverified" | null;
  programmeStatusNote?: string | null;

  /** Link-health for the apply / source URL — populated by checkLinks.ts. */
  linkHealth?: "ok" | "soft_block" | "broken" | null;

  notes: string | null;
};
