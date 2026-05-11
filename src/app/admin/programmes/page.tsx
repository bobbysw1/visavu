import type { Metadata } from "next";
import { db, schema } from "@/db/client";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Admin · Programme kill-switches",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type ProgrammeRow = {
  label: string;
  recordCount: number;
  programmeStatus: string | null;
  programmeStatusNote: string | null;
  exampleId: number;
};

async function loadProgrammes(): Promise<ProgrammeRow[]> {
  const result = await db.execute<{
    label: string;
    record_count: string;
    programme_status: string | null;
    programme_status_note: string | null;
    example_id: number;
  }>(sql`
    SELECT
      label,
      COUNT(*)::int AS record_count,
      MAX(programme_status) AS programme_status,
      MAX(programme_status_note) AS programme_status_note,
      MIN(id) AS example_id
    FROM visa_options
    GROUP BY label
    ORDER BY record_count DESC
    LIMIT 200
  `);
  type Raw = {
    label: string;
    record_count: string;
    programme_status: string | null;
    programme_status_note: string | null;
    example_id: number;
  };
  const rows = (result as unknown as { rows?: Raw[] }).rows ?? (result as unknown as Raw[]);
  return (rows as Raw[]).map((r) => ({
    label: r.label,
    recordCount: Number(r.record_count) || 0,
    programmeStatus: r.programme_status,
    programmeStatusNote: r.programme_status_note,
    exampleId: r.example_id,
  }));
}

async function setProgrammeStatus(formData: FormData) {
  "use server";
  const label = String(formData.get("label") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!label) return;

  const validStatus = ["active", "paused", "wound_down", "unverified"].includes(status) ? status : null;
  await db
    .update(schema.visaOptions)
    .set({
      programmeStatus: validStatus === "active" ? null : validStatus,
      programmeStatusNote: validStatus === "active" ? null : note,
    })
    .where(eq(schema.visaOptions.label, label));

  revalidatePath("/admin/programmes");
}

const STATUS_TONE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  paused: "bg-red-50 text-red-900 dark:bg-red-900/40 dark:text-red-200",
  wound_down: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 line-through",
  unverified: "bg-amber-50 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
};

export default async function AdminProgrammesPage() {
  const programmes = await loadProgrammes();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Admin · Programme kill-switches</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          When a programme is paused, wound down, or politically uncertain, set its status here.
          The Apply CTA on the result card disables and a red banner is shown to users.
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Status applies to ALL records sharing the label. Showing top 200 programmes by record count.
        </p>
      </header>

      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
          <tr>
            <th className="text-left py-2 pr-3">Programme label</th>
            <th className="text-right py-2 pr-3">Records</th>
            <th className="text-left py-2 pr-3">Current</th>
            <th className="text-left py-2">Set status</th>
          </tr>
        </thead>
        <tbody>
          {programmes.map((p) => {
            const current = p.programmeStatus ?? "active";
            return (
              <tr key={p.label} className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="py-2 pr-3 font-medium">{p.label}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-neutral-600">{p.recordCount.toLocaleString("en")}</td>
                <td className="py-2 pr-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${STATUS_TONE[current] ?? ""}`}>
                    {current}
                  </span>
                  {p.programmeStatusNote && (
                    <p className="text-xs text-neutral-500 mt-1 max-w-xs truncate" title={p.programmeStatusNote}>
                      {p.programmeStatusNote}
                    </p>
                  )}
                </td>
                <td className="py-2">
                  <form action={setProgrammeStatus} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="label" value={p.label} />
                    <select
                      name="status"
                      defaultValue={current}
                      className="text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                    >
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="wound_down">wound_down</option>
                      <option value="unverified">unverified</option>
                    </select>
                    <input
                      type="text"
                      name="note"
                      placeholder="Note (shown to users)"
                      defaultValue={p.programmeStatusNote ?? ""}
                      className="text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 flex-1 min-w-[200px]"
                    />
                    <button
                      type="submit"
                      className="text-xs rounded bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 font-medium"
                    >
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
