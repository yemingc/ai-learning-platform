import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MemoryCourseListPage } from "@/components/memory/memory-course-list-page";
import { getCurriculumPacks } from "@/curricula";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return <MemoryCourseListPage curricula={getCurriculumPacks()} />;
}
