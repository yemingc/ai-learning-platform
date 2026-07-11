"use client";

import { useId, useState, type FormEvent } from "react";
import { Brain, Eye, Lightbulb, MessageSquare } from "lucide-react";
import type { Language } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  LessonGuidedQuestion,
  LessonMisconceptionCheck,
} from "@/features/lessons/types";

const copy = {
  en: {
    answerLabel: "Your reasoning",
    answerPlaceholder: "Explain what you think and why...",
    askTeacher: "Check my reasoning with AI Teacher",
    correction: "Correction",
    hideHint: "Hide hint",
    hint: "Hint",
    insight: "Target insight",
    misconceptionPlaceholder: "Respond to the check question in your own words...",
    revealCorrection: "Reveal correction",
    revealInsight: "Reveal target insight",
    sent: "Your reasoning was sent to the AI Teacher.",
    showHint: "Show hint",
  },
  zh: {
    answerLabel: "你的推理",
    answerPlaceholder: "用自己的话写下你的判断和理由……",
    askTeacher: "让 AI 教师检查我的推理",
    correction: "纠正说明",
    hideHint: "收起提示",
    hint: "提示",
    insight: "关键思路",
    misconceptionPlaceholder: "先用自己的话回答检查问题……",
    revealCorrection: "查看纠正说明",
    revealInsight: "查看关键思路",
    sent: "你的推理已发送给 AI 教师。",
    showHint: "查看提示",
  },
} satisfies Record<Language, Record<string, string>>;

function sendReasoningToTeacher({
  prompt,
  section,
  selectionAction,
}: {
  prompt: string;
  section: string;
  selectionAction: "ask_guiding_question" | "check_misconception";
}) {
  window.dispatchEvent(
    new CustomEvent("ai-teacher:send-selection", {
      detail: {
        prompt,
        section,
        selectionAction,
        source: "section_action",
      },
    }),
  );
}

export function GuidedQuestionCard({
  language,
  question,
  section,
}: {
  language: Language;
  question: LessonGuidedQuestion;
  section: string;
}) {
  const answerId = useId();
  const [answer, setAnswer] = useState("");
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [isInsightVisible, setIsInsightVisible] = useState(false);
  const [wasSent, setWasSent] = useState(false);
  const activeCopy = copy[language];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      return;
    }

    const prompt =
      language === "zh"
        ? [
            "我正在回答课程里的引导问题。",
            `问题：${question.prompt}`,
            `我的推理：${trimmedAnswer}`,
            "请先判断我的推理中哪些部分成立，再用一个引导问题帮助我修正或补全；不要直接替我给出完整答案。",
          ].join("\n")
        : [
            "I am answering a guided question from the lesson.",
            `Question: ${question.prompt}`,
            `My reasoning: ${trimmedAnswer}`,
            "First identify what is sound in my reasoning, then use one guiding question to help me repair or complete it. Do not replace my work with a full answer immediately.",
          ].join("\n");

    sendReasoningToTeacher({
      prompt,
      section,
      selectionAction: "ask_guiding_question",
    });
    setWasSent(true);
  }

  return (
    <Card className="bg-background/70">
      <CardHeader>
        <CardTitle>{question.prompt}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="text-sm font-semibold" htmlFor={answerId}>
            {activeCopy.answerLabel}
          </label>
          <textarea
            className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            id={answerId}
            onChange={(event) => {
              setAnswer(event.target.value);
              setWasSent(false);
            }}
            placeholder={activeCopy.answerPlaceholder}
            value={answer}
          />
          <div className="flex flex-wrap gap-2">
            <Button disabled={!answer.trim()} type="submit">
              <MessageSquare />
              {activeCopy.askTeacher}
            </Button>
            <Button
              aria-expanded={isHintVisible}
              onClick={() => setIsHintVisible((visible) => !visible)}
              type="button"
              variant="outline"
            >
              <Lightbulb />
              {isHintVisible ? activeCopy.hideHint : activeCopy.showHint}
            </Button>
            <Button
              aria-expanded={isInsightVisible}
              onClick={() => setIsInsightVisible((visible) => !visible)}
              type="button"
              variant="ghost"
            >
              <Eye />
              {activeCopy.revealInsight}
            </Button>
          </div>
        </form>

        {wasSent && (
          <p aria-live="polite" className="mt-3 text-sm text-primary">
            {activeCopy.sent}
          </p>
        )}
        {isHintVisible && (
          <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-sm leading-6">
            <span className="font-semibold">{activeCopy.hint}: </span>
            {question.hint}
          </div>
        )}
        {isInsightVisible && (
          <div className="mt-3 rounded-lg border border-learning-mint/30 bg-learning-mint/10 p-3 text-sm leading-6">
            <span className="font-semibold">{activeCopy.insight}: </span>
            {question.targetInsight}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MisconceptionCheckCard({
  check,
  language,
  section,
}: {
  check: LessonMisconceptionCheck;
  language: Language;
  section: string;
}) {
  const answerId = useId();
  const [answer, setAnswer] = useState("");
  const [isCorrectionVisible, setIsCorrectionVisible] = useState(false);
  const [wasSent, setWasSent] = useState(false);
  const activeCopy = copy[language];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      return;
    }

    const prompt =
      language === "zh"
        ? [
            `课程正在检查这个常见误区：${check.misconception}`,
            `检查问题：${check.checkPrompt}`,
            `我的回答：${trimmedAnswer}`,
            "请判断我的回答是否仍包含这个误区，并通过解释加一个追问帮助我修正。",
          ].join("\n")
        : [
            `The lesson is checking this common misconception: ${check.misconception}`,
            `Check question: ${check.checkPrompt}`,
            `My response: ${trimmedAnswer}`,
            "Determine whether my response still shows this misconception, then help me repair it with a concise explanation and one follow-up question.",
          ].join("\n");

    sendReasoningToTeacher({
      prompt,
      section,
      selectionAction: "check_misconception",
    });
    setWasSent(true);
  }

  return (
    <Card className="bg-background/70">
      <CardHeader>
        <CardTitle>{check.misconception}</CardTitle>
        <CardDescription>{check.checkPrompt}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="text-sm font-semibold" htmlFor={answerId}>
            {activeCopy.answerLabel}
          </label>
          <textarea
            className="min-h-20 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            id={answerId}
            onChange={(event) => {
              setAnswer(event.target.value);
              setWasSent(false);
            }}
            placeholder={activeCopy.misconceptionPlaceholder}
            value={answer}
          />
          <div className="flex flex-wrap gap-2">
            <Button disabled={!answer.trim()} type="submit">
              <Brain />
              {activeCopy.askTeacher}
            </Button>
            <Button
              aria-expanded={isCorrectionVisible}
              onClick={() =>
                setIsCorrectionVisible((visible) => !visible)
              }
              type="button"
              variant="outline"
            >
              <Eye />
              {activeCopy.revealCorrection}
            </Button>
          </div>
        </form>

        {wasSent && (
          <p aria-live="polite" className="mt-3 text-sm text-primary">
            {activeCopy.sent}
          </p>
        )}
        {isCorrectionVisible && (
          <div className="mt-4 rounded-lg border border-learning-mint/30 bg-learning-mint/10 p-3 text-sm leading-6">
            <span className="font-semibold">{activeCopy.correction}: </span>
            {check.correction}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
