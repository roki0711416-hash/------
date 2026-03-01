/**
 * scripts/osm/overpassQueries.ts
 *
 * Overpass QL クエリ定義。
 * 日本全国のパチンコホール（leisure=adult_gaming_centre OR gambling=pachinko）を取得する。
 */

/**
 * メインクエリ: 日本エリア内の leisure=adult_gaming_centre OR gambling=pachinko を
 * node/way/relation すべて取得し、center 座標とタグを返す。
 *
 * out center: way/relation でも中心座標を返す
 * [timeout:300]: 最大300秒（5分）
 */
export const PACHINKO_MAIN_QUERY = `
[out:json][timeout:300];
area["ISO3166-1"="JP"]->.japan;
(
  nwr["leisure"="adult_gaming_centre"](area.japan);
  nwr["gambling"="pachinko"](area.japan);
);
out center tags;
`.trim();

/**
 * デフォルトの Overpass API エンドポイント。
 * .env.local に OVERPASS_URL があればそちらを優先。
 */
export const DEFAULT_OVERPASS_URL = "https://overpass-api.de/api/interpreter";
