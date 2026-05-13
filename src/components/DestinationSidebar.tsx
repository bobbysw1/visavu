/**
 * Right-rail sidebar for the result page (/[passport]/[destination]).
 *
 * Mirrors the visual rhythm of PassportSidebar but anchored on the
 * DESTINATION: vibrant photo, country name, key relocation metrics,
 * official entry-portal link, and a quick cross-link to the other
 * direction.
 *
 * Why this exists: the old result page leaned heavily on stacked text
 * sections. User feedback was that it felt like a government info
 * site rather than a relocation product. This sidebar gives the page
 * the same "magazine layout" feel that already works on /passport/[iso].
 */
import Link from "next/link";
import { Banknote, MapPin, Users, Languages, ScrollText, ExternalLink } from "lucide-react";
import { Flag } from "./Flag";
import { CountryMetricsDashboard } from "./CountryMetricsDashboard";
import { getCountryPhotoSync } from "@/lib/pexels";
import { nameFor } from "@/lib/countries";
import { factsFor, formatPopulation, formatGdp } from "@/content/countryFacts";
import { resourcesFor } from "@/content/countryResources";
import { currencyForCountry } from "@/lib/currencyByCountry";
import { COUNTRY_LANGUAGE } from "@/lib/countryLanguages";
import type { DifficultyAssessment } from "@/lib/difficulty";

export function DestinationSidebar({
  destinationIso2,
  passportIso2,
  difficulty,
  processingDaysMin,
  processingDaysMax,
}: {
  destinationIso2: string;
  passportIso2: string;
  difficulty: DifficultyAssessment | null;
  processingDaysMin: number | null;
  processingDaysMax: number | null;
}) {
  const upper = destinationIso2.toUpperCase();
  const lower = upper.toLowerCase();
  const facts = factsFor(upper);
  const currency = currencyForCountry(upper);
  const resources = resourcesFor(upper);
  const name = nameFor(upper);
  const photo = getCountryPhotoSync(upper);

  const languageNames =
    facts?.languages
      .map((code) => {
        const match = Object.values(COUNTRY_LANGUAGE).find((l) => l.bcp47 === code);
        return match?.nativeName ?? code.toUpperCase();
      })
      .join(" · ") ?? null;

  return (
    <aside className="space-y-5">
      {/* HERO TILE — destination photo + flag + name. Sticky so it stays
          on screen as the user scrolls visa options on the left. */}
      <figure className="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-neutral-900 aspect-[4/5]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.alt}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-sm overflow-hidden ring-1 ring-white/30">
              <Flag iso2={upper} size={20} />
            </span>
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/70">
              Destination
            </span>
          </div>
          <p className="text-white text-2xl font-bold leading-tight tracking-tight">{name}</p>
          {photo && (
            <p className="mt-1.5 text-[10px] tracking-wider uppercase text-white/50">
              Photo: {photo.photographer} · Pexels
            </p>
          )}
        </div>
      </figure>

      {/* KEY METRICS — small embedded dashboard. Same component used on
          /destination/[iso] so the visual treatment is consistent. */}
      <CountryMetricsDashboard
        destinationIso2={upper}
        difficulty={difficulty}
        processingDaysMin={processingDaysMin}
        processingDaysMax={processingDaysMax}
      />

      {/* COUNTRY FACTS — same shape as PassportSidebar's facts box. */}
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
            {facts.gdpPerCapita && (
              <FactRow icon={ScrollText} label="GDP / person" value={formatGdp(facts.gdpPerCapita)} />
            )}
          </dl>
        </div>
      )}

      {/* OFFICIAL ENTRY PORTAL — primary-source CTA. */}
      {(resources?.visaPortal || resources?.embassyDirectory) && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-3">
            Apply on the government&apos;s own site
          </p>
          <ul className="space-y-2 text-sm">
            {resources.visaPortal && (
              <li>
                <a
                  href={resources.visaPortal}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-baseline gap-1.5 text-blue-700 dark:text-blue-400 hover:underline break-words"
                >
                  {resources.visaPortalLabel ?? `${name} visa portal`}
                  <ExternalLink size={11} aria-hidden />
                </a>
              </li>
            )}
            {resources.embassyDirectory && (
              <li>
                <a
                  href={resources.embassyDirectory}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-baseline gap-1.5 text-blue-700 dark:text-blue-400 hover:underline break-words"
                >
                  Embassy &amp; consulate directory
                  <ExternalLink size={11} aria-hidden />
                </a>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* CROSS-LINKS — easy lateral nav so users can pivot to the
          destination's profile page or back to their own passport's. */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 text-sm">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-3">
          Explore more
        </p>
        <ul className="space-y-2">
          <li>
            <Link
              href={`/destination/${lower}`}
              className="text-blue-700 dark:text-blue-400 hover:underline"
            >
              All passports → {name}
            </Link>
          </li>
          <li>
            <Link
              href={`/passport/${passportIso2.toLowerCase()}`}
              className="text-blue-700 dark:text-blue-400 hover:underline"
            >
              Other destinations from {nameFor(passportIso2)}
            </Link>
          </li>
          <li>
            <Link
              href={`/compare/${passportIso2.toLowerCase()}/${lower}`}
              className="text-blue-700 dark:text-blue-400 hover:underline"
            >
              Compare {nameFor(passportIso2)} ↔ {name}
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

function FactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 shrink-0">
        <Icon size={11} aria-hidden />
        {label}
      </dt>
      <dd className="text-sm font-semibold text-slate-900 dark:text-slate-50 text-right truncate">
        {value}
      </dd>
    </div>
  );
}
