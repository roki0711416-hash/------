import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { getCurrentUserFromCookies } from "../../../../lib/auth";
import { getSubscriptionForUserId, isPremiumForUserAndSubscription } from "../../../../lib/premium";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function trimOrNull(v: unknown, maxLen: number) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  if (t.length > maxLen) return null;
  return t;
}

async function requirePremiumUser() {
  const isPremiumPreview = process.env.SLOKASU_PREMIUM_PREVIEW === "1";

  const user = await getCurrentUserFromCookies();
  if (!user) return { ok: false as const, status: 401 as const, message: "ログインが必要です。" };

  if (!isPremiumPreview) {
    const sub = await getSubscriptionForUserId(user.id);
    if (!isPremiumForUserAndSubscription(user, sub)) {
      return { ok: false as const, status: 403 as const, message: "有料会員限定です。" };
    }
  }

  return { ok: true as const, user };
}

export async function GET(req: Request) {
  const db = getDb();
  if (!db) {
    return jsonError(
      503,
      "DBが未設定です。Vercelの環境変数に DATABASE_URL（Neon接続文字列）または POSTGRES_URL を設定してください。",
    );
  }

  const auth = await requirePremiumUser();
  if (!auth.ok) return jsonError(auth.status, auth.message);

  const url = new URL(req.url);
  const threadId = url.searchParams.get("threadId")?.trim();
  const limit = clampInt(Number(url.searchParams.get("limit") ?? "200"), 1, 500);
  if (!threadId) return jsonError(400, "threadId is required");

  try {
    const { rows } = await db.sql`
      SELECT id, thread_id, post_no, username, body, created_at
      FROM community_thread_posts
      WHERE thread_id = ${threadId}
      ORDER BY post_no ASC
      LIMIT ${limit}
    `;
    return NextResponse.json({ posts: rows });
  } catch (e) {
    return jsonError(500, e instanceof Error ? e.message : "Failed to fetch posts");
  }
}

export async function POST(req: Request) {
  const db = getDb();
  if (!db) {
    return jsonError(
      503,
      "DBが未設定です。Vercelの環境変数に DATABASE_URL（Neon接続文字列）または POSTGRES_URL を設定してください。",
    );
  }

  const auth = await requirePremiumUser();
  if (!auth.ok) return jsonError(auth.status, auth.message);

  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  if (typeof bodyJson !== "object" || bodyJson === null) {
    return jsonError(400, "Invalid payload");
  }

  const payload = bodyJson as Record<string, unknown>;

  const threadId = typeof payload.threadId === "string" ? payload.threadId.trim() : "";
  const postBody = trimOrNull(payload.body, 1000);
  if (!threadId) return jsonError(400, "threadId is required");
  if (!postBody) return jsonError(400, "body is required (<= 1000 chars)");

  const userId = auth.user.id;

  // username必須
  let username: string | null = null;
  try {
    const { rows } = await db.sql`SELECT username FROM users WHERE id = ${userId} LIMIT 1`;
    const row = rows[0] as { username: string | null } | undefined;
    username = (row?.username ?? "").trim() || null;
  } catch {
    return jsonError(500, "ユーザーネームの取得に失敗しました。");
  }
  if (!username) {
    return jsonError(409, "投稿にはユーザーネーム設定が必要です。/account から設定してください。");
  }

  // post_no を競合しづらくするため、スレ側の reply_count をインクリメントして採番
  let postNo: number;
  try {
    const { rows } = await db.sql`
      UPDATE community_threads
      SET reply_count = reply_count + 1, updated_at = now()
      WHERE id = ${threadId}
      RETURNING reply_count
    `;

    const row = rows[0] as { reply_count: number } | undefined;
    if (!row) return jsonError(404, "thread not found");
    postNo = clampInt(row.reply_count, 1, 1_000_000);
  } catch (e) {
    return jsonError(500, e instanceof Error ? e.message : "Failed to update thread");
  }

  const id = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `ctp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    await db.sql`
      INSERT INTO community_thread_posts (id, thread_id, post_no, user_id, username, body, created_at)
      VALUES (${id}, ${threadId}, ${postNo}, ${userId}, ${username}, ${postBody}, now())
    `;
    return NextResponse.json({ ok: true, id, postNo });
  } catch (e) {
    return jsonError(500, e instanceof Error ? e.message : "Failed to insert post");
  }
}
