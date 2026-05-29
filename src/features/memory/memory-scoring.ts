import type {
  ConceptMemory,
  ConceptMemoryStatus,
} from "@/features/memory/types";

export function calculateReadiness(memory: ConceptMemory) {
  const interactionScore = Math.min(memory.interactionCount * 14, 56);
  const latestSignals = (memory.memorySignalHistory ?? []).slice(0, 4);
  const teachingMoveScore = memory.recentInteractions.some(
    (interaction) =>
      interaction.teachingMove === "reflect" ||
      interaction.teachingMove === "ask_guiding_question",
  )
    ? 12
    : 0;
  const applicationScore = memory.confusionSignals.some((signal) =>
    signal.section.toLowerCase().includes("apply"),
  )
    ? 10
    : 0;
  const misconceptionPenalty = Math.min(memory.misconceptions.length * 8, 24);
  const confidenceDeltaScore = latestSignals.reduce(
    (sum, signal) => sum + signal.confidenceDelta,
    0,
  );
  const confusionPenalty = latestSignals.reduce((sum, signal) => {
    if (signal.confusionLevel === "high") {
      return sum + 10;
    }

    if (signal.confusionLevel === "medium") {
      return sum + 4;
    }

    return sum;
  }, 0);
  const reviewPenalty = latestSignals.some((signal) => signal.needsReview)
    ? 8
    : 0;

  return Math.max(
    5,
    Math.min(
      95,
      18 +
        interactionScore +
        teachingMoveScore +
        applicationScore +
        confidenceDeltaScore -
        misconceptionPenalty -
        confusionPenalty -
        reviewPenalty,
    ),
  );
}

export function getConceptMemoryStatus(readiness: number): ConceptMemoryStatus {
  if (readiness < 20) {
    return "not_started";
  }

  if (readiness < 55) {
    return "learning";
  }

  if (readiness < 72) {
    return "needs_review";
  }

  return "familiar";
}
