import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { issueMagicLinkToken, currentUser } from "@/lib/auth";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in to Visavu",
  description:
    "Sign in with a passwordless email link. We send a one-time magic link to your inbox — no passwords, no third-party logins.",
  alternates: { canonical: absoluteUrl("/signin") },
};

async function signInAction(formData: FormData): Promise<void> {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return redirect("/signin?error=invalid-email");
  }
  const { signinUrl } = await issueMagicLinkToken(email);
  // Email delivery is plumbed but optional (P30 scaffold). When
  // RESEND_API_KEY (or POSTMARK_API_KEY) is set, send the magic link via
  // the configured provider. Until then, log to stdout for dev paste.
  if (process.env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Visavu <noreply@visavu.com>",
        to: email,
        subject: "Your Visavu sign-in link",
        text: `Click to sign in: ${signinUrl}\n\nThis link expires in 15 minutes.`,
      }),
    }).catch(() => undefined);
  } else if (process.env.NODE_ENV !== "production") {
    console.log(`[signin] dev magic link for ${email}: ${signinUrl}`);
  }
  return redirect("/signin?sent=1");
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;
  const user = await currentUser();
  if (user) redirect("/account");

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold mb-2">Sign in to Visavu</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
        Passwordless — we send a magic link to your inbox. No passwords, no
        social logins. We store only your email address.
      </p>

      {sent && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 mb-6 text-sm text-emerald-900 dark:text-emerald-100">
          Check your inbox — we sent you a sign-in link that expires in 15
          minutes.
        </div>
      )}
      {error === "invalid-email" && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/40 p-4 mb-6 text-sm text-red-900 dark:text-red-100">
          That doesn&apos;t look like a valid email address. Try again.
        </div>
      )}

      <form action={signInAction} className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Email address
          </span>
          <input
            name="email"
            type="email"
            required
            autoFocus
            className="mt-1 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          Send me a sign-in link
        </button>
      </form>

      <p className="mt-8 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
        By signing in you agree to our{" "}
        <Link href="/privacy" className="underline">privacy policy</Link>. We store
        only your email address. Account deletion is one click in /account and wipes
        all your data in a single transaction.
      </p>
    </main>
  );
}
