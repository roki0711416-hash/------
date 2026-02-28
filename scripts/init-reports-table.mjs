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
    throw new Error(
      "Missing DB connection string. Set DATABASE_URL (Neon) or POSTGRES_URL, then try again.",
    );
  }

  const db = createPool({ connectionString });

  // ── 通報テーブル ──
  await db.sql`
    CREATE TABLE IF NOT EXISTS community_reports (
      id              text PRIMARY KEY,
      reporter_user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_type     text NOT NULL CHECK (target_type IN ('thread', 'post')),
      target_id       text NOT NULL,
      reason          text NOT NULL,
      detail          text NOT NULL DEFAULT '',
      status          text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED')),
      created_at      timestamptz NOT NULL DEFAULT now(),
      handled_at      timestamptz,
      handled_by      text
    );
  `;

  await db.sql`CREATE INDEX IF NOT EXISTS community_reports_status_idx ON community_reports (status, created_at DESC);`;
  await db.sql`CREATE INDEX IF NOT EXISTS community_reports_target_idx ON community_reports (target_type, target_id);`;
  await db.sql`CREATE INDEX IF NOT EXISTS community_reports_reporter_idx ON community_reports (reporter_user_id);`;

  // ── ユーザーBAN管理カラム（usersテーブルに追加） ──
  // ALTER TABLE ... ADD COLUMN IF NOT EXISTS はPG9.6+で利用可
  await db.sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_banned') THEN
        ALTER TABLE users ADD COLUMN is_banned boolean NOT NULL DEFAULT false;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'banned_at') THEN
        ALTER TABLE users ADD COLUMN banned_at timestamptz;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'ban_reason') THEN
        ALTER TABLE users ADD COLUMN ban_reason text;
      END IF;
    END
    $$;
  `;

  // ── スレッド/投稿の論理削除カラム ──
  await db.sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_threads' AND column_name = 'is_deleted') THEN
        ALTER TABLE community_threads ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_thread_posts' AND column_name = 'is_deleted') THEN
        ALTER TABLE community_thread_posts ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;
      END IF;
    END
    $$;
  `;

  console.log("OK: community_reports table + ban/delete columns are ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
