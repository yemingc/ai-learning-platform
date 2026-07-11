import type {
  ConceptMemory,
  ConceptMemoryStatus,
} from "@/features/memory/types";
import { getFormativeAssessmentProgress } from "../assessment/assessment-progress.ts";
import { getActiveMisconceptions } from "./misconception-lifecycle.ts";
import { getCurrentLearningSignals } from "./current-learning-signals.ts";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function getConversationEvidenceModifier(memory: ConceptMemory) {
  const interactionScore = Math.min(memory.interactionCount * 3, 12);
  const latestSignals = getCurrentLearningSignals(memory);
  const teachingMoveScore = memory.recentInteractions.some(
    (interaction) =>
      interaction.teachingMove === "reflect" ||
      interaction.teachingMove === "ask_guiding_question",
  )
    ? 6
    : 0;
  const applicationScore = memory.confusionSignals.some((signal) =>
    signal.section.toLowerCase().includes("apply"),
  )
    ? 5
    : 0;
  const misconceptionPenalty = Math.min(
    getActiveMisconceptions(memory.misconceptions).length * 6,
    18,
  );
  const confidenceDeltaScore = clamp(
    latestSignals.reduce((sum, signal) => sum + signal.confidenceDelta, 0),
    -12,
    12,
  );
  const confusionPenalty = latestSignals.reduce((sum, signal) => {
    if (signal.confusionLevel === "high") {
      return sum + 8;
    }

    if (signal.confusionLevel === "medium") {
      return sum + 3;
    }

    return sum;
  }, 0);
  const reviewPenalty = latestSignals.some((signal) => signal.needsReview)
    ? 6
    : 0;

  return clamp(
    interactionScore +
      teachingMoveScore +
      applicationScore +
      confidenceDeltaScore -
      misconceptionPenalty -
      confusionPenalty -
      reviewPenalty,
    -20,
    18,
  );
}

export function calculateReadiness(memory: ConceptMemory) {
  const assessmentProgress = getFormativeAssessmentProgress(
    memory.assessmentAttempts,
  );
  const conversationModifier = getConversationEvidenceModifier(memory);

  if (assessmentProgress.exitTicketScore !== undefined) {
    const diagnosticScore = assessmentProgress.diagnosticScore ?? 0;
    const positiveGain = Math.max(
      assessmentProgress.exitTicketScore - diagnosticScore,
      0,
    );

    return Math.round(
      clamp(
        20 +
          diagnosticScore * 0.15 +
          assessmentProgress.exitTicketScore * 0.55 +
          Math.min(positiveGain * 0.1, 5) +
          clamp(conversationModifier, -10, 18),
        5,
        95,
      ),
    );
  }

  if (assessmentProgress.diagnosticScore !== undefined) {
    return Math.round(
      clamp(
        20 +
          assessmentProgress.diagnosticScore * 0.45 +
          conversationModifier * 0.5,
        5,
        69,
      ),
    );
  }

  // Conversation signals personalize support, but cannot certify mastery alone.
  // A learner needs an exit-ticket result before readiness can reach "familiar".
  return Math.round(clamp(18 + conversationModifier * 2, 5, 69));
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
