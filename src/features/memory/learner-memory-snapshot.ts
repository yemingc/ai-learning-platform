import type { LearnerMemorySnapshot } from "@/features/ai-teacher/workflow/types";
import type { ConceptMemory } from "@/features/memory/types";
import { getFormativeAssessmentProgress } from "../assessment/assessment-progress.ts";
import { getActiveMisconceptions } from "./misconception-lifecycle.ts";
import { getCurrentLearningSignals } from "./current-learning-signals.ts";

const MAX_RECENT_ITEMS = 3;

export function createLearnerMemorySnapshot(
  conceptMemory: ConceptMemory | undefined,
  conceptId: string,
): LearnerMemorySnapshot {
  if (!conceptMemory) {
    return {
      source: "server_persistent",
      conceptId,
      interactionCount: 0,
      recentConfusionSections: [],
      recentMisconceptions: [],
      assessmentEvidenceLevel: "none",
    };
  }

  const latestSignal = getCurrentLearningSignals(conceptMemory, 1)[0];
  const assessmentProgress = getFormativeAssessmentProgress(
    conceptMemory.assessmentAttempts,
  );
  const recentMisconceptions = getActiveMisconceptions(
    conceptMemory.misconceptions,
  )
    .slice()
    .sort(
      (a, b) =>
        b.count - a.count || b.lastSeenAt.localeCompare(a.lastSeenAt),
    )
    .slice(0, MAX_RECENT_ITEMS)
    .map((item) => item.text);
  const recentConfusionSections = conceptMemory.confusionSignals
    .slice()
    .sort(
      (a, b) =>
        b.count - a.count || b.lastSeenAt.localeCompare(a.lastSeenAt),
    )
    .slice(0, MAX_RECENT_ITEMS)
    .map((item) => item.section);

  return {
    source: "server_persistent",
    conceptId,
    interactionCount: conceptMemory.interactionCount,
    latestEvidenceNote: latestSignal?.evidenceNote,
    latestSuggestedStudyAction: latestSignal?.suggestedStudyAction,
    diagnosticScore: assessmentProgress.diagnosticScore,
    exitTicketScore: assessmentProgress.exitTicketScore,
    learningGain: assessmentProgress.learningGain,
    assessmentEvidenceLevel: assessmentProgress.evidenceLevel,
    readiness: conceptMemory.readiness,
    recentConfusionSections,
    recentMisconceptions,
    status: conceptMemory.status,
  };
}
