import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  HUMAN_EVALUATION_RUBRIC_VERSION,
  type HumanEvaluationRating,
} from "@/features/ai-teacher/evaluation/human-evaluation-calibration";
import { hasDeveloperModeAccess } from "@/lib/developer-mode";
import {
  getHumanEvaluationCalibrationDashboard,
  recordHumanEvaluationReview,
} from "@/lib/ai-run-db";

const ratingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

const humanEvaluationReviewSchema = z
  .object({
    evaluationRunId: z.uuid(),
    notes: z.string().trim().max(600).optional(),
    ratings: z
      .object({
        grounding: ratingSchema,
        localization: ratingSchema,
        pedagogy: ratingSchema,
        safety: ratingSchema,
      })
      .strict(),
    reviewedAllCases: z.literal(true),
    rubricVersion: z.literal(HUMAN_EVALUATION_RUBRIC_VERSION),
  })
  .strict();

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "Please log in to submit a human evaluation review.",
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
          message: "Developer mode is required to review AI evaluations.",
        },
      },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => undefined);
  const parsedBody = humanEvaluationReviewSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_review",
          message:
            "Review requires all four 1–5 rubric ratings, case-coverage confirmation, and a valid evaluation run id.",
        },
      },
      { status: 400 },
    );
  }

  const result = recordHumanEvaluationReview({
    evaluationRunId: parsedBody.data.evaluationRunId,
    notes: parsedBody.data.notes,
    ratings: parsedBody.data.ratings as Record<
      "pedagogy" | "grounding" | "safety" | "localization",
      HumanEvaluationRating
    >,
    reviewerId: session.user.id,
    rubricVersion: parsedBody.data.rubricVersion,
  });

  if (!result.ok) {
    const notFound = result.reason === "evaluation_not_found";

    return NextResponse.json(
      {
        error: {
          code: result.reason,
          message: notFound
            ? "The evaluation run does not exist."
            : "This legacy evaluation has no dimension scores to calibrate.",
        },
      },
      { status: notFound ? 404 : 409 },
    );
  }

  return NextResponse.json(
    {
      calibration: getHumanEvaluationCalibrationDashboard(
        100,
        result.suiteVersion ?? undefined,
      ),
      review: result,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
