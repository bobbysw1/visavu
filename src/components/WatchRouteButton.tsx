"use client";

/**
 * "Watch this route" button — surfaces on /[passport]/[destination] for
 * signed-in users. Toggles a row in watchlist_subscriptions; the cron
 * notification engine reads diffs and emails the subscriber on changes.
 *
 * Anonymous users see a "Sign in to watch this route" link instead.
 *
 * Server actions are passed in from the parent — keeps this client
 * component free of "use server" imports and lets the parent decide
 * the auth context.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import type { Purpose } from "@/lib/types";

export function WatchRouteButton({
  passportIso2,
  destinationIso2,
  purpose,
  signedIn,
  alreadyWatching,
  onWatch,
  onUnwatch,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
  signedIn: boolean;
  alreadyWatching: boolean;
  onWatch: (formData: FormData) => Promise<void> | void;
  onUnwatch: (formData: FormData) => Promise<void> | void;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(alreadyWatching);

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
