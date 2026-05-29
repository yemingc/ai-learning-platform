import { notFound } from "next/navigation";
import { LessonPageClient } from "@/components/learning/lesson-page-client";
import { getConceptById } from "@/features/knowledge/get-concepts";
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
  const lesson = getLessonByConceptId(conceptId);

  if (!concept || !lesson) {
    notFound();
  }

  return (
    <LessonPageClient
      concept={concept}
      lesson={lesson}
      nextLesson={getNextLesson(conceptId)}
      previousLesson={getPreviousLesson(conceptId)}
    />
  );
}
