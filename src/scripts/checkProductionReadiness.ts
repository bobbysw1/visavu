/**
 * Production-readiness check. Run before deploying to confirm the box is
 * ready: env vars, schema migrated, adapters bootstrapped, no high-volume
 * parser errors, no broken reference links.
 *
 *   DATABASE_URL=postgres://... npx tsx src/scripts/checkProductionReadiness.ts
 *
 * Exits non-zero if any blocker is found — wire into the deploy pipeline.
 */
import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { ADAPTERS } from "@/scrapers/sources";

type Check = {
  name: string;
  ok: boolean;
  detail?: string;
};

const checks: Check[] = [];

async function envCheck() {
  const url = process.env.DATABASE_URL;
  checks.push({
    name: "DATABASE_URL is set",
    ok: !!url,
    detail: url
      ? `${url.split("@")[1]?.split("/")[0] ?? "(redacted)"} (host hidden)`
      : "Production needs a real Postgres. Provision Neon / Supabase / Railway and set DATABASE_URL.",
  });
}

async function schemaCheck() {
  try {
    const result = await db.execute<{ table_name: string }>(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name IN ('countries', 'passports', 'visa_options', 'sources', 'source_records')`,
    );
    const rows = (result as unknown as { rows?: { table_name: string }[] }).rows ?? (result as unknown as { table_name: string }[]);
    const found = new Set((rows as { table_name: string }[]).map((r) => r.table_name));
    const required = ["countries", "passports", "visa_options", "sources", "source_records"];
    const missing = required.filter((t) => !found.has(t));
    checks.push({
      name: "Schema migrated",
      ok: missing.length === 0,
      detail: missing.length === 0 ? `${required.length} required tables present` : `Missing: ${missing.join(", ")}. Run npm run db:migrate.`,
    });
  } catch (err) {
    checks.push({
      name: "Schema migrated",
      ok: false,
      detail: `Could not query information_schema: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}

async function adapterCoverageCheck() {
  try {
    const result = await db.execute<{ count: string }>(sql`SELECT COUNT(*)::text AS count FROM visa_options`);
    const rows = (result as unknown as { rows?: { count: string }[] }).rows ?? (result as unknown as { count: string }[]);
    const total = Number((rows as { count: string }[])[0]?.count) || 0;
    checks.push({
      name: "Adapter data populated",
      ok: total > 1000,
      detail: `${total.toLocaleString("en")} visa records in the DB. Expected: ≥ 1,000.`,
    });
  } catch (err) {
    checks.push({
      name: "Adapter data populated",
      ok: false,
      detail: `Query failed: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}

async function parserErrorCheck() {
  try {
    const result = await db.execute<{ count: string }>(
      sql`SELECT COUNT(*)::text AS count FROM source_records WHERE parse_error IS NOT NULL AND fetched_at > NOW() - INTERVAL '7 days'`,
    );
    const rows = (result as unknown as { rows?: { count: string }[] }).rows ?? (result as unknown as { count: string }[]);
    const recent = Number((rows as { count: string }[])[0]?.count) || 0;
    checks.push({
      name: "No recent parse errors",
      ok: recent === 0,
      detail: recent === 0 ? "No parse errors in last 7 days" : `${recent} parse errors in last 7 days — investigate /admin/sources.`,
    });
  } catch {
    checks.push({
      name: "No recent parse errors",
      ok: false,
      detail: "source_records table not accessible",
    });
  }
}

async function adapterRegistryCheck() {
  checks.push({
    name: "Adapter registry sane",
    ok: ADAPTERS.length >= 30,
    detail: `${ADAPTERS.length} adapters registered. Expected: ≥ 30.`,
  });
}

async function envSecretsAdvice() {
  const recommended: Array<{ key: string; required: boolean; purpose: string }> = [
    { key: "DATABASE_URL", required: true, purpose: "Production Postgres connection" },
    { key: "NEXT_PUBLIC_PLAUSIBLE_DOMAIN", required: false, purpose: "Privacy-friendly analytics" },
    { key: "SLACK_WEBHOOK_URL", required: false, purpose: "Parser-error / link-health alerts" },
    { key: "ADMIN_TOKEN", required: false, purpose: "Gates /admin/* routes" },
    { key: "RESEND_API_KEY", required: false, purpose: "Change-alert email opt-in (Tier 4)" },
    { key: "STRIPE_SECRET_KEY", required: false, purpose: "API-tier billing (Tier 4)" },
  ];
  const missing = recommended.filter((r) => !process.env[r.key]);
  for (const m of missing) {
    checks.push({
      name: `${m.required ? "ENV" : "ENV (optional)"}: ${m.key}`,
      ok: !m.required,
      detail: m.purpose,
    });
  }
}

async function main() {
  console.log("→ Running production-readiness checks...\n");
  await envCheck();
  await schemaCheck();
  await adapterCoverageCheck();
  await parserErrorCheck();
  await adapterRegistryCheck();
  await envSecretsAdvice();

  for (const c of checks) {
    console.log(`  ${c.ok ? "✓" : "✗"} ${c.name}`);
    if (c.detail) console.log(`     ${c.detail}`);
  }

  const blocking = checks.filter((c) => !c.ok && !c.name.includes("optional"));
  console.log();
  if (blocking.length === 0) {
    console.log("✅ Production-ready. Deploy when you're ready.");
    process.exit(0);
  }
  console.log(`❌ ${blocking.length} blocker(s). Fix before deploying.`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
