import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";
import { requireAdmin } from "../../../../../lib/requireAdmin";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

type Params = { params: Promise<{ id: string }> };

// ── GET /api/admin/reports/[id] ──
// 通報詳細を返す
export async function GET(_req: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("forbiddenResponse" in auth) return auth.forbiddenResponse;

  const db = getDb();
  if (!db) return jsonError(503, "DB未設定");

  const { id } = await params;

  try {
    const { rows } = await db.sql`
      SELECT
        r.*,
        reporter.username AS reporter_username,
        reporter.email    AS reporter_email,
        CASE
          WHEN r.target_type = 'thread' THEN t.title
          WHEN r.target_type = 'post'   THEN p.body
          ELSE NULL
        END AS target_content,
        CASE
          WHEN r.target_type = 'thread' THEN t.username
          WHEN r.target_type = 'post'   THEN p.username
          ELSE NULL
        END AS target_author_name,
        CASE
          WHEN r.target_type = 'thread' THEN t.user_id
          WHEN r.target_type = 'post'   THEN p.user_id
          ELSE NULL
        END AS target_author_id,
        COALESCE(target_user.is_banned, false) AS target_author_is_banned
      FROM community_reports r
      LEFT JOIN users reporter ON reporter.id = r.reporter_user_id
      LEFT JOIN community_threads t ON r.target_type = 'thread' AND r.target_id = t.id
      LEFT JOIN community_thread_posts p ON r.target_type = 'post' AND r.target_id = p.id
      LEFT JOIN users target_user ON target_user.id = CASE
        WHEN r.target_type = 'thread' THEN t.user_id
        WHEN r.target_type = 'post'   THEN p.user_id
      END
      WHERE r.id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) return jsonError(404, "通報が見つかりません");

    return NextResponse.json({ report: rows[0] });
  } catch (e) {
    console.error("[admin/reports/id] DB error:", e);
    return jsonError(500, "通報詳細の取得に失敗しました");
  }
}

// ── PATCH /api/admin/reports/[id] ──
// ステータス更新・コンテンツ削除・BAN
export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("forbiddenResponse" in auth) return auth.forbiddenResponse;

  const db = getDb();
  if (!db) return jsonError(503, "DB未設定");

  const { id } = await params;

  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  const payload = bodyJson as Record<string, unknown>;
  const action = typeof payload.action === "string" ? payload.action : "";

  try {
    switch (action) {
      // ── ステータス変更 ──
      case "update_status": {
        const newStatus = typeof payload.status === "string" ? payload.status : "";
        if (!["OPEN", "IN_REVIEW", "RESOLVED"].includes(newStatus)) {
          return jsonError(400, "Invalid status");
        }
        const handledAt = newStatus === "RESOLVED" ? new Date().toISOString() : null;
        await db.sql`
          UPDATE community_reports
          SET status = ${newStatus},
              handled_at = COALESCE(${handledAt}::timestamptz, handled_at),
              handled_by = COALESCE(${auth.user.id}, handled_by)
          WHERE id = ${id}
        `;
        return NextResponse.json({ ok: true, status: newStatus });
      }

      // ── コンテンツ削除（論理削除） ──
      case "delete_content": {
        // 通報対象を取得
        const { rows } = await db.sql`
          SELECT target_type, target_id FROM community_reports WHERE id = ${id} LIMIT 1
        `;
        if (rows.length === 0) return jsonError(404, "通報が見つかりません");

        const report = rows[0] as { target_type: string; target_id: string };

        if (report.target_type === "thread") {
          await db.sql`UPDATE community_threads SET is_deleted = true, deleted_at = now() WHERE id = ${report.target_id}`;
        } else if (report.target_type === "post") {
          await db.sql`UPDATE community_thread_posts SET is_deleted = true, deleted_at = now() WHERE id = ${report.target_id}`;
        }

        // 通報もRESOLVEDに + action_taken を記録
        await db.sql`
          UPDATE community_reports
          SET status = 'RESOLVED', handled_at = now(), handled_by = ${auth.user.id},
              action_taken = 'delete_content'
          WHERE id = ${id}
        `;

        return NextResponse.json({ ok: true, action: "delete_content" });
      }

      // ── ユーザーBAN ──
      case "ban_user": {
        const targetUserId = typeof payload.target_user_id === "string" ? payload.target_user_id : "";
        const banReason = typeof payload.reason === "string" ? payload.reason : "コミュニティガイドライン違反";

        if (!targetUserId) return jsonError(400, "target_user_id is required");

        await db.sql`
          UPDATE users
          SET is_banned = true, banned_at = now(), ban_reason = ${banReason}
          WHERE id = ${targetUserId}
        `;

        // 通報もRESOLVEDに + action_taken を記録
        await db.sql`
          UPDATE community_reports
          SET status = 'RESOLVED', handled_at = now(), handled_by = ${auth.user.id},
              action_taken = 'ban_user'
          WHERE id = ${id}
        `;

        return NextResponse.json({ ok: true, action: "ban_user", target_user_id: targetUserId });
      }

      // ── BAN解除 ──
      case "unban_user": {
        const userId = typeof payload.target_user_id === "string" ? payload.target_user_id : "";
        if (!userId) return jsonError(400, "target_user_id is required");

        await db.sql`
          UPDATE users
          SET is_banned = false, banned_at = NULL, ban_reason = NULL
          WHERE id = ${userId}
        `;

        return NextResponse.json({ ok: true, action: "unban_user" });
      }

      default:
        return jsonError(400, `Unknown action: ${action}`);
    }
  } catch (e) {
    console.error("[admin/reports/id] PATCH error:", e);
    return jsonError(500, "操作に失敗しました");
  }
}
