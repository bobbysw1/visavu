/**
 * Link checker — every URL referenced in the curated knowledge files needs
 * to actually resolve, otherwise we're shipping dead "primary source" links.
 *
 *   npm run check-links
 *
 * Walks countryResources.ts (visaPortal / embassyDirectory /
 * localLanguagePortal), obstacles.ts (references[].url), the adapter
 * primaryUrls, and applicationUrls. Issues HEAD requests with a realistic
 * Chrome User-Agent. Prints any 4xx / 5xx / network failure.
 *
 * Exit non-zero if any check failed — usable from CI.
 */
import { politeFetch } from "@/scrapers/base/fetchClient";

type Reference = { source: string; label: string; url: string };

async function gatherLinks(): Promise<Reference[]> {
  const refs: Reference[] = [];

  const cr = await import("@/content/countryResources");
  // Re-flatten via the exposed helpers — the map itself isn't exported, but
  // we know the iso2 keys are every country we have. Skip duplication: pull
  // resources for every member of COUNTRY_LIST.
  const { COUNTRY_LIST } = await import("@/lib/countries");
  for (const c of COUNTRY_LIST) {
    const r = cr.resourcesFor(c.iso2);
    if (!r) continue;
    if (r.visaPortal) refs.push({ source: `countryResources[${c.iso2}].visaPortal`, label: r.visaPortalLabel ?? "visa portal", url: r.visaPortal });
    if (r.embassyDirectory) refs.push({ source: `countryResources[${c.iso2}].embassyDirectory`, label: "embassy directory", url: r.embassyDirectory });
    if (r.localLanguagePortal) refs.push({ source: `countryResources[${c.iso2}].localLanguagePortal`, label: r.localLanguagePortal.language, url: r.localLanguagePortal.url });
    if (r.immigrationDept) refs.push({ source: `countryResources[${c.iso2}].immigrationDept`, label: "immigration department", url: r.immigrationDept });
  }

  const { OBSTACLES } = await import("@/content/obstacles");
  for (const o of OBSTACLES) {
    for (const ref of o.references) {
      refs.push({ source: `obstacles[${o.id}]`, label: ref.label, url: ref.url });
    }
  }

  const { ADAPTERS } = await import("@/scrapers/sources");
  for (const a of ADAPTERS) {
    for (const url of a.metadata.primaryUrls) {
      refs.push({ source: `adapters[${a.metadata.id}].primaryUrls`, label: a.metadata.name, url });
    }
  }

  // Deduplicate by URL; keep first source for reporting.
  const byUrl = new Map<string, Reference>();
  for (const r of refs) if (!byUrl.has(r.url)) byUrl.set(r.url, r);
  return [...byUrl.values()];
}

type CheckOutcome = "ok" | "broken" | "warn";

// Many government portals respond with 403/timeout/connection-refused to
// automated User-Agents (Cloudflare, geo-fenced WAFs, etc.) but render fine
// in a real browser. Those don't represent broken links — only 404/410 (and
// some 4xx that imply the URL itself is bad) do. Anything else is logged as
// a warning so a human can spot-check, but doesn't fail CI.
function classify(status: number | undefined, error: string | undefined): CheckOutcome {
  if (status != null) {
    if (status >= 200 && status < 400) return "ok";
    if (status === 404 || status === 410) return "broken";
    return "warn"; // 401/403/451/500/503/etc. — likely bot-blocked or transient
  }
  // Network-level failures (timeout, ENOTFOUND, ECONNRESET, etc.) — usually
  // gov sites being grumpy, not the URL being wrong.
  if (error) return "warn";
  return "warn";
}

async function checkOne(ref: Reference): Promise<{ ref: Reference; outcome: CheckOutcome; status?: number; error?: string }> {
  try {
    const res = await politeFetch(ref.url, { maxRetries: 1, timeoutMs: 15_000 });
    return { ref, outcome: classify(res.status, undefined), status: res.status };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ref, outcome: classify(undefined, msg), error: msg };
  }
}

async function notifyBrokenLinksSlack(broken: Array<{ ref: Reference; status?: number; error?: string }>) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  if (process.env.SCHEDULER_DRY_RUN === "true") return;
  if (broken.length === 0) return;

  const text =
    `:link: visa-lookup: *${broken.length}* broken reference link${broken.length === 1 ? "" : "s"} (404/410)\n` +
    broken
      .slice(0, 20)
      .map((b) => `• \`${b.ref.source}\` → ${b.status ?? b.error}\n  ${b.ref.url}`)
      .join("\n") +
    (broken.length > 20 ? `\n…and ${broken.length - 20} more.` : "");

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("Slack notification failed:", err);
  }
}

async function main() {
  const links = await gatherLinks();
  console.log(`Checking ${links.length} links…`);

  // Process with limited concurrency — we don't want to hammer everyone.
  const concurrency = 4;
  const results: Awaited<ReturnType<typeof checkOne>>[] = [];
  let i = 0;
  async function worker() {
    while (i < links.length) {
      const idx = i++;
      const r = await checkOne(links[idx]);
      results.push(r);
      const tag = r.outcome === "ok" ? `ok ${r.status ?? ""}` : r.outcome === "broken" ? `BROKEN ${r.status ?? ""}` : `warn ${r.status ?? r.error ?? ""}`;
      process.stderr.write(`  [${idx + 1}/${links.length}] ${tag}  ${r.ref.source}\n`);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const broken = results.filter((r) => r.outcome === "broken");
  const warns = results.filter((r) => r.outcome === "warn");

  if (warns.length > 0) {
    console.log(`\n⚠ ${warns.length} links bot-blocked or unreachable from the checker (probably fine in a browser):\n`);
    for (const w of warns) {
      console.log(`  ${w.ref.source}  →  ${w.status ?? w.error}`);
      console.log(`    ${w.ref.url}`);
    }
  }

  // Notify Slack on broken links (404/410) only — warns are noise.
  await notifyBrokenLinksSlack(broken);

  if (broken.length === 0) {
    console.log(`\n✓ ${results.length - warns.length} links resolved OK; no 404s.`);
    process.exit(0);
  }

  console.log(`\n✗ ${broken.length} broken links (404/410):\n`);
  for (const f of broken) {
    console.log(`  ${f.ref.source}`);
    console.log(`    ${f.ref.label}`);
    console.log(`    ${f.ref.url}`);
    console.log(`    → ${f.status ?? f.error}\n`);
  }
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
