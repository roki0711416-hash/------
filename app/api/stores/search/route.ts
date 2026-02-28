/**
 * GET /api/stores/search?pref=tokyo&page=1&limit=20
 *
 * 都道府県slug でフィルタした店舗一覧を返す。
 * 最新シグナルも JOIN して返す。
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const pref = req.nextUrl.searchParams.get("pref");
  if (!pref) {
    return NextResponse.json({ error: "pref is required" }, { status: 400 });
  }

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  const sort = req.nextUrl.searchParams.get("sort") ?? "name";

  const db = getDb();
  if (!db) {
    return NextResponse.json({ stores: [], total: 0 });
  }

  /* 合計件数 */
  const { rows: countRows } = await db.sql`
    SELECT count(*)::int AS total FROM stores
    WHERE prefecture = ${pref}
      AND source = 'osm'
      AND canonical_store_id IS NULL
  `;
  const total: number = countRows[0]?.total ?? 0;

  /* ソート列 */
  type SortKey = "name" | "traffic" | "reward" | "swing" | "highchance";
  const sortMap: Record<SortKey, string> = {
    name: "s.name",
    traffic: "COALESCE(sig.traffic_index, 0)",
    reward: "COALESCE(sig.reward_index, 0)",
    swing: "COALESCE(sig.swing_index, 0)",
    highchance: "COALESCE(sig.high_chance_index, 0)",
  };
  const orderCol = sortMap[(sort as SortKey)] ?? "s.name";
  const orderDir = sort === "name" ? "ASC" : "DESC";

  /* 店舗 + 最新シグナル */
  const { rows } = await db.query(
    `SELECT
       s.id, s.name, s.prefecture, s.city, s.address,
       sig.traffic_index, sig.swing_index, sig.reward_index,
       sig.high_chance_index, sig.note, sig.date AS signal_date
     FROM stores s
     LEFT JOIN LATERAL (
       SELECT * FROM store_daily_signals sd
       WHERE sd.store_id = s.id
       ORDER BY sd.date DESC LIMIT 1
     ) sig ON true
     WHERE s.prefecture = $1
       AND s.source = 'osm'
       AND s.canonical_store_id IS NULL
     ORDER BY ${orderCol} ${orderDir}
     LIMIT $2 OFFSET $3`,
    [pref, limit, offset],
  );

  return NextResponse.json({ stores: rows, total, page, limit });
}
