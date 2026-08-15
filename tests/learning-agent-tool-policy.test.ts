import assert from "node:assert/strict";
import test from "node:test";
import {
  getLearningAgentActionMode,
  LearningAgentToolValidationError,
  parseLearningAgentToolCall,
} from "../src/features/ai-teacher/tools/tool-policy.ts";

test("routes explicit Chinese and English planning requests to the learning agent", () => {
  const actionRequests = [
    "我今天只有30分钟，帮我安排复习计划",
    "查看我的学习进度",
    "我接下来该学什么？",
    "Create a study plan for this week",
    "What should I review next?",
  ];

  for (const request of actionRequests) {
    assert.equal(getLearningAgentActionMode(request), "learning_agent");
  }
});

test("keeps ordinary teaching requests on the existing grounded workflow", () => {
  const teachingRequests = [
    "请解释极限为什么不等于函数值",
    "再给我一个例子",
    "What does continuity mean?",
    "帮我理解当前这一段",
  ];

  for (const request of teachingRequests) {
    assert.equal(getLearningAgentActionMode(request), "teach");
  }
});

test("accepts allowlisted tool arguments and rejects server-scope injection", () => {
  assert.deepEqual(
    parseLearningAgentToolCall({
      id: "call-1",
      name: "draft_learning_plan",
      argumentsJson: JSON.stringify({ minutesAvailable: 30 }),
    }),
    {
      id: "call-1",
      name: "draft_learning_plan",
      arguments: { minutesAvailable: 30 },
    },
  );

  assert.throws(
    () =>
      parseLearningAgentToolCall({
        id: "call-2",
        name: "draft_learning_plan",
        argumentsJson: JSON.stringify({
          minutesAvailable: 30,
          learnerId: "another-user",
          courseId: "another-course",
        }),
      }),
    LearningAgentToolValidationError,
  );
});

test("rejects unknown tools, invalid JSON, and out-of-range arguments", () => {
  assert.throws(
    () =>
      parseLearningAgentToolCall({
        id: "call-1",
        name: "run_sql",
        argumentsJson: "{}",
      }),
    LearningAgentToolValidationError,
  );
  assert.throws(
    () =>
      parseLearningAgentToolCall({
        id: "call-2",
        name: "get_learning_state",
        argumentsJson: "{",
      }),
    LearningAgentToolValidationError,
  );
  assert.throws(
    () =>
      parseLearningAgentToolCall({
        id: "call-3",
        name: "draft_learning_plan",
        argumentsJson: JSON.stringify({ minutesAvailable: 5 }),
      }),
    LearningAgentToolValidationError,
  );
});
