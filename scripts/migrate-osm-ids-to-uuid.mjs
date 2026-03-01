/**
 * scripts/migrate-osm-ids-to-uuid.mjs
 *
 * stores テーブルの id が "osm:nXXX" のレコードを UUID に置換する。
 * 旧 id は external_id カラムに保存。
 * 全FK参照（store_daily_signals, store_daily_summaries,
 * store_daily_machines, stores.canonical_store_id）も一括更新。
 *
 * 実行: node scripts/migrate-osm-ids-to-uuid.mjs
 *       node scripts/migrate-osm-ids-to-uuid.mjs --dry-run
 */
import { createPool } from "@vercel/postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local", override: true });

const DRY_RUN = process.argv.includes("--dry-run");

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

  console.log(`[migrate] ${DRY_RUN ? "(DRY RUN) " : ""}osm: ID → UUID migration`);

  // 対象件数確認
  const { rows: countRows } = await db.query(
    `SELECT count(*)::int AS cnt FROM stores WHERE id LIKE 'osm:%'`,
  );
  const total = countRows[0].cnt;
  console.log(`[migrate] ${total} stores with osm: prefix`);

  if (total === 0) {
    console.log("[migrate] Nothing to migrate.");
    await db.end();
    return;
  }

  if (DRY_RUN) {
    console.log("[migrate] Dry run — no changes will be made.");
    await db.end();
    return;
  }

  // ----- 実行 -----
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // 1) FK制約を一時的に削除
    console.log("[migrate] Dropping FK constraints ...");
    await client.query(`ALTER TABLE store_daily_signals DROP CONSTRAINT IF EXISTS store_daily_signals_store_id_fkey`);
    await client.query(`ALTER TABLE store_daily_summaries DROP CONSTRAINT IF EXISTS store_daily_summaries_store_id_fkey`);
    await client.query(`ALTER TABLE store_daily_machines DROP CONSTRAINT IF EXISTS store_daily_machines_store_id_fkey`);
    await client.query(`ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_canonical_store_id_fkey`);

    // 2) マッピングテーブル作成
    console.log("[migrate] Creating ID mapping ...");
    await client.query(`
      CREATE TEMP TABLE osm_id_map AS
      SELECT id AS old_id, gen_random_uuid()::text AS new_id
      FROM stores WHERE id LIKE 'osm:%'
    `);

    const { rows: mapCount } = await client.query(`SELECT count(*)::int AS cnt FROM osm_id_map`);
    console.log(`[migrate] Mapping created: ${mapCount[0].cnt} entries`);

    // 3) 子テーブルの store_id を更新
    console.log("[migrate] Updating store_daily_signals ...");
    const r1 = await client.query(`
      UPDATE store_daily_signals sig SET store_id = m.new_id
      FROM osm_id_map m WHERE sig.store_id = m.old_id
    `);
    console.log(`  → ${r1.rowCount} rows`);

    console.log("[migrate] Updating store_daily_summaries ...");
    const r2 = await client.query(`
      UPDATE store_daily_summaries s SET store_id = m.new_id
      FROM osm_id_map m WHERE s.store_id = m.old_id
    `);
    console.log(`  → ${r2.rowCount} rows`);

    console.log("[migrate] Updating store_daily_machines ...");
    const r3 = await client.query(`
      UPDATE store_daily_machines s SET store_id = m.new_id
      FROM osm_id_map m WHERE s.store_id = m.old_id
    `);
    console.log(`  → ${r3.rowCount} rows`);

    // 4) canonical_store_id を更新
    console.log("[migrate] Updating canonical_store_id references ...");
    const r4 = await client.query(`
      UPDATE stores s SET canonical_store_id = m.new_id
      FROM osm_id_map m WHERE s.canonical_store_id = m.old_id
    `);
    console.log(`  → ${r4.rowCount} rows`);

    // 5) stores.id を UUID に、旧IDは external_id へ
    console.log("[migrate] Updating stores.id → UUID ...");
    const r5 = await client.query(`
      UPDATE stores s SET
        id = m.new_id,
        external_id = m.old_id
      FROM osm_id_map m WHERE s.id = m.old_id
    `);
    console.log(`  → ${r5.rowCount} rows`);

    // 6) FK制約を再追加
    console.log("[migrate] Re-adding FK constraints ...");
    await client.query(`
      ALTER TABLE store_daily_signals
      ADD CONSTRAINT store_daily_signals_store_id_fkey
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    `);
    await client.query(`
      ALTER TABLE store_daily_summaries
      ADD CONSTRAINT store_daily_summaries_store_id_fkey
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    `);
    await client.query(`
      ALTER TABLE store_daily_machines
      ADD CONSTRAINT store_daily_machines_store_id_fkey
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    `);
    await client.query(`
      ALTER TABLE stores
      ADD CONSTRAINT stores_canonical_store_id_fkey
      FOREIGN KEY (canonical_store_id) REFERENCES stores(id)
    `);

    await client.query("COMMIT");
    console.log("[migrate] ✅ Migration complete!");

    // 確認
    const { rows: verify } = await db.query(`
      SELECT count(*)::int AS remaining FROM stores WHERE id LIKE 'osm:%'
    `);
    console.log(`[migrate] Remaining osm: IDs: ${verify[0].remaining}`);

    const { rows: sample } = await db.query(`
      SELECT id, external_id, name FROM stores WHERE external_id LIKE 'osm:%' LIMIT 3
    `);
    console.log("[migrate] Sample migrated stores:", JSON.stringify(sample, null, 2));

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[migrate] ❌ ROLLBACK:", err);
    throw err;
  } finally {
    client.release();
  }

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
