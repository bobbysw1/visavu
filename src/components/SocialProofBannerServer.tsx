/**
 * Server wrapper that fetches the global siteStats() once per request and
 * hands the verified numbers to the client SocialProofBanner. Failure to
 * load stats (e.g. PGlite cold-starting) just produces a curated-only
 * banner — never a broken UI.
 */
import { SocialProofBanner } from "./SocialProofBanner";
import { siteStats } from "@/lib/coverage";

export async function SocialProofBannerServer() {
  let stats: Awaited<ReturnType<typeof siteStats>> | null = null;
  try {
    stats = await siteStats();
  } catch {
    stats = null;
  }
  return (
    <SocialProofBanner
      totalRecords={stats?.totalRecords}
      distinctDestinations={stats?.distinctDestinations}
      distinctPassports={stats?.distinctPassports}
    />
  );
}
