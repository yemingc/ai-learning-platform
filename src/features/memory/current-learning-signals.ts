import { getLatestAssessmentAttempt } from "../assessment/assessment-progress.ts";
import type { ConceptMemory } from "./types.ts";

const DEFAULT_SIGNAL_LIMIT = 4;

export function getCurrentLearningSignals(
  memory: ConceptMemory | undefined,
  limit = DEFAULT_SIGNAL_LIMIT,
) {
  if (!memory) {
    return [];
  }

  const latestExit = getLatestAssessmentAttempt(
    memory.assessmentAttempts,
    "exit_ticket",
  );

  if (!latestExit) {
    return (memory.memorySignalHistory ?? []).slice(0, limit);
  }

  return (memory.recentInteractions ?? [])
    .filter((interaction) => interaction.createdAt > latestExit.submittedAt)
    .slice(0, limit)
    .map((interaction) => interaction.memorySignals);
}

export function hasCurrentReviewSignal(memory: ConceptMemory | undefined) {
  return getCurrentLearningSignals(memory).some(
    (signal) => signal.needsReview || signal.confusionLevel === "high",
  );
}
