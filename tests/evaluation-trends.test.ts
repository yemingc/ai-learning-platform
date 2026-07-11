import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEvaluationTrendReport,
  type EvaluationTrendRunInput,
} from "../src/features/ai-teacher/evaluation/evaluation-trends.ts";

function evaluation(
  overrides: Partial<EvaluationTrendRunInput> & Pick<EvaluationTrendRunInput, "id" | "createdAt">,
): EvaluationTrendRunInput {
  return {
    averageScore: 90,
    dimensionScores: {
      safety: { passedChecks: 2, score: 100, totalChecks: 2 },
    },
    durationMs: 10_000,
    estimatedCostMicroUsd: 100_000,
    models: "deepseek-v4-pro",
    passedCases: 9,
    promptVersion: "teacher-v5",
    releaseGateStatus: "pass",
    suiteVersion: "suite-v2",
    totalCases: 10,
    ...overrides,
  };
}

test("builds chronological quality, dimension, cost, and latency trends", () => {
  const report = buildEvaluationTrendReport([
    evaluation({
      averageScore: 94,
      createdAt: "2026-07-11T12:00:00.000Z",
      durationMs: 8_000,
      estimatedCostMicroUsd: 90_000,
      id: "new",
      passedCases: 10,
    }),
    evaluation({
      averageScore: 90,
      createdAt: "2026-07-10T12:00:00.000Z",
      id: "old",
    }),
  ]);

  assert.equal(report.status, "ready");
  assert.deepEqual(report.runs.map((run) => run.id), ["old", "new"]);
  assert.equal(report.qualitySeries[0].delta, 4);
  assert.equal(report.qualitySeries[1].latest, 100);
  assert.equal(
    report.qualitySeries.find((series) => series.key === "dimension:safety")
      ?.latest,
    100,
  );
  assert.equal(report.operationalSeries[0].latest, 0.009);
  assert.equal(report.operationalSeries[1].direction, "down");
});

test("compares only the newest evaluation suite version", () => {
  const report = buildEvaluationTrendReport([
    evaluation({
      createdAt: "2026-07-11T12:00:00.000Z",
      id: "v2",
      suiteVersion: "suite-v2",
    }),
    evaluation({
      averageScore: 10,
      createdAt: "2026-07-12T12:00:00.000Z",
      id: "legacy-no-version",
      suiteVersion: null,
    }),
    evaluation({
      createdAt: "2026-07-10T12:00:00.000Z",
      id: "v1",
      suiteVersion: "suite-v1",
    }),
  ]);

  assert.equal(report.suiteVersion, "suite-v2");
  assert.equal(report.comparableRuns, 1);
  assert.equal(report.excludedRuns, 2);
  assert.equal(report.status, "single_run");
});

test("returns an honest empty state without versioned live evaluations", () => {
  const report = buildEvaluationTrendReport([]);

  assert.equal(report.status, "no_data");
  assert.deepEqual(report.qualitySeries, []);
  assert.deepEqual(report.operationalSeries, []);
});
