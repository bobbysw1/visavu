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
import { bilateralContext, destinationSummary, workingHolidayContextHint } from "@/lib/chatBilateralContext";
import { sanitiseChatReply } from "@/lib/linkAllowlist";
import { passportProfileFor } from "@/content/passportProfiles";
import { convertMinor, formatMoney, ratesAsOf } from "@/lib/exchange";
import { checkRateLimit, extractIp, hashIp } from "@/lib/chatRateLimit";
import { getOrCreateConversation, logMessage, estimateTokens } from "@/lib/chatLogger";
import { randomUUID } from "node:crypto";

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
  /** Client-generated UUID stored in a first-party cookie for the
   *  duration of the conversation. Server falls back to generating
   *  one if absent. Not PII. */
  sessionId?: string;
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

/** Format a fee with the applicant's preferred currency conversion alongside.
 *  Example: formatFeeForApplicant({amountMinor: 65000, currency: "AUD"}, "GBP")
 *  → "AUD $650 (≈ £335)"
 *  If applicantCurrency is not given, or equals source, or rate unavailable,
 *  returns the native string only.  */
function formatFeeForApplicant(
  fee: { amountMinor: number; currency: string; label?: string | null },
  applicantCurrency: string | null,
): string {
  const native = formatMoney(fee.amountMinor, fee.currency);
  if (!applicantCurrency || applicantCurrency === fee.currency) {
    return native;
  }
  const converted = convertMinor(fee.amountMinor, fee.currency, applicantCurrency);
  if (converted == null) return native;
  return `${native} (≈ ${formatMoney(converted, applicantCurrency)})`;
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
  const profile = passportProfileFor(passport);
  const applicantCurrency = profile?.preferredCurrency ?? null;

  const lines: string[] = [
    `Visavu verified data for ${nationalityFor(passport)} passport → ${nameFor(destination)} (${purpose}):`,
  ];
  if (applicantCurrency) {
    lines.push(
      `Applicant's preferred currency: ${applicantCurrency}. Fees below are shown in both native + ${applicantCurrency} (≈ converted at FX rate as of ${ratesAsOf()}).`,
    );
  }
  for (const opt of options) {
    const diff = assessDifficulty(opt, baselineTourismStatus as never);
    lines.push(`  - [${opt.status.toUpperCase()}] ${opt.label}`);
    if (opt.maxStayDays) lines.push(`    Max stay: ${opt.maxStayDays} days`);
    if (opt.processingTimeDaysMax)
      lines.push(`    Processing: ${opt.processingTimeDaysMin ?? "?"}-${opt.processingTimeDaysMax} days`);
    lines.push(`    Difficulty: ${diff.score}/10 (${diff.bucket})`);
    if (opt.fees.length > 0) {
      lines.push(
        `    Fees: ${opt.fees
          .map((f) => `${f.kind ?? "base"} ${formatFeeForApplicant(f, applicantCurrency)}${f.label ? ` (${f.label})` : ""}`)
          .join("; ")}`,
      );
    }
    if (opt.requirements.length > 0)
      lines.push(`    Requirements: ${opt.requirements.slice(0, 3).join("; ")}`);
    if (opt.primarySourceUrl) lines.push(`    Source: ${opt.primarySourceUrl}`);
    if (opt.lastVerifiedAt) lines.push(`    Last verified: ${opt.lastVerifiedAt.slice(0, 10)}`);
  }
  return lines.join("\n");
}

/**
 * SYNTHESIS prompts are split by turn to cut tokens on follow-ups.
 *
 * First-turn callers see the FULL prompt — persona + behaviour rules +
 * link allowlist + worked formatting demo. The demo is the most-effective
 * teach-by-example signal for the markdown shape we want, but it's ~30
 * lines (~900 tokens) and the model only needs it once. After turn 1
 * Mistral has its own output to mimic; the demo becomes dead weight.
 *
 * Follow-up callers see the COMPACT prompt — same persona + rules but
 * the demo dropped. Roughly 50% token reduction per follow-up call.
 * Worked out to ~$0.0015 saved per follow-up turn at mistral-large
 * pricing — small per-turn but adds up at scale.
 *
 * pickSynthesisSystem(messageCount) returns the right prompt.
 */
const SYNTHESIS_CORE = `You are Visavu — a knowledgeable, conversational visa expert. You sound like a smart friend who happens to know every visa programme inside out, not a robotic fact-machine. You combine the structured Visavu data in CONTEXT blocks below with general visa knowledge to lead users through DISCOVERY — one or two questions at a time, then a confident specific recommendation.

═══ THE CONVERSATION SHAPE ═══

Turn 1 — vague query ("what visa for Australia?") → acknowledge the destination, drop one bilateral colour note ("UK-AU FTA + AUKUS makes mobility easy"), ASK ONE FOCUSED QUESTION ("Where are you applying from?"). Don't dump lists.

Turn 2 — user answers — acknowledge what their passport unlocks, ASK THE NEXT QUESTION that narrows it ("How old are you, and short-term vs permanent?").

Turn 3+ — give the SPECIFIC recommendation, named with the actual visa code (Subclass 417, EU Blue Card, D7, OCI, K-ETA, AEWV, Express Entry), thresholds in their currency, next-step route trajectory, applicant-specific docs (ACRO for British, FBI for American, ANAPEC for Moroccan, SKCK for Indonesian).

═══ HOW TO BEHAVE ═══

(1) BE WARM + KNOWLEDGEABLE — expert friend, not compliance bot. Use bilateral context (UK-AU FTA, Trans-Tasman, Schengen, Mercosur, Commonwealth, EU/EEA/EFTA, GCC, CPLP) when it fits naturally.

(2) ASK ONE OR TWO SHARP QUESTIONS FIRST when context is incomplete. Critical context to extract progressively: nationality, age (for Youth Mobility 18-30/35), occupation + job-offer status, income/savings, marital status, recent-graduate status + where, time already in destination.

(3) WHEN YOU HAVE ENOUGH CONTEXT, GIVE A CONFIDENT SPECIFIC ANSWER — visa name with actual code, thresholds in their currency, next-step trajectory (WHV → TSS → PR; Student → Graduate → Skilled), applicant-specific docs, cite source URL.

(4) ALWAYS LINK BACK to Visavu — at least 2 URLs per substantive answer:
  - Pair: https://visavu.com/{passport}/{destination}
  - Pair + purpose: https://visavu.com/{passport}/{destination}/{purpose}
  - Destination: https://visavu.com/destination/{iso}
  - Passport: https://visavu.com/passport/{iso}
  - Myths: https://visavu.com/myths
  - Finder: https://visavu.com/finder?passport={ISO}
  - Questionnaire: https://visavu.com/find-my-visa

(5) LINK RULES — STRICT: only visavu.com OR official government domains (.gov, .gov.uk, .gov.au, .gov.in, .gob.es, .gouv.fr, .go.jp, canada.ca, europa.eu, admin.ch, immi.homeaffairs.gov.au). NEVER link to immigration consultants, paid services, Wikipedia, Reddit, blogs, IATA, Henley, THE — they're competitors. If you'd otherwise link to a non-allowlisted source, link the equivalent Visavu page instead.

(6) NEVER: dump generic visa lists as first response; use advice language ("you should"); invent visas/fees/thresholds; add long disclaimers mid-answer.

(7) REFUSE WITH A REFERRAL for: asylum, deportation, criminal records, fraud, lying on applications, specific-case strategy. Those need a regulated adviser (IAA / MARA / CICC / bar-admitted attorney).

═══ TONE + FORMATTING ═══
Conversational, warm, confident. Natural language ("here's the thing", "obvious starting point", "what most people do"). No emoji.

Markdown for scannability (UI renders **bold**, ## headers, - bullets):
  - **Bold** for visa names, salary thresholds, processing times, fees — facts the reader needs to spot at a glance.
  - ## Headers when you have 2+ distinct sections ("## Right now" / "## If you decide to stay" / "## What you'll need").
  - Bulleted lists for 3+ parallel items. Don't bullet 1-2 items.
  - SHORT paragraphs (1-3 sentences). Blank line between thoughts.
  - AVOID parenthetical clutter — break long parentheticals into bullets or sentences.
  - Target 200-300 words. Quality > quantity.`;

const SYNTHESIS_WORKED_EXAMPLE = `

═══ FORMATTING — WORKED EXAMPLE (first turn only) ═══

User asks: "I'm UK, 26. What's my best route to Australia?"

❌ BAD — wall of text, parentheticals, no scanability:
"For a UK passport holder aged 26 looking to move to Australia, the best route is the Working Holiday Visa (subclass 417, three year max stay for UK applicants, AUD $650 fee (approximately £335), processed within 1-30 days), which lets you live and work for up to three years and explore options for permanent residency through the Skilled Independent visa (subclass 189, points-tested at 65+ points minimum, requires English at IELTS 6.0+, occupation on MLTSSL list, fee AUD $4,640) or sponsored work routes (subclass 482, employer-sponsored, salary threshold AUD $73,150)..."

✓ GOOD — bold, headers, bullets, short paragraphs:

"At 26 with a UK passport, you're in a great spot — Australia is genuinely one of the most accessible long-stay routes you have.

## Right now
The obvious starting point is the **Working Holiday Visa (Subclass 417)**. UK applicants get a **3-year max stay** (vs the standard 1 year), fee is **AUD $650** (≈ £335), processed in **1–30 days**. You work for any employer, change jobs freely, and use the time to figure out whether you want to stay long-term.

## If you decide to stay
Three realistic PR pathways from there:

- **Subclass 482 (Skills in Demand)** — employer-sponsored. Salary floor AUD $73,150. Most common route.
- **Subclass 189 (Skilled Independent)** — points-tested (need 65+), no sponsor needed. Best if your occupation is on the MLTSSL.
- **Subclass 491** — regional sponsored. Slower but cheaper points threshold.

## What you'll need to apply
- UK passport valid 6+ months past intended stay
- AUD $5,000 in funds (proof of)
- No serious criminal record
- Health insurance for the stay

Most UK applicants get the 417 approved in under a week. Want me to walk you through the 482 sponsorship process, or focus on what to do in your first 3 months on the WHV?"

Notice: bold keywords, ## headers, bulleted lists for parallel items, short paragraphs, one trailing question. No long parentheticals.`;

const SYNTHESIS_CLOSE = `

═══ END WITH ═══
Always close with the disclaimer on its own line (no header). The disclaimer text: "${DISCLAIMER}"`;

const SYNTHESIS_FIRST_TURN = SYNTHESIS_CORE + SYNTHESIS_WORKED_EXAMPLE + SYNTHESIS_CLOSE;
const SYNTHESIS_FOLLOWUP = SYNTHESIS_CORE + SYNTHESIS_CLOSE;

/** First incoming user message → full prompt with demo. Otherwise compact. */
function pickSynthesisSystem(messages: ChatMessage[]): string {
  const userTurns = messages.filter((m) => m.role === "user").length;
  return userTurns <= 1 ? SYNTHESIS_FIRST_TURN : SYNTHESIS_FOLLOWUP;
}

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

  // ── Rate limit + logging setup ────────────────────────────────────
  // Pulled in front of everything else so an abusive client can't burn
  // through our Mistral budget before we say no. IP is hashed
  // immediately and never held in raw form. Session ID is client-
  // generated when possible (so the conversation persists across
  // refreshes) or server-generated otherwise.
  const ip = extractIp(request);
  const ipHash = hashIp(ip);
  const sessionId = body.sessionId ?? randomUUID();
  // TODO: when /signin auth is wired into the chat client, derive
  // userId from the session here. For now treat all callers as anon.
  const userId: number | null = null;

  const rateLimit = await checkRateLimit({ ipHash, isSignedIn: userId !== null });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        reply: rateLimit.message + "\n\n" + DISCLAIMER,
        type: "rate_limited",
        reason: rateLimit.reason,
      },
      {
        status: 429,
        headers: { "retry-after": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  // Resolve / create the conversation row + log the user message
  // BEFORE any Mistral call so abuse-review can reconstruct what was
  // sent even if Mistral times out mid-call.
  const conversationId = await getOrCreateConversation({ sessionId, userId, ipHash });
  if (conversationId !== null) {
    await logMessage({
      conversationId,
      role: "user",
      content: lastUser.content,
      tokens: estimateTokens(lastUser.content),
    });
  }

  /** Helper: log an assistant reply (refusal or generated). Token
   *  estimate is length/4 since the cheap Mistral path doesn't surface
   *  exact usage stats — within ~30% which is plenty for cost-cap. */
  async function logAssistantReply(content: string, opts: { isRefusal?: boolean; model?: string | null } = {}) {
    if (conversationId === null) return;
    await logMessage({
      conversationId,
      role: "assistant",
      content,
      tokens: estimateTokens(content),
      model: opts.model ?? null,
      isRefusal: opts.isRefusal ?? false,
    });
  }

  // Hard refusal pre-check — don't waste a Mistral call on these.
  if (REFUSAL_PATTERNS.some((p) => p.test(lastUser.content))) {
    const reply =
      "Questions involving asylum, deportation, criminal records, or how to present an application in a particular way are outside what Visavu's information assistant covers. These need a registered immigration adviser (UK: IAA-registered, AU: MARA, CA: CICC, US: state-bar-admitted attorney or BIA-accredited representative).\n\n" +
      DISCLAIMER;
    await logAssistantReply(reply, { isRefusal: true });
    return NextResponse.json({ reply, type: "refusal", sessionId });
  }

  // Step 1: extract intent (Mistral preferred, fallback regex).
  const intentFromMistral = await callMistralJSON(body.messages);
  const intent = intentFromMistral ?? fallbackExtract(lastUser.content);

  if (intent.needs_human_advice) {
    const reply =
      "This sounds like a situation where a registered immigration adviser would help you more than general information can. Look up an IAA-registered adviser (UK), MARA agent (Australia), or CICC consultant (Canada), or a bar-admitted attorney in your destination jurisdiction.\n\n" +
      DISCLAIMER;
    await logAssistantReply(reply, { isRefusal: true });
    return NextResponse.json({ reply, type: "refusal", sessionId });
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

  // If destination is known (even without a passport yet), surface the
  // destination summary so the chat can confidently say "Australia has
  // X visa categories — to narrow this down, which passport do you hold?"
  if (intent.destination_iso2 && !intent.passport_iso2) {
    const destSummary = await destinationSummary(intent.destination_iso2);
    if (destSummary) {
      dataContext += `\n\nDESTINATION SUMMARY:\n${destSummary}`;
    }
  }

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

      // Bilateral relationship — the "UK and Australia share Commonwealth +
      // AUKUS + UK-AU FTA" colour the chat can weave naturally.
      const bilateral = bilateralContext(intent.passport_iso2, intent.destination_iso2);
      if (bilateral.length > 0) {
        dataContext += `\n\nBILATERAL RELATIONSHIP — weave this naturally into the opening:\n${bilateral.map((b) => `- ${b}`).join("\n")}`;
      }

      // Destination-level visa-count summary — lets the chat confidently
      // say "Australia has 60 visa categories in our index".
      const destSummary = await destinationSummary(intent.destination_iso2);
      if (destSummary) {
        dataContext += `\n\nDESTINATION SUMMARY:\n${destSummary}`;
      }

      // Working-Holiday hint for the conversational age-aware route flow.
      const whHint = workingHolidayContextHint(intent.passport_iso2, intent.destination_iso2);
      if (whHint) {
        dataContext += `\n\nWORKING-HOLIDAY HINT (use if applicant is under 30/35 + asking about work / extended stay):\n${whHint}`;
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

  // Pick the right prompt for this turn — first message gets the demo,
  // follow-ups get the compact version (~50% fewer prompt tokens).
  const synthesised = await callMistralText(enrichedMessages, pickSynthesisSystem(body.messages));

  if (synthesised) {
    // Strip any non-allowlisted URLs the model may have invented (only
    // visavu.com + verified government domains are permitted as links).
    const cleanReply = sanitiseChatReply(synthesised);
    await logAssistantReply(cleanReply, { model: MISTRAL_MODEL_SYNTHESIS });
    return NextResponse.json({
      reply: cleanReply,
      type: "synthesised",
      intent,
      sessionId,
    });
  }

  // Fallback if Mistral unavailable: return the context as-is, with the
  // disclaimer. Better than 500'ing.
  const routeHint = intent.passport_iso2 && intent.destination_iso2
    ? `\n\nFor a structured view, visit https://visavu.com/${intent.passport_iso2.toLowerCase()}/${intent.destination_iso2.toLowerCase()}`
    : "";
  const fallbackReply =
    `${dataContext}${routeHint}\n\n${DISCLAIMER}` +
    (process.env.MISTRAL_API_KEY ? "" : "\n\n(Note: AI synthesis unavailable — MISTRAL_API_KEY not configured. Showing raw data.)");
  await logAssistantReply(fallbackReply, { model: null });
  return NextResponse.json({
    reply: fallbackReply,
    type: "fallback",
    intent,
    sessionId,
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
