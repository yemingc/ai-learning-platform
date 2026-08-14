import "server-only";

import type { CurriculumPack } from "@/curricula/types";
import { searchCurriculumChunks } from "@/features/rag/curriculum-retriever";
import type { CurriculumRetrievalMode } from "@/features/rag/embedding-types";
import { searchCurriculumChunksByEmbedding } from "@/features/rag/embedding-retriever";
import { searchCurriculumChunksHybrid } from "@/features/rag/hybrid-retriever";
import { getMinimumRetrievalScore } from "@/features/rag/retrieval-policy";
import type {
  CurriculumRetrievalPreview,
  CurriculumRetrievalQuery,
} from "@/features/rag/retrieval-types";

export async function searchCurriculumWithMode({
  curricula,
  mode,
  query,
}: {
  curricula: CurriculumPack[];
  mode: CurriculumRetrievalMode;
  query: CurriculumRetrievalQuery;
}): Promise<CurriculumRetrievalPreview> {
  const effectiveQuery = {
    ...query,
    minimumScore: query.minimumScore ?? getMinimumRetrievalScore(mode),
  };

  if (mode === "embedding") {
    return searchCurriculumChunksByEmbedding({
      curricula,
      query: effectiveQuery,
    });
  }

  if (mode === "hybrid") {
    return searchCurriculumChunksHybrid({ curricula, query: effectiveQuery });
  }

  return searchCurriculumChunks({ curricula, query: effectiveQuery });
}

export function getRetrievalMode(value?: string): CurriculumRetrievalMode {
  if (value === "embedding" || value === "hybrid" || value === "keyword") {
    return value;
  }

  return "hybrid";
}
