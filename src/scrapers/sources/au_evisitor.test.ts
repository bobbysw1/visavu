import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { australiaEvisitorAdapter } from "./au_evisitor";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/au_evisitor.html"), "utf8");

describe("Australia eVisitor (651) parser", () => {
  it("emits visa_free_with_eta records for tourism + business targeting AU, EU/EEA only", async () => {
    const r = await australiaEvisitorAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThan(50);
    const deTourism = r.records.find(
      (rec) => rec.passportIso2 === "DE" && rec.destinationIso2 === "AU" && rec.purpose === "tourism",
    );
    expect(deTourism?.status).toBe("visa_free_with_eta");
    expect(deTourism?.maxStayDays).toBe(90);
    expect(deTourism?.fees).toEqual([]);
    // US passport NOT in eVisitor (uses ETA Subclass 601 instead).
    expect(r.records.find((rec) => rec.passportIso2 === "US")).toBeUndefined();
  });

  it("returns parseError on unrelated content", async () => {
    const r = await australiaEvisitorAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
