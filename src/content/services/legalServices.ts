/**
 * Immigration lawyers, migration agents, and cross-border tax accountants.
 *
 * 2026-05-18 — provider listings removed pending affiliate / referral
 * agreements. We don't surface specific commercial firms for free, and
 * we don't accept money to rank a firm — listings only return once a
 * disclosed referral relationship is in place AND each firm is licensed
 * in the jurisdiction they advise on (US AILA, UK OISC, Canadian RCIC,
 * Australian MARA).
 *
 * Until then, the /services/legal-services category page renders the
 * editorial framing (when DIY is fine vs when a lawyer earns the fee,
 * how to pick by jurisdiction + specialism + fee transparency) — that's
 * the part that genuinely helps users.
 *
 * Users with complex cases (appeals, refusal histories, family /
 * humanitarian routes, criminal-record waivers) should consult a
 * qualified, jurisdictionally-licensed professional regardless of any
 * directory we run.
 */
import type { RelocationService } from "@/lib/services";

export const LEGAL_SERVICES: RelocationService[] = [];
