"use client";

import { useMemo, useState } from "react";

type MachineType = "juggler" | "hanahana" | "smartAT";

type Point = { x: number; y: number };

type Props = {
  slumpLine: Point[];
  spins?: number;
  defaultMachineType?: MachineType;
};

type ApiOk = {
  metrics: {
    ddMax: number;
    recoverRate: number;
    trendRecent: number;
    volatility: number;
    timeUnder0: number;
  };
  biasZ: number;
  graphConfidence: number;
  decisionHint: string;
};

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function toDecisionLabel(decisionHint: string): "続行" | "様子見" | "ヤメ" {
  if (decisionHint.includes("ヤメ")) return "ヤメ";
  if (decisionHint.includes("続行")) return "続行";
  return "様子見";
}

function fmtNum(n: number) {
  if (!Number.isFinite(n)) return "-";
  const v = Math.round(n);
  return String(v);
}

function fmtPct01(x: number) {
  if (!Number.isFinite(x)) return "-";
  return `${Math.round(x * 100)}%`;
}

export default function SlumpUploader({
  slumpLine,
  spins,
  defaultMachineType = "juggler",
}: Props) {
  const [machineType, setMachineType] = useState<MachineType>(defaultMachineType);
  const [yTop, setYTop] = useState<string>("");
  const [yBottom, setYBottom] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");

  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    decision: "続行" | "様子見" | "ヤメ";
    graphConfidence: number;
    reasons: [string, string, string];
  } | null>(null);

  const endpoints = useMemo(() => {
    const start = slumpLine[0] ?? null;
    const end = slumpLine.length > 0 ? slumpLine[slumpLine.length - 1] : null;
    return { start, end };
  }, [slumpLine]);

  const canAnalyze = useMemo(() => {
    const top = Number(yTop);
    const bottom = Number(yBottom);
    return (
      endpoints.start !== null &&
      endpoints.end !== null &&
      slumpLine.length >= 2 &&
      Number.isFinite(top) &&
      Number.isFinite(bottom) &&
      top !== bottom
    );
  }, [endpoints, slumpLine.length, yTop, yBottom]);

  async function runAnalyze() {
    setStatus("running");
    setError(null);
    setResult(null);

    const top = Number(yTop);
    const bottom = Number(yBottom);
    if (!canAnalyze) {
      setStatus("error");
      setError("slumpLineと縦軸（上限/下限）を設定してください。");
      return;
    }

    try {
      const payload = {
        machineType,
        points: {
          start: endpoints.start!,
          end: endpoints.end!,
          yMax: top,
          yMin: bottom,
        },
        slumpLine,
        ...(isFiniteNumber(spins) && spins > 0 ? { spins } : {}),
      };

      const res = await fetch("/api/slump/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as unknown;
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error?: unknown }).error ?? "")
            : "解析に失敗しました。";
        throw new Error(msg || "解析に失敗しました。");
      }

      const ok = data as Partial<ApiOk>;
      if (!ok || typeof ok !== "object") throw new Error("Invalid response");
      if (!isFiniteNumber(ok.graphConfidence)) throw new Error("Invalid response");
      if (!ok.metrics || typeof ok.metrics !== "object") throw new Error("Invalid response");
      if (typeof ok.decisionHint !== "string") throw new Error("Invalid response");

      const m = ok.metrics as ApiOk["metrics"];

      const reasons: [string, string, string] = (() => {
        if (machineType === "juggler") {
          return [
            `マイナス滞在: ${fmtPct01(m.timeUnder0)}`,
            `最大DD: ${fmtNum(m.ddMax)}枚`,
            `回復率: ${fmtPct01(m.recoverRate)}`,
          ];
        }
        if (machineType === "smartAT") {
          return [
            `ボラ: ${fmtNum(m.volatility)}`,
            `最大DD: ${fmtNum(m.ddMax)}枚`,
            `回復率: ${fmtPct01(m.recoverRate)}`,
          ];
        }
        return [
          `最大DD: ${fmtNum(m.ddMax)}枚`,
          `回復率: ${fmtPct01(m.recoverRate)}`,
          `直近傾き: ${fmtNum(m.trendRecent)}`,
        ];
      })();

      setResult({
        decision: toDecisionLabel(ok.decisionHint),
        graphConfidence: ok.graphConfidence,
        reasons,
      });
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "解析に失敗しました。");
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold">スランプ解析</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">画像（ダミー）</span>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setImageName(f?.name ?? "");
            }}
          />
          {imageName ? <p className="mt-1 text-xs text-neutral-500">{imageName}</p> : null}
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">machineType</span>
          <select
            className="mt-1 w-full rounded-md border border-neutral-200 bg-white p-2 text-sm"
            value={machineType}
            onChange={(e) => setMachineType(e.target.value as MachineType)}
          >
            <option value="juggler">juggler</option>
            <option value="hanahana">hanahana</option>
            <option value="smartAT">smartAT</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">縦軸 上限（差枚）</span>
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-md border border-neutral-200 bg-white p-2 text-sm"
            value={yTop}
            onChange={(e) => setYTop(e.target.value)}
            placeholder="例: 2000"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-neutral-600">縦軸 下限（差枚）</span>
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-md border border-neutral-200 bg-white p-2 text-sm"
            value={yBottom}
            onChange={(e) => setYBottom(e.target.value)}
            placeholder="例: -2000"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold"
          onClick={runAnalyze}
          disabled={!canAnalyze || status === "running"}
        >
          {status === "running" ? "解析中…" : "解析"}
        </button>
        <p className="text-xs text-neutral-500">
          slumpLine: {slumpLine.length}点 / spins: {isFiniteNumber(spins) ? String(spins) : "-"}
        </p>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-sm font-semibold">{result.decision}</p>
          <p className="mt-1 text-xs text-neutral-600">
            信頼度: {Math.round(result.graphConfidence * 100)}%
          </p>
          <div className="mt-2 text-xs text-neutral-700">
            <p>{result.reasons[0]}</p>
            <p>{result.reasons[1]}</p>
            <p>{result.reasons[2]}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
