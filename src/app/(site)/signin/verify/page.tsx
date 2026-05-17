import { redirect } from "next/navigation";
import { consumeMagicLinkToken, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/signin?error=missing-token");

  const result = await consumeMagicLinkToken(token);
  if (!result.ok) {
    redirect(`/signin?error=${result.reason}`);
  }
  await setSessionCookie(result.userId);
  redirect("/account");
}
