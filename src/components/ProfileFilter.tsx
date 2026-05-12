"use client";

/**
 * Profile filter pill row. Selected profile is mirrored to `?profile=...`
 * on the URL so the choice is shareable + survives page reloads + works
 * with browser back/forward navigation.
 *
 * Also hydrates from localStorage: if the user previously completed the
 * /find-my-visa questionnaire we remembered their inferred profile, and
 * we auto-apply it on first page-view (unless the URL already has an
 * explicit `?profile=`). A small "From your saved details" indicator
 * makes it obvious that the filter is preselected — and links back to
 * the questionnaire so the user can update.
 *
 * The server component on the result page reads the same URL param to
 * do the actual sort/filter. This client component is purely the input.
 */
import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { PROFILES, PROFILE_META, type Profile, isProfile } from "@/lib/profiles";

const PROFILE_STORAGE_KEY = "visavu:saved-profile:v1";

type SavedProfile = {
  profile: Profile;
  passportIso2: string | null;
  savedAt: string;
};

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
  const [fromSaved, setFromSaved] = useState(false);

  const fromUrl = params.get("profile");
  const active: Profile | null = fromUrl && isProfile(fromUrl) ? fromUrl : initial ?? null;

  // Hydrate from localStorage on mount. If we have a saved profile AND the
  // URL doesn't already have an explicit `?profile=`, replace the URL with
  // the saved choice so the server-side sort kicks in on the next render.
  useEffect(() => {
    if (fromUrl) return; // user-set wins over saved
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as SavedProfile;
      if (!saved?.profile || !isProfile(saved.profile)) return;
      setFromSaved(true);
      const sp = new URLSearchParams(params.toString());
      sp.set("profile", saved.profile);
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(next: Profile | null) {
    setFromSaved(false);
    const sp = new URLSearchParams(params.toString());
    if (next) sp.set("profile", next);
    else sp.delete("profile");
    const qs = sp.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  function clearSaved() {
    try {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setFromSaved(false);
    set(null);
  }

  return (
    <section
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 sm:p-5 mb-6"
      aria-label="Filter visa options by applicant profile"
    >
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm sm:text-base">Sort for your profile</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Pick the option that fits best — we&apos;ll surface visa routes designed for you and
            push less-relevant ones below. Optional;{" "}
            <Link href="/find-my-visa" className="underline hover:no-underline">
              the full 12-field questionnaire
            </Link>{" "}
            tunes results even more.
          </p>
        </div>
        {active && (
          <button
            type="button"
            onClick={fromSaved ? clearSaved : () => set(null)}
            className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 underline underline-offset-2 shrink-0"
          >
            Clear filter
          </button>
        )}
      </header>

      {fromSaved && active && (
        <p className="mb-3 text-xs inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200">
          <span aria-hidden>✨</span>
          Auto-applied from your saved details ({PROFILE_META[active].label}).{" "}
          <Link href="/find-my-visa" className="underline font-semibold">
            Update
          </Link>
        </p>
      )}

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
