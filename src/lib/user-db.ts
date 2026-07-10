import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  created_at: string;
  email_verified_at: string | null;
};

type CreateUserInput = {
  email: string;
  name?: string;
  passwordHash: string;
};

const dataDir = join(process.cwd(), "data");
const dbPath = join(dataDir, "auth.sqlite");

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  email_verified_at TEXT
);
`);

function ensureColumn(columnName: string, sqlType: string) {
  const columns = db
    .prepare("PRAGMA table_info(users)")
    .all() as Array<{ name: string }>;
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.exec(`ALTER TABLE users ADD COLUMN ${columnName} ${sqlType}`);
  }
}

ensureColumn("email_verified_at", "TEXT");

function mapUser(row: UserRow | undefined) {
  if (!row) {
    return undefined;
  }

  return {
    createdAt: row.created_at,
    email: row.email,
    emailVerifiedAt: row.email_verified_at,
    id: row.id,
    name: row.name,
    passwordHash: row.password_hash,
  };
}

export type AuthUser = NonNullable<ReturnType<typeof mapUser>>;

export function getUserByEmail(email: string) {
  const row = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.trim().toLowerCase()) as UserRow | undefined;

  return mapUser(row);
}

export function getUserById(id: string) {
  const row = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(id) as UserRow | undefined;

  return mapUser(row);
}

export function createUser(input: CreateUserInput) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const id = randomUUID();

  db.prepare(
    `
      INSERT INTO users (id, email, name, password_hash, created_at, email_verified_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run(
    id,
    normalizedEmail,
    input.name?.trim() || null,
    input.passwordHash,
    now,
    null,
  );

  return getUserById(id);
}
