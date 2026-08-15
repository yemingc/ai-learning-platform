import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { LearningPlanActionError } from "@/features/planner/learning-plan-action-repository";
import { resolvePendingLearningPlanAction } from "@/lib/learning-plan-agent-db";

const requestSchema = z
  .object({
    confirmationToken: z.string().min(32).max(128),
    decision: z.enum(["confirm", "reject"]),
  })
  .strict();

const errorStatus = {
  not_found: 404,
  expired: 410,
  already_rejected: 409,
  invalid_payload: 500,
} as const;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "Please log in to confirm a learning-plan action.",
        },
      },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => undefined);
  const parsedRequest = requestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Invalid learning-plan confirmation request.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = resolvePendingLearningPlanAction({
      confirmationToken: parsedRequest.data.confirmationToken,
      decision: parsedRequest.data.decision,
      learnerId: session.user.id,
    });

    return NextResponse.json(
      { result },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    if (error instanceof LearningPlanActionError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: errorStatus[error.code] },
      );
    }

    console.warn("Unable to resolve learning-plan confirmation.", {
      learnerId: session.user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error: {
          code: "action_error",
          message: "Unable to resolve the learning-plan action.",
        },
      },
      { status: 500 },
    );
  }
}
