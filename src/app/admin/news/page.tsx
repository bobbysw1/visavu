/**
 * Admin news-review dashboard.
 *
 * Lists every entry in manualPolicyNews.ts alongside its current
 * verification status (from src/data/news_verification.json,
 * populated by `npm run verify-news`). Lets you see at a glance
 * which items are credible and which need their source updated.
 *
 * Tier 2 (adapter-derived candidates queue) lands here as a second
 * section in the next commit.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { activePolicyNews, MANUAL_POLICY_NEWS } from "@/content/manualPolicyNews";
import { verificationFor, relativeVerificationTime } from "@/lib/newsVerification";
import { flagEmoji, nameFor } from "@/lib/countries";
import { userDb, schema } from "@/db/client";
import { approveCandidate, rejectCandidate } from "./actions";

export const metadata: Metadata = {
  title: "Admin · News review",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  verified:
    "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-900",
  broken_source:
    "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100 border-red-200 dark:border-red-900",
  unrelated_source:
    "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-900",
  no_source:
    "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700",
  unchecked:
    "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700",
};

const STATUS_LABEL: Record<string, string> = {
  verified: "✓ Verified",
  broken_source: "✗ Broken source",
  unrelated_source: "⚠ Source unrelated",
  no_source: "○ No source",
  unchecked: "? Unchecked",
};

type Candidate = {
  id: number;
  fingerprint: string;
  driftKind: string;
  destinationIso2: string | null;
  passportIso2: string | null;
  suggestedTitle: string;
  suggestedDetail: string;
  sourceUrl: string | null;
  driftPayload: unknown;
  status: "pending" | "approved" | "rejected";
  detectedAt: Date;
  reviewedAt: Date | null;
  reviewerNote: string | null;
};

async function loadPendingCandidates(): Promise<Candidate[]> {
  try {
    const rows = await userDb
      .select()
      .from(schema.newsCandidates)
      .where(eq(schema.newsCandidates.status, "pending"))
      .orderBy(desc(schema.newsCandidates.detectedAt))
      .limit(50);
    return rows as unknown as Candidate[];
  } catch {
    // Migration not yet run / DB unavailable — return empty.
    return [];
  }
}

/** Generate a paste-ready manualPolicyNews.ts snippet from a candidate. */
function generateSnippet(c: Candidate): string {
  const today = new Date().toISOString().slice(0, 10);
  const id = `${c.destinationIso2?.toLowerCase() ?? "global"}-${c.driftKind}-${today}`;
  return `  {
    id: "${id}",
    date: "${today}",
    kind: "${c.driftKind === "fee_delta" ? "fee_change" : "rule_change"}",
    destinationIso2: ${c.destinationIso2 ? `"${c.destinationIso2}"` : "null"},
    destinationName: ${c.destinationIso2 ? `"${nameFor(c.destinationIso2)}"` : "null"},
    title: ${JSON.stringify(c.suggestedTitle)},
    detail: ${JSON.stringify(c.suggestedDetail)},
    sourceUrl: ${c.sourceUrl ? JSON.stringify(c.sourceUrl) : "undefined"},
    urgency: "normal",
  },`;
}

export default async function AdminNewsPage() {
  const live = activePolicyNews();
  const candidates = await loadPendingCandidates();
  const expired = MANUAL_POLICY_NEWS.filter(
    (n) => n.expiresAt && n.expiresAt < new Date().toISOString().slice(0, 10),
  );

  const verifications = live.map((n) => ({ news: n, verification: verificationFor(n.id) }));
  const counts = {
    verified: verifications.filter((v) => v.verification.status === "verified").length,
    needsReview: verifications.filter(
      (v) =>
        v.verification.status === "broken_source" ||
        v.verification.status === "unrelated_source",
    ).length,
    unchecked: verifications.filter(
      (v) => v.verification.status === "unchecked" || v.verification.status === "no_source",
    ).length,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-bold">News review</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Hand-curated visa-policy news from{" "}
            <code className="text-xs">src/content/manualPolicyNews.ts</code>. Verification
            status comes from{" "}
            <code className="text-xs">npm run verify-news</code> — run it nightly via the
            refresh cron or on-demand after adding entries.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-blue-700 dark:text-blue-300 underline hover:no-underline"
        >
          ← Admin index
        </Link>
      </header>

      {/* Counts strip */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <Stat label="Verified" value={counts.verified.toString()} tone="emerald" />
        <Stat label="Need review" value={counts.needsReview.toString()} tone="amber" />
        <Stat label="Unchecked" value={counts.unchecked.toString()} tone="neutral" />
      </div>

      {/* Tier 2 — auto-discovered candidates pending review.
          Populated by `npm run detect-news-candidates` (wired into
          nightly cron). Approval generates a paste-ready snippet
          for manualPolicyNews.ts. */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-baseline gap-2">
          Pending candidates ({candidates.length})
          <span className="text-xs font-normal text-neutral-500">
            auto-detected from adapter drift — review + paste into{" "}
            <code className="text-[10px]">manualPolicyNews.ts</code>
          </span>
        </h2>
        {candidates.length === 0 ? (
          <p className="text-sm text-neutral-500 italic">
            No pending candidates. Run <code>npm run detect-news-candidates</code> after a
            nightly adapter refresh to populate the queue.
          </p>
        ) : (
          <ul className="space-y-4">
            {candidates.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <div className="flex items-baseline gap-2 min-w-0">
                    {c.destinationIso2 && (
                      <span className="text-lg leading-none" aria-hidden>
                        {flagEmoji(c.destinationIso2)}
                      </span>
                    )}
                    <h3 className="font-semibold">{c.suggestedTitle}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-1.5 py-0.5">
                      Auto-detected
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500">
                    detected {relativeVerificationTime(c.detectedAt.toISOString())}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                  {c.suggestedDetail}
                </p>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-xs mb-3">
                  <DL label="Drift kind" value={c.driftKind} />
                  <DL label="Fingerprint" value={<code className="text-[10px] break-all">{c.fingerprint}</code>} />
                  <DL label="Destination" value={c.destinationIso2 ?? "—"} />
                  <DL label="Passport" value={c.passportIso2 ?? "—"} />
                </dl>
                {c.sourceUrl && (
                  <p className="text-xs mb-3">
                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 dark:text-blue-300 underline hover:no-underline break-all"
                    >
                      Adapter source ↗
                    </a>
                  </p>
                )}
                <details className="mb-3 text-xs">
                  <summary className="cursor-pointer text-neutral-600 dark:text-neutral-400 font-medium">
                    Paste-ready manualPolicyNews.ts snippet
                  </summary>
                  <pre className="mt-2 p-3 rounded bg-neutral-100 dark:bg-neutral-900 overflow-x-auto text-[11px] leading-relaxed">
                    {generateSnippet(c)}
                  </pre>
                  <p className="mt-1 text-[10px] text-neutral-500">
                    Verify the source URL backs the specific claim, edit the wording,
                    paste into <code>src/content/manualPolicyNews.ts</code>, run
                    <code className="ml-1">npm run verify-news</code>, then commit.
                  </p>
                </details>
                <div className="flex gap-2">
                  <form action={approveCandidate}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold rounded-full bg-emerald-700 text-white px-3 py-1.5 hover:bg-emerald-800 transition"
                    >
                      ✓ Approve
                    </button>
                  </form>
                  <form action={rejectCandidate} className="flex gap-2 items-center">
                    <input type="hidden" name="id" value={c.id} />
                    <input
                      type="text"
                      name="note"
                      placeholder="Rejection note (optional)"
                      className="text-xs rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 bg-white dark:bg-neutral-950 w-64"
                    />
                    <button
                      type="submit"
                      className="text-xs font-semibold rounded-full bg-neutral-700 text-white px-3 py-1.5 hover:bg-neutral-800 transition"
                    >
                      ✗ Reject
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Active items ({live.length})</h2>
        {live.length === 0 ? (
          <p className="text-sm text-neutral-500 italic">
            No active items. Add entries to manualPolicyNews.ts.
          </p>
        ) : (
          <ul className="space-y-4">
            {verifications.map(({ news, verification }) => (
              <li
                key={news.id}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <div className="flex items-baseline gap-2 min-w-0">
                    {news.destinationIso2 && (
                      <span className="text-lg leading-none" aria-hidden>
                        {flagEmoji(news.destinationIso2)}
                      </span>
                    )}
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {news.title}
                    </h3>
                    {news.urgency === "high" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-red-100 dark:bg-red-950/50 text-red-900 dark:text-red-200 px-1.5 py-0.5">
                        High urgency
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider rounded border px-2 py-0.5 shrink-0 ${
                      STATUS_TONE[verification.status]
                    }`}
                  >
                    {STATUS_LABEL[verification.status]}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                  {news.detail}
                </p>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-xs">
                  <DL label="ID" value={<code className="text-[10px]">{news.id}</code>} />
                  <DL label="Destination" value={news.destinationIso2 ? `${news.destinationName ?? nameFor(news.destinationIso2)} (${news.destinationIso2})` : "—"} />
                  <DL label="Date" value={news.date + (news.effectiveDate ? ` → effective ${news.effectiveDate}` : "")} />
                  <DL label="Expires" value={news.expiresAt ?? "—"} />
                  <DL label="Kind" value={news.kind.replace(/_/g, " ")} />
                  <DL label="Last verified" value={relativeVerificationTime(verification.checkedAt)} />
                </dl>
                <div className="mt-3 flex flex-wrap items-baseline gap-3 text-xs">
                  {news.sourceUrl ? (
                    <a
                      href={news.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 dark:text-blue-300 underline hover:no-underline break-all"
                    >
                      Source ↗
                    </a>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400">No source URL</span>
                  )}
                  {verification.redirectTo && (
                    <span className="text-amber-700 dark:text-amber-400">
                      → redirected to {verification.redirectTo}
                    </span>
                  )}
                  {verification.httpCode && (
                    <span className="text-neutral-500">HTTP {verification.httpCode}</span>
                  )}
                </div>
                {verification.note && (
                  <p className="mt-2 text-xs text-amber-800 dark:text-amber-300 italic">
                    {verification.note}
                  </p>
                )}
                {verification.status === "verified" && verification.keywordsMatched.length > 0 && (
                  <p className="mt-2 text-[10px] text-neutral-500">
                    Keywords matched: {verification.keywordsMatched.join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {expired.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-neutral-500">
            Expired ({expired.length})
          </h2>
          <ul className="space-y-2 text-sm text-neutral-500">
            {expired.map((n) => (
              <li key={n.id}>
                {n.title} <span className="text-xs">(expired {n.expiresAt})</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "emerald" | "amber" | "neutral" }) {
  const toneClass = {
    emerald: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30",
    amber: "border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30",
    neutral: "border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/30",
  }[tone];
  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <p className="text-[11px] uppercase tracking-wide font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
        {label}
      </p>
      <p className="text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function DL({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-neutral-500 font-semibold">{label}</dt>
      <dd className="text-neutral-800 dark:text-neutral-200">{value}</dd>
    </div>
  );
}
