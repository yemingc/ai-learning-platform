"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  LockKeyhole,
  RotateCcw,
  TrendingUp,
  XCircle,
} from "lucide-react";
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
import type {
  FormativeAssessment,
  FormativeAssessmentAttemptSummary,
  FormativeAssessmentFeedback,
  FormativeAssessmentPhase,
  FormativeAssessmentProgress,
} from "@/features/assessment/types";
import type { Concept } from "@/features/knowledge/types";
import { notifyLearnerMemoryUpdated } from "@/features/memory/memory-api-client";
import type { ConceptMemoryStatus } from "@/features/memory/types";
import { cn } from "@/lib/utils";

type FormativeAssessmentCardProps = {
  concept: Concept;
  phase: FormativeAssessmentPhase;
};

type AssessmentLoadResponse = {
  assessment: FormativeAssessment;
  latestAttempt?: FormativeAssessmentAttemptSummary;
  progress: FormativeAssessmentProgress;
};

type AssessmentSubmitResponse = {
  attempt: FormativeAssessmentAttemptSummary;
  feedback: FormativeAssessmentFeedback[];
  progress: FormativeAssessmentProgress;
  readiness: number;
  status: ConceptMemoryStatus;
};

type AssessmentErrorResponse = {
  error?: {
    message?: string;
  };
};

const copy = {
  en: {
    phase: {
      diagnostic: "Before learning",
      exit_ticket: "After learning",
    },
    loading: "Loading concept check...",
    loadError: "Unable to load this concept check.",
    submitError: "Unable to save this assessment attempt.",
    completeAll: "Choose one response for each question.",
    submit: {
      diagnostic: "Save diagnostic evidence",
      exit_ticket: "Save exit-ticket evidence",
    },
    submitting: "Scoring on the server...",
    login: "Log in to save this evidence to your learning progress.",
    loginAction: "Log in to continue",
    previous: "Latest saved result",
    score: (correct: number, total: number, score: number) =>
      `${correct}/${total} correct · ${score}%`,
    saved: "Saved to your account and used to update readiness.",
    readiness: (value: number) => `Updated readiness: ${value}%`,
    gain: (value: number) =>
      `Learning gain: ${value > 0 ? "+" : ""}${value} points`,
    correct: "Correct reasoning",
    revisit: "Revisit this idea",
    retry: "Try a fresh attempt",
    noGrade: "Formative evidence · not a course grade",
  },
  zh: {
    phase: {
      diagnostic: "学习前",
      exit_ticket: "学习后",
    },
    loading: "正在加载概念检查……",
    loadError: "暂时无法加载这组概念检查。",
    submitError: "暂时无法保存这次评测。",
    completeAll: "请为每道题选择一个答案。",
    submit: {
      diagnostic: "保存课前诊断证据",
      exit_ticket: "保存离堂检查证据",
    },
    submitting: "正在由服务端评分……",
    login: "登录后可以把这份证据保存到你的学习进度。",
    loginAction: "登录并继续",
    previous: "最近一次保存结果",
    score: (correct: number, total: number, score: number) =>
      `答对 ${correct}/${total} · ${score}%`,
    saved: "已保存到当前账号，并用于更新准备度。",
    readiness: (value: number) => `更新后的准备度：${value}%`,
    gain: (value: number) =>
      `学习增量：${value > 0 ? "+" : ""}${value} 分`,
    correct: "理解正确",
    revisit: "需要回看这个点",
    retry: "重新尝试一组作答",
    noGrade: "形成性学习证据 · 不计入课程成绩",
  },
};

async function parseApiResponse<T>(response: Response) {
  const body = (await response.json().catch(() => undefined)) as
    | T
    | AssessmentErrorResponse
    | undefined;

  if (!response.ok) {
    throw new Error(
      (body as AssessmentErrorResponse | undefined)?.error?.message ??
        `Assessment request failed with status ${response.status}.`,
    );
  }

  return body as T;
}

export function FormativeAssessmentCard({
  concept,
  phase,
}: FormativeAssessmentCardProps) {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const pageCopy = copy[language];
  const [assessment, setAssessment] = useState<FormativeAssessment>();
  const [latestAttempt, setLatestAttempt] = useState<
    FormativeAssessmentAttemptSummary | undefined
  >();
  const [progress, setProgress] = useState<FormativeAssessmentProgress>({
    evidenceLevel: "none",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<FormativeAssessmentFeedback[]>([]);
  const [readiness, setReadiness] = useState<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      courseId: concept.courseId,
      conceptId: concept.id,
      phase,
      locale: language,
    });

    async function loadAssessment() {
      setIsLoading(true);
      setError(undefined);
      setFeedback([]);
      setAnswers({});
      setReadiness(undefined);

      try {
        const response = await fetch(`/api/formative-assessment?${params}`, {
          method: "GET",
          signal: controller.signal,
        });
        const data = await parseApiResponse<AssessmentLoadResponse>(response);

        setAssessment(data.assessment);
        setLatestAttempt(data.latestAttempt);
        setProgress(data.progress);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : pageCopy.loadError,
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAssessment();

    return () => controller.abort();
  }, [concept.courseId, concept.id, language, pageCopy.loadError, phase]);

  const feedbackByQuestion = useMemo(
    () => new Map(feedback.map((item) => [item.questionId, item])),
    [feedback],
  );
  const isComplete = Boolean(
    assessment?.questions.every((item) => answers[item.id]),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assessment || !isComplete || isSubmitting || !session?.user?.id) {
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch("/api/formative-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: concept.courseId,
          conceptId: concept.id,
          phase,
          locale: language,
          answers: assessment.questions.map((item) => ({
            questionId: item.id,
            selectedOptionId: answers[item.id],
          })),
        }),
      });
      const data = await parseApiResponse<AssessmentSubmitResponse>(response);

      setLatestAttempt(data.attempt);
      setFeedback(data.feedback);
      setProgress(data.progress);
      setReadiness(data.readiness);
      notifyLearnerMemoryUpdated();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : pageCopy.submitError,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetAttempt() {
    setAnswers({});
    setFeedback([]);
    setReadiness(undefined);
    setError(undefined);
  }

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {pageCopy.loading}
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-6 text-sm text-destructive">
          {error ?? pageCopy.loadError}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-learning-mint/30">
      <CardHeader className="bg-learning-mint/10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{pageCopy.phase[phase]}</Badge>
          <Badge variant="outline">{pageCopy.noGrade}</Badge>
        </div>
        <CardTitle className="mt-2 flex items-center gap-2">
          <ClipboardCheck className="size-5 text-primary" />
          {assessment.title}
        </CardTitle>
        <CardDescription>{assessment.description}</CardDescription>

        {latestAttempt && !feedback.length && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/80 p-3 text-sm">
            <Badge variant="outline">{pageCopy.previous}</Badge>
            <span className="font-semibold">
              {pageCopy.score(
                latestAttempt.correctCount,
                latestAttempt.questionCount,
                latestAttempt.score,
              )}
            </span>
            {progress.learningGain !== undefined && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="size-4" />
                {pageCopy.gain(progress.learningGain)}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {assessment.questions.map((item, questionIndex) => {
            const itemFeedback = feedbackByQuestion.get(item.id);

            return (
              <fieldset className="space-y-3" key={item.id}>
                <legend className="text-sm font-semibold leading-6">
                  {questionIndex + 1}. {item.prompt}
                </legend>
                <div className="grid gap-2">
                  {item.options.map((option) => {
                    const isSelected = answers[item.id] === option.id;
                    const isCorrectOption =
                      itemFeedback?.correctOptionId === option.id;
                    const isIncorrectSelection = Boolean(
                      itemFeedback && isSelected && !itemFeedback.isCorrect,
                    );

                    return (
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm leading-6 transition-colors hover:border-primary/40",
                          isSelected && !itemFeedback &&
                            "border-primary bg-primary/5",
                          isCorrectOption &&
                            "border-learning-mint/60 bg-learning-mint/10",
                          isIncorrectSelection &&
                            "border-destructive/40 bg-destructive/5",
                        )}
                        key={option.id}
                      >
                        <input
                          checked={isSelected}
                          className="mt-1 size-4 accent-primary"
                          disabled={Boolean(feedback.length)}
                          name={`${assessment.id}-${item.id}`}
                          onChange={() =>
                            setAnswers((current) => ({
                              ...current,
                              [item.id]: option.id,
                            }))
                          }
                          type="radio"
                          value={option.id}
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>

                {itemFeedback && (
                  <div
                    className={cn(
                      "flex items-start gap-2 rounded-lg border p-3 text-sm leading-6",
                      itemFeedback.isCorrect
                        ? "border-learning-mint/40 bg-learning-mint/10"
                        : "border-destructive/30 bg-destructive/5",
                    )}
                  >
                    {itemFeedback.isCorrect ? (
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-learning-mint" />
                    ) : (
                      <XCircle className="mt-1 size-4 shrink-0 text-destructive" />
                    )}
                    <p>
                      <span className="font-semibold">
                        {itemFeedback.isCorrect
                          ? pageCopy.correct
                          : pageCopy.revisit}
                        :{" "}
                      </span>
                      {itemFeedback.explanation}
                    </p>
                  </div>
                )}
              </fieldset>
            );
          })}

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {feedback.length > 0 && latestAttempt ? (
            <div className="rounded-lg border border-learning-mint/40 bg-learning-mint/10 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {pageCopy.score(
                    latestAttempt.correctCount,
                    latestAttempt.questionCount,
                    latestAttempt.score,
                  )}
                </Badge>
                {readiness !== undefined && (
                  <Badge variant="outline">{pageCopy.readiness(readiness)}</Badge>
                )}
                {progress.learningGain !== undefined && (
                  <Badge variant="outline">
                    {pageCopy.gain(progress.learningGain)}
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {pageCopy.saved}
              </p>
              <Button
                className="mt-4"
                onClick={resetAttempt}
                type="button"
                variant="outline"
              >
                <RotateCcw className="size-4" />
                {pageCopy.retry}
              </Button>
            </div>
          ) : session?.user?.id ? (
            <div>
              {!isComplete && (
                <p className="mb-2 text-xs text-muted-foreground">
                  {pageCopy.completeAll}
                </p>
              )}
              <Button disabled={!isComplete || isSubmitting} type="submit">
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ClipboardCheck className="size-4" />
                )}
                {isSubmitting ? pageCopy.submitting : pageCopy.submit[phase]}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LockKeyhole className="size-4 shrink-0" />
                {pageCopy.login}
              </p>
              <Link
                className={buttonVariants({ variant: "outline", size: "sm" })}
                href={`/login?callbackUrl=${encodeURIComponent(`/learn/${concept.id}`)}`}
              >
                {pageCopy.loginAction}
              </Link>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
