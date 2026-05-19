/**
 * Bilateral + destination context helpers for the AI chat.
 *
 * Builds the "feel-like-an-expert-friend" context the chat synthesis weaves
 * into answers — total visa count for the destination, the bilateral
 * relationship signals (Working Holiday agreement + Commonwealth + EU + FTA
 * + Trans-Tasman etc.), age-aware route hints, and a one-line "destination
 * personality" sentence.
 *
 * Pure read-side; no writes, no Mistral calls. Cheap to compute per turn.
 */
import { db, schema } from "@/db/client";
import { sql } from "drizzle-orm";
import { nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";

const COMMONWEALTH = new Set([
  "GB", "AU", "CA", "NZ", "ZA", "IN", "PK", "BD", "LK", "MY", "SG", "NG", "GH",
  "KE", "TZ", "UG", "RW", "BW", "ZW", "NA", "ZM", "MW", "JM", "BS", "BB", "TT",
  "AG", "DM", "GD", "KN", "LC", "VC", "BZ", "GY", "FJ", "PG", "WS", "TO", "SB",
  "VU", "KI", "NR", "TV", "MT", "CY", "MV", "BN", "MZ", "CM", "GM", "LS", "SZ",
]);

const EU_EEA_EFTA = new Set([
  // EU
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE",
  // EEA non-EU
  "IS", "NO", "LI",
  // EFTA (Switzerland is EFTA but not EEA — separate bilateral with EU)
  "CH",
]);

const SCHENGEN = new Set([
  "AT", "BE", "BG", "HR", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS",
  "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO", "SK", "SI",
  "ES", "SE", "CH",
]);

const TRANS_TASMAN = new Set(["AU", "NZ"]);

const MERCOSUR_FULL = new Set(["AR", "BR", "PY", "UY", "BO"]);
const MERCOSUR_ASSOC = new Set(["CL", "CO", "EC", "PE", "SR"]);

const NORDIC_PASSPORT_UNION = new Set(["DK", "FI", "IS", "NO", "SE"]);

const GCC = new Set(["AE", "SA", "KW", "BH", "QA", "OM"]);

const CPLP = new Set(["PT", "BR", "AO", "MZ", "CV", "GW", "ST", "TL", "GQ"]);

const IBEROAMERICAN_NATIONALITY_CONVENTION_PAIRS: Array<[string, string]> = [
  // Spain has bilateral nationality conventions accelerating each other's naturalisation
  ["ES", "AR"], ["ES", "BO"], ["ES", "CL"], ["ES", "CO"], ["ES", "CR"],
  ["ES", "EC"], ["ES", "SV"], ["ES", "GT"], ["ES", "HN"], ["ES", "MX"],
  ["ES", "NI"], ["ES", "PA"], ["ES", "PY"], ["ES", "PE"], ["ES", "DO"],
  ["ES", "UY"], ["ES", "VE"], ["ES", "PH"], ["ES", "PT"], ["ES", "AD"],
];

/** Map of (destination, passport) → free-text bilateral notes the chat
 *  should weave into answers. Drives the "UK and Australia share a great
 *  relationship" kind of opening. Only the most user-relevant pairs are
 *  encoded — others fall through to multilateral signals (Commonwealth, EU, GCC). */
const BILATERAL_NOTES: Record<string, Record<string, string>> = {
  AU: {
    GB: "UK ↔ Australia share Commonwealth ties + the AUKUS partnership. The UK–Australia Free Trade Agreement (in force July 2023) eased mobility substantially: British Working Holiday visa holders get 3-year stays + are exempt from the 88-day regional-work requirement. Australian employers can sponsor British workers via Subclass 482 + 186 with reduced labour-market testing.",
    NZ: "Australia and New Zealand operate the Trans-Tasman Travel Arrangement — NZ citizens enter Australia visa-free with full work rights under Subclass 444 (Special Category Visa), effectively indefinite stay. The closest bilateral mobility relationship in the world.",
    CA: "Australia–Canada share Commonwealth + CANZUK alignment + the IEC / Working Holiday programme up to age 35 for both directions.",
    US: "Australia is one of two countries with a dedicated US treaty visa — the E-3 Specialty Occupation visa, capped at 10,500/year, much easier than the H-1B. Plus mutual ETA visa-free travel.",
    JP: "Australia–Japan share the Working Holiday agreement + the Reciprocal Access Agreement (2022) + JAEPA economic partnership.",
    KR: "Australia–Korea Working Holiday + KAFTA economic partnership.",
    IN: "Australia–India Working Holiday (limited annual quota) + the ECTA (Economic Cooperation and Trade Agreement, 2022). Australia is a major destination for Indian skilled workers via Subclass 482.",
  },
  GB: {
    AU: "UK and Australia share Commonwealth + AUKUS + the UK–Australia FTA (2023). Australian under-35s can use the UK Youth Mobility Scheme for 3 years + are exempt from Skilled Worker visa salary thresholds in some cases.",
    IE: "UK–Ireland Common Travel Area (since 1922) — Irish citizens have full UK residence + work + voting rights without any visa, broader than any EU relationship.",
    IN: "UK–India 2030 Roadmap + Migration & Mobility Partnership (May 2021). Indians are heavily represented in UK Skilled Worker, Student route, and Innovator Founder visa.",
    US: "UK and US Skilled Worker / H-1B mutual movement is strong. UK is on the US Visa Waiver Program (ESTA) and one of the heaviest sources for US student + investor visas.",
  },
  US: {
    GB: "UK and US share dense business travel via ESTA + L-1 intracompany transfers + H-1B + E-2 (UK is a treaty country).",
    CA: "US–Canada share USMCA + the longest undefended border + free movement under NEXUS for low-risk travellers.",
    AU: "US–Australia E-3 Treaty visa is uniquely available — 10,500/year cap, dramatically easier than H-1B.",
    MX: "US–Mexico share USMCA + TN Professional visa (60+ designated occupations, no annual cap, indefinite renewable).",
    IL: "US–Israel share the E-2 treaty visa + B-5 mutual reciprocal arrangements.",
  },
  CA: {
    GB: "Canada–UK share Commonwealth + the IEC Working Holiday (extended to age 35 for British applicants) + Five Eyes intelligence partnership.",
    US: "Canada–US share NEXUS + USMCA + TN Professional visa (60+ occupations).",
    IN: "Canada–India political tensions since 2023 have NOT affected the Express Entry, study, or work visa categories — only diplomatic processing of specific case types.",
    PH: "Canada–Philippines: Filipinos are Canada's third-largest immigrant source. Caregiver pilot programmes + Express Entry + IEC are active.",
  },
  ES: {
    AR: "Spain–Argentina share the 1995 bilateral nationality convention — Argentines get Spanish citizenship after 2 years of legal residence (vs the 10 years general route).",
    MX: "Spain–Mexico share the bilateral nationality convention + Spanish residence after 2 years.",
    PT: "Spain and Portugal share Iberian peninsula free movement + EU + Schengen + dense cross-border commuter flows.",
    GB: "British post-Brexit access to Spain — visa-free 90/180 + ETIAS from late 2026. Spain offers strong NLV + DNV + Golden-Visa-residual routes for British retirees + remote workers.",
  },
  DE: {
    GB: "Germany has Europe's largest post-Brexit British emigrant community. EU Blue Card + Chancenkarte are the main routes.",
    TR: "Germany hosts Europe's largest Turkish diaspora (~3M) — family-reunification volume is highest in EU.",
  },
};

export function bilateralContext(passportIso2: string, destinationIso2: string): string[] {
  const p = passportIso2.toUpperCase();
  const d = destinationIso2.toUpperCase();
  const notes: string[] = [];

  // Direct bilateral note if curated.
  const direct = BILATERAL_NOTES[d]?.[p];
  if (direct) notes.push(direct);

  // Multilateral signals.
  if (TRANS_TASMAN.has(p) && TRANS_TASMAN.has(d)) {
    notes.push("Trans-Tasman: NZ ↔ AU citizens have free movement under the Special Category Visa.");
  }
  if (EU_EEA_EFTA.has(p) && EU_EEA_EFTA.has(d)) {
    notes.push("EU/EEA/EFTA free movement — full residence + work + study rights with no visa.");
  } else if (SCHENGEN.has(p) && SCHENGEN.has(d) && p !== d) {
    notes.push("Both in Schengen — short-stay borderless travel.");
  }
  if (NORDIC_PASSPORT_UNION.has(p) && NORDIC_PASSPORT_UNION.has(d)) {
    notes.push("Nordic Passport Union — Nordic citizens have free residence + work in any Nordic state.");
  }
  if (COMMONWEALTH.has(p) && COMMONWEALTH.has(d)) {
    notes.push("Both Commonwealth nations — some visa programmes (Youth Mobility, UK Ancestry) leverage this.");
  }
  if (MERCOSUR_FULL.has(p) && MERCOSUR_FULL.has(d)) {
    notes.push("Mercosur full members — streamlined residence under the Residency Agreement.");
  } else if ((MERCOSUR_FULL.has(p) || MERCOSUR_ASSOC.has(p)) && (MERCOSUR_FULL.has(d) || MERCOSUR_ASSOC.has(d))) {
    notes.push("Both Mercosur full + associated states — Mercosur Residency Agreement gives streamlined residence.");
  }
  if (GCC.has(p) && GCC.has(d)) {
    notes.push("Both GCC members — citizens have residence + work rights across GCC.");
  }
  if (CPLP.has(p) && CPLP.has(d)) {
    notes.push("Both CPLP (Lusophone) members — Mobility Convention 2021 gives streamlined access.");
  }
  if (IBEROAMERICAN_NATIONALITY_CONVENTION_PAIRS.some(([a, b]) => (a === p && b === d) || (a === d && b === p))) {
    notes.push("Iberoamerican Nationality Convention — naturalisation accelerated to 2 years (vs 10 standard).");
  }

  return notes;
}

/** Return a one-paragraph natural-language summary of how many visa
 *  options Visavu has indexed for this destination, plus a hint at what
 *  the headline categories are. Used by the chat to confidently say
 *  "Australia has X visa types in our index". */
export async function destinationSummary(destinationIso2: string): Promise<string> {
  try {
    const total = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${schema.visaOptions.label})` })
      .from(schema.visaOptions)
      .where(sql`${schema.visaOptions.destinationIso2} = ${destinationIso2.toUpperCase()}`);
    const totalN = Number(total[0]?.count ?? 0);
    const name = nameFor(destinationIso2);
    return `Visavu's index has ${totalN} distinct visa categories for ${name} (across tourism / business / transit / work / study / family / diplomatic purposes).`;
  } catch {
    return "";
  }
}

/** Age-aware route hint — surfaces Working Holiday eligibility when a
 *  young applicant is asking about an AU/NZ/CA/UK/JP/KR-type destination
 *  + a few other youth-mobility schemes. Cheap heuristic; chat uses this
 *  to recommend WHV for ~18-30 (or 35 for select pairs) before pivoting
 *  to skilled-worker / employer-sponsored routes. */
export function workingHolidayContextHint(passportIso2: string, destinationIso2: string): string {
  const p = passportIso2.toUpperCase();
  const d = destinationIso2.toUpperCase();
  // Quick decision table for highest-volume WH pairs.
  if (d === "AU" && ["GB", "CA", "IE", "FR", "IT"].includes(p)) {
    return `Working Holiday 417 available for ${nationalityFor(p)} under-35 applicants (extended age cap), with 3-year max stay. ${p === "GB" ? "British applicants exempt from 88-day regional-work requirement under UK-AU FTA." : ""}`;
  }
  if (d === "AU" && ["DE", "JP", "KR", "NL", "BE", "SE", "FI", "NO", "DK", "HK", "TW"].includes(p)) {
    return `Working Holiday 417 available for ${nationalityFor(p)} under-30 applicants, 1-year initial + extendable to 3 years with regional work.`;
  }
  if (d === "AU" && ["US", "AR", "BR", "CL", "ES", "PT", "PL", "TR", "TH", "VN"].includes(p)) {
    return `Work and Holiday 462 available for ${nationalityFor(p)} under-30 applicants (annual cap).`;
  }
  if (d === "NZ" && ["GB", "CA", "FR", "IE"].includes(p)) {
    return `NZ Working Holiday available for ${nationalityFor(p)} under-30 (35 for some), 12-23 month stays.`;
  }
  if (d === "GB" && ["AU", "CA", "NZ", "JP", "KR"].includes(p)) {
    return `UK Youth Mobility (Tier 5) available for ${nationalityFor(p)} under-35 applicants (under-30 for some), 2-3 year stays.`;
  }
  if (d === "CA" && ["GB", "FR", "AU", "DE", "IT", "IE", "JP", "KR"].includes(p)) {
    return `Canada International Experience (IEC) Working Holiday available for ${nationalityFor(p)} under-35 applicants.`;
  }
  if (d === "JP" && ["AU", "CA", "GB", "FR", "DE", "IE", "IT", "ES", "PT", "KR", "NZ"].includes(p)) {
    return `Japan Working Holiday available for ${nationalityFor(p)} under-30 applicants, 1-year stays.`;
  }
  return "";
}
