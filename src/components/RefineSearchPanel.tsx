"use client";

/**
 * "Looking for a different route?" — quiet pivot bar at the top of result
 * pages. Replaces the earlier 3-section "Refine" panel that bundled three
 * different concepts (change route + filter by profession + take the
 * questionnaire) under one collapsible header. User feedback was that the
 * panel was confusing and the profile-filter pathway frequently linked
 * to the wrong visas.
 *
 * 2026-05-17 redesign:
 *   - Single intent: pivot to a different passport / destination / purpose
 *   - The pivot uses the same LookupForm as the homepage — proven to work
 *   - Profile-filter mechanic moved out (now lives on /find-my-visa where
 *     it has more room to explain itself)
 *   - The questionnaire CTA is removed — it's in the main nav and on the
 *     homepage; bundling it under "Refine" was muddling the concept
 *
 * Default state is COLLAPSED. The header reads exactly what the panel
 * does ("Different passport, destination, or purpose? Edit the route.")
 * so users don't have to guess.
 */
import { Suspense, useState } from "react";
import { LookupForm } from "./LookupForm";
import type { Purpose } from "@/lib/types";
import { PURPOSE_LABEL } from "@/lib/types";
import { nameFor } from "@/lib/countries";

export function RefineSearchPanel({
  passportIso2,
  destinationIso2,
  purpose,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
  /** Profile filter has moved to /find-my-visa — kept in the prop signature
   *  so callers don't break, but no longer rendered here. */
  profile?: unknown;
}) {
  const [open, setOpen] = useState(false);

  const passportName = nameFor(passportIso2);
  const destinationName = nameFor(destinationIso2);
  const purposeLabel = PURPOSE_LABEL[purpose].toLowerCase();

  return (
    <section className="ink-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[var(--color-muted)]/40 transition"
      >
        <div className="min-w-0 flex-1">
          <p className="kicker mb-1">Edit route</p>
          <p className="text-sm text-[var(--color-ink)]/85 leading-snug">
            Currently showing{" "}
            <strong className="text-[var(--color-ink)]">
              {passportName} → {destinationName}
            </strong>{" "}
            for <strong className="text-[var(--color-ink)]">{purposeLabel}</strong>.{" "}
            <span className="underline">
              {open ? "Close" : "Change passport, destination, or purpose"}
            </span>
            .
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
        <div className="px-5 pb-5 pt-2 border-t border-[var(--color-rule)]">
          <Suspense fallback={null}>
            <LookupForm
              initialPassport={passportIso2}
              initialDestination={destinationIso2}
              initialPurpose={purpose}
            />
          </Suspense>
        </div>
      )}
    </section>
  );
}
