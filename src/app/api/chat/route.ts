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
 *  - disclaimer is shown persistently in the chat UI (above the textarea
 *    on /chat, below the input on FloatingChatLauncher), NOT appended
 *    to every reply — the latter made every answer feel like a legal
 *    notice and stretched the prompt budget
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

// Per-message disclaimers were removed in favour of one persistent UI
// disclaimer (DisclaimerBanner on /chat above the conversation; inline
// "General information, not legal advice" line under the FloatingChat
// input box). Stamping a disclaimer paragraph onto every reply made the
// chat feel like a compliance form rather than a knowledgeable friend —
// and the legal effect of repeating it is no stronger than displaying
// it once persistently.

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

/**
 * Intent schema used to feed both data-lookup + synthesis.
 *
 * Designed around real-world emigration questions, not just "what visa
 * for X" lookups. Three categories of fields:
 *
 *   1. CORE ROUTE — passport_iso2 / destination_iso2 / purpose — the
 *      classic "what visa do I need" lookup tuple.
 *   2. MULTI-APPLICANT — spouse_passport_iso2 / is_couple — captures the
 *      common case where someone is moving WITH a partner whose
 *      nationality often changes the answer dramatically (e.g. EU
 *      spouse → EU family-reunification right that completely bypasses
 *      the work-route ranking). Throwing this away was the single
 *      biggest source of "useless reply" failures.
 *   3. CONTEXT — profession / is_open_exploration / is_general_question
 *      — lets the bot recognise "I'm a doctor, where can we go?" as a
 *      profession-led open exploration (recommend destinations) rather
 *      than gating on "you didn't specify a destination, please tell me
 *      a country".
 */
type ExtractedIntent = {
  passport_iso2: string | null;
  /** Secondary applicant's passport — set when the user mentions a
   *  spouse / partner / family member with a DIFFERENT nationality.
   *  Critical for couples: an EU passport in the household unlocks
   *  family-reunification routes that change every recommendation. */
  spouse_passport_iso2: string | null;
  destination_iso2: string | null;
  purpose: Purpose | null;
  /** Occupation in plain English ("doctor", "software engineer", "nurse",
   *  "teacher", "chef"). Drives skilled-occupation list lookups + the
   *  PROFESSION-LED synthesis mode. Free text so we don't have to maintain
   *  an ANZSCO/SOC enum here. */
  profession: string | null;
  /** True when the user mentions "we", "my wife", "my husband", "my
   *  partner" — signals a 2-applicant query even if spouse_passport
   *  couldn't be pinned to an ISO. */
  is_couple: boolean;
  /** True when the user is asking open-ended "where could we go" /
   *  "what are the best places" / "options for X" — i.e. they want a
   *  ranked shortlist, NOT a single-destination lookup. Setting this
   *  bypasses the "ask for destination" gate. */
  is_open_exploration: boolean;
  is_general_question: boolean;
  needs_human_advice: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Intent extraction prompt
// ─────────────────────────────────────────────────────────────────────────────
const EXTRACTION_SYSTEM = `You extract structured visa-query intent from a user's message.

Return ONLY JSON matching this exact schema:
{
  "passport_iso2": "GB" | null,             // PRIMARY applicant's passport (ISO 3166-1 alpha-2)
  "spouse_passport_iso2": "DE" | null,      // Secondary applicant (spouse / partner / family member) if mentioned with a DIFFERENT nationality
  "destination_iso2": "FR" | null,          // Destination country if specified
  "purpose": "tourism"|"business"|"transit"|"work"|"study"|"family"|"diplomatic"|null,
  "profession": "doctor" | null,            // Occupation if mentioned in plain English ("doctor", "software engineer", "nurse", "teacher", "chef", "pharmacist", etc.). Null if not stated.
  "is_couple": true|false,                  // True when user says "we", "my wife/husband/partner", "us"
  "is_open_exploration": true|false,        // True when user asks open-ended "where can we go" / "what are the best places" / "what are our options" / "best ways to emigrate" — they want a RANKED SHORTLIST, not a single-destination lookup. NEVER set destination_iso2 for these.
  "is_general_question": true|false,        // True if the question is purely informational (e.g. "what's the Schengen rule?")
  "needs_human_advice": true|false          // True only for: asylum, deportation, criminal records, fraud, ongoing legal cases
}

Rules:
- Demonyms → ISO: "British" → GB, "American" → US, "Canadian" → CA, "Indian" → IN, "German" → DE, "Belarusian" → BY, "Polish" → PL, "Ukrainian" → UA, "Chinese" → CN, "Filipino" → PH, "Brazilian" → BR, "Mexican" → MX, etc.
- COUPLES — when the user mentions "my wife/husband/partner" with a nationality (e.g. "I'm Belarusian, my wife is German"), put the SPEAKER's nationality in passport_iso2 and the SPOUSE's in spouse_passport_iso2. Set is_couple: true.
- "we're both doctors" / "I'm a software engineer" → profession field; do NOT also set purpose: "work" unless they ALSO explicitly mention working in a specific country.
- "where can we go" / "best places to emigrate" / "what are our options" / "what countries should we consider" → is_open_exploration: true. Do NOT guess a destination.
- Default purpose to "tourism" ONLY if the question is genuinely about visiting / travelling. Do NOT default to tourism for emigration questions — leave purpose null and rely on profession + is_open_exploration.
- "move to X" / "live in X" / "emigrate to X" → purpose: "work" (or "family" if joining a partner specifically)
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

/**
 * Robust Mistral call with retry + automatic fallback to mistral-small
 * if mistral-large is unavailable (429 rate limit, 5xx outage). Logs
 * every failure to stderr so Vercel function logs surface them — the
 * previous silent-return-null behaviour meant the chat would degrade
 * to the buildCleanFallback path without any signal in production
 * logs as to WHY synthesis was failing.
 *
 * Retry behaviour:
 *   - 1 retry on 429 (rate limit) after 800ms
 *   - 1 retry on 5xx (server error) after 400ms
 *   - On second failure, retry once more against mistral-small
 *   - All other errors (4xx other than 429, network, JSON parse): one log + return null
 *
 * Total worst-case latency: ~3s including two backoffs and the model
 * fallback. Under maxDuration: 30s budget.
 */
async function callMistralText(messages: ChatMessage[], systemPrompt: string): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.warn("[chat] MISTRAL_API_KEY unset — synthesis disabled");
    return null;
  }

  const attempts: Array<{ model: string; backoffMs: number }> = [
    { model: MISTRAL_MODEL_SYNTHESIS, backoffMs: 0 },
    { model: MISTRAL_MODEL_SYNTHESIS, backoffMs: 600 },
    { model: MISTRAL_MODEL_INTENT, backoffMs: 800 }, // cheaper fallback model
  ];

  for (let i = 0; i < attempts.length; i++) {
    const { model, backoffMs } = attempts[i];
    if (backoffMs > 0) await new Promise((r) => setTimeout(r, backoffMs));
    try {
      const res = await fetch(MISTRAL_API, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          // Structured-output mode — we ask Mistral to return JSON of
          // shape {type: "answer"|"ask", content: "...", options?: [...]}.
          // See SYNTHESIS_CORE for the schema spec.
          response_format: { type: "json_object" },
          // 2200 lets the multi-applicant / open-exploration replies
          // run to ~800 words with structured 6-option breakdowns
          // without hitting the cap mid-section (the previous 1400
          // truncated those answers right around option 4).
          max_tokens: 2200,
          temperature: 0.4,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.warn(
          `[chat] mistral ${model} returned ${res.status} (attempt ${i + 1}/${attempts.length}): ${body.slice(0, 200)}`,
        );
        // 4xx other than 429 = our bug, retrying won't help
        if (res.status >= 400 && res.status < 500 && res.status !== 429) break;
        continue;
      }
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        console.warn(`[chat] mistral ${model} returned empty content`);
        continue;
      }
      if (i > 0) {
        console.log(`[chat] mistral synthesis recovered on attempt ${i + 1} (model=${model})`);
      }
      return content;
    } catch (err) {
      console.warn(
        `[chat] mistral ${model} threw (attempt ${i + 1}/${attempts.length}):`,
        err instanceof Error ? err.message : err,
      );
      // network error — retry the loop
    }
  }
  console.error("[chat] mistral synthesis exhausted all retries");
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback intent extractor — used when MISTRAL_API_KEY is unset, OR when
// Mistral returns no usable JSON. Best-effort regex; better than nothing.
// ─────────────────────────────────────────────────────────────────────────────
/** Short-form nationality aliases users actually write. Users say "uk"
 *  far more often than "British"; "usa" / "us" more than "American";
 *  "aussie" / "kiwi" colloquially. The fallback regex matches the full
 *  demonym (nationalityFor) but those terms can be the only signal in
 *  a casual message like "can I move to Russia from uk for a job". */
const NATIONALITY_ALIASES: Record<string, string> = {
  uk: "GB", "u.k.": "GB", britain: "GB", "great britain": "GB",
  us: "US", "u.s.": "US", usa: "US", "u.s.a.": "US", america: "US",
  aussie: "AU", oz: "AU",
  kiwi: "NZ",
  canuck: "CA",
  brit: "GB", brits: "GB",
  yank: "US", yankee: "US",
  euro: null as unknown as string, european: null as unknown as string,
};

/** Profession keywords the fallback extractor recognises. Mistral
 *  (the primary path) is much more flexible — this is just for the
 *  no-API-key / Mistral-failed case. Keep curated to the common ones;
 *  the skilled-occupation list lookup catches the long tail. */
const PROFESSION_KEYWORDS: ReadonlyArray<[RegExp, string]> = [
  [/\b(doctor|physician|gp|surgeon|medic)\b/i, "doctor"],
  [/\b(nurse|nursing)\b/i, "nurse"],
  [/\b(software|web|backend|frontend|fullstack)\s+(engineer|dev(?:eloper)?)\b/i, "software engineer"],
  [/\b(software engineer|developer|programmer|coder)\b/i, "software engineer"],
  [/\b(teacher|teaching|educator)\b/i, "teacher"],
  [/\b(chef|cook)\b/i, "chef"],
  [/\b(accountant|accounting)\b/i, "accountant"],
  [/\b(architect)\b/i, "architect"],
  [/\b(pharmacist|pharmacy)\b/i, "pharmacist"],
  [/\b(dentist|dentistry)\b/i, "dentist"],
  [/\b(lawyer|attorney|solicitor|barrister)\b/i, "lawyer"],
  [/\b(electrician)\b/i, "electrician"],
  [/\b(plumber)\b/i, "plumber"],
  [/\b(welder)\b/i, "welder"],
  [/\b(mechanic)\b/i, "mechanic"],
  [/\b(veterinarian|vet)\b/i, "veterinarian"],
  [/\b(midwife)\b/i, "midwife"],
  [/\b(paramedic)\b/i, "paramedic"],
  [/\b(physio(?:therapist)?)\b/i, "physiotherapist"],
  [/\b(scientist|researcher|phd)\b/i, "scientist"],
];

function fallbackExtract(userMessage: string): ExtractedIntent {
  const text = userMessage.toLowerCase();
  let passport_iso2: string | null = null;
  let spouse_passport_iso2: string | null = null;
  let destination_iso2: string | null = null;
  let purpose: Purpose | null = null;

  // Collect every nationality mention up to 2 (primary + spouse).
  // The FIRST match becomes passport_iso2; if there's a spouse keyword
  // before/after another nationality, that becomes spouse_passport_iso2.
  const nationalityMatches: Array<{ iso: string; index: number }> = [];
  for (const [alias, iso] of Object.entries(NATIONALITY_ALIASES)) {
    if (!iso) continue;
    const re = new RegExp(`\\b${alias}\\b`, "i");
    const m = re.exec(text);
    if (m) nationalityMatches.push({ iso, index: m.index });
  }
  for (const c of COUNTRY_LIST) {
    const demonym = nationalityFor(c.iso2)?.toLowerCase();
    if (!demonym) continue;
    const re = new RegExp(`\\b${demonym}\\b`, "i");
    const m = re.exec(text);
    if (m && !nationalityMatches.some((n) => n.iso === c.iso2)) {
      nationalityMatches.push({ iso: c.iso2, index: m.index });
    }
  }
  // "from <country>" as a final signal for casual phrasing
  for (const c of COUNTRY_LIST) {
    const name = c.name.toLowerCase();
    const re = new RegExp(`\\bfrom\\s+(the\\s+)?${name}\\b`, "i");
    const m = re.exec(text);
    if (m && !nationalityMatches.some((n) => n.iso === c.iso2)) {
      nationalityMatches.push({ iso: c.iso2, index: m.index });
    }
  }
  nationalityMatches.sort((a, b) => a.index - b.index);
  if (nationalityMatches.length > 0) passport_iso2 = nationalityMatches[0].iso;
  if (nationalityMatches.length > 1) spouse_passport_iso2 = nationalityMatches[1].iso;

  // Couple detection
  const is_couple = /\b(my (wife|husband|partner|spouse|fiance[e]?)|we(?:'re| are)?|our|us)\b/i.test(text);

  // Match destination — look for "to <Country>" or "in <Country>" — but
  // skip if it's a passport or spouse country
  for (const c of COUNTRY_LIST) {
    const name = c.name.toLowerCase();
    const re = new RegExp(`\\b(to|in|visit|move to|live in|work in|emigrate to)\\s+(the\\s+)?${name}\\b`, "i");
    if (re.test(text) && c.iso2 !== passport_iso2 && c.iso2 !== spouse_passport_iso2) {
      destination_iso2 = c.iso2;
      break;
    }
  }

  // Open-ended exploration phrasing — "where can we go", "best ways to
  // emigrate", "what are our options", "what countries should we
  // consider". When this fires we DON'T pretend destination_iso2 is set
  // — the user wants a recommendation, not a lookup.
  const is_open_exploration =
    !destination_iso2 &&
    /\b(where\s+(can|could|should)\s+(we|i|us)|best\s+(ways?|places?|countr(?:y|ies))\s+to\s+(emigrate|move|live|relocate|go)|what\s+(are\s+)?(our|my)\s+(options|choices)|recommend\s+(a\s+)?countr|which\s+countr(?:y|ies)\s+should)/i.test(
      text,
    );

  // Profession detection
  let profession: string | null = null;
  for (const [re, label] of PROFESSION_KEYWORDS) {
    if (re.test(text)) {
      profession = label;
      break;
    }
  }

  // Purpose — don't default to tourism for clear emigration questions
  // (those should leave purpose null and rely on profession +
  // is_open_exploration to drive the synthesis).
  const isEmigrationQuery =
    /\b(emigrate|relocate|move (to|abroad|overseas)|live (in|abroad)|life in|long.?term)\b/i.test(text);
  if (/\bwork\b|\bjob\b|\bemploy/.test(text)) purpose = "work";
  else if (/\bstudy\b|\buni|\bcollege|\bschool\b/.test(text)) purpose = "study";
  else if (/\bspouse\b|\bpartner\b|\bmarriage\b|\bfamily\b/.test(text)) purpose = "family";
  else if (/\btransit\b/.test(text)) purpose = "transit";
  else if (/\bbusiness\b|\bmeeting\b/.test(text)) purpose = "business";
  else if (isEmigrationQuery || is_open_exploration) purpose = null;
  else purpose = "tourism";

  const needs_human_advice = REFUSAL_PATTERNS.some((p) => p.test(text));
  const is_general_question = !passport_iso2 && !destination_iso2;

  return {
    passport_iso2,
    spouse_passport_iso2,
    destination_iso2,
    purpose,
    profession,
    is_couple,
    is_open_exploration,
    is_general_question,
    needs_human_advice,
  };
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
  if (intent.passport_iso2) known.push(`primary passport=${intent.passport_iso2} (${nationalityFor(intent.passport_iso2)})`);
  else missing.push("primary passport / nationality");
  if (intent.spouse_passport_iso2) {
    known.push(`spouse passport=${intent.spouse_passport_iso2} (${nationalityFor(intent.spouse_passport_iso2)})`);
  }
  if (intent.is_couple && !intent.spouse_passport_iso2) {
    known.push(`couple / 2-applicant query (spouse nationality unknown)`);
  }
  if (intent.profession) known.push(`profession=${intent.profession}`);
  if (intent.destination_iso2) known.push(`destination=${intent.destination_iso2} (${nameFor(intent.destination_iso2)})`);
  else if (intent.is_open_exploration) {
    known.push(
      `OPEN EXPLORATION — user wants a ranked shortlist of destinations, NOT a single-country lookup. Do NOT ask "which country are you going to" — they're asking YOU to recommend.`,
    );
  } else {
    missing.push("destination country");
  }
  if (intent.purpose) known.push(`purpose=${intent.purpose}`);
  else if (!intent.is_open_exploration) {
    missing.push("purpose (tourism / work / study / family / business / retirement)");
  }

  const lines = [
    `No specific Visavu route data fetched — intent was incomplete${intent.is_open_exploration ? " (but this is an open-exploration question — answer it directly with a recommended shortlist)" : ""}.`,
    known.length > 0 ? `KNOWN FROM USER MESSAGE: ${known.join("; ")}` : `Nothing concrete known from user yet.`,
    missing.length > 0
      ? `MISSING (only ask for these if they're truly needed for a useful answer — never re-ask for info already in KNOWN): ${missing.join(", ")}`
      : ``,
    ``,
    `ABSOLUTE RULE: NEVER re-ask the user for information that's already in KNOWN above. They told you their nationality / spouse / profession / question — USE IT. Re-asking is the #1 reason users leave the chat.`,
    ``,
    `If the user's question is purely informational (e.g. "what's the 90/180 Schengen rule?", "what's the Hague Apostille?", "how does the EU Blue Card work?", "what's a Working Holiday visa?"), answer directly from general visa knowledge — you don't need to ask clarifying questions for those.`,
    ``,
    `VISAVU PAGES YOU CAN LINK (include at least 2 in any substantive answer):`,
    `- /find-my-visa — questionnaire that asks 12 questions and ranks routes`,
    `- /finder — "where can I go?" filter by nationality + goal`,
    `- /myths — fact-checked common immigration rumours`,
    `- /destination/{iso} — destination-overview pages for every country`,
    `- /passport/{iso} — passport-overview pages for every nationality`,
    intent.passport_iso2 ? `- /passport/${intent.passport_iso2.toLowerCase()} — overview for the ${nationalityFor(intent.passport_iso2)} passport` : ``,
    intent.spouse_passport_iso2 ? `- /passport/${intent.spouse_passport_iso2.toLowerCase()} — overview for the ${nationalityFor(intent.spouse_passport_iso2)} passport (spouse)` : ``,
    intent.destination_iso2 ? `- /destination/${intent.destination_iso2.toLowerCase()} — overview for ${nameFor(intent.destination_iso2)}` : ``,
  ].filter((s) => s.length > 0);

  // Per-applicant context for the primary passport.
  if (intent.passport_iso2) {
    const applicantCtx = applicantContextSentence(intent.passport_iso2);
    if (applicantCtx) {
      lines.push(``, `PRIMARY-APPLICANT DOCUMENTATION (use to make answers concrete):`, applicantCtx);
    }
  }
  // And the spouse if their passport differs — surfaces e.g. that an EU
  // spouse unlocks family-reunification routes anywhere in the EEA.
  if (intent.spouse_passport_iso2) {
    const spouseCtx = applicantContextSentence(intent.spouse_passport_iso2);
    if (spouseCtx) {
      lines.push(``, `SPOUSE-APPLICANT DOCUMENTATION:`, spouseCtx);
    }
    lines.push(
      ``,
      `MULTI-APPLICANT NOTE: when one passport in the household is EU/EEA/CH, the other applicant has automatic right to live/work anywhere in the EU/EEA/CH via the Free Movement Directive (2004/38/EC) — usually faster, cheaper, and lower-friction than ANY work-visa route. ALWAYS surface this first when applicable.`,
    );
  }

  // Profession anchor — lets the model anchor recommendations on the
  // shortage-occupation lists rather than generic visa categories.
  if (intent.profession) {
    lines.push(
      ``,
      `PROFESSION ANCHOR: user is a ${intent.profession}. Anchor recommendations on countries where this occupation is on the shortage/skills-in-demand list. For doctors/nurses/teachers/engineers, the top destinations to recommend are usually: Germany (EU), Australia (Subclass 189/482), Canada (Express Entry), UK (Skilled Worker), New Zealand (Green List), Ireland (Critical Skills). Mention licensing/registration as the actual bottleneck — for medical professions especially, it's never the visa that's hard, it's the medical board registration.`,
    );
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

═══ OUTPUT FORMAT — MANDATORY ═══

You MUST respond with valid JSON in one of two shapes:

  (A) When you have enough context to give a specific recommendation OR
      when the user asked an OVERVIEW question that doesn't need a clarifier
      (see "OVERVIEW vs DRILL-DOWN" below):
    {
      "type": "answer",
      "content": "<your prose answer in markdown — ~200-300 words for drill-down replies, ~400-600 words for overview replies. Use ## headers, **bold** visa names, - bullets.>"
    }

  (B) When you need ONE specific piece of information to give a useful answer
      (most commonly: missing nationality for a destination drill-down):
    {
      "type": "ask",
      "content": "<a warm, conversational ONE-LINE question — like 'Which passport do you hold? UK rules differ a lot from EU or Indian rules.'>",
      "options": [
        "<short concrete answer pill, e.g. 'UK / British'>",
        "<short concrete answer pill, e.g. 'US / American'>",
        "<short concrete answer pill, e.g. 'Indian'>",
        "<short concrete answer pill, e.g. 'EU citizen'>"
      ]
    }

OPTIONS rules:
  - Provide 3-5 options, each a short concrete answer (1-3 words ideally)
  - Make them the MOST LIKELY answers for THIS user's context (e.g. if they asked about Russia work, list common UK/EU/Indian/Other not random nationalities)
  - The last option should always be a generic alternative like "Other (I'll type it)" or "Not sure — show me everything"
  - Options must be self-contained — when the user clicks one, the text becomes their next message verbatim, so it must read naturally as a reply
  - Never use options for purpose unless purpose is genuinely unclear — usually the user's question reveals work/study/family/visit

You must NEVER output prose outside the JSON. The renderer will display content as markdown and (if present) options as clickable pills.

═══ DETECT THE INTENT FIRST — FOUR CATEGORIES ═══

Real visa questions fall into one of four shapes. Detect which from the user's phrasing AND the CONTEXT block (which surfaces KNOWN intent fields including is_couple, is_open_exploration, profession, spouse_passport).

(1) OVERVIEW intent — single applicant, specific destination, wants the full menu of paths.
  Triggers: "What are the (best) ways to emigrate / move / relocate to X", "options for living/working/retiring in X", "routes to PR/citizenship in X"
  Action: answer with the OVERVIEW worked example structure. NO clarifier.

(2) MULTI-APPLICANT / OPEN-EXPLORATION — the user is asking on behalf of a couple/family AND/OR asks "where can we go" without specifying a destination.
  Triggers: spouse_passport set, is_couple=true, is_open_exploration=true, "where can we go", "what countries should we consider", "best places for us"
  Action: answer with the COUPLE/EXPLORATION worked example structure. NO clarifier asking for nationality/destination — they've ALREADY told you. Anchor on:
    - Both passports (the stronger one usually unlocks family-reunification or free-movement routes that change everything)
    - The profession (use the PROFESSION ANCHOR in CONTEXT to pick destinations where the job is on a shortage list)
    - Rank 4-6 realistic destinations with parallel sub-structure per destination

(3) PROFESSION-LED — user mentions an occupation but no destination ("I'm a software engineer, where should I move?").
  Triggers: profession set in CONTEXT, is_open_exploration=true, no destination
  Action: same shape as (2). Recommend destinations where that profession is shortage-listed. Mention licensing/registration (it's almost always the bottleneck — for doctors/nurses especially, the visa is easy, the medical board is hard).

(4) DRILL-DOWN — single specific question, one applicant, may or may not have a destination.
  Triggers: "Can I get visa X", "I'm a [nationality] and want to [verb] [country]", "cheapest/fastest route from A to B"
  Action: if all context present → DRILL-DOWN worked example. If something critical is genuinely missing AND not in CONTEXT.KNOWN → ask ONE focused question.

═══ THE CONVERSATION SHAPE (DRILL-DOWN ONLY) ═══

Turn 1 — vague drill-down query ("what visa for Australia?") → acknowledge the destination, drop one bilateral colour note ("UK-AU FTA + AUKUS makes mobility easy"), ASK ONE FOCUSED QUESTION ("Where are you applying from?"). Don't dump lists.

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

═══ FORMATTING — WORKED EXAMPLES (first turn only) ═══

──── EXAMPLE 1: OVERVIEW QUERY ────

User asks: "What are the best ways to emigrate to Australia?"

Notice: NO clarifier first. This is an overview query — they want a menu of paths, not a tailored recommendation. Just answer.

✓ GOOD — comprehensive, structured, scannable. Each option gets the same sub-structure (who it's for, requirements, cost, time) so the user can compare across them. Closes with a "what most people do" and concrete next step:

"Australia has five mainstream pathways. Which fits depends on age, profession, and whether you have a job offer or family link — but here's the full menu, ranked roughly by how many people actually use each.

## 1. Skilled Independent Visa (Subclass 189)
The blue-ribbon route — permanent residency from day one, no employer or state needed.
- **Who it's for:** professionals under 45 with an occupation on the MLTSSL (Medium and Long-term Strategic Skills List).
- **Requirements:** 65+ points (age, English, work experience, education), skills assessment from the relevant assessing body, IELTS 6.0+ equivalent.
- **Cost:** AUD $4,640 main applicant.
- **Processing:** 6–12 months from invitation.

## 2. Employer-Sponsored Visa (Subclass 482 → 186)
Most common path for people already working in their field.
- **Who it's for:** anyone with a job offer from an approved Australian sponsor in an eligible occupation.
- **Requirements:** **AUD $73,150** minimum salary (TSMIT threshold), 2+ years' experience in the role.
- **Cost:** AUD $1,495–$3,115 depending on stream; employer usually pays the nomination fee (AUD $540).
- **Processing:** 2–6 months. After 2 years on a 482 you can transition to PR via the 186.

## 3. Working Holiday Visa (Subclass 417 / 462)
Best entry route if you're young and want to test the waters.
- **Who it's for:** **18–35** (UK, Canada, France, Ireland, Italy + others) or 18–30 (most other eligible countries).
- **Requirements:** AUD $5,000 in funds, no dependants, valid passport.
- **Cost:** AUD $650.
- **Processing:** 1–4 weeks. UK applicants get a 3-year max stay; most others get 1 year (extendable to 3 with regional work).

## 4. Skilled Nominated / Regional (Subclass 190 / 491)
Same idea as 189 but with a state nomination — lower points threshold.
- **Who it's for:** professionals whose occupation is on a state's list rather than the federal MLTSSL.
- **Requirements:** 65+ points (incl. 5 from nomination); 491 also requires regional living for 3 years.
- **Cost:** AUD $4,640.
- **Processing:** 9–18 months.

## 5. Family & Partner Visas (Subclass 309 / 820 / 143)
For partners, parents, and dependent children of citizens/PRs.
- **Cost:** **AUD $9,095** for partner visas (one of the world's most expensive — budget for this).
- **Processing:** 18–24 months for partner, 5+ years for parents.

## What most people actually do
Two pragmatic shapes:
- **Under 35, no job lined up:** start on the 417 Working Holiday, find sponsorship inside Australia, transition to 482 → 186.
- **30+ with a strong CV:** lodge an Expression of Interest for the 189 directly. If you don't get invited in 6 months, pivot to 482 with a sponsor.

## Best next steps
1. Run your profile through [Visavu's Find My Visa](https://visavu.com/find-my-visa) — ranks all 5 routes by your odds.
2. Check if your occupation sits on the MLTSSL: https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list
3. Get a skills assessment from the relevant body (it's the longest-lead-time step — start it before you do anything else).

If you want me to dig into a specific pathway, tell me your nationality and rough age and I'll narrow it to what's actually realistic for you."

──── EXAMPLE 2: COUPLE / OPEN-EXPLORATION / PROFESSION-LED ────

User asks: "I'm from Belarus, my wife is from Germany, we're both doctors, where can we go?"

Notice: ABSOLUTELY NO clarifier. The user gave you four signals (his nationality, her nationality, profession, open exploration). RE-ASKING any of these is a failure. The correct response uses ALL of them.

✓ GOOD — surfaces the free-movement unlock first (because the German passport changes the entire answer), then a ranked shortlist anchored on doctor-friendly destinations:

"Great context — and your wife's German passport is the most important single fact here. It means the whole EU/EEA/Switzerland is already open to BOTH of you with zero visa, via the EU Free Movement Directive. That's almost always faster, cheaper, and easier than any work-visa route in any other country.

Here's the realistic shortlist for two doctors in your situation.

## 1. Germany (and the rest of the EU/EEA/Switzerland)
The default starting point — your wife works automatically, you get a **Residence Card for Family Members of EU Citizens** (Aufenthaltskarte) which is essentially rubber-stamped: typically issued in 2-3 months, free, and gives you immediate right to work.
- **Bottleneck:** German medical recognition (*Approbation*) — state-level, ~6-12 months, requires B2/C1 German + paperwork translation. UK/EU medical degrees are usually recognised automatically; Belarusian degrees may need an equivalency review.
- **Why it's #1:** zero immigration friction, your wife's home, strongest medical-economy market in continental Europe.

## 2. Other EU/EEA countries (Ireland, Netherlands, Sweden, Austria, etc.)
Same family-reunification mechanism as Germany. The doctor shortage in Ireland and the Nordics is severe — both actively recruit foreign-trained physicians.
- **Best for English-speakers:** Ireland (Medical Council registration), Netherlands (BIG registration, but Dutch ~B2 needed for clinical work).

## 3. Australia
Both of you could apply via skilled migration. Doctors are on the **Medium and Long-term Strategic Skills List (MLTSSL)** — top-tier shortage occupation.
- **Visas:** Subclass 189 (Skilled Independent, points-tested PR) or Subclass 482 (employer-sponsored, then transition to 186).
- **Bottleneck:** AHPRA registration via the **Australian Medical Council** — needs IELTS 7.0+ across all bands, then AMC exams unless you qualify under the Competent Authority Pathway (UK/IE/CA/US/NZ-trained only; Belarusian + German degrees would need full AMC route, ~12-18 months).

## 4. Canada
Doctors are NOC 31102 (Specialists in clinical and laboratory medicine) — heavy priority in **Express Entry**.
- **Visas:** Federal Skilled Worker (Express Entry) or provincial nominee programs (Quebec specifically welcomes francophone physicians).
- **Bottleneck:** provincial Medical College + MCC exams. Recognition of EU degrees varies by province; Ontario and BC are the most demanding.

## 5. UK
Doctors are on the **Shortage Occupation List** → **Skilled Worker visa** with reduced salary threshold (~£32k vs the usual £38k), faster processing.
- **Visas:** Skilled Worker (5-year route to PR), or the dedicated **Health and Care Worker visa** (cheaper fee, exempt from Immigration Health Surcharge).
- **Bottleneck:** GMC registration + PLAB exams (or EU-trained recognition for your wife — that's an automatic GMC entry under post-Brexit arrangements).

## 6. New Zealand
Doctors are on the **Green List Tier 1** — straight-to-residence pathway, fastest in the OECD for medical professionals.
- **Bottleneck:** MCNZ registration; NZREX exam unless you qualify under a recognised-jurisdiction pathway.

## What I'd actually recommend
Two pragmatic shapes depending on your priorities:

- **Easiest + fastest:** Move to Germany on free movement, get Approbation, work for 5-10 years, naturalise (your wife already has DE citizenship; you'd be eligible after 3 years of marriage + residence under §9 StAG). You both end up with EU passports — maximum optionality forever.
- **Highest income + climate change:** Australia or New Zealand on skilled migration. ~18 months from "start AMC/MCNZ" to "registered + working", but median doctor salary is materially higher than Europe and the lifestyle pull is real.

## Best next steps
1. Tell me your medical specialties — GPs, surgeons, anaesthetists, paediatricians etc. have very different routes and salaries. I can be much more specific.
2. Check the German Approbation requirements for your specialty: https://www.aerzteblatt.de (Bundesärztekammer maintains the official lists)
3. If Australia/NZ appeals, get your IELTS booked NOW — it's the longest-lead-time step and 7.0 across all four bands is harder than people expect.
4. Browse the destination pages: [Germany](https://visavu.com/destination/de), [Australia](https://visavu.com/destination/au), [Canada](https://visavu.com/destination/ca), [UK](https://visavu.com/destination/gb)."

Notice: addresses BOTH applicants by name (you / your wife), uses the German passport as the unlocking insight, anchors every recommendation on doctor-relevant detail (Approbation / AHPRA / GMC / MCNZ), gives concrete name-of-exam bottlenecks, doesn't pretend the visa is the hard part, closes with a real next question (specialty) that actually moves the conversation forward.

──── EXAMPLE 3: DRILL-DOWN ANSWER ────

User asks: "I'm UK, 26. What's my best route to Australia?"

✓ GOOD — single-route recommendation, much shorter, conversational:

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

──── KEY DIFFERENCES ────

Both use the same building blocks (## headers, **bold** facts, bullets). The OVERVIEW version is longer because it has more options to cover; each option gets a parallel sub-structure (who/requirements/cost/processing) so the user can scan across. The DRILL-DOWN version commits to one recommendation, names it confidently, and offers a follow-up.

❌ BAD shape — wall of text, parentheticals everywhere, no scanability:
"For a UK passport holder aged 26 looking to move to Australia, the best route is the Working Holiday Visa (subclass 417, three year max stay for UK applicants, AUD $650 fee (approximately £335), processed within 1-30 days), which lets you live and work for up to three years and explore options for permanent residency through the Skilled Independent visa (subclass 189, points-tested at 65+ points minimum...)" — never do this.`;

const SYNTHESIS_FIRST_TURN = SYNTHESIS_CORE + SYNTHESIS_WORKED_EXAMPLE;
const SYNTHESIS_FOLLOWUP = SYNTHESIS_CORE;

/** First turn → full prompt with worked examples. Follow-ups → compact
 *  (the model has already shown it can produce the right shape). EXCEPT
 *  when the current turn is a multi-applicant / open-exploration query,
 *  in which case the full prompt is worth resending because the worked
 *  example for that mode is what unlocks the comprehensive answer shape.
 *  Without this branch, follow-up multi-applicant queries would degrade
 *  to flat one-paragraph answers — the worst-of-both-worlds.
 */
function pickSynthesisSystem(messages: ChatMessage[], intent: ExtractedIntent): string {
  const userTurns = messages.filter((m) => m.role === "user").length;
  const richContext = intent.is_couple || intent.is_open_exploration || intent.spouse_passport_iso2 || intent.profession;
  if (userTurns <= 1 || richContext) return SYNTHESIS_FIRST_TURN;
  return SYNTHESIS_FOLLOWUP;
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
        reply: rateLimit.message,
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
      "Questions involving asylum, deportation, criminal records, or how to present an application in a particular way are outside what Visavu's information assistant covers. These need a registered immigration adviser (UK: IAA-registered, AU: MARA, CA: CICC, US: state-bar-admitted attorney or BIA-accredited representative).";
    await logAssistantReply(reply, { isRefusal: true });
    return NextResponse.json({ reply, type: "refusal", sessionId });
  }

  // Step 1: extract intent (Mistral preferred, fallback regex).
  const intentFromMistral = await callMistralJSON(body.messages);
  const intent = intentFromMistral ?? fallbackExtract(lastUser.content);

  if (intent.needs_human_advice) {
    const reply =
      "This sounds like a situation where a registered immigration adviser would help you more than general information can. Look up an IAA-registered adviser (UK), MARA agent (Australia), or CICC consultant (Canada), or a bar-admitted attorney in your destination jurisdiction.";
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
  const synthesised = await callMistralText(enrichedMessages, pickSynthesisSystem(body.messages, intent));

  if (synthesised) {
    // Mistral now responds in structured JSON ({type: answer|ask,
    // content, options?}). Parse + route to the right response shape.
    const parsed = parseStructured(synthesised);

    if (parsed.type === "ask") {
      // Clarifying-question turn — content is the question text, options
      // are the multiple-choice pills the chat UI will render. No URL
      // sanitisation needed (questions don't link); options pass through
      // verbatim so they become the user's literal next message on click.
      const reply = sanitiseChatReply(parsed.content);
      await logAssistantReply(reply, { model: MISTRAL_MODEL_SYNTHESIS });
      return NextResponse.json({
        reply,
        type: "ask",
        intent,
        sessionId,
        clarifying: { options: parsed.options ?? [] },
      });
    }

    // type === "answer" — strip non-allowlisted URLs the model may have
    // invented (only visavu.com + verified gov domains permitted).
    const cleanReply = sanitiseChatReply(parsed.content);
    await logAssistantReply(cleanReply, { model: MISTRAL_MODEL_SYNTHESIS });
    return NextResponse.json({
      reply: cleanReply,
      type: "synthesised",
      intent,
      sessionId,
    });
  }

  // Mistral synthesis unavailable (API key missing OR the call returned
  // null / timed out after all retries). Build a CLEAN human-readable
  // fallback instead of dumping the LLM-facing dataContext (which
  // contains instruction text meant for the LLM). The fallback either
  // gives a catalogue pointer (if we have full route) or asks the
  // missing piece in plain English — same UX shape as the Mistral
  // path, just without the warmth of a real LLM-composed reply.
  const fallbackReply = buildCleanFallback(intent, lastUser.content);
  const fallbackOptions = buildFallbackOptions(intent);
  await logAssistantReply(fallbackReply, { model: null });
  return NextResponse.json({
    reply: fallbackReply,
    type: fallbackOptions ? "ask" : "fallback",
    intent,
    sessionId,
    ...(fallbackOptions ? { clarifying: { options: fallbackOptions } } : {}),
  });
}

/**
 * Parse the structured JSON Mistral now returns. The system prompt
 * mandates {type: "answer" | "ask", content: string, options?: string[]}
 * but we defensively fall back to treating any non-JSON output as a
 * plain answer (older Mistral versions or transient json-mode failures
 * shouldn't break the UX).
 */
function parseStructured(raw: string): { type: "answer" | "ask"; content: string; options?: string[] } {
  // Strip markdown code fences if Mistral wrapped the JSON.
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const obj = JSON.parse(cleaned) as { type?: string; content?: string; options?: unknown };
    const type = obj.type === "ask" ? "ask" : "answer";
    const content = typeof obj.content === "string" ? obj.content : raw;
    const options = Array.isArray(obj.options)
      ? obj.options
          .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
          .slice(0, 6)
      : undefined;
    return { type, content, options };
  } catch {
    // Mistral returned prose despite the system-prompt instruction —
    // treat the whole thing as an answer.
    return { type: "answer", content: raw };
  }
}

/** Build sensible clarifying-options for the FALLBACK path (when
 *  Mistral is unavailable). Mirrors what Mistral would produce so the
 *  UI works identically. Returns null when we have a full route — no
 *  clarification needed in that case. */
function buildFallbackOptions(intent: ExtractedIntent): string[] | null {
  // Full route → no ask
  if (intent.passport_iso2 && intent.destination_iso2) return null;
  // Open-exploration / couple / profession-led → not a clarifying turn,
  // the fallback should answer with a shortlist (no pills).
  if (intent.is_open_exploration || intent.spouse_passport_iso2 || intent.profession) return null;
  // Missing passport — offer the 4 most common nationalities + Other
  if (!intent.passport_iso2) {
    return ["UK / British", "US / American", "Indian", "EU citizen", "Other (I'll type it)"];
  }
  // Have passport, missing destination — offer top destinations
  return ["United States", "United Kingdom", "Australia", "Canada", "Schengen Europe", "Other (I'll type it)"];
}

/** Build a user-facing reply when Mistral synthesis isn't available.
 *  Cases handled (most specific first):
 *    0. Couple / open-exploration / profession-led → use the rich
 *       context to write a SHORTLIST starter response, NOT a "what
 *       country?" clarifier. This was the dumb-fallback failure mode
 *       for queries like "Belarusian + German doctors, where can we
 *       go?" — old code threw away the spouse + profession and asked
 *       "what country?" which is the opposite of helpful.
 *    1. We have passport + destination → direct catalogue pointer.
 *    2. We have destination but no passport → ask for nationality.
 *    3. We have passport but no destination AND no rich context →
 *       ask for country + purpose.
 *    4. Nothing concrete → point at the questionnaire. */
function buildCleanFallback(intent: ExtractedIntent, userMessage: string): string {
  const p = intent.passport_iso2;
  const sp = intent.spouse_passport_iso2;
  const d = intent.destination_iso2;
  const purpose = intent.purpose ?? "tourism";

  // CASE 0: rich-context queries — write a shortlist response that
  // ACKNOWLEDGES the context they gave us. Even without Mistral we can
  // produce something useful by leaning on the static profession +
  // free-movement rules.
  if (intent.is_open_exploration || sp || (intent.profession && !d)) {
    return buildRichContextFallback(intent);
  }

  if (p && d) {
    const purposeLabel = purpose === "tourism" ? "visit" : purpose;
    return [
      `For a ${nationalityFor(p)} citizen moving to ${nameFor(d)} to ${purposeLabel}, the full catalogue of routes Visavu has indexed sits here:`,
      ``,
      `- **All visa routes:** https://visavu.com/${p.toLowerCase()}/${d.toLowerCase()}`,
      `- **Filtered by ${purposeLabel}:** https://visavu.com/${p.toLowerCase()}/${d.toLowerCase()}/${purpose}`,
      `- **Country overview:** https://visavu.com/destination/${d.toLowerCase()}`,
      ``,
      `Each route page shows the visa name, fee in your currency, processing time, and source link.`,
    ].join("\n");
  }

  if (d && !p) {
    const destName = nameFor(d);
    const purposeLabel = purpose === "tourism" ? "visit" : purpose;
    return [
      `To answer for ${destName} (${purposeLabel}), I need to know which passport you hold — visa rules vary enormously by nationality. Could you tell me your nationality, and I'll give you the specific routes?`,
      ``,
      `If you'd rather browse rather than chat, the [${destName} overview](https://visavu.com/destination/${d.toLowerCase()}) lists every visa category, or [Find my visa](https://visavu.com/find-my-visa) walks you through a 12-question wizard.`,
    ].join("\n");
  }

  if (p && !d) {
    return [
      `Got it — you're a ${nationalityFor(p)} citizen. Which country are you trying to go to, and for what purpose (visit / work / study / family)?`,
      ``,
      `If you want to see every destination at once, [Where can ${nationalityFor(p)} go?](https://visavu.com/passport/${p.toLowerCase()}) is the per-passport overview.`,
    ].join("\n");
  }

  // Nothing concrete extracted. Point at the wizard.
  // userMessage echoed in a "you asked:" header so the user knows we
  // received them (useful when the chat looks like it ignored input).
  const trimmed = userMessage.length > 120 ? userMessage.slice(0, 120) + "…" : userMessage;
  return [
    `I couldn't pull a specific (passport, destination) combination from "${trimmed}". To get a useful answer, tell me:`,
    ``,
    `- Your nationality (e.g. UK, Indian, Australian)`,
    `- Where you want to go`,
    `- Why (visit / work / study / family / business)`,
    ``,
    `Or skip the chat entirely and use [Find my visa](https://visavu.com/find-my-visa) — 12 questions and you get five ranked lists of routes that fit your profile.`,
  ].join("\n");
}

/** EU/EEA/CH iso2s. Member countries enjoy reciprocal free-movement
 *  with each other under the EU Free Movement Directive (2004/38/EC)
 *  and the EEA/Switzerland bilateral. Critically: when ONE applicant
 *  in a household has one of these passports, the other applicant
 *  (regardless of their nationality) gets automatic right to live + work
 *  in all 31 member states via the family-reunification carve-out. This
 *  changes the answer to "where can we go" so much that it deserves to
 *  be surfaced first, before any other recommendation. */
const EU_EEA_CH = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "CH",
]);

function buildRichContextFallback(intent: ExtractedIntent): string {
  const p = intent.passport_iso2;
  const sp = intent.spouse_passport_iso2;
  const profession = intent.profession;

  const lines: string[] = [];

  // Opening sentence — acknowledges everything they told us, in their words.
  const who: string[] = [];
  if (p) who.push(`a ${nationalityFor(p)} passport`);
  if (sp) who.push(`a ${nationalityFor(sp)} passport`);
  const whoPart = who.length > 0 ? `With ${who.join(" + ")} in the household` : "Open-ended emigration question";
  const jobPart = profession ? ` and ${intent.is_couple ? "both of you working as " : "working as a "}${profession}${intent.is_couple ? "s" : ""}` : "";
  lines.push(`${whoPart}${jobPart} — here's the realistic shortlist.`, ``);

  // Free movement unlock — surface FIRST if applicable.
  const euMember = [p, sp].find((iso) => iso && EU_EEA_CH.has(iso));
  if (euMember) {
    const otherIso = euMember === p ? sp : p;
    lines.push(
      `## The free-movement unlock`,
      ``,
      `Your ${nationalityFor(euMember)} passport opens the entire **EU/EEA/Switzerland** (31 countries) immediately — zero visa, automatic right to live and work anywhere from Portugal to Finland.${
        otherIso
          ? ` Your ${nationalityFor(otherIso)} partner gets a **Residence Card for Family Members of EU Citizens** (typically issued in 2-3 months, free, immediate work rights).`
          : ""
      } This is almost always faster, cheaper, and lower-friction than any work-visa route.`,
      ``,
      `Browse [${nationalityFor(euMember)} passport overview](https://visavu.com/passport/${euMember.toLowerCase()}) for the full picture.`,
      ``,
    );
  }

  // Profession-anchored shortlist.
  if (profession) {
    const isMedical = /doctor|nurse|midwife|paramedic|pharmacist|dentist|physio|surgeon/i.test(profession);
    lines.push(
      `## Top destinations for ${profession}s`,
      ``,
      `These countries actively recruit foreign-trained ${profession}s and have the occupation on their shortage list:`,
      ``,
      `- **Germany** — EU. Recognition via ${isMedical ? "*Approbation* (state-level)" : "the relevant chamber"}. [→](https://visavu.com/destination/de)`,
      `- **Australia** — Subclass 189 (skilled independent PR) or 482 (employer-sponsored). ${isMedical ? "Bottleneck: AHPRA + AMC exams." : "Bottleneck: skills assessment."} [→](https://visavu.com/destination/au)`,
      `- **Canada** — Express Entry (federal skilled worker) or provincial nominee. ${isMedical ? "Bottleneck: provincial Medical College + MCC." : "Bottleneck: ECA + provincial regulator."} [→](https://visavu.com/destination/ca)`,
      `- **UK** — Skilled Worker visa with shortage-occupation discount. ${isMedical ? "Bottleneck: GMC registration + PLAB exams (or recognised pathway)." : "Bottleneck: sponsor licence + Certificate of Sponsorship."} [→](https://visavu.com/destination/gb)`,
      `- **New Zealand** — Green List tier-1 occupations get a straight-to-residence pathway. [→](https://visavu.com/destination/nz)`,
      `- **Ireland** — Critical Skills Employment Permit, fast-track to PR. [→](https://visavu.com/destination/ie)`,
      ``,
    );
    if (isMedical) {
      lines.push(
        `**The real bottleneck for medical professions is NEVER the visa** — it's the medical board registration. Plan your IELTS (7.0+ across all bands for most English-speaking registers) and your equivalency assessment FIRST; the visa application takes weeks, the registration takes months.`,
        ``,
      );
    }
  } else {
    // No profession — point at the questionnaire.
    lines.push(
      `## What I'd suggest`,
      ``,
      `For a personalised ranking based on your situation, run our [Find My Visa](https://visavu.com/find-my-visa) wizard — 12 questions, returns five ranked routes that fit your profile.`,
      ``,
    );
  }

  lines.push(
    `## Next question`,
    ``,
    profession
      ? `Tell me your ${profession === "doctor" ? "medical specialty (GP, surgeon, anaesthetist, etc.)" : "specific area of expertise"} and I can narrow this dramatically. Different specialties have very different recognition routes.`
      : `Which 2-3 of these countries interest you most? I can give you the concrete next-step roadmap for each.`,
  );

  return lines.join("\n");
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
