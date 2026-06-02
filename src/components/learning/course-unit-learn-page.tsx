"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Network, Target } from "lucide-react";
import type { CurriculumPack } from "@/curricula/types";
import { useLanguage } from "@/components/i18n/language-provider";
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
  getConceptsByUnit,
  getPrerequisiteConcepts,
} from "@/features/knowledge/get-concepts";
import {
  getLocalizedConcept,
  getLocalizedCourse,
  getLocalizedTopic,
  getLocalizedUnit,
} from "@/features/knowledge/concept-localization";
import type { ConceptDifficulty } from "@/features/knowledge/types";
import { cn } from "@/lib/utils";

const difficultyLabels = {
  en: {
    foundational: "Foundational",
    developing: "Developing",
    advanced: "Advanced",
  },
  zh: {
    foundational: "基础",
    developing: "进阶中",
    advanced: "挑战",
  },
} satisfies Record<string, Record<ConceptDifficulty, string>>;

const difficultyBadgeVariant: Record<
  ConceptDifficulty,
  "default" | "secondary" | "outline"
> = {
  foundational: "secondary",
  developing: "outline",
  advanced: "default",
};

const copy = {
  en: {
    back: (courseTitle: string) => `Back to ${courseTitle} units`,
    unit: "Unit",
    heading: (unitTitle: string) => `${unitTitle} concept graph.`,
    intro: (courseTitle: string) =>
      `This unit is one module inside ${courseTitle}. Students move through concepts, prerequisite links, static lessons, AI Teacher support, and learner memory before application practice.`,
    conceptNodes: (count: number) => `${count} concept nodes`,
    topicsInUnit: (count: number, unitTitle: string) => `${count} topics in ${unitTitle}.`,
    minutePath: (minutes: number) => `${minutes} minute learning path`,
    estimate: "Estimated session time before application practice.",
    moduleBadge: (unitTitle: string) => `${unitTitle} - curriculum pack module`,
    conceptList: "Concept list",
    conceptListIntro:
      "Each card is shaped around learning state: what the concept means, what students should be able to do, what can go wrong, and what must come first.",
    concept: "Concept",
    min: "min",
    topic: "Topic",
    prerequisites: "Prerequisites",
    entry: "Entry concept",
    learningObjectives: "Learning objectives",
    commonMisconception: "Common misconception",
    example: "Example",
    openLesson: "Open structured lesson",
  },
  zh: {
    back: (courseTitle: string) => `返回 ${courseTitle} 的 Unit 列表`,
    unit: "Unit",
    heading: (unitTitle: string) => `${unitTitle} 概念图`,
    intro: (courseTitle: string) =>
      `这个 Unit 是 ${courseTitle} 课程包中的一个模块。学生会沿着概念、先修关系、结构化课程、AI 教师支持和学习记忆逐步推进，准备好后再进入应用练习。`,
    conceptNodes: (count: number) => `${count} 个概念节点`,
    topicsInUnit: (count: number, unitTitle: string) => `${unitTitle} 中有 ${count} 个主题。`,
    minutePath: (minutes: number) => `${minutes} 分钟学习路径`,
    estimate: "这是进入应用练习前的预计学习时间。",
    moduleBadge: (unitTitle: string) => `${unitTitle} - 课程模块`,
    conceptList: "概念列表",
    conceptListIntro:
      "每张卡片都围绕学习状态设计：这个概念是什么意思、学生应该会做什么、容易错在哪里，以及需要哪些先修概念。",
    concept: "概念",
    min: "分钟",
    topic: "主题",
    prerequisites: "先修概念",
    entry: "入口概念",
    learningObjectives: "学习目标",
    commonMisconception: "常见误区",
    example: "例子",
    openLesson: "进入结构化课程",
  },
};

type CourseUnitLearnPageProps = {
  curriculum: CurriculumPack;
  unitId: string;
};

export function CourseUnitLearnPage({
  curriculum,
  unitId,
}: CourseUnitLearnPageProps) {
  const { language } = useLanguage();
  const pageCopy = copy[language];
  const course = getLocalizedCourse(curriculum.course, language);
  const activeUnit = curriculum.units.find((unit) => unit.id === unitId);

  if (!activeUnit) {
    throw new Error(`Unit ${unitId} does not exist in ${course.id}.`);
  }

  const displayUnit = getLocalizedUnit(activeUnit, language);
  const activeUnitTopics = curriculum.topics.filter(
    (topic) => topic.unitId === activeUnit.id,
  );
  const concepts = getConceptsByUnit(activeUnit.id, curriculum.course.id);
  const totalMinutes = concepts.reduce(
    (sum, concept) => sum + concept.estimatedMinutes,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Link
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-8")}
        href={`/courses/${curriculum.course.id}/learn`}
      >
        <ArrowLeft className="size-4" />
        {pageCopy.back(course.shortTitle ?? course.title)}
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <Badge variant="outline">
            {pageCopy.unit} {activeUnit.sequence}
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            {pageCopy.heading(displayUnit.title)}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            {pageCopy.intro(course.title)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="size-4 text-primary" />
              {course.title}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {course.description}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Network className="size-4 text-primary" />
              {pageCopy.conceptNodes(concepts.length)}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {pageCopy.topicsInUnit(activeUnitTopics.length, displayUnit.title)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-4 text-primary" />
              {pageCopy.minutePath(totalMinutes)}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {pageCopy.estimate}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary">
              {pageCopy.moduleBadge(displayUnit.title)}
            </Badge>
            <h2 className="mt-3 text-2xl font-semibold">
              {pageCopy.conceptList}
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {pageCopy.conceptListIntro}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {concepts.map((concept, index) => {
            const displayConcept = getLocalizedConcept(concept, language);
            const prerequisites = getPrerequisiteConcepts(
              concept.id,
              curriculum.course.id,
            ).map((prerequisite) => getLocalizedConcept(prerequisite, language));
            const topic = activeUnitTopics.find(
              (unitTopic) => unitTopic.id === concept.topicId,
            );
            const displayTopic = topic
              ? getLocalizedTopic(topic, language)
              : displayUnit;

            return (
              <Card key={concept.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {pageCopy.concept} {index + 1}
                    </Badge>
                    <Badge variant={difficultyBadgeVariant[concept.difficulty]}>
                      {difficultyLabels[language][concept.difficulty]}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Clock className="size-3.5" />
                      {concept.estimatedMinutes} {pageCopy.min}
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-7">
                    {displayConcept.title}
                  </CardTitle>
                  <CardDescription>{displayConcept.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {pageCopy.topic}
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {displayTopic.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {pageCopy.prerequisites}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {prerequisites.length > 0 ? (
                        prerequisites.map((prerequisite) => (
                          <Badge key={prerequisite.id} variant="outline">
                            {prerequisite.title}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">{pageCopy.entry}</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Target className="size-4 text-primary" />
                      {pageCopy.learningObjectives}
                    </div>
                    <ul className="mt-3 space-y-2">
                      {displayConcept.learningObjectives.map((objective) => (
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
                        {pageCopy.commonMisconception}
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        {displayConcept.commonMisconceptions[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        {pageCopy.example}
                      </p>
                      <p className="mt-2 text-sm leading-6">
                        {displayConcept.examples[0].title}: {" "}
                        {displayConcept.examples[0].description}
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
                    {pageCopy.openLesson}
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
