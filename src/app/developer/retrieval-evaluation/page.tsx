import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Trophy, XCircle } from "lucide-react";
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
import type { CurriculumRetrievalMode } from "@/features/rag/embedding-types";
import type {
  RetrievalEvalResult,
  RetrievalEvalSummary,
} from "@/features/rag/evaluation/eval-types";
import { runRetrievalModeComparison } from "@/features/rag/evaluation/eval-runner";
import {
  hasDeveloperModeAccess,
  isDeveloperToolsEnabled,
} from "@/lib/developer-mode";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const modeLabels: Record<CurriculumRetrievalMode, string> = {
  embedding: "Embedding",
  hybrid: "Hybrid",
  keyword: "Keyword",
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getModeTone(mode?: CurriculumRetrievalMode) {
  if (mode === "hybrid") {
    return "border-learning-mint/30 bg-learning-mint/10";
  }

  if (mode === "embedding") {
    return "border-blue-200 bg-blue-50/60";
  }

  return "bg-muted/30";
}

function ModeSummaryCard({
  isBest,
  summary,
}: {
  isBest: boolean;
  summary: RetrievalEvalSummary;
}) {
  const mode = summary.mode ?? "keyword";

  return (
    <Card className={cn(getModeTone(mode), isBest && "ring-2 ring-primary/20")}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Badge className="w-fit" variant={isBest ? "default" : "secondary"}>
            {modeLabels[mode]}
          </Badge>
          {isBest && <Trophy className="size-5 text-primary" />}
        </div>
        <CardTitle>{formatPercent(summary.passRate)} pass rate</CardTitle>
        <CardDescription>
          {summary.error
            ? summary.error
            : `${summary.passedCases}/${summary.totalCases} cases passed. MRR ${summary.meanReciprocalRank.toFixed(2)}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-background/70 p-3">
          <p className="text-xs uppercase text-muted-foreground">Top-1</p>
          <p className="mt-1 font-semibold">
            {summary.topOneHits}/{summary.totalCases} · {formatPercent(summary.topOneHitRate)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/70 p-3">
          <p className="text-xs uppercase text-muted-foreground">Top-3</p>
          <p className="mt-1 font-semibold">
            {summary.topThreeHits}/{summary.totalCases} · {formatPercent(summary.topThreeHitRate)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultCell({ result }: { result?: RetrievalEvalResult }) {
  if (!result) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        No result
      </div>
    );
  }

  const topResult = result.topResults[0];

  return (
    <div className="rounded-lg border border-border bg-background/70 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={!result.passed ? "text-destructive" : undefined}
          variant={result.passed ? "secondary" : "outline"}
        >
          {result.passed ? "pass" : "fail"}
        </Badge>
        <Badge variant="outline">
          {result.topRank ? `rank ${result.topRank}` : "no match"}
        </Badge>
      </div>

      {topResult ? (
        <div className="mt-3">
          <p className="font-semibold">{topResult.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {topResult.sourceLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">score {topResult.score}</Badge>
            <Badge variant="outline">{topResult.locale}</Badge>
            <Badge variant="outline">{topResult.sectionType}</Badge>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          {result.failureReason ?? "No chunks returned."}
        </p>
      )}
    </div>
  );
}

export default async function RetrievalEvaluationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/developer/retrieval-evaluation");
  }

  if (!isDeveloperToolsEnabled() || !(await hasDeveloperModeAccess())) {
    redirect("/developer?callbackUrl=/developer/retrieval-evaluation");
  }

  const comparison = await runRetrievalModeComparison({
    curricula: getCurriculumPacks(),
  });
  const caseIds = comparison.modes[0]?.results.map((result) => result.caseId) ?? [];
  const caseResults = caseIds.map((caseId) => {
    const firstResult = comparison.modes[0]?.results.find(
      (result) => result.caseId === caseId,
    );

    return {
      caseId,
      description: firstResult?.description ?? caseId,
      locale: firstResult?.locale ?? "all",
      query: firstResult?.query ?? caseId,
      resultsByMode: new Map(
        comparison.modes.map((summary) => [
          summary.mode ?? "keyword",
          summary.results.find((result) => result.caseId === caseId),
        ]),
      ),
    };
  });

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
            Compare keyword, embedding, and hybrid retrieval on the same Chinese
            and English curriculum cases. This makes the RAG upgrade measurable
            before it is promoted into the AI Teacher workflow.
          </p>
        </div>

        <Card className="border-learning-mint/30 bg-learning-mint/10">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Current winner
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5" />
              {comparison.bestMode
                ? modeLabels[comparison.bestMode]
                : "No passing mode"}
            </CardTitle>
            <CardDescription>
              Selected by pass rate first, then mean reciprocal rank. Use this
              as evidence before changing live AI Teacher retrieval.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        {comparison.modes.map((summary) => (
          <ModeSummaryCard
            isBest={summary.mode === comparison.bestMode}
            key={summary.mode}
            summary={summary}
          />
        ))}
      </section>

      <section className="mt-10 grid gap-5">
        {caseResults.map((item) => (
          <Card key={item.caseId}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{item.locale}</Badge>
                {comparison.modes.map((summary) => {
                  const result = item.resultsByMode.get(summary.mode ?? "keyword");

                  return result?.passed ? (
                    <CheckCircle2
                      className="size-4 text-learning-mint"
                      key={summary.mode}
                    />
                  ) : (
                    <XCircle
                      className="size-4 text-destructive"
                      key={summary.mode}
                    />
                  );
                })}
              </div>
              <CardTitle className="text-xl leading-7">{item.query}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 lg:grid-cols-3">
                {comparison.modes.map((summary) => {
                  const mode = summary.mode ?? "keyword";

                  return (
                    <div className="grid gap-2" key={mode}>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        {modeLabels[mode]}
                      </p>
                      <ResultCell result={item.resultsByMode.get(mode)} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
