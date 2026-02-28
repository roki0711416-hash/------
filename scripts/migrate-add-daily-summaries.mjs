/**
 * scripts/migrate-add-daily-summaries.mjs
 *
 * store_daily_summaries + store_daily_machines テーブル追加（冪等）
 *
 * 実行: node scripts/migrate-add-daily-summaries.mjs
 */
import { createPool } from "@vercel/postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local", override: true });

function getConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    null
  );
}

async function main() {
  const connectionString = getConnectionString();
  if (!connectionString) throw new Error("Missing DB connection string.");
  const db = createPool({ connectionString });

  console.log("[migrate] Creating store_daily_summaries ...");
  await db.sql`
    CREATE TABLE IF NOT EXISTS store_daily_summaries (
      id              TEXT PRIMARY KEY,
      store_id        TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      date            DATE NOT NULL,
      total_diff      INT NOT NULL DEFAULT 0,
      avg_diff        INT NOT NULL DEFAULT 0,
      total_games     INT,
      top_machines    JSONB,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (store_id, date)
    );
  `;
  await db.sql`
    CREATE INDEX IF NOT EXISTS idx_sds2_store_date
    ON store_daily_summaries (store_id, date DESC);
  `;

  console.log("[migrate] Creating store_daily_machines ...");
  await db.sql`
    CREATE TABLE IF NOT EXISTS store_daily_machines (
      id              TEXT PRIMARY KEY,
      store_id        TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      date            DATE NOT NULL,
      machine_name    TEXT NOT NULL,
      diff_sum        INT NOT NULL DEFAULT 0,
      diff_avg        INT NOT NULL DEFAULT 0,
      machine_count   INT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (store_id, date, machine_name)
    );
  `;
  await db.sql`
    CREATE INDEX IF NOT EXISTS idx_sdm_store_date
    ON store_daily_machines (store_id, date DESC);
  `;

  console.log("[migrate] Daily summary tables ready.");
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
