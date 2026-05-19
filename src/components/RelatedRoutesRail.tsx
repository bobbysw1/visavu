/**
 * Cross-pair internal-link rail.
 *
 * Previous version showed two columns — "same passport → other destinations"
 * AND "other passports → same destination". User feedback: the second column
 * is irrelevant (a Japanese visitor doesn't care where Spanish people go),
 * so we dropped it. Now we surface two columns that ARE relevant to a reader
 * who landed here:
 *
 *   1. Same passport going to OTHER popular destinations (e.g. JP → US, JP → AU, JP → SG…)
 *   2. Same passport + same destination, OTHER purposes (e.g. JP → IN tourism, work, study, family)
 *
 * Both columns keep PageRank flowing through the deep ~600k URL graph, which
 * is the SEO rationale for having a related-routes rail at all.
 */
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { TOP_DESTINATIONS, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { PURPOSE_LABEL, type Purpose, ALL_PURPOSES } from "@/lib/types";
import { routeHref } from "@/lib/routeHref";

const MAX_DESTINATIONS = 12;

const PURPOSE_EMOJI: Record<Purpose, string> = {
  tourism: "🏖",
  business: "💼",
  transit: "✈️",
  work: "🔧",
  study: "🎓",
  family: "❤️",
  diplomatic: "🛂",
};

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

  // Same passport, other popular destinations — drop the current destination
  // and the passport itself (X → X is meaningless).
  const otherDestinations = TOP_DESTINATIONS.filter(
    (iso) => iso !== upperD && iso !== upperP,
  ).slice(0, MAX_DESTINATIONS);

  // Same passport + same destination, other purposes.
  const otherPurposes = ALL_PURPOSES.filter((p) => p !== purpose);

  if (otherDestinations.length === 0 && otherPurposes.length === 0) return null;

  const passportAdj = nationalityFor(upperP);
  const destName = nameFor(upperD);

  return (
    <section
      aria-label="Related routes"
      className="mt-10 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-elev)] overflow-hidden"
    >
      <header className="px-5 sm:px-6 pt-5 pb-3 border-b border-[var(--color-rule)]">
        <p className="kicker">More for {passportAdj} travellers</p>
        <h2 className="serif-display text-xl sm:text-2xl font-medium text-[var(--color-ink)] mt-1">
          Other places to go and other reasons to go to {destName}.
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--color-rule)]">
        {/* Column 1 — same passport, other destinations */}
        {otherDestinations.length > 0 && (
          <div className="bg-[var(--color-paper-elev)] px-5 sm:px-6 py-4">
            <p className="text-sm font-semibold text-[var(--color-ink)] mb-3">
              {passportAdj} travellers going to…
            </p>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {otherDestinations.map((iso) => (
                <li key={iso}>
                  <Link
                    href={routeHref(lowerP, iso.toLowerCase(), purpose)}
                    prefetch={false}
                    className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:underline underline-offset-2"
                  >
                    <Flag iso2={iso} size={16} />
                    <span className="truncate">{nameFor(iso)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Column 2 — same pair, other purposes */}
        {otherPurposes.length > 0 && (
          <div className="bg-[var(--color-paper-elev)] px-5 sm:px-6 py-4">
            <p className="text-sm font-semibold text-[var(--color-ink)] mb-3">
              Other reasons {passportAdj} travellers go to {destName}…
            </p>
            <ul className="space-y-1.5">
              {otherPurposes.map((p) => (
                <li key={p}>
                  <Link
                    href={routeHref(lowerP, upperD.toLowerCase(), p)}
                    prefetch={false}
                    className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:underline underline-offset-2"
                  >
                    <span aria-hidden className="text-base leading-none">{PURPOSE_EMOJI[p]}</span>
                    <span>{PURPOSE_LABEL[p]}</span>
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
