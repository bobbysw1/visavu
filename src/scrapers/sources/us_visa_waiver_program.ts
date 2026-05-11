/**
 * US Visa Waiver Program (VWP) adapter.
 *
 * Source: https://www.state.gov/visa-waiver-program/
 *
 * What it produces: for each VWP-designated country, a `visa_free_with_eta`
 * VisaOption for tourism into the US, with the ESTA companion attached
 * implicitly via the resolver's eTA-eligibility join (we also seed eta_eligibility
 * rows from this same parse).
 *
 * Why this is the right first scraper: the page is static HTML, the data is a
 * small enumerated list (~41 entries), and it covers a high-traffic destination
 * (the US is in the top 5 destinations globally). One adapter exercises the
 * full pipeline and immediately produces useful data.
 *
 * What it does NOT cover: the per-country reciprocity fee schedule (separate
 * adapter, more complex parsing), or VWP-eligible nationalities entering for
 * non-tourism purposes. Those need their own adapters.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";

const SOURCE_URL =
  "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html";

// The State.gov page does not consistently use ISO codes. Build a normalization
// map from the canonical country list, supplemented with VWP-specific aliases
// where the page's wording differs from the ISO English name.
const VWP_NAME_OVERRIDES: Record<string, string> = {
  "Brunei": "BN",
  "Czech Republic": "CZ",
  "Korea, Republic of": "KR",
  "Republic of Korea": "KR",
  "South Korea": "KR",
  "Slovak Republic": "SK",
  "Taiwan*": "TW", // page footnotes Taiwan with an asterisk
  "United Kingdom": "GB",
};

function nameToIso(name: string): string | null {
  const trimmed = name.replace(/\*+\s*$/, "").trim();
  if (VWP_NAME_OVERRIDES[trimmed]) return VWP_NAME_OVERRIDES[trimmed];
  const found = COUNTRY_LIST.find(
    (c) => c.name.localeCompare(trimmed, "en", { sensitivity: "base" }) === 0,
  );
  return found?.iso2 ?? null;
}

export const usVisaWaiverProgramAdapter: Adapter = {
  metadata: {
    id: "us_visa_waiver_program",
    name: "US Visa Waiver Program (state.gov)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000, // weekly — VWP membership changes rarely
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/us_visa_waiver_program.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    const rawText = await res.text();
    return { rawText, fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);

    // VWP designated countries are listed in <ul> bullets. travel.state.gov
    // wraps content in proprietary `tsg-rwd-*` classes (no <main> / <article>),
    // so we collect every <li> on the page and rely on the length/punctuation
    // filters + ISO-name match below to discard nav and footer noise.
    const candidates = new Set<string>();
    $("li").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      // Discard list items that are clearly not country names.
      if (text.length < 3 || text.length > 60) return;
      if (/[.:;/?!]/.test(text)) return;
      // Discard nav items that contain links to other pages.
      if ($(el).find("a").length > 0 && $(el).find("a").text().trim() !== text) return;
      candidates.add(text);
    });

    const records: ParsedRecord[] = [];
    const today = new Date().toISOString().slice(0, 10);
    for (const candidate of candidates) {
      const iso = nameToIso(candidate);
      if (!iso) continue;
      // Skip the destination itself (US) and any non-country values that
      // happened to fuzzy-match (defensive).
      if (iso === "US") continue;

      records.push({
        passportIso2: iso,
        destinationIso2: "US",
        purpose: "tourism",
        status: "visa_free_with_eta",
        label: "Visa Waiver Program (ESTA required)",
        maxStayDays: 90,
        validityDays: null,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: true,
        biometricsRequired: false,
        requirements: [
          "Valid e-passport (with electronic chip)",
          "Approved ESTA before boarding",
          "Onward or return ticket",
          "Travel for tourism, business, or transit only (no work or study)",
        ],
        applicationUrl: "https://esta.cbp.dhs.gov/",
        primarySourceUrl: SOURCE_URL,
        fees: [
          {
            kind: "service",
            // ESTA fee is $21 USD as of 2025 ($4 processing + $17 authorization).
            // Stored as the date the parser was run; the merge layer respects
            // freshness independently.
            amountMinor: 2100,
            currency: "USD",
            asOf: today,
            label: "ESTA fee",
          },
        ],
        notes:
          "Visa Waiver Program: travel without a visa for stays up to 90 days. Must obtain ESTA before boarding. Cannot extend stay or change status while in the US.",
      });
    }

    if (records.length === 0) {
      return {
        records: [],
        parseError:
          "No VWP countries detected. Page structure may have changed — investigate the .entry-content selectors.",
      };
    }

    // Sanity check: VWP has historically been ~40 countries. <20 or >80 likely
    // means a parse drift; flag for review.
    if (records.length < 20 || records.length > 80) {
      return {
        records,
        parseError: `VWP record count ${records.length} is outside expected range [20, 80]; verify against ${SOURCE_URL}`,
      };
    }

    return { records };
  },
};
