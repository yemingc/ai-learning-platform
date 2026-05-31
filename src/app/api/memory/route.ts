import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { DEFAULT_COURSE_ID } from "@/curricula";
import {
  teacherMemorySignalsSchema,
  teachingMoveSchema,
} from "@/features/ai-teacher/types";
import type { CourseId } from "@/features/knowledge/types";
import {
  getLearnerMemory,
  recordTeacherInteractionInDb,
  resetLearnerMemory,
} from "@/lib/learner-memory-db";

const interactionSourceSchema = z.enum([
  "direct_chat",
  "section_action",
  "text_selection",
  "memory_recommendation",
]);

const memoryInteractionSchema = z
  .object({
    courseId: z.string().min(1).default(DEFAULT_COURSE_ID),
    conceptId: z.string().min(1),
    conceptTitle: z.string().min(1),
    source: interactionSourceSchema.default("direct_chat"),
    section: z.string().min(1).max(120),
    userMessage: z.string().min(1).max(1200),
    selectedText: z.string().min(1).max(2400).optional(),
    teachingMove: teachingMoveSchema,
    detectedMisconception: z.string().min(1).optional(),
    memorySignals: teacherMemorySignalsSchema,
    locale: z.enum(["en", "zh"]),
  })
  .strict();

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

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = await request.json().catch(() => undefined);
  const parsedBody = memoryInteractionSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_memory_interaction",
          message: "Invalid learner memory interaction payload.",
        },
      },
      { status: 400 },
    );
  }

  const conceptMemory = recordTeacherInteractionInDb({
    ...parsedBody.data,
    learnerId: session.user.id,
    courseId: parsedBody.data.courseId as CourseId,
  });

  return NextResponse.json({
    conceptMemory,
    memory: getLearnerMemory(
      session.user.id,
      parsedBody.data.courseId as CourseId,
    ),
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
