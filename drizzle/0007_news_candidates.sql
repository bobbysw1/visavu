-- News-candidate queue (2026-05-20) — Tier 2 of the verified-news pipeline.
-- Nightly detect-news-candidates script populates this; /admin/news lets
-- a human approve / reject before any news goes live.

DO $$ BEGIN
 CREATE TYPE "news_candidate_status" AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "news_candidates" (
  "id" serial PRIMARY KEY NOT NULL,
  "fingerprint" varchar(256) NOT NULL,
  "drift_kind" varchar(32) NOT NULL,
  "destination_iso2" varchar(2),
  "passport_iso2" varchar(2),
  "suggested_title" text NOT NULL,
  "suggested_detail" text NOT NULL,
  "source_url" text,
  "drift_payload" jsonb NOT NULL,
  "status" "news_candidate_status" DEFAULT 'pending' NOT NULL,
  "detected_at" timestamp with time zone DEFAULT now() NOT NULL,
  "reviewed_at" timestamp with time zone,
  "reviewer_note" text
);--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "news_candidate_fingerprint_idx"
  ON "news_candidates" ("fingerprint");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "news_candidate_status_idx"
  ON "news_candidates" ("status", "detected_at");
