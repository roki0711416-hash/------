/**
 * scripts/migrate-add-source-canonical.mjs
 *
 * stores テーブルに以下を追加（冪等）：
 *   - source            TEXT NOT NULL DEFAULT 'manual'   ("osm" / "sample" / "manual")
 *   - imported_at        TIMESTAMPTZ
 *   - canonical_store_id TEXT (自己参照 FK → stores.id)
 *
 * 実行: node scripts/migrate-add-source-canonical.mjs
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

  console.log("[migrate] Adding source / imported_at / canonical_store_id to stores ...");

  // source: 'manual' | 'osm' | 'sample'
  await db.sql`
    ALTER TABLE stores
    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'
  `;

  // imported_at: いつインポートされたか
  await db.sql`
    ALTER TABLE stores
    ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ
  `;

  // canonical_store_id: 重複マージ用（代表店舗への参照）
  await db.sql`
    ALTER TABLE stores
    ADD COLUMN IF NOT EXISTS canonical_store_id TEXT
      REFERENCES stores(id) ON DELETE SET NULL
  `;

  // インデックス
  await db.sql`
    CREATE INDEX IF NOT EXISTS idx_stores_source
    ON stores (source)
  `;
  await db.sql`
    CREATE INDEX IF NOT EXISTS idx_stores_canonical
    ON stores (canonical_store_id)
  `;

  console.log("[migrate] Done.");
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
