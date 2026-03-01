/**
 * scripts/mark-sample-stores.mjs
 *
 * 既存のサンプル店舗を source='sample' に UPDATE する。
 *
 * 判定ロジック:
 *   1) id が "{slug}-store-{suffix}" パターン（seed-stores.ts 由来）
 *   2) name に「サンプル」を含む
 *   3) address が "*1-1-1" で終わる
 *
 * 実行: node scripts/mark-sample-stores.mjs
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

  console.log("[mark-sample] Marking sample stores ...");

  // 条件1: id パターン (seed-stores.ts が生成する形式)
  const r1 = await db.sql`
    UPDATE stores
    SET source = 'sample', updated_at = now()
    WHERE source != 'sample'
      AND id ~ '^[a-z]+-store-[0-9]+$'
  `;
  console.log(`  id パターン: ${r1.rowCount} rows`);

  // 条件2: name にサンプルを含む
  const r2 = await db.sql`
    UPDATE stores
    SET source = 'sample', updated_at = now()
    WHERE source != 'sample'
      AND name ILIKE '%サンプル%'
  `;
  console.log(`  name サンプル: ${r2.rowCount} rows`);

  // 条件3: address が 1-1-1 で終わる（seed-stores.ts のパターン）
  const r3 = await db.sql`
    UPDATE stores
    SET source = 'sample', updated_at = now()
    WHERE source != 'sample'
      AND address LIKE '%1-1-1'
  `;
  console.log(`  address 1-1-1: ${r3.rowCount} rows`);

  // 結果確認
  const { rows } = await db.sql`
    SELECT source, count(*)::int AS cnt
    FROM stores
    GROUP BY source
    ORDER BY source
  `;
  console.log("\n[mark-sample] Store counts by source:");
  for (const r of rows) {
    console.log(`  ${r.source}: ${r.cnt}`);
  }

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
