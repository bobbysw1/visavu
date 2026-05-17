import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "express-entry-vs-skilled-worker-vs-482",
  title: "Express Entry vs UK Skilled Worker vs Australia Subclass 482 — which is fastest in 2026?",
  summary:
    "Three of the world's most-used skilled-migration routes. Different point systems, different employer roles, different time-to-PR. Here's the head-to-head on speed, cost, and what each actually delivers.",
  author: "Visavu editorial",
  publishedAt: "2026-05-17",
  modifiedAt: "2026-05-17",
  tags: ["Skilled migration", "Canada", "United Kingdom", "Australia", "Work"],
  readingMinutes: 12,
  heroIso2: "CA",
};

export default function SkilledMigrationComparisonGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        Canada&apos;s Express Entry, the UK Skilled Worker visa, and Australia&apos;s Subclass
        482 are three of the most-used skilled-migration routes globally. Each works
        differently: Express Entry is self-served and points-driven; UK Skilled Worker is
        employer-sponsored with a salary floor; AU 482 is employer-sponsored with an
        occupation list. This guide compares them on the things that actually matter: time to
        PR, cost end-to-end, and the realistic profile each suits.
      </p>

      <h2>TL;DR comparison</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Canada Express Entry</th>
            <th>UK Skilled Worker</th>
            <th>Australia Subclass 482</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sponsor required?</td>
            <td>No (PNP optional)</td>
            <td>Yes</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Selection</td>
            <td>CRS point lottery</td>
            <td>First-come-first-served</td>
            <td>First-come-first-served</td>
          </tr>
          <tr>
            <td>Salary floor (2024)</td>
            <td>—</td>
            <td>£38,700</td>
            <td>AUD$73,150 (TSMIT)</td>
          </tr>
          <tr>
            <td>Direct to PR?</td>
            <td>Yes</td>
            <td>5-year track</td>
            <td>2-3 yr → ENS 186</td>
          </tr>
          <tr>
            <td>Government fees (single)</td>
            <td>~CAD$1,365</td>
            <td>~£3,940 + £5,175 IHS (5 yr)</td>
            <td>~AUD$4,640</td>
          </tr>
          <tr>
            <td>Citizenship after</td>
            <td>3 yrs physical residence</td>
            <td>12 mo after ILR</td>
            <td>4 yrs incl. 12 mo as PR</td>
          </tr>
        </tbody>
      </table>

      <h2>Canada Express Entry — self-served and points-driven</h2>
      <p>
        Express Entry is Canada&apos;s main economic-immigration channel. Three sub-programmes
        feed it: Federal Skilled Worker (FSW), Canadian Experience Class (CEC), Federal
        Skilled Trades (FST). Applicants score on the Comprehensive Ranking System (CRS) —
        age, education, language test, work experience, adaptability factors. Bi-weekly draws
        invite the top scorers above a cutoff (currently 470-540 depending on draw type) to
        apply for permanent residence.
      </p>
      <p>
        <strong>Time to PR:</strong> ~6 months from Invitation to Apply (ITA) to PR card in
        hand. Profile creation to ITA varies — strong candidates with 500+ CRS get invited
        within weeks; borderline candidates may wait years.
      </p>
      <p>
        <strong>Profile that wins:</strong> bachelor&apos;s+ degree (ideally master&apos;s),
        IELTS 7+/CELPIP 9+ (CLB 9), 3-5 years skilled work experience, age 20-29 (peak
        points), partner with comparable credentials adds significant CRS.
      </p>
      <p>
        <strong>Cost end-to-end:</strong> ECA (WES) CAD$210 + IELTS CAD$320 + Express Entry
        application CAD$1,365 + biometrics CAD$85 + medical exam CAD$300-400 + police checks
        from every country lived in. Total without legal: ~CAD$2,500-3,500.
      </p>
      <p>
        <strong>Best for:</strong> Self-sufficient skilled professionals who score well on CRS
        without an employer sponsor. Avoids employer dependency entirely.
      </p>

      <h2>UK Skilled Worker — employer-sponsored with salary floor</h2>
      <p>
        UK Skilled Worker (formerly Tier 2 General) requires a UK employer with a sponsor
        licence + Certificate of Sponsorship (CoS) + salary at or above the greater of:
        £38,700 (April 2024 baseline) OR the &ldquo;going rate&rdquo; for the role
        (occupation-specific). Some shortage-occupation roles have lower thresholds.
      </p>
      <p>
        <strong>Time to PR:</strong> 5-year track to Indefinite Leave to Remain. Visa
        processing 3-8 weeks from CoS assignment. Citizenship 12 months after ILR.
      </p>
      <p>
        <strong>Profile that wins:</strong> Skilled worker with a UK employer offer at or
        above £38,700, employer holds a sponsor licence, role is on the eligible skilled-worker
        list (RQF level 6 default, with shortage-occupation exceptions). Spouse work-rights
        included.
      </p>
      <p>
        <strong>Cost end-to-end (single applicant, 5-year visa):</strong> CoS £239 + visa
        £719-£1,500 + IHS £1,035/yr (5 yrs = £5,175) + IELTS £170 + biometrics + tuberculosis
        test (some nationalities). Employer typically pays CoS + Skills Charge (£1,000/yr for
        large; £364/yr for small). Total applicant-side: ~£3,000-5,000.
      </p>
      <p>
        <strong>Best for:</strong> Skilled workers with a confirmed UK employer offer, where
        the employer is willing to sponsor. Avoid if your role doesn&apos;t pass the salary
        floor or the going-rate test.
      </p>

      <h2>Australia Subclass 482 — employer-sponsored, occupation-listed</h2>
      <p>
        Subclass 482 (Temporary Skill Shortage, formerly 457) requires an Australian
        Standard Business Sponsor + nomination at an occupation on the relevant Skilled
        Occupation List + salary at or above TSMIT (AUD$73,150 from July 2024). 2- or 4-year
        initial visa depending on stream; transitions to PR via Subclass 186 (Employer
        Nomination Scheme).
      </p>
      <p>
        <strong>Time to PR:</strong> 2-3 years on 482 then transition to 186 ENS (Direct
        Entry stream after 3 yrs OR Temporary Residence Transition stream after 2 yrs).
        Citizenship 4 years total residence including 12 months as PR.
      </p>
      <p>
        <strong>Profile that wins:</strong> Skilled worker with an Australian employer offer
        + nomination, role on the Skilled Occupation List, salary above TSMIT, English
        language test or exempt nationality (UK / US / Canada / NZ / Ireland exempt for some
        purposes), skills assessment from the appropriate authority (Engineers Australia, ACS,
        CPA Australia, etc.).
      </p>
      <p>
        <strong>Cost end-to-end (single, 4-yr visa):</strong> Skills assessment AUD$500-1,200
        + IELTS AUD$420 + 482 application AUD$3,210 (4-yr Medium-Term stream) or AUD$1,330
        (Short-Term) + SAF levy on employer (AUD$3,000-7,200) + medical AUD$300-500 + police
        certificates. Total: ~AUD$4,500-7,500 plus employer&apos;s SAF.
      </p>
      <p>
        <strong>Best for:</strong> Skilled professionals with an Australian employer offer
        and a clear ANZSCO occupation match. Skills In Demand (SID) visa replacing TSS in late
        2024 may shift the dynamics — verify current rules at application time.
      </p>

      <h2>Head-to-head: which is fastest?</h2>
      <ul>
        <li>
          <strong>Fastest to PR:</strong> Canada Express Entry. Direct to PR on a single
          application — 6 months ITA-to-PR if your CRS clears the draw cutoff.
        </li>
        <li>
          <strong>Fastest to citizenship:</strong> Canada (3 years physical residence as PR).
          UK is 5+1 = 6 years; Australia is ~5 years (4 yrs total + 12 mo as PR).
        </li>
        <li>
          <strong>Cheapest end-to-end (5-year horizon):</strong> Canada (no annual IHS-style
          surcharge). UK is most expensive due to IHS over 5 years (~£5,175 alone).
        </li>
        <li>
          <strong>Most employer-flexible:</strong> Canada (no employer dependency on FSW/CEC).
          UK and AU lock you to a sponsor; changing employer requires a new CoS / nomination.
        </li>
      </ul>

      <h2>Profile match — which one fits you</h2>
      <ul>
        <li>
          <strong>You have a strong points profile but no specific job offer:</strong> Canada
          Express Entry is the natural fit.
        </li>
        <li>
          <strong>You have a UK employer wanting to hire you:</strong> UK Skilled Worker.
          Verify the role passes salary floor + going rate before accepting offer.
        </li>
        <li>
          <strong>You have an Australian employer wanting to hire you:</strong> Subclass 482.
          Verify ANZSCO occupation match + skills assessment pathway.
        </li>
        <li>
          <strong>You want maximum employment flexibility post-arrival:</strong> Canada.
          Express Entry PR is portable across employers immediately.
        </li>
        <li>
          <strong>You want long-term tax efficiency:</strong> Australia (no IHS-equivalent
          ongoing surcharge; standard tax-residence). UK has IHS through 5 years to ILR.
        </li>
        <li>
          <strong>You&apos;re a UK Skilled Worker holder considering re-application:</strong>{" "}
          Check if your role still meets the post-April 2024 £38,700 threshold; many
          historically-eligible roles no longer qualify.
        </li>
      </ul>

      <h2>What this guide doesn&apos;t cover</h2>
      <p>
        Provincial Nominee Programmes (Canada — separate streams with different CRS
        thresholds), UK Global Talent / Innovator Founder routes (alternative non-sponsored
        routes), AU points-based 189/190 (alternative to 482 for some profiles), specific
        occupation eligibility rules. Each of these is worth its own analysis for your
        specific profile. See our individual route pages: <Link href="/passport-rankings">
        /passport-rankings</Link> for passport-specific eligibility.
      </p>

      <p className="text-xs text-neutral-500 mt-8">
        Sources: canada.ca/express-entry; gov.uk Skilled Worker visa guidance and Statement of
        Changes April 2024; immi.homeaffairs.gov.au Subclass 482 + 186 + SID Visa transition
        documentation. Last updated 2026-05.
      </p>
    </article>
  );
}
