import Link from "next/link";
import type { GuideFrontmatter } from "./types";
import { digitalNomadPrograms, fmtFee } from "@/lib/guideData";
import { Flag } from "@/components/Flag";
import { nameFor } from "@/lib/countries";

export const frontmatter: GuideFrontmatter = {
  slug: "digital-nomad-visas-how-to-choose",
  title: "Digital Nomad visas: how to choose the right one for you in 2026",
  summary:
    "Around 30 countries now offer Digital Nomad visas — formal residence permits for remote workers earning foreign income. Cabo Verde to Cayman, Estonia to Indonesia. Live matrix of every active programme + how to choose.",
  author: "Visavu editorial",
  publishedAt: "2026-05-10",
  modifiedAt: "2026-05-10",
  tags: ["Digital Nomad", "Remote Work", "Live data"],
  readingMinutes: 12,
  heroIso2: "PT",
};

export default async function DigitalNomadGuide() {
  const programs = await digitalNomadPrograms();
  const grouped = new Map<string, typeof programs>();
  for (const p of programs) {
    if (!grouped.has(p.destinationIso2)) grouped.set(p.destinationIso2, []);
    grouped.get(p.destinationIso2)!.push(p);
  }
  const destinations = [...grouped.keys()].sort();

  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
        The Digital Nomad visa didn&apos;t exist before 2020. By 2026 about{" "}
        <strong>{destinations.length}</strong> countries offer one — formal residence permits
        for remote workers earning foreign income, with income thresholds, tax breaks, and
        stays from 6 months to 5 years. The list is long, the criteria differ wildly, and the
        right choice depends on your tax situation more than your favourite beach. This guide
        is the no-marketing pass.
      </p>

      <h2>TL;DR</h2>
      <ul>
        <li>
          <strong>What:</strong> A residence permit (not a visa-free entry) for people who earn
          foreign income from a non-local employer or self-employment.
        </li>
        <li>
          <strong>Who qualifies:</strong> Almost always defined by income, not nationality. The
          typical threshold is US$1,500–US$3,500/month, with Estonia (€4,500), Iceland (US$7k),
          and Cayman (US$100k+) at the top end and Cabo Verde / Colombia at the bottom.
        </li>
        <li>
          <strong>Where to look:</strong> The Caribbean and Atlantic islands compete on
          lifestyle. The EU competes on stay length + path-to-residency. Asia competes on cost
          of living. Latin America competes on quality of life + tax.
        </li>
        <li>
          <strong>Tax is the deciding factor.</strong> Some destinations are tax-free on foreign
          income; some apply local tax after 183 days; some are unclear. Talk to an accountant
          before committing.
        </li>
      </ul>

      <h2>How a Digital Nomad visa differs from tourism</h2>
      <p>
        Most countries technically allow you to work remotely on a tourist visa for personal
        consumption. The DN visa exists for two reasons. First, it legalises the grey area and
        gives you a residence document for opening a bank account, renting an apartment, signing
        a phone contract. Second, it lets you stay longer than the tourist limit (typically 90
        days) without leaving and re-entering.
      </p>
      <p>
        Practical difference: a DN visa gives you a residence permit. A tourist visa gives you
        a visit. If you plan to be somewhere &gt;3 months, the DN visa is the right tool. If
        you&apos;re doing a 2-month workation, tourist suffices.
      </p>

      <h2>The full matrix — live from our database</h2>

      {destinations.map((iso) => {
        const list = grouped.get(iso)!;
        return (
          <section key={iso} className="not-prose mt-8 mb-6 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
            <header className="flex items-center gap-3 mb-3">
              <Flag iso2={iso} size={28} />
              <h3 className="text-lg font-semibold m-0">{nameFor(iso)}</h3>
            </header>
            <ul className="space-y-2 text-sm">
              {list.map((p) => (
                <li key={p.label} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <span className="sm:col-span-7 font-medium">{p.label}</span>
                  <span className="sm:col-span-3 text-neutral-600 dark:text-neutral-400">
                    {p.stayDays ? `${p.stayDays} days` : "—"}
                  </span>
                  <span className="sm:col-span-2 text-neutral-700 dark:text-neutral-300 font-mono text-xs">
                    {fmtFee(p.feeAmountMinor, p.feeCurrency)}
                  </span>
                </li>
              ))}
            </ul>
            {list[0]?.primarySourceUrl && (
              <a
                href={list[0].primarySourceUrl}
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

      <h2>How to choose</h2>
      <h3>Step 1: filter by income threshold</h3>
      <p>
        If you earn less than US$24k/year, your options narrow to Colombia (V Visa,
        ~US$720/month), Brazil (VITEM XIV, US$1,500/month), or Cabo Verde (€1,500/month). If
        you earn US$5k+/month you can pick almost anywhere. If you earn US$100k+/year, the
        Cayman Global Citizen Concierge is worth it for the no-tax angle alone.
      </p>

      <h3>Step 2: filter by tax treatment</h3>
      <p>
        The big variable. Each country treats DN visa holders differently:
      </p>
      <ul>
        <li>
          <strong>Genuinely tax-free on foreign income:</strong> Cayman, BVI, Antigua, Barbados,
          Mauritius, UAE (under the right structure), Vanuatu, the Bahamas.
        </li>
        <li>
          <strong>Becomes tax resident after 183 days:</strong> Spain, Portugal, Italy, Greece,
          Estonia, Hungary, Romania. Some of these offer 5-year tax breaks for new arrivals.
        </li>
        <li>
          <strong>Special tax regime for DN visa holders:</strong> Greece&apos;s 50% income-tax
          deduction in year one. Portugal&apos;s NHR (closing). Spain&apos;s Beckham Law (24%
          flat). Italy&apos;s inbound-worker scheme.
        </li>
        <li>
          <strong>Worldwide income taxed:</strong> Mexico, Costa Rica (after 183 days), some
          interpretations of the Indonesian B211A. Verify with an accountant.
        </li>
      </ul>

      <h3>Step 3: filter by &ldquo;what next?&rdquo;</h3>
      <p>
        Most DN visas are 1-2 years with limited renewal. If you want to stay, the question is
        whether the visa leads to permanent residency. Portugal D8, Spain Digital Nomad, Mexico
        Temporary Resident, Costa Rica Rentista — these all have permanent-residency pathways
        after 3-5 years. Most Caribbean DN visas don&apos;t — you stay 12-24 months and leave.
      </p>

      <h3>Step 4: filter by cost of living</h3>
      <p>
        Earning US$5k/month feels different in Cayman ($3k/month rent) versus Cabo Verde
        ($600/month rent). Most DN guides don&apos;t tell you this honestly: the income
        threshold is the minimum, not the comfortable amount. Add 30% headroom.
      </p>

      <h2>Common mistakes</h2>
      <h3>Treating it as a tax-free shelter without doing the work.</h3>
      <p>
        You can&apos;t just sign up for the Cayman DN visa and claim no tax on your US salary.
        US citizens pay US tax regardless. Tax residency rules vary widely. Get specialist
        advice before relocating money or expecting a saving.
      </p>

      <h3>Forgetting health insurance.</h3>
      <p>
        Almost every DN visa requires private health insurance for the full duration. SafetyWing
        and Cigna Global are the standard nomad options. Local national health systems are
        generally not available.
      </p>

      <h3>Missing the income-proof requirement.</h3>
      <p>
        Most programmes want 6 months of bank statements + an employer letter + tax records.
        Self-employed applicants need invoices and contracts. Prepare the paperwork properly —
        denials are usually about documentation, not eligibility.
      </p>

      <h3>Confusing &ldquo;Digital Nomad visa&rdquo; with &ldquo;tourist visa with permission to work&rdquo;.</h3>
      <p>
        The DN visa is a residence permit. The Mauritius Premium Visa and Indonesia&apos;s
        B211A are stretching the definition — they&apos;re less formal. Read the actual
        residence-rights document before assuming.
      </p>

      <h2>What about Estonia&apos;s e-Residency?</h2>
      <p>
        e-Residency is NOT a physical visa. It&apos;s a digital ID that lets you register a
        company in Estonia and run it remotely from anywhere. It does not give you the right
        to physically live in Estonia. The actual physical Digital Nomad visa is a separate
        product (in our table above).
      </p>

      <h2>Look up your route</h2>
      <p>
        Use our <Link href="/finder?goal=remote_work">visa finder with goal = Remote Work</Link>{" "}
        to see every Digital Nomad programme your passport qualifies for.
      </p>
    </article>
  );
}
