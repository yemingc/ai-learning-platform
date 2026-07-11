export const HUMAN_EVALUATION_RUBRIC_VERSION =
  "teacher-human-review-v1";

export const humanEvaluationDimensions = [
  "pedagogy",
  "grounding",
  "safety",
  "localization",
] as const;

export type HumanEvaluationDimension =
  (typeof humanEvaluationDimensions)[number];

export type HumanEvaluationRating = 1 | 2 | 3 | 4 | 5;

export type HumanEvaluationRatings = Record<
  HumanEvaluationDimension,
  HumanEvaluationRating
>;

export type HumanEvaluationCalibrationInput = {
  id: string;
  evaluationRunId: string;
  reviewerLabel: string;
  rubricVersion: string;
  ratings: HumanEvaluationRatings;
  automatedDimensionScores: Partial<
    Record<HumanEvaluationDimension, number | null>
  >;
  suiteVersion: string | null;
  promptVersion: string | null;
  models: string | null;
  notePresent: boolean;
  createdAt: string;
};

export type HumanEvaluationDimensionCalibration = {
  dimension: HumanEvaluationDimension;
  comparisons: number;
  averageHumanScore?: number;
  averageAutomatedScore?: number;
  meanAbsoluteError?: number;
  meanBias?: number;
  agreementRate?: number;
};

export type HumanEvaluationCalibrationReport = {
  status: "no_data" | "insufficient_samples" | "ready";
  rubricVersion: string;
  suiteVersion?: string;
  tolerancePoints: number;
  minimumReviewedRuns: number;
  reviewCount: number;
  comparisonCount: number;
  meanAbsoluteError?: number;
  meanBias?: number;
  agreementRate?: number;
  dimensions: HumanEvaluationDimensionCalibration[];
  recentReviews: Array<{
    id: string;
    evaluationRunId: string;
    reviewerLabel: string;
    rubricVersion: string;
    humanScores: Record<HumanEvaluationDimension, number>;
    suiteVersion: string | null;
    promptVersion: string | null;
    models: string | null;
    notePresent: boolean;
    createdAt: string;
  }>;
};

const DEFAULT_TOLERANCE_POINTS = 20;
const DEFAULT_MINIMUM_REVIEWED_RUNS = 3;

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function normalizeHumanEvaluationRating(
  rating: HumanEvaluationRating,
) {
  return (rating - 1) * 25;
}

function summarizeComparisons(
  comparisons: Array<{ human: number; automated: number }>,
  tolerancePoints: number,
) {
  if (comparisons.length === 0) {
    return {};
  }

  const absoluteErrors = comparisons.map(({ automated, human }) =>
    Math.abs(automated - human),
  );
  const biases = comparisons.map(({ automated, human }) => automated - human);
  const agreements = absoluteErrors.filter(
    (error) => error <= tolerancePoints,
  ).length;

  return {
    agreementRate: roundOne((agreements / comparisons.length) * 100),
    averageAutomatedScore: roundOne(
      comparisons.reduce((sum, item) => sum + item.automated, 0) /
        comparisons.length,
    ),
    averageHumanScore: roundOne(
      comparisons.reduce((sum, item) => sum + item.human, 0) /
        comparisons.length,
    ),
    meanAbsoluteError: roundOne(
      absoluteErrors.reduce((sum, error) => sum + error, 0) /
        absoluteErrors.length,
    ),
    meanBias: roundOne(
      biases.reduce((sum, bias) => sum + bias, 0) / biases.length,
    ),
  };
}

export function buildHumanEvaluationCalibrationReport(
  reviews: HumanEvaluationCalibrationInput[],
  {
    minimumReviewedRuns = DEFAULT_MINIMUM_REVIEWED_RUNS,
    suiteVersion,
    tolerancePoints = DEFAULT_TOLERANCE_POINTS,
  }: {
    minimumReviewedRuns?: number;
    suiteVersion?: string;
    tolerancePoints?: number;
  } = {},
): HumanEvaluationCalibrationReport {
  const validReviews = reviews
    .filter((review) => Number.isFinite(Date.parse(review.createdAt)))
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  const allComparisons: Array<{ human: number; automated: number }> = [];
  const dimensions = humanEvaluationDimensions.map((dimension) => {
    const comparisons = validReviews.flatMap((review) => {
      const automated = review.automatedDimensionScores[dimension];

      if (automated === null || automated === undefined) {
        return [];
      }

      return [
        {
          automated,
          human: normalizeHumanEvaluationRating(review.ratings[dimension]),
        },
      ];
    });

    allComparisons.push(...comparisons);

    return {
      comparisons: comparisons.length,
      dimension,
      ...summarizeComparisons(comparisons, tolerancePoints),
    };
  });
  const overall = summarizeComparisons(allComparisons, tolerancePoints);
  const reviewCount = new Set(
    validReviews.map((review) => review.evaluationRunId),
  ).size;

  return {
    agreementRate: overall.agreementRate,
    comparisonCount: allComparisons.length,
    dimensions,
    meanAbsoluteError: overall.meanAbsoluteError,
    meanBias: overall.meanBias,
    minimumReviewedRuns,
    recentReviews: validReviews.slice(0, 12).map((review) => ({
      createdAt: review.createdAt,
      evaluationRunId: review.evaluationRunId,
      humanScores: Object.fromEntries(
        humanEvaluationDimensions.map((dimension) => [
          dimension,
          normalizeHumanEvaluationRating(review.ratings[dimension]),
        ]),
      ) as Record<HumanEvaluationDimension, number>,
      id: review.id,
      models: review.models,
      notePresent: review.notePresent,
      promptVersion: review.promptVersion,
      reviewerLabel: review.reviewerLabel,
      rubricVersion: review.rubricVersion,
      suiteVersion: review.suiteVersion,
    })),
    reviewCount,
    rubricVersion: HUMAN_EVALUATION_RUBRIC_VERSION,
    status:
      reviewCount === 0
        ? "no_data"
        : reviewCount < minimumReviewedRuns
          ? "insufficient_samples"
          : "ready",
    suiteVersion,
    tolerancePoints,
  };
}
