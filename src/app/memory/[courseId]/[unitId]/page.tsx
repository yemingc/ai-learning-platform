import { redirect } from "next/navigation";

type LegacyUnitMemoryRouteProps = {
  params: Promise<{
    courseId: string;
    unitId: string;
  }>;
};

export default async function LegacyUnitMemoryRoute({
  params,
}: LegacyUnitMemoryRouteProps) {
  const { courseId, unitId } = await params;

  redirect(`/dashboard/${courseId}/${unitId}`);
}
