import "server-only";

import { getCurriculumPack } from "@/curricula";
import { localizeConcept } from "@/curricula/localization";
import { getConceptById } from "@/features/knowledge/get-concepts";
import { getLessonByConceptId } from "@/features/lessons/get-lessons";
import { getActiveMisconceptions } from "@/features/memory/misconception-lifecycle";
import { createAdaptiveLearningPlan } from "@/features/planner/adaptive-learning-plan";
import { retrieveAndAssembleCurriculumContext } from "@/features/rag/curriculum-context";
import {
  parseLearningAgentToolCall,
  LearningAgentToolValidationError,
} from "@/features/ai-teacher/tools/tool-policy";
import type {
  LearningAgentToolCall,
  LearningAgentToolResult,
  PendingLearningPlanAction,
} from "@/features/ai-teacher/tools/types";
import type { TeacherWorkflowInput } from "@/features/ai-teacher/workflow/types";
import { createPendingLearningPlanAction } from "@/lib/learning-plan-agent-db";
import { getLearnerMemory } from "@/lib/learner-memory-db";

export type LearningAgentToolRuntimeContext = {
  learnerId: string;
  courseId: string;
  runId: string;
};

export type LearningAgentToolExecutor = ReturnType<
  typeof createLearningAgentToolExecutor
>;

export class LearningAgentToolExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LearningAgentToolExecutionError";
  }
}

function assertCourseConcept(courseId: string, conceptId: string) {
  const concept = getConceptById(conceptId, courseId);
  const lesson = getLessonByConceptId(conceptId, courseId);

  if (!concept || !lesson || concept.courseId !== courseId) {
    throw new LearningAgentToolExecutionError(
      "The requested concept is not available in the authenticated course scope.",
    );
  }

  return { concept, lesson };
}

export function createLearningAgentToolExecutor({
  input,
  runtime,
}: {
  input: TeacherWorkflowInput;
  runtime: LearningAgentToolRuntimeContext;
}) {
  if (runtime.courseId !== input.concept.courseId) {
    throw new LearningAgentToolExecutionError(
      "Server-injected course scope does not match the active lesson.",
    );
  }

  const pendingActions = new Map<string, PendingLearningPlanAction>();

  async function execute(
    toolCall: LearningAgentToolCall,
  ): Promise<LearningAgentToolResult> {
    const parsed = parseLearningAgentToolCall({
      id: toolCall.id,
      name: toolCall.name,
      argumentsJson: toolCall.argumentsJson,
    });
    const curriculum = getCurriculumPack(runtime.courseId);

    if (!curriculum) {
      throw new LearningAgentToolExecutionError(
        "The active curriculum is unavailable.",
      );
    }

    if (parsed.name === "get_learning_state") {
      const memory = getLearnerMemory(runtime.learnerId, runtime.courseId);
      const requestedConceptIds = parsed.arguments.conceptIds;
      const allowedConceptIds = new Set(
        curriculum.concepts.map((concept) => concept.id),
      );

      if (
        requestedConceptIds?.some(
          (conceptId) => !allowedConceptIds.has(conceptId),
        )
      ) {
        throw new LearningAgentToolExecutionError(
          "A requested concept is outside the active course scope.",
        );
      }

      const conceptIds = requestedConceptIds?.length
        ? requestedConceptIds
        : curriculum.concepts.map((concept) => concept.id);
      const states = conceptIds
        .map((conceptId) => {
          const concept = curriculum.concepts.find(
            (item) => item.id === conceptId,
          );
          const conceptMemory = memory.conceptMemories[conceptId];

          if (!concept) {
            return undefined;
          }

          return {
            conceptId,
            title: localizeConcept(curriculum, concept, input.locale).title,
            readiness: conceptMemory?.readiness ?? 0,
            status: conceptMemory?.status ?? "not_started",
            activeMisconceptions: conceptMemory
              ? getActiveMisconceptions(conceptMemory.misconceptions).map(
                  (item) => item.text,
                )
              : [],
            interactionCount: conceptMemory?.interactionCount ?? 0,
          };
        })
        .filter((item) => item !== undefined)
        .sort((left, right) => left.readiness - right.readiness)
        .slice(0, 8);
      const modelContent = JSON.stringify({
        courseId: runtime.courseId,
        evidenceUpdatedAt: memory.updatedAt,
        concepts: states,
      });

      return {
        callId: toolCall.id,
        toolName: parsed.name,
        modelContent,
        summary: `Read ${states.length} course-scoped learning-state records.`,
      };
    }

    if (parsed.name === "retrieve_course_evidence") {
      const target = parsed.arguments.conceptId
        ? assertCourseConcept(runtime.courseId, parsed.arguments.conceptId)
        : { concept: input.concept, lesson: input.lesson };
      const context = await retrieveAndAssembleCurriculumContext({
        concept: target.concept,
        currentSection: input.currentSection,
        locale: input.locale,
        queryText: parsed.arguments.query,
        restrictToConcept: Boolean(parsed.arguments.conceptId),
        selectedText: input.selectedText,
        selectionAction: input.selectionAction,
        userMessage: input.userMessage,
        lesson: target.lesson,
      });
      const evidence = context.retrievedChunks.map((chunk) => ({
        chunkId: chunk.id,
        conceptId: chunk.conceptId,
        sectionTitle: chunk.title,
        sectionType: chunk.sectionType,
        text: chunk.text,
      }));

      return {
        callId: toolCall.id,
        toolName: parsed.name,
        citations: context.allowedCitations,
        modelContent: JSON.stringify({
          actualMode: context.actualMode,
          evidence,
          rejectedMatches: context.rejectedMatches,
        }),
        summary: `Retrieved ${evidence.length} allowlisted curriculum chunks with ${context.actualMode}.`,
      };
    }

    if (parsed.name === "draft_learning_plan") {
      const memory = getLearnerMemory(runtime.learnerId, runtime.courseId);
      const generated = createAdaptiveLearningPlan({
        curriculum,
        language: input.locale,
        memory,
      });
      const plan = {
        ...generated,
        goal: parsed.arguments.goal,
        learnerId: runtime.learnerId,
        minutesPerSession: parsed.arguments.minutesAvailable,
        status: generated.status === "completed" ? "completed" : "draft",
      } as const;
      const focusConcepts = plan.focusConceptIds
        .map((conceptId) =>
          curriculum.concepts.find((concept) => concept.id === conceptId),
        )
        .filter((concept) => concept !== undefined);
      const estimatedMinutes = plan.steps
        .filter((step) => plan.focusConceptIds.includes(step.conceptId))
        .reduce((total, step) => total + step.estimatedMinutes, 0);
      const pendingAction = createPendingLearningPlanAction({
        learnerId: runtime.learnerId,
        courseId: runtime.courseId,
        plan,
        preview: {
          title: plan.title,
          goal: plan.goal,
          minutesPerSession: plan.minutesPerSession,
          focusConceptIds: plan.focusConceptIds,
          focusConceptTitles: focusConcepts.map(
            (concept) => localizeConcept(curriculum, concept, input.locale).title,
          ),
          estimatedMinutes,
          stepCount: plan.steps.length,
          generatedAt: plan.generatedAt,
        },
      });

      pendingActions.set(pendingAction.preview.draftId, pendingAction);

      return {
        callId: toolCall.id,
        toolName: parsed.name,
        modelContent: JSON.stringify({
          draftId: pendingAction.preview.draftId,
          goal: parsed.arguments.goal,
          minutesAvailable: parsed.arguments.minutesAvailable,
          preview: {
            title: pendingAction.preview.title,
            focusConcepts: pendingAction.preview.focusConceptTitles,
            estimatedMinutes: pendingAction.preview.estimatedMinutes,
            stepCount: pendingAction.preview.stepCount,
          },
          activation: "requires_explicit_user_confirmation",
        }),
        pendingAction,
        plan,
        summary: `Drafted a ${plan.steps.length}-step plan with ${plan.focusConceptIds.length} focus concepts; activation requires confirmation.`,
      };
    }

    if (parsed.name === "activate_learning_plan") {
      const pendingAction = pendingActions.get(parsed.arguments.draftId);

      if (!pendingAction) {
        throw new LearningAgentToolValidationError(
          "Only a draft created in this authenticated tool run can be activated.",
        );
      }

      return {
        callId: toolCall.id,
        toolName: parsed.name,
        modelContent: JSON.stringify({
          draftId: parsed.arguments.draftId,
          activation: "awaiting_explicit_user_confirmation",
        }),
        pendingAction,
        summary: "Prepared an activation request without performing the write.",
      };
    }

    throw new LearningAgentToolValidationError("Unsupported learning tool.");
  }

  return { execute };
}
