import assert from "node:assert/strict";
import test from "node:test";
import { createLearnerMemorySnapshot } from "../src/features/memory/learner-memory-snapshot.ts";
import type { ConceptMemory } from "../src/features/memory/types.ts";

test("creates an empty server-persistent snapshot for a new concept", () => {
  assert.deepEqual(createLearnerMemorySnapshot(undefined, "limit-notation"), {
    conceptId: "limit-notation",
    interactionCount: 0,
    recentConfusionSections: [],
    recentMisconceptions: [],
    assessmentEvidenceLevel: "none",
    source: "server_persistent",
  });
});

test("returns a minimal, ranked personalization snapshot", () => {
  const conceptMemory: ConceptMemory = {
    conceptId: "what-is-a-limit",
    conceptTitle: "What is a limit?",
    confusionSignals: [
      {
        conceptId: "what-is-a-limit",
        count: 1,
        firstSeenAt: "2026-01-01T00:00:00.000Z",
        id: "confusion-1",
        lastSeenAt: "2026-01-01T00:00:00.000Z",
        section: "Formal idea",
      },
      {
        conceptId: "what-is-a-limit",
        count: 3,
        firstSeenAt: "2026-01-01T00:00:00.000Z",
        id: "confusion-2",
        lastSeenAt: "2026-01-02T00:00:00.000Z",
        section: "Common trap",
      },
    ],
    interactionCount: 4,
    memorySignalHistory: [
      {
        confidenceDelta: -4,
        confusionLevel: "medium",
        evidenceNote: "The learner mixed up nearby behavior and f(a).",
        needsReview: true,
        suggestedStudyAction: "repair_misconception",
      },
    ],
    misconceptions: [
      {
        conceptId: "what-is-a-limit",
        count: 1,
        firstSeenAt: "2026-01-01T00:00:00.000Z",
        id: "misconception-1",
        lastSeenAt: "2026-01-01T00:00:00.000Z",
        sourceSection: "Common trap",
        text: "A hole means a limit cannot exist.",
      },
      {
        conceptId: "what-is-a-limit",
        count: 2,
        firstSeenAt: "2026-01-01T00:00:00.000Z",
        id: "misconception-2",
        lastSeenAt: "2026-01-02T00:00:00.000Z",
        sourceSection: "Common trap",
        text: "The limit must equal the function value.",
      },
    ],
    readiness: 46,
    recentInteractions: [],
    assessmentAttempts: [],
    status: "learning",
  };

  const snapshot = createLearnerMemorySnapshot(
    conceptMemory,
    conceptMemory.conceptId,
  );

  assert.equal(snapshot.source, "server_persistent");
  assert.equal(snapshot.readiness, 46);
  assert.equal(snapshot.interactionCount, 4);
  assert.equal(snapshot.status, "learning");
  assert.deepEqual(snapshot.recentConfusionSections, [
    "Common trap",
    "Formal idea",
  ]);
  assert.deepEqual(snapshot.recentMisconceptions, [
    "The limit must equal the function value.",
    "A hole means a limit cannot exist.",
  ]);
  assert.equal(snapshot.latestSuggestedStudyAction, "repair_misconception");
  assert.equal(snapshot.assessmentEvidenceLevel, "none");
  assert.equal(
    snapshot.latestEvidenceNote,
    "The learner mixed up nearby behavior and f(a).",
  );
});

test("includes server-scored pre/post evidence for AI Teacher personalization", () => {
  const conceptMemory: ConceptMemory = {
    conceptId: "what-is-a-limit",
    conceptTitle: "What is a limit?",
    confusionSignals: [],
    interactionCount: 0,
    memorySignalHistory: [],
    misconceptions: [],
    readiness: 80,
    recentInteractions: [],
    assessmentAttempts: [
      {
        id: "exit-1",
        assessmentId: "what-is-a-limit-exit_ticket",
        assessmentVersion: "unit-1-formative-v1",
        conceptId: "what-is-a-limit",
        phase: "exit_ticket",
        score: 100,
        correctCount: 2,
        questionCount: 2,
        itemResults: [],
        submittedAt: "2026-01-02T00:00:00.000Z",
      },
      {
        id: "diagnostic-1",
        assessmentId: "what-is-a-limit-diagnostic",
        assessmentVersion: "unit-1-formative-v1",
        conceptId: "what-is-a-limit",
        phase: "diagnostic",
        score: 50,
        correctCount: 1,
        questionCount: 2,
        itemResults: [],
        submittedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    status: "familiar",
  };

  const snapshot = createLearnerMemorySnapshot(
    conceptMemory,
    conceptMemory.conceptId,
  );

  assert.equal(snapshot.diagnosticScore, 50);
  assert.equal(snapshot.exitTicketScore, 100);
  assert.equal(snapshot.learningGain, 50);
  assert.equal(snapshot.assessmentEvidenceLevel, "pre_post");
});
