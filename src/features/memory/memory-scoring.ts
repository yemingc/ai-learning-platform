import type {
  ConceptMemory,
  ConceptMemoryStatus,
} from "@/features/memory/types";

export function calculateReadiness(memory: ConceptMemory) {
  const interactionScore = Math.min(memory.interactionCount * 14, 56);
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

  return Math.max(
    5,
    Math.min(95, 18 + interactionScore + teachingMoveScore + applicationScore - misconceptionPenalty),
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
