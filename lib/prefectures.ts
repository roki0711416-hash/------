/**
 * lib/prefectures.ts
 *
 * 47都道府県マスタ。slug（URL用英字）と表示名（日本語）を持つ。
 */

export const REGION_ORDER = [
  "hokkaido_tohoku",
  "kanto",
  "chubu",
  "kinki",
  "chugoku",
  "shikoku",
  "kyushu_okinawa",
] as const;

export type RegionKey = (typeof REGION_ORDER)[number];

export interface RegionDef {
  key: RegionKey;
  label: string;
}

export const REGION_DEFS: RegionDef[] = [
  { key: "hokkaido_tohoku", label: "北海道・東北" },
  { key: "kanto", label: "関東" },
  { key: "chubu", label: "中部" },
  { key: "kinki", label: "近畿" },
  { key: "chugoku", label: "中国" },
  { key: "shikoku", label: "四国" },
  { key: "kyushu_okinawa", label: "九州・沖縄" },
];

const REGION_LABEL_MAP = new Map<RegionKey, string>(REGION_DEFS.map((r) => [r.key, r.label]));

export interface Prefecture {
  /** URL用英字スラッグ（例: tokyo） */
  slug: string;
  /** 日本語表示名（例: 東京都） */
  name: string;
  /** 地方区分 */
  region: RegionKey;
}

export const PREFECTURES: Prefecture[] = [
  // 北海道・東北
  { slug: "hokkaido", name: "北海道", region: "hokkaido_tohoku" },
  { slug: "aomori", name: "青森県", region: "hokkaido_tohoku" },
  { slug: "iwate", name: "岩手県", region: "hokkaido_tohoku" },
  { slug: "miyagi", name: "宮城県", region: "hokkaido_tohoku" },
  { slug: "akita", name: "秋田県", region: "hokkaido_tohoku" },
  { slug: "yamagata", name: "山形県", region: "hokkaido_tohoku" },
  { slug: "fukushima", name: "福島県", region: "hokkaido_tohoku" },
  // 関東
  { slug: "ibaraki", name: "茨城県", region: "kanto" },
  { slug: "tochigi", name: "栃木県", region: "kanto" },
  { slug: "gunma", name: "群馬県", region: "kanto" },
  { slug: "saitama", name: "埼玉県", region: "kanto" },
  { slug: "chiba", name: "千葉県", region: "kanto" },
  { slug: "tokyo", name: "東京都", region: "kanto" },
  { slug: "kanagawa", name: "神奈川県", region: "kanto" },
  // 中部
  { slug: "niigata", name: "新潟県", region: "chubu" },
  { slug: "toyama", name: "富山県", region: "chubu" },
  { slug: "ishikawa", name: "石川県", region: "chubu" },
  { slug: "fukui", name: "福井県", region: "chubu" },
  { slug: "yamanashi", name: "山梨県", region: "chubu" },
  { slug: "nagano", name: "長野県", region: "chubu" },
  { slug: "gifu", name: "岐阜県", region: "chubu" },
  { slug: "shizuoka", name: "静岡県", region: "chubu" },
  { slug: "aichi", name: "愛知県", region: "chubu" },
  // 近畿
  { slug: "mie", name: "三重県", region: "kinki" },
  { slug: "shiga", name: "滋賀県", region: "kinki" },
  { slug: "kyoto", name: "京都府", region: "kinki" },
  { slug: "osaka", name: "大阪府", region: "kinki" },
  { slug: "hyogo", name: "兵庫県", region: "kinki" },
  { slug: "nara", name: "奈良県", region: "kinki" },
  { slug: "wakayama", name: "和歌山県", region: "kinki" },
  // 中国
  { slug: "tottori", name: "鳥取県", region: "chugoku" },
  { slug: "shimane", name: "島根県", region: "chugoku" },
  { slug: "okayama", name: "岡山県", region: "chugoku" },
  { slug: "hiroshima", name: "広島県", region: "chugoku" },
  { slug: "yamaguchi", name: "山口県", region: "chugoku" },
  // 四国
  { slug: "tokushima", name: "徳島県", region: "shikoku" },
  { slug: "kagawa", name: "香川県", region: "shikoku" },
  { slug: "ehime", name: "愛媛県", region: "shikoku" },
  { slug: "kochi", name: "高知県", region: "shikoku" },
  // 九州・沖縄
  { slug: "fukuoka", name: "福岡県", region: "kyushu_okinawa" },
  { slug: "saga", name: "佐賀県", region: "kyushu_okinawa" },
  { slug: "nagasaki", name: "長崎県", region: "kyushu_okinawa" },
  { slug: "kumamoto", name: "熊本県", region: "kyushu_okinawa" },
  { slug: "oita", name: "大分県", region: "kyushu_okinawa" },
  { slug: "miyazaki", name: "宮崎県", region: "kyushu_okinawa" },
  { slug: "kagoshima", name: "鹿児島県", region: "kyushu_okinawa" },
  { slug: "okinawa", name: "沖縄県", region: "kyushu_okinawa" },
];

/** slug → Prefecture のルックアップ（O(1)） */
const slugMap = new Map(PREFECTURES.map((p) => [p.slug, p]));

/** slug からPrefectureを取得。不正slugはundefined */
export function getPrefectureBySlug(slug: string): Prefecture | undefined {
  return slugMap.get(slug);
}

/** 全slugの配列（generateStaticParams用） */
export function getAllPrefectureSlugs(): string[] {
  return PREFECTURES.map((p) => p.slug);
}

/** 地方キーの表示名 */
export function getRegionLabel(region: RegionKey): string {
  return REGION_LABEL_MAP.get(region) ?? region;
}

/** 地方ごとにグルーピング */
export function getPrefecturesByRegion(): { region: RegionKey; label: string; prefs: Prefecture[] }[] {
  const grouped = new Map<RegionKey, Prefecture[]>();
  for (const p of PREFECTURES) {
    const arr = grouped.get(p.region) ?? [];
    arr.push(p);
    grouped.set(p.region, arr);
  }
  return REGION_ORDER.map((r) => ({ region: r, label: getRegionLabel(r), prefs: grouped.get(r) ?? [] }));
}
