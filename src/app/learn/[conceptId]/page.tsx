import { notFound } from "next/navigation";
import { LessonPageClient } from "@/components/learning/lesson-page-client";
import { getConceptById, getCourseById } from "@/features/knowledge/get-concepts";
import {
  getAllLessons,
  getLessonByConceptId,
  getNextLesson,
  getPreviousLesson,
} from "@/features/lessons/get-lessons";

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({
    conceptId: lesson.conceptId,
  }));
}

type ConceptLearningPageProps = {
  params: Promise<{
    conceptId: string;
  }>;
};

export default async function ConceptLearningPage({
  params,
}: ConceptLearningPageProps) {
  const { conceptId } = await params;
  const concept = getConceptById(conceptId);
  const lesson = getLessonByConceptId(conceptId, concept?.courseId);
  const course = concept ? getCourseById(concept.courseId) : undefined;

  if (!concept || !lesson || !course) {
    notFound();
  }

  return (
    <LessonPageClient
      concept={concept}
      course={course}
      lesson={lesson}
      nextLesson={getNextLesson(conceptId, course.id)}
      previousLesson={getPreviousLesson(conceptId, course.id)}
    />
  );
}
