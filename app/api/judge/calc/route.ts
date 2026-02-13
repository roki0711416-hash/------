import { NextResponse } from "next/server";
import { getMachineById } from "@/lib/machines";
import { calcSettingPosteriors, topNSettings } from "@/lib/judge";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function toInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return badRequest("JSONの解析に失敗しました");
  }

  if (typeof json !== "object" || json === null) {
    return badRequest("リクエストボディが不正です");
  }

  const body = json as Record<string, unknown>;
  const machineId = typeof body.machineId === "string" ? body.machineId.trim() : "";
  if (!machineId) return badRequest("machineId は必須です");

  const machine = await getMachineById(machineId);
  if (!machine) return badRequest("指定された機種が見つかりません");

  const inputs = body.inputs;
  if (typeof inputs !== "object" || inputs === null || Array.isArray(inputs)) {
    return badRequest("inputs が不正です");
  }
  const map = inputs as Record<string, unknown>;

  const games = toInt(map.G);
  if (!(typeof games === "number" && games > 0)) {
    return badRequest("inputs.G は1以上の整数で指定してください");
  }

  const extraCounts: Record<string, number> = {};
  const binomialTrials: Record<string, number> = {};
  const binomialHits: Record<string, number> = {};

  for (const [k, v] of Object.entries(map)) {
    if (!k.startsWith("EXTRA_")) continue;
    const metricId = k.slice("EXTRA_".length);
    if (!metricId) continue;
    const n = toInt(v);
    if (typeof n === "number" && n >= 0) extraCounts[metricId] = n;
  }

  for (const [k, v] of Object.entries(map)) {
    if (k.startsWith("BIN_TRIALS_")) {
      const metricId = k.slice("BIN_TRIALS_".length);
      const n = toInt(v);
      if (metricId && typeof n === "number" && n >= 0) binomialTrials[metricId] = n;
    }
    if (k.startsWith("BIN_HITS_")) {
      const metricId = k.slice("BIN_HITS_".length);
      const n = toInt(v);
      if (metricId && typeof n === "number" && n >= 0) binomialHits[metricId] = n;
    }
  }

  const posteriors = calcSettingPosteriors(machine.odds.settings, {
    games,
    bigCount: toInt(map.BIG) ?? undefined,
    regCount: toInt(map.REG) ?? undefined,
    extraCount: toInt(map.EXTRA) ?? undefined,
    extraCounts: Object.keys(extraCounts).length > 0 ? extraCounts : undefined,
    binomialTrials: Object.keys(binomialTrials).length > 0 ? binomialTrials : undefined,
    binomialHits: Object.keys(binomialHits).length > 0 ? binomialHits : undefined,
    suikaTrials: toInt(map.SUIKA_TRIALS) ?? undefined,
    suikaCzHits: toInt(map.SUIKA_CZ_HITS) ?? undefined,
    uraAtTrials: toInt(map.URA_AT_TRIALS) ?? undefined,
    uraAtHits: toInt(map.URA_AT_HITS) ?? undefined,
  });

  if (!posteriors.length) {
    return badRequest("入力値が不正です");
  }

  const top3 = topNSettings(posteriors, 3).map((p) => ({
    setting: `設定${String(p.s)}`,
    prob: p.posterior,
  }));

  return NextResponse.json({
    top3,
    note: "Webと同一ロジック（lib/judge.ts）で算出",
  });
}
