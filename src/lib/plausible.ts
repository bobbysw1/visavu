/**
 * Plausible Analytics API client.
 *
 * Pulls top-page / referrer / event stats from a self-hosted or
 * Plausible.io site using the v1 Stats API. Helps the /admin/analytics
 * dashboard answer:
 *
 *   - Which passport pages get the most traffic?
 *   - Which chat questions get asked most?
 *   - Which "Apply on official site" CTAs convert?
 *   - Which destinations do users land on that we have ZERO coverage for?
 *
 * Auth: set PLAUSIBLE_API_KEY in env (Plausible dashboard → Settings →
 * API keys). Optionally PLAUSIBLE_SITE_ID (defaults to "visavu.com")
 * and PLAUSIBLE_BASE_URL (defaults to "https://plausible.io" — set to
 * your self-hosted URL if needed).
 *
 * Failure modes: missing key → returns { configured: false, ... }
 * stubs so the admin page renders a useful "set the key" message
 * rather than 500ing.
 */

const PLAUSIBLE_BASE_URL =
  process.env.PLAUSIBLE_BASE_URL ?? "https://plausible.io";
const PLAUSIBLE_SITE_ID = process.env.PLAUSIBLE_SITE_ID ?? "visavu.com";

export function isPlausibleConfigured(): boolean {
  return !!process.env.PLAUSIBLE_API_KEY;
}

type AggregateResponse = {
  results: {
    visitors?: { value: number };
    pageviews?: { value: number };
    bounce_rate?: { value: number };
    visit_duration?: { value: number };
  };
};

type BreakdownResponse = {
  results: Array<Record<string, string | number>>;
};

/** Internal — wraps the Plausible v1 API call with auth + error handling. */
async function call<T>(
  path: string,
  params: Record<string, string>,
): Promise<T | null> {
  const apiKey = process.env.PLAUSIBLE_API_KEY;
  if (!apiKey) return null;
  const qs = new URLSearchParams({ site_id: PLAUSIBLE_SITE_ID, ...params });
  const res = await fetch(`${PLAUSIBLE_BASE_URL}/api/v1/stats/${path}?${qs}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    // Plausible API responses are point-in-time aggregates that change
    // continuously — don't cache.
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

/** Total visitors / pageviews over a window. */
export async function aggregate(period: "day" | "7d" | "30d" = "30d"): Promise<{
  visitors: number;
  pageviews: number;
  bounceRate: number | null;
  avgDurationSeconds: number | null;
} | null> {
  const r = await call<AggregateResponse>("aggregate", {
    period,
    metrics: "visitors,pageviews,bounce_rate,visit_duration",
  });
  if (!r) return null;
  return {
    visitors: r.results.visitors?.value ?? 0,
    pageviews: r.results.pageviews?.value ?? 0,
    bounceRate: r.results.bounce_rate?.value ?? null,
    avgDurationSeconds: r.results.visit_duration?.value ?? null,
  };
}

/** Top pages by pageviews. */
export async function topPages(
  period: "day" | "7d" | "30d" = "30d",
  limit = 20,
): Promise<Array<{ page: string; visitors: number; pageviews: number }> | null> {
  const r = await call<BreakdownResponse>("breakdown", {
    period,
    property: "event:page",
    metrics: "visitors,pageviews",
    limit: String(limit),
  });
  if (!r) return null;
  return r.results.map((row) => ({
    page: String(row.page),
    visitors: Number(row.visitors ?? 0),
    pageviews: Number(row.pageviews ?? 0),
  }));
}

/** Top external referrers. */
export async function topReferrers(
  period: "day" | "7d" | "30d" = "30d",
  limit = 10,
): Promise<Array<{ source: string; visitors: number }> | null> {
  const r = await call<BreakdownResponse>("breakdown", {
    period,
    property: "visit:source",
    metrics: "visitors",
    limit: String(limit),
  });
  if (!r) return null;
  return r.results.map((row) => ({
    source: String(row.source),
    visitors: Number(row.visitors ?? 0),
  }));
}

/** Top countries the visitors come FROM (per their IP geo). */
export async function topVisitorCountries(
  period: "day" | "7d" | "30d" = "30d",
  limit = 10,
): Promise<Array<{ country: string; visitors: number }> | null> {
  const r = await call<BreakdownResponse>("breakdown", {
    period,
    property: "visit:country",
    metrics: "visitors",
    limit: String(limit),
  });
  if (!r) return null;
  return r.results.map((row) => ({
    country: String(row.country),
    visitors: Number(row.visitors ?? 0),
  }));
}

/** Custom-event breakdown. Plausible captures events via
 *  data-event-name attributes on links + plausible() JS calls. We use
 *  this for ApplyClicked + ChatQuery + ServiceClicked. */
export async function topEvents(
  eventName: string,
  period: "day" | "7d" | "30d" = "30d",
  limit = 20,
): Promise<Array<{ event: string; props: Record<string, string>; visitors: number }> | null> {
  const r = await call<BreakdownResponse>("breakdown", {
    period,
    property: "event:name",
    metrics: "visitors",
    filters: `event:name==${eventName}`,
    limit: String(limit),
  });
  if (!r) return null;
  return r.results.map((row) => ({
    event: String(row.name ?? eventName),
    props: Object.fromEntries(
      Object.entries(row)
        .filter(([k]) => k !== "visitors" && k !== "name")
        .map(([k, v]) => [k, String(v)]),
    ),
    visitors: Number(row.visitors ?? 0),
  }));
}
