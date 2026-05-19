import { NextResponse } from "next/server";
import { z } from "zod";
// User reports write to userReports table — route via userDb so reports
// persist across serverless instance recycles when DATABASE_URL is set.
import { userDb as db, schema } from "@/db/client";

const Body = z.object({
  visaOptionId: z.number().int().nullish(),
  passportIso2: z.string().length(2).nullish(),
  destinationIso2: z.string().length(2).nullish(),
  purpose: z.enum(["tourism", "business", "transit"]).nullish(),
  message: z.string().min(10).max(5000),
  citationUrl: z.string().url().nullish(),
  reporterEmail: z.string().email().nullish(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid", issues: parsed.error.issues }, { status: 400 });
  }
  const data = parsed.data;
  await db.insert(schema.userReports).values({
    visaOptionId: data.visaOptionId ?? null,
    passportIso2: data.passportIso2 ?? null,
    destinationIso2: data.destinationIso2 ?? null,
    purpose: data.purpose ?? null,
    message: data.message,
    citationUrl: data.citationUrl ?? null,
    reporterEmail: data.reporterEmail ?? null,
  });
  return NextResponse.json({ ok: true });
}
