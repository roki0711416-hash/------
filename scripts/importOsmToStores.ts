/**
 * scripts/importOsmToStores.ts
 *
 * data/osm/pachinko_normalized.json を stores テーブルに source='osm' で一括 upsert する。
 *
 * - 名前なし (name: null) の店舗はスキップ
 * - 都道府県不明 (prefectureSlug: null) の店舗はスキップ
 * - id は UUID を使用（externalId は external_id カラムに保存）
 * - ON CONFLICT (external_id) がある場合は既存行を更新
 *
 * 実行: npx tsx scripts/importOsmToStores.ts
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local", override: true });

import { createPool } from "@vercel/postgres";

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

interface NormalizedStore {
  externalId: string;
  name: string | null;
  lat: number;
  lng: number;
  prefectureName: string | null;
  prefectureSlug: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  phone: string | null;
  sourceUrl: string;
}

async function main() {
  const dataPath = path.join(process.cwd(), "data", "osm", "pachinko_normalized.json");
  if (!fs.existsSync(dataPath)) {
    console.error(`[import-osm] File not found: ${dataPath}`);
    console.error("Run 'npm run osm:summarize' first.");
    process.exit(1);
  }

  const connectionString = getConnectionString();
  if (!connectionString) {
    console.error("[import-osm] Missing DB connection string.");
    process.exit(1);
  }

  const db = createPool({ connectionString });
  const stores: NormalizedStore[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  console.log(`[import-osm] Loaded ${stores.length} normalized stores.`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < stores.length; i++) {
    const s = stores[i];

    // 名前なし or 県不明 → skip
    if (!s.name || !s.prefectureSlug) {
      skipped++;
      continue;
    }

    const externalId = s.externalId; // "osm:n12345" 等
    const id = crypto.randomUUID(); // UUID を生成
    try {
      const res = await db.sql`
        INSERT INTO stores (id, external_id, name, prefecture, prefecture_name, city, address, lat, lng, source, imported_at)
        VALUES (
          ${id},
          ${externalId},
          ${s.name},
          ${s.prefectureSlug},
          ${s.prefectureName},
          ${s.city},
          ${s.address},
          ${s.lat},
          ${s.lng},
          'osm',
          now()
        )
        ON CONFLICT (id) DO UPDATE SET
          external_id     = EXCLUDED.external_id,
          name            = EXCLUDED.name,
          prefecture      = EXCLUDED.prefecture,
          prefecture_name = COALESCE(EXCLUDED.prefecture_name, stores.prefecture_name),
          city            = EXCLUDED.city,
          address         = EXCLUDED.address,
          lat             = EXCLUDED.lat,
          lng             = EXCLUDED.lng,
          source          = 'osm',
          imported_at     = now(),
          updated_at      = now()
        RETURNING (xmax = 0) AS is_insert
      `;
      if (res.rows[0]?.is_insert) {
        inserted++;
      } else {
        updated++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (errors < 5) console.error(`  Error on ${externalId}: ${msg}`);
      errors++;
    }

    if ((i + 1) % 500 === 0) {
      console.log(`  ... ${i + 1} / ${stores.length} processed`);
    }
  }

  console.log(`\n[import-osm] Done.`);
  console.log(`  Total:    ${stores.length}`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated:  ${updated}`);
  console.log(`  Skipped:  ${skipped} (no name or no prefecture)`);
  console.log(`  Errors:   ${errors}`);

  // source 別の件数
  const { rows } = await db.sql`
    SELECT source, count(*)::int AS cnt
    FROM stores
    GROUP BY source
    ORDER BY source
  `;
  console.log(`\n[import-osm] Store counts by source:`);
  for (const r of rows) {
    console.log(`  ${(r as { source: string; cnt: number }).source}: ${(r as { source: string; cnt: number }).cnt}`);
  }

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
