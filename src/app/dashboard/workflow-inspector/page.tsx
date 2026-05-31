import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WorkflowInspectorClient } from "@/components/dashboard/workflow-inspector-client";
import { hasDeveloperModeAccess } from "@/lib/developer-mode";

export default async function WorkflowInspectorPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/workflow-inspector");
  }

  if (!(await hasDeveloperModeAccess())) {
    redirect("/developer?callbackUrl=/dashboard/workflow-inspector");
  }

  return <WorkflowInspectorClient />;
}
