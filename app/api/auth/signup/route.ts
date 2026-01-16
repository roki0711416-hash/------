import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import {
  clearSessionCookie,
  createSessionForUser,
  hashPassword,
  setSessionCookie,
} from "../../../../lib/auth";
import { randomId } from "../../../../lib/crypto";

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
  if (password.length < 8) {
    return NextResponse.json(
      { error: "パスワードは8文字以上にしてください" },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);
  const userId = randomId("u_");

  try {
    await db.sql`
      INSERT INTO users (id, email, password_hash)
      VALUES (${userId}, ${email}, ${passwordHash})
    `;
  } catch (e) {
    const code =
      typeof e === "object" && e && "code" in e ? (e as { code?: unknown }).code : undefined;
    const msg = e instanceof Error ? e.message : "Failed to create user";

    // DB初期化漏れ
    if (code === "42P01" || msg.toLowerCase().includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "DBのテーブルが未作成です。ローカルなら `npm run db:init-auth` を実行してから再度お試しください。",
        },
        { status: 503 },
      );
    }

    // unique violation をざっくり吸収
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const session = await createSessionForUser(userId);
  if (session.dbError) {
    const res = NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    clearSessionCookie(res);
    return res;
  }

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, session.token);
  return res;
}
