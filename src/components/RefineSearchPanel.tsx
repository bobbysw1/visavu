"use client";

/**
 * "Narrow your search" panel — sits near the top of the result page.
 *
 * Collapsed by default. When expanded shows three things in one card:
 *
 *   1. Profile pills (Doctor / Engineer / Student / etc.) so the user
 *      can quickly tag themselves without taking the full questionnaire.
 *   2. The current route's LookupForm with passport + destination +
 *      purpose pre-filled, so the user can pivot to a different route
 *      without scrolling back to the homepage.
 *   3. A prominent CTA to take the 12-question questionnaire for the
 *      most accurate matching.
 *
 * The collapsed state shows a small banner — "Help us find the visa
 * relevant to you" — so users know the option exists without it
 * crowding the layout.
 */
import { Suspense, useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronDown, ArrowRight } from "lucide-react";
import { ProfileFilter } from "./ProfileFilter";
import { LookupForm } from "./LookupForm";
import type { Purpose } from "@/lib/types";
import type { Profile } from "@/lib/profiles";

export function RefineSearchPanel({
  passportIso2,
  destinationIso2,
  purpose,
  profile,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
  profile: Profile | null;
}) {
  // Default closed — user explicitly opens it when they want to refine.
  // Stays open once the user has picked a profile so they don't lose
  // visual context for what's filtering their results.
  const [open, setOpen] = useState(Boolean(profile));

  return (
    <section className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 via-white to-emerald-50/40 dark:from-blue-950/30 dark:via-neutral-950 dark:to-emerald-950/20 overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="shrink-0 rounded-full bg-blue-600 text-white p-1.5">
            <Sparkles size={14} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm sm:text-base">
              {profile ? "Search refined for your profile" : "Narrow your search"}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
              {profile
                ? "Tap to change profile, switch country, or take the full questionnaire."
                : "Tell us about you — we'll surface the visas you actually qualify for."}
            </p>
          </div>
        </div>
        <ChevronDown
          size={16}
          aria-hidden
          className={`shrink-0 text-neutral-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 border-t border-blue-200/60 dark:border-blue-900/60 pt-4 space-y-5">
          {/* PROFILE PILLS — quickest path to refinement. */}
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-2">
              Quick filter — who are you?
            </p>
            <ProfileFilter initial={profile} />
          </div>

          {/* QUESTIONNAIRE CTA — high-visibility for serious researchers. */}
          <Link
            href="/find-my-visa"
            className="plausible-event-name=ResultRefineQuestionnaireClicked flex items-center justify-between gap-3 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 transition"
          >
            <div className="min-w-0">
              <p className="font-semibold text-sm">Get a personalised match (12 quick questions)</p>
              <p className="text-xs text-blue-100 mt-0.5 leading-snug">
                Education, occupation, capital, family, timeline, criminal record. We sort the
                visas you qualify for and flag where you&apos;ll need professional help.
              </p>
            </div>
            <ArrowRight size={18} aria-hidden className="shrink-0" />
          </Link>

          {/* PIVOT TO ANOTHER ROUTE — passport + destination + purpose prefilled. */}
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-2">
              Try a different route
            </p>
            <Suspense fallback={null}>
              <LookupForm
                initialPassport={passportIso2}
                initialDestination={destinationIso2}
                initialPurpose={purpose}
              />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  );
}
