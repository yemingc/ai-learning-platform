import { getFormativeAssessmentProgress } from "../assessment/assessment-progress.ts";
import type { CurriculumPack } from "../../curricula/types.ts";
import type { ConceptMemory, LearnerMemory } from "../memory/types.ts";
import { getActiveMisconceptions } from "../memory/misconception-lifecycle.ts";
import { hasCurrentReviewSignal } from "../memory/current-learning-signals.ts";
import type {
  LearningPlan,
  LearningPlanStep,
  LearningPlanStepStatus,
} from "./types.ts";

type PlanLanguage = "en" | "zh";

type AdaptiveLearningPlanInput = {
  curriculum: CurriculumPack;
  language?: PlanLanguage;
  memory: Pick<LearnerMemory, "conceptMemories">;
  now?: string;
};

type StepDraft = LearningPlanStep & {
  priority: number;
};

const MAX_FOCUS_CONCEPTS = 3;

function isConceptComplete(memory: ConceptMemory | undefined) {
  if (!memory || getActiveMisconceptions(memory.misconceptions).length > 0) {
    return false;
  }

  const progress = getFormativeAssessmentProgress(memory.assessmentAttempts);

  return (
    progress.exitTicketScore !== undefined &&
    progress.exitTicketScore >= 50 &&
    memory.readiness >= 75 &&
    !hasCurrentReviewSignal(memory)
  );
}

function isPrerequisiteStable(memory: ConceptMemory | undefined) {
  return Boolean(
    memory &&
      memory.readiness >= 55 &&
      getActiveMisconceptions(memory.misconceptions).length === 0 &&
      !hasCurrentReviewSignal(memory),
  );
}

function getStepPriority(
  memory: ConceptMemory | undefined,
  sequence: number,
) {
  if (!memory) {
    return 100 - sequence;
  }

  const progress = getFormativeAssessmentProgress(memory.assessmentAttempts);
  const activeMisconceptions = getActiveMisconceptions(
    memory.misconceptions,
  );
  let score = 200 + (100 - memory.readiness) - sequence;

  if (activeMisconceptions.length > 0) {
    score += 600 + activeMisconceptions.length * 20;
  }

  if (hasCurrentReviewSignal(memory) || memory.status === "needs_review") {
    score += 400;
  }

  if (
    progress.exitTicketScore !== undefined &&
    progress.exitTicketScore < 50
  ) {
    score += 300;
  } else if (progress.exitTicketScore === undefined) {
    score += 120;
  }

  return score;
}

function getRationale({
  blockerCount,
  language,
  memory,
  status,
}: {
  blockerCount: number;
  language: PlanLanguage;
  memory: ConceptMemory | undefined;
  status: LearningPlanStepStatus;
}) {
  const isZh = language === "zh";

  if (status === "completed") {
    return isZh
      ? "离堂证据、准备度和学习信号都已达到当前完成标准。"
      : "Exit evidence, readiness, and learning signals meet the current completion standard.";
  }

  if (status === "blocked_by_prerequisite") {
    return isZh
      ? `先稳定 ${blockerCount} 个先修概念，再进入这一节点。`
      : `Stabilize ${blockerCount} prerequisite concept${blockerCount === 1 ? "" : "s"} before starting this node.`;
  }

  if (!memory) {
    return isZh
      ? "这个概念已经解锁，且还没有学习记录，适合作为新的学习节点。"
      : "This concept is unlocked and has no learning evidence yet, making it a good next node.";
  }

  const progress = getFormativeAssessmentProgress(memory.assessmentAttempts);
  const activeMisconceptions = getActiveMisconceptions(
    memory.misconceptions,
  );

  if (activeMisconceptions.length > 0) {
    return isZh
      ? `学习记忆中仍有 ${activeMisconceptions.length} 个活跃误区，优先修复可以避免影响后续概念。`
      : `${activeMisconceptions.length} active misconception${activeMisconceptions.length === 1 ? "" : "s"} should be repaired before they affect later concepts.`;
  }

  if (hasCurrentReviewSignal(memory) || memory.status === "needs_review") {
    return isZh
      ? "最近的学习信号显示需要复习，先巩固这一节点。"
      : "Recent learning signals call for review, so this node should be reinforced first.";
  }

  if (
    progress.exitTicketScore !== undefined &&
    progress.exitTicketScore < 50
  ) {
    return isZh
      ? `最近一次离堂检查为 ${progress.exitTicketScore}%，需要换一种表示方式重新学习。`
      : `The latest exit ticket is ${progress.exitTicketScore}%, so relearn it with a different representation.`;
  }

  if (progress.exitTicketScore === undefined) {
    return isZh
      ? "已经开始学习，但还需要离堂检查来验证理解是否迁移。"
      : "Learning has started, but an exit ticket is still needed to verify transfer.";
  }

  return isZh
    ? "继续补充学习证据，让当前理解更加稳定。"
    : "Keep building learning evidence until the current understanding is stable.";
}

export function createAdaptiveLearningPlan({
  curriculum,
  language = "en",
  memory,
  now = new Date().toISOString(),
}: AdaptiveLearningPlanInput): LearningPlan {
  const planId = `adaptive-${curriculum.course.id}`;
  const completedConceptIds = new Set(
    curriculum.concepts
      .filter((concept) =>
        isConceptComplete(memory.conceptMemories[concept.id]),
      )
      .map((concept) => concept.id),
  );
  const stableConceptIds = new Set(
    curriculum.concepts
      .filter((concept) =>
        isPrerequisiteStable(memory.conceptMemories[concept.id]),
      )
      .map((concept) => concept.id),
  );
  const drafts: StepDraft[] = curriculum.concepts.map((concept, index) => {
    const conceptMemory = memory.conceptMemories[concept.id];
    const prerequisiteConceptIds = concept.prerequisiteConceptIds.filter(
      (prerequisiteId) => !stableConceptIds.has(prerequisiteId),
    );
    const status: LearningPlanStepStatus = completedConceptIds.has(concept.id)
      ? "completed"
      : prerequisiteConceptIds.length > 0
        ? "blocked_by_prerequisite"
        : conceptMemory
          ? "in_progress"
          : "available";

    return {
      conceptId: concept.id,
      estimatedMinutes: concept.estimatedMinutes,
      id: `${planId}-${concept.id}`,
      planId,
      prerequisiteConceptIds,
      priority:
        status === "completed" || status === "blocked_by_prerequisite"
          ? Number.NEGATIVE_INFINITY
          : getStepPriority(conceptMemory, index),
      rationale: getRationale({
        blockerCount: prerequisiteConceptIds.length,
        language,
        memory: conceptMemory,
        status,
      }),
      sequence: index + 1,
      status,
    };
  });
  const focusConceptIds = drafts
    .filter((step) => Number.isFinite(step.priority))
    .sort((left, right) => right.priority - left.priority)
    .slice(0, MAX_FOCUS_CONCEPTS)
    .map((step) => step.conceptId);
  const recommendedConceptId = focusConceptIds[0];
  const steps: LearningPlanStep[] = drafts.map((draft) => {
    const step: LearningPlanStep = {
      conceptId: draft.conceptId,
      estimatedMinutes: draft.estimatedMinutes,
      id: draft.id,
      planId: draft.planId,
      prerequisiteConceptIds: draft.prerequisiteConceptIds,
      rationale: draft.rationale,
      sequence: draft.sequence,
      status: draft.status,
    };

    return step.conceptId === recommendedConceptId
      ? { ...step, status: "recommended" }
      : step;
  });

  return {
    courseId: curriculum.course.id,
    focusConceptIds,
    generatedAt: now,
    id: planId,
    learnerId: "authenticated",
    status:
      steps.length > 0 && steps.every((step) => step.status === "completed")
        ? "completed"
        : "active",
    steps,
    title:
      language === "zh"
        ? `${curriculum.course.title} 自适应学习计划`
        : `${curriculum.course.title} adaptive learning plan`,
    unitId: curriculum.defaultUnitId,
  };
}

export function isLearningPlanConceptComplete(
  memory: ConceptMemory | undefined,
) {
  return isConceptComplete(memory);
}
