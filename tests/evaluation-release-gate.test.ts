import assert from "node:assert/strict";
import test from "node:test";
import {
  DEEPSEEK_PRICING_SNAPSHOT,
  estimateEvaluationCost,
  evaluateReleaseGate,
} from "../src/features/ai-teacher/evaluation/release-gate.ts";

const passingDimensionScores = {
  contract: 100,
  grounding: 95,
  localization: 90,
  pedagogy: 90,
  safety: 100,
  workflow: 100,
};

test("estimates DeepSeek evaluation cost with a versioned conservative price", () => {
  const estimate = estimateEvaluationCost([
    {
      completionTokens: 2_000,
      model: "deepseek-v4-pro",
      promptTokens: 10_000,
    },
  ]);

  assert.equal(estimate.pricingVersion, DEEPSEEK_PRICING_SNAPSHOT.version);
  assert.equal(estimate.estimatedCostMicroUsd, 6_090);
  assert.equal(estimate.promptTokens, 10_000);
  assert.equal(estimate.completionTokens, 2_000);
  assert.deepEqual(estimate.issues, []);
});

test("refuses to invent a cost for unknown models or missing token data", () => {
  const estimate = estimateEvaluationCost([
    { model: "unknown-model", promptTokens: 100, completionTokens: 20 },
    { model: "deepseek-v4-pro", promptTokens: 100 },
  ]);

  assert.equal(estimate.estimatedCostMicroUsd, undefined);
  assert.equal(estimate.issues.length, 2);
});

test("treats an evaluation without model telemetry as unpriced", () => {
  const estimate = estimateEvaluationCost([]);

  assert.equal(estimate.estimatedCostMicroUsd, undefined);
  assert.deepEqual(estimate.issues, [
    "No model token telemetry was captured for the evaluation.",
  ]);
});

test("establishes the first run as a baseline only after absolute gates pass", () => {
  const gate = evaluateReleaseGate({
    candidate: {
      averageScore: 91,
      dimensionScores: passingDimensionScores,
      estimatedCostMicroUsd: 50_000,
      passedCases: 10,
      totalCases: 10,
    },
  });

  assert.equal(gate.status, "baseline");
  assert.equal(gate.approved, true);
  assert.equal(gate.baselineRunId, undefined);
});

test("passes a candidate that stays within quality and cost regression budgets", () => {
  const gate = evaluateReleaseGate({
    baseline: {
      averageScore: 91,
      estimatedCostMicroUsd: 50_000,
      id: "baseline-1",
      passedCases: 10,
      totalCases: 10,
    },
    candidate: {
      averageScore: 90,
      dimensionScores: passingDimensionScores,
      estimatedCostMicroUsd: 55_000,
      id: "candidate-1",
      passedCases: 10,
      totalCases: 10,
    },
  });

  assert.equal(gate.status, "pass");
  assert.equal(gate.approved, true);
  assert.equal(gate.baselineRunId, "baseline-1");
});

test("fails a quality regression even when absolute quality remains high", () => {
  const gate = evaluateReleaseGate({
    baseline: {
      averageScore: 95,
      estimatedCostMicroUsd: 50_000,
      id: "baseline-1",
      passedCases: 10,
      totalCases: 10,
    },
    candidate: {
      averageScore: 90,
      dimensionScores: passingDimensionScores,
      estimatedCostMicroUsd: 55_000,
      passedCases: 10,
      totalCases: 10,
    },
  });

  assert.equal(gate.status, "fail");
  assert.equal(gate.approved, false);
  assert.equal(
    gate.checks.find((check) => check.id === "average_score_regression")
      ?.passed,
    false,
  );
});

test("blocks a decision when cost evidence is incomplete", () => {
  const gate = evaluateReleaseGate({
    candidate: {
      averageScore: 95,
      dimensionScores: passingDimensionScores,
      passedCases: 10,
      totalCases: 10,
    },
    costIssues: ["Missing completion token usage."],
  });

  assert.equal(gate.status, "insufficient_data");
  assert.equal(gate.approved, false);
});

test("does not compare a candidate with an incomplete baseline case set", () => {
  const gate = evaluateReleaseGate({
    baseline: {
      averageScore: 90,
      estimatedCostMicroUsd: 50_000,
      id: "baseline-1",
      passedCases: 10,
      totalCases: 10,
    },
    candidate: {
      averageScore: 95,
      dimensionScores: passingDimensionScores,
      estimatedCostMicroUsd: 40_000,
      passedCases: 9,
      totalCases: 9,
    },
  });

  assert.equal(gate.status, "insufficient_data");
  assert.equal(
    gate.checks.find((check) => check.id === "complete_case_set")?.passed,
    false,
  );
});

test("blocks a high average score when the safety dimension regresses", () => {
  const gate = evaluateReleaseGate({
    candidate: {
      averageScore: 96,
      dimensionScores: { ...passingDimensionScores, safety: 75 },
      estimatedCostMicroUsd: 50_000,
      passedCases: 10,
      totalCases: 10,
    },
  });

  assert.equal(gate.status, "fail");
  assert.equal(gate.approved, false);
  assert.equal(
    gate.checks.find((check) => check.id === "minimum_dimension_safety")
      ?.passed,
    false,
  );
});
