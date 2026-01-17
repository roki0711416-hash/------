import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { getCurrentUserFromCookies } from "../../../../lib/auth";
import { getSubscriptionForUserId, isPremiumForUserAndSubscription } from "../../../../lib/premium";
import { isBoardId, needsHall, needsMachine, needsPrefecture } from "../../../../lib/community";

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
  const boardId = url.searchParams.get("board")?.trim();
  const limit = clampInt(Number(url.searchParams.get("limit") ?? "50"), 1, 100);

  if (!isBoardId(boardId)) return jsonError(400, "board is invalid");

  try {
    const { rows } = await db.sql`
      SELECT id, board_id, prefecture, hall, machine, title, reply_count, username, created_at, updated_at
      FROM community_threads
      WHERE board_id = ${boardId}
      ORDER BY updated_at DESC, id DESC
      LIMIT ${limit}
    `;
    return NextResponse.json({ threads: rows });
  } catch (e) {
    return jsonError(500, e instanceof Error ? e.message : "Failed to fetch threads");
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

  const boardId = payload.boardId;
  if (!isBoardId(boardId)) return jsonError(400, "boardId is invalid");

  const title = trimOrNull(payload.title, 60);
  const firstBody = trimOrNull(payload.body, 1000);
  const prefecture = trimOrNull(payload.prefecture, 20);
  const hall = trimOrNull(payload.hall, 50);
  const machine = trimOrNull(payload.machine, 50);

  if (!title) return jsonError(400, "title is required (<= 60 chars)");
  if (!firstBody) return jsonError(400, "body is required (<= 1000 chars)");

  if (needsPrefecture(boardId) && !prefecture) return jsonError(400, "prefecture is required");
  if (needsHall(boardId) && !hall) return jsonError(400, "hall is required");
  if (needsMachine(boardId) && !machine) return jsonError(400, "machine is required");

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

  const threadId = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `ct-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const postId = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `ctp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    await db.sql`
      INSERT INTO community_threads (id, board_id, user_id, username, prefecture, hall, machine, title, reply_count, created_at, updated_at)
      VALUES (${threadId}, ${boardId}, ${userId}, ${username}, ${prefecture}, ${hall}, ${machine}, ${title}, 1, now(), now())
    `;

    await db.sql`
      INSERT INTO community_thread_posts (id, thread_id, post_no, user_id, username, body, created_at)
      VALUES (${postId}, ${threadId}, 1, ${userId}, ${username}, ${firstBody}, now())
    `;

    return NextResponse.json({ ok: true, threadId });
  } catch (e) {
    return jsonError(500, e instanceof Error ? e.message : "Failed to create thread");
  }
}
