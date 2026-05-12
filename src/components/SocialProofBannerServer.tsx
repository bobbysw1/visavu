/**
 * Server wrapper for the SocialProofBanner.
 *
 * Previously called `siteStats()` on every request, which ran four DB
 * queries inside the (site) layout — making every page dynamic and
 * adding ~50ms of Fluid Active CPU per visit. Big cost driver across
 * the long tail of routes.
 *
 * Now ships build-time-constant stats baked into the bundle. The numbers
 * change only when the dataset changes, so refreshing them per request
 * was always overkill. When new adapters are added the constants here
 * get a bump (or read from a build-time JSON snapshot if we want
 * automation later).
 */
import { SocialProofBanner } from "./SocialProofBanner";

// Snapshot of the dataset as of the last `npm run bootstrap` (Phase 5).
// Refresh manually when adding adapters — these are cosmetic numbers in
// a rotating insights pill, not source-of-truth coverage stats.
const BUILD_TIME_STATS = {
  totalRecords: 9_848,
  distinctPassports: 44,
  distinctDestinations: 250,
} as const;

export function SocialProofBannerServer() {
  return (
    <SocialProofBanner
      totalRecords={BUILD_TIME_STATS.totalRecords}
      distinctDestinations={BUILD_TIME_STATS.distinctDestinations}
      distinctPassports={BUILD_TIME_STATS.distinctPassports}
    />
  );
}
