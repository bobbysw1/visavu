import {
  pgTable,
  pgEnum,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ------------------------------------------------------------
// Enums
// ------------------------------------------------------------
// Status replaces a naive boolean `visa_required`. "Visa-free with eTA" is
// genuinely different from truly visa-free; users get denied boarding over
// this distinction. See plan §Status enum.
export const visaStatusEnum = pgEnum("visa_status", [
  "visa_free",
  "visa_free_with_eta",
  "visa_on_arrival",
  "e_visa",
  "embassy_visa",
  "restricted",
  "refused",
]);

// Expanded for the one-stop-shop scope: short-stay (tourism/business/transit),
// long-stay (work/study/family), and official (diplomatic). Future additions
// (medical, journalism, working_holiday, retirement, digital_nomad, religious)
// can be appended without breaking the resolver — it's enum-driven everywhere.
export const purposeEnum = pgEnum("purpose", [
  "tourism",
  "business",
  "transit",
  "work",
  "study",
  "family",
  "diplomatic",
]);

// UI grouping. Used by the purpose picker and SEO category pages.
export const purposeCategoryEnum = pgEnum("purpose_category", [
  "short_stay",
  "long_stay",
  "official",
]);

export const passportTypeEnum = pgEnum("passport_type", [
  "ordinary",
  "diplomatic",
  "service",
  "official",
  "emergency",
  "other",
]);

export const sourceKindEnum = pgEnum("source_kind", [
  "government",
  "embassy",
  "wikipedia",
  "wikidata",
  "regional_bloc",
  "manual",
]);

export const verificationKindEnum = pgEnum("verification_kind", [
  "fetch",
  "cross_source",
  "human_review",
  "user_report_resolution",
]);

export const feeKindEnum = pgEnum("fee_kind", [
  "base",
  "service",
  "biometrics",
  "courier",
  "vac",
  "rush",
  "other",
]);

// ------------------------------------------------------------
// Reference data
// ------------------------------------------------------------
// ISO 3166-1 alpha-2 is the canonical key. Locale variants live in `country_names`.
export const countries = pgTable("countries", {
  iso2: varchar("iso2", { length: 2 }).primaryKey(),
  iso3: varchar("iso3", { length: 3 }).notNull(),
  numericCode: varchar("numeric_code", { length: 3 }).notNull(),
  // Default English name used for UI fallback. Display layer prefers locale match.
  defaultName: text("default_name").notNull(),
  // Some destinations care about other nationalities a traveler holds (e.g. Israel-Arab,
  // India-Pakistan, Taiwan-PRC). Stored as a list of restricted-from iso2 codes.
  restrictedNationalities: jsonb("restricted_nationalities").$type<string[]>().notNull().default([]),
  // Whether this entity has its own immigration policy (e.g. HK, Macau differ from PRC).
  hasOwnImmigration: boolean("has_own_immigration").notNull().default(false),
  notes: text("notes"),
});

export const countryNames = pgTable(
  "country_names",
  {
    iso2: varchar("iso2", { length: 2 })
      .notNull()
      .references(() => countries.iso2, { onDelete: "cascade" }),
    locale: varchar("locale", { length: 10 }).notNull(),
    name: text("name").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.iso2, t.locale] }),
    index("idx_country_names_name").on(t.name),
  ],
);

// Passport is separate from Country to allow non-state-issuance variants:
// BNO (HK), Palestinian Authority, Sovereign Order of Malta, diplomatic/service variants.
export const passports = pgTable(
  "passports",
  {
    id: serial("id").primaryKey(),
    issuerIso2: varchar("issuer_iso2", { length: 2 })
      .notNull()
      .references(() => countries.iso2),
    type: passportTypeEnum("type").notNull().default("ordinary"),
    // Free-form variant tag for things like "BNO", "OCI" that aren't strict ISO passport types.
    variant: text("variant"),
    label: text("label").notNull(),
  },
  (t) => [uniqueIndex("uniq_passport_issuer_type_variant").on(t.issuerIso2, t.type, t.variant)],
);

// ------------------------------------------------------------
// Blocs (first-class — Schengen, GCC, CARICOM, ECOWAS, EAC, Mercosur, etc.)
// ------------------------------------------------------------
export const blocs = pgTable("blocs", {
  id: varchar("id", { length: 32 }).primaryKey(), // e.g. "schengen", "gcc"
  name: text("name").notNull(),
  description: text("description"),
});

export const blocMemberships = pgTable(
  "bloc_memberships",
  {
    blocId: varchar("bloc_id", { length: 32 })
      .notNull()
      .references(() => blocs.id, { onDelete: "cascade" }),
    countryIso2: varchar("country_iso2", { length: 2 })
      .notNull()
      .references(() => countries.iso2, { onDelete: "cascade" }),
    // Effective dating matters: Croatia joined Schengen 2023-01-01, Romania/Bulgaria
    // land borders 2024-03-31. Resolver respects this.
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    // Some blocs apply only to specific qualifications (e.g. CARICOM Skilled National,
    // GCC residence permit). Free-form for now.
    qualifier: text("qualifier"),
  },
  (t) => [
    primaryKey({ columns: [t.blocId, t.countryIso2, t.effectiveFrom] }),
    index("idx_bloc_membership_country").on(t.countryIso2),
  ],
);

// ------------------------------------------------------------
// eTA systems — separate from visas
// ------------------------------------------------------------
export const etaSystems = pgTable("eta_systems", {
  id: varchar("id", { length: 32 }).primaryKey(), // "esta", "canada_eta", "uk_eta", "etias", "k_eta", "evisitor"
  name: text("name").notNull(),
  destinationIso2: varchar("destination_iso2", { length: 2 })
    .notNull()
    .references(() => countries.iso2),
  applyUrl: text("apply_url"),
  // Live status: "active", "rolling_out", "announced". ETIAS in 2026, UK ETA in rollout.
  status: text("status").notNull().default("active"),
  effectiveFrom: date("effective_from"),
  notes: text("notes"),
});

// Which passports require which eTA. "Visa-free with eTA" is encoded by joining
// visa_options.status = visa_free_with_eta with this table.
export const etaEligibility = pgTable(
  "eta_eligibility",
  {
    etaId: varchar("eta_id", { length: 32 })
      .notNull()
      .references(() => etaSystems.id, { onDelete: "cascade" }),
    passportId: integer("passport_id")
      .notNull()
      .references(() => passports.id, { onDelete: "cascade" }),
    feeAmount: integer("fee_amount"), // minor units (cents)
    feeCurrency: varchar("fee_currency", { length: 3 }),
    feeAsOf: date("fee_as_of"),
    validityDays: integer("validity_days"),
    notes: text("notes"),
  },
  (t) => [primaryKey({ columns: [t.etaId, t.passportId] })],
);

// ------------------------------------------------------------
// Visa options — multiple rows per (passport, destination, purpose)
// ------------------------------------------------------------
// A US passport going to India for tourism has at least three legitimate options
// (e-Tourist 30/1yr/5yr, sticker, OCI). Users want to compare options.
export const visaOptions = pgTable(
  "visa_options",
  {
    id: serial("id").primaryKey(),
    passportId: integer("passport_id")
      .notNull()
      .references(() => passports.id, { onDelete: "cascade" }),
    destinationIso2: varchar("destination_iso2", { length: 2 })
      .notNull()
      .references(() => countries.iso2, { onDelete: "cascade" }),
    purpose: purposeEnum("purpose").notNull(),
    status: visaStatusEnum("status").notNull(),

    // Human-facing label: "e-Tourist Visa (30 days)", "Visa on arrival", "Schengen C-visa".
    label: text("label").notNull(),

    // Stay vs validity are distinct and constantly conflated in source material.
    maxStayDays: integer("max_stay_days"),
    validityDays: integer("validity_days"),
    entriesAllowed: text("entries_allowed"), // "single" | "double" | "multiple" | free-form

    passportValidityMonthsRequired: integer("passport_validity_months_required"),
    blankPagesRequired: integer("blank_pages_required"),
    onwardTicketRequired: boolean("onward_ticket_required"),
    proofOfFundsRequired: boolean("proof_of_funds_required"),
    proofOfAccommodationRequired: boolean("proof_of_accommodation_required"),
    biometricsRequired: boolean("biometrics_required"),
    biometricsLocation: text("biometrics_location"),

    // Free-form list — translated from origin language at write time only for prose fields.
    requirements: jsonb("requirements").$type<string[]>().notNull().default([]),

    // Purpose-specific metadata. Loose-typed by purpose so the schema doesn't
    // explode with one column per visa type. Shape is enforced in lib/types.ts:
    //   work:       { sponsorshipRequired, sponsorType, salaryThresholdMinor, salaryCurrency, eligibleOccupations[], jobOffer }
    //   study:      { institutionAccreditationRequired, courseDurationMonths, financialProofMonthlyMinor, partTimeWorkAllowedHours }
    //   family:     { relationshipTypes[], sponsorIncomeThresholdMinor, sponsorCitizenOrResident, cohabitationProofRequired }
    //   diplomatic: { authorizationLetterRequired, accreditedMissionRequired }
    // For tourism/business/transit this is null.
    purposeMetadata: jsonb("purpose_metadata").$type<Record<string, unknown> | null>(),

    // Yellow fever etc. — still enforced at borders.
    vaccinationRequirements: jsonb("vaccination_requirements")
      .$type<string[]>()
      .notNull()
      .default([]),

    processingTimeDaysMin: integer("processing_time_days_min"),
    processingTimeDaysMax: integer("processing_time_days_max"),
    applicationUrl: text("application_url"),
    primarySourceUrl: text("primary_source_url"),

    // Bloc-derived rows are inserted by the resolver/derivation step. Keeps the
    // resolver fast (no rules-engine work at request time for hot rows).
    blocDerivedFrom: varchar("bloc_derived_from", { length: 32 }).references(() => blocs.id),

    notes: text("notes"),

    // Confidence and freshness — see lib/confidence.ts.
    correctnessBucket: text("correctness_bucket"), // "high" | "medium" | "low" | "unverified"
    lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    deprecatedAt: timestamp("deprecated_at", { withTimezone: true }),

    // Cross-source check result. Populated by src/scripts/crossCheckWikipedia.ts —
    // compares low-confidence rows against the destination's curated MFA portal.
    // Values: "agrees" | "conflicts" | "no_mention" | null (unchecked).
    crossCheckResult: text("cross_check_result"),
    crossCheckedAt: timestamp("cross_checked_at", { withTimezone: true }),

    // Programme kill-switch — for politically-volatile programs that can be
    // paused / wound down between scrapes. Null defaults to "active".
    // Values: "active" | "paused" | "wound_down" | "unverified".
    programmeStatus: text("programme_status"),
    programmeStatusNote: text("programme_status_note"),

    // Link-health for the .gov apply / source URL. Populated by checkLinks.
    // "ok" | "soft_block" (403/timeout, fine in browsers) | "broken" (404/410) | null.
    linkHealth: text("link_health"),
    linkHealthCheckedAt: timestamp("link_health_checked_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_visa_options_lookup").on(t.passportId, t.destinationIso2, t.purpose),
    index("idx_visa_options_destination").on(t.destinationIso2),
  ],
);

// ------------------------------------------------------------
// User alert subscriptions — change-alert email opt-in.
// ------------------------------------------------------------
export const userAlertSubscriptions = pgTable(
  "user_alert_subscriptions",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passportIso2: varchar("passport_iso2", { length: 2 }).notNull(),
    destinationIso2: varchar("destination_iso2", { length: 2 }).notNull(),
    purpose: text("purpose"),
    confirmationToken: text("confirmation_token"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_alert_subs_email").on(t.email),
    index("idx_alert_subs_route").on(t.passportIso2, t.destinationIso2, t.purpose),
  ],
);

// ------------------------------------------------------------
// Fees — list of components, never a single number
// ------------------------------------------------------------
export const feeComponents = pgTable(
  "fee_components",
  {
    id: serial("id").primaryKey(),
    visaOptionId: integer("visa_option_id")
      .notNull()
      .references(() => visaOptions.id, { onDelete: "cascade" }),
    kind: feeKindEnum("kind").notNull(),
    amountMinor: integer("amount_minor").notNull(), // cents
    currency: varchar("currency", { length: 3 }).notNull(),
    asOf: date("as_of").notNull(),
    label: text("label"),
    optional: boolean("optional").notNull().default(false),
  },
  (t) => [index("idx_fee_components_visa_option").on(t.visaOptionId)],
);

// ------------------------------------------------------------
// Sourcing & verification
// ------------------------------------------------------------
export const sources = pgTable("sources", {
  id: varchar("id", { length: 64 }).primaryKey(), // adapter id, e.g. "us_state_reciprocity"
  kind: sourceKindEnum("kind").notNull(),
  name: text("name").notNull(),
  url: text("url"),
  // Authority weight per field — JSON keyed by field name. Government source wins on cost,
  // Wikipedia wins on coverage. See lib/confidence.ts.
  fieldWeights: jsonb("field_weights").$type<Record<string, number>>().notNull().default({}),
  notes: text("notes"),
});

// Each scrape produces a SourceRecord — the raw normalized record before merging
// into visa_options. Conflicts are resolved by confidence weighting; unresolvable
// conflicts go to the human review queue.
export const sourceRecords = pgTable(
  "source_records",
  {
    id: serial("id").primaryKey(),
    sourceId: varchar("source_id", { length: 64 })
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    parserVersion: text("parser_version").notNull(),
    // The normalized fields this source asserted. Same shape as visa_options' fields,
    // but indexed by (passport_id, destination_iso2, purpose) within the JSON.
    payload: jsonb("payload").notNull(),
    rawHash: varchar("raw_hash", { length: 64 }), // hash of parsed JSON, not raw HTML
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
    fetchUrl: text("fetch_url"),
    // Set when the parser failed but we still want to record the attempt.
    parseError: text("parse_error"),
  },
  (t) => [
    index("idx_source_records_source").on(t.sourceId, t.fetchedAt),
    index("idx_source_records_hash").on(t.sourceId, t.rawHash),
  ],
);

// Distinguishes "last fetched" from "last verified". Surfaced separately to users.
export const verificationEvents = pgTable(
  "verification_events",
  {
    id: serial("id").primaryKey(),
    visaOptionId: integer("visa_option_id")
      .notNull()
      .references(() => visaOptions.id, { onDelete: "cascade" }),
    kind: verificationKindEnum("kind").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    actor: text("actor"), // adapter id, reviewer email, or "system"
    notes: text("notes"),
  },
  (t) => [index("idx_verification_events_visa_option").on(t.visaOptionId, t.occurredAt)],
);

// Reciprocity: a US fee change should auto-flag CN→US for re-verification.
export const reciprocityLinks = pgTable(
  "reciprocity_links",
  {
    id: serial("id").primaryKey(),
    fromCountry: varchar("from_country", { length: 2 })
      .notNull()
      .references(() => countries.iso2),
    toCountry: varchar("to_country", { length: 2 })
      .notNull()
      .references(() => countries.iso2),
    description: text("description"),
  },
  (t) => [uniqueIndex("uniq_reciprocity").on(t.fromCountry, t.toCountry)],
);

// User-reported corrections — both UX and good-faith liability documentation.
export const userReports = pgTable("user_reports", {
  id: serial("id").primaryKey(),
  visaOptionId: integer("visa_option_id").references(() => visaOptions.id, {
    onDelete: "set null",
  }),
  passportIso2: varchar("passport_iso2", { length: 2 }),
  destinationIso2: varchar("destination_iso2", { length: 2 }),
  purpose: purposeEnum("purpose"),
  message: text("message").notNull(),
  citationUrl: text("citation_url"),
  reporterEmail: text("reporter_email"),
  status: text("status").notNull().default("new"), // new | triaged | resolved | dismissed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

// ------------------------------------------------------------
// Relations
// ------------------------------------------------------------
export const countriesRelations = relations(countries, ({ many }) => ({
  names: many(countryNames),
  passports: many(passports),
  blocMemberships: many(blocMemberships),
}));

export const passportsRelations = relations(passports, ({ one, many }) => ({
  issuer: one(countries, { fields: [passports.issuerIso2], references: [countries.iso2] }),
  visaOptions: many(visaOptions),
}));

export const blocsRelations = relations(blocs, ({ many }) => ({
  memberships: many(blocMemberships),
}));

export const visaOptionsRelations = relations(visaOptions, ({ one, many }) => ({
  passport: one(passports, { fields: [visaOptions.passportId], references: [passports.id] }),
  destination: one(countries, {
    fields: [visaOptions.destinationIso2],
    references: [countries.iso2],
  }),
  fees: many(feeComponents),
  verifications: many(verificationEvents),
  derivedFrom: one(blocs, {
    fields: [visaOptions.blocDerivedFrom],
    references: [blocs.id],
  }),
}));

export const feeComponentsRelations = relations(feeComponents, ({ one }) => ({
  visaOption: one(visaOptions, {
    fields: [feeComponents.visaOptionId],
    references: [visaOptions.id],
  }),
}));
