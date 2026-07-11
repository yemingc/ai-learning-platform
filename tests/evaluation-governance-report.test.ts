import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEvaluationGovernanceReport,
  EVALUATION_GOVERNANCE_REPORT_SCHEMA_VERSION,
  renderEvaluationGovernanceMarkdown,
  type DeterministicEvaluationReportInput,
  type PersistedEvaluationReportInput,
} from "../src/features/ai-teacher/evaluation/evaluation-governance-report.ts";
import { buildEvaluationTrendReport } from "../src/features/ai-teacher/evaluation/evaluation-trends.ts";
import { buildHumanEvaluationCalibrationReport } from "../src/features/ai-teacher/evaluation/human-evaluation-calibration.ts";

const deterministic: DeterministicEvaluationReportInput = {
  averageScore: 100,
  dimensionScores: {
    safety: { passedChecks: 2, score: 100, totalChecks: 2 },
  },
  passedCases: 1,
  results: [
    {
      caseId: "safe-case",
      checks: [
        {
          detail: "No private value leaked.",
          dimension: "safety",
          id: "privacy",
          label: "Privacy",
          passed: true,
        },
      ],
      passed: true,
      score: 100,
      title: "Synthetic privacy case",
    },
  ],
  totalCases: 1,
};

function liveEvaluation(
  overrides: Partial<PersistedEvaluationReportInput> = {},
): PersistedEvaluationReportInput {
  return {
    averageScore: 95,
    completedAt: "2026-07-11T12:01:00.000Z",
    completionTokens: 100,
    createdAt: "2026-07-11T12:01:00.000Z",
    dimensionScores: {
      safety: { passedChecks: 2, score: 100, totalChecks: 2 },
    },
    durationMs: 60_000,
    estimatedCostMicroUsd: 5_000,
    id: "live-1",
    mode: "live_model",
    models: "deepseek-v4-pro",
    passedCases: 1,
    pricingVersion: "pricing-v1",
    promptTokens: 1_000,
    promptVersion: "teacher-v5",
    releaseGate: {
      approved: true,
      checks: [],
      policyVersion: "gate-v1",
      pricingVersion: "pricing-v1",
      status: "baseline",
      summary: "approved",
    },
    releaseGateStatus: "baseline",
    startedAt: "2026-07-11T12:00:00.000Z",
    suiteVersion: "suite-v1",
    totalCases: 1,
    totalTokens: 1_100,
    workflowEngine: "langgraph",
    ...overrides,
  };
}

function dashboard(evaluations: PersistedEvaluationReportInput[] = []) {
  return {
    evaluations,
    evaluationTrends: buildEvaluationTrendReport(evaluations),
    humanCalibration: buildHumanEvaluationCalibrationReport([]),
  };
}

test("produces a deterministic-only pass without making a live claim", () => {
  const report = buildEvaluationGovernanceReport({
    dashboard: dashboard(),
    deterministic,
    generatedAt: "2026-07-11T13:00:00.000Z",
    promptVersion: "teacher-v5",
    suiteVersion: "suite-v1",
  });

  assert.equal(report.schemaVersion, EVALUATION_GOVERNANCE_REPORT_SCHEMA_VERSION);
  assert.equal(report.decision.status, "pass");
  assert.equal(report.decision.evidenceLevel, "deterministic_only");
  assert.equal(report.live.available, false);
  assert.equal(report.privacy.assistantMessagesIncluded, false);
  assert.equal(JSON.stringify(report).includes('"assistantMessage":'), false);
});

test("fails closed when live evidence is required but missing", () => {
  const report = buildEvaluationGovernanceReport({
    dashboard: dashboard(),
    deterministic,
    promptVersion: "teacher-v5",
    requirements: { requireHumanCalibration: false, requireLive: true },
    suiteVersion: "suite-v1",
  });

  assert.equal(report.decision.status, "fail");
  assert.equal(report.decision.evidenceLevel, "blocked");
});

test("uses only a matching approved live release gate", () => {
  const report = buildEvaluationGovernanceReport({
    dashboard: dashboard([
      liveEvaluation({ id: "matching" }),
      liveEvaluation({
        createdAt: "2026-07-12T12:00:00.000Z",
        id: "newer-other-suite",
        suiteVersion: "suite-v2",
      }),
    ]),
    deterministic,
    promptVersion: "teacher-v5",
    requirements: { requireHumanCalibration: false, requireLive: true },
    suiteVersion: "suite-v1",
  });

  assert.equal(report.decision.status, "pass");
  assert.equal(report.decision.evidenceLevel, "live_governed");
  assert.equal(report.live.latest?.id, "matching");
});

test("blocks an observed live gate regression even when live is optional", () => {
  const report = buildEvaluationGovernanceReport({
    dashboard: dashboard([
      liveEvaluation({
        releaseGate: {
          approved: false,
          checks: [],
          policyVersion: "gate-v1",
          pricingVersion: "pricing-v1",
          status: "fail",
          summary: "blocked",
        },
        releaseGateStatus: "fail",
      }),
    ]),
    deterministic,
    promptVersion: "teacher-v5",
    suiteVersion: "suite-v1",
  });

  assert.equal(report.decision.status, "fail");
});

test("does not accept human calibration from a different suite version", () => {
  const baseDashboard = dashboard([liveEvaluation()]);
  const report = buildEvaluationGovernanceReport({
    dashboard: {
      ...baseDashboard,
      humanCalibration: {
        ...baseDashboard.humanCalibration,
        reviewCount: 3,
        status: "ready",
        suiteVersion: "suite-v2",
      },
    },
    deterministic,
    promptVersion: "teacher-v5",
    requirements: { requireHumanCalibration: true, requireLive: true },
    suiteVersion: "suite-v1",
  });

  assert.equal(report.decision.status, "fail");
  assert.match(report.decision.reasons.join(" "), /suite-v1/);
});

test("renders a stable privacy-safe Markdown artifact", () => {
  const report = buildEvaluationGovernanceReport({
    dashboard: dashboard(),
    deterministic,
    generatedAt: "2026-07-11T13:00:00.000Z",
    promptVersion: "teacher-v5",
    suiteVersion: "suite-v1",
  });
  const markdown = renderEvaluationGovernanceMarkdown(report);

  assert.match(markdown, /^# AI Evaluation Governance Report/m);
  assert.match(markdown, /Decision: \*\*PASS\*\*/);
  assert.match(markdown, /No live evaluation exists/);
  assert.doesNotMatch(markdown, /assistantMessage/);
});
