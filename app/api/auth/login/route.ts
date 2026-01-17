import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import {
  clearSessionCookie,
  createSessionForUser,
  setSessionCookie,
  verifyPassword,
} from "../../../../lib/auth";
import { shouldBeAdminFromEnv } from "../../../../lib/roles";

export const runtime = "nodejs";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(req: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      {
        error:
          "DBが未設定です。Vercelの環境変数に DATABASE_URL（Neon接続文字列）または POSTGRES_URL を設定してください。",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const emailRaw = typeof payload.email === "string" ? payload.email : "";
  const passwordRaw = typeof payload.password === "string" ? payload.password : "";

  const email = normalizeEmail(emailRaw);
  const password = passwordRaw;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "メールアドレスが不正です" }, { status: 400 });
  }

  let rows: unknown[];
  try {
    const result = await db.sql`SELECT id, password_hash FROM users WHERE email = ${email} LIMIT 1`;
    rows = result.rows as unknown[];
  } catch (e) {
    const code =
      typeof e === "object" && e && "code" in e ? (e as { code?: unknown }).code : undefined;
    const msg = e instanceof Error ? e.message : "Failed to query user";
    if (code === "42P01" || msg.toLowerCase().includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "DBのテーブルが未作成です。ローカルなら `npm run db:init-auth` を実行してから再度お試しください。",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const user = rows[0] as { id: string; password_hash: string } | undefined;
  if (!user) {
    return NextResponse.json(
      { error: "メールアドレスまたはパスワードが違います" },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "メールアドレスまたはパスワードが違います" },
      { status: 401 },
    );
  }

  // Envで管理者指定されているユーザーは、DB上もadminに寄せる（課金判定より優先）
  if (shouldBeAdminFromEnv({ userId: user.id, email })) {
    try {
      await db.sql`
        UPDATE users
        SET role = 'admin'
        WHERE id = ${user.id}
          AND (role IS NULL OR role <> 'admin')
      `;
    } catch {
      // ログインは続行（role更新失敗は致命的ではない）
    }
  }

  const session = await createSessionForUser(user.id);
  if (session.dbError) {
    const res = NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    clearSessionCookie(res);
    return res;
  }

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, session.token);
  return res;
}
