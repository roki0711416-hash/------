import { NextResponse } from "next/server";
import { getMachineById } from "@/lib/machines";
import {
  calcSettingPosteriors,
  topNSettings,
  type JudgeInput,
} from "@/lib/judge";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function isFiniteNonNeg(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

// ---------------------------------------------------------------------------
// POST /api/v1/judge
// ---------------------------------------------------------------------------

/**
 * iOS (and other clients) から呼ばれる設定判別 API.
 *
 * Request body (JSON):
 *   machineId: string          – 機種 ID（必須）
 *   game:      number          – 総ゲーム数（≥1）
 *   big:       number          – BIG 回数（≥0）
 *   reg:       number          – REG 回数（≥0）
 *   budo?:     number          – ぶどう回数（≥0, optional）
 *
 * Response (200):
 *   { top3: [ { setting: number|string, score: number } ] }
 */
export async function POST(req: Request) {
  // --- parse body -----------------------------------------------------------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return jsonError(400, "Request body must be a JSON object");
  }

  const {
    machineId,
    game,
    big,
    reg,
    budo,
  } = body as Record<string, unknown>;

  // --- machineId ------------------------------------------------------------
  if (typeof machineId !== "string" || machineId.trim() === "") {
    return jsonError(400, "machineId (string) は必須です");
  }

  // --- game -----------------------------------------------------------------
  if (!isFiniteNonNeg(game) || game < 1 || !Number.isInteger(game)) {
    return jsonError(400, "game は 1 以上の整数を指定してください");
  }

  // --- big / reg ------------------------------------------------------------
  if (!isFiniteNonNeg(big) || !Number.isInteger(big)) {
    return jsonError(400, "big は 0 以上の整数を指定してください");
  }
  if (!isFiniteNonNeg(reg) || !Number.isInteger(reg)) {
    return jsonError(400, "reg は 0 以上の整数を指定してください");
  }
  if (big + reg > game) {
    return jsonError(400, "big + reg が game を超えています");
  }

  // --- budo (optional) ------------------------------------------------------
  if (budo !== undefined && budo !== null) {
    if (!isFiniteNonNeg(budo) || !Number.isInteger(budo)) {
      return jsonError(400, "budo は 0 以上の整数を指定してください");
    }
    if ((budo as number) > game) {
      return jsonError(400, "budo が game を超えています");
    }
  }

  // --- machine lookup -------------------------------------------------------
  const machine = await getMachineById(machineId.trim());
  if (!machine) {
    return jsonError(404, "指定された機種が見つかりません");
  }

  // --- build JudgeInput & calculate -----------------------------------------
  const input: JudgeInput = {
    games: game as number,
    bigCount: big as number,
    regCount: reg as number,
  };

  // ぶどう → extras.grape として渡す（機種 odds に grape がある場合のみ有効）
  if (typeof budo === "number") {
    input.extraCounts = { grape: budo };
  }

  const posteriors = calcSettingPosteriors(machine.odds.settings, input);
  const top3 = topNSettings(posteriors, 3);

  return NextResponse.json({
    top3: top3.map((t) => ({
      setting: t.s,
      score: Math.round(t.posterior * 10000) / 10000, // 小数4桁
    })),
  });
}
