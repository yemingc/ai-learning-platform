import type { Concept } from "@/features/knowledge/types";
import type { ConceptMemory } from "@/features/memory/types";

export type StudyAction =
  | "start_lesson"
  | "continue_learning"
  | "repair_misconception"
  | "review_prerequisite"
  | "review_confusing_section"
  | "ready_for_application"
  | "needs_reflection";

export type ApplicationGateStatus = "ready" | "not_ready" | "locked";

export type StudyRecommendation = {
  action: StudyAction;
  actionLabel: string;
  title: string;
  rationale: string;
  suggestedPrompt: string;
  targetSection: string;
  targetConceptId: string;
  applicationGate: {
    status: ApplicationGateStatus;
    label: string;
    reason: string;
  };
  ctaLabel: string;
};

function getApplicationGate(memory?: ConceptMemory) {
  if (!memory) {
    return {
      status: "locked" as const,
      label: "Application locked",
      reason: "Start the lesson before moving into application practice.",
    };
  }

  if (memory.misconceptions.length > 0) {
    return {
      status: "not_ready" as const,
      label: "Not ready yet",
      reason: "Resolve active misconception signals before application.",
    };
  }

  if (memory.readiness >= 75) {
    return {
      status: "ready" as const,
      label: "Ready for application",
      reason: "Readiness is high and no active misconception is tracked.",
    };
  }

  return {
    status: "not_ready" as const,
    label: "Not ready yet",
    reason: "Build more learning evidence before application practice.",
  };
}

function findWeakPrerequisite(
  concept: Concept,
  conceptMemories: Record<string, ConceptMemory>,
  concepts: Concept[],
) {
  return concept.prerequisiteConceptIds
    .map((prerequisiteId) => {
      const prerequisite = concepts.find((item) => item.id === prerequisiteId);
      const memory = conceptMemories[prerequisiteId];

      return prerequisite ? { prerequisite, memory } : undefined;
    })
    .find(
      (item) =>
        item && (!item.memory || item.memory.readiness < 55 || item.memory.misconceptions.length > 0),
    );
}

export function getStudyRecommendation({
  concept,
  conceptMemory,
  conceptMemories,
  concepts,
}: {
  concept: Concept;
  conceptMemory?: ConceptMemory;
  conceptMemories: Record<string, ConceptMemory>;
  concepts: Concept[];
}): StudyRecommendation {
  const applicationGate = getApplicationGate(conceptMemory);
  const weakPrerequisite = findWeakPrerequisite(
    concept,
    conceptMemories,
    concepts,
  );

  if (weakPrerequisite) {
    return {
      action: "review_prerequisite",
      actionLabel: "Review prerequisite",
      title: `Repair prerequisite: ${weakPrerequisite.prerequisite.title}`,
      rationale:
        "This concept depends on prerequisite understanding that is not ready yet.",
      suggestedPrompt: `Help me review ${weakPrerequisite.prerequisite.title} before I continue with ${concept.title}.`,
      targetSection: "Prerequisite connection",
      targetConceptId: weakPrerequisite.prerequisite.id,
      applicationGate,
      ctaLabel: "Open prerequisite lesson",
    };
  }

  if (!conceptMemory) {
    return {
      action: "start_lesson",
      actionLabel: "Start lesson",
      title: "Begin the structured lesson",
      rationale:
        "There is no local learning evidence yet for this concept.",
      suggestedPrompt: `Help me start ${concept.title} with intuition before formal notation.`,
      targetSection: "Why this matters",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: "Start lesson",
    };
  }

  const topMisconception = conceptMemory.misconceptions[0];
  if (topMisconception) {
    return {
      action: "repair_misconception",
      actionLabel: "Repair misconception",
      title: "Fix the active misconception first",
      rationale: `Memory has tracked this misconception ${topMisconception.count} time(s): ${topMisconception.text}`,
      suggestedPrompt: `Can you help me correct this misconception: ${topMisconception.text}`,
      targetSection: "Common trap",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: "Repair with lesson",
    };
  }

  const repeatedConfusion = conceptMemory.confusionSignals
    .slice()
    .sort((a, b) => b.count - a.count)[0];
  if (repeatedConfusion && repeatedConfusion.count >= 2) {
    return {
      action: "review_confusing_section",
      actionLabel: "Review section",
      title: "Revisit the section that keeps coming up",
      rationale: `You asked about ${repeatedConfusion.section} ${repeatedConfusion.count} time(s).`,
      suggestedPrompt: `Can you explain the ${repeatedConfusion.section} section another way?`,
      targetSection: repeatedConfusion.section,
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: "Review section",
    };
  }

  if (conceptMemory.readiness >= 75) {
    return {
      action: "ready_for_application",
      actionLabel: "Ready for application",
      title: "Move into application practice",
      rationale:
        "Readiness is strong and no active misconception is currently tracked.",
      suggestedPrompt: `Give me an application prompt for ${concept.title} that still focuses on learning, not just the answer.`,
      targetSection: "Try applying it",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: "Open application section",
    };
  }

  if (conceptMemory.readiness >= 55) {
    return {
      action: "needs_reflection",
      actionLabel: "Add reflection",
      title: "Make the learning explicit",
      rationale:
        "You have some learning evidence, but reflection can make the concept more durable.",
      suggestedPrompt: `Ask me a reflection question that checks whether I understand ${concept.title}.`,
      targetSection: "Reflection",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: "Reflect in lesson",
    };
  }

  return {
    action: "continue_learning",
    actionLabel: "Continue learning",
    title: "Keep building concept evidence",
    rationale:
      "Readiness is still developing, so the best next action is another guided explanation or example.",
    suggestedPrompt: `Explain ${concept.title} with a fresh example and one guiding question.`,
    targetSection: "Intuition",
    targetConceptId: concept.id,
    applicationGate,
    ctaLabel: "Continue lesson",
  };
}
