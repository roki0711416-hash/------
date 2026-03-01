/**
 * scripts/migrate-add-job-locks.mjs
 *
 * job_locks テーブルを作成する。
 * 実行: node scripts/migrate-add-job-locks.mjs
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local" });

import { createPool } from "@vercel/postgres";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL;

if (!connectionString) {
  console.error("Missing DB connection string");
  process.exit(1);
}

const db = createPool({ connectionString });

await db.sql`
  CREATE TABLE IF NOT EXISTS job_locks (
    name        TEXT PRIMARY KEY,
    locked_at   TIMESTAMPTZ,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

console.log("[migrate] job_locks table created (or already exists).");

// 初期レコードを挿入
for (const name of ["daily", "weekly"]) {
  await db.sql`
    INSERT INTO job_locks (name, locked_at)
    VALUES (${name}, NULL)
    ON CONFLICT (name) DO NOTHING
  `;
}
console.log("[migrate] Seeded job_locks rows: daily, weekly");

await db.end();
