import Link from "next/link";
import { BookOpen, Clock, Network, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AP_CALCULUS_AB_UNIT_1_ID,
  apCalculusABUnit1,
  apCalculusABUnit1Topics,
} from "@/features/knowledge/ap-calculus-ab";
import {
  getConceptsByUnit,
  getPrerequisiteConcepts,
} from "@/features/knowledge/get-concepts";
import type { ConceptDifficulty } from "@/features/knowledge/types";
import { cn } from "@/lib/utils";

const difficultyLabels: Record<ConceptDifficulty, string> = {
  foundational: "Foundational",
  developing: "Developing",
  advanced: "Advanced",
};

const difficultyBadgeVariant: Record<
  ConceptDifficulty,
  "default" | "secondary" | "outline"
> = {
  foundational: "secondary",
  developing: "outline",
  advanced: "default",
};

export default function LearnPage() {
  const concepts = getConceptsByUnit(AP_CALCULUS_AB_UNIT_1_ID);
  const totalMinutes = concepts.reduce(
    (sum, concept) => sum + concept.estimatedMinutes,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <Badge variant="outline">Learn</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Unit 1 concept graph for AP Calculus AB.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            Learning starts from concepts, not questions. This MVP knowledge
            graph turns limits into teachable nodes with prerequisites,
            learning objectives, misconceptions, and examples that can later
            power AI sessions and adaptive planning.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="size-4 text-primary" />
              {apCalculusABUnit1.title}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {apCalculusABUnit1.description}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Network className="size-4 text-primary" />
              {concepts.length} concept nodes
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {apCalculusABUnit1Topics.length} topics organized by dependency.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-4 text-primary" />
              {totalMinutes} minute learning path
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Estimated session time before application practice.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary">Unit 1 MVP graph</Badge>
            <h2 className="mt-3 text-2xl font-semibold">Concept list</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Each card is shaped around learning state: what the concept means,
            what students should be able to do, what can go wrong, and what
            must come first.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {concepts.map((concept, index) => {
            const prerequisites = getPrerequisiteConcepts(concept.id);
            const topic = apCalculusABUnit1Topics.find(
              (unitTopic) => unitTopic.id === concept.topicId,
            );

            return (
              <Card key={concept.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Concept {index + 1}</Badge>
                    <Badge variant={difficultyBadgeVariant[concept.difficulty]}>
                      {difficultyLabels[concept.difficulty]}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Clock className="size-3.5" />
                      {concept.estimatedMinutes} min
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-7">
                    {concept.title}
                  </CardTitle>
                  <CardDescription>{concept.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Topic
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {topic?.title ?? "Unit 1"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Prerequisites
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {prerequisites.length > 0 ? (
                        prerequisites.map((prerequisite) => (
                          <Badge key={prerequisite.id} variant="outline">
                            {prerequisite.title}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">Entry concept</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Target className="size-4 text-primary" />
                      Learning objectives
                    </div>
                    <ul className="mt-3 space-y-2">
                      {concept.learningObjectives.map((objective) => (
                        <li
                          className="rounded-lg border border-border bg-background/70 p-3 text-sm leading-6"
                          key={objective.id}
                        >
                          <span className="font-semibold">
                            {objective.title}:
                          </span>{" "}
                          {objective.description}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Common misconception
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        {concept.commonMisconceptions[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Example
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        {concept.examples[0].title}:{" "}
                        {concept.examples[0].description}
                      </p>
                    </div>
                  </div>

                  <Link
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-full justify-between px-4",
                    )}
                    href={`/learn/${concept.id}`}
                  >
                    Open structured lesson
                    <Target className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
