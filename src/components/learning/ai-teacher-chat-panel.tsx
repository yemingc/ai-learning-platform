"use client";

import {
  type FormEvent,
  type MouseEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BookOpenCheck, Bot, ChevronDown, Loader2, Send, Sparkles, X } from "lucide-react";
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
  citations?: CurriculumCitation[];
  memoryPatch?: LearnerMemoryPatch;
  nextStudyAction?: NextStudyActionHint;
  workflowEngine?: string;
  workflowTrace?: TeacherWorkflowTraceEvent[];
};

type CurriculumCitation = {
  chunkId: string;
  conceptId: string;
  href: string;
  sourceLabel: string;
  sectionId: string;
  sectionTitle: string;
  sectionType: string;
  locale: "en" | "zh";
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
    memory: "Learning progress context",
    thinking: "AI Teacher is thinking with the lesson context...",
    misconception: "Possible misconception:",
    learningSignal: "Learning signal:",
    citations: "Referenced lesson sections",
    citationJump: "Jump to section",
    workflowTrace: "AI workflow trace",
    nextStudyAction: "Next study action",
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
      `我会陪你学「${title}」。你可以问某一段哪里没懂，也可以选中文本让我解释，或者让我帮你拆一个常见误区。`,
    defaultFollowUps: [
      "用更简单的话解释一下",
      "再给我一个例子",
      "问我一个引导问题",
    ],
    askSectionPrompt: (section: string) =>
      `请帮我理解「${section}」这一部分。`,
    selectedTextPrompt: "请解释我选中的这段课程内容。",
    timeout:
      "AI 教师响应超过 3 分钟。可以把问题缩短一点再试。",
    failed: "AI 教师请求失败。",
    badge: "AI 教师",
    title: "问问你的 AI 教师",
    description: "回答会基于当前课程内容和你正在阅读的部分。",
    close: "关闭 AI 教师",
    context: "当前上下文",
    memory: "学习进度上下文",
    thinking: "AI 教师正在结合课程内容思考...",
    misconception: "可能的误区：",
    learningSignal: "学习信号：",
    citations: "参考课程内容",
    citationJump: "跳到这一段",
    workflowTrace: "AI 工作流记录",
    nextStudyAction: "下一步建议",
    followUps: "可以继续这样问",
    message: "你的问题",
    placeholder: "可以请它讲简单点、换个例子，或问你一个引导问题。",
    askTeacher: "发送给 AI 教师",
    floating: "问 AI 教师",
    closeOverlay: "关闭 AI 教师浮层",
    teachingMoveLabels: {
      explain: "解释",
      ask_guiding_question: "引导提问",
      give_example: "举例",
      correct_misconception: "纠正误区",
      reflect: "反思",
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
  const [citations, setCitations] = useState<CurriculumCitation[]>([]);
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

  function handleCitationClick(
    event: MouseEvent<HTMLAnchorElement>,
    citation: CurriculumCitation,
  ) {
    if (citation.conceptId !== concept.id) {
      return;
    }

    event.preventDefault();

    const target = document.getElementById(
      `lesson-section-${citation.sectionId}`,
    );

    window.history.replaceState(null, "", citation.href);
    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.dispatchEvent(
      new CustomEvent("lesson:highlight-section", {
        detail: {
          sectionId: citation.sectionId,
        },
      }),
    );
  }

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
    setCitations([]);
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
      setCitations(data.citations ?? []);
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
                <span className="font-semibold">{copy.learningSignal}</span>{" "}
                {memorySignals.evidenceNote}
              </div>
            )}

            {citations.length > 0 && (
              <div className="rounded-lg border border-learning-mint/30 bg-learning-mint/10 p-3 text-xs leading-5">
                <p className="flex items-center gap-2 font-semibold uppercase text-muted-foreground">
                  <BookOpenCheck className="size-4 text-learning-mint" />
                  {copy.citations}
                </p>
                <div className="mt-2 grid gap-2">
                  {citations.map((citation, index) => (
                    <a
                      className="group rounded-md border border-border bg-background/80 p-2 transition-colors hover:border-primary/40 hover:bg-background"
                      href={citation.href}
                      key={citation.chunkId}
                      onClick={(event) => handleCitationClick(event, citation)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <Badge variant="outline">{citation.locale}</Badge>
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground transition-colors group-hover:text-primary">
                          {copy.citationJump}
                        </span>
                      </div>
                      <p className="mt-2 font-semibold">
                        {citation.sectionTitle}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {citation.sourceLabel}
                      </p>
                    </a>
                  ))}
                </div>
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
                      {copy.workflowTrace}
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
                        {copy.nextStudyAction}
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

