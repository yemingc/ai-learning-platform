import type { Concept } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";
import type { LessonRetrievalChunk } from "@/features/lessons/retrieval-chunks";
import { getCurriculumPacks } from "@/curricula";
import { getLessonPath } from "@/curricula/routing";
import { searchCurriculumChunks } from "@/features/rag/curriculum-retriever";
import type { CurriculumRetrievalMode } from "@/features/rag/embedding-types";
import {
  getRetrievalMode,
  searchCurriculumWithMode,
} from "@/features/rag/retrieval-service";

export type CurriculumCitation = {
  chunkId: string;
  conceptId: string;
  href: string;
  sourceLabel: string;
  sectionId: string;
  sectionTitle: string;
  sectionType: string;
  locale: "en" | "zh";
};

export type AssembledCurriculumContext = {
  shouldRetrieve: boolean;
  requestedMode: CurriculumRetrievalMode;
  actualMode: CurriculumRetrievalMode;
  retrievalFallbackReason?: string;
  retrievedChunks: LessonRetrievalChunk[];
  contextText: string;
  allowedCitations: CurriculumCitation[];
};

type AssembleCurriculumContextInput = {
  concept: Concept;
  lesson: LessonContent;
  locale: "en" | "zh";
  currentSection: string;
  userMessage: string;
  selectedText?: string;
  selectionAction?: string;
};

const MAX_RETRIEVED_CHUNKS = 4;

function getAiTeacherRetrievalMode() {
  return getRetrievalMode(process.env.RAG_RETRIEVAL_MODE);
}

function shouldRetrieveCurriculumChunks({
  selectedText,
  selectionAction,
  userMessage,
}: Pick<
  AssembleCurriculumContextInput,
  "selectedText" | "selectionAction" | "userMessage"
>) {
  const normalizedMessage = userMessage.trim().toLowerCase();

  if (selectedText || selectionAction) {
    return true;
  }

  if (normalizedMessage.length < 4) {
    return false;
  }

  const skipMessages = new Set([
    "hi",
    "hello",
    "hey",
    "thanks",
    "thank you",
    "ok",
    "okay",
    "你好",
    "谢谢",
    "好的",
    "明白了",
  ]);

  return !skipMessages.has(normalizedMessage);
}

function buildRetrievalQuery({
  currentSection,
  selectedText,
  userMessage,
}: Pick<
  AssembleCurriculumContextInput,
  "currentSection" | "selectedText" | "userMessage"
>) {
  return [selectedText, userMessage, currentSection]
    .filter((value): value is string => Boolean(value?.trim()))
    .join("\n");
}

function formatContextText(chunks: LessonRetrievalChunk[]) {
  if (!chunks.length) {
    return "";
  }

  return chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] chunkId: ${chunk.id}\nsource: ${chunk.sourceLabel}\nsectionType: ${chunk.sectionType}\ncontent: ${chunk.text}`,
    )
    .join("\n\n---\n\n");
}

async function retrieveCurriculumChunks({
  concept,
  currentSection,
  locale,
  selectedText,
  userMessage,
}: Pick<
  AssembleCurriculumContextInput,
  "concept" | "currentSection" | "locale" | "selectedText" | "userMessage"
>) {
  const curricula = getCurriculumPacks();
  const requestedMode = getAiTeacherRetrievalMode();
  const query = {
    courseId: concept.courseId,
    limit: MAX_RETRIEVED_CHUNKS,
    locale,
    query: buildRetrievalQuery({ currentSection, selectedText, userMessage }),
  };

  if (requestedMode === "keyword") {
    return {
      actualMode: "keyword" as const,
      preview: searchCurriculumChunks({ curricula, query }),
      requestedMode,
    };
  }

  try {
    return {
      actualMode: requestedMode,
      preview: await searchCurriculumWithMode({
        curricula,
        mode: requestedMode,
        query,
      }),
      requestedMode,
    };
  } catch (error) {
    const fallbackReason =
      error instanceof Error ? error.message : "Configured retrieval mode failed.";

    return {
      actualMode: "keyword" as const,
      fallbackReason,
      preview: searchCurriculumChunks({ curricula, query }),
      requestedMode,
    };
  }
}

export async function assembleCurriculumContext({
  concept,
  currentSection,
  locale,
  selectedText,
  selectionAction,
  userMessage,
}: AssembleCurriculumContextInput): Promise<AssembledCurriculumContext> {
  const requestedMode = getAiTeacherRetrievalMode();
  const shouldRetrieve = shouldRetrieveCurriculumChunks({
    selectedText,
    selectionAction,
    userMessage,
  });

  if (!shouldRetrieve) {
    return {
      actualMode: requestedMode,
      allowedCitations: [],
      contextText: "",
      requestedMode,
      retrievedChunks: [],
      shouldRetrieve: false,
    };
  }

  const retrieval = await retrieveCurriculumChunks({
    concept,
    currentSection,
    locale,
    selectedText,
    userMessage,
  });
  const retrievedChunks = retrieval.preview.results.slice(0, MAX_RETRIEVED_CHUNKS);

  return {
    actualMode: retrieval.actualMode,
    allowedCitations: retrievedChunks.map((chunk) => ({
      chunkId: chunk.id,
      conceptId: chunk.conceptId,
      href: `${getLessonPath({
        courseId: chunk.courseId,
        unitId: chunk.unitId,
        id: chunk.conceptId,
      })}#lesson-section-${chunk.sectionId}`,
      locale: chunk.locale,
      sectionId: chunk.sectionId,
      sectionTitle: chunk.title,
      sectionType: chunk.sectionType,
      sourceLabel: chunk.sourceLabel,
    })),
    contextText: formatContextText(retrievedChunks),
    requestedMode: retrieval.requestedMode,
    retrievalFallbackReason: retrieval.fallbackReason,
    retrievedChunks,
    shouldRetrieve: true,
  };
}

export function filterAllowedCitations({
  allowedCitations,
  requestedChunkIds,
}: {
  allowedCitations: CurriculumCitation[];
  requestedChunkIds?: string[];
}) {
  if (!requestedChunkIds?.length) {
    return [];
  }

  const allowedById = new Map(
    allowedCitations.map((citation) => [citation.chunkId, citation]),
  );

  return requestedChunkIds
    .map((chunkId) => allowedById.get(chunkId))
    .filter((citation): citation is CurriculumCitation => Boolean(citation))
    .slice(0, MAX_RETRIEVED_CHUNKS);
}
