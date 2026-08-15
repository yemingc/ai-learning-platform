import type { ConceptId, CourseId, UnitId } from "@/features/knowledge/types";

export type LearningPlanId = string;
export type LearningPlanStepId = string;

export type LearningPlanStatus = "draft" | "active" | "completed";

export type LearningPlanStepStatus =
  | "recommended"
  | "available"
  | "blocked_by_prerequisite"
  | "in_progress"
  | "completed";

export type LearningPlanStep = {
  id: LearningPlanStepId;
  planId: LearningPlanId;
  conceptId: ConceptId;
  sequence: number;
  status: LearningPlanStepStatus;
  rationale: string;
  prerequisiteConceptIds: ConceptId[];
  estimatedMinutes: number;
};

export type LearningPlan = {
  id: LearningPlanId;
  learnerId: string;
  courseId: CourseId;
  unitId?: UnitId;
  title: string;
  goal?: string;
  minutesPerSession?: number;
  status: LearningPlanStatus;
  focusConceptIds: ConceptId[];
  steps: LearningPlanStep[];
  generatedAt: string;
};
