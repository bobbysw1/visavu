import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "uk-eta-2025-explained",
  title: "UK ETA explained: who needs one, what it costs, how to apply",
  summary:
    "From April 2025 every visa-free traveller — including American, Canadian, Australian, and EU citizens — needs a UK Electronic Travel Authorisation before boarding. £10, valid 2 years, two-day average decision.",
  author: "Visavu editorial",
  publishedAt: "2026-05-10",
  modifiedAt: "2026-05-10",
  tags: ["United Kingdom", "ETA", "Recent change"],
  readingMinutes: 7,
};

export default function UkEtaGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        The UK Electronic Travel Authorisation (ETA) replaced the &ldquo;just turn up&rdquo;
        model for visa-free travellers in 2024–2025. As of April 2025 it applies to almost
        every nationality that doesn&apos;t need a UK visa — including the United States, the
        EU, Canada, Australia, New Zealand, and the GCC. £10, valid 2 years, multiple entries.
      </p>

      <h2>TL;DR</h2>
      <ul>
        <li>
          <strong>What:</strong> Pre-travel authorisation for visa-free entry to the UK. Same
          shape as the U.S. ESTA or the upcoming EU ETIAS.
        </li>
        <li>
          <strong>When:</strong> Live for almost all visa-free nationalities since April 2025.
        </li>
        <li>
          <strong>Who:</strong> Every visa-free traveller. Currently exempt: British /Irish
          citizens, anyone with a UK visa or settled status, and Irish residents who fall under
          Common Travel Area rules.
        </li>
        <li>
          <strong>How:</strong> UK ETA app (iOS/Android) or the gov.uk web form. £10 fee.
        </li>
        <li>
          <strong>Validity:</strong> 2 years or until your passport expires. Multiple entries.
          Stays of up to 6 months per visit.
        </li>
      </ul>

      <h2>Who needs one</h2>
      <p>
        The blunt rule: if you didn&apos;t need a visa for the UK before April 2025, you almost
        certainly need an ETA now. The list of visa-required nationalities (the
        &ldquo;visa nationals&rdquo; in Home Office terminology) hasn&apos;t changed — they
        continue applying for visit visas as they always did. The change is for the 60-ish
        nationalities who used to walk through Border Control and now must pre-register first.
      </p>
      <p>The biggest groups affected:</p>
      <ul>
        <li>The European Union (all 27 member states + EFTA: Iceland, Liechtenstein, Norway, Switzerland)</li>
        <li>The United States</li>
        <li>Canada, Australia, New Zealand</li>
        <li>Japan, South Korea, Hong Kong, Macao, Singapore, Taiwan, Brunei</li>
        <li>The GCC: UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman</li>
        <li>Latin America: Argentina, Brazil, Chile, Costa Rica, Mexico, Panama, Paraguay, Uruguay, plus most Central American countries</li>
        <li>The Caribbean: Antigua, Bahamas, Barbados, Dominica, Grenada, St Kitts, St Lucia, St Vincent, Trinidad &amp; Tobago</li>
      </ul>

      <h2>Who doesn&apos;t need one</h2>
      <ul>
        <li>British and Irish citizens</li>
        <li>Anyone with a valid UK visa (visit, study, work, settlement)</li>
        <li>Anyone with settled or pre-settled status under the EU Settlement Scheme</li>
        <li>Anyone transiting airside (not crossing the UK border at all)</li>
        <li>Holders of a valid Electronic Visa Waiver — NOT the same thing; it&apos;s a different scheme for some Gulf nationals</li>
      </ul>

      <h2>How to apply</h2>
      <ol>
        <li>
          Download the official <strong>UK ETA app</strong> (iOS / Android) or use the web form
          on{" "}
          <a href="https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" target="_blank" rel="noreferrer noopener">
            gov.uk
          </a>.
        </li>
        <li>Scan your passport bio page; take a selfie when prompted.</li>
        <li>Answer suitability questions (criminal history, prior immigration breaches).</li>
        <li>Pay the £10 fee by card.</li>
        <li>
          Decision usually within 3 days; some come within minutes. If your application is
          flagged for review, expect up to 10 working days.
        </li>
      </ol>

      <h2>Common gotchas</h2>
      <h3>Children need their own ETA.</h3>
      <p>
        Every passport holder, including infants, needs their own application. £10 each. There
        is no family discount.
      </p>

      <h3>Avoid third-party application services.</h3>
      <p>
        A £10 government process is being marketed as £40-£70 by various third parties. They are
        legally allowed to charge a service fee, but the only thing they do is fill in your
        passport details on the same form you can use yourself. Use the official app or
        gov.uk directly.
      </p>

      <h3>The Common Travel Area still works.</h3>
      <p>
        If you&apos;re an Irish resident travelling from Ireland to the UK by ferry or domestic
        air route, ordinary Common Travel Area rules apply — no ETA needed for that crossing.
        But if you&apos;re an Irish resident flying to the UK from a third country, the ETA
        rule applies based on your nationality.
      </p>

      <h3>Transit requires an ETA only if you cross the border.</h3>
      <p>
        Connecting flight at Heathrow without leaving the international transit area? No ETA.
        Stopover where you go into central London? ETA required.
      </p>

      <h2>What if you arrive without an ETA?</h2>
      <p>
        Airlines won&apos;t board you. Carrier sanctions for boarding non-ETA passengers are
        steep, so airline staff at check-in are now trained to verify ETA status as a routine
        step in document checks. If you somehow get past check-in (rare) and arrive at UK
        Border Force without an ETA, expect refusal of entry and a return flight at your own
        expense.
      </p>

      <h2>Look up your route</h2>
      <p>
        Use our <Link href="/finder?goal=visit">visa finder</Link> with passport &rarr; United
        Kingdom selected to confirm whether you need a visit visa or an ETA. UK results carry
        the ETA banner inline.
      </p>

      <h2>References</h2>
      <ul>
        <li>
          <a href="https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" target="_blank" rel="noreferrer noopener">
            gov.uk — Apply for an Electronic Travel Authorisation (official)
          </a>
        </li>
        <li>
          <a href="https://www.gov.uk/check-uk-visa" target="_blank" rel="noreferrer noopener">
            gov.uk — Check if you need a UK visa
          </a>
        </li>
      </ul>
    </article>
  );
}
