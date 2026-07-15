import type {
  SuggestedStudyAction,
  TeacherChatResponse,
  TeachingMove,
} from "@/features/ai-teacher/types";
import type {
  LearnerMemorySnapshot,
  TeacherIntent,
  TeacherModelTelemetry,
  TeacherWorkflowNode,
} from "@/features/ai-teacher/workflow/types";
import type { ConceptId, CourseId } from "@/features/knowledge/types";
import type { EvaluationReleaseGate } from "@/features/ai-teacher/evaluation/release-gate";

export const TEACHER_EVALUATION_SUITE_VERSION =
  "teacher-unit1-complete-2026-07-15";

export const teacherEvaluationDimensions = [
  "contract",
  "pedagogy",
  "grounding",
  "safety",
  "localization",
  "workflow",
] as const;

export type TeacherEvaluationDimension =
  (typeof teacherEvaluationDimensions)[number];

export type TeacherEvaluationDimensionScore = {
  passedChecks: number;
  totalChecks: number;
  score: number | null;
};

export type TeacherEvaluationCase = {
  id: string;
  title: string;
  courseId: CourseId;
  conceptId: ConceptId;
  locale: "en" | "zh";
  currentSection: string;
  userMessage: string;
  selectedText?: string;
  selectionAction?: string;
  learnerMemorySnapshot?: LearnerMemorySnapshot;
  expectedIntent: TeacherIntent;
  expectedTeachingMove: TeachingMove;
  expectedStudyAction: SuggestedStudyAction;
  requiredTerms?: string[];
  forbiddenPatterns?: string[];
  citationExpectation?: "none" | "at_least_one_grounded";
  riskCategory?:
    | "prompt_injection"
    | "privacy_exfiltration"
    | "false_premise"
    | "citation_hallucination";
  tags?: string[];
  referenceResponse: TeacherChatResponse;
};

export type TeacherEvaluationCheck = {
  id: string;
  label: string;
  dimension: TeacherEvaluationDimension;
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
  dimensionScores: Record<
    TeacherEvaluationDimension,
    TeacherEvaluationDimensionScore
  >;
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
  dimensionScores: Record<
    TeacherEvaluationDimension,
    TeacherEvaluationDimensionScore
  >;
  results: TeacherEvaluationResult[];
  requiredWorkflowNodes: TeacherWorkflowNode[];
};

export type LiveTeacherEvaluationSummary = TeacherEvaluationSummary & {
  mode: "live_model";
  suiteVersion: string;
  startedAt: string;
  completedAt: string;
};

export type LiveTeacherEvaluationResponse = LiveTeacherEvaluationSummary & {
  releaseGate?: EvaluationReleaseGate & { evaluationRunId: string };
};
