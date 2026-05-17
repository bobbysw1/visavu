import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "pr-citizenship-timelines",
  title: "Permanent residency timelines: how long until ILR / PR / Citizenship by country",
  summary:
    "The actual time from first long-stay visa to permanent residence, and then to citizenship, in 25 major destinations. With the integration tests, language thresholds, and gotchas that derail timelines.",
  author: "Visavu editorial",
  publishedAt: "2026-05-17",
  modifiedAt: "2026-05-17",
  tags: ["Permanent residency", "Citizenship", "Naturalisation", "Timelines"],
  readingMinutes: 10,
  heroIso2: "DE",
};

export default function PrCitizenshipTimelinesGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        Time to permanent residence and citizenship varies dramatically — from 1 year
        (Canada Express Entry, PR is direct) to 12+ years (Switzerland naturalisation,
        Singapore PR). This guide compiles the actual rules in 25 major destinations,
        including the integration tests, language thresholds, and the gotchas that derail
        applicants who count years without reading the fine print.
      </p>

      <h2>TL;DR — fastest to citizenship</h2>
      <ul>
        <li>
          <strong>Argentina:</strong> 2 years continuous residence → citizenship (no language
          test). Possibly the fastest naturalisation globally for genuine residents.
        </li>
        <li>
          <strong>Canada:</strong> 1 year PR + ~3 years total physical presence → citizenship.
          PR direct via Express Entry.
        </li>
        <li>
          <strong>Portugal:</strong> 5 years residence → citizenship (A2 Portuguese + clean
          record). CPLP and Sephardic Jewish heritage shorten this further.
        </li>
        <li>
          <strong>Germany:</strong> 5 years residence post-2024 reform (was 8) → citizenship,
          with B1 German + integration evidence. 3 years with exceptional integration.
        </li>
        <li>
          <strong>Spain (Iberoamericans):</strong> 2 years residence → Spanish citizenship.
          Non-Iberoamericans face the standard 10-year track.
        </li>
        <li>
          <strong>France:</strong> 5 years residence → citizenship. 2 years for spouses of
          French citizens.
        </li>
        <li>
          <strong>UK:</strong> 5 years on ILR-eligible visa + 12 months as PR → British
          citizenship. ILR requires Life in the UK test + B1 English.
        </li>
        <li>
          <strong>Australia:</strong> 4 years total residence with at least 12 months as PR →
          Australian citizenship.
        </li>
      </ul>

      <h2>The PR-to-citizenship table</h2>
      <table>
        <thead>
          <tr>
            <th>Country</th>
            <th>First long-stay → PR</th>
            <th>PR → Citizenship</th>
            <th>Language / integration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>United States</td>
            <td>1-12+ yrs (varies by category)</td>
            <td>5 yrs PR (3 if spouse of USC)</td>
            <td>Civics test + basic English</td>
          </tr>
          <tr>
            <td>United Kingdom</td>
            <td>5 yrs on Skilled Worker / Family</td>
            <td>12 mo after ILR</td>
            <td>Life in UK + B1 English</td>
          </tr>
          <tr>
            <td>Canada</td>
            <td>Direct via Express Entry / PNP</td>
            <td>~3 yrs physical presence</td>
            <td>CELPIP/IELTS + civics test</td>
          </tr>
          <tr>
            <td>Australia</td>
            <td>2-3 yrs (482 → 186)</td>
            <td>12 mo as PR + 4 yrs total</td>
            <td>Citizenship test + English</td>
          </tr>
          <tr>
            <td>New Zealand</td>
            <td>2 yrs (SMC route)</td>
            <td>5 yrs as Resident</td>
            <td>English requirement</td>
          </tr>
          <tr>
            <td>Germany</td>
            <td>33 mo (Blue Card + B1) - 5 yrs</td>
            <td>5 yrs post-2024 reform (3 for exceptional)</td>
            <td>B1 German + integration</td>
          </tr>
          <tr>
            <td>France</td>
            <td>5 yrs Carte de résident</td>
            <td>5 yrs (2 yrs if French spouse)</td>
            <td>B1 French + integration interview</td>
          </tr>
          <tr>
            <td>Spain</td>
            <td>5 yrs EU long-term resident</td>
            <td>10 yrs (2 yrs Iberoamerican)</td>
            <td>DELE A2 + CCSE civics</td>
          </tr>
          <tr>
            <td>Italy</td>
            <td>5 yrs EU long-term resident</td>
            <td>10 yrs (4 yrs EU national, jure sanguinis variable)</td>
            <td>B1 Italian + civic knowledge</td>
          </tr>
          <tr>
            <td>Portugal</td>
            <td>5 yrs continuous</td>
            <td>5 yrs (CPLP fast-track varies)</td>
            <td>A2 Portuguese (exemptions for CPLP)</td>
          </tr>
          <tr>
            <td>Netherlands</td>
            <td>5 yrs continuous</td>
            <td>5 yrs (3 yrs if Dutch spouse)</td>
            <td>A2 Dutch + civic integration</td>
          </tr>
          <tr>
            <td>Sweden</td>
            <td>4 yrs (PUT)</td>
            <td>5 yrs (4 yrs Nordic, 2 yrs spouse)</td>
            <td>No formal language test (changing 2026)</td>
          </tr>
          <tr>
            <td>Switzerland</td>
            <td>10 yrs (5 yrs EU/EFTA + USC)</td>
            <td>10 yrs (yrs 8-18 count double)</td>
            <td>B1-B2 cantonal language + integration</td>
          </tr>
          <tr>
            <td>Ireland</td>
            <td>5 yrs Stamp 4 + Long-Term Residence</td>
            <td>5 yrs (3 yrs Irish spouse)</td>
            <td>No formal test (residence-based)</td>
          </tr>
          <tr>
            <td>Japan</td>
            <td>10 yrs (1-3 yrs HSP)</td>
            <td>Generally requires renouncing other nationality</td>
            <td>Japanese language + integration</td>
          </tr>
          <tr>
            <td>South Korea</td>
            <td>5 yrs F-2</td>
            <td>F-5 PR + naturalisation case-by-case</td>
            <td>Korean language + integration</td>
          </tr>
          <tr>
            <td>Singapore</td>
            <td>2 yrs PR (very selective)</td>
            <td>2 yrs PR + strict assessment</td>
            <td>Discretionary</td>
          </tr>
          <tr>
            <td>UAE</td>
            <td>Golden Visa 10-yr renewable</td>
            <td>No traditional naturalisation</td>
            <td>N/A</td>
          </tr>
          <tr>
            <td>Mexico</td>
            <td>4 yrs Temporal</td>
            <td>5 yrs total (2 yrs Iberoamerican)</td>
            <td>Spanish + civics test</td>
          </tr>
          <tr>
            <td>Brazil</td>
            <td>4 yrs Permanência (1 yr family of citizen)</td>
            <td>4 yrs PR (1 yr CPLP/Iberoamerican)</td>
            <td>Portuguese + civics</td>
          </tr>
          <tr>
            <td>Argentina</td>
            <td>3 yrs (2 yrs Mercosur)</td>
            <td>2 yrs of legal continuous residence</td>
            <td>No language test</td>
          </tr>
          <tr>
            <td>Chile</td>
            <td>2 yrs (Definitiva)</td>
            <td>5 yrs continuous residence</td>
            <td>Spanish + civic knowledge</td>
          </tr>
          <tr>
            <td>Costa Rica</td>
            <td>3 yrs (Pensionado/Rentista)</td>
            <td>7 yrs (5 yrs Iberoamerican)</td>
            <td>Spanish + civics</td>
          </tr>
          <tr>
            <td>Panama</td>
            <td>Direct (Friendly Nations)</td>
            <td>5 yrs (3 yrs Spanish/Iberoamerican)</td>
            <td>Spanish + civics</td>
          </tr>
          <tr>
            <td>Saudi Arabia</td>
            <td>Premium Residency (no traditional PR)</td>
            <td>Rarely granted</td>
            <td>N/A</td>
          </tr>
        </tbody>
      </table>

      <h2>Gotchas that derail timelines</h2>
      <ul>
        <li>
          <strong>Physical-presence requirements.</strong> Most countries require physical
          residence (often 6+ months/year), not just legal residence. Long absences abroad
          break the clock. Canada requires 1,095 days of physical presence in any 5-year
          window before citizenship.
        </li>
        <li>
          <strong>Continuous-residence requirements.</strong> Some countries (Germany, UK,
          Spain) require continuous residence with limited absences. Extended trips abroad
          (3+ months single trip; 6+ months cumulative per year) can break continuity.
        </li>
        <li>
          <strong>Visa-status changes.</strong> Switching visa categories may reset the
          clock — UK ILR requires 5 years on ILR-eligible visa types; some categories
          (Student visa, certain dependents) don&apos;t count.
        </li>
        <li>
          <strong>Language-test windows.</strong> Most language tests are valid for 2 years —
          schedule the test in the year you apply for naturalisation, not 5 years before.
        </li>
        <li>
          <strong>Integration / civics tests.</strong> Sweden is reintroducing an integration
          test from 2026; the UK Life in the UK book gets revised every few years;
          Australia&apos;s test has been updated significantly. Check the current version
          before sitting.
        </li>
        <li>
          <strong>Dual-citizenship rules.</strong> Japan, the Netherlands, Singapore, and
          Germany (pre-2024 reform) typically required renouncing original nationality on
          naturalisation. Post-June 2024, Germany allows dual citizenship.
        </li>
        <li>
          <strong>Criminal-record / income / clean-conduct requirements.</strong> A criminal
          conviction or extended period of public benefits in many jurisdictions delays or
          bars naturalisation — even after residence requirements are otherwise met.
        </li>
      </ul>

      <h2>What this guide doesn&apos;t cover</h2>
      <p>
        Specific citizenship-by-descent (jure sanguinis) routes — these vary widely and can
        be much faster than naturalisation for eligible applicants (Italian-descent
        recognition is often 12-24 months; Irish-grandparent route 6-12 months). Country-
        specific PR maintenance rules (e.g. PR holders losing status after extended
        absence). These are areas where a country-specific immigration lawyer earns the fee.
      </p>

      <p className="text-xs text-neutral-500 mt-8">
        Sources: USCIS Naturalization Eligibility, UK Naturalisation guidance (gov.uk),
        IRCC Citizenship requirements (canada.ca), Department of Home Affairs Australian
        Citizenship Act, German Citizenship Act amendments June 2024, Spanish Civil Code on
        Iberoamerican naturalisation, Portuguese Nationality Law, French Code Civil. Last
        updated 2026-05.
      </p>
    </article>
  );
}
