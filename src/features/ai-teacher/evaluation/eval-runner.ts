import { teacherChatResponseSchema } from "@/features/ai-teacher/types";
import { teacherEvaluationCases } from "@/features/ai-teacher/evaluation/eval-cases";
import type {
  TeacherEvaluationCase,
  TeacherEvaluationCheck,
  TeacherEvaluationResult,
  TeacherEvaluationSummary,
} from "@/features/ai-teacher/evaluation/eval-types";
import type { TeacherChatResponse } from "@/features/ai-teacher/types";
import type { TeacherWorkflowTraceEvent } from "@/features/ai-teacher/workflow/types";
import {
  getMissingSuccessfulWorkflowNodes,
  requiredWorkflowNodes,
} from "@/features/ai-teacher/evaluation/workflow-trace-evaluation";
import { getConceptById } from "@/features/knowledge/get-concepts";
import { getLessonByConceptId } from "@/features/lessons/get-lessons";

function includesEveryTerm(text: string, terms: string[] = []) {
  const normalizedText = text.toLowerCase();

  return terms.every((term) => normalizedText.includes(term.toLowerCase()));
}

function avoidsForbiddenPatterns(text: string, patterns: string[] = []) {
  const normalizedText = text.toLowerCase();

  return patterns.every((pattern) => !normalizedText.includes(pattern.toLowerCase()));
}

function createCheck(
  id: string,
  label: string,
  passed: boolean,
  detail: string,
): TeacherEvaluationCheck {
  return {
    id,
    label,
    passed,
    detail,
  };
}

export { requiredWorkflowNodes };

export function summarizeEvaluationResults(
  results: TeacherEvaluationResult[],
): Pick<
  TeacherEvaluationSummary,
  "averageScore" | "passedCases" | "requiredWorkflowNodes" | "totalCases"
> {
  const passedCases = results.filter((result) => result.passed).length;
  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, result) => sum + result.score, 0) /
            results.length,
        )
      : 0;

  return {
    totalCases: results.length,
    passedCases,
    averageScore,
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
}: {
  durationMs?: number;
  error?: string;
  response?: TeacherChatResponse;
  testCase: TeacherEvaluationCase;
  workflowEngine?: string;
  workflowTrace?: TeacherWorkflowTraceEvent[];
  modelTelemetry?: TeacherEvaluationResult["modelTelemetry"];
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
      Boolean(concept),
      concept
        ? `${concept.title} loaded from ${testCase.courseId}.`
        : `Missing concept ${testCase.conceptId}.`,
    ),
    createCheck(
      "lesson_resolves",
      "Static lesson resolves for concept",
      Boolean(lesson),
      lesson
        ? `${lesson.title} is available as structured content.`
        : `Missing lesson for ${testCase.conceptId}.`,
    ),
    createCheck(
      "schema_valid",
      "Response matches TeacherChatResponse schema",
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
      !error && responseToEvaluate.teachingMove === testCase.expectedTeachingMove,
      `${responseToEvaluate.teachingMove} vs expected ${testCase.expectedTeachingMove}.`,
    ),
    createCheck(
      "study_action",
      "Memory signal returns expected next study action",
      !error &&
        responseToEvaluate.memorySignals.suggestedStudyAction ===
        testCase.expectedStudyAction,
      `${responseToEvaluate.memorySignals.suggestedStudyAction} vs expected ${testCase.expectedStudyAction}.`,
    ),
    createCheck(
      "required_terms",
      "Response includes required academic terms",
      !error && includesEveryTerm(responseText, testCase.requiredTerms),
      testCase.requiredTerms?.length
        ? `Required: ${testCase.requiredTerms.join(", ")}.`
        : "No required terms for this case.",
    ),
    createCheck(
      "forbidden_patterns",
      "Response avoids question-bank or grading language",
      !error && avoidsForbiddenPatterns(responseText, testCase.forbiddenPatterns),
      testCase.forbiddenPatterns?.length
        ? `Forbidden: ${testCase.forbiddenPatterns.join(", ")}.`
        : "No forbidden patterns for this case.",
    ),
    createCheck(
      "follow_ups",
      "Suggested follow-ups support continued learning",
      !error &&
        responseToEvaluate.suggestedFollowUps.length >= 1 &&
        responseToEvaluate.suggestedFollowUps.length <= 4,
      `${responseToEvaluate.suggestedFollowUps.length} follow-up prompts.`,
    ),
  ];
  if (workflowTrace) {
    const missingWorkflowNodes =
      getMissingSuccessfulWorkflowNodes(workflowTrace);

    checks.push(
      createCheck(
        "workflow_trace",
        "Live run completed every required workflow node",
        missingWorkflowNodes.length === 0,
        missingWorkflowNodes.length === 0
          ? `${requiredWorkflowNodes.length} required workflow nodes completed successfully.`
          : `Missing successful nodes: ${missingWorkflowNodes.join(", ")}.`,
      ),
    );
  }
  const passedChecks = checks.filter((check) => check.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    caseId: testCase.id,
    title: testCase.title,
    conceptId: testCase.conceptId,
    locale: testCase.locale,
    score,
    passed: checks.every((check) => check.passed),
    checks,
    assistantMessage: response?.assistantMessage,
    durationMs,
    error,
    workflowEngine,
    modelTelemetry,
  };
}

function evaluateCase(testCase: TeacherEvaluationCase): TeacherEvaluationResult {
  return evaluateTeacherResponse({
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
