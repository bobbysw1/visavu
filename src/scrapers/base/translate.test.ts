/**
 * Translation-pipeline contract tests. These run with no API keys set,
 * so we're testing the graceful-fallback behaviour — every other path
 * is exercised in integration when an env var is present.
 */
import { describe, it, expect } from "vitest";
import { translate, translateMany, wrapKeep, translationCacheStats } from "./translate";

describe("translate — graceful fallback (no provider configured)", () => {
  it("returns original text when no API keys are set", async () => {
    const r = await translate("Sie benötigen einen Aufenthaltstitel.", "de");
    expect(r.text).toBe("Sie benötigen einen Aufenthaltstitel.");
    expect(r.provider).toBe("passthrough");
  });

  it("short-circuits when fromLang === toLang", async () => {
    const r = await translate("Already English", "en", "en");
    expect(r.text).toBe("Already English");
    expect(r.provider).toBe("passthrough");
  });

  it("passes through empty / whitespace input", async () => {
    expect((await translate("", "fr")).text).toBe("");
    expect((await translate("   ", "fr")).text).toBe("   ");
  });

  it("passes through tiny strings (≤ 2 chars) — likely punctuation/labels", async () => {
    expect((await translate("·", "fr")).text).toBe("·");
    expect((await translate("OK", "fr")).text).toBe("OK");
  });

  it("translateMany preserves order + length", async () => {
    const out = await translateMany(["a", "b", "c"], "fr");
    expect(out).toEqual(["a", "b", "c"]);
  });
});

describe("wrapKeep — proper-noun preservation marker", () => {
  it("wraps a single proper noun in <keep> tags", () => {
    const r = wrapKeep("Sie benötigen einen Aufenthaltstitel zur Chancenkarte.", ["Chancenkarte"]);
    expect(r).toBe("Sie benötigen einen Aufenthaltstitel zur <keep>Chancenkarte</keep>.");
  });

  it("wraps multiple proper nouns independently", () => {
    const r = wrapKeep("Talent Passport plus Chancenkarte", ["Talent Passport", "Chancenkarte"]);
    expect(r).toContain("<keep>Talent Passport</keep>");
    expect(r).toContain("<keep>Chancenkarte</keep>");
  });

  it("escapes regex-special chars in nouns (e.g. dots in URLs)", () => {
    const r = wrapKeep("Apply at france-visas.gouv.fr now", ["france-visas.gouv.fr"]);
    expect(r).toContain("<keep>france-visas.gouv.fr</keep>");
  });

  it("only matches whole words — partial matches are ignored", () => {
    // The 'Visa' inside 'France-Visas' shouldn't get wrapped on its own
    const r = wrapKeep("apply for a Visa at France-Visas", ["Visa"]);
    expect(r).toBe("apply for a <keep>Visa</keep> at France-Visas");
  });
});

describe("translationCacheStats — stable contract for admin UI", () => {
  it("returns size + byProvider object regardless of cache state", () => {
    const stats = translationCacheStats();
    expect(stats).toHaveProperty("size");
    expect(stats).toHaveProperty("byProvider");
    expect(typeof stats.size).toBe("number");
  });
});
