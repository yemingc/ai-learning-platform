import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Beaker,
  Brain,
  CheckCircle2,
  CircleAlert,
  Workflow,
} from "lucide-react";
import { auth } from "@/auth";
import { LiveAiEvaluationPanel } from "@/components/dashboard/live-ai-evaluation-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { runTeacherEvaluationSuite } from "@/features/ai-teacher/evaluation/eval-runner";
import { hasDeveloperModeAccess } from "@/lib/developer-mode";
import { cn } from "@/lib/utils";

export default async function AiEvaluationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/ai-evaluation");
  }

  if (!(await hasDeveloperModeAccess())) {
    redirect("/developer?callbackUrl=/dashboard/ai-evaluation");
  }

  const summary = runTeacherEvaluationSuite();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-8")}
        href="/dashboard"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-end">
        <div>
          <Badge variant="outline">AI Teacher Evaluation Suite</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Test the AI Teacher as a learning workflow, not a chatbot.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            This suite uses fixed pedagogical cases to verify schema contracts,
            teaching moves, memory signals, bilingual terminology behavior, and
            learning-centric guardrails. The current mode is deterministic and
            offline-friendly; live model evaluation can plug into the same case
            library later.
          </p>
        </div>

        <Card className="bg-muted/30">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Current run
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="size-5" />
              {summary.passedCases}/{summary.totalCases} cases passed
            </CardTitle>
            <CardDescription>
              Average score: {summary.averageScore}%. This is a contract and
              pedagogy evaluation layer for the AI product.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Evaluation mode</CardDescription>
            <CardTitle>Deterministic contract</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Workflow nodes covered</CardDescription>
            <CardTitle>{summary.requiredWorkflowNodes.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Education guardrail</CardDescription>
            <CardTitle>Concept-first teaching</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Quality dimensions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Safety and grounding stay visible instead of disappearing inside
              a single average score.
            </p>
          </div>
          <Badge variant="outline">Six release dimensions</Badge>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Object.entries(summary.dimensionScores).map(
            ([dimension, dimensionScore]) => (
              <Card key={dimension}>
                <CardHeader>
                  <CardDescription className="capitalize">
                    {dimension}
                  </CardDescription>
                  <CardTitle>
                    {dimensionScore.score === null
                      ? "Not run"
                      : `${dimensionScore.score}%`}
                  </CardTitle>
                  <CardDescription>
                    {dimensionScore.passedChecks}/{dimensionScore.totalChecks}{" "}
                    checks
                  </CardDescription>
                </CardHeader>
              </Card>
            ),
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="size-5" />
              Graph-ready evaluation target
            </CardTitle>
            <CardDescription>
              These nodes mirror the target LangGraph teaching workflow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {summary.requiredWorkflowNodes.map((node, index) => (
                <li
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/70 p-3 text-sm"
                  key={node}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="font-medium">{node}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          {summary.results.map((result) => (
            <Card key={result.caseId}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={result.passed ? "secondary" : "outline"}>
                    {result.passed ? "Passed" : "Needs attention"}
                  </Badge>
                  <Badge variant="outline">{result.locale}</Badge>
                  <Badge variant="outline">{result.conceptId}</Badge>
                </div>
                <CardTitle className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <CircleAlert className="size-5 text-destructive" />
                  )}
                  {result.title}
                </CardTitle>
                <CardDescription>Score: {result.score}%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {result.checks.map((check) => (
                    <div
                      className="flex items-start gap-3 rounded-lg border border-border bg-background/70 p-3 text-sm"
                      key={check.id}
                    >
                      {check.passed ? (
                        <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                      ) : (
                        <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium">{check.label}</p>
                        <p className="mt-1 text-muted-foreground">
                          {check.detail}
                        </p>
                        <Badge className="mt-2" variant="outline">
                          {check.dimension}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <LiveAiEvaluationPanel />

      <Card className="mt-10 border-learning-mint/30 bg-learning-mint/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5" />
            Why this belongs in the project
          </CardTitle>
          <CardDescription>
            A portfolio AI app becomes stronger when it shows how outputs are
            evaluated. This page makes the teaching behavior testable before
            adding more courses, more models, or more complex memory updates.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
