import { performance } from "node:perf_hooks";
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
import { getMinimumRetrievalScore } from "@/features/rag/retrieval-policy";
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
  forbiddenRank,
  matchingRank,
  resultCount,
  testCase,
}: {
  forbiddenRank?: number;
  matchingRank?: number;
  resultCount: number;
  testCase: RetrievalEvalCase;
}) {
  if (testCase.expectedOutcome === "no_match") {
    return `Expected no reliable match, but retrieval returned ${resultCount} accepted result(s).`;
  }

  if (forbiddenRank && (!matchingRank || forbiddenRank < matchingRank)) {
    return `A known distractor ranked ${forbiddenRank}, ahead of the expected evidence.`;
  }

  if (!matchingRank) {
    return "No retrieved chunk matched the expected concept, section type, and required text.";
  }

  return `Best matching chunk ranked ${matchingRank}, which is lower than required top-${testCase.maxRank}.`;
}

function createResultFromPreview({
  durationMs,
  results,
  testCase,
}: {
  durationMs: number;
  results: CurriculumRetrievalResult[];
  testCase: RetrievalEvalCase;
}): RetrievalEvalResult {
  const matchingIndex = results.findIndex((result) =>
    resultMatchesCase(result, testCase),
  );
  const matchingRank = matchingIndex >= 0 ? matchingIndex + 1 : undefined;
  const forbiddenIndex = results.findIndex((result) =>
    testCase.forbiddenConceptIds?.includes(result.conceptId),
  );
  const forbiddenRank = forbiddenIndex >= 0 ? forbiddenIndex + 1 : undefined;
  const expectedOutcome = testCase.expectedOutcome ?? "match";
  const distractorRankedAhead = Boolean(
    forbiddenRank && (!matchingRank || forbiddenRank < matchingRank),
  );
  const passed =
    expectedOutcome === "no_match"
      ? results.length === 0
      : Boolean(
          matchingRank &&
            matchingRank <= testCase.maxRank &&
            !distractorRankedAhead,
        );

  return {
    caseId: testCase.id,
    description: testCase.description,
    durationMs,
    expectedConceptIds: testCase.expectedConceptIds,
    expectedOutcome,
    expectedSectionTypes: testCase.expectedSectionTypes,
    failureReason: passed
      ? undefined
      : getFailureReason({
          forbiddenRank,
          matchingRank,
          resultCount: results.length,
          testCase,
        }),
    forbiddenRank,
    locale: testCase.locale,
    passed,
    query: testCase.query,
    reciprocalRank:
      expectedOutcome === "match" && matchingRank ? 1 / matchingRank : 0,
    topRank: matchingRank,
    topResults: results.slice(0, 8).map((result) => ({
      conceptId: result.conceptId,
      id: result.id,
      locale: result.locale,
      score: result.score,
      scoreBreakdown: result.scoreBreakdown,
      sectionType: result.sectionType,
      sourceLabel: result.sourceLabel,
      title: result.title,
    })),
  };
}

function getPercentileDuration(durations: number[], percentile: number) {
  if (!durations.length) {
    return 0;
  }

  const sortedDurations = [...durations].sort((a, b) => a - b);
  const index = Math.min(
    sortedDurations.length - 1,
    Math.ceil(sortedDurations.length * percentile) - 1,
  );

  return sortedDurations[index] ?? 0;
}

function summarizeResults({
  mode,
  results,
}: {
  mode?: CurriculumRetrievalMode;
  results: RetrievalEvalResult[];
}): RetrievalEvalSummary {
  const passedCases = results.filter((result) => result.passed).length;
  const positiveResults = results.filter(
    (result) => result.expectedOutcome === "match",
  );
  const negativeResults = results.filter(
    (result) => result.expectedOutcome === "no_match",
  );
  const topOneHits = positiveResults.filter(
    (result) => result.topRank === 1,
  ).length;
  const topThreeHits = positiveResults.filter(
    (result) => result.topRank !== undefined && result.topRank <= 3,
  ).length;
  const recallAtEightHits = positiveResults.filter(
    (result) => result.topRank !== undefined && result.topRank <= 8,
  ).length;
  const noMatchCorrect = negativeResults.filter((result) => result.passed).length;
  const meanReciprocalRank =
    positiveResults.length > 0
      ? positiveResults.reduce(
          (sum, result) => sum + result.reciprocalRank,
          0,
        ) / positiveResults.length
      : 0;
  const durations = results.map((result) => result.durationMs);

  return {
    failedCases: results.length - passedCases,
    falsePositiveRate:
      negativeResults.length > 0
        ? (negativeResults.length - noMatchCorrect) / negativeResults.length
        : 0,
    meanReciprocalRank,
    medianDurationMs: getPercentileDuration(durations, 0.5),
    mode,
    negativeCases: negativeResults.length,
    noMatchAccuracy:
      negativeResults.length > 0 ? noMatchCorrect / negativeResults.length : 1,
    noMatchCorrect,
    passRate: results.length > 0 ? passedCases / results.length : 0,
    passedCases,
    p95DurationMs: getPercentileDuration(durations, 0.95),
    positiveCases: positiveResults.length,
    recallAtEightHits,
    recallAtEightRate:
      positiveResults.length > 0
        ? recallAtEightHits / positiveResults.length
        : 0,
    results,
    topOneHitRate:
      positiveResults.length > 0 ? topOneHits / positiveResults.length : 0,
    topOneHits,
    topThreeHitRate:
      positiveResults.length > 0 ? topThreeHits / positiveResults.length : 0,
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
  const positiveCases = cases.filter(
    (testCase) => testCase.expectedOutcome !== "no_match",
  ).length;
  const negativeCases = cases.length - positiveCases;

  return {
    error: message,
    failedCases: cases.length,
    falsePositiveRate: negativeCases > 0 ? 1 : 0,
    meanReciprocalRank: 0,
    medianDurationMs: 0,
    mode,
    negativeCases,
    noMatchAccuracy: negativeCases > 0 ? 0 : 1,
    noMatchCorrect: 0,
    passRate: 0,
    passedCases: 0,
    p95DurationMs: 0,
    positiveCases,
    recallAtEightHits: 0,
    recallAtEightRate: 0,
    results: cases.map((testCase) => ({
      caseId: testCase.id,
      description: testCase.description,
      durationMs: 0,
      expectedConceptIds: testCase.expectedConceptIds,
      expectedOutcome: testCase.expectedOutcome ?? "match",
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
    const startedAt = performance.now();
    const retrievalPreview = searchCurriculumChunks({
      curricula,
      query: {
        courseId: testCase.courseId,
        limit: 8,
        locale: testCase.locale,
        minimumScore: getMinimumRetrievalScore("keyword"),
        query: testCase.query,
        unitId: testCase.unitId,
      },
    });
    const durationMs = performance.now() - startedAt;

    return createResultFromPreview({
      durationMs,
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
      const startedAt = performance.now();
      const retrievalPreview = await searchCurriculumWithMode({
        curricula,
        mode,
        query: {
          courseId: testCase.courseId,
          limit: 8,
          locale: testCase.locale,
          query: testCase.query,
          unitId: testCase.unitId,
        },
      });
      const durationMs = performance.now() - startedAt;

      results.push(
        createResultFromPreview({
          durationMs,
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

      if (b.noMatchAccuracy !== a.noMatchAccuracy) {
        return b.noMatchAccuracy - a.noMatchAccuracy;
      }

      if (b.topThreeHitRate !== a.topThreeHitRate) {
        return b.topThreeHitRate - a.topThreeHitRate;
      }

      if (b.meanReciprocalRank !== a.meanReciprocalRank) {
        return b.meanReciprocalRank - a.meanReciprocalRank;
      }

      return a.p95DurationMs - b.p95DurationMs;
    })[0]?.mode;

  return {
    bestMode,
    modes: summaries,
  };
}
