import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export const runtime = "nodejs";

/**
 * GET /api/v1/community/deleted-ids
 *
 * 管理者が「コンテンツ削除」を実行した通報のtarget_idを返す。
 * iOSアプリがローカルSwiftDataの isDeleted フラグを同期するために使用。
 *
 * レスポンス:
 * {
 *   deleted_thread_ids: string[],
 *   deleted_post_ids: string[]
 * }
 *
 * 認証不要（iOSアプリから直接呼び出し用）
 */
export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "DB未設定" },
      { status: 503 }
    );
  }

  try {
    const { rows } = await db.sql`
      SELECT DISTINCT target_id, target_type
      FROM community_reports
      WHERE action_taken = 'delete_content'
    `;

    const deletedThreadIds: string[] = [];
    const deletedPostIds: string[] = [];

    for (const row of rows) {
      if (row.target_type === "thread") {
        deletedThreadIds.push(row.target_id as string);
      } else if (row.target_type === "post") {
        deletedPostIds.push(row.target_id as string);
      }
    }

    return NextResponse.json({
      deleted_thread_ids: deletedThreadIds,
      deleted_post_ids: deletedPostIds,
    });
  } catch (e) {
    console.error("[v1/community/deleted-ids] DB error:", e);
    return NextResponse.json(
      { error: "削除IDの取得に失敗しました" },
      { status: 500 }
    );
  }
}
