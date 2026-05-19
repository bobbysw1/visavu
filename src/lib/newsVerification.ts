/**
 * Read helpers around src/data/news_verification.json.
 *
 * The verifyNews.ts script writes that file nightly (and on demand).
 * The toast, carousel, and /admin/news page import these helpers to
 * show users + admins exactly how recently each news item's primary
 * source was confirmed accessible + on-topic.
 */
import verificationData from "@/data/news_verification.json";

export type NewsVerificationStatus =
  | "verified"
  | "broken_source"
  | "unrelated_source"
  | "no_source"
  | "unchecked";

export type NewsVerification = {
  id: string;
  sourceUrl: string;
  checkedAt: string;
  status: NewsVerificationStatus;
  httpCode: number | null;
  redirectTo?: string;
  keywordsExpected: string[];
  keywordsMatched: string[];
  note?: string;
};

type Payload = {
  generatedAt: string;
  items: Record<string, Omit<NewsVerification, "status"> & { status: string }>;
};

/** Look up the verification record for a news item id. Returns an
 *  "unchecked" stub when there's no record — the UI uses this to
 *  render a "verification pending" badge rather than implying the
 *  item was checked. */
export function verificationFor(id: string): NewsVerification {
  const payload = verificationData as Payload;
  const raw = payload.items[id];
  if (!raw) {
    return {
      id,
      sourceUrl: "",
      checkedAt: payload.generatedAt,
      status: "unchecked",
      httpCode: null,
      keywordsExpected: [],
      keywordsMatched: [],
    };
  }
  return {
    ...raw,
    status: normaliseStatus(raw.status),
  };
}

function normaliseStatus(s: string): NewsVerificationStatus {
  if (s === "verified" || s === "broken_source" || s === "unrelated_source" || s === "no_source") {
    return s;
  }
  return "unchecked";
}

/** Render a human-friendly relative-time string for "Verified Xs/m/h/d ago".
 *  Returns "—" if we have no datetime. */
export function relativeVerificationTime(iso: string): string {
  if (!iso || iso.startsWith("1970-")) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86_400)}d ago`;
}
