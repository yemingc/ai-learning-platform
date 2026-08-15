import assert from "node:assert/strict";
import test from "node:test";
import {
  runLearningAgentLoop,
  type LearningAgentModelTurn,
} from "../src/features/ai-teacher/tools/learning-agent-loop.ts";
import {
  getDeepSeekReasoningContent,
  toDeepSeekMessages,
} from "../src/features/ai-teacher/tools/deepseek-message-adapter.ts";
import type {
  LearningAgentToolCall,
  PendingLearningPlanAction,
} from "../src/features/ai-teacher/tools/types.ts";

function telemetry(): LearningAgentModelTurn["telemetry"] {
  return {
    model: "test-model",
    durationMs: 10,
    promptTokens: 10,
    completionTokens: 5,
    totalTokens: 15,
  };
}

const pendingAction: PendingLearningPlanAction = {
  type: "activate_learning_plan",
  status: "pending",
  confirmationToken: "test-confirmation-token-that-is-long-enough",
  expiresAt: "2026-08-14T10:15:00.000Z",
  preview: {
    draftId: "11111111-1111-4111-8111-111111111111",
    title: "Test plan",
    focusConceptIds: ["concept-1"],
    focusConceptTitles: ["Concept 1"],
    estimatedMinutes: 30,
    stepCount: 2,
    generatedAt: "2026-08-14T10:00:00.000Z",
  },
};

test("runs a bounded model-tool-observation loop and returns a pending write", async () => {
  const turns: LearningAgentModelTurn[] = [
    {
      content: null,
      reasoningContent: "Inspect the authenticated learning state first.",
      telemetry: telemetry(),
      toolCalls: [
        {
          id: "call-state",
          name: "get_learning_state",
          argumentsJson: "{}",
        },
      ],
    },
    {
      content: null,
      telemetry: telemetry(),
      toolCalls: [
        {
          id: "call-plan",
          name: "draft_learning_plan",
          argumentsJson: JSON.stringify({ minutesAvailable: 30 }),
        },
      ],
    },
    {
      content: "The plan is already active.",
      telemetry: telemetry(),
      toolCalls: [],
    },
  ];
  const executed: LearningAgentToolCall[] = [];
  const requiredModes: boolean[] = [];
  const observedReasoningHistory: Array<
    Array<string | null | undefined>
  > = [];

  const result = await runLearningAgentLoop({
    locale: "en",
    systemPrompt: "test",
    userMessage: "Create a study plan",
    async executeTool(toolCall) {
      executed.push(toolCall);

      return {
        callId: toolCall.id,
        toolName: toolCall.name,
        modelContent: "{}",
        summary: `${toolCall.name} succeeded`,
        pendingAction:
          toolCall.name === "draft_learning_plan"
            ? pendingAction
            : undefined,
      };
    },
    async requestModelTurn({ messages, requireTool }) {
      requiredModes.push(requireTool);
      observedReasoningHistory.push(
        messages
          .filter((message) => message.role === "assistant")
          .map((message) => message.reasoningContent),
      );
      const turn = turns.shift();
      assert.ok(turn);
      return turn;
    },
  });

  assert.deepEqual(
    executed.map((toolCall) => toolCall.name),
    ["get_learning_state", "draft_learning_plan"],
  );
  assert.deepEqual(requiredModes, [true, false, false]);
  assert.deepEqual(observedReasoningHistory, [
    [],
    ["Inspect the authenticated learning state first."],
    ["Inspect the authenticated learning state first.", undefined],
  ]);
  assert.equal(result.pendingAction?.preview.draftId, pendingAction.preview.draftId);
  assert.equal(result.modelCalls, 3);
  assert.equal(result.toolCalls, 2);
  assert.equal(result.telemetry.totalTokens, 45);
  assert.match(result.assistantMessage, /confirm/i);
});

test("serializes DeepSeek thinking tool turns with required compatibility fields", () => {
  const messages = toDeepSeekMessages([
    { role: "system", content: "system" },
    { role: "user", content: "Create a plan" },
    {
      role: "assistant",
      content: null,
      reasoningContent: "I should inspect course-scoped evidence.",
      toolCalls: [
        {
          id: "call-state",
          name: "get_learning_state",
          argumentsJson: "{}",
        },
      ],
    },
    {
      role: "tool",
      content: "{}",
      toolCallId: "call-state",
    },
  ]);
  const assistantMessage = messages[2] as typeof messages[2] & {
    reasoning_content?: string | null;
  };

  assert.equal(assistantMessage.content, "");
  assert.equal(
    assistantMessage.reasoning_content,
    "I should inspect course-scoped evidence.",
  );
  assert.equal(
    getDeepSeekReasoningContent({
      role: "assistant",
      content: null,
      refusal: null,
      reasoning_content: "provider reasoning",
    }),
    "provider reasoning",
  );
});

test("fails closed without executing a call that injects server-owned identity", async () => {
  let executionCount = 0;

  await assert.rejects(
    runLearningAgentLoop({
      locale: "en",
      maxModelSteps: 1,
      systemPrompt: "test",
      userMessage: "Create a plan",
      async executeTool() {
        executionCount += 1;
        throw new Error("must not execute");
      },
      async requestModelTurn() {
        return {
          content: null,
          telemetry: telemetry(),
          toolCalls: [
            {
              id: "call-injected",
              name: "draft_learning_plan",
              argumentsJson: JSON.stringify({
                minutesAvailable: 30,
                learnerId: "attacker",
              }),
            },
          ],
        };
      },
    }),
    /valid required learning-tool call/,
  );

  assert.equal(executionCount, 0);
});

test("caps tool execution even when the model requests too many calls", async () => {
  let executionCount = 0;

  const result = await runLearningAgentLoop({
    locale: "en",
    maxModelSteps: 1,
    maxToolCalls: 2,
    systemPrompt: "test",
    userMessage: "Show progress",
    async executeTool(toolCall) {
      executionCount += 1;
      return {
        callId: toolCall.id,
        toolName: toolCall.name,
        modelContent: "{}",
        summary: "ok",
      };
    },
    async requestModelTurn() {
      return {
        content: null,
        telemetry: telemetry(),
        toolCalls: [1, 2, 3].map((index) => ({
          id: `call-${index}`,
          name: "get_learning_state",
          argumentsJson: "{}",
        })),
      };
    },
  });

  assert.equal(executionCount, 2);
  assert.equal(result.toolCalls, 2);
  assert.equal(
    result.toolTrace.filter((event) => event.status === "rejected").length,
    1,
  );
});
