/**
 * lib/analytics/storeScore.ts
 *
 * 独自スコア算出ロジック。
 * "観測値" (Observation) から 0-100 の4つのIndexと短い傾向コメントを生成する。
 *
 * ── 注意 ──
 * - 元サイトの指標名（機械割、差枚、到達率 等）はそのまま使わない。
 * - 断定表現・誇大表現は禁止（「勝てる」「出る」等）。
 * - あくまで参考情報であり結果を保証するものではない。
 */

export interface Observation {
  /** 稼働の多さを示す正規化値 (0-1) */
  activityRate: number;
  /** 出玉のブレ幅を示す正規化値 (0-1) */
  volatility: number;
  /** プラス寄り度合いの正規化値 (0-1) */
  positiveRatio: number;
  /** 上振れ傾向の正規化値 (0-1) */
  upswingRate: number;
}

export interface DailySignal {
  trafficIndex: number;     // 来店活性 (0-100)
  swingIndex: number;       // 荒さ (0-100)
  rewardIndex: number;      // 還元傾向 (0-100)
  highChanceIndex: number;  // 上振れ期待 (0-100)
  note: string;             // 短い傾向コメント
}

/** 0-1 の値を 0-100 にクランプして整数化 */
function toIndex(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

/**
 * 複数日の観測値の平均を取る（直近ウィンドウでのスムージング用）
 */
export function averageObservations(obs: Observation[]): Observation {
  if (obs.length === 0) {
    return { activityRate: 0, volatility: 0, positiveRatio: 0, upswingRate: 0 };
  }
  const sum = obs.reduce(
    (acc, o) => ({
      activityRate: acc.activityRate + o.activityRate,
      volatility: acc.volatility + o.volatility,
      positiveRatio: acc.positiveRatio + o.positiveRatio,
      upswingRate: acc.upswingRate + o.upswingRate,
    }),
    { activityRate: 0, volatility: 0, positiveRatio: 0, upswingRate: 0 },
  );
  const n = obs.length;
  return {
    activityRate: sum.activityRate / n,
    volatility: sum.volatility / n,
    positiveRatio: sum.positiveRatio / n,
    upswingRate: sum.upswingRate / n,
  };
}

/**
 * 1日分の観測値 → DailySignal に変換
 */
export function computeSignal(obs: Observation): DailySignal {
  const trafficIndex = toIndex(obs.activityRate);
  const swingIndex = toIndex(obs.volatility);
  const rewardIndex = toIndex(obs.positiveRatio);
  const highChanceIndex = toIndex(obs.upswingRate);

  const note = generateNote(trafficIndex, swingIndex, rewardIndex, highChanceIndex);

  return { trafficIndex, swingIndex, rewardIndex, highChanceIndex, note };
}

/* ── 傾向コメント生成 ── */

function generateNote(
  traffic: number,
  swing: number,
  reward: number,
  highChance: number,
): string {
  const parts: string[] = [];

  if (traffic >= 70) {
    parts.push("来店活性が高めの傾向です");
  } else if (traffic <= 30) {
    parts.push("来店活性はやや落ち着いた様子です");
  }

  if (swing >= 70) {
    parts.push("波が大きくメリハリのある動きが見られます");
  } else if (swing <= 30) {
    parts.push("比較的安定した動きの傾向です");
  }

  if (reward >= 70) {
    parts.push("還元傾向がやや強めに出ているかもしれません");
  } else if (reward <= 30) {
    parts.push("還元傾向はやや控えめの様子です");
  }

  if (highChance >= 70) {
    parts.push("上振れの兆候が見られる可能性があります");
  }

  if (parts.length === 0) {
    parts.push("目立った傾向はなく平均的な動きです");
  }

  return parts.join("。") + "。";
}
