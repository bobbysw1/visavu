/**
 * Merge layer — turn parsed scraper output into the consolidated
 * visa_options + fee_components + verification_events that the resolver reads.
 *
 * Today's scope (single-source-per-cell):
 *   - Each adapter run produces N ParsedRecord rows.
 *   - For each, we upsert one visa_option keyed by (passport, destination,
 *     purpose, label). Label is the discriminator for multi-option cells
 *     (e.g. "e-Tourist 30-day" vs "e-Tourist 1-year" both for US→IN tourism).
 *   - Replace fees wholesale (we own them; if the source no longer asserts
 *     a fee, it's gone).
 *   - Compute correctness from the asserting source's authority weights.
 *   - Insert verification_events of kind=fetch.
 *
 * Tomorrow's extension (multi-source-per-cell):
 *   - When two adapters assert the same (passport, dest, purpose, label),
 *     gather both SourceAssertions, run them through fieldCorrectness, and
 *     write the consensus value per field plus a higher-confidence record.
 *   - This requires a "consensus pass" after all scrapers run, not per-record.
 *   - Out of scope for Phase 4a; the schema supports it via source_records +
 *     verification_events of kind=cross_source.
 */
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";
import type { ParsedRecord } from "./Adapter";
import {
  recordCorrectness,
  type SourceAssertion,
} from "@/lib/confidence";

export type MergeResult = {
  inserted: number;
  updated: number;
  feeRowsWritten: number;
  errors: Array<{ passport: string; destination: string; purpose: string; reason: string }>;
};

const PASSPORT_CACHE = new Map<string, number>();

async function passportIdFor(iso2: string): Promise<number | null> {
  const cached = PASSPORT_CACHE.get(iso2);
  if (cached !== undefined) return cached;

  const rows = await db
    .select({ id: schema.passports.id })
    .from(schema.passports)
    .where(and(eq(schema.passports.issuerIso2, iso2), eq(schema.passports.type, "ordinary")))
    .limit(1);

  if (rows.length === 0) return null;
  PASSPORT_CACHE.set(iso2, rows[0].id);
  return rows[0].id;
}

export async function mergeRecords(
  records: ParsedRecord[],
  sourceMeta: {
    sourceId: string;
    sourceKind: SourceAssertion["sourceKind"];
    parserVersion: string;
  },
): Promise<MergeResult> {
  const result: MergeResult = { inserted: 0, updated: 0, feeRowsWritten: 0, errors: [] };
  const now = new Date();

  // Ensure the source itself is registered. This is idempotent and keeps
  // the source_records FK satisfiable for adapters added after the seed.
  await db
    .insert(schema.sources)
    .values({
      id: sourceMeta.sourceId,
      kind: sourceMeta.sourceKind,
      name: sourceMeta.sourceId,
      url: null,
    })
    .onConflictDoNothing();

  for (const r of records) {
    const passportId = await passportIdFor(r.passportIso2);
    if (passportId == null) {
      result.errors.push({
        passport: r.passportIso2,
        destination: r.destinationIso2,
        purpose: r.purpose,
        reason: "Unknown passport (no ordinary passport seeded for issuer)",
      });
      continue;
    }

    // Build the SourceAssertion that confidence calc needs. Map the parsed
    // record fields onto the same field names the weight tables use.
    const assertion: SourceAssertion = {
      sourceId: sourceMeta.sourceId,
      sourceKind: sourceMeta.sourceKind,
      values: {
        status: r.status,
        cost: r.fees?.[0]?.amountMinor ?? null,
        max_stay_days: r.maxStayDays ?? null,
        processing_time: r.processingTimeDaysMin ?? null,
        application_url: r.applicationUrl ?? null,
        requirements: r.requirements ?? [],
      },
      fetchedAt: now,
    };

    const correctness = recordCorrectness([assertion]);

    // Upsert the visa_option keyed by (passport, destination, purpose, label).
    // No DB unique constraint on the tuple — Drizzle's onConflict requires one
    // — so we do a manual look-up + update / insert. Cheap given the row counts.
    const existing = await db
      .select({ id: schema.visaOptions.id })
      .from(schema.visaOptions)
      .where(
        and(
          eq(schema.visaOptions.passportId, passportId),
          eq(schema.visaOptions.destinationIso2, r.destinationIso2),
          eq(schema.visaOptions.purpose, r.purpose),
          eq(schema.visaOptions.label, r.label),
        ),
      )
      .limit(1);

    const fields = {
      passportId,
      destinationIso2: r.destinationIso2,
      purpose: r.purpose,
      status: r.status,
      label: r.label,
      maxStayDays: r.maxStayDays ?? null,
      validityDays: r.validityDays ?? null,
      entriesAllowed: r.entriesAllowed ?? null,
      passportValidityMonthsRequired: r.passportValidityMonthsRequired ?? null,
      blankPagesRequired: r.blankPagesRequired ?? null,
      onwardTicketRequired: r.onwardTicketRequired ?? null,
      proofOfFundsRequired: r.proofOfFundsRequired ?? null,
      proofOfAccommodationRequired: r.proofOfAccommodationRequired ?? null,
      biometricsRequired: r.biometricsRequired ?? null,
      biometricsLocation: r.biometricsLocation ?? null,
      requirements: r.requirements ?? [],
      vaccinationRequirements: r.vaccinationRequirements ?? [],
      processingTimeDaysMin: r.processingTimeDaysMin ?? null,
      processingTimeDaysMax: r.processingTimeDaysMax ?? null,
      applicationUrl: r.applicationUrl ?? null,
      primarySourceUrl: r.primarySourceUrl ?? null,
      blocDerivedFrom: r.blocDerivedFrom ?? null,
      notes: r.notes ?? null,
      purposeMetadata: r.purposeMetadata ?? null,
      correctnessBucket: correctness,
      lastFetchedAt: now,
      // Verification means: a primary government source asserted this — fetch
      // alone is enough. Wikipedia is community-curated and not independently
      // verified by us, so we leave verifiedAt null and let the UI render an
      // honest "not independently verified" footer instead of a fresh date.
      lastVerifiedAt: sourceMeta.sourceKind === "wikipedia" ? null : now,
      updatedAt: now,
    };

    let visaOptionId: number;
    if (existing.length > 0) {
      visaOptionId = existing[0].id;
      await db
        .update(schema.visaOptions)
        .set(fields)
        .where(eq(schema.visaOptions.id, visaOptionId));
      result.updated += 1;
    } else {
      const inserted = await db
        .insert(schema.visaOptions)
        .values(fields)
        .returning({ id: schema.visaOptions.id });
      visaOptionId = inserted[0].id;
      result.inserted += 1;
    }

    // Replace fees wholesale.
    await db.delete(schema.feeComponents).where(eq(schema.feeComponents.visaOptionId, visaOptionId));
    if (r.fees && r.fees.length > 0) {
      await db.insert(schema.feeComponents).values(
        r.fees.map((f) => ({
          visaOptionId,
          kind: f.kind,
          amountMinor: f.amountMinor,
          currency: f.currency,
          asOf: f.asOf,
          label: f.label ?? null,
          optional: f.optional ?? false,
        })),
      );
      result.feeRowsWritten += r.fees.length;
    }

    // Verification event — distinguishes "fetched" from "cross_source agreed".
    // First pass after a fetch is kind=fetch; promote to cross_source when
    // a second adapter corroborates the same cell.
    await db.insert(schema.verificationEvents).values({
      visaOptionId,
      kind: "fetch",
      occurredAt: now,
      actor: sourceMeta.sourceId,
      notes: `parser v${sourceMeta.parserVersion}`,
    });
  }

  // Touch the active connection so callers know we're done.
  await db.execute(sql`SELECT 1`);

  return result;
}
