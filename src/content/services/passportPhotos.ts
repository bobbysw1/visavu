/**
 * Passport photo services — both online (mobile-snap → spec-compliant
 * print/download) and walk-in chains. Spec varies by destination: US/UK use
 * different aspect ratios; Schengen photos are slightly different again.
 */
import type { RelocationService } from "@/lib/services";

export const PASSPORT_PHOTOS: RelocationService[] = [
  {
    id: "pp-passportphotoonline",
    category: "passport_photos",
    provider: "Passport Photo Online",
    description:
      "Web app + iOS/Android app that turns a phone snap into a passport-spec photo for 100+ countries. AI background removal + biometric checks; digital download and physical prints to your door.",
    url: "https://passport-photo.online/",
    affiliate: true,
    globalAvailable: true,
    badge: "recommended",
    feeNote: "~$10 digital / ~$15 with prints",
    cta: "Take a photo",
  },
  {
    id: "pp-ivisaphotos",
    category: "passport_photos",
    provider: "iVisa Photos",
    description:
      "Destination-aware passport-photo service that ships printed photos and includes a digital file matching the destination embassy's spec.",
    url: "https://www.ivisa.com/passport-photo",
    affiliate: true,
    globalAvailable: true,
    cta: "Order photos",
  },
  {
    id: "pp-snapfish",
    category: "passport_photos",
    provider: "Snapfish Passport Photos",
    description:
      "Print-from-home or store pickup at major US/UK pharmacy partners. Useful when you need physical prints same-day for an embassy appointment.",
    url: "https://www.snapfish.com/passport-photos",
    affiliate: true,
    globalAvailable: false,
    destinationIso2List: ["US", "GB"],
    cta: "Order prints",
  },
  {
    id: "pp-walgreens-us",
    category: "passport_photos",
    provider: "Walgreens Passport Photos",
    description:
      "Walk-in printed passport photos meeting US Department of State specs at any Walgreens store nationwide. Same-day pickup, no appointment.",
    url: "https://www.walgreens.com/topic/photo/passport_photos.jsp",
    affiliate: false,
    globalAvailable: false,
    passportIso2List: ["US"],
    destinationIso2List: ["US"],
    badge: "value",
    feeNote: "~$17 for two prints",
    cta: "Find a store",
  },
  {
    id: "pp-boots-uk",
    category: "passport_photos",
    provider: "Boots Photo (UK)",
    description:
      "UK high-street option meeting His Majesty's Passport Office spec. Same-day digital + physical prints; the digital file can be used for online UK passport renewals.",
    url: "https://www.boots.com/passport-photos-bps-00027",
    affiliate: false,
    globalAvailable: false,
    passportIso2List: ["GB"],
    destinationIso2List: ["GB"],
    badge: "value",
    cta: "Find a Boots store",
  },
  {
    id: "pp-passportphotoexpress-au",
    category: "passport_photos",
    provider: "Australia Post Passport Photos",
    description:
      "Australia Post outlets deliver DFAT-compliant passport photos with print + digital file. Required for AU passport renewals and most embassy applications inside Australia.",
    url: "https://auspost.com.au/travel-id/passport-photos",
    affiliate: false,
    globalAvailable: false,
    passportIso2List: ["AU"],
    badge: "value",
    cta: "Find an outlet",
  },
];
