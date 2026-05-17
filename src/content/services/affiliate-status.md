# Affiliate-programme registration status

Per-partner tracking of where each provider sits in the registration pipeline.
Until a partner-issued ID lands, `affiliateUrl()` falls back to the generic
`ref=visavu` placeholder — drop the real token in the service record's
`partnerRefValue` field when status moves to LIVE.

## Status legend

- **PENDING** — application submitted; awaiting approval
- **APPROVED** — partner approved; awaiting first-payment / final tracking
  setup
- **LIVE** — partner-issued ID active; `partnerRefValue` set on the service
  record

## Travel insurance

| Provider | Status | Param shape | Notes |
| --- | --- | --- | --- |
| SafetyWing | PENDING | `?ref_id=<id>&Subid1=<route>` | Apply via safetywing.com/partners |
| World Nomads | PENDING | `?aff=<id>` | Apply via worldnomads.com/Affiliate |
| AXA Travel | PENDING | TBD | UK contact via partnerships |
| Allianz Travel | PENDING | TBD | Subject to underwriter region |

## International health insurance

| Provider | Status | Param shape | Notes |
| --- | --- | --- | --- |
| Cigna Global | PENDING | TBD | Apply via cignaglobal.com/partners |
| GeoBlue | PENDING | TBD | Subject to US licensing constraints |
| IMG | PENDING | TBD | Apply via imglobal.com/agents |
| Allianz Care | PENDING | TBD | Per-region partner programmes |

## Vaccinations

Affiliate not pursued — health information should not be commercially
incentivised. All vaccination links route to CDC / NHS Fit for Travel /
authorised travel clinics with no ref parameter.

## Biometrics

Affiliate not pursued — VFS Global / TLScontact / BLS International are
operated under government contract with no public affiliate programme. All
biometrics links route directly to the official VAC scheduling URL.

## Medical checks

Affiliate not pursued — panel-physician lists are issued by destination
governments and have no commercial affiliate channel. All links route to
the destination's official approved-panel list.

## Passport photos

| Provider | Status | Param shape | Notes |
| --- | --- | --- | --- |
| AiPassportPhotos | PENDING | `?ref=<id>` | Apply via aipassportphotos.com/affiliate |
| PhotoAID | PENDING | TBD | Apply via photoaid.com/partners |

## Legal services

| Provider | Status | Param shape | Notes |
| --- | --- | --- | --- |
| Boundless Immigration | PENDING | TBD | US-focused; subject to legal-services regulation |
| 1040Abroad | PENDING | TBD | US expat tax; partner programme TBC |
| GreenbackTaxServices | PENDING | TBD | US expat tax |
| Sleek (Singapore) | PENDING | TBD | SG company / immigration |

## Travel-adjacent (shown in TravelAdjacentRail)

| Provider | Status | Param shape | Notes |
| --- | --- | --- | --- |
| Airalo (eSIMs) | PENDING | `?ref=<id>&utm_country=<iso>` | Apply via partners.airalo.com |
| Kiwi.com (flights) | PENDING | `?ref=<id>` | Apply via kiwi.com/affiliates |
| Booking.com (hotels) | PENDING | `?aid=<id>&label=<route>` | Apply via partner.booking.com |

## FTC / ASA disclosure

Every affiliate-linked card on Visavu renders the "Sponsored" sub-label
under the partner name, and the global /disclosure page explains the
commercial relationship. Disclosures comply with US FTC 16 CFR Part 255
("Guides Concerning Use of Endorsements and Testimonials"), UK ASA CAP
Code Section 22 ("Affiliate marketing"), and equivalent guidance in
Canada, Australia, and EU member states.
