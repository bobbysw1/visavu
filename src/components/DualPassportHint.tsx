/**
 * Dual-passport hint — for travellers with multiple nationalities.
 *
 * On any (passport, destination) result where the realism is uncertain or
 * unlikely, we surface the top passports that DO get visa-free tourism access
 * to the same destination. Many travellers don't think to use their second
 * passport because they instinctively associate "themselves" with their
 * primary nationality.
 *
 * This is async because it queries the DB; the parent passes the precomputed
 * easier-passport list.
 */
import Link from "next/link";
import { nameFor, flagEmoji } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import type { EasyPassport } from "@/lib/coverage";

const STATUS_LABEL: Record<string, string> = {
  visa_free: "Visa-free",
  visa_free_with_eta: "Visa-free + eTA",
  visa_on_arrival: "Visa on arrival",
};

export function DualPassportHint({
  destinationIso2,
  options,
}: {
  destinationIso2: string;
  options: EasyPassport[];
}) {
  if (options.length === 0) return null;

  return (
    <aside className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 mb-6">
      <p className="font-semibold text-sm mb-1">
        Hold dual citizenship? Your other passport may have an easier route.
      </p>
      <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
        These nationalities enter {nameFor(destinationIso2)} without a visa for tourism. If you
        also hold one, travel on that passport instead.
      </p>
      <ul className="flex flex-wrap gap-2">
        {options.map((o) => (
          <li key={o.iso2}>
            <Link
              href={`/${o.iso2.toLowerCase()}/${destinationIso2.toLowerCase()}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition text-xs"
              title={`${nationalityFor(o.iso2)} passport: ${STATUS_LABEL[o.status] ?? o.status}${o.maxStayDays ? ` (${o.maxStayDays} days)` : ""}`}
            >
              <span aria-hidden>{flagEmoji(o.iso2)}</span>
              <span className="font-medium">{nationalityFor(o.iso2)}</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                · {STATUS_LABEL[o.status] ?? o.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
        We do not advise breaking immigration rules — always enter on the passport you used to
        apply. This is for travellers who legitimately hold two passports and can choose which to
        use.
      </p>
    </aside>
  );
}

