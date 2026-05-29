import { apCalculusABUnit1Lessons } from "@/features/lessons/ap-calculus-ab-unit-1-lessons";
import type { LessonContent } from "@/features/lessons/types";
import type { ConceptId } from "@/features/knowledge/types";

export function getAllLessons(): LessonContent[] {
  return apCalculusABUnit1Lessons;
}

export function getLessonByConceptId(
  conceptId: ConceptId,
): LessonContent | undefined {
  return apCalculusABUnit1Lessons.find(
    (lesson) => lesson.conceptId === conceptId,
  );
}

export function getNextLesson(conceptId: ConceptId): LessonContent | undefined {
  const currentIndex = apCalculusABUnit1Lessons.findIndex(
    (lesson) => lesson.conceptId === conceptId,
  );

  if (currentIndex === -1) {
    return undefined;
  }

  return apCalculusABUnit1Lessons[currentIndex + 1];
}

export function getPreviousLesson(
  conceptId: ConceptId,
): LessonContent | undefined {
  const currentIndex = apCalculusABUnit1Lessons.findIndex(
    (lesson) => lesson.conceptId === conceptId,
  );

  if (currentIndex <= 0) {
    return undefined;
  }

  return apCalculusABUnit1Lessons[currentIndex - 1];
}
