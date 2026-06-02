import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { auth } from "@/auth";
import { getCurriculumPacks } from "@/curricula";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { runRetrievalEvaluation } from "@/features/rag/evaluation/eval-runner";
import {
  hasDeveloperModeAccess,
  isDeveloperToolsEnabled,
} from "@/lib/developer-mode";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default async function RetrievalEvaluationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/developer/retrieval-evaluation");
  }

  if (!isDeveloperToolsEnabled() || !(await hasDeveloperModeAccess())) {
    redirect("/developer?callbackUrl=/developer/retrieval-evaluation");
  }

  const evaluation = runRetrievalEvaluation({ curricula: getCurriculumPacks() });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-8")}
        href="/developer"
      >
        <ArrowLeft className="size-4" />
        Back to Developer Mode
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <Badge variant="outline">RAG retrieval eval</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Retrieval Quality Evaluation
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            Run fixed Chinese and English retrieval cases against the current
            bilingual curriculum chunks. This gives us a baseline before adding
            embeddings or a vector database.
          </p>
        </div>

        <Card className="border-learning-mint/30 bg-learning-mint/10">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Summary
            </Badge>
            <CardTitle>{formatPercent(evaluation.passRate)} pass rate</CardTitle>
            <CardDescription>
              {evaluation.passedCases}/{evaluation.totalCases} cases passed.
              Mean reciprocal rank: {evaluation.meanReciprocalRank.toFixed(2)}.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total cases</CardDescription>
            <CardTitle>{evaluation.totalCases}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Passed</CardDescription>
            <CardTitle>{evaluation.passedCases}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Failed</CardDescription>
            <CardTitle>{evaluation.failedCases}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>MRR</CardDescription>
            <CardTitle>{evaluation.meanReciprocalRank.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10 grid gap-5">
        {evaluation.results.map((result) => (
          <Card key={result.caseId}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={!result.passed ? "text-destructive" : undefined}
                  variant={result.passed ? "secondary" : "outline"}
                >
                  {result.passed ? "pass" : "fail"}
                </Badge>
                <Badge variant="outline">{result.locale}</Badge>
                <Badge variant="outline">
                  {result.topRank ? `rank ${result.topRank}` : "no match"}
                </Badge>
              </div>
              <CardTitle className="flex items-center gap-2 text-xl leading-7">
                {result.passed ? (
                  <CheckCircle2 className="size-5 text-learning-mint" />
                ) : (
                  <XCircle className="size-5 text-destructive" />
                )}
                {result.query}
              </CardTitle>
              <CardDescription>{result.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!result.passed && result.failureReason && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {result.failureReason}
                </div>
              )}

              <div className="grid gap-3 text-sm lg:grid-cols-2">
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="font-semibold">Expected concepts</p>
                  <p className="mt-1 text-muted-foreground">
                    {result.expectedConceptIds.join(", ")}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="font-semibold">Expected sections</p>
                  <p className="mt-1 text-muted-foreground">
                    {result.expectedSectionTypes.join(", ")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Top retrieved chunks
                </p>
                <div className="mt-3 grid gap-2">
                  {result.topResults.map((topResult, index) => (
                    <div
                      className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
                      key={topResult.id}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <Badge variant="outline">score {topResult.score}</Badge>
                        <Badge variant="outline">{topResult.locale}</Badge>
                        <Badge variant="outline">{topResult.sectionType}</Badge>
                      </div>
                      <p className="mt-2 font-semibold">{topResult.title}</p>
                      <p className="mt-1 text-muted-foreground">
                        {topResult.sourceLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
