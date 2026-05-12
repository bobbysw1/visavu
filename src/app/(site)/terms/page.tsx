import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${SITE.name}.`,
  alternates: { canonical: absoluteUrl("/terms") },
  robots: { index: true, follow: false },
};

const LAST_UPDATED = "2026-05-12";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral dark:prose-invert">
      <Breadcrumbs
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/terms", label: "Terms" },
        ]}
      />
      <h1>Terms of Service</h1>
      <p className="text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>

      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of {SITE.name}
        {" "}(the &ldquo;Service&rdquo;), available at <Link href="/">{SITE.url}</Link>. By using
        the Service, you agree to these Terms. If you do not agree, do not use the Service.
      </p>

      <h2>1. What the Service is</h2>
      <p>
        {SITE.name} is a free, public website that aggregates visa requirements between countries
        from publicly available government sources, with hand-curated guidance for selected
        high-traffic routes. We do not process visa applications, charge service fees, or accept
        payments for visa-related services.
      </p>

      <h2>2. Not legal advice</h2>
      <p>
        Information on the Service is provided for general informational purposes only. It does
        not constitute legal, immigration, or travel advice and is not a substitute for advice
        from a licensed immigration professional or the destination country&apos;s consular
        authority. See our <Link href="/disclaimer">Disclaimer</Link> for full detail.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service in any way that violates applicable law</li>
        <li>
          Scrape, replicate, or systematically re-distribute substantial portions of the Service
          for commercial purposes without a written licence — modest non-commercial citation
          (with link attribution) is welcome and encouraged
        </li>
        <li>Attempt to disrupt, overload, or gain unauthorised access to the Service or its underlying infrastructure</li>
        <li>Use automated tools to query the Service at a rate that imposes unreasonable load</li>
        <li>Misrepresent your identity or affiliation when contacting us</li>
        <li>
          Use the Service in a way that promotes illegal immigration, visa fraud, or evasion of
          border-control requirements
        </li>
      </ul>

      <h2>4. No warranty</h2>
      <p>
        The Service is provided <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as
        available&rdquo;</strong>. We make reasonable efforts to verify and date information but
        provide no warranty of accuracy, completeness, currency, or fitness for any particular
        purpose. Visa rules change without notice; an answer that was correct when last verified
        may not be correct now.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, {SITE.name} and its operators are not
        liable for any direct, indirect, incidental, consequential, special, exemplary, or
        punitive damages — including but not limited to denied boarding, denied entry, missed
        flights, missed deadlines, lost business opportunities, visa application fees, additional
        legal costs, or any economic loss — arising from your use of or inability to use the
        Service, even if we have been advised of the possibility of such damages.
      </p>
      <p>
        Some jurisdictions do not allow the exclusion of certain warranties or limitations on
        liability, so some of the above limitations may not apply to you. In those jurisdictions,
        our liability is limited to the maximum extent permitted by law.
      </p>

      <h2>6. Third-party links and content</h2>
      <p>
        The Service contains links to government websites, embassies, and other third-party
        resources. We do not control these third parties and are not responsible for their
        content, accuracy, privacy practices, or availability. Following a link to a third-party
        site is at your own risk.
      </p>

      <h2>7. Intellectual property</h2>
      <p>
        The Service&apos;s code, design, hand-written editorial content, and curated data
        compilations are the intellectual property of {SITE.name}. Underlying facts (visa class
        names, fees, government policies) are not copyrightable — only our editorial presentation
        and curation is. You may cite individual answers with a link back to the source page on
        the Service. You may not republish bulk content without written permission.
      </p>
      <p>
        Country names, flag imagery, and government source materials are used in their public
        capacity. Hero photography is sourced under Pexels licence. Country silhouettes are
        sourced from the open-source <code>djaiss/mapsicon</code> dataset.
      </p>

      <h2>8. Affiliate and monetisation disclosure</h2>
      <p>
        The Service is free to use. We may earn affiliate commissions from clearly-labelled
        recommendations for travel-adjacent products (travel insurance, eSIMs, hotel bookings).
        These commissions do not affect the visa information we publish. We do not accept
        payment to feature or promote any specific visa, immigration service, or jurisdiction
        in our editorial content. See our <Link href="/disclosure">Disclosure</Link> page for
        detail.
      </p>

      <h2>9. Changes to the Service</h2>
      <p>
        We may add, modify, suspend, or discontinue any part of the Service at any time without
        notice. We may also update these Terms; the &ldquo;Last updated&rdquo; date above
        reflects the most recent revision. Continued use of the Service after changes to the
        Terms constitutes acceptance of the revised Terms.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may restrict or terminate access to the Service for any user who violates these
        Terms, abuses the Service, or causes harm to other users. Sections that by their nature
        survive termination (including liability limitations, intellectual-property provisions,
        and the no-warranty disclaimer) will continue to apply after termination.
      </p>

      <h2>11. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of England and Wales. Any dispute arising from or
        relating to the Service shall be resolved exclusively in the courts of England and Wales,
        except where mandatory consumer-protection laws in your jurisdiction grant you the right
        to bring proceedings in your local courts.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms can be sent via our <Link href="/contact">contact page</Link>.
      </p>
    </main>
  );
}
