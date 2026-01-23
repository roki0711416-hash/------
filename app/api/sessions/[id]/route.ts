import { NextResponse } from "next/server";

import { getCurrentUserFromCookies } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function toNonNegativeInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isInteger(n) && n >= 0) return n;
  }
  return null;
}

function toOptionalNonNegativeInt(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return toNonNegativeInt(value);
}

function toOptionalSetting(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const n = toNonNegativeInt(value);
  if (n === null) return null;
  if (n < 1 || n > 6) return null;
  return n;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromCookies();
  if (!user) return jsonError("Unauthorized", 401);

  const db = getDb();
  if (!db) return jsonError("DB is not configured", 500);

  const { id } = await ctx.params;
  if (!id || typeof id !== "string") return jsonError("Invalid id", 400);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  if (!isPlainObject(body)) return jsonError("Invalid body", 400);

  const date = body.date;
  const machineName = body.machineName;
  const games = toNonNegativeInt(body.games);
  const bigCount = toOptionalNonNegativeInt(body.bigCount);
  const regCount = toOptionalNonNegativeInt(body.regCount);
  const guessedSetting = toOptionalSetting(body.guessedSetting);
  const machineNumber = body.machineNumber;
  const shopName = body.shopName;
  const diffCoins = toNonNegativeInt(body.diffCoins);
  const invest = toNonNegativeInt(body.invest);
  const collect = toNonNegativeInt(body.collect);
  const judgeResultId = body.judgeResultId;

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonError("date must be YYYY-MM-DD", 400);
  }
  if (typeof machineName !== "string" || machineName.trim().length === 0) {
    return jsonError("machineName is required", 400);
  }
  if (games === null || diffCoins === null || invest === null || collect === null) {
    return jsonError("games/diffCoins/invest/collect must be non-negative integers", 400);
  }

  if (body.bigCount !== undefined && body.bigCount !== null && body.bigCount !== "" && bigCount === null) {
    return jsonError("bigCount must be a non-negative integer", 400);
  }
  if (body.regCount !== undefined && body.regCount !== null && body.regCount !== "" && regCount === null) {
    return jsonError("regCount must be a non-negative integer", 400);
  }
  if (
    body.guessedSetting !== undefined &&
    body.guessedSetting !== null &&
    body.guessedSetting !== "" &&
    guessedSetting === null
  ) {
    return jsonError("guessedSetting must be 1..6", 400);
  }

  let machineNumberValue: string | null = null;
  if (machineNumber !== undefined && machineNumber !== null && machineNumber !== "") {
    if (typeof machineNumber !== "string") return jsonError("machineNumber must be a string", 400);
    machineNumberValue = machineNumber.trim().slice(0, 64);
  }

  let shopNameValue: string | null = null;
  if (shopName !== undefined && shopName !== null && shopName !== "") {
    if (typeof shopName !== "string") return jsonError("shopName must be a string", 400);
    shopNameValue = shopName.trim().slice(0, 128);
  }

  let judgeResultIdValue: string | null = null;
  if (judgeResultId !== undefined && judgeResultId !== null && judgeResultId !== "") {
    if (typeof judgeResultId !== "string") return jsonError("judgeResultId must be a string", 400);
    judgeResultIdValue = judgeResultId;
  }

  const { rows } = await db.sql`
    UPDATE slot_sessions
    SET
      date = ${date},
      machine_name = ${machineName},
      games = ${games},
      big_count = ${bigCount},
      reg_count = ${regCount},
      guessed_setting = ${guessedSetting},
      machine_number = ${machineNumberValue},
      shop_name = ${shopNameValue},
      diff_coins = ${diffCoins},
      invest = ${invest},
      collect = ${collect},
      judge_result_id = ${judgeResultIdValue}
    WHERE id = ${id} AND user_id = ${user.id}
    RETURNING id
  `;

  if (rows.length === 0) return jsonError("Not found", 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromCookies();
  if (!user) return jsonError("Unauthorized", 401);

  const db = getDb();
  if (!db) return jsonError("DB is not configured", 500);

  const { id } = await ctx.params;
  if (!id || typeof id !== "string") return jsonError("Invalid id", 400);

  const { rows } = await db.sql`
    DELETE FROM slot_sessions
    WHERE id = ${id} AND user_id = ${user.id}
    RETURNING id
  `;

  if (rows.length === 0) return jsonError("Not found", 404);
  return NextResponse.json({ ok: true });
}
