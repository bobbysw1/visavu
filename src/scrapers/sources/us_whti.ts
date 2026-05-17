/**
 * US WHTI (Western Hemisphere Travel Initiative) visa-exempt adapter.
 *
 * Source: https://www.cbp.gov/travel/us-citizens/western-hemisphere-travel-initiative
 *
 * WHTI is the legal framework under which Canadian and Bermudian citizens
 * enter the United States WITHOUT a visa for tourism, business, or transit
 * up to 6 months per entry. They are NOT in the Visa Waiver Program / ESTA
 * — they are a separate visa-exempt category. Canadians cross with a valid
 * Canadian passport (or NEXUS / EDL where applicable) and an I-94 entry
 * record issued at the port. Bermudians (British Overseas Territory) enter
 * on their Bermudian passport under the same WHTI framework.
 *
 * Before this adapter existed the us_b1b2 adapter was emitting Canadian
 * and Bermudian records as if they needed a B-1/B-2 visa — incorrect and
 * inflated CA→US tourism to "difficult" when it's among the easiest visa
 * relationships globally. This adapter sets it right.
 */
import type { Adapter, ParsedRecord, FetchContext } from "../base/Adapter";
import { politeFetch } from "../base/fetchClient";

const SOURCE_URL =
  "https://www.cbp.gov/travel/us-citizens/western-hemisphere-travel-initiative";

// Canada + Bermuda are the two WHTI visa-exempt nationalities for entering
// the US. The reverse direction (US citizens entering CA/BM) is handled
// separately under each country's tourism adapter.
const WHTI_VISA_EXEMPT = ["CA", "BM"] as const;

export const usWhtiAdapter: Adapter = {
  metadata: {
    id: "us_whti",
    name: "US WHTI visa-exempt — Canadian + Bermudian citizens (CBP)",
    kind: "government",
    parserVersion: "1.0.0",
    defaultIntervalMs: 30 * 24 * 60 * 60 * 1000,
    primaryUrls: [SOURCE_URL],
  },

  async fetch(_ctx: FetchContext) {
    const res = await politeFetch(SOURCE_URL);
    if (!res.ok) return null;
    return { rawText: await res.text(), fetchUrl: SOURCE_URL };
  },

  async parse(raw) {
    if (!/WHTI|Western Hemisphere|Canadian citizens|Bermudian/i.test(raw.rawText)) {
      return {
        records: [],
        parseError: "CBP WHTI page did not return expected wording.",
      };
    }
    const today = new Date().toISOString().slice(0, 10);
    const records: ParsedRecord[] = [];

    for (const passport of WHTI_VISA_EXEMPT) {
      // Tourism — the headline. Visa-free for up to 6 months per entry,
      // CBP sets the actual permitted stay at the port via I-94.
      records.push({
        passportIso2: passport,
        destinationIso2: "US",
        purpose: "tourism",
        status: "visa_free",
        label: "US visa-free entry under WHTI (Canadian / Bermudian citizens)",
        maxStayDays: 180,
        validityDays: null,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 0,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        biometricsRequired: false,
        proofOfAccommodationRequired: false,
        requirements: [
          passport === "CA"
            ? "Valid Canadian passport (NEXUS card or Enhanced Driver's License accepted for land/sea entry)"
            : "Valid Bermudian passport",
          "I-94 admission record issued at port of entry (electronic at air ports; paper at some land ports)",
          "Visit must be for tourism, business meetings, or transit — no employment",
        ],
        processingTimeDaysMin: null,
        processingTimeDaysMax: null,
        applicationUrl: null,
        primarySourceUrl: SOURCE_URL,
        fees: [],
        notes: passport === "CA"
          ? "Canadian citizens enter the US under the Western Hemisphere Travel Initiative — no visa, no ESTA. Standard admission is 6 months per visit, set by CBP at the port. Snowbird patterns common (up to 6 months/yr); IRS substantial-presence test starts triggering tax-resident classification beyond ~120 days/year across rolling 3-year average."
          : "Bermudian citizens (British Overseas Territory) enter the US under WHTI on their Bermudian passport — no visa, no ESTA. Standard admission is 6 months per visit, set by CBP at the port.",
      });

      // Business (B-1 equivalent purpose, also visa-free under WHTI).
      records.push({
        passportIso2: passport,
        destinationIso2: "US",
        purpose: "business",
        status: "visa_free",
        label: "US visa-free business entry under WHTI",
        maxStayDays: 180,
        validityDays: null,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 0,
        onwardTicketRequired: false,
        proofOfFundsRequired: false,
        biometricsRequired: false,
        proofOfAccommodationRequired: false,
        requirements: [
          passport === "CA"
            ? "Valid Canadian passport"
            : "Valid Bermudian passport",
          "I-94 admission record issued at port of entry",
          "Business activity must be meetings, negotiations, conferences — NOT employment with a US payer",
        ],
        processingTimeDaysMin: null,
        processingTimeDaysMax: null,
        applicationUrl: null,
        primarySourceUrl: SOURCE_URL,
        fees: [],
        notes: passport === "CA"
          ? "Business travel under WHTI permits meetings, negotiations, training, and conferences — not employment with a US payer. For Canadian professionals taking up US employment, USMCA TN visa or H-1B applies (separate adapters)."
          : "Business travel under WHTI permits meetings, negotiations, conferences — not employment with a US payer.",
      });

      // Transit — also visa-free.
      records.push({
        passportIso2: passport,
        destinationIso2: "US",
        purpose: "transit",
        status: "visa_free",
        label: "US visa-free transit under WHTI",
        maxStayDays: 1,
        validityDays: null,
        entriesAllowed: "multiple",
        passportValidityMonthsRequired: 0,
        onwardTicketRequired: true,
        proofOfFundsRequired: false,
        biometricsRequired: false,
        proofOfAccommodationRequired: false,
        requirements: [
          passport === "CA" ? "Valid Canadian passport" : "Valid Bermudian passport",
          "Onward ticket within 24 hours",
        ],
        processingTimeDaysMin: null,
        processingTimeDaysMax: null,
        applicationUrl: null,
        primarySourceUrl: SOURCE_URL,
        fees: [],
        notes: "Transit through US under WHTI requires passing through CBP, but no visa or ESTA.",
      });
    }

    return { records };
  },
};
