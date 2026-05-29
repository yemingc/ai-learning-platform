"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Compass,
  Lightbulb,
  MessageSquare,
  PenLine,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { AiTeacherChatPanel } from "@/components/learning/ai-teacher-chat-panel";
import { AskAboutSectionButton } from "@/components/learning/ask-about-section-button";
import { LessonSelectionActions } from "@/components/learning/lesson-selection-actions";
import { LessonMemorySummary } from "@/components/memory/lesson-memory-summary";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Concept } from "@/features/knowledge/types";
import { getLocalizedLessonContent } from "@/features/lessons/lesson-localization";
import type { LessonContent } from "@/features/lessons/types";
import { cn } from "@/lib/utils";

type LessonPageClientProps = {
  concept: Concept;
  lesson: LessonContent;
  previousLesson?: LessonContent;
  nextLesson?: LessonContent;
};

type ExecutableStudyAction =
  | "start_lesson"
  | "continue_learning"
  | "repair_misconception"
  | "review_prerequisite"
  | "review_confusing_section"
  | "ready_for_application"
  | "needs_reflection";

type LessonSectionId =
  | "why"
  | "intuition"
  | "formal"
  | "worked"
  | "guided"
  | "trap"
  | "reflection"
  | "application"
  | "takeaways";

const copy = {
  en: {
    back: "Back to concept graph",
    badge: "Static lesson + AI teacher context",
    intro:
      "This lesson is maintained as structured curriculum content in the codebase. The AI Teacher chat is designed to use this lesson, the current concept, the current section, and learner memory later as context for interactive support.",
    objective: "Learning objective",
    lessonFlow: "Lesson flow",
    hint: "Hint:",
    targetInsight: "Target insight:",
    sentenceStarter: "Sentence starter:",
    sections: {
      why: {
        eyebrow: "Why this matters",
        title: "Start with purpose before procedure.",
      },
      intuition: {
        eyebrow: "Intuition",
        title: "Build the mental picture first.",
      },
      formal: {
        eyebrow: "Formal idea",
        title: "Name the idea precisely.",
      },
      worked: {
        eyebrow: "Worked example",
      },
      guided: {
        eyebrow: "Think with me",
        title: "Pause for guided reasoning.",
      },
      trap: {
        eyebrow: "Common trap",
        title: "Catch the misconception before it hardens.",
      },
      reflection: {
        eyebrow: "Reflection",
        title: "Make the learning visible.",
      },
      application: {
        eyebrow: "Try applying it",
      },
      takeaways: {
        eyebrow: "Key takeaways",
        title: "What should stick.",
      },
    },
    fullContext: "Full lesson context",
  },
  zh: {
    back: "返回概念图（concept graph）",
    badge: "静态课程（static lesson）+ AI 教师上下文（AI teacher context）",
    intro:
      "这节课作为结构化课程内容（structured curriculum content）维护在代码库中。AI 教师（AI Teacher）会基于当前课程（lesson）、当前概念（concept）、当前段落（section），以及之后接入的学习者记忆（learner memory）来提供互动支持。",
    objective: "学习目标（learning objective）",
    lessonFlow: "学习流程（lesson flow）",
    hint: "提示（hint）：",
    targetInsight: "目标洞察（target insight）：",
    sentenceStarter: "句子开头（sentence starter）：",
    sections: {
      why: {
        eyebrow: "为什么重要（Why this matters）",
        title: "先建立目的，再进入步骤。",
      },
      intuition: {
        eyebrow: "直觉（Intuition）",
        title: "先建立心理图像（mental picture）。",
      },
      formal: {
        eyebrow: "形式化想法（Formal idea）",
        title: "准确命名这个概念（concept）。",
      },
      worked: {
        eyebrow: "例题讲解（Worked example）",
      },
      guided: {
        eyebrow: "一起思考（Think with me）",
        title: "暂停一下，做引导推理（guided reasoning）。",
      },
      trap: {
        eyebrow: "常见误区（Common trap）",
        title: "在误区固化前先抓住它。",
      },
      reflection: {
        eyebrow: "反思（Reflection）",
        title: "让学习过程变得可见。",
      },
      application: {
        eyebrow: "尝试应用（Try applying it）",
      },
      takeaways: {
        eyebrow: "关键收获（Key takeaways）",
        title: "哪些内容应该留下来。",
      },
    },
    fullContext: "完整课程上下文（Full lesson context）",
  },
};

function LessonSection({
  eyebrow,
  title,
  sectionId,
  icon,
  lessonFlowLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  sectionId: LessonSectionId;
  icon: React.ReactNode;
  lessonFlowLabel: string;
  children: React.ReactNode;
}) {
  const section = `${eyebrow}: ${title}`;

  return (
    <section
      className="grid gap-4 border-t border-border py-8 md:grid-cols-[13rem_1fr]"
      data-lesson-section={section}
      id={`lesson-section-${sectionId}`}
    >
      <div>
        <Badge variant="outline">{eyebrow}</Badge>
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          {icon}
          {lessonFlowLabel}
        </div>
        <AskAboutSectionButton section={section} />
      </div>
      <div>
        <h2 className="text-2xl font-semibold leading-tight">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}

function getSelectionActionForStudyAction(action: string | null) {
  const actionMap: Partial<
    Record<
      ExecutableStudyAction,
      | "explain_this"
      | "give_example"
      | "check_misconception"
      | "ask_guiding_question"
    >
  > = {
    continue_learning: "give_example",
    needs_reflection: "ask_guiding_question",
    ready_for_application: "ask_guiding_question",
    repair_misconception: "check_misconception",
    review_confusing_section: "explain_this",
    review_prerequisite: "explain_this",
    start_lesson: "explain_this",
  };

  return actionMap[action as ExecutableStudyAction] ?? "explain_this";
}

export function LessonPageClient({
  concept,
  lesson,
  previousLesson,
  nextLesson,
}: LessonPageClientProps) {
  const { language } = useLanguage();
  const handledStudyActionRef = useRef(false);
  const pageCopy = copy[language];
  const displayLesson = getLocalizedLessonContent(lesson, language);
  const displayPreviousLesson = previousLesson
    ? getLocalizedLessonContent(previousLesson, language)
    : undefined;
  const displayNextLesson = nextLesson
    ? getLocalizedLessonContent(nextLesson, language)
    : undefined;
  const primaryExample = displayLesson.workedExamples[0];

  useEffect(() => {
    if (handledStudyActionRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get("source") !== "memory_recommendation") {
      return;
    }

    const prompt = params.get("prompt");

    if (!prompt) {
      return;
    }

    handledStudyActionRef.current = true;

    const sectionId = params.get("sectionId") ?? "why";
    const section = params.get("section") ?? pageCopy.fullContext;
    const target = document.getElementById(`lesson-section-${sectionId}`);

    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("ai-teacher:send-selection", {
          detail: {
            prompt,
            section,
            selectionAction: getSelectionActionForStudyAction(
              params.get("action"),
            ),
            source: "memory_recommendation",
          },
        }),
      );
    }, 450);
  }, [pageCopy.fullContext]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-8",
        )}
        href="/learn"
      >
        <ArrowLeft className="size-4" />
        {pageCopy.back}
      </Link>

      <header className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
        <div>
          <Badge variant="secondary">{pageCopy.badge}</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            {displayLesson.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            {pageCopy.intro}
          </p>
          <LessonMemorySummary concept={concept} />
        </div>

        <Card>
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              {pageCopy.objective}
            </Badge>
            <CardTitle>{displayLesson.objective.title}</CardTitle>
            <CardDescription>
              {displayLesson.objective.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {displayLesson.objective.successCriteria.map((criterion) => (
                <li
                  className="border-l-2 border-primary pl-3 text-sm leading-6 text-muted-foreground"
                  key={criterion}
                >
                  {criterion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_23rem] lg:items-start">
        <LessonSelectionActions>
          <div className="rounded-lg border border-border bg-card px-5 shadow-sm sm:px-8">
            <LessonSection
              eyebrow={pageCopy.sections.why.eyebrow}
              icon={<Sparkles className="size-4 text-primary" />}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="why"
              title={pageCopy.sections.why.title}
            >
              <p className="text-base leading-8 text-muted-foreground">
                {displayLesson.hook}
              </p>
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.intuition.eyebrow}
              icon={<Lightbulb className="size-4 text-primary" />}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="intuition"
              title={pageCopy.sections.intuition.title}
            >
              <p className="text-base leading-8 text-muted-foreground">
                {displayLesson.intuition}
              </p>
              {displayLesson.prerequisiteConnections.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {displayLesson.prerequisiteConnections.map((connection) => (
                    <div
                      className="rounded-lg border border-border bg-background/70 p-4"
                      key={connection.conceptId}
                    >
                      <p className="text-sm font-semibold">
                        {connection.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {connection.connection}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.formal.eyebrow}
              icon={<Target className="size-4 text-primary" />}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="formal"
              title={pageCopy.sections.formal.title}
            >
              <p className="text-base leading-8 text-muted-foreground">
                {displayLesson.formalExplanation}
              </p>
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.worked.eyebrow}
              icon={<Compass className="size-4 text-primary" />}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="worked"
              title={primaryExample.title}
            >
              <Card className="bg-background/70">
                <CardHeader>
                  <CardDescription>{primaryExample.setup}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {primaryExample.walkthrough.map((step, index) => (
                      <li className="flex gap-3 text-sm leading-6" key={step}>
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-5 rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
                    {primaryExample.takeaway}
                  </p>
                </CardContent>
              </Card>
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.guided.eyebrow}
              icon={<MessageSquare className="size-4 text-primary" />}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="guided"
              title={pageCopy.sections.guided.title}
            >
              <div className="grid gap-4">
                {displayLesson.guidedQuestions.map((question) => (
                  <Card className="bg-background/70" key={question.prompt}>
                    <CardHeader>
                      <CardTitle>{question.prompt}</CardTitle>
                      <CardDescription>
                        {pageCopy.hint} {question.hint}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {pageCopy.targetInsight} {question.targetInsight}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.trap.eyebrow}
              icon={<TriangleAlert className="size-4 text-primary" />}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="trap"
              title={pageCopy.sections.trap.title}
            >
              <div className="grid gap-4">
                {displayLesson.misconceptionChecks.map((check) => (
                  <Card className="bg-background/70" key={check.misconception}>
                    <CardHeader>
                      <CardTitle>{check.misconception}</CardTitle>
                      <CardDescription>{check.checkPrompt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {check.correction}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.reflection.eyebrow}
              icon={<PenLine className="size-4 text-primary" />}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="reflection"
              title={pageCopy.sections.reflection.title}
            >
              <Card className="bg-background/70">
                <CardHeader>
                  <CardTitle>{displayLesson.reflectionPrompt.prompt}</CardTitle>
                  <CardDescription>
                    {pageCopy.sentenceStarter}{" "}
                    {displayLesson.reflectionPrompt.sentenceStarter}
                  </CardDescription>
                </CardHeader>
              </Card>
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.application.eyebrow}
              icon={<Brain className="size-4 text-primary" />}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="application"
              title={displayLesson.applicationPrompt.title}
            >
              <p className="text-base leading-8 text-muted-foreground">
                {displayLesson.applicationPrompt.prompt}
              </p>
              <p className="mt-4 rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                {displayLesson.applicationPrompt.whyItTransfers}
              </p>
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.takeaways.eyebrow}
              icon={<BookOpen className="size-4 text-primary" />}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="takeaways"
              title={pageCopy.sections.takeaways.title}
            >
              <ul className="grid gap-3 sm:grid-cols-3">
                {displayLesson.keyTakeaways.map((takeaway) => (
                  <li
                    className="rounded-lg border border-border bg-background/70 p-4 text-sm leading-6"
                    key={takeaway}
                  >
                    {takeaway}
                  </li>
                ))}
              </ul>
            </LessonSection>
          </div>
        </LessonSelectionActions>

        <AiTeacherChatPanel
          concept={concept}
          currentSection={pageCopy.fullContext}
          key={`${lesson.conceptId}-${language}`}
          lesson={displayLesson}
        />
      </div>

      <section className="mt-8 flex flex-col gap-3 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          {previousLesson && displayPreviousLesson && (
            <Link
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              href={`/learn/${previousLesson.conceptId}`}
            >
              <ArrowLeft className="size-4" />
              {displayPreviousLesson.title}
            </Link>
          )}
          {nextLesson && displayNextLesson && (
            <Link
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              href={`/learn/${nextLesson.conceptId}`}
            >
              {displayNextLesson.title}
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
