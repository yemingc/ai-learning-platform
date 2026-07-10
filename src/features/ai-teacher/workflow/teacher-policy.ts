import type {
  TeacherMemorySignals,
  TeachingMove,
} from "@/features/ai-teacher/types";
import type {
  LearnerMemoryPatch,
  LearnerMemorySnapshot,
  TeacherIntent,
  TeacherWorkflowInput,
} from "@/features/ai-teacher/workflow/types";

export function classifyTeacherIntent(
  input: Pick<TeacherWorkflowInput, "selectionAction" | "userMessage">,
): TeacherIntent {
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

export function selectTeachingStrategy(
  intent: TeacherIntent,
  memory?: LearnerMemorySnapshot,
  userMessage = "",
): TeachingMove {
  const normalizedMessage = userMessage.trim().toLowerCase();
  const lightweightMessages = new Set([
    "hi",
    "hello",
    "hey",
    "thanks",
    "thank you",
    "ok",
    "okay",
    "你好",
    "谢谢",
    "好的",
    "明白了",
  ]);

  if (
    intent === "general_support" &&
    !lightweightMessages.has(normalizedMessage)
  ) {
    if (memory?.recentMisconceptions?.length) {
      return "correct_misconception";
    }

    if ((memory?.readiness ?? 0) >= 75) {
      return "reflect";
    }
  }

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

export function createTeacherMemoryPatch({
  conceptId,
  memorySignals,
  memorySnapshot,
}: {
  conceptId: string;
  memorySignals: TeacherMemorySignals;
  memorySnapshot?: LearnerMemorySnapshot;
}): LearnerMemoryPatch {
  const usesServerPersistence =
    memorySnapshot?.source === "server_persistent";

  return {
    conceptId,
    source: "teacher_workflow",
    memorySignals,
    shouldPersistClientSide: !usesServerPersistence,
    rationale: usesServerPersistence
      ? "The authenticated teacher route will persist this patch to server-side learner memory."
      : "No server-persistent learner memory was available, so a client-side persistence adapter may handle this patch.",
  };
}
