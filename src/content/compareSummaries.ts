/**
 * Hand-written narrative summaries for the highest-traffic passport-pair
 * comparisons. Replaces the generic "Side-by-side passport strength..."
 * paragraph that previously rendered identically on every /compare/[a]/[b]
 * page.
 *
 * Each curated entry picks a thesis (e.g. "Singapore beats Hong Kong for
 * global access but loses on tax friendliness"), names 3-5 specific
 * differences (one of which is a long-stay or working-holiday
 * differentiator), and ends with a "who picks which" recommendation.
 *
 * Keys are alphabetically-sorted ISO2 pairs joined by `:` (e.g. "GB:SG").
 * The lookup helper checks both orderings so the URL order doesn't matter.
 *
 * For pairs without a curated entry, see compareSummaryGenerate() — it
 * reads the live coverage delta and emits varied data-driven prose.
 */
import type { CoverageSnapshot } from "@/lib/coverage";
import { nameFor } from "@/lib/countries";

const CURATED: Record<string, string> = {
  "GB:SG": `Singapore beats the UK on raw mobility — ~195 destinations open vs ~190 for British passport holders — but the headline numbers conceal where each pulls ahead. The UK opens up the Commonwealth working-holiday network (Australia, New Zealand, Canada, Japan, South Korea) on more flexible terms; Singapore wins on tax-residency friendliness (24% top rate vs UK's 45%, no capital gains in most cases). Long-stay-wise, the UK has Skilled Worker as a points-light employer-sponsored route; Singapore's Employment Pass is highly selective (the COMPASS points framework added 2023). Pick UK if you're optimising for residency-to-citizenship under 6 years; pick Singapore if you're optimising for short-haul Asian mobility and lower tax.`,

  "HK:SG": `Hong Kong and Singapore both run from the top tier of global mobility — but their underlying realities are diverging. Singapore (~195 destinations visa-free) keeps a slight lead over Hong Kong (~170) post-2020. The bigger differentiator is residency: Hong Kong now has the BN(O) visa creating a UK exit path for eligible Hongkongers, while Singapore's PR via Employment Pass remains tightly merit-based. For long-stay, Hong Kong is increasingly used as a tax-optimised stopover (17% top rate, territorial tax); Singapore's COMPASS-framework Employment Pass is harder to qualify for but supports more direct PR progression. Pick HK for tax efficiency without immigration uncertainty; pick Singapore if PR-and-citizenship trajectory matters more.`,

  "US:GB": `The US and UK passports both sit in the global top tier but their long-stay routes serve very different applicant profiles. US passport holders gain access to the E-1/E-2 treaty network covering ~80 countries with simplified investor/trader routes; UK passport holders get the post-Brexit reality of 90-in-180 Schengen short stay plus ETIAS from late 2026. For employment-sponsored visas, the US H-1B is lottery-gated and hard to plan around; the UK Skilled Worker has no cap but a £38,700 salary floor (April 2024). On family/spouse, the UK route is faster (typically 12-18 months) and explicitly recognises civil partnerships; the US K-1/CR-1 pipeline takes 12-24 months with significant cost. Pick US if employer-sponsored work + treaty-investor access matters; pick UK if family / civil-partnership routes + EU proximity matter.`,

  "US:CA": `The US and Canadian passports both grant top-tier mobility with the wrinkle that Canada is in the global top-5 for ease of subsequent immigration. Canadian passport holders enjoy the CUSMA professional-list (TN visa to the US, simpler than H-1B) while US passport holders enjoy the Canadian Working Holiday IEC for under-35s. On long-stay, Canada's Express Entry is the most accessible point-based skilled-migration system globally; the US has no equivalent — every route is employer-sponsored or family-based. On taxation, the US worldwide tax obligation follows citizens everywhere; Canadian tax-residence ends when you leave. Pick US if employer-sponsored tech work + dual-intent visas matter; pick Canada if you're optimising for self-sufficient skilled migration without an employer sponsor.`,

  "DE:FR": `Germany and France both grant EU freedom of movement and similar Schengen mobility. The differentiator is long-stay and work-route shape: Germany's EU Blue Card has a clean €43,800 (shortage) / €48,438 (regular) salary path with 33-month PR fast-track; France's Talent Passport is more category-rich (Salarié Qualifié, Investisseur, Talent Mission) at a lower €43,243 threshold but the underlying labour-market test is more discretionary. On tax, Germany's progressive scale tops out at 45% with social-security around 20%; France's top rate hits 45% sooner with higher social contributions (~22%). On citizenship, post-2024 German reform makes 5-year naturalisation possible with B1 German + integration; French citizenship typically 5 years (2 for spouses) with B1 French. Pick Germany for tech/engineering and Blue Card progression; pick France for sector-specific Talent Passport categories.`,

  "AU:NZ": `Australia and New Zealand passports unlock the Trans-Tasman Travel Arrangement — Australians live and work in NZ indefinitely and vice versa, no permits. Outside Trans-Tasman: New Zealand's recent Skilled Migrant Category 2024 reform created a tighter 6-point system; Australia's points-based 189/190 remains accessible at 65+ points but the labour-market list is competitive. For working holidays both passports are well-positioned with 30+ bilateral agreements. On living conditions: AU has higher salaries (AUD~$64k median) but higher cost of living than NZ; NZ has the GPI rank-2 safety profile and shorter PR pathway. Pick AU for higher-earner skilled migration and broader employer choice; pick NZ for safety / cost-of-living and faster PR progression.`,

  "ES:PT": `Spain and Portugal both offer the Schengen baseline plus distinct long-stay programmes that have attracted a new wave of remote workers since 2022. Spain's Digital Nomad Visa requires €2,762+/mo from foreign clients and offers Beckham Law tax election (24% flat on Spanish-source income for 4 years); Portugal's D8 requires €3,480+/mo and no longer offers NHR tax benefits (phased out 2024, replaced by limited IFICI). On naturalisation, Spain's Iberoamerican framework grants citizenship after 2 years for Latin American applicants — vs Portugal's 5-year standard (also with CPLP framework for Lusophone applicants). Pick Spain if you're Iberoamerican or care about the Beckham Law tax cap; pick Portugal if you're CPLP / Lusophone or care about cost-of-living differential vs Spain.`,

  "IN:CN": `India and China have radically different passport profiles. China (~85 visa-free destinations) outpaces India (~60) on raw mobility. But the trajectory differs: China's bilateral visa-free agreements expanded sharply 2024-2025 (Thailand, Singapore, several EU members); India's growth has been incremental. On long-stay, Chinese H-1B applicants face 50+ year EB-2/EB-3 green-card backlogs in the US — vs Indian applicants who face the same backlogs but with the H-1B priority date current. For Chinese applicants, EB-5 ($800k+ investment) remains accessible. For UK/CA/AU employer-sponsored migration, both nationalities dominate the cohort but Indians are heavier represented in IT consulting; Chinese applicants more in finance/research. Pick the cheaper / faster passport that fits your visa goal, not on raw mobility alone.`,

  "JP:KR": `Japan and South Korea both rank in the global top-3 for passport strength — ~190 visa-free destinations each. The differences are practical: Japanese passport holders enjoy slightly broader working-holiday access (30+ countries vs ~20 for Korea); Korean passport holders are heavily represented in US H-1B and EU Blue Card programmes. On tax-residence, Japan's flat top rate is 45% (45% with surtax); Korea's is similar. On retirement and long-stay outside Asia, both passports enjoy access to the US E-2 treaty investor visa, EU Blue Card, and Australia Subclass 482. Pick Japan if you're younger and want maximum working-holiday flexibility; pick Korea if you're senior-professional and want employer-sponsored migration shapes.`,

  "BR:MX": `Brazil and Mexico both run from the second tier of passport strength globally — strong Latin American + EU access, but US visa-required. Brazilian passport holders enjoy Mercosur full membership (streamlined residency across Argentina/Paraguay/Uruguay) and CPLP framework with Portugal; Mexican passport holders have USMCA business-travel preferences (T-class) and Iberoamerican 2-year naturalisation in Spain. For long-stay outside Latin America, Brazilians use Spain DNV / Portugal D7-D8 / Canada Express Entry; Mexicans use Canada Express Entry / Spain DNV / France Talent Passport. Pick Brazil if you're Lusophone or care about Mercosur residency rights; pick Mexico if you have US bilateral business activities or are pursuing Iberoamerican shortcuts in Spain.`,

  "AR:CL": `Argentina and Chile both sit toward the top of Latin American passport rankings. Chile's passport is stronger on raw mobility (~175 destinations vs Argentina's ~170) and notably includes US Visa Waiver Program (ESTA) — the only South American country in the VWP. Argentine passport holders enjoy Mercosur full membership for South American mobility (Argentine passport is the natural compass for Mercosur residency); Chilean passport holders enjoy more bilateral working-holiday access (Australia, NZ, Germany, France, Japan, Korea). On naturalisation, Argentina is among the most accessible globally (2 years legal residence). Pick Chile if US-bound short trips + working holidays matter; pick Argentina if Mercosur residency + faster naturalisation matter.`,

  "TR:RU": `Turkey and Russia both run from the moderate tier of passport mobility globally but in different geographies. Turkish passport (~120 visa-free or eTA) has stronger Schengen access (visa-required) than Russian (~80 visa-free). Russian passport holders since 2022 have lost much of their previous Schengen access (EU Visa Facilitation Agreement suspended); Turkish nationals still apply for Schengen but with full visa requirements. On long-stay, Turkish citizenship-by-investment via $400k+ real estate is well-established; Russian citizenship-by-investment options have narrowed sharply since 2022 (EU Golden Visa schemes closed to Russians). Pick Turkish passport if optimising for EU access + citizenship by investment; pick Russian passport only if you already hold it — no acquisition path matches Turkish.`,

  "AE:SA": `Emirati and Saudi passports have both risen sharply in mobility rankings since 2018. UAE passport (~180 visa-free) leads Saudi (~85 visa-free). The differentiator is the underlying economic/residence model: UAE's Golden Visa (5/10-year renewable) and Green Visa support outbound mobility of UAE-based expats; Saudi Premium Residency (SAR 800k flat fee or SAR 100k/yr renewable) is newer (2019). For GCC-internal mobility, both passports grant full residence/work rights across Bahrain/Kuwait/Oman/Qatar/UAE/Saudi. Pick Emirati passport if you're acquiring via Golden Visa long-tail; pick Saudi if you have substantial Saudi-business interests.`,

  "PH:VN": `Philippine and Vietnamese passports both run from the moderate tier with most major destinations requiring visa. Philippine passport (~70 visa-free) edges Vietnam (~55) on raw mobility. The bigger difference is bilateral working arrangements: Philippine passport holders have access to Japan-Philippines, Korea-Philippines, and US ESTA-equivalent for OFW programmes; Vietnamese have fewer bilateral working-holiday paths. On long-stay outside Asia, both passports use UK Skilled Worker / Canada Express Entry / Australia Subclass 482 — Philippines is much heavier represented historically in healthcare migration. Pick Philippines if optimising for healthcare migration cohorts; pick Vietnam if you have specific Vietnamese-business or family ties.`,

  "PK:BD": `Pakistani and Bangladeshi passports both rank near the bottom of global mobility — Pakistani (~30 visa-free or VoA) and Bangladeshi (~40 visa-free or VoA). The differentiator is bilateral processing: Pakistani applicants face above-baseline refusal rates for Schengen, UK, Canada, Australia visit visas (30-60% historically); Bangladeshi rates are 20-45%. For long-stay employer-sponsored migration both nationalities dominate the cohort in UK Skilled Worker (healthcare especially), Canada Express Entry, Australia Subclass 482, US H-1B. On family/spouse pipelines into the US, Bangladesh has shorter F-class wait times than Pakistan. Pick the passport you already hold — there's no acquisition path that improves outcomes meaningfully.`,

  "NG:ZA": `Nigerian and South African passports differ significantly. South African (~80 visa-free including UK 6-months and Schengen visa-required) is the strongest African passport after Mauritius and Seychelles. Nigerian (~30 visa-free) is among the most restricted globally — ECOWAS internal mobility is the main strength. On UK/Canada/AU work migration, both nationalities are heavily represented but Nigerian applicants face stricter refusal-rate patterns. For long-stay in the West, Express Entry Canada and Australia Subclass 482 are the established routes for both. Pick South African passport if optimising for Schengen / UK short visits; pick Nigerian only if you already hold it.`,

  "KE:GH": `Kenyan and Ghanaian passports both run from the moderate tier of African mobility. Both enjoy regional EAC / ECOWAS internal mobility (Kenya in EAC; Ghana in ECOWAS) and visa-required entry to most Western destinations. The bigger differentiator is bilateral healthcare migration: Kenyan and Ghanaian nationals are both heavily represented in UK NHS workforce — Kenyan in nursing, Ghanaian in nursing and allied health. On Canadian and Australian migration both passports use the standard Express Entry / 482 routes. Pick whichever passport you already hold; both grant similar visa-application outcomes.`,

  "MX:CO": `Mexican and Colombian passports both sit in the top tier of Latin American mobility. Both grant Schengen visa-free + UK 6 months visa-free + most of Latin America. Mexican passport holders gain USMCA business-travel preferences (T-class to US/Canada); Colombian passport holders have Canada eTA since 2022 (no full visitor visa required). On long-stay, both nationalities use Spain DNV / Portugal D7 / Canada Express Entry / Australia Subclass 482. The Iberoamerican 2-year Spanish citizenship route applies to both. Pick Mexican if US/Canada/USMCA business travel matters; pick Colombian if you want Canada visa-free + Mercosur-Andean association.`,

  "IL:AE": `Israeli and Emirati passports both sit in the global top tier for mobility — but their travel experiences are very different. Israeli passport (~170 visa-free including post-2023 ESTA access to US) is restricted from entry to several Arab/Muslim-majority states (Iran, Iraq, Lebanon, Syria, Yemen, Libya; in practice some others). Emirati passport (~180 visa-free including UK ETA) post-2020 Abraham Accords now has bilateral arrangements with Israel — direct flights and visa-free reciprocal access. For long-stay outside the region, both passports use US E-2 treaty investor (Israel) / UAE Golden Visa pathways. Pick Israeli if you have specific Jewish-heritage Law of Return interest; pick Emirati if you have GCC business ties.`,

  "IT:GR": `Italian and Greek passports both grant EU freedom of movement plus broad visa-free or eTA-only access globally. The differentiator is descent-based citizenship: Italy's jure sanguinis allows descendants of Italian-born ancestors (unbroken citizenship line) to claim Italian citizenship — among the most accessible descent paths globally; Greece's descent path is narrower (3 generations and tighter rules). For long-stay options: Italy has Elective Residence (passive income); Greece has Golden Visa (€250k+ property) and Digital Nomad. On taxation, Italy has a €100k flat tax for non-doms (new residents); Greece has a €100k flat tax for non-doms with worldwide-income shielding for 15 years. Pick Italian if you have Italian heritage or want Elective Residence; pick Greek if you want Golden Visa or non-dom flat tax.`,

  "FR:IT": `France and Italy both grant EU freedom of movement with comparable Schengen mobility. The differentiator is long-stay shape. France's Talent Passport (Passeport Talent) is broader in category coverage — Salarié Qualifié for skilled employees, Talent for researchers/founders/artists, Investisseur for capital. Italy's Italian-descent (jure sanguinis) is among the most accessible globally if you have Italian heritage. On taxation France's progressive rate tops at 45% with high social-security contributions; Italy's flat-tax for non-doms (€100k/yr for new residents) is uniquely attractive for high earners. Pick France if you're a working professional optimising for sector-specific routes; pick Italy if you have Italian heritage or are high-earner exploring tax-residency planning.`,

  "AT:CH": `Austria and Switzerland have very different immigration shapes. Austria is in EU + Schengen — Austrian passport grants standard EU freedom of movement. Switzerland is in Schengen but NOT the EU — Swiss passport holders work in EU under bilateral agreements but as a non-EU national. Austrian Red-White-Red Card is points-based for skilled workers; Swiss work permits are quota-restricted by canton with substantial cantonal discretion. On taxation, Switzerland's cantonal tax (Zug, Schwyz, Nidwalden) is among Europe's lowest; Austrian top rate 55% is among Europe's highest. Citizenship: Austria typically 10 years (6 with exceptional integration); Switzerland 10 years (5 for EU/EFTA). Pick Austrian for EU freedom of movement; pick Swiss for tax efficiency + selective residence quota.`,

  "NL:BE": `Netherlands and Belgium both grant EU freedom of movement with very similar Schengen mobility. The differentiator is long-stay categorisation: Dutch Highly Skilled Migrant scheme has a clean recognised-sponsor model with €5,331/mo (30+) or €3,909/mo (under 30) salary thresholds; Belgian work permits use the regional Combined Permit (Brussels-Capital, Flemish, Walloon) with different income thresholds per region. Dutch DAFT (uniquely available to US nationals — €4,500 equity for entrepreneur visa) is a niche win. On tax, both countries have high progressive rates; Netherlands has the 30% ruling for high-skilled migrants (phased reduction 2024). Citizenship: both 5 years with language tests, generally requiring renunciation of original nationality. Pick Dutch if optimising for highly-skilled migrant clarity + 30% ruling; pick Belgian if working with Brussels-based EU institutions.`,

  "IE:GB": `Irish and UK passports retain a unique relationship via the Common Travel Area — Irish citizens live and work freely in the UK and vice versa, regardless of EU rules. Irish passport grants EU freedom of movement (UK does not since Brexit). On long-stay, the UK Skilled Worker requires £38,700+ salary; Irish CSEP requires €38k-€64k depending on category. On family/spouse routes, both follow similar 5-year residence-to-citizenship paths. On retirement, the UK has the Self-Employment Visa equivalent in Innovator Founder; Ireland's Stamp 0 (long-stay self-sufficient) is more permissive. Pick Irish passport if EU access matters; pick UK if you're optimising for Commonwealth ties or pre-existing UK residence.`,

  "JP:SG": `Japanese and Singaporean passports both sit in the global top 3 for mobility — ~190 destinations visa-free each. The differentiators are practical: Japanese passport holders have stronger working-holiday access (30+ countries); Singaporean passport holders have current EB-2/EB-3 priority dates for US green cards. On long-stay outside Asia: Japanese E-2 treaty investor + EU Blue Card; Singaporean US H-1B / EU Blue Card / Australian 482. On the home front: Singapore's tax efficiency (24% top rate, 17% corporate, territorial) is materially better than Japan's (45% top rate). Pick Japanese if you're younger and want maximum working-holiday flexibility; pick Singaporean if you're senior-professional or care about home-base tax efficiency.`,

  "KR:TW": `Korean and Taiwanese passports both rank in the global top tier (~190 visa-free for Korea, ~145 for Taiwan). Korea has the K-ETA system requiring most visa-exempt entries; Taiwan has no equivalent on outbound side. For US-bound mobility both nationalities are in VWP (ESTA). Taiwanese Employment Gold Card is a unique long-stay outbound product (combining work permit + residence + 4-in-1 efficiency) attracting cross-Strait professionals. On Mainland China, Korean passport holders use standard Chinese visa rules; Taiwanese use the Mainland Travel Permit (台胞证) — distinct from foreign visa system. Pick Korean if optimising for K-ETA-driven outbound efficiency; pick Taiwanese if Cross-Strait or Gold-Card-eligible business activities matter.`,

  "ZA:KE": `South African and Kenyan passports differ significantly. South African (~80 visa-free) is the strongest African passport after Mauritius/Seychelles — UK 6 months visa-free + Hong Kong 30 days + most of Latin America. Kenyan (~75 visa-free or VoA) leads on Indian Ocean and EAC mobility but visa-required for UK / Schengen / Canada / Australia. On long-stay, both nationalities are heavily represented in UK Skilled Worker (healthcare especially) and Canada Express Entry. Pick South African if UK / Schengen visit-frequency matters; pick Kenyan if EAC business or East African ties matter.`,

  "PT:ES": `Portuguese and Spanish passports both grant EU freedom of movement plus broad visa-free or eTA-only access. The differentiator is long-stay shape outside Europe. Portuguese citizens enjoy CPLP framework with Brazil, Angola, Mozambique etc.; Spanish citizens enjoy Iberoamerican framework with Argentina, Mexico, Colombia etc. Both reduce naturalisation timelines for the linked nationalities — but Portuguese applicants in Brazil after 1 year of residence; Spanish applicants in Iberoamerican states after 2 years. On taxation: Portugal's NHR ended 2024 (IFICI replacement is limited); Spain's Beckham Law remains active for new residents. Pick Portuguese if you have Lusophone-region intentions; pick Spanish if you have Iberoamerican family or business ties.`,

  "DE:NL": `German and Dutch passports both grant EU freedom of movement with very similar Schengen access. Differentiators: Germany's EU Blue Card pathway has a 33-month PR fast-track for high-skilled migrants; Netherlands' Highly Skilled Migrant scheme has a clean recognised-sponsor model with the Search Year and 30% tax-ruling. For US-based expats, Dutch DAFT (US-citizen-only €4,500 equity entrepreneur visa) is a unique tool. On taxation, both have progressive rates around 49-50%; Germany's social-security contribution is lower than Netherlands' but Netherlands has the 30% ruling. Citizenship: Germany 5 years post-2024 reform; Netherlands 5 years (3 for spouses) with renunciation. Pick German for Blue Card fast-track; pick Dutch for Highly Skilled Migrant + Search Year + 30% ruling.`,
};

/**
 * Try both orderings — URLs may be /compare/a/b OR /compare/b/a, both
 * should hit the same curated narrative when one exists.
 */
export function curatedComparisonFor(aIso: string, bIso: string): string | null {
  const A = aIso.toUpperCase();
  const B = bIso.toUpperCase();
  return CURATED[`${A}:${B}`] ?? CURATED[`${B}:${A}`] ?? null;
}

// ---------------------------------------------------------------------------
// Data-driven generator for non-curated pairs.
// ---------------------------------------------------------------------------

export function generateComparisonSummary(
  aIso: string,
  bIso: string,
  coverageA: CoverageSnapshot | null,
  coverageB: CoverageSnapshot | null,
): string {
  const aName = nameFor(aIso);
  const bName = nameFor(bIso);
  if (!coverageA || !coverageB) {
    return `Compare ${aName} and ${bName} passports side by side — visa access, eTA coverage, embassy requirements, and the practical differences across visa types. Specific data populates as our adapters resolve coverage for both passports.`;
  }
  const aOpen = coverageA.byStatus.visa_free + coverageA.byStatus.visa_free_with_eta;
  const bOpen = coverageB.byStatus.visa_free + coverageB.byStatus.visa_free_with_eta;
  const aTotal = coverageA.totalDestinationsCovered;
  const bTotal = coverageB.totalDestinationsCovered;
  const delta = aOpen - bOpen;
  const leader = delta > 0 ? aName : delta < 0 ? bName : null;
  const lagger = delta > 0 ? bName : delta < 0 ? aName : null;
  const lead = Math.abs(delta);

  const parts: string[] = [];

  if (leader && lagger) {
    parts.push(
      `${leader} passport opens ${lead} more destinations visa-free or eTA-only than ${lagger} (${aName}: ${aOpen}/${aTotal}; ${bName}: ${bOpen}/${bTotal}).`,
    );
  } else {
    parts.push(
      `${aName} and ${bName} passports are evenly matched on visa-free count (${aOpen} each). The differences land in long-stay categories rather than headline mobility.`,
    );
  }

  // Embassy-visa delta — opens framing of relative friction.
  const aEmbassy = coverageA.byStatus.embassy_visa;
  const bEmbassy = coverageB.byStatus.embassy_visa;
  if (Math.abs(aEmbassy - bEmbassy) >= 5) {
    const moreEmbassy = aEmbassy > bEmbassy ? aName : bName;
    const fewerEmbassy = aEmbassy > bEmbassy ? bName : aName;
    parts.push(
      `${moreEmbassy} requires an embassy-issued visa for ${Math.abs(aEmbassy - bEmbassy)} more destinations than ${fewerEmbassy} — practical friction adds up across travel patterns.`,
    );
  }

  // Work coverage delta — names long-stay differentiation if material.
  const aWork = coverageA.byPurpose.work;
  const bWork = coverageB.byPurpose.work;
  if (aWork + bWork >= 5) {
    parts.push(
      `On work-route coverage: ${aName} has ${aWork} indexed work options; ${bName} has ${bWork}. Sector and employer-sponsorship paths matter more than count — see the route pages for each destination.`,
    );
  }

  parts.push(
    `Pick the passport whose long-stay regime fits your situation: tax-residency, family-reunification options, and citizenship timelines vary more meaningfully than headline mobility scores.`,
  );

  return parts.join(" ").replace(/\s+/g, " ").trim();
}
