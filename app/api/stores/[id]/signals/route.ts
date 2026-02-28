/**
 * GET /api/stores/[id]/signals?days=7
 *
 * 指定店舗の直近N日分のシグナルを返す。
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get("days") ?? "7")));

  const db = getDb();
  if (!db) {
    return NextResponse.json({ signals: [], store: null });
  }

  /* 店舗情報 */
  const { rows: storeRows } = await db.sql`
    SELECT id, name, prefecture, city, address FROM stores WHERE id = ${id} LIMIT 1
  `;
  if (storeRows.length === 0) {
    return NextResponse.json({ error: "store not found" }, { status: 404 });
  }

  /* シグナル */
  const { rows: signals } = await db.sql`
    SELECT date, traffic_index, swing_index, reward_index, high_chance_index, note
    FROM store_daily_signals
    WHERE store_id = ${id}
    ORDER BY date DESC
    LIMIT ${days}
  `;

  /* 平均 */
  const { rows: avgRows } = await db.sql`
    SELECT
      round(avg(traffic_index))::int      AS avg_traffic,
      round(avg(swing_index))::int        AS avg_swing,
      round(avg(reward_index))::int       AS avg_reward,
      round(avg(high_chance_index))::int  AS avg_high_chance
    FROM store_daily_signals
    WHERE store_id = ${id}
      AND date >= current_date - ${days}
  `;

  return NextResponse.json({
    store: storeRows[0],
    signals,
    average: avgRows[0] ?? null,
  });
}
