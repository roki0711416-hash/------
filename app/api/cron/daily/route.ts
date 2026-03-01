import { NextRequest, NextResponse } from "next/server";
import { runWithLock } from "@/lib/jobs/jobLock";
import { generateDailySignals } from "@/lib/jobs/generateDailySignals";

/**
 * 毎日 JST 04:10 (UTC 19:10) に実行。
 * - 当日分のデイリーシグナル (mock) を生成
 *
 * Vercel Cron から GET で叩かれる。
 * Authorization ヘッダー or ?token= で CRON_SECRET を検証。
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Pro plan: 60s

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  // Vercel Cron は Authorization: Bearer <secret> を送る
  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  // ローカルテスト用: ?token=<secret>
  const token = req.nextUrl.searchParams.get("token");
  return token === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runWithLock("daily", () => generateDailySignals(1));
  return NextResponse.json(result);
}
