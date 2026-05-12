/**
 * Difficulty heat-map for a passport. Renders every covered destination
 * as a flag tile, colour-coded by the difficulty bucket (green=easy,
 * orange=medium, red=difficult — same palette as the rest of the site).
 * Grouped by region so the page reads as a "world view" without needing
 * an SVG world map.
 *
 * Used at the top of /passport/[iso] for an at-a-glance scan of where a
 * passport gets you in / where it doesn't.
 *
 * This wrapper stays as a server component: it precomputes the per-tile
 * difficulty bucket from the summaries (server-side scoring stays out of
 * the browser bundle) and hands the trimmed tiles to the client renderer.
 */
import type { DestinationSummaryForPassport } from "@/lib/coverage";
import type { ResolvedVisaOption } from "@/lib/types";
import { assessDifficulty } from "@/lib/difficulty";
import {
  DifficultyHeatMapView,
  type HeatMapTile,
  type HeatMapRegion,
} from "./DifficultyHeatMapView";

// Continental groupings for the world-view layout. Each iso2 is placed in
// exactly one region — covers the regions where we have meaningful data.
const REGIONS: HeatMapRegion[] = [
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

export function DifficultyHeatMap({
  passportIso2,
  summaries,
}: {
  passportIso2: string;
  summaries: DestinationSummaryForPassport[];
}) {
  const tiles: HeatMapTile[] = summaries.map((s) => {
    const a = assessDifficulty(summaryToResolved(s, passportIso2));
    return {
      iso2: s.destinationIso2,
      score: a.score,
      bucket: a.bucket,
      purpose: s.purpose,
    };
  });

  // "No data" count: codes in the region map without a covered cell.
  const knownCodes = new Set(REGIONS.flatMap((r) => r.codes));
  const covered = new Set(tiles.map((t) => t.iso2));
  let noDataCount = 0;
  for (const code of knownCodes) {
    if (code === passportIso2) continue;
    if (!covered.has(code)) noDataCount += 1;
  }

  return (
    <DifficultyHeatMapView
      passportIso2={passportIso2}
      tiles={tiles}
      regions={REGIONS}
      noDataCount={noDataCount}
    />
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
