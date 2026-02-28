import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/requireAdmin";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

// ── GET /api/admin/reports ──
// 通報一覧を返す（管理者のみ）
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if ("forbiddenResponse" in auth) return auth.forbiddenResponse;

  const db = getDb();
  if (!db) return jsonError(503, "DB未設定");

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "OPEN";
  const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);
  const offset = Number(url.searchParams.get("offset") || "0");

  try {
    // 通報一覧 + 通報者名 + 対象コンテンツ本文を結合
    const { rows } = await db.sql`
      SELECT
        r.id,
        r.reporter_user_id,
        r.target_type,
        r.target_id,
        r.reason,
        r.detail,
        r.status,
        r.created_at,
        r.handled_at,
        r.handled_by,
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
        END AS target_author_id
      FROM community_reports r
      LEFT JOIN users reporter ON reporter.id = r.reporter_user_id
      LEFT JOIN community_threads t ON r.target_type = 'thread' AND r.target_id = t.id
      LEFT JOIN community_thread_posts p ON r.target_type = 'post' AND r.target_id = p.id
      WHERE r.status = ${status}
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // 件数も返す
    const countResult = await db.sql`
      SELECT COUNT(*) as count FROM community_reports WHERE status = ${status}
    `;
    const total = Number((countResult.rows[0] as { count: string })?.count ?? 0);

    return NextResponse.json({ reports: rows, total, limit, offset });
  } catch (e) {
    console.error("[admin/reports] DB error:", e);
    return jsonError(500, "通報一覧の取得に失敗しました");
  }
}

// ── POST /api/admin/reports ──
// 通報を新規作成（iOS / Web のクライアントから呼ばれる）
// ※ この API は非管理者（一般ユーザー）も利用可
export async function POST(req: Request) {
  const db = getDb();
  if (!db) return jsonError(503, "DB未設定");

  // ログイン不要（iOS側から userId 直送り）だが、Web の場合はログインユーザーを使う
  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  const payload = bodyJson as Record<string, unknown>;
  const reporterUserId = typeof payload.reporter_user_id === "string" ? payload.reporter_user_id.trim() : "";
  const targetType = typeof payload.target_type === "string" ? payload.target_type.trim() : "";
  const targetId = typeof payload.target_id === "string" ? payload.target_id.trim() : "";
  const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
  const detail = typeof payload.detail === "string" ? payload.detail.trim() : "";

  if (!reporterUserId || !targetType || !targetId || !reason) {
    return jsonError(400, "Missing required fields");
  }
  if (!["thread", "post"].includes(targetType)) {
    return jsonError(400, "Invalid target_type");
  }

  const id = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `rpt-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    await db.sql`
      INSERT INTO community_reports (id, reporter_user_id, target_type, target_id, reason, detail)
      VALUES (${id}, ${reporterUserId}, ${targetType}, ${targetId}, ${reason}, ${detail})
    `;
    return NextResponse.json({ ok: true, id, status: "OPEN" }, { status: 201 });
  } catch (e) {
    console.error("[admin/reports] Insert error:", e);
    return jsonError(500, "通報の保存に失敗しました");
  }
}
