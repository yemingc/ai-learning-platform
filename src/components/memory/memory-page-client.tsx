"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  ClipboardCheck,
  Clock,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Concept, Course, Unit } from "@/features/knowledge/types";
import {
  fetchLearnerMemory,
  MEMORY_UPDATED_EVENT,
  resetLearnerMemory,
} from "@/features/memory/memory-api-client";
import { getStudyRecommendation } from "@/features/memory/study-recommendations";
import type { ConceptMemory, LearnerMemory } from "@/features/memory/types";
import { getFormativeAssessmentProgress } from "@/features/assessment/assessment-progress";
import { cn } from "@/lib/utils";

type MemoryPageClientProps = {
  concepts: Concept[];
  course: Course;
  unit: Unit;
};

const statusLabels: Record<ConceptMemory["status"], string> = {
  familiar: "Familiar",
  learning: "Learning",
  needs_review: "Needs review",
  not_started: "Not started",
};

function getRecommendationHref(
  recommendation: ReturnType<typeof getStudyRecommendation>,
) {
  const params = new URLSearchParams({
    action: recommendation.action,
    prompt: recommendation.suggestedPrompt,
    section: recommendation.targetSection,
    sectionId: recommendation.targetSectionId,
    source: "memory_recommendation",
  });

  return `/learn/${recommendation.targetConceptId}?${params.toString()}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "Not studied yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MemoryPageClient({
  concepts,
  course,
  unit,
}: MemoryPageClientProps) {
  const [memory, setMemory] = useState<LearnerMemory | undefined>();
  const [memoryError, setMemoryError] = useState<string | undefined>();
  const courseId = course.id;
  const courseIdRef = useRef(courseId);

  useEffect(() => {
    async function syncMemory() {
      try {
        setMemory(await fetchLearnerMemory(courseIdRef.current));
        setMemoryError(undefined);
      } catch (error) {
        setMemoryError(
          error instanceof Error
            ? error.message
            : "Unable to load learning progress.",
        );
      }
    }

    void syncMemory();
    window.addEventListener(MEMORY_UPDATED_EVENT, syncMemory);

    return () => {
      window.removeEventListener(MEMORY_UPDATED_EVENT, syncMemory);
    };
    // The current route remounts per course/unit; keep this dependency array
    // stable so Fast Refresh never changes its size between renders.
  }, []);

  const conceptMemories = useMemo(() => {
    return concepts.map((concept) => ({
      concept,
      memory: memory?.conceptMemories[concept.id],
    }));
  }, [concepts, memory]);
  const studiedConceptCount = conceptMemories.filter(({ memory }) => memory)
    .length;
  const totalInteractions = conceptMemories.reduce(
    (sum, item) => sum + (item.memory?.interactionCount ?? 0),
    0,
  );
  const totalMisconceptions = conceptMemories.reduce(
    (sum, item) => sum + (item.memory?.misconceptions.length ?? 0),
    0,
  );
  const reviewSignals = conceptMemories.reduce(
    (sum, item) =>
      sum +
      (item.memory?.memorySignalHistory ?? []).filter(
        (signal) => signal.needsReview,
      ).length,
    0,
  );
  const averageReadiness =
    studiedConceptCount > 0
      ? Math.round(
          conceptMemories.reduce(
            (sum, item) => sum + (item.memory?.readiness ?? 0),
            0,
          ) / studiedConceptCount,
        )
      : 0;
  const assessmentProgress = conceptMemories.map(({ memory: conceptMemory }) =>
    getFormativeAssessmentProgress(conceptMemory?.assessmentAttempts),
  );
  const exitEvidenceCount = assessmentProgress.filter(
    (progress) => progress.exitTicketScore !== undefined,
  ).length;
  const learningGains = assessmentProgress
    .map((progress) => progress.learningGain)
    .filter((gain): gain is number => gain !== undefined);
  const averageLearningGain = learningGains.length
    ? Math.round(
        learningGains.reduce((sum, gain) => sum + gain, 0) /
          learningGains.length,
      )
    : undefined;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-8")}
        href={`/dashboard/${course.id}`}
      >
        <ArrowLeft className="size-4" />
        Back to {course.shortTitle ?? course.title} units
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <Badge variant="secondary">Unit progress</Badge>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{course.title}</Badge>
            <Badge variant="outline">Unit {unit.sequence}</Badge>
            <Badge variant="outline">{course.subject}</Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            {unit.title} progress.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            This page shows learning progress for one unit. Each concept keeps
            its own server-scored diagnostic and exit evidence, readiness,
            confusion signals, misconceptions, and AI Teacher recommendations.
          </p>
        </div>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              Progress source
            </Badge>
            <CardTitle>{memory?.source ?? "loading"}</CardTitle>
            <CardDescription>
              Updated: {formatDate(memory?.updatedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={async () => {
                setMemory(await resetLearnerMemory(courseId));
              }}
              type="button"
              variant="outline"
            >
              <RotateCcw className="size-4" />
              Reset course progress
            </Button>
          </CardContent>
        </Card>
      </section>

      {memoryError && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {memoryError}
        </div>
      )}

      <section className="mt-10 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader>
            <CardDescription>Studied concepts</CardDescription>
            <CardTitle>
              {studiedConceptCount} / {concepts.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Average readiness</CardDescription>
            <CardTitle>{averageReadiness}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>AI interactions</CardDescription>
            <CardTitle>{totalInteractions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Review signals / traps</CardDescription>
            <CardTitle>
              {reviewSignals} / {totalMisconceptions}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Exit evidence</CardDescription>
            <CardTitle>
              {exitEvidenceCount} / {concepts.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Average learning gain</CardDescription>
            <CardTitle>
              {averageLearningGain === undefined
                ? "—"
                : `${averageLearningGain > 0 ? "+" : ""}${averageLearningGain} pts`}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {conceptMemories.map(({ concept, memory: conceptMemory }) => {
          const recommendation = getStudyRecommendation({
            concept,
            conceptMemory,
            conceptMemories: memory?.conceptMemories ?? {},
            concepts,
          });
          const conceptAssessmentProgress = getFormativeAssessmentProgress(
            conceptMemory?.assessmentAttempts,
          );

          return (
            <Card key={concept.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={conceptMemory ? "secondary" : "outline"}>
                    {conceptMemory
                      ? statusLabels[conceptMemory.status]
                      : "Not started"}
                  </Badge>
                  <Badge variant="outline">{concept.estimatedMinutes} min</Badge>
                </div>
                <CardTitle>{concept.title}</CardTitle>
                <CardDescription>{concept.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Brain className="size-3.5" />
                      Readiness
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {conceptMemory?.readiness ?? 0}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <MessageSquare className="size-3.5" />
                      Chats
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {conceptMemory?.interactionCount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <TriangleAlert className="size-3.5" />
                      Traps
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {conceptMemory?.misconceptions.length ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <ClipboardCheck className="size-3.5" />
                      Diagnostic / exit
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {conceptAssessmentProgress.diagnosticScore === undefined
                        ? "—"
                        : `${conceptAssessmentProgress.diagnosticScore}%`}{" "}
                      /{" "}
                      {conceptAssessmentProgress.exitTicketScore === undefined
                        ? "—"
                        : `${conceptAssessmentProgress.exitTicketScore}%`}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <TrendingUp className="size-3.5" />
                      Learning gain
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {conceptAssessmentProgress.learningGain === undefined
                        ? "—"
                        : `${conceptAssessmentProgress.learningGain > 0 ? "+" : ""}${conceptAssessmentProgress.learningGain} pts`}
                    </p>
                  </div>
                </div>

                {conceptMemory?.memorySignalHistory?.[0] ? (
                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        Confusion:{" "}
                        {conceptMemory.memorySignalHistory[0].confusionLevel}
                      </Badge>
                      <Badge variant="outline">
                        Confidence{" "}
                        {conceptMemory.memorySignalHistory[0].confidenceDelta >
                        0
                          ? "+"
                          : ""}
                        {conceptMemory.memorySignalHistory[0].confidenceDelta}
                      </Badge>
                      {conceptMemory.memorySignalHistory[0].needsReview && (
                        <Badge variant="secondary">Needs review</Badge>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {conceptMemory.memorySignalHistory[0].evidenceNote}
                    </p>
                  </div>
                ) : null}

                <div className="rounded-lg border border-learning-mint/30 bg-learning-mint/10 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {recommendation.actionLabel}
                    </Badge>
                    <Badge variant="outline">
                      {recommendation.applicationGate.label}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-background text-primary">
                      <Lightbulb className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">
                        {recommendation.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {recommendation.rationale}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className="rounded-lg border border-border bg-background/80 p-3">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Suggested AI Teacher prompt
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        {recommendation.suggestedPrompt}
                      </p>
                    </div>
                    <Link
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full lg:w-auto",
                      )}
                      href={getRecommendationHref(recommendation)}
                    >
                      {recommendation.ctaLabel}
                    </Link>
                  </div>
                  <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                    <ShieldCheck className="mt-1 size-4 shrink-0 text-primary" />
                    <span>
                      Application gate: {recommendation.applicationGate.reason}
                    </span>
                  </div>
                </div>

                {conceptMemory?.misconceptions.length ? (
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <TriangleAlert className="size-4 text-primary" />
                      Misconceptions noticed
                    </p>
                    <div className="grid gap-2">
                      {conceptMemory.misconceptions.slice(0, 2).map((item) => (
                        <div
                          className="rounded-lg border border-border bg-muted p-3 text-sm leading-6"
                          key={item.id}
                        >
                          {item.text}
                          <span className="ml-2 text-xs text-muted-foreground">
                            x{item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {conceptMemory?.confusionSignals.length ? (
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="size-4 text-primary" />
                      Sections asked about
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {conceptMemory.confusionSignals.slice(0, 4).map((item) => (
                        <Badge key={item.id} variant="outline">
                          {item.section} x{item.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    {formatDate(conceptMemory?.lastStudiedAt)}
                  </p>
                  <Link
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                    href={`/learn/${concept.id}`}
                  >
                    Open lesson
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
