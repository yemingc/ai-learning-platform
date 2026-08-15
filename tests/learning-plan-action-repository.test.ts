import assert from "node:assert/strict";
import test from "node:test";
import Database from "better-sqlite3";
import {
  createLearningPlanActionRepository,
  LearningPlanActionError,
} from "../src/features/planner/learning-plan-action-repository.ts";
import type { LearningPlan } from "../src/features/planner/types.ts";

function createPlan(learnerId: string, generatedAt: string): LearningPlan {
  return {
    id: "adaptive-test-course",
    learnerId,
    courseId: "test-course",
    unitId: "unit-1",
    title: "Test learning plan",
    status: "draft",
    focusConceptIds: ["concept-1"],
    generatedAt,
    steps: [
      {
        id: "step-1",
        planId: "adaptive-test-course",
        conceptId: "concept-1",
        sequence: 1,
        status: "recommended",
        rationale: "Needs review.",
        prerequisiteConceptIds: [],
        estimatedMinutes: 30,
      },
    ],
  };
}

function createPreview(generatedAt: string) {
  return {
    title: "Test learning plan",
    focusConceptIds: ["concept-1"],
    focusConceptTitles: ["Concept 1"],
    estimatedMinutes: 30,
    stepCount: 1,
    generatedAt,
  };
}

test("stores only a confirmation-token hash and activates a plan exactly once", () => {
  const database = new Database(":memory:");
  const repository = createLearningPlanActionRepository(database);
  const now = new Date("2026-08-14T10:00:00.000Z");
  const action = repository.createPendingAction({
    learnerId: "learner-1",
    courseId: "test-course",
    plan: createPlan("learner-1", now.toISOString()),
    preview: createPreview(now.toISOString()),
    now,
  });
  const stored = database
    .prepare(
      "SELECT token_hash FROM learning_plan_action_drafts WHERE id = ?",
    )
    .get(action.preview.draftId) as { token_hash: string };

  assert.notEqual(stored.token_hash, action.confirmationToken);
  assert.equal(stored.token_hash.length, 64);

  const confirmed = repository.resolvePendingAction({
    confirmationToken: action.confirmationToken,
    decision: "confirm",
    learnerId: "learner-1",
    now: new Date("2026-08-14T10:01:00.000Z"),
  });
  const repeated = repository.resolvePendingAction({
    confirmationToken: action.confirmationToken,
    decision: "confirm",
    learnerId: "learner-1",
    now: new Date("2026-08-14T10:02:00.000Z"),
  });

  assert.equal(confirmed.status, "confirmed");
  assert.equal(confirmed.version, 1);
  assert.equal(confirmed.plan?.status, "active");
  assert.equal(repeated.status, "already_confirmed");
  assert.equal(repeated.version, 1);

  const secondPlan = {
    ...createPlan("learner-1", "2026-08-14T10:03:00.000Z"),
    goal: "Prepare for next week's review",
    minutesPerSession: 20,
    title: "Replacement learning plan",
  };
  const secondAction = repository.createPendingAction({
    learnerId: "learner-1",
    courseId: "test-course",
    plan: secondPlan,
    preview: createPreview("2026-08-14T10:03:00.000Z"),
    now: new Date("2026-08-14T10:03:00.000Z"),
  });
  const secondConfirmation = repository.resolvePendingAction({
    confirmationToken: secondAction.confirmationToken,
    decision: "confirm",
    learnerId: "learner-1",
    now: new Date("2026-08-14T10:04:00.000Z"),
  });
  const repeatedAfterReplacement = repository.resolvePendingAction({
    confirmationToken: action.confirmationToken,
    decision: "confirm",
    learnerId: "learner-1",
    now: new Date("2026-08-14T10:05:00.000Z"),
  });

  assert.equal(secondConfirmation.version, 2);
  assert.equal(secondConfirmation.plan?.minutesPerSession, 20);
  assert.equal(repeatedAfterReplacement.version, 1);
  assert.equal(repeatedAfterReplacement.plan?.title, "Test learning plan");
  assert.deepEqual(
    database.prepare("SELECT COUNT(*) AS count FROM learning_plans").get(),
    { count: 1 },
  );
  database.close();
});

test("binds confirmation to the authenticated learner", () => {
  const database = new Database(":memory:");
  const repository = createLearningPlanActionRepository(database);
  const now = new Date("2026-08-14T10:00:00.000Z");
  const action = repository.createPendingAction({
    learnerId: "learner-1",
    courseId: "test-course",
    plan: createPlan("learner-1", now.toISOString()),
    preview: createPreview(now.toISOString()),
    now,
  });

  assert.throws(
    () =>
      repository.resolvePendingAction({
        confirmationToken: action.confirmationToken,
        decision: "confirm",
        learnerId: "learner-2",
        now,
      }),
    (error) =>
      error instanceof LearningPlanActionError && error.code === "not_found",
  );
  assert.equal(repository.getActivePlan("learner-1", "test-course"), undefined);
  database.close();
});

test("rejects or expires a pending write without activating a plan", () => {
  const database = new Database(":memory:");
  const repository = createLearningPlanActionRepository(database);
  const now = new Date("2026-08-14T10:00:00.000Z");
  const rejectedAction = repository.createPendingAction({
    learnerId: "learner-1",
    courseId: "test-course",
    plan: createPlan("learner-1", now.toISOString()),
    preview: createPreview(now.toISOString()),
    now,
  });

  assert.equal(
    repository.resolvePendingAction({
      confirmationToken: rejectedAction.confirmationToken,
      decision: "reject",
      learnerId: "learner-1",
      now,
    }).status,
    "rejected",
  );
  assert.throws(
    () =>
      repository.resolvePendingAction({
        confirmationToken: rejectedAction.confirmationToken,
        decision: "confirm",
        learnerId: "learner-1",
        now,
      }),
    (error) =>
      error instanceof LearningPlanActionError &&
      error.code === "already_rejected",
  );

  const expiredAction = repository.createPendingAction({
    learnerId: "learner-1",
    courseId: "test-course",
    plan: createPlan("learner-1", now.toISOString()),
    preview: createPreview(now.toISOString()),
    now,
    confirmationTtlMs: 1_000,
  });

  assert.throws(
    () =>
      repository.resolvePendingAction({
        confirmationToken: expiredAction.confirmationToken,
        decision: "confirm",
        learnerId: "learner-1",
        now: new Date("2026-08-14T10:00:02.000Z"),
      }),
    (error) =>
      error instanceof LearningPlanActionError && error.code === "expired",
  );
  assert.deepEqual(
    database
      .prepare(
        "SELECT status, resolved_at FROM learning_plan_action_drafts WHERE id = ?",
      )
      .get(expiredAction.preview.draftId),
    {
      status: "expired",
      resolved_at: "2026-08-14T10:00:02.000Z",
    },
  );
  assert.equal(repository.getActivePlan("learner-1", "test-course"), undefined);
  database.close();
});
