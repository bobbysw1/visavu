/**
 * Sources & references panel — appears on EVERY result page, with or without
 * scraped data, because the user's #1 ask is "links to all the relevant sites".
 *
 * Aggregates four layers of authoritative sources for a (passport, destination)
 * pair:
 *   1. Per-record primary sources (gov.uk, state.gov, etc.) from the resolved
 *      visa options on this page — the same `primarySourceUrl` that drives the
 *      "Source: <host>" chip on each card.
 *   2. The destination's official visa portal + embassy directory + local-
 *      language portal where applicable (from countryResources.ts).
 *   3. The originating country's MFA + visa portal (from countryResources.ts).
 *   4. The four major English-language travel-advisory dashboards (FCDO, US
 *      State, Smartraveller, travel.gc.ca).
 *
 * Deduplicated by URL so the same gov page never appears twice.
 */
import type { ResolvedVisaOption } from "@/lib/types";
import { nameFor } from "@/lib/countries";
import {
  resourcesFor,
  generalAdvisoriesFor,
  type CountryResources,
} from "@/content/countryResources";

type Source = {
  category: "scraped" | "destination" | "origin" | "advisory" | "embassy" | "translation";
  label: string;
  url: string;
  hint?: string;
};

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function collectSources(
  passportIso2: string,
  destinationIso2: string,
  options: ResolvedVisaOption[],
): Source[] {
  const sources: Source[] = [];
  const seen = new Set<string>();
  const push = (s: Source) => {
    if (seen.has(s.url)) return;
    seen.add(s.url);
    sources.push(s);
  };

  // 1. Primary sources from resolved options.
  for (const o of options) {
    if (o.primarySourceUrl) {
      push({
        category: "scraped",
        label: o.label,
        url: o.primarySourceUrl,
        hint: `Source we used for this ${o.label} record`,
      });
    }
  }

  const dest: CountryResources | undefined = resourcesFor(destinationIso2);
  const origin: CountryResources | undefined = resourcesFor(passportIso2);

  // 2. Destination official portal & embassy directory. If the channel
  // is operated by a contractor (VFS, SNEDAI, etc.) the deliveryNote is
  // surfaced inline so the user knows exactly what they're using.
  if (dest?.visaPortal) {
    push({
      category: "destination",
      label: dest.visaPortalLabel ?? `${nameFor(destinationIso2)} official visa portal`,
      url: dest.visaPortal,
      hint: dest.deliveryNote ?? `${nameFor(destinationIso2)}'s official visa & immigration page`,
    });
  }
  if (dest?.embassyDirectory) {
    push({
      category: "embassy",
      label: `${nameFor(destinationIso2)} embassies & consulates`,
      url: dest.embassyDirectory,
      hint: "Find a consulate near you for in-person services",
    });
  }
  if (dest?.localLanguagePortal) {
    push({
      category: "translation",
      label: `${nameFor(destinationIso2)} portal — ${dest.localLanguagePortal.language}`,
      url: dest.localLanguagePortal.url,
      hint: "Local-language version (sometimes more current than English)",
    });
  }

  // 3. Origin MFA / visa portal — useful for documents, apostille, advisories.
  if (origin?.visaPortal) {
    push({
      category: "origin",
      label: origin.visaPortalLabel ?? `${nameFor(passportIso2)} foreign-affairs ministry`,
      url: origin.visaPortal,
      hint: "Your country's MFA — apostille, document services, citizen advisories",
    });
  }

  // 4. Travel advisories.
  for (const a of generalAdvisoriesFor(destinationIso2)) {
    push({
      category: "advisory",
      label: a.gov,
      url: a.url,
      hint: `Independent travel advisory for ${nameFor(destinationIso2)}`,
    });
  }

  return sources;
}

const CATEGORY_LABEL: Record<Source["category"], string> = {
  scraped: "Where this page's data came from",
  destination: "Official destination portal",
  embassy: "Embassies & consulates",
  origin: "Your country's foreign-affairs ministry",
  translation: "Non-English official portals",
  advisory: "Independent travel advisories",
};

const CATEGORY_ORDER: Source["category"][] = [
  "scraped",
  "destination",
  "embassy",
  "translation",
  "origin",
  "advisory",
];

export function SourcesPanel({
  passportIso2,
  destinationIso2,
  options,
}: {
  passportIso2: string;
  destinationIso2: string;
  options: ResolvedVisaOption[];
}) {
  const sources = collectSources(passportIso2, destinationIso2, options);
  if (sources.length === 0) return null;

  // Group by category, preserving CATEGORY_ORDER.
  const grouped = new Map<Source["category"], Source[]>();
  for (const cat of CATEGORY_ORDER) grouped.set(cat, []);
  for (const s of sources) grouped.get(s.category)!.push(s);

  return (
    <section className="mt-12 mb-8" aria-label="Sources and references">
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Sources &amp; references</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Every link below is a primary government source. We aggregate; the source is the
          authority. If anything on this page disagrees with a link below, the link wins.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {CATEGORY_ORDER.map((cat) => {
          const group = grouped.get(cat) ?? [];
          if (group.length === 0) return null;
          return (
            <section key={cat}>
              <h3 className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                {CATEGORY_LABEL[cat]}
              </h3>
              <ul className="space-y-1.5">
                {group.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block px-3 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900 transition border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
                    >
                      <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {s.label}
                      </span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {hostnameOf(s.url)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
