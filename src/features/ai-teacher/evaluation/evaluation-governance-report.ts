import type { EvaluationReleaseGate } from "./release-gate.ts";
import type { EvaluationTrendReport } from "./evaluation-trends.ts";
import type { HumanEvaluationCalibrationReport } from "./human-evaluation-calibration.ts";

export const EVALUATION_GOVERNANCE_REPORT_SCHEMA_VERSION =
  "ai-evaluation-governance-report-v1";

export type EvaluationGovernanceRequirements = {
  requireLive: boolean;
  requireHumanCalibration: boolean;
};

type DimensionScore = {
  passedChecks: number;
  totalChecks: number;
  score: number | null;
};

export type DeterministicEvaluationReportInput = {
  totalCases: number;
  passedCases: number;
  averageScore: number;
  dimensionScores: Record<string, DimensionScore>;
  results: Array<{
    caseId: string;
    title: string;
    score: number;
    passed: boolean;
    checks: Array<{
      id: string;
      label: string;
      dimension: string;
      passed: boolean;
      detail: string;
    }>;
  }>;
};

export type PersistedEvaluationReportInput = {
  id: string;
  mode: string;
  workflowEngine: string | null;
  promptVersion: string | null;
  models: string | null;
  totalCases: number;
  passedCases: number;
  averageScore: number;
  totalTokens: number;
  promptTokens: number | null;
  completionTokens: number | null;
  pricingVersion: string | null;
  estimatedCostMicroUsd: number | null;
  releaseGateStatus: string | null;
  releaseGate?: EvaluationReleaseGate;
  suiteVersion: string | null;
  dimensionScores?: Record<string, DimensionScore>;
  durationMs: number;
  startedAt: string;
  completedAt: string;
  createdAt: string;
};

export type EvaluationGovernanceReport = {
  schemaVersion: string;
  generatedAt: string;
  suite: {
    version: string;
    promptVersion: string;
    totalCases: number;
  };
  requirements: EvaluationGovernanceRequirements;
  decision: {
    status: "pass" | "fail";
    evidenceLevel:
      | "blocked"
      | "deterministic_only"
      | "live_governed"
      | "human_calibrated_live";
    reasons: string[];
    checks: Array<{
      id:
        | "deterministic_suite"
        | "live_evaluation"
        | "live_release_gate"
        | "human_calibration";
      blocking: boolean;
      passed: boolean;
      detail: string;
    }>;
  };
  deterministic: {
    totalCases: number;
    passedCases: number;
    averageScore: number;
    dimensionScores: Record<string, DimensionScore>;
    cases: Array<{
      id: string;
      title: string;
      score: number;
      passed: boolean;
      checks: Array<{
        id: string;
        label: string;
        dimension: string;
        passed: boolean;
        detail: string;
      }>;
    }>;
  };
  live: {
    available: boolean;
    latest?: PersistedEvaluationReportInput;
    trends: EvaluationTrendReport;
  };
  humanCalibration: HumanEvaluationCalibrationReport;
  privacy: {
    assistantMessagesIncluded: false;
    learnerIdentifiersIncluded: false;
    humanReviewNotesIncluded: false;
    statement: string;
  };
};

function getLatestMatchingEvaluation(
  evaluations: PersistedEvaluationReportInput[],
  suiteVersion: string,
) {
  return evaluations
    .filter(
      (evaluation) =>
        evaluation.suiteVersion === suiteVersion &&
        Number.isFinite(Date.parse(evaluation.createdAt)),
    )
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0];
}

export function buildEvaluationGovernanceReport({
  dashboard,
  deterministic,
  generatedAt = new Date().toISOString(),
  promptVersion,
  requirements = {
    requireHumanCalibration: false,
    requireLive: false,
  },
  suiteVersion,
}: {
  dashboard: {
    evaluations: PersistedEvaluationReportInput[];
    evaluationTrends: EvaluationTrendReport;
    humanCalibration: HumanEvaluationCalibrationReport;
  };
  deterministic: DeterministicEvaluationReportInput;
  generatedAt?: string;
  promptVersion: string;
  requirements?: EvaluationGovernanceRequirements;
  suiteVersion: string;
}): EvaluationGovernanceReport {
  const latestLive = getLatestMatchingEvaluation(
    dashboard.evaluations,
    suiteVersion,
  );
  const deterministicPassed =
    deterministic.totalCases > 0 &&
    deterministic.passedCases === deterministic.totalCases &&
    deterministic.results.every((result) => result.passed);
  const hasLive = Boolean(latestLive);
  const liveGatePassed = latestLive?.releaseGate?.approved === true;
  const humanCalibrationReady =
    dashboard.humanCalibration.status === "ready" &&
    dashboard.humanCalibration.suiteVersion === suiteVersion;
  const checks: EvaluationGovernanceReport["decision"]["checks"] = [
    {
      blocking: true,
      detail: deterministicPassed
        ? `${deterministic.passedCases}/${deterministic.totalCases} deterministic cases passed.`
        : `${deterministic.passedCases}/${deterministic.totalCases} deterministic cases passed; every case is required.`,
      id: "deterministic_suite",
      passed: deterministicPassed,
    },
    {
      blocking: requirements.requireLive,
      detail: hasLive
        ? `Latest matching live run is ${latestLive!.id}.`
        : requirements.requireLive
          ? `No live run exists for suite ${suiteVersion}.`
          : "Live evidence is optional for this report invocation.",
      id: "live_evaluation",
      passed: hasLive || !requirements.requireLive,
    },
    {
      blocking: hasLive,
      detail: hasLive
        ? liveGatePassed
          ? `Live release gate status is ${latestLive!.releaseGateStatus ?? "approved"}.`
          : `Latest live run has no approved release gate (${latestLive!.releaseGateStatus ?? "missing"}).`
        : "No live run exists, so no live gate decision is claimed.",
      id: "live_release_gate",
      passed: !hasLive || liveGatePassed,
    },
    {
      blocking: requirements.requireHumanCalibration,
      detail: humanCalibrationReady
        ? `${dashboard.humanCalibration.reviewCount} distinct runs have human reviews.`
        : requirements.requireHumanCalibration
          ? `Human calibration is ${dashboard.humanCalibration.status} for ${dashboard.humanCalibration.suiteVersion ?? "an unscoped suite"}; ${dashboard.humanCalibration.minimumReviewedRuns} reviewed runs for ${suiteVersion} are required.`
          : `Human calibration is optional and currently ${dashboard.humanCalibration.status}.`,
      id: "human_calibration",
      passed: humanCalibrationReady || !requirements.requireHumanCalibration,
    },
  ];
  const blockingFailures = checks.filter(
    (check) => check.blocking && !check.passed,
  );
  const status = blockingFailures.length === 0 ? "pass" : "fail";
  const evidenceLevel: EvaluationGovernanceReport["decision"]["evidenceLevel"] =
    status === "fail"
      ? "blocked"
      : liveGatePassed && humanCalibrationReady
        ? "human_calibrated_live"
        : liveGatePassed
          ? "live_governed"
          : "deterministic_only";

  return {
    decision: {
      checks,
      evidenceLevel,
      reasons:
        blockingFailures.length > 0
          ? blockingFailures.map((check) => check.detail)
          : [
              evidenceLevel === "deterministic_only"
                ? "Deterministic checks passed; no live-model release claim is made."
                : "All required evaluation governance checks passed.",
            ],
      status,
    },
    deterministic: {
      averageScore: deterministic.averageScore,
      cases: deterministic.results.map((result) => ({
        checks: result.checks.map((check) => ({
          detail: check.detail,
          dimension: check.dimension,
          id: check.id,
          label: check.label,
          passed: check.passed,
        })),
        id: result.caseId,
        passed: result.passed,
        score: result.score,
        title: result.title,
      })),
      dimensionScores: deterministic.dimensionScores,
      passedCases: deterministic.passedCases,
      totalCases: deterministic.totalCases,
    },
    generatedAt,
    humanCalibration: dashboard.humanCalibration,
    live: {
      available: hasLive,
      latest: latestLive,
      trends: dashboard.evaluationTrends,
    },
    privacy: {
      assistantMessagesIncluded: false,
      humanReviewNotesIncluded: false,
      learnerIdentifiersIncluded: false,
      statement:
        "This artifact contains aggregate evaluation governance metadata only; model response text, learner identifiers, and human-review note bodies are excluded.",
    },
    requirements,
    schemaVersion: EVALUATION_GOVERNANCE_REPORT_SCHEMA_VERSION,
    suite: {
      promptVersion,
      totalCases: deterministic.totalCases,
      version: suiteVersion,
    },
  };
}

function escapeMarkdown(value: string | number | null | undefined) {
  return String(value ?? "—")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
}

function formatPercent(value: number | undefined) {
  return value === undefined ? "—" : `${value.toFixed(1)}%`;
}

export function renderEvaluationGovernanceMarkdown(
  report: EvaluationGovernanceReport,
) {
  const dimensionRows = Object.entries(
    report.deterministic.dimensionScores,
  ).map(
    ([dimension, score]) =>
      `| ${escapeMarkdown(dimension)} | ${score.score === null ? "not run" : `${score.score}%`} | ${score.passedChecks}/${score.totalChecks} |`,
  );
  const caseRows = report.deterministic.cases.map(
    (testCase) =>
      `| ${escapeMarkdown(testCase.id)} | ${testCase.score}% | ${testCase.passed ? "pass" : "fail"} |`,
  );
  const decisionRows = report.decision.checks.map(
    (check) =>
      `| ${escapeMarkdown(check.id)} | ${check.blocking ? "yes" : "no"} | ${check.passed ? "pass" : "fail"} | ${escapeMarkdown(check.detail)} |`,
  );
  const latest = report.live.latest;

  return [
    "# AI Evaluation Governance Report",
    "",
    `- Schema: \`${report.schemaVersion}\``,
    `- Generated: ${report.generatedAt}`,
    `- Suite: \`${report.suite.version}\``,
    `- Prompt: \`${report.suite.promptVersion}\``,
    `- Decision: **${report.decision.status.toUpperCase()}**`,
    `- Evidence level: \`${report.decision.evidenceLevel}\``,
    "",
    "## Governance checks",
    "",
    "| Check | Blocking | Result | Detail |",
    "| --- | --- | --- | --- |",
    ...decisionRows,
    "",
    "## Deterministic suite",
    "",
    `- Cases: ${report.deterministic.passedCases}/${report.deterministic.totalCases}`,
    `- Average score: ${report.deterministic.averageScore}%`,
    "",
    "| Dimension | Score | Checks |",
    "| --- | ---: | ---: |",
    ...dimensionRows,
    "",
    "| Case | Score | Result |",
    "| --- | ---: | --- |",
    ...caseRows,
    "",
    "## Latest matching live evaluation",
    "",
    latest
      ? `- Run: \`${latest.id}\`\n- Model: \`${latest.models ?? "unknown"}\`\n- Prompt: \`${latest.promptVersion ?? "unknown"}\`\n- Release gate: **${latest.releaseGateStatus ?? "missing"}**\n- Estimated cost: ${latest.estimatedCostMicroUsd === null ? "unavailable" : `$${(latest.estimatedCostMicroUsd / 1_000_000).toFixed(6)}`}`
      : "No live evaluation exists for this suite version.",
    "",
    "## Human calibration",
    "",
    `- Status: \`${report.humanCalibration.status}\``,
    `- Reviewed runs: ${report.humanCalibration.reviewCount}/${report.humanCalibration.minimumReviewedRuns}`,
    `- Comparisons: ${report.humanCalibration.comparisonCount}`,
    `- Mean absolute error: ${report.humanCalibration.meanAbsoluteError ?? "—"}`,
    `- Agreement: ${formatPercent(report.humanCalibration.agreementRate)}`,
    "",
    "## Privacy",
    "",
    report.privacy.statement,
    "",
  ].join("\n");
}
