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
import type {
  LearningAgentToolTrace,
  PendingLearningPlanAction,
} from "@/features/ai-teacher/tools/types";
import type { LearningAgentActionMode } from "@/features/ai-teacher/tools/tool-policy";

export type TeacherIntent =
  | "confusion"
  | "example_request"
  | "misconception"
  | "reflection"
  | "application"
  | "general_support";

export type CurriculumRetrievalDecision = "retrieve" | "skip";

export type CurriculumRetrievalQuality =
  | "sufficient"
  | "insufficient"
  | "unavailable";

export type TeacherMemoryWriteDecision =
  | "persist"
  | "record_interaction_only"
  | "skip";

export type TeacherWorkflowNode =
  | "student_message"
  | "build_context"
  | "classify_user_intent"
  | "select_teaching_strategy"
  | "decide_agent_action"
  | "plan_tool_calls"
  | "execute_learning_tool"
  | "request_action_confirmation"
  | "return_agent_action"
  | "decide_curriculum_retrieval"
  | "retrieve_curriculum_context"
  | "assess_retrieval_quality"
  | "broaden_retrieval_query"
  | "use_lesson_context"
  | "generate_validated_response"
  | "extract_learning_signals"
  | "decide_memory_update"
  | "prepare_memory_patch"
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
  onWorkflowStage?: (
    stage: "planning_action" | "executing_tools" | "awaiting_confirmation",
  ) => void;
  agentContext?: {
    learnerId: string;
    courseId: string;
    runId: string;
  };
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
  actionMode?: LearningAgentActionMode;
  pendingAgentAction?: PendingLearningPlanAction;
  toolTrace?: LearningAgentToolTrace[];
  intent?: TeacherIntent;
  teachingStrategy?: TeachingMove;
  retrievalDecision?: CurriculumRetrievalDecision;
  retrievalAttempt: number;
  retrievalQuery?: string;
  retrievalQuality?: CurriculumRetrievalQuality;
  curriculumContext?: AssembledCurriculumContext;
  citations?: CurriculumCitation[];
  teacherResponse?: TeacherChatResponse;
  modelTelemetry?: TeacherModelTelemetry;
  memorySignals?: TeacherMemorySignals;
  memoryWriteDecision?: TeacherMemoryWriteDecision;
  memoryPatch?: LearnerMemoryPatch;
  nextStudyAction?: NextStudyActionHint;
  trace: TeacherWorkflowTraceEvent[];
};

export type TeacherWorkflowResult = {
  teacherResponse: TeacherChatResponse;
  modelTelemetry: TeacherModelTelemetry;
  memorySignals: TeacherMemorySignals;
  memoryWriteDecision: TeacherMemoryWriteDecision;
  memoryPatch?: LearnerMemoryPatch;
  nextStudyAction: NextStudyActionHint;
  citations: CurriculumCitation[];
  trace: TeacherWorkflowTraceEvent[];
  state: TeacherWorkflowState;
  pendingAgentAction?: PendingLearningPlanAction;
  toolTrace?: LearningAgentToolTrace[];
};
