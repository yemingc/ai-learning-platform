import type { LessonRetrievalLocale } from "@/features/lessons/retrieval-chunks";
import type { LessonSectionType } from "@/features/lessons/types";

export type CurriculumRetrievalMode = "keyword" | "embedding" | "hybrid";

export type EmbeddingProviderName = "openai-compatible";

export type CurriculumEmbeddingRecord = {
  chunkId: string;
  courseId: string;
  unitId: string;
  conceptId: string;
  locale: LessonRetrievalLocale;
  sectionType: LessonSectionType;
  textHash: string;
  model: string;
  dimensions: number;
  embedding: number[];
  updatedAt: string;
};

export type CurriculumEmbeddingIndexStats = {
  recordCount: number;
  models: string[];
  dimensions: number[];
  lastUpdatedAt?: string;
};

export type CurriculumEmbeddingBuildSummary = {
  chunksConsidered: number;
  chunksEmbedded: number;
  chunksSkipped: number;
  dimensions: number;
  model: string;
  provider: EmbeddingProviderName;
};

