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
  external_id: string | null;
  name: string;
  prefecture: string;
  prefecture_name: string | null;
  city: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  source: string;                   // 'osm' | 'sample' | 'manual'
  canonical_store_id: string | null; // 重複マージ: 代表店舗の id
  imported_at: string | null;
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
  opts?: { search?: string; limit?: number; offset?: number; source?: string },
): Promise<{ stores: StoreRow[]; total: number }> {
  const db = getDb();
  if (!db) return { stores: [], total: 0 };
  const search = opts?.search?.trim() ?? "";
  const limit = opts?.limit ?? 200;
  const offset = opts?.offset ?? 0;
  const source = opts?.source ?? "osm";
  const like = search ? `%${search}%` : null;

  if (like) {
    const countRes = await db.sql`
      SELECT count(*)::int AS total FROM stores
      WHERE prefecture = ${prefecture}
        AND source = ${source}
        AND canonical_store_id IS NULL
        AND name ILIKE ${like}
    `;
    const { rows } = await db.sql`
      SELECT * FROM stores
      WHERE prefecture = ${prefecture}
        AND source = ${source}
        AND canonical_store_id IS NULL
        AND name ILIKE ${like}
      ORDER BY name
      LIMIT ${limit} OFFSET ${offset}
    `;
    return { stores: rows as StoreRow[], total: countRes.rows[0].total };
  }

  const countRes = await db.sql`
    SELECT count(*)::int AS total FROM stores
    WHERE prefecture = ${prefecture}
      AND source = ${source}
      AND canonical_store_id IS NULL
  `;
  const { rows } = await db.sql`
    SELECT * FROM stores
    WHERE prefecture = ${prefecture}
      AND source = ${source}
      AND canonical_store_id IS NULL
    ORDER BY name
    LIMIT ${limit} OFFSET ${offset}
  `;
  return { stores: rows as StoreRow[], total: countRes.rows[0].total };
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
  externalId?: string | null;
  name: string;
  prefecture: string;
  prefectureName?: string | null;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
  source?: string;
}): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("DB未設定");
  const src = store.source ?? "manual";
  await db.sql`
    INSERT INTO stores (id, external_id, name, prefecture, prefecture_name, city, address, lat, lng, source, imported_at)
    VALUES (
      ${store.id},
      ${store.externalId ?? null},
      ${store.name},
      ${store.prefecture},
      ${store.prefectureName ?? null},
      ${store.city ?? null},
      ${store.address ?? null},
      ${store.lat ?? null},
      ${store.lng ?? null},
      ${src},
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      external_id     = COALESCE(EXCLUDED.external_id, stores.external_id),
      name            = EXCLUDED.name,
      prefecture      = EXCLUDED.prefecture,
      prefecture_name = COALESCE(EXCLUDED.prefecture_name, stores.prefecture_name),
      city            = EXCLUDED.city,
      address         = EXCLUDED.address,
      lat             = EXCLUDED.lat,
      lng             = EXCLUDED.lng,
      source          = EXCLUDED.source,
      imported_at     = now(),
      updated_at      = now()
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
    WHERE store_id = ANY(${storeIds as unknown as string}::text[])
    ORDER BY store_id, date DESC
  `;
  const map = new Map<string, StoreDailySignalRow>();
  for (const row of rows as StoreDailySignalRow[]) {
    map.set(row.store_id, row);
  }
  return map;
}
