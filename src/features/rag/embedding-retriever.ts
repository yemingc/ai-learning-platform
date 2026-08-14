import "server-only";

import type { CurriculumPack } from "@/curricula/types";
import type { LessonRetrievalChunk } from "@/features/lessons/retrieval-chunks";
import {
  createCurriculumRetrievalResult,
  getCurriculumRetrievalChunks,
} from "@/features/rag/curriculum-retriever";
import { createEmbeddingProvider } from "@/features/rag/embedding-provider";
import { getCurriculumEmbeddingTextHash } from "@/features/rag/embedding-indexer";
import {
  getCurriculumEmbeddingIndexStats,
  getCurriculumEmbeddingRecords,
} from "@/features/rag/embedding-store";
import type {
  CurriculumRetrievalPreview,
  CurriculumRetrievalQuery,
  CurriculumRetrievalResult,
} from "@/features/rag/retrieval-types";

function cosineSimilarity(a: number[], b: number[]) {
  if (!a.length || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let index = 0; index < a.length; index += 1) {
    const aValue = a[index] ?? 0;
    const bValue = b[index] ?? 0;

    dotProduct += aValue * bValue;
    aMagnitude += aValue * aValue;
    bMagnitude += bValue * bValue;
  }

  if (!aMagnitude || !bMagnitude) {
    return 0;
  }

  return dotProduct / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
}

function getScopedChunks({
  curricula,
  query,
}: {
  curricula: CurriculumPack[];
  query: CurriculumRetrievalQuery;
}) {
  return getCurriculumRetrievalChunks(curricula, query.locale ?? "zh").filter(
    (chunk) => {
      if (query.courseId && chunk.courseId !== query.courseId) {
        return false;
      }

      if (query.unitId && chunk.unitId !== query.unitId) {
        return false;
      }

      if (query.conceptId && chunk.conceptId !== query.conceptId) {
        return false;
      }

      if (query.sectionType && chunk.sectionType !== query.sectionType) {
        return false;
      }

      return true;
    },
  );
}

function createChunkMap(chunks: LessonRetrievalChunk[]) {
  return new Map(chunks.map((chunk) => [chunk.id, chunk]));
}

export async function searchCurriculumChunksByEmbedding({
  curricula,
  query,
}: {
  curricula: CurriculumPack[];
  query: CurriculumRetrievalQuery;
}): Promise<CurriculumRetrievalPreview> {
  const scopedChunks = getScopedChunks({ curricula, query });
  const chunkById = createChunkMap(scopedChunks);
  const stats = getCurriculumEmbeddingIndexStats();
  const provider = createEmbeddingProvider();
  const records = getCurriculumEmbeddingRecords(query).filter((record) => {
    const chunk = chunkById.get(record.chunkId);

    return (
      Boolean(chunk) &&
      record.model === provider.model &&
      record.textHash === getCurriculumEmbeddingTextHash(chunk!)
    );
  });

  if (!stats.recordCount || records.length !== scopedChunks.length) {
    throw new Error(
      `Embedding index is missing or stale for this scope (${records.length}/${scopedChunks.length} current chunks). Run npm run embeddings:build first.`,
    );
  }

  const [queryEmbedding] = await provider.embedTexts([query.query]);

  if (!queryEmbedding?.length) {
    throw new Error("Embedding provider returned an empty query vector.");
  }

  const limit = query.limit ?? 8;
  const minimumScore = query.minimumScore ?? 0;
  const scoredResults = records
    .map((record) => {
      const chunk = chunkById.get(record.chunkId);

      if (!chunk) {
        return undefined;
      }

      const similarity = cosineSimilarity(queryEmbedding, record.embedding);
      const score = Number((similarity * 100).toFixed(2));

      return createCurriculumRetrievalResult({
        chunk,
        curricula,
        matchedReasons: ["embedding"],
        score,
      });
    })
    .filter((result): result is CurriculumRetrievalResult => Boolean(result))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const acceptedResults = scoredResults.filter(
    (result) => result.score >= minimumScore,
  );

  return {
    minimumScore,
    query,
    rejectedMatches: scoredResults.length - acceptedResults.length,
    results: acceptedResults.slice(0, limit),
    totalChunks: scopedChunks.length,
    totalMatches: acceptedResults.length,
  };
}
