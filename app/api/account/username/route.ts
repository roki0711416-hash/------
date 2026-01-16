import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireCurrentUserOrJsonError } from "../../../../lib/auth";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeUsername(input: string) {
  return input.trim();
}

export async function POST(req: Request) {
  const auth = await requireCurrentUserOrJsonError();
  if (!auth.ok) return auth.response;

  const db = getDb();
  if (!db) {
    return jsonError(
      503,
      "DBが未設定です。Vercelの環境変数に DATABASE_URL（Neon接続文字列）または POSTGRES_URL を設定してください。",
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  if (typeof body !== "object" || body === null) {
    return jsonError(400, "Invalid payload");
  }

  const payload = body as Record<string, unknown>;
  const raw = typeof payload.username === "string" ? payload.username : "";
  const username = normalizeUsername(raw);

  if (!username) {
    return jsonError(400, "ユーザーネームを入力してください");
  }
  if (username.length > 20) {
    return jsonError(400, "ユーザーネームは20文字以内にしてください");
  }
  if (/\s/.test(username)) {
    return jsonError(400, "ユーザーネームに空白は使えません");
  }

  try {
    await db.sql`UPDATE users SET username = ${username} WHERE id = ${auth.user.id};`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to set username";
    const code =
      typeof e === "object" && e && "code" in e ? (e as { code?: unknown }).code : undefined;

    // unique violation
    if (code === "23505" || msg.toLowerCase().includes("unique")) {
      return jsonError(409, "このユーザーネームは既に使われています");
    }

    return jsonError(500, msg);
  }
}
