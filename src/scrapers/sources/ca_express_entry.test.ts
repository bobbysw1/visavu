import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { caExpressEntryAdapter } from "./ca_express_entry";
import type { WorkVisaMetadata } from "@/lib/types";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(resolve(here, "__fixtures__/ca_express_entry.html"), "utf8");

describe("CA Express Entry (FSW) parser", () => {
  it("emits per-passport e_visa / work records targeting CA", async () => {
    const r = await caExpressEntryAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    expect(r.parseError).toBeUndefined();
    expect(r.records.length).toBeGreaterThanOrEqual(200);
    for (const rec of r.records.slice(0, 5)) {
      expect(rec.destinationIso2).toBe("CA");
      expect(rec.purpose).toBe("work");
      expect(rec.status).toBe("e_visa");
      expect(rec.label).toContain("Express Entry");
    }
  });

  it("FSW does not require employer sponsorship and grants route to settlement", async () => {
    const r = await caExpressEntryAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const m = r.records[0].purposeMetadata as unknown as WorkVisaMetadata;
    expect(m.sponsorshipRequired).toBe(false);
    expect(m.jobOfferRequired).toBe(false);
    expect(m.routeToSettlement).toBe(true);
  });

  it("includes processing fee + RPRF + biometrics fee components", async () => {
    const r = await caExpressEntryAdapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
    const fees = r.records[0].fees ?? [];
    expect(fees.find((f) => f.label?.toLowerCase().includes("processing"))).toBeDefined();
    expect(fees.find((f) => f.label?.toLowerCase().includes("rprf") || f.label?.toLowerCase().includes("permanent residence"))).toBeDefined();
    expect(fees.find((f) => f.kind === "biometrics")).toBeDefined();
  });

  it("returns parseError on unrelated content", async () => {
    const r = await caExpressEntryAdapter.parse({ rawText: "<html></html>", fetchUrl: "fixture://" });
    expect(r.parseError).toBeDefined();
  });
});
