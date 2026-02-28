// scripts/init-store-analytics-tables.mjs
// Store / StoreDailySignal テーブルの初期化（冪等）
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
  if (!connectionString) {
    throw new Error("Missing DB connection string.");
  }
  const db = createPool({ connectionString });

  console.log("[init] Creating stores table...");
  await db.sql`
    CREATE TABLE IF NOT EXISTS stores (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      prefecture  TEXT NOT NULL,
      city        TEXT,
      address     TEXT,
      lat         DOUBLE PRECISION,
      lng         DOUBLE PRECISION,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  console.log("[init] Creating store_daily_signals table...");
  await db.sql`
    CREATE TABLE IF NOT EXISTS store_daily_signals (
      id                 TEXT PRIMARY KEY,
      store_id           TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      date               DATE NOT NULL,
      traffic_index      INT NOT NULL DEFAULT 0,
      swing_index        INT NOT NULL DEFAULT 0,
      reward_index       INT NOT NULL DEFAULT 0,
      high_chance_index  INT NOT NULL DEFAULT 0,
      note               TEXT,
      source_hash        TEXT,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (store_id, date)
    );
  `;

  // インデックス
  await db.sql`
    CREATE INDEX IF NOT EXISTS idx_sds_store_date
    ON store_daily_signals (store_id, date DESC);
  `;
  await db.sql`
    CREATE INDEX IF NOT EXISTS idx_stores_pref
    ON stores (prefecture);
  `;

  console.log("[init] Store analytics tables ready.");
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
