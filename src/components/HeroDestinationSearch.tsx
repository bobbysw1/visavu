"use client";

/**
 * Hero search — destination-led. Most homepage visitors already have a
 * country in mind, so we lead with a big typeahead destination input.
 * Passport is secondary (and optional) — if missing on submit we send
 * the user to /destination/[iso] which itself has a passport picker.
 *
 * Popular-destination chips and quick-pathway buttons under the input
 * give one-tap entry for the most common search patterns. The
 * "Where can I move?" CTA at the bottom routes to /finder for users
 * with no destination in mind.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CountryCombobox } from "./CountryCombobox";

const POPULAR_DESTINATIONS: { iso2: string; label: string; flag: string }[] = [
  { iso2: "US", label: "United States", flag: "🇺🇸" },
  { iso2: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { iso2: "CA", label: "Canada", flag: "🇨🇦" },
  { iso2: "AU", label: "Australia", flag: "🇦🇺" },
  { iso2: "NZ", label: "New Zealand", flag: "🇳🇿" },
  { iso2: "DE", label: "Germany", flag: "🇩🇪" },
  { iso2: "PT", label: "Portugal", flag: "🇵🇹" },
  { iso2: "ES", label: "Spain", flag: "🇪🇸" },
  { iso2: "JP", label: "Japan", flag: "🇯🇵" },
  { iso2: "AE", label: "UAE", flag: "🇦🇪" },
  { iso2: "SG", label: "Singapore", flag: "🇸🇬" },
  { iso2: "IE", label: "Ireland", flag: "🇮🇪" },
];

const QUICK_PATHWAYS: { goal: string; label: string; emoji: string }[] = [
  { goal: "remote_work", label: "Digital nomad", emoji: "💻" },
  { goal: "invest", label: "Golden / investor", emoji: "💎" },
  { goal: "live_work", label: "Skilled worker", emoji: "🛠️" },
  { goal: "retire", label: "Retire abroad", emoji: "🌅" },
  { goal: "study", label: "Study abroad", emoji: "🎓" },
  { goal: "visit", label: "Tourism / visit", emoji: "🧳" },
];

export function HeroDestinationSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [passport, setPassport] = useState("");
  const [pending, startTransition] = useTransition();

  function navigate(destIso: string, passIso?: string) {
    const d = destIso.toLowerCase();
    const p = (passIso ?? passport).toLowerCase();
    const href = p ? `/${p}/${d}` : `/destination/${d}`;
    startTransition(() => {
      router.push(href);
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination) return;
    navigate(destination);
  }

  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-5 sm:p-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-blue-700 dark:text-blue-300 mb-3">
          Where do you want to go?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-end">
          <div>
            <CountryCombobox
              label="Destination"
              mode="country"
              value={destination}
              onChange={setDestination}
              placeholder="Type a country — Portugal, Japan, Canada…"
              required
            />
          </div>
          <div>
            <CountryCombobox
              label="Your passport (optional)"
              mode="nationality"
              value={passport}
              onChange={setPassport}
              placeholder="e.g. British"
            />
          </div>
          <button
            type="submit"
            disabled={!destination || pending}
            className="plausible-event-name=HeroDestinationSubmitted h-[42px] px-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold whitespace-nowrap"
          >
            {pending ? "Loading…" : "Look up visa →"}
          </button>
        </div>

        {/* Popular destinations chip row */}
        <div className="mt-5">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2">
            Popular destinations
          </p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_DESTINATIONS.map((d) => (
              <button
                key={d.iso2}
                type="button"
                onClick={() => navigate(d.iso2)}
                className="plausible-event-name=HeroPopularClicked inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition"
              >
                <span aria-hidden>{d.flag}</span>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick pathway buttons */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2">
            Or jump to a visa pathway
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PATHWAYS.map((q) => (
              <Link
                key={q.goal}
                href={`/finder?goal=${q.goal}${passport ? `&passport=${passport}` : ""}`}
                className="plausible-event-name=HeroQuickPathwayClicked inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition"
              >
                <span aria-hidden>{q.emoji}</span>
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </form>

      {/* Discovery mode CTA — bottom of card so it doesn't compete with
          the primary destination flow. */}
      <p className="text-center mt-4 text-sm text-slate-700 dark:text-slate-300">
        Don&apos;t know where you want to go?{" "}
        <Link
          href="/finder"
          className="plausible-event-name=HeroDiscoveryClicked font-semibold text-blue-700 dark:text-blue-400 underline underline-offset-2 hover:no-underline"
        >
          Where can I move? →
        </Link>
      </p>
    </div>
  );
}
