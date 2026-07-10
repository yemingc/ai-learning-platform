import { NextResponse } from "next/server";
import { getCurriculumPacks } from "@/curricula";
import { validateCurriculumRetrievalIndex } from "@/features/rag/curriculum-retriever";
import {
  runRetrievalEvaluation,
  runRetrievalModeComparison,
} from "@/features/rag/evaluation/eval-runner";
import { hasDeveloperApiAccess } from "@/lib/developer-api-access";

export async function GET(request: Request) {
  if (!(await hasDeveloperApiAccess(request))) {
    return NextResponse.json(
      {
        error:
          "Developer retrieval evaluation requires developer access or a valid bearer secret.",
      },
      { status: 403 },
    );
  }

  const curricula = getCurriculumPacks();
  const url = new URL(request.url);
  const shouldIncludeModeComparison =
    url.searchParams.get("includeModeComparison") === "true";
  const result = validateCurriculumRetrievalIndex(curricula);
  const evaluation = runRetrievalEvaluation({ curricula });
  const modeComparison = shouldIncludeModeComparison
    ? await runRetrievalModeComparison({ curricula })
    : undefined;

  return NextResponse.json({
    ok: true,
    evaluation: {
      failedCases: evaluation.failedCases,
      meanReciprocalRank: evaluation.meanReciprocalRank,
      passedCases: evaluation.passedCases,
      passRate: evaluation.passRate,
      results: evaluation.results,
      totalCases: evaluation.totalCases,
    },
    modeComparison: modeComparison
      ? {
          bestMode: modeComparison.bestMode,
          modes: modeComparison.modes.map((summary) => ({
            error: summary.error,
            failedCases: summary.failedCases,
            meanReciprocalRank: summary.meanReciprocalRank,
            mode: summary.mode,
            passedCases: summary.passedCases,
            passRate: summary.passRate,
            results: summary.results,
            topOneHitRate: summary.topOneHitRate,
            topOneHits: summary.topOneHits,
            topThreeHitRate: summary.topThreeHitRate,
            topThreeHits: summary.topThreeHits,
            totalCases: summary.totalCases,
          })),
        }
      : undefined,
    ...result,
  });
}
