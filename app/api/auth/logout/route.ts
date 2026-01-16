import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "../../../../lib/db";
import { clearSessionCookie } from "../../../../lib/auth";
import { sha256Hex } from "../../../../lib/crypto";

export const runtime = "nodejs";

export async function POST() {
  const db = getDb();
  const token = (await cookies()).get("slokasu_session")?.value;

  if (db && token) {
    const tokenHash = sha256Hex(token);
    await db.sql`UPDATE sessions SET revoked_at = now() WHERE token_hash = ${tokenHash} AND revoked_at IS NULL;`;
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
