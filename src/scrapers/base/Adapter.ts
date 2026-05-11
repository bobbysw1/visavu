/**
 * Per-source scraper adapter interface. Every scraper conforms to this shape —
 * standardization is fragility containment. When a site breaks, you fix one
 * adapter; the pipeline above (queueing, diffing, confidence) is unchanged.
 *
 * Pipeline: fetch() → parse() → normalize() → diff() → upsert()
 *   - fetch: get the raw bytes (HTML, JSON, PDF). Adapter chooses fetch vs Playwright.
 *   - parse: extract structured records in the source's original locale.
 *   - normalize: map to the canonical (passport_id, destination_iso2, purpose) records.
 *   - diff: hash the normalized JSON and compare against the previous SourceRecord.
 *   - upsert: write a new SourceRecord; merging into visa_options is the next stage.
 *
 * Key design decisions encoded here:
 *   - Diff is on PARSED JSON, not raw HTML (HTML diffs are noisy).
 *   - Parser failure is recorded, not thrown — a 0-record run with a parse_error
 *     is itself a signal worth alerting on.
 *   - Confidence/correctness is NOT computed by the adapter. The adapter
 *     declares its source kind and field weights; confidence is centralized.
 */
import { createHash } from "node:crypto";
import type { Purpose, VisaStatus } from "@/lib/types";

export type ParsedRecord = {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
  status: VisaStatus;
  label: string;
  maxStayDays?: number | null;
  validityDays?: number | null;
  entriesAllowed?: string | null;
  passportValidityMonthsRequired?: number | null;
  blankPagesRequired?: number | null;
  onwardTicketRequired?: boolean | null;
  proofOfFundsRequired?: boolean | null;
  proofOfAccommodationRequired?: boolean | null;
  biometricsRequired?: boolean | null;
  biometricsLocation?: string | null;
  requirements?: string[];
  vaccinationRequirements?: string[];
  processingTimeDaysMin?: number | null;
  processingTimeDaysMax?: number | null;
  applicationUrl?: string | null;
  primarySourceUrl?: string | null;
  fees?: Array<{
    kind: "base" | "service" | "biometrics" | "courier" | "vac" | "rush" | "other";
    amountMinor: number;
    currency: string;
    asOf: string; // ISO date
    label?: string;
    optional?: boolean;
  }>;
  notes?: string | null;
  // The bloc id this record is derived from, if any (e.g. "schengen").
  blocDerivedFrom?: string | null;
  // Purpose-specific structured metadata. See PurposeMetadataByPurpose in lib/types.
  purposeMetadata?: Record<string, unknown> | null;
};

export type FetchContext = {
  // Rotated proxy origin if relevant. Some sources vary content by visitor location.
  proxyCountry?: string;
  // Allow adapter to skip if last fetched within this window (set by scheduler).
  freshnessWindowMs?: number;
  // Use the adapter's bundled fixture instead of hitting the network. Used by
  // bootstrap (offline dev seeding) and CI tests.
  useFixture?: boolean;
};

export type AdapterMetadata = {
  id: string; // matches sources.id
  name: string;
  kind: "government" | "embassy" | "wikipedia" | "wikidata" | "regional_bloc" | "manual";
  parserVersion: string;
  // Hint to the scheduler. Anti-bot or low-change sources can run weekly; volatile fee
  // pages should run daily. Per-source tuning lives here so the scheduler stays generic.
  defaultIntervalMs: number;
  // The source URL(s) the adapter pulls from. Surfaced for primary-source linking.
  primaryUrls: string[];
  // Path (relative to repo root) to a fixture HTML/JSON file used by
  // bootstrap/CI/dev when ctx.useFixture is set. Lets us seed the DB without
  // network access and lets tests stay deterministic.
  fixturePath?: string;
};

export interface Adapter {
  metadata: AdapterMetadata;

  /**
   * Pull raw input. Implementation chooses fetch + Cheerio vs Playwright per page.
   * Returning null means "skip this run" (e.g. site responded 503; no records to parse).
   */
  fetch(ctx: FetchContext): Promise<{ rawText: string; fetchUrl: string } | null>;

  /**
   * Parse the raw input into normalized records. Throw only on programmer error;
   * use `{ records: [], parseError: string }` for parser-failure-but-fetch-OK.
   */
  parse(raw: { rawText: string; fetchUrl: string }): Promise<{
    records: ParsedRecord[];
    parseError?: string;
  }>;
}

// Stable hash of normalized records — used for change detection. Hash the parsed
// JSON, not raw HTML; raw HTML changes for non-semantic reasons constantly.
export function hashRecords(records: ParsedRecord[]): string {
  // Stable stringify by sorting keys at every level.
  const sorted = JSON.stringify(records, (_, v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)));
    }
    return v;
  });
  return createHash("sha256").update(sorted).digest("hex");
}
