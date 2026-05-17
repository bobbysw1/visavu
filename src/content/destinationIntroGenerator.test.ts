import { describe, it, expect } from "vitest";
import { generateIntro, type GenerateDestinationIntroInput } from "./destinationIntroGenerator";
import type { CoverageSnapshot, OriginSummaryForDestination } from "@/lib/coverage";
import type { Obstacle } from "@/content/obstacles";

function origin(passportIso2: string, status: OriginSummaryForDestination["status"] = "visa_free"): OriginSummaryForDestination {
  return {
    passportIso2,
    status,
    label: status === "visa_free" ? "Visa-free" : status,
    maxStayDays: 90,
    processingTimeDaysMax: null,
    fees: [],
    requirementsCount: 0,
    biometricsRequired: null,
    onwardTicketRequired: null,
    proofOfFundsRequired: null,
    proofOfAccommodationRequired: null,
    passportValidityMonthsRequired: 6,
    purpose: "tourism",
  };
}

function coverage(byStatus: Partial<CoverageSnapshot["byStatus"]>, totalDest: number): CoverageSnapshot {
  return {
    totalDestinationsCovered: totalDest,
    byStatus: {
      visa_free: 0, visa_free_with_eta: 0, visa_on_arrival: 0,
      e_visa: 0, embassy_visa: 0, restricted: 0, refused: 0,
      ...byStatus,
    },
    byPurpose: {
      tourism: 0, business: 0, transit: 0,
      work: 0, study: 0, family: 0, diplomatic: 0,
    },
    totalOptions: 0,
  };
}

const fixtures: Record<string, GenerateDestinationIntroInput> = {
  // Very open: Schengen member admitting most major passports
  ES: {
    iso2: "ES",
    name: "Spain",
    coverage: coverage({ visa_free: 140, visa_free_with_eta: 10, visa_on_arrival: 0, embassy_visa: 50 }, 200),
    summaries: [
      origin("US"), origin("GB"), origin("JP"), origin("CA"), origin("AU"),
      origin("CN", "embassy_visa"), origin("IN", "embassy_visa"), origin("RU", "embassy_visa"),
    ],
    obstacles: [],
  },

  // Open with eVisa heavy: Türkiye, Mercosur etc.
  TH: {
    iso2: "TH",
    name: "Thailand",
    coverage: coverage({ visa_free: 90, visa_on_arrival: 20, embassy_visa: 90 }, 200),
    summaries: [
      origin("US"), origin("GB"), origin("DE"), origin("JP"),
      origin("CN", "embassy_visa"), origin("IN", "embassy_visa"),
    ],
    obstacles: [],
  },

  // Selective: requires advance application from most major passports
  RU: {
    iso2: "RU",
    name: "Russia",
    coverage: coverage({ visa_free: 20, e_visa: 50, embassy_visa: 130 }, 200),
    summaries: [
      origin("RS"), origin("AR"), origin("BR"),
      origin("US", "embassy_visa"), origin("GB", "embassy_visa"),
      origin("DE", "embassy_visa"), origin("JP", "embassy_visa"),
    ],
    obstacles: [{
      id: "ru-allied-passports",
      severity: "critical",
      title: "Russia: most Western foreign-affairs ministries advise against all non-essential travel",
      body: "Heightened risk of arbitrary detention etc.",
      appliesTo: { kind: "destination", iso: "RU" },
      references: [],
      updatedAt: "2026-05-10",
    }],
  },

  // Closed: conflict-affected destination
  AF: {
    iso2: "AF",
    name: "Afghanistan",
    coverage: coverage({ embassy_visa: 200 }, 200),
    summaries: [
      origin("CN", "embassy_visa"), origin("PK", "embassy_visa"), origin("IR", "embassy_visa"),
    ],
    obstacles: [{
      id: "af-conflict",
      severity: "critical",
      title: "Afghanistan: visa services widely suspended",
      body: "Post-2021 visa services largely suspended.",
      appliesTo: { kind: "destination", iso: "AF" },
      references: [],
      updatedAt: "2026-05-10",
    }],
  },

  // Tiny destination — Tuvalu — limited DB data
  TV: {
    iso2: "TV",
    name: "Tuvalu",
    coverage: coverage({ visa_free: 30, visa_on_arrival: 60, embassy_visa: 110 }, 200),
    summaries: [
      origin("GB"), origin("AU"), origin("NZ"),
      origin("CN", "embassy_visa"), origin("US", "embassy_visa"),
    ],
    obstacles: [],
  },
};

describe("destination intro generator", () => {
  it("produces an intro for each of the five spectrum fixtures", () => {
    for (const iso of Object.keys(fixtures)) {
      const out = generateIntro(fixtures[iso]);
      expect(out.length).toBeGreaterThan(80);
      expect(out).toMatch(/[.!?]$/);
    }
  });

  it("varies opening framing by openness tier", () => {
    const es = generateIntro(fixtures.ES);
    const af = generateIntro(fixtures.AF);
    expect(es.toLowerCase()).toMatch(/most open|broadly open|very open/);
    expect(af.toLowerCase()).toMatch(/restrictive|narrow/);
  });

  it("names specific top-origin passports that differ between destinations", () => {
    const es = generateIntro(fixtures.ES);
    const ru = generateIntro(fixtures.RU);
    expect(es).toMatch(/(United States|United Kingdom|Japan)/);
    expect(ru).toMatch(/(Serbia|Argentina|Brazil)/);
  });

  it("surfaces a bloc clause where relevant", () => {
    const es = generateIntro(fixtures.ES);
    expect(es).toMatch(/EU and Schengen|Schengen/);
  });

  it("inlines the headline obstacle for advisory-flagged destinations", () => {
    const ru = generateIntro(fixtures.RU);
    expect(ru.toLowerCase()).toMatch(/advisory|note for travellers|context:/);
  });

  it("Jaccard pairwise overlap stays reasonable across the five spectrum cases", () => {
    const isos = Object.keys(fixtures);
    const intros = isos.map((iso) => ({ iso, text: generateIntro(fixtures[iso]) }));
    const tokens = (s: string) => new Set(s.toLowerCase().match(/[a-z]{4,}/g) ?? []);
    for (let i = 0; i < intros.length; i++) {
      for (let j = i + 1; j < intros.length; j++) {
        const a = tokens(intros[i].text);
        const b = tokens(intros[j].text);
        const inter = [...a].filter((t) => b.has(t)).length;
        const union = new Set([...a, ...b]).size;
        const jaccard = inter / union;
        expect(jaccard, `${intros[i].iso} vs ${intros[j].iso} (${jaccard.toFixed(2)})`).toBeLessThan(0.55);
      }
    }
  });
});
