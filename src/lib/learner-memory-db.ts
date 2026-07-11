import "server-only";

import { randomUUID } from "node:crypto";
import { DEFAULT_COURSE_ID } from "@/curricula";
import type { CourseId } from "@/features/knowledge/types";
import {
  calculateReadiness,
  getConceptMemoryStatus,
} from "@/features/memory/memory-scoring";
import type {
  ConceptMemory,
  LearnerMemory,
  RecordFormativeAssessmentInput,
  RecordTeacherInteractionInput,
  TeacherInteractionMemory,
} from "@/features/memory/types";
import type { FormativeAssessmentAttempt } from "@/features/assessment/types";
import { createLearnerMemorySnapshot } from "@/features/memory/learner-memory-snapshot";
import { resolveMisconceptionsFromAssessment } from "@/features/memory/misconception-lifecycle";
import { openApplicationDatabase } from "@/lib/application-db";

type LearnerMemoryRow = {
  id: string;
  learner_id: string;
  course_id: string;
  concept_id: string;
  payload_json: string;
  created_at: string;
  updated_at: string;
};

const db = openApplicationDatabase();

db.exec(`
CREATE TABLE IF NOT EXISTS learner_memories (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(learner_id, course_id, concept_id)
);

CREATE INDEX IF NOT EXISTS learner_memories_learner_course_idx
ON learner_memories (learner_id, course_id);
`);

function createId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

function createEmptyMemory(
  learnerId: string,
  courseId: CourseId = DEFAULT_COURSE_ID,
  now = new Date().toISOString(),
): LearnerMemory {
  return {
    learnerId,
    courseId,
    source: "authenticated",
    conceptMemories: {},
    createdAt: now,
    updatedAt: now,
  };
}

function createConceptMemory(
  input: Pick<RecordTeacherInteractionInput, "conceptId" | "conceptTitle">,
): ConceptMemory {
  return {
    conceptId: input.conceptId,
    conceptTitle: input.conceptTitle,
    status: "learning",
    readiness: 18,
    interactionCount: 0,
    misconceptions: [],
    confusionSignals: [],
    memorySignalHistory: [],
    recentInteractions: [],
    assessmentAttempts: [],
  };
}

function parseConceptMemory(row: LearnerMemoryRow) {
  try {
    const parsed = JSON.parse(row.payload_json) as ConceptMemory;
    const normalized: ConceptMemory = {
      ...parsed,
      assessmentAttempts: Array.isArray(parsed.assessmentAttempts)
        ? parsed.assessmentAttempts
        : [],
      confusionSignals: Array.isArray(parsed.confusionSignals)
        ? parsed.confusionSignals
        : [],
      memorySignalHistory: Array.isArray(parsed.memorySignalHistory)
        ? parsed.memorySignalHistory
        : [],
      misconceptions: Array.isArray(parsed.misconceptions)
        ? parsed.misconceptions
        : [],
      recentInteractions: Array.isArray(parsed.recentInteractions)
        ? parsed.recentInteractions
        : [],
    };
    const readiness = calculateReadiness(normalized);

    return {
      ...normalized,
      readiness,
      status: getConceptMemoryStatus(readiness),
    };
  } catch {
    return undefined;
  }
}

function persistConceptMemory({
  conceptMemory,
  courseId,
  existingRow,
  learnerId,
  now,
}: {
  conceptMemory: ConceptMemory;
  courseId: CourseId;
  existingRow?: LearnerMemoryRow;
  learnerId: string;
  now: string;
}) {
  db.prepare(
    `
      INSERT INTO learner_memories (
        id,
        learner_id,
        course_id,
        concept_id,
        payload_json,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(learner_id, course_id, concept_id) DO UPDATE SET
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `,
  ).run(
    existingRow?.id ?? randomUUID(),
    learnerId,
    courseId,
    conceptMemory.conceptId,
    JSON.stringify(conceptMemory),
    existingRow?.created_at ?? now,
    now,
  );
}

export function getLearnerMemory(
  learnerId: string,
  courseId: CourseId = DEFAULT_COURSE_ID,
): LearnerMemory {
  const rows = db
    .prepare(
      `
        SELECT *
        FROM learner_memories
        WHERE learner_id = ? AND course_id = ?
        ORDER BY updated_at DESC
      `,
    )
    .all(learnerId, courseId) as LearnerMemoryRow[];
  const now = new Date().toISOString();

  if (!rows.length) {
    return createEmptyMemory(learnerId, courseId, now);
  }

  const conceptMemories = rows.reduce<LearnerMemory["conceptMemories"]>(
    (memoryByConcept, row) => {
      const conceptMemory = parseConceptMemory(row);

      if (conceptMemory) {
        memoryByConcept[row.concept_id] = conceptMemory;
      }

      return memoryByConcept;
    },
    {},
  );
  const createdAt = rows.reduce(
    (earliest, row) => (row.created_at < earliest ? row.created_at : earliest),
    rows[0]?.created_at ?? now,
  );
  const updatedAt = rows.reduce(
    (latest, row) => (row.updated_at > latest ? row.updated_at : latest),
    rows[0]?.updated_at ?? now,
  );

  return {
    learnerId,
    courseId,
    source: "authenticated",
    conceptMemories,
    createdAt,
    updatedAt,
  };
}

export function getLearnerMemorySnapshot(
  learnerId: string,
  courseId: CourseId,
  conceptId: string,
) {
  const memory = getLearnerMemory(learnerId, courseId);

  return createLearnerMemorySnapshot(
    memory.conceptMemories[conceptId],
    conceptId,
  );
}

export function resetLearnerMemory(
  learnerId: string,
  courseId: CourseId = DEFAULT_COURSE_ID,
) {
  db.prepare(
    `
      DELETE FROM learner_memories
      WHERE learner_id = ? AND course_id = ?
    `,
  ).run(learnerId, courseId);

  return getLearnerMemory(learnerId, courseId);
}

export function recordTeacherInteractionInDb(
  input: RecordTeacherInteractionInput & {
    learnerId: string;
    courseId: CourseId;
  },
) {
  const now = new Date().toISOString();
  const existingRow = db
    .prepare(
      `
        SELECT *
        FROM learner_memories
        WHERE learner_id = ? AND course_id = ? AND concept_id = ?
      `,
    )
    .get(input.learnerId, input.courseId, input.conceptId) as
    | LearnerMemoryRow
    | undefined;
  const existingConceptMemory =
    (existingRow ? parseConceptMemory(existingRow) : undefined) ??
    createConceptMemory(input);
  const interaction: TeacherInteractionMemory = {
    id: createId("interaction"),
    conceptId: input.conceptId,
    conceptTitle: input.conceptTitle,
    source: input.source ?? "direct_chat",
    section: input.section,
    userMessage: input.userMessage,
    selectedText: input.selectedText,
    teachingMove: input.teachingMove,
    detectedMisconception: input.detectedMisconception,
    memorySignals: input.memorySignals,
    locale: input.locale,
    createdAt: now,
  };
  const matchingConfusionSignal = existingConceptMemory.confusionSignals.find(
    (signal) =>
      signal.section === input.section &&
      (signal.selectedText ?? "") === (input.selectedText ?? ""),
  );
  const confusionSignals = matchingConfusionSignal
    ? existingConceptMemory.confusionSignals.map((signal) =>
        signal.id === matchingConfusionSignal.id
          ? {
              ...signal,
              count: signal.count + 1,
              lastSeenAt: now,
            }
          : signal,
      )
    : [
        ...existingConceptMemory.confusionSignals,
        {
          id: createId("confusion"),
          conceptId: input.conceptId,
          section: input.section,
          selectedText: input.selectedText,
          count: 1,
          firstSeenAt: now,
          lastSeenAt: now,
        },
      ];
  const normalizedMisconception = input.detectedMisconception?.trim();
  const matchingMisconception = normalizedMisconception
    ? existingConceptMemory.misconceptions.find(
        (misconception) =>
          misconception.text.toLowerCase() ===
          normalizedMisconception.toLowerCase(),
      )
    : undefined;
  const misconceptions = normalizedMisconception
    ? matchingMisconception
      ? existingConceptMemory.misconceptions.map((misconception) =>
          misconception.id === matchingMisconception.id
          ? {
              ...misconception,
              count: misconception.count + 1,
              lastSeenAt: now,
              resolutionEvidenceId: undefined,
              resolutionSource: undefined,
              resolvedAt: undefined,
            }
            : misconception,
        )
      : [
          ...existingConceptMemory.misconceptions,
          {
            id: createId("misconception"),
            conceptId: input.conceptId,
            text: normalizedMisconception,
            sourceSection: input.section,
            count: 1,
            firstSeenAt: now,
            lastSeenAt: now,
          },
        ]
    : existingConceptMemory.misconceptions;
  const nextConceptMemoryBase: ConceptMemory = {
    ...existingConceptMemory,
    conceptTitle: input.conceptTitle,
    interactionCount: existingConceptMemory.interactionCount + 1,
    lastStudiedAt: now,
    confusionSignals,
    misconceptions,
    memorySignalHistory: [
      input.memorySignals,
      ...(existingConceptMemory.memorySignalHistory ?? []),
    ].slice(0, 12),
    recentInteractions: [
      interaction,
      ...existingConceptMemory.recentInteractions,
    ].slice(0, 8),
  };
  const readiness = calculateReadiness(nextConceptMemoryBase);
  const nextConceptMemory: ConceptMemory = {
    ...nextConceptMemoryBase,
    readiness,
    status: getConceptMemoryStatus(readiness),
  };

  persistConceptMemory({
    conceptMemory: nextConceptMemory,
    courseId: input.courseId,
    existingRow,
    learnerId: input.learnerId,
    now,
  });

  return nextConceptMemory;
}

export function recordFormativeAssessmentInDb(
  input: RecordFormativeAssessmentInput,
) {
  const now = new Date().toISOString();
  const existingRow = db
    .prepare(
      `
        SELECT *
        FROM learner_memories
        WHERE learner_id = ? AND course_id = ? AND concept_id = ?
      `,
    )
    .get(input.learnerId, input.courseId, input.conceptId) as
    | LearnerMemoryRow
    | undefined;
  const existingConceptMemory =
    (existingRow ? parseConceptMemory(existingRow) : undefined) ??
    createConceptMemory(input);
  const attempt: FormativeAssessmentAttempt = {
    id: createId("assessment"),
    assessmentId: input.assessmentId,
    assessmentVersion: input.assessmentVersion,
    conceptId: input.conceptId,
    phase: input.phase,
    score: input.score,
    correctCount: input.correctCount,
    questionCount: input.questionCount,
    itemResults: input.feedback.map((item) => ({
      questionId: item.questionId,
      selectedOptionId: item.selectedOptionId,
      isCorrect: item.isCorrect,
    })),
    submittedAt: now,
  };
  const nextConceptMemoryBase: ConceptMemory = {
    ...existingConceptMemory,
    conceptTitle: input.conceptTitle,
    lastStudiedAt: now,
    assessmentAttempts: [
      attempt,
      ...(existingConceptMemory.assessmentAttempts ?? []),
    ].slice(0, 12),
    misconceptions: resolveMisconceptionsFromAssessment({
      assessmentId: attempt.id,
      misconceptions: existingConceptMemory.misconceptions,
      phase: input.phase,
      resolvedAt: now,
      score: input.score,
    }),
  };
  const readiness = calculateReadiness(nextConceptMemoryBase);
  const nextConceptMemory: ConceptMemory = {
    ...nextConceptMemoryBase,
    readiness,
    status: getConceptMemoryStatus(readiness),
  };

  persistConceptMemory({
    conceptMemory: nextConceptMemory,
    courseId: input.courseId,
    existingRow,
    learnerId: input.learnerId,
    now,
  });

  return {
    attempt,
    conceptMemory: nextConceptMemory,
  };
}
