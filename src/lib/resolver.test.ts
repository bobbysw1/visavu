import { describe, it, expect } from "vitest";
import { resolve } from "./resolver";

// DB-backed resolver paths are covered by integration tests (later — when we
// wire a real Postgres). What we CAN unit-test without a DB is the identity
// case, which short-circuits before touching the database.

describe("resolver — identity case (no DB required)", () => {
  it("FR→FR returns the citizen no-visa option", async () => {
    const out = await resolve({ passportIso2: "FR", destinationIso2: "FR", purpose: "tourism" });
    expect(out).toHaveLength(1);
    expect(out[0].status).toBe("visa_free");
    expect(out[0].label).toMatch(/Citizen/);
    expect(out[0].correctnessBucket).toBe("high");
    expect(out[0].notes).toMatch(/own country/i);
  });

  it("normalizes case (us→US works)", async () => {
    const out = await resolve({ passportIso2: "us", destinationIso2: "us", purpose: "tourism" });
    expect(out).toHaveLength(1);
    expect(out[0].passportIso2).toBe("US");
    expect(out[0].destinationIso2).toBe("US");
  });

  it("identity case ignores purpose for the visa-free answer", async () => {
    const out = await resolve({ passportIso2: "JP", destinationIso2: "JP", purpose: "transit" });
    expect(out).toHaveLength(1);
    expect(out[0].status).toBe("visa_free");
  });
});
