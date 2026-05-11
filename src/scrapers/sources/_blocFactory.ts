/**
 * Shared factory for regional-bloc free-movement adapters.
 *
 * ECOWAS, CARICOM (Single Market), Mercosur and GCC all follow the same
 * pattern: a list of member states grants their citizens visa-free entry
 * (and varying degrees of work/residence rights) to other member states.
 * Encoding each bloc as a separate adapter file would duplicate ~80 lines
 * of nearly-identical scaffolding. This factory takes the bloc-specific
 * facts and emits a conforming Adapter.
 *
 * The "fetch" hits the bloc's primary website (or a Wikipedia article on
 * the agreement) as a liveness check. The actual member-state list and
 * policy data is inlined here — these are slow-moving treaty texts, not
 * scraped HTML.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { VisaStatus, Purpose } from "@/lib/types";

export type BlocAdapterSpec = {
  id: string;
  name: string;
  blocId: string; // matches blocs.id seeded in the DB
  members: string[];
  primarySourceUrl: string;
  fixturePath: string;
  fixtureMatch: RegExp;
  parserVersion: string;
  status: VisaStatus;
  purpose: Purpose;
  label: string;
  maxStayDays: number | null;
  validityDays?: number | null;
  entriesAllowed?: string;
  passportValidityMonthsRequired?: number;
  requirements: string[];
  notes: string;
};

export function blocAdapter(spec: BlocAdapterSpec): Adapter {
  return {
    metadata: {
      id: spec.id,
      name: spec.name,
      kind: "regional_bloc",
      parserVersion: spec.parserVersion,
      defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
      primaryUrls: [spec.primarySourceUrl],
      fixturePath: spec.fixturePath,
    },

    async fetch(_ctx: FetchContext) {
      const res = await politeFetch(spec.primarySourceUrl);
      if (!res.ok) return null;
      return { rawText: await res.text(), fetchUrl: spec.primarySourceUrl };
    },

    async parse(raw) {
      if (!spec.fixtureMatch.test(raw.rawText)) {
        return {
          records: [],
          parseError: `Source page no longer matches expected marker for ${spec.name}.`,
        };
      }

      const validIso = new Set(COUNTRY_LIST.map((c) => c.iso2));
      const records: ParsedRecord[] = [];

      for (const passport of spec.members) {
        if (!validIso.has(passport)) continue;
        for (const dest of spec.members) {
          if (!validIso.has(dest)) continue;
          if (passport === dest) continue;

          records.push({
            passportIso2: passport,
            destinationIso2: dest,
            purpose: spec.purpose,
            status: spec.status,
            label: spec.label,
            maxStayDays: spec.maxStayDays,
            validityDays: spec.validityDays ?? null,
            entriesAllowed: spec.entriesAllowed ?? "multiple",
            passportValidityMonthsRequired: spec.passportValidityMonthsRequired ?? 6,
            onwardTicketRequired: false,
            requirements: spec.requirements,
            processingTimeDaysMin: null,
            processingTimeDaysMax: null,
            applicationUrl: null,
            primarySourceUrl: spec.primarySourceUrl,
            fees: [],
            blocDerivedFrom: spec.blocId,
            notes: spec.notes,
          });
        }
      }

      return { records };
    },
  };
}
