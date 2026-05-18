# Wire a real Postgres for write-persistent user data

The default deployment uses PGlite (in-memory at runtime on Vercel,
loaded from `src/data/pglite-dump.tar.gz` on cold start). PGlite is
perfect for the *read-only* visa data — but **writes don't persist
across cold starts**. That means the user-accounts schema works
(magic-link signin / watchlists / notifications) only within a single
function instance lifetime, then resets.

For accounts to actually work in production, you need a managed Postgres.
This is a 15-minute setup with [Neon](https://neon.tech) (free tier
is plenty for early traffic).

## Step 1 — Provision Neon

1. Sign up at https://neon.tech
2. Create a project (region: close to your Vercel deployment — `aws-eu-west-2` if your Vercel project is in London, `aws-us-east-1` if Washington DC, etc.)
3. Copy the **connection string** from the Neon dashboard. It looks like:
   ```
   postgresql://USER:PASS@ep-something.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2 — Add to Vercel

1. Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: paste the Neon connection string
   - **Environments**: tick **Production** and **Preview**, leave **Development** unchecked
3. Save

## Step 3 — Bootstrap the schema

The next cold start of any Vercel function will:
1. See `DATABASE_URL` is set
2. Switch the DB client from PGlite to postgres-js → Neon
3. Run `migrate.ts` which applies all drizzle migrations to the Neon DB

If your first request returns a 500, it's likely because tables haven't been created yet. Trigger the migration once:

```bash
DATABASE_URL='postgresql://...' npm run db:migrate
```

(Run this locally with the Neon connection string — it pushes the schema.)

## Step 4 — Decide what data lives where

Two architectures, pick one:

### Option A — User data only on Neon (recommended)
- Neon holds: `users`, `auth_tokens`, `watchlist_subscriptions`, `notification_events`
- PGlite (snapshot) holds: everything else (visa data, countries, blocs, etc.)
- Requires a small routing layer — currently the client is all-or-nothing.
- **TODO**: split `src/db/client.ts` to expose two clients: `userDb` (Postgres when `DATABASE_URL` set, PGlite otherwise) and `visaDb` (always PGlite). Update `src/lib/auth.ts` and the watchlist/notification code to use `userDb`.

### Option B — Everything on Neon
- Move the entire visa dataset to Neon at first use (one-time migration script).
- Bootstrap script would `pg_restore` the snapshot into Neon instead of loading PGlite in-memory.
- Higher Neon usage (~100 MB live data), but unified.
- Slower cold start (Neon connection + query latency vs in-memory PGlite).

## Step 5 — Verify it's working

Visit `/admin/db-status` (token-gated). The page reports:
- Which DB driver is active (PGlite memory / PGlite filesystem / Postgres)
- Table row counts
- Read latency
- Write health check (insert + delete a test row in a designated `_health` table)

If everything's green, sign up at `/signin`, confirm the magic link works (requires `RESEND_API_KEY` set as well), then check your account at `/account`. The watchlist + sign-out + delete-account flows should all persist now.

## Cost expectations

Neon free tier: 0.5 GB storage, 100 hours compute / month, unlimited bandwidth.
For Visavu's user-data scope (users + tokens + watchlists), this comfortably handles thousands of users.

Migration to a paid tier ($19/month) gets you 10 GB + dedicated compute.

## Rolling back

If anything breaks, remove the `DATABASE_URL` env var from Vercel and redeploy.
The client will fall back to PGlite. User data won't be lost — it stays in Neon
even when not connected — but accounts won't function for signed-in users until
you reconnect.
