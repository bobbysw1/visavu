/**
 * Country fact panel — population, currency, languages, government links,
 * travel-advisory shortcuts.
 *
 * Rendered on /destination/[iso] and /passport/[iso]. Pulls structured
 * facts from `countryFacts.ts` (curated) + currency from
 * `currencyByCountry.ts` + government portal URLs from
 * `countryResources.ts` + travel advisories from
 * `generalAdvisoriesFor()`.
 *
 * When `factsFor(iso)` returns null (the country isn't in our curated
 * facts table yet) we still render the gov-portal and travel-advice
 * links — they're always useful — and skip the fact rows.
 */
import { Globe, Users, Banknote, Languages, Phone, ScrollText, Plane, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { factsFor, formatPopulation, formatGdp } from "@/content/countryFacts";
import { resourcesFor, generalAdvisoriesFor } from "@/content/countryResources";
import { currencyForCountry } from "@/lib/currencyByCountry";
import { COUNTRY_LANGUAGE } from "@/lib/countryLanguages";
import { nameFor } from "@/lib/countries";

export function CountryFactsBox({
  iso2,
  /** "destination" = government links labelled "official immigration portal";
   *  "passport" = labelled "your foreign-affairs ministry". */
  mode,
}: {
  iso2: string;
  mode: "destination" | "passport";
}) {
  const upper = iso2.toUpperCase();
  const facts = factsFor(upper);
  const currency = currencyForCountry(upper);
  const resources = resourcesFor(upper);
  const advisories = generalAdvisoriesFor(upper);
  const name = nameFor(upper);

  // Map language codes → native names where we have them.
  const languageNames =
    facts?.languages
      .map((code) => {
        const match = Object.values(COUNTRY_LANGUAGE).find((l) => l.bcp47 === code);
        return match?.nativeName ?? code.toUpperCase();
      })
      .join(" · ") ?? null;

  return (
    <section className="mt-6 mb-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
      <header className="px-5 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-emerald-700 dark:text-emerald-300">
          {mode === "destination" ? "Country profile" : "Country profile"}
        </p>
        {facts && (
          <h2 className="text-lg font-semibold tracking-tight mt-0.5 text-slate-900 dark:text-slate-50">
            {facts.officialName}
          </h2>
        )}
      </header>

      {facts && (
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 p-5 sm:p-6 text-sm">
          <FactRow icon={Users} label="Population" value={formatPopulation(facts.population)} />
          <FactRow icon={Globe} label="Capital" value={facts.capital} />
          <FactRow icon={Banknote} label="Currency" value={currency ?? "—"} />
          <FactRow
            icon={Languages}
            label="Languages"
            value={languageNames ?? facts.languages.join(", ").toUpperCase()}
          />
          <FactRow icon={Phone} label="Calling code" value={`+${facts.callingCode}`} />
          {facts.gdpPerCapita && (
            <FactRow icon={ScrollText} label="GDP / person" value={formatGdp(facts.gdpPerCapita)} />
          )}
          {facts.driving && (
            <FactRow
              icon={Plane}
              label="Driving"
              value={facts.driving === "left" ? "Left-hand" : "Right-hand"}
            />
          )}
          <FactRow icon={Globe} label="Region" value={facts.region} />
        </dl>
      )}

      {facts?.opportunities && (
        <div className="px-5 sm:px-6 pb-5 -mt-1">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400 mb-1.5">
            Why people move here
          </p>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {facts.opportunities}
          </p>
        </div>
      )}

      <div className="px-5 sm:px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400 mb-2">
          Official sources
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {resources?.visaPortal && (
            <li>
              <a
                href={resources.visaPortal}
                target="_blank"
                rel="noreferrer noopener"
                className="text-blue-700 dark:text-blue-400 hover:underline"
              >
                {resources.visaPortalLabel ?? `${name} immigration / visa portal`} ↗
              </a>
            </li>
          )}
          {resources?.embassyDirectory && (
            <li>
              <a
                href={resources.embassyDirectory}
                target="_blank"
                rel="noreferrer noopener"
                className="text-blue-700 dark:text-blue-400 hover:underline"
              >
                {name} embassies & consulates ↗
              </a>
            </li>
          )}
          {resources?.localLanguagePortal && (
            <li>
              <a
                href={resources.localLanguagePortal.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-blue-700 dark:text-blue-400 hover:underline"
              >
                {name} portal ({resources.localLanguagePortal.language}) ↗
              </a>
            </li>
          )}
          {!resources?.visaPortal && (
            <li className="text-neutral-500 dark:text-neutral-400">
              We don&apos;t have a curated immigration-portal link for {name} yet — let us know via{" "}
              <Link href="/api/report" className="underline">
                Report incorrect info
              </Link>{" "}
              if you have one.
            </li>
          )}
        </ul>
      </div>

      {advisories.length > 0 && (
        <div className="px-5 sm:px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1.5">
            <ShieldAlert size={13} aria-hidden="true" />
            Travel advisories
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {advisories.map((a) => (
              <li key={a.url}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-blue-700 dark:text-blue-400 hover:underline"
                >
                  {a.gov} — {name} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            Crime, security, health and entry conditions are best read from your own
            government&apos;s travel-advisory dashboard — they update faster than we can.
          </p>
        </div>
      )}
    </section>
  );
}

function FactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-[0.12em] uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-0.5">
        <Icon size={11} aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-sm font-semibold text-slate-900 dark:text-slate-50">{value}</dd>
    </div>
  );
}
