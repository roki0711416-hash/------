export type SlumpMetrics = {
  ddMax: number; // 最大ドローダウン(差枚)
  recoverRate: number; // 0..1
  trendRecent: number; // 末尾区間の平均傾き(差枚/ステップ)
  volatility: number; // 差分の標準偏差(差枚/ステップ)
  timeUnder0: number; // 0..1
};

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function mean(xs: number[]) {
  if (xs.length === 0) return 0;
  const sum = xs.reduce((a, b) => a + b, 0);
  return Number.isFinite(sum) ? sum / xs.length : 0;
}

function stddev(xs: number[]) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const num = xs.reduce((acc, x) => {
    const d = x - m;
    return acc + d * d;
  }, 0);
  const v = num / (xs.length - 1);
  if (!Number.isFinite(v) || v <= 0) return 0;
  const s = Math.sqrt(v);
  return Number.isFinite(s) ? s : 0;
}

// 要件: 入力は差枚配列(number[])だけで指標を出す
export function computeSlumpMetrics(diffCoinsRaw: number[]): SlumpMetrics {
  // NaN/div0 safe: sanitize inputs, then fall back to zeros.
  const diffCoins = (Array.isArray(diffCoinsRaw) ? diffCoinsRaw : []).filter(
    (v) => typeof v === "number" && Number.isFinite(v),
  );

  if (diffCoins.length < 2) {
    return { ddMax: 0, recoverRate: 0, trendRecent: 0, volatility: 0, timeUnder0: 0 };
  }

  // ddMax: 最大ピークからの最大下落量
  let peak = diffCoins[0];
  let ddMax = 0;
  let bestPeak = peak;
  let bestTrough = diffCoins[0];

  for (let i = 1; i < diffCoins.length; i += 1) {
    const v = diffCoins[i];
    if (v > peak) peak = v;
    const dd = peak - v;
    if (dd > ddMax) {
      ddMax = dd;
      bestPeak = peak;
      bestTrough = v;
    }
  }
  if (!Number.isFinite(ddMax) || ddMax < 0) ddMax = 0;

  // recoverRate: 最大下落後の回復率(0〜1)
  const last = diffCoins[diffCoins.length - 1];
  const denom = bestPeak - bestTrough;
  const recoverRate = denom > 0 && Number.isFinite(last)
    ? clamp((last - bestTrough) / denom, 0, 1)
    : 0;

  // trendRecent: 末尾20%区間の平均傾き（1ステップあたりの平均差枚）
  const window = Math.max(2, Math.floor(diffCoins.length * 0.2));
  const start = Math.max(0, diffCoins.length - window);
  const recent = diffCoins.slice(start);
  const recentDeltas: number[] = [];
  for (let i = 1; i < recent.length; i += 1) recentDeltas.push(recent[i] - recent[i - 1]);
  const trendRecent = recentDeltas.length > 0 ? mean(recentDeltas) : 0;

  // volatility: 差分配列の標準偏差
  const deltas: number[] = [];
  for (let i = 1; i < diffCoins.length; i += 1) deltas.push(diffCoins[i] - diffCoins[i - 1]);
  const volatility = stddev(deltas);

  // timeUnder0: 全体に占めるマイナス滞在割合
  const under = diffCoins.filter((v) => v < 0).length;
  const timeUnder0 = clamp(under / diffCoins.length, 0, 1);

  return {
    ddMax: Number.isFinite(ddMax) ? ddMax : 0,
    recoverRate: Number.isFinite(recoverRate) ? recoverRate : 0,
    trendRecent: Number.isFinite(trendRecent) ? trendRecent : 0,
    volatility: Number.isFinite(volatility) ? volatility : 0,
    timeUnder0: Number.isFinite(timeUnder0) ? timeUnder0 : 0,
  };
}
