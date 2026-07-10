import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runLiveTeacherEvaluationSuite } from "@/features/ai-teacher/evaluation/live-eval-runner";
import { hasDeveloperModeAccess } from "@/lib/developer-mode";
import { recordLiveTeacherEvaluation } from "@/lib/ai-run-db";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "Please log in to run AI Teacher evaluation.",
        },
      },
      { status: 401 },
    );
  }

  if (!(await hasDeveloperModeAccess())) {
    return NextResponse.json(
      {
        error: {
          code: "developer_mode_required",
          message: "Developer mode is required to run AI Teacher evaluation.",
        },
      },
      { status: 403 },
    );
  }

  const summary = await runLiveTeacherEvaluationSuite();

  try {
    recordLiveTeacherEvaluation(summary);
  } catch (observabilityError) {
    console.warn("Unable to persist live AI Teacher evaluation.", {
      error:
        observabilityError instanceof Error
          ? observabilityError.message
          : "Unknown observability error",
    });
  }

  return NextResponse.json(summary);
}
