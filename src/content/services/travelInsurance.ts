/**
 * Travel insurance providers. Short-trip and nomad-style cover for medical,
 * evacuation, baggage, and trip cancellation. Affiliate-tracked.
 *
 * Liability boundary: we do NOT recommend a specific policy — providers'
 * own coverage docs are authoritative. Visavu shows what's available and
 * earns a referral if the user buys.
 */
import type { RelocationService } from "@/lib/services";

export const TRAVEL_INSURANCE: RelocationService[] = [
  {
    id: "ti-safetywing",
    category: "travel_insurance",
    provider: "SafetyWing Nomad Insurance",
    description:
      "Pay-as-you-go subscription that covers travel medical, evacuation, and trip interruption across 175+ countries. Designed for digital nomads, multi-month trips, and rolling renewal until you cancel.",
    url: "https://safetywing.com/nomad-insurance",
    affiliate: true,
    globalAvailable: true,
    badge: "global",
    feeNote: "From ~$45/4 weeks",
    cta: "Compare plans",
    rating: 4.4,
    reviewCount: 7400,
    city: "San Francisco · Oslo",
  },
  {
    id: "ti-worldnomads",
    category: "travel_insurance",
    provider: "World Nomads",
    description:
      "Single-trip insurance with explicit adventure-sports coverage (climbing, scuba, motorbike). Strong on emergency medical and evacuation for off-grid destinations.",
    url: "https://www.worldnomads.com/",
    affiliate: true,
    globalAvailable: true,
    badge: "recommended",
    cta: "Get a quote",
    rating: 3.7,
    reviewCount: 12_000,
    city: "Sydney",
  },
  {
    id: "ti-allianz",
    category: "travel_insurance",
    provider: "Allianz Travel",
    description:
      "Large-insurer travel plans with annual multi-trip and single-trip options. Useful when visa applications require named-insurer letters with minimum coverage limits.",
    url: "https://www.allianztravelinsurance.com/",
    affiliate: true,
    globalAvailable: true,
    cta: "View plans",
  },
  {
    id: "ti-iati",
    category: "travel_insurance",
    provider: "IATI Seguros",
    description:
      "Spanish-language and English travel insurance commonly accepted for Schengen embassy applications (€30,000+ medical coverage, no-deductible options).",
    url: "https://www.iatiseguros.com/en",
    affiliate: true,
    globalAvailable: true,
    destinationIso2List: [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
      "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
      "PT", "RO", "SK", "SI", "ES", "SE", "CH",
    ],
    badge: "recommended",
    feeNote: "Schengen-compliant cover",
    cta: "Get Schengen cover",
  },
  {
    id: "ti-axa-schengen",
    category: "travel_insurance",
    provider: "AXA Schengen",
    description:
      "Built specifically for Schengen short-stay visa applications. Generates the certificate of insurance with the format consulates expect.",
    url: "https://www.axa-schengen.com/en",
    affiliate: true,
    globalAvailable: true,
    destinationIso2List: [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
      "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
      "PT", "RO", "SK", "SI", "ES", "SE", "CH",
    ],
    badge: "official",
    cta: "Buy Schengen policy",
  },
];
