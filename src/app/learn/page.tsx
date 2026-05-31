import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Layers3, Network } from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function LearnPage() {
  const curricula = getCurriculumPacks();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <Badge variant="outline">Course library</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Choose a course pack to start learning.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            This platform is not tied to one subject. Each course pack brings
            its own knowledge graph, structured lessons, teaching profile, and
            learner memory scope. AP Calculus AB is the first available pack.
          </p>
        </div>

        <Card className="bg-muted/30">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Platform model
            </Badge>
            <CardTitle>Reusable learning engine</CardTitle>
            <CardDescription>
              Swap the curriculum pack, keep the same AI Teacher, Memory,
              Workflow Inspector, and learning-centric product loop.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {curricula.map((curriculum) => {
          const course = curriculum.course;
          const activeUnit =
            curriculum.units.find((unit) => unit.id === curriculum.defaultUnitId) ??
            curriculum.units[0];
          const conceptCount = curriculum.concepts.length;
          const lessonCount = curriculum.lessons.length;
          const totalMinutes = curriculum.concepts.reduce(
            (sum, concept) => sum + concept.estimatedMinutes,
            0,
          );

          return (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Available now</Badge>
                  <Badge variant="outline">{course.subject}</Badge>
                </div>
                <CardTitle className="text-2xl">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Network className="size-3.5" />
                      Concepts
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {conceptCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      Lessons
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {lessonCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Clock className="size-3.5" />
                      Minutes
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {totalMinutes}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Current module
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {activeUnit?.title ?? "No module configured"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {activeUnit?.description ??
                      "This course pack needs at least one unit before students can start."}
                  </p>
                </div>

                <Link
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full justify-between px-4",
                  )}
                  href={`/courses/${course.id}/learn`}
                >
                  Open course
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}

        <Card className="border-dashed bg-muted/20">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Next course pack</Badge>
              <Badge variant="outline">Template-ready</Badge>
            </div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Layers3 className="size-5" />
              Add another subject
            </CardTitle>
            <CardDescription>
              A sibling curriculum pack can reuse the same platform services:
              knowledge graph, static lessons, AI Teacher workflow, learner
              memory, and workflow inspection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
              Example future packs: JavaScript Basics, Algebra II, AP Physics
              Mechanics, SAT Math, or English Vocabulary.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
