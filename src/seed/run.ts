/**
 * Seed runner. Idempotent — uses ON CONFLICT DO NOTHING throughout so reruns
 * are safe in dev. Run with `npm run seed`, or call `seedReferenceData()` from
 * the bootstrap script.
 */
import { db, schema } from "../db/client";
import { ISO_3166, NAME_ALIASES } from "./iso3166";
import { BLOCS, BLOC_MEMBERSHIPS, ETA_SYSTEMS } from "./blocs";

export async function seedReferenceData() {
  console.log(`Seeding ${ISO_3166.length} countries...`);
  await db
    .insert(schema.countries)
    .values(
      ISO_3166.map(([iso2, iso3, num, name]) => ({
        iso2,
        iso3,
        numericCode: num,
        defaultName: name,
        hasOwnImmigration: iso2 === "HK" || iso2 === "MO" || iso2 === "TW",
        notes:
          iso2 === "TW"
            ? "Listed as Taiwan; sources variously refer as Chinese Taipei or Taiwan, Province of China."
            : iso2 === "XK"
            ? "Kosovo: ISO 3166-1 has not assigned a code; XK is a widely used reserved code. Recognition varies by destination."
            : null,
      })),
    )
    .onConflictDoNothing();

  console.log(`Seeding ${ISO_3166.length} default English names + ${NAME_ALIASES.length} aliases...`);
  await db
    .insert(schema.countryNames)
    .values([
      ...ISO_3166.map(([iso2, , , name]) => ({ iso2, locale: "en", name })),
      ...NAME_ALIASES.map(([name, iso2]) => ({ iso2, locale: "alt-en", name })),
    ])
    .onConflictDoNothing();

  console.log(`Seeding ordinary passports (one per country)...`);
  await db
    .insert(schema.passports)
    .values(
      ISO_3166.map(([iso2, , , name]) => ({
        issuerIso2: iso2,
        type: "ordinary" as const,
        variant: null,
        label: `${name} (ordinary)`,
      })),
    )
    .onConflictDoNothing();

  console.log(`Seeding ${BLOCS.length} blocs...`);
  await db.insert(schema.blocs).values(BLOCS).onConflictDoNothing();

  console.log(`Seeding ${BLOC_MEMBERSHIPS.length} bloc memberships...`);
  await db
    .insert(schema.blocMemberships)
    .values(BLOC_MEMBERSHIPS.map((m) => ({ ...m, effectiveTo: m.effectiveTo ?? null })))
    .onConflictDoNothing();

  console.log(`Seeding ${ETA_SYSTEMS.length} eTA systems...`);
  await db.insert(schema.etaSystems).values(ETA_SYSTEMS).onConflictDoNothing();
}

// CLI entry — only runs when this file is invoked directly.
if (import.meta.url === `file://${process.argv[1]}`) {
  seedReferenceData()
    .then(() => {
      console.log("Done.");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
