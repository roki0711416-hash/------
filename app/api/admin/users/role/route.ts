import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";
import { requireCurrentUserOrJsonError } from "../../../../../lib/auth";
import { isAdminRole, shouldBeAdminFromEnv } from "../../../../../lib/roles";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

type RoleInput = "admin" | "dev" | "user" | null;

function parseRole(v: unknown): "admin" | "dev" | null {
  if (v === null) return null;
  if (v === "admin" || v === "dev") return v;
  if (v === "user" || v === "") return null;
  return null;
}

export async function POST(req: Request) {
  const auth = await requireCurrentUserOrJsonError();
  if (!auth.ok) return auth.response;

  const isAdmin =
    isAdminRole(auth.user.role) ||
    shouldBeAdminFromEnv({ userId: auth.user.id, email: auth.user.email });
  if (!isAdmin) return jsonError(403, "管理者のみ実行できます。");

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
  const emailRaw = typeof payload.email === "string" ? payload.email : "";
  const roleRaw = (payload.role as RoleInput) ?? null;

  const email = normalizeEmail(emailRaw);
  if (!email || !email.includes("@")) {
    return jsonError(400, "メールアドレスが不正です");
  }

  const role = parseRole(roleRaw);
  if (roleRaw !== null && roleRaw !== "admin" && roleRaw !== "dev" && roleRaw !== "user" && roleRaw !== "") {
    return jsonError(400, "role は admin/dev/user のいずれかです");
  }

  const { rows } = await db.sql`
    UPDATE users
    SET role = ${role}
    WHERE email = ${email}
    RETURNING id
  `;

  if (rows.length === 0) {
    return jsonError(404, "対象ユーザーが見つかりません");
  }

  return NextResponse.json({ ok: true });
}
