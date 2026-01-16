"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Machine } from "../content/machines";
import type { SettingPosterior } from "../lib/judge";

const BET_PER_GAME = 3;

function fmtPct(p: number) {
  return `${(p * 100).toFixed(1)}%`;
}

function toPositiveIntOrNaN(s: string) {
  if (s === "") return Number.NaN;
  const n = Number(s);
  if (!Number.isFinite(n)) return Number.NaN;
  const t = Math.trunc(n);
  return t > 0 ? t : Number.NaN;
}

type AiJudgeLevel =
  | "続行OK（期待できる）"
  | "様子見（情報不足）"
  | "続行注意（期待しづらい）";

type AiJudgeResult = {
  level: AiJudgeLevel;
  weightedRate: number;
  pWin: number;
  pLose: number;
  p56: number;
  reason: string;
};

function settingKeyToNumber(key: number | string): number {
  if (typeof key === "number") return key;
  const normalized = String(key).trim().toLowerCase();
  if (normalized === "v") return 5;
  const n = Number(key);
  return Number.isFinite(n) ? n : Number.NaN;
}

const P56_CONTINUE_OK_THRESHOLD = 0.55;

export default function PremiumMemberCard({
  machine,
  isPremium,
  posteriors,
}: {
  machine: Machine;
  isPremium: boolean;
  posteriors: SettingPosterior[] | null;
}) {
  const [futureGames, setFutureGames] = useState<string>("800");

  const aiContinue = useMemo(() => {
    if (!posteriors) return null;

    const g = toPositiveIntOrNaN(futureGames);
    if (!Number.isFinite(g)) return { error: "将来G数は1以上の整数で入力してください。" };

    const oddsBySetting = new Map<string, number>();
    for (const row of machine.odds.settings) {
      const rate = row.rate;
      if (typeof rate !== "number") continue;
      oddsBySetting.set(String(row.s), rate);
    }

    let weightedRate = 0;
    let pWin = 0;
    let pLose = 0;
    let p56 = 0;

    for (const p of posteriors) {
      const sNum = settingKeyToNumber(p.s);
      if (Number.isFinite(sNum) && (sNum === 5 || sNum === 6)) p56 += p.posterior;

      const rate = oddsBySetting.get(String(p.s));
      if (typeof rate !== "number") continue;

      weightedRate += p.posterior * rate;
      const netCoins = g * BET_PER_GAME * (rate / 100 - 1);
      if (Number.isFinite(netCoins) && netCoins > 0) pWin += p.posterior;
      if (Number.isFinite(netCoins) && netCoins < 0) pLose += p.posterior;
    }

    const expectedNetCoins = g * BET_PER_GAME * (weightedRate / 100 - 1);

    const level: AiJudgeLevel = (() => {
      // 設定5〜6の見込みが十分に高いなら、続行OK寄りにする
      if (p56 >= P56_CONTINUE_OK_THRESHOLD) return "続行OK（期待できる）";

      // 厳しめ：期待値が明確にプラスで、負け確率も低い場合のみ「続行OK」
      if (expectedNetCoins >= 150 && pLose <= 0.45) return "続行OK（期待できる）";
      // マイナス寄り or 負け確率が高めなら「注意」
      if (expectedNetCoins <= -50 || pLose >= 0.55) return "続行注意（期待しづらい）";
      return "様子見（情報不足）";
    })();

    const reason = (() => {
      if (p56 >= P56_CONTINUE_OK_THRESHOLD) return `設定5-6見込み ${fmtPct(p56)}`;
      if (expectedNetCoins >= 150 && pLose <= 0.45)
        return `推定機械割 ${weightedRate.toFixed(2)}% / 負け確率 ${fmtPct(pLose)}`;
      if (expectedNetCoins <= -50)
        return `推定機械割 ${weightedRate.toFixed(2)}% / 負け確率 ${fmtPct(pLose)}`;
      if (pLose >= 0.55) return `負け確率が高め（${fmtPct(pLose)}）`;
      return `推定機械割 ${weightedRate.toFixed(2)}% / 負け確率 ${fmtPct(pLose)}`;
    })();

    const result: AiJudgeResult = { level, weightedRate, pWin, pLose, p56, reason };
    return result;
  }, [futureGames, machine.odds.settings, posteriors]);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-lg font-semibold">サブスク会員限定</h2>
      <p className="mt-2 text-sm text-neutral-700">
        AIが現状の状況を自動で計算して、機械割、勝率・負け確率などを予想します。またユーザー様が任意で将来のG数を選択すると、その期待値も自動で計算して出してくれます。
      </p>

      {!isPremium ? (
        <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm font-semibold text-neutral-700">AI続行判定</p>
          <p className="mt-1 text-sm text-neutral-700">サブスク会員限定の機能です。</p>
          <Link
            href="/account"
            className="mt-2 inline-block text-sm font-semibold text-neutral-900 underline underline-offset-2"
          >
            サブスク登録・ログインはこちら
          </Link>
        </div>
      ) : !posteriors ? (
        <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm font-semibold text-neutral-700">AI続行判定</p>
          <p className="mt-1 text-sm text-neutral-700">
            表示するには、まず設定判別の入力をしてください。
          </p>
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm font-semibold text-neutral-700">AI続行判定</p>

          <div className="mt-2">
            <label className="block">
              <span className="text-xs font-semibold text-neutral-600">将来G数</span>
              <input
                inputMode="numeric"
                value={futureGames}
                onChange={(e) => setFutureGames(e.target.value)}
                placeholder="例: 800"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>

          {aiContinue && "error" in aiContinue ? (
            <p className="mt-2 text-xs font-medium text-red-600">{aiContinue.error}</p>
          ) : null}

          {aiContinue && !("error" in aiContinue) ? (
            <div className="mt-3 grid gap-2 text-sm text-neutral-700 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-xs text-neutral-500">判定</p>
                <p
                  className={`text-base font-semibold ${
                    aiContinue.level === "続行注意（期待しづらい）"
                      ? "text-red-600"
                      : "text-neutral-900"
                  }`}
                >
                  {aiContinue.level}
                </p>
                <p className="mt-1 text-xs text-neutral-500">{aiContinue.reason}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">推定機械割（加重平均）</p>
                <p className="font-semibold">{aiContinue.weightedRate.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">勝率（推定）</p>
                <p className="font-semibold">{fmtPct(aiContinue.pWin)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">負け確率（推定）</p>
                <p className="font-semibold">{fmtPct(aiContinue.pLose)}</p>
              </div>
              <p className="text-xs text-neutral-500 sm:col-span-2">
                ※概算です。短期的なブレは大きいので参考程度にお願いします。
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
