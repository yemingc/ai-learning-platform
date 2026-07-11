import { notFound } from "next/navigation";
import { LessonPageClient } from "@/components/learning/lesson-page-client";
import { getCurriculumPack, getCurriculumPacks } from "@/curricula";
import {
  getLessonByConceptId,
  getNextLesson,
  getPreviousLesson,
} from "@/features/lessons/get-lessons";

export function generateStaticParams() {
  return getCurriculumPacks().flatMap((curriculum) =>
    curriculum.lessons.map((lesson) => ({
      courseId: curriculum.course.id,
      unitId: lesson.unitId,
      conceptId: lesson.conceptId,
    })),
  );
}

type LessonRouteProps = {
  params: Promise<{
    courseId: string;
    unitId: string;
    conceptId: string;
  }>;
};

export default async function LessonRoute({ params }: LessonRouteProps) {
  const { courseId, unitId, conceptId } = await params;
  const curriculum = getCurriculumPack(courseId);
  const concept = curriculum?.concepts.find(
    (candidate) => candidate.id === conceptId && candidate.unitId === unitId,
  );
  const lesson = curriculum
    ? getLessonByConceptId(conceptId, curriculum.course.id)
    : undefined;

  if (!curriculum || !concept || !lesson || lesson.unitId !== unitId) {
    notFound();
  }

  return (
    <LessonPageClient
      concept={concept}
      curriculum={curriculum}
      lesson={lesson}
      nextLesson={getNextLesson(conceptId, curriculum.course.id)}
      previousLesson={getPreviousLesson(conceptId, curriculum.course.id)}
    />
  );
}
