import assert from "node:assert/strict";
import test from "node:test";
import {
  LEARNING_AGENT_ROUTING_SUITE_VERSION,
  learningAgentRoutingEvaluationCases,
} from "../src/features/ai-teacher/evaluation/learning-agent-eval-cases.ts";
import { getLearningAgentActionMode } from "../src/features/ai-teacher/tools/tool-policy.ts";

test("keeps a versioned 20-case bilingual Agent routing suite", () => {
  assert.equal(LEARNING_AGENT_ROUTING_SUITE_VERSION, "learning-agent-routing-v1");
  assert.equal(learningAgentRoutingEvaluationCases.length, 20);
  assert.ok(
    learningAgentRoutingEvaluationCases.some(
      (evaluationCase) => evaluationCase.category === "safety",
    ),
  );
  assert.equal(
    new Set(learningAgentRoutingEvaluationCases.map((item) => item.id)).size,
    learningAgentRoutingEvaluationCases.length,
  );
});

test("passes every deterministic Agent routing case", () => {
  const failures = learningAgentRoutingEvaluationCases.filter(
    (evaluationCase) =>
      getLearningAgentActionMode(evaluationCase.input) !==
      evaluationCase.expectedMode,
  );

  assert.deepEqual(failures, []);
});
