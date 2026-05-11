CREATE TABLE IF NOT EXISTS "user_alert_subscriptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "passport_iso2" varchar(2) NOT NULL,
  "destination_iso2" varchar(2) NOT NULL,
  "purpose" text,
  "confirmation_token" text,
  "confirmed_at" timestamp with time zone,
  "unsubscribed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_notified_at" timestamp with time zone
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alert_subs_email" ON "user_alert_subscriptions" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alert_subs_route" ON "user_alert_subscriptions" ("passport_iso2", "destination_iso2", "purpose");
