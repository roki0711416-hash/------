import { NextResponse } from "next/server";

import { getCurrentUserFromCookies } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromCookies();
  if (!user) {
    const rl = rateLimit(req, { windowMs: 60_000, max: 60 });
    if (!rl.ok) return jsonError("Too many requests", 429);
  }

  const db = getDb();
  if (!db) return jsonError("DB is not configured", 500);

  const { id } = await ctx.params;
  if (!id || typeof id !== "string") return jsonError("Invalid id", 400);
  const rows = await db.sql<{
    id: string;
    user_id: string | null;
    machine_type: string;
    input: unknown;
    result: unknown;
    created_at: string;
  }>`
    SELECT id, user_id, machine_type, input, result, created_at
    FROM judge_results
    WHERE id = ${id}
    LIMIT 1
  `;

  const row = rows.rows[0];
  if (!row) return jsonError("Not found", 404);

  // user_id があるデータは、本人のみ取得可
  if (row.user_id && (!user || user.id !== row.user_id)) {
    return jsonError("Forbidden", 403);
  }

  return NextResponse.json({ ok: true, judgeResult: row });
}
