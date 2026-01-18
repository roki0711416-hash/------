import type { SlumpGraphKind } from "../utils/slumpTypes";

export type SlumpGraphTapPoint = {
  x: number; // image pixel coordinate (natural size)
  y: number; // image pixel coordinate (natural size)
};

export type SlumpGraphInput = {
  kind: SlumpGraphKind;
  start: SlumpGraphTapPoint;
  end: SlumpGraphTapPoint;
  yTop: { y: number; value: number }; // vertical axis upper bound
  yBottom: { y: number; value: number }; // vertical axis lower bound
  spins?: number; // optional real spins (games). If provided, used for confidence scaling.
};

export type SlumpGraphOutput = {
  // -1..1: + means likely upward variance (overperformance), - means downward variance
  biasZ: number;
  // 0..1: confidence in the biasZ based on inputs quality
  graphConfidence: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function analyzeSlumpGraph(input: SlumpGraphInput): SlumpGraphOutput {
  const yTopVal = input.yTop.value;
  const yBottomVal = input.yBottom.value;
  const yTopPx = input.yTop.y;
  const yBottomPx = input.yBottom.y;

  const axisPxSpan = yBottomPx - yTopPx;
  const axisValSpan = yBottomVal - yTopVal;

  // Basic input validation; output low confidence if inconsistent.
  if (!Number.isFinite(axisPxSpan) || axisPxSpan === 0 || !Number.isFinite(axisValSpan) || axisValSpan === 0) {
    return { biasZ: 0, graphConfidence: 0 };
  }

  const pxToValue = (y: number) => yTopVal + ((y - yTopPx) * axisValSpan) / axisPxSpan;

  const startValue = pxToValue(input.start.y);
  const endValue = pxToValue(input.end.y);

  if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) {
    return { biasZ: 0, graphConfidence: 0 };
  }

  const netCoins = endValue - startValue;
  const axisRangeCoins = Math.abs(yTopVal - yBottomVal);

  // Normalize by visible axis range: avoid using games-axis (MVP doesn't auto-read it).
  const rawStrength = axisRangeCoins > 0 ? netCoins / (axisRangeCoins / 2) : 0;

  // Machine-kind scaling: AT graphs are much more volatile, so treat the same shape as weaker evidence.
  const kindScale = input.kind === "smart-at" ? 0.6 : 1.0;
  const strength = rawStrength * kindScale;

  // Squash to -1..1
  const biasZ = clamp(Math.tanh(strength), -1, 1);

  // Confidence: derived from geometry (enough x-span) and axis range.
  const xSpan = Math.abs(input.end.x - input.start.x);
  const minSpanPx = 80;

  let graphConfidence = 1;
  if (xSpan < minSpanPx) graphConfidence *= xSpan / minSpanPx;

  // If axis range is too small, bias is unstable.
  if (axisRangeCoins < 500) graphConfidence *= axisRangeCoins / 500;

  // Penalize AT a bit by default.
  if (input.kind === "smart-at") graphConfidence *= 0.8;

  // Optional: if real spins are provided, scale confidence by trial count and cap by kind.
  // Backward-compatible: when spins is missing, keep the legacy confidence behavior.
  if (typeof input.spins === "number" && Number.isFinite(input.spins) && input.spins > 0) {
    const maxConf = input.kind === "jugg" ? 0.8 : input.kind === "hanahana" ? 0.5 : 0.35;
    const targetSpins = input.kind === "jugg" ? 200 : input.kind === "hanahana" ? 240 : 260;
    const spinsFactor = clamp(input.spins / targetSpins, 0, 1);
    graphConfidence *= spinsFactor;
    graphConfidence = Math.min(graphConfidence, maxConf);
  }

  graphConfidence = clamp(graphConfidence, 0, 1);

  return { biasZ, graphConfidence };
}
