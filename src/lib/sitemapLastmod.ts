/**
 * Per-URL `lastmod` resolver for the sitemap.
 *
 * Previously every URL in /sitemap/[id].xml shared a single build-time
 * SITEMAP_LASTMOD. That's OK but lossy — Google can't tell which routes
 * actually changed on a given deploy and may re-crawl everything when
 * only one passport's data refreshed.
 *
 * This module derives a more honest lastmod per route bucket:
 *   - per passport ISO (covers /passport/[iso] + /[from]/[to] under [from])
 *   - per destination ISO (covers /destination/[iso])
 *
 * Pair-level (every /us/jp) lastmod would be best but requires ~60k
 * groups in the GROUP BY — disproportionately expensive for the
 * marginal accuracy. Sharing a passport-level lastmod across all that
 * passport's pair URLs is the right trade.
 *
 * Failure mode: any DB error → empty maps, sitemap falls back to
 * SITEMAP_LASTMOD. Safe in dev / fresh-checkout scenarios where the
 * PGlite database hasn't been bootstrapped yet.
 */
import { sql } from "drizzle-orm";
import { db, schema } from "@/db/client";

export type LastmodMap = Record<string, string>; // ISO2 → ISO date string

let cachedByPassport: LastmodMap | null = null;
let cachedByDestination: LastmodMap | null = null;

/** ISO date for "now minus N seconds" — used as a floor so a never-
 *  verified record doesn't claim a 1970 lastmod. */
function asIso(date: Date | string | null): string | null {
  if (!date) return null;
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

type Row = { iso: string; lastmod: string | Date | null };

export async function getLastmodByPassport(): Promise<LastmodMap> {
  if (cachedByPassport) return cachedByPassport;
  try {
    const result = await db.execute<Row>(sql`
      SELECT p.issuer_iso2 AS iso,
             MAX(vo.last_verified_at) AS lastmod
      FROM visa_options vo
      JOIN passports p ON p.id = vo.passport_id
      WHERE vo.last_verified_at IS NOT NULL
      GROUP BY p.issuer_iso2
    `);
    const rows = (result as unknown as { rows?: Row[] }).rows ?? (result as unknown as Row[]);
    const map: LastmodMap = {};
    for (const r of rows) {
      const iso = asIso(r.lastmod);
      if (iso) map[r.iso] = iso;
    }
    cachedByPassport = map;
    return map;
  } catch {
    cachedByPassport = {};
    return cachedByPassport;
  }
}

export async function getLastmodByDestination(): Promise<LastmodMap> {
  if (cachedByDestination) return cachedByDestination;
  try {
    const result = await db.execute<Row>(sql`
      SELECT vo.destination_iso2 AS iso,
             MAX(vo.last_verified_at) AS lastmod
      FROM visa_options vo
      WHERE vo.last_verified_at IS NOT NULL
      GROUP BY vo.destination_iso2
    `);
    const rows = (result as unknown as { rows?: Row[] }).rows ?? (result as unknown as Row[]);
    const map: LastmodMap = {};
    for (const r of rows) {
      const iso = asIso(r.lastmod);
      if (iso) map[r.iso] = iso;
    }
    cachedByDestination = map;
    return map;
  } catch {
    cachedByDestination = {};
    return cachedByDestination;
  }
}
