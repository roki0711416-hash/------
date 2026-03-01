/**
 * lib/jobs/dedupeStores.ts
 *
 * 全47都道府県をループし、OSM 由来の店舗を重複クラスタリング。
 * canonical_store_id を設定して重複を非表示にする。
 *
 * 週次 cron (updateOsmStores の直後) に呼ばれる想定。
 */

import { getDb } from "../db";
import { findDuplicateGroups } from "../stores/dedupe";
import type { DedupeStore } from "../stores/dedupe";

const PREFECTURES = [
  "hokkaido","aomori","iwate","miyagi","akita","yamagata","fukushima",
  "ibaraki","tochigi","gunma","saitama","chiba","tokyo","kanagawa",
  "niigata","toyama","ishikawa","fukui","yamanashi","nagano",
  "gifu","shizuoka","aichi","mie","shiga","kyoto","osaka","hyogo",
  "nara","wakayama","tottori","shimane","okayama","hiroshima","yamaguchi",
  "tokushima","kagawa","ehime","kochi","fukuoka","saga","nagasaki",
  "kumamoto","oita","miyazaki","kagoshima","okinawa",
];

export interface DedupeResult {
  prefecturesProcessed: number;
  groupsFound: number;
  duplicatesMarked: number;
}

/**
 * 全都道府県の OSM 店舗を重複チェックし canonical_store_id を設定。
 */
export async function dedupeStores(): Promise<DedupeResult> {
  const db = getDb();
  if (!db) throw new Error("DB not configured");

  let groupsFound = 0;
  let duplicatesMarked = 0;
  let prefsProcessed = 0;

  for (const pref of PREFECTURES) {
    const { rows } = await db.query<{
      id: string;
      name: string;
      lat: number | null;
      lng: number | null;
      external_id: string | null;
      prefecture: string;
      address: string | null;
      created_at: string;
    }>(
      `SELECT id, name, lat, lng, external_id, prefecture, address, created_at
       FROM stores
       WHERE source = 'osm'
         AND prefecture = $1
         AND canonical_store_id IS NULL
         AND is_closed = false`,
      [pref],
    );

    if (rows.length < 2) { prefsProcessed++; continue; }

    const stores: DedupeStore[] = rows.map((r) => ({
      id: r.id,
      external_id: r.external_id,
      name: r.name,
      lat: r.lat,
      lng: r.lng,
      prefecture: r.prefecture,
      address: r.address,
      created_at: r.created_at,
    }));

    const groups = findDuplicateGroups(stores);
    groupsFound += groups.length;

    for (const g of groups) {
      const canonId = g.canonical.id;
      const dupIds = g.duplicates.map((d) => d.id);
      if (dupIds.length === 0) continue;

      // 重複メンバーに canonical_store_id を設定
      const placeholders = dupIds.map((_, i) => `$${i + 2}`).join(",");
      await db.query(
        `UPDATE stores SET canonical_store_id = $1, updated_at = now()
         WHERE id IN (${placeholders})`,
        [canonId, ...dupIds],
      );
      duplicatesMarked += dupIds.length;
    }

    prefsProcessed++;
    if (prefsProcessed % 10 === 0) {
      console.info(`[dedupe] ${prefsProcessed}/${PREFECTURES.length} prefectures done`);
    }
  }

  const result: DedupeResult = {
    prefecturesProcessed: prefsProcessed,
    groupsFound,
    duplicatesMarked,
  };
  console.info(`[dedupe] Done:`, JSON.stringify(result));
  return result;
}
