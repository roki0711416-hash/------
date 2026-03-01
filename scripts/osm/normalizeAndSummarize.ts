/**
 * scripts/osm/normalizeAndSummarize.ts
 *
 * data/osm/pachinko_raw.json を読み込み、正規化して集計する。
 *
 * 出力:
 *   data/osm/pachinko_normalized.json
 *   data/osm/prefecture_counts.csv
 *   data/osm/prefecture_counts.json
 *   data/osm/unmapped_prefecture.csv
 *   data/osm/missing_name.csv
 *
 * 実行: npx tsx scripts/osm/normalizeAndSummarize.ts
 */

import fs from "fs";
import path from "path";

/* ── 都道府県マスタ（lib/prefectures.ts と同じデータ） ── */
const PREFECTURES: { slug: string; name: string }[] = [
  { slug: "hokkaido", name: "北海道" },
  { slug: "aomori", name: "青森県" },
  { slug: "iwate", name: "岩手県" },
  { slug: "miyagi", name: "宮城県" },
  { slug: "akita", name: "秋田県" },
  { slug: "yamagata", name: "山形県" },
  { slug: "fukushima", name: "福島県" },
  { slug: "ibaraki", name: "茨城県" },
  { slug: "tochigi", name: "栃木県" },
  { slug: "gunma", name: "群馬県" },
  { slug: "saitama", name: "埼玉県" },
  { slug: "chiba", name: "千葉県" },
  { slug: "tokyo", name: "東京都" },
  { slug: "kanagawa", name: "神奈川県" },
  { slug: "niigata", name: "新潟県" },
  { slug: "toyama", name: "富山県" },
  { slug: "ishikawa", name: "石川県" },
  { slug: "fukui", name: "福井県" },
  { slug: "yamanashi", name: "山梨県" },
  { slug: "nagano", name: "長野県" },
  { slug: "gifu", name: "岐阜県" },
  { slug: "shizuoka", name: "静岡県" },
  { slug: "aichi", name: "愛知県" },
  { slug: "mie", name: "三重県" },
  { slug: "shiga", name: "滋賀県" },
  { slug: "kyoto", name: "京都府" },
  { slug: "osaka", name: "大阪府" },
  { slug: "hyogo", name: "兵庫県" },
  { slug: "nara", name: "奈良県" },
  { slug: "wakayama", name: "和歌山県" },
  { slug: "tottori", name: "鳥取県" },
  { slug: "shimane", name: "島根県" },
  { slug: "okayama", name: "岡山県" },
  { slug: "hiroshima", name: "広島県" },
  { slug: "yamaguchi", name: "山口県" },
  { slug: "tokushima", name: "徳島県" },
  { slug: "kagawa", name: "香川県" },
  { slug: "ehime", name: "愛媛県" },
  { slug: "kochi", name: "高知県" },
  { slug: "fukuoka", name: "福岡県" },
  { slug: "saga", name: "佐賀県" },
  { slug: "nagasaki", name: "長崎県" },
  { slug: "kumamoto", name: "熊本県" },
  { slug: "oita", name: "大分県" },
  { slug: "miyazaki", name: "宮崎県" },
  { slug: "kagoshima", name: "鹿児島県" },
  { slug: "okinawa", name: "沖縄県" },
];

const nameToSlug = new Map<string, string>(PREFECTURES.map((p) => [p.name, p.slug]));

/* ── 都道府県 バウンディングボックス（lat/lng → 都道府県推定用） ── */
// 各都道府県の大まかな緯度経度範囲。重複エリアは後で最近接で判定。
interface BBox { slug: string; latMin: number; latMax: number; lngMin: number; lngMax: number; cLat: number; cLng: number }
const PREF_BBOXES: BBox[] = [
  { slug: "hokkaido",  latMin: 41.3, latMax: 45.6, lngMin: 139.3, lngMax: 145.9, cLat: 43.06, cLng: 141.35 },
  { slug: "aomori",    latMin: 40.2, latMax: 41.6, lngMin: 139.4, lngMax: 141.7, cLat: 40.82, cLng: 140.74 },
  { slug: "iwate",     latMin: 38.7, latMax: 40.4, lngMin: 140.6, lngMax: 142.1, cLat: 39.70, cLng: 141.15 },
  { slug: "miyagi",    latMin: 37.8, latMax: 39.0, lngMin: 140.2, lngMax: 141.7, cLat: 38.27, cLng: 140.87 },
  { slug: "akita",     latMin: 39.0, latMax: 40.5, lngMin: 139.7, lngMax: 140.9, cLat: 39.72, cLng: 140.10 },
  { slug: "yamagata",  latMin: 37.7, latMax: 39.2, lngMin: 139.5, lngMax: 140.6, cLat: 38.24, cLng: 140.34 },
  { slug: "fukushima", latMin: 36.8, latMax: 37.9, lngMin: 139.2, lngMax: 141.0, cLat: 37.75, cLng: 140.47 },
  { slug: "ibaraki",   latMin: 35.7, latMax: 36.9, lngMin: 139.7, lngMax: 140.9, cLat: 36.34, cLng: 140.45 },
  { slug: "tochigi",   latMin: 36.2, latMax: 37.1, lngMin: 139.3, lngMax: 140.3, cLat: 36.57, cLng: 139.88 },
  { slug: "gunma",     latMin: 36.0, latMax: 37.1, lngMin: 138.5, lngMax: 139.7, cLat: 36.39, cLng: 139.06 },
  { slug: "saitama",   latMin: 35.7, latMax: 36.3, lngMin: 138.9, lngMax: 139.9, cLat: 35.86, cLng: 139.65 },
  { slug: "chiba",     latMin: 34.9, latMax: 36.0, lngMin: 139.7, lngMax: 140.9, cLat: 35.60, cLng: 140.12 },
  { slug: "tokyo",     latMin: 35.5, latMax: 35.9, lngMin: 138.9, lngMax: 139.9, cLat: 35.68, cLng: 139.69 },
  { slug: "kanagawa",  latMin: 35.1, latMax: 35.7, lngMin: 138.9, lngMax: 139.8, cLat: 35.45, cLng: 139.64 },
  { slug: "niigata",   latMin: 36.7, latMax: 38.6, lngMin: 137.8, lngMax: 140.0, cLat: 37.90, cLng: 139.02 },
  { slug: "toyama",    latMin: 36.2, latMax: 36.9, lngMin: 136.7, lngMax: 137.8, cLat: 36.70, cLng: 137.21 },
  { slug: "ishikawa",  latMin: 36.1, latMax: 37.9, lngMin: 136.2, lngMax: 137.4, cLat: 36.59, cLng: 136.63 },
  { slug: "fukui",     latMin: 35.5, latMax: 36.3, lngMin: 135.5, lngMax: 136.8, cLat: 36.07, cLng: 136.22 },
  { slug: "yamanashi", latMin: 35.2, latMax: 35.9, lngMin: 138.2, lngMax: 139.1, cLat: 35.66, cLng: 138.57 },
  { slug: "nagano",    latMin: 35.2, latMax: 37.0, lngMin: 137.5, lngMax: 138.7, cLat: 36.23, cLng: 138.18 },
  { slug: "gifu",      latMin: 35.1, latMax: 36.5, lngMin: 136.3, lngMax: 137.7, cLat: 35.39, cLng: 136.72 },
  { slug: "shizuoka",  latMin: 34.6, latMax: 35.6, lngMin: 137.5, lngMax: 139.2, cLat: 34.98, cLng: 138.38 },
  { slug: "aichi",     latMin: 34.6, latMax: 35.4, lngMin: 136.7, lngMax: 137.8, cLat: 35.18, cLng: 136.91 },
  { slug: "mie",       latMin: 33.7, latMax: 35.2, lngMin: 135.9, lngMax: 137.0, cLat: 34.73, cLng: 136.51 },
  { slug: "shiga",     latMin: 34.8, latMax: 35.6, lngMin: 135.8, lngMax: 136.5, cLat: 35.00, cLng: 136.07 },
  { slug: "kyoto",     latMin: 34.7, latMax: 35.8, lngMin: 134.8, lngMax: 136.1, cLat: 35.02, cLng: 135.76 },
  { slug: "osaka",     latMin: 34.3, latMax: 34.9, lngMin: 135.1, lngMax: 135.8, cLat: 34.69, cLng: 135.50 },
  { slug: "hyogo",     latMin: 34.2, latMax: 35.7, lngMin: 134.2, lngMax: 135.5, cLat: 34.69, cLng: 135.18 },
  { slug: "nara",      latMin: 34.0, latMax: 34.8, lngMin: 135.5, lngMax: 136.2, cLat: 34.69, cLng: 135.83 },
  { slug: "wakayama",  latMin: 33.4, latMax: 34.4, lngMin: 135.0, lngMax: 136.0, cLat: 34.23, cLng: 135.17 },
  { slug: "tottori",   latMin: 35.0, latMax: 35.6, lngMin: 133.2, lngMax: 134.5, cLat: 35.50, cLng: 134.24 },
  { slug: "shimane",   latMin: 34.3, latMax: 35.6, lngMin: 131.7, lngMax: 133.4, cLat: 35.47, cLng: 132.77 },
  { slug: "okayama",   latMin: 34.4, latMax: 35.3, lngMin: 133.4, lngMax: 134.4, cLat: 34.66, cLng: 133.93 },
  { slug: "hiroshima", latMin: 34.0, latMax: 35.0, lngMin: 132.0, lngMax: 133.5, cLat: 34.40, cLng: 132.46 },
  { slug: "yamaguchi", latMin: 33.7, latMax: 34.8, lngMin: 130.8, lngMax: 132.2, cLat: 34.19, cLng: 131.47 },
  { slug: "tokushima", latMin: 33.5, latMax: 34.3, lngMin: 133.6, lngMax: 134.8, cLat: 34.07, cLng: 134.56 },
  { slug: "kagawa",    latMin: 34.1, latMax: 34.5, lngMin: 133.5, lngMax: 134.5, cLat: 34.34, cLng: 134.04 },
  { slug: "ehime",     latMin: 33.0, latMax: 34.2, lngMin: 132.0, lngMax: 133.7, cLat: 33.84, cLng: 132.77 },
  { slug: "kochi",     latMin: 32.7, latMax: 33.9, lngMin: 132.5, lngMax: 134.3, cLat: 33.56, cLng: 133.53 },
  { slug: "fukuoka",   latMin: 33.0, latMax: 34.3, lngMin: 130.0, lngMax: 131.2, cLat: 33.61, cLng: 130.42 },
  { slug: "saga",      latMin: 33.0, latMax: 33.6, lngMin: 129.7, lngMax: 130.5, cLat: 33.25, cLng: 130.30 },
  { slug: "nagasaki",  latMin: 32.5, latMax: 34.7, lngMin: 128.6, lngMax: 130.4, cLat: 32.74, cLng: 129.87 },
  { slug: "kumamoto",  latMin: 32.1, latMax: 33.2, lngMin: 130.1, lngMax: 131.3, cLat: 32.79, cLng: 130.74 },
  { slug: "oita",      latMin: 32.7, latMax: 33.8, lngMin: 130.8, lngMax: 132.1, cLat: 33.24, cLng: 131.61 },
  { slug: "miyazaki",  latMin: 31.4, latMax: 32.8, lngMin: 130.7, lngMax: 131.9, cLat: 31.91, cLng: 131.42 },
  { slug: "kagoshima", latMin: 27.0, latMax: 32.1, lngMin: 128.4, lngMax: 131.3, cLat: 31.56, cLng: 130.56 },
  { slug: "okinawa",   latMin: 24.0, latMax: 27.9, lngMin: 122.9, lngMax: 131.3, cLat: 26.34, cLng: 127.80 },
];

/**
 * lat/lng から最も近い都道府県を推定する。
 * まずバウンディングボックスでフィルタし、複数候補があれば中心への距離で判定。
 */
function guessPrefByCoords(lat: number, lng: number): string | null {
  if (lat === 0 && lng === 0) return null;

  // BBox候補
  const candidates = PREF_BBOXES.filter(
    (b) => lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax,
  );
  if (candidates.length === 1) return candidates[0].slug;
  if (candidates.length > 1) {
    // 中心への距離で最近接
    let best = candidates[0];
    let bestDist = Infinity;
    for (const c of candidates) {
      const d = (lat - c.cLat) ** 2 + (lng - c.cLng) ** 2;
      if (d < bestDist) { bestDist = d; best = c; }
    }
    return best.slug;
  }

  // BBoxに収まらない場合、全県で最近接
  let best = PREF_BBOXES[0];
  let bestDist = Infinity;
  for (const b of PREF_BBOXES) {
    const d = (lat - b.cLat) ** 2 + (lng - b.cLng) ** 2;
    if (d < bestDist) { bestDist = d; best = b; }
  }
  // 遠すぎたら不明（海外データの可能性）
  if (bestDist > 25) return null; // 約5度以上離れている
  return best.slug;
}

const slugToName = new Map(PREFECTURES.map((p) => [p.slug, p.name]));

/* ── 都道府県推定 ── */
const PREF_REGEX = /(北海道|.{2,3}[都道府県])/;

function guessPrefecture(
  tags: Record<string, string>,
  lat: number,
  lng: number,
): { name: string | null; slug: string | null; method: string } {
  // 1) addr:prefecture タグ
  const addrPref = tags["addr:prefecture"];
  if (addrPref) {
    const slug = nameToSlug.get(addrPref) ?? null;
    return { name: addrPref, slug, method: "addr:prefecture" };
  }

  // 2) addr:province タグ（OSM日本データに多い）
  const addrProv = tags["addr:province"];
  if (addrProv) {
    // そのまま or 正規表現で都道府県名を抽出
    const direct = nameToSlug.get(addrProv);
    if (direct) return { name: addrProv, slug: direct, method: "addr:province" };
    const mp = addrProv.match(PREF_REGEX);
    if (mp) {
      const name = mp[1];
      const slug = nameToSlug.get(name) ?? null;
      return { name, slug, method: "addr:province" };
    }
  }

  // 3) addr:full / addr:street から正規表現で抽出
  const full = tags["addr:full"] || tags["addr:street"] || "";
  const m = full.match(PREF_REGEX);
  if (m) {
    const name = m[1];
    const slug = nameToSlug.get(name) ?? null;
    return { name, slug, method: "addr:full" };
  }

  // 4) lat/lng から都道府県推定（バウンディングボックス＋最近接）
  const coordSlug = guessPrefByCoords(lat, lng);
  if (coordSlug) {
    const name = slugToName.get(coordSlug) ?? null;
    return { name, slug: coordSlug, method: "coords" };
  }

  return { name: null, slug: null, method: "none" };
}

/* ── 座標取得 ── */
interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function getCoords(el: OsmElement): { lat: number; lng: number } {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lng: el.lon };
  if (el.center) return { lat: el.center.lat, lng: el.center.lon };
  return { lat: 0, lng: 0 };
}

function osmUrl(el: OsmElement): string {
  const typeMap: Record<string, string> = { node: "node", way: "way", relation: "relation" };
  return `https://www.openstreetmap.org/${typeMap[el.type] ?? el.type}/${el.id}`;
}

/* ── 正規化レコード型 ── */
interface NormalizedStore {
  externalId: string;
  name: string | null;
  lat: number;
  lng: number;
  prefectureName: string | null;
  prefectureSlug: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  phone: string | null;
  sourceUrl: string;
  isClosed: boolean;
}

/* ── 閉店判定（OSMタグ） ── */
function isClosedByTags(tags: Record<string, string>): boolean {
  // disused: / abandoned: / was: プレフィックス付きタグ
  if (tags["disused"] === "yes" || tags["abandoned"] === "yes") return true;
  if (tags["closed"] === "yes") return true;
  // disused:leisure=adult_gaming_centre — 旧パチンコ店
  if (tags["disused:leisure"] === "adult_gaming_centre") return true;
  if (tags["was:leisure"] === "adult_gaming_centre") return true;
  if (tags["abandoned:leisure"] === "adult_gaming_centre") return true;
  // disused:amenity / was:amenity
  if (tags["disused:amenity"] || tags["was:amenity"] || tags["abandoned:amenity"]) return true;
  // end_date が設定されている場合も閉店とみなす
  if (tags["end_date"]) return true;
  return false;
}

/* ── CSV エスケープ ── */
function esc(s: string | null | undefined): string {
  if (s == null) return "";
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/* ── メイン ── */
function main() {
  const dataDir = path.join(process.cwd(), "data", "osm");
  const rawPath = path.join(dataDir, "pachinko_raw.json");

  if (!fs.existsSync(rawPath)) {
    console.error(`[normalize] Not found: ${rawPath}`);
    console.error("Run 'npx tsx scripts/fetchOsmPachinko.ts' first.");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(rawPath, "utf-8")) as {
    elements?: OsmElement[];
  };
  const elements = raw.elements ?? [];
  console.log(`[normalize] ${elements.length} raw elements loaded.`);

  // 重複除去（同じ type+id）
  const seen = new Set<string>();
  const unique: OsmElement[] = [];
  for (const el of elements) {
    const key = `${el.type}:${el.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(el);
    }
  }
  console.log(`[normalize] ${unique.length} unique elements (${elements.length - unique.length} duplicates removed).`);

  const normalized: NormalizedStore[] = [];
  const unmapped: NormalizedStore[] = [];
  const missingName: NormalizedStore[] = [];
  const methodStats = new Map<string, number>();

  for (const el of unique) {
    const tags = el.tags ?? {};
    const coords = getCoords(el);
    const pref = guessPrefecture(tags, coords.lat, coords.lng);

    methodStats.set(pref.method, (methodStats.get(pref.method) ?? 0) + 1);

    const rec: NormalizedStore = {
      externalId: `osm:${el.type[0]}${el.id}`,
      name: tags.name ?? null,
      lat: coords.lat,
      lng: coords.lng,
      prefectureName: pref.name,
      prefectureSlug: pref.slug,
      city: tags["addr:city"] ?? null,
      address: tags["addr:full"] ?? tags["addr:street"] ?? null,
      website: tags.website ?? tags["contact:website"] ?? null,
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      sourceUrl: osmUrl(el),
      isClosed: isClosedByTags(tags),
    };

    normalized.push(rec);
    if (!rec.prefectureSlug) unmapped.push(rec);
    if (!rec.name) missingName.push(rec);
  }

  // 集計
  const counts = new Map<string, number>();
  for (const r of normalized) {
    const key = r.prefectureSlug ?? "__unmapped__";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // ソート（件数降順）
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  // ── 出力 ──
  // 1) pachinko_normalized.json
  fs.writeFileSync(
    path.join(dataDir, "pachinko_normalized.json"),
    JSON.stringify(normalized, null, 2),
    "utf-8",
  );

  // 2) prefecture_counts.json
  const countsObj: Record<string, number> = {};
  for (const [slug, c] of sorted) countsObj[slug] = c;
  fs.writeFileSync(
    path.join(dataDir, "prefecture_counts.json"),
    JSON.stringify(countsObj, null, 2),
    "utf-8",
  );

  // 3) prefecture_counts.csv
  const csvLines = ["prefecture_slug,prefecture_name,count"];
  for (const [slug, c] of sorted) {
    const name = slug === "__unmapped__"
      ? "(不明)"
      : PREFECTURES.find((p) => p.slug === slug)?.name ?? slug;
    csvLines.push(`${slug},${esc(name)},${c}`);
  }
  fs.writeFileSync(
    path.join(dataDir, "prefecture_counts.csv"),
    csvLines.join("\n") + "\n",
    "utf-8",
  );

  // 4) unmapped_prefecture.csv
  const unmappedCsv = [
    "externalId,name,lat,lng,address,sourceUrl",
    ...unmapped.map(
      (r) => [esc(r.externalId), esc(r.name), r.lat, r.lng, esc(r.address), esc(r.sourceUrl)].join(","),
    ),
  ];
  fs.writeFileSync(
    path.join(dataDir, "unmapped_prefecture.csv"),
    unmappedCsv.join("\n") + "\n",
    "utf-8",
  );

  // 5) missing_name.csv
  const missingCsv = [
    "externalId,lat,lng,prefectureSlug,address,sourceUrl",
    ...missingName.map(
      (r) =>
        [esc(r.externalId), r.lat, r.lng, esc(r.prefectureSlug), esc(r.address), esc(r.sourceUrl)].join(","),
    ),
  ];
  fs.writeFileSync(
    path.join(dataDir, "missing_name.csv"),
    missingCsv.join("\n") + "\n",
    "utf-8",
  );

  // ── ログ ──
  const total = normalized.length;
  const unmappedCount = unmapped.length;
  const missingCount = missingName.length;
  console.log(`\n[normalize] Results:`);
  console.log(`  Total:     ${total}`);
  console.log(`  Unmapped:  ${unmappedCount}`);
  console.log(`  No name:   ${missingCount}`);
  console.log(`\n  推定方法の内訳:`);
  for (const [method, cnt] of [...methodStats.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${method.padEnd(16)}: ${cnt}`);
  }
  console.log(`\n  都道府県別 件数:`);
  for (const [slug, c] of sorted) {
    const label = slug === "__unmapped__"
      ? "(不明)"
      : PREFECTURES.find((p) => p.slug === slug)?.name ?? slug;
    console.log(`    ${label.padEnd(6)}: ${c}`);
  }
  console.log(`\n[normalize] Files written to ${dataDir}`);
}

main();
