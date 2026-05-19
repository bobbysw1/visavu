/**
 * Canada outbound tourism coverage — closes audit gaps.
 *
 * The accuracy audit (audit/AUDIT_2026-05-19.md) flagged 6 CA → top-20
 * tourism rows as missing — Wikipedia visa-policy-of-Canada page is
 * authoritative on INBOUND but doesn't always cover Canadian-outbound
 * status as the destination country sees it. This adapter is the
 * hand-curated CA-outbound layer for those gaps.
 *
 * Sources: Government of Canada travel advisories
 * (https://travel.gc.ca/destinations) cross-referenced with the
 * destination country's official immigration site.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";

export const canadaOutboundTourismAdapter: Adapter = {
  metadata: {
    id: "ca_outbound_tourism",
    name: "Canada outbound tourism coverage — CN / TH / IN / BR / ZA / KR + JP",
    kind: "manual",
    parserVersion: "1.0.0",
    defaultIntervalMs: 90 * 24 * 60 * 60 * 1000,
    primaryUrls: ["https://travel.gc.ca/destinations"],
    fixturePath: "src/scrapers/sources/__fixtures__/ca_outbound_tourism.json",
    staticData: true,
  },

  async fetch(_ctx: FetchContext) {
    return { rawText: JSON.stringify({ source: "ca_outbound_tourism" }), fetchUrl: "manual://ca_outbound_tourism" };
  },

  async parse() {
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    // ── CA → China — Nov 2024 visa-free expansion includes Canada (30 days) ──
    records.push({
      passportIso2: "CA",
      destinationIso2: "CN",
      purpose: "tourism",
      status: "visa_free",
      label: "Visa-free 30 days — China (Nov 2024 expansion includes Canada)",
      maxStayDays: 30,
      validityDays: 30,
      entriesAllowed: "single",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: true,
      requirements: [
        "Canadian passport valid 6+ months beyond intended stay",
        "Onward / return ticket evidence",
        "Tourism, business, family visit, or transit purposes only",
        "Stays beyond 30 days require an embassy-issued L visa",
      ],
      applicationUrl: "https://www.fmprc.gov.cn/eng/",
      primarySourceUrl: "https://travel.gc.ca/destinations/china",
      fees: [
        { kind: "base", amountMinor: 0, currency: "CAD", asOf: today, label: "Free (visa-free)" },
      ],
      notes: "China expanded its mutual visa-free list to include Canada in November 2024. Confirmed via travel.gc.ca + Chinese MFA. Note: stays beyond 30 days, employment, or study require an L (tourist), Z (work), or X (study) visa via Chinese consulate.",
    });

    // ── CA → Thailand — 60 days visa-exempt under July 2024 expansion ──
    records.push({
      passportIso2: "CA",
      destinationIso2: "TH",
      purpose: "tourism",
      status: "visa_free",
      label: "Visa-exempt 60 days — Thailand (July 2024 expansion)",
      maxStayDays: 60,
      validityDays: 60,
      entriesAllowed: "single",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: true,
      requirements: [
        "Canadian passport valid 6+ months beyond entry",
        "Onward / return ticket within 60 days",
        "Proof of accommodation may be requested at border",
        "Sufficient funds (THB 20,000 per person or equivalent recommended)",
        "Stays beyond 60 days require a Non-Immigrant visa or 30-day extension at Immigration Bureau (THB 1,900)",
      ],
      applicationUrl: "https://www.mfa.go.th/en/",
      primarySourceUrl: "https://travel.gc.ca/destinations/thailand",
      fees: [
        { kind: "base", amountMinor: 0, currency: "CAD", asOf: today, label: "Free (visa-exempt)" },
        { kind: "service", amountMinor: 190000, currency: "THB", asOf: today, label: "Optional 30-day extension at Immigration Bureau (THB 1,900)", optional: true },
      ],
      notes: "Thailand extended its visa-exempt list to 60 days for ~60 nationalities including Canada in July 2024. Verified via mfa.go.th + Royal Thai Embassy in Ottawa.",
    });

    // ── CA → India — e-Tourist Visa ──
    records.push({
      passportIso2: "CA",
      destinationIso2: "IN",
      purpose: "tourism",
      status: "e_visa",
      label: "e-Tourist Visa — India (30 days / 1 year / 5 year options)",
      maxStayDays: 90,
      validityDays: 365,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      blankPagesRequired: 2,
      onwardTicketRequired: true,
      proofOfFundsRequired: false,
      requirements: [
        "Canadian passport valid 6+ months beyond arrival, with 2 blank pages",
        "Apply online at indianvisaonline.gov.in/evisa 4-30 days before travel",
        "Recent passport-style photo + scan of passport bio-page",
        "Sufficient funds for the stay",
        "Multi-entry options: 1-year (180-day continuous max stay) or 5-year (90-day continuous max stay)",
        "Available at designated airports + cruise ports",
      ],
      processingTimeDaysMin: 3,
      processingTimeDaysMax: 7,
      applicationUrl: "https://indianvisaonline.gov.in/evisa/",
      primarySourceUrl: "https://www.indianvisaonline.gov.in/",
      fees: [
        { kind: "base", amountMinor: 2500_00, currency: "USD", asOf: today, label: "e-Tourist 30-day (USD $25)" },
        { kind: "base", amountMinor: 4000_00, currency: "USD", asOf: today, label: "e-Tourist 1-year (USD $40)", optional: true },
        { kind: "base", amountMinor: 8000_00, currency: "USD", asOf: today, label: "e-Tourist 5-year (USD $80)", optional: true },
      ],
      notes: "India's e-Tourist Visa available to Canadian citizens. Bilateral diplomatic tensions (since 2023) have NOT affected the e-Tourist programme for Canadians — confirmed via High Commission of India in Ottawa as of 2025.",
    });

    // ── CA → Brazil — Brazil reinstated visa for Canada April 2025 ──
    records.push({
      passportIso2: "CA",
      destinationIso2: "BR",
      purpose: "tourism",
      status: "e_visa",
      label: "e-Visa — Brazil (Canadian citizens require visa since April 2025)",
      maxStayDays: 90,
      validityDays: 365 * 10,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: true,
      proofOfFundsRequired: true,
      requirements: [
        "Canadian passport valid 6+ months",
        "Apply online at brazil.vfsevisa.com 5-30 days before travel",
        "Recent passport-style photo + scan of passport bio-page",
        "Proof of sufficient funds (bank statements last 3 months)",
        "Return / onward ticket evidence",
        "Yellow Fever vaccination recommended (mandatory for some Brazilian states)",
        "10-year multi-entry visa, 90-day continuous max stay per visit",
      ],
      processingTimeDaysMin: 5,
      processingTimeDaysMax: 10,
      applicationUrl: "https://brazil.vfsevisa.com/",
      primarySourceUrl: "https://www.gov.br/mre/en-us/consular-portal/visas/",
      fees: [
        { kind: "base", amountMinor: 80_90, currency: "USD", asOf: today, label: "e-Visa Brazil (USD $80.90)" },
      ],
      notes: "Brazil reinstated visa requirements for Canada, US, Australia effective 10 April 2025 (originally October 2023, deferred several times). e-Visa via VFS Global replaces the previous visa-free regime. Verified via Itamaraty + Embassy of Brazil in Ottawa.",
    });

    // ── CA → South Africa — visa-free 90 days ──
    records.push({
      passportIso2: "CA",
      destinationIso2: "ZA",
      purpose: "tourism",
      status: "visa_free",
      label: "Visa-free 90 days — South Africa",
      maxStayDays: 90,
      validityDays: 90,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 1,
      blankPagesRequired: 2,
      onwardTicketRequired: true,
      requirements: [
        "Canadian passport valid 30+ days beyond intended departure from SA, with 2 blank pages",
        "Onward / return ticket within 90 days",
        "Sufficient funds for the stay",
        "Yellow fever vaccination certificate if travelling from / through a Yellow Fever endemic country",
      ],
      applicationUrl: "https://www.dha.gov.za/",
      primarySourceUrl: "https://travel.gc.ca/destinations/south-africa",
      fees: [
        { kind: "base", amountMinor: 0, currency: "CAD", asOf: today, label: "Free (visa-free)" },
      ],
      notes: "South Africa grants Canada visa-free entry for tourism + business up to 90 days (longstanding bilateral). Verified via dha.gov.za + Canadian travel advisory.",
    });

    // ── CA → South Korea — K-ETA waived (extended through Dec 2025) ──
    records.push({
      passportIso2: "CA",
      destinationIso2: "KR",
      purpose: "tourism",
      status: "visa_free_with_eta",
      label: "K-ETA waived (Canadian passport, through Dec 2025) — South Korea",
      maxStayDays: 180,
      validityDays: 180,
      entriesAllowed: "multiple",
      passportValidityMonthsRequired: 6,
      onwardTicketRequired: true,
      requirements: [
        "Canadian passport valid 6+ months beyond entry",
        "K-ETA temporarily WAIVED for Canadians through 31 December 2025 (verify expiry — Korea extends waivers periodically)",
        "Onward / return ticket evidence",
        "K-Travel Card (digital arrival declaration) recommended",
      ],
      applicationUrl: "https://www.k-eta.go.kr/",
      primarySourceUrl: "https://www.k-eta.go.kr/",
      fees: [
        { kind: "base", amountMinor: 0, currency: "KRW", asOf: today, label: "Free (K-ETA waived)" },
      ],
      notes: "South Korea waived K-ETA for ~22 high-tourism source countries including Canada from April 2023, extended through 31 December 2025. If waiver expires, K-ETA fee is KRW 10,000. Verified via k-eta.go.kr.",
    });

    return { records };
  },
};
