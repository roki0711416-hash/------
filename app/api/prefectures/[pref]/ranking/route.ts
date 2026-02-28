/**
 * GET /api/prefectures/[pref]/ranking?sort=reward&limit=10
 *
 * 直近7日の平均スコアで県内ランキングを返す。
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pref: string }> },
) {
  const { pref } = await params;
  const sort = req.nextUrl.searchParams.get("sort") ?? "reward";
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? "10")));

  const db = getDb();
  if (!db) {
    return NextResponse.json({ ranking: [] });
  }

  type SortKey = "reward" | "traffic" | "swing" | "highchance";
  const colMap: Record<SortKey, string> = {
    reward: "avg_reward",
    traffic: "avg_traffic",
    swing: "avg_swing",
    highchance: "avg_high_chance",
  };
  const orderCol = colMap[sort as SortKey] ?? "avg_reward";

  const { rows } = await db.query(
    `SELECT
       s.id, s.name, s.city,
       round(avg(sig.traffic_index))::int      AS avg_traffic,
       round(avg(sig.swing_index))::int        AS avg_swing,
       round(avg(sig.reward_index))::int       AS avg_reward,
       round(avg(sig.high_chance_index))::int  AS avg_high_chance,
       max(sig.note) AS latest_note
     FROM stores s
     JOIN store_daily_signals sig ON sig.store_id = s.id
       AND sig.date >= current_date - 7
     WHERE s.prefecture = $1
     GROUP BY s.id, s.name, s.city
     ORDER BY ${orderCol} DESC
     LIMIT $2`,
    [pref, limit],
  );

  return NextResponse.json({ ranking: rows, sort, pref });
}
