import type { CurriculumPack } from "@/curricula/types";
import type { CurriculumRetrievalMode } from "@/features/rag/embedding-types";
import type {
  RetrievalEvalCase,
  RetrievalEvalResult,
  RetrievalEvalSummary,
  RetrievalModeComparisonSummary,
} from "@/features/rag/evaluation/eval-types";
import { retrievalEvalCases } from "@/features/rag/evaluation/eval-cases";
import { searchCurriculumChunks } from "@/features/rag/curriculum-retriever";
import { searchCurriculumWithMode } from "@/features/rag/retrieval-service";
import type { CurriculumRetrievalResult } from "@/features/rag/retrieval-types";

const evaluationModes: CurriculumRetrievalMode[] = [
  "keyword",
  "embedding",
  "hybrid",
];

function resultMatchesCase(
  result: CurriculumRetrievalResult,
  testCase: RetrievalEvalCase,
) {
  const conceptMatches = testCase.expectedConceptIds.includes(result.conceptId);
  const sectionMatches = testCase.expectedSectionTypes.includes(result.sectionType);
  const textMatches =
    !testCase.mustIncludeText?.length ||
    testCase.mustIncludeText.some((text) =>
      result.text.toLowerCase().includes(text.toLowerCase()),
    );

  return conceptMatches && sectionMatches && textMatches;
}

function getFailureReason({
  matchingRank,
  testCase,
}: {
  matchingRank?: number;
  testCase: RetrievalEvalCase;
}) {
  if (!matchingRank) {
    return "No retrieved chunk matched the expected concept, section type, and required text.";
  }

  return `Best matching chunk ranked ${matchingRank}, which is lower than required top-${testCase.maxRank}.`;
}

function createResultFromPreview({
  results,
  testCase,
}: {
  results: CurriculumRetrievalResult[];
  testCase: RetrievalEvalCase;
}): RetrievalEvalResult {
  const matchingIndex = results.findIndex((result) =>
    resultMatchesCase(result, testCase),
  );
  const matchingRank = matchingIndex >= 0 ? matchingIndex + 1 : undefined;
  const passed = Boolean(matchingRank && matchingRank <= testCase.maxRank);

  return {
    caseId: testCase.id,
    description: testCase.description,
    expectedConceptIds: testCase.expectedConceptIds,
    expectedSectionTypes: testCase.expectedSectionTypes,
    failureReason: passed
      ? undefined
      : getFailureReason({ matchingRank, testCase }),
    locale: testCase.locale,
    passed,
    query: testCase.query,
    reciprocalRank: matchingRank ? 1 / matchingRank : 0,
    topRank: matchingRank,
    topResults: results.slice(0, 5).map((result) => ({
      conceptId: result.conceptId,
      id: result.id,
      locale: result.locale,
      score: result.score,
      sectionType: result.sectionType,
      sourceLabel: result.sourceLabel,
      title: result.title,
    })),
  };
}

function summarizeResults({
  mode,
  results,
}: {
  mode?: CurriculumRetrievalMode;
  results: RetrievalEvalResult[];
}): RetrievalEvalSummary {
  const passedCases = results.filter((result) => result.passed).length;
  const topOneHits = results.filter((result) => result.topRank === 1).length;
  const topThreeHits = results.filter(
    (result) => result.topRank !== undefined && result.topRank <= 3,
  ).length;
  const meanReciprocalRank =
    results.length > 0
      ? results.reduce((sum, result) => sum + result.reciprocalRank, 0) /
        results.length
      : 0;

  return {
    failedCases: results.length - passedCases,
    meanReciprocalRank,
    mode,
    passRate: results.length > 0 ? passedCases / results.length : 0,
    passedCases,
    results,
    topOneHitRate: results.length > 0 ? topOneHits / results.length : 0,
    topOneHits,
    topThreeHitRate: results.length > 0 ? topThreeHits / results.length : 0,
    topThreeHits,
    totalCases: results.length,
  };
}

function createFailedModeSummary({
  cases,
  error,
  mode,
}: {
  cases: RetrievalEvalCase[];
  error: unknown;
  mode: CurriculumRetrievalMode;
}): RetrievalEvalSummary {
  const message = error instanceof Error ? error.message : "Retrieval mode failed.";

  return {
    error: message,
    failedCases: cases.length,
    meanReciprocalRank: 0,
    mode,
    passRate: 0,
    passedCases: 0,
    results: cases.map((testCase) => ({
      caseId: testCase.id,
      description: testCase.description,
      expectedConceptIds: testCase.expectedConceptIds,
      expectedSectionTypes: testCase.expectedSectionTypes,
      failureReason: message,
      locale: testCase.locale,
      passed: false,
      query: testCase.query,
      reciprocalRank: 0,
      topResults: [],
    })),
    topOneHitRate: 0,
    topOneHits: 0,
    topThreeHitRate: 0,
    topThreeHits: 0,
    totalCases: cases.length,
  };
}

export function runRetrievalEvaluation({
  cases = retrievalEvalCases,
  curricula,
}: {
  cases?: RetrievalEvalCase[];
  curricula: CurriculumPack[];
}): RetrievalEvalSummary {
  const results: RetrievalEvalResult[] = cases.map((testCase) => {
    const retrievalPreview = searchCurriculumChunks({
      curricula,
      query: {
        limit: 8,
        locale: testCase.locale,
        query: testCase.query,
      },
    });

    return createResultFromPreview({
      results: retrievalPreview.results,
      testCase,
    });
  });

  return summarizeResults({ mode: "keyword", results });
}

export async function runRetrievalEvaluationForMode({
  cases = retrievalEvalCases,
  curricula,
  mode,
}: {
  cases?: RetrievalEvalCase[];
  curricula: CurriculumPack[];
  mode: CurriculumRetrievalMode;
}): Promise<RetrievalEvalSummary> {
  if (mode === "keyword") {
    return runRetrievalEvaluation({ cases, curricula });
  }

  try {
    const results: RetrievalEvalResult[] = [];

    for (const testCase of cases) {
      const retrievalPreview = await searchCurriculumWithMode({
        curricula,
        mode,
        query: {
          limit: 8,
          locale: testCase.locale,
          query: testCase.query,
        },
      });

      results.push(
        createResultFromPreview({
          results: retrievalPreview.results,
          testCase,
        }),
      );
    }

    return summarizeResults({ mode, results });
  } catch (error) {
    return createFailedModeSummary({ cases, error, mode });
  }
}

export async function runRetrievalModeComparison({
  cases = retrievalEvalCases,
  curricula,
  modes = evaluationModes,
}: {
  cases?: RetrievalEvalCase[];
  curricula: CurriculumPack[];
  modes?: CurriculumRetrievalMode[];
}): Promise<RetrievalModeComparisonSummary> {
  const summaries = await Promise.all(
    modes.map((mode) =>
      runRetrievalEvaluationForMode({
        cases,
        curricula,
        mode,
      }),
    ),
  );
  const bestMode = summaries
    .filter((summary) => !summary.error)
    .sort((a, b) => {
      if (b.passRate !== a.passRate) {
        return b.passRate - a.passRate;
      }

      return b.meanReciprocalRank - a.meanReciprocalRank;
    })[0]?.mode;

  return {
    bestMode,
    modes: summaries,
  };
}
