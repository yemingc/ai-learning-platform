import type { CurriculumRetrievalMode } from "@/features/rag/embedding-types";

export const DEFAULT_MINIMUM_RETRIEVAL_SCORES: Record<
  CurriculumRetrievalMode,
  number
> = {
  embedding: 48,
  hybrid: 20,
  keyword: 4,
};

export type HybridRetrievalWeights = {
  keyword: number;
  embedding: number;
};

export const DEFAULT_HYBRID_RETRIEVAL_WEIGHTS: HybridRetrievalWeights = {
  keyword: 65,
  embedding: 35,
};

export const HYBRID_MAX_RESULTS_PER_CONCEPT = 3;

const minimumScoreEnvironmentKeys: Record<CurriculumRetrievalMode, string> = {
  embedding: "RAG_EMBEDDING_MIN_SCORE",
  hybrid: "RAG_HYBRID_MIN_SCORE",
  keyword: "RAG_KEYWORD_MIN_SCORE",
};

export function resolveMinimumRetrievalScore({
  mode,
  value,
}: {
  mode: CurriculumRetrievalMode;
  value?: string;
}) {
  const parsedValue = value?.trim() ? Number(value) : Number.NaN;

  if (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > 100) {
    return DEFAULT_MINIMUM_RETRIEVAL_SCORES[mode];
  }

  return parsedValue;
}

export function getMinimumRetrievalScore(mode: CurriculumRetrievalMode) {
  return resolveMinimumRetrievalScore({
    mode,
    value: process.env[minimumScoreEnvironmentKeys[mode]],
  });
}

export function resolveHybridRetrievalWeights({
  embeddingValue,
  keywordValue,
}: {
  embeddingValue?: string;
  keywordValue?: string;
}): HybridRetrievalWeights {
  const keyword = keywordValue?.trim() ? Number(keywordValue) : Number.NaN;
  const embedding = embeddingValue?.trim()
    ? Number(embeddingValue)
    : Number.NaN;

  if (
    !Number.isFinite(keyword) ||
    !Number.isFinite(embedding) ||
    keyword < 0 ||
    embedding < 0 ||
    Math.abs(keyword + embedding - 100) > 0.000001
  ) {
    return DEFAULT_HYBRID_RETRIEVAL_WEIGHTS;
  }

  return { embedding, keyword };
}

export function getHybridRetrievalWeights() {
  return resolveHybridRetrievalWeights({
    embeddingValue: process.env.RAG_HYBRID_EMBEDDING_WEIGHT,
    keywordValue: process.env.RAG_HYBRID_KEYWORD_WEIGHT,
  });
}

export function calculateHybridRetrievalScore({
  embeddingScore,
  keywordScore,
  weights = DEFAULT_HYBRID_RETRIEVAL_WEIGHTS,
}: {
  embeddingScore: number;
  keywordScore: number;
  weights?: HybridRetrievalWeights;
}) {
  const keywordContribution = (keywordScore * weights.keyword) / 100;
  const embeddingContribution = (embeddingScore * weights.embedding) / 100;

  return {
    embeddingContribution: Number(embeddingContribution.toFixed(2)),
    keywordContribution: Number(keywordContribution.toFixed(2)),
    score: Number((keywordContribution + embeddingContribution).toFixed(2)),
  };
}

export function selectDiverseRetrievalResults<T extends { conceptId: string }>({
  limit,
  maxPerConcept = HYBRID_MAX_RESULTS_PER_CONCEPT,
  results,
}: {
  limit: number;
  maxPerConcept?: number;
  results: T[];
}) {
  const selected: T[] = [];
  const countsByConcept = new Map<string, number>();
  const effectiveLimit = Math.max(0, Math.floor(limit));
  const effectiveMaximum = Math.max(1, Math.floor(maxPerConcept));

  if (effectiveLimit === 0) {
    return selected;
  }

  for (const result of results) {
    const conceptCount = countsByConcept.get(result.conceptId) ?? 0;

    if (conceptCount >= effectiveMaximum) {
      continue;
    }

    selected.push(result);
    countsByConcept.set(result.conceptId, conceptCount + 1);

    if (selected.length >= effectiveLimit) {
      break;
    }
  }

  return selected;
}
