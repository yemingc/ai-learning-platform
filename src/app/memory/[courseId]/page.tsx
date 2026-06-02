import { redirect } from "next/navigation";

type LegacyCourseMemoryRouteProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function LegacyCourseMemoryRoute({
  params,
}: LegacyCourseMemoryRouteProps) {
  const { courseId } = await params;

  redirect(`/dashboard/${courseId}`);
}
