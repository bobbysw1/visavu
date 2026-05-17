/**
 * Opt-out flag shared by PlausibleScript and the user-facing
 * AnalyticsOptOut toggle.
 *
 * Visavu uses Plausible only: cookieless, no cross-site identifiers,
 * no fingerprinting. Plausible does NOT require consent under
 * PECR/GDPR — it falls outside the cookie-consent regime entirely.
 * The opt-out below is offered as a courtesy so users can disable
 * even the anonymous count if they prefer.
 *
 * When opted out, window.plausible is reassigned to a no-op and the
 * tracker <script> is never inserted at page load.
 */

export const OPT_OUT_KEY = "visavu:analytics-optout";
