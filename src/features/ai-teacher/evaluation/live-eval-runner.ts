import "server-only";

import { teacherEvaluationCases } from "@/features/ai-teacher/evaluation/eval-cases";
import type { LiveTeacherEvaluationSummary } from "@/features/ai-teacher/evaluation/eval-types";
import {
  evaluateTeacherResponse,
  summarizeEvaluationResults,
} from "@/features/ai-teacher/evaluation/eval-runner";
import { TeacherChatServiceError } from "@/features/ai-teacher/teacher-service";
import {
  getTeacherWorkflowEngine,
  runTeacherWorkflow,
} from "@/features/ai-teacher/workflow/run-teacher-workflow";
import { getConceptById } from "@/features/knowledge/get-concepts";
import { getLessonByConceptId } from "@/features/lessons/get-lessons";

export async function runLiveTeacherEvaluationSuite(): Promise<LiveTeacherEvaluationSummary> {
  const startedAt = new Date().toISOString();
  const workflowEngine = getTeacherWorkflowEngine();
  const results = [];

  for (const testCase of teacherEvaluationCases) {
    const caseStartedAt = Date.now();
    const concept = getConceptById(testCase.conceptId, testCase.courseId);
    const lesson = getLessonByConceptId(testCase.conceptId, testCase.courseId);

    if (!concept || !lesson) {
      results.push(
        evaluateTeacherResponse({
          durationMs: Date.now() - caseStartedAt,
          error: "Concept or lesson could not be resolved before live eval.",
          testCase,
          workflowEngine,
        }),
      );
      continue;
    }

    try {
      const workflowResult = await runTeacherWorkflow({
        chatHistory: [],
        concept,
        currentSection: testCase.currentSection,
        learnerMemorySnapshot: {
          conceptId: concept.id,
          recentConfusionSections: [],
          recentMisconceptions: [],
          source: "not_available",
        },
        lesson,
        locale: testCase.locale,
        selectedText: testCase.selectedText,
        userMessage: testCase.userMessage,
      });

      results.push(
        evaluateTeacherResponse({
          durationMs: Date.now() - caseStartedAt,
          response: workflowResult.teacherResponse,
          testCase,
          workflowEngine,
        }),
      );
    } catch (error) {
      results.push(
        evaluateTeacherResponse({
          durationMs: Date.now() - caseStartedAt,
          error:
            error instanceof TeacherChatServiceError
              ? `${error.code}: ${error.message}`
              : error instanceof Error
                ? error.message
                : "Unknown live evaluation error.",
          testCase,
          workflowEngine,
        }),
      );
    }
  }

  const summary = summarizeEvaluationResults(results);

  return {
    ...summary,
    completedAt: new Date().toISOString(),
    mode: "live_model",
    results,
    startedAt,
  };
}
