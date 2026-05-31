import {
  DEFAULT_COURSE_ID,
  getCurriculumPack,
  getCurriculumPacks,
} from "@/curricula";
import type { LessonContent } from "@/features/lessons/types";
import type { ConceptId, CourseId } from "@/features/knowledge/types";

function getLessonsForCourse(courseId: CourseId = DEFAULT_COURSE_ID) {
  return getCurriculumPack(courseId)?.lessons ?? [];
}

export function getAllLessons(
  courseId: CourseId = DEFAULT_COURSE_ID,
): LessonContent[] {
  return getLessonsForCourse(courseId);
}

export function getAllLessonsAcrossCurricula(): LessonContent[] {
  return getCurriculumPacks().flatMap((curriculum) => curriculum.lessons);
}

export function getLessonByConceptId(
  conceptId: ConceptId,
  courseId: CourseId = DEFAULT_COURSE_ID,
): LessonContent | undefined {
  return getLessonsForCourse(courseId).find(
    (lesson) => lesson.conceptId === conceptId,
  );
}

export function getNextLesson(
  conceptId: ConceptId,
  courseId: CourseId = DEFAULT_COURSE_ID,
): LessonContent | undefined {
  const lessons = getLessonsForCourse(courseId);
  const currentIndex = lessons.findIndex(
    (lesson) => lesson.conceptId === conceptId,
  );

  if (currentIndex === -1) {
    return undefined;
  }

  return lessons[currentIndex + 1];
}

export function getPreviousLesson(
  conceptId: ConceptId,
  courseId: CourseId = DEFAULT_COURSE_ID,
): LessonContent | undefined {
  const lessons = getLessonsForCourse(courseId);
  const currentIndex = lessons.findIndex(
    (lesson) => lesson.conceptId === conceptId,
  );

  if (currentIndex <= 0) {
    return undefined;
  }

  return lessons[currentIndex - 1];
}
