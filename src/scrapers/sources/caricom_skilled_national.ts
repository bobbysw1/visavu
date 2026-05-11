/**
 * CARICOM Skilled National (CSME) work-permit adapter.
 *
 * Source: https://csmeonline.org/free-movement-of-skills/
 *
 * The Caribbean Single Market and Economy permits qualified CARICOM nationals
 * to live and work freely in other CSME member states under the "Free
 * Movement of Skills" regime. Eligible categories include university
 * graduates, media workers, sportspersons, artists, musicians, nurses,
 * teachers, and several other professions added by COTED decisions.
 *
 * Emits one `embassy_visa` record per (CARICOM passport × CARICOM
 * destination × work). The "embassy_visa" status reflects the certificate
 * application — the actual movement is then visa-free under the existing
 * CSME free-movement adapter (purpose=tourism). This adapter populates the
 * work dimension that the free-movement adapter intentionally leaves out.
 */
import { blocAdapter } from "./_blocFactory";

export const caricomSkilledNationalAdapter = blocAdapter({
  id: "caricom_skilled_national",
  name: "CARICOM Skilled National Certificate",
  blocId: "caricom",
  members: ["AG", "BB", "BZ", "DM", "GD", "GY", "JM", "KN", "LC", "VC", "SR", "TT"],
  primarySourceUrl: "https://caricom.org/projects/caricom-single-market-and-economy/",
  fixturePath: "src/scrapers/sources/__fixtures__/caricom_skilled_national.html",
  fixtureMatch: /(skilled\s+national|free\s+movement\s+of\s+skills|csme)/i,
  parserVersion: "1.0.0",
  status: "embassy_visa",
  purpose: "work",
  label: "CARICOM Skilled National Certificate",
  maxStayDays: null,
  validityDays: null,
  entriesAllowed: "permanent",
  passportValidityMonthsRequired: 6,
  requirements: [
    "Eligible profession (graduate, media worker, sportsperson, artist, musician, nurse, teacher, household domestic, agricultural worker, security guard, beautician, barber, hairdresser, cosmetologist, artisan, with appropriate certification)",
    "Valid CARICOM passport",
    "Application to the CSME Unit / Ministry of Labour in the destination state",
    "Issuance of a Skilled National Certificate by the destination state",
  ],
  notes:
    "Skilled National Certificates are issued by the destination CARICOM state and grant indefinite right to live and work. Categories of eligible workers have expanded over time via COTED decisions; check the destination's Ministry of Labour for the current list. Spouses and dependents are typically included under the same certificate.",
});
