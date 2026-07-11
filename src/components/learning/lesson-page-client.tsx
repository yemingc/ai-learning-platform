"use client";

import { useEffect, useRef, useState } from "react";
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
import { localizeLesson } from "@/curricula/localization";
import { getLessonPath } from "@/curricula/routing";
import type { CurriculumPack } from "@/curricula/types";
import { AiTeacherChatPanel } from "@/components/learning/ai-teacher-chat-panel";
import { AskAboutSectionButton } from "@/components/learning/ask-about-section-button";
import {
  GuidedQuestionCard,
  MisconceptionCheckCard,
} from "@/components/learning/guided-learning-cards";
import { LessonConceptVisualization } from "@/components/learning/lesson-concept-visualization";
import { FormativeAssessmentCard } from "@/components/learning/formative-assessment-card";
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
import type { LessonContent } from "@/features/lessons/types";
import { cn } from "@/lib/utils";

type LessonPageClientProps = {
  concept: Concept;
  curriculum: CurriculumPack;
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
    badge: "Structured lesson + AI Teacher",
    coursePack: "Current course",
    intro:
      "This lesson is a structured curriculum asset. The AI Teacher uses the current course, concept, section, and learning progress to support the student while reading.",
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
    back: "返回概念图",
    badge: "结构化课程 + AI 教师",
    coursePack: "当前课程",
    intro:
      "这是一节结构化课程。学习过程中，AI 教师会结合当前课程、概念、阅读位置和学习进度，为你提供解释、追问和纠偏。",
    objective: "学习目标",
    lessonFlow: "学习路径",
    hint: "提示：",
    targetInsight: "关键思路：",
    sentenceStarter: "参考句式：",
    sections: {
      why: {
        eyebrow: "学习意义",
        title: "为什么要学这个概念",
      },
      intuition: {
        eyebrow: "直观理解",
        title: "从直观认识概念",
      },
      formal: {
        eyebrow: "概念定义",
        title: "准确理解概念",
      },
      worked: {
        eyebrow: "例题讲解",
      },
      guided: {
        eyebrow: "引导思考",
        title: "检验你的理解",
      },
      trap: {
        eyebrow: "误区辨析",
        title: "常见误区",
      },
      reflection: {
        eyebrow: "总结反思",
        title: "用自己的话总结",
      },
      application: {
        eyebrow: "应用练习",
      },
      takeaways: {
        eyebrow: "知识小结",
        title: "重要知识点",
      },
    },
    fullContext: "整节课上下文",
  },
};
function LessonSection({
  eyebrow,
  title,
  sectionId,
  icon,
  isHighlighted,
  lessonFlowLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  sectionId: LessonSectionId;
  icon: React.ReactNode;
  isHighlighted?: boolean;
  lessonFlowLabel: string;
  children: React.ReactNode;
}) {
  const section = `${eyebrow}: ${title}`;

  return (
    <section
      className={cn(
        "grid scroll-mt-24 gap-4 border-t border-border py-8 transition-colors md:grid-cols-[13rem_1fr]",
        isHighlighted &&
          "rounded-lg bg-learning-mint/10 ring-2 ring-learning-mint/40 ring-offset-4 ring-offset-background",
      )}
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

const lessonSectionIds: LessonSectionId[] = [
  "why",
  "intuition",
  "formal",
  "worked",
  "guided",
  "trap",
  "reflection",
  "application",
  "takeaways",
];

function isLessonSectionId(value?: string): value is LessonSectionId {
  return Boolean(
    value && lessonSectionIds.includes(value as LessonSectionId),
  );
}

function getLessonSectionIdFromHash(hash: string) {
  const sectionId = hash.replace(/^#lesson-section-/, "");

  return isLessonSectionId(sectionId) ? sectionId : undefined;
}

export function LessonPageClient({
  concept,
  curriculum,
  lesson,
  previousLesson,
  nextLesson,
}: LessonPageClientProps) {
  const { language } = useLanguage();
  const handledStudyActionRef = useRef(false);
  const highlightTimeoutRef = useRef<number | undefined>(undefined);
  const [highlightedSectionId, setHighlightedSectionId] = useState<
    LessonSectionId | undefined
  >();
  const pageCopy = copy[language];
  const course = curriculum.course;
  const displayLesson = localizeLesson(curriculum, lesson, language);
  const displayPreviousLesson = previousLesson
    ? localizeLesson(curriculum, previousLesson, language)
    : undefined;
  const displayNextLesson = nextLesson
    ? localizeLesson(curriculum, nextLesson, language)
    : undefined;
  const primaryExample = displayLesson.workedExamples[0];

  useEffect(() => {
    function highlightSection(sectionId?: string) {
      if (!isLessonSectionId(sectionId)) {
        return;
      }

      setHighlightedSectionId(sectionId);

      if (highlightTimeoutRef.current !== undefined) {
        window.clearTimeout(highlightTimeoutRef.current);
      }

      highlightTimeoutRef.current = window.setTimeout(() => {
        setHighlightedSectionId(undefined);
      }, 2600);
    }

    function handleHashChange() {
      highlightSection(getLessonSectionIdFromHash(window.location.hash));
    }

    function handleHighlightEvent(event: Event) {
      const customEvent = event as CustomEvent<{ sectionId?: string }>;

      highlightSection(customEvent.detail?.sectionId);
    }

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("lesson:highlight-section", handleHighlightEvent);
    window.setTimeout(handleHashChange, 0);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener(
        "lesson:highlight-section",
        handleHighlightEvent,
      );

      if (highlightTimeoutRef.current !== undefined) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

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
        href={`/courses/${course.id}/learn/${concept.unitId}`}
      >
        <ArrowLeft className="size-4" />
        {pageCopy.back}
      </Link>

      <header className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
        <div>
          <Badge variant="secondary">{pageCopy.badge}</Badge>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">
              {pageCopy.coursePack}: {course.title}
            </Badge>
            <Badge variant="outline">{course.subject}</Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            {displayLesson.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            {pageCopy.intro}
          </p>
          <LessonMemorySummary concept={concept} curriculum={curriculum} />
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
          <div className="space-y-6">
            {curriculum.capabilities.formativeAssessments && (
              <FormativeAssessmentCard concept={concept} phase="diagnostic" />
            )}

            <div className="rounded-lg border border-border bg-card px-5 shadow-sm sm:px-8">
            <LessonSection
              eyebrow={pageCopy.sections.why.eyebrow}
              icon={<Sparkles className="size-4 text-primary" />}
              isHighlighted={highlightedSectionId === "why"}
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
              isHighlighted={highlightedSectionId === "intuition"}
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
                <LessonConceptVisualization
                  conceptId={concept.id}
                  language={language}
                  visualization={curriculum.visualizations?.[concept.id]}
                />
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.formal.eyebrow}
              icon={<Target className="size-4 text-primary" />}
              isHighlighted={highlightedSectionId === "formal"}
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
              isHighlighted={highlightedSectionId === "worked"}
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
              isHighlighted={highlightedSectionId === "guided"}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="guided"
              title={pageCopy.sections.guided.title}
            >
              <div className="grid gap-4">
                {displayLesson.guidedQuestions.map((question) => (
                  <GuidedQuestionCard
                    key={question.prompt}
                    language={language}
                    question={question}
                    section={pageCopy.sections.guided.eyebrow}
                  />
                ))}
              </div>
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.trap.eyebrow}
              icon={<TriangleAlert className="size-4 text-primary" />}
              isHighlighted={highlightedSectionId === "trap"}
              lessonFlowLabel={pageCopy.lessonFlow}
              sectionId="trap"
              title={pageCopy.sections.trap.title}
            >
              <div className="grid gap-4">
                {displayLesson.misconceptionChecks.map((check) => (
                  <MisconceptionCheckCard
                    check={check}
                    key={check.misconception}
                    language={language}
                    section={pageCopy.sections.trap.eyebrow}
                  />
                ))}
              </div>
            </LessonSection>

            <LessonSection
              eyebrow={pageCopy.sections.reflection.eyebrow}
              icon={<PenLine className="size-4 text-primary" />}
              isHighlighted={highlightedSectionId === "reflection"}
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
              isHighlighted={highlightedSectionId === "application"}
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
              isHighlighted={highlightedSectionId === "takeaways"}
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

            {curriculum.capabilities.formativeAssessments && (
              <FormativeAssessmentCard concept={concept} phase="exit_ticket" />
            )}
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
              href={getLessonPath({
                courseId: previousLesson.courseId,
                unitId: previousLesson.unitId,
                id: previousLesson.conceptId,
              })}
            >
              <ArrowLeft className="size-4" />
              {displayPreviousLesson.title}
            </Link>
          )}
          {nextLesson && displayNextLesson && (
            <Link
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              href={getLessonPath({
                courseId: nextLesson.courseId,
                unitId: nextLesson.unitId,
                id: nextLesson.conceptId,
              })}
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

