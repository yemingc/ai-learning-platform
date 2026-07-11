import assert from "node:assert/strict";
import test from "node:test";
import type { CurriculumPack } from "../src/curricula/types.ts";
import type { ConceptMemory, LearnerMemory } from "../src/features/memory/types.ts";
import { createAdaptiveLearningPlan } from "../src/features/planner/adaptive-learning-plan.ts";

const concepts = [
  {
    id: "foundation",
    courseId: "test-course",
    unitId: "test-unit",
    topicId: "test-topic",
    title: "Foundation",
    description: "Foundation concept",
    prerequisiteConceptIds: [],
    learningObjectives: [],
    commonMisconceptions: [],
    examples: [],
    difficulty: "foundational" as const,
    estimatedMinutes: 10,
  },
  {
    id: "middle",
    courseId: "test-course",
    unitId: "test-unit",
    topicId: "test-topic",
    title: "Middle",
    description: "Middle concept",
    prerequisiteConceptIds: ["foundation"],
    learningObjectives: [],
    commonMisconceptions: [],
    examples: [],
    difficulty: "developing" as const,
    estimatedMinutes: 15,
  },
  {
    id: "advanced",
    courseId: "test-course",
    unitId: "test-unit",
    topicId: "test-topic",
    title: "Advanced",
    description: "Advanced concept",
    prerequisiteConceptIds: ["middle"],
    learningObjectives: [],
    commonMisconceptions: [],
    examples: [],
    difficulty: "advanced" as const,
    estimatedMinutes: 20,
  },
];

const curriculum: CurriculumPack = {
  id: "test-course",
  catalog: {
    status: "available",
    level: "Test",
    tags: ["test"],
  },
  capabilities: {
    formativeAssessments: false,
    conceptVisualizations: false,
  },
  course: {
    id: "test-course",
    title: "Test course",
    shortTitle: "Test",
    subject: "Testing",
    description: "Test curriculum",
    unitIds: ["test-unit"],
  },
  concepts,
  defaultUnitId: "test-unit",
  dependencies: [],
  lessons: [],
  teachingProfile: {
    role: "teacher",
    audience: "learner",
    tone: "clear",
    terminologyPolicy: "plain",
    learningPriorities: [],
  },
  topics: [
    {
      id: "test-topic",
      unitId: "test-unit",
      sequence: 1,
      title: "Test topic",
      description: "Test topic",
      conceptIds: concepts.map((concept) => concept.id),
    },
  ],
  units: [
    {
      id: "test-unit",
      courseId: "test-course",
      sequence: 1,
      title: "Test unit",
      description: "Test unit",
      topicIds: ["test-topic"],
      conceptIds: concepts.map((concept) => concept.id),
      estimatedMinutes: 45,
    },
  ],
};

function createMemory(
  conceptId: string,
  overrides: Partial<ConceptMemory> = {},
): ConceptMemory {
  return {
    assessmentAttempts: [],
    conceptId,
    conceptTitle: conceptId,
    confusionSignals: [],
    interactionCount: 1,
    memorySignalHistory: [],
    misconceptions: [],
    readiness: 40,
    recentInteractions: [],
    status: "learning",
    ...overrides,
  };
}

function createAssessmentAttempt(
  conceptId: string,
  phase: "diagnostic" | "exit_ticket",
  score: number,
) {
  return {
    id: `${conceptId}-${phase}`,
    assessmentId: `${conceptId}-${phase}`,
    assessmentVersion: "v1",
    conceptId,
    phase,
    score,
    correctCount: score >= 50 ? 1 : 0,
    questionCount: 1,
    itemResults: [],
    submittedAt:
      phase === "exit_ticket"
        ? "2026-01-02T00:00:00.000Z"
        : "2026-01-01T00:00:00.000Z",
  };
}

function wrapMemory(
  conceptMemories: LearnerMemory["conceptMemories"],
): Pick<LearnerMemory, "conceptMemories"> {
  return { conceptMemories };
}

test("starts a new learner at the first unlocked prerequisite", () => {
  const plan = createAdaptiveLearningPlan({
    curriculum,
    memory: wrapMemory({}),
    now: "2026-01-01T00:00:00.000Z",
  });

  assert.deepEqual(plan.focusConceptIds, ["foundation"]);
  assert.equal(plan.steps[0]?.status, "recommended");
  assert.equal(plan.steps[1]?.status, "blocked_by_prerequisite");
  assert.equal(plan.steps[2]?.status, "blocked_by_prerequisite");
});

test("unlocks the next concept when a prerequisite becomes stable", () => {
  const plan = createAdaptiveLearningPlan({
    curriculum,
    memory: wrapMemory({
      foundation: createMemory("foundation", {
        assessmentAttempts: [
          createAssessmentAttempt("foundation", "exit_ticket", 100),
        ],
        readiness: 82,
        status: "familiar",
      }),
    }),
  });

  assert.equal(plan.steps[0]?.status, "completed");
  assert.equal(plan.steps[1]?.status, "recommended");
  assert.equal(plan.steps[2]?.status, "blocked_by_prerequisite");
});

test("prioritizes an active misconception over a newly available concept", () => {
  const plan = createAdaptiveLearningPlan({
    curriculum,
    memory: wrapMemory({
      foundation: createMemory("foundation", {
        assessmentAttempts: [
          createAssessmentAttempt("foundation", "exit_ticket", 100),
        ],
        misconceptions: [
          {
            id: "misconception-1",
            conceptId: "foundation",
            text: "A misconception",
            sourceSection: "trap",
            count: 1,
            firstSeenAt: "2026-01-01T00:00:00.000Z",
            lastSeenAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        readiness: 82,
        status: "familiar",
      }),
    }),
  });

  assert.equal(plan.focusConceptIds[0], "foundation");
  assert.equal(plan.steps[0]?.status, "recommended");
  assert.equal(plan.steps[1]?.status, "blocked_by_prerequisite");
});

test("marks the plan complete only when every concept has strong exit evidence", () => {
  const conceptMemories = Object.fromEntries(
    concepts.map((concept) => [
      concept.id,
      createMemory(concept.id, {
        assessmentAttempts: [
          createAssessmentAttempt(concept.id, "exit_ticket", 100),
        ],
        readiness: 85,
        status: "familiar",
      }),
    ]),
  );
  const plan = createAdaptiveLearningPlan({
    curriculum,
    memory: wrapMemory(conceptMemories),
  });

  assert.equal(plan.status, "completed");
  assert.deepEqual(plan.focusConceptIds, []);
  assert.ok(plan.steps.every((step) => step.status === "completed"));
});

test("resolved misconception history does not permanently lock progression", () => {
  const plan = createAdaptiveLearningPlan({
    curriculum,
    memory: wrapMemory({
      foundation: createMemory("foundation", {
        assessmentAttempts: [
          createAssessmentAttempt("foundation", "exit_ticket", 100),
        ],
        misconceptions: [
          {
            id: "misconception-resolved",
            conceptId: "foundation",
            text: "A repaired misconception",
            sourceSection: "trap",
            count: 1,
            firstSeenAt: "2026-01-01T00:00:00.000Z",
            lastSeenAt: "2026-01-01T00:00:00.000Z",
            resolutionEvidenceId: "exit-foundation",
            resolutionSource: "exit_ticket",
            resolvedAt: "2026-01-02T00:00:00.000Z",
          },
        ],
        readiness: 82,
        status: "familiar",
      }),
    }),
  });

  assert.equal(plan.steps[0]?.status, "completed");
  assert.equal(plan.steps[1]?.status, "recommended");
});
