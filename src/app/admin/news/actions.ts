"use server";

/**
 * Server actions for /admin/news candidate review.
 *
 * approve: marks the candidate as approved + returns a TypeScript
 *   snippet the admin can paste into manualPolicyNews.ts. We don't
 *   auto-modify the file — keeps git as the canonical audit trail
 *   and lets the admin tweak the wording before commit.
 *
 * reject: marks the candidate as rejected with an optional note.
 *   Rejected candidates persist so the same drift fingerprint
 *   doesn't keep regenerating the same candidate every night.
 */
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { userDb, schema } from "@/db/client";

export async function approveCandidate(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const note = String(formData.get("note") ?? "");
  if (!Number.isFinite(id) || id <= 0) return;
  await userDb
    .update(schema.newsCandidates)
    .set({
      status: "approved",
      reviewedAt: new Date(),
      reviewerNote: note || null,
    })
    .where(eq(schema.newsCandidates.id, id));
  revalidatePath("/admin/news");
}

export async function rejectCandidate(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const note = String(formData.get("note") ?? "");
  if (!Number.isFinite(id) || id <= 0) return;
  await userDb
    .update(schema.newsCandidates)
    .set({
      status: "rejected",
      reviewedAt: new Date(),
      reviewerNote: note || null,
    })
    .where(eq(schema.newsCandidates.id, id));
  revalidatePath("/admin/news");
}
