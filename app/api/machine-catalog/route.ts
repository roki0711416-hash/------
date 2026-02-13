import { NextResponse } from "next/server";
import { getMachinesData } from "@/lib/machines";

export const dynamic = "force-dynamic";

/**
 * GET /api/machine-catalog
 *
 * /machines ページと完全に同じデータソース（lib/machines.ts → getMachinesData()）
 * を使い、メーカー別に機種をネストして返す。
 *
 * Format:
 * [
 *   { makerId: "kitadenshi", makerName: "北電子", machines: [{ id, name }] }
 * ]
 */
export async function GET() {
  const { makers } = await getMachinesData();

  // Stable makerId from makerName (slug-like)
  function toMakerId(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\u3000-\u9fff\u30a0-\u30ff\u3040-\u309f-]/g, "");
  }

  const result = makers.map((maker) => ({
    makerId: toMakerId(maker.name),
    makerName: maker.name,
    machines: maker.machines.map((m) => ({ id: m.id, name: m.name })),
  }));

  return NextResponse.json(result);
}
