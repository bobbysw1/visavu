import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ecowasFreeMovementAdapter } from "./ecowas_free_movement";
import { caricomCsmeAdapter } from "./caricom_csme";
import { caricomSkilledNationalAdapter } from "./caricom_skilled_national";
import { mercosurFreeMovementAdapter } from "./mercosur_residency";
import { gccFreeMovementAdapter } from "./gcc_free_movement";

const here = dirname(fileURLToPath(import.meta.url));

function loadFixture(p: string) {
  return readFileSync(resolve(here, "__fixtures__", p), "utf8");
}

describe("Regional bloc adapters (shared factory)", () => {
  it("ECOWAS emits 15 × 14 = 210 visa-free tourism records", async () => {
    const r = await ecowasFreeMovementAdapter.parse({
      rawText: loadFixture("ecowas_free_movement.html"),
      fetchUrl: "fixture://",
    });
    expect(r.parseError).toBeUndefined();
    expect(r.records).toHaveLength(15 * 14);
    for (const rec of r.records.slice(0, 5)) {
      expect(rec.purpose).toBe("tourism");
      expect(rec.status).toBe("visa_free");
      expect(rec.maxStayDays).toBe(90);
      expect(rec.blocDerivedFrom).toBe("ecowas");
    }
  });

  it("CARICOM emits 12 × 11 = 132 visa-free records", async () => {
    const r = await caricomCsmeAdapter.parse({
      rawText: loadFixture("caricom_csme.html"),
      fetchUrl: "fixture://",
    });
    expect(r.parseError).toBeUndefined();
    expect(r.records).toHaveLength(12 * 11);
    expect(r.records[0].blocDerivedFrom).toBe("caricom");
    expect(r.records[0].maxStayDays).toBe(180);
  });

  it("Mercosur emits 9 × 8 = 72 visa-free records", async () => {
    const r = await mercosurFreeMovementAdapter.parse({
      rawText: loadFixture("mercosur.html"),
      fetchUrl: "fixture://",
    });
    expect(r.parseError).toBeUndefined();
    expect(r.records).toHaveLength(9 * 8);
    expect(r.records[0].blocDerivedFrom).toBe("mercosur");
  });

  it("GCC emits 6 × 5 = 30 visa-free records", async () => {
    const r = await gccFreeMovementAdapter.parse({
      rawText: loadFixture("gcc.html"),
      fetchUrl: "fixture://",
    });
    expect(r.parseError).toBeUndefined();
    expect(r.records).toHaveLength(6 * 5);
    expect(r.records[0].blocDerivedFrom).toBe("gcc");
  });

  it("returns parseError when the source liveness marker is gone", async () => {
    const r = await ecowasFreeMovementAdapter.parse({
      rawText: "<html>unrelated content</html>",
      fetchUrl: "fixture://",
    });
    expect(r.parseError).toBeDefined();
  });

  it("CARICOM Skilled National emits work/embassy_visa records (12 × 11 = 132)", async () => {
    const r = await caricomSkilledNationalAdapter.parse({
      rawText: loadFixture("caricom_skilled_national.html"),
      fetchUrl: "fixture://",
    });
    expect(r.parseError).toBeUndefined();
    expect(r.records).toHaveLength(132);
    expect(r.records[0].purpose).toBe("work");
    expect(r.records[0].status).toBe("embassy_visa");
  });

  it("never emits self-loops (X passport → X destination)", async () => {
    for (const adapter of [
      ecowasFreeMovementAdapter,
      caricomCsmeAdapter,
      caricomSkilledNationalAdapter,
      mercosurFreeMovementAdapter,
      gccFreeMovementAdapter,
    ]) {
      const fixturePath = adapter.metadata.fixturePath!;
      const fixture = readFileSync(resolve(process.cwd(), fixturePath), "utf8");
      const r = await adapter.parse({ rawText: fixture, fetchUrl: "fixture://" });
      const selfLoops = r.records.filter((rec) => rec.passportIso2 === rec.destinationIso2);
      expect(selfLoops).toHaveLength(0);
    }
  });
});
