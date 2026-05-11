/**
 * Rich empty-state card. Shown on the result page when we don't have a
 * structured visa_options record for a (passport, destination, purpose) cell.
 *
 * Instead of a useless "no data" message, we surface the destination's
 * official visa portal, the originating country's MFA, the major travel
 * advisory dashboards, and the embassy directory — i.e. exactly the resources
 * a thoughtful researcher would use to answer the question themselves.
 *
 * This is the bridge between "we don't have specific data" and a useful
 * answer. The structured cells will fill in over time as adapters expand.
 */
import Link from "next/link";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import { type Purpose, PURPOSE_LABEL } from "@/lib/types";
import {
  resourcesFor,
  generalAdvisoriesFor,
  type CountryResources,
} from "@/content/countryResources";

export function EmptyStateCard({
  passportIso2,
  destinationIso2,
  purpose,
}: {
  passportIso2: string;
  destinationIso2: string;
  purpose: Purpose;
}) {
  const dest = resourcesFor(destinationIso2);
  const origin = resourcesFor(passportIso2);
  const advisories = generalAdvisoriesFor(destinationIso2);

  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 mb-8">
      <header className="mb-5">
        <h2 className="text-xl font-semibold mb-1">
          Start here — three places to check for {nationalityFor(passportIso2)} travellers visiting{" "}
          {nameFor(destinationIso2)}.
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          We don&apos;t have a structured record for this route yet, so we point you straight at
          the destination&apos;s own ministry. They have final say.
        </p>
      </header>

      {dest?.visaPortal && (
        <a
          href={dest.visaPortal}
          target="_blank"
          rel="noreferrer noopener"
          className="block p-5 rounded-lg border-2 border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 hover:border-blue-500 dark:hover:border-blue-600 transition mb-4"
        >
          <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300 font-semibold mb-1">
            1. {nameFor(destinationIso2)} — official visa portal
          </p>
          <p className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
            {dest.visaPortalLabel ?? `${nameFor(destinationIso2)} government — visas`}
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate mt-1">
            {dest.visaPortal.replace(/^https?:\/\//, "")}
          </p>
        </a>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dest && !dest.visaPortal && (
          <ResourceColumn
            heading={`${nameFor(destinationIso2)} entry information`}
            description={`Embassy directory and other authoritative sources.`}
            resources={dest}
            kind="destination"
          />
        )}
        {origin && (
          <ResourceColumn
            heading={`2. ${nameFor(passportIso2)} foreign-affairs ministry`}
            description={`Useful for documents, apostille, and travel advisories from your own government.`}
            resources={origin}
            kind="origin"
          />
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-2">
          3. General travel-advisory dashboards for {nameFor(destinationIso2)}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
          The four major English-language advisory services. They publish current safety
          guidance independently of visa policy and update on a rolling basis.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {advisories.map((a) => (
            <li key={a.url}>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition text-sm"
              >
                <span className="font-medium">{a.gov}</span>
                <span className="block text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {a.url.replace(/^https?:\/\//, "")}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/destination/${destinationIso2.toLowerCase()}`}
          className="text-xs px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          See {nameFor(destinationIso2)} entry rules overview
        </Link>
        <Link
          href={`/passport/${passportIso2.toLowerCase()}`}
          className="text-xs px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          See all destinations for {nameFor(passportIso2)} passport
        </Link>
      </div>
    </section>
  );
}

function ResourceColumn({
  heading,
  description,
  resources,
  kind,
}: {
  heading: string;
  description: string;
  resources: CountryResources;
  kind: "origin" | "destination";
}) {
  return (
    <div className="p-4 rounded-lg bg-neutral-50/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
      <h3 className="text-sm font-semibold mb-1">{heading}</h3>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">{description}</p>
      <ul className="space-y-2 text-sm">
        {resources.visaPortal && (
          <li>
            <a
              href={resources.visaPortal}
              target="_blank"
              rel="noreferrer noopener"
              className="block px-3 py-2 rounded border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition"
            >
              <span className="font-medium block">
                {resources.visaPortalLabel ?? "Official visa portal"}
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {resources.visaPortal.replace(/^https?:\/\//, "")}
              </span>
            </a>
          </li>
        )}
        {kind === "destination" && resources.embassyDirectory && (
          <li>
            <a
              href={resources.embassyDirectory}
              target="_blank"
              rel="noreferrer noopener"
              className="block px-3 py-2 rounded border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition"
            >
              <span className="font-medium block">Embassy directory</span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {resources.embassyDirectory.replace(/^https?:\/\//, "")}
              </span>
            </a>
          </li>
        )}
        {resources.localLanguagePortal && (
          <li>
            <a
              href={resources.localLanguagePortal.url}
              target="_blank"
              rel="noreferrer noopener"
              className="block px-3 py-2 rounded border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition"
            >
              <span className="font-medium block">
                Local-language portal ({resources.localLanguagePortal.language})
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {resources.localLanguagePortal.url.replace(/^https?:\/\//, "")}
              </span>
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
