/**
 * Japan Specified Skilled Worker (SSW) adapter.
 *
 * Source: https://www.moj.go.jp/isa/policies/ssw/index.html
 *
 * Created in 2019 to address Japan's labour shortage in 14 (now 16) sectors.
 * SSW(i) is the entry-level visa (5 years total, no family sponsorship);
 * SSW(ii) is the long-term route (no upper limit on renewals, family
 * sponsorship allowed). This adapter covers SSW(i) as the canonical case.
 */
import * as cheerio from "cheerio";
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";
import { COUNTRY_LIST } from "@/lib/countries";
import type { WorkVisaMetadata } from "@/lib/types";

const SOURCE_URL = "https://www.ssw.go.jp/en/";

export const jpSpecifiedSkilledWorkerAdapter: Adapter = {
  metadata: {
    id: "jp_specified_skilled_worker",
    name: "Japan Specified Skilled Worker (SSW) — moj.go.jp",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 14 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
    fixturePath: "src/scrapers/sources/__fixtures__/jp_ssw.html",
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    const $ = cheerio.load(raw.rawText);
    const today = new Date().toISOString().slice(0, 10);
    const main = $("body").text().replace(/\s+/g, " ");

    if (!/(specified\s+skilled\s+worker|特定技能)/i.test(main)) {
      return { records: [], parseError: "Page does not match expected SSW / 特定技能 wording." };
    }

    const purposeMetadata: WorkVisaMetadata = {
      sponsorshipRequired: true,
      sponsorType: "employer",
      jobOfferRequired: true,
      workPermitDays: 5 * 365,
      routeToSettlement: false, // SSW(i) caps at 5 years; SSW(ii) is the settlement route
      eligibleOccupations: [
        "Care worker / nursing",
        "Building cleaning",
        "Manufacturing (industrial machinery, electronics, materials)",
        "Construction",
        "Shipbuilding & ship machinery",
        "Automobile maintenance",
        "Aviation industry",
        "Accommodation",
        "Agriculture",
        "Fishery",
        "Food and beverages manufacturing",
        "Food service",
        "Road transport",
        "Forestry",
        "Wood industry",
      ],
    };

    const requirements = [
      "Pass the relevant Specified Skill Evaluation Test for the target sector",
      "Pass a Japanese Language Proficiency Test (JLPT N4 or JFT-Basic A2)",
      "Sign an employment contract with a Japanese host organisation",
      "Pass a medical examination",
      "Receive a Certificate of Eligibility (COE) issued by the Immigration Services Agency",
    ];

    const records: ParsedRecord[] = COUNTRY_LIST
      .filter((c) => c.iso2 !== "JP")
      .map((c) => ({
        passportIso2: c.iso2,
        destinationIso2: "JP",
        purpose: "work" as const,
        status: "embassy_visa" as const,
        label: "Specified Skilled Worker (i)",
        maxStayDays: 5 * 365,
        validityDays: 5 * 365,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 6,
        biometricsRequired: false,
        proofOfFundsRequired: false,
        requirements,
        processingTimeDaysMin: 30,
        processingTimeDaysMax: 90,
        applicationUrl: "https://www.moj.go.jp/isa/applications/procedures/ssw_index.html",
        primarySourceUrl: SOURCE_URL,
        fees: [
          { kind: "base" as const, amountMinor: 4000, currency: "JPY", asOf: today, label: "Visa issuance fee" },
        ],
        notes:
          "SSW(i) provides up to 5 years total residence; family sponsorship is not permitted at this tier. SSW(ii) (16 sectors as of 2024) removes the renewal cap and permits family. Bilateral cooperation MoUs exist with the Philippines, Indonesia, Vietnam, Cambodia, Nepal, Myanmar, Mongolia, Bangladesh, Thailand, Sri Lanka, Pakistan, and others — these countries' candidates use streamlined processes.",
        purposeMetadata: purposeMetadata as unknown as Record<string, unknown>,
      }));

    if (records.length < 100) {
      return { records, parseError: `Only ${records.length} SSW records (expected ~249).` };
    }
    return { records };
  },
};
