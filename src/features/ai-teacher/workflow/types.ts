import type { Concept } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";
import type {
  TeacherChatMessage,
  TeacherChatResponse,
  TeacherMemorySignals,
  TeachingMove,
} from "@/features/ai-teacher/types";
import type {
  AssembledCurriculumContext,
  CurriculumCitation,
} from "@/features/rag/curriculum-context";
import type { ConceptMemoryStatus } from "@/features/memory/types";

export type TeacherIntent =
  | "confusion"
  | "example_request"
  | "misconception"
  | "reflection"
  | "application"
  | "general_support";

export type TeacherWorkflowNode =
  | "student_message"
  | "build_context"
  | "classify_user_intent"
  | "select_teaching_strategy"
  | "retrieve_curriculum_chunks"
  | "assemble_curriculum_context"
  | "generate_teaching_response"
  | "validate_structured_output"
  | "extract_learning_signals"
  | "update_learner_memory"
  | "return_next_study_action";

export type TeacherWorkflowTraceEvent = {
  node: TeacherWorkflowNode;
  status: "success" | "skipped" | "error";
  detail?: string;
  createdAt: string;
};

export type TeacherModelTelemetry = {
  provider: "deepseek";
  model: string;
  promptVersion: string;
  durationMs: number;
  firstTokenDurationMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  finishReason?: string;
};

export type LearnerMemorySnapshot = {
  source: "server_persistent" | "not_available";
  conceptId?: string;
  readiness?: number;
  status?: ConceptMemoryStatus;
  interactionCount?: number;
  recentMisconceptions?: string[];
  recentConfusionSections?: string[];
  latestSuggestedStudyAction?: TeacherMemorySignals["suggestedStudyAction"];
  latestEvidenceNote?: string;
  diagnosticScore?: number;
  exitTicketScore?: number;
  learningGain?: number;
  assessmentEvidenceLevel?: "none" | "diagnostic" | "pre_post";
};

export type LearnerMemoryPatch = {
  conceptId: string;
  source: "teacher_workflow";
  memorySignals: TeacherMemorySignals;
  shouldPersistClientSide: boolean;
  rationale: string;
};

export type NextStudyActionHint = {
  action: TeacherMemorySignals["suggestedStudyAction"];
  reason: string;
};

export type TeacherWorkflowInput = {
  concept: Concept;
  lesson: LessonContent;
  locale: "en" | "zh";
  currentSection: string;
  userMessage: string;
  selectedText?: string;
  selectionAction?: string;
  chatHistory: TeacherChatMessage[];
  learnerMemorySnapshot?: LearnerMemorySnapshot;
};

export type TeacherWorkflowRuntimeOptions = {
  signal?: AbortSignal;
  onAssistantMessageDelta?: (delta: string) => void;
};

export type TeacherWorkflowContext = {
  concept: Concept;
  lesson: LessonContent;
  currentSection: string;
  learnerMemorySnapshot: LearnerMemorySnapshot;
};

export type TeacherWorkflowState = {
  input: TeacherWorkflowInput;
  context?: TeacherWorkflowContext;
  intent?: TeacherIntent;
  teachingStrategy?: TeachingMove;
  curriculumContext?: AssembledCurriculumContext;
  citations?: CurriculumCitation[];
  teacherResponse?: TeacherChatResponse;
  modelTelemetry?: TeacherModelTelemetry;
  memorySignals?: TeacherMemorySignals;
  memoryPatch?: LearnerMemoryPatch;
  nextStudyAction?: NextStudyActionHint;
  trace: TeacherWorkflowTraceEvent[];
  errors: string[];
};

export type TeacherWorkflowResult = {
  teacherResponse: TeacherChatResponse;
  modelTelemetry: TeacherModelTelemetry;
  memorySignals: TeacherMemorySignals;
  memoryPatch: LearnerMemoryPatch;
  nextStudyAction: NextStudyActionHint;
  citations: CurriculumCitation[];
  trace: TeacherWorkflowTraceEvent[];
  state: TeacherWorkflowState;
};
