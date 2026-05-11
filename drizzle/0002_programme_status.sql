-- Programme kill-switch — for politically-volatile programs (US Gold Card,
-- Spain Golden Visa, Portugal Golden Visa real-estate route, etc.) that can
-- be paused / wound down without warning. Default null = "active".
ALTER TABLE "visa_options" ADD COLUMN "programme_status" text;--> statement-breakpoint
ALTER TABLE "visa_options" ADD COLUMN "programme_status_note" text;
