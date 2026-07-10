import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Beaker,
  Clock3,
  Coins,
  Gauge,
  RefreshCw,
  Route,
  Zap,
} from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAiTeacherRunDashboard } from "@/lib/ai-run-db";
import {
  hasDeveloperModeAccess,
  isDeveloperToolsEnabled,
} from "@/lib/developer-mode";
import { cn } from "@/lib/utils";

function formatDuration(value: number | null) {
  if (!value) {
    return "—";
  }

  return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${value}ms`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

export default async function AiRunsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/developer/ai-runs");
  }

  if (!isDeveloperToolsEnabled() || !(await hasDeveloperModeAccess())) {
    redirect("/developer?callbackUrl=/developer/ai-runs");
  }

  const dashboard = getAiTeacherRunDashboard(50);
  const summaryCards = [
    {
      icon: Activity,
      label: "Runs in 24h",
      value: dashboard.summary.totalRuns.toLocaleString(),
    },
    {
      icon: Gauge,
      label: "Success rate",
      value: `${Math.round(dashboard.summary.successRate * 100)}%`,
    },
    {
      icon: Clock3,
      label: "Average total latency",
      value: formatDuration(dashboard.summary.averageDurationMs),
    },
    {
      icon: Coins,
      label: "Observed tokens",
      value: dashboard.summary.totalTokens.toLocaleString(),
    },
    {
      icon: Zap,
      label: "Average first token",
      value: formatDuration(dashboard.summary.averageFirstTokenDurationMs),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          href="/developer"
        >
          <ArrowLeft />
          Developer tools
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          href="/developer/ai-runs"
        >
          <RefreshCw />
          Refresh
        </Link>
      </div>

      <section className="mt-8 max-w-4xl">
        <Badge variant="secondary">AI observability</Badge>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          Teacher run history and usage controls.
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          Inspect privacy-minimized model telemetry, retrieval behavior, prompt
          versions, and rolling per-learner quotas. Raw student messages are not
          stored in this run log.
        </p>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label}>
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {card.label}
                </CardDescription>
                <CardTitle>{card.value}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <Card className="mt-6 border-learning-mint/30 bg-learning-mint/10">
        <CardContent className="grid gap-3 py-5 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold">Burst policy</p>
            <p className="mt-1 text-muted-foreground">
              {dashboard.policy.burstLimit} requests / {dashboard.policy.burstWindowMs / 60_000} min
            </p>
          </div>
          <div>
            <p className="font-semibold">Rolling daily policy</p>
            <p className="mt-1 text-muted-foreground">
              {dashboard.policy.dailyLimit} requests / 24h
            </p>
          </div>
          <div>
            <p className="font-semibold">Active / failed</p>
            <p className="mt-1 text-muted-foreground">
              {dashboard.summary.activeRuns} active · {dashboard.summary.failedRuns} failed
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Beaker className="size-5" />
              Persisted live evaluations
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Each live suite keeps its model, prompt version, score, token, and
              duration metadata for comparison across changes.
            </p>
          </div>
          <Badge variant="outline">Latest {dashboard.evaluations.length}</Badge>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.evaluations.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No persisted live evals yet.</CardTitle>
                <CardDescription>
                  Run Live Model Evaluation from the AI Teacher Evaluation tool.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            dashboard.evaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{evaluation.mode}</Badge>
                    <Badge variant="outline">
                      {evaluation.passedCases}/{evaluation.totalCases} passed
                    </Badge>
                  </div>
                  <CardTitle>{evaluation.averageScore}% average</CardTitle>
                  <CardDescription>
                    {formatDate(evaluation.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{evaluation.models ?? "model unavailable"}</p>
                  <p>{evaluation.promptVersion ?? "prompt unavailable"}</p>
                  <p>
                    {evaluation.totalTokens.toLocaleString()} tokens ·{" "}
                    {formatDuration(evaluation.durationMs)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Recent runs</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Learner identifiers are one-way hashed labels.
            </p>
          </div>
          <Badge variant="outline">Latest {dashboard.runs.length}</Badge>
        </div>

        <div className="mt-5 grid gap-4">
          {dashboard.runs.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No AI Teacher runs recorded yet.</CardTitle>
                <CardDescription>
                  Complete an authenticated lesson chat, then refresh this page.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            dashboard.runs.map((run) => (
              <Card key={run.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            run.status === "succeeded" ? "secondary" : "outline"
                          }
                          className={
                            run.status === "failed"
                              ? "border-destructive/40 text-destructive"
                              : undefined
                          }
                        >
                          {run.status}
                        </Badge>
                        <Badge variant="outline">{run.workflowEngine}</Badge>
                        <Badge variant="outline">{run.locale}</Badge>
                      </div>
                      <CardTitle className="mt-3">{run.conceptId}</CardTitle>
                      <CardDescription>
                        {formatDate(run.createdAt)} · learner {run.learnerLabel}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{run.model ?? "model unavailable"}</p>
                      <p className="mt-1">{run.promptVersion ?? "prompt unavailable"}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                    <Metric label="Tokens" value={run.totalTokens?.toLocaleString() ?? "—"} />
                    <Metric label="First token" value={formatDuration(run.firstTokenDurationMs)} />
                    <Metric label="Model latency" value={formatDuration(run.modelDurationMs)} />
                    <Metric label="Total latency" value={formatDuration(run.requestDurationMs)} />
                    <Metric
                      label="Retrieval"
                      value={
                        run.actualRetrievalMode
                          ? `${run.requestedRetrievalMode ?? "?"} → ${run.actualRetrievalMode}`
                          : "—"
                      }
                    />
                    <Metric label="Citations" value={run.citationCount?.toString() ?? "—"} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{run.inputChars} input chars</span>
                    <span>·</span>
                    <span>{run.historyMessages} history messages</span>
                    <span>·</span>
                    <span>source: {run.source}</span>
                    {run.errorCode && (
                      <>
                        <span>·</span>
                        <span className="text-destructive">{run.errorCode}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="size-5" />
            Deployment note
          </CardTitle>
          <CardDescription>
            SQLite quotas are authoritative for the current stateful deployment.
            A multi-instance deployment should move this table and transaction to
            a shared database or managed rate-limit service.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
