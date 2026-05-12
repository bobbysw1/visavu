/**
 * Country-level "what's it actually like to live here?" metrics.
 *
 * Nine indicators per destination, curated from public sources (OECD,
 * Numbeo, EF EPI, Global Peace Index, KPMG/OECD tax tables, national
 * immigration authorities). Each metric carries an attribution + year so
 * the dashboard tile shows where the number came from — no anonymous
 * numerology, no made-up benchmarks.
 *
 * Coverage today: top ~30 destinations by search volume. For countries
 * without curated data the dashboard renders an honest "Data not yet
 * curated" tile rather than fabricating a value.
 *
 * Three of the nine metrics are route-specific (difficulty, processing
 * time, PR pathway shown contextually) — they're populated from the
 * resolved visa option at call time, not from this static table.
 */
import type { ResolvedVisaOption } from "./types";
import type { DifficultyAssessment } from "./difficulty";

export type EnglishBand = "very_high" | "high" | "moderate" | "low" | "very_low";

export type MetricRating = "very_good" | "good" | "average" | "poor" | "very_poor";

export type CountryMetrics = {
  iso2: string;
  /** OECD-style average annual gross salary, USD PPP. */
  avgSalaryUsd: number | null;
  /** Numbeo Cost of Living Index (NYC = 100). */
  costOfLivingIndex: number | null;
  /** Top marginal personal income tax rate (%). */
  topTaxRatePct: number | null;
  /** Numbeo Healthcare Index (0–100, higher = better). */
  healthcareIndex: number | null;
  /** Global Peace Index rank (1 = safest, 163 = least safe). */
  safetyGpiRank: number | null;
  /** EF English Proficiency Index band. */
  englishBand: EnglishBand | null;
  /** Typical permanent-residency path length (years after first long-stay
   *  visa) for a skilled migrant. Use a short prose summary too. */
  permanentResidencyYears: number | null;
  permanentResidencyNote: string | null;
  /** Source year for the latest number used — surfaced in the tile. */
  asOf: string;
};

export const COUNTRY_METRICS: Record<string, CountryMetrics> = {
  US: {
    iso2: "US",
    avgSalaryUsd: 80_000,
    costOfLivingIndex: 71,
    topTaxRatePct: 37,
    healthcareIndex: 68,
    safetyGpiRank: 132,
    englishBand: "very_high",
    permanentResidencyYears: 5,
    permanentResidencyNote: "Green Card → naturalisation after 5 years",
    asOf: "2024",
  },
  GB: {
    iso2: "GB",
    avgSalaryUsd: 56_000,
    costOfLivingIndex: 64,
    topTaxRatePct: 45,
    healthcareIndex: 75,
    safetyGpiRank: 37,
    englishBand: "very_high",
    permanentResidencyYears: 5,
    permanentResidencyNote: "ILR after 5 yrs on most work routes",
    asOf: "2024",
  },
  CA: {
    iso2: "CA",
    avgSalaryUsd: 60_000,
    costOfLivingIndex: 67,
    topTaxRatePct: 53,
    healthcareIndex: 71,
    safetyGpiRank: 11,
    englishBand: "very_high",
    permanentResidencyYears: 1,
    permanentResidencyNote: "Express Entry PR direct; citizenship 3+ yrs",
    asOf: "2024",
  },
  AU: {
    iso2: "AU",
    avgSalaryUsd: 64_000,
    costOfLivingIndex: 76,
    topTaxRatePct: 45,
    healthcareIndex: 77,
    safetyGpiRank: 19,
    englishBand: "very_high",
    permanentResidencyYears: 4,
    permanentResidencyNote: "Skilled PR (189/190); citizenship after 4 yrs",
    asOf: "2024",
  },
  NZ: {
    iso2: "NZ",
    avgSalaryUsd: 49_000,
    costOfLivingIndex: 73,
    topTaxRatePct: 39,
    healthcareIndex: 73,
    safetyGpiRank: 2,
    englishBand: "very_high",
    permanentResidencyYears: 2,
    permanentResidencyNote: "Resident Visa direct; citizenship 5 yrs",
    asOf: "2024",
  },
  DE: {
    iso2: "DE",
    avgSalaryUsd: 58_000,
    costOfLivingIndex: 65,
    topTaxRatePct: 45,
    healthcareIndex: 73,
    safetyGpiRank: 16,
    englishBand: "very_high",
    permanentResidencyYears: 5,
    permanentResidencyNote: "Niederlassungserlaubnis after 5 yrs (33 mos for Blue Card)",
    asOf: "2024",
  },
  FR: {
    iso2: "FR",
    avgSalaryUsd: 53_000,
    costOfLivingIndex: 70,
    topTaxRatePct: 45,
    healthcareIndex: 78,
    safetyGpiRank: 87,
    englishBand: "moderate",
    permanentResidencyYears: 5,
    permanentResidencyNote: "Carte de résident after 5 yrs; citizenship 5 yrs",
    asOf: "2024",
  },
  ES: {
    iso2: "ES",
    avgSalaryUsd: 37_000,
    costOfLivingIndex: 56,
    topTaxRatePct: 47,
    healthcareIndex: 78,
    safetyGpiRank: 23,
    englishBand: "moderate",
    permanentResidencyYears: 5,
    permanentResidencyNote: "Residencia de larga duración after 5 yrs",
    asOf: "2024",
  },
  IT: {
    iso2: "IT",
    avgSalaryUsd: 39_000,
    costOfLivingIndex: 62,
    topTaxRatePct: 43,
    healthcareIndex: 67,
    safetyGpiRank: 34,
    englishBand: "moderate",
    permanentResidencyYears: 5,
    permanentResidencyNote: "Permesso UE per soggiornanti di lungo periodo after 5 yrs",
    asOf: "2024",
  },
  PT: {
    iso2: "PT",
    avgSalaryUsd: 31_000,
    costOfLivingIndex: 55,
    topTaxRatePct: 48,
    healthcareIndex: 67,
    safetyGpiRank: 7,
    englishBand: "high",
    permanentResidencyYears: 5,
    permanentResidencyNote: "Autorização de Residência Permanente after 5 yrs",
    asOf: "2024",
  },
  NL: {
    iso2: "NL",
    avgSalaryUsd: 64_000,
    costOfLivingIndex: 73,
    topTaxRatePct: 49.5,
    healthcareIndex: 75,
    safetyGpiRank: 25,
    englishBand: "very_high",
    permanentResidencyYears: 5,
    permanentResidencyNote: "Verblijfsvergunning onbepaalde tijd after 5 yrs",
    asOf: "2024",
  },
  IE: {
    iso2: "IE",
    avgSalaryUsd: 56_000,
    costOfLivingIndex: 71,
    topTaxRatePct: 40,
    healthcareIndex: 63,
    safetyGpiRank: 4,
    englishBand: "very_high",
    permanentResidencyYears: 5,
    permanentResidencyNote: "Stamp 4 + Long-Term Residence after 5 yrs",
    asOf: "2024",
  },
  SE: {
    iso2: "SE",
    avgSalaryUsd: 50_000,
    costOfLivingIndex: 67,
    topTaxRatePct: 52,
    healthcareIndex: 70,
    safetyGpiRank: 28,
    englishBand: "very_high",
    permanentResidencyYears: 4,
    permanentResidencyNote: "Permanent uppehållstillstånd after 4 yrs",
    asOf: "2024",
  },
  NO: {
    iso2: "NO",
    avgSalaryUsd: 64_000,
    costOfLivingIndex: 86,
    topTaxRatePct: 39,
    healthcareIndex: 75,
    safetyGpiRank: 22,
    englishBand: "very_high",
    permanentResidencyYears: 3,
    permanentResidencyNote: "Permanent oppholdstillatelse after 3 yrs",
    asOf: "2024",
  },
  DK: {
    iso2: "DK",
    avgSalaryUsd: 64_000,
    costOfLivingIndex: 76,
    topTaxRatePct: 56,
    healthcareIndex: 74,
    safetyGpiRank: 5,
    englishBand: "very_high",
    permanentResidencyYears: 8,
    permanentResidencyNote: "Permanent opholdstilladelse after 8 yrs (4 yrs fast-track)",
    asOf: "2024",
  },
  FI: {
    iso2: "FI",
    avgSalaryUsd: 50_000,
    costOfLivingIndex: 65,
    topTaxRatePct: 44,
    healthcareIndex: 73,
    safetyGpiRank: 13,
    englishBand: "very_high",
    permanentResidencyYears: 4,
    permanentResidencyNote: "Pysyvä oleskelulupa after 4 yrs",
    asOf: "2024",
  },
  CH: {
    iso2: "CH",
    avgSalaryUsd: 73_000,
    costOfLivingIndex: 105,
    topTaxRatePct: 40,
    healthcareIndex: 73,
    safetyGpiRank: 9,
    englishBand: "high",
    permanentResidencyYears: 10,
    permanentResidencyNote: "Niederlassungsbewilligung C after 10 yrs (5 yrs for EU/EFTA)",
    asOf: "2024",
  },
  AT: {
    iso2: "AT",
    avgSalaryUsd: 55_000,
    costOfLivingIndex: 64,
    topTaxRatePct: 55,
    healthcareIndex: 78,
    safetyGpiRank: 3,
    englishBand: "very_high",
    permanentResidencyYears: 5,
    permanentResidencyNote: "Daueraufenthalt-EU after 5 yrs",
    asOf: "2024",
  },
  BE: {
    iso2: "BE",
    avgSalaryUsd: 56_000,
    costOfLivingIndex: 66,
    topTaxRatePct: 50,
    healthcareIndex: 76,
    safetyGpiRank: 18,
    englishBand: "very_high",
    permanentResidencyYears: 5,
    permanentResidencyNote: "F+ permit / EU long-term resident after 5 yrs",
    asOf: "2024",
  },
  JP: {
    iso2: "JP",
    avgSalaryUsd: 41_000,
    costOfLivingIndex: 65,
    topTaxRatePct: 45,
    healthcareIndex: 80,
    safetyGpiRank: 17,
    englishBand: "low",
    permanentResidencyYears: 10,
    permanentResidencyNote: "PR after 10 yrs (1–5 yrs on HSP point system)",
    asOf: "2024",
  },
  KR: {
    iso2: "KR",
    avgSalaryUsd: 46_000,
    costOfLivingIndex: 73,
    topTaxRatePct: 45,
    healthcareIndex: 82,
    safetyGpiRank: 47,
    englishBand: "moderate",
    permanentResidencyYears: 5,
    permanentResidencyNote: "F-5 Permanent Resident after 5 yrs in F-2",
    asOf: "2024",
  },
  SG: {
    iso2: "SG",
    avgSalaryUsd: 65_000,
    costOfLivingIndex: 82,
    topTaxRatePct: 24,
    healthcareIndex: 71,
    safetyGpiRank: 6,
    englishBand: "high",
    permanentResidencyYears: 6,
    permanentResidencyNote: "PR via EP→PR pathway (very competitive)",
    asOf: "2024",
  },
  HK: {
    iso2: "HK",
    avgSalaryUsd: 56_000,
    costOfLivingIndex: 79,
    topTaxRatePct: 17,
    healthcareIndex: 68,
    safetyGpiRank: null,
    englishBand: "high",
    permanentResidencyYears: 7,
    permanentResidencyNote: "Right of Abode after 7 yrs continuous residence",
    asOf: "2024",
  },
  AE: {
    iso2: "AE",
    avgSalaryUsd: 47_000,
    costOfLivingIndex: 64,
    topTaxRatePct: 0,
    healthcareIndex: 68,
    safetyGpiRank: 53,
    englishBand: "moderate",
    permanentResidencyYears: null,
    permanentResidencyNote: "Golden Visa (5/10 yr renewable); no traditional PR",
    asOf: "2024",
  },
  SA: {
    iso2: "SA",
    avgSalaryUsd: 30_000,
    costOfLivingIndex: 50,
    topTaxRatePct: 0,
    healthcareIndex: 64,
    safetyGpiRank: 92,
    englishBand: "low",
    permanentResidencyYears: null,
    permanentResidencyNote: "Premium Residency (SAR 800k flat fee); no automatic PR",
    asOf: "2024",
  },
  IL: {
    iso2: "IL",
    avgSalaryUsd: 53_000,
    costOfLivingIndex: 77,
    topTaxRatePct: 50,
    healthcareIndex: 76,
    safetyGpiRank: 155,
    englishBand: "high",
    permanentResidencyYears: 3,
    permanentResidencyNote: "Citizenship via Law of Return for Jews; otherwise A-5/PR rare",
    asOf: "2024",
  },
  MX: {
    iso2: "MX",
    avgSalaryUsd: 17_000,
    costOfLivingIndex: 36,
    topTaxRatePct: 35,
    healthcareIndex: 67,
    safetyGpiRank: 138,
    englishBand: "low",
    permanentResidencyYears: 4,
    permanentResidencyNote: "Residente Permanente after 4 yrs Temporal",
    asOf: "2024",
  },
  BR: {
    iso2: "BR",
    avgSalaryUsd: 17_000,
    costOfLivingIndex: 35,
    topTaxRatePct: 27.5,
    healthcareIndex: 56,
    safetyGpiRank: 131,
    englishBand: "low",
    permanentResidencyYears: 4,
    permanentResidencyNote: "Permanência after 4 yrs (1 yr for family of citizens)",
    asOf: "2024",
  },
  TH: {
    iso2: "TH",
    avgSalaryUsd: 9_000,
    costOfLivingIndex: 41,
    topTaxRatePct: 35,
    healthcareIndex: 78,
    safetyGpiRank: 76,
    englishBand: "low",
    permanentResidencyYears: 3,
    permanentResidencyNote: "PR after 3 yrs on Non-Imm B / LTR; quota of 100/yr per nationality",
    asOf: "2024",
  },
  MY: {
    iso2: "MY",
    avgSalaryUsd: 13_000,
    costOfLivingIndex: 38,
    topTaxRatePct: 30,
    healthcareIndex: 70,
    safetyGpiRank: 19,
    englishBand: "high",
    permanentResidencyYears: 5,
    permanentResidencyNote: "PR via MM2H or work track (no automatic timeline)",
    asOf: "2024",
  },
  ZA: {
    iso2: "ZA",
    avgSalaryUsd: 14_000,
    costOfLivingIndex: 39,
    topTaxRatePct: 45,
    healthcareIndex: 64,
    safetyGpiRank: 123,
    englishBand: "high",
    permanentResidencyYears: 5,
    permanentResidencyNote: "PR after 5 yrs Critical Skills / Business / Relative visa",
    asOf: "2024",
  },
  IN: {
    iso2: "IN",
    avgSalaryUsd: 5_000,
    costOfLivingIndex: 25,
    topTaxRatePct: 39,
    healthcareIndex: 67,
    safetyGpiRank: 116,
    englishBand: "moderate",
    permanentResidencyYears: null,
    permanentResidencyNote: "No PR for foreign nationals; OCI for diaspora",
    asOf: "2024",
  },
  CN: {
    iso2: "CN",
    avgSalaryUsd: 13_000,
    costOfLivingIndex: 38,
    topTaxRatePct: 45,
    healthcareIndex: 64,
    safetyGpiRank: 88,
    englishBand: "low",
    permanentResidencyYears: 4,
    permanentResidencyNote: "Foreign Permanent Resident Card (very limited)",
    asOf: "2024",
  },
};

export function metricsFor(iso2: string): CountryMetrics | null {
  return COUNTRY_METRICS[iso2.toUpperCase()] ?? null;
}

/** Tuned for "higher = better living quality" intuition. */
export function ratingForSalary(usd: number | null): MetricRating | null {
  if (usd == null) return null;
  if (usd >= 60_000) return "very_good";
  if (usd >= 45_000) return "good";
  if (usd >= 30_000) return "average";
  if (usd >= 15_000) return "poor";
  return "very_poor";
}

export function ratingForCostOfLiving(index: number | null): MetricRating | null {
  // Lower index = cheaper to live = better for cost-conscious users.
  if (index == null) return null;
  if (index <= 40) return "very_good";
  if (index <= 55) return "good";
  if (index <= 70) return "average";
  if (index <= 85) return "poor";
  return "very_poor";
}

export function ratingForTax(pct: number | null): MetricRating | null {
  // Lower top marginal = better take-home for high earners.
  if (pct == null) return null;
  if (pct <= 15) return "very_good";
  if (pct <= 25) return "good";
  if (pct <= 35) return "average";
  if (pct <= 45) return "poor";
  return "very_poor";
}

export function ratingForHealthcare(index: number | null): MetricRating | null {
  if (index == null) return null;
  if (index >= 78) return "very_good";
  if (index >= 70) return "good";
  if (index >= 60) return "average";
  if (index >= 50) return "poor";
  return "very_poor";
}

export function ratingForSafety(gpiRank: number | null): MetricRating | null {
  // Lower rank = safer (GPI 2024 covers 163 countries).
  if (gpiRank == null) return null;
  if (gpiRank <= 20) return "very_good";
  if (gpiRank <= 50) return "good";
  if (gpiRank <= 90) return "average";
  if (gpiRank <= 130) return "poor";
  return "very_poor";
}

export function ratingForEnglish(band: EnglishBand | null): MetricRating | null {
  if (band == null) return null;
  return {
    very_high: "very_good",
    high: "good",
    moderate: "average",
    low: "poor",
    very_low: "very_poor",
  }[band] as MetricRating;
}

export function ratingForPrYears(years: number | null): MetricRating | null {
  if (years == null) return "poor"; // No PR pathway
  if (years <= 2) return "very_good";
  if (years <= 4) return "good";
  if (years <= 6) return "average";
  if (years <= 8) return "poor";
  return "very_poor";
}

export function ratingForDifficulty(bucket: DifficultyAssessment["bucket"]): MetricRating {
  return bucket === "easy" ? "very_good" : bucket === "medium" ? "average" : "poor";
}

export function ratingForProcessingDays(maxDays: number | null): MetricRating | null {
  if (maxDays == null || maxDays === 0) return "very_good";
  if (maxDays <= 7) return "very_good";
  if (maxDays <= 21) return "good";
  if (maxDays <= 45) return "average";
  if (maxDays <= 90) return "poor";
  return "very_poor";
}

export const ENGLISH_BAND_LABEL: Record<EnglishBand, string> = {
  very_high: "Very high",
  high: "High",
  moderate: "Moderate",
  low: "Low",
  very_low: "Very low",
};

/** Pull the route-specific signals (difficulty + processing days) from the
 *  resolved primary option. PR pathway comes from static destination data. */
export function routeSignals(opt: ResolvedVisaOption | null, difficulty: DifficultyAssessment | null) {
  return {
    difficultyScore: difficulty?.score ?? null,
    difficultyBucket: difficulty?.bucket ?? null,
    processingDaysMin: opt?.processingTimeDaysMin ?? null,
    processingDaysMax: opt?.processingTimeDaysMax ?? null,
  };
}

export const SOURCES = {
  salary: { label: "OECD Average annual wages", url: "https://data.oecd.org/earnwage/average-wages.htm" },
  cost: { label: "Numbeo Cost of Living Index (NYC = 100)", url: "https://www.numbeo.com/cost-of-living/" },
  tax: { label: "OECD / KPMG personal income tax tables", url: "https://www.oecd.org/tax/tax-policy/tax-database/" },
  healthcare: { label: "Numbeo Healthcare Index", url: "https://www.numbeo.com/health-care/" },
  safety: { label: "Vision of Humanity Global Peace Index 2024", url: "https://www.visionofhumanity.org/maps/" },
  english: { label: "EF English Proficiency Index 2024", url: "https://www.ef.com/wwen/epi/" },
  pr: { label: "National immigration authority", url: null as string | null },
};
