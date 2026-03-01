import { NextResponse } from "next/server";
import { getDailySummaries } from "@/lib/storeAnalytics";

export const dynamic = "force-dynamic";

/** GET /api/stores/[id]/daily?days=30 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(_req.url);
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days")) || 30));

  const rows = await getDailySummaries(id, days);
  return NextResponse.json({ storeId: id, days, summaries: rows });
}
