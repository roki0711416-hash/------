/**
 * lib/prefectures.ts
 *
 * 47都道府県マスタ。slug（URL用英字）と表示名（日本語）を持つ。
 */

export interface Prefecture {
  /** URL用英字スラッグ（例: tokyo） */
  slug: string;
  /** 日本語表示名（例: 東京都） */
  name: string;
  /** 地方区分 */
  region: string;
}

export const PREFECTURES: Prefecture[] = [
  // 北海道・東北
  { slug: "hokkaido", name: "北海道", region: "北海道・東北" },
  { slug: "aomori", name: "青森県", region: "北海道・東北" },
  { slug: "iwate", name: "岩手県", region: "北海道・東北" },
  { slug: "miyagi", name: "宮城県", region: "北海道・東北" },
  { slug: "akita", name: "秋田県", region: "北海道・東北" },
  { slug: "yamagata", name: "山形県", region: "北海道・東北" },
  { slug: "fukushima", name: "福島県", region: "北海道・東北" },
  // 関東
  { slug: "ibaraki", name: "茨城県", region: "関東" },
  { slug: "tochigi", name: "栃木県", region: "関東" },
  { slug: "gunma", name: "群馬県", region: "関東" },
  { slug: "saitama", name: "埼玉県", region: "関東" },
  { slug: "chiba", name: "千葉県", region: "関東" },
  { slug: "tokyo", name: "東京都", region: "関東" },
  { slug: "kanagawa", name: "神奈川県", region: "関東" },
  // 中部
  { slug: "niigata", name: "新潟県", region: "中部" },
  { slug: "toyama", name: "富山県", region: "中部" },
  { slug: "ishikawa", name: "石川県", region: "中部" },
  { slug: "fukui", name: "福井県", region: "中部" },
  { slug: "yamanashi", name: "山梨県", region: "中部" },
  { slug: "nagano", name: "長野県", region: "中部" },
  { slug: "gifu", name: "岐阜県", region: "中部" },
  { slug: "shizuoka", name: "静岡県", region: "中部" },
  { slug: "aichi", name: "愛知県", region: "中部" },
  // 近畿
  { slug: "mie", name: "三重県", region: "近畿" },
  { slug: "shiga", name: "滋賀県", region: "近畿" },
  { slug: "kyoto", name: "京都府", region: "近畿" },
  { slug: "osaka", name: "大阪府", region: "近畿" },
  { slug: "hyogo", name: "兵庫県", region: "近畿" },
  { slug: "nara", name: "奈良県", region: "近畿" },
  { slug: "wakayama", name: "和歌山県", region: "近畿" },
  // 中国
  { slug: "tottori", name: "鳥取県", region: "中国" },
  { slug: "shimane", name: "島根県", region: "中国" },
  { slug: "okayama", name: "岡山県", region: "中国" },
  { slug: "hiroshima", name: "広島県", region: "中国" },
  { slug: "yamaguchi", name: "山口県", region: "中国" },
  // 四国
  { slug: "tokushima", name: "徳島県", region: "四国" },
  { slug: "kagawa", name: "香川県", region: "四国" },
  { slug: "ehime", name: "愛媛県", region: "四国" },
  { slug: "kochi", name: "高知県", region: "四国" },
  // 九州・沖縄
  { slug: "fukuoka", name: "福岡県", region: "九州・沖縄" },
  { slug: "saga", name: "佐賀県", region: "九州・沖縄" },
  { slug: "nagasaki", name: "長崎県", region: "九州・沖縄" },
  { slug: "kumamoto", name: "熊本県", region: "九州・沖縄" },
  { slug: "oita", name: "大分県", region: "九州・沖縄" },
  { slug: "miyazaki", name: "宮崎県", region: "九州・沖縄" },
  { slug: "kagoshima", name: "鹿児島県", region: "九州・沖縄" },
  { slug: "okinawa", name: "沖縄県", region: "九州・沖縄" },
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

/** 地方ごとにグルーピング */
export function getPrefecturesByRegion(): { region: string; prefs: Prefecture[] }[] {
  const regionOrder = [
    "北海道・東北",
    "関東",
    "中部",
    "近畿",
    "中国",
    "四国",
    "九州・沖縄",
  ];
  const grouped = new Map<string, Prefecture[]>();
  for (const p of PREFECTURES) {
    const arr = grouped.get(p.region) ?? [];
    arr.push(p);
    grouped.set(p.region, arr);
  }
  return regionOrder.map((r) => ({ region: r, prefs: grouped.get(r) ?? [] }));
}
