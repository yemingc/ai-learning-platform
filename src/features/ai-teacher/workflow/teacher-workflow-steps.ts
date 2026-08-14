import "server-only";

import { generateTeacherResponse } from "@/features/ai-teacher/teacher-service";
import {
  assessCurriculumRetrievalQuality,
  buildBroadenedRetrievalQuery,
  createTeacherMemoryPatch,
  decideCurriculumRetrieval,
  decideTeacherMemoryUpdate,
  getTeacherRetrievalScope,
} from "@/features/ai-teacher/workflow/teacher-policy";
import type {
  LearnerMemorySnapshot,
  NextStudyActionHint,
  TeacherWorkflowInput,
  TeacherWorkflowNode,
  TeacherWorkflowRuntimeOptions,
  TeacherWorkflowState,
  TeacherWorkflowTraceEvent,
} from "@/features/ai-teacher/workflow/types";
import {
  createLessonOnlyCurriculumContext,
  filterAllowedCitations,
  retrieveAndAssembleCurriculumContext,
} from "@/features/rag/curriculum-context";

export const MAX_RETRIEVAL_RETRIES = 1;

export function createTraceEvent(
  node: TeacherWorkflowNode,
  detail?: string,
  status: TeacherWorkflowTraceEvent["status"] = "success",
): TeacherWorkflowTraceEvent {
  return {
    node,
    status,
    detail,
    createdAt: new Date().toISOString(),
  };
}

export function buildTeacherWorkflowContext(input: TeacherWorkflowInput) {
  const learnerMemorySnapshot: LearnerMemorySnapshot =
    input.learnerMemorySnapshot ?? {
      source: "not_available",
      conceptId: input.concept.id,
      recentConfusionSections: [],
      recentMisconceptions: [],
    };

  return {
    concept: input.concept,
    currentSection: input.currentSection,
    learnerMemorySnapshot,
    lesson: input.lesson,
  };
}

export function getContextTraceDetail(
  context: ReturnType<typeof buildTeacherWorkflowContext>,
) {
  return context.learnerMemorySnapshot.source === "server_persistent"
    ? `Loaded server learner memory with ${context.learnerMemorySnapshot.interactionCount ?? 0} prior evidence-bearing interactions and ${context.learnerMemorySnapshot.assessmentEvidenceLevel ?? "none"} assessment evidence.`
    : "Loaded lesson context without server-persistent learner memory.";
}

export function getCurriculumRetrievalDecision(state: TeacherWorkflowState) {
  return decideCurriculumRetrieval({
    input: state.input,
    intent: state.intent ?? "general_support",
  });
}

export async function retrieveCurriculumForTeacher(
  state: TeacherWorkflowState,
) {
  const retrievalScope = getTeacherRetrievalScope(state.retrievalAttempt);

  return retrieveAndAssembleCurriculumContext({
    ...state.input,
    queryText: state.retrievalQuery,
    restrictToConcept: retrievalScope === "concept",
  });
}

export function getRetrievalTraceDetail(
  state: TeacherWorkflowState,
  context: Awaited<ReturnType<typeof retrieveCurriculumForTeacher>>,
) {
  return [
    `Attempt ${state.retrievalAttempt + 1}: retrieved ${context.retrievedChunks.length} curriculum chunks.`,
    `mode: ${context.actualMode}`,
    `minimum score: ${context.minimumScore}`,
    context.rejectedMatches > 0
      ? `rejected below threshold: ${context.rejectedMatches}`
      : undefined,
    getTeacherRetrievalScope(state.retrievalAttempt) === "concept"
      ? "scope: current concept"
      : "scope: course",
    context.actualMode !== context.requestedMode
      ? `requested: ${context.requestedMode}`
      : undefined,
    context.retrievalFallbackReason
      ? `fallback: ${context.retrievalFallbackReason}`
      : undefined,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getRetrievalQuality(state: TeacherWorkflowState) {
  if (!state.curriculumContext) {
    return "unavailable" as const;
  }

  return assessCurriculumRetrievalQuality({
    context: state.curriculumContext,
    currentConceptId: state.input.concept.id,
  });
}

export function getBroadenedRetrievalUpdate(state: TeacherWorkflowState) {
  return {
    retrievalAttempt: state.retrievalAttempt + 1,
    retrievalQuery: buildBroadenedRetrievalQuery(state.input),
  };
}

export function getLessonOnlyContext(reason?: string) {
  return createLessonOnlyCurriculumContext(reason);
}

export async function generateValidatedTeacherTurn(
  state: TeacherWorkflowState,
  runtimeOptions: TeacherWorkflowRuntimeOptions = {},
) {
  const generatedResponse = await generateTeacherResponse(
    {
      ...state.input,
      curriculumContext:
        state.curriculumContext ?? createLessonOnlyCurriculumContext(),
      intent: state.intent,
      teachingMoveHint: state.teachingStrategy,
    },
    runtimeOptions,
  );
  const allowedCitations = state.curriculumContext?.allowedCitations ?? [];
  const citations = filterAllowedCitations({
    allowedCitations,
    requestedChunkIds: generatedResponse.teacherResponse.citationChunkIds,
  });
  const teacherResponse = {
    ...generatedResponse.teacherResponse,
    citationChunkIds: citations.map((citation) => citation.chunkId),
  };

  return {
    citations,
    modelTelemetry: generatedResponse.modelTelemetry,
    teacherResponse,
  };
}

export function getTeacherMemoryWriteDecision(state: TeacherWorkflowState) {
  if (!state.teacherResponse) {
    throw new Error("Cannot decide memory persistence before teacher response.");
  }

  return decideTeacherMemoryUpdate({
    input: state.input,
    intent: state.intent ?? "general_support",
    response: state.teacherResponse,
  });
}

export function prepareTeacherMemoryPatch(state: TeacherWorkflowState) {
  if (!state.memorySignals) {
    throw new Error("Cannot create memory patch before learning signals exist.");
  }

  return createTeacherMemoryPatch({
    conceptId: state.input.concept.id,
    memorySignals: state.memorySignals,
    memorySnapshot: state.context?.learnerMemorySnapshot,
  });
}

export function createNextStudyActionHint(
  state: TeacherWorkflowState,
): NextStudyActionHint {
  if (!state.memorySignals) {
    throw new Error("Cannot create study action before learning signals exist.");
  }

  return {
    action: state.memorySignals.suggestedStudyAction,
    reason: state.memorySignals.evidenceNote,
  };
}
