import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { jpSpecifiedSkilledWorkerAdapter } from "./jp_ssw";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/jp_ssw.html"), "utf8");

describe("Japan SSW parser", () => {
  it("emits per-passport embassy_visa / work records targeting JP", async () => {
    const r = await jpSpecifiedSkilledWorkerAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThanOrEqual(200);
    expect(r.records.find((rec) => rec.passportIso2 === "JP")).toBeUndefined();
    const sample = r.records[0];
    expect(sample.destinationIso2).toBe("JP");
    expect(sample.purpose).toBe("work");
    expect(sample.label).toBe("Specified Skilled Worker (i)");
  });

  it("returns parseError on unrelated content", async () => {
    const r = await jpSpecifiedSkilledWorkerAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
