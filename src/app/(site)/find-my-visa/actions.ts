"use server";

import { recommendForAnswers, type Recommendations } from "@/lib/findMyVisa";
import type { QuestionnaireAnswers } from "@/lib/questionnaire";

export async function runQuestionnaire(answers: QuestionnaireAnswers): Promise<Recommendations> {
  return recommendForAnswers(answers);
}
