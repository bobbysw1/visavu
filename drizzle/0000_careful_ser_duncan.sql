CREATE TYPE "public"."fee_kind" AS ENUM('base', 'service', 'biometrics', 'courier', 'vac', 'rush', 'other');--> statement-breakpoint
CREATE TYPE "public"."passport_type" AS ENUM('ordinary', 'diplomatic', 'service', 'official', 'emergency', 'other');--> statement-breakpoint
CREATE TYPE "public"."purpose_category" AS ENUM('short_stay', 'long_stay', 'official');--> statement-breakpoint
CREATE TYPE "public"."purpose" AS ENUM('tourism', 'business', 'transit', 'work', 'study', 'family', 'diplomatic');--> statement-breakpoint
CREATE TYPE "public"."source_kind" AS ENUM('government', 'embassy', 'wikipedia', 'wikidata', 'regional_bloc', 'manual');--> statement-breakpoint
CREATE TYPE "public"."verification_kind" AS ENUM('fetch', 'cross_source', 'human_review', 'user_report_resolution');--> statement-breakpoint
CREATE TYPE "public"."visa_status" AS ENUM('visa_free', 'visa_free_with_eta', 'visa_on_arrival', 'e_visa', 'embassy_visa', 'restricted', 'refused');--> statement-breakpoint
CREATE TABLE "bloc_memberships" (
	"bloc_id" varchar(32) NOT NULL,
	"country_iso2" varchar(2) NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"qualifier" text,
	CONSTRAINT "bloc_memberships_bloc_id_country_iso2_effective_from_pk" PRIMARY KEY("bloc_id","country_iso2","effective_from")
);
--> statement-breakpoint
CREATE TABLE "blocs" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"iso2" varchar(2) PRIMARY KEY NOT NULL,
	"iso3" varchar(3) NOT NULL,
	"numeric_code" varchar(3) NOT NULL,
	"default_name" text NOT NULL,
	"restricted_nationalities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"has_own_immigration" boolean DEFAULT false NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "country_names" (
	"iso2" varchar(2) NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "country_names_iso2_locale_pk" PRIMARY KEY("iso2","locale")
);
--> statement-breakpoint
CREATE TABLE "eta_eligibility" (
	"eta_id" varchar(32) NOT NULL,
	"passport_id" integer NOT NULL,
	"fee_amount" integer,
	"fee_currency" varchar(3),
	"fee_as_of" date,
	"validity_days" integer,
	"notes" text,
	CONSTRAINT "eta_eligibility_eta_id_passport_id_pk" PRIMARY KEY("eta_id","passport_id")
);
--> statement-breakpoint
CREATE TABLE "eta_systems" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"destination_iso2" varchar(2) NOT NULL,
	"apply_url" text,
	"status" text DEFAULT 'active' NOT NULL,
	"effective_from" date,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "fee_components" (
	"id" serial PRIMARY KEY NOT NULL,
	"visa_option_id" integer NOT NULL,
	"kind" "fee_kind" NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"as_of" date NOT NULL,
	"label" text,
	"optional" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passports" (
	"id" serial PRIMARY KEY NOT NULL,
	"issuer_iso2" varchar(2) NOT NULL,
	"type" "passport_type" DEFAULT 'ordinary' NOT NULL,
	"variant" text,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reciprocity_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_country" varchar(2) NOT NULL,
	"to_country" varchar(2) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "source_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"parser_version" text NOT NULL,
	"payload" jsonb NOT NULL,
	"raw_hash" varchar(64),
	"fetched_at" timestamp with time zone NOT NULL,
	"fetch_url" text,
	"parse_error" text
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"kind" "source_kind" NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"field_weights" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "user_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"visa_option_id" integer,
	"passport_iso2" varchar(2),
	"destination_iso2" varchar(2),
	"purpose" "purpose",
	"message" text NOT NULL,
	"citation_url" text,
	"reporter_email" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "verification_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"visa_option_id" integer NOT NULL,
	"kind" "verification_kind" NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "visa_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"passport_id" integer NOT NULL,
	"destination_iso2" varchar(2) NOT NULL,
	"purpose" "purpose" NOT NULL,
	"status" "visa_status" NOT NULL,
	"label" text NOT NULL,
	"max_stay_days" integer,
	"validity_days" integer,
	"entries_allowed" text,
	"passport_validity_months_required" integer,
	"blank_pages_required" integer,
	"onward_ticket_required" boolean,
	"proof_of_funds_required" boolean,
	"proof_of_accommodation_required" boolean,
	"biometrics_required" boolean,
	"biometrics_location" text,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"purpose_metadata" jsonb,
	"vaccination_requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"processing_time_days_min" integer,
	"processing_time_days_max" integer,
	"application_url" text,
	"primary_source_url" text,
	"bloc_derived_from" varchar(32),
	"notes" text,
	"correctness_bucket" text,
	"last_fetched_at" timestamp with time zone,
	"last_verified_at" timestamp with time zone,
	"deprecated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bloc_memberships" ADD CONSTRAINT "bloc_memberships_bloc_id_blocs_id_fk" FOREIGN KEY ("bloc_id") REFERENCES "public"."blocs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bloc_memberships" ADD CONSTRAINT "bloc_memberships_country_iso2_countries_iso2_fk" FOREIGN KEY ("country_iso2") REFERENCES "public"."countries"("iso2") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "country_names" ADD CONSTRAINT "country_names_iso2_countries_iso2_fk" FOREIGN KEY ("iso2") REFERENCES "public"."countries"("iso2") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eta_eligibility" ADD CONSTRAINT "eta_eligibility_eta_id_eta_systems_id_fk" FOREIGN KEY ("eta_id") REFERENCES "public"."eta_systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eta_eligibility" ADD CONSTRAINT "eta_eligibility_passport_id_passports_id_fk" FOREIGN KEY ("passport_id") REFERENCES "public"."passports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eta_systems" ADD CONSTRAINT "eta_systems_destination_iso2_countries_iso2_fk" FOREIGN KEY ("destination_iso2") REFERENCES "public"."countries"("iso2") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_components" ADD CONSTRAINT "fee_components_visa_option_id_visa_options_id_fk" FOREIGN KEY ("visa_option_id") REFERENCES "public"."visa_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passports" ADD CONSTRAINT "passports_issuer_iso2_countries_iso2_fk" FOREIGN KEY ("issuer_iso2") REFERENCES "public"."countries"("iso2") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reciprocity_links" ADD CONSTRAINT "reciprocity_links_from_country_countries_iso2_fk" FOREIGN KEY ("from_country") REFERENCES "public"."countries"("iso2") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reciprocity_links" ADD CONSTRAINT "reciprocity_links_to_country_countries_iso2_fk" FOREIGN KEY ("to_country") REFERENCES "public"."countries"("iso2") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_records" ADD CONSTRAINT "source_records_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_visa_option_id_visa_options_id_fk" FOREIGN KEY ("visa_option_id") REFERENCES "public"."visa_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_events" ADD CONSTRAINT "verification_events_visa_option_id_visa_options_id_fk" FOREIGN KEY ("visa_option_id") REFERENCES "public"."visa_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visa_options" ADD CONSTRAINT "visa_options_passport_id_passports_id_fk" FOREIGN KEY ("passport_id") REFERENCES "public"."passports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visa_options" ADD CONSTRAINT "visa_options_destination_iso2_countries_iso2_fk" FOREIGN KEY ("destination_iso2") REFERENCES "public"."countries"("iso2") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visa_options" ADD CONSTRAINT "visa_options_bloc_derived_from_blocs_id_fk" FOREIGN KEY ("bloc_derived_from") REFERENCES "public"."blocs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bloc_membership_country" ON "bloc_memberships" USING btree ("country_iso2");--> statement-breakpoint
CREATE INDEX "idx_country_names_name" ON "country_names" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_fee_components_visa_option" ON "fee_components" USING btree ("visa_option_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_passport_issuer_type_variant" ON "passports" USING btree ("issuer_iso2","type","variant");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_reciprocity" ON "reciprocity_links" USING btree ("from_country","to_country");--> statement-breakpoint
CREATE INDEX "idx_source_records_source" ON "source_records" USING btree ("source_id","fetched_at");--> statement-breakpoint
CREATE INDEX "idx_source_records_hash" ON "source_records" USING btree ("source_id","raw_hash");--> statement-breakpoint
CREATE INDEX "idx_verification_events_visa_option" ON "verification_events" USING btree ("visa_option_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_visa_options_lookup" ON "visa_options" USING btree ("passport_id","destination_iso2","purpose");--> statement-breakpoint
CREATE INDEX "idx_visa_options_destination" ON "visa_options" USING btree ("destination_iso2");