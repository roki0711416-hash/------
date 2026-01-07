export type SettingKey = number | string;

export type MachineSettingOdds = {
  s: SettingKey;
  big: number; // 1/big
  reg: number; // 1/reg
  total: number; // 1/total (display only)
  rate: number; // payout percent (display only)
  extra?: number; // optional extra metric per game (e.g., weak cherry): 1/extra
  extras?: Record<string, number>; // optional extra metrics per game: { metricId: 1/oddsDenom }
  suikaCzRate?: number; // optional: probability (0..1)
};

export type JudgeInput = {
  games: number;
  bigCount: number;
  regCount: number;
  extraCount?: number;
  extraCounts?: Record<string, number>;
  suikaTrials?: number;
  suikaCzHits?: number;
};

export type JudgeOptions = {
  allowedSettings?: readonly SettingKey[];
};

export type SettingPosterior = {
  s: SettingKey;
  posterior: number; // 0..1
  logLikelihood: number;
};

function safeLog(p: number) {
  if (!(p > 0)) return -Infinity;
  return Math.log(p);
}

export function calcSettingPosteriors(
  settings: readonly MachineSettingOdds[],
  input: JudgeInput,
  options?: JudgeOptions,
): SettingPosterior[] {
  const games = Math.floor(input.games);
  const bigCount = Math.floor(input.bigCount);
  const regCount = Math.floor(input.regCount);
  const extraCountRaw = input.extraCount;
  const extraCount = typeof extraCountRaw === "number" ? Math.floor(extraCountRaw) : null;

  const extraCountsRaw = input.extraCounts;
  const extraCounts: Record<string, number> | null = (() => {
    if (!extraCountsRaw || typeof extraCountsRaw !== "object") return null;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(extraCountsRaw)) {
      const n = typeof v === "number" ? Math.floor(v) : NaN;
      if (!Number.isFinite(n)) continue;
      out[k] = n;
    }
    return Object.keys(out).length > 0 ? out : null;
  })();

  const suikaTrialsRaw = input.suikaTrials;
  const suikaCzHitsRaw = input.suikaCzHits;
  const suikaTrials = typeof suikaTrialsRaw === "number" ? Math.floor(suikaTrialsRaw) : null;
  const suikaCzHits = typeof suikaCzHitsRaw === "number" ? Math.floor(suikaCzHitsRaw) : null;

  if (!(games > 0)) return [];
  if (bigCount < 0 || regCount < 0) return [];
  if (bigCount + regCount > games) return [];
  if (extraCount !== null && (extraCount < 0 || extraCount > games)) return [];
  if (extraCounts) {
    for (const n of Object.values(extraCounts)) {
      if (n < 0 || n > games) return [];
    }
  }
  if ((suikaTrials === null) !== (suikaCzHits === null)) return [];
  if (suikaTrials !== null && suikaCzHits !== null) {
    if (suikaTrials < 0 || suikaCzHits < 0) return [];
    if (suikaCzHits > suikaTrials) return [];
  }

  const noneCount = games - bigCount - regCount;

  const allowed = options?.allowedSettings
    ? new Set(options.allowedSettings.map((s) => String(s)))
    : null;

  const raw = settings.map((st) => {
    if (allowed && !allowed.has(String(st.s))) {
      return {
        s: st.s,
        logLikelihood: -Infinity,
      };
    }

    const pBig = 1 / st.big;
    const pReg = 1 / st.reg;
    const pNone = 1 - pBig - pReg;

    // Optional extra metric: treat as binomial over games (independent of BIG/REG occurrences)
    // This is a simplification but works well for small-role counts like weak cherry.
    const extraLogL = (() => {
      if (extraCount === null) return 0;
      if (!st.extra || !(st.extra > 0)) return 0;

      const p = 1 / st.extra;
      const q = 1 - p;
      const none = games - extraCount;
      return extraCount * safeLog(p) + none * safeLog(q);
    })();

    const extrasLogL = (() => {
      if (!extraCounts) return 0;
      if (!st.extras) return 0;

      let sum = 0;
      for (const [metricId, cnt] of Object.entries(extraCounts)) {
        if (!(cnt > 0)) continue;

        const denom = st.extras[metricId];
        if (!denom || !(denom > 0)) continue;

        const p = 1 / denom;
        const q = 1 - p;
        const none = games - cnt;
        sum += cnt * safeLog(p) + none * safeLog(q);
      }
      return sum;
    })();

    const suikaCzLogL = (() => {
      if (suikaTrials === null || suikaCzHits === null) return 0;
      if (typeof st.suikaCzRate !== "number") return 0;
      const p = st.suikaCzRate;
      if (!(p >= 0 && p <= 1)) return 0;
      const none = suikaTrials - suikaCzHits;
      return suikaCzHits * safeLog(p) + none * safeLog(1 - p);
    })();

    const logL =
      bigCount * safeLog(pBig) +
      regCount * safeLog(pReg) +
      noneCount * safeLog(pNone) +
      extraLogL +
      extrasLogL +
      suikaCzLogL;

    return {
      s: st.s,
      logLikelihood: logL,
    };
  });

  const max = Math.max(...raw.map((r) => r.logLikelihood));
  if (!Number.isFinite(max)) {
    return raw.map((r) => ({ ...r, posterior: 0 }));
  }

  const weights = raw.map((r) => Math.exp(r.logLikelihood - max));
  const sum = weights.reduce((a, b) => a + b, 0);
  if (!(sum > 0)) {
    return raw.map((r) => ({ ...r, posterior: 0 }));
  }

  return raw.map((r, idx) => ({ ...r, posterior: weights[idx] / sum }));
}

export function topNSettings(
  posteriors: readonly SettingPosterior[],
  n: number,
): SettingPosterior[] {
  return [...posteriors]
    .sort((a, b) => b.posterior - a.posterior)
    .slice(0, Math.max(0, n));
}
