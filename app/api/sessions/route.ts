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

  const id = createId("ss");
  await db.sql`
    INSERT INTO slot_sessions (
      id,
      user_id,
      date,
      machine_name,
      games,
      big_count,
      reg_count,
      guessed_setting,
      machine_number,
      shop_name,
      diff_coins,
      invest,
      collect,
      judge_result_id
    ) VALUES (
      ${id},
      ${user?.id ?? null},
      ${date},
      ${machineName},
      ${games},
      ${bigCount},
      ${regCount},
      ${guessedSetting},
      ${machineNumberValue},
      ${shopNameValue},
      ${diffCoins},
      ${invest},
      ${collect},
      ${judgeResultIdValue}
    )
  `;

  return NextResponse.json({ ok: true, id });
}
