/**
 * lib/stores/dedupe.ts
 *
 * 同一店舗の重複検出ロジック。
 *
 * OSM では node / way / relation で同じ店舗が二重登録されるケースがある。
 * 「正規化した店名が類似」かつ「距離が 50m 以内」でグルーピングし、
 * 代表（canonical）を1つ選ぶ。
 */

/* ── 距離計算（Haversine） ── */
const R = 6_371_000; // 地球半径 [m]

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── 店名正規化 ── */
const NOISE_SUFFIXES = [
  "本店",
  "駅前店",
  "南口店",
  "北口店",
  "東口店",
  "西口店",
  "新館",
  "本館",
  "別館",
];

// 全角→半角、空白除去、一般的な接尾辞の除去
export function normalizeName(raw: string): string {
  let s = raw;

  // 全角英数 → 半角
  s = s.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0),
  );

  // 全角カナ → そのまま（表記ゆれ吸収はしない）
  // ただし長音「ー」と「-」を統一
  s = s.replace(/[‐－–—―]/g, "-");
  s = s.replace(/ー/g, "-");

  // 空白除去
  s = s.replace(/[\s\u3000]+/g, "");

  // 一般的な業態接尾辞を除去
  s = s.replace(/(パチンコ|スロット|パーラー|ホール|SLOT|PACHINKO)/gi, "");

  // 店名末尾の「店」を除去（ただし「○○店」パターンを丸ごと）
  for (const suf of NOISE_SUFFIXES) {
    if (s.endsWith(suf)) {
      s = s.slice(0, -suf.length);
    }
  }

  // 小文字化
  s = s.toLowerCase();

  return s;
}

/* ── ストア型（DB行のサブセット） ── */
export interface DedupeStore {
  id: string;
  external_id: string | null;
  name: string;
  lat: number | null;
  lng: number | null;
  prefecture: string;
  address: string | null;
  website?: string | null;
  created_at: string | Date;
}

/* ── グルーピング ── */
export interface DedupeGroup {
  canonical: DedupeStore;
  duplicates: DedupeStore[];
}

/**
 * 店舗を名前 + 距離でグルーピング。
 * 1つの県内で完結する想定。
 *
 * @param stores - 同一県の source='osm' かつ canonical_store_id IS NULL の全店舗
 * @param distThreshold - メートル（デフォルト 50m）
 * @returns グループ配列（duplicates が空でないもののみ）
 */
export function findDuplicateGroups(
  stores: DedupeStore[],
  distThreshold = 50,
): DedupeGroup[] {
  // 正規化名でバケット
  const buckets = new Map<string, DedupeStore[]>();
  for (const s of stores) {
    const key = normalizeName(s.name);
    if (!key) continue;
    let list = buckets.get(key);
    if (!list) {
      list = [];
      buckets.set(key, list);
    }
    list.push(s);
  }

  const groups: DedupeGroup[] = [];

  for (const [, bucket] of buckets) {
    if (bucket.length < 2) continue;

    // さらに距離でクラスタリング（Union-Find ライク）
    const parent = new Map<string, string>();
    const find = (id: string): string => {
      let root = id;
      while (parent.get(root) !== root) root = parent.get(root)!;
      // path compression
      let cur = id;
      while (cur !== root) {
        const next = parent.get(cur)!;
        parent.set(cur, root);
        cur = next;
      }
      return root;
    };
    const union = (a: string, b: string) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent.set(rb, ra);
    };

    for (const s of bucket) parent.set(s.id, s.id);

    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        const a = bucket[i];
        const b = bucket[j];
        if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) {
          // 座標なし → 名前一致だけではマージしない（安全策）
          continue;
        }
        const dist = haversineMeters(a.lat, a.lng, b.lat, b.lng);
        if (dist <= distThreshold) {
          union(a.id, b.id);
        }
      }
    }

    // クラスタ集約
    const clusters = new Map<string, DedupeStore[]>();
    for (const s of bucket) {
      const root = find(s.id);
      let list = clusters.get(root);
      if (!list) {
        list = [];
        clusters.set(root, list);
      }
      list.push(s);
    }

    for (const [, cluster] of clusters) {
      if (cluster.length < 2) continue;

      // 代表を選定
      const sorted = [...cluster].sort((a, b) => {
        // 1) external_id が way/relation > node（情報が多い傾向）
        const typeOrder = (eid: string | null) => {
          if (!eid) return 9;
          if (eid.startsWith("osm:w")) return 0; // way
          if (eid.startsWith("osm:r")) return 1; // relation
          if (eid.startsWith("osm:n")) return 2; // node
          return 5;
        };
        const ta = typeOrder(a.external_id);
        const tb = typeOrder(b.external_id);
        if (ta !== tb) return ta - tb;

        // 2) address あり > なし
        const aa = a.address ? 0 : 1;
        const ab = b.address ? 0 : 1;
        if (aa !== ab) return aa - ab;

        // 3) created_at が古い方を優先
        const ca = typeof a.created_at === "string" ? a.created_at : a.created_at.toISOString();
        const cb = typeof b.created_at === "string" ? b.created_at : b.created_at.toISOString();
        return ca.localeCompare(cb);
      });

      const canonical = sorted[0];
      const duplicates = sorted.slice(1);
      groups.push({ canonical, duplicates });
    }
  }

  return groups;
}
