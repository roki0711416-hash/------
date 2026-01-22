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
    CREATE TABLE IF NOT EXISTS judge_results (
      id text PRIMARY KEY,
      user_id text NULL REFERENCES users(id) ON DELETE SET NULL,
      machine_type text NOT NULL,
      input jsonb NOT NULL,
      result jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  // Backward compatibility (if table existed with missing cols)
  await db.sql`ALTER TABLE judge_results ADD COLUMN IF NOT EXISTS user_id text NULL;`;
  await db.sql`ALTER TABLE judge_results ADD COLUMN IF NOT EXISTS machine_type text NOT NULL DEFAULT '';`;
  await db.sql`ALTER TABLE judge_results ADD COLUMN IF NOT EXISTS input jsonb NOT NULL DEFAULT '{}'::jsonb;`;
  await db.sql`ALTER TABLE judge_results ADD COLUMN IF NOT EXISTS result jsonb NOT NULL DEFAULT '{}'::jsonb;`;
  await db.sql`ALTER TABLE judge_results ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();`;

  await db.sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'judge_results_user_id_fkey'
      ) THEN
        ALTER TABLE judge_results
          ADD CONSTRAINT judge_results_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `;

  await db.sql`CREATE INDEX IF NOT EXISTS judge_results_user_idx ON judge_results (user_id);`;
  await db.sql`CREATE INDEX IF NOT EXISTS judge_results_created_idx ON judge_results (created_at DESC, id DESC);`;
  await db.sql`CREATE INDEX IF NOT EXISTS judge_results_machine_idx ON judge_results (machine_type, created_at DESC);`;

  console.log("OK: judge_results table is ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
