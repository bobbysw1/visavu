import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "working-holiday-by-passport-2026",
  title: "Working Holiday Visa eligibility by passport (the 2026 table)",
  summary:
    "The complete 2026 working-holiday-eligibility table — every Australian / Canadian / Japanese / Korean / NZ working-holiday scheme, every eligible nationality, age limits, and quota size.",
  author: "Visavu editorial",
  publishedAt: "2026-05-17",
  modifiedAt: "2026-05-17",
  tags: ["Working Holiday", "WHV", "Youth Mobility", "Eligibility"],
  readingMinutes: 11,
  heroIso2: "AU",
};

export default function WorkingHolidayTableGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        Working Holiday Visas are among the most accessible long-stay routes for under-30s
        and -35s globally. 12-24 months of work-plus-travel, no employer sponsor required,
        modest application fees. But eligibility is bilateral — your passport must be in the
        destination&apos;s WHV list, and many schemes have annual quotas. Here&apos;s the
        complete 2026 picture.
      </p>

      <h2>TL;DR — major WHV providers and quotas</h2>
      <ul>
        <li>
          <strong>Australia:</strong> Subclass 417 (Working Holiday Maker, Commonwealth + EU)
          + Subclass 462 (Work and Holiday, broader). Age 18-30 (35 for some). 12 months
          extendable to 24-36 with regional work. No fixed cap.
        </li>
        <li>
          <strong>New Zealand:</strong> 40+ bilateral arrangements. Age 18-30/35 depending
          on passport. 12 months (UK extendable to 23). NZ$280-490 fee.
        </li>
        <li>
          <strong>Canada IEC:</strong> 30+ bilateral arrangements. Age 18-30/35. 12-24
          months. CAD$172 fee + biometrics.
        </li>
        <li>
          <strong>UK Youth Mobility Scheme (YMS / Tier 5):</strong> 13 partner countries.
          Age 18-30 (35 for some). 2 years. £298 + £776/yr IHS.
        </li>
        <li>
          <strong>Japan WHV:</strong> 30+ partner countries. Age 18-30. 1 year (sometimes 18
          months for some nationalities). Free or modest fee.
        </li>
        <li>
          <strong>South Korea WHV:</strong> 20+ partner countries. Age 18-30/35. 1 year.
          KRW 56,000 fee.
        </li>
      </ul>

      <h2>Australia (Subclass 417 + 462)</h2>
      <p>
        Two-tier system: Subclass 417 for Commonwealth + select EU nationalities; Subclass
        462 for a broader set with country-specific quotas. AUD$650 (2024).
      </p>
      <p>
        <strong>Subclass 417 (no annual cap):</strong> Belgium, Canada, Cyprus, Denmark,
        Estonia, Finland, France, Germany, Hong Kong (SAR), Ireland, Italy, Japan, Korea
        (Republic of), Malta, Netherlands, Norway, Sweden, Taiwan, UK.
      </p>
      <p>
        <strong>Subclass 462 (annual quotas):</strong> Argentina, Austria, Brazil, Chile,
        China, Czech Republic, Ecuador, Greece, Hungary, India, Indonesia, Israel, Luxembourg,
        Malaysia, Mongolia, Papua New Guinea, Peru, Philippines, Portugal, San Marino,
        Singapore, Slovak Republic, Slovenia, Spain, Switzerland, Thailand, Türkiye, Uruguay,
        USA, Vietnam. Quotas vary by country (USA 5,000/yr; others 100-1,500/yr).
      </p>
      <p>
        <strong>Extension to 24 months:</strong> 88 days of specified regional work in
        designated regional areas extends the visa by 12 months. 88 more days extends to 36
        months total.
      </p>

      <h2>New Zealand WHV</h2>
      <p>
        40+ bilateral arrangements with age limits 18-30 (some up to 35). Costs NZ$280-490
        depending on nationality. 12-month visa with some passports extendable.
      </p>
      <p>
        <strong>23-month WHV (special):</strong> UK passport holders qualify for the 23-month
        WHV (vs the standard 12 months) under the long-standing reciprocal arrangement.
      </p>
      <p>
        <strong>Major eligible nationalities:</strong> UK, Ireland, Germany, France,
        Netherlands, Denmark, Sweden, Norway, Belgium, Italy, Spain, Portugal, Canada, US,
        Japan, South Korea, Singapore, Hong Kong, Taiwan, Argentina, Brazil, Chile, Peru,
        Uruguay, Mexico, Israel, Türkiye, plus ~15 others.
      </p>

      <h2>Canada IEC (International Experience Canada)</h2>
      <p>
        30+ bilateral arrangements; the IEC has three sub-streams: Working Holiday (open
        work permit, no employer required), Young Professionals (employer-specific work
        permit), International Co-op (internship). CAD$172 + biometrics.
      </p>
      <p>
        <strong>Major eligible nationalities:</strong> Australia, Austria, Belgium, Chile,
        Costa Rica, Croatia, Czech Republic, Denmark, Estonia, France, Germany, Greece, Hong
        Kong, Ireland, Italy, Japan, Korea, Latvia, Lithuania, Luxembourg, Mexico, Netherlands,
        NZ, Norway, Poland, Portugal, San Marino, Slovakia, Slovenia, Spain, Sweden,
        Switzerland, Taiwan, UK.
      </p>
      <p>
        <strong>Quotas and pool-based selection:</strong> Each country has an annual quota
        and a pool-based random-draw system. UK applicants face significant competition;
        French and German applicants typically get selected within the first months of the
        year.
      </p>

      <h2>UK Youth Mobility Scheme (YMS / Tier 5)</h2>
      <p>
        13 partner countries with reciprocal arrangements. 2-year visa, no employer
        sponsorship required. £298 application + £776/yr IHS (2024 figure).
      </p>
      <p>
        <strong>Eligible nationalities (Tier 5 YMS):</strong> Australia, Canada, Hong Kong
        (SAR), Iceland, India, Japan, Monaco, New Zealand, San Marino, South Korea, Taiwan,
        Uruguay. Quotas vary by country.
      </p>
      <p>
        <strong>Indian YMS:</strong> Launched 2022 with 3,000/yr quota — heavily
        oversubscribed; ballot-based selection.
      </p>

      <h2>Japan WHV</h2>
      <p>
        30+ partner countries with bilateral arrangements. 1-year visa (18 months for some
        nationalities). Free or modest application fee (~JPY 4,000-6,000).
      </p>
      <p>
        <strong>Major eligible nationalities:</strong> Australia, NZ, Canada, UK, France,
        Germany, Ireland, Denmark, Norway, Sweden, Netherlands, Poland, Czech Republic,
        Slovakia, Hungary, Lithuania, Estonia, Latvia, Portugal, Italy, Spain, Belgium, South
        Korea, Hong Kong (SAR), Taiwan, Argentina, Chile, Uruguay, Iceland.
      </p>

      <h2>South Korea WHV</h2>
      <p>
        20+ partner countries. 1-year visa, KRW 56,000 fee. Age 18-30 (35 for some).
      </p>
      <p>
        <strong>Major eligible nationalities:</strong> Australia, NZ, Canada, UK, France,
        Germany, Ireland, Italy, Netherlands, Belgium, Czech Republic, Spain, Portugal,
        Denmark, Sweden, Austria, Hong Kong (SAR), Taiwan, Argentina, Chile, Israel.
      </p>

      <h2>Ireland WHA</h2>
      <p>
        Ireland&apos;s Working Holiday Authorisation: 12-month visa, partner countries
        Argentina, Australia, Canada, Chile, Hong Kong (SAR), Japan, South Korea, NZ, Taiwan,
        US, Mexico, Czech Republic. Age 18-30/35.
      </p>

      <h2>Germany WHV</h2>
      <p>
        Germany&apos;s Working Holiday agreements: Australia, Canada, Chile, Hong Kong, Japan,
        New Zealand, Korea (Republic), Taiwan, Uruguay, Brazil, Israel. 1-year visa, age
        18-30 (35 for Canadians and Chileans).
      </p>

      <h2>Other notable WHV programmes</h2>
      <ul>
        <li>
          <strong>France:</strong> 14 partner countries (Argentina, Australia, Brazil, Canada,
          Chile, Colombia, Ecuador, Hong Kong, Japan, Mexico, New Zealand, Peru, Korea,
          Taiwan, Uruguay). Age 18-30/35. 12 months.
        </li>
        <li>
          <strong>Sweden, Denmark, Norway, Finland:</strong> Each has 5-10 bilateral
          arrangements, primarily with Argentina, Australia, Canada, Chile, Hong Kong, Japan,
          NZ, South Korea, Taiwan, Uruguay.
        </li>
        <li>
          <strong>Argentina, Chile, Uruguay:</strong> Multi-country bilateral arrangements
          opening South America to European and North American WHV applicants.
        </li>
        <li>
          <strong>Hong Kong (SAR):</strong> Working-holiday partner with ~15 countries. 1-year
          visa.
        </li>
      </ul>

      <h2>Practical guidance</h2>
      <ol>
        <li>
          <strong>Apply early in the visa year.</strong> Quota-limited programmes (Canadian
          IEC, UK YMS, Australian 462) typically fill in the first 1-3 months. Check
          opening-date schedules and apply on day 1 if possible.
        </li>
        <li>
          <strong>Health insurance is mandatory.</strong> Most WHV programmes require
          comprehensive health insurance covering the full visa period. Budget €500-1,500/yr.
        </li>
        <li>
          <strong>Proof of return funds.</strong> Most schemes require evidence of ~AUD$5,000
          / CAD$2,500 / £2,500 in savings to cover early-arrival expenses and a return
          ticket.
        </li>
        <li>
          <strong>Use WHV strategically.</strong> WHV is a low-cost route to test a country
          before committing to a longer-term work visa. Many WHV holders transition to 482 /
          Skilled Worker / Express Entry at the end of the WHV period.
        </li>
        <li>
          <strong>Age cliff matters.</strong> Most programmes cap at 30 (sometimes 35).
          Apply before your 30th / 35th birthday — extensions for in-country holders are
          generous, but new applications past the age limit are not accepted.
        </li>
      </ol>

      <h2>What this guide doesn&apos;t cover</h2>
      <p>
        Specific country-by-country quota updates (these change annually), occupation-specific
        restrictions (some WHVs limit work to certain sectors), or interaction with
        subsequent permanent visa applications. See our broader{" "}
        <Link href="/guides/working-holiday-visas-complete-guide">Working Holiday complete
        guide</Link> for application-process details.
      </p>

      <p className="text-xs text-neutral-500 mt-8">
        Sources: immi.homeaffairs.gov.au Subclass 417 + 462 documentation; New Zealand INZ
        WHV criteria; IRCC International Experience Canada; gov.uk Youth Mobility Scheme;
        MOFA Japan WHV; HiKorea WHV; partner-country bilateral arrangement publications. Last
        updated 2026-05.
      </p>
    </article>
  );
}
