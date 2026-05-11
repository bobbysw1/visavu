/**
 * ECOWAS free-movement adapter.
 *
 * Source: ECOWAS Protocol on Free Movement of Persons, Right of Residence and
 * Establishment (1979) and subsequent amendments. ECOWAS citizens travel
 * visa-free to any other member state for up to 90 days.
 */
import { blocAdapter } from "./_blocFactory";

export const ecowasFreeMovementAdapter = blocAdapter({
  id: "ecowas_free_movement",
  name: "ECOWAS Free Movement (Protocol on Free Movement)",
  blocId: "ecowas",
  members: ["BJ", "BF", "CV", "CI", "GM", "GH", "GN", "GW", "LR", "ML", "NE", "NG", "SN", "SL", "TG"],
  primarySourceUrl: "https://ecowas.int/",
  fixturePath: "src/scrapers/sources/__fixtures__/ecowas_free_movement.html",
  fixtureMatch: /(ecowas|free\s+movement)/i,
  parserVersion: "1.0.0",
  status: "visa_free",
  purpose: "tourism",
  label: "ECOWAS Free Movement (90 days)",
  maxStayDays: 90,
  entriesAllowed: "multiple",
  passportValidityMonthsRequired: 6,
  requirements: [
    "Valid ECOWAS passport or ECOWAS ID card",
    "Return / onward travel intent (no formal ticket required at most borders)",
    "Yellow fever vaccination certificate (where applicable)",
  ],
  notes:
    "Phase I of the ECOWAS Protocol on Free Movement grants community citizens 90 days visa-free entry. Phase II adds the right of residence (5-year permit) and Phase III adds the right of establishment. National ID enforcement varies by member state.",
});
