"use server";

/**
 * Server actions for the "Watch this route" button on /[passport]/[destination].
 * Kept in their own file so the route page can stay cleanly server-component.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  currentUser,
  addWatchlistSubscription,
  removeWatchlistSubscription,
} from "@/lib/auth";
// Watch actions touch only watchlistSubscriptions (user write table).
// userDb routes to managed Postgres when DATABASE_URL is set so writes
// persist across serverless instance recycles.
import { userDb as db, schema } from "@/db/client";
import { and, eq } from "drizzle-orm";
import { isValidPurpose, type Purpose } from "@/lib/types";

function readRoute(formData: FormData): { p: string; d: string; purpose: Purpose } {
  const p = String(formData.get("passportIso2") ?? "").toUpperCase();
  const d = String(formData.get("destinationIso2") ?? "").toUpperCase();
  const rawPurpose = String(formData.get("purpose") ?? "tourism");
  if (!isValidPurpose(rawPurpose)) throw new Error(`Invalid purpose: ${rawPurpose}`);
  return { p, d, purpose: rawPurpose };
}

export async function watchRouteAction(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) {
    redirect(`/signin?return=${encodeURIComponent("/account")}`);
  }
  const { p, d, purpose } = readRoute(formData);
  await addWatchlistSubscription(user.id, p, d, purpose);
  revalidatePath(`/${p.toLowerCase()}/${d.toLowerCase()}`);
}

export async function unwatchRouteAction(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) {
    redirect(`/signin?return=${encodeURIComponent("/account")}`);
  }
  const { p, d, purpose } = readRoute(formData);
  // Find the subscription row by composite key and call the deletion path.
  const rows = await db
    .select({ id: schema.watchlistSubscriptions.id })
    .from(schema.watchlistSubscriptions)
    .where(
      and(
        eq(schema.watchlistSubscriptions.userId, user.id),
        eq(schema.watchlistSubscriptions.passportIso2, p),
        eq(schema.watchlistSubscriptions.destinationIso2, d),
        eq(schema.watchlistSubscriptions.purpose, purpose),
      ),
    )
    .limit(1);
  if (rows.length > 0) {
    await removeWatchlistSubscription(user.id, rows[0].id);
  }
  revalidatePath(`/${p.toLowerCase()}/${d.toLowerCase()}`);
}
