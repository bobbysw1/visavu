import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "schengen-ees-explained",
  title: "Schengen EES: biometric border control, no more passport stamps",
  summary:
    "Since October 2025, every non-EU traveller entering or leaving Schengen has been registered in the Entry/Exit System. Fingerprints + facial photo on first entry, automatic 90/180 calculation thereafter. Here's what it changes.",
  author: "Visavu editorial",
  publishedAt: "2026-05-10",
  modifiedAt: "2026-05-10",
  tags: ["Schengen", "Europe", "EES", "Biometrics"],
  readingMinutes: 6,
};

export default function SchengenEesGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        The Schengen Entry/Exit System (EES) replaced wet-ink passport stamping for non-EU
        short-stay travellers on <strong>12 October 2025</strong>. If you&apos;re entering or
        leaving Schengen on a non-EU passport, the border guard takes your fingerprints and a
        facial photo on first entry, then matches them to your passport on every subsequent
        crossing. The 90/180 day count is automatic. The change is operational, not legal —
        but it has practical consequences worth understanding before you fly.
      </p>

      <h2>TL;DR</h2>
      <ul>
        <li>
          <strong>What:</strong> A digital border-crossing record replacing passport stamps for
          all non-EU short-stay travellers entering/leaving the 29-country Schengen area.
        </li>
        <li>
          <strong>When:</strong> Live since October 12, 2025.
        </li>
        <li>
          <strong>Who:</strong> Every non-EU passport holder visiting Schengen on a visa-free
          entry or short-stay (Type C) visa. Long-stay visa and residence-permit holders are
          exempt.
        </li>
        <li>
          <strong>Cost:</strong> Free — but adds 5–15 minutes to your first border crossing.
        </li>
        <li>
          <strong>Data stored:</strong> Four fingerprints, one facial photo, passport details,
          plus every entry / exit. Retention: 3 years from your last exit.
        </li>
      </ul>

      <h2>What changes for you, the traveller</h2>
      <h3>First crossing of the new system</h3>
      <p>
        On your first Schengen border crossing after October 12, 2025, the border officer or a
        self-service kiosk will:
      </p>
      <ol>
        <li>Read your passport chip / bio page.</li>
        <li>Take four fingerprints (typically your right hand).</li>
        <li>Take a facial photo against a plain background.</li>
        <li>Confirm your purpose of travel and intended stay length.</li>
      </ol>
      <p>
        Add 5–15 minutes to the queue versus the old &ldquo;passport stamp&rdquo; flow. Major
        airports (CDG, FRA, MAD, FCO, AMS, MXP) have rolled out dedicated EES kiosks to absorb
        the volume. Smaller airports and land borders have been slower.
      </p>

      <h3>Subsequent crossings</h3>
      <p>
        Every later crossing within the 3-year retention window is a face/fingerprint match —
        no fresh biometrics, no kiosk queue (in theory). If the database lookup confirms your
        identity matches an existing EES record, you walk through faster than the old
        passport-stamp era.
      </p>

      <h3>The 90/180 rule is now automated</h3>
      <p>
        The old rule survives: you can spend up to 90 days in any rolling 180-day period in the
        Schengen area on a short-stay basis. The change is that the count is now automatic.
        Border guards no longer flip through your stamps and estimate. The system tells them
        exactly how many days you&apos;ve used and what your remaining balance is.
      </p>
      <p>
        Travellers who used to push the boundaries of the 90/180 rule are now caught
        immediately. There is no &ldquo;ambiguous stamps&rdquo; defence. If you&apos;ve
        accumulated 89 days in the last 180 and try to fly in for a long weekend, the system
        will refuse.
      </p>

      <h2>What stays the same</h2>
      <ul>
        <li>
          The list of visa-free vs. visa-required nationalities. EES is operational, not legal.
        </li>
        <li>The 90-days-in-180 limit (you still get it; it&apos;s just counted differently).</li>
        <li>Short-stay Schengen Type C visa rules (Reg. 2018/1806).</li>
        <li>Long-stay national visas (Type D) and residence permits — exempt from EES.</li>
      </ul>

      <h2>EES vs. ETIAS</h2>
      <p>
        These are separate, parallel systems. People confuse them constantly.
      </p>
      <ul>
        <li>
          <strong>EES (Entry/Exit System)</strong> = border-crossing biometric record. Done at
          the border on arrival. Free. Automatic 90/180 tracking.
        </li>
        <li>
          <strong>ETIAS (European Travel Information and Authorisation System)</strong> =
          pre-travel authorisation, like ESTA. Done online before you board. €7. Launches Q4
          2026. See our <Link href="/guides/etias-2026-explained">ETIAS guide</Link>.
        </li>
      </ul>
      <p>
        From Q4 2026, a visa-free American flying to Spain will: (1) apply for ETIAS online
        before boarding; (2) get biometrics taken at the EES kiosk in Madrid airport on
        arrival; (3) be tracked under the 90/180 rule automatically.
      </p>

      <h2>What to do before your next trip</h2>
      <ol>
        <li>
          Allow extra time at the border on your first crossing. Major hubs have been smooth;
          smaller airports and land borders have had longer queues during rollout.
        </li>
        <li>
          Bring a passport that opens cleanly — bio page chip readers fail on damaged passports
          more often than on stamping.
        </li>
        <li>
          If you have a residence permit or long-stay visa from any Schengen state, carry it.
          You&apos;re exempt from EES but the border officer needs to verify.
        </li>
        <li>
          If you&apos;re close to the 90-day Schengen limit, the system will catch you. Check
          your remaining days at any Schengen border kiosk before booking another trip.
        </li>
        <li>
          From Q4 2026, layer ETIAS on top — apply online before you fly.
        </li>
      </ol>

      <h2>References</h2>
      <ul>
        <li>
          <a href="https://travel-europe.europa.eu/ees_en" target="_blank" rel="noreferrer noopener">
            European Commission — EES official page
          </a>
        </li>
        <li>
          <a href="https://www.consilium.europa.eu/en/policies/ees/" target="_blank" rel="noreferrer noopener">
            European Council — EES policy
          </a>
        </li>
        <li>
          <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R2226" target="_blank" rel="noreferrer noopener">
            EU Regulation 2017/2226 (the EES regulation)
          </a>
        </li>
      </ul>
    </article>
  );
}
