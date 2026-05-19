"use client";

/**
 * "Updates" nav link with a small badge showing the count of new
 * catalogue updates since the user's last visit to /updates.
 *
 * Mechanics:
 *   - Reads src/data/recent_updates.json (passed in as `updates` prop
 *     by the server-rendered header — keeping data-loading server-side
 *     means the badge count is correct on first paint, no flicker).
 *   - Reads a cookie `vu_updates_last_seen` for the ISO date of the
 *     user's last visit to /updates. Counts entries newer than that.
 *   - Renders a discreet pill ("3") next to "Updates" when new since
 *     last visit. No pill when count is 0.
 *   - On click — the /updates page itself bumps the cookie via a tiny
 *     `<MarkUpdatesSeen>` companion (rendered there) so the next page
 *     load shows 0. We don't write the cookie HERE because clicking
 *     the link triggers navigation before the write can complete
 *     reliably.
 *
 * No login needed; the cookie is the entire state.
 */
import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_NAME = "vu_updates_last_seen";

export function UpdatesNavLink({
  updates,
}: {
  updates: Array<{ date: string }>;
}) {
  // Server render: assume 0 new (to avoid hydration flicker). After
  // hydration the cookie is read + the badge updates if there are new
  // entries since last visit. First-time visitors have no cookie → see
  // the full count, encouraging the click.
  const [newCount, setNewCount] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    const lastSeen = cookie?.split("=")[1] ?? null;
    if (!lastSeen) {
      // First-time visitor — show ALL recent updates so the badge is
      // an obvious "look at me" affordance. Capped at 9+ to stay subtle.
      setNewCount(Math.min(updates.length, 9));
      return;
    }
    const count = updates.filter((u) => u.date > lastSeen).length;
    setNewCount(Math.min(count, 9));
  }, [updates]);

  return (
    <Link
      href="/updates"
      className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition relative"
    >
      <span>Updates</span>
      {hydrated && newCount > 0 && (
        <span
          aria-label={`${newCount} new update${newCount === 1 ? "" : "s"}`}
          className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold tabular-nums leading-none"
        >
          {newCount >= 9 ? "9+" : newCount}
        </span>
      )}
    </Link>
  );
}

/**
 * Companion component rendered ON the /updates page — writes today's
 * date to the cookie so the badge clears for this visit. Kept in this
 * file so the cookie name stays co-located with the reader.
 */
export function MarkUpdatesSeen() {
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    // 90-day cookie — long enough to span the typical "I'll come back
    // and check what changed" cycle without persisting forever.
    document.cookie = `${COOKIE_NAME}=${today}; path=/; max-age=${90 * 86400}; samesite=lax`;
  }, []);
  return null;
}
