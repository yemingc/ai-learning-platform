"use client";

import { useState } from "react";
import {
  Loader2,
  Play,
  ShieldCheck,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LiveTeacherEvaluationResponse } from "@/features/ai-teacher/evaluation/eval-types";
import { HumanEvaluationReviewForm } from "@/components/dashboard/human-evaluation-review-form";

function formatDuration(durationMs?: number) {
  if (durationMs === undefined) {
    return "not run";
  }

  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(1)}s`;
}

export function LiveAiEvaluationPanel() {
  const [summary, setSummary] = useState<LiveTeacherEvaluationResponse>();
  const [error, setError] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);

  async function runLiveEvaluation() {
    setIsRunning(true);
    setError(undefined);

    try {
      const response = await fetch("/api/teacher-evaluation/live", {
        method: "POST",
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => undefined)) as
          | { error?: { message?: string } }
          | undefined;

        throw new Error(
          errorBody?.error?.message ??
            `Live evaluation failed with status ${response.status}.`,
        );
      }

      setSummary((await response.json()) as LiveTeacherEvaluationResponse);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Live evaluation failed.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card className="mt-10 border-learning-mint/30 bg-learning-mint/10">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="w-fit" variant="secondary">
              Live model evaluation
            </Badge>
            <CardTitle className="mt-3 flex items-center gap-2">
              <Play className="size-5" />
              Run the same cases against DeepSeek
            </CardTitle>
            <CardDescription className="mt-2 max-w-3xl">
              This calls the real AI Teacher workflow, then scores the model
              output with the same contract and pedagogy checks. It may take a
              while because each case waits for a real model response.
            </CardDescription>
          </div>
          <Button disabled={isRunning} onClick={runLiveEvaluation}>
            {isRunning ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4" />
            )}
            {isRunning ? "Running live eval..." : "Run live eval"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        {summary && (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-border bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Passed
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.passedCases}/{summary.totalCases}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Average score
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.averageScore}%
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Completed
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {new Date(summary.completedAt).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  Release gate
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {summary.releaseGate?.status.replaceAll("_", " ") ??
                    "not persisted"}
                </p>
              </div>
            </div>

            {summary.releaseGate && (
              <div
                className={
                  summary.releaseGate.approved
                    ? "rounded-lg border border-learning-mint/40 bg-learning-mint/10 p-4"
                    : "rounded-lg border border-destructive/30 bg-destructive/10 p-4"
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      summary.releaseGate.approved ? "secondary" : "outline"
                    }
                  >
                    {summary.releaseGate.approved
                      ? "Approved for release"
                      : "Release blocked"}
                  </Badge>
                  <Badge variant="outline">
                    {summary.releaseGate.policyVersion}
                  </Badge>
                  <Badge variant="outline">
                    {summary.releaseGate.pricingVersion}
                  </Badge>
                  <Badge variant="outline">{summary.suiteVersion}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6">
                  {summary.releaseGate.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {summary.releaseGate.checks.map((check) => (
                    <Badge
                      className={
                        check.passed
                          ? undefined
                          : "border-destructive/40 text-destructive"
                      }
                      key={check.id}
                      variant="outline"
                    >
                      {check.passed ? "Pass" : "Block"}: {check.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold">Quality dimensions</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {Object.entries(summary.dimensionScores).map(
                  ([dimension, dimensionScore]) => (
                    <div
                      className="rounded-lg border border-border bg-background/80 p-3"
                      key={dimension}
                    >
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        {dimension}
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        {dimensionScore.score === null
                          ? "Not run"
                          : `${dimensionScore.score}%`}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {dimensionScore.passedChecks}/
                        {dimensionScore.totalChecks} checks
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="grid gap-3">
              {summary.results.map((result) => (
                <div
                  className="rounded-lg border border-border bg-background/80 p-4"
                  key={result.caseId}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={result.passed ? "secondary" : "outline"}>
                      {result.passed ? "Passed" : "Needs attention"}
                    </Badge>
                    <Badge variant="outline">{result.score}%</Badge>
                    <Badge variant="outline">{result.workflowEngine}</Badge>
                    <Badge className="gap-1" variant="outline">
                      <Timer className="size-3" />
                      {formatDuration(result.durationMs)}
                    </Badge>
                  </div>
                  <p className="mt-3 font-semibold">{result.title}</p>
                  {result.error ? (
                    <p className="mt-2 text-sm leading-6 text-destructive">
                      {result.error}
                    </p>
                  ) : (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {result.assistantMessage}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.checks
                      .filter((check) => !check.passed)
                      .map((check) => (
                        <Badge key={check.id} variant="outline">
                          {check.dimension}: {check.label}
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {summary.releaseGate?.evaluationRunId && (
              <HumanEvaluationReviewForm
                evaluationRunId={summary.releaseGate.evaluationRunId}
                key={summary.releaseGate.evaluationRunId}
                totalCases={summary.totalCases}
              />
            )}
          </div>
        )}

        {!summary && !error && (
          <p className="text-sm leading-6 text-muted-foreground">
            No live model run yet. The deterministic suite above is safe for CI;
            this live run is for prompt/model quality checks during development.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
