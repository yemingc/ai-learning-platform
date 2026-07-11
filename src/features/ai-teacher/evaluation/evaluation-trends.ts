export type EvaluationTrendRunInput = {
  id: string;
  createdAt: string;
  suiteVersion: string | null;
  promptVersion: string | null;
  models: string | null;
  totalCases: number;
  passedCases: number;
  averageScore: number;
  estimatedCostMicroUsd: number | null;
  durationMs: number;
  releaseGateStatus: string | null;
  dimensionScores?: Record<
    string,
    { score: number | null; passedChecks: number; totalChecks: number }
  >;
};

export type EvaluationTrendPoint = {
  runId: string;
  createdAt: string;
  value: number;
};

export type EvaluationTrendSeries = {
  key: string;
  label: string;
  kind: "quality" | "cost" | "latency";
  unit: "percent" | "usd" | "milliseconds";
  points: EvaluationTrendPoint[];
  latest?: number;
  delta?: number;
  direction: "up" | "down" | "flat" | "not_enough_data";
};

export type EvaluationTrendRun = {
  id: string;
  createdAt: string;
  promptVersion: string | null;
  models: string | null;
  releaseGateStatus: string | null;
};

export type EvaluationTrendReport = {
  status: "no_data" | "single_run" | "ready";
  suiteVersion?: string;
  comparableRuns: number;
  excludedRuns: number;
  runs: EvaluationTrendRun[];
  qualitySeries: EvaluationTrendSeries[];
  operationalSeries: EvaluationTrendSeries[];
};

const dimensionLabels: Record<string, string> = {
  contract: "Contract",
  pedagogy: "Pedagogy",
  grounding: "Grounding",
  safety: "Safety",
  localization: "Localization",
  workflow: "Workflow",
};

function getDirection(points: EvaluationTrendPoint[]) {
  if (points.length < 2) {
    return "not_enough_data" as const;
  }

  const delta = points.at(-1)!.value - points[0].value;

  if (Math.abs(delta) < 0.000001) {
    return "flat" as const;
  }

  return delta > 0 ? ("up" as const) : ("down" as const);
}

function createSeries({
  key,
  kind,
  label,
  points,
  unit,
}: Pick<
  EvaluationTrendSeries,
  "key" | "kind" | "label" | "points" | "unit"
>): EvaluationTrendSeries {
  const latest = points.at(-1)?.value;

  return {
    delta:
      points.length >= 2 && latest !== undefined
        ? latest - points[0].value
        : undefined,
    direction: getDirection(points),
    key,
    kind,
    label,
    latest,
    points,
    unit,
  };
}

function isValidDate(value: string) {
  return Number.isFinite(Date.parse(value));
}

export function buildEvaluationTrendReport(
  evaluations: EvaluationTrendRunInput[],
): EvaluationTrendReport {
  const newestVersionedRun = evaluations
    .filter((evaluation) => evaluation.suiteVersion && isValidDate(evaluation.createdAt))
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0];

  if (!newestVersionedRun?.suiteVersion) {
    return {
      comparableRuns: 0,
      excludedRuns: evaluations.length,
      operationalSeries: [],
      qualitySeries: [],
      runs: [],
      status: "no_data",
    };
  }

  const comparable = evaluations
    .filter(
      (evaluation) =>
        evaluation.suiteVersion === newestVersionedRun.suiteVersion &&
        isValidDate(evaluation.createdAt),
    )
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
  const pointFrom = (
    evaluation: EvaluationTrendRunInput,
    value: number,
  ): EvaluationTrendPoint => ({
    createdAt: evaluation.createdAt,
    runId: evaluation.id,
    value,
  });
  const averageScorePoints = comparable.map((evaluation) =>
    pointFrom(evaluation, evaluation.averageScore),
  );
  const passRatePoints = comparable.map((evaluation) =>
    pointFrom(
      evaluation,
      evaluation.totalCases > 0
        ? (evaluation.passedCases / evaluation.totalCases) * 100
        : 0,
    ),
  );
  const dimensionKeys = Array.from(
    new Set(
      comparable.flatMap((evaluation) =>
        Object.keys(evaluation.dimensionScores ?? {}),
      ),
    ),
  );
  const dimensionSeries = dimensionKeys
    .map((dimension) =>
      createSeries({
        key: `dimension:${dimension}`,
        kind: "quality",
        label: dimensionLabels[dimension] ?? dimension,
        points: comparable.flatMap((evaluation) => {
          const score = evaluation.dimensionScores?.[dimension]?.score;

          return score === null || score === undefined
            ? []
            : [pointFrom(evaluation, score)];
        }),
        unit: "percent",
      }),
    )
    .filter((series) => series.points.length > 0);
  const costPoints = comparable.flatMap((evaluation) => {
    if (
      evaluation.estimatedCostMicroUsd === null ||
      evaluation.totalCases <= 0
    ) {
      return [];
    }

    return [
      pointFrom(
        evaluation,
        evaluation.estimatedCostMicroUsd /
          evaluation.totalCases /
          1_000_000,
      ),
    ];
  });
  const latencyPoints = comparable.map((evaluation) =>
    pointFrom(evaluation, evaluation.durationMs),
  );

  return {
    comparableRuns: comparable.length,
    excludedRuns: evaluations.length - comparable.length,
    operationalSeries: [
      createSeries({
        key: "cost_per_case",
        kind: "cost",
        label: "Estimated cost / case",
        points: costPoints,
        unit: "usd",
      }),
      createSeries({
        key: "suite_latency",
        kind: "latency",
        label: "Suite latency",
        points: latencyPoints,
        unit: "milliseconds",
      }),
    ],
    qualitySeries: [
      createSeries({
        key: "average_score",
        kind: "quality",
        label: "Average score",
        points: averageScorePoints,
        unit: "percent",
      }),
      createSeries({
        key: "pass_rate",
        kind: "quality",
        label: "Case pass rate",
        points: passRatePoints,
        unit: "percent",
      }),
      ...dimensionSeries,
    ],
    runs: comparable.map((evaluation) => ({
      createdAt: evaluation.createdAt,
      id: evaluation.id,
      models: evaluation.models,
      promptVersion: evaluation.promptVersion,
      releaseGateStatus: evaluation.releaseGateStatus,
    })),
    status: comparable.length >= 2 ? "ready" : "single_run",
    suiteVersion: newestVersionedRun.suiteVersion,
  };
}
