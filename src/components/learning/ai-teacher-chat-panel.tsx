"use client";

import {
  type FormEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Bot, ChevronDown, Loader2, Send, Sparkles, X } from "lucide-react";
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
import type { Concept } from "@/features/knowledge/types";
import type { LessonContent } from "@/features/lessons/types";
import { notifyLearnerMemoryUpdated } from "@/features/memory/memory-api-client";
import type {
  TeacherChatMessage,
  TeacherChatResponse,
  TeacherMemorySignals,
  TeachingMove,
} from "@/features/ai-teacher/types";
import type {
  LearnerMemoryPatch,
  NextStudyActionHint,
  TeacherWorkflowTraceEvent,
} from "@/features/ai-teacher/workflow/types";
import { saveWorkflowInspectorRun } from "@/features/ai-teacher/workflow/inspector-store";
import { cn } from "@/lib/utils";

type AiTeacherChatPanelProps = {
  concept: Concept;
  lesson: LessonContent;
  currentSection: string;
};

type LocalMessage = TeacherChatMessage & {
  id: string;
};

type TeacherChatErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

type TeacherChatDebugResponse = TeacherChatResponse & {
  memoryPatch?: LearnerMemoryPatch;
  nextStudyAction?: NextStudyActionHint;
  workflowEngine?: string;
  workflowTrace?: TeacherWorkflowTraceEvent[];
};

type SelectionAction =
  | "explain_this"
  | "give_example"
  | "check_misconception"
  | "ask_guiding_question";

type SendMessageOptions = {
  section?: string;
  selectedText?: string;
  selectionAction?: SelectionAction;
  source?:
    | "direct_chat"
    | "section_action"
    | "text_selection"
    | "memory_recommendation";
};

const CHAT_TIMEOUT_MS = 180_000;

const panelCopy = {
  en: {
    welcome: (title: string) =>
      `I am ready to help with ${title}. Ask about a section, a confusing phrase, or a misconception you want to untangle.`,
    defaultFollowUps: [
      "Explain this more simply",
      "Give me another example",
      "Ask me a guiding question",
    ],
    askSectionPrompt: (section: string) =>
      `Can you help me understand the ${section} section?`,
    selectedTextPrompt: "Explain this selected lesson text.",
    timeout:
      "AI Teacher response timed out after 3 minutes. Please try again with a shorter question.",
    failed: "Teacher chat request failed.",
    badge: "AI Teacher Chat",
    title: "Ask your AI teacher",
    description: "Responses use the current static lesson and section context.",
    close: "Close AI Teacher chat",
    context: "Context",
    memory: "Learner memory placeholder",
    thinking: "AI Teacher is thinking with the lesson context...",
    misconception: "Possible misconception:",
    followUps: "Suggested follow-ups",
    message: "Message",
    placeholder:
      "Ask for a simpler explanation, another example, or a guiding question.",
    askTeacher: "Ask teacher",
    floating: "Ask AI Teacher",
    closeOverlay: "Close AI Teacher overlay",
    teachingMoveLabels: {
      explain: "Explaining",
      ask_guiding_question: "Guiding question",
      give_example: "Example",
      correct_misconception: "Misconception check",
      reflect: "Reflection",
    } satisfies Record<TeachingMove, string>,
  },
  zh: {
    welcome: (title: string) =>
      `我已经准备好帮助你学习 ${title}。你可以问某个段落（section）、困惑的表达（confusing phrase），或想拆解的误区（misconception）。`,
    defaultFollowUps: [
      "请用更简单的话解释这个概念（concept）",
      "再给我一个例子（example）",
      "问我一个引导问题（guiding question）",
    ],
    askSectionPrompt: (section: string) =>
      `请帮我理解 ${section} 这一段落（section）。`,
    selectedTextPrompt: "请解释我选中的课程文本（selected lesson text）。",
    timeout:
      "AI 教师（AI Teacher）响应超过 3 分钟。请用更短的问题再试一次。",
    failed: "AI 教师（AI Teacher）请求失败。",
    badge: "AI 教师聊天（AI Teacher Chat）",
    title: "询问你的 AI 教师（AI teacher）",
    description:
      "回答会基于当前静态课程（static lesson）和段落上下文（section context）。",
    close: "关闭 AI 教师聊天（AI Teacher chat）",
    context: "上下文（context）",
    memory: "学习者记忆占位（learner memory placeholder）",
    thinking: "AI 教师（AI Teacher）正在结合课程上下文思考...",
    misconception: "可能的误区（misconception）：",
    followUps: "建议追问（suggested follow-ups）",
    message: "消息（message）",
    placeholder: "请求更简单的解释、另一个例子（example）或引导问题（guiding question）。",
    askTeacher: "询问教师（Ask teacher）",
    floating: "问 AI 教师",
    closeOverlay: "关闭 AI 教师浮层（AI Teacher overlay）",
    teachingMoveLabels: {
      explain: "解释（explain）",
      ask_guiding_question: "引导问题（guiding question）",
      give_example: "例子（example）",
      correct_misconception: "纠正误区（misconception check）",
      reflect: "反思（reflection）",
    } satisfies Record<TeachingMove, string>,
  },
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AiTeacherChatPanel({
  concept,
  lesson,
  currentSection,
}: AiTeacherChatPanelProps) {
  const { language } = useLanguage();
  const copy = panelCopy[language];
  const [activeSection, setActiveSection] = useState(currentSection);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: copy.welcome(lesson.title),
    },
  ]);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>(
    copy.defaultFollowUps,
  );
  const [detectedMisconception, setDetectedMisconception] = useState<
    string | undefined
  >();
  const [teachingMove, setTeachingMove] = useState<TeachingMove>("explain");
  const [memorySignals, setMemorySignals] = useState<
    TeacherMemorySignals | undefined
  >();
  const [workflowEngine, setWorkflowEngine] = useState<string | undefined>();
  const [workflowTrace, setWorkflowTrace] = useState<
    TeacherWorkflowTraceEvent[]
  >([]);
  const [isWorkflowTraceExpanded, setIsWorkflowTraceExpanded] =
    useState(false);
  const [nextStudyAction, setNextStudyAction] = useState<
    NextStudyActionHint | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [error, setError] = useState<string | undefined>();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const contextLabel = useMemo(
    () => `${lesson.title} - ${activeSection}`,
    [activeSection, lesson.title],
  );

  useEffect(() => {
    function handleAskSection(event: Event) {
      const customEvent = event as CustomEvent<{ section?: string }>;
      const section = customEvent.detail?.section ?? currentSection;
      const isMobile = window.matchMedia("(max-width: 1023px)").matches;

      setActiveSection(section);
      setInput(copy.askSectionPrompt(section));
      setError(undefined);

      if (isMobile) {
        setIsMobileOpen(true);
      }

      window.setTimeout(() => inputRef.current?.focus(), 0);
    }

    window.addEventListener("ai-teacher:ask-section", handleAskSection);

    return () => {
      window.removeEventListener("ai-teacher:ask-section", handleAskSection);
    };
  }, [copy, currentSection]);

  useEffect(() => {
    desktopScrollRef.current?.scrollTo({
      top: desktopScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
    mobileScrollRef.current?.scrollTo({
      top: mobileScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isLoading, messages]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setLoadingSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  async function sendMessage(
    messageText?: string,
    options?: SendMessageOptions,
  ) {
    const userMessage = (messageText ?? input).trim();

    if (!userMessage || isLoading) {
      return;
    }

    const sectionForRequest = options?.section ?? activeSection;

    if (options?.section) {
      setActiveSection(options.section);
    }

    const nextUserMessage: LocalMessage = {
      id: createId(),
      role: "user",
      content: userMessage,
    };
    const nextMessages = [...messages, nextUserMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setError(undefined);
    setDetectedMisconception(undefined);
    setMemorySignals(undefined);
    setWorkflowTrace([]);
    setIsWorkflowTraceExpanded(false);
    setNextStudyAction(undefined);
    setLoadingSeconds(0);

    let timeoutId: number | undefined;

    try {
      const controller = new AbortController();
      const requestStartedAt = Date.now();
      timeoutId = window.setTimeout(
        () => controller.abort(),
        CHAT_TIMEOUT_MS,
      );

      const response = await fetch("/api/teacher-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: concept.courseId,
          conceptId: concept.id,
          locale: language,
          currentSection: sectionForRequest,
          userMessage,
          selectedText: options?.selectedText,
          selectionAction: options?.selectionAction,
          source: options?.source ?? "direct_chat",
          chatHistory: messages
            .filter((message) => message.id !== "welcome")
            .slice(-8)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });

      window.clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = (await response
          .json()
          .catch(() => undefined)) as TeacherChatErrorResponse | undefined;

        throw new Error(
          errorBody?.error?.message ??
            `Teacher chat request failed with status ${response.status}.`,
        );
      }

      const responseWorkflowEngine =
        response.headers.get("X-Teacher-Workflow-Engine") ?? undefined;
      const data = (await response.json()) as TeacherChatDebugResponse;

      setMessages([
        ...nextMessages,
        {
          id: createId(),
          role: "assistant",
          content: data.assistantMessage,
        },
      ]);
      setSuggestedFollowUps(data.suggestedFollowUps);
      setDetectedMisconception(data.detectedMisconception);
      setTeachingMove(data.teachingMove);
      setMemorySignals(data.memorySignals);
      setWorkflowEngine(responseWorkflowEngine ?? data.workflowEngine);
      setWorkflowTrace(data.workflowTrace ?? []);
      setIsWorkflowTraceExpanded(false);
      setNextStudyAction(data.nextStudyAction);

      if (data.workflowTrace?.length) {
        saveWorkflowInspectorRun({
          id: createId(),
          assistantMessage: data.assistantMessage,
          conceptId: concept.id,
          conceptTitle: concept.title,
          createdAt: new Date().toISOString(),
          detectedMisconception: data.detectedMisconception,
          durationMs: Date.now() - requestStartedAt,
          locale: language,
          memoryPatch: data.memoryPatch,
          memorySignals: data.memorySignals,
          nextStudyAction: data.nextStudyAction,
          section: sectionForRequest,
          selectedText: options?.selectedText,
          teachingMove: data.teachingMove,
          trace: data.workflowTrace,
          userMessage,
          workflowEngine: responseWorkflowEngine ?? data.workflowEngine ?? "unknown",
        });
      }

      notifyLearnerMemoryUpdated();
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        setError(
          copy.timeout,
        );
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : copy.failed,
        );
      }
    } finally {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      setIsLoading(false);
      setLoadingSeconds(0);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  useEffect(() => {
    function handleSendSelection(event: Event) {
      const customEvent = event as CustomEvent<{
        section?: string;
        selectedText?: string;
        selectionAction?: SelectionAction;
        prompt?: string;
        source?: SendMessageOptions["source"];
      }>;
      const section = customEvent.detail?.section ?? currentSection;
      const selectedText = customEvent.detail?.selectedText;
      const prompt =
        customEvent.detail?.prompt ??
        (selectedText
          ? copy.selectedTextPrompt
          : copy.askSectionPrompt(section));
      const isMobile = window.matchMedia("(max-width: 1023px)").matches;

      setActiveSection(section);
      setError(undefined);

      if (isMobile) {
        setIsMobileOpen(true);
      }

      void sendMessage(prompt, {
        section,
        selectedText,
        selectionAction: customEvent.detail?.selectionAction,
        source:
          customEvent.detail?.source ??
          (selectedText ? "text_selection" : "section_action"),
      });
    }

    window.addEventListener("ai-teacher:send-selection", handleSendSelection);

    return () => {
      window.removeEventListener(
        "ai-teacher:send-selection",
        handleSendSelection,
      );
    };
  });

  function renderChatSurface({
    idPrefix,
    scrollRef,
    onClose,
  }: {
    idPrefix: string;
    scrollRef: RefObject<HTMLDivElement | null>;
    onClose?: () => void;
  }) {
    return (
      <Card className="flex h-full min-h-0 flex-col">
        <CardHeader className="shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge className="w-fit" variant="secondary">
                {copy.badge}
              </Badge>
              <CardTitle className="mt-3 flex items-center gap-2">
                <Bot className="size-5 text-primary" />
                {copy.title}
              </CardTitle>
            </div>
            {onClose && (
              <button
                aria-label={copy.close}
                className={buttonVariants({ variant: "ghost", size: "icon" })}
                onClick={onClose}
                type="button"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <CardDescription>
            {copy.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          <div
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4"
            ref={scrollRef}
          >
            <div className="space-y-2 rounded-lg border border-border bg-background/70 p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {copy.context}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{contextLabel}</Badge>
                <Badge variant="outline">{copy.memory}</Badge>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-background/70 p-3">
              {messages.map((message) => (
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm leading-6",
                    message.role === "assistant"
                      ? "bg-card text-card-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                  key={message.id}
                >
                  {message.content}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 rounded-lg bg-card p-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {copy.thinking}
                  {loadingSeconds > 0 ? ` ${loadingSeconds}s` : ""}
                </div>
              )}
            </div>

            {detectedMisconception && (
              <div className="rounded-lg border border-border bg-muted p-3 text-sm leading-6">
                <span className="font-semibold">{copy.misconception}</span>{" "}
                {detectedMisconception}
              </div>
            )}

            {memorySignals && (
              <div className="rounded-lg border border-learning-mint/30 bg-learning-mint/10 p-3 text-sm leading-6">
                <span className="font-semibold">Learning signal:</span>{" "}
                {memorySignals.evidenceNote}
              </div>
            )}

            {workflowTrace.length > 0 && (
              <div className="rounded-lg border border-border bg-background/70 p-3 text-xs leading-5">
                <button
                  aria-controls={`${idPrefix}-workflow-trace`}
                  aria-expanded={isWorkflowTraceExpanded}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  onClick={() =>
                    setIsWorkflowTraceExpanded((isExpanded) => !isExpanded)
                  }
                  type="button"
                >
                  <span>
                    <span className="font-semibold">
                      {language === "zh"
                        ? "AI 工作流轨迹（workflow trace）"
                        : "AI workflow trace"}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {workflowTrace.length} nodes
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {workflowEngine && (
                      <Badge variant="outline">{workflowEngine}</Badge>
                    )}
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isWorkflowTraceExpanded && "rotate-180",
                      )}
                    />
                  </span>
                </button>

                {isWorkflowTraceExpanded && (
                  <div id={`${idPrefix}-workflow-trace`}>
                    <ol className="mt-3 space-y-1">
                      {workflowTrace.map((event, index) => (
                        <li
                          className="rounded-md bg-muted/50 px-2 py-1"
                          key={`${event.node}-${event.createdAt}-${index}`}
                        >
                          <span className="font-medium">{event.node}</span>
                          {event.detail && (
                            <span className="text-muted-foreground">
                              {" "}
                              - {event.detail}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                    {nextStudyAction && (
                      <p className="mt-2 text-muted-foreground">
                        {language === "zh"
                          ? "下一步建议（next study action）"
                          : "Next study action"}
                        : {nextStudyAction.action} - {nextStudyAction.reason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm leading-6 text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {copy.followUps}
                </p>
                <Badge variant="outline">
                  {copy.teachingMoveLabels[teachingMove]}
                </Badge>
              </div>
              <div className="grid gap-2">
                {suggestedFollowUps.map((followUp) => (
                  <button
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "h-auto w-full min-w-0 max-w-full justify-start whitespace-normal break-words px-3 py-2 text-left leading-5",
                    )}
                    disabled={isLoading}
                    key={followUp}
                    onClick={() => void sendMessage(followUp)}
                    type="button"
                  >
                    {followUp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form
            className="shrink-0 space-y-2 border-t border-border bg-card/95 p-4 shadow-[0_-10px_24px_rgba(15,23,42,0.05)]"
            onSubmit={handleSubmit}
          >
            <label
              className="text-xs font-semibold uppercase text-muted-foreground"
              htmlFor={`${idPrefix}-teacher-message`}
            >
              {copy.message}
            </label>
            <textarea
              className="min-h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              disabled={isLoading}
              id={`${idPrefix}-teacher-message`}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.placeholder}
              ref={inputRef}
              value={input}
            />
            <Button className="w-full" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {copy.askTeacher}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <aside className="hidden h-[calc(100vh-7rem)] lg:sticky lg:top-24 lg:block">
        {renderChatSurface({
          idPrefix: "desktop",
          scrollRef: desktopScrollRef,
        })}
      </aside>

      <button
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg lg:hidden"
        onClick={() => setIsMobileOpen(true)}
        type="button"
      >
        <Sparkles className="size-4" />
        {copy.floating}
      </button>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label={copy.closeOverlay}
            className="absolute inset-0 bg-foreground/35"
            onClick={() => setIsMobileOpen(false)}
            type="button"
          />
          <div className="absolute inset-x-0 bottom-0 h-[82vh] rounded-t-lg border border-border bg-background p-3 shadow-2xl">
            {renderChatSurface({
              idPrefix: "mobile",
              onClose: () => setIsMobileOpen(false),
              scrollRef: mobileScrollRef,
            })}
          </div>
        </div>
      )}
    </>
  );
}
