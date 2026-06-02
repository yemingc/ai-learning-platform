import type { Concept } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";
import type { LessonRetrievalChunk } from "@/features/lessons/retrieval-chunks";
import { getCurriculumPacks } from "@/curricula";
import { searchCurriculumChunks } from "@/features/rag/curriculum-retriever";

export type CurriculumCitation = {
  chunkId: string;
  sourceLabel: string;
  sectionType: string;
  locale: "en" | "zh";
};

export type AssembledCurriculumContext = {
  shouldRetrieve: boolean;
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

export function assembleCurriculumContext({
  concept,
  currentSection,
  locale,
  selectedText,
  selectionAction,
  userMessage,
}: AssembleCurriculumContextInput): AssembledCurriculumContext {
  const shouldRetrieve = shouldRetrieveCurriculumChunks({
    selectedText,
    selectionAction,
    userMessage,
  });

  if (!shouldRetrieve) {
    return {
      allowedCitations: [],
      contextText: "",
      retrievedChunks: [],
      shouldRetrieve: false,
    };
  }

  const retrievalPreview = searchCurriculumChunks({
    curricula: getCurriculumPacks(),
    query: {
      courseId: concept.courseId,
      limit: MAX_RETRIEVED_CHUNKS,
      locale,
      query: buildRetrievalQuery({ currentSection, selectedText, userMessage }),
    },
  });
  const retrievedChunks = retrievalPreview.results.slice(0, MAX_RETRIEVED_CHUNKS);

  return {
    allowedCitations: retrievedChunks.map((chunk) => ({
      chunkId: chunk.id,
      locale: chunk.locale,
      sectionType: chunk.sectionType,
      sourceLabel: chunk.sourceLabel,
    })),
    contextText: formatContextText(retrievedChunks),
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
