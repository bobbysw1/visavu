/**
 * International (expat) health insurance — annual private medical cover for
 * long-stay visa applicants. Required by name on many long-stay routes
 * (Spain DN, Portugal D7, France Talent Passport, Thailand LTR etc.).
 */
import type { RelocationService } from "@/lib/services";

export const HEALTH_INSURANCE: RelocationService[] = [
  {
    id: "hi-cigna-global",
    category: "health_insurance",
    provider: "Cigna Global",
    description:
      "Modular expat health plan covering inpatient, outpatient, maternity, dental, and evacuation. Worldwide cover with US-excluded and US-included tiers; accepted on most long-stay European visas.",
    url: "https://www.cignaglobal.com/",
    affiliate: true,
    globalAvailable: true,
    badge: "recommended",
    purposes: ["work", "study", "family", "tourism"],
    cta: "Get a quote",
    rating: 3.6,
    reviewCount: 4_200,
    city: "Bloomfield CT · Geneva",
  },
  {
    id: "hi-allianz-care",
    category: "health_insurance",
    provider: "Allianz Care",
    description:
      "Large-insurer expat medical cover, available in most countries. Provides a stamped certificate with destination-specific coverage limits — useful when consulates require named-insurer letters.",
    url: "https://www.allianzcare.com/en.html",
    affiliate: true,
    globalAvailable: true,
    badge: "global",
    cta: "Browse plans",
  },
  {
    id: "hi-img-global",
    category: "health_insurance",
    provider: "IMG Global Medical Insurance",
    description:
      "Long-term medical insurance with options from one month to multi-year. Good fit for sabbatical-style relocations and digital nomads.",
    url: "https://www.imglobal.com/",
    affiliate: true,
    globalAvailable: true,
    cta: "Compare options",
  },
  {
    id: "hi-bupa-global",
    category: "health_insurance",
    provider: "Bupa Global",
    description:
      "Premium worldwide health cover with elective in-patient and out-patient. Frequently chosen by senior corporate transferees and high-income digital nomads.",
    url: "https://www.bupaglobal.com/",
    affiliate: true,
    globalAvailable: true,
    cta: "Request a quote",
  },
  {
    id: "hi-geoblue",
    category: "health_insurance",
    provider: "GeoBlue (Blue Cross Blue Shield)",
    description:
      "Expat plans tailored for US citizens living abroad — keeps Blue Cross-network billing while overseas. Strong fit when you'll spend significant time back in the US.",
    url: "https://www.geobluetravelinsurance.com/",
    affiliate: true,
    globalAvailable: true,
    passportIso2List: ["US"],
    badge: "recommended",
    cta: "Quote GeoBlue",
  },
  {
    id: "hi-mawista",
    category: "health_insurance",
    provider: "MAWISTA",
    description:
      "German-market expat and student health plans accepted by Auslanderbehörde and most German student-visa offices. Good fit for Schengen long-stay routes.",
    url: "https://www.mawista.com/en",
    affiliate: true,
    globalAvailable: false,
    destinationIso2List: ["DE", "AT", "CH"],
    purposes: ["study", "work", "family"],
    badge: "recommended",
    cta: "Buy MAWISTA",
  },
];
