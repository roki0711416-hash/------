import { NextResponse } from "next/server";

import { getCurrentUserFromCookies } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function createId(prefix: string) {
  const nowPart = Date.now().toString(36);
  const randPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${nowPart}_${randPart}`;
}

export async function POST(req: Request) {
  const user = await getCurrentUserFromCookies();
  if (!user) {
    const rl = rateLimit(req, { windowMs: 60_000, max: 20 });
    if (!rl.ok) return jsonError("Too many requests", 429);
  }

  const db = getDb();
  if (!db) return jsonError("DB is not configured", 500);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  if (!isPlainObject(body)) return jsonError("Invalid body", 400);

  const machineType = body.machineType;
  const input = body.input;
  const result = body.result;

  if (typeof machineType !== "string" || machineType.trim().length === 0) {
    return jsonError("machineType is required", 400);
  }

  // input/result はスキーマ固定しない（将来の拡張のため）
  if (!isPlainObject(input)) {
    return jsonError("input must be an object", 400);
  }
  if (!isPlainObject(result)) {
    return jsonError("result must be an object", 400);
  }

  const id = createId("jr");
  await db.sql`
    INSERT INTO judge_results (id, user_id, machine_type, input, result)
    VALUES (${id}, ${user?.id ?? null}, ${machineType}, ${JSON.stringify(input)}, ${JSON.stringify(result)})
  `;

  return NextResponse.json({ ok: true, id });
}
