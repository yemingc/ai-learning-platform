import { z } from "zod";
import type { ConceptId, CourseId } from "@/features/knowledge/types";

export const formativeAssessmentPhaseSchema = z.enum([
  "diagnostic",
  "exit_ticket",
]);

export const formativeAssessmentLocaleSchema = z.enum(["en", "zh"]);

export const formativeAssessmentQuerySchema = z
  .object({
    courseId: z.string().min(1).max(120),
    conceptId: z.string().min(1).max(120),
    phase: formativeAssessmentPhaseSchema,
    locale: formativeAssessmentLocaleSchema.default("en"),
  })
  .strict();

const formativeAssessmentAnswerSchema = z
  .object({
    questionId: z.string().min(1).max(160),
    selectedOptionId: z.string().min(1).max(40),
  })
  .strict();

export const formativeAssessmentSubmissionSchema = formativeAssessmentQuerySchema
  .extend({
    answers: z.array(formativeAssessmentAnswerSchema).min(1).max(8),
  })
  .strict()
  .superRefine((submission, context) => {
    const questionIds = submission.answers.map((answer) => answer.questionId);

    if (new Set(questionIds).size !== questionIds.length) {
      context.addIssue({
        code: "custom",
        message: "Each assessment question may be answered only once.",
        path: ["answers"],
      });
    }
  });

export type FormativeAssessmentPhase = z.infer<
  typeof formativeAssessmentPhaseSchema
>;
export type FormativeAssessmentLocale = z.infer<
  typeof formativeAssessmentLocaleSchema
>;
export type FormativeAssessmentSubmission = z.infer<
  typeof formativeAssessmentSubmissionSchema
>;

export type FormativeAssessmentOption = {
  id: string;
  label: string;
};

export type FormativeAssessmentQuestion = {
  id: string;
  prompt: string;
  options: FormativeAssessmentOption[];
};

export type FormativeAssessment = {
  id: string;
  version: string;
  courseId: CourseId;
  conceptId: ConceptId;
  phase: FormativeAssessmentPhase;
  title: string;
  description: string;
  questions: FormativeAssessmentQuestion[];
};

export type FormativeAssessmentItemResult = {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
};

export type FormativeAssessmentAttempt = {
  id: string;
  assessmentId: string;
  assessmentVersion: string;
  conceptId: ConceptId;
  phase: FormativeAssessmentPhase;
  score: number;
  correctCount: number;
  questionCount: number;
  itemResults: FormativeAssessmentItemResult[];
  submittedAt: string;
};

export type FormativeAssessmentAttemptSummary = Pick<
  FormativeAssessmentAttempt,
  | "id"
  | "assessmentId"
  | "assessmentVersion"
  | "phase"
  | "score"
  | "correctCount"
  | "questionCount"
  | "submittedAt"
>;

export type FormativeAssessmentFeedback = FormativeAssessmentItemResult & {
  correctOptionId: string;
  explanation: string;
};

export type FormativeAssessmentProgress = {
  diagnosticScore?: number;
  exitTicketScore?: number;
  learningGain?: number;
  evidenceLevel: "none" | "diagnostic" | "pre_post";
};

export type FormativeAssessmentQuery = {
  conceptId: ConceptId;
  locale: FormativeAssessmentLocale;
  phase: FormativeAssessmentPhase;
};

export type FormativeAssessmentGradeInput = FormativeAssessmentQuery & {
  answers: Array<{ questionId: string; selectedOptionId: string }>;
};

export type FormativeAssessmentGrade = {
  assessment: FormativeAssessment;
  correctCount: number;
  questionCount: number;
  score: number;
  feedback: FormativeAssessmentFeedback[];
};

export type FormativeAssessmentProvider = {
  getAssessment: (query: FormativeAssessmentQuery) => FormativeAssessment;
  gradeAssessment: (
    input: FormativeAssessmentGradeInput,
  ) => FormativeAssessmentGrade;
  getCoverage: () => Array<{
    conceptId: ConceptId;
    diagnosticQuestionCount: number;
    exitTicketQuestionCount: number;
  }>;
  getIntegrityIssues: () => string[];
};
