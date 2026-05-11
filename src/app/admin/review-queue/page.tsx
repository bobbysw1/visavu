import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, isNull, lt, ne, or, sql } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { nameFor } from "@/lib/countries";
import { PURPOSE_LABEL, type Purpose, type VisaStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Admin · Review queue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Anything older than 180 days needs human re-verification regardless of the
// confidence-bucket field; surface here so reviewers can clear the backlog.
const STALE_DAYS = 180;

export default async function AdminReviewQueuePage() {
  let userReports: Awaited<ReturnType<typeof loadUserReports>> = [];
  let lowConfidence: Awaited<ReturnType<typeof loadLowConfidenceRecords>> = [];
  let staleVerified: Awaited<ReturnType<typeof loadStaleRecords>> = [];
  let error: string | null = null;
  try {
    [userReports, lowConfidence, staleVerified] = await Promise.all([
      loadUserReports(),
      loadLowConfidenceRecords(),
      loadStaleRecords(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-bold">Review queue</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            User-submitted corrections, low-confidence records, and entries that haven&apos;t been
            re-verified in {STALE_DAYS} days.
          </p>
        </div>
        <a
          href="/admin/sources"
          className="text-sm rounded border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          ← Source health
        </a>
      </header>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 p-4 text-sm mb-6">
          <p className="font-medium mb-1">Failed to load review queue.</p>
          <p className="text-xs text-neutral-700 dark:text-neutral-300">{error}</p>
        </div>
      )}

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">
          User reports{" "}
          <span className="text-sm font-normal text-neutral-500">({userReports.length})</span>
        </h2>
        {userReports.length === 0 ? (
          <p className="text-sm text-neutral-500">No open user reports.</p>
        ) : (
          <ul className="space-y-3">
            {userReports.map((r) => (
              <li
                key={r.id}
                className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium">
                    {r.passportIso2 && r.destinationIso2
                      ? `${nameFor(r.passportIso2)} → ${nameFor(r.destinationIso2)}`
                      : "Unspecified route"}
                    {r.purpose && (
                      <span className="text-neutral-500"> · {PURPOSE_LABEL[r.purpose as Purpose]}</span>
                    )}
                  </p>
                  <span className="text-xs text-neutral-500 font-mono">{r.status}</span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                  {r.message}
                </p>
                {r.citationUrl && (
                  <a
                    href={r.citationUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs text-blue-700 dark:text-blue-400 underline mt-1 inline-block"
                  >
                    Cited source
                  </a>
                )}
                <p className="text-xs text-neutral-500 mt-2">
                  Submitted {new Date(r.createdAt as Date).toLocaleString("en")}
                  {r.reporterEmail ? ` · ${r.reporterEmail}` : " · anonymous"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">
          Low confidence{" "}
          <span className="text-sm font-normal text-neutral-500">({lowConfidence.length})</span>
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          Records currently scored low or unverified. Highest priority for cross-source
          corroboration.
        </p>
        {lowConfidence.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing low-confidence right now.</p>
        ) : (
          <RouteList rows={lowConfidence} />
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">
          Stale (≥{STALE_DAYS} days){" "}
          <span className="text-sm font-normal text-neutral-500">({staleVerified.length})</span>
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          Records that haven&apos;t been re-verified in over {STALE_DAYS} days, regardless of
          their original confidence.
        </p>
        {staleVerified.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing stale.</p>
        ) : (
          <RouteList rows={staleVerified} />
        )}
      </section>
    </main>
  );
}

type ReviewRow = {
  id: number;
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
  status: VisaStatus;
  label: string;
  correctnessBucket: string | null;
  lastVerifiedAt: string | null;
};

function RouteList({ rows }: { rows: ReviewRow[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {rows.map((r) => (
        <li key={r.id}>
          <Link
            href={`/${r.passportIso2.toLowerCase()}/${r.destinationIso2.toLowerCase()}?purpose=${r.purpose}`}
            className="block p-3 rounded border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition text-sm"
          >
            <p className="font-medium">
              {nameFor(r.passportIso2)} → {nameFor(r.destinationIso2)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {PURPOSE_LABEL[r.purpose]} · {r.label}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Bucket: {r.correctnessBucket ?? "unverified"}
              {r.lastVerifiedAt && ` · last verified ${new Date(r.lastVerifiedAt).toLocaleDateString("en")}`}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function loadUserReports() {
  return db
    .select({
      id: schema.userReports.id,
      passportIso2: schema.userReports.passportIso2,
      destinationIso2: schema.userReports.destinationIso2,
      purpose: schema.userReports.purpose,
      message: schema.userReports.message,
      citationUrl: schema.userReports.citationUrl,
      reporterEmail: schema.userReports.reporterEmail,
      status: schema.userReports.status,
      createdAt: schema.userReports.createdAt,
    })
    .from(schema.userReports)
    .where(or(eq(schema.userReports.status, "new"), eq(schema.userReports.status, "triaged")))
    .orderBy(desc(schema.userReports.createdAt))
    .limit(100);
}

async function loadLowConfidenceRecords(): Promise<ReviewRow[]> {
  const rows = await db
    .select({
      id: schema.visaOptions.id,
      passportId: schema.visaOptions.passportId,
      destinationIso2: schema.visaOptions.destinationIso2,
      purpose: schema.visaOptions.purpose,
      status: schema.visaOptions.status,
      label: schema.visaOptions.label,
      correctnessBucket: schema.visaOptions.correctnessBucket,
      lastVerifiedAt: schema.visaOptions.lastVerifiedAt,
      issuerIso2: schema.passports.issuerIso2,
    })
    .from(schema.visaOptions)
    .innerJoin(schema.passports, eq(schema.passports.id, schema.visaOptions.passportId))
    .where(
      or(
        eq(schema.visaOptions.correctnessBucket, "low"),
        eq(schema.visaOptions.correctnessBucket, "unverified"),
      ),
    )
    .orderBy(desc(schema.visaOptions.lastVerifiedAt))
    .limit(40);

  return rows.map((r) => ({
    id: r.id,
    passportIso2: r.issuerIso2,
    destinationIso2: r.destinationIso2,
    purpose: r.purpose as Purpose,
    status: r.status as VisaStatus,
    label: r.label,
    correctnessBucket: r.correctnessBucket,
    lastVerifiedAt: r.lastVerifiedAt ? new Date(r.lastVerifiedAt as Date).toISOString() : null,
  }));
}

async function loadStaleRecords(): Promise<ReviewRow[]> {
  const cutoff = new Date(Date.now() - STALE_DAYS * 86_400_000);
  const rows = await db
    .select({
      id: schema.visaOptions.id,
      passportId: schema.visaOptions.passportId,
      destinationIso2: schema.visaOptions.destinationIso2,
      purpose: schema.visaOptions.purpose,
      status: schema.visaOptions.status,
      label: schema.visaOptions.label,
      correctnessBucket: schema.visaOptions.correctnessBucket,
      lastVerifiedAt: schema.visaOptions.lastVerifiedAt,
      issuerIso2: schema.passports.issuerIso2,
    })
    .from(schema.visaOptions)
    .innerJoin(schema.passports, eq(schema.passports.id, schema.visaOptions.passportId))
    .where(
      and(
        ne(schema.visaOptions.correctnessBucket, "unverified"),
        lt(schema.visaOptions.lastVerifiedAt, cutoff),
        // Don't flag records that have no verification date (they're surfaced
        // as "low/unverified" already).
        sql`${schema.visaOptions.lastVerifiedAt} IS NOT NULL`,
      ),
    )
    .orderBy(schema.visaOptions.lastVerifiedAt)
    .limit(40);

  return rows.map((r) => ({
    id: r.id,
    passportIso2: r.issuerIso2,
    destinationIso2: r.destinationIso2,
    purpose: r.purpose as Purpose,
    status: r.status as VisaStatus,
    label: r.label,
    correctnessBucket: r.correctnessBucket,
    lastVerifiedAt: r.lastVerifiedAt ? new Date(r.lastVerifiedAt as Date).toISOString() : null,
  }));
}
