"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BrainCircuit,
  DatabaseZap,
  GitBranch,
  ListRestart,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TeacherWorkflowInspectorRun } from "@/features/ai-teacher/workflow/inspector-types";
import {
  clearWorkflowInspectorRuns,
  getWorkflowInspectorRuns,
  WORKFLOW_INSPECTOR_UPDATED_EVENT,
} from "@/features/ai-teacher/workflow/inspector-store";
import type {
  TeacherWorkflowNode,
  TeacherWorkflowTraceEvent,
} from "@/features/ai-teacher/workflow/types";
import { cn } from "@/lib/utils";

const nodeLabels: Record<
  TeacherWorkflowNode,
  {
    en: string;
    zh: string;
  }
> = {
  build_context: {
    en: "Build context",
    zh: "构建上下文（build context）",
  },
  classify_user_intent: {
    en: "Classify intent",
    zh: "识别意图（classify intent）",
  },
  retrieve_curriculum_chunks: {
    en: "Retrieve curriculum chunks",
    zh: "检索课程片段（retrieve chunks）",
  },
  assemble_curriculum_context: {
    en: "Assemble curriculum context",
    zh: "组装课程上下文（curriculum context）",
  },
  extract_learning_signals: {
    en: "Extract learning signals",
    zh: "提取学习信号（learning signals）",
  },
  generate_teaching_response: {
    en: "Generate response",
    zh: "生成教学回应（teaching response）",
  },
  return_next_study_action: {
    en: "Return next study action",
    zh: "返回下一步行动（next study action）",
  },
  select_teaching_strategy: {
    en: "Select teaching strategy",
    zh: "选择教学策略（teaching strategy）",
  },
  student_message: {
    en: "Student message",
    zh: "学生消息（student message）",
  },
  update_learner_memory: {
    en: "Update learner memory",
    zh: "更新学习记忆（learner memory）",
  },
  validate_structured_output: {
    en: "Validate structured output",
    zh: "校验结构化输出（structured output）",
  },
};

const copy = {
  en: {
    assistantPreview: "Assistant preview",
    clear: "Clear local runs",
    concept: "Concept",
    context: "Context",
    developerOnly: "Developer observability",
    duration: "Duration",
    emptyDescription:
      "Ask the AI Teacher from a lesson page. In local development, workflow traces are returned automatically. For a production demo, set NEXT_PUBLIC_SHOW_AI_TRACE=true and restart the server.",
    emptyTitle: "No workflow runs yet.",
    engine: "Engine",
    evidence: "Evidence",
    followLesson: "Open lesson",
    heading: "AI Workflow Inspector",
    memoryPatch: "Memory patch",
    nextAction: "Next study action",
    noMisconception: "No misconception detected in this run.",
    recentRuns: "Recent runs",
    section: "Section",
    signals: "Learning signals",
    subtitle:
      "Inspect how the AI Teacher moves from context building to intent classification, teaching strategy, response generation, learning signal extraction, and memory update.",
    teachingDecision: "Teaching decision",
    trace: "LangGraph trace",
    userMessage: "Student message",
  },
  zh: {
    assistantPreview: "AI 回应预览（assistant preview）",
    clear: "清空本地记录（clear local runs）",
    concept: "概念（concept）",
    context: "上下文（context）",
    developerOnly: "开发者可观察性（developer observability）",
    duration: "耗时（duration）",
    emptyDescription:
      "先到课程页向 AI 教师（AI Teacher）提问。本地开发环境会自动返回工作流轨迹（workflow trace）；如果是生产演示环境，请设置 NEXT_PUBLIC_SHOW_AI_TRACE=true 并重启服务。",
    emptyTitle: "还没有工作流记录（workflow runs）。",
    engine: "引擎（engine）",
    evidence: "证据（evidence）",
    followLesson: "打开课程（open lesson）",
    heading: "AI 工作流观察台（AI Workflow Inspector）",
    memoryPatch: "记忆补丁（memory patch）",
    nextAction: "下一步学习行动（next study action）",
    noMisconception: "这次没有检测到误区（misconception）。",
    recentRuns: "最近运行（recent runs）",
    section: "段落（section）",
    signals: "学习信号（learning signals）",
    subtitle:
      "查看 AI 教师（AI Teacher）如何从构建上下文（context building）到意图识别（intent classification）、教学策略（teaching strategy）、生成回应（response generation）、提取学习信号（learning signal extraction）和更新记忆（memory update）。",
    teachingDecision: "教学决策（teaching decision）",
    trace: "LangGraph 轨迹（LangGraph trace）",
    userMessage: "学生消息（student message）",
  },
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(1)}s`;
}

function getTraceDetail(
  run: TeacherWorkflowInspectorRun,
  node: TeacherWorkflowNode,
) {
  return run.trace.find((event) => event.node === node)?.detail;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function TraceEventRow({
  event,
  index,
  language,
}: {
  event: TeacherWorkflowTraceEvent;
  index: number;
  language: "en" | "zh";
}) {
  return (
    <li className="relative grid gap-3 rounded-lg border border-border bg-background/70 p-4 sm:grid-cols-[2.5rem_1fr]">
      <div className="grid size-10 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
        {index + 1}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{nodeLabels[event.node][language]}</p>
          <Badge variant="outline">{event.status}</Badge>
        </div>
        {event.detail && (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {event.detail}
          </p>
        )}
      </div>
    </li>
  );
}

export function WorkflowInspectorClient() {
  const { language } = useLanguage();
  const t = copy[language];
  const [runs, setRuns] = useState<TeacherWorkflowInspectorRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>();

  function loadRuns() {
    const nextRuns = getWorkflowInspectorRuns();

    setRuns(nextRuns);
    setSelectedRunId((currentRunId) =>
      currentRunId && nextRuns.some((run) => run.id === currentRunId)
        ? currentRunId
        : nextRuns[0]?.id,
    );
  }

  useEffect(() => {
    const frameId = window.requestAnimationFrame(loadRuns);

    window.addEventListener(WORKFLOW_INSPECTOR_UPDATED_EVENT, loadRuns);
    window.addEventListener("storage", loadRuns);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener(WORKFLOW_INSPECTOR_UPDATED_EVENT, loadRuns);
      window.removeEventListener("storage", loadRuns);
    };
  }, []);

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId) ?? runs[0],
    [runs, selectedRunId],
  );

  function handleClearRuns() {
    clearWorkflowInspectorRuns();
    setRuns([]);
    setSelectedRunId(undefined);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <Badge variant="outline">{t.developerOnly}</Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            {t.heading}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="size-5" />
              Graph-ready teaching loop
            </CardTitle>
            <CardDescription>
              Student message → context → intent → strategy → response →
              signals → memory → next action.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label={t.recentRuns} value={runs.length} />
        <StatCard
          label={t.engine}
          value={selectedRun?.workflowEngine ?? "langgraph"}
        />
        <StatCard
          label={t.duration}
          value={
            selectedRun
              ? formatDuration(
                  selectedRun.modelTelemetry?.durationMs ?? selectedRun.durationMs,
                )
              : "-"
          }
        />
        <StatCard
          label="Model"
          value={selectedRun?.modelTelemetry?.model ?? "-"}
        />
        <StatCard
          label="Tokens"
          value={selectedRun?.modelTelemetry?.totalTokens ?? "-"}
        />
        <StatCard
          label={t.nextAction}
          value={selectedRun?.nextStudyAction?.action ?? "-"}
        />
      </div>

      {runs.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardHeader>
            <CardTitle>{t.emptyTitle}</CardTitle>
            <CardDescription>{t.emptyDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/learn/what-is-a-limit">{t.followLesson}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_1fr]">
          <Card className="h-fit lg:sticky lg:top-24">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-5" />
                    {t.recentRuns}
                  </CardTitle>
                  <CardDescription>
                    Local development storage, newest first.
                  </CardDescription>
                </div>
                <Button
                  aria-label={t.clear}
                  onClick={handleClearRuns}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
              {runs.map((run) => {
                const isSelected = run.id === selectedRun?.id;

                return (
                  <button
                    className={cn(
                      "rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted",
                      isSelected && "border-primary bg-muted",
                    )}
                    key={run.id}
                    onClick={() => setSelectedRunId(run.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold">
                        {run.conceptTitle}
                      </p>
                      <Badge variant="outline">{run.workflowEngine}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {run.userMessage}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(run.createdAt)}
                    </p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {selectedRun && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{selectedRun.workflowEngine}</Badge>
                        {selectedRun.modelTelemetry && (
                          <>
                            <Badge variant="outline">
                              {selectedRun.modelTelemetry.model}
                            </Badge>
                            <Badge variant="outline">
                              {selectedRun.modelTelemetry.promptVersion}
                            </Badge>
                            {selectedRun.modelTelemetry.firstTokenDurationMs !==
                              undefined && (
                              <Badge variant="outline">
                                TTFT {formatDuration(
                                  selectedRun.modelTelemetry
                                    .firstTokenDurationMs,
                                )}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      <CardTitle className="mt-3">
                        {selectedRun.conceptTitle}
                      </CardTitle>
                      <CardDescription>
                        {t.section}: {selectedRun.section}
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/learn/${selectedRun.conceptId}`}>
                        {t.followLesson}
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {t.userMessage}
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      {selectedRun.userMessage}
                    </p>
                    {selectedRun.selectedText && (
                      <p className="mt-3 rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
                        {selectedRun.selectedText}
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {t.assistantPreview}
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      {selectedRun.assistantMessage}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BrainCircuit className="size-5" />
                      {t.teachingDecision}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm leading-6">
                    <div className="rounded-lg bg-muted p-3">
                      <span className="font-semibold">Intent:</span>{" "}
                      {getTraceDetail(selectedRun, "classify_user_intent") ??
                        "-"}
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <span className="font-semibold">Strategy:</span>{" "}
                      {getTraceDetail(selectedRun, "select_teaching_strategy") ??
                        selectedRun.teachingMove}
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <span className="font-semibold">Misconception:</span>{" "}
                      {selectedRun.detectedMisconception ?? t.noMisconception}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DatabaseZap className="size-5" />
                      {t.signals}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm leading-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-muted p-3">
                        <span className="font-semibold">Confusion:</span>{" "}
                        {selectedRun.memorySignals.confusionLevel}
                      </div>
                      <div className="rounded-lg bg-muted p-3">
                        <span className="font-semibold">Confidence:</span>{" "}
                        {selectedRun.memorySignals.confidenceDelta}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <span className="font-semibold">{t.evidence}:</span>{" "}
                      {selectedRun.memorySignals.evidenceNote}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListRestart className="size-5" />
                    {t.memoryPatch}
                  </CardTitle>
                  <CardDescription>
                    This is the structured state change the client memory store
                    can apply today, and the server can persist later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm leading-6">
                  <div className="rounded-lg bg-muted p-3">
                    <span className="font-semibold">Action:</span>{" "}
                    {selectedRun.nextStudyAction?.action ?? "-"}
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <span className="font-semibold">Persist client-side:</span>{" "}
                    {selectedRun.memoryPatch?.shouldPersistClientSide
                      ? "yes"
                      : "no"}
                  </div>
                  {selectedRun.memoryPatch?.rationale && (
                    <div className="rounded-lg bg-muted p-3">
                      <span className="font-semibold">Rationale:</span>{" "}
                      {selectedRun.memoryPatch.rationale}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.trace}</CardTitle>
                  <CardDescription>
                    Each row is an explicit graph node, not hidden model
                    reasoning.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="grid gap-3">
                    {selectedRun.trace.map((event, index) => (
                      <TraceEventRow
                        event={event}
                        index={index}
                        key={`${event.node}-${event.createdAt}-${index}`}
                        language={language}
                      />
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
