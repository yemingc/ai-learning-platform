import assert from "node:assert/strict";
import test from "node:test";
import {
  getMissingSuccessfulWorkflowNodes,
  requiredWorkflowNodes,
} from "../src/features/ai-teacher/evaluation/workflow-trace-evaluation.ts";
import type { TeacherWorkflowTraceEvent } from "../src/features/ai-teacher/workflow/types.ts";

test("requires every branch-independent teaching workflow stage", () => {
  assert.deepEqual(requiredWorkflowNodes, [
    "student_message",
    "build_context",
    "classify_user_intent",
    "select_teaching_strategy",
    "decide_curriculum_retrieval",
    "generate_validated_response",
    "extract_learning_signals",
    "decide_memory_update",
    "return_next_study_action",
  ]);
});

test("reports missing or unsuccessful nodes from an actual trace", () => {
  const partialTrace: TeacherWorkflowTraceEvent[] = requiredWorkflowNodes
    .slice(0, -1)
    .map((node) => ({
      createdAt: "2026-01-01T00:00:00.000Z",
      node,
      status: "success",
    }));
  partialTrace[4] = {
    ...partialTrace[4],
    status: "error",
  };

  assert.deepEqual(getMissingSuccessfulWorkflowNodes(partialTrace), [
    "decide_curriculum_retrieval",
    "return_next_study_action",
  ]);
});

test("accepts a complete successful workflow trace", () => {
  const trace = requiredWorkflowNodes.map((node) => ({
    createdAt: "2026-01-01T00:00:00.000Z",
    node,
    status: "success" as const,
  }));

  assert.deepEqual(getMissingSuccessfulWorkflowNodes(trace), []);
});
