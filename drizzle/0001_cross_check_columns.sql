-- Add cross-source-check columns. See src/scripts/crossCheckWikipedia.ts.
ALTER TABLE "visa_options" ADD COLUMN "cross_check_result" text;--> statement-breakpoint
ALTER TABLE "visa_options" ADD COLUMN "cross_checked_at" timestamp with time zone;
