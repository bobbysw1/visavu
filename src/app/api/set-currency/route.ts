/**
 * Sets the `vl_currency` cookie so the user's fee localisation persists
 * across navigation. Called by the header currency switcher.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSupportedCurrency } from "@/lib/userCurrency";

export async function POST(req: Request) {
  const form = await req.formData();
  const currency = String(form.get("currency") ?? "").toUpperCase();
  const next = String(form.get("next") ?? "/");
  if (!isSupportedCurrency(currency)) {
    return NextResponse.redirect(new URL(next, req.url));
  }
  const jar = await cookies();
  jar.set({
    name: "vl_currency",
    value: currency,
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  return NextResponse.redirect(new URL(next, req.url));
}
