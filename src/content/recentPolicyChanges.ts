/**
 * Hand-curated list of recent visa-policy changes that travellers need to be
 * warned about. Surfaced as a banner on result pages where the change applies
 * to the (passport, destination, purpose) cell currently being viewed.
 *
 * Curated rather than scraped because:
 *  - Policy *changes* (vs current state) are explicitly editorial.
 *  - We need to write a one-line traveller-facing explanation.
 *  - The set is small (≤ 50 active items at any time).
 *
 * When a change is older than 18 months we should remove or mark inactive —
 * past that horizon it's just current policy, not "recent."
 */

export type RecentPolicyChange = {
  id: string;
  /** ISO date when the change took effect (or is scheduled to). */
  effectiveDate: string;
  title: string;
  /** Two-sentence-max plain-English summary aimed at travellers. */
  body: string;
  /** Tone of the banner. "info" = neutral notice, "caution" = act-now-or-be-affected, "scheduled" = upcoming. */
  severity: "info" | "caution" | "scheduled";
  /** Match the cell this change applies to. Any unset field matches all. */
  applies: {
    /** ISO2 passport codes this affects. Omit to apply to all passports. */
    passports?: string[];
    /** ISO2 destination codes. Omit to apply to all destinations. */
    destinations?: string[];
    /** Purpose codes. Omit to apply to all purposes. */
    purposes?: string[];
  };
  references: { label: string; url: string }[];
  /** Slug of the in-house /guides/<slug> article that explains the change. */
  guideSlug?: string;
};

/**
 * Active changes (effective within ~18 months either past or future).
 * Order doesn't matter — the resolver sorts by effectiveDate descending.
 */
export const RECENT_POLICY_CHANGES: RecentPolicyChange[] = [
  {
    id: "etias-go-live",
    effectiveDate: "2026-10-01",
    title: "ETIAS goes live for Schengen entry",
    body:
      "From October 2026, visa-free travellers from ~60 countries (US, UK, Canada, Australia, Japan, etc.) need an ETIAS authorisation before entering any Schengen country. €7, valid 3 years. Apply online before booking.",
    severity: "scheduled",
    applies: {
      destinations: [
        "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
        "HU", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT",
        "RO", "SK", "SI", "ES", "SE", "CH",
      ],
      purposes: ["tourism", "business", "transit"],
    },
    references: [
      { label: "European Commission — ETIAS official", url: "https://travel-europe.europa.eu/etias_en" },
    ],
    guideSlug: "etias-2026-explained",
  },
  {
    id: "uk-eta-2024-expansion",
    effectiveDate: "2025-04-02",
    title: "UK ETA now required for visa-free travellers",
    body:
      "All non-visa-required travellers (incl. EU, US, Canada, Australia, GCC) must obtain a UK Electronic Travel Authorisation before arrival. £10, valid 2 years.",
    severity: "info",
    applies: {
      destinations: ["GB"],
      purposes: ["tourism", "business", "transit"],
    },
    references: [
      { label: "gov.uk — UK ETA", url: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
    ],
    guideSlug: "uk-eta-2025-explained",
  },
  {
    id: "schengen-ees-go-live",
    effectiveDate: "2025-10-12",
    title: "Schengen EES (Entry/Exit System) is now operational",
    body:
      "All non-EU travellers entering the Schengen area now have biometrics (fingerprints + facial photo) registered at the border on first entry. Adds 5–15 minutes to your border crossing on first arrival; subsequent crossings within 3 years use the stored data.",
    severity: "info",
    applies: {
      destinations: [
        "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
        "HU", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT",
        "RO", "SK", "SI", "ES", "SE", "CH",
      ],
    },
    references: [
      { label: "European Commission — EES", url: "https://travel-europe.europa.eu/ees_en" },
    ],
    guideSlug: "schengen-ees-explained",
  },
  {
    id: "ro-bg-schengen-land",
    effectiveDate: "2025-01-01",
    title: "Romania and Bulgaria are full Schengen members (land borders)",
    body:
      "Land border checks between Romania/Bulgaria and the rest of Schengen ended 2025-01-01. A single Schengen short-stay visa now covers entry by road, rail, sea or air to either country.",
    severity: "info",
    applies: {
      destinations: ["RO", "BG"],
    },
    references: [
      { label: "European Council — Schengen enlargement", url: "https://www.consilium.europa.eu/en/policies/schengen-area/" },
    ],
  },
  {
    id: "br-visa-reintroduced",
    effectiveDate: "2025-04-10",
    title: "Brazil reintroduced visas for US, Canadian, Australian travellers",
    body:
      "Brazil re-imposed e-Visa requirements on US, Canadian, and Australian passport holders for tourism and business after a temporary visa-free arrangement lapsed. Apply online before travel; same-day processing typical.",
    severity: "info",
    applies: {
      passports: ["US", "CA", "AU"],
      destinations: ["BR"],
      purposes: ["tourism", "business"],
    },
    references: [
      { label: "Itamaraty — official Brazilian MFA visa portal", url: "https://www.gov.br/mre/en/consular-portal/visas" },
    ],
    guideSlug: "brazil-reintroduces-visas-2025",
  },
  {
    id: "ke-eta-mandatory",
    effectiveDate: "2024-01-05",
    title: "Kenya replaced visa-on-arrival with mandatory eTA for everyone",
    body:
      "Kenya now requires every non-EAC visitor (including previously visa-free nationalities) to obtain an Electronic Travel Authorization online before arrival. US$30, valid 90 days, single entry. EAC citizens unaffected.",
    severity: "info",
    applies: {
      destinations: ["KE"],
      purposes: ["tourism", "business", "transit"],
    },
    references: [
      { label: "Kenya eTA portal", url: "https://www.etakenya.go.ke/" },
    ],
  },
  {
    id: "uk-immigration-tightening-2024",
    effectiveDate: "2024-04-04",
    title: "UK Skilled Worker salary thresholds raised to £38,700",
    body:
      "UK Skilled Worker visa minimum salary jumped from £26,200 to £38,700 in April 2024 (with shortage-occupation discounts narrowed). The change excludes many roles previously eligible — confirm against the latest gov.uk salary list before applying.",
    severity: "caution",
    applies: {
      destinations: ["GB"],
      purposes: ["work"],
    },
    references: [
      { label: "gov.uk — Skilled Worker visa", url: "https://www.gov.uk/skilled-worker-visa" },
    ],
  },
];

/** Filter the active list down to only those that apply to a given cell. */
export function policyChangesFor(
  passportIso2: string,
  destinationIso2: string,
  purpose: string,
): RecentPolicyChange[] {
  const p = passportIso2.toUpperCase();
  const d = destinationIso2.toUpperCase();
  return RECENT_POLICY_CHANGES.filter((c) => {
    if (c.applies.passports && !c.applies.passports.includes(p)) return false;
    if (c.applies.destinations && !c.applies.destinations.includes(d)) return false;
    if (c.applies.purposes && !c.applies.purposes.includes(purpose)) return false;
    return true;
  }).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
}
