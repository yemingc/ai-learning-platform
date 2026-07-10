import "server-only";

import { createHash } from "node:crypto";
import type { CurriculumPack } from "@/curricula/types";
import { flattenLessonsToRetrievalChunks } from "@/features/lessons/retrieval-chunks";
import type { LessonRetrievalChunk } from "@/features/lessons/retrieval-chunks";
import { createEmbeddingProvider } from "@/features/rag/embedding-provider";
import type { CurriculumEmbeddingBuildSummary } from "@/features/rag/embedding-types";
import {
  getCurriculumEmbeddingRecords,
  upsertCurriculumEmbeddingRecords,
} from "@/features/rag/embedding-store";

type BuildCurriculumEmbeddingIndexInput = {
  curricula: CurriculumPack[];
  force?: boolean;
  locale?: "all" | "en" | "zh";
};

const DEFAULT_BATCH_SIZE = 24;

function hashText(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getEmbeddingInputText({
  retrievalTags,
  sourceLabel,
  text,
  title,
}: {
  retrievalTags: string[];
  sourceLabel: string;
  text: string;
  title: string;
}) {
  return [
    `Source: ${sourceLabel}`,
    `Title: ${title}`,
    retrievalTags.length ? `Tags: ${retrievalTags.join(", ")}` : "",
    `Content: ${text}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function getCurriculumEmbeddingTextHash(
  chunk: LessonRetrievalChunk,
) {
  return hashText(getEmbeddingInputText(chunk));
}

function getRequestedLocales(locale: "all" | "en" | "zh") {
  return locale === "all" ? (["zh", "en"] as const) : ([locale] as const);
}

function getCurriculumChunksForEmbedding({
  curricula,
  locale,
}: Pick<BuildCurriculumEmbeddingIndexInput, "curricula" | "locale">) {
  const locales = getRequestedLocales(locale ?? "all");

  return curricula.flatMap((curriculum) =>
    locales.flatMap((activeLocale) =>
      flattenLessonsToRetrievalChunks(curriculum.lessons, {
        locale: activeLocale,
      }),
    ),
  );
}

export async function buildCurriculumEmbeddingIndex({
  curricula,
  force = false,
  locale = "all",
}: BuildCurriculumEmbeddingIndexInput): Promise<CurriculumEmbeddingBuildSummary> {
  const provider = createEmbeddingProvider();
  const chunks = getCurriculumChunksForEmbedding({ curricula, locale });
  const existingByChunkId = new Map(
    getCurriculumEmbeddingRecords({ locale }).map((record) => [
      record.chunkId,
      record,
    ]),
  );
  const pendingChunks = chunks
    .map((chunk) => {
      const inputText = getEmbeddingInputText(chunk);

      return {
        chunk,
        inputText,
        textHash: getCurriculumEmbeddingTextHash(chunk),
      };
    })
    .filter(({ chunk, textHash }) => {
      if (force) {
        return true;
      }

      const existing = existingByChunkId.get(chunk.id);

      return (
        !existing ||
        existing.textHash !== textHash ||
        existing.model !== provider.model
      );
    });
  let chunksEmbedded = 0;
  let dimensions = provider.dimensions ?? 0;

  for (let index = 0; index < pendingChunks.length; index += DEFAULT_BATCH_SIZE) {
    const batch = pendingChunks.slice(index, index + DEFAULT_BATCH_SIZE);
    const embeddings = await provider.embedTexts(
      batch.map((item) => item.inputText),
    );
    const now = new Date().toISOString();
    const records = batch.map((item, batchIndex) => {
      const embedding = embeddings[batchIndex];

      if (!embedding?.length) {
        throw new Error(`Embedding provider returned an empty vector for ${item.chunk.id}.`);
      }

      dimensions = embedding.length;

      return {
        chunkId: item.chunk.id,
        conceptId: item.chunk.conceptId,
        courseId: item.chunk.courseId,
        dimensions: embedding.length,
        embedding,
        locale: item.chunk.locale,
        model: provider.model,
        sectionType: item.chunk.sectionType,
        textHash: item.textHash,
        unitId: item.chunk.unitId,
        updatedAt: now,
      };
    });

    upsertCurriculumEmbeddingRecords(records);
    chunksEmbedded += records.length;
  }

  return {
    chunksConsidered: chunks.length,
    chunksEmbedded,
    chunksSkipped: chunks.length - chunksEmbedded,
    dimensions,
    model: provider.model,
    provider: provider.name,
  };
}

export function getCurriculumEmbeddingIndexCoverage({
  curricula,
  locale = "all",
}: Pick<BuildCurriculumEmbeddingIndexInput, "curricula" | "locale">) {
  const chunks = getCurriculumChunksForEmbedding({ curricula, locale });
  const currentChunkIds = new Set(chunks.map((chunk) => chunk.id));
  const records = getCurriculumEmbeddingRecords({ locale });
  const recordByChunkId = new Map(
    records.map((record) => [record.chunkId, record]),
  );
  let missingCount = 0;
  let staleCount = 0;

  for (const chunk of chunks) {
    const record = recordByChunkId.get(chunk.id);

    if (!record) {
      missingCount += 1;
    } else if (record.textHash !== getCurriculumEmbeddingTextHash(chunk)) {
      staleCount += 1;
    }
  }

  const orphanedCount = records.filter(
    (record) => !currentChunkIds.has(record.chunkId),
  ).length;

  return {
    currentCount: chunks.length - missingCount - staleCount,
    expectedCount: chunks.length,
    isCurrent: missingCount === 0 && staleCount === 0,
    missingCount,
    orphanedCount,
    staleCount,
  };
}
