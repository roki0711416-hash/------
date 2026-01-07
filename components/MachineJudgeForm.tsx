"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Machine } from "../content/machines";
import { getHintConfig } from "../content/hints";
import {
  calcSettingPosteriors,
  topNSettings,
  type SettingPosterior,
} from "../lib/judge";

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function fmtPct(p: number) {
  return `${(p * 100).toFixed(1)}%`;
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

function fmtOneOver(games: number, count: number) {
  if (!(games > 0) || !(count > 0)) return "-";
  return `1/${fmt(games / count)}`;
}

function toIntOrZero(s: string) {
  if (s === "") return 0;
  const n = Number(s);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

function settingKeyToNumber(key: number | string): number {
  if (typeof key === "number") return key;
  const normalized = String(key).trim().toLowerCase();
  if (normalized === "v") return 5;
  const n = Number(key);
  return Number.isFinite(n) ? n : Number.NaN;
}

type OddsRow = Machine["odds"]["settings"][number];

const BET_PER_GAME = 3; // 3枚掛け想定
const PREDICT_GAMES = 500;
const DEFAULT_YEN_PER_COIN = 20;

export default function MachineJudgeForm({ machine }: { machine: Machine }) {
  const [games, setGames] = useState<string>("");
  const [bigCount, setBigCount] = useState<string>("");
  const [regCount, setRegCount] = useState<string>("");
  const [extraCount, setExtraCount] = useState<string>("");

  const hintConfig = useMemo(() => getHintConfig(machine.id), [machine.id]);
  const [hintCounts, setHintCounts] = useState<Record<string, string>>({});

  const [ocrImageUrl, setOcrImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrStatus, setOcrStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle",
  );
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuggestion, setOcrSuggestion] = useState<{
    games?: number;
    big?: number;
    reg?: number;
  } | null>(null);
  const lastObjectUrlRef = useRef<string | null>(null);

  const [exchangeMode, setExchangeMode] = useState<"equal" | "custom">("equal");
  const [yenPerCoinCustom, setYenPerCoinCustom] = useState<string>(
    String(DEFAULT_YEN_PER_COIN),
  );

  const extraLabel =
    machine.category === "JUG"
      ? "ブドウ"
      : machine.category === "HANAHANA"
        ? "ベル"
        : null;

  useEffect(() => {
    // Avoid carrying hint inputs across machine switches.
    setHintCounts({});
  }, [machine.id]);

  const parsed = useMemo(() => {
    const g = Number(games);
    const b = Number(bigCount);
    const r = Number(regCount);
    const x = Number(extraCount);
    return {
      games: Number.isFinite(g) ? g : NaN,
      bigCount: Number.isFinite(b) ? b : NaN,
      regCount: Number.isFinite(r) ? r : NaN,
      extraCount: Number.isFinite(x) ? x : NaN,
    };
  }, [games, bigCount, regCount, extraCount]);

  function cleanupObjectUrl() {
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }
  }

  function parseOcr(text: string) {
    const normalized = text
      .replace(/\u3000/g, " ")
      .replace(/[\r\t]+/g, " ")
      .replace(/ +/g, " ")
      .replace(/\n+/g, "\n")
      .trim();

    const pickInt = (v?: string) => {
      if (!v) return undefined;
      const n = Number(v.replace(/,/g, ""));
      if (!Number.isFinite(n)) return undefined;
      return Math.max(0, Math.trunc(n));
    };

    const find = (re: RegExp) => {
      const m = normalized.match(re);
      return m?.[1];
    };

    // Labels differ by data-counter, so keep this flexible.
    const big = pickInt(find(/\b(?:BIG|BB)\b\s*[:：]?\s*(\d{1,4})/i));
    const reg = pickInt(find(/\b(?:REG|RB)\b\s*[:：]?\s*(\d{1,4})/i));

    // Games often appears as "G" or "GAME" or "TOTAL" or "回転".
    const gamesByLabel = pickInt(
      find(/\b(?:GAMES?|GAME|TOTAL|START)\b\s*[:：]?\s*(\d{1,6})/i),
    );
    const gamesBySuffix = (() => {
      const all = Array.from(normalized.matchAll(/(\d{2,6})\s*G\b/gi)).map(
        (m) => pickInt(m[1]) ?? 0,
      );
      if (all.length === 0) return undefined;
      return Math.max(...all);
    })();

    const games = gamesByLabel ?? gamesBySuffix;
    return { games, big, reg };
  }

  async function runOcr() {
    if (!ocrImageUrl) return;
    setOcrStatus("running");
    setOcrError(null);
    setOcrText("");
    setOcrSuggestion(null);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");

      await worker.setParameters({
        tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz:\\n ",
      });

      const res = await worker.recognize(ocrImageUrl);
      const text = res.data.text ?? "";
      await worker.terminate();

      setOcrText(text);
      const sug = parseOcr(text);
      setOcrSuggestion(sug);
      setOcrStatus("done");
    } catch (e) {
      setOcrStatus("error");
      setOcrError(e instanceof Error ? e.message : "OCRに失敗しました。");
    }
  }

  function applyOcrSuggestion() {
    if (!ocrSuggestion) return;
    if (typeof ocrSuggestion.games === "number") setGames(String(ocrSuggestion.games));
    if (typeof ocrSuggestion.big === "number") setBigCount(String(ocrSuggestion.big));
    if (typeof ocrSuggestion.reg === "number") setRegCount(String(ocrSuggestion.reg));
  }

  const error = useMemo(() => {
    if (games === "" && bigCount === "" && regCount === "" && extraCount === "")
      return null;

    if (!(parsed.games > 0)) return "総ゲーム数は1以上で入力してください。";
    if (!(parsed.bigCount >= 0) || !Number.isInteger(parsed.bigCount))
      return "BIG回数は0以上の整数で入力してください。";
    if (!(parsed.regCount >= 0) || !Number.isInteger(parsed.regCount))
      return "REG回数は0以上の整数で入力してください。";
    if (parsed.bigCount + parsed.regCount > parsed.games)
      return "BIG回数 + REG回数 が総ゲーム数を超えています。";

    if (extraLabel) {
      if (extraCount !== "") {
        if (!(parsed.extraCount >= 0) || !Number.isInteger(parsed.extraCount))
          return `${extraLabel}回数は0以上の整数で入力してください。`;
        if (parsed.extraCount > parsed.games)
          return `${extraLabel}回数が総ゲーム数を超えています。`;
      }
    }

    return null;
  }, [parsed, games, bigCount, regCount, extraCount, extraLabel]);

  const posteriorCalc = useMemo(() => {
    if (error) return null;
    if (games === "" && bigCount === "" && regCount === "" && extraCount === "")
      return null;

    const base = calcSettingPosteriors(machine.odds.settings, {
      games: parsed.games,
      bigCount: parsed.bigCount,
      regCount: parsed.regCount,
    });

    if (!hintConfig) return { posteriors: base, note: null };

    // Apply only deterministic constraints (minSetting / exactSetting).
    let hasConstraint = false;
    let minSetting = 1;
    let exactSetting: number | null = null;
    let contradiction = false;

    for (const group of hintConfig.groups) {
      for (const item of group.items) {
        const count = toIntOrZero(hintCounts[item.id] ?? "");
        if (count <= 0) continue;
        const eff = item.effect;

        if (eff.type === "minSetting") {
          hasConstraint = true;
          minSetting = Math.max(minSetting, eff.min);
        }
        if (eff.type === "exactSetting") {
          hasConstraint = true;
          if (exactSetting === null) exactSetting = eff.exact;
          else if (exactSetting !== eff.exact) contradiction = true;
        }
      }
    }

    if (!hasConstraint) return { posteriors: base, note: null };
    if (contradiction) {
      return {
        posteriors: base,
        note: "示唆入力が矛盾している可能性があるため、示唆を無視して計算しました。",
      };
    }

    const numericSettings = machine.odds.settings
      .map((s) => ({ key: s.s, num: settingKeyToNumber(s.s) }))
      .filter((x) => Number.isFinite(x.num));

    const allowed =
      exactSetting !== null
        ? numericSettings.filter((x) => x.num === exactSetting).map((x) => x.key)
        : numericSettings.filter((x) => x.num >= minSetting).map((x) => x.key);

    if (allowed.length === 0) {
      return {
        posteriors: base,
        note: "示唆入力が矛盾している可能性があるため、示唆を無視して計算しました。",
      };
    }

    const constrained = calcSettingPosteriors(
      machine.odds.settings,
      {
        games: parsed.games,
        bigCount: parsed.bigCount,
        regCount: parsed.regCount,
      },
      { allowedSettings: allowed },
    );

    const sum = constrained.reduce((acc, cur) => acc + cur.posterior, 0);
    if (sum > 0) {
      const note =
        exactSetting !== null
          ? `示唆を反映：設定${exactSetting}確定`
          : `示唆を反映：設定${minSetting}以上`;
      return { posteriors: constrained, note };
    }

    return {
      posteriors: base,
      note: "示唆入力が矛盾している可能性があるため、示唆を無視して計算しました。",
    };
  }, [
    machine.odds.settings,
    parsed,
    error,
    games,
    bigCount,
    regCount,
    extraCount,
    hintConfig,
    hintCounts,
  ]);

  const posteriors = posteriorCalc?.posteriors ?? null;
  const posteriorNote = posteriorCalc?.note ?? null;

  const top3 = useMemo(() => {
    if (!posteriors) return null;
    return topNSettings(posteriors, 3);
  }, [posteriors]);

  const ev500 = useMemo(() => {
    if (!posteriors) return null;

    const oddsBySetting = new Map<string, OddsRow>();
    for (const row of machine.odds.settings) oddsBySetting.set(String(row.s), row);

    const perSetting = posteriors
      .map((p) => {
        const odds = oddsBySetting.get(String(p.s));
        const rate = odds?.rate;
        const netCoins =
          typeof rate === "number"
            ? PREDICT_GAMES * BET_PER_GAME * (rate / 100 - 1)
            : NaN;
        return { s: p.s, posterior: p.posterior, netCoins };
      })
      .sort((a, b) => b.posterior - a.posterior);

    const overall = perSetting.reduce(
      (acc, cur) => (Number.isFinite(cur.netCoins) ? acc + cur.posterior * cur.netCoins : acc),
      0,
    );

    return { overall, perSettingTop3: perSetting.slice(0, 3) };
  }, [posteriors, machine.odds.settings]);

  const yenPerCoin = useMemo(() => {
    if (exchangeMode === "equal") return DEFAULT_YEN_PER_COIN;
    const v = Number(yenPerCoinCustom);
    if (!Number.isFinite(v) || v <= 0) return NaN;
    return v;
  }, [exchangeMode, yenPerCoinCustom]);

  const sorted = useMemo(() => {
    if (!posteriors) return null;
    return [...posteriors].sort((a, b) => {
      const aKey = String(a.s);
      const bKey = String(b.s);
      const aNum = Number(aKey);
      const bNum = Number(bKey);
      const aIsNum = Number.isFinite(aNum);
      const bIsNum = Number.isFinite(bNum);
      if (aIsNum && bIsNum) return aNum - bNum;
      if (aIsNum) return -1;
      if (bIsNum) return 1;
      return aKey.localeCompare(bKey);
    });
  }, [posteriors]);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-lg font-semibold">設定判別</h2>
      <p className="mt-1 text-sm text-neutral-600">
        総ゲーム数 / BIG / REG を入力すると、近い設定TOP3を表示します。
      </p>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm font-semibold">データカウンター画像から入力</p>
        <p className="mt-1 text-xs text-neutral-500">
          スクショを読み込んで、総G/BIG/REGを自動入力します（対応していない表示もあります）。
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600">画像</span>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                cleanupObjectUrl();
                const url = URL.createObjectURL(f);
                lastObjectUrlRef.current = url;
                setOcrImageUrl(url);
                setOcrStatus("idle");
                setOcrError(null);
                setOcrText("");
                setOcrSuggestion(null);
              }}
            />
          </label>

          {ocrImageUrl ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ocrImageUrl}
                alt="データカウンター画像"
                className="h-28 w-full rounded-md object-contain"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={runOcr}
            disabled={!ocrImageUrl || ocrStatus === "running"}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
          >
            {ocrStatus === "running" ? "読み取り中…" : "画像を読み取る"}
          </button>

          <button
            type="button"
            onClick={applyOcrSuggestion}
            disabled={!ocrSuggestion}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
          >
            反映する
          </button>

          {ocrSuggestion ? (
            <p className="text-xs text-neutral-600">
              推定：
              {typeof ocrSuggestion.games === "number" ? `総G ${ocrSuggestion.games} / ` : ""}
              {typeof ocrSuggestion.big === "number" ? `BIG ${ocrSuggestion.big} / ` : ""}
              {typeof ocrSuggestion.reg === "number" ? `REG ${ocrSuggestion.reg}` : ""}
            </p>
          ) : null}
        </div>

        {ocrError ? <p className="mt-2 text-sm font-medium text-red-600">{ocrError}</p> : null}

        {ocrText ? (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-semibold text-neutral-600">
              読み取り結果（テキスト）
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-neutral-200 bg-white p-3 text-xs text-neutral-700">
{ocrText}
            </pre>
          </details>
        ) : null}
      </div>

      <form
        className={`mt-4 grid gap-3 ${
          extraLabel ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">総G</span>
          <input
            inputMode="numeric"
            value={games}
            onChange={(e) => setGames(e.target.value)}
            placeholder="例: 3000"
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </label>

        <CountField
          label="BIG"
          value={bigCount}
          onChange={setBigCount}
          placeholder="例: 10"
          onStep={(delta) => {
            const g = parsed.games;
            const current = toIntOrZero(bigCount);
            const reg = toIntOrZero(regCount);
            const max = g > 0 ? Math.max(0, Math.trunc(g) - reg) : Number.POSITIVE_INFINITY;
            const next = Math.min(Math.max(current + delta, 0), max);
            setBigCount(String(next));
          }}
        />

        <CountField
          label="REG"
          value={regCount}
          onChange={setRegCount}
          placeholder="例: 8"
          onStep={(delta) => {
            const g = parsed.games;
            const current = toIntOrZero(regCount);
            const big = toIntOrZero(bigCount);
            const max = g > 0 ? Math.max(0, Math.trunc(g) - big) : Number.POSITIVE_INFINITY;
            const next = Math.min(Math.max(current + delta, 0), max);
            setRegCount(String(next));
          }}
        />

        {extraLabel ? (
          <CountField
            label={extraLabel}
            value={extraCount}
            onChange={setExtraCount}
            placeholder={extraLabel === "ブドウ" ? "例: 350" : "例: 200"}
            showStep5
            onStep={(delta) => {
              const g = parsed.games;
              const current = toIntOrZero(extraCount);
              const max = g > 0 ? Math.trunc(g) : Number.POSITIVE_INFINITY;
              const next = Math.min(Math.max(current + delta, 0), max);
              setExtraCount(String(next));
            }}
          />
        ) : null}
      </form>

      {hintConfig ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-semibold">示唆カウント</p>
          <p className="mt-1 text-xs text-neutral-500">
            反映される示唆（設定◯以上/確定系）は、総G/BIG/REGを入力すると判別に反映されます。
          </p>

          <div className="mt-3 space-y-3">
            {hintConfig.groups.map((group) => {
              const total = group.items.reduce(
                (acc, it) => acc + toIntOrZero(hintCounts[it.id] ?? ""),
                0,
              );

              const maxBase =
                group.maxTotalFrom === "regCount"
                  ? toIntOrZero(regCount)
                  : group.maxTotalFrom === "bigCount"
                    ? toIntOrZero(bigCount)
                    : null;

              const showWarn = typeof maxBase === "number" && maxBase > 0 && total > maxBase;

              return (
                <div
                  key={group.id}
                  className="rounded-lg border border-neutral-200 bg-white p-3"
                >
                  <p className="text-xs font-semibold text-neutral-700">{group.title}</p>
                  {group.note ? (
                    <p className="mt-1 text-xs text-neutral-500">{group.note}</p>
                  ) : null}

                  {showWarn ? (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      合計({total})が {group.maxTotalFrom === "regCount" ? "REG回数" : "BIG回数"}
                      ({maxBase}) を超えています。
                    </p>
                  ) : null}

                  <div className="mt-3 grid gap-2">
                    {group.items.map((item) => {
                      const value = hintCounts[item.id] ?? "";
                      return (
                        <CountField
                          key={item.id}
                          label={item.label}
                          value={value}
                          onChange={(next) =>
                            setHintCounts((prev) => ({ ...prev, [item.id]: next }))
                          }
                          onStep={(delta) => {
                            const current = toIntOrZero(value);
                            const next = String(Math.max(0, current + delta));
                            setHintCounts((prev) => ({ ...prev, [item.id]: next }));
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      {!error && (games !== "" || bigCount !== "" || regCount !== "" || extraCount !== "") ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-semibold">実測確率</p>
            <div
              className={`mt-2 grid gap-2 text-sm text-neutral-700 ${
                extraLabel ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"
              }`}
            >
              <div>
                <p className="text-xs text-neutral-500">BIG</p>
                <p className="font-semibold">
                  {fmtOneOver(parsed.games, parsed.bigCount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">REG</p>
                <p className="font-semibold">
                  {fmtOneOver(parsed.games, parsed.regCount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">合算</p>
                <p className="font-semibold">
                  {fmtOneOver(parsed.games, parsed.bigCount + parsed.regCount)}
                </p>
              </div>

              {extraLabel ? (
                <div>
                  <p className="text-xs text-neutral-500">{extraLabel}</p>
                  <p className="font-semibold">{fmtOneOver(parsed.games, parsed.extraCount)}</p>
                </div>
              ) : null}
            </div>
          </div>

          {top3 ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold">近い設定TOP3</p>
              {posteriorNote ? (
                <p className="mt-1 text-xs text-neutral-500">{posteriorNote}</p>
              ) : null}
              <p className="mt-2 text-sm text-neutral-700">
                {top3.map((t) => `${t.s}（${fmtPct(t.posterior)}）`).join(" / ")}
              </p>
            </div>
          ) : null}

          {ev500 ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold">
                500G先 期待差枚（推定）
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                機械割(%)と判別結果からの概算です（3枚掛け想定）。
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-neutral-200 bg-white p-3">
                  <p className="text-xs font-semibold text-neutral-600">換算</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                      <input
                        type="radio"
                        name="exchangeMode"
                        value="equal"
                        checked={exchangeMode === "equal"}
                        onChange={() => setExchangeMode("equal")}
                      />
                      等価（1枚=20円）
                    </label>
                    <label className="flex items-center gap-2 text-sm text-neutral-700">
                      <input
                        type="radio"
                        name="exchangeMode"
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
              </div>

              <div className="mt-3 grid gap-2 text-sm text-neutral-700 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-neutral-500">全体（期待値）</p>
                  <p className="font-semibold">
                    {fmtSigned(ev500.overall)}枚
                    {Number.isFinite(yenPerCoin) ? (
                      <span className="text-neutral-500">
                        {" "}（{fmtYenSigned(ev500.overall * yenPerCoin)}）
                      </span>
                    ) : null}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">TOP3内訳</p>
                  <p className="font-semibold">
                    {ev500.perSettingTop3
                      .map(
                        (t) =>
                          `${t.s}: ${fmtSigned(t.netCoins)}枚$${Number.isFinite(yenPerCoin) ? `（${fmtYenSigned(t.netCoins * yenPerCoin)}）` : ""}（${fmtPct(t.posterior)}）`,
                      )
                      .join(" / ")}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {sorted ? (
            <PosteriorOddsTable machine={machine} posteriors={sorted} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function CountField({
  label,
  value,
  onChange,
  placeholder,
  onStep,
  showStep5,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  onStep: (delta: number) => void;
  showStep5?: boolean;
}) {
  const current = toIntOrZero(value);

  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-600">{label}</span>
      <div className="mt-1 grid grid-cols-[40px_1fr_40px] gap-2">
        <button
          type="button"
          className="rounded-lg border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-40"
          onClick={() => onStep(-1)}
          disabled={current <= 0}
          aria-label={`${label}を1減らす`}
        >
          −
        </button>
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          className="rounded-lg border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
          onClick={() => onStep(1)}
          aria-label={`${label}を1増やす`}
        >
          ＋
        </button>
      </div>

      {showStep5 ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-40"
            onClick={() => onStep(-5)}
            disabled={current <= 0}
            aria-label={`${label}を5減らす`}
          >
            −5
          </button>
          <button
            type="button"
            className="rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
            onClick={() => onStep(5)}
            aria-label={`${label}を5増やす`}
          >
            ＋5
          </button>
        </div>
      ) : null}
    </label>
  );
}

function PosteriorOddsTable({
  machine,
  posteriors,
}: {
  machine: Machine;
  posteriors: SettingPosterior[];
}) {
  const oddsBySetting = useMemo(() => {
    const map = new Map<string, OddsRow>();
    for (const row of machine.odds.settings) {
      map.set(String(row.s), row);
    }
    return map;
  }, [machine.odds.settings]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-neutral-600">
            <th className="px-3 py-2 border border-neutral-200">設定</th>
            <th className="px-3 py-2 border border-neutral-200">確率</th>
            <th className="px-3 py-2 border border-neutral-200">BIG</th>
            <th className="px-3 py-2 border border-neutral-200">REG</th>
            <th className="px-3 py-2 border border-neutral-200">合算</th>
            <th className="px-3 py-2 border border-neutral-200">機械割(%)</th>
          </tr>
        </thead>
        <tbody>
          {posteriors.map((p) => {
            const odds = oddsBySetting.get(String(p.s));
            return (
              <tr key={String(p.s)} className="text-neutral-800">
                <td className="px-3 py-2 font-semibold border border-neutral-200">{p.s}</td>
                <td className="px-3 py-2 border border-neutral-200">{fmtPct(p.posterior)}</td>
                <td className="px-3 py-2 border border-neutral-200">
                  {odds ? `1/${fmt(odds.big)}` : "-"}
                </td>
                <td className="px-3 py-2 border border-neutral-200">
                  {odds ? `1/${fmt(odds.reg)}` : "-"}
                </td>
                <td className="px-3 py-2 border border-neutral-200">
                  {odds ? `1/${fmt(odds.total)}` : "-"}
                </td>
                <td className="px-3 py-2 border border-neutral-200">{odds ? fmt(odds.rate) : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
