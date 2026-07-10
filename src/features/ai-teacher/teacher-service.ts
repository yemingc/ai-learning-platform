import "server-only";

import { ZodError } from "zod";
import {
  DEEPSEEK_MODEL,
  DEEPSEEK_TIMEOUT_MS,
  getDeepSeekClient,
} from "@/lib/deepseek";
import type { Concept } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";
import type {
  LearnerMemorySnapshot,
  TeacherIntent,
  TeacherModelTelemetry,
} from "@/features/ai-teacher/workflow/types";
import type { AssembledCurriculumContext } from "@/features/rag/curriculum-context";
import {
  buildTeacherSystemPrompt,
  buildTeacherUserPrompt,
  TEACHER_PROMPT_VERSION,
} from "@/features/ai-teacher/teacher-prompts";
import { extractJsonStringProgress } from "@/features/ai-teacher/teacher-streaming";
import {
  teacherChatResponseSchema,
  type TeacherChatErrorCode,
  type TeacherChatMessage,
  type TeacherChatResponse,
  type TeacherMemorySignals,
  type TeachingMove,
} from "@/features/ai-teacher/types";

type GenerateTeacherResponseInput = {
  concept: Concept;
  lesson: LessonContent;
  locale: "en" | "zh";
  currentSection: string;
  userMessage: string;
  selectedText?: string;
  selectionAction?: string;
  chatHistory: TeacherChatMessage[];
  intent?: TeacherIntent;
  teachingMoveHint?: TeachingMove;
  curriculumContext?: AssembledCurriculumContext;
  learnerMemorySnapshot?: LearnerMemorySnapshot;
};

export type GeneratedTeacherResponse = {
  teacherResponse: TeacherChatResponse;
  modelTelemetry: TeacherModelTelemetry;
};

export type GenerateTeacherResponseOptions = {
  signal?: AbortSignal;
  onAssistantMessageDelta?: (delta: string) => void;
};

const errorMessages: Record<TeacherChatErrorCode, string> = {
  missing_api_key:
    "DeepSeek API key is missing. Please set DEEPSEEK_API_KEY and try again.",
  request_cancelled: "AI Teacher response was cancelled.",
  api_timeout:
    "DeepSeek response timed out after 3 minutes. Please try again with a shorter question.",
  api_error:
    "DeepSeek API request failed. Please check the API configuration or try again later.",
  empty_response: "DeepSeek returned an empty response. Please try again.",
  invalid_json: "DeepSeek returned invalid JSON. Please try again.",
  schema_validation_failed:
    "DeepSeek returned JSON that did not match the AI Teacher response schema.",
};

export class TeacherChatServiceError extends Error {
  code: TeacherChatErrorCode;

  constructor(code: TeacherChatErrorCode, message = errorMessages[code]) {
    super(message);
    this.name = "TeacherChatServiceError";
    this.code = code;
  }
}

function parseJsonObject(content: string) {
  const trimmed = content.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    throw new TeacherChatServiceError("invalid_json");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => {
    return typeof value === "string" && value.trim().length > 0;
  });
}

function normalizeTeachingMove(value: unknown): TeachingMove {
  if (typeof value !== "string") {
    return "explain";
  }

  const normalized = value.trim().toLowerCase().replaceAll("-", "_");
  const moveAliases: Record<string, TeachingMove> = {
    ask_guiding_question: "ask_guiding_question",
    correct_misconception: "correct_misconception",
    example: "give_example",
    explain: "explain",
    explanation: "explain",
    give_example: "give_example",
    guiding_question: "ask_guiding_question",
    misconception: "correct_misconception",
    misconception_check: "correct_misconception",
    question: "ask_guiding_question",
    reflect: "reflect",
    reflection: "reflect",
  };

  return moveAliases[normalized] ?? "explain";
}

function normalizeFollowUps(value: unknown, locale: "en" | "zh") {
  const fallback =
    locale === "zh"
      ? [
          "请用更简单的话解释这个概念（concept）",
          "再给我一个例子（example）",
        ]
      : ["Explain this more simply", "Give me another example"];

  if (!Array.isArray(value)) {
    return fallback;
  }

  const followUps = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  return followUps.length > 0 ? followUps : fallback;
}

function normalizeCitationChunkIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, 5);
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "yes", "needs_review"].includes(normalized)) {
      return true;
    }

    if (["false", "no"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

function normalizeNumber(value: unknown, fallback: number) {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(-20, Math.min(20, numberValue));
}

function normalizeConfusionLevel(
  value: unknown,
): TeacherMemorySignals["confusionLevel"] {
  if (typeof value !== "string") {
    return "medium";
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "low" || normalized === "medium" || normalized === "high") {
    return normalized;
  }

  return "medium";
}

function normalizeSuggestedStudyAction(
  value: unknown,
  fallback: TeacherMemorySignals["suggestedStudyAction"],
): TeacherMemorySignals["suggestedStudyAction"] {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase().replaceAll("-", "_");
  const actionAliases: Record<
    string,
    TeacherMemorySignals["suggestedStudyAction"]
  > = {
    application: "ready_for_application",
    continue: "continue_learning",
    continue_learning: "continue_learning",
    example: "continue_learning",
    needs_reflection: "needs_reflection",
    ready: "ready_for_application",
    ready_for_application: "ready_for_application",
    reflect: "needs_reflection",
    reflection: "needs_reflection",
    repair: "repair_misconception",
    repair_misconception: "repair_misconception",
    review: "review_confusing_section",
    review_confusing_section: "review_confusing_section",
  };

  return actionAliases[normalized] ?? fallback;
}

function inferMemorySignalFallback({
  detectedMisconception,
  locale,
  teachingMove,
}: {
  detectedMisconception?: string;
  locale: "en" | "zh";
  teachingMove: TeachingMove;
}): TeacherMemorySignals {
  if (detectedMisconception) {
    return {
      confusionLevel: "high",
      misconceptionType: detectedMisconception,
      needsReview: true,
      suggestedStudyAction: "repair_misconception",
      confidenceDelta: -8,
      evidenceNote:
        locale === "zh"
          ? "检测到需要修复的误区（misconception）。"
          : "A misconception signal was detected and should be repaired.",
    };
  }

  if (teachingMove === "reflect") {
    return {
      confusionLevel: "low",
      needsReview: false,
      suggestedStudyAction: "ready_for_application",
      confidenceDelta: 8,
      evidenceNote:
        locale === "zh"
          ? "学习者正在进行反思（reflection），这是较强的理解信号。"
          : "The learner is reflecting, which is a stronger understanding signal.",
    };
  }

  return {
    confusionLevel: "medium",
    needsReview: teachingMove !== "give_example",
    suggestedStudyAction:
      teachingMove === "ask_guiding_question"
        ? "needs_reflection"
        : "continue_learning",
    confidenceDelta: teachingMove === "give_example" ? 2 : -2,
    evidenceNote:
      locale === "zh"
        ? "这次互动显示仍需要更多概念证据（concept evidence）。"
        : "This interaction suggests more concept evidence is still useful.",
  };
}

function normalizeMemorySignals({
  detectedMisconception,
  locale,
  rawSignals,
  teachingMove,
}: {
  detectedMisconception?: string;
  locale: "en" | "zh";
  rawSignals: unknown;
  teachingMove: TeachingMove;
}): TeacherMemorySignals {
  const fallback = inferMemorySignalFallback({
    detectedMisconception,
    locale,
    teachingMove,
  });

  if (!isRecord(rawSignals)) {
    return fallback;
  }

  return {
    confusionLevel: normalizeConfusionLevel(
      rawSignals.confusionLevel ?? rawSignals.confusion_level,
    ),
    misconceptionType: firstString(
      rawSignals.misconceptionType,
      rawSignals.misconception_type,
      rawSignals.misconception,
    ),
    needsReview: normalizeBoolean(
      rawSignals.needsReview ?? rawSignals.needs_review,
      fallback.needsReview,
    ),
    suggestedStudyAction: normalizeSuggestedStudyAction(
      rawSignals.suggestedStudyAction ?? rawSignals.suggested_study_action,
      fallback.suggestedStudyAction,
    ),
    confidenceDelta: normalizeNumber(
      rawSignals.confidenceDelta ?? rawSignals.confidence_delta,
      fallback.confidenceDelta,
    ),
    evidenceNote:
      firstString(
        rawSignals.evidenceNote,
        rawSignals.evidence_note,
        rawSignals.note,
      ) ?? fallback.evidenceNote,
  };
}

function normalizeTeacherResponse(
  value: unknown,
  locale: "en" | "zh",
): unknown {
  if (!isRecord(value)) {
    return value;
  }

  const assistantMessage = firstString(
    value.assistantMessage,
    value.assistant_message,
    value.message,
    value.response,
    value.answer,
    value.content,
  );
  const detectedMisconception = firstString(
    value.detectedMisconception,
    value.detected_misconception,
    value.misconception,
  );
  const teachingMove = normalizeTeachingMove(
    value.teachingMove ?? value.teaching_move,
  );

  return {
    assistantMessage,
    detectedMisconception,
    memorySignals: normalizeMemorySignals({
      detectedMisconception,
      locale,
      rawSignals:
        value.memorySignals ??
        value.memory_signals ??
        value.learnerMemorySignals ??
        value.learner_memory_signals,
      teachingMove,
    }),
    suggestedFollowUps: normalizeFollowUps(
      value.suggestedFollowUps ??
        value.suggested_follow_ups ??
        value.followUps ??
        value.follow_ups,
      locale,
    ),
    citationChunkIds: normalizeCitationChunkIds(
      value.citationChunkIds ??
        value.citation_chunk_ids ??
        value.citations ??
        value.sources,
    ),
    teachingMove,
  };
}

export function getTeacherChatErrorMessage(code: TeacherChatErrorCode) {
  return errorMessages[code];
}

function parseValidatedTeacherResponse(
  content: string,
  locale: "en" | "zh",
) {
  try {
    return teacherChatResponseSchema.parse(
      normalizeTeacherResponse(parseJsonObject(content), locale),
    );
  } catch (error) {
    if (error instanceof TeacherChatServiceError) {
      throw error;
    }

    if (error instanceof ZodError) {
      throw new TeacherChatServiceError("schema_validation_failed");
    }

    throw error;
  }
}

export async function generateTeacherResponse(
  input: GenerateTeacherResponseInput,
  options: GenerateTeacherResponseOptions = {},
): Promise<GeneratedTeacherResponse> {
  const client = getDeepSeekClient();

  if (!client) {
    throw new TeacherChatServiceError("missing_api_key");
  }

  const controller = new AbortController();
  let didTimeout = false;
  const handleExternalAbort = () => controller.abort(options.signal?.reason);
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort(new Error("DeepSeek request timed out."));
  }, DEEPSEEK_TIMEOUT_MS);
  const startedAt = Date.now();

  if (options.signal?.aborted) {
    handleExternalAbort();
  } else {
    options.signal?.addEventListener("abort", handleExternalAbort, {
      once: true,
    });
  }

  try {
    const messages = [
      {
        role: "system" as const,
        content: buildTeacherSystemPrompt(input.locale),
      },
      {
        role: "user" as const,
        content: buildTeacherUserPrompt(input),
      },
    ];

    if (options.onAssistantMessageDelta) {
      const stream = await client.chat.completions.create(
        {
          model: DEEPSEEK_MODEL,
          response_format: { type: "json_object" },
          temperature: 0.35,
          messages,
          stream: true,
          stream_options: { include_usage: true },
        },
        {
          signal: controller.signal,
          timeout: DEEPSEEK_TIMEOUT_MS,
          maxRetries: 0,
        },
      );
      let content = "";
      let visibleAssistantMessage = "";
      let firstTokenDurationMs: number | undefined;
      let finishReason: string | undefined;
      let model = DEEPSEEK_MODEL;
      let usage:
        | {
            completion_tokens?: number;
            prompt_tokens?: number;
            total_tokens?: number;
          }
        | undefined;

      for await (const chunk of stream) {
        model = chunk.model || model;

        if (chunk.usage) {
          usage = chunk.usage;
        }

        const choice = chunk.choices[0];

        if (choice?.finish_reason) {
          finishReason = choice.finish_reason;
        }

        const contentDelta = choice?.delta?.content;

        if (!contentDelta) {
          continue;
        }

        content += contentDelta;
        const progress = extractJsonStringProgress(
          content,
          "assistantMessage",
        );

        if (
          progress &&
          progress.value.startsWith(visibleAssistantMessage) &&
          progress.value.length > visibleAssistantMessage.length
        ) {
          const visibleDelta = progress.value.slice(
            visibleAssistantMessage.length,
          );

          firstTokenDurationMs ??= Date.now() - startedAt;
          visibleAssistantMessage = progress.value;
          options.onAssistantMessageDelta(visibleDelta);
        }
      }

      if (!content.trim()) {
        throw new TeacherChatServiceError("empty_response");
      }

      return {
        modelTelemetry: {
          completionTokens: usage?.completion_tokens,
          durationMs: Date.now() - startedAt,
          finishReason,
          firstTokenDurationMs,
          model,
          promptTokens: usage?.prompt_tokens,
          promptVersion: TEACHER_PROMPT_VERSION,
          provider: "deepseek",
          totalTokens: usage?.total_tokens,
        },
        teacherResponse: parseValidatedTeacherResponse(content, input.locale),
      };
    }

    const completion = await client.chat.completions.create(
      {
        model: DEEPSEEK_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.35,
        messages,
      },
      {
        signal: controller.signal,
        timeout: DEEPSEEK_TIMEOUT_MS,
        maxRetries: 0,
      },
    );

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new TeacherChatServiceError("empty_response");
    }

    return {
      modelTelemetry: {
        completionTokens: completion.usage?.completion_tokens,
        durationMs: Date.now() - startedAt,
        finishReason: completion.choices[0]?.finish_reason ?? undefined,
        model: completion.model || DEEPSEEK_MODEL,
        promptTokens: completion.usage?.prompt_tokens,
        promptVersion: TEACHER_PROMPT_VERSION,
        provider: "deepseek",
        totalTokens: completion.usage?.total_tokens,
      },
      teacherResponse: parseValidatedTeacherResponse(content, input.locale),
    };
  } catch (error) {
    if (error instanceof TeacherChatServiceError) {
      throw error;
    }

    if (options.signal?.aborted) {
      throw new TeacherChatServiceError("request_cancelled");
    }

    if (didTimeout) {
      throw new TeacherChatServiceError("api_timeout");
    }

    console.warn("AI Teacher response failed.", {
      conceptId: input.concept.id,
      currentSection: input.currentSection,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw new TeacherChatServiceError("api_error");
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", handleExternalAbort);
  }
}
