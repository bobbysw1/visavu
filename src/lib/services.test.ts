import { describe, it, expect } from "vitest";
import {
  servicesFor,
  affiliateUrl,
  type RelocationService,
} from "./services";

const fixtures: RelocationService[] = [
  {
    id: "global-affiliate",
    category: "travel_insurance",
    provider: "Globally Available Insurance",
    description: "Worldwide cover",
    url: "https://example.com/global",
    affiliate: true,
    globalAvailable: true,
  },
  {
    id: "schengen-only",
    category: "travel_insurance",
    provider: "Schengen-Only Cover",
    description: "EU-only",
    url: "https://example.com/schengen",
    affiliate: true,
    globalAvailable: false,
    destinationIso2List: ["FR", "DE", "ES"],
  },
  {
    id: "uk-only-passport",
    category: "vaccinations",
    provider: "UK NHS Travel",
    description: "Only for UK passports",
    url: "https://example.com/nhs",
    affiliate: false,
    globalAvailable: false,
    passportIso2List: ["GB"],
    badge: "official",
  },
  {
    id: "work-only-legal",
    category: "legal_services",
    provider: "Work-purpose-only",
    description: "Work routes",
    url: "https://example.com/work",
    affiliate: true,
    globalAvailable: true,
    purposes: ["work"],
  },
  {
    id: "global-recommended",
    category: "travel_insurance",
    provider: "Recommended Worldwide",
    description: "",
    url: "https://example.com/rec",
    affiliate: true,
    globalAvailable: true,
    badge: "recommended",
  },
];

describe("servicesFor", () => {
  it("returns all matching services when no scoping is provided", () => {
    const r = servicesFor(fixtures, { category: "travel_insurance" });
    expect(r.map((s) => s.id).sort()).toEqual(
      ["global-affiliate", "global-recommended", "schengen-only"].sort(),
    );
  });

  it("excludes destination-scoped services for non-matching destinations when not global", () => {
    const r = servicesFor(fixtures, {
      category: "travel_insurance",
      destinationIso2: "JP",
    });
    // schengen-only is destination-scoped to FR/DE/ES and NOT globalAvailable,
    // so it must be excluded for destination=JP.
    expect(r.map((s) => s.id)).not.toContain("schengen-only");
    expect(r.map((s) => s.id)).toEqual(
      expect.arrayContaining(["global-affiliate", "global-recommended"]),
    );
  });

  it("includes destination-scoped services when the destination is in the list", () => {
    const r = servicesFor(fixtures, {
      category: "travel_insurance",
      destinationIso2: "FR",
    });
    expect(r.map((s) => s.id)).toContain("schengen-only");
  });

  it("ranks destination-specific badged services before global ones", () => {
    const r = servicesFor(fixtures, {
      category: "travel_insurance",
      destinationIso2: "FR",
    });
    // schengen-only has a country-specific hit; global-recommended has the
    // recommended badge but no country-specific hit. Country-specific
    // unbadged sits at rank 3; recommended-but-global at rank 2.
    const idx = (id: string) => r.findIndex((s) => s.id === id);
    expect(idx("global-recommended")).toBeLessThan(idx("schengen-only"));
  });

  it("filters by passport scope correctly", () => {
    const r = servicesFor(fixtures, {
      category: "vaccinations",
      passportIso2: "GB",
    });
    expect(r.map((s) => s.id)).toContain("uk-only-passport");

    const rUS = servicesFor(fixtures, {
      category: "vaccinations",
      passportIso2: "US",
    });
    expect(rUS.map((s) => s.id)).not.toContain("uk-only-passport");
  });

  it("filters by purpose when the service is purpose-scoped", () => {
    const work = servicesFor(fixtures, { category: "legal_services", purpose: "work" });
    expect(work.map((s) => s.id)).toContain("work-only-legal");

    const tourism = servicesFor(fixtures, { category: "legal_services", purpose: "tourism" });
    expect(tourism.map((s) => s.id)).not.toContain("work-only-legal");
  });
});

describe("affiliateUrl", () => {
  it("appends ref=visavu and route metadata to the URL", () => {
    const url = affiliateUrl("https://example.com/", {
      passportIso2: "GB",
      destinationIso2: "NZ",
      purpose: "work",
      campaign: "travel_insurance",
    });
    const u = new URL(url);
    expect(u.searchParams.get("ref")).toBe("visavu");
    expect(u.searchParams.get("utm_origin")).toBe("GB");
    expect(u.searchParams.get("utm_country")).toBe("NZ");
    expect(u.searchParams.get("utm_purpose")).toBe("work");
    expect(u.searchParams.get("utm_source")).toBe("visavu");
    expect(u.searchParams.get("utm_medium")).toBe("result-page");
    expect(u.searchParams.get("utm_campaign")).toBe("travel_insurance");
  });

  it("preserves an existing ref parameter on the base URL", () => {
    const url = affiliateUrl("https://example.com/?ref=partner-x", {
      destinationIso2: "JP",
    });
    expect(new URL(url).searchParams.get("ref")).toBe("partner-x");
    expect(new URL(url).searchParams.get("utm_country")).toBe("JP");
  });
});
