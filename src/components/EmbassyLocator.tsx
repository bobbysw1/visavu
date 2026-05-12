"use client";

/**
 * Location-aware embassy + appointment-centre locator.
 *
 * Strategy: we don't host 250×250 embassy geo-coordinates ourselves —
 * that's a maintenance nightmare. Instead the component:
 *
 *   1. Shows a row of high-value action cards (nearest embassy, nearest
 *      VFS Global / TLScontact / BLS biometrics centre, nearest immigration
 *      medical clinic, nearest passport-photo provider) that deep-link
 *      into Google Maps with a destination-and-passport-aware search
 *      query like "Japan embassy near 51.5,-0.12" or "VFS Global Manila".
 *   2. Optionally asks for browser geolocation. With consent the Maps
 *      deep links pivot to "@lat,lng" so the user lands on results
 *      centred on their actual location.
 *   3. Surfaces the destination's official embassy / consulate directory
 *      from countryResources (the curated content file) so the user has
 *      the authoritative list one click away too.
 *
 * Renders only on embassy / restricted routes — visa-free routes don't
 * need a physical-application step.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Hospital, Camera, FileCheck2, Building2, LocateFixed, ExternalLink } from "lucide-react";
import { nameFor } from "@/lib/countries";
import { resourcesFor } from "@/content/countryResources";

type Coord = { lat: number; lng: number };

type Action = {
  id: string;
  icon: typeof MapPin;
  title: string;
  /** Short prose body shown under the title. */
  body: string;
  /** Google Maps query template. {dest} substitutes the destination name,
   *  {passport} the visitor's passport. */
  query: string;
  /** Plausible event payload for tracking which categories convert. */
  eventCategory: string;
};

const ACTIONS: Action[] = [
  {
    id: "embassy",
    icon: Building2,
    title: "Nearest embassy / consulate",
    body: "Where you'll attend in person to submit documents and biometrics. Embassies handle long-stay visa applications directly.",
    query: "{dest} embassy",
    eventCategory: "embassy",
  },
  {
    id: "vac",
    icon: FileCheck2,
    title: "Visa application centre",
    body: "Outsourced VAC (VFS Global, TLScontact, BLS International) that collects fees + biometrics for many embassies.",
    query: "{dest} visa application centre",
    eventCategory: "vac",
  },
  {
    id: "medical",
    icon: Hospital,
    title: "Immigration medical clinic",
    body: "Designated panel physician for {dest}-immigration medicals. Required for most long-stay work, family, and skilled-migration visas.",
    query: "{dest} panel physician immigration medical",
    eventCategory: "medical",
  },
  {
    id: "photos",
    icon: Camera,
    title: "Passport photo provider",
    body: "Walk-in pharmacy or photo shop that prints to {dest}-spec dimensions and background colour.",
    query: "{dest} passport photo near me",
    eventCategory: "photos",
  },
];

export function EmbassyLocator({
  passportIso2,
  destinationIso2,
}: {
  passportIso2: string;
  destinationIso2: string;
}) {
  const [coord, setCoord] = useState<Coord | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [denied, setDenied] = useState(false);
  const destName = nameFor(destinationIso2);
  const resources = resourcesFor(destinationIso2);

  // Persist last-grant in sessionStorage so jumping between routes doesn't
  // re-prompt the user.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("visavu:geo:v1");
      if (raw) {
        const parsed = JSON.parse(raw) as Coord;
        if (
          typeof parsed?.lat === "number" &&
          typeof parsed?.lng === "number" &&
          !Number.isNaN(parsed.lat) &&
          !Number.isNaN(parsed.lng)
        ) {
          setCoord(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) {
      setDenied(true);
      return;
    }
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: Coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoord(c);
        setRequesting(false);
        try {
          window.sessionStorage.setItem("visavu:geo:v1", JSON.stringify(c));
        } catch {
          /* ignore */
        }
      },
      () => {
        setDenied(true);
        setRequesting(false);
      },
      { timeout: 8000, enableHighAccuracy: false, maximumAge: 60_000 },
    );
  }

  function mapsLink(query: string): string {
    const expanded = query
      .replace(/\{dest\}/g, destName)
      .replace(/\{passport\}/g, nameFor(passportIso2));
    const center = coord ? `/@${coord.lat},${coord.lng},10z` : "";
    return `https://www.google.com/maps/search/${encodeURIComponent(expanded)}${center}`;
  }

  return (
    <section className="mt-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 sm:p-6">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-blue-700 dark:text-blue-300 mb-1">
            Where to apply in person
          </p>
          <h3 className="text-lg font-semibold mb-1">
            Find a {destName} embassy or VAC near you
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Most long-stay applications need an in-person appointment. We can&apos;t book it for
            you — but we can point you to the right physical place in one click.
          </p>
        </div>
        {!coord && !denied && (
          <button
            type="button"
            onClick={requestLocation}
            disabled={requesting}
            className="text-xs font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LocateFixed size={12} aria-hidden />
            {requesting ? "Locating…" : "Use my location"}
          </button>
        )}
        {coord && (
          <span className="text-[11px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200">
            <LocateFixed size={11} aria-hidden />
            Centred on your location
          </span>
        )}
      </header>

      {denied && (
        <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
          Location not available — links below open a Google Maps search you can re-centre yourself.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIONS.map((a) => (
          <a
            key={a.id}
            href={mapsLink(a.query)}
            target="_blank"
            rel="noreferrer noopener"
            className="plausible-event-name=EmbassyLocatorClicked block rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 transition p-4"
            data-event-category={a.eventCategory}
            data-event-destination={destinationIso2}
            data-event-passport={passportIso2}
            data-event-geo={coord ? "yes" : "no"}
          >
            <div className="flex items-start gap-3 mb-2">
              <span className="rounded-lg p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shrink-0">
                <a.icon size={16} aria-hidden />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-0.5">
                  {a.title.replace("{dest}", destName)}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">
                  {a.body.replace(/\{dest\}/g, destName)}
                </p>
              </div>
            </div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 inline-flex items-center gap-1">
              Open in Google Maps <ExternalLink size={11} aria-hidden />
            </p>
          </a>
        ))}
      </div>

      {/* Official embassy directory link (curated) — primary-source link
          alongside the Maps-based discovery. */}
      {resources?.embassyDirectory && (
        <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">
          <MapPin size={11} className="inline mr-1 -mt-0.5" aria-hidden />
          Official {destName} embassy + consulate directory:{" "}
          <a
            href={resources.embassyDirectory}
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-700 dark:text-blue-400 underline font-medium"
          >
            {(() => {
              try {
                return new URL(resources.embassyDirectory).hostname.replace(/^www\./, "");
              } catch {
                return "official directory";
              }
            })()}
          </a>
        </p>
      )}

      <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
        Need a curated provider list instead? See our{" "}
        <Link href="/services/biometrics" className="underline">biometrics directory</Link>,{" "}
        <Link href="/services/medical-checks" className="underline">medical-check panel physicians</Link>, or{" "}
        <Link href="/services/passport-photos" className="underline">passport-photo services</Link>.
      </p>
    </section>
  );
}
