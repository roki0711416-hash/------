"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { Machine } from "../content/machines";
import { getHintConfig } from "../content/hints";
import {
  calcSettingPosteriors,
  topNSettings,
  type SettingPosterior,
} from "../lib/judge";

type TapPoint = { x: number; y: number };

function fmt(n: number | undefined) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "-";
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

function fmtOneOver(games: number, count: number) {
  if (!(games > 0) || !(count > 0)) return "-";
  return `1/${fmt(games / count)}`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
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

const SLUMP_POSTERIOR_K = 0.3;
const IS_DEV = process.env.NODE_ENV !== "production";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function calcSlumpPosteriorStrength(args: {
  machineCategory: Machine["category"];
  graphBiasZ: number | null;
  graphConfidence: number | null;
}) {
  const { machineCategory, graphBiasZ, graphConfidence } = args;
  const typeFactor = machineCategory === "JUG" || machineCategory === "HANAHANA" ? 1 : 0.3;
  const strengthRaw =
    typeof graphBiasZ === "number" &&
    Number.isFinite(graphBiasZ) &&
    typeof graphConfidence === "number" &&
    Number.isFinite(graphConfidence)
      ? graphConfidence * graphBiasZ * SLUMP_POSTERIOR_K * typeFactor
      : NaN;
  const strength = Number.isFinite(strengthRaw) ? clamp(strengthRaw, -0.15, 0.15) : 0;
  return { typeFactor, strengthRaw, strength };
}

function sumPosterior(xs: SettingPosterior[] | null | undefined): number {
  if (!xs) return NaN;
  const sum = xs.reduce((acc, cur) => acc + cur.posterior, 0);
  return Number.isFinite(sum) ? sum : NaN;
}

function applySlumpCorrectionToPosteriors(args: {
  posteriors: SettingPosterior[];
  machineCategory: Machine["category"];
  graphBiasZ: number | null;
  graphConfidence: number | null;
}): SettingPosterior[] {
  const { posteriors, machineCategory, graphBiasZ, graphConfidence } = args;

  if (!posteriors || posteriors.length === 0) return posteriors;
  if (typeof graphBiasZ !== "number" || !Number.isFinite(graphBiasZ)) return posteriors;
  if (typeof graphConfidence !== "number" || !Number.isFinite(graphConfidence)) return posteriors;
  if (!(graphConfidence > 0)) return posteriors;

  // A-type (juggler/hanahana): K
  // smartAT: K*0.3 (further weakened)
  // Scalar shift strength in log-space.
  // Safety clamp: keep the effect small even when biasZ/confidence are near their max.
  const { strength } = calcSlumpPosteriorStrength({
    machineCategory,
    graphBiasZ,
    graphConfidence,
  });
  if (strength === 0) return posteriors;

  // Determine high/low settings by numeric setting number.
  const numeric = posteriors
    .map((p) => ({ p, n: settingKeyToNumber(p.s) }))
    .filter((x) => Number.isFinite(x.n) && x.p.posterior > 0);
  if (numeric.length < 2) return posteriors;

  const minN = Math.min(...numeric.map((x) => x.n));
  const maxN = Math.max(...numeric.map((x) => x.n));
  const span = maxN - minN;
  if (!(span > 0)) return posteriors;

  // Preserve hard zeros: only re-softmax over positive-probability settings.
  const activeIdxs: number[] = [];
  const scores: number[] = [];
  const deltasByIdx = new Map<number, number>();

  for (let i = 0; i < posteriors.length; i += 1) {
    const p = posteriors[i];
    if (!(p.posterior > 0) || !Number.isFinite(p.posterior)) continue;

    const n = settingKeyToNumber(p.s);
    const highness01 = Number.isFinite(n) ? (n - minN) / span : 0.5;
    const center = highness01 * 2 - 1; // low:-1 ... high:+1

    // biasZ>0: increase high-setting, decrease low-setting.
    // biasZ<0: the reverse.
    const delta = strength * center;
    deltasByIdx.set(i, delta);

    activeIdxs.push(i);
    scores.push(Math.log(p.posterior) + delta);
  }

  if (activeIdxs.length < 2) return posteriors;
  const maxScore = Math.max(...scores);
  if (!Number.isFinite(maxScore)) return posteriors;

  const weights = scores.map((s) => Math.exp(s - maxScore));
  const sum = weights.reduce((a, b) => a + b, 0);
  if (!(sum > 0) || !Number.isFinite(sum)) return posteriors;

  const out = posteriors.map((p) => ({ ...p }));
  for (let j = 0; j < activeIdxs.length; j += 1) {
    const idx = activeIdxs[j];
    out[idx].posterior = weights[j] / sum;
    const delta = deltasByIdx.get(idx) ?? 0;
    if (Number.isFinite(delta)) out[idx].logLikelihood = out[idx].logLikelihood + delta;
  }
  return out;
}

export default function MachineJudgeForm({
  machine,
  onPosteriorsChange,
}: {
  machine: Machine;
  onPosteriorsChange?: (posteriors: SettingPosterior[] | null) => void;
}) {
  const router = useRouter();
  const [judgeResultId, setJudgeResultId] = useState<string | null>(null);
  const [judgeSaveStatus, setJudgeSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const lastSavedJudgeSignatureRef = useRef<string | null>(null);

  const [games, setGames] = useState<string>("");
  const [bigCount, setBigCount] = useState<string>("0");
  const [regCount, setRegCount] = useState<string>("0");
  const [extraCount, setExtraCount] = useState<string>("0");
  const [extraCounts, setExtraCounts] = useState<Record<string, string>>({});
  const [binomialTrials, setBinomialTrials] = useState<Record<string, string>>({});
  const [binomialHits, setBinomialHits] = useState<Record<string, string>>({});
  const [suikaTrials, setSuikaTrials] = useState<string>("0");
  const [suikaCzHits, setSuikaCzHits] = useState<string>("0");
  const [uraAtTrials, setUraAtTrials] = useState<string>("0");
  const [uraAtHits, setUraAtHits] = useState<string>("0");

  const bigLabel = machine.metricsLabels?.bigLabel ?? "BIG";
  const derivedBigFromExtraIds: string[] | null = (() => {
    // Some machines don't expose a direct "BIG合算" counter on the data-counter UI.
    // When both 赤7BIG/青7BIG are available, derive BIG合算 by summing them.
    if (machine.metricsLabels?.bigLabel !== "BIG合算") return null;
    const extras = machine.metricsLabels?.extraMetrics ?? [];
    const ids = new Set(extras.map((m) => m.id));
    if (!ids.has("aka7Big") || !ids.has("ao7Big")) return null;
    return ["aka7Big", "ao7Big"];
  })();
  const showBigInput = derivedBigFromExtraIds === null;
  const bigLabelForJudge = (() => {
    if (!derivedBigFromExtraIds) return bigLabel;
    const labelById = new Map(
      (machine.metricsLabels?.extraMetrics ?? []).map((m) => [m.id, m.label] as const),
    );
    return derivedBigFromExtraIds.map((id) => labelById.get(id) ?? id).join("+");
  })();
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

  const [graphImageFile, setGraphImageFile] = useState<File | null>(null);
  const [graphImageUrl, setGraphImageUrl] = useState<string | null>(null);
  const [graphStatus, setGraphStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle",
  );
  const [graphError, setGraphError] = useState<string | null>(null);
  const [graphBiasZ, setGraphBiasZ] = useState<number | null>(null);
  const [graphConfidence, setGraphConfidence] = useState<number | null>(null);
  const [showSlumpPosteriorDebug, setShowSlumpPosteriorDebug] = useState(false);

  const [tapStep, setTapStep] = useState<"start" | "end" | "yTop" | "yBottom">("start");
  const [tapStart, setTapStart] = useState<TapPoint | null>(null);
  const [tapEnd, setTapEnd] = useState<TapPoint | null>(null);
  const [tapYTop, setTapYTop] = useState<TapPoint | null>(null);
  const [tapYBottom, setTapYBottom] = useState<TapPoint | null>(null);
  const [yTopValue, setYTopValue] = useState<string>("");
  const [yBottomValue, setYBottomValue] = useState<string>("");
  const lastObjectUrlRef = useRef<string | null>(null);

  const extraLabel =
    machine.metricsLabels?.extraLabel ??
    (machine.category === "JUG"
      ? "ブドウ"
      : machine.category === "HANAHANA"
        ? "ベル"
        : null);

  const extraMetrics = machine.metricsLabels?.extraMetrics ?? null;
  const showExtraMetrics = !!extraMetrics && extraMetrics.length > 0;

  const binomialMetrics = machine.metricsLabels?.binomialMetrics ?? null;
  const showBinomialMetrics = !!binomialMetrics && binomialMetrics.length > 0;

  const autoBinomialTrialsFromGamesMetricIds = useMemo(() => {
    const ids: string[] = [];
    if (!binomialMetrics) return ids;
    for (const m of binomialMetrics) {
      // For some metrics, trials are simply the total games already input above.
      // Example: Kabaneri common bell probability.
      if (m.trialsLabel.includes("総ゲーム数")) ids.push(m.id);
    }
    return ids;
  }, [binomialMetrics]);

  const autoBinomialTrialsFromBigRegMetricIds = useMemo(() => {
    const ids: string[] = [];
    if (!binomialMetrics) return ids;
    if (!showReg) return ids;
    for (const m of binomialMetrics) {
      // For some metrics, trials are the total bonus count (BIG+REG).
      if (
        m.trialsLabel.includes("BIG+REG") ||
        m.trialsLabel.includes("BIG回数+REG回数") ||
        m.trialsLabel.includes("ボーナス回数")
      ) {
        ids.push(m.id);
      }
    }
    return ids;
  }, [binomialMetrics, showReg]);

  useEffect(() => {
    // Avoid carrying hint inputs across machine switches.
    setHintCounts({});
    setCollapsedHintGroups({});
    setBigCount("0");
    setRegCount("0");
    setExtraCount("0");
    setSuikaTrials("0");
    setSuikaCzHits("0");
    setUraAtTrials("0");
    setUraAtHits("0");

    const nextExtraCounts: Record<string, string> = {};
    if (machine.metricsLabels?.extraMetrics) {
      for (const m of machine.metricsLabels.extraMetrics) {
        nextExtraCounts[m.id] = "0";
      }
    }
    setExtraCounts(nextExtraCounts);

    setBinomialTrials({});

    const nextBinomialHits: Record<string, string> = {};
    if (machine.metricsLabels?.binomialMetrics) {
      for (const m of machine.metricsLabels.binomialMetrics) {
        nextBinomialHits[m.id] = "0";
      }
    }
    setBinomialHits(nextBinomialHits);

    setHintMemos({});
  }, [machine.id, machine.metricsLabels?.extraMetrics, machine.metricsLabels?.binomialMetrics]);

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
    const b = showBigInput
      ? bigCount === ""
        ? Number.NaN
        : Number(bigCount)
      : (() => {
          if (!derivedBigFromExtraIds) return Number(bigCount);
          let sum = 0;
          for (const id of derivedBigFromExtraIds) {
            const raw = extraCounts[id] ?? "";
            if (raw === "") return Number.NaN;
            const n = Number(raw);
            if (!Number.isFinite(n)) return Number.NaN;
            sum += n;
          }
          return sum;
        })();
    const r = regCount === "" ? Number.NaN : Number(regCount);
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

    const parsedBinomialTrials: Record<string, number> = {};
    for (const [k, v] of Object.entries(binomialTrials)) {
      const n = Number(v);
      parsedBinomialTrials[k] = Number.isFinite(n) ? n : Number.NaN;
    }

    const parsedBinomialHits: Record<string, number> = {};
    for (const [k, v] of Object.entries(binomialHits)) {
      const n = Number(v);
      parsedBinomialHits[k] = Number.isFinite(n) ? n : Number.NaN;
    }

    // Auto-fill trials from total games for selected metrics.
    if (autoBinomialTrialsFromGamesMetricIds.length > 0) {
      const gg = Number.isFinite(g) ? g : Number.NaN;
      for (const id of autoBinomialTrialsFromGamesMetricIds) {
        parsedBinomialTrials[id] = gg;
      }
    }

    // Auto-fill trials from BIG+REG counts for selected metrics.
    if (autoBinomialTrialsFromBigRegMetricIds.length > 0) {
      const bb = Number.isFinite(b) ? b : Number.NaN;
      const rr = showReg && Number.isFinite(r) ? r : Number.NaN;
      const bonus = Number.isFinite(bb) && Number.isFinite(rr) ? bb + rr : Number.NaN;
      for (const id of autoBinomialTrialsFromBigRegMetricIds) {
        parsedBinomialTrials[id] = bonus;
      }
    }

    return {
      games: Number.isFinite(g) ? g : NaN,
      bigCount: Number.isFinite(b) ? b : NaN,
      regCount: showReg ? (Number.isFinite(r) ? r : NaN) : 0,
      extraCount: Number.isFinite(x) ? x : NaN,
      extraCounts: parsedExtraCounts,
      binomialTrials: parsedBinomialTrials,
      binomialHits: parsedBinomialHits,
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
    binomialTrials,
    binomialHits,
    autoBinomialTrialsFromGamesMetricIds,
    autoBinomialTrialsFromBigRegMetricIds,
    suikaTrials,
    suikaCzHits,
    uraAtTrials,
    uraAtHits,
    showReg,
    showBigInput,
    derivedBigFromExtraIds,
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

  function getGraphKind(): "jugg" | "hanahana" | "smart-at" {
    if (machine.category === "JUG") return "jugg";
    if (machine.category === "HANAHANA") return "hanahana";
    return "smart-at";
  }

  function resetGraphInputs() {
    setTapStep("start");
    setTapStart(null);
    setTapEnd(null);
    setTapYTop(null);
    setTapYBottom(null);
    setYTopValue("");
    setYBottomValue("");
    setGraphBiasZ(null);
    setGraphConfidence(null);
    setGraphError(null);
    setGraphStatus("idle");
  }

  function handleGraphImageClick(e: MouseEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    if (!(rect.width > 0) || !(rect.height > 0)) return;

    // Convert displayed coordinates to natural image pixels.
    const x = (e.clientX - rect.left) * (img.naturalWidth / rect.width);
    const y = (e.clientY - rect.top) * (img.naturalHeight / rect.height);
    const p: TapPoint = { x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)) };

    if (tapStep === "start") {
      setTapStart(p);
      setTapStep("end");
      return;
    }
    if (tapStep === "end") {
      setTapEnd(p);
      setTapStep("yTop");
      return;
    }
    if (tapStep === "yTop") {
      setTapYTop(p);
      setTapStep("yBottom");
      return;
    }

    setTapYBottom(p);
  }

  async function analyzeGraph() {
    if (!graphImageFile) return;
    if (!tapStart || !tapEnd || !tapYTop || !tapYBottom) {
      setGraphError("開始点/終了点/縦軸上限/縦軸下限をタップしてください。");
      return;
    }

    const top = Number(yTopValue);
    const bottom = Number(yBottomValue);
    if (!Number.isFinite(top) || !Number.isFinite(bottom) || top === bottom) {
      setGraphError("縦軸の上限/下限（差枚）を数値で入力してください。");
      return;
    }

    setGraphStatus("running");
    setGraphError(null);
    setGraphBiasZ(null);
    setGraphConfidence(null);

    try {
      const fd = new FormData();
      fd.set("image", graphImageFile);
      fd.set(
        "payload",
        JSON.stringify({
          kind: getGraphKind(),
          start: tapStart,
          end: tapEnd,
          yTop: { y: tapYTop.y, value: top },
          yBottom: { y: tapYBottom.y, value: bottom },
          ...(Number.isFinite(parsed.games) && parsed.games > 0 ? { spins: parsed.games } : {}),
        }),
      );

      const res = await fetch("/api/slump-graph/analyze", { method: "POST", body: fd });
      const data = (await res.json()) as unknown;
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error?: unknown }).error ?? "")
            : "解析に失敗しました。";
        throw new Error(msg || "解析に失敗しました。");
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("biasZ" in data) ||
        !("graphConfidence" in data)
      ) {
        throw new Error("Invalid response");
      }

      const biasZ = Number((data as { biasZ: unknown }).biasZ);
      const graphConfidence = Number((data as { graphConfidence: unknown }).graphConfidence);
      if (!Number.isFinite(biasZ) || !Number.isFinite(graphConfidence)) {
        throw new Error("Invalid response");
      }

      setGraphBiasZ(biasZ);
      setGraphConfidence(graphConfidence);
      setGraphStatus("done");
    } catch (e) {
      setGraphStatus("error");
      setGraphError(e instanceof Error ? e.message : "解析に失敗しました。");
    }
  }

  const error = useMemo(() => {
    const isBlankCount = (v: string) => v === "" || v === "0";

    if (
      games === "" &&
      isBlankCount(bigCount) &&
      (showReg ? isBlankCount(regCount) : true) &&
      isBlankCount(extraCount) &&
      Object.values(extraCounts).every((v) => isBlankCount(v)) &&
      Object.values(binomialTrials).every((v) => isBlankCount(v)) &&
      Object.values(binomialHits).every((v) => isBlankCount(v)) &&
      isBlankCount(suikaTrials) &&
      isBlankCount(suikaCzHits) &&
      isBlankCount(uraAtTrials) &&
      isBlankCount(uraAtHits)
    )
      return null;

    if (!(parsed.games > 0)) return "総ゲーム数は1以上で入力してください。";

    if (derivedBigFromExtraIds) {
      const labelById = new Map(
        (machine.metricsLabels?.extraMetrics ?? []).map((m) => [m.id, m.label] as const),
      );
      for (const id of derivedBigFromExtraIds) {
        const label = labelById.get(id) ?? id;
        const raw = extraCounts[id] ?? "";
        if (raw === "") return `${label}回数を入力してください。`;
        const n = parsed.extraCounts[id];
        if (!(n >= 0) || !Number.isInteger(n))
          return `${label}回数は0以上の整数で入力してください。`;
        if (n > parsed.games) return `${label}回数が総ゲーム数を超えています。`;
      }
    } else {
      if (bigCount !== "") {
        if (!(parsed.bigCount >= 0) || !Number.isInteger(parsed.bigCount))
          return `${bigLabel}回数は0以上の整数で入力してください。`;
      }
    }

    if (showReg) {
      if (regCount !== "") {
        if (!(parsed.regCount >= 0) || !Number.isInteger(parsed.regCount))
          return `${regLabel}回数は0以上の整数で入力してください。`;
      }
      if (bigCount !== "" && regCount !== "") {
        if (parsed.bigCount + parsed.regCount > parsed.games)
          return `${bigLabelForJudge}回数 + ${regLabel}回数 が総ゲーム数を超えています。`;
      }
    } else {
      if (bigCount !== "") {
        if (parsed.bigCount > parsed.games)
          return `${bigLabelForJudge}回数が総ゲーム数を超えています。`;
      }
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

    if (showBinomialMetrics && binomialMetrics) {
      for (const m of binomialMetrics) {
        const isAutoTrialsFromGames = autoBinomialTrialsFromGamesMetricIds.includes(m.id);
        const isAutoTrialsFromBigReg = autoBinomialTrialsFromBigRegMetricIds.includes(m.id);
        const tRaw = binomialTrials[m.id] ?? "";
        const hRaw = binomialHits[m.id] ?? "";

        if (isAutoTrialsFromGames) {
          if (hRaw === "") continue;
          if (!(parsed.games >= 0) || !Number.isInteger(parsed.games))
            return `${m.trialsLabel}は総ゲーム数から自動入力されます。総ゲーム数を0以上の整数で入力してください。`;
        } else if (isAutoTrialsFromBigReg) {
          if (hRaw === "") continue;
          if (!(parsed.bigCount >= 0) || !Number.isInteger(parsed.bigCount))
            return `${m.trialsLabel}はBIG/REG回数から自動入力されます。${bigLabelForJudge}回数を0以上の整数で入力してください。`;
          if (!(parsed.regCount >= 0) || !Number.isInteger(parsed.regCount))
            return `${m.trialsLabel}はBIG/REG回数から自動入力されます。${regLabel}回数を0以上の整数で入力してください。`;
        } else {
          if (tRaw === "" && hRaw === "") continue;
          if (tRaw === "" || hRaw === "")
            return `${m.trialsLabel}と${m.hitsLabel}は両方入力してください。`;
        }

        const t = parsed.binomialTrials[m.id];
        const h = parsed.binomialHits[m.id];
        if (!(t >= 0) || !Number.isInteger(t))
          return `${m.trialsLabel}は0以上の整数で入力してください。`;
        if (!(h >= 0) || !Number.isInteger(h))
          return `${m.hitsLabel}は0以上の整数で入力してください。`;
        if (h > t) return `${m.hitsLabel}が${m.trialsLabel}を超えています。`;
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
    binomialTrials,
    binomialHits,
    autoBinomialTrialsFromGamesMetricIds,
    autoBinomialTrialsFromBigRegMetricIds,
    suikaTrials,
    suikaCzHits,
    uraAtTrials,
    uraAtHits,
    extraLabel,
    extraMetrics,
    showExtraMetrics,
    binomialMetrics,
    showBinomialMetrics,
    bigLabel,
    bigLabelForJudge,
    regLabel,
    showReg,
    derivedBigFromExtraIds,
    machine.metricsLabels?.extraMetrics,
    suikaTrialsLabel,
    suikaCzHitsLabel,
    uraAtTrialsLabel,
    uraAtHitsLabel,
  ]);

  const posteriorCalc = useMemo(() => {
    if (error) return null;

    const applySlump = (xs: SettingPosterior[]) =>
      applySlumpCorrectionToPosteriors({
        posteriors: xs,
        machineCategory: machine.category,
        graphBiasZ,
        graphConfidence,
      });

    const withSlumpDebug = (preCorrection: SettingPosterior[], note: string | null) => {
      const postCorrection = applySlump(preCorrection);
      return {
        posteriors: postCorrection,
        note,
        debug: IS_DEV
          ? {
              before: preCorrection,
              after: postCorrection,
            }
          : null,
      };
    };

    const isBlankCount = (v: string) => v === "" || v === "0";
    const hasAnyExtraMetricsInput = Object.values(extraCounts).some((v) => !isBlankCount(v));
    const hasAnyBinomialInput =
      Object.values(binomialTrials).some((v) => !isBlankCount(v)) ||
      Object.values(binomialHits).some((v) => !isBlankCount(v));
    if (
      games === "" &&
      (showBigInput ? isBlankCount(bigCount) : true) &&
      (showReg ? isBlankCount(regCount) : true) &&
      isBlankCount(extraCount) &&
      !hasAnyExtraMetricsInput &&
      !hasAnyBinomialInput &&
      isBlankCount(suikaTrials) &&
      isBlankCount(suikaCzHits) &&
      isBlankCount(uraAtTrials) &&
      isBlankCount(uraAtHits)
    )
      return null;

    const extraCountsForJudge: Record<string, number> | undefined = (() => {
      if (!showExtraMetrics || !extraMetrics) return undefined;
      const out: Record<string, number> = {};
      for (const m of extraMetrics) {
        const raw = extraCounts[m.id] ?? "";
        if (raw === "" || raw === "0") continue;
        const n = parsed.extraCounts[m.id];
        if (!Number.isFinite(n)) continue;
        out[m.id] = n;
      }
      return Object.keys(out).length > 0 ? out : undefined;
    })();

    const binomialTrialsForJudge: Record<string, number> | undefined = (() => {
      if (!showBinomialMetrics || !binomialMetrics) return undefined;
      const out: Record<string, number> = {};
      for (const m of binomialMetrics) {
        const hitsRaw = binomialHits[m.id] ?? "";
        if (hitsRaw === "" || hitsRaw === "0") continue;

        const isAutoTrialsFromGames = autoBinomialTrialsFromGamesMetricIds.includes(m.id);
        const isAutoTrialsFromBigReg = autoBinomialTrialsFromBigRegMetricIds.includes(m.id);
        if (isAutoTrialsFromGames) {
          const n = parsed.games;
          if (!Number.isFinite(n)) continue;
          out[m.id] = n;
          continue;
        }

        if (isAutoTrialsFromBigReg) {
          const b = parsed.bigCount;
          const r = parsed.regCount;
          if (!Number.isFinite(b) || !Number.isFinite(r)) continue;
          out[m.id] = b + r;
          continue;
        }

        const raw = binomialTrials[m.id] ?? "";
        if (raw === "" || raw === "0") continue;
        const n = parsed.binomialTrials[m.id];
        if (!Number.isFinite(n)) continue;
        out[m.id] = n;
      }
      return Object.keys(out).length > 0 ? out : undefined;
    })();

    const binomialHitsForJudge: Record<string, number> | undefined = (() => {
      if (!showBinomialMetrics || !binomialMetrics) return undefined;
      const out: Record<string, number> = {};
      for (const m of binomialMetrics) {
        const raw = binomialHits[m.id] ?? "";
        if (raw === "" || raw === "0") continue;
        const n = parsed.binomialHits[m.id];
        if (!Number.isFinite(n)) continue;
        out[m.id] = n;
      }
      return Object.keys(out).length > 0 ? out : undefined;
    })();

    const base = calcSettingPosteriors(machine.odds.settings, {
      games: parsed.games,
      bigCount: derivedBigFromExtraIds
        ? parsed.bigCount
        : showBigInput && bigCount === ""
          ? undefined
          : parsed.bigCount,
      regCount: showReg ? (regCount === "" ? undefined : parsed.regCount) : undefined,
      extraCount: extraCount === "" ? undefined : parsed.extraCount,
      extraCounts: extraCountsForJudge,
      binomialTrials: binomialTrialsForJudge,
      binomialHits: binomialHitsForJudge,
      suikaTrials: suikaTrials === "" ? undefined : parsed.suikaTrials,
      suikaCzHits: suikaCzHits === "" ? undefined : parsed.suikaCzHits,
      uraAtTrials: uraAtTrials === "" ? undefined : parsed.uraAtTrials,
      uraAtHits: uraAtHits === "" ? undefined : parsed.uraAtHits,
    });

    if (!hintConfig) return withSlumpDebug(base, null);

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

    if (!hasConstraint && !hasWeight) return withSlumpDebug(base, null);
    if (contradiction) {
      return withSlumpDebug(
        base,
        "示唆入力が矛盾している可能性があるため、示唆を無視して計算しました。",
      );
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
      return withSlumpDebug(
        base,
        "示唆入力が矛盾している可能性があるため、示唆を無視して計算しました。",
      );
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
      return withSlumpDebug(
        base,
        "示唆入力が矛盾している可能性があるため、示唆を無視して計算しました。",
      );
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
    return withSlumpDebug(normalized, note);
  }, [
    machine.odds.settings,
    parsed,
    error,
    games,
    bigCount,
    regCount,
    extraCount,
    extraCounts,
    binomialTrials,
    binomialHits,
    autoBinomialTrialsFromGamesMetricIds,
    autoBinomialTrialsFromBigRegMetricIds,
    suikaTrials,
    suikaCzHits,
    uraAtTrials,
    uraAtHits,
    showReg,
    hintConfig,
    hintCounts,
    extraMetrics,
    showExtraMetrics,
    binomialMetrics,
    showBinomialMetrics,
    showBigInput,
    derivedBigFromExtraIds,
    graphBiasZ,
    graphConfidence,
    machine.category,
  ]);

  const posteriors = posteriorCalc?.posteriors ?? null;
  const posteriorNote = posteriorCalc?.note ?? null;
  const posteriorDebug = posteriorCalc?.debug ?? null;

  const slumpStrength = useMemo(() => {
    return calcSlumpPosteriorStrength({
      machineCategory: machine.category,
      graphBiasZ,
      graphConfidence,
    });
  }, [machine.category, graphBiasZ, graphConfidence]);

  const slumpDebugRows = useMemo(() => {
    if (!posteriorDebug) return null;
    const beforeByKey = new Map<string, number>();
    const afterByKey = new Map<string, number>();
    for (const p of posteriorDebug.before) beforeByKey.set(String(p.s), p.posterior);
    for (const p of posteriorDebug.after) afterByKey.set(String(p.s), p.posterior);
    const keys = Array.from(new Set([...beforeByKey.keys(), ...afterByKey.keys()]));
    keys.sort((aKey, bKey) => {
      const aNum = Number(aKey);
      const bNum = Number(bKey);
      const aIsNum = Number.isFinite(aNum);
      const bIsNum = Number.isFinite(bNum);
      if (aIsNum && bIsNum) return aNum - bNum;
      if (aIsNum) return -1;
      if (bIsNum) return 1;
      return aKey.localeCompare(bKey);
    });

    const rows = keys.map((k) => {
      const before = beforeByKey.get(k) ?? 0;
      const after = afterByKey.get(k) ?? 0;
      return { s: k, before, after, delta: after - before };
    });
    const revived = rows.filter((r) => r.before === 0 && r.after > 0).length;
    const killed = rows.filter((r) => r.before > 0 && r.after === 0).length;
    const zerosBefore = rows.filter((r) => r.before === 0).length;
    const zerosAfter = rows.filter((r) => r.after === 0).length;
    return {
      rows,
      revived,
      killed,
      zerosBefore,
      zerosAfter,
      sumBefore: sumPosterior(posteriorDebug.before),
      sumAfter: sumPosterior(posteriorDebug.after),
    };
  }, [posteriorDebug]);

  useEffect(() => {
    onPosteriorsChange?.(posteriors);
  }, [onPosteriorsChange, posteriors]);

  const top3 = useMemo(() => {
    if (!posteriors) return null;
    return topNSettings(posteriors, 3);
  }, [posteriors]);

  const judgeSaveSignature = useMemo(() => {
    if (!top3) return null;
    // 判別入力/結果が同一なら二重保存しないための署名
    // JSON.stringify の安定性に依存（この用途では十分）
    return JSON.stringify({ machineId: machine.id, parsed, top3 });
  }, [machine.id, parsed, top3]);

  useEffect(() => {
    if (!top3 || !judgeSaveSignature) {
      setJudgeResultId(null);
      setJudgeSaveStatus("idle");
      lastSavedJudgeSignatureRef.current = null;
      return;
    }

    if (lastSavedJudgeSignatureRef.current === judgeSaveSignature) return;

    let cancelled = false;

    void (async () => {
      try {
        setJudgeSaveStatus("saving");

        const res = await fetch("/api/judge-results", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            machineType: machine.id,
            input: {
              machineId: machine.id,
              machineName: machine.name,
              parsed,
            },
            result: { top3 },
          }),
        });

        const json = (await res.json()) as { ok: boolean; id?: string };
        if (!res.ok || !json.ok || !json.id) throw new Error("failed");

        if (cancelled) return;
        lastSavedJudgeSignatureRef.current = judgeSaveSignature;
        setJudgeResultId(json.id);
        setJudgeSaveStatus("saved");
      } catch {
        if (cancelled) return;
        setJudgeSaveStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [judgeSaveSignature, machine.id, machine.name, parsed, top3]);

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
        総ゲーム数 / {bigLabelForJudge}
        {showReg ? ` / ${regLabel}` : ""}
        を入力すると、近い設定TOP3を表示します。
      </p>

      {IS_DEV ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-semibold">スランプグラフ画像から補正</p>
          <p className="mt-1 text-xs text-neutral-500">
            画像から「上振れ/下振れ」の補正値を算出します（設定断定には使いません）。
            MVPでは自動認識は行わず、開始点/終了点/縦軸上限/縦軸下限のタップ補助が前提です。
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
                  setGraphImageFile(f);
                  setGraphImageUrl(url);
                  resetGraphInputs();
                }}
              />
            </label>

            {graphImageUrl ? (
              <div className="rounded-lg border border-neutral-200 bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={graphImageUrl}
                  alt="スランプグラフ画像"
                  className="h-28 w-full cursor-crosshair rounded-md object-contain"
                  onClick={handleGraphImageClick}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 bg-white p-3">
              <p className="text-xs font-semibold text-neutral-600">タップ補助</p>
              <p className="mt-1 text-xs text-neutral-500">
                画像をタップして順に指定：
                開始点 → 終了点 → 縦軸上限位置 → 縦軸下限位置
              </p>
              <p className="mt-2 text-xs text-neutral-700">
                次にタップ：
                <span className="font-semibold">
                  {tapStep === "start"
                    ? "開始点"
                    : tapStep === "end"
                      ? "終了点"
                      : tapStep === "yTop"
                        ? "縦軸上限"
                        : "縦軸下限"}
                </span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-600">
                <span>開始: {tapStart ? `(${tapStart.x},${tapStart.y})` : "-"}</span>
                <span>終了: {tapEnd ? `(${tapEnd.x},${tapEnd.y})` : "-"}</span>
                <span>上限: {tapYTop ? `y=${tapYTop.y}` : "-"}</span>
                <span>下限: {tapYBottom ? `y=${tapYBottom.y}` : "-"}</span>
              </div>
              <button
                type="button"
                onClick={resetGraphInputs}
                className="mt-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium"
              >
                指定をリセット
              </button>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-3">
              <p className="text-xs font-semibold text-neutral-600">縦軸（差枚）</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs text-neutral-500">上限</span>
                  <input
                    inputMode="numeric"
                    value={yTopValue}
                    onChange={(e) => setYTopValue(e.target.value)}
                    placeholder="例: 3000"
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-neutral-500">下限</span>
                  <input
                    inputMode="numeric"
                    value={yBottomValue}
                    onChange={(e) => setYBottomValue(e.target.value)}
                    placeholder="例: -3000"
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={analyzeGraph}
              disabled={!graphImageUrl || graphStatus === "running"}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              {graphStatus === "running" ? "解析中…" : "解析する"}
            </button>

            {graphBiasZ !== null && graphConfidence !== null ? (
              <p className="text-xs text-neutral-600">
                解析結果：biasZ {graphBiasZ.toFixed(2)} / confidence {graphConfidence.toFixed(2)}
              </p>
            ) : null}
          </div>

          {graphError ? (
            <p className="mt-2 text-sm font-medium text-red-600">{graphError}</p>
          ) : null}
        </div>
      ) : null}

      <form
        className={`mt-4 grid gap-3 ${
          extraLabel ||
          showExtraMetrics ||
          showBinomialMetrics ||
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

        {showBigInput ? (
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
        ) : null}

        {showReg ? (
          <CountField
            label={regLabel}
            value={regCount}
            onChange={setRegCount}
            placeholder="例: 8"
            onStep={(delta) => {
              const g = parsed.games;
              const current = toIntOrZero(regCount);
              const big = showBigInput
                ? toIntOrZero(bigCount)
                : Number.isFinite(parsed.bigCount)
                  ? Math.max(0, Math.trunc(parsed.bigCount))
                  : 0;
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
                value={extraCounts[m.id] ?? "0"}
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
                  const current = toIntOrZero(extraCounts[m.id] ?? "0");
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

        {showBinomialMetrics && binomialMetrics
          ? binomialMetrics.flatMap((m) => {
              const isAutoTrialsFromGames = autoBinomialTrialsFromGamesMetricIds.includes(m.id);
              const isAutoTrialsFromBigReg = autoBinomialTrialsFromBigRegMetricIds.includes(m.id);
              const isAutoTrials = isAutoTrialsFromGames || isAutoTrialsFromBigReg;

              const trialsCap = (() => {
                if (isAutoTrialsFromGames) {
                  return Number.isFinite(parsed.games) && parsed.games >= 0
                    ? Math.max(0, Math.trunc(parsed.games))
                    : Number.POSITIVE_INFINITY;
                }
                if (isAutoTrialsFromBigReg) {
                  const b = parsed.bigCount;
                  const r = parsed.regCount;
                  const t = Number.isFinite(b) && Number.isFinite(r) ? b + r : NaN;
                  return Number.isFinite(t) && t >= 0
                    ? Math.max(0, Math.trunc(t))
                    : Number.POSITIVE_INFINITY;
                }
                return Number.POSITIVE_INFINITY;
              })();

              if (isAutoTrials) {
                return [
                  <CountField
                    key={`${m.id}:hits`}
                    label={m.hitsLabel}
                    value={binomialHits[m.id] ?? "0"}
                    onChange={(next) => {
                      const n = Number(next);
                      const capped =
                        next === "" || !Number.isFinite(n)
                          ? next
                          : String(Math.min(Math.max(0, Math.trunc(n)), trialsCap));
                      setBinomialHits((prev) => ({
                        ...prev,
                        [m.id]: capped,
                      }));
                    }}
                    placeholder="例: 1"
                    onStep={(delta) => {
                      const current = toIntOrZero(binomialHits[m.id] ?? "0");
                      const next = Math.min(Math.max(current + delta, 0), trialsCap);
                      setBinomialHits((prev) => ({
                        ...prev,
                        [m.id]: String(next),
                      }));
                    }}
                  />,
                ];
              }

              return [
                <CountField
                  key={`${m.id}:trials`}
                  label={m.trialsLabel}
                  value={binomialTrials[m.id] ?? ""}
                  onChange={(next) =>
                    setBinomialTrials((prev) => ({
                      ...prev,
                      [m.id]: next,
                    }))
                  }
                  placeholder="例: 20"
                  showStep5
                  onStep={(delta) => {
                    const current = toIntOrZero(binomialTrials[m.id] ?? "");
                    const next = Math.max(0, current + delta);
                    const hits = toIntOrZero(binomialHits[m.id] ?? "");
                    const cappedHits = Math.min(hits, next);
                    setBinomialTrials((prev) => ({
                      ...prev,
                      [m.id]: String(next),
                    }));
                    if (cappedHits !== hits) {
                      setBinomialHits((prev) => ({
                        ...prev,
                        [m.id]: String(cappedHits),
                      }));
                    }
                  }}
                />,
                <CountField
                  key={`${m.id}:hits`}
                  label={m.hitsLabel}
                  value={binomialHits[m.id] ?? "0"}
                  onChange={(next) =>
                    setBinomialHits((prev) => ({
                      ...prev,
                      [m.id]: next,
                    }))
                  }
                  placeholder="例: 1"
                  onStep={(delta) => {
                    const trials = toIntOrZero(binomialTrials[m.id] ?? "");
                    const current = toIntOrZero(binomialHits[m.id] ?? "0");
                    const next = Math.min(Math.max(current + delta, 0), trials);
                    setBinomialHits((prev) => ({
                      ...prev,
                      [m.id]: String(next),
                    }));
                  }}
                />,
              ];
            })
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
              反映される示唆（設定◯以上/確定系）は、総G/{bigLabelForJudge}
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
                  : true;

              const maxBase =
                null;

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
                      合計({total})が回数制限({maxBase})を超えています。
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

      {!error && parsed.games > 0 ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-semibold">実測確率</p>
            <div
              className={`mt-2 grid gap-2 text-sm text-neutral-700 ${
                (() => {
                  const showSuika =
                    !!suikaTrialsLabel &&
                    !!suikaCzHitsLabel &&
                    suikaTrials !== "" &&
                    suikaTrials !== "0";
                  const showUraAt =
                    !!uraAtTrialsLabel &&
                    !!uraAtHitsLabel &&
                    uraAtTrials !== "" &&
                    uraAtTrials !== "0";
                  const shownBinomialCount =
                    showBinomialMetrics && binomialMetrics
                      ? binomialMetrics.filter((m) => {
                          const raw = binomialHits[m.id] ?? "";
                          return raw !== "" && raw !== "0";
                        }).length
                      : 0;
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
                    extraCols +
                    shownBinomialCount;
                  if (cols <= 2) return "grid-cols-2";
                  if (cols === 3) return "grid-cols-3";
                  if (cols === 4) return "grid-cols-2 sm:grid-cols-4";
                  return "grid-cols-2 sm:grid-cols-5";
                })()
              }`}
            >
              <div>
                <p className="text-xs text-neutral-500">{bigLabelForJudge}</p>
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

              {suikaTrialsLabel &&
              suikaCzHitsLabel &&
              suikaTrials !== "" &&
              suikaTrials !== "0" ? (
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

              {uraAtTrialsLabel &&
              uraAtHitsLabel &&
              uraAtTrials !== "" &&
              uraAtTrials !== "0" ? (
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

              {showBinomialMetrics && binomialMetrics
                ? binomialMetrics
                    .filter((m) => {
                      const raw = binomialHits[m.id] ?? "";
                      return raw !== "" && raw !== "0";
                    })
                    .map((m) => (
                      <div key={m.id}>
                        <p className="text-xs text-neutral-500">{m.rateLabel ?? m.id}</p>
                        <p className="font-semibold">
                          {(() => {
                            const t = parsed.binomialTrials[m.id];
                            const h = parsed.binomialHits[m.id];
                            return fmtOneOver(t, h);
                          })()}
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

              <div className="mt-3">
                <button
                  type="button"
                  disabled={!judgeResultId || judgeSaveStatus === "saving"}
                  aria-disabled={!judgeResultId || judgeSaveStatus === "saving"}
                  className={
                    "inline-block rounded-xl bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white " +
                    (!judgeResultId || judgeSaveStatus === "saving" ? "opacity-60" : "")
                  }
                  onClick={async () => {
                    if (!judgeResultId) return;

                    const gamesValue = Number.isFinite(parsed.games)
                      ? String(Math.max(0, Math.trunc(parsed.games)))
                      : "0";
                    const sp = new URLSearchParams({
                      date: toISODate(new Date()),
                      machineName: machine.name,
                      games: gamesValue,
                      judgeResultId,
                    });
                    router.push(`/record?${sp.toString()}`);
                  }}
                >
                  {judgeSaveStatus === "saving"
                    ? "判別結果を保存中…"
                    : judgeResultId
                          ? "この実戦を収支に登録"
                      : "判別結果を保存できません"}
                </button>

                {judgeSaveStatus === "error" ? (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    うまく登録できませんでした。時間をおいて再度お試しください。
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {IS_DEV && slumpDebugRows ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">DEV: スランプ補正の影響確認</p>
                <button
                  type="button"
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setShowSlumpPosteriorDebug((v) => !v)}
                >
                  {showSlumpPosteriorDebug ? "閉じる" : "開く"}
                </button>
              </div>

              {showSlumpPosteriorDebug ? (
                <>
                  <p className="mt-1 text-xs text-neutral-500">
                    biasZ={fmtSigned(graphBiasZ ?? NaN)} / conf={fmt(graphConfidence ?? NaN)} / 
                    typeFactor={fmt(slumpStrength.typeFactor)} / strengthRaw={fmtSigned(
                      slumpStrength.strengthRaw,
                    )} / strength={fmtSigned(slumpStrength.strength)}
                  </p>

                  <div className="mt-2 grid gap-2 text-xs text-neutral-700 sm:grid-cols-2">
                    <div>
                      合計：補正前 {fmt(slumpDebugRows.sumBefore)} / 補正後 {fmt(slumpDebugRows.sumAfter)}
                    </div>
                    <div>
                      hard zero：前 {slumpDebugRows.zerosBefore} / 後 {slumpDebugRows.zerosAfter}（0→&gt;0:
                      {slumpDebugRows.revived} / &gt;0→0: {slumpDebugRows.killed}）
                    </div>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-xs">
                      <thead>
                        <tr className="text-left text-neutral-600">
                          <th className="px-3 py-2 border border-neutral-200">設定</th>
                          <th className="px-3 py-2 border border-neutral-200">補正前</th>
                          <th className="px-3 py-2 border border-neutral-200">補正後</th>
                          <th className="px-3 py-2 border border-neutral-200">差分(pp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slumpDebugRows.rows.map((r) => (
                          <tr key={r.s} className="text-neutral-800">
                            <td className="px-3 py-2 font-semibold border border-neutral-200">
                              {r.s}
                            </td>
                            <td className="px-3 py-2 border border-neutral-200">
                              {fmtPct(r.before)}
                            </td>
                            <td className="px-3 py-2 border border-neutral-200">
                              {fmtPct(r.after)}
                            </td>
                            <td className="px-3 py-2 border border-neutral-200">
                              {fmtSigned(r.delta * 100)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
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
  const bigLabelForJudge = (() => {
    if (machine.metricsLabels?.bigLabel !== "BIG合算") return bigLabel;
    const extras = machine.metricsLabels?.extraMetrics ?? [];
    const ids = new Set(extras.map((m) => m.id));
    if (!ids.has("aka7Big") || !ids.has("ao7Big")) return bigLabel;
    const labelById = new Map(extras.map((m) => [m.id, m.label] as const));
    return ["aka7Big", "ao7Big"].map((id) => labelById.get(id) ?? id).join("+");
  })();
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
            <th className="px-3 py-2 border border-neutral-200">{bigLabelForJudge}</th>
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
