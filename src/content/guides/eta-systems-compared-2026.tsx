import Link from "next/link";
import type { GuideFrontmatter } from "./types";

export const frontmatter: GuideFrontmatter = {
  slug: "eta-systems-compared-2026",
  title: "ESTA, UK ETA, ETIAS, K-ETA, Canada eTA — the 2026 electronic-authorisation map",
  summary:
    "Every major electronic travel authorisation system in 2026 — what each costs, how long it lasts, who needs it, and how they interact with the underlying visa-free regimes.",
  author: "Visavu editorial",
  publishedAt: "2026-05-17",
  modifiedAt: "2026-05-17",
  tags: ["ETA", "ESTA", "ETIAS", "Travel authorisation"],
  readingMinutes: 9,
  heroIso2: "GB",
};

export default function EtaSystemsComparedGuide() {
  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        Electronic travel authorisations are increasingly the standard for
        visa-exempt-but-not-quite-walk-up entry. By late 2026 there will be five major
        systems in active operation: ESTA (US), UK ETA, ETIAS (Schengen), K-ETA (South
        Korea), Canada eTA. Plus Australia&apos;s long-running eVisitor / ETA. This guide
        compiles them — what each costs, validity, who needs them, and how to plan around
        them.
      </p>

      <h2>TL;DR comparison</h2>
      <table>
        <thead>
          <tr>
            <th>System</th>
            <th>Cost</th>
            <th>Validity</th>
            <th>Multi-entry?</th>
            <th>Decision time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ESTA (US)</td>
            <td>$21</td>
            <td>2 yrs or passport expiry</td>
            <td>Yes</td>
            <td>Minutes (sometimes hours)</td>
          </tr>
          <tr>
            <td>UK ETA</td>
            <td>£10</td>
            <td>2 yrs or passport expiry</td>
            <td>Yes</td>
            <td>~2 days (sometimes minutes)</td>
          </tr>
          <tr>
            <td>ETIAS (Schengen) — late 2026</td>
            <td>€7 (free under-18 / over-70)</td>
            <td>3 yrs or passport expiry</td>
            <td>Yes</td>
            <td>~4 days (sometimes minutes)</td>
          </tr>
          <tr>
            <td>K-ETA (South Korea)</td>
            <td>KRW 10,000 (~$7)</td>
            <td>3 yrs or passport expiry</td>
            <td>Yes</td>
            <td>~1 day</td>
          </tr>
          <tr>
            <td>Canada eTA</td>
            <td>CAD$7</td>
            <td>5 yrs or passport expiry</td>
            <td>Yes</td>
            <td>Minutes (sometimes hours)</td>
          </tr>
          <tr>
            <td>Australia eVisitor / ETA</td>
            <td>AUD$20-50</td>
            <td>12 mo</td>
            <td>Yes</td>
            <td>Minutes (often instant)</td>
          </tr>
        </tbody>
      </table>

      <h2>ESTA (US Electronic System for Travel Authorisation)</h2>
      <p>
        Launched 2009, now mandatory for all Visa Waiver Program (VWP) nationals: most of
        Europe, Japan, South Korea, Singapore, Brunei, Chile, Taiwan, plus Israel since
        October 2023.
      </p>
      <p>
        <strong>Cost:</strong> $21 (raised from $14 in 2022). $4 processing fee + $17
        authorisation fee.
      </p>
      <p>
        <strong>Validity:</strong> 2 years or until passport expiry, whichever is shorter.
        Multi-entry, 90-day stay per visit.
      </p>
      <p>
        <strong>Apply:</strong> esta.cbp.dhs.gov. Plan 72 hours ahead but most decisions
        return within minutes.
      </p>
      <p>
        <strong>Notes:</strong> ESTA-only entry doesn&apos;t allow status change inside the
        US — you can&apos;t convert from ESTA to F-1 / H-1B without departing and re-entering
        on the appropriate visa.
      </p>

      <h2>UK ETA</h2>
      <p>
        Launched November 2023; mandatory for all visa-exempt nationalities from April 2025.
        Covers ~60 nationalities including the US, EU, Canada, Australia, NZ, Japan, South
        Korea, Singapore, and GCC nationals.
      </p>
      <p>
        <strong>Cost:</strong> £10.
      </p>
      <p>
        <strong>Validity:</strong> 2 years or until passport expiry. Multi-entry, 6-month
        stay per visit.
      </p>
      <p>
        <strong>Apply:</strong> UK ETA app (iOS/Android) or gov.uk web form. Most decisions
        within 2 days; sometimes minutes.
      </p>
      <p>
        <strong>Notes:</strong> Irish citizens and Common Travel Area residents are exempt.
        UK ETA grants the right to BOARD; entry remains at the immigration officer&apos;s
        discretion at port. See our{" "}
        <Link href="/guides/uk-eta-2025-explained">UK ETA detailed guide</Link>.
      </p>

      <h2>ETIAS (European Travel Information and Authorisation System)</h2>
      <p>
        Launching Q4 2026 (after multiple delays). Will be mandatory for visa-exempt
        nationalities entering the Schengen Area: 60+ countries including the US, UK, Canada,
        Australia, NZ, Japan, South Korea, Singapore, Israel, GCC nationals, most of Latin
        America.
      </p>
      <p>
        <strong>Cost:</strong> €7 for applicants 18-70; free under-18 and over-70.
      </p>
      <p>
        <strong>Validity:</strong> 3 years or until passport expiry. Multi-entry, 90-in-180-
        day Schengen short-stay limit still applies.
      </p>
      <p>
        <strong>Apply:</strong> travel-europe.europa.eu/etias. Most decisions within 4 days;
        complex cases up to 30 days.
      </p>
      <p>
        <strong>Notes:</strong> ETIAS operates in tandem with the EU Entry/Exit System (EES,
        launching late 2025). EES biometrically tracks Schengen entries/exits; ETIAS
        authorises the eligibility to enter. See our{" "}
        <Link href="/guides/etias-2026-explained">ETIAS detailed guide</Link>.
      </p>

      <h2>K-ETA (Korea Electronic Travel Authorisation)</h2>
      <p>
        Launched September 2021; mandatory for most visa-exempt nationalities entering South
        Korea. Covers ~110 nationalities including the US, EU, Canada, Australia, NZ, Japan,
        Singapore, Israel, GCC nationals.
      </p>
      <p>
        <strong>Cost:</strong> KRW 10,000 (~$7).
      </p>
      <p>
        <strong>Validity:</strong> 3 years or until passport expiry. Multi-entry, 30-180 days
        stay per visit depending on nationality.
      </p>
      <p>
        <strong>Apply:</strong> k-eta.go.kr. Apply at least 72 hours before travel.
      </p>
      <p>
        <strong>Notes:</strong> K-ETA temporarily exempted ~22 nationalities (UK, US, most of
        EU, Canada, Australia, NZ, Japan, Singapore) from April 2023 through 2024-2025 — but
        the exemption is regularly extended on annual basis. Verify current K-ETA requirement
        for your nationality before booking.
      </p>

      <h2>Canada eTA</h2>
      <p>
        Launched March 2016 for visa-exempt nationals flying to Canada. US citizens are
        exempt from both visa and eTA. Mexican nationals require eTA since 2016 (reimposed
        conditions vary).
      </p>
      <p>
        <strong>Cost:</strong> CAD$7.
      </p>
      <p>
        <strong>Validity:</strong> 5 years or until passport expiry (the longest of the major
        ETAs). Multi-entry, 6-month stay per visit.
      </p>
      <p>
        <strong>Apply:</strong> canada.ca/eta. Most decisions within minutes; complex cases
        a few days.
      </p>
      <p>
        <strong>Notes:</strong> eTA is required for flights to Canada; not required for
        crossing the land border from the US.
      </p>

      <h2>Australia eVisitor (Subclass 651) + ETA (Subclass 601)</h2>
      <p>
        Two parallel systems: eVisitor for EU/EEA nationals (free); ETA for US/Canada/Japan/
        South Korea/Singapore/Brunei/Hong Kong/Malaysia/Taiwan (AUD$20 + AUD$30 service
        charge if applied via the ETA app).
      </p>
      <p>
        <strong>Validity:</strong> 12 months. Multi-entry, 90-day stays per visit.
      </p>
      <p>
        <strong>Notes:</strong> Australia&apos;s system pre-dates the &ldquo;ETA&rdquo;
        terminology fashion — it&apos;s functionally an electronic visa rather than a
        pre-clearance check.
      </p>

      <h2>Other ETA-like systems</h2>
      <ul>
        <li>
          <strong>NZ NZeTA:</strong> NZ$23. 2-year validity. Most visa-exempt nationalities.
        </li>
        <li>
          <strong>Sri Lanka ETA:</strong> $50-100 depending on type. 30 days stay per
          entry.
        </li>
        <li>
          <strong>Kenya eTA:</strong> $32. Launched 2024 — mandatory for all visitors except
          EAC nationals. 3-day processing.
        </li>
        <li>
          <strong>Tanzania eVisa / e-Permit:</strong> $50-100 depending on category. 30 days
          stay.
        </li>
        <li>
          <strong>Turkey eVisa:</strong> $35-50 depending on nationality. 30-90 days
          depending on nationality.
        </li>
      </ul>

      <h2>Practical planning around ETAs</h2>
      <ol>
        <li>
          <strong>Apply early.</strong> Most ETAs are issued within hours; some take days.
          Apply at least 72 hours before travel. Last-minute applications get refused at
          boarding even if approval is technically pending.
        </li>
        <li>
          <strong>Match passport.</strong> ETAs are linked to your specific passport number.
          Renewing your passport invalidates the ETA — reapply on the new passport.
        </li>
        <li>
          <strong>Print or save the approval.</strong> Most airlines verify ETA at check-in;
          some require a printed copy or app-based confirmation. Save the approval offline.
        </li>
        <li>
          <strong>ETA vs visa is not the same.</strong> ETAs authorise travel from
          visa-exempt nationals; they don&apos;t grant additional rights. You still need to
          comply with the underlying short-stay rules (90/180 in Schengen, 6-month limit in
          UK, etc.).
        </li>
        <li>
          <strong>Refused ETA = refused visa for the same trip.</strong> A refused ETA cannot
          be circumvented by applying for a standard visa for the same trip; the refusal
          becomes a marker on subsequent applications. Address the refusal grounds before
          applying again.
        </li>
      </ol>

      <p className="text-xs text-neutral-500 mt-8">
        Sources: esta.cbp.dhs.gov; gov.uk/UK-ETA; travel-europe.europa.eu/etias;
        k-eta.go.kr; canada.ca/eTA; immi.homeaffairs.gov.au eVisitor / ETA; Sri Lanka ETA
        portal; Kenya eCitizen ETA; Tanzania Immigration eVisa; Türkiye eVisa portal. Last
        updated 2026-05.
      </p>
    </article>
  );
}
