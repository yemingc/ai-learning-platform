import "server-only";

import { generateTeacherResponse } from "@/features/ai-teacher/teacher-service";
import type { TeachingMove } from "@/features/ai-teacher/types";
import {
  assembleCurriculumContext,
  filterAllowedCitations,
} from "@/features/rag/curriculum-context";
import type {
  LearnerMemoryPatch,
  LearnerMemorySnapshot,
  NextStudyActionHint,
  TeacherIntent,
  TeacherWorkflowContext,
  TeacherWorkflowInput,
  TeacherWorkflowNode,
  TeacherWorkflowResult,
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

function classifyUserIntent(input: TeacherWorkflowInput): TeacherIntent {
  const normalizedMessage = input.userMessage.toLowerCase();

  if (
    input.selectionAction === "give_example" ||
    normalizedMessage.includes("example") ||
    normalizedMessage.includes("例子")
  ) {
    return "example_request";
  }

  if (
    input.selectionAction === "check_misconception" ||
    normalizedMessage.includes("misconception") ||
    normalizedMessage.includes("trap") ||
    normalizedMessage.includes("误区")
  ) {
    return "misconception";
  }

  if (
    input.selectionAction === "ask_guiding_question" ||
    normalizedMessage.includes("guiding question") ||
    normalizedMessage.includes("引导")
  ) {
    return "reflection";
  }

  if (
    normalizedMessage.includes("apply") ||
    normalizedMessage.includes("application") ||
    normalizedMessage.includes("应用")
  ) {
    return "application";
  }

  if (
    input.selectionAction === "explain_this" ||
    normalizedMessage.includes("confused") ||
    normalizedMessage.includes("understand") ||
    normalizedMessage.includes("不懂") ||
    normalizedMessage.includes("解释")
  ) {
    return "confusion";
  }

  return "general_support";
}

function selectTeachingStrategy(intent: TeacherIntent): TeachingMove {
  const moveByIntent: Record<TeacherIntent, TeachingMove> = {
    application: "ask_guiding_question",
    confusion: "explain",
    example_request: "give_example",
    general_support: "explain",
    misconception: "correct_misconception",
    reflection: "reflect",
  };

  return moveByIntent[intent];
}

function createMemoryPatch(
  state: TeacherWorkflowState,
): LearnerMemoryPatch {
  if (!state.memorySignals) {
    throw new Error("Cannot create memory patch before learning signals exist.");
  }

  return {
    conceptId: state.input.concept.id,
    source: "teacher_workflow",
    memorySignals: state.memorySignals,
    shouldPersistClientSide:
      state.context?.learnerMemorySnapshot.source !== "server_persistent",
    rationale:
      "Memory persistence is currently handled by the local-demo client store; a future LangGraph version can persist this patch server-side.",
  };
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
    "Loaded static concept, lesson, section, and learner memory snapshot.",
  );

  const intent = classifyUserIntent(input);
  state = appendTrace(
    {
      ...state,
      intent,
    },
    "classify_user_intent",
    intent,
  );

  const teachingStrategy = selectTeachingStrategy(intent);
  state = appendTrace(
    {
      ...state,
      teachingStrategy,
    },
    "select_teaching_strategy",
    teachingStrategy,
  );

  const curriculumContext = assembleCurriculumContext({
    concept: input.concept,
    currentSection: input.currentSection,
    lesson: input.lesson,
    locale: input.locale,
    selectedText: input.selectedText,
    selectionAction: input.selectionAction,
    userMessage: input.userMessage,
  });
  state = appendTrace(
    {
      ...state,
      curriculumContext,
    },
    "retrieve_curriculum_chunks",
    curriculumContext.shouldRetrieve
      ? `Retrieved ${curriculumContext.retrievedChunks.length} curriculum chunks.`
      : "Skipped retrieval for this lightweight message.",
  );
  state = appendTrace(
    state,
    "assemble_curriculum_context",
    curriculumContext.shouldRetrieve
      ? `Assembled curriculum context with ${curriculumContext.allowedCitations.length} allowed citations.`
      : "No curriculum context assembled for this turn.",
  );

  const teacherResponse = await generateTeacherResponse({
    ...input,
    curriculumContext,
    intent,
    teachingMoveHint: teachingStrategy,
  });
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
    memorySignals,
    memoryPatch,
    nextStudyAction,
    citations,
    trace: state.trace,
    state,
  };
}
