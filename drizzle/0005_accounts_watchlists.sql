-- P30 — passwordless accounts, watchlists, notification events.
-- Schema additions in src/db/schema.ts.
DO $$ BEGIN
 CREATE TYPE "notification_kind" AS ENUM ('rule_change', 'fee_change', 'eligibility_change', 'status_change');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL,
  "email_verified_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_login_at" timestamp with time zone,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "watchlist_subscriptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "passport_iso2" varchar(2) NOT NULL,
  "destination_iso2" varchar(2) NOT NULL,
  "purpose" "purpose" NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_notified_at" timestamp with time zone
);--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "watchlist_subscriptions"
   ADD CONSTRAINT "watchlist_user_fk"
   FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "watchlist_user_route_idx" ON "watchlist_subscriptions" ("user_id", "passport_iso2", "destination_iso2", "purpose");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watchlist_route_idx" ON "watchlist_subscriptions" ("passport_iso2", "destination_iso2", "purpose");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "notification_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "subscription_id" integer NOT NULL,
  "kind" "notification_kind" NOT NULL,
  "payload" jsonb NOT NULL,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "notification_events"
   ADD CONSTRAINT "notif_user_fk"
   FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "notification_events"
   ADD CONSTRAINT "notif_subscription_fk"
   FOREIGN KEY ("subscription_id") REFERENCES "watchlist_subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "notif_user_idx" ON "notification_events" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notif_unsent_idx" ON "notification_events" ("sent_at");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "auth_tokens" (
  "token" varchar(128) PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "consumed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "auth_tokens_email_idx" ON "auth_tokens" ("email");
