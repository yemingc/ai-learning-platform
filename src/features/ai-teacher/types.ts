import { z } from "zod";

export const teacherChatMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(1600),
  })
  .strict();

export const teacherChatRequestSchema = z
  .object({
    conceptId: z.string().min(1),
    locale: z.enum(["en", "zh"]).default("en"),
    currentSection: z.string().min(1).max(120),
    userMessage: z.string().min(1).max(1200),
    selectedText: z.string().min(1).max(2400).optional(),
    selectionAction: z
      .enum([
        "explain_this",
        "give_example",
        "check_misconception",
        "ask_guiding_question",
      ])
      .optional(),
    chatHistory: z.array(teacherChatMessageSchema).max(8).default([]),
  })
  .strict();

export const teachingMoveSchema = z.enum([
  "explain",
  "ask_guiding_question",
  "give_example",
  "correct_misconception",
  "reflect",
]);

export const teacherChatErrorCodeSchema = z.enum([
  "missing_api_key",
  "api_timeout",
  "api_error",
  "empty_response",
  "invalid_json",
  "schema_validation_failed",
]);

export const teacherChatResponseSchema = z
  .object({
    assistantMessage: z.string().min(1),
    suggestedFollowUps: z.array(z.string().min(1)).min(1).max(4),
    detectedMisconception: z.string().min(1).optional(),
    teachingMove: teachingMoveSchema,
  })
  .strict();

export type TeacherChatMessage = z.infer<typeof teacherChatMessageSchema>;
export type TeacherChatRequest = z.infer<typeof teacherChatRequestSchema>;
export type TeacherChatResponse = z.infer<typeof teacherChatResponseSchema>;
export type TeacherChatErrorCode = z.infer<typeof teacherChatErrorCodeSchema>;
export type TeachingMove = z.infer<typeof teachingMoveSchema>;
