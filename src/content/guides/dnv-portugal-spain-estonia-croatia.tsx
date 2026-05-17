import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "dnv-portugal-spain-estonia-croatia",
  title: "Digital Nomad Visas compared: Portugal vs Spain vs Estonia vs Croatia",
  summary:
    "Four of the most-used DNV programmes for remote workers in 2026. Income thresholds, tax treatment, PR/citizenship track, healthcare, and the practical realities of relocating to each.",
  author: "Visavu editorial",
  publishedAt: "2026-05-17",
  modifiedAt: "2026-05-17",
  tags: ["Digital Nomad", "Remote work", "Portugal", "Spain", "Estonia", "Croatia"],
  readingMinutes: 11,
  heroIso2: "PT",
};

export default function DnvComparisonGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        Portugal, Spain, Estonia, and Croatia all run dedicated Digital Nomad Visa programmes
        for remote workers earning foreign-source income. Headline thresholds look similar
        (~€2,800-3,500/month). But the underlying tax treatment, healthcare arrangements, and
        residence-to-citizenship paths differ materially. Here&apos;s the side-by-side.
      </p>

      <h2>TL;DR comparison</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Portugal D8</th>
            <th>Spain DNV</th>
            <th>Estonia DNV</th>
            <th>Croatia DNV</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monthly income</td>
            <td>€3,480 (4× minimum wage)</td>
            <td>€2,762 (200% IPREM)</td>
            <td>€4,500 gross</td>
            <td>€2,300 (no fixed; ~€28k/yr)</td>
          </tr>
          <tr>
            <td>Initial validity</td>
            <td>1 yr + 2-yr renewal</td>
            <td>1 yr + 3-yr residence card</td>
            <td>1 yr</td>
            <td>1 yr (non-renewable; reapply after 6 mo)</td>
          </tr>
          <tr>
            <td>Path to PR</td>
            <td>5 yrs</td>
            <td>5 yrs</td>
            <td>No PR pathway via DNV (separate residence)</td>
            <td>5 yrs continuous (DNV doesn&apos;t count)</td>
          </tr>
          <tr>
            <td>Tax treatment</td>
            <td>NHR phased out 2024; IFICI is limited; standard progressive rates apply</td>
            <td>Beckham Law: 24% flat on Spanish-source income for 4 yrs</td>
            <td>Standard 20% flat tax (if Estonian tax resident)</td>
            <td>No Croatian taxation on foreign income during DNV period</td>
          </tr>
          <tr>
            <td>Healthcare</td>
            <td>SNS after residence; private during transition</td>
            <td>Private mandatory; convenio especial post-residence</td>
            <td>Estonian e-residency healthcare via national fund</td>
            <td>Private mandatory (HZZO option after residence)</td>
          </tr>
          <tr>
            <td>Family inclusion</td>
            <td>Spouse + dependent children</td>
            <td>Spouse + dependent children</td>
            <td>Spouse + dependent children</td>
            <td>Spouse + dependent children</td>
          </tr>
        </tbody>
      </table>

      <h2>Portugal D8 — the Lisbon / Porto / Madeira favourite</h2>
      <p>
        Portugal&apos;s D8 launched 2022 and is among the most-applied-to DNVs globally.
        Income threshold: ~€3,480/month from foreign-source clients (4× Portuguese minimum
        wage). 1-year initial visa renewable to 2-year residence card; permanent residence
        after 5 years; Portuguese citizenship after 5 years with A2 Portuguese.
      </p>
      <p>
        <strong>Tax reality:</strong> NHR was phased out for new applicants from January
        2024. The IFICI replacement is limited to specific high-skilled categories — most DNV
        applicants don&apos;t qualify. Standard Portuguese progressive rates (up to 48%) now
        apply to D8 holders who become tax-resident.
      </p>
      <p>
        <strong>Healthcare:</strong> Portuguese SNS (state healthcare) becomes available once
        you have residence; private bridging insurance is required for the visa-application
        period.
      </p>
      <p>
        <strong>Practical notes:</strong> Portuguese NIF (tax number) via Portuguese tax
        representative before applying — €100-200/yr ongoing. SEF / AIMA processing has been
        slow (3-6 months for initial application). Lisbon and Porto have substantial English-
        speaking expat communities; Madeira has the &ldquo;Digital Nomad Village&rdquo;
        infrastructure subsidised by the regional government.
      </p>

      <h2>Spain DNV — Beckham Law is the differentiator</h2>
      <p>
        Spain&apos;s DNV launched 2023 with a lower income threshold (€2,762/month) than
        Portugal&apos;s D8. 1-year initial visa renewable to 3-year residence card; permanent
        residence after 5 years; Spanish citizenship after 10 years (or 2 years for
        Iberoamerican / Spanish-speaking applicants under the Iberoamerican framework).
      </p>
      <p>
        <strong>Tax reality:</strong> DNV holders can elect Beckham Law (the Special Tax
        Regime for Inbound Workers) — 24% flat tax on Spanish-source income up to €600k for
        the first 4 years. Foreign-source income is exempt during this period. Significant
        savings for high earners.
      </p>
      <p>
        <strong>Healthcare:</strong> Private insurance is mandatory during the visa period.
        Post-residence, eligible for state healthcare via convenio especial (~€60-150/month).
      </p>
      <p>
        <strong>Practical notes:</strong> Madrid, Barcelona, Valencia, Málaga have strong
        DNV-friendly co-working ecosystems. Spanish DNV processing typically 1-3 months at
        consulate; apply from US/Canada/UK/Australia before relocating to avoid in-Spain
        complexity.
      </p>

      <h2>Estonia DNV — the e-residency advantage</h2>
      <p>
        Estonia&apos;s DNV launched 2020 and was the first formal European DNV. Income
        threshold: €4,500/month gross (highest of the four). 1-year visa, not renewable —
        intended as time-limited rather than residence-trajectory.
      </p>
      <p>
        <strong>Tax reality:</strong> Estonia has a 20% flat income-tax rate. If you spend
        183+ days in Estonia in a year you become Estonian tax-resident — but the DNV is
        often used for &lt;183 days, keeping tax residence elsewhere. The Estonian
        e-Residency programme is separate (online ID for company-formation) and doesn&apos;t
        grant physical residence rights.
      </p>
      <p>
        <strong>Healthcare:</strong> Estonian Health Insurance Fund (HEIF) coverage for
        Estonian tax-residents; private insurance during shorter DNV stays.
      </p>
      <p>
        <strong>Practical notes:</strong> Tallinn has strong digital-government infrastructure
        — most administrative tasks are online via the e-Residency portal. The DNV is a
        relatively niche choice — most applicants who want EU residence + DNV trajectory
        choose Portugal or Spain instead.
      </p>

      <h2>Croatia DNV — the no-Croatian-tax favourite</h2>
      <p>
        Croatia&apos;s DNV launched 2021. Income threshold: ~€2,300/month (roughly €28k/yr).
        1-year visa, non-renewable in the same period — you must leave Croatia for 6 months
        before reapplying.
      </p>
      <p>
        <strong>Tax reality:</strong> The headline benefit — Croatian DNV holders are NOT
        Croatian tax-resident on foreign-source income during the DNV period. This is
        codified in the DNV-specific regulation; foreign-source earnings don&apos;t enter
        Croatian taxable income.
      </p>
      <p>
        <strong>Healthcare:</strong> Private insurance mandatory during the DNV. Croatian
        HZZO (state insurance) requires standard residence pathway, not DNV.
      </p>
      <p>
        <strong>Practical notes:</strong> Split, Zagreb, Dubrovnik, Zadar have decent
        co-working infrastructure. Croatia joined Schengen 1 Jan 2023 — DNV holders enjoy
        Schengen visa-free travel during the residence period.
      </p>

      <h2>Common pitfalls across DNVs</h2>
      <ul>
        <li>
          <strong>183-day tax-residence cliffs.</strong> 183+ days in destination = tax-
          resident there. The Croatian DNV is the only one with a regulatory exemption from
          foreign-income tax. Others depend on the standard 183-day rule.
        </li>
        <li>
          <strong>Foreign-source income definition.</strong> All four DNVs require the income
          source to be non-domestic — Portuguese clients invoicing a Portuguese-resident DNV
          holder typically don&apos;t count. Restructure invoicing to non-destination clients
          if needed.
        </li>
        <li>
          <strong>Renewals are the choke point.</strong> Estonian DNV is non-renewable;
          Croatian requires 6-month gap; Portuguese and Spanish renew within the residence
          card framework but require continuing income evidence.
        </li>
        <li>
          <strong>Health-insurance compliance.</strong> Most generic travel insurance does
          NOT meet long-stay-visa requirements. Compliant DNV health insurance from
          recognised global underwriters starts at ~€100-200/month per adult — compare
          independently.
        </li>
        <li>
          <strong>Cross-border tax planning.</strong> US persons retain worldwide tax
          obligations regardless of where they live. UK persons retain UK tax-residence
          based on the Statutory Residence Test. Talk to a cross-border CPA in the first
          year — it&apos;s usually worth €500-1,500.
        </li>
      </ul>

      <h2>Which one suits you</h2>
      <ul>
        <li>
          <strong>Pick Portugal D8</strong> if you want a clear 5-year track to citizenship
          and like Lisbon / Porto / Madeira lifestyle. Best for genuine relocation, not
          tax-optimisation.
        </li>
        <li>
          <strong>Pick Spain DNV</strong> if you&apos;re a high earner who&apos;ll benefit
          from Beckham Law&apos;s 24% flat tax. Also if you&apos;re Iberoamerican (2-year
          citizenship route).
        </li>
        <li>
          <strong>Pick Estonia DNV</strong> if you want short-term EU residence with light
          administrative overhead and you&apos;re already familiar with Estonia&apos;s
          digital-government infrastructure.
        </li>
        <li>
          <strong>Pick Croatia DNV</strong> if you want to avoid destination-country tax on
          foreign income and you&apos;re comfortable with the 1-year-then-6-month-gap cycle.
        </li>
      </ul>

      <p className="text-xs text-neutral-500 mt-8">
        Sources: Portuguese SEF/AIMA D8 framework; Spanish Law 28/2022 (Startups Law)
        DNV criteria; Estonian Aliens Act DNV provisions; Croatian Act on Foreigners (DNV).
        See also our broader <Link href="/guides/digital-nomad-visas-how-to-choose">DNV
        choice guide</Link>. Last updated 2026-05.
      </p>
    </article>
  );
}
