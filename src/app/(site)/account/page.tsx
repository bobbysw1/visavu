import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  currentUser,
  clearSessionCookie,
  watchlistFor,
  removeWatchlistSubscription,
  deleteAccount,
} from "@/lib/auth";
import { nameFor } from "@/lib/countries";
import { PURPOSE_LABEL } from "@/lib/types";
import type { Purpose } from "@/lib/types";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Visavu account",
  description: "Manage your watchlist subscriptions and account settings.",
  alternates: { canonical: absoluteUrl("/account") },
};

async function signOutAction(): Promise<void> {
  "use server";
  await clearSessionCookie();
  redirect("/");
}

async function unsubscribeAction(formData: FormData): Promise<void> {
  "use server";
  const subscriptionId = parseInt(String(formData.get("subscriptionId") ?? ""), 10);
  const user = await currentUser();
  if (!user || Number.isNaN(subscriptionId)) redirect("/account");
  await removeWatchlistSubscription(user.id, subscriptionId);
  redirect("/account");
}

async function deleteAccountAction(formData: FormData): Promise<void> {
  "use server";
  const confirmed = formData.get("confirm") === "delete";
  if (!confirmed) redirect("/account?error=confirm-required");
  const user = await currentUser();
  if (!user) redirect("/signin");
  await deleteAccount(user.id);
  await clearSessionCookie();
  redirect("/?deleted=1");
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/signin");

  const watchlist = await watchlistFor(user.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-10">
      <header>
        <h1 className="text-2xl font-semibold mb-1">Your Visavu account</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Signed in as <strong>{user.email}</strong>
        </p>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-2">Watchlist</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          You&apos;ll get an email when the visa data on any of these routes
          changes — fee bump, eligibility revision, status flip.
        </p>
        {watchlist.length === 0 ? (
          <p className="text-sm text-neutral-500 italic">
            No watchlist subscriptions yet.{" "}
            <Link href="/find-my-visa" className="underline">
              Look up a visa
            </Link>{" "}
            and tap &ldquo;Watch this route&rdquo; on the result page.
          </p>
        ) : (
          <ul className="space-y-2">
            {watchlist.map((sub) => (
              <li
                key={sub.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${sub.passportIso2.toLowerCase()}/${sub.destinationIso2.toLowerCase()}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {nameFor(sub.passportIso2)} → {nameFor(sub.destinationIso2)}
                  </Link>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {PURPOSE_LABEL[sub.purpose as Purpose]} · since{" "}
                    {sub.createdAt.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <form action={unsubscribeAction}>
                  <input type="hidden" name="subscriptionId" value={sub.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-700 dark:text-red-400 hover:underline"
                  >
                    Unsubscribe
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Sign out</h2>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            Sign out
          </button>
        </form>
      </section>

      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-lg font-semibold mb-2 text-red-700 dark:text-red-400">
          Delete account
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
          One-click deletion wipes your user record, all watchlist subscriptions,
          and pending notifications in a single transaction. We cannot recover
          deleted data — the records are removed, not soft-deleted.
        </p>
        {error === "confirm-required" && (
          <p className="text-xs text-red-700 dark:text-red-400 mb-3">
            Type &ldquo;delete&rdquo; in the box to confirm.
          </p>
        )}
        <form action={deleteAccountAction} className="flex items-center gap-2">
          <input
            name="confirm"
            type="text"
            placeholder='Type "delete" to confirm'
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm flex-1"
          />
          <button
            type="submit"
            className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700"
          >
            Delete my account
          </button>
        </form>
      </section>
    </main>
  );
}
