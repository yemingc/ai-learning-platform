import assert from "node:assert/strict";
import test from "node:test";
import {
  getCurrentLearningSignals,
  hasCurrentReviewSignal,
} from "../src/features/memory/current-learning-signals.ts";
import type {
  ConceptMemory,
  TeacherInteractionMemory,
} from "../src/features/memory/types.ts";

const reviewSignal = {
  confidenceDelta: -4,
  confusionLevel: "high" as const,
  evidenceNote: "The learner is still mixing up the two ideas.",
  needsReview: true,
  suggestedStudyAction: "repair_misconception" as const,
};

function createInteraction(createdAt: string): TeacherInteractionMemory {
  return {
    conceptId: "what-is-a-limit",
    conceptTitle: "What is a limit?",
    createdAt,
    id: `interaction-${createdAt}`,
    locale: "en",
    memorySignals: reviewSignal,
    section: "Common trap",
    source: "direct_chat",
    teachingMove: "ask_guiding_question",
    userMessage: "I think the limit must equal the function value.",
  };
}

function createMemory(interactionCreatedAt: string): ConceptMemory {
  return {
    assessmentAttempts: [
      {
        assessmentId: "what-is-a-limit-exit",
        assessmentVersion: "v1",
        conceptId: "what-is-a-limit",
        correctCount: 2,
        id: "exit-1",
        itemResults: [],
        phase: "exit_ticket",
        questionCount: 2,
        score: 100,
        submittedAt: "2026-01-02T00:00:00.000Z",
      },
    ],
    conceptId: "what-is-a-limit",
    conceptTitle: "What is a limit?",
    confusionSignals: [],
    interactionCount: 1,
    memorySignalHistory: [reviewSignal],
    misconceptions: [],
    readiness: 80,
    recentInteractions: [createInteraction(interactionCreatedAt)],
    status: "familiar",
  };
}

test("stronger exit evidence supersedes older AI-inferred review signals", () => {
  const memory = createMemory("2026-01-01T12:00:00.000Z");

  assert.deepEqual(getCurrentLearningSignals(memory), []);
  assert.equal(hasCurrentReviewSignal(memory), false);
});

test("review evidence observed after the exit ticket becomes current again", () => {
  const memory = createMemory("2026-01-03T00:00:00.000Z");

  assert.deepEqual(getCurrentLearningSignals(memory), [reviewSignal]);
  assert.equal(hasCurrentReviewSignal(memory), true);
});

test("audit-only interactions never reopen a learning review signal", () => {
  const memory = createMemory("2026-01-03T00:00:00.000Z");
  memory.recentInteractions[0] = {
    ...memory.recentInteractions[0],
    evidenceMode: "audit_only",
  };

  assert.deepEqual(getCurrentLearningSignals(memory), []);
  assert.equal(hasCurrentReviewSignal(memory), false);
});
