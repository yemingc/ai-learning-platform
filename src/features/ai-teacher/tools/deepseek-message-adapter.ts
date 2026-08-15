import type OpenAI from "openai";
import type { LearningAgentLoopMessage } from "./learning-agent-loop.ts";

type DeepSeekAssistantMessageParam =
  OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam & {
    reasoning_content?: string | null;
  };

export function getDeepSeekReasoningContent(message: unknown) {
  if (typeof message !== "object" || message === null) {
    return undefined;
  }

  const reasoningContent = (
    message as {
      reasoning_content?: unknown;
    }
  ).reasoning_content;

  return typeof reasoningContent === "string" || reasoningContent === null
    ? reasoningContent
    : undefined;
}

export function toDeepSeekMessages(
  messages: LearningAgentLoopMessage[],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  return messages.map((message) => {
    if (message.role === "assistant") {
      const assistantMessage: DeepSeekAssistantMessageParam = {
        role: "assistant",
        // DeepSeek V4 requires assistant tool-call history to carry content,
        // even when the provider originally returned null.
        content: message.content ?? "",
        tool_calls: message.toolCalls.map((toolCall) => ({
          id: toolCall.id,
          type: "function" as const,
          function: {
            name: toolCall.name,
            arguments: toolCall.argumentsJson,
          },
        })),
      };

      if (message.reasoningContent !== undefined) {
        assistantMessage.reasoning_content = message.reasoningContent;
      }

      return assistantMessage;
    }

    if (message.role === "tool") {
      return {
        role: "tool" as const,
        content: message.content,
        tool_call_id: message.toolCallId,
      };
    }

    return {
      role: message.role,
      content: message.content,
    };
  });
}
