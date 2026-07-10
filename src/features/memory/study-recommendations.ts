import type { Concept } from "@/features/knowledge/types";
import type { ConceptMemory } from "@/features/memory/types";
import { getFormativeAssessmentProgress } from "@/features/assessment/assessment-progress";

export type StudyAction =
  | "start_lesson"
  | "continue_learning"
  | "repair_misconception"
  | "review_prerequisite"
  | "review_confusing_section"
  | "ready_for_application"
  | "needs_reflection";

export type ApplicationGateStatus = "ready" | "not_ready" | "locked";

type RecommendationLanguage = "en" | "zh";

export type StudyRecommendation = {
  action: StudyAction;
  actionLabel: string;
  title: string;
  rationale: string;
  suggestedPrompt: string;
  targetSection: string;
  targetSectionId:
    | "why"
    | "intuition"
    | "formal"
    | "worked"
    | "guided"
    | "trap"
    | "reflection"
    | "application"
    | "takeaways";
  targetConceptId: string;
  applicationGate: {
    status: ApplicationGateStatus;
    label: string;
    reason: string;
  };
  ctaLabel: string;
};

const sectionLabels = {
  en: {
    prerequisite: "Prerequisite connection",
    why: "Why this matters",
    intuition: "Intuition",
    trap: "Common trap",
    application: "Try applying it",
    reflection: "Reflection",
  },
  zh: {
    prerequisite: "先修连接",
    why: "为什么重要",
    intuition: "直观理解",
    trap: "常见误区",
    application: "尝试应用",
    reflection: "反思巩固",
  },
};

function getApplicationGate(
  memory?: ConceptMemory,
  language: RecommendationLanguage = "en",
) {
  const isZh = language === "zh";

  if (!memory) {
    return {
      status: "locked" as const,
      label: isZh ? "应用练习未开放" : "Application locked",
      reason: isZh
        ? "先完成课程学习，再进入应用练习。"
        : "Start the lesson before moving into application practice.",
    };
  }

  if (memory.misconceptions.length > 0) {
    return {
      status: "not_ready" as const,
      label: isZh ? "还不适合应用" : "Not ready yet",
      reason: isZh
        ? "先修复当前误区信号，再进入应用练习。"
        : "Resolve active misconception signals before application.",
    };
  }

  const assessmentProgress = getFormativeAssessmentProgress(
    memory.assessmentAttempts,
  );

  if (assessmentProgress.exitTicketScore === undefined) {
    return {
      status: "not_ready" as const,
      label: isZh ? "等待离堂证据" : "Exit evidence needed",
      reason: isZh
        ? "完成离堂检查后，系统才会开放应用准备度判断。"
        : "Complete the exit ticket before the system certifies application readiness.",
    };
  }

  if (assessmentProgress.exitTicketScore < 50) {
    return {
      status: "not_ready" as const,
      label: isZh ? "先修复核心理解" : "Core idea needs repair",
      reason: isZh
        ? "离堂检查显示关键概念还没有稳定迁移。"
        : "Exit-ticket evidence shows that the key idea is not transferring yet.",
    };
  }

  if (memory.readiness >= 75) {
    return {
      status: "ready" as const,
      label: isZh ? "可以进入应用" : "Ready for application",
      reason: isZh
        ? "准备度较高，并且当前没有活跃误区。"
        : "Readiness is high and no active misconception is tracked.",
    };
  }

  return {
    status: "not_ready" as const,
    label: isZh ? "还不适合应用" : "Not ready yet",
    reason: isZh
      ? "还需要更多学习证据来稳定概念理解。"
      : "Build more learning evidence before application practice.",
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
        item &&
        (!item.memory ||
          item.memory.readiness < 55 ||
          item.memory.misconceptions.length > 0),
    );
}

export function getStudyRecommendation({
  concept,
  conceptMemory,
  conceptMemories,
  concepts,
  language = "en",
}: {
  concept: Concept;
  conceptMemory?: ConceptMemory;
  conceptMemories: Record<string, ConceptMemory>;
  concepts: Concept[];
  language?: RecommendationLanguage;
}): StudyRecommendation {
  const isZh = language === "zh";
  const sections = sectionLabels[language];
  const applicationGate = getApplicationGate(conceptMemory, language);
  const weakPrerequisite = findWeakPrerequisite(
    concept,
    conceptMemories,
    concepts,
  );

  if (weakPrerequisite) {
    return {
      action: "review_prerequisite",
      actionLabel: isZh ? "复习先修概念" : "Review prerequisite",
      title: isZh
        ? `先修概念需要补强：${weakPrerequisite.prerequisite.title}`
        : `Repair prerequisite: ${weakPrerequisite.prerequisite.title}`,
      rationale: isZh
        ? "这个概念依赖的先修理解还不稳定，先补强会更高效。"
        : "This concept depends on prerequisite understanding that is not ready yet.",
      suggestedPrompt: isZh
        ? `在继续学习「${concept.title}」之前，请帮我复习「${weakPrerequisite.prerequisite.title}」。`
        : `Help me review ${weakPrerequisite.prerequisite.title} before I continue with ${concept.title}.`,
      targetSection: sections.prerequisite,
      targetSectionId: "intuition",
      targetConceptId: weakPrerequisite.prerequisite.id,
      applicationGate,
      ctaLabel: isZh ? "打开先修课程" : "Open prerequisite lesson",
    };
  }

  if (!conceptMemory) {
    return {
      action: "start_lesson",
      actionLabel: isZh ? "开始课程" : "Start lesson",
      title: isZh ? "从结构化课程开始" : "Begin the structured lesson",
      rationale: isZh
        ? "这个概念还没有学习证据，先读课程并和 AI 教师互动一次。"
        : "There is no local learning evidence yet for this concept.",
      suggestedPrompt: isZh
        ? `请先用直观方式带我开始学习「${concept.title}」，不要一上来只讲符号。`
        : `Help me start ${concept.title} with intuition before formal notation.`,
      targetSection: sections.why,
      targetSectionId: "why",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: isZh ? "开始学习" : "Start lesson",
    };
  }

  const latestMemorySignal = conceptMemory.memorySignalHistory?.[0];
  const assessmentProgress = getFormativeAssessmentProgress(
    conceptMemory.assessmentAttempts,
  );
  if (
    latestMemorySignal?.suggestedStudyAction === "review_confusing_section" ||
    latestMemorySignal?.confusionLevel === "high"
  ) {
    return {
      action: "review_confusing_section",
      actionLabel: isZh ? "回看卡住的部分" : "Review section",
      title: isZh
        ? "先回应最近的困惑信号"
        : "Respond to the latest confusion signal",
      rationale: latestMemorySignal.evidenceNote,
      suggestedPrompt: isZh
        ? `请换一种方式解释「${concept.title}」，并检查我是否真的理解。`
        : `Can you explain the ${concept.title} idea another way and check my understanding?`,
      targetSection: sections.intuition,
      targetSectionId: "intuition",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: isZh ? "让 AI 教师带我回看" : "Review with AI Teacher",
    };
  }

  const topMisconception = conceptMemory.misconceptions[0];
  if (topMisconception) {
    return {
      action: "repair_misconception",
      actionLabel: isZh ? "修复误区" : "Repair misconception",
      title: isZh ? "先处理当前误区" : "Fix the active misconception first",
      rationale: isZh
        ? `学习记忆记录到这个误区 ${topMisconception.count} 次：${topMisconception.text}`
        : `Memory has tracked this misconception ${topMisconception.count} time(s): ${topMisconception.text}`,
      suggestedPrompt: isZh
        ? `请帮我纠正这个误区：${topMisconception.text}`
        : `Can you help me correct this misconception: ${topMisconception.text}`,
      targetSection: sections.trap,
      targetSectionId: "trap",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: isZh ? "回到课程中修复" : "Repair with lesson",
    };
  }

  const repeatedConfusion = conceptMemory.confusionSignals
    .slice()
    .sort((a, b) => b.count - a.count)[0];
  if (repeatedConfusion && repeatedConfusion.count >= 2) {
    return {
      action: "review_confusing_section",
      actionLabel: isZh ? "回看卡住的部分" : "Review section",
      title: isZh
        ? "回到反复被问到的部分"
        : "Revisit the section that keeps coming up",
      rationale: isZh
        ? `你已经围绕「${repeatedConfusion.section}」提问 ${repeatedConfusion.count} 次。`
        : `You asked about ${repeatedConfusion.section} ${repeatedConfusion.count} time(s).`,
      suggestedPrompt: isZh
        ? `请把「${repeatedConfusion.section}」这一部分换一种方式讲给我听。`
        : `Can you explain the ${repeatedConfusion.section} section another way?`,
      targetSection: repeatedConfusion.section,
      targetSectionId: "intuition",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: isZh ? "回看这一部分" : "Review section",
    };
  }

  if (assessmentProgress.exitTicketScore === undefined) {
    return {
      action: "needs_reflection",
      actionLabel: isZh ? "完成离堂检查" : "Complete exit ticket",
      title: isZh ? "用一份新证据结束本节课" : "Close the lesson with fresh evidence",
      rationale: isZh
        ? "课前诊断和 AI 对话可以帮助个性化，但只有离堂检查才能验证关键理解是否已经迁移。"
        : "Diagnostics and AI conversations personalize support, but the exit ticket verifies whether the key idea now transfers.",
      suggestedPrompt: isZh
        ? `在我完成「${concept.title}」的离堂检查前，请用一个问题帮我总结关键理解。`
        : `Before I complete the ${concept.title} exit ticket, ask one question that helps me summarize the key idea.`,
      targetSection: sections.reflection,
      targetSectionId: "takeaways",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: isZh ? "打开课程并完成检查" : "Open lesson and complete check",
    };
  }

  if (assessmentProgress.exitTicketScore < 50) {
    return {
      action: "continue_learning",
      actionLabel: isZh ? "根据离堂证据重学" : "Repair from exit evidence",
      title: isZh ? "关键理解还没有稳定迁移" : "The key idea is not transferring yet",
      rationale: isZh
        ? `最近一次离堂检查为 ${assessmentProgress.exitTicketScore}%，先换一种表示方式重学，再重新检查。`
        : `The latest exit ticket is ${assessmentProgress.exitTicketScore}%. Relearn with a different representation before trying again.`,
      suggestedPrompt: isZh
        ? `我的「${concept.title}」离堂检查没有通过。请换一种表示方式讲解，并用一个引导问题检查我。`
        : `My ${concept.title} exit ticket was weak. Teach it with a different representation and check me with one guiding question.`,
      targetSection: sections.intuition,
      targetSectionId: "intuition",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: isZh ? "重新学习" : "Relearn concept",
    };
  }

  if (conceptMemory.readiness >= 75) {
    return {
      action: "ready_for_application",
      actionLabel: isZh ? "进入应用" : "Ready for application",
      title: isZh ? "可以尝试应用练习" : "Move into application practice",
      rationale: isZh
        ? "准备度较高，并且当前没有活跃误区，可以进入应用场景。"
        : "Readiness is strong and no active misconception is currently tracked.",
      suggestedPrompt: isZh
        ? `请给我一个关于「${concept.title}」的应用任务，但重点仍然放在理解，而不是只算答案。`
        : `Give me an application prompt for ${concept.title} that still focuses on learning, not just the answer.`,
      targetSection: sections.application,
      targetSectionId: "application",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: isZh ? "打开应用部分" : "Open application section",
    };
  }

  if (conceptMemory.readiness >= 55) {
    const latestSignal = conceptMemory.memorySignalHistory?.[0];

    return {
      action: "needs_reflection",
      actionLabel: isZh ? "补一次反思" : "Add reflection",
      title: isZh ? "把理解说清楚" : "Make the learning explicit",
      rationale:
        latestSignal?.evidenceNote ??
        (isZh
          ? "你已经有一些学习证据，但用自己的话反思一次会让概念更稳。"
          : "You have some learning evidence, but reflection can make the concept more durable."),
      suggestedPrompt: isZh
        ? `请问我一个反思问题，检查我是否理解「${concept.title}」。`
        : `Ask me a reflection question that checks whether I understand ${concept.title}.`,
      targetSection: sections.reflection,
      targetSectionId: "reflection",
      targetConceptId: concept.id,
      applicationGate,
      ctaLabel: isZh ? "去课程里反思" : "Reflect in lesson",
    };
  }

  return {
    action: "continue_learning",
    actionLabel: isZh ? "继续学习" : "Continue learning",
    title: isZh ? "继续积累概念证据" : "Keep building concept evidence",
    rationale: isZh
      ? "当前准备度还在形成中，最适合继续看一个解释、例子或引导问题。"
      : "Readiness is still developing, so the best next action is another guided explanation or example.",
    suggestedPrompt: isZh
      ? `请用一个新例子解释「${concept.title}」，然后问我一个引导问题。`
      : `Explain ${concept.title} with a fresh example and one guiding question.`,
    targetSection: sections.intuition,
    targetSectionId: "intuition",
    targetConceptId: concept.id,
    applicationGate,
    ctaLabel: isZh ? "继续学习" : "Continue lesson",
  };
}
