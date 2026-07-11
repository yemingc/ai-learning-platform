"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Layers3, Network, Sparkles } from "lucide-react";
import type { CurriculumPack } from "@/curricula/types";
import { localizeCourse } from "@/curricula/localization";
import { useLanguage } from "@/components/i18n/language-provider";
import { StudentDashboardSummary } from "@/components/dashboard/student-dashboard-summary";
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

const copy = {
  en: {
    badge: "Learning dashboard",
    title: "Track learning progress across your courses.",
    intro:
      "Choose a course to see concept readiness, common misconceptions, repair suggestions, and application readiness. The platform keeps progress scoped by course, unit, and concept.",
    modelBadge: "Platform model",
    modelTitle: "Course to unit to concept",
    modelDescription:
      "Progress follows the same hierarchy as the curriculum graph.",
    modelNotes: [
      "Course progress keeps every subject and course version separate.",
      "Unit progress shows readiness before drilling into concepts.",
      "Concept signals power recommendations and AI Teacher context.",
    ],
    units: "Units",
    concepts: "Concepts",
    lessons: "Lessons",
    openCourse: "Open course dashboard",
    extensible: "Extensible progress slot",
    futureTitle: "Future courses fit here",
    futureDescription:
      "A new curriculum pack gets its own course dashboard, unit overview, and concept-level learning model.",
    unitCount: (count: number) => `${count} unit${count === 1 ? "" : "s"}`,
  },
  zh: {
    badge: "学习仪表盘",
    title: "查看你在不同课程中的学习进度。",
    intro:
      "选择一门课程，查看概念掌握度、常见误区、修复建议和应用准备度。平台会按照课程、Unit、概念三个层级组织学习记录。",
    modelBadge: "平台模型",
    modelTitle: "课程 → Unit → 概念",
    modelDescription: "学习进度和课程知识图谱使用同一套层级结构。",
    modelNotes: [
      "课程级进度会把不同学科和课程版本彼此隔离。",
      "Unit 级进度先看模块整体状态，再下钻到概念。",
      "概念级信号会进入 AI 教师上下文和后续学习建议。",
    ],
    units: "Unit",
    concepts: "概念",
    lessons: "课程",
    openCourse: "打开课程仪表盘",
    extensible: "可扩展进度位",
    futureTitle: "未来课程也会出现在这里",
    futureDescription:
      "每个新课程包都会拥有自己的课程仪表盘、Unit 总览和概念级学习模型。",
    unitCount: (count: number) => `${count} 个 Unit`,
  },
};

export function MemoryCourseListPage({
  curricula,
}: MemoryCourseListPageProps) {
  const { language } = useLanguage();
  const pageCopy = copy[language];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <Badge variant="secondary">{pageCopy.badge}</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            {pageCopy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            {pageCopy.intro}
          </p>
        </div>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              {pageCopy.modelBadge}
            </Badge>
            <CardTitle>{pageCopy.modelTitle}</CardTitle>
            <CardDescription>{pageCopy.modelDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm leading-6 text-muted-foreground">
              {pageCopy.modelNotes.map((note) => (
                <div
                  className="rounded-lg border border-border bg-background/70 p-3"
                  key={note}
                >
                  {note}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <StudentDashboardSummary curricula={curricula} />

      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        {curricula.map((curriculum) => {
          const course = localizeCourse(curriculum, language);

          return (
            <Card key={curriculum.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{course.subject}</Badge>
                  <Badge variant="secondary">
                    {pageCopy.unitCount(curriculum.units.length)}
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
                      {pageCopy.units}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {curriculum.units.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Network className="size-3.5" />
                      {pageCopy.concepts}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {curriculum.concepts.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      {pageCopy.lessons}
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
                  href={`/dashboard/${curriculum.course.id}`}
                >
                  {pageCopy.openCourse}
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
              <Sparkles className="size-5 text-primary" />
              {pageCopy.futureTitle}
            </CardTitle>
            <CardDescription>{pageCopy.futureDescription}</CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
