import type { z } from "zod";
import type {
  lessonApplicationPromptSchema,
  lessonContentSchema,
  lessonGuidedQuestionSchema,
  lessonMisconceptionCheckSchema,
  lessonObjectiveSchema,
  lessonPrerequisiteConnectionSchema,
  lessonReflectionPromptSchema,
  lessonWorkedExampleSchema,
} from "@/features/lessons/lesson-schema";

export type LessonObjective = z.infer<typeof lessonObjectiveSchema>;

export type LessonPrerequisiteConnection = z.infer<
  typeof lessonPrerequisiteConnectionSchema
>;

export type LessonWorkedExample = z.infer<typeof lessonWorkedExampleSchema>;

export type LessonGuidedQuestion = z.infer<typeof lessonGuidedQuestionSchema>;

export type LessonMisconceptionCheck = z.infer<
  typeof lessonMisconceptionCheckSchema
>;

export type LessonReflectionPrompt = z.infer<
  typeof lessonReflectionPromptSchema
>;

export type LessonApplicationPrompt = z.infer<
  typeof lessonApplicationPromptSchema
>;

export type LessonContent = z.infer<typeof lessonContentSchema>;
