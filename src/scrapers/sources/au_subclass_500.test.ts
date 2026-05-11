import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { auSubclass500Adapter } from "./au_subclass_500";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/au_subclass_500.html"), "utf8");

describe("AU Subclass 500 (Student) parser", () => {
  it("emits per-passport e_visa / study records targeting AU", async () => {
    const r = await auSubclass500Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThanOrEqual(200);
    for (const rec of r.records.slice(0, 5)) {
      expect(rec.destinationIso2).toBe("AU");
      expect(rec.purpose).toBe("study");
      expect(rec.status).toBe("e_visa");
      expect(rec.label).toBe("Student visa (Subclass 500)");
    }
    // No record for AU itself
    expect(r.records.find((rec) => rec.passportIso2 === "AU")).toBeUndefined();
  });

  it("captures the AUD 1,600 application charge", async () => {
    const r = await auSubclass500Adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const fees = r.records[0].fees ?? [];
    const base = fees.find((f) => f.kind === "base");
    expect(base?.amountMinor).toBe(1600_00);
    expect(base?.currency).toBe("AUD");
  });

  it("returns parseError on unrelated content", async () => {
    const r = await auSubclass500Adapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
