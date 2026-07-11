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
import { localizeCourse, localizeUnit } from "@/curricula/localization";
import { useLanguage } from "@/components/i18n/language-provider";
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
import { getActiveMisconceptions } from "@/features/memory/misconception-lifecycle";
import { getCurrentLearningSignals } from "@/features/memory/current-learning-signals";
import { cn } from "@/lib/utils";

type CourseMemoryPageClientProps = {
  curriculum: CurriculumPack;
};

const copy = {
  en: {
    notStudied: "Not studied yet",
    loadError: "Unable to load learning progress.",
    back: "Back to dashboard",
    badge: "Course progress",
    title: (courseTitle: string) => `Choose a unit in ${courseTitle}.`,
    intro:
      "Course-level progress summarizes all units, while concept details stay inside each selected unit. That keeps learning signals readable as the curriculum grows.",
    source: "Progress source",
    updated: "Updated",
    reset: "Reset course progress",
    resetQuestion: "Reset all course progress?",
    resetWarning:
      "This permanently removes assessments, AI interactions, readiness, and misconception history for this course.",
    cancel: "Cancel",
    confirmReset: "Yes, reset progress",
    resetting: "Resetting...",
    units: "Units",
    studiedConcepts: "Studied concepts",
    aiInteractions: "AI interactions",
    reviewSignals: "Review signals",
    unit: "Unit",
    concepts: "concepts",
    studied: "Studied",
    ready: "Ready",
    chats: "Chats",
    review: "Review",
    openUnit: "Open unit progress",
  },
  zh: {
    notStudied: "还没有学习记录",
    loadError: "无法加载学习进度。",
    back: "返回仪表盘",
    badge: "课程进度",
    title: (courseTitle: string) => `选择 ${courseTitle} 中的一个 Unit。`,
    intro:
      "课程级进度负责总结所有 Unit，概念级细节保留在每个 Unit 内部。这样课程扩展后，学习信号仍然清晰可读。",
    source: "进度来源",
    updated: "更新时间",
    reset: "重置本课程进度",
    resetQuestion: "确认重置整门课程的进度？",
    resetWarning:
      "这会永久删除本课程的测评、AI 互动、准备度和误区历史，且无法撤销。",
    cancel: "取消",
    confirmReset: "确认清空进度",
    resetting: "正在重置...",
    units: "Unit",
    studiedConcepts: "已学习概念",
    aiInteractions: "AI 互动",
    reviewSignals: "复习信号",
    unit: "Unit",
    concepts: "个概念",
    studied: "已学",
    ready: "准备度",
    chats: "对话",
    review: "复习",
    openUnit: "打开 Unit 进度",
  },
};

function formatDate(
  value: string | undefined,
  language: "en" | "zh",
) {
  if (!value) {
    return copy[language].notStudied;
  }

  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CourseMemoryPageClient({
  curriculum,
}: CourseMemoryPageClientProps) {
  const { language } = useLanguage();
  const pageCopy = copy[language];
  const course = localizeCourse(curriculum, language);
  const [memory, setMemory] = useState<LearnerMemory | undefined>();
  const [memoryError, setMemoryError] = useState<string | undefined>();
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const courseIdRef = useRef(curriculum.course.id);

  useEffect(() => {
    async function syncMemory() {
      try {
        setMemory(await fetchLearnerMemory(courseIdRef.current));
        setMemoryError(undefined);
      } catch (error) {
        setMemoryError(
          error instanceof Error ? error.message : pageCopy.loadError,
        );
      }
    }

    void syncMemory();
    window.addEventListener(MEMORY_UPDATED_EVENT, syncMemory);

    return () => {
      window.removeEventListener(MEMORY_UPDATED_EVENT, syncMemory);
    };
  }, [pageCopy.loadError]);

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
          getCurrentLearningSignals(conceptMemory).filter(
            (signal) => signal.needsReview,
          ).length,
        0,
      );
      const trapCount = unitMemories.reduce(
        (sum, conceptMemory) =>
          sum + getActiveMisconceptions(conceptMemory?.misconceptions).length,
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
        href="/dashboard"
      >
        <ArrowLeft className="size-4" />
        {pageCopy.back}
      </Link>

      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <Badge variant="secondary">{pageCopy.badge}</Badge>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{course.subject}</Badge>
            <Badge variant="outline">{course.title}</Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            {pageCopy.title(course.title)}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            {pageCopy.intro}
          </p>
        </div>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              {pageCopy.source}
            </Badge>
            <CardTitle>{memory?.source ?? "loading"}</CardTitle>
            <CardDescription>
              {pageCopy.updated}: {formatDate(memory?.updatedAt, language)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isResetConfirming ? (
              <div
                aria-live="polite"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3"
              >
                <p className="text-sm font-semibold">
                  {pageCopy.resetQuestion}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {pageCopy.resetWarning}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Button
                    disabled={isResetting}
                    onClick={() => setIsResetConfirming(false)}
                    type="button"
                    variant="outline"
                  >
                    {pageCopy.cancel}
                  </Button>
                  <Button
                    disabled={isResetting}
                    onClick={async () => {
                      setIsResetting(true);

                      try {
                        setMemory(
                          await resetLearnerMemory(curriculum.course.id),
                        );
                        setMemoryError(undefined);
                        setIsResetConfirming(false);
                      } catch (error) {
                        setMemoryError(
                          error instanceof Error
                            ? error.message
                            : pageCopy.loadError,
                        );
                      } finally {
                        setIsResetting(false);
                      }
                    }}
                    type="button"
                    variant="destructive"
                  >
                    <RotateCcw className="size-4" />
                    {isResetting
                      ? pageCopy.resetting
                      : pageCopy.confirmReset}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => setIsResetConfirming(true)}
                type="button"
                variant="outline"
              >
                <RotateCcw className="size-4" />
                {pageCopy.reset}
              </Button>
            )}
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
            <CardDescription>{pageCopy.units}</CardDescription>
            <CardTitle>{curriculum.units.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.studiedConcepts}</CardDescription>
            <CardTitle>
              {studiedConceptCount} / {curriculum.concepts.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.aiInteractions}</CardDescription>
            <CardTitle>{totalInteractions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.reviewSignals}</CardDescription>
            <CardTitle>{totalReviewSignals}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        {unitSummaries.map((summary) => {
          const displayUnit = localizeUnit(curriculum, summary.unit, language);

          return (
            <Card key={summary.unit.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {pageCopy.unit} {summary.unit.sequence}
                  </Badge>
                  <Badge variant="secondary">
                    {summary.unitConcepts.length}{pageCopy.concepts}
                  </Badge>
                </div>
                <CardTitle className="text-2xl leading-8">
                  {displayUnit.title}
                </CardTitle>
                <CardDescription>{displayUnit.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Layers3 className="size-3.5" />
                      {pageCopy.studied}
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {summary.studiedCount}/{summary.unitConcepts.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Brain className="size-3.5" />
                      {pageCopy.ready}
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {summary.averageReadiness}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <MessageSquare className="size-3.5" />
                      {pageCopy.chats}
                    </p>
                    <p className="mt-2 text-xl font-semibold">
                      {summary.interactionCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <TriangleAlert className="size-3.5" />
                      {pageCopy.review}
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
                  href={`/dashboard/${curriculum.course.id}/${summary.unit.id}`}
                >
                  {pageCopy.openUnit}
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
