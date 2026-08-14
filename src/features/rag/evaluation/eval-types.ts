import type { LessonSectionType } from "@/features/lessons/types";
import type { CurriculumRetrievalMode } from "@/features/rag/embedding-types";
import type {
  CurriculumRetrievalLocale,
  CurriculumRetrievalResult,
} from "@/features/rag/retrieval-types";

export type RetrievalEvalCase = {
  id: string;
  description: string;
  query: string;
  locale: CurriculumRetrievalLocale;
  courseId?: string;
  unitId?: string;
  expectedOutcome?: "match" | "no_match";
  expectedConceptIds: string[];
  expectedSectionTypes: LessonSectionType[];
  forbiddenConceptIds?: string[];
  maxRank: number;
  mustIncludeText?: string[];
};

export type RetrievalEvalResult = {
  caseId: string;
  description: string;
  query: string;
  locale: CurriculumRetrievalLocale;
  expectedOutcome: "match" | "no_match";
  passed: boolean;
  durationMs: number;
  topRank?: number;
  forbiddenRank?: number;
  reciprocalRank: number;
  expectedConceptIds: string[];
  expectedSectionTypes: LessonSectionType[];
  topResults: Array<{
    id: string;
    locale: string;
    conceptId: string;
    sectionType: LessonSectionType;
    title: string;
    score: number;
    scoreBreakdown?: CurriculumRetrievalResult["scoreBreakdown"];
    sourceLabel: string;
  }>;
  failureReason?: string;
};

export type RetrievalEvalSummary = {
  mode?: CurriculumRetrievalMode;
  totalCases: number;
  positiveCases: number;
  negativeCases: number;
  passedCases: number;
  failedCases: number;
  passRate: number;
  meanReciprocalRank: number;
  topOneHits: number;
  topOneHitRate: number;
  topThreeHits: number;
  topThreeHitRate: number;
  recallAtEightHits: number;
  recallAtEightRate: number;
  noMatchCorrect: number;
  noMatchAccuracy: number;
  falsePositiveRate: number;
  medianDurationMs: number;
  p95DurationMs: number;
  results: RetrievalEvalResult[];
  error?: string;
};

export type RetrievalModeComparisonSummary = {
  bestMode?: CurriculumRetrievalMode;
  modes: RetrievalEvalSummary[];
};
