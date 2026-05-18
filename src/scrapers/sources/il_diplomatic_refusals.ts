/**
 * Israel diplomatic-refusal adapter.
 *
 * A handful of states do not maintain diplomatic relations with Israel and
 * refuse entry to Israeli passport holders outright. These pairs are
 * politically sensitive and competitor visa-lookup sites frequently get
 * them wrong (showing "embassy visa" when reality is "no admission").
 *
 * Sources cross-checked at adapter-write time:
 *   - Israel MFA travel warnings:    https://www.gov.il/en/departments/news/travel_warnings
 *   - Australian DFAT Smartraveller: https://www.smartraveller.gov.au/destinations/
 *   - US State Department country pages
 *
 * Refresh: re-verify quarterly. Diplomatic relations change (Saudi Arabia and
 * UAE normalised under the Abraham Accords; Iran/Saudi rapprochement in 2023
 * has not yet extended to Israel; etc.) — keep the list tight rather than
 * speculative.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";

type Refusal = {
  iso2: string;
  /** Plain-English description of the refusal regime as published by the
   *  destination's MFA or by a major travel-advisory authority. */
  note: string;
  /** "refused" = blanket no-admission; "restricted" = admission via permit
   *  only (e.g. third-country entry stamps not accepted). */
  status: "refused" | "restricted";
  sourceUrl: string;
};

const REFUSALS: Refusal[] = [
  {
    iso2: "MY",
    status: "refused",
    note: "Malaysia does not recognise the State of Israel and refuses entry to Israeli passport holders. Holders of any other passport with an Israeli visa stamp historically faced additional scrutiny but no automatic refusal.",
    sourceUrl: "https://www.smartraveller.gov.au/destinations/asia/malaysia",
  },
  {
    iso2: "PK",
    status: "refused",
    note: "Pakistan does not recognise the State of Israel and the Pakistani passport explicitly excludes 'travel to Israel'. Reciprocal refusal applies to Israeli passport holders.",
    sourceUrl: "https://www.smartraveller.gov.au/destinations/asia/pakistan",
  },
  {
    iso2: "IR",
    status: "refused",
    note: "Iran refuses entry to Israeli passport holders and any traveller with an Israeli entry/exit stamp. Diplomatic relations were severed in 1979 and remain so.",
    sourceUrl: "https://www.gov.il/en/departments/news/travel_warnings",
  },
  {
    iso2: "BD",
    status: "refused",
    note: "Bangladesh does not recognise the State of Israel. The Bangladeshi passport historically read 'valid for all countries except Israel'. Israeli passport holders refused entry.",
    sourceUrl: "https://www.smartraveller.gov.au/destinations/asia/bangladesh",
  },
  {
    iso2: "SY",
    status: "refused",
    note: "Syria refuses entry to Israeli passport holders. State of war since 1948.",
    sourceUrl: "https://www.smartraveller.gov.au/destinations/middle-east/syria",
  },
  {
    iso2: "LB",
    status: "refused",
    note: "Lebanon refuses entry to Israeli passport holders and to other-passport travellers with Israeli stamps. Israel and Lebanon remain at war.",
    sourceUrl: "https://www.smartraveller.gov.au/destinations/middle-east/lebanon",
  },
  {
    iso2: "IQ",
    status: "refused",
    note: "Iraq refuses entry to Israeli passport holders.",
    sourceUrl: "https://www.smartraveller.gov.au/destinations/middle-east/iraq",
  },
  {
    iso2: "LY",
    status: "refused",
    note: "Libya refuses entry to Israeli passport holders.",
    sourceUrl: "https://www.smartraveller.gov.au/destinations/africa/libya",
  },
  {
    iso2: "YE",
    status: "refused",
    note: "Yemen refuses entry to Israeli passport holders.",
    sourceUrl: "https://www.smartraveller.gov.au/destinations/middle-east/yemen",
  },
];

export const ilDiplomaticRefusalsAdapter: Adapter = {
  metadata: {
    id: "il_diplomatic_refusals",
    name: "Israel — diplomatic-refusal destinations (hand-curated from MFA + advisories)",
    kind: "manual",
    parserVersion: "1.0.0",
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: REFUSALS.map((r) => r.sourceUrl),
    fixturePath: "src/scrapers/sources/__fixtures__/il_diplomatic_refusals.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "il_diplomatic_refusals" }), fetchUrl: "manual://il_diplomatic_refusals" };
  },

  async parse() {
    const records: ParsedRecord[] = REFUSALS.map((r) => ({
      passportIso2: "IL",
      destinationIso2: r.iso2,
      purpose: "tourism" as const,
      status: r.status,
      label: r.status === "refused" ? "Entry refused — no diplomatic relations" : "Entry restricted — permit only",
      maxStayDays: null,
      entriesAllowed: "single",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: null,
      proofOfFundsRequired: null,
      proofOfAccommodationRequired: null,
      biometricsRequired: null,
      requirements: [
        r.note,
        "Holders of other passports with Israeli entry/exit stamps may also face additional scrutiny or refusal — check the destination's MFA before travel.",
      ],
      applicationUrl: r.sourceUrl,
      primarySourceUrl: r.sourceUrl,
      fees: [],
      notes: `Diplomatic-refusal pair. Sources: ${r.sourceUrl}. Israel MFA travel warnings: https://www.gov.il/en/departments/news/travel_warnings`,
    }));

    return { records };
  },
};
