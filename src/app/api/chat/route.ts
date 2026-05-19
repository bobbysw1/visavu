/**
 * Visavu chat — Mistral-powered visa-information assistant.
 *
 * Two-step pattern:
 *   1. Extract intent (passport iso, destination iso, purpose) from the
 *      latest user message + history. Returns structured JSON.
 *   2. Run resolveRoute() against our PGlite to get authoritative data.
 *   3. Synthesize a natural-language answer grounded ONLY in the
 *      retrieved data. System prompt forbids legal-advice language.
 *
 * Hard rules:
 *  - "information" not "advice" — never recommend specific applications
 *  - refuse asylum / deportation / criminal-record / fraud questions
 *  - cite the lastVerifiedAt date and primary source per visa option
 *  - end every response with the disclaimer
 *
 * Cost-floor: if MISTRAL_API_KEY is unset (local dev, preview deploy),
 * we still return a useful fallback that does the DB lookup + renders
 * the structured data as text. Chat works without Mistral; Mistral adds
 * the conversational layer.
 */
import { NextResponse, type NextRequest } from "next/server";
import { resolveRoute } from "@/lib/resolver";
import { assessDifficulty } from "@/lib/difficulty";
import { COUNTRY_LIST, nameFor } from "@/lib/countries";
import { nationalityFor } from "@/lib/nationalities";
import type { Purpose, ResolvedVisaOption } from "@/lib/types";
import {
  occupationListFor,
  searchOccupations,
  formatOccupationListForChat,
} from "@/content/skilledOccupations";
import { applicantContextSentence } from "@/components/PassportApplicantPanel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MISTRAL_API = "https://api.mistral.ai/v1/chat/completions";
// Synthesis uses mistral-large-latest for the higher reasoning needed to
// ask the right clarifying questions, weave applicant context with route
// data, and produce confident grounded answers. Intent extraction still
// uses mistral-small (a structured JSON task that doesn't need the big
// model — keeps cost down for the high-volume first call).
const MISTRAL_MODEL_INTENT = "mistral-small-latest";
const MISTRAL_MODEL_SYNTHESIS = "mistral-large-latest";

const DISCLAIMER =
  "This is general information, not legal advice. Visa rules change. " +
  "Verify with the destination's official immigration authority or " +
  "book a consultation before acting on this.";

const REFUSAL_PATTERNS = [
  /asylum/i,
  /seeking refuge/i,
  /political persecution/i,
  /deportation/i,
  /removal order/i,
  /criminal record/i,
  /felony/i,
  /conviction/i,
  /lie on (the |my )?(application|visa)/i,
  /fake (marriage|relationship|documents)/i,
  /fraud/i,
  /sham marriage/i,
];

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type ChatRequest = {
  messages: ChatMessage[];
};

type ExtractedIntent = {
  passport_iso2: string | null;
  destination_iso2: string | null;
  purpose: Purpose | null;
  is_general_question: boolean;
  needs_human_advice: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Intent extraction prompt
// ─────────────────────────────────────────────────────────────────────────────
const EXTRACTION_SYSTEM = `You extract structured visa-query intent from a user's message.

Return ONLY JSON matching this exact schema:
{
  "passport_iso2": "GB" | null,        // ISO 3166-1 alpha-2 of the user's passport (lookup country names → ISO)
  "destination_iso2": "FR" | null,     // ISO 3166-1 alpha-2 of the destination country
  "purpose": "tourism"|"business"|"transit"|"work"|"study"|"family"|"diplomatic"|null,
  "is_general_question": true|false,   // true if the question is general (no specific country pair)
  "needs_human_advice": true|false     // true if the question involves: asylum, deportation, criminal records, fraud, ongoing legal cases
}

Rules:
- Use nationality demonyms ("British" → GB, "American" → US, "Canadian" → CA, "Indian" → IN, etc.)
- Default purpose to "tourism" if the question is about visiting / travelling
- "work in" → purpose: "work"
- "study at" → purpose: "study"
- "move to" / "live in" / "join my partner in" → purpose: "family" (for partner) or "work" (for general relocation)
- If the user asks about asylum, deportation, criminal records, lying on applications, or fraud, set needs_human_advice: true
- If the question is purely informational (e.g. "what's the Schengen rule?") set is_general_question: true and passport_iso2/destination_iso2 to null
- Return ONLY the JSON object, no prose, no markdown fences`;

async function callMistralJSON(messages: ChatMessage[]): Promise<ExtractedIntent | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(MISTRAL_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL_INTENT,
        messages: [{ role: "system", content: EXTRACTION_SYSTEM }, ...messages],
        response_format: { type: "json_object" },
        max_tokens: 200,
        temperature: 0.1,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as ExtractedIntent;
  } catch {
    return null;
  }
}

async function callMistralText(messages: ChatMessage[], systemPrompt: string): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(MISTRAL_API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL_SYNTHESIS,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 1200,
        temperature: 0.4,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return json.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback intent extractor — used when MISTRAL_API_KEY is unset, OR when
// Mistral returns no usable JSON. Best-effort regex; better than nothing.
// ─────────────────────────────────────────────────────────────────────────────
function fallbackExtract(userMessage: string): ExtractedIntent {
  const text = userMessage.toLowerCase();
  let passport_iso2: string | null = null;
  let destination_iso2: string | null = null;
  let purpose: Purpose | null = null;

  // Match passport country / nationality
  for (const c of COUNTRY_LIST) {
    const demonym = nationalityFor(c.iso2)?.toLowerCase();
    if (!demonym) continue;
    const reD = new RegExp(`\\b${demonym}\\b`, "i");
    if (reD.test(text)) {
      passport_iso2 = c.iso2;
      break;
    }
  }

  // Match destination — look for "to <Country>" or "in <Country>"
  for (const c of COUNTRY_LIST) {
    const name = c.name.toLowerCase();
    const re = new RegExp(`\\b(to|in|visit|move to|live in|work in)\\s+(the\\s+)?${name}\\b`, "i");
    if (re.test(text) && c.iso2 !== passport_iso2) {
      destination_iso2 = c.iso2;
      break;
    }
  }

  if (/\bwork\b|\bjob\b|\bemploy/.test(text)) purpose = "work";
  else if (/\bstudy\b|\buni|\bcollege|\bschool\b/.test(text)) purpose = "study";
  else if (/\bspouse\b|\bpartner\b|\bmarriage\b|\bfamily\b/.test(text)) purpose = "family";
  else if (/\btransit\b/.test(text)) purpose = "transit";
  else if (/\bbusiness\b|\bmeeting\b/.test(text)) purpose = "business";
  else purpose = "tourism";

  const needs_human_advice = REFUSAL_PATTERNS.some((p) => p.test(text));
  const is_general_question = !passport_iso2 || !destination_iso2;

  return { passport_iso2, destination_iso2, purpose, is_general_question, needs_human_advice };
}

// ─────────────────────────────────────────────────────────────────────────────
// Format the resolved data as a string the synthesis step can ground on
// ─────────────────────────────────────────────────────────────────────────────
/** When intent extraction didn't get a full (passport, destination) tuple,
 *  give the synthesis a useful fallback context: what fields it KNOWS, what's
 *  MISSING, and a hint to ask clarifying questions before answering.
 *  Also injects the same Visavu page URLs the synthesis is required to link. */
function buildGeneralContext(intent: ExtractedIntent): string {
  const known: string[] = [];
  const missing: string[] = [];
  if (intent.passport_iso2) known.push(`passport=${intent.passport_iso2} (${nationalityFor(intent.passport_iso2)})`);
  else missing.push("passport / nationality");
  if (intent.destination_iso2) known.push(`destination=${intent.destination_iso2} (${nameFor(intent.destination_iso2)})`);
  else missing.push("destination country");
  if (intent.purpose) known.push(`purpose=${intent.purpose}`);
  else missing.push("purpose (tourism / work / study / family / business / retirement)");

  const lines = [
    `No specific Visavu route data fetched — intent was incomplete.`,
    known.length > 0 ? `Known from user message: ${known.join(", ")}` : `Nothing concrete known from user yet.`,
    missing.length > 0 ? `Missing (ASK CLARIFYING QUESTIONS to get these before answering): ${missing.join(", ")}` : ``,
    ``,
    `If the user's question is purely informational (e.g. "what's the 90/180 Schengen rule?", "what's the Hague Apostille?", "how does the EU Blue Card work?", "what's a Working Holiday visa?"), answer directly from general visa knowledge — you don't need to ask clarifying questions for those.`,
    ``,
    `VISAVU PAGES YOU CAN LINK (include at least 2 in any answer):`,
    `- /find-my-visa — questionnaire that asks 12 questions and ranks routes`,
    `- /finder — "where can I go?" filter by nationality + goal`,
    `- /myths — fact-checked common immigration rumours`,
    `- /chat — you are here`,
    `- /destination/{iso} — destination-overview pages for every country`,
    `- /passport/{iso} — passport-overview pages for every nationality`,
    intent.passport_iso2 ? `- /passport/${intent.passport_iso2.toLowerCase()} — overview for the ${nationalityFor(intent.passport_iso2)} passport` : ``,
    intent.destination_iso2 ? `- /destination/${intent.destination_iso2.toLowerCase()} — overview for ${nameFor(intent.destination_iso2)}` : ``,
  ].filter((s) => s.length > 0);

  // Per-applicant context if we know nationality.
  if (intent.passport_iso2) {
    const applicantCtx = applicantContextSentence(intent.passport_iso2);
    if (applicantCtx) {
      lines.push(``, `APPLICANT-SPECIFIC DOCUMENTATION (use this to make answers concrete):`, applicantCtx);
    }
  }

  return lines.join("\n");
}

function formatRouteForContext(
  passport: string,
  destination: string,
  purpose: Purpose,
  options: ResolvedVisaOption[],
  baselineTourismStatus: string | null,
): string {
  if (options.length === 0) {
    return `No verified data in Visavu for ${nationalityFor(passport)} passport → ${nameFor(destination)} (${purpose}). The user should check the ${nameFor(destination)} immigration authority directly.`;
  }
  const lines: string[] = [
    `Visavu verified data for ${nationalityFor(passport)} passport → ${nameFor(destination)} (${purpose}):`,
  ];
  for (const opt of options) {
    const diff = assessDifficulty(opt, baselineTourismStatus as never);
    lines.push(`  - [${opt.status.toUpperCase()}] ${opt.label}`);
    if (opt.maxStayDays) lines.push(`    Max stay: ${opt.maxStayDays} days`);
    if (opt.processingTimeDaysMax)
      lines.push(`    Processing: ${opt.processingTimeDaysMin ?? "?"}-${opt.processingTimeDaysMax} days`);
    lines.push(`    Difficulty: ${diff.score}/10 (${diff.bucket})`);
    if (opt.fees.length > 0)
      lines.push(
        `    Fees: ${opt.fees.map((f) => `${f.kind} ${f.amountMinor / 100} ${f.currency}`).join(", ")}`,
      );
    if (opt.requirements.length > 0)
      lines.push(`    Requirements: ${opt.requirements.slice(0, 3).join("; ")}`);
    if (opt.primarySourceUrl) lines.push(`    Source: ${opt.primarySourceUrl}`);
    if (opt.lastVerifiedAt) lines.push(`    Last verified: ${opt.lastVerifiedAt.slice(0, 10)}`);
  }
  return lines.join("\n");
}

const SYNTHESIS_SYSTEM = `You are Visavu's expert visa-information assistant. You combine the structured visa data you are given (in CONTEXT blocks below) with general visa knowledge to give CONFIDENT, SPECIFIC, ACTIONABLE answers. You are NOT a hedging fact-machine.

═══ HOW TO BEHAVE ═══

(1) ASK ONE OR TWO SHARP CLARIFYING QUESTIONS FIRST if the user's question is missing critical context — then in the next turn give the specific answer.

  Critical context is usually: NATIONALITY (always), plus one of:
    - Field / occupation (for work questions)
    - Age (for working-holiday / under-30 routes)
    - Income / savings (for retirement / passive-income / investor)
    - Marital status / family (for spouse / family-reunification)
    - Time already spent (for citizenship / PR)

  Examples of GOOD opening questions:
    User: "What Australian visa can I get? I'm a university graduate."
    You: "To narrow this down — which passport do you hold? Australian visa rules vary heavily by nationality. And is your degree FROM an Australian institution (you'd unlock Subclass 485 Temporary Graduate) or from elsewhere (different routes apply)?"

    User: "How do I retire in Spain?"
    You: "Spain's main retirement route is the Non-Lucrative Visa (NLV). To answer specifically: what's your nationality, and roughly what passive income do you have monthly (pension / annuity / rental / dividends — Spain wants ~€2,400/month for the principal applicant)?"

    User: "Can I work in Germany?"
    You: "Three main routes — EU Blue Card (€48,300+ salary), Skilled Worker (€41,000+ shortage occupations), Chancenkarte job-seeker (12-month entry to find work). To say which fits, what's your nationality, your field, and do you already have a German job offer?"

  DO NOT dump a generic list of every visa as your first response. That's the broken behaviour we're fixing.

(2) WHEN YOU HAVE ENOUGH CONTEXT, GIVE A CONFIDENT SPECIFIC ANSWER:
  - Lead with the most-likely-relevant visa route for their situation, named by its actual visa code (e.g. "Subclass 482 TSS", "EU Blue Card", "D7", "OCI Card", "K-ETA", "ETIAS")
  - State the salary / income / age threshold in their currency where possible
  - Give the processing time + fee
  - Mention the route to settlement / PR if relevant
  - Reference the applicant-specific documents (ACRO for British, FBI check for American, ANAPEC for Moroccan, etc.) — use the APPLICANT-SPECIFIC DOCUMENTATION block when it's in your context
  - Cite the source URL

(3) ALWAYS LINK BACK to the relevant Visavu page so the reader can dig deeper. Use the URLs supplied in the VISAVU PAGES TO LINK block. Specifically:
  - For a specific pair like British → Japan: https://visavu.com/gb/jp
  - For a purpose-specific page: https://visavu.com/gb/jp/work
  - For a destination overview: https://visavu.com/destination/jp
  - For a passport overview: https://visavu.com/passport/gb
  - For myths about a country / visa: https://visavu.com/myths
  - Always include at least 2 relevant Visavu URLs in every substantive answer

(4) NEVER:
  - Use advice language ("you should...", "the best visa for you is...") — use information language ("Available routes include...", "The published requirements are...", "The route most people in your situation use is...")
  - Invent visa names or fees you weren't told
  - Refuse to engage when the CONTEXT block has data — use it confidently
  - Add long disclaimers in the middle of the answer (the disclaimer is at the end only)

(5) REFUSE WITH A REFERRAL if the user asks about: asylum, deportation, criminal records, fraud, lying on applications, or strategy for their specific application case (those need a regulated adviser).

═══ TONE ═══
Plain English, confident, specific, helpful. Short paragraphs and bullets. No emoji. ~250 words excluding disclaimer.

═══ END WITH ═══
Always close with: "${DISCLAIMER}"`;

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.messages || body.messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ error: "no user message found" }, { status: 400 });
  }

  // Hard refusal pre-check — don't waste a Mistral call on these.
  if (REFUSAL_PATTERNS.some((p) => p.test(lastUser.content))) {
    return NextResponse.json({
      reply:
        "Questions involving asylum, deportation, criminal records, or how to present an application in a particular way are outside what Visavu's information assistant covers. These need a registered immigration adviser (UK: IAA-registered, AU: MARA, CA: CICC, US: state-bar-admitted attorney or BIA-accredited representative).\n\n" +
        DISCLAIMER,
      type: "refusal",
    });
  }

  // Step 1: extract intent (Mistral preferred, fallback regex).
  const intentFromMistral = await callMistralJSON(body.messages);
  const intent = intentFromMistral ?? fallbackExtract(lastUser.content);

  if (intent.needs_human_advice) {
    return NextResponse.json({
      reply:
        "This sounds like a situation where a registered immigration adviser would help you more than general information can. Look up an IAA-registered adviser (UK), MARA agent (Australia), or CICC consultant (Canada), or a bar-admitted attorney in your destination jurisdiction.\n\n" +
        DISCLAIMER,
      type: "refusal",
    });
  }

  // Detect occupation-related questions and pull in the relevant
  // skilled-occupation list so the synthesis can ground on actual
  // ANZSCO / SOC / NOC codes instead of returning "I don't have data".
  const occupationContext = buildOccupationContext(
    lastUser.content,
    intent.destination_iso2,
  );

  // Step 2: lookup our data if we have a concrete route.
  let dataContext = buildGeneralContext(intent);
  if (intent.passport_iso2 && intent.destination_iso2) {
    const purpose = intent.purpose ?? "tourism";
    try {
      const route = await resolveRoute({
        passportIso2: intent.passport_iso2,
        destinationIso2: intent.destination_iso2,
        purpose,
      });
      dataContext = formatRouteForContext(
        intent.passport_iso2,
        intent.destination_iso2,
        purpose,
        route.primary,
        route.baselineTourismStatus,
      );

      // Surface ALTERNATIVE purposes for the same pair so the chat can
      // compare — e.g. user asks about Australia work, we also show study,
      // family, retirement options so the model can suggest the better-fit
      // route if work isn't the right answer for their situation.
      const altLines: string[] = [];
      for (const alt of route.alternatives) {
        if (alt.purpose === purpose) continue;
        if (alt.options.length === 0) continue;
        const top = alt.options[0];
        altLines.push(
          `  - ${alt.purpose}: ${top.label} (${top.status}${top.maxStayDays ? `, ${top.maxStayDays}d` : ""}${top.fees[0] ? `, ${top.fees[0].amountMinor / 100} ${top.fees[0].currency}` : ""})`,
        );
      }
      if (altLines.length > 0) {
        dataContext += `\n\nOTHER PURPOSES for ${nationalityFor(intent.passport_iso2)} → ${nameFor(intent.destination_iso2)} (mention as alternatives if relevant):\n${altLines.join("\n")}`;
      }

      // Explicit Visavu page URLs the synthesis step should LINK to in its reply.
      const p = intent.passport_iso2.toLowerCase();
      const d = intent.destination_iso2.toLowerCase();
      dataContext += `\n\nVISAVU PAGES TO LINK IN YOUR REPLY (include at least 2 of these in every substantive answer):\n` +
        `- Full pair page: https://visavu.com/${p}/${d}\n` +
        `- Purpose-specific page: https://visavu.com/${p}/${d}/${purpose}\n` +
        `- Destination overview: https://visavu.com/destination/${d}\n` +
        `- Passport overview: https://visavu.com/passport/${p}\n` +
        `- Common rumours / myths about ${nameFor(intent.destination_iso2)}: https://visavu.com/myths\n` +
        `- Where can ${nationalityFor(intent.passport_iso2)} go? https://visavu.com/finder?passport=${intent.passport_iso2.toUpperCase()}`;

      // Per-applicant documentation overlay — what the generic "police
      // clearance" + "apostille" actually mean for this passport-holder.
      const applicantCtx = applicantContextSentence(intent.passport_iso2);
      if (applicantCtx) {
        dataContext += `\n\nAPPLICANT-SPECIFIC DOCUMENTATION (use this to make answers concrete instead of generic):\n${applicantCtx}`;
      }
    } catch {
      dataContext = `Could not load Visavu data for ${intent.passport_iso2} → ${intent.destination_iso2}.`;
    }
  }

  // Step 3: synthesise via Mistral, or fall back to the raw context.
  const enrichedMessages: ChatMessage[] = [
    ...body.messages,
    { role: "system", content: `Visavu data for this query:\n${dataContext}` },
    ...(occupationContext
      ? [{ role: "system" as const, content: `Skilled-occupation reference data:\n${occupationContext}` }]
      : []),
  ];

  const synthesised = await callMistralText(enrichedMessages, SYNTHESIS_SYSTEM);

  if (synthesised) {
    return NextResponse.json({
      reply: synthesised,
      type: "synthesised",
      intent,
    });
  }

  // Fallback if Mistral unavailable: return the context as-is, with the
  // disclaimer. Better than 500'ing.
  const routeHint = intent.passport_iso2 && intent.destination_iso2
    ? `\n\nFor a structured view, visit https://visavu.com/${intent.passport_iso2.toLowerCase()}/${intent.destination_iso2.toLowerCase()}`
    : "";
  return NextResponse.json({
    reply:
      `${dataContext}${routeHint}\n\n${DISCLAIMER}` +
      (process.env.MISTRAL_API_KEY ? "" : "\n\n(Note: AI synthesis unavailable — MISTRAL_API_KEY not configured. Showing raw data.)"),
    type: "fallback",
    intent,
  });
}

// ─────────────────────────────────────────────────────────────────────
// Occupation-context builder — detects occupation-related questions and
// returns the relevant skilled-occupation list as grounding text for
// the synthesis step.
// ─────────────────────────────────────────────────────────────────────
function buildOccupationContext(
  userMessage: string,
  destinationIso2: string | null,
): string | null {
  // Trigger conditions: explicit list lookup (e.g. "what's on Australia's
  // skilled occupation list?") OR a job-keyword lookup.
  const listMention = /(\b(skilled[\s-]?(occupation|migration))\b|\bshortage[\s-]?(occupation|list)\b|\bNOC\b|\bANZSCO\b|\bgreen[\s-]list\b|\bSOL\b|\bCSOL\b|\bdesired profession|\b(in[\s-])?demand (job|occupation|profession|skill))/i.test(
    userMessage,
  );

  const jobKeyword = /\b(engineer|nurse|doctor|teacher|programmer|developer|software|chef|electrician|plumber|carpenter|welder|accountant|pharmacist|surveyor|midwife|paramedic|physiotherapist|mechanic|architect|dentist|lawyer|veterinarian)\b/i.test(
    userMessage,
  );

  if (!listMention && !jobKeyword) return null;

  // If the destination resolved to AU / GB / CA / NZ, include that country's
  // full list as the primary context.
  if (destinationIso2) {
    const list = occupationListFor(destinationIso2);
    if (list) return formatOccupationListForChat(list);
  }

  // Otherwise (or if destination's list isn't curated), try a job-keyword
  // search across all lists.
  if (jobKeyword) {
    const tokens = userMessage.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? [];
    for (const token of tokens) {
      const hits = searchOccupations(token, 6);
      if (hits.length > 0) {
        const lines = [
          `Occupation matches across all curated lists for "${token}":`,
          ...hits.map((h) => {
            const salary = h.occupation.salaryNote ? ` — ${h.occupation.salaryNote}` : "";
            return `  • [${h.country.iso2}] ${h.occupation.title} (${h.occupation.code}) → ${h.occupation.visas.join(", ")}${salary}`;
          }),
          "",
          "Official source URLs for full lists:",
          "  Australia (CSOL) — https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list",
          "  UK (Skilled Worker eligibility) — https://www.gov.uk/skilled-worker-visa/eligibility",
          "  Canada (NOC 2021) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-workers.html",
          "  New Zealand (Green List) — https://www.immigration.govt.nz/new-zealand-visas/preparing-a-visa-application/working-in-nz/work-visa-options/green-list-occupations",
        ];
        return lines.join("\n");
      }
    }
  }

  return null;
}
