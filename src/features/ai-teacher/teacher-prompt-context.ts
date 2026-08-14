import type {
  LessonContent,
  LessonSectionType,
} from "@/features/lessons/types";

const sectionAliases: Record<LessonSectionType, string[]> = {
  common_trap: ["common trap", "misconception", "常见误区", "误区"],
  formal_idea: ["formal idea", "formal", "正式说法", "正式"],
  intuition: ["intuition", "直观理解", "直观"],
  key_takeaways: ["key takeaways", "takeaways", "关键收获", "总结"],
  reflection: ["reflection", "反思巩固", "反思"],
  think_with_me: ["think with me", "guiding question", "一起想一想", "引导"],
  try_applying_it: ["try applying it", "application", "尝试应用", "应用"],
  why_this_matters: ["why this matters", "hook", "为什么重要"],
  worked_example: ["worked example", "example", "例子拆解", "例子"],
};

function normalizeSectionLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferSectionType(
  lesson: LessonContent,
  currentSection: string,
): LessonSectionType | undefined {
  const normalizedSection = normalizeSectionLabel(currentSection);
  const canonicalSection = lesson.sections.find((section) =>
    [section.id, section.sectionId, section.title, section.type]
      .map(normalizeSectionLabel)
      .includes(normalizedSection),
  );

  if (canonicalSection) {
    return canonicalSection.type;
  }

  return Object.entries(sectionAliases).find(([, aliases]) =>
    aliases.some((alias) => normalizedSection.includes(alias)),
  )?.[0] as LessonSectionType | undefined;
}

function getLocalizedSectionContent(
  lesson: LessonContent,
  sectionType?: LessonSectionType,
) {
  switch (sectionType) {
    case "why_this_matters":
      return lesson.hook;
    case "intuition":
      return {
        explanation: lesson.intuition,
        prerequisiteConnections: lesson.prerequisiteConnections,
      };
    case "formal_idea":
      return lesson.formalExplanation;
    case "worked_example":
      return lesson.workedExamples.slice(0, 1);
    case "think_with_me":
      return lesson.guidedQuestions.slice(0, 2);
    case "common_trap":
      return lesson.misconceptionChecks.slice(0, 2);
    case "reflection":
      return lesson.reflectionPrompt;
    case "try_applying_it":
      return lesson.applicationPrompt;
    case "key_takeaways":
      return lesson.keyTakeaways;
    default:
      return lesson.intuition;
  }
}

export function buildCompactLessonContext({
  currentSection,
  lesson,
  locale,
}: {
  currentSection: string;
  lesson: LessonContent;
  locale: "en" | "zh";
}) {
  const sectionType = inferSectionType(lesson, currentSection);
  const canonicalSection = lesson.sections.find(
    (section) => section.type === sectionType,
  );
  const sectionContent =
    locale === "en" && canonicalSection?.body
      ? canonicalSection.body
      : getLocalizedSectionContent(lesson, sectionType);

  return {
    title: lesson.title,
    objective: {
      title: lesson.objective.title,
      description: lesson.objective.description,
      successCriteria: lesson.objective.successCriteria,
    },
    activeSection: {
      label: currentSection,
      sectionType,
      content: sectionContent,
    },
    keyTakeaways: lesson.keyTakeaways,
  };
}
