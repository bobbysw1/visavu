/**
 * Analytics opt-out flag shared by GoogleAnalytics, PlausibleScript, and
 * the user-facing AnalyticsOptOut toggle.
 *
 * Model: tracking ENABLED by default; user can opt out at any time. We
 * keep the flag in localStorage (survives reload, scoped to the device).
 *
 * When opted out:
 *   - Google Analytics: `window['ga-disable-<MEASUREMENT_ID>'] = true`
 *     is set before any gtag tracking call. GA respects this flag and
 *     does not send hits.
 *   - Plausible: `window.plausible` is reassigned to a no-op so custom
 *     events from the codebase silently drop, and the script tag is
 *     never inserted at page load.
 */

export const OPT_OUT_KEY = "visavu:analytics-optout";

export type AnalyticsConsent = "granted" | "denied";

/**
 * Inline script string injected near the top of <head>. Runs synchronously
 * BEFORE the Plausible / GA loader scripts and either sets the disable
 * flag (GA) or short-circuits Plausible. Pre-flight, so no hits leak
 * between page load and consent-check.
 */
export function consentInitScript(gaMeasurementId: string | null): string {
  return `
    try {
      var optedOut = window.localStorage.getItem("${OPT_OUT_KEY}") === "true";
      if (optedOut) {
        ${gaMeasurementId ? `window["ga-disable-${gaMeasurementId}"] = true;` : ""}
        window.__visavu_optout = true;
        // Hard-disable Plausible's queue so any in-flight call no-ops.
        window.plausible = function () {};
      }
    } catch (e) { /* localStorage may be blocked */ }
  `;
}
