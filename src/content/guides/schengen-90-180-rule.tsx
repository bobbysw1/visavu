import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "schengen-90-180-rule",
  title: "The Schengen 90/180 rule, explained — calculator method and the mistakes that cost holidays",
  summary:
    "The Schengen short-stay limit isn't 'three months out of every six'. It's a rolling-window calculation that catches even experienced travellers. Here's how it actually works, the calculator you need, and the patterns that trigger overstay fines.",
  author: "Visavu editorial",
  publishedAt: "2026-05-17",
  modifiedAt: "2026-05-17",
  tags: ["Schengen", "Short stay", "Rules"],
  readingMinutes: 9,
  heroIso2: "FR",
};

export default function Schengen90180Guide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        Visa-exempt travellers to the Schengen Area can stay 90 days in any rolling 180-day
        period. That sentence is short, easy to remember, and gets people into trouble
        constantly. The actual mechanic is a backwards-looking calculation that counts every
        Schengen day you&apos;ve spent in the past 180 — and from late 2025 the EU Entry/Exit
        System (EES) automates the enforcement.
      </p>

      <h2>TL;DR</h2>
      <ul>
        <li>
          <strong>The rule:</strong> Maximum 90 days inside the Schengen Area in any rolling
          window of 180 days, calculated on every entry and exit.
        </li>
        <li>
          <strong>Who it applies to:</strong> Visa-exempt nationalities (US, UK, Canada,
          Australia, NZ, Japan, South Korea, Singapore, GCC nationals, most Latin America). Long-stay
          D-class visa or residence permit holders are separate — those days don&apos;t count.
        </li>
        <li>
          <strong>Common mistake:</strong> Thinking &ldquo;3 months out of every 6&rdquo; means
          you can be in for 90, out for 90, and back in for 90. You can&apos;t — the second
          90-day block would be inside the prior 180-day window.
        </li>
        <li>
          <strong>How it&apos;s enforced from late 2025:</strong> EES (Entry/Exit System)
          records every Schengen entry biometrically. Overstays are flagged automatically and
          shared across all member-state borders.
        </li>
        <li>
          <strong>Penalty:</strong> Fines (varies by member state, typically €500-1,200), entry
          ban (1-5 years for serious overstays), refused boarding for future trips.
        </li>
      </ul>

      <h2>How the calculation actually works</h2>
      <p>
        On any given day you&apos;re considering entering Schengen, count back 180 days. Count
        every day you spent inside Schengen in that window. If adding the upcoming trip would
        push that count over 90, the trip is too long — or you&apos;d need to wait until older
        Schengen days &ldquo;age out&rdquo; of the 180-day window before the next entry.
      </p>
      <p>
        Both arrival and departure days count as &ldquo;in Schengen&rdquo; days. Days spent
        outside Schengen (UK, Ireland, Croatia until 2023, Romania/Bulgaria until 2025, and any
        non-Schengen country) don&apos;t count toward the 90.
      </p>
      <p>
        The official EU calculator lives at{" "}
        <a
          href="https://ec.europa.eu/home-affairs/policies/schengen-borders-and-visa/short-stay-visa-calculator_en"
          target="_blank"
          rel="noreferrer noopener"
        >
          home-affairs.ec.europa.eu/short-stay-visa-calculator
        </a>{" "}
        — use it before booking, especially if you&apos;ve had multiple Schengen trips in the
        past 6 months.
      </p>

      <h2>The four mistakes that cost holidays</h2>
      <h3>Mistake 1: &ldquo;90 days at a time&rdquo;</h3>
      <p>
        The most common misreading. Someone spends 80 days in Spain, leaves for a week to the
        UK, then plans 60 days in Italy. They assume the trip resets because they left
        Schengen. It doesn&apos;t. The 80 prior days are still inside the 180-day window —
        adding 60 more is 140 days total. Italy entry refused, or worst case, entry granted and
        an overstay fine on exit.
      </p>

      <h3>Mistake 2: &ldquo;Croatia / Romania / Bulgaria don&apos;t count&rdquo;</h3>
      <p>
        Pre-Schengen these three countries had separate short-stay regimes. Croatia joined
        Schengen 1 January 2023; Romania and Bulgaria joined for air/sea 31 March 2024 and for
        land 1 January 2025. Time spent in any of them now counts toward your Schengen 90.
        Travellers planning around the old rules get caught by the new accession.
      </p>

      <h3>Mistake 3: &ldquo;The clock resets when I cross out of Schengen&rdquo;</h3>
      <p>
        It doesn&apos;t. The 180-day window is calculated backwards from the day you&apos;re
        currently considering. Crossing in and out of Schengen doesn&apos;t change the count of
        prior in-Schengen days — those days are baked in until they age out of the window.
      </p>

      <h3>Mistake 4: &ldquo;Long-stay national visa days count toward the 90&rdquo;</h3>
      <p>
        They don&apos;t. If you hold a long-stay D-class visa or residence permit from any
        Schengen member state, the time on that permit doesn&apos;t count toward the 90/180 rule
        — you&apos;re a resident, not a short-stay visitor. But the day your residence permit
        expires, you&apos;re back in 90/180-rule territory until you leave Schengen and the
        prior 180-day window has aged out.
      </p>

      <h2>What EES changes from late 2025</h2>
      <p>
        Before EES, enforcement was passport-stamp-based and inconsistent. Border officers
        occasionally added up stamps but rarely with enthusiasm; airline check-in didn&apos;t
        verify the count. Travellers who under-counted got away with it.
      </p>
      <p>
        EES replaces stamps with biometric entry/exit records, automatically computed against
        the 90/180 limit, and visible to every member-state border officer in real time. Airline
        check-in systems will increasingly query EES at boarding; the bar for &ldquo;they
        won&apos;t notice&rdquo; rises sharply.
      </p>
      <p>
        Practical implication: travellers who run close to the 90-day limit on multiple trips
        per year need to use the EU calculator or a personal tracker. The era of
        approximation is ending.
      </p>

      <h2>ETIAS layered on top from late 2026</h2>
      <p>
        ETIAS — the Schengen authorisation system for visa-exempt nationals — launches Q4 2026.
        ETIAS is a separate pre-travel authorisation (€7 fee, 3-year validity, multiple-entry)
        but doesn&apos;t change the 90/180 limit. The two operate in tandem: ETIAS authorises
        your eligibility to enter; EES tracks and enforces the day count. See our{" "}
        <Link href="/guides/etias-2026-explained">ETIAS guide</Link> for the full breakdown.
      </p>

      <h2>What to do before each Schengen trip</h2>
      <ol>
        <li>
          Use the{" "}
          <a
            href="https://ec.europa.eu/home-affairs/policies/schengen-borders-and-visa/short-stay-visa-calculator_en"
            target="_blank"
            rel="noreferrer noopener"
          >
            EU short-stay calculator
          </a>{" "}
          to count your remaining days against the planned dates.
        </li>
        <li>
          Save your entry / exit dates somewhere durable (calendar, notes app). Don&apos;t rely
          on passport stamps once EES rolls out — stamps stop being applied as the new system
          takes effect.
        </li>
        <li>
          If you&apos;re running close to 90, plan an aging-out gap: at least the number of days
          equal to your overrun, spent outside Schengen, before the next entry.
        </li>
        <li>
          For genuine residence intent, switch to a long-stay D-class national visa rather than
          repeatedly bumping against the 90/180 limit. Most member states offer a passive-income
          visa (e.g. Spain Non-Lucrative, Portugal D7, France Long-Stay Visitor).
        </li>
      </ol>

      <h2>What this guide doesn&apos;t cover</h2>
      <p>
        Specific case-by-case rules around the EES grace period, how short-stay days interact
        with EU Blue Card portability, or how digital-nomad-visa days are counted in member
        states that have published explicit clarifications. For complex multi-state schedules
        with ambiguous residence intent, consult an immigration lawyer in your primary
        destination.
      </p>

      <p className="text-xs text-neutral-500 mt-8">
        Sources: EU Regulation (EU) 2018/1806 (Schengen visa list), EU Schengen Borders Code
        (Regulation (EU) 2016/399 consolidated), travel-europe.europa.eu/ees,
        travel-europe.europa.eu/etias. Last updated 2026-05.
      </p>
    </article>
  );
}
