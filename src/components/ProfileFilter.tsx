"use client";

/**
 * Profile filter pill row. Selected profile is mirrored to `?profile=...`
 * on the URL so the choice is shareable + survives page reloads + works
 * with browser back/forward navigation.
 *
 * The server component on the result page reads the same URL param to do
 * the actual sort/filter. This client component is purely the input.
 */
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { PROFILES, PROFILE_META, type Profile, isProfile } from "@/lib/profiles";

export function ProfileFilter({
  /** Optional pre-selected profile from the server. The component still
   *  reads the URL on the client to stay in sync after navigation. */
  initial,
}: {
  initial?: Profile | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const fromUrl = params.get("profile");
  const active: Profile | null = fromUrl && isProfile(fromUrl) ? fromUrl : initial ?? null;

  function set(next: Profile | null) {
    const sp = new URLSearchParams(params.toString());
    if (next) sp.set("profile", next);
    else sp.delete("profile");
    const qs = sp.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  return (
    <section
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 sm:p-5 mb-6"
      aria-label="Filter visa options by applicant profile"
    >
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm sm:text-base">Filter by your profile</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Pick the one that fits best — we&apos;ll surface visa routes designed for you and
            push tourist + irrelevant routes below.
          </p>
        </div>
        {active && (
          <button
            type="button"
            onClick={() => set(null)}
            className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 underline underline-offset-2"
          >
            Clear filter
          </button>
        )}
      </header>

      <div className="flex flex-wrap gap-2" role="group">
        {PROFILES.map((p) => {
          const meta = PROFILE_META[p];
          const on = active === p;
          return (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => set(on ? null : p)}
              title={meta.description}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition inline-flex items-center gap-1.5 ${
                on
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:border-blue-500"
                  : "bg-transparent text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              }`}
            >
              <span aria-hidden>{meta.emoji}</span>
              {meta.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
