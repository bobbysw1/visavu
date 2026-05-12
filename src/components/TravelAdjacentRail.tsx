/**
 * Travel-adjacent affiliate rail. Renders BELOW the RelocationServicesPanel
 * on every result page. Two cards: eSIM / flights — insurance lives in the
 * relocation panel above. Clearly labelled "Sponsored — separate from visa
 * info above."
 *
 * Strategy:
 *   - We never link affiliate visa-application services. That would
 *     compromise trust in the core product.
 *   - We do link adjacent travel services (eSIM, flights) where the user
 *     clearly benefits from a curated handful of options.
 *   - Every click fires a Plausible AffiliateClicked event so we can see
 *     what works and remove what doesn't.
 *   - See /disclosure for the full commercial relationship statement.
 */
import Link from "next/link";
import { nameFor } from "@/lib/countries";

type AffiliateCard = {
  partner: "airalo" | "kiwi";
  title: string;
  body: string;
  cta: string;
  url: (destinationIso: string) => string;
};

const CARDS: AffiliateCard[] = [
  {
    partner: "airalo",
    title: "eSIM data",
    body: "Pre-paid local data that works on arrival. No SIM swap, no roaming charges.",
    cta: "Browse eSIMs",
    url: (iso) => `https://airalo.com/?ref=visavu&utm_country=${iso}`,
  },
  {
    partner: "kiwi",
    title: "Flights",
    body: "Compare flexible flight options with full price transparency.",
    cta: "Search flights",
    url: (iso) => `https://kiwi.com/?ref=visavu&utm_country=${iso}`,
  },
];

export function TravelAdjacentRail({ destinationIso2 }: { destinationIso2: string }) {
  return (
    <section className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 font-semibold">
          Sponsored
        </p>
        <h3 className="font-semibold text-base mt-1 mb-1">
          While you&apos;re sorting your trip to {nameFor(destinationIso2)}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          We earn a small commission on bookings made via these links — it helps keep the visa
          tool free. The visa info above is independent of any partner.{" "}
          <Link href="/disclosure" className="underline hover:no-underline">Our commercial policy →</Link>
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CARDS.map((card) => (
          <a
            key={card.partner}
            href={card.url(destinationIso2)}
            target="_blank"
            rel="noreferrer noopener sponsored"
            className="plausible-event-name=AffiliateClicked block p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition"
            data-event-partner={card.partner}
            data-event-destination={destinationIso2}
          >
            <p className="font-semibold text-sm mb-1">{card.title}</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 leading-snug">
              {card.body}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">{card.cta} →</p>
          </a>
        ))}
      </div>
    </section>
  );
}
