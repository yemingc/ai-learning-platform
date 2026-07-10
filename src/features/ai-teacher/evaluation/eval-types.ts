import type {
  SuggestedStudyAction,
  TeacherChatResponse,
  TeachingMove,
} from "@/features/ai-teacher/types";
import type {
  TeacherIntent,
  TeacherModelTelemetry,
  TeacherWorkflowNode,
} from "@/features/ai-teacher/workflow/types";
import type { ConceptId, CourseId } from "@/features/knowledge/types";

export type TeacherEvaluationCase = {
  id: string;
  title: string;
  courseId: CourseId;
  conceptId: ConceptId;
  locale: "en" | "zh";
  currentSection: string;
  userMessage: string;
  selectedText?: string;
  expectedIntent: TeacherIntent;
  expectedTeachingMove: TeachingMove;
  expectedStudyAction: SuggestedStudyAction;
  requiredTerms?: string[];
  forbiddenPatterns?: string[];
  referenceResponse: TeacherChatResponse;
};

export type TeacherEvaluationCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type TeacherEvaluationResult = {
  caseId: string;
  title: string;
  conceptId: ConceptId;
  locale: "en" | "zh";
  score: number;
  passed: boolean;
  checks: TeacherEvaluationCheck[];
  assistantMessage?: string;
  durationMs?: number;
  error?: string;
  workflowEngine?: string;
  modelTelemetry?: TeacherModelTelemetry;
};

export type TeacherEvaluationSummary = {
  totalCases: number;
  passedCases: number;
  averageScore: number;
  results: TeacherEvaluationResult[];
  requiredWorkflowNodes: TeacherWorkflowNode[];
};

export type LiveTeacherEvaluationSummary = TeacherEvaluationSummary & {
  mode: "live_model";
  startedAt: string;
  completedAt: string;
};
