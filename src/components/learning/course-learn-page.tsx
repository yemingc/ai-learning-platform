import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Layers3,
  Network,
  Plus,
  Target,
} from "lucide-react";
import type { CurriculumPack } from "@/curricula/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CourseLearnPageProps = {
  curriculum: CurriculumPack;
};

export function CourseLearnPage({ curriculum }: CourseLearnPageProps) {
  const course = curriculum.course;
  const totalMinutes = curriculum.concepts.reduce(
    (sum, concept) => sum + concept.estimatedMinutes,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-8")}
        href="/learn"
      >
        <ArrowLeft className="size-4" />
        Back to all courses
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <Badge variant="outline">Course pack</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            {course.title} is one course inside the learning platform.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            Choose a unit to enter its concept graph. The platform architecture
            stays reusable: a course owns units, units own concepts, and lessons
            plus AI Teacher support attach to each concept.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="size-4 text-primary" />
              {course.subject}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {course.description}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Layers3 className="size-4 text-primary" />
              {curriculum.units.length} unit
              {curriculum.units.length === 1 ? "" : "s"} available
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              More units can be added as new curriculum modules.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-4 text-primary" />
              {totalMinutes} minutes of structured learning
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Static lessons first, AI Teacher support during reading, practice
              after readiness.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary">Course units</Badge>
            <h2 className="mt-3 text-2xl font-semibold">
              Select a unit learning map
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            This page is intentionally one layer above the concept list, so AP
            Calculus AB behaves like a replaceable course pack instead of the
            whole product.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {curriculum.units.map((unit) => {
            const unitTopics = curriculum.topics.filter(
              (topic) => topic.unitId === unit.id,
            );
            const unitConcepts = curriculum.concepts.filter(
              (concept) => concept.unitId === unit.id,
            );

            return (
              <Card key={unit.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Unit {unit.sequence}</Badge>
                    <Badge variant="secondary">
                      {unitConcepts.length} concepts
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Clock className="size-3.5" />
                      {unit.estimatedMinutes} min
                    </span>
                  </div>
                  <CardTitle className="text-2xl leading-8">
                    {unit.title}
                  </CardTitle>
                  <CardDescription>{unit.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-background/70 p-3">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                        <Network className="size-3.5" />
                        Topics
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {unitTopics.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/70 p-3">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                        <Target className="size-3.5" />
                        Concepts
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {unitConcepts.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/70 p-3">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                        <Clock className="size-3.5" />
                        Minutes
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {unit.estimatedMinutes}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Concepts in this unit
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {unitConcepts.slice(0, 5).map((concept) => (
                        <Badge key={concept.id} variant="outline">
                          {concept.title}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Link
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full justify-between px-4",
                    )}
                    href={`/courses/${course.id}/learn/${unit.id}`}
                  >
                    Open unit concept graph
                    <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}

          <Card className="border-dashed bg-muted/30">
            <CardHeader>
              <Badge className="w-fit" variant="outline">
                Extensible curriculum slot
              </Badge>
              <CardTitle className="flex items-center gap-2 text-2xl leading-8">
                <Plus className="size-5 text-primary" />
                Add the next unit later
              </CardTitle>
              <CardDescription>
                Future curriculum packs can add more units without changing the
                learning runtime. The same structure can also support a
                completely different subject.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                Course to Unit to Topic to Concept stays the stable domain
                model. Lessons, memory, AI Teacher context, and application
                readiness attach to concept nodes.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
