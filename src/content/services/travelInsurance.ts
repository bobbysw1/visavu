/**
 * Travel insurance providers.
 *
 * 2026-05-18 — provider listings removed pending affiliate-partner
 * registrations. Visavu doesn't link to private commercial providers for
 * free; once partners are signed up and tracking IDs land in
 * `partnerRefValue`, the curated provider list will return.
 *
 * Until then, the /services/travel-insurance category page still renders
 * its editorial framing (what travel insurance is for, how to choose,
 * when you don't need it) — that's genuine user value independent of
 * any provider listing.
 */
import type { RelocationService } from "@/lib/services";

export const TRAVEL_INSURANCE: RelocationService[] = [];
