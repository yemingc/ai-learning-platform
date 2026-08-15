"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Route,
  Sparkles,
  Target,
} from "lucide-react";
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
import type { CurriculumPack } from "@/curricula/types";
import {
  localizeConcept,
  localizeCourse,
  localizeUnit,
} from "@/curricula/localization";
import { getLessonPath } from "@/curricula/routing";
import { getFormativeAssessmentProgress } from "@/features/assessment/assessment-progress";
import type { Concept } from "@/features/knowledge/types";
import { getStudyRecommendation } from "@/features/memory/study-recommendations";
import type { LearnerMemory } from "@/features/memory/types";
import { createAdaptiveLearningPlan } from "@/features/planner/adaptive-learning-plan";
import type {
  LearningPlan,
  LearningPlanStepStatus,
} from "@/features/planner/types";
import { cn } from "@/lib/utils";

type AdaptivePlanPageClientProps = {
  activePlan?: LearningPlan;
  curriculum: CurriculumPack;
  memory: Pick<LearnerMemory, "conceptMemories" | "updatedAt">;
};

const copy = {
  en: {
    badge: "Adaptive study plan",
    activatedBadge: "Confirmed Agent plan",
    title: "Know exactly what to learn next.",
    intro:
      "This plan combines prerequisite dependencies, server-scored assessment evidence, readiness, misconceptions, and recent review signals. It changes as your learning evidence changes.",
    planGoal: "Confirmed goal",
    sessionBudget: "Session budget",
    evidence: "Evidence-aware",
    evidenceDescription:
      "An exit ticket can complete a concept. AI conversations personalize support but cannot certify mastery on their own.",
    completed: "Completed",
    focusTime: "Focus time",
    locked: "Blocked nodes",
    updated: "Evidence updated",
    nextBadge: "Best next action",
    nextTitle: "Your next learning session",
    openLesson: "Start recommended session",
    focusQueue: "Current focus queue",
    focusQueueDescription:
      "Up to three unlocked concepts, ranked by learning need rather than course order alone.",
    fullPath: "Full concept path",
    fullPathDescription:
      "Every node remains visible so you can see what is complete, available, or waiting on a prerequisite.",
    readiness: "Readiness",
    diagnosticExit: "Diagnostic / exit",
    minutes: "min",
    noEvidence: "No evidence",
    completePlan: "Plan complete",
    completePlanDescription:
      "Every concept currently meets the evidence and readiness standard. Revisit the dashboard for review signals or continue into application work.",
    dashboard: "Open progress dashboard",
    status: {
      available: "Available",
      blocked_by_prerequisite: "Prerequisite locked",
      completed: "Completed",
      in_progress: "In progress",
      recommended: "Recommended",
    },
  },
  zh: {
    badge: "自适应学习计划",
    activatedBadge: "已确认的 Agent 计划",
    title: "清楚知道下一步该学什么。",
    intro:
      "计划会综合先修依赖、服务器评分的测评证据、准备度、误区和近期复习信号。学习证据变化后，优先级也会随之变化。",
    planGoal: "已确认目标",
    sessionBudget: "单次学习时长",
    evidence: "证据驱动",
    evidenceDescription:
      "离堂检查可以完成概念认证；AI 对话用于个性化支持，但不能单独证明掌握。",
    completed: "已完成",
    focusTime: "本轮时间",
    locked: "待解锁节点",
    updated: "证据更新时间",
    nextBadge: "最佳下一步",
    nextTitle: "你的下一次学习",
    openLesson: "开始推荐学习",
    focusQueue: "当前学习队列",
    focusQueueDescription:
      "最多展示三个已解锁概念，优先级由真实学习需要决定，而不只是课程顺序。",
    fullPath: "完整概念路径",
    fullPathDescription:
      "保留所有节点，帮助你看清哪些已完成、可以开始，或仍在等待先修概念。",
    readiness: "准备度",
    diagnosticExit: "诊断 / 离堂",
    minutes: "分钟",
    noEvidence: "暂无证据",
    completePlan: "当前计划已完成",
    completePlanDescription:
      "所有概念都达到了当前证据与准备度标准。可以到仪表盘检查复习信号，或继续进入应用任务。",
    dashboard: "打开学习仪表盘",
    status: {
      available: "可以开始",
      blocked_by_prerequisite: "等待先修",
      completed: "已完成",
      in_progress: "学习中",
      recommended: "优先推荐",
    },
  },
};

function getStatusIcon(status: LearningPlanStepStatus) {
  if (status === "completed") {
    return <CheckCircle2 className="size-4" />;
  }

  if (status === "blocked_by_prerequisite") {
    return <LockKeyhole className="size-4" />;
  }

  if (status === "recommended") {
    return <Sparkles className="size-4" />;
  }

  return <BookOpenCheck className="size-4" />;
}

function getStatusVariant(status: LearningPlanStepStatus) {
  return status === "recommended" || status === "completed"
    ? "secondary"
    : "outline";
}

function getRecommendationHref(
  recommendation: ReturnType<typeof getStudyRecommendation>,
  concept: Concept,
) {
  const params = new URLSearchParams({
    action: recommendation.action,
    prompt: recommendation.suggestedPrompt,
    section: recommendation.targetSection,
    sectionId: recommendation.targetSectionId,
    source: "memory_recommendation",
  });

  return `${getLessonPath(concept)}?${params.toString()}`;
}

function formatEvidenceDate(value: string, language: "en" | "zh") {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdaptivePlanPageClient({
  activePlan,
  curriculum,
  memory,
}: AdaptivePlanPageClientProps) {
  const { language } = useLanguage();
  const pageCopy = copy[language];
  const generatedPlan = createAdaptiveLearningPlan({
    curriculum,
    language,
    memory,
  });
  const plan = activePlan?.courseId === curriculum.course.id
    ? activePlan
    : generatedPlan;
  const course = localizeCourse(curriculum, language);
  const sourceUnit =
    curriculum.units.find((item) => item.id === curriculum.defaultUnitId) ??
    curriculum.units[0];

  if (!sourceUnit) {
    throw new Error("The curriculum needs at least one unit to build a plan.");
  }

  const unit = localizeUnit(curriculum, sourceUnit, language);
  const recommendedStep = plan.steps.find(
    (step) => step.status === "recommended",
  );
  const recommendedConcept = recommendedStep
    ? curriculum.concepts.find(
        (concept) => concept.id === recommendedStep.conceptId,
      )
    : undefined;
  const recommendation = recommendedConcept
    ? getStudyRecommendation({
        concept: recommendedConcept,
        conceptMemories: memory.conceptMemories,
        conceptMemory: memory.conceptMemories[recommendedConcept.id],
        concepts: curriculum.concepts,
        language,
      })
    : undefined;
  const completedCount = plan.steps.filter(
    (step) => step.status === "completed",
  ).length;
  const blockedCount = plan.steps.filter(
    (step) => step.status === "blocked_by_prerequisite",
  ).length;
  const focusMinutes = plan.steps
    .filter((step) => plan.focusConceptIds.includes(step.conceptId))
    .reduce((sum, step) => sum + step.estimatedMinutes, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <Badge variant="secondary">{pageCopy.badge}</Badge>
          {activePlan && (
            <Badge className="ml-2" variant="outline">
              {pageCopy.activatedBadge}
            </Badge>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{course.title}</Badge>
            <Badge variant="outline">{unit.title}</Badge>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            {pageCopy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            {pageCopy.intro}
          </p>
          {activePlan && (activePlan.goal || activePlan.minutesPerSession) && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {activePlan.goal && (
                <Badge variant="outline">
                  {pageCopy.planGoal}: {activePlan.goal}
                </Badge>
              )}
              {activePlan.minutesPerSession && (
                <Badge variant="outline">
                  {pageCopy.sessionBudget}: {activePlan.minutesPerSession} {pageCopy.minutes}
                </Badge>
              )}
            </div>
          )}
        </div>

        <Card className="border-learning-mint/30 bg-learning-mint/10">
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              {pageCopy.evidence}
            </Badge>
            <CardTitle className="flex items-center gap-2">
              <Brain className="size-5 text-primary" />
              {pageCopy.evidence}
            </CardTitle>
            <CardDescription>{pageCopy.evidenceDescription}</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.completed}</CardDescription>
            <CardTitle className="text-2xl">
              {completedCount} / {plan.steps.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.focusTime}</CardDescription>
            <CardTitle className="text-2xl">
              {focusMinutes} {pageCopy.minutes}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.locked}</CardDescription>
            <CardTitle className="text-2xl">{blockedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{pageCopy.updated}</CardDescription>
            <CardTitle className="text-base leading-6">
              {formatEvidenceDate(memory.updatedAt, language)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      {recommendedStep && recommendedConcept && recommendation ? (
        <section className="mt-10">
          <Card className="overflow-hidden border-learning-blue/30 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted))_100%)]">
            <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
              <div>
                <Badge variant="secondary">{pageCopy.nextBadge}</Badge>
                <p className="mt-4 text-sm font-semibold text-muted-foreground">
                  {pageCopy.nextTitle}
                </p>
                <h2 className="mt-2 text-3xl font-semibold leading-tight">
                  {localizeConcept(curriculum, recommendedConcept, language).title}
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {recommendedStep.rationale}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <Clock3 className="mr-1 size-3.5" />
                    {recommendedStep.estimatedMinutes} {pageCopy.minutes}
                  </Badge>
                  <Badge variant="outline">{recommendation.actionLabel}</Badge>
                  <Badge variant="outline">
                    {recommendation.applicationGate.label}
                  </Badge>
                </div>
              </div>
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 justify-between px-5 lg:min-w-60",
                )}
                href={getRecommendationHref(recommendation, recommendedConcept)}
              >
                {pageCopy.openLesson}
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="mt-10">
          <Card className="border-learning-mint/30 bg-learning-mint/10">
            <CardHeader>
              <Badge className="w-fit" variant="secondary">
                <CheckCircle2 className="mr-1 size-3.5" />
                {pageCopy.completePlan}
              </Badge>
              <CardTitle className="text-2xl">{pageCopy.completePlan}</CardTitle>
              <CardDescription>{pageCopy.completePlanDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                className={buttonVariants({ variant: "outline" })}
                href="/dashboard"
              >
                {pageCopy.dashboard}
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </section>
      )}

      {plan.focusConceptIds.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Target className="size-4" />
                {pageCopy.focusQueue}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {pageCopy.focusQueue}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {pageCopy.focusQueueDescription}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {plan.focusConceptIds.map((conceptId, index) => {
              const step = plan.steps.find(
                (item) => item.conceptId === conceptId,
              );
              const concept = curriculum.concepts.find(
                (item) => item.id === conceptId,
              );

              if (!step || !concept) {
                return null;
              }

              return (
                <Card key={concept.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant={getStatusVariant(step.status)}>
                        {getStatusIcon(step.status)}
                        <span className="ml-1">
                          {pageCopy.status[step.status]}
                        </span>
                      </Badge>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <CardTitle className="pt-2 text-xl leading-7">
                      {localizeConcept(curriculum, concept, language).title}
                    </CardTitle>
                    <CardDescription>{step.rationale}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full justify-between",
                      )}
                      href={getLessonPath(concept)}
                    >
                      {step.estimatedMinutes} {pageCopy.minutes}
                      <ArrowRight className="size-4" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-14">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Route className="size-4" />
          {pageCopy.fullPath}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">{pageCopy.fullPath}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {pageCopy.fullPathDescription}
        </p>

        <div className="mt-6 grid gap-3">
          {plan.steps.map((step) => {
            const concept = curriculum.concepts.find(
              (item) => item.id === step.conceptId,
            );

            if (!concept) {
              return null;
            }

            const conceptMemory = memory.conceptMemories[concept.id];
            const progress = getFormativeAssessmentProgress(
              conceptMemory?.assessmentAttempts,
            );

            return (
              <div
                className={cn(
                  "grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[auto_1fr] sm:items-start lg:grid-cols-[auto_1fr_auto] lg:items-center",
                  step.status === "recommended" &&
                    "border-learning-blue/40 bg-learning-blue/5",
                  step.status === "blocked_by_prerequisite" && "bg-muted/30",
                )}
                key={step.id}
              >
                <div className="grid size-9 place-items-center rounded-lg border border-border bg-background text-sm font-semibold">
                  {step.sequence}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {localizeConcept(curriculum, concept, language).title}
                    </p>
                    <Badge variant={getStatusVariant(step.status)}>
                      {getStatusIcon(step.status)}
                      <span className="ml-1">{pageCopy.status[step.status]}</span>
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.rationale}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:col-start-2 lg:col-start-auto lg:justify-end">
                  <Badge variant="outline">
                    {pageCopy.readiness}: {conceptMemory?.readiness ?? 0}%
                  </Badge>
                  <Badge variant="outline">
                    {pageCopy.diagnosticExit}: {progress.diagnosticScore ?? "—"} / {progress.exitTicketScore ?? "—"}
                  </Badge>
                  {step.status === "blocked_by_prerequisite" ? (
                    <span
                      aria-label={pageCopy.status.blocked_by_prerequisite}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "text-muted-foreground",
                      )}
                      role="img"
                    >
                      <LockKeyhole className="size-4" />
                    </span>
                  ) : (
                    <Link
                      aria-label={`${pageCopy.openLesson}: ${localizeConcept(curriculum, concept, language).title}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "icon",
                      })}
                      href={getLessonPath(concept)}
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
