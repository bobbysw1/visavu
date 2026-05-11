-- Link-health for the apply / primary-source URL on each visa option.
-- Populated by checkLinks.ts and surfaced to admins on /admin/sources.
ALTER TABLE "visa_options" ADD COLUMN "link_health" text;--> statement-breakpoint
ALTER TABLE "visa_options" ADD COLUMN "link_health_checked_at" timestamp with time zone;
