import Link from "next/link";
import type { GuideFrontmatter } from "./types";
import { workingHolidayMatrix, fmtFee } from "@/lib/guideData";
import { Flag } from "@/components/Flag";
import { nameFor } from "@/lib/countries";

export const frontmatter: GuideFrontmatter = {
  slug: "working-holiday-visas-complete-guide",
  title: "Working Holiday visas: the complete guide for 18–30s (and some 35s)",
  summary:
    "Twenty-six countries run Working Holiday programmes that let young travellers live and work abroad for 12–24 months. Live matrix of every active programme, fees, age limits, and the bilateral combinations that exist.",
  author: "Visavu editorial",
  publishedAt: "2026-05-10",
  modifiedAt: "2026-05-10",
  tags: ["Working Holiday", "Youth Mobility", "Live data"],
  readingMinutes: 11,
};

export default async function WorkingHolidayGuide() {
  const matrix = await workingHolidayMatrix();
  const byDestination = new Map<string, typeof matrix>();
  for (const row of matrix) {
    if (!byDestination.has(row.destinationIso2)) byDestination.set(row.destinationIso2, []);
    byDestination.get(row.destinationIso2)!.push(row);
  }
  const destinations = [...byDestination.keys()].sort();

  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        The Working Holiday Visa scheme is one of the great underused passport benefits of being
        18–30 (or, increasingly, 35). Twenty-six countries currently run programmes that let
        young people from partner countries live abroad for a year or more, work casual jobs to
        fund the trip, travel widely, and return home with stamps on their passport that no
        amount of money can buy later in life. This guide walks the whole matrix.
      </p>

      <h2>TL;DR</h2>
      <ul>
        <li>
          <strong>What:</strong> A 12–24 month visa allowing tourism + casual work, granted on
          a bilateral basis between specific country pairs.
        </li>
        <li>
          <strong>Who:</strong> Typically 18–30 (extended to 35 in many bilateral arrangements,
          notably for Canadian, French, Irish, Italian and British applicants).
        </li>
        <li>
          <strong>Cost:</strong> Australian is the priciest (AU$650 ≈ US$430), Japanese is
          uniquely FREE, most others sit in the £250–£600 range.
        </li>
        <li>
          <strong>Once-per-lifetime:</strong> Most programmes are single-use per (passport,
          destination) pair. Use them wisely.
        </li>
        <li>
          <strong>The 26 destinations:</strong> Australia, New Zealand, UK, Canada, Japan, South
          Korea, Ireland, plus France, Germany, Spain, Italy, Portugal, Netherlands, Belgium,
          Sweden, Denmark, Norway, Finland, Switzerland, Austria, Iceland, Czech Republic,
          Hungary, Poland, Slovakia, Estonia, Singapore, Taiwan, Hong Kong, Israel, Argentina,
          Chile, Uruguay.
        </li>
      </ul>

      <h2>How it works</h2>
      <p>
        Working Holiday programmes are <strong>bilateral</strong> — every active programme is a
        treaty between two specific countries. Canada and Australia run programmes for each
        other&apos;s 18–35-year-olds. France and Argentina. Japan and Sweden. There is no
        &ldquo;Working Holiday visa&rdquo; you can apply for from any nationality to any
        destination; you can only apply where your specific country and the destination have
        a treaty.
      </p>
      <p>
        Most programmes require: a passport from the partner country, age 18–30 (sometimes 35),
        sufficient savings (typically the equivalent of AU$5,000), proof of return ticket or
        funds to buy one, travel insurance for the full duration, and a clean criminal record.
      </p>
      <p>
        Once granted, the visa allows you to enter, work for any employer for up to 6–12 months
        with one employer (varies), travel freely, and exit on your schedule. Australia and New
        Zealand allow you to extend to a second-year and third-year visa if you complete a
        period of regional work. The UK&apos;s Youth Mobility Scheme lets Australian, Canadian
        and New Zealander passport holders stay 36 months without any work-quota requirement.
      </p>

      <h2>Every active programme — live from our database</h2>
      <p>
        This table is generated from the same dataset that powers the rest of the site, so it
        reflects current programmes. <strong>{matrix.length}</strong> programme variants across{" "}
        <strong>{destinations.length}</strong> destinations.
      </p>

      {destinations.map((dest) => {
        const programmes = byDestination.get(dest)!;
        return (
          <section key={dest} className="not-prose mt-8 mb-6 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
            <header className="flex items-center gap-3 mb-3">
              <Flag iso2={dest} size={28} />
              <h3 className="text-lg font-semibold m-0">{nameFor(dest)}</h3>
            </header>
            <ul className="space-y-2 text-sm">
              {programmes.map((p) => (
                <li key={p.label} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
                  <span className="sm:col-span-6 font-medium">{p.label}</span>
                  <span className="sm:col-span-2 text-neutral-600 dark:text-neutral-400">
                    {p.ageRange}
                  </span>
                  <span className="sm:col-span-2 text-neutral-600 dark:text-neutral-400">
                    {p.stayDays ? `${p.stayDays} days` : "—"}
                  </span>
                  <span className="sm:col-span-2 text-neutral-700 dark:text-neutral-300 font-mono text-xs">
                    {fmtFee(p.feeAmountMinor, p.feeCurrency)}
                  </span>
                </li>
              ))}
            </ul>
            {programmes[0]?.primarySourceUrl && (
              <a
                href={programmes[0].primarySourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block mt-3 text-xs text-blue-600 dark:text-blue-400 underline"
              >
                Official source →
              </a>
            )}
          </section>
        );
      })}

      <h2>How to pick which programme to use</h2>
      <p>
        Most travellers don&apos;t realise they have a choice. If you&apos;re a British
        passport holder aged 24, you could in principle use the Australian Subclass 417,
        Canadian IEC, Japanese WHV, South Korean H-1, or any of the European ones. You can
        only use most of these <strong>once per lifetime</strong> — pick carefully.
      </p>
      <p>The deciding factors usually break down by:</p>
      <ul>
        <li>
          <strong>Stay length.</strong> UK passport holders to New Zealand get 23 months; to
          everywhere else, 12. UK to Australia, Canada, NZ, Iceland: 35 is the upper age.
        </li>
        <li>
          <strong>Cost.</strong> Japan is free. Sweden, Norway and Finland sit around US$150-200.
          Australia AU$650.
        </li>
        <li>
          <strong>Wage potential.</strong> Australia is the gold standard for raw hourly wage;
          UK and Switzerland follow.
        </li>
        <li>
          <strong>Climate / lifestyle.</strong> Subjective but real.
        </li>
        <li>
          <strong>What you want next.</strong> Programmes that lead into long-stay visas (NZ
          Skilled Migrant, Canada Express Entry, Australia Subclass 482) are worth the
          single-use slot if you might want to stay.
        </li>
      </ul>

      <h2>Common mistakes</h2>
      <h3>Booking flights before applying for the visa.</h3>
      <p>
        Most programmes specifically require you to be outside the destination at the time of
        application. Apply, get approval, then book flights.
      </p>

      <h3>Counting the age limit at travel date, not application date.</h3>
      <p>
        Eligibility is assessed at the date of application, not the date you actually arrive.
        Applying the day before your 31st birthday is fine; applying the day after is not.
      </p>

      <h3>Treating the &ldquo;casual work&rdquo; element too literally.</h3>
      <p>
        Working Holiday programmes do allow you to work — but most have a 6-month-per-employer
        cap to discourage their use as backdoor skilled-worker visas. If you take a real
        engineering job and stay with one company for the full 12 months, you&apos;re likely
        violating the visa.
      </p>

      <h3>Skipping insurance.</h3>
      <p>
        Every programme requires it. Australia and New Zealand will check at the border.
        Switzerland will refuse boarding. SafetyWing and World Nomads are the standard
        Working-Holiday choices.
      </p>

      <h2>If you&apos;re older than 30 (or 35)</h2>
      <p>
        Working Holiday options close at 30 or 35 depending on the bilateral. After that, the
        equivalent route is a Skilled Worker / employer-sponsored visa, a Digital Nomad visa
        (see our <Link href="/guides/digital-nomad-visas-how-to-choose">Digital Nomad guide</Link>),
        or a Talent / Investor visa. None of these are easier than a Working Holiday — they all
        require more paperwork and clearer demonstration of skills or assets.
      </p>

      <h2>Look up your route</h2>
      <p>
        Use the <Link href="/finder?goal=work_temporary">visa finder with goal = Working
        Holiday</Link> to filter to every destination open to your specific passport, with the
        age limit and fee shown inline.
      </p>

      <h2>References</h2>
      <p>
        Every row in the table above links back to the destination&apos;s official immigration
        page. Each is verified by our nightly link-health checker — if a link goes broken, a
        red banner replaces the Apply CTA until we update it.
      </p>
    </article>
  );
}
