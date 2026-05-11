/**
 * Wikipedia "Visa requirements for X citizens" long-tail adapter.
 *
 * Fills the long tail of (passport, destination) cells we don't have direct
 * government scrapers for — Zimbabwean → Mongolian, Bolivian → Kazakh, etc.
 * Wikipedia maintains 250 community-curated pages of this form and they are
 * the most consistent structured source for low-traffic cells.
 *
 * Confidence is intentionally low (kind="wikipedia") — every record is also
 * tagged with the destination's curated MFA portal as a secondary source so
 * users land on the .gov page when one exists.
 *
 * Refresh path: `npx tsx src/scripts/buildWikipediaFixture.ts` re-fetches the
 * Wikipedia pages and rewrites the fixture JSON. The adapter itself only
 * reads the fixture, so bootstrap stays offline-safe.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import type { VisaStatus } from "@/lib/types";
import { resourcesFor } from "@/content/countryResources";
import { COUNTRY_LIST } from "@/lib/countries";

type FixturePassport = {
  iso2: string;
  wikipediaUrl: string;
  fetchedAt: string;
  rows: Array<{
    destinationIso2: string;
    status: VisaStatus;
    maxStayDays: number | null;
    notes: string | null;
    rawRequirement: string;
  }>;
};

type Fixture = {
  generatedAt: string;
  passports: FixturePassport[];
};

const FIXTURE_PATH = "src/scrapers/sources/__fixtures__/wikipedia_long_tail.json";

export const wikipediaLongTailAdapter: Adapter = {
  metadata: {
    id: "wikipedia_long_tail",
    name: "Wikipedia visa-requirements (long tail)",
    kind: "wikipedia",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: ["https://en.wikipedia.org/wiki/Category:Visa_requirements_by_nationality"],
    fixturePath: FIXTURE_PATH,
  },

  async fetch(_ctx: FetchContext) {
    // The adapter only reads the fixture — refreshing comes from the explicit
    // build script. Returning null here means the scheduler skips this source
    // outside fixture-mode bootstrap.
    return null;
  },

  async parse(raw) {
    let fixture: Fixture;
    try {
      fixture = JSON.parse(raw.rawText) as Fixture;
    } catch (err) {
      return { records: [], parseError: `Could not parse Wikipedia fixture JSON: ${err instanceof Error ? err.message : String(err)}` };
    }

    const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
    const records: ParsedRecord[] = [];

    for (const passport of fixture.passports) {
      if (!validIso.has(passport.iso2)) continue;

      for (const row of passport.rows) {
        if (!validIso.has(row.destinationIso2)) continue;
        if (row.destinationIso2 === passport.iso2) continue;

        // Prefer the destination's curated official portal as the primary
        // source — Wikipedia is the discovery layer, the .gov page is the
        // truth. Falls back to the Wikipedia page when no portal is curated.
        const destResources = resourcesFor(row.destinationIso2);
        const primarySourceUrl = destResources?.visaPortal ?? passport.wikipediaUrl;

        records.push({
          passportIso2: passport.iso2,
          destinationIso2: row.destinationIso2,
          purpose: "tourism",
          status: row.status,
          label: labelFor(row.status, row.maxStayDays),
          maxStayDays: row.maxStayDays,
          validityDays: null,
          entriesAllowed: row.status === "embassy_visa" ? "single" : "multiple",
          passportValidityMonthsRequired: 6,
          onwardTicketRequired: null,
          proofOfFundsRequired: null,
          proofOfAccommodationRequired: null,
          biometricsRequired: row.status === "embassy_visa" ? true : null,
          biometricsLocation: row.status === "embassy_visa" ? "embassy or VFS centre" : null,
          requirements: requirementsFor(row.status),
          processingTimeDaysMin: null,
          processingTimeDaysMax: null,
          applicationUrl: destResources?.visaPortal ?? null,
          primarySourceUrl,
          fees: [],
          // Append the CC-BY-SA attribution + Wikipedia URL to every row's notes
          // so the licence is preserved per-row, not just on the about page.
          notes: appendAttribution(row.notes, passport.wikipediaUrl),
        });
      }
    }

    if (records.length === 0) {
      return { records, parseError: "Wikipedia fixture is empty — run `npx tsx src/scripts/buildWikipediaFixture.ts` to populate it." };
    }
    return { records };
  },
};

function appendAttribution(notes: string | null, wikipediaUrl: string): string {
  const attribution = `Source: Wikipedia (${wikipediaUrl}) — community-curated, licensed CC-BY-SA 4.0.`;
  if (!notes) return attribution;
  return `${notes}\n\n${attribution}`;
}

function labelFor(status: VisaStatus, maxStayDays: number | null): string {
  const stay = maxStayDays != null ? ` (${maxStayDays} days)` : "";
  switch (status) {
    case "visa_free":
      return `Visa-free${stay}`;
    case "visa_free_with_eta":
      return `Visa-free with electronic travel authorisation${stay}`;
    case "visa_on_arrival":
      return `Visa on arrival${stay}`;
    case "e_visa":
      return `e-Visa${stay}`;
    case "embassy_visa":
      return `Embassy visa required`;
    case "restricted":
      return `Entry restricted (case-by-case)`;
    case "refused":
      return `Entry generally refused`;
  }
}

function requirementsFor(status: VisaStatus): string[] {
  switch (status) {
    case "visa_free":
    case "visa_free_with_eta":
      return ["Valid passport", "Onward / return ticket", "Proof of accommodation may be requested at the border"];
    case "visa_on_arrival":
      return ["Valid passport (typically 6+ months validity)", "Onward / return ticket", "Cash for visa fee at the border"];
    case "e_visa":
      return ["Valid passport", "Online application before travel", "Print or digital copy of approved e-visa"];
    case "embassy_visa":
      return ["Valid passport", "Application submitted in person to the destination's embassy / consulate", "Supporting documents (varies by destination)"];
    case "restricted":
    case "refused":
      return ["Application reviewed case-by-case — consult the destination's embassy directly"];
  }
}
