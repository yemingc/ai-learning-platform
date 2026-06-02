import type { z } from "zod";
import type {
  lessonApplicationPromptSchema,
  lessonContentSchema,
  lessonGuidedQuestionSchema,
  lessonGlossaryTermSchema,
  lessonMisconceptionCheckSchema,
  lessonObjectiveSchema,
  lessonPracticeReadinessTaskSchema,
  lessonPrerequisiteConnectionSchema,
  lessonReflectionPromptSchema,
  lessonSectionSchema,
  lessonSectionTypeSchema,
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

export type LessonSectionType = z.infer<typeof lessonSectionTypeSchema>;

export type LessonSection = z.infer<typeof lessonSectionSchema>;

export type LessonGlossaryTerm = z.infer<typeof lessonGlossaryTermSchema>;

export type LessonPracticeReadinessTask = z.infer<
  typeof lessonPracticeReadinessTaskSchema
>;

export type LessonContent = z.infer<typeof lessonContentSchema>;
