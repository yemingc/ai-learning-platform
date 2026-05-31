"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Layers3,
  MessageSquare,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import type { CurriculumPack } from "@/curricula/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchLearnerMemory,
  MEMORY_UPDATED_EVENT,
  resetLearnerMemory,
} from "@/features/memory/memory-api-client";
import type { LearnerMemory } from "@/features/memory/types";
import { cn } from "@/lib/utils";

type CourseMemoryPageClientProps = {
  curriculum: CurriculumPack;
};

function formatDate(value?: string) {
  if (!value) {
    return "Not studied yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CourseMemoryPageClient({
  curriculum,
}: CourseMemoryPageClientProps) {
  const course = curriculum.course;
  const [memory, setMemory] = useState<LearnerMemory | undefined>();
  const [memoryError, setMemoryError] = useState<string | undefined>();
  const courseIdRef = useRef(course.id);

  useEffect(() => {
    async function syncMemory() {
      try {
        setMemory(await fetchLearnerMemory(courseIdRef.current));
        setMemoryError(undefined);
      } catch (error) {
        setMemoryError(
          error instanceof Error
            ? error.message
            : "Unable to load learner memory.",
        );
      }
    }

    void syncMemory();
    window.addEventListener(MEMORY_UPDATED_EVENT, syncMemory);

    return () => {
      window.removeEventListener(MEMORY_UPDATED_EVENT, syncMemory);
    };
  }, []);

  const unitSummaries = useMemo(() => {
    return curriculum.units.map((unit) => {
      const unitConcepts = curriculum.concepts.filter(
        (concept) => concept.unitId === unit.id,
      );
      const unitMemories = unitConcepts.map(
        (concept) => memory?.conceptMemories[concept.id],
      );
      const studiedCount = unitMemories.filter(Boolean).length;
      const interactionCount = unitMemories.reduce(
        (sum, conceptMemory) => sum + (conceptMemory?.interactionCount ?? 0),
        0,
      );
      const reviewSignalCount = unitMemories.reduce(
        (sum, conceptMemory) =>
          sum +
          (conceptMemory?.memorySignalHistory ?? []).filter(
            (signal) => signal.needsReview,
          ).length,
        0,
      );
      const trapCount = unitMemories.reduce(
        (sum, conceptMemory) =>
          sum + (conceptMemory?.misconceptions.length ?? 0),
        0,
      );
      const averageReadiness =
        studiedCount > 0
          ? Math.round(
              unitMemories.reduce(
                (sum, conceptMemory) => sum + (conceptMemory?.readiness ?? 0),
                0,
              ) / studiedCount,
            )
          : 0;

      return {
        averageReadiness,
        interactionCount,
        reviewSignalCount,
        studiedCount,
        trapCount,
        unit,
        unitConcepts,
      };
    });
  }, [curriculum.concepts, curriculum.units, memory]);
  const studiedConceptCount = unitSummaries.reduce(
    (sum, item) => sum + item.studiedCount,
    0,
  );
  const totalInteractions = unitSummaries.reduce(
    (sum, item) => sum + item.interactionCount,
    0,
  );
  const totalReviewSignals = unitSummaries.reduce(
    (sum, item) => sum + item.reviewSignalCount,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-8")}
        href="/memory"
      >
        <ArrowLeft className="size-4" />
        Back to courses
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <Badge variant="secondary">Course Memory</Badge>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{course.subject}</Badge>
            <Badge variant="outline">{course.title}</Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Choose a unit in {course.title}.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            Course-level memory summarizes all units, but concept details stay
            inside the selected unit. That makes learner memory readable as the
            curriculum grows.
          </p>
        </div>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              Memory source
            </Badge>
            <CardTitle>{memory?.source ?? "local_demo"}</CardTitle>
            <CardDescription>
              Updated: {formatDate(memory?.updatedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={async () => {
                setMemory(await resetLearnerMemory(course.id));
              }}
              type="button"
              variant="outline"
            >
              <RotateCcw className="size-4" />
              Reset course memory
            </Button>
          </CardContent>
        </Card>
      </section>

      {memoryError && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {memoryError}
        </div>
      )}

      <section className="mt-10 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Units</CardDescription>
            <CardTitle>{curriculum.units.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Studied concepts</CardDescription>
            <CardTitle>
              {studiedConceptCount} / {curriculum.concepts.length}
            </CardTitle>
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
            <CardDescription>Review signals</CardDescription>
            <CardTitle>{totalReviewSignals}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        {unitSummaries.map((summary) => (
          <Card key={summary.unit.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Unit {summary.unit.sequence}</Badge>
                <Badge variant="secondary">
                  {summary.unitConcepts.length} concepts
                </Badge>
              </div>
              <CardTitle className="text-2xl leading-8">
                {summary.unit.title}
              </CardTitle>
              <CardDescription>{summary.unit.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                    <Layers3 className="size-3.5" />
                    Studied
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {summary.studiedCount}/{summary.unitConcepts.length}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                    <Brain className="size-3.5" />
                    Ready
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {summary.averageReadiness}%
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                    <MessageSquare className="size-3.5" />
                    Chats
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {summary.interactionCount}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                    <TriangleAlert className="size-3.5" />
                    Review
                  </p>
                  <p className="mt-2 text-xl font-semibold">
                    {summary.reviewSignalCount + summary.trapCount}
                  </p>
                </div>
              </div>

              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full justify-between px-4",
                )}
                href={`/memory/${course.id}/${summary.unit.id}`}
              >
                Open unit concept memory
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
