import "server-only";

import { generateTeacherResponse } from "@/features/ai-teacher/teacher-service";
import type {
  LearnerMemoryPlaceholder,
  TeacherIntent,
  TeacherRuntimeEvent,
  TeacherRuntimeInput,
  TeacherRuntimeResult,
  TeacherRuntimeState,
} from "@/features/ai-teacher/teacher-runtime-types";
import type { TeachingMove } from "@/features/ai-teacher/types";

function appendEvent(
  events: TeacherRuntimeEvent[],
  event: TeacherRuntimeEvent,
) {
  return [...events, event];
}

function createLearnerMemoryPlaceholder(): LearnerMemoryPlaceholder {
  return {
    status: "not_connected_yet",
    signals: {
      repeatedConfusionConceptIds: [],
      knownMisconceptions: [],
    },
  };
}

function classifyIntent(input: TeacherRuntimeInput): TeacherIntent {
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

function selectTeachingMoveHint(intent: TeacherIntent): TeachingMove {
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

function initializeRuntimeState(input: TeacherRuntimeInput): TeacherRuntimeState {
  return {
    ...input,
    learnerMemory: createLearnerMemoryPlaceholder(),
    intent: "general_support",
    teachingMoveHint: "explain",
    events: [
      {
        node: "initialize",
        status: "success",
        detail: "Created graph-ready teacher runtime state.",
      },
    ],
  };
}

export async function runTeacherRuntime(
  input: TeacherRuntimeInput,
): Promise<TeacherRuntimeResult> {
  let state = initializeRuntimeState(input);

  state = {
    ...state,
    events: appendEvent(state.events, {
      node: "load_memory_placeholder",
      status: "success",
      detail: "Learner memory is intentionally a placeholder until persistence is added.",
    }),
  };

  const intent = classifyIntent(input);
  state = {
    ...state,
    intent,
    events: appendEvent(state.events, {
      node: "classify_intent",
      status: "success",
      detail: intent,
    }),
  };

  const teachingMoveHint = selectTeachingMoveHint(intent);
  state = {
    ...state,
    teachingMoveHint,
    events: appendEvent(state.events, {
      node: "select_teaching_move_hint",
      status: "success",
      detail: teachingMoveHint,
    }),
  };

  const response = await generateTeacherResponse(state);
  state = {
    ...state,
    response,
    events: appendEvent(
      appendEvent(state.events, {
        node: "generate_response",
        status: "success",
      }),
      {
        node: "validate_response",
        status: "success",
        detail: "Response matched TeacherChatResponse schema.",
      },
    ),
  };

  return {
    response,
    state,
  };
}
