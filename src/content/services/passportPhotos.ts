/**
 * Passport photo services.
 *
 * 2026-05-18 — provider listings removed pending affiliate-partner
 * registrations. We don't link to private commercial photo services for
 * free; once partners are signed up (with destination-specific spec
 * guarantees in writing), the curated list will return.
 *
 * Until then, the /services/passport-photos category page renders the
 * editorial framing (specs vary by destination, regeneration policy
 * matters, when to use a service vs DIY) — that's genuine user value
 * independent of any provider listing.
 */
import type { RelocationService } from "@/lib/services";

export const PASSPORT_PHOTOS: RelocationService[] = [];
