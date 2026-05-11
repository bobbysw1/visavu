/**
 * GCC (Gulf Cooperation Council) free-movement adapter.
 *
 * Source: GCC Charter (1981) and subsequent Common Market arrangements.
 * GCC citizens travel between member states with national ID and may
 * reside / work freely under reciprocal residence permit arrangements.
 *
 * Members: Bahrain, Kuwait, Oman, Qatar, Saudi Arabia, UAE.
 */
import { blocAdapter } from "./_blocFactory";

export const gccFreeMovementAdapter = blocAdapter({
  id: "gcc_free_movement",
  name: "GCC free movement (Gulf Cooperation Council)",
  blocId: "gcc",
  members: ["BH", "KW", "OM", "QA", "SA", "AE"],
  primarySourceUrl: "https://www.gcc-sg.org/",
  fixturePath: "src/scrapers/sources/__fixtures__/gcc.html",
  fixtureMatch: /(gcc|gulf\s+cooperation\s+council)/i,
  parserVersion: "1.0.0",
  status: "visa_free",
  purpose: "tourism",
  label: "GCC — visa-free entry on national ID",
  maxStayDays: null, // residency rights — no fixed short-stay cap
  entriesAllowed: "multiple",
  passportValidityMonthsRequired: 0, // GCC ID accepted at land borders for nationals
  requirements: [
    "Valid GCC passport OR national ID card",
    "No visa fee, no application form",
  ],
  notes:
    "GCC citizens enjoy reciprocal free movement, residence and work rights across member states. Practical implementation varies by member; some routes accept national ID only at land borders. A unified GCC tourist visa for non-GCC nationals is being phased in 2024–2025.",
});
