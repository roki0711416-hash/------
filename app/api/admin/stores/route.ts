import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import crypto from "node:crypto";

export const runtime = "nodejs";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

// GET /api/admin/stores — 全店舗一覧
export async function GET() {
  const auth = await requireAdmin();
  if ("forbiddenResponse" in auth) return auth.forbiddenResponse;

  const db = getDb();
  if (!db) return jsonError(503, "DB未設定");

  const { rows } = await db.sql`SELECT * FROM stores ORDER BY prefecture, name`;
  return NextResponse.json({ stores: rows });
}

// POST /api/admin/stores — 店舗追加/更新
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("forbiddenResponse" in auth) return auth.forbiddenResponse;

  const db = getDb();
  if (!db) return jsonError(503, "DB未設定");

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const prefecture = typeof body.prefecture === "string" ? body.prefecture.trim() : "";
  if (!name || !prefecture) {
    return jsonError(400, "name と prefecture は必須です");
  }

  const id =
    typeof body.id === "string" && body.id.trim()
      ? body.id.trim()
      : `store_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const city = typeof body.city === "string" ? body.city.trim() || null : null;
  const address = typeof body.address === "string" ? body.address.trim() || null : null;

  await db.sql`
    INSERT INTO stores (id, name, prefecture, city, address)
    VALUES (${id}, ${name}, ${prefecture}, ${city}, ${address})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      prefecture = EXCLUDED.prefecture,
      city = EXCLUDED.city,
      address = EXCLUDED.address,
      updated_at = now()
  `;

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
