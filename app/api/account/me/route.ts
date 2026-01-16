import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { getCurrentUserFromCookies } from "../../../../lib/auth";
import { getSubscriptionForUserId, isPremiumStatus } from "../../../../lib/premium";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const user = await getCurrentUserFromCookies();
  if (!user) {
    return NextResponse.json({ loggedIn: false, username: null, isPremium: false });
  }

  const db = getDb();
  if (!db) {
    return jsonError(
      503,
      "DBが未設定です。Vercelの環境変数に DATABASE_URL（Neon接続文字列）または POSTGRES_URL を設定してください。",
    );
  }

  const { rows } = await db.sql`SELECT username FROM users WHERE id = ${user.id} LIMIT 1`;
  const row = rows[0] as { username: string | null } | undefined;
  const username = row?.username ?? null;

  const sub = await getSubscriptionForUserId(user.id);
  const isPremium = isPremiumStatus(sub?.status ?? null);

  return NextResponse.json({ loggedIn: true, username, isPremium });
}
