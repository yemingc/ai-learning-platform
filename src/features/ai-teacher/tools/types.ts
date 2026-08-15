import { z } from "zod";
import type { CurriculumCitation } from "@/features/rag/curriculum-context";
import type { LearningPlan } from "@/features/planner/types";

export const learningAgentToolNameSchema = z.enum([
  "get_learning_state",
  "retrieve_course_evidence",
  "draft_learning_plan",
  "activate_learning_plan",
]);

export const getLearningStateInputSchema = z
  .object({
    conceptIds: z.array(z.string().min(1)).max(8).optional(),
  })
  .strict();

export const retrieveCourseEvidenceInputSchema = z
  .object({
    query: z.string().min(2).max(500),
    conceptId: z.string().min(1).optional(),
  })
  .strict();

export const draftLearningPlanInputSchema = z
  .object({
    goal: z.string().min(2).max(240).optional(),
    minutesAvailable: z.number().int().min(10).max(240).optional(),
  })
  .strict();

export const activateLearningPlanInputSchema = z
  .object({
    draftId: z.string().uuid(),
  })
  .strict();

export type LearningAgentToolName = z.infer<
  typeof learningAgentToolNameSchema
>;

export type LearningAgentToolCall = {
  id: string;
  name: LearningAgentToolName;
  argumentsJson: string;
};

export type LearningAgentToolTrace = {
  callId: string;
  toolName: string;
  status: "succeeded" | "rejected" | "failed";
  durationMs: number;
  detail: string;
};

export type LearningPlanPreview = {
  draftId: string;
  title: string;
  goal?: string;
  minutesPerSession?: number;
  focusConceptIds: string[];
  focusConceptTitles: string[];
  estimatedMinutes: number;
  stepCount: number;
  generatedAt: string;
};

export type PendingLearningPlanAction = {
  type: "activate_learning_plan";
  status: "pending";
  confirmationToken: string;
  expiresAt: string;
  preview: LearningPlanPreview;
};

export type LearningAgentToolResult = {
  callId: string;
  toolName: LearningAgentToolName;
  modelContent: string;
  summary: string;
  pendingAction?: PendingLearningPlanAction;
  citations?: CurriculumCitation[];
  plan?: LearningPlan;
};

export type LearningPlanActionDecision = "confirm" | "reject";

export type LearningPlanActionResult = {
  decision: LearningPlanActionDecision;
  status: "confirmed" | "already_confirmed" | "rejected";
  plan?: LearningPlan;
  version?: number;
};
