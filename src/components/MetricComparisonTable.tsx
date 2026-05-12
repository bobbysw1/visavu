/**
 * MetricComparisonTable — side-by-side metric comparison for /compare/[a]/[b].
 *
 * Visual hierarchy: one row per metric, two value columns, a tiny winner
 * indicator on the side that wins (or "tied" / "no data" when neither
 * side has a meaningful number). Designed for the "scan in 5 seconds"
 * brief from the redesign — no paragraph explanations, just the numbers
 * + a clear pointer.
 *
 * Routes that don't have a curated metric on EITHER side are dropped
 * rather than rendered as a "— vs —" row (avoids dead-row clutter).
 */
import { Banknote, ShoppingCart, Receipt, HeartPulse, ShieldCheck, Languages, Home } from "lucide-react";
import {
  metricsFor,
  ENGLISH_BAND_LABEL,
  type CountryMetrics,
  type EnglishBand,
} from "@/lib/countryMetrics";
import { nameFor, flagEmoji } from "@/lib/countries";

type Direction = "higher_better" | "lower_better";

type Row = {
  key: string;
  icon: typeof Banknote;
  label: string;
  aValue: string;
  bValue: string;
  aSort: number | null;
  bSort: number | null;
  direction: Direction;
};

export function MetricComparisonTable({ aIso, bIso }: { aIso: string; bIso: string }) {
  const a = metricsFor(aIso);
  const b = metricsFor(bIso);

  if (!a && !b) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-5 text-sm text-neutral-600 dark:text-neutral-400">
        Living-conditions metrics aren&apos;t curated for {nameFor(aIso)} or {nameFor(bIso)} yet.
      </div>
    );
  }

  const rows = buildRows(a, b).filter((r) => r.aSort != null || r.bSort != null);

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-900/40 text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
            <th className="px-3 py-2.5 font-semibold">Metric</th>
            <th className="px-3 py-2.5 font-semibold text-right">
              <span className="mr-1" aria-hidden>{flagEmoji(aIso)}</span>
              {nameFor(aIso)}
            </th>
            <th className="px-3 py-2.5 font-semibold text-right">
              <span className="mr-1" aria-hidden>{flagEmoji(bIso)}</span>
              {nameFor(bIso)}
            </th>
            <th className="px-3 py-2.5 font-semibold text-right">Edge</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const winner = pickWinner(row);
            return (
              <tr
                key={row.key}
                className="border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
              >
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <row.icon size={14} className="text-neutral-400" aria-hidden />
                    {row.label}
                  </span>
                </td>
                <td
                  className={`px-3 py-2.5 text-right tabular-nums font-medium ${
                    winner === "a" ? "text-emerald-700 dark:text-emerald-300" : ""
                  }`}
                >
                  {row.aValue}
                </td>
                <td
                  className={`px-3 py-2.5 text-right tabular-nums font-medium ${
                    winner === "b" ? "text-emerald-700 dark:text-emerald-300" : ""
                  }`}
                >
                  {row.bValue}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {winner === "a" ? (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                      ← {aIso}
                    </span>
                  ) : winner === "b" ? (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                      {bIso} →
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">{winner === "tied" ? "tied" : "—"}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-3 py-2 text-[11px] text-neutral-500 dark:text-neutral-400">
        Sources: OECD wages · Numbeo COL &amp; Healthcare · GPI 2024 · EF EPI 2024 · National immigration
        authorities. Approximate; verify before relying on a single number.
      </p>
    </div>
  );
}

function pickWinner(row: Row): "a" | "b" | "tied" | "none" {
  if (row.aSort == null && row.bSort == null) return "none";
  if (row.aSort == null) return "b";
  if (row.bSort == null) return "a";
  if (row.aSort === row.bSort) return "tied";
  if (row.direction === "higher_better") return row.aSort > row.bSort ? "a" : "b";
  return row.aSort < row.bSort ? "a" : "b";
}

function englishBandToSort(band: EnglishBand | null): number | null {
  if (!band) return null;
  return { very_high: 5, high: 4, moderate: 3, low: 2, very_low: 1 }[band];
}

function fmtSalary(usd: number | null): string {
  if (usd == null) return "—";
  return `$${(usd / 1000).toFixed(0)}k`;
}

function fmtPr(years: number | null): string {
  if (years == null) return "Limited";
  return `${years} yr${years === 1 ? "" : "s"}`;
}

function buildRows(a: CountryMetrics | null, b: CountryMetrics | null): Row[] {
  return [
    {
      key: "salary",
      icon: Banknote,
      label: "Avg salary (USD)",
      aValue: fmtSalary(a?.avgSalaryUsd ?? null),
      bValue: fmtSalary(b?.avgSalaryUsd ?? null),
      aSort: a?.avgSalaryUsd ?? null,
      bSort: b?.avgSalaryUsd ?? null,
      direction: "higher_better",
    },
    {
      key: "col",
      icon: ShoppingCart,
      label: "Cost of living (NYC=100)",
      aValue: a?.costOfLivingIndex != null ? `${Math.round(a.costOfLivingIndex)}` : "—",
      bValue: b?.costOfLivingIndex != null ? `${Math.round(b.costOfLivingIndex)}` : "—",
      aSort: a?.costOfLivingIndex ?? null,
      bSort: b?.costOfLivingIndex ?? null,
      direction: "lower_better",
    },
    {
      key: "tax",
      icon: Receipt,
      label: "Top income tax",
      aValue: a?.topTaxRatePct != null ? `${a.topTaxRatePct}%` : "—",
      bValue: b?.topTaxRatePct != null ? `${b.topTaxRatePct}%` : "—",
      aSort: a?.topTaxRatePct ?? null,
      bSort: b?.topTaxRatePct ?? null,
      direction: "lower_better",
    },
    {
      key: "healthcare",
      icon: HeartPulse,
      label: "Healthcare index",
      aValue: a?.healthcareIndex != null ? `${Math.round(a.healthcareIndex)}/100` : "—",
      bValue: b?.healthcareIndex != null ? `${Math.round(b.healthcareIndex)}/100` : "—",
      aSort: a?.healthcareIndex ?? null,
      bSort: b?.healthcareIndex ?? null,
      direction: "higher_better",
    },
    {
      key: "safety",
      icon: ShieldCheck,
      label: "Safety (GPI rank)",
      aValue: a?.safetyGpiRank != null ? `#${a.safetyGpiRank}` : "—",
      bValue: b?.safetyGpiRank != null ? `#${b.safetyGpiRank}` : "—",
      aSort: a?.safetyGpiRank ?? null,
      bSort: b?.safetyGpiRank ?? null,
      direction: "lower_better",
    },
    {
      key: "english",
      icon: Languages,
      label: "English proficiency",
      aValue: a?.englishBand ? ENGLISH_BAND_LABEL[a.englishBand] : "—",
      bValue: b?.englishBand ? ENGLISH_BAND_LABEL[b.englishBand] : "—",
      aSort: englishBandToSort(a?.englishBand ?? null),
      bSort: englishBandToSort(b?.englishBand ?? null),
      direction: "higher_better",
    },
    {
      key: "pr",
      icon: Home,
      label: "PR pathway",
      aValue: fmtPr(a?.permanentResidencyYears ?? null),
      bValue: fmtPr(b?.permanentResidencyYears ?? null),
      aSort: a?.permanentResidencyYears ?? null,
      bSort: b?.permanentResidencyYears ?? null,
      direction: "lower_better",
    },
  ];
}
