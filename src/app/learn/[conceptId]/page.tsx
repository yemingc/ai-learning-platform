import { notFound, redirect } from "next/navigation";
import { getDefaultCurriculumPack } from "@/curricula";
import { getLessonPath } from "@/curricula/routing";

export function generateStaticParams() {
  return getDefaultCurriculumPack().lessons.map((lesson) => ({
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
  const concept = getDefaultCurriculumPack().concepts.find(
    (candidate) => candidate.id === conceptId,
  );

  if (!concept) {
    notFound();
  }

  redirect(getLessonPath(concept));
}
