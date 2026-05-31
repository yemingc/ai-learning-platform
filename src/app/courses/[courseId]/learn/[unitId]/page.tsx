import { notFound } from "next/navigation";
import { CourseUnitLearnPage } from "@/components/learning/course-unit-learn-page";
import { getCurriculumPack, getCurriculumPacks } from "@/curricula";

export function generateStaticParams() {
  return getCurriculumPacks().flatMap((curriculum) =>
    curriculum.units.map((unit) => ({
      courseId: curriculum.course.id,
      unitId: unit.id,
    })),
  );
}

type CourseUnitLearnRouteProps = {
  params: Promise<{
    courseId: string;
    unitId: string;
  }>;
};

export default async function CourseUnitLearnRoute({
  params,
}: CourseUnitLearnRouteProps) {
  const { courseId, unitId } = await params;
  const curriculum = getCurriculumPack(courseId);
  const unit = curriculum?.units.find((candidate) => candidate.id === unitId);

  if (!curriculum || !unit) {
    notFound();
  }

  return <CourseUnitLearnPage curriculum={curriculum} unitId={unit.id} />;
}
