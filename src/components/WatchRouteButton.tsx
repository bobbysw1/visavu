"use client";

/**
 * "Watch this route" button — surfaces on /[passport]/[destination] for
 * signed-in users. Toggles a row in watchlist_subscriptions; the cron
 * notification engine reads diffs and emails the subscriber on changes.
 *
 * Anonymous users see a "Sign in to watch this route" link instead.
 *
 * IMPORTANT (cost): the signed-in / already-watching state is fetched on the
 * CLIENT after hydration via /api/watch-status — it is deliberately NOT passed
 * down from the server render. Reading the login cookie inside the page would
 * force every one of the ~235k pair pages to rebuild on every request (this was
 * the cause of a 39× function-CPU spike when a crawler walked the sitemap).
 * Keeping the cookie read out of the page lets it stay ISR-cached; only real
 * interactive visitors hit the lightweight status endpoint.
 *
 * Server actions are passed in from the parent — keeps this client
 * component free of "use server" imports and lets the parent decide
 * the auth context.
 */
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import type { Purpose } from "@/lib/types";

export function WatchRouteButton({
  passportIso2,
  destinationIso2,
  purpose,
  onWatch,
  onUnwatch,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
  onWatch: (formData: FormData) => Promise<void> | void;
  onUnwatch: (formData: FormData) => Promise<void> | void;
}) {
  const [isPending, startTransition] = useTransition();
  // null = still loading the per-user state; once resolved it's a boolean.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [optimistic, setOptimistic] = useState(false);

  // Resolve the visitor's auth + watchlist state after hydration. This is the
  // one per-user lookup; it runs in the browser so the page itself can stay
  // cookie-free and ISR-cacheable.
  useEffect(() => {
    let cancelled = false;
    const qs = new URLSearchParams({
      p: passportIso2,
      d: destinationIso2,
      purpose,
    }).toString();
    fetch(`/api/watch-status?${qs}`)
      .then((r) => (r.ok ? r.json() : { signedIn: false, watching: false }))
      .then((data: { signedIn?: boolean; watching?: boolean }) => {
        if (cancelled) return;
        setSignedIn(Boolean(data.signedIn));
        setOptimistic(Boolean(data.watching));
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [passportIso2, destinationIso2, purpose]);

  // While the per-user state is loading, render a neutral placeholder so the
  // layout doesn't jump. Crawlers (which don't run JS) only ever see this.
  if (signedIn === null) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-600">
        🔔 Watch this route
      </span>
    );
  }

  if (!signedIn) {
    return (
      <Link
        href={`/signin?return=${encodeURIComponent(
          `/${passportIso2.toLowerCase()}/${destinationIso2.toLowerCase()}?purpose=${purpose}`,
        )}`}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900"
      >
        🔔 Sign in to watch this route
      </Link>
    );
  }

  const action = optimistic ? onUnwatch : onWatch;

  return (
    <form
      action={(fd) => {
        setOptimistic(!optimistic);
        startTransition(async () => {
          await action(fd);
        });
      }}
      className="inline"
    >
      <input type="hidden" name="passportIso2" value={passportIso2} />
      <input type="hidden" name="destinationIso2" value={destinationIso2} />
      <input type="hidden" name="purpose" value={purpose} />
      <button
        type="submit"
        disabled={isPending}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
          optimistic
            ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
            : "bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        }`}
      >
        {optimistic ? "🔔 Watching" : "🔔 Watch this route"}
      </button>
    </form>
  );
}
