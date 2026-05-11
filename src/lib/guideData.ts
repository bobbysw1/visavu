/**
 * Live-data queries used by editorial guides to render up-to-date tables
 * from the visa_options database. Lets a guide written in May say "as of
 * today, 26 destinations offer Working Holiday visas — here they are" and
 * have the table reflect what the DB actually contains right now.
 */
import { db, schema } from "@/db/client";
import { sql } from "drizzle-orm";

export type WorkingHolidayMatrixRow = {
  destinationIso2: string;
  label: string;
  ageRange: string;
  stayDays: number | null;
  feeAmountMinor: number | null;
  feeCurrency: string | null;
  primarySourceUrl: string | null;
  passportCount: number;
};

type RawWh = {
  destination_iso2: string;
  label: string;
  max_stay_days: string | null;
  primary_source_url: string | null;
  passport_count: string;
  fee_amount_minor: string | null;
  fee_currency: string | null;
};

export async function workingHolidayMatrix(): Promise<WorkingHolidayMatrixRow[]> {
  try {
    const result = await db.execute<RawWh>(sql`
      WITH wh AS (
        SELECT v.destination_iso2, v.label, v.id, v.max_stay_days, v.primary_source_url
        FROM visa_options v
        JOIN verification_events e ON e.visa_option_id = v.id
        WHERE e.actor = 'working_holiday'
      )
      SELECT
        wh.destination_iso2,
        wh.label,
        MAX(wh.max_stay_days)::text AS max_stay_days,
        MIN(wh.primary_source_url) AS primary_source_url,
        COUNT(DISTINCT wh.id)::text AS passport_count,
        MIN(f.amount_minor)::text AS fee_amount_minor,
        MIN(f.currency) AS fee_currency
      FROM wh
      LEFT JOIN fee_components f ON f.visa_option_id = wh.id AND f.kind = 'base'
      GROUP BY wh.destination_iso2, wh.label
      ORDER BY wh.destination_iso2, wh.label
    `);
    const rows = (result as unknown as { rows?: RawWh[] }).rows ?? (result as unknown as RawWh[]);
    return (rows as RawWh[]).map((r) => ({
      destinationIso2: r.destination_iso2,
      label: r.label,
      ageRange: deriveAgeRange(r.label),
      stayDays: r.max_stay_days ? Number(r.max_stay_days) : null,
      feeAmountMinor: r.fee_amount_minor ? Number(r.fee_amount_minor) : null,
      feeCurrency: r.fee_currency,
      primarySourceUrl: r.primary_source_url,
      passportCount: Number(r.passport_count) || 0,
    }));
  } catch {
    return [];
  }
}

function deriveAgeRange(_label: string): string {
  // Label doesn't carry age explicitly. Default range; specific overrides
  // live in the working_holiday adapter and are surfaced via passport-pages.
  return "18–30 (some 35)";
}

export type DigitalNomadProgramRow = {
  destinationIso2: string;
  label: string;
  stayDays: number | null;
  feeAmountMinor: number | null;
  feeCurrency: string | null;
  primarySourceUrl: string | null;
};

type RawDn = {
  destination_iso2: string;
  label: string;
  max_stay_days: string | null;
  primary_source_url: string | null;
  fee_amount_minor: string | null;
  fee_currency: string | null;
};

export async function digitalNomadPrograms(): Promise<DigitalNomadProgramRow[]> {
  try {
    const result = await db.execute<RawDn>(sql`
      WITH dn AS (
        SELECT DISTINCT ON (v.label) v.id, v.destination_iso2, v.label, v.max_stay_days, v.primary_source_url
        FROM visa_options v
        JOIN verification_events e ON e.visa_option_id = v.id
        WHERE e.actor IN ('global_digital_nomad', 'es_digital_nomad', 'pt_d7')
        ORDER BY v.label, v.id
      )
      SELECT
        dn.destination_iso2,
        dn.label,
        dn.max_stay_days::text AS max_stay_days,
        dn.primary_source_url,
        MIN(f.amount_minor)::text AS fee_amount_minor,
        MIN(f.currency) AS fee_currency
      FROM dn
      LEFT JOIN fee_components f ON f.visa_option_id = dn.id AND f.kind = 'base'
      GROUP BY dn.destination_iso2, dn.label, dn.max_stay_days, dn.primary_source_url
      ORDER BY dn.destination_iso2, dn.label
    `);
    const rows = (result as unknown as { rows?: RawDn[] }).rows ?? (result as unknown as RawDn[]);
    return (rows as RawDn[]).map((r) => ({
      destinationIso2: r.destination_iso2,
      label: r.label,
      stayDays: r.max_stay_days ? Number(r.max_stay_days) : null,
      feeAmountMinor: r.fee_amount_minor ? Number(r.fee_amount_minor) : null,
      feeCurrency: r.fee_currency,
      primarySourceUrl: r.primary_source_url,
    }));
  } catch {
    return [];
  }
}

export function fmtFee(minor: number | null, currency: string | null): string {
  if (minor == null || !currency) return "—";
  if (minor === 0) return "Free";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(0)} ${currency}`;
  }
}
