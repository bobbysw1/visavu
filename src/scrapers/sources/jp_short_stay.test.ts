import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { japanShortStayAdapter } from "./jp_short_stay";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/jp_short_stay.html"), "utf8");

describe("Japan short-stay visa-exemption parser", () => {
  it("emits visa-free tourism records targeting JP for 60+ nationalities", async () => {
    const r = await japanShortStayAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThanOrEqual(60);
    for (const rec of r.records.slice(0, 5)) {
      expect(rec.destinationIso2).toBe("JP");
      expect(rec.purpose).toBe("tourism");
      expect(rec.status).toBe("visa_free");
      expect(rec.fees).toEqual([]);
    }
  });

  it("US gets 90 days; Indonesia gets 30 days; Brunei gets 14 days", async () => {
    const r = await japanShortStayAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.records.find((rec) => rec.passportIso2 === "US")?.maxStayDays).toBe(90);
    expect(r.records.find((rec) => rec.passportIso2 === "ID")?.maxStayDays).toBe(30);
    expect(r.records.find((rec) => rec.passportIso2 === "BN")?.maxStayDays).toBe(14);
  });

  it("excludes Japan itself", async () => {
    const r = await japanShortStayAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.records.find((rec) => rec.passportIso2 === "JP")).toBeUndefined();
  });

  it("returns parseError on unrelated content", async () => {
    const r = await japanShortStayAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
