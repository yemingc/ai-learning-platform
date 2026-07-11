import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdaptivePlanPageClient } from "@/components/planner/adaptive-plan-page-client";
import { getDefaultCurriculumPack } from "@/curricula";
import { getLearnerMemory } from "@/lib/learner-memory-db";

export default async function PlanPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/plan");
  }

  const curriculum = getDefaultCurriculumPack();
  const memory = getLearnerMemory(session.user.id, curriculum.course.id);

  return (
    <AdaptivePlanPageClient
      curriculum={curriculum}
      memory={{
        conceptMemories: memory.conceptMemories,
        updatedAt: memory.updatedAt,
      }}
    />
  );
}
