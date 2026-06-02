import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurriculumPacks } from "@/curricula";
import { buildCurriculumEmbeddingIndex } from "@/features/rag/embedding-indexer";
import { EmbeddingProviderError } from "@/features/rag/embedding-provider";
import { getCurriculumEmbeddingIndexStats } from "@/features/rag/embedding-store";
import { isDeveloperToolsEnabled } from "@/lib/developer-mode";

export const dynamic = "force-dynamic";

const buildEmbeddingIndexRequestSchema = z.object({
  force: z.boolean().default(false),
  locale: z.enum(["all", "en", "zh"]).default("all"),
});

function isAuthorized(request: Request) {
  if (!isDeveloperToolsEnabled()) {
    return false;
  }

  const secret = process.env.EMBEDDING_INDEX_SECRET;

  if (secret) {
    return request.headers.get("authorization") === `Bearer ${secret}`;
  }

  return process.env.NODE_ENV !== "production";
}

export function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          "Embedding index access is disabled. Set EMBEDDING_INDEX_SECRET or use local development.",
      },
      { status: 403 },
    );
  }

  return NextResponse.json({
    ok: true,
    stats: getCurriculumEmbeddingIndexStats(),
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error:
          "Embedding index build is disabled. Set EMBEDDING_INDEX_SECRET or use local development.",
      },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsedRequest = buildEmbeddingIndexRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: "Invalid embedding index build request.",
      },
      { status: 400 },
    );
  }

  try {
    const summary = await buildCurriculumEmbeddingIndex({
      curricula: getCurriculumPacks(),
      force: parsedRequest.data.force,
      locale: parsedRequest.data.locale,
    });

    return NextResponse.json({
      ok: true,
      stats: getCurriculumEmbeddingIndexStats(),
      summary,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected embedding index build error.";
    const status = error instanceof EmbeddingProviderError ? 503 : 500;

    return NextResponse.json(
      {
        error: message,
      },
      { status },
    );
  }
}

