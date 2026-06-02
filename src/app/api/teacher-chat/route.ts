import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConceptById } from "@/features/knowledge/get-concepts";
import { getLessonByConceptId } from "@/features/lessons/get-lessons";
import { TeacherChatServiceError } from "@/features/ai-teacher/teacher-service";
import {
  getTeacherWorkflowEngine,
  runTeacherWorkflow,
} from "@/features/ai-teacher/workflow/run-teacher-workflow";
import {
  type TeacherChatErrorCode,
  teacherChatRequestSchema,
  teacherChatResponseSchema,
} from "@/features/ai-teacher/types";
import { recordTeacherInteractionInDb } from "@/lib/learner-memory-db";

const errorStatus: Record<TeacherChatErrorCode, number> = {
  missing_api_key: 503,
  api_timeout: 504,
  api_error: 502,
  empty_response: 502,
  invalid_json: 502,
  schema_validation_failed: 422,
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "Please log in to chat with the AI Teacher.",
        },
      },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => undefined);
  const parsedRequest = teacherChatRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: "Invalid teacher chat request.",
      },
      { status: 400 },
    );
  }

  const {
    courseId,
    conceptId,
    locale,
    currentSection,
    userMessage,
    selectedText,
    selectionAction,
    source,
    chatHistory,
  } =
    parsedRequest.data;
  const concept = getConceptById(conceptId, courseId);
  const lesson = getLessonByConceptId(conceptId, courseId);

  if (!concept || !lesson) {
    return NextResponse.json(
      {
        error: "Lesson not found.",
      },
      { status: 404 },
    );
  }

  const workflowEngine = getTeacherWorkflowEngine();
  const workflowHeaders = {
    "X-Teacher-Workflow-Engine": workflowEngine,
  };

  try {
    const teacherWorkflowResult = await runTeacherWorkflow({
      concept,
      lesson,
      locale,
      currentSection,
      userMessage,
      selectedText,
      selectionAction,
      chatHistory,
    });
    const teacherResponse = teacherChatResponseSchema.parse(
      teacherWorkflowResult.teacherResponse,
    );
    const responseWithCitations = {
      ...teacherResponse,
      citations: teacherWorkflowResult.citations,
    };
    const conceptMemory = recordTeacherInteractionInDb({
      conceptId: concept.id,
      conceptTitle: concept.title,
      courseId: concept.courseId,
      learnerId: session.user.id,
      section: currentSection,
      userMessage,
      selectedText,
      source,
      teachingMove: teacherResponse.teachingMove,
      detectedMisconception: teacherResponse.detectedMisconception,
      memorySignals: teacherResponse.memorySignals,
      locale,
    });
    const shouldIncludeWorkflowTrace =
      process.env.NODE_ENV !== "production" ||
      process.env.NEXT_PUBLIC_SHOW_AI_TRACE === "true";
    const responseBody = shouldIncludeWorkflowTrace
      ? {
          ...responseWithCitations,
          memoryPatch: teacherWorkflowResult.memoryPatch,
          conceptMemory,
          nextStudyAction: teacherWorkflowResult.nextStudyAction,
          workflowEngine,
          workflowTrace: teacherWorkflowResult.trace,
        }
      : responseWithCitations;

    return NextResponse.json(responseBody, {
      headers: workflowHeaders,
    });
  } catch (error) {
    if (error instanceof TeacherChatServiceError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        {
          headers: workflowHeaders,
          status: errorStatus[error.code],
        },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "api_error",
          message: "Unexpected AI Teacher server error.",
        },
      },
      {
        headers: workflowHeaders,
        status: 500,
      },
    );
  }
}
