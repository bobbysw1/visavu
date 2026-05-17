/**
 * Runtime helper for bloc memberships derived from the seed file.
 *
 * The seed (src/seed/blocs.ts) is the source of truth; this module reads it
 * directly so callers don't need a DB round-trip. Used by editorial content
 * generators that run at build time (passport intros, FAQ JSON-LD) and by
 * UI components that surface bloc membership tags.
 */
import { BLOCS, BLOC_MEMBERSHIPS, type SeedBloc } from "@/seed/blocs";

export type BlocSummary = {
  id: string;
  name: string;
  description: string;
};

const BLOC_BY_ID = new Map<string, SeedBloc>(BLOCS.map((b) => [b.id, b]));

const MEMBERSHIPS_BY_COUNTRY = new Map<string, string[]>();
for (const m of BLOC_MEMBERSHIPS) {
  const iso = m.countryIso2.toUpperCase();
  const existing = MEMBERSHIPS_BY_COUNTRY.get(iso) ?? [];
  if (!existing.includes(m.blocId)) existing.push(m.blocId);
  MEMBERSHIPS_BY_COUNTRY.set(iso, existing);
}

/**
 * Returns the blocs a country belongs to, sorted by how "load-bearing" the
 * bloc is for an editorial intro (Schengen / EU first, Commonwealth last).
 */
export function blocsFor(iso2: string): BlocSummary[] {
  const ids = MEMBERSHIPS_BY_COUNTRY.get(iso2.toUpperCase()) ?? [];
  return ids
    .map((id) => BLOC_BY_ID.get(id))
    .filter((b): b is SeedBloc => b !== undefined)
    .sort((a, b) => BLOC_PROSE_PRIORITY.indexOf(a.id) - BLOC_PROSE_PRIORITY.indexOf(b.id));
}

/** Order used when naming blocs in prose — most editorially-load-bearing first. */
const BLOC_PROSE_PRIORITY = [
  "schengen",
  "eu",
  "eea",
  "gcc",
  "mercosur",
  "cplp",
  "caricom",
  "ecowas",
  "eac_tourist",
  "commonwealth",
];
