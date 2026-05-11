/**
 * Difficulty heat-map for a passport. Renders every covered destination
 * as a flag tile, colour-coded by the same difficulty bucket the rest of
 * the site uses (green=easy / amber=medium / red=hard). Grouped by region
 * so the page reads as a "world view" without needing an SVG world map.
 *
 * Used at the top of /passport/[iso] for an at-a-glance scan of where a
 * passport gets you in / where it doesn't.
 */
import Link from "next/link";
import type { DestinationSummaryForPassport } from "@/lib/coverage";
import type { ResolvedVisaOption } from "@/lib/types";
import { assessDifficulty, type DifficultyBucket } from "@/lib/difficulty";
import { flagEmoji, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";

// Continental groupings for the world-view layout. Each iso2 is placed in
// exactly one region — covers the regions where we have meaningful data.
const REGIONS: Array<{ name: string; codes: string[] }> = [
  {
    name: "Europe",
    codes: [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
      "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
      "PT", "RO", "SK", "SI", "ES", "SE", "CH", "GB", "AL", "AD", "BA", "MK",
      "MC", "ME", "RS", "SM", "VA", "MD", "UA", "BY", "RU", "TR", "XK",
    ],
  },
  {
    name: "Americas",
    codes: [
      "US", "CA", "MX", "GT", "BZ", "SV", "HN", "NI", "CR", "PA",
      "BR", "AR", "CL", "PE", "CO", "VE", "EC", "BO", "PY", "UY", "GY", "SR", "GF",
      "CU", "DO", "HT", "JM", "BS", "BB", "TT", "AG", "DM", "GD", "KN", "LC", "VC",
      "PR", "GL",
    ],
  },
  {
    name: "Asia",
    codes: [
      "CN", "JP", "KR", "KP", "HK", "MO", "TW", "MN",
      "IN", "PK", "BD", "LK", "NP", "BT", "MV", "AF",
      "TH", "VN", "ID", "MY", "SG", "PH", "MM", "KH", "LA", "BN", "TL",
      "KZ", "UZ", "TM", "TJ", "KG", "AZ", "AM", "GE",
    ],
  },
  {
    name: "Middle East",
    codes: [
      "SA", "AE", "QA", "BH", "KW", "OM", "IL", "JO", "LB", "SY", "IQ", "IR",
      "YE", "PS",
    ],
  },
  {
    name: "Africa",
    codes: [
      "EG", "MA", "DZ", "TN", "LY", "SD", "SS",
      "NG", "GH", "CI", "SN", "BJ", "BF", "ML", "NE", "TG", "GM", "GW", "GN",
      "SL", "LR", "CV", "MR",
      "ET", "KE", "TZ", "UG", "RW", "BI", "DJ", "SO", "ER",
      "CM", "TD", "CF", "CG", "CD", "GA", "GQ", "ST", "AO",
      "ZA", "BW", "NA", "ZM", "ZW", "MZ", "MW", "MG", "MU", "SC", "KM", "LS", "SZ",
    ],
  },
  {
    name: "Oceania",
    codes: ["AU", "NZ", "PG", "FJ", "WS", "TO", "VU", "SB", "KI", "MH", "FM", "NR", "PW", "TV", "CK", "NU"],
  },
];

const TONE: Record<DifficultyBucket, { tile: string; label: string }> = {
  easy: {
    tile: "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 ring-emerald-300 dark:ring-emerald-700",
    label: "Easy",
  },
  medium: {
    tile: "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 ring-amber-300 dark:ring-amber-700",
    label: "Moderate",
  },
  hard: {
    tile: "bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 ring-red-300 dark:ring-red-700",
    label: "Hard",
  },
};

const NO_DATA_TILE =
  "bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700 ring-neutral-200 dark:ring-neutral-800";

export function DifficultyHeatMap({
  passportIso2,
  summaries,
}: {
  passportIso2: string;
  summaries: DestinationSummaryForPassport[];
}) {
  const byIso = new Map<string, { score: number; bucket: DifficultyBucket; purpose: string }>();
  for (const s of summaries) {
    const opt = summaryToResolved(s, passportIso2);
    const a = assessDifficulty(opt);
    byIso.set(s.destinationIso2, { score: a.score, bucket: a.bucket, purpose: s.purpose });
  }

  const totals = { easy: 0, medium: 0, hard: 0, noData: 0 };
  for (const [, v] of byIso) totals[v.bucket] += 1;

  // Show "no data" tiles only for codes inside our region map. We don't have
  // a covered cell for every ISO, so this gives users an honest "we don't know
  // about this country yet" indicator rather than silently omitting it.
  const knownCodes = new Set(REGIONS.flatMap((r) => r.codes));
  let noDataCount = 0;
  for (const code of knownCodes) {
    if (code === passportIso2) continue;
    if (!byIso.has(code)) noDataCount += 1;
  }
  totals.noData = noDataCount;

  return (
    <section className="mt-10">
      <header className="mb-3">
        <h2 className="text-lg font-semibold mb-1">
          Where can {nationalityFor(passportIso2)} passport holders go?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tile colour reflects the headline tourism difficulty for each destination. Click any tile
          for the full breakdown.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-5 text-xs">
        <Legend tone="easy" count={totals.easy} />
        <Legend tone="medium" count={totals.medium} />
        <Legend tone="hard" count={totals.hard} />
        <span className="inline-flex items-center gap-1.5 text-neutral-500">
          <span className="inline-block w-3 h-3 rounded-sm bg-neutral-100 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800" />
          No data ({totals.noData})
        </span>
      </div>

      <div className="space-y-5">
        {REGIONS.map((region) => (
          <div key={region.name}>
            <h3 className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
              {region.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {region.codes
                .filter((c) => c !== passportIso2)
                .map((code) => {
                  const data = byIso.get(code);
                  const tone = data ? TONE[data.bucket].tile : NO_DATA_TILE;
                  const score = data?.score;
                  const purpose = data?.purpose ?? "tourism";
                  return (
                    <Link
                      key={code}
                      href={`/${passportIso2.toLowerCase()}/${code.toLowerCase()}?purpose=${purpose}`}
                      prefetch={false}
                      title={
                        data
                          ? `${nameFor(code)} — ${TONE[data.bucket].label} (${score}/10)`
                          : `${nameFor(code)} — no data yet`
                      }
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md ring-1 transition text-xs ${tone}`}
                    >
                      <span className="text-base leading-none shrink-0" aria-hidden>{flagEmoji(code)}</span>
                      <span className="flex-1 min-w-0 truncate font-medium">{nameFor(code)}</span>
                      {score != null && (
                        <span className="shrink-0 font-mono text-[10px] opacity-70">{score}</span>
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Legend({ tone, count }: { tone: DifficultyBucket; count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded-sm ring-1 ${TONE[tone].tile}`} />
      {TONE[tone].label} ({count})
    </span>
  );
}

function summaryToResolved(
  s: DestinationSummaryForPassport,
  passportIso2: string,
): ResolvedVisaOption {
  return {
    id: -1,
    passportIso2,
    destinationIso2: s.destinationIso2,
    purpose: s.purpose,
    status: s.status,
    label: s.label,
    maxStayDays: s.maxStayDays,
    validityDays: null,
    entriesAllowed: null,
    passportValidityMonthsRequired: s.passportValidityMonthsRequired,
    blankPagesRequired: null,
    onwardTicketRequired: s.onwardTicketRequired,
    proofOfFundsRequired: s.proofOfFundsRequired,
    proofOfAccommodationRequired: s.proofOfAccommodationRequired,
    biometricsRequired: s.biometricsRequired,
    biometricsLocation: null,
    requirements: new Array(s.requirementsCount).fill(""),
    vaccinationRequirements: [],
    processingTimeDaysMin: null,
    processingTimeDaysMax: s.processingTimeDaysMax,
    applicationUrl: null,
    primarySourceUrl: null,
    fees: s.fees.map((f) => ({
      kind: f.kind as "base" | "service" | "biometrics" | "courier" | "vac" | "rush" | "other",
      amountMinor: f.amountMinor,
      currency: f.currency,
      asOf: "",
      optional: f.optional,
    })),
    blocDerivedFrom: null,
    eta: null,
    purposeMetadata: null,
    correctnessBucket: "high",
    lastFetchedAt: null,
    lastVerifiedAt: null,
    notes: null,
  };
}
