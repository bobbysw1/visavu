/**
 * Mercosur free-movement adapter.
 *
 * Source: Mercosur Residency Agreement (2002) — full members + associates.
 * Mercosur citizens travel visa-free among signatories for short stays;
 * the Residency Agreement also enables 2-year temporary residency
 * convertible to permanent residency.
 *
 * Members: Argentina, Brazil, Paraguay, Uruguay (full); Bolivia, Chile,
 * Colombia, Ecuador, Peru (associates / signatories of the Residency
 * Agreement). Venezuela's membership is suspended (since 2016).
 */
import { blocAdapter } from "./_blocFactory";

export const mercosurFreeMovementAdapter = blocAdapter({
  id: "mercosur_free_movement",
  name: "Mercosur Residency Agreement (free short-stay movement)",
  blocId: "mercosur",
  members: ["AR", "BR", "PY", "UY", "BO", "CL", "CO", "EC", "PE"],
  primarySourceUrl: "https://www.mercosur.int/",
  fixturePath: "src/scrapers/sources/__fixtures__/mercosur.html",
  fixtureMatch: /(mercosur|mercosul)/i,
  parserVersion: "1.0.0",
  status: "visa_free",
  purpose: "tourism",
  label: "Mercosur — visa-free entry (90 days)",
  maxStayDays: 90,
  entriesAllowed: "multiple",
  passportValidityMonthsRequired: 6,
  requirements: [
    "Valid passport or national identity card (DNI / RUN / cédula) accepted at most land borders",
    "Onward / return travel intent",
  ],
  notes:
    "Mercosur citizens may enter other member or associate states visa-free for short stays. The Mercosur Residency Agreement provides a streamlined route to 2-year temporary residency, convertible to permanent residency, for nationals of any signatory country.",
});
