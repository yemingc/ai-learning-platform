import type { CurriculumPack } from "@/curricula/types";
import type {
  RetrievalEvalCase,
  RetrievalEvalResult,
  RetrievalEvalSummary,
} from "@/features/rag/evaluation/eval-types";
import { retrievalEvalCases } from "@/features/rag/evaluation/eval-cases";
import { searchCurriculumChunks } from "@/features/rag/curriculum-retriever";

function resultMatchesCase(
  result: ReturnType<typeof searchCurriculumChunks>["results"][number],
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
    const matchingIndex = retrievalPreview.results.findIndex((result) =>
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
      topResults: retrievalPreview.results.slice(0, 5).map((result) => ({
        conceptId: result.conceptId,
        id: result.id,
        locale: result.locale,
        score: result.score,
        sectionType: result.sectionType,
        sourceLabel: result.sourceLabel,
        title: result.title,
      })),
    };
  });
  const passedCases = results.filter((result) => result.passed).length;
  const meanReciprocalRank =
    results.length > 0
      ? results.reduce((sum, result) => sum + result.reciprocalRank, 0) /
        results.length
      : 0;

  return {
    failedCases: results.length - passedCases,
    meanReciprocalRank,
    passRate: results.length > 0 ? passedCases / results.length : 0,
    passedCases,
    results,
    totalCases: results.length,
  };
}
