import "server-only";

import { generateTeacherResponse } from "@/features/ai-teacher/teacher-service";
import {
  assembleCurriculumContext,
  filterAllowedCitations,
} from "@/features/rag/curriculum-context";
import {
  classifyTeacherIntent,
  createTeacherMemoryPatch,
  selectTeachingStrategy,
} from "@/features/ai-teacher/workflow/teacher-policy";
import type {
  LearnerMemorySnapshot,
  NextStudyActionHint,
  TeacherWorkflowContext,
  TeacherWorkflowInput,
  TeacherWorkflowNode,
  TeacherWorkflowResult,
  TeacherWorkflowRuntimeOptions,
  TeacherWorkflowState,
  TeacherWorkflowTraceEvent,
} from "@/features/ai-teacher/workflow/types";

function createTraceEvent(
  node: TeacherWorkflowNode,
  detail?: string,
): TeacherWorkflowTraceEvent {
  return {
    node,
    status: "success",
    detail,
    createdAt: new Date().toISOString(),
  };
}

function appendTrace(
  state: TeacherWorkflowState,
  node: TeacherWorkflowNode,
  detail?: string,
): TeacherWorkflowState {
  return {
    ...state,
    trace: [...state.trace, createTraceEvent(node, detail)],
  };
}

function buildContext(input: TeacherWorkflowInput): TeacherWorkflowContext {
  const learnerMemorySnapshot: LearnerMemorySnapshot =
    input.learnerMemorySnapshot ?? {
      source: "not_available",
      conceptId: input.concept.id,
      recentConfusionSections: [],
      recentMisconceptions: [],
    };

  return {
    concept: input.concept,
    lesson: input.lesson,
    currentSection: input.currentSection,
    learnerMemorySnapshot,
  };
}

function createMemoryPatch(state: TeacherWorkflowState) {
  if (!state.memorySignals) {
    throw new Error("Cannot create memory patch before learning signals exist.");
  }

  return createTeacherMemoryPatch({
    conceptId: state.input.concept.id,
    memorySignals: state.memorySignals,
    memorySnapshot: state.context?.learnerMemorySnapshot,
  });
}

function createNextStudyActionHint(
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

export async function runTypeScriptTeacherWorkflow(
  input: TeacherWorkflowInput,
  runtimeOptions: TeacherWorkflowRuntimeOptions = {},
): Promise<TeacherWorkflowResult> {
  let state: TeacherWorkflowState = {
    input,
    trace: [createTraceEvent("student_message", "Received student message.")],
    errors: [],
  };

  const context = buildContext(input);
  state = appendTrace(
    {
      ...state,
      context,
    },
    "build_context",
    context.learnerMemorySnapshot.source === "server_persistent"
      ? `Loaded server learner memory with ${context.learnerMemorySnapshot.interactionCount ?? 0} prior interactions and ${context.learnerMemorySnapshot.assessmentEvidenceLevel ?? "none"} assessment evidence.`
      : "Loaded lesson context without server-persistent learner memory.",
  );

  const intent = classifyTeacherIntent(input);
  state = appendTrace(
    {
      ...state,
      intent,
    },
    "classify_user_intent",
    intent,
  );

  const teachingStrategy = selectTeachingStrategy(
    intent,
    context.learnerMemorySnapshot,
    input.userMessage,
  );
  state = appendTrace(
    {
      ...state,
      teachingStrategy,
    },
    "select_teaching_strategy",
    teachingStrategy,
  );

  const curriculumContext = await assembleCurriculumContext({
    concept: input.concept,
    currentSection: input.currentSection,
    lesson: input.lesson,
    locale: input.locale,
    selectedText: input.selectedText,
    selectionAction: input.selectionAction,
    userMessage: input.userMessage,
  });
  const retrievalDetail = curriculumContext.shouldRetrieve
    ? [
        `Retrieved ${curriculumContext.retrievedChunks.length} curriculum chunks.`,
        `mode: ${curriculumContext.actualMode}`,
        curriculumContext.actualMode !== curriculumContext.requestedMode
          ? `requested: ${curriculumContext.requestedMode}`
          : undefined,
        curriculumContext.retrievalFallbackReason
          ? `fallback: ${curriculumContext.retrievalFallbackReason}`
          : undefined,
      ]
        .filter(Boolean)
        .join(" ")
    : "Skipped retrieval for this lightweight message.";
  state = appendTrace(
    {
      ...state,
      curriculumContext,
    },
    "retrieve_curriculum_chunks",
    retrievalDetail,
  );
  state = appendTrace(
    state,
    "assemble_curriculum_context",
    curriculumContext.shouldRetrieve
      ? `Assembled curriculum context with ${curriculumContext.allowedCitations.length} allowed citations.`
      : "No curriculum context assembled for this turn.",
  );

  const generatedResponse = await generateTeacherResponse({
    ...input,
    curriculumContext,
    intent,
    teachingMoveHint: teachingStrategy,
  }, runtimeOptions);
  const teacherResponse = generatedResponse.teacherResponse;
  const citations = filterAllowedCitations({
    allowedCitations: curriculumContext.allowedCitations,
    requestedChunkIds: teacherResponse.citationChunkIds,
  });
  const sanitizedTeacherResponse = {
    ...teacherResponse,
    citationChunkIds: citations.map((citation) => citation.chunkId),
  };
  state = appendTrace(
    {
      ...state,
      citations,
      modelTelemetry: generatedResponse.modelTelemetry,
      teacherResponse: sanitizedTeacherResponse,
    },
    "generate_teaching_response",
    `${teacherResponse.teachingMove}; ${citations.length} citations accepted.`,
  );

  state = appendTrace(
    state,
    "validate_structured_output",
    "DeepSeek output normalized and validated against TeacherChatResponse schema.",
  );

  const memorySignals = sanitizedTeacherResponse.memorySignals;
  state = appendTrace(
    {
      ...state,
      memorySignals,
    },
    "extract_learning_signals",
    `${memorySignals.confusionLevel} confusion, ${memorySignals.suggestedStudyAction}`,
  );

  const memoryPatch = createMemoryPatch(state);
  state = appendTrace(
    {
      ...state,
      memoryPatch,
    },
    "update_learner_memory",
    memoryPatch.shouldPersistClientSide
      ? "Prepared client-side memory patch."
      : "Prepared server-side memory patch.",
  );

  const nextStudyAction = createNextStudyActionHint(state);
  state = appendTrace(
    {
      ...state,
      nextStudyAction,
    },
    "return_next_study_action",
    nextStudyAction.action,
  );

  return {
    teacherResponse: sanitizedTeacherResponse,
    modelTelemetry: generatedResponse.modelTelemetry,
    memorySignals,
    memoryPatch,
    nextStudyAction,
    citations,
    trace: state.trace,
    state,
  };
}
