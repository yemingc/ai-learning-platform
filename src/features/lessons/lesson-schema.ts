import { z } from "zod";

const conceptIdSchema = z.string().min(1);
const stableIdSchema = z.string().min(1);

export const lessonSectionTypeSchema = z.enum([
  "why_this_matters",
  "intuition",
  "formal_idea",
  "worked_example",
  "think_with_me",
  "common_trap",
  "reflection",
  "try_applying_it",
  "key_takeaways",
]);

export const lessonSectionSchema = z
  .object({
    id: stableIdSchema,
    sectionId: z.string().min(1),
    type: lessonSectionTypeSchema,
    title: z.string().min(1),
    body: z.string().min(1),
    teachingGoal: z.string().min(1).optional(),
    retrievalTags: z.array(z.string().min(1)).default([]),
    misconceptionIds: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const lessonGlossaryTermSchema = z
  .object({
    term: z.string().min(1),
    definition: z.string().min(1),
    aliases: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const lessonPracticeReadinessTaskSchema = z
  .object({
    id: stableIdSchema,
    title: z.string().min(1),
    prompt: z.string().min(1),
    readinessSignal: z.string().min(1),
    sectionId: z.string().min(1),
  })
  .strict();

export const lessonObjectiveSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    successCriteria: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const lessonPrerequisiteConnectionSchema = z
  .object({
    conceptId: conceptIdSchema,
    title: z.string().min(1),
    connection: z.string().min(1),
  })
  .strict();

export const lessonWorkedExampleSchema = z
  .object({
    title: z.string().min(1),
    setup: z.string().min(1),
    walkthrough: z.array(z.string().min(1)).min(1),
    takeaway: z.string().min(1),
  })
  .strict();

export const lessonGuidedQuestionSchema = z
  .object({
    prompt: z.string().min(1),
    hint: z.string().min(1),
    targetInsight: z.string().min(1),
  })
  .strict();

export const lessonMisconceptionCheckSchema = z
  .object({
    misconception: z.string().min(1),
    checkPrompt: z.string().min(1),
    correction: z.string().min(1),
  })
  .strict();

export const lessonReflectionPromptSchema = z
  .object({
    prompt: z.string().min(1),
    sentenceStarter: z.string().min(1),
  })
  .strict();

export const lessonApplicationPromptSchema = z
  .object({
    title: z.string().min(1),
    prompt: z.string().min(1),
    whyItTransfers: z.string().min(1),
  })
  .strict();

export const lessonContentSchema = z
  .object({
    id: stableIdSchema,
    lessonId: z.string().min(1),
    courseId: z.string().min(1),
    unitId: z.string().min(1),
    conceptId: conceptIdSchema,
    title: z.string().min(1),
    learningObjectives: z.array(z.string().min(1)).min(1),
    prerequisiteConceptIds: z.array(conceptIdSchema),
    retrievalTags: z.array(z.string().min(1)).default([]),
    sections: z.array(lessonSectionSchema).min(1),
    glossaryTerms: z.array(lessonGlossaryTermSchema).default([]),
    applicationTasks: z.array(lessonPracticeReadinessTaskSchema).default([]),
    practiceReadinessTasks: z.array(lessonPracticeReadinessTaskSchema).default(
      [],
    ),
    objective: lessonObjectiveSchema,
    hook: z.string().min(1),
    intuition: z.string().min(1),
    formalExplanation: z.string().min(1),
    prerequisiteConnections: z.array(lessonPrerequisiteConnectionSchema),
    workedExamples: z.array(lessonWorkedExampleSchema).min(1),
    guidedQuestions: z.array(lessonGuidedQuestionSchema).min(1),
    misconceptionChecks: z.array(lessonMisconceptionCheckSchema).min(1),
    reflectionPrompt: lessonReflectionPromptSchema,
    applicationPrompt: lessonApplicationPromptSchema,
    keyTakeaways: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const lessonContentArraySchema = z.array(lessonContentSchema).min(1);
