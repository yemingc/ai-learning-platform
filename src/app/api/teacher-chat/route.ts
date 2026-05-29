import { NextResponse } from "next/server";
import { getConceptById } from "@/features/knowledge/get-concepts";
import { getLessonByConceptId } from "@/features/lessons/get-lessons";
import { TeacherChatServiceError } from "@/features/ai-teacher/teacher-service";
import { runTeacherWorkflow } from "@/features/ai-teacher/workflow/run-teacher-workflow";
import {
  type TeacherChatErrorCode,
  teacherChatRequestSchema,
  teacherChatResponseSchema,
} from "@/features/ai-teacher/types";

const errorStatus: Record<TeacherChatErrorCode, number> = {
  missing_api_key: 503,
  api_timeout: 504,
  api_error: 502,
  empty_response: 502,
  invalid_json: 502,
  schema_validation_failed: 422,
};

export async function POST(request: Request) {
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
    conceptId,
    locale,
    currentSection,
    userMessage,
    selectedText,
    selectionAction,
    chatHistory,
  } =
    parsedRequest.data;
  const concept = getConceptById(conceptId);
  const lesson = getLessonByConceptId(conceptId);

  if (!concept || !lesson) {
    return NextResponse.json(
      {
        error: "Lesson not found.",
      },
      { status: 404 },
    );
  }

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

    return NextResponse.json(
      teacherChatResponseSchema.parse(teacherWorkflowResult.teacherResponse),
    );
  } catch (error) {
    if (error instanceof TeacherChatServiceError) {
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

    return NextResponse.json(
      {
        error: {
          code: "api_error",
          message: "Unexpected AI Teacher server error.",
        },
      },
      { status: 500 },
    );
  }
}
