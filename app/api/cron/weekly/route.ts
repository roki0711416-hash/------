import { NextRequest, NextResponse } from "next/server";
import { runWithLock } from "@/lib/jobs/jobLock";
import { updateOsmStores } from "@/lib/jobs/updateOsmStores";
import { dedupeStores } from "@/lib/jobs/dedupeStores";

/**
 * 毎週日曜 JST 05:00 (UTC 20:00 土曜) に実行。
 * 1. OSM データ取得 → stores テーブル upsert
 * 2. 重複店舗のクラスタリング → canonical_store_id 設定
 *
 * Vercel Cron から GET で叩かれる。
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 週次は時間がかかるため長め (Pro plan 推奨)

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const token = req.nextUrl.searchParams.get("token");
  return token === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runWithLock("weekly", async () => {
    const osm = await updateOsmStores();
    const dedupe = await dedupeStores();
    return { osm, dedupe };
  });

  return NextResponse.json(result);
}
