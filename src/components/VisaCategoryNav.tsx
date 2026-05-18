/**
 * Compact visa-type navigator. Used on passport / destination index pages
 * so users (and crawlers) can pivot between "tourist visa", "work visa",
 * "student visa", "partner visa", and "diplomatic visa" routes for the same
 * country pair.
 */
import Link from "next/link";
import {
  ALL_PURPOSES,
  PURPOSE_LABEL,
  PURPOSE_DESCRIPTION,
  type Purpose,
} from "@/lib/types";

type Mode = "passport" | "destination";

export function VisaCategoryNav({
  iso,
  partnerIso,
  mode,
  active,
}: {
  iso: string;
  partnerIso?: string;
  mode: Mode;
  active?: Purpose;
}) {
  const lower = iso.toLowerCase();
  const partnerLower = partnerIso?.toLowerCase();

  return (
    <nav aria-label="Visa types" className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-sm">
      {ALL_PURPOSES.map((p) => {
        // URL form depends on mode:
        //  - Pair (partnerIso set) → /[passport]/[destination]/[purpose] path
        //  - Passport mode, single → /passport/[iso]/purpose/[p] static page
        //  - Destination mode, single → /destination/[iso]?purpose=[p] (still uses query)
        const href = partnerLower
          ? mode === "passport"
            ? `/${lower}/${partnerLower}/${p}`
            : `/${partnerLower}/${lower}/${p}`
          : mode === "passport"
            ? `/passport/${lower}/purpose/${p}`
            : `/destination/${lower}?purpose=${p}`;
        const isActive = active === p;
        return (
          <Link
            key={p}
            href={href}
            className={`px-3 py-2 rounded-lg border transition ${
              isActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                : "border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600"
            }`}
            title={PURPOSE_DESCRIPTION[p]}
          >
            <span className={`truncate ${isActive ? "font-semibold text-blue-900 dark:text-blue-200" : ""}`}>
              {PURPOSE_LABEL[p]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
