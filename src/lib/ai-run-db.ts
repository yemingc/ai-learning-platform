import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import {
  evaluateAiUsagePolicy,
  type AiUsagePolicy,
} from "@/features/ai-teacher/ai-usage-policy";
import type { TeacherWorkflowEngine } from "@/features/ai-teacher/workflow/run-teacher-workflow";
import type { TeacherWorkflowResult } from "@/features/ai-teacher/workflow/types";
import type { LiveTeacherEvaluationSummary } from "@/features/ai-teacher/evaluation/eval-types";

type AiTeacherRunRow = {
  id: string;
  learner_id: string;
  course_id: string;
  concept_id: string;
  locale: "en" | "zh";
  source: string;
  status: "started" | "succeeded" | "failed";
  workflow_engine: string;
  prompt_version: string | null;
  provider: string | null;
  model: string | null;
  finish_reason: string | null;
  requested_retrieval_mode: string | null;
  actual_retrieval_mode: string | null;
  retrieval_fallback_reason: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  model_duration_ms: number | null;
  first_token_duration_ms: number | null;
  request_duration_ms: number | null;
  input_chars: number;
  history_messages: number;
  citation_count: number | null;
  error_code: string | null;
  trace_json: string | null;
  created_at: string;
  completed_at: string | null;
};

type ReserveAiTeacherRunInput = {
  learnerId: string;
  courseId: string;
  conceptId: string;
  locale: "en" | "zh";
  source: string;
  inputChars: number;
  historyMessages: number;
  workflowEngine: TeacherWorkflowEngine;
};

export type AiTeacherRunReservation =
  | {
      allowed: true;
      runId: string;
      remainingBurst: number;
      remainingDaily: number;
    }
  | {
      allowed: false;
      reason: "burst" | "daily";
      retryAfterSeconds: number;
      remainingBurst: number;
      remainingDaily: number;
    };

const dataDir = join(process.cwd(), "data");
const dbPath = join(dataDir, "auth.sqlite");

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

db.exec(`
CREATE TABLE IF NOT EXISTS ai_teacher_runs (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  workflow_engine TEXT NOT NULL,
  prompt_version TEXT,
  provider TEXT,
  model TEXT,
  finish_reason TEXT,
  requested_retrieval_mode TEXT,
  actual_retrieval_mode TEXT,
  retrieval_fallback_reason TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  model_duration_ms INTEGER,
  first_token_duration_ms INTEGER,
  request_duration_ms INTEGER,
  input_chars INTEGER NOT NULL,
  history_messages INTEGER NOT NULL,
  citation_count INTEGER,
  error_code TEXT,
  trace_json TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS ai_teacher_runs_learner_created_idx
ON ai_teacher_runs (learner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_teacher_runs_created_idx
ON ai_teacher_runs (created_at DESC);

CREATE TABLE IF NOT EXISTS ai_evaluation_runs (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  workflow_engine TEXT,
  prompt_version TEXT,
  models TEXT,
  total_cases INTEGER NOT NULL,
  passed_cases INTEGER NOT NULL,
  average_score INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  result_json TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ai_evaluation_runs_created_idx
ON ai_evaluation_runs (created_at DESC);
`);

const aiTeacherRunColumns = new Set(
  (
    db.prepare("PRAGMA table_info(ai_teacher_runs)").all() as Array<{
      name: string;
    }>
  ).map((column) => column.name),
);

if (!aiTeacherRunColumns.has("first_token_duration_ms")) {
  db.exec(
    "ALTER TABLE ai_teacher_runs ADD COLUMN first_token_duration_ms INTEGER",
  );
}

function getPositiveIntegerEnvironmentValue(
  name: string,
  fallback: number,
) {
  const value = Number(process.env[name]);

  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function pruneExpiredAiTelemetry(now = Date.now()) {
  const retentionDays = getPositiveIntegerEnvironmentValue(
    "AI_RUN_RETENTION_DAYS",
    90,
  );
  const retentionBoundary = new Date(
    now - retentionDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  db.prepare("DELETE FROM ai_teacher_runs WHERE created_at < ?").run(
    retentionBoundary,
  );
  db.prepare("DELETE FROM ai_evaluation_runs WHERE created_at < ?").run(
    retentionBoundary,
  );
}

export function getAiTeacherUsagePolicy(): AiUsagePolicy {
  return {
    burstLimit: getPositiveIntegerEnvironmentValue(
      "AI_TEACHER_BURST_LIMIT",
      12,
    ),
    burstWindowMs:
      getPositiveIntegerEnvironmentValue(
        "AI_TEACHER_BURST_WINDOW_SECONDS",
        600,
      ) * 1000,
    dailyLimit: getPositiveIntegerEnvironmentValue(
      "AI_TEACHER_DAILY_LIMIT",
      100,
    ),
    dailyWindowMs: 24 * 60 * 60 * 1000,
  };
}

const reserveAiTeacherRunTransaction = db.transaction(
  (
    input: ReserveAiTeacherRunInput,
    now: number,
  ): AiTeacherRunReservation => {
    const config = getAiTeacherUsagePolicy();
    const dailyBoundary = new Date(now - config.dailyWindowMs).toISOString();
    const rows = db
      .prepare(
        `
          SELECT created_at
          FROM ai_teacher_runs
          WHERE learner_id = ? AND created_at > ?
          ORDER BY created_at ASC
        `,
      )
      .all(input.learnerId, dailyBoundary) as Array<{ created_at: string }>;
    const decision = evaluateAiUsagePolicy({
      config,
      eventTimestamps: rows.map((row) => Date.parse(row.created_at)),
      now,
    });

    if (!decision.allowed) {
      return {
        allowed: false,
        reason: decision.reason ?? "burst",
        remainingBurst: decision.remainingBurst,
        remainingDaily: decision.remainingDaily,
        retryAfterSeconds: decision.retryAfterSeconds ?? 1,
      };
    }

    pruneExpiredAiTelemetry(now);

    const runId = randomUUID();
    const createdAt = new Date(now).toISOString();

    db.prepare(
      `
        INSERT INTO ai_teacher_runs (
          id,
          learner_id,
          course_id,
          concept_id,
          locale,
          source,
          status,
          workflow_engine,
          input_chars,
          history_messages,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'started', ?, ?, ?, ?)
      `,
    ).run(
      runId,
      input.learnerId,
      input.courseId,
      input.conceptId,
      input.locale,
      input.source,
      input.workflowEngine,
      input.inputChars,
      input.historyMessages,
      createdAt,
    );

    return {
      allowed: true,
      remainingBurst: decision.remainingBurst,
      remainingDaily: decision.remainingDaily,
      runId,
    };
  },
);

export function reserveAiTeacherRun(
  input: ReserveAiTeacherRunInput,
  now = Date.now(),
) {
  return reserveAiTeacherRunTransaction.immediate(input, now);
}

export function completeAiTeacherRun({
  requestDurationMs,
  result,
  runId,
}: {
  requestDurationMs: number;
  result: TeacherWorkflowResult;
  runId: string;
}) {
  const retrieval = result.state.curriculumContext;

  db.prepare(
    `
      UPDATE ai_teacher_runs
      SET
        status = 'succeeded',
        prompt_version = ?,
        provider = ?,
        model = ?,
        finish_reason = ?,
        requested_retrieval_mode = ?,
        actual_retrieval_mode = ?,
        retrieval_fallback_reason = ?,
        prompt_tokens = ?,
        completion_tokens = ?,
        total_tokens = ?,
        model_duration_ms = ?,
        first_token_duration_ms = ?,
        request_duration_ms = ?,
        citation_count = ?,
        trace_json = ?,
        completed_at = ?
      WHERE id = ? AND status = 'started'
    `,
  ).run(
    result.modelTelemetry.promptVersion,
    result.modelTelemetry.provider,
    result.modelTelemetry.model,
    result.modelTelemetry.finishReason ?? null,
    retrieval?.requestedMode ?? null,
    retrieval?.actualMode ?? null,
    retrieval?.retrievalFallbackReason ?? null,
    result.modelTelemetry.promptTokens ?? null,
    result.modelTelemetry.completionTokens ?? null,
    result.modelTelemetry.totalTokens ?? null,
    result.modelTelemetry.durationMs,
    result.modelTelemetry.firstTokenDurationMs ?? null,
    requestDurationMs,
    result.citations.length,
    JSON.stringify(result.trace),
    new Date().toISOString(),
    runId,
  );
}

export function failAiTeacherRun({
  errorCode,
  requestDurationMs,
  runId,
}: {
  errorCode: string;
  requestDurationMs: number;
  runId: string;
}) {
  db.prepare(
    `
      UPDATE ai_teacher_runs
      SET
        status = 'failed',
        error_code = ?,
        request_duration_ms = ?,
        completed_at = ?
      WHERE id = ? AND status = 'started'
    `,
  ).run(errorCode, requestDurationMs, new Date().toISOString(), runId);
}

export function recordLiveTeacherEvaluation(
  summary: LiveTeacherEvaluationSummary,
) {
  pruneExpiredAiTelemetry();

  const telemetry = summary.results
    .map((result) => result.modelTelemetry)
    .filter((item) => item !== undefined);
  const models = Array.from(new Set(telemetry.map((item) => item.model)));
  const promptVersions = Array.from(
    new Set(telemetry.map((item) => item.promptVersion)),
  );
  const workflowEngines = Array.from(
    new Set(
      summary.results
        .map((result) => result.workflowEngine)
        .filter((item): item is string => Boolean(item)),
    ),
  );
  const durationMs = Math.max(
    0,
    Date.parse(summary.completedAt) - Date.parse(summary.startedAt),
  );
  const privacyMinimizedSummary = JSON.stringify(
    summary,
    (key, value) => (key === "assistantMessage" ? undefined : value),
  );

  db.prepare(
    `
      INSERT INTO ai_evaluation_runs (
        id,
        mode,
        workflow_engine,
        prompt_version,
        models,
        total_cases,
        passed_cases,
        average_score,
        total_tokens,
        duration_ms,
        result_json,
        started_at,
        completed_at,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    randomUUID(),
    summary.mode,
    workflowEngines.join(", ") || null,
    promptVersions.join(", ") || null,
    models.join(", ") || null,
    summary.totalCases,
    summary.passedCases,
    summary.averageScore,
    telemetry.reduce((sum, item) => sum + (item.totalTokens ?? 0), 0),
    durationMs,
    privacyMinimizedSummary,
    summary.startedAt,
    summary.completedAt,
    new Date().toISOString(),
  );
}

function getLearnerLabel(learnerId: string) {
  return createHash("sha256").update(learnerId).digest("hex").slice(0, 10);
}

export function getAiTeacherRunDashboard(limit = 50) {
  const normalizedLimit = Number.isFinite(limit) ? Math.floor(limit) : 50;
  const safeLimit = Math.max(1, Math.min(100, normalizedLimit));
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const summary = db
    .prepare(
      `
        SELECT
          COUNT(*) AS total_runs,
          SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) AS succeeded_runs,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_runs,
          SUM(CASE WHEN status = 'started' THEN 1 ELSE 0 END) AS active_runs,
          COALESCE(SUM(total_tokens), 0) AS total_tokens,
          ROUND(AVG(CASE WHEN status = 'succeeded' THEN first_token_duration_ms END)) AS average_first_token_duration_ms,
          ROUND(AVG(CASE WHEN status = 'succeeded' THEN request_duration_ms END)) AS average_duration_ms
        FROM ai_teacher_runs
        WHERE created_at >= ?
      `,
    )
    .get(since) as {
    total_runs: number;
    succeeded_runs: number;
    failed_runs: number;
    active_runs: number;
    total_tokens: number;
    average_first_token_duration_ms: number | null;
    average_duration_ms: number | null;
  };
  const rows = db
    .prepare(
      `
        SELECT *
        FROM ai_teacher_runs
        ORDER BY created_at DESC
        LIMIT ?
      `,
    )
    .all(safeLimit) as AiTeacherRunRow[];
  const evaluationRows = db
    .prepare(
      `
        SELECT
          id,
          mode,
          workflow_engine,
          prompt_version,
          models,
          total_cases,
          passed_cases,
          average_score,
          total_tokens,
          duration_ms,
          started_at,
          completed_at,
          created_at
        FROM ai_evaluation_runs
        ORDER BY created_at DESC
        LIMIT 12
      `,
    )
    .all() as Array<{
    id: string;
    mode: string;
    workflow_engine: string | null;
    prompt_version: string | null;
    models: string | null;
    total_cases: number;
    passed_cases: number;
    average_score: number;
    total_tokens: number;
    duration_ms: number;
    started_at: string;
    completed_at: string;
    created_at: string;
  }>;

  return {
    evaluations: evaluationRows.map((row) => ({
      id: row.id,
      mode: row.mode,
      workflowEngine: row.workflow_engine,
      promptVersion: row.prompt_version,
      models: row.models,
      totalCases: row.total_cases,
      passedCases: row.passed_cases,
      averageScore: row.average_score,
      totalTokens: row.total_tokens,
      durationMs: row.duration_ms,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
    })),
    policy: getAiTeacherUsagePolicy(),
    runs: rows.map((row) => ({
      id: row.id,
      learnerLabel: getLearnerLabel(row.learner_id),
      courseId: row.course_id,
      conceptId: row.concept_id,
      locale: row.locale,
      source: row.source,
      status: row.status,
      workflowEngine: row.workflow_engine,
      promptVersion: row.prompt_version,
      provider: row.provider,
      model: row.model,
      finishReason: row.finish_reason,
      requestedRetrievalMode: row.requested_retrieval_mode,
      actualRetrievalMode: row.actual_retrieval_mode,
      retrievalFallbackReason: row.retrieval_fallback_reason,
      promptTokens: row.prompt_tokens,
      completionTokens: row.completion_tokens,
      totalTokens: row.total_tokens,
      modelDurationMs: row.model_duration_ms,
      firstTokenDurationMs: row.first_token_duration_ms,
      requestDurationMs: row.request_duration_ms,
      inputChars: row.input_chars,
      historyMessages: row.history_messages,
      citationCount: row.citation_count,
      errorCode: row.error_code,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    })),
    summary: {
      activeRuns: summary.active_runs ?? 0,
      averageDurationMs: summary.average_duration_ms ?? 0,
      averageFirstTokenDurationMs:
        summary.average_first_token_duration_ms ?? 0,
      failedRuns: summary.failed_runs ?? 0,
      succeededRuns: summary.succeeded_runs ?? 0,
      successRate:
        summary.total_runs > 0
          ? (summary.succeeded_runs ?? 0) / summary.total_runs
          : 0,
      totalRuns: summary.total_runs ?? 0,
      totalTokens: summary.total_tokens ?? 0,
      window: "24h" as const,
    },
  };
}
