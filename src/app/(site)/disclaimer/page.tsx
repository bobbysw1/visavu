import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Important disclaimers and limitations of liability for ${SITE.name}.`,
  alternates: { canonical: absoluteUrl("/disclaimer") },
  robots: { index: true, follow: false },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral dark:prose-invert">
      <Breadcrumbs crumbs={[{ href: "/", label: "Home" }, { href: "/disclaimer", label: "Disclaimer" }]} />
      <h1>Disclaimer</h1>
      <p>
        {SITE.name} provides aggregated information about visa requirements between countries.
        This information is provided <strong>for general informational purposes only</strong> and
        does not constitute legal, immigration, or travel advice.
      </p>

      <h2>Not legal advice</h2>
      <p>
        Visa rules change without notice. Bilateral agreements, sanctions, regional policies, and
        individual circumstances may affect whether a visa is required, what it costs, and how
        long you can stay. Nothing on this site should be treated as a substitute for advice from
        a licensed immigration professional or the destination country&apos;s consular authority.
      </p>

      <h2>High-stakes visa types: work, study, partner / family</h2>
      <p>
        Information about long-stay visas (work, student, partner / family) is provided to help
        you orient yourself before consulting a qualified adviser. These visa decisions affect
        your right to live, work, study, or remain with family — the consequences of acting on
        incorrect information are <strong>severe</strong>. Salary thresholds, eligible occupations,
        sponsor requirements, English-language requirements, and processing times all change with
        immigration policy updates that may not yet be reflected here.
      </p>
      <p>
        Before accepting a job offer, enrolling in an institution, applying for a partner visa,
        or making relocation plans, <strong>verify the current rules with the destination
        country&apos;s immigration authority and, where appropriate, a registered immigration
        adviser</strong> (e.g. OISC in the UK, MARA in Australia, ICCRC in Canada).
      </p>

      <h2>Diplomatic and official travel</h2>
      <p>
        Diplomatic and service-passport visa rules are governed by bilateral agreements and the
        accreditation processes of the issuing ministry of foreign affairs. The information here
        is not a substitute for clearance from your foreign-affairs ministry or the destination
        country&apos;s diplomatic protocol service.
      </p>

      <h2>Border officer discretion</h2>
      <p>
        A valid visa, eTA, or visa-free entitlement <strong>permits entry subject to officer
        discretion at the border</strong>. Border officers may deny entry for reasons including
        but not limited to: insufficient funds, lack of onward ticket, criminal record, prior
        immigration violations, or any reason the officer deems consistent with the
        destination&apos;s entry policy.
      </p>

      <h2>Verify before travel</h2>
      <p>
        Always verify visa requirements with the destination country&apos;s embassy or consulate
        before booking travel — particularly if your situation involves dual nationality, recent
        criminal record, unusual travel history, or you are traveling for a purpose other than
        short-term tourism.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        {SITE.name} makes reasonable efforts to verify and date all information, but provides no
        warranty of accuracy, completeness, or fitness for any particular purpose. To the maximum
        extent permitted by law, {SITE.name} and its operators are not liable for any direct,
        indirect, incidental, consequential, or punitive damages arising from the use or
        inability to use this site, including but not limited to denied boarding, denied entry,
        missed travel, additional fees, or loss of business.
      </p>

      <h2>Confidence labels</h2>
      <p>
        Confidence labels (High, Medium, Low, Unverified) are heuristic indicators based on
        cross-source agreement and freshness. They are not statistical confidence intervals and
        should not be interpreted as guarantees.
      </p>

      <h2>Report inaccuracies</h2>
      <p>
        If you spot incorrect information, please use the &ldquo;Report incorrect info&rdquo; link
        on any result card. We triage user reports and correct verified inaccuracies as quickly
        as practical.
      </p>
    </main>
  );
}
