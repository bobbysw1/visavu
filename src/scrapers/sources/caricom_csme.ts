/**
 * CARICOM Single Market and Economy (CSME) free-movement adapter.
 *
 * Source: CARICOM Treaty of Chaguaramas (revised) — Free Movement of Skills.
 * CSME members allow their nationals to travel without a visa and (subject
 * to skilled-national certification) work freely in other member states.
 */
import { blocAdapter } from "./_blocFactory";

export const caricomCsmeAdapter = blocAdapter({
  id: "caricom_csme_free_movement",
  name: "CARICOM Single Market & Economy free movement",
  blocId: "caricom",
  members: ["AG", "BB", "BZ", "DM", "GD", "GY", "JM", "KN", "LC", "VC", "SR", "TT"],
  primarySourceUrl: "https://caricom.org/our-community/who-we-are/",
  fixturePath: "src/scrapers/sources/__fixtures__/caricom_csme.html",
  fixtureMatch: /(caricom|caribbean\s+community|single\s+market)/i,
  parserVersion: "1.0.0",
  status: "visa_free",
  purpose: "tourism",
  label: "CARICOM Single Market — visa-free entry (6 months)",
  maxStayDays: 6 * 30,
  entriesAllowed: "multiple",
  passportValidityMonthsRequired: 6,
  requirements: [
    "Valid CARICOM passport or national ID",
    "Stamp permitting up to 6 months on arrival",
  ],
  notes:
    "CARICOM nationals travelling within the Single Market and Economy (CSME) receive a 6-month entry stamp on arrival. Skilled Nationals (with a CARICOM Skills Certificate) may live and work freely in other member states. The Bahamas and Haiti are CARICOM members but not part of CSME.",
});
