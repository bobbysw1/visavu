/**
 * Right-rail sidebar for /passport/[iso] — passport cover, mobility ranking,
 * country fact block, "good" vs "restricted" relationships, and a stamped
 * top-5 destinations list.
 *
 * Inspired by pickasurgeon.com's split-page layout — main editorial column
 * on the left, persistent narrow info-rail on the right.
 */
import Link from "next/link";
import { Globe2, MapPin, Users, Banknote, Languages, Phone, ScrollText, TrendingUp, AlertCircle, Plane } from "lucide-react";
import { PassportPresenceCard } from "./PassportPresenceCard";
import { CountrySilhouette } from "./CountrySilhouette";
import { Flag } from "./Flag";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { factsFor, formatPopulation, formatGdp } from "@/content/countryFacts";
import { resourcesFor } from "@/content/countryResources";
import { currencyForCountry } from "@/lib/currencyByCountry";
import { COUNTRY_LANGUAGE } from "@/lib/countryLanguages";
import type { CoverageSnapshot } from "@/lib/coverage";

type DestSummary = {
  destinationIso2: string;
  status: string;
  label: string;
};

export function PassportSidebar({
  iso2,
  coverage,
  summaries,
}: {
  iso2: string;
  coverage: CoverageSnapshot | null;
  summaries: DestSummary[];
}) {
  const upper = iso2.toUpperCase();
  const facts = factsFor(upper);
  const currency = currencyForCountry(upper);
  const resources = resourcesFor(upper);
  const name = nameFor(upper);
  const adjective = nationalityFor(upper);

  const languageNames =
    facts?.languages
      .map((code) => {
        const match = Object.values(COUNTRY_LANGUAGE).find((l) => l.bcp47 === code);
        return match?.nativeName ?? code.toUpperCase();
      })
      .join(" · ") ?? null;

  // Mobility score: count of visa-free + visa-free-with-eTA destinations.
  // Out of ~200 destinations worldwide that we cover.
  const mobilityScore = coverage
    ? coverage.byStatus.visa_free + coverage.byStatus.visa_free_with_eta
    : null;

  // Identify "good" relationships (visa-free or eTA) — the destinations
  // citizens of this country can access most freely.
  const goodRelationships = summaries
    .filter((s) => s.status === "visa_free" || s.status === "visa_free_with_eta")
    .slice(0, 6);

  // "Restricted" relationships — refused or restricted entry.
  const restrictedRelationships = summaries.filter(
    (s) => s.status === "refused" || s.status === "restricted",
  );

  return (
    <aside className="space-y-6">
      {/* PASSPORT PRESENCE — premium photo-overlaid identity card replacing
          the previous fake passport-book illustration. */}
      <PassportPresenceCard iso2={upper} />

      {/* COUNTRY OUTLINE — the silhouette cutout you asked for. */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-3">
          {name} on the map
        </p>
        <div className="flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/40 rounded-lg p-4 min-h-[160px]">
          <CountrySilhouette iso2={upper} size={180} tone="default" className="dark:invert" />
        </div>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 text-center">
          Outline from{" "}
          <a
            href="https://github.com/djaiss/mapsicon"
            target="_blank"
            rel="noreferrer noopener"
            className="underline hover:no-underline"
          >
            mapsicon
          </a>{" "}
          (CC-BY 4.0)
        </p>
      </div>

      {/* MOBILITY RANKING */}
      {mobilityScore !== null && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-5">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
            <Plane size={11} aria-hidden="true" />
            Passport Strength
          </p>
          <p className="text-4xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300 leading-none">
            {mobilityScore}
          </p>
          <p className="text-sm text-emerald-900/70 dark:text-emerald-100/70 mt-1">
            destinations open visa-free or with an eTA
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 leading-snug">
            That puts the {adjective} passport in the{" "}
            <strong className="text-emerald-700 dark:text-emerald-300">
              {mobilityScore > 170 ? "top tier" : mobilityScore > 130 ? "upper-middle tier" : mobilityScore > 80 ? "middle tier" : "lower tier"}
            </strong>{" "}
            of global mobility.
          </p>
        </div>
      )}

      {/* COUNTRY FACTS */}
      {facts && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-3">
            About {name}
          </p>
          <dl className="space-y-2.5 text-sm">
            <FactRow icon={Users} label="Population" value={formatPopulation(facts.population)} />
            <FactRow icon={MapPin} label="Capital" value={facts.capital} />
            <FactRow icon={Banknote} label="Currency" value={currency ?? "—"} />
            <FactRow
              icon={Languages}
              label="Languages"
              value={languageNames ?? facts.languages.join(", ").toUpperCase()}
            />
            <FactRow icon={Phone} label="Dial code" value={`+${facts.callingCode}`} />
            {facts.gdpPerCapita && (
              <FactRow icon={ScrollText} label="GDP / person" value={formatGdp(facts.gdpPerCapita)} />
            )}
            <FactRow icon={Globe2} label="Region" value={facts.region} />
          </dl>
        </div>
      )}

      {/* GOOD RELATIONSHIPS */}
      {goodRelationships.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
            <TrendingUp size={11} aria-hidden="true" />
            Strong Relationships
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
            Destinations open to {adjective} travellers without an embassy visa.
          </p>
          <ul className="space-y-1.5">
            {goodRelationships.map((r) => (
              <li key={r.destinationIso2}>
                <Link
                  href={`/${upper.toLowerCase()}/${r.destinationIso2.toLowerCase()}`}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 -mx-1 rounded-md hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition text-sm"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Flag iso2={r.destinationIso2} size={16} />
                    <span className="truncate">{nameFor(r.destinationIso2)}</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 shrink-0">
                    {r.status === "visa_free" ? "visa-free" : "eTA"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* RESTRICTED RELATIONSHIPS */}
      {restrictedRelationships.length > 0 && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/70 bg-red-50/40 dark:bg-red-950/20 p-5">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-red-700 dark:text-red-300 mb-1 flex items-center gap-1.5">
            <AlertCircle size={11} aria-hidden="true" />
            Tense Relationships
          </p>
          <p className="text-xs text-red-900/70 dark:text-red-100/70 mb-3">
            Routes with restricted access or routine refusal.
          </p>
          <ul className="space-y-1.5">
            {restrictedRelationships.slice(0, 5).map((r) => (
              <li key={r.destinationIso2}>
                <Link
                  href={`/${upper.toLowerCase()}/${r.destinationIso2.toLowerCase()}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 -mx-1 rounded-md hover:bg-red-100/40 dark:hover:bg-red-950/40 transition text-sm"
                >
                  <Flag iso2={r.destinationIso2} size={16} />
                  <span className="truncate">{nameFor(r.destinationIso2)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* OFFICIAL SOURCES */}
      {(resources?.visaPortal || resources?.immigrationDept) && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-3">
            Official sources
          </p>
          <ul className="space-y-2 text-sm">
            {resources.visaPortal && (
              <li>
                <a
                  href={resources.visaPortal}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-blue-700 dark:text-blue-400 hover:underline break-words"
                >
                  {resources.visaPortalLabel ?? `${name} visa portal`} ↗
                </a>
              </li>
            )}
            {resources.embassyDirectory && (
              <li>
                <a
                  href={resources.embassyDirectory}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-blue-700 dark:text-blue-400 hover:underline break-words"
                >
                  Embassies &amp; consulates ↗
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </aside>
  );
}

function FactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 shrink-0">
        <Icon size={11} aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-sm font-semibold text-slate-900 dark:text-slate-50 text-right truncate">
        {value}
      </dd>
    </div>
  );
}
