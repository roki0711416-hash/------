import { NextResponse } from "next/server";
import { getDailyMachines } from "@/lib/storeAnalytics";

export const dynamic = "force-dynamic";

/** GET /api/stores/[id]/daily/[date] */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; date: string }> },
) {
  const { id, date } = await params;

  // 日付バリデーション (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const machines = await getDailyMachines(id, date);
  return NextResponse.json({ storeId: id, date, machines });
}
