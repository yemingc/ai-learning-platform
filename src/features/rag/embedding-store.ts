import "server-only";

import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import type {
  CurriculumEmbeddingIndexStats,
  CurriculumEmbeddingRecord,
} from "@/features/rag/embedding-types";
import type { CurriculumRetrievalQuery } from "@/features/rag/retrieval-types";

type CurriculumEmbeddingRow = {
  chunk_id: string;
  course_id: string;
  unit_id: string;
  concept_id: string;
  locale: "en" | "zh";
  section_type: string;
  text_hash: string;
  model: string;
  dimensions: number;
  embedding_json: string;
  updated_at: string;
};

const dataDir = join(process.cwd(), "data");
const dbPath = join(dataDir, "rag-embeddings.sqlite");

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS curriculum_embeddings (
  chunk_id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  concept_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  section_type TEXT NOT NULL,
  text_hash TEXT NOT NULL,
  model TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  embedding_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS curriculum_embeddings_scope_idx
ON curriculum_embeddings (course_id, unit_id, concept_id, locale, section_type);
`);

function parseEmbeddingRow(
  row: CurriculumEmbeddingRow,
): CurriculumEmbeddingRecord | undefined {
  try {
    const embedding = JSON.parse(row.embedding_json) as unknown;

    if (
      !Array.isArray(embedding) ||
      !embedding.every((value) => typeof value === "number")
    ) {
      return undefined;
    }

    return {
      chunkId: row.chunk_id,
      conceptId: row.concept_id,
      courseId: row.course_id,
      dimensions: row.dimensions,
      embedding,
      locale: row.locale,
      model: row.model,
      sectionType: row.section_type as CurriculumEmbeddingRecord["sectionType"],
      textHash: row.text_hash,
      unitId: row.unit_id,
      updatedAt: row.updated_at,
    };
  } catch {
    return undefined;
  }
}

export function upsertCurriculumEmbeddingRecords(
  records: CurriculumEmbeddingRecord[],
) {
  const statement = db.prepare(`
    INSERT INTO curriculum_embeddings (
      chunk_id,
      course_id,
      unit_id,
      concept_id,
      locale,
      section_type,
      text_hash,
      model,
      dimensions,
      embedding_json,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(chunk_id) DO UPDATE SET
      course_id = excluded.course_id,
      unit_id = excluded.unit_id,
      concept_id = excluded.concept_id,
      locale = excluded.locale,
      section_type = excluded.section_type,
      text_hash = excluded.text_hash,
      model = excluded.model,
      dimensions = excluded.dimensions,
      embedding_json = excluded.embedding_json,
      updated_at = excluded.updated_at
  `);
  const transaction = db.transaction((nextRecords: CurriculumEmbeddingRecord[]) => {
    for (const record of nextRecords) {
      statement.run(
        record.chunkId,
        record.courseId,
        record.unitId,
        record.conceptId,
        record.locale,
        record.sectionType,
        record.textHash,
        record.model,
        record.dimensions,
        JSON.stringify(record.embedding),
        record.updatedAt,
      );
    }
  });

  transaction(records);
}

export function getCurriculumEmbeddingRecords(
  query: Pick<
    CurriculumRetrievalQuery,
    "conceptId" | "courseId" | "locale" | "sectionType" | "unitId"
  > = {},
) {
  const clauses: string[] = [];
  const params: string[] = [];

  if (query.courseId) {
    clauses.push("course_id = ?");
    params.push(query.courseId);
  }

  if (query.unitId) {
    clauses.push("unit_id = ?");
    params.push(query.unitId);
  }

  if (query.conceptId) {
    clauses.push("concept_id = ?");
    params.push(query.conceptId);
  }

  if (query.locale === "en" || query.locale === "zh") {
    clauses.push("locale = ?");
    params.push(query.locale);
  }

  if (query.sectionType) {
    clauses.push("section_type = ?");
    params.push(query.sectionType);
  }

  const sql = [
    "SELECT * FROM curriculum_embeddings",
    clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    "ORDER BY updated_at DESC",
  ]
    .filter(Boolean)
    .join(" ");

  return (db.prepare(sql).all(...params) as CurriculumEmbeddingRow[])
    .map(parseEmbeddingRow)
    .filter((record): record is CurriculumEmbeddingRecord => Boolean(record));
}

export function getCurriculumEmbeddingIndexStats(): CurriculumEmbeddingIndexStats {
  const rows = db
    .prepare(
      `
        SELECT model, dimensions, updated_at
        FROM curriculum_embeddings
        ORDER BY updated_at DESC
      `,
    )
    .all() as Array<{
    dimensions: number;
    model: string;
    updated_at: string;
  }>;

  return {
    dimensions: Array.from(new Set(rows.map((row) => row.dimensions))),
    lastUpdatedAt: rows[0]?.updated_at,
    models: Array.from(new Set(rows.map((row) => row.model))),
    recordCount: rows.length,
  };
}

