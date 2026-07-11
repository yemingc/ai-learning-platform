import type {
  TeacherMemorySignals,
  TeachingMove,
} from "@/features/ai-teacher/types";
import type {
  CurriculumRetrievalDecision,
  CurriculumRetrievalQuality,
  LearnerMemoryPatch,
  LearnerMemorySnapshot,
  TeacherIntent,
  TeacherMemoryWriteDecision,
  TeacherWorkflowInput,
} from "@/features/ai-teacher/workflow/types";
import type { TeacherChatResponse } from "@/features/ai-teacher/types";
import type { AssembledCurriculumContext } from "@/features/rag/curriculum-context";

const LIGHTWEIGHT_MESSAGES = new Set([
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

export function isLightweightTeacherMessage(userMessage: string) {
  return LIGHTWEIGHT_MESSAGES.has(userMessage.trim().toLowerCase());
}

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

  if (
    intent === "general_support" &&
    !LIGHTWEIGHT_MESSAGES.has(normalizedMessage)
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

export function decideCurriculumRetrieval({
  input,
  intent,
}: {
  input: Pick<
    TeacherWorkflowInput,
    "selectedText" | "selectionAction" | "userMessage"
  >;
  intent: TeacherIntent;
}): CurriculumRetrievalDecision {
  if (input.selectedText || input.selectionAction) {
    return "retrieve";
  }

  if (isLightweightTeacherMessage(input.userMessage)) {
    return "skip";
  }

  if (intent !== "general_support") {
    return "retrieve";
  }

  return input.userMessage.trim().length >= 4 ? "retrieve" : "skip";
}

export function assessCurriculumRetrievalQuality({
  context,
  currentConceptId,
}: {
  context: AssembledCurriculumContext;
  currentConceptId: string;
}): CurriculumRetrievalQuality {
  if (!context.retrievedChunks.length) {
    return "unavailable";
  }

  return context.retrievedChunks.some(
    (chunk) => chunk.conceptId === currentConceptId,
  )
    ? "sufficient"
    : "insufficient";
}

export function buildBroadenedRetrievalQuery(
  input: Pick<
    TeacherWorkflowInput,
    "concept" | "currentSection" | "selectedText" | "userMessage"
  >,
) {
  return [
    input.concept.title,
    input.currentSection,
    input.selectedText,
    input.userMessage,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join("\n");
}

export function decideTeacherMemoryUpdate({
  input,
  intent,
  response,
}: {
  input: Pick<
    TeacherWorkflowInput,
    "selectedText" | "selectionAction" | "userMessage"
  >;
  intent: TeacherIntent;
  response: TeacherChatResponse;
}): TeacherMemoryWriteDecision {
  if (isLightweightTeacherMessage(input.userMessage)) {
    return "skip";
  }

  if (
    input.selectedText ||
    input.selectionAction ||
    intent !== "general_support" ||
    response.detectedMisconception ||
    response.memorySignals.confusionLevel === "high" ||
    response.memorySignals.needsReview ||
    Math.abs(response.memorySignals.confidenceDelta) >= 4
  ) {
    return "persist";
  }

  return "record_interaction_only";
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
