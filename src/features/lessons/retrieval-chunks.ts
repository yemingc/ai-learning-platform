import type {
  LessonContent,
  LessonSection,
  LessonSectionType,
} from "@/features/lessons/types";
import { getLocalizedLessonContent } from "@/features/lessons/lesson-localization";

export type LessonRetrievalLocale = "en" | "zh";

export type LessonRetrievalChunk = {
  id: string;
  locale: LessonRetrievalLocale;
  courseId: string;
  unitId: string;
  conceptId: string;
  lessonId: string;
  sectionId: string;
  sectionType: LessonSectionType;
  title: string;
  text: string;
  retrievalTags: string[];
  sourceLabel: string;
};

type RetrievalChunkOptions = {
  locale?: LessonRetrievalLocale;
};

type LocalizedSectionDraft = Pick<
  LessonSection,
  "sectionId" | "type" | "title" | "body" | "retrievalTags"
>;

function normalizeTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

function createChunkId(
  lesson: LessonContent,
  section: Pick<LessonSection, "sectionId">,
  locale: LessonRetrievalLocale,
) {
  return `${lesson.courseId}/${lesson.unitId}/${lesson.conceptId}/${locale}/${section.sectionId}`;
}

function getCanonicalSection(
  lesson: LessonContent,
  sectionType: LessonSectionType,
) {
  return lesson.sections.find((section) => section.type === sectionType);
}

function createLocalizedSectionDraft({
  body,
  lesson,
  sectionType,
  title,
}: {
  body: string;
  lesson: LessonContent;
  sectionType: LessonSectionType;
  title: string;
}): LocalizedSectionDraft {
  const canonicalSection = getCanonicalSection(lesson, sectionType);

  return {
    body,
    retrievalTags: canonicalSection?.retrievalTags ?? [],
    sectionId: canonicalSection?.sectionId ?? sectionType,
    title,
    type: sectionType,
  };
}

function formatList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function formatLocalizedWorkedExamples(lesson: LessonContent) {
  return lesson.workedExamples
    .map(
      (example) =>
        `${example.title}\n${example.setup}\n${formatList(example.walkthrough)}\n${example.takeaway}`,
    )
    .join("\n\n");
}

function formatLocalizedGuidedQuestions(lesson: LessonContent) {
  return lesson.guidedQuestions
    .map(
      (question) =>
        `${question.prompt}\n提示：${question.hint}\n你需要抓住的点：${question.targetInsight}`,
    )
    .join("\n\n");
}

function formatLocalizedMisconceptionChecks(lesson: LessonContent) {
  return lesson.misconceptionChecks
    .map(
      (check) =>
        `${check.misconception}\n${check.checkPrompt}\n${check.correction}`,
    )
    .join("\n\n");
}

function formatLocalizedPrerequisites(lesson: LessonContent) {
  if (!lesson.prerequisiteConnections.length) {
    return lesson.intuition;
  }

  return [
    lesson.intuition,
    ...lesson.prerequisiteConnections.map(
      (connection) => `${connection.title}: ${connection.connection}`,
    ),
  ].join("\n\n");
}

function createLocalizedLessonSections(lesson: LessonContent) {
  return [
    createLocalizedSectionDraft({
      body: lesson.hook,
      lesson,
      sectionType: "why_this_matters",
      title: "为什么重要",
    }),
    createLocalizedSectionDraft({
      body: formatLocalizedPrerequisites(lesson),
      lesson,
      sectionType: "intuition",
      title: "直观理解",
    }),
    createLocalizedSectionDraft({
      body: lesson.formalExplanation,
      lesson,
      sectionType: "formal_idea",
      title: "正式说法",
    }),
    createLocalizedSectionDraft({
      body: formatLocalizedWorkedExamples(lesson),
      lesson,
      sectionType: "worked_example",
      title: "例子拆解",
    }),
    createLocalizedSectionDraft({
      body: formatLocalizedGuidedQuestions(lesson),
      lesson,
      sectionType: "think_with_me",
      title: "一起想一想",
    }),
    createLocalizedSectionDraft({
      body: formatLocalizedMisconceptionChecks(lesson),
      lesson,
      sectionType: "common_trap",
      title: "常见误区",
    }),
    createLocalizedSectionDraft({
      body: `${lesson.reflectionPrompt.prompt}\n${lesson.reflectionPrompt.sentenceStarter}`,
      lesson,
      sectionType: "reflection",
      title: "反思巩固",
    }),
    createLocalizedSectionDraft({
      body: `${lesson.applicationPrompt.title}\n${lesson.applicationPrompt.prompt}\n${lesson.applicationPrompt.whyItTransfers}`,
      lesson,
      sectionType: "try_applying_it",
      title: "尝试应用",
    }),
    createLocalizedSectionDraft({
      body: formatList(lesson.keyTakeaways),
      lesson,
      sectionType: "key_takeaways",
      title: "关键收获",
    }),
  ];
}

function createEnglishChunks(lesson: LessonContent, locale: LessonRetrievalLocale) {
  return lesson.sections.map((section) => ({
    id: createChunkId(lesson, section, locale),
    locale,
    courseId: lesson.courseId,
    unitId: lesson.unitId,
    conceptId: lesson.conceptId,
    lessonId: lesson.lessonId,
    sectionId: section.sectionId,
    sectionType: section.type,
    title: section.title,
    text: section.body,
    retrievalTags: normalizeTags([
      ...lesson.retrievalTags,
      ...section.retrievalTags,
    ]),
    sourceLabel: `${lesson.courseId} > ${lesson.unitId} > ${lesson.title} > ${section.title}`,
  }));
}

function createLocalizedChunks(lesson: LessonContent, locale: LessonRetrievalLocale) {
  const localizedLesson = getLocalizedLessonContent(lesson, locale);

  return createLocalizedLessonSections(localizedLesson).map((section) => ({
    id: createChunkId(lesson, section, locale),
    locale,
    courseId: lesson.courseId,
    unitId: lesson.unitId,
    conceptId: lesson.conceptId,
    lessonId: lesson.lessonId,
    sectionId: section.sectionId,
    sectionType: section.type,
    title: section.title,
    text: section.body,
    retrievalTags: normalizeTags([
      ...lesson.retrievalTags,
      localizedLesson.title,
      ...section.retrievalTags,
    ]),
    sourceLabel: `${lesson.courseId} > ${lesson.unitId} > ${localizedLesson.title} > ${section.title}`,
  }));
}

export function flattenLessonsToRetrievalChunks(
  lessons: LessonContent[],
  options: RetrievalChunkOptions = {},
): LessonRetrievalChunk[] {
  const locale = options.locale ?? "en";

  return lessons.flatMap((lesson) =>
    locale === "zh"
      ? createLocalizedChunks(lesson, locale)
      : createEnglishChunks(lesson, locale),
  );
}

export function validateRetrievalReadyLessons(lessons: LessonContent[]) {
  const chunkIds = new Set<string>();
  const sectionIds = new Set<string>();
  const chunks = flattenLessonsToRetrievalChunks(lessons, { locale: "en" });

  for (const lesson of lessons) {
    for (const section of lesson.sections) {
      const expectedStableId = `${lesson.courseId}/${lesson.unitId}/${lesson.conceptId}/${section.sectionId}`;

      if (section.id !== expectedStableId) {
        throw new Error(
          `Lesson section ${lesson.lessonId}/${section.sectionId} has unstable id ${section.id}; expected ${expectedStableId}.`,
        );
      }

      if (!section.body.trim()) {
        throw new Error(
          `Lesson section ${section.id} must have non-empty body text.`,
        );
      }

      if (sectionIds.has(section.id)) {
        throw new Error(`Duplicate lesson section id: ${section.id}.`);
      }

      sectionIds.add(section.id);
    }
  }

  if (!chunks.length) {
    throw new Error("No retrieval chunks were generated from lessons.");
  }

  for (const chunk of chunks) {
    if (!chunk.text.trim()) {
      throw new Error(`Retrieval chunk ${chunk.id} must have non-empty text.`);
    }

    if (chunkIds.has(chunk.id)) {
      throw new Error(`Duplicate retrieval chunk id: ${chunk.id}.`);
    }

    chunkIds.add(chunk.id);
  }

  return chunks;
}
