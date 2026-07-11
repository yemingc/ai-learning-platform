import "server-only";

import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const BUSY_TIMEOUT_MS = 15_000;

export function openApplicationDatabase() {
  const dataDir = join(process.cwd(), "data");
  const isProductionBuild =
    process.env.NEXT_PHASE === "phase-production-build";

  if (!isProductionBuild && !existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  // Route modules are evaluated by many workers during `next build`. They do
  // not need persistent application state, and sharing one file at that phase
  // creates schema-initialization races. Runtime servers still use the durable
  // data/auth.sqlite file.
  const database = new Database(
    isProductionBuild ? ":memory:" : join(dataDir, "auth.sqlite"),
    {
      timeout: BUSY_TIMEOUT_MS,
    },
  );

  // Set the timeout before journal configuration so concurrent Next.js build
  // workers wait for schema initialization instead of failing with SQLITE_BUSY.
  database.pragma(`busy_timeout = ${BUSY_TIMEOUT_MS}`);
  if (!isProductionBuild) {
    database.pragma("journal_mode = WAL");
  }
  database.pragma("foreign_keys = ON");

  return database;
}

function assertIdentifier(value: string) {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`Unsafe SQLite identifier: ${value}`);
  }
}

function hasColumn(
  database: Database.Database,
  tableName: string,
  columnName: string,
) {
  return (
    database
      .prepare(`PRAGMA table_info(${tableName})`)
      .all() as Array<{ name: string }>
  ).some((column) => column.name === columnName);
}

export function ensureDatabaseColumn(
  database: Database.Database,
  tableName: string,
  columnName: string,
  dataType: string,
) {
  assertIdentifier(tableName);
  assertIdentifier(columnName);

  if (!/^[A-Z]+(?:\s+[A-Z]+)*$/.test(dataType)) {
    throw new Error(`Unsafe SQLite column type: ${dataType}`);
  }

  if (hasColumn(database, tableName, columnName)) {
    return;
  }

  try {
    database.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType}`,
    );
  } catch (error) {
    // Another build worker may have completed the same idempotent migration
    // after this worker inspected the schema.
    if (hasColumn(database, tableName, columnName)) {
      return;
    }

    throw error;
  }
}
