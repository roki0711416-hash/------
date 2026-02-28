/**
 * scripts/dedupeStores.ts
 *
 * 同一店舗の重複を検出し、canonical_store_id を設定してマージする。
 *
 * 実行:
 *   npx tsx scripts/dedupeStores.ts --dry-run   # DB更新なし、候補のみ表示
 *   npx tsx scripts/dedupeStores.ts              # 本番実行
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local", override: true });

import { createPool } from "@vercel/postgres";
import {
  findDuplicateGroups,
  type DedupeStore,
  type DedupeGroup,
} from "../lib/stores/dedupe";

/* ── 都道府県マスタ ── */
const PREFECTURES = [
  "hokkaido","aomori","iwate","miyagi","akita","yamagata","fukushima",
  "ibaraki","tochigi","gunma","saitama","chiba","tokyo","kanagawa",
  "niigata","toyama","ishikawa","fukui","yamanashi","nagano","gifu","shizuoka","aichi",
  "mie","shiga","kyoto","osaka","hyogo","nara","wakayama",
  "tottori","shimane","okayama","hiroshima","yamaguchi",
  "tokushima","kagawa","ehime","kochi",
  "fukuoka","saga","nagasaki","kumamoto","oita","miyazaki","kagoshima","okinawa",
];

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
  const dryRun = process.argv.includes("--dry-run");
  console.log(`[dedupe] mode: ${dryRun ? "DRY-RUN" : "EXECUTE"}\n`);

  const connectionString = getConnectionString();
  if (!connectionString) throw new Error("Missing DB connection string.");
  const db = createPool({ connectionString });

  let totalCanonical = 0;
  let totalDuplicates = 0;
  const allGroups: (DedupeGroup & { pref: string })[] = [];

  for (const pref of PREFECTURES) {
    // source='osm' かつまだマージされていないものを取得
    const { rows } = await db.sql`
      SELECT id, external_id, name, lat, lng, prefecture, address, created_at
      FROM stores
      WHERE prefecture = ${pref}
        AND source = 'osm'
        AND canonical_store_id IS NULL
      ORDER BY name
    `;
    if (rows.length === 0) continue;

    const stores = rows as unknown as DedupeStore[];
    const groups = findDuplicateGroups(stores);

    if (groups.length === 0) continue;

    let prefDups = 0;
    for (const g of groups) {
      prefDups += g.duplicates.length;
      allGroups.push({ ...g, pref });
    }

    totalCanonical += groups.length;
    totalDuplicates += prefDups;

    console.log(
      `  ${pref.padEnd(12)} ${rows.length} stores → ${groups.length} groups, ${prefDups} duplicates`,
    );

    if (!dryRun) {
      // DB更新: 重複店舗に canonical_store_id をセット
      for (const g of groups) {
        const dupIds = g.duplicates.map((d) => d.id);
        await db.sql`
          UPDATE stores
          SET canonical_store_id = ${g.canonical.id}, updated_at = now()
          WHERE id = ANY(${dupIds as unknown as string}::text[])
        `;
      }
    }
  }

  // サマリ
  console.log(`\n[dedupe] Summary:`);
  console.log(`  Canonical (代表): ${totalCanonical} groups`);
  console.log(`  Duplicates (重複): ${totalDuplicates} stores`);
  console.log(`  Mode: ${dryRun ? "DRY-RUN (no DB changes)" : "EXECUTED"}`);

  // 上位10グループを表示
  if (allGroups.length > 0) {
    console.log(`\n[dedupe] Top ${Math.min(10, allGroups.length)} groups:`);
    const top = allGroups
      .sort((a, b) => b.duplicates.length - a.duplicates.length)
      .slice(0, 10);
    for (const g of top) {
      console.log(`  ─── ${g.pref} ───`);
      console.log(
        `  代表: ${g.canonical.name} (${g.canonical.external_id ?? g.canonical.id})`,
      );
      for (const d of g.duplicates) {
        console.log(`    重複: ${d.name} (${d.external_id ?? d.id})`);
      }
    }
  }

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
