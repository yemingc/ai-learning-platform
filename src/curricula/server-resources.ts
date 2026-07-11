import "server-only";

import { apCalculusABFormativeAssessments } from "@/features/assessment/formative-assessments";
import { javascriptFoundationsAssessments } from "@/curricula/javascript-foundations";
import type { FormativeAssessmentProvider } from "@/features/assessment/types";

const assessmentProviders = new Map<string, FormativeAssessmentProvider>([
  ["ap-calculus-ab", apCalculusABFormativeAssessments],
  ["javascript-foundations", javascriptFoundationsAssessments],
]);

export function getCurriculumAssessmentProvider(courseId: string) {
  return assessmentProviders.get(courseId);
}
