import Link from "next/link";

/**
 * Reusable "Coming soon — Get featured here" callout.
 *
 * Used everywhere visavu has a monetisation slot that isn't filled yet
 * (commercial provider categories, consultation adviser pool, etc.).
 * Replaces the awkward "no providers in this category" empty-state with
 * a confident, on-purpose framing: we know it's empty, we're recruiting
 * the first cohort, and qualified providers can apply via /contact.
 *
 * Two visual sizes:
 *   - `compact` (default) — single-line inline callout, fits inside an
 *     existing card or below a section heading
 *   - `panel` — full-width bordered panel with a stronger CTA, used for
 *     dedicated category landing pages
 *
 * The CTA appends `?subject=featured-listing&slot=<slot>` so the contact
 * page can pre-fill the subject line + route the message correctly.
 */
export function FeaturedHereCallout({
  slot,
  audience,
  cohortNote = "First cohort opens soon.",
  variant = "panel",
}: {
  /** Slot identifier — passed to /contact for routing. e.g. "travel-insurance", "uk-immigration-adviser". */
  slot: string;
  /** Human-readable description of who can apply. e.g. "vetted travel insurers", "IAA-registered immigration advisers". */
  audience: string;
  /** Optional copy explaining when listings will go live. */
  cohortNote?: string;
  variant?: "compact" | "panel";
}) {
  const href = `/contact?subject=featured-listing&slot=${encodeURIComponent(slot)}`;

  if (variant === "compact") {
    return (
      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
        <strong className="text-[var(--color-ink)]">Coming soon.</strong>{" "}
        {cohortNote} Are you one of the {audience}?{" "}
        <Link
          href={href}
          className="underline underline-offset-2 hover:no-underline text-[var(--color-ink)] font-medium"
        >
          Get featured here →
        </Link>
      </p>
    );
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-[var(--color-rule-strong)] bg-[var(--color-muted)]/30 p-5 sm:p-6">
      <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[var(--color-ink-muted)] mb-2">
        Coming soon
      </p>
      <p className="text-base sm:text-lg font-medium text-[var(--color-ink)] leading-snug mb-3">
        Visavu is recruiting its first cohort of {audience}.
      </p>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-4 max-w-2xl">
        {cohortNote} Until that cohort goes live we&apos;re leaving this slot
        empty rather than padding the page with arbitrary names. If you&apos;d
        like to be considered for inclusion, get in touch.
      </p>
      <Link
        href={href}
        className="
          inline-flex items-center gap-1.5 rounded-full
          border border-[var(--color-ink)] text-[var(--color-ink)]
          hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]
          text-xs font-semibold px-4 py-2 transition
        "
      >
        Get featured here →
      </Link>
    </div>
  );
}
