import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE.name}.`,
  alternates: { canonical: absoluteUrl("/privacy") },
  robots: { index: true, follow: false },
};

const LAST_UPDATED = "2026-05-12";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral dark:prose-invert">
      <Breadcrumbs
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/privacy", label: "Privacy" },
        ]}
      />
      <h1>Privacy Policy</h1>
      <p className="text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>

      <p>
        This Privacy Policy explains what personal data {SITE.name} collects, how we use it, and
        the rights you have over it. {SITE.name} is operated as a public information service.
        Our default posture is to collect as little personal data as possible.
      </p>

      <h2>What we collect</h2>
      <p>
        We do not require an account to use the Service. We do not collect names, email addresses,
        phone numbers, payment details, government identifiers, or any visa-application data. We
        explicitly do not want — and ask that you do not submit — sensitive details such as
        passport numbers, financial-account information, or medical records.
      </p>

      <h3>1. Pages you visit (analytics)</h3>
      <p>
        We use <a href="https://plausible.io" target="_blank" rel="noopener noreferrer">Plausible
        Analytics</a> to understand which pages and features are useful. Plausible is
        cookie-free, does not use cross-site identifiers, does not build personal profiles, and
        is fully GDPR / PECR / CCPA compliant by design. Data collected: URL visited, referrer,
        approximate country derived from IP (the IP itself is hashed and discarded), browser
        type, screen-size bucket, and time on page. Aggregated only — no individual session
        records are retained.
      </p>

      <h3>2. Preference cookies</h3>
      <p>
        If you change your displayed currency, language, or visit an admin route with a valid
        token, we may set a small first-party cookie to remember that preference across pages.
        See our <Link href="/cookies">Cookie Policy</Link> for the complete list and how to
        clear them.
      </p>

      <h3>3. Voluntary correspondence</h3>
      <p>
        If you contact us (via the <Link href="/contact">contact page</Link>, by email, or by
        using a &ldquo;Report incorrect info&rdquo; link) we receive whatever you choose to
        send. We use that information solely to respond to your message and improve the
        accuracy of the Service. We do not add your address to a marketing list.
      </p>

      <h3>4. Server access logs</h3>
      <p>
        Our hosting provider (Vercel) records standard HTTP request logs for security and
        debugging — IP address, request URL, user-agent, response status, and timestamp. These
        logs are retained for a short period (typically 24-72 hours) and are not used for
        profiling.
      </p>

      <h2>What we do NOT do</h2>
      <ul>
        <li>We do not sell your data to anyone, ever.</li>
        <li>We do not run third-party advertising or remarketing pixels.</li>
        <li>We do not use Google Analytics, Facebook Pixel, or similar trackers.</li>
        <li>We do not build profiles, lookalike audiences, or behavioural segments.</li>
        <li>We do not share data with data brokers.</li>
      </ul>

      <h2>Third-party services we rely on</h2>
      <p>
        These services receive limited data inherent to serving you content. We have selected
        them for their privacy practices and minimise the data they receive.
      </p>
      <ul>
        <li>
          <strong>Vercel</strong> (hosting): receives HTTP request data and access logs. See{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            Vercel&apos;s privacy policy
          </a>.
        </li>
        <li>
          <strong>Plausible Analytics</strong> (analytics): cookie-free, GDPR-compliant. See{" "}
          <a href="https://plausible.io/privacy" target="_blank" rel="noopener noreferrer">
            Plausible&apos;s privacy policy
          </a>.
        </li>
        <li>
          <strong>Pexels</strong> (hero images): images are served via their CDN; standard
          image-request logs apply. See{" "}
          <a href="https://www.pexels.com/privacy-policy/" target="_blank" rel="noopener noreferrer">
            Pexels&apos; privacy policy
          </a>.
        </li>
        <li>
          <strong>Google Fonts</strong> (Inter, Newsreader): font files served self-hosted via
          our Next.js setup; no direct Google request from your browser.
        </li>
        <li>
          <strong>Google Translate proxy</strong> (optional, only if you click a language
          toggle): translates the visible page in your browser. Google receives the page URL
          and may set its own cookies subject to its{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            privacy policy
          </a>.
        </li>
        <li>
          <strong>jsDelivr</strong> (country silhouettes from the open-source
          {" "}<code>djaiss/mapsicon</code> dataset): standard CDN image requests.
        </li>
      </ul>

      <h2>International data transfers</h2>
      <p>
        Vercel and Plausible are based outside your jurisdiction in some cases. Data transfers
        rely on the standard contractual safeguards each provider has in place. Plausible
        specifically processes EU-visitor data in the EU.
      </p>

      <h2>Your rights (GDPR, UK GDPR, CCPA, and similar)</h2>
      <p>Depending on your jurisdiction, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> the personal data we hold about you (if any)</li>
        <li><strong>Correct</strong> inaccurate data</li>
        <li>
          <strong>Erase</strong> your data — note that because we hold so little personal data
          (typically none beyond a preference cookie in your own browser), there is rarely
          anything to erase server-side
        </li>
        <li><strong>Object</strong> to processing</li>
        <li><strong>Withdraw consent</strong> for any consented processing</li>
        <li>
          <strong>Lodge a complaint</strong> with your data-protection regulator (the UK
          Information Commissioner&apos;s Office, your EU member state&apos;s DPA, or the
          California Attorney General, as applicable)
        </li>
      </ul>
      <p>
        To exercise any of these rights, contact us via the{" "}
        <Link href="/contact">contact page</Link>.
      </p>

      <h2>Children</h2>
      <p>
        The Service is not directed at children under 16 and we do not knowingly collect data
        from children. If you believe a child has provided us personal information, please
        contact us and we will delete it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy as the Service evolves. The &ldquo;Last updated&rdquo;
        date above reflects the most recent revision. Material changes will be highlighted on
        the homepage or via a banner on this page.
      </p>

      <h2>Contact us about privacy</h2>
      <p>
        Questions about this policy or your data can be sent via the{" "}
        <Link href="/contact">contact page</Link>. We aim to respond to data-rights requests
        within 30 days.
      </p>
    </main>
  );
}
