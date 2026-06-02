"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Brain, Clock, Sparkles, TriangleAlert } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLocalizedConcept } from "@/features/knowledge/concept-localization";
import type { Concept } from "@/features/knowledge/types";
import {
  fetchLearnerMemory,
  MEMORY_UPDATED_EVENT,
} from "@/features/memory/memory-api-client";
import type { ConceptMemory } from "@/features/memory/types";

type LessonMemorySummaryProps = {
  concept: Concept;
};

const statusLabels = {
  en: {
    familiar: "Familiar",
    learning: "Learning",
    needs_review: "Needs review",
    not_started: "Not started",
  },
  zh: {
    familiar: "较熟悉",
    learning: "学习中",
    needs_review: "需要复习",
    not_started: "未开始",
  },
} satisfies Record<string, Record<ConceptMemory["status"], string>>;

const copy = {
  en: {
    progress: "Learning progress",
    noProgress: "No progress yet for this concept",
    loadError: "Unable to load learning progress.",
    login: "Log in to save learning progress for this concept.",
    askTeacher: (title: string) =>
      `Ask the AI Teacher once and this account will start tracking learning signals for ${title}.`,
    accountProgress: "Account learning progress",
    readiness: (value: number) => `${value}% readiness estimate`,
    stored: "Stored securely for the current signed-in account.",
    interactions: "Interactions",
    misconceptions: "Misconceptions",
    lastStudied: "Last studied",
    notYet: "Not yet",
  },
  zh: {
    progress: "学习进度",
    noProgress: "这个概念还没有学习记录",
    loadError: "无法加载学习进度。",
    login: "登录后可以保存这个概念的学习进度。",
    askTeacher: (title: string) =>
      `和 AI 教师互动一次后，这个账号就会开始记录「${title}」的学习信号。`,
    accountProgress: "当前账号学习进度",
    readiness: (value: number) => `${value}% 应用准备度估计`,
    stored: "记录会绑定到当前登录账号。",
    interactions: "互动次数",
    misconceptions: "误区",
    lastStudied: "上次学习",
    notYet: "还没有",
  },
};

export function LessonMemorySummary({ concept }: LessonMemorySummaryProps) {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const [conceptMemory, setConceptMemory] = useState<
    ConceptMemory | undefined
  >();
  const [memoryError, setMemoryError] = useState<string | undefined>();
  const displayConcept = getLocalizedConcept(concept, language);
  const pageCopy = copy[language];

  useEffect(() => {
    async function syncMemory() {
      if (!session?.user?.id) {
        setConceptMemory(undefined);
        return;
      }

      try {
        const memory = await fetchLearnerMemory(concept.courseId);

        setConceptMemory(memory.conceptMemories[concept.id]);
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
  }, [concept.courseId, concept.id, pageCopy.loadError, session?.user?.id]);

  if (!conceptMemory) {
    return (
      <Card className="mt-6 border-dashed">
        <CardHeader>
          <Badge className="w-fit" variant="outline">
            {pageCopy.progress}
          </Badge>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="size-5 text-primary" />
            {pageCopy.noProgress}
          </CardTitle>
          <CardDescription>
            {memoryError
              ? memoryError
              : session?.user?.id
                ? pageCopy.askTeacher(displayConcept.title)
                : pageCopy.login}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="w-fit" variant="secondary">
            {pageCopy.accountProgress}
          </Badge>
          <Badge variant="outline">
            {statusLabels[language][conceptMemory.status]}
          </Badge>
        </div>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="size-5 text-primary" />
          {pageCopy.readiness(conceptMemory.readiness)}
        </CardTitle>
        <CardDescription>{pageCopy.stored}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background/70 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <Sparkles className="size-3.5" />
            {pageCopy.interactions}
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {conceptMemory.interactionCount}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/70 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <TriangleAlert className="size-3.5" />
            {pageCopy.misconceptions}
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {conceptMemory.misconceptions.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/70 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <Clock className="size-3.5" />
            {pageCopy.lastStudied}
          </p>
          <p className="mt-2 text-sm font-semibold">
            {conceptMemory.lastStudiedAt
              ? new Date(conceptMemory.lastStudiedAt).toLocaleDateString(
                  language === "zh" ? "zh-CN" : undefined,
                )
              : pageCopy.notYet}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
