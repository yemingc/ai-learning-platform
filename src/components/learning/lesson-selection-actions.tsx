"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Lightbulb, MessageSquare, SearchCheck, Sparkles } from "lucide-react";
import { useLanguage, type Language } from "@/components/i18n/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LessonSelectionActionsProps = {
  children: ReactNode;
};

type SelectionState = {
  text: string;
  section: string;
  x: number;
  y: number;
};

type QuickAction = {
  label: Record<Language, string>;
  selectionAction:
    | "explain_this"
    | "give_example"
    | "check_misconception"
    | "ask_guiding_question";
  prompt: Record<Language, (text: string) => string>;
  icon: ReactNode;
};

const quickActions: QuickAction[] = [
  {
    label: {
      en: "Explain this",
      zh: "解释这段",
    },
    selectionAction: "explain_this",
    prompt: {
      en: () => "Explain this selected lesson text.",
      zh: () => "请解释我选中的这段课程内容。",
    },
    icon: <Sparkles className="size-4" />,
  },
  {
    label: {
      en: "Give example",
      zh: "举个例子",
    },
    selectionAction: "give_example",
    prompt: {
      en: () => "Give me another example for this selected text.",
      zh: () => "请基于我选中的这段内容，再给我一个例子。",
    },
    icon: <Lightbulb className="size-4" />,
  },
  {
    label: {
      en: "Check trap",
      zh: "检查误区",
    },
    selectionAction: "check_misconception",
    prompt: {
      en: () => "What misconception should I watch for in this selected text?",
      zh: () => "这段内容里我最容易产生什么误区？请帮我指出并纠正。",
    },
    icon: <SearchCheck className="size-4" />,
  },
  {
    label: {
      en: "Guide me",
      zh: "引导我",
    },
    selectionAction: "ask_guiding_question",
    prompt: {
      en: () => "Ask me a guiding question about this selected text.",
      zh: () => "请围绕我选中的内容，问我一个引导问题。",
    },
    icon: <MessageSquare className="size-4" />,
  },
];

function getSectionLabel(node: Node | null) {
  const element =
    node instanceof Element ? node : node?.parentElement ?? undefined;

  return (
    element
      ?.closest("[data-lesson-section]")
      ?.getAttribute("data-lesson-section") ?? "Selected lesson text"
  );
}

export function LessonSelectionActions({
  children,
}: LessonSelectionActionsProps) {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionState | undefined>();

  function updateSelection() {
    const currentSelection = window.getSelection();
    const container = containerRef.current;

    if (!currentSelection || !container || currentSelection.rangeCount === 0) {
      setSelection(undefined);
      return;
    }

    const text = currentSelection.toString().replace(/\s+/g, " ").trim();

    if (!text || text.length < 2) {
      setSelection(undefined);
      return;
    }

    const range = currentSelection.getRangeAt(0);

    if (
      !container.contains(range.commonAncestorContainer) &&
      !currentSelection.containsNode(container, true)
    ) {
      setSelection(undefined);
      return;
    }

    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      setSelection(undefined);
      return;
    }

    setSelection({
      text: text.slice(0, 2200),
      section: getSectionLabel(range.commonAncestorContainer),
      x: rect.left + rect.width / 2,
      y: Math.max(rect.top - 12, 72),
    });
  }

  function sendSelection(action: QuickAction) {
    if (!selection) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("ai-teacher:send-selection", {
        detail: {
          section: selection.section,
          selectedText: selection.text,
          selectionAction: action.selectionAction,
          prompt: action.prompt[language](selection.text),
        },
      }),
    );
    window.getSelection()?.removeAllRanges();
    setSelection(undefined);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        !containerRef.current?.contains(target) &&
        !(target instanceof Element && target.closest("[data-selection-menu]"))
      ) {
        setSelection(undefined);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div
      onKeyUp={updateSelection}
      onMouseUp={() => window.setTimeout(updateSelection, 0)}
      ref={containerRef}
    >
      {children}
      {selection && (
        <div
          className="fixed z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-full flex-wrap gap-1 rounded-lg border border-border bg-card p-1 shadow-xl"
          data-selection-menu
          style={{ left: selection.x, top: selection.y }}
        >
          {quickActions.map((action) => (
            <button
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "px-2",
              )}
              key={action.selectionAction}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => sendSelection(action)}
              type="button"
            >
              {action.icon}
              {action.label[language]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
