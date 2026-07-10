import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConceptById } from "@/features/knowledge/get-concepts";
import { getLessonByConceptId } from "@/features/lessons/get-lessons";
import { TeacherChatServiceError } from "@/features/ai-teacher/teacher-service";
import {
  encodeTeacherStreamEvent,
  TEACHER_STREAM_MEDIA_TYPE,
} from "@/features/ai-teacher/teacher-streaming";
import {
  getTeacherWorkflowEngine,
  runTeacherWorkflow,
} from "@/features/ai-teacher/workflow/run-teacher-workflow";
import {
  type TeacherChatErrorCode,
  teacherChatRequestSchema,
  teacherChatResponseSchema,
} from "@/features/ai-teacher/types";
import {
  type TeacherWorkflowRuntimeOptions,
} from "@/features/ai-teacher/workflow/types";
import {
  getLearnerMemorySnapshot,
  recordTeacherInteractionInDb,
} from "@/lib/learner-memory-db";
import {
  completeAiTeacherRun,
  failAiTeacherRun,
  reserveAiTeacherRun,
} from "@/lib/ai-run-db";

const errorStatus: Record<TeacherChatErrorCode, number> = {
  missing_api_key: 503,
  request_cancelled: 499,
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

  const learnerId = session.user.id;

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

  const resolvedConcept = concept;
  const resolvedLesson = lesson;

  const workflowEngine = getTeacherWorkflowEngine();
  const workflowHeaders = {
    "X-Teacher-Workflow-Engine": workflowEngine,
  };
  const requestStartedAt = Date.now();
  const reservation = reserveAiTeacherRun({
    conceptId: resolvedConcept.id,
    courseId: resolvedConcept.courseId,
    historyMessages: chatHistory.length,
    inputChars: userMessage.length + (selectedText?.length ?? 0),
    learnerId,
    locale,
    source,
    workflowEngine,
  });

  if (!reservation.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "rate_limit_exceeded",
          message:
            reservation.reason === "daily"
              ? "Daily AI Teacher usage limit reached. Please continue later."
              : "Too many AI Teacher requests in a short period. Please wait and try again.",
        },
      },
      {
        headers: {
          ...workflowHeaders,
          "Retry-After": String(reservation.retryAfterSeconds),
          "X-RateLimit-Remaining-Burst": String(reservation.remainingBurst),
          "X-RateLimit-Remaining-Daily": String(reservation.remainingDaily),
        },
        status: 429,
      },
    );
  }

  const rateLimitHeaders = {
    "X-RateLimit-Remaining-Burst": String(reservation.remainingBurst),
    "X-RateLimit-Remaining-Daily": String(reservation.remainingDaily),
  };
  const runId = reservation.runId;

  function failReservedRun(errorCode: string) {
    try {
      failAiTeacherRun({
        errorCode,
        requestDurationMs: Date.now() - requestStartedAt,
        runId,
      });
    } catch (observabilityError) {
      console.warn("Unable to fail AI Teacher observability record.", {
        runId,
        error:
          observabilityError instanceof Error
            ? observabilityError.message
            : "Unknown observability error",
      });
    }
  }

  async function executeTeacherRequest(
    runtimeOptions: TeacherWorkflowRuntimeOptions = {},
    onFinalizing?: () => void,
  ) {
    const learnerMemorySnapshot = getLearnerMemorySnapshot(
      learnerId,
      resolvedConcept.courseId,
      resolvedConcept.id,
    );
    const teacherWorkflowResult = await runTeacherWorkflow(
      {
        concept: resolvedConcept,
        lesson: resolvedLesson,
        locale,
        currentSection,
        userMessage,
        selectedText,
        selectionAction,
        chatHistory,
        learnerMemorySnapshot,
      },
      runtimeOptions,
    );
    const teacherResponse = teacherChatResponseSchema.parse(
      teacherWorkflowResult.teacherResponse,
    );

    onFinalizing?.();

    const responseWithCitations = {
      ...teacherResponse,
      citations: teacherWorkflowResult.citations,
    };
    const conceptMemory = recordTeacherInteractionInDb({
      conceptId: resolvedConcept.id,
      conceptTitle: resolvedConcept.title,
      courseId: resolvedConcept.courseId,
      learnerId,
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
          modelTelemetry: teacherWorkflowResult.modelTelemetry,
          workflowEngine,
          workflowTrace: teacherWorkflowResult.trace,
        }
      : responseWithCitations;
    const requestDurationMs = Date.now() - requestStartedAt;

    try {
      completeAiTeacherRun({
        requestDurationMs,
        result: teacherWorkflowResult,
        runId,
      });
    } catch (observabilityError) {
      console.warn("Unable to complete AI Teacher observability record.", {
        runId,
        error:
          observabilityError instanceof Error
            ? observabilityError.message
            : "Unknown observability error",
      });
    }

    return { requestDurationMs, responseBody, teacherWorkflowResult };
  }

  const wantsStream = request.headers
    .get("Accept")
    ?.split(",")
    .some((value) => value.trim().startsWith(TEACHER_STREAM_MEDIA_TYPE));

  if (wantsStream) {
    const encoder = new TextEncoder();
    const streamAbortController = new AbortController();
    let generatingStatusSent = false;
    let streamClosed = false;
    const handleRequestAbort = () =>
      streamAbortController.abort(request.signal.reason);

    request.signal.addEventListener("abort", handleRequestAbort, {
      once: true,
    });

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const enqueue = (event: Parameters<typeof encodeTeacherStreamEvent>[0]) => {
          if (!streamAbortController.signal.aborted && !streamClosed) {
            controller.enqueue(encoder.encode(encodeTeacherStreamEvent(event)));
          }
        };
        const close = () => {
          if (!streamClosed) {
            streamClosed = true;
            request.signal.removeEventListener("abort", handleRequestAbort);
            controller.close();
          }
        };

        enqueue({ type: "status", stage: "preparing_context" });

        void (async () => {
          try {
            const result = await executeTeacherRequest(
              {
                signal: streamAbortController.signal,
                onAssistantMessageDelta(delta) {
                  if (!generatingStatusSent) {
                    generatingStatusSent = true;
                    enqueue({
                      type: "status",
                      stage: "generating_response",
                    });
                  }

                  enqueue({ type: "assistant_delta", delta });
                },
              },
              () =>
                enqueue({
                  type: "status",
                  stage: "finalizing_learning_state",
                }),
            );

            enqueue({
              type: "complete",
              data: result.responseBody,
            });
          } catch (error) {
            const errorCode =
              error instanceof TeacherChatServiceError
                ? error.code
                : "api_error";

            failReservedRun(errorCode);

            if (!streamAbortController.signal.aborted) {
              enqueue({
                type: "error",
                error: {
                  code: errorCode,
                  message:
                    error instanceof TeacherChatServiceError
                      ? error.message
                      : "Unexpected AI Teacher server error.",
                },
              });
            }
          } finally {
            close();
          }
        })();
      },
      cancel(reason) {
        streamClosed = true;
        request.signal.removeEventListener("abort", handleRequestAbort);
        streamAbortController.abort(reason);
      },
    });

    return new Response(stream, {
      headers: {
        ...workflowHeaders,
        ...rateLimitHeaders,
        "Cache-Control": "private, no-store",
        "Content-Type": `${TEACHER_STREAM_MEDIA_TYPE}; charset=utf-8`,
        "X-Accel-Buffering": "no",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  try {
    const result = await executeTeacherRequest();

    return NextResponse.json(result.responseBody, {
      headers: {
        ...workflowHeaders,
        ...rateLimitHeaders,
        "Server-Timing": `model;dur=${result.teacherWorkflowResult.modelTelemetry.durationMs}, total;dur=${result.requestDurationMs}`,
      },
    });
  } catch (error) {
    const errorCode =
      error instanceof TeacherChatServiceError ? error.code : "api_error";

    failReservedRun(errorCode);

    if (error instanceof TeacherChatServiceError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        {
          headers: { ...workflowHeaders, ...rateLimitHeaders },
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
        headers: { ...workflowHeaders, ...rateLimitHeaders },
        status: 500,
      },
    );
  }
}
