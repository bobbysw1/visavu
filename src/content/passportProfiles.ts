/**
 * Per-applicant passport profile — what an applicant from THIS nationality
 * actually does to satisfy generic visa-application steps.
 *
 * The architectural problem this solves:
 *   Most visa categories require "police clearance certificate", "apostilled
 *   birth certificate", "certified translation" — generic phrasings that hide
 *   the country-specific reality. A British applicant uses ACRO, an American
 *   uses the FBI Identity History Summary Check, an Indian uses the PCC at
 *   the Passport Seva Kendra. Cost, processing time, and submission process
 *   all differ. Without this overlay the route page reads identically for
 *   every nationality — which is misleading.
 *
 * How it's used:
 *   1. Surfaced on /[passport]/[destination] pages as a "For your
 *      documentation:" panel below the visa requirements.
 *   2. Injected into the AI chat context so synthesised answers reference
 *      the right process for the applicant's nationality.
 *   3. Powers the documents checklist on individual visa-route pages.
 *
 * Coverage target: top 20 applicant nationalities (covers ~80% of traffic).
 * Long-tail nationalities fall back to a generic "Police clearance from
 * your country's police authority" wording on the route page.
 *
 * Source-of-truth: each entry cites primary government / agency URLs. The
 * data is what an APPLICANT does to GET each document — the visa-destination
 * country's requirements live separately in the per-visa adapter spec.
 *
 * Refresh quarterly. Background-check fees / processing times revise.
 */

export type PassportProfile = {
  /** ISO2 of the applicant's passport-issuing country. */
  iso2: string;
  /** Display name ("United Kingdom"). */
  country: string;
  /** Preferred display currency for the applicant. */
  preferredCurrency: string;
  /** Police-clearance / background-check process. */
  backgroundCheck: {
    name: string;
    issuer: string;
    url: string;
    fee?: string;
    processingTime?: string;
    notes?: string;
  };
  /** Apostille / legalisation process for foreign documents. */
  apostille: {
    issuer: string;
    url: string;
    fee?: string;
    processingTime?: string;
    /** True if this country is a Hague Apostille signatory — most are.
     *  Non-signatories use embassy legalisation (more steps, slower). */
    hagueSignatory: boolean;
    notes?: string;
  };
  /** Tax-records availability — many visas need recent tax filings. */
  taxRecords: {
    name: string;
    issuer: string;
    url: string;
    notes?: string;
  };
  /** Sworn / certified translator landscape for visa-document translation. */
  translation: {
    accreditation: string;
    notes: string;
  };
  /** Where the destination's consulates typically sit for this applicant. */
  consulateGeography: string;
  /** Notable identity / civil documents most non-EU long-stay visas request. */
  standardCivilDocuments: string[];
  /** Country-specific quirks for visa applications generally. */
  generalNotes?: string;
};

export const PASSPORT_PROFILES: Record<string, PassportProfile> = {
  // ─── United Kingdom ───
  GB: {
    iso2: "GB",
    country: "United Kingdom",
    preferredCurrency: "GBP",
    backgroundCheck: {
      name: "ACRO Police Certificate",
      issuer: "ACRO Criminal Records Office",
      url: "https://www.acro.police.uk/",
      fee: "£59 (Standard, 10-day)",
      processingTime: "10 working days standard; 2 working days premium (£99)",
      notes: "Covers Police National Computer + force records. Required for most Schengen long-stay, Australian PR, Canadian Express Entry, NZ residence, US adjustment of status.",
    },
    apostille: {
      issuer: "FCDO Legalisation Office (Foreign, Commonwealth & Development Office)",
      url: "https://www.gov.uk/get-document-legalised",
      fee: "£45 (Standard, 2-day) / £75 (Premium same-day)",
      processingTime: "2 working days standard; same-day premium at Milton Keynes office",
      hagueSignatory: true,
      notes: "UK joined Hague Apostille 1965. Documents must be notarised by a UK solicitor / notary public FIRST, then sent to FCDO. Online tracking + courier return available.",
    },
    taxRecords: {
      name: "SA302 Tax Calculation + Tax Year Overview",
      issuer: "HMRC",
      url: "https://www.gov.uk/sa302-tax-calculation",
      notes: "SA302s download free from HMRC online portal. Most consulates accept the SA302 + Tax Year Overview pair as proof of self-employment income for the last 3 years.",
    },
    translation: {
      accreditation: "ITI / CIOL Member or sworn translator for the destination's legal system",
      notes: "For Spanish NLV, Italian Elective, Portuguese D7, French long-stay: use a translator on the destination consulate's approved list (consulado.uk / it.esteri.it / lisbon.gov.uk). For US: ATA-certified translator OR certified statement of accuracy.",
    },
    consulateGeography: "Most embassies in London (Belgravia / Mayfair). Spanish + Italian + Portuguese have additional consulates in Edinburgh + Manchester. Australian + NZ + Canadian use VFS Global / TLScontact centres.",
    standardCivilDocuments: [
      "Full UK passport (not provisional) — issued within 10 years for Schengen entry",
      "UK driving licence or BRP (Biometric Residence Permit) for non-UK-born residents",
      "Council tax bill / utility bill in your name (address proof, within 3 months)",
      "Bank statements (UK high-street bank, certified copy if asked)",
      "Original birth certificate (long-form, with parents' details — for citizenship-by-descent applications)",
      "Marriage certificate (long-form, with parents' details)",
    ],
    generalNotes: "Post-Brexit British applicants are 'third-country nationals' for EU long-stay routes — no preferential treatment vs Americans, Australians etc. Some EU member states still offer streamlined processing for British applicants (Spain, Portugal, France in particular).",
  },

  // ─── United States ───
  US: {
    iso2: "US",
    country: "United States",
    preferredCurrency: "USD",
    backgroundCheck: {
      name: "FBI Identity History Summary Check",
      issuer: "FBI Criminal Justice Information Services",
      url: "https://www.fbi.gov/services/cjis/identity-history-summary-checks",
      fee: "USD $18 (direct from FBI); USD $50-100 via FBI-Approved Channeler",
      processingTime: "Direct: 4-6 weeks. Channeler-processed: 1-3 business days. Channelers (e.g. Accurate Biometrics, Daon, IdentoGO) recommended for time-sensitive visa applications.",
      notes: "Required for most non-Common-Travel-Area long-stay visas — Schengen NLV/D7/Elective, Mexican Permanent Resident, Australian PR, Canadian Express Entry, NZ residence.",
    },
    apostille: {
      issuer: "State Secretary of State (state-issued documents) OR US Department of State (federal documents)",
      url: "https://travel.state.gov/content/travel/en/records-and-authentications/authenticate-your-document.html",
      fee: "Varies by state: e.g. NY $10, CA $20, TX $15, FL $10; Federal $8 per document",
      processingTime: "State: 5-30 days depending on state. Federal: 4-6 weeks (express services via Washington DC apostille services in 1-3 days, $50-200 markup)",
      hagueSignatory: true,
      notes: "US joined Hague Apostille 1981. State-issued documents (birth/marriage/divorce certificates) are apostilled by the state's Secretary of State. Federal documents (FBI checks, IRS, USCIS) by the US Dept of State Office of Authentications. Documents must usually be original or notarised certified copies.",
    },
    taxRecords: {
      name: "IRS Form 1040 + Tax Return Transcript",
      issuer: "Internal Revenue Service",
      url: "https://www.irs.gov/individuals/get-transcript",
      notes: "Tax Return Transcripts available free via IRS Get Transcript Online (instant) or by mail (5-10 days). Most foreign consulates accept the transcript + the actual return; some require both. Self-employed applicants also bring Schedule C + 1099s.",
    },
    translation: {
      accreditation: "ATA (American Translators Association) certified translator OR translator's certified statement of accuracy",
      notes: "For Spanish NLV / D7 / Elective Residence: foreign consulate may require its own approved translator (especially Spain — consulado.es maintains a list). Most consulates accept US-certified translations with notarisation.",
    },
    consulateGeography: "Major destinations have 4-7+ US consulates: typically NYC + LA + Chicago + Miami + Houston + Washington DC + San Francisco. Spanish + Italian + Portuguese consulates cover multiple states each. Booking lead time 4-12 weeks for in-person appointments at major-city consulates.",
    standardCivilDocuments: [
      "US passport (10-year validity; renew if under 6 months remaining on long-stay applications)",
      "Driver's License + US state-issued ID",
      "Social Security Card",
      "Original birth certificate (long-form, county-issued, raised seal)",
      "Marriage certificate (county-issued, raised seal)",
      "Divorce decree (court-issued, certified copy)",
      "Bank statements (US bank, official letterhead, certified copies for apostille)",
      "IRS tax transcripts (3 most recent years for most long-stay applications)",
    ],
    generalNotes: "US passport holders enjoy E-1/E-2 treaty-investor access to ~80 countries — uniquely broad. Plus Dutch-American Friendship Treaty (DAFT) for the Netherlands. For Brexit-era UK ETA: required since Jan 2025.",
  },

  // ─── Canada ───
  CA: {
    iso2: "CA",
    country: "Canada",
    preferredCurrency: "CAD",
    backgroundCheck: {
      name: "RCMP Certified Criminal Record Check",
      issuer: "Royal Canadian Mounted Police",
      url: "https://www.rcmp-grc.gc.ca/cr-cj/fing-empr-eng.htm",
      fee: "CAD $25-50 (varies by accredited fingerprinting service)",
      processingTime: "Electronic fingerprint submission: 3-15 business days. Paper submission: 120+ days. Use an RCMP-accredited fingerprinting service for fastest turnaround.",
      notes: "Fingerprint-based check via Canadian Police Information Centre (CPIC) database. Also need provincial criminal record check from local police force for some visas.",
    },
    apostille: {
      issuer: "Global Affairs Canada Authentication Services Section (federal); Provincial Apostille (Ontario, Quebec, Saskatchewan, Alberta, BC since 2024)",
      url: "https://www.international.gc.ca/gac-amc/about-a_propos/services/authentication-authentification.aspx",
      fee: "Free for Global Affairs Canada authentication; CAD $35-50 per provincial apostille",
      processingTime: "Global Affairs Canada: 25+ business days. Provincial apostille: 5-15 days. Multi-step process pre-2024 — apostille rollout simplifies for documents from authorised provinces.",
      hagueSignatory: true,
      notes: "Canada joined Hague Apostille January 11, 2024. Documents from Ontario / Saskatchewan / Quebec / Alberta / BC get streamlined provincial apostille. Documents from other provinces still need the Global Affairs Canada authentication route (longer).",
    },
    taxRecords: {
      name: "CRA Notice of Assessment (NOA)",
      issuer: "Canada Revenue Agency",
      url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/notice-assessment.html",
      notes: "NOA available free via CRA My Account online (instant). Most consulates accept 3 most recent years of NOAs + T1 General. Self-employed also bring T2125 + invoices.",
    },
    translation: {
      accreditation: "Canadian Translators, Terminologists and Interpreters Council (CTTIC) certified translator",
      notes: "Most consulates accept CTTIC-certified translations + notarisation. Quebec's Ordre des traducteurs (OTTIAQ) is the equivalent for French-language documents in many destinations.",
    },
    consulateGeography: "Major destinations have consulates in: Toronto + Vancouver + Montreal + Ottawa + Calgary (varies by country). Common Travel Area with US means many Canadians use NYC / Buffalo consulates for some applications.",
    standardCivilDocuments: [
      "Canadian passport (5- or 10-year validity)",
      "Provincial Driver's Licence or Provincial ID",
      "Original long-form birth certificate (province-issued)",
      "Marriage certificate (province-issued)",
      "Bank statements (Canadian bank, certified copies for apostille)",
      "CRA Notice of Assessment (3 most recent years)",
    ],
    generalNotes: "Canada-US Common Travel Area facilitates cross-border. Working Holiday agreements with 30+ countries (longest list globally) — under-35 Canadians get exceptionally broad access. Provincial apostille rollout 2024+ accelerates document processing materially.",
  },

  // ─── Australia ───
  AU: {
    iso2: "AU",
    country: "Australia",
    preferredCurrency: "AUD",
    backgroundCheck: {
      name: "AFP National Police Check",
      issuer: "Australian Federal Police",
      url: "https://www.afp.gov.au/national-police-checks",
      fee: "AUD $42 (online); AUD $58 (Code 33 with fingerprints for some immigration purposes)",
      processingTime: "Online application: 1-15 business days. Fingerprint check: 10-15 business days. Code 33 (with fingerprints) required by some destinations including Schengen, NZ residence, Canadian Express Entry.",
      notes: "Online check via afp.gov.au/national-police-checks. For migration outside Australia, AFP code is typically '33' (volunteer position with vulnerable people) which includes fingerprint check.",
    },
    apostille: {
      issuer: "Australian Department of Foreign Affairs and Trade (DFAT) Authentications Office",
      url: "https://www.smartraveller.gov.au/consular-services/notarial-services",
      fee: "AUD $80 per document",
      processingTime: "5-10 business days in-person; 15-25 business days by mail",
      hagueSignatory: true,
      notes: "Apostille available for Australian-issued documents. Process: notarise document with Australian notary public first → submit to DFAT Authentications Office (Canberra HQ + Sydney/Melbourne/Brisbane/Perth/Adelaide offices). Multiple offices reduce wait.",
    },
    taxRecords: {
      name: "ATO Notice of Assessment",
      issuer: "Australian Taxation Office",
      url: "https://www.ato.gov.au/individuals-and-families/your-tax-return/access-the-ato-and-your-information/get-your-notice-of-assessment",
      notes: "Notice of Assessment available free via myGov-linked ATO online (instant) or via myTax Print. Most consulates accept 3 most recent NoAs + tax returns.",
    },
    translation: {
      accreditation: "NAATI (National Accreditation Authority for Translators and Interpreters) Certified Translator",
      notes: "NAATI translations widely accepted globally. Most foreign consulates in Australia maintain a list of approved NAATI translators specifically. For destinations with no NAATI presence, also accept Australian-Embassy-approved local translators.",
    },
    consulateGeography: "Major destinations have consulates in Sydney + Melbourne + Canberra + Brisbane + Perth + Adelaide (varies). VFS Global / TLScontact centres handle bulk processing for Schengen, UK, US visas. Trans-Tasman with NZ.",
    standardCivilDocuments: [
      "Australian passport (10-year validity)",
      "Australian Driver's Licence (state-issued)",
      "Original long-form birth certificate (state-issued, with parents' details)",
      "Marriage certificate (state-issued)",
      "Bank statements (Australian bank)",
      "ATO tax returns (3 most recent years)",
      "Medicare card (proof of Australian residence for some applications)",
    ],
    generalNotes: "Australian passport-holders have Working Holiday agreements with ~45 countries (largest in the world) — exceptional under-31 / under-35 access. Italian descent claims (jure sanguinis) are particularly active given the ~1M Italian-Australian population.",
  },

  // ─── New Zealand ───
  NZ: {
    iso2: "NZ",
    country: "New Zealand",
    preferredCurrency: "NZD",
    backgroundCheck: {
      name: "Ministry of Justice Criminal Record Check",
      issuer: "Ministry of Justice NZ",
      url: "https://www.justice.govt.nz/criminal-records/get-your-criminal-record/",
      fee: "Free (NZ citizens / residents)",
      processingTime: "20 working days standard; 5-10 days express with reason",
      notes: "Free for NZ citizens / residents. Includes summary of court records held by NZ Ministry of Justice.",
    },
    apostille: {
      issuer: "Department of Internal Affairs (DIA) Authentications Unit",
      url: "https://www.dia.govt.nz/Apostille",
      fee: "NZD $46 per document",
      processingTime: "10 working days standard",
      hagueSignatory: true,
      notes: "Apostille for NZ-issued documents. Two-step: notarise via NZ notary public OR JP (Justice of the Peace) → submit to DIA Wellington office.",
    },
    taxRecords: {
      name: "IRD Income Summary",
      issuer: "Inland Revenue Department",
      url: "https://www.ird.govt.nz/income-tax/income-tax-for-individuals/your-tax-account",
      notes: "Income Summary available free via myIR online (instant). Most consulates accept 3 most recent years.",
    },
    translation: {
      accreditation: "NZ Society of Translators and Interpreters (NZSTI) certified translator",
      notes: "Smaller pool than NAATI Australia — many NZ applicants use Australian NAATI-certified translations (widely accepted). Some destinations explicitly require NZSTI translations.",
    },
    consulateGeography: "Limited NZ consulate presence — most countries operate from Wellington + Auckland only. For destinations without NZ consulates (e.g. several Latin American + smaller European states), Kiwis use the Australian consulate via Trans-Tasman arrangements.",
    standardCivilDocuments: [
      "NZ passport (10-year validity)",
      "NZ Driver's Licence",
      "Original birth certificate (Department of Internal Affairs-issued)",
      "Marriage certificate (DIA-issued)",
      "Bank statements (NZ bank)",
      "IRD income summaries (3 most recent years)",
    ],
    generalNotes: "Trans-Tasman freedom of movement with Australia (Subclass 444 Special Category Visa). Pacific Access Category lottery for Tongan/Samoan/Tuvaluan/Kiribati nationals creates significant inbound migration pipeline.",
  },

  // ─── Ireland ───
  IE: {
    iso2: "IE",
    country: "Ireland",
    preferredCurrency: "EUR",
    backgroundCheck: {
      name: "Garda Vetting / Police Certificate",
      issuer: "An Garda Síochána",
      url: "https://www.garda.ie/en/about-us/online-services/get-a-police-certificate-for-immigration-purposes.html",
      fee: "Free (Police Certificate); Garda Vetting requires a registered organisation as sponsor",
      processingTime: "Police Certificate: 6-8 weeks. Garda Vetting via Registered Org: 1-3 weeks.",
      notes: "Police Certificate (for visa purposes) is free but slow. Garda Vetting is for working with children/vulnerable adults and requires organisational sponsorship.",
    },
    apostille: {
      issuer: "Department of Foreign Affairs Consular Section",
      url: "https://www.dfa.ie/passports/legalisation/",
      fee: "EUR 40 per document",
      processingTime: "10-15 working days standard",
      hagueSignatory: true,
      notes: "Two-step: notarise via Irish notary or solicitor → submit to DFA Dublin Consular Services.",
    },
    taxRecords: {
      name: "Revenue Statement of Liability",
      issuer: "Office of the Revenue Commissioners",
      url: "https://www.revenue.ie/",
      notes: "Statement of Liability + P60s available free via Revenue MyAccount online.",
    },
    translation: {
      accreditation: "Irish Translators' and Interpreters' Association (ITIA) certified translator",
      notes: "Most consulates accept ITIA-certified or UK ITI/CIOL translations (UK-Ireland Common Travel Area facilitates).",
    },
    consulateGeography: "Most consulates in Dublin (Mount Street + Ballsbridge concentrations). Common Travel Area with UK simplifies UK visa applications (most British government services accept Irish passport-holders without separate visas).",
    standardCivilDocuments: [
      "Irish passport (10-year validity)",
      "Public Services Card OR Driving Licence",
      "Original birth certificate (GRO-issued)",
      "Marriage certificate (GRO-issued)",
      "Bank statements (Irish or EU bank)",
      "Revenue Statement of Liability (3 most recent years)",
    ],
    generalNotes: "Irish passport-holders enjoy full EU/EEA free movement (didn't lose this in Brexit). Common Travel Area with UK gives unique cross-border rights. Working Holiday agreements with ~10 countries (smaller than Australia/Canada).",
  },

  // ─── Germany ───
  DE: {
    iso2: "DE",
    country: "Germany",
    preferredCurrency: "EUR",
    backgroundCheck: {
      name: "Polizeiliches Führungszeugnis",
      issuer: "Bundesamt für Justiz (Federal Office of Justice)",
      url: "https://www.bundesjustizamt.de/",
      fee: "EUR 13 (standard); free for some purposes",
      processingTime: "1-2 weeks (paper); same-day if applied via German citizens registration office (Bürgeramt)",
      notes: "Three types — N (private use), O (official authority), OE (foreign authority — apostilled). For visa applications overseas, request Type O+OE.",
    },
    apostille: {
      issuer: "Bundesverwaltungsamt (federal docs) OR Regierungspräsidium (state docs)",
      url: "https://www.bundesverwaltungsamt.de/EN/Topics/Legalisation/Legalisation_node.html",
      fee: "EUR 25 per document",
      processingTime: "3-10 working days",
      hagueSignatory: true,
      notes: "Federal documents go via Bundesverwaltungsamt Köln. State documents (Personenstandsurkunden, etc.) via the relevant Regierungspräsidium of the issuing state.",
    },
    taxRecords: {
      name: "Steuerbescheid",
      issuer: "Finanzamt",
      url: "https://www.elster.de/",
      notes: "Steuerbescheid available via ELSTER online portal. Most consulates accept 3 most recent Steuerbescheide + Lohnsteuerbescheinigung (annual employer tax slip).",
    },
    translation: {
      accreditation: "Vereidigter Übersetzer (court-sworn translator)",
      notes: "Translations for visa purposes must be by a court-sworn translator (vereidigter / öffentlich bestellter Übersetzer). Each German state maintains a register; nearly universally accepted by foreign consulates.",
    },
    consulateGeography: "Major destinations have consulates in Berlin + Frankfurt + Munich + Hamburg + Düsseldorf + Stuttgart. Schengen residents (most EU+EEA citizens) need no Schengen short-stay visa.",
    standardCivilDocuments: [
      "Deutscher Reisepass (10-year validity)",
      "Personalausweis (national ID card)",
      "Geburtsurkunde (long-form, internationale Format for non-Schengen destinations)",
      "Heiratsurkunde / Lebenspartnerschaftsurkunde",
      "Anmeldung / Meldebescheinigung (address registration)",
      "Bank statements (Sparkasse / Volksbank / Deutsche Bank / Commerzbank common)",
    ],
    generalNotes: "German passport is consistently #1-2 in global mobility indexes. Citizenship-by-descent (Staatsangehörigkeit) available for descendants of Germans denaturalised under Nazi-era persecution (Article 116 (2) Grundgesetz).",
  },

  // ─── France ───
  FR: {
    iso2: "FR",
    country: "France",
    preferredCurrency: "EUR",
    backgroundCheck: {
      name: "Extrait de casier judiciaire (Bulletin n°3)",
      issuer: "Casier Judiciaire National",
      url: "https://casier-judiciaire.justice.gouv.fr/",
      fee: "Free",
      processingTime: "1-3 weeks (paper); instant download for some recent applicants",
      notes: "Bulletin n°3 is the publicly-available version (excludes minor offences). For visa purposes, request the apostilled version via casier-judiciaire.justice.gouv.fr.",
    },
    apostille: {
      issuer: "Cour d'Appel of the document's issuing region",
      url: "https://www.service-public.fr/",
      fee: "Free for most apostilles",
      processingTime: "2-4 weeks standard",
      hagueSignatory: true,
      notes: "Apostille issued by the Procureur Général at the Cour d'Appel of the region where the document was created. Multiple offices reduce processing time.",
    },
    taxRecords: {
      name: "Avis d'Imposition",
      issuer: "Direction Générale des Finances Publiques (DGFiP)",
      url: "https://www.impots.gouv.fr/",
      notes: "Avis d'Imposition available free via impots.gouv.fr personal area. Most consulates accept 3 most recent + the underlying Declaration de Revenus.",
    },
    translation: {
      accreditation: "Traducteur assermenté (court-sworn translator)",
      notes: "Court-sworn translators are listed on the Cour d'Appel of each region. Translations for visa purposes universally accepted with their seal.",
    },
    consulateGeography: "Most consulates in Paris (16e + 7e arrondissements). Additional consulates in Lyon + Marseille + Strasbourg + Bordeaux + Nice for some destinations. France being a Schengen country gives French citizens free EU/EEA movement.",
    standardCivilDocuments: [
      "Passeport français (10-year validity)",
      "Carte Nationale d'Identité",
      "Copie intégrale d'acte de naissance (long-form, with parents' details)",
      "Acte de mariage / PACS certificate",
      "Justificatif de domicile (utility bill within 3 months)",
      "Bank statements (BNP Paribas / Société Générale / Crédit Agricole common)",
    ],
    generalNotes: "France has Working Holiday agreements with most major countries. Citizenship-by-descent particularly active for diaspora in former French colonies + the 1962 Algerian repatriates. Carte de Résident (10-year) and Carte de Résident permanent (indefinite) materially de-stress visa renewals after 5 years.",
  },

  // ─── Italy ───
  IT: {
    iso2: "IT",
    country: "Italy",
    preferredCurrency: "EUR",
    backgroundCheck: {
      name: "Certificato del casellario giudiziale",
      issuer: "Ministero della Giustizia",
      url: "https://www.giustizia.it/",
      fee: "EUR 16-32 (depending on number of copies)",
      processingTime: "1-5 days at the Procura della Repubblica office",
      notes: "Obtained at the Procura della Repubblica of your residence. Apostilled version for foreign use available same-day at most offices.",
    },
    apostille: {
      issuer: "Procura della Repubblica (court documents) OR Prefettura (administrative documents)",
      url: "https://www.giustizia.it/",
      fee: "EUR 16-32 per document",
      processingTime: "1-3 working days",
      hagueSignatory: true,
      notes: "Court documents → Procura. Administrative documents → Prefettura. Both offices are city-level so widely distributed.",
    },
    taxRecords: {
      name: "Modello 730 / Modello Unico",
      issuer: "Agenzia delle Entrate",
      url: "https://www.agenziaentrate.gov.it/",
      notes: "730/Unico available via Agenzia delle Entrate SPID-authenticated portal. Last 3 years of dichiarazione dei redditi + CU (annual employer tax certificate) typical requirement.",
    },
    translation: {
      accreditation: "Traduttore giurato (court-sworn translator)",
      notes: "Court-sworn translators registered with the Tribunale. Translations + apostille required for foreign use; most consulates accept Italian sworn translations universally.",
    },
    consulateGeography: "Most consulates in Rome (EUR + Centro Storico) + Milan (Brera + city centre). Naples + Florence + Turin + Palermo have additional consulates for some destinations. Italy being a Schengen country gives Italians free EU/EEA movement.",
    standardCivilDocuments: [
      "Passaporto italiano (10-year validity)",
      "Carta d'Identità Elettronica (CIE)",
      "Estratto dell'atto di nascita (long-form)",
      "Atto di matrimonio (long-form)",
      "Stato di famiglia",
      "Bank statements (Intesa Sanpaolo / UniCredit / BPM common)",
    ],
    generalNotes: "Italian passport-holders uniquely benefit from jure sanguinis recognition (Italian citizenship by descent — unlimited generations) for visa applications back to Italy. Working Holiday agreements with Australia, NZ, Canada, Japan, Korea.",
  },

  // ─── Spain ───
  ES: {
    iso2: "ES",
    country: "Spain",
    preferredCurrency: "EUR",
    backgroundCheck: {
      name: "Certificado de Antecedentes Penales",
      issuer: "Ministerio de Justicia",
      url: "https://sede.mjusticia.gob.es/",
      fee: "EUR 3.85",
      processingTime: "Instant (online with DNI electronic certificate) or 5-10 days (paper)",
      notes: "Available via Sede Electrónica of Ministerio de Justicia. Apostilled version requires additional step at the Subdirección General de Cooperación Jurídica.",
    },
    apostille: {
      issuer: "Subdirección General de Cooperación Jurídica Internacional (Ministerio de Justicia)",
      url: "https://www.mjusticia.gob.es/",
      fee: "Free",
      processingTime: "1-3 days at Madrid office; longer in regional offices",
      hagueSignatory: true,
      notes: "Spain operates a one-stop apostille for most documents — Ministerio de Justicia handles judicial + administrative documents. Notarial documents go via the Colegio de Notarios.",
    },
    taxRecords: {
      name: "Modelo 100 (IRPF) + Declaración de la Renta",
      issuer: "Agencia Tributaria (AEAT)",
      url: "https://www.agenciatributaria.es/",
      notes: "Declaración de la Renta available via Agencia Tributaria portal with Cl@ve PIN or DNI electronic. Last 3 years typical requirement.",
    },
    translation: {
      accreditation: "Traductor jurado (court-sworn translator)",
      notes: "Sworn translators registered with the Ministerio de Asuntos Exteriores. Their translations + apostille are universally accepted abroad.",
    },
    consulateGeography: "Most consulates in Madrid (Salamanca + Chamberí) + Barcelona (Eixample). Sevilla, Valencia, Bilbao, Málaga have additional consulates for some destinations. Spain being a Schengen country gives Spaniards free EU/EEA movement.",
    standardCivilDocuments: [
      "Pasaporte español (10-year validity)",
      "DNI (Documento Nacional de Identidad)",
      "Certificación literal de nacimiento (long-form)",
      "Certificación literal de matrimonio (long-form)",
      "Certificado de empadronamiento (residence registration)",
      "Bank statements (BBVA / Santander / CaixaBank / Bankia common)",
    ],
    generalNotes: "Spain has preferential paths to many Latin American countries (Spanish-Argentine, Spanish-Mexican, Iberoamerican Convention). Sephardic Jewish descent claims (closed September 2019) — many descendants who started applications before deadline still being processed. Working Holiday agreements with Australia, NZ, Canada, Japan, Korea.",
  },

  // ─── Netherlands ───
  NL: {
    iso2: "NL",
    country: "Netherlands",
    preferredCurrency: "EUR",
    backgroundCheck: {
      name: "Verklaring Omtrent het Gedrag (VOG)",
      issuer: "Justis (Ministerie van Justitie en Veiligheid)",
      url: "https://www.justis.nl/producten/vog",
      fee: "EUR 33.85 (online) or EUR 41.35 (paper)",
      processingTime: "4 weeks standard; faster online applications via DigiD",
      notes: "VOG online via Justis with DigiD. Apostilled version requires additional step at the Ministerie van Buitenlandse Zaken.",
    },
    apostille: {
      issuer: "District court (Rechtbank) for judicial documents; municipality for civil documents",
      url: "https://www.rechtspraak.nl/",
      fee: "EUR 24 per document",
      processingTime: "Same-day at the Rechtbank counter; 5-10 days by mail",
      hagueSignatory: true,
      notes: "Netherlands has a particularly streamlined apostille process — most Rechtbank offices apostille civil + court documents over the counter same-day.",
    },
    taxRecords: {
      name: "Aanslag Inkomstenbelasting",
      issuer: "Belastingdienst",
      url: "https://www.belastingdienst.nl/",
      notes: "Aanslag IB available via Mijn Belastingdienst portal. Last 3 years typical requirement.",
    },
    translation: {
      accreditation: "Beëdigde vertaler (court-sworn translator)",
      notes: "Sworn translators registered with the Bureau Wbtv (Wet beëdigde tolken en vertalers). Their translations are universally accepted abroad.",
    },
    consulateGeography: "Most consulates in Den Haag (capital — embassies concentrated here) + Amsterdam (commercial centre). Rotterdam + Eindhoven + Utrecht have additional consulates for some destinations. Schengen movement.",
    standardCivilDocuments: [
      "Nederlands paspoort (10-year validity)",
      "Identiteitskaart",
      "Uittreksel uit de basisregistratie personen (BRP — long-form birth certificate)",
      "Huwelijksakte (marriage certificate)",
      "Bank statements (ING / Rabobank / ABN AMRO common)",
    ],
    generalNotes: "Dutch passport-holders enjoy DAFT (Dutch-American Friendship Treaty) — uniquely simple US business / investor residence route (€4,500 minimum). Working Holiday with ~10 countries.",
  },

  // ─── Japan ───
  JP: {
    iso2: "JP",
    country: "Japan",
    preferredCurrency: "JPY",
    backgroundCheck: {
      name: "Police Records Check (Kosanai-fukukei) / Hanzai Keireki Shomeisho",
      issuer: "Prefectural Police",
      url: "https://www.npa.go.jp/",
      fee: "Free",
      processingTime: "2-6 weeks at prefectural police HQ",
      notes: "Available at your prefecture's police HQ. Apostilled version via Ministry of Foreign Affairs (MOFA) in Tokyo. Process slower than most G7 countries.",
    },
    apostille: {
      issuer: "Ministry of Foreign Affairs (Gaimusho)",
      url: "https://www.mofa.go.jp/ca/cs/page22e_000416.html",
      fee: "Free",
      processingTime: "1-3 days at Tokyo Kasumigaseki MOFA office",
      hagueSignatory: true,
      notes: "Single-step apostille at MOFA Tokyo for documents already notarised by a Japanese notary (kosho-nin).",
    },
    taxRecords: {
      name: "Gensen Choshu Hyo (Withholding Tax Slip) + Kakutei Shinkoku (Tax Return)",
      issuer: "National Tax Agency",
      url: "https://www.nta.go.jp/",
      notes: "Gensen Choshu Hyo issued annually by employer (1-page summary). Self-employed file Kakutei Shinkoku via e-Tax. Most consulates accept the last 3 years.",
    },
    translation: {
      accreditation: "Japan Association of Translators (JAT) certified or translator's certified statement",
      notes: "Sworn-translator system less formalised than EU. Notarisation of the translator's certification is typically required for foreign use.",
    },
    consulateGeography: "Most consulates in Tokyo (Akasaka / Roppongi / Hiroo). Osaka + Fukuoka + Sapporo have additional consulates for some destinations. Japan citizen passport-holders enjoy near-universal visa-free access.",
    standardCivilDocuments: [
      "Japanese passport (10-year validity)",
      "My Number Card (national ID)",
      "Koseki Tohon (family register, long-form)",
      "Kon-in Todoke Juri Shomeisho (marriage acceptance certificate)",
      "Juminhyo (resident registration)",
      "Bank statements (Mitsubishi UFJ / SMBC / Mizuho common)",
    ],
    generalNotes: "Japanese passport consistently #1 in global mobility indexes. Working Holiday agreements with 30+ countries (Australia, NZ, Canada, UK, France, Germany, Ireland, Italy, Spain, Korea, Hong Kong, Taiwan, Argentina, Chile, etc.).",
  },

  // ─── South Korea ───
  KR: {
    iso2: "KR",
    country: "South Korea",
    preferredCurrency: "KRW",
    backgroundCheck: {
      name: "Police Clearance Certificate (Beomjwa Gyeongryeok Hoebogseo)",
      issuer: "Korean National Police Agency",
      url: "https://www.police.go.kr/",
      fee: "KRW 4,000 (~USD $3)",
      processingTime: "Same-day at local police station with passport + ID",
      notes: "Available at any local police station. Apostilled version via Ministry of Foreign Affairs (MOFA) Apostille Office.",
    },
    apostille: {
      issuer: "Ministry of Foreign Affairs",
      url: "https://www.0404.go.kr/",
      fee: "KRW 1,000 (~USD $0.80)",
      processingTime: "Same-day at Seoul MOFA Apostille Office; 3-5 days by mail",
      hagueSignatory: true,
      notes: "Korea is consistently one of the fastest + cheapest apostille processes globally. Single-step.",
    },
    taxRecords: {
      name: "Wonjingo (Income Tax Confirmation)",
      issuer: "National Tax Service (NTS)",
      url: "https://www.nts.go.kr/",
      notes: "Wonjingo available via NTS Hometax online portal with Korean digital certificate.",
    },
    translation: {
      accreditation: "Korean Association of Translators (KAT) or notarised translation",
      notes: "Less formalised than EU sworn-translator systems. Most consulates accept translation + Korean notary public certification.",
    },
    consulateGeography: "Most consulates in Seoul (Itaewon / Hannam-dong / Jongno areas concentrate embassies). Busan has additional consulates for some destinations.",
    standardCivilDocuments: [
      "Korean passport (10-year validity)",
      "Resident Registration Card (Jumin Deungrok Jeung)",
      "Family Relation Certificate (Gajok Gwangye Jeungmyeongseo)",
      "Marriage Relation Certificate",
      "Bank statements (KB Kookmin / Shinhan / Hana / Woori common)",
    ],
    generalNotes: "Korean passport is consistently top-3 in global mobility. Working Holiday agreements with 25+ countries. Korean diaspora particularly active in US + Canada + Australia — family-reunification routes well-trodden.",
  },

  // ─── China ───
  CN: {
    iso2: "CN",
    country: "China",
    preferredCurrency: "CNY",
    backgroundCheck: {
      name: "Public Security Bureau (Gong'anju) Notarised Criminal Record",
      issuer: "Public Security Bureau (PSB) of your hukou registration locality + Notary Public Office",
      url: "https://www.mps.gov.cn/",
      fee: "CNY 30-200 (varies by city + notary fees)",
      processingTime: "2-4 weeks (PSB record) + 1-2 weeks (notarisation) + apostille step",
      notes: "Three-step: PSB issues no-criminal-record at your hukou-registered location → notary office (Gongzhengchu) creates notarised attestation → MFA / Provincial FAO apostille.",
    },
    apostille: {
      issuer: "Ministry of Foreign Affairs of China + Provincial Foreign Affairs Offices (FAO)",
      url: "https://www.mfa.gov.cn/web/",
      fee: "CNY 50-100 per document",
      processingTime: "5-10 working days",
      hagueSignatory: true,
      notes: "China joined Hague Apostille effective 7 November 2023 (major change — previously used dual-authentication via destination embassy). Now single-step apostille via MFA Beijing or provincial FAOs.",
    },
    taxRecords: {
      name: "Individual Income Tax Records (Geren Suode Shui Wanshui Zhengming)",
      issuer: "State Administration of Taxation",
      url: "https://www.chinatax.gov.cn/",
      notes: "Tax records available via e-tax bureau portal (one of China's most digitised government services). Last 3 years typical requirement.",
    },
    translation: {
      accreditation: "Translation Companies Association of China (TAC) registered or notarised",
      notes: "Translations + notary public certification typically required for foreign use. Notary offices (Gongzhengchu) provide the certified translation + notarisation in one step.",
    },
    consulateGeography: "Most consulates in Beijing (Embassy District near Sanlitun + CBD). Shanghai + Guangzhou + Chengdu + Shenyang + Wuhan have additional consulates for major destinations. Hong Kong + Macau have separate consular regimes.",
    standardCivilDocuments: [
      "Chinese passport (10-year validity)",
      "Resident Identity Card",
      "Household Registration Booklet (Hukou)",
      "Notarised birth + marriage certificates (Chinese notary public)",
      "Bank statements (ICBC / Bank of China / China Construction Bank / Agricultural Bank common)",
    ],
    generalNotes: "China's Hague Apostille accession (November 2023) materially simplified document processing for outbound applicants. Working Holiday agreements with ~15 countries. Recent expansion of visa-free reciprocity with EU member states (since November 2024).",
  },

  // ─── India ───
  IN: {
    iso2: "IN",
    country: "India",
    preferredCurrency: "INR",
    backgroundCheck: {
      name: "Police Clearance Certificate (PCC)",
      issuer: "Passport Seva Kendra (Ministry of External Affairs)",
      url: "https://www.passportindia.gov.in/",
      fee: "INR 500 (~USD $6)",
      processingTime: "1-3 weeks at Passport Seva Kendra appointment",
      notes: "Apply via passportindia.gov.in (PCC application is separate from passport application). PCC issued by police authorities through the Passport Seva system. Apostilled version requires additional step at MEA Branch Secretariat.",
    },
    apostille: {
      issuer: "Ministry of External Affairs Branch Secretariats (Delhi / Mumbai / Kolkata / Chennai / Hyderabad / Bangalore / Cochin / Goa)",
      url: "https://www.mea.gov.in/apostille.htm",
      fee: "INR 50 per document",
      processingTime: "1-2 weeks (in-person); 2-4 weeks (mail)",
      hagueSignatory: true,
      notes: "MEA Branch Secretariats handle apostille after the document is first notarised by an Indian notary public. Common requirement to first attest at the district court (Tahsildar / SDM level) for certain documents.",
    },
    taxRecords: {
      name: "ITR (Income Tax Return) + Form 26AS",
      issuer: "Income Tax Department",
      url: "https://www.incometax.gov.in/",
      notes: "ITR-V acknowledgement + Form 26AS available via incometax.gov.in with PAN + Aadhaar. Last 3 years typical requirement.",
    },
    translation: {
      accreditation: "Notary Public attestation OR translator's certified statement",
      notes: "Less formalised than EU sworn-translator systems. Notary public attestation + translator's affidavit typically accepted by foreign consulates.",
    },
    consulateGeography: "Most consulates in Delhi (Chanakyapuri Embassy District) + Mumbai (Worli + Cuffe Parade). Chennai + Kolkata + Hyderabad + Bengaluru have additional consulates for major destinations. VFS Global / TLScontact centres handle bulk processing.",
    standardCivilDocuments: [
      "Indian passport (10-year validity)",
      "Aadhaar Card",
      "PAN Card",
      "Birth certificate (Municipal Corporation OR via passport application proof)",
      "Marriage certificate (under Special Marriage Act preferred for foreign use)",
      "Bank statements (HDFC / ICICI / SBI / Axis Bank common)",
    ],
    generalNotes: "Indian passport requires advance visa for most major destinations. OCI Card materially eases India-side documentation for foreign-passport-holders of Indian descent. Skilled Worker (UK, Canada Express Entry, Australia 482, US H-1B) are dominant work routes.",
  },

  // ─── Brazil ───
  BR: {
    iso2: "BR",
    country: "Brazil",
    preferredCurrency: "BRL",
    backgroundCheck: {
      name: "Federal + State Criminal Record Certificates (Antecedentes Criminais)",
      issuer: "Polícia Federal (federal) + Estadual police (state-level)",
      url: "https://www.gov.br/pf/pt-br/assuntos/antecedentes-criminais",
      fee: "BRL 80 (~USD $15) per certificate",
      processingTime: "Same-day online via gov.br portal (federal); 1-2 weeks state-level",
      notes: "Need BOTH federal (Polícia Federal) AND state-level (estadual) certificates for each state lived in for 5+ years. Apostilled via local Tabelionato de Notas (notary).",
    },
    apostille: {
      issuer: "Tabelionato de Notas (notary public offices) — decentralised",
      url: "https://www.cnj.jus.br/poder-judiciario/relacoes-internacionais/apostila-da-haia/",
      fee: "BRL 50-100 per document (varies by state)",
      processingTime: "Same-day at most notary offices",
      hagueSignatory: true,
      notes: "Brazil joined Hague Apostille 2016 — decentralised system via tabelionato (notary) offices nationwide. Fast + widely accessible.",
    },
    taxRecords: {
      name: "Declaração de Imposto de Renda (IRPF)",
      issuer: "Receita Federal",
      url: "https://www.gov.br/receitafederal/",
      notes: "Available via Receita Federal e-CAC portal with login.gov.br. Last 3 years of declaração + recibo de entrega typical requirement.",
    },
    translation: {
      accreditation: "Tradutor Público Juramentado (court-sworn translator)",
      notes: "Court-sworn translators registered with the state Junta Comercial. Their translations + apostille are universally accepted abroad.",
    },
    consulateGeography: "Most consulates in Brasília (Embassy District in Setor de Embaixadas) + São Paulo (commercial centre — Avenida Paulista + Vila Nova Conceição). Rio de Janeiro + Curitiba + Belo Horizonte + Recife have additional consulates.",
    standardCivilDocuments: [
      "Brazilian passport (10-year validity)",
      "RG (Registro Geral, national identity)",
      "CPF (Cadastro de Pessoas Físicas)",
      "Certidão de nascimento (long-form, with parents' details)",
      "Certidão de casamento (long-form)",
      "Bank statements (Itaú / Bradesco / Banco do Brasil / Santander / Caixa common)",
    ],
    generalNotes: "Brazilian passport-holders enjoy Mercosur Residency Agreement — streamlined residence in Argentina, Uruguay, Paraguay, Bolivia, Chile, Colombia, Ecuador, Peru. Italian-descent claims uniquely strong (~30M Brazilians have Italian ancestry). Working Holiday with Australia, NZ, France, Germany.",
  },

  // ─── Mexico ───
  MX: {
    iso2: "MX",
    country: "Mexico",
    preferredCurrency: "MXN",
    backgroundCheck: {
      name: "Carta de No Antecedentes Penales (federal + state)",
      issuer: "Fiscalía General de la República (federal) + state attorneys-general",
      url: "https://www.gob.mx/fgr",
      fee: "MXN 100-500 (varies by state)",
      processingTime: "1-5 working days",
      notes: "Federal certificate + state-level for any Mexican state lived in for 5+ years. Apostille at the state's Secretaría General de Gobierno.",
    },
    apostille: {
      issuer: "Secretaría General de Gobierno of each state (state-issued documents) OR Secretaría de Gobernación SEGOB (federal documents)",
      url: "https://www.gob.mx/segob",
      fee: "MXN 700 (federal); varies by state for state-level",
      processingTime: "Same-day to 5 days depending on state",
      hagueSignatory: true,
      notes: "Decentralised — apostille at the state of the document's origin. Federal documents (passports, FBI-equivalent checks) at SEGOB in Mexico City.",
    },
    taxRecords: {
      name: "Declaración Anual + Constancia de Situación Fiscal",
      issuer: "Servicio de Administración Tributaria (SAT)",
      url: "https://www.sat.gob.mx/",
      notes: "Available via SAT online portal with e.firma digital certificate. Last 3 years declaración anual typical requirement.",
    },
    translation: {
      accreditation: "Perito traductor (court-certified translator)",
      notes: "Court-certified translators registered with the Consejo de la Judicatura Federal or state judiciaries. Translations + apostille universally accepted.",
    },
    consulateGeography: "Most consulates in CDMX (Polanco / Lomas de Chapultepec / Colonia Juárez). Guadalajara + Monterrey + Tijuana + Cancún + Mérida have additional consulates for major destinations.",
    standardCivilDocuments: [
      "Mexican passport (10-year validity)",
      "INE / IFE voter card (de facto national ID)",
      "CURP (Clave Única de Registro de Población)",
      "Acta de nacimiento (long-form, with parents' details)",
      "Acta de matrimonio (long-form)",
      "Bank statements (BBVA / Santander / Banamex / Banorte common)",
    ],
    generalNotes: "Mexican passport-holders benefit from USMCA TN-equivalent business-visit access to US + Canada. Spanish-Mexican Convention on Nationality (1995) gives streamlined Spanish residence for Mexicans of Spanish descent. Pacific Alliance + Mercosur frameworks facilitate Latin American mobility.",
  },

  // ─── Singapore ───
  SG: {
    iso2: "SG",
    country: "Singapore",
    preferredCurrency: "SGD",
    backgroundCheck: {
      name: "Certificate of Clearance (CoC)",
      issuer: "Singapore Police Force",
      url: "https://www.police.gov.sg/",
      fee: "SGD 60 (~USD $45)",
      processingTime: "1-3 weeks at SPF Cantonment Complex",
      notes: "Apply at Singapore Police Force Cantonment Complex with passport + foreign address proof. Specifies which countries the certificate is intended for.",
    },
    apostille: {
      issuer: "Singapore Academy of Law (SAL) Notarial Section",
      url: "https://www.sal.org.sg/",
      fee: "SGD 75 per document",
      processingTime: "1-2 working days",
      hagueSignatory: true,
      notes: "Singapore joined Hague Apostille 2021 — relatively new. Single-step apostille via Singapore Academy of Law (replaces older Legalisation regime).",
    },
    taxRecords: {
      name: "IRAS Notice of Assessment",
      issuer: "Inland Revenue Authority of Singapore",
      url: "https://www.iras.gov.sg/",
      notes: "Notice of Assessment available via myTax Portal with Singpass. Last 3 years typical requirement.",
    },
    translation: {
      accreditation: "Singapore Translators' Association (STA) certified or notarised translation",
      notes: "Notary public certification typically required for foreign use. Singapore has dense bilingual + multilingual translation services covering English / Mandarin / Malay / Tamil natively.",
    },
    consulateGeography: "Most consulates in Singapore CBD / Orchard / Marina Bay areas. Singapore being a city-state means all consular services centralised in one urban core.",
    standardCivilDocuments: [
      "Singapore passport (10-year validity)",
      "NRIC (National Registration Identity Card)",
      "Birth certificate (Singapore-issued)",
      "Marriage certificate (Singapore-issued)",
      "Bank statements (DBS / OCBC / UOB common)",
    ],
    generalNotes: "Singapore passport consistently #1 in global mobility indexes. Working Holiday with ~10 countries. Singapore-EU Free Trade Agreement (2019) eases EU long-stay visa processing. ASEAN free-movement for short-stay.",
  },

  // ─── UAE ───
  AE: {
    iso2: "AE",
    country: "United Arab Emirates",
    preferredCurrency: "AED",
    backgroundCheck: {
      name: "Good Conduct Certificate (Police Certificate)",
      issuer: "UAE Ministry of Interior",
      url: "https://www.moi.gov.ae/en/",
      fee: "AED 100",
      processingTime: "1-3 working days online via UAE PASS or MoI app",
      notes: "Available via UAE PASS (national digital identity). Specifies the destination country for which the certificate is requested.",
    },
    apostille: {
      issuer: "Ministry of Foreign Affairs UAE",
      url: "https://www.mofa.gov.ae/",
      fee: "AED 150 per document",
      processingTime: "1-2 working days",
      hagueSignatory: true,
      notes: "UAE joined Hague Apostille effective 7 June 2025 — very recent. Previously used dual-authentication via destination embassy.",
    },
    taxRecords: {
      name: "Salary Certificate + Bank Statements (no income tax in UAE)",
      issuer: "Employer + bank",
      url: "https://u.ae/",
      notes: "UAE has no personal income tax — salary certificates from employer (on company letterhead, stamped) + bank statements are the standard income proof for foreign consulates.",
    },
    translation: {
      accreditation: "MoJ-licensed legal translator (Ministry of Justice approved)",
      notes: "MoJ-licensed legal translator's translation + apostille is the standard for foreign consulate use. UAE has dense Arabic-English-Urdu-Hindi-Tagalog translator pool.",
    },
    consulateGeography: "Most consulates in Abu Dhabi (federal capital — embassy district) + Dubai (commercial centre — Trade Centre Area + DIFC). Some destinations also have consulates in Sharjah + Ras Al Khaimah.",
    standardCivilDocuments: [
      "UAE passport (5-year validity, longer for Golden Visa)",
      "Emirates ID",
      "Family book (Khulasat al-Qaid)",
      "Marriage certificate (issued by UAE Ministry of Justice OR origin country, then apostilled)",
      "Bank statements (Emirates NBD / FAB / ADCB / Mashreq common)",
      "Salary certificate (on employer letterhead, stamped)",
    ],
    generalNotes: "UAE passport-holders enjoy rapid global-mobility gains since 2015 — now ~180 visa-free destinations. GCC reciprocity for free residence in Saudi/Kuwait/Bahrain/Qatar/Oman. Golden Visa creates substantial inbound migration. Hague Apostille accession (June 2025) materially simplifies outbound applications.",
  },

  // ─── Turkey ───
  TR: {
    iso2: "TR",
    country: "Türkiye",
    preferredCurrency: "TRY",
    backgroundCheck: {
      name: "Adli Sicil Kaydı (Criminal Record)",
      issuer: "Ministry of Justice (Adalet Bakanlığı)",
      url: "https://www.adalet.gov.tr/",
      fee: "Free (online via e-Devlet)",
      processingTime: "Instant via e-Devlet portal",
      notes: "Available free via e-Devlet (national digital ID portal). Apostilled version via local Kaymakamlık (sub-governorate) or Valilik (governorate).",
    },
    apostille: {
      issuer: "Kaymakamlık / Valilik (sub-governorate / governorate)",
      url: "https://www.icisleri.gov.tr/",
      fee: "Free for administrative documents; ~TRY 100 for some judicial documents",
      processingTime: "Same-day at Kaymakamlık counter",
      hagueSignatory: true,
      notes: "Türkiye joined Hague Apostille 1985. Decentralised system — apostille at the Kaymakamlık of any of Türkiye's 922 districts. Very fast + widely accessible.",
    },
    taxRecords: {
      name: "Gelir Vergisi Beyannamesi + Vergi Levhası",
      issuer: "Revenue Administration (Gelir İdaresi Başkanlığı)",
      url: "https://www.gib.gov.tr/",
      notes: "Available via GİB online portal with e-Devlet certificate. Last 3 years typical requirement.",
    },
    translation: {
      accreditation: "Yeminli tercüman (court-sworn translator)",
      notes: "Court-sworn translators registered with the Noter (notary public). Translations + notarisation + apostille universally accepted abroad.",
    },
    consulateGeography: "Most consulates in Ankara (capital — embassy district near Çankaya). Istanbul has the bulk of trade-oriented consulates (Beyoğlu / Şişli). Izmir + Antalya have additional consulates for some destinations.",
    standardCivilDocuments: [
      "Türkiye passport (10-year validity)",
      "T.C. Kimlik Kartı (national identity card)",
      "Nüfus Kayıt Örneği (full family register extract)",
      "Evlilik Cüzdanı (marriage booklet)",
      "Bank statements (Ziraat / Garanti / Akbank / İş Bankası common)",
    ],
    generalNotes: "Turkish passport-holders enjoy visa-free entry to many states under bilateral arrangements. Turkish Citizenship by Investment (USD 400k property OR USD 500k deposit) creates outbound migration pull factor. Working Holiday with Japan, South Korea.",
  },

  // ─── Israel ───
  IL: {
    iso2: "IL",
    country: "Israel",
    preferredCurrency: "ILS",
    backgroundCheck: {
      name: "Israeli Police Clearance Certificate",
      issuer: "Israel Police",
      url: "https://www.police.gov.il/",
      fee: "ILS 121",
      processingTime: "2-3 weeks at any Israeli Police Investigation Branch",
      notes: "Apply at Israel Police Investigation Branch with passport + ID + visa-purpose declaration.",
    },
    apostille: {
      issuer: "Ministry of Justice / Magistrates Court / Ministry of Foreign Affairs (varies by document type)",
      url: "https://www.gov.il/en/departments/ministry_of_foreign_affairs",
      fee: "ILS 35 per document",
      processingTime: "Same-day at the appropriate office",
      hagueSignatory: true,
      notes: "Israel joined Hague Apostille 1978. Court documents → Magistrates Court. Public documents → Ministry of Justice. Diplomatic / consular → MFA.",
    },
    taxRecords: {
      name: "Annual Tax Report (Doch Hashana / Tofes 106)",
      issuer: "Israel Tax Authority",
      url: "https://www.gov.il/en/departments/israel_tax_authority",
      notes: "Tofes 106 (annual employer tax slip) + self-employed Doch Hashana via Israel Tax Authority online portal.",
    },
    translation: {
      accreditation: "Notary public certification (Israeli notaries do translation certification)",
      notes: "Israeli notary public certification of translation is widely accepted. For some destinations, certified translator association registration also required.",
    },
    consulateGeography: "Most consulates in Tel Aviv (the de facto commercial + diplomatic centre; embassies historically in Tel Aviv, some moving to Jerusalem). Limited consulate presence outside Tel Aviv.",
    standardCivilDocuments: [
      "Israeli passport (10-year validity)",
      "Teudat Zehut (national identity card)",
      "Birth certificate from Ministry of Interior",
      "Marriage certificate (if married in Israel; if abroad, separate process)",
      "Bank statements (Hapoalim / Leumi / Discount / Mizrahi common)",
      "Aliyah / Citizenship certificate (for naturalised citizens)",
    ],
    generalNotes: "Israeli passport-holders enjoy ~170 visa-free destinations. Many countries have separate documentation requirements for Israelis (Israeli stamp creates re-entry issues for ~20 Arab states; Israelis travel with two passports — one for Israel-area, one for Arab states). Israeli tech-sector global movement particularly fluid.",
  },
};

/** Lookup helper — returns the profile for this passport, or null. */
export function passportProfileFor(iso2: string): PassportProfile | null {
  return PASSPORT_PROFILES[iso2.toUpperCase()] ?? null;
}

/** All covered passport ISOs — for testing + sitemap. */
export function allProfiledPassports(): string[] {
  return Object.keys(PASSPORT_PROFILES);
}
