import { z } from "zod";

const conceptIdSchema = z.string().min(1);

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
    conceptId: conceptIdSchema,
    title: z.string().min(1),
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
