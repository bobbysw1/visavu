import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Cookie Policy for ${SITE.name}.`,
  alternates: { canonical: absoluteUrl("/cookies") },
  robots: { index: true, follow: false },
};

const LAST_UPDATED = "2026-05-12";

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral dark:prose-invert">
      <Breadcrumbs
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/cookies", label: "Cookies" },
        ]}
      />
      <h1>Cookie Policy</h1>
      <p className="text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>

      <p>
        This page explains how {SITE.name} uses cookies and similar technologies. Our approach
        is to use as few cookies as possible and rely on cookie-free analytics. As a result, we
        do not display a cookie banner — there is no advertising or tracking technology to
        consent to.
      </p>

      <h2>What is a cookie?</h2>
      <p>
        A cookie is a small text file stored on your device when you visit a website. Cookies
        let websites remember preferences and state across pages and visits.
      </p>

      <h2>Cookies we set</h2>

      <h3>Strictly necessary</h3>
      <p>
        These cookies are required for the Service to function and do not require your consent
        under GDPR / PECR.
      </p>
      <div className="not-prose overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="border-b border-neutral-300 dark:border-neutral-700">
              <th className="text-left py-2 pr-4 font-semibold">Name</th>
              <th className="text-left py-2 pr-4 font-semibold">Purpose</th>
              <th className="text-left py-2 pr-4 font-semibold">Type</th>
              <th className="text-left py-2 font-semibold">Lifetime</th>
            </tr>
          </thead>
          <tbody className="text-neutral-700 dark:text-neutral-300">
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <td className="py-2 pr-4 font-mono text-xs">admin_token</td>
              <td className="py-2 pr-4">
                Set only when an authorised admin enters the admin section with a valid key.
                Has no effect for regular visitors.
              </td>
              <td className="py-2 pr-4">First-party, HttpOnly</td>
              <td className="py-2">8 hours</td>
            </tr>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <td className="py-2 pr-4 font-mono text-xs">visavu_currency</td>
              <td className="py-2 pr-4">
                Remembers your preferred display currency (e.g. GBP, EUR, USD) for fee
                conversions across page visits.
              </td>
              <td className="py-2 pr-4">First-party</td>
              <td className="py-2">1 year</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">visavu_locale</td>
              <td className="py-2 pr-4">
                Remembers your preferred display language if you have set one explicitly.
              </td>
              <td className="py-2 pr-4">First-party</td>
              <td className="py-2">1 year</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Analytics</h3>
      <p>
        We use <a href="https://plausible.io" target="_blank" rel="noopener noreferrer">Plausible
        Analytics</a>, which is <strong>cookie-free</strong>. Plausible does not set any cookies
        and does not use cross-site identifiers, fingerprinting, or local storage to track
        users. It counts page views via short-lived hashed IPs that are discarded after the
        request.
      </p>

      <h3>Advertising / third-party tracking</h3>
      <p>
        We do not set advertising cookies, retargeting pixels, or third-party analytics
        trackers. There is no Google Analytics, Facebook Pixel, LinkedIn Insight Tag, or
        equivalent.
      </p>

      <h2>Third-party cookies set by external content</h2>
      <p>
        Some embedded or linked content may set its own cookies once you interact with it.
        These are set by the third party directly under their own privacy policy, not by us.
      </p>
      <ul>
        <li>
          <strong>Google Translate</strong>: only if you click the language toggle in the page
          hero. Google may set its own cookies subject to{" "}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
            Google&apos;s cookie policy
          </a>.
        </li>
        <li>
          <strong>Pexels and jsDelivr (CDNs)</strong>: image requests do not set browser cookies
          but may include standard CDN-edge logging.
        </li>
        <li>
          <strong>Affiliate destinations</strong>: clearly-labelled travel-adjacent partners
          (travel insurance, eSIMs, hotel bookings) may set their own cookies once you click
          through to their site. These cookies are set on the partner&apos;s domain and
          governed by their privacy policy.
        </li>
      </ul>

      <h2>How to control or remove cookies</h2>
      <p>
        You can clear or block cookies through your browser settings. Most browsers allow you
        to clear all cookies, clear cookies for specific sites, or block third-party cookies
        entirely. Blocking strictly-necessary cookies will not break browsing on the public
        Service — the only impact is that your currency / language preference may not persist
        across visits.
      </p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
            Chrome
          </a>
        </li>
        <li>
          <a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer">
            Firefox
          </a>
        </li>
        <li>
          <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">
            Safari
          </a>
        </li>
        <li>
          <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
            Edge
          </a>
        </li>
      </ul>

      <h2>Changes to this policy</h2>
      <p>
        If we change which cookies we use, this page will be updated and the &ldquo;Last
        updated&rdquo; date above will reflect the revision.
      </p>

      <h2>Questions</h2>
      <p>
        For any questions about cookies on this site, use the{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </main>
  );
}
