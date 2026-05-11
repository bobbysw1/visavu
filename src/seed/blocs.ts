// Blocs are first-class. The resolver composes bloc rules with direct rules.
// Effective dates matter: Croatia joined Schengen 2023-01-01, Romania/Bulgaria
// land borders 2024-03-31. Document the source of each membership date in `notes`.
//
// MVP scope is the blocs that genuinely change visa policy at the bloc level.
// Things like ASEAN/AU/SAARC are political groupings without a unified visa
// regime and are intentionally excluded.

export type SeedBloc = {
  id: string;
  name: string;
  description: string;
};

export type SeedBlocMembership = {
  blocId: string;
  countryIso2: string;
  effectiveFrom: string; // ISO date
  effectiveTo?: string;
  qualifier?: string;
};

export const BLOCS: SeedBloc[] = [
  {
    id: "schengen",
    name: "Schengen Area",
    description:
      "Common short-stay visa policy across member states; visa issued by primary destination state admits to all.",
  },
  {
    id: "gcc",
    name: "Gulf Cooperation Council",
    description: "Residence/visit permit reciprocity among member states; unified GCC tourist visa rolling out 2024-2025.",
  },
  {
    id: "caricom",
    name: "CARICOM Single Market",
    description: "Free movement of CARICOM nationals among member states subject to national rules.",
  },
  {
    id: "ecowas",
    name: "ECOWAS",
    description: "Protocol on Free Movement allows ECOWAS citizens visa-free entry, residence, and establishment.",
  },
  {
    id: "eac_tourist",
    name: "East African Community Tourist Visa",
    description: "Single tourist visa valid in Kenya, Rwanda, and Uganda (multi-entry, 90 days).",
  },
  {
    id: "mercosur",
    name: "Mercosur Residency Agreement",
    description: "Mercosur nationals may obtain temporary/permanent residency in member states.",
  },
];

export const BLOC_MEMBERSHIPS: SeedBlocMembership[] = [
  // Schengen — full members with internal-border-free movement.
  // 2023-01-01: Croatia. 2024-03-31: Romania and Bulgaria for air/sea borders only.
  // 2025-01-01: Romania and Bulgaria for land borders.
  ...["AT", "BE", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "SK", "SI", "ES", "SE", "CH"].map(
    (iso2) => ({ blocId: "schengen", countryIso2: iso2, effectiveFrom: "1995-03-26" }),
  ),
  { blocId: "schengen", countryIso2: "HR", effectiveFrom: "2023-01-01" },
  { blocId: "schengen", countryIso2: "RO", effectiveFrom: "2025-01-01" },
  { blocId: "schengen", countryIso2: "BG", effectiveFrom: "2025-01-01" },

  // GCC
  ...["BH", "KW", "OM", "QA", "SA", "AE"].map((iso2) => ({
    blocId: "gcc",
    countryIso2: iso2,
    effectiveFrom: "1981-05-25",
  })),

  // CARICOM (Single Market members; Bahamas and Haiti are CARICOM but not CSME)
  ...["AG", "BB", "BZ", "DM", "GD", "GY", "JM", "KN", "LC", "VC", "SR", "TT"].map((iso2) => ({
    blocId: "caricom",
    countryIso2: iso2,
    effectiveFrom: "2006-01-01",
  })),

  // ECOWAS
  ...["BJ", "BF", "CV", "CI", "GM", "GH", "GN", "GW", "LR", "ML", "NE", "NG", "SN", "SL", "TG"].map(
    (iso2) => ({ blocId: "ecowas", countryIso2: iso2, effectiveFrom: "1979-05-29" }),
  ),

  // East African Tourist Visa (Kenya, Rwanda, Uganda)
  ...["KE", "RW", "UG"].map((iso2) => ({
    blocId: "eac_tourist",
    countryIso2: iso2,
    effectiveFrom: "2014-02-20",
  })),

  // Mercosur (full members; Venezuela suspended 2016)
  ...["AR", "BR", "PY", "UY"].map((iso2) => ({
    blocId: "mercosur",
    countryIso2: iso2,
    effectiveFrom: "1991-03-26",
  })),
];

// eTA systems — separate from visas. Each has its own scrape adapter (later).
export type SeedEta = {
  id: string;
  name: string;
  destinationIso2: string;
  applyUrl?: string;
  status: "active" | "rolling_out" | "announced";
  effectiveFrom?: string;
  notes?: string;
};

export const ETA_SYSTEMS: SeedEta[] = [
  {
    id: "esta",
    name: "Electronic System for Travel Authorization",
    destinationIso2: "US",
    applyUrl: "https://esta.cbp.dhs.gov/",
    status: "active",
    effectiveFrom: "2009-01-12",
  },
  {
    id: "canada_eta",
    name: "Canada Electronic Travel Authorization",
    destinationIso2: "CA",
    applyUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html",
    status: "active",
    effectiveFrom: "2016-03-15",
  },
  {
    id: "uk_eta",
    name: "UK Electronic Travel Authorisation",
    destinationIso2: "GB",
    applyUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta",
    status: "rolling_out",
    effectiveFrom: "2023-11-15",
    notes: "Phased rollout by nationality; full coverage during 2025.",
  },
  // ETIAS (Schengen-wide eTA, launching Q4 2026) is intentionally omitted from
  // the seed because it targets a bloc, not a single country — the data model
  // currently keys eTA on destinationIso2. Add when the resolver gains
  // bloc-targeting eTA support.
  {
    id: "k_eta",
    name: "Korea Electronic Travel Authorization",
    destinationIso2: "KR",
    applyUrl: "https://www.k-eta.go.kr/",
    status: "active",
    effectiveFrom: "2021-09-01",
  },
  {
    id: "evisitor",
    name: "Australia eVisitor / ETA",
    destinationIso2: "AU",
    applyUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601",
    status: "active",
  },
];
