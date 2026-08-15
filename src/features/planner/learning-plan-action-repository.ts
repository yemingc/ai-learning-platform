import { createHash, randomBytes, randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { z } from "zod";
import type {
  LearningPlanActionDecision,
  LearningPlanActionResult,
  LearningPlanPreview,
  PendingLearningPlanAction,
} from "@/features/ai-teacher/tools/types";
import type { LearningPlan } from "@/features/planner/types";

const DEFAULT_CONFIRMATION_TTL_MS = 15 * 60 * 1000;

const learningPlanStepSchema = z
  .object({
    id: z.string().min(1),
    planId: z.string().min(1),
    conceptId: z.string().min(1),
    sequence: z.number().int().positive(),
    status: z.enum([
      "recommended",
      "available",
      "blocked_by_prerequisite",
      "in_progress",
      "completed",
    ]),
    rationale: z.string().min(1),
    prerequisiteConceptIds: z.array(z.string().min(1)),
    estimatedMinutes: z.number().int().nonnegative(),
  })
  .strict();

const learningPlanSchema = z
  .object({
    id: z.string().min(1),
    learnerId: z.string().min(1),
    courseId: z.string().min(1),
    unitId: z.string().min(1).optional(),
    title: z.string().min(1),
    goal: z.string().min(2).max(240).optional(),
    minutesPerSession: z.number().int().min(10).max(240).optional(),
    status: z.enum(["draft", "active", "completed"]),
    focusConceptIds: z.array(z.string().min(1)),
    steps: z.array(learningPlanStepSchema),
    generatedAt: z.string().datetime(),
  })
  .strict();

type LearningPlanActionRow = {
  id: string;
  learner_id: string;
  course_id: string;
  token_hash: string;
  status: "pending" | "confirmed" | "rejected" | "expired";
  plan_json: string;
  preview_json: string;
  created_at: string;
  expires_at: string;
  resolved_at: string | null;
  activated_version: number | null;
};

type ActiveLearningPlanRow = {
  payload_json: string;
  version: number;
};

export type LearningPlanActionErrorCode =
  | "not_found"
  | "expired"
  | "already_rejected"
  | "invalid_payload";

export class LearningPlanActionError extends Error {
  code: LearningPlanActionErrorCode;

  constructor(code: LearningPlanActionErrorCode, message: string) {
    super(message);
    this.name = "LearningPlanActionError";
    this.code = code;
  }
}

function hashConfirmationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function parsePlan(value: string) {
  try {
    return learningPlanSchema.parse(JSON.parse(value));
  } catch {
    throw new LearningPlanActionError(
      "invalid_payload",
      "Stored learning-plan data is invalid.",
    );
  }
}

function parsePreview(value: string) {
  try {
    return JSON.parse(value) as LearningPlanPreview;
  } catch {
    throw new LearningPlanActionError(
      "invalid_payload",
      "Stored learning-plan preview is invalid.",
    );
  }
}

export function createLearningPlanActionRepository(
  database: Database.Database,
) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS learning_plan_action_drafts (
      id TEXT PRIMARY KEY,
      learner_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      preview_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      resolved_at TEXT,
      activated_version INTEGER
    );

    CREATE INDEX IF NOT EXISTS learning_plan_action_drafts_learner_idx
    ON learning_plan_action_drafts (learner_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS learning_plans (
      id TEXT PRIMARY KEY,
      learner_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      version INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(learner_id, course_id)
    );

    CREATE INDEX IF NOT EXISTS learning_plans_learner_course_idx
    ON learning_plans (learner_id, course_id);
  `);

  const draftColumns = database
    .prepare("PRAGMA table_info(learning_plan_action_drafts)")
    .all() as Array<{ name: string }>;

  if (!draftColumns.some((column) => column.name === "activated_version")) {
    database.exec(
      "ALTER TABLE learning_plan_action_drafts ADD COLUMN activated_version INTEGER",
    );
  }

  function createPendingAction({
    learnerId,
    courseId,
    plan,
    preview,
    now = new Date(),
    confirmationTtlMs = DEFAULT_CONFIRMATION_TTL_MS,
  }: {
    learnerId: string;
    courseId: string;
    plan: LearningPlan;
    preview: Omit<LearningPlanPreview, "draftId">;
    now?: Date;
    confirmationTtlMs?: number;
  }): PendingLearningPlanAction {
    const validatedPlan = learningPlanSchema.parse(plan);

    if (
      validatedPlan.learnerId !== learnerId ||
      validatedPlan.courseId !== courseId
    ) {
      throw new LearningPlanActionError(
        "invalid_payload",
        "Learning-plan identity must match the server-injected learner and course scope.",
      );
    }

    const draftId = randomUUID();
    const confirmationToken = randomBytes(32).toString("base64url");
    const createdAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + confirmationTtlMs).toISOString();
    const resolvedPreview: LearningPlanPreview = {
      ...preview,
      draftId,
    };

    database
      .prepare(
        `
          INSERT INTO learning_plan_action_drafts (
            id,
            learner_id,
            course_id,
            token_hash,
            status,
            plan_json,
            preview_json,
            created_at,
            expires_at
          )
          VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)
        `,
      )
      .run(
        draftId,
        learnerId,
        courseId,
        hashConfirmationToken(confirmationToken),
        JSON.stringify(validatedPlan),
        JSON.stringify(resolvedPreview),
        createdAt,
        expiresAt,
      );

    return {
      type: "activate_learning_plan",
      status: "pending",
      confirmationToken,
      expiresAt,
      preview: resolvedPreview,
    };
  }

  const resolveActionTransaction = database.transaction(
    ({
      confirmationToken,
      decision,
      learnerId,
      now = new Date(),
    }: {
      confirmationToken: string;
      decision: LearningPlanActionDecision;
      learnerId: string;
      now?: Date;
    }): LearningPlanActionResult | "expired" => {
      const row = database
        .prepare(
          `
            SELECT *
            FROM learning_plan_action_drafts
            WHERE token_hash = ? AND learner_id = ?
          `,
        )
        .get(
          hashConfirmationToken(confirmationToken),
          learnerId,
        ) as LearningPlanActionRow | undefined;

      if (!row) {
        throw new LearningPlanActionError(
          "not_found",
          "Learning-plan confirmation was not found for this learner.",
        );
      }

      const resolvedAt = now.toISOString();

      if (row.status === "rejected") {
        if (decision === "reject") {
          return { decision, status: "rejected" };
        }

        throw new LearningPlanActionError(
          "already_rejected",
          "This learning-plan action was already rejected.",
        );
      }

      if (row.status === "expired") {
        return "expired";
      }

      const plan = parsePlan(row.plan_json);

      if (row.status === "confirmed") {
        const activeRow = database
          .prepare(
            `
              SELECT payload_json, version
              FROM learning_plans
              WHERE learner_id = ? AND course_id = ?
            `,
          )
          .get(row.learner_id, row.course_id) as
          | ActiveLearningPlanRow
          | undefined;

        return {
          decision: "confirm",
          status: "already_confirmed",
          plan,
          version: row.activated_version ?? activeRow?.version,
        };
      }

      if (Date.parse(row.expires_at) <= now.getTime()) {
        database
          .prepare(
            `
              UPDATE learning_plan_action_drafts
              SET status = 'expired', resolved_at = ?
              WHERE id = ? AND status = 'pending'
            `,
          )
          .run(resolvedAt, row.id);

        return "expired";
      }

      if (decision === "reject") {
        database
          .prepare(
            `
              UPDATE learning_plan_action_drafts
              SET status = 'rejected', resolved_at = ?
              WHERE id = ? AND status = 'pending'
            `,
          )
          .run(resolvedAt, row.id);

        return { decision, status: "rejected" };
      }

      const activePlan: LearningPlan = {
        ...plan,
        status: plan.status === "completed" ? "completed" : "active",
      };
      const existing = database
        .prepare(
          `
            SELECT id, version, created_at
            FROM learning_plans
            WHERE learner_id = ? AND course_id = ?
          `,
        )
        .get(row.learner_id, row.course_id) as
        | { id: string; version: number; created_at: string }
        | undefined;
      const version = (existing?.version ?? 0) + 1;

      database
        .prepare(
          `
            INSERT INTO learning_plans (
              id,
              learner_id,
              course_id,
              payload_json,
              version,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(learner_id, course_id) DO UPDATE SET
              payload_json = excluded.payload_json,
              version = excluded.version,
              updated_at = excluded.updated_at
          `,
        )
        .run(
          existing?.id ?? randomUUID(),
          row.learner_id,
          row.course_id,
          JSON.stringify(activePlan),
          version,
          existing?.created_at ?? resolvedAt,
          resolvedAt,
        );
      database
        .prepare(
          `
            UPDATE learning_plan_action_drafts
            SET status = 'confirmed', resolved_at = ?, plan_json = ?, activated_version = ?
            WHERE id = ? AND status = 'pending'
          `,
        )
        .run(resolvedAt, JSON.stringify(activePlan), version, row.id);

      return {
        decision: "confirm",
        status: "confirmed",
        plan: activePlan,
        version,
      };
    },
  );

  function resolvePendingAction(input: {
    confirmationToken: string;
    decision: LearningPlanActionDecision;
    learnerId: string;
    now?: Date;
  }) {
    const result = resolveActionTransaction.immediate(input);

    if (result === "expired") {
      throw new LearningPlanActionError(
        "expired",
        "This learning-plan confirmation has expired.",
      );
    }

    return result;
  }

  function getActivePlan(learnerId: string, courseId: string) {
    const row = database
      .prepare(
        `
          SELECT payload_json, version
          FROM learning_plans
          WHERE learner_id = ? AND course_id = ?
        `,
      )
      .get(learnerId, courseId) as ActiveLearningPlanRow | undefined;

    return row
      ? { plan: parsePlan(row.payload_json), version: row.version }
      : undefined;
  }

  function getPendingPreview(learnerId: string, draftId: string) {
    const row = database
      .prepare(
        `
          SELECT *
          FROM learning_plan_action_drafts
          WHERE id = ? AND learner_id = ? AND status = 'pending'
        `,
      )
      .get(draftId, learnerId) as LearningPlanActionRow | undefined;

    return row ? parsePreview(row.preview_json) : undefined;
  }

  return {
    createPendingAction,
    getActivePlan,
    getPendingPreview,
    resolvePendingAction,
  };
}
