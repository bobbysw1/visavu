import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "etias-2026-explained",
  title: "ETIAS 2026 explained: what every visa-free Schengen traveller needs to know",
  summary:
    "From October 2026 around 60 visa-free nationalities — including Americans, British, Canadians, Australians, Japanese — must pre-register for ETIAS before entering Schengen. Here's what changes, who's affected, and what to do.",
  author: "Visavu editorial",
  publishedAt: "2026-05-10",
  modifiedAt: "2026-05-10",
  tags: ["Schengen", "Europe", "ETA", "Upcoming"],
  readingMinutes: 9,
  heroIso2: "FR",
};

export default function EtiasGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        ETIAS — the European Travel Information and Authorisation System — goes live in
        <strong> Q4 2026</strong>. From that date, citizens of around 60 visa-exempt countries
        (including the United States, the United Kingdom, Canada, Australia, Japan, South Korea
        and Singapore) need to obtain an ETIAS authorisation before they can board a flight,
        train, ferry or coach into the Schengen area. It is not a visa. It is more like the U.S.
        ESTA or the UK ETA. But it is mandatory, it costs €7, and getting it wrong means denied
        boarding.
      </p>

      <h2>TL;DR</h2>
      <ul>
        <li>
          <strong>What:</strong> Pre-travel authorisation for visa-free travellers entering
          Schengen, similar to the U.S. ESTA or UK ETA.
        </li>
        <li>
          <strong>When:</strong> Launches Q4 2026. There is a six-month transitional period during
          which travellers without ETIAS will be admitted on a one-off basis. After that, no
          ETIAS = no boarding.
        </li>
        <li>
          <strong>Who:</strong> Citizens of the ~60 countries currently allowed visa-free entry
          to Schengen for short stays (up to 90 days in any 180-day period).
        </li>
        <li>
          <strong>How:</strong> Apply online at the official ETIAS portal. €7 fee for applicants
          aged 18–70; free for everyone else. Decision usually within minutes; up to 30 days for
          flagged applications.
        </li>
        <li>
          <strong>Validity:</strong> 3 years or until your passport expires (whichever comes
          first). Multiple entries.
        </li>
      </ul>

      <h2>Who is affected</h2>
      <p>
        ETIAS applies to visa-free nationalities, not visa-required ones. If you currently need a
        Schengen visa to visit Europe (most African, South Asian, and Central Asian passports),
        ETIAS is irrelevant — you continue applying for a Schengen visa. The change is for
        passport holders who today walk into Schengen without paperwork. That cohort is mostly:
      </p>
      <ul>
        <li>The five Eyes (US, UK, Canada, Australia, New Zealand)</li>
        <li>The wider OECD club (Japan, South Korea, Israel, Singapore, Taiwan)</li>
        <li>Latin America (Argentina, Brazil, Chile, Mexico, Uruguay, Costa Rica, Panama, plus most Central American countries)</li>
        <li>Most of the Caribbean (Antigua, Bahamas, Barbados, Dominica, Grenada, St Kitts, St Lucia, St Vincent, Trinidad)</li>
        <li>UAE, Hong Kong, Macao</li>
      </ul>
      <p>
        EU and Schengen citizens are unaffected. Citizens of the EFTA states (Iceland,
        Liechtenstein, Norway, Switzerland) are unaffected. Anyone holding a residence permit or
        long-stay visa from a Schengen state is unaffected.
      </p>

      <h2>What changes operationally</h2>
      <p>
        Today, an American booking a holiday in Italy buys a flight, packs a passport, lands in
        Rome. From October 2026, the same American must apply for ETIAS at least a few hours
        before flying — and ideally a few days before, in case the application is flagged for
        manual review. Airlines will check ETIAS status at boarding alongside passport details.
        No ETIAS, no plane.
      </p>
      <p>
        ETIAS is also linked to the European Entry/Exit System (EES), which has been operating
        since October 2025 and replaces passport stamping with biometric registration. The
        combined effect is that every short-stay traveller into Schengen now leaves a digital
        trail that wasn&apos;t there in 2024.
      </p>

      <h2>What to do</h2>
      <ol>
        <li>
          <strong>Don&apos;t apply too early.</strong> The official portal is{" "}
          <a href="https://travel-europe.europa.eu/etias_en" target="_blank" rel="noreferrer noopener">
            travel-europe.europa.eu/etias_en
          </a>. Watch out for third-party sites that charge €40–€60 for what is a €7 government
          process — they are not scams (they exist for ESTA too) but they are extracting fees
          for filling in your name on the form for you.
        </li>
        <li>
          <strong>Apply at least 96 hours before departure.</strong> Most decisions arrive within
          minutes, but flagged applications can take up to 30 days. Don&apos;t leave it to the
          night before.
        </li>
        <li>
          <strong>Check your passport validity.</strong> ETIAS is invalidated when your passport
          expires. Renew if you&apos;re close to expiry.
        </li>
        <li>
          <strong>If you have ANY criminal record</strong>, including dropped charges or spent
          convictions, expect manual review. Apply early and prepare to provide additional
          documentation.
        </li>
        <li>
          <strong>If your trip is multi-country across the Schengen zone</strong>, the same ETIAS
          covers every Schengen state. You don&apos;t need separate authorisations for France
          and Germany.
        </li>
      </ol>

      <h2>Common questions</h2>
      <h3>Is this a visa?</h3>
      <p>
        No. ETIAS is a travel authorisation. It does not give you the right to enter Schengen —
        only a passport stamp / EES biometric record at the border does that. It just means your
        passport details have been pre-screened against EU security databases.
      </p>

      <h3>How much does it cost?</h3>
      <p>
        €7 for applicants aged 18 to 70. Free for everyone else (under 18 or over 70). Family
        members of EU citizens are also exempt.
      </p>

      <h3>How long is it valid?</h3>
      <p>
        Three years from issuance, or until your passport expires — whichever is sooner. Multiple
        entries during that window.
      </p>

      <h3>What if I have an EU residence permit?</h3>
      <p>
        You don&apos;t need ETIAS. Holders of valid EU residence permits, long-stay visas, or
        diplomatic passports are exempt.
      </p>

      <h3>What about the UK ETA?</h3>
      <p>
        That&apos;s a separate scheme run by the United Kingdom for travellers entering the UK.
        It launched in 2025 and works similarly: £10, valid 2 years, mandatory before boarding.
        See our <Link href="/guides/uk-eta-2025-explained">UK ETA guide</Link>.
      </p>

      <h2>Look up your route</h2>
      <p>
        For specific Schengen entry rules and what ETIAS will mean for your trip, use our{" "}
        <Link href="/finder">Where can I go? finder</Link> — pick your nationality and the goal
        &ldquo;Visit short-term&rdquo; to see every Schengen country with current entry rules
        and the ETIAS warning banner already wired in.
      </p>

      <h2>References</h2>
      <ul>
        <li>
          <a href="https://travel-europe.europa.eu/etias_en" target="_blank" rel="noreferrer noopener">
            European Commission — ETIAS official portal (travel-europe.europa.eu)
          </a>
        </li>
        <li>
          <a href="https://www.consilium.europa.eu/en/policies/etias/" target="_blank" rel="noreferrer noopener">
            European Council — ETIAS policy page
          </a>
        </li>
        <li>
          <a href="https://travel-europe.europa.eu/ees_en" target="_blank" rel="noreferrer noopener">
            EES (Entry/Exit System) — operates alongside ETIAS
          </a>
        </li>
      </ul>
    </article>
  );
}
