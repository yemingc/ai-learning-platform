import assert from "node:assert/strict";
import test from "node:test";
import {
  buildHumanEvaluationCalibrationReport,
  HUMAN_EVALUATION_RUBRIC_VERSION,
  normalizeHumanEvaluationRating,
  type HumanEvaluationCalibrationInput,
} from "../src/features/ai-teacher/evaluation/human-evaluation-calibration.ts";

function review(
  overrides: Partial<HumanEvaluationCalibrationInput> &
    Pick<HumanEvaluationCalibrationInput, "id" | "evaluationRunId" | "createdAt">,
): HumanEvaluationCalibrationInput {
  return {
    automatedDimensionScores: {
      grounding: 80,
      localization: 50,
      pedagogy: 90,
      safety: 100,
    },
    models: "deepseek-v4-pro",
    notePresent: false,
    promptVersion: "teacher-v5",
    ratings: {
      grounding: 4,
      localization: 4,
      pedagogy: 5,
      safety: 5,
    },
    reviewerLabel: "reviewer-a",
    rubricVersion: HUMAN_EVALUATION_RUBRIC_VERSION,
    suiteVersion: "suite-v2",
    ...overrides,
  };
}

test("normalizes the five-point rubric to a reproducible percentage scale", () => {
  assert.equal(normalizeHumanEvaluationRating(1), 0);
  assert.equal(normalizeHumanEvaluationRating(3), 50);
  assert.equal(normalizeHumanEvaluationRating(5), 100);
});

test("calculates per-dimension and overall agreement without claiming calibration early", () => {
  const report = buildHumanEvaluationCalibrationReport(
    [
      review({
        createdAt: "2026-07-11T12:00:00.000Z",
        evaluationRunId: "run-1",
        id: "review-1",
      }),
    ],
    { suiteVersion: "suite-v2" },
  );

  assert.equal(report.status, "insufficient_samples");
  assert.equal(report.reviewCount, 1);
  assert.equal(report.comparisonCount, 4);
  assert.equal(report.meanAbsoluteError, 10);
  assert.equal(report.meanBias, -7.5);
  assert.equal(report.agreementRate, 75);
  assert.equal(
    report.dimensions.find((item) => item.dimension === "localization")
      ?.meanAbsoluteError,
    25,
  );
});

test("becomes ready only after three distinct evaluation runs are reviewed", () => {
  const report = buildHumanEvaluationCalibrationReport(
    [
      review({
        createdAt: "2026-07-11T12:00:00.000Z",
        evaluationRunId: "run-1",
        id: "review-1",
      }),
      review({
        createdAt: "2026-07-12T12:00:00.000Z",
        evaluationRunId: "run-2",
        id: "review-2",
      }),
      review({
        createdAt: "2026-07-13T12:00:00.000Z",
        evaluationRunId: "run-3",
        id: "review-3",
      }),
    ],
    { suiteVersion: "suite-v2" },
  );

  assert.equal(report.status, "ready");
  assert.equal(report.suiteVersion, "suite-v2");
  assert.equal(report.reviewCount, 3);
  assert.equal(report.recentReviews[0].evaluationRunId, "run-3");
});

test("skips automated dimensions that were not executed", () => {
  const report = buildHumanEvaluationCalibrationReport([
    review({
      automatedDimensionScores: {
        grounding: 80,
        localization: null,
        pedagogy: 90,
        safety: 100,
      },
      createdAt: "2026-07-11T12:00:00.000Z",
      evaluationRunId: "run-1",
      id: "review-1",
    }),
  ]);

  assert.equal(report.comparisonCount, 3);
  assert.equal(
    report.dimensions.find((item) => item.dimension === "localization")
      ?.comparisons,
    0,
  );
});

test("returns an honest no-data report", () => {
  const report = buildHumanEvaluationCalibrationReport([]);

  assert.equal(report.status, "no_data");
  assert.equal(report.reviewCount, 0);
  assert.equal(report.meanAbsoluteError, undefined);
});
