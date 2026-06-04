import type { LessonSectionType } from "@/features/lessons/types";
import type { CurriculumRetrievalMode } from "@/features/rag/embedding-types";
import type { CurriculumRetrievalLocale } from "@/features/rag/retrieval-types";

export type RetrievalEvalCase = {
  id: string;
  description: string;
  query: string;
  locale: CurriculumRetrievalLocale;
  expectedConceptIds: string[];
  expectedSectionTypes: LessonSectionType[];
  maxRank: number;
  mustIncludeText?: string[];
};

export type RetrievalEvalResult = {
  caseId: string;
  description: string;
  query: string;
  locale: CurriculumRetrievalLocale;
  passed: boolean;
  topRank?: number;
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
    sourceLabel: string;
  }>;
  failureReason?: string;
};

export type RetrievalEvalSummary = {
  mode?: CurriculumRetrievalMode;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  passRate: number;
  meanReciprocalRank: number;
  topOneHits: number;
  topOneHitRate: number;
  topThreeHits: number;
  topThreeHitRate: number;
  results: RetrievalEvalResult[];
  error?: string;
};

export type RetrievalModeComparisonSummary = {
  bestMode?: CurriculumRetrievalMode;
  modes: RetrievalEvalSummary[];
};
