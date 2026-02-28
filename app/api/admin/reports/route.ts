import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/requireAdmin";
import { sendTransactionalEmail } from "../../../../lib/email";

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

  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  const payload = bodyJson as Record<string, unknown>;
  const reporterUserId = typeof payload.reporter_user_id === "string" ? payload.reporter_user_id.trim() : "";
  const rawTargetType = typeof payload.target_type === "string" ? payload.target_type.trim() : "";
  const targetId = typeof payload.target_id === "string" ? payload.target_id.trim() : "";
  const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
  const detail = typeof payload.detail === "string" ? payload.detail.trim() : "";
  const targetContent = typeof payload.target_content === "string" ? payload.target_content.trim() : "";
  const reporterUsername = typeof payload.reporter_username === "string" ? payload.reporter_username.trim() : "（不明）";

  if (!reporterUserId || !rawTargetType || !targetId || !reason) {
    return jsonError(400, "Missing required fields");
  }

  // iOS は "reply" を送る → DB は ('thread','post') なので変換
  const targetType = rawTargetType === "reply" ? "post" : rawTargetType;
  if (!["thread", "post"].includes(targetType)) {
    return jsonError(400, `Invalid target_type: ${rawTargetType}`);
  }

  const id = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `rpt-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    await db.sql`
      INSERT INTO community_reports (id, reporter_user_id, target_type, target_id, reason, detail)
      VALUES (${id}, ${reporterUserId}, ${targetType}, ${targetId}, ${reason}, ${detail})
    `;
  } catch (e) {
    console.error("[admin/reports] Insert error:", e);
    return jsonError(500, "通報の保存に失敗しました");
  }

  // ── メール通知（ベストエフォート） ──
  const REASON_LABELS: Record<string, string> = {
    spam: "スパム・宣伝", harassment: "嫌がらせ・誹謗中傷",
    hate: "ヘイトスピーチ・差別", sexual: "わいせつ・性的コンテンツ",
    violence: "暴力的な内容", other: "その他",
  };
  const typeLabel = targetType === "thread" ? "スレッド" : "返信";
  const reasonLabel = REASON_LABELS[reason] ?? reason;

  const emailText = [
    "【スロカスくん】新しい通報が届きました",
    "",
    `■ 通報対象: ${typeLabel}`,
    `■ 通報理由: ${reasonLabel}`,
    detail ? `■ 詳細: ${detail}` : "",
    "",
    targetContent ? `■ 対象コンテンツ:\n  ${targetContent}` : "",
    "",
    `■ 通報者: ${reporterUsername} (${reporterUserId})`,
    `■ 通報ID: ${id}`,
    "",
    "管理画面で確認・対応してください:",
    "https://slokasukun.com/admin/reports",
  ].filter(Boolean).join("\n");

  try {
    await sendTransactionalEmail({
      to: "slokasukun1@gmail.com",
      subject: `[通報] ${typeLabel}: ${reasonLabel}`,
      text: emailText,
    });
  } catch (emailErr) {
    console.error("[admin/reports] Email send failed:", emailErr);
  }

  return NextResponse.json({ ok: true, id, status: "OPEN" }, { status: 201 });
}
