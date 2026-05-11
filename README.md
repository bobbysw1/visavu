# Visa Lookup

Free, government-source-linked visa-information aggregator. 250 passports × 250 destinations × 7 purposes, with confidence labelling, application checklists, multilingual support, and a "Where can I go?" wizard.

## Run locally

```bash
npm install
npm run bootstrap   # one-shot DB migrate + seed + adapter ingest into PGlite
npm run dev         # Next.js dev server on :3000
```

The bootstrap takes ~60 seconds on first run (38 adapters, ~70k records).

## Operations

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run bootstrap` | Migrate + seed + ingest all adapters from fixtures |
| `npm run refresh -- --all` | Re-fetch every adapter past its `defaultIntervalMs` |
| `npm run refresh -- --id ${ADAPTER_ID}` | Re-fetch a single adapter |
| `npm run refresh -- --fixture` | Force fixture-only mode (no network) |
| `npm run check-sources` | Source-health audit (overdue, drift, parse errors) |
| `npm run check-links` | Reference-link health audit (404 / dead .gov pages) |
| `npx tsx src/scripts/buildWikipediaFixture.ts [ISO ...]` | Re-fetch Wikipedia long-tail fixture |

## Hosted scheduler

Nightly fixture refresh runs via GitHub Actions at `04:00 UTC` (see `.github/workflows/refresh.yml`).

Required repository secrets:

| Secret | Purpose |
|---|---|
| `SLACK_WEBHOOK_URL` | Webhook for parser-error / drift / link-health alerts |
| `DATABASE_URL` | (Production only) Postgres connection string for live refresh |

The workflow:
1. Runs `npm run refresh -- --all` against the latest source.
2. Commits any fixture changes back to `main` with a `data:` prefix message.
3. Runs `npm run check-sources` and `npm run check-links` and posts results to Slack.
4. Uploads logs as a 30-day workflow artefact.

To trigger a manual run: GitHub Actions → "Nightly data refresh" → Run workflow.

## Analytics

Plausible (privacy-friendly, no consent banner needed). Configure the domain via:

```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=visalookup.example
```

Custom events tracked (see `src/components/PlausibleScript.tsx` and per-component dispatches):

- `ApplyClicked` — user clicked the .gov "Apply on official site" CTA
- `FinderSubmitted` — wizard search submitted
- `LocaleChanged` — user switched language

## Production deployment

Local dev uses PGlite (in-process Postgres WASM, persists to `./.pglite`). Production needs a real Postgres. We've tested against Neon and Supabase free tiers.

### Step-by-step (Neon + Vercel)

1. **Create the database.** Sign up at [neon.tech](https://neon.tech), create a project, copy the connection string from the "Connection details" panel. It looks like `postgres://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`.

2. **Set env vars.** In Vercel project settings → Environment variables:

   | Variable | Required? | Purpose |
   |---|---|---|
   | `DATABASE_URL` | yes | Postgres connection string |
   | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | no | Privacy-friendly analytics |
   | `SLACK_WEBHOOK_URL` | no | Alerts on parser errors / dead links |
   | `ADMIN_TOKEN` | no | Gates `/admin/*` routes (cookie-based middleware) |
   | `RESEND_API_KEY` | no | Change-alert email confirmation |
   | `STRIPE_SECRET_KEY` | no | Billing for /api access |

3. **Migrate the schema.** Locally with the production URL:
   ```bash
   DATABASE_URL=postgres://... npm run db:migrate
   ```

4. **Bootstrap data.** Seeds reference tables and runs every adapter against fixtures:
   ```bash
   DATABASE_URL=postgres://... npm run bootstrap
   ```
   First run takes ~3 minutes against a real Postgres.

5. **Verify readiness.**
   ```bash
   DATABASE_URL=postgres://... npm run check-prod
   ```
   Output: schema migrated ✓, ≥1,000 records ✓, no recent parse errors ✓, adapter registry sane ✓. Exits non-zero on blockers.

6. **Deploy.** `vercel --prod` or whatever your CI does. The Next.js app reads `DATABASE_URL` and switches off PGlite automatically (see `src/db/client.ts`).

7. **Wire the scheduler.** GitHub Actions cron at `.github/workflows/refresh.yml` runs nightly at 04:00 UTC. Add `SLACK_WEBHOOK_URL` and (for production refresh) `DATABASE_URL` to repository secrets.

### Going from PGlite to a real Postgres

Drop your local `./.pglite` directory if you want to switch entirely:
```bash
rm -rf .pglite
DATABASE_URL=postgres://... npm run bootstrap
```

The dual-mode `db` client in `src/db/client.ts` activates Postgres when `DATABASE_URL` is set; otherwise it falls back to PGlite. There's no separate code path to maintain.

## Architecture

- **Next.js 15** App Router + TypeScript + Tailwind v4
- **PGlite** (in-process Postgres WASM) for dev / `postgres-js` in production
- **Drizzle ORM** + drizzle-kit migrations
- **38 adapters** in `src/scrapers/sources/` covering government scrapers, regional blocs, hand-curated programs, and Wikipedia long-tail
- **8 languages** (en/es/fr/pt/ar/hi/zh/ru/id) with RTL for Arabic via `src/i18n/`

See `/methodology` and `/changelog` for the public data-quality story.

## License

MIT for the code. See `/methodology` for licensing of derived data (Wikipedia rows are CC-BY-SA 4.0; government source content is reproduced under fair-use / public-domain provisions).
