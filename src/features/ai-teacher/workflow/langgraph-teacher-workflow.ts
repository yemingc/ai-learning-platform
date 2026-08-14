import "server-only";

import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import {
  buildTeacherWorkflowContext,
  createNextStudyActionHint,
  createTraceEvent,
  generateValidatedTeacherTurn,
  getBroadenedRetrievalUpdate,
  getContextTraceDetail,
  getCurriculumRetrievalDecision,
  getLessonOnlyContext,
  getRetrievalQuality,
  getRetrievalTraceDetail,
  getTeacherMemoryWriteDecision,
  MAX_RETRIEVAL_RETRIES,
  prepareTeacherMemoryPatch,
  retrieveCurriculumForTeacher,
} from "@/features/ai-teacher/workflow/teacher-workflow-steps";
import {
  classifyTeacherIntent,
  selectTeachingStrategy,
} from "@/features/ai-teacher/workflow/teacher-policy";
import type {
  LearnerMemoryPatch,
  TeacherWorkflowContext,
  TeacherWorkflowInput,
  TeacherWorkflowResult,
  TeacherWorkflowRuntimeOptions,
  TeacherWorkflowState,
  TeacherWorkflowTraceEvent,
} from "@/features/ai-teacher/workflow/types";
import type { CurriculumCitation } from "@/features/rag/curriculum-context";
import type { TeachingMove } from "@/features/ai-teacher/types";

const TeacherWorkflowAnnotation = Annotation.Root({
  context: Annotation<TeacherWorkflowContext | undefined>(),
  input: Annotation<TeacherWorkflowInput>(),
  intent: Annotation<TeacherWorkflowState["intent"]>(),
  teachingStrategy: Annotation<TeachingMove | undefined>(),
  retrievalDecision: Annotation<TeacherWorkflowState["retrievalDecision"]>(),
  retrievalAttempt: Annotation<number>(),
  retrievalQuery: Annotation<string | undefined>(),
  retrievalQuality: Annotation<TeacherWorkflowState["retrievalQuality"]>(),
  curriculumContext: Annotation<TeacherWorkflowState["curriculumContext"]>(),
  citations: Annotation<CurriculumCitation[]>(),
  teacherResponse: Annotation<TeacherWorkflowResult["teacherResponse"] | undefined>(),
  modelTelemetry: Annotation<TeacherWorkflowResult["modelTelemetry"] | undefined>(),
  memorySignals: Annotation<TeacherWorkflowResult["memorySignals"] | undefined>(),
  memoryWriteDecision: Annotation<TeacherWorkflowState["memoryWriteDecision"]>(),
  memoryPatch: Annotation<LearnerMemoryPatch | undefined>(),
  nextStudyAction: Annotation<TeacherWorkflowResult["nextStudyAction"] | undefined>(),
  trace: Annotation<TeacherWorkflowTraceEvent[], TeacherWorkflowTraceEvent[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
});

const TeacherWorkflowRuntimeAnnotation = Annotation.Root({
  onAssistantMessageDelta:
    Annotation<TeacherWorkflowRuntimeOptions["onAssistantMessageDelta"]>(),
});

type GraphState = typeof TeacherWorkflowAnnotation.State;
type GraphUpdate = typeof TeacherWorkflowAnnotation.Update;

function buildContextNode(state: GraphState): GraphUpdate {
  const context = buildTeacherWorkflowContext(state.input);

  return {
    context,
    trace: [createTraceEvent("build_context", getContextTraceDetail(context))],
  };
}

function classifyUserIntentNode(state: GraphState): GraphUpdate {
  const intent = classifyTeacherIntent(state.input);

  return {
    intent,
    trace: [createTraceEvent("classify_user_intent", intent)],
  };
}

function selectTeachingStrategyNode(state: GraphState): GraphUpdate {
  const teachingStrategy = selectTeachingStrategy(
    state.intent ?? "general_support",
    state.context?.learnerMemorySnapshot,
    state.input.userMessage,
  );

  return {
    teachingStrategy,
    trace: [
      createTraceEvent("select_teaching_strategy", teachingStrategy),
    ],
  };
}

function decideCurriculumRetrievalNode(state: GraphState): GraphUpdate {
  const retrievalDecision = getCurriculumRetrievalDecision(
    state as TeacherWorkflowState,
  );

  return {
    retrievalDecision,
    trace: [
      createTraceEvent(
        "decide_curriculum_retrieval",
        retrievalDecision === "retrieve"
          ? "Substantive teaching request requires grounded curriculum context."
          : "Lightweight message uses the reviewed lesson context without retrieval.",
      ),
    ],
  };
}

function routeAfterRetrievalDecision(state: GraphState) {
  return state.retrievalDecision === "retrieve"
    ? "retrieve_curriculum_context"
    : "use_lesson_context";
}

async function retrieveCurriculumContextNode(
  state: GraphState,
): Promise<GraphUpdate> {
  const workflowState = state as TeacherWorkflowState;
  const curriculumContext = await retrieveCurriculumForTeacher(workflowState);

  return {
    curriculumContext,
    trace: [
      createTraceEvent(
        "retrieve_curriculum_context",
        getRetrievalTraceDetail(workflowState, curriculumContext),
      ),
    ],
  };
}

function assessRetrievalQualityNode(state: GraphState): GraphUpdate {
  const retrievalQuality = getRetrievalQuality(state as TeacherWorkflowState);

  return {
    retrievalQuality,
    trace: [
      createTraceEvent(
        "assess_retrieval_quality",
        retrievalQuality === "sufficient"
          ? "Retrieved context contains the active lesson concept."
          : `${retrievalQuality}; the workflow will ${state.retrievalAttempt < MAX_RETRIEVAL_RETRIES ? "retry once with course scope" : "fall back to the reviewed lesson context"}.`,
      ),
    ],
  };
}

function routeAfterRetrievalAssessment(state: GraphState) {
  if (state.retrievalQuality === "sufficient") {
    return "generate_validated_response";
  }

  return state.retrievalAttempt < MAX_RETRIEVAL_RETRIES
    ? "broaden_retrieval_query"
    : "use_lesson_context";
}

function broadenRetrievalQueryNode(state: GraphState): GraphUpdate {
  const update = getBroadenedRetrievalUpdate(state as TeacherWorkflowState);

  return {
    ...update,
    trace: [
      createTraceEvent(
        "broaden_retrieval_query",
        "Expanded the query with the active concept and broadened the retry to course scope.",
      ),
    ],
  };
}

function useLessonContextNode(state: GraphState): GraphUpdate {
  const skippedRetrieval = state.retrievalDecision === "skip";
  const reason = skippedRetrieval
    ? "Retrieval skipped for a lightweight message."
    : "No sufficiently relevant curriculum chunks were found after the bounded retry.";

  return {
    curriculumContext: getLessonOnlyContext(reason),
    trace: [createTraceEvent("use_lesson_context", reason)],
  };
}

async function generateValidatedResponseNode(
  state: GraphState,
  runtime: {
    context?: typeof TeacherWorkflowRuntimeAnnotation.State;
    signal: AbortSignal;
  },
): Promise<GraphUpdate> {
  const generated = await generateValidatedTeacherTurn(
    state as TeacherWorkflowState,
    {
      onAssistantMessageDelta: runtime.context?.onAssistantMessageDelta,
      signal: runtime.signal,
    },
  );

  return {
    ...generated,
    trace: [
      createTraceEvent(
        "generate_validated_response",
        `${generated.teacherResponse.teachingMove}; schema validated and ${generated.citations.length} allowlisted citations accepted.`,
      ),
    ],
  };
}

function extractLearningSignalsNode(state: GraphState): GraphUpdate {
  if (!state.teacherResponse) {
    throw new Error("Cannot extract learning signals before teacher response.");
  }

  const memorySignals = state.teacherResponse.memorySignals;

  return {
    memorySignals,
    trace: [
      createTraceEvent(
        "extract_learning_signals",
        `${memorySignals.confusionLevel} confusion, ${memorySignals.suggestedStudyAction}`,
      ),
    ],
  };
}

function decideMemoryUpdateNode(state: GraphState): GraphUpdate {
  const memoryWriteDecision = getTeacherMemoryWriteDecision(
    state as TeacherWorkflowState,
  );

  return {
    memoryWriteDecision,
    trace: [
      createTraceEvent(
        "decide_memory_update",
        memoryWriteDecision === "persist"
          ? "Learning evidence is strong enough to update learner state."
          : memoryWriteDecision === "record_interaction_only"
            ? "Interaction will be retained for audit without affecting readiness."
            : "Lightweight interaction will not be written to learner memory.",
      ),
    ],
  };
}

function routeAfterMemoryDecision(state: GraphState) {
  return state.memoryWriteDecision === "persist"
    ? "prepare_memory_patch"
    : "return_next_study_action";
}

function prepareMemoryPatchNode(state: GraphState): GraphUpdate {
  const memoryPatch = prepareTeacherMemoryPatch(state as TeacherWorkflowState);

  return {
    memoryPatch,
    trace: [
      createTraceEvent(
        "prepare_memory_patch",
        memoryPatch.shouldPersistClientSide
          ? "Prepared client-side learner-memory patch."
          : "Prepared server-side learner-memory patch.",
      ),
    ],
  };
}

function returnNextStudyActionNode(state: GraphState): GraphUpdate {
  const nextStudyAction = createNextStudyActionHint(
    state as TeacherWorkflowState,
  );

  return {
    nextStudyAction,
    trace: [
      createTraceEvent(
        "return_next_study_action",
        nextStudyAction.action,
      ),
    ],
  };
}

function createTeacherGraph() {
  return new StateGraph(
    TeacherWorkflowAnnotation,
    TeacherWorkflowRuntimeAnnotation,
  )
    .addNode("build_context", buildContextNode)
    .addNode("classify_user_intent", classifyUserIntentNode)
    .addNode("select_teaching_strategy", selectTeachingStrategyNode)
    .addNode("decide_curriculum_retrieval", decideCurriculumRetrievalNode)
    .addNode("retrieve_curriculum_context", retrieveCurriculumContextNode)
    .addNode("assess_retrieval_quality", assessRetrievalQualityNode)
    .addNode("broaden_retrieval_query", broadenRetrievalQueryNode)
    .addNode("use_lesson_context", useLessonContextNode)
    .addNode("generate_validated_response", generateValidatedResponseNode)
    .addNode("extract_learning_signals", extractLearningSignalsNode)
    .addNode("decide_memory_update", decideMemoryUpdateNode)
    .addNode("prepare_memory_patch", prepareMemoryPatchNode)
    .addNode("return_next_study_action", returnNextStudyActionNode)
    .addEdge(START, "build_context")
    .addEdge("build_context", "classify_user_intent")
    .addEdge("classify_user_intent", "select_teaching_strategy")
    .addEdge("select_teaching_strategy", "decide_curriculum_retrieval")
    .addConditionalEdges(
      "decide_curriculum_retrieval",
      routeAfterRetrievalDecision,
      ["retrieve_curriculum_context", "use_lesson_context"],
    )
    .addEdge("retrieve_curriculum_context", "assess_retrieval_quality")
    .addConditionalEdges(
      "assess_retrieval_quality",
      routeAfterRetrievalAssessment,
      [
        "broaden_retrieval_query",
        "generate_validated_response",
        "use_lesson_context",
      ],
    )
    .addEdge("broaden_retrieval_query", "retrieve_curriculum_context")
    .addEdge("use_lesson_context", "generate_validated_response")
    .addEdge("generate_validated_response", "extract_learning_signals")
    .addEdge("extract_learning_signals", "decide_memory_update")
    .addConditionalEdges(
      "decide_memory_update",
      routeAfterMemoryDecision,
      ["prepare_memory_patch", "return_next_study_action"],
    )
    .addEdge("prepare_memory_patch", "return_next_study_action")
    .addEdge("return_next_study_action", END)
    .compile({ name: "bounded-adaptive-teacher-workflow" });
}

const teacherGraph = createTeacherGraph();

export async function runLangGraphTeacherWorkflow(
  input: TeacherWorkflowInput,
  runtimeOptions: TeacherWorkflowRuntimeOptions = {},
): Promise<TeacherWorkflowResult> {
  const initialState: GraphState = {
    citations: [],
    context: undefined,
    curriculumContext: undefined,
    input,
    intent: undefined,
    memoryPatch: undefined,
    memorySignals: undefined,
    memoryWriteDecision: undefined,
    modelTelemetry: undefined,
    nextStudyAction: undefined,
    retrievalAttempt: 0,
    retrievalDecision: undefined,
    retrievalQuality: undefined,
    retrievalQuery: undefined,
    teacherResponse: undefined,
    teachingStrategy: undefined,
    trace: [
      createTraceEvent("student_message", "Received student message."),
    ],
  };
  const state = await teacherGraph.invoke(initialState, {
    context: {
      onAssistantMessageDelta: runtimeOptions.onAssistantMessageDelta,
    },
    signal: runtimeOptions.signal,
  });

  if (
    !state.teacherResponse ||
    !state.memorySignals ||
    !state.memoryWriteDecision ||
    !state.nextStudyAction ||
    !state.modelTelemetry
  ) {
    throw new Error("LangGraph teacher workflow finished with incomplete state.");
  }

  return {
    teacherResponse: state.teacherResponse,
    modelTelemetry: state.modelTelemetry,
    memorySignals: state.memorySignals,
    memoryWriteDecision: state.memoryWriteDecision,
    memoryPatch: state.memoryPatch,
    nextStudyAction: state.nextStudyAction,
    citations: state.citations ?? [],
    trace: state.trace,
    state: state as TeacherWorkflowState,
  };
}
