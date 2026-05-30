import "server-only";

import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { generateTeacherResponse } from "@/features/ai-teacher/teacher-service";
import type { TeachingMove } from "@/features/ai-teacher/types";
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

const TeacherWorkflowAnnotation = Annotation.Root({
  context: Annotation<TeacherWorkflowContext | undefined>(),
  errors: Annotation<string[]>(),
  input: Annotation<TeacherWorkflowInput>(),
  intent: Annotation<TeacherIntent | undefined>(),
  memoryPatch: Annotation<LearnerMemoryPatch | undefined>(),
  memorySignals: Annotation<TeacherWorkflowResult["memorySignals"] | undefined>(),
  nextStudyAction: Annotation<NextStudyActionHint | undefined>(),
  teacherResponse: Annotation<TeacherWorkflowResult["teacherResponse"] | undefined>(),
  teachingStrategy: Annotation<TeachingMove | undefined>(),
  trace: Annotation<TeacherWorkflowTraceEvent[]>(),
});

type GraphState = typeof TeacherWorkflowAnnotation.State;
type GraphUpdate = Partial<GraphState>;

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
  state: GraphState,
  node: TeacherWorkflowNode,
  detail?: string,
) {
  return [...(state.trace ?? []), createTraceEvent(node, detail)];
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

function buildContextNode(state: GraphState): GraphUpdate {
  const learnerMemorySnapshot: LearnerMemorySnapshot =
    state.input.learnerMemorySnapshot ?? {
      source: "not_available",
      conceptId: state.input.concept.id,
      recentConfusionSections: [],
      recentMisconceptions: [],
    };

  return {
    context: {
      concept: state.input.concept,
      currentSection: state.input.currentSection,
      learnerMemorySnapshot,
      lesson: state.input.lesson,
    },
    trace: appendTrace(
      state,
      "build_context",
      "Loaded static concept, lesson, section, and learner memory snapshot.",
    ),
  };
}

function classifyUserIntentNode(state: GraphState): GraphUpdate {
  const intent = classifyUserIntent(state.input);

  return {
    intent,
    trace: appendTrace(state, "classify_user_intent", intent),
  };
}

function selectTeachingStrategyNode(state: GraphState): GraphUpdate {
  const teachingStrategy = selectTeachingStrategy(
    state.intent ?? "general_support",
  );

  return {
    teachingStrategy,
    trace: appendTrace(
      state,
      "select_teaching_strategy",
      teachingStrategy,
    ),
  };
}

async function generateTeachingResponseNode(
  state: GraphState,
): Promise<GraphUpdate> {
  const teacherResponse = await generateTeacherResponse({
    ...state.input,
    intent: state.intent,
    teachingMoveHint: state.teachingStrategy,
  });

  return {
    teacherResponse,
    trace: appendTrace(
      state,
      "generate_teaching_response",
      teacherResponse.teachingMove,
    ),
  };
}

function validateStructuredOutputNode(state: GraphState): GraphUpdate {
  return {
    trace: appendTrace(
      state,
      "validate_structured_output",
      "DeepSeek output normalized and validated against TeacherChatResponse schema.",
    ),
  };
}

function extractLearningSignalsNode(state: GraphState): GraphUpdate {
  if (!state.teacherResponse) {
    throw new Error("Cannot extract learning signals before teacher response.");
  }

  const memorySignals = state.teacherResponse.memorySignals;

  return {
    memorySignals,
    trace: appendTrace(
      state,
      "extract_learning_signals",
      `${memorySignals.confusionLevel} confusion, ${memorySignals.suggestedStudyAction}`,
    ),
  };
}

function updateLearnerMemoryNode(state: GraphState): GraphUpdate {
  if (!state.memorySignals) {
    throw new Error("Cannot create memory patch before learning signals exist.");
  }

  const memoryPatch: LearnerMemoryPatch = {
    conceptId: state.input.concept.id,
    source: "teacher_workflow",
    memorySignals: state.memorySignals,
    shouldPersistClientSide:
      state.context?.learnerMemorySnapshot.source !== "server_persistent",
    rationale:
      "Memory persistence is currently handled by the local-demo client store; a future LangGraph version can persist this patch server-side.",
  };

  return {
    memoryPatch,
    trace: appendTrace(
      state,
      "update_learner_memory",
      memoryPatch.shouldPersistClientSide
        ? "Prepared client-side memory patch."
        : "Prepared server-side memory patch.",
    ),
  };
}

function returnNextStudyActionNode(state: GraphState): GraphUpdate {
  if (!state.memorySignals) {
    throw new Error("Cannot create study action before learning signals exist.");
  }

  const nextStudyAction: NextStudyActionHint = {
    action: state.memorySignals.suggestedStudyAction,
    reason: state.memorySignals.evidenceNote,
  };

  return {
    nextStudyAction,
    trace: appendTrace(
      state,
      "return_next_study_action",
      nextStudyAction.action,
    ),
  };
}

function createTeacherGraph() {
  return new StateGraph(TeacherWorkflowAnnotation)
    .addNode("build_context", buildContextNode)
    .addNode("classify_user_intent", classifyUserIntentNode)
    .addNode("select_teaching_strategy", selectTeachingStrategyNode)
    .addNode("generate_teaching_response", generateTeachingResponseNode)
    .addNode("validate_structured_output", validateStructuredOutputNode)
    .addNode("extract_learning_signals", extractLearningSignalsNode)
    .addNode("update_learner_memory", updateLearnerMemoryNode)
    .addNode("return_next_study_action", returnNextStudyActionNode)
    .addEdge(START, "build_context")
    .addEdge("build_context", "classify_user_intent")
    .addEdge("classify_user_intent", "select_teaching_strategy")
    .addEdge("select_teaching_strategy", "generate_teaching_response")
    .addEdge("generate_teaching_response", "validate_structured_output")
    .addEdge("validate_structured_output", "extract_learning_signals")
    .addEdge("extract_learning_signals", "update_learner_memory")
    .addEdge("update_learner_memory", "return_next_study_action")
    .addEdge("return_next_study_action", END)
    .compile();
}

export async function runLangGraphTeacherWorkflow(
  input: TeacherWorkflowInput,
): Promise<TeacherWorkflowResult> {
  const graph = createTeacherGraph();
  const initialState: GraphState = {
    context: undefined,
    errors: [],
    input,
    intent: undefined,
    memoryPatch: undefined,
    memorySignals: undefined,
    nextStudyAction: undefined,
    teacherResponse: undefined,
    teachingStrategy: undefined,
    trace: [
      createTraceEvent("student_message", "Received student message."),
    ],
  };
  const state = await graph.invoke(initialState);

  if (
    !state.teacherResponse ||
    !state.memorySignals ||
    !state.memoryPatch ||
    !state.nextStudyAction
  ) {
    throw new Error("LangGraph teacher workflow finished with incomplete state.");
  }

  return {
    teacherResponse: state.teacherResponse,
    memorySignals: state.memorySignals,
    memoryPatch: state.memoryPatch,
    nextStudyAction: state.nextStudyAction,
    trace: state.trace,
    state: state as TeacherWorkflowState,
  };
}
