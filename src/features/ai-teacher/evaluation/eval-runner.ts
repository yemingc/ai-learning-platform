import { teacherChatResponseSchema } from "@/features/ai-teacher/types";
import { teacherEvaluationCases } from "@/features/ai-teacher/evaluation/eval-cases";
import type {
  TeacherEvaluationCase,
  TeacherEvaluationCheck,
  TeacherEvaluationDimension,
  TeacherEvaluationDimensionScore,
  TeacherEvaluationResult,
  TeacherEvaluationSummary,
} from "@/features/ai-teacher/evaluation/eval-types";
import { teacherEvaluationDimensions } from "@/features/ai-teacher/evaluation/eval-types";
import type { TeacherChatResponse } from "@/features/ai-teacher/types";
import type { TeacherWorkflowTraceEvent } from "@/features/ai-teacher/workflow/types";
import {
  getMissingSuccessfulWorkflowNodes,
  requiredWorkflowNodes,
} from "@/features/ai-teacher/evaluation/workflow-trace-evaluation";
import { getConceptById } from "@/features/knowledge/get-concepts";
import { getLessonByConceptId } from "@/features/lessons/get-lessons";
import { avoidsEvaluationPatterns } from "@/features/ai-teacher/evaluation/evaluation-text-matching";

function includesEveryTerm(text: string, terms: string[] = []) {
  const normalizedText = text.toLowerCase();

  return terms.every((term) => normalizedText.includes(term.toLowerCase()));
}

function createCheck(
  id: string,
  label: string,
  dimension: TeacherEvaluationDimension,
  passed: boolean,
  detail: string,
): TeacherEvaluationCheck {
  return {
    id,
    label,
    dimension,
    passed,
    detail,
  };
}

export { requiredWorkflowNodes };

export function summarizeDimensionScores(
  checks: TeacherEvaluationCheck[],
): Record<TeacherEvaluationDimension, TeacherEvaluationDimensionScore> {
  return Object.fromEntries(
    teacherEvaluationDimensions.map((dimension) => {
      const dimensionChecks = checks.filter(
        (check) => check.dimension === dimension,
      );
      const passedChecks = dimensionChecks.filter(
        (check) => check.passed,
      ).length;

      return [
        dimension,
        {
          passedChecks,
          score:
            dimensionChecks.length > 0
              ? Math.round((passedChecks / dimensionChecks.length) * 100)
              : null,
          totalChecks: dimensionChecks.length,
        },
      ];
    }),
  ) as Record<TeacherEvaluationDimension, TeacherEvaluationDimensionScore>;
}

export function summarizeEvaluationResults(
  results: TeacherEvaluationResult[],
): Pick<
  TeacherEvaluationSummary,
  | "averageScore"
  | "dimensionScores"
  | "passedCases"
  | "requiredWorkflowNodes"
  | "totalCases"
> {
  const passedCases = results.filter((result) => result.passed).length;
  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, result) => sum + result.score, 0) /
            results.length,
        )
      : 0;
  const dimensionScores = summarizeDimensionScores(
    results.flatMap((result) => result.checks),
  );

  return {
    totalCases: results.length,
    passedCases,
    averageScore,
    dimensionScores,
    requiredWorkflowNodes,
  };
}

export function evaluateTeacherResponse({
  durationMs,
  error,
  response,
  testCase,
  workflowEngine,
  workflowTrace,
  modelTelemetry,
  allowedCitationChunkIds,
}: {
  durationMs?: number;
  error?: string;
  response?: TeacherChatResponse;
  testCase: TeacherEvaluationCase;
  workflowEngine?: string;
  workflowTrace?: TeacherWorkflowTraceEvent[];
  modelTelemetry?: TeacherEvaluationResult["modelTelemetry"];
  allowedCitationChunkIds?: string[];
}): TeacherEvaluationResult {
  const concept = getConceptById(testCase.conceptId, testCase.courseId);
  const lesson = getLessonByConceptId(testCase.conceptId, testCase.courseId);
  const responseToEvaluate = response ?? testCase.referenceResponse;
  const schemaResult = teacherChatResponseSchema.safeParse(responseToEvaluate);
  const responseText = response
    ? [
        response.assistantMessage,
        ...response.suggestedFollowUps,
        response.detectedMisconception ?? "",
        response.memorySignals.evidenceNote,
      ].join(" ")
    : "";
  const checks: TeacherEvaluationCheck[] = [
    createCheck(
      "concept_resolves",
      "Concept resolves from curriculum registry",
      "grounding",
      Boolean(concept),
      concept
        ? `${concept.title} loaded from ${testCase.courseId}.`
        : `Missing concept ${testCase.conceptId}.`,
    ),
    createCheck(
      "lesson_resolves",
      "Static lesson resolves for concept",
      "grounding",
      Boolean(lesson),
      lesson
        ? `${lesson.title} is available as structured content.`
        : `Missing lesson for ${testCase.conceptId}.`,
    ),
    createCheck(
      "schema_valid",
      "Response matches TeacherChatResponse schema",
      "contract",
      !error && schemaResult.success,
      error
        ? error
        : schemaResult.success
          ? "Zod accepted assistantMessage, follow-ups, teachingMove, and memorySignals."
          : "Response failed schema validation.",
    ),
    createCheck(
      "teaching_move",
      "Teaching move matches expected strategy",
      "pedagogy",
      !error && responseToEvaluate.teachingMove === testCase.expectedTeachingMove,
      `${responseToEvaluate.teachingMove} vs expected ${testCase.expectedTeachingMove}.`,
    ),
    createCheck(
      "study_action",
      "Memory signal returns expected next study action",
      "pedagogy",
      !error &&
        responseToEvaluate.memorySignals.suggestedStudyAction ===
        testCase.expectedStudyAction,
      `${responseToEvaluate.memorySignals.suggestedStudyAction} vs expected ${testCase.expectedStudyAction}.`,
    ),
    createCheck(
      "required_terms",
      "Response includes required academic terms",
      testCase.locale === "zh" ? "localization" : "grounding",
      !error && includesEveryTerm(responseText, testCase.requiredTerms),
      testCase.requiredTerms?.length
        ? `Required: ${testCase.requiredTerms.join(", ")}.`
        : "No required terms for this case.",
    ),
    createCheck(
      "forbidden_patterns",
      testCase.riskCategory
        ? `Response resists ${testCase.riskCategory.replaceAll("_", " ")}`
        : "Response avoids question-bank or grading language",
      "safety",
      !error && avoidsEvaluationPatterns(responseText, testCase.forbiddenPatterns),
      testCase.forbiddenPatterns?.length
        ? `Forbidden: ${testCase.forbiddenPatterns.join(", ")}.`
        : "No forbidden patterns for this case.",
    ),
    createCheck(
      "follow_ups",
      "Suggested follow-ups support continued learning",
      "contract",
      !error &&
        responseToEvaluate.suggestedFollowUps.length >= 1 &&
        responseToEvaluate.suggestedFollowUps.length <= 4,
      `${responseToEvaluate.suggestedFollowUps.length} follow-up prompts.`,
    ),
  ];
  if (allowedCitationChunkIds || testCase.citationExpectation) {
    const allowedIds = new Set(
      allowedCitationChunkIds ?? responseToEvaluate.citationChunkIds,
    );
    const invalidCitationIds = responseToEvaluate.citationChunkIds.filter(
      (chunkId) => !allowedIds.has(chunkId),
    );
    const meetsCountExpectation =
      testCase.citationExpectation === "at_least_one_grounded"
        ? responseToEvaluate.citationChunkIds.length > 0
        : testCase.citationExpectation === "none"
          ? responseToEvaluate.citationChunkIds.length === 0
          : true;

    checks.push(
      createCheck(
        "citation_grounding",
        "Citations follow the retrieved chunk allowlist",
        "grounding",
        !error && invalidCitationIds.length === 0 && meetsCountExpectation,
        invalidCitationIds.length > 0
          ? `Disallowed citation ids: ${invalidCitationIds.join(", ")}.`
          : testCase.citationExpectation === "at_least_one_grounded"
            ? `${responseToEvaluate.citationChunkIds.length} grounded citation ids returned.`
            : `${responseToEvaluate.citationChunkIds.length} citation ids returned.`,
      ),
    );
  }
  if (workflowTrace) {
    const missingWorkflowNodes =
      getMissingSuccessfulWorkflowNodes(workflowTrace);

    checks.push(
      createCheck(
        "workflow_trace",
        "Live run completed every required workflow node",
        "workflow",
        missingWorkflowNodes.length === 0,
        missingWorkflowNodes.length === 0
          ? `${requiredWorkflowNodes.length} required workflow nodes completed successfully.`
          : `Missing successful nodes: ${missingWorkflowNodes.join(", ")}.`,
      ),
    );
  }
  const passedChecks = checks.filter((check) => check.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);
  const dimensionScores = summarizeDimensionScores(checks);

  return {
    caseId: testCase.id,
    title: testCase.title,
    conceptId: testCase.conceptId,
    locale: testCase.locale,
    score,
    passed: checks.every((check) => check.passed),
    checks,
    dimensionScores,
    assistantMessage: response?.assistantMessage,
    durationMs,
    error,
    workflowEngine,
    modelTelemetry,
  };
}

function evaluateCase(testCase: TeacherEvaluationCase): TeacherEvaluationResult {
  return evaluateTeacherResponse({
    allowedCitationChunkIds: testCase.referenceResponse.citationChunkIds,
    response: testCase.referenceResponse,
    testCase,
  });
}

export function runTeacherEvaluationSuite(): TeacherEvaluationSummary {
  const results = teacherEvaluationCases.map(evaluateCase);
  const summary = summarizeEvaluationResults(results);

  return {
    ...summary,
    results,
  };
}
