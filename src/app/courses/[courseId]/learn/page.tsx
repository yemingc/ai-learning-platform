import { notFound } from "next/navigation";
import { CourseLearnPage } from "@/components/learning/course-learn-page";
import { getCurriculumPack, getCurriculumPacks } from "@/curricula";

export function generateStaticParams() {
  return getCurriculumPacks().map((curriculum) => ({
    courseId: curriculum.course.id,
  }));
}

type CourseLearnRouteProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseLearnRoute({
  params,
}: CourseLearnRouteProps) {
  const { courseId } = await params;
  const curriculum = getCurriculumPack(courseId);

  if (!curriculum) {
    notFound();
  }

  return <CourseLearnPage curriculum={curriculum} />;
}
