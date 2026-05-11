import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { newZealandNzetaAdapter } from "./nz_nzeta";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/nz_nzeta.html"), "utf8");

describe("New Zealand NZeTA parser", () => {
  it("emits visa_free_with_eta records for tourism + business targeting NZ", async () => {
    const r = await newZealandNzetaAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThan(50);
    const lvNz = r.records.find(
      (rec) => rec.passportIso2 === "LV" && rec.purpose === "tourism",
    );
    expect(lvNz?.status).toBe("visa_free_with_eta");
    expect(lvNz?.maxStayDays).toBe(90);
  });

  it("UK citizens get 180-day stays vs 90 for everyone else", async () => {
    const r = await newZealandNzetaAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.records.find((rec) => rec.passportIso2 === "GB" && rec.purpose === "tourism")?.maxStayDays).toBe(180);
    expect(r.records.find((rec) => rec.passportIso2 === "US" && rec.purpose === "tourism")?.maxStayDays).toBe(90);
  });

  it("does not emit for Australia (SCV-exempt)", async () => {
    const r = await newZealandNzetaAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.records.find((rec) => rec.passportIso2 === "AU")).toBeUndefined();
  });

  it("returns parseError on unrelated content", async () => {
    const r = await newZealandNzetaAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
