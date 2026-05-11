/**
 * TEMPORARY debug endpoint — surfaces the actual error message + stack
 * trace when findDestinations() throws on Vercel. Remove after diagnosis.
 *
 *   GET /api/_debug-finder?passport=GB&goal=remote_work
 */
import { NextResponse } from "next/server";
import { findDestinations, type FinderGoal } from "@/lib/finder";

export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_GOALS: FinderGoal[] = [
  "visit",
  "remote_work",
  "work_temporary",
  "live_work",
  "study",
  "retire",
  "invest",
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const passport = (url.searchParams.get("passport") ?? "GB").toUpperCase();
  const goalParam = url.searchParams.get("goal") ?? "visit";
  const goal = (VALID_GOALS as string[]).includes(goalParam) ? (goalParam as FinderGoal) : "visit";

  const out: Record<string, unknown> = { passport, goal };

  try {
    const r = await findDestinations(passport, goal, { limit: 5 });
    out.success = true;
    out.resultCount = r.length;
    out.sample = r.slice(0, 2);
  } catch (e) {
    out.success = false;
    out.errorType = (e as object | null)?.constructor?.name ?? typeof e;
    out.errorJson = JSON.parse(JSON.stringify(e, Object.getOwnPropertyNames(e ?? {})));
    out.message = (e as Error)?.message ?? String(e);
    out.stack = (e as Error)?.stack?.split("\n").slice(0, 12);
  }

  return NextResponse.json(out, { status: 200 });
}
