/**
 * Privacy-friendly analytics script. Loaded in the SITE layout only —
 * /admin/*, /embed/*, and the API surface are excluded by virtue of being
 * in different route groups.
 *
 * Configure the domain via env: NEXT_PUBLIC_PLAUSIBLE_DOMAIN.
 *
 * Custom events (dispatched via window.plausible from client components):
 *   - ApplyClicked       — user clicked the .gov "Apply on official site" CTA
 *   - FinderSubmitted    — Where-can-I-go wizard submitted
 *   - LocaleChanged      — user switched language
 *   - AffiliateClicked   — user clicked an affiliate link (Tier-4 prompt 17)
 *
 * No PII in any event property.
 */

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

export function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <>
      <script
        defer
        data-domain={domain}
        src="https://plausible.io/js/script.tagged-events.js"
      />
      {/* Initialise the queue so events fire even before the script loads. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`,
        }}
      />
    </>
  );
}

/**
 * Fire a custom event from any client component. Safe to call before the
 * script has loaded — events queue and flush.
 */
export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.plausible !== "function") return;
  window.plausible(event, props ? { props } : undefined);
}
