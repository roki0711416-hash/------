/**
 * lib/stores/mockStores.ts
 *
 * DB接続なしでも動作する仮店舗データ。
 * 後でDB実装に差し替える前提。
 */

export interface MockStore {
  id: string;
  name: string;
  /** lib/prefectures.ts の slug と対応 */
  prefSlug: string;
  city: string;
  address: string;
}

/**
 * 各県に割り当てるダミー店舗（10件）。
 * prefSlug を "tokyo" 固定ではなく呼び出し時に差し替えて使う。
 */
const BASE_STORES: Omit<MockStore, "prefSlug">[] = [
  { id: "store-001", name: "サンプルホール駅前店", city: "中央区", address: "1-1-1" },
  { id: "store-002", name: "サンプルホール南口店", city: "南区", address: "2-3-4" },
  { id: "store-003", name: "グランドパーラー本店", city: "北区", address: "3-5-6" },
  { id: "store-004", name: "スロットプラザ東口店", city: "東区", address: "4-7-8" },
  { id: "store-005", name: "パチンコワールド西店", city: "西区", address: "5-9-0" },
  { id: "store-006", name: "ジャンボホール中央店", city: "中央区", address: "6-1-2" },
  { id: "store-007", name: "メガスロット港店", city: "港区", address: "7-3-4" },
  { id: "store-008", name: "ラッキープラザ桜通店", city: "花見区", address: "8-5-6" },
  { id: "store-009", name: "ゴールドホール松風店", city: "松風町", address: "9-7-8" },
  { id: "store-010", name: "ドリームパーラー海岸店", city: "海岸区", address: "10-9-0" },
];

/**
 * 指定 prefSlug のダミー店舗一覧を返す。
 * id に prefSlug を含めてユニークにする。
 */
export function getMockStoresByPref(prefSlug: string): MockStore[] {
  return BASE_STORES.map((s) => ({
    ...s,
    id: `${prefSlug}-${s.id}`,
    prefSlug,
  }));
}

/**
 * storeId からダミー店舗を検索。
 * storeId の先頭が prefSlug になっている前提。
 */
export function getMockStoreById(storeId: string): MockStore | undefined {
  // storeId = "tokyo-store-001" → prefSlug="tokyo", baseId="store-001"
  const parts = storeId.split("-");
  if (parts.length < 3) return undefined;
  const prefSlug = parts[0];
  const baseId = parts.slice(1).join("-");
  const base = BASE_STORES.find((s) => s.id === baseId);
  if (!base) return undefined;
  return { ...base, id: storeId, prefSlug };
}
