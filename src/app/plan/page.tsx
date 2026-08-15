import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdaptivePlanPageClient } from "@/components/planner/adaptive-plan-page-client";
import { getCurriculumPack, getDefaultCurriculumPack } from "@/curricula";
import { getLearnerMemory } from "@/lib/learner-memory-db";
import { getActiveLearningPlan } from "@/lib/learning-plan-agent-db";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const session = await auth();
  const { courseId } = await searchParams;

  if (!session?.user?.id) {
    const callbackUrl = courseId
      ? `/plan?courseId=${encodeURIComponent(courseId)}`
      : "/plan";
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const curriculum =
    (courseId ? getCurriculumPack(courseId) : undefined) ??
    getDefaultCurriculumPack();
  const memory = getLearnerMemory(session.user.id, curriculum.course.id);
  const activePlan = getActiveLearningPlan(
    session.user.id,
    curriculum.course.id,
  );

  return (
    <AdaptivePlanPageClient
      activePlan={activePlan?.plan}
      curriculum={curriculum}
      memory={{
        conceptMemories: memory.conceptMemories,
        updatedAt: memory.updatedAt,
      }}
    />
  );
}
