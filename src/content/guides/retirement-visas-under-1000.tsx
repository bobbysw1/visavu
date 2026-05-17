import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "retirement-visas-under-1000",
  title: "Retirement visas under $1,000/month income: D7, Pensionado, Rentista, and what each actually delivers",
  summary:
    "The most popular passive-income retirement visas — Portugal D7, Costa Rica Pensionado, Mexico Permanente, Panama Pensionado, Spain NLV — at the lowest income thresholds. What qualifies, what gets refused, what to plan for.",
  author: "Visavu editorial",
  publishedAt: "2026-05-17",
  modifiedAt: "2026-05-17",
  tags: ["Retirement", "Passive income", "Portugal", "Spain", "Costa Rica", "Mexico", "Panama"],
  readingMinutes: 11,
  heroIso2: "PT",
};

export default function RetirementVisasGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        Passive-income retirement visas have proliferated since 2010 — Portugal&apos;s D7,
        Costa Rica&apos;s Pensionado, Mexico&apos;s Permanente, Panama&apos;s Pensionado,
        Spain&apos;s Non-Lucrative Visa. The income thresholds are surprisingly accessible —
        often under $1,500/month — making this category open to anyone with a US Social
        Security entitlement, a modest UK State Pension, or comparable. This guide compares
        the most-used at their lowest practical thresholds.
      </p>

      <h2>TL;DR — income thresholds + practical reality</h2>
      <table>
        <thead>
          <tr>
            <th>Visa</th>
            <th>Minimum income</th>
            <th>Initial validity</th>
            <th>To PR</th>
            <th>Tax notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Portugal D7</td>
            <td>~€820/mo (+30% per dependent)</td>
            <td>4 mo entry visa → 2-yr residence card</td>
            <td>5 yrs</td>
            <td>NHR phased out 2024; IFICI is limited</td>
          </tr>
          <tr>
            <td>Costa Rica Pensionado</td>
            <td>US$1,000/mo lifetime pension</td>
            <td>2-yr provisional</td>
            <td>3 yrs</td>
            <td>Territorial; no tax on foreign pension</td>
          </tr>
          <tr>
            <td>Mexico Temporal (Pension)</td>
            <td>~US$3,000/mo (consulate-varies)</td>
            <td>1-4 yrs</td>
            <td>4 yrs → Permanente</td>
            <td>183-day rule for tax residence</td>
          </tr>
          <tr>
            <td>Panama Pensionado</td>
            <td>US$1,000/mo lifetime pension</td>
            <td>Direct to PR</td>
            <td>Direct</td>
            <td>Territorial; no tax on foreign pension</td>
          </tr>
          <tr>
            <td>Spain Non-Lucrative</td>
            <td>~€2,400/mo (400% IPREM)</td>
            <td>1-yr renewable</td>
            <td>5 yrs</td>
            <td>Beckham not available; standard progressive</td>
          </tr>
          <tr>
            <td>Greece Financially Independent Person</td>
            <td>€2,000/mo passive</td>
            <td>2 yrs</td>
            <td>5 yrs</td>
            <td>€100k flat tax option for non-doms</td>
          </tr>
        </tbody>
      </table>

      <h2>Portugal D7 — the lowest income threshold</h2>
      <p>
        Portugal&apos;s D7 (Passive Income Visa) has the lowest published threshold in
        Western Europe — ~€820/mo for the primary applicant (one Portuguese minimum wage),
        +30% per dependent. Sources accepted: pension, investment income, rental income,
        royalties — any reliable foreign-source passive income.
      </p>
      <p>
        <strong>Documentation:</strong> 12 months of bank statements showing consistent
        deposits; tax-residence number (NIF) via Portuguese tax representative; Portuguese
        bank account with 12 months&apos; minimum income deposited; accommodation (12-month
        rental OR property deed); police certificate apostilled; health insurance.
      </p>
      <p>
        <strong>Tax reality:</strong> NHR (Non-Habitual Resident) was the headline tax
        incentive — 10-year window with 0% tax on foreign pension income and 20% flat on
        certain Portuguese-source income. Phased out for new applicants from January 2024.
        IFICI (Tax Incentive Scheme for Scientific Research and Innovation) is the
        replacement — limited to specific high-skilled categories, not retirement-applicable.
      </p>
      <p>
        <strong>What surprises applicants:</strong> the NIF requires a tax representative if
        you don&apos;t live in Portugal yet (~€100-200/yr); SEF processing post-merger into
        AIMA in 2023 has been slow; D7 holders are tax-resident in Portugal from day 1 of
        residence, with worldwide-income reporting obligations.
      </p>

      <h2>Costa Rica Pensionado — US$1,000/month and territorial tax</h2>
      <p>
        Costa Rica&apos;s Pensionado category requires US$1,000/month lifetime pension —
        accepts US Social Security (SSA award letter), private pension awards, government
        pensions. 2-year provisional residence; permanent residence after 3 years; Costa
        Rican citizenship after 7 years (5 for Iberoamericans + Spanish + Portuguese
        nationals).
      </p>
      <p>
        <strong>Territorial tax — the headline benefit:</strong> Costa Rica taxes Costa-
        Rican-source income only. Foreign pension, investment income, royalties are not
        Costa-Rican-taxed. Combined with US-Costa Rica tax treaty avoidance of double
        taxation, the effective tax burden on a US Social Security pension can be very low.
      </p>
      <p>
        <strong>Healthcare:</strong> Pensionado residence requires enrolment in the Caja
        Costarricense de Seguro Social — income-based monthly contribution (typically $50-
        300/mo). English-speaking healthcare available at private hospitals (CIMA, Clinica
        Bíblica) supplementing the Caja.
      </p>
      <p>
        <strong>What surprises applicants:</strong> Caja contribution is mandatory and based
        on declared income — declaring lower legitimate income substantially reduces premium.
        Pensionado does NOT permit work in Costa Rica (passive income only). Spouse + minor
        children included; adult-dependent-children rules vary by case.
      </p>

      <h2>Panama Pensionado — direct to PR, territorial tax, no minimum residence</h2>
      <p>
        Panama&apos;s Pensionado category is arguably the most accessible passive-income
        residence globally: US$1,000/month lifetime pension qualifies; permanent residence
        direct (no provisional period); no minimum stay in Panama; territorial tax exempts
        foreign-source income. Spouse and minor children included.
      </p>
      <p>
        Panama&apos;s programme also offers extensive discounts to Pensionado holders:
        25-50% off domestic transport, 25% off restaurants, 50% off entertainment, 15% off
        hospital bills (no insurance), etc. These are codified in Pensionado Law and apply
        automatically once you hold the residence card.
      </p>
      <p>
        <strong>What surprises applicants:</strong> Pensionado application requires
        translated and apostilled documents; processing 4-8 months end-to-end; no Panamanian
        bank account is required for the application (unlike Portugal&apos;s D7). The
        biggest practical question is whether you want to actually live in Panama or simply
        hold the residence as a backup.
      </p>

      <h2>Mexico Temporal (Pension route) — higher threshold but Permanente fast-track</h2>
      <p>
        Mexico&apos;s Temporal Resident via the Pension category typically requires ~US$3,000/
        month documented income (or ~US$50-70k savings) — substantially higher than Costa
        Rica or Panama. Threshold varies by consulate (Houston, Dallas, LA, DC all publish
        slightly different numbers). 1-4 year Temporal validity; transition to Permanente
        after 4 years; Mexican citizenship after 5 years total.
      </p>
      <p>
        <strong>What surprises applicants:</strong> consulate threshold varies and is
        enforced inconsistently; the consulate you apply at matters. Mexican tax residence
        triggers after 183 days; treaty avoidance with US/Canada/UK exists but cross-border
        accounting is non-trivial. Healthcare via IMSS (public) is available; English-
        speaking private care is widely accessible in major cities.
      </p>

      <h2>Spain Non-Lucrative Visa — €2,400/month, no work permitted</h2>
      <p>
        Spain&apos;s NLV requires ~€2,400/month (400% IPREM for primary applicant, +100% per
        dependent). Initial 1-year visa; renewable to 2-year residence card; 5-year permanent
        residence. NLV explicitly prohibits work in Spain — passive income only.
      </p>
      <p>
        <strong>Tax:</strong> standard Spanish progressive rates (up to 47%). Beckham Law
        flat-tax election (24% flat for 5 years on Spanish-source income) is NOT available for
        NLV holders — only for employment-based residence (DNV, Highly Qualified
        Professional). UK-Spain Double Tax Treaty avoids double taxation on UK pension
        income.
      </p>
      <p>
        <strong>Healthcare:</strong> NLV requires comprehensive private health insurance for
        the full residence period. Post-residence, eligible for state healthcare via convenio
        especial (~€60-150/month per person).
      </p>

      <h2>Common pitfalls across retirement visas</h2>
      <ul>
        <li>
          <strong>UK State Pension freezing.</strong> UK pensioners in some non-EEA countries
          (Costa Rica, Mexico, Panama, Australia, Canada, New Zealand) don&apos;t receive
          annual pension increases. EU/EEA destinations remain uprated. Over 20 years of
          retirement this materially affects income.
        </li>
        <li>
          <strong>Tax-residence cliffs.</strong> 183 days in destination = tax-resident there.
          Plan around the calendar carefully in the first year of residence; cross-border
          accounting is worth professional advice.
        </li>
        <li>
          <strong>Currency exposure.</strong> A USD pension paid into a EUR or CRC account
          fluctuates with exchange rates. Some retirees hedge via multi-currency accounts
          (Wise, Revolut) to smooth monthly income.
        </li>
        <li>
          <strong>Healthcare-transition gaps.</strong> Most countries require private
          insurance during the residence-permit period, with state-healthcare enrolment only
          after a qualifying period. Budget for the gap.
        </li>
        <li>
          <strong>Estate / succession law.</strong> Civil-law jurisdictions (most of Europe
          and Latin America) apply forced-heirship rules to local assets that can override
          your will. Talk to a local estate lawyer.
        </li>
        <li>
          <strong>Visa renewal stalls.</strong> Many of these programmes have processing
          backlogs (Portugal D7 via AIMA has been slow; Spanish NLV varies by consulate).
          Renew early to avoid status gaps.
        </li>
      </ul>

      <h2>What this guide doesn&apos;t cover</h2>
      <p>
        Specific cross-border tax planning, currency-hedging strategies, or
        country-specific estate/succession law. These are areas where qualified cross-border
        tax + estate counsel earns its fee, especially for portfolios with significant
        capital. Most reputable cross-border accountants charge $500-2,000 in the first year
        for setup, less for ongoing.
      </p>

      <p className="text-xs text-neutral-500 mt-8">
        Sources: SEF / AIMA D7 guidelines, Caja Costarricense de Seguro Social premium
        framework, Panama Decree-Law 16 of 1960 (Pensionado), INM México visa categories,
        Spanish Ministry of Foreign Affairs NLV requirements, UK International Pension
        Centre frozen-pensions list, IRS US Foreign Earned Income / FBAR / FATCA guidance.
        Last updated 2026-05.
      </p>
    </article>
  );
}
