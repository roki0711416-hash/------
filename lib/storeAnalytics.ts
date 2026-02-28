/**
 * lib/storeAnalytics.ts
 *
 * Store / StoreDailySignal の DB 操作ヘルパー。
 * @vercel/postgres の生 SQL を使用（既存プロジェクトのパターンに合わせる）。
 */

import { getDb } from "./db";

/* ── 型定義 ── */

export interface StoreRow {
  id: string;
  name: string;
  prefecture: string;
  city: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface StoreDailySignalRow {
  id: string;
  store_id: string;
  date: string;
  traffic_index: number;
  swing_index: number;
  reward_index: number;
  high_chance_index: number;
  note: string | null;
  source_hash: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Store CRUD ── */

export async function listStoresByPrefecture(
  prefecture: string,
): Promise<StoreRow[]> {
  const db = getDb();
  if (!db) return [];
  const { rows } = await db.sql`
    SELECT * FROM stores
    WHERE prefecture = ${prefecture}
    ORDER BY name
  `;
  return rows as StoreRow[];
}

export async function getStoreById(
  id: string,
): Promise<StoreRow | null> {
  const db = getDb();
  if (!db) return null;
  const { rows } = await db.sql`
    SELECT * FROM stores WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as StoreRow) ?? null;
}

export async function listAllStores(): Promise<StoreRow[]> {
  const db = getDb();
  if (!db) return [];
  const { rows } = await db.sql`
    SELECT * FROM stores ORDER BY prefecture, name
  `;
  return rows as StoreRow[];
}

export async function upsertStore(store: {
  id: string;
  name: string;
  prefecture: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
}): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB未設定");
  await db.sql`
    INSERT INTO stores (id, name, prefecture, city, address, lat, lng)
    VALUES (
      ${store.id},
      ${store.name},
      ${store.prefecture},
      ${store.city ?? null},
      ${store.address ?? null},
      ${store.lat ?? null},
      ${store.lng ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      prefecture = EXCLUDED.prefecture,
      city = EXCLUDED.city,
      address = EXCLUDED.address,
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      updated_at = now()
  `;
}

/* ── Signal CRUD ── */

export async function upsertSignal(signal: {
  id: string;
  storeId: string;
  date: string;
  trafficIndex: number;
  swingIndex: number;
  rewardIndex: number;
  highChanceIndex: number;
  note: string;
  sourceHash?: string;
}): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB未設定");
  await db.sql`
    INSERT INTO store_daily_signals
      (id, store_id, date, traffic_index, swing_index, reward_index, high_chance_index, note, source_hash)
    VALUES (
      ${signal.id},
      ${signal.storeId},
      ${signal.date},
      ${signal.trafficIndex},
      ${signal.swingIndex},
      ${signal.rewardIndex},
      ${signal.highChanceIndex},
      ${signal.note},
      ${signal.sourceHash ?? null}
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

export async function getRecentSignals(
  storeId: string,
  days: number = 7,
): Promise<StoreDailySignalRow[]> {
  const db = getDb();
  if (!db) return [];
  const { rows } = await db.sql`
    SELECT * FROM store_daily_signals
    WHERE store_id = ${storeId}
    ORDER BY date DESC
    LIMIT ${days}
  `;
  return rows as StoreDailySignalRow[];
}

export async function getLatestSignalForStores(
  storeIds: string[],
): Promise<Map<string, StoreDailySignalRow>> {
  const db = getDb();
  if (!db) return new Map();
  if (storeIds.length === 0) return new Map();

  // DISTINCT ON で各店舗の最新1件を取得
  const idList = storeIds.join("','");
  const { rows } = await db.sql`
    SELECT DISTINCT ON (store_id) *
    FROM store_daily_signals
    WHERE store_id = ANY(${storeIds}::text[])
    ORDER BY store_id, date DESC
  `;
  const map = new Map<string, StoreDailySignalRow>();
  for (const row of rows as StoreDailySignalRow[]) {
    map.set(row.store_id, row);
  }
  return map;
}
