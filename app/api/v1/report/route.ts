import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { sendTransactionalEmail } from "../../../../lib/email";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * iOS / Web 共通の通報エンドポイント
 *
 * POST /api/v1/report
 *
 * Body (snake_case — iOS の JSONEncoder は convertToSnakeCase):
 *   reporter_user_id   : string  (必須)
 *   reporter_username  : string  (任意)
 *   target_type        : "thread" | "reply" | "post"  (必須)
 *   target_id          : string  (必須)
 *   target_content     : string  (任意 — メール通知に含める)
 *   reason             : string  (必須)
 *   detail             : string  (任意)
 */
export async function POST(req: Request) {
  const db = getDb();
  if (!db) return jsonError(503, "DB未設定");

  // ── リクエストボディ解析 ──
  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  const p = bodyJson as Record<string, unknown>;
  const reporterUserId = str(p.reporter_user_id);
  const reporterUsername = str(p.reporter_username) || "（不明）";
  const rawTargetType = str(p.target_type);
  const targetId = str(p.target_id);
  const targetContent = str(p.target_content) || "";
  const reason = str(p.reason);
  const detail = str(p.detail) || "";

  if (!reporterUserId || !rawTargetType || !targetId || !reason) {
    return jsonError(400, "Missing required fields: reporter_user_id, target_type, target_id, reason");
  }

  // iOS は "reply" を送信、DB の CHECK は ('thread','post') なので変換
  const targetType = rawTargetType === "reply" ? "post" : rawTargetType;
  if (!["thread", "post"].includes(targetType)) {
    return jsonError(400, `Invalid target_type: ${rawTargetType}`);
  }

  // ── DB 保存 ──
  const id =
    globalThis.crypto?.randomUUID?.() ??
    `rpt-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    await db.sql`
      INSERT INTO community_reports
        (id, reporter_user_id, target_type, target_id, reason, detail)
      VALUES
        (${id}, ${reporterUserId}, ${targetType}, ${targetId}, ${reason}, ${detail})
    `;
  } catch (e) {
    console.error("[/api/v1/report] DB insert error:", e);
    return jsonError(500, "通報の保存に失敗しました");
  }

  // ── 対象コンテンツの詳細を DB から取得（メール用） ──
  let dbTargetContent = targetContent;
  let targetAuthorName = "";
  try {
    if (targetType === "thread") {
      const { rows } = await db.sql`
        SELECT title, username FROM community_threads WHERE id = ${targetId} LIMIT 1
      `;
      if (rows.length > 0) {
        const row = rows[0] as { title: string; username: string };
        dbTargetContent = dbTargetContent || row.title;
        targetAuthorName = row.username ?? "";
      }
    } else {
      const { rows } = await db.sql`
        SELECT body, username FROM community_thread_posts WHERE id = ${targetId} LIMIT 1
      `;
      if (rows.length > 0) {
        const row = rows[0] as { body: string; username: string };
        dbTargetContent = dbTargetContent || row.body;
        targetAuthorName = row.username ?? "";
      }
    }
  } catch {
    // コンテンツ取得失敗は致命的ではない
  }

  // ── メール通知（ベストエフォート） ──
  const REASON_LABELS: Record<string, string> = {
    spam: "スパム・宣伝",
    harassment: "嫌がらせ・誹謗中傷",
    hate: "ヘイトスピーチ・差別",
    sexual: "わいせつ・性的コンテンツ",
    violence: "暴力的な内容",
    other: "その他",
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
    `■ 対象コンテンツ:`,
    `  ${dbTargetContent || "（取得不可）"}`,
    targetAuthorName ? `■ 投稿者: ${targetAuthorName}` : "",
    "",
    `■ 通報者: ${reporterUsername} (${reporterUserId})`,
    "",
    `■ 通報ID: ${id}`,
    "",
    "管理画面で確認・対応してください:",
    "https://slokasukun.com/admin/reports",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendTransactionalEmail({
      to: "slokasukun1@gmail.com",
      subject: `[通報] ${typeLabel}: ${reasonLabel}`,
      text: emailText,
    });
    console.log("[/api/v1/report] Notification email sent for report", id);
  } catch (emailErr) {
    // メール送信失敗は通報保存には影響させない
    console.error("[/api/v1/report] Email send failed:", emailErr);
  }

  return NextResponse.json({ ok: true, id, status: "OPEN" }, { status: 201 });
}

// ── ユーティリティ ──

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
