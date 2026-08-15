import {
  LearningAgentToolValidationError,
  toLearningAgentToolCall,
} from "./tool-policy.ts";
import type {
  LearningAgentToolCall,
  LearningAgentToolResult,
  LearningAgentToolTrace,
  PendingLearningPlanAction,
} from "./types.ts";
import type { CurriculumCitation } from "@/features/rag/curriculum-context";

export const MAX_LEARNING_AGENT_MODEL_STEPS = 3;
export const MAX_LEARNING_AGENT_TOOL_CALLS = 4;

export type LearningAgentLoopMessage =
  | { role: "system" | "user"; content: string }
  | {
      role: "assistant";
      content: string | null;
      // Provider protocol state only; never expose it in the client response or telemetry.
      reasoningContent?: string | null;
      toolCalls: LearningAgentToolCall[];
    }
  | { role: "tool"; content: string; toolCallId: string };

export type LearningAgentModelTelemetry = {
  model: string;
  durationMs: number;
  finishReason?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type LearningAgentModelTurn = {
  content: string | null;
  reasoningContent?: string | null;
  toolCalls: Array<{
    id: string;
    name: string;
    argumentsJson: string;
  }>;
  telemetry: LearningAgentModelTelemetry;
};

export type LearningAgentLoopResult = {
  assistantMessage: string;
  modelCalls: number;
  toolCalls: number;
  toolResults: LearningAgentToolResult[];
  toolTrace: LearningAgentToolTrace[];
  pendingAction?: PendingLearningPlanAction;
  citations: CurriculumCitation[];
  telemetry: LearningAgentModelTelemetry;
};

function sumOptional(values: Array<number | undefined>) {
  const defined = values.filter((value): value is number => value !== undefined);

  return defined.length > 0
    ? defined.reduce((total, value) => total + value, 0)
    : undefined;
}

function getFallbackAssistantMessage({
  locale,
  pendingAction,
  toolTrace,
  toolResults,
}: {
  locale: "en" | "zh";
  pendingAction?: PendingLearningPlanAction;
  toolTrace: LearningAgentToolTrace[];
  toolResults: LearningAgentToolResult[];
}) {
  if (pendingAction) {
    const concepts = pendingAction.preview.focusConceptTitles.join(
      locale === "zh" ? "、" : ", ",
    );

    return locale === "zh"
      ? `我已经根据你的学习证据生成计划草案，优先学习：${concepts || "当前推荐概念"}。请先检查下方计划卡片，确认后系统才会保存并启用。`
      : `I drafted a plan from your learning evidence, prioritizing ${concepts || "the currently recommended concepts"}. Review the plan card below; it will only be saved and activated after you confirm.`;
  }

  if (
    toolResults.length === 0 &&
    toolTrace.some((event) => event.status !== "succeeded")
  ) {
    return locale === "zh"
      ? "我没能安全完成这次工具查询，学习状态和计划都没有被修改。请稍后重试。"
      : "I could not safely complete the tool request. No learning state or plan was changed. Please try again.";
  }

  const summaries = toolResults.map((result) => result.summary).join(" ");

  return locale === "zh"
    ? `我已完成受控工具查询。${summaries || "目前没有需要执行的写操作。"}`
    : `I completed the bounded tool checks. ${summaries || "No write action is required."}`;
}

export async function runLearningAgentLoop({
  executeTool,
  locale,
  requestModelTurn,
  systemPrompt,
  userMessage,
  onStage,
  maxModelSteps = MAX_LEARNING_AGENT_MODEL_STEPS,
  maxToolCalls = MAX_LEARNING_AGENT_TOOL_CALLS,
}: {
  executeTool: (
    toolCall: LearningAgentToolCall,
  ) => Promise<LearningAgentToolResult>;
  locale: "en" | "zh";
  requestModelTurn: (input: {
    messages: LearningAgentLoopMessage[];
    requireTool: boolean;
  }) => Promise<LearningAgentModelTurn>;
  systemPrompt: string;
  userMessage: string;
  onStage?: (stage: "planning_action" | "executing_tools") => void;
  maxModelSteps?: number;
  maxToolCalls?: number;
}): Promise<LearningAgentLoopResult> {
  const messages: LearningAgentLoopMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];
  const toolResults: LearningAgentToolResult[] = [];
  const toolTrace: LearningAgentToolTrace[] = [];
  const telemetry: LearningAgentModelTelemetry[] = [];
  const citations = new Map<string, CurriculumCitation>();
  let pendingAction: PendingLearningPlanAction | undefined;
  let totalToolCalls = 0;

  for (let step = 0; step < maxModelSteps; step += 1) {
    onStage?.("planning_action");
    const turn = await requestModelTurn({
      messages,
      requireTool: step === 0,
    });

    telemetry.push(turn.telemetry);
    const parsedCalls: LearningAgentToolCall[] = [];

    for (const rawCall of turn.toolCalls) {
      if (totalToolCalls + parsedCalls.length >= maxToolCalls) {
        toolTrace.push({
          callId: rawCall.id,
          toolName: rawCall.name,
          status: "rejected",
          durationMs: 0,
          detail: `Rejected after reaching the ${maxToolCalls}-call safety limit.`,
        });
        continue;
      }

      try {
        parsedCalls.push(toLearningAgentToolCall(rawCall));
      } catch (error) {
        if (!(error instanceof LearningAgentToolValidationError)) {
          throw error;
        }

        toolTrace.push({
          callId: rawCall.id,
          toolName: rawCall.name,
          status: "rejected",
          durationMs: 0,
          detail: error.message,
        });
      }
    }

    messages.push({
      role: "assistant",
      content: turn.content,
      reasoningContent: turn.reasoningContent,
      toolCalls: parsedCalls,
    });

    if (parsedCalls.length === 0) {
      if (turn.toolCalls.length > 0 || step === 0) {
        throw new LearningAgentToolValidationError(
          "The model did not provide a valid required learning-tool call.",
        );
      }

      return {
        assistantMessage: pendingAction
          ? getFallbackAssistantMessage({
              locale,
              pendingAction,
              toolResults,
              toolTrace,
            })
          : turn.content?.trim() ||
            getFallbackAssistantMessage({
              locale,
              pendingAction,
              toolResults,
              toolTrace,
            }),
        citations: Array.from(citations.values()),
        modelCalls: telemetry.length,
        pendingAction,
        telemetry: {
          model: telemetry.at(-1)?.model ?? "unknown",
          durationMs: telemetry.reduce(
            (total, item) => total + item.durationMs,
            0,
          ),
          finishReason: telemetry.at(-1)?.finishReason,
          promptTokens: sumOptional(
            telemetry.map((item) => item.promptTokens),
          ),
          completionTokens: sumOptional(
            telemetry.map((item) => item.completionTokens),
          ),
          totalTokens: sumOptional(telemetry.map((item) => item.totalTokens)),
        },
        toolCalls: totalToolCalls,
        toolResults,
        toolTrace,
      };
    }

    onStage?.("executing_tools");

    for (const toolCall of parsedCalls) {
      const startedAt = Date.now();
      totalToolCalls += 1;

      try {
        const result = await executeTool(toolCall);
        const durationMs = Date.now() - startedAt;

        toolResults.push(result);
        pendingAction = result.pendingAction ?? pendingAction;
        result.citations?.forEach((citation) =>
          citations.set(citation.chunkId, citation),
        );
        toolTrace.push({
          callId: toolCall.id,
          toolName: toolCall.name,
          status: "succeeded",
          durationMs,
          detail: result.summary,
        });
        messages.push({
          role: "tool",
          toolCallId: toolCall.id,
          content: result.modelContent,
        });
      } catch (error) {
        const durationMs = Date.now() - startedAt;
        const detail =
          error instanceof Error ? error.message : "Tool execution failed.";

        toolTrace.push({
          callId: toolCall.id,
          toolName: toolCall.name,
          status: "failed",
          durationMs,
          detail,
        });
        messages.push({
          role: "tool",
          toolCallId: toolCall.id,
          content: JSON.stringify({ error: detail }),
        });
      }
    }
  }

  return {
    assistantMessage: getFallbackAssistantMessage({
      locale,
      pendingAction,
      toolTrace,
      toolResults,
    }),
    citations: Array.from(citations.values()),
    modelCalls: telemetry.length,
    pendingAction,
    telemetry: {
      model: telemetry.at(-1)?.model ?? "unknown",
      durationMs: telemetry.reduce(
        (total, item) => total + item.durationMs,
        0,
      ),
      finishReason: "max_agent_steps",
      promptTokens: sumOptional(telemetry.map((item) => item.promptTokens)),
      completionTokens: sumOptional(
        telemetry.map((item) => item.completionTokens),
      ),
      totalTokens: sumOptional(telemetry.map((item) => item.totalTokens)),
    },
    toolCalls: totalToolCalls,
    toolResults,
    toolTrace,
  };
}
