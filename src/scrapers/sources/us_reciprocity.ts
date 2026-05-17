/**
 * US State Department reciprocity adapter (B-1/B-2 fee + validity + entries).
 *
 * Source: https://travel.state.gov/.../reciprocity/{country}.html
 *
 * The State Department publishes per-nationality reciprocity schedules
 * specifying B-1/B-2 issuance fee, validity, and number of entries. Each
 * country has its own page; this adapter inlines the 25 most-traveled
 * origin countries from src/content/usReciprocity.ts (the same curated
 * data that powers the UsReciprocityPanel on US-bound route pages) and
 * emits structured records.
 *
 * Once a full per-country HTML scraper exists, this adapter swaps the
 * inline source for the scrape — keeping the same record shape.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { US_RECIPROCITY } from "@/content/usReciprocity";

const SOURCE_URL =
  "https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country.html";

export const usReciprocityAdapter: Adapter = {
  metadata: {
    id: "us_reciprocity",
    name: "US visa reciprocity (travel.state.gov per-nationality schedule)",
    kind: "government",
    parserVersion: "2026.05.17",
    // Reciprocity schedules change rarely; weekly liveness check is enough.
    defaultIntervalMs: 7 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    if (!/reciprocity|travel\.state|B-1\/B-2/i.test(raw.rawText)) {
      return { records: [], parseError: "travel.state.gov reciprocity page did not match expected wording." };
    }

    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const note of Object.values(US_RECIPROCITY)) {
      // VWP / ESTA-eligible nationalities don't need B-visa — skip emitting
      // a B-class record for them (their ESTA record comes from
      // usVisaWaiverProgramAdapter).
      if (note.validity.includes("Visa Waiver Program") || note.validity.includes("ESTA")) {
        continue;
      }

      // Parse the validity string into a rough day count for the schema.
      const validityDays = parseValidityToDays(note.validity);

      records.push({
        passportIso2: note.iso2,
        destinationIso2: "US",
        purpose: "tourism",
        status: "embassy_visa",
        label: `US B-1/B-2 visa (validity ${note.validity}, ${note.entries})`,
        maxStayDays: 180, // CBP sets at port; B-1/B-2 standard max 6 months per entry
        validityDays,
        entriesAllowed: /single/i.test(note.entries) ? "single" : "multiple",
        passportValidityMonthsRequired: 6,
        onwardTicketRequired: true,
        proofOfFundsRequired: true,
        requirements: [
          "DS-160 application + $185 MRV fee + interview at US Embassy / Consulate",
          "Demonstrate ties to home country (employment, property, family)",
          "Onward / return ticket; itinerary and accommodation evidence",
          "Per-nationality reciprocity issuance fee (see notes)",
        ],
        processingTimeDaysMin: 14,
        processingTimeDaysMax: 90,
        applicationUrl: note.sourceUrl,
        primarySourceUrl: note.sourceUrl,
        fees: [
          { kind: "base", amountMinor: 18500, currency: "USD", asOf: today, optional: false },
        ],
        notes: `${note.issuanceFeeSummary}. ${note.body}`,
      });
    }

    if (records.length < 15) {
      return { records, parseError: `Only ${records.length} US reciprocity records (expected 20+).` };
    }
    return { records };
  },
};

function parseValidityToDays(validity: string): number | null {
  const m = validity.match(/(\d+)\s*(year|month)/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return m[2].toLowerCase().startsWith("month") ? n * 30 : n * 365;
}
