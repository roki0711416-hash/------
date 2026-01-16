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
    CREATE TABLE IF NOT EXISTS reviews (
      id text PRIMARY KEY,
      machine_id text NOT NULL,
      date text NOT NULL,
      rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
      user_id text NULL REFERENCES users(id) ON DELETE SET NULL,
      author text NULL,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  // 既存DB向け（後方互換）
  await db.sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id text NULL;`;
  await db.sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reviews_user_id_fkey'
      ) THEN
        ALTER TABLE reviews
          ADD CONSTRAINT reviews_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `;

  await db.sql`CREATE INDEX IF NOT EXISTS reviews_machine_date_idx ON reviews (machine_id, date DESC, id DESC);`;
  await db.sql`CREATE INDEX IF NOT EXISTS reviews_user_idx ON reviews (user_id);`;

  console.log("OK: reviews table is ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
