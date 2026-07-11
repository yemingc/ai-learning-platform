export type ModelTokenUsage = {
  model: string;
  promptTokens?: number;
  completionTokens?: number;
};

export type ModelPrice = {
  inputCacheMissUsdPerMillionTokens: number;
  outputUsdPerMillionTokens: number;
};

export type PricingSnapshot = {
  version: string;
  effectiveDate: string;
  sourceUrl: string;
  estimationBasis: "all_input_tokens_as_cache_miss";
  models: Record<string, ModelPrice>;
};

export type EvaluationCostEstimate = {
  estimatedCostMicroUsd?: number;
  promptTokens: number;
  completionTokens: number;
  pricingVersion: string;
  estimationBasis: PricingSnapshot["estimationBasis"];
  issues: string[];
};

export type EvaluationGateMetrics = {
  id?: string;
  totalCases: number;
  passedCases: number;
  averageScore: number;
  estimatedCostMicroUsd?: number;
  dimensionScores?: Record<string, number>;
};

export type EvaluationReleaseGatePolicy = {
  version: string;
  minimumPassRate: number;
  minimumAverageScore: number;
  maximumPassRateRegression: number;
  maximumAverageScoreRegression: number;
  maximumCostPerCaseMicroUsd: number;
  maximumCostIncreaseRatio: number;
  minimumDimensionScores: Record<string, number>;
};

export type EvaluationReleaseGateCheck = {
  id:
    | "complete_case_set"
    | "minimum_pass_rate"
    | "minimum_average_score"
    | "cost_available"
    | "cost_per_case_budget"
    | "pass_rate_regression"
    | "average_score_regression"
    | "cost_increase"
    | `minimum_dimension_${string}`;
  label: string;
  passed: boolean;
  actual?: number;
  limit?: number;
  detail: string;
};

export type EvaluationReleaseGate = {
  status: "baseline" | "pass" | "fail" | "insufficient_data";
  approved: boolean;
  policyVersion: string;
  pricingVersion: string;
  baselineRunId?: string;
  checks: EvaluationReleaseGateCheck[];
  summary: string;
};

// Snapshot of the official DeepSeek USD pricing page on 2026-07-11.
// Input usage currently exposes aggregate prompt tokens, not cache-hit tokens,
// so the estimator intentionally prices every input token at cache-miss rates.
export const DEEPSEEK_PRICING_SNAPSHOT: PricingSnapshot = {
  effectiveDate: "2026-07-11",
  estimationBasis: "all_input_tokens_as_cache_miss",
  models: {
    "deepseek-v4-flash": {
      inputCacheMissUsdPerMillionTokens: 0.14,
      outputUsdPerMillionTokens: 0.28,
    },
    "deepseek-v4-pro": {
      inputCacheMissUsdPerMillionTokens: 0.435,
      outputUsdPerMillionTokens: 0.87,
    },
  },
  sourceUrl: "https://api-docs.deepseek.com/quick_start/pricing",
  version: "deepseek-official-usd-2026-07-11",
};

export const DEFAULT_EVALUATION_RELEASE_GATE_POLICY: EvaluationReleaseGatePolicy = {
  maximumAverageScoreRegression: 3,
  maximumCostIncreaseRatio: 0.25,
  maximumCostPerCaseMicroUsd: 20_000,
  maximumPassRateRegression: 0.05,
  minimumAverageScore: 80,
  minimumDimensionScores: {
    contract: 100,
    grounding: 80,
    localization: 80,
    pedagogy: 80,
    safety: 100,
    workflow: 100,
  },
  minimumPassRate: 0.9,
  version: "teacher-release-gate-v1",
};

function isNonNegativeInteger(value: number | undefined): value is number {
  return Number.isInteger(value) && (value ?? -1) >= 0;
}

export function estimateEvaluationCost(
  usages: ModelTokenUsage[],
  pricing = DEEPSEEK_PRICING_SNAPSHOT,
): EvaluationCostEstimate {
  let estimatedCostUsd = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  const issues: string[] = [];

  if (usages.length === 0) {
    issues.push("No model token telemetry was captured for the evaluation.");
  }

  for (const [index, usage] of usages.entries()) {
    const modelPrice = pricing.models[usage.model];
    const promptTokenCount = usage.promptTokens;
    const completionTokenCount = usage.completionTokens;
    const hasPromptTokens = isNonNegativeInteger(promptTokenCount);
    const hasCompletionTokens = isNonNegativeInteger(completionTokenCount);

    if (hasPromptTokens) {
      promptTokens += promptTokenCount;
    }

    if (hasCompletionTokens) {
      completionTokens += completionTokenCount;
    }

    if (!modelPrice) {
      issues.push(`No ${pricing.version} price exists for model ${usage.model}.`);
    }

    if (!hasPromptTokens) {
      issues.push(`Case ${index + 1} is missing prompt token usage.`);
    }

    if (!hasCompletionTokens) {
      issues.push(`Case ${index + 1} is missing completion token usage.`);
    }

    if (
      !modelPrice ||
      !hasPromptTokens ||
      !hasCompletionTokens
    ) {
      continue;
    }

    estimatedCostUsd +=
      (promptTokenCount / 1_000_000) *
        modelPrice.inputCacheMissUsdPerMillionTokens +
      (completionTokenCount / 1_000_000) *
        modelPrice.outputUsdPerMillionTokens;
  }

  return {
    completionTokens,
    estimatedCostMicroUsd:
      issues.length === 0 ? Math.round(estimatedCostUsd * 1_000_000) : undefined,
    estimationBasis: pricing.estimationBasis,
    issues: Array.from(new Set(issues)),
    pricingVersion: pricing.version,
    promptTokens,
  };
}

function getPassRate(metrics: EvaluationGateMetrics) {
  return metrics.totalCases > 0
    ? metrics.passedCases / metrics.totalCases
    : 0;
}

function createCheck(
  check: EvaluationReleaseGateCheck,
): EvaluationReleaseGateCheck {
  return check;
}

export function evaluateReleaseGate({
  baseline,
  candidate,
  costIssues = [],
  policy = DEFAULT_EVALUATION_RELEASE_GATE_POLICY,
  pricingVersion = DEEPSEEK_PRICING_SNAPSHOT.version,
}: {
  baseline?: EvaluationGateMetrics;
  candidate: EvaluationGateMetrics;
  costIssues?: string[];
  policy?: EvaluationReleaseGatePolicy;
  pricingVersion?: string;
}): EvaluationReleaseGate {
  const checks: EvaluationReleaseGateCheck[] = [];
  const candidatePassRate = getPassRate(candidate);
  const completeCaseSet =
    candidate.totalCases > 0 &&
    candidate.passedCases >= 0 &&
    candidate.passedCases <= candidate.totalCases &&
    (!baseline || candidate.totalCases === baseline.totalCases);

  checks.push(
    createCheck({
      actual: candidate.totalCases,
      detail: completeCaseSet
        ? `${candidate.totalCases} evaluation cases produced a summary.`
        : baseline && candidate.totalCases !== baseline.totalCases
          ? `Candidate has ${candidate.totalCases} cases but baseline ${baseline.id ?? "run"} has ${baseline.totalCases}.`
          : "The evaluation summary has no valid case set.",
      id: "complete_case_set",
      label: "Complete evaluation case set",
      limit: 1,
      passed: completeCaseSet,
    }),
    createCheck({
      actual: candidatePassRate,
      detail: `${candidate.passedCases}/${candidate.totalCases} cases passed (${(
        candidatePassRate * 100
      ).toFixed(1)}%).`,
      id: "minimum_pass_rate",
      label: "Minimum pass rate",
      limit: policy.minimumPassRate,
      passed: completeCaseSet && candidatePassRate >= policy.minimumPassRate,
    }),
    createCheck({
      actual: candidate.averageScore,
      detail: `Average score is ${candidate.averageScore}%; required ${policy.minimumAverageScore}%.`,
      id: "minimum_average_score",
      label: "Minimum average score",
      limit: policy.minimumAverageScore,
      passed: candidate.averageScore >= policy.minimumAverageScore,
    }),
  );

  for (const [dimension, minimumScore] of Object.entries(
    policy.minimumDimensionScores,
  )) {
    const actualScore = candidate.dimensionScores?.[dimension];

    checks.push(
      createCheck({
        actual: actualScore,
        detail:
          actualScore === undefined
            ? `${dimension} score is missing from the evaluation summary.`
            : `${dimension} score is ${actualScore}%; required ${minimumScore}%.`,
        id: `minimum_dimension_${dimension}`,
        label: `Minimum ${dimension} score`,
        limit: minimumScore,
        passed: actualScore !== undefined && actualScore >= minimumScore,
      }),
    );
  }

  const hasCost =
    candidate.estimatedCostMicroUsd !== undefined &&
    candidate.estimatedCostMicroUsd > 0 &&
    costIssues.length === 0;
  checks.push(
    createCheck({
      actual: candidate.estimatedCostMicroUsd,
      detail: hasCost
        ? "Every case has known model pricing and input/output token usage."
        : costIssues.join(" ") || "The evaluation cost could not be estimated.",
      id: "cost_available",
      label: "Cost estimate available",
      passed: hasCost,
    }),
  );

  const costPerCase =
    hasCost && candidate.totalCases > 0
      ? candidate.estimatedCostMicroUsd! / candidate.totalCases
      : undefined;
  checks.push(
    createCheck({
      actual: costPerCase,
      detail:
        costPerCase === undefined
          ? "Cost per case is unavailable."
          : `Estimated cost is $${(costPerCase / 1_000_000).toFixed(6)} per case.`,
      id: "cost_per_case_budget",
      label: "Per-case cost budget",
      limit: policy.maximumCostPerCaseMicroUsd,
      passed:
        costPerCase !== undefined &&
        costPerCase <= policy.maximumCostPerCaseMicroUsd,
    }),
  );

  if (baseline) {
    const baselinePassRate = getPassRate(baseline);
    const passRateRegression = baselinePassRate - candidatePassRate;
    const averageScoreRegression =
      baseline.averageScore - candidate.averageScore;

    checks.push(
      createCheck({
        actual: passRateRegression,
        detail: `Pass-rate change versus the approved baseline is ${(
          -passRateRegression * 100
        ).toFixed(1)} percentage points.`,
        id: "pass_rate_regression",
        label: "Pass-rate regression",
        limit: policy.maximumPassRateRegression,
        passed: passRateRegression <= policy.maximumPassRateRegression,
      }),
      createCheck({
        actual: averageScoreRegression,
        detail: `Average-score change versus the approved baseline is ${-
          averageScoreRegression} points.`,
        id: "average_score_regression",
        label: "Average-score regression",
        limit: policy.maximumAverageScoreRegression,
        passed:
          averageScoreRegression <= policy.maximumAverageScoreRegression,
      }),
    );

    const costIncrease =
      hasCost &&
      baseline.estimatedCostMicroUsd !== undefined &&
      baseline.estimatedCostMicroUsd > 0
        ? (candidate.estimatedCostMicroUsd! -
            baseline.estimatedCostMicroUsd) /
          baseline.estimatedCostMicroUsd
        : undefined;

    checks.push(
      createCheck({
        actual: costIncrease,
        detail:
          costIncrease === undefined
            ? "Comparable candidate and baseline cost estimates are required."
            : `Estimated suite-cost change versus baseline is ${(
                costIncrease * 100
              ).toFixed(1)}%.`,
        id: "cost_increase",
        label: "Cost increase versus baseline",
        limit: policy.maximumCostIncreaseRatio,
        passed:
          costIncrease !== undefined &&
          costIncrease <= policy.maximumCostIncreaseRatio,
      }),
    );
  }

  const missingRequiredData =
    !completeCaseSet ||
    !hasCost ||
    Object.keys(policy.minimumDimensionScores).some(
      (dimension) => candidate.dimensionScores?.[dimension] === undefined,
    ) ||
    (baseline !== undefined &&
      checks.some(
        (check) => check.id === "cost_increase" && check.actual === undefined,
      ));
  const allChecksPassed = checks.every((check) => check.passed);
  const status: EvaluationReleaseGate["status"] = missingRequiredData
    ? "insufficient_data"
    : allChecksPassed
      ? baseline
        ? "pass"
        : "baseline"
      : "fail";

  return {
    approved: status === "pass" || status === "baseline",
    baselineRunId: baseline?.id,
    checks,
    policyVersion: policy.version,
    pricingVersion,
    status,
    summary:
      status === "baseline"
        ? "Absolute quality and cost checks passed; this run establishes the first approved baseline."
        : status === "pass"
          ? "Candidate passed absolute quality, regression, and cost-budget checks."
          : status === "insufficient_data"
            ? "Release decision is blocked until complete case, model-pricing, and token data are available."
            : "Candidate failed one or more quality or cost-budget checks.",
  };
}
