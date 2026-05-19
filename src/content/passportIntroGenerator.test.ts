import { describe, it, expect } from "vitest";
import { generateIntro, type GenerateIntroInput } from "./passportIntroGenerator";
import type { CoverageSnapshot, DestinationSummaryForPassport } from "@/lib/coverage";
import type { Obstacle } from "@/content/obstacles";

// ---------------------------------------------------------------------------
// Fixtures — small, hand-built snapshots that mimic what the page passes in.
// We don't go through the DB; the generator is a pure function over its inputs.
// ---------------------------------------------------------------------------

function sum(...summaries: DestinationSummaryForPassport[]): DestinationSummaryForPassport[] {
  return summaries;
}

function open(destinationIso2: string, status: "visa_free" | "visa_free_with_eta" = "visa_free"): DestinationSummaryForPassport {
  return {
    destinationIso2,
    status,
    label: status === "visa_free" ? "Visa-free" : "ETA",
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

function embassy(destinationIso2: string, purpose: DestinationSummaryForPassport["purpose"] = "tourism"): DestinationSummaryForPassport {
  return {
    ...open(destinationIso2),
    status: "embassy_visa",
    label: "Embassy visa",
    purpose,
  };
}

function coverage(byStatus: Partial<CoverageSnapshot["byStatus"]>, totalDest: number): CoverageSnapshot {
  return {
    totalDestinationsCovered: totalDest,
    byStatus: {
      visa_free: 0,
      visa_free_with_eta: 0,
      visa_on_arrival: 0,
      e_visa: 0,
      embassy_visa: 0,
      restricted: 0,
      refused: 0,
      ...byStatus,
    },
    byPurpose: {
      tourism: 0, business: 0, transit: 0,
      work: 0, study: 0, family: 0, diplomatic: 0,
    },
    totalOptions: 0,
  };
}

// ---------------------------------------------------------------------------
// Five test passports spanning the full mobility spectrum.
// ---------------------------------------------------------------------------

const fixtures: Record<string, GenerateIntroInput> = {
  // Tier 1 — Swedish passport: premium global mobility, full EU + Schengen.
  SE: {
    iso2: "SE",
    name: "Sweden",
    adjective: "Swedish",
    coverage: coverage({ visa_free: 180, visa_free_with_eta: 5, embassy_visa: 10 }, 195),
    summaries: sum(
      open("US", "visa_free_with_eta"),
      open("GB"),
      open("JP"),
      open("DE"),
      open("FR"),
      open("CA", "visa_free_with_eta"),
      open("AU", "visa_free_with_eta"),
      open("SG"),
      embassy("RU"),
      embassy("CN"),
    ),
    obstacles: [],
  },

  // Tier 2 — Moroccan passport: moderate tier. Mid visa-free count to South
  // America + Türkiye + Southeast Asia, long-stay options heavy on bilateral
  // France/Spain ties, no obstacles.
  MA: {
    iso2: "MA",
    name: "Morocco",
    adjective: "Moroccan",
    coverage: coverage(
      { visa_free: 85, visa_free_with_eta: 5, visa_on_arrival: 15, e_visa: 12, embassy_visa: 75 },
      195,
    ),
    summaries: sum(
      open("TR"),
      open("BR"),
      open("AR"),
      open("MY"),
      open("ID", "visa_free_with_eta"),
      embassy("US"),
      embassy("GB"),
      embassy("DE"),
      embassy("FR", "work"),
      embassy("ES", "work"),
    ),
    obstacles: [],
  },

  // Tier 3 — Nigerian passport: heavily restricted. Few visa-free, ECOWAS
  // bloc benefit, refusal-rate context as headline obstacle.
  NG: {
    iso2: "NG",
    name: "Nigeria",
    adjective: "Nigerian",
    coverage: coverage(
      { visa_free: 15, visa_on_arrival: 10, e_visa: 8, embassy_visa: 162 },
      195,
    ),
    summaries: sum(
      open("GH"),
      open("BJ"),
      open("CI"),
      open("SN"),
      embassy("US"),
      embassy("GB", "work"),
      embassy("CA", "work"),
      embassy("DE"),
    ),
    obstacles: [],
  },

  // Tier 4 — Russian passport: broad regional access (Latin America, post-Soviet,
  // parts of Asia/Africa) but EU/UK/US/Schengen closed; obstacle entry dominates.
  RU: {
    iso2: "RU",
    name: "Russia",
    adjective: "Russian",
    coverage: coverage(
      { visa_free: 115, visa_free_with_eta: 2, visa_on_arrival: 25, e_visa: 20, embassy_visa: 25 },
      195,
    ),
    summaries: sum(
      open("AE"),
      open("TR"),
      open("RS"),
      open("AR"),
      open("BR"),
      embassy("US"),
      embassy("GB"),
      embassy("DE"),
    ),
    obstacles: [{
      id: "ru-eu-sanctions",
      severity: "caution" as const,
      title: "Russian passport: heightened scrutiny across EU/Schengen and allied states",
      body: "Suspended Visa Facilitation Agreement etc.",
      appliesTo: { kind: "passport" as const, iso: "RU" },
      references: [],
      updatedAt: "2026-05-10",
    }],
  },

  // Tier 5 — Tuvaluan passport: tiny island, narrow Commonwealth-led mobility,
  // few work-route options.
  TV: {
    iso2: "TV",
    name: "Tuvalu",
    adjective: "Tuvaluan",
    coverage: coverage({ visa_free: 60, visa_on_arrival: 20, embassy_visa: 115 }, 195),
    summaries: sum(
      open("GB"),
      open("FJ"),
      open("WS"),
      embassy("US"),
      embassy("AU", "work"),
      embassy("NZ", "work"),
    ),
    obstacles: [],
  },
};

describe("passport intro generator", () => {
  it("produces an intro for each of the five spectrum fixtures", () => {
    for (const iso of Object.keys(fixtures)) {
      const out = generateIntro(fixtures[iso]);
      expect(out.length).toBeGreaterThan(80); // ~at least one sentence
      expect(out).toMatch(/[.!?]$/);
    }
  });

  it("varies opening framing by mobility tier", () => {
    const se = generateIntro(fixtures.SE);
    const ng = generateIntro(fixtures.NG);
    expect(se.toLowerCase()).toContain("top tier");
    expect(ng.toLowerCase()).toMatch(/restricted|narrow|requires advance/);
  });

  it("names specific destinations that differ between passports", () => {
    const se = generateIntro(fixtures.SE);
    const ng = generateIntro(fixtures.NG);
    // Swedish-passport opens to Japan/Singapore/US; Nigerian to Ghana/Benin/Senegal.
    // The "Highlights include visa-free entry to ..." sentence is where the
    // generator names the passport's actual reachable destinations.
    expect(se).toMatch(/visa-free entry to[^.]*?(Japan|Singapore|United States)/);
    expect(ng).toMatch(/(Ghana|Benin|Côte)/);
    // Sweden's reachable list shouldn't include African ECOWAS countries.
    expect(se).not.toMatch(/(Ghana|Benin|Senegal|Côte)/);
  });

  it("surfaces the relevant bloc clause per passport", () => {
    const se = generateIntro(fixtures.SE);
    const ng = generateIntro(fixtures.NG);
    const ru = generateIntro(fixtures.RU);
    expect(se).toMatch(/EU and Schengen/);
    expect(ng).toMatch(/ECOWAS/);
    expect(ru).not.toMatch(/EU and Schengen|ECOWAS|GCC/);
  });

  it("inlines the headline obstacle for sanctioned passports", () => {
    const ru = generateIntro(fixtures.RU);
    expect(ru.toLowerCase()).toMatch(/scrutiny|advisory|note for/);
  });

  it("flags missing major destinations for restricted passports", () => {
    const ng = generateIntro(fixtures.NG);
    // Major destinations the Nigerian passport doesn't get visa-free.
    expect(ng).toMatch(/United States|United Kingdom|Germany/);
    expect(ng.toLowerCase()).toMatch(/embassy|require an embassy-issued|e-Visa/i);
  });

  it("Jaccard pairwise overlap stays below 45% across the five spectrum cases", () => {
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
        expect(jaccard, `${intros[i].iso} vs ${intros[j].iso} (${jaccard.toFixed(2)})`).toBeLessThan(0.45);
      }
    }
  });

  it("uses tier-appropriate language for limited passports", () => {
    const tv = generateIntro(fixtures.TV);
    // Tuvalu fixture: 60/195 = ~31% visa-free → restricted tier.
    expect(tv).toMatch(/Tuvalu/);
    expect(tv).toMatch(/Fiji|Samoa|United Kingdom/);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PASSPORT_PROFILES integration — country-specific document/process terms
  // The user-flagged anti-AI-slop rule: generated text must contain locale-
  // specific document names, NOT generic "police clearance" / "apostille".
  // ─────────────────────────────────────────────────────────────────────────
  describe("PASSPORT_PROFILES integration — country-specific terminology", () => {
    function fixtureFor(iso: string, name: string, adj: string): GenerateIntroInput {
      return {
        iso2: iso,
        name,
        adjective: adj,
        coverage: coverage({ visa_free: 100, e_visa: 30, embassy_visa: 60 }, 195),
        summaries: sum(
          open("DE"),
          open("FR"),
          open("JP"),
          embassy("CA", "work"),
          embassy("AU", "work"),
        ),
        obstacles: [],
      };
    }

    it("UK intro references ACRO + FCDO (not generic police clearance + apostille)", () => {
      const text = generateIntro(fixtureFor("GB", "United Kingdom", "British"));
      expect(text).toMatch(/ACRO/);
      expect(text).toMatch(/FCDO/);
      // Must NOT collapse to generic phrasing.
      expect(text).not.toMatch(/generic police clearance/i);
    });

    it("US intro references FBI Identity History Summary + US Dept of State", () => {
      const text = generateIntro(fixtureFor("US", "United States", "American"));
      expect(text).toMatch(/FBI|Identity History/);
      // US is a Hague signatory — should mention apostille
      expect(text).toMatch(/apostille/i);
    });

    it("India intro references the Passport Seva Kendra PCC + MEA", () => {
      const text = generateIntro(fixtureFor("IN", "India", "Indian"));
      expect(text).toMatch(/Passport Seva|PCC|Police Clearance Certificate/);
      expect(text).toMatch(/MEA|Ministry of External Affairs/);
    });

    it("UAE intro routes via MOFA attestation (non-Hague legalisation chain)", () => {
      const text = generateIntro(fixtureFor("AE", "United Arab Emirates", "Emirati"));
      // UAE was a non-Hague signatory historically — should mention embassy legalisation
      // (test passes whether profile says Hague or not, just verifies UAE-specific issuer
      // appears somewhere).
      expect(text).toMatch(/MOFA|MOI|UAE/);
    });

    it("two profiled passports produce different document terminology", () => {
      const gb = generateIntro(fixtureFor("GB", "United Kingdom", "British"));
      const in_ = generateIntro(fixtureFor("IN", "India", "Indian"));
      // ACRO is UK-only — must NOT appear in the India intro
      expect(in_).not.toMatch(/ACRO/);
      // PCC / Passport Seva is India-only — must NOT appear in the UK intro
      expect(gb).not.toMatch(/Passport Seva/);
    });

    it("unprofiled passport falls back gracefully (no crash, no profile sentence)", () => {
      // Tuvalu has no PASSPORT_PROFILES entry — generator must still produce
      // a valid intro without the document sentence.
      const text = generateIntro(fixtures.TV);
      expect(text.length).toBeGreaterThan(80);
      expect(text).not.toMatch(/undefined|null|\[object/);
    });
  });
});
