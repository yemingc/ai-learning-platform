import Link from "next/link";
import { ArrowRight, BookOpen, Layers3, Network, Sparkles } from "lucide-react";
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

type MemoryCourseListPageProps = {
  curricula: CurriculumPack[];
};

export function MemoryCourseListPage({
  curricula,
}: MemoryCourseListPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <Badge variant="secondary">Learner Memory</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Choose a course before reading learning memory.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            Memory is scoped by course, then organized by unit and concept. This
            keeps the product ready for more subjects without mixing signals
            from unrelated curricula.
          </p>
        </div>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              Platform model
            </Badge>
            <CardTitle>Course to unit to concept</CardTitle>
            <CardDescription>
              Learner memory follows the same hierarchy as the curriculum graph.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm leading-6 text-muted-foreground">
              <div className="rounded-lg border border-border bg-background/70 p-3">
                Course memory separates AP Calculus from future subjects.
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-3">
                Unit memory shows progress before drilling into concepts.
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-3">
                Concept memory powers recommendations and AI Teacher context.
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        {curricula.map((curriculum) => {
          const course = curriculum.course;

          return (
            <Card key={curriculum.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{course.subject}</Badge>
                  <Badge variant="secondary">
                    {curriculum.units.length} unit
                    {curriculum.units.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <CardTitle className="text-2xl leading-8">
                  {course.title}
                </CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Layers3 className="size-3.5" />
                      Units
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {curriculum.units.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Network className="size-3.5" />
                      Concepts
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {curriculum.concepts.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      Lessons
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {curriculum.lessons.length}
                    </p>
                  </div>
                </div>

                <Link
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full justify-between px-4",
                  )}
                  href={`/memory/${course.id}`}
                >
                  Open course memory
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}

        <Card className="border-dashed bg-muted/30">
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              Extensible memory slot
            </Badge>
            <CardTitle className="flex items-center gap-2 text-2xl leading-8">
              <Sparkles className="size-5 text-primary" />
              Future courses fit here
            </CardTitle>
            <CardDescription>
              A new curriculum pack gets its own course memory namespace, unit
              overview, and concept-level learner model.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
