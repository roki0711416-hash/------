import { cookies } from "next/headers";
import { getPool, mustGetPool } from "./db";
import { randomToken, randomUuid, sha256Base64Url } from "./crypto";

export const SESSION_COOKIE = "slokasu_session";
export const DEVICE_COOKIE = "slokasu_device";

const SESSION_TTL_DAYS = 30;
const LOGIN_TOKEN_TTL_MIN = 15;

export type Viewer = {
  userId: string;
  email: string;
  subscriptionStatus: string | null;
  premium: boolean;
  deviceId: string | null;
  deviceBound: boolean;
  deviceMatch: boolean;
};

function isPremiumPreview(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.SLOKASU_PREMIUM_PREVIEW === "1"
  );
}

function isPremiumStatus(status: string | null): boolean {
  return status === "active" || status === "trialing";
}

export async function getViewer(): Promise<Viewer | null> {
  if (isPremiumPreview()) {
    return {
      userId: "00000000-0000-0000-0000-000000000001",
      email: "preview@example.com",
      subscriptionStatus: "active",
      premium: true,
      deviceId: "preview-device",
      deviceBound: true,
      deviceMatch: true,
    };
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  const deviceId = cookieStore.get(DEVICE_COOKIE)?.value ?? null;
  if (!sessionId) return null;

  const db = getPool();
  if (!db) return null;
  const now = new Date();

  const { rows } = await db.sql`
    SELECT s.user_id as user_id, u.email as email, u.subscription_status as subscription_status, u.device_id as device_id
    FROM auth_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${sessionId} AND s.expires_at > ${now.toISOString()}
    LIMIT 1
  `;

  const row = rows[0] as
    | {
        user_id: string;
        email: string;
        subscription_status: string | null;
        device_id: string | null;
      }
    | undefined;

  if (!row) return null;

  const premium = isPremiumStatus(row.subscription_status);
  const deviceBound = !!row.device_id;
  const deviceMatch = deviceBound && !!deviceId && row.device_id === deviceId;

  return {
    userId: row.user_id,
    email: row.email,
    subscriptionStatus: row.subscription_status,
    premium: premium && deviceMatch,
    deviceId: row.device_id,
    deviceBound,
    deviceMatch,
  };
}

export async function ensureDeviceCookie(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(DEVICE_COOKIE)?.value;
  return existing ?? randomUuid();
}

export async function createOrGetUserByEmail(emailRaw: string): Promise<{ id: string; email: string } | null> {
  const email = emailRaw.trim().toLowerCase();
  if (!email || !email.includes("@")) return null;

  const db = mustGetPool();

  const existing = await db.sql`
    SELECT id, email FROM users WHERE email = ${email} LIMIT 1
  `;
  if (existing.rows[0]) {
    const row = existing.rows[0] as { id: string; email: string };
    return { id: row.id, email: row.email };
  }

  const id = randomUuid();
  await db.sql`
    INSERT INTO users (id, email)
    VALUES (${id}, ${email})
  `;
  return { id, email };
}

export async function createLoginToken(userId: string): Promise<{ token: string; expiresAt: Date }>{
  const db = mustGetPool();
  const token = randomToken(32);
  const tokenHash = sha256Base64Url(token);
  const expiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_MIN * 60_000);

  await db.sql`
    INSERT INTO auth_login_tokens (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}, ${expiresAt.toISOString()})
  `;

  return { token, expiresAt };
}

export async function consumeLoginToken(token: string): Promise<string | null> {
  const db = mustGetPool();
  const tokenHash = sha256Base64Url(token);
  const now = new Date();

  const { rows } = await db.sql`
    SELECT user_id FROM auth_login_tokens
    WHERE token_hash = ${tokenHash} AND expires_at > ${now.toISOString()}
    LIMIT 1
  `;

  const row = rows[0] as { user_id: string } | undefined;
  if (!row) return null;

  await db.sql`DELETE FROM auth_login_tokens WHERE token_hash = ${tokenHash}`;
  return row.user_id;
}

export async function createSession(userId: string): Promise<{ sessionId: string; expiresAt: Date }> {
  const db = mustGetPool();
  const sessionId = randomToken(24);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60_000);

  await db.sql`
    INSERT INTO auth_sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt.toISOString()})
  `;

  return { sessionId, expiresAt };
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = mustGetPool();
  await db.sql`DELETE FROM auth_sessions WHERE id = ${sessionId}`;
}

export async function bindDeviceToUser(userId: string, deviceId: string): Promise<
  | { ok: true; bound: true }
  | { ok: true; bound: false }
  | { ok: false; reason: "device_mismatch" }
> {
  const db = mustGetPool();
  const { rows } = await db.sql`
    SELECT device_id FROM users WHERE id = ${userId} LIMIT 1
  `;

  const row = rows[0] as { device_id: string | null } | undefined;
  if (!row) return { ok: false, reason: "device_mismatch" };

  if (!row.device_id) {
    await db.sql`
      UPDATE users
      SET device_id = ${deviceId}, device_bound_at = now()
      WHERE id = ${userId}
    `;
    return { ok: true, bound: true };
  }

  if (row.device_id !== deviceId) {
    return { ok: false, reason: "device_mismatch" };
  }

  return { ok: true, bound: false };
}

export async function canRequestDeviceReset(userId: string): Promise<{ ok: boolean; remaining: number }>{
  const db = mustGetPool();
  const since = new Date(Date.now() - 24 * 60 * 60_000);

  const { rows } = await db.sql`
    SELECT COUNT(*)::int AS cnt
    FROM device_reset_requests
    WHERE user_id = ${userId} AND requested_at > ${since.toISOString()}
  `;
  const cnt = (rows[0] as { cnt: number } | undefined)?.cnt ?? 0;
  const limit = 3;
  const remaining = Math.max(0, limit - cnt);
  return { ok: cnt < limit, remaining };
}

export async function createDeviceResetToken(userId: string): Promise<string> {
  const db = mustGetPool();
  const token = randomToken(32);
  const tokenHash = sha256Base64Url(token);
  const expiresAt = new Date(Date.now() + 60 * 60_000); // 1h

  await db.sql`
    INSERT INTO device_reset_requests (user_id) VALUES (${userId})
  `;

  await db.sql`
    INSERT INTO device_reset_tokens (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}, ${expiresAt.toISOString()})
  `;

  return token;
}

export async function consumeDeviceResetToken(token: string): Promise<string | null> {
  const db = mustGetPool();
  const tokenHash = sha256Base64Url(token);
  const now = new Date();

  const { rows } = await db.sql`
    SELECT user_id
    FROM device_reset_tokens
    WHERE token_hash = ${tokenHash} AND expires_at > ${now.toISOString()} AND used_at IS NULL
    LIMIT 1
  `;
  const row = rows[0] as { user_id: string } | undefined;
  if (!row) return null;

  await db.sql`
    UPDATE device_reset_tokens
    SET used_at = now()
    WHERE token_hash = ${tokenHash}
  `;

  // Clear bound device and invalidate sessions.
  await db.sql`UPDATE users SET device_id = NULL, device_bound_at = NULL WHERE id = ${row.user_id}`;
  await db.sql`DELETE FROM auth_sessions WHERE user_id = ${row.user_id}`;

  return row.user_id;
}
