"use client";

/**
 * Single-field email opt-in for change alerts. The only retention loop on
 * the site. ONE email when the policy for this (passport, destination)
 * cell changes — no marketing, no upsell, no account.
 */
import { useState } from "react";
import { trackEvent } from "./PlausibleScript";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";

export function AlertOptIn({
  passportIso2,
  destinationIso2,
  purpose,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passport: passportIso2, destination: destinationIso2, purpose }),
      });
      const data = await res.json();
      if (data.ok) {
        setState("submitted");
        if (data.devConfirmUrl) setConfirmUrl(data.devConfirmUrl);
        trackEvent("AlertSubscribed", {
          passport: passportIso2,
          destination: destinationIso2,
          purpose,
        });
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "submitted") {
    return (
      <div className="my-4 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-sm">
        <p className="font-semibold mb-1">Check your inbox.</p>
        <p className="text-neutral-700 dark:text-neutral-300">
          We sent a confirmation link to <strong>{email}</strong>. Once you confirm, we&apos;ll
          email you ONCE if {nameFor(destinationIso2)}&apos;s policy changes for{" "}
          {nationalityFor(passportIso2)} travellers. No marketing, ever.
        </p>
        {confirmUrl && (
          <p className="mt-2 text-xs text-neutral-500">
            Dev mode: <a href={confirmUrl} className="underline">click here to confirm</a>
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="my-4 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40"
    >
      <p className="font-semibold text-sm mb-1">
        Email me if {nameFor(destinationIso2)}&apos;s policy changes
      </p>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
        ONE email when the rules change for {nationalityFor(passportIso2)} travellers. No account,
        no marketing.
      </p>
      <div className="flex flex-wrap gap-2">
        <label htmlFor="alert-email-input" className="sr-only">
          Email address
        </label>
        <input
          id="alert-email-input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address for change alerts"
          className="flex-1 min-w-[200px] rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 text-sm font-semibold"
        >
          {state === "submitting" ? "Sending…" : "Watch this route"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-red-700 dark:text-red-300 mt-2">
          Something went wrong. Try again in a moment.
        </p>
      )}
    </form>
  );
}
