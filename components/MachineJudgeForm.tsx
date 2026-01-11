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
  const [extraCounts, setExtraCounts] = useState<Record<string, string>>({});
  const [suikaTrials, setSuikaTrials] = useState<string>("");
  const [suikaCzHits, setSuikaCzHits] = useState<string>("");
  const [uraAtTrials, setUraAtTrials] = useState<string>("");
  const [uraAtHits, setUraAtHits] = useState<string>("");

  const bigLabel = machine.metricsLabels?.bigLabel ?? "BIG";
  const regLabelRaw = machine.metricsLabels?.regLabel;
  const showReg = regLabelRaw !== null;
  const regLabel = regLabelRaw ?? "REG";
  const totalLabelRaw = machine.metricsLabels?.totalLabel;
  const showTotal = totalLabelRaw !== null;
  const totalLabel = (totalLabelRaw === undefined ? "合算" : totalLabelRaw) ?? "合算";
  const suikaTrialsLabel = machine.metricsLabels?.suikaTrialsLabel ?? null;
  const suikaCzHitsLabel = machine.metricsLabels?.suikaCzHitsLabel ?? null;
  const suikaCzRateLabel = machine.metricsLabels?.suikaCzRateLabel ?? "スイカCZ当選率";

  const uraAtTrialsLabel = machine.metricsLabels?.uraAtTrialsLabel ?? null;
  const uraAtHitsLabel = machine.metricsLabels?.uraAtHitsLabel ?? null;
  const uraAtRateLabel = machine.metricsLabels?.uraAtRateLabel ?? "裏AT直行率";

  const hideHintDescriptions = machine.maker === "パイオニア";

  const hintConfig = useMemo(() => getHintConfig(machine.id), [machine.id]);
  const [hintCounts, setHintCounts] = useState<Record<string, string>>({});
  const [collapsedHintGroups, setCollapsedHintGroups] = useState<Record<string, boolean>>({});
  const [hintMemos, setHintMemos] = useState<Record<string, string>>({});

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
    machine.metricsLabels?.extraLabel ??
    (machine.category === "JUG"
      ? "ブドウ"
      : machine.category === "HANAHANA"
        ? "ベル"
        : null);

  const extraMetrics = machine.metricsLabels?.extraMetrics ?? null;
  const showExtraMetrics = !!extraMetrics && extraMetrics.length > 0;

  useEffect(() => {
    // Avoid carrying hint inputs across machine switches.
    setHintCounts({});
    setCollapsedHintGroups({});
    setExtraCounts({});
    setHintMemos({});
  }, [machine.id]);

  useEffect(() => {
    if (!hintConfig) return;
    try {
      const next: Record<string, string> = {};
      for (const group of hintConfig.groups) {
        const key = `slokasu:hintMemo:${machine.id}:${group.id}`;
        const v = window.localStorage.getItem(key);
        if (v) next[group.id] = v;
      }
      setHintMemos(next);
    } catch {
      // ignore (e.g. private mode / disabled storage)
    }
  }, [machine.id, hintConfig]);

  const renderNoteWithLinks = (note: string) => {
    const urlRe = /(https?:\/\/[^\s]+)/g;
    const parts = note.split(urlRe);
    return parts.map((part, idx) => {
      const isUrl = /^https?:\/\//.test(part);
      if (!isUrl) return <span key={idx}>{part}</span>;
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="underline text-neutral-900"
        >
          {part}
        </a>
      );
    });
  };

  const parsed = useMemo(() => {
    const g = Number(games);
    const b = Number(bigCount);
    const r = Number(regCount);
    const x = Number(extraCount);
    const st = Number(suikaTrials);
    const sh = Number(suikaCzHits);
    const ut = Number(uraAtTrials);
    const uh = Number(uraAtHits);

    const parsedExtraCounts: Record<string, number> = {};
    for (const [k, v] of Object.entries(extraCounts)) {
      const n = Number(v);
      parsedExtraCounts[k] = Number.isFinite(n) ? n : Number.NaN;
    }

    return {
      games: Number.isFinite(g) ? g : NaN,
      bigCount: Number.isFinite(b) ? b : NaN,
      regCount: showReg ? (Number.isFinite(r) ? r : NaN) : 0,
      extraCount: Number.isFinite(x) ? x : NaN,
      extraCounts: parsedExtraCounts,
      suikaTrials: Number.isFinite(st) ? st : NaN,
      suikaCzHits: Number.isFinite(sh) ? sh : NaN,
      uraAtTrials: Number.isFinite(ut) ? ut : NaN,
      uraAtHits: Number.isFinite(uh) ? uh : NaN,
    };
  }, [
    games,
    bigCount,
    regCount,
    extraCount,
    extraCounts,
    suikaTrials,
    suikaCzHits,
    uraAtTrials,
    uraAtHits,
    showReg,
  ]);

  function cleanupObjectUrl() {
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      cleanupObjectUrl();
    };
  }, []);

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
    const big = pickInt(
      find(/\b(?:BIG|BB|BONUS)\b\s*[:：]?\s*(\d{1,4})/i) ??
        find(/ボーナス\s*[:：]?\s*(\d{1,4})/i),
    );
    const reg = pickInt(find(/\b(?:REG|RB|AT)\b\s*[:：]?\s*(\d{1,4})/i));

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
    if (showReg && typeof ocrSuggestion.reg === "number") setRegCount(String(ocrSuggestion.reg));
  }

  const error = useMemo(() => {
    if (
      games === "" &&
      bigCount === "" &&
      (showReg ? regCount === "" : true) &&
      extraCount === "" &&
      Object.values(extraCounts).every((v) => v === "") &&
      suikaTrials === "" &&
      suikaCzHits === "" &&
      uraAtTrials === "" &&
      uraAtHits === ""
    )
      return null;

    if (!(parsed.games > 0)) return "総ゲーム数は1以上で入力してください。";
    if (!(parsed.bigCount >= 0) || !Number.isInteger(parsed.bigCount))
      return `${bigLabel}回数は0以上の整数で入力してください。`;
    if (showReg) {
      if (!(parsed.regCount >= 0) || !Number.isInteger(parsed.regCount))
        return `${regLabel}回数は0以上の整数で入力してください。`;
      if (parsed.bigCount + parsed.regCount > parsed.games)
        return `${bigLabel}回数 + ${regLabel}回数 が総ゲーム数を超えています。`;
    } else {
      if (parsed.bigCount > parsed.games)
        return `${bigLabel}回数が総ゲーム数を超えています。`;
    }

    if (!showExtraMetrics && extraLabel) {
      if (extraCount !== "") {
        if (!(parsed.extraCount >= 0) || !Number.isInteger(parsed.extraCount))
          return `${extraLabel}回数は0以上の整数で入力してください。`;
        if (parsed.extraCount > parsed.games)
          return `${extraLabel}回数が総ゲーム数を超えています。`;
      }
    }

    if (showExtraMetrics && extraMetrics) {
      for (const m of extraMetrics) {
        const raw = extraCounts[m.id] ?? "";
        if (raw === "") continue;
        const n = parsed.extraCounts[m.id];
        if (!(n >= 0) || !Number.isInteger(n))
          return `${m.label}回数は0以上の整数で入力してください。`;
        if (n > parsed.games) return `${m.label}回数が総ゲーム数を超えています。`;
      }
    }

    const showSuika = !!suikaTrialsLabel && !!suikaCzHitsLabel;
    if (showSuika) {
      if ((suikaTrials === "") !== (suikaCzHits === ""))
        return `${suikaTrialsLabel}と${suikaCzHitsLabel}は両方入力してください。`;
      if (suikaTrials !== "") {
        if (!(parsed.suikaTrials >= 0) || !Number.isInteger(parsed.suikaTrials))
          return `${suikaTrialsLabel}は0以上の整数で入力してください。`;
        if (!(parsed.suikaCzHits >= 0) || !Number.isInteger(parsed.suikaCzHits))
          return `${suikaCzHitsLabel}は0以上の整数で入力してください。`;
        if (parsed.suikaCzHits > parsed.suikaTrials)
          return `${suikaCzHitsLabel}が${suikaTrialsLabel}を超えています。`;
      }
    }

    const showUraAt = !!uraAtTrialsLabel && !!uraAtHitsLabel;
    if (showUraAt) {
      if ((uraAtTrials === "") !== (uraAtHits === ""))
        return `${uraAtTrialsLabel}と${uraAtHitsLabel}は両方入力してください。`;
      if (uraAtTrials !== "") {
        if (!(parsed.uraAtTrials >= 0) || !Number.isInteger(parsed.uraAtTrials))
          return `${uraAtTrialsLabel}は0以上の整数で入力してください。`;
        if (!(parsed.uraAtHits >= 0) || !Number.isInteger(parsed.uraAtHits))
          return `${uraAtHitsLabel}は0以上の整数で入力してください。`;
        if (parsed.uraAtHits > parsed.uraAtTrials)
          return `${uraAtHitsLabel}が${uraAtTrialsLabel}を超えています。`;
      }
    }

    return null;
  }, [
    parsed,
    games,
    bigCount,
    regCount,
    extraCount,
    extraCounts,
    suikaTrials,
    suikaCzHits,
    uraAtTrials,
    uraAtHits,
    extraLabel,
    extraMetrics,
    showExtraMetrics,
    bigLabel,
    regLabel,
    showReg,
    suikaTrialsLabel,
    suikaCzHitsLabel,
    uraAtTrialsLabel,
    uraAtHitsLabel,
  ]);

  const posteriorCalc = useMemo(() => {
    if (error) return null;

    const hasAnyExtraMetricsInput = Object.values(extraCounts).some((v) => v !== "");
    if (
      games === "" &&
      bigCount === "" &&
      (showReg ? regCount === "" : true) &&
      extraCount === "" &&
      !hasAnyExtraMetricsInput &&
      suikaTrials === "" &&
      suikaCzHits === "" &&
      uraAtTrials === "" &&
      uraAtHits === ""
    )
      return null;

    const extraCountsForJudge: Record<string, number> | undefined = (() => {
      if (!showExtraMetrics || !extraMetrics) return undefined;
      const out: Record<string, number> = {};
      for (const m of extraMetrics) {
        const raw = extraCounts[m.id] ?? "";
        if (raw === "") continue;
        const n = parsed.extraCounts[m.id];
        if (!Number.isFinite(n)) continue;
        out[m.id] = n;
      }
      return Object.keys(out).length > 0 ? out : undefined;
    })();

    const base = calcSettingPosteriors(machine.odds.settings, {
      games: parsed.games,
      bigCount: parsed.bigCount,
      regCount: showReg ? parsed.regCount : 0,
      extraCount: extraCount === "" ? undefined : parsed.extraCount,
      extraCounts: extraCountsForJudge,
      suikaTrials: suikaTrials === "" ? undefined : parsed.suikaTrials,
      suikaCzHits: suikaCzHits === "" ? undefined : parsed.suikaCzHits,
      uraAtTrials: uraAtTrials === "" ? undefined : parsed.uraAtTrials,
      uraAtHits: uraAtHits === "" ? undefined : parsed.uraAtHits,
    });

    if (!hintConfig) return { posteriors: base, note: null };

  // Apply hint effects on the posterior distribution directly.
  // - Deterministic constraints: minSetting / exactSetting / excludeSetting
  // - Soft hints: weight (multipliers)
  let hasConstraint = false;
  let hasWeight = false;
  let minSetting = 1;
  let exactSetting: number | null = null;
  const excluded = new Set<number>();
  const weightBySetting = new Map<number, number>();
  let contradiction = false;

    for (const group of hintConfig.groups) {
      for (const item of group.items) {
        const count = toIntOrZero(hintCounts[item.id] ?? "");
        if (count <= 0) continue;

        const effects = (() => {
          const root = item.effect;
          if (root.type !== "allOf") return [root];
          // one-level flatten is enough for our use cases
          return root.effects;
        })();

        for (const eff of effects) {
          if (eff.type === "minSetting") {
            hasConstraint = true;
            minSetting = Math.max(minSetting, eff.min);
          } else if (eff.type === "exactSetting") {
            hasConstraint = true;
            if (exactSetting === null) exactSetting = eff.exact;
            else if (exactSetting !== eff.exact) contradiction = true;
          } else if (eff.type === "excludeSetting") {
            hasConstraint = true;
            excluded.add(eff.exclude);
          } else if (eff.type === "weight") {
            hasWeight = true;
            for (const [k, v] of Object.entries(eff.weights)) {
              const settingNum = Number(k);
              if (!Number.isFinite(settingNum)) continue;
              const multiplier = Number(v);
              if (!Number.isFinite(multiplier) || multiplier <= 0) continue;
              const current = weightBySetting.get(settingNum) ?? 1;
              weightBySetting.set(settingNum, current * Math.pow(multiplier, count));
            }
          }
        }
      }
    }

    if (!hasConstraint && !hasWeight) return { posteriors: base, note: null };
    if (contradiction) {
      return {
        posteriors: base,
        note: "示唆入力が矛盾している可能性があるため、示唆を無視して計算しました。",
      };
    }

    const numericSettings = machine.odds.settings
      .map((s) => ({ key: s.s, num: settingKeyToNumber(s.s) }))
      .filter((x) => Number.isFinite(x.num));

    const allowedNums =
      exactSetting !== null
        ? numericSettings
            .filter((x) => x.num === exactSetting && !excluded.has(x.num))
            .map((x) => x.num)
        : numericSettings
            .filter((x) => x.num >= minSetting && !excluded.has(x.num))
            .map((x) => x.num);

    if (hasConstraint && allowedNums.length === 0) {
      return {
        posteriors: base,
        note: "示唆入力が矛盾している可能性があるため、示唆を無視して計算しました。",
      };
    }

    const allowedSet = new Set<number>(allowedNums);

    const adjusted = base.map((p) => {
      const n = settingKeyToNumber(p.s);
      const isNumeric = Number.isFinite(n);
      if (hasConstraint) {
        if (!isNumeric) return { ...p, posterior: 0 };
        if (!allowedSet.has(n)) return { ...p, posterior: 0 };
      }

      if (!isNumeric) return p;

      const mult = hasWeight ? (weightBySetting.get(n) ?? 1) : 1;
      return { ...p, posterior: p.posterior * mult };
    });

    const sum = adjusted.reduce((acc, cur) => acc + cur.posterior, 0);
    if (!(sum > 0)) {
      return {
        posteriors: base,
        note: "示唆入力が矛盾している可能性があるため、示唆を無視して計算しました。",
      };
    }

    const normalized = adjusted.map((p) => ({ ...p, posterior: p.posterior / sum }));

    const noteParts: string[] = [];
    if (hasConstraint) {
      if (exactSetting !== null) noteParts.push(`設定${exactSetting}確定`);
      else if (minSetting > 1) noteParts.push(`設定${minSetting}以上`);
      if (excluded.size > 0) {
        const xs = Array.from(excluded).sort((a, b) => a - b).join(",");
        noteParts.push(`設定${xs}否定`);
      }
    }
    if (hasWeight) noteParts.push("ソフト示唆");

    const note = noteParts.length > 0 ? `示唆を反映：${noteParts.join(" / ")}` : null;
    return { posteriors: normalized, note };
  }, [
    machine.odds.settings,
    parsed,
    error,
    games,
    bigCount,
    regCount,
    extraCount,
    extraCounts,
    suikaTrials,
    suikaCzHits,
    uraAtTrials,
    uraAtHits,
    showReg,
    hintConfig,
    hintCounts,
    extraMetrics,
    showExtraMetrics,
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
        総ゲーム数 / {bigLabel}
        {showReg ? ` / ${regLabel}` : ""}
        を入力すると、近い設定TOP3を表示します。
      </p>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm font-semibold">データカウンター画像から入力</p>
        <p className="mt-1 text-xs text-neutral-500">
          スクショを読み込んで、総G/{bigLabel}
          {showReg ? `/${regLabel}` : ""}
          を自動入力します（対応していない表示もあります）。
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
              {typeof ocrSuggestion.big === "number" ? `${bigLabel} ${ocrSuggestion.big} / ` : ""}
              {showReg && typeof ocrSuggestion.reg === "number" ? `${regLabel} ${ocrSuggestion.reg}` : ""}
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
          extraLabel ||
          showExtraMetrics ||
          (suikaTrialsLabel && suikaCzHitsLabel) ||
          (uraAtTrialsLabel && uraAtHitsLabel)
            ? "grid-cols-2 sm:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-3"
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
          label={bigLabel}
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

        {showReg ? (
          <CountField
            label={regLabel}
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
        ) : null}

        {!showExtraMetrics && extraLabel ? (
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

        {showExtraMetrics && extraMetrics
          ? extraMetrics.map((m) => (
              <CountField
                key={m.id}
                label={m.label}
                value={extraCounts[m.id] ?? ""}
                onChange={(next) =>
                  setExtraCounts((prev) => ({
                    ...prev,
                    [m.id]: next,
                  }))
                }
                placeholder="例: 10"
                showStep5
                onStep={(delta) => {
                  const g = parsed.games;
                  const current = toIntOrZero(extraCounts[m.id] ?? "");
                  const max = g > 0 ? Math.trunc(g) : Number.POSITIVE_INFINITY;
                  const next = Math.min(Math.max(current + delta, 0), max);
                  setExtraCounts((prev) => ({
                    ...prev,
                    [m.id]: String(next),
                  }));
                }}
              />
            ))
          : null}

        {suikaTrialsLabel && suikaCzHitsLabel ? (
          <>
            <CountField
              label={suikaTrialsLabel}
              value={suikaTrials}
              onChange={setSuikaTrials}
              placeholder="例: 40"
              showStep5
              onStep={(delta) => {
                const current = toIntOrZero(suikaTrials);
                const next = Math.max(0, current + delta);
                const hits = toIntOrZero(suikaCzHits);
                const cappedHits = Math.min(hits, next);
                setSuikaTrials(String(next));
                if (cappedHits !== hits) setSuikaCzHits(String(cappedHits));
              }}
            />
            <CountField
              label={suikaCzHitsLabel}
              value={suikaCzHits}
              onChange={setSuikaCzHits}
              placeholder="例: 10"
              onStep={(delta) => {
                const trials = toIntOrZero(suikaTrials);
                const current = toIntOrZero(suikaCzHits);
                const next = Math.min(Math.max(current + delta, 0), trials);
                setSuikaCzHits(String(next));
              }}
            />
          </>
        ) : null}

        {uraAtTrialsLabel && uraAtHitsLabel ? (
          <>
            <CountField
              label={uraAtTrialsLabel}
              value={uraAtTrials}
              onChange={setUraAtTrials}
              placeholder="例: 20"
              showStep5
              onStep={(delta) => {
                const current = toIntOrZero(uraAtTrials);
                const next = Math.max(0, current + delta);
                const hits = toIntOrZero(uraAtHits);
                const cappedHits = Math.min(hits, next);
                setUraAtTrials(String(next));
                if (cappedHits !== hits) setUraAtHits(String(cappedHits));
              }}
            />
            <CountField
              label={uraAtHitsLabel}
              value={uraAtHits}
              onChange={setUraAtHits}
              placeholder="例: 1"
              onStep={(delta) => {
                const trials = toIntOrZero(uraAtTrials);
                const current = toIntOrZero(uraAtHits);
                const next = Math.min(Math.max(current + delta, 0), trials);
                setUraAtHits(String(next));
              }}
            />
          </>
        ) : null}
      </form>

      {hintConfig ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-semibold">示唆カウント</p>
          {!hideHintDescriptions ? (
            <p className="mt-1 text-xs text-neutral-500">
              反映される示唆（設定◯以上/確定系）は、総G/{bigLabel}
              {showReg ? `/${regLabel}` : ""}
              を入力すると判別に反映されます。
            </p>
          ) : null}

          {!hideHintDescriptions && hintConfig.helpUrl ? (
            <p className="mt-1 text-xs text-neutral-500">
              示唆画面の確認はこちら：
              <a
                href={hintConfig.helpUrl}
                target="_blank"
                rel="noreferrer"
                className="underline text-neutral-900"
              >
                {hintConfig.helpUrl}
              </a>
            </p>
          ) : null}

          <div className="mt-3 space-y-3">
            {hintConfig.groups.map((group) => {
              const total = group.items.reduce(
                (acc, it) => acc + toIntOrZero(hintCounts[it.id] ?? ""),
                0,
              );

              const showHintMemo = machine.id !== "smart-onimusha-3";

              const collapsed =
                group.id in collapsedHintGroups
                  ? !!collapsedHintGroups[group.id]
                  : !!group.defaultCollapsed;

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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-neutral-700">{group.title}</p>
                      {!hideHintDescriptions && group.note ? (
                        <p className="mt-1 text-xs text-neutral-500">
                          {renderNoteWithLinks(group.note)}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      className="shrink-0 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
                      onClick={() =>
                        setCollapsedHintGroups((prev) => ({
                          ...prev,
                          [group.id]: !collapsed,
                        }))
                      }
                      aria-expanded={!collapsed}
                      aria-controls={`hint-group-${group.id}`}
                    >
                      {collapsed ? "開く" : "閉じる"}
                    </button>
                  </div>

                  {showWarn ? (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      合計({total})が {group.maxTotalFrom === "regCount" && showReg ? `${regLabel}回数` : `${bigLabel}回数`}
                      ({maxBase}) を超えています。
                    </p>
                  ) : null}

                  {!collapsed ? (
                    <div id={`hint-group-${group.id}`} className="mt-3 grid gap-2">
                      {showHintMemo ? (
                        <div>
                          <p className="text-xs font-semibold text-neutral-700">メモ（台詞など自由入力）</p>
                          <p className="mt-1 text-xs text-neutral-500">
                            判別には未反映。必要ならそのまま貼り付けてください。
                          </p>
                          <textarea
                            value={hintMemos[group.id] ?? ""}
                            onChange={(e) => {
                              const next = e.target.value;
                              setHintMemos((prev) => ({ ...prev, [group.id]: next }));
                              try {
                                const key = `slokasu:hintMemo:${machine.id}:${group.id}`;
                                if (next) window.localStorage.setItem(key, next);
                                else window.localStorage.removeItem(key);
                              } catch {
                                // ignore
                              }
                            }}
                            placeholder="例：表示されたボイス台詞をそのまま入力"
                            rows={3}
                            className="mt-2 w-full rounded-md border border-neutral-200 bg-white p-2 text-xs text-neutral-900"
                          />
                        </div>
                      ) : null}

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
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      {!error &&
      (games !== "" ||
        bigCount !== "" ||
        (showReg ? regCount !== "" : false) ||
        extraCount !== "" ||
        Object.values(extraCounts).some((v) => v !== "") ||
        suikaTrials !== "" ||
        suikaCzHits !== "" ||
        uraAtTrials !== "" ||
        uraAtHits !== "") ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-semibold">実測確率</p>
            <div
              className={`mt-2 grid gap-2 text-sm text-neutral-700 ${
                (() => {
                  const showSuika = !!suikaTrialsLabel && !!suikaCzHitsLabel && suikaTrials !== "";
                  const showUraAt =
                    !!uraAtTrialsLabel && !!uraAtHitsLabel && uraAtTrials !== "";
                  const baseCols = showReg ? 2 : 1;
                  const extraCols = showExtraMetrics && extraMetrics
                    ? extraMetrics.length
                    : extraLabel
                      ? 1
                      : 0;
                  const cols =
                    baseCols +
                    (showTotal ? 1 : 0) +
                    (showSuika ? 1 : 0) +
                    (showUraAt ? 1 : 0) +
                    extraCols;
                  if (cols <= 2) return "grid-cols-2";
                  if (cols === 3) return "grid-cols-3";
                  if (cols === 4) return "grid-cols-2 sm:grid-cols-4";
                  return "grid-cols-2 sm:grid-cols-5";
                })()
              }`}
            >
              <div>
                <p className="text-xs text-neutral-500">{bigLabel}</p>
                <p className="font-semibold">
                  {fmtOneOver(parsed.games, parsed.bigCount)}
                </p>
              </div>
              {showReg ? (
                <div>
                  <p className="text-xs text-neutral-500">{regLabel}</p>
                  <p className="font-semibold">
                    {fmtOneOver(parsed.games, parsed.regCount)}
                  </p>
                </div>
              ) : null}
              {showTotal ? (
                <div>
                  <p className="text-xs text-neutral-500">{totalLabel}</p>
                  <p className="font-semibold">
                    {fmtOneOver(parsed.games, parsed.bigCount + (showReg ? parsed.regCount : 0))}
                  </p>
                </div>
              ) : null}

              {suikaTrialsLabel && suikaCzHitsLabel && suikaTrials !== "" ? (
                <div>
                  <p className="text-xs text-neutral-500">{suikaCzRateLabel}</p>
                  <p className="font-semibold">
                    {(() => {
                      const t = parsed.suikaTrials;
                      const h = parsed.suikaCzHits;
                      if (!(t > 0) || !(h >= 0)) return "-";
                      return `${((h / t) * 100).toFixed(1)}%`;
                    })()}
                  </p>
                </div>
              ) : null}

              {uraAtTrialsLabel && uraAtHitsLabel && uraAtTrials !== "" ? (
                <div>
                  <p className="text-xs text-neutral-500">{uraAtRateLabel}</p>
                  <p className="font-semibold">
                    {(() => {
                      const t = parsed.uraAtTrials;
                      const h = parsed.uraAtHits;
                      if (!(t > 0) || !(h >= 0)) return "-";
                      return `${((h / t) * 100).toFixed(2)}%`;
                    })()}
                  </p>
                </div>
              ) : null}

              {!showExtraMetrics && extraLabel ? (
                <div>
                  <p className="text-xs text-neutral-500">{extraLabel}</p>
                  <p className="font-semibold">{fmtOneOver(parsed.games, parsed.extraCount)}</p>
                </div>
              ) : null}

              {showExtraMetrics && extraMetrics
                ? extraMetrics.map((m) => (
                    <div key={m.id}>
                      <p className="text-xs text-neutral-500">{m.label}</p>
                      <p className="font-semibold">
                        {fmtOneOver(parsed.games, parsed.extraCounts[m.id])}
                      </p>
                    </div>
                  ))
                : null}
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
  const bigLabel = machine.metricsLabels?.bigLabel ?? "BIG";
  const regLabelRaw = machine.metricsLabels?.regLabel;
  const showReg = regLabelRaw !== null;
  const regLabel = regLabelRaw ?? "REG";
  const totalLabelRaw = machine.metricsLabels?.totalLabel;
  const showTotal = totalLabelRaw !== null;
  const totalLabel = (totalLabelRaw === undefined ? "合算" : totalLabelRaw) ?? "合算";

  const suikaCzRateLabel = machine.metricsLabels?.suikaCzRateLabel ?? "スイカCZ当選率";
  const hasSuikaCzRate = machine.odds.settings.some((s) => typeof s.suikaCzRate === "number");

  const uraAtRateLabel = machine.metricsLabels?.uraAtRateLabel ?? "裏AT直行率";
  const hasUraAtRate = machine.odds.settings.some((s) => typeof s.uraAtRate === "number");

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
            <th className="px-3 py-2 border border-neutral-200">{bigLabel}</th>
            {showReg ? (
              <th className="px-3 py-2 border border-neutral-200">{regLabel}</th>
            ) : null}
            {showTotal ? (
              <th className="px-3 py-2 border border-neutral-200">{totalLabel}</th>
            ) : null}
            {hasSuikaCzRate ? (
              <th className="px-3 py-2 border border-neutral-200">{suikaCzRateLabel}</th>
            ) : null}
            {hasUraAtRate ? (
              <th className="px-3 py-2 border border-neutral-200">{uraAtRateLabel}</th>
            ) : null}
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
                {showReg ? (
                  <td className="px-3 py-2 border border-neutral-200">
                    {odds ? `1/${fmt(odds.reg)}` : "-"}
                  </td>
                ) : null}
                {showTotal ? (
                  <td className="px-3 py-2 border border-neutral-200">
                    {odds ? `1/${fmt(odds.total)}` : "-"}
                  </td>
                ) : null}
                {hasSuikaCzRate ? (
                  <td className="px-3 py-2 border border-neutral-200">
                    {odds && typeof odds.suikaCzRate === "number"
                      ? `${(odds.suikaCzRate * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                ) : null}
                {hasUraAtRate ? (
                  <td className="px-3 py-2 border border-neutral-200">
                    {odds && typeof odds.uraAtRate === "number"
                      ? `${(odds.uraAtRate * 100).toFixed(2)}%`
                      : "-"}
                  </td>
                ) : null}
                <td className="px-3 py-2 border border-neutral-200">{odds ? fmt(odds.rate) : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
