/**
 * Google Analytics 4 (gtag.js) loader.
 *
 * Sits alongside the existing PlausibleScript in (site)/layout.tsx — so
 * /admin/*, /embed/*, /api/*, /og, sitemap, and robots are all
 * deliberately excluded, same as Plausible.
 *
 * Measurement ID defaults to the production property `G-JVHR3D6YJQ`. To
 * point a preview branch at a different property, set
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel project env vars.
 *
 * Privacy note: GA4 uses cookies + IP processing. The current default
 * here is "track on load" matching the snippet supplied by the user. If
 * you ever need EU/UK cookie-consent gating, swap this for Google
 * Consent Mode v2 (set `analytics_storage: 'denied'` by default and
 * flip via the cookie banner). Plausible continues to handle the
 * privacy-friendly side regardless.
 */
import Script from "next/script";
import { consentInitScript } from "@/lib/analyticsConsent";

const DEFAULT_GA_ID = "G-JVHR3D6YJQ";

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? DEFAULT_GA_ID;
  if (!id) return null;
  return (
    <>
      {/* Consent init: regular inline <script> (NOT next/script) so it
          executes synchronously during HTML parse, guaranteed before the
          async gtag.js library finishes loading. Reads the localStorage
          opt-out flag and sets window["ga-disable-<id>"] which GA
          respects — no hits leak if the user has opted out. Same script
          also neutralises Plausible. */}
      <script dangerouslySetInnerHTML={{ __html: consentInitScript(id) }} />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
