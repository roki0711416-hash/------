import crypto from "node:crypto";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { getDb } from "./db";
import { randomId, randomToken, sha256Hex } from "./crypto";

const COOKIE_NAME = "slokasu_session";

function dbUnavailableResponse() {
  return NextResponse.json(
    {
      error:
        "DBが未設定です。Vercelの環境変数に DATABASE_URL（Neon接続文字列）または POSTGRES_URL を設定してください。",
    },
    { status: 503 },
  );
}

export type CurrentUser = {
  id: string;
  email: string;
  stripeCustomerId: string | null;
  role: string | null;
};

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  // format: scrypt$<salt>$<derivedKey>
  return `scrypt$${salt}$${derivedKey}`;
}

export async function verifyPassword(password: string, hash: string) {
  const parts = hash.split("$");
  if (parts.length !== 3) return false;
  const [algo, salt, derivedKeyHex] = parts;
  if (algo !== "scrypt") return false;
  if (!salt || !derivedKeyHex) return false;

  const derivedKey = Buffer.from(derivedKeyHex, "hex");
  const testKey = crypto.scryptSync(password, salt, derivedKey.length);
  return (
    derivedKey.length === testKey.length &&
    crypto.timingSafeEqual(derivedKey, testKey)
  );
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function createSessionForUser(userId: string) {
  const db = getDb();
  if (!db) return { dbError: true as const };

  // 端末共有NG: 常に「最後にログインした1セッションだけ」を有効にする
  await db.sql`UPDATE sessions SET revoked_at = now() WHERE user_id = ${userId} AND revoked_at IS NULL;`;

  const sessionId = randomId("s_");
  const token = randomToken(32);
  const tokenHash = sha256Hex(token);

  await db.sql`
    INSERT INTO sessions (id, user_id, token_hash)
    VALUES (${sessionId}, ${userId}, ${tokenHash})
  `;

  await db.sql`UPDATE users SET active_session_id = ${sessionId} WHERE id = ${userId};`;

  return { dbError: false as const, sessionId, token };
}

export async function getCurrentUserFromCookies(): Promise<CurrentUser | null> {
  // This function is used by Server Components and API routes.
  // Ensure role/session changes are reflected immediately (no static caching).
  noStore();

  const authDebug = process.env.SLOKASU_AUTH_DEBUG === "1";

  const db = getDb();
  if (!db) return null;

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  if (authDebug) {
    // Never log full tokens. Use a short prefix only for troubleshooting.
    const tokenPrefix = token.slice(0, 8);
    console.log("[auth] cookie token prefix:", tokenPrefix);
  }

  const tokenHash = sha256Hex(token);

  if (authDebug) {
    console.log("[auth] cookie token hash prefix:", tokenHash.slice(0, 12));
  }

  // 1) Resolve session -> userId (do not embed role in the session)
  const sessionResult = await db.sql`
    SELECT s.id as session_id, s.user_id
    FROM sessions s
    WHERE s.token_hash = ${tokenHash}
      AND s.revoked_at IS NULL
    LIMIT 1
  `;

  const sessionRow = sessionResult.rows[0] as
    | { session_id: string; user_id: string }
    | undefined;
  if (!sessionRow) return null;

  if (authDebug) {
    console.log("[auth] sessions.id:", sessionRow.session_id, "user_id:", sessionRow.user_id);
  }

  // 2) Always fetch current user info (including role) from users table
  const userResult = await db.sql`
    SELECT id, email, role, stripe_customer_id, active_session_id
    FROM users
    WHERE id = ${sessionRow.user_id}
    LIMIT 1
  `;

  const userRow = userResult.rows[0] as
    | {
        id: string;
        email: string;
        role: string | null;
        stripe_customer_id: string | null;
        active_session_id: string | null;
      }
    | undefined;
  if (!userRow) return null;

  if (authDebug) {
    console.log("[auth] users.active_session_id:", userRow.active_session_id);
  }
  if (!userRow.active_session_id || userRow.active_session_id !== sessionRow.session_id) return null;

  return {
    id: userRow.id,
    email: userRow.email,
    stripeCustomerId: userRow.stripe_customer_id,
    role: userRow.role ?? null,
  };
}

export async function requireCurrentUserOrJsonError() {
  const db = getDb();
  if (!db) return { ok: false as const, response: dbUnavailableResponse() };

  const user = await getCurrentUserFromCookies();
  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "ログインが必要です" }, { status: 401 }),
    };
  }

  return { ok: true as const, user };
}
