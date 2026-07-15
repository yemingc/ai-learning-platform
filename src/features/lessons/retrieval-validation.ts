import type { LessonContent } from "./types.ts";

export function validateRetrievalReadyLessons(lessons: LessonContent[]) {
  const chunkIds = new Set<string>();
  const sectionIds = new Set<string>();
  const chunks = lessons.flatMap((lesson) =>
    lesson.sections.map((section) => ({
      id: `${lesson.courseId}/${lesson.unitId}/${lesson.conceptId}/en/${section.sectionId}`,
      text: section.body,
    })),
  );

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
