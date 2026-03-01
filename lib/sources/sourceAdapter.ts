/**
 * lib/sources/sourceAdapter.ts
 *
 * データ取得元のインターフェース定義。
 * 具体的な取得先はアダプターとして差し替え可能にする。
 */

import type { Observation } from "../analytics/storeScore";

export interface Store {
  id: string;
  name: string;
  prefecture: string;
}

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

export interface DatedObservation {
  date: string; // YYYY-MM-DD
  observation: Observation;
}

/**
 * ソースアダプターのインターフェース。
 * 実装側で取得→正規化を行い、Observation を返す。
 */
export interface SourceAdapter {
  /** アダプター名（ログ用） */
  name: string;

  /**
   * 指定店舗・期間の観測値を取得する。
   * - robots.txt / 利用規約を遵守すること。
   * - 取得できない場合は空配列を返す。
   */
  fetchObservations(
    store: Store,
    dateRange: DateRange,
  ): Promise<DatedObservation[]>;
}
