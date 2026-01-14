import { createPool } from "@vercel/postgres";
import dotenv from "dotenv";

// node で直接実行するスクリプトなので、.env.local を明示的に読み込む
dotenv.config({ path: ".env.local" });

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
    throw new Error(
      "Missing DB connection string. Set DATABASE_URL (Neon) or POSTGRES_URL, then try again.",
    );
  }

  const db = createPool({ connectionString });

  await db.sql`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY,
      email text NOT NULL UNIQUE,
      stripe_customer_id text NULL,
      stripe_subscription_id text NULL,
      subscription_status text NULL,
      subscription_current_period_end timestamptz NULL,
      device_id text NULL,
      device_bound_at timestamptz NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await db.sql`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id text PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await db.sql`
    CREATE INDEX IF NOT EXISTS auth_sessions_user_expires_idx
    ON auth_sessions (user_id, expires_at DESC);
  `;

  await db.sql`
    CREATE TABLE IF NOT EXISTS auth_login_tokens (
      token_hash text PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await db.sql`
    CREATE INDEX IF NOT EXISTS auth_login_tokens_user_expires_idx
    ON auth_login_tokens (user_id, expires_at DESC);
  `;

  await db.sql`
    CREATE TABLE IF NOT EXISTS device_reset_requests (
      id bigserial PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      requested_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await db.sql`
    CREATE INDEX IF NOT EXISTS device_reset_requests_user_time_idx
    ON device_reset_requests (user_id, requested_at DESC);
  `;

  await db.sql`
    CREATE TABLE IF NOT EXISTS device_reset_tokens (
      token_hash text PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL,
      used_at timestamptz NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await db.sql`
    CREATE INDEX IF NOT EXISTS device_reset_tokens_user_created_idx
    ON device_reset_tokens (user_id, created_at DESC);
  `;

  await db.sql`
    CREATE TABLE IF NOT EXISTS plays (
      id uuid PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      machine_id text NOT NULL,
      machine_name text NOT NULL,
      machine_no int NULL,
      store_name text NULL,
      played_on date NOT NULL,
      total_games int NULL,
      big_count int NULL,
      reg_count int NULL,
      diff_coins int NULL,
      invest_yen int NULL,
      return_yen int NULL,
      memo text NULL,
      image_url text NULL,
      share_token text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  // 既存DB向け（後から追加したカラムの互換）
  await db.sql`ALTER TABLE plays ADD COLUMN IF NOT EXISTS machine_no int NULL;`;

  await db.sql`
    CREATE INDEX IF NOT EXISTS plays_user_time_idx
    ON plays (user_id, played_on DESC, created_at DESC);
  `;

  console.log("OK: auth/subscription tables are ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
