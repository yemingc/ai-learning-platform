"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  Clock,
  Lightbulb,
  Target,
  TriangleAlert,
} from "lucide-react";
import type { CurriculumPack } from "@/curricula/types";
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
  getLocalizedConcept,
  getLocalizedCourse,
} from "@/features/knowledge/concept-localization";
import type { Concept } from "@/features/knowledge/types";
import { fetchLearnerMemory } from "@/features/memory/memory-api-client";
import { getStudyRecommendation } from "@/features/memory/study-recommendations";
import type { ConceptMemory, LearnerMemory } from "@/features/memory/types";
import { cn } from "@/lib/utils";

type StudentDashboardSummaryProps = {
  curricula: CurriculumPack[];
};

type ConceptProgressItem = {
  concept: Concept;
  courseTitle: string;
  memory?: ConceptMemory;
  recommendation: ReturnType<typeof getStudyRecommendation>;
};

const actionPriority: Record<string, number> = {
  repair_misconception: 0,
  review_confusing_section: 1,
  review_prerequisite: 2,
  continue_learning: 3,
  needs_reflection: 4,
  start_lesson: 5,
  ready_for_application: 6,
};

const copy = {
  en: {
    noHistory: "No study history yet",
    loadError: "Unable to load dashboard progress.",
    averageReadiness: "Average readiness",
    studiedConcepts: "Studied concepts",
    reviewFocus: "Review focus",
    readyToApply: "Ready to apply",
    nextActionBadge: "Recommended next action",
    firstLesson: "Start your first lesson",
    firstConcept: "Begin with the first available concept lesson.",
    emptyRationale:
      "Once you ask the AI Teacher during a lesson, this dashboard will turn learning signals into a concrete next action.",
    suggestedPrompt: "Suggested AI Teacher prompt",
    defaultPrompt: "Help me start with intuition before formal notation.",
    recentLearning: "Recent learning",
    noInteraction: "No lesson interaction recorded yet.",
    misconception: "Misconception to repair",
    noMisconception: "No active misconception has been detected yet.",
    continueLearning: "Continue learning",
  },
  zh: {
    noHistory: "还没有学习记录",
    loadError: "无法加载仪表盘学习进度。",
    averageReadiness: "平均准备度",
    studiedConcepts: "已学习概念",
    reviewFocus: "需要关注",
    readyToApply: "可进入应用",
    nextActionBadge: "推荐下一步",
    firstLesson: "开始第一节课",
    firstConcept: "从第一节可用概念课开始。",
    emptyRationale:
      "在课程中向 AI 教师提问后，仪表盘会把学习信号转成具体的下一步动作。",
    suggestedPrompt: "推荐发给 AI 教师的问题",
    defaultPrompt: "请先用直观方式带我开始，不要一上来只讲符号。",
    recentLearning: "最近学习",
    noInteraction: "还没有课程互动记录。",
    misconception: "需要修复的误区",
    noMisconception: "当前没有检测到活跃误区。",
    continueLearning: "继续学习",
  },
};

function getRecommendationHref(
  recommendation: ReturnType<typeof getStudyRecommendation>,
) {
  const params = new URLSearchParams({
    action: recommendation.action,
    prompt: recommendation.suggestedPrompt,
    section: recommendation.targetSection,
    sectionId: recommendation.targetSectionId,
    source: "dashboard_recommendation",
  });

  return `/learn/${recommendation.targetConceptId}?${params.toString()}`;
}

function formatDate(value: string | undefined, language: "en" | "zh") {
  if (!value) {
    return copy[language].noHistory;
  }

  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function StudentDashboardSummary({
  curricula,
}: StudentDashboardSummaryProps) {
  const { language } = useLanguage();
  const pageCopy = copy[language];
  const [memoriesByCourse, setMemoriesByCourse] = useState<
    Record<string, LearnerMemory>
  >({});
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardMemory() {
      setIsLoading(true);
      setError(undefined);

      try {
        const memoryEntries = await Promise.all(
          curricula.map(async (curriculum) => {
            const memory = await fetchLearnerMemory(curriculum.course.id);

            return [curriculum.course.id, memory] as const;
          }),
        );

        if (isMounted) {
          setMemoriesByCourse(Object.fromEntries(memoryEntries));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error ? requestError.message : pageCopy.loadError,
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboardMemory();

    return () => {
      isMounted = false;
    };
  }, [curricula, pageCopy.loadError]);

  const summary = useMemo(() => {
    const progressItems = curricula.flatMap<ConceptProgressItem>(
      (curriculum) => {
        const memory = memoriesByCourse[curriculum.course.id];
        const conceptMemories = memory?.conceptMemories ?? {};
        const localizedConcepts = curriculum.concepts.map((concept) =>
          getLocalizedConcept(concept, language),
        );
        const course = getLocalizedCourse(curriculum.course, language);

        return curriculum.concepts.map((concept) => {
          const localizedConcept = getLocalizedConcept(concept, language);
          const conceptMemory = conceptMemories[concept.id];

          return {
            concept: localizedConcept,
            courseTitle: course.title,
            memory: conceptMemory,
            recommendation: getStudyRecommendation({
              concept: localizedConcept,
              conceptMemory,
              conceptMemories,
              concepts: localizedConcepts,
              language,
            }),
          };
        });
      },
    );
    const studiedItems = progressItems.filter((item) => item.memory);
    const averageReadiness =
      studiedItems.length > 0
        ? Math.round(
            studiedItems.reduce(
              (sum, item) => sum + (item.memory?.readiness ?? 0),
              0,
            ) / studiedItems.length,
          )
        : 0;
    const readyForApplication = studiedItems.filter(
      (item) =>
        (item.memory?.readiness ?? 0) >= 75 &&
        (item.memory?.misconceptions.length ?? 0) === 0,
    ).length;
    const reviewFocusCount = studiedItems.filter(
      (item) =>
        (item.memory?.misconceptions.length ?? 0) > 0 ||
        (item.memory?.memorySignalHistory ?? []).some(
          (signal) => signal.needsReview,
        ),
    ).length;
    const latestStudy = studiedItems
      .slice()
      .sort(
        (a, b) =>
          new Date(b.memory?.lastStudiedAt ?? 0).getTime() -
          new Date(a.memory?.lastStudiedAt ?? 0).getTime(),
      )[0];
    const topMisconception = studiedItems
      .flatMap((item) =>
        (item.memory?.misconceptions ?? []).map((misconception) => ({
          ...misconception,
          conceptTitle: item.concept.title,
        })),
      )
      .sort((a, b) => b.count - a.count)[0];
    const nextAction =
      progressItems
        .slice()
        .sort((a, b) => {
          const priorityA = actionPriority[a.recommendation.action] ?? 99;
          const priorityB = actionPriority[b.recommendation.action] ?? 99;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          return (a.memory?.readiness ?? 0) - (b.memory?.readiness ?? 0);
        })[0] ?? progressItems[0];

    return {
      averageReadiness,
      latestStudy,
      nextAction,
      readyForApplication,
      reviewFocusCount,
      studiedCount: studiedItems.length,
      topMisconception,
      totalConcepts: progressItems.length,
    };
  }, [curricula, language, memoriesByCourse]);

  return (
    <section className="mt-10 space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.averageReadiness}</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-5 text-primary" />
              {isLoading ? "--" : `${summary.averageReadiness}%`}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.studiedConcepts}</CardDescription>
            <CardTitle>
              {isLoading
                ? "--"
                : `${summary.studiedCount} / ${summary.totalConcepts}`}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.reviewFocus}</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-primary" />
              {isLoading ? "--" : summary.reviewFocusCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.readyToApply}</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="size-5 text-primary" />
              {isLoading ? "--" : summary.readyForApplication}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-learning-mint/30 bg-learning-mint/10">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              {pageCopy.nextActionBadge}
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5" />
              {summary.nextAction?.recommendation.title ?? pageCopy.firstLesson}
            </CardTitle>
            <CardDescription>
              {summary.nextAction
                ? `${summary.nextAction.courseTitle} - ${summary.nextAction.concept.title}`
                : pageCopy.firstConcept}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {summary.nextAction?.recommendation.rationale ??
                pageCopy.emptyRationale}
            </p>
            <div className="rounded-lg border border-border bg-background/80 p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {pageCopy.suggestedPrompt}
              </p>
              <p className="mt-2 text-sm leading-6">
                {summary.nextAction?.recommendation.suggestedPrompt ??
                  pageCopy.defaultPrompt}
              </p>
            </div>
            {summary.nextAction && (
              <Button asChild variant="outline">
                <Link href={getRecommendationHref(summary.nextAction.recommendation)}>
                  {summary.nextAction.recommendation.ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                {pageCopy.recentLearning}
              </CardTitle>
              <CardDescription>
                {summary.latestStudy
                  ? `${summary.latestStudy.concept.title} - ${formatDate(
                      summary.latestStudy.memory?.lastStudiedAt,
                      language,
                    )}`
                  : pageCopy.noInteraction}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="size-5" />
                {pageCopy.misconception}
              </CardTitle>
              <CardDescription>
                {summary.topMisconception
                  ? `${summary.topMisconception.conceptTitle}: ${summary.topMisconception.text}`
                  : pageCopy.noMisconception}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full justify-between",
                )}
                href="/learn"
              >
                {pageCopy.continueLearning}
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
