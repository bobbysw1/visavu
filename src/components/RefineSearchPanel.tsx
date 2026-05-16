"use client";

/**
 * "Refine this result" — top-of-results refinement strip.
 *
 * Editorial redesign 2026-05: replaces the blue-gradient questionnaire CTA
 * with a quieter ink-card row. Three actions, all clearly labelled:
 *
 *   1. Change route (pivot passport / destination / purpose without
 *      scrolling back to the homepage)
 *   2. Filter by profile (Doctor / Engineer / Student / etc.)
 *   3. Take the 12-question questionnaire for ranked recommendations
 *
 * Default state is COLLAPSED — this is a power-user tool, not a
 * front-and-centre call to action. The collapsed pill says exactly what
 * the panel does so users aren't confused about whether to expand it.
 */
import { Suspense, useState } from "react";
import Link from "next/link";
import { ProfileFilter } from "./ProfileFilter";
import { LookupForm } from "./LookupForm";
import type { Purpose } from "@/lib/types";
import { PROFILE_META, type Profile } from "@/lib/profiles";

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
  // Stays open once a profile is active so users keep visual context for
  // what's filtering their results.
  const [open, setOpen] = useState(Boolean(profile));

  return (
    <section className="ink-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[var(--color-muted)]/40 transition"
      >
        <div className="min-w-0 flex-1">
          <p className="kicker mb-1">Refine</p>
          <p className="serif-display text-base sm:text-lg font-medium leading-tight">
            {profile ? (
              <>
                Filtered for {PROFILE_META[profile].emoji}{" "}
                {PROFILE_META[profile].label.toLowerCase()}
              </>
            ) : (
              <>Change route, filter by profession, or get personalised matches.</>
            )}
          </p>
        </div>
        <span
          aria-hidden
          className={`chev shrink-0 text-[var(--color-ink-muted)] ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-[var(--color-rule)] space-y-5">
          {/* 1. CHANGE ROUTE */}
          <div>
            <p className="kicker mb-2">Change route</p>
            <Suspense fallback={null}>
              <LookupForm
                initialPassport={passportIso2}
                initialDestination={destinationIso2}
                initialPurpose={purpose}
              />
            </Suspense>
          </div>

          {/* 2. PROFILE FILTER */}
          <div>
            <p className="kicker mb-2">Filter by profession</p>
            <ProfileFilter initial={profile} />
          </div>

          {/* 3. QUESTIONNAIRE CTA */}
          <div>
            <p className="kicker mb-2">Personalised ranking</p>
            <Link
              href="/find-my-visa"
              className="plausible-event-name=ResultRefineQuestionnaireClicked flex items-center justify-between gap-3 rounded-xl bg-[var(--color-ink)] text-[var(--color-paper)] px-5 py-3.5 transition hover:opacity-90"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm">
                  Take the 12-question questionnaire
                </p>
                <p className="text-xs opacity-75 mt-0.5 leading-snug">
                  Education, occupation, capital, family, timeline. We rank the visas you
                  actually qualify for.
                </p>
              </div>
              <span aria-hidden className="text-lg shrink-0">→</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
