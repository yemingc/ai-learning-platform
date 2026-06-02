import "server-only";

import type { CurriculumPack } from "@/curricula/types";
import { searchCurriculumChunks } from "@/features/rag/curriculum-retriever";
import type { CurriculumRetrievalMode } from "@/features/rag/embedding-types";
import { searchCurriculumChunksByEmbedding } from "@/features/rag/embedding-retriever";
import { searchCurriculumChunksHybrid } from "@/features/rag/hybrid-retriever";
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
  if (mode === "embedding") {
    return searchCurriculumChunksByEmbedding({ curricula, query });
  }

  if (mode === "hybrid") {
    return searchCurriculumChunksHybrid({ curricula, query });
  }

  return searchCurriculumChunks({ curricula, query });
}

export function getRetrievalMode(value?: string): CurriculumRetrievalMode {
  if (value === "embedding" || value === "hybrid" || value === "keyword") {
    return value;
  }

  return "keyword";
}

