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
    CREATE TABLE IF NOT EXISTS community_posts (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      username text NOT NULL,
      category text NOT NULL,
      prefecture text NULL,
      hall text NULL,
      machine text NULL,
      title text NOT NULL,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await db.sql`CREATE INDEX IF NOT EXISTS community_posts_created_at_idx ON community_posts (created_at DESC);`;
  await db.sql`CREATE INDEX IF NOT EXISTS community_posts_category_idx ON community_posts (category);`;
  await db.sql`CREATE INDEX IF NOT EXISTS community_posts_user_idx ON community_posts (user_id);`;

  // itest風（板→スレ→レス）
  await db.sql`
    CREATE TABLE IF NOT EXISTS community_threads (
      id text PRIMARY KEY,
      board_id text NOT NULL,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      username text NOT NULL,
      prefecture text NULL,
      hall text NULL,
      machine text NULL,
      title text NOT NULL,
      reply_count integer NOT NULL DEFAULT 1,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await db.sql`CREATE INDEX IF NOT EXISTS community_threads_board_updated_idx ON community_threads (board_id, updated_at DESC);`;
  await db.sql`CREATE INDEX IF NOT EXISTS community_threads_updated_idx ON community_threads (updated_at DESC);`;
  await db.sql`CREATE INDEX IF NOT EXISTS community_threads_user_idx ON community_threads (user_id);`;

  await db.sql`
    CREATE TABLE IF NOT EXISTS community_thread_posts (
      id text PRIMARY KEY,
      thread_id text NOT NULL REFERENCES community_threads(id) ON DELETE CASCADE,
      post_no integer NOT NULL,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      username text NOT NULL,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await db.sql`CREATE UNIQUE INDEX IF NOT EXISTS community_thread_posts_thread_no_uniq ON community_thread_posts (thread_id, post_no);`;
  await db.sql`CREATE INDEX IF NOT EXISTS community_thread_posts_thread_idx ON community_thread_posts (thread_id, created_at ASC);`;
  await db.sql`CREATE INDEX IF NOT EXISTS community_thread_posts_user_idx ON community_thread_posts (user_id);`;

  console.log("OK: community tables are ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
