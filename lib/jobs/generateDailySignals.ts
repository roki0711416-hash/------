/**
 * lib/jobs/generateDailySignals.ts
 *
 * 全 active 店舗に対して直近1日ぶんの
 * store_daily_summaries + store_daily_machines をモック生成する。
 *
 * ※ 将来的にはスクレイピングや外部APIからの実データに差し替え可能。
 * ※ is_closed=true の店舗は対象外。
 */

import { getDb } from "../db";
import crypto from "crypto";

/* ── 機種候補 ── */
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

function hashSeed(storeId: string, dateSuffix: string): number {
  const h = crypto.createHash("md5").update(storeId + dateSuffix).digest();
  return h.readUInt32LE(0);
}

export interface DailySignalsResult {
  storesProcessed: number;
  summariesInserted: number;
  machinesInserted: number;
  daysGenerated: number;
}

const SQL_BATCH = 200;

/**
 * 直近 N 日ぶんのモックデータを生成する。
 * デフォルトは1日（dailyで呼ぶ前提）。
 */
export async function generateDailySignals(
  days: number = 1,
): Promise<DailySignalsResult> {
  const db = getDb();
  if (!db) throw new Error("DB not configured");

  // active 店舗（is_closed=false, canonical=NULL）
  const { rows: stores } = await db.query(
    `SELECT id FROM stores
     WHERE source = 'osm'
       AND canonical_store_id IS NULL
       AND (is_closed = false OR is_closed IS NULL)
     ORDER BY id`,
  );

  const today = new Date();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  console.info(
    `[daily-signals] ${stores.length} stores × ${dates.length} days`,
  );

  let summaryCount = 0;
  let machineCount = 0;
  const CHUNK = 50;

  for (let ci = 0; ci < stores.length; ci += CHUNK) {
    const chunk = stores.slice(ci, ci + CHUNK);
    const summaryRows: unknown[][] = [];
    const machineRows: unknown[][] = [];

    for (const store of chunk) {
      for (const date of dates) {
        const rng = splitmix32(hashSeed(store.id, date));
        const mCount = 3 + Math.floor(rng() * 6);
        const shuffled = [...MACHINE_CANDIDATES].sort(() => rng() - 0.5);
        const picked = shuffled.slice(0, mCount);

        let dailyTotal = 0;
        const dayMachines: {
          name: string;
          diffSum: number;
          count: number;
        }[] = [];

        for (const mName of picked) {
          const count = 2 + Math.floor(rng() * 11);
          const diffSum = Math.round(rng() * 8000 - 3000);
          const diffAvg = Math.round(diffSum / count);
          dailyTotal += diffSum;
          dayMachines.push({ name: mName, diffSum, count });

          const mId = `${store.id}_${date}_${crypto.createHash("md5").update(mName).digest("hex").slice(0, 8)}`;
          machineRows.push([mId, store.id, date, mName, diffSum, diffAvg, count]);
        }

        const avgDiff = Math.round(dailyTotal / mCount);
        const totalGames = 1000 + Math.floor(rng() * 9000);
        const top3 = [...dayMachines]
          .sort((a, b) => b.diffSum - a.diffSum)
          .slice(0, 3)
          .map((m) => ({ name: m.name, diff: m.diffSum, count: m.count }));

        summaryRows.push([
          `${store.id}_${date}`,
          store.id,
          date,
          dailyTotal,
          avgDiff,
          totalGames,
          JSON.stringify(top3),
        ]);
      }
    }

    // batch summaries
    for (let b = 0; b < summaryRows.length; b += SQL_BATCH) {
      const batch = summaryRows.slice(b, b + SQL_BATCH);
      const ph: string[] = [];
      const vals: unknown[] = [];
      batch.forEach((row, i) => {
        const o = i * 7;
        ph.push(
          `($${o + 1},$${o + 2},$${o + 3},$${o + 4},$${o + 5},$${o + 6},$${o + 7})`,
        );
        vals.push(...row);
      });
      await db.query(
        `INSERT INTO store_daily_summaries (id,store_id,date,total_diff,avg_diff,total_games,top_machines)
         VALUES ${ph.join(",")}
         ON CONFLICT (store_id,date) DO UPDATE SET
           total_diff=EXCLUDED.total_diff, avg_diff=EXCLUDED.avg_diff,
           total_games=EXCLUDED.total_games, top_machines=EXCLUDED.top_machines,
           updated_at=now()`,
        vals,
      );
      summaryCount += batch.length;
    }

    // batch machines
    for (let b = 0; b < machineRows.length; b += SQL_BATCH) {
      const batch = machineRows.slice(b, b + SQL_BATCH);
      const ph: string[] = [];
      const vals: unknown[] = [];
      batch.forEach((row, i) => {
        const o = i * 7;
        ph.push(
          `($${o + 1},$${o + 2},$${o + 3},$${o + 4},$${o + 5},$${o + 6},$${o + 7})`,
        );
        vals.push(...row);
      });
      await db.query(
        `INSERT INTO store_daily_machines (id,store_id,date,machine_name,diff_sum,diff_avg,machine_count)
         VALUES ${ph.join(",")}
         ON CONFLICT (store_id,date,machine_name) DO UPDATE SET
           diff_sum=EXCLUDED.diff_sum, diff_avg=EXCLUDED.diff_avg,
           machine_count=EXCLUDED.machine_count, updated_at=now()`,
        vals,
      );
      machineCount += batch.length;
    }
  }

  const result: DailySignalsResult = {
    storesProcessed: stores.length,
    summariesInserted: summaryCount,
    machinesInserted: machineCount,
    daysGenerated: dates.length,
  };

  console.info(
    `[daily-signals] Done: ${result.summariesInserted} summaries, ${result.machinesInserted} machines`,
  );
  return result;
}
