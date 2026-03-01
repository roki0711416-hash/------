/**
 * scripts/generateDailyMockData.ts
 *
 * 全 visible OSM 店舗に対して store_daily_summaries + store_daily_machines
 * の 30 日分モックデータを生成する。
 *
 * 実行: npx tsx scripts/generateDailyMockData.ts
 *       npx tsx scripts/generateDailyMockData.ts --days 14
 */

import { createPool } from "@vercel/postgres";
import * as dotenv from "dotenv";
import * as crypto from "crypto";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local" });

/* ── 設定 ── */

const DAYS = (() => {
  const idx = process.argv.indexOf("--days");
  return idx !== -1 ? Number(process.argv[idx + 1]) || 30 : 30;
})();

/** 機種候補 */
const MACHINE_CANDIDATES = [
  "押忍！番長ZERO",
  "バジリスク絆2天膳",
  "甲鉄城のカバネリ",
  "からくりサーカス",
  "モンキーターンV",
  "ヴァルヴレイヴ",
  "マクロスF4",
  "北斗の拳",
  "リゼロ2",
  "ゴジエヴァ",
  "犬夜叉",
  "ガルパン",
  "ハナビ通",
  "アイムジャグラーEX",
  "マイジャグラーV",
  "ゴーゴージャグラー3",
  "スマスロキングパルサー",
  "ソードアート・オンライン",
  "バイオハザード RE:2",
  "エウレカセブン HI-EVO",
];

/* ── seeded PRNG (splitmix32) ── */
function splitmix32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x9e3779b9) | 0;
    let t = seed ^ (seed >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t ^= t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    t ^= t >>> 15;
    return (t >>> 0) / 4294967296;
  };
}

function hashSeed(storeId: string): number {
  const h = crypto.createHash("md5").update(storeId).digest();
  return h.readUInt32LE(0);
}

/* ── DB connection ── */
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

/* ── バッチサイズ ── */
const STORE_CHUNK = 50;  // 50店舗ずつ処理
const SQL_BATCH = 200;   // 200行ずつ INSERT

/* ── main ── */
async function main() {
  const connectionString = getConnectionString();
  if (!connectionString) throw new Error("Missing DB connection string.");
  const db = createPool({ connectionString, max: 4 });

  // 全 visible OSM 店舗を取得
  const { rows: stores } = await db.query(
    `SELECT id, name FROM stores
     WHERE source = 'osm' AND canonical_store_id IS NULL
     ORDER BY id`,
  );
  console.log(`[mock] ${stores.length} visible stores found`);

  // 日付リスト (today - DAYS+1 .. today)
  const today = new Date();
  const dates: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  console.log(`[mock] Generating ${dates.length} days: ${dates[0]} → ${dates[dates.length - 1]}`);

  let summaryCount = 0;
  let machineCount = 0;

  // 店舗をチャンク分割して処理
  for (let ci = 0; ci < stores.length; ci += STORE_CHUNK) {
    const chunk = stores.slice(ci, ci + STORE_CHUNK);

    // チャンク内の全行を生成してバッチ INSERT
    const summaryRows: unknown[][] = [];
    const machineRows: unknown[][] = [];

    for (const store of chunk) {
      const rng = splitmix32(hashSeed(store.id));

      for (const date of dates) {
        const machineCountForDay = 3 + Math.floor(rng() * 6);
        const shuffled = [...MACHINE_CANDIDATES].sort(() => rng() - 0.5);
        const pickedMachines = shuffled.slice(0, machineCountForDay);

        let dailyTotalDiff = 0;
        const dayMachines: { machineName: string; diffSum: number; diffAvg: number; count: number }[] = [];

        for (const mName of pickedMachines) {
          const count = 2 + Math.floor(rng() * 11);
          const diffSum = Math.round(rng() * 8000 - 3000);
          const diffAvg = Math.round(diffSum / count);
          dailyTotalDiff += diffSum;
          dayMachines.push({ machineName: mName, diffSum, diffAvg, count });

          const mId = `${store.id}_${date}_${crypto.createHash("md5").update(mName).digest("hex").slice(0, 8)}`;
          machineRows.push([mId, store.id, date, mName, diffSum, diffAvg, count]);
        }

        const avgDiff = Math.round(dailyTotalDiff / machineCountForDay);
        const totalGames = 1000 + Math.floor(rng() * 9000);
        const top3 = [...dayMachines]
          .sort((a, b) => b.diffSum - a.diffSum)
          .slice(0, 3)
          .map((m) => ({ name: m.machineName, diff: m.diffSum, count: m.count }));

        const sId = `${store.id}_${date}`;
        summaryRows.push([sId, store.id, date, dailyTotalDiff, avgDiff, totalGames, JSON.stringify(top3)]);
      }
    }

    // バッチ INSERT — summaries
    for (let b = 0; b < summaryRows.length; b += SQL_BATCH) {
      const batch = summaryRows.slice(b, b + SQL_BATCH);
      const placeholders: string[] = [];
      const values: unknown[] = [];
      batch.forEach((row, i) => {
        const offset = i * 7;
        placeholders.push(`($${offset+1},$${offset+2},$${offset+3},$${offset+4},$${offset+5},$${offset+6},$${offset+7})`);
        values.push(...row);
      });
      await db.query(
        `INSERT INTO store_daily_summaries (id, store_id, date, total_diff, avg_diff, total_games, top_machines)
         VALUES ${placeholders.join(",")}
         ON CONFLICT (store_id, date) DO UPDATE SET
           total_diff = EXCLUDED.total_diff, avg_diff = EXCLUDED.avg_diff,
           total_games = EXCLUDED.total_games, top_machines = EXCLUDED.top_machines,
           updated_at = now()`,
        values,
      );
      summaryCount += batch.length;
    }

    // バッチ INSERT — machines
    for (let b = 0; b < machineRows.length; b += SQL_BATCH) {
      const batch = machineRows.slice(b, b + SQL_BATCH);
      const placeholders: string[] = [];
      const values: unknown[] = [];
      batch.forEach((row, i) => {
        const offset = i * 7;
        placeholders.push(`($${offset+1},$${offset+2},$${offset+3},$${offset+4},$${offset+5},$${offset+6},$${offset+7})`);
        values.push(...row);
      });
      await db.query(
        `INSERT INTO store_daily_machines (id, store_id, date, machine_name, diff_sum, diff_avg, machine_count)
         VALUES ${placeholders.join(",")}
         ON CONFLICT (store_id, date, machine_name) DO UPDATE SET
           diff_sum = EXCLUDED.diff_sum, diff_avg = EXCLUDED.diff_avg,
           machine_count = EXCLUDED.machine_count, updated_at = now()`,
        values,
      );
      machineCount += batch.length;
    }

    process.stdout.write(
      `\r[mock] ${ci + chunk.length}/${stores.length} stores | ${summaryCount} summaries, ${machineCount} machines`,
    );
  }

  console.log(
    `\n[mock] Done! ${summaryCount} summaries, ${machineCount} machine rows inserted.`,
  );

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
