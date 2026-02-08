import { NextResponse } from "next/server";
import { getMachineById } from "@/lib/machines";
import { getHintConfig, type HintEffect } from "@/content/hints";

type Top3Item = { label: string; percent: number };

type JudgeOk = {
  top3: Top3Item[];
};

type JudgeErr = {
  error: string;
};

function badRequest(message: string) {
  return NextResponse.json<JudgeErr>({ error: message }, { status: 400 });
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value)) return null;
  return value;
}

function safeProbFromDenom(denom: number): number {
  if (!Number.isFinite(denom) || denom <= 0) return 0;
  return 1 / denom;
}

function settingKeyToNumber(key: number | string): number {
  if (typeof key === "number") return key;
  const normalized = String(key).trim().toLowerCase();
  if (normalized === "v") return 5;
  const n = Number(key);
  return Number.isFinite(n) ? n : Number.NaN;
}

function toHintCounts(value: unknown): Record<string, number> | null {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) return null;

  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof k !== "string" || k.trim() === "") continue;
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    const n = Math.max(0, Math.trunc(v));
    out[k] = n;
  }
  return out;
}

function toExtraCounts(value: unknown): Record<string, number> | null {
  // Same shape as hintCounts: { metricId: count }
  return toHintCounts(value);
}

function toBinomialCounts(value: unknown): Record<string, number> | null {
  // Same shape as hintCounts: { metricId: count }
  return toHintCounts(value);
}

function applyHintEffectToWeights(args: {
  effect: HintEffect;
  count: number;
  weightsBySetting: Map<number, number>;
}) {
  const { effect, count, weightsBySetting } = args;
  if (!(count > 0)) return;

  switch (effect.type) {
    case "none":
      return;
    case "minSetting": {
      for (const s of Array.from(weightsBySetting.keys())) {
        if (s < effect.min) weightsBySetting.set(s, 0);
      }
      return;
    }
    case "exactSetting": {
      for (const s of Array.from(weightsBySetting.keys())) {
        if (s !== effect.exact) weightsBySetting.set(s, 0);
      }
      return;
    }
    case "excludeSetting": {
      weightsBySetting.set(effect.exclude, 0);
      return;
    }
    case "weight": {
      for (const [sRaw, w] of Object.entries(effect.weights)) {
        const s = Number(sRaw);
        if (!Number.isFinite(s) || !(s >= 1 && s <= 6)) continue;
        const cur = weightsBySetting.get(s) ?? 1;
        const factor = Number.isFinite(w) && w > 0 ? w : 1;
        weightsBySetting.set(s, cur * Math.pow(factor, count));
      }
      return;
    }
    case "allOf": {
      for (const e of effect.effects) {
        applyHintEffectToWeights({ effect: e, count, weightsBySetting });
      }
      return;
    }
    default: {
      const _exhaustive: never = effect;
      return _exhaustive;
    }
  }
}

function computeDistanceJudgeTop3(args: {
  games: number;
  big: number;
  reg: number;
  budo?: number;
  oddsSettings: Array<{
    s: number | string;
    big: number;
    reg: number;
    total: number;
    extras?: Record<string, number>;
    binomialRates?: Record<string, number>;
    suikaCzRate?: number;
    uraAtRate?: number;
  }>;
  grapeKey?: string;
  hintWeightsBySetting?: Map<number, number>;
  extraCounts?: Record<string, number>;
  binomialTrials?: Record<string, number>;
  binomialHits?: Record<string, number>;
  suikaTrials?: number;
  suikaCzHits?: number;
  uraAtTrials?: number;
  uraAtHits?: number;
}): JudgeOk {
  const eps = 1e-12;
  const games = Math.max(1, args.games);
  const pBigObs = args.big / games;
  const pRegObs = args.reg / games;
  const pTotalObs = (args.big + args.reg) / games;
  const pGrapeObs = args.budo !== undefined ? args.budo / games : undefined;

  const extraObserved = (() => {
    const out: Array<{ id: string; pObs: number }> = [];
    if (args.extraCounts) {
      for (const [id, count] of Object.entries(args.extraCounts)) {
        if (typeof id !== "string" || id.trim() === "") continue;
        if (typeof count !== "number" || !Number.isFinite(count)) continue;
        if (!(count > 0)) continue;
        out.push({ id, pObs: count / games });
      }
    }
    if (args.grapeKey && pGrapeObs !== undefined) {
      // budo は grape として統一して扱う
      out.push({ id: args.grapeKey, pObs: pGrapeObs });
    }
    return out;
  })();

  const binomialObserved = (() => {
    const out: Array<{ id: string; pObs: number }> = [];
    if (!args.binomialTrials) return out;

    for (const [id, trialsRaw] of Object.entries(args.binomialTrials)) {
      if (typeof id !== "string" || id.trim() === "") continue;
      if (typeof trialsRaw !== "number" || !Number.isFinite(trialsRaw)) continue;
      const trials = Math.max(0, Math.trunc(trialsRaw));
      if (!(trials > 0)) continue;

      const hitsRaw = args.binomialHits?.[id] ?? 0;
      const hits =
        typeof hitsRaw === "number" && Number.isFinite(hitsRaw) ? Math.max(0, Math.trunc(hitsRaw)) : 0;
      const safeHits = Math.min(hits, trials);
      out.push({ id, pObs: safeHits / trials });
    }

    return out;
  })();

  const suikaCzObserved = (() => {
    if (!(typeof args.suikaTrials === "number" && Number.isFinite(args.suikaTrials))) return null;
    if (!(typeof args.suikaCzHits === "number" && Number.isFinite(args.suikaCzHits))) return null;
    const trials = Math.max(0, Math.trunc(args.suikaTrials));
    if (!(trials > 0)) return null;
    const hits = Math.max(0, Math.trunc(args.suikaCzHits));
    const safeHits = Math.min(hits, trials);
    return safeHits / trials;
  })();

  const uraAtObserved = (() => {
    if (!(typeof args.uraAtTrials === "number" && Number.isFinite(args.uraAtTrials))) return null;
    if (!(typeof args.uraAtHits === "number" && Number.isFinite(args.uraAtHits))) return null;
    const trials = Math.max(0, Math.trunc(args.uraAtTrials));
    if (!(trials > 0)) return null;
    const hits = Math.max(0, Math.trunc(args.uraAtHits));
    const safeHits = Math.min(hits, trials);
    return safeHits / trials;
  })();

  const scored = args.oddsSettings.map((st) => {
    const settingN = settingKeyToNumber(st.s);
    const pBigTh = safeProbFromDenom(st.big);
    const pRegTh = safeProbFromDenom(st.reg);
    const pTotalTh = safeProbFromDenom(st.total);

    let dist = 0;
    dist += (pBigObs - pBigTh) ** 2;
    dist += (pRegObs - pRegTh) ** 2;
    dist += (pTotalObs - pTotalTh) ** 2;

    if (args.grapeKey && pGrapeObs !== undefined) {
      const denom = st.extras?.[args.grapeKey];
      if (typeof denom === "number") {
        const pGrapeTh = safeProbFromDenom(denom);
        dist += (pGrapeObs - pGrapeTh) ** 2;
      }
    }

    // extraMetrics: {metricId: 1/denom} を distance に追加
    if (extraObserved.length > 0) {
      for (const ex of extraObserved) {
        if (args.grapeKey && ex.id === args.grapeKey) continue; // grapeは上で処理済み
        const denom = st.extras?.[ex.id];
        if (typeof denom !== "number") continue;
        const pTh = safeProbFromDenom(denom);
        dist += (ex.pObs - pTh) ** 2;
      }
    }

    // binomialRates: {metricId: p} を distance に追加
    if (binomialObserved.length > 0) {
      for (const ex of binomialObserved) {
        const pTh = st.binomialRates?.[ex.id];
        if (typeof pTh !== "number" || !Number.isFinite(pTh)) continue;
        if (!(pTh >= 0 && pTh <= 1)) continue;
        dist += (ex.pObs - pTh) ** 2;
      }
    }

    if (suikaCzObserved !== null) {
      const pTh = st.suikaCzRate;
      if (typeof pTh === "number" && Number.isFinite(pTh) && pTh >= 0 && pTh <= 1) {
        dist += (suikaCzObserved - pTh) ** 2;
      }
    }

    if (uraAtObserved !== null) {
      const pTh = st.uraAtRate;
      if (typeof pTh === "number" && Number.isFinite(pTh) && pTh >= 0 && pTh <= 1) {
        dist += (uraAtObserved - pTh) ** 2;
      }
    }

    let score = 1 / (dist + eps);

    if (Number.isFinite(settingN) && args.hintWeightsBySetting) {
      const w = args.hintWeightsBySetting.get(settingN);
      if (typeof w === "number") score *= Math.max(0, w);
    }

    return {
      s: st.s,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);
  const sum = top.reduce((acc, cur) => acc + cur.score, 0) || 1;

  const top3: Top3Item[] = top.map((t) => ({
    label: `設定${String(t.s)}`,
    percent: Math.round(((t.score / sum) * 100) * 10) / 10,
  }));

  return { top3 };
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

  const machineRaw = body.machine;
  if (typeof machineRaw !== "string" || machineRaw.trim() === "") {
    return badRequest("machine は必須です");
  }
  const machineId = machineRaw.trim();

  const machine = await getMachineById(machineId);
  if (!machine) {
    return badRequest("指定された機種が見つかりません");
  }

  const gamesRaw = toFiniteNumber(body.games);
  const bigRaw = toFiniteNumber(body.big);
  const regRaw = toFiniteNumber(body.reg);

  if (gamesRaw === null || bigRaw === null || regRaw === null) {
    return badRequest("games/big/reg は数値で指定してください");
  }

  const games = Math.max(1, Math.floor(gamesRaw));
  const big = Math.max(0, Math.floor(bigRaw));
  const reg = Math.max(0, Math.floor(regRaw));

  let budo: number | undefined;
  if (body.budo !== undefined) {
    const budoParsed = toFiniteNumber(body.budo);
    if (budoParsed === null) {
      return badRequest("budo は数値で指定してください");
    }
    budo = Math.max(0, Math.floor(budoParsed));
  }

  // ぶどう(=grape) が機種データにある場合のみ budo を計算に含める
  const grapeKey =
    machine.metricsLabels?.extraMetrics?.some((m) => m.id === "grape") ||
    machine.odds.settings.some((s) => !!s.extras?.grape)
      ? "grape"
      : undefined;

  const extraCountsParsed = toExtraCounts(body.extraCounts);
  if (extraCountsParsed === null) {
    return badRequest("extraCounts が不正です");
  }

  const binomialTrialsParsed = toBinomialCounts(body.binomialTrials);
  if (binomialTrialsParsed === null) {
    return badRequest("binomialTrials が不正です");
  }
  const binomialHitsParsed = toBinomialCounts(body.binomialHits);
  if (binomialHitsParsed === null) {
    return badRequest("binomialHits が不正です");
  }

  const hintCountsParsed = toHintCounts(body.hintCounts);
  if (hintCountsParsed === null) {
    return badRequest("hintCounts が不正です");
  }

  let suikaTrials: number | undefined;
  if (body.suikaTrials !== undefined) {
    const n = toFiniteNumber(body.suikaTrials);
    if (n === null) return badRequest("suikaTrials は数値で指定してください");
    suikaTrials = Math.max(0, Math.floor(n));
  }
  let suikaCzHits: number | undefined;
  if (body.suikaCzHits !== undefined) {
    const n = toFiniteNumber(body.suikaCzHits);
    if (n === null) return badRequest("suikaCzHits は数値で指定してください");
    suikaCzHits = Math.max(0, Math.floor(n));
  }

  let uraAtTrials: number | undefined;
  if (body.uraAtTrials !== undefined) {
    const n = toFiniteNumber(body.uraAtTrials);
    if (n === null) return badRequest("uraAtTrials は数値で指定してください");
    uraAtTrials = Math.max(0, Math.floor(n));
  }
  let uraAtHits: number | undefined;
  if (body.uraAtHits !== undefined) {
    const n = toFiniteNumber(body.uraAtHits);
    if (n === null) return badRequest("uraAtHits は数値で指定してください");
    uraAtHits = Math.max(0, Math.floor(n));
  }

  const hintConfig = getHintConfig(machine.id);
  const hintWeightsBySetting = new Map<number, number>([
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
    [6, 1],
  ]);

  if (hintConfig) {
    for (const g of hintConfig.groups) {
      for (const it of g.items) {
        const c = hintCountsParsed[it.id] ?? 0;
        applyHintEffectToWeights({ effect: it.effect, count: c, weightsBySetting: hintWeightsBySetting });
      }
    }
  }

  const result = computeDistanceJudgeTop3({
    games,
    big,
    reg,
    budo,
    oddsSettings: machine.odds.settings,
    grapeKey,
    hintWeightsBySetting,
    extraCounts: extraCountsParsed,
    binomialTrials: binomialTrialsParsed,
    binomialHits: binomialHitsParsed,
    suikaTrials,
    suikaCzHits,
    uraAtTrials,
    uraAtHits,
  });
  return NextResponse.json<JudgeOk>(result);
}
