import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { getCurrentUserFromCookies } from "../../../lib/auth";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function getPool() {
  return getDb();
}

export async function GET(req: Request) {
  const db = getPool();
  if (!db) {
    return jsonError(
      503,
      "口コミDBが未設定です。Vercelの環境変数に DATABASE_URL（Neon接続文字列）または POSTGRES_URL を設定してください。",
    );
  }

  const url = new URL(req.url);
  const machineId = url.searchParams.get("machineId")?.trim();
  const limit = clampInt(Number(url.searchParams.get("limit") ?? "50"), 1, 100);

  if (!machineId) return jsonError(400, "machineId is required");

  try {
    const { rows } = await db.sql`
      SELECT id, machine_id, date, rating, user_id, author, body
      FROM reviews
      WHERE machine_id = ${machineId}
      ORDER BY date DESC, id DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({ reviews: rows });
  } catch (e) {
    return jsonError(
      500,
      e instanceof Error ? e.message : "Failed to fetch reviews",
    );
  }
}

export async function POST(req: Request) {
  const db = getPool();
  if (!db) {
    return jsonError(
      503,
      "口コミDBが未設定です。Vercelの環境変数に DATABASE_URL（Neon接続文字列）または POSTGRES_URL を設定してください。",
    );
  }

  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  if (typeof bodyJson !== "object" || bodyJson === null) {
    return jsonError(400, "Invalid payload");
  }

  const user = await getCurrentUserFromCookies();
  if (!user) {
    return jsonError(401, "口コミ投稿にはログイン（ユーザー登録）が必要です。");
  }

  const payload = bodyJson as Record<string, unknown>;
  const machineId = typeof payload.machineId === "string" ? payload.machineId.trim() : "";
  const reviewBody = typeof payload.body === "string" ? payload.body.trim() : "";
  const ratingRaw = typeof payload.rating === "number" ? payload.rating : Number(payload.rating);
  const rating = clampInt(ratingRaw, 1, 5);

  if (!machineId) return jsonError(400, "machineId is required");
  if (!reviewBody) return jsonError(400, "body is required");
  if (reviewBody.length > 500) return jsonError(400, "body must be <= 500 chars");

  // YYYY-MM-DD in JST
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const jst = new Date(utc + 9 * 60 * 60_000);
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const d = String(jst.getDate()).padStart(2, "0");
  const date = `${y}-${m}-${d}`;

  const id = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `r-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const userId = user.id;

  // 投稿にはユーザーネーム設定が必須
  let author: string | null = null;
  try {
    const { rows } = await db.sql`SELECT username FROM users WHERE id = ${userId} LIMIT 1`;
    const row = rows[0] as { username: string | null } | undefined;
    const username = (row?.username ?? "").trim();
    if (!username) {
      return jsonError(409, "口コミ投稿にはユーザーネーム設定が必要です。/account から設定してください。");
    }
    author = username;
  } catch {
    return jsonError(500, "ユーザーネームの取得に失敗しました。");
  }

  try {
    await db.sql`
      INSERT INTO reviews (id, machine_id, date, rating, user_id, author, body)
      VALUES (${id}, ${machineId}, ${date}, ${rating}, ${userId}, ${author}, ${reviewBody})
    `;

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return jsonError(500, e instanceof Error ? e.message : "Failed to insert review");
  }
}
