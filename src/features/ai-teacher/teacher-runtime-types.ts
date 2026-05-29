import type { Concept } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";
import type {
  TeacherChatMessage,
  TeacherChatResponse,
  TeachingMove,
} from "@/features/ai-teacher/types";

export type TeacherIntent =
  | "confusion"
  | "example_request"
  | "misconception"
  | "reflection"
  | "application"
  | "general_support";

export type LearnerMemoryPlaceholder = {
  status: "not_connected_yet";
  signals: {
    repeatedConfusionConceptIds: string[];
    knownMisconceptions: string[];
    preferredExplanationStyle?: string;
  };
};

export type TeacherRuntimeInput = {
  concept: Concept;
  lesson: LessonContent;
  locale: "en" | "zh";
  currentSection: string;
  userMessage: string;
  selectedText?: string;
  selectionAction?: string;
  chatHistory: TeacherChatMessage[];
};

export type TeacherRuntimeEvent = {
  node:
    | "initialize"
    | "load_memory_placeholder"
    | "classify_intent"
    | "select_teaching_move_hint"
    | "generate_response"
    | "validate_response";
  status: "success";
  detail?: string;
};

export type TeacherRuntimeState = TeacherRuntimeInput & {
  learnerMemory: LearnerMemoryPlaceholder;
  intent: TeacherIntent;
  teachingMoveHint: TeachingMove;
  response?: TeacherChatResponse;
  events: TeacherRuntimeEvent[];
};

export type TeacherRuntimeResult = {
  response: TeacherChatResponse;
  state: TeacherRuntimeState;
};
