"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Machine } from "../content/machines";
import type { SettingPosterior } from "../lib/judge";

const BET_PER_GAME = 3;
const DEFAULT_PREDICT_GAMES = 500;
const DEFAULT_YEN_PER_COIN = 20;

function fmt(n: number | undefined) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "-";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function fmtSigned(n: number) {
  if (!Number.isFinite(n)) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${fmt(n)}`;
}

function fmtYenSigned(n: number) {
  if (!Number.isFinite(n)) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${Math.round(n).toLocaleString()}円`;
}

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
  const [predictGames, setPredictGames] = useState<string>(String(DEFAULT_PREDICT_GAMES));
  const [exchangeMode, setExchangeMode] = useState<"equal" | "custom">("equal");
  const [yenPerCoinCustom, setYenPerCoinCustom] = useState<string>(
    String(DEFAULT_YEN_PER_COIN),
  );

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

    if (oddsBySetting.size === 0) {
      return { error: "この機種は機械割(設定別)が未登録です。" };
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

  const predictGamesInfo = useMemo(() => {
    const raw = Number(predictGames);
    const isValid = Number.isFinite(raw) && raw > 0;
    const value = isValid ? Math.max(1, Math.trunc(raw)) : DEFAULT_PREDICT_GAMES;
    return { isValid, value };
  }, [predictGames]);

  const yenPerCoin = useMemo(() => {
    if (exchangeMode === "equal") return DEFAULT_YEN_PER_COIN;
    const v = Number(yenPerCoinCustom);
    if (!Number.isFinite(v) || v <= 0) return Number.NaN;
    return v;
  }, [exchangeMode, yenPerCoinCustom]);

  const evPredict = useMemo(() => {
    if (!posteriors) return null;

    const oddsBySetting = new Map<string, number>();
    for (const row of machine.odds.settings) {
      const rate = row.rate;
      if (typeof rate !== "number") continue;
      oddsBySetting.set(String(row.s), rate);
    }

    const perSetting = posteriors
      .map((p) => {
        const rate = oddsBySetting.get(String(p.s));
        const netCoins =
          typeof rate === "number"
            ? predictGamesInfo.value * BET_PER_GAME * (rate / 100 - 1)
            : Number.NaN;
        return { s: p.s, posterior: p.posterior, netCoins };
      })
      .sort((a, b) => b.posterior - a.posterior);

    if (!perSetting.some((p) => Number.isFinite(p.netCoins))) return null;

    const overall = perSetting.reduce(
      (acc, cur) => (Number.isFinite(cur.netCoins) ? acc + cur.posterior * cur.netCoins : acc),
      0,
    );

    return { overall, perSettingTop3: perSetting.slice(0, 3) };
  }, [machine.odds.settings, posteriors, predictGamesInfo]);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-lg font-semibold">サブスク会員限定</h2>
      <p className="mt-2 text-sm text-neutral-700">
        入力された数値をもとに、
        <br />
        AIが統計的な観点から状況を整理し、
        <br />
        参考となる指標を算出します。
        <br />
        <br />
        任意の回転数を設定することで、
        <br />
        条件変更時のシミュレーション結果を確認できます。
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
        <>
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

          <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-700">
                {predictGamesInfo.value}G先 期待差枚（推定）
              </p>
              <label className="flex items-center gap-2 text-xs text-neutral-600">
                <span className="font-semibold text-neutral-600">G数</span>
                <input
                  inputMode="numeric"
                  value={predictGames}
                  onChange={(e) => setPredictGames(e.target.value)}
                  className="w-20 rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm"
                  placeholder={String(DEFAULT_PREDICT_GAMES)}
                />
                <span className="text-neutral-500">G</span>
              </label>
            </div>

            {!predictGamesInfo.isValid ? (
              <p className="mt-2 text-xs font-medium text-red-600">
                G数は1以上の数字で入力してください（未入力/不正な場合は{DEFAULT_PREDICT_GAMES}Gとして計算します）。
              </p>
            ) : null}

            <p className="mt-2 whitespace-pre-line text-xs text-neutral-500">
              {"※本ツールの期待値は、\n同じ条件で何度もプレイした場合の「平均的な結果」を示したものです。\n実戦では一時的に大きく勝つことも、大きく負けることもあります。\n表示される金額は「必ずそうなる結果」ではありません"}
            </p>

            <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-3">
              <p className="text-xs font-semibold text-neutral-600">換算</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="radio"
                    name="exchangeModePremiumEv"
                    value="equal"
                    checked={exchangeMode === "equal"}
                    onChange={() => setExchangeMode("equal")}
                  />
                  等価（1枚=20円）
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="radio"
                    name="exchangeModePremiumEv"
                    value="custom"
                    checked={exchangeMode === "custom"}
                    onChange={() => setExchangeMode("custom")}
                  />
                  非等価
                </label>
                {exchangeMode === "custom" ? (
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="text-xs text-neutral-500">1枚=</span>
                    <input
                      inputMode="decimal"
                      value={yenPerCoinCustom}
                      onChange={(e) => setYenPerCoinCustom(e.target.value)}
                      className="w-20 rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-neutral-500">円</span>
                  </div>
                ) : null}
              </div>
              {exchangeMode === "custom" && !Number.isFinite(yenPerCoin) ? (
                <p className="mt-2 text-xs font-medium text-red-600">
                  換算レートは0より大きい数で入力してください。
                </p>
              ) : null}
            </div>

            {evPredict ? (
              <div className="mt-3 grid gap-2 text-sm text-neutral-700 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-neutral-500">全体（期待値）</p>
                  <p className="font-semibold">
                    {fmtSigned(evPredict.overall)}枚
                    {Number.isFinite(yenPerCoin) ? (
                      <span className="text-neutral-500">
                        {" "}（{fmtYenSigned(evPredict.overall * yenPerCoin)}）
                      </span>
                    ) : null}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">TOP3内訳</p>
                  <p className="font-semibold">
                    {evPredict.perSettingTop3
                      .map((t) => {
                        const yen = Number.isFinite(yenPerCoin)
                          ? t.netCoins * yenPerCoin
                          : Number.NaN;
                        const yenText = Number.isFinite(yen) ? `（${fmtYenSigned(yen)}）` : "";
                        return `${t.s}: ${fmtSigned(t.netCoins)}枚${yenText}（${fmtPct(t.posterior)}）`;
                      })
                      .join(" / ")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-3">
                <p className="text-sm text-neutral-700">この機種は機械割(設定別)が未登録です。</p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
