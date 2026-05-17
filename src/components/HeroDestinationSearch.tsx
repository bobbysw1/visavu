"use client";

/**
 * Hero search — destination-led, deliberately minimal.
 *
 * Two inputs (destination + optional passport) and one CTA. Popular
 * destinations are surfaced in the CountryCombobox typeahead as you
 * start typing, not as a row of pills underneath that crowds the hero.
 * No visa-pathway shortcuts here — they routed users to a generic
 * directory page that didn't help with their specific country.
 *
 * A single "Where can I move?" discovery link sits below the card for
 * users with no destination in mind.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CountryCombobox } from "./CountryCombobox";

export function HeroDestinationSearch({
  /** Tone of the surrounding backdrop. "dark" picks white prose so the
   *  "Where can I move?" footer reads against the homepage's dark hero
   *  photo; default "light" suits the not-found page paper background. */
  tone = "light",
}: { tone?: "light" | "dark" } = {}) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [passport, setPassport] = useState("");
  const [pending, startTransition] = useTransition();
  const footerClasses =
    tone === "dark"
      ? "text-center mt-4 text-sm text-white/90 drop-shadow-sm"
      : "text-center mt-4 text-sm text-slate-700 dark:text-slate-300";
  const footerLinkClasses =
    tone === "dark"
      ? "plausible-event-name=HeroDiscoveryClicked font-semibold text-white underline underline-offset-2 hover:no-underline"
      : "plausible-event-name=HeroDiscoveryClicked font-semibold text-blue-700 dark:text-blue-400 underline underline-offset-2 hover:no-underline";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination) return;
    const d = destination.toLowerCase();
    const p = passport.toLowerCase();
    const href = p ? `/${p}/${d}` : `/destination/${d}`;
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div className="relative">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-5 sm:p-7"
      >
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-blue-700 dark:text-blue-300 mb-4">
          What visa do you need?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-end">
          <CountryCombobox
            label="Your passport"
            mode="nationality"
            value={passport}
            onChange={setPassport}
            placeholder="e.g. British"
          />
          <CountryCombobox
            label="Destination"
            mode="country"
            value={destination}
            onChange={setDestination}
            placeholder="Type a country — Portugal, Japan, Canada…"
            required
          />
          <button
            type="submit"
            disabled={!destination || pending}
            className="plausible-event-name=HeroDestinationSubmitted h-[42px] px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold whitespace-nowrap"
          >
            {pending ? "Loading…" : "Look up visa →"}
          </button>
        </div>
      </form>

      <p className={footerClasses}>
        Don&apos;t know where you want to go?{" "}
        <Link href="/finder" className={footerLinkClasses}>
          Where can I move? →
        </Link>
      </p>
    </div>
  );
}
