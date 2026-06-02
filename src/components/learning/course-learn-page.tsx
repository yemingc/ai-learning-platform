"use client";

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
  getLocalizedCourse,
  getLocalizedUnit,
} from "@/features/knowledge/concept-localization";
import { cn } from "@/lib/utils";

type CourseLearnPageProps = {
  curriculum: CurriculumPack;
};

const copy = {
  en: {
    back: "Back to all courses",
    badge: "Course pack",
    heading: (title: string) =>
      `${title} is one course inside the learning platform.`,
    intro:
      "Choose a unit to enter its concept graph. The platform architecture stays reusable: a course owns units, units own concepts, and lessons plus AI Teacher support attach to each concept.",
    unitAvailable: (count: number) => `${count} unit${count === 1 ? "" : "s"} available`,
    moreUnits: "More units can be added as new curriculum modules.",
    structuredLearning: (minutes: number) => `${minutes} minutes of structured learning`,
    structuredDescription:
      "Static lessons first, AI Teacher support during reading, practice after readiness.",
    courseUnits: "Course units",
    selectUnit: "Select a unit learning map",
    layerNote:
      "This page is intentionally one layer above the concept list, so AP Calculus AB behaves like a replaceable course pack instead of the whole product.",
    unit: "Unit",
    concepts: "concepts",
    min: "min",
    topics: "Topics",
    conceptsLabel: "Concepts",
    minutes: "Minutes",
    conceptsInUnit: "Concepts in this unit",
    openUnit: "Open unit concept graph",
    extensible: "Extensible curriculum slot",
    addUnit: "Add the next unit later",
    addUnitDescription:
      "Future curriculum packs can add more units without changing the learning runtime. The same structure can also support a completely different subject.",
    modelNote:
      "Course to Unit to Topic to Concept stays the stable domain model. Lessons, memory, AI Teacher context, and application readiness attach to concept nodes.",
  },
  zh: {
    back: "返回全部课程",
    badge: "课程包",
    heading: (title: string) => `${title} 是平台中的一门课程。`,
    intro:
      "选择一个 Unit 进入它的概念图。平台结构保持可复用：课程拥有 Unit，Unit 拥有概念，结构化课程、AI 教师和学习记忆都挂在概念节点上。",
    unitAvailable: (count: number) => `${count} 个 Unit 可学习`,
    moreUnits: "之后可以继续添加新的课程模块。",
    structuredLearning: (minutes: number) => `${minutes} 分钟结构化学习`,
    structuredDescription:
      "先学静态课程，阅读过程中由 AI 教师辅助，准备充分后再进入应用练习。",
    courseUnits: "课程 Unit",
    selectUnit: "选择一个 Unit 学习地图",
    layerNote:
      "这一页故意放在概念列表上一层，让 AP 微积分 AB（AP Calculus AB）表现为可替换的课程包，而不是整个平台的全部内容。",
    unit: "Unit",
    concepts: "个概念",
    min: "分钟",
    topics: "主题",
    conceptsLabel: "概念",
    minutes: "分钟",
    conceptsInUnit: "本 Unit 的概念",
    openUnit: "打开 Unit 概念图",
    extensible: "可扩展课程位",
    addUnit: "以后继续添加下一个 Unit",
    addUnitDescription:
      "未来课程包可以继续添加更多 Unit，而不用改学习引擎。相同结构也能支持完全不同的学科。",
    modelNote:
      "Course → Unit → Topic → Concept 是稳定领域模型。课程、记忆、AI 教师上下文和应用准备度都挂在概念节点上。",
  },
};

export function CourseLearnPage({ curriculum }: CourseLearnPageProps) {
  const { language } = useLanguage();
  const pageCopy = copy[language];
  const course = getLocalizedCourse(curriculum.course, language);
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
        {pageCopy.back}
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <Badge variant="outline">{pageCopy.badge}</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            {pageCopy.heading(course.title)}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            {pageCopy.intro}
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
              {pageCopy.unitAvailable(curriculum.units.length)}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {pageCopy.moreUnits}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-4 text-primary" />
              {pageCopy.structuredLearning(totalMinutes)}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {pageCopy.structuredDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary">{pageCopy.courseUnits}</Badge>
            <h2 className="mt-3 text-2xl font-semibold">
              {pageCopy.selectUnit}
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {pageCopy.layerNote}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {curriculum.units.map((unit) => {
            const displayUnit = getLocalizedUnit(unit, language);
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
                    <Badge variant="outline">
                      {pageCopy.unit} {unit.sequence}
                    </Badge>
                    <Badge variant="secondary">
                      {unitConcepts.length}{pageCopy.concepts}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Clock className="size-3.5" />
                      {unit.estimatedMinutes} {pageCopy.min}
                    </span>
                  </div>
                  <CardTitle className="text-2xl leading-8">
                    {displayUnit.title}
                  </CardTitle>
                  <CardDescription>{displayUnit.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-background/70 p-3">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                        <Network className="size-3.5" />
                        {pageCopy.topics}
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {unitTopics.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/70 p-3">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                        <Target className="size-3.5" />
                        {pageCopy.conceptsLabel}
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {unitConcepts.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background/70 p-3">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                        <Clock className="size-3.5" />
                        {pageCopy.minutes}
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {unit.estimatedMinutes}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {pageCopy.conceptsInUnit}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {unitConcepts.slice(0, 5).map((concept) => (
                        <Badge key={concept.id} variant="outline">
                          {language === "zh"
                            ? concept.id === "what-is-a-limit"
                              ? "什么是极限（limit）？"
                              : concept.id === "limit-notation"
                                ? "极限符号（limit notation）"
                                : concept.id === "estimating-limits-from-graphs"
                                  ? "从图像估计极限（estimating limits from graphs）"
                                  : concept.id === "one-sided-limits"
                                    ? "单侧极限（one-sided limits）"
                                    : concept.id === "infinite-limits"
                                      ? "无穷极限（infinite limits）"
                                      : concept.title
                            : concept.title}
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
                    {pageCopy.openUnit}
                    <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}

          <Card className="border-dashed bg-muted/30">
            <CardHeader>
              <Badge className="w-fit" variant="outline">
                {pageCopy.extensible}
              </Badge>
              <CardTitle className="flex items-center gap-2 text-2xl leading-8">
                <Plus className="size-5 text-primary" />
                {pageCopy.addUnit}
              </CardTitle>
              <CardDescription>{pageCopy.addUnitDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                {pageCopy.modelNote}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
