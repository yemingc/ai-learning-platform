import {
  CheckCircle2,
  CircleDashed,
  Gauge,
  Scale,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HumanEvaluationCalibrationReport } from "@/features/ai-teacher/evaluation/human-evaluation-calibration";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatScore(value: number | undefined, suffix = "") {
  return value === undefined ? "Unavailable" : `${value.toFixed(1)}${suffix}`;
}

export function HumanCalibrationPanel({
  report,
}: {
  report: HumanEvaluationCalibrationReport;
}) {
  return (
    <section className="mt-10" id="human-calibration">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Scale className="size-5" />
            Human-review calibration
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Compare automated dimension scores with a versioned human rubric.
            Response text remains ephemeral; only aggregate ratings and audit
            metadata are retained.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{report.rubricVersion}</Badge>
          {report.suiteVersion && (
            <Badge variant="outline">{report.suiteVersion}</Badge>
          )}
          <Badge variant="outline">
            ±{report.tolerancePoints} point agreement
          </Badge>
        </div>
      </div>

      {report.status === "no_data" ? (
        <Card className="mt-5 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDashed className="size-5" />
              No human-reviewed runs yet
            </CardTitle>
            <CardDescription className="max-w-3xl leading-6">
              Run a live evaluation, inspect all synthetic-case responses, and
              submit the rubric before leaving that page. At least {report.minimumReviewedRuns}{" "}
              distinct runs are required before this dashboard labels the sample
              ready for interpretation.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card className="mt-5 border-learning-mint/30 bg-learning-mint/10">
            <CardContent className="flex flex-wrap items-center gap-3 py-5 text-sm">
              {report.status === "ready" ? (
                <CheckCircle2 className="size-5 text-primary" />
              ) : (
                <Users className="size-5" />
              )}
              <Badge variant={report.status === "ready" ? "secondary" : "outline"}>
                {report.status.replaceAll("_", " ")}
              </Badge>
              <span>
                {report.reviewCount}/{report.minimumReviewedRuns} distinct runs
                reviewed. A ready sample supports threshold discussion, not a
                claim of universal teaching validity.
              </span>
            </CardContent>
          </Card>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader>
                <CardDescription>Reviewed runs</CardDescription>
                <CardTitle>{report.reviewCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Human/auto comparisons</CardDescription>
                <CardTitle>{report.comparisonCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Mean absolute error</CardDescription>
                <CardTitle>{formatScore(report.meanAbsoluteError, " pts")}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Agreement within tolerance</CardDescription>
                <CardTitle>{formatScore(report.agreementRate, "%")}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.dimensions.map((dimension) => (
              <Card key={dimension.dimension}>
                <CardHeader>
                  <CardDescription className="capitalize">
                    {dimension.dimension}
                  </CardDescription>
                  <CardTitle>
                    {formatScore(dimension.agreementRate, "% agreement")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  <p>{dimension.comparisons} comparisons</p>
                  <p>
                    Human {formatScore(dimension.averageHumanScore)} · automated{" "}
                    {formatScore(dimension.averageAutomatedScore)}
                  </p>
                  <p>
                    MAE {formatScore(dimension.meanAbsoluteError, " pts")} · bias{" "}
                    {formatScore(dimension.meanBias, " pts")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="size-5" />
                Recent calibration reviews
              </CardTitle>
              <CardDescription>
                Reviewer identities are one-way hashed labels. Notes are not
                returned in this dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {report.recentReviews.map((review) => (
                  <div
                    className="rounded-lg border border-border bg-background/70 p-3 text-sm"
                    key={review.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">reviewer {review.reviewerLabel}</Badge>
                      {review.notePresent && <Badge variant="outline">note saved</Badge>}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </p>
                    <p className="mt-2 truncate">
                      {review.promptVersion ?? "prompt unavailable"}
                    </p>
                    <p className="mt-1 truncate text-muted-foreground">
                      {review.models ?? "model unavailable"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
