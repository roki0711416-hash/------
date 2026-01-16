import { createPool } from "@vercel/postgres";
import dotenv from "dotenv";

// node で直接実行するスクリプトなので、envファイルを明示的に読み込む
// Next.js と同様に `.env.development.local` を優先させる（必要な場合のみ `.env.local` を参照）
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
    throw new Error(
      "Missing DB connection string. Set DATABASE_URL (Neon) or POSTGRES_URL, then try again.",
    );
  }

  const db = createPool({ connectionString });

  await db.sql`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      email text NOT NULL UNIQUE,
      username text NULL,
      password_hash text NOT NULL,
      stripe_customer_id text NULL,
      active_session_id text NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  // 既存DB向け（後方互換）
  await db.sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username text NULL;`;

  await db.sql`CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);`;
  await db.sql`CREATE INDEX IF NOT EXISTS users_stripe_customer_idx ON users (stripe_customer_id);`;
  await db.sql`CREATE UNIQUE INDEX IF NOT EXISTS users_username_uniq ON users (username);`;

  await db.sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now(),
      revoked_at timestamptz NULL
    );
  `;

  await db.sql`CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);`;

  await db.sql`
    CREATE TABLE IF NOT EXISTS subscriptions (
      user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      stripe_subscription_id text NULL,
      status text NULL,
      current_period_end timestamptz NULL,
      trial_end timestamptz NULL,
      cancel_at_period_end boolean NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  // Stripe webhook email idempotency
  await db.sql`
    CREATE TABLE IF NOT EXISTS stripe_webhook_email_events (
      stripe_event_id text PRIMARY KEY,
      event_type text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  console.log("OK: auth/subscription tables are ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
