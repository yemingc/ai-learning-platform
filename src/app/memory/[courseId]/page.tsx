import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseMemoryPageClient } from "@/components/memory/course-memory-page-client";
import { getCurriculumPack, getCurriculumPacks } from "@/curricula";

export function generateStaticParams() {
  return getCurriculumPacks().map((curriculum) => ({
    courseId: curriculum.course.id,
  }));
}

type CourseMemoryRouteProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseMemoryRoute({
  params,
}: CourseMemoryRouteProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/memory");
  }

  const { courseId } = await params;
  const curriculum = getCurriculumPack(courseId);

  if (!curriculum) {
    notFound();
  }

  return (
    <CourseMemoryPageClient
      curriculum={curriculum}
      key={curriculum.course.id}
    />
  );
}
