/**
 * Cross-pair internal-link rail.
 *
 * Surfaces ~20 related country-pair URLs from each result page:
 *  - same passport going to other popular destinations
 *  - same destination from other popular origin countries
 *
 * Why it matters: without internal links between deep pages, Google sees the
 * country-pair URLs only via sitemap and never assigns PageRank to them.
 * Adding a related-routes rail per page lets PageRank flow through the deep
 * ~600k-URL graph, which is the single biggest indexability lever for a
 * programmatic-SEO site.
 */
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { TOP_ORIGINS, TOP_DESTINATIONS, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { PURPOSE_LABEL, type Purpose } from "@/lib/types";

const MAX_PER_GROUP = 10;

export function RelatedRoutesRail({
  passportIso2,
  destinationIso2,
  purpose,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
}) {
  const upperP = passportIso2.toUpperCase();
  const upperD = destinationIso2.toUpperCase();
  const lowerP = passportIso2.toLowerCase();
  const lowerD = destinationIso2.toLowerCase();

  // "Same passport, other popular destinations" — drop the current destination
  // and the passport itself (X→X is meaningless).
  const otherDestinations = TOP_DESTINATIONS.filter(
    (iso) => iso !== upperD && iso !== upperP,
  ).slice(0, MAX_PER_GROUP);

  // "Other popular passports, same destination" — drop the current passport
  // and the destination itself.
  const otherOrigins = TOP_ORIGINS.filter(
    (iso) => iso !== upperP && iso !== upperD,
  ).slice(0, MAX_PER_GROUP);

  if (otherDestinations.length === 0 && otherOrigins.length === 0) return null;

  const passportAdj = nationalityFor(upperP);
  const destName = nameFor(upperD);
  const purposeLabel = PURPOSE_LABEL[purpose].toLowerCase();

  return (
    <section
      aria-label="Related routes"
      className="mt-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
    >
      <header className="px-5 sm:px-6 pt-5 pb-2">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400">
          Related routes
        </p>
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 mt-0.5">
          Compare other {purposeLabel}-visa routes
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-800">
        {otherDestinations.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 px-5 sm:px-6 py-4">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              {passportAdj} travellers going to…
            </p>
            <ul className="space-y-1.5">
              {otherDestinations.map((iso) => (
                <li key={iso}>
                  <Link
                    href={`/${lowerP}/${iso.toLowerCase()}/${purpose}`}
                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                  >
                    <Flag iso2={iso} size={16} />
                    <span>{nameFor(iso)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {otherOrigins.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 px-5 sm:px-6 py-4">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              Other passports going to {destName}…
            </p>
            <ul className="space-y-1.5">
              {otherOrigins.map((iso) => (
                <li key={iso}>
                  <Link
                    href={`/${iso.toLowerCase()}/${lowerD}/${purpose}`}
                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                  >
                    <Flag iso2={iso} size={16} />
                    <span>{nationalityFor(iso)} passport</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
