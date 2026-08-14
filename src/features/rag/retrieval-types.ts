import type {
  LessonRetrievalChunk,
  LessonRetrievalLocale,
} from "@/features/lessons/retrieval-chunks";
import type { LessonSectionType } from "@/features/lessons/types";

export type CurriculumRetrievalLocale = LessonRetrievalLocale | "all";

export type CurriculumRetrievalQuery = {
  query: string;
  locale?: CurriculumRetrievalLocale;
  courseId?: string;
  unitId?: string;
  conceptId?: string;
  sectionType?: LessonSectionType;
  tags?: string[];
  limit?: number;
  minimumScore?: number;
};

export type CurriculumRetrievalMatchReason =
  | "embedding"
  | "hybrid"
  | "title"
  | "text"
  | "tag"
  | "section_type";

export type CurriculumRetrievalResult = LessonRetrievalChunk & {
  score: number;
  scoreBreakdown?: {
    keywordRawScore: number;
    keywordNormalizedScore: number;
    embeddingSimilarityScore: number;
    keywordWeight: number;
    embeddingWeight: number;
    keywordContribution: number;
    embeddingContribution: number;
  };
  matchedReasons: CurriculumRetrievalMatchReason[];
  sourceLabel: string;
  citation: {
    courseTitle: string;
    unitTitle: string;
    conceptTitle: string;
    sectionTitle: string;
    sectionType: LessonSectionType;
  };
  previewText: string;
};

export type CurriculumRetrievalPreview = {
  query: CurriculumRetrievalQuery;
  totalChunks: number;
  totalMatches: number;
  rejectedMatches: number;
  minimumScore: number;
  results: CurriculumRetrievalResult[];
};
