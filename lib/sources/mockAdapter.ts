/**
 * lib/sources/mockAdapter.ts
 *
 * 開発・テスト用のモックアダプター。
 * ランダムな観測値を生成する（実際のデータ取得は行わない）。
 */

import type {
  SourceAdapter,
  Store,
  DateRange,
  DatedObservation,
} from "./sourceAdapter";

function seededRandom(seed: string): () => number {
  // 簡易的な文字列ベースのシード生成
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from);
  const end = new Date(to);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export const mockAdapter: SourceAdapter = {
  name: "mock",

  async fetchObservations(
    store: Store,
    dateRange: DateRange,
  ): Promise<DatedObservation[]> {
    const dates = getDatesInRange(dateRange.from, dateRange.to);

    return dates.map((date) => {
      const rng = seededRandom(`${store.id}-${date}`);
      return {
        date,
        observation: {
          activityRate: Math.round(rng() * 100) / 100,
          volatility: Math.round(rng() * 100) / 100,
          positiveRatio: Math.round(rng() * 100) / 100,
          upswingRate: Math.round(rng() * 100) / 100,
        },
      };
    });
  },
};
