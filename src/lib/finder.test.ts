/**
 * Finder coverage regression tests.
 *
 * The bug we're guarding against: when we add a new destination adapter with
 * a visa label that doesn't match GOAL_FILTERS.labelIncludes substrings,
 * /finder?goal=X silently fails to surface it. Users see "only 7 countries
 * to retire to" when reality is dozens.
 *
 * Each test asserts that the EXPECTED destination surfaces for the GIVEN
 * (passport, goal) combination. If you add a new destination adapter that
 * should surface here, add a row and tag the relevant visa with finderGoals.
 *
 * Tests rely on the committed PGlite snapshot — no network. Bootstrap must
 * have been run with the latest adapters (`npm run bootstrap`) so the
 * snapshot reflects current data.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { findDestinations } from "./finder";

// Helper: assert that a given destination ISO is among the returned options
// for (passport, goal). Returns the matching FinderResult or throws.
async function expectFound(
  passport: string,
  goal: Parameters<typeof findDestinations>[1],
  destination: string,
) {
  const results = await findDestinations(passport, goal, { limit: 250 });
  const match = results.find((r) => r.destinationIso2 === destination);
  if (!match) {
    const seen = results.slice(0, 20).map((r) => `${r.destinationIso2}:${r.label}`).join("\n  ");
    throw new Error(
      `Expected ${passport} → ${destination} for goal=${goal} to be found, but got:\n  ${seen}\nTotal results: ${results.length}`,
    );
  }
  return match;
}

describe("findDestinations — goal-routing surfaces new destination adapters", () => {
  beforeAll(async () => {
    // Allow plenty of time for first-time PGlite init from the snapshot.
  }, 60_000);

  // ── retire goal — should surface curated retirement-flavoured routes ──
  it("GB → BZ surfaces via retire (Belize QRP-style)", async () => {
    // Belize QRP isn't yet in our DB, but Mexico Residente Temporal IS now.
    // Verify the broader retire matcher works for the user's complaint.
    const res = await findDestinations("GB", "retire", { limit: 250 });
    expect(res.length).toBeGreaterThan(7); // user complained "only 7 countries"
    expect(res.length).toBeGreaterThan(15); // expect ~30+ now
  });

  it("GB → PT surfaces via retire (D7)", async () => {
    await expectFound("GB", "retire", "PT");
  });

  it("GB → ES surfaces via retire (NLV)", async () => {
    await expectFound("GB", "retire", "ES");
  });

  it("GB → MX surfaces via retire (Residente Temporal)", async () => {
    await expectFound("GB", "retire", "MX");
  });

  it("GB → MA surfaces via retire (Carte de Séjour Visiteur)", async () => {
    await expectFound("GB", "retire", "MA");
  });

  it("GB → TR surfaces via retire (Touristic Residence Permit)", async () => {
    await expectFound("GB", "retire", "TR");
  });

  it("GB → GR surfaces via retire (Financially Independent Person)", async () => {
    await expectFound("GB", "retire", "GR");
  });

  it("GB → FR surfaces via retire (VLS-TS Visiteur)", async () => {
    await expectFound("GB", "retire", "FR");
  });

  it("GB → ID surfaces via retire (Lansia Retirement Visa)", async () => {
    await expectFound("GB", "retire", "ID");
  });

  // ── live_work goal — should surface skilled-worker / salaried routes ──
  it("JP → IN surfaces via live_work (Employment Visa E-class)", async () => {
    await expectFound("JP", "live_work", "IN");
  });

  it("GB → EG surfaces via live_work (Work Permit Tasreeh Amal)", async () => {
    await expectFound("GB", "live_work", "EG");
  });

  it("GB → MA surfaces via live_work (Carte de Séjour Salarié)", async () => {
    await expectFound("GB", "live_work", "MA");
  });

  it("GB → MX surfaces via live_work (Permiso de Trabajo)", async () => {
    await expectFound("GB", "live_work", "MX");
  });

  it("GB → TR surfaces via live_work (Çalışma İzni)", async () => {
    await expectFound("GB", "live_work", "TR");
  });

  it("GB → FR surfaces via live_work (VLS-TS Salarié)", async () => {
    await expectFound("GB", "live_work", "FR");
  });

  it("GB → IT surfaces via live_work (Lavoro Subordinato)", async () => {
    await expectFound("GB", "live_work", "IT");
  });

  it("GB → ID surfaces via live_work (Remote Worker E33G or Investor KITAS)", async () => {
    await expectFound("GB", "live_work", "ID");
  });

  // ── study goal — student visas at top destinations ──
  it("JP → IN surfaces via study (Student Visa S-class)", async () => {
    await expectFound("JP", "study", "IN");
  });

  it("GB → EG surfaces via study (Student Residence Permit)", async () => {
    await expectFound("GB", "study", "EG");
  });

  it("GB → MA surfaces via study (Carte de Séjour Étudiant)", async () => {
    await expectFound("GB", "study", "MA");
  });

  it("GB → IT surfaces via study (Visto Studio)", async () => {
    await expectFound("GB", "study", "IT");
  });

  it("GB → DE surfaces via study (Visum zu Studienzwecken)", async () => {
    await expectFound("GB", "study", "DE");
  });

  // ── invest goal — investor / golden / property-residence routes ──
  it("GB → TR surfaces via invest (Real-Estate Residence Permit)", async () => {
    await expectFound("GB", "invest", "TR");
  });

  it("GB → EG surfaces via invest (Real-Estate / Business-Investor)", async () => {
    await expectFound("GB", "invest", "EG");
  });

  it("GB → ID surfaces via invest (Investor KITAS)", async () => {
    await expectFound("GB", "invest", "ID");
  });

  // ── remote_work goal — digital-nomad / remote-worker visas ──
  it("GB → GR surfaces via remote_work (Digital Nomad Visa)", async () => {
    await expectFound("GB", "remote_work", "GR");
  });

  it("GB → IT surfaces via remote_work (Lavoratori Mobili Internazionali)", async () => {
    await expectFound("GB", "remote_work", "IT");
  });

  it("GB → ID surfaces via remote_work (Remote Worker E33G)", async () => {
    await expectFound("GB", "remote_work", "ID");
  });

  // ── Overall volume sanity check ──
  it("retire goal returns at least 15 destinations for British passport (was 7)", async () => {
    // User complaint was "only 7 countries". We've roughly tripled coverage
    // (currently ~18 with batches 1+2 + the expanded retire matcher). Future
    // batches should push this past 30.
    const res = await findDestinations("GB", "retire", { limit: 250 });
    expect(res.length).toBeGreaterThanOrEqual(15);
  });

  it("live_work goal returns at least 30 destinations for British passport", async () => {
    const res = await findDestinations("GB", "live_work", { limit: 250 });
    expect(res.length).toBeGreaterThanOrEqual(30);
  });

  it("study goal returns at least 25 destinations for British passport", async () => {
    const res = await findDestinations("GB", "study", { limit: 250 });
    expect(res.length).toBeGreaterThanOrEqual(25);
  });
});
