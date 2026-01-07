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
    CREATE TABLE IF NOT EXISTS reviews (
      id text PRIMARY KEY,
      machine_id text NOT NULL,
      date text NOT NULL,
      rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
      author text NULL,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;

  await db.sql`CREATE INDEX IF NOT EXISTS reviews_machine_date_idx ON reviews (machine_id, date DESC, id DESC);`;

  console.log("OK: reviews table is ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
