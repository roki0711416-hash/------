import { computeSlumpMetrics, type SlumpMetrics } from "./slumpMetrics";

import type { MachineType } from "./slumpTypes";

export type Point = { x: number; y: number };

export type SlumpAnalyzePoints = {
  start: Point;
  end: Point;
  yMax: number;
  yMin: number;
};

export type SlumpAnalyzeInput = {
  machineType: MachineType;
  points: SlumpAnalyzePoints;
  slumpLine: Point[];
  spins?: number;
};

export type NormalizedSlump = {
  x: number[];
  diffCoins: number[];
  baselineCoins: number;
  axisRangeCoins: number;
};

export type SlumpDecision = {
  biasZ: number; // -1..1
  graphConfidence: number; // 0..1
  decisionHint: string;
};

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function safeTanh(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.tanh(x);
}

function nearestIndexByX(xs: number[], x: number) {
  if (xs.length === 0) return -1;
  let best = 0;
  let bestDist = Math.abs(xs[0] - x);
  for (let i = 1; i < xs.length; i += 1) {
    const d = Math.abs(xs[i] - x);
    if (d < bestDist) {
      best = i;
      bestDist = d;
    }
  }
  return best;
}

export function normalizeSlumpLine(input: SlumpAnalyzeInput): NormalizedSlump {
  const { points, slumpLine } = input;
  const { yMax, yMin } = points;

  if (!isFiniteNumber(yMax) || !isFiniteNumber(yMin) || yMax === yMin) {
    throw new Error("points.yMax/yMin must be finite numbers and not equal");
  }
  if (!Array.isArray(slumpLine) || slumpLine.length < 2) {
    throw new Error("slumpLine must have at least 2 points");
  }

  // Clip by start/end x to allow the user to specify the analysis window.
  const xmin = Math.min(points.start.x, points.end.x);
  const xmax = Math.max(points.start.x, points.end.x);

  const filtered = slumpLine
    .filter((p) => isFiniteNumber(p.x) && isFiniteNumber(p.y) && p.x >= xmin && p.x <= xmax)
    .sort((a, b) => a.x - b.x);

  const line =
    filtered.length >= 2
      ? filtered
      : slumpLine
          .filter((p) => isFiniteNumber(p.x) && isFiniteNumber(p.y))
          .sort((a, b) => a.x - b.x);

  if (line.length < 2) throw new Error("slumpLine has no valid points");

  const xs = line.map((p) => p.x);
  const ys = line.map((p) => p.y);

  const yTopPx = Math.min(...ys);
  const yBottomPx = Math.max(...ys);
  const axisPxSpan = yBottomPx - yTopPx;
  if (!(axisPxSpan > 0)) throw new Error("Invalid slumpLine y span");

  const axisRangeCoins = Math.abs(yMax - yMin);

  // Map y (pixel) -> coins. Assumption: smaller y is higher.
  const pxToCoins = (y: number) => yMax + ((y - yTopPx) * (yMin - yMax)) / axisPxSpan;

  const startIdx = nearestIndexByX(xs, points.start.x);
  const baselineCoins = pxToCoins(ys[Math.max(0, startIdx)]);
  const diffCoins = ys.map((y) => pxToCoins(y) - baselineCoins);

  return { x: xs, diffCoins, baselineCoins, axisRangeCoins };
}

export function analyzeSlumpDecision(
  machineType: MachineType,
  series: NormalizedSlump,
  metrics: SlumpMetrics,
  spins?: number,
): SlumpDecision {
  const diffCoins = series.diffCoins;
  const n = diffCoins.length;
  const last = diffCoins[n - 1] ?? 0;
  const axisRange = Math.max(1, series.axisRangeCoins);

  // Normalized helpers (used for sign checks / attenuation).
  const trendNorm = clamp(safeTanh(metrics.trendRecent / Math.max(1, axisRange / 30)), -1, 1);
  const ddNorm = clamp(metrics.ddMax / Math.max(1, axisRange), 0, 1);
  const volNorm = clamp(metrics.volatility / Math.max(1, axisRange * 0.05), 0, 1);

  // One-shot detection (hanahana): a single large upward jump relative to axis range.
  let maxDeltaUp = 0;
  for (let i = 1; i < n; i += 1) {
    const d = diffCoins[i] - diffCoins[i - 1];
    if (Number.isFinite(d) && d > maxDeltaUp) maxDeltaUp = d;
  }
  const isOneShot = maxDeltaUp >= axisRange * 0.25;

  // 回転数: 入力spinsを優先し、無ければサンプル数proxyにフォールバック
  const spinsUsed = typeof spins === "number" && Number.isFinite(spins) && spins > 0 ? spins : n;

  if (machineType === "juggler") {
    // graphConfidence: 回転数に比例して上昇（最大0.8） + volatility減衰
    const base = Math.min(0.8, (spinsUsed / 200) * 0.8);
    const graphConfidence = clamp(base * (1 - 0.55 * volNorm), 0, 0.8);

    // biasZ:
    // - timeUnder0 が高いほどプラス
    // - ddMax が深いほどプラス
    // - recoverRate が高すぎる場合はマイナス
    // - trendRecent が下向きならマイナス
    const recoverTooHigh = clamp((metrics.recoverRate - 0.6) / 0.4, 0, 1);
    const trendDown = clamp(-trendNorm, 0, 1);
    const baseZ = 1.05 * metrics.timeUnder0 + 0.95 * ddNorm - 1.05 * recoverTooHigh - 0.75 * trendDown;
    const biasZ = clamp(safeTanh(baseZ), -1, 1);

    const decisionHint = (() => {
      if (graphConfidence < 0.25) return "回転数（サンプル）が少なく、補正は控えめ推奨。";
      if (biasZ > 0.35) return "凹み・ハマり寄り。プラス補正は小さめで検討。";
      if (biasZ < -0.35) return "上振れ寄り。補正はマイナス方向を意識。";
      return "偏りは小さめ。TOP3への微調整用途が無難。";
    })();

    return { biasZ, graphConfidence, decisionHint };
  }

  if (machineType === "hanahana") {
    // graphConfidence は juggler より低め（最大0.5）
    const base = Math.min(0.5, (spinsUsed / 240) * 0.5);
    const graphConfidence = clamp(base * (1 - 0.45 * volNorm), 0, 0.5);

    // biasZ は ±0.5 以内にクランプ
    // 基本は「上振れ/下振れ」参考値。ただし一撃型は上振れ（マイナス）。
    const level = clamp(last / Math.max(1, axisRange * 0.5), -2, 2);
    let biasZ = 0.5 * safeTanh(0.7 * level + 0.45 * trendNorm - 0.35 * ddNorm);
    biasZ = clamp(biasZ, -0.5, 0.5);
    if (isOneShot) biasZ = clamp(-Math.max(Math.abs(biasZ), 0.35), -0.5, 0.5);

    const decisionHint = (() => {
      if (graphConfidence < 0.2) return "情報が少なめ。補正は弱め推奨。";
      if (isOneShot) return "一撃寄りの形。上振れ（マイナス補正）を優先。";
      if (biasZ > 0.25) return "凹み寄り。プラス補正は小さめで検討。";
      if (biasZ < -0.25) return "上振れ寄り。マイナス補正を意識。";
      return "偏りは小さめ。微調整用途が無難。";
    })();

    return { biasZ, graphConfidence, decisionHint };
  }

  // smartAT
  // - graphConfidence は最大0.35
  // - biasZ は設定補正ではなく参考値
  // - decisionHint を最優先
  // - volatility が高いほど信頼度を下げる
  const base = Math.min(0.35, (spinsUsed / 260) * 0.35);
  const graphConfidence = clamp(base * (1 - 0.75 * volNorm), 0, 0.35);

  const level = clamp(last / Math.max(1, axisRange * 0.5), -2, 2);
  const biasZ = clamp(0.35 * safeTanh(0.65 * level + 0.35 * trendNorm - 0.45 * ddNorm), -0.35, 0.35);

  const decisionHint = (() => {
    // smartAT はブレやすい前提で、補正より「行動指針」優先
    if (graphConfidence < 0.18) return "smartAT: 情報が少ないため、グラフ補正は参考程度に。";
    if (volNorm >= 0.7) return "smartAT: ブレが大きい。投資上限を決め、強い根拠が無ければ深追い注意。";
    if (metrics.recoverRate >= 0.7 && trendNorm > 0.2) {
      return "smartAT: 直近は上向き。ただしブレ前提で、続行は投資上限を決めて判断。";
    }
    if (metrics.ddMax >= axisRange * 0.35 && metrics.recoverRate <= 0.35 && metrics.timeUnder0 >= 0.7) {
      return "smartAT: 凹みが深く回復が弱い。ヤメ寄り（深追い注意）。";
    }
    return "smartAT: biasZは参考値。decisionHintを優先し、他要素と併用してください。";
  })();

  return { biasZ, graphConfidence, decisionHint };
}

// Convenience export: the common pipeline used by the API route.
export function analyzeSlump(machineType: MachineType, input: SlumpAnalyzeInput) {
  const series = normalizeSlumpLine(input);
  const metrics = computeSlumpMetrics(series.diffCoins);
  const decision = analyzeSlumpDecision(machineType, series, metrics, input.spins);
  return { series, metrics, decision };
}
