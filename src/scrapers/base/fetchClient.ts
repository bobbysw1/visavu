/**
 * HTTP client for adapters. Adds:
 *
 *   - 30s timeout (configurable) via AbortSignal.timeout.
 *   - Retries with exponential backoff on network errors and 5xx.
 *   - 429 handling with Retry-After header honored when present.
 *   - Per-host rate limiting (min interval between requests to the same host),
 *     so multiple adapters running in the same process don't hammer one site.
 *   - Realistic Chrome User-Agent (some gov sites serve bot pages otherwise).
 *
 * Adapters call `politeFetch(url, options?)` instead of raw `fetch`.
 */

const DEFAULT_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 3;
const PER_HOST_MIN_INTERVAL_MS = 1_500;

const lastRequestAt = new Map<string, number>();

export type PoliteFetchOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  // Adapter-specific bypass: if set, ignore the per-host rate limit (used by
  // single-shot smoke tests).
  ignoreRateLimit?: boolean;
  // Set to false to skip retries on 5xx (rare; e.g. for fail-fast smoke tests).
  retryOnServerError?: boolean;
  headers?: Record<string, string>;
};

async function rateLimit(host: string) {
  const last = lastRequestAt.get(host);
  if (last == null) return;
  const elapsed = Date.now() - last;
  if (elapsed < PER_HOST_MIN_INTERVAL_MS) {
    await sleep(PER_HOST_MIN_INTERVAL_MS - elapsed);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number) {
  // 1s, 2s, 4s with ±20% jitter.
  const base = 1000 * 2 ** attempt;
  const jitter = base * (Math.random() * 0.4 - 0.2);
  return Math.round(base + jitter);
}

export async function politeFetch(
  url: string,
  opts: PoliteFetchOptions = {},
): Promise<Response> {
  const u = new URL(url);
  const host = u.host;
  const maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;
  const retryOn5xx = opts.retryOnServerError ?? true;
  const headers: Record<string, string> = {
    "User-Agent": DEFAULT_UA,
    Accept: "text/html,application/xhtml+xml,application/json",
    "Accept-Language": "en-US,en;q=0.9",
    ...opts.headers,
  };

  let attempt = 0;
  let lastErr: unknown = null;

  while (attempt <= maxRetries) {
    if (!opts.ignoreRateLimit) await rateLimit(host);
    lastRequestAt.set(host, Date.now());

    try {
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      });

      if (res.status === 429) {
        // Rate limited — honor Retry-After when sensible, else backoff.
        const retryAfter = res.headers.get("retry-after");
        const waitMs = retryAfter && /^\d+$/.test(retryAfter)
          ? parseInt(retryAfter, 10) * 1000
          : backoffMs(attempt);
        if (attempt < maxRetries) {
          await sleep(Math.min(waitMs, 60_000));
          attempt += 1;
          continue;
        }
        return res;
      }

      if (res.status >= 500 && retryOn5xx && attempt < maxRetries) {
        await sleep(backoffMs(attempt));
        attempt += 1;
        continue;
      }

      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) {
        await sleep(backoffMs(attempt));
        attempt += 1;
        continue;
      }
      throw err;
    }
  }

  throw lastErr ?? new Error("politeFetch exhausted retries with no response");
}
