/**
 * Sticky jump-nav strip that surfaces the four most-asked actions on a
 * result page. Sits below the EditorialBillboard, above the visa-options
 * section.
 *
 * Why a jump-nav rather than collapsing sections:
 *   - The per-applicant documentation (PassportApplicantPanel) +
 *     application advice + alternatives are the content that
 *     differentiates Visavu from generic visa sites. Collapsing them
 *     hides the "we're not AI slop" proof from users who'd benefit
 *     most from seeing it.
 *   - But the result page IS long. Without a jump-nav, mobile users
 *     scroll past the apply CTA + into a wall of content + bounce.
 *   - A 4-chip sticky strip gives the impatient user one-tap access
 *     to "apply now / what docs / timeline / fees" without removing
 *     anything from the page.
 *
 * Hides on the smallest mobile widths because horizontal-scroll chips
 * are clumsy on phones — desktop + tablet only.
 *
 * Anchors are plain # links (no SPA navigation needed since we're on
 * the same page) — scroll-margin-top in the target sections handles
 * the sticky-header offset (set via Tailwind scroll-mt-* utilities on
 * the destinations).
 */
import type { VisaStatus } from "@/lib/types";

type Chip = {
  href: string;
  label: string;
  /** Hidden when the visa status doesn't make this action meaningful
   *  (e.g. no "documents" chip on a visa-free route — there's no
   *  application). */
  showFor: (status: VisaStatus | null) => boolean;
};

const CHIPS: Chip[] = [
  {
    href: "#apply",
    label: "Apply now →",
    showFor: (s) => s !== null && s !== "visa_free" && s !== "refused",
  },
  {
    href: "#documents",
    label: "What documents",
    showFor: (s) => s !== "visa_free" && s !== "refused",
  },
  {
    href: "#timeline",
    label: "Application timeline",
    showFor: (s) => s !== "visa_free" && s !== "refused",
  },
  {
    href: "#fees",
    label: "Fee breakdown",
    showFor: (s) => s !== "visa_free" && s !== "refused",
  },
];

export function QuickActionsStrip({
  primaryStatus,
}: {
  primaryStatus: VisaStatus | null;
}) {
  const visible = CHIPS.filter((c) => c.showFor(primaryStatus));
  if (visible.length === 0) return null;

  return (
    <nav
      aria-label="Jump to section"
      className="hidden sm:flex sticky top-16 z-30 -mx-4 px-4 py-2.5 mb-6 bg-[var(--color-paper)]/95 backdrop-blur border-b border-[var(--color-rule)] gap-2 overflow-x-auto"
    >
      <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[var(--color-ink-muted)] self-center shrink-0 pr-2 border-r border-[var(--color-rule)] mr-1">
        Jump to
      </span>
      {visible.map((c) => (
        <a
          key={c.href}
          href={c.href}
          className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--color-rule-strong)] bg-[var(--color-paper-elev)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)] text-[var(--color-ink)] transition"
        >
          {c.label}
        </a>
      ))}
    </nav>
  );
}
