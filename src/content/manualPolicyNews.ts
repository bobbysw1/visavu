/**
 * Hand-curated visa-policy news.
 *
 * The recent_updates.json file is auto-generated from git commits +
 * fee diffs by buildRecentUpdates.ts — that captures everything
 * Visavu's data has been updated WITH, but misses material real-world
 * policy news that hasn't yet flowed through our adapters (e.g. a
 * cabinet announcement that takes effect next week — the adapter
 * won't reflect it until it does).
 *
 * Add entries here as they happen. Each entry surfaces in:
 *   - The homepage <RecentUpdatesRail> carousel (merged with auto items)
 *   - The bottom-left <NewsFlashToast> rotating-pill widget
 *   - The /updates page list
 *
 * Editorial bar:
 *   - Only include items with a primary source (gov announcement,
 *     embassy statement, official press release).
 *   - Phrase factually — what changed, when, who's affected. Avoid
 *     promises ("this will be reversed", "expect...").
 *   - Set `urgency: "high"` for items the toast widget should pin to
 *     the top rotation slot. Use sparingly.
 *   - Set `expiresAt` to a future ISO date for time-limited items
 *     (e.g. "scheme closes 31 Dec") so they auto-hide afterwards.
 */

export type ManualPolicyNews = {
  /** Stable id — used as a localStorage dismissal key. */
  id: string;
  /** YYYY-MM-DD of the announcement (not the effective date). */
  date: string;
  /** Optional effective date if the policy kicks in later than the announcement. */
  effectiveDate?: string;
  /** Optional expiry — entry auto-hidden after this date passes. */
  expiresAt?: string;
  kind: "rule_change" | "fee_change" | "new_route" | "route_closed" | "deadline";
  destinationIso2: string | null;
  destinationName: string | null;
  /** Short headline — used as the toast pill text + carousel title. */
  title: string;
  /** One-sentence factual detail. Surfaced in the carousel + /updates page. */
  detail: string;
  /** Primary source URL — gov announcement, embassy statement, ministerial press release. */
  sourceUrl?: string;
  /** "high" → toast pins this item; "normal" → rotates with the rest. */
  urgency?: "high" | "normal";
};

export const MANUAL_POLICY_NEWS: ManualPolicyNews[] = [
  {
    id: "th-visa-exempt-30days-2026-05",
    date: "2026-05-20",
    kind: "rule_change",
    destinationIso2: "TH",
    destinationName: "Thailand",
    title: "Thailand cuts visa-exempt stay back to 30 days",
    detail:
      "Thailand has tightened its visa-exemption scheme — visa-free stays for ~90 nationalities (including the UK, US, EU and Australia) are reduced from the previously-extended period back to 30 days per entry. Longer-stay visitors now need the 60-day Tourist Visa (TR) from a Thai embassy or the new Destination Thailand Visa (DTV) for remote workers + retirees.",
    sourceUrl: "https://www.mfa.go.th/en/",
    urgency: "high",
  },
];

/** Filter to currently-relevant entries (drop expired items). */
export function activePolicyNews(now: Date = new Date()): ManualPolicyNews[] {
  const nowIso = now.toISOString().slice(0, 10);
  return MANUAL_POLICY_NEWS.filter((n) => !n.expiresAt || n.expiresAt >= nowIso);
}
