import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { MemoryPageClient } from "@/components/memory/memory-page-client";
import { getCurriculumPack, getCurriculumPacks } from "@/curricula";

export function generateStaticParams() {
  return getCurriculumPacks().flatMap((curriculum) =>
    curriculum.units.map((unit) => ({
      courseId: curriculum.course.id,
      unitId: unit.id,
    })),
  );
}

type UnitDashboardRouteProps = {
  params: Promise<{
    courseId: string;
    unitId: string;
  }>;
};

export default async function UnitDashboardRoute({
  params,
}: UnitDashboardRouteProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const { courseId, unitId } = await params;
  const curriculum = getCurriculumPack(courseId);
  const unit = curriculum?.units.find((candidate) => candidate.id === unitId);

  if (!curriculum || !unit) {
    notFound();
  }

  return (
    <MemoryPageClient
      concepts={curriculum.concepts.filter(
        (concept) => concept.unitId === unit.id,
      )}
      course={curriculum.course}
      key={`${curriculum.course.id}-${unit.id}`}
      unit={unit}
    />
  );
}
