import "server-only";

import OpenAI from "openai";
import type { EmbeddingProviderName } from "@/features/rag/embedding-types";

export class EmbeddingProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmbeddingProviderError";
  }
}

export type EmbeddingProvider = {
  dimensions?: number;
  model: string;
  name: EmbeddingProviderName;
  embedTexts(texts: string[]): Promise<number[][]>;
};

function getOptionalNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function getEmbeddingProviderStatus() {
  return {
    baseUrl: process.env.EMBEDDING_BASE_URL,
    hasApiKey: Boolean(process.env.EMBEDDING_API_KEY),
    model: process.env.EMBEDDING_MODEL,
    provider:
      (process.env.EMBEDDING_PROVIDER as EmbeddingProviderName | undefined) ??
      "openai-compatible",
  };
}

export function createEmbeddingProvider(): EmbeddingProvider {
  const provider =
    (process.env.EMBEDDING_PROVIDER as EmbeddingProviderName | undefined) ??
    "openai-compatible";
  const apiKey = process.env.EMBEDDING_API_KEY;
  const model = process.env.EMBEDDING_MODEL;
  const dimensions = getOptionalNumber(process.env.EMBEDDING_DIMENSIONS);

  if (provider !== "openai-compatible") {
    throw new EmbeddingProviderError(
      `Unsupported EMBEDDING_PROVIDER "${provider}". Use "openai-compatible".`,
    );
  }

  if (!apiKey) {
    throw new EmbeddingProviderError("Missing EMBEDDING_API_KEY.");
  }

  if (!model) {
    throw new EmbeddingProviderError("Missing EMBEDDING_MODEL.");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.EMBEDDING_BASE_URL || undefined,
  });

  return {
    dimensions,
    model,
    name: provider,
    async embedTexts(texts) {
      if (!texts.length) {
        return [];
      }

      const response = await client.embeddings.create({
        dimensions,
        input: texts,
        model,
      });

      return response.data.map((item) => item.embedding);
    },
  };
}

