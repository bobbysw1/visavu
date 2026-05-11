/**
 * Passport-specific overrides for the visa-prep document list.
 *
 * The base `VisaDocument` entries in visaDocuments.ts describe each document
 * generically. But the **how-to-obtain** instructions for items like police
 * certificates, passport renewals, and credential evaluations vary heavily
 * by the applicant's country.
 *
 * This file maps:  (passport ISO2, document id) → overrides
 *
 * Used by VisaPrepTimeline at render time. If no override exists, the
 * generic copy from visaDocuments.ts is used.
 *
 * Coverage approach: every top-50 origin passport gets concrete, named
 * channels (FBI Channeler for US, ACRO for UK, AFP for AU, etc.). The
 * rest fall back to the generic "police clearance from each country lived
 * in 6+ months" copy.
 */

export type DocOverride = {
  howToObtain?: string;
  /** Override the lead-time range when the named channel is materially
   *  faster or slower than the global average. */
  leadDaysMin?: number;
  leadDaysMax?: number;
  /** Direct link to the canonical application page for this passport. */
  url?: string;
};

type Key = `${string}:${string}`;

// Note: keys are `${passportIso2}:${documentId}`.
export const PASSPORT_DOC_OVERRIDES: Record<Key, DocOverride> = {
  // ─────────── United States ───────────
  "US:passport": {
    howToObtain:
      "Renew at travel.state.gov — routine 6–8 weeks, expedited 2–3 weeks (extra $60).",
    leadDaysMin: 14,
    leadDaysMax: 56,
    url: "https://travel.state.gov/content/travel/en/passports.html",
  },
  "US:police_certificate": {
    howToObtain:
      "FBI Identity History Summary — request via an approved Channeler (3–7 business days) or by mail directly to the FBI (8–12 weeks). Plus a state-level repository check if any destination asks for it.",
    leadDaysMin: 5,
    leadDaysMax: 60,
    url: "https://www.fbi.gov/services/cjis/identity-history-summary-checks",
  },
  "US:apostille_certified_copies": {
    howToObtain:
      "State Secretary of State for state-issued documents (birth, marriage); US State Department Office of Authentications for federal documents.",
    leadDaysMin: 14,
    leadDaysMax: 42,
    url: "https://travel.state.gov/content/travel/en/records-and-authentications.html",
  },
  "US:medical_exam": {
    howToObtain:
      "Find a USCIS-designated civil surgeon (uscis.gov/tools/find-a-doctor) for inbound applications; for outbound, use a panel physician approved by your destination's immigration authority.",
  },

  // ─────────── United Kingdom ───────────
  "GB:passport": {
    howToObtain:
      "Renew at gov.uk/renew-adult-passport — 3 weeks standard, 1 week premium (£177).",
    leadDaysMin: 7,
    leadDaysMax: 21,
    url: "https://www.gov.uk/renew-adult-passport",
  },
  "GB:police_certificate": {
    howToObtain:
      "ACRO Police Certificate — apply at acro.police.uk. 10 working days standard, 2 working days premium (£105).",
    leadDaysMin: 2,
    leadDaysMax: 15,
    url: "https://www.acro.police.uk/police-certificates",
  },
  "GB:apostille_certified_copies": {
    howToObtain:
      "FCDO Legalisation Office at gov.uk/get-document-legalised — standard 2 working days, premium same-day in person.",
    leadDaysMin: 1,
    leadDaysMax: 5,
    url: "https://www.gov.uk/get-document-legalised",
  },

  // ─────────── Canada ───────────
  "CA:passport": {
    howToObtain:
      "Renew at canada.ca/passport — 10–20 business days standard, 2 days express (extra fee).",
    leadDaysMin: 10,
    leadDaysMax: 30,
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports.html",
  },
  "CA:police_certificate": {
    howToObtain:
      "RCMP Criminal Record Check via an accredited fingerprinting company — typical 3–10 business days.",
    leadDaysMin: 3,
    leadDaysMax: 15,
    url: "https://www.rcmp-grc.gc.ca/en/criminal-record-checks",
  },

  // ─────────── Australia ───────────
  "AU:passport": {
    howToObtain:
      "Renew at passports.gov.au — 6 weeks standard, 2 business days priority (AUD$252 extra).",
    leadDaysMin: 2,
    leadDaysMax: 42,
    url: "https://www.passports.gov.au/getting-passport-how-it-works",
  },
  "AU:police_certificate": {
    howToObtain:
      "AFP National Police Check at afp.gov.au — typically 7–15 business days.",
    leadDaysMin: 7,
    leadDaysMax: 15,
    url: "https://www.afp.gov.au/what-we-do/services/criminal-records",
  },

  // ─────────── New Zealand ───────────
  "NZ:passport": {
    howToObtain:
      "Renew at passports.govt.nz — 10 working days standard, 3 working days urgent (NZD$233 extra).",
    leadDaysMin: 3,
    leadDaysMax: 14,
    url: "https://www.passports.govt.nz/",
  },
  "NZ:police_certificate": {
    howToObtain:
      "Ministry of Justice criminal record check — typically 20 working days.",
    leadDaysMin: 14,
    leadDaysMax: 28,
    url: "https://www.justice.govt.nz/criminal-records/",
  },

  // ─────────── India ───────────
  "IN:passport": {
    howToObtain:
      "Renew at passportindia.gov.in — 7–21 days normal, 1–3 days tatkal (₹2,000 extra).",
    leadDaysMin: 3,
    leadDaysMax: 21,
    url: "https://www.passportindia.gov.in/",
  },
  "IN:police_certificate": {
    howToObtain:
      "PCC issued by your regional passport office (passportindia.gov.in) or local SP — typically 1–3 weeks, longer if your address has changed in the past 5 years.",
    leadDaysMin: 7,
    leadDaysMax: 30,
    url: "https://www.passportindia.gov.in/AppOnlineProject/online/pccInstructions",
  },

  // ─────────── Germany ───────────
  "DE:passport": {
    howToObtain:
      "Renew at your Bürgeramt / Bürgerbüro — 3–6 weeks standard, 1–2 weeks express (€32 extra).",
    leadDaysMin: 7,
    leadDaysMax: 42,
  },
  "DE:police_certificate": {
    howToObtain:
      "Führungszeugnis (Certificate of Good Conduct) — request at your local Bürgeramt; arrives by post in 2–3 weeks.",
    leadDaysMin: 10,
    leadDaysMax: 28,
  },

  // ─────────── France ───────────
  "FR:passport": {
    howToObtain:
      "Renew at any French mairie or service-public.fr — 3–6 weeks (longer in summer).",
    leadDaysMin: 21,
    leadDaysMax: 56,
  },
  "FR:police_certificate": {
    howToObtain:
      "Bulletin n°3 du casier judiciaire — request at cjn.justice.gouv.fr, free, delivered in 5–10 days.",
    leadDaysMin: 5,
    leadDaysMax: 14,
  },

  // ─────────── Brazil ───────────
  "BR:passport": {
    howToObtain:
      "Renew at gov.br/pf/passaporte — appointment at Federal Police, typical 6 business days after biometrics.",
    leadDaysMin: 4,
    leadDaysMax: 14,
  },
  "BR:police_certificate": {
    howToObtain:
      "Atestado de Antecedentes Criminais — free at servicos.pf.gov.br, instant download after authentication.",
    leadDaysMin: 1,
    leadDaysMax: 3,
  },

  // ─────────── South Africa ───────────
  "ZA:police_certificate": {
    howToObtain:
      "Police Clearance Certificate from SAPS Criminal Record Centre via the e-Home Affairs portal — typical 4–8 weeks.",
    leadDaysMin: 28,
    leadDaysMax: 56,
  },

  // ─────────── Nigeria ───────────
  "NG:police_certificate": {
    howToObtain:
      "Nigerian Police Force Character Certificate — apply via npf.gov.ng or any state police HQ. Typical 4–8 weeks.",
    leadDaysMin: 28,
    leadDaysMax: 56,
  },

  // ─────────── Philippines ───────────
  "PH:police_certificate": {
    howToObtain:
      "NBI Clearance at clearance.nbi.gov.ph — instant if no hit, 5–15 days if a name match needs adjudication.",
    leadDaysMin: 1,
    leadDaysMax: 15,
  },

  // ─────────── Pakistan ───────────
  "PK:police_certificate": {
    howToObtain:
      "Police Character Certificate from the local Special Branch — usually 2–4 weeks. Some applicants additionally require an MOFA-attested copy.",
    leadDaysMin: 14,
    leadDaysMax: 35,
  },

  // ─────────── Bangladesh ───────────
  "BD:police_certificate": {
    howToObtain:
      "Police Clearance Certificate from Bangladesh Police pcc.police.gov.bd — typical 2–4 weeks; MOFA attestation often needed for overseas use.",
    leadDaysMin: 14,
    leadDaysMax: 35,
  },

  // ─────────── Singapore ───────────
  "SG:police_certificate": {
    howToObtain:
      "Certificate of Clearance from the Singapore Police Force — 7 working days, S$76. Apply at eservices.police.gov.sg.",
    leadDaysMin: 7,
    leadDaysMax: 14,
  },

  // ─────────── UAE ───────────
  "AE:police_certificate": {
    howToObtain:
      "UAE Federal Authority for Identity & Citizenship — Good Conduct Certificate via the UAE Pass app or moi.gov.ae. Typical 2–5 days.",
    leadDaysMin: 2,
    leadDaysMax: 7,
  },

  // ─────────── Japan ───────────
  "JP:police_certificate": {
    howToObtain:
      "Certificate of Criminal Record from your Prefectural Public Safety Commission — by post, 2–4 weeks.",
    leadDaysMin: 14,
    leadDaysMax: 28,
  },

  // ─────────── Mexico ───────────
  "MX:police_certificate": {
    howToObtain:
      "Constancia de Antecedentes No Penales from your local Procuraduría — typical 1–2 weeks; apostille via SEGOB for overseas use.",
    leadDaysMin: 7,
    leadDaysMax: 21,
  },

  // ─────────── Russia ───────────
  "RU:police_certificate": {
    howToObtain:
      "Справка об отсутствии судимости from the Ministry of Internal Affairs (МВД) — apply via gosuslugi.ru. Typical 30 days.",
    leadDaysMin: 21,
    leadDaysMax: 42,
  },

  // ─────────── China ───────────
  "CN:police_certificate": {
    howToObtain:
      "无犯罪记录证明 (No Criminal Record Certificate) from your hukou-registered local public security bureau (派出所) — typical 1–3 weeks; consular notarisation usually needed for overseas use.",
    leadDaysMin: 7,
    leadDaysMax: 28,
  },

  // ─────────── Language tests by primary language ───────────
  // Native English speakers usually don't need a test for English-medium
  // study/work — handled via the destination's "exempt nationalities" list,
  // not via overrides here. But for non-English passports going to
  // English-medium destinations, the test name + booking lead time matter.
  "CN:language_test": {
    howToObtain:
      "IELTS (book at British Council China) or TOEFL (toefl.org.cn) — 2–3 weeks to a test slot in tier-1 cities, 4+ weeks in smaller cities; results 5–10 days after the test.",
  },
  "IN:language_test": {
    howToObtain:
      "IELTS via British Council India or IDP — usually a slot within 2–3 weeks; results 5–7 days post-test (or 1 day for IELTS Computer).",
  },

  // ─────────── Financial proof ───────────
  "US:financial_proof_longstay": {
    howToObtain:
      "Bank statements from your US bank, plus an IRS Tax Transcript (get.irs.gov/transcripts) for the last 1–2 years if the destination asks for it.",
  },
  "GB:financial_proof_longstay": {
    howToObtain:
      "Bank statements stamped and signed by the bank, plus HMRC SA302 or P60 for proof of income. Some destinations also accept the gov.uk Tax Summary download.",
  },
};
