import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/Breadcrumbs";
import { COUNTRY_LIST, flagEmoji, nameFor } from "@/lib/countries";
import { coverageForPassport } from "@/lib/coverage";
import { SITE, absoluteUrl } from "@/lib/site";
import type { CoverageSnapshot } from "@/lib/coverage";
import { type VisaStatus, type Purpose, PURPOSE_LABEL } from "@/lib/types";

type Params = { a: string; b: string };

function normalize(iso: string): string | null {
  const upper = iso.toUpperCase();
  return COUNTRY_LIST.some((c) => c.iso2 === upper) ? upper : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { a, b } = await params;
  const aIso = normalize(a);
  const bIso = normalize(b);
  if (!aIso || !bIso) return { title: "Compare passports" };
  const title = `${nameFor(aIso)} vs ${nameFor(bIso)} passport comparison`;
  return {
    title,
    description: `Side-by-side comparison of the ${nameFor(aIso)} and ${nameFor(bIso)} passports — visa-free destinations, eTA coverage, and embassy-required routes across all visa types.`,
    alternates: { canonical: absoluteUrl(`/compare/${aIso.toLowerCase()}/${bIso.toLowerCase()}`) },
    openGraph: {
      title,
      description: `Visa access comparison for ${nameFor(aIso)} and ${nameFor(bIso)} passports.`,
      url: absoluteUrl(`/compare/${aIso.toLowerCase()}/${bIso.toLowerCase()}`),
    },
  };
}

const STATUS_TONE: Record<VisaStatus, string> = {
  visa_free: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200",
  visa_free_with_eta: "bg-sky-50 dark:bg-sky-900/30 text-sky-900 dark:text-sky-200",
  visa_on_arrival: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-900 dark:text-cyan-200",
  e_visa: "bg-violet-50 dark:bg-violet-900/30 text-violet-900 dark:text-violet-200",
  embassy_visa: "bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200",
  restricted: "bg-orange-50 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200",
  refused: "bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-200",
};

const STATUS_LABEL: Record<VisaStatus, string> = {
  visa_free: "Visa-free",
  visa_free_with_eta: "Visa-free w/ eTA",
  visa_on_arrival: "Visa on arrival",
  e_visa: "e-Visa",
  embassy_visa: "Embassy",
  restricted: "Restricted",
  refused: "Refused",
};

const ROW_KEYS: VisaStatus[] = [
  "visa_free",
  "visa_free_with_eta",
  "visa_on_arrival",
  "e_visa",
  "embassy_visa",
  "restricted",
];

export default async function ComparePage({ params }: { params: Promise<Params> }) {
  const { a, b } = await params;
  const aIso = normalize(a);
  const bIso = normalize(b);
  if (!aIso || !bIso) notFound();

  let coverageA: CoverageSnapshot | null = null;
  let coverageB: CoverageSnapshot | null = null;
  try {
    [coverageA, coverageB] = await Promise.all([
      coverageForPassport(aIso),
      coverageForPassport(bIso),
    ]);
  } catch {
    // DB unavailable — empty state.
  }

  const crumbs = [
    { href: "/", label: "Home" },
    { href: `/compare/${aIso.toLowerCase()}/${bIso.toLowerCase()}`, label: `${nameFor(aIso)} vs ${nameFor(bIso)}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, SITE.url)) }}
      />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs crumbs={crumbs} />

        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">
            <span className="mr-2" aria-hidden>{flagEmoji(aIso)}</span>
            {nameFor(aIso)} vs{" "}
            <span className="mx-2" aria-hidden>{flagEmoji(bIso)}</span>
            {nameFor(bIso)}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Side-by-side passport strength: visa-free destinations, eTA coverage, and embassy
            requirements.
          </p>
        </header>

        {(!coverageA || !coverageB || coverageA.totalOptions + coverageB.totalOptions === 0) ? (
          <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-sm text-neutral-600 dark:text-neutral-400">
            <p className="font-medium mb-1">Comparison data not yet available.</p>
            <p>
              Run <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs">npm run bootstrap</code>{" "}
              to seed visa data, then revisit this page.
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4 mb-8">
              <SummaryCard iso={aIso} coverage={coverageA} />
              <SummaryCard iso={bIso} coverage={coverageB} />
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Coverage by visa status</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 px-3 text-center">{nameFor(aIso)}</th>
                      <th className="py-2 px-3 text-center">{nameFor(bIso)}</th>
                      <th className="py-2 pl-3 text-right">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROW_KEYS.map((key) => {
                      const aN = coverageA.byStatus[key];
                      const bN = coverageB.byStatus[key];
                      const delta = aN - bN;
                      return (
                        <tr key={key} className="border-b border-neutral-100 dark:border-neutral-900">
                          <td className="py-2 pr-3">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded ${STATUS_TONE[key]}`}>
                              {STATUS_LABEL[key]}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-medium">{aN}</td>
                          <td className="py-2 px-3 text-center font-medium">{bN}</td>
                          <td
                            className={`py-2 pl-3 text-right text-xs font-mono ${
                              delta > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : delta < 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-neutral-500"
                            }`}
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Coverage by visa purpose</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                      <th className="py-2 pr-3">Purpose</th>
                      <th className="py-2 px-3 text-center">{nameFor(aIso)}</th>
                      <th className="py-2 px-3 text-center">{nameFor(bIso)}</th>
                      <th className="py-2 pl-3 text-right">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["tourism", "business", "transit", "work", "study", "family", "diplomatic"] as Purpose[]).map((p) => {
                      const aN = coverageA.byPurpose[p];
                      const bN = coverageB.byPurpose[p];
                      const delta = aN - bN;
                      return (
                        <tr key={p} className="border-b border-neutral-100 dark:border-neutral-900">
                          <td className="py-2 pr-3 text-sm">{PURPOSE_LABEL[p]}</td>
                          <td className="py-2 px-3 text-center font-medium">{aN}</td>
                          <td className="py-2 px-3 text-center font-medium">{bN}</td>
                          <td
                            className={`py-2 pl-3 text-right text-xs font-mono ${
                              delta > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : delta < 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-neutral-500"
                            }`}
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href={`/passport/${aIso.toLowerCase()}`}
                className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition"
              >
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Full directory</p>
                <p className="font-semibold">
                  <span className="mr-1">{flagEmoji(aIso)}</span>
                  {nameFor(aIso)} passport details →
                </p>
              </Link>
              <Link
                href={`/passport/${bIso.toLowerCase()}`}
                className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition"
              >
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Full directory</p>
                <p className="font-semibold">
                  <span className="mr-1">{flagEmoji(bIso)}</span>
                  {nameFor(bIso)} passport details →
                </p>
              </Link>
            </section>
          </>
        )}

        <p className="mt-12 text-xs text-neutral-500 italic">
          Counts reflect the records currently in our database, derived from the official sources
          we&apos;ve scraped. This is not a complete passport-strength index — it&apos;s a
          coverage-honest snapshot of what we can verify.
        </p>
      </main>
    </>
  );
}

function SummaryCard({ iso, coverage }: { iso: string; coverage: CoverageSnapshot }) {
  return (
    <article className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <header className="flex items-center gap-3 mb-3">
        <span className="text-3xl" aria-hidden>{flagEmoji(iso)}</span>
        <div>
          <p className="font-semibold">{nameFor(iso)}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">passport</p>
        </div>
      </header>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-500 dark:text-neutral-400">Verified routes</dt>
          <dd className="font-semibold">{coverage.totalOptions}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500 dark:text-neutral-400">Distinct destinations</dt>
          <dd className="font-semibold">{coverage.totalDestinationsCovered}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500 dark:text-neutral-400">Visa-free</dt>
          <dd className="font-semibold text-emerald-700 dark:text-emerald-400">
            {coverage.byStatus.visa_free + coverage.byStatus.visa_free_with_eta}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500 dark:text-neutral-400">Embassy required</dt>
          <dd className="font-semibold text-amber-700 dark:text-amber-400">
            {coverage.byStatus.embassy_visa}
          </dd>
        </div>
      </dl>
    </article>
  );
}
