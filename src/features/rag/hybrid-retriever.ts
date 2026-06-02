import "server-only";

import type { CurriculumPack } from "@/curricula/types";
import { searchCurriculumChunks } from "@/features/rag/curriculum-retriever";
import { searchCurriculumChunksByEmbedding } from "@/features/rag/embedding-retriever";
import type {
  CurriculumRetrievalPreview,
  CurriculumRetrievalQuery,
  CurriculumRetrievalResult,
} from "@/features/rag/retrieval-types";

function normalizeScore(score: number, maxScore: number) {
  if (!maxScore) {
    return 0;
  }

  return score / maxScore;
}

export async function searchCurriculumChunksHybrid({
  curricula,
  query,
}: {
  curricula: CurriculumPack[];
  query: CurriculumRetrievalQuery;
}): Promise<CurriculumRetrievalPreview> {
  const expandedLimit = Math.max((query.limit ?? 8) * 2, 12);
  const keywordPreview = searchCurriculumChunks({
    curricula,
    query: {
      ...query,
      limit: expandedLimit,
    },
  });
  const embeddingPreview = await searchCurriculumChunksByEmbedding({
    curricula,
    query: {
      ...query,
      limit: expandedLimit,
    },
  });
  const keywordMaxScore = Math.max(
    ...keywordPreview.results.map((result) => result.score),
    0,
  );
  const embeddingMaxScore = Math.max(
    ...embeddingPreview.results.map((result) => result.score),
    0,
  );
  const mergedById = new Map<
    string,
    {
      result: CurriculumRetrievalResult;
      keywordScore: number;
      embeddingScore: number;
    }
  >();

  for (const result of keywordPreview.results) {
    mergedById.set(result.id, {
      embeddingScore: 0,
      keywordScore: normalizeScore(result.score, keywordMaxScore),
      result,
    });
  }

  for (const result of embeddingPreview.results) {
    const existing = mergedById.get(result.id);

    mergedById.set(result.id, {
      embeddingScore: normalizeScore(result.score, embeddingMaxScore),
      keywordScore: existing?.keywordScore ?? 0,
      result: existing?.result ?? result,
    });
  }

  const scoredResults = Array.from(mergedById.values())
    .map(({ embeddingScore, keywordScore, result }) => {
      const hybridScore = keywordScore * 45 + embeddingScore * 55;

      return {
        ...result,
        matchedReasons: Array.from(
          new Set([
            ...result.matchedReasons,
            keywordScore > 0 ? "hybrid" : "embedding",
          ]),
        ),
        score: Number(hybridScore.toFixed(2)),
      } satisfies CurriculumRetrievalResult;
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  return {
    query,
    results: scoredResults.slice(0, query.limit ?? 8),
    totalChunks: Math.max(keywordPreview.totalChunks, embeddingPreview.totalChunks),
    totalMatches: scoredResults.length,
  };
}

