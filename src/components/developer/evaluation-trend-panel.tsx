import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CircleDashed,
  History,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  EvaluationTrendPoint,
  EvaluationTrendReport,
  EvaluationTrendSeries,
} from "@/features/ai-teacher/evaluation/evaluation-trends";

function formatValue(value: number, unit: EvaluationTrendSeries["unit"]) {
  if (unit === "percent") {
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
  }

  if (unit === "usd") {
    return `$${value.toFixed(6)}`;
  }

  return value >= 1000
    ? `${(value / 1000).toFixed(1)}s`
    : `${Math.round(value)}ms`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSeriesHealth(series: EvaluationTrendSeries) {
  if (
    series.direction === "flat" ||
    series.direction === "not_enough_data"
  ) {
    return "neutral" as const;
  }

  const improved =
    series.kind === "quality"
      ? series.direction === "up"
      : series.direction === "down";

  return improved ? ("improved" as const) : ("regressed" as const);
}

function TrendIcon({ series }: { series: EvaluationTrendSeries }) {
  if (series.direction === "up") {
    return <ArrowUpRight className="size-4" />;
  }

  if (series.direction === "down") {
    return <ArrowDownRight className="size-4" />;
  }

  return <Minus className="size-4" />;
}

function getChartPoints(
  points: EvaluationTrendPoint[],
  unit: EvaluationTrendSeries["unit"],
) {
  const width = 240;
  const height = 72;
  const padding = 8;
  const values = points.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const minimum = unit === "percent" ? 0 : rawMin;
  const maximum = unit === "percent" ? 100 : rawMax;
  const range = maximum - minimum || 1;

  return points.map((point, index) => ({
    ...point,
    x:
      points.length === 1
        ? width / 2
        : padding +
          (index / (points.length - 1)) * (width - padding * 2),
    y:
      height -
      padding -
      ((point.value - minimum) / range) * (height - padding * 2),
  }));
}

function Sparkline({ series }: { series: EvaluationTrendSeries }) {
  const chartPoints = getChartPoints(series.points, series.unit);
  const accessibleValues = series.points
    .map(
      (point) =>
        `${formatDate(point.createdAt)}: ${formatValue(point.value, series.unit)}`,
    )
    .join("; ");

  return (
    <svg
      aria-label={`${series.label} trend. ${accessibleValues}`}
      className="h-20 w-full text-primary"
      preserveAspectRatio="none"
      role="img"
      viewBox="0 0 240 72"
    >
      <line
        className="stroke-border"
        x1="8"
        x2="232"
        y1="64"
        y2="64"
      />
      {chartPoints.length > 1 && (
        <polyline
          className="stroke-current"
          fill="none"
          points={chartPoints.map((point) => `${point.x},${point.y}`).join(" ")}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {chartPoints.map((point) => (
        <circle
          className="fill-background stroke-current"
          cx={point.x}
          cy={point.y}
          key={point.runId}
          r="3.5"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function TrendCard({ series }: { series: EvaluationTrendSeries }) {
  const health = getSeriesHealth(series);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardDescription>{series.label}</CardDescription>
            <CardTitle className="mt-2">
              {series.latest === undefined
                ? "Unavailable"
                : formatValue(series.latest, series.unit)}
            </CardTitle>
          </div>
          <Badge
            className={
              health === "regressed"
                ? "border-destructive/40 text-destructive"
                : undefined
            }
            variant={health === "improved" ? "secondary" : "outline"}
          >
            <TrendIcon series={series} />
            {series.delta === undefined
              ? "Need 2 runs"
              : formatValue(Math.abs(series.delta), series.unit)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {series.points.length > 0 ? (
          <Sparkline series={series} />
        ) : (
          <div className="grid h-20 place-items-center rounded-md border border-dashed text-xs text-muted-foreground">
            Metric unavailable
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {series.points.length} comparable run
          {series.points.length === 1 ? "" : "s"} · delta from first shown run
        </p>
      </CardContent>
    </Card>
  );
}

export function EvaluationTrendPanel({
  report,
}: {
  report: EvaluationTrendReport;
}) {
  return (
    <section className="mt-10" id="evaluation-trends">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Activity className="size-5" />
            Evaluation trends
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Compare only runs from the latest evaluation-suite version so case
            changes do not masquerade as model or prompt quality changes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {report.comparableRuns} comparable
          </Badge>
          {report.excludedRuns > 0 && (
            <Badge variant="outline">{report.excludedRuns} excluded</Badge>
          )}
        </div>
      </div>

      {report.status === "no_data" ? (
        <Card className="mt-5 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDashed className="size-5" />
              No versioned live evaluations yet
            </CardTitle>
            <CardDescription className="max-w-3xl leading-6">
              Run Live Model Evaluation from the AI Teacher Evaluation page.
              The first qualifying run establishes a baseline; the second run
              unlocks quality, cost, and latency direction. No synthetic data is
              inserted into this dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card className="mt-5 border-learning-mint/30 bg-learning-mint/10">
            <CardContent className="flex flex-wrap items-center gap-3 py-5 text-sm">
              <Badge variant="secondary">{report.suiteVersion}</Badge>
              <span>
                {report.status === "single_run"
                  ? "One comparable run captured. Run the same suite again to calculate direction."
                  : "Trend direction compares the first and latest run shown below."}
              </span>
            </CardContent>
          </Card>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.qualitySeries.map((series) => (
              <TrendCard key={series.key} series={series} />
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {report.operationalSeries.map((series) => (
              <TrendCard key={series.key} series={series} />
            ))}
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="size-5" />
                Comparable run timeline
              </CardTitle>
              <CardDescription>
                Prompt, model, and release decision stay attached to every
                point.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {report.runs.map((run, index) => (
                  <li
                    className="rounded-lg border border-border bg-background/70 p-3 text-sm"
                    key={run.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">Run {index + 1}</span>
                      <Badge variant="outline">
                        {run.releaseGateStatus?.replaceAll("_", " ") ??
                          "no gate"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(run.createdAt)}
                    </p>
                    <p className="mt-2 truncate">{run.promptVersion ?? "prompt unavailable"}</p>
                    <p className="mt-1 truncate text-muted-foreground">
                      {run.models ?? "model unavailable"}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
