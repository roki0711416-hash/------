import { describe, it, expect } from "vitest";
import {
  computeSignal,
  averageObservations,
  type Observation,
} from "../../lib/analytics/storeScore";

describe("computeSignal", () => {
  it("全て0の場合、全インデックスが0になる", () => {
    const obs: Observation = {
      activityRate: 0,
      volatility: 0,
      positiveRatio: 0,
      upswingRate: 0,
    };
    const signal = computeSignal(obs);
    expect(signal.trafficIndex).toBe(0);
    expect(signal.swingIndex).toBe(0);
    expect(signal.rewardIndex).toBe(0);
    expect(signal.highChanceIndex).toBe(0);
    expect(signal.note).toBeTruthy();
  });

  it("全て1.0の場合、全インデックスが100になる", () => {
    const obs: Observation = {
      activityRate: 1.0,
      volatility: 1.0,
      positiveRatio: 1.0,
      upswingRate: 1.0,
    };
    const signal = computeSignal(obs);
    expect(signal.trafficIndex).toBe(100);
    expect(signal.swingIndex).toBe(100);
    expect(signal.rewardIndex).toBe(100);
    expect(signal.highChanceIndex).toBe(100);
  });

  it("0-1の範囲外はクランプされる", () => {
    const obs: Observation = {
      activityRate: 1.5,
      volatility: -0.3,
      positiveRatio: 0.5,
      upswingRate: 2.0,
    };
    const signal = computeSignal(obs);
    expect(signal.trafficIndex).toBe(100);
    expect(signal.swingIndex).toBe(0);
    expect(signal.rewardIndex).toBe(50);
    expect(signal.highChanceIndex).toBe(100);
  });

  it("中間値で適切なインデックスが返る", () => {
    const obs: Observation = {
      activityRate: 0.75,
      volatility: 0.25,
      positiveRatio: 0.80,
      upswingRate: 0.10,
    };
    const signal = computeSignal(obs);
    expect(signal.trafficIndex).toBe(75);
    expect(signal.swingIndex).toBe(25);
    expect(signal.rewardIndex).toBe(80);
    expect(signal.highChanceIndex).toBe(10);
  });

  it("noteに断定表現が含まれない", () => {
    const obs: Observation = {
      activityRate: 0.9,
      volatility: 0.9,
      positiveRatio: 0.9,
      upswingRate: 0.9,
    };
    const signal = computeSignal(obs);
    expect(signal.note).not.toMatch(/勝てる|出る|当たる|確実/);
    expect(signal.note).toBeTruthy();
  });
});

describe("averageObservations", () => {
  it("空配列は全て0を返す", () => {
    const avg = averageObservations([]);
    expect(avg.activityRate).toBe(0);
    expect(avg.volatility).toBe(0);
  });

  it("複数の観測値の平均を正しく計算する", () => {
    const obs: Observation[] = [
      { activityRate: 0.8, volatility: 0.6, positiveRatio: 0.4, upswingRate: 0.2 },
      { activityRate: 0.2, volatility: 0.4, positiveRatio: 0.6, upswingRate: 0.8 },
    ];
    const avg = averageObservations(obs);
    expect(avg.activityRate).toBeCloseTo(0.5);
    expect(avg.volatility).toBeCloseTo(0.5);
    expect(avg.positiveRatio).toBeCloseTo(0.5);
    expect(avg.upswingRate).toBeCloseTo(0.5);
  });
});
