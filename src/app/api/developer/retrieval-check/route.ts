import { NextResponse } from "next/server";
import { getCurriculumPacks } from "@/curricula";
import { validateCurriculumRetrievalIndex } from "@/features/rag/curriculum-retriever";
import { runRetrievalEvaluation } from "@/features/rag/evaluation/eval-runner";

export function GET() {
  const curricula = getCurriculumPacks();
  const result = validateCurriculumRetrievalIndex(curricula);
  const evaluation = runRetrievalEvaluation({ curricula });

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
    ...result,
  });
}
