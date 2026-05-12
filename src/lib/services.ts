/**
 * Relocation services data model.
 *
 * Visavu's core product is "what visa do I need?". Once a user has that
 * answer, the natural next questions are: travel insurance, health cover,
 * required shots, biometrics appointment, passport photo, immigration
 * lawyer. This module models those services so we can surface a curated,
 * route-aware list on every result page and on a /services directory.
 *
 *  - Each service is scoped by category, by which passports/destinations
 *    it applies to, and (optionally) by which visa purposes it matters for.
 *  - `affiliate: true` means clicks pay us a referral; we never run paid
 *    placements for VISA-APPLICATION services (those compromise the trust
 *    that the lookup tool depends on). Insurance / eSIM / photos / lawyers
 *    are explicitly allowed per `/disclosure`.
 *  - Every affiliate URL takes a single helper (`affiliateUrl`) that
 *    appends `ref=visavu` + the route ISOs for revenue attribution.
 *
 * Add new services by appending to the per-category files in
 * `src/content/services/*` — they get picked up automatically by the
 * `ALL_SERVICES` aggregate in `src/content/services/index.ts`.
 */
import type { Purpose } from "./types";

export type ServiceCategory =
  | "travel_insurance"
  | "health_insurance"
  | "vaccinations"
  | "biometrics"
  | "medical_checks"
  | "passport_photos"
  | "legal_services";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "travel_insurance",
  "health_insurance",
  "vaccinations",
  "biometrics",
  "medical_checks",
  "passport_photos",
  "legal_services",
];

export const CATEGORY_META: Record<
  ServiceCategory,
  { label: string; tagline: string; description: string; slug: string; affiliateSafe: boolean }
> = {
  travel_insurance: {
    label: "Travel insurance",
    tagline: "Cover for short trips, gap periods, and pre-arrival waits.",
    description:
      "Single-trip and pay-as-you-go cover for medical emergencies, evacuation, baggage, and trip cancellation. Important when your destination doesn't provide reciprocal healthcare and required for many embassy applications.",
    slug: "travel-insurance",
    affiliateSafe: true,
  },
  health_insurance: {
    label: "International health insurance",
    tagline: "Longer-term private medical cover for expats and long-stay visas.",
    description:
      "Annual private medical insurance covering inpatient and outpatient care across multiple countries. Mandatory for Spain digital nomad, Portugal D7, France Talent Passport, and most other long-stay visas where local healthcare isn't yet available.",
    slug: "health-insurance",
    affiliateSafe: true,
  },
  vaccinations: {
    label: "Required vaccinations & shots",
    tagline: "Official country-by-country travel health guidance.",
    description:
      "Up-to-date guidance from the CDC, NHS Fit for Travel, and other national health bodies on required and recommended vaccinations for your destination. Yellow Fever certificates are mandatory for entry from some routes.",
    slug: "vaccinations",
    affiliateSafe: false,
  },
  biometrics: {
    label: "Biometrics appointments",
    tagline: "Visa application centres that handle the biometrics step.",
    description:
      "Official visa application centres (VFS Global, TLScontact, BLS International, USCIS ASCs) that book biometrics appointments on behalf of embassies. The right provider depends on which country you're applying from and which embassy you're applying to.",
    slug: "biometrics",
    affiliateSafe: false,
  },
  medical_checks: {
    label: "Immigration medical checks",
    tagline: "Panel physicians for AU, CA, NZ, UK, and US visa medicals.",
    description:
      "Immigration medical examinations required for most long-stay work, family, and skilled-migration visas. Only panel physicians designated by the destination's immigration authority can perform the exam.",
    slug: "medical-checks",
    affiliateSafe: false,
  },
  passport_photos: {
    label: "Passport photo services",
    tagline: "Online and high-street services that meet embassy specs.",
    description:
      "Online services that produce passport-spec photos from a phone snapshot, plus walk-in chains. Most embassies still require physical prints in specific dimensions and backgrounds — pick a provider that guarantees the destination's spec.",
    slug: "passport-photos",
    affiliateSafe: true,
  },
  legal_services: {
    label: "Immigration lawyers & accountants",
    tagline: "Professional help for complex cases, appeals, and tax setup.",
    description:
      "Licensed immigration attorneys, accredited migration agents, and cross-border tax accountants. Worth their fees for high-stakes routes (work-sponsored, family, asylum, appeals) and for tax-residency planning on relocation.",
    slug: "legal-services",
    affiliateSafe: true,
  },
};

export type ServiceBadge = "recommended" | "official" | "value" | "global" | "sponsored" | null;

export type RelocationService = {
  id: string;
  category: ServiceCategory;
  provider: string;
  /** Plain-English description shown in the card body. */
  description: string;
  /** Outbound link. Use `affiliateUrl()` for affiliate-tracked links;
   *  static authoritative links (CDC, gov.uk) can be plain URLs. */
  url: string;
  /** True for revenue-tracked links; false for informational. Determines
   *  whether the "Sponsored" sub-label renders on the card. */
  affiliate: boolean;
  /** True if the service is offered globally / from any origin. */
  globalAvailable: boolean;
  /** Restrict to specific destination ISO2s (e.g. ["GB"] for a UK-only firm). */
  destinationIso2List?: string[];
  /** Restrict to specific origin/passport ISO2s. */
  passportIso2List?: string[];
  /** Restrict to specific purposes (e.g. legal mainly matters for work/family). */
  purposes?: Purpose[];
  /** Small badge in the top-right of the card. */
  badge?: ServiceBadge;
  /** Optional one-line price / fee note. */
  feeNote?: string;
  /** Optional CTA label override (defaults to "Open service"). */
  cta?: string;

  // ---- Monetisation layer (#12) ----
  /** When true, the card is pinned to the top of its category and rendered
   *  with the "Sponsored" badge regardless of its normal `badge` value.
   *  Use sparingly — we still curate for utility first. */
  sponsored?: boolean;
  /** Aggregate rating 1.0–5.0. When set, a star strip renders next to
   *  the provider name. Source the number from public review aggregates
   *  (Trustpilot, Google) and update annually. */
  rating?: number;
  /** Number of reviews used to compute the rating. Hides the strip when
   *  small (< 25) to avoid misleading users. */
  reviewCount?: number;
  /** Optional appointment-booking deep-link. When present a secondary
   *  "Book appointment" button renders alongside the primary CTA. */
  bookingUrl?: string;
  /** Optional headquartered city — surfaced in tile metadata when
   *  geolocation isn't available, helps users gauge proximity. */
  city?: string;
};

/**
 * Append `ref=visavu` and route ISOs to a base URL for revenue attribution.
 * Keeps every affiliate link consistent so partner dashboards line up with
 * our Plausible AffiliateClicked events.
 */
export function affiliateUrl(
  base: string,
  opts: { passportIso2?: string; destinationIso2?: string; purpose?: Purpose; campaign?: string } = {},
): string {
  const url = new URL(base);
  if (!url.searchParams.has("ref")) url.searchParams.set("ref", "visavu");
  if (opts.passportIso2) url.searchParams.set("utm_origin", opts.passportIso2);
  if (opts.destinationIso2) url.searchParams.set("utm_country", opts.destinationIso2);
  if (opts.purpose) url.searchParams.set("utm_purpose", opts.purpose);
  url.searchParams.set("utm_source", "visavu");
  url.searchParams.set("utm_medium", "result-page");
  if (opts.campaign) url.searchParams.set("utm_campaign", opts.campaign);
  return url.toString();
}

export type ServiceLookup = {
  passportIso2?: string;
  destinationIso2?: string;
  purpose?: Purpose;
  category?: ServiceCategory;
};

/**
 * Return the services applicable to a route + (optional) category filter.
 * Sort is stable: badged "recommended" or "official" first, then globally
 * available, then alphabetical by provider name.
 */
export function servicesFor(all: RelocationService[], q: ServiceLookup): RelocationService[] {
  const matches = all.filter((s) => {
    if (q.category && s.category !== q.category) return false;
    if (q.destinationIso2 && s.destinationIso2List && !s.destinationIso2List.includes(q.destinationIso2)) {
      // Service is destination-scoped and our destination isn't in the list.
      // Allow through only if the service is also globally available.
      if (!s.globalAvailable) return false;
    }
    if (q.passportIso2 && s.passportIso2List && !s.passportIso2List.includes(q.passportIso2)) {
      if (!s.globalAvailable) return false;
    }
    if (q.purpose && s.purposes && !s.purposes.includes(q.purpose)) return false;
    return true;
  });

  return matches.sort((a, b) => {
    const aRank = serviceRank(a, q);
    const bRank = serviceRank(b, q);
    if (aRank !== bRank) return aRank - bRank;
    return a.provider.localeCompare(b.provider);
  });
}

function serviceRank(s: RelocationService, q: ServiceLookup): number {
  // Lower rank sorts first.
  // Sponsored partners pin to the top — but only WITHIN the country-
  // specific tier so they can't bury a more relevant official source.
  const countrySpecificHit =
    (q.destinationIso2 && s.destinationIso2List?.includes(q.destinationIso2)) ||
    (q.passportIso2 && s.passportIso2List?.includes(q.passportIso2));
  if (s.sponsored && countrySpecificHit) return -1;
  if (s.sponsored && s.globalAvailable) return 0.5;
  if (s.badge === "official") return countrySpecificHit ? 0 : 1;
  if (s.badge === "recommended") return countrySpecificHit ? 1 : 2;
  if (countrySpecificHit) return 3;
  if (s.globalAvailable) return 4;
  return 5;
}
