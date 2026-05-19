-- Chat conversation logging + cost-cap (2026-05-19)
--
-- Two tables: chat_conversations + chat_messages. IPs are stored as
-- HMAC-SHA256 hashes (env-salted), never raw. Used for both abuse-
-- prevention rate limits and quality review of bad replies.

DO $$ BEGIN
 CREATE TYPE "chat_role" AS ENUM ('system', 'user', 'assistant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "chat_conversations" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" varchar(64) NOT NULL,
  "user_id" integer,
  "ip_hash" varchar(64) NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
  "message_count" integer DEFAULT 0 NOT NULL,
  "total_tokens" integer DEFAULT 0 NOT NULL
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "chat_conv_session_idx" ON "chat_conversations" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_conv_ip_recent_idx" ON "chat_conversations" ("ip_hash", "last_message_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_conv_user_idx" ON "chat_conversations" ("user_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "conversation_id" integer NOT NULL,
  "role" "chat_role" NOT NULL,
  "content" text NOT NULL,
  "tokens" integer DEFAULT 0 NOT NULL,
  "model" varchar(64),
  "is_refusal" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "chat_messages"
   ADD CONSTRAINT "chat_msg_conv_fk"
   FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "chat_msg_conv_idx" ON "chat_messages" ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_msg_recent_idx" ON "chat_messages" ("created_at");
