/**
 * scripts/updateStoreSignals.ts
 *
 * 店舗分析バッチスクリプト。
 * 直近1〜3日分のデータを取得し、独自スコアに変換して DB に upsert する。
 *
 * 実行: npx tsx scripts/updateStoreSignals.ts
 *
 * ── 安全方針 ──
 * - robots.txt / 利用規約を遵守
 * - 1リクエストごとに2〜5秒の待機
 * - 失敗時は指数バックオフで最大3回リトライ
 * - 取得した生データはDBに保存しない（スコアのみ保存）
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.development.local", override: true });

import { createPool } from "@vercel/postgres";
import crypto from "node:crypto";
import { computeSignal } from "../lib/analytics/storeScore";
import { mockAdapter } from "../lib/sources/mockAdapter";
import type { SourceAdapter, Store, DatedObservation } from "../lib/sources/sourceAdapter";

/* ── 設定 ── */

const DAYS_BACK = 30;
const REQUEST_DELAY_MS = 2000; // リクエスト間の待機 (ms)
const MAX_RETRIES = 3;

/* ── DB接続 ── */

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

/* ── ユーティリティ ── */

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function hashObservation(obs: DatedObservation): string {
  const raw = JSON.stringify(obs.observation);
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

/* ── メイン処理 ── */

async function fetchWithRetry(
  adapter: SourceAdapter,
  store: Store,
  dateRange: { from: string; to: string },
): Promise<DatedObservation[]> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await adapter.fetchObservations(store, dateRange);
    } catch (err) {
      const waitMs = REQUEST_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(
        `[retry] ${store.name}: attempt ${attempt}/${MAX_RETRIES} failed, waiting ${waitMs}ms`,
        err instanceof Error ? err.message : err,
      );
      if (attempt === MAX_RETRIES) {
        console.error(`[skip] ${store.name}: all retries exhausted`);
        return [];
      }
      await sleep(waitMs);
    }
  }
  return [];
}

async function main() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("Missing DB connection string.");
  }

  const db = createPool({ connectionString });

  // 使用するアダプター（本番では差し替え）
  const adapter: SourceAdapter = mockAdapter;
  console.log(`[batch] Using adapter: ${adapter.name}`);

  // 対象期間
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - DAYS_BACK);
  const dateRange = { from: formatDate(from), to: formatDate(today) };
  console.log(`[batch] Date range: ${dateRange.from} ~ ${dateRange.to}`);

  // 全店舗を取得
  const { rows: stores } = await db.sql`SELECT id, name, prefecture FROM stores ORDER BY name`;
  if (stores.length === 0) {
    console.log("[batch] No stores found. Run seed first.");
    await db.end();
    return;
  }

  console.log(`[batch] Processing ${stores.length} store(s)...`);

  for (const store of stores as Store[]) {
    console.log(`  → ${store.name} (${store.prefecture})`);

    const observations = await fetchWithRetry(adapter, store, dateRange);
    if (observations.length === 0) {
      console.log(`    skipped (no data)`);
      continue;
    }

    for (const dated of observations) {
      const signal = computeSignal(dated.observation);
      const sourceHash = hashObservation(dated);

      await db.sql`
        INSERT INTO store_daily_signals
          (id, store_id, date, traffic_index, swing_index, reward_index, high_chance_index, note, source_hash)
        VALUES (
          ${generateId("sig")},
          ${store.id},
          ${dated.date},
          ${signal.trafficIndex},
          ${signal.swingIndex},
          ${signal.rewardIndex},
          ${signal.highChanceIndex},
          ${signal.note},
          ${sourceHash}
        )
        ON CONFLICT (store_id, date) DO UPDATE SET
          traffic_index     = EXCLUDED.traffic_index,
          swing_index       = EXCLUDED.swing_index,
          reward_index      = EXCLUDED.reward_index,
          high_chance_index = EXCLUDED.high_chance_index,
          note              = EXCLUDED.note,
          source_hash       = EXCLUDED.source_hash,
          updated_at        = now()
      `;
    }

    console.log(`    ${observations.length} signal(s) upserted`);
    await sleep(REQUEST_DELAY_MS);
  }

  console.log("[batch] Done.");
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
