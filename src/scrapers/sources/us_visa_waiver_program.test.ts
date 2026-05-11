import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { usVisaWaiverProgramAdapter } from "./us_visa_waiver_program";
import { hashRecords } from "../base/Adapter";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/us_visa_waiver_program.html"), "utf8");

describe("US VWP adapter parser", () => {
  it("extracts ~41 VWP designated countries from the fixture", async () => {
    const result = await usVisaWaiverProgramAdapter.parse({ rawText: fixture, fetchUrl: "fixture://vwp" });
    expect(result.parseError).toBeUndefined();
    expect(result.records.length).toBeGreaterThanOrEqual(35);
    expect(result.records.length).toBeLessThanOrEqual(50);
  });

  it("normalizes alternate names (Korea, Republic of → KR; Czech Republic → CZ; UK → GB)", async () => {
    const result = await usVisaWaiverProgramAdapter.parse({ rawText: fixture, fetchUrl: "fixture://vwp" });
    const isos = new Set(result.records.map((r) => r.passportIso2));
    expect(isos).toContain("KR");
    expect(isos).toContain("CZ");
    expect(isos).toContain("GB");
    expect(isos).toContain("TW");
    expect(isos).toContain("DE");
  });

  it("every record has the expected shape (visa_free_with_eta to US tourism, ESTA fee)", async () => {
    const result = await usVisaWaiverProgramAdapter.parse({ rawText: fixture, fetchUrl: "fixture://vwp" });
    for (const r of result.records) {
      expect(r.destinationIso2).toBe("US");
      expect(r.purpose).toBe("tourism");
      expect(r.status).toBe("visa_free_with_eta");
      expect(r.maxStayDays).toBe(90);
      expect(r.applicationUrl).toBe("https://esta.cbp.dhs.gov/");
      expect(r.fees?.[0].currency).toBe("USD");
      expect(r.fees?.[0].amountMinor).toBe(2100);
    }
  });

  it("does not include US itself as a passport country", async () => {
    const result = await usVisaWaiverProgramAdapter.parse({ rawText: fixture, fetchUrl: "fixture://vwp" });
    expect(result.records.find((r) => r.passportIso2 === "US")).toBeUndefined();
  });

  it("returns parseError when the page structure breaks (no list items)", async () => {
    const broken = "<html><body><p>The page has been redesigned.</p></body></html>";
    const result = await usVisaWaiverProgramAdapter.parse({ rawText: broken, fetchUrl: "fixture://broken" });
    expect(result.parseError).toBeDefined();
    expect(result.records).toHaveLength(0);
  });

  it("hash is stable across runs of the same input", async () => {
    const a = await usVisaWaiverProgramAdapter.parse({ rawText: fixture, fetchUrl: "fixture://vwp" });
    const b = await usVisaWaiverProgramAdapter.parse({ rawText: fixture, fetchUrl: "fixture://vwp" });
    expect(hashRecords(a.records)).toBe(hashRecords(b.records));
  });
});
