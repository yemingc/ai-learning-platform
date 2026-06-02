import "server-only";

import { createHash } from "node:crypto";
import type { CurriculumPack } from "@/curricula/types";
import { flattenLessonsToRetrievalChunks } from "@/features/lessons/retrieval-chunks";
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

function getEmbeddingInputText({
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
        textHash: hashText(inputText),
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

