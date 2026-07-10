import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DEFAULT_COURSE_ID } from "@/curricula";
import type { CourseId } from "@/features/knowledge/types";
import {
  getLearnerMemory,
  resetLearnerMemory,
} from "@/lib/learner-memory-db";

function getCourseId(request: Request) {
  const url = new URL(request.url);

  return (url.searchParams.get("courseId") ?? DEFAULT_COURSE_ID) as CourseId;
}

function unauthorized() {
  return NextResponse.json(
    {
      error: {
        code: "unauthorized",
        message: "Please log in to use learner memory.",
      },
    },
    { status: 401 },
  );
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  return NextResponse.json({
    memory: getLearnerMemory(session.user.id, getCourseId(request)),
  });
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  return NextResponse.json({
    memory: resetLearnerMemory(session.user.id, getCourseId(request)),
  });
}
