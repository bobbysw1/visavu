import Link from "next/link";

/**
 * Visible, non-dismissable disclaimer banner shown on any page that
 * surfaces visa-policy information. Reinforces the "general information,
 * not legal advice" framing without being heavy-handed.
 *
 * Use the `tone` prop to match the page's context:
 *   - "info"   = light blue, used on chat / myths / find-my-visa
 *   - "amber"  = caution, used on result pages where the data drives action
 */
export function DisclaimerBanner({
  tone = "info",
  compact = false,
}: {
  tone?: "info" | "amber";
  compact?: boolean;
}) {
  const styles =
    tone === "amber"
      ? "border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100"
      : "border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100";

  return (
    <aside
      role="note"
      aria-label="Disclaimer"
      className={`rounded-lg border ${styles} px-4 py-3 text-xs leading-relaxed`}
    >
      {compact ? (
        <p>
          General information, not legal advice. Visa rules change.{" "}
          <Link href="/disclaimer" className="underline">Full disclaimer.</Link>
        </p>
      ) : (
        <p>
          <strong>General information, not legal advice.</strong>{" "}
          Visa policy changes without notice. Always verify with the
          destination&apos;s official immigration authority and consider a
          consultation with a registered immigration adviser before acting on
          any information from this site.{" "}
          <Link href="/disclaimer" className="underline">Read the full disclaimer.</Link>{" "}
          For paid advice from a registered adviser, see{" "}
          <Link href="/consultation" className="underline">consultations</Link>.
        </p>
      )}
    </aside>
  );
}
