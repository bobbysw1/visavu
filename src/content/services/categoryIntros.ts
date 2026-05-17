/**
 * Long-form editorial framing for each of the 7 service categories.
 *
 * The /services/[category] page previously rendered a provider grid with
 * only the short tagline / description from src/lib/services.ts. That
 * thin-content shape didn't justify the page existing — Google would
 * deprioritise pages that are 90% affiliate cards with no editorial
 * substance.
 *
 * Each entry below adds: 200-400 word intro (what the service does, who
 * needs it, how to choose), a "how we picked" methodology note, and a
 * "when you don't need this" honesty section. Renders above the provider
 * grid via CategoryEditorialFraming.
 */
import type { ServiceCategory } from "@/lib/services";

export type CategoryIntro = {
  longIntro: string;
  howWePicked: string;
  whenYouDontNeedThis: string;
};

export const CATEGORY_INTROS: Record<ServiceCategory, CategoryIntro> = {
  travel_insurance: {
    longIntro:
      "Travel insurance is short-stay, single-trip cover for the most common travel risks: medical emergencies abroad, evacuation and repatriation, baggage loss, and trip cancellation. For most short visits — under 60 days, no work, no extended residence — a travel-insurance policy from a reputable insurer is the right tool. " +
      "Many destinations require proof of medical-coverage at port of entry (Schengen states demand minimum €30,000 of medical cover; the UAE, Indonesia, Cuba, and others have their own minimums). Several embassy visa applications — Schengen Type C, Russian tourist, Saudi e-Visa, Indian e-Visa for some nationalities — require the policy upfront with the application. " +
      "Pick coverage based on (1) trip duration and destinations, (2) activities (skiing, diving, hiking above 4,500m all push you into specialist riders), (3) medical-cover ceiling (€100,000+ for the US given hospital costs; €30,000+ for Schengen baseline), and (4) age-banded pricing (premiums climb sharply over 70 in most insurers' tables). " +
      "Standard exclusions to read carefully: pre-existing conditions (often requires declaration and a surcharge), pregnancy beyond the second trimester, extreme sports, alcohol-related incidents, and acts during civil unrest in countries with active advisories.",
    howWePicked:
      "The providers below were selected on (a) reputable underwriter (avoid white-label resellers without a named insurer), (b) clear and accessible claims process — published email + UK/EU office hours rather than chatbot-only support, (c) coverage compliant with the most common visa-application requirements (Schengen €30,000 medical, evacuation included, civil-liability cover), and (d) transparent pricing without per-day surcharge hidden in the fine print. " +
      "We earn a commission on most cards marked Sponsored — see the Disclosure for the full commercial policy.",
    whenYouDontNeedThis:
      "If you're a citizen of a country with reciprocal healthcare in your destination (e.g. UK to EU via GHIC, Australia to UK via RHCA), short-trip travel insurance is still useful for cancellation / baggage / evacuation but the medical-cover line is largely duplicated. " +
      "If your existing employer / credit card provides comprehensive travel cover (some platinum-tier cards include up to $250k medical + trip-interruption), don't double-pay — verify the card policy covers the trip duration and destinations first. " +
      "If you're moving long-term (>90 days at destination, work visa, residence application), travel insurance is the wrong product — you need international health insurance instead (next category over).",
  },

  health_insurance: {
    longIntro:
      "International health insurance is long-term private medical cover designed for expats, digital nomads, and long-stay visa-holders. Annual or multi-year policies covering inpatient and outpatient care across multiple countries, typically with worldwide-excluding-USA or worldwide-including-USA tiers (the US adds 40-70% to the premium). " +
      "Mandatory for most long-stay visa categories that don't yet entitle you to the destination's state healthcare: Spain Digital Nomad Visa, Portugal D7 and D8, France Talent Passport, Italy Elective Residence, Greek Digital Nomad, Costa Rican Rentista, and most retirement-pathway visas in Latin America. " +
      "Pick coverage based on (1) duration and geographic scope, (2) inpatient versus full inpatient+outpatient+dental tier, (3) annual medical-cover ceiling (€500k+ is typical for global cover, $1M+ for US-inclusive), (4) direct-billing networks in your destination cities (saves substantial cash-flow on hospital visits), and (5) age-banded pricing (premiums rise sharply over 60). " +
      "Pre-existing conditions usually require declaration and a moratorium period or surcharge. Maternity cover is often a separate add-on with a 10-12 month qualifying period before claims pay out.",
    howWePicked:
      "The providers below were selected on (a) recognised global underwriter (Cigna, Allianz, IMG, AXA, Bupa Global — avoid lower-rated local insurers for long-stay), (b) direct-billing network coverage in the cities our users most-commonly relocate to (Lisbon, Madrid, Barcelona, Paris, Berlin, Amsterdam, Dubai, Bangkok), (c) policy structures compatible with the long-stay visa requirements they're commonly used to satisfy (matching the language of the visa's insurance clause), and (d) transparent pricing — annual premium quoted upfront, not gated behind a 30-minute sales call. " +
      "We earn a commission on most cards marked Sponsored.",
    whenYouDontNeedThis:
      "If you're moving to an EU country and you qualify for the destination's state healthcare from day 1 (Spanish convenio especial, French CPAM, German statutory insurance via employer), public coverage may suffice — supplemented by a small private top-up if you want faster appointments. " +
      "If your destination is the US and your employer provides comprehensive group coverage, don't double-pay. " +
      "If you're a short-stay tourist (under 90 days), travel insurance (previous category) is the right product — international health insurance is overkill and you'd pay 5-10× more for cover you don't use.",
  },

  vaccinations: {
    longIntro:
      "Required and recommended vaccinations for your destination — country-by-country guidance from the CDC, the UK's NHS Fit for Travel, the WHO, and other national health authorities. Some destinations require Yellow Fever certificates at port of entry if you've been in or transited an infected area (most of Sub-Saharan Africa and tropical South America). Some long-stay routes require specific vaccinations as part of the visa application itself (Australian Subclass 482 / 186 requires the medical including TB screen; UK Spouse visa requires TB testing from listed countries). " +
      "Common recommendations beyond your routine childhood schedule: Hepatitis A (all of Latin America, Sub-Saharan Africa, South / Southeast Asia), Hepatitis B (longer stays), Typhoid (rural travel in endemic regions), Rabies (longer stays or wildlife-adjacent work), Cholera (specific outbreaks), Japanese Encephalitis (rural Asia), Tick-borne Encephalitis (rural Europe and Russia). " +
      "Plan ahead — most vaccines need 4-12 weeks to confer full immunity, and some series require multiple doses spaced over months. The Yellow Fever vaccine takes 10 days post-vaccination before the certificate is accepted at port.",
    howWePicked:
      "The resources below are official national-health-authority sites — CDC Yellow Book, NHS Fit for Travel, Australia's Smartraveller. We don't recommend specific clinics or commercial vaccination services because the public-sector and reputable travel-medicine clinics in each country are the appropriate channel. We deliberately don't take affiliate commission on vaccinations — health information should not be commercially incentivised.",
    whenYouDontNeedThis:
      "If you're travelling to a country with similar disease ecology to your home (e.g. UK to Western Europe, US to Canada), your routine childhood vaccinations + a current flu shot is typically sufficient. Check the official guidance for your specific itinerary; over-vaccinating is mostly a waste of money but rarely harmful. " +
      "If you're already up to date on Hepatitis A+B, Typhoid, and Tetanus boosters, most additional vaccines are situational — you don't need Japanese Encephalitis for a 3-day Tokyo trip, you don't need Rabies for a beach week in Bali.",
  },

  biometrics: {
    longIntro:
      "Biometric appointments are the visa-application-centre stage of most modern visa processes — fingerprints, facial photograph, and (for some routes) an in-person identity confirmation. Run by VFS Global, TLScontact, BLS International, or the destination's own consular section depending on the country-pair. " +
      "Most Schengen, UK, US, Australian, Canadian, and many other visa applications now require biometrics. Slots are often scarce in high-volume corridors (Schengen visa applications from India, UK ETA-compliant biometrics from Pakistan, Australian biometrics from Vietnam) — book the appointment as soon as your visa application is submitted, not after. " +
      "Pick the appointment based on (1) location convenience (some countries have only one or two VAC cities — plan the travel), (2) appointment-window availability (premium / VIP slots cost more but unlock same-week appointments where standard is 6-12 weeks out), and (3) any required pre-arrival document checks the VAC offers.",
    howWePicked:
      "The links below go directly to the official biometric service operator for each country-pair (VFS Global, TLScontact, BLS International, or the embassy's own appointment system) — we don't list intermediaries. Visa-application-centre operators are not affiliate partners; their fee schedule is set in their contract with the issuing government. We earn no commission on these links.",
    whenYouDontNeedThis:
      "Biometric-exempt categories are narrowing each year, but some still apply: diplomatic and official passport holders, children under 6 (varies by destination), some renewals within 5 years of prior biometrics (interview-waiver exemptions in the US, fingerprint-on-file in the UK). Check your specific visa category before booking — booking an appointment you don't need is non-refundable.",
  },

  medical_checks: {
    longIntro:
      "Medical-check requirements vary widely by destination and visa category. Long-stay visas in Australia, Canada, New Zealand, the UK (for Tier 4 students from listed countries), the UAE, and Saudi Arabia all require a medical exam at an approved panel physician — not your local GP. The exam typically includes chest X-ray (TB screen), blood tests (HIV, syphilis, hepatitis), urine analysis, BMI / blood pressure, and a physician interview. " +
      "The exam validity is typically 12 months from the date of issuance — plan it within the visa-application window. Some destinations require electronic submission via eMedical or HAP; others issue a sealed envelope you bring to the embassy. " +
      "Pick the panel physician based on (1) location convenience (some countries have one panel physician per region, others have many), (2) the destination's approved-clinic list (you cannot substitute a non-listed clinic), and (3) appointment availability — premium slots cost more but unlock faster turnarounds.",
    howWePicked:
      "The links below go to the destination's official approved-panel-physician list. Visa-application medical exams must be done at a listed physician; results from any other doctor will be rejected. We do not recommend specific clinics directly because the destination's approved list is the authoritative source. We earn no commission on these links.",
    whenYouDontNeedThis:
      "Short-stay visitor visas (Schengen Type C, B-1/B-2, US ESTA, most other short-stay routes) do not require a medical exam. Some long-stay routes only require medical for applicants over 75 or with specific occupational risk profiles (e.g. UK Tier 4 TB screening only for nationals from listed countries). Check your specific visa category before booking — the medical exam costs $200-500 and is non-refundable.",
  },

  passport_photos: {
    longIntro:
      "Passport-format photos are required for virtually every visa application. Each issuing authority has subtly different specifications — head size, background colour, file format, expression, glasses policy. A photo that's perfect for a US visa is often rejected for a Schengen application; a Chinese visa photo has different background requirements again. " +
      "Pick a service based on (1) destination-specific compliance (does the service have templates for the specific issuing authority?), (2) format delivery (digital file for online applications, printed for in-person submission, or both), (3) regeneration policy (if the embassy rejects the photo, can the service regenerate at no charge?), and (4) speed (instant for digital; same-day or next-day for printed).",
    howWePicked:
      "The providers below all offer specific-country templates (US visa, Schengen, UK, Canadian, Chinese, Indian, etc.) with explicit compliance guarantees — if a passport-issuing authority rejects the photo, the service regenerates at no charge. We selected providers with transparent pricing (no surprise per-photo upcharges) and digital + printed delivery options.",
    whenYouDontNeedThis:
      "If you have a recent passport-format photo from a prior application and it matches the destination's specs, you don't need a new one. If you're applying via an in-person visa application centre that offers on-site photo capture (most VFS Global / TLScontact centres do), it's often cheaper than buying a digital file separately. Check the centre's website before paying for a separate photo service.",
  },

  legal_services: {
    longIntro:
      "Immigration lawyers, accountants, and other professional service providers for the more complex cases. Most standard visa applications — Schengen Type C, US ESTA, UK ETA, Canadian eTA, Australian eVisitor, simple work-permit transfers via a Big Tech employer — can be handled DIY by anyone willing to read the official guidance carefully. " +
      "Hire a lawyer when: (a) you have a prior visa refusal anywhere globally, (b) you have a complex civil-status history (multiple prior marriages, adoptions, name changes), (c) you're applying for investor or entrepreneur visas with corporate structures, (d) you need EB-1A / O-1 / extraordinary-ability self-petition, (e) you have a criminal record or inadmissibility concerns, or (f) you're navigating an active legal-process visa case (asylum, withholding, removal proceedings). " +
      "Accountants matter when you're crossing tax-residence boundaries — most long-stay visas (Spanish DNV, Portuguese D7/D8, French Talent Passport, US H-1B for high earners) come with cross-border tax implications that benefit from professional planning in the first 12 months. " +
      "Pick advisors based on (1) jurisdictional licensing (US-licensed immigration lawyers via AILA; UK OISC-regulated; Canadian RCIC; Australian MARA-registered), (2) specialism in your specific visa category (not all immigration lawyers do all visas), and (3) transparent fee structure (flat fee per matter, not hourly without a cap).",
    howWePicked:
      "The providers below were selected on (a) appropriate jurisdictional licensing for the visa categories they cover, (b) clear specialism focus (we list family-visa lawyers separately from EB-5 specialists from cross-border tax accountants), (c) flat-fee transparency where possible, and (d) consistent client feedback over time. " +
      "We earn a commission on most cards marked Sponsored. We do not list 'visa concierge' or generic 'relocation services' that don't have specific professional licensing — those are typically white-label intermediaries.",
    whenYouDontNeedThis:
      "If your visa category is well-trodden and well-documented (UK Skilled Worker via a recognised employer, Express Entry Canada with clean credentials, US H-1B via a Fortune 500 employer where the company's immigration team handles end-to-end, Spanish DNV with clean W-2 income evidence), the application is genuinely self-serve and a lawyer adds cost without proportional value. Read the official guidance, prepare carefully, and submit yourself.",
  },
};

export function categoryIntroFor(category: ServiceCategory): CategoryIntro {
  return CATEGORY_INTROS[category];
}
