import "server-only";

import type { CurriculumPack } from "@/curricula/types";
import { searchCurriculumChunks } from "@/features/rag/curriculum-retriever";
import { searchCurriculumChunksByEmbedding } from "@/features/rag/embedding-retriever";
import {
  calculateHybridRetrievalScore,
  getHybridRetrievalWeights,
  getMinimumRetrievalScore,
  selectDiverseRetrievalResults,
} from "@/features/rag/retrieval-policy";
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
      minimumScore: getMinimumRetrievalScore("keyword"),
    },
  });
  const embeddingPreview = await searchCurriculumChunksByEmbedding({
    curricula,
    query: {
      ...query,
      limit: expandedLimit,
      minimumScore: getMinimumRetrievalScore("embedding"),
    },
  });
  const keywordMaxScore = Math.max(
    ...keywordPreview.results.map((result) => result.score),
    0,
  );
  const hybridWeights = getHybridRetrievalWeights();
  const mergedById = new Map<
    string,
    {
      result: CurriculumRetrievalResult;
      keywordRawScore: number;
      keywordNormalizedScore: number;
      embeddingScore: number;
      matchedReasons: CurriculumRetrievalResult["matchedReasons"];
    }
  >();

  for (const result of keywordPreview.results) {
    mergedById.set(result.id, {
      embeddingScore: 0,
      keywordRawScore: result.score,
      keywordNormalizedScore: normalizeScore(result.score, keywordMaxScore) * 100,
      matchedReasons: result.matchedReasons,
      result,
    });
  }

  for (const result of embeddingPreview.results) {
    const existing = mergedById.get(result.id);

    mergedById.set(result.id, {
      embeddingScore: Math.max(0, result.score / 100),
      keywordRawScore: existing?.keywordRawScore ?? 0,
      keywordNormalizedScore: existing?.keywordNormalizedScore ?? 0,
      matchedReasons: Array.from(
        new Set([...(existing?.matchedReasons ?? []), ...result.matchedReasons]),
      ),
      result: existing?.result ?? result,
    });
  }

  const scoredResults = Array.from(mergedById.values())
    .map(({
      embeddingScore,
      keywordNormalizedScore,
      keywordRawScore,
      matchedReasons,
      result,
    }) => {
      const embeddingSimilarityScore = embeddingScore * 100;
      const hybridScore = calculateHybridRetrievalScore({
        embeddingScore: embeddingSimilarityScore,
        keywordScore: keywordNormalizedScore,
        weights: hybridWeights,
      });

      return {
        ...result,
        matchedReasons: Array.from(
          new Set([
            ...result.matchedReasons,
            ...matchedReasons,
            keywordNormalizedScore > 0 ? "hybrid" : "embedding",
          ]),
        ),
        score: hybridScore.score,
        scoreBreakdown: {
          embeddingContribution: hybridScore.embeddingContribution,
          embeddingSimilarityScore: Number(embeddingSimilarityScore.toFixed(2)),
          embeddingWeight: hybridWeights.embedding,
          keywordContribution: hybridScore.keywordContribution,
          keywordNormalizedScore: Number(keywordNormalizedScore.toFixed(2)),
          keywordRawScore,
          keywordWeight: hybridWeights.keyword,
        },
      } satisfies CurriculumRetrievalResult;
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const minimumScore = query.minimumScore ?? 0;
  const acceptedResults = scoredResults.filter(
    (result) => result.score >= minimumScore,
  );
  const resultLimit = query.limit ?? 8;
  const limitedResults = query.conceptId
    ? acceptedResults.slice(0, resultLimit)
    : selectDiverseRetrievalResults({
        limit: resultLimit,
        results: acceptedResults,
      });

  return {
    minimumScore,
    query,
    rejectedMatches: scoredResults.length - acceptedResults.length,
    results: limitedResults,
    totalChunks: Math.max(keywordPreview.totalChunks, embeddingPreview.totalChunks),
    totalMatches: acceptedResults.length,
  };
}
