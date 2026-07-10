import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyTeacherIntent,
  createTeacherMemoryPatch,
  selectTeachingStrategy,
} from "../src/features/ai-teacher/workflow/teacher-policy.ts";

test("classifies explicit English and Chinese learning intents", () => {
  assert.equal(
    classifyTeacherIntent({ userMessage: "Can you give me another example?" }),
    "example_request",
  );
  assert.equal(
    classifyTeacherIntent({ userMessage: "我不懂为什么两边要相等" }),
    "confusion",
  );
  assert.equal(
    classifyTeacherIntent({
      selectionAction: "check_misconception",
      userMessage: "Check this",
    }),
    "misconception",
  );
});

test("uses relevant persistent memory for substantive general support", () => {
  assert.equal(
    selectTeachingStrategy(
      "general_support",
      {
        source: "server_persistent",
        recentMisconceptions: [
          "The limit is always the same as the function value.",
        ],
      },
      "What should I focus on next?",
    ),
    "correct_misconception",
  );

  assert.equal(
    selectTeachingStrategy(
      "general_support",
      { source: "server_persistent", readiness: 82 },
      "What should I do next?",
    ),
    "reflect",
  );
});

test("current explicit intent and lightweight messages take priority over memory", () => {
  const memory = {
    source: "server_persistent" as const,
    readiness: 88,
    recentMisconceptions: ["A stale misconception hypothesis"],
  };

  assert.equal(
    selectTeachingStrategy("confusion", memory, "I am confused"),
    "explain",
  );
  assert.equal(
    selectTeachingStrategy("general_support", memory, "thanks"),
    "explain",
  );
});

test("marks authenticated workflow patches for server persistence", () => {
  const patch = createTeacherMemoryPatch({
    conceptId: "what-is-a-limit",
    memorySnapshot: { source: "server_persistent" },
    memorySignals: {
      confidenceDelta: 2,
      confusionLevel: "low",
      evidenceNote: "The learner explained nearby behavior clearly.",
      needsReview: false,
      suggestedStudyAction: "ready_for_application",
    },
  });

  assert.equal(patch.shouldPersistClientSide, false);
  assert.match(patch.rationale, /server-side learner memory/);
});
