import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "family-spouse-visa-checklist",
  title: "Family / spouse / dependent visas: the document checklist by country",
  summary:
    "Every major destination's family-visa pipeline asks for the same five categories of evidence — but the specific documents differ. This is the checklist for UK Spouse, US CR-1/IR-1/K-1, Canada Spousal Sponsorship, Australia Subclass 309/820, and Schengen Family Reunification.",
  author: "Visavu editorial",
  publishedAt: "2026-05-17",
  modifiedAt: "2026-05-17",
  tags: ["Family", "Spouse", "Partner", "Dependent"],
  readingMinutes: 10,
  heroIso2: "GB",
};

export default function FamilyVisaChecklistGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        Spouse, partner, and dependent visas are among the highest-stakes immigration
        applications — refusal often means months of separation and material legal cost. The
        good news: most jurisdictions ask for variations on the same five evidence categories.
        The bad news: the specific documents, formats, and standards vary, and missing a
        single category triggers a refusal. This is the checklist by country.
      </p>

      <h2>The five evidence categories</h2>
      <ol>
        <li>
          <strong>Relationship-establishment evidence:</strong> marriage / civil-partnership /
          common-law / dating-history documentation establishing the relationship is genuine.
        </li>
        <li>
          <strong>Relationship-genuine evidence:</strong> ongoing day-to-day relationship
          beyond the legal status — photos, communication records, joint finances, family
          integration.
        </li>
        <li>
          <strong>Sponsor-eligibility evidence:</strong> sponsor&apos;s nationality / residence
          status + income / financial-sponsorship undertaking.
        </li>
        <li>
          <strong>Applicant-suitability evidence:</strong> applicant&apos;s identity +
          background check + medical (most jurisdictions) + financial-independence proof where
          required.
        </li>
        <li>
          <strong>Apostilled civil documents:</strong> birth, marriage, divorce certificates
          legalised for international use.
        </li>
      </ol>

      <h2>UK Spouse / Partner / Civil Partner visa</h2>
      <p>
        UK Family visa for spouses of British citizens or settled-status holders. 5-year track
        to ILR with 30-month renewals. Salary requirements rising to £38,700 by 2025 in
        stages.
      </p>
      <h3>Documents required:</h3>
      <ul>
        <li>Sponsor&apos;s passport / BRP / settled status documents</li>
        <li>Marriage certificate (apostilled if foreign-issued) OR 2 years cohabitation evidence (joint bills, tenancy, joint bank statements)</li>
        <li>Relationship-development timeline with photos across years; communication records (WhatsApp, video calls during separation)</li>
        <li>Sponsor&apos;s income evidence: 6 months of payslips + employer letter + tax returns OR pension award + bank statements (Sole Reliable Income test for the relevant financial requirement)</li>
        <li>Accommodation evidence: rental contract or property deed + adequate-space declaration</li>
        <li>Applicant&apos;s English-language test (B1 IELTS/PTE; some exemptions)</li>
        <li>TB test from listed countries</li>
        <li>UK Spouse visa fee £1,938 (overseas) + £1,035/year IHS</li>
      </ul>
      <p>
        <strong>Common refusal grounds:</strong> sponsor income insufficient or unclear;
        sponsor's tax returns inconsistent with claimed income; inadequate cohabitation
        evidence for non-married partners; missing TB test from listed nationalities.
      </p>

      <h2>US CR-1 / IR-1 (Spouse) / K-1 (Fiancé)</h2>
      <p>
        US spouse-of-USC visas: CR-1 (conditional, marriage less than 2 years) and IR-1
        (immediate relative, marriage 2+ years) for marriages outside the US. K-1 for
        fiancé(e)s who&apos;ll marry in the US within 90 days of entry.
      </p>
      <h3>Documents required:</h3>
      <ul>
        <li>Petitioner&apos;s USC documents (birth certificate / naturalisation certificate / US passport)</li>
        <li>Marriage certificate (CR-1/IR-1) OR meeting-in-person evidence + intent to marry (K-1)</li>
        <li>Relationship-establishment evidence: courtship timeline, photos, joint travel, family introductions</li>
        <li>Bona-fide marriage evidence (CR-1/IR-1): joint finances, joint property, joint household if cohabited, communication records during separation</li>
        <li>Petitioner&apos;s I-864 Affidavit of Support: 3 years federal tax transcripts + W-2 + employer letter + bank statements (income ≥125% federal poverty threshold for household size; joint sponsor allowed)</li>
        <li>Beneficiary&apos;s DS-260 immigrant visa application + biographical / civil documents</li>
        <li>Apostilled civil documents (birth certificate, prior marriage / divorce certificates, police certificates from every country lived in 12+ months in past 10 years)</li>
        <li>Medical exam at US Embassy-approved panel physician</li>
        <li>Form I-130 fee $675 + DS-260 $325 + Affidavit of Support $120 + medical $300-500</li>
      </ul>
      <p>
        <strong>Common refusal grounds:</strong> insufficient marriage bona-fides
        documentation; petitioner income below 125% threshold without joint sponsor; missing
        apostille on foreign civil documents; misrepresentation discovered at interview.
      </p>

      <h2>Canada Spousal Sponsorship (in-Canada vs outland)</h2>
      <p>
        Canadian Spousal Sponsorship by USC / PR sponsor for spouses, common-law partners, or
        conjugal partners. In-Canada (applicant already in Canada on valid status) or Outland
        (applicant abroad). 12-mo cohabitation establishes common-law status.
      </p>
      <h3>Documents required:</h3>
      <ul>
        <li>Sponsor&apos;s Canadian citizenship / PR documents</li>
        <li>Marriage certificate (apostilled if foreign) OR 12-month cohabitation evidence for common-law</li>
        <li>Relationship evidence: photos, communication, joint finances, joint travel</li>
        <li>Sponsor&apos;s undertaking + financial documents (no formal income threshold for spousal sponsorship; income evidence strengthens credibility)</li>
        <li>Applicant&apos;s civil documents + police certificates + medical exam</li>
        <li>IMM 5532 / IMM 5532E generic application forms + IMM 5476 use of representative if applicable</li>
        <li>Total fees: CAD$1,205 processing + CAD$85 biometrics + CAD$515 right of permanent residence = ~CAD$1,800</li>
      </ul>
      <p>
        <strong>Common refusal grounds:</strong> short courtship + immediate sponsorship
        (fraud-presumption risk); sponsor&apos;s prior refused sponsorship; insufficient
        common-law cohabitation evidence; missing PR /citizen documentation for sponsor.
      </p>

      <h2>Australia Subclass 309 / 820 (Partner visa)</h2>
      <p>
        Australian Partner visa for spouses, de facto partners (12 months cohabitation), or
        registered relationships of Australian citizens / PRs / eligible NZ citizens. 309 is
        offshore (applicant abroad); 820 is onshore (applicant in Australia). Both lead to
        permanent 100 / 801 visas after 2 years.
      </p>
      <h3>Documents required:</h3>
      <ul>
        <li>Sponsor&apos;s Australian citizenship / PR documents</li>
        <li>Marriage certificate OR 12-month de facto cohabitation evidence (joint bills, joint bank, tenancy)</li>
        <li>Form 47SP applicant statutory declaration on the relationship (4 sections: financial, household, social, commitment)</li>
        <li>Form 40SP sponsor statutory declaration</li>
        <li>Two third-party witness Forms 888 attesting to the genuine and continuing relationship</li>
        <li>Photos across the relationship period (10+ photos typical)</li>
        <li>Police certificates from every country lived in 12+ months in past 10 years</li>
        <li>Medical exam at Australian panel physician</li>
        <li>Visa application charge AUD$8,850 (2024 figure)</li>
      </ul>
      <p>
        <strong>Common refusal grounds:</strong> weak Forms 888 from witnesses; financial /
        household / social / commitment sections of statutory declaration insufficient;
        missing de facto cohabitation evidence for non-married partners.
      </p>

      <h2>Schengen Family Reunification (EU member states)</h2>
      <p>
        Family reunification for spouses / children / dependent parents of EU citizens (under
        EU free-movement) or of legally-resident third-country nationals (under each member
        state&apos;s national law implementing the EU Family Reunification Directive). Rules
        vary by member state — this covers the common shape.
      </p>
      <h3>Documents required (typical):</h3>
      <ul>
        <li>EU citizen or sponsor&apos;s residence permit + employment / income evidence</li>
        <li>Marriage certificate / civil-partnership / proof of dependency (for children / parents)</li>
        <li>Relationship-genuineness evidence (varies by member state — some require interview)</li>
        <li>Sponsor&apos;s housing evidence sized for the joining family (some states have specific square-metre standards)</li>
        <li>Sponsor&apos;s health insurance sized for the family</li>
        <li>Applicant&apos;s police certificate apostilled + medical exam (varies)</li>
        <li>Pre-arrival language test in some states (Netherlands, Germany A1; Denmark stricter)</li>
        <li>Apostilled civil documents with sworn translation into the destination language</li>
      </ul>
      <p>
        <strong>Common refusal grounds:</strong> insufficient sponsor income (each member
        state has a minimum, often pegged to social assistance threshold); inadequate
        housing; missing pre-arrival language test; relationship-genuineness concerns from
        interview.
      </p>

      <h2>Apostille and translation — the underrated step</h2>
      <p>
        Foreign civil documents must be apostilled (Hague Convention member states) or
        consular-legalised (non-Hague) for international acceptance. Sworn / certified
        translation by an officially-recognised translator in the destination country is
        usually required.
      </p>
      <ul>
        <li>
          Apostille fees vary: ~$5-25 per document in most countries; cheaper than
          &ldquo;international apostille services&rdquo; that charge 5-10× more.
        </li>
        <li>
          Sworn translation fees: €40-80 per page in EU countries; $50-150 per page in US.
          Some destinations accept translation done in the home country if the translator is
          accredited by the destination&apos;s embassy.
        </li>
        <li>
          Plan 6-12 weeks for apostille + translation + courier. Tight visa-application
          windows that don&apos;t account for this delay trigger preventable refusals.
        </li>
      </ul>

      <h2>What this guide doesn&apos;t cover</h2>
      <p>
        Complex cases — same-sex marriages not recognised in the home jurisdiction, prior
        polygamous marriages, surrogacy-derived parentage, refugees / asylum-seekers, or
        applicants with prior immigration violations. These cases benefit from specialist
        family-immigration counsel; the document checklist above is the baseline, not the
        complete picture for atypical situations.
      </p>

      <p className="text-xs text-neutral-500 mt-8">
        Sources: UK Immigration Rules Appendix FM, US Form I-130 / I-129F instructions,
        IRCC Spousal Sponsorship guide, Australian Subclass 309 / 820 documentation
        requirements, EU Family Reunification Directive 2003/86/EC implementation
        documentation. Last updated 2026-05.
      </p>
    </article>
  );
}
