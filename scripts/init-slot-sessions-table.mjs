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
    CREATE TABLE IF NOT EXISTS slot_sessions (
      id text PRIMARY KEY,
      user_id text NULL,
      date text NOT NULL,
      machine_name text NOT NULL,
      games int NOT NULL CHECK (games >= 0),
      big_count int NULL CHECK (big_count >= 0),
      reg_count int NULL CHECK (reg_count >= 0),
      guessed_setting int NULL CHECK (guessed_setting >= 1 AND guessed_setting <= 6),
      machine_number text NULL,
      shop_name text NULL,
      diff_coins int NOT NULL CHECK (diff_coins >= 0),
      invest int NOT NULL CHECK (invest >= 0),
      collect int NOT NULL CHECK (collect >= 0),
      judge_result_id text NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  // Backward compatibility
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS user_id text NULL;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS date text NOT NULL DEFAULT '';`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS machine_name text NOT NULL DEFAULT '';`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS games int NOT NULL DEFAULT 0;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS big_count int NULL;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS reg_count int NULL;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS guessed_setting int NULL;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS machine_number text NULL;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS shop_name text NULL;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS diff_coins int NOT NULL DEFAULT 0;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS invest int NOT NULL DEFAULT 0;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS collect int NOT NULL DEFAULT 0;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS judge_result_id text NULL;`;
  await db.sql`ALTER TABLE slot_sessions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();`;

  // CHECK制約（既存環境への後付け）
  await db.sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'slot_sessions_big_count_check'
      ) THEN
        ALTER TABLE slot_sessions
          ADD CONSTRAINT slot_sessions_big_count_check
          CHECK (big_count IS NULL OR big_count >= 0);
      END IF;
    END $$;
  `;
  await db.sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'slot_sessions_reg_count_check'
      ) THEN
        ALTER TABLE slot_sessions
          ADD CONSTRAINT slot_sessions_reg_count_check
          CHECK (reg_count IS NULL OR reg_count >= 0);
      END IF;
    END $$;
  `;
  await db.sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'slot_sessions_guessed_setting_check'
      ) THEN
        ALTER TABLE slot_sessions
          ADD CONSTRAINT slot_sessions_guessed_setting_check
          CHECK (guessed_setting IS NULL OR (guessed_setting >= 1 AND guessed_setting <= 6));
      END IF;
    END $$;
  `;

  await db.sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'slot_sessions_user_id_fkey'
      ) THEN
        ALTER TABLE slot_sessions
          ADD CONSTRAINT slot_sessions_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `;

  await db.sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'slot_sessions_judge_result_id_fkey'
      ) THEN
        ALTER TABLE slot_sessions
          ADD CONSTRAINT slot_sessions_judge_result_id_fkey
          FOREIGN KEY (judge_result_id) REFERENCES judge_results(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `;

  await db.sql`CREATE INDEX IF NOT EXISTS slot_sessions_user_date_idx ON slot_sessions (user_id, date DESC, id DESC);`;
  await db.sql`CREATE INDEX IF NOT EXISTS slot_sessions_date_idx ON slot_sessions (date DESC, id DESC);`;
  await db.sql`CREATE INDEX IF NOT EXISTS slot_sessions_judge_result_idx ON slot_sessions (judge_result_id);`;

  console.log("OK: slot_sessions table is ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
