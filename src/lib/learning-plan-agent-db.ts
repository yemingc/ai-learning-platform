import "server-only";

import { createLearningPlanActionRepository } from "@/features/planner/learning-plan-action-repository";
import { openApplicationDatabase } from "@/lib/application-db";

const repository = createLearningPlanActionRepository(
  openApplicationDatabase(),
);

export const createPendingLearningPlanAction =
  repository.createPendingAction;
export const getActiveLearningPlan = repository.getActivePlan;
export const getPendingLearningPlanPreview = repository.getPendingPreview;
export const resolvePendingLearningPlanAction =
  repository.resolvePendingAction;
