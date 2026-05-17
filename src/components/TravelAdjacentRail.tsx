/**
 * Travel-adjacent rail — previously rendered eSIM + flight affiliate cards
 * below the relocation-services panel.
 *
 * 2026-05-18 — disabled until affiliate-partner registrations complete.
 * We don't link to private commercial providers for free; once partner
 * IDs are issued and `partnerRefValue` populated, the rail returns.
 *
 * Kept as a component (rather than deleting the import) so the result
 * page composition stays intact — it just renders nothing.
 */
export function TravelAdjacentRail(_props: { destinationIso2: string }) {
  return null;
}
