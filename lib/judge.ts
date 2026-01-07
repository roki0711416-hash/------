export type SettingKey = number | string;

export type MachineSettingOdds = {
  s: SettingKey;
  big: number; // 1/big
  reg: number; // 1/reg
  total: number; // 1/total (display only)
  rate: number; // payout percent (display only)
};

export type JudgeInput = {
  games: number;
  bigCount: number;
  regCount: number;
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

  if (!(games > 0)) return [];
  if (bigCount < 0 || regCount < 0) return [];
  if (bigCount + regCount > games) return [];

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

    const logL =
      bigCount * safeLog(pBig) +
      regCount * safeLog(pReg) +
      noneCount * safeLog(pNone);

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
